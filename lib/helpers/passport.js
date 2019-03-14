const passport = require("passport");
const passportJwt = require("passport-jwt");
const JwtStrategy = passportJwt.Strategy;
const ExtractJwt = passportJwt.ExtractJwt;

const User = require("../../models/User");
const { secretOrKey, expiresIn } = require("../../app.conf").jwt;

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
passport.initialize();

const auth = passport.authenticate("jwt", {
  session: false
});

module.exports = {
  jwt: {
    secretOrKey: secretOrKey,
    expiresIn: expiresIn,
    auth: auth
  }
};
