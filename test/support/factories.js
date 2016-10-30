var Factory = require("rosie").Factory,
    Faker   = require("Faker"),
    moment  = require("moment");

var dateFormat = "YYYY-MM-DD";

/*
 * Patients
 */

Factory.define("patient")
  .sequence("id", function(i){ return 90172 + i; })
  .attr('first_name', function(){ return Faker.Name.firstName(); })
  .attr('last_name', function(){ return Faker.Name.lastName(); })
  .attr('sex', function(){ return "female"; })
  .attr('email', function(){ return Faker.Internet.email(); })
  .attr('mobile_number', function(){ return Faker.PhoneNumber.phoneNumber(); })
  .sequence('msp_number', function(i){ return 1234567890 + i; })
  .sequence('birthday', function(i){ return (1970 + i%20 + '') + "-12-10"; })
  .attr('province', function(){ return "BC" });

  /*
 * Visits
 */

var create;

function setDates(){
  var month = Math.round(Math.random() * 11) + 1;
  var day = Math.round(Math.random() * 28) + 1;
  create = moment("2014" + month + "" + day, "YYYYMMDD").toDate();
}

Factory.define("visit")
  .sequence("id", function(i){ return 80172 + i})
  .attr('patient_id', function(){
    return null;
  })
  .attr('created_at', function(){
    setDates();
    return create;
  })
  .attr('updated_at', function(){
    return create;
  })
  .attr('symptoms', function(){
    return "My knee hurts,\nso badly.\n\nSeriously.";
  });

Factory.define("visit-with-attachment")
  .extend('visit')
  .attr('attachments', function(){
    return [
    Factory.attributes('attachment'),
    Factory.attributes('attachment')
    ];
  });

Factory.define('attachment')
  .attr('id', 1)
  .attr('filesize', 12345678)
  .attr('filename', 'attachment.pdf')
  .attr('filetype', 'application/pdf')
  .attr('comment', Faker.Lorem.sentence())
  .attr('author', fakeName())
  .attr('created_at', moment().toDate());

/*
 * Staff
 */

Factory.define("practitioner")
  .sequence("id", function(i){ return 876 + i })
  .attr('name', function(){ return Faker.Name.firstName() + " " + Faker.Name.lastName(); });


/*
 * Appointments
 */

var startTime, endTime;

function setTimes(){
  hour =  Math.round(Math.random() * 11);
  date = moment().startOf('day');
  startTime = moment({hour: hour, minute: 0});
  endTime = startTime.clone();
  endTime.add('minutes', 15);
}

Factory.define("appointment")
  .sequence("id", function(i){ return 12876 + i })
  .attr('starts_at', function(){
    setTimes();
    return startTime.toDate();
  })
  .attr('ends_at', function(){
    return endTime.toDate();
  })
  .attr('status', "scheduled")
  .attr('date', function(){
    return date.toDate();
  })
  .attr('patient', function(){
    return null;
  })
  .attr('appointment_invitation', function(){
    return Factory.build('appointment_invitation')
  })
  .attr('practitioner', function(){
    return Factory.build('practitioner');
  });

Factory.define("appointment-yesterday")
  .extend("appointment")
  .attr('date', function(){
    return moment().startOf('day').subtract('days', 1).toDate();
  })
  .attr('starts_at', function(){
    return moment().subtract('days', 1).toDate();
  })
  .attr('ends_at', function(){
    return moment().subtract('days', 1).toDate();
  });

Factory.define("appointment-tomorrow")
  .extend("appointment")
  .attr('date', function(){
    return moment().startOf('day').add('days', 1).toDate();
  })
  .attr('starts_at', function(){
    return moment().add('days', 1).toDate();
  })
  .attr('ends_at', function(){
    return moment().add('days', 1).toDate();
  });

Factory.define("appointment-with-pending-invitation")
  .extend("appointment")
  .attr("appointment_invitation", function(){
    return Factory.build('pending_appointment_invitation');
  });

Factory.define("appointment-without-patient-and-pending-invitation")
  .extend("appointment-with-pending-invitation")
  .attr("patient", null);

/*
 * Appointment invitations
 */
Factory.define("appointment_invitation")
  .sequence('id')
  .attr('accepted_at', function(){
    return moment().format();
  })
  .attr('invitee_email', function(){
    return Faker.Internet.email();
  })
  .attr('invitee_name', function(){
    return Faker.Name.findName();
  })
  .attr('resend', function(){
    return false;
  });

Factory.define("pending_appointment_invitation")
  .extend("appointment_invitation")
  .attr('accepted_at', null);

function fakeName() {
  return [Faker.Name.firstName(), Faker.Name.lastName()].join(' ');
}
