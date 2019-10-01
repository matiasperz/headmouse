

/* CÃ³digo para controlar el ratÃ³n con la cabeza y click asistido.
*/

#include <Wire.h>
#include <I2Cdev.h> //Libreria necesaria para el giroscopio
#include <MPU6050.h> //Libreria giroscopio
#include <Keyboard.h> //Libreria de teclado
#include <Mouse.h> //Libreria de mouse

MPU6050 mpu;


//CONFIGURATION
const boolean LOG_VALUES = false; //<--- For logging reading values
const boolean OPEN_KEYBOARD = false; //<--- Config for oppening the on screan keyboard when connection
const boolean TOGGLE_LEFT_CLICK = false; //<--- For canceling the LEFT_CLICK action;
//END COFIGURATION


//EXECUTION VARIABLE DEFINITION
int16_t ax, ay, az, gx, gy, gz; //Variables para enviar 
int vx, vy, vx_prec, vy_prec;
int count = 0;
int cont = 0;
int contar = 0;
char valor_click= '2';
int sens = 200;
char serialReadedValues;
char valores2[4];


//SETTING UP
void setup() {
  Serial.begin(9600);
  
  
  if(!Serial){
    Keyboard.begin();
    delay(2000);
    printConfig();
    openScreenKeyboard(); //This triggers the onScrean Keyboard
  }

  Wire.begin();
  mpu.initialize();
  if(!mpu.testConnection()) {
    while (1);
  }
}


//EXECUTION
void loop() {
  //Si ser reciben valores, entonces se almacenan en la variable valores, la cual posteriormente se utiliza para guardar 
  //los datos en un array de caracteres (siempre  y cuando correspondan a los datos pedidos)
 
  mpu.getMotion6(&ax, &ay, &az, &gx, &gy, &gz);

  //Estos valores van a luego ser asignados a la posicion del mouse y estan siendo
  //Divididos por la sensibilidad para reducir el movimiento
  vx = (gx + 200) / sens;
  vy = -(gz + 60) / sens;

  Mouse.move(vx, vy);


  if( (vx_prec - 5) <= vx && vx <= vx_prec + 5 && (vy_prec - 5) <= vy && vy <= vy_prec + 5) { // Al verificar el puntero notamos que no se mueve mucho de su posicion actual: (en este caso un cuadro de 10px)
    count++;
    if(valor_click == '1' && count == 25){ // el click  ocurrirá despues de 2 segundos en los que el puntero ha parado en el cuadro de 10px: 20ms de retraso por 100 veces es 2000ms = 2s
      mouseLeftClick();
    }else if(valor_click == '2' && count == 50){
      mouseLeftClick();
    }else if(valor_click == '3' && count == 75){
      mouseLeftClick();
    }else {
      if(Mouse.isPressed(MOUSE_LEFT)) {
        Mouse.release(MOUSE_LEFT);
      }
    }
  }else {
    vx_prec = vx;
    vy_prec = vy;
    count = 0;
  }

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

void mouseLeftClick(){
  if(TOGGLE_LEFT_CLICK){
    if(!Mouse.isPressed(MOUSE_LEFT)) {
      Mouse.press(MOUSE_LEFT);
      delay(500);
      Keyboard.releaseAll();
      count = 0;
    } 
  }
}
