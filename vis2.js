function initVis2() {
    const width = 580; // Increased width for full map
    const height = 673; // Adjusted height for better fit

    const projection = d3.geoMercator()
        .scale(116)
        .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    const svg = d3.select("#chart2")
        .append("svg")
        .attr("width", width + 200) // Extra width for legend
        .attr("height", height);

    const mapGroup = svg.append("g");

    const tooltip = d3.select("#chart2")
        .append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("pointer-events", "none")
        .style("background", "white")
        .style("border", "1px solid #ccc")
        .style("border-radius", "5px")
        .style("padding", "10px")
        .style("box-shadow", "0px 4px 6px rgba(0, 0, 0, 0.1)")
        .style("opacity", 0)
        .style("z-index", 10);

    const zoom = d3.zoom()
        .scaleExtent([1, 8])
        .translateExtent([[0, 0], [width, height]])
        .on("zoom", (event) => {
            mapGroup.attr("transform", event.transform);
        });

    svg.call(zoom);

    function updateTopRegionsTable(year, csvData) {
        // Filter data for the selected year
        const yearData = csvData.filter(d => d.year === year);
    
        // Sort data by emissions in descending order and take the top 10
        const topRegions = yearData
            .sort((a, b) => b.emissions - a.emissions)
            .slice(0, 10);
    
        // Get the table body
        const tableBody = document.querySelector("#top-regions-table tbody");
        tableBody.innerHTML = ""; // Clear previous entries
    
        // Populate the table with the top 10 regions
        topRegions.forEach((region, index) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${region.country}</td>
                <td>${region.emissions.toFixed(2)} tonnes of CO₂</td>
            `;
            tableBody.appendChild(row);
        });
    }

    Promise.all([
        d3.json("resource/countries.geo.json"),
        d3.csv("resource/percapita.csv", d => ({
            country: d.Entity,
            code: d.Code,
            year: +d.Year,
            emissions: parseFloat(d.Emissions) || 0
        }))
    ]).then(([geoData, csvData]) => {
        const slider = d3.select("#year-slider");
        const yearLabel = d3.select("#current-year");

        const colorScale = d3.scaleSequential()
            .domain([0, 19.446]) // Adjust domain based on your dataset
            .interpolator(d3.interpolateOranges);

        const updateMap = (selectedYear) => {
            yearLabel.text(selectedYear);

            const yearData = csvData.filter(d => d.year === +selectedYear);
            const emissionsMap = new Map(yearData.map(d => [d.code, d.emissions]));

            mapGroup.selectAll("path")
                .data(geoData.features)
                .join("path")
                .attr("d", path)
                .style("fill", d => {
                    const emissions = emissionsMap.get(d.id);
                    return emissions ? colorScale(emissions) : "#ccc";
                })
                .style("stroke", "#333")
                .style("stroke-width", 0.5)
                .on("mouseover", function (event, d) {
                    const emissions = emissionsMap.get(d.id);
                    tooltip.transition().duration(200).style("opacity", 0.9);
                    tooltip.html(`
                        <strong>${d.properties.name}</strong><br/>
                        ${emissions ? `Emissions: ${emissions.toFixed(2)} tonnes of CO₂` : "No data"}
                    `)
                    .style("left", (event.offsetX + 30) + "px")
                    .style("top", (event.offsetY - 110) + "px");
                    d3.select(this).style("stroke-width", 1.5);
                })
                .on("mouseout", function () {
                    tooltip.transition().duration(200).style("opacity", 0);
                    d3.select(this).style("stroke-width", 0.5);
                });
        };

        // Add legend
        const legend = svg.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(${width + 90}, 50)`);

        const legendHeight = 300; // Total height for the legend
        const legendDomain = colorScale.domain(); // Domain of the color scale

        // Adjust legend scale to match color scale
        const legendScale = d3.scaleLinear()
            .domain(legendDomain)
            .range([legendHeight, 0]);

        // Add color rectangles for the legend
        const legendRects = legend.selectAll("rect")
            .data(d3.range(0, 1.1, 0.1)) // 0 to 1 with a step of 0.1
            .enter()
            .append("rect")
            .attr("x", 0)
            .attr("y", d => legendScale(d * legendDomain[1])) // Scale to match the domain
            .attr("width", 20)
            .attr("height", legendHeight / 10) // Divide legend into equal parts
            .style("fill", d => colorScale(d * legendDomain[1]));

        // Add axis to show the scale
        const legendAxis = d3.axisRight(legendScale)
            .ticks(5) // Adjust the number of ticks
            .tickFormat(d3.format(".1f")); // Format for values

        legend.append("g")
            .attr("class", "legend-axis")
            .attr("transform", `translate(20, 0)`) // Position the axis next to the rectangles
            .call(legendAxis);


        legend.selectAll("rect")
            .data(d3.range(0, 1.1, 0.1))
            .enter()
            .append("rect")
            .attr("x", 0)
            .attr("y", d => legendScale(d * 19.445))
            .attr("width", 20)
            .attr("height", d => legendScale(d * 19.445 / 10))
            .style("fill", d => colorScale(d * 19.445));

        slider.on("input", function () {
            const selectedYear = +this.value;
            updateMap(selectedYear);
            updateTopRegionsTable(selectedYear, csvData); // Add this line
        });

        updateMap(1850);
        updateTopRegionsTable(1850, csvData);
    }).catch(error => console.error(error));
}

window.onload = initVis2;
