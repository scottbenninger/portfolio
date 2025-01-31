import { fetchJSON, renderProjects } from '../global.js';

(async function () {
    try {
        const projects = await fetchJSON('https://andiigonzalez.github.io/portfolio/lib/projects.json');
        console.log("Fetched Projects:", projects);

        const projectsContainer = document.querySelector('.projects');
        const projectsTitle = document.querySelector('.projects-title'); 

        if (!projectsContainer) {
            console.error("Error: .projects container not found in the DOM.");
            return;
        }

        if (projects && projects.length > 0) {
            renderProjects(projects, projectsContainer, 'h2');

            if (projectsTitle) {
                projectsTitle.textContent = `${projects.length} Projects`;
            }
        } else {
            projectsContainer.innerHTML = '<p>No projects found.</p>';
            if (projectsTitle) {
                projectsTitle.textContent = ` 0 Projects`;
            }
        }
    } catch (error) {
        console.error("Error loading projects:", error);
        const projectsContainer = document.querySelector('.projects');
        if (projectsContainer) {
            projectsContainer.innerHTML = '<p>Failed to load projects.</p>';
        }
    }
})();