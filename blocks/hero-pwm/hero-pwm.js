const buildPicture = (cell) => {
  if (!cell) return null;
  const picture = cell.querySelector('picture');
  if (picture) return picture;
  const image = cell.querySelector('img');
  if (!image) return null;
  const wrapper = document.createElement('picture');
  wrapper.append(image);
  return wrapper;
};

const buildTitle = (cell) => {
  if (!cell) return null;

  // Prefer an authored heading element; if none, wrap content in h2
  let heading = cell.querySelector('h1, h2, h3, h4, h5, h6');
  if (!heading) {
    heading = document.createElement('h2');
    heading.innerHTML = cell.innerHTML;
  }

  heading.classList.add('hero-pwm__title');

  // Ensure any bare <p> children keep their margin reset
  heading.querySelectorAll('p').forEach((p) => {
    p.style.margin = '0';
  });

  return heading;
};

const buildCta = (cell) => {
  if (!cell) return null;
  const link = cell.querySelector('a');
  if (!link) return null;
  link.classList.add('button', 'hero-pwm__cta');
  return link;
};

const isImageOnlyCell = (cell) => !!cell?.querySelector('picture, img');

export default function decorate(block) {
  const rows = [...block.children].map((row) => [...row.children]);

  // Row 1 — background image (required)
  const backgroundCell = rows.shift()?.[0];
  const backgroundPicture = buildPicture(backgroundCell);
  if (!backgroundPicture) return;

  // Row 2 — emblem image (optional; only consume if cell contains image)
  const emblemCell = rows.length && isImageOnlyCell(rows[0][0]) ? rows.shift()[0] : null;

  // Row 3 — heading text (required)
  const headingCell = rows.shift()?.[0];

  // Row 4 — CTA link (optional)
  const ctaCell = rows.shift()?.[0];

  // ── Clear authored DOM ──────────────────────────────────
  block.textContent = '';

  // ── 1. Background media ─────────────────────────────────
  const media = document.createElement('div');
  media.className = 'hero-pwm__media';
  media.append(backgroundPicture);

  // Prioritise the LCP image
  const heroImg = media.querySelector('img');
  if (heroImg) {
    heroImg.loading = 'eager';
    heroImg.decoding = 'async';
    heroImg.fetchPriority = 'high';
    // Ensure dimensions don't cause CLS — let CSS control sizing
    heroImg.removeAttribute('width');
    heroImg.removeAttribute('height');
  }

  // ── 2. Gradient overlay (separate div for z-index control) ─
  const overlay = document.createElement('div');
  overlay.className = 'hero-pwm__overlay';
  overlay.setAttribute('aria-hidden', 'true');

  // ── 3. Eternal knot emblem ──────────────────────────────
  let emblemEl = null;
  if (emblemCell) {
    const emblemPicture = buildPicture(emblemCell);
    if (emblemPicture) {
      emblemEl = document.createElement('div');
      emblemEl.className = 'hero-pwm__emblem';
      emblemEl.setAttribute('aria-hidden', 'true');
      emblemEl.append(emblemPicture);
      const eImg = emblemEl.querySelector('img');
      if (eImg) eImg.alt = '';
    }
  }

  // ── 4. Content block ────────────────────────────────────
  const content = document.createElement('div');
  content.className = 'hero-pwm__content';

  const heading = buildTitle(headingCell);
  if (heading) content.append(heading);

  const cta = buildCta(ctaCell);
  if (cta) content.append(cta);

  // ── Assemble ────────────────────────────────────────────
  block.append(media, overlay);
  if (emblemEl) block.append(emblemEl);
  block.append(content);
}
