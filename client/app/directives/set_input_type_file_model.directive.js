 angular
  .module("registrationScreen")
  .directive("fileModelDirective", [
    function() {
      return {
        restrict: "A",
        require: "ngModel",
        link: function(scope,element,attrs,ngModel) {
          element.bind("change", function(changeEvent) {
            scope.regCtrl.serverRegErrors.avatarType =''; // to reset serverError
            scope.regCtrl.serverRegErrors.avatar = false; // to reset serverError

            if(changeEvent.target.files.length > 0){
              const files = changeEvent.target.files[0].name;
              ngModel.$setViewValue(files);
              // set validity
              scope.registrationForm[element[0].name].$setValidity('require', true)
            } else {
              ngModel.$setViewValue("");
              // set invalidity
              scope.registrationForm[element[0].name].$setValidity('require', false)
            }
          })
        }
      }
  }]);












// angular
//   .module("registrationScreen")
//   .directive("fileupload", [
//     function(){
//       return {
//         restrict: "EA",
//         link: function(scope,element,attrs){
//           console.log(element);
//           element.bind("change", function (changeEvent) {
//             console.log(element);
//               if(changeEvent.target.files.length > 0){
//                 const reader = new FileReader();
//                 console.log(reader);
//                 reader.readAsDataURL(changeEvent.target.files[0]);
//                 console.log(reader);
//                 reader.onload = function (loadEvent) {
//                   scope.$apply(function () {
//                     scope.regCtrl.IMG = loadEvent.target.result
//                   });
//                 }
//               } else {
//                 // scope.Main.EVENTS = [];
//               }
//           });
//         }
//       }
//     }
//   ])














//
// angular
//   .module("registrationScreen")
//   .directive("fileModel", [
//     "$parse",
//     function($parse){
//       return {
//         restrict: "A",
//         link: function(scope,element,attrs){
//           const parsedFile = $parse(attrs.fileModel);
//           const parsedFileSetter = parsedFile.assign;
//
//           element.bind("change" , function(){
//             parsedFileSetter(scope, element[0].files[0]);
//           })
//         }
//       }
//     }
//   ])
