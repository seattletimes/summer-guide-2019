require("./lib/ads");
var paywall = require("./lib/paywall");
setTimeout(() => paywall(11595997), 3000);

var track = require("./lib/tracking");

var $ = require("./lib/qsa");
var debounce = require("./lib/debounce");
var scrollTo = require("./lib/animateScroll");

var formatDate = function(date) {
  var months = [null, "Jan.", "Feb.", "Mar.", "Apr.", "May", "June", "July", "Aug.", "Sept.", "Oct.", "Nov.", "Dec."];
  var day = date.getDate();
  var month = date.getMonth() + 1;
  var year = date.getFullYear();
  return `${months[month]} ${day}`;
}

// rebuild data from the DOM
var rows = $(".summer-events tbody.events tr").map(function(tr) {
  var props = "event date location description".split(" ");
  var o = {};
  props.forEach(p => o[p] = tr.querySelector("." + p).innerHTML.trim().replace("&amp;", "&"));
  o.element = tr;
  o.category = tr.getAttribute("data-category");
  o.start = tr.getAttribute("data-start");
  o.end = tr.getAttribute("data-end");
  o.dates = tr.querySelector(".date").innerHTML;
  var [month] = o.dates.match(/thru|may|june|july|aug|sept/i) || [""];
  month = month.toLowerCase();
  o.month = month == "thru" ? "may" : month;

  var mesesList = ["may", "june", "july", "aug", "sept"];
  if (!o.start) {
    o.months = [o.month];
  } else {
    var indexStart = mesesList.indexOf(o.start);
    var indexEnd = mesesList.indexOf(o.end) + 1;
    o.months = mesesList.slice(indexStart, indexEnd);
  }
  return o;
});

var catList = document.querySelector(".filters .categories");
var monthList = document.querySelector(".filters .meses")
var searchBox = document.querySelector(".filters .search");
var table = document.querySelector(".summer-events");

var filterByCategory = function(cats, list) {
  return list.filter(r => cats.indexOf(r.category) > -1);
};

var filterByMonth = function(meses, list) {
  return list.filter(r => r.months.some(m => meses.indexOf(m) > -1));
};

var filterBySearch = function(q, list) {
  if (!q) return list;
  var re = new RegExp(q, "i");
  return list.filter(r => r.event.match(re) || r.location.match(re) || r.description.match(re));
};


var chainFilters = function() {
  var checked = $(".categories input[type=checkbox]:checked", catList).map(el => el.getAttribute("data-category"));
  var mesChecked = $(".meses input[type=checkbox]:checked", monthList).map(el => el.getAttribute("data-month"));
  if (!mesChecked.length) mesChecked = ["may", "june", "july", "aug", "sept"];
  var query = searchBox.value;
  var filters = [
    { filter: filterByCategory, value: checked },
    { filter: filterByMonth, value: mesChecked },
    { filter: filterBySearch, value: query }
  ];
  var filtered = rows;
  filters.forEach(def => filtered = def.filter(def.value, filtered));
  return filtered;
}

var applyFilters = debounce(function() {
  var final = chainFilters();
  rows.forEach(function(r) {
    if (final.indexOf(r) > -1) {
      r.element.classList.remove("hidden");
    } else {
      r.element.classList.add("hidden");
    }
  });

  if (!final.length) {
    table.classList.add("empty");
  } else {
    table.classList.remove("empty");
  }
});

catList.addEventListener("click", applyFilters);

monthList.addEventListener("click", applyFilters);

searchBox.addEventListener("keyup", applyFilters);


applyFilters();