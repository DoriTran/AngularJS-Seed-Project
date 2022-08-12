
var gulp = require('gulp');
var gulpLoadPlugins = require('gulp-load-plugins');
var $ = plugins = gulpLoadPlugins();
var ngHtml2Js = require("gulp-ng-html2js");
var uglify = require('gulp-uglify');
var jshint = require('gulp-jshint');
var concat = require('gulp-concat');
const babel = require('gulp-babel')
// HTML task
var rename = require("gulp-rename");
// CSS task
var autoprefixer = require('gulp-autoprefixer');
var cleanCSS = require('gulp-clean-css');

var browserSync = require('browser-sync');
var reload = browserSync.reload;

var url = require('url');
var mockApi = require('./mockApi');

var distFolderUrl = "appDist";
gulp.task('clean', function () {
  return require('del')([distFolderUrl + '/**', 'tmp/**', 'dist/**']);
});
gulp.task('build', ['public','vendor','js','css','html'], function () {
  return gulp.src(distFolderUrl + '/**/*').pipe($.size({title: 'build', gzip: true}));
});
gulp.task('public', function() {
  return gulp.src(['./app/public/**/*','./app/*.ico'], {base: './app/'})
  .pipe(gulp.dest(distFolderUrl))
});
gulp.task('vendor', function () {
  return gulp.src(['./app/bower_components/**/*'])
    .pipe(gulp.dest(distFolderUrl + '/vendor'))
});
gulp.task('html', function () {
  return gulp.src(['app/index-dist.html'])
    .pipe(rename('index.html'))
    .pipe(gulp.dest(distFolderUrl))
})
gulp.task('css', function() {
  return gulp.src(cssList)
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(concat('app.min.css'))
    .pipe(cleanCSS())
    .pipe(gulp.dest(distFolderUrl + '/static/css'))
})
gulp.task('js', ['templatesTpls','templatesViews'], function () {
  return gulp.src(jsList)
  .pipe(concat('app.min.js'))
  .pipe(babel({
      presets: ['es2015']
  }))
    .pipe(uglify({
            mangle: false,
            compress: false,
            preserveComments: 'all'
        }).on('error', function(e){
            console.log(e);
         }))
    .pipe(gulp.dest(distFolderUrl + '/static/js'))
});
gulp.task('serve', function () {
  browserSync({
    notify: false, 
    port: 8082,
    open: false,
    server: {
      baseDir: ['app'],
      routes: {
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
  gulp.task('serve-release',  function () {
    browserSync({
      notify: false,
      port: 8082,
      server: {
        baseDir: [distFolderUrl]
      }
    });

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
gulp.task('serve-release', function () {
  browserSync({
    notify: false,
    port: 8082,
    server: {
      baseDir: [distFolderUrl]
    }
  });

});


gulp.task('templatesTpls', function () {
  return gulp.src([
    './app/src/directives/tpls/*.html',
  ])
    .pipe(ngHtml2Js({
      moduleName: "app",
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
      moduleName: "app",
      rename: function (templateUrl, templateFile) {
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
    .pipe(reload({ stream: true, once: true }))
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
});


gulp.task('default', ['clean'], function () {
  gulp.start('build');
});


