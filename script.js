const pages = [...document.querySelectorAll('.book-page')];
const pageCount = document.querySelector('#pageCount');
const envelope = document.querySelector('#envelope');
const letterbook = document.querySelector('#letterbook');
let activeIndex = 0;
let turning = false;
let heartTimer;

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
  pageCount.innerHTML = `${String(index + 1).padStart(2, '0')} <i></i> 06`;
}

function showPageCelebration(index) {
  pages.forEach((page) => page.classList.remove('celebrate'));
  if (index === 5) {
    pages[index].classList.add('celebrate');
    makeHearts(15);
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
  }, 900);
});

document.addEventListener('keydown', (event) => {
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

