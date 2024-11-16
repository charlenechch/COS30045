var w = 1350; // Width
var h = 650; // Height
var padding = 80;

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
    d3.select("#chart").select("svg").remove();

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
        .tickFormat(d3.timeFormat("%Y"));

    svg.append("g")
        .attr("transform", "translate(0," + (h - padding) + ")")
        .call(xAxis);

    // Add x-axis label
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("x", w / 2)
        .attr("y", h - 30)
        .text("Year")
        .style("font-size", "15px");

    // Add y-axis for emissions
    var yAxisEmissions = d3.axisLeft(yScaleEmissions)
        .ticks(10)
        .tickFormat(d => `${d} billion t`);

    svg.append("g")
        .attr("transform", "translate(" + padding + ",0)")
        .call(yAxisEmissions);

    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("x", -h / 2)
        .attr("y", 0 - (padding - 20))
        .text("Total Greenhouse Gas Emissions (Billion Tons)")
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
        .attr("y", w - padding + 40)
        .text("Average Temperature Anomaly (°C)")
        .style("font-size", "15px")
        .style("fill", "orange");

    // Add tooltips for emissions
    svg.selectAll(".dot-emissions")
        .data(dataset)
        .enter()
        .append("circle")
        .attr("class", "dot-emissions")
        .attr("cx", function (d) { return xScale(d.date); })
        .attr("cy", function (d) { return yScaleEmissions(d.emissions); })
        .attr("r", 2)
        .attr("fill", "steelblue")
        .on("mouseover", function (event, d) {
            d3.select(this).attr("r", 5).attr("fill", "orange");
        })
        .on("mouseout", function () {
            d3.select(this).attr("r", 2).attr("fill", "steelblue");
        });

    // Add tooltips for temperature
    svg.selectAll(".dot-temperature")
        .data(dataset)
        .enter()
        .append("circle")
        .attr("class", "dot-temperature")
        .attr("cx", function (d) { return xScale(d.date); })
        .attr("cy", function (d) { return yScaleTemperature(d.temperature); })
        .attr("r", 2)
        .attr("fill", "orange")
        .on("mouseover", function (event, d) {
            d3.select(this).attr("r", 5).attr("fill", "red");
        })
        .on("mouseout", function () {
            d3.select(this).attr("r", 2).attr("fill", "orange");
        });
}

init();
