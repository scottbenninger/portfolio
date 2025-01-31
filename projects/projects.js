import { fetchJSON, renderProjects } from '../global.js';

(async function () {
    try {
        console.log("Fetching project data...");

        // Fetch projects data
        const projects = await fetchJSON('../lib/projects.json');
        console.log("Fetched Projects:", projects);

        // Select the projects container and project title element
        const projectsContainer = document.querySelector('.projects');
        const projectsTitle = document.querySelector('.projects-title');

        if (!projectsContainer) {
            console.error("Error: .projects container not found in the DOM.");
            return;
        }

        // If projects exist, render them
        if (projects && projects.length > 0) {
            projects.forEach((project) => {
                renderProjects(project, projectsContainer, 'h2');
            });

            // Update the project count in the title if applicable
            if (projectsTitle) {
                projectsTitle.textContent = `${projects.length} Projects`;
            }
        } else {
            // If no projects, show a message and update count
            projectsContainer.innerHTML = '<p>No projects found.</p>';
            if (projectsTitle) {
                projectsTitle.textContent = `0 Projects`;
            }
        }

        console.log("Projects added to the page!");
    } catch (error) {
        console.error("Error loading projects:", error);
        const projectsContainer = document.querySelector('.projects');
        if (projectsContainer) {
            projectsContainer.innerHTML = '<p>Failed to load projects.</p>';
        }
    }
})();
