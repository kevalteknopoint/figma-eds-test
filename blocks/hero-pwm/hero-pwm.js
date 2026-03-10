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
  // ctaLink cell holds an <a> tag; ctaText cell holds the button label
  const link = linkCell.querySelector('a');
  if (!link) return null;
  // Override link text with explicit ctaText if authored
  const ctaText = textCell?.textContent?.trim();
  if (ctaText) link.textContent = ctaText;
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

  // EDS xwalk model: all fields are COLUMNS in row[0]
  // Col 0: backgroundImage  Col 1: backgroundImageAlt (collapsed)
  // Col 2: emblemImage       Col 3: emblemImageAlt (collapsed)
  // Col 4: heading           Col 5: ctaLink   Col 6: ctaText (collapsed)
  const cols = block.firstElementChild
    ? [...block.firstElementChild.children]
    : [];

  const backgroundCell = cols[0] ?? null;
  const emblemCell = cols[2] ?? null;
  const headingCell = cols[4] ?? null;
  const ctaCell = cols[5] ?? null;
  const ctaTextCell = cols[6] ?? null;

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
