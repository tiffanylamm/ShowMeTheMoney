(function () {
  try {
    var s = localStorage.getItem('theme');
    var d = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (s === 'dark' || (s !== 'light' && d)) {
      document.documentElement.classList.add('dark');
    }
  } catch (_) {}
})();
