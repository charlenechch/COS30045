var w = 1350; // Width
var h = 650; // Height
var padding = 100;

var dataset, xScale, yScaleEmissions, yScaleTemperature, lineEmissions, lineTemperature;

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
                   .domain(d3.extent(dataset, function (d) { return d.date; }))
                   .range([padding - 110, w - padding - 90]); // Adjust left and right padding equally


        yScaleEmissions = d3.scaleLinear()
                            .domain([0, d3.max(dataset, function (d) { return d.emissions; })])
                            .range([h - padding, padding]);

        yScaleTemperature = d3.scaleLinear()
                              .domain([d3.min(dataset, function (d) { return d.temperature; }),
                                    d3.max(dataset, function (d) { return d.temperature; }) * 1.2])
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
    d3.select("#chart").select("svg").remove();

    var svg = d3.select("#chart")
                .append("svg")
                .attr("width", w)
                .attr("height", h);

      // Calculate dynamic horizontal offset to center the chart
    var horizontalOffset = (w - (w - padding * 2)) / 2;

    // Create a group element to wrap all chart elements
    var chartGroup = svg.append("g")
                        .attr("transform", `translate(${horizontalOffset}, 0)`); // Move the chart horizontally to center

    // Draw the emissions line
    var pathEmissions = chartGroup.append("path")
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
    var pathTemperature = chartGroup.append("path")
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
                  .tickFormat(d3.timeFormat("%Y"));

     chartGroup.append("g")
                .attr("transform", "translate(0," + (h - padding) + ")") // Adjust for vertical placement
                .call(xAxis);

    // Add x-axis label
    chartGroup.append("text")
              .attr("text-anchor", "middle")
              .attr("x", w / 2 - 140) // Adjust x position due to the shift
              .attr("y", h - 50)
              .text("Year")
              .style("font-size", "15px");

    // Add y-axis for emissions
    var yAxisEmissions = d3.axisLeft(yScaleEmissions)
                           .ticks(10)
                           .tickFormat(d => `${d} billion t`);
                        
    svg.append("g")
        .attr("transform", "translate(" + (padding - 10) + ",0)") // Match left padding
        .call(yAxisEmissions);

    chartGroup.append("text")
              .attr("text-anchor", "middle")
              .attr("transform", "rotate(-90)")
              .attr("x", -h / 2)
              .attr("y", 0 - (padding - 10))
              .text("Total Greenhouse Gas Emissions (Billion Tons)")
              .style("font-size", "14px");

    // Add y-axis for temperature
    var yAxisTemperature = d3.axisRight(yScaleTemperature)
                             .ticks(10)
                             .tickFormat(d => `${d}°C`);

    svg.append("g")
       .attr("transform", "translate(" + (w - padding + 10) + ",0)") // Match right padding
       .call(yAxisTemperature);

    chartGroup.append("text")
              .attr("text-anchor", "middle")
              .attr("transform", "rotate(-90)")
              .attr("x", -h / 2)
              .attr("y", w - padding - 20) // Adjust y position due to the shift
              .text("Average Temperature Anomaly (°C)")
              .style("font-size", "15px")

    
     // Add the legend
     var legend = svg.append("g")
                     .attr("class", "legend")
                     .attr("transform", `translate(${w - 250}, ${padding})`); // Adjust position for the legend

    // Adjust the legend positioning (closer to the left axis)
    var legend = svg.append("g")
                    .attr("class", "legend")
                    .attr("transform", `translate(${padding - 80}, ${padding})`); // Move closer to the left axis

    // Add emissions legend
    legend.append("rect")
          .attr("x", 90)
          .attr("y", 0)
          .attr("width", 10)
          .attr("height", 10)
          .attr("fill", "steelblue");

    legend.append("text")
          .attr("x", 108)
          .attr("y", 8)
          .text("Total Greenhouse Gas Emissions")
          .style("font-size", "10px")
          .attr("alignment-baseline", "middle");

    // Add temperature legend
    legend.append("rect")
          .attr("x", 90)
          .attr("y", 30)
          .attr("width", 10)
          .attr("height", 10)
          .attr("fill", "orange");

    legend.append("text")
          .attr("x", 108)
          .attr("y", 37)
          .text("Average Temperature Anomaly")
          .style("font-size", "10px")
          .attr("alignment-baseline", "middle");
  
    // Add vertical hover line
    var hoverLine = chartGroup.append("line")
        .attr("class", "hover-line")
        .attr("y1", padding)
        .attr("y2", h - padding)
        .attr("stroke", "gray")
        .attr("stroke-dasharray", "4 2")
        .attr("stroke-width", 1.5)
        .style("visibility", "hidden");

    // Tooltip box (styled)
    var tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background-color", "#ffffff")
        .style("border", "1px solid #ccc")
        .style("box-shadow", "0px 4px 8px rgba(0, 0, 0, 0.1)")
        .style("padding", "10px")
        .style("border-radius", "8px")
        .style("font-family", "Arial, sans-serif")
        .style("font-size", "14px")
        .style("pointer-events", "none")
        .style("visibility", "hidden");

    // Overlay for hover detection
    chartGroup.append("rect")
        .attr("width", w - padding * 2)
        .attr("height", h - padding * 2)
        .attr("transform", `translate(${padding}, ${padding})`)
        .attr("fill", "none")
        .attr("pointer-events", "all")
        .on("mousemove", function (event) {
            var mouseX = d3.pointer(event, this)[0];
            var date = xScale.invert(mouseX);
        
            // Find the closest data point
            var closest = dataset.reduce((a, b) => {
                return Math.abs(a.date - date) < Math.abs(b.date - date) ? a : b;
            });
        
            // Calculate exact positions
            var xPosition = xScale(closest.date);
            var yPositionEmissions = yScaleEmissions(closest.emissions);
            var yPositionTemperature = yScaleTemperature(closest.temperature);
        
            hoverLine
                .attr("x1", xPosition)
                .attr("x2", xPosition)
                .style("visibility", "visible");
        
            tooltip.style("visibility", "visible")
                .html(`
                    <strong>Year:</strong> ${d3.timeFormat("%Y")(closest.date)}<br>
                    <strong>Emissions:</strong> ${closest.emissions.toFixed(2)} billion t<br>
                    <strong>Temperature:</strong> ${closest.temperature.toFixed(2)}°C
                `)
                // Position tooltip near the exact data point
                .style("top", (event.pageY - 70) + "px")
                .style("left", (event.pageX + 15) + "px");
        
            // Optionally, you can position the tooltip relative to the chart for better alignment:
            // .style("top", (yPositionEmissions - 20) + "px")
            // .style("left", (xPosition + 20) + "px");
        })
        .on("mouseout", function () {
            hoverLine.style("visibility", "hidden");
            tooltip.style("visibility", "hidden");
        });
        
}


init();
