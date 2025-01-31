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

// ======= FETCH AND RENDER PROJECTS ======= //

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

// Function to render projects dynamically
function renderProjects(project, containerElement, headingLevel = 'h2') {
    if (!containerElement) {
        console.error("Invalid container element!");
        return;
    }

    containerElement.innerHTML = ''; // Clears the container

    // Validate heading level (only allow h1-h6)
    const validHeadings = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
    const headingTag = validHeadings.includes(headingLevel) ? headingLevel : 'h2';

    const article = document.createElement('article'); // Creates new project container

    article.innerHTML = `
        <${headingTag}>${project.title || "Untitled Project"}</${headingTag}>
        <img src="${project.image || "https://via.placeholder.com/150"}" alt="${project.title || "Project Image"}">
        <p>${project.description || "No description available."}</p>
    `;

    containerElement.appendChild(article); // Adds project to the page
}

async function loadProjects() {
  const projectsContainer = document.querySelector('.projects'); // Get projects section

  if (!projectsContainer) {
      console.error("No .projects container found in the document!");
      return;
  }

  console.log("Projects container found:", projectsContainer); // Debugging log

  const projects = await fetchJSON('lib/projects.json');

  if (!projects) {
      console.error("No projects found in JSON data!");
      return;
  }

  console.log("Rendering projects..."); // Debugging log

  // Clear the container ONCE before looping
  projectsContainer.innerHTML = '';

  projects.forEach((project) => {
      renderProjects(project, projectsContainer); // Call function to render each project
  });

  console.log("Projects added to the page!"); // Debugging log
}
