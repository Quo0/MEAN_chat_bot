angular
  .module("chatApp")
  .factory("addToMessageHistory", [ "$http" , function($http){
    return function(currentUser, fromWho, message){
      const req = {
        method: "POST",
        url:`/chat/${currentUser.id}`,
        headers: {
          "Content-Type":"application/JSON"
        },
        data: JSON.stringify({
          whoSent: fromWho,
          message: message,
          date: Date.parse(new Date()),
          avatar: fromWho === "BOT" ? "client/app/components/chat/img/3_bf.jpg" : currentUser.avatar
        })
      }
      return $http(req)
    }
  }]);
