/**
 * hdbfs-products block — AEM EDS decorator
 *
 * "Explore Our Products" carousel section.
 *
 * Authored table structure (Word / SharePoint):
 *
 * ┌─────────────────────────────────────┬──────────────────────┐
 * │ hdbfs-products                      │                      │
 * ├─────────────────────────────────────┼──────────────────────┤
 * │ Section heading                     │ (blank)              │
 * ├─────────────────────────────────────┼──────────────────────┤
 * │ Product image (picture)             │ Product name         │
 * ├─────────────────────────────────────┼──────────────────────┤
 * │ Product image (picture)             │ Product name         │
 * │ … (repeat for each product)         │                      │
 * └─────────────────────────────────────┴──────────────────────┘
 *
 * Row 0: section heading text (e.g. "EXPLORE OUR PRODUCTS")
 * Row 1+: each product — col 0 = icon/image, col 1 = product name + optional link
 */

const getText = (el) => (el ? el.textContent.trim() : '');
const getPicture = (cell) => {
  if (!cell) return null;
  return cell.querySelector('picture') || cell.querySelector('img');
};

export default function decorate(block) {
  const rows = [...block.children];

  // ── Row 0: heading ────────────────────────────────────────
  const headingRow = rows[0];
  let sectionTitle = '';
  if (headingRow) {
    const [c0] = [...headingRow.children];
    sectionTitle = getText(c0) || 'EXPLORE OUR PRODUCTS';
  }

  // ── Rows 1+: products ─────────────────────────────────────
  const productRows = rows.slice(1);
  const products = productRows.map((row) => {
    const [c0, c1] = [...row.children];
    const picture = getPicture(c0);
    const anchor = c1?.querySelector('a');
    const name = getText(c1);
    const href = anchor?.href || '#';
    return { picture, name, href };
  }).filter((p) => p.name || p.picture);

  // ── Build DOM ─────────────────────────────────────────────
  const section = document.createElement('div');
  section.className = 'hdbfs-products__section';

  // Section heading
  const heading = document.createElement('h2');
  heading.className = 'hdbfs-products__heading';
  heading.textContent = sectionTitle;
  section.appendChild(heading);

  // Carousel container
  const carousel = document.createElement('div');
  carousel.className = 'hdbfs-products__carousel-wrap';

  const prevBtn = document.createElement('button');
  prevBtn.className = 'hdbfs-products__nav hdbfs-products__nav--prev';
  prevBtn.setAttribute('aria-label', 'Previous products');
  prevBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>';

  const track = document.createElement('div');
  track.className = 'hdbfs-products__track';

  const nextBtn = document.createElement('button');
  nextBtn.className = 'hdbfs-products__nav hdbfs-products__nav--next';
  nextBtn.setAttribute('aria-label', 'Next products');
  nextBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>';

  products.forEach(({ picture, name, href }) => {
    const card = document.createElement('a');
    card.href = href;
    card.className = 'hdbfs-products__card';
    card.setAttribute('aria-label', name);

    const imgWrap = document.createElement('div');
    imgWrap.className = 'hdbfs-products__card-img';
    if (picture) {
      const cloned = picture.cloneNode(true);
      if (cloned.tagName === 'IMG') {
        cloned.loading = 'lazy';
        cloned.alt = cloned.alt || name;
      } else {
        const img = cloned.querySelector('img');
        if (img) { img.loading = 'lazy'; img.alt = img.alt || name; }
      }
      imgWrap.appendChild(cloned);
    }

    const label = document.createElement('p');
    label.className = 'hdbfs-products__card-name';
    label.textContent = name;

    card.appendChild(imgWrap);
    card.appendChild(label);
    track.appendChild(card);
  });

  carousel.appendChild(prevBtn);
  carousel.appendChild(track);
  carousel.appendChild(nextBtn);
  section.appendChild(carousel);

  // ── Carousel logic ────────────────────────────────────────
  let currentIndex = 0;
  const getVisibleCount = () => {
    if (window.innerWidth >= 1024) return 6;
    if (window.innerWidth >= 768) return 4;
    if (window.innerWidth >= 480) return 3;
    return 2;
  };

  const updateCarousel = () => {
    const count = getVisibleCount();
    const max = Math.max(0, products.length - count);
    currentIndex = Math.min(currentIndex, max);
    const cardWidth = track.firstElementChild?.offsetWidth || 160;
    const gap = 16;
    track.style.transform = `translateX(-${currentIndex * (cardWidth + gap)}px)`;
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex >= max;
  };

  prevBtn.addEventListener('click', () => {
    currentIndex = Math.max(0, currentIndex - getVisibleCount());
    updateCarousel();
  });

  nextBtn.addEventListener('click', () => {
    const max = Math.max(0, products.length - getVisibleCount());
    currentIndex = Math.min(max, currentIndex + getVisibleCount());
    updateCarousel();
  });

  window.addEventListener('resize', updateCarousel);
  requestAnimationFrame(updateCarousel);

  // ── Replace block ─────────────────────────────────────────
  block.innerHTML = '';
  block.appendChild(section);

  // Reset wrapper margins
  const wrapper = block.closest('.hdbfs-products-wrapper, .hdbfs-products-container');
  if (wrapper) wrapper.style.cssText = 'margin:0;padding:0;max-width:none;';
}
