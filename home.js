(() => {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav-links');
  const english = document.documentElement.lang === 'en';
  if (!toggle || !nav) return;
  const setOpen = open => {
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', english ? (open ? 'Close menu' : 'Open menu') : (open ? 'メニューを閉じる' : 'メニューを開く'));
  };
  document.documentElement.classList.add('js');
  toggle.hidden = false;
  setOpen(false);
  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {setOpen(false); toggle.focus();} });
})();
