// E-Mail-Adresse erst im Browser zusammensetzen (Schutz vor einfachen Spam-Bots) und Jahreszahl aktualisieren
document.querySelectorAll('[data-m]').forEach(function (a) {
  var adresse = a.getAttribute('data-m').split('').reverse().join('');
  a.href = 'mailto:' + adresse;
  if (!a.classList.contains('knopf')) a.textContent = adresse;
});
document.querySelectorAll('[data-jahr]').forEach(function (e) { e.textContent = new Date().getFullYear(); });

// Externe Links: öffnen in einem neuen Fenster, vorher ein kurzer Hinweis, dass man diese Website verlässt.
// Ausnahme: eigene Ziele (GitHub tho3mes, Ko-fi tho3mes) und Downloads öffnen ohne Hinweis.
// Ohne JavaScript oder in alten Browsern öffnen sie direkt in einem neuen Fenster (target="_blank" im HTML).
(function () {
  var dlg = null, ziel = '';
  var eigene = /^(github\.com\/tho3mes|ko-fi\.com\/tho3mes)(\/|$)/i;
  function dialog() {
    if (dlg) return dlg;
    dlg = document.createElement('dialog');
    dlg.className = 'extern';
    dlg.setAttribute('aria-labelledby', 'extern-titel');
    dlg.innerHTML = '<p class="vorzeile">Externer Link</p>' +
      '<h2 id="extern-titel">Du verlässt diese Website</h2>' +
      '<p>Der Link führt zu <strong class="extern-ziel"></strong> und öffnet sich in einem neuen Fenster. Für Inhalte und Datenschutz dort ist der jeweilige Anbieter verantwortlich.</p>' +
      '<p class="aktionen"><button type="button" class="knopf" data-weiter>Weiter</button> <button type="button" class="knopf zweit" data-zurueck>Hierbleiben</button></p>';
    document.body.appendChild(dlg);
    dlg.querySelector('[data-weiter]').addEventListener('click', function () {
      window.open(ziel, '_blank', 'noopener,noreferrer');
      dlg.close();
    });
    dlg.querySelector('[data-zurueck]').addEventListener('click', function () { dlg.close(); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
    return dlg;
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a[href]') : null;
    if (!a || e.defaultPrevented || e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
    var url;
    try { url = new URL(a.getAttribute('href'), location.href); } catch (x) { return; }
    if ((url.protocol !== 'http:' && url.protocol !== 'https:') || url.hostname === location.hostname) return;
    if (eigene.test(url.hostname.replace(/^www\./, '') + url.pathname)) return;
    var d = dialog();
    if (typeof d.showModal !== 'function') return;
    e.preventDefault();
    ziel = url.href;
    d.querySelector('.extern-ziel').textContent = url.hostname.replace(/^www\./, '');
    d.showModal();
    d.querySelector('[data-weiter]').focus();
  });
})();

// Animierte Szenen (Illustration, kein Video): Kürzel drücken, sprechen, KI bereitet auf, Text erscheint.
// Typ über data-szene: leer/mail, prompt, englisch, umschreiben. Startet erst, wenn die Szene ins Bild scrollt,
// und pausiert außerhalb. Bei „Bewegung reduzieren“ oder ohne JavaScript bleibt das Standbild aus dem HTML stehen.
(function () {
  var szenen = document.querySelectorAll('[data-szene]');
  if (!szenen.length) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var ablaeufe = {
    mail: [
      { an: 'Jana', betreff: 'Unterlagen',
        gesprochen: '„Ähm, hallo Jana, ich schick dir die Unterlagen bis Montag, nein, Donnerstag. Viele Grüße, Thomas“',
        text: ['Hallo Jana,', '', 'ich schicke dir die Unterlagen bis Donnerstag.', '', 'Viele Grüße', 'Thomas'] },
      { an: 'Herr Weber', betreff: 'Ihr Angebot',
        gesprochen: '„Mail an Herrn Weber, danke fürs Gespräch, Angebot kommt bis Freitag, Gruß Thomas“',
        text: ['Sehr geehrter Herr Weber,', '', 'vielen Dank für das Gespräch. Ihr Angebot folgt bis Freitag.', '', 'Mit freundlichen Grüßen', 'Thomas Oesterle'] }
    ],
    prompt: [
      { gesprochen: '„Ähm, mach mir einen Prompt: Die KI soll meine Notizen vom Kundentermin zusammenfassen, Entscheidungen, offene Punkte, nächste Schritte, kurz bitte“',
        text: ['Fasse meine Notizen aus dem Kundentermin zusammen.', '', 'Gliederung: Entscheidungen, offene Punkte, nächste Schritte.', 'Höchstens acht Stichpunkte, sachlicher Ton.', '', 'Notizen:'] }
    ],
    englisch: [
      { gesprochen: '„Hi Mark, kurze Info, die Lieferung verschiebt sich auf nächsten Dienstag, ich melde mich, sobald ich mehr weiß“',
        text: ['Hi Mark,', '', 'quick heads-up: the delivery has moved to next Tuesday.', 'I’ll get back to you as soon as I know more.'] }
    ],
    umschreiben: [
      { vorher: 'Wie bereits mehrfach mitgeteilt, benötigen wir die Unterlagen zwingend bis Freitag. Andernfalls können wir den Termin nicht halten.',
        gesprochen: '„Freundlicher und kürzer, bitte“',
        text: ['Kurze Erinnerung: Schickst du mir die Unterlagen bis Freitag? Dann klappt unser Termin sicher.'] }
    ]
  };
  function woerter(ziel, zeilen) {
    var liste = [];
    ziel.textContent = '';
    zeilen.forEach(function (zeile) {
      var z = document.createElement('span');
      z.className = 'zeile';
      if (zeile) zeile.split(' ').forEach(function (w, i) {
        var s = document.createElement('span');
        s.className = 'wort';
        s.textContent = (i ? ' ' : '') + w;
        z.appendChild(s);
        liste.push(s);
      });
      ziel.appendChild(z);
    });
    return liste;
  }
  Array.prototype.forEach.call(szenen, function (el) {
    var ablauf = ablaeufe[el.getAttribute('data-szene')] || ablaeufe.mail;
    var q = {
      taste: el.querySelector('[data-taste]'), status: el.querySelector('[data-status]'),
      zeit: el.querySelector('[data-zeit]'), gesprochen: el.querySelector('[data-gesprochen]'),
      text: el.querySelector('[data-text]'), betreff: el.querySelector('[data-betreff]'), an: el.querySelector('[data-an]'),
      modi: el.querySelectorAll('[data-modus]')
    };
    if (!q.taste || !q.status || !q.zeit || !q.gesprochen || !q.text) return;
    var nr = 0, timer = null, uhr = null, laeuft = false, sichtbar = false;
    function warte(ms, fn) { timer = setTimeout(function () { if (laeuft) fn(); }, ms); }
    function zustand(z, label) { el.setAttribute('data-zustand', z); q.status.textContent = label; }
    function zeige(liste, takt, fertig) {
      var i = 0;
      (function weiter() {
        if (i < liste.length) { liste[i++].classList.add('da'); warte(takt, weiter); } else fertig();
      })();
    }
    function tippen(fn) {
      q.taste.classList.add('gedrueckt');
      warte(220, function () { q.taste.classList.remove('gedrueckt'); fn(); });
    }
    function diktat(s) {
      tippen(function () {
        zustand('aufnahme', 'Aufnahme');
        var sek = 0;
        uhr = setInterval(function () { sek++; q.zeit.textContent = '0:0' + Math.min(sek, 9); }, 1000);
        zeige(woerter(q.gesprochen, [s.gesprochen]), 170, function () {
          warte(450, function () {
            clearInterval(uhr);
            tippen(function () {
              zustand('denkt', 'Aufbereitung …');
              warte(1100, function () {
                q.gesprochen.classList.add('weg');
                q.text.classList.remove('markiert');
                zustand('fertig', s.vorher ? 'Ersetzt' : 'Eingefügt');
                zeige(woerter(q.text, s.text), 75, function () { warte(3800, naechste); });
              });
            });
          });
        });
      });
    }
    function runde() {
      var s = ablauf[nr++ % ablauf.length];
      if (s.modus) Array.prototype.forEach.call(q.modi, function (m) { m.classList.toggle('aktiv', m.getAttribute('data-modus') === s.modus); });
      if (s.betreff && q.betreff) q.betreff.textContent = s.betreff;
      if (s.an && q.an) q.an.textContent = s.an;
      q.taste.classList.remove('gedrueckt');
      zustand('bereit', 'Bereit');
      q.zeit.textContent = '0:00';
      q.gesprochen.textContent = '';
      q.gesprochen.classList.remove('weg');
      q.text.classList.remove('markiert');
      q.text.textContent = '';
      if (s.vorher) {
        var a = document.createElement('span');
        a.className = 'auswahl';
        a.textContent = s.vorher;
        q.text.appendChild(a);
      }
      warte(1100, function () {
        if (!s.vorher) { diktat(s); return; }
        q.text.classList.add('markiert');
        zustand('bereit', 'Text markiert');
        warte(1000, function () { diktat(s); });
      });
    }
    // Nach jeder Runde: Ein Szenenwechsel (Startseite) kann übernehmen, sonst startet die nächste Runde.
    function naechste() {
      var ev = new CustomEvent('szene:fertig', { bubbles: true, cancelable: true });
      if (el.dispatchEvent(ev)) runde(); else stopp();
    }
    function darf() { return sichtbar && !document.hidden && !el.classList.contains('ruht'); }
    function start() { if (laeuft) return; laeuft = true; runde(); }
    function stopp() { laeuft = false; clearTimeout(timer); clearInterval(uhr); }
    el.addEventListener('szene:start', function () { if (darf()) start(); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (e) {
        sichtbar = e[0].isIntersecting;
        if (darf()) start(); else stopp();
      }, { threshold: 0.3 }).observe(el);
    } else { sichtbar = true; if (darf()) start(); }
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stopp(); else if (darf()) start();
    });
  });
  // Szenenwechsel: mehrere Szenen liegen übereinander, immer eine ist aktiv, nach jeder Runde kommt die nächste.
  Array.prototype.forEach.call(document.querySelectorAll('[data-szenenwechsel]'), function (w) {
    var teile = w.querySelectorAll('[data-szene]');
    if (teile.length < 2) return;
    var i = 0;
    w.addEventListener('szene:fertig', function (e) {
      if (e.target !== teile[i]) return;
      e.preventDefault();
      teile[i].classList.add('ruht');
      i = (i + 1) % teile.length;
      teile[i].classList.remove('ruht');
      teile[i].dispatchEvent(new CustomEvent('szene:start'));
    });
  });
})();

// Wortmeldung: App-Nachbau in Schritten (Illustration, kein Video). data-takte = Dauer je Schritt in ms.
// Kinder steuern sich über Attribute: data-zeige="1 3" (sichtbar in Schritt 1 und 3), data-an="gut:3;druck:2" (Klasse je Schritt),
// data-breite="1:20%;4:30%" (Balkenbreite), data-tippe="Text" mit data-tippe-bei (tippt in diesem Schritt) und data-tippe-voll (steht fertig da).
// Startet beim Hineinscrollen, pausiert außerhalb. Bei „Bewegung reduzieren“ oder ohne JavaScript bleibt das Standbild aus dem HTML.
(function () {
  var szenen = document.querySelectorAll('[data-appszene]');
  if (!szenen.length) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  function drin(liste, s) { return (' ' + liste + ' ').indexOf(' ' + s + ' ') >= 0; }
  function wert(liste, s) {
    var teile = liste.split(';');
    for (var i = 0; i < teile.length; i++) {
      var t = teile[i].split(':');
      if (t[0] === String(s)) return t[1];
    }
    return '';
  }
  Array.prototype.forEach.call(szenen, function (el) {
    var takte = (el.getAttribute('data-takte') || '').split(',').map(Number).filter(function (x) { return x > 0; });
    if (!takte.length) return;
    var schritt = 0, timer = null, tipp = null, laeuft = false, sichtbar = false;
    function alle(sel, fn) { Array.prototype.forEach.call(el.querySelectorAll(sel), fn); }
    function tippe(e, text) {
      var i = 0;
      e.textContent = '';
      e.classList.add('tippt');
      clearInterval(tipp);
      tipp = setInterval(function () {
        if (!laeuft) { clearInterval(tipp); return; }
        if (i < text.length) e.textContent += text.charAt(i++);
        else { clearInterval(tipp); e.classList.remove('tippt'); }
      }, 90);
    }
    function zeige(s) {
      el.setAttribute('data-schritt', s);
      alle('[data-zeige]', function (e) { e.hidden = !drin(e.getAttribute('data-zeige'), s); });
      alle('[data-an]', function (e) {
        e.getAttribute('data-an').split(';').forEach(function (p) {
          var t = p.split(':');
          if (t.length === 2) e.classList.toggle(t[0], drin(t[1], s));
        });
      });
      alle('[data-breite]', function (e) { var w = wert(e.getAttribute('data-breite'), s); if (w) e.style.width = w; });
      alle('[data-tippe]', function (e) {
        if (e.getAttribute('data-tippe-bei') === String(s)) { tippe(e, e.getAttribute('data-tippe')); return; }
        e.classList.remove('tippt');
        e.textContent = drin(e.getAttribute('data-tippe-voll') || '', s) ? e.getAttribute('data-tippe') : '';
      });
    }
    function weiter() {
      schritt = schritt % takte.length + 1;
      zeige(schritt);
      timer = setTimeout(function () { if (laeuft) weiter(); }, takte[schritt - 1]);
    }
    function start() { if (laeuft) return; laeuft = true; schritt = 0; weiter(); }
    function stopp() { laeuft = false; clearTimeout(timer); clearInterval(tipp); }
    function darf() { return sichtbar && !document.hidden; }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (e) {
        sichtbar = e[0].isIntersecting;
        if (darf()) start(); else stopp();
      }, { threshold: 0.3 }).observe(el);
    } else { sichtbar = true; start(); }
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stopp(); else if (darf()) start();
    });
  });
})();
