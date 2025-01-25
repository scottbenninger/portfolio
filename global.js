// Log confirmation message
console.log('IT’S ALIVE!');

// Utility function to select multiple elements
function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

// Find all nav links
const navLinks = $$("nav a");
let currentLink = navLinks.find(
  (a) => a.host === location.host && a.pathname === location.pathname
);
currentLink?.classList.add("current");

// Pages for the navigation menu
const pages = [
  { url: '', title: 'Home' },
  { url: 'projects/', title: 'Projects' },
  { url: 'contact/', title: 'Contact' },
  { url: 'https://github.com/scottbenninger', title: 'GitHub' }
];

// Check if we are on the home page
const ARE_WE_HOME = document.documentElement.classList.contains('home');

// Create and prepend the navigation menu
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

// Add dark mode switch to the page
document.body.insertAdjacentHTML(
  'afterbegin',
  `
  <label class="color-scheme">
    Theme:
    <select id="theme-switch">
      <option value="light dark">Automatic</option>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
    </select>
  </label>
`);

// Function to apply the color scheme
function setColorScheme(colorScheme) {
  document.documentElement.style.setProperty('color-scheme', colorScheme);
  localStorage.colorScheme = colorScheme; // Save preference
}

// Reference to the theme dropdown
const themeSwitch = document.querySelector('#theme-switch');

// Event listener for dropdown changes
themeSwitch.addEventListener('input', (event) => {
  const colorScheme = event.target.value;
  setColorScheme(colorScheme); // Apply and save the selected theme
});

// On page load, read and apply saved color scheme
if ('colorScheme' in localStorage) {
  const savedScheme = localStorage.colorScheme;
  setColorScheme(savedScheme); // Apply the saved theme
  themeSwitch.value = savedScheme; // Sync dropdown
} else {
  // Default to automatic if no preference is saved
  setColorScheme('light dark');
  themeSwitch.value = 'light dark';
}
