var w = 1300; // Set the width
var h = 600; // Set the height
var padding = 40;

var dataset, xScale, yScale, line;

function init() {
    // Load the CSV data
    d3.csv("resource/Historical data global.csv", function(d) {
        return {
            date: new Date(d.Year), // Convert to Date object for proper scaling
            number: +d.Emissions
        };
    }).then(function(data) {
        dataset = data;

        // Set up scales
        xScale = d3.scaleTime()
            .domain(d3.extent(dataset, function(d) { return d.date; }))
            .range([padding, w - padding]);

        yScale = d3.scaleLinear()
            .domain([0, d3.max(dataset, function(d) { return d.number; })])
            .range([h - padding, padding]); // Adjust range for proper axis direction

        line = d3.line()
            .x(function(d) { return xScale(d.date); })
            .y(function(d) { return yScale(d.number); });

        // Create the line chart with animations
        lineChart(dataset);
    });
}

function lineChart(dataset) {
    var svg = d3.select("#chart")
        .append("svg")
        .attr("width", w)
        .attr("height", h + 50);

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

        var totalLength = path.node().getTotalLength();
        path.attr("stroke-dasharray", totalLength + " " + totalLength)
            .attr("stroke-dashoffset", totalLength)
            .transition()
            .duration(2000)
            .ease(d3.easeLinear)
            .attr("stroke-dashoffset", 0);
    
        // Add circles for each data point with interactivity
        svg.selectAll("circle")
            .data(dataset)
            .enter()
            .append("circle")
            .attr("cx", function(d) { return xScale(d.date); })
            .attr("cy", function(d) { return yScale(d.emissions); })
            .attr("r", 3)
            .attr("fill", "steelblue")
            .attr("opacity", 0)
            .transition()
            .delay(function(d, i) { return i * 50; }) // Stagger animation for points
            .attr("opacity", 1)
            .on("mouseover", function(event, d) {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("r", 6); // Enlarge point on hover
    
                tooltip.transition().duration(200).style("opacity", 1);
                tooltip.html("Year: " + d.date.getFullYear() + "<br>Emissions: " + d.emissions)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 10) + "px");
            })
            .on("mouseout", function() {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("r", 3); // Reset point size
    
                tooltip.transition().duration(200).style("opacity", 0);
            });

    // Add x-axis with custom styling
    var xAxis = d3.axisBottom(xScale).ticks(10);
    svg.append("g")
        .attr("transform", "translate(0, " + h + ")")
        .call(xAxis)
        .style("font-size", "12px");

    // Add y-axis with custom styling
    var yAxis = d3.axisLeft(yScale).ticks(10);
    svg.append("g")
        .attr("transform", "translate(" + padding + ", 0)")
        .call(yAxis)
        .style("font-size", "12px");

    // Add x-axis label
    svg.append("text")
        .attr("x", w / 2)
        .attr("y", h + 40)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .text("Year");

    // Add y-axis label
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("x", -h / 2)
        .attr("y", 20)
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .text("Emissions");
}

// Call init to render the visualization
init();
