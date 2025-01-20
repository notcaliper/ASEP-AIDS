const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const WebSocket = require('ws');

const app = express();
const port = 3000;

// WebSocket server
const wss = new WebSocket.Server({ port: 8080 });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Store current pump state
let currentPumpState = {
    manualControl: false,
    pumpStatus: false
};

// Database setup
const db = new sqlite3.Database('asep.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the ASEP database.');
});

// Create tables
db.run(`CREATE TABLE IF NOT EXISTS sensor_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    moisture INTEGER NOT NULL,
    pump_status INTEGER NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

// Broadcast to all connected clients
function broadcast(data) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

// WebSocket connection handler
wss.on('connection', (ws) => {
    console.log('New client connected');
    
    // Send latest data on connection
    db.get(`SELECT * FROM sensor_data ORDER BY timestamp DESC LIMIT 1`, (err, row) => {
        if (!err && row) {
            ws.send(JSON.stringify({
                ...row,
                manualControl: currentPumpState.manualControl,
                pumpStatus: currentPumpState.pumpStatus
            }));
        }
    });

    // Handle incoming messages from dashboard
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            if (data.type === 'pump_control') {
                currentPumpState = {
                    manualControl: data.manualControl,
                    pumpStatus: data.pumpStatus
                };
                broadcast({
                    type: 'pump_state_update',
                    ...currentPumpState
                });
            }
        } catch (error) {
            console.error('Error processing WebSocket message:', error);
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

// API Endpoints

// Get current pump control status
app.get('/api/pump-status', (req, res) => {
    res.json(currentPumpState);
});

// Update pump control status from dashboard
app.post('/api/pump-status', (req, res) => {
    const { manualControl, pumpStatus } = req.body;
    
    currentPumpState = {
        manualControl,
        pumpStatus
    };
    
    // Broadcast the update to all clients
    broadcast({
        type: 'pump_state_update',
        ...currentPumpState
    });
    
    res.json({
        message: "Pump status updated successfully",
        ...currentPumpState
    });
});

// Receive sensor data from ESP32
app.post('/api/sensor-data', (req, res) => {
    const { moisture, pumpStatus, manualControl } = req.body;
    
    db.run(`INSERT INTO sensor_data (moisture, pump_status) VALUES (?, ?)`,
        [moisture, pumpStatus],
        function(err) {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: err.message });
            }
            
            const data = {
                id: this.lastID,
                moisture,
                pumpStatus,
                manualControl,
                timestamp: new Date().toISOString()
            };
            
            // Broadcast new data to all connected clients
            broadcast(data);
            
            res.json({
                message: "Data saved successfully",
                id: this.lastID
            });
        });
});

// Get latest sensor reading
app.get('/api/latest-data', (req, res) => {
    db.get(`SELECT * FROM sensor_data ORDER BY timestamp DESC LIMIT 1`, (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({
            ...row,
            manualControl: currentPumpState.manualControl,
            pumpStatus: currentPumpState.pumpStatus
        });
    });
});

// Get historical data
app.get('/api/historical-data', (req, res) => {
    const hours = req.query.hours || 24; // Default to last 24 hours
    db.all(
        `SELECT * FROM sensor_data 
         WHERE timestamp >= datetime('now', '-' || ? || ' hours')
         ORDER BY timestamp DESC`,
        [hours],
        (err, rows) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json(rows);
        }
    );
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log(`WebSocket server running at ws://localhost:8080`);
});
