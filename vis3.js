var w = 800; // Chart width
var h = 600; // Chart height
var padding = 50;
var currentYear = "2008"; // Default year
var outerRadius = w / 3;
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
color = d3.scaleOrdinal(d3.schemeCategory10);

// Create the SVG element
var svg = d3.select("body")
    .append("svg")
    .attr("width", w)
    .attr("height", h);

// Group for the pie chart
var chartGroup = svg.append("g")
    .attr("transform", `translate(${w / 2}, ${h / 2})`);

// Load the CSV file and initialize the pie chart
function init() {
    d3.csv("Major Sectors.csv", function (d) {
        return {
            activity: d["Economic Activity"], // Adjusted for exact match
            values: Object.keys(d)
                .slice(1) // Skip the "Economic Activity" column
                .reduce((acc, year) => {
                    acc[year] = +d[year]; // Parse each year's value as a number
                    return acc;
                }, {})
        };
    }).then(function (data) {
        console.log("Loaded Data:", data); // Verify the parsed data
        dataset = data;

        // Draw the initial chart for the default year
        updateChart(currentYear);
    });
}


// Function to update the chart based on the selected year
function updateChart(year) {
    // Extract the data for the selected year
    var yearData = dataset.map(d => ({
        activity: d.activity,
        value: d.values[year]
    }));

    // Bind data to pie slices
    var arcs = chartGroup.selectAll("g.arc")
        .data(pie(yearData));

    // Enter new slices
    var enterArcs = arcs.enter()
        .append("g")
        .attr("class", "arc");

    enterArcs.append("path")
        .attr("fill", (d, i) => color(i))
        .attr("d", arc);

    enterArcs.append("text")
        .text(d => d.data.activity)
        .attr("transform", d => `translate(${arc.centroid(d)})`)
        .attr("text-anchor", "middle");

    // Update existing slices
    arcs.select("path")
        .transition()
        .duration(500)
        .attr("d", arc)
        .attr("fill", (d, i) => color(i));

    arcs.select("text")
        .transition()
        .duration(500)
        .attr("transform", d => `translate(${arc.centroid(d)})`)
        .text(d => d.data.activity);

    // Remove old slices
    arcs.exit().remove();
}

// Call the init function
init();

// Add a slider to select the year
var slider = d3.select("body")
    .append("input")
    .attr("type", "range")
    .attr("min", 2008)
    .attr("max", 2022)
    .attr("step", 1)
    .attr("value", 2008)
    .on("input", function () {
        currentYear = this.value;
        updateChart(currentYear);
    });

// Add a label for the current year
var yearLabel = d3.select("body")
    .append("div")
    .style("font-size", "20px")
    .style("margin", "10px")
    .text(`Year: ${currentYear}`);

slider.on("input", function () {
    currentYear = this.value;
    yearLabel.text(`Year: ${currentYear}`);
    updateChart(currentYear);
});
