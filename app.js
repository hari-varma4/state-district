const express = require("express");
const path = require("path");
const app = express();
app.use(express.json());
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
db = null;
const dbpath = path.join(__dirname, "covid19India.db");
const initser = async () => {
  db = await open({
    filename: dbpath,
    driver: sqlite3.Database,
  });
  app.listen(3000, () => console.log("running"));
};
initser();

function obr(obj) {
  return {
    stateID: obj.state_id,
    stateName: obj.state_name,
    population: obj.population,
  };
}

app.get("/states/", async (request, response) => {
  const qu = `
       select * from state 
    `;
  const re = await db.all(qu);
  response.send(re.map((pla) => obr(pla)));
});

app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;

  const query = ` select * from state
    where state_id=${stateId}`;
  const re = await db.get(query);
  response.send(obr(re));
});

app.post("/districts/", async (request, response) => {
  const detailstopost = request.body;
  const { districtName, stateid, cases, cured, active, deaths } = detailstopost;
  const query = `
    insert into district (district_name,state_id,cases,cured,active,deaths)
    values ("${districtName}","${stateid}","${cases}","${cured}","${active}","${deaths}")
    `;
  const re = await db.run(query);
  const districtid = re.lastId;
  response.send("District Successfully Added");
});
function obr(ob) {
  return {
    districtId: ob.district_id,
    districtName: ob.district_name,
    stateId: ob.state_id,
    cases: ob.cases,
    cured: ob.cured,
    active: ob.active,
    deaths: ob.deaths,
  };
}
app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;

  const query = ` select * from district
    where district_id=${districtId}`;
  const re = await db.get(query);

  response.send(obr(re));
});

app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const quer = `
delete from district where district_id=${districtId}

`;
  const re = await db.run(quer);
  response.send("District Removed");
});

app.put("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const details = request.body;
  const { districtName, stateId, cases, cured, active, deaths } = details;
  const quer = `
      update district set 
  
    district_name=  "${districtName}",state_id="${stateId}",cases="${cases}",cured="${cured}",active="${active}",deaths="${deaths}"
   where district_id="${districtId}"
    `;
  const re = await db.run(quer);

  response.send("District Details Updated");
});

app.get("/states/:stateId/stats", async (request, response) => {
  const { stateId } = request.params;

  const query = ` select sum(cases) ,
  sum(cured) ,sum(active) , sum(deaths) from district 
    where state_id=${stateId}`;
  const re = await db.get(query);

  response.send({
    totalCases: re["sum(cases)"],
    totalCured: re["sum(cured)"],
    totalActive: re["sum(active)"],
    totalDeaths: re["sum(deaths)"],
  });
});

app.get("/districts/:districtId/details/", async (request, response) => {
  const { districtId } = request.params;

  const query = ` select state_name from state natural join district 
    where district_id=${districtId}`;
  const re = await db.get(query);

  response.send({
    stateName: re["state_name"],
  });
});
