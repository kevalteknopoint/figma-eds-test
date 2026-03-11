/**
 * WHO WE SERVE block — AEM EDS decorator
 *
 * ──────────────────────────────────────────────────────────────────
 * Authored table structure (Word / SharePoint):
 *
 * ┌─────────────────────────────────────────────────────────────────┐
 * │ Who We Serve                                                    │
 * ├───────────────────────────────────┬────────────────────────────┤
 * │ Eyebrow text                      │ (blank)                    │
 * ├───────────────────────────────────┴────────────────────────────┤
 * │ Headline text (full width)                                     │
 * ├─────────────────────┬──────────────────┬───────────────────────┤
 * │ Card title          │ Card description │ Card image (picture)  │
 * ├─────────────────────┼──────────────────┼───────────────────────┤
 * │ …                   │ …                │ …                     │
 * └─────────────────────┴──────────────────┴───────────────────────┘
 *
 * - Row 0: eyebrow text in col 0
 * - Row 1: headline text in col 0 (spans full row)
 * - Rows 2+: each row = one card
 *   col 0 = card title
 *   col 1 = card description (short sub-heading)
 *   col 2 = card image (picture element from AEM)
 *
 * The block adds a horizontal scroll carousel with a progress bar.
 * The + button on each card is keyboard and screen-reader accessible.
 *
 * Reusability note:
 * updateProgressBar() and the IntersectionObserver scroll-tracking
 * pattern are good candidates for a shared /scripts/carousel-utils.js
 * if other carousel blocks exist on the project.
 */

/**
 * Build a responsive picture element from an authored cell.
 * Falls back gracefully if no image exists.
 * @param {HTMLElement|null} cell
 * @returns {HTMLPictureElement|null}
 */
const extractPicture = (cell) => {
  if (!cell) return null;
  return cell.querySelector('picture') || null;
};

/**
 * Update the progress bar fill width based on current scroll offset.
 * @param {HTMLElement} track
 * @param {HTMLElement} fill
 */
const updateProgress = (track, fill) => {
  const { scrollLeft, scrollWidth, clientWidth } = track;
  const max = scrollWidth - clientWidth;
  if (max <= 0) {
    fill.style.width = '100%';
    return;
  }
  const pct = Math.min(100, Math.round((scrollLeft / max) * 100));
  fill.style.width = `${pct}%`;
};

/**
 * @param {HTMLElement} block
 */
export default function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];
  const getRow = (i) => rows[i]?.querySelectorAll(':scope > div') ?? [];

  // Extract header content
  const eyebrowCells = getRow(0);
  const headingCells = getRow(1);

  const eyebrow = eyebrowCells[0]?.textContent.trim() || 'Who we serve';
  const headingText = headingCells[0]?.textContent.trim() || '';

  // Extract cards from row 2 onward
  const cardRows = rows.slice(2);

  // ── Build section header ─────────────────────────────────────────
  const header = document.createElement('div');
  header.className = 'who-we-serve__header';

  const eyebrowEl = document.createElement('p');
  eyebrowEl.className = 'who-we-serve__eyebrow';
  eyebrowEl.textContent = eyebrow;
  header.append(eyebrowEl);

  if (headingText) {
    const headingEl = document.createElement('h2');
    headingEl.className = 'who-we-serve__headline';
    headingEl.textContent = headingText;
    header.append(headingEl);
  }

  // ── Build carousel track ────────────────────────────────────────
  const trackWrap = document.createElement('div');
  trackWrap.className = 'who-we-serve__track-wrap';

  const track = document.createElement('ul');
  track.className = 'who-we-serve__track';
  track.setAttribute('role', 'list');
  track.setAttribute('aria-label', 'Client segments');

  cardRows.forEach((row, idx) => {
    const cells = row.querySelectorAll(':scope > div');
    const title = cells[0]?.textContent.trim();
    const desc = cells[1]?.textContent.trim();
    const picture = extractPicture(cells[2]);

    if (!title) return;

    const cardId = `who-we-serve-card-${idx}`;
    const btnId = `who-we-serve-btn-${idx}`;

    const li = document.createElement('li');
    li.className = 'who-we-serve__card';
    li.id = cardId;

    // Card header band
    const cardHeader = document.createElement('div');
    cardHeader.className = 'who-we-serve__card-header';

    const cardTop = document.createElement('div');
    cardTop.className = 'who-we-serve__card-top';

    const textWrap = document.createElement('div');
    textWrap.className = 'who-we-serve__card-text';

    const titleEl = document.createElement('p');
    titleEl.className = 'who-we-serve__card-title';
    titleEl.textContent = title;

    if (desc) {
      const descEl = document.createElement('p');
      descEl.className = 'who-we-serve__card-desc';
      descEl.textContent = desc;
      textWrap.append(titleEl, descEl);
    } else {
      textWrap.append(titleEl);
    }

    // Expand / + button
    const btn = document.createElement('button');
    btn.className = 'who-we-serve__card-btn';
    btn.id = btnId;
    btn.setAttribute('type', 'button');
    btn.setAttribute('aria-label', `Learn more about ${title}`);
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', cardId);

    cardTop.append(textWrap, btn);
    cardHeader.append(cardTop);

    // Card image
    if (picture) {
      const imgWrap = document.createElement('div');
      imgWrap.className = 'who-we-serve__card-media';
      // Ensure image fills its container without distorting
      const img = picture.querySelector('img');
      if (img) {
        img.setAttribute('loading', 'lazy');
        img.setAttribute('decoding', 'async');
        img.removeAttribute('width');
        img.removeAttribute('height');
        // Alt text: use authored alt or fall back to title
        if (!img.alt) img.alt = title;
      }
      imgWrap.append(picture);
      li.append(cardHeader, imgWrap);
    } else {
      li.append(cardHeader);
    }

    track.append(li);
  });

  trackWrap.append(track);

  // ── Build progress bar ───────────────────────────────────────────
  const progressWrap = document.createElement('div');
  progressWrap.className = 'who-we-serve__progress-wrap';
  progressWrap.setAttribute('aria-hidden', 'true');

  const progressBar = document.createElement('div');
  progressBar.className = 'who-we-serve__progress';
  progressBar.setAttribute('role', 'progressbar');
  progressBar.setAttribute('aria-valuemin', '0');
  progressBar.setAttribute('aria-valuemax', '100');
  progressBar.setAttribute('aria-valuenow', '0');

  const fill = document.createElement('div');
  fill.className = 'who-we-serve__progress-fill';
  progressBar.append(fill);
  progressWrap.append(progressBar);

  // ── Assemble block ───────────────────────────────────────────────
  block.innerHTML = '';
  block.append(header, trackWrap, progressWrap);

  // ── Scroll → progress sync ───────────────────────────────────────
  // Use passive scroll listener for INP safety
  let rafId = null;
  const onScroll = () => {
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      updateProgress(track, fill);
      const { scrollLeft, scrollWidth, clientWidth } = track;
      const max = scrollWidth - clientWidth;
      const pct = max > 0 ? Math.round((scrollLeft / max) * 100) : 100;
      progressBar.setAttribute('aria-valuenow', pct);
      rafId = null;
    });
  };

  track.addEventListener('scroll', onScroll, { passive: true });
  // Initial state
  updateProgress(track, fill);

  // ── Keyboard navigation (arrow keys on track) ───────────────────
  track.addEventListener('keydown', (e) => {
    if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
    const cardWidth = track.querySelector('.who-we-serve__card')?.offsetWidth ?? 0;
    const gap = 16;
    const step = cardWidth + gap;
    track.scrollBy({
      left: e.key === 'ArrowRight' ? step : -step,
      behavior: 'smooth',
    });
    e.preventDefault();
  });
}
