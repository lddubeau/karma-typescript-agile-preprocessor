This is a fork of
[karma-typescript-preprocessor2](https://github.com/klaygomes/karma-typescript-preprocessor2). I
was having a number of problems with that plugin and decided to fork.

Why the "agile" in the name? The term "agile" is one of those terms that
marketing slaps all over the place without any good reason. I needed to
distinguish it from previous preprocessors and decided to slap "agile" in there
as a joke. It is nicer than incrementing ``2`` to ``3``, which would be
confusing anyway because it has nothing to do with actual version numbers.

This preprocessor passes most of the work to
[gulp-typescript](https://www.npmjs.com/package/gulp-typescript), a great plugin
for ``gulp``.

# How to install

Include a reference to this plugin in your ``package.json``, and use ``npm
install`` to install it.

# Configuration Options

Here is a full-featured example with all options that you can use to configure
the preprocessor:

```javascript
// karma.conf.js
module.exports = function(config) {
  config.set({
    files: [
      '**/*.ts'   // The preprocessor will convert Typescript to Javascript.
    ],
    preprocessors: {
      '**/*.ts': ['typescript', 'sourcemap']   // Use karma-sourcemap-loader.
    },
    typescriptPreprocessor: {
      // Options passed to the typescript compiler.
      tsconfigPath: './tsconfig.json', // Mandatory.
      compilerOptions: { // Optional.
        removeComments: false
      },
      // Options passed to gulp-sourcemaps to create sourcemaps.
      sourcemapOptions: {includeContent: true, sourceRoot: '/src'},
      // Ignore all files that end with .d.ts (these files will not be served).
      ignorePath: function(path){
       return /\.d\.ts$/.test(path);
      },
      // Optional path transformations. You may pass more than one. They will be
      // executed in order.
      transformPath: [function(path) {
        return path.replace(/\.ts$/, '.js');
      }, function(path) {
         // Remove directory test and change to /.
         return path.replace(/[\/\\]test[\/\\]/i, '/');
      }]
    }
  });
};
```

```javascript
//tsconfig.json
{
  "compilerOptions": {
    "noImplicitAny": false,
    "module": "amd",
    "noEmitOnError": false,
    "removeComments": true,
    "sourceMap": true,
    "listFiles": true,
    "experimentalDecorators": true,
    "outDir": "wwwroot",
    "target": "es5"
  },
  "exclude": [
    "node_modules",
    "wwwroot",
    "artifacts"
    ".git",
    ".vs"
  ]
}
```

We require a primary configuration from a ``tsconfig.json`` file. This solves a
lot of problems, as your compiler's configuration in ``karma`` will be
consistent with other tools you use that read the same ``tsconfig.json``, but
you can override (or add) options by using the ``compilerOptions`` property.

## Unsuported TypeScript configuration options

As we use ``gulp-typescript`` to transpile typescript code, we have the same
unsuported options as ``gulp-typescript``, so:

 - Sourcemap options (``sourceMap``, ``inlineSources``, ``sourceRoot``)
 - ``rootDir`` - Use the ``base`` option of ``gulp.src()`` instead.
 - ``watch`` - Use karma ``singleRun: false`` configuration instead.
 - ``project`` - See "Using tsconfig.json".
 - and the obvious ones: ``help``, ``version``

## Sourcemaps

Transpiling with ``gulp-typescript`` requires the use of ``gulp-sourcemaps`` to
create sourcemaps.

## Plugin Options

Here is the list of plugin options.

### transformPath:  (string) => string | ((string) => string)[]

Default value:
```
function(path){
 return path.replace(/\.ts$/, '.js');
}

```

It is used to change the virtual path of served files. It may sometimes be
necessary to change the virtual directory of a served file to allow tests,
example:

Let's suppose that you have the following folder hierarchy:

```
\basedir
 \wwwroot
  module
     file1.js
     file2.js
 \src
   module
     file1.ts
     file2.ts
 \test
   module
     file1.spec.ts
     file2.spec.ts
```

If ``file1.spec.ts`` and ``file2.spec.ts`` reference ``file1.ts`` and
``file2.ts``, and you are using typescript ``module`` option, you will need to
remove virtual directory ``test``, so all modules referenced by ``*.specs.ts``
will be solved successfully. To make it work, you need something like:

```
transformPath: [function(path) {
 // First change .ts to .js.
 return path.replace(/\.ts$/, '.js');
}, function(path) {
  // Then replace /test/ with /.
  return path.replace(/[\/\\]test[\/\\]/i, '/');
}]
```

### ignorePath: (string) => boolean

It could be used to ignore files that you don't want to serve. Keep in mind that
``ignorePath`` runs before ``transformPath``.

Default value:
```
function(path){
 return /\.d\.ts$//.test(path);
}

```

### sourcemapOptions: any

Specify ``gulp-sourcemaps``' write options. Inline sourcemaps are the easiest to
configure for testing. For more info [see gulp-sourcemaps' write
options](https://www.npmjs.com/package/gulp-sourcemaps).

### compilerOptions: any

You can provide or override any compiler options avaliable to
``gulp-typescript``, for more info
[see the gulp-typescript project](https://github.com/ivogabe/gulp-typescript#options).

# License

Licensed under the [MIT license](https://github.com/lddubea/karma-typescript-agile-preprocessor/blob/master/LICENSE).
