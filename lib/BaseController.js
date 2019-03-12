module.exports = class BassController {
  constructor() {
    // Validation:
    this.loginValidation = [];
    // To get 'this' in instance methods:
    this.initRoutes = this.initRoutes.bind(this);
  }
  // Use express.Router() and configure sub routes/middleware.
  // Then pass to router.use()
  initRoutes(router) {}
  // Utils: extract param from req.body or req.query or default value
  getParam(req, name, def = "") {
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
