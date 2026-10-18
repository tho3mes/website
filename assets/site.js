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
      { modus: 'D', betreff: 'Unterlagen',
        gesprochen: '„Ähm, hallo Jana, ich schick dir die Unterlagen bis Montag, nein, Donnerstag. Viele Grüße, Thomas“',
        text: ['Hallo Jana,', '', 'ich schicke dir die Unterlagen bis Donnerstag.', '', 'Viele Grüße', 'Thomas'] },
      { modus: 'E', betreff: 'Documents',
        gesprochen: '„Hallo Jana, die Unterlagen kommen bis Donnerstag, Gruß Thomas“',
        text: ['Hi Jana,', '', 'I’ll send you the documents by Thursday.', '', 'Best regards,', 'Thomas'] }
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
      text: el.querySelector('[data-text]'), betreff: el.querySelector('[data-betreff]'),
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
