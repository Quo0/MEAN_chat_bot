const sass = require('node-sass');

module.exports = function(grunt){
  grunt.initConfig({
    sass:{
      options:{
        implementation: sass,
        sourceMap: true,
      },
      dist:{
        files:{
          "client/all.style.css" : "client/app/app.style.scss"
        }
      }
    },
    autoprefixer:{
      options:{
        browsers: ["last 2 versions"]
      },
      single_file:{
        src: "client/all.style.css",
        dest: "client/all.style.css"
      }
    },
    watch:{
      options:{
        interrupt: true,
        spawn: false,
        reload: true
      },
      scripts:{
        files: ["**/*.html","**/*.scss","**/*.js"],
        tasks: ["sass","autoprefixer"]
      }
    }
  });
  //
  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-autoprefixer');
  grunt.loadNpmTasks('grunt-contrib-watch');
  //
  grunt.registerTask("default", ["sass","autoprefixer","watch"]);
};
