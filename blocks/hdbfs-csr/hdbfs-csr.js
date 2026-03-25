/**
 * hdbfs-csr block — AEM EDS decorator
 *
 * "Corporate Social Responsibility" section.
 *
 * Authored table structure:
 *
 * ┌───────────────────────────────────┬──────────────────────────┐
 * │ hdbfs-csr                         │                          │
 * ├───────────────────────────────────┼──────────────────────────┤
 * │ Section heading                   │                          │
 * ├───────────────────────────────────┼──────────────────────────┤
 * │ CSR item title (link)             │ CSR description          │
 * │ …                                 │ + Read More link         │
 * └───────────────────────────────────┴──────────────────────────┘
 *
 * Row 0: heading (e.g. "CORPORATE SOCIAL RESPONSIBILITY")
 * Row 1+: col 0 = initiative title with optional video link
 *         col 1 = description text + optional "Read More" link
 */

const getText = (el) => (el ? el.textContent.trim() : '');

const getYouTubeId = (url) => {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtube') || u.hostname.includes('youtu.be')) {
      const embedMatch = u.pathname.match(/\/embed\/([^/?]+)/);
      if (embedMatch) return embedMatch[1];
      const shortsMatch = u.pathname.match(/\/shorts\/([^/?]+)/);
      if (shortsMatch) return shortsMatch[1];
      return u.searchParams.get('v') || u.pathname.split('/').pop();
    }
  } catch { /* ignore */ }
  return null;
};

export default function decorate(block) {
  const rows = [...block.children];

  const headingRow = rows.find((r) => {
    const [c0, c1] = [...r.children];
    return !c0.querySelector('a') && getText(c0).length < 80 && (!c1 || !getText(c1));
  });
  const sectionTitle = headingRow ? getText([...headingRow.children][0]) : 'CORPORATE SOCIAL RESPONSIBILITY';

  const itemRows = rows.filter((r) => r !== headingRow);
  const items = itemRows.map((row) => {
    const [c0, c1] = [...row.children];
    const anchors = [...(c0?.querySelectorAll('a') || [])];
    const videoAnchor = anchors.find((a) => getYouTubeId(a.href));
    const titleAnchor = anchors.find((a) => !getYouTubeId(a.href));
    const title = getText(titleAnchor || c0).replace(/\s+/g, ' ').trim();
    const videoId = videoAnchor ? getYouTubeId(videoAnchor.href) : null;
    const videoUrl = videoAnchor?.href || '';
    const desc = c1 ? getText(c1).replace(getText(c1.querySelector('a')), '').trim() : '';
    const readMoreAnchor = c1?.querySelector('a');
    const readMoreHref = readMoreAnchor?.href || '#';
    const readMoreText = readMoreAnchor?.textContent.trim() || 'Read More';
    return {
      title, videoId, videoUrl, desc, readMoreHref, readMoreText,
    };
  }).filter((i) => i.title || i.videoId);

  // Build DOM
  const wrapper = document.createElement('div');
  wrapper.className = 'hdbfs-csr__wrapper';

  const heading = document.createElement('h2');
  heading.className = 'hdbfs-csr__heading';
  heading.textContent = sectionTitle;
  wrapper.appendChild(heading);

  const grid = document.createElement('div');
  grid.className = 'hdbfs-csr__grid';

  items.forEach(({
    title, videoId, videoUrl, desc, readMoreHref, readMoreText,
  }) => {
    const card = document.createElement('div');
    card.className = 'hdbfs-csr__card';

    // Thumbnail / video
    if (videoId) {
      const videoWrap = document.createElement('a');
      videoWrap.href = videoUrl;
      videoWrap.target = '_blank';
      videoWrap.rel = 'noopener noreferrer';
      videoWrap.className = 'hdbfs-csr__video';

      const thumb = document.createElement('img');
      thumb.src = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
      thumb.alt = title;
      thumb.loading = 'lazy';
      thumb.className = 'hdbfs-csr__video-thumb';

      const playBtn = document.createElement('span');
      playBtn.className = 'hdbfs-csr__play';
      playBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>';

      videoWrap.appendChild(thumb);
      videoWrap.appendChild(playBtn);
      card.appendChild(videoWrap);
    }

    const body = document.createElement('div');
    body.className = 'hdbfs-csr__card-body';

    const titleEl = document.createElement('h3');
    titleEl.className = 'hdbfs-csr__card-title';
    titleEl.textContent = title;
    body.appendChild(titleEl);

    if (desc) {
      const descEl = document.createElement('p');
      descEl.className = 'hdbfs-csr__card-desc';
      descEl.textContent = desc;
      body.appendChild(descEl);
    }

    const readMore = document.createElement('a');
    readMore.href = readMoreHref;
    readMore.className = 'hdbfs-csr__read-more';
    readMore.textContent = readMoreText;
    body.appendChild(readMore);

    card.appendChild(body);
    grid.appendChild(card);
  });

  wrapper.appendChild(grid);
  block.innerHTML = '';
  block.appendChild(wrapper);
}
