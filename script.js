/* ════════════════════════════════════════════════════════
   NASEEF P P — PORTFOLIO SCRIPT  v4
   ════════════════════════════════════════════════════════ */

/* ══ NAVBAR ══════════════════════════════════════════════ */
const nav = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

/* ══ MOBILE MENU ══════════════════════════════════════════ */
function toggleMenu() {
  document.getElementById('mobile-menu').classList.toggle('open');
  document.getElementById('hamburger').classList.toggle('active');
}

/* ══ HISTORY POLLUTION FIX ═══════════════════════════════
   Intercept all anchor nav clicks. Smooth-scroll without
   pushing a new history entry. Back button exits the site
   rather than cycling through sections.                  */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth' });
  });
});

/* ══ SCROLL REVEAL ════════════════════════════════════════ */
const revObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); revObs.unobserve(e.target); }
  });
}, { threshold: .1 });
document.querySelectorAll('.reveal').forEach(el => revObs.observe(el));

/* ══ COUNT-UP ════════════════════════════════════════════ */
const cntObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const t = parseInt(e.target.getAttribute('data-target'));
    let c = 0;
    const tmr = setInterval(() => {
      c += t / 40;
      if (c >= t) { c = t; clearInterval(tmr); }
      e.target.textContent = Math.floor(c) + '+';
    }, 35);
    cntObs.unobserve(e.target);
  });
}, { threshold: .5 });
document.querySelectorAll('.count-num').forEach(el => cntObs.observe(el));

/* ══ FILMOGRAPHY — TRACK PADDING + FEATHER SYNC ═════════
   CSS-based: reads container padding from computed style.
   No live DOM rect polling — works correctly on all hosts. */
function syncFilmPadding() {
  const container = document.querySelector('.container');
  if (!container) return;
  /* Get the left offset of the container relative to viewport */
  const leftPad = Math.max(Math.round(container.getBoundingClientRect().left), 16);
  const track = document.getElementById('filmTrack');
  if (track) {
    track.style.paddingLeft  = leftPad + 'px';
    track.style.paddingRight = leftPad + 'px';
  }
  document.querySelectorAll('.film-feather').forEach(f => {
    f.style.width = leftPad + 'px';
  });
}
syncFilmPadding();
window.addEventListener('resize', syncFilmPadding);

/* ══ YOUTUBE IFRAME API ══════════════════════════════════ */
let ytAPIReady = false, ytPlayer = null;
window.onYouTubeIframeAPIReady = function() { ytAPIReady = true; };

const langModal      = document.getElementById('lang-modal');
const langLabel      = document.getElementById('lang-modal-label');
const langModalClose = document.getElementById('lang-modal-close');

function openLangModal(videoId, label) {
  langModal.classList.add('open');
  document.body.style.overflow = 'hidden';
  langLabel.textContent = label;
  if (ytPlayer) { try { ytPlayer.destroy(); } catch(e){} ytPlayer = null; }
  document.getElementById('yt-player-container').innerHTML = '<div id="yt-player"></div>';
  if (ytAPIReady) {
    ytPlayer = new YT.Player('yt-player', {
      videoId, width: '100%', height: '100%',
      playerVars: { autoplay: 1, rel: 0, playsinline: 1, modestbranding: 1 },
      events: { onStateChange: ev => { if (ev.data === 0) closeLangModal(); } }
    });
  } else {
    document.getElementById('yt-player-container').innerHTML =
      '<iframe src="https://www.youtube.com/embed/' + videoId +
      '?autoplay=1&rel=0&playsinline=1" allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowfullscreen style="width:100%;height:100%;border:none;"></iframe>';
  }
}
function closeLangModal() {
  langModal.classList.remove('open');
  document.body.style.overflow = '';
  if (ytPlayer) { try { ytPlayer.stopVideo(); } catch(e){} }
  document.getElementById('yt-player-container').innerHTML = '<div id="yt-player"></div>';
}
document.querySelectorAll('.lang-badge').forEach(b => {
  b.addEventListener('click', () => openLangModal(b.getAttribute('data-videoid'), b.getAttribute('data-label')));
});
langModalClose.addEventListener('click', closeLangModal);
langModal.addEventListener('click', e => { if (e.target === langModal) closeLangModal(); });
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && langModal.classList.contains('open')) closeLangModal();
});

/* ══ FILMOGRAPHY — PURE CSS HOVER ON DESKTOP ════════════
   No last-active-stays. Simple mobile center detection.  */
const filmCards  = Array.from(document.querySelectorAll('.film-card'));
const filmScroll = document.getElementById('filmScroll');
const filmDots   = Array.from(document.querySelectorAll('.film-dot'));
let filmMouseDX  = 0, filmDragged = false, filmRAF = null;

/* Mobile dot highlight */
function setActiveDot(idx) {
  filmDots.forEach((d, i) => d.classList.toggle('active', i === idx));
}
setActiveDot(0);

/* Dot click scrolls to card */
filmDots.forEach((dot, i) => {
  dot.addEventListener('click', () => {
    const card = filmCards[i]; if (!card) return;
    const cRect = filmScroll.getBoundingClientRect();
    const kRect = card.getBoundingClientRect();
    filmScroll.scrollTo({
      left: filmScroll.scrollLeft + kRect.left - cRect.left - (cRect.width / 2) + (kRect.width / 2),
      behavior: 'smooth'
    });
  });
});

/* Click to open link — drag-safe */
filmScroll.addEventListener('mousedown', e => { filmMouseDX = e.clientX; filmDragged = false; });
filmScroll.addEventListener('mousemove', e => { if (Math.abs(e.clientX - filmMouseDX) > 5) filmDragged = true; });
filmScroll.addEventListener('click', e => {
  if (filmDragged) return;
  const card = e.target.closest('.film-card'); if (!card) return;
  const href = card.getAttribute('data-href');
  if (href) window.open(href, '_blank', 'noopener');
});

/* Drag-to-scroll — desktop */
let fDown = false, fStartX, fScrollLeft;
filmScroll.addEventListener('mousedown', e => { fDown = true; fStartX = e.pageX - filmScroll.offsetLeft; fScrollLeft = filmScroll.scrollLeft; });
filmScroll.addEventListener('mouseleave', () => fDown = false);
filmScroll.addEventListener('mouseup',    () => fDown = false);
filmScroll.addEventListener('mousemove',  e => {
  if (!fDown) return; e.preventDefault();
  filmScroll.scrollLeft = fScrollLeft - (e.pageX - filmScroll.offsetLeft - fStartX) * 1.8;
});

/* Mobile: center-card detection — rAF throttled, edge-fixed, dot sync only */
function _doFilmUpdate() {
  filmRAF = null;
  if (window.innerWidth > 900) return;
  const sl    = filmScroll.scrollLeft;
  const maxSl = filmScroll.scrollWidth - filmScroll.clientWidth;
  if (sl <= 8)         { setActiveDot(0); return; }
  if (sl >= maxSl - 8) { setActiveDot(filmCards.length - 1); return; }
  const rect   = filmScroll.getBoundingClientRect();
  const center = rect.left + rect.width / 2;
  let closestIdx = 0, minDist = Infinity;
  filmCards.forEach((card, i) => {
    const cr   = card.getBoundingClientRect();
    const dist = Math.abs(cr.left + cr.width / 2 - center);
    if (dist < minDist) { minDist = dist; closestIdx = i; }
  });
  setActiveDot(closestIdx);
}
function scheduleFilmUpdate() { if (filmRAF) return; filmRAF = requestAnimationFrame(_doFilmUpdate); }
filmScroll.addEventListener('scroll',    scheduleFilmUpdate, { passive: true });
filmScroll.addEventListener('touchmove', scheduleFilmUpdate, { passive: true });
filmScroll.addEventListener('touchend',  () => setTimeout(_doFilmUpdate, 80));

/* ══ ABOUT — TRAINING EXPAND BOX ════════════════════════ */
const trainingBox = document.querySelector('.training-expand-box');
if (trainingBox) {
  trainingBox.addEventListener('click', () => {
    const expanded = trainingBox.classList.toggle('expanded');
    trainingBox.setAttribute('aria-expanded', expanded);
  });
}

/* ══ LOOKBOOK TABS — FADE TRANSITION ════════════════════
   e.preventDefault() stops page scroll jump.
   position:absolute panels — no layout shift at all.    */
const stillsTabs   = Array.from(document.querySelectorAll('.stills-tab'));
const stillsPanels = Array.from(document.querySelectorAll('.stills-panel'));
const tabIndicator = document.querySelector('.tab-indicator');
let currentTab     = 0;

function moveIndicator(tab) {
  if (!tabIndicator || !tab) return;
  const wrap  = tab.closest('.stills-tabs');
  const wRect = wrap.getBoundingClientRect();
  const tRect = tab.getBoundingClientRect();
  tabIndicator.style.left  = (tRect.left - wRect.left + wrap.scrollLeft) + 'px';
  tabIndicator.style.width = tRect.width + 'px';
}

function switchTab(idx) {
  if (idx < 0 || idx >= stillsTabs.length || idx === currentTab) return;
  stillsTabs[currentTab].classList.remove('active');
  stillsPanels[currentTab].classList.remove('active');
  currentTab = idx;
  stillsTabs[currentTab].classList.add('active');
  stillsPanels[currentTab].classList.add('active');
  moveIndicator(stillsTabs[currentTab]);
  stillsTabs[currentTab].scrollIntoView({ inline: 'nearest', behavior: 'smooth', block: 'nearest' });
}

stillsTabs.forEach((tab, i) => {
  tab.addEventListener('click', e => { e.preventDefault(); switchTab(i); });
});

window.addEventListener('load', () => {
  if (stillsPanels[0]) stillsPanels[0].classList.add('active');
  moveIndicator(stillsTabs[0]);
});
window.addEventListener('resize', () => moveIndicator(stillsTabs[currentTab]));

/* ══ LIGHTBOX ════════════════════════════════════════════
   Desktop: click image → zoom 2x + mouse-pan, click → zoom out.
            Click outside (black area) → close.
   Mobile:  pinch zoom (origin anchored to finger midpoint).
            Double-tap toggles 1x / 2x.
            Pan with boundary clamping (works for landscape too).
            Swipe at 1x → navigate prev/next.
            Tap outside image → close.                   */
const lb    = document.getElementById('lightbox');
const lbImg = document.getElementById('lb-img');
const lbCap = document.getElementById('lb-caption');

let lbImages = [], lbCur = 0;
let lbScale = 1, lbPanX = 0, lbPanY = 0;
const LB_ZOOM_DESKTOP = 2;
const LB_MAX_MOBILE   = 3;

/* Collect all .si items */
function getAllSi() { return Array.from(document.querySelectorAll('.si')); }

function applyTransform(animated) {
  lbImg.style.transition = animated ? 'transform .25s ease' : 'none';
  lbImg.style.transform  = `translate(${lbPanX}px,${lbPanY}px) scale(${lbScale})`;
}

/* Clamp pan so image edges never go beyond viewport edges.
   Works correctly for both portrait and landscape images. */
function clampPan() {
  const wrap     = document.querySelector('.lightbox-img-wrap');
  if (!wrap) return;
  const wW = wrap.clientWidth;
  const wH = wrap.clientHeight;
  /* Natural rendered size of the image before scaling */
  const natW = lbImg.naturalWidth;
  const natH = lbImg.naturalHeight;
  const scale0 = Math.min(wW / natW, wH / natH); /* CSS object-fit: contain equiv */
  const rendW  = natW * scale0 * lbScale;
  const rendH  = natH * scale0 * lbScale;
  /* Maximum pan is half the overflow (rendered size - viewport size) / 2 */
  const maxX = Math.max(0, (rendW - wW) / 2);
  const maxY = Math.max(0, (rendH - wH) / 2);
  lbPanX = Math.min(maxX, Math.max(-maxX, lbPanX));
  lbPanY = Math.min(maxY, Math.max(-maxY, lbPanY));
}

function resetLbZoom() {
  lbScale = 1; lbPanX = 0; lbPanY = 0;
  lbImg.classList.remove('lb-zoomed', 'dragging');
  lbImg.style.cursor = 'zoom-in';
  applyTransform(true);
}

function openLB(idx) {
  lbImages = getAllSi();
  lbCur    = Math.max(0, Math.min(idx, lbImages.length - 1));
  lbImg.src = lbImages[lbCur].getAttribute('data-src');
  lbCap.textContent = lbImages[lbCur].getAttribute('data-tag') || '';
  resetLbZoom();
  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeLB() {
  lb.classList.remove('open');
  document.body.style.overflow = '';
  resetLbZoom();
}
function prevLB() {
  if (lbScale > 1) return;
  lbImages = getAllSi();
  openLB((lbCur - 1 + lbImages.length) % lbImages.length);
}
function nextLB() {
  if (lbScale > 1) return;
  lbImages = getAllSi();
  openLB((lbCur + 1) % lbImages.length);
}

/* Open on .si click */
document.addEventListener('click', e => {
  const cell = e.target.closest('.si'); if (!cell) return;
  const imgs = getAllSi(); const idx = imgs.indexOf(cell);
  if (idx > -1) openLB(idx);
});

/* Close button */
document.getElementById('lb-close').addEventListener('click', closeLB);
/* Click on black area (lb itself, not img) closes */
lb.addEventListener('click', e => { if (e.target === lb) closeLB(); });

/* Prev / Next buttons */
document.getElementById('lb-prev').addEventListener('click', prevLB);
document.getElementById('lb-next').addEventListener('click', nextLB);

/* Keyboard */
document.addEventListener('keydown', e => {
  if (!lb.classList.contains('open')) return;
  if (e.key === 'Escape')     closeLB();
  if (e.key === 'ArrowLeft')  prevLB();
  if (e.key === 'ArrowRight') nextLB();
});

/* ── DESKTOP: click-to-zoom + mouse pan ──────────────── */
let desktopPanning = false;
let desktopPanStartX = 0, desktopPanStartY = 0;
let desktopPanOriginX = 0, desktopPanOriginY = 0;

lbImg.addEventListener('click', e => {
  if (window.matchMedia('(pointer:coarse)').matches) return; /* skip on touch */
  if (desktopPanning) return; /* was a drag, not a click */
  e.stopPropagation();
  if (lbScale > 1) {
    resetLbZoom();
  } else {
    lbScale = LB_ZOOM_DESKTOP;
    lbPanX  = 0; lbPanY = 0;
    lbImg.classList.add('lb-zoomed');
    lbImg.style.cursor = 'grab';
    applyTransform(true);
  }
});

lbImg.addEventListener('mousedown', e => {
  if (window.matchMedia('(pointer:coarse)').matches) return;
  if (lbScale <= 1) return;
  e.preventDefault();
  desktopPanning    = false;
  desktopPanStartX  = e.clientX;
  desktopPanStartY  = e.clientY;
  desktopPanOriginX = lbPanX;
  desktopPanOriginY = lbPanY;
  lbImg.classList.add('dragging');
});

document.addEventListener('mousemove', e => {
  if (window.matchMedia('(pointer:coarse)').matches) return;
  if (!lbImg.classList.contains('dragging')) return;
  const dx = e.clientX - desktopPanStartX;
  const dy = e.clientY - desktopPanStartY;
  if (Math.abs(dx) > 3 || Math.abs(dy) > 3) desktopPanning = true;
  lbPanX = desktopPanOriginX + dx;
  lbPanY = desktopPanOriginY + dy;
  clampPan();
  applyTransform(false);
});

document.addEventListener('mouseup', () => {
  if (lbImg.classList.contains('dragging')) {
    lbImg.classList.remove('dragging');
    /* Small delay so the click handler can read desktopPanning */
    setTimeout(() => { desktopPanning = false; }, 10);
  }
});

/* ── MOBILE TOUCH HANDLING ────────────────────────────
   Pinch zoom: origin anchored at finger midpoint.
   Double-tap: toggle 1x / 2x.
   Pan when zoomed: boundary-clamped.
   Swipe at 1x: navigate prev/next.                    */
let tStartX = 0, tStartY = 0, lastTap = 0;
let pinchStartDist = 0, pinchStartScale = 1;
let pinchMidX = 0, pinchMidY = 0;   /* midpoint at pinch start */
let pinchPanOriginX = 0, pinchPanOriginY = 0;
let panT1StartX = 0, panT1StartY = 0, panOriginX = 0, panOriginY = 0;

function getTouchDist(e) {
  const dx = e.touches[0].clientX - e.touches[1].clientX;
  const dy = e.touches[0].clientY - e.touches[1].clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

lb.addEventListener('touchstart', e => {
  if (!lb.classList.contains('open')) return;
  if (e.touches.length === 2) {
    e.preventDefault();
    pinchStartDist   = getTouchDist(e);
    pinchStartScale  = lbScale;
    /* Anchor midpoint */
    pinchMidX        = (e.touches[0].clientX + e.touches[1].clientX) / 2;
    pinchMidY        = (e.touches[0].clientY + e.touches[1].clientY) / 2;
    pinchPanOriginX  = lbPanX;
    pinchPanOriginY  = lbPanY;
  } else if (e.touches.length === 1) {
    tStartX = e.touches[0].clientX;
    tStartY = e.touches[0].clientY;
    panT1StartX = e.touches[0].clientX;
    panT1StartY = e.touches[0].clientY;
    panOriginX  = lbPanX;
    panOriginY  = lbPanY;
    /* Double-tap */
    const now = Date.now();
    if (now - lastTap < 280) {
      e.preventDefault();
      if (lbScale > 1) { resetLbZoom(); }
      else { lbScale = 2; lbPanX = 0; lbPanY = 0; applyTransform(true); }
      lastTap = 0;
    } else { lastTap = now; }
  }
}, { passive: false });

lb.addEventListener('touchmove', e => {
  if (!lb.classList.contains('open')) return;
  if (e.touches.length === 2) {
    e.preventDefault();
    const dist     = getTouchDist(e);
    const newScale = Math.min(LB_MAX_MOBILE, Math.max(1, pinchStartScale * (dist / pinchStartDist)));
    /* Translate pan so zoom stays anchored to original finger midpoint */
    const scaleDelta = newScale - pinchStartScale;
    const wrap       = document.querySelector('.lightbox-img-wrap');
    const wCX        = wrap ? wrap.clientWidth / 2  : window.innerWidth / 2;
    const wCY        = wrap ? wrap.clientHeight / 2 : window.innerHeight / 2;
    lbPanX  = pinchPanOriginX - (pinchMidX - wCX) * scaleDelta / pinchStartScale;
    lbPanY  = pinchPanOriginY - (pinchMidY - wCY) * scaleDelta / pinchStartScale;
    lbScale = newScale;
    clampPan();
    applyTransform(false);
  } else if (e.touches.length === 1 && lbScale > 1) {
    e.preventDefault();
    lbPanX = panOriginX + (e.touches[0].clientX - panT1StartX);
    lbPanY = panOriginY + (e.touches[0].clientY - panT1StartY);
    clampPan();
    applyTransform(false);
  }
}, { passive: false });

lb.addEventListener('touchend', e => {
  if (!lb.classList.contains('open')) return;
  if (e.touches.length > 0) return;
  if (lbScale <= 1.05) {
    /* Snap back to 1x */
    lbScale = 1; lbPanX = 0; lbPanY = 0; applyTransform(true);
    /* Swipe navigation */
    const dx = e.changedTouches[0].clientX - tStartX;
    const dy = e.changedTouches[0].clientY - tStartY;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 45) {
      if (dx < 0) nextLB(); else prevLB();
    }
  } else {
    /* Clamp after pan ends */
    clampPan();
    applyTransform(true);
  }
}, { passive: true });

/* ══ HERO PARALLAX ════════════════════════════════════════ */
window.addEventListener('scroll', () => {
  const img = document.querySelector('.hero-image-panel img');
  if (img) img.style.transform = `translateY(${window.scrollY * .18}px)`;
}, { passive: true });

/* ══ CONTACT FORM — FORMSPREE AJAX ══════════════════════ */
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', async e => {
    e.preventDefault();
    const btn        = contactForm.querySelector('button[type="submit"]');
    const successMsg = document.getElementById('form-success');
    const errorMsg   = document.getElementById('form-error');
    successMsg.style.display = 'none';
    errorMsg.style.display   = 'none';
    btn.textContent = 'Sending...'; btn.disabled = true;
    try {
      const res = await fetch('https://formspree.io/f/meevdwkp', {
        method: 'POST', body: new FormData(contactForm),
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        successMsg.style.display = 'block';
        contactForm.reset(); btn.textContent = '✓ Sent';
      } else { throw new Error(); }
    } catch {
      errorMsg.style.display = 'block';
      btn.textContent = 'Send Message'; btn.disabled = false;
    }
  });
}
