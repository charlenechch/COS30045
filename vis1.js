var w = 1300; // Set the width
var h = 600; // Set the height
var padding = 70; // Increased padding for better axis spacing

var dataset, xScale, yScale, line;

function init() {
    // Load the CSV data
    d3.csv("resource/Historical data global.csv", function (d) {
        return {
            date: new Date(d.Year), // Convert to Date object for proper scaling
            emissions: +d.Emissions
        };
    }).then(function (data) {
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

        // Attach click event to the section
        document.querySelector("#section3").addEventListener("click", function () {
            lineChart(dataset);
        });
    });
}

function lineChart(dataset) {
    // Remove existing visualization if it already exists
    d3.select("#chart").select("svg").remove();

    // Create SVG
    var svg = d3.select("#chart")
        .append("svg")
        .attr("width", w)
        .attr("height", h);

    // Define tooltip
    var tooltip = d3.select("body").append("div")
        .attr("id", "tooltip")
        .style("position", "absolute")
        .style("opacity", 0)
        .style("background-color", "#f9f9f9")
        .style("border", "1px solid #333")
        .style("padding", "8px")
        .style("border-radius", "4px")
        .style("pointer-events", "none")
        .style("font-size", "12px");

    // Draw the line with transition
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

    // Add x-axis with improved formatting
    var xAxis = d3.axisBottom(xScale).ticks(10);
    svg.append("g")
        .attr("transform", "translate(0," + (h - padding) + ")")
        .call(xAxis)
        .style("font-size", "12px");

    // Add y-axis with formatted ticks
    var yAxis = d3.axisLeft(yScale)
        .ticks(10)
        .tickFormat(d3.format(".2s")); // Format large numbers with suffix (e.g., "1M" for 1,000,000)

    svg.append("g")
        .attr("transform", "translate(" + padding + ",0)")
        .call(yAxis)
        .style("font-size", "12px");

    // Add light grid lines
    svg.selectAll(".grid-line")
        .data(yScale.ticks(10))
        .enter()
        .append("line")
        .attr("class", "grid-line")
        .attr("x1", padding)
        .attr("x2", w - padding)
        .attr("y1", function (d) { return yScale(d); })
        .attr("y2", function (d) { return yScale(d); })
        .attr("stroke", "#ccc")
        .attr("stroke-dasharray", "2,2");

    // Add x-axis label
    svg.append("text")
        .attr("x", w / 2)
        .attr("y", h - 20)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .text("Year");

    // Add y-axis label
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("x", -h / 2)
        .attr("y", 20)
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .text("Emissions");
}

// Initialize the script
init();
