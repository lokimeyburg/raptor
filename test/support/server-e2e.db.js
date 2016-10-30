var _f = require(__dirname + "/factories"),
    _ = require("lodash");
    Factory = require("rosie").Factory,
    moment = require("moment");


var DB = module.exports = {};

DB.patients = [];
Factory.factories["patient"].after(function(patient){
  DB.patients.push(patient);
});

var joshua = Factory.build("patient", { id: 88888,
                                        first_name: "Joshua",
                                        last_name: "Collins",
                                        sex: "male",
                                        mobile_number: "1 604 312-9191",
                                        msp_number: 1234567890,
                                        email: "joshua.collins@medeo.ca",
                                        birthday: moment().subtract('years', 30).format("YYYY-MM-DD") }),
    loki   = Factory.build("patient", { id: 88889,
                                        first_name: "Loki",
                                        last_name: "Meyburg",
                                        sex: "male" }),
    doc  = Factory.build("practitioner", { name: "John Dane" });

DB.practitioners = [ doc ];

DB.appointments = [
  Factory.build("appointment", { starts_at: moment({hour: 8, minute: 0}).toDate(),
                                 ends_at: moment({hour: 8, minute: 15}).toDate(),
                                 patient: {
                                  id: joshua.id,
                                  name: joshua.first_name + " " + joshua.last_name
                                 },
                                 practitioner: doc,
                                 status: "scheduled" } ),

  Factory.build("appointment", { starts_at: moment({hour: 6, minute: 0}).toDate(),
                                 ends_at: moment({hour: 6, minute: 15}).toDate(),
                                 patient: {
                                  id: loki.id,
                                  name: loki.first_name + " " + loki.last_name
                                 },
                                 practitioner: doc,
                                 status: "scheduled" } ),

  Factory.build("appointment-tomorrow", { starts_at: moment({hour: 8, minute: 0}).add('days', 1).toDate(),
                                 ends_at: moment({hour: 8, minute: 15}).add('days', 1).toDate(),
                                 patient: loki,
                                 practitioner: doc,
                                 status: "scheduled" } )

];


DB.visits = [];
_.each(DB.patients, function(patient){
  DB.visits.push(Factory.build("visit", { patient_id: patient.id,
                                          created_at: moment().toDate(),
                                          updated_at: moment().toDate() }));
  DB.visits.push(Factory.build("visit", { patient_id: patient.id,
                                          created_at: moment().subtract(1, 'year').toDate(),
                                          updated_at: moment().subtract(1, 'year').toDate() }));
});

