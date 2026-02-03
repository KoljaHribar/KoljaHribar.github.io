/* --- Scroll Reset --- */
if (history.scrollRestoration) {
  history.scrollRestoration = 'manual';
} else {
  window.onbeforeunload = function () { window.scrollTo(0, 0); }
}

/* --- Theme Logic --- */
const toggleBtn = document.getElementById('theme-toggle');
const html = document.documentElement;

// Check local storage or system preference
const savedTheme = localStorage.getItem('theme');
const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
const initialTheme = savedTheme || systemTheme;

// Apply theme
html.setAttribute('data-theme', initialTheme);

toggleBtn.addEventListener('click', () => {
  const currentTheme = html.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
});

/* --- MODAL LOGIC (For Projects) --- */
const modal = document.getElementById('project-modal');
const closeBtn = document.querySelector('.modal-close');
const backdrop = document.querySelector('.modal-backdrop');
// Note: We only attach modal click listeners to project-cards, not experience cards
const projectCards = document.querySelectorAll('.project-card');

const mImg = document.getElementById('modal-img');
const mTitle = document.getElementById('modal-title');
const mDate = document.getElementById('modal-date');
const mSum = document.getElementById('modal-summary');
const mDetails = document.getElementById('modal-details');

function openModal(card) {
  const img = card.querySelector('.card-cover').src;
  const title = card.querySelector('.card-title').textContent;
  const date = card.querySelector('.time').textContent;
  const summary = card.querySelector('.card-summary').textContent;
  const hiddenContent = card.querySelector('.modal-data').innerHTML;

  mImg.src = img;
  mTitle.textContent = title;
  mDate.textContent = date;
  mSum.textContent = summary;
  mDetails.innerHTML = hiddenContent;

  modal.classList.add('active');
  document.body.style.overflow = 'hidden'; 
  modal.setAttribute('aria-hidden', 'false');
}

function closeModal() {
  modal.classList.remove('active');
  document.body.style.overflow = '';
  modal.setAttribute('aria-hidden', 'true');
}

projectCards.forEach(card => {
  card.addEventListener('click', () => openModal(card));
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') openModal(card);
  });
});

closeBtn.addEventListener('click', closeModal);
backdrop.addEventListener('click', closeModal);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
});


/* --- SNAKE / TIMELINE LOGIC (NEW) --- */
// Select ALL cards in the order they appear in the DOM
const allTimelineItems = [
  ...document.querySelectorAll('.project-card'),
  ...document.querySelectorAll('.card.expando')
];

// Loop through them and assign Left/Right based on global index
allTimelineItems.forEach((item, index) => {
  item.classList.add('snake-item');
  
  // Even index = Left (0, 2, 4...)
  // Odd index = Right (1, 3, 5...)
  if (index % 2 === 0) {
    item.classList.add('snake-left');
  } else {
    item.classList.add('snake-right');
  }
});