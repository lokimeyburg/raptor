var moment = require('moment'),
    H = require("../../protractor_helper");

describe("Filtering the Schedule", function(){

  beforeEach(function(){
    browser.get("/#/medeo/day");
    var toggleFilterBtn = $('.appointments-toggle-filter');
    toggleFilterBtn.click();
  });

  it('hides the filter if toggle filter button is clicked', function(){
    var toggleFilterBtn = $('.appointments-toggle-filter');
    toggleFilterBtn.click();
    var filter = $('.practitioner-filter');
    expect(element(by.css('.practitioner-filter')).isDisplayed()).toBeFalsy();
  });

  it('should show a list of the doctors that can be filtered', function(){
    var practitionerFilter = $("label.staff-filter").getText();
    var practitioner = $(".staff-member-name").getText();
    expect(practitionerFilter).toEqual(practitioner);
  });

  it('should show and hide a doctors appointments when clicked', function(){
    $('a.hide-all-staff').click();
    var staffFilter = $("label.staff-filter input[type='checkbox']").click();
    var practitioner = $(".staff-member-name").getText();
    expect(practitioner).toEqual('John Dane');
  });

  it('should show all doctors appointments when we press "select all"', function(){
    $('a.hide-all-staff').click();
    expect($$(".staff-member-name").count()).toEqual(0);
    $('a.show-all-staff').click();
    expect($$(".staff-member-name").count()).toBeGreaterThan(0);
  });


  it('should filter the list of doctors when I type in the filter box', function(){
    $('.filter-list-of-doctors').sendKeys("bogus");
    expect($$("label.staff-filter").count()).toEqual(0);
    $('.filter-list-of-doctors').clear();
    $('.filter-list-of-doctors').sendKeys("Joh");
    expect($$("label.staff-filter").count()).toBeGreaterThan(0);
  });

});
