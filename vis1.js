var w = 1300; // Width
var h = 650; // Height
var padding = 70;

var dataset, xScale, yScaleEmissions, yScaleTemperature, lineEmissions, lineTemperature;

function init() {

    // Load the CSV data
    d3.csv("resource/Historical data global.csv", function (d) {
        return {
            date: new Date(d.Year), // Convert year to Date object
            emissions: +d.Emissions / 1e9, // Convert emissions to billion tons
            temperature: +d.Temperature // Global temperature in degrees Celsius
        };
    }).then(function (data) {
        // Filter dataset to include only data from 1850 onward
        dataset = data.filter(function (d) {
            return d.date.getFullYear() >= 1850;
        });

        // Set up scales
        xScale = d3.scaleTime()
                   .domain(d3.extent(dataset, function (d) { return d.date; })) // Scale based on filtered data
                   .range([padding, w - padding]);

        yScaleEmissions = d3.scaleLinear()
                   .domain([0, d3.max(dataset, function (d) { return d.emissions; })])
                   .range([h - padding, padding]);

        yScaleTemperature = d3.scaleLinear()
                   .domain([d3.min(dataset, function (d) { return d.temperature; }),
                            d3.max(dataset, function (d) { return d.temperature; })])
                   .range([h - padding, padding]);

        // Define the line generators
        lineEmissions = d3.line()
                 .x(function (d) { return xScale(d.date); })
                 .y(function (d) { return yScaleEmissions(d.emissions); });

        lineTemperature = d3.line()
                 .x(function (d) { return xScale(d.date); })
                 .y(function (d) { return yScaleTemperature(d.temperature); });

        // Render the chart
        lineChart(dataset);
    });
}

function lineChart(dataset) {
    // Remove existing visualization if present
    d3.select("#chart").select("svg").remove();

    // Create SVG
    var svg = d3.select("#chart")
                .append("svg")
                .attr("width", w)
                .attr("height", h);

    // Draw the emissions line
    var pathEmissions = svg.append("path")
                  .datum(dataset)
                  .attr("fill", "none")
                  .attr("stroke", "steelblue")
                  .attr("stroke-width", 2)
                  .attr("d", lineEmissions);

    // Animate the emissions line
    var totalLengthEmissions = pathEmissions.node().getTotalLength();
    pathEmissions.attr("stroke-dasharray", totalLengthEmissions + " " + totalLengthEmissions)
        .attr("stroke-dashoffset", totalLengthEmissions)
        .transition()
        .duration(2500)
        .ease(d3.easeLinear)
        .attr("stroke-dashoffset", 0);

    // Draw the temperature line
    var pathTemperature = svg.append("path")
                  .datum(dataset)
                  .attr("fill", "none")
                  .attr("stroke", "orange")
                  .attr("stroke-width", 2)
                  .attr("d", lineTemperature);

    // Animate the temperature line
    var totalLengthTemperature = pathTemperature.node().getTotalLength();
    pathTemperature.attr("stroke-dasharray", totalLengthTemperature + " " + totalLengthTemperature)
        .attr("stroke-dashoffset", totalLengthTemperature)
        .transition()
        .duration(2500)
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

    // Add emissions y-axis
    var yAxisEmissions = d3.axisLeft(yScaleEmissions)
                  .ticks(10)
                  .tickFormat(d => `${d} billion t`); // Format in billion tons

    svg.append("g")
        .attr("transform", "translate(" + padding + ",0)")
        .call(yAxisEmissions);

    // Add emissions y-axis label
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("x", -(h - padding) / 2)
        .attr("y", padding / 4 - 20)
        .text("Total Greenhouse Gas Emissions (Billion t)")
        .style("font-size", "14px")
        .style("fill", "black");

    // Add temperature y-axis
    var yAxisTemperature = d3.axisRight(yScaleTemperature)
                  .ticks(10)
                  .tickFormat(d => `${d}°C`); // Format in degrees Celsius

    svg.append("g")
        .attr("transform", "translate(" + (w - padding) + ",0)")
        .call(yAxisTemperature);

    // Add temperature y-axis label
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("x", -(h - padding) / 2)
        .attr("y", w - padding + 30) // Adjust to position it outside the right axis
        .text("Global Temperature (°C)")
        .style("font-size", "14px")
        .style("fill", "black");
}

// Initialize the visualization
init();
