

/* CÃ³digo para controlar el ratÃ³n con la cabeza y click asistido.
*/

#include <Wire.h>
#include <I2Cdev.h>
#include <MPU6050.h>
#include <Keyboard.h>
#include <Mouse.h>

MPU6050 mpu;

int16_t ax, ay, az, gx, gy, gz;
int vx, vy, vx_prec, vy_prec;
int count = 0;
int cont = 0;
int contar = 0;
char valor_click = '0';
int sens = 200;
char valores;
char valores2[4];

int touchPin1 = 8;
int touchPin2 = 9;

int touched1 = 0;
int touched2 = 0;

int isSelecting = 0;

void setup() {
  pinMode(touchPin1, INPUT);
  pinMode(touchPin2, INPUT);
  Serial.begin(9600);
  if (!Serial) {

    Keyboard.begin();

    delay(2000);

    Keyboard.press(KEY_LEFT_GUI);
    Keyboard.press('r');
    Keyboard.releaseAll();
    delay(200);
    char* cmd = "C>&Proyecto?Informatico&Mouse?APP&out&artifacts&Mouse?APP?jar2&gui.jar";

    Keyboard.print(cmd);

    delay(100);



    Keyboard.press(KEY_RETURN);
    Keyboard.releaseAll();
    delay(200);

    Keyboard.press(KEY_LEFT_GUI);
    Keyboard.press('r');
    Keyboard.releaseAll();

    delay(200);
    Keyboard.print("OSK");
    delay(100);


    Keyboard.press(KEY_RETURN);
    Keyboard.releaseAll();



  }


  Wire.begin();
  mpu.initialize();
  if (!mpu.testConnection()) {
    while (1);
  }

}

void clickIz() {
  Serial.println("Click Izquierdo!");
  isSelecting = 0;
}

void clickDer() {
  Serial.println("Click Derecho!");
  isSelecting = 0;
}

void dobleClick() {
  Serial.println("Doble Click!");
  isSelecting = 0;
}



void loop() {
  touched1 = digitalRead(touchPin1);
  touched2 = digitalRead(touchPin2);
  //Si ser reciben valores, entonces se almacenan en la variable valores, la cual posteriormente se utiliza para guardar
  //los datos en un array de caracteres (siempre  y cuando correspondan a los datos pedidos)
  if (Serial.available() > 0) {
    valores =  Serial.read();


    if (valores == '0' || valores == '1' || valores == '2' || valores == '3' || valores == '-') {
      valores2[cont] = valores;
      cont++;
    }



    if (cont > 2) {
      cont = 0;
    }

  }




  //Se utiliza el array decaracteres para dividirlo en dos tareas: valores2[0] siempre corresponderá a
  //la cantidad de clicks por segundo, por lo que se utiliza para esa función
  if (valores2[0] == '0' || valores2[0] == '1' || valores2[0] == '2' || valores2[0] == '3') {
    valor_click = valores2[0];
  }


  //Mientras que valores[2] siempre corresponderá a la sensibilidad que se debe utilizar
  switch (valores2[2]) {
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

  vx = (gx + 200) / sens;
  vy = -(gz + 60) / sens;
  Serial.println(sens);

  Mouse.move(vx, vy);


  if ( (vx_prec - 5) <= vx && vx <= vx_prec + 5 && (vy_prec - 5) <= vy && vy <= vy_prec + 5) { // Al verificar el puntero notamos que no se mueve mucho de su posiciÃ³n actual: (en este caso un cuadro de 10px)
    count++;
    if (valor_click == '1' & count == 25 || touched1 == 1) { // el click  ocurrirÃ¡ despuÃ©s de 2 segundos en los que el puntero ha parado en el cuadro de 10px: 20ms de retraso por 100 veces es 2000ms = 2s
      if (!Mouse.isPressed(MOUSE_LEFT)) {
        Mouse.press(MOUSE_LEFT);
        Serial.print(valor_click);
        clickIz();
        count = 0;
      }
    } else if (valor_click == '2' && count == 50) {
      if (!Mouse.isPressed(MOUSE_LEFT)) {
        Mouse.press(MOUSE_LEFT);
        Serial.print(valor_click);
        count = 0;
      }
    } else if (valor_click == '3' && count == 75) {
      if (!Mouse.isPressed(MOUSE_LEFT)) {
        Mouse.press(MOUSE_LEFT);
        Serial.print(valor_click);
        count = 0;
      }
    } else if (touched2 == 1) {
         if (Mouse.isPressed(MOUSE_LEFT)) {
        Mouse.release(MOUSE_LEFT);
      }
      if (!Mouse.isPressed(MOUSE_RIGHT)) {
        Mouse.press(MOUSE_RIGHT);
        Serial.print(valor_click);
        clickDer();
        count = 0;
      }
    }
    else {
      if (Mouse.isPressed(MOUSE_LEFT)) {
        Mouse.release(MOUSE_LEFT);
      }

       if (Mouse.isPressed(MOUSE_RIGHT)) {
        Mouse.release(MOUSE_RIGHT);
      }

    }
  }
  else {
    vx_prec = vx;
    vy_prec = vy;
    count = 0;
  }

  delay(20);
}
