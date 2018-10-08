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
          const UL = Array.from(document.querySelectorAll("#latest-messages > li"));
          const isNewMsg = UL.indexOf(elem[0]) > scope.ctrl.showOnLoadLimit ;
          if(!scope.ctrl.atBottom && isNewMsg  ){
            elem[0].style.background = "linear-gradient(to right, #FFF 15%, #71bcf142 100%)"
          };
          angular.element(document.getElementById("messages-window")).bind("scroll" , function(e){
            if(scope.ctrl.atBottom){
              $timeout(()=>{
                elem[0].style.background = "";
              }, 500)
            }
          })
        }
      }
    }
  ]);
