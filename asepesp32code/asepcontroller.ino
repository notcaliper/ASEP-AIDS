#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

// WiFi credentials
const char* ssid = "Galaxy_5";
const char* password = "lolcat727";

// Server details
const char* serverUrl = "http://192.168.61.187:3000/api/sensor-data";
const char* controlUrl = "http://192.168.61.187:3000/api/pump-status";

// Pin configurations
const int MOISTURE_SENSOR_PIN = 34;  // Analog pin for moisture sensor
const int RELAY_PIN = 26;            // Digital pin for relay control
const int MOISTURE_THRESHOLD = 3200;  // When moisture reading > 3200 (drier), pump turns on

// LCD Configuration
LiquidCrystal_I2C lcd(0x27, 16, 2);  // Set the LCD address to 0x27 for a 16 chars and 2 line display

// Timing variables
unsigned long lastTime = 0;
const unsigned long timerDelay = 5000;  // Send data every 5 seconds
unsigned long lastLCDUpdate = 0;
const unsigned long lcdUpdateDelay = 1000;  // Update LCD every second
unsigned long lastControlCheck = 0;
const unsigned long controlCheckDelay = 1000;  // Check control status every second

// Control variables
bool manualControl = false;
bool pumpStatus = false;

void setup() {
  Serial.begin(115200);
  
  // Initialize LCD
  Wire.begin();
  lcd.init();
  lcd.backlight();
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("ASEP AIDS System");
  lcd.setCursor(0, 1);
  lcd.print("Initializing...");
  
  // Initialize pins
  pinMode(MOISTURE_SENSOR_PIN, INPUT);
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, LOW);  // Start with pump off
  
  // Connect to WiFi
  WiFi.begin(ssid, password);
  Serial.println("Connecting to WiFi");
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Connecting WiFi");
  
  int dots = 0;
  while(WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
    lcd.setCursor(dots % 13, 1);
    lcd.print(".");
    dots++;
    if(dots > 12) {
      lcd.setCursor(0, 1);
      lcd.print("            ");
      dots = 0;
    }
  }
  
  Serial.println("");
  Serial.println("Connected to WiFi network");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());
  
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("WiFi Connected");
  lcd.setCursor(0, 1);
  lcd.print(WiFi.localIP());
  delay(2000);
}

void checkPumpControl() {
  if(WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(controlUrl);
    
    int httpCode = http.GET();
    Serial.print("Checking pump control, HTTP code: ");
    Serial.println(httpCode);
    
    if(httpCode > 0) {
      String payload = http.getString();
      Serial.print("Received control data: ");
      Serial.println(payload);
      
      StaticJsonDocument<200> doc;
      DeserializationError error = deserializeJson(doc, payload);
      
      if(!error) {
        bool newManualControl = doc["manualControl"] | false;
        bool newPumpStatus = doc["pumpStatus"] | false;
        
        if(newManualControl != manualControl || newPumpStatus != pumpStatus) {
          manualControl = newManualControl;
          if(manualControl) {
            pumpStatus = newPumpStatus;
            digitalWrite(RELAY_PIN, pumpStatus ? HIGH : LOW);
            Serial.print("Manual control: Pump turned ");
            Serial.println(pumpStatus ? "ON" : "OFF");
          }
        }
      } else {
        Serial.print("JSON parse error: ");
        Serial.println(error.c_str());
      }
    }
    http.end();
  }
}

void updateLCD(int moistureLevel, int moisturePercent) {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Moist: ");
  lcd.print(moisturePercent);
  lcd.print("%");
  
  lcd.setCursor(0, 1);
  lcd.print("Pump:");
  lcd.print(pumpStatus ? "ON " : "OFF");
  lcd.print(manualControl ? " MAN" : " AUTO");
}

void loop() {
  unsigned long currentTime = millis();
  
  // Read sensor data
  int moistureLevel = analogRead(MOISTURE_SENSOR_PIN);
  int moisturePercent = map(moistureLevel, 4095, 0, 0, 100);  // Invert mapping
  
  // Check for manual control from dashboard
  if (currentTime - lastControlCheck >= controlCheckDelay) {
    checkPumpControl();
    lastControlCheck = currentTime;
  }
  
  // Control pump based on moisture level or manual control
  if (!manualControl) {
    if (moistureLevel > MOISTURE_THRESHOLD) {
      digitalWrite(RELAY_PIN, HIGH);
      pumpStatus = true;
      Serial.println("Auto mode: Pump ON - Low moisture detected");
    } else {
      digitalWrite(RELAY_PIN, LOW);
      pumpStatus = false;
      Serial.println("Auto mode: Pump OFF - Adequate moisture");
    }
  }
  
  // Update LCD every second
  if (currentTime - lastLCDUpdate >= lcdUpdateDelay) {
    updateLCD(moistureLevel, moisturePercent);
    lastLCDUpdate = currentTime;
  }
  
  // Send data to server every 5 seconds
  if (currentTime - lastTime >= timerDelay) {
    if(WiFi.status() == WL_CONNECTED) {
      StaticJsonDocument<200> doc;
      doc["moisture"] = moisturePercent;
      doc["pumpStatus"] = pumpStatus;
      doc["manualControl"] = manualControl;
      
      String jsonString;
      serializeJson(doc, jsonString);
      
      Serial.print("Sending data to server: ");
      Serial.println(jsonString);
      
      HTTPClient http;
      http.begin(serverUrl);
      http.addHeader("Content-Type", "application/json");
      
      int httpResponseCode = http.POST(jsonString);
      
      if (httpResponseCode > 0) {
        Serial.print("HTTP Response code: ");
        Serial.println(httpResponseCode);
        String response = http.getString();
        Serial.println(response);
      } else {
        Serial.print("Error code: ");
        Serial.println(httpResponseCode);
      }
      
      http.end();
    } else {
      Serial.println("WiFi Disconnected");
    }
    lastTime = currentTime;
  }
}
