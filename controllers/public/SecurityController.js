const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const csrf = require("csurf");
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
 * Security controller handles login, confirm email and recover password.
 */
module.exports = class SecurityController extends BassController {
  /**
   * Configuration.
   */
  constructor() {
    super();
    // Paths:
    this.paths.login = "/security/login";
    this.paths.confirm = "/security/confirm/:id/:code";
    this.paths.resend = "/security/resend";
    this.paths.recover = "/security/recover";
    this.paths.password = "/security/password/:id/:code";
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
        .isLength({ min: 4 }),
      check("redirectUrl", "Param 'redirectUrl' should be a url.")
        .optional()
        .isLength({ min: 1 })
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
        .isLength({ min: 3 })
    ];
    this.validators.recover = [
      check("email", "Invalid email address.")
        .exists({
          checkNull: true,
          checkFalsy: true
        })
        .isEmail()
        .isLength({ min: 3 })
    ];
    this.validators.password = [
      check("password", "Invalid Password, should be alpha-numeric.")
        .exists({
          checkNull: true,
          checkFalsy: true
        })
        .isAlphanumeric()
        .isLength({ min: 4 }),
      check(
        "confirm_password",
        "Invalid confirm password, should be alpha-numeric."
      )
        .exists({
          checkNull: true,
          checkFalsy: true
        })
        .isAlphanumeric()
        .isLength({ min: 4 }),
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
    // CORS:
    this.cors = {
      methods: ["GET", "POST"],
      allowedHeaders: ["Content-Type"],
      exposedHeaders: ["Authorization"]
    };
    // CSRF:
    this.csrf = [csrf({ cookie: true })];
    // To get 'this' in instance methods:
    bindMethods(this, [
      "actionLoginGet",
      "actionLoginPost",
      "actionConfirmGet",
      "actionResendGet",
      "actionResendPost",
      "actionRecoverGet",
      "actionRecoverPost",
      "actionPasswordGet",
      "actionPasswordPost"
    ]);
  }
  /**
   * Returns express.Router() configured with paths/middleware.
   */
  initRouter() {
    this.router.use(cookieParser());
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
    this.router.get(
      this.paths.resend,
      this.csrf,
      wrapAsync(this.actionResendGet)
    );
    this.router.post(
      this.paths.resend,
      this.validators.resend.concat(this.csrf),
      wrapAsync(this.actionResendPost)
    );
    this.router.get(
      this.paths.recover,
      this.csrf,
      wrapAsync(this.actionRecoverGet)
    );
    this.router.post(
      this.paths.recover,
      this.validators.recover.concat(this.csrf),
      wrapAsync(this.actionRecoverPost)
    );
    this.router.get(
      this.paths.password,
      this.csrf,
      wrapAsync(this.actionPasswordGet)
    );
    this.router.post(
      this.paths.password,
      this.validators.password.concat(this.csrf),
      wrapAsync(this.actionPasswordPost)
    );
    return this.router;
  }
  /**
   * Utils: construct params passed to:
   * views/security/login.ejs
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
    // Content type
    let isJsonContentType = false;
    if (req.headers["content-type"] === "application/json") {
      isJsonContentType = true;
    }
    // Check validation errors
    const errors = validationErrors(req);
    if (!errors.isEmpty()) {
      // mapped() means field name as object property. Specify fields[] in partials/errors.ejs
      if (isJsonContentType) {
        // 400 Bad Request
        return res.status(400).send({
          errors: errors.mapped()
        });
      } else {
        return res.render(
          "security/login",
          this.loginViewParams(req, errors.mapped())
        );
      }
    }
    // Try loading user
    const login = getField(req, "login");
    const user = await User.query()
      .where({ username: login })
      .orWhere({ email: login })
      .first();
    // User not found
    if (!user) {
      if (isJsonContentType) {
        // 404 Not Found
        return res.status(404).send({
          errors: { login: { message: "Incorrect login." } }
        });
      } else {
        return res.render(
          "security/login",
          this.loginViewParams(req, {
            login: { message: "Incorrect login." }
          })
        );
      }
    }
    // Incorrect password
    const password = getField(req, "password");
    const validPassword = await user.verifyPassword(password);
    if (!validPassword) {
      if (isJsonContentType) {
        // 404 Not Found
        return res.status(404).send({
          errors: { password: { message: "Incorrect password." } }
        });
      } else {
        return res.render(
          "security/login",
          this.loginViewParams(req, {
            password: { message: "Incorrect password." }
          })
        );
      }
    }
    // Requires confirmation
    if (emailConfirmation && !user.confirmed_at) {
      if (isJsonContentType) {
        // 400 Bad Request
        return res.status(400).send({
          errors: { login: { message: "Email confirmation required." } }
        });
      } else {
        return res.render(
          "security/login",
          this.loginViewParams(req, {
            login: { message: "Email confirmation required." }
          })
        );
      }
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
        if (isJsonContentType) {
          // 200 OK
          return res.status(200).send({
            Authorization: token
          });
        }
        // Redirect
        const redirectUrl = getParam(req, "redirectUrl", "/");
        return res.redirect(redirectUrl);
      }
    );
  }
  /**
   * Load token (used by confirm/password actions)
   */
  async loadToken(req, type) {
    const id = getParam(req, "id");
    const code = getParam(req, "code");
    const token = await Token.query()
      .where({
        user_id: id,
        type: type,
        code: code
      })
      .first();
    return token;
  }
  /**
   * Parse token (used by confirm/password actions)
   *
   * @param {Token} token
   */
  async parseToken(token) {
    /**
     * @property {User} user
     */
    const user = await token.$relatedQuery("user");
    const username = user.username;
    const notExpired = !token.expired();
    return {
      user,
      username,
      notExpired
    };
  }
  /**
   * Delete token (used by confirm/password actions)
   *
   * @param {Token} token
   */
  async deleteToken(token) {
    await Token.query().deleteById([token.type, token.user_id, token.code]);
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
   * GET security/confirm/:id/:code
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
    // Load token
    const token = await this.loadToken(req, Token.TYPE_CONFIRMATION);
    // Not found
    if (!token) {
      return res.render(
        "security/error",
        this.confirmViewParams("Confirmation Failed", "Token Not Found")
      );
    }
    // Parse token
    const { user, username, notExpired } = await this.parseToken(token);
    // Token not expired
    let view = "security/success";
    let title = "Email Confirmed";
    let message = "Thank you " + username + ", your email has been confirmed";
    if (notExpired) {
      // Confirmed at timestamp
      await user.$query().patch({
        confirmed_at: new Date().toISOString()
      });
    }
    // Token expired
    else {
      view = "security/error";
      title = "Confirmation Failed";
      message = " Token has expired";
    }
    await this.deleteToken(token);
    // Render
    res.render(view, this.confirmViewParams(title, message));
  }
  /**
   * Utils: construct params passed to:
   * views/security/password.ejs
   * views/security/error.ejs
   * views/security/success.ejs
   */
  passwordViewParams(req, title, message, errors = {}) {
    return {
      csrf: req.csrfToken(),
      errors: errors,
      fields: ["password", "confirm_password"],
      title: title,
      message: message,
      password: getField(req, "password"),
      confirm_password: getField(req, "confirm_password")
    };
  }
  /**
   * GET security/password/:id/:code
   */
  async actionPasswordGet(req, res) {
    res.render("security/password", this.passwordViewParams(req, {}));
  }
  /**
   * POST security/password/:id/:code
   */
  async actionPasswordPost(req, res) {
    // Check validation errors
    const errors = validationErrors(req);
    if (!errors.isEmpty()) {
      return res.render(
        "security/password",
        this.passwordViewParams(req, "404", "Bad Request", errors.mapped())
      );
    }
    // Check confirm password matches password
    const password = getField(req, "password");
    const confirm_password = getField(req, "confirm_password");
    if (confirm_password !== password) {
      return res.render(
        "security/password",
        this.passwordViewParams(req, "404", "Bad Request", {
          confirm_password: {
            message: "Confirm password doesn't match password."
          }
        })
      );
    }
    // Load token
    const token = await this.loadToken(req, Token.TYPE_RECOVERY);
    // Not found
    if (!token) {
      return res.render(
        "security/error",
        this.passwordViewParams(
          req,
          "Change password Failed",
          "Token Not Found"
        )
      );
    }
    // Parse token
    const { username, user, notExpired } = await this.parseToken(token);
    // Token not expired
    let view = "security/success";
    let title = "Password Changed";
    let message = "Thank you " + username + ", your password has been changed";
    if (notExpired) {
      // Change password
      await user.$query().patch({
        password: getField(req, "password")
      });
    }
    // Token expired
    else {
      view = "security/error";
      title = "Change Password Failed";
      message = " Token has expired";
    }
    await this.deleteToken(token);
    // Render
    res.render(view, this.passwordViewParams(req, title, message));
  }
  /**
   * Utils: construct params passed to:
   * views/security/resend.ejs
   * views/security/success.ejs
   */
  resendViewParams(req, errors = {}) {
    return {
      csrf: req.csrfToken(),
      errors: errors,
      fields: ["email"],
      email: getField(req, "email")
    };
  }
  /**
   * GET security/resend
   */
  async actionResendGet(req, res) {
    res.render("security/resend", this.resendViewParams(req, {}));
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
    await user.sendConfirmationEmail();
    // Render
    res.render("security/success", {
      title: "Email Sent",
      message: "A confirmation email has been sent to " + email
    });
  }
  /**
   * Utils: construct params passed to:
   * views/security/recover.ejs
   * views/security/success.ejs
   */
  recoverViewParams(req, errors = {}) {
    return {
      csrf: req.csrfToken(),
      errors: errors,
      fields: ["email"],
      email: getField(req, "email")
    };
  }
  /**
   * GET security/recover
   */
  async actionRecoverGet(req, res) {
    res.render("security/recover", this.recoverViewParams(req, {}));
  }
  /**
   * POST security/recover
   */
  async actionRecoverPost(req, res) {
    // Check validation errors
    const errors = validationErrors(req);
    if (!errors.isEmpty()) {
      return res.render(
        "security/recover",
        this.recoverViewParams(req, errors.mapped())
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
        "security/recover",
        this.resendViewParams(req, {
          email: { message: "Email not found." }
        })
      );
    }
    // Send recovery
    await user.sendRecoveryEmail();
    // Render
    res.render("security/success", {
      title: "Email Sent",
      message: "A recovery email has been sent to " + email
    });
  }
};
