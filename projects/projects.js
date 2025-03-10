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
    
        // Apply year filter if a pie slice is selected
        if (selectedIndex !== -1) {
            let selectedYear = data[selectedIndex].label;
            filteredProjects = filteredProjects.filter(project => project.year.toString() === selectedYear);
        }
    
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
    // Append pie chart slices with click event for selection
    svg.selectAll("path")
    .data(arcData)
    .enter()
    .append("path")
    .attr("d", arcGenerator)
    .attr("fill", (d, idx) => colors(idx))
    .attr("stroke", "#fff")
    .attr("stroke-width", 2)
    .attr("class", (d, idx) => idx === selectedIndex ? "selected" : "")
    .on("click", (event, d) => {
        // Toggle selection
        selectedIndex = selectedIndex === d.index ? -1 : d.index;
    
        // Re-render pie chart and legend
        renderPieChart(projectsGiven);
    
        // Get currently active search query
        let filteredProjects = projects;
    
        if (query) {
            filteredProjects = filteredProjects.filter(project => {
                let values = Object.values(project).join('\n').toLowerCase();
                return values.includes(query);
            });
        }
    
        // Apply year filter if a wedge is selected
        if (selectedIndex !== -1) {
            let selectedYear = data[selectedIndex].label;
            filteredProjects = filteredProjects.filter(project => project.year.toString() === selectedYear);
        }
    
        // Render the final filtered projects
        renderProjects(filteredProjects, document.querySelector('.projects'), 'h2');
    });
    
    


    // Append legend items
    legend.selectAll("li")
    .data(data)
    .enter()
    .append("li")
    .attr("style", (d, idx) => `--color:${colors(idx)}`)
    .attr("class", (d, idx) => `legend-item ${idx === selectedIndex ? "selected" : ""}`)
    .html(d => `<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`)
    .on("click", (event, d) => {
        // Toggle selection
        selectedIndex = selectedIndex === d.index ? -1 : d.index;
    
        // Re-render pie chart and legend
        renderPieChart(projectsGiven);
    
        // Apply project filtering based on the selected wedge
        if (selectedIndex === -1) {
            renderProjects(projects, document.querySelector('.projects'), 'h2');
        } else {
            let selectedYear = data[selectedIndex].label;
            let filteredProjects = projects.filter(project => project.year.toString() === selectedYear);
            renderProjects(filteredProjects, document.querySelector('.projects'), 'h2');
        }
    });
    
}
