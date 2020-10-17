
module.exports = function(grunt) {

  grunt.initConfig({
    eslint: {
      target: ["./src/index.js"]
    },
    babel: {
      options: {
        "sourceMap": true
      },
      dist: {
        files: [{
          "src": ["dist/index.js"],
          "dest": "dist/regexp-template.js",
        }]
      }
    },
    uglify: {
      all_src : {
        options : {
          sourceMap: true,
          sourceMapName : "dist/regexp-template.min.js.map",
          sourceMapIn: "dist/regexp-template.js.map"
        },
        src : "dist/regexp-template.js",
        dest : "dist/regexp-template.min.js"
      }
    }
  });

  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('grunt-babel');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('processSrc', "adds IIFE and export to source code to ", function () {
    const src = "src/index.js";
    const dest = "dist/index.js";

    const header = "(function() {\n";


    const exportSection =
`\nif (typeof module === "object") {
  // export for node
  module.exports = RegExpTemplate;
} else {
  // export for browser
  window["getRegExpPattern"] = RegExpTemplate;
}\n`;

    const footer = exportSection + "\n})();\n";

    const srcContent = grunt.file.read(src);

    const content = header + srcContent + footer;

    grunt.file.write(dest, content);
  });

  grunt.registerTask('default', "build",
    [
      'eslint',
      'processSrc',
      'babel',
      'uglify',
    ]
  );
};
