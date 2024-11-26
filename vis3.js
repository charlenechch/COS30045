var w3 = 1300; // Adjust chart width to fit the window
var h3 = 600; // Fixed height
var barPadding = 5;
var dataset3, xScale3, yScale3, xAxis3, yAxis3;

// Load CSV and Initialize
d3.csv("Major Sectors.csv").then(function (data) {
    // Parse CSV
    var years = Object.keys(data[0]).filter(function (key) {
        return key !== "Economic Activity";
    });
    dataset3 = data.map(function (d) {
        return {
            activity: d["Economic Activity"],
            values: years.map(function (year) {
                return { year: year, value: +d[year] };
            })
        };
    });

    // Determine the maximum value across all years for a fixed Y-axis scale
    var maxYValue = d3.max(dataset3, function (d) {
        return d3.max(d.values, function (v) { return v.value; });
    });

    // Initial Year (set to the first year)
    var selectedYear = years[0];

    // Add Slider Container
    var sliderContainer = d3.select("#chart3")
        .insert("div", ":first-child")
        .attr("class", "slider-container")
        .style("text-align", "center")
        .style("margin-bottom", "10px");

    // Add Slider Label
    sliderContainer.append("label")
        .attr("for", "year-slider")
        .text("Select Year: ")
        .style("margin-right", "10px")
        
 // Initial Year (set to the first year)
var selectedYear = years[0];

// Add Year Value Display
var yearLabel = sliderContainer.append("span")
    .attr("id", "selected-year")
    .style("font-weight", "bold")
    .text(selectedYear);

// Add Slider Input
sliderContainer.append("input")
    .attr("type", "range")
    .attr("id", "year-slider3")
    .attr("min", 0)
    .attr("max", years.length - 1) // Map slider range to years array index
    .attr("step", 1)
    .attr("value", 0) // Set initial value to the first year
    .style("width", "60%")
    .on("input", function () {
        selectedYear = years[this.value]; // Get the corresponding year
        yearLabel.text(selectedYear);  // Update the year label
        updateChart(selectedYear);  // Update the chart with the selected year
    });

        
    // Scales
    xScale3 = d3.scaleBand()
        .domain(dataset3.map(function (d) { return d.activity; }))
        .range([0, w3 - 100])
        .padding(0.1);

    yScale3 = d3.scaleLinear()
        .domain([0, maxYValue]) // Fixed domain for all years
        .range([h3 - 100, 0]);

    // Axes
    xAxis3 = d3.axisBottom(xScale3);
    yAxis3 = d3.axisLeft(yScale3).tickFormat(d3.format(".2s")); // Format large numbers

    // SVG Container
    var svg3 = d3.select("#chart3")
        .append("svg")
        .attr("width", w3)
        .attr("height", h3)
        .append("g")
        .attr("transform", "translate(50, 50)");

    // Add Axes Groups
    svg3.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${h3 - 100})`);

    svg3.append("g")
        .attr("class", "y-axis")
        .call(yAxis3);

    // Add Bars Group
    var barsGroup = svg3.append("g");

    // Update Function
    function updateChart(year) {
        var yearData = dataset3.map(function (d) {
            return {
                activity: d.activity,
                value: d.values.find(function (v) { return v.year === year; }).value
            };
        });

        // No need to update Y-axis scale since it's fixed

        // Bind Data to Bars
        var bars = barsGroup.selectAll("rect")
            .data(yearData);

// Tooltip box (styled)
var tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip-vis3") // Ensure unique tooltip class
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

// When mouseover, display the tooltip
bars.enter()
    .append("rect")
    .attr("x", function (d) { return xScale3(d.activity); })
    .attr("y", yScale3(0)) // Start at 0 height for animation
    .attr("width", xScale3.bandwidth())
    .attr("height", 0) // Start at 0 height for animation
    .attr("fill", "#fb8433")
    .on("mouseover", function(event, d) {
        // Convert the emissions to billions and format to 2 decimal places
        var emissionsInBillions = (d.value / 1e6).toFixed(2);

        // Format the tooltip content
        var tooltipContent = `
            <strong>Emissions: </strong> ${emissionsInBillions} million t
        `;

        // Display the tooltip with the content
        tooltip.style("visibility", "visible")
            .html(tooltipContent);  // Set the content inside the tooltip

        // Position the tooltip based on mouse position
        tooltip.style("top", (event.pageY - 30) + "px")
            .style("left", (event.pageX + 10) + "px");
    })
    .on("mousemove", function(event, d) {
        // Update the tooltip position dynamically as the mouse moves
        tooltip.style("top", (event.pageY - 30) + "px")
            .style("left", (event.pageX + 10) + "px");
    })
    .on("mouseout", function() {
        // Hide the tooltip when mouse leaves the bar
        tooltip.style("visibility", "hidden");
    })
    .merge(bars) // Update Bars
    .transition()
    .duration(500)
    .attr("y", function (d) { return yScale3(d.value); })
    .attr("height", function (d) { return h3 - 100 - yScale3(d.value); });
    
        // Exit Bars
        bars.exit()
            .transition()
            .duration(500)
            .attr("y", yScale3(0))
            .attr("height", 0)
            .remove();

        // Update X-Axis
        svg3.select(".x-axis")
            .call(xAxis3)
            .selectAll("text")
            .attr("transform", "rotate(-15)")
            .style("text-anchor", "end");
    }

    // Initial Render
    updateChart(selectedYear);
});
