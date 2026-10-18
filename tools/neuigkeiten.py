#!/usr/bin/env python3
"""Neuigkeiten fuer oesterle.cloud aus den Wortlaut-Releases (tho3mes/wortlaut-releases).

Laeuft als GitHub Action (.github/workflows/neuigkeiten.yml): taeglich, manuell und auf Zuruf.
Aendert nur die Bloecke zwischen festen Markern, alles andere bleibt unberuehrt:
  wortlaut/index.html  <!-- neu:hinweis:start/end -->  dezenter Hinweis im Kopfbereich (nur 45 Tage)
                       <!-- neu:liste:start/end -->    Abschnitt "Was ist neu" (Versionsverlauf)
                       "softwareVersion" im JSON-LD
  index.html           <!-- neu:karte:start/end -->    kleine Zeile in der Projektkarte (nur 45 Tage)
  sitemap.xml          lastmod der geaenderten Seiten

Vorhandene Eintraege bleiben stehen (von Hand formulierte Texte gehen nicht verloren);
neue Versionen kommen oben dazu, hoechstens MAX_EINTRAEGE bleiben sichtbar.
Kurztext je Version: eine Zeile mit "> " im Changelog-Abschnitt (landet in den Release-Notes),
sonst die Stichworte der ersten Punkte unter **Neu**. Nur Standardbibliothek, keine Abhaengigkeiten.
Test ohne Netz: NEU_TESTDATEN=<datei.json> python3 tools/neuigkeiten.py
"""
import html
import json
import os
import re
import sys
import urllib.request
from datetime import date, datetime, timezone

REPO = "tho3mes/wortlaut-releases"
SEITE = "wortlaut/index.html"
START = "index.html"
SITEMAP = "sitemap.xml"
MAX_EINTRAEGE = 6
TAGE_HINWEIS = 45
PUNKTE_AKTUELL = 4


def esc(t):
    return html.escape(t, quote=True)


def schluessel(v):
    return tuple(int(x) for x in re.findall(r"\d+", v)[:3])


def releases():
    if os.environ.get("NEU_TESTDATEN"):
        with open(os.environ["NEU_TESTDATEN"], encoding="utf-8") as f:
            daten = json.load(f)
    else:
        req = urllib.request.Request(
            "https://api.github.com/repos/" + REPO + "/releases?per_page=20",
            headers={"Accept": "application/vnd.github+json", "User-Agent": "oesterle-cloud-neuigkeiten"})
        if os.environ.get("GITHUB_TOKEN"):
            req.add_header("Authorization", "Bearer " + os.environ["GITHUB_TOKEN"])
        with urllib.request.urlopen(req, timeout=30) as r:
            daten = json.load(r)
    return [x for x in daten if not x.get("draft") and not x.get("prerelease") and x.get("tag_name")]


def schlicht(t):
    t = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", t)
    t = t.replace("**", "").replace("`", "")
    return re.sub(r"\s+", " ", t).strip()


def zeilen(body):
    return [z.strip() for z in (body or "").replace("\r", "").split("\n")]


def neue_punkte(body):
    drin, erg, alle = False, [], []
    for z in zeilen(body):
        if re.match(r"^\*\*[^*]+\*\*$", z):
            drin = z.strip("*").strip().lower() == "neu"
            continue
        if z.startswith("- "):
            alle.append(schlicht(z[2:]))
            if drin:
                erg.append(schlicht(z[2:]))
    return erg or alle


def kopf(punkt):
    k = re.split(r"[:;.]", re.sub(r"\s*\([^)]*\)", "", punkt), maxsplit=1)[0].strip()
    return k if 2 <= len(k) <= 48 else ""


def kurztext(body):
    for z in zeilen(body):
        if z.startswith(">"):
            return schlicht(z[1:])
    koepfe = [k for k in (kopf(p) for p in neue_punkte(body)[:3]) if k]
    return ", ".join(koepfe)


def punkt_html(p):
    m = re.match(r"^([^:]{2,60}):\s*(.+)$", p)
    if m:
        k = re.sub(r"\s*\([^)]*\)", "", m.group(1)).strip()
        rest = m.group(2)
    else:
        k, rest = "", p
    saetze = re.split(r"(?<=[.!?])\s+", rest)
    rest = saetze[0] if saetze else rest
    if len(rest) > 170:
        rest = rest[:167].rsplit(" ", 1)[0] + " …"
    return ("<strong>" + esc(k) + ":</strong> " if k else "") + esc(rest)


def eintrag(rel, aktuell):
    v = rel["tag_name"].lstrip("vV")
    iso = (rel.get("published_at") or datetime.now(timezone.utc).isoformat())[:10]
    anzeige = datetime.strptime(iso, "%Y-%m-%d").strftime("%d.%m.%Y")
    kurz = kurztext(rel.get("body"))
    klasse = ' class="aktuell"' if aktuell else ""
    s = ['      <li' + klasse + ' data-version="' + esc(v) + '" data-datum="' + iso + '">',
         '        <p class="version-kopf"><b>' + esc(v) + '</b><span>' + anzeige + '</span></p>']
    if kurz:
        s.append('        <p class="version-kurz">' + esc(kurz) + '</p>')
    if aktuell:
        punkte = neue_punkte(rel.get("body"))[:PUNKTE_AKTUELL]
        if punkte:
            s.append('        <ul class="version-punkte">')
            s += ['          <li>' + punkt_html(p) + '</li>' for p in punkte]
            s.append('        </ul>')
    s.append('      </li>')
    return "\n".join(s)


def block(text, name):
    m = re.search(r"(<!-- neu:" + name + r":start -->)(.*?)(<!-- neu:" + name + r":end -->)", text, re.S)
    return m


def ersetzen(text, name, inhalt):
    m = block(text, name)
    if not m:
        return text
    return text[:m.end(1)] + inhalt + text[m.start(3):]


def liste_aktualisieren(liste, rels):
    vorhanden = re.findall(r'<li[^>]*\bdata-version="([^"]+)"', liste)
    oberste = max(vorhanden, key=schluessel) if vorhanden else "0.0.0"
    neu = sorted((r for r in rels if schluessel(r["tag_name"]) > schluessel(oberste)),
                 key=lambda r: schluessel(r["tag_name"]), reverse=True)
    if not neu:
        return liste, []
    liste = liste.replace('<li class="aktuell" ', "<li ")
    liste = re.sub(r'\n\s*<ul class="version-punkte">.*?</ul>', "", liste, flags=re.S)
    zusatz = "\n".join(eintrag(r, i == 0) for i, r in enumerate(neu))
    liste = re.sub(r'(<ol class="versionen">)', lambda m: m.group(1) + "\n" + zusatz, liste, count=1)
    starts = [m.start() for m in re.finditer(r'\n\s*<li[^>]*\bdata-version="', liste)]
    if len(starts) > MAX_EINTRAEGE:
        ende = liste.find("</ol>")
        schluss = liste.rfind("\n", 0, ende)
        liste = liste[:starts[MAX_EINTRAEGE]] + liste[schluss:]
    return liste, [r["tag_name"].lstrip("vV") for r in neu]


def oberster(liste):
    m = re.search(r'<li[^>]*\bdata-version="([^"]+)"[^>]*\bdata-datum="([^"]+)"[^>]*>(.*?)</li>', liste, re.S)
    if not m:
        return None
    k = re.search(r'<p class="version-kurz">(.*?)</p>', m.group(3), re.S)
    return m.group(1), m.group(2), (k.group(1).strip() if k else "")


def kuerzen(t, n):
    roh = html.unescape(t)
    if len(roh) <= n:
        return t
    return esc(roh[:n - 2].rsplit(" ", 1)[0] + " …")


def main():
    heute = date.today()
    with open(SEITE, encoding="utf-8") as f:
        seite = f.read()
    m = block(seite, "liste")
    if not m:
        sys.exit("Marker neu:liste fehlen in " + SEITE)
    liste, neu = liste_aktualisieren(m.group(2), releases())
    seite_neu = ersetzen(seite, "liste", liste)

    top = oberster(liste)
    frisch = False
    hinweis, karte = "", ""
    if top:
        v, iso, kurz = top
        frisch = (heute - date.fromisoformat(iso)).days <= TAGE_HINWEIS
        if frisch:
            kv = ".".join(v.split(".")[:2]) if v.endswith(".0") else v
            text = "Version " + esc(kv) + (": " + kuerzen(kurz, 72) if kurz else "")
            hinweis = '\n      <p class="neu-hinweis"><a href="#neu"><span class="neu-marke">Neu</span>' + text + '</a></p>\n      '
            karte = '\n        <span class="neu-zeile"><span class="neu-marke">Neu</span>Version ' + esc(kv) + '</span>\n        '
        seite_neu = re.sub(r'("softwareVersion":\s*")[^"]*(")', lambda x: x.group(1) + v + x.group(2), seite_neu)
    # Hinweis und Karte nur neu schreiben, wenn eine Version dazukam oder die Frist abgelaufen ist;
    # sonst bleibt ein von Hand formulierter Hinweis stehen
    if neu or not frisch:
        seite_neu = ersetzen(seite_neu, "hinweis", hinweis)

    geaendert = []
    if seite_neu != seite:
        with open(SEITE, "w", encoding="utf-8") as f:
            f.write(seite_neu)
        geaendert.append("https://oesterle.cloud/wortlaut/")

    if os.path.exists(START):
        with open(START, encoding="utf-8") as f:
            start = f.read()
        start_neu = ersetzen(start, "karte", karte) if (neu or not frisch) else start
        if start_neu != start:
            with open(START, "w", encoding="utf-8") as f:
                f.write(start_neu)
            geaendert.append("https://oesterle.cloud/")

    if geaendert and os.path.exists(SITEMAP):
        with open(SITEMAP, encoding="utf-8") as f:
            sm = f.read()
        for url in geaendert:
            sm = re.sub(r"(<loc>" + re.escape(url) + r"</loc><lastmod>)[^<]*(</lastmod>)",
                        lambda x: x.group(1) + heute.isoformat() + x.group(2), sm)
        with open(SITEMAP, "w", encoding="utf-8") as f:
            f.write(sm)

    print("Neue Versionen: " + (", ".join(neu) if neu else "keine")
          + " | Hinweis: " + ("an" if frisch else "aus")
          + " | geaendert: " + (", ".join(geaendert) if geaendert else "nichts"))


if __name__ == "__main__":
    main()
