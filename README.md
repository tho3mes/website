# oesterle.cloud

Statische Projektseite von Thomas Oesterle, ausgeliefert über GitHub Pages. Kein Build, kein CMS: HTML und CSS.

## Vor dem ersten Veröffentlichen
- [x] Impressum ausgefüllt
- [ ] Schriften nach `assets/fonts/` kopieren (siehe LIESMICH.txt) und `OFL.txt` dazulegen
- [ ] Domain in `CNAME` prüfen (aktuell: `oesterle.cloud`)

## Unterstützen-Link
Ko-fi-Konto anlegen und in allen HTML-Dateien `ko-fi.com/DEIN-NAME` durch den eigenen Namen ersetzen.

## Neues Projekt ergänzen
1. Ordner `projektname/` mit `index.html` anlegen (Vorlage: `wortlaut/index.html`).
2. Auf der Startseite (`index.html`) im Abschnitt „Projekte“ eine Karte ergänzen.
3. In `sitemap.xml` eine Zeile ergänzen.

## Werbung später aktivieren (Google AdSense)
1. Seite mit echtem Inhalt online, dann bei AdSense anmelden und Website prüfen lassen.
2. Zertifiziertes Einwilligungsbanner (CMP) einbinden, z. B. „Datenschutz & Mitteilungen“ in AdSense. Ohne Einwilligung keine Werbung.
3. In der Content-Security-Policy (Meta-Tag im Kopf jeder Seite) die Google-Domains freigeben.
4. `ads.txt` mit der Zeile aus AdSense ins Hauptverzeichnis legen.
5. Die vorbereiteten Stellen `<!-- Werbefläche … -->` ersetzen und in `datenschutz/index.html` den auskommentierten Abschnitt „Werbung“ aktivieren.
