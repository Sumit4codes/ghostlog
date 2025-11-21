/**
 * @file main.c
 * @brief GhostLog Demo Application
 * 
 * Demonstrates GhostLog usage on embedded systems.
 * Simulates crash scenarios and upload functionality.
 */

#include "ghostlog.h"
#include <stdio.h>
#include <time.h>
#include <string.h>

/* Simulated device configuration */
#define DEVICE_ID       "GHOST-DEV-001"
#define FW_VERSION      "1.0.0"
#define SERVER_URL      "http://localhost:3000"

/* Button simulation */
static volatile int g_button_pressed = 0;

/**
 * @brief User-provided timestamp function
 * Required by GhostLog library
 */
void ghostlog_get_timestamp(char* buffer, size_t size) {
    time_t now = time(NULL);
    struct tm* tm_info = gmtime(&now);
    
    /* Format as ISO 8601 */
    strftime(buffer, size, "%Y-%m-%dT%H:%M:%SZ", tm_info);
}

/**
 * @brief User-provided HTTP POST function
 * Required by GhostLog library
 * 
 * In a real embedded system, this would use:
 * - ESP32: esp_http_client
 * - STM32: custom HTTP over TCP/IP stack
 * - Nordic: http_client library
 */
int ghostlog_http_post(const char* url, const char* json_payload) {
    printf("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    printf("📤 HTTP POST to: %s\n", url);
    printf("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    printf("Payload:\n%s\n", json_payload);
    printf("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n");
    
    /* Simulate successful upload */
    /* In production, implement actual HTTP client here */
    return 0;
}

/**
 * @brief Simulate button interrupt
 */
void simulate_button_press(void) {
    g_button_pressed = 1;
}

/**
 * @brief Panic handler - called when system crashes
 */
void panic_handler(const char* reason) {
    printf("\n🔥 PANIC DETECTED: %s\n", reason);
    
    /* Capture the panic */
    ghostlog_capture_panic(reason);
    
    /* Persist to flash immediately */
    ghostlog_persist_to_flash();
    
    printf("💾 Crash log saved to flash\n");
    printf("🔄 System will reboot...\n\n");
    
    /* In real system: trigger watchdog reset or NVIC_SystemReset() */
}

/**
 * @brief Simulate system boot sequence
 */
void system_boot(void) {
    printf("\n");
    printf("╔══════════════════════════════════════════════════╗\n");
    printf("║           GhostLog Demo - System Boot           ║\n");
    printf("╚══════════════════════════════════════════════════╝\n");
    printf("Device ID:  %s\n", DEVICE_ID);
    printf("FW Version: %s\n", FW_VERSION);
    printf("Server URL: %s\n\n", SERVER_URL);
    
    /* Configure GhostLog */
    ghostlog_config_t config = {
        .device_id = DEVICE_ID,
        .fw_version = FW_VERSION,
        .server_url = SERVER_URL
    };
    
    /* Initialize GhostLog */
    int ret = ghostlog_init(&config);
    if (ret != GHOSTLOG_OK) {
        printf("❌ GhostLog init failed: %d\n", ret);
        return;
    }
    
    printf("✅ GhostLog initialized\n\n");
    
    /* Check for pending crash logs */
    if (ghostlog_has_pending_log()) {
        printf("⚠️  Found crash log from previous boot!\n");
        printf("📡 Uploading to server...\n");
        
        ret = ghostlog_upload();
        if (ret == GHOSTLOG_OK) {
            printf("✅ Upload successful\n");
            ghostlog_clear_log();
            printf("🗑️  Crash log cleared\n\n");
        } else {
            printf("❌ Upload failed: %d\n", ret);
            printf("   Will retry on next boot\n\n");
        }
    } else {
        printf("ℹ️  No pending crash logs\n\n");
    }
}

/**
 * @brief Main application loop
 */
void app_main_loop(void) {
    printf("╔══════════════════════════════════════════════════╗\n");
    printf("║              Application Running                 ║\n");
    printf("╚══════════════════════════════════════════════════╝\n");
    printf("Press ENTER to simulate crash (button press)...\n\n");
    
    /* Wait for button press (simulated via ENTER key) */
    getchar();
    simulate_button_press();
    
    if (g_button_pressed) {
        printf("\n🔘 Button pressed - triggering crash!\n");
        panic_handler("panic: null pointer dereference at 0x08001234");
    }
}

/**
 * @brief Main entry point
 */
int main(void) {
    /* Scenario 1: First boot - no crash */
    system_boot();
    app_main_loop();
    
    /* After panic, simulate reboot */
    printf("\n");
    printf("════════════════════════════════════════════════════\n");
    printf("           SIMULATED SYSTEM REBOOT\n");
    printf("════════════════════════════════════════════════════\n");
    
    /* Scenario 2: Boot after crash - will upload log */
    system_boot();
    
    printf("╔══════════════════════════════════════════════════╗\n");
    printf("║           Application Running Normally           ║\n");
    printf("╚══════════════════════════════════════════════════╝\n");
    printf("System recovered successfully!\n\n");
    
    printf("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    printf("✅ Demo completed successfully\n");
    printf("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n");
    
    return 0;
}
