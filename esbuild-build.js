// https://esbuild.github.io/api/
const esbuild = require("esbuild");

esbuild.build({
    entryPoints: ['js/xo.js'],
    bundle: true,
    format: "esm",
    minify: true,
    outfile: 'dist/xo.min.js',
  }).catch(() => process.exit(1))

  //"build1": "npm run compile&&npm run test&&npm run doc",


  esbuild.build({
    entryPoints: ['js/portal.js'],
    bundle: true,
    format: "esm",
    minify: true,
    outfile: 'dist/portal.min.js',
  }).catch(() => process.exit(1))
