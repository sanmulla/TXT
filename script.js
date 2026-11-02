const $ = (selector) => document.querySelector(selector);
const sweetReasons = [
  'Your smile could make even the rainiest day feel like spring ♡',
  'You remind me that being gentle is a kind of superpower ✧',
  'The world is a little kinder with you in it ☁',
  'Your laughter is one of my favorite sounds in the whole world ♡',
  'You make hard work look beautiful and kindness feel easy ✿',
  'Somewhere, a MOA is smiling because of you right now ♡',
  'You deserve the same patience and warmth you give to everyone else ☼',
  'Even your quiet presence feels like a little home ✧'
];

function makeFloaties(count = 14, symbols = ['♡', '✦', '✿', '♥']) {
  const layer = $('.floaties');
  if (!layer) return;
  for (let i = 0; i < count; i++) {
    const item = document.createElement('span');
    item.className = 'floaty';
    item.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    item.style.left = `${Math.random() * 100}%`;
    item.style.setProperty('--duration', `${3.8 + Math.random() * 3.8}s`);
    item.style.setProperty('--size', `${12 + Math.random() * 18}px`);
    item.style.setProperty('--float-color', ['#d996a5', '#c6dce4', '#e2bca8', '#d1a8c4'][Math.floor(Math.random() * 4)]);
    layer.appendChild(item);
    item.addEventListener('animationend', () => item.remove(), { once: true });
  }
}

function showToast(message) {
  const toast = $('.toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 2400);
}

// Mobile menu
const menuToggle = $('.menu-toggle');
const nav = $('.main-nav');
menuToggle?.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
});

// Reveal page content as it enters the viewport.
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  }), { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
} else {
  document.querySelectorAll('.reveal').forEach((element) => element.classList.add('visible'));
}

// Hug counter persists between pages in this browser.
let hugs = Number.parseInt(localStorage.getItem('soobin-hugs') || '0', 10);
const count = $('#loveCount');
if (count && hugs > 0) count.textContent = `∞ + ${hugs}`;
$('#hugButton')?.addEventListener('click', () => {
  hugs += 1;
  localStorage.setItem('soobin-hugs', String(hugs));
  if (count) count.textContent = `∞ + ${hugs}`;
  makeFloaties(24, ['♡', '♥', '✧']);
  showToast('a little hug is on its way ♡');
});

$('#reasonButton')?.addEventListener('click', () => {
  const target = $('#surpriseMessage');
  if (target) target.textContent = sweetReasons[Math.floor(Math.random() * sweetReasons.length)];
  makeFloaties(8, ['✧', '♡']);
});
$('#reasonPageButton')?.addEventListener('click', () => {
  const target = $('#reasonPageMessage');
  if (target) target.textContent = sweetReasons[Math.floor(Math.random() * sweetReasons.length)];
  makeFloaties(8, ['✧', '♡']);
});

// Songs open the selected TXT track on YouTube Music; nothing plays automatically.
const songs = [
  { title: 'Blue Hour', search: 'TXT Blue Hour official audio' },
  { title: 'Our Summer', search: 'TXT Our Summer official audio' },
  { title: 'Nap of a Star', search: 'TXT Nap of a Star official audio' },
  { title: "Thursday's Child Has Far To Go", search: "TXT Thursday's Child Has Far To Go official audio" },
  { title: 'Miracle', search: 'TXT Miracle TXT official audio' }
];
let currentTrack = 0;
const trackList = $('#trackList');
function openSong() {
  window.open(`https://music.youtube.com/search?q=${encodeURIComponent(songs[currentTrack].search)}`, '_blank', 'noopener,noreferrer');
}
function renderTracks() {
  if (!trackList) return;
  trackList.replaceChildren();
  songs.forEach((song, index) => {
    const item = document.createElement('li');
    item.className = index === currentTrack ? 'active' : '';
    const label = document.createElement('span');
    const number = document.createElement('small');
    number.textContent = `0${index + 1}`;
    label.append(number, document.createTextNode(`  ${song.title}`));
    const action = document.createElement('span');
    action.textContent = index === currentTrack ? '♡' : '↗';
    item.append(label, action);
    item.addEventListener('click', () => { currentTrack = index; renderTracks(); openSong(); });
    trackList.append(item);
  });
  const title = $('#trackTitle');
  if (title) title.textContent = songs[currentTrack].title;
}
renderTracks();
$('#prevTrack')?.addEventListener('click', () => { currentTrack = (currentTrack + songs.length - 1) % songs.length; renderTracks(); });
$('#nextTrack')?.addEventListener('click', () => { currentTrack = (currentTrack + 1) % songs.length; renderTracks(); });
$('#playTrack')?.addEventListener('click', openSong);

if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  setTimeout(() => makeFloaties(9, ['✧', '♡', '·']), 900);
  setInterval(() => { if (Math.random() > 0.62) makeFloaties(1, ['♡', '✧']); }, 2400);
}

