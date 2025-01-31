// projects.js (Updated for Correct Functionality)

// Function to fetch JSON data
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

// Function to render projects dynamically
function renderProjects(project, containerElement, headingLevel = 'h2') {
    if (!containerElement) {
        console.error("Invalid container element!");
        return;
    }

    console.log(`Rendering project: ${project.title}`);

    // Validate heading level (only allow h1-h6)
    const validHeadings = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
    const headingTag = validHeadings.includes(headingLevel) ? headingLevel : 'h2';

    const article = document.createElement('article');

    article.innerHTML = `
        <${headingTag}>${project.title || "Untitled Project"}</${headingTag}>
        <img src="${project.image || "https://via.placeholder.com/150"}" alt="${project.title || "Project Image"}">
        <p>${project.description || "No description available."}</p>
    `;

    containerElement.appendChild(article);
}

// Function to load and display projects dynamically
async function loadProjects() {
    const projectsContainer = document.querySelector('.projects');

    if (!projectsContainer) {
        console.error("No .projects container found in the document!");
        return;
    }

    console.log("Fetching project data...");

    const projects = await fetchJSON('../lib/projects.json');

    if (!projects || projects.length === 0) {
        console.warn("No projects found. Displaying placeholder message.");
        projectsContainer.innerHTML = "<p>No projects available at this time.</p>";
        return;
    }

    console.log("Rendering projects...");

    projects.forEach((project) => {
        renderProjects(project, projectsContainer, 'h2');
    });

    console.log("Projects added to the page!");
}

// Run loadProjects() only when on the Projects page
document.addEventListener('DOMContentLoaded', loadProjects);
