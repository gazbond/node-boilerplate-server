const jwt = require("jsonwebtoken");
const { buildCheckFunction } = require("express-validator/check");
const check = buildCheckFunction(["body", "query"]);
const BassController = require("../../library/BaseController");
const User = require("../../models/User");
const passport = require("../../library/helpers/passport");
const {
  validationErrors,
  bindMethods,
  wrapAsync,
  getParam
} = require("../../library/helpers/utils");

/**
 * Security controller handles login, register, confirm email and change password.
 * TODO: redirectUrl query param (no json response?)
 */
module.exports = class SecurityController extends BassController {
  /**
   * Configuration.
   */
  constructor() {
    super();
    // Paths:
    this.paths.login = "/security/login";
    // Validations:
    this.validators.login = [
      check(
        "login",
        "Login should be alpha-numeric and more than 3 characters long"
      )
        .exists({
          checkNull: true,
          checkFalsy: true
        })
        .isAlphanumeric()
        .isLength({ min: 3 }),
      check(
        "password",
        "Password should be alpha-numeric and more than 4 characters long"
      )
        .exists({
          checkNull: true,
          checkFalsy: true
        })
        .isAlphanumeric()
        .isLength({ min: 4 })
    ];
    // To get 'this' in instance methods:
    bindMethods(this, ["actionLoginGet", "actionLoginPost"]);
  }
  /**
   * Returns express.Router() configured with paths/middleware.
   */
  initRouter() {
    this.router.get(this.paths.login, wrapAsync(this.actionLoginGet));
    this.router.post(
      this.paths.login,
      this.validators.login,
      wrapAsync(this.actionLoginPost)
    );
    return this.router;
  }
  /**
   * Utils: construct params passed to views/login.ejs
   */
  loginViewParams(req, errors) {
    return {
      errors: errors,
      fields: ["login", "password"],
      login: getParam(req, "login"),
      password: getParam(req, "password")
    };
  }
  /**
   * GET security/login
   */
  async actionLoginGet(req, res) {
    res.render("security/login", this.loginViewParams(req, []));
  }
  /**
   * POST security/login
   */
  async actionLoginPost(req, res) {
    // Check validation errors
    const errors = validationErrors(req);
    if (!errors.isEmpty()) {
      // mapped() means only 1 error per field. Specify fields[] in partials/errors.ejs
      return res.render(
        "security/login",
        this.loginViewParams(req, errors.mapped())
      );
    }
    // Try loading user
    const user = await User.query()
      .where({ username: req.body.login })
      .orWhere({ email: req.body.login })
      .first();
    // User not found
    if (!user) {
      return res.render(
        "security/login",
        this.loginViewParams(req, {
          login: { message: "Incorrect login" }
        })
      );
    }
    // Incorrect password
    const validPassword = await user.verifyPassword(req.body.password);
    if (!validPassword) {
      return res.render(
        "security/login",
        this.loginViewParams(req, {
          password: { message: "Incorrect password" }
        })
      );
    }
    // Generate token
    const payload = { id: user.id };
    jwt.sign(
      payload,
      passport.jwt.secretOrKey,
      {
        expiresIn: passport.jwt.expiresIn
      },
      // Callback
      (err, token) => {
        if (err) throw err;
        // Send Authorization header
        res.header("Authorization", token);
        // Send Set-Cookie header
        res.cookie("Authorization", token, {
          httpOnly: true,
          sameSite: true
        });
        // Send Token
        res.json({
          Authorization: token
        });
      }
    );
  }
};
