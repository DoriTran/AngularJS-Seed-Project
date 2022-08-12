
var gulp = require('gulp');
var gulpLoadPlugins = require('gulp-load-plugins');
var $ = plugins = gulpLoadPlugins();
var ngHtml2Js = require("gulp-ng-html2js");
var uglify = require('gulp-uglify');//Minify JavaScript with UglifyJS2.
var jshint = require('gulp-jshint');    //jshint检测javascript的语法错误
var concat = require('gulp-concat');
const babel = require('gulp-babel')

var browserSync = require('browser-sync');
var reload = browserSync.reload;

var url = require('url');
var mockApi = require('./mockApi');




gulp.task('templatesTpls', function () {
  return gulp.src([
      './app/src/directives/tpls/*.html',
    ])
    .pipe(ngHtml2Js({
        moduleName: "myApp",
        prefix: "src/directives/tpls/"
    }))
    .pipe(concat("templatesTpls.min.js"))
    .pipe(babel({
        presets: ['es2015']
    }))
    .pipe(uglify())
    .pipe(gulp.dest('./tmp/templates'))
});

gulp.task('templatesViews', function () {
  return gulp.src([
      './app/src/templates/**/*.html'
    ])
    .pipe(ngHtml2Js({
        moduleName: "myApp",
        rename:function (templateUrl, templateFile) {
          var pathParts = templateFile.path.split('\\');
          var file = pathParts[pathParts.length - 1];
          var folder = pathParts[pathParts.length - 2];
          if ("templates" === folder) {
            return "./src/templates/" + file
          } else {
            return "./src/templates/" + folder + '/' + file
          }
        }
    }))
    .pipe(concat("templatesViews.min.js"))
    .pipe(babel({
        presets: ['es2015']
    }))
    .pipe(uglify())
    .pipe(gulp.dest('./tmp/templates'))
});


var cssList = [
  './app/src/styles/app.css',
  './app/src/styles/*.css'
];

var jsList = [
  './app/*.js',
  './app/src/directives/*.js',
  './app/src/controllers/*.js',
  './app/src/services/*.js',
  './app/src/filters/*.js',
  './tmp/templates/*.js',
];

gulp.task('jshint', function () {
  return gulp.src(jsList)
    .pipe(reload({stream: true, once: true}))
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
});


gulp.task('default', ['clean'], function () {
  gulp.start('build');
});
  gulp.task('serve',  function () {
    browserSync({
      notify: false, // Don't show any notifications in the browser.
      port: 8082,
      open: false,
      server: {
        baseDir: ['app'],
        routes: {
          // 'bower_components': 'bower_components',//if bower_components' path is up the tree of app
        },
        middleware:
            function (req, res, next) {
                var urlObj = url.parse(req.url, true),
                    method = req.method,
                    paramObj = urlObj.query;
                mockApi(res, urlObj.pathname, paramObj, next);
            }
      }
    });

    // watch for changes
    gulp.watch([
      'app/**/*.html',
      'app/**/*.css',
      'app/**/*.js',
      'app/public/**/*',
      'app/data/**/*'
    ]).on('change', reload);

    gulp.watch('app/src/**/*.less', ['css', reload]);
    // gulp.watch('bower.json', ['fonts', reload]);
  });



