/* ============================
   1. SCROLL RESET
   ============================ */
if (history.scrollRestoration) {
  history.scrollRestoration = 'manual';
} else {
  window.onbeforeunload = function () {
    window.scrollTo(0, 0);
  }
}

/* ============================
   2. THEME LOGIC
   ============================ */
const toggleBtn = document.getElementById('theme-toggle');
const html = document.documentElement;

const savedTheme = localStorage.getItem('theme');
const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
const initialTheme = savedTheme || systemTheme;

html.setAttribute('data-theme', initialTheme);

if (toggleBtn) {
  toggleBtn.addEventListener('click', () => {
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  });
}

/* ============================
   3. MODAL LOGIC (Projects)
   ============================ */
const modal = document.getElementById('project-modal');
const closeBtn = document.querySelector('.modal-close');
const backdrop = document.querySelector('.modal-backdrop');
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

if (modal) {
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
}

/* ============================
   4. SNAKE / TIMELINE LAYOUT
   ============================ */
// Combine Projects and Experience items into one "timeline" list for layout
const allTimelineItems = [
  ...document.querySelectorAll('.project-card'),
  ...document.querySelectorAll('.card.expando')
];

allTimelineItems.forEach((item, index) => {
  item.classList.add('snake-item');
  // Even index = Left; Odd index = Right
  if (index % 2 === 0) {
    item.classList.add('snake-left');
  } else {
    item.classList.add('snake-right');
  }
});

/* ============================
   5. DISCORD STATUS (Lanyard API)
   ============================ */
const discordStatus = document.getElementById('discord-status');
const statusText = document.getElementById('status-text');
const DISCORD_ID = '800694717557112863'; 

// Smart Link Map
const projectMap = {
  'portfolio_website': '#projects',
  'Crossy-Road-Challenge': 'https://github.com/KoljaHribar/Crossy-Road-with-AI-Challenge',
  'ASL-Translation-Aid': 'https://github.com/JackCarluccio/asl-translation-aid'
};

async function fetchDiscordStatus() {
  if (!discordStatus || !statusText) return;

  try {
    const response = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_ID}`);
    const data = await response.json();

    if (data.success) {
      const kv = data.data;
      const { discord_status, activities } = kv;

      // 1. Reset Colors & Modes
      discordStatus.classList.remove('online', 'idle', 'dnd', 'offline');
      discordStatus.classList.add(discord_status);
      document.body.classList.remove('mode-coding', 'mode-offline');

      // 2. Offline Logic
      if (discord_status === 'offline') {
        statusText.textContent = "Status: Offline";
        document.body.classList.add('mode-offline');
        if (statusText.parentNode.tagName === 'A') statusText.unwrap();
        return;
      }

      let text = "Online";
      let linkUrl = null;
      let isCoding = false;

      if (activities && activities.length > 0) {
        const vscode = activities.find(a => a.name === 'Visual Studio Code' || a.name === 'Code');
        const spotify = kv.listening_to_spotify ? kv.spotify : null;

        if (vscode) {
          isCoding = true;
          let rawText = vscode.state || vscode.details || "VS Code";
          const cleanText = rawText
            .replace(/^Working on |^Editing |^Viewing |^In /g, '') 
            .replace(/:\d+:\d+$/, '') 
            .replace(/ - \d+ problems? found/g, ''); 

          text = `Coding: ${cleanText}`;

          // Check Smart Links
          for (const [key, url] of Object.entries(projectMap)) {
            if (rawText.includes(key)) {
              linkUrl = url;
              break;
            }
          }
        } 
        else if (spotify) {
          text = `Listening: ${spotify.song}`;
        }
      }

      // 3. Apply Background Mode
      if (isCoding) document.body.classList.add('mode-coding');

      // 4. Render Text & Link
      statusText.textContent = `Status: ${text}`;
      const parent = statusText.parentElement;
      
      if (linkUrl) {
        if (parent.tagName === 'A') {
          parent.href = linkUrl;
        } else {
          const anchor = document.createElement('a');
          anchor.href = linkUrl;
          anchor.target = linkUrl.startsWith('#') ? '_self' : '_blank';
          anchor.className = 'status-link';
          anchor.style.textDecoration = 'none';
          anchor.style.color = 'inherit';
          anchor.style.display = 'flex';
          anchor.style.alignItems = 'center';
          anchor.style.gap = '10px';
          
          const dot = discordStatus.querySelector('.status-dot');
          discordStatus.innerHTML = ''; 
          anchor.appendChild(dot);
          anchor.appendChild(statusText);
          discordStatus.appendChild(anchor);
        }
      } 
    }
  } catch (error) {
    console.error('Lanyard Error:', error);
    statusText.textContent = "Status: Offline";
    document.body.classList.add('mode-offline');
  }
}

fetchDiscordStatus();
setInterval(fetchDiscordStatus, 5000);