/* Marginalia sidenotes.
   On wide screens, lift each kramdown footnote up beside the paragraph that
   references it. Below the breakpoint, leave the normal footnote list in place.
   No JS / unsupported -> footnotes render at the foot of the essay as usual. */
(function () {
  var WIDE = window.matchMedia('(min-width: 1000px)');
  var body = document.querySelector('.essay__body');
  if (!body) return;

  var notes = document.querySelector('.footnotes');
  if (!notes) return;

  function clear() {
    var made = body.querySelectorAll('.sidenote');
    for (var i = 0; i < made.length; i++) made[i].remove();
  }

  function build() {
    clear();

    if (!WIDE.matches) {
      notes.hidden = false;
      return;
    }
    notes.hidden = true;

    var refs = body.querySelectorAll('sup[id^="fnref"] a');
    var bodyTop = body.getBoundingClientRect().top + window.scrollY;
    var lastBottom = 0;

    for (var i = 0; i < refs.length; i++) {
      var ref = refs[i];
      var target = document.getElementById(ref.getAttribute('href').slice(1));
      if (!target) continue;

      // Copy the footnote text, dropping kramdown's back-arrow link.
      var clone = target.cloneNode(true);
      var back = clone.querySelector('.reversefootnote, a[href^="#fnref"]');
      if (back) back.remove();

      var aside = document.createElement('aside');
      aside.className = 'sidenote';
      aside.setAttribute('role', 'note');
      var num = document.createElement('span');
      num.className = 'sidenote__num';
      num.textContent = ref.textContent;
      aside.appendChild(num);
      while (clone.firstChild) aside.appendChild(clone.firstChild);

      var top = (ref.getBoundingClientRect().top + window.scrollY) - bodyTop;
      if (top < lastBottom + 14) top = lastBottom + 14;
      aside.style.top = top + 'px';

      body.appendChild(aside);
      lastBottom = top + aside.offsetHeight;

      // Clicking the mark highlights its note rather than jumping to a hidden list.
      ref.dataset.sidenote = '1';
    }

    body.addEventListener('click', onMarkClick);
  }

  function onMarkClick(e) {
    var mark = e.target.closest('sup[id^="fnref"] a');
    if (!mark || !WIDE.matches) return;
    e.preventDefault();
    var asides = body.querySelectorAll('.sidenote');
    var idx = -1, refs = body.querySelectorAll('sup[id^="fnref"] a');
    for (var i = 0; i < refs.length; i++) if (refs[i] === mark) idx = i;
    for (var j = 0; j < asides.length; j++) asides[j].classList.toggle('is-active', j === idx);
  }

  var t;
  function schedule() { clearTimeout(t); t = setTimeout(build, 150); }

  build();
  window.addEventListener('resize', schedule);
  if (WIDE.addEventListener) WIDE.addEventListener('change', build);
  // Webfont swap changes line heights — recompute once fonts settle.
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(build);
})();
