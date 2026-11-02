const pages = [...document.querySelectorAll('.book-page')];
const pageCount = document.querySelector('#pageCount');
const envelope = document.querySelector('#envelope');
const letterbook = document.querySelector('#letterbook');
const photoViewer = document.querySelector('#photoViewer');
const viewerImage = document.querySelector('#viewerImage');
const galleryPhotos = [...document.querySelectorAll('[data-photo] img')];
let activeIndex = 0;
let turning = false;
let heartTimer;
let currentPhoto = 0;
let player;
let playerReady = false;
let currentTrack = 0;
let playbackState = -1;
const tracks = [
  { id: 'lomg3JLjIQc', title: 'SOOBIN’s 숲', artist: 'SOOBIN · Original by Choi Yu Ree', url: 'https://www.youtube.com/watch?v=lomg3JLjIQc' },
  { id: 'gf1p0ASBVNA', title: '나의 봄의 이유', artist: 'SOOBIN · Original by Paul Kim', url: 'https://www.youtube.com/watch?v=gf1p0ASBVNA' },
  { id: 'Vd9QkWsd5p4', title: 'Blue Hour', artist: 'TOMORROW X TOGETHER', url: 'https://www.youtube.com/watch?v=Vd9QkWsd5p4' },
  { id: '-_ZqOBB6dho', title: 'Our Summer', artist: 'TOMORROW X TOGETHER', url: 'https://www.youtube.com/watch?v=-_ZqOBB6dho' }
];

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
  if (index === 7) {
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
  if (activeIndex === 5 && playerReady) player.pauseVideo();
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

function updateTrackSelection(index, autoplay = false) {
  currentTrack = (index + tracks.length) % tracks.length;
  const track = tracks[currentTrack];
  document.querySelector('#playingTitle').textContent = track.title;
  document.querySelector('#playingArtist').textContent = track.artist;
  document.querySelector('#openStream').href = track.url;
  if (playerReady) player.getIframe().title = `Official music video: ${track.title}`;
  document.querySelectorAll('.track-card').forEach((card, cardIndex) => {
    card.classList.toggle('selected', cardIndex === currentTrack);
    card.setAttribute('aria-pressed', String(cardIndex === currentTrack));
  });
  document.querySelector('#playerStatus').textContent = playerReady ? 'Ready to play' : 'Connecting to YouTube…';
  if (playerReady) {
    if (autoplay) player.loadVideoById(track.id);
    else player.cueVideoById(track.id);
  }
}

function onYouTubeIframeAPIReady() {
  player = new YT.Player('youtubePlayer', {
    width: '100%', height: '100%', videoId: tracks[0].id,
    playerVars: { playsinline: 1, rel: 0, controls: 1, autoplay: 0 },
    events: {
      onReady: () => {
        playerReady = true;
        player.cueVideoById(tracks[0].id);
        player.getIframe().title = `Official music video: ${tracks[0].title}`;
        updateTrackSelection(currentTrack, false);
      },
      onStateChange: (event) => {
        playbackState = event.data;
        const playing = event.data === YT.PlayerState.PLAYING;
        document.querySelector('#visualizer').classList.toggle('is-playing', playing);
        document.querySelector('#visualizer').setAttribute('aria-label', playing ? 'Visualizer active while the song plays' : 'Visualizer is idle');
        document.querySelector('#playerStatus').textContent = playing ? 'Playing' : event.data === YT.PlayerState.PAUSED ? 'Paused' : event.data === YT.PlayerState.ENDED ? 'Finished' : 'Ready to play';
        document.querySelector('#playTrack').textContent = playing ? 'Ⅱ' : '▶';
        document.querySelector('#playTrack').setAttribute('aria-label', playing ? 'Pause selected song' : 'Play selected song');
      }
    }
  });
}
window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
document.querySelectorAll('.track-card').forEach((card) => card.addEventListener('click', () => updateTrackSelection(Number(card.dataset.track), playerReady && playbackState === YT.PlayerState.PLAYING)));
document.querySelector('#playTrack').addEventListener('click', () => {
  if (!playerReady) { document.querySelector('#playerStatus').textContent = 'Use “Watch on YouTube” to listen'; return; }
  if (playbackState === YT.PlayerState.PLAYING) player.pauseVideo();
  else player.playVideo();
});
document.querySelector('#previousTrack').addEventListener('click', () => updateTrackSelection(currentTrack - 1, playerReady && playbackState === YT.PlayerState.PLAYING));
document.querySelector('#nextTrack').addEventListener('click', () => updateTrackSelection(currentTrack + 1, playerReady && playbackState === YT.PlayerState.PLAYING));
window.setTimeout(() => {
  if (!playerReady) document.querySelector('#playerStatus').textContent = 'Use “Watch on YouTube” to listen';
}, 9000);

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

