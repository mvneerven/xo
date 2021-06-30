module.exports = {
  plugins: ["node_modules/kis-jsdoc-plugin"],
  source: {
    include: ["src/exo", "src/pwa"],
  },
  opts: {
    template: "node_modules/kis-jsdoc-plugin/templates/markdown",
    encoding: "utf8",
    destination: "./md/refdocs/" /* the path to the generated documentation */,
    recurse: true,
  },
  tags: {
    allowUnknownTags: true,
  },
};
