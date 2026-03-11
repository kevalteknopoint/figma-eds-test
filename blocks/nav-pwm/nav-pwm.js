/**
 * nav-pwm block
 * Renders the PWM branded navigation bar from authored content.
 *
 * Authored row structure (EDS DOM):
 *   Row 1 – Logo image  (reference field)
 *   Row 2 – Nav links   (richtext → <ul><li> list of links)
 *   Row 3 – Login link  (aem-content / plain-text URL, with separate label row)
 *   Row 4 – Login label (text – collapsedFieldOf loginLink)
 *
 * Content-type detection is used instead of fixed indices so that empty
 * alt-text / collapsed fields that produce no DOM row don't break the layout.
 */

/** Returns true if the cell contains a picture/img (logo) */
function isImageCell(cell) {
  return !!(cell && cell.querySelector('picture, img'));
}

/** Returns true if the cell contains a list (nav links) */
function isListCell(cell) {
  return !!(cell && cell.querySelector('ul, ol'));
}

/**
 * Returns the raw text of a cell trimmed of whitespace.
 * Useful for plain-text link cells authored as URL strings.
 */
function getCellText(cell) {
  return cell ? cell.textContent.trim() : '';
}

/** Returns the <a> from a cell, or creates one from plain-text URL */
function extractOrBuildLink(cell, labelText) {
  if (!cell) return null;
  const anchor = cell.querySelector('a');
  if (anchor) {
    if (labelText) anchor.textContent = labelText;
    return anchor;
  }
  const raw = getCellText(cell);
  if (raw) {
    const a = document.createElement('a');
    a.href = raw.startsWith('http') ? raw : `https://${raw}`;
    a.textContent = labelText || 'Login';
    return a;
  }
  return null;
}

/**
 * Resets the bare outer div wrapper that EDS adds around every block,
 * which normally inherits `main > div { margin: 40px 16px }`.
 */
function stripWrapperConstraints(block) {
  const wrapper = block.closest('.nav-pwm-wrapper');
  if (wrapper) {
    wrapper.style.cssText = 'margin:0;padding:0;max-width:none;';
  }
  const container = block.closest('.nav-pwm-container');
  if (container) {
    container.style.cssText = 'margin:0;padding:0;max-width:none;';
  }
  // The bare outer div (no class) that carries margin: 40px 16px
  const section = block.closest('main > div');
  if (section) {
    section.style.cssText = 'margin:0;padding:0;max-width:none;';
  }
}

/**
 * Builds the hamburger menu button (mobile only).
 */
function buildHamburger() {
  const btn = document.createElement('button');
  btn.className = 'nav-pwm__hamburger';
  btn.setAttribute('aria-label', 'Open navigation');
  btn.setAttribute('aria-expanded', 'false');
  btn.innerHTML = `
    <span class="nav-pwm__hamburger-line"></span>
    <span class="nav-pwm__hamburger-line"></span>
    <span class="nav-pwm__hamburger-line"></span>
  `;
  return btn;
}

/**
 * Builds the search button icon.
 */
function buildSearchBtn() {
  const btn = document.createElement('button');
  btn.className = 'nav-pwm__search-btn';
  btn.setAttribute('aria-label', 'Search');
  btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`;
  return btn;
}

/**
 * Wires up mobile menu toggle logic.
 */
function wireMenuToggle(hamburger, drawer) {
  hamburger.addEventListener('click', () => {
    const expanded = hamburger.getAttribute('aria-expanded') === 'true';
    hamburger.setAttribute('aria-expanded', expanded ? 'false' : 'true');
    hamburger.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
    drawer.classList.toggle('nav-pwm__drawer--open', !expanded);
    document.body.style.overflowY = expanded ? '' : 'hidden';
  });
}

/**
 * Main EDS block decorator.
 * @param {HTMLElement} block
 */
export default function decorate(block) {
  // --- 1. Collect all cell <div>s from EDS rows ---------------------
  const rows = [...block.querySelectorAll(':scope > div > div')];

  let logoCell = null;
  let linksCell = null;
  let loginLinkCell = null;
  let loginLabelCell = null;

  rows.forEach((cell) => {
    if (!logoCell && isImageCell(cell)) {
      logoCell = cell;
    } else if (!linksCell && isListCell(cell)) {
      linksCell = cell;
    } else if (!loginLinkCell) {
      // First non-image / non-list cell → login link or label
      const raw = getCellText(cell);
      const hasAnchor = !!cell.querySelector('a');
      if (hasAnchor || (raw && (raw.includes('http') || raw.includes('.')))) {
        loginLinkCell = cell;
      } else if (loginLinkCell && !loginLabelCell) {
        loginLabelCell = cell;
      } else {
        // Treat as label if loginLinkCell already set
        if (loginLinkCell) {
          loginLabelCell = cell;
        } else {
          loginLinkCell = cell;
        }
      }
    } else if (loginLinkCell && !loginLabelCell) {
      loginLabelCell = cell;
    }
  });

  // --- 2. Build logo -------------------------------------------------
  const logoEl = document.createElement('div');
  logoEl.className = 'nav-pwm__logo';
  if (logoCell) {
    const pic = logoCell.querySelector('picture') || logoCell.querySelector('img');
    if (pic) {
      const img = pic.nodeName === 'IMG' ? pic : pic.querySelector('img');
      if (img) img.alt = img.alt || 'Motilal Oswal Private Wealth';
      logoEl.appendChild(pic.nodeName === 'PICTURE' ? pic : img);
    }
  }

  // Wrap logo in an anchor to home page
  const logoLink = document.createElement('a');
  logoLink.href = '/';
  logoLink.setAttribute('aria-label', 'Home');
  logoLink.appendChild(logoEl);

  // --- 3. Build nav links (desktop list) ----------------------------
  const navLinks = document.createElement('nav');
  navLinks.className = 'nav-pwm__links';
  navLinks.setAttribute('aria-label', 'Primary navigation');

  if (linksCell) {
    const ul = linksCell.querySelector('ul') || linksCell.querySelector('ol');
    if (ul) {
      ul.className = 'nav-pwm__list';
      // Mark list items that have sub-menus (authored as nested lists or contain links with children)
      ul.querySelectorAll(':scope > li').forEach((li) => {
        li.className = 'nav-pwm__item';
        const subList = li.querySelector('ul, ol');
        if (subList) {
          li.classList.add('nav-pwm__item--has-dropdown');
          li.setAttribute('aria-expanded', 'false');
          subList.className = 'nav-pwm__dropdown';

          const toggle = document.createElement('button');
          toggle.className = 'nav-pwm__item-toggle';
          toggle.setAttribute('aria-expanded', 'false');
          toggle.innerHTML = `<svg class="nav-pwm__chevron" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>`;

          const firstChild = li.firstChild;
          li.insertBefore(toggle, firstChild);

          toggle.addEventListener('click', () => {
            const open = toggle.getAttribute('aria-expanded') === 'true';
            toggle.setAttribute('aria-expanded', open ? 'false' : 'true');
            li.setAttribute('aria-expanded', open ? 'false' : 'true');
          });
        }
      });
      navLinks.appendChild(ul);
    }
  }

  // --- 4. Build Login button ----------------------------------------
  const loginLabel = loginLabelCell ? getCellText(loginLabelCell) : 'Login';
  const loginAnchor = extractOrBuildLink(loginLinkCell, loginLabel);

  const loginBtn = document.createElement('div');
  loginBtn.className = 'nav-pwm__login';
  if (loginAnchor) {
    loginAnchor.className = 'nav-pwm__login-btn';
    // Add the chevron icon inside login button (matches Figma)
    const chevronSvg = document.createElement('span');
    chevronSvg.className = 'nav-pwm__login-chevron';
    chevronSvg.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>`;
    loginAnchor.appendChild(chevronSvg);
    loginBtn.appendChild(loginAnchor);
  }

  // --- 5. Build mobile drawer ---------------------------------------
  const drawer = document.createElement('div');
  drawer.className = 'nav-pwm__drawer';
  drawer.setAttribute('aria-hidden', 'true');
  // Clone nav links for mobile drawer
  const mobileList = navLinks.cloneNode(true);
  mobileList.classList.add('nav-pwm__links--mobile');
  drawer.appendChild(mobileList);
  // Add mobile login button in drawer
  if (loginAnchor) {
    const mobileLoginBtn = loginAnchor.cloneNode(true);
    mobileLoginBtn.className = 'nav-pwm__login-btn nav-pwm__login-btn--mobile';
    drawer.appendChild(mobileLoginBtn);
  }

  // --- 6. Build right-hand side (desktop: nav + search + login) -----
  const rhs = document.createElement('div');
  rhs.className = 'nav-pwm__rhs';
  rhs.appendChild(navLinks);
  rhs.appendChild(buildSearchBtn());
  rhs.appendChild(loginBtn);

  // --- 7. Build RHS icons (mobile: login + search + hamburger) ------
  const mobileIcons = document.createElement('div');
  mobileIcons.className = 'nav-pwm__mobile-icons';
  const mobilLoginClone = loginBtn.cloneNode(true);
  mobilLoginClone.className = 'nav-pwm__login nav-pwm__login--mobile';
  mobileIcons.appendChild(mobilLoginClone);
  mobileIcons.appendChild(buildSearchBtn());
  const hamburger = buildHamburger();
  mobileIcons.appendChild(hamburger);

  // --- 8. Assemble nav bar ------------------------------------------
  const inner = document.createElement('div');
  inner.className = 'nav-pwm__inner';
  inner.appendChild(logoLink);
  inner.appendChild(rhs);
  inner.appendChild(mobileIcons);

  // Clear block and inject
  block.innerHTML = '';
  block.appendChild(inner);
  block.appendChild(drawer);

  // --- 9. Wire hamburger toggle -------------------------------------
  wireMenuToggle(hamburger, drawer);

  // Sync drawer aria-hidden with open state
  hamburger.addEventListener('click', () => {
    const open = hamburger.getAttribute('aria-expanded') === 'true';
    drawer.setAttribute('aria-hidden', open ? 'false' : 'true');
  });

  // --- 10. Reset wrapper/section margins ----------------------------
  stripWrapperConstraints(block);
}
