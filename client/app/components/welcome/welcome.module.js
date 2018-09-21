angular
  .module("welcomeScreen",[])
  .component("welcomeScreen", {
    templateUrl: "client/app/components/welcome/welcome.template.html",
    controller: welcomeScreenCtrl
  })

function welcomeScreenCtrl(){
  console.log(" W _ S ")
}
