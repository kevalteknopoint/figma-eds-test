/**
 * hdbfs-blogs block — AEM EDS decorator
 *
 * "Blogs" section — horizontal card list with social share icons.
 *
 * Authored table structure:
 *
 * ┌──────────────────────────────────┬──────────────────────────┐
 * │ hdbfs-blogs                      │                          │
 * ├──────────────────────────────────┼──────────────────────────┤
 * │ Section heading                  │                          │
 * ├──────────────────────────────────┼──────────────────────────┤
 * │ Blog title (link)                │ Blog excerpt             │
 * │ …                                │                          │
 * └──────────────────────────────────┴──────────────────────────┘
 *
 * Row 0: heading
 * Row 1+: col 0 = blog title with optional link, col 1 = excerpt text
 *
 * Optional: "View All" link as last row with no col 1 content.
 */

const getText = (el) => (el ? el.textContent.trim() : '');

export default function decorate(block) {
  const rows = [...block.children];

  // Heading row
  const headingRow = rows.find((r) => {
    const cols = [...r.children];
    return !cols[0].querySelector('a') && getText(cols[0]).length < 80;
  });
  const sectionTitle = headingRow ? getText([...headingRow.children][0]) : 'BLOGS';

  // View All link check (last row with single col)
  const lastRow = rows[rows.length - 1];
  const lastCols = [...lastRow.children];
  let viewAllHref = null;
  let viewAllText = null;
  const viewAllAnchor = lastCols[0].querySelector('a');
  if (viewAllAnchor && getText(lastCols[1] || lastCols[0]).toLowerCase().includes('view all') || (viewAllAnchor && viewAllAnchor.textContent.toLowerCase().includes('view all'))) {
    viewAllHref = viewAllAnchor.href;
    viewAllText = viewAllAnchor.textContent.trim() || 'View All';
  }

  // Blog item rows
  const blogRows = rows.filter((r) => r !== headingRow && r !== (viewAllHref ? lastRow : null));
  const blogs = blogRows.map((row) => {
    const [c0, c1] = [...row.children];
    const anchor = c0.querySelector('a');
    const title = getText(anchor || c0);
    const href = anchor?.href || '#';
    const excerpt = getText(c1);
    return { title, href, excerpt };
  }).filter((b) => b.title);

  // Build DOM
  const wrapper = document.createElement('div');
  wrapper.className = 'hdbfs-blogs__wrapper';

  const heading = document.createElement('h2');
  heading.className = 'hdbfs-blogs__heading';
  heading.textContent = sectionTitle;
  wrapper.appendChild(heading);

  const grid = document.createElement('div');
  grid.className = 'hdbfs-blogs__grid';

  blogs.slice(0, 4).forEach(({ title, href, excerpt }) => {
    const card = document.createElement('div');
    card.className = 'hdbfs-blogs__card';

    const body = document.createElement('div');
    body.className = 'hdbfs-blogs__card-body';

    const titleLink = document.createElement('a');
    titleLink.href = href;
    titleLink.className = 'hdbfs-blogs__card-title';
    titleLink.textContent = title;

    const excerptEl = document.createElement('p');
    excerptEl.className = 'hdbfs-blogs__card-excerpt';
    excerptEl.textContent = excerpt;

    // Social share strip
    const share = document.createElement('div');
    share.className = 'hdbfs-blogs__share';
    const encodedUrl = encodeURIComponent(href);
    const shareLinks = [
      { label: 'Share on WhatsApp', icon: '💬', url: `https://api.whatsapp.com/send?text=${encodedUrl}` },
      { label: 'Share on Twitter', icon: '🐦', url: `https://twitter.com/intent/tweet?url=${encodedUrl}` },
      { label: 'Share on Facebook', icon: '📘', url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}` },
    ];
    shareLinks.forEach(({ label, icon, url }) => {
      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.className = 'hdbfs-blogs__share-icon';
      a.setAttribute('aria-label', label);
      a.textContent = icon;
      share.appendChild(a);
    });

    const readMore = document.createElement('a');
    readMore.href = href;
    readMore.className = 'hdbfs-blogs__read-more';
    readMore.textContent = 'READ MORE';

    body.appendChild(titleLink);
    body.appendChild(excerptEl);
    body.appendChild(share);
    body.appendChild(readMore);
    card.appendChild(body);
    grid.appendChild(card);
  });

  wrapper.appendChild(grid);

  if (viewAllHref) {
    const viewAllWrap = document.createElement('div');
    viewAllWrap.className = 'hdbfs-blogs__view-all';
    const viewAllLink = document.createElement('a');
    viewAllLink.href = viewAllHref;
    viewAllLink.className = 'hdbfs-blogs__view-all-link';
    viewAllLink.textContent = viewAllText;
    viewAllWrap.appendChild(viewAllLink);
    wrapper.appendChild(viewAllWrap);
  }

  block.innerHTML = '';
  block.appendChild(wrapper);
}
