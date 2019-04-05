exports.config = {
  tests: "./tests/acceptance/**/*.js",
  output: "./tests/_output/",
  helpers: {
    WebDriver: {
      host: "chrome",
      url: "http://nodetest:7070",
      keepCookies: true,
      browser: "chrome"
    }
  },
  plugins: {
    autoDelay: {
      enabled: true
    },
    screenshotOnFail: {
      enabled: true
    },
    stepByStepReport: {
      enabled: true,
      deleteSuccessful: false
    }
  },
  include: {},
  bootstrap: null,
  mocha: {},
  name: "node-boilerplate-app"
};
