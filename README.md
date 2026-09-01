# BNZ Ops Suite — iOS / Android app

Native app for general contractors in the United States.
Agents: Sara (procurement), Emma (subs), Taylor (estimator).
Public phone: 1-332-258-1401. Bonding capacity is never displayed.

This is an Expo / React Native app — the real path onto the Apple App Store and Google Play.

## Apple requirements

1. Enroll at https://developer.apple.com — $99/year, company account under BNZ Builders INC.
2. Create the app in App Store Connect:
   - Name: BNZ Ops Suite
   - Bundle ID: com.bnzbuilders.opssuite
   - SKU: bnz-ops-suite
3. Host a privacy policy at https://buildwithbnz.com/privacy (see STORE_LISTING.md).

## Run on your iPhone

```bash
cd bnz-ops-app
npm install
npx expo start
```

Install Expo Go, scan the QR. That is testing, not the store listing.

## Ship to the App Store

```bash
npm install -g eas-cli
npx eas login
npx eas init
npx eas build --platform ios --profile production
npx eas submit --platform ios --profile production
```
