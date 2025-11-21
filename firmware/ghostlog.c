/**
 * @file ghostlog.c
 * @brief GhostLog - Core Implementation
 * 
 * Lightweight crash logger for embedded systems.
 * All storage is static - no dynamic memory allocation.
 */

#include "ghostlog.h"
#include <string.h>
#include <stdio.h>

/* Internal state */
static ghostlog_crash_t g_crash_buffer;          /* Current crash data */
static ghostlog_crash_t g_flash_sim;             /* Simulated flash storage */
static ghostlog_config_t g_config;               /* Configuration */
static int g_initialized = 0;                     /* Initialization flag */

/* Internal helper functions */

/**
 * @brief Calculate CRC32 checksum
 * Simple CRC32 implementation for data integrity
 */
static uint32_t crc32_calculate(const uint8_t* data, size_t length) {
    uint32_t crc = 0xFFFFFFFF;
    
    for (size_t i = 0; i < length; i++) {
        crc ^= data[i];
        for (int j = 0; j < 8; j++) {
            if (crc & 1) {
                crc = (crc >> 1) ^ 0xEDB88320;
            } else {
                crc = crc >> 1;
            }
        }
    }
    
    return ~crc;
}

/**
 * @brief Validate crash log structure
 */
static int validate_crash_log(const ghostlog_crash_t* log) {
    if (!log->has_data) {
        return 0;
    }
    
    /* Calculate CRC excluding the crc32 field itself */
    uint32_t calculated_crc = crc32_calculate(
        (const uint8_t*)log, 
        sizeof(ghostlog_crash_t) - sizeof(uint32_t)
    );
    
    return (calculated_crc == log->crc32);
}

/**
 * @brief Update CRC32 for crash log
 */
static void update_crc(ghostlog_crash_t* log) {
    log->crc32 = crc32_calculate(
        (const uint8_t*)log,
        sizeof(ghostlog_crash_t) - sizeof(uint32_t)
    );
}

/* Public API Implementation */

int ghostlog_init(const ghostlog_config_t* config) {
    if (!config || !config->device_id || !config->fw_version || !config->server_url) {
        return GHOSTLOG_ERR_NOT_INIT;
    }
    
    /* Zero out buffers */
    memset(&g_crash_buffer, 0, sizeof(ghostlog_crash_t));
    memset(&g_flash_sim, 0, sizeof(ghostlog_crash_t));
    
    /* Store configuration */
    g_config.device_id = config->device_id;
    g_config.fw_version = config->fw_version;
    g_config.server_url = config->server_url;
    
    /* Check for persisted crash in simulated flash */
    /* In real implementation, read from actual flash here */
    if (validate_crash_log(&g_flash_sim)) {
        /* Copy from flash to working buffer */
        memcpy(&g_crash_buffer, &g_flash_sim, sizeof(ghostlog_crash_t));
    }
    
    g_initialized = 1;
    
    return GHOSTLOG_OK;
}

int ghostlog_capture_panic(const char* msg) {
    if (!g_initialized) {
        return GHOSTLOG_ERR_NOT_INIT;
    }
    
    if (!msg) {
        return GHOSTLOG_ERR_NO_DATA;
    }
    
    /* Clear buffer */
    memset(&g_crash_buffer, 0, sizeof(ghostlog_crash_t));
    
    /* Copy device info */
    strncpy(g_crash_buffer.device_id, g_config.device_id, GHOSTLOG_DEVICE_ID_SIZE - 1);
    strncpy(g_crash_buffer.fw_version, g_config.fw_version, GHOSTLOG_VERSION_SIZE - 1);
    
    /* Get timestamp from user-provided function */
    ghostlog_get_timestamp(g_crash_buffer.timestamp, GHOSTLOG_MAX_TIMESTAMP);
    
    /* Copy crash message */
    strncpy(g_crash_buffer.crash_log, msg, GHOSTLOG_MAX_LOG_SIZE - 1);
    
    /* Mark as having valid data */
    g_crash_buffer.has_data = 1;
    
    /* Update CRC */
    update_crc(&g_crash_buffer);
    
    return GHOSTLOG_OK;
}

int ghostlog_persist_to_flash(void) {
    if (!g_initialized) {
        return GHOSTLOG_ERR_NOT_INIT;
    }
    
    if (!g_crash_buffer.has_data) {
        return GHOSTLOG_ERR_NO_DATA;
    }
    
    /* Simulate flash write by copying to flash simulation buffer */
    /* In production: Replace with actual flash write API */
    /*
     * Example for STM32:
     * HAL_FLASH_Unlock();
     * HAL_FLASH_Program(FLASH_TYPEPROGRAM_WORD, addr, data);
     * HAL_FLASH_Lock();
     */
    
    memcpy(&g_flash_sim, &g_crash_buffer, sizeof(ghostlog_crash_t));
    
    return GHOSTLOG_OK;
}

int ghostlog_upload(void) {
    if (!g_initialized) {
        return GHOSTLOG_ERR_NOT_INIT;
    }
    
    if (!g_crash_buffer.has_data) {
        return GHOSTLOG_ERR_NO_DATA;
    }
    
    /* Format as JSON payload */
    char json_buffer[1024];
    int written = snprintf(json_buffer, sizeof(json_buffer),
        "{"
        "\"device_id\":\"%s\","
        "\"fw_version\":\"%s\","
        "\"timestamp\":\"%s\","
        "\"crash_log\":\"%s\""
        "}",
        g_crash_buffer.device_id,
        g_crash_buffer.fw_version,
        g_crash_buffer.timestamp,
        g_crash_buffer.crash_log
    );
    
    if (written >= sizeof(json_buffer)) {
        return GHOSTLOG_ERR_OVERFLOW;
    }
    
    /* Build full URL */
    char url[256];
    snprintf(url, sizeof(url), "%s/api/logs", g_config.server_url);
    
    /* Call user-provided HTTP POST function */
    int result = ghostlog_http_post(url, json_buffer);
    
    if (result != 0) {
        return GHOSTLOG_ERR_UPLOAD_FAIL;
    }
    
    return GHOSTLOG_OK;
}

int ghostlog_has_pending_log(void) {
    return (g_crash_buffer.has_data != 0);
}

int ghostlog_clear_log(void) {
    if (!g_initialized) {
        return GHOSTLOG_ERR_NOT_INIT;
    }
    
    /* Clear both buffers */
    memset(&g_crash_buffer, 0, sizeof(ghostlog_crash_t));
    memset(&g_flash_sim, 0, sizeof(ghostlog_crash_t));
    
    return GHOSTLOG_OK;
}
