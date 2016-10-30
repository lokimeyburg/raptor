var H = require("../../protractor_helper"),
    Q = require("q"),
    _f = require("../../support/factories"),
    Factory = require("rosie").Factory;

describe("Viewing the Patient", function(){

  beforeEach(function(){
    browser.get("/#/medeo/patients/88888");
  });

  describe("Patient Profile", function(){
    var profileData = [];
    beforeEach(function(){
      $$(".profile-table td").map(function(data){
        data.getText().then(function(value){
          profileData.push(value);
        });
      });
    });

    it('should show the patients name', function(){
      var name = $(".patient-name").getText();
      expect(name).toEqual("Joshua Collins");
    });

    it('should show the patients age', function(){
      expect(profileData[1]).toEqual('30');
    });

    it('should show the patients sex', function(){
      expect(profileData[3]).toEqual('MALE');
    });

    it('should show the patients province', function(){
      expect(profileData[5]).toEqual('BC');
    });

    it('should show the patients MSP', function(){
      expect(profileData[7]).toEqual('1234567890');
    });

    it('should show the patients email', function(){
      expect(profileData[9]).toEqual('JOSHUA.COLLINS@MEDEO.CA');
    });

    it('should show the patients mobile phone number', function(){
      expect(profileData[11]).toEqual('1 604 312-9191');
    });

  });

  describe("Visits", function(){
    it('should contain visits in the sidebar', function(){
      expect($$("ul.visit-list li").count()).toEqual(2);
    });

    it('should be redirected to the visit page', function(){
      ptor = protractor.getInstance();
      expect(ptor.getCurrentUrl()).toMatch(/patients\/\d+\/visits\/\d+/);

    });

    it('should show chief complaint for the visit', function(){
      expect($(".vd-section-body p").isPresent()).toBeTruthy();
    });

    it('should allow navigation between visits', function(){
      ptor.getCurrentUrl().then(function(url){
        $$("ul.visit-list li a").last().click();
        expect(ptor.getCurrentUrl()).not.toEqual(url);
      });
    });
  });
});
