var express = require("express"),
    http = require("http"),
    path = require("path"),
    moment = require("moment"),
    faye = require("faye"),
    _ = require("lodash"),
    Factory = require("rosie").Factory,
    _f = require(__dirname + "/support/factories");


function createServer(dbFile){
  var app = express().use(express.static(__dirname + "/../build"))
                     .use("/_faye", express.static(__dirname + "/_faye"))
                     .use(express.json())
                     .use(express.multipart())
                     .use(express.logger('dev'));

  var DB = require(path.resolve(dbFile)),
      bayeux = new faye.NodeAdapter({mount: '/faye', timeout: 45}),
      $faye = bayeux.getClient();

  /*
   * API Controller Actions
   *
   * Helpful hints:
   *
   * req.query  => object representing the query params
   * req.params => object representing the params from the route
   *
   */
  app.get("/api/whoami", function(req, res){
    var me = {
      id: 1,
      first_name: "Brittany",
      last_name: "Helper",
      organization_memberships: [{role:'practitioner', organization: 'medeo'}]
    };

    res.json(me);
  });

  app.get("/api/xmpp_connection/:org_name", function(req, res){
    var conf = {
      jid: "1.staff." + req.params.org_name + "@secure.medeo.ca",
      password: "password"
    };

    res.json(conf);
  });

  /*
   * Basic configuration params required to bootstrap Angular
   */
  app.get("/api/configuration", function(req, res){
    var config = {
      faye_server_url: "http://localhost:4000/faye",
      faye_channel_token_path: "/channel_tokens",
      chat_server_url: "http://localhost:5280/http-bind/"
    };

    res.json(config);
  });

  app.get("/api/o/:orgName", function(req, res){
    var medeo = {
      name: "Medeo",
      slug: "medeo",
      practitioners: DB.practitioners
    };

    res.json(medeo);
  });

  /*
   * Appointments
   */

  var prepareApptObj = function(reqAttrs){
    var apptAttrs = {};
    if(reqAttrs.patient_id !== undefined){
      var patient = _.where(DB.patients, { id: reqAttrs.patient_id})[0];
      _.extend(apptAttrs, {
        patient: { id: patient.id, name: patient.first_name + " " + patient.last_name }
      });
    }else{
      _.extend(apptAttrs, {
        appointment_invitation: {
          email: reqAttrs.invitee_email,
          invitee_name: reqAttrs.invitee_name
        }
      });
    }
    _.extend(apptAttrs,{
      practitioner: _.where(DB.practitioners, { id: reqAttrs.practitioner_id})[0]
    });
    _.extend(apptAttrs,{
      starts_at: reqAttrs.starts_at,
      ends_at:   reqAttrs.ends_at
    });
    return apptAttrs;
  };

  app.post("/api/o/:orgName/appointments", function(req, res){
    var hash = prepareApptObj(req.body);
    var appt = Factory.build("appointment", hash);
    DB.appointments.push(appt);
    res.json(appt);
  });

  app.get("/api/o/:orgName/appointments", function(req, res){
    var date = moment(req.query.date).toDate() || moment().toDate();
    var appts = _.where(DB.appointments, { date: date });

    res.json({ appointments: appts });
  });

  app.put("/api/o/:orgName/appointments/:id", function(req, res){
    var appt = _.find(DB.appointments, { id: Number(req.params.id)});
    var practitioner = _.find(DB.practitioners, { id: Number(req.body.practitioner_id)})

    req.body.starts_at = moment(req.body.starts_at).toDate();
    req.body.ends_at = moment(req.body.ends_at).toDate();
    req.body.date = moment(req.body.starts_at).startOf('day').toDate();
    req.body.practitioner = practitioner;
    _.extend(appt, req.body);

    $faye.publish('/organizations/' + req.params.orgName, {
      type: "appointment/update",
      body: appt
    });

    res.json(appt);
  });

  app.put("/api/o/:orgName/appointments/:id/resend_invitation", function(req, res){
    res.send(200);
  });

  /*
   * Patients
   */
  var patientSearch = function(q) {
    var patientResults = [];
    var rx = RegExp(q, "i");
    _.each(DB.patients, function(patient){
      var strs = [
        patient.first_name + ' ' + patient.last_name,
        patient.msp_number.toString(),
        patient.birthday
      ];
      if(_.some(strs, function(str){ return str.match(rx) != null })){
        patientResults.push(patient);
      }
    });
    return patientResults;
  };

  // Eventually we need custom actions
  app.get("/api/o/:orgName/patients", function(req, res){
    var q = req.query.q,
        patients = _.isUndefined(q) ? DB.patients : patientSearch(q);
    res.json({patients: patients});
  });

  app.post("/channel_tokens", function(req, res){
    res.json({user_id: 1, token: "VALID", timestamp: moment().add(1, 'day').toJSON() });
  });

  app.get("/api/o/:orgName/patients/search/:searchVal", function(req, res){
    var patientResults = [];
    var rx = RegExp(req.params.searchVal, "i");
    _.each(DB.patients, function(patient){
      if(patient.displayName().match(rx)){
        patientResults.push(patient);
      }
    });
    res.json({patients: patientResults});
  });

  app.get("/api/o/:orgName/patients/:id", function(req, res){
    var patient = _.find(DB.patients, { id: Number(req.params.id)});
    res.json(patient);
  });

  app.get("/api/o/:orgName/patients/:patientId/visits", function(req, res){
    var patientVisits = _.sortBy(
      _.filter(DB.visits, {patient_id: Number(req.params.patientId)}),
      function(visit) {
        return -visit.updated_at.getTime();
      }
    );
    res.json({visits: patientVisits});
  });

  /*
   * Practitioners
   */
  app.get("/api/o/:orgName/practitioners", function(req, res){
    res.json({practitioners: DB.practitioners});
  });

  /*
   * Attachments
   */
  app.post("/api/o/:orgName/patients/:patientId/visits/:visitId/attachments", function(req, res) {
    res.redirect("back");
  });

  /*
   * 404 - Page Not Found
   */
  app.get("*", function(req, res){
    res.status(404);
    res.json({ error: { code: 404, message: "Page not found"}});
  });

  return {
    app: app,
    fayeMount: bayeux
  };
}

/*
 * Module Function
 */
module.exports = {
  create: function(port, dbFile){
    var applicationInfo = createServer(dbFile),
        server = http.createServer(applicationInfo.app);

    applicationInfo.fayeMount.attach(server);

    server.listen(port);

    return server;
  }
}
