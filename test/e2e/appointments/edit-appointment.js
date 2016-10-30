var H = require("../../protractor_helper");

describe("Editing an appointment", function(){

  var ptor, button;

  beforeEach(function(){
    browser.get('/#/medeo/day');
    ptor = protractor.getInstance();
  });

  it('should contain an edit button', function(){
    expect($('.edit-appointment').isPresent()).toBeTruthy();
  });

  it('shows the popup', function(){
    var btn = ptor.findElement(protractor.By.css('.edit-appointment'));
    ptor.actions().mouseMove(btn).perform();
    expect(btn.isDisplayed()).toBeTruthy();
    btn.click().then(function(){
      expect(element(by.css('.edit-appointment-include div')).isDisplayed()).toBeTruthy();
    });
  });

  describe("form popup", function(){
    var cancelBtn, saveBtn, durationFld, timeStringFld, dateFld;

    beforeEach(function(){
      var btn = ptor.findElement(protractor.By.css('.edit-appointment'));
      ptor.actions().mouseMove(btn).perform();
      btn.click().then(function(){
        cancelBtn = $('.edit-appointment-cancel-btn');
        saveBtn = $('.edit-appointment-save-btn');
        timeStringFld = $('.edit-appointment-container input[name="timeString"]');
        durationFld = $('.edit-appointment-container input[name="duration"]');
        dateFld = $('.edit-appointment-container input[name="date"]');
      });
    });

    describe('duration', function(){

      it('shows an error message if invalid', function(){
        dateFld.sendKeys('foobar').then(function(){
          timeStringFld.sendKeys('hello');
        }).then(function(){
          var errFld = $('.edit-appointment-container small[ng-show="form.date.hasVisited && form.date.$invalid"]');
          expect(errFld.isDisplayed()).toBeTruthy();
        });
      });

    }); // duration

    describe('date', function(){

      it('shows an error message if invalid', function(){
        durationFld.sendKeys('foobar').then(function(){
          timeStringFld.sendKeys('hello');
        }).then(function(){
          var errFld = $('.edit-appointment-container small[ng-show="form.duration.hasVisited && form.duration.$invalid"]');
          expect(errFld.isDisplayed()).toBeTruthy();
        });
      });

    }); // date

    describe('Cancel', function(){

      it('is enabled and visible', function(){
        expect(cancelBtn.isEnabled()).toBeTruthy();
        expect(cancelBtn.isDisplayed()).toBeTruthy();
      });

      it('should dismiss itself when cancel is clicked', function(){
        cancelBtn.click().then(function(){
          expect(element(by.css('.edit-appointment-include div')).isDisplayed()).toBeFalsy();
        });
      });

    }); // Cancel

    describe('Save button', function(){

      it('is initially enabled and visible', function(){
        expect(saveBtn.isEnabled()).toBeTruthy();
        expect(saveBtn.isDisplayed()).toBeTruthy();
      });

      it('is disabled if form is invalid', function(){
        durationFld.sendKeys('foobar').then(function(){
          expect(saveBtn.isEnabled()).toBeFalsy();
        });
      });

      it('should dismiss the popup when submit is clicked', function(){
        saveBtn.click().then(function(){
         expect(element(by.css('.edit-appointment-include')).isDisplayed()).toBeFalsy();
        });
      })

    }); // Save button

  }); // form popup

}); // Editing an appointment
