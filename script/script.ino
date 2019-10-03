//#include <Wire.h>
#include <I2Cdev.h> //Libreria necesaria para el giroscopio
#include <MPU6050.h> //Libreria giroscopio
#include <Keyboard.h> //Libreria de teclado
#include <Mouse.h> //Libreria de mouse
#include <SPI.h>
#include "nRF24L01.h"
#include "RF24.h"

//CONFIGURATION
const boolean LOG_VALUES = false; //<--- For logging reading values
const boolean OPEN_KEYBOARD = false; //<--- Config for oppening the on screan keyboard when connection
const boolean TOGGLE_LEFT_CLICK = true; //<--- For canceling the LEFT_CLICK action;
const boolean TOGGLE_RIGHT_CLICK = true; //<--- For canceling the RIGHT_CLICK action;
const boolean AUTO_CLICK = false; //<--- For canceling the AUTO_CLICK action;
//END COFIGURATION

//VARIABLES
typedef struct{ //<--- Package to be transmited by radio structure
  const char module[5] = "";
  char action[15] = "";
} radioPackage; //<--- Struct type

radioPackage RadioPackage; //<--- Struct type / Variable name
int16_t ax, ay, az, gx, gy, gz; //Variables para enviar 
int vx, vy, previous_vx, previous_vy;
int count = 0;
int cont = 0;
int contar = 0;
char valor_click= '2';
int sensibility = 200;
char serialReadedValues;
char valores2[4];
byte address[6] = "00001"; //<--- Radio NRF24L01 Address

//INITIALIZATIONS
MPU6050 mpu;
RF24 radio(9,10);


/*-------------- SETUP --------------*/

void setup() {
  Serial.begin(9600); //<--- Serial monitor begin
  
  //NRF24L01 Alimentation 3.3v pin config
  pinMode(4, OUTPUT); //<--- Define the pin output
  digitalWrite(4, HIGH); //<--- Flow voltaje through pin
  
  //RADIO
  radio.begin();
  radio.openReadingPipe(0, address);
  radio.setPALevel(RF24_PA_MIN);
  radio.startListening();
  Serial.println("Radio started listening");
  
  //KEYBOARD
  Keyboard.begin();
  delay(1000);
  openScreenKeyboard(); //This triggers the onScrean Keyboard
  
  //MPU
  Wire.begin();
  mpu.initialize();
  if(!mpu.testConnection()) { //<--- Wait till MPU6050 returns a truly connection
    while (1);
  }
  
  printConfig(); //<--- Print current configuration
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

  //Estos valores van a luego ser asignados a la posicion del mouse y estan siendo
  //Divididos por la sensibilidad para reducir el movimiento
  vx = (gx + 200) / sensibility; // 200 es el valor del eje x que permite acercarnos al 0 absoluto del eje
  vy = -(gz + 60) / sensibility; // 60 es el valor del eje z que nos permite acercarnos al 0 absoluto del eje

  Mouse.move(vx, vy);

  autoClick();

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
    selectionClick(); //<--- Send 1 to initializate selection
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
    if( (previous_vx - 10) <= vx && vx <= previous_vx + 10 && (previous_vy - 10) <= vy && vy <= previous_vy + 10) { // Al verificar el puntero notamos que no se mueve mucho de su posicion actual: (en este caso un cuadro de 10px)
      count++;
      if(valor_click == '1' && count == 25){ // el click  ocurrirá despues de 2 segundos en los que el puntero ha parado en el cuadro de 10px: 20ms de retraso por 100 veces es 2000ms = 2s
        //mouseLeftClick();
      }else if(valor_click == '2' && count == 50){
        //mouseLeftClick();
      }else if(valor_click == '3' && count == 75){
        //mouseLeftClick();
      }else {
        //if(Mouse.isPressed(MOUSE_LEFT)) {
          //Mouse.release(MOUSE_LEFT);
        //}
      }
    } else {
      previous_vx = vx;
      previous_vy = vy;
      count = 0;
    }
  }
}