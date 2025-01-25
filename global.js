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
  
  // Reference to the theme switcher dropdown
  const themeSwitcher = document.querySelector('#theme-switcher');
  
  // Function to set the color scheme
  function setColorScheme(colorScheme) {
    document.documentElement.style.setProperty('color-scheme', colorScheme); // Apply theme
    localStorage.colorScheme = colorScheme; // Save theme to localStorage
  }
  
  // Load the saved theme from localStorage when the page loads
  if ('colorScheme' in localStorage) {
    const savedColorScheme = localStorage.colorScheme; // Retrieve saved theme
    setColorScheme(savedColorScheme); // Apply saved theme
    themeSwitcher.value = savedColorScheme; // Update dropdown to match saved theme
  }
  
  // Add event listener to the dropdown to save and apply the selected theme
  themeSwitcher.addEventListener('input', (event) => {
    const selectedColorScheme = event.target.value; // Get the selected theme
    setColorScheme(selectedColorScheme); // Apply and save the theme
  });
  