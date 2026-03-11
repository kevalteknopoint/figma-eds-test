/**
 * WHO WE ARE block — AEM EDS decorator
 *
 * Authored table structure (Word / SharePoint):
 * ┌──────────────────────────────────────────────────────────┐
 * │ Who We Are                                               │
 * ├──────────────────────────┬───────────────────────────────┤
 * │ Eyebrow text             │ (leave blank)                 │
 * │ Heading text             │ (leave blank)                 │
 * ├──────────────────────────┬───────────────────────────────┤
 * │ Stat value               │ Stat label                    │
 * │ (e.g. ₹60,000 Cr+)       │ (e.g. Market Capitalization)  │
 * ├──────────────────────────┬───────────────────────────────┤
 * │ Stat value               │ Stat label                    │
 * │ …                        │ …                             │
 * └──────────────────────────┴───────────────────────────────┘
 *
 * Rules:
 * - Row 1 (col 0): eyebrow text
 * - Row 2 (col 0): heading text
 * - Rows 3+ (col 0): stat value  |  (col 1): stat label
 *
 * Optional: rows may be omitted — block fails gracefully.
 *
 * Reusability note:
 * getCell() and buildStatItem() are generic enough to be extracted
 * into a shared EDS utility if other blocks need the same pattern.
 */

/** @param {HTMLTableCellElement|null} cell */
const getCellText = (cell) => (cell ? cell.textContent.trim() : '');

/**
 * Build a <li class="who-we-are__stat"> element.
 * @param {string} value  - e.g. "₹60,000 Cr+"
 * @param {string} label  - e.g. "Market Capitalization"
 * @returns {HTMLLIElement}
 */
const buildStatItem = (value, label) => {
  const li = document.createElement('li');
  li.className = 'who-we-are__stat';

  const v = document.createElement('p');
  v.className = 'who-we-are__stat-value';
  v.textContent = value;
  v.setAttribute('aria-label', `${value} — ${label}`);

  const l = document.createElement('p');
  l.className = 'who-we-are__stat-label';
  l.textContent = label;
  l.setAttribute('aria-hidden', 'true'); // label already embedded in aria-label above

  li.append(v, l);
  return li;
};

/**
 * Main block decorator.
 * @param {HTMLElement} block
 */
export default function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];

  // ── Authored rows → data extraction ────────────────────────────
  const getRow = (index) => rows[index]?.querySelectorAll(':scope > div') ?? [];

  const eyebrowCells = getRow(0);
  const headingCells = getRow(1);

  const eyebrow = getCellText(eyebrowCells[0]) || 'Who we are';
  const heading = getCellText(headingCells[0]) || '';

  // Stat rows start at row index 2
  const statRows = rows.slice(2);

  // ── Build semantic DOM ──────────────────────────────────────────
  const inner = document.createElement('div');
  inner.className = 'who-we-are__inner';

  // Intro panel
  const intro = document.createElement('div');
  intro.className = 'who-we-are__intro';

  const eyebrowEl = document.createElement('p');
  eyebrowEl.className = 'who-we-are__eyebrow';
  eyebrowEl.textContent = eyebrow;

  if (heading) {
    const headingEl = document.createElement('h2');
    headingEl.className = 'who-we-are__headline';
    headingEl.textContent = heading;
    intro.append(eyebrowEl, headingEl);
  } else {
    intro.append(eyebrowEl);
  }

  // Stats list
  const statsList = document.createElement('ul');
  statsList.className = 'who-we-are__stats';
  statsList.setAttribute('aria-label', 'Key statistics');

  statRows.forEach((row) => {
    const cells = row.querySelectorAll(':scope > div');
    const value = getCellText(cells[0]);
    const label = getCellText(cells[1]);
    if (value && label) {
      statsList.append(buildStatItem(value, label));
    }
  });

  inner.append(intro, statsList);

  // ── Replace authored content with decorated DOM ─────────────────
  block.innerHTML = '';
  block.append(inner);
}
