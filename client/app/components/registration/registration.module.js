angular
  .module("registrationScreen", [])
  .component("registrationScreen", {
    templateUrl: "client/app/components/registration/registration.template.html",
    controller: ["$http" , "$scope", "$timeout",  registrationScreenCtrl],
    controllerAs: "regCtrl"
  })

function registrationScreenCtrl($http, $scope, $timeout){
  this.newUser = {};
  this.serverRegErrors = {};
  this.registrationSucceed = false;
  // methods
  this.onSubmit = onSubmit;
  this.onInputChange = onInputChange;
  this.showValidationTips = showValidationTips;
  //regExps
  this.checkRules = {
    name: {
      regExp: /^[\w\s]{4,12}$/,
      failMessage: "User name must be at least 4 characters long!"
    },
    email: {
      regExp: /^\w{1,}(\.\w{1,}){0,}@\w{1,}(\.\w{1,}){1,}/,
      failMessage: "Invalid E-mail adress"
    },
    password: {
      regExp: /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/,
      failMessage: "Password must have at least one number and at least one special character"
    },
    confirmEmail: {
      failMessage: "Confirmation failed! E-mails dont match!"
    },
    confirmPassword: {
      failMessage: "Confirmation failed! Passwords dont match!"
    },
    avatar: {
      failMessage: "Please set the profile image!"
    },
    avatarType: {
      failMessage: "Inappropriate file type!"
    },
    userAllreadyExist:{
      failMessage: "User with such name is allready exists"
    }
  }

  // func bodies

  function onSubmit(){
    this.serverRegErrors = {};
    // forming formData
    const formData = new FormData;
    for(prop in this.newUser){
      formData.append(prop, this.newUser[prop])
    }
    let file = document.getElementById("avatar").files[0]
    if(!file){ file = "" } // to get rid of 'undefined' string on a server
                           // at the req.body.avatar
    console.log(file);
    formData.append("avatar", file)
    //
    const req = {
      method: "POST",
      url: "/registration",
      headers: {
        "Content-Type": undefined
      },
      data: formData
    }
    $http(req)
      .then(serverResponse=>{
        console.log(serverResponse)
        if(serverResponse.data.errors){
          console.log(serverResponse.data.errors);
          serverResponse.data.errors.forEach(err=>{
            this.serverRegErrors[err.param] = err.msg
            this.registrationSucceed = false;
          })
          console.log(this.serverRegErrors);
        } else {
          this.registrationSucceed = true;
          $timeout(()=>{
            window.location.hash = "#/login"
          }, 2000)
        }
      })
      .catch(err=>{
        console.log(err);
      })//$http end
  }

  function onInputChange(fieldName){
    this.serverRegErrors[fieldName] = false;
    if(fieldName === 'name'){
      this.serverRegErrors.userAllreadyExist = false;
    }
  }

  function showValidationTips(fieldName){
    if($scope.registrationForm[fieldName]){
      return $scope.registrationForm[fieldName].$valid === false  || this.serverRegErrors[fieldName]
    } else {
      return this.serverRegErrors[fieldName]
    }
  }
}
