# JANU Android phone control and locked-screen voice

## Current repository status
The current project is a Vite/web application plus a Cloudflare Worker. It does not yet contain a native Android module, AndroidManifest.xml, Gradle project, or Android foreground service. A browser page cannot securely lock the Android device or guarantee microphone capture while the phone is locked.

## Supported design

### 1. Lock phone by voice
- Add a native Android companion app (Kotlin).
- Declare a Device Admin receiver and request the user to explicitly activate JANU as a device administrator.
- After activation, expose a narrowly scoped native action such as `lock_device` through a validated app-to-web bridge.
- Execute `DevicePolicyManager.lockNow()` only after a clear voice command and confirmation policy chosen by the owner.
- The user can revoke Device Admin access in Android Settings at any time.

### 2. Unlock phone
- JANU must NOT bypass Android's PIN, password, pattern, fingerprint, or face authentication.
- Android does not provide ordinary third-party apps a supported API to silently dismiss a secure keyguard.
- On a spoken “open/unlock” request, JANU may wake the display or bring up its own activity where Android permits, then ask the owner to authenticate normally.

### 3. Talk while screen is locked
- Add a native microphone foreground service, started while JANU is visible and after the user grants microphone permission.
- Show Android's persistent foreground-service notification and a clear “Stop listening” action.
- Use the microphone foreground-service type and permissions required by the target Android SDK; comply with Android background-start restrictions.
- Keep the service active only while the user has explicitly enabled locked-screen listening. Stop it when the user turns listening off, revokes permission, or the OS stops the service.
- Android/OEM battery management, call/audio focus, Bluetooth routing, and OS policy can interrupt background audio. Never promise uninterrupted always-on listening.

### 4. Security and privacy
- Do not request Accessibility Service merely to bypass the lock screen or simulate unrestricted control.
- Do not store raw microphone recordings by default.
- Require explicit owner permission for every privileged Android capability; explain what it does and how to revoke it.
- Keep API keys on the Cloudflare Worker, never in the Android app or browser bundle.
- Validate all native bridge commands against a strict allowlist; do not expose arbitrary shell execution.

## Implementation status
This document is an implementation plan, not a claim that these native capabilities are already built or tested. The next engineering milestone is to add a Kotlin/Gradle Android project, manifest, Device Admin receiver, foreground microphone service, and a minimal authenticated bridge to the existing JANU web app. Then build and test an APK on a real device.
