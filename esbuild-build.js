// https://esbuild.github.io/api/
const esbuild = require("esbuild");

esbuild.build({
    entryPoints: ['js/xo.js'],
    bundle: true,
    format: "esm",
    minify: true,
    outfile: 'dist/xo.min.js',
  }).catch(() => process.exit(1))

  esbuild.build({
    entryPoints: ['js/portal.js'],
    bundle: true,
    format: "esm",
    minify: true,
    outfile: 'dist/portal.min.js',
  }).catch(() => process.exit(1))


