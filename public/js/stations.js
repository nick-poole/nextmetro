/* Stations Page — Filter, Search (with aliases), Line Page Link */
(function () {
  'use strict';

  var filters = document.querySelectorAll('.stations-filter');
  var searchInput = document.getElementById('stations-search-input');
  var stationRows = document.querySelectorAll('.stations-row');
  var resultsCount = document.getElementById('stations-results-count');
  var noResults = document.getElementById('stations-no-results');
  var stationList = document.getElementById('stations-list');
  var lineLink = document.getElementById('stations-line-link');
  var lineLinkA = document.getElementById('stations-line-link-a');
  var lineLinkText = document.getElementById('stations-line-link-text');
  var activeLine = 'all';
  var searchTerm = '';

  var lineNames = {
    red: 'Red Line',
    orange: 'Orange Line',
    blue: 'Blue Line',
    yellow: 'Yellow Line',
    green: 'Green Line',
    silver: 'Silver Line'
  };

  function applyFilters() {
    var visible = 0;

    for (var i = 0; i < stationRows.length; i++) {
      var row = stationRows[i];
      var lines = row.getAttribute('data-lines');
      var name = row.querySelector('.stations-row-name').textContent.toLowerCase();
      var aliases = row.getAttribute('data-aliases') || '';

      var matchesLine = activeLine === 'all' || lines.indexOf(activeLine) !== -1;
      var matchesSearch = !searchTerm ||
        name.indexOf(searchTerm) !== -1 ||
        aliases.split(' ').some(function (a) { return a && a.indexOf(searchTerm) !== -1; });

      // For multi-word aliases, also check the full alias string
      if (!matchesSearch && searchTerm && aliases) {
        matchesSearch = aliases.indexOf(searchTerm) !== -1;
      }

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
      var label = activeLine === 'all' ? '' : lineNames[activeLine] + ' ';
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

    // Line page link
    if (activeLine !== 'all' && lineLink) {
      lineLinkA.href = '/lines/' + activeLine + '/';
      lineLinkText.textContent = 'View ' + lineNames[activeLine] + ' page';
      lineLink.hidden = false;
    } else if (lineLink) {
      lineLink.hidden = true;
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
