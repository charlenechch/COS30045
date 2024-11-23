function initVis2() {
    const width = 1000; // Increased width for full map
    const height = 673; // Adjusted height for better fit

    // Adjust projection for better map fit
    const projection = d3.geoMercator()
        .scale(116) // Increased scale for better detail
        .translate([width / 2, height / 2]); // Centered translation

    const path = d3.geoPath().projection(projection);

    const svg = d3.select("#chart2")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    const mapGroup = svg.append("g"); // Group for the map elements

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

        const countryNameMap = {
            // Correct mappings for common name differences
            "United States of America": "United States",
            "Russian Federation": "Russia",
            "Republic of Korea": "South Korea",
            "United Republic of Tanzania": "Tanzania",
            "Czech Republic": "Czechia",
            "Ivory Coast": "Côte d'Ivoire",
            "Democratic Republic of the Congo": "Democratic Republic of Congo",
            "Republic of the Congo": "Congo",
            "The Bahamas": "Bahamas",
            "Swaziland": "Eswatini",
            "Macedonia": "North Macedonia",
            "Guinea Bissau": "Guinea-Bissau",
            "Serbia": "Republic of Serbia",
        
            // Additional corrections from mismatches
            "Cote d'Ivoire": "Côte d'Ivoire",
            "Micronesia (country)": "Micronesia",
            "Sao Tome and Principe": "São Tomé and Príncipe",
            "Palau": "Palau", // Confirmed valid
            "Kiribati": "Kiribati", // Confirmed valid
            "Eswatini": "Swaziland",
            "Cape Verde": "Cabo Verde",
            "Saint Kitts and Nevis": "Saint Kitts and Nevis",
            "Saint Lucia": "Saint Lucia",
            "Saint Vincent and the Grenadines": "Saint Vincent and the Grenadines",
        
            // Groupings and regions to exclude
            "Africa": null,
            "Asia": null,
            "Europe": null,
            "North America": null,
            "South America": null,
            "Oceania": null,
            "World": null,
            "European Union (27)": null,
            "High-income countries": null,
            "Low-income countries": null,
            "Lower-middle-income countries": null,
            "Upper-middle-income countries": null,
        };
        

    const zoom = d3.zoom()
        .scaleExtent([1, 8]) // Define zoom scale limits
        .translateExtent([[0, 0], [width, height]]) // Limit panning to SVG bounds
        .on("zoom", (event) => {
            mapGroup.attr("transform", event.transform); // Apply zoom and pan
        });

    svg.call(zoom); // Bind zoom behavior to the SVG

    Promise.all([
        d3.json("resource/countries.geo.json"),
        d3.csv("resource/percapita.csv", d => ({
            country: d.Entity,
            year: +d.Year,
            emissions: parseFloat(d.Emissions) || 0
        }))
    ]).then(([geoData, csvData]) => {
        const slider = d3.select("#year-slider");
        const yearLabel = d3.select("#current-year");

        const colorScale = d3.scaleSequential()
            .domain([0, 19.445]) // Adjust domain based on your dataset
            .interpolator(d3.interpolateOranges);

        const updateMap = (selectedYear) => {
            yearLabel.text(selectedYear);

            const yearData = csvData.filter(d => d.year === +selectedYear);
            const emissionsMap = new Map(yearData.map(d => [d.country, d.emissions]));

            mapGroup.selectAll("path")
                .data(geoData.features)
                .join("path")
                .attr("d", path)
                .style("fill", d => {
                    const correctedName = countryNameMap[d.properties.name] || d.properties.name;
                    const emissions = emissionsMap.get(correctedName);
                    return emissions ? colorScale(emissions) : "#ccc";
                })
                .style("stroke", "#333")
                .style("stroke-width", 0.5)
                .on("mouseover", function (event, d) {
                    const correctedName = countryNameMap[d.properties.name] || d.properties.name;
                    const emissions = emissionsMap.get(correctedName);
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

        slider.on("input", function () {
            const selectedYear = +this.value;
            updateMap(selectedYear);
        });

        updateMap(1850); // Initialize the map with the latest year
    }).catch(error => console.error(error));

}

window.onload = initVis2;
