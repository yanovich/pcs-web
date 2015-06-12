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
  directive('pcsPasswordConfirm', [function() {
    return {
      require: 'ngModel',
      scope: {
        password: "=pcsPasswordConfirm"
      },
      link: function(scope, elm, attrs, ctrl) {
        ctrl.$parsers.unshift(function(viewValue) {
          if (scope.password === viewValue) {
            ctrl.$setValidity('confirm', true);
            return viewValue;
          } else {
            ctrl.$setValidity('confirm', false);
            return undefined;
          }
        });
      }
    };
  }]);

  // vim:ts=2 sts=2 sw=2 et:
