/* global process*/
"use strict";
const path = require("path");
const ts = require("gulp-typescript");
const sourcemaps = require("gulp-sourcemaps");
const Writable = require("stream").Writable;

const dontCompile = process.env.dontCompile === "true";
const sep = path.sep;

module.exports = (function register() {
  const state = {
    idle: 0,
    compiling: 1,
    compilationCompleted: 2,
  };

  let _currentState = state.idle;

  function factoryTypeScriptPreprocessor(logger, helper, config, basePath) {
    const _ = helper._;

    if (toString.call(config.tsconfigPath) !== "[object String]") {
      throw new Error("tsconfigPath was not defined");
    }

    const compilerOptions =
          (config.compilerOptions || config.tsconfigOverrides) || {};

    if (!_.isObject(compilerOptions) || _.isDate(compilerOptions) ||
        _.isRegExp(compilerOptions)) {
      throw new Error("compilerOptions if defined, should be an object.");
    }

    const defaultCompilerOptions = {
      outDir: undefined,
    };

    _.extend(compilerOptions, defaultCompilerOptions);


    config.transformPath = config.transformPath ||
      [filepath => filepath.replace(/\.ts$/i, ".js")];

    if (_.isFunction(config.transformPath)) {
      config.transformPath = [config.transformPath];
    }
    else if (!_.isArray(config.transformPath)) {
      throw new Error("transformPath must be an array or a function");
    }

    config.ignorePath = (config.ignorePath || _.noop);

    if (!_.isFunction(config.ignorePath)) {
      throw new Error("ignorePath must be a function");
    }

    const log = logger.create("preprocessor:typescript");

    function dummyFile(message) {
      return `/* preprocessor:typescript --> ${message} */`;
    }

    // Called to normalize file paths
    function _normalize(filePath) {
      return filePath.replace(/[/|\\]/g, sep);
    }

    const serveQueue = [];
    function enqueueForServing(file, done) {
      serveQueue.push({ file, done });
    }

    function transformPath(filepath) {
      return _.reduce(config.transformPath,
                      (memo, clb) =>
                      // I simple ignore clb that was not function
                      (_.isFunction(clb) ? clb.call(config, memo) : memo),
                      filepath);
    }

    let compilationResults = Object.create(null);
    // Used to fetch files from buffer.
    function _serveFile(requestedFile, done) {
      requestedFile.path = transformPath(requestedFile.path);

      log.debug(`Fetching ${requestedFile.path} from buffer`);

      // We get a requestedFile with an sha when Karma is watching files on
      // disk, and the file requested changed. When this happens, we need to
      // recompile the whole lot.
      if (requestedFile.sha) {
        delete requestedFile.sha; // Hack used to prevent infinite loop.
        enqueueForServing(requestedFile, done);
        // eslint-disable-next-line no-use-before-define
        compile();
        return;
      }

      const normalized = _normalize(requestedFile.path);
      const compiled = compilationResults[normalized];
      if (compiled) {
        delete compilationResults[normalized];
        done(null, compiled.contents.toString());
        return;
      }

      // If the file was not found in the stream, then maybe it is not compiled
      // or it is a definition file.
      log.debug(`${requestedFile.originalPath} was not found. Maybe it was \
not compiled or it is a definition file.`);
      done(null, dummyFile("This file was not compiled"));
    }

    // Responsible for flushing the cache and notifying karma.
    function processServeQueue() {
      while (serveQueue.length) {
        const item = serveQueue.shift();
        _serveFile(item.file, item.done);
        // It is possible start compiling while in release.
        if (state.compilationCompleted !== _currentState) {
          break;
        }
      }
    }

    const tsconfigPath = path.resolve(basePath, config.tsconfigPath);
    const tsProject = ts.createProject(tsconfigPath, compilerOptions);
    function compile() {
      if (dontCompile) return;

      log.debug("Compiling ts files...");

      _currentState = state.compiling;
      compilationResults = Object.create(null);

      const output = new Writable({ objectMode: true });
      const tsResult = tsProject.src()
            .pipe(sourcemaps.init())
            .pipe(tsProject());

      // Save compiled files to memory.
      output._write = (chunk, enc, next) => {
        compilationResults[_normalize(chunk.path)] = chunk;
        next();
      };

      tsResult.js
        .pipe(sourcemaps.write(config.sourcemapOptions || {}))
        .pipe(output);

      tsResult.js.on("end", () => {
        log.debug("Compilation completed!");
        _currentState = state.compilationCompleted;
        processServeQueue();
      });
    }

    // Start a first compilation right away.
    compile();

    return function createTypeScriptPreprocessor(content, file, done) {
      // Ignoring files
      if (config.ignorePath(file.path)) {
        log.debug(`${file.path} was skipped`);
        done(null, dummyFile("This file was skipped"));
        return;
      }

      switch (_currentState) {
      case state.idle:
      case state.compiling:
        log.debug(`${file.originalPath} was buffered`);
        enqueueForServing(file, done);
        break;
      case state.compilationCompleted:
        log.debug(`Fetching ${file.originalPath}`);
        _serveFile(file, done);
        break;
      default:
        throw new Error("unexpected state");
      }
    };
  }

  factoryTypeScriptPreprocessor.$inject =
    ["logger", "helper", "config.typescriptPreprocessor", "config.basePath"];

  return {
    "preprocessor:typescript": ["factory", factoryTypeScriptPreprocessor],
  };
}());
