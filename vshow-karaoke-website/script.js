const heroVideo = document.querySelector("#hero-video-bg");
const heroVideoSource = "https://stream.mux.com/8wrHPCX2dC3msyYU9ObwqNdm00u3ViXvOSHUMRYSEe5Q.m3u8";
const stackCards = Array.from(document.querySelectorAll(".scroll-stack-card"));

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

let ticking = false;
function queueStackUpdate() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    updateScrollStack();
    ticking = false;
  });
}

function updateScrollStack() {
  if (!stackCards.length || window.matchMedia("(max-width: 900px)").matches) {
    stackCards.forEach((card) => {
      card.style.transform = "";
      card.style.filter = "";
      card.style.zIndex = "";
    });
    return;
  }

  const stackTop = 116;
  let topCardIndex = -1;

  stackCards.forEach((card, index) => {
    const rect = card.getBoundingClientRect();
    if (rect.top <= stackTop + index * 28) topCardIndex = index;
  });

  stackCards.forEach((card, index) => {
    const rect = card.getBoundingClientRect();
    const progress = clamp((stackTop + index * 28 - rect.top) / 260, 0, 1);
    const depth = Math.max(0, topCardIndex - index);
    const scale = 1 - progress * 0.035 - depth * 0.025;
    const lift = progress * index * 28;
    const rotation = progress * (index - 1) * 0.75;
    const blur = depth > 0 ? Math.min(depth * 1.4, 3.2) : 0;

    card.style.zIndex = String(10 + index);
    card.style.transform = `translate3d(0, ${lift}px, 0) scale(${scale}) rotate(${rotation}deg)`;
    card.style.filter = blur ? `blur(${blur}px)` : "";
  });
}

function initHeroVideo() {
  if (!heroVideo) return;

  if (window.Hls && window.Hls.isSupported()) {
    const hls = new window.Hls();
    hls.loadSource(heroVideoSource);
    hls.attachMedia(heroVideo);
    hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
      heroVideo.play().catch(() => {});
    });
    return;
  }

  if (heroVideo.canPlayType("application/vnd.apple.mpegurl")) {
    heroVideo.src = heroVideoSource;
    heroVideo.play().catch(() => {});
  }
}

initHeroVideo();
updateScrollStack();
window.addEventListener("scroll", queueStackUpdate, { passive: true });
window.addEventListener("resize", queueStackUpdate);
