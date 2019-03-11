const express = require("express");
const { check, validationResult } = require("express-validator/check");

const jwt = require("jsonwebtoken");
const passport = require("../passport");
const User = require("../models/User");

module.exports = class SecurityController {
  constructor() {
    // Options:
    this.loginRoute = "/security/login";
    this.registerRoute = "/security/register";
    // Validation:
    this.loginValidation = [
      check("login").exists({
        checkNull: true,
        checkFalsy: true
      }),
      check("login").isAlphanumeric(),
      check("login").isLength({ min: 3, max: 25 }),
      check("password").exists({
        checkNull: true,
        checkFalsy: true
      }),
      check("password").isAlphanumeric(),
      check("password").isLength({ min: 4 })
    ];
    // To get 'this' in instance methods:
    this.initRoutes = this.initRoutes.bind(this);
    this.loginGet = this.loginGet.bind(this);
    this.loginPost = this.loginPost.bind(this);
    this.register = this.register.bind(this);
  }
  initRoutes(router) {
    const newRouter = express.Router();
    // Routes:
    newRouter.get(this.loginRoute, this.loginGet);
    newRouter.post(this.loginRoute, this.loginValidation, this.loginPost);
    newRouter.get(this.registerRoute, this.register);
    newRouter.post(this.registerRoute, this.register);
    router.use(newRouter);
  }
  // Util:
  renderParams(req, errors) {
    return {
      errors: errors,
      login: req.body.login ? req.body.login : "",
      password: req.body.password ? req.body.password : ""
    };
  }
  async loginGet(req, res) {
    return res.render("login", this.renderParams(req, []));
  }
  async loginPost(req, res) {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("login", this.renderParams(req, errors.array()));
    }
    // Try loading user
    // @ts-ignore
    const user = await User.query()
      .where({ username: req.body.login })
      .orWhere({ email: req.body.login })
      .first();
    // User not found
    if (!user) {
      return res.render(
        "login",
        this.renderParams(req, [{ param: "password", msg: "Incorrect login" }])
      );
    }
    // Incorrect password
    const validPassword = await user.verifyPassword(req.body.password);
    if (!validPassword) {
      return res.render(
        "login",
        this.renderParams(req, [
          { param: "password", msg: "Incorrect password" }
        ])
      );
    }
    // Generate token
    const payload = { id: user.id };
    const token = await jwt.sign(payload, passport.SECRET_OR_KEY, {
      expiresIn: passport.EXPIRES
    });
    // Send Authorization header
    res.header("Authorization", token);
    // Send Set-Cookie header
    res.cookie("Authorization", token, {
      httpOnly: true,
      sameSite: true
    });

    // Send Token
    return res.json({
      Authorization: token,
      issued_at: new Date().toISOString,
      expires_at: passport.EXPIRES
    });
  }
  async register(req, res) {
    return res.status(501).end();
  }
};
