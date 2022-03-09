// IMPORTS ////////////////////////////////////////////////////////////////////
import { Row } from 'react-bootstrap';
import BarGraph from '../General/BarGraph';

// MAIN DEPENDENCIES
import React, { Component } from "react";
import neo4j from "neo4j-driver/lib/browser/neo4j-web";
// HELPER FILES
import credentials from "../../../credentials.json";
import * as query from "../../Utils/Queries.js";
import * as helper from "../../Utils/Helpers.js";

class CorporateEntityView extends Component {
    //STATE, PROPS, DRIVER INFO, & BINDS
    constructor(props) {
        super(props);
        this.state = {
        nationality:"",
        nationalityNull:"",
        };

    // INITIATE NEO4J INSTANCE
    this.driver = neo4j.driver(credentials.port, neo4j.auth.basic(credentials.username, credentials.password), {
        disableLosslessIntegers: true
    });

    // BIND UTILITY FUNCTIONS TO THIS CONTEXT
    this.fetchNationality = query.fetchNationality.bind(this);
    this.fetchNationalityNull = query.fetchNationalityNull.bind(this);
    }
    //RUN ON COMPONENT MOUNT //////////////////////////////////////////////////////
    componentDidMount() {
    this.fetchNationality();
    this.fetchNationalityNull();
    }

    sanitizeList(list, property1,) {
        // Loop through each list object and sanitize for d3 processing (d3 PieChart.js requires 'key' and 'value' object pairs)
        for (let i = 0; i < list.length; i++) {
            this.renameProperty(list[i], property1, 'key')
            this.renameProperty(list[i], 'count', 'value')
        } 
    }

    //RENDER ///////////////////////////////////////////////////////////////////////
    render() {
        return (
            <>
                <Row className="mt-4 w-100 bg-white justify-content-around">
                {
                this.state.nationality && (
                <BarGraph title="Nationality of People" 
                queryResult={this.state.nationality}
                queryResultNationalityNull={this.state.nationalityNull}
                />
                )}
                </Row>
            </>
        );
    }

}

export default CorporateEntityView;