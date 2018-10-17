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
          angular.element(document.getElementById("messages-window")).bind("scroll" , function(e){
            if(atBottom){
              $timeout(()=>{
                elem[0].style.background = "";
              }, 500)
            }
          })
        }
      }
    }
  ]);


  // angular
  //   .module("chatApp")
  //   .directive("beenSeenStatus", [
  //     "$timeout",
  //     function($timeout){
  //       return {
  //         restrict: "A",
  //         scope: {
  //           // ctrl: "=ctrl",
  //           // showonloadlimit: "@"
  //         },
  //         link: function(scope, elem , attrs){
  //           const messagesWindow = angular.element(document.getElementById("messages-window"));
  //           const UL = Array.from(document.querySelectorAll("#latest-messages > li"));
  //           const isNewMsg = UL.indexOf(elem[0]) > 50 ;
  //           const bottomPosition = messagesWindow[0].scrollHeight - messagesWindow[0].clientHeight - messagesWindow[0].scrollTop;
  //           // console.log(bottomPosition - 67);
  //           // 67 is the "bot typing" msg height
  //           if(!bottomPosition - 67 <= 2 && isNewMsg  ){
  //             elem[0].style.background = "linear-gradient(to right, #FFF 15%, #71bcf142 100%)"
  //           };
  //           messagesWindow.bind("scroll" , function(e){
  //             // console.log(bottomPosition);
  //             if(bottomPosition <= 1){
  //               $timeout(()=>{
  //                 elem[0].style.background = "";
  //               }, 500)
  //             }
  //           })
  //
  //           scope.$on("$destroy", function(){
  //             console.log("unbind");
  //             messagesWindow.unbind("scroll");
  //           });
  //         }
  //       }
  //     }
  //   ]);
