(() => {
  const panels = [...document.querySelectorAll('.home-panel')];
  const controls = [...document.querySelectorAll('.home-page .site-nav, .home-page .home-button')];
  // Keep the content-panel filter IDs stable as the control layer is added.
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
    const halfWidth = width / 2;
    const halfHeight = height / 2;
    const band = kind === 'control' ? Math.min(16, radius * .72) : Math.min(22, radius * .55);
    const strength = kind === 'control' ? 10.5 : 5.5;
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
        }
        const offset = (y * canvas.width + x) * 4;
        pixels.data[offset] = red;
        pixels.data[offset + 1] = green;
        pixels.data[offset + 2] = 128;
        pixels.data[offset + 3] = 255;
      }
    }
    context.putImageData(pixels, 0, 0);
    return canvas.toDataURL('image/png');
  }

  function update() {
    const enabled = supportsRefraction && !preferences.some(query => query.matches);
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
        state.image.setAttribute('href', map);
        state.size = size;
      }
      state.panel.setAttribute('data-refractive', '');
    }
  }

  let resizeTimer;
  const scheduleUpdate = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(update, 100);
  };
  if (supportsRefraction && 'ResizeObserver' in window) {
    const observer = new ResizeObserver(scheduleUpdate);
    surfaces.forEach(panel => observer.observe(panel));
  }
  preferences.forEach(query => query.addEventListener('change', scheduleUpdate));
  update();

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const motionStates = surfaces.map(panel => ({panel, visible: false, pointer: null}));
  const motionProperties = [
    '--glass-light-x', '--glass-light-y', '--glass-scroll-y',
    '--glass-light-angle', '--glass-pointer-x', '--glass-pointer-y'
  ];
  const motionEnabled = () => !document.hidden && !reducedMotion.matches
    && !preferences.some(query => query.matches);
  let motionFrame = 0;

  function resetMotion() {
    cancelAnimationFrame(motionFrame);
    motionFrame = 0;
    motionStates.forEach(state => {
      state.pointer = null;
      motionProperties.forEach(property => state.panel.style.removeProperty(property));
    });
  }

  function renderMotion() {
    motionFrame = 0;
    if (!motionEnabled()) return;
    // Read all visible bounds before writing styles; refraction maps stay static.
    const measurements = motionStates.filter(state => state.visible).map(state => ({
      state, bounds: state.panel.getBoundingClientRect()
    }));
    measurements.forEach(({state, bounds}) => {
      const progress = Math.max(-1, Math.min(1,
        (innerHeight / 2 - bounds.top - bounds.height / 2) * 2 / (innerHeight + bounds.height)));
      const pointer = finePointer.matches ? state.pointer : null;
      const x = pointer ? Math.max(0, Math.min(100, (pointer.x - bounds.left) / bounds.width * 100)) : 20;
      const y = pointer ? Math.max(0, Math.min(100, (pointer.y - bounds.top) / bounds.height * 100)) : 40 + progress * 25;
      const angle = pointer ? (Math.atan2(y - 50, x - 50) * 180 / Math.PI + 450) % 360 : 315 + progress * 12;
      const respondsToPointer = pointer && state.panel.dataset.glassKind === 'control';
      state.panel.style.setProperty('--glass-light-x', `${x.toFixed(2)}%`);
      state.panel.style.setProperty('--glass-light-y', `${y.toFixed(2)}%`);
      state.panel.style.setProperty('--glass-scroll-y', `${(progress * 10).toFixed(2)}px`);
      state.panel.style.setProperty('--glass-light-angle', `${angle.toFixed(2)}deg`);
      state.panel.style.setProperty('--glass-pointer-x', `${(respondsToPointer ? (x - 50) * .025 : 0).toFixed(2)}px`);
      state.panel.style.setProperty('--glass-pointer-y', `${(respondsToPointer ? (y - 50) * .025 : 0).toFixed(2)}px`);
    });
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
  window.addEventListener('scroll', scheduleMotion, {passive: true});
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
