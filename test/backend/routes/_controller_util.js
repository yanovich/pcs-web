'use strict'
/* test/backend/routes/_controllers_utils.js -- controller's test helpers
* Copyright 2014 Sergei Ianovich
*
* Licensed under AGPL-3.0 or later, see LICENSE
* Process Control Service Web Interface
*/
function actionExecuter(actions, req, res) {
  if (actions.length == 0)
    return;
  var action = actions.shift(),
  next = function() {
    actionExecuter(actions, req, res);
  };
  action(req, res, next);
}

module.exports = function(admin, operator) {
  return {
    executer: actionExecuter,
    operatorRequest: function () {
      return {
        session: {
          operatorId: operator._id,
        },
      };
    },
    adminRequest: function () {
      return {
        session: {
          operatorId: admin._id,
        },
      };
    },
  };
};

