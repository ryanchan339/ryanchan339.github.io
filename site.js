(() => {
  const legacyPages = { '#work': 'work.html', '#experience': 'experience.html', '#contact': 'contact.html' };
  if (document.querySelector('.home-overview') && legacyPages[location.hash]) {
    location.replace(legacyPages[location.hash]);
    return;
  }
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

  document.querySelectorAll('[data-preview-target]').forEach(button => {
    button.addEventListener('click', () => {
      const group = button.dataset.previewGroup;
      document.querySelectorAll('[data-preview-target]').forEach(tab => {
        if (tab.dataset.previewGroup === group) tab.setAttribute('aria-pressed', String(tab === button));
      });
      document.querySelectorAll('[data-preview-panel]').forEach(panel => {
        if (panel.dataset.previewPanel !== group) return;
        panel.hidden = panel.id !== button.dataset.previewTarget;
        if (panel.hidden) panel.querySelectorAll('video').forEach(video => video.pause());
      });
    });
  });
  document.querySelectorAll('[data-copy-email]').forEach(button => {
    button.addEventListener('click', async () => {
      const status = button.parentElement.querySelector('.copy-status');
      try {
        await navigator.clipboard.writeText(button.dataset.copyEmail);
        status.textContent = 'Email copied';
      } catch (_) {
        status.textContent = 'Use the email link to get in touch.';
      }
    });
  });
})();
