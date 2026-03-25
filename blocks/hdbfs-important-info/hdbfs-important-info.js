/**
 * hdbfs-important-info block — AEM EDS decorator
 *
 * "Important Information" section — horizontal card carousel.
 *
 * Authored table structure:
 *
 * ┌────────────────────────────────┬────────────────┬──────────┐
 * │ hdbfs-important-info           │                │          │
 * ├────────────────────────────────┼────────────────┼──────────┤
 * │ Section heading                │                │          │
 * ├────────────────────────────────┼────────────────┼──────────┤
 * │ Card image (picture)           │ Card title     │ CTA link │
 * │ …                              │ Card desc      │          │
 * └────────────────────────────────┴────────────────┴──────────┘
 *
 * Row 0: heading
 * Row 1+: col 0 = image, col 1 = title + description, col 2 = CTA
 */

const getText = (el) => (el ? el.textContent.trim() : '');
const getPicture = (cell) => {
  if (!cell) return null;
  return cell.querySelector('picture') || cell.querySelector('img');
};

export default function decorate(block) {
  const rows = [...block.children];

  // Heading
  const headingRow = rows.find((r) => !getPicture([...r.children][0]));
  const sectionTitle = headingRow ? getText([...headingRow.children][0]) : 'IMPORTANT INFORMATION';

  // Card rows
  const cardRows = rows.filter((r) => getPicture([...r.children][0]));
  const cards = cardRows.map((row) => {
    const cols = [...row.children];
    const picture = getPicture(cols[0]);
    const heading = cols[1]?.querySelector('h3,h4,h5,strong');
    const title = getText(heading || cols[1]);
    const desc = heading
      ? getText(cols[1]).replace(title, '').trim()
      : '';
    const anchor = cols[2]?.querySelector('a') || cols[1]?.querySelector('a');
    return {
      picture,
      title,
      desc,
      ctaText: anchor?.textContent.trim() || 'Know More',
      ctaHref: anchor?.href || '#',
    };
  });

  // Build DOM
  const wrapper = document.createElement('div');
  wrapper.className = 'hdbfs-info__wrapper';

  const heading = document.createElement('h2');
  heading.className = 'hdbfs-info__heading';
  heading.textContent = sectionTitle;
  wrapper.appendChild(heading);

  const grid = document.createElement('div');
  grid.className = 'hdbfs-info__grid';

  cards.forEach(({
    picture, title, desc, ctaText, ctaHref,
  }) => {
    const card = document.createElement('div');
    card.className = 'hdbfs-info__card';

    const imgWrap = document.createElement('div');
    imgWrap.className = 'hdbfs-info__card-img';
    if (picture) {
      const cloned = picture.cloneNode(true);
      if (cloned.tagName === 'IMG') cloned.loading = 'lazy';
      else { const img = cloned.querySelector('img'); if (img) img.loading = 'lazy'; }
      imgWrap.appendChild(cloned);
    }

    const body = document.createElement('div');
    body.className = 'hdbfs-info__card-body';

    const titleEl = document.createElement('h4');
    titleEl.className = 'hdbfs-info__card-title';
    titleEl.textContent = title;

    const descEl = document.createElement('p');
    descEl.className = 'hdbfs-info__card-desc';
    descEl.textContent = desc;

    const cta = document.createElement('a');
    cta.href = ctaHref;
    cta.className = 'hdbfs-info__card-cta';
    cta.textContent = ctaText;

    body.appendChild(titleEl);
    if (desc) body.appendChild(descEl);
    body.appendChild(cta);

    card.appendChild(imgWrap);
    card.appendChild(body);
    grid.appendChild(card);
  });

  wrapper.appendChild(grid);
  block.innerHTML = '';
  block.appendChild(wrapper);
}
