const path = require("path");

module.exports = {
  entry: ['@babel/polyfill', './src/exo/xo.js'],

  output: {
    filename: "./xo.js",
  },

  watch: true,

  devServer: {
    port: 4748,
  },

  resolve: {
    //root:[path.resolve('./ClientApp')],
    extensions: [".js"],
    alias: {
      //see our tsconfig.json file for explanation of '@'
      "@": path.resolve(__dirname, "src/"),
    },
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },
    ],
  },
};
