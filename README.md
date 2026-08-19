# Foxtech

Attendance manager — an [Expo](https://expo.dev) app that runs a website ([app/index.tsx](app/index.tsx)) inside a native WebView shell.

## Running the app (development)

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the dev server

   ```bash
   npx expo start
   ```

   In the terminal output, press `a` for an [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/), `i` for an [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/), `w` for web, or scan the QR code with [Expo Go](https://expo.dev/go) on a physical device.

   Shortcuts for the same targets:

   ```bash
   npm run android   # expo run:android — builds and launches on a connected device/emulator
   npm run ios       # expo run:ios     — builds and launches on a simulator/device (macOS only)
   npm run web       # expo start --web
   ```

The screen the app shows lives in [app/index.tsx](app/index.tsx) — change `SITE_URL` there to point the WebView at a different site.

## Building a standalone (offline) app

The dev server (`expo start`) and Expo Go are only needed while developing — for real-world use you build a standalone `.apk`/`.aab` (Android) or `.ipa` (iOS) that installs and launches on its own, no dev server or Expo account required at runtime. There are two ways to produce one:

### Option A — Local build (fully offline, no Expo account)

Requires the native toolchain installed on your machine: [Android Studio + SDK](https://docs.expo.dev/workflow/android-studio-emulator/) for Android, or Xcode (macOS only) for iOS.

```bash
npx expo run:android --variant release   # outputs an installable .apk
npx expo run:ios --configuration Release # macOS only
```

The first run generates the native `android`/`ios` projects (`expo prebuild`) and builds with Gradle/Xcode directly on your machine — nothing is uploaded anywhere. The release APK is written under `android/app/build/outputs/apk/release/`. It isn't code-signed for the Play Store, but it installs fine via `adb install` or by copying the file to a device.

### Option B — EAS Build (cloud, no local Android/Xcode setup needed)

```bash
npm install --global eas-cli
eas login
eas build:configure          # first time only — creates eas.json
eas build --platform android # or ios / all
```

This builds on Expo's servers and gives you a downloadable `.apk`/`.aab`/`.ipa`. (`eas build --local` runs the same process on your own machine instead, but it isn't officially supported on Windows — use WSL, macOS, or Linux for that path.)

> **Note:** "offline build" above refers to the build/packaging step, not the app's runtime behavior — since this app displays a remote website in a WebView, the device still needs an internet connection to load that site once installed.

## Learn more

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [EAS Build](https://docs.expo.dev/build/introduction/): Full reference for cloud and local builds.
- [react-native-webview](https://github.com/react-native-webview/react-native-webview): Docs for the WebView component this app is built around.
