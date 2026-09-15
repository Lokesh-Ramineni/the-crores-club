(function () {
  var STORAGE_KEY = "bidhouse-theme";
  var toggle = document.getElementById("theme-toggle");
  if (!toggle) return;

  var saved = localStorage.getItem(STORAGE_KEY);
  if (saved === "dark") {
    toggle.checked = true;
  } else if (saved === "light") {
    toggle.checked = false;
  }

  toggle.addEventListener("change", function () {
    localStorage.setItem(STORAGE_KEY, toggle.checked ? "dark" : "light");
  });
})();