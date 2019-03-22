exports.config = {
  tests: "./tests/acceptance/**/*.js",
  output: "./tests/_output/",
  helpers: {
    WebDriver: {
      host: "chrome",
      url: "http://node:8080",
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
      deleteSuccessful: false,
      fullPageScreenshots: true
    }
  },
  include: {},
  bootstrap: null,
  mocha: {},
  name: "node-boilerplate-app"
};
