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

// Define data for the pie chart (six slices)
let data = [1, 2, 3, 4, 5, 5];

// Define a pie slice generator
let sliceGenerator = d3.pie();

// Generate the start and end angles for the pie slices
let arcData = sliceGenerator(data);

// Create an arc generator for each slice
let arcGenerator = d3.arc()
  .innerRadius(0)
  .outerRadius(50);

// Define a color scale using D3
let colors = d3.scaleOrdinal(d3.schemeTableau10);

// Select the SVG and center the pie chart
let svg = d3.select('svg')
  .attr("width", 200)
  .attr("height", 200)
  .append("g")
  .attr("transform", "translate(50,50)");

// Append each slice as a separate path element in the SVG
svg.selectAll('path')
  .data(arcData)
  .enter()
  .append('path')
  .attr('d', arcGenerator)
  .attr('fill', (d, idx) => colors(idx));
