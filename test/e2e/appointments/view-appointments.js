var moment = require('moment'),
    H = require("../../protractor_helper"),
    dateFormat = 'YYYY-MM-DD',
    Q = require("q"),
    _f = require("../../support/factories"),
    Factory = require("rosie").Factory;

describe("Viewing the Schedule", function(){

  beforeEach(function(){
    browser.get("/#/medeo/day");
  });

  it('should show todays appointments by default', function($timeout){
    var appointmentDate = $(".selected-date").getText();
    expect(appointmentDate).toEqual(moment().format("MMM D").toUpperCase());
  });

  it('should render a row for each appointment', function() {
    var apptRows = $$("tr.appointment");
    expect(apptRows.count()).toBeGreaterThan(0);
  });

  it('it should order the appointments by time', function() {
    var appointmentTimes = $$(".appt-time");
    moment(appointmentTimes.last().getText()).isAfter(appointmentTimes.first().getText());
  });

  it('should render the appointment row', function() {
    var displayTime = $(".appt-time").getText();
    expect(displayTime).toEqual("6:00 am - 6:15 am");

    var patient = $(".patient-name").getText();
    expect(patient).toEqual("Loki Meyburg");

    var practitioner = $(".staff-member-name").getText();
    expect(practitioner).toEqual("John Dane");

    var statusSelect = element(by.selectedOption("appointment.status")).getText();
    expect(statusSelect).toEqual("SCHEDULED");

    var rowClass = $(".appointment").getAttribute("class");
    expect(rowClass).toContain('scheduled');

    var editButton = $(".appointment-edit");
    expect(editButton.isPresent()).toBeTruthy();
  })

  it('should get tomorrows appointments when I press the next button', function(){
    var nextButton = $(".next-appointment-view");
    nextButton.click();
    var appointmentDate = $(".selected-date").getText();
    expect(appointmentDate).toEqual(moment().add(1, 'day').format("MMM D").toUpperCase());
  });

  it('should show a blank slate when there are no appointments', function(){
    browser.get("/#/medeo/day/2011-02-01");

    var blankSlate = $(".appointments-blank-slate").getText();
    expect(blankSlate).toEqual("No appointments");
  });

  describe('rejecting an appointment', function(){

    beforeEach(function(){
      browser.get("/#/medeo/day");
    });

    iit('should update an appointment\'s status to be rejected', function(){
      browser.selectOption = H.selectOption.bind(browser);
      browser.selectOption(protractor.By.model('appointment.status'), 'REJECTED');
      browser.selectOption(protractor.By.model('appointment.rejection_reason'), 'Curious');
      element(by.buttonText('Submit'));
      var statusSelect = element(by.selectedOption("appointment.status")).getText();

      expect(statusSelect).toEqual("REJECTED");
    });

  });

  it('selects a specific date', function() {
    browser.get("/#/medeo/day/2011-02-01");

    var calBtn = $(".show-appointment-cal");
    calBtn.click();
  });

  it('enables and disables the "Today" button if we are on today', function() {
    browser.get("/#/medeo/day/");
    var todayBtn = $(".show-today");

    expect(todayBtn.isEnabled()).toBe(false);

    $(".next-appointment-view").click();

    expect(todayBtn.isEnabled()).toBe(true);
  });

  xdescribe('realtime updates', function() {

    it('renders changes in realtime from other staff', function() {
      browser.get("/#/medeo/day/");

      var firstPatientId = $(".patient-name").evaluate("appointment.patient.id");

      firstPatientId.then(function(id){

        // send faye message
        H.publishFayeMsg("/organizations/medeo", {
          type: "patient/update",
          body: {
            id: id,
            first_name: "NEW",
            last_name: "NAME"
          }
        });

        expectPatientNameToBe("NEW NAME");
      });
    });

    it('removes appointments when the date is changed', function() {
      browser.get("/#/medeo/day/");

      var initialApptsCount = $$("tr.appointment").count(),
          appointmentId = $(".patient-name").evaluate("appointment.id"),
          countPromise;

      Q.all([initialApptsCount, appointmentId])
        .then(function(values){
          var count = values[0],
              id    = values[1];

          H.publishFayeMsg("/organizations/medeo", {
            type: "appointment/update",
            body: {
              id: id,
              date: "2011-01-01"
            }
          });

          setTimeout(function(){
            countPromise = $$("tr.appointment").count();
            expect(countPromise).toEqual(count - 1);
          }, 100);
        });

        waitsFor(function(){ return countPromise && !countPromise.isPending(); });
    });


    ['appointment/update', 'appointment/create'].forEach(function(msgType){

      it('adds appointments when ' + msgType + ' with selected date', function() {
        browser.get("/#/medeo/day/");

        var initialApptsCount = $$("tr.appointment").count(),
            countPromise;

        initialApptsCount.then(function(count){
          H.publishFayeMsg("/organizations/medeo", {
            type: msgType,
            body: Factory.build("appointment")
          });

          setTimeout(function(){
            countPromise = $$('tr.appointment').count();
            expect(countPromise).toEqual(count + 1);
          }, 100);
        });

        waitsFor(function(){ return countPromise && !countPromise.isPending(); });
      });

    });

  });


  function expectPatientNameToBe(name){
    var displayName = $(".patient-name").getText();
    return expect(displayName).toEqual(name);
  }

});
