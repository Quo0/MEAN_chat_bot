angular
  .module("welcomeScreen",[])
  .component("welcomeScreen", {
    templateUrl: "client/app/components/welcome/welcome.template.html",
    controller: ["$rootScope" , welcomeScreenCtrl]
  })

function welcomeScreenCtrl(){
  this.test = "jasmin";
}
