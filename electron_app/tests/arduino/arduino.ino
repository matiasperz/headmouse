#include "jsmn.h"

int i;
int r;
jsmn_parser p;
jsmntok_t t[128]; /* We expect no more than 128 tokens */

char const *JSON_STRING;
char JSON_STRING2;
String RECEIVED_STRING;

static int jsoneq(const char *json, jsmntok_t *tok, const char *s) {
  if (tok->type == JSMN_STRING && (int)strlen(s) == tok->end - tok->start &&
      strncmp(json + tok->start, s, tok->end - tok->start) == 0) {
    return 0;
  }
  return -1;
}



void setup(){
  Serial.begin(9600);
  jsmn_init(&p);
}


void loop() {
  if(Serial.available()){
    RECEIVED_STRING = Serial.readString();
    JSON_STRING = RECEIVED_STRING.c_str();
    
    r = jsmn_parse(&p, JSON_STRING, strlen(JSON_STRING), t,
                 sizeof(t) / sizeof(t[0]));
                 
    if (r < 0) {
      Serial.print("Failed to parse JSON\n");
    }

    /* Assume the top-level element is an object */
    if (r < 1 || t[0].type != JSMN_OBJECT) {
      Serial.print("Object expected\n");
      Serial.print(RECEIVED_STRING);
    }
  
    /* Loop over all keys of the root object */
    for (i = 1; i < r; i++) {
      if (jsoneq(JSON_STRING, &t[i], "type") == 0) {
        Serial.print("Type: ");
        strncpy(JSON_STRING2, JSON_STRING + t[i + 1].start, (t[i + 1].end - t[i + 1].start));
        Serial.println(JSON_STRING2);
        i++;
      } else if (jsoneq(JSON_STRING, &t[i], "payload") == 0) {
        Serial.print("Payload: ");
        strncpy(JSON_STRING2, JSON_STRING + t[i + 1].start, (t[i + 1].end - t[i + 1].start));
        Serial.println(JSON_STRING2);
        i++;
      }
    }
  }
  delay(300);
}
