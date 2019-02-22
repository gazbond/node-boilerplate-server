exports.config = {
  tests: "./tests/acceptance",
  output: "./tests/output",
  helpers: {
    WebDriver: {
      url: "http://localhost",
      browser: "chrome"
    }
  },
  plugins: {
    screenshotOnFail: {
      enabled: true
    },
    stepByStepReport: {
      enabled: true
    },
    allure: {
      outputDir: "./tests/output"
    }
  },
  include: {},
  bootstrap: null,
  mocha: {},
  name: "node-boilerplate-app"
};
