const buildPicture = (cell) => {
  if (!cell) {
    return null;
  }

  const picture = cell.querySelector('picture');
  if (picture) {
    return picture;
  }

  const image = cell.querySelector('img');
  if (!image) {
    return null;
  }

  const wrapper = document.createElement('picture');
  wrapper.append(image);
  return wrapper;
};

const ensureHeading = (cell) => {
  if (!cell) {
    return null;
  }

  const existingHeading = cell.querySelector('h1, h2, h3, h4, h5, h6');
  if (existingHeading) {
    existingHeading.classList.add('hero-pwm__title');
    return existingHeading;
  }

  const heading = document.createElement('h1');
  heading.classList.add('hero-pwm__title');
  heading.innerHTML = cell.innerHTML;
  return heading;
};

const ensureButton = (cell) => {
  if (!cell) {
    return null;
  }

  const link = cell.querySelector('a');
  if (!link) {
    return null;
  }

  link.classList.add('button', 'hero-pwm__cta');
  return link;
};

const isImageOnlyCell = (cell) => !!cell?.querySelector('picture, img');

export default function decorate(block) {
  const rows = [...block.children].map((row) => [...row.children]);

  const backgroundCell = rows.shift()?.[0];
  const backgroundPicture = buildPicture(backgroundCell);

  if (!backgroundPicture) {
    return;
  }

  const emblemCell = rows.length && isImageOnlyCell(rows[0][0]) ? rows.shift()[0] : null;
  const headingCell = rows.shift()?.[0];
  const ctaCell = rows.shift()?.[0];

  block.textContent = '';

  const media = document.createElement('div');
  media.className = 'hero-pwm__media';
  media.append(backgroundPicture);

  const heroImg = media.querySelector('img');
  if (heroImg) {
    heroImg.loading = 'eager';
    heroImg.decoding = 'async';
    heroImg.fetchPriority = 'high';
  }

  const content = document.createElement('div');
  content.className = 'hero-pwm__content';

  if (emblemCell) {
    const emblemPicture = buildPicture(emblemCell);
    if (emblemPicture) {
      const emblem = document.createElement('div');
      emblem.className = 'hero-pwm__emblem';
      emblem.append(emblemPicture);
      content.append(emblem);
    }
  }

  const heading = ensureHeading(headingCell);
  if (heading) {
    content.append(heading);
  }

  const cta = ensureButton(ctaCell);
  if (cta) {
    content.append(cta);
  }

  block.append(media, content);
}
