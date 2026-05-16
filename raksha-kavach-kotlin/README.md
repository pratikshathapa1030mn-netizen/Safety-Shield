# Raksha-Kavach Codebase (Kotlin Version)

This directory contains the Kotlin source code for the **Raksha-Kavach** Industrial Safety Auditor app, designed for both **Android** and **Web**.

## How to use this code

### 1. Android App
To run the Android application:
1. Open **Android Studio**.
2. Select **Open** and navigate to this `raksha-kavach-kotlin` directory.
3. Wait for Gradle to sync dependencies.
4. Connect an Android device or start an emulator.
5. Click the **Run** button (Green Play Icon).

### 2. Web App (Kotlin Multiplatform)
The project is configured for **Kotlin Multiplatform (KMP)**. You can build the web target using:
`./gradlew jsBrowserRun`

## Technologies Used
- **Language:** Kotlin 1.9.20
- **UI Framework:** Jetpack Compose (Android) / Compose Multiplatform (Web)
- **Architecture:** MVVM with Navigation Compose
- **Build System:** Gradle Kotlin DSL

---
*Note: This is a direct port of the Raksha-Kavach platform into Kotlin for native development.*
