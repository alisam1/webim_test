"use strict";

var gulp = require('gulp');
var sass = require("gulp-sass");
var plumber = require("gulp-plumber");
var posthtml = require("gulp-posthtml");
var include = require("posthtml-include");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var minify = require("gulp-csso");
var rename = require("gulp-rename");
var server = require("browser-sync").create();
var svgstore = require("gulp-svgstore");
var webp = require("gulp-webp");
var imagemin = require("gulp-imagemin");
var del = require("del");
var run = require("run-sequence");

gulp.task("style", function () {
    gulp.src("source/sass/style.scss")
        .pipe(plumber())
        .pipe(sass())
        .pipe(postcss([
            autoprefixer()
        ]))
        .pipe(gulp.dest("build/css"))
        .pipe(minify())
        .pipe(rename("style.min.css"))
        .pipe(gulp.dest("build/css"))
        .pipe(server.stream());
});

gulp.task("serve", function () {
    server.init({
        server: "build/",
        notify: false,
        open: true,
        cors: true,
        ui: false
    });

    gulp.watch("source/sass/**/*.{scss,sass}", ["style"]);
    gulp.watch("source/*.html").on("change", () => ["html"]);
});

gulp.task("sprite", function () {
    return gulp.src("source/img/icon-*.svg")
        .pipe(svgstore({
            inlineSvg: true
        }))
        .pipe(rename("sprite.svg"))
        .pipe(gulp.dest("build/img"));
})

gulp.task("images", function () {
    return gulp.src("build/img/**/*.{png,jpg,svg}")
        .pipe(imagemin([
            imagemin.optipng({ optimizationLevel: 3 }),
            imagemin.jpegtran({ progressive: true }),
            imagemin.svgo()
        ]))
        .pipe(gulp.dest("build/img"));
});

gulp.task("copy", function () {
    return gulp.src([
        "source/fonts/**/*.{woff,woff2}",
        "source/img/**",
        "source/js/**",
        "source/css/**",
        "source/**/*.html"
    ], {
            base: "source"
        })
        .pipe(gulp.dest("build"));
});

gulp.task("webp", function () {
    return gulp.src("build/img/**/*.{png,jpg}")
        .pipe(webp({ quality: 90 }))
        .pipe(gulp.dest("build/img"));
});

gulp.task("html", function () {
    return gulp.src("source/*.html")
        .pipe(posthtml([
            include()
        ]))
        .pipe(gulp.dest("build"));
});

gulp.task("clean", function () {
    return del('build');
});

gulp.task("build", function (done) {
    run(
        "clean",
        "copy",
        "style",
        "html",
        done
    );
});

gulp.task('deploy', function () {
    return gulp.src('./')
        .pipe(ghPages());
});