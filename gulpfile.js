import gulp from 'gulp';
import imagemin, { gifsicle, mozjpeg, optipng, svgo } from 'gulp-imagemin';
import browserSync from 'browser-sync';
import cleanCSS from 'gulp-clean-css';
import sourcemaps from 'gulp-sourcemaps';
import autoprefixer from 'gulp-autoprefixer';
import rename from 'gulp-rename';
import concat from 'gulp-concat';
import uglify from 'gulp-uglify';
import nodeSass from 'node-sass';
import gulpSass from 'gulp-sass';
import replace from 'gulp-replace';

import path from 'path';
import fs from 'fs';

const sass = gulpSass(nodeSass);
const server = browserSync.create();

const paths = {
    html: 'app/*.html',
    scss: 'app/sass/**/*.scss',
    img: 'app/img/*',
    js: 'app/js/*.js',
    dest: {
        root: 'dist',
        css: 'dist/css',
        img: 'dist/img',
        js: 'dist/js',
    },
};

gulp.task('html', () => {
    return gulp.src(paths.html)
        .pipe(gulp.dest(paths.dest.root))
        .pipe(replace('href="sass/', `href="${paths.dest.css}/`))
        .pipe(replace('src="js/', `src="${paths.dest.js}/`))
        .pipe(server.stream());
});

gulp.task('sass', () => {
    return gulp.src(paths.scss)
        .pipe(sourcemaps.init())
        .pipe(concat('styles.scss'))
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(cleanCSS())
        .pipe(rename({ suffix: '.min' }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.dest.css))
        .pipe(server.stream());
});


gulp.task('img', () => {
    return gulp.src(paths.img)
        // .pipe(imagemin())
        .pipe(gulp.dest(paths.dest.img));
});

gulp.task('scripts', () => {
    return gulp.src(paths.js)
        .pipe(concat('scripts.js'))
        .pipe(uglify())
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest(paths.dest.js))
        .pipe(server.stream())
});

gulp.task('watch', () => {
    server.init({
        server: paths.dest.root,
    });

    gulp.watch(paths.scss, gulp.series('sass'));
    gulp.watch(paths.img, gulp.series('img'));
    gulp.watch(paths.js, gulp.series('scripts'));
    gulp.watch(paths.html, gulp.series('html'));
});

gulp.task('default', gulp.series('html', 'sass', 'img', 'scripts', 'watch'));
