var mainBowerFiles = require('main-bower-files');
var gulp         = require('gulp'),
    gutil        = require('gulp-util');
    plumber      = require('gulp-plumber'),
    changed      = require('gulp-changed'),
    jade         = require('gulp-jade'),
    less         = require('gulp-less'),
    autoprefixer = require('gulp-autoprefixer'),
    minify       = require('gulp-minify-css'),
    jshint       = require('gulp-jshint'),
    concat       = require('gulp-concat'),
    imagemin     = require('gulp-imagemin'),
    cache        = require('gulp-cache'),
    uglify       = require('gulp-uglify'),
    rename       = require('gulp-rename'),
    notify       = require('gulp-notify'),
    clean        = require('gulp-clean'),
    livereload   = require('gulp-livereload'),
    del          = require('del'),
    path         = require('path');

// error handler
var onError = function (err) {  
  gutil.beep();
  console.log(err);
  this.emit('end');
};

var bases = {
  src: 'src/',
  dist: 'public_html/',
};

var paths = {  
    'dev': {
        'views':  './resources/**/*.php',
        'less':   './resources/assets/less/',
        'js':     './resources/assets/js/',
        'img':    './resources/assets/img/**/*.*',
        'vendor': './resources/assets/vendor/',
        'files': ['./resources/favicon.ico','./resources/assets/files/**/*.*']
    },
    'production': {
        'base':   './public_html/',
        'assets': './public_html/assets/',
        'css':    './public_html/assets/css/',
        'js':     './public_html/assets/js/',
        'img':    './public_html/assets/img/'
    }
};


// gulp.task('bower', function() {
//   return gulp.src(mainBowerFiles(), {
//       base: 'bower_components'
//     })
//     .pipe(gulp.dest('public_html/lib'));
// });

// gulp the html
// gulp.task('views', function() {
//   return gulp.src(paths.dev.jade+'*.jade')
//     .pipe(plumber({errorHandler: onError}))
//     .pipe(jade({
//       pretty: true
//     }))
//     .pipe(gulp.dest(paths.production.base))
//     .pipe(notify({ message: 'Views task complete' }));
// });

gulp.task('views', function() {
  return gulp.src(paths.dev.views)
    .pipe(changed(paths.production.base))
    .pipe(gulp.dest(paths.production.base))
    .pipe(notify({ message: 'Views task complete' }));
});


// gulp the styles
gulp.task('css', function() {  
  return gulp.src(paths.dev.less+'main.less')
    .pipe(plumber({errorHandler: onError}))
    .pipe(less())
    .pipe(gulp.dest(paths.production.css))
    .pipe(minify({keepSpecialComments:0}))
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest(paths.production.css))
    .pipe(notify({ message: 'LESS task complete' }));
});

// gulp the scripts
gulp.task('js', function(){  
  return gulp.src([
      paths.dev.vendor+'jquery/dist/jquery.js',
      paths.dev.vendor+'bootstrap/dist/js/bootstrap.js',
      paths.dev.js+'**/*'
    ])
    .pipe(plumber({errorHandler: onError}))
    .pipe(concat('all.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest(paths.production.js))
    .pipe(notify({ message: 'Scripts task complete' }));
});


// gulp the images
gulp.task('images', function() {
  return gulp.src(paths.dev.img)
    // .pipe(cache(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true })))
    .pipe(imagemin())
    .pipe(gulp.dest(paths.production.img))
    .pipe(notify({ message: 'Images task complete' }));
});

// gulp the fonts
gulp.task('fonts', function() {
  return gulp.src([
      paths.dev.vendor+'bootstrap/fonts/**/*',
      paths.dev.vendor+'fontawesome/fonts/**/*',
    ])
    .pipe(gulp.dest(paths.production.assets+'fonts'))
    .pipe(notify({ message: 'Font task complete' }));
});

// copy all other files
gulp.task('copy', function() {
  return gulp.src(paths.dev.files, { base: './resources/' })
  .pipe(gulp.dest(paths.production.base))
  .pipe(notify({ message: 'Copy task complete' }));
});

// clean all the things!
gulp.task('clean', function() {
  return gulp.src(bases.dist)
  .pipe(clean());
});

// Default task - gulp all the things!
gulp.task('default', ['clean'], function() {
    gulp.start('views', 'css', 'js', 'images', 'fonts', 'copy');
});


// watch for changes
gulp.task('watch', function() {
  // Watch .jade files
  gulp.watch(paths.dev.views, ['views']);
  // Watch .less files
  gulp.watch(paths.dev.less + '*.less', ['css']);
  // Watch .js files
  gulp.watch(paths.dev.js + '*.js', ['js']);
  // Watch image files
  gulp.watch(paths.dev.img, ['images']);
  // Create LiveReload server
  livereload.listen();
  // Watch any files in dist/, reload on change
  gulp.watch([paths.production.base + '**']).on('change', livereload.changed);
});