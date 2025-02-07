import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

async function loadProjects() {
    try {
        const projects = await fetchJSON('../lib/projects.json');

        if (!projects || !Array.isArray(projects)) {
            throw new Error("Invalid projects.json format or file not found.");
        }

        // Select elements
        const projectsContainer = document.querySelector('.projects');
        const projectCountElement = document.getElementById("project-count");

        // If projects exist, render them
        if (projectsContainer && projects.length > 0) {
            renderProjects(projects, projectsContainer, 'h2');
            projectCountElement.textContent = projects.length; // Update project count
        } else {
            projectsContainer.innerHTML = "<p>No projects available at the moment.</p>";
            projectCountElement.textContent = 0;
        }
    } catch (error) {
        console.error("Error loading projects:", error);
        document.querySelector('.projects').innerHTML = "<p>Failed to load projects.</p>";
    }
}

loadProjects();

// Create an arc generator
let arcGenerator = d3.arc()
  .innerRadius(0)
  .outerRadius(50);

// Generate the arc path for a full circle
let arc = arcGenerator({
  startAngle: 0,
  endAngle: 2 * Math.PI,
});

// Append the arc as a path inside the existing SVG
d3.select('svg')
  .append('path')
  .attr('d', arc)
  .attr('fill', 'red');

  // Define data for the pie chart (two slices: 33% and 66%)
let data = [1, 2];

// Define a pie slice generator
let sliceGenerator = d3.pie();

// Generate the start and end angles for the pie slices
let arcData = sliceGenerator(data);

// Convert each slice into an SVG path
let arcs = arcData.map((d) => arcGenerator(d));

// Define colors for the slices
let colors = ['gold', 'purple'];

// Append each slice as a separate path element in the SVG
arcs.forEach((arc, idx) => {
    d3.select('svg')
      .append('path')
      .attr('d', arc)
      .attr('fill', colors[idx]); // Assign a color to each slice
});
