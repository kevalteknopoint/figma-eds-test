/**
 * OUR OFFERINGS block — AEM EDS decorator
 *
 * ──────────────────────────────────────────────────────────────────
 * Authored table structure (Word / SharePoint):
 *
 * ┌────────────────────────────────────────────────────────────────┐
 * │ Our Offerings                                                  │
 * ├───────────────────────────────────┬────────────────────────────┤
 * │ Hero image (picture)             │ Decorative overlay (picture)│
 * ├───────────────────────────────────┼────────────────────────────┤
 * │ Eyebrow / Title text             │ (blank)                    │
 * ├───────────────────────────────────┼────────────────────────────┤
 * │ Description text                 │ (blank)                    │
 * ├───────────────────────────────────┼────────────────────────────┤
 * │ CTA link                         │ CTA label                  │
 * └───────────────────────────────────┴────────────────────────────┘
 *
 * Row 0 col 0: hero image (picture/img)
 *        col 1: decorative mask image (optional, picture/img)
 * Row 1 col 0: eyebrow / title text (e.g. "Investment Needs")
 * Row 2 col 0: description text
 * Row 3 col 0: CTA link (anchor or URL)
 *        col 1: CTA label (plain text, optional — defaults to link text)
 *
 * Figma: node 1:2991 — "our offerings" card component
 * Layout: 50/50 split — image left, content right — on gold-100 bg
 * ──────────────────────────────────────────────────────────────────
 */

/** @param {HTMLElement|null} el */
const getText = (el) => (el ? el.textContent.trim() : '');

/**
 * Extract a <picture> from an authored cell.
 * @param {HTMLElement|null} cell
 * @returns {HTMLPictureElement|null}
 */
const getPicture = (cell) => {
  if (!cell) return null;
  const pic = cell.querySelector('picture');
  if (pic) return pic;
  const img = cell.querySelector('img');
  if (!img) return null;
  const wrapper = document.createElement('picture');
  wrapper.append(img);
  return wrapper;
};

/**
 * Build the CTA element from authored content.
 * Supports both authored <a> tags and plain-text URLs.
 * @param {HTMLElement} linkCell
 * @param {HTMLElement} labelCell
 * @returns {HTMLAnchorElement|null}
 */
const buildCta = (linkCell, labelCell) => {
  if (!linkCell) return null;

  let anchor = linkCell.querySelector('a');

  if (!anchor) {
    const href = getText(linkCell);
    if (!href) return null;
    anchor = document.createElement('a');
    anchor.href = href.startsWith('http') || href.startsWith('/') ? href : `https://${href}`;
  }

  const label = getText(labelCell) || anchor.textContent?.trim() || 'Know more';
  anchor.textContent = label;
  anchor.className = 'our-offerings__cta';

  return anchor;
};

/**
 * @param {HTMLElement} block
 */
export default function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];
  const getRow = (i) => rows[i]?.querySelectorAll(':scope > div') ?? [];

  /* ── Parse authored content ──────────────────────────────── */

  // Row 0: images — col 0 = hero, col 1 = decorative overlay
  const imageCells = getRow(0);
  const heroPicture = getPicture(imageCells[0]);
  const maskPicture = getPicture(imageCells[1]);

  // Row 1: eyebrow / title
  const titleCells = getRow(1);
  const titleText = getText(titleCells[0]);

  // Row 2: description
  const descCells = getRow(2);
  const descText = getText(descCells[0]);

  // Row 3: CTA
  const ctaCells = getRow(3);
  const cta = buildCta(ctaCells[0], ctaCells[1]);

  /* ── Build DOM ───────────────────────────────────────────── */

  // Clear authored table
  block.textContent = '';

  // Outer card container
  const card = document.createElement('div');
  card.className = 'our-offerings__card';

  // ── Left: image panel ─────────────────────────────────────
  const imagePanel = document.createElement('div');
  imagePanel.className = 'our-offerings__image-panel';

  if (heroPicture) {
    heroPicture.classList.add('our-offerings__hero-picture');
    const heroImg = heroPicture.querySelector('img');
    if (heroImg) {
      heroImg.loading = 'lazy';
      heroImg.alt = heroImg.alt || titleText || 'Offering image';
    }
    imagePanel.append(heroPicture);
  }

  if (maskPicture) {
    const maskWrap = document.createElement('div');
    maskWrap.className = 'our-offerings__mask';
    maskWrap.setAttribute('aria-hidden', 'true');
    const maskImg = maskPicture.querySelector('img');
    if (maskImg) maskImg.alt = '';
    maskWrap.append(maskPicture);
    imagePanel.append(maskWrap);
  }

  // ── Right: content panel ──────────────────────────────────
  const contentPanel = document.createElement('div');
  contentPanel.className = 'our-offerings__content';

  const textGroup = document.createElement('div');
  textGroup.className = 'our-offerings__text-group';

  if (titleText) {
    const titleEl = document.createElement('h3');
    titleEl.className = 'our-offerings__title';
    titleEl.textContent = titleText;
    textGroup.append(titleEl);
  }

  if (descText) {
    const descEl = document.createElement('p');
    descEl.className = 'our-offerings__desc';
    descEl.textContent = descText;
    textGroup.append(descEl);
  }

  contentPanel.append(textGroup);
  if (cta) contentPanel.append(cta);

  // ── Assemble ──────────────────────────────────────────────
  card.append(imagePanel, contentPanel);
  block.append(card);
}
