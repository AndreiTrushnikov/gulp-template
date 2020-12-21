let project_folder = "docs";
let source_folder = "src";

let path = {
  build: {
    html  : project_folder + "/",
    css   : project_folder + "/css",
    v_css : project_folder + "/css/vendor",
    js    : project_folder + "/js",
    v_js  : project_folder + "/js/vendor",
    img   : project_folder + "/img",
    fonts : project_folder + "/fonts",
    fav   : project_folder + "/img/favicons"
  },
  src: {
    html  : [
              source_folder + "/**/*.html",
              "!" + source_folder + "/blocks/**/*.html"
            ],
    css   : source_folder + "/styles/style.scss",
    v_css : source_folder + "/styles/vendor/*",
    js    : [
              source_folder + "/**/*.js",
              "!" + source_folder + "/js/vendor/*.js"
            ],
    v_js  : source_folder + "/js/vendor/*.js",
    img   : source_folder + "/img/**/*",
    fonts : source_folder + "/fonts/**/*",
    fav   : source_folder + "/img/favicons/*.{jpg,jpeg,png,gif}"
  },
  watch: {
    html  : source_folder + "/**/*.html",
    css   : source_folder + "/**/*.scss",
    js    : source_folder + "/**/*.js",
    img   : source_folder + "/img/**/*.{jpg, png, svg, gif, ico, webp}",
  },
  clean: "./" + project_folder + "/"
}
// Подключенные плагины
let {src, dest} = require('gulp'),
    gulp = require('gulp'),
    browser_sync = require("browser-sync").create(),
    fileinclude = require('gulp-file-include'),
    del = require('del'),
    scss = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    group_media = require('gulp-group-css-media-queries'),
    clean_css = require('gulp-clean-css'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify-es').default,
    favicons = require('gulp-favicons'),
    plumber = require('gulp-plumber'),
    gulpStylelint = require('gulp-stylelint');

// Удаление всего в папке вывода при каждом новом запуске
function clean (params) {
  return del(path.clean)
}

// images
function images (params) {
  return src(path.src.img)
    .pipe(dest(path.build.img))
    .pipe(browser_sync.stream())
}

// Создание favicon
function fav (params) {
  return src(path.src.fav)
      .pipe(favicons({
          icons: {
              appleIcon: true,
              favicons: true,
              online: false,
              appleStartup: false,
              android: false,
              firefox: false,
              yandex: false,
              windows: false,
              coast: false
          }
      }))
      .pipe(dest(path.build.fav))
};

// html
function html (params) {
  return src(path.src.html)
    .pipe(plumber())
    .pipe(fileinclude())
    .pipe(plumber.stop())
    .pipe(dest(path.build.html))
    .pipe(browser_sync.stream())
}

// Css
function css (params) {
  return src(path.src.css)
    .pipe(plumber())
    .pipe(
      scss({
        outputStyle: "expanded"
      })
    )
    .pipe(group_media())
    .pipe(
      autoprefixer({
        overrideBrowserslist: ["last 5 versions"],
        cascade: true
      })
    )
    .pipe(plumber.stop())
    .pipe(dest(path.build.css))
    .pipe(plumber())
    .pipe(clean_css())
    .pipe(
      rename({
        extname: ".min.css"
      })
    )
    .pipe(plumber.stop())
    .pipe(dest(path.build.css))
    .pipe(browser_sync.stream())
}

// Vendor Css
function v_css (params) {
  return src(path.src.v_css)
    .pipe(dest(path.build.v_css))
    .pipe(browser_sync.stream())
}

// Js
function js (params) {
  return src(path.src.js)
    .pipe(plumber())
    .pipe(concat('script.js'))
    .pipe(plumber.stop())
    .pipe(dest(path.build.js))
    .pipe(plumber())
    .pipe(uglify())
    .pipe(
      rename({
        extname: ".min.js"
      })
    )
    .pipe(plumber.stop())
    .pipe(dest(path.build.js))
    .pipe(browser_sync.stream())
}

// Vendor Js
function v_js (params) {
  return src(path.src.v_js)
    .pipe(dest(path.build.v_js))
    .pipe(browser_sync.stream())
}

// Fonts
function fonts (params) {
  return src(path.src.fonts)
    .pipe(dest(path.build.fonts))
}

// Слежка
function watchFiles (params) {
  gulp.watch([path.watch.html], html);
  gulp.watch([path.watch.css], css);
  gulp.watch([path.watch.js], js);
  gulp.watch([path.watch.img], images);
}

// browser sync для отслеживания изменений
function browserSync (params) {
  browser_sync.init({
    server: {
      baseDir: "./" + project_folder + "/"
    },
    port: 3000,
    notify: false
  })
}

let build = gulp.series(clean, gulp.parallel(fonts, js, v_css, v_js, css, html, images, fav));
let watch = gulp.parallel(build, watchFiles, browserSync);

exports.fav = fav;
exports.images = images;
exports.fonts = fonts;
exports.v_js = v_js;
exports.js = js;
exports.v_css = v_css;
exports.css = css;
exports.html = html;
exports.build = build;
exports.watch = watch;
exports.default = watch;