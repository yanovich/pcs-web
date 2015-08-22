'use strict';

/* Directives */


angular.module('pcs.directives', []).
  directive('pcsOperatorAdmin', [function() {
    return function(scope, elm, attrs) {
      if (elm.text() === 'true') {
        scope.operator.admin = true;
      }
    };
  }]).
  directive('pcsOperatorId', [function() {
    return function(scope, elm, attrs) {
      scope.operator._id = elm.text();
    };
  }]).
  directive('pcsPasswordMatch', [function() {
    return {
      require: 'ngModel',
      scope: {
        password: "=pcsPasswordMatch"
      },
      link: function(scope, elm, attrs, ctrl) {
        ctrl.$parsers.unshift(function(viewValue) {
          if (scope.password === viewValue) {
            ctrl.$setValidity('match', true);
            return viewValue;
          } else {
            ctrl.$setValidity('match', false);
            return undefined;
          }
        });
      }
    };
  }]);
