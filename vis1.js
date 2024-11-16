var w = 1350; // Width
var h = 650; // Height
var padding = 80;

var dataset, xScale, yScale, line;

function init() {

    // Load the CSV data
    d3.csv("resource/Historical data global.csv", function (d) {
        return {
            date: new Date(d.Year), // Convert year to Date object
            emissions: +d.Emissions / 1e9, // Convert emissions to billion tons
            temperature: +d.Temperature // Parse temperature as a float
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

    // Draw the line
    var pathEmissions = svg.append("path")
                           .datum(dataset)
                           .attr("fill", "none")
                           .attr("stroke", "steelblue")
                           .attr("stroke-width", 2)
                           .attr("d", line);

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
        .style("font-size", "15px");

    // Add y-axis for emissions
    var yAxisEmissions = d3.axisLeft(yScaleEmissions)
        .ticks(10)
        .tickFormat(d => `${d} billion t`);

    svg.append("g")
        .attr("transform", "translate(" + padding + ",0)")
        .call(yAxisEmissions);

    // Add y-axis label
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)") // Rotated to align vertically
        .attr("x", -h / 2) // Centered along the height
        .attr("y",  15) // Positioned slightly to the left of the y-axis
        .text("Total Greenhouse Gas Emissions")
        .style("font-size", "14px");

     // Add y-axis for temperature
     var yAxisTemperature = d3.axisRight(yScaleTemperature)
                              .ticks(10)
                              .tickFormat(d => `${d}°C`);

    svg.append("g")
        .attr("transform", "translate(" + (w - padding) + ",0)")
        .call(yAxisTemperature);

    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("x", -h / 2)
        .attr("y", w - padding + 40) // Adjust to position correctly
        .text("Average Temperature Anomaly (°C)")
        .style("font-size", "15px")
        .style("fill", "orange");

    // Create a tooltip
    var tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background-color", "#f9f9f9")
        .style("border", "1px solid #d3d3d3")
        .style("padding", "8px")
        .style("border-radius", "4px")
        .style("box-shadow", "0px 4px 8px rgba(0, 0, 0, 0.1)")
        .style("visibility", "hidden")
        .style("font-size", "14px");

    // Add data points with hover functionality
    svg.selectAll(".dot")
        .data(dataset)
        .enter()
        .append("circle")
        .attr("class", "dot")
        .attr("cx", function (d) { return xScale(d.date); })
        .attr("cy", function (d) { return yScale(d.emissions); })
        .attr("r", 2)
        .attr("fill", "steelblue")
        .style("opacity", 0) // Initially hidden
        .on("mouseover", function (event, d) {
            tooltip.style("visibility", "visible")
                .html(
                    `<strong>Year:</strong> ${d3.timeFormat("%Y")(d.date)}<br>` +
                    `<strong>Emissions:</strong> ${d.emissions.toFixed(2)}B t`
                )
                .style("top", (event.pageY - 10) + "px")
                .style("left", (event.pageX + 10) + "px");
            d3.select(this).attr("fill", "orange"); // Highlight the circle
        })
        .on("mousemove", function (event) {
            tooltip.style("top", (event.pageY - 10) + "px")
                .style("left", (event.pageX + 10) + "px");
        })
        .on("mouseout", function () {
            tooltip.style("visibility", "hidden");
            d3.select(this).attr("fill", "steelblue"); // Reset circle color
        });

    // Reveal data points after line animation
    svg.selectAll(".dot")
        .transition()
        .delay(2000) // Matches the line animation duration
        .style("opacity", 1);
}

// Initialize the visualization
init();
