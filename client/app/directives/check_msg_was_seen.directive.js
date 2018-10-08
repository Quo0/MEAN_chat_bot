angular
  .module("chatApp")
  .directive("beenSeenStatus", [
    "$timeout",
    function($timeout){
      return {
        restrict: "A",
        scope: {
          ctrl: "=ctrl"
        },
        link: function(scope, elem , attrs){
          if(!scope.ctrl.atBottom){
            elem[0].style.background = "linear-gradient(to right, #FFF 15%, #71bcf142 100%)"
          }
          angular.element(document.getElementById("messages-window")).bind("scroll" , function(e){
            if(scope.ctrl.atBottom){
              $timeout(()=>{
                elem[0].style.background = "";
              }, 1000)
            }
          })
        }
      }
    }
  ]);
