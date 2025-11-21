# 🔥 GhostLog - Embedded Crash Logger

GhostLog is a lightweight embedded crash logging system for microcontrollers that captures panic logs on crash, persists them to flash, and uploads them to a cloud backend on the next reboot.

## 🏗️ Architecture

```
┌─────────────────┐
│  Microcontroller │
│   (Firmware)     │ ──── Crash ────> Persist to Flash
│                  │
└────────┬─────────┘
         │ Reboot
         │
         ├─── Upload ───> ┌──────────────┐
                          │   Backend    │
                          │  (Node.js)   │
                          └──────┬───────┘
                                 │
                          ┌──────┴───────┐
                          │   Frontend   │
                          │   (React)    │
                          └──────────────┘
```

**📖 For detailed architecture and real-world integration guide, see [ARCHITECTURE.md](ARCHITECTURE.md)**


## 📦 Components

### 1. Firmware SDK (C for Cortex-M)
- **Location**: `firmware/`
- **Features**:
  - Hardware-agnostic crash capture
  - Flash persistence simulation
  - HTTP upload on boot
  - <10KB footprint
  - No RTOS, no dynamic memory
- **See**: [firmware/README.md](firmware/README.md)

### 2. Backend API (Node.js + SQLite)
- **Location**: `backend/`
- **Features**:
  - REST API for log ingestion
  - Crash fingerprinting (SHA-1)
  - Automatic crash grouping
  - Device management
- **See**: [backend/README.md](backend/README.md)

### 3. Dashboard (React + Tailwind)
- **Location**: `frontend/`
- **Features**:
  - Device list view
  - Crash log visualization
  - Grouped crash analysis
  - Crash trends chart
- **See**: [frontend/README.md](frontend/README.md)

## 🚀 Quick Start

### Prerequisites
- **Firmware**: ARM GCC toolchain (`arm-none-eabi-gcc`)
- **Backend**: Node.js 18+ and npm
- **Frontend**: Node.js 18+ and npm

### 1. Start Backend
```bash
cd backend
npm install
npm start
# Server runs on http://localhost:3000
```

### 2. Start Frontend
```bash
cd frontend
npm install
npm run dev
# Dashboard runs on http://localhost:5173
```

### 3. Build Firmware
```bash
cd firmware
make
# Generates ghostlog_demo.elf
```

## 📊 Database Schema

### Devices Table
| Column | Type | Description |
|--------|------|-------------|
| device_id | TEXT | Unique device identifier |
| first_seen | TEXT | First connection timestamp |
| last_seen | TEXT | Last connection timestamp |
| fw_version | TEXT | Firmware version |

### Crashes Table
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Auto-increment ID |
| device_id | TEXT | Device identifier |
| timestamp | TEXT | Crash timestamp |
| fw_version | TEXT | Firmware version |
| fingerprint | TEXT | SHA-1 hash of crash log |
| crash_log | TEXT | Full crash log text |

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/logs` | Submit crash log |
| GET | `/api/logs` | Get all logs |
| GET | `/api/logs/device/:id` | Get device-specific logs |
| GET | `/api/devices` | List all devices |
| GET | `/api/crashes/groups` | Get grouped crashes |

## 🎯 Features

### Firmware
- ✅ Minimal memory footprint (<10KB)
- ✅ Works without RTOS or floating-point
- ✅ Simulated flash persistence
- ✅ HTTP POST for log upload
- ✅ Boot-time crash detection

### Backend
- ✅ SQLite database
- ✅ Crash fingerprinting
- ✅ Automatic deduplication
- ✅ Device tracking
- ✅ RESTful API

### Frontend
- ✅ Modern React UI
- ✅ Tailwind CSS styling
- ✅ Real-time crash visualization
- ✅ Device management
- ✅ Crash trend charts

## 📝 License

MIT License - See individual component READMEs for details.

## 🤝 Contributing

This is a prototype implementation. For production use, consider:
- Actual flash persistence implementation
- Authentication and authorization
- Rate limiting and input validation
- Secure HTTPS communication
- Production-grade error handling
