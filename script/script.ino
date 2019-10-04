//#include <Wire.h>
#include <I2Cdev.h> //<-- Library required by MPU-6050
#include <MPU6050.h> //<-- MPU-6050 library
#include <Keyboard.h> //<-- Keyboard library
#include <Mouse.h> //<-- Mouse library
#include <SPI.h>  //<-- Bus library
#include "nRF24L01.h" //<-- Radio library
#include "RF24.h" //<-- Radio library

//CONFIGURATION
const boolean LOG_VALUES = false; //<-- For logging reading values
const boolean OPEN_KEYBOARD = false;  //<-- Config for oppening the on screan keyboard when connection
const boolean TOGGLE_LEFT_CLICK = true; //<-- For canceling the LEFT_CLICK action;
const boolean TOGGLE_RIGHT_CLICK = true;  //<-- For canceling the RIGHT_CLICK action;
const boolean AUTO_CLICK = false; //<-- For canceling the AUTO_CLICK action;
//END COFIGURATION

//VARIABLES
typedef struct{ //<-- Package to be transmited by radio structure
  const char module[5] = "";
  char action[15] = "";
} radioPackage; //<-- Struct type

radioPackage RadioPackage;  //<-- Struct type / Variable name
int16_t ax, ay, az, gx, gy, gz; //<-- MPU-6050 variables 
int vx, vy, previous_vx, previous_vy; //<-- Variables to move the cursor (vx, vy) and to compare movement (previous_vx, previous_vy)
int delayClickCount = 0;
char valor_click= '2';
int sensibility = 200;
byte address[6] = "00001";  //<-- Radio NRF24L01 Address

//INITIALIZATIONS
MPU6050 mpu;
RF24 radio(9,10);


/*-------------- SETUP --------------*/

void setup() {
  Serial.begin(9600); //<-- Serial monitor begin
  
  //NRF24L01 Alimentation 3.3v pin config
  pinMode(A0, OUTPUT); //<-- Define the pin output
  digitalWrite(A0, HIGH);  //<-- Flow voltaje through pin
  
  //RADIO
  radio.begin();
  radio.openReadingPipe(0, address);
  radio.setPALevel(RF24_PA_MIN);
  radio.startListening();
  Serial.println("Radio started listening");
  
  //KEYBOARD
  Keyboard.begin();
  delay(1000);
  openScreenKeyboard(); //<-- This triggers the onScrean Keyboard
  
  //MPU
  Wire.begin();
  mpu.initialize();
  if(!mpu.testConnection()) { //<-- Wait till MPU6050 returns a truly connection
    while (1);
  }
  
  printConfig();  //<-- Print current configuration
}


/*-------------- LOOP --------------*/

void loop() {
  if( radio.available()){
    radio.read(&RadioPackage, sizeof(RadioPackage));
    //Print readings
    Serial.print(RadioPackage.module);
    Serial.print(":");
    Serial.println(RadioPackage.action);
    
    evaluateMouseClick();
  }

  mpu.getMotion6(&ax, &ay, &az, &gx, &gy, &gz);

  /*  
      This values are going to be asigned to the position of the mouse
      <vx> and <vy> are divided for the sensibility in order to CANCEL the parkinson
  */
  vx = (gx + 200) / sensibility;  //<--  200 is the value that allows <vx> to get close to the absolute cero of the x axis
  vy = -(gz + 60) / sensibility;  //<--  60 is the value that allows <vx> to get close to the absolute cero of the z axis

  Mouse.move(vx, vy);

  autoClick();  //<-- If the AUTO_CLICK config is true, this function will perform click automaticly

  delay(20);
}

void printConfig(){
  Serial.println("CONFIGURATION");
  Serial.println("LOG_VALUES: " + LOG_VALUES);
  Serial.println("OPEN_KEYBOARD: " + OPEN_KEYBOARD);
}

void openScreenKeyboard(){
  if(OPEN_KEYBOARD){
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

void evaluateMouseClick(){
  if(!strcmp(RadioPackage.action, "LEFT_CLICK")){
    mouseLeftClick();
  }else if(!strcmp(RadioPackage.action, "RIGHT_CLICK")){
    mouseRightClick();
  }else if(!strcmp(RadioPackage.action, "SELECTION")){
    selectionClick(); //<-- Send 1 to initializate selection
  }else{
  }
}


//Mouse clicks
void mouseLeftClick(){
  if(!Mouse.isPressed(MOUSE_LEFT)) {
    Mouse.click(MOUSE_LEFT);
  }else{
    Mouse.release(MOUSE_LEFT);
  }
}

void mouseRightClick(){
  if(!Mouse.isPressed(MOUSE_RIGHT)) {
    Mouse.click(MOUSE_RIGHT);
  }else{
    Mouse.release(MOUSE_RIGHT);
    Mouse.click(MOUSE_RIGHT);
  }
}

void selectionClick(){
  if(!Mouse.isPressed(MOUSE_LEFT)){
    Mouse.press(MOUSE_LEFT);
  }else{
    Mouse.release(MOUSE_LEFT);
    Mouse.press(MOUSE_LEFT);
  }
}

void autoClick(){
  if(AUTO_CLICK){
    // This conditional verifies that the mouse is not moving (20x20 maximum)
    if( (previous_vx - 10) <= vx && vx <= previous_vx + 10 && (previous_vy - 10) <= vy && vy <= previous_vy + 10) {
      delayClickCount++;
      if(valor_click == '1' && delayClickCount == 25){  //<-- The click will occur after 2 seconds in which the mouse is in the same place
        //mouseLeftClick();
      }else if(valor_click == '2' && delayClickCount == 50){
        //mouseLeftClick();
      }else if(valor_click == '3' && delayClickCount == 75){
        //mouseLeftClick();
      }else {
        //if(Mouse.isPressed(MOUSE_LEFT)) {
          //Mouse.release(MOUSE_LEFT);
        //}
      }
    } else {
      previous_vx = vx;
      previous_vy = vy;
      delayClickCount = 0;
    }
  }
}
