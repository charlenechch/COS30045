var w3 = 1300; // Chart width
var h3 = 600; // Chart height
var margin = { top: 50, right: 50, bottom: 50, left: 100 };

// Create SVG container
var svg3 = d3.select("#chart3")
    .append("svg")
    .attr("width", w3)
    .attr("height", h3)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Scales
var xScale3 = d3.scaleBand().range([0, w3 - margin.left - margin.right]).padding(0.1);
var yScale3 = d3.scaleLinear().range([h3 - margin.top - margin.bottom, 0]);

// Axes
var xAxis3 = svg3.append("g").attr("transform", `translate(0, ${h3 - margin.top - margin.bottom})`);
var yAxis3 = svg3.append("g");

// Tooltip
var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip3")
    .style("position", "absolute")
    .style("visibility", "hidden")
    .style("background", "#fff")
    .style("border", "1px solid #ccc")
    .style("padding", "8px")
    .style("border-radius", "5px");

// Load and parse the CSV file
d3.csv("resource/ghg-emissions-by-sector.csv").then(function (data) {
    // Extract unique countries/entities and years
    var entities = Array.from(new Set(data.map(d => d.Entity))); // Unique countries/regions
    var years = Array.from(new Set(data.map(d => d.Year))); // Unique years

    // Default selections
    var defaultCountry = "World";
    var initialYear = years[0];

    // Variable to store the fixed Y-scale domain
    var fixedYDomain = null;

    // Populate the dropdown for countries
    d3.select("#country-select")
        .selectAll("option")
        .data(entities)
        .enter()
        .append("option")
        .attr("value", d => d)
        .text(d => d)
        .property("selected", d => d === defaultCountry); // Default selection

    // Add slider container
    var sliderContainer = d3.select("#chart3")
        .insert("div", ":first-child")
        .attr("class", "slider-container")
        .style("text-align", "center")
        .style("margin-bottom", "20px");

    // Add slider label and display selected year
    sliderContainer.append("label")
        .attr("for", "year-slider3")
        .text("Select Year: ")
        .style("margin-right", "10px");

    var yearLabel = sliderContainer.append("span")
        .attr("id", "selected-year")
        .style("font-weight", "bold")
        .text(initialYear);

    // Add slider input
    sliderContainer.append("input")
        .attr("type", "range")
        .attr("id", "year-slider3")
        .attr("min", 0)
        .attr("max", years.length - 1)
        .attr("value", years.indexOf(initialYear))
        .style("width", "60%")
        .on("input", function () {
            var selectedYear = years[this.value];
            yearLabel.text(selectedYear); // Update displayed year
            updateChart(d3.select("#country-select").node().value, selectedYear); // Update chart
        });

    // Update the chart based on the selected country and year
    function updateChart(selectedCountry, selectedYear) {
        // Filter data for the selected country and year
        var filteredData = data.filter(d => d.Entity === selectedCountry && d.Year === selectedYear);

        if (filteredData.length === 0) {
            console.error("No data available for the selected country and year.");
            return;
        }

        // Map the data to sectors and values
        var chartData = Object.keys(filteredData[0])
            .filter(key => !["Entity", "Year"].includes(key)) // Exclude non-sector columns
            .map(key => ({ sector: key, value: +filteredData[0][key] })); // Convert values to numbers

        // Update X scale domain (sectors remain consistent across years)
        xScale3.domain(chartData.map(d => d.sector));

        // If the Y-scale is not fixed yet (i.e., on first country selection), calculate the max Y value
        if (!fixedYDomain) {
            // Calculate the maximum Y value for the selected country's data for scaling
            var maxYValue = d3.max(chartData, d => d.value);
            
            // Set Y scale domain based on the maximum Y value for the selected country
            yScale3.domain([0, maxYValue]);

            // Store the fixed Y-domain for future use
            fixedYDomain = yScale3.domain();
        }

        // If the Y-scale is already fixed (i.e., a country has been selected before), use the fixed domain
        yScale3.domain(fixedYDomain);

        // Bind data to bars
        var bars = svg3.selectAll("rect").data(chartData);

        // Enter new bars
        bars.enter()
            .append("rect")
            .attr("x", d => xScale3(d.sector))
            .attr("y", yScale3(0)) // Start animation from 0 height
            .attr("width", xScale3.bandwidth())
            .attr("height", 0)
            .attr("fill", "#fb8433")
            .on("mouseover", function (event, d) {
                tooltip.style("visibility", "visible")
                    .html(`<strong>${d.sector}</strong>: ${(d.value / 1e6).toLocaleString()} million tons`);
            })
            .on("mousemove", function (event) {
                tooltip.style("top", `${event.pageY - 30}px`).style("left", `${event.pageX + 15}px`);
            })
            .on("mouseout", function () {
                tooltip.style("visibility", "hidden");
            })
            .merge(bars) // Update existing bars
            .transition()
            .duration(500)
            .attr("y", d => yScale3(d.value))
            .attr("height", d => h3 - margin.top - margin.bottom - yScale3(d.value));

        // Remove unused bars
        bars.exit().remove();

        // Update axes (X-axis updates for sectors, Y-axis remains fixed once set)
        xAxis3.call(d3.axisBottom(xScale3))
            .selectAll("text")
        yAxis3.call(d3.axisLeft(yScale3).tickFormat(d => `${d / 1e6}M`)); // Display Y-axis in millions
    }

    // Render the initial chart
    updateChart(defaultCountry, initialYear);

    // Update the chart when the country selection changes
    d3.select("#country-select").on("change", function () {
        var selectedCountry = this.value;
        var selectedYear = years[d3.select("#year-slider3").node().value];
        // Reset fixed Y-domain when a new country is selected
        fixedYDomain = null;
        updateChart(selectedCountry, selectedYear);
    });
});
