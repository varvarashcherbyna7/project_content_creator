const { src, dest, series, watch } = require('gulp');
const gulp = require('gulp');
const cache = require('gulp-cache');
const csso = require('gulp-csso');
const include = require('gulp-file-include');
const htmlmin = require('gulp-htmlmin');
const imagemin = require('gulp-imagemin');
const babel = require('gulp-babel');
const sourcemaps = require('gulp-sourcemaps');
const del = require('del');
const concat = require('gulp-concat');
const autoprefixer = require('gulp-autoprefixer');
const sync = require('browser-sync').create();
const imageminGiflossy = require('imagemin-giflossy');
const deploy = require('gulp-gh-pages');
const netlify = require('gulp-netlify')


function html() {
    return src('src/**.html')
        .pipe(include({
            prefix: '@@'
        }))
        .pipe(htmlmin({
            collapseWhitespace: true,
            removeComments: true
        }))
        .pipe(dest('build'))
}

function css() {
    return src('src/css/**/*.css')
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(csso())
        .pipe(gulp.dest('build/css'))
}

function img() {
    return src('src/img/*/*.*')
        .pipe(cache(imagemin([
                imageminGiflossy({
                    optimizationLevel: 3,
                    optimize: 3, //keep-empty: Preserve empty transparent frames
                    lossy: 2
                }),
            ]))
            .pipe(dest('build/img')));
}

function clear() {
    return del('build')
}

function serve() {
    sync.init({
        server: './build'
    })
    watch('src/**.html', series(html)).on('change', sync.reload)
    watch('src/css/**.css', series(css)).on('change', sync.reload)
}

exports.build = series(clear, css, html, img)
exports.serve = series(clear, css, html, img, serve)
exports.clear = clear

// gulp.task('deploy', function() {
//     return gulp.src("./build/**/*")
//         .pipe(deploy())
// });

gulp.task('deploy', async function() {
    gulp.src('./build/**/*')
        .pipe(netlify({
            site_id: '613869e6-36a6-43fa-9835-3fb2350f3117',
            access_token: 'MP-xN641aog6yaQFMjFiRB7BpwmiIYtGiaE27uRpEEU'
        }))
});