describe("Testing <login-screen>", function() {
  let logCtrl, $httpBackend ;
  let httpresult ;

  // MOCKING HTTP RESPONSES AND LOCALSTORAGE

  const positiveHTTPresponse = {
    currentUserData: {
      name: "mockName",
      email: "mockEmail",
      _id: "mock_id",
      avatar: "mockAvatar"
    }
  };
  const negHTTP_no_userName = {
    accessError: "No such username!"
  };
  const negHTTP_no_pwd = {
    accessError: "Invalid password"
  };
  const localStorageUser = {
    name: "mock_LS_name",
    email: "mock_LS_email",
    id: "mock_LS_id",
    avatar: "mock_LS_avatar",
    loginTime: "mock_LS_loginTime"
  };

  // INJECTING CONTROLLER

  beforeEach(module("loginScreen"));
  beforeEach(inject(function($componentController , _$httpBackend_) {
    logCtrl = $componentController("loginScreen");
    $httpBackend = _$httpBackend_;
    //default server respose is positive
    httpresult = $httpBackend.when('POST', '/login', {
                  name: "test",
                  password: "testP"
                })
                .respond(JSON.stringify(positiveHTTPresponse));
  }));

  // TESTING

  describe("-> Testing POST requests with correct data.", function() {
    beforeEach(function() {
      logCtrl.onSubmit();
      $httpBackend.flush();
    });

    it("It should set logCtrl.currentUser.", function() {
      expect(logCtrl.currentUser).toBe("mockName");
    });

    it("It should set the localStorage.User.", function() {
      for(prop in positiveHTTPresponse.currentUser){
        expect(JSON.parse(window.localStorage.User)[prop]).toBe(positiveHTTPresponse.currentUser[prop]);
      }
    });
  });

  describe("-> Testing empty POST requests.", function() {
    beforeEach(function() {
      httpresult.respond(200, JSON.stringify(negHTTP_no_userName));
      logCtrl.onSubmit();
      $httpBackend.flush();
    });

    it("It should populate serverLoginErrors on error.", function() {
      expect(logCtrl.serverLoginErrors).not.toBe(undefined);
    });
  });

  describe("-> Testing POST request with wrong Username. ", function(){
    beforeEach(function() {
      httpresult.respond(200, JSON.stringify(negHTTP_no_userName));
      logCtrl.onSubmit();
      $httpBackend.flush();
    });

    it(`It should sent back a ${negHTTP_no_userName.accessError} serverError`, function() {
      expect(logCtrl.serverLoginErrors).toBe(negHTTP_no_userName.accessError);
    });
  });

  describe("-> Testing POST request with wrong Password.", function(){
    beforeEach(function() {
      httpresult.respond(200, JSON.stringify(negHTTP_no_pwd));
      logCtrl.onSubmit();
      $httpBackend.flush();
    });

    it(`It should sent back a ${negHTTP_no_pwd.accessError} serverError`, function() {
      expect(logCtrl.serverLoginErrors).toBe(negHTTP_no_pwd.accessError);
    });
  });

  describe("-> Testing input fileds", function() {
    beforeEach(function() {
      logCtrl.serverLoginErrors = "any server error";
      logCtrl.onInputChange();
    });

    it("It should reset errors after <input> been changed.", function() {
      expect(logCtrl.serverLoginErrors).toBe("");
    });
  });

});
