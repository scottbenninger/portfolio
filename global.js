console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

// Navigation links logic
const navLinks = $$("nav a");
let currentLink = navLinks.find(
  (a) => a.host === location.host && a.pathname === location.pathname
);

currentLink?.classList.add("current");

const pages = [
  { url: '', title: 'Home' },
  { url: 'projects/', title: 'Projects' },
  { url: 'contact/', title: 'Contact' },
  { url: 'https://github.com/scottbenninger', title: 'GitHub' },
];

const ARE_WE_HOME = document.documentElement.classList.contains('home');

const nav = document.createElement('nav');
document.body.prepend(nav);

for (let p of pages) {
  let url = p.url;
  let title = p.title;
  url = !ARE_WE_HOME && !url.startsWith('http') ? '../' + url : url;
  let a = document.createElement('a');
  a.href = url;
  a.textContent = title;
  if (a.host === location.host && a.pathname === location.pathname) {
    a.classList.add('current');
  }
  if (a.host !== location.host) {
    a.target = '_blank';
  }
  nav.append(a);
}

// Add the theme switcher dropdown to the page
document.body.insertAdjacentHTML(
    'afterbegin',
    `
      <label class="color-scheme">
        Theme:
        <select id="theme-switcher">
          <option value="light dark">Automatic</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </label>
    `
  );
  
  // Reference the theme switcher dropdown
  const themeSwitcher = document.querySelector('#theme-switcher');
  
  // Function to apply the theme
  function applyTheme(theme) {
    document.documentElement.style.setProperty('color-scheme', theme);
  }
  
  // Function to load the saved theme or default
  function loadTheme() {
    const savedTheme = localStorage.getItem('colorScheme') || 'light dark';
    applyTheme(savedTheme);
    themeSwitcher.value = savedTheme; // Sync dropdown with saved theme
  }
  
  // Apply the saved theme when the page loads
  loadTheme();
  
  // Save and apply theme whenever the user changes it
  themeSwitcher.addEventListener('input', (event) => {
    const selectedTheme = event.target.value;
    applyTheme(selectedTheme);
    localStorage.setItem('colorScheme', selectedTheme); // Save preference
  });
  