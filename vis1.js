var w = 1300; // Width
var h = 600; // Height
var padding = 70;

var dataset, xScale, yScale, line;

function init() {
    console.log("Initializing visualization...");

    // Load the CSV data
    d3.csv("resource/Historical data global.csv", function (d) {
        console.log("Loading row:", d); // Log each row
        return {
            date: new Date(d.Year), // Convert to Date object for proper scaling
            emissions: +d.Emissions / 1e9 // Convert emissions to billion tons
        };
    }).then(function (data) {
        console.log("Dataset loaded:", data); // Confirm dataset is loaded
        dataset = data;

        // Set up scales
        xScale = d3.scaleTime()
            .domain(d3.extent(dataset, function (d) { return d.date; }))
            .range([padding, w - padding]);

        yScale = d3.scaleLinear()
            .domain([0, d3.max(dataset, function (d) { return d.emissions; })])
            .range([h - padding, padding]);

        line = d3.line()
            .x(function (d) { return xScale(d.date); })
            .y(function (d) { return yScale(d.emissions); });

        // Create the line chart with animations
        lineChart(dataset);
    });
}

function lineChart(dataset) {
    console.log("Rendering line chart...");

    // Remove existing visualization if present
    d3.select("#chart").select("svg").remove();

    // Create SVG
    var svg = d3.select("#chart")
        .append("svg")
        .attr("width", w)
        .attr("height", h);

    // Draw the line
    var path = svg.append("path")
        .datum(dataset)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 2)
        .attr("d", line);

    // Animate the line drawing
    var totalLength = path.node().getTotalLength();
    path.attr("stroke-dasharray", totalLength + " " + totalLength)
        .attr("stroke-dashoffset", totalLength)
        .transition()
        .duration(2000)
        .ease(d3.easeLinear)
        .attr("stroke-dashoffset", 0);

    // Add x-axis
    var xAxis = d3.axisBottom(xScale).ticks(10);
    svg.append("g")
        .attr("transform", "translate(0," + (h - padding) + ")")
        .call(xAxis);

    // Add y-axis
    var yAxis = d3.axisLeft(yScale).ticks(10).tickFormat(d => `${d}Billion t`);
    svg.append("g")
        .attr("transform", "translate(" + padding + ",0)")
        .call(yAxis);
}

// Initialize the visualization
//init();
