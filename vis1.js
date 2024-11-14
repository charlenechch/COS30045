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
                .attr("width", w)        //set attributes 
                .attr("height", h + 50); //set attributes 

    //add x axis 
    var xAxis = d3.axisBottom()                         //add an axis at the bottom of the chart
                  .scale(xScale); 

    //add y axis 
    var yAxis = d3.axisLeft()                           //add an axis at the left side of the chart
                  .ticks(10)
                  .scale(yScale);   

              svg.append("path")
                 .datum(dataset)            //bind each single data 
                 .attr("class", "line")
                 .attr("d", line);          //generate the line

              svg.append("g")
                 .attr("transform", "translate(0, " + h + ")") // Position x-axis 
                 .call(xAxis); 
             
              svg.append("g")
                 .attr("transform", "translate(55, 0)") // Position y-axis to the left of the bars
                 .call(yAxis);
}

init();