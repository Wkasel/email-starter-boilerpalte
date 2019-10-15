'use strict';

// special thanks to JeromeCoupe (https://gist.github.com/jeromecoupe/0b807b0c1050647eb340360902c3203a)

import gulp from 'gulp';
import sass from 'gulp-sass';
import pug from 'gulp-pug';
import autoprefixer from 'gulp-autoprefixer';
import plumber from 'gulp-plumber';
import del from 'del';
import replace from 'gulp-replace';
import htmlmin from 'gulp-html-minifier';
import rename from 'gulp-rename';
import inlineCss from 'gulp-inline-css';
const browserSync = require('browser-sync').create();
// const bsync = browsersync.create();

const dirs = {
    src: {
        dir: './src',
        style: '/styles',
        tmpl: '/tmpl',
        partials: '_partials',
    },
    dest: './build',
};

function clean() {
    return del(['./build']);
}

const bsync = () =>
    browserSync.init({
        reloadDelay: 2000,
        server: { baseDir: dirs.dest },
    });

// task to reload browserSync
const reloadBrowserSync = () => browserSync.reload();

const css = () => {
    return gulp
        .src(`${dirs.src.dir}/${dirs.src.style}/style.scss`)
        .pipe(plumber())
        .pipe(sass().on('error', sass.logError))
        .pipe(sass({ outputStyle: 'expanded' }))
        .pipe(gulp.dest(`${dirs.src.dir}/css`))
        .pipe(rename({ suffix: '.min' }))
        .pipe(autoprefixer())
        .pipe(gulp.dest(`${dirs.src.dir}/css`));
    // .pipe(browsersync.stream());
};

const html = () => {
    return gulp
        .src(`${dirs.src.dir}/${dirs.src.tmpl}/*.pug`)
        .pipe(sass().on('error', e => console.log(e)))
        .pipe(replace(new RegExp('/sass/(.+).scss', 'ig'), '/css/$1.css'))
        .pipe(pug()) //{ doctype: 'html', pretty: true }
        .pipe(
            inlineCss({
                applyStyleTags: true,
                applyLinkTags: true,
                removeLinkTags: false,
                preserveMediaQueries: true,
                applyWidthAttributes: true,
                applyTableAttributes: true,
                preserveImportant: true,
                // removeStyleTags: true,
                // removeLinkTags: true,
            })
        )
        .pipe(rename({ dirname: '' }))
        .pipe(gulp.dest(dirs.dest));
};

const minify = () => {
    return gulp
        .src(`${dirs.dest}/*.html`)
        .pipe(
            htmlmin({
                removeAttributeQuotes: true,
                collapseWhitespace: true,
                removeComments: true,
                removeOptionalTags: true,
                removeScriptTypeAttributes: true,
                useShortDoctype: true,
                minifyCSS: true,
                html5: true,
                keepClosingSlash: true,
            })
        )
        .pipe(rename(path => (path.basename += '.min')))
        .pipe(gulp.dest('build'));
};
const lite = () => {
    return gulp
        .src(`${dirs.dest}/*.html`)
        .pipe(sass().on('error', e => console.log(e)))
        .pipe(
            htmlmin({
                removeComments: true,
                useShortDoctype: true,
                html5: true,
                keepClosingSlash: true,
                conservativeCollapse: true,
                minifyCSS: true,
            })
        )
        .pipe(rename(path => (path.basename += '.light')))
        .pipe(gulp.dest('build'));
};

const build = gulp.series(css, html, lite);

const watchFiles = () => {
    gulp.watch(`./src/styles/*.scss`, css);
    gulp.watch(
        `./src/tmpl/*.pug`,
        gulp.series(html, minify, lite, build, reloadBrowserSync)
    );
};
gulp.task('clean', clean);
gulp.task('build', gulp.series(clean, build));
gulp.task('default', gulp.series(clean, build));
gulp.task('watch', gulp.series(bsync, watchFiles));
