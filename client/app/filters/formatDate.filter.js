angular
  .module("chatApp")
  .filter("formatDate", [
    function(){
      return function(dateString){
        return new Date(dateString).toLocaleTimeString()
      }
    }
  ])
