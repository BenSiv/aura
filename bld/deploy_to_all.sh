#!/bin/bash
echo "Searching for connected Android devices..."
DEVICES=$(adb devices | grep -v "List" | grep "device$" | awk '{print $1}')

if [ -z "$DEVICES" ]; then
    echo "Error: No authorized devices found. Please check USB debugging and authorization."
    exit 1
fi

for SERIAL in $DEVICES; do
    MODEL=$(adb -s $SERIAL shell getprop ro.product.model)
    ABI=$(adb -s $SERIAL shell getprop ro.product.cpu.abi)
    echo "Found $MODEL ($SERIAL) with architecture: $ABI"
    
    # We use the universal debug APK which supports multiple ABIs or the specific aarch64 one
    APK="pub/aura-debug.apk"
    
    if [ ! -f "$APK" ]; then
        echo "Error: $APK not found. Please build the app first."
        exit 1
    fi

    echo "Installing Aura to $MODEL..."
    adb -s $SERIAL push $APK /data/local/tmp/aura.apk
    adb -s $SERIAL shell pm install -r /data/local/tmp/aura.apk
    adb -s $SERIAL shell rm /data/local/tmp/aura.apk
    echo "Installation complete for $MODEL!"
done
