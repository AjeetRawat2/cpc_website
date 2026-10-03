// Paste the published Google Forms URLs here when they are ready.
// The RSVP form should include a question asking which event the student is attending.
// The newsletter form should collect email addresses and ask for consent to receive updates.
const GOOGLE_FORM_URLS = {
  rsvp: "",
  newsletter: ""
};

const revealObserver = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); revealObserver.unobserve(entry.target); } }), { threshold: .12 });
document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

const header = document.querySelector('.site-header');
const capsuleToggle = document.querySelector('.capsule-toggle');
const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');
const mobileLayout = window.matchMedia('(max-width: 620px)');
function updateCapsuleOnScroll() {
  const hasScrolled = window.scrollY > 90;
  header.classList.toggle('is-scrolled', hasScrolled);
  if (hasScrolled) {
    if (!header.classList.contains('is-peeked')) {
      header.classList.add('is-collapsed');
      capsuleToggle.setAttribute('aria-expanded', 'false');
      capsuleToggle.setAttribute('aria-label', 'Expand navigation');
    }
  } else {
    header.classList.remove('is-collapsed', 'is-peeked');
    capsuleToggle.setAttribute('aria-expanded', 'true');
    capsuleToggle.setAttribute('aria-label', 'Go to top');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open menu');
    nav.classList.remove('open');
  }
}
window.addEventListener('scroll', updateCapsuleOnScroll, { passive:true });
function collapseCapsule() {
  if (window.scrollY <= 90 || !header.classList.contains('is-peeked')) return;
  header.classList.remove('is-peeked');
  header.classList.add('is-collapsed');
  capsuleToggle.setAttribute('aria-expanded', 'false');
  capsuleToggle.setAttribute('aria-label', 'Expand navigation');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Open menu');
  nav.classList.remove('open');
}
window.addEventListener('wheel', collapseCapsule, { passive:true });
window.addEventListener('touchmove', collapseCapsule, { passive:true });
window.addEventListener('keydown', (event) => {
  if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(event.key)) collapseCapsule();
});
setTimeout(() => { header.classList.remove('nav-boot'); updateCapsuleOnScroll(); }, matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 340);

capsuleToggle.addEventListener('click', () => {
  if (header.classList.contains('is-collapsed')) {
    header.classList.add('is-peeked');
    capsuleToggle.setAttribute('aria-expanded', 'true');
    capsuleToggle.setAttribute('aria-label', 'Go to top');
    if (mobileLayout.matches) {
      menuButton.setAttribute('aria-expanded', 'true');
      menuButton.setAttribute('aria-label', 'Close menu');
      nav.classList.add('open');
    }
  } else {
    window.scrollTo({ top:0, behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }
});

menuButton.addEventListener('click', () => { const open = menuButton.getAttribute('aria-expanded') !== 'true'; menuButton.setAttribute('aria-expanded', String(open)); menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu'); nav.classList.toggle('open', open); });
nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => { menuButton.setAttribute('aria-expanded', 'false'); menuButton.setAttribute('aria-label', 'Open menu'); nav.classList.remove('open'); header.classList.remove('is-peeked'); if (window.scrollY > 90) header.classList.add('is-collapsed'); }));

const memberCarousel = document.querySelector('.member-carousel');
const memberTrack = memberCarousel.querySelector('.member-grid');
const originalMembers = [...memberTrack.children];
originalMembers.forEach((card) => {
  const clone = card.cloneNode(true);
  clone.classList.add('is-visible');
  clone.removeAttribute('id');
  clone.setAttribute('aria-hidden', 'true');
  clone.querySelectorAll('[id]').forEach((element) => element.removeAttribute('id'));
  memberTrack.append(clone);
});

let carouselManuallyPaused = false;
let memberAnimation;
let memberLoopDistance = 0;
let memberLoopDuration = 0;
function setupMemberAnimation() {
  const progress = memberAnimation && memberLoopDuration ? Number(memberAnimation.currentTime || 0) / memberLoopDuration : 0;
  memberAnimation?.cancel();
  memberLoopDistance = memberTrack.children[originalMembers.length].offsetLeft - memberTrack.children[0].offsetLeft;
  if (!memberLoopDistance) return;
  memberLoopDuration = memberLoopDistance / 160 * 1000;
  memberAnimation = memberTrack.animate(
    [{ transform: 'translate3d(0,0,0)' }, { transform: `translate3d(-${memberLoopDistance}px,0,0)` }],
    { duration: memberLoopDuration, iterations: Infinity, easing: 'linear' }
  );
  memberAnimation.currentTime = progress * memberLoopDuration;
  if (carouselManuallyPaused || document.visibilityState !== 'visible') memberAnimation.pause();
}
setupMemberAnimation();
new ResizeObserver(setupMemberAnimation).observe(memberCarousel);
function setMemberAnimationTime(time) {
  const wrappedTime = ((time % memberLoopDuration) + memberLoopDuration) % memberLoopDuration;
  memberAnimation.currentTime = wrappedTime;
}
document.addEventListener('visibilitychange', () => { if (!memberAnimation) return; if (document.hidden) memberAnimation.pause(); else if (!carouselManuallyPaused) memberAnimation.play(); });

let pointerStartX = 0;
let pointerStartTime = 0;
let isDraggingMembers = false;
memberCarousel.addEventListener('pointerdown', (event) => {
  if (event.button !== 0) return;
  isDraggingMembers = true;
  pointerStartX = event.clientX;
  pointerStartTime = Number(memberAnimation.currentTime || 0);
  memberAnimation.pause();
  memberCarousel.classList.add('is-dragging');
  memberCarousel.setPointerCapture(event.pointerId);
});
memberCarousel.addEventListener('pointermove', (event) => {
  if (!isDraggingMembers) return;
  setMemberAnimationTime(pointerStartTime + ((pointerStartX - event.clientX) / memberLoopDistance) * memberLoopDuration);
});
function finishMemberDrag(event) {
  if (!isDraggingMembers) return;
  isDraggingMembers = false;
  memberCarousel.classList.remove('is-dragging');
  if (memberCarousel.hasPointerCapture(event.pointerId)) memberCarousel.releasePointerCapture(event.pointerId);
  if (!carouselManuallyPaused) memberAnimation.play();
}
memberCarousel.addEventListener('pointerup', finishMemberDrag);
memberCarousel.addEventListener('pointercancel', finishMemberDrag);
memberCarousel.addEventListener('wheel', (event) => {
  if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
  event.preventDefault();
  setMemberAnimationTime(Number(memberAnimation.currentTime || 0) + (event.deltaY / memberLoopDistance) * memberLoopDuration);
}, { passive: false });
const carouselToggle = document.querySelector('[data-carousel-toggle]');
carouselToggle.addEventListener('click', () => {
  carouselManuallyPaused = !carouselManuallyPaused;
  carouselToggle.setAttribute('aria-pressed', String(carouselManuallyPaused));
  carouselToggle.setAttribute('aria-label', carouselManuallyPaused ? 'Resume automatic scrolling' : 'Pause automatic scrolling');
  carouselToggle.textContent = carouselManuallyPaused ? '▶' : 'Ⅱ';
  if (carouselManuallyPaused) memberAnimation.pause();
  else memberAnimation.play();
});
document.querySelectorAll('[data-member-direction]').forEach((button) => button.addEventListener('click', () => {
  const firstCard = memberTrack.children[0];
  const distance = firstCard.getBoundingClientRect().width + parseFloat(getComputedStyle(memberTrack).columnGap || getComputedStyle(memberTrack).gap || '0');
  setMemberAnimationTime(Number(memberAnimation.currentTime || 0) + (button.dataset.memberDirection === 'forward' ? distance : -distance) / memberLoopDistance * memberLoopDuration);
  if (!carouselManuallyPaused) memberAnimation.play();
}));

const siteDialogs = ['terms-dialog', 'feedback-dialog'].map((id) => document.getElementById(id));
document.querySelectorAll('[data-open-dialog]').forEach((trigger) => trigger.addEventListener('click', () => {
  const dialog = document.getElementById(trigger.dataset.openDialog);
  if (dialog && !dialog.open) dialog.showModal();
}));
siteDialogs.forEach((dialog) => {
  if (!dialog) return;
  dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
});

const feedbackForm = document.getElementById('feedback-form');
const feedbackStatus = document.getElementById('feedback-status');
feedbackForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const submitButton = feedbackForm.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  feedbackStatus.className = 'feedback-status';
  feedbackStatus.textContent = 'Sending your feedback…';
  try {
    const response = await fetch('https://formsubmit.co/ajax/rawatking76@gmail.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        name: feedbackForm.elements.name.value.trim(),
        email: feedbackForm.elements.email.value.trim(),
        topic: feedbackForm.elements.topic.value,
        message: feedbackForm.elements.message.value.trim(),
        _subject: 'Campus Pulse Club website feedback',
        _template: 'table'
      })
    });
    const result = await response.json();
    if (!response.ok || result.success === false) throw new Error(result.message || 'The feedback service did not accept the message.');
    feedbackStatus.className = 'feedback-status is-success';
    feedbackStatus.textContent = 'Thanks—your feedback has been sent to the CPC team.';
    feedbackForm.reset();
  } catch (error) {
    feedbackStatus.className = 'feedback-status is-error';
    feedbackStatus.textContent = 'We couldn’t send that right now. Please try again or email rawatking76@gmail.com.';
  } finally {
    submitButton.disabled = false;
  }
});

document.querySelectorAll('.google-form-link').forEach((link) => {
  const type = link.dataset.formType;
  const destination = GOOGLE_FORM_URLS[type]?.trim();
  const status = type === 'rsvp'
    ? link.parentElement.querySelector('.event-form-message')
    : document.querySelector('.newsletter-form-message');
  if (destination && /^https:\/\/(forms\.gle|docs\.google\.com)\//i.test(destination)) {
    link.href = destination;
  } else {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      if (status) status.textContent = type === 'newsletter'
        ? 'Email sign-up is being set up. Please check back soon.'
        : 'The RSVP form is being set up. Please check back soon.';
    });
  }
});

const lightbox = document.querySelector('#lightbox');
const galleryItems = [...document.querySelectorAll('.gallery-item')];
const galleryPhotos = [
  ...galleryItems.map((item) => ({ src: item.querySelector('img').src, alt: item.querySelector('img').alt, caption: item.querySelector('span').textContent.replace(/^\d+\s*[—-]\s*/, '') })),
  { src: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1100&q=85', alt: 'University friends gathered on campus', caption: 'BETWEEN CLASSES' },
  { src: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=1100&q=85', alt: 'Students sharing a cheerful moment together', caption: 'GOOD COMPANY' },
  { src: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1100&q=85', alt: 'A university campus alive with student activity', caption: 'CAMPUS DAYS' },
  { src: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1100&q=85', alt: 'Colorful live music and a crowd enjoying a show', caption: 'A LITTLE LOUDER' },
  { src: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1100&q=85', alt: 'Friends enjoying an outdoor music festival', caption: 'NIGHT TO REMEMBER' },
  { src: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=1100&q=85', alt: 'Colorful paint and materials at a creative workshop', caption: 'MADE TOGETHER' },
  { src: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1100&q=85', alt: 'A welcoming shared meal around a table', caption: 'PULL UP A CHAIR' },
  { src: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1100&q=85', alt: 'A team collaborating around a table', caption: 'IDEAS IN MOTION' }
];
const galleryCollection = document.querySelector('#gallery-collection');
const collectionGrid = document.querySelector('#gallery-collection-grid');
function openPhoto(photo) {
  lightbox.querySelector('img').src = photo.src;
  lightbox.querySelector('img').alt = photo.alt;
  lightbox.querySelector('p').textContent = photo.caption;
  lightbox.showModal();
}
galleryItems.forEach((item) => item.addEventListener('click', () => {
  const image = item.querySelector('img');
  openPhoto({ src: image.src, alt: image.alt, caption: item.querySelector('span').textContent });
}));
galleryPhotos.forEach((photo, index) => {
  const tile = document.createElement('button');
  tile.type = 'button';
  tile.className = 'gallery-collection-item';
  tile.setAttribute('aria-label', `View photo: ${photo.alt}`);
  tile.innerHTML = `<img src="${photo.src}" alt="" loading="lazy"><span>${String(index + 1).padStart(2, '0')} — ${photo.caption}</span>`;
  tile.addEventListener('click', () => { galleryCollection.close(); openPhoto(photo); });
  collectionGrid.append(tile);
});
// The shared data-open-dialog handler above opens the complete collection.
galleryCollection.querySelector('.dialog-close').addEventListener('click', () => galleryCollection.close());
galleryCollection.addEventListener('click', (event) => { if (event.target === galleryCollection) galleryCollection.close(); });
function rotateGalleryTile(item, nextIndex) {
  const photo = galleryPhotos[nextIndex];
  const preloader = new Image();
  preloader.onload = () => {
    const image = item.querySelector('img');
    item.classList.add('is-changing');
    window.setTimeout(() => {
      image.src = photo.src;
      image.alt = photo.alt;
      item.setAttribute('aria-label', `Open gallery image: ${photo.alt}`);
      item.querySelector('span').textContent = `${String(Number(item.dataset.gallerySlot) + 1).padStart(2, '0')} — ${photo.caption}`;
      requestAnimationFrame(() => item.classList.remove('is-changing'));
    }, 180);
  };
  preloader.src = photo.src;
}
let galleryRotationStep = 0;
window.setInterval(() => {
  if (document.visibilityState !== 'visible' || galleryCollection.open || lightbox.open) return;
  galleryRotationStep = (galleryRotationStep + 1) % 3;
  galleryItems.forEach((item, slot) => rotateGalleryTile(item, (slot + galleryRotationStep * galleryItems.length) % galleryPhotos.length));
}, 6400);
document.querySelector('.lightbox-close').addEventListener('click', () => lightbox.close());
lightbox.addEventListener('click', (event) => { if (event.target === lightbox) lightbox.close(); });

