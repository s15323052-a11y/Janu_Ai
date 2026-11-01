package com.janu.ai

import android.Manifest
import android.app.Activity
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Bundle
import android.speech.RecognizerIntent
import android.speech.tts.TextToSpeech
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import java.util.Locale

class MainActivity : ComponentActivity(), TextToSpeech.OnInitListener {
    private var tts: TextToSpeech? = null
    private var speakReply by mutableStateOf("मुझे सुनने के लिए बटन दबाएँ।")
    private val speechLauncher = registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
        if (result.resultCode == Activity.RESULT_OK) {
            val words = result.data?.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS)
            val heard = words?.firstOrNull().orEmpty()
            if (heard.isNotBlank()) {
                speakReply = "आपने कहा: $heard"
                tts?.language = if (heard.any { it.code in 0x0900..0x097F }) Locale("hi", "IN") else Locale.US
                tts?.speak(speakReply, TextToSpeech.QUEUE_FLUSH, null, "janu_reply")
            }
        }
    }
    private val permissionLauncher = registerForActivityResult(ActivityResultContracts.RequestPermission()) { granted ->
        if (granted) startListening() else speakReply = "माइक्रोफोन की अनुमति नहीं मिली।"
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        tts = TextToSpeech(this, this)
        setContent {
            MaterialTheme {
                Surface(Modifier.fillMaxSize()) {
                    Column(Modifier.fillMaxSize().padding(24.dp),
                        verticalArrangement = Arrangement.Center,
                        horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("नमस्ते! मैं JANU हूँ", style = MaterialTheme.typography.headlineMedium)
                        Text("Hindi और English voice assistant", Modifier.padding(top = 12.dp))
                        Button(onClick = {
                            if (checkSelfPermission(Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED) startListening()
                            else permissionLauncher.launch(Manifest.permission.RECORD_AUDIO)
                        }, Modifier.padding(top = 24.dp)) { Text("🎙 बोलना शुरू करें") }
                        Text(speakReply, Modifier.padding(top = 20.dp))
                        Text("यह शुरुआती voice input और बोलकर जवाब देने का परीक्षण है। AI जवाब, wake-word और reminders अगले integration चरण में जुड़ेंगे।",
                            Modifier.padding(top = 20.dp), style = MaterialTheme.typography.bodySmall)
                    }
                }
            }
        }
    }

    private fun startListening() {
        val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
            putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
            putExtra(RecognizerIntent.EXTRA_LANGUAGE, "hi-IN")
            putExtra(RecognizerIntent.EXTRA_PROMPT, "JANU से बात करें")
        }
        try { speechLauncher.launch(intent) } catch (_: Exception) {
            speakReply = "इस फोन पर speech recognition उपलब्ध नहीं है।"
        }
    }

    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) tts?.language = Locale("hi", "IN")
    }

    override fun onDestroy() {
        tts?.stop()
        tts?.shutdown()
        super.onDestroy()
    }
}