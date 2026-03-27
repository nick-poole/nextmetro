/* Stations Page — Filter & Search */
(function () {
  'use strict';

  var filters = document.querySelectorAll('.stations-filter');
  var searchInput = document.getElementById('stations-search-input');
  var stationRows = document.querySelectorAll('.stations-row');
  var resultsCount = document.getElementById('stations-results-count');
  var noResults = document.getElementById('stations-no-results');
  var stationList = document.getElementById('stations-list');
  var activeLine = 'all';
  var searchTerm = '';

  function applyFilters() {
    var visible = 0;

    for (var i = 0; i < stationRows.length; i++) {
      var row = stationRows[i];
      var lines = row.getAttribute('data-lines');
      var name = row.querySelector('.stations-row-name').textContent.toLowerCase();

      var matchesLine = activeLine === 'all' || lines.indexOf(activeLine) !== -1;
      var matchesSearch = !searchTerm || name.indexOf(searchTerm) !== -1;

      if (matchesLine && matchesSearch) {
        row.hidden = false;
        visible++;
      } else {
        row.hidden = true;
      }
    }

    // Update results count
    if (activeLine === 'all' && !searchTerm) {
      resultsCount.textContent = 'Showing all ' + stationRows.length + ' stations';
    } else {
      var label = activeLine === 'all' ? '' : activeLine.charAt(0).toUpperCase() + activeLine.slice(1) + ' Line ';
      resultsCount.textContent = 'Showing ' + visible + ' ' + label + 'station' + (visible !== 1 ? 's' : '');
    }

    // No results state
    if (visible === 0) {
      noResults.hidden = false;
      stationList.hidden = true;
    } else {
      noResults.hidden = true;
      stationList.hidden = false;
    }
  }

  // Line filter clicks
  for (var i = 0; i < filters.length; i++) {
    filters[i].addEventListener('click', function () {
      for (var j = 0; j < filters.length; j++) {
        filters[j].classList.remove('stations-filter--active');
      }
      this.classList.add('stations-filter--active');
      activeLine = this.getAttribute('data-line');
      applyFilters();
    });
  }

  // Search input
  if (searchInput) {
    searchInput.addEventListener('input', function () {
      searchTerm = this.value.toLowerCase().trim();
      applyFilters();
    });
  }
})();
