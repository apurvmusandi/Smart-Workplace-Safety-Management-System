#include <SoftwareSerial.h>

// SIM800L serial pins
#define SIM800_RX_PIN 10
#define SIM800_TX_PIN 11

SoftwareSerial sim800(SIM800_RX_PIN, SIM800_TX_PIN);

// Default phone number if none provided
String defaultPhoneNumber = "+91XXXXXXXXXX";
String dynamicPhoneNumber = "";

// Variables for reading from ESP32
String inputString = "";
bool stringComplete = false;

void setup() {
  // Initialize hardware serial for communication with ESP32
  Serial.begin(115200);
  
  // Initialize software serial for communication with SIM800L
  sim800.begin(9600);
  
  Serial.println("Arduino UNO ready. Initializing SIM800L...");
  
  // Basic SIM800L initialization
  sim800.println("AT");
  delay(1000);
  sim800.println("AT+CMGF=1"); // Set SMS mode to text
  delay(1000);
  
  Serial.println("Initialization complete.");
  inputString.reserve(200);
}

void loop() {
  if (stringComplete) {
    processCommand(inputString);
    inputString = "";
    stringComplete = false;
  }
}

void serialEvent() {
  while (Serial.available()) {
    char inChar = (char)Serial.read();
    if (inChar == '\n') {
      stringComplete = true;
    } else if (inChar != '\r') {
      inputString += inChar;
    }
  }
}

void processCommand(String command) {
  Serial.print("Received: ");
  Serial.println(command);
  
  // Example format: ALERT|FIRE|SMS=1|CALL=0
  if (command.startsWith("ALERT|")) {
    int firstPipe = command.indexOf('|');
    int secondPipe = command.indexOf('|', firstPipe + 1);
    int thirdPipe = command.indexOf('|', secondPipe + 1);
    
    if (firstPipe > 0 && secondPipe > 0 && thirdPipe > 0) {
      // Format: ALERT|FIRE|SMS=1|CALL=0|NUM=+918999259299
      String alertType = command.substring(firstPipe + 1, secondPipe);
      String smsPart = command.substring(secondPipe + 1, thirdPipe);
      
      int fourthPipe = command.indexOf('|', thirdPipe + 1);
      String callPart = "";
      
      if (fourthPipe > 0) {
        callPart = command.substring(thirdPipe + 1, fourthPipe);
        String numPart = command.substring(fourthPipe + 1);
        if (numPart.startsWith("NUM=")) {
          dynamicPhoneNumber = numPart.substring(4);
        }
      } else {
        callPart = command.substring(thirdPipe + 1);
      }
      
      bool doSMS = smsPart.endsWith("1");
      bool doCall = callPart.endsWith("1");
      
      String targetNumber = (dynamicPhoneNumber.length() > 5) ? dynamicPhoneNumber : defaultPhoneNumber;
      
      if (doSMS) {
        sendSMS(alertType, targetNumber);
      }
      if (doCall) {
        makeCall(targetNumber);
      }
    }
  } else if (command == "PING") {
    Serial.println("PONG");
  } else if (command.startsWith("TEST|")) {
    String testType = command.substring(5);
    String targetNumber = (dynamicPhoneNumber.length() > 5) ? dynamicPhoneNumber : defaultPhoneNumber;
    
    if (testType == "SMS") {
      sendSMS("TEST", targetNumber);
    } else if (testType == "CALL") {
      makeCall(targetNumber);
    } else if (testType == "BOTH") {
      sendSMS("TEST", targetNumber);
      makeCall(targetNumber);
    }
  }
}

void sendSMS(String alertType, String phoneNumber) {
  Serial.println("Sending SMS to: " + phoneNumber);
  sim800.println("AT+CMGF=1"); 
  delay(500);
  
  sim800.print("AT+CMGS=\"");
  sim800.print(phoneNumber);
  sim800.println("\"");
  delay(500);
  
  sim800.print("SMART WORKPLACE SAFETY ALERT\n\n");
  sim800.print("Alert: ");
  sim800.println(alertType);
  sim800.print("Location: Workplace\n\nPlease check immediately.");
  
  delay(500);
  sim800.write(26); // ASCII code for Ctrl+Z
  delay(3000); // Wait for SMS to send
  Serial.println("SMS sent successfully (or attempted).");
}

void makeCall(String phoneNumber) {
  Serial.println("Making phone call to: " + phoneNumber);
  sim800.print("ATD");
  sim800.print(phoneNumber);
  sim800.println(";");
  
  // Wait ~15 seconds to let it ring
  delay(15000);
  
  Serial.println("Hanging up...");
  sim800.println("ATH");
  delay(1000);
}
