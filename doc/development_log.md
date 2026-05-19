# Development Log - Aura

## 2026-05-16: Rebranding and Android Streamlining

### Summary of Changes

#### 1. Rebranding to "Aura"
- Updated `tauri.conf.json`: Set `productName` to "Aura".
- Updated Android Resources: Modified `strings.xml` to change the app label from "tmp-tauri" to "Aura".
- Icon Injection: Replaced all default Tauri icons in `src/core/icons` and the generated Android mipmap directories with the project's brand icon from `res/images/icon.png`.

#### 2. Build System Improvements
- `Makefile`: 
    - Added `make build-local` target to automate the debug APK build and deployment staging.
    - Fixed the `install` target to correctly run in the `cfg/` directory where `package.json` resides.
- Gradle Build Fix: Modified `BuildTask.kt` in the Android build source to use `npx @tauri-apps/cli` directly. This resolves pathing issues where the Android build couldn't find the Tauri CLI in the project root.

#### 3. UI & UX (Huawei Scrolling Fixes)
- CSS Refactor: Implemented multiple iterations of scrolling fixes in `App.css`. 
    - Forced the `.app-container` to handle its own overflow with `overflow-y: auto`.
    - Removed viewport height constraints (`100vh`) that were preventing scrolling on specific Android WebViews.
    - Added significant padding to the bottom of the setup form to ensure the "Project Your Aura" button is reachable.
- Debugging: Added a versioned debug indicator to the `OnboardingScreen` to verify UI updates on physical devices.

#### 4. Project Organization
- Ensured build artifacts (`pub/`, `bin/`) and intermediate files are correctly ignored in `.gitignore`.
- Streamlined the `make deploy` workflow for multi-device testing.
