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
  

  export async function fetchJSON(url) {
    try {
        const response = await fetch(url);
  
        if (!response.ok) {
            throw new Error(`Failed to fetch projects: ${response.statusText}`);
        }
  
        return await response.json();
    } catch (error) {
        console.error("Error fetching or parsing JSON data:", error);
    }
  }

  export function renderProjects(projects, containerElement, headingLevel = 'h2') {
    if (!containerElement ||!(containerElement instanceof HTMLElement)) {
        console.error("Invalid container element provided");
        return;
    }
  
    // Clear existing content to prevent duplication
    containerElement.innerHTML = '';
  
    // Loop through each project and create an article element
    projects.forEach(project => {
        const article = document.createElement('article');
  
        // Validate project data to handle missing values
        const title = project.title || "Untitled Project";
        const image = project.image || "https://via.placeholder.com/200"; // Placeholder if no image
        const description = project.description || "No description available.";
  
        // Ensure headingLevel is a valid heading tag
        const validHeadingLevels = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
        const headingTag = validHeadingLevels.includes(headingLevel) ? headingLevel : 'h2';
  
        // Populate article with dynamic content
        article.innerHTML = `
            <${headingTag}>${title}</${headingTag}>
            <img src="${image}" alt="${title}" style="width:200px; height:auto;">
            <p>${description}</p>
        `;
  
        // Append the article to the container
        containerElement.appendChild(article);
    });
  }

  



