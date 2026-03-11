/**
 * MOFSL GROUP block — AEM EDS decorator
 *
 * ──────────────────────────────────────────────────────────────────
 * Authored table structure:
 *
 * Row 0  | Section heading text (with "MOFSL group" emphasis)
 *        | (leave blank)
 * ──────────────────────────────────────────────────────────────────
 * Row 1  | Primary entity name      | Primary stat value
 *        | (e.g. Private Wealth…)   | (e.g. ₹ 1.9 Lakh Cr)
 * ──────────────────────────────────────────────────────────────────
 * Row 2  | Primary description      | Stat label
 *        | (e.g. 380+ trusted…)     | (e.g. AUM)
 * ──────────────────────────────────────────────────────────────────
 * Row 3+ | sub:Name                 | sub:Description
 *        | sub:Stat Value           | sub:Stat Label
 * …
 * ──────────────────────────────────────────────────────────────────
 * Subsidiary rows come in pairs:
 *   Odd  row (0-indexed from row 3): name col 0 | description col 1
 *   Even row                       : value col 0 | label col 1
 *
 * Optional: decorative image — if last row col 0 contains a picture,
 *           it is treated as the watermark image, not a subsidiary.
 *
 * Example:
 * ┌─────────────────────────────────────┬───────────────────┐
 * │ A part of the [MOFSL group]         │                   │
 * ├─────────────────────────────────────┼───────────────────┤
 * │ Private Wealth Management           │ ₹ 1.9 Lakh Cr     │
 * ├─────────────────────────────────────┼───────────────────┤
 * │ 380+ trusted Wealth Managers…       │ AUM               │
 * ├─────────────────────────────────────┼───────────────────┤
 * │ Wealth Management                   │ 2,500+ locations… │
 * ├─────────────────────────────────────┼───────────────────┤
 * │ ₹ 3.1 Lakh Cr                       │ AUM               │
 * └─────────────────────────────────────┴───────────────────┘
 */

/** @param {HTMLElement|null} el */
const getText = (el) => (el ? el.textContent.trim() : '');

/**
 * Parse inline [text] markers to wrap in <em>.
 * Supports pattern "A part of the [MOFSL group]".
 * @param {string} text
 * @returns {DocumentFragment}
 */
const parseEmphasisMarkers = (text) => {
  const frag = document.createDocumentFragment();
  const parts = text.split(/\[([^\]]+)\]/);
  parts.forEach((part, i) => {
    if (i % 2 === 0) {
      if (part) frag.appendChild(document.createTextNode(part));
    } else {
      const em = document.createElement('em');
      em.textContent = part;
      frag.appendChild(em);
    }
  });
  return frag;
};

/**
 * Build a single subsidiary <li>.
 * @param {{name:string, nameHref:string|null, desc:string, value:string, label:string}} sub
 */
const buildSubItem = ({ name, nameHref, desc, value, label }) => {
  const li = document.createElement('li');
  li.className = 'mofsl-group__sub';

  const header = document.createElement('div');
  header.className = 'mofsl-group__sub-header';

  const nameEl = document.createElement('p');
  nameEl.className = 'mofsl-group__sub-name';
  if (nameHref) {
    const a = document.createElement('a');
    a.href = nameHref;
    a.textContent = name;
    nameEl.append(a);
  } else {
    nameEl.textContent = name;
  }

  const descEl = document.createElement('p');
  descEl.className = 'mofsl-group__sub-desc';
  descEl.textContent = desc;

  header.append(nameEl, descEl);

  const metric = document.createElement('div');
  metric.className = 'mofsl-group__sub-metric';

  const valEl = document.createElement('p');
  valEl.className = 'mofsl-group__sub-value';
  valEl.textContent = value;

  const labelEl = document.createElement('p');
  labelEl.className = 'mofsl-group__sub-label';
  labelEl.textContent = label;

  metric.append(valEl, labelEl);
  li.append(header, metric);
  return li;
};

/**
 * @param {HTMLElement} block
 */
export default function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];
  const getRow = (i) => rows[i]?.querySelectorAll(':scope > div') ?? [];

  // Row 0: section heading
  const headingCells = getRow(0);
  const rawHeading = getText(headingCells[0]) || 'A part of the [MOFSL group]';

  // Row 1: primary title | primary stat value
  const primaryCells = getRow(1);
  const primaryTitle = getText(primaryCells[0]);
  const primaryValue = getText(primaryCells[1]);

  // Row 2: primary description | stat label
  const primaryDescCells = getRow(2);
  const primaryDesc = getText(primaryDescCells[0]);
  const primaryLabel = getText(primaryDescCells[1]);

  // Rows 3+ — subsidiaries come in pairs (name+desc, then value+label)
  // Check if last row is a decorative image
  const subRowsRaw = rows.slice(3);
  let decoImg = null;
  const lastRow = subRowsRaw[subRowsRaw.length - 1];
  if (lastRow?.querySelector('picture, img')) {
    decoImg = lastRow.querySelector('picture') || lastRow.querySelector('img');
    subRowsRaw.pop();
  }

  const subsidiaries = [];
  for (let i = 0; i < subRowsRaw.length; i += 2) {
    const nameCells = subRowsRaw[i]?.querySelectorAll(':scope > div') ?? [];
    const metricCells = subRowsRaw[i + 1]?.querySelectorAll(':scope > div') ?? [];

    const nameCell = nameCells[0];
    const link = nameCell?.querySelector('a');
    const name = getText(nameCell);
    const nameHref = link?.href ?? null;
    const desc = getText(nameCells[1]);
    const value = getText(metricCells[0]);
    const label = getText(metricCells[1]);

    if (name) {
      subsidiaries.push({ name, nameHref, desc, value, label });
    }
  }

  // ── Build DOM ──────────────────────────────────────────────────────

  // Section heading (outside the card)
  const sectionHeading = document.createElement('h2');
  sectionHeading.className = 'mofsl-group__section-heading';
  sectionHeading.append(parseEmphasisMarkers(rawHeading));

  // Gold card
  const card = document.createElement('div');
  card.className = 'mofsl-group__card';

  // Decorative watermark image
  if (decoImg) {
    const deco = document.createElement('div');
    deco.className = 'mofsl-group__card-deco';
    deco.setAttribute('aria-hidden', 'true');
    deco.append(decoImg);
    card.append(deco);
  }

  // Primary stat row
  const primary = document.createElement('div');
  primary.className = 'mofsl-group__primary';

  const primaryInfo = document.createElement('div');
  primaryInfo.className = 'mofsl-group__primary-info';

  if (primaryTitle) {
    const titleEl = document.createElement('p');
    titleEl.className = 'mofsl-group__primary-title';
    titleEl.textContent = primaryTitle;
    primaryInfo.append(titleEl);
  }
  if (primaryDesc) {
    const descEl = document.createElement('p');
    descEl.className = 'mofsl-group__primary-desc';
    descEl.textContent = primaryDesc;
    primaryInfo.append(descEl);
  }

  const primaryStat = document.createElement('div');
  primaryStat.className = 'mofsl-group__primary-stat';

  if (primaryValue) {
    const valEl = document.createElement('p');
    valEl.className = 'mofsl-group__primary-value';
    valEl.textContent = primaryValue;
    primaryStat.append(valEl);
  }
  if (primaryLabel) {
    const labelEl = document.createElement('p');
    labelEl.className = 'mofsl-group__primary-label';
    labelEl.textContent = primaryLabel;
    primaryStat.append(labelEl);
  }

  primary.append(primaryInfo, primaryStat);

  // Divider
  const divider = document.createElement('hr');
  divider.className = 'mofsl-group__divider';
  divider.setAttribute('aria-hidden', 'true');

  // Subsidiaries grid
  const subList = document.createElement('ul');
  subList.className = 'mofsl-group__subsidiaries';
  subList.setAttribute('aria-label', 'MOFSL group subsidiaries');

  subsidiaries.forEach((sub) => subList.append(buildSubItem(sub)));

  card.append(primary);
  if (subsidiaries.length) card.append(divider, subList);

  // ── Replace authored content ────────────────────────────────────
  block.innerHTML = '';
  block.append(sectionHeading, card);
}
