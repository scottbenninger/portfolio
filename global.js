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
  
  function setColorScheme(colorScheme) {
    document.documentElement.style.setProperty('color-scheme', colorScheme);
    localStorage.colorScheme = colorScheme;
  }
  
  if ('colorScheme' in localStorage) {
    const savedColorScheme = localStorage.colorScheme; 
    setColorScheme(savedColorScheme); 
    themeSwitcher.value = savedColorScheme; 
  }
  
  themeSwitcher.addEventListener('input', (event) => {
    const selectedColorScheme = event.target.value; 
    setColorScheme(selectedColorScheme); 
  });
  
  async function fetchJSON(url) {
    try {
        console.log(`Fetching JSON from: ${url}`);

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Failed to fetch projects: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Parsed JSON data:', data);
        return data;
    } catch (error) {
        console.error('Error fetching or parsing JSON data:', error);
    }
}

async function loadProjects() {
    const projectsContainer = document.querySelector('.projects'); 

    if (!projectsContainer) return; 

    const projects = await fetchJSON('lib/projects.json');

    if (!projects) return; 

    projectsContainer.innerHTML = '';

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

document.addEventListener('DOMContentLoaded', loadProjects);
