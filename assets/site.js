// E-Mail-Adresse erst im Browser zusammensetzen (Schutz vor einfachen Spam-Bots) und Jahreszahl aktualisieren
document.querySelectorAll('[data-m]').forEach(function (a) {
  var adresse = a.getAttribute('data-m').split('').reverse().join('');
  a.href = 'mailto:' + adresse;
  if (!a.classList.contains('knopf')) a.textContent = adresse;
});
document.querySelectorAll('[data-jahr]').forEach(function (e) { e.textContent = new Date().getFullYear(); });

// Externe Links: öffnen in einem neuen Fenster, vorher ein kurzer Hinweis, dass man diese Website verlässt.
// Ohne JavaScript oder in alten Browsern öffnen sie direkt in einem neuen Fenster (target="_blank" im HTML).
(function () {
  var dlg = null, ziel = '';
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
    var d = dialog();
    if (typeof d.showModal !== 'function') return;
    e.preventDefault();
    ziel = url.href;
    d.querySelector('.extern-ziel').textContent = url.hostname.replace(/^www\./, '');
    d.showModal();
    d.querySelector('[data-weiter]').focus();
  });
})();
