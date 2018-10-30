describe("testing <welcome-screen>", function() {
  let $controller ;
  beforeEach(module('welcomeScreen'));

  beforeEach(inject(function($componentController){
    $controller = $componentController('welcomeScreen');
  }));
  describe("evaluation: $scope.test", function() {
    it("should be === 'jasmin' ", function() {
      expect($controller.test).toEqual("jasmin");
    });
  });

});
