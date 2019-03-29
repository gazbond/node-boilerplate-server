const bodyParser = require("body-parser");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { buildCheckFunction } = require("express-validator/check");
const check = buildCheckFunction(["params", "body", "query"]);
const BassController = require("../../library/BaseController");

const {
  models: {
    user: { emailConfirmation }
  }
} = require("../../config");
const User = require("../../models/User");
const Token = require("../../models/Token");
const passport = require("../../library/helpers/passport");
const {
  validationErrors,
  bindMethods,
  wrapAsync,
  getParam,
  getField
} = require("../../library/helpers/utils");

/**
 * Security controller handles login, confirm email and change password.
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
    this.paths.confirm = "/security/confirm/:id";
    this.paths.resend = "/security/resend";
    // Validations:
    this.validators.login = [
      check("login", "Invalid Login, should be alpha-numeric.")
        .exists({
          checkNull: true,
          checkFalsy: true
        })
        .isAlphanumeric()
        .isLength({ min: 3 }),
      check("password", "Invalid Password, should be alpha-numeric.")
        .exists({
          checkNull: true,
          checkFalsy: true
        })
        .isAlphanumeric()
        .isLength({ min: 4 })
    ];
    this.validators.confirm = [
      check("id", "Param 'id' should be an integer.")
        .exists({
          checkNull: true,
          checkFalsy: true
        })
        .isInt(),
      check("code", "Param 'code' should be a string and 32 characters long.")
        .exists({
          checkNull: true,
          checkFalsy: true
        })
        .isString()
        .isLength({ min: 32, max: 32 })
    ];
    this.validators.resend = [
      check("email", "Invalid email address.")
        .exists({
          checkNull: true,
          checkFalsy: true
        })
        .isEmail()
    ];
    // Cores:
    this.cors = {
      methods: ["GET", "POST"],
      allowedHeaders: ["Content-Type"],
      exposedHeaders: ["Authorization"]
    };
    // To get 'this' in instance methods:
    bindMethods(this, [
      "actionLoginGet",
      "actionLoginPost",
      "actionConfirmGet",
      "actionResendGet",
      "actionResendPost"
    ]);
  }
  /**
   * Returns express.Router() configured with paths/middleware.
   */
  initRouter() {
    this.router.use(this.paths.login, cors(this.cors));
    this.router.use(
      this.paths.login,
      // Content-Type: application/json
      bodyParser.json()
    );
    this.router.get(this.paths.login, wrapAsync(this.actionLoginGet));
    this.router.post(
      this.paths.login,
      this.validators.login,
      wrapAsync(this.actionLoginPost)
    );
    this.router.get(
      this.paths.confirm,
      this.validators.confirm,
      wrapAsync(this.actionConfirmGet)
    );
    this.router.get(this.paths.resend, wrapAsync(this.actionResendGet));
    this.router.post(
      this.paths.resend,
      this.validators.resend,
      wrapAsync(this.actionResendPost)
    );
    return this.router;
  }
  /**
   * Utils: construct params passed to views/security/login.ejs
   */
  loginViewParams(req, errors) {
    return {
      errors: errors,
      fields: ["login", "password"],
      login: getField(req, "login"),
      password: getField(req, "password")
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
    const login = getField(req, "login");
    const user = await User.query()
      .where({ username: login })
      .orWhere({ email: login })
      .first();
    // User not found
    if (!user) {
      return res.render(
        "security/login",
        this.loginViewParams(req, {
          login: { message: "Incorrect login." }
        })
      );
    }
    // Requires confirmation
    if (emailConfirmation && !user.confirmed_at) {
      return res.render(
        "security/login",
        this.loginViewParams(req, {
          login: { message: "Email confirmation required." }
        })
      );
    }
    // Incorrect password
    const password = getField(req, "password");
    const validPassword = await user.verifyPassword(password);
    if (!validPassword) {
      return res.render(
        "security/login",
        this.loginViewParams(req, {
          password: { message: "Incorrect password." }
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
  /**
   * Utils: construct params passed to:
   * views/security/error.ejs
   * views/security/success.ejs
   */
  confirmViewParams(title, message, errors = {}) {
    return {
      title: title,
      message: message,
      errors: errors,
      fields: ["id", "code"]
    };
  }
  /**
   * GET security/confirm/:id?code=
   */
  async actionConfirmGet(req, res) {
    // Check validation errors
    const errors = validationErrors(req);
    if (!errors.isEmpty()) {
      return res.render(
        "security/error",
        this.confirmViewParams("404", "Bad Request", errors.mapped())
      );
    }
    // Load token(s)
    const id = getParam(req, "id");
    const code = getParam(req, "code");
    const tokens = await Token.query().where({
      user_id: id,
      type: Token.TYPE_CONFIRMATION,
      code: code
    });
    // Not found
    if (!tokens || tokens.length === 0) {
      return res.render(
        "security/error",
        this.confirmViewParams("Confirmation Failed", "Token Not Found")
      );
    }
    // Parse token(s)
    let user;
    let username;
    let notExpired = true;
    let deletes = [];
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      if (!user) {
        user = await token.$relatedQuery("user");
        username = user.username;
      }
      if (token.expired()) {
        notExpired = false;
      }
      deletes.push([token.type, token.user_id, token.code]);
    }
    // Token(s) not expired
    let view = "security/success";
    let title = "Email Confirmed";
    let message = "Thank you " + username + ", your email has been confirmed";
    if (notExpired) {
      // Confirmed at timestamp
      await user.$query().patch({
        confirmed_at: new Date().toISOString()
      });
    }
    // Token(s) expired
    else {
      view = "security/error";
      title = "Confirmation Failed";
      message = " Token has expired";
    }
    // Delete token(s)
    if (deletes) {
      await Token.query()
        .delete()
        .whereInComposite(["type", "user_id", "code"], deletes);
    }
    // Render
    res.render(view, this.confirmViewParams(title, message));
  }
  /**
   * Utils: construct params passed to views/resend.ejs
   */
  resendViewParams(req, errors = {}) {
    return {
      errors: errors,
      fields: ["email"],
      email: getField(req, "email")
    };
  }
  /**
   * GET security/resend
   */
  async actionResendGet(req, res) {
    res.render("security/resend", this.resendViewParams(req));
  }
  /**
   * POST security/resend
   */
  async actionResendPost(req, res) {
    // Check validation errors
    const errors = validationErrors(req);
    if (!errors.isEmpty()) {
      return res.render(
        "security/resend",
        this.resendViewParams(req, errors.mapped())
      );
    }
    // Try loading user
    const email = getField(req, "email");
    const user = await User.query()
      .where({ email: email })
      .first();
    // User not found
    if (!user) {
      return res.render(
        "security/resend",
        this.resendViewParams(req, {
          email: { message: "Email not found." }
        })
      );
    }
    // Send confirmation
    await user.sendEmailConfirmation();
    // Render
    res.render("security/success", {
      title: "Email Sent",
      message: "A confirmation email has been sent to " + email
    });
  }
};
