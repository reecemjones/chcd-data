//bar chart
import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import { select, axisBottom, axisRight, scaleLinear, scaleBand } from "d3";
import { Card } from "react-bootstrap";

function LineChart(props) {
    const svgRef = useRef();

    useEffect(() => {
        var margin = {top: 50, right: 50, bottom: 50, left: 50}
        , width = 500 - margin.left - margin.right
        , height = 450 - margin.top - margin.bottom;
      
      // The number of datapoints
      var n = 21;
      
      // 5. X scale will use the index of our data
      var xScale = d3.scaleLinear()
          .domain([0, n-1]) // input
          .range([0, width]); // output
      
      // 6. Y scale will use the randomly generate number 
      var yScale = d3.scaleLinear()
          .domain([0, 1]) // input 
          .range([height, 0]); // output 
      
      // d3's line generator
      var line = d3.line()
          .x(function(d, i) { return xScale(i); }) // set the x values for the line generator
          .y(function(d) { return yScale(d.y); }) // set the y values for the line generator 
          .curve(d3.curveMonotoneX) // apply smoothing to the line
      
      // An array of objects of length N. Each object has key -> value pair, the key being "y" and the value is a random number
      var dataset = d3.range(n).map(function(d) { return {"y": d3.randomUniform(1)() } })
      console.log(dataset)
      
      // Add the SVG to the page and employ #2
      var svg = d3.select("#chart").append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
        .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
      
      // Call the x axis in a group tag
      svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(d3.axisBottom(xScale)); // Create an axis component with d3.axisBottom
      
      // Call the y axis in a group tag
      svg.append("g")
          .attr("class", "y axis")
          .call(d3.axisLeft(yScale)); // Create an axis component with d3.axisLeft
      
      // Append the path, bind the data, and call the line generator 
      svg.append("path")
          .datum(dataset) // 10. Binds data to the line 
          .attr("class", "line") // Assign a class for styling 
          .attr("d", line); // 11. Calls the line generator 
      
      // Appends a circle for each datapoint 
      svg.selectAll(".dot")
          .data(dataset)
        .enter().append("circle") // Uses the enter().append() method
          .attr("class", "dot") // Assign a class for styling
          .attr("cx", function(d, i) { return xScale(i) })
          .attr("cy", function(d) { return yScale(d.y) })
          .attr("r", 5)
            // .on("mouseover", function(a, b, c) { 
            //         console.log(a) 
            //   this.attr('class', 'focus')
            //   })
            // .on("mouseout", function() {  })
    }, []);

    return (
      <Card style={{ width: "500px", height: "450px", border: "none" }}>
          <div id="chart"></div>
       </Card>
    );
}

export default LineChart;