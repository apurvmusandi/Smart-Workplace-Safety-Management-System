#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <DHT.h>
#include <HardwareSerial.h>
#include <DFRobotDFPlayerMini.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// ---------------------- Network Settings ----------------------
const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
// DO NOT use localhost here. Use your computer's LAN IP address.
const char* SERVER_URL = "http://192.168.1.100:5000";

const char* DEVICE_ID = "ESP32-01";

// ---------------------- Hardware Config ----------------------
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64

Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);
LiquidCrystal_I2C lcd(0x27, 16, 2);

#define DHTPIN 4
#define DHTTYPE DHT22
DHT dht(DHTPIN, DHTTYPE);

// ---------------------- Pins ----------------------
#define MQ_PIN          34
#define FLAME_PIN       27
#define CURRENT_PIN     35
#define VIBRATION_PIN   5

#define GREEN_LED       18
#define RED_LED         19
#define BUZZER          25

// DFPlayer Mini Pins (UART2)
#define DF_RX           16
#define DF_TX           17

HardwareSerial dfSerial(2);
DFRobotDFPlayerMini player;

// Arduino UNO Communication Pins (UART1)
// We map Serial1 to unused pins to avoid conflict with standard I/O
#define UNO_RX          32 
#define UNO_TX          33
HardwareSerial unoSerial(1);

// ---------------------- Alert Thresholds (Dynamic) ----------------------
float temperatureThreshold = 40.0;
int smokeThreshold = 1800;
float currentThreshold = 0.35;
String adminPhoneStr = "";

// ---------------------- Sensor Enable Toggles ----------------------
bool enableTemp = true;
bool enableSmoke = true;
bool enableCurrent = true;
bool enableFlame = true;
bool enableVibration = true;

// ---------------------- Variables ----------------------
float temperature = 0;
float humidity = 0;

int smokeValue = 0;
int flameValue = HIGH; // Default to SAFE (HIGH)
int vibration = 0;
int currentADC = 0;

float currentVoltage = 0;
float currentAmp = 0;

bool isDangerState = false; 
String currentDangerTypeStr = "";
unsigned long lastAudioPlayMillis = 0;
const unsigned long audioRepeatInterval = 5000; 

// Timers for instant detection vs slow DHT readings
unsigned long previousFastMillis = 0;
unsigned long previousSlowMillis = 0;
const unsigned long fastInterval = 200;  
const unsigned long slowInterval = 2000; // MUST remain 2000 for DHT22 stability

// Timers for backend communication
unsigned long previousHttpMillis = 0;
unsigned long previousSettingsMillis = 0;
const unsigned long httpInterval = 2000;      // Send data every 2s
const unsigned long settingsInterval = 5000;  // Poll settings every 5s

// Alert Cooldown variables to prevent spam
unsigned long lastAlertSentMillis = 0;
const unsigned long alertCooldown = 30000; // 30 seconds cooldown between SMS/Call alerts
bool alertDebounceActive = false;

// Remote Settings from Backend
bool smsEnabled = true;
bool callEnabled = false;

// ------------------------------------------------------
// WATCHDOG-SAFE DELAY FUNCTION
// ------------------------------------------------------
void safeDelay(unsigned long ms) {
  unsigned long start = millis();
  while (millis() - start < ms) {
    delay(10);
    yield(); 
  }
}

// ------------------------------------------------------
// 3-BEEP ALARM FUNCTION
// ------------------------------------------------------
void playThreeBeeps() {
  for (int i = 0; i < 3; i++) {
    digitalWrite(BUZZER, HIGH);
    safeDelay(150);
    digitalWrite(BUZZER, LOW);
    safeDelay(150);
  }
}

// ------------------------------------------------------
// STARTUP AUDIO SEQUENCE
// ------------------------------------------------------
void playStartupAudio() {
  display.clearDisplay();
  display.setCursor(0, 0);
  display.println("Boot Sequence:");
  
  display.println("> Welcome"); display.display();
  player.play(1); safeDelay(6000);
  
  display.println("> Initializing"); display.display();
  player.play(2); safeDelay(6000);
  
  display.println("> WiFi Connect"); display.display();
  player.play(3); safeDelay(6000);
  
  display.println("> Connected"); display.display();
  player.play(4); safeDelay(6000);
  
  display.println("> Activated"); display.display();
  player.play(5); safeDelay(6000);
  
  display.clearDisplay();
}

// ------------------------------------------------------
// SETUP
// ------------------------------------------------------
void setup() {
  Serial.begin(115200);
  unoSerial.begin(115200, SERIAL_8N1, UNO_RX, UNO_TX);
  
  delay(3000); // Allow hardware to stabilize

  dfSerial.begin(9600, SERIAL_8N1, DF_RX, DF_TX);

  pinMode(GREEN_LED, OUTPUT);
  pinMode(RED_LED, OUTPUT);
  pinMode(BUZZER, OUTPUT);

  pinMode(FLAME_PIN, INPUT);
  pinMode(VIBRATION_PIN, INPUT);

  // STARTUP STATE: Green ON, Red OFF
  digitalWrite(GREEN_LED, HIGH);
  digitalWrite(RED_LED, LOW);
  digitalWrite(BUZZER, LOW);

  Wire.begin(21, 22);

  lcd.init();
  lcd.backlight();
  dht.begin();

  display.begin(SSD1306_SWITCHCAPVCC, 0x3C);
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(WHITE);
  display.setCursor(0, 0);
  display.println("SafeGuard AI");
  display.println("Starting Module...");
  display.display();

  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("SafeGuard AI");
  lcd.setCursor(0, 1);
  lcd.print("Initializing...");

  // Quick boot beep
  digitalWrite(BUZZER, HIGH);
  delay(150);
  digitalWrite(BUZZER, LOW);

  connectWiFi();

  Serial.println("Initializing DFPlayer...");
  delay(2000);
  
  if (player.begin(dfSerial, false, false)) {
    Serial.println("DFPlayer Ready");
    player.volume(29);  
    delay(500);
    playStartupAudio();
  } else {
    Serial.println("DFPlayer Not Found / No SD Card");
  }
}

//----------------------------------------------------
// WIFI
//----------------------------------------------------
void connectWiFi() {
  if (WiFi.status() == WL_CONNECTED) return;
  
  Serial.print("Connecting to WiFi: ");
  Serial.println(WIFI_SSID);
  
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  int attempts = 0;
  
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if(WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi connected!");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\nWiFi connection failed! Will retry later in loop.");
  }
}

//----------------------------------------------------
// SENSOR READING (Fast & Slow)
//----------------------------------------------------
void readSensorsFast() {
  smokeValue = analogRead(MQ_PIN);
  flameValue = digitalRead(FLAME_PIN);
  vibration = digitalRead(VIBRATION_PIN);

  long adcSum = 0;
  for(int i = 0; i < 30; i++) {
    adcSum += analogRead(CURRENT_PIN);
  }
  currentADC = adcSum / 30; 
  
  currentVoltage = (currentADC / 4095.0) * 3.3;
  currentAmp = (currentVoltage - 2.5) / 0.066;
  if (currentAmp < 0) currentAmp = -currentAmp;
  if (currentAmp < 0.05) currentAmp = 0.00; 
}

void readSensorsSlow() {
  // Read DHT22 - The sensor physically cannot read faster than this
  temperature = dht.readTemperature();
  humidity = dht.readHumidity();
  
  if(isnan(temperature)) temperature = 0;
  if(isnan(humidity)) humidity = 0;
}

//----------------------------------------------------
// LCD & OLED UPDATE
//----------------------------------------------------
void updateLCD() {
  lcd.clear();
  if (isDangerState) {
    lcd.setCursor(0, 0);
    lcd.print("!!! ALERT !!!");
    lcd.setCursor(0, 1);
    lcd.print(currentDangerTypeStr);
  } else {
    lcd.setCursor(0, 0);
    lcd.print("Temp:");
    lcd.print((int)temperature);
    lcd.print("C Hum:");
    lcd.print((int)humidity);
    lcd.print("%");

    lcd.setCursor(0, 1);
    lcd.print("MQ:");
    lcd.print(smokeValue);
    lcd.print(" Fire:");
    if (flameValue == LOW) lcd.print("YES");
    else lcd.print("NO ");
  }
}

void updateOLED() {
  display.clearDisplay();
  display.setTextSize(1);
  
  display.setCursor(0, 0); display.print("Current: "); display.print(currentAmp, 2); display.print("A");
  display.setCursor(0, 18); display.print("Temp: "); display.print(temperature, 1); display.print("C");
  display.setCursor(0, 36); display.print("Vib: "); display.print(vibration ? "YES" : "NO");
  display.setCursor(0, 54); display.print("Smoke: "); display.print(smokeValue);
  
  display.display();
}

//----------------------------------------------------
// ARDUINO UNO COMMUNICATION (ALERT)
//----------------------------------------------------
void sendAlertToArduino(String alertType) {
  // Format: ALERT|FIRE|SMS=1|CALL=0|NUM=+918999259299
  String cmd = "ALERT|" + alertType + "|SMS=" + (smsEnabled ? "1" : "0") + "|CALL=" + (callEnabled ? "1" : "0") + "|NUM=" + adminPhoneStr;
  unoSerial.println(cmd);
  Serial.print("Sent to Arduino UNO: ");
  Serial.println(cmd);
}

//----------------------------------------------------
// CHECK CONDITIONS & TRIGGER ALARMS
//----------------------------------------------------
void checkConditions() {
  bool currentDanger = false;
  int dangerType = 0; 
  String dangerTypeStr = "SAFE";

  if (enableFlame && flameValue == LOW) {
    dangerType = 2; currentDanger = true; dangerTypeStr = "FIRE";
  } else if (enableSmoke && smokeValue > smokeThreshold) {  
    dangerType = 1; currentDanger = true; dangerTypeStr = "SMOKE";
  } else if (enableTemp && temperature > temperatureThreshold) { 
    dangerType = 3; currentDanger = true; dangerTypeStr = "HIGH_TEMP";
  } else if (enableCurrent && currentAmp > currentThreshold) {  
    dangerType = 4; currentDanger = true; dangerTypeStr = "OVER_CURRENT";
  } else if (enableVibration && vibration == HIGH) {
    dangerType = 5; currentDanger = true; dangerTypeStr = "VIBRATION";
  }

  currentDangerTypeStr = dangerTypeStr;

  if (currentDanger) {
    // DANGER STATE: Red ON, Green OFF
    digitalWrite(RED_LED, HIGH);
    digitalWrite(GREEN_LED, LOW);
    
    if (!isDangerState) {
      playThreeBeeps(); 
      isDangerState = true;
      lastAudioPlayMillis = 0; 
    }
    
    // Play audio alert repeatedly
    if (millis() - lastAudioPlayMillis >= audioRepeatInterval) {
      if (dangerType == 1) player.play(6); 
      else player.play(7); 
      lastAudioPlayMillis = millis();
    }
    
    // Remote Alert Logic (Arduino UNO / SIM800L) with Cooldown
    if (!alertDebounceActive) {
       sendAlertToArduino(dangerTypeStr);
       alertDebounceActive = true;
       lastAlertSentMillis = millis();
    } else {
       // Check if cooldown has expired
       if (millis() - lastAlertSentMillis >= alertCooldown) {
         // Optionally re-trigger if still in danger, or just stay debounced until safe
         // For now, we only trigger once per danger event until it clears to avoid spam.
       }
    }
    
  } else {
    // SAFE STATE: Green ON, Red OFF
    digitalWrite(GREEN_LED, HIGH);
    digitalWrite(RED_LED, LOW);
    digitalWrite(BUZZER, LOW); 

    if (isDangerState) {
      player.play(8); 
      isDangerState = false;
      alertDebounceActive = false; // Reset debounce so next event can trigger SMS
    }
  }
}

//----------------------------------------------------
// BACKEND COMMUNICATION
//----------------------------------------------------
void sendSensorData() {
  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  String url = String(SERVER_URL) + "/api/sensors/data";
  http.begin(url);
  http.addHeader("Content-Type", "application/json");

  // Create JSON Payload
  StaticJsonDocument<256> doc;
  doc["deviceId"] = DEVICE_ID;
  doc["temperature"] = temperature;
  doc["humidity"] = humidity;
  doc["smoke"] = smokeValue;
  doc["flame"] = flameValue;
  doc["vibration"] = vibration;
  doc["current"] = currentAmp;
  doc["systemStatus"] = isDangerState ? currentDangerTypeStr : "SAFE";

  String requestBody;
  serializeJson(doc, requestBody);

  int httpResponseCode = http.POST(requestBody);
  if (httpResponseCode > 0) {
    // Success
    // String response = http.getString();
  } else {
    Serial.print("Error sending sensor data: ");
    Serial.println(httpResponseCode);
  }
  
  http.end();
}

void fetchSettings() {
  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  String url = String(SERVER_URL) + "/api/settings";
  http.begin(url);

  int httpResponseCode = http.GET();
  if (httpResponseCode > 0) {
    String response = http.getString();
    
    StaticJsonDocument<512> doc;
    DeserializationError error = deserializeJson(doc, response);
    
    if (!error) {
      if (doc.containsKey("smsAlert")) smsEnabled = doc["smsAlert"];
      if (doc.containsKey("callAlert")) callEnabled = doc["callAlert"];
      if (doc.containsKey("thresholdTemp")) temperatureThreshold = doc["thresholdTemp"];
      if (doc.containsKey("thresholdSmoke")) smokeThreshold = doc["thresholdSmoke"];
      if (doc.containsKey("thresholdCurrent")) currentThreshold = doc["thresholdCurrent"];
      if (doc.containsKey("adminPhone")) adminPhoneStr = doc["adminPhone"].as<String>();
      
      if (doc.containsKey("enableTemp")) enableTemp = doc["enableTemp"];
      if (doc.containsKey("enableSmoke")) enableSmoke = doc["enableSmoke"];
      if (doc.containsKey("enableCurrent")) enableCurrent = doc["enableCurrent"];
      if (doc.containsKey("enableFlame")) enableFlame = doc["enableFlame"];
      if (doc.containsKey("enableVibration")) enableVibration = doc["enableVibration"];
    }
  } else {
    Serial.print("Error fetching settings: ");
    Serial.println(httpResponseCode);
  }
  
  http.end();
}

//----------------------------------------------------
// LOOP
//----------------------------------------------------
void loop() {
  unsigned long currentMillis = millis();
  
  // Reconnect WiFi if disconnected
  if (WiFi.status() != WL_CONNECTED) {
    connectWiFi();
  }

  if (currentMillis - previousFastMillis >= fastInterval) {
    previousFastMillis = currentMillis;
    readSensorsFast();
    updateOLED();
    checkConditions();
  }

  if (currentMillis - previousSlowMillis >= slowInterval) {
    previousSlowMillis = currentMillis;
    readSensorsSlow();
    updateLCD();
  }
  
  if (currentMillis - previousHttpMillis >= httpInterval) {
    previousHttpMillis = currentMillis;
    sendSensorData();
  }
  
  if (currentMillis - previousSettingsMillis >= settingsInterval) {
    previousSettingsMillis = currentMillis;
    fetchSettings();
  }
}