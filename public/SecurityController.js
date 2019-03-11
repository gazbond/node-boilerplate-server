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
    // To get 'this' in instance methods:
    this.initRoute = this.initRoute.bind(this);
    this.actionLogin = this.actionLogin.bind(this);
    this.actionRegister = this.actionRegister.bind(this);
  }
  async initRoute(router) {
    const newRouter = express.Router();
    // Routes:
    newRouter.get(this.loginRoute, this.actionLogin);
    newRouter.post(this.loginRoute, this.actionLogin);
    newRouter.get(this.registerRoute, this.actionRegister);
    newRouter.post(this.registerRoute, this.actionRegister);
    router.use(newRouter);
  }
  async actionLogin(req, res) {
    // Check req params
    if (!req.body.login || !req.body.password) {
      return res.status(400).send("Required field(s) missing");
    }
    check("login").isAlphanumeric();
    check("login").isLength({ min: 3, max: 25 });
    check("password").isAlphanumeric();
    check("password").isLength({ min: 4 });
    // Send validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // Try loading user
    // @ts-ignore
    const user = await User.query()
      .where({ username: req.body.login })
      .orWhere({ email: req.body.login })
      .first();
    // User not found
    if (!user) {
      return res.status(401).send("Incorrect login");
    }
    // Incorrect password
    const validPassword = await user.verifyPassword(req.body.password);
    if (!validPassword) {
      return res.status(401).send("Incorrect password");
    }
    // Generate token
    const payload = { id: user.id };
    const token = await jwt.sign(payload, passport.SECRET_OR_KEY, {
      expiresIn: passport.EXPIRES
    });
    // Send Token
    res.send(token);
  }
  async actionRegister(req, res) {
    return res.status(501).end();
  }
};
