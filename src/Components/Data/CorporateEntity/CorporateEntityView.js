// IMPORTS ////////////////////////////////////////////////////////////////////
import { Row } from 'react-bootstrap';

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

    // INITIATE NEO4J INSTANCE
    this.driver = neo4j.driver(credentials.port, neo4j.auth.basic(credentials.username, credentials.password), {
        disableLosslessIntegers: true
    });

    // BIND UTILITY FUNCTIONS TO THIS CONTEXT

    }
    //RUN ON COMPONENT MOUNT //////////////////////////////////////////////////////
    componentDidMount() {

    }

    //RENDER ///////////////////////////////////////////////////////////////////////
    render() {
        return (
            <>
                <Row>

                </Row>
            </>
        );
    }

}

export default CorporateEntityView;