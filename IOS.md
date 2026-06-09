# Vianne — iOS / Xcode / App Store

The Vianne web app is wrapped for **Xcode** using [Capacitor](https://capacitorjs.com/). The native iOS project lives in `ios/`.

## Prerequisites

1. **Install Xcode** from the Mac App Store (~12 GB)
2. Open Xcode once and accept the license
3. Point the active developer directory to Xcode:

```bash
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
xcodebuild -version
```

4. **Apple Developer Program** ($99/year) — required only when submitting to the App Store (not needed to run on your own iPhone for testing with a free Apple ID, with limits)

## Project layout

| Path | Purpose |
|------|---------|
| `www/` | Built web app (generated — do not edit) |
| `ios/App/App.xcodeproj` | **Open this in Xcode** |
| `ios/App/App/Info.plist` | Camera + Face ID permissions |
| `ios/App/App/Assets.xcassets/AppIcon.appiconset` | App Store icons (Vianne lotus) |
| `capacitor.config.json` | App ID: `com.viannejewels.app` |

## Daily workflow

After editing `Vianne.jsx`:

```bash
cd /Users/rj/Downloads/VIANNE/Vianne
npm run ios:setup    # build web app + sync to iOS + icons + permissions
npm run cap:open     # opens Xcode
```

In Xcode:

1. Select the **App** target
2. **Signing & Capabilities** → choose your Team (Apple ID)
3. Connect your iPhone or pick a simulator
4. Press **Run** (▶)

## Test on your iPhone (before App Store)

1. Connect iPhone via USB
2. Xcode → App target → Signing → your Apple ID team
3. On iPhone: Settings → General → VPN & Device Management → trust developer
4. Run from Xcode

## Submit to App Store

1. Enroll at [developer.apple.com](https://developer.apple.com) ($99/year)
2. In Xcode: **Product → Archive**
3. **Distribute App → App Store Connect**
4. In [App Store Connect](https://appstoreconnect.apple.com):
   - Create app listing (name: **Vianne**, bundle ID: `com.viannejewels.app`)
   - Add screenshots (iPhone 6.7" and 6.5" required)
   - Privacy policy URL (required)
   - Submit for review

### App Store listing tips

- Category: **Business**
- Description: trade show ERP for jewellery inventory, sales, QR lookup
- Mention camera is used for QR scanning at exhibitions
- Apple may scrutinize WebView apps — emphasize offline trade-show use, native camera, Face ID

## Commands reference

| Command | What it does |
|---------|----------------|
| `npm run build` | Compile JSX → `index.html` + `www/` |
| `npm run cap:sync` | Build + copy web assets into iOS project |
| `npm run ios:setup` | Full iOS prep (sync + plist + icons + splash) |
| `npm run cap:open` | Open `ios/App/App.xcodeproj` in Xcode |

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `xcodebuild requires Xcode` | Install Xcode from App Store, run `sudo xcode-select -s /Applications/Xcode.app/Contents/Developer` |
| Signing errors | Xcode → Signing & Capabilities → select Team |
| Camera not working in app | Check `NSCameraUsageDescription` in `Info.plist` (already set) |
| Old web content on device | Run `npm run ios:setup` then rebuild in Xcode |
| Bundle ID taken | Change `appId` in `capacitor.config.json`, re-run `npx cap sync ios` |

## Push to GitHub

The `ios/` folder is committed so anyone with Xcode can open and build:

```bash
./push.sh "Add iOS Xcode project via Capacitor"
```
