/* ══════════════════════════════════════════════════
   RANKIT — MOBILE JS
   Attivo solo su max-width: 767px
   Inietta la bottom navigation bar
══════════════════════════════════════════════════ */

(function() {
  if (window.innerWidth > 767) return;

  // ── INJECT BOTTOM BAR ──────────────────────────
  function injectBottomBar() {
    if (document.getElementById('mobile-bottom-bar')) return;

    var bar = document.createElement('nav');
    bar.id = 'mobile-bottom-bar';
    bar.innerHTML =
      '<button class="mbb-item active" id="mbb-home" onclick="mbbGo(\'home\')" aria-label="Home">' +
        '<i class="ti ti-home" aria-hidden="true"></i>' +
        '<span>Home</span>' +
      '</button>' +
      '<button class="mbb-item" id="mbb-explore" onclick="mbbGo(\'explore\')" aria-label="Esplora">' +
        '<i class="ti ti-search" aria-hidden="true"></i>' +
        '<span>Esplora</span>' +
      '</button>' +
      '<button class="mbb-fab" onclick="mbbNew()" aria-label="Nuovo campionato">' +
        '<i class="ti ti-plus" aria-hidden="true"></i>' +
      '</button>' +
      '<button class="mbb-item" id="mbb-dash" onclick="mbbGo(\'dash\')" aria-label="Dashboard">' +
        '<i class="ti ti-layout-dashboard" aria-hidden="true"></i>' +
        '<span>Dashboard</span>' +
      '</button>' +
      '<button class="mbb-item" id="mbb-profile" onclick="mbbGo(\'profile\')" aria-label="Profilo">' +
        '<i class="ti ti-user" aria-hidden="true"></i>' +
        '<span>Profilo</span>' +
      '</button>';

    document.body.appendChild(bar);
  }

  // ── NAVIGATION ─────────────────────────────────
  window.mbbGo = function(dest) {
    // Update active state
    ['home','explore','dash','profile'].forEach(function(id) {
      var el = document.getElementById('mbb-' + id);
      if (el) el.classList.toggle('active', id === dest);
    });

    if (dest === 'home') {
      if (typeof goHome === 'function') goHome();
      else if (typeof showPage === 'function') showPage('page-home');
    } else if (dest === 'explore') {
      if (typeof showPage === 'function') {
        showPage('page-home');
        // Focus search input
        setTimeout(function() {
          var inp = document.getElementById('search-input');
          if (inp) inp.focus();
        }, 200);
      }
    } else if (dest === 'dash') {
      if (typeof showPage === 'function') showPage('page-dashboard');
      if (typeof loadDashboard === 'function') loadDashboard();
    } else if (dest === 'profile') {
      if (typeof openMyProfile === 'function') openMyProfile();
    }
  };

  // FAB → apri modale nuovo campionato
  window.mbbNew = function() {
    var btn = document.querySelector('[onclick*="openNewChampModal"], [onclick*="newChamp"], [onclick*="openChampModal"]');
    if (btn) { btn.click(); return; }
    // Fallback: cerca il pulsante "+" nella pagina
    var fab = document.querySelector('.btn-new-champ, #btn-new-champ, [id*="new-champ"]');
    if (fab) { fab.click(); return; }
    // Ultimo fallback: mostra la pagina home e cerca il pulsante
    if (typeof showPage === 'function') showPage('page-home');
    setTimeout(function() {
      var anyNewBtn = document.querySelector('[onclick*="Champ"][onclick*="open"], [onclick*="champ"][onclick*="Modal"]');
      if (anyNewBtn) anyNewBtn.click();
    }, 300);
  };

  // ── SYNC WITH showPage ─────────────────────────
  // Intercept showPage to keep bottom bar in sync
  var _origShowPage = null;
  function hookShowPage() {
    if (typeof window.showPage !== 'function') return false;
    if (window._mbbHooked) return true;
    _origShowPage = window.showPage;
    window.showPage = function(pageId) {
      _origShowPage.apply(this, arguments);
      syncBottomBar(pageId);
    };
    window._mbbHooked = true;
    return true;
  }

  function syncBottomBar(pageId) {
    var map = {
      'page-home':      'home',
      'page-dashboard': 'dash',
      'page-profile':   'profile',
    };
    var active = map[pageId] || null;
    ['home','explore','dash','profile'].forEach(function(id) {
      var el = document.getElementById('mbb-' + id);
      if (el) el.classList.toggle('active', id === active);
    });
  }

  // ── INIT ───────────────────────────────────────
  function init() {
    injectBottomBar();

    // Try to hook showPage immediately, or wait for it
    if (!hookShowPage()) {
      var attempts = 0;
      var interval = setInterval(function() {
        attempts++;
        if (hookShowPage() || attempts > 20) clearInterval(interval);
      }, 200);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // ── HANDLE RESIZE ──────────────────────────────
  window.addEventListener('resize', function() {
    var bar = document.getElementById('mobile-bottom-bar');
    if (window.innerWidth > 767) {
      if (bar) bar.style.display = 'none';
    } else {
      if (bar) bar.style.display = 'flex';
      else injectBottomBar();
    }
  });

})();
