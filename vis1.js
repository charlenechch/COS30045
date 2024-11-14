var w = 800; //set the wdith
var h = 500; //set the height
var padding = 55; 

var dataset, xScale, yScale, line; 

function init () {

    //load the historical .csv file
    d3.csv("resource/Historical data global.csv", function(d){

        return {
            date: d.Year, 
            number: +d.Emissions
        };        

    }).then(function(data) {

        dataset = data; 

        xScale = d3.scaleTime()
        .domain([
             d3.min(dataset, function(d) {return d.date}),       //min date
             d3.max(dataset, function(d) {return d.date})        //max date
        ])
        .range([padding, w - padding]);

        yScale = d3.scaleLinear()
                .domain([0, d3.max(dataset, function(d) {return d.number; }) ])
                .range([h, 0]);                                         //set the range of y values to display larger value on top

        line = d3.line()
                .x(function(d) {return xScale(d.date); })               //x coordinates
                .y(function(d) {return yScale(d.number); })             //y coordinates

        lineChart(dataset)
        console.table(dataset, ["date", "number"]); 
    }); 
}

function lineChart() {
    var svg = d3.select("#chart")
                .append("svg")
                .attr("width", w)
                .attr("height", h + 50);

    var xAxis = d3.axisBottom().scale(xScale);
    var yAxis = d3.axisLeft().ticks(10).scale(yScale);

    svg.append("path")
       .datum(dataset)
       .attr("class", "line")
       .attr("d", line)
       .attr("fill", "none")
       .attr("stroke", "steelblue")
       .attr("stroke-width", 2);

    svg.append("g")
       .attr("transform", "translate(0, " + h + ")")
       .call(xAxis);

    svg.append("g")
       .attr("transform", "translate(55, 0)")
       .call(yAxis);

    // Add circles for each data point
    svg.selectAll("circle")
       .data(dataset)
       .enter()
       .append("circle")
       .attr("cx", function(d) { return xScale(d.date); })
       .attr("cy", function(d) { return yScale(d.number); })
       .attr("r", 4)
       .attr("fill", "steelblue")
       .on("mouseover", function(event, d) {
           d3.select("#tooltip")
             .style("opacity", 1)
             .html("Year: " + d.date + "<br>Emissions: " + d.number)
             .style("left", (event.pageX + 10) + "px")
             .style("top", (event.pageY - 10) + "px");
       })
       .on("mouseout", function() {
           d3.select("#tooltip").style("opacity", 0);
       });
}



init();