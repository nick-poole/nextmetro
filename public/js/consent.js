/* ==============================
   NextMetro — Cookie Consent Manager
   Handles GDPR/CCPA consent, GPC detection,
   and conditional PostHog loading.
   ============================== */

(function () {
  'use strict';

  var CONSENT_KEY = 'nm-consent';
  var POSTHOG_KEY = 'phc_rryswF9bsmYv4G2qck3JeWJEzaPsvn2Wo478Ku68sFgC';
  var POSTHOG_HOST = 'https://us.i.posthog.com';

  // ==============================
  // localStorage helpers (Safari private browsing may throw)
  // ==============================
  function getConsent() {
    try { return localStorage.getItem(CONSENT_KEY); } catch (e) { return null; }
  }

  function setConsent(value) {
    try { localStorage.setItem(CONSENT_KEY, value); } catch (e) { /* noop */ }
  }

  // ==============================
  // GPC / DNT detection
  // ==============================
  function hasPrivacySignal() {
    return !!(navigator.globalPrivacyControl || navigator.doNotTrack === '1');
  }

  // ==============================
  // PostHog loader
  // ==============================
  var posthogLoaded = false;

  function loadPostHog() {
    if (posthogLoaded) return;
    posthogLoaded = true;

    !function(t,e){var o,n,p,r;e.__SV||(window.posthog && window.posthog.__loaded)||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="Ii init Di qi Sr Bi Zi Pi capture calculateEventProperties Yi register register_once register_for_session unregister unregister_for_session Xi getFeatureFlag getFeatureFlagPayload getFeatureFlagResult isFeatureEnabled reloadFeatureFlags updateFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSurveysLoaded onSessionId getSurveys getActiveMatchingSurveys renderSurvey displaySurvey cancelPendingSurvey canRenderSurvey canRenderSurveyAsync Ji identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException startExceptionAutocapture stopExceptionAutocapture loadToolbar get_property getSessionProperty Wi Vi createPersonProfile setInternalOrTestUser Gi Fi Ki opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing get_explicit_consent_status is_capturing clear_opt_in_out_capturing $i debug Tr Ui getPageViewId captureTraceFeedback captureTraceMetric Ri".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);

    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      defaults: '2026-01-30',
      person_profiles: 'identified_only',
      respect_dnt: true
    });
  }

  // ==============================
  // Clear PostHog data on opt-out
  // ==============================
  function clearPostHog() {
    if (window.posthog && typeof posthog.opt_out_capturing === 'function') {
      posthog.opt_out_capturing();
    }
    // Remove PostHog cookies
    document.cookie.split(';').forEach(function (c) {
      var name = c.trim().split('=')[0];
      if (name.indexOf('ph_') === 0) {
        document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
      }
    });
    // Remove PostHog localStorage entries
    try {
      Object.keys(localStorage).forEach(function (key) {
        if (key.indexOf('ph_') === 0) localStorage.removeItem(key);
      });
    } catch (e) { /* noop */ }
  }

  // ==============================
  // Focus trap utility
  // ==============================
  function trapFocus(container) {
    var focusable = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusable.length) return;
    var first = focusable[0];
    var last = focusable[focusable.length - 1];

    container.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });
  }

  // ==============================
  // Banner DOM
  // ==============================
  function createBanner() {
    var banner = document.createElement('div');
    banner.className = 'consent-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Cookie consent');
    banner.innerHTML =
      '<div class="consent-banner__inner">' +
        '<p class="consent-banner__text">' +
          'This site uses optional cookies for analytics. Nothing is tracked without your consent. ' +
          '<a href="/privacy/" class="consent-banner__link">Privacy Policy</a>' +
        '</p>' +
        '<div class="consent-banner__actions">' +
          '<button class="consent-banner__btn consent-banner__btn--accept" type="button">Accept Cookies</button>' +
          '<button class="consent-banner__btn consent-banner__btn--decline" type="button">Decline Cookies</button>' +
        '</div>' +
      '</div>';

    banner.querySelector('.consent-banner__btn--accept').addEventListener('click', function () {
      setConsent('accepted');
      loadPostHog();
      removeBanner(banner);
    });

    banner.querySelector('.consent-banner__btn--decline').addEventListener('click', function () {
      setConsent('declined');
      removeBanner(banner);
    });

    // Escape key dismisses the banner (same as decline)
    banner.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        setConsent('declined');
        removeBanner(banner);
      }
    });

    document.body.appendChild(banner);
    // Trigger reflow for CSS transition
    banner.offsetHeight;
    banner.classList.add('consent-banner--visible');

    // Move focus to the first action button for screen readers
    banner.querySelector('.consent-banner__btn--accept').focus();
  }

  function removeBanner(banner) {
    banner.classList.remove('consent-banner--visible');
    banner.addEventListener('transitionend', function () {
      if (banner.parentNode) banner.parentNode.removeChild(banner);
    });
    // Fallback removal if transition doesn't fire
    setTimeout(function () {
      if (banner.parentNode) banner.parentNode.removeChild(banner);
    }, 400);
  }

  // ==============================
  // Preferences modal
  // ==============================
  var triggerElement = null;

  function createPreferencesModal() {
    triggerElement = document.activeElement;
    var consent = getConsent();
    var isAccepted = consent === 'accepted';

    var overlay = document.createElement('div');
    overlay.className = 'consent-modal-overlay';
    overlay.innerHTML =
      '<div class="consent-modal" role="dialog" aria-label="Cookie preferences" aria-modal="true">' +
        '<div class="consent-modal__header">' +
          '<h2 class="consent-modal__title">Cookie Preferences</h2>' +
          '<button class="consent-modal__close" type="button" aria-label="Close">&times;</button>' +
        '</div>' +
        '<div class="consent-modal__body">' +
          '<div class="consent-modal__row">' +
            '<div class="consent-modal__info">' +
              '<h3 class="consent-modal__category" id="consent-essential-label">Essential Analytics</h3>' +
              '<p class="consent-modal__desc">Cookie-free, privacy-focused page view analytics. No personal data is collected.</p>' +
            '</div>' +
            '<span class="consent-modal__badge" aria-label="Essential analytics are always on">Always On</span>' +
          '</div>' +
          '<div class="consent-modal__row">' +
            '<div class="consent-modal__info">' +
              '<h3 class="consent-modal__category" id="consent-enhanced-label">Enhanced Analytics</h3>' +
              '<p class="consent-modal__desc">Helps us understand how visitors navigate the site with session data and event tracking. Uses cookies.</p>' +
            '</div>' +
            '<button class="consent-modal__toggle' + (isAccepted ? ' consent-modal__toggle--on' : '') + '" type="button" role="switch" aria-checked="' + isAccepted + '" aria-labelledby="consent-enhanced-label">' +
              '<span class="consent-modal__toggle-knob"></span>' +
            '</button>' +
          '</div>' +
          (hasPrivacySignal() ?
            '<p class="consent-modal__gpc-notice" role="status">Your browser is sending a Global Privacy Control signal. Enhanced analytics are disabled to respect your privacy preference.</p>' : '') +
        '</div>' +
        '<div class="consent-modal__footer">' +
          '<button class="consent-modal__save" type="button">Save Preferences</button>' +
        '</div>' +
      '</div>';

    var toggle = overlay.querySelector('.consent-modal__toggle');
    var toggleState = isAccepted;

    // Disable toggle if GPC is active
    if (hasPrivacySignal()) {
      toggle.disabled = true;
      toggle.classList.add('consent-modal__toggle--disabled');
    }

    toggle.addEventListener('click', function () {
      if (hasPrivacySignal()) return;
      toggleState = !toggleState;
      toggle.classList.toggle('consent-modal__toggle--on', toggleState);
      toggle.setAttribute('aria-checked', String(toggleState));
    });

    // Save
    overlay.querySelector('.consent-modal__save').addEventListener('click', function () {
      if (toggleState) {
        setConsent('accepted');
        loadPostHog();
      } else {
        setConsent('declined');
        clearPostHog();
      }
      closeModal(overlay);
    });

    // Close button
    overlay.querySelector('.consent-modal__close').addEventListener('click', function () {
      closeModal(overlay);
    });

    // Click outside to close
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeModal(overlay);
    });

    // Escape key to close
    overlay.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeModal(overlay);
    });

    document.body.appendChild(overlay);
    overlay.offsetHeight;
    overlay.classList.add('consent-modal-overlay--visible');

    // Focus trap and initial focus
    trapFocus(overlay.querySelector('.consent-modal'));
    overlay.querySelector('.consent-modal__close').focus();
  }

  function closeModal(overlay) {
    overlay.classList.remove('consent-modal-overlay--visible');
    overlay.addEventListener('transitionend', function () {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    });
    setTimeout(function () {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    }, 400);
    // Restore focus to the element that triggered the modal
    if (triggerElement && typeof triggerElement.focus === 'function') {
      triggerElement.focus();
    }
  }

  // ==============================
  // Public API for footer links
  // ==============================
  window.openCookiePreferences = function () {
    createPreferencesModal();
  };

  // ==============================
  // Init
  // ==============================
  function init() {
    // GPC signal — auto-decline, don't show banner
    if (hasPrivacySignal()) {
      var current = getConsent();
      if (current !== 'declined') setConsent('declined');
      return;
    }

    var consent = getConsent();
    if (consent === 'accepted') {
      loadPostHog();
    } else if (consent === 'declined') {
      // Do nothing
    } else {
      // No choice yet — show banner
      createBanner();
    }
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
