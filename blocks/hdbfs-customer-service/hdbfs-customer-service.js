/**
 * hdbfs-customer-service block — AEM EDS decorator
 *
 * "Customer Service" section — grid of service cards.
 *
 * Authored table structure (Word / SharePoint):
 *
 * ┌──────────────────────────────┬──────────────────┬─────────┐
 * │ hdbfs-customer-service       │                  │         │
 * ├──────────────────────────────┼──────────────────┼─────────┤
 * │ Section heading              │ (blank)          │         │
 * ├──────────────────────────────┼──────────────────┼─────────┤
 * │ Service image (picture)      │ Service title    │ CTA link│
 * ├──────────────────────────────┼──────────────────┼─────────┤
 * │ Service image (picture)      │ Service title    │ CTA link│
 * │ … (repeat for each service)  │                  │         │
 * └──────────────────────────────┴──────────────────┴─────────┘
 *
 * Each service row has:
 *   col 0 — image/icon (picture or img)
 *   col 1 — service title / description
 *   col 2 — CTA link (optional; falls back to any link in col 1)
 */

const getText = (el) => (el ? el.textContent.trim() : '');
const getPicture = (cell) => {
  if (!cell) return null;
  return cell.querySelector('picture') || cell.querySelector('img');
};

export default function decorate(block) {
  const rows = [...block.children];

  // ── Row 0: heading ────────────────────────────────────────
  let sectionTitle = 'CUSTOMER SERVICE';
  const headingRow = rows.find((row) => {
    const [c0] = [...row.children];
    return !getPicture(c0) && getText(c0).length > 0;
  });
  if (headingRow) {
    sectionTitle = getText([...headingRow.children][0]) || sectionTitle;
  }

  // ── Service rows ──────────────────────────────────────────
  const serviceRows = rows.filter((row) => {
    const [c0] = [...row.children];
    return getPicture(c0);
  });

  const services = serviceRows.map((row) => {
    const cols = [...row.children];
    const picture = getPicture(cols[0]);
    const titleCell = cols[1];
    const ctaCell = cols[2] || cols[1];

    const heading = titleCell?.querySelector('h1,h2,h3,h4,h5,h6');
    const title = getText(heading || titleCell);
    const desc = heading ? getText(titleCell).replace(title, '').trim() : '';
    const anchor = ctaCell?.querySelector('a') || titleCell?.querySelector('a');
    const ctaText = anchor ? anchor.textContent.trim() : '';
    const ctaHref = anchor?.href || '#';

    return {
      picture, title, desc, ctaText, ctaHref,
    };
  });

  // ── Build DOM ─────────────────────────────────────────────
  const wrapper = document.createElement('div');
  wrapper.className = 'hdbfs-cs__wrapper';

  const heading = document.createElement('h2');
  heading.className = 'hdbfs-cs__heading';
  heading.textContent = sectionTitle;
  wrapper.appendChild(heading);

  const grid = document.createElement('div');
  grid.className = 'hdbfs-cs__grid';

  services.forEach(({
    picture, title, desc, ctaText, ctaHref,
  }) => {
    const card = document.createElement('div');
    card.className = 'hdbfs-cs__card';

    const imgWrap = document.createElement('div');
    imgWrap.className = 'hdbfs-cs__card-img';
    if (picture) {
      const cloned = picture.cloneNode(true);
      if (cloned.tagName === 'IMG') {
        cloned.loading = 'lazy';
        cloned.alt = cloned.alt || title;
      } else {
        const img = cloned.querySelector('img');
        if (img) { img.loading = 'lazy'; img.alt = img.alt || title; }
      }
      imgWrap.appendChild(cloned);
    }

    const body = document.createElement('div');
    body.className = 'hdbfs-cs__card-body';

    const titleEl = document.createElement('h3');
    titleEl.className = 'hdbfs-cs__card-title';
    titleEl.textContent = title;
    body.appendChild(titleEl);

    if (desc) {
      const descEl = document.createElement('p');
      descEl.className = 'hdbfs-cs__card-desc';
      descEl.textContent = desc;
      body.appendChild(descEl);
    }

    if (ctaText) {
      const cta = document.createElement('a');
      cta.href = ctaHref;
      cta.className = 'hdbfs-cs__card-cta';
      cta.textContent = ctaText;
      body.appendChild(cta);
    }

    card.appendChild(imgWrap);
    card.appendChild(body);
    grid.appendChild(card);
  });

  wrapper.appendChild(grid);

  block.innerHTML = '';
  block.appendChild(wrapper);

  // Reset wrapper margins
  const outerWrapper = block.closest('.hdbfs-customer-service-wrapper, .hdbfs-customer-service-container');
  if (outerWrapper) outerWrapper.style.cssText = 'margin:0;padding:0;max-width:none;';
}
