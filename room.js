/* =========================================================
   room.js (FULL VERSION) — วางแทนไฟล์เดิมได้เลย
   ✅ คงฟังก์ชันเดิมทั้งหมดไว้ (gallery, thumbs, counter, prev/next, keyboard, swipe)
   ✅ เพิ่ม Full-screen Lightbox (แตะ/คลิกครั้งเดียวดูเต็มจอ ทั้ง Mobile + PC)
   ========================================================= */

const qs = (s, el=document) => el.querySelector(s);
const qsa = (s, el=document) => [...el.querySelectorAll(s)];

const GALLERIES = {
  studio: {
    title: "Studio",
    subtitle: "Studio • All photos",
    images: [
      "images/studio-1.webp",
      "images/studio-2.webp",
      "images/studio-3.webp",
      "images/studio-4.webp",
      "images/studio-5.webp",
      "images/studio-6.webp",
      "images/studio-7.webp",
    ]
  },
  onebed: {
    title: "1 Bedroom",
    subtitle: "1 Bedroom • All photos",
    images: [
      "images/1bed-1.webp",
      "images/1bed-2.webp",
      "images/1bed-3.webp",
      "images/1bed-4.webp",
      "images/1bed-5.webp",
      "images/1bed-6.webp",
      "images/1bed-7.webp",
    ]
  },
  twobed: {
    title: "2 Bedroom",
    subtitle: "2 Bedroom • All photos",
    images: [
      "images/2bed-1.webp",
      "images/2bed-2.webp",
      "images/2bed-3.webp",
      "images/2bed-4.webp",
      "images/2bed-5.webp",
      "images/2bed-6.webp",
      "images/2bed-7.webp",
    ]
  }
};

// อ่าน type จาก URL
const params = new URLSearchParams(location.search);
const type = (params.get("type") || "studio").toLowerCase();
const data = GALLERIES[type] || GALLERIES.studio;

// Set active nav link
qsa(".nav__btnLink").forEach(a => {
  a.classList.toggle("is-active", a.dataset.link === type);
});

// Parallax background (smooth)
const heroBg = document.querySelector(".hero__bg");
let ticking = false;

function onScrollParallax() {
  if (!heroBg) return;
  const y = window.scrollY || 0;
  heroBg.style.transform =
    `translate3d(0, ${y * 0.12}px, 0) scale(1.05)`;
  ticking = false;
}

window.addEventListener("scroll", () => {
  if (!ticking) {
    requestAnimationFrame(onScrollParallax);
    ticking = true;
  }
}, { passive: true });

onScrollParallax();

// Elements
const roomTitle = qs("#roomTitle");
const roomSubtitle = qs("#roomSubtitle");
const mainImg = qs("#mainImg");
const thumbs = qs("#thumbs");
const counter = qs("#counter");
const prevBtn = qs("#prevBtn");
const nextBtn = qs("#nextBtn");

if(mainImg){
  mainImg.decoding = "async";
  mainImg.loading = "eager";
}
if (roomTitle) roomTitle.textContent = data.title;
if (roomSubtitle) roomSubtitle.textContent = data.subtitle;

let idx = 0;

// Preload images for smooth
function preloadNearby(data, idx){
  const nextIdx = (idx + 1) % data.images.length;
  const prevIdx = (idx - 1 + data.images.length) % data.images.length;
  [data.images[nextIdx], data.images[prevIdx]].forEach(src => {
    const im = new Image();
    im.src = src;
  });
}

mainImg.onload = () => {
  mainImg.style.opacity = 1;
  counter.textContent = `${idx + 1} / ${data.images.length}`;
  preloadNearby(data, idx);
};

function setMainImage(){
  const src = data.images[idx];
  if (!mainImg) return;

  mainImg.style.opacity = 0;

  // เปลี่ยนรูปแบบนุ่ม ๆ
  setTimeout(() => {
    mainImg.src = src;
    mainImg.onload = () => (mainImg.style.opacity = 1);
    if (counter) counter.textContent = `${idx + 1} / ${data.images.length}`;
     preloadNearby();
  }, 80);
}

function renderThumbs(){
  if (!thumbs) return;
  thumbs.innerHTML = "";
  data.images.forEach((src, i) => {
    const im = document.createElement("img");
    im.src = src;
    im.alt = `${data.title} photo ${i+1}`;
    im.loading = "lazy";
    if(i === idx) im.classList.add("is-active");
    im.addEventListener("click", () => {
      idx = i;
      setMainImage();
      renderThumbs();
      // sync lightbox if open
      syncLightboxIfOpen();
    });
    thumbs.appendChild(im);
  });
}

function prev(){
  idx = (idx - 1 + data.images.length) % data.images.length;
  setMainImage();
  renderThumbs();
  syncLightboxIfOpen();
}
function next(){
  idx = (idx + 1) % data.images.length;
  setMainImage();
  renderThumbs();
  syncLightboxIfOpen();
}

if (prevBtn) prevBtn.addEventListener("click", prev);
if (nextBtn) nextBtn.addEventListener("click", next);

// Keyboard (เดิม) — ใช้เลื่อนรูปในหน้า room
window.addEventListener("keydown", (e) => {
  // ถ้า lightbox เปิดอยู่ ให้คุมจาก lightbox handler ข้างล่าง
  if (isLightboxOpen()) return;

  if(e.key === "ArrowLeft") prev();
  if(e.key === "ArrowRight") next();
});

// Init
setMainImage();
renderThumbs();

// --- Swipe on main image (mobile friendly) (เดิม)
let startX = 0;
let startY = 0;
let isSwiping = false;

const mainWrap = document.querySelector(".gallery__main");

if(mainWrap){
  mainWrap.addEventListener("touchstart", (e) => {
    // ถ้าเปิด lightbox อยู่แล้ว ไม่ต้องให้ swipe ของ mainWrap ทำงาน
    if (isLightboxOpen()) return;

    const t = e.touches[0];
    startX = t.clientX;
    startY = t.clientY;
    isSwiping = true;
  }, { passive: true });

  mainWrap.addEventListener("touchmove", (e) => {
    if(!isSwiping) return;
    const t = e.touches[0];
    const dx = Math.abs(t.clientX - startX);
    const dy = Math.abs(t.clientY - startY);

    // ถ้าเลื่อนแนวนอนชัดกว่าแนวตั้ง ให้กันการ scroll หน้าจอ
    if(dx > dy && dx > 10){
      e.preventDefault();
    }
  }, { passive: false });

  mainWrap.addEventListener("touchend", (e) => {
    if(!isSwiping) return;
    isSwiping = false;

    const t = e.changedTouches[0];
    const dx = t.clientX - startX;

    if(Math.abs(dx) > 40){
      if(dx < 0) next();  // swipe left -> next
      else prev();        // swipe right -> prev
    }
  }, { passive: true });
}

// Lightbox elements (อิงจาก HTML ที่ให้ไป)
const lightbox = document.getElementById("lightbox");
const lbImg = document.getElementById("lbImg");
const lbCounter = document.getElementById("lbCounter");
const lbPrev = document.getElementById("lbPrev");
const lbNext = document.getElementById("lbNext");
const lbMedia = document.getElementById("lbMedia");

function isLightboxOpen(){
  return !!(lightbox && lightbox.classList.contains("is-open"));
}

function openLightbox(){
  if(!lightbox || !lbImg) return;

  lightbox.classList.add("is-open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  syncLightboxImage();
}

function closeLightbox(){
  if(!lightbox) return;

  lightbox.classList.remove("is-open");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function syncLightboxImage(){
  if(!lbImg || !lbCounter) return;

  const src = data.images[idx];
  lbImg.style.opacity = 0;

  const pre = new Image();
  pre.src = src;
  pre.onload = () => {
    lbImg.src = src;
    lbImg.style.opacity = 1;
    lbCounter.textContent = `${idx + 1} / ${data.images.length}`;
  };
}

// ถ้า lightbox เปิดอยู่ แล้วมีการเปลี่ยน idx (จาก thumbs/main page) ให้ sync
function syncLightboxIfOpen(){
  if (isLightboxOpen()) syncLightboxImage();
}

// เปิด lightbox เมื่อคลิก/แตะที่รูปหลัก (แตะครั้งเดียว)
if(mainWrap){
  mainWrap.addEventListener("click", () => {
    // กันการเปิดตอนลากสไลด์นิ้วเล็กน้อย (optional)
    openLightbox();
  });
}

// เพิ่มปุ่ม Fullscreen (⤢) บนรูปหลัก แบบไม่ต้องแก้ HTML
(function addFullscreenButton(){
  if(!mainWrap) return;

  // กันซ้ำ
  if (mainWrap.querySelector(".fsBtn")) return;

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "fsBtn";
  btn.setAttribute("aria-label", "Open fullscreen");
  btn.innerHTML = "⤢";

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    openLightbox();
  });

  // ทำให้แน่ใจว่า gallery__main มี position relative (ส่วนใหญ่มีอยู่แล้ว)
  const stylePos = getComputedStyle(mainWrap).position;
  if(stylePos === "static") mainWrap.style.position = "relative";

  mainWrap.appendChild(btn);
})();

// Inject style ของปุ่ม fsBtn (เพื่อให้วางได้เลย)
(function injectFsBtnStyle(){
  const style = document.createElement("style");
  style.textContent = `
    .fsBtn{
      position:absolute;
      top:10px; left:10px;
      width:44px; height:44px;
      border-radius:14px;
      border:1px solid rgba(255,255,255,.16);
      background: rgba(0,0,0,.28);
      color:#fff;
      cursor:pointer;
      backdrop-filter: blur(6px);
      z-index:3;
      font-size:20px;
      display:grid;
      place-items:center;
    }
    .fsBtn:hover{ background: rgba(0,0,0,.36); }
    @media (max-width: 600px){
      .fsBtn{ width:48px; height:48px; font-size:22px; }
    }
  `;
  document.head.appendChild(style);
})();

// Lightbox prev/next buttons
if(lbPrev) lbPrev.addEventListener("click", () => { prev(); syncLightboxImage(); });
if(lbNext) lbNext.addEventListener("click", () => { next(); syncLightboxImage(); });

// Close handlers (ปุ่มปิด + backdrop)
document.querySelectorAll("[data-lb-close]").forEach(el => {
  el.addEventListener("click", closeLightbox);
});

// Keyboard inside lightbox
window.addEventListener("keydown", (e) => {
  if(!isLightboxOpen()) return;

  if(e.key === "Escape") closeLightbox();
  if(e.key === "ArrowLeft"){ prev(); syncLightboxImage(); }
  if(e.key === "ArrowRight"){ next(); syncLightboxImage(); }
});

// Swipe inside lightbox (mobile)
let lbStartX = 0;
let lbStartY = 0;
let lbSwiping = false;

if(lbMedia){
  lbMedia.addEventListener("touchstart", (e) => {
    const t = e.touches[0];
    lbStartX = t.clientX;
    lbStartY = t.clientY;
    lbSwiping = true;
  }, { passive: true });

  lbMedia.addEventListener("touchmove", (e) => {
    if(!lbSwiping) return;
    const t = e.touches[0];
    const dx = Math.abs(t.clientX - lbStartX);
    const dy = Math.abs(t.clientY - lbStartY);

    // กัน scroll เมื่อปัดแนวนอน
    if(dx > dy && dx > 10){
      e.preventDefault();
    }
  }, { passive: false });

  lbMedia.addEventListener("touchend", (e) => {
    if(!lbSwiping) return;
    lbSwiping = false;

    const t = e.changedTouches[0];
    const dx = t.clientX - lbStartX;

    if(Math.abs(dx) > 40){
      if(dx < 0){ next(); syncLightboxImage(); }
      else { prev(); syncLightboxImage(); }
    }
  }, { passive: true });
}

document.addEventListener("visibilitychange", () => {
  document.documentElement.classList.toggle(blurClass, document.hidden);
});

window.addEventListener("load", () => {
  initParallax();
  initGallery();
});
