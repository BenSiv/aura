package com.bensivan.aura

import android.os.Bundle
import androidx.activity.enableEdgeToEdge
import android.net.wifi.WifiManager
import android.content.Context
import android.content.Intent
import android.os.Build

class MainActivity : TauriActivity() {
  private var multicastLock: WifiManager.MulticastLock? = null

  override fun onCreate(savedInstanceState: Bundle?) {
    enableEdgeToEdge()
    super.onCreate(savedInstanceState)

    // Acquire Wi-Fi MulticastLock
    try {
      val wifi = applicationContext.getSystemService(Context.WIFI_SERVICE) as WifiManager
      multicastLock = wifi.createMulticastLock("AuraMulticastLock")
      multicastLock?.setReferenceCounted(true)
      multicastLock?.acquire()
      android.util.Log.d("AuraNative", "Acquired Wi-Fi MulticastLock successfully!")
    } catch (e: Exception) {
      android.util.Log.e("AuraNative", "Failed to acquire MulticastLock", e)
    }

    // Start Aura persistent Background Foreground Service
    try {
      val serviceIntent = Intent(this, AuraForegroundService::class.java)
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        startForegroundService(serviceIntent)
      } else {
        startService(serviceIntent)
      }
      android.util.Log.d("AuraNative", "Started AuraForegroundService successfully!")
    } catch (e: Exception) {
      android.util.Log.e("AuraNative", "Failed to start AuraForegroundService", e)
    }
  }

  override fun onDestroy() {
    try {
      if (multicastLock?.isHeld == true) {
        multicastLock?.release()
      }
    } catch (e: Exception) {
      android.util.Log.e("AuraNative", "Failed to release MulticastLock", e)
    }
    super.onDestroy()
  }
}
