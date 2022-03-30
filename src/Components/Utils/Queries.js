/////////////////////////////////////////////////////////////////////////////////////////////////////
// IMPORTS //////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////

import locations from "../../Assets/indexes/location-index.json"

/////////////////////////////////////////////////////////////////////////////////////////////////////
// MAIN SEARCH & FILTER QUERIES /////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////

//QUERY TO FETCH RESULTS FOR SEARCH
export function fetchSearch() {
  if (this.state.search !== "") {
  this.setState ({ content: "loading" })
  const session = this.driver.session();
  const searchProp = this.state.search;

  const query = `
    CALL db.index.fulltext.queryNodes("allPropIndex", "`+ searchProp +`~") YIELD node
    WITH node MATCH (node)-[t]-(m)
    RETURN {key:id(node), properties:properties(node), label:labels(node)[0], rel:t.rel_type, other:properties(m), start_year:t.start_year, end_year:t.end_year} as Nodes
    UNION
    MATCH (node)-[t]-(m) WHERE (any(prop in keys(m) WHERE m[prop] =~ '(?i).*`+ searchProp +`.*'))
    RETURN {key:id(node), properties:properties(node), label:labels(node)[0], rel:t.rel_type, other_label:labels(m)[0], other:properties(m), start_year:t.start_year, end_year:t.end_year} as Nodes
    `
  session
  .run(query)
  .then((results) => {
    this.setState ({ nodeArray: [], filterArray: [], genderList: [], nationalityList: [], labelList: [], relFamList: [], christTradList: [], instCatList: [], instSubCatList: [], corpCatList: [], corpSubCatList: [], eventCatList: [], eventSubCatList: [], affList: [] });
    this.setState ({ label: "", nationality: "", gender: "", religious_family: "", christian_tradition: "", institution_category: "", institution_subcategory: "", corporate_entity_category: "", corporate_entity_subcategory: "", event_category: "", event_subcategory: "", name_western: "", inst_name_western: "" });

    const nodeArray = results.records.map((record) => record.get('Nodes'));
    if (nodeArray.length === 0) {this.setState ({ noresults: "noresults" }); this.setState ({ content: "loaded" }); this.setState ({ searchSet: this.state.search })}

    else {
      let filterArray = nodeArray;
      let labelList = [...new Set(nodeArray.map(item => item.label))];
      let genderList = [...new Set(nodeArray.map(item => item.properties.gender))];
      let nationalityList = [...new Set(nodeArray.map(item => item.properties.nationality))];
      let relFamList = [...new Set(nodeArray.map(item => item.other.religious_family))];
      let christTradList = [...new Set(nodeArray.map(item => item.other.christian_tradition))];
      let instCatList = [...new Set(nodeArray.map(item => item.properties.institution_category))];
      let instSubCatList = [...new Set(nodeArray.map(item => item.properties.institution_subcategory))];
      let corpCatList = [...new Set(nodeArray.map(item => item.properties.corporate_entity_category))];
      let corpSubCatList = [...new Set(nodeArray.map(item => item.properties.corporate_entity_subcategory))];
      let eventCatList = [...new Set(nodeArray.map(item => item.properties.event_category))];
      let eventSubCatList = [...new Set(nodeArray.map(item => item.properties.event_subcategory))];
      let affList = [...new Set(nodeArray.map(item => {if (item.label === "Person") { return item.other.name_western }}))];
      let instList = [...new Set(nodeArray.map(item => {if (item.label === "Institution" && item.other.corporate_entity_category) { return item.other.name_western }}))];

      this.setState ({noResults: "no_results hide", content: "loaded" });
      this.setState ({ nodeArray, filterArray });
      this.setState ({ instList, affList, genderList, nationalityList, labelList, relFamList, christTradList, instCatList, instSubCatList, corpCatList, corpSubCatList, eventCatList, eventSubCatList });
      this.setState ({ searchSet: this.state.search })
    }
    session.close()})
  } else {}
}

//QUERY TO FETCH RESULTS FOR MAP
export function fetchResults() {
  if (
    this.state.family_name_western === "" &&
    this.state.given_name_western === "" &&
    this.state.name_western === "" &&
    this.state.institution_category === "All" &&
    this.state.institution_subcategory === "All" &&
    this.state.gender === "All" &&
    this.state.nationality === "All" &&
    (this.state.location === "All" || this.state.location === "都") &&
    this.state.affiliation === "All" &&
    this.state.religious_family === "All" &&
    this.state.start_year === "" &&
    this.state.end_year === "" ) {
      this.setState ({nosend: "nosend"})
  } else {
    this.setState ({ content: "loading" })
    const session = this.driver.session();

    //CONSTRUCT FILTERS FROM USER INPUT
    let familyNameFilter; if (this.state.family_name_western !== "") {familyNameFilter = 'family_name_western: "' + this.state.family_name_western + '"'} else { familyNameFilter = ""};
    let givenNameFilter; if (this.state.given_name_western !== "") {givenNameFilter = 'given_name_western: "' + this.state.given_name_western + '"'} else { givenNameFilter = ""};
    let nameFilter; if (this.state.name_western !== "") {nameFilter = 'name_western: "' + this.state.name_western + '"'} else { nameFilter = ""};
    let icatFilter; if (this.state.institution_category === "All") { icatFilter = ""} else if (this.state.institution_category !== "All" || this.state.institution_category !== "" ) {icatFilter = 'institution_category: "' + this.state.institution_category + '"'} else { icatFilter = ""};
    let isubcatFilter; if (this.state.institution_subcategory === "All") { isubcatFilter = ""} else if (this.state.institution_subcategory !== "All" || this.state.institution_subcategory !== "" ) {isubcatFilter = 'institution_subcategory: "' + this.state.institution_subcategory + '"'} else { isubcatFilter = ""};
    let genderFilter; if (this.state.gender !== "All") {genderFilter = 'gender: "' + this.state.gender + '"'} else { genderFilter = ""};
    let nationalityFilter; if (this.state.nationality === "All") {nationalityFilter =""} else if (this.state.nationality !== "") {nationalityFilter = 'nationality: "' + this.state.nationality + '"'} else { nationalityFilter = ""};
    let affFilter;  if (this.state.affiliation === "All") {affFilter =""} else if (this.state.affiliation !== "All" || this.state.affiliation !== "") {affFilter = 'name_western: "' + this.state.affiliation + '"'} else { affFilter = ""};
    let relFamFilter; if (this.state.religious_family !== "All") {relFamFilter = 'religious_family: "' + this.state.religious_family + '"'} else { relFamFilter = ""};
    let locatFilter = []; for (let i=0; i < locations.length; i++) { if (locations[i].name_zh === this.state.location) {locatFilter.push(locations[i].contains)}}
    let timeFilter;
      if (this.state.start_year !== "" && this.state.end_year !== "") {timeFilter = 'WHERE ((t.start_year <= ' + this.state.end_year + ') AND (t.start_year >=' + this.state.start_year + ')) OR t.start_year IS NULL'}
      else if (this.state.start_year === "" && this.state.end_year !== "") {timeFilter = 'WHERE (t.start_year <= ' + this.state.end_year + ') OR t.start_year IS NULL'}
      else if (this.state.start_year !== "" && this.state.end_year === "") {timeFilter = 'WHERE (t.start_year >= ' + this.state.start_year + ') OR t.start_year IS NULL'}
      else { timeFilter = ""};
    let keyFilter;
      if (this.state.sent_id !== "init" && this.state.kind === "People" ) {
        if (timeFilter !== "") {keyFilter = ' AND ID(n)=' + this.state.sent_id }
        else {keyFilter = ' WHERE ID(n)=' + this.state.sent_id }
      }
      else if (this.state.sent_id !== "init" && this.state.kind === "Institutions" && this.state.affiliation === "All" ) {
        if (timeFilter !== "") {keyFilter = ' AND ID(r)=' + this.state.sent_id }
        else {keyFilter = ' WHERE ID(r)=' + this.state.sent_id }
      }
      else {keyFilter = ""}
    //CONCAT & CLEAN FILTERS
    const filterStatic = [familyNameFilter, givenNameFilter, genderFilter, nationalityFilter]
    const filterStaticClean = filterStatic.filter(value => value.length > 1).join();

    const corpFilterStatic = [relFamFilter, affFilter]
    const corpFilterStaticClean = corpFilterStatic.filter(value => value.length > 1).join();
    const instFilterStatic = [nameFilter, icatFilter, isubcatFilter]
    const instFilterStaticClean = instFilterStatic.filter(value => value.length > 1).join();

    //CONSTRUCT QUERY WITH VARIABLES
    let query;
    if (this.state.kind === "People") {
        const query = `
          MATCH (n:Person {`+ filterStaticClean +`})-[t]-(r:Institution)-[]-(e:CorporateEntity {`+ affFilter +`})`+ timeFilter + keyFilter +`
          WITH n,r,e,t MATCH (r)-[]->(l) WHERE (l:Township OR l:Village OR l:County OR l:Prefecture OR l:Province)
          RETURN {key:id(n),properties:properties(n),inst:properties(r),aff:properties(e),locat:properties(l),rel:properties(t),locat_name:properties(l).name_wes} AS Nodes
          UNION MATCH (e:CorporateEntity {`+ affFilter +`})-[]-(n:Person {`+ filterStaticClean +`})-[t]-(r:Institution)`+ timeFilter + keyFilter +`
          WITH n,r,e,t MATCH (r)-[]->(l)
          WHERE (l:Township OR l:Village OR l:County OR l:Prefecture OR l:Province)
          RETURN {key:id(n),properties:properties(n),inst:properties(r),aff:properties(e),locat:properties(l),rel:properties(t),locat_name:properties(l).name_wes} AS Nodes
          `
          session
          .run(query)
          .then((results) => {
            let unfiltArray = results.records.map((record) => record.get('Nodes'));
            let nodeArray;
              if (this.state.location !== "All" && this.state.location !== "都" ) { nodeArray = unfiltArray.filter(e => locatFilter[0].includes(e.locat.name_zh))}
              else {nodeArray = unfiltArray};
            if (nodeArray.length === 0) {
              this.setState ({ noresults: "noresults" });
              this.setState ({ content: "loaded" });
            }
            else {
              const mapBounds = nodeArray.map(node => ([node.locat.latitude,node.locat.longitude]));
              this.setState ({ nodeArray });
              this.setState ({ mapBounds });
              this.setState ({noresults: "noresults hide"});
              this.setState ({ content: "loaded" });
              this.setState ({sent_id: "init"});
            }
            session.close()})

    } else if (this.state.kind === "Institutions") {
        const query = `
          MATCH (p:Person)-[t]-(r:Institution {`+ instFilterStaticClean +`})-[q]-(e:CorporateEntity {`+ corpFilterStaticClean +`})`+ timeFilter + keyFilter +`
          WITH p,q,r,e,t MATCH (r)-[]->(l) WHERE (l:Township OR l:Village OR l:County OR l:Prefecture OR l:Province)
          RETURN {key:id(r),properties:properties(r),aff:properties(e),locat:properties(l),rel:properties(q),locat_name:properties(l).name_wes} AS Nodes
          UNION MATCH (p:Person)-[t]-(r:Institution {`+ instFilterStaticClean +`})-[q*2]-(e:CorporateEntity {`+ corpFilterStaticClean +`})`+ timeFilter + keyFilter +`
          WITH p,q,r,e,t MATCH (r)-[]->(l) WHERE (l:Township OR l:Village OR l:County OR l:Prefecture OR l:Province)
          RETURN {key:id(r),properties:properties(r),aff:properties(e),locat:properties(l),rel:properties(q[1]),locat_name:properties(l).name_wes} AS Nodes
          UNION MATCH (p:Person)-[t]-(r:Institution {`+ instFilterStaticClean +`})-[q*3]-(e:CorporateEntity {`+ corpFilterStaticClean +`})`+ timeFilter + keyFilter +`
          WITH p,q,r,e,t MATCH (r)-[]->(l) WHERE (l:Township OR l:Village OR l:County OR l:Prefecture OR l:Province)
          RETURN {key:id(r),properties:properties(r),aff:properties(e),locat:properties(l),rel:properties(q[1]),locat_name:properties(l).name_wes} AS Nodes
          `
          session.run(query).then((results) => {
            let unfiltArray = results.records.map((record) => record.get('Nodes'));
            let nodeArray;
              if (this.state.location !== "All" && this.state.location !== "都" ) { nodeArray = unfiltArray.filter(e => locatFilter[0].includes(e.locat.name_zh))}
              else {nodeArray = unfiltArray};
            if (nodeArray.length === 0) {
              this.setState ({ noresults: "noresults" });
              this.setState ({ content: "loaded" });
            }
            else {
              const mapBounds = nodeArray.map(node => ([node.locat.latitude,node.locat.longitude]));
              this.setState ({ nodeArray });
              this.setState ({ mapBounds });
              this.setState ({noresults: "noresults hide"});
              this.setState ({ content: "loaded" });
              this.setState ({sent_id: "init"});
            }
            session.close()})
     }

  }
}

//QUERY FOR NETWORK GRAPH
export function fetchNetworkResults() {
  if (this.state.node_id === "") {
      this.setState ({nosend: "nosend"})
  }
  else {
    this.setState ({ content: "loading" })
    const session = this.driver.session();

    //CONSTRUCT FILTERS FROM USER INPUT
    let nodeIdFilter;
      if (this.state.node_id !== "") {
        nodeIdFilter = 'WHERE id(n) ='+ parseFloat(this.state.node_id) +' '
      } else { nodeIdFilter = ""};

        let degreeFilter; if (this.state.degree !== 1) {degreeFilter = this.state.degree} else { degreeFilter = 1};
        let peopleFilter; if (this.state.people_include === true) {peopleFilter = "+"} else {peopleFilter = "-"}
        let instFilter; if (this.state.inst_include === true) {instFilter = "+"} else {instFilter = "-"}
        let corpFilter; if (this.state.corp_include === true) {corpFilter = "+"} else {corpFilter = "-"}
        let eventFilter; if (this.state.event_include === true) {eventFilter = "+"} else {eventFilter = "-"}

    //CONCAT FILTERS
    const filterStatic = [nodeIdFilter]
    const filterStaticClean = filterStatic.filter(value => value.length > 1).join();

    //CONSTRUCT QUERY WITH VARIABLES
    const query = `
      MATCH (n)-[t]-(o)`+ nodeIdFilter +`
      CALL apoc.path.subgraphAll(n, {
              maxLevel:`+degreeFilter+`,
              labelFilter:"`+ peopleFilter +`Person|`+ instFilter +`Institution|`+ corpFilter +`CorporateEntity|`+ eventFilter +`Event|-Village|-Township|-County|-Prefecture|-Province"
            })
            YIELD nodes, relationships
      WITH [node in nodes | node {key:id(node), label:labels(node)[0], properties:properties(node)}] as nodes,
           [rel in relationships | rel {source:id(startNode(rel)), target:id(endNode(rel)), start_year:rel.start_year, end_year:rel.end_year}] as rels
      RETURN {nodes:nodes, links:rels} as Graph
      `

      session
      .run(query)
      .then((results) => {
        const newArray = results.records.map((record) => record.get('Graph'));
        let ulinks = newArray[0].links;
        let links = [];
        for (let i = 0; i < ulinks.length; i++) {
          if ((
                (this.state.start_year !== "" && this.state.end_year !== "") &&
                (ulinks[i].start_year >= this.state.start_year && ulinks[i].end_year <= this.state.end_year && ulinks[i].start_year <= this.state.end_year)
              ) || (
                (this.state.start_year === "" && this.state.end_year !== "") &&
                (ulinks[i].start_year <= this.state.end_year || ulinks[i].end_year <= this.state.end_year || ulinks[i].end_year === null )
              ) || (
                (this.state.start_year !== "" && this.state.end_year === "") &&
                (ulinks[i].start_year >= this.state.state_year || ulinks[i].end_year >= this.state.start_year || ulinks[i].start_year === null )
              ) || (
                (this.state.start_year === "" && this.state.end_year === "")
              )
            ) {links.push(ulinks[i])}
        }

        const nodeArray = [{nodes: newArray[0].nodes, links: links, }]

        if (nodeArray.length === 0) {this.setState ({ noresults: "noresults" })}
        else {
          this.setState ({ nodeArray });
          this.setState ({ noresults: "noresults hide" })
          this.setState ({ content: "loaded" })
        }
        session.close()});
    }
  };

/////////////////////////////////////////////////////////////////////////////////////////////////////
// QUERIES FOR POPUP INFORMATION ////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////

//QUERY FOR SELECTED NODE + APPEND BREADCRUMB (CLICK IN POPUP CONTENT)
export function selectSwitchAppend(event) {
    this.setState({nodeSelect: event});
    const session = this.driver.session()
    const selectquery = `
    MATCH (n)-[t]-(p:Person) WHERE ID(n) =` + event +` RETURN {key:id(n), select_kind:labels(n)[0], select_node:properties(n), key2:id(p), node2:properties(p), rel_kind:labels(p)[0], rel:properties(t)} AS SelectNodes
    UNION MATCH (n)-[t]-(p:CorporateEntity) WHERE ID(n) =` + event +` RETURN {key:id(n), select_kind:labels(n)[0], select_node:properties(n), key2:id(p), node2:properties(p), rel_kind:labels(p)[0], rel:properties(t)} AS SelectNodes
    UNION MATCH (n)-[t]-(p:Institution) WHERE ID(n) =` + event +` RETURN {key:id(n), select_kind:labels(n)[0], select_node:properties(n), key2:id(p), node2:properties(p), rel_kind:labels(p)[0], rel:properties(t)} AS SelectNodes
    UNION MATCH (n)-[t]-(p:Event) WHERE ID(n) =` + event +` RETURN {key:id(n), select_kind:labels(n)[0], select_node:properties(n), key2:id(p), node2:properties(p), rel_kind:labels(p)[0], rel:properties(t)} AS SelectNodes
    `
    session.run(selectquery).then((results) => {const selectArray = results.records.map((record) => record.get('SelectNodes')); this.setState ({ selectArray });
    this.breadCrumbChainer();
    session.close()});
  };

//QUERY FOR SELECTED NODE + REDUCE BREADCRUMB (CLICK IN POPUP CONTENT)
export function selectSwitchReduce(event, order) {
    this.setState({nodeSelect: event});
    const session = this.driver.session()
    const selectquery = `
    MATCH (n)-[t]-(p:Person) WHERE ID(n) =` + event +` RETURN {key:id(n), select_kind:labels(n)[0], select_node:properties(n), key2:id(p), node2:properties(p), rel_kind:labels(p)[0], rel:properties(t)} AS SelectNodes
    UNION MATCH (n)-[t]-(p:CorporateEntity) WHERE ID(n) =` + event +` RETURN {key:id(n), select_kind:labels(n)[0], select_node:properties(n), key2:id(p), node2:properties(p), rel_kind:labels(p)[0], rel:properties(t)} AS SelectNodes
    UNION MATCH (n)-[t]-(p:Institution) WHERE ID(n) =` + event +` RETURN {key:id(n), select_kind:labels(n)[0], select_node:properties(n), key2:id(p), node2:properties(p), rel_kind:labels(p)[0], rel:properties(t)} AS SelectNodes
    UNION MATCH (n)-[t]-(p:Event) WHERE ID(n) =` + event +` RETURN {key:id(n), select_kind:labels(n)\0], select_node:properties(n), key2:id(p), node2:properties(p), rel_kind:labels(p)[0], rel:properties(t)} AS SelectNodes
    `
    session.run(selectquery).then((results) => {const selectArray = results.records.map((record) => record.get('SelectNodes')); this.setState ({ selectArray });
    this.breadCrumbReducer(event, order);
    session.close()});
  };

//QUERY FOR SELECTED NODE + APPEND BREADCRUMB + OPEN POPUP (CLICK IN CHILD VIEW)
export function selectSwitchInitial(event) {
    this.selectSwitchAppend(event)
    if (this.state.filterDisplay === "filter_container") {this.setState ({ popupcontainer: "popupcontainer" })}
    else if (this.state.filterDisplay === "filter_container2") {this.setState ({ popupcontainer: "popupcontainer-full" })}
  };

/////////////////////////////////////////////////////////////////////////////////////////////////////
// QUERIES FOR FETCHING FILTER INDEXES ON LOAD //////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////

//QUERY TO FETCH LISTS FOR NETWORK SELECTS
export function fetchNetworkIndexes() {
  const session = this.driver.session();
  const query = `
    MATCH (p:Person) WHERE p.family_name_western IS NOT NULL
    RETURN DISTINCT {value:ID(p), label:p.given_name_western + ' ' + p.family_name_western} AS List
    UNION MATCH (p) WHERE p:CorporateEntity OR  p:Event OR  p:Institution
    RETURN DISTINCT {type:"node_id", value:ID(p), label:p.name_western} AS List
    `
  session.run(query).then((results) => {
    const netPersonIndex = results.records.map((record) => record.get('List'));
    this.setState ({ netPersonIndex })
    session.close()})
};

//QUERY TO FETCH LISTS FOR MAP SELECTS
export function fetchMapIndexes() {

  //GET CATEGORY AND SUBCATEGORY LISTS
  const session = this.driver.session();
  const query = `MATCH (i:Institution)-[]-(l) WHERE i.institution_category IS NOT NULL AND (l:Township OR l:Village OR l:County OR l:Prefecture OR l:Province)
    CALL {
      WITH i
      MATCH (o:Institution) WHERE (o.institution_category = i.institution_category) AND o.institution_subcategory IS NOT NULL
      RETURN collect(distinct o.institution_subcategory) as y
    }
    RETURN DISTINCT {category:i.institution_category, subcategory:y} as List`
  session.run(query).then((results) => {
    const resultIndex = results.records.map((record) => record.get('List'));
    const addAll = [{category: "All", subcategory:["All"]}];
    const test = addAll.concat(resultIndex);
    const instCatsIndex = test.map( (i) =>[i.category, i.subcategory]);    
    this.setState ({ instCatsIndex });
    session.close()});

  //GET INST AFFILIATION LIST
  const session2 = this.driver.session();
  const query2 = `
  MATCH (r:Institution)-[t]-(e:CorporateEntity {corporate_entity_category: "Religious Body"})
    WITH r,t,e MATCH (r)-[]->(l) WHERE (l:Township OR l:Village OR l:County OR l:Prefecture OR l:Province)
    RETURN DISTINCT {value:e.name_western, zh:e.chinese_name_hanzi} AS List
  UNION MATCH (r:Institution)-[t*2]-(e:CorporateEntity {corporate_entity_category: "Religious Body"})
    WITH r,t,e MATCH (r)-[]->(l) WHERE (l:Township OR l:Village OR l:County OR l:Prefecture OR l:Province)
    RETURN DISTINCT {value:e.name_western, zh:e.chinese_name_hanzi} AS List
  UNION MATCH (r:Institution)-[t*3]-(e:CorporateEntity {corporate_entity_category: "Religious Body"})
    WITH r,t,e MATCH (r)-[]->(l) WHERE (l:Township OR l:Village OR l:County OR l:Prefecture OR l:Province)
    RETURN DISTINCT {value:e.name_western, zh:e.chinese_name_hanzi} AS List
    `
  session2.run(query2).then((results) => {
    const resultIndex2 = results.records.map((record) => record.get('List')); const addAll2 = [{value: "All"}];
    const affIndexPrep = addAll2.concat(resultIndex2);
    const affIndex = affIndexPrep.map(i => ({ zh: i.zh, value: i.value, type: "affiliation" }));
    this.setState ({ affIndex });
    session2.close()});

  //GET RELIGIOUS FAMILY LIST
  const session3 = this.driver.session();
  const query3 = `MATCH (r:Institution)-[]->(e:CorporateEntity) WHERE e.religious_family IS NOT NULL
    WITH r,e MATCH (r)-[]->(l) WHERE (l:Township OR l:Village OR l:County OR l:Prefecture OR l:Province)
    RETURN DISTINCT {value:e.religious_family} AS List`
  session3.run(query3).then((results) => {
    const resultIndex3 = results.records.map((record) => record.get('List')); const addAll3 = [{value: "All"}];
    const relFamIndexPrep = addAll3.concat(resultIndex3);
    const relFamIndex = relFamIndexPrep.map(i => ({ value: i.value, type: "religious_family" }));
    this.setState ({ relFamIndex });
    session3.close()});

  //NATIONALITY INDEX
  const session4 = this.driver.session();
  const query4 = `MATCH (r:Person)-[]->(e:Institution) WHERE r.nationality IS NOT NULL
    WITH r,e MATCH (e)-[]->(l) WHERE (l:Township OR l:Village OR l:County OR l:Prefecture OR l:Province)
    RETURN DISTINCT {value:r.nationality} AS List`
  session4.run(query4).then((results) => {
    const resultIndex4 = results.records.map((record) => record.get('List')); const addAll4 = [{value: "All"}];
    const natIndexPrep = addAll4.concat(resultIndex4);
    const natIndex = natIndexPrep.map(i => ({ value: i.value, type: "nationality" }));
    this.setState ({ natIndex });
    session4.close()});

  //PERSON AFFILIATION INDEX
  const session5 = this.driver.session();
  const query5 = `MATCH (r:Person)-[]->(e:Institution)-[]->(c:CorporateEntity {corporate_entity_category: "Religious Body"})
    WITH r,e,c MATCH (e)-[]->(l) WHERE (l:Township OR l:Village OR l:County OR l:Prefecture OR l:Province)
    RETURN DISTINCT {value:c.name_western, zh:c.chinese_name_hanzi} AS List
    UNION MATCH (c:CorporateEntity {corporate_entity_category: "Religious Body"})-[]-(r:Person)-[]-(e:Institution)
    WITH r,e,c MATCH (e)-[]->(l) WHERE (l:Township OR l:Village OR l:County OR l:Prefecture OR l:Province)
    RETURN DISTINCT {type:"affiliation", value:c.name_western, zh:c.chinese_name_hanzi} AS List
    `
  session5.run(query5).then((results) => {
    const resultIndex5 = results.records.map((record) => record.get('List')); const addAll5 = [{value: "All"}];
    const pAffIndexPrep = addAll5.concat(resultIndex5);
    const pAffIndex = pAffIndexPrep.map(i => ({ zh: i.zh, value: i.value, type: "affiliation" }));
    this.setState ({ pAffIndex });
    session5.close()});
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// QUERIES FOR DATAVIEW /////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////

//QUERY TO FETCH TOTAL PEOPLE
export function fetchTotalPeople() {
  const session = this.driver.session();
  const query = `MATCH (n:Person) RETURN count(n) AS Count`
  session.run(query).then((results) => {
    const totalPeople = results.records.map((record) => record.get('Count'));
    this.setState ({ totalPeople })
    session.close()})
};

//QUERY TO FETCH TOTAL INSTITUTIONS
export function fetchTotalInstitutions() {
  const session = this.driver.session();
  const query = `MATCH (n:Institution) RETURN count(n) AS Count`
  session.run(query).then((results) => {
    const totalInstitutions = results.records.map((record) => record.get('Count'));
    this.setState ({ totalInstitutions })
    session.close()})
};

//Total Relationships
export function fetchTotalRelationship() {
  const session = this.driver.session();
  const query = `MATCH (n)-[r]->() RETURN COUNT(r) AS Count`
  session.run(query).then((results) => {
    const totalRelationships = results.records.map((record) => record.get('Count'));
    this.setState ({ totalRelationships })
    session.close()})
};

//QUERY TO FETCH TOTAL EVENTS
export function fetchTotalEvents() {
  const session = this.driver.session();
  const query = `MATCH (n:Event) RETURN count(n) AS Count`
  session.run(query).then((results) => {
    const totalEvents = results.records.map((record) => record.get('Count'));
    this.setState ({ totalEvents })
    session.close()})
};

  export function fetchTotalNodes() {
    const session = this.driver.session();
    const query = `MATCH (n) RETURN count(n) AS Count`
    session.run(query).then((results) => {
      const totalNodes = results.records.map((record) => record.get('Count'));
      this.setState ({ totalNodes })
      session.close()})
  };

  //QUERY TO FETCH TOTAL CORPORATE ENTITIES
  export function fetchTotalCorporateEntities() {
    const session = this.driver.session();
    const query = `MATCH (n:CorporateEntity) RETURN count(n) AS Count`
    session.run(query).then((results) => {
      const totalCorporateEntities = results.records.map((record) => record.get('Count'));
      this.setState ({ totalCorporateEntities })
      session.close()})
  };

  //QUERY TO GET GENDERS OF ALL PEOPLE
  export function fetchGenders() {
    const session = this.driver.session();
    const query = `MATCH (n:Person)
      WITH n.gender AS gender, count(*) AS count
      WHERE count > 1
      RETURN DISTINCT {gender: gender, count: count} AS List
      `
    session.run(query).then((results) => {
      const genders = results.records.map((record) => record.get('List', 'gender'));
      this.setState ({ genders })
      session.close()})
  };

  //QUERY TO GET ACTIVITY FOR PROVINCES.
  export function fetchProvinces() {
    const session = this.driver.session();
    const query = `MATCH (n:Province) 
        UNWIND n as x
        MATCH (x:Province{name_wes:x.name_wes})<-[:INSIDE_OF]-(Person)
        RETURN DISTINCT {Province : x.name_wes, Activity: count (Person)} AS List
        ORDER BY List.Activity DESC LIMIT 10
      `
    session.run(query).then((results) => {
      const provinces = results.records.map((record) => record.get('List', 'Activity'));
      this.setState ({ provinces })
      session.close()})
  };

  //QUERY TO GET ACTIVITY FOR PREFECTURES.
  export function fetchPrefectures() {
    const session = this.driver.session();
    const query = `MATCH (n:Prefecture) 
        UNWIND n as x
        MATCH (x:Prefecture{name_wes:x.name_wes})<-[:INSIDE_OF]-(Person)
        RETURN DISTINCT {Prefecture : x.name_wes, Activity: count (Person)} AS List
        ORDER BY List.Activity DESC LIMIT 10
      `
    session.run(query).then((results) => {
      const prefectures = results.records.map((record) => record.get('List', 'Activity'));
      this.setState ({ prefectures })
      session.close()})
  };

  //QUERY TO GET ACTIVITY FOR COUNTIES.
  export function fetchCounties() {
    const session = this.driver.session();
    const query = `MATCH (n:County) 
        UNWIND n as x
        MATCH (x:County{name_wes:x.name_wes})<-[:LOCATED_IN]-(Person)
        RETURN DISTINCT {County : x.name_wes, Activity: count (Person)}  AS List
        ORDER BY List.Activity DESC LIMIT 10
      `
    session.run(query).then((results) => {
      const counties = results.records.map((record) => record.get('List', 'Activity'));
      this.setState ({ counties })
      session.close()})
    };

  //Query to get Nationality of all people
  export function fetchNationality() {
    const session = this.driver.session();
    const query = `PROFILE MATCH (n:Person) 
    WITH n.nationality AS nationality, count(n) AS count
    WHERE n.nationality IS NOT NULL
    RETURN DISTINCT {nationality: nationality, count: count} AS List
    `
    session.run(query).then((results) => {
      const nationality = results.records.map((record) => record.get('List', 'nationality'));
      this.setState ({ nationality })
      session.close()})
  };

    //Query to get Nationality of all people
    export function fetchNationalityNull() {
      const session = this.driver.session();
      const query = `MATCH (n:Person) 
      WITH n.nationality AS nationality, count(n) AS count
      WHERE n.nationality IS NULL
      RETURN count as Count
      `
      session.run(query).then((results) => {
        const nationalityNull = results.records.map((record) => record.get('Count', 'nationality'));
        this.setState ({ nationalityNull })
        session.close()})
    };
  
  //QUERY TO GET CHRISTIAN TRADITIONS OF ALL NODES
  export function fetchChristianTradition() {
    const session = this.driver.session();
    const query = `
      MATCH (n) 
      WITH n.christian_tradition AS christian_tradition, count(n) AS count 
      WHERE n.christian_tradition IS NOT NULL
      RETURN DISTINCT {christian_tradition: christian_tradition, count: count} AS List
      `
    session.run(query).then((results) => {
      const christianTradition = results.records.map((record) => record.get('List', 'christian_tradition'));
      this.setState ({ christianTradition })
      session.close()})
  };

  //QUERY TO GET RELIGIOUS FAMILIES OF ALL NODES
  export function fetchReligiousFamily() {
    const session = this.driver.session();
    const query = `
      MATCH (n) 
      WITH n.religious_family AS religious_family, count(n) AS count 
      WHERE n.religious_family IS NOT NULL
      RETURN DISTINCT {religious_family: religious_family, count: count} AS List
      `
    session.run(query).then((results) => {
      const religiousFamily = results.records.map((record) => record.get('List', 'religious_family'));
      this.setState ({ religiousFamily })
      session.close()})
  };


  //QUERY TO GET CHRISTIAN TRADITIONS OF NULL VALUE
  export function fetchReligiousFamilyNullValues() {
    const session = this.driver.session();
    const query = `
      MATCH (n) 
      WITH n.religious_family AS religious_family, count(n) AS count
      WHERE n.religious_family IS NULL
      RETURN count AS Count
      `
    session.run(query).then((results) => {
      const religiousFamilyNullValues = results.records.map((record) => record.get('Count', 'religious_family'));
      this.setState ({ religiousFamilyNullValues })
      session.close()})
  };

  //QUERY TO GET CHRISTIAN TRADITIONS OF NULL VALUE
  export function fetchChristianTraditionNullValues() {
    const session = this.driver.session();
    const query = `
      MATCH (n) 
      WITH n.christian_tradition AS christian_tradition, count(n) AS count
      WHERE n.christian_tradition IS NULL
      RETURN count AS Count
      `
    session.run(query).then((results) => {
      const christianTraditionNullValues = results.records.map((record) => record.get('Count', 'christian_tradition'));
      this.setState ({ christianTraditionNullValues })
      session.close()})
  };

  //QUERY TO GET ALL THE CORPORATE ENTITIES
  export function fetchCorporateEntitiesWesternNames() {
    const session = this.driver.session();
    const query = `MATCH (n:CorporateEntity) RETURN n.name_western as List`
    session.run(query).then((results) => {
      const corporateEntitiesWesternNames = results.records.map((record) => record.get('List'));
      this.setState ({ corporateEntitiesWesternNames })
      session.close()})
  };
