const passport = require("passport");
const passportJwt = require("passport-jwt");
const JwtStrategy = passportJwt.Strategy;
const ExtractJwt = passportJwt.ExtractJwt;

const User = require("./models/User");
const SECRET_OR_KEY = "md6a-gbs89le72ha8we7js-zo-awns67uw";
const EXPIRES = "2 days";

const strategy = new JwtStrategy(
  {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: SECRET_OR_KEY
  },
  async (payload, next) => {
    // @ts-ignore
    const user = await User.query().findById(payload.id);
    if (!user) {
      return next(null, false);
    }
    return next(null, user);
  }
);
passport.use(strategy);

const initialize = passport.initialize();
const authenticate = passport.authenticate("jwt", { session: false });

module.exports = {
  SECRET_OR_KEY: SECRET_OR_KEY,
  EXPIRES: EXPIRES,
  initialize: initialize,
  authenticate: authenticate
};