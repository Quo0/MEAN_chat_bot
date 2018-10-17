angular
  .module("chatApp")
  .directive("loadingCheckDirective", [
    function(){
      return {
        restrict: "A",
        scope: {
          atbottom: "@"
        },
        link: function(scope,element,attrs){
          const atBottom = JSON.parse(scope.atbottom);
          const messagesWindow = document.getElementById("messages-window");
          if(atBottom){
            messagesWindow.scrollTop = messagesWindow.scrollHeight - messagesWindow.offsetHeight;
          }
          element.bind("load", function(e){
            if(atBottom){
              messagesWindow.scrollTop = messagesWindow.scrollHeight - messagesWindow.offsetHeight;
            }
          })
        }
      }
    }
  ])
