package com.janu.ai

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent { JanuApp() }
    }
}

@Composable
private fun JanuApp() {
    MaterialTheme(colorScheme = lightColorScheme()) {
        Surface(modifier = Modifier.fillMaxSize()) {
            Column(
                modifier = Modifier.fillMaxSize().padding(24.dp),
                verticalArrangement = Arrangement.Center,
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text("नमस्ते! मैं JANU हूँ", style = MaterialTheme.typography.headlineMedium)
                Text("आपकी Hindi और English AI assistant", modifier = Modifier.padding(top = 12.dp))
                Button(onClick = { /* Voice interaction will be connected in the next step. */ },
                    modifier = Modifier.padding(top = 24.dp)) {
                    Text("बोलना शुरू करें")
                }
                Text("Starter app is ready for voice, chat and reminders integration.",
                    modifier = Modifier.padding(top = 16.dp))
            }
        }
    }
}
