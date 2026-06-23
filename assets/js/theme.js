(function () {
  var root = document.documentElement;
  var toggle = document.getElementById('theme-toggle');
  if (!toggle) return;

  function current() {
    return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }

  function apply(theme) {
    root.setAttribute('data-theme', theme);
    // Label shows the theme you'll switch TO.
    var label = toggle.querySelector('.theme-toggle__label');
    if (label) label.textContent = theme === 'dark' ? 'Light' : 'Dark';
    toggle.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
  }

  apply(current());

  toggle.addEventListener('click', function () {
    var next = current() === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('theme', next); } catch (e) {}
    apply(next);
  });

  // If the user hasn't chosen explicitly, follow system changes live.
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
      var stored;
      try { stored = localStorage.getItem('theme'); } catch (e2) {}
      if (!stored) apply(e.matches ? 'dark' : 'light');
    });
  }
})();
