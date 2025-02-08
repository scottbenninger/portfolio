import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

let query = ''; // Stores search query
let projects = []; // Global store for projects
let selectedIndex = -1; // No wedge is selected initially


document.addEventListener("DOMContentLoaded", async () => {
    // Fetch projects once and store globally
    projects = await fetchJSON('../lib/projects.json');
    
    if (!projects || !Array.isArray(projects)) {
        console.error("Invalid projects.json format or file not found.");
        return;
    }

    // Select elements
    const projectsContainer = document.querySelector('.projects');
    const projectsTitle = document.querySelector('.projects-title');
    const searchInput = document.querySelector('.searchBar');

    if (!projectsContainer || !projectsTitle || !searchInput) {
        console.error("One or more necessary elements not found.");
        return;
    }

    // Render projects and pie chart on load
    renderProjects(projects, projectsContainer, 'h2');
    projectsTitle.textContent = `${projects.length} Projects`;
    renderPieChart(projects);

    // Search bar functionality
    searchInput.addEventListener('input', (event) => {
        query = event.target.value.toLowerCase();
        let filteredProjects = projects.filter((project) => {
            let values = Object.values(project).join('\n').toLowerCase();
            return values.includes(query);
        });

        renderProjects(filteredProjects, projectsContainer, 'h2');
        renderPieChart(filteredProjects);
    });
});

// Function to render pie chart and legend
function renderPieChart(projectsGiven) {
    // Clear old pie chart and legend
    let svg = d3.select("#projects-plot");
    svg.selectAll("path").remove();
    
    let legend = d3.select('.legend');
    legend.html(""); 

    if (projectsGiven.length === 0) return; // Don't render if no projects

    // Process data for the pie chart
    let rolledData = d3.rollups(
        projectsGiven,
        (v) => v.length,
        (d) => d.year
    );

    let data = rolledData.map(([year, count]) => ({
        value: count,
        label: year.toString()
    }));

    let sliceGenerator = d3.pie().value(d => d.value);
    let arcData = sliceGenerator(data);

    let arcGenerator = d3.arc().innerRadius(0).outerRadius(100);
    let colors = d3.scaleOrdinal(d3.schemeTableau10);

    // Append pie chart slices
    svg.selectAll('path')
    .data(arcData)
    .enter()
    .append('path')
    .attr('d', arcGenerator)
    .attr('fill', (d, idx) => colors(idx))
    .attr('stroke', '#fff')
    .attr('stroke-width', 2)
    .style('cursor', 'pointer') // Make wedges clickable
    .attr('class', (_, idx) => (idx === selectedIndex ? 'selected' : '')) // Highlight selected wedge
    .on('click', (_, idx) => {
        selectedIndex = selectedIndex === idx ? -1 : idx; // Toggle selection
  
        // Update styles for the pie chart
        svg.selectAll('path')
            .attr('class', (_, i) => (i === selectedIndex ? 'selected' : ''));
  
        // Update styles for the legend (Retains original colors)
        legend.selectAll('li')
            .classed('selected', (_, i) => i === selectedIndex);
    });
  

    // Append legend items
    legend.selectAll('li')
    .data(data)
    .enter()
    .append('li')
    .attr('style', (d, idx) => `--color:${colors(idx)}`) // Keeps original colors
    .attr('class', (_, idx) => (idx === selectedIndex ? 'selected' : ''))
    .html(d => `<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`)
    .style('cursor', 'pointer') // Make legend items clickable
    .on('click', (_, idx) => {
        selectedIndex = selectedIndex === idx ? -1 : idx; // Toggle selection
  
        // Update styles for the pie chart
        svg.selectAll('path')
            .attr('class', (_, i) => (i === selectedIndex ? 'selected' : ''));
  
        // Update styles for the legend (Retains original colors)
        legend.selectAll('li')
            .classed('selected', (_, i) => i === selectedIndex);
    });
  
}
