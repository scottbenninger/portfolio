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

// Function to fetch and display projects from projects.json
fetch('lib/projects.json')
  .then(response => response.json())
  .then(projects => {
    const projectsContainer = document.querySelector('.projects');

    // Loop through the projects and create HTML for each one
    projects.forEach(project => {
      const article = document.createElement('article');

      // Create and append the title
      const h2 = document.createElement('h2');
      h2.textContent = project.title;
      article.appendChild(h2);

      // Create and append the image
      const img = document.createElement('img');
      img.src = project.image;
      img.alt = project.title;
      article.appendChild(img);

      // Create and append the description
      const p = document.createElement('p');
      p.textContent = project.description;
      article.appendChild(p);

      // Append the article to the projects container
      projectsContainer.appendChild(article);
    });
  })
  .catch(error => {
    console.error('Error loading projects data:', error);
  });

