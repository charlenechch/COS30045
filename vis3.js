var w3 = 1300; // Chart width
var h3 = 450; // Chart height
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

// Add X-axis label
svg3.append("text")
    .attr("class", "x-axis-label")
    .attr("x", (w3 - margin.left - margin.right) / 2) // Center horizontally
    .attr("y", h3 - margin.bottom - 10) // Adjust position below the X-axis
    .attr("text-anchor", "middle") // Center alignment
    .style("font-size", "14px")
    .style("font-weight", "bold")
    .text("Sectors");

// Add Y-axis label
svg3.append("text")
    .attr("class", "y-axis-label")
    .attr("x", -(h3 - margin.top - margin.bottom) / 2) // Center vertically
    .attr("y", -margin.left / 1.5) // Position to the left of the Y-axis
    .attr("text-anchor", "middle") // Center alignment
    .attr("transform", "rotate(-90)") // Rotate for Y-axis
    .style("font-size", "14px")
    .style("font-weight", "bold")
    .text("Emissions (Million Tons)");

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
    var entities = Array.from(new Set(data.map(function(d) {return d.Entity}))); // Unique countries/regions
    var years = Array.from(new Set(data.map(function(d) {return d.Year}))); // Unique years

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
      .attr("value", function(d) {return d})
      .text(d => d)
      .property("selected", function(d) {
        return d === defaultCountry
    }); // Default selection

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
        var filteredData = data.filter(function(d) {
            return d.Entity === selectedCountry && d.Year === selectedYear
        });

        if (filteredData.length === 0) {
            console.error("No data available for the selected country and year.");
            return;
        }

        // Map the data to sectors and values
        var chartData = Object.keys(filteredData[0])
                              .filter(key => !["Entity", "Year"].includes(key)) // Exclude non-sector columns
                              .map(key => ({ sector: key, value: +filteredData[0][key] })); // Convert values to numbers

        // Update X scale domain (sectors remain consistent across years)
        xScale3.domain(chartData.map(function(d) { return d.sector}));

        //Scalable Y scale
        if (!fixedYDomain) {
            // Calculate the maximum Y value for the selected country's data for scaling
            var maxYValue = d3.max(chartData, d => d.value);
            
            // Set Y scale domain based on the maximum Y value for the selected country
            yScale3.domain([0, maxYValue]);

            // Store the fixed Y-domain for future use
            fixedYDomain = yScale3.domain();
        }

        // If the Y-scale is already fixed 
        yScale3.domain(fixedYDomain);

        // Bind data to bars
        var bars = svg3.selectAll("rect").data(chartData);

        // Enter new bars
        bars.enter()
            .append("rect")
            .attr("x", function(d) {return xScale3(d.sector)})
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
            .attr("y", function(d) {return yScale3(d.value)})
            .attr("height", function(d) {return h3 - margin.top - margin.bottom - yScale3(d.value)});

        // Remove unused bars
        bars.exit().remove();

        // Update axes 
        xAxis3.call(d3.axisBottom(xScale3))
              .selectAll("text")
              .style("font-size", "12px")  
              .style("font-weight", "bold") 
        
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
