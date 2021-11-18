// IMPORTS ////////////////////////////////////////////////////////////////////
import TotalCount from "./TotalCount";

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
            totalCorporateEntities: "",
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
        this.fetchTotalCorporateEntities = query.fetchTotalCorporateEntities.bind(this);
    }

    //RUN ON COMPONENT MOUNT //////////////////////////////////////////////////////
    componentDidMount() {
        this.fetchTotalPeople();
        this.fetchTotalRelationship();
        this.fetchTotalEvents();
        this.fetchTotalInstitutions();
        this.fetchTotalNodes();
        this.fetchTotalCorporateEntities();
    }

    //RENDER ///////////////////////////////////////////////////////////////////////
    render() {
        return (
            <>
                <div className="d-flex flex-wrap flex-row justify-content-center">
                    <TotalCount type="Nodes" queryResult={this.state.totalNodes} />
                    <TotalCount type="Relationships" queryResult={this.state.totalRelationships} />
                    <TotalCount type="People" queryResult={this.state.totalPeople} />
                    <TotalCount type="Institutions" queryResult={this.state.totalInstitutions} />
                    <TotalCount type="Events" queryResult={this.state.totalEvents} />
                    <TotalCount type="Corporate Entities" queryResult={this.state.totalCorporateEntities} />
                </div>
            </>
        );
    }
}

export default GeneralView;
