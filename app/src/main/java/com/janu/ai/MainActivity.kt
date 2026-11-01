package com.janu.ai

import android.Manifest
import android.app.Activity
import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Bundle
import android.speech.RecognizerIntent
import android.speech.tts.TextToSpeech
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import java.util.Locale

class MainActivity : ComponentActivity(), TextToSpeech.OnInitListener {
    private var tts: TextToSpeech? = null
    private var input by mutableStateOf("")
    private var status by mutableStateOf("नमस्ते! मैं JANU हूँ। नीचे लिखें या माइक दबाकर बोलें।")
    private val conversation = mutableStateListOf("JANU: नमस्ते! मैं आपकी बात सुनने के लिए तैयार हूँ।")

    private val speechLauncher = registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
        if (result.resultCode == Activity.RESULT_OK) {
            input = result.data?.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS)?.firstOrNull().orEmpty()
        }
    }
    private val permissionLauncher = registerForActivityResult(ActivityResultContracts.RequestPermission()) { granted ->
        if (granted) startListening() else status = "माइक्रोफोन अनुमति नहीं मिली।"
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        tts = TextToSpeech(this, this)
        setContent {
            MaterialTheme {
                Surface(Modifier.fillMaxSize()) {
                    Column(Modifier.fillMaxSize().padding(20.dp)) {
                        Text("JANU AI", style = MaterialTheme.typography.headlineLarge)
                        Text("हिंदी और English voice assistant", style = MaterialTheme.typography.bodyMedium)
                        Spacer(Modifier.height(12.dp))
                        Text(status, style = MaterialTheme.typography.bodySmall)
                        LazyColumn(Modifier.weight(1f).fillMaxWidth().padding(vertical = 12.dp)) {
                            items(conversation) { line ->
                                Card(Modifier.fillMaxWidth().padding(vertical = 4.dp)) {
                                    Text(line, Modifier.padding(12.dp))
                                }
                            }
                        }
                        OutlinedTextField(
                            value = input,
                            onValueChange = { input = it },
                            modifier = Modifier.fillMaxWidth(),
                            label = { Text("अपना संदेश लिखें") },
                            placeholder = { Text("जैसे: नमस्ते Janu") }
                        )
                        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            Button(onClick = {
                                if (checkSelfPermission(Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED) startListening()
                                else permissionLauncher.launch(Manifest.permission.RECORD_AUDIO)
                            }, modifier = Modifier.weight(1f)) { Text("🎙 बोलें") }
                            Button(onClick = { sendMessage() }, modifier = Modifier.weight(1f), enabled = input.isNotBlank()) {
                                Text("भेजें")
                            }
                        }
                        Text(
                            "नोट: अभी यह शुरुआती local demo है। असली AI जवाब के लिए सुरक्षित server/API connection जोड़ना बाकी है।",
                            Modifier.padding(top = 12.dp),
                            style = MaterialTheme.typography.bodySmall
                        )
                    }
                }
            }
        }
    }

    private fun sendMessage() {
        val message = input.trim()
        if (message.isEmpty()) return
        conversation.add("आप: $message")
        input = ""
        val reply = when {
            message.contains("नमस्ते") || message.contains("hello", true) || message.contains("hi", true) ->
                "नमस्ते! मैं JANU हूँ। बताइए, मैं आपकी क्या मदद करूँ?"
            message.contains("समय") || message.contains("time", true) ->
                "माफ़ कीजिए, इस demo में अभी live जानकारी उपलब्ध नहीं है।"
            else ->
                "मैंने आपकी बात सुनी: $message। असली AI जवाब देने के लिए JANU का AI server connection अभी जोड़ना बाकी है।"
        }
        conversation.add("JANU: $reply")
        val hindi = message.any { it.code in 0x0900..0x097F }
        tts?.language = if (hindi) Locale("hi", "IN") else Locale.US
        tts?.speak(reply, TextToSpeech.QUEUE_FLUSH, null, "janu_reply")
    }

    private fun startListening() {
        val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
            putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
            putExtra(RecognizerIntent.EXTRA_LANGUAGE, "hi-IN")
            putExtra(RecognizerIntent.EXTRA_PROMPT, "JANU से बात करें")
        }
        try { speechLauncher.launch(intent) } catch (_: Exception) {
            status = "इस फोन पर speech recognition उपलब्ध नहीं है।"
        }
    }

    override fun onInit(statusCode: Int) {
        if (statusCode == TextToSpeech.SUCCESS) tts?.language = Locale("hi", "IN")
    }

    override fun onDestroy() {
        tts?.stop()
        tts?.shutdown()
        super.onDestroy()
    }
}
