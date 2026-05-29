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

  // ── SEARCH OVERLAY ─────────────────────────────
  function openMobileSearch() {
    var bar = document.querySelector('.search-bar');
    var filters = document.getElementById('search-filters');
    var backdrop = document.getElementById('mobile-search-backdrop');

    // Add close button if not present
    if (bar && !document.getElementById('mobile-search-close')) {
      // Submit button (yellow, with search icon)
      var submitBtn = document.createElement('button');
      submitBtn.id = 'mobile-search-submit';
      submitBtn.innerHTML = '<i class="ti ti-arrow-right" aria-hidden="true"></i>';
      submitBtn.setAttribute('aria-label', 'Cerca');
      submitBtn.onclick = function() {
        if (typeof onSearchInput === 'function') onSearchInput();
        var inp = document.getElementById('champ-search');
        if (inp) inp.blur();
      };
      bar.appendChild(submitBtn);
      // Close button
      var closeBtn = document.createElement('button');
      closeBtn.id = 'mobile-search-close';
      closeBtn.innerHTML = '✕';
      closeBtn.onclick = closeMobileSearch;
      bar.appendChild(closeBtn);
    }

    // Create backdrop if not present
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = 'mobile-search-backdrop';
      backdrop.onclick = closeMobileSearch;
      document.body.appendChild(backdrop);
    }

    if (bar) bar.classList.add('mobile-open');
    if (filters) filters.classList.add('mobile-open');
    backdrop.classList.add('open');

    // Focus input and wire Enter/Go key
    setTimeout(function() {
      var inp = document.getElementById('champ-search');
      if (inp) {
        inp.focus();
        // Fire search on Enter / mobile Go button
        if (!inp._mbbSearchHooked) {
          inp._mbbSearchHooked = true;
          inp.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.keyCode === 13) {
              e.preventDefault();
              if (typeof onSearchInput === 'function') onSearchInput();
              inp.blur(); // hide keyboard after search
            }
          });
          // Also ensure oninput fires on mobile (some keyboards use compositionend)
          inp.addEventListener('compositionend', function() {
            if (typeof onSearchInput === 'function') onSearchInput();
          });
        }
      }
    }, 100);
  }

  function closeMobileSearch() {
    var bar = document.querySelector('.search-bar');
    var filters = document.getElementById('search-filters');
    var backdrop = document.getElementById('mobile-search-backdrop');
    if (bar) bar.classList.remove('mobile-open');
    if (filters) filters.classList.remove('mobile-open');
    if (backdrop) backdrop.classList.remove('open');
    // Reset active bottom bar item back to home
    ['home','explore','dash','profile'].forEach(function(id) {
      var el = document.getElementById('mbb-' + id);
      if (el) el.classList.toggle('active', id === 'home');
    });
  }

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
      if (typeof showPage === 'function') showPage('page-home');
      setTimeout(openMobileSearch, 150);
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
  // Use MutationObserver on .page.active instead of hooking showPage
  // to avoid any risk of loops
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

  function hookShowPage() {
    // Watch for .page elements becoming active via class changes
    var observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(m) {
        if (m.type === 'attributes' && m.attributeName === 'class') {
          var el = m.target;
          if (el.classList.contains('active') && el.classList.contains('page')) {
            syncBottomBar(el.id);
          }
        }
      });
    });
    document.querySelectorAll('.page').forEach(function(page) {
      observer.observe(page, { attributes: true });
    });
    return true;
  }

  // ── INIT ───────────────────────────────────────
  function init() {
    injectBottomBar();
    // Wait for DOM to be fully ready before observing pages
    setTimeout(hookShowPage, 500);
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
