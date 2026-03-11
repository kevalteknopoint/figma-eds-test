/**
 * HOW WE SERVE block — AEM EDS decorator
 *
 * ──────────────────────────────────────────────────────────────────
 * Authored table structure (Word / SharePoint):
 *
 * ┌────────────────────────────────────────────────────────────────┐
 * │ How We Serve                                                   │
 * ├────────────────────────────────┬───────────────────────────────┤
 * │ Eyebrow text                   │ (blank)                       │
 * ├────────────────────────────────┴───────────────────────────────┤
 * │ Headline text                                                  │
 * ├────────────────────────────────┬───────────────────────────────┤
 * │ Service item label             │ (blank)                       │
 * │ …                              │ …                             │
 * ├────────────────────────────────┴───────────────────────────────┤
 * │ CTA label + link               │ (blank)                       │
 * ├────────────────────────────────┬───────────────────────────────┤
 * │ (blank)                        │ Image / picture               │
 * └────────────────────────────────┴───────────────────────────────┘
 *
 * Rules:
 * - Row 0  col 0: eyebrow
 * - Row 1  col 0: headline (h2)
 * - Rows 2..N-2 col 0: service item labels (each becomes an arrow link row)
 * - Row N-1 col 0: CTA (paragraph or anchor element)
 * - Last row col 1: image / picture for the right panel
 *
 * Optional:
 * - Image row is optional; block renders left-only if absent.
 * - CTA row is optional.
 * - Service items with an <a> tag get the href applied to their arrow.
 *
 * Example table:
 * ┌─────────────────────────────────┬──────────────────────────────┐
 * │ How we serve you                │                              │
 * ├─────────────────────────────────┴──────────────────────────────┤
 * │ Enabled by an execution mode of your choice                    │
 * ├─────────────────────────────────┬──────────────────────────────┤
 * │ Execution Services              │                              │
 * ├─────────────────────────────────┼──────────────────────────────┤
 * │ Investment Advisory             │                              │
 * ├─────────────────────────────────┼──────────────────────────────┤
 * │ Non-Discretionary Mandate       │                              │
 * ├─────────────────────────────────┼──────────────────────────────┤
 * │ Discretionary Mandate Solutions │                              │
 * ├─────────────────────────────────┼──────────────────────────────┤
 * │ [Learn More](/how-we-serve)     │                              │
 * ├─────────────────────────────────┼──────────────────────────────┤
 * │                                 │ [image]                      │
 * └─────────────────────────────────┴──────────────────────────────┘
 */

const getText = (el) => (el ? el.textContent.trim() : '');
const getPicture = (cell) => cell?.querySelector('picture') || null;

/**
 * Build a service list item with an arrow button.
 * @param {string} label
 * @param {string|null} href
 * @returns {HTMLLIElement}
 */
const buildServiceItem = (label, href) => {
  const li = document.createElement('li');
  li.className = 'how-we-serve__item';

  const labelEl = document.createElement('p');
  labelEl.className = 'how-we-serve__item-label';
  labelEl.textContent = label;

  const arrow = document.createElement(href ? 'a' : 'button');
  arrow.className = 'how-we-serve__item-arrow';

  if (href) {
    arrow.href = href;
    arrow.setAttribute('aria-label', `Learn about ${label}`);
  } else {
    arrow.setAttribute('type', 'button');
    arrow.setAttribute('aria-label', `Learn about ${label}`);
  }

  li.append(labelEl, arrow);
  return li;
};

/**
 * Build the CTA element from authored content.
 * Supports both authored anchor tags and plain text (creates a button look).
 * @param {HTMLElement} cell
 * @returns {HTMLElement}
 */
const buildCta = (cell) => {
  if (!cell) return null;
  const wrap = document.createElement('div');
  wrap.className = 'how-we-serve__cta';

  const anchor = cell.querySelector('a');
  if (anchor) {
    // Style the authored link as a button
    anchor.className = 'how-we-serve__cta-btn';
    wrap.append(anchor.cloneNode(true));
  } else {
    const text = getText(cell);
    if (text) {
      const btn = document.createElement('button');
      btn.className = 'how-we-serve__cta-btn';
      btn.setAttribute('type', 'button');
      btn.textContent = text;
      wrap.append(btn);
    }
  }
  return wrap.children.length ? wrap : null;
};

/**
 * @param {HTMLElement} block
 */
export default function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];
  const getRow = (i) => [...(rows[i]?.querySelectorAll(':scope > div') ?? [])];

  if (!rows.length) return;

  // Detect last row with an image (right panel)
  let imageCell = null;
  let imageRowIdx = -1;
  for (let i = rows.length - 1; i >= 0; i -= 1) {
    const cells = getRow(i);
    if (getPicture(cells[1]) || getPicture(cells[0])) {
      imageCell = getPicture(cells[1]) || getPicture(cells[0]);
      imageRowIdx = i;
      break;
    }
  }

  // Row 0: eyebrow
  const eyebrow = getText(getRow(0)[0]) || 'How we serve you';
  // Row 1: headline
  const headline = getText(getRow(1)[0]) || '';

  // Determine content rows (between header and CTA/image)
  // Content rows: rows 2 up to (but not including) CTA and image rows
  const contentEnd = imageRowIdx >= 0 ? imageRowIdx : rows.length;

  // Detect CTA row: last non-image row that has an <a> or non-empty text
  // We look at row contentEnd-1
  let ctaCell = null;
  let ctaRowIdx = -1;
  const potentialCta = getRow(contentEnd - 1);
  const ctaText = getText(potentialCta[0]);
  const hasAnchor = potentialCta[0]?.querySelector('a');
  // Distinguish service items (pure text, no link) from CTA rows (link, or "Learn More" style).
  // Heuristic: cell contains an <a> OR the text is short and doesn't look like a service name
  if (potentialCta.length && (hasAnchor || (ctaText && ctaText.length < 25))) {
    ctaCell = potentialCta[0];
    ctaRowIdx = contentEnd - 1;
  }

  const serviceEnd = ctaRowIdx >= 0 ? ctaRowIdx : contentEnd;
  const serviceRows = rows.slice(2, serviceEnd);

  // ── Build left panel ─────────────────────────────────────────────
  const content = document.createElement('div');
  content.className = 'how-we-serve__content';

  const headerEl = document.createElement('div');
  headerEl.className = 'how-we-serve__header';

  const eyebrowEl = document.createElement('p');
  eyebrowEl.className = 'how-we-serve__eyebrow';
  eyebrowEl.textContent = eyebrow;
  headerEl.append(eyebrowEl);

  if (headline) {
    const headlineEl = document.createElement('h2');
    headlineEl.className = 'how-we-serve__headline';
    headlineEl.textContent = headline;
    headerEl.append(headlineEl);
  }

  content.append(headerEl);

  // Service list
  if (serviceRows.length) {
    const list = document.createElement('ul');
    list.className = 'how-we-serve__list';
    list.setAttribute('aria-label', 'Service modes');

    serviceRows.forEach((row) => {
      const cells = [...row.querySelectorAll(':scope > div')];
      const [labelCell] = cells;
      if (!labelCell) return;

      const anchor = labelCell.querySelector('a');
      const label = anchor ? anchor.textContent.trim() : getText(labelCell);
      const href = anchor ? anchor.href : null;

      if (label) {
        list.append(buildServiceItem(label, href));
      }
    });

    if (list.children.length) content.append(list);
  }

  // CTA
  if (ctaCell) {
    const cta = buildCta(ctaCell);
    if (cta) content.append(cta);
  }

  // ── Build right panel (image) ────────────────────────────────────
  let mediaEl = null;
  if (imageCell) {
    mediaEl = document.createElement('div');
    mediaEl.className = 'how-we-serve__media';

    const img = imageCell.querySelector('img');
    if (img) {
      // LCP candidate: this is above the fold on desktop — do NOT lazy load
      img.removeAttribute('loading');
      img.setAttribute('decoding', 'async');
      img.removeAttribute('width');
      img.removeAttribute('height');
      if (!img.alt) img.alt = '';
    }
    mediaEl.append(imageCell);
  }

  // ── Assemble block ───────────────────────────────────────────────
  const inner = document.createElement('div');
  inner.className = 'how-we-serve__inner';
  inner.append(content);
  if (mediaEl) inner.append(mediaEl);

  block.innerHTML = '';
  block.append(inner);
}
