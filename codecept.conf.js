exports.config = {
  tests: "./tests/acceptance/**/*.js",
  output: "./tests/_output/",
  helpers: {
    WebDriver: {
      host: "chrome",
      url: "http://node:8080",
      keepCookies: true,
      browser: "chrome"
    },
    REST: {
      endpoint: "http://node:8080/api",
      defaultHeaders: []
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
      fullPageScreenshots: true,
      output: "./tests/_output/"
    }
  },
  include: {},
  bootstrap: null,
  mocha: {},
  name: "node-boilerplate-app"
};
