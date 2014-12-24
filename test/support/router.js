/* test/support/router.js -- mock router
* Copyright 2014 Sergei Ianovich
*
* Licensed under AGPL-3.0 or later, see LICENSE
* Process Control Service Web Interface
*/
'use strict';

function router(actions, req, res) {
  if (actions.length == 0)
    return;
  var action = actions.shift(),
  next = function() {
    router(actions, req, res);
  };
  action(req, res, next);
}

module.exports = router;

// vim:ts=2 sts=2 sw=2 et:
