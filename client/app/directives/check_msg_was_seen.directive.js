angular
  .module("chatApp")
  .directive("beenSeenStatus", [
    "$timeout",
    function($timeout){
      return {
        restrict: "A",
        scope: {
          showonloadlimit: "@",
          atbottom: "@"
        },
        link: function(scope, elem , attrs){
          const atBottom = JSON.parse(scope.atbottom);
          const UL = Array.from(document.querySelectorAll("#latest-messages > li"));
          const isNewMsg = UL.indexOf(elem[0]) > +scope.showonloadlimit ;
          if(!atBottom && isNewMsg  ){
            elem[0].style.background = "linear-gradient(to right, #FFF 15%, #71bcf142 100%)"
          };
          const messagesWindow = angular.element(document.getElementById("messages-window"));
          messagesWindow.bind("scroll" , function(e){
            if( messagesWindow[0].scrollHeight - messagesWindow[0].clientHeight - messagesWindow[0].scrollTop <= 2){
              $timeout(()=>{
                elem[0].style.background = "";
              }, 500)
            }
          })
        }
      }
    }
  ]);
