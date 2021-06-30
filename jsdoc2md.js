const jsdoc2md = require("jsdoc-to-markdown");
const fs = require("file-system");

jsdoc2md
  .render({
    files: ["src/exo/**", "src/pwa/**"],
  })
  .then((content) => {
    // generates a file containing the markdown content
    fs.writeFile("md/refdocs.md", content);
  });
