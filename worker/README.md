# Kontaktformular-Worker

Zweiter schneller Kontaktweg nach § 5 DDG, ohne Telefonnummer. Das Formular auf `oesterle.cloud/#kontakt` schickt per POST an `https://kontakt.oesterle.cloud/`. Der Worker prüft Herkunft, Pflichtfelder und Honigtopf, baut daraus eine Klartext-Mail und leitet sie über Cloudflare Email Routing weiter. Er speichert nichts, Logs sind aus.

## Einmalig einrichten
1. Cloudflare-Dashboard → Zone `oesterle.cloud` → **Email → Email Routing** aktivieren.
   Achtung: Das setzt die MX-Einträge auf Cloudflare. Liegt `feedback@oesterle.cloud` bei einem anderen Mailanbieter, erst klären, sonst bricht das Postfach.
2. Unter **Zieladressen** die Empfängeradresse hinzufügen (z. B. die private E-Mail) und den Bestätigungslink in der Mail klicken.
3. Deployen:
   ```
   cd worker
   npx wrangler deploy
   npx wrangler secret put ZIEL   # verifizierte Empfängeradresse eingeben
   ```
4. Test: Formular auf der Startseite absenden. Erwartet: Weiterleitung auf `/kontakt/danke/` und Mail mit Reply-To auf den Absender.

## Verhalten
- Erfolg und Honigtopf-Treffer: 303 auf `/kontakt/danke/` (Bots merken nichts).
- Falsche Herkunft: 403, ungültige Eingabe: 400, Versandfehler: 502, jeweils mit kurzer Fehlerseite und Link zurück.
- Grenzen: Name 100, E-Mail 200, Nachricht 5000 Zeichen.
