angular
  .module("chatApp")
  .config([
    "$routeProvider",
    function($routeProvider){
      let landingPage;
      localStorage.getItem("User") === null ? landingPage = "/welcome" : landingPage = "/chat";
      $routeProvider
        .when("/welcome" , {
          template: `<welcome-screen></welcome-screen>`
        })
        .when("/login", {
          template: `<login-screen></login-screen>`
        })
        .when("/registration", {
          template: `<registration-screen></registration-screen>`
        })
        .when("/chat", {
          template: `<chat-screen></chat-screen>`
        })
        .otherwise(landingPage)
    }
  ])
