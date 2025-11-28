# Metric gains

## Hvordan å kjøre prosjektet

1. Åpne terminalen i prosjektmappa og kjør:

   ```bash
   cd functions
   ```

2. Deretter kjør kommandoen:

   ```bash
   npm install
   ```

3. Etter det er ferdig installert kjør:

   ```bash
   npm run build
   ```

4. Etter det er ferdig buildet kjør:

   ```bash
   firebase deploy --only functions
   ```

5. Etter den er ferdig med å deploye, så går du tilbake til hovedmappa

   ```bash
   cd ..
   ```

5. Så kjør kommandoen:

   ```bash
   npm install
   ```

6. Etter det er ferdig installert så kjører du til slutt:

   ```bash
   npx expo start
   ```

Du vil da få disse valgene + litt fler i terminalen, vi anbefaler å åpne den i IOS simulatoren for best mulig erfaring.

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

---

## NB!
Vi inkluderer .env i repoet KUN for lettere kjøring for sensor, slik at prosjektet kan kjøres uten manuell oppsett.
I et normalt utviklingsmiljø ville disse vært ignorert og ikke pusha til github.