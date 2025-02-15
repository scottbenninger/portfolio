// Initialize an empty data array
let data = [];

async function loadData() {
    data = await d3.csv('loc.csv');  // Load CSV file
    console.log(data);  // Debugging: Check the structure in DevTools Console
}

// Wait for the DOM to load before running loadData()
document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
});
