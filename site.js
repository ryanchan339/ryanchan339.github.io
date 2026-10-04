(() => {
  const legacyPages = { '#work': 'work.html', '#experience': 'experience.html', '#contact': 'contact.html' };
  if (document.querySelector('[data-home]') && legacyPages[location.hash]) {
    const release = document.querySelector('meta[name="portfolio-release"]')?.content;
    location.replace(legacyPages[location.hash] + (release ? `?v=${release}` : ''));
    return;
  }
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const nav = document.querySelector('.site-nav');
  if (nav?.querySelector('.nav-glider')) {
    const links = [...nav.querySelectorAll('a')];
    const current = nav.querySelector('[aria-current="page"]') || links[0];
    const glider = nav.querySelector('.nav-glider');
    const labels = glider.querySelector('.nav-glider-labels');
    const measureLabels = () => {
      [...labels.children].forEach((label, index) => {
        const link = links[index];
        label.style.left = `${link.offsetLeft}px`;
        label.style.top = `${link.offsetTop}px`;
        label.style.width = `${link.offsetWidth}px`;
        label.style.height = `${link.offsetHeight}px`;
        label.style.font = getComputedStyle(link).font;
      });
    };
    let hovered = null;
    let focused = null;
    let target = current;
    let activationOrigin = null;
    const movePill = (link, instant = false) => {
      target = link;
      if (instant) { glider.style.transition = 'none'; labels.style.transition = 'none'; }
      glider.style.width = `${link.offsetWidth}px`;
      glider.style.height = `${link.offsetHeight}px`;
      glider.style.transform = `translate3d(${link.offsetLeft}px, ${link.offsetTop}px, 0)`;
      labels.style.transform = `translate3d(${-link.offsetLeft}px, ${-link.offsetTop}px, 0)`;
      links.forEach(item => item.toggleAttribute('data-pill-target', item === link));
      if (instant) requestAnimationFrame(() => { glider.style.transition = ''; labels.style.transition = ''; });
    };
    let initial = current;
    try {
      const previous = JSON.parse(sessionStorage.getItem('portfolio-nav-pill'));
      sessionStorage.removeItem('portfolio-nav-pill');
      if (previous?.path === location.pathname && Date.now() - previous.time < 5000 && links[previous.from]) {
        initial = links[previous.from];
      }
    } catch (_) { /* Navigation works when session storage is unavailable. */ }
    measureLabels();
    movePill(initial, true);
    nav.setAttribute('data-glider-ready', '');
    requestAnimationFrame(() => requestAnimationFrame(() => movePill(current)));
    links.forEach(link => {
      link.addEventListener('pointerenter', event => {
        if (event.pointerType === 'touch') return;
        hovered = link;
        movePill(link);
      });
      link.addEventListener('focus', () => { focused = link; movePill(link); });
      link.addEventListener('blur', () => {
        focused = null;
        queueMicrotask(() => movePill(focused || hovered || current));
      });
      link.addEventListener('pointerdown', () => { activationOrigin = links.indexOf(target); movePill(link); });
      link.addEventListener('click', event => {
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) { activationOrigin = null; return; }
        try {
          sessionStorage.setItem('portfolio-nav-pill', JSON.stringify({
            from: activationOrigin ?? links.indexOf(target), path: new URL(link.href).pathname, time: Date.now()
          }));
        } catch (_) { /* Native links remain usable without storage. */ }
        activationOrigin = null;
        movePill(link);
      });
    });
    nav.addEventListener('pointerleave', () => { hovered = null; movePill(focused || current); });
    new ResizeObserver(() => { measureLabels(); movePill(target, true); }).observe(nav);
    motion.addEventListener('change', () => movePill(target, true));
    window.addEventListener('pageshow', event => {
      if (event.persisted) { hovered = null; focused = null; activationOrigin = null; movePill(current, true); }
    });
  }
  const demos = [...document.querySelectorAll('[data-demo]')].map(frame => {
    const video = frame.querySelector('video');
    const button = frame.querySelector('.demo-toggle');
    const card = frame.closest('[data-hover-demo]');
    const state = { video, button, visible: false, hovering: false, focused: false, userPaused: false, userStarted: false, failed: false };
    // Card clips move between screens sooner; detail-page recordings keep their pace.
    if (card) { video.defaultPlaybackRate = 2; video.playbackRate = 2; }
    const label = () => {
      button.textContent = video.paused ? '▶ Play demo' : 'Ⅱ Pause';
      button.setAttribute('aria-label', `${video.paused ? 'Play' : 'Pause'} ${video.dataset.project} demo`);
      button.setAttribute('aria-pressed', String(!video.paused));
    };
    const wantsPlayback = () => {
      const alternateVisible = video.closest('[data-flip-preview]')?.dataset.view === 'alternate';
      const engaged = !card || state.hovering || state.focused || state.userStarted;
      return engaged && state.visible && !alternateVisible && !document.hidden && !state.userPaused && !state.failed && (!motion.matches || state.userStarted);
    };
    state.update = async () => {
      frame.toggleAttribute('data-motion-active', Boolean(card && wantsPlayback() && !motion.matches));
      if (!wantsPlayback()) { video.pause(); label(); return; }
      if (!video.dataset.loaded) {
        video.querySelectorAll('source[data-src]').forEach(source => { source.src = source.dataset.src; });
        video.dataset.loaded = 'true'; video.load();
      }
      video.muted = true;
      if (card) video.playbackRate = 2;
      try {
        await video.play();
        // Loading a clip can finish after the visitor has already moved away.
        if (!wantsPlayback()) video.pause();
      } catch (_) { label(); }
    };
    if (card) {
      card.addEventListener('pointerenter', event => {
        if (event.pointerType === 'touch') return;
        state.hovering = true;
        state.update();
      });
      card.addEventListener('pointerleave', () => { state.hovering = false; state.update(); });
      card.addEventListener('focusin', event => {
        if (!event.target.closest('a')) return;
        state.focused = true;
        state.update();
      });
      card.addEventListener('focusout', () => queueMicrotask(() => {
        state.focused = card.contains(document.activeElement) && document.activeElement.matches('a');
        state.update();
      }));
    }
    button.addEventListener('click', () => {
      if (video.paused) { state.userPaused = false; state.userStarted = true; state.update(); }
      else { state.userPaused = true; state.update(); }
    });
    video.addEventListener('play', label);
    video.addEventListener('pause', label);
    video.addEventListener('error', () => { state.failed = true; frame.removeAttribute('data-motion-active'); video.removeAttribute('src'); video.querySelectorAll('source').forEach(s => s.removeAttribute('src')); video.load(); button.textContent = 'Still preview'; button.disabled = true; button.setAttribute('aria-label','Still preview shown; video unavailable'); });
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

  document.querySelectorAll('[data-flip-preview]').forEach(tile => {
    const button = tile.querySelector('.switch-preview');
    const front = tile.querySelector('.flip-front');
    const back = tile.querySelector('.flip-back');
    const projectLink = tile.querySelector('.tile-project-link');
    const project = tile.querySelector('video').dataset.project;
    const autoFlip = tile.dataset.hoverPreview === 'flip';
    let hovering = false;
    let focused = false;
    let lockedView = null;
    const update = () => {
      const alternate = lockedView === null ? autoFlip && (hovering || focused) : lockedView;
      tile.dataset.view = alternate ? 'alternate' : 'front';
      front.inert = alternate;
      front.setAttribute('aria-hidden', String(alternate));
      back.setAttribute('aria-hidden', String(!alternate));
      button.setAttribute('aria-pressed', String(alternate));
      button.setAttribute('aria-label', `Show ${alternate ? 'walkthrough' : 'alternate'} ${project} view`);
      demos.filter(state => tile.contains(state.video)).forEach(state => state.update());
    };
    tile.addEventListener('pointerenter', event => {
      if (!autoFlip || event.pointerType !== 'mouse' || !window.matchMedia('(hover: hover)').matches) return;
      // Entering directly on the manual switch should perform only its click action.
      if (event.clientY >= button.getBoundingClientRect().top) return;
      hovering = true;
      update();
    });
    tile.addEventListener('pointerleave', () => {
      hovering = false;
      if (lockedView === false) lockedView = null;
      update();
    });
    projectLink.addEventListener('focus', () => { focused = true; update(); });
    projectLink.addEventListener('blur', () => { focused = false; update(); });
    button.addEventListener('click', () => {
      lockedView = tile.dataset.view !== 'alternate';
      update();
    });
  });

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
      if (group === 'hobbies') {
        const tile = button.closest('.hobby-tile');
        const tabs = [...tile.querySelectorAll('[data-preview-target]')];
        const panel = document.getElementById(button.dataset.previewTarget);
        tile.querySelector('[data-hobby-status]').textContent = `${panel.querySelector('h2').textContent}, ${tabs.indexOf(button) + 1} of ${tabs.length}`;
      }
    });
  });
  document.querySelectorAll('[data-hobby-step]').forEach(button => {
    button.addEventListener('click', () => {
      const tabs = [...button.closest('.hobby-tile').querySelectorAll('[data-preview-target]')];
      const current = tabs.findIndex(tab => tab.getAttribute('aria-pressed') === 'true');
      tabs[(current + Number(button.dataset.hobbyStep) + tabs.length) % tabs.length].click();
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
  document.querySelectorAll('[data-email-draft]').forEach(form => {
    form.addEventListener('submit', event => {
      event.preventDefault();
      const message = form.querySelector('[name="message"]').value;
      location.href = `mailto:ryanchan339@gmail.com?subject=${encodeURIComponent('Hello Ryan')}&body=${encodeURIComponent(message)}`;
    });
  });
})();
