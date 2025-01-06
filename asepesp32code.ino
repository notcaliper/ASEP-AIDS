#include <Wire.h>

#define SENSOR_PIN 34
#define RELAY_PIN 26

int thresholdValue = 3200; 

void setup() {
  Serial.begin(115200);
  pinMode(SENSOR_PIN, INPUT);
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, LOW); 
}

void loop() {
  int sensorValue = analogRead(SENSOR_PIN);
  Serial.print("Moisture Level: ");
  Serial.println(sensorValue);

  if (sensorValue < thresholdValue) {
    Serial.println("Soil is dry. Pump ON.");
    digitalWrite(RELAY_PIN, HIGH); 
  } else {
    Serial.println("Soil is moist. Pump OFF.");
    digitalWrite(RELAY_PIN, LOW); 
  }

  delay(500); 
}
