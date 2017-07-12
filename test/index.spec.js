/* global describe, it, beforeEach,process */
"use strict";

/* eslint-disable import/no-extraneous-dependencies */
require("should");
const simple = require("simple-mock");
const preprocessor = require("../index")["preprocessor:typescript"][1];

const noop = () => false;

const debug = simple.stub();
simple.mock(debug, "debug", noop);

const logger = simple.stub();
simple.mock(logger, "create").returnWith(debug);

const config = simple.stub();

const scope = {};

describe("factoryTypeScriptPreprocessor", () => {
  beforeEach(() => {
    simple.mock(config, "tsconfigPath", "./tsconfig.json");
    simple.mock(config, "transformPath", noop);
    simple.mock(config, "ignorePath", undefined);
    simple.mock(config, "tsconfigOverrides", undefined);
    simple.mock(config, "compilerOptions", undefined);
  });

  describe("factory", () => {
    beforeEach(() => {
      process.env.dontCompile = "true";
    });

    it("Should throw an exception if tsconfig.json was not defined", () => {
      simple.mock(config, "tsconfigPath", undefined);
      preprocessor.bind(scope, logger, config)
        .should.throw("tsconfigPath was not defined");
    });

    it("Should throw an exception if transformPath is defined and was not a function", () => {
      simple.mock(config, "transformPath", {});
      preprocessor.bind(scope, logger, config)
        .should.throw("transformPath must be an array or a function");
    });

    it("Should not throw an exception if transformPath is defined as a function", () => {
      simple.mock(config, "transformPath", noop);
      preprocessor.bind(scope, logger, config)
        .should.not.throw("transformPath must be an array or a function");
    });

    it("Should not throw an exception if transformPath is defined as a array of function", () => {
      simple.mock(config, "transformPath", [noop]);
      preprocessor.bind(scope, logger, config)
        .should.not.throw("transformPath must be an array or a function");
    });


    it("Should not throw an exception if ignorePath is not defined", () => {
      simple.mock(config, "ignorePath", undefined);
      preprocessor.bind(scope, logger, config)
        .should.not.throw("ignorePath must be a function");
    });

    it("Should throw an exception if ignorePath is defined and is not a function", () => {
      simple.mock(config, "ignorePath", {});
      preprocessor.bind(scope, logger, config)
        .should.throw("ignorePath must be a function");
    });

    it("Should not throw an exception if ignorePath is defined as a function", () => {
      simple.mock(config, "ignorePath", noop);
      preprocessor.bind(scope, logger, config)
        .should.not.throw("ignorePath must be a function");
    });

    it("Should throw an exception if compilerOptions is not defined as object.", () => {
      simple.mock(config, "compilerOptions", 1);
      preprocessor.bind(scope, logger, config)
        .should.throw("compilerOptions if defined, should be an object.");

      simple.mock(config, "compilerOptions", "string");
      preprocessor.bind(scope, logger, config)
        .should.throw("compilerOptions if defined, should be an object.");

      simple.mock(config, "compilerOptions", new Date());
      preprocessor.bind(scope, logger, config)
        .should.throw("compilerOptions if defined, should be an object.");

      simple.mock(config, "compilerOptions", /regex/i);
      preprocessor.bind(scope, logger, config)
        .should.throw("compilerOptions if defined, should be an object.");
    });
  });
});
