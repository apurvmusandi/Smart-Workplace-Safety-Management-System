# Smart Workplace Safety Management Project - Class Diagram

This document contains the class diagram for the system architecture, representing both backend services and the frontend state management.

![Class Diagram](./class_diagram-1.png)

```mermaid
classDiagram
    %% Backend Services & Controllers
    class DbService {
        -db: Database
        -DB_DIR: String
        -DB_PATH: String
        +ensureDbExists() void
        +initTables() void
        +getSettings() Settings
        +updateSettings(newSettings: Settings) Settings
        +getHistory(limit: int) HistoryEvent[]
        +addHistoryEvent(event: HistoryEvent) void
        +resolveHistoryEvent(type: String) HistoryEvent
        +getAnalytics() Object
    }

    class SensorController {
        +processSensorData(req, res) void
    }
    
    class APIRouter {
        +GET /health()
        +GET /settings()
        +PUT /settings()
        +POST /sensors/data()
        +GET /sensors/latest()
        +GET /alerts()
        +GET /alerts/history()
        +GET /analytics()
    }

    %% Data Models (Entities)
    class HistoryEvent {
        +id: String
        +timestamp: String
        +type: String
        +message: String
        +sensor: String
        +severity: String
        +value: String
        +threshold: String
        +status: String
        +resolvedAt: String
    }

    class Settings {
        +smsAlert: Boolean
        +callAlert: Boolean
        +simModuleEnabled: Boolean
        +adminPhone: String
        +supervisorPhone: String
        +thresholdTemp: Number
        +thresholdSmoke: Number
        +thresholdCurrent: Number
        +enableTemp: Boolean
        +enableSmoke: Boolean
        +enableCurrent: Boolean
        +enableFlame: Boolean
        +enableVibration: Boolean
    }

    class SensorData {
        +deviceId: String
        +temperature: Number
        +humidity: Number
        +smoke: Number
        +flame: Number
        +vibration: Number
        +current: Number
        +systemStatus: String
    }
    
    %% Frontend Main Context & Components
    class SocketContext {
        +socket: SocketIOClient
        +sensorData: SensorData
        +alerts: HistoryEvent[]
        +isConnected: Boolean
        +connect() void
        +disconnect() void
    }
    
    class UIComponents {
        <<Frontend Views>>
        +App()
        +Dashboard()
        +SensorCard()
        +Sidebar()
        +Header()
    }

    %% Relationships
    APIRouter --> SensorController : delegates to
    APIRouter --> DbService : uses
    SensorController --> DbService : interacts with
    SensorController --> SensorData : processes payload
    DbService "1" *-- "*" HistoryEvent : manages
    DbService "1" *-- "1" Settings : manages
    SocketContext ..> UIComponents : provides state to
    APIRouter ..> SocketContext : WebSockets (Socket.io)
```
