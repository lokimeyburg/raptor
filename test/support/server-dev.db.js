var _ = require("lodash"),
    _f = require(__dirname + "/factories"),
    moment = require("moment"),
    Factory = require("rosie").Factory;

var DB = module.exports = {};

/*
 * Set up the DB
 */

// Practitioners
DB.practitioners = [];
Factory.factories['practitioner'].after(function(practitioner){
  DB.practitioners.push(practitioner);
})
Factory.buildList("practitioner", 6);

// Appointments
// for now we create one for each practitioner, for yesterday, today and tomorrow
DB.appointments = [];
_.each(DB.practitioners, function(practitioner){
  DB.appointments.push(Factory.build("appointment-yesterday", { practitioner: practitioner }));
  DB.appointments.push(Factory.build("appointment", { practitioner: practitioner }));
  DB.appointments.push(Factory.build("appointment-tomorrow", { practitioner: practitioner }));
  DB.appointments.push(Factory.build("appointment-with-pending-invitation", { practitioner: practitioner }));
  DB.appointments.push(Factory.build("appointment-without-patient-and-pending-invitation", { practitioner: practitioner }));
});

// Patients
DB.patients = [];
_.each(DB.appointments, function(appointment){
  var patient = Factory.build("patient");
  DB.patients.push(patient);
  appointment.patient = { id: patient.id, name: patient.first_name + " " + patient.last_name };
});

// Visits
DB.visits = [];
_.each(DB.patients, function(patient){
  DB.visits.push(Factory.build("visit", { patient_id: patient.id }));
  DB.visits.push(Factory.build("visit", { patient_id: patient.id }));
  DB.visits.push(Factory.build('visit-with-attachment', {patient_id: patient.id}));
});

