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

        // ✅ Step 3: Convert project data into a format for the pie chart
        let rolledData = d3.rollups(
            projects,
            (v) => v.length, // Count projects per year
            (d) => d.year // Group by year
        );

        // Convert into the expected pie chart format
        let data = rolledData.map(([year, count]) => ({
            value: count,
            label: year
        }));

        // Call function to render the pie chart with real data
        renderPieChart(data);

    } catch (error) {
        console.error("Error loading projects:", error);
        document.querySelector('.projects').innerHTML = "<p>Failed to load projects.</p>";
    }
}

loadProjects();

// 🎯 Function to Render Pie Chart with Data
function renderPieChart(data) {
    let svg = d3.select("#projects-plot")
        .attr("width", 450)
        .attr("height", 450)
        .append("g")
        .attr("transform", "translate(225,225)"); // Center pie chart

    let arcGenerator = d3.arc()
        .innerRadius(0)
        .outerRadius(200); // Increased pie chart size

    let sliceGenerator = d3.pie().value((d) => d.value);
    let arcData = sliceGenerator(data);

    let colors = d3.scaleOrdinal(d3.schemeTableau10);

    // Append each slice as a separate path element in the SVG
    svg.selectAll('path')
        .data(arcData)
        .enter()
        .append('path')
        .attr('d', arcGenerator)
        .attr('fill', (d, idx) => colors(idx))
        .attr('stroke', '#fff') // Adds white border
        .attr('stroke-width', 2);

    // Render legend
    let legend = d3.select('.legend').html(""); // Clear previous legend

    data.forEach((d, idx) => {
        legend.append('li')
            .attr('style', `--color:${colors(idx)}`)
            .attr('class', 'legend-item')
            .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
    });
}
