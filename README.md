# ASEP AIDS (Automated Smart Environmental Protection - Agricultural Irrigation and Data System)

## Project Overview
ASEP AIDS is an intelligent automated irrigation system designed to optimize agricultural water usage through smart monitoring and control. The system leverages ESP32 microcontroller technology, precision moisture sensors, and automated pump control to maintain ideal soil conditions for plant growth.

## Key Features
- Real-time soil moisture monitoring
- Automated irrigation control based on moisture thresholds
- Web-based dashboard for remote monitoring and control
- Historical data tracking and visualization
- Energy-efficient operation
- Mobile-responsive interface
- Alert system for critical conditions

## Technical Architecture

### Hardware Components
- ESP32 Development Board
- Capacitive Soil Moisture Sensor
- 5V Relay Module
- Submersible Water Pump
- 12V Power Supply
- Jumper Wires and Connectors

### Software Stack
- ESP32 Firmware (Arduino)
- Node.js Backend Server
- Web Dashboard (HTML/CSS/JavaScript)
- SQLite Database for data storage

## Setup Instructions

### Hardware Setup
1. Connect components according to the following pin configuration:
   - Soil Moisture Sensor → GPIO34 (ADC)
   - Relay Module → GPIO26
   - Power connections as per specifications

### ESP32 Configuration
1. Install Arduino IDE
2. Add ESP32 board support:
   - File → Preferences → Additional Board Manager URLs
   - Add: `https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json`
3. Required Libraries:
   - WiFi
   - HTTPClient
   - ArduinoJson
4. Update WiFi credentials in `config.h`
5. Flash the firmware

### Server Setup
1. Prerequisites:
   - Node.js (v14 or higher)
   - npm (v6 or higher)
2. Installation:
   ```bash
   npm install
   npm run setup
   npm start
   ```

## Usage Guide

### Web Interface
Access the dashboard at `http://[server-ip]:3000`
Features available:
- Real-time moisture readings
- Pump status monitoring
- Manual override controls
- Historical data graphs
- System settings configuration

### Maintenance
- Regular sensor calibration recommended
- Check moisture sensor probes monthly
- Clean water filters as needed
- Update firmware when new versions are available

## Troubleshooting
- Check power connections if system is unresponsive
- Verify WiFi connectivity for data transmission issues
- Calibrate sensors if readings seem incorrect
- Contact support for persistent issues

## Contributing
Contributions are welcome! Please read our contributing guidelines before submitting pull requests.

## License
MIT License - See LICENSE file for details

## Support
For technical support or queries:
- Create an issue in the GitHub repository
- Contact the development team

Last Updated: January 20, 2025
