import esbuild from "esbuild";
import babel from "esbuild-plugin-babel";

const start = new Date().getTime();
esbuild
  .build({
    entryPoints: ["js/xo.js"],
    bundle: true,
    minify: true,
    format: "cjs",
    outfile: "dist/xo.min.js",
    plugins: [
      babel({
        babelHelpers: "bundled",
        presets: [
          [
            "@babel/preset-env",
            {
              targets: { browsers: ["last 2 chrome versions"] },
              useBuiltIns: "usage",
              corejs: "3.x",
            },
          ],
        ],
        plugins: ["@babel/plugin-proposal-class-properties"],
      }),
    ],
  })
  .then(() => {
    console.log(`Build finished within ${new Date().getTime() - start}ms`);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
