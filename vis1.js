var w = 1300; // Width
var h = 700; // Height
var padding = 70;

var dataset, xScale, yScale, line;

function init() {
    console.log("Initializing visualization...");

    // Load the CSV data
    d3.csv("resource/Historical data global.csv", function (d) {
        return {
            date: new Date(d.Year), // Convert year to Date object
            emissions: +d.Emissions / 1e9 // Convert emissions to billion tons
        };
    }).then(function (data) {
        // Filter dataset to include only data from 1850 onward
        dataset = data.filter(function (d) {
            return d.date.getFullYear() >= 1850;
        });

        console.log("Filtered Dataset:", dataset);

        // Set up scales
        xScale = d3.scaleTime()
            .domain(d3.extent(dataset, function (d) { return d.date; })) // Scale based on filtered data
            .range([padding, w - padding]);

        yScale = d3.scaleLinear()
            .domain([0, d3.max(dataset, function (d) { return d.emissions; })])
            .range([h - padding, padding]);

        // Define the line generator
        line = d3.line()
            .x(function (d) { return xScale(d.date); })
            .y(function (d) { return yScale(d.emissions); });

        // Render the chart
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
        .duration(2000) // Animation duration
        .ease(d3.easeLinear)
        .attr("stroke-dashoffset", 0);

    // Add x-axis
    var xAxis = d3.axisBottom(xScale)
        .ticks(10)
        .tickFormat(d3.timeFormat("%Y")); // Format years

    svg.append("g")
        .attr("transform", "translate(0," + (h - padding) + ")")
        .call(xAxis);

    // Add x-axis label
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("x", w / 2)
        .attr("y", h - 30) // Position below the x-axis
        .text("Year")
        .style("font-size", "16px");

    // Add y-axis
    var yAxis = d3.axisLeft(yScale)
        .ticks(10)
        .tickFormat(d => `${d}B t`); // Format in billion tons

    svg.append("g")
        .attr("transform", "translate(" + padding + ",0)")
        .call(yAxis);

    // Add y-axis label
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)") // Rotate to make it vertical
        .attr("x", -h / 2)
        .attr("y", 20) // Position to the left of the y-axis
        .text("Emissions (Billion Tons)")
        .style("font-size", "16px");
}

// Initialize the visualization
init();
