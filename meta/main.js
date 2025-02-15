// Global variables
let data = []; 
let commits = []; 

// Function to load CSV data
async function loadData() {
  console.log("Loading CSV...");
  data = await d3.csv('loc.csv', (row) => ({
    ...row,
    line: Number(row.line),
    depth: Number(row.depth),
    length: Number(row.length),
    date: new Date(row.date + 'T00:00' + row.timezone),
    datetime: new Date(row.datetime),
    file: row.file, // Ensure file property exists
  }));

  console.log("CSV loaded:", data.length, "entries");

  displayStats();
}

// Function to display stats
function displayStats() {
  processCommits();

  const dl = d3.select('#stats').append('dl').attr('class', 'stats');

  dl.append('dt').html('Total <abbr title="Lines of Code">LOC</abbr>');
  dl.append('dd').text(data.length);

  dl.append('dt').text('Total commits');
  dl.append('dd').text(commits.length);

  const numFiles = d3.group(data, (d) => d.file).size;
  const maxFileLength = d3.max(data, (d) => d.line);
  const avgFileLength = d3.mean(
    d3.rollups(data, (v) => d3.max(v, (d) => d.line), (d) => d.file),
    (d) => d[1]
  );

  dl.append('dt').text('Number of files');
  dl.append('dd').text(numFiles);

  dl.append('dt').text('Longest file (in lines)');
  dl.append('dd').text(maxFileLength);

  dl.append('dt').text('Average file length (in lines)');
  dl.append('dd').text(Math.round(avgFileLength));

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
        url: 'https://github.com/scottbenninger/commit/' + commit,
        author,
        date,
        time,
        timezone,
        datetime,
        hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
        totalLines: lines.length,
      };

      Object.defineProperty(ret, 'lines', {
        value: lines,
        enumerable: false,
        writable: false,
        configurable: false
      });

      return ret;
    });

  window.commits = commits;
  console.log("Commits array processed:", commits);
}

// Function to create scatterplot
function createScatterplot() {
  console.log("Creating scatterplot...");

  // Define dimensions & margins
  const width = 1000;
  const height = 600;
  const margin = { top: 20, right: 20, bottom: 50, left: 60 }; // Adjusted bottom margin

  // Define usable area
  const usableArea = {
    width: width - margin.left - margin.right,
    height: height - margin.top - margin.bottom,
  };

  // Create SVG
  const svg = d3
    .select("#chart")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // **X-Scale: Date Range**
  const xScale = d3
    .scaleTime()
    .domain(d3.extent(commits, (d) => d.datetime))
    .range([0, usableArea.width])
    .nice();

  // **Y-Scale: Time of Day**
  const yScale = d3
    .scaleLinear()
    .domain([0, 24])
    .range([usableArea.height, 0]); 

  // **Add Dots**
  svg.append("g")
    .attr("class", "dots")
    .selectAll("circle")
    .data(commits)
    .join("circle")
    .attr("cx", (d) => xScale(d.datetime))
    .attr("cy", (d) => yScale(d.hourFrac))
    .attr("r", 5)
    .attr("fill", "steelblue");

  console.log("Scatterplot created.");

  // **X-Axis: Formatted**
  const xAxis = d3.axisBottom(xScale).ticks(10).tickFormat(d3.timeFormat("%b %d")); 
  svg.append("g")
    .attr("transform", `translate(0, ${usableArea.height})`) 
    .call(xAxis)
    .attr("class", "x-axis")
    .selectAll("text")
    .attr("transform", "rotate(-30)") // Rotates labels to prevent overlap
    .style("text-anchor", "end"); // Aligns text properly

  // **Y-Axis: Formatted as Time**
  const yAxis = d3
    .axisLeft(yScale)
    .tickFormat((d) => String(d % 24).padStart(2, "0") + ":00"); 

  // **Add Y-Axis**
  svg.append("g")
    .call(yAxis)
    .attr("class", "y-axis");

  console.log("Axes added to scatterplot.");
}

// Load data when DOM is ready
document.addEventListener("DOMContentLoaded", async () => {
  await loadData();
  createScatterplot();
});
