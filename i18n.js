/* Ceylon Substrates — shared full-page translation layer.
   Uses Google Website Translate under the hood (cookie-driven), so EVERY
   line of text on EVERY page is translated on selection — not just curated
   strings. A custom dropdown drives it; the native Google banner is hidden. */
(function () {
  var LANG_NAMES = {
    en: 'English', ja: '日本語', ar: 'العربية', ko: '한국어', zh: '中文',
    nl: 'Nederlands', de: 'Deutsch', fr: 'Français', es: 'Español',
    ru: 'Русский', tr: 'Türkçe', it: 'Italiano'
  };
  // our code -> google language code
  var GT = {
    ja: 'ja', ar: 'ar', ko: 'ko', zh: 'zh-CN', nl: 'nl', de: 'de',
    fr: 'fr', es: 'es', ru: 'ru', tr: 'tr', it: 'it'
  };
  var ORDER = ['en', 'ja', 'zh', 'ko', 'ar', 'nl', 'de', 'fr', 'es', 'ru', 'tr', 'it'];

  window.CS_LANG_NAMES = LANG_NAMES;
  window.CS_LANG_ORDER = ORDER;

  function setCookie(name, value) {
    var host = location.hostname;
    var variants = ['', ';domain=' + host, ';domain=.' + host];
    variants.forEach(function (d) {
      document.cookie = name + '=' + value + ';path=/' + d;
    });
  }
  function delCookie(name) {
    var host = location.hostname;
    var exp = ';expires=Thu, 01 Jan 1970 00:00:00 GMT';
    var variants = ['', ';domain=' + host, ';domain=.' + host];
    variants.forEach(function (d) {
      document.cookie = name + '=;path=/' + d + exp;
    });
  }

  window.CScurrentLang = function () {
    return localStorage.getItem('cs_lang') || 'en';
  };

  window.CSsetLang = function (code) {
    if (!LANG_NAMES[code]) code = 'en';
    localStorage.setItem('cs_lang', code);
    if (code === 'en') {
      delCookie('googtrans');
      // Cleanest way to restore original text is a reload with the cookie cleared.
      location.reload();
      return;
    }
    var g = GT[code] || code;
    setCookie('googtrans', '/en/' + g);
    // Prefer driving the live Google combo (instant, reliable); fall back to reload.
    if (!applyToCombo(g)) location.reload();
  };

  // Drive the hidden Google combo directly. Returns true if applied.
  function applyToCombo(gcode) {
    var combo = document.querySelector('.goog-te-combo');
    if (!combo) return false;
    combo.value = gcode;
    combo.dispatchEvent(new Event('change'));
    return true;
  }

  // Once Google is ready, apply the stored language (covers cross-page navigation
  // without depending on Google's own cookie auto-apply). Keep enforcing it for a
  // few seconds so Google's own last-language auto-restore can't override our choice.
  function applyStoredWhenReady() {
    var code = window.CScurrentLang();
    if (code === 'en') return;
    var g = GT[code] || code;
    var start = Date.now();
    var iv = setInterval(function () {
      var combo = document.querySelector('.goog-te-combo');
      if (combo && combo.value !== g) {
        combo.value = g;
        combo.dispatchEvent(new Event('change'));
      }
      if (Date.now() - start > 5000) clearInterval(iv);
    }, 250);
  }

  /* ---- Google Translate element (hidden) ---- */
  window.googleTranslateElementInit = function () {
    try {
      new google.translate.TranslateElement(
        { pageLanguage: 'en', autoDisplay: false },
        'cs_google_translate_element'
      );
    } catch (e) {}
  };

  function loadGoogle() {
    if (document.getElementById('cs_google_translate_element')) return;
    var mount = document.createElement('div');
    mount.id = 'cs_google_translate_element';
    mount.style.display = 'none';
    document.body.appendChild(mount);
    var s = document.createElement('script');
    s.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    s.async = true;
    document.body.appendChild(s);
  }

  /* ---- Hide the native Google banner / tooltip chrome ---- */
  function injectHideCss() {
    var css =
      '.goog-te-banner-frame,.goog-te-balloon-frame{display:none!important;}' +
      'body{top:0!important;position:static!important;}' +
      '#goog-gt-tt,.goog-te-spinner-pos{display:none!important;}' +
      '.goog-tooltip,.goog-tooltip:hover{display:none!important;}' +
      '.goog-text-highlight{background:none!important;box-shadow:none!important;}' +
      '#cs_google_translate_element{display:none!important;}' +
      '.skiptranslate iframe{display:none!important;visibility:hidden!important;}';
    var st = document.createElement('style');
    st.setAttribute('data-cs-i18n', '1');
    st.textContent = css;
    (document.head || document.documentElement).appendChild(st);
  }

  /* ---- Custom dropdown selector, injected into any #cs-lang-mount ---- */
  function buildSelector(mount) {
    if (mount.getAttribute('data-cs-built')) return;
    mount.setAttribute('data-cs-built', '1');
    mount.setAttribute('translate', 'no');
    mount.classList.add('notranslate');
    mount.style.position = 'relative';
    var cur = window.CScurrentLang();

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.style.cssText =
      'display:flex;align-items:center;gap:6px;padding:8px 12px;background:transparent;' +
      'border:1px solid rgba(12,27,42,0.15);border-radius:6px;cursor:pointer;' +
      "font-family:'DM Sans',sans-serif;font-size:12px;font-weight:500;color:#0C1B2A;" +
      'letter-spacing:0.02em;transition:border-color 0.3s;';
    btn.innerHTML =
      '<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="currentColor" stroke-width="1.2"></circle><path d="M1 7h12M7 1c2 1.8 3 4 3 6s-1 4.2-3 6c-2-1.8-3-4-3-6s1-4.2 3-6z" stroke="currentColor" stroke-width="1.2"></path></svg>' +
      '<span class="cs-lang-cur">' + (LANG_NAMES[cur] || 'English') + '</span>' +
      '<svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M3 4l2 2 2-2" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"></path></svg>';

    var menu = document.createElement('div');
    menu.style.cssText =
      'position:absolute;top:calc(100% + 8px);right:0;background:#FFFFFF;border:1px solid rgba(12,27,42,0.1);' +
      'border-radius:10px;box-shadow:0 20px 50px rgba(12,27,42,0.18);padding:6px;min-width:160px;' +
      'display:none;flex-direction:column;gap:2px;z-index:200;max-height:340px;overflow-y:auto;';

    ORDER.forEach(function (code) {
      var item = document.createElement('button');
      item.type = 'button';
      item.style.cssText =
        'text-align:left;padding:9px 14px;background:transparent;border:none;border-radius:6px;cursor:pointer;' +
        "font-family:'DM Sans',sans-serif;font-size:13px;color:#0C1B2A;transition:background 0.2s;" +
        'font-weight:' + (code === cur ? '600' : '400') + ';';
      item.textContent = LANG_NAMES[code];
      item.addEventListener('mouseenter', function () { item.style.background = '#F7F8FA'; });
      item.addEventListener('mouseleave', function () { item.style.background = 'transparent'; });
      item.addEventListener('click', function (e) {
        e.stopPropagation();
        window.CSsetLang(code);
      });
      menu.appendChild(item);
    });

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      menu.style.display = menu.style.display === 'flex' ? 'none' : 'flex';
    });
    btn.addEventListener('mouseenter', function () { btn.style.borderColor = 'rgba(212,175,110,0.6)'; });
    btn.addEventListener('mouseleave', function () { btn.style.borderColor = 'rgba(12,27,42,0.15)'; });
    document.addEventListener('click', function () { menu.style.display = 'none'; });

    mount.appendChild(btn);
    mount.appendChild(menu);
  }

  function buildAll() {
    var mounts = document.querySelectorAll('#cs-lang-mount, .cs-lang-mount');
    for (var i = 0; i < mounts.length; i++) buildSelector(mounts[i]);
  }

  function init() {
    injectHideCss();
    loadGoogle();
    buildAll();
    applyStoredWhenReady();
    // Re-scan a few times for late-rendered navs (DC streaming / hydration).
    var tries = 0;
    var iv = setInterval(function () {
      tries++;
      buildAll();
      if (tries > 40) clearInterval(iv);
    }, 150);
  }

  if (document.body) init();
  else document.addEventListener('DOMContentLoaded', init);
})();
