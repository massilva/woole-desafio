(function () {
    'use strict';

    var gulp     = require('gulp'),
        less     = require('gulp-less'),
        uglify   = require("gulp-uglify"),
        rename   = require("gulp-rename"),
        concat   = require("gulp-concat"),
        inject   = require('gulp-inject-string'),
        autoprefixer = require('gulp-autoprefixer');

    gulp.task('js', function () {
        return gulp.src('./js/*.js')
            .pipe(concat({path: "main.js", stat: { mode: '0666' }}))
            .pipe(inject.prepend('(function (window) {\n'))
            .pipe(inject.append('\n})(window);'))
            .pipe(rename({suffix: '.min'}))
            .pipe(uglify())
            .pipe(gulp.dest('./js'));
    });

    gulp.task('less', function () {
        gulp.src('./less/main.less')
            .pipe(autoprefixer({
                browsers: ['last 2 versions'],
                cascade: false
            }))
            .pipe(less({compress: true}))
            .pipe(gulp.dest('./css'));
    });

    gulp.task('watch', function () {
        gulp.watch('./less/*.less', ['less']);
        gulp.watch('./js/*.js', ['js']);
    });

    gulp.task('default', ['less', 'watch', 'js']);

}());
