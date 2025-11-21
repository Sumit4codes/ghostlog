# GhostLog Firmware Makefile
# For ARM Cortex-M microcontrollers

# Toolchain
PREFIX = arm-none-eabi-
CC = $(PREFIX)gcc
OBJCOPY = $(PREFIX)objcopy
SIZE = $(PREFIX)size

# Target
TARGET = ghostlog_demo

# MCU Configuration (Cortex-M4 example)
MCU = -mcpu=cortex-m4 -mthumb -mfloat-abi=soft

# Compiler flags
CFLAGS = $(MCU)
CFLAGS += -O2                    # Optimize for size
CFLAGS += -Wall -Wextra         # Enable warnings
CFLAGS += -ffunction-sections    # Place each function in its own section
CFLAGS += -fdata-sections        # Place each data in its own section
CFLAGS += -g                     # Generate debug info

# Linker flags
LDFLAGS = $(MCU)
LDFLAGS += -Wl,--gc-sections     # Remove unused sections
LDFLAGS += -Wl,-Map=$(TARGET).map # Generate map file

# Source files
SOURCES = ghostlog.c main.c

# Object files
OBJECTS = $(SOURCES:.c=.o)

# Default target
all: $(TARGET).elf $(TARGET).bin size

# Link
$(TARGET).elf: $(OBJECTS)
	@echo "Linking $@..."
	$(CC) $(LDFLAGS) $^ -o $@

# Compile
%.o: %.c
	@echo "Compiling $<..."
	$(CC) $(CFLAGS) -c $< -o $@

# Generate binary
$(TARGET).bin: $(TARGET).elf
	@echo "Generating binary $@..."
	$(OBJCOPY) -O binary $< $@

# Show size
size: $(TARGET).elf
	@echo ""
	@echo "Size summary:"
	$(SIZE) $<
	@echo ""

# Clean
clean:
	@echo "Cleaning build artifacts..."
	rm -f $(OBJECTS) $(TARGET).elf $(TARGET).bin $(TARGET).map

# For demo purposes on x86/x64 host (testing only)
demo: ghostlog.c main.c
	@echo "Building demo for host system (x86/x64)..."
	gcc -Wall -Wextra -O2 -g ghostlog.c main.c -o $(TARGET)_host
	@echo ""
	@echo "Run with: ./$(TARGET)_host"
	@echo ""

clean-demo:
	rm -f $(TARGET)_host

.PHONY: all clean size demo clean-demo
