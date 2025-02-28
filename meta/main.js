// Global variables
let data = [];
let commits = [];
let selectedCommits = [];
let brushSelection = null;
let xScale, yScale; // Ensure scales are globally accessible


// Function to load CSV data
async function loadData() {
  console.log("Loading CSV...");
  data = await d3.csv("loc.csv", (row) => ({
    ...row,
    line: Number(row.line),
    depth: Number(row.depth),
    length: Number(row.length),
    date: new Date(row.date + "T00:00" + row.timezone),
    datetime: new Date(row.datetime),
    file: row.file, // Ensure file property exists
  }));

  console.log("CSV loaded:", data.length, "entries");

  displayStats(); // Compute and display stats
}

// Function to display stats
function displayStats() {
  processCommits();

  const dl = d3.select("#stats").append("dl").attr("class", "stats");

  dl.append("dt").html("Total <abbr title='Lines of Code'>LOC</abbr>");
  dl.append("dd").text(data.length);

  dl.append("dt").text("Total commits");
  dl.append("dd").text(commits.length);

  const numFiles = d3.group(data, (d) => d.file).size;
  const maxFileLength = d3.max(data, (d) => d.line);
  const avgFileLength = d3.mean(
    d3.rollups(data, (v) => d3.max(v, (d) => d.line), (d) => d.file),
    (d) => d[1]
  );

  dl.append("dt").text("Number of files");
  dl.append("dd").text(numFiles);

  dl.append("dt").text("Longest file (in lines)");
  dl.append("dd").text(maxFileLength);

  dl.append("dt").text("Average file length (in lines)");
  dl.append("dd").text(Math.round(avgFileLength));

  console.log("Displayed stats on page.");
}

// Function to process commit data
function processCommits() {
  commits = d3
    .groups(data, (d) => d.commit)
    .map(([commit, lines]) => {
      let first = lines[0];
      let { author, date, time, timezone, datetime } = first;

      let ret = {
        id: commit,
        url: "https://github.com/scottbenninger/commit/" + commit,
        author,
        date,
        time,
        timezone,
        datetime,
        hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
        totalLines: lines.length,
      };

      Object.defineProperty(ret, "lines", {
        value: lines,
        enumerable: false,
        writable: false,
        configurable: false,
      });

      return ret;
    });

  window.commits = commits;
  console.log("Commits array processed:", commits);
}

function updateTooltipVisibility(isVisible) {
  const tooltip = document.getElementById("commit-tooltip");
  tooltip.hidden = !isVisible;
}


function updateTooltipContent(commit, event) {
  const tooltip = document.getElementById("commit-tooltip");
  const link = document.getElementById("commit-link");
  const date = document.getElementById("commit-date");
  const time = document.getElementById("commit-time");
  const author = document.getElementById("commit-author");
  const lines = document.getElementById("commit-lines");

  if (Object.keys(commit).length === 0) {
    updateTooltipVisibility(false);
    return;
  }
  updateTooltipVisibility(true);
  

  link.href = commit.url;
  link.textContent = commit.id;
  date.textContent = commit.datetime?.toLocaleDateString("en", { dateStyle: "full" });
  time.textContent = commit.datetime?.toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" });
  author.textContent = commit.author;
  lines.textContent = commit.totalLines;

  // Position tooltip near the mouse pointer
  tooltip.style.top = `${event.clientY + 10}px`;
  tooltip.style.left = `${event.clientX + 10}px`;
  tooltip.classList.add("visible");
}

function updateTooltipPosition(event) {
  const tooltip = document.getElementById("commit-tooltip");
  tooltip.style.top = `${event.clientY + 15}px`;
  tooltip.style.left = `${event.clientX + 15}px`;
}

function brushed(event) {
  brushSelection = event.selection;
  selectedCommits = brushSelection
    ? commits.filter(isCommitSelected)
    : [];
  updateSelection();
}


function isCommitSelected(commit) {
  if (!brushSelection) return selectedCommits.includes(commit);

  const [[x0, y0], [x1, y1]] = brushSelection;
  const commitX = xScale(commit.datetime);
  const commitY = yScale(commit.hourFrac);

  return commitX >= x0 && commitX <= x1 && commitY >= y0 && commitY <= y1;
}


function updateSelection() {
  d3.selectAll("circle").classed("selected", (d) => isCommitSelected(d));

  const countElement = document.getElementById("selection-count");
  countElement.textContent = `${
    selectedCommits.length || "No"
  } commits selected`;

  updateLanguageBreakdown();
}


function updateSelectionCount() {
  const selectedCommits = brushSelection ? commits.filter(isCommitSelected) : [];
  
  const countElement = document.getElementById("selection-count");
  countElement.textContent = `${
    selectedCommits.length || "No"
  } commits selected`;

  return selectedCommits;
}

function updateLanguageBreakdown() {
  const selectedCommits = brushSelection ? commits.filter(isCommitSelected) : [];
  const container = document.getElementById("language-breakdown");

  if (selectedCommits.length === 0) {
    container.innerHTML = "";
    return;
  }

  const requiredCommits = selectedCommits.length ? selectedCommits : commits;
  const lines = requiredCommits.flatMap((d) => d.lines);

  const breakdown = d3.rollup(
    lines,
    (v) => v.length,
    (d) => d.type
  );

  container.innerHTML = "";

  for (const [language, count] of breakdown) {
    const proportion = count / lines.length;
    const formatted = d3.format(".1~%")(proportion);

    container.innerHTML += `
      <dt>${language}</dt>
      <dd>${count} lines (${formatted})</dd>
    `;
  }

  return breakdown;
}

// Function to create scatterplot
function createScatterplot() {
  console.log("Creating scatterplot...");

  // Define dimensions & margins
  const width = 750;
  const height = 450;
  const margin = { top: 10, right: 10, bottom: 30, left: 50 };

  // Define usable area
  const usableArea = {
    top: margin.top,
    right: width - margin.right,
    bottom: height - margin.bottom,
    left: margin.left,
    width: width - margin.left - margin.right,
    height: height - margin.top - margin.bottom,
  };

  // Create SVG
  const svg = d3
    .select("#chart")
    .append("svg")
    .attr("width", "100%")  // Make it responsive
    .attr("height", height)
    .attr("viewBox", `0 0 ${width} ${height}`)
    .style("max-width", "none")
    .style("overflow", "visible");

  // Define scales
  xScale = d3
    .scaleTime()
    .domain(d3.extent(commits, (d) => d.datetime))
    .range([usableArea.left, usableArea.right])
    .nice();

  yScale = d3
    .scaleLinear()
    .domain([0, 24])
    .range([usableArea.bottom, usableArea.top]);

  // Add gridlines BEFORE the axes
  const gridlines = svg
    .append("g")
    .attr("class", "gridlines")
    .attr("transform", `translate(${usableArea.left}, 0)`);

  gridlines.call(d3.axisLeft(yScale).tickFormat("").tickSize(-usableArea.width));

  // Create and add axes
  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3
    .axisLeft(yScale)
    .tickFormat((d) => String(d % 24).padStart(2, "0") + ":00");

  svg.append("g").attr("transform", `translate(0, ${usableArea.bottom})`).call(xAxis);
  svg.append("g").attr("transform", `translate(${usableArea.left}, 0)`).call(yAxis);

  // Create dots group
  const dots = svg.append("g").attr("class", "dots").raise();

  // Compute min and max lines edited
  const [minLines, maxLines] = d3.extent(commits, (d) => d.totalLines);

  // Define a square root scale for radius to ensure accurate perception
  const rScale = d3
  .scaleSqrt()
  .domain([minLines, Math.min(maxLines, 200)]) // Cap scaling at 200 lines
  .range([3, 20]); // Prevent excessive size growth


  // Sort commits by total lines in descending order so larger dots are drawn first
  const sortedCommits = d3.sort(commits, (d) => -d.totalLines);

  // Define brush
  const brush = d3.brush()
  .extent([[usableArea.left, usableArea.top], [usableArea.right, usableArea.bottom]])
  .on("start brush end", brushed);

  // Append brush to SVG
  svg.append("g")
  .attr("class", "brush")
  .call(brush);

  // Raise dots so tooltips still work
  svg.selectAll(".dots, .overlay ~ *").raise();


  // Add circles for commits
  dots
    .selectAll("circle")
    .data(sortedCommits)
    .join("circle")
    .attr("cx", (d) => xScale(d.datetime))
    .attr("cy", (d) => yScale(d.hourFrac))
    .attr("r", (d) => Math.min(rScale(d.totalLines), 25)) // Hard cap at 25px radius
  .style("fill-opacity", 0.7) // Add transparency for overlapping dots
  .on("mouseenter", function (event, d) {
    d3.select(event.currentTarget).classed("selected", isCommitSelected(d));
  })
  .on("mouseleave", function () {
    d3.select(event.currentTarget).classed("selected", false);
  })
    .attr("fill", (d) => (d.hourFrac < 6 || d.hourFrac > 18 ? "steelblue" : "orange"))
    .on("mouseenter", (event, commit) => {
      updateTooltipContent(commit, event);
  })
  .on("mousemove", (event) => {
    updateTooltipPosition(event);
  })
  
  .on("mouseleave", () => {
    updateTooltipContent({});
    updateTooltipVisibility(false);
  });
  



  console.log("Scatterplot created.");
}

// Load data when DOM is ready
document.addEventListener("DOMContentLoaded", async () => {
  await loadData();
  createScatterplot();
});
