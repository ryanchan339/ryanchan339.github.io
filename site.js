(() => {
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const demos = [...document.querySelectorAll('[data-demo]')].map(frame => {
    const video = frame.querySelector('video');
    const button = frame.querySelector('.demo-toggle');
    const state = { video, button, visible: false, userPaused: false, userStarted: false, failed: false };
    const label = () => {
      button.textContent = video.paused ? '▶ Play demo' : 'Ⅱ Pause';
      button.setAttribute('aria-label', `${video.paused ? 'Play' : 'Pause'} ${video.dataset.project} demo`);
      button.setAttribute('aria-pressed', String(!video.paused));
    };
    state.update = async () => {
      const shouldPlay = state.visible && !document.hidden && !state.userPaused && !state.failed && (!motion.matches || state.userStarted);
      if (!shouldPlay) { video.pause(); label(); return; }
      if (!video.dataset.loaded) {
        video.querySelectorAll('source[data-src]').forEach(source => { source.src = source.dataset.src; });
        video.dataset.loaded = 'true'; video.load();
      }
      video.muted = true;
      try { await video.play(); } catch (_) { label(); }
    };
    button.addEventListener('click', () => {
      if (video.paused) { state.userPaused = false; state.userStarted = true; state.update(); }
      else { state.userPaused = true; state.update(); }
    });
    video.addEventListener('play', label);
    video.addEventListener('pause', label);
    video.addEventListener('error', () => { state.failed = true; video.removeAttribute('src'); video.querySelectorAll('source').forEach(s => s.removeAttribute('src')); video.load(); button.textContent = 'Still preview'; button.disabled = true; button.setAttribute('aria-label','Still preview shown; video unavailable'); });
    label(); return state;
  });
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    const state = demos.find(item => item.video === entry.target);
    state.visible = entry.intersectionRatio >= 0.2;
    state.update();
  }), { threshold: [0, 0.2, 0.5] });
  demos.forEach(state => observer.observe(state.video));
  document.addEventListener('visibilitychange', () => demos.forEach(state => state.update()));
  motion.addEventListener('change', () => demos.forEach(state => { state.userStarted = false; state.update(); }));

  const links = [...document.querySelectorAll('.site-nav a[data-section]')];
  const sections = [...document.querySelectorAll('main > section[id]')];
  const setActive = id => links.forEach(link => {
    if (link.dataset.section === id) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
  if (sections.length) {
    let scheduled = false;
    const updateNavigation = () => {
      const current = sections.filter(section => section.getBoundingClientRect().top <= 180).at(-1);
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      setActive(atBottom ? sections.at(-1).id : current ? current.id : 'work'); scheduled = false;
    };
    window.addEventListener('scroll', () => { if (!scheduled) { scheduled = true; requestAnimationFrame(updateNavigation); } }, { passive: true });
    links.forEach(link => link.addEventListener('click', () => setActive(link.dataset.section)));
    updateNavigation();
  }
})();
