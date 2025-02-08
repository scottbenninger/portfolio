import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";
let query = ''; // Holds search input query


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
  .outerRadius(100); // Increased size for better visibility

// Define data for the pie chart with labels
let allProjects = []; // Store all projects globally

async function loadAndStoreProjects() {
    allProjects = await fetchJSON('../lib/projects.json'); // Fetch once and store globally
    updateProjects(); // Call updateProjects() to initialize the pie chart
}

loadAndStoreProjects(); // ✅ Fetch projects once instead of multiple times



let rolledData = d3.rollups(
    projects, 
    (v) => v.length,  // Count projects per year
    (d) => d.year      // Group by year
);

// Convert to expected format
let data = rolledData.map(([year, count]) => ({
    value: count,
    label: year
}));


// Define a pie slice generator that extracts values
let sliceGenerator = d3.pie().value((d) => d.value);

// Generate the start and end angles for the pie slices
let arcData = sliceGenerator(data);

// Define a color scale using D3
let colors = d3.scaleOrdinal(d3.schemeTableau10);

// Select the SVG and properly size and center it
let svg = d3.select("#projects-plot")
  .attr("viewBox", "-150 -150 300 300") // Ensures proper centering
  .append("g");

// Append each slice as a separate path element in the SVG
svg.selectAll('path')
  .data(arcData)
  .enter()
  .append('path')
  .attr('d', arcGenerator)
  .attr('fill', (d, idx) => colors(idx))
  .attr('stroke', '#fff') // Adds a white stroke for better slice separation
  .attr('stroke-width', 2);

// Select the legend container
let legend = d3.select('.legend').html(""); 


// Append each legend item dynamically
data.forEach((d, idx) => {
    legend.append('li')
        .attr('style', `--color:${colors(idx)}`)
        .attr('class', 'legend-item')
        .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
});

let searchInput = document.querySelector('.searchBar');

searchInput.addEventListener('input', (event) => {
  query = event.target.value.toLowerCase();
  updateProjects(); // Update the pie chart dynamically
});



function updateProjects() {
    let filteredProjects = allProjects.filter((project) =>
        project.title.toLowerCase().includes(query)
    );

    let rolledData = d3.rollups(
        filteredProjects, 
        (v) => v.length,
        (d) => d.year
    );

    let data = rolledData.map(([year, count]) => ({
        value: count,
        label: year
    }));

    // Prevent deletion if no data is found
    if (data.length === 0) {
        return; // ✅ Stops the pie chart from disappearing if no results match
    }

    // Clear and Rebuild Pie Chart
    svg.selectAll("path").remove(); 
    let arcData = sliceGenerator(data);

    svg.selectAll('path')
        .data(arcData)
        .enter()
        .append('path')
        .attr('d', arcGenerator)
        .attr('fill', (d, idx) => colors(idx))
        .attr('stroke', '#fff')
        .attr('stroke-width', 2);

    // Clear and Rebuild Legend
    legend.html(""); 
    data.forEach((d, idx) => {
        legend.append('li')
            .attr('style', `--color:${colors(idx)}`) // ✅ Corrected syntax
            .attr('class', 'legend-item')
            .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`); // ✅ Corrected HTML formatting
    });
}
