// Define chart dimensions
var w = 800; // Chart width
var h = 700; // Chart height
var padding = 50;
var currentYear = "2008"; // Default year
var outerRadius = w / 3.2;  // Increased radius to give space for labels
var innerRadius = 0;

var dataset, pie, arc, color;

// Define arc for each slice
arc = d3.arc()
    .outerRadius(outerRadius)
    .innerRadius(innerRadius);

// Define pie layout
pie = d3.pie()
    .value(d => d.value);

// Define the color scale
color = d3.scaleOrdinal(d3.schemeSet3); // Choose a color scheme

// Create the SVG element
var svg3 = d3.select("#char3") // Change this line to append the chart inside the #chart container
    .append("svg")
    .attr("width", w)
    .attr("height", h);

// Group for the pie chart
var chartGroup = svg3.append("g")
    .attr("transform", `translate(${w / 2}, ${h / 2})`);

// Load the CSV file and initialize the pie chart
function init() {
    d3.csv("resource/Sectors/Major Sectors.csv").then(function (data) {
        console.log("Loaded Data:", data); // Check data loaded correctly
        dataset = data;

        // Draw the initial chart for the default year
        updateChart(currentYear);
    }).catch(function(error) {
        console.error("Error loading CSV data:", error);
    });
}

// Append a tooltip
var tooltip3 = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("visibility", "hidden")
    .style("background-color", "lightgray")
    .style("padding", "5px")
    .style("border-radius", "5px");

// Function to update the chart based on the selected year
function updateChart(year) {
    // Extract the data for the selected year
    var yearData = dataset.map(d => ({
        activity: d["Economic Activity"], // Adjusted for exact match
        value: +d[year] || 0 // Ensure the value is a number or 0 if missing
    }));

    // Bind the data to pie slices
    var arcs = chartGroup.selectAll("g.arc")
        .data(pie(yearData)); // Calculate new pie chart slices based on the updated data

    // Enter new slices
    var enterArcs = arcs.enter()
        .append("g")
        .attr("class", "arc");

    // Append the path for each slice
    enterArcs.append("path")
        .attr("fill", (d, i) => color(i))
        .attr("d", arc)
        .transition() // Apply transition for smooth rendering
        .duration(500); // Duration for smooth transition

    // Append the text labels outside the slices with rotation and distance adjustment
    enterArcs.append("text")
        .text(d => d.data.activity)
        .attr("transform", function(d) {
            var pos = arc.centroid(d);
            pos[0] *= 2.3;  // Increase the distance of labels from the center
            pos[1] *= 2.3;

            // Adjust rotation to align the text with the slices
            var angle = (d.startAngle + d.endAngle) / 2 * 180 / Math.PI - 90;
            return "translate(" + pos + ") rotate(" + angle + ")";
        })
        .attr("text-anchor", "middle")
        .style("font-size", "12px") // Adjust font size
        .style("font-family", "Arial, sans-serif");  // Set font style

    // Update existing slices
    arcs.select("path")
        .transition()
        .duration(500) // Apply a smooth transition for updating
        .attr("d", arc)
        .attr("fill", (d, i) => color(i));

    // Remove old slices
    arcs.exit().remove();
}

// Call the init function to load data
init();

// Slider and year label update
var slider3 = d3.select("#year-slider")
    .on("input", function () {
        currentYear = this.value;
        d3.select("#year-label").text(`Year: ${currentYear}`);
        updateChart(currentYear); // Update the chart based on selected year
    });

// Add a label for the current year (only once)
var yearLabel3 = d3.select("body")
    .append("div")
    .attr("id", "year-label")
    .style("font-size", "20px")
    .style("margin", "10px")
    .text(`Year: ${currentYear}`);
