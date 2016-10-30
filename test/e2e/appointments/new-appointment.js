var H = require("../../protractor_helper");

describe("Creating a new appointment", function(){

  beforeEach(function(){
    browser.get('/#/medeo/day');
  });

  it('should contain a create appointment button', function(){
    expect($('.create-appointment').isPresent()).toBeTruthy();
  });

  it('shows the popup', function(){
    var btn = $('.create-appointment');
    btn.click().then(function(){
      expect(element(by.css('.create-appointment-include div')).isDisplayed()).toBeTruthy();
    });
  });

  describe("form popup", function(){
    var patientFld;

    beforeEach(function(){
      $('.create-appointment').click();
      patientFld = element(by.model('selectedPatient'));
    });

    it('should dismiss itself when cancel is clicked', function(){
      var btn = $('.new-appointment-cancel-btn');
      btn.click().then(function(){
        expect($('.create-appointment-include div').isDisplayed()).toBeFalsy();
      });
    });

    describe('patient', function(){

      it('displays an error message if missing', function(){
        patientFld.click();
        $('.create-appointment-container input[name="email"]').click().then(function(){
          var errFld = $('small[ng-show="form.patient.hasVisited && form.patient.$error.required"]');
          expect(errFld.isDisplayed).toBeTruthy();
        });
      });
    });

    describe('invitee email', function(){
      var inviteeEmailFld;

      beforeEach(function(){
        inviteeEmailFld = $('.create-appointment-container input[name="email"]');
      });

      it('shows an invalid message if it is not valid', function(){
        inviteeEmailFld.sendKeys('foo');
        patientFld.click().then(function(){
          expect($('span[ng-show="form.email.$error.email"]').isDisplayed()).toBeTruthy();
        });
      });

      it('shows a required message if patient not selected', function(){
        inviteeEmailFld.click();
        patientFld.click().then(function(){
          expect($('small[ng-show="showEmailError()"]').isDisplayed()).toBeTruthy();
        });
      });
    }); // invitee email

    describe('duration', function(){
      var durationFld;

      beforeEach(function(){
        durationFld = $('.create-appointment-container input[name="duration"]');
      })

      it('shows an error message if invalid', function(){
        durationFld.sendKeys('foobar');
        patientFld.click().then(function(){
          var errFld = $('small[ng-show="form.duration.hasVisited && form.duration.$invalid"]');
          expect(errFld.isDisplayed()).toBeTruthy();
        });
      });

    }); // duration

    describe('practitioner', function(){
      var practitionerFld;

      beforeEach(function(){
        practitionerFld = $('.create-appointment-container input[name="practitioner"]');
        browser.selectOption = H.selectOption.bind(browser);
      });

      it('shows an error if none selected', function(){
        var practitionerSelection = $('select[name="practitioner"] option[value="0"]');
        practitionerSelection.click().then(function(){
          browser.selectOption(by.model('appointment.practitioner'), 'Select a Practitioner');
          var errFld = $('small[ng-show="form.practitioner.$dirty && form.practitioner.$invalid"]');
          expect(errFld.isDisplayed()).toBeTruthy();
        });
      });

    }); // practitioner

    describe('Save button', function(){

      var fillPatientDetails = function(){
        var patientField = element(by.model('selectedPatient'));
        patientField.sendKeys('John Doe');
        var emailField = element(by.model('email'));
        emailField.sendKeys('john.doe@example.org');
      };

      it('is initially disabled', function(){
        var btn = $('.new-appointment-save-btn');
        expect(btn.isEnabled()).toBeFalsy();
      });

      it('is enabled if form is valid', function(){
        fillPatientDetails();
        var practitionerSelection = $('select[name="practitioner"] option[value="0"]');
        practitionerSelection.click().then(function(){
          var saveBtn = $('.new-appointment-save-btn');
          expect(saveBtn.isEnabled()).toBeTruthy();
        });
      });

    }); // Save button

    describe('Cancel button', function(){

      it('hides the popup', function(){
        var cancelBtn = $('.new-appointment-cancel-btn');
        cancelBtn.click().then(function(){
          expect($('.create-appointment-include').isDisplayed()).toBeFalsy();
        });
      });

    }); // Cancel button

  }); // modal behaviour

});
