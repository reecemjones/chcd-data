// IMPORTS ////////////////////////////////////////////////////////////////////
import * as d3 from "d3";

// MAIN DEPENDENCIES
import React, { useEffect, useState, useRef } from "react";
import {Card, Spinner} from 'react-bootstrap';



// FUNCTIONAL COMPONENT ////////////////////////////////////////////////////////

function GenderPieChart(props) {
    useEffect(() => {
        // drawChart();
    }, []);

    // RETURNS PLACEHOLDER
    return ( 
        <Card style={{ width: '400px', border: 'none' }}>
          <Card.Body>
            <Card.Title className="fs-6">Gender</Card.Title>
            Pie chart will go here
          </Card.Body>
        </Card>
    )

}

export default GenderPieChart
