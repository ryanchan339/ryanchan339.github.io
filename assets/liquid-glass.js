(() => {
  const panels = [...document.querySelectorAll('.home-panel')];
  if (!panels.length) return;

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

  const states = panels.map((panel, index) => {
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
    return {panel, filter, image, size: ''};
  });

  function buildLens(width, height, radius) {
    // A low-resolution static map is sufficient for the curved edge band.
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.ceil(width * .6));
    canvas.height = Math.max(1, Math.ceil(height * .6));
    const context = canvas.getContext('2d');
    if (!context) return null;
    const pixels = context.createImageData(canvas.width, canvas.height);
    const halfWidth = width / 2;
    const halfHeight = height / 2;
    const band = Math.min(26, radius);

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
          const bend = Math.sin(Math.PI * depth / band) * 14 / 48;
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
      const radius = parseFloat(getComputedStyle(state.panel).borderTopLeftRadius);
      const size = `${width}:${height}:${radius}`;
      if (state.size !== size) {
        const map = buildLens(width, height, radius);
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
    panels.forEach(panel => observer.observe(panel));
  }
  preferences.forEach(query => query.addEventListener('change', scheduleUpdate));
  update();
})();
