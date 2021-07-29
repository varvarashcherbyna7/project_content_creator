const { src, dest, series, watch } = require('gulp');
const gulp = require('gulp');
const cache = require('gulp-cache');
const csso = require('gulp-csso');
const include = require('gulp-file-include');
const htmlmin = require('gulp-htmlmin');
const imagemin = require('gulp-imagemin');
const image = require('gulp-image');
const babel = require('gulp-babel');
const sourcemaps = require('gulp-sourcemaps');
const del = require('del');
const concat = require('gulp-concat');
const autoprefixer = require('gulp-autoprefixer');
const sync = require('browser-sync').create();
const imageminGiflossy = require('imagemin-giflossy');
const deploy = require('gulp-gh-pages');


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

// function img() {
//     return src('src/img/**/*.{gif, png, jpg, svg}')
//         .pipe(cache(imagemin([
//                 imageminGiflossy({
//                     optimizationLevel: 3,
//                     optimize: 3, //keep-empty: Preserve empty transparent frames
//                     lossy: 2
//                 }),
//             ]))
//             .pipe(dest('build/img')))
// }

function img() {
    return src('src/img/**/*.*')
        .pipe(cache(
                imagemin([
                    image({
                        // pngquant: true,
                        // optipng: true,
                        // zopflipng: true,
                        // jpegRecompress: true,
                        // mozjpeg: true,
                        // gifsicle: true,
                        // svgo: true,
                        // concurrent: 10,
                        // quiet: true
                        optipng: ['-i 1', '-strip all', '-fix', '-o7', '-force'],
                        pngquant: ['--speed=1', '--force', 256],
                        zopflipng: ['-y', '--lossy_8bit', '--lossy_transparent'],
                        jpegRecompress: ['--strip', '--quality', 'medium', '--min', 40, '--max', 80],
                        mozjpeg: ['-optimize', '-progressive'],
                        gifsicle: ['--optimize'],
                        svgo: ['--enable', 'cleanupIDs', '--disable', 'convertColors']
                    })
                ])
            )
            .pipe(dest('build/img')))
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


/**
 * Push build to gh-pages
 */
gulp.task('deploy', function() {
    return gulp.src("./build/**/*")
        .pipe(deploy())
});