/* ════════════════════════════════════════════════════════
   NASEEF P P — PORTFOLIO SCRIPT
   ════════════════════════════════════════════════════════ */

/* ══ CURSOR ══════════════════════════════════════════════ */
const curO = document.getElementById('cursor-outer');
const curI = document.getElementById('cursor-inner');
let ox=0, oy=0, tx=0, ty=0;

document.addEventListener('mousemove', e => {
  tx = e.clientX; ty = e.clientY;
  curI.style.left = tx+'px'; curI.style.top = ty+'px';
});
(function loop(){
  ox += (tx-ox)*.12; oy += (ty-oy)*.12;
  curO.style.left = ox+'px'; curO.style.top = oy+'px';
  requestAnimationFrame(loop);
})();

/* Cursor scale on interactive elements
   NOT on: stat cards, profile table, skill tags */
document.querySelectorAll('a, button, .film-card, .si, .lang-badge, .stills-tab, .training-expand-box').forEach(el => {
  el.addEventListener('mouseenter', () => {
    curO.style.transform = 'translate(-50%,-50%) scale(1.8)';
    curO.style.borderColor = '#C0392B';
  });
  el.addEventListener('mouseleave', () => {
    curO.style.transform = 'translate(-50%,-50%) scale(1)';
    curO.style.borderColor = '#D4A953';
  });
});

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

/* ══ SCROLL REVEAL ════════════════════════════════════════ */
const revObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revObs.unobserve(e.target);
    }
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

/* ══ SCROLL TRACK PADDING + FEATHER SYNC ════════════════
   Sets padding on film scroll track and feather widths
   to exactly match the container's left offset.
   Cards start precisely below section titles.           */
function syncScrollPadding() {
  const ref = document.querySelector('.container');
  if (!ref) return;
  const leftPad = Math.max(Math.round(ref.getBoundingClientRect().left), 16);
  const filmTrack = document.getElementById('filmTrack');
  if (filmTrack) {
    filmTrack.style.paddingLeft  = leftPad + 'px';
    filmTrack.style.paddingRight = leftPad + 'px';
  }
  document.querySelectorAll('.scroll-feather').forEach(f => {
    f.style.width = leftPad + 'px';
  });
}
syncScrollPadding();
window.addEventListener('resize', syncScrollPadding);

/* ══ YOUTUBE IFRAME API ══════════════════════════════════ */
let ytAPIReady = false;
let ytPlayer   = null;
window.onYouTubeIframeAPIReady = function() { ytAPIReady = true; };

const langModal      = document.getElementById('lang-modal');
const langLabel      = document.getElementById('lang-modal-label');
const langModalClose = document.getElementById('lang-modal-close');

function openLangModal(videoId, label) {
  langModal.classList.add('open');
  document.body.style.overflow = 'hidden';
  langLabel.textContent = label;
  /* Destroy previous player */
  if (ytPlayer) { try { ytPlayer.destroy(); } catch(e){} ytPlayer = null; }
  document.getElementById('yt-player-container').innerHTML = '<div id="yt-player"></div>';
  if (ytAPIReady) {
    ytPlayer = new YT.Player('yt-player', {
      videoId,
      width: '100%', height: '100%',
      playerVars: { autoplay: 1, rel: 0, playsinline: 1, modestbranding: 1 },
      events: {
        onStateChange: event => {
          if (event.data === 0) closeLangModal(); /* 0 = ended */
        }
      }
    });
  } else {
    /* Fallback plain iframe */
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
  b.addEventListener('click', () =>
    openLangModal(b.getAttribute('data-videoid'), b.getAttribute('data-label'))
  );
});
langModalClose.addEventListener('click', closeLangModal);
langModal.addEventListener('click', e => { if (e.target === langModal) closeLangModal(); });
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && langModal.classList.contains('open')) closeLangModal();
});

/* ══ FILMOGRAPHY — ACTIVE CARD SYSTEM ═══════════════════
   Desktop: hover transfers active state, persists on leave.
            First card active on load.
   Mobile:  CSS snap scroll handles UX.
            JS detects snapped card and applies active class.
            rAF-throttled. Edge fix for first/last card.    */
const filmCards  = Array.from(document.querySelectorAll('.film-card'));
const filmScroll = document.getElementById('filmScroll');
const filmDots   = Array.from(document.querySelectorAll('.film-dot'));
let filmMouseDX  = 0;
let filmDragged  = false;
let filmScrollRAF = null;

function setActiveFilm(card) {
  filmCards.forEach(c => c.classList.remove('active'));
  if (card) card.classList.add('active');
  /* Sync dot indicator */
  const idx = filmCards.indexOf(card);
  filmDots.forEach((d, i) => d.classList.toggle('active', i === idx));
}

/* First card active on load */
setActiveFilm(filmCards[0]);

/* Desktop: hover transfers active state, persists on mouse leave */
filmCards.forEach(card => {
  card.addEventListener('mouseenter', () => {
    if (window.innerWidth > 900) setActiveFilm(card);
  });
});

/* Click dot to scroll to that card */
filmDots.forEach((dot, i) => {
  dot.addEventListener('click', () => {
    const card = filmCards[i];
    if (!card) return;
    const containerRect = filmScroll.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    const scrollTarget = filmScroll.scrollLeft + cardRect.left - containerRect.left
      - (containerRect.width / 2) + (cardRect.width / 2);
    filmScroll.scrollTo({ left: scrollTarget, behavior: 'smooth' });
  });
});

/* Click to open link — drag-safe */
filmScroll.addEventListener('mousedown', e => { filmMouseDX = e.clientX; filmDragged = false; });
filmScroll.addEventListener('mousemove', e => { if (Math.abs(e.clientX - filmMouseDX) > 5) filmDragged = true; });
filmScroll.addEventListener('click', e => {
  if (filmDragged) return;
  const card = e.target.closest('.film-card');
  if (!card) return;
  const href = card.getAttribute('data-href');
  if (href) window.open(href, '_blank', 'noopener');
});

/* Drag to scroll — desktop */
let fIsDown = false, fStartX, fScrollLeft;
filmScroll.addEventListener('mousedown', e => {
  fIsDown = true;
  fStartX = e.pageX - filmScroll.offsetLeft;
  fScrollLeft = filmScroll.scrollLeft;
});
filmScroll.addEventListener('mouseleave', () => fIsDown = false);
filmScroll.addEventListener('mouseup',    () => fIsDown = false);
filmScroll.addEventListener('mousemove',  e => {
  if (!fIsDown) return;
  e.preventDefault();
  filmScroll.scrollLeft = fScrollLeft - (e.pageX - filmScroll.offsetLeft - fStartX) * 1.8;
});

/* Mobile: detect snapped card — rAF throttled */
function _doFilmActiveUpdate() {
  filmScrollRAF = null;
  if (window.innerWidth > 900) return;
  const sl    = filmScroll.scrollLeft;
  const maxSl = filmScroll.scrollWidth - filmScroll.clientWidth;
  /* Edge cases */
  if (sl <= 8)         { setActiveFilm(filmCards[0]);                  return; }
  if (sl >= maxSl - 8) { setActiveFilm(filmCards[filmCards.length - 1]); return; }
  const rect   = filmScroll.getBoundingClientRect();
  const center = rect.left + rect.width / 2;
  let closest = null, minDist = Infinity;
  filmCards.forEach(card => {
    const cr   = card.getBoundingClientRect();
    const dist = Math.abs(cr.left + cr.width / 2 - center);
    if (dist < minDist) { minDist = dist; closest = card; }
  });
  if (closest) setActiveFilm(closest);
}
function updateFilmActive() {
  if (filmScrollRAF) return;
  filmScrollRAF = requestAnimationFrame(_doFilmActiveUpdate);
}
filmScroll.addEventListener('scroll',    updateFilmActive, { passive: true });
filmScroll.addEventListener('touchmove', updateFilmActive, { passive: true });
filmScroll.addEventListener('touchend',  () => setTimeout(_doFilmActiveUpdate, 80));

/* ══ ABOUT — TRAINING EXPAND BOX ════════════════════════ */
const trainingBox = document.querySelector('.training-expand-box');
if (trainingBox) {
  trainingBox.addEventListener('click', () => {
    trainingBox.classList.toggle('expanded');
  });
}

/* ══ STILLS & FRAMES — CATEGORY TABS ════════════════════
   Slide transition with indicator line.
   Swipe left/right gesture to switch categories.        */
const stillsTabs      = Array.from(document.querySelectorAll('.stills-tab'));
const stillsTrack     = document.getElementById('stillsTrack');
const tabIndicator    = document.querySelector('.tab-indicator');
let currentStillsIdx  = 0;

function moveIndicator(tab) {
  if (!tabIndicator || !tab) return;
  const tabsWrap = tab.closest('.stills-tabs');
  const wrapRect = tabsWrap.getBoundingClientRect();
  const tabRect  = tab.getBoundingClientRect();
  tabIndicator.style.left  = (tabRect.left - wrapRect.left + tabsWrap.scrollLeft) + 'px';
  tabIndicator.style.width = tabRect.width + 'px';
}

function switchStillsTab(idx, direction) {
  if (idx < 0 || idx >= stillsTabs.length) return;
  stillsTabs[currentStillsIdx].classList.remove('active');
  currentStillsIdx = idx;
  stillsTabs[currentStillsIdx].classList.add('active');
  moveIndicator(stillsTabs[currentStillsIdx]);
  /* Scroll tab into view if needed (mobile) */
  stillsTabs[currentStillsIdx].scrollIntoView({ inline: 'nearest', behavior: 'smooth' });
  /* Slide the track */
  if (stillsTrack) {
    stillsTrack.style.transform = `translateX(-${currentStillsIdx * 100}%)`;
  }
}

/* Init indicator on load */
window.addEventListener('load', () => {
  moveIndicator(stillsTabs[0]);
});
window.addEventListener('resize', () => {
  moveIndicator(stillsTabs[currentStillsIdx]);
});

stillsTabs.forEach((tab, i) => {
  tab.addEventListener('click', () => switchStillsTab(i));
});

/* Touch swipe on stills viewport */
const stillsViewport = document.getElementById('stillsViewport');
if (stillsViewport) {
  let swipeStartX = 0, swipeStartY = 0;
  stillsViewport.addEventListener('touchstart', e => {
    swipeStartX = e.touches[0].clientX;
    swipeStartY = e.touches[0].clientY;
  }, { passive: true });
  stillsViewport.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - swipeStartX;
    const dy = e.changedTouches[0].clientY - swipeStartY;
    /* Only register horizontal swipes */
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      if (dx < 0) switchStillsTab(currentStillsIdx + 1); /* swipe left → next */
      else         switchStillsTab(currentStillsIdx - 1); /* swipe right → prev */
    }
  }, { passive: true });
}

/* ══ LIGHTBOX ════════════════════════════════════════════
   Opens on still image click.
   Arrow buttons + keyboard + touch swipe to navigate.   */
const lb     = document.getElementById('lightbox');
const lbImg  = document.getElementById('lb-img');
const lbCap  = document.getElementById('lb-caption');
/* Collect all still images from currently shown panel */
let lbImages = [];
let lbCur    = 0;

function buildLbImages() {
  /* Build flat list of all si cells across all panels */
  lbImages = Array.from(document.querySelectorAll('.si'));
}
buildLbImages();

function openLB(idx) {
  lbCur = idx;
  lbImg.src = lbImages[idx].getAttribute('data-src');
  lbCap.textContent = lbImages[idx].getAttribute('data-tag');
  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeLB() {
  lb.classList.remove('open');
  document.body.style.overflow = '';
}
function prevLB() { openLB((lbCur - 1 + lbImages.length) % lbImages.length); }
function nextLB() { openLB((lbCur + 1) % lbImages.length); }

/* Click on still image to open lightbox */
document.querySelectorAll('.si').forEach((el, i) => {
  el.addEventListener('click', () => openLB(i));
});

document.getElementById('lb-close').addEventListener('click', closeLB);
document.getElementById('lb-prev').addEventListener('click', prevLB);
document.getElementById('lb-next').addEventListener('click', nextLB);
lb.addEventListener('click', e => { if (e.target === lb) closeLB(); });

/* Keyboard navigation */
document.addEventListener('keydown', e => {
  if (!lb.classList.contains('open')) return;
  if (e.key === 'Escape')      closeLB();
  if (e.key === 'ArrowLeft')   prevLB();
  if (e.key === 'ArrowRight')  nextLB();
});

/* Touch swipe inside lightbox */
let lbTouchStartX = 0;
lb.addEventListener('touchstart', e => {
  lbTouchStartX = e.touches[0].clientX;
}, { passive: true });
lb.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - lbTouchStartX;
  if (Math.abs(dx) > 40) {
    if (dx < 0) nextLB();
    else         prevLB();
  }
}, { passive: true });

/* ══ HERO PARALLAX ════════════════════════════════════════ */
window.addEventListener('scroll', () => {
  const img = document.querySelector('.hero-image-panel img');
  if (img) img.style.transform = `translateY(${window.scrollY * .18}px)`;
}, { passive: true });

/* ══ CONTACT FORM — FORMSPREE AJAX ══════════════════════
   Uses Formspree endpoint meevdwkp.
   Submits via fetch, shows success/error in page.      */
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', async e => {
    e.preventDefault();
    const btn        = contactForm.querySelector('button[type="submit"]');
    const successMsg = document.getElementById('form-success');
    const errorMsg   = document.getElementById('form-error');
    /* Reset messages */
    successMsg.style.display = 'none';
    errorMsg.style.display   = 'none';
    btn.textContent  = 'Sending...';
    btn.disabled     = true;
    try {
      const data     = new FormData(contactForm);
      const response = await fetch('https://formspree.io/f/meevdwkp', {
        method:  'POST',
        body:    data,
        headers: { 'Accept': 'application/json' }
      });
      if (response.ok) {
        successMsg.style.display = 'block';
        contactForm.reset();
        btn.textContent = '✓ Sent';
      } else {
        throw new Error('Server error');
      }
    } catch (err) {
      errorMsg.style.display = 'block';
      btn.textContent  = 'Send Message';
      btn.disabled     = false;
    }
  });
}
