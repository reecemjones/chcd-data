// IMPORTS ////////////////////////////////////////////////////////////////////
import TotalCount from "./TotalCount";
import PieChart from "./PieChart";
import SwitchablePieChart from "./SwitchablePieChart";
import { Row } from 'react-bootstrap';

// MAIN DEPENDENCIES
import React, { Component } from "react";
import neo4j from "neo4j-driver/lib/browser/neo4j-web";
// HELPER FILES
import credentials from "../../../credentials.json";
import * as query from "../../Utils/Queries.js";
import * as helper from "../../Utils/Helpers.js";

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
            genders: "",
            christianTradition: "",
            religiousFamily: "",
            religiousFamilyNullValues: "",
            christianTraditionNullValues: ""
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
        this.fetchGenders = query.fetchGenders.bind(this);
        this.fetchChristianTradition = query.fetchChristianTradition.bind(this);
        this.fetchReligiousFamily = query.fetchReligiousFamily.bind(this);
        this.fetchReligiousFamilyNullValues = query.fetchReligiousFamilyNullValues.bind(this);
        this.fetchChristianTraditionNullValues = query.fetchChristianTraditionNullValues.bind(this);
        this.renameProperty = helper.renameProperty.bind(this);
    }

    //RUN ON COMPONENT MOUNT //////////////////////////////////////////////////////
    componentDidMount() {
        this.fetchTotalPeople();
        this.fetchTotalRelationship();
        this.fetchTotalEvents();
        this.fetchTotalInstitutions();
        this.fetchTotalNodes();
        this.fetchTotalCorporateEntities();
        this.fetchGenders();
        this.fetchChristianTradition();
        this.fetchReligiousFamily();
        this.fetchReligiousFamilyNullValues();
        this.fetchChristianTraditionNullValues();
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
                <Row className="bg-white">
                    <div className="d-flex flex-wrap flex-row justify-content-center">
                        <TotalCount type="Nodes" queryResult={this.state.totalNodes} />
                        <TotalCount type="Relationships" queryResult={this.state.totalRelationships} />
                        <TotalCount type="People" queryResult={this.state.totalPeople} />
                        <TotalCount type="Institutions" queryResult={this.state.totalInstitutions} />
                        <TotalCount type="Events" queryResult={this.state.totalEvents} />
                        <TotalCount type="Corporate Entities" queryResult={this.state.totalCorporateEntities} />
                    </div>
                </Row>
                <Row className="mt-4">
                    { this.state.genders && (
                        this.sanitizeList(this.state.genders, 'gender'),
                        <PieChart title="Gender By Total Number of People" queryResult={this.state.genders} />
                    )}
                    { (this.state.christianTradition && this.state.religiousFamily) && (
                        this.sanitizeList(this.state.christianTradition, 'christian_tradition'),
                        this.sanitizeList(this.state.religiousFamily, 'religious_family'),
                        <SwitchablePieChart 
                            title1="Religious Family by Total Nodes"
                            title2="Christian Traditions by Total Nodes"
                            queryResult1={this.state.religiousFamily}
                            queryResult1NullValues={this.state.religiousFamilyNullValues} 
                            queryResult2={this.state.christianTradition}
                            queryResult2NullValues={this.state.christianTraditionNullValues} />
                    )}
                </Row>
            </>
        );
    }
}

export default GeneralView;
