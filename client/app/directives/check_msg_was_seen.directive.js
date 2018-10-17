angular
  .module("chatApp")
  .directive("beenSeenStatus", [
    "$timeout",
    function($timeout){
      return {
        restrict: "A",
        scope: {
          showonloadlimit: "@",
          atbottom: "@",
          index: "@"
        },
        link: function(scope, element , attrs){
          // atBottom depends on scroll position while elementwas created
          const atBottom = JSON.parse(scope.atbottom);
          const isNewMsg = +scope.index + 1 > +scope.showonloadlimit;
          if(!atBottom && isNewMsg  ){
            element[0].style.background = "linear-gradient(to right, #FFF 15%, #71bcf142 100%)" ;
            //we watch only for whose who is new , otherwise will couse CPU problems
            const listener = scope.$root.$on("atBottom", function(){
              $timeout(()=>{
                element[0].style.background = "";
              }, 500)
            });
            scope.$on('destroy', function(){
              listener();
              "DESTRIYED"
            });
          };
        }
      }
    }
  ]);
