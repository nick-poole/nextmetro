// ==============================
// NextMetro - Fare Guide Pages JS
// Depends on shared.js (loaded first) for API_BASE_URL, fetchWithRetry, safeJson.
//
// Two independent jobs, both progressive enhancements:
//
//   1. Fare fill. Any element carrying data-fare-field inside (or on) an
//      element carrying data-fare-pair="FROM:TO" is filled from the same
//      WMATA station-to-station endpoint the /fares/ calculator uses. The
//      markup ships with the tariff-derived bound already in place, so the
//      page is correct and complete before this file runs and nothing moves
//      if the request fails.
//
//   2. Break-even. The monthly-pass module, priced off the rule that a
//      monthly pass costs 32x your one-way fare.
// ==============================
(function () {
  'use strict';

  // ---- Reduced fare: 50% of the applicable fare, rounded DOWN to the next
  // $0.05. Same rule as the calculator in fares.js; the $1.10 floor and $3.35
  // ceiling fall out of halving $2.25 and $6.75 rather than being separate
  // rules.
  function reducedFare(amount) {
    var cents = Math.round(amount * 100);
    var rounded = Math.floor(Math.floor(cents / 2) / 5) * 5;
    return Math.max(1.10, rounded / 100);
  }

  function money(value) {
    return '$' + value.toFixed(2);
  }

  // ==============================
  // 1. Fare fill
  // ==============================
  function fillFares() {
    var fields = document.querySelectorAll('[data-fare-field]');
    if (!fields.length || typeof API_BASE_URL === 'undefined') return;

    // Group the fields by station pair so each pair is requested once.
    var byPair = {};
    Array.prototype.forEach.call(fields, function (el) {
      var owner = el.closest('[data-fare-pair]');
      if (!owner) return;
      var pair = owner.getAttribute('data-fare-pair');
      if (!/^[A-Z][0-9]{2}:[A-Z][0-9]{2}$/.test(pair)) return;
      (byPair[pair] = byPair[pair] || []).push(el);
    });

    Object.keys(byPair).forEach(function (pair) {
      var codes = pair.split(':');
      fetchWithRetry(API_BASE_URL + '/api/fare/' + codes[0] + '/' + codes[1])
        .then(function (res) {
          if (!res || !res.ok) throw new Error('Fare API error');
          return safeJson(res);
        })
        .then(function (data) {
          var info = data.StationToStationInfos && data.StationToStationInfos[0];
          if (!info) return;
          var fare = info.RailFare || {};
          // PeakTime is the weekday distance fare, OffPeakTime the late
          // night / weekend fare. Same mapping the calculator uses.
          var weekday = Number(fare.PeakTime) || 0;
          var offpeak = Number(fare.OffPeakTime) || 0;
          var minutes = Number(info.RailTime) || 0;

          byPair[pair].forEach(function (el) {
            var field = el.getAttribute('data-fare-field');
            if (field === 'weekday' && weekday) el.textContent = money(weekday);
            else if (field === 'offpeak' && offpeak) el.textContent = money(offpeak);
            else if (field === 'senior' && weekday) el.textContent = money(reducedFare(weekday));
            else if (field === 'senior-offpeak' && offpeak) el.textContent = money(reducedFare(offpeak));
            else if (field === 'save' && weekday && offpeak) el.textContent = money(Math.max(0, weekday - offpeak));
            else if (field === 'time' && minutes) el.textContent = minutes + ' min';
          });
        })
        .catch(function (err) {
          // The tariff-derived figures already in the markup stand.
          if (window.console && console.warn) {
            console.warn('Fare fill unavailable for ' + pair + ':', err.message);
          }
        });
    });
  }

  // ==============================
  // 2. Monthly pass break-even
  // A monthly pass is priced at 32x your one-way fare level, so it pays for
  // itself at 32 one-way trips. Pay-per-ride is costed over four commuting
  // weeks, which is what makes 4 round trips a week the break-even week.
  // ==============================
  var WEEKS_PER_MONTH = 4;
  var PASS_MULTIPLE = 32;

  function initBreakEven() {
    var root = document.querySelector('[data-breakeven]');
    if (!root) return;

    var fareInput = root.querySelector('[data-breakeven-fare]');
    var tripsInput = root.querySelector('[data-breakeven-trips]');
    var outRide = root.querySelector('[data-breakeven-out="ride"]');
    var outPass = root.querySelector('[data-breakeven-out="pass"]');
    var outSave = root.querySelector('[data-breakeven-out="save"]');
    var outVerdict = root.querySelector('[data-breakeven-out="verdict"]');
    if (!fareInput || !tripsInput || !outRide || !outPass || !outSave) return;

    function clamp(value, min, max, fallback) {
      if (!isFinite(value)) return fallback;
      return Math.min(max, Math.max(min, value));
    }

    function update() {
      var fare = clamp(parseFloat(fareInput.value), 2.25, 6.75, 2.50);
      var roundTrips = clamp(parseInt(tripsInput.value, 10), 1, 25, 5);

      var oneWayTrips = roundTrips * 2 * WEEKS_PER_MONTH;
      var payPerRide = oneWayTrips * fare;
      var pass = PASS_MULTIPLE * fare;
      var saving = payPerRide - pass;

      outRide.textContent = money(payPerRide);
      outPass.textContent = money(pass);
      outSave.textContent = money(Math.abs(saving));
      outSave.classList.toggle('fg-calc-value--win', saving > 0);
      outSave.classList.toggle('fg-calc-value--lose', saving <= 0);

      if (outVerdict) {
        outVerdict.textContent = saving > 0
          ? 'At ' + oneWayTrips + ' one-way trips a month, the pass wins by ' + money(saving) + '.'
          : saving === 0
            ? 'At ' + oneWayTrips + ' one-way trips a month, the pass exactly breaks even.'
            : 'At ' + oneWayTrips + ' one-way trips a month, pay-per-ride is cheaper by ' + money(-saving) + '.';
      }
    }

    fareInput.addEventListener('input', update);
    tripsInput.addEventListener('input', update);
    fareInput.addEventListener('change', update);
    tripsInput.addEventListener('change', update);
    update();
  }

  function init() {
    fillFares();
    initBreakEven();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
