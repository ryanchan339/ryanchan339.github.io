(() => {
  const panels = [...document.querySelectorAll('.home-panel')];
  const controls = [...document.querySelectorAll('.home-page .home-button')];
  // Individual information rows and the clear contact buttons share the lens.
  const surfaces = [...panels, ...controls];
  if (!surfaces.length) return;

  const svgNS = 'http://www.w3.org/2000/svg';
  // SVG backdrop displacement is enabled only in the tested Chromium renderer.
  // Other browsers retain the clear CSS surface and polished edge treatment.
  const supportsRefraction = navigator.userAgent.includes('Chrome/')
    && window.CSS?.supports('backdrop-filter', 'url("#liquid-test")');
  const preferences = [
    window.matchMedia('(prefers-reduced-transparency: reduce)'),
    window.matchMedia('(prefers-contrast: more)'),
    window.matchMedia('(forced-colors: active)')
  ];
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('width', '0');
  svg.setAttribute('height', '0');
  svg.classList.add('liquid-filter-definitions');
  const definitions = document.createElementNS(svgNS, 'defs');
  svg.append(definitions);
  document.body.append(svg);

  const states = surfaces.map((panel, index) => {
    const kind = panel.classList.contains('home-panel') ? 'panel' : 'control';
    panel.dataset.glassKind = kind;
    const backdrop = document.createElement('div');
    backdrop.className = 'liquid-backdrop';
    backdrop.setAttribute('aria-hidden', 'true');
    panel.prepend(backdrop);
    if (kind === 'panel') {
      // A restrained reflection of nearby content gives the lens something to
      // bend on a flat page. Keep this below the refracting sibling and mask
      // only the artwork, so foreground text stays clean and undistorted.
      const artwork = panel.querySelector('video[poster], .home-company-logo img, .home-project-cover img');
      const artworkURL = artwork?.getAttribute('poster') || artwork?.getAttribute('src');
      const environment = document.createElement('div');
      environment.className = 'glass-environment';
      environment.setAttribute('aria-hidden', 'true');
      if (artwork?.closest('.home-company-logo')) environment.dataset.artwork = 'logo';
      if (artworkURL) environment.style.setProperty('--glass-artwork', `url(${JSON.stringify(artworkURL)})`);
      panel.prepend(environment);
    }

    const filter = document.createElementNS(svgNS, 'filter');
    filter.id = `liquid-refraction-${index}`;
    filter.setAttribute('filterUnits', 'userSpaceOnUse');
    filter.setAttribute('primitiveUnits', 'userSpaceOnUse');
    filter.setAttribute('color-interpolation-filters', 'sRGB');
    filter.setAttribute('x', '0');
    filter.setAttribute('y', '0');
    const image = document.createElementNS(svgNS, 'feImage');
    image.setAttribute('preserveAspectRatio', 'none');
    image.setAttribute('result', 'lens');
    const displacement = document.createElementNS(svgNS, 'feDisplacementMap');
    displacement.setAttribute('in', 'SourceGraphic');
    displacement.setAttribute('in2', 'lens');
    displacement.setAttribute('scale', '48');
    displacement.setAttribute('xChannelSelector', 'R');
    displacement.setAttribute('yChannelSelector', 'G');
    filter.append(image, displacement);
    definitions.append(filter);
    panel.style.setProperty('--refraction-filter', `url("#${filter.id}")`);
    return {panel, filter, image, kind, size: ''};
  });

  function buildLens(width, height, radius, kind) {
    // A low-resolution static map is sufficient for the curved edge band.
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.ceil(width * .6));
    canvas.height = Math.max(1, Math.ceil(height * .6));
    const context = canvas.getContext('2d');
    if (!context) return null;
    const pixels = context.createImageData(canvas.width, canvas.height);
    const rimPixels = context.createImageData(canvas.width, canvas.height);
    const halfWidth = width / 2;
    const halfHeight = height / 2;
    const band = kind === 'control' ? Math.min(16, radius * .72) : Math.min(22, radius * .72);
    const strength = kind === 'control' ? 10.5 : 12;
    const refractiveIndex = 1.5;
    const maximumDeviation = Math.sqrt(refractiveIndex * refractiveIndex - 1);

    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const px = (x + .5) * width / canvas.width - halfWidth;
        const py = (y + .5) * height / canvas.height - halfHeight;
        const qx = Math.abs(px) - (halfWidth - radius);
        const qy = Math.abs(py) - (halfHeight - radius);
        const cx = Math.max(qx, 0);
        const cy = Math.max(qy, 0);
        const cornerDistance = Math.hypot(cx, cy);
        const distance = cornerDistance + Math.min(Math.max(qx, qy), 0) - radius;
        const depth = -distance;
        let red = 128;
        let green = 128;
        const offset = (y * canvas.width + x) * 4;

        if (depth >= 0 && depth < band) {
          let nx = 0;
          let ny = 0;
          if (cornerDistance > 0) {
            nx = Math.sign(px) * cx / cornerDistance;
            ny = Math.sign(py) * cy / cornerDistance;
          } else if (qx > qy) {
            nx = Math.sign(px);
          } else {
            ny = Math.sign(py);
          }
          // A circular meniscus has a steep outer rim and settles to a flat
          // center. Its refracted angle shapes the bend instead of a sine wave.
          const t = depth / band;
          const normalAngle = Math.acos(t);
          const transmittedAngle = Math.asin(Math.sin(normalAngle) / refractiveIndex);
          const deviation = Math.tan(normalAngle - transmittedAngle) / maximumDeviation;
          const bend = deviation * (1 - t * t) * strength / 48;
          red -= nx * bend * 255;
          green -= ny * bend * 255;

          // Light follows the rounded edge's surface normal. A narrow Fresnel
          // reflection and a softer inner caustic supply depth without laying
          // a milky white fill over the middle of the material.
          const slope = Math.sqrt(Math.max(0, 1 - t * t));
          const facing = nx * -.45 + ny * -.65;
          const diffuse = Math.max(0, facing * slope + t * .6);
          const fresnel = Math.pow(1 - t, 5);
          const specular = Math.pow(diffuse, 10) * .32 * Math.exp(-depth / 5);
          const caustic = Math.exp(-Math.pow((t - .2) / .08, 2));
          const light = fresnel * .38 + specular + caustic * Math.max(0, facing) * .07;
          const shade = caustic * Math.max(0, -facing) * .065;
          const alpha = Math.min(.55, light + shade);
          const mix = alpha ? shade / (light + shade) : 0;
          rimPixels.data[offset] = Math.round(255 - mix * 172);
          rimPixels.data[offset + 1] = Math.round(255 - mix * 150);
          rimPixels.data[offset + 2] = Math.round(255 - mix * 120);
          rimPixels.data[offset + 3] = Math.round(alpha * 255);
        }
        pixels.data[offset] = red;
        pixels.data[offset + 1] = green;
        pixels.data[offset + 2] = 128;
        pixels.data[offset + 3] = 255;
      }
    }
    context.putImageData(pixels, 0, 0);
    const displacement = canvas.toDataURL('image/png');
    context.putImageData(rimPixels, 0, 0);
    return {displacement, rim: canvas.toDataURL('image/png')};
  }

  function update() {
    const enabled = !preferences.some(query => query.matches);
    for (const state of states) {
      state.panel.removeAttribute('data-refractive');
      if (!enabled) continue;
      const width = Math.round(state.panel.clientWidth);
      const height = Math.round(state.panel.clientHeight);
      if (!width || !height) continue;
      const cssRadius = parseFloat(getComputedStyle(state.panel).borderTopLeftRadius) || 0;
      const radius = Math.max(0, Math.min(cssRadius, width / 2, height / 2));
      const size = `${width}:${height}:${radius}`;
      if (state.size !== size) {
        const map = buildLens(width, height, radius, state.kind);
        if (!map) continue;
        state.filter.setAttribute('width', width);
        state.filter.setAttribute('height', height);
        state.image.setAttribute('width', width);
        state.image.setAttribute('height', height);
        state.image.setAttribute('href', map.displacement);
        if (state.kind === 'panel') {
          state.panel.style.setProperty('--glass-rim-image', `url("${map.rim}")`);
          state.panel.setAttribute('data-glass-rim', '');
        }
        state.size = size;
      }
      if (supportsRefraction) state.panel.setAttribute('data-refractive', '');
    }
  }

  let resizeTimer;
  const scheduleUpdate = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(update, 100);
  };
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(scheduleUpdate);
    surfaces.forEach(panel => observer.observe(panel));
  }
  preferences.forEach(query => query.addEventListener('change', scheduleUpdate));
  update();

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const motionStates = surfaces.map(panel => ({panel, visible: false, pointer: null}));
  const sectionFollowers = [...document.querySelectorAll('.home-section')].map(section => ({
    element: section.querySelector('.home-section-heading'),
    index: panels.indexOf(section.querySelector('.home-panel'))
  })).filter(item => item.element && item.index >= 0);
  const footer = document.querySelector('.home-layout > .site-footer');
  if (footer) sectionFollowers.push({element: footer, index: panels.length - 1});
  const motionProperties = [
    '--glass-light-x', '--glass-light-y', '--glass-scroll-y',
    '--glass-light-angle', '--glass-pointer-x', '--glass-pointer-y',
    '--glass-float-y', '--glass-stretch-y', '--glass-energy', '--glass-tilt-x',
    '--glass-tilt-y', '--glass-hover-scale'
  ];
  const motionEnabled = () => !document.hidden && !reducedMotion.matches
    && !preferences.some(query => query.matches);
  const maximumGap = 34;
  const maximumOffset = 140;
  const gapSpring = {value: 0, velocity: 0};
  const anchorSpring = {value: 0, velocity: 0};
  let motionFrame = 0;
  let lastFrameTime = 0;
  let lastScrollY = window.scrollY;
  let lastScrollTime = performance.now();
  let scrollSpeed = 0;

  function resetMotion() {
    cancelAnimationFrame(motionFrame);
    motionFrame = 0;
    lastFrameTime = 0;
    lastScrollY = window.scrollY;
    lastScrollTime = performance.now();
    scrollSpeed = 0;
    gapSpring.value = gapSpring.velocity = 0;
    anchorSpring.value = anchorSpring.velocity = 0;
    motionStates.forEach(state => {
      state.pointer = null;
      motionProperties.forEach(property => state.panel.style.removeProperty(property));
    });
    sectionFollowers.forEach(({element}) => element.style.removeProperty('--glass-stretch-y'));
  }

  function layoutBounds(panel) {
    // These surfaces are in the document's normal flow. Offset geometry ignores
    // their animated translation, tilt and scale, so motion cannot feed back
    // into the next scroll or pointer measurement.
    let left = panel.offsetLeft;
    let top = panel.offsetTop;
    for (let parent = panel.offsetParent; parent; parent = parent.offsetParent) {
      left += parent.offsetLeft + parent.clientLeft;
      top += parent.offsetTop + parent.clientTop;
    }
    return {
      left: left - window.scrollX,
      top: top - window.scrollY,
      width: panel.offsetWidth,
      height: panel.offsetHeight
    };
  }

  function springStep(spring, target, frequency, elapsed) {
    // Exact critically damped step: stable at different refresh rates and no
    // overshoot when the target returns to zero.
    const offset = spring.value - target;
    const coefficient = spring.velocity + frequency * offset;
    const decay = Math.exp(-frequency * elapsed);
    spring.value = target + (offset + coefficient * elapsed) * decay;
    spring.velocity = (spring.velocity - frequency * coefficient * elapsed) * decay;
  }

  function viewportAnchor(bounds) {
    const anchorY = Math.min(120, innerHeight * .18);
    if (!bounds.length || anchorY <= bounds[0].top) return 0;
    for (let index = 0; index < bounds.length - 1; index++) {
      if (anchorY < bounds[index + 1].top) {
        return index + (anchorY - bounds[index].top)
          / Math.max(1, bounds[index + 1].top - bounds[index].top);
      }
    }
    return bounds.length - 1;
  }

  function currentScrollSpeed(now) {
    // Leave a short hold between native scroll events, then release naturally
    // when scrolling stops instead of waiting for a separate scrollend event.
    const staleTime = Math.max(0, now - lastScrollTime - 50);
    return scrollSpeed * Math.exp(-staleTime / 110);
  }

  function renderMotion(now) {
    motionFrame = 0;
    if (!motionEnabled()) return;
    const elapsed = lastFrameTime ? Math.max(0, Math.min(.05, (now - lastFrameTime) / 1000)) : 1 / 60;
    lastFrameTime = now;
    // Read untransformed bounds before writing styles. Scrolling changes only
    // the spring spacing and rim light; it never regenerates a refraction map.
    const panelBounds = panels.map(layoutBounds);
    const measurements = motionStates.filter(state => state.visible).map(state => ({
      state, bounds: state.panel.dataset.glassKind === 'panel'
        ? panelBounds[panels.indexOf(state.panel)] : layoutBounds(state.panel)
    }));
    const speedRatio = Math.max(0, Math.min(1, (currentScrollSpeed(now) - 100) / 1700));
    const targetGap = maximumGap * speedRatio * speedRatio * (3 - 2 * speedRatio);
    const targetAnchor = viewportAnchor(panelBounds);
    springStep(gapSpring, targetGap, 20, elapsed);
    if (gapSpring.value < 0 || gapSpring.value > maximumGap) {
      gapSpring.value = Math.max(0, Math.min(maximumGap, gapSpring.value));
      gapSpring.velocity = 0;
    }
    if (gapSpring.value < .02 && Math.abs(gapSpring.velocity) < .08 && targetGap === 0) {
      gapSpring.value = gapSpring.velocity = 0;
    }
    if (gapSpring.value === 0) {
      anchorSpring.value = targetAnchor;
      anchorSpring.velocity = 0;
    } else {
      springStep(anchorSpring, targetAnchor, 16, elapsed);
    }
    const offsets = panels.map((panel, index) => {
      // One nonnegative gap keeps offsets ordered through direction changes.
      // Clamping distant cards bounds the movement without shrinking any gap.
      const offset = Math.max(-maximumOffset, Math.min(maximumOffset,
        (index - anchorSpring.value) * gapSpring.value));
      panel.style.setProperty('--glass-stretch-y', `${offset.toFixed(2)}px`);
      panel.style.setProperty('--glass-energy', (gapSpring.value / maximumGap).toFixed(4));
      return offset;
    });
    sectionFollowers.forEach(({element, index}) => {
      element.style.setProperty('--glass-stretch-y', `${offsets[index].toFixed(2)}px`);
    });
    measurements.forEach(({state, bounds}) => {
      if (!bounds.width || !bounds.height) return;
      const progress = Math.max(-1, Math.min(1,
        (innerHeight / 2 - bounds.top - bounds.height / 2) * 2 / (innerHeight + bounds.height)));
      const pointer = finePointer.matches ? state.pointer : null;
      const x = pointer ? Math.max(0, Math.min(100, (pointer.x - bounds.left) / bounds.width * 100)) : 20;
      const y = pointer ? Math.max(0, Math.min(100, (pointer.y - bounds.top) / bounds.height * 100)) : 40 + progress * 25;
      const angle = pointer ? (Math.atan2(y - 50, x - 50) * 180 / Math.PI + 450) % 360 : 315 + progress * 12;
      const isPanel = state.panel.dataset.glassKind === 'panel';
      const movesControl = pointer && !isPanel;
      const tiltsPanel = pointer && isPanel;
      state.panel.style.setProperty('--glass-light-x', `${x.toFixed(2)}%`);
      state.panel.style.setProperty('--glass-light-y', `${y.toFixed(2)}%`);
      state.panel.style.setProperty('--glass-scroll-y', `${(progress * 10).toFixed(2)}px`);
      state.panel.style.setProperty('--glass-light-angle', `${angle.toFixed(2)}deg`);
      state.panel.style.setProperty('--glass-pointer-x', `${(movesControl ? (x - 50) * .025 : 0).toFixed(2)}px`);
      state.panel.style.setProperty('--glass-pointer-y', `${(movesControl ? (y - 50) * .025 : 0).toFixed(2)}px`);
      state.panel.style.setProperty('--glass-float-y', '0px');
      state.panel.style.setProperty('--glass-tilt-x', `${(tiltsPanel ? (50 - y) * .012 : 0).toFixed(3)}deg`);
      state.panel.style.setProperty('--glass-tilt-y', `${(tiltsPanel ? (x - 50) * .012 : 0).toFixed(3)}deg`);
      state.panel.style.setProperty('--glass-hover-scale', tiltsPanel ? '1.008' : '1');
    });
    // The spring requests frames only while stretching or returning to rest.
    if (targetGap > 0 || gapSpring.value > 0) scheduleMotion();
    else lastFrameTime = 0;
  }

  function scheduleMotion() {
    if (motionEnabled() && !motionFrame) motionFrame = requestAnimationFrame(renderMotion);
  }

  const motionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const state = motionStates.find(item => item.panel === entry.target);
      state.visible = entry.isIntersecting;
      if (!state.visible) state.pointer = null;
    });
    scheduleMotion();
  });
  motionStates.forEach(state => {
    motionObserver.observe(state.panel);
    state.panel.addEventListener('pointermove', event => {
      if (!motionEnabled() || !finePointer.matches || event.pointerType === 'touch') return;
      state.pointer = {x: event.clientX, y: event.clientY};
      scheduleMotion();
    }, {passive: true});
    const releasePointer = () => {
      state.pointer = null;
      scheduleMotion();
    };
    state.panel.addEventListener('pointerleave', releasePointer, {passive: true});
    state.panel.addEventListener('pointercancel', releasePointer, {passive: true});
  });
  window.addEventListener('scroll', () => {
    if (!motionEnabled()) return;
    const now = performance.now();
    const distance = Math.abs(window.scrollY - lastScrollY);
    if (distance > 0) {
      const sampleTime = Math.max(8, Math.min(64, now - lastScrollTime));
      const sampleSpeed = Math.min(6000, distance * 1000 / sampleTime);
      const blend = 1 - Math.exp(-sampleTime / 35);
      scrollSpeed = currentScrollSpeed(now) * (1 - blend) + sampleSpeed * blend;
      lastScrollTime = now;
      lastScrollY = window.scrollY;
    }
    scheduleMotion();
  }, {passive: true});
  window.addEventListener('resize', scheduleMotion, {passive: true});
  const syncMotion = () => {
    if (!motionEnabled()) resetMotion();
    else scheduleMotion();
  };
  document.addEventListener('visibilitychange', syncMotion);
  reducedMotion.addEventListener('change', syncMotion);
  preferences.forEach(query => query.addEventListener('change', syncMotion));
  finePointer.addEventListener('change', () => {
    if (!finePointer.matches) motionStates.forEach(state => { state.pointer = null; });
    scheduleMotion();
  });
})();
