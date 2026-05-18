package com.bensivan.aura

import android.os.Bundle
import androidx.activity.enableEdgeToEdge
import android.net.wifi.WifiManager
import android.content.Context

class MainActivity : TauriActivity() {
  private var multicastLock: WifiManager.MulticastLock? = null

  override fun onCreate(savedInstanceState: Bundle?) {
    enableEdgeToEdge()
    super.onCreate(savedInstanceState)

    try {
      val wifi = applicationContext.getSystemService(Context.WIFI_SERVICE) as WifiManager
      multicastLock = wifi.createMulticastLock("AuraMulticastLock")
      multicastLock?.setReferenceCounted(true)
      multicastLock?.acquire()
      android.util.Log.d("AuraNative", "Acquired Wi-Fi MulticastLock successfully!")
    } catch (e: Exception) {
      android.util.Log.e("AuraNative", "Failed to acquire MulticastLock", e)
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
