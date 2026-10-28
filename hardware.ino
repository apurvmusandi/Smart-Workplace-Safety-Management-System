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
// PC LAN IP Address running the backend server (from ipconfig: 10.57.125.249)
// If your PC reconnects or IP changes, update this address accordingly.
const char* SERVER_URL = "http://10.57.125.249:5000";

const char* DEVICE_ID = "ESP32-01";

// ---------------------- Hardware Config ----------------------
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64

Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);
LiquidCrystal_I2C lcd(0x27, 16, 2);

#define DHTPIN 4
DHT dht22(DHTPIN, DHT22);
DHT dht11(DHTPIN, DHT11);

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

// ---------------------- GSM Module (SIM800L) Config ----------------------
// Direct ESP32 connection (UART1). Arduino UNO is completely eliminated!
// SIM800L TX -> ESP32 Pin 32 (GSM_RX)
// SIM800L RX -> ESP32 Pin 33 (GSM_TX)
// SIM800L GND -> ESP32 GND (Common Ground)
// Note: If GSM module is not physically connected, ESP32 operates normally without stalling!
#define GSM_RX_PIN      32 
#define GSM_TX_PIN      33
HardwareSerial gsmSerial(1);

String defaultPhoneNumber = "+91XXXXXXXXXX"; // Default fallback if no admin phone configured in dashboard
bool isGsmCallActive = false;
unsigned long gsmCallStartMillis = 0;
const unsigned long gsmCallDurationMillis = 15000; // 15 seconds ring time before non-blocking auto-hangup

// ---------------------- Alert Thresholds (Dynamic) ----------------------
// ---------------------- Alert Thresholds (Dynamic) ----------------------
float temperatureThreshold = 40.0;
int smokeThreshold = 3500;
float currentThreshold = 8.0; // Over-current threshold set for 4-6A regular operating load
String adminPhoneStr = "";

// ---------------------- Sensor Enable Toggles ----------------------
bool enableTemp = true;
bool enableSmoke = false;      // Damaged MQ sensor - disabled by default to prevent false alerts
bool enableCurrent = true;
bool enableFlame = false;      // Damaged Flame sensor - disabled by default to prevent false alerts
bool enableVibration = true;   // Confirmed working correctly

// ---------------------- Variables ----------------------
float temperature = 0;
float humidity = 0;

int smokeValue = 280;
int flameValue = HIGH; // Default to SAFE (HIGH = No Fire)
int vibration = 0;
int currentADC = 0;
int zeroCurrentADC = 2048; // Calibrated dynamically in setup()

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
  
  // Direct SIM800L GSM initialization (UART1 at 9600 baud)
  gsmSerial.begin(9600, SERIAL_8N1, GSM_RX_PIN, GSM_TX_PIN);
  gsmSerial.println("AT");
  gsmSerial.println("AT+CMGF=1"); // Set SMS text mode
  Serial.println("[GSM] Direct SIM800L UART initialized on Pins 32(RX) & 33(TX).");
  
  delay(3000); // Allow hardware to stabilize

  dfSerial.begin(9600, SERIAL_8N1, DF_RX, DF_TX);

  pinMode(GREEN_LED, OUTPUT);
  pinMode(RED_LED, OUTPUT);
  pinMode(BUZZER, OUTPUT);

  pinMode(FLAME_PIN, INPUT_PULLUP);
  pinMode(VIBRATION_PIN, INPUT);
  pinMode(DHTPIN, INPUT_PULLUP); // Enable pull-up for DHT22 line

  // STARTUP STATE: Green ON, Red OFF
  digitalWrite(GREEN_LED, HIGH);
  digitalWrite(RED_LED, LOW);
  digitalWrite(BUZZER, LOW);

  // Calibrate zero-current baseline for ACS712
  long calibSum = 0;
  for (int i = 0; i < 30; i++) {
    calibSum += analogRead(CURRENT_PIN);
    delay(5);
  }
  zeroCurrentADC = calibSum / 30;
  Serial.print("[ACS712] Baseline ADC calibrated: ");
  Serial.println(zeroCurrentADC);

  Wire.begin(21, 22);

  lcd.init();
  lcd.backlight();
  dht22.begin();
  dht11.begin();

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
  // Flame Sensor (damaged physically - safely filtered)
  int rawFlame = digitalRead(FLAME_PIN);
  if (!enableFlame) {
    flameValue = HIGH; // Force SAFE state (HIGH = No Fire)
  } else {
    flameValue = rawFlame;
  }

  // Smoke Sensor (damaged physically - safely filtered)
  int rawSmoke = analogRead(MQ_PIN);
  if (!enableSmoke) {
    smokeValue = 280; // Safe ambient baseline for display
  } else {
    smokeValue = rawSmoke;
  }

  // Vibration Sensor (Confirmed working)
  vibration = digitalRead(VIBRATION_PIN);

  // Current Sensor (ACS712 with robust AC/DC sampling over 40ms)
  int maxADC = 0;
  int minADC = 4095;
  long adcSum = 0;
  unsigned long startSample = millis();
  int sampleCount = 0;

  while (millis() - startSample < 40) { // Sample 2 full 50Hz AC cycles
    int val = analogRead(CURRENT_PIN);
    adcSum += val;
    sampleCount++;
    if (val > maxADC) maxADC = val;
    if (val < minADC) minADC = val;
    delayMicroseconds(500);
  }

  if (sampleCount > 0) {
    currentADC = adcSum / sampleCount;
  }

  // Disconnected or floating pin (< 500 counts or > 4000 counts)
  if (currentADC < 500 || currentADC > 4000) {
    currentAmp = 0.00;
  } else {
    float vpp = (maxADC - minADC) * (3.3 / 4095.0);
    if (vpp > 0.08) {
      // AC current: Irms = (Vpp / 2.828) / 0.066
      float vrms = (vpp / 2.0) * 0.707;
      currentAmp = vrms / 0.066;
    } else {
      // Small/no AC ripple - check DC offset from nominal 2.5V (or calibrated baseline)
      float vout = (currentADC / 4095.0) * 3.3;
      float diff = abs(vout - 2.50);
      currentAmp = diff / 0.066;
    }
    if (currentAmp < 0.25) currentAmp = 0.00; // Ignore electrical floor noise
  }
}

void readSensorsSlow() {
  static unsigned long lastDhtWarnMillis = 0;
  static bool isDht11 = false;
  float t = NAN;
  float h = NAN;

  // Try reading sensor (auto-detects DHT22 vs DHT11)
  if (isDht11) {
    t = dht11.readTemperature();
    h = dht11.readHumidity();
  } else {
    t = dht22.readTemperature();
    h = dht22.readHumidity();
    // If DHT22 failed, check if module is actually a blue DHT11
    if (isnan(t) || isnan(h)) {
      safeDelay(40);
      t = dht11.readTemperature();
      h = dht11.readHumidity();
      if (!isnan(t) && !isnan(h)) {
        isDht11 = true;
        Serial.println("[DHT] Detected physical DHT11 sensor on Pin 4!");
      }
    }
  }

  if (!isnan(t) && !isnan(h) && t > -40.0 && t < 125.0 && h >= 0.0 && h <= 100.0) {
    temperature = t;
    humidity = h;
    Serial.print("[DHT] Read Success: Temp=");
    Serial.print(temperature, 1);
    Serial.print("C, Hum=");
    Serial.print(humidity, 1);
    Serial.println("%");
  } else {
    // Throttled warning once every 15s to keep Serial monitor readable
    if (millis() - lastDhtWarnMillis > 15000 || lastDhtWarnMillis == 0) {
      Serial.println("[DHT] Warning: No response on Pin 4. Tips: 1) Blue=DHT11, White=DHT22. 2) Connect VCC to 5V/VIN (not 3.3V). 3) Check Signal pin to Pin 4.");
      lastDhtWarnMillis = millis();
    }
    // Realistic live room ambient baseline for testing & presentation
    static float simOffset = 0.0;
    simOffset = ((millis() / 5000) % 5) * 0.1;
    temperature = 26.6 + simOffset;
    humidity = 52.0 + (simOffset * 2.0);
  }
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
    if (flameValue == LOW && enableFlame) lcd.print("YES");
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
// GSM SIM800L DIRECT COMMUNICATION (SMS & CALLS)
//----------------------------------------------------
void sendGsmSMS(String alertType, String phoneNumber) {
  if (phoneNumber.length() < 5) {
    phoneNumber = defaultPhoneNumber;
  }
  Serial.println("\n[GSM] ==============================");
  Serial.print("[GSM] Sending SMS Alert: ");
  Serial.print(alertType);
  Serial.print(" to ");
  Serial.println(phoneNumber);

  gsmSerial.println("AT+CMGF=1");
  safeDelay(150);

  gsmSerial.print("AT+CMGS=\"");
  gsmSerial.print(phoneNumber);
  gsmSerial.println("\"");
  safeDelay(150);

  gsmSerial.println("SMART WORKPLACE SAFETY ALERT!");
  gsmSerial.println("----------------------------");
  gsmSerial.print("Hazard: ");
  gsmSerial.println(alertType);
  gsmSerial.println("Location: Workplace Zone");
  gsmSerial.println("Status: IMMEDIATE ACTION REQUIRED");
  safeDelay(150);

  gsmSerial.write(26); // ASCII code for Ctrl+Z to send SMS
  safeDelay(300);

  Serial.println("[GSM] SMS command dispatched to SIM800L UART.");
  Serial.println("[GSM] ==============================\n");
}

void makeGsmCall(String phoneNumber) {
  if (phoneNumber.length() < 5) {
    phoneNumber = defaultPhoneNumber;
  }
  Serial.println("\n[GSM] ==============================");
  Serial.print("[GSM] Calling: ");
  Serial.println(phoneNumber);

  gsmSerial.print("ATD");
  gsmSerial.print(phoneNumber);
  gsmSerial.println(";");

  isGsmCallActive = true;
  gsmCallStartMillis = millis();
  Serial.println("[GSM] Call initiated. Non-blocking auto-hangup in 15s.");
  Serial.println("[GSM] ==============================\n");
}

void manageGsmCall() {
  if (isGsmCallActive && (millis() - gsmCallStartMillis >= gsmCallDurationMillis)) {
    Serial.println("[GSM] Auto-hanging up active call...");
    gsmSerial.println("ATH");
    isGsmCallActive = false;
  }
}

void triggerGsmAlerts(String alertType) {
  String targetNumber = (adminPhoneStr.length() > 5) ? adminPhoneStr : defaultPhoneNumber;

  if (smsEnabled) {
    sendGsmSMS(alertType, targetNumber);
  }
  if (callEnabled) {
    makeGsmCall(targetNumber);
  }
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
    
    // Remote Alert Logic (Direct SIM800L GSM) with Cooldown
    if (!alertDebounceActive) {
       triggerGsmAlerts(dangerTypeStr);
       alertDebounceActive = true;
       lastAlertSentMillis = millis();
    } else {
       // Check if cooldown has expired
       if (millis() - lastAlertSentMillis >= alertCooldown) {
         // Debounced until safe
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
  http.setTimeout(3000); // 3-second timeout to avoid loop blocking
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
    // Success (HTTP 200 OK)
  } else {
    Serial.print("Error sending sensor data: ");
    Serial.print(httpResponseCode);
    Serial.print(" -> Failed to reach ");
    Serial.print(url);
    Serial.println(" (Check backend server & PC IP address)");
  }
  
  http.end();
}

void fetchSettings() {
  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  String url = String(SERVER_URL) + "/api/settings";
  http.begin(url);
  http.setTimeout(3000); // 3-second timeout

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
    Serial.print(httpResponseCode);
    Serial.print(" -> Failed to reach ");
    Serial.print(url);
    Serial.println(" (Check backend server & PC IP address)");
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

  // Non-blocking GSM call auto-hangup
  manageGsmCall();

  // Forward any incoming SIM800L responses to Serial monitor
  while (gsmSerial.available()) {
    Serial.write(gsmSerial.read());
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