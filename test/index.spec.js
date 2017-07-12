/* global describe, it, beforeEach,process */
var  should = require('should')
	, simple = require('simple-mock')
  , preprocessor = require('../index')['preprocessor:typescript'][1];

const noop = () => false;

//#region Mocks
/* Mocks */
var debug = simple.stub();
  simple.mock(debug, 'debug', noop);

var logger = simple.stub();
	simple.mock(logger, 'create').returnWith(debug);

var config = simple.stub();

var scope = {};
//#endregion Mocks

describe("factoryTypeScriptPreprocessor", function(){
	beforeEach(function(){
		simple.mock(config, 'tsconfigPath'		, './tsconfig.json');
		simple.mock(config, 'transformPath'		, noop);
		simple.mock(config, 'ignorePath'		, undefined);
		simple.mock(config, 'tsconfigOverrides'	, undefined);
		simple.mock(config, 'compilerOptions'	, undefined)
	});

	describe("factory", function(){

		beforeEach(function(){
			process.env.dontCompile = "true";
		})

		it("Should throw an exception if tsconfig.json was not defined", function(){

			simple.mock(config, 'tsconfigPath', undefined);

			(function(){
				preprocessor.call(scope, logger, config);
			}).should.throw("tsconfigPath was not defined");
		});

		it("Should throw an exception if transformPath is defined and was not a function", function(){

			simple.mock(config, 'transformPath', {});

			(function(){
				preprocessor.call(scope, logger, config);
			}).should.throw("transformPath must be an array or a function");
		});

		it("Should not throw an exception if transformPath is defined as a function", function(){

			simple.mock(config, 'transformPath', noop);

			(function(){
				preprocessor.call(scope, logger, config);
			}).should.not.throw("transformPath must be an array or a function");
		});

		it("Should not throw an exception if transformPath is defined as a array of function", function(){

			simple.mock(config, 'transformPath', [noop]);

			(function(){
				preprocessor.call(scope, logger, config);
			}).should.not.throw("transformPath must be an array or a function");
		});


		it("Should not throw an exception if ignorePath is not defined", function(){

			simple.mock(config, 'ignorePath', undefined);

			(function(){
				preprocessor.call(scope, logger, config);
			}).should.not.throw("ignorePath must be a function");
		});

		it("Should throw an exception if ignorePath is defined and is not a function", function(){

			simple.mock(config, 'ignorePath', {});

			(function(){
				preprocessor.call(scope, logger, config);
			}).should.throw("ignorePath must be a function");
		});

		it("Should not throw an exception if ignorePath is defined as a function", function(){

			simple.mock(config, 'ignorePath', noop);

			(function(){
				preprocessor.call(scope, logger, config);
			}).should.not.throw("ignorePath must be a function");
		});

		it("Should throw an exception if compilerOptions is not defined as object.", function(){

		simple.mock(config, 'compilerOptions'	, 1/*a number */);
			(function asNumber(){
				preprocessor.call(scope, logger, config);
			}).should.throw("compilerOptions if defined, should be an object.");

		simple.mock(config, 'compilerOptions'	, 'string'/*a string */);
			(function asString(){
				preprocessor.call(scope, logger, config);
			}).should.throw("compilerOptions if defined, should be an object.");

		simple.mock(config, 'compilerOptions'	, new Date/*a date */);
			(function asDate(){
				preprocessor.call(scope, logger, config);
			}).should.throw("compilerOptions if defined, should be an object.");

		simple.mock(config, 'compilerOptions'	, /regex/i/*a regex */);
			(function asRegex(){
				preprocessor.call(scope, logger, config);
			}).should.throw("compilerOptions if defined, should be an object.");

		});

	});
});
