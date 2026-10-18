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

// Animierte Szene (Illustration, kein Video): Kürzel drücken, sprechen, KI bereitet auf, Text erscheint.
// Läuft nur, solange sie sichtbar ist. Bei „Bewegung reduzieren“ oder ohne JavaScript bleibt das Standbild aus dem HTML stehen.
(function () {
  var szenen = document.querySelectorAll('[data-szene]');
  if (!szenen.length) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var ablauf = [
    { modus: 'D', betreff: 'Unterlagen',
      gesprochen: '„Ähm, hallo Jana, ich schick dir die Unterlagen bis Montag, nein, Donnerstag. Viele Grüße, Thomas“',
      text: ['Hallo Jana,', '', 'ich schicke dir die Unterlagen bis Donnerstag.', '', 'Viele Grüße', 'Thomas'] },
    { modus: 'E', betreff: 'Documents',
      gesprochen: '„Hallo Jana, die Unterlagen kommen bis Donnerstag, Gruß Thomas“',
      text: ['Hi Jana,', '', 'I’ll send you the documents by Thursday.', '', 'Best regards,', 'Thomas'] }
  ];
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
    var q = {
      taste: el.querySelector('[data-taste]'), status: el.querySelector('[data-status]'),
      zeit: el.querySelector('[data-zeit]'), gesprochen: el.querySelector('[data-gesprochen]'),
      text: el.querySelector('[data-text]'), betreff: el.querySelector('[data-betreff]'),
      modi: el.querySelectorAll('[data-modus]')
    };
    if (!q.taste || !q.status || !q.zeit || !q.gesprochen || !q.text || !q.betreff) return;
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
    function runde() {
      var s = ablauf[nr++ % ablauf.length];
      Array.prototype.forEach.call(q.modi, function (m) { m.classList.toggle('aktiv', m.getAttribute('data-modus') === s.modus); });
      q.betreff.textContent = s.betreff;
      q.taste.classList.remove('gedrueckt');
      zustand('bereit', 'Bereit');
      q.zeit.textContent = '0:00';
      q.gesprochen.textContent = '';
      q.gesprochen.classList.remove('weg');
      q.text.textContent = '';
      warte(1100, function () {
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
                  zustand('fertig', 'Eingefügt');
                  zeige(woerter(q.text, s.text), 75, function () { warte(3800, runde); });
                });
              });
            });
          });
        });
      });
    }
    function start() { if (laeuft) return; laeuft = true; runde(); }
    function stopp() { laeuft = false; clearTimeout(timer); clearInterval(uhr); }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (e) {
        sichtbar = e[0].isIntersecting;
        if (sichtbar && !document.hidden) start(); else stopp();
      }, { threshold: 0.3 }).observe(el);
    } else { sichtbar = true; start(); }
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stopp(); else if (sichtbar) start();
    });
  });
})();
