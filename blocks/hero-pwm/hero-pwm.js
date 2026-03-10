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

  // Prefer authored heading element; else wrap content in h2
  let heading = cell.querySelector('h1, h2, h3, h4, h5, h6');
  if (!heading) {
    heading = document.createElement('h2');
    heading.innerHTML = cell.innerHTML;
  }

  heading.classList.add('hero-pwm__title');

  // Reset any global paragraph margins inside the heading
  heading.querySelectorAll('p').forEach((p) => {
    p.style.margin = '0';
    p.style.padding = '0';
  });

  return heading;
};

const buildCta = (linkCell, textCell) => {
  if (!linkCell) return null;

  // Try to find an existing <a> tag first
  let link = linkCell.querySelector('a');

  if (!link) {
    // xwalk renders ctaLink as plain text (the URL), not a real anchor
    const href = linkCell.textContent?.trim();
    if (!href) return null;
    link = document.createElement('a');
    link.href = href.startsWith('http') || href.startsWith('/') ? href : `https://${href}`;
  }

  // Set button label: prefer ctaText cell, then existing link text, then fallback
  const label = textCell?.textContent?.trim() || link.textContent?.trim() || 'Learn More';
  link.textContent = label;

  link.classList.add('button', 'hero-pwm__cta');
  return link;
};

// Strip EDS section/wrapper constraints so hero can be full-bleed
const stripWrapperConstraints = (block) => {
  // .hero-pwm-container (direct parent)
  const container = block.closest('.hero-pwm-container');
  if (container) {
    container.style.maxWidth = 'unset';
    container.style.padding = '0';
  }

  // .hero-pwm-wrapper (grandparent)
  const wrapper = block.closest('.hero-pwm-wrapper');
  if (wrapper) {
    wrapper.style.maxWidth = 'unset';
    wrapper.style.padding = '0';
    wrapper.style.margin = '0';
  }

  // The section itself may carry margin: 40px 0 from styles.css
  const section = block.closest('main > .section');
  if (section) {
    section.style.margin = '0';
    section.style.padding = '0';
  }
};

export default function decorate(block) {
  // Must run before DOM teardown so closest() still traverses upward
  stripWrapperConstraints(block);

  // EDS renders each model field as a separate ROW (div > div)
  // Row 0: backgroundImage
  // Row 1: emblemImage
  // Row 2: heading
  // Row 3: ctaLink  (plain text URL — no <a> tag in xwalk output)
  // Row 4: ctaText  (button label)
  const rows = [...block.children];
  const getCell = (row) => row?.firstElementChild ?? null;

  const backgroundCell = getCell(rows[0]);
  const emblemCell = getCell(rows[1]);
  const headingCell = getCell(rows[2]);
  const ctaCell = getCell(rows[3]);
  const ctaTextCell = getCell(rows[4]);

  const backgroundPicture = buildPicture(backgroundCell);
  if (!backgroundPicture) return;

  // Clear authored table DOM
  block.textContent = '';

  // ── 1. Background media ─────────────────────────────────
  const media = document.createElement('div');
  media.className = 'hero-pwm__media';
  media.append(backgroundPicture);

  // LCP image optimisation
  const heroImg = media.querySelector('img');
  if (heroImg) {
    heroImg.loading = 'eager';
    heroImg.decoding = 'async';
    heroImg.fetchPriority = 'high';
    heroImg.removeAttribute('width');
    heroImg.removeAttribute('height');
  }

  // ── 2. Gradient overlay (aria-hidden, z-index: 1) ───────
  const overlay = document.createElement('div');
  overlay.className = 'hero-pwm__overlay';
  overlay.setAttribute('aria-hidden', 'true');

  // ── 3. Eternal knot emblem (decorative, aria-hidden) ────
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

  const cta = buildCta(ctaCell, ctaTextCell);
  if (cta) content.append(cta);

  // ── Assemble final DOM ──────────────────────────────────
  block.append(media, overlay);
  if (emblemEl) block.append(emblemEl);
  block.append(content);
}
