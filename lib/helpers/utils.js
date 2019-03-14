/**
 * Utility functions.
 * Can extract individual functions with { func } syntax.
 * e.g. const { wrapAsync, getParam } = require("./Utils");
 */
module.exports = {
  /**
   * Utils: wrap async functions to handle promise errors.
   */
  wrapAsync: func => {
    return (req, res, next) => {
      const promise = func(req, res, next);
      if (promise.catch) {
        promise.catch(err => next(err));
      }
    };
  },
  /**
   * Utils: extract param from req.body, req.query or default value.
   */
  getParam: (req, name, def = "") => {
    let returnVal = def;
    // Check query
    if (req.query[name]) {
      returnVal = req.query[name];
    }
    // Check body
    if (req.body[name]) {
      returnVal = req.body[name];
    }
    return returnVal;
  }
};
