# GhostLog Firmware SDK

Lightweight embedded crash logger for ARM Cortex-M microcontrollers.

## 📋 Features

- ✅ **Minimal footprint**: <10KB code size
- ✅ **No RTOS**: Works on bare-metal systems
- ✅ **No dynamic memory**: All allocations are static
- ✅ **Hardware-agnostic**: Portable across Cortex-M platforms
- ✅ **No floating-point**: Works on MCUs without FPU
- ✅ **Crash persistence**: Survives reboots via flash storage
- ✅ **Automatic upload**: Sends logs to backend on boot

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│         Application Code                │
│  (calls ghostlog_capture_panic)         │
└───────────────┬─────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│         GhostLog Library                │
│  ┌────────────────────────────────┐     │
│  │  ghostlog_init()               │     │
│  │  ghostlog_capture_panic()      │     │
│  │  ghostlog_persist_to_flash()   │     │
│  │  ghostlog_upload()             │     │
│  └────────────────────────────────┘     │
└───────────────┬─────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│  Platform-Specific Implementations      │
│  (provided by user)                     │
│  ┌────────────────────────────────┐     │
│  │  ghostlog_get_timestamp()      │     │
│  │  ghostlog_http_post()          │     │
│  └────────────────────────────────┘     │
└─────────────────────────────────────────┘
```

## 📦 Files

| File | Description |
|------|-------------|
| `ghostlog.h` | Public API header |
| `ghostlog.c` | Core implementation |
| `main.c` | Demo application |
| `Makefile` | Build configuration |

## 🚀 Quick Start

### Prerequisites

**For ARM Cortex-M:**
```bash
sudo apt-get install gcc-arm-none-eabi
```

**For x86 demo:**
```bash
sudo apt-get install gcc
```

### Build for ARM Cortex-M

```bash
make clean
make
```

This generates:
- `ghostlog_demo.elf` - ELF executable
- `ghostlog_demo.bin` - Binary for flashing
- `ghostlog_demo.map` - Memory map

### Build Demo for Host (Testing)

```bash
make demo
./ghostlog_demo_host
```

## 📖 Usage

### 1. Initialize on Boot

```c
#include "ghostlog.h"

void system_init(void) {
    ghostlog_config_t config = {
        .device_id = "MCU-001",
        .fw_version = "1.0.0",
        .server_url = "http://example.com"
    };
    
    ghostlog_init(&config);
    
    // Check for crash from previous boot
    if (ghostlog_has_pending_log()) {
        ghostlog_upload();
        ghostlog_clear_log();
    }
}
```

### 2. Capture Panic

```c
void hard_fault_handler(void) {
    ghostlog_capture_panic("HardFault: invalid memory access");
    ghostlog_persist_to_flash();
    
    // Trigger system reset
    NVIC_SystemReset();
}
```

### 3. Implement Platform Functions

You must provide these two functions:

```c
/* Get current time in ISO 8601 format */
void ghostlog_get_timestamp(char* buffer, size_t size) {
    // Use RTC, NTP, or system timer
    snprintf(buffer, size, "2025-11-22T02:40:51Z");
}

/* Send HTTP POST request */
int ghostlog_http_post(const char* url, const char* json_payload) {
    // Use your HTTP client library
    // Return 0 on success, non-zero on failure
}
```

## 🔧 Configuration

Edit `ghostlog.h` to adjust:

```c
#define GHOSTLOG_MAX_LOG_SIZE       512   /* Max crash message size */
#define GHOSTLOG_DEVICE_ID_SIZE     32    /* Device ID length */
#define GHOSTLOG_VERSION_SIZE       16    /* Version string length */
```

## 💾 Flash Simulation

This implementation simulates flash using RAM. For production:

**STM32:**
```c
int ghostlog_persist_to_flash(void) {
    HAL_FLASH_Unlock();
    HAL_FLASH_Program(FLASH_TYPEPROGRAM_WORD, addr, data);
    HAL_FLASH_Lock();
}
```

**ESP32:**
```c
int ghostlog_persist_to_flash(void) {
    esp_partition_write(partition, offset, &g_crash_buffer, size);
}
```

**Nordic nRF:**
```c
int ghostlog_persist_to_flash(void) {
    nrf_nvmc_write_bytes(address, &g_crash_buffer, size);
}
```

## 📊 Memory Usage

Typical footprint (ARM Cortex-M4, -O2):

| Component | Size |
|-----------|------|
| Code (text) | ~4 KB |
| Data (bss) | ~1.5 KB |
| Stack (estimated) | ~0.5 KB |
| **Total** | **~6 KB** |

## 🧪 Testing

The demo application simulates:
1. System boot
2. Button press → crash
3. System reboot
4. Crash log upload

Run the demo to see the complete flow.

## 🔒 Data Integrity

GhostLog uses CRC32 checksums to verify crash log integrity:
- Calculated on write
- Validated on read
- Prevents corrupted data upload

## 🌐 HTTP Integration

Example integrations for popular platforms:

### ESP32 (ESP-IDF)
```c
#include "esp_http_client.h"

int ghostlog_http_post(const char* url, const char* json) {
    esp_http_client_config_t config = { .url = url };
    esp_http_client_handle_t client = esp_http_client_init(&config);
    
    esp_http_client_set_method(client, HTTP_METHOD_POST);
    esp_http_client_set_header(client, "Content-Type", "application/json");
    esp_http_client_set_post_field(client, json, strlen(json));
    
    esp_err_t err = esp_http_client_perform(client);
    esp_http_client_cleanup(client);
    
    return (err == ESP_OK) ? 0 : -1;
}
```

### STM32 with LwIP
```c
#include "lwip/tcp.h"

int ghostlog_http_post(const char* url, const char* json) {
    // Parse URL, create TCP connection
    // Send HTTP headers + JSON payload
    // Wait for response
    return 0;
}
```

## 📝 License

MIT License - Free to use in commercial and open-source projects.

## 🤝 Contributing

For production use, consider adding:
- Secure HTTPS support
- Retry mechanism with exponential backoff
- Multiple crash log buffering
- Compression for large logs
