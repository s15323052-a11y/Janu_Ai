package ai.janu.app

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.app.admin.DevicePolicyManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener
import android.util.Base64
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import java.util.Locale
import java.util.concurrent.Executors

class JanuListeningService : Service(), RecognitionListener, TextToSpeech.OnInitListener {
    private val main = Handler(Looper.getMainLooper())
    private val network = Executors.newSingleThreadExecutor()
    private var recognizer: SpeechRecognizer? = null
    private var tts: TextToSpeech? = null
    private var ownerToken = ""
    private var ready = false
    private var speaking = false
    private var stopped = false

    override fun onCreate() {
        super.onCreate()
        createChannel()
        startForeground(NOTIFICATION_ID, buildNotification())
        tts = TextToSpeech(this, this)
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        if (intent?.action == ACTION_STOP) { stopSelf(); return START_NOT_STICKY }
        ownerToken = intent?.getStringExtra(EXTRA_OWNER_TOKEN).orEmpty()
        if (ownerToken.isBlank()) { stopSelf(); return START_NOT_STICKY }
        if (!SpeechRecognizer.isRecognitionAvailable(this)) { stopSelf(); return START_NOT_STICKY }
        main.post { startRecognition() }
        return START_NOT_STICKY
    }

    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) {
            tts?.language = Locale.forLanguageTag("hi-IN")
            tts?.setOnUtteranceProgressListener(object : UtteranceProgressListener() {
                override fun onStart(utteranceId: String?) { speaking = true }
                override fun onDone(utteranceId: String?) { main.post { speaking = false; startRecognition() } }
                @Deprecated("Deprecated in Java")
                override fun onError(utteranceId: String?) { main.post { speaking = false; startRecognition() } }
            })
            ready = true
        }
    }

    private fun startRecognition() {
        if (stopped || speaking) return
        try {
            if (recognizer == null) {
                recognizer = SpeechRecognizer.createSpeechRecognizer(this).also { it.setRecognitionListener(this) }
            }
            val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
                putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
                putExtra(RecognizerIntent.EXTRA_LANGUAGE, "hi-IN")
                putExtra(RecognizerIntent.EXTRA_LANGUAGE_PREFERENCE, "hi-IN")
                putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, false)
                putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 1)
            }
            recognizer?.startListening(intent)
        } catch (_: Exception) {
            main.postDelayed({ startRecognition() }, 1800)
        }
    }

    override fun onResults(results: android.os.Bundle?) {
        val phrase = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)?.firstOrNull()?.trim().orEmpty()
        if (phrase.isBlank()) { main.postDelayed({ startRecognition() }, 500); return }
        handlePhrase(phrase)
    }

    private fun handlePhrase(phrase: String) {
        val normalized = phrase.lowercase(Locale.ROOT)
        if (normalized.contains("फोन लॉक") || normalized.contains("phone lock") || normalized.contains("lock my phone") || normalized.contains("फोन बंद करके लॉक")) {
            val policy = getSystemService(Context.DEVICE_POLICY_SERVICE) as DevicePolicyManager
            val admin = ComponentName(this, JanuDeviceAdminReceiver::class.java)
            if (policy.isAdminActive(admin)) {
                speak("ठीक है, फोन लॉक कर रही हूँ।")
                main.postDelayed({ policy.lockNow(); startRecognition() }, 1100)
            } else {
                speak("फोन लॉक करने के लिए पहले JANU को Device Admin अनुमति दें। ऐप खोलकर Phone Lock अनुमति चालू करें।")
            }
            return
        }
        if (normalized.contains("सुनना बंद") || normalized.contains("stop listening") || normalized.contains("बंद हो जाओ")) {
            speak("ठीक है, JANU सुनना बंद कर रही हूँ।")
            main.postDelayed({ stopSelf() }, 1200)
            return
        }
        network.execute {
            var answer = "माफ़ कीजिए, अभी JANU से संपर्क नहीं हो पाया।"
            try {
                val payload = JSONObject().put("message", phrase).put("history", org.json.JSONArray().put(JSONObject().put("role","user").put("content",phrase))).toString()
                val conn = (URL("https://janu-ai-api.s15323052.workers.dev/api/chat").openConnection() as HttpURLConnection).apply {
                    requestMethod = "POST"
                    connectTimeout = 12000
                    readTimeout = 25000
                    doOutput = true
                    setRequestProperty("Authorization", "Bearer $ownerToken")
                    setRequestProperty("Content-Type", "application/json; charset=utf-8")
                }
                conn.outputStream.use { it.write(payload.toByteArray(Charsets.UTF_8)) }
                val code = conn.responseCode
                val stream = if (code in 200..299) conn.inputStream else conn.errorStream
                val text = stream?.bufferedReader()?.use { it.readText() }.orEmpty()
                val json = JSONObject(text)
                answer = if (code in 200..299) json.optString("reply", answer) else json.optString("error", answer)
                conn.disconnect()
            } catch (_: Exception) { }
            val response = answer
            main.post { speak(response) }
        }
    }

    private fun speak(text: String) {
        if (!ready || text.isBlank()) { main.postDelayed({ startRecognition() }, 700); return }
        speaking = true
        val utteranceId = "janu-" + System.currentTimeMillis()
        tts?.speak(text, TextToSpeech.QUEUE_FLUSH, null, utteranceId)
    }

    override fun onError(error: Int) {
        if (!stopped && !speaking) main.postDelayed({ startRecognition() }, 1200)
    }
    override fun onReadyForSpeech(params: android.os.Bundle?) { updateNotification("JANU सुन रही है — रोकने के लिए notification में Stop दबाएँ") }
    override fun onBeginningOfSpeech() {}
    override fun onRmsChanged(rmsdB: Float) {}
    override fun onBufferReceived(buffer: ByteArray?) {}
    override fun onEndOfSpeech() {}
    override fun onPartialResults(partialResults: android.os.Bundle?) {}
    override fun onEvent(eventType: Int, params: android.os.Bundle?) {}

    private fun createChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(NotificationChannel(CHANNEL_ID, "JANU locked-screen voice", NotificationManager.IMPORTANCE_LOW))
        }
    }

    private fun buildNotification(): Notification {
        val stop = PendingIntent.getService(this, 9, Intent(this, JanuListeningService::class.java).setAction(ACTION_STOP), PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
        val builder = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) Notification.Builder(this, CHANNEL_ID) else @Suppress("DEPRECATION") Notification.Builder(this)
        return builder.setSmallIcon(android.R.drawable.ic_btn_speak_now)
            .setContentTitle("JANU voice listening is ON")
            .setContentText("माइक चालू है। बंद करने के लिए Stop दबाएँ।")
            .setOngoing(true)
            .addAction(android.R.drawable.ic_media_pause, "Stop listening", stop)
            .build()
    }

    private fun updateNotification(message: String) {
        val manager = getSystemService(NotificationManager::class.java)
        manager.notify(NOTIFICATION_ID, buildNotification())
    }

    override fun onDestroy() {
        stopped = true
        main.removeCallbacksAndMessages(null)
        recognizer?.destroy()
        recognizer = null
        tts?.stop()
        tts?.shutdown()
        tts = null
        network.shutdownNow()
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? = null

    companion object {
        const val EXTRA_OWNER_TOKEN = "owner_token"
        const val ACTION_STOP = "ai.janu.app.STOP_LISTENING"
        private const val CHANNEL_ID = "janu_locked_voice"
        private const val NOTIFICATION_ID = 7101
    }
}
