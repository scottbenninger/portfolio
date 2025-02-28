let data = [];
let xScale;
let yScale;
let brushSelection = null;
let commitProgress = 100;
let timeScale;
let commitMaxTime;
let filteredCommits = [];
let filteredLines = [];
let files = [];

async function loadData() {
  data = await d3.csv('loc.csv', (row) => ({
    ...row,
    line: Number(row.line),
    depth: Number(row.depth),
    length: Number(row.length),
    date: new Date(row.date + 'T00:00' + row.timezone),
    datetime: new Date(row.datetime),
  }));
  processCommits();
  displayStats();
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
  createScatterplot();
  createFilteringUI();
});

let commits = d3.groups(data, (d) => d.commit);

function processCommits() {
  commits = d3
    .groups(data, (d) => d.commit)
    .map(([commit, lines]) => {
      let first = lines[0];
      let { author, date, time, timezone, datetime } = first;

      const ret = {
        id: commit,
        url: 'https://github.com/scottbenninger/portfolio/commit/' + commit,
        author,
        date,
        time,
        timezone,
        datetime,
        hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
        totalLines: lines.length,
      };

      // Example of how you'd store the lines if you want them later
      Object.defineProperty(ret, 'lines', {
        value: lines,
        configurable: true,
        writable: true,
        enumerable: true,
      });

      return ret;
    });
}

function displayStats() {
  // Process commits first
  processCommits();

  // Select the stats container and create a definition list (`dl`)
  const dl = d3.select('#stats').append('dl').attr('class', 'stats');

  // Function to append dt (label) and dd (value) pairs
  function addStat(label, value) {
    dl.append('dt').html(label);
    dl.append('dd').text(value);
  }

  // Add stats
  addStat('TOTAL COMMITS', commits.length);
  addStat('FILES', d3.rollups(data, (v) => v.length, (d) => d.file).length);
  addStat('TOTAL <abbr title="Lines of Code">LOC</abbr>', data.length);
  addStat(
    'MOST PRODUCTIVE <abbr title="Time of Day">TOD</abbr>',
    (() => {
      let mostProductiveHour = d3
        .rollups(
          commits,
          (v) => d3.sum(v, (d) => d.totalLines),
          (d) => Math.floor(d.hourFrac)
        )
        .sort((a, b) => b[1] - a[1])[0][0];
      let period = mostProductiveHour >= 12 ? 'PM' : 'AM';
      let hour = mostProductiveHour % 12 || 12; // Convert to 12-hour format
      return `${hour} ${period}`;
    })()
  );
  addStat('LONGEST LINE', d3.max(data, (d) => d.length));
  addStat(
    'LONGEST FILE',
    d3.max(d3.rollups(data, (v) => v.length, (d) => d.file), (d) => d[1])
  );
}

// Step 2
function createScatterplot() {
  const width = 1000;
  const height = 600;

  const sortedCommits = d3.sort(commits, (d) => -d.totalLines);
  const svg = d3
    .select('#chart')
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .style('overflow', 'visible');

  xScale = d3
    .scaleTime()
    .domain(d3.extent(commits, (d) => d.datetime))
    .range([0, width])
    .nice();

  yScale = d3.scaleLinear().domain([0, 24]).range([height, 0]);

  const dots = svg.append('g').attr('class', 'dots');
  const [minLines, maxLines] = d3.extent(commits, (d) => d.totalLines);
  const rScale = d3
    .scaleSqrt()
    .domain([minLines, maxLines])
    .range([5, 30]); // adjust based on experimentation

  dots
    .selectAll('circle')
    .data(sortedCommits)
    .join('circle')
    .attr('cx', (d) => xScale(d.datetime))
    .attr('cy', (d) => yScale(d.hourFrac))
    .attr('r', (d) => rScale(d.totalLines))
    .attr('fill', 'steelblue')
    .style('fill-opacity', 0.7)
    // Highlight commit on hover and show tooltip
    .on('mouseenter', (event, commit) => {
      d3.select(event.currentTarget)
        .classed('selected', isCommitSelected(commit))
        .style('fill-opacity', 1);
      updateTooltipContent(commit);
      updateTooltipVisibility(true);
      updateTooltipPosition(event);
    })
    .on('mouseleave', (event, commit) => {
      d3.select(event.currentTarget)
        .classed('selected', isCommitSelected(commit))
        .style('fill-opacity', 0.7);
      updateTooltipContent({});
      updateTooltipVisibility(false);
    });

  // 2.2
  const margin = { top: 10, right: 10, bottom: 30, left: 20 };

  const usableArea = {
    top: margin.top,
    right: width - margin.right,
    bottom: height - margin.bottom,
    left: margin.left,
    width: width - margin.left - margin.right,
    height: height - margin.top - margin.bottom,
  };

  // Update scales with new ranges
  xScale.range([usableArea.left, usableArea.right]);
  yScale.range([usableArea.bottom, usableArea.top]);

  const gridlines = svg
    .append('g')
    .attr('class', 'gridlines')
    .attr('transform', `translate(${usableArea.left}, 0)`);

  // Create gridlines as an axis with no labels and full-width ticks
  gridlines.call(d3.axisLeft(yScale).tickFormat('').tickSize(-usableArea.width));

  const colorScale = d3
    .scaleLinear()
    .domain([0, 12, 24]) // Midnight (0) -> Noon (12) -> Midnight (24)
    .range(['#0f42d4', '#F59E0B', '#0f42d4']); // Dark Blue -> Orange -> Dark Blue

  // Select all gridline elements and apply dynamic colors
  gridlines
    .selectAll('line')
    .attr('stroke', (d) => colorScale(d))
    .attr('stroke-opacity', 0.6)
    .attr('stroke-width', 1.5);

  // Create the axes
  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3
    .axisLeft(yScale)
    .tickFormat((d) => String(d % 24).padStart(2, '0') + ':00');

  // Add X axis
  svg
    .append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0, ${usableArea.bottom})`)
    .call(xAxis);

  // Add Y axis
  svg
    .append('g')
    .attr('transform', `translate(${usableArea.left}, 0)`)
    .call(yAxis);

  brushSelector();
}

// Step 3
function updateTooltipContent(commit) {
  const link = document.getElementById('commit-link');
  const date = document.getElementById('commit-date');
  const time = document.getElementById('commit-time');
  const lines = document.getElementById('commit-lines');

  if (Object.keys(commit).length === 0) return;

  link.href = commit.url;
  link.textContent = commit.id;
  date.textContent = commit.datetime?.toLocaleString('en', {
    dateStyle: 'full',
  });
  time.textContent = commit.time;
  lines.textContent = commit.totalLines;
}

// 3.3
function updateTooltipVisibility(isVisible) {
  const tooltip = document.getElementById('commit-tooltip');
  tooltip.hidden = !isVisible;
}

function updateTooltipPosition(event) {
  const tooltip = document.getElementById('commit-tooltip');
  tooltip.style.left = `${event.clientX}px`;
  tooltip.style.top = `${event.clientY}px`;
}

// Step 5
function brushSelector() {
  const svg = d3.select('svg');

  // Create the brush
  const brush = d3.brush().on('start brush end', brushed);

  svg.call(brush);

  // Raise dots and everything after overlay
  d3.selectAll('.dots, .overlay ~ *').raise();
}

function brushed(event) {
  brushSelection = event.selection;
  updateSelection();
  const selectedCommits = brushSelection
    ? filteredCommits.filter(isCommitSelected)
    : [];

  // Continue as before...
  updateSelectionCount(selectedCommits);
  updateLanguageBreakdown(selectedCommits);
}

function isCommitSelected(commit) {
  if (!brushSelection) return false;

  const min = { x: brushSelection[0][0], y: brushSelection[0][1] };
  const max = { x: brushSelection[1][0], y: brushSelection[1][1] };

  // Use commit.datetime since that's how we plot on xScale
  const x = xScale(commit.datetime);
  const y = yScale(commit.hourFrac);

  return x >= min.x && x <= max.x && y >= min.y && y <= max.y;
}

function updateSelection() {
  // Update visual state of dots based on selection
  d3.selectAll('circle').classed('selected', (d) => isCommitSelected(d));
}

function updateSelectionCount() {
  const selectedCommits = brushSelection ? filteredCommits.filter(isCommitSelected) : [];

  const countElement = document.getElementById('selection-count');
  countElement.textContent = `${
    selectedCommits.length || 'No'
  } commits selected`;

  return selectedCommits;
}

function updateLanguageBreakdown(selectedCommits) {
  const container = document.getElementById('language-breakdown');

  if (!selectedCommits || selectedCommits.length === 0) {
    container.innerHTML = '';
    return;
  }

  const selectedLines = filteredLines.filter((d) =>
    selectedCommits.some((commit) => commit.id === d.commit)
  );

  const breakdown = d3.rollup(
    selectedLines,
    (v) => v.length,
    (d) => d.type
  );

  container.innerHTML = '';

  for (const [language, count] of breakdown) {
    const proportion = count / selectedLines.length;
    const formatted = d3.format('.1~%')(proportion);

    container.innerHTML += `
      <dt>${language}</dt>
      <dd>${count} lines (${formatted})</dd>
    `;
  }

  return breakdown;
}

// Updated function for filtering UI
function createFilteringUI() {
  // 1) Define the time scale domain (earliest to latest commit datetimes),
  //    mapping it to [0, 100].
  timeScale = d3.scaleTime()
    .domain(d3.extent(commits, (d) => d.datetime))
    .range([0, 100]);

  // 2) Grab references to the slider and the text display
  const commitProgressInput = document.getElementById('commit-progress');
  const selectedTimeText = document.getElementById('selectedTime');

  // 3) Initialize the slider position
  commitProgressInput.value = commitProgress;

  // 4) Listen for slider changes
  commitProgressInput.addEventListener('input', () => {
    commitProgress = +commitProgressInput.value;

    // Convert the slider value (0–100) back into a Date
    const selectedTime = timeScale.invert(commitProgress);

    // Display the date/time in the <span>
    selectedTimeText.textContent = selectedTime?.toLocaleString('en', {
      dateStyle: 'long',
      timeStyle: 'short',
    });

    // (a) Set commitMaxTime
    commitMaxTime = selectedTime;

    // (b) Filter commits and lines by commitMaxTime
    filteredCommits = commits.filter((d) => d.datetime <= commitMaxTime);
    filteredLines = data.filter((d) => d.datetime <= commitMaxTime);

    // (c) Update the x-scale domain based on filteredCommits
    xScale.domain(d3.extent(filteredCommits, (d) => d.datetime)).nice();

    // (d) Redraw or update your chart (re-bind data, re-render dots, etc.)
    updateScatterplot();

    // (e) Recompute summary stats based on filtered data
    updateStats();
    
    // (f) Update file visualization
    updateFileVisualization();
  });

  // 5) Trigger one update so the display shows immediately
  commitProgressInput.dispatchEvent(new Event('input'));
}

// New function to update the scatterplot based on filtered data
function updateScatterplot() {
  const svg = d3.select('svg');
  const dots = svg.select('.dots');
  
  // Sort commits by totalLines (largest first)
  const sortedCommits = d3.sort(filteredCommits, (d) => -d.totalLines);
  
  // Update the radius scale
  const [minLines, maxLines] = d3.extent(filteredCommits, (d) => d.totalLines);
  const rScale = d3
    .scaleSqrt()
    .domain([minLines, maxLines])
    .range([5, 30]);
  
  // Update x-axis
  svg.select('.x-axis').call(d3.axisBottom(xScale));
  
  // Update circles with filtered data
  dots.selectAll('circle')
    .data(sortedCommits, d => d.id)
    .join(
      enter => enter
        .append('circle')
        .attr('cx', (d) => xScale(d.datetime))
        .attr('cy', (d) => yScale(d.hourFrac))
        .attr('r', (d) => rScale(d.totalLines))
        .attr('fill', 'steelblue')
        .style('fill-opacity', 0.7)
        .on('mouseenter', (event, commit) => {
          d3.select(event.currentTarget)
            .classed('selected', isCommitSelected(commit))
            .style('fill-opacity', 1);
          updateTooltipContent(commit);
          updateTooltipVisibility(true);
          updateTooltipPosition(event);
        })
        .on('mouseleave', (event, commit) => {
          d3.select(event.currentTarget)
            .classed('selected', isCommitSelected(commit))
            .style('fill-opacity', 0.7);
          updateTooltipContent({});
          updateTooltipVisibility(false);
        }),
      update => update
        .attr('cx', (d) => xScale(d.datetime))
        .attr('r', (d) => rScale(d.totalLines)),
      exit => exit.remove()
    );
}

// New function to update stats using filtered data
function updateStats() {
  const statsContainer = d3.select('#stats');
  
  // Clear existing stats
  statsContainer.html('');
  
  // Create a new definition list
  const dl = statsContainer.append('dl').attr('class', 'stats');
  
  // Function to append dt (label) and dd (value) pairs
  function addStat(label, value) {
    dl.append('dt').html(label);
    dl.append('dd').text(value);
  }
  
  // Add stats using filtered data
  addStat('COMMITS', filteredCommits.length);
  addStat('FILES', d3.rollups(filteredLines, (v) => v.length, (d) => d.file).length);
  addStat('TOTAL LOC', filteredLines.length);
  addStat(
    'MOST PRODUCTIVE <abbr title="Time of Day">TOD</abbr>',
    (() => {
      let mostProductiveHour = d3
        .rollups(
          filteredCommits,
          (v) => d3.sum(v, (d) => d.totalLines),
          (d) => Math.floor(d.hourFrac)
        )
        .sort((a, b) => b[1] - a[1])[0][0];
      let period = mostProductiveHour >= 12 ? 'PM' : 'AM';
      let hour = mostProductiveHour % 12 || 12; // Convert to 12-hour format
      return `${hour} ${period}`;
    })()
  );
  addStat('LONGEST LINE', d3.max(filteredLines, (d) => d.length));
  addStat(
    'LONGEST FILE',
    d3.max(d3.rollups(filteredLines, (v) => v.length, (d) => d.file), (d) => d[1])
  );
}

// Updated function for file visualization with unit visualization
function updateFileVisualization() {
  let fileTypeColors = d3.scaleOrdinal(d3.schemeTableau10);
  // Get file information from the filtered lines
  files = d3
    .groups(filteredLines, (d) => d.file)
    .map(([name, lines]) => {
      return { name, lines };
    });
  
  // Sort files by number of lines in descending order
  files = d3.sort(files, d => -d.lines.length);
  
  // Select and clear the files container
  d3.select('.files').selectAll('div').remove();
  
  // Create a container for file information if it doesn't exist
  let filesContainer = d3.select('#files-container');
  if (filesContainer.empty()) {
    filesContainer = d3.select('body').append('div').attr('id', 'files-container');
  }
  
  // Create dl element with class "files" if it doesn't exist
  let filesList = filesContainer.select('dl.files');
  if (filesList.empty()) {
    filesList = filesContainer.append('dl').attr('class', 'files');
  } else {
    // Clear existing content
    filesList.html('');
  }
  
  // For each file, create a div containing dt (filename) and dd (line count)
  const fileEntries = filesList.selectAll('div')
    .data(files)
    .enter()
    .append('div');
    
  fileEntries.append('dt')
    .append('code')
    .text(d => d.name);
    
  // Update: Replace single dd with a dd containing divs for each line
  fileEntries.append('dd')
    .selectAll('div')
    .data(d => d.lines)
    .join('div')
    .attr('class', 'line')
    .style('background', d => fileTypeColors(d.type));
    
  // Display the total lines count using a <dt> with a <small> element
  fileEntries.select('dt')
    .append('small')
    .style('display', 'block')
    .html(d => `${d.lines.length} lines`);
}