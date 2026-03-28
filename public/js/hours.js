/* ═══════════════════════════════════════════
   NextMetro — Hours Page
   Live status indicator + accordion behavior
═══════════════════════════════════════════ */

(function () {
  'use strict';

  // ── Live Status Indicator ──────────────────

  function getMetroStatus() {
    var now = new Date();
    var day = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    var hour = now.getHours();
    var minute = now.getMinutes();
    var time = hour + (minute / 60);

    // Opening times
    var opensAt = (day >= 1 && day <= 5) ? 5 : 6; // Mon-Fri: 5 AM, Sat-Sun: 6 AM

    // Closing times (using 24+ hour notation for past midnight)
    var closesAt;
    if (day === 5 || day === 6) { // Friday or Saturday
      closesAt = 26; // 2 AM next day
    } else {
      closesAt = 24; // Midnight
    }

    // Adjust time for past-midnight calculation
    var adjustedTime = (hour < 5) ? time + 24 : time;

    // Check if we're in the early morning hours after extended Friday/Saturday service
    var previousDay = (day === 0) ? 6 : day - 1;
    var isPastMidnightExtended = (hour < 2) && (previousDay === 5 || previousDay === 6);

    var isOpen;
    if (hour < 5 && isPastMidnightExtended) {
      // Between midnight and 2 AM after Friday/Saturday — still open
      isOpen = adjustedTime < 26;
    } else if (hour < 5) {
      // Between midnight and 5 AM on other days — closed
      isOpen = false;
    } else {
      isOpen = time >= opensAt && time < 24;
    }

    // Determine next opening/closing time for display
    var closesAtDisplay, opensAtDisplay;

    if (day === 5 || day === 6) {
      closesAtDisplay = '2:00 AM';
    } else if (isPastMidnightExtended && isOpen) {
      closesAtDisplay = '2:00 AM';
    } else {
      closesAtDisplay = 'Midnight';
    }

    // Tomorrow's opening
    var tomorrow = (day + 1) % 7;
    if (tomorrow >= 1 && tomorrow <= 5) {
      opensAtDisplay = '5:00 AM';
    } else {
      opensAtDisplay = '6:00 AM';
    }

    return {
      isOpen: isOpen,
      closesAt: closesAtDisplay,
      opensAt: opensAtDisplay
    };
  }

  function updateStatus() {
    var status = getMetroStatus();
    var dot = document.getElementById('hours-status-dot');
    var text = document.getElementById('hours-status-text');
    var detail = document.getElementById('hours-status-detail');

    if (!dot || !text || !detail) return;

    if (status.isOpen) {
      dot.className = 'hours-status-dot hours-status-dot--open';
      text.textContent = 'Metro is OPEN';
      detail.textContent = 'Closes at ' + status.closesAt;
    } else {
      dot.className = 'hours-status-dot hours-status-dot--closed';
      text.textContent = 'Metro is CLOSED';
      detail.textContent = 'Opens at ' + status.opensAt;
    }
  }

  // Update on load and every 30 seconds
  updateStatus();
  setInterval(updateStatus, 30000);

})();
