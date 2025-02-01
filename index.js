import { fetchJSON, renderProjects, fetchGitHubData } from './global.js';

async function loadLatestProjects() {
    try {
        const projects = await fetchJSON('./lib/projects.json'); // Use relative path

        if (!projects || projects.length === 0) {
            console.warn("No projects found.");
            return;
        }

        // Select the first 3 projects
        const latestProjects = projects.slice(0, 3);

        // Select the container for latest projects
        const projectsContainer = document.querySelector('.projects');

        if (projectsContainer) {
            renderProjects(latestProjects, projectsContainer, 'h3');
        } else {
            console.error("No container found for latest projects.");
        }
    } catch (error) {
        console.error("Error loading latest projects:", error);
    }
}

async function loadGitHubStats() {
    const githubUsername = "efastovsky"; // Replace with your GitHub username
    const githubData = await fetchGitHubData(githubUsername);

    // Select the container for displaying GitHub stats
    const profileStats = document.querySelector('#profile-stats');

    if (profileStats && githubData) {
        profileStats.innerHTML = `
            <h2>GitHub Stats</h2>
            <dl>
              <dt>Public Repos:</dt><dd>${githubData.public_repos}</dd>
              <dt>Public Gists:</dt><dd>${githubData.public_gists}</dd>
              <dt>Followers:</dt><dd>${githubData.followers}</dd>
              <dt>Following:</dt><dd>${githubData.following}</dd>
            </dl>
        `;
    } else {
        console.error("GitHub data or container not found.");
    }
}

// Run functions to fetch and display data
loadLatestProjects();
loadGitHubStats();