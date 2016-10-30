window.H = {

  injector: function(){
    return angular.injector(['ng']);
  },

  promiseValue: function(value){
    var $q = this.injector().get("$q");

    var deferred = $q.defer();
    deferred.resolve(value);

    return deferred.promise;
  },

  promiseLogger: function(){ console.log(arguments) },

  mockStateParams: function(){
    module("medeo.app");
    return inject(function($stateParams){
      $stateParams.orgName = "medeo";
    });
  },

  mockPatientStateParams: function(){
    module("medeo.app");
    return inject(function($stateParams){
      $stateParams.orgName = "medeo";
      $stateParams.patientId = "88888";
    });
  }, 

  mockCameraCheck: function(){
    return inject(function(AudioVideoAccess){
      AudioVideoAccess.checkCameraAccess = function(){
        return true;
      };
    });
  }

};
