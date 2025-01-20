# ASEP AIDS (Automated Smart Environmental Protection - Agricultural Irrigation and Data System)

## Project Overview
ASEP AIDS is an automated irrigation system that uses ESP32 microcontroller, moisture sensors, and a relay-controlled pump to maintain optimal soil moisture levels. The system includes a web interface for monitoring and control.

## Setup Instructions

### Hardware Requirements
- ESP32 Development Board
- Soil Moisture Sensor
- Relay Module
- Water Pump
- Power Supply
- Connecting Wires

### ESP32 Setup
1. Install Arduino IDE
2. Add ESP32 board support to Arduino IDE
3. Install required libraries:
   - WiFi
   - HTTPClient
   - ArduinoJson
4. Connect the hardware:
   - Moisture Sensor to GPIO34 (ADC)
   - Relay Module to GPIO26
5. Update WiFi credentials in the code
6. Upload the code to ESP32

### Server Setup
1. Install Node.js and npm
2. Install required dependencies
3. Configure database settings
4. Run the server

### Web Interface
The web interface provides:
- Real-time moisture level monitoring
- Pump status indication
- Historical data visualization
- Manual pump control

## Configuration
1. Update `asep_esp32.ino` with your WiFi credentials
2. Adjust `MOISTURE_THRESHOLD` based on your sensor calibration
3. Update server URL in ESP32 code

## License
MIT License
