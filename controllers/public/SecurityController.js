const jwt = require("jsonwebtoken");
const {
  buildCheckFunction,
  validationResult
} = require("express-validator/check");
const check = buildCheckFunction(["body", "query"]);

const BassController = require("../../library/BaseController");
const User = require("../../models/User");
const passport = require("../../library/helpers/passport");
const { wrapAsync, getParam } = require("../../library/helpers/utils");

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
    // Options:
    this.loginRoute = "/security/login";
    // Route handlers:
    this.handlers = [
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
    this.loginGet = this.loginGet.bind(this);
    this.loginPost = this.loginPost.bind(this);
  }
  /**
   * Returns express.Router() configured with routes/middleware.
   */
  initRoutes() {
    // Routes:
    this.router.get(this.loginRoute, wrapAsync(this.loginGet));
    this.router.post(this.loginRoute, this.handlers, wrapAsync(this.loginPost));
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
  async loginGet(req, res) {
    res.render("security/login", this.loginViewParams(req, []));
  }
  /**
   * POST security/login
   */
  async loginPost(req, res) {
    // Check validation errors
    const errors = validationResult(req);
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
          login: { msg: "Incorrect login" }
        })
      );
    }
    // Incorrect password
    const validPassword = await user.verifyPassword(req.body.password);
    if (!validPassword) {
      return res.render(
        "security/login",
        this.loginViewParams(req, {
          password: { msg: "Incorrect password" }
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
