// ==============================
// NextMetro — Global Station Search
// Standalone search bar for core & line pages.
// Uses the same station data as home.js.
// Always navigates to /station/{slug}/ on selection.
// ==============================

(function () {
  var searchStations = [
    { name: 'Metro Center', slug: 'metro-center', lines: ['red', 'orange', 'blue', 'silver'] },
    { name: 'Farragut North', slug: 'farragut-north', lines: ['red'] },
    { name: 'Dupont Circle', slug: 'dupont-circle', lines: ['red'] },
    { name: 'Woodley Park-Zoo/Adams Morgan', slug: 'woodley-park', lines: ['red'] },
    { name: 'Cleveland Park', slug: 'cleveland-park', lines: ['red'] },
    { name: 'Van Ness-UDC', slug: 'van-ness-udc', lines: ['red'] },
    { name: 'Tenleytown-AU', slug: 'tenleytown-au', lines: ['red'] },
    { name: 'Friendship Heights', slug: 'friendship-heights', lines: ['red'] },
    { name: 'Bethesda', slug: 'bethesda', lines: ['red'] },
    { name: 'Medical Center', slug: 'medical-center', lines: ['red'] },
    { name: 'Grosvenor-Strathmore', slug: 'grosvenor-strathmore', lines: ['red'] },
    { name: 'North Bethesda-White Flint', slug: 'north-bethesda', lines: ['red'] },
    { name: 'Twinbrook', slug: 'twinbrook', lines: ['red'] },
    { name: 'Rockville', slug: 'rockville', lines: ['red'] },
    { name: 'Shady Grove', slug: 'shady-grove', lines: ['red'] },
    { name: 'Gallery Pl-Chinatown', slug: 'gallery-place', lines: ['red', 'yellow', 'green'] },
    { name: 'Judiciary Square', slug: 'judiciary-square', lines: ['red'] },
    { name: 'Union Station', slug: 'union-station', lines: ['red'] },
    { name: 'Rhode Island Ave-Brentwood', slug: 'rhode-island-ave', lines: ['red'] },
    { name: 'Brookland-CUA', slug: 'brookland-cua', lines: ['red'] },
    { name: 'Fort Totten', slug: 'fort-totten', lines: ['red', 'yellow', 'green'] },
    { name: 'Takoma', slug: 'takoma', lines: ['red'] },
    { name: 'Silver Spring', slug: 'silver-spring', lines: ['red'] },
    { name: 'Forest Glen', slug: 'forest-glen', lines: ['red'] },
    { name: 'Wheaton', slug: 'wheaton', lines: ['red'] },
    { name: 'Glenmont', slug: 'glenmont', lines: ['red'] },
    { name: 'NoMa-Gallaudet U', slug: 'noma', lines: ['red'] },
    { name: 'McPherson Square', slug: 'mcpherson-square', lines: ['orange', 'blue', 'silver'] },
    { name: 'Farragut West', slug: 'farragut-west', lines: ['orange', 'blue', 'silver'] },
    { name: 'Foggy Bottom-GWU', slug: 'foggy-bottom', lines: ['orange', 'blue', 'silver'] },
    { name: 'Rosslyn', slug: 'rosslyn', lines: ['orange', 'blue', 'silver'] },
    { name: 'Arlington Cemetery', slug: 'arlington-cemetery', lines: ['blue'] },
    { name: 'Pentagon', slug: 'pentagon', lines: ['blue', 'yellow'] },
    { name: 'Pentagon City', slug: 'pentagon-city', lines: ['blue', 'yellow'] },
    { name: 'Crystal City', slug: 'crystal-city', lines: ['blue', 'yellow'] },
    { name: 'Ronald Reagan Washington National Airport', slug: 'reagan-airport', lines: ['blue', 'yellow'] },
    { name: 'Potomac Yard', slug: 'potomac-yard', lines: ['blue', 'yellow'] },
    { name: 'Braddock Road', slug: 'braddock-road', lines: ['blue', 'yellow'] },
    { name: 'King St-Old Town', slug: 'king-street', lines: ['blue', 'yellow'] },
    { name: 'Eisenhower Avenue', slug: 'eisenhower-ave', lines: ['yellow'] },
    { name: 'Huntington', slug: 'huntington', lines: ['yellow'] },
    { name: 'Federal Triangle', slug: 'federal-triangle', lines: ['orange', 'blue', 'silver'] },
    { name: 'Smithsonian', slug: 'smithsonian', lines: ['orange', 'blue', 'silver'] },
    { name: "L'Enfant Plaza", slug: 'lenfant-plaza', lines: ['orange', 'blue', 'yellow', 'green', 'silver'] },
    { name: 'Federal Center SW', slug: 'federal-center-sw', lines: ['orange', 'blue', 'silver'] },
    { name: 'Capitol South', slug: 'capitol-south', lines: ['orange', 'blue', 'silver'] },
    { name: 'Eastern Market', slug: 'eastern-market', lines: ['orange', 'blue', 'silver'] },
    { name: 'Potomac Ave', slug: 'potomac-ave', lines: ['orange', 'blue', 'silver'] },
    { name: 'Stadium-Armory', slug: 'stadium-armory', lines: ['orange', 'blue', 'silver'] },
    { name: 'Minnesota Ave', slug: 'minnesota-ave', lines: ['orange', 'silver'] },
    { name: 'Deanwood', slug: 'deanwood', lines: ['orange', 'silver'] },
    { name: 'Cheverly', slug: 'cheverly', lines: ['orange', 'silver'] },
    { name: 'Landover', slug: 'landover', lines: ['orange', 'silver'] },
    { name: 'New Carrollton', slug: 'new-carrollton', lines: ['orange', 'silver'] },
    { name: 'Mt Vernon Sq 7th St-Convention Center', slug: 'mt-vernon-square', lines: ['yellow', 'green'] },
    { name: 'Shaw-Howard U', slug: 'shaw-howard', lines: ['yellow', 'green'] },
    { name: 'U Street/African-Amer Civil War Memorial/Cardozo', slug: 'u-street', lines: ['yellow', 'green'] },
    { name: 'Columbia Heights', slug: 'columbia-heights', lines: ['yellow', 'green'] },
    { name: 'Georgia Ave-Petworth', slug: 'georgia-ave-petworth', lines: ['yellow', 'green'] },
    { name: 'West Hyattsville', slug: 'west-hyattsville', lines: ['yellow', 'green'] },
    { name: 'Hyattsville Crossing', slug: 'hyattsville-crossing', lines: ['yellow', 'green'] },
    { name: 'College Park-U of Md', slug: 'college-park', lines: ['yellow', 'green'] },
    { name: 'Greenbelt', slug: 'greenbelt', lines: ['yellow', 'green'] },
    { name: 'Archives-Navy Memorial-Penn Quarter', slug: 'archives', lines: ['yellow', 'green'] },
    { name: 'Waterfront', slug: 'waterfront', lines: ['green'] },
    { name: 'Navy Yard-Ballpark', slug: 'navy-yard', lines: ['green'] },
    { name: 'Anacostia', slug: 'anacostia', lines: ['green'] },
    { name: 'Congress Heights', slug: 'congress-heights', lines: ['green'] },
    { name: 'Southern Ave', slug: 'southern-ave', lines: ['green'] },
    { name: 'Naylor Road', slug: 'naylor-road', lines: ['green'] },
    { name: 'Suitland', slug: 'suitland', lines: ['green'] },
    { name: 'Branch Ave', slug: 'branch-ave', lines: ['green'] },
    { name: 'Benning Road', slug: 'benning-road', lines: ['blue', 'silver'] },
    { name: 'Capitol Heights', slug: 'capitol-heights', lines: ['blue', 'silver'] },
    { name: 'Addison Road-Seat Pleasant', slug: 'addison-road', lines: ['blue', 'silver'] },
    { name: 'Morgan Boulevard', slug: 'morgan-boulevard', lines: ['blue', 'silver'] },
    { name: 'Downtown Largo', slug: 'downtown-largo', lines: ['blue', 'silver'] },
    { name: 'Van Dorn Street', slug: 'van-dorn-street', lines: ['blue'] },
    { name: 'Franconia-Springfield', slug: 'franconia-springfield', lines: ['blue'] },
    { name: 'Court House', slug: 'court-house', lines: ['orange', 'silver'] },
    { name: 'Clarendon', slug: 'clarendon', lines: ['orange', 'silver'] },
    { name: 'Virginia Square-GMU', slug: 'virginia-square', lines: ['orange', 'silver'] },
    { name: 'Ballston-MU', slug: 'ballston', lines: ['orange', 'silver'] },
    { name: 'East Falls Church', slug: 'east-falls-church', lines: ['orange', 'silver'] },
    { name: 'West Falls Church', slug: 'west-falls-church', lines: ['orange'] },
    { name: 'Dunn Loring-Merrifield', slug: 'dunn-loring', lines: ['orange'] },
    { name: 'Vienna/Fairfax-GMU', slug: 'vienna', lines: ['orange'] },
    { name: 'McLean', slug: 'mclean', lines: ['silver'] },
    { name: 'Tysons', slug: 'tysons', lines: ['silver'] },
    { name: 'Greensboro', slug: 'greensboro', lines: ['silver'] },
    { name: 'Spring Hill', slug: 'spring-hill', lines: ['silver'] },
    { name: 'Wiehle-Reston East', slug: 'wiehle-reston-east', lines: ['silver'] },
    { name: 'Reston Town Center', slug: 'reston-town-center', lines: ['silver'] },
    { name: 'Herndon', slug: 'herndon', lines: ['silver'] },
    { name: 'Innovation Center', slug: 'innovation-center', lines: ['silver'] },
    { name: 'Washington Dulles International Airport', slug: 'washington-dulles', lines: ['silver'] },
    { name: 'Loudoun Gateway', slug: 'loudoun-gateway', lines: ['silver'] },
    { name: 'Ashburn', slug: 'ashburn', lines: ['silver'] },
  ];

  var searchLineColors = {
    red: '#D41140',
    orange: '#F09500',
    blue: '#00A8E8',
    yellow: '#FFD400',
    green: '#00BD45',
    silver: '#9BA5A5',
  };

  var input = document.getElementById('station-input');
  var dropdown = document.getElementById('station-dropdown');
  if (!input || !dropdown) return;

  var highlighted = -1;

  function filter(query) {
    var q = query.toLowerCase().trim();
    if (!q) return searchStations.slice(0, 8);
    return searchStations.filter(function (s) {
      return s.name.toLowerCase().indexOf(q) !== -1;
    }).slice(0, 8);
  }

  function render(filtered) {
    dropdown.innerHTML = '';
    highlighted = -1;
    if (filtered.length === 0) {
      dropdown.classList.remove('open');
      return;
    }
    filtered.forEach(function (station, i) {
      var li = document.createElement('li');
      var dots = document.createElement('span');
      dots.className = 'line-dots';
      station.lines.forEach(function (line) {
        var dot = document.createElement('span');
        dot.className = 'line-dot';
        dot.style.backgroundColor = searchLineColors[line] || '#999';
        dots.appendChild(dot);
      });
      li.appendChild(dots);
      li.appendChild(document.createTextNode(station.name));
      li.dataset.index = i;
      li.addEventListener('click', function () {
        window.location.href = '/station/' + station.slug + '/';
      });
      dropdown.appendChild(li);
    });
    dropdown.classList.add('open');
  }

  function highlight(items) {
    for (var i = 0; i < items.length; i++) {
      if (i === highlighted) {
        items[i].classList.add('highlighted');
        items[i].scrollIntoView({ block: 'nearest' });
      } else {
        items[i].classList.remove('highlighted');
      }
    }
  }

  input.addEventListener('input', function () {
    render(filter(input.value));
  });

  input.addEventListener('focus', function () {
    input.select();
    render(filter(input.value));
  });

  input.addEventListener('keydown', function (e) {
    var items = dropdown.querySelectorAll('li');
    if (!items.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      highlighted = Math.min(highlighted + 1, items.length - 1);
      highlight(items);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      highlighted = Math.max(highlighted - 1, 0);
      highlight(items);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlighted >= 0 && items[highlighted]) {
        items[highlighted].click();
      }
    } else if (e.key === 'Escape') {
      dropdown.classList.remove('open');
      input.blur();
    }
  });

  document.addEventListener('click', function (e) {
    if (!e.target.closest('#station-search-wrapper')) {
      dropdown.classList.remove('open');
    }
  });
})();
