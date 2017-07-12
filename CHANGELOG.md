* 2.0.0:

  - Fork from ``karma-typescript-preprocessor2``.

  - The lowest supported version of Node is now 4.

  - The lowest supported version of ``gulp-typescript`` is now 3. The upside is
    that we no longer get a warning about a deprecated use of
    ``gulp-typescript``.

  - The plugin no longer explicitly requires ``typescript``, which means you can
    use it with any version of typescript that gulp-typescript supports.

    This was my main motivation for forking. I needed to use ``"extends"`` in
    ``tsconfig.json`` files. It worked everywhere except Karma. Yes, I did use
    my own ``typescript: require("typescript")`` in the ``karma.conf.js`` file
    to configure ``karma-typescript-preprocessor2``. **It still did not work.**
    I had to go delete the packages ``gulp-typescript`` and ``typescript`` that
    ``npm`` installed under ``karma-typescript-processor2/node_modules``, and I
    had to do this every time I installed or updated packages.

  - The code has been subjected to a general cleanup. It has been linted, many
    typos and inconsistencies have been fixed, bad practices have been
    eliminated. It is probably not perfect but much better than it was.