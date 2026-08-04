document.getElementById('site-root').innerHTML=window.DS_HTML||'';

(() => {
  if (new URLSearchParams(location.search).has('static')) document.documentElement.classList.add('static-preview');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealEls = [...document.querySelectorAll('[data-reveal]')];
  if (reduced || document.documentElement.classList.contains('static-preview')) revealEls.forEach(el => el.classList.add('is-visible'));
  else {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold:.12, rootMargin:'0px 0px -8% 0px' });
    revealEls.forEach(el => { if (!el.closest('.hero')) observer.observe(el); });
  }

  const progress = document.getElementById('progressBar');
  const updateProgress = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.width = (max > 0 ? scrollY / max * 100 : 0) + '%';
  };
  addEventListener('scroll', updateProgress, { passive:true }); updateProgress();

  const links = [...document.querySelectorAll('.nav-links a')];
  const sections = links.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  const navObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id));
    });
  }, { rootMargin:'-34% 0px -58% 0px', threshold:0 });
  sections.forEach(s => navObserver.observe(s));

  const langButtons = [...document.querySelectorAll('[data-lang]')];
  langButtons.forEach(button => button.addEventListener('click', () => {
    const lang = button.dataset.lang;
    langButtons.forEach(b => b.classList.toggle('active', b === button));
    document.querySelectorAll('[data-copy-en]').forEach(el => el.textContent = el.dataset['copy' + lang[0].toUpperCase() + lang.slice(1)]);
  }));
})();
