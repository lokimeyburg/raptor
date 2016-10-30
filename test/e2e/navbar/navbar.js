describe('Viewing the Navbar', function() {

  beforeEach(function(){
    browser.get("/#/medeo/day");
  });

  it('should render the search form', function(){
    expect($('input.form-control').isPresent()).toBeTruthy();
  });

  it('should find a user by name', function(){
    $('input.form-control').sendKeys('Joshua');
    var userLink = $('a.patient-query');
    expect(userLink.getText()).toContain('Joshua');
    userLink.click();
    ptor = protractor.getInstance();
    expect(ptor.getCurrentUrl()).toMatch(/patients\/\d+\//);
  });

});
