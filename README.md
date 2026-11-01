# JANU AI

An Android starter project for a Hindi/English personal assistant.

## Current implementation
- Android app shell (Jetpack Compose)
- Android speech-recognition intent for user-initiated voice input
- Android TextToSpeech response
- Notification receiver foundation for reminders

## Not yet implemented
- A real AI chat backend/API connection
- Secure API-key configuration
- Reliable always-on JANU wake-word detection / foreground microphone service
- Reminder scheduling UI and exact-alarm flow
- Phone calling integration
- Release signing and a tested release APK

## Build a debug APK
GitHub Actions builds a debug APK when code is pushed to `janu-ai-android-starter`, or when manually started from the Actions tab.

After a successful run, open the workflow run and download the `JANU-AI-debug-apk` artifact. This is a test APK, not a Play Store release.

## API key safety
Never commit API keys into source code or send them in chat. Add provider credentials as GitHub Actions Secrets only after choosing a provider and implementing the backend integration. For a production app, keep provider keys on a server, not inside the APK.

## Android permissions
The app requests microphone access when the user taps the voice button. Android may also require notification permission before reminders can show.
