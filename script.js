const pages = [...document.querySelectorAll('.book-page')];
const pageCount = document.querySelector('#pageCount');
const envelope = document.querySelector('#envelope');
const letterbook = document.querySelector('#letterbook');
const photoViewer = document.querySelector('#photoViewer');
const viewerImage = document.querySelector('#viewerImage');
const galleryPhotos = [...document.querySelectorAll('[data-photo] img')];
const musicToggle = document.querySelector('#musicToggle');
let activeIndex = 0;
let turning = false;
let heartTimer;
let currentPhoto = 0;
let audioContext;
let musicMaster;

function makeHearts(amount = 8) {
  const layer = document.querySelector('#floatingHearts');
  const symbols = ['♡', '♥', '✧', '✿'];
  for (let i = 0; i < amount; i++) {
    const heart = document.createElement('span');
    heart.className = `floating-heart${Math.random() > .68 ? ' spark' : ''}`;
    heart.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    heart.style.left = `${Math.random() * 100}%`;
    heart.style.fontSize = `${12 + Math.random() * 15}px`;
    heart.style.setProperty('--duration', `${4 + Math.random() * 3}s`);
    layer.append(heart);
    heart.addEventListener('animationend', () => heart.remove(), { once: true });
  }
}

function updatePageNumber(index) {
  pageCount.innerHTML = `${String(index + 1).padStart(2, '0')} <i></i> ${String(pages.length).padStart(2, '0')}`;
}

function showPageCelebration(index) {
  pages.forEach((page) => page.classList.remove('celebrate'));
  if (index === 6) {
    pages[index].classList.add('celebrate');
    makeHearts(16);
  } else if (index === 2) {
    makeHearts(5);
  }
}

function turnTo(nextIndex, direction = 'next') {
  if (turning || nextIndex < 0 || nextIndex >= pages.length || nextIndex === activeIndex) return;
  turning = true;
  const current = pages[activeIndex];
  const next = pages[nextIndex];
  const forward = direction === 'next';
  letterbook.classList.toggle('is-gallery', nextIndex === 3);
  current.classList.add(forward ? 'flip-out-next' : 'flip-out-prev');
  next.hidden = false;
  next.setAttribute('aria-hidden', 'false');
  next.classList.add('active', forward ? 'flip-in-next' : 'flip-in-prev');
  next.style.zIndex = '4';
  current.style.zIndex = '5';

  window.setTimeout(() => {
    current.classList.remove('active', 'flip-out-next', 'flip-out-prev');
    current.hidden = true;
    current.setAttribute('aria-hidden', 'true');
    current.style.zIndex = '';
    next.classList.remove('flip-in-next', 'flip-in-prev');
    next.style.zIndex = '';
    activeIndex = nextIndex;
    turning = false;
    updatePageNumber(activeIndex);
    showPageCelebration(activeIndex);
    if (activeIndex === 0) envelope.classList.remove('open');
  }, 730);
}

document.querySelector('#openLetter').addEventListener('click', () => {
  if (turning || activeIndex !== 0) return;
  envelope.classList.add('open');
  makeHearts(10);
  window.setTimeout(() => turnTo(1, 'next'), 590);
});

document.querySelectorAll('[data-next]').forEach((button) => {
  button.addEventListener('click', () => turnTo(activeIndex + 1, 'next'));
});
document.querySelectorAll('[data-prev]').forEach((button) => {
  button.addEventListener('click', () => turnTo(activeIndex - 1, 'prev'));
});

document.querySelector('#readAgain').addEventListener('click', () => {
  if (turning) return;
  letterbook.classList.add('is-shutting');
  makeHearts(12);
  window.setTimeout(() => {
    letterbook.classList.remove('is-shutting');
    turnTo(0, 'prev');
  }, 1150);
});

function showPhoto(index) {
  currentPhoto = (index + galleryPhotos.length) % galleryPhotos.length;
  const source = galleryPhotos[currentPhoto];
  viewerImage.src = source.src;
  viewerImage.alt = source.alt;
}

function openPhoto(index) {
  showPhoto(index);
  photoViewer.hidden = false;
  photoViewer.setAttribute('aria-hidden', 'false');
  requestAnimationFrame(() => photoViewer.classList.add('is-open'));
}

function closePhoto() {
  photoViewer.classList.remove('is-open');
  photoViewer.setAttribute('aria-hidden', 'true');
  window.setTimeout(() => { photoViewer.hidden = true; }, 350);
}

document.querySelectorAll('[data-photo]').forEach((button) => {
  button.addEventListener('click', () => openPhoto(Number(button.dataset.photo)));
});
document.querySelector('#viewerClose').addEventListener('click', closePhoto);
document.querySelector('#viewerPrev').addEventListener('click', () => showPhoto(currentPhoto - 1));
document.querySelector('#viewerNext').addEventListener('click', () => showPhoto(currentPhoto + 1));
photoViewer.addEventListener('click', (event) => { if (event.target === photoViewer) closePhoto(); });

function createMusic() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return false;
  if (!audioContext) {
    audioContext = new AudioContextClass();
    musicMaster = audioContext.createGain();
    musicMaster.gain.value = 0;
    musicMaster.connect(audioContext.destination);
    [261.63, 329.63, 392].forEach((frequency, index) => {
      const oscillator = audioContext.createOscillator();
      const voice = audioContext.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;
      voice.gain.value = index === 0 ? .32 : .2;
      oscillator.connect(voice);
      voice.connect(musicMaster);
      oscillator.start();
    });
  }
  if (audioContext.state === 'suspended') audioContext.resume();
  return true;
}

musicToggle.addEventListener('click', () => {
  const isPlaying = musicToggle.getAttribute('aria-pressed') === 'true';
  if (!createMusic()) {
    musicToggle.setAttribute('aria-label', 'Background music is unavailable in this browser');
    return;
  }
  const shouldPlay = !isPlaying;
  musicMaster.gain.cancelScheduledValues(audioContext.currentTime);
  musicMaster.gain.setTargetAtTime(shouldPlay ? .045 : 0, audioContext.currentTime, shouldPlay ? 1.1 : .25);
  musicToggle.setAttribute('aria-pressed', String(shouldPlay));
  musicToggle.setAttribute('aria-label', shouldPlay ? 'Mute background music' : 'Enable background music');
  musicToggle.setAttribute('title', shouldPlay ? 'Mute background music' : 'Enable background music');
  musicToggle.textContent = shouldPlay ? '♫' : '♩';
});

document.addEventListener('keydown', (event) => {
  if (!photoViewer.hidden) {
    if (event.key === 'Escape') closePhoto();
    else if (event.key === 'ArrowRight') showPhoto(currentPhoto + 1);
    else if (event.key === 'ArrowLeft') showPhoto(currentPhoto - 1);
    return;
  }
  if (event.key === 'ArrowRight' && activeIndex === 0) document.querySelector('#openLetter').click();
  else if (event.key === 'ArrowRight') turnTo(activeIndex + 1, 'next');
  else if (event.key === 'ArrowLeft') turnTo(activeIndex - 1, 'prev');
});

if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  makeHearts(7);
  heartTimer = window.setInterval(() => {
    if (activeIndex === 2 && !turning) makeHearts(1);
  }, 1800);
}

