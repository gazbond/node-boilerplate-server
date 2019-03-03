exports.config = {
  tests: "./tests/acceptance/**/*.js",
  output: "./tests/_output/",
  helpers: {
    WebDriver: {
      host: "chrome",
      url: "http://node",
      keepCookies: true,
      browser: "chrome"
    },
    REST: {
      endpoint: "http://node/api",
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
      output: "./tests/_output/"
    },
    allure: {
      outputDir: "./tests/_output"
    }
  },
  include: {},
  bootstrap: null,
  mocha: {},
  name: "node-boilerplate-app"
};
