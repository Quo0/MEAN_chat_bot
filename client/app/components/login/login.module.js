angular.module("loginScreen",[])
  .component("loginScreen", {
    templateUrl: "client/app/components/login/login.template.html",
    controller: ["$http", "$timeout" , loginScreenCtrl],
    controllerAs: "logCtrl"
  })

function loginScreenCtrl($http, $timeout){
  this.onSubmit = function(){
    localStorage.clear();
    const req = {
      method: "POST",
      url: "/login",
      headers: {
        "Content-Type" : "application/JSON"
      },
      data: JSON.stringify(this.User)
    }

    $http(req)
      .then(serverResponse=>{
        if(serverResponse.data.serverError){
          // handle server errors ( db error occured )
        }
        if(serverResponse.data.accessError){
          this.serverLoginErrors = serverResponse.data.accessError
        } else {
          localStorage.setItem("User", JSON.stringify({
            name: serverResponse.data.currentUserData.name,
            email: serverResponse.data.currentUserData.email,
            id: serverResponse.data.currentUserData._id,
            avatar: serverResponse.data.currentUserData.avatar,
            loginTime: new Date()
          }))
          this.currentUser = serverResponse.data.currentUserData.name
          $timeout(()=>{
            window.location.hash = "#/chat"
          }, 2000)
        }
      })
      .catch(err=>{
        console.log(err);
      })
  }

  this.onInputChange = function(){
    this.serverLoginErrors = "";
  }
}
