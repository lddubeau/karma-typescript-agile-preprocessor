/* global describe, it, beforeEach, process */

"use strict";

const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

/* eslint-disable import/no-extraneous-dependencies */
const chai = require("chai");
const preprocessor = require("../index")["preprocessor:typescript"][1];

const { expect } = chai;
const noop = () => false;

const logger = {
  create: () => ({ debug: noop }),
};

const scope = {};

process.env.dontCompile = "true";

describe("factoryTypeScriptPreprocessor", () => {
  let config;

  beforeEach(() => {
    config = {
      tsconfigPath: "./tsconfig.json",
      transformPath: noop,
    };
  });

  it("throws if tsconfig.json is undefined", () => {
    config.tsconfigPath = undefined;
    expect(preprocessor.bind(scope, logger, config))
      .to.throw("tsconfigPath is undefined");
  });

  it("throws if transformPath is defined and was not a function", () => {
    config.transformPath = {};
    expect(preprocessor.bind(scope, logger, config))
      .to.throw("transformPath must be an array or a function");
  });

  it("does not throw if transformPath is a function", () => {
    config.transformPath = noop;
    expect(preprocessor.bind(scope, logger, config))
      .to.not.throw("transformPath must be an array or a function");
  });

  it("throws if transformPath is an array of function", () => {
    config.transformPath = [noop];
    expect(preprocessor.bind(scope, logger, config))
      .to.not.throw("transformPath must be an array or a function");
  });

  it("does not throw if ignorePath is undefined", () => {
    config.ignorePath = undefined;
    expect(preprocessor.bind(scope, logger, config))
      .to.not.throw("ignorePath must be a function");
  });

  it("throws if ignorePath is defined and is not a function", () => {
    config.ignorePath = {};
    expect(preprocessor.bind(scope, logger, config))
      .to.throw("ignorePath must be a function");
  });

  it("does not throw an exception if ignorePath is a function", () => {
    config.ignorePath = noop;
    expect(preprocessor.bind(scope, logger, config))
      .to.not.throw("ignorePath must be a function");
  });

  it("throws if compilerOptions is not defined as object.", () => {
    config.compilerOptions = 1;
    expect(preprocessor.bind(scope, logger, config))
      .to.throw("compilerOptions if defined, should be an object.");

    config.compilerOptions = "string";
    expect(preprocessor.bind(scope, logger, config))
      .to.throw("compilerOptions if defined, should be an object.");

    config.compilerOptions = new Date();
    expect(preprocessor.bind(scope, logger, config))
      .to.throw("compilerOptions if defined, should be an object.");

    config.compilerOptions = /moo/i;
    expect(preprocessor.bind(scope, logger, config))
      .to.throw("compilerOptions if defined, should be an object.");
  });
});

describe("integration", function integration() {
  this.timeout(10000);

  const tests = fs.readdirSync(__dirname)
        .filter(file => /^project_/.test(file));

  for (const test of tests) {
    it(test, (done) => {
      exec("../../node_modules/.bin/karma start --single-run", {
        cwd: path.join(__dirname, test),
        env: { PATH: process.env.PATH },
      }, (err, stdout, stderr) => {
        if (err) {
          // eslint-disable-next-line no-console
          console.log(stdout);
          // eslint-disable-next-line no-console
          console.log(stderr);
          done(err);
          return;
        }

        done();
      });
    });
  }
});
