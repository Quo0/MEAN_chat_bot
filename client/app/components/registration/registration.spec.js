describe("Testing <registration-screen>", function() {
  let regCtrl, $compile, $rootScope, $scope, $httpBackend ;
  let httpResult ;
  let compiledHTML ;

  // MOCKING HTTP RESPONSES

  const mockFormData = new FormData();
        mockFormData.append("name", "mockFormData_name");
        mockFormData.append("email", "mockFormData_email");
        mockFormData.append("password", "mockFormData_password");
        mockFormData.append("avatar", "mockFormData_avatar");

  const positiveHTTPresponse = {
    name: "unit",
    password: "!12345",
    email: "unit@test.com",
    avatar: "server/uploads/2018-10-30T12-32-26.375Z_robo2.png",
    _id: "5bd84f5af268513bd00f5c08"
  }

  const negativeHTTPresponse = {
    errors: [
      {
        location: "body",
        msg: "User name must be at least 4 characters long!",
        param: "name"
      },
      {
        location: "body",
        msg: "Invalid E-mail adress",
        param: "email"
      },
      {
        location: "body",
        msg: "Password must have at least one number and at least one special character",
        param: "password"
      },
      {
        location: "body",
        msg: "Confirmation failed! E-mails dont match!",
        param: "confirmEmail"
      },
      {
        location: "body",
        msg: "Confirmation failed! Passwords dont match!",
        param: "confirmPassword"
      },
      {
        location: "body",
        msg: "Please set the profile image!",
        param: "avatar",
        value: ""
      },
      {
        msg: "Inappropriate file type!",
        param: "avatarType"
      }
    ],
    respText: "WE GOT SOME ERRORS"
  };

  // INJECTING CONTROLLER

  beforeEach(module("registrationScreen"));
  beforeEach(module("mock_templates"));
  beforeEach(inject(function($componentController, _$rootScope_,  _$compile_, _$httpBackend_) {
    // if we dont use npm module "ng-html2js" we can inject $templateCache and
    // define whole html as a template and use next function:
    // $templateCache.put("client/app/components/registration/registration.template.html" , template);

    regCtrl = $componentController("registrationScreen") ;
    $httpBackend = _$httpBackend_ ;
    $rootScope = _$rootScope_ ;
    $compile = _$compile_ ;

    //compiling
    elm = angular.element("<registration-screen></registration-screen>");
    compiledHTML = $compile(elm)($rootScope);
    $rootScope.$digest();

    // define default http response
    httpResult = $httpBackend.when("POST", "/registration", {})
                             .respond(JSON.stringify(positiveHTTPresponse));
                             
  }));

  describe("-> Testing POST requests with correct data", function() {
    beforeEach(function() {
      regCtrl.onSubmit();
      $httpBackend.flush();
    });

    it("It should set registrationSucceed === true", function() {
      expect(regCtrl.registrationSucceed).toBe(true);
    });

  });

  describe("-> Testing POST request with wrong data", function() {
    beforeEach(function() {
      httpResult.respond(200, JSON.stringify(negativeHTTPresponse));
      regCtrl.onSubmit();
      $httpBackend.flush();

    });

    it("It should set registrationSucceed === false", function() {
      expect(regCtrl.registrationSucceed).toBe(false);
    });

    it("It should set serverRegErrors." , function() {
      const ctrlChecks = regCtrl.checkRules;
      const SRE = regCtrl.serverRegErrors ;

      expect(SRE.length).not.toBe(0);

      negativeHTTPresponse.errors.forEach( obj => {
        expect(SRE[obj.param]).toEqual(ctrlChecks[obj.param].failMessage);
      });
    });

  });

  // describe("spy", function() {
  //   beforeEach(function() {
  //     spyOn(regCtrl, "showValidationTips").and.callThrough();
  //     regCtrl.onSubmit();
  //     $httpBackend.flush();
  //
  //   });
  //
  //   it("asdasd" , function() {
  //     expect(regCtrl.showValidationTips).toHaveBeenCalled();
  //   });
  // });

});
