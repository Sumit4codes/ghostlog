/**
 * @file ghostlog.h
 * @brief GhostLog - Lightweight Embedded Crash Logger for Microcontrollers
 * 
 * GhostLog captures panic logs on crash, persists them to flash (simulated),
 * and uploads them to a server on the next reboot.
 * 
 * Features:
 * - <10KB code footprint
 * - No RTOS required
 * - No dynamic memory allocation
 * - Hardware-agnostic design
 * - Works without floating point support
 */

#ifndef GHOSTLOG_H
#define GHOSTLOG_H

#include <stdint.h>
#include <stddef.h>

/* Configuration Constants */
#define GHOSTLOG_MAX_LOG_SIZE       512     /* Maximum crash log message size */
#define GHOSTLOG_DEVICE_ID_SIZE     32      /* Device ID string size */
#define GHOSTLOG_VERSION_SIZE       16      /* Firmware version string size */
#define GHOSTLOG_MAX_TIMESTAMP      32      /* Timestamp string size */

/* Return codes */
#define GHOSTLOG_OK                 0
#define GHOSTLOG_ERR_NOT_INIT       -1
#define GHOSTLOG_ERR_NO_DATA        -2
#define GHOSTLOG_ERR_OVERFLOW       -3
#define GHOSTLOG_ERR_UPLOAD_FAIL    -4

/* Crash log structure */
typedef struct {
    char device_id[GHOSTLOG_DEVICE_ID_SIZE];
    char fw_version[GHOSTLOG_VERSION_SIZE];
    char timestamp[GHOSTLOG_MAX_TIMESTAMP];
    char crash_log[GHOSTLOG_MAX_LOG_SIZE];
    uint32_t has_data;          /* Flag: 1 if valid crash data exists */
    uint32_t crc32;             /* CRC32 checksum for data integrity */
} ghostlog_crash_t;

/* Configuration structure */
typedef struct {
    const char* device_id;      /* Unique device identifier */
    const char* fw_version;     /* Firmware version string */
    const char* server_url;     /* Backend server URL */
} ghostlog_config_t;

/**
 * @brief Initialize GhostLog library
 * 
 * Must be called once during system startup before any other GhostLog functions.
 * Checks for persisted crash logs from previous boot.
 * 
 * @param config Configuration structure with device ID, firmware version, and server URL
 * @return GHOSTLOG_OK on success, error code otherwise
 */
int ghostlog_init(const ghostlog_config_t* config);

/**
 * @brief Capture a panic/crash message
 * 
 * Call this from your panic handler or crash detection code.
 * The message is stored in RAM buffer for later persistence.
 * 
 * @param msg Crash message string (null-terminated)
 * @return GHOSTLOG_OK on success, error code otherwise
 */
int ghostlog_capture_panic(const char* msg);

/**
 * @brief Persist crash log to flash memory
 * 
 * In this implementation, flash is simulated using a RAM buffer.
 * In production, replace with actual flash write operations.
 * 
 * @return GHOSTLOG_OK on success, error code otherwise
 */
int ghostlog_persist_to_flash(void);

/**
 * @brief Upload crash log to server
 * 
 * Formats the crash log as JSON and sends it via HTTP POST.
 * Should be called on boot after initialization if a crash log exists.
 * 
 * @return GHOSTLOG_OK on success, error code otherwise
 */
int ghostlog_upload(void);

/**
 * @brief Check if a crash log is pending
 * 
 * @return 1 if crash data exists, 0 otherwise
 */
int ghostlog_has_pending_log(void);

/**
 * @brief Clear the stored crash log
 * 
 * Call after successful upload to free storage.
 * 
 * @return GHOSTLOG_OK on success
 */
int ghostlog_clear_log(void);

/**
 * @brief Get current timestamp (to be implemented by user)
 * 
 * User must implement this function to provide current time.
 * Format: ISO 8601 (e.g., "2025-11-22T02:40:51Z")
 * 
 * @param buffer Buffer to store timestamp string
 * @param size Size of buffer
 */
extern void ghostlog_get_timestamp(char* buffer, size_t size);

/**
 * @brief HTTP POST function (to be implemented by user)
 * 
 * User must implement this function for their platform.
 * Should perform HTTP POST request to the specified URL with JSON payload.
 * 
 * @param url Target URL
 * @param json_payload JSON string to send
 * @return 0 on success, non-zero on failure
 */
extern int ghostlog_http_post(const char* url, const char* json_payload);

#endif /* GHOSTLOG_H */
