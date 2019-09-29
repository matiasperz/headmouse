

/* CÃ³digo para controlar el ratÃ³n con la cabeza y click asistido.
*/

#include <Wire.h>
#include <I2Cdev.h> //Libreria necesaria para el giroscopio
#include <MPU6050.h> //Libreria giroscopio
#include <Keyboard.h> //Libreria de teclado
#include <Mouse.h> //Libreria de mouse

MPU6050 mpu;

int16_t ax, ay, az, gx, gy, gz;
int vx, vy, vx_prec, vy_prec;
int count = 0;
int cont = 0;
int contar = 0;
char valor_click= '2';
int sens = 200;
char serialReadedValues;
char valores2[4];

void setup() {
  Serial.begin(9600);

  if(!Serial){
    Keyboard.begin();
    delay(2000);
    openScreenKeyboard(); //This triggers the onScrean Keyboard
  }

  Wire.begin();
  mpu.initialize();
  if(!mpu.testConnection()) {
    while (1);
  }
}


void loop() {
  //Si ser reciben valores, entonces se almacenan en la variable valores, la cual posteriormente se utiliza para guardar 
  //los datos en un array de caracteres (siempre  y cuando correspondan a los datos pedidos)
  if(Serial.available() > 0){
    serialReadedValues =  Serial.read();

    if(serialReadedValues == '0' || serialReadedValues == '1' || serialReadedValues == '2' || serialReadedValues == '3' || serialReadedValues == '-'){
      valores2[cont] = serialReadedValues;
      cont++;
    }

    if(cont > 2){
      cont = 0;
    }
  }

  //Se utiliza el array decaracteres para dividirlo en dos tareas: valores2[0] siempre corresponderá a
  //la cantidad de clicks por segundo, por lo que se utiliza para esa función
  if(valores2[0] == '0' || valores2[0] == '1' || valores2[0] == '2' || valores2[0] == '3'){
    valor_click = valores2[0];
  }

  //Mientras que valores[2] siempre corresponderá a la sensibilidad que se debe utilizar
  switch(valores2[2]){
    case '1':
    sens = 300;
    break;
    case '2':
    sens = 500; 
    break;
    case '3':
    sens = 700;
    break;
  }

  mpu.getMotion6(&ax, &ay, &az, &gx, &gy, &gz);

  //Estos valores van a luego ser asignados a la posicion del mouse y estan siendo
  //Divididos por la sensibilidad para reducir el movimiento
  vx = (gx + 200) / sens;
  vy = -(gz + 60) / sens;
  Serial.println(sens);

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

void openScreenKeyboard(){
  Keyboard.press(KEY_LEFT_GUI);
  Keyboard.press('r');
  Keyboard.releaseAll();
  delay(200);
  Keyboard.print("OSK");
  delay(100);

  Keyboard.press(KEY_RETURN);
  Keyboard.releaseAll();
}

void mouseLeftClick(){
  if (!Mouse.isPressed(MOUSE_LEFT)) {
    Mouse.press(MOUSE_LEFT);
    Keyboard.press(KEY_LEFT_CTRL);
    delay(500);
    Keyboard.releaseAll();
    Serial.print(valor_click);
    count = 0;
  }
}