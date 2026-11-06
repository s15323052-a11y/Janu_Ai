package ai.janu.app

import android.Manifest
import android.app.Activity
import android.app.admin.DevicePolicyManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import android.net.Uri
import android.webkit.JavascriptInterface
import android.webkit.WebChromeClient
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast

class MainActivity : Activity() {
    private lateinit var webView: WebView
    private var pendingOwnerToken: String? = null
    private val adminComponent by lazy { ComponentName(this, JanuDeviceAdminReceiver::class.java) }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        webView = WebView(this)
        webView.settings.javaScriptEnabled = true
        webView.settings.domStorageEnabled = true
        webView.settings.mediaPlaybackRequiresUserGesture = false
        webView.webChromeClient = WebChromeClient()
        webView.webViewClient = WebViewClient()
        webView.addJavascriptInterface(JanuBridge(), "JanuAndroid")
        setContentView(webView)
        webView.loadUrl("https://janu-ai-api.s15323052.workers.dev/")
    }

    inner class JanuBridge {
        @JavascriptInterface fun requestDeviceAdmin() {
            runOnUiThread {
                val intent = Intent(DevicePolicyManager.ACTION_ADD_DEVICE_ADMIN).apply {
                    putExtra(DevicePolicyManager.EXTRA_DEVICE_ADMIN, adminComponent)
                    putExtra(DevicePolicyManager.EXTRA_ADD_EXPLANATION, "JANU can lock this phone only when you give a clear lock command.")
                }
                startActivity(intent)
            }
        }

        @JavascriptInterface fun lockPhone(): Boolean {
            val manager = getSystemService(Context.DEVICE_POLICY_SERVICE) as DevicePolicyManager
            if (!manager.isAdminActive(adminComponent)) {
                requestDeviceAdmin()
                return false
            }
            manager.lockNow()
            return true
        }

        @JavascriptInterface fun startLockedListening(token: String) {
            runOnUiThread {
                if (token.isBlank() || token.length > 4096) {
                    Toast.makeText(this@MainActivity, "JANU owner session उपलब्ध नहीं है। फिर से sign in करें।", Toast.LENGTH_LONG).show()
                    return@runOnUiThread
                }
                pendingOwnerToken = token
                val missing = mutableListOf<String>()
                if (checkSelfPermission(Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) missing.add(Manifest.permission.RECORD_AUDIO)
                if (Build.VERSION.SDK_INT >= 33 && checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) missing.add(Manifest.permission.POST_NOTIFICATIONS)
                if (missing.isNotEmpty()) {
                    requestPermissions(missing.toTypedArray(), REQUEST_AUDIO_PERMISSIONS)
                } else startListeningService()
            }
        }

        @JavascriptInterface fun stopLockedListening() {
            stopService(Intent(this@MainActivity, JanuListeningService::class.java))
        }

        @JavascriptInterface fun openAppSettings() {
            startActivity(Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.parse("package:$packageName")))
        }
    }

    private fun startListeningService() {
        val token = pendingOwnerToken ?: return
        val intent = Intent(this, JanuListeningService::class.java).putExtra(JanuListeningService.EXTRA_OWNER_TOKEN, token)
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) startForegroundService(intent) else startService(intent)
            Toast.makeText(this, "JANU locked-screen listening चालू किया जा रहा है। Notification दिखाई देगी।", Toast.LENGTH_LONG).show()
        } catch (e: Exception) {
            Toast.makeText(this, "Listening शुरू नहीं हुई: ${e.message}", Toast.LENGTH_LONG).show()
        }
    }

    override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<out String>, grantResults: IntArray) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == REQUEST_AUDIO_PERMISSIONS) {
            if (grantResults.isNotEmpty() && grantResults.all { it == PackageManager.PERMISSION_GRANTED }) startListeningService()
            else Toast.makeText(this, "Locked-screen voice के लिए microphone और notification अनुमति जरूरी है।", Toast.LENGTH_LONG).show()
        }
    }

    companion object { private const val REQUEST_AUDIO_PERMISSIONS = 501 }
}
