(() => {
  const preloader = document.getElementById('site-preloader');
  const wall = document.getElementById('preloader-wall');

  if (!preloader || !wall) {
    document.body.classList.remove('is-preloading');
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const skipAnimation = params.has('static') || params.has('no-preloader');
  const colors = ['#8b3c20', '#9f4824', '#74311d', '#aa5229', '#81401f', '#b05a2d', '#6e321e'];
  let released = false;
  let resizeTimer;

  function buildWall() {
    wall.replaceChildren();

    const width = window.innerWidth;
    const height = window.innerHeight;
    const narrow = width < 640;
    const brickHeight = narrow ? Math.max(48, Math.min(62, height / 12)) : Math.max(54, Math.min(76, height / 10));
    const brickWidth = brickHeight * (narrow ? 1.95 : 2.2);
    const rows = Math.ceil(height / brickHeight) + 1;
    const columns = Math.ceil(width / brickWidth) + 2;
    const centerX = width / 2;
    const centerY = height / 2;
    const maxDistance = Math.hypot(centerX, centerY);
    const fragment = document.createDocumentFragment();

    for (let row = 0; row < rows; row += 1) {
      const offset = row % 2 === 0 ? -brickWidth * .5 : 0;

      for (let column = 0; column < columns; column += 1) {
        const brick = document.createElement('span');
        const left = offset + column * brickWidth;
        const top = row * brickHeight;
        const x = left + brickWidth / 2;
        const y = top + brickHeight / 2;
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.hypot(dx, dy);
        const normalizedDistance = Math.min(distance / maxDistance, 1);
        const magnitude = distance || 1;
        const travel = (narrow ? 185 : 250) + Math.random() * (narrow ? 105 : 155);
        const horizontalJitter = (Math.random() - .5) * (narrow ? 54 : 92);
        const verticalJitter = (Math.random() - .5) * (narrow ? 44 : 74);
        const moveX = dx / magnitude * travel + horizontalJitter;
        const moveY = dy / magnitude * travel + verticalJitter + Math.max(0, normalizedDistance - .45) * 45;
        const moveZ = 35 + Math.random() * 130;
        const delay = 120 + normalizedDistance * 500 + Math.random() * 115;
        const gap = narrow ? 3 : 4;

        brick.className = 'preloader-brick';
        brick.style.left = `${left + gap / 2}px`;
        brick.style.top = `${top + gap / 2}px`;
        brick.style.width = `${brickWidth - gap}px`;
        brick.style.height = `${brickHeight - gap}px`;
        brick.style.setProperty('--brick-color', colors[Math.floor(Math.random() * colors.length)]);
        brick.style.setProperty('--brick-x', `${moveX}px`);
        brick.style.setProperty('--brick-y', `${moveY}px`);
        brick.style.setProperty('--brick-z', `${moveZ}px`);
        brick.style.setProperty('--brick-rotate', `${(Math.random() - .5) * 36}deg`);
        brick.style.setProperty('--brick-delay', `${delay}ms`);
        fragment.appendChild(brick);
      }
    }

    wall.appendChild(fragment);
    requestAnimationFrame(() => preloader.classList.add('is-ready'));
  }

  function finish() {
    document.body.classList.remove('is-preloading');
    preloader.remove();
  }

  function release() {
    if (released) return;
    released = true;
    preloader.classList.add('is-releasing');
    window.setTimeout(finish, reducedMotion || skipAnimation ? 220 : 2250);
  }

  if (reducedMotion || skipAnimation) {
    preloader.classList.add('is-reduced', 'is-ready');
    window.setTimeout(release, 80);
    return;
  }

  buildWall();

  const startedAt = performance.now();
  const minimumHold = 720;
  const releaseWhenReady = () => {
    const remaining = Math.max(0, minimumHold - (performance.now() - startedAt));
    window.setTimeout(release, remaining);
  };

  if (document.readyState === 'complete') releaseWhenReady();
  else window.addEventListener('load', releaseWhenReady, { once: true });

  window.setTimeout(release, 2200);

  window.addEventListener('resize', () => {
    if (released) return;
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(buildWall, 120);
  }, { passive: true });
})();
