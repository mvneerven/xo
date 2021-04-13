// rollup.config.js
import path from "path";
import { terser } from "rollup-plugin-terser";

export default [
  {
    input: path.join(__dirname, "src/exo/xo.js"),
    output: {
      file: path.join(__dirname, "dist/xo.js"),
      format: "umd",
      name: "xo"
    },
    watch: {
      // include and exclude govern which files to watch. by
      // default, all dependencies will be watched
      exclude: ["node_modules/**", "css/**", ".vscode/**"],
    },
  },
  {
    input: path.join(__dirname, "src/exo/xo.js"),
    output: {
      file: path.join(__dirname, "dist/xo.min.js"),
      format: "umd",
      name: "xo"
    },
    plugins: [terser()],
  }
];
