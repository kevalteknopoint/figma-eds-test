/**
 * hdbfs-nav block — AEM EDS decorator
 *
 * Authored table structure (Word / SharePoint):
 *
 * ┌────────────────────────────────────────────────────────────┐
 * │ hdbfs-nav                                                  │
 * ├───────────────────┬────────────────────────────────────────┤
 * │ Logo image        │ (blank)                                │
 * ├───────────────────┼────────────────────────────────────────┤
 * │ Nav links list    │ (blank)                                │
 * ├───────────────────┼────────────────────────────────────────┤
 * │ CTA links list    │ (blank)  e.g. My Account | Make Payment│
 * └───────────────────┴────────────────────────────────────────┘
 *
 * Nav links are a bulleted list with optional sub-lists for dropdowns.
 * CTA links are a bulleted list of action links shown on the right.
 */

export default function decorate(block) {
  const rows = [...block.children];

  // ── Extract authored content ──────────────────────────────
  let logoCell = null;
  let navLinksCell = null;
  let ctaLinksCell = null;

  rows.forEach((row) => {
    const [col0] = [...row.children];
    if (!logoCell && col0.querySelector('picture, img')) {
      logoCell = col0;
    } else if (!navLinksCell && col0.querySelector('ul, ol')) {
      navLinksCell = col0;
    } else if (!ctaLinksCell && col0.querySelector('ul, ol')) {
      ctaLinksCell = col0;
    }
  });

  // ── Build nav ─────────────────────────────────────────────
  const nav = document.createElement('nav');
  nav.className = 'hdbfs-nav__inner';
  nav.setAttribute('aria-label', 'Main navigation');

  // Logo
  const logoWrap = document.createElement('a');
  logoWrap.href = '/';
  logoWrap.className = 'hdbfs-nav__logo';
  logoWrap.setAttribute('aria-label', 'HDB Financial Services – Home');
  if (logoCell) {
    const img = logoCell.querySelector('picture, img');
    if (img) logoWrap.appendChild(img.cloneNode(true));
  } else {
    const fallback = document.createElement('span');
    fallback.className = 'hdbfs-nav__logo-text';
    fallback.textContent = 'HDB Financial Services';
    logoWrap.appendChild(fallback);
  }

  // Desktop nav links
  const linksWrap = document.createElement('ul');
  linksWrap.className = 'hdbfs-nav__links';
  if (navLinksCell) {
    const sourceList = navLinksCell.querySelector('ul, ol');
    if (sourceList) {
      [...sourceList.children].forEach((li) => {
        const newLi = document.createElement('li');
        newLi.className = 'hdbfs-nav__item';
        const subList = li.querySelector('ul, ol');
        if (subList) {
          newLi.classList.add('hdbfs-nav__item--has-dropdown');
          const link = li.firstElementChild && li.firstElementChild.tagName !== 'UL' && li.firstElementChild.tagName !== 'OL'
            ? li.firstElementChild.cloneNode(true)
            : (() => { const a = document.createElement('a'); a.href = '#'; a.textContent = li.textContent.replace(subList.textContent, '').trim(); return a; })();
          link.className = 'hdbfs-nav__link';
          const chevron = document.createElement('span');
          chevron.className = 'hdbfs-nav__chevron';
          chevron.setAttribute('aria-hidden', 'true');
          const dropdown = document.createElement('ul');
          dropdown.className = 'hdbfs-nav__dropdown';
          [...subList.children].forEach((subLi) => {
            const dLi = document.createElement('li');
            const subA = subLi.querySelector('a') || (() => { const a = document.createElement('a'); a.href = '#'; a.textContent = subLi.textContent.trim(); return a; })();
            subA.className = 'hdbfs-nav__dropdown-link';
            dLi.appendChild(subA);
            dropdown.appendChild(dLi);
          });
          newLi.appendChild(link);
          newLi.appendChild(chevron);
          newLi.appendChild(dropdown);
        } else {
          const a = li.querySelector('a') || (() => { const el = document.createElement('a'); el.href = '#'; el.textContent = li.textContent.trim(); return el; })();
          a.className = 'hdbfs-nav__link';
          newLi.appendChild(a);
        }
        linksWrap.appendChild(newLi);
      });
    }
  }

  // CTA action buttons (right side)
  const ctaWrap = document.createElement('div');
  ctaWrap.className = 'hdbfs-nav__cta-group';
  if (ctaLinksCell) {
    const ctaList = ctaLinksCell.querySelector('ul, ol');
    if (ctaList) {
      [...ctaList.children].forEach((li, i) => {
        const a = li.querySelector('a') || (() => { const el = document.createElement('a'); el.href = '#'; el.textContent = li.textContent.trim(); return el; })();
        a.className = i === 0 ? 'hdbfs-nav__cta hdbfs-nav__cta--primary' : 'hdbfs-nav__cta';
        ctaWrap.appendChild(a);
      });
    }
  } else {
    // Fallback default CTAs
    [
      { text: 'My Account', href: 'https://onthego.hdbfs.com/', primary: false },
      { text: 'Make Payment', href: 'https://www.hdbfs.com/customer-services/make-payment', primary: true },
    ].forEach(({ text, href, primary }) => {
      const a = document.createElement('a');
      a.href = href;
      a.textContent = text;
      a.className = primary ? 'hdbfs-nav__cta hdbfs-nav__cta--primary' : 'hdbfs-nav__cta';
      ctaWrap.appendChild(a);
    });
  }

  // Hamburger (mobile)
  const hamburger = document.createElement('button');
  hamburger.className = 'hdbfs-nav__hamburger';
  hamburger.setAttribute('aria-label', 'Toggle navigation');
  hamburger.setAttribute('aria-expanded', 'false');
  hamburger.innerHTML = '<span></span><span></span><span></span>';

  // Mobile drawer
  const drawer = document.createElement('div');
  drawer.className = 'hdbfs-nav__drawer';
  drawer.setAttribute('aria-hidden', 'true');
  const drawerLinks = linksWrap.cloneNode(true);
  drawerLinks.className = 'hdbfs-nav__drawer-links';
  drawer.appendChild(drawerLinks);

  // Assemble
  nav.appendChild(logoWrap);
  nav.appendChild(linksWrap);
  nav.appendChild(ctaWrap);
  nav.appendChild(hamburger);

  block.innerHTML = '';
  block.appendChild(nav);
  block.appendChild(drawer);

  // ── Interactions ──────────────────────────────────────────
  hamburger.addEventListener('click', () => {
    const expanded = hamburger.getAttribute('aria-expanded') === 'true';
    hamburger.setAttribute('aria-expanded', String(!expanded));
    hamburger.classList.toggle('is-open', !expanded);
    drawer.setAttribute('aria-hidden', String(expanded));
    drawer.classList.toggle('is-open', !expanded);
  });

  // Dropdown toggles on hover (desktop) and click (mobile)
  block.querySelectorAll('.hdbfs-nav__item--has-dropdown').forEach((item) => {
    item.addEventListener('mouseenter', () => item.classList.add('is-open'));
    item.addEventListener('mouseleave', () => item.classList.remove('is-open'));
    item.querySelector('.hdbfs-nav__link')?.addEventListener('click', (e) => {
      if (window.innerWidth < 900) {
        e.preventDefault();
        item.classList.toggle('is-open');
      }
    });
  });

  // Reset wrapper margins
  const wrapper = block.closest('.hdbfs-nav-wrapper, .hdbfs-nav-container');
  if (wrapper) wrapper.style.cssText = 'margin:0;padding:0;max-width:none;';
  const section = block.closest('main > div');
  if (section) section.style.cssText = 'margin:0;padding:0;max-width:none;';
}
