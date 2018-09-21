angular
  .module("chatApp")
  .factory("queryNewsArticles", ["$http" , function($http){
    return function(url){
      const req = {
        method: "GET",
        url: url,
        headers: {
          "Content-Type":"application/JSON"
        }
      }
      return $http(req)
    }
  }]);
