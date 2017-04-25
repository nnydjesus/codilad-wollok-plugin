var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var browserify = require('browserify');
var watchify = require('watchify');
var babelify = require('babelify');
var _ = require('lodash');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var path = require('path');

var config = {
    entryFile: './src/index.js',
    outputDir: './',
    outputFile: 'output.js'
};


function getBundler() {
    var bundler;
    if (!bundler) {
        bundler = watchify(browserify(config.entryFile, _.extend({ debug: true }, watchify.args)));
    }
    return bundler;
};

function bundle() {
    return getBundler()
        .transform(babelify.configure({
            sourceMapRelative: path.resolve(__dirname, 'src')
        }))
        .bundle()
        .on('error', function(err) { console.log(err); })
        .pipe(source(config.outputFile))
        .pipe(buffer())
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(config.outputDir));
}

gulp.task('build-persistent', [], function() {
    return bundle();
});

gulp.task('build', ['build-persistent'], function() {
    process.exit(0);
});

gulp.task('watch', ['build-persistent'], function() {
    getBundler().on('update', function() {
        gulp.start('build-persistent')
    });
});