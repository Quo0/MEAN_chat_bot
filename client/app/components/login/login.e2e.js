describe("Testing <login-screen>", function() {

  describe("-> Testing form submiting", function() {
    const formDiv = element(by.css(".not-succeed"));
    const confDiv = element(by.css(".succeed"));
    const errDiv = element(by.css(".errors"));
    const submitBtn = element(by.css('form button'));
    const usernameInp = element(by.model('logCtrl.User.name'));
    const userpswdInp = element(by.model('logCtrl.User.password'));

    const correctAuth = {
      name: "The Good",
      password: "!12345"
    }

    beforeEach(function() {
      browser.get('http://localhost:4000/#/login');
    });

    it('should automatically redirect to /view1 when location hash/fragment is empty', function() {
      browser.get('http://localhost:4000/#/asdadaaasd');
      expect(browser.getCurrentUrl()).toMatch("/welcome");
    });

    it("It should show form and hide login-confirm on landing", function() {
      expect(confDiv.getCssValue("display")).toEqual("none");
      expect(formDiv.getCssValue("display")).toEqual("block");
    });

    describe("-> Testing negative variants.", function() {
      it("It should show errors if data is incorrect", function() {
        usernameInp.sendKeys("Wrong username");
        userpswdInp.sendKeys("Wrong pswd");
        submitBtn.click();

        expect(errDiv.getCssValue("display")).toEqual("block");
      });

      it("It should hide errors on <input> change", function() {
        submitBtn.click();
        expect(errDiv.getCssValue("display")).toEqual("block");

        usernameInp.sendKeys("any value");
        expect(errDiv.getCssValue("display")).toEqual("none");
      });
    });

    describe("-> Testing positive variants.", function() {
      beforeEach(function() {
        usernameInp.sendKeys(correctAuth.name);
        userpswdInp.sendKeys(correctAuth.password);
        submitBtn.click();
      });

      it("It should hide form and show login-confirm on submit correct auth", function() {
        browser.waitForAngularEnabled(false); // dont wait for redirection

        expect(confDiv.getCssValue("display")).toEqual("block");
        expect(formDiv.getCssValue("display")).toEqual("none");

        browser.waitForAngularEnabled(true);  // reset back
      });

      it("It should redirect to /chat.", function() {
        expect(browser.getCurrentUrl()).toMatch("/chat");
      });

    });

  });

});
