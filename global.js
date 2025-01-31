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
  { url: 'resume/', title: 'Resume' },
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

const themeSwitcher = document.querySelector('#theme-switcher');

// Function to apply the color scheme
function setColorScheme(colorScheme) {
  document.documentElement.style.setProperty('color-scheme', colorScheme);
  localStorage.colorScheme = colorScheme;
}

// Check for saved color scheme in localStorage or set default
if ('colorScheme' in localStorage) {
  const savedColorScheme = localStorage.colorScheme;
  setColorScheme(savedColorScheme);
  themeSwitcher.value = savedColorScheme;
} else {
  // If no theme is stored, check system preference and set accordingly
  const systemPreferred = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  setColorScheme(systemPreferred);
  themeSwitcher.value = systemPreferred;
}

// Switch theme on user selection
themeSwitcher.addEventListener('input', (event) => {
  const selectedColorScheme = event.target.value;
  setColorScheme(selectedColorScheme);
});






// projects

async function fetchJSON(url) {
  try {
      console.log(`Fetching JSON from: ${url}`);

      // Fetch the JSON file
      const response = await fetch(url);

      // Check if the fetch was successful
      if (!response.ok) {
          throw new Error(`Failed to fetch projects: ${response.statusText}`);
      }

      // Parse and return the JSON data
      const data = await response.json();
      console.log('Parsed JSON data:', data);
      return data;
  } catch (error) {
      console.error('Error fetching or parsing JSON data:', error);
  }
}

// Function to render projects on the Projects page
async function loadProjects() {
  const projectsContainer = document.querySelector('.projects'); // The div where projects go

  if (!projectsContainer) return; // Exit if not on the Projects page

  const projects = await fetchJSON('lib/projects.json');

  if (!projects) return; // Exit if fetch failed

  // Clear the container before adding projects
  projectsContainer.innerHTML = '';

  // Loop through projects and add them to the page
  projects.forEach((project) => {
      const article = document.createElement('article');

      article.innerHTML = `
          <h2>${project.title}</h2>
          <img src="${project.image}" alt="${project.title}">
          <p>${project.description}</p>
      `;

      projectsContainer.appendChild(article);
  });
}

// Run loadProjects() only when on the Projects page
document.addEventListener('DOMContentLoaded', loadProjects);
