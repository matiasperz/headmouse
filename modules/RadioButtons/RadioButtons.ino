//UNO
#include <SPI.h>
#include <nRF24L01.h>
#include <RF24.h>

//MODULE CONFIGURATION
const boolean PRINT_VALUES = true;

//VARIABLES
typedef struct { //<-- Touch sensors clicks structure
  int RIGHT_CLICK;
  int LEFT_CLICK;
} readings; //<-- Struct type

typedef struct { //<-- Package to be transmited by radio structure
  const char module[5] = "RCB"; //Radio Capacitive Buttons - Acronym
  char action[15] = "";
} radioPackage; //<-- Struct type

readings Readings; //<-- Struct type / Variable name
radioPackage RadioPackage; //<-- Struct type / Variable name
const int left_sensor_pin = 2; //<-- Left sensor pin config
const int right_sensor_pin = 3; //<-- Right sensor pin config
boolean newInteraction; //<-- Variable for detenting new touches
int lastStateRight = 0;
int lastStateLeft = 0;
int lastStartLeft = 0;
int lastStartRight = 0;
int currentMillis = 0; // <-- For store the current time each loop
int primaryClickDuration = 100; //<-- Minimum duration of the primary click
int secondaryClickDuration = 500; //<-- Minimum duration of the secondary click
const byte address[6] = "00001"; //<-- Address for the NRF24L01 emitter

//INITIALIZATIONS
RF24 radio(9, 10); //<-- Initialize radio with pins


/*-------------- SETUP --------------*/

void setup() {
  Serial.begin(9600); //<--- Serial monitor initialization

  pinMode(left_sensor_pin, INPUT); // <-- Left sensor pin configuration
  pinMode(right_sensor_pin, INPUT); // <-- Right sensor pin configuration

  radio.begin(); //<-- Radio initialization
  radio.openWritingPipe(address); //<-- Radio
  radio.setPALevel(RF24_PA_MIN);
  radio.stopListening();
}


/*-------------- LOOP --------------*/

void loop() {
  Readings.RIGHT_CLICK = digitalRead(right_sensor_pin);
  Readings.LEFT_CLICK = digitalRead(left_sensor_pin);
  currentMillis = millis();

  printValues();
  newInteraction = evaluateClick();

  lastStateRight = Readings.RIGHT_CLICK;
  lastStateLeft = Readings.LEFT_CLICK;

  if (newInteraction) {
    emmitEventPackage();
  }

  delay(100);
}

void printValues() {
  if (PRINT_VALUES) {
    Serial.print("RIGHT: ");
    Serial.print(Readings.RIGHT_CLICK);
    Serial.print(" - LEFT: ");
    Serial.println(Readings.LEFT_CLICK);
  }
}

boolean evaluateClick() {
  boolean _newInteraction = false;

  if(!lastStateLeft && Readings.LEFT_CLICK){
    lastStartLeft = currentMillis;
  }else if(lastStateLeft && !Readings.LEFT_CLICK){
    int _millisDiff = currentMillis - lastStartLeft;

    if (_millisDiff >= secondaryClickDuration) {
      //LEFT CLICK
      strcpy(RadioPackage.action, "DOUBLE_CLICK");
    } else if(_millisDiff >= primaryClickDuration){
      //DOUBLE_CLICK
      strcpy(RadioPackage.action, "LEFT_CLICK");
    }

    lastStartLeft = currentMillis;
    _newInteraction = true;
  }

  if(!lastStateRight && Readings.RIGHT_CLICK){
    lastStartRight = currentMillis;
  } else if(lastStateRight && !Readings.RIGHT_CLICK){
    int _millisDiff = currentMillis - lastStartRight;

    if (_millisDiff >= secondaryClickDuration) {
      //RIGHT CLICK
      strcpy(RadioPackage.action, "SELECTION");
    } else if (_millisDiff >= primaryClickDuration) {
      //SELECTION
      strcpy(RadioPackage.action, "RIGHT_CLICK");
    }

    lastStartRight = currentMillis;
    _newInteraction = true;
  }

  return _newInteraction;
}

void emmitEventPackage() {
  radio.write(&RadioPackage, sizeof(RadioPackage));
}
