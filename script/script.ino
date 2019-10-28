#include <Wire.h>
#include <I2Cdev.h> //<-- Library required by MPU-6050
#include <string.h>
#include <MPU6050.h> //<-- MPU-6050 library
#include <Keyboard.h> //<-- Keyboard library
#include <Mouse.h> //<-- Mouse library
#include <SPI.h>  //<-- Bus library
#include "nRF24L01.h" //<-- Radio library
#include "RF24.h" //<-- Radio library
#include "jsmn.h" //JSMN library

//CONFIGURATION
boolean LOG_VALUES = false; //<-- For logging reading values
boolean OPEN_KEYBOARD = false;  //<-- Config for oppening the on screan keyboard when connection
boolean TOGGLE_LEFT_CLICK = true; //<-- For canceling the LEFT_CLICK action;
boolean TOGGLE_RIGHT_CLICK = true;  //<-- For canceling the RIGHT_CLICK action;
boolean CLICK_INVERT = false;
char MODULE[13];
int MOUSE_SENSIBILITY = 0;
int CLICK_DELAY = 2;


//VARIABLES
typedef struct { //<-- Package to be transmited by radio structure
  const char module[5] = "";
  char action[15] = "";
} radioPackage; //<-- Struct type

radioPackage RadioPackage;  //<-- Struct type / Variable name
int16_t ax, ay, az, gx, gy, gz; //<-- MPU-6050 variables
int vx, vy, previous_vx, previous_vy; //<-- Variables to move the cursor (vx, vy) and to compare movement (previous_vx, previous_vy)
int lastClickMillis = 0;
int currentMillis = 0;
byte address[6] = "00001";  //<-- Radio NRF24L01 Address

/* PC_COMMUNICATOIN VARIABLES */
int i;
int response;
jsmn_parser jsmn_parser_instance; // 
jsmntok_t jsmn_token_array[60]; // We expect no more than 60 tokens
boolean initialConfigReceived = false;

char const *JSON_STRING;
String RECEIVED_STRING;
char JSON_KEY[20];
char JSON_VALUE[20];


/* INFRA_GLASSES VARIABLES */
int rightSensorPin  = A1;
int leftSensorPin = A2;    // IR Sensor

int lastLevelLeft = 0;
int lastLevelRight = 0;    // Previous IR level
int lastChangeLeft = 0;
int lastChangeRight = 0;  // Change in IR level
int changeThreshold = 5; // How hard a rising edge do we need?

int primaryClickDuration = 100;        // Length of visualization
int secondaryClickDuration = 500;
float lastStartRight = 0;       // Last start of visualization
float lastStartLeft = 0;
int infraGlassReadingThreshold = 100;
int infraGlassLastReading = 0;


//INITIALIZATIONS
MPU6050 mpu;
RF24 radio(9, 10);


/*-------------- SETUP --------------*/

void setup() {
  Serial.begin(9600); //<-- Serial monitor begin
  strcpy(MODULE, "RADIO_BUTTONS");
  //NRF24L01 Alimentation 3.3v pin config
  pinMode(A0, OUTPUT); //<-- Define the pin output
  digitalWrite(A0, HIGH);  //<-- Flow voltaje through pin

  //RADIO
  radio.begin();
  radio.openReadingPipe(0, address);
  radio.setPALevel(RF24_PA_MIN);
  radio.startListening();
  
  //KEYBOARD
  Keyboard.begin();
  delay(1000);
  openScreenKeyboard(); //<-- This triggers the onScrean Keyboard

  //MPU
  Wire.begin();
  mpu.initialize();
  if (!mpu.testConnection()) { //<-- Wait till MPU6050 returns a truly connection
    while (1);
  }

  //JSMN
  
  // printConfig();  //<-- Print current configuration
}


/*-------------- LOOP --------------*/

void loop() {
  makeModuleAction();

  mpu.getMotion6(&ax, &ay, &az, &gx, &gy, &gz);

  /*
      This values are going to be asigned to the position of the mouse
      <vx> and <vy> are divided for the MOUSE_SENSIBILITY in order to CANCEL the parkinson
  */
  vx = (gx + 200) / ( 200 + 400 - (100 * MOUSE_SENSIBILITY));  //<--  200 is the value that allows <vx> to get close to the absolute cero of the x axis
  vy = - (gz + 60) / ( 200 + 400 - (100 * MOUSE_SENSIBILITY));  //<--  60 is the value that allows <vx> to get close to the absolute cero of the z axis

  Mouse.move(vx, vy);

  if(Serial.available()){
    readIncomingJson(); // <-- If a Serial packet is available will be interpretated by this function
  }

  delay(10);
}

void printConfig() {
  Serial.println("CONFIGURATION:");
  
  Serial.print("MODULE: ");
  Serial.println(MODULE);
  
  Serial.print("SENSIBILITY: ");
  Serial.println(MOUSE_SENSIBILITY);

  Serial.print("OPEN_KEYBOARD: ");
  if(OPEN_KEYBOARD){
    Serial.println("true");
  }else{
    Serial.println("false");
  }

  Serial.print("INVERT CLICK: ");
  if(CLICK_INVERT){
    Serial.println("true");
  }else{
    Serial.println("false");
  }

  Serial.print("CLICK_DELAY: ");
  Serial.println(CLICK_DELAY);
}

void openScreenKeyboard() {
  if (OPEN_KEYBOARD) {
    Keyboard.press(KEY_LEFT_GUI);
    Keyboard.press('r');
    Keyboard.releaseAll();
    delay(200);
    Keyboard.print("OSK");
    delay(100);
    Keyboard.press(KEY_RETURN);
    Keyboard.releaseAll();
  }
}

void sendSerialPacket(char *_type, char *_payload){
  Serial.print("{\"type\": \"");
  Serial.print(_type);
  Serial.print("\", \"payload\": \"");
  Serial.print(_payload);
  Serial.println("\"}");
}

//Mouse clicks
void mouseLeftClick() {
  sendSerialPacket("ACTION", "LEFT_CLICK");
  if (!Mouse.isPressed(MOUSE_LEFT)) {
    Mouse.click(MOUSE_LEFT);
  } else {
    Mouse.release(MOUSE_LEFT);
  }
}

void mouseRightClick() {
  sendSerialPacket("ACTION", "RIGHT_CLICK");
  if (!Mouse.isPressed(MOUSE_RIGHT)) {
    Mouse.click(MOUSE_RIGHT);
  } else {
    Mouse.release(MOUSE_RIGHT);
    Mouse.click(MOUSE_RIGHT);
  }
}

void mouseDoubleClick(){
  sendSerialPacket("ACTION", "DOUBLE_CLICK");
  if (!Mouse.isPressed(MOUSE_LEFT)) {
    Mouse.click(MOUSE_LEFT);
    delay(20);
    Mouse.click(MOUSE_LEFT);
  } else {
    Mouse.release(MOUSE_LEFT);
    Mouse.click(MOUSE_LEFT);
    delay(20);
    Mouse.click(MOUSE_LEFT);
  }
}

void mouseSelectionClick() {
  sendSerialPacket("ACTION", "SELECTION");
  if (!Mouse.isPressed(MOUSE_LEFT)) {
    Mouse.press(MOUSE_LEFT);
  } else {
    Mouse.release(MOUSE_LEFT);
    Mouse.press(MOUSE_LEFT);
  }
}

void evaluatePackageClick(){
  if (!strcmp(RadioPackage.action, "LEFT_CLICK")) {
    mouseLeftClick();
  } else if (!strcmp(RadioPackage.action, "RIGHT_CLICK")) {
    mouseRightClick();
  } else if (!strcmp(RadioPackage.action, "SELECTION")) {
    mouseSelectionClick();
  } else if (!strcmp(RadioPackage.action, "DOUBLE_CLICK")){
    mouseDoubleClick();
  }
}

void makeModuleAction(){
  if(strcmp(MODULE, "INFRA_GLASSES") == 0){
    infraGlasses();
  }else if(strcmp(MODULE, "RADIO_BUTTONS") == 0){
    radioButtons();
  }else if(strcmp(MODULE, "AUTO_CLICK") == 0){
    autoClick();
  }
}

void radioButtons(){
  if (radio.available()) {
    radio.read(&RadioPackage, sizeof(RadioPackage));
    evaluatePackageClick();
  }
}

void infraGlasses(){
  currentMillis = millis();
  
  if((currentMillis - infraGlassLastReading) >= infraGlassReadingThreshold){
    int rightSensorValue = analogRead(rightSensorPin); //1020
    int leftSensorValue = analogRead(leftSensorPin); //1020
  
    // look for rising edges
    lastChangeLeft = leftSensorValue - lastLevelLeft; //1020
    lastLevelLeft = leftSensorValue; //1020
  
    lastChangeRight = rightSensorValue - lastLevelRight;
    lastLevelRight = rightSensorValue;
  
    /* --------------- Evaluate click ---------------*/
    
    if (lastChangeRight <= -changeThreshold) {
      lastStartRight = currentMillis;
    }else if (lastChangeRight >= changeThreshold) {
      int _millisDiff = currentMillis - lastStartRight;
  
      if(_millisDiff >= secondaryClickDuration){
        mouseSelectionClick();
      }else if(_millisDiff >= primaryClickDuration){
        mouseRightClick();
      }
  
      lastStartRight = currentMillis;
    }
  
    if (lastChangeLeft <= -changeThreshold) {
      lastStartLeft = currentMillis;
    } else if (lastChangeLeft >= changeThreshold) {
      int _millisDiff = currentMillis - lastStartLeft;
  
      if(_millisDiff >= secondaryClickDuration){
        mouseDoubleClick();
      }else if(_millisDiff >= primaryClickDuration){
        mouseLeftClick();
      } 
  
      lastStartLeft = currentMillis;
    }

    infraGlassLastReading = currentMillis;
  }
  
}

void autoClick() { //TODO: This has to be improved
    // This conditional verifies that the mouse is not moving (20x20 maximum)
    currentMillis = millis();

    if(CLICK_DELAY > 0 && CLICK_DELAY <= 4){
      if((currentMillis - lastClickMillis) >= (CLICK_DELAY * 1000)){
        mouseLeftClick();
        lastClickMillis = currentMillis;
      }
    }
    
    /*if ( (previous_vx - 10) <= vx && vx <= previous_vx + 10 && (previous_vy - 10) <= vy && vy <= previous_vy + 10) {
      delayClickCount++;
      if (CLICK_DELAY == 1 && delayClickCount == 25) { //<-- The click will occur after 2 seconds in which the mouse is in the same place
        mouseLeftClick();
      } else if (CLICK_DELAY == 2 && delayClickCount == 50) {
        //mouseLeftClick();
      } else if (CLICK_DELAY == 3 && delayClickCount == 75) {
        //mouseLeftClick();
      } else {
        //if(Mouse.isPressed(MOUSE_LEFT)) {
        //Mouse.release(MOUSE_LEFT);
        //}
      }
    } else {
      previous_vx = vx;
      
      previous_vy = vy;
      delayClickCount = 0;
    }*/
}

static int jsoneq(const char *json, jsmntok_t *tok, const char *s) {
  if (tok->type == JSMN_STRING && (int)strlen(s) == tok->end - tok->start &&
      strncmp(json + tok->start, s, tok->end - tok->start) == 0) { //Compares the current jsmn_token to the json_string
    return 0;
  }
  return -1;
}

void readIncomingJson(){ //<-- Interpretates the JSON string
  jsmn_init(&jsmn_parser_instance); // Initializing JSMN
  RECEIVED_STRING = Serial.readString(); //Reading the whole serial available string
  JSON_STRING = RECEIVED_STRING.c_str(); //Removing the internal char array for manipulation
  response = jsmn_parse(&jsmn_parser_instance, JSON_STRING, strlen(JSON_STRING), jsmn_token_array, sizeof(jsmn_token_array) / sizeof(jsmn_token_array[0]));
  
  if (response < 0) {
    sendSerialPacket("ERROR", "Failed to parse JSON");
  }

  if (response < 1 || jsmn_token_array[0].type != JSMN_OBJECT) {
    sendSerialPacket("ERROR", "Object expected");
  }

  for (i = 1; i < response; i++) {
    if (jsoneq(JSON_STRING, &jsmn_token_array[i], "type") == 0) {
      strcpy(JSON_KEY, RECEIVED_STRING.substring(jsmn_token_array[i + 1].start, jsmn_token_array[i + 1].end).c_str());
    } else if (jsoneq(JSON_STRING, &jsmn_token_array[i], "payload") == 0) {
      strcpy(JSON_VALUE, RECEIVED_STRING.substring(jsmn_token_array[i + 1].start, jsmn_token_array[i + 1].end).c_str());
      configOptions();
    }

    i++; //<-- We add 1 because we already readed a value from a key
  }
}

void configOptions(){ //<-- This has all the logic of each config
  if(strcmp(JSON_KEY, "SENS") == 0){
    sendSerialPacket("MESSAGE", "Cambie la configuracion de la sensibilidad");
    MOUSE_SENSIBILITY = atoi(JSON_VALUE);
    // Serial.println(MOUSE_SENSIBILITY);
  }else if(strcmp(JSON_KEY, "CLICK_DELAY") == 0){
    sendSerialPacket("MESSAGE", "Cambie la configuracion del delay del click");
    CLICK_DELAY = atoi(JSON_VALUE);
  }else if(strcmp(JSON_KEY, "MODULE") == 0){
    sendSerialPacket("MESSAGE", "Cambie la configuracion del modulo");
    strcpy(MODULE, JSON_VALUE);
  }else if(strcmp(JSON_KEY, "DISCOVER") == 0){
    // sendSerialPacket("MESSAGE", "Entre a discover");
    //discover function
  }else if(strcmp(JSON_KEY, "CLICK_INVERT") == 0){
    sendSerialPacket("MESSAGE", "Cambie la configuracion del click invertido");
    if(strcmp(JSON_VALUE, "true") == 0){
      CLICK_INVERT = true;
    }else if(strcmp(JSON_VALUE, "false") == 0){
      CLICK_INVERT = false;
    }
  }else if(strcmp(JSON_KEY, "OPEN_KEYBOARD") == 0){
    sendSerialPacket("MESSAGE", "Cambie la configuracion del keyboard");
    if(strcmp(JSON_VALUE, "true") == 0){
      OPEN_KEYBOARD = true;
    }else if(strcmp(JSON_VALUE, "false") == 0){
      OPEN_KEYBOARD = false;
    }
  }
}