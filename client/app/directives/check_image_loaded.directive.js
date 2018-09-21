angular
  .module("chatApp")
  .directive("loadingCheckDirective", [
    function(){
      return {
        restrict: "A",
        scope: {
          ctrl: "=ctrl"
        },
        link: function(scope,element,attrs){
          const messagesWindow = document.getElementById("messages-window");
          if(scope.ctrl.atBottom){
            messagesWindow.scrollTop = messagesWindow.scrollHeight - messagesWindow.offsetHeight;
          }
          element.bind("load", function(e){
            if(scope.ctrl.atBottom){
              messagesWindow.scrollTop = messagesWindow.scrollHeight - messagesWindow.offsetHeight;
            }
          })
        }
      }
    }
  ])
