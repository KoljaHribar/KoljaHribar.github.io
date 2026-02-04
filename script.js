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

async function fetchDiscordStatus() {
  if (!discordStatus || !statusText) return;

  try {
    const response = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_ID}`);
    const data = await response.json();

    if (data.success) {
      const kv = data.data;
      const { discord_status, activities } = kv;

      // 1. Set Status Color
      discordStatus.classList.remove('online', 'idle', 'dnd', 'offline');
      discordStatus.classList.add(discord_status);

      // 2. Offline Check
      if (discord_status === 'offline') {
        statusText.textContent = "Status: Offline";
        return;
      }

      let activityText = "Online";

      if (activities && activities.length > 0) {
        // Find VS Code
        const vscode = activities.find(a => a.name === 'Visual Studio Code' || a.name === 'Code');
        const spotify = kv.listening_to_spotify ? kv.spotify : null;

        if (vscode) {
          // SWAPPED PRIORITY: Your extension puts the file in 'state', not 'details'
          // We grab 'state' ("Working on script.js...") first.
          let rawText = vscode.state || vscode.details || "VS Code";

          // CLEANUP LOGIC:
          // 1. Remove "Working on", "Editing", "In"
          // 2. Remove line numbers at the end (e.g., :101:39)
          // 3. Remove "problems found" noise
          const cleanText = rawText
            .replace(/^Working on |^Editing |^In /g, '') 
            .replace(/:\d+:\d+$/, '') // Regex to strip :10:39 line numbers
            .replace(/ - \d+ problems? found/g, ''); 

          activityText = `Coding -> ${cleanText}`;
        } 
        else if (spotify) {
          activityText = `Listening: ${spotify.song}`;
        } 
        else {
          const game = activities.find(a => a.name !== 'Custom Status');
          if (game) activityText = `Playing: ${game.name}`;
        }
      }

      statusText.textContent = `Status: ${activityText}`;
    }
  } catch (error) {
    console.error('Lanyard Error:', error);
    statusText.textContent = "Status: Offline";
  }
}

fetchDiscordStatus();
setInterval(fetchDiscordStatus, 5000);