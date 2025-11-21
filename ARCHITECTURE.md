# GhostLog Architecture & Integration Guide

## Table of Contents
1. [System Overview](#system-overview)
2. [How It Works](#how-it-works)
3. [Firmware Integration](#firmware-integration)
4. [Real-World Deployment](#real-world-deployment)
5. [Platform-Specific Examples](#platform-specific-examples)
6. [Best Practices](#best-practices)

---

## System Overview

GhostLog is a crash logging system for embedded devices consisting of three components:

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│  Embedded       │      │   Backend       │      │   Web           │
│  Device         │─────▶│   API           │◀─────│   Dashboard     │
│  (Firmware SDK) │ HTTP │   (Node.js)     │      │   (React)       │
└─────────────────┘      └─────────────────┘      └─────────────────┘
```

**Key Features:**
- **Zero-allocation** crash capture (no malloc during panic)
- **Persistent storage** in flash memory
- **Automatic upload** on next boot
- **Crash fingerprinting** for grouping identical issues
- **Beautiful dashboard** for visualization

---

## How It Works

### 1. Crash Capture Flow

```
Device Running → Crash Occurs → Capture Context → Save to Flash → Reboot
                                      ↓
                              Store Crash Info:
                              - Program Counter (PC)
                              - Link Register (LR)
                              - Stack Pointer (SP)
                              - Crash Reason
                              - Timestamp
```

### 2. Upload Flow (After Reboot)

```
Boot → Check Flash → Found Crash? → Format JSON → HTTP POST → Success?
         ↓              │ Yes                          │ Yes
    No Crash         Upload                         Clear Flash
         ↓              ↓                                ↓
     Normal         Retry Later                   Continue Running
```

### 3. Backend Processing

```
Receive Crash → Parse JSON → Calculate Fingerprint → Group Similar Crashes
                                    ↓                         ↓
                             SHA-1 Hash of:              SQLite Storage
                             - Crash Type                     ↓
                             - PC Address              Dashboard Display
                             - Error Message
```

---

## Firmware Integration

### Step 1: Include GhostLog SDK

```c
#include "ghostlog.h"
```

### Step 2: Initialize on Boot

```c
void system_init(void) {
    // Configure GhostLog
    ghostlog_config_t config = {
        .device_id = "DEVICE-12345",        // Unique device identifier
        .fw_version = "2.1.0",              // Current firmware version
        .server_url = "https://api.yourserver.com"
    };
    
    // Initialize
    if (ghostlog_init(&config) != GHOSTLOG_OK) {
        // Handle error
        return;
    }
    
    // Check for crash from previous boot
    if (ghostlog_has_pending_log()) {
        // Attempt upload
        if (ghostlog_upload() == GHOSTLOG_OK) {
            ghostlog_clear_log();  // Clear after successful upload
        }
        // If upload fails, will retry on next boot
    }
}
```

### Step 3: Capture Crashes

```c
void panic_handler(const char* reason) {
    // Capture crash information
    ghostlog_capture_panic(reason);
    
    // Persist to non-volatile storage immediately
    ghostlog_persist_to_flash();
    
    // Trigger system reset
    NVIC_SystemReset();  // For ARM Cortex-M
}
```

### Step 4: Implement Platform Functions

You must provide two platform-specific functions:

#### a) Timestamp Function

```c
void ghostlog_get_timestamp(char* buffer, size_t size) {
    // Get current time from RTC or network time
    time_t now = rtc_get_time();
    struct tm* tm_info = gmtime(&now);
    
    // Format as ISO 8601
    strftime(buffer, size, "%Y-%m-%dT%H:%M:%SZ", tm_info);
}
```

#### b) HTTP POST Function

```c
int ghostlog_http_post(const char* url, const char* json_payload) {
    // Use your platform's HTTP client
    // Example for ESP32:
    
    esp_http_client_config_t config = {
        .url = url,
        .method = HTTP_METHOD_POST,
    };
    
    esp_http_client_handle_t client = esp_http_client_init(&config);
    
    esp_http_client_set_header(client, "Content-Type", "application/json");
    esp_http_client_set_post_field(client, json_payload, strlen(json_payload));
    
    esp_err_t err = esp_http_client_perform(client);
    
    esp_http_client_cleanup(client);
    
    return (err == ESP_OK) ? 0 : -1;
}
```

---

## Real-World Deployment

### Network Connectivity Requirements

Devices need internet connectivity to upload crash logs. Common scenarios:

#### Scenario 1: Always-Connected Devices (WiFi/Cellular)
```
Device Boot → Check WiFi → Connect → Upload Crash → Continue
```

**Example:** Smart home devices, IoT sensors, industrial equipment

#### Scenario 2: Intermittently-Connected Devices
```
Device Boot → Store Crash → Wait for Connection → Upload When Available
```

**Example:** Wearables, remote sensors, mobile equipment

#### Scenario 3: Offline Devices with Gateway
```
Device → Local Gateway → Internet → Backend
         (BLE/Zigbee)    (WiFi/LTE)
```

**Example:** Mesh networks, sensor arrays

### Flash Storage Layout

GhostLog reserves a small portion of flash for crash logs:

```
┌─────────────────────────────────────┐
│ Application Code                    │  ← Your firmware
├─────────────────────────────────────┤
│ Application Data                    │  ← Your data
├─────────────────────────────────────┤
│ GhostLog Reserved (4KB typical)     │  ← Crash logs
│   - Header (256 bytes)              │
│   - Crash Log (up to 3.5KB)         │
│   - CRC32 Checksum (4 bytes)        │
└─────────────────────────────────────┘
```

**Why Flash?**
- Survives power loss and resets
- Non-volatile storage
- Available on all microcontrollers
- Fast write times

---

## Platform-Specific Examples

### ESP32 (WiFi)

```c
#include "ghostlog.h"
#include "esp_http_client.h"
#include "esp_wifi.h"

void app_main(void) {
    // Initialize WiFi
    wifi_init_sta();
    
    // Wait for connection
    while (!wifi_is_connected()) {
        vTaskDelay(100 / portTICK_PERIOD_MS);
    }
    
    // Initialize GhostLog
    ghostlog_config_t config = {
        .device_id = get_device_mac(),
        .fw_version = "1.0.0",
        .server_url = "https://crashlog.example.com"
    };
    ghostlog_init(&config);
    
    // Check and upload crash
    if (ghostlog_has_pending_log()) {
        if (ghostlog_upload() == GHOSTLOG_OK) {
            ESP_LOGI(TAG, "Crash uploaded successfully");
            ghostlog_clear_log();
        }
    }
}

// HTTP implementation for ESP32
int ghostlog_http_post(const char* url, const char* json_payload) {
    esp_http_client_config_t config = {
        .url = url,
        .timeout_ms = 5000,
    };
    
    esp_http_client_handle_t client = esp_http_client_init(&config);
    esp_http_client_set_method(client, HTTP_METHOD_POST);
    esp_http_client_set_header(client, "Content-Type", "application/json");
    esp_http_client_set_post_field(client, json_payload, strlen(json_payload));
    
    esp_err_t err = esp_http_client_perform(client);
    int status = esp_http_client_get_status_code(client);
    
    esp_http_client_cleanup(client);
    
    return (err == ESP_OK && status == 200) ? 0 : -1;
}
```

### STM32 (Cellular)

```c
#include "ghostlog.h"
#include "sim7600.h"  // Cellular modem

void SystemInit(void) {
    // Initialize cellular modem
    sim7600_init();
    sim7600_connect_gprs("internet");
    
    // Initialize GhostLog
    ghostlog_config_t config = {
        .device_id = get_unique_id(),
        .fw_version = FW_VERSION,
        .server_url = "https://api.crashlog.com"
    };
    ghostlog_init(&config);
    
    // Upload crash if exists
    if (ghostlog_has_pending_log()) {
        retry_upload_with_backoff();
    }
}

// HTTP over cellular
int ghostlog_http_post(const char* url, const char* json) {
    // Use AT commands to send HTTP POST
    char cmd[512];
    snprintf(cmd, sizeof(cmd), 
             "AT+HTTPPOST=\"%s\",\"%s\"", url, json);
    
    return sim7600_send_at_command(cmd);
}
```

### Nordic nRF52 (BLE → Gateway)

```c
#include "ghostlog.h"
#include "ble_nus.h"  // Nordic UART Service

// Buffer crash locally, upload via BLE when connected
void ble_connected_handler(void) {
    if (ghostlog_has_pending_log()) {
        // Read crash log
        char json[GHOSTLOG_MAX_SIZE];
        ghostlog_read_json(json, sizeof(json));
        
        // Send via BLE to gateway
        ble_nus_data_send(json, strlen(json));
        
        // Gateway forwards to backend
    }
}

// No direct HTTP - gateway handles upload
int ghostlog_http_post(const char* url, const char* json) {
    // Not used - BLE transfer instead
    (void)url;
    (void)json;
    return 0;
}
```

---

## Best Practices

### 1. **Minimize Crash Handler Work**

```c
// ✅ GOOD: Minimal work
void panic_handler(const char* msg) {
    ghostlog_capture_panic(msg);
    ghostlog_persist_to_flash();
    NVIC_SystemReset();
}

// ❌ BAD: Doing too much
void panic_handler(const char* msg) {
    send_led_pattern();          // Don't do this
    play_buzzer_sound();         // Don't do this
    try_to_upload_now();         // Definitely don't do this
    ghostlog_capture_panic(msg);
}
```

### 2. **Handle Upload Failures Gracefully**

```c
void upload_crash_with_retry(void) {
    int retry_count = 0;
    const int max_retries = 3;
    
    while (retry_count < max_retries) {
        if (ghostlog_upload() == GHOSTLOG_OK) {
            ghostlog_clear_log();
            return;
        }
        
        retry_count++;
        vTaskDelay(pdMS_TO_TICKS(1000 * retry_count));  // Exponential backoff
    }
    
    // Don't clear - will retry on next boot
}
```

### 3. **Secure Your Backend Communication**

```c
// Use HTTPS in production
ghostlog_config_t config = {
    .device_id = device_id,
    .fw_version = fw_version,
    .server_url = "https://api.yourserver.com"  // Use HTTPS!
};

// Add certificate verification
esp_http_client_config_t http_config = {
    .url = config.server_url,
    .cert_pem = server_cert_pem,  // Your server's certificate
    .timeout_ms = 10000,
};
```

### 4. **Include Useful Context**

```c
// Add more context to crash messages
char crash_msg[256];
snprintf(crash_msg, sizeof(crash_msg),
         "panic: null deref at %s:%d | heap_free=%lu | uptime=%lu",
         __FILE__, __LINE__, 
         heap_caps_get_free_size(MALLOC_CAP_8BIT),
         xTaskGetTickCount());

ghostlog_capture_panic(crash_msg);
```

### 5. **Test Crash Recovery**

```c
// Add a test mode to simulate crashes
#ifdef DEBUG_MODE
void test_crash_recovery(void) {
    ghostlog_capture_panic("TEST: simulated crash");
    ghostlog_persist_to_flash();
    // Don't reset - just check flash
    
    if (ghostlog_has_pending_log()) {
        printf("✅ Crash persisted correctly\n");
    }
}
#endif
```

### 6. **Monitor Backend Health**

```c
// Periodically check backend availability
void check_backend_health(void) {
    char* health_url = "https://api.yourserver.com/health";
    
    // Simple GET request
    if (http_get(health_url) == 200) {
        backend_is_available = true;
    } else {
        // Maybe defer uploads until backend is back
        backend_is_available = false;
    }
}
```

---

## API Endpoints

### Submit Crash Log
```http
POST /api/logs
Content-Type: application/json

{
  "device_id": "DEVICE-001",
  "fw_version": "1.2.0",
  "crash_log": "panic: null pointer\nPC: 0x08001234",
  "timestamp": "2025-11-22T04:00:00Z"
}

Response: 200 OK
{
  "success": true,
  "crash_id": 42,
  "fingerprint": "7997c9bb105f...",
  "crash_type": "panic"
}
```

### Get Device Crashes
```http
GET /api/logs/device/DEVICE-001

Response: 200 OK
[
  {
    "id": 1,
    "device_id": "DEVICE-001",
    "fw_version": "1.2.0",
    "crash_log": "...",
    "timestamp": "2025-11-22T04:00:00Z",
    "fingerprint": "..."
  }
]
```

### Get Crash Groups
```http
GET /api/crashes/groups

Response: 200 OK
{
  "groups": [
    {
      "fingerprint": "7997c9bb...",
      "crash_type": "panic",
      "count": 15,
      "affected_devices": "DEVICE-001,DEVICE-003,...",
      "affected_devices_count": 5,
      "first_seen": "2025-11-20T10:00:00Z",
      "last_seen": "2025-11-22T04:00:00Z"
    }
  ]
}
```

---

## Security Considerations

1. **Device Authentication**: Add API keys or JWT tokens for device authentication
2. **HTTPS Only**: Always use encrypted connections in production
3. **Rate Limiting**: Prevent malicious devices from flooding your backend
4. **Input Validation**: Backend validates all crash log data
5. **Access Control**: Dashboard should require authentication
6. **Data Privacy**: Ensure crash logs don't leak sensitive user data

---

## Performance Metrics

- **Flash Write Time**: ~10-50ms (device-dependent)
- **HTTP Upload Time**: ~500ms - 2s (network-dependent)
- **Memory Footprint**: <10KB (configured for minimal RAM usage)
- **Storage Required**: 4KB flash per device

---

## Troubleshooting

### Crash Not Uploading?

1. Check WiFi/cellular connection
2. Verify backend URL is correct
3. Check backend logs for errors
4. Enable debug logging in firmware
5. Test with curl from command line

### Flash Not Persisting?

1. Verify flash page is not write-protected
2. Check flash erase/write succeeded
3. Validate CRC checksum on read
4. Ensure sufficient flash space allocated

### Dashboard Not Showing Crashes?

1. Check browser console for API errors
2. Verify backend is running (`GET /health`)
3. Check CORS configuration
4. Inspect network tab for failed requests

---

## Summary

GhostLog provides a complete crash logging solution for embedded devices:

✅ **Firmware SDK**: Zero-allocation crash capture  
✅ **Backend API**: Crash storage and grouping  
✅ **Web Dashboard**: Beautiful visualization  

By integrating GhostLog into your embedded devices, you gain valuable insights into field failures and can quickly identify and fix issues affecting your users.
