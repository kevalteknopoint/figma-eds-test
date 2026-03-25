/**
 * hdbfs-testimonials block — AEM EDS decorator
 *
 * "Testimonials" carousel section — quotes + optional video links.
 *
 * Authored table structure:
 *
 * ┌────────────────────────────────┬───────────────────────────┐
 * │ hdbfs-testimonials             │                           │
 * ├────────────────────────────────┼───────────────────────────┤
 * │ Section heading                │ (blank)                   │
 * ├────────────────────────────────┼───────────────────────────┤
 * │ Customer name                  │ Testimonial text / video  │
 * │ …                              │                           │
 * └────────────────────────────────┴───────────────────────────┘
 *
 * Row 0: heading
 * Row 1+: col 0 = customer name (+ optional video link), col 1 = quote text
 *
 * If col 1 contains a YouTube link, a play-button thumbnail is shown.
 */

const getText = (el) => (el ? el.textContent.trim() : '');

const getYouTubeId = (url) => {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtube') || u.hostname.includes('youtu.be')) {
      // embed URL
      const embedMatch = u.pathname.match(/\/embed\/([^/?]+)/);
      if (embedMatch) return embedMatch[1];
      // shorts URL
      const shortsMatch = u.pathname.match(/\/shorts\/([^/?]+)/);
      if (shortsMatch) return shortsMatch[1];
      // normal watch
      return u.searchParams.get('v') || u.pathname.split('/').pop();
    }
  } catch {
    // ignore
  }
  return null;
};

export default function decorate(block) {
  const rows = [...block.children];

  // Heading
  const headingRow = rows.find((r) => {
    const cols = [...r.children];
    return cols.length >= 1 && !cols[0].querySelector('a') && getText(cols[0]).length < 100 && !getText(cols[1]);
  });
  const sectionTitle = headingRow ? getText([...headingRow.children][0]) : 'TESTIMONIALS';

  // Item rows
  const itemRows = rows.filter((r) => r !== headingRow);
  const items = itemRows.map((row) => {
    const [c0, c1] = [...row.children];
    const name = getText(c0).replace(/testimonial/i, '').trim();
    const anchor = c0?.querySelector('a') || c1?.querySelector('a');
    const videoUrl = anchor?.href || '';
    const ytId = videoUrl ? getYouTubeId(videoUrl) : null;
    const quote = getText(c1);
    return {
      name, quote, ytId, videoUrl,
    };
  }).filter((i) => i.name);

  // Build DOM
  const wrapper = document.createElement('div');
  wrapper.className = 'hdbfs-testimonials__wrapper';

  const heading = document.createElement('h2');
  heading.className = 'hdbfs-testimonials__heading';
  heading.textContent = sectionTitle;
  wrapper.appendChild(heading);

  const carouselWrap = document.createElement('div');
  carouselWrap.className = 'hdbfs-testimonials__carousel';

  const prevBtn = document.createElement('button');
  prevBtn.className = 'hdbfs-testimonials__nav hdbfs-testimonials__nav--prev';
  prevBtn.setAttribute('aria-label', 'Previous testimonial');
  prevBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>';

  const track = document.createElement('div');
  track.className = 'hdbfs-testimonials__track';

  const nextBtn = document.createElement('button');
  nextBtn.className = 'hdbfs-testimonials__nav hdbfs-testimonials__nav--next';
  nextBtn.setAttribute('aria-label', 'Next testimonial');
  nextBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>';

  items.forEach(({
    name, quote, ytId, videoUrl,
  }) => {
    const card = document.createElement('div');
    card.className = 'hdbfs-testimonials__card';

    // Quote icon
    const quoteIcon = document.createElement('div');
    quoteIcon.className = 'hdbfs-testimonials__quote-icon';
    quoteIcon.innerHTML = '&#8220;';
    card.appendChild(quoteIcon);

    if (ytId) {
      // Video thumbnail
      const videoWrap = document.createElement('a');
      videoWrap.href = videoUrl;
      videoWrap.target = '_blank';
      videoWrap.rel = 'noopener noreferrer';
      videoWrap.className = 'hdbfs-testimonials__video';

      const thumb = document.createElement('img');
      thumb.src = `https://img.youtube.com/vi/${ytId}/mqdefault.jpg`;
      thumb.alt = `${name} testimonial video`;
      thumb.loading = 'lazy';
      thumb.className = 'hdbfs-testimonials__video-thumb';

      const playBtn = document.createElement('span');
      playBtn.className = 'hdbfs-testimonials__play';
      playBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>';

      videoWrap.appendChild(thumb);
      videoWrap.appendChild(playBtn);
      card.appendChild(videoWrap);
    } else if (quote) {
      const quoteText = document.createElement('p');
      quoteText.className = 'hdbfs-testimonials__quote';
      quoteText.textContent = quote;
      card.appendChild(quoteText);
    }

    const nameEl = document.createElement('p');
    nameEl.className = 'hdbfs-testimonials__name';
    nameEl.textContent = name;
    card.appendChild(nameEl);

    track.appendChild(card);
  });

  carouselWrap.appendChild(prevBtn);
  carouselWrap.appendChild(track);
  carouselWrap.appendChild(nextBtn);
  wrapper.appendChild(carouselWrap);

  // Dots
  const dots = document.createElement('div');
  dots.className = 'hdbfs-testimonials__dots';
  const dotsCount = Math.ceil(items.length / 3);
  let activeDot = 0;
  const dotEls = Array.from({ length: dotsCount }, (_, i) => {
    const dot = document.createElement('button');
    dot.className = `hdbfs-testimonials__dot${i === 0 ? ' is-active' : ''}`;
    dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
    dots.appendChild(dot);
    return dot;
  });
  wrapper.appendChild(dots);

  // Carousel logic
  let currentIndex = 0;
  const getVisible = () => (window.innerWidth >= 900 ? 3 : window.innerWidth >= 600 ? 2 : 1);

  const update = () => {
    const vis = getVisible();
    const max = Math.max(0, items.length - vis);
    currentIndex = Math.min(currentIndex, max);
    const cardWidth = track.firstElementChild?.offsetWidth || 300;
    const gap = 20;
    track.style.transform = `translateX(-${currentIndex * (cardWidth + gap)}px)`;
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex >= max;

    // Update dots
    const activeGroup = Math.floor(currentIndex / vis);
    dotEls.forEach((d, i) => d.classList.toggle('is-active', i === activeGroup));
    activeDot = activeGroup;
  };

  prevBtn.addEventListener('click', () => {
    currentIndex = Math.max(0, currentIndex - getVisible());
    update();
  });

  nextBtn.addEventListener('click', () => {
    const max = Math.max(0, items.length - getVisible());
    currentIndex = Math.min(max, currentIndex + getVisible());
    update();
  });

  dotEls.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      currentIndex = i * getVisible();
      update();
    });
  });

  window.addEventListener('resize', update);
  requestAnimationFrame(update);

  block.innerHTML = '';
  block.appendChild(wrapper);
}
