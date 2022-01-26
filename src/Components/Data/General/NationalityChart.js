import * as d3 from "d3";
import React, { useEffect, useState, useRef } from "react";
import { Card } from "react-bootstrap";

function BarGraph(props) {
    const graph = useRef();

    const drawGraph = () => {
        const sample = [
            {
                nationality: "United States of America",
                value: 0,
                color: "#000000"
            },
            {
                nationality: "Australia",
                value: 3,
                color: "#00a2ee"
            },
            {
                nationality: "England",
                value: 3,
                color: "#00a2ee"
            },
            {
                nationality: "Canada",
                value: 3,
                color: "#00a2ee"
            },
            {
                nationality: "China",
                value: 27,
                color: "#00a2ee"
            },
            {
                nationality: "Italy",
                value: 10,
                color: "#00a2ee"
            },
            {
                nationality: "Portugal",
                value: 5,
                color: "#00a2ee"
            },
            {
                nationality: "Spain",
                value: 2,
                color: "#fbcb39"
            },
            {
                nationality: "France",
                value: 8,
                color: "#007bc8"
            },
            {
                nationality: "Belgium",
                value: 3,
                color: "#65cedb"
            },
            {
                nationality: "Austria",
                value: 1,
                color: "#ff6e52"
            },
            {
                nationality: "Germany",
                value: 1,
                color: "#f9de3f"
            },
            {
                nationality: "Switzerland",
                value: 2,
                color: "#5d2f8e"
            },
            {
                nationality: "Sweden",
                value: 1,
                color: "#008fc9"
            },
            {
                nationality: "Norway",
                value: 1,
                color: "#507dca"
            }
        ];

        const svg = d3.select(graph);
        //const svgContainer = d3.select('#container');

        const margin = 80;
        const width = 1000 - 2 * margin;
        const height = 600 - 2 * margin;

        //const chart = svg.append("g").attr("transform", `translate(${margin}, ${margin})`);

        const xScale = d3
            .scaleBand()
            .range([0, width])
            .domain(sample.map((s) => s.nationality))
            .padding(0.4);

        const yScale = d3.scaleLinear().range([height, 0]).domain([0, 100]);

        //vertical grid lines
        const makeXLines = () => d3.axisBottom()
        .scale(xScale)

        const makeYLines = () => d3.axisLeft().scale(yScale);

        //chart.append("g").attr("transform", `translate(0, ${height})`).call(d3.axisBottom(xScale));

        //chart.append("g").call(d3.axisLeft(yScale));

        //chart.append("g").attr("class", "grid").call(makeYLines().tickSize(-width, 0, 0).tickFormat(""));

        //const barGroups = chart.selectAll().data(sample).enter().append("g");

        barGroups
            .append("rect")
            .attr("class", "bar")
            .attr("x", (g) => xScale(g.nationality))
            .attr("y", (g) => yScale(g.value))
            .attr("height", (g) => height - yScale(g.value))
            .attr("width", xScale.bandwidth())
            .on("mouseenter", function (actual, i) {
                d3.selectAll(".value").attr("opacity", 0);

                d3.select(this)
                    .transition()
                    .duration(300)
                    .attr("opacity", 0.6)
                    .attr("x", (a) => xScale(a.nationality) - 5)
                    .attr("width", xScale.bandwidth() + 10);

                const y = yScale(actual.value);

                line = chart
                    .append("line")
                    .attr("id", "limit")
                    .attr("x1", 0)
                    .attr("y1", y)
                    .attr("x2", width)
                    .attr("y2", y);

                barGroups
                    .append("text")
                    .attr("class", "divergence")
                    .attr("x", (a) => xScale(a.nationality) + xScale.bandwidth() / 2)
                    .attr("y", (a) => yScale(a.value) + 30)
                    .attr("fill", "white")
                    .attr("text-anchor", "middle")
                    .text((a, idx) => {
                        const divergence = (a.value - actual.value).toFixed(1);

                        let text = "";
                        if (divergence > 0) text += "+";
                        text += `${divergence}%`;

                        return idx !== i ? text : "";
                    });
            })
            .on("mouseleave", function () {
                d3.selectAll(".value").attr("opacity", 1);

                d3.select(this)
                    .transition()
                    .duration(300)
                    .attr("opacity", 1)
                    .attr("x", (a) => xScale(a.nationality))
                    .attr("width", xScale.bandwidth());

                chart.selectAll("#limit").remove();
                chart.selectAll(".divergence").remove();
            });

        barGroups
            .append("text")
            .attr("class", "value")
            .attr("x", (a) => xScale(a.nationality) + xScale.bandwidth() / 2)
            .attr("y", (a) => yScale(a.value) + 30)
            .attr("text-anchor", "middle")
            .text((a) => `${a.value}%`);

        svg.append("text")
            .attr("class", "label")
            .attr("x", -(height / 2) - margin)
            .attr("y", margin / 2.4)
            .attr("transform", "rotate(-90)")
            .attr("text-anchor", "middle")
            .text("Percent (%)");

        svg.append("text")
            .attr("class", "label")
            .attr("x", width / 2 + margin)
            .attr("y", height + margin * 1.7)
            .attr("text-anchor", "middle")
            .text("nationality");

        svg.append("text")
            .attr("class", "title")
            .attr("x", width / 2 + margin)
            .attr("y", 40)
            .attr("text-anchor", "middle")
            .text("Nationality of People");
    };

    useEffect(() => {
        drawGraph();
    }, []);

    return (
        <Card style={{ width: "360px", border: "none" }}>
            <Card.Body>
                <Card.Title className="fs-6 mb-4 mt-2 text-center fw-normal">{props.title}</Card.Title>
                <div ref={graph}></div>
            </Card.Body>
        </Card>
    );
}

export default BarGraph;