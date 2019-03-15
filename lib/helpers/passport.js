const passport = require("passport");
const passportJwt = require("passport-jwt");
const JwtStrategy = passportJwt.Strategy;
const ExtractJwt = passportJwt.ExtractJwt;

const User = require("../../models/User");
const { secretOrKey, expiresIn } = require("../../app.conf").jwt;

/**
 * Extract token from Authorization/Bearer header.
 * Then eager load User model with roles/permissions.
 */
const strategy = new JwtStrategy(
  {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: secretOrKey
  },
  async (payload, done) => {
    // Try loading User
    try {
      // @ts-ignore
      const user = await User.query()
        .eager("roles.permissions")
        .findById(payload.id);
      // Not found
      if (!user) return done(null, false);
      // Found
      return done(null, user);
    } catch (err) {
      // Catch error
      return done(err, false);
    }
  }
);
passport.use(strategy);

const init = passport.initialize();
const auth = passport.authenticate("jwt", {
  session: false,
  failWithError: true
});

module.exports = {
  init: init,
  auth: auth,
  jwt: {
    secretOrKey: secretOrKey,
    expiresIn: expiresIn
  }
};
