/* ════════════════════════════════════════════════════════
   NASEEF P P — PORTFOLIO SCRIPT
   ════════════════════════════════════════════════════════ */

/* ══ CURSOR ══════════════════════════════════════════════ */
const curO = document.getElementById('cursor-outer');
const curI = document.getElementById('cursor-inner');
let ox=0,oy=0,tx=0,ty=0;
document.addEventListener('mousemove',e=>{tx=e.clientX;ty=e.clientY;curI.style.left=tx+'px';curI.style.top=ty+'px';});
(function loop(){ox+=(tx-ox)*.12;oy+=(ty-oy)*.12;curO.style.left=ox+'px';curO.style.top=oy+'px';requestAnimationFrame(loop);})();
document.querySelectorAll('a,button,.film-card,.si,.lang-badge,.stills-tab,.training-expand-box').forEach(el=>{
  el.addEventListener('mouseenter',()=>{curO.style.transform='translate(-50%,-50%) scale(1.8)';curO.style.borderColor='#C0392B';});
  el.addEventListener('mouseleave',()=>{curO.style.transform='translate(-50%,-50%) scale(1)';curO.style.borderColor='#D4A953';});
});

/* ══ NAVBAR ══════════════════════════════════════════════ */
const nav=document.getElementById('navbar');
window.addEventListener('scroll',()=>nav.classList.toggle('scrolled',window.scrollY>60),{passive:true});

/* ══ MOBILE MENU ══════════════════════════════════════════ */
function toggleMenu(){
  document.getElementById('mobile-menu').classList.toggle('open');
  document.getElementById('hamburger').classList.toggle('active');
}

/* ══ SCROLL REVEAL ════════════════════════════════════════ */
const revObs=new IntersectionObserver(entries=>{
  entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');revObs.unobserve(e.target);}});
},{threshold:.1});
document.querySelectorAll('.reveal').forEach(el=>revObs.observe(el));

/* ══ COUNT-UP ════════════════════════════════════════════ */
const cntObs=new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(!e.isIntersecting)return;
    const t=parseInt(e.target.getAttribute('data-target'));let c=0;
    const tmr=setInterval(()=>{c+=t/40;if(c>=t){c=t;clearInterval(tmr);}e.target.textContent=Math.floor(c)+'+';},35);
    cntObs.unobserve(e.target);
  });
},{threshold:.5});
document.querySelectorAll('.count-num').forEach(el=>cntObs.observe(el));

/* ══ FILMOGRAPHY TRACK PADDING + FEATHER SYNC ═══════════
   Reads container left offset, applies as padding to track
   and as width to feather divs — cards align with titles,
   feathers sit exactly at container margin boundaries.    */
function syncFilmPadding(){
  const ref=document.querySelector('.container');
  if(!ref)return;
  const leftPad=Math.max(Math.round(ref.getBoundingClientRect().left),16);
  const track=document.getElementById('filmTrack');
  if(track){track.style.paddingLeft=leftPad+'px';track.style.paddingRight=leftPad+'px';}
  document.querySelectorAll('.film-feather').forEach(f=>{f.style.width=leftPad+'px';});
}
syncFilmPadding();
window.addEventListener('resize',syncFilmPadding);

/* ══ YOUTUBE IFRAME API ══════════════════════════════════ */
let ytAPIReady=false,ytPlayer=null;
window.onYouTubeIframeAPIReady=function(){ytAPIReady=true;};
const langModal=document.getElementById('lang-modal');
const langLabel=document.getElementById('lang-modal-label');
const langModalClose=document.getElementById('lang-modal-close');

function openLangModal(videoId,label){
  langModal.classList.add('open');
  document.body.style.overflow='hidden';
  langLabel.textContent=label;
  if(ytPlayer){try{ytPlayer.destroy();}catch(e){}ytPlayer=null;}
  document.getElementById('yt-player-container').innerHTML='<div id="yt-player"></div>';
  if(ytAPIReady){
    ytPlayer=new YT.Player('yt-player',{
      videoId,width:'100%',height:'100%',
      playerVars:{autoplay:1,rel:0,playsinline:1,modestbranding:1},
      events:{onStateChange:event=>{if(event.data===0)closeLangModal();}}
    });
  } else {
    document.getElementById('yt-player-container').innerHTML=
      '<iframe src="https://www.youtube.com/embed/'+videoId+
      '?autoplay=1&rel=0&playsinline=1" allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowfullscreen style="width:100%;height:100%;border:none;"></iframe>';
  }
}
function closeLangModal(){
  langModal.classList.remove('open');
  document.body.style.overflow='';
  if(ytPlayer){try{ytPlayer.stopVideo();}catch(e){}}
  document.getElementById('yt-player-container').innerHTML='<div id="yt-player"></div>';
}
document.querySelectorAll('.lang-badge').forEach(b=>{
  b.addEventListener('click',()=>openLangModal(b.getAttribute('data-videoid'),b.getAttribute('data-label')));
});
langModalClose.addEventListener('click',closeLangModal);
langModal.addEventListener('click',e=>{if(e.target===langModal)closeLangModal();});
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&langModal.classList.contains('open'))closeLangModal();
});

/* ══ FILMOGRAPHY — ACTIVE CARD SYSTEM ═══════════════════ */
const filmCards=Array.from(document.querySelectorAll('.film-card'));
const filmScroll=document.getElementById('filmScroll');
const filmDots=Array.from(document.querySelectorAll('.film-dot'));
let filmMouseDX=0,filmDragged=false,filmRAF=null;

function setActiveFilm(card){
  filmCards.forEach(c=>c.classList.remove('active'));
  if(card)card.classList.add('active');
  const idx=filmCards.indexOf(card);
  filmDots.forEach((d,i)=>d.classList.toggle('active',i===idx));
}
setActiveFilm(filmCards[0]);

/* Desktop: hover transfers, persists on mouse leave */
filmCards.forEach(card=>{
  card.addEventListener('mouseenter',()=>{if(window.innerWidth>900)setActiveFilm(card);});
});

/* Dot click scrolls to that card */
filmDots.forEach((dot,i)=>{
  dot.addEventListener('click',()=>{
    const card=filmCards[i];if(!card)return;
    const cRect=filmScroll.getBoundingClientRect();
    const kRect=card.getBoundingClientRect();
    filmScroll.scrollTo({left:filmScroll.scrollLeft+kRect.left-cRect.left-(cRect.width/2)+(kRect.width/2),behavior:'smooth'});
  });
});

/* Click to open film link — drag-safe */
filmScroll.addEventListener('mousedown',e=>{filmMouseDX=e.clientX;filmDragged=false;});
filmScroll.addEventListener('mousemove',e=>{if(Math.abs(e.clientX-filmMouseDX)>5)filmDragged=true;});
filmScroll.addEventListener('click',e=>{
  if(filmDragged)return;
  const card=e.target.closest('.film-card');if(!card)return;
  const href=card.getAttribute('data-href');if(href)window.open(href,'_blank','noopener');
});

/* Drag-to-scroll desktop */
let fDown=false,fStartX,fScrollLeft;
filmScroll.addEventListener('mousedown',e=>{fDown=true;fStartX=e.pageX-filmScroll.offsetLeft;fScrollLeft=filmScroll.scrollLeft;});
filmScroll.addEventListener('mouseleave',()=>fDown=false);
filmScroll.addEventListener('mouseup',()=>fDown=false);
filmScroll.addEventListener('mousemove',e=>{
  if(!fDown)return;e.preventDefault();
  filmScroll.scrollLeft=fScrollLeft-(e.pageX-filmScroll.offsetLeft-fStartX)*1.8;
});

/* Mobile: center-card detection, rAF-throttled, edge-fixed */
function _doFilmUpdate(){
  filmRAF=null;
  if(window.innerWidth>900)return;
  const sl=filmScroll.scrollLeft;
  const maxSl=filmScroll.scrollWidth-filmScroll.clientWidth;
  if(sl<=8){setActiveFilm(filmCards[0]);return;}
  if(sl>=maxSl-8){setActiveFilm(filmCards[filmCards.length-1]);return;}
  const rect=filmScroll.getBoundingClientRect();
  const center=rect.left+rect.width/2;
  let closest=null,minDist=Infinity;
  filmCards.forEach(card=>{
    const cr=card.getBoundingClientRect();
    const dist=Math.abs(cr.left+cr.width/2-center);
    if(dist<minDist){minDist=dist;closest=card;}
  });
  if(closest)setActiveFilm(closest);
}
function scheduleFilmUpdate(){if(filmRAF)return;filmRAF=requestAnimationFrame(_doFilmUpdate);}
filmScroll.addEventListener('scroll',scheduleFilmUpdate,{passive:true});
filmScroll.addEventListener('touchmove',scheduleFilmUpdate,{passive:true});
filmScroll.addEventListener('touchend',()=>setTimeout(_doFilmUpdate,80));

/* ══ ABOUT — TRAINING EXPAND BOX ════════════════════════ */
const trainingBox=document.querySelector('.training-expand-box');
if(trainingBox){
  trainingBox.addEventListener('click',()=>{
    const expanded=trainingBox.classList.toggle('expanded');
    trainingBox.setAttribute('aria-expanded',expanded);
  });
}

/* ══ STILLS & FRAMES — TABS WITH FADE ═══════════════════
   Tab click only. Panels fade in/out via opacity.
   Active panel is position:relative (holds height).
   Inactive panels are position:absolute (no layout space).
   This prevents any scroll jump on tab switch.           */
const stillsTabs=Array.from(document.querySelectorAll('.stills-tab'));
const stillsPanels=Array.from(document.querySelectorAll('.stills-panel'));
const tabIndicator=document.querySelector('.tab-indicator');
let currentStillsIdx=0;

function moveIndicator(tab){
  if(!tabIndicator||!tab)return;
  const wrap=tab.closest('.stills-tabs');
  const wRect=wrap.getBoundingClientRect();
  const tRect=tab.getBoundingClientRect();
  tabIndicator.style.left=(tRect.left-wRect.left+wrap.scrollLeft)+'px';
  tabIndicator.style.width=tRect.width+'px';
}

function switchTab(idx){
  if(idx<0||idx>=stillsTabs.length||idx===currentStillsIdx)return;
  stillsTabs[currentStillsIdx].classList.remove('active');
  stillsPanels[currentStillsIdx].classList.remove('active');
  currentStillsIdx=idx;
  stillsTabs[currentStillsIdx].classList.add('active');
  stillsPanels[currentStillsIdx].classList.add('active');
  moveIndicator(stillsTabs[currentStillsIdx]);
  stillsTabs[currentStillsIdx].scrollIntoView({inline:'nearest',behavior:'smooth',block:'nearest'});
}

/* e.preventDefault() stops page scroll jump on button click */
stillsTabs.forEach((tab,i)=>{
  tab.addEventListener('click',e=>{e.preventDefault();switchTab(i);});
});

window.addEventListener('load',()=>{
  if(stillsPanels[0])stillsPanels[0].classList.add('active');
  moveIndicator(stillsTabs[0]);
});
window.addEventListener('resize',()=>moveIndicator(stillsTabs[currentStillsIdx]));

/* ══ LIGHTBOX ════════════════════════════════════════════
   Navigation: arrow buttons + keyboard + single-finger swipe at 1x
   Zoom: pinch (2 fingers) up to 3x max
   Double-tap: toggle 1x ↔ 2x
   Pan: single finger drag when zoomed > 1x
   Swipe navigation blocked when zoomed                  */
const lb=document.getElementById('lightbox');
const lbImg=document.getElementById('lb-img');
const lbCap=document.getElementById('lb-caption');
let lbImages=[],lbCur=0;
let lbScale=1,lbPanX=0,lbPanY=0;
const LB_MAX=3,LB_MIN=1;

function applyLbTransform(animated){
  lbImg.style.transition=animated?'transform .25s ease':'none';
  lbImg.style.transform='translate('+lbPanX+'px,'+lbPanY+'px) scale('+lbScale+')';
}
function resetLbZoom(){lbScale=1;lbPanX=0;lbPanY=0;applyLbTransform(true);}

function getAllSi(){return Array.from(document.querySelectorAll('.si'));}

function openLB(idx){
  lbImages=getAllSi();
  lbCur=Math.max(0,Math.min(idx,lbImages.length-1));
  lbImg.src=lbImages[lbCur].getAttribute('data-src');
  lbCap.textContent=lbImages[lbCur].getAttribute('data-tag');
  resetLbZoom();
  lb.classList.add('open');
  document.body.style.overflow='hidden';
}
function closeLB(){lb.classList.remove('open');document.body.style.overflow='';resetLbZoom();}
function prevLB(){if(lbScale>1)return;lbImages=getAllSi();openLB((lbCur-1+lbImages.length)%lbImages.length);}
function nextLB(){if(lbScale>1)return;lbImages=getAllSi();openLB((lbCur+1)%lbImages.length);}

/* Open on .si click */
document.addEventListener('click',e=>{
  const cell=e.target.closest('.si');if(!cell)return;
  const imgs=getAllSi();const idx=imgs.indexOf(cell);
  if(idx>-1)openLB(idx);
});
document.getElementById('lb-close').addEventListener('click',closeLB);
document.getElementById('lb-prev').addEventListener('click',prevLB);
document.getElementById('lb-next').addEventListener('click',nextLB);
lb.addEventListener('click',e=>{if(e.target===lb)closeLB();});
document.addEventListener('keydown',e=>{
  if(!lb.classList.contains('open'))return;
  if(e.key==='Escape')closeLB();
  if(e.key==='ArrowLeft')prevLB();
  if(e.key==='ArrowRight')nextLB();
});

/* Touch handling */
let tStartX=0,tStartY=0,lastTap=0;
let pinchStartDist=0,pinchStartScale=1;
let panStartX=0,panStartY=0,panStartPX=0,panStartPY=0;

function getTouchDist(e){
  const dx=e.touches[0].clientX-e.touches[1].clientX;
  const dy=e.touches[0].clientY-e.touches[1].clientY;
  return Math.sqrt(dx*dx+dy*dy);
}

lb.addEventListener('touchstart',e=>{
  if(!lb.classList.contains('open'))return;
  if(e.touches.length===2){
    e.preventDefault();
    pinchStartDist=getTouchDist(e);
    pinchStartScale=lbScale;
  } else if(e.touches.length===1){
    tStartX=e.touches[0].clientX;
    tStartY=e.touches[0].clientY;
    panStartX=e.touches[0].clientX;
    panStartY=e.touches[0].clientY;
    panStartPX=lbPanX;
    panStartPY=lbPanY;
    /* Double-tap: toggle 1x / 2x */
    const now=Date.now();
    if(now-lastTap<280){
      e.preventDefault();
      if(lbScale>1){resetLbZoom();}
      else{lbScale=2;lbPanX=0;lbPanY=0;applyLbTransform(true);}
      lastTap=0;
    } else {lastTap=now;}
  }
},{passive:false});

lb.addEventListener('touchmove',e=>{
  if(!lb.classList.contains('open'))return;
  if(e.touches.length===2){
    e.preventDefault();
    const dist=getTouchDist(e);
    lbScale=Math.min(LB_MAX,Math.max(LB_MIN,pinchStartScale*(dist/pinchStartDist)));
    applyLbTransform(false);
  } else if(e.touches.length===1&&lbScale>1){
    e.preventDefault();
    lbPanX=panStartPX+(e.touches[0].clientX-panStartX);
    lbPanY=panStartPY+(e.touches[0].clientY-panStartY);
    applyLbTransform(false);
  }
},{passive:false});

lb.addEventListener('touchend',e=>{
  if(!lb.classList.contains('open'))return;
  if(e.touches.length>0)return;
  if(lbScale<=1.05){
    lbScale=1;lbPanX=0;lbPanY=0;applyLbTransform(true);
    /* Swipe nav — only at 1x */
    const dx=e.changedTouches[0].clientX-tStartX;
    const dy=e.changedTouches[0].clientY-tStartY;
    if(Math.abs(dx)>Math.abs(dy)&&Math.abs(dx)>45){
      if(dx<0)nextLB();else prevLB();
    }
  } else {
    /* Clamp pan so image stays reachable */
    const maxPan=(lbScale-1)*(window.innerWidth/2);
    lbPanX=Math.min(maxPan,Math.max(-maxPan,lbPanX));
    lbPanY=Math.min(maxPan,Math.max(-maxPan,lbPanY));
    applyLbTransform(true);
  }
},{passive:true});

/* ══ HERO PARALLAX ════════════════════════════════════════ */
window.addEventListener('scroll',()=>{
  const img=document.querySelector('.hero-image-panel img');
  if(img)img.style.transform='translateY('+(window.scrollY*.18)+'px)';
},{passive:true});

/* ══ CONTACT FORM — FORMSPREE AJAX ══════════════════════ */
const contactForm=document.getElementById('contact-form');
if(contactForm){
  contactForm.addEventListener('submit',async e=>{
    e.preventDefault();
    const btn=contactForm.querySelector('button[type="submit"]');
    const successMsg=document.getElementById('form-success');
    const errorMsg=document.getElementById('form-error');
    successMsg.style.display='none';errorMsg.style.display='none';
    btn.textContent='Sending...';btn.disabled=true;
    try{
      const response=await fetch('https://formspree.io/f/meevdwkp',{
        method:'POST',body:new FormData(contactForm),headers:{'Accept':'application/json'}
      });
      if(response.ok){
        successMsg.style.display='block';contactForm.reset();btn.textContent='Sent';
      } else {throw new Error('Server error');}
    } catch(err){
      errorMsg.style.display='block';btn.textContent='Send Message';btn.disabled=false;
    }
  });
}
