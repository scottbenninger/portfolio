// Global variables
let data = []; 
let commits = []; // Stores commit data

// Function to load CSV data
async function loadData() {
  data = await d3.csv('loc.csv', (row) => ({
    ...row,
    line: Number(row.line),  // Convert line count to a number
    depth: Number(row.depth),
    length: Number(row.length),
    date: new Date(row.date + 'T00:00' + row.timezone),  // Convert date
    datetime: new Date(row.datetime),
  }));

  processCommits(); // Compute commit statistics
  console.log(commits); // Debugging: Check processed commit data
}

// Function to process commit data
function processCommits() {
  commits = d3
    .groups(data, (d) => d.commit) // Group by commit ID
    .map(([commit, lines]) => {
      let first = lines[0]; // First entry contains commit details

      let { author, date, time, timezone, datetime } = first;

      let ret = {
        id: commit,
        url: 'https://github.com/YOUR_REPO/commit/' + commit, // Replace with your actual GitHub repo
        author,
        date,
        time,
        timezone,
        datetime,
        // Convert time to decimal format (e.g., 14:30 → 14.5)
        hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
        // Count number of modified lines
        totalLines: lines.length,
      };

      // Hide raw line data to keep the object clean in console
      Object.defineProperty(ret, 'lines', {
        value: lines,
        enumerable: false, // Exclude from printed object properties
        writable: false,   // Prevent modification
        configurable: false // Prevent deletion
      });

      return ret;
    });
}

// Load data when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
});
