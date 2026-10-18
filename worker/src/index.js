// Kontaktformular-Endpunkt für oesterle.cloud (Cloudflare Worker)
// Nimmt das Formular an, prüft es knapp und leitet es über Cloudflare Email Routing als Mail an Thomas weiter.
// Speichert nichts. Kein Drittanbieter-Code, keine Abhängigkeiten.
import { EmailMessage } from "cloudflare:email";

const GRENZEN = { name: 100, email: 200, nachricht: 5000 };

export default {
  async fetch(request, env) {
    if (request.method !== "POST") {
      return new Response("Nur POST erlaubt.", { status: 405, headers: { Allow: "POST" } });
    }
    // Nur Absendungen von der eigenen Website annehmen
    if ((request.headers.get("Origin") || "") !== env.ERLAUBT) {
      return fehler(env, 403, "Diese Anfrage kam nicht von oesterle.cloud.");
    }
    let daten;
    try { daten = await request.formData(); } catch (e) { return fehler(env, 400, "Das Formular war nicht lesbar."); }
    const feld = (k) => String(daten.get(k) || "").trim();

    // Honigtopf: Menschen sehen das Feld nicht, Bots füllen es aus. Still „erfolgreich“ antworten.
    if (feld("website")) return weiter(env);

    const name = feld("name").replace(/[\r\n\t]+/g, " ").slice(0, GRENZEN.name);
    const email = feld("email");
    const nachricht = feld("nachricht");
    if (email.length > GRENZEN.email || !/^[^\s@<>"(),;:]+@[^\s@<>"(),;:]+\.[^\s@<>"(),;:]+$/.test(email)) {
      return fehler(env, 400, "Bitte gib eine gültige E-Mail-Adresse an, damit ich antworten kann.");
    }
    if (nachricht.length < 5 || nachricht.length > GRENZEN.nachricht) {
      return fehler(env, 400, "Die Nachricht ist leer oder länger als 5000 Zeichen.");
    }

    const text = [
      "Neue Nachricht über das Kontaktformular auf oesterle.cloud",
      "",
      "Name: " + (name || "(nicht angegeben)"),
      "E-Mail: " + email,
      "",
      "Nachricht:",
      nachricht,
      "",
      "--",
      "Antworten geht direkt an den Absender (Reply-To)."
    ].join("\r\n");

    const roh = mime({
      von: env.ABSENDER,
      an: env.ZIEL,
      antwort: email,
      betreff: "Kontaktformular oesterle.cloud" + (name ? ": " + name.slice(0, 40) : ""),
      text
    });

    try {
      await env.MAIL.send(new EmailMessage(env.ABSENDER, env.ZIEL, roh));
    } catch (e) {
      return fehler(env, 502, "Das Senden hat gerade nicht geklappt. Bitte versuch es später noch einmal oder schreib mir per E-Mail.");
    }
    return weiter(env);
  }
};

function weiter(env) {
  return Response.redirect(env.DANKE, 303);
}

function fehler(env, status, meldung) {
  const html = '<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>Nachricht nicht gesendet</title>' +
    '<style>body{margin:0;background:#F7F5F0;color:#16161A;font:17px/1.65 system-ui,sans-serif}main{max-width:640px;margin:0 auto;padding:96px 24px}h1{font:400 44px/1.1 Georgia,serif;margin:0 0 24px}a{color:#C4381A}</style></head>' +
    '<body><main><h1>Nachricht nicht gesendet</h1><p>' + meldung + '</p><p><a href="' + env.ERLAUBT + '/#kontakt">Zurück zum Formular</a></p></main></body></html>';
  return new Response(html, { status, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });
}

// UTF-8 sicher nach Base64 (ohne Abhängigkeiten)
function b64(s) {
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

// Schlichte RFC-5322-Mail: Klartext, UTF-8, Base64-Body, Betreff nach RFC 2047
function mime({ von, an, antwort, betreff, text }) {
  const body = b64(text).replace(/.{1,76}/g, "$&\r\n");
  return [
    "From: Kontaktformular <" + von + ">",
    "To: <" + an + ">",
    "Reply-To: <" + antwort + ">",
    "Subject: =?UTF-8?B?" + b64(betreff) + "?=",
    "Date: " + new Date().toUTCString(),
    "Message-ID: <" + crypto.randomUUID() + "@oesterle.cloud>",
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=utf-8",
    "Content-Transfer-Encoding: base64",
    "",
    body
  ].join("\r\n");
}
