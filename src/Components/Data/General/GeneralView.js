// IMPORTS ////////////////////////////////////////////////////////////////////
import TotalCount from "./TotalCount";
import GenderPieChart from "./GenderPieChart";
import { Row } from 'react-bootstrap';

// MAIN DEPENDENCIES
import React, { Component } from "react";
import neo4j from "neo4j-driver/lib/browser/neo4j-web";
// HELPER FILES
import credentials from "../../../credentials.json";
import * as query from "../../Utils/Queries.js";

class GeneralView extends Component {
    //STATE, PROPS, DRIVER INFO, & BINDS
    constructor(props) {
        super(props);
        this.state = {
            totalPeople: "",
            totalRelationships: "",
            totalInstitutions: "",
            totalEvents: "",
            totalNodes: "",
            genders: ""
        };

        // INITIATE NEO4J INSTANCE
        this.driver = neo4j.driver(credentials.port, neo4j.auth.basic(credentials.username, credentials.password), {
            disableLosslessIntegers: true
        });
        // BIND UTILITY FUNCTIONS TO THIS CONTEXT
        this.fetchTotalPeople = query.fetchTotalPeople.bind(this);
        this.fetchTotalRelationship = query.fetchTotalRelationship.bind(this);
        this.fetchTotalInstitutions = query.fetchTotalInstitutions.bind(this);
        this.fetchTotalEvents = query.fetchTotalEvents.bind(this);
        this.fetchTotalNodes = query.fetchTotalNodes.bind(this);
        this.fetchGenders = query.fetchGenders.bind(this);
    }

    //RUN ON COMPONENT MOUNT //////////////////////////////////////////////////////
    componentDidMount() {
        this.fetchTotalPeople();
        this.fetchTotalRelationship();
        this.fetchTotalEvents();
        this.fetchTotalInstitutions();
        this.fetchTotalNodes();
        this.fetchGenders();
    }

    //RENDER ///////////////////////////////////////////////////////////////////////
    render() {
        return (
            <>
                <Row>
                    <div className="d-flex">
                        <TotalCount type="Nodes" queryResult={this.state.totalNodes} />
                        <TotalCount type="Relationships" queryResult={this.state.totalRelationships} />
                        <TotalCount type="People" queryResult={this.state.totalPeople} />
                        <TotalCount type="Institutions" queryResult={this.state.totalInstitutions} />
                        <TotalCount type="Events" queryResult={this.state.totalEvents} />
                    </div>
                </Row>
                <Row className="mt-4">
                    <div>
                        {console.log(this.state.genders)}
                        <GenderPieChart queryResult={this.state.genders} />
                    </div>
                </Row>
            </>
        );
    }
}

export default GeneralView;
