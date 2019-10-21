#include "jsmn.h"

int i;
int response;
jsmn_parser jsmn_parser_instance; // 
jsmntok_t jsmn_token_array[10]; // We expect no more than 10 tokens

char const *JSON_STRING;
String RECEIVED_STRING;
char JSON_KEY[13];
char JSON_VALUE[13];

static int jsoneq(const char *json, jsmntok_t *tok, const char *s) {
  if (tok->type == JSMN_STRING && (int)strlen(s) == tok->end - tok->start &&
      strncmp(json + tok->start, s, tok->end - tok->start) == 0) { //Compares the current jsmn_token to the json_string
    return 0;
  }
  return -1;
}

void setup(){
  Serial.begin(9600);
  jsmn_init(&jsmn_parser_instance); // Initializing JSMN
}

void loop() {
  if(Serial.available()){
    readIncomingJson();
  }
  delay(300);
}

void readIncomingJson(){
  RECEIVED_STRING = Serial.readString(); //Reading the whole serial available string
  JSON_STRING = RECEIVED_STRING.c_str(); //Removing the internal char array for manipulation
  
  response = jsmn_parse(&jsmn_parser_instance, JSON_STRING, strlen(JSON_STRING), jsmn_token_array, sizeof(jsmn_token_array) / sizeof(jsmn_token_array[0])); //

  if (response < 0) {
    Serial.print("Failed to parse JSON\n");
  }

  if (response < 1 || jsmn_token_array[0].type != JSMN_OBJECT) {
    Serial.print("Object expected\n");
    Serial.print(RECEIVED_STRING);
  }

  for (i = 1; i < response; i++) {
    if (jsoneq(JSON_STRING, &jsmn_token_array[i], "type") == 0) {
      strncpy(JSON_KEY, JSON_STRING + jsmn_token_array[i + 1].start, (jsmn_token_array[i + 1].end - jsmn_token_array[i + 1].start));
    } else if (jsoneq(JSON_STRING, &jsmn_token_array[i], "payload") == 0) {
      strncpy(JSON_VALUE, JSON_STRING + jsmn_token_array[i + 1].start, (jsmn_token_array[i + 1].end - jsmn_token_array[i + 1].start));
      
      configOptions(JSON_KEY, JSON_VALUE);
    }

    i++;
  }
}

void configOptions(char *type, char *payload){
  if(strcmp(type, "SENS") == 0){
    Serial.print("Type: ");
    Serial.println(type);
    
    Serial.print("Payload: ");
    Serial.println(atoi(payload));
  }
}

/*
  types: [SENS, CLICK_DELAY, MODULE, DISCOVER]

  SENS: Controls dispositive sensivility (Payload: Number)
  CLICK_DELAY: Controls the autoclick sensivility (Payload: Number)
  MODULE: Changes the click module (Payload: String)
  DISCOVER: Is a signal to search de module (Payload: String)
*/