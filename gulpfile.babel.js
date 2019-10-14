'use strict';

// special thanks to JeromeCoupe (https://gist.github.com/jeromecoupe/0b807b0c1050647eb340360902c3203a)

import gulp from 'gulp';
import sass from 'gulp-sass';
import pug from 'gulp-pug';
import gulpWatchPug from 'gulp-watch-pug';
import watch from 'gulp-watch';
import autoprefixer from 'gulp-autoprefixer';
import plumber from 'gulp-plumber';
import del from 'del';
// import browsersync from 'browser-sync';
import rename from 'gulp-rename';
import inline from 'gulp-inline-css';
const browsersync = require('browser-sync').create();
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

// BrowserSync
function browserSync(done) {
    browsersync.init({
        server: {
            baseDir: dirs.dest,
            directory: true,
        },
        port: 3000,
    });
    done();
}

// BrowserSync Reload
function browserSyncReload(done) {
    browsersync.reload();
    done();
}

const clean = () => del([`${dirs.dest}`]);

const css = () => {
    return (
        gulp
            .src(`${dirs.src.dir}/${dirs.src.style}/style.scss`)
            .pipe(plumber())
            // .pipe(sass.sync().on('error', onError))
            .pipe(sass({ outputStyle: 'expanded' }))
            .pipe(gulp.dest(`${dirs.dest}/styles`))
            .pipe(rename({ suffix: '.min' }))
            .pipe(autoprefixer())
            .pipe(gulp.dest(dirs.dest))
            .pipe(browsersync.stream())
    );
};

const tmpl = () => {
    return gulp
        .src(`${dirs.src.dir}/${dirs.src.tmpl}/email.pug`)
        .pipe(pug({ doctype: 'html', pretty: true }))
        .pipe(gulp.dest(dirs.dest))
        .pipe(browsersync.stream());
};
const inlineStyles = () => {
    return gulp.src(`${dirs.dest}/email.html`).pipe(
        inline({
            applyStyleTags: true,
            applyLinkTags: true,
            removeStyleTags: true,
            removeLinkTags: true,
        }).pipe(gulp.dest('build/'))
    );
};

const watchFiles = () => {
    // gulp.watch(`${dirs.src.dir}/${dirs.src.style}/**/*.scss`, css).on(
    //     'change',
    //     browserSyncReload
    // );
    // gulp.watch(`${dirs.src.dir}/${dirs.src.tmpl}/**/*.pug`, tmpl).on(
    //     'change',
    //     browserSyncReload
    // );
    gulp.watch(
        `${dirs.src.dir}/${dirs.src.styles}`,
        gulp.series(build, browserSyncReload)
    ).on('change', browsersync.reload);
    gulp.watch(
        `${dirs.src.dir}/${dirs.src.tmpl}`,
        gulp.series(build, browserSyncReload)
    ).on('change', browsersync.reload);
};

const build = gulp.series(clean, gulp.parallel(css, tmpl), inlineStyles);
const watcher = gulp.parallel(watchFiles, browserSync);

exports.css = css;
exports.tmpl = tmpl;
exports.clean = clean;
exports.build = build;
exports.watch = watcher;
exports.default = build;
