exports.config = {
  tests: "./tests/acceptance/**/*.js",
  output: "./tests/_output/",
  helpers: {
    WebDriver: {
      url: "http://localhost",
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
