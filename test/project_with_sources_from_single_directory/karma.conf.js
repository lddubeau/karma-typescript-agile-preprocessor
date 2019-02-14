/* eslint-env node */

"use strict";

const tsPlugin = require("../../index");

module.exports = (config) => {
  const options = {
    basePath: "",
    frameworks: ["mocha"],
    files: [
      "src/*.js",
      "test/test1.ts",
    ],
    plugins: [
      "karma-*",
      tsPlugin,
    ],
    preprocessors: {
      "test/*.ts": ["typescript"],
    },
    typescriptPreprocessor: {
      tsconfigPath: "./test/tsconfig.json",
      compilerOptions: {
        // eslint-disable-next-line global-require, import/no-extraneous-dependencies
        typescript: require("typescript"),
        sourceMap: false,
        // We have to have them inline for the browser to find them.
        inlineSourceMap: true,
        inlineSources: true,
        module: "none",
      },
    },
    reporters: ["dots"],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    browsers: ["ChromeHeadless"],
  };

  config.set(options);
};
