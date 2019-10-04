int sensorPin  = A2;        // IR Sensor
int ledPin = 8;           // Visualization
int lastLevel = 0;         // Previous IR level
int lastChange = 0;        // Change in IR level
int changeThreshold = 15;  // How hard a rising edge do we need?
 
//visualization
int duration = 200;        // Length of visualization
float lastStart = 0;       // Last start of visualization
 
 
void setup() {
  Serial.begin(9600);      // Debug constructor
  pinMode(ledPin, OUTPUT);
}
 
void loop() {
  int sensorValue = analogRead(sensorPin);
  Serial.println(sensorValue);  // Read Data
  // look for rising edges
  lastChange = sensorValue - lastLevel;
  lastLevel = sensorValue;
  if (lastChange >=changeThreshold) {
    digitalWrite(ledPin, HIGH);
    lastStart = millis();
  }
  if (millis() >= lastStart + duration) {
     digitalWrite(ledPin, LOW);
  }
  
  
  //absolute approach
  //if (sensorValue >=205) {
  //  digitalWrite(13, HIGH);
  //}else{
  //  digitalWrite(13, LOW);
  //}
  delay(100);
}
