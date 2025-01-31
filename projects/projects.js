import { fetchJSON, renderProjects } from '../global.js';

document.addEventListener('DOMContentLoaded', async () => {
    const projectsContainer = document.querySelector('.projects');

    if (!projectsContainer) {
        console.error("No .projects container found in the document!");
        return;
    }

    console.log("Fetching project data...");

    const projects = await fetchJSON('../projects/lib/projects.json');

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
});
