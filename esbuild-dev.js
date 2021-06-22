// https://esbuild.github.io/api/
const esbuild = require("esbuild");

console.log("Building");

esbuild.build({
    entryPoints: ['js/xo.js'],
    bundle: true,
    watch: {
      onRebuild(error, result) {
        if (error) console.error('watch build failed:', error)
        else console.log('watch build succeeded:', result)
      },
    },
    outfile: 'dist/xo.js',
  }).catch(ex => {
    console.error(ex);
    process.exit(1)
  })


  esbuild.build({
    entryPoints: ['js/portal.js'],
    bundle: true,
    watch: {
      onRebuild(error, result) {
        if (error) console.error('watch build failed:', error)
        else console.log('watch build succeeded:', result)
      },
    },
    outfile: 'dist/portal.js',
  }).catch(ex => {
    console.error(ex);
    process.exit(1)
  })