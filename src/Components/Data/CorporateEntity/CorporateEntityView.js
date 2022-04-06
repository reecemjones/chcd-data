// IMPORTS ////////////////////////////////////////////////////////////////////
import { Row } from "react-bootstrap";
import Navbar from "../../Navbar/Navbar.js";
import NavigationDataViews from "../NavigationDataViews";
import FilterData from "./FilterData";
import BarGraph from "../Visualizations/BarGraph";

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
            language: "en",
            filterDisplay: "filter_container",
            nationalityCorporateEntity: "",
            nationalityNull: "",
            corporateEntitiesWesternNames: [],
            CorporateEntity: [],
        };

        // INITIATE NEO4J INSTANCE
        this.driver = neo4j.driver(credentials.port, neo4j.auth.basic(credentials.username, credentials.password), {
            disableLosslessIntegers: true
        });

        // BIND UTILITY FUNCTIONS TO THIS CONTEXT
        this.langSwitch = helper.langSwitch.bind(this);
        this.selectSwitchInitial = query.selectSwitchInitial.bind(this);
        this.filterHide = helper.filterHide.bind(this);
        this.resetFilter = helper.resetFilter.bind(this);

        // QUERIES
        this.fetchNationalityCorporateEntity = query.fetchNationalityCorporateEntity.bind(this);
        this.fetchNationalityNull = query.fetchNationalityNull.bind(this);
        this.fetchCorporateEntitiesWesternNames = query.fetchCorporateEntitiesWesternNames.bind(this);
    }
    //RUN ON COMPONENT MOUNT //////////////////////////////////////////////////////
    componentDidMount() {
        this.fetchNationalityCorporateEntity();
        this.fetchNationalityNull();
        this.fetchCorporateEntitiesWesternNames();
    }

    //RENDER ///////////////////////////////////////////////////////////////////////
    render() {
        return (
            <div className="bg-light">
                <Navbar language={this.state.language} langSwitch={this.langSwitch} />
                <FilterData
                    {...this.state}
                    filterHide={this.filterHide}
                    // selectSwitchInitial={this.selectSwitchInitial}
                    // handleChange={this.handleChange}
                    // handleCheck={this.handleCheck}
                    resetFilter={this.resetFilter}
                    // fetchNetworkResults={this.fetchNetworkResults}
                    // fetchNetworkIndexes={this.fetchNetworkIndexes}
                    // handleChangeData={this.handleChangeData}
                />
                <div className="list_float">
                    <NavigationDataViews active="general" />
                </div>
                <div className="d-flex justify-content-center pb-5" style={{ marginTop: 150 }}>
                    {this.state.nationalityCorporateEntity && (
                        <BarGraph
                            title="Nationality of People Corporate Entity"
                            queryResult={this.state.nationalityCorporateEntity}
                            queryResultNationalityNull={this.state.nationalityNull}
                        />
                    )}
                </div>
            </div>
        );
    }
}

export default CorporateEntityView;
