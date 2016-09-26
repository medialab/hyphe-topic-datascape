'use strict';

/* Services */

// FIXME: clean this dirty hack
var stickyModeHeight = 80;

angular.module('app.directives', [])
  
.directive('ngPressEnter', [function () {
    return function (scope, element, attrs) {
      element.bind("keydown keypress", function (event) {
        if(event.which === 13) {
          scope.$eval(attrs.ngPressEnter)
          event.preventDefault()
          scope.$apply()
        }
      })
    }
  }])
