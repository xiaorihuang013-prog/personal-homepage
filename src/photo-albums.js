import { t } from './language.js';

export function createPhotoAlbums(albums) {
  const root = document.createElement('div');
  root.className = 'photo-albums';
  const toolbar = document.createElement('div');
  toolbar.className = 'album-toolbar';
  const back = document.createElement('button');
  back.type = 'button';
  back.textContent = t('← 全部照片集', '← All albums');
  back.hidden = true;
  const hint = document.createElement('span');
  toolbar.append(back, hint);
  const viewport = document.createElement('div');
  viewport.className = 'album-viewport';
  const stage = document.createElement('div');
  stage.className = 'album-stage';
  viewport.append(stage);
  root.append(toolbar, viewport);
  let selected = -1;
  const groups = albums.map((album, a) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'album-label';
    button.textContent = t(album.name, album.nameEn);
    button.setAttribute('aria-expanded', 'false');
    const photos = album.photos.map((file, i) => {
      const img = document.createElement('img');
      img.src = `${import.meta.env.BASE_URL}photos/${file}.jpg`;
      img.alt = `${t(album.name, album.nameEn)} ${i + 1}`;
      img.draggable = false;
      img.decoding = 'async';
      img.className = 'album-photo';
      img.style.zIndex = String(10 + album.photos.length - i);
      img.addEventListener('load', layout);
      img.addEventListener('click', () => { if (selected === -1) select(a); });
      stage.append(img);
      return img;
    });
    button.addEventListener('click', () => select(a));
    stage.append(button);
    return { button, photos };
  });
  function select(index) {
    selected = index;
    viewport.scrollLeft = 0;
    back.hidden = index === -1;
    root.classList.toggle('is-expanded', index !== -1);
    layout();
    if (index !== -1) viewport.focus({ preventScroll: true });
    else groups[lastAlbum].button.focus({ preventScroll: true });
  }
  let lastAlbum = 0;
  back.addEventListener('click', () => { lastAlbum = selected; select(-1); });
  function layout() {
    const width = viewport.clientWidth;
    if (!width) return;
    const expanded = selected !== -1;
    const mobile = width < 540;
    const height = expanded ? Math.min(410, innerHeight * .49) : mobile ? 180 : 250;
    const cell = width / 3;
    const coverWidth = Math.min(mobile ? cell - 22 : cell - 58, 166);
    let rowX = 12;
    stage.style.height = `${height + (expanded ? 28 : 55)}px`;
    hint.textContent = expanded ? t('按住照片左右拖动', 'Drag to explore') : t('点击打开照片集', 'Choose an album');
    groups.forEach(({ button, photos }, a) => {
      const visible = !expanded || selected === a;
      button.style.opacity = expanded ? '0' : '1';
      button.style.pointerEvents = expanded ? 'none' : '';
      button.tabIndex = expanded ? -1 : 0;
      button.setAttribute('aria-hidden', String(expanded));
      button.setAttribute('aria-expanded', String(selected === a));
      button.style.transform = `translate(${a * cell}px, ${height + 14}px)`;
      button.style.width = `${cell}px`;
      photos.forEach((img, i) => {
        const ratio = img.naturalWidth && img.naturalHeight ? img.naturalWidth / img.naturalHeight : 2/3;
        // Covers share a 3:4 crop; open photos share a longest edge.
        const photoHeight = expanded ? height / Math.max(1, ratio) : Math.min(height - 30, coverWidth / .75);
        const photoWidth = photoHeight * (expanded ? ratio : .75);
        const x = expanded && selected === a ? rowX : a * cell + (cell-photoWidth)/2 + i*4;
        const y = expanded ? 8 + (height-photoHeight)/2 : (height-photoHeight)/2 - i*5;
        img.style.width = `${photoWidth}px`;
        img.style.height = `${photoHeight}px`;
        img.style.transform = `translate(${x}px, ${y}px) rotate(${expanded ? 0 : i * 1.8 - 2}deg)`;
        img.style.opacity = visible ? '1' : '0';
        img.style.pointerEvents = visible ? '' : 'none';
        img.setAttribute('aria-hidden', String(!visible));
        if (expanded && selected === a) rowX += photoWidth + 20;
      });
    });
    stage.style.width = `${expanded ? Math.max(width, rowX) : width}px`;
  }
  // Pointer capture keeps dragging continuous even outside the photo strip.
  let drag = null;
  viewport.addEventListener('pointerdown', e => {
    if (selected < 0 || e.button !== 0 || e.pointerType === 'touch') return;
    drag = { x: e.clientX, scroll: viewport.scrollLeft };
    viewport.focus({ preventScroll: true });
    viewport.setPointerCapture(e.pointerId);
    viewport.classList.add('is-dragging');
    e.preventDefault();
  });
  viewport.addEventListener('pointermove', e => {
    if (drag) viewport.scrollLeft = drag.scroll + drag.x - e.clientX;
  });
  const endDrag = () => { drag = null; viewport.classList.remove('is-dragging'); };
  viewport.addEventListener('pointerup', endDrag);
  viewport.addEventListener('pointercancel', endDrag);
  viewport.addEventListener('lostpointercapture', endDrag);
  viewport.addEventListener('mousedown', e => {
    if (selected < 0 || e.button !== 0 || drag) return;
    drag = { x: e.clientX, scroll: viewport.scrollLeft };
    viewport.focus({ preventScroll: true });
    viewport.classList.add('is-dragging');
    e.preventDefault();
  });
  const mouseMove = e => { if (drag) viewport.scrollLeft = drag.scroll + drag.x - e.clientX; };
  window.addEventListener('mousemove', mouseMove);
  window.addEventListener('mouseup', endDrag);
  viewport.tabIndex = 0;
  viewport.setAttribute('aria-label', t('照片集，使用左右方向键浏览', 'Photo albums. Use arrow keys to browse.'));
  viewport.addEventListener('keydown', e => {
    if (selected >= 0 && ['ArrowLeft','ArrowRight'].includes(e.key)) {
      e.preventDefault();
      viewport.scrollBy({ left: e.key === 'ArrowRight' ? 300 : -300, behavior: 'smooth' });
    }
  });
  const observer = new ResizeObserver(layout);
  observer.observe(viewport);
  root.dispose = () => {
    observer.disconnect();
    window.removeEventListener('mousemove', mouseMove);
    window.removeEventListener('mouseup', endDrag);
  };
  return root;
}
