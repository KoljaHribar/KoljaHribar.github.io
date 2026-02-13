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
   2. THEME LOGIC (Dark/Light Mode)
   ============================ */
const toggleBtn = document.getElementById('theme-toggle');
const html = document.documentElement;

// Check local storage or system preference
const savedTheme = localStorage.getItem('theme');
const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
const initialTheme = savedTheme || systemTheme;

// Apply theme
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
   3. DISCORD STATUS (Lanyard API)
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
        if (statusText.parentNode.tagName === 'A') {
           // Unwrap if it was a link
           const parent = statusText.parentNode;
           const wrapper = parent.parentNode;
           wrapper.appendChild(statusText.previousElementSibling); // dot
           wrapper.appendChild(statusText); 
           parent.remove();
        }
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
          // Create Link Wrapper
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