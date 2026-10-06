(() => {
  const legacyPages = { '#work': 'work.html', '#experience': 'experience.html', '#contact': 'contact.html' };
  if (document.querySelector('[data-home]') && legacyPages[location.hash]) {
    const release = document.querySelector('meta[name="portfolio-release"]')?.content;
    location.replace(legacyPages[location.hash] + (release ? `?v=${release}` : ''));
    return;
  }
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  document.querySelectorAll('[data-accelerator-demo]').forEach(tile => {
    const button = tile.querySelector('[data-accelerator-toggle]');
    let visible = false;
    let userPaused = false;
    const update = () => {
      tile.dataset.acceleratorPaused = String(!visible || document.hidden || userPaused || motion.matches);
      tile.toggleAttribute('data-accelerator-active', !motion.matches);
      button.hidden = motion.matches;
      button.textContent = userPaused ? '▶ Play' : 'Ⅱ Pause';
      button.setAttribute('aria-label', `${userPaused ? 'Play' : 'Pause'} transformer acceleration animation`);
      button.setAttribute('aria-pressed', String(userPaused));
    };
    new IntersectionObserver(entries => {
      visible = entries[0].intersectionRatio >= 0.2;
      update();
    }, { threshold: 0.2 }).observe(tile);
    button.addEventListener('click', () => { userPaused = !userPaused; update(); });
    document.addEventListener('visibilitychange', update);
    motion.addEventListener('change', update);
    update();
  });
  document.querySelectorAll('[data-coding-demo]').forEach(tile => {
    const button = tile.querySelector('[data-code-toggle]');
    let visible = false;
    let phase = 'running';
    const update = () => {
      const paused = !visible || document.hidden || phase !== 'running';
      tile.dataset.codePaused = String(paused);
      button.hidden = motion.matches;
      button.textContent = phase === 'complete' ? '↻ Replay' : phase === 'paused' ? '▶ Resume' : 'Ⅱ Pause';
      button.setAttribute('aria-label', `${phase === 'complete' ? 'Replay' : phase === 'paused' ? 'Resume' : 'Pause'} coding animation`);
    };
    const replay = () => {
      if (motion.matches) return;
      phase = 'running';
      tile.removeAttribute('data-code-active');
      update();
      requestAnimationFrame(() => requestAnimationFrame(() => {
        if (!motion.matches) tile.setAttribute('data-code-active', '');
      }));
    };
    if (!motion.matches) tile.setAttribute('data-code-active', '');
    const visibility = new IntersectionObserver(entries => {
      visible = entries[0].intersectionRatio >= 0.2;
      update();
    }, { threshold: 0.2 });
    visibility.observe(tile);
    button.addEventListener('click', () => {
      if (phase === 'complete') { replay(); return; }
      phase = phase === 'running' ? 'paused' : 'running';
      update();
    });
    tile.addEventListener('pointerenter', event => {
      if (event.pointerType !== 'touch' && phase === 'complete') replay();
    });
    tile.addEventListener('animationend', event => {
      if (!event.target.matches('.coding-output-second') || event.animationName !== 'coding-result') return;
      phase = 'complete';
      update();
    });
    document.addEventListener('visibilitychange', update);
    motion.addEventListener('change', () => {
      if (motion.matches) { phase = 'complete'; tile.removeAttribute('data-code-active'); update(); }
      else replay();
    });
    update();
  });
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
      if (group === 'hobbies') return;
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
  document.querySelectorAll('.hobby-tile').forEach(tile => {
    const viewport = tile.querySelector('.hobby-viewport');
    const tabs = [...tile.querySelectorAll('[data-preview-target]')];
    const panels = tabs.map(tab => document.getElementById(tab.dataset.previewTarget));
    let current = tabs.findIndex(tab => tab.getAttribute('aria-pressed') === 'true');
    let gesture = null;
    let suppressClickUntil = 0;
    let animations = [];
    let timer = null;
    let visible = false;
    let hovering = false;
    let autoplayPaused = false;
    const autoplay = tile.querySelector('[data-hobby-autoplay]');
    const schedule = () => {
      clearTimeout(timer);
      timer = null;
      const keyboardFocus = tile.contains(document.activeElement) && document.activeElement.matches(':focus-visible');
      if (!visible || document.hidden || motion.matches || hovering || gesture || autoplayPaused || keyboardFocus) return;
      timer = setTimeout(() => select(current + 1, 1, 0, false), 5000);
    };
    const wrap = index => (index + tabs.length) % tabs.length;
    const stopAnimations = () => { animations.forEach(animation => animation.cancel()); animations = []; };
    const position = (delta = 0) => panels.forEach((panel, index) => {
      const relative = wrap(index - current);
      const offset = relative === tabs.length - 1 ? -1 : relative;
      panel.style.transform = `translateX(calc(${offset * 100}% + ${delta}px))`;
    });
    const slide = (panel, from, to) => {
      if (motion.matches) return;
      animations.push(panel.animate([{ transform: from }, { transform: to }], {
        duration: 320, easing: 'cubic-bezier(.2,.8,.2,1)'
      }));
    };
    const select = (index, direction = 1, delta = 0, announce = true) => {
      stopAnimations();
      const previous = current;
      current = wrap(index);
      position();
      tabs.forEach((tab, i) => tab.setAttribute('aria-pressed', String(i === current)));
      panels.forEach((panel, i) => { panel.inert = i !== current; panel.setAttribute('aria-hidden', String(i !== current)); });
      if (previous !== current) {
        slide(panels[previous], `translateX(${delta}px)`, `translateX(${-direction * 100}%)`);
        slide(panels[current], `translateX(calc(${direction * 100}% + ${delta}px))`, 'translateX(0)');
        const status = tile.querySelector('[data-hobby-status]');
        status.setAttribute('aria-live', announce ? 'polite' : 'off');
        status.textContent = `${panels[current].querySelector('h2').textContent}, ${current + 1} of ${tabs.length}`;
      } else if (delta) {
        slide(panels[current], `translateX(${delta}px)`, 'translateX(0)');
        [-1, 1].forEach(offset => slide(panels[wrap(current + offset)], `translateX(calc(${offset * 100}% + ${delta}px))`, `translateX(${offset * 100}%)`));
      }
      schedule();
    };
    tile.setAttribute('data-swipe-ready', '');
    panels.forEach(panel => { panel.hidden = false; });
    select(current);
    tabs.forEach((tab, index) => tab.addEventListener('click', () => {
      const direction = wrap(index - current) <= tabs.length / 2 ? 1 : -1;
      select(index, direction);
    }));
    tile.querySelectorAll('[data-hobby-step]').forEach(button => button.addEventListener('click', () => {
      const direction = Number(button.dataset.hobbyStep);
      select(current + direction, direction);
    }));
    tile.addEventListener('keydown', event => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      const direction = event.key === 'ArrowLeft' ? -1 : 1;
      select(current + direction, direction);
    });
    tile.addEventListener('pointerdown', event => {
      if (!event.isPrimary || event.button !== 0 || event.target.closest('.hobby-controls,[data-hobby-autoplay]')) return;
      stopAnimations();
      gesture = { id: event.pointerId, x: event.clientX, y: event.clientY, delta: 0, horizontal: false };
      schedule();
    });
    tile.addEventListener('pointermove', event => {
      if (!gesture || gesture.id !== event.pointerId) return;
      const dx = event.clientX - gesture.x;
      const dy = event.clientY - gesture.y;
      if (!gesture.horizontal) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) < 8) return;
        if (Math.abs(dy) >= Math.abs(dx)) { gesture = null; schedule(); return; }
        gesture.horizontal = true;
        tile.setPointerCapture(event.pointerId);
        tile.setAttribute('data-swiping', '');
      }
      gesture.delta = Math.max(-viewport.clientWidth, Math.min(viewport.clientWidth, dx));
      position(gesture.delta);
      if (event.cancelable) event.preventDefault();
    });
    const finish = (event, cancelled = false) => {
      if (!gesture || gesture.id !== event.pointerId) return;
      const { delta, horizontal } = gesture;
      gesture = null;
      tile.removeAttribute('data-swiping');
      if (tile.hasPointerCapture(event.pointerId)) tile.releasePointerCapture(event.pointerId);
      if (!horizontal) { schedule(); return; }
      suppressClickUntil = performance.now() + 500;
      const direction = delta < 0 ? 1 : -1;
      const advance = !cancelled && Math.abs(delta) >= Math.min(50, viewport.clientWidth * .18);
      select(current + (advance ? direction : 0), direction, delta);
    };
    tile.addEventListener('pointerup', event => finish(event));
    tile.addEventListener('pointercancel', event => finish(event, true));
    tile.addEventListener('lostpointercapture', event => finish(event, true));
    tile.addEventListener('pointerleave', event => { if (gesture && !gesture.horizontal) finish(event, true); });
    tile.addEventListener('pointerenter', event => { if (event.pointerType !== 'touch') { hovering = true; schedule(); } });
    tile.addEventListener('pointerleave', () => { hovering = false; schedule(); });
    tile.addEventListener('focusin', schedule);
    tile.addEventListener('focusout', () => queueMicrotask(schedule));
    const autoplayLabel = () => {
      autoplay.hidden = motion.matches;
      autoplay.textContent = autoplayPaused ? '▶' : 'Ⅱ';
      autoplay.setAttribute('aria-label', `${autoplayPaused ? 'Resume' : 'Pause'} automatic interest slideshow`);
    };
    autoplay.addEventListener('click', () => { autoplayPaused = !autoplayPaused; autoplayLabel(); schedule(); });
    new IntersectionObserver(entries => { visible = entries[0].intersectionRatio >= .3; schedule(); }, { threshold: .3 }).observe(tile);
    document.addEventListener('visibilitychange', schedule);
    tile.addEventListener('click', event => {
      if (event.detail && performance.now() < suppressClickUntil) {
        event.preventDefault(); event.stopImmediatePropagation();
      }
    }, true);
    motion.addEventListener('change', () => {
      if (gesture && tile.hasPointerCapture(gesture.id)) tile.releasePointerCapture(gesture.id);
      gesture = null;
      tile.removeAttribute('data-swiping');
      stopAnimations(); position();
      autoplayLabel(); schedule();
    });
    autoplayLabel();
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
