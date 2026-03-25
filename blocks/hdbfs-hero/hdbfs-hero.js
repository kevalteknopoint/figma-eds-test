/**
 * hdbfs-hero block — AEM EDS decorator
 *
 * Authored table structure (Word / SharePoint):
 *
 * ┌─────────────────────────────────────┬──────────────────────┐
 * │ hdbfs-hero                          │                      │
 * ├─────────────────────────────────────┼──────────────────────┤
 * │ Ticker text items (line-by-line)    │ (blank)              │
 * │ e.g. "HDBFS - Celebrating Customer  │                      │
 * │  Service Week | ARC Sale Process…"  │                      │
 * ├─────────────────────────────────────┼──────────────────────┤
 * │ Hero heading                        │ (blank)              │
 * ├─────────────────────────────────────┼──────────────────────┤
 * │ Hero sub-heading / badge tags       │ (blank)              │
 * ├─────────────────────────────────────┼──────────────────────┤
 * │ CTA link                            │ CTA label            │
 * ├─────────────────────────────────────┼──────────────────────┤
 * │ Hero background image               │ (blank)              │
 * └─────────────────────────────────────┴──────────────────────┘
 *
 * The first row whose col-0 has a bullet list (ul/ol) is treated as ticker items.
 * Each list item becomes a scrolling ticker message (pipe-separated).
 * Remaining rows: heading, tag pills, CTA, background image.
 */

const getText = (el) => (el ? el.textContent.trim() : '');
const getPicture = (cell) => {
  if (!cell) return null;
  return cell.querySelector('picture') || cell.querySelector('img');
};

export default function decorate(block) {
  const rows = [...block.children];

  let tickerCell = null;
  let headingCell = null;
  let tagsCell = null;
  let ctaCell = null;
  let ctaLabelCell = null;
  let bgImageCell = null;

  rows.forEach((row) => {
    const [c0, c1] = [...row.children];
    if (!tickerCell && c0.querySelector('ul, ol')) {
      tickerCell = c0;
    } else if (!bgImageCell && getPicture(c0)) {
      bgImageCell = c0;
    } else if (!headingCell && (c0.querySelector('h1,h2,h3,h4,h5,h6') || (!tagsCell && !ctaCell))) {
      headingCell = c0;
    } else if (!tagsCell && getText(c0).length < 200 && !c0.querySelector('a')) {
      tagsCell = c0;
    } else if (!ctaCell && c0.querySelector('a')) {
      ctaCell = c0;
      ctaLabelCell = c1;
    }
  });

  // ── Build ticker ──────────────────────────────────────────
  const ticker = document.createElement('div');
  ticker.className = 'hdbfs-hero__ticker';
  if (tickerCell) {
    const items = [...tickerCell.querySelectorAll('li')];
    if (items.length) {
      const track = document.createElement('div');
      track.className = 'hdbfs-hero__ticker-track';

      const buildItems = () => items.map((li) => {
        const span = document.createElement('span');
        span.className = 'hdbfs-hero__ticker-item';
        span.innerHTML = li.innerHTML;
        return span;
      });

      // Duplicate items for seamless loop
      [...buildItems(), ...buildItems()].forEach((s) => track.appendChild(s));
      ticker.appendChild(track);
    }
  }

  // ── Build hero content ────────────────────────────────────
  const hero = document.createElement('div');
  hero.className = 'hdbfs-hero__banner';

  // Background image
  const bgImg = getPicture(bgImageCell);
  if (bgImg) {
    bgImg.className = 'hdbfs-hero__bg';
    if (bgImg.tagName === 'IMG') {
      bgImg.alt = bgImg.alt || 'Hero background';
      bgImg.loading = 'eager';
    }
    hero.appendChild(bgImg);
  }

  // Overlay
  const overlay = document.createElement('div');
  overlay.className = 'hdbfs-hero__overlay';

  const content = document.createElement('div');
  content.className = 'hdbfs-hero__content';

  // Heading
  if (headingCell) {
    let heading = headingCell.querySelector('h1,h2,h3,h4,h5,h6');
    if (!heading) {
      heading = document.createElement('h1');
      heading.innerHTML = headingCell.innerHTML;
    }
    heading.className = 'hdbfs-hero__heading';
    content.appendChild(heading);
  }

  // Tag pills (badge keywords like "Fast | Secure | Hassle-Free")
  if (tagsCell) {
    const text = getText(tagsCell);
    if (text) {
      const tags = text.split(/\||,/).map((t) => t.trim()).filter(Boolean);
      if (tags.length > 1) {
        const pillsWrap = document.createElement('div');
        pillsWrap.className = 'hdbfs-hero__pills';
        tags.forEach((tag) => {
          const pill = document.createElement('span');
          pill.className = 'hdbfs-hero__pill';
          pill.textContent = tag;
          pillsWrap.appendChild(pill);
        });
        content.appendChild(pillsWrap);
      } else {
        const sub = document.createElement('p');
        sub.className = 'hdbfs-hero__sub';
        sub.textContent = text;
        content.appendChild(sub);
      }
    }
  }

  // CTA
  if (ctaCell) {
    let cta = ctaCell.querySelector('a');
    if (!cta) {
      cta = document.createElement('a');
      cta.href = '#';
      cta.textContent = getText(ctaLabelCell) || getText(ctaCell) || 'Apply Now';
    } else {
      const label = getText(ctaLabelCell);
      if (label) cta.textContent = label;
    }
    cta.className = 'hdbfs-hero__cta';
    content.appendChild(cta);
  }

  overlay.appendChild(content);
  hero.appendChild(overlay);

  // ── Replace block ─────────────────────────────────────────
  block.innerHTML = '';
  block.appendChild(ticker);
  block.appendChild(hero);

  // Reset wrapper margins
  ['hdbfs-hero-wrapper', 'hdbfs-hero-container'].forEach((cls) => {
    const el = block.closest(`.${cls}`);
    if (el) el.style.cssText = 'margin:0;padding:0;max-width:none;';
  });
  const section = block.closest('main > div');
  if (section) section.style.cssText = 'margin:0;padding:0;max-width:none;';
}
