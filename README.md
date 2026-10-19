# oesterle.cloud

Statische Projektseite von Thomas Oesterle, ausgeliefert über GitHub Pages. Kein Build, kein CMS: HTML und CSS.

## Vor dem ersten Veröffentlichen
- [x] Impressum ausgefüllt
- [x] Schriften in `assets/fonts/` mit `OFL.txt`
- [ ] Domain in `CNAME` prüfen (aktuell: `oesterle.cloud`)

## Leitlinie Inhalte
- KI aus Europa zuerst: oneAI und Mistral werden zuerst genannt und empfohlen, OpenAI, Gemini und Claude nur als weitere Anbieter.
- Nur prüfbare Angaben, keine Anbieterzahlen als Verkaufsargument.
- Kontakt überall feedback@oesterle.cloud.

## Unterstützen-Link
Ko-fi-Profil: `ko-fi.com/tho3mes` (in index.html und wortlaut/index.html).

## Werkstatt (Projekte in Arbeit)
Abschnitt `#werkstatt` auf der Startseite: gestrichelte Karten (`karte leer`) mit Etikett „Coming soon“ und Zeile `p.stand` (z. B. „Alpha · noch nicht veröffentlicht“). Keine Downloads, keine Namen von Kindern, keine Aufrufe zum Mittesten, keine Warteliste.

Aktuell: Wortmeldung, Wortwechsel (Alpha), Klarschiff (Alpha), Zeichenatelier.

Ein Werkstatt-Projekt darf eine Vorschau-Unterseite bekommen (Coming soon, Funktionen, Roadmap, Ratgeber, keine Downloads). Die Karte wird dann zum Link (`a.karte.leer`). Aktuell: `wortmeldung/`.

Bilder und Beispiele zeigen die App so, wie sie wirklich aussieht: als HTML-Nachbau im Design der App (`.app`, Farben aus `Stil.cs` der App), animiert über `data-appszene` in site.js. Kein erfundenes Design.

Wird ein Projekt veröffentlicht (eigenes Release-Repo), wandert die Karte nach „Projekte“ und die Unterseite bekommt Downloads.

## Neues Projekt ergänzen
1. Ordner `projektname/` mit `index.html` anlegen (Vorlage: `wortlaut/index.html`).
2. Auf der Startseite (`index.html`) im Abschnitt „Projekte“ eine Karte ergänzen.
3. In `sitemap.xml` eine Zeile ergänzen.
4. Menü in allen Seiten gleich halten (Projekte, Wortlaut, Werkstatt, Über mich, Kontakt).

## Werbung später aktivieren (Google AdSense)
1. Seite mit echtem Inhalt online, dann bei AdSense anmelden und Website prüfen lassen.
2. Zertifiziertes Einwilligungsbanner (CMP) einbinden, z. B. „Datenschutz & Mitteilungen“ in AdSense. Ohne Einwilligung keine Werbung.
3. In der Content-Security-Policy (Meta-Tag im Kopf jeder Seite) die Google-Domains freigeben.
4. `ads.txt` mit der Zeile aus AdSense ins Hauptverzeichnis legen.
5. Die vorbereiteten Stellen `<!-- Werbefläche … -->` ersetzen und in `datenschutz/index.html` den auskommentierten Abschnitt „Werbung“ aktivieren.
