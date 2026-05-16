package com.aura.app

import android.os.Bundle
import android.content.Context
import android.net.wifi.WifiManager
import androidx.activity.enableEdgeToEdge

class MainActivity : TauriActivity() {
  private var multicastLock: WifiManager.MulticastLock? = null

  override fun onCreate(savedInstanceState: Bundle?) {
    enableEdgeToEdge()
    super.onCreate(savedInstanceState)
    
    // Enable Multicast for libp2p mDNS
    val wifi = applicationContext.getSystemService(Context.WIFI_SERVICE) as WifiManager
    multicastLock = wifi.createMulticastLock("aura_mesh_lock")
    multicastLock?.setReferenceCounted(true)
    multicastLock?.acquire()
  }

  override fun onDestroy() {
    multicastLock?.release()
    multicastLock = null
    super.onDestroy()
  }
}
