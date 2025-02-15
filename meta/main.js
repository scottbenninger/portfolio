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

  displayStats(); // Now we compute and display stats
}

// Function to display stats
function displayStats() {
  // Process commits first
  processCommits();

  // Select the #stats div and append a <dl> list
  const dl = d3.select('#stats').append('dl').attr('class', 'stats');

  // Add total LOC
  dl.append('dt').html('Total <abbr title="Lines of Code">LOC</abbr>');
  dl.append('dd').text(data.length);

  // Add total commits
  dl.append('dt').text('Total commits');
  dl.append('dd').text(commits.length);

  // Compute additional statistics
  const numFiles = d3.group(data, (d) => d.file).size;
  const maxFileLength = d3.max(data, (d) => d.line);
  const avgFileLength = d3.mean(
    d3.rollups(data, (v) => d3.max(v, (d) => d.line), (d) => d.file),
    (d) => d[1]
  );

  // Display number of files
  dl.append('dt').text('Number of files');
  dl.append('dd').text(numFiles);

  // Display longest file
  dl.append('dt').text('Longest file (in lines)');
  dl.append('dd').text(maxFileLength);

  // Display average file length
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


function createScatterplot() {
  console.log("Creating scatterplot...");

  // Define dimensions
  const width = 1000;
  const height = 600;

  // Create SVG
  const svg = d3
    .select("#chart")
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .style("overflow", "visible");

  // Define X (date) scale
  const xScale = d3
    .scaleTime()
    .domain(d3.extent(commits, (d) => d.datetime)) // Auto-detect min/max dates
    .range([0, width])
    .nice();

  // Define Y (time of day) scale
  const yScale = d3.scaleLinear().domain([0, 24]).range([height, 0]);

  // Create dots
  const dots = svg.append("g").attr("class", "dots");

  dots
    .selectAll("circle")
    .data(commits)
    .join("circle")
    .attr("cx", (d) => xScale(d.datetime))
    .attr("cy", (d) => yScale(d.hourFrac))
    .attr("r", 5)
    .attr("fill", "steelblue");

  console.log("Scatterplot created.");
}

// Load data when DOM is ready
document.addEventListener("DOMContentLoaded", async () => {
  await loadData();
  createScatterplot(); // ✅ Generate the scatterplot after loading commits
});

