const qs = (s, el=document) => el.querySelector(s);
const qsa = (s, el=document) => [...el.querySelectorAll(s)];

function smoothScrollTo(id){
  const el = document.getElementById(id);
  if(!el) return;
  const y = el.getBoundingClientRect().top + window.scrollY - 92;
  window.scrollTo({ top: y, behavior: "smooth" });
}

// Parallax background
// Parallax background (smooth)
const heroBg = document.querySelector(".hero__bg");
let ticking = false;

function onScrollParallax() {
  if (!heroBg) return;
  const y = window.scrollY || 0;
  heroBg.style.transform = `translate3d(0, ${y * 0.12}px, 0) scale(1.05)`;
  ticking = false;
}

window.addEventListener(
  "scroll", () => {
    if (!ticking) {
      requestAnimationFrame(onScrollParallax);
      ticking = true;
    }
  },
  { passive: true }
);

onScrollParallax();

// Reveal on scroll
const io = new IntersectionObserver((entries) => {
  for (const e of entries){
    if(e.isIntersecting){
      e.target.classList.add("is-in");
      io.unobserve(e.target);
    }
  }
}, { threshold: 0.18 });

qsa(".reveal").forEach(el => io.observe(el));

// Nav active
const navBtns = qsa(".nav__btn");
function setActive(target){
  navBtns.forEach(b => b.classList.toggle("is-active", b.dataset.target === target));
}

navBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    setActive(btn.dataset.target);
    smoothScrollTo("cards");
    // เลือกแล้วให้ highlight การ์ดด้วย (นิดหน่อย)
    const room = btn.dataset.target;
    const card = qs(`.card[data-room="${room}"]`);
    if(card){
      card.animate([
        { transform: "translateY(0)" },
        { transform: "translateY(-8px)" },
        { transform: "translateY(0)" }
      ], { duration: 520, easing: "cubic-bezier(.2,.9,.2,1)" });
    }
  });
});

// CTA
qsa("[data-scroll]").forEach(btn => {
  btn.addEventListener("click", () => smoothScrollTo(btn.dataset.scroll));
});

// Card click -> go to room page
qsa(".card").forEach(card => {
  const room = card.dataset.room;

  const go = () => {
    document.body.style.opacity = "0.92";
setTimeout(() => {
  window.location.href = `room.html?type=${encodeURIComponent(room)}`;
}, 90);
  };

  card.addEventListener("click", go);
  card.addEventListener("keydown", (e) => {
    if(e.key === "Enter" || e.key === " "){
      e.preventDefault();
      go();
    }
  });
});

document.addEventListener("visibilitychange", () => {
  document.documentElement.classList.toggle(blurClass, document.hidden);
});
