'use strict';

var gulp = require('gulp'),
    watch = require('gulp-watch'), //следит за изменениями файлов
    uglify = require('gulp-uglify'), //компилирует js
    sass = require('gulp-sass'), //компилятор sass
    sourcemaps = require('gulp-sourcemaps'), //map для sass
    rigger = require('gulp-rigger'),
    imagemin = require('gulp-imagemin'), //оптимизация изображений jpg
    pngquant = require('imagemin-pngquant'), //оптимизация изображений png
    rimraf = require('gulp-rimraf'),
    spritesmith = require('gulp.spritesmith'), //спрайты
    browserSync = require("browser-sync"), // запуск сервера (как локального так и глобального)
    autoprefixer = require('gulp-autoprefixer'), // добавляем префиксы
    useref = require('gulp-useref'), // изменяем пути
    wiredep = require('wiredep').stream, // забираем из bower
    gulpif = require('gulp-if'),  // добавляет ветвление (здесь нужно для минификации)
    minifyCss = require('gulp-minify-css'), // для сжатия обычных css
    htmlmin = require('gulp-htmlmin'), // сжимаем html, есть ли такая небохобимость???
    gzip = require('gulp-gzip'), // сжимаем gzip
    reload = browserSync.reload

// Прописываем пути
var path = {
    build: { //Тут мы укажем куда складывать готовые после сборки файлы
        html: 'build/',
        js: 'build/js/',
        css: 'build/css/',
        image: 'build/img/',
        ico: 'build/img/ico/', //Выкидываем иконки
        fonts: 'build/fonts/',
        jsVendor: 'build/js/vendor/'
    },
    src: { //Пути откуда брать исходники
        html: 'src/*.html', //Синтаксис src/*.html говорит gulp что мы хотим взять все файлы с расширением .html
        js: 'src/js/main.js',//В стилях и скриптах нам понадобятся только main файлы
        style: 'src/css/*.scss',
        css: 'src/css/*.css',
        ico: 'src/img/ico/*.*', //Забираем все иконки
        image: 'src/img/*.*', //Синтаксис img/**/*.* означает - взять все файлы всех расширений из папки и из вложенных каталогов
        fonts: 'src/fonts/**/*.*',
        jsVendor: 'src/js/vendor/*.js'
    },
    watch: { //Тут мы укажем, за изменением каких файлов мы хотим наблюдать
        html: 'src/*.html',
        template: 'src/template/*.html',
        js: 'src/js/*.js',
        style: 'src/css/main.scss',
        image: 'src/img/*.*',
        fonts: 'src/fonts/*.*'
    },
    clean: 'build'
};




// настройки dev сервера
var config = {
    server: {
        baseDir: "build"
    },
    tunnel: false,
    host: 'localhost',
    port: 9000,
    logPrefix: "FunBek"
};
// liverelood
gulp.task('webserver', function(){
    browserSync(config);
})

// Очистка из папки build
gulp.task('clean', function (cb) {
    rimraf(path.clean, cb);
});



// сборка html
gulp.task('html:build', function () {
    gulp.src(path.src.html) //Выбирем файлы по нужному пути
        .pipe(wiredep({}))
        .pipe(useref()) // Забираем файлы из bower_components
        .pipe(rigger()) //Прогоним через rigger
        //.pipe(gulpif('*.js', uglify())) // сжимаем все js файлы
        //.pipe(gulpif('*.css', minifyCss())) // сжимаем все css файлы
        //.pipe(htmlmin({collapseWhitespace: true})) // Сжимаем html
        .pipe(gulp.dest(path.build.html)) //Выплюнем их в папку build
        .pipe(reload({stream: true})); //И перезагрузим наш сервер для обновлений
});


gulp.task('js:build', function () {
    gulp.src(path.src.js) //Найдем наш main файл
        .pipe(rigger()) //Прогоним через rigger
        .pipe(uglify()) //Сожмем наш js
        // .pipe(gzip())
        .pipe(gulp.dest(path.build.js)) //Выплюнем готовый файл в build
        .pipe(reload({stream: true})); //И перезагрузим наш сервер для обновлений
});

// собираем css
gulp.task('style:build', function () {
    gulp.src(path.src.style) //Выберем наш main.scss
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError)) //Выдаем ошибки
        .pipe(autoprefixer( {
            browsers: ["last 20 version", "> 1%", "ie 8", "ie 7"], cascade: false
        }))
        .pipe(sass({
            outputStyle: 'compressed'
        }))
        .pipe(sourcemaps.write('.'))
        // .pipe(gzip())
        .pipe(gulp.dest(path.build.css)) //И в build
        .pipe(reload({stream: true})); //И перезагрузим наш сервер для обновлений
});


// собираем картинки
gulp.task('image:build', function () {
    gulp.src(path.src.image) //Выберем наши картинки
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        }))
        .pipe(gulp.dest(path.build.image)) //И бросим в build
});


// Собираем иконки для мобильных версий сайта
gulp.task('ico:build', function() {
    gulp.src(path.src.ico)
        .pipe(gulp.dest(path.build.ico))
});

// Собираем иконки для мобильных версий сайта
gulp.task('fonts:build', function() {
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts))
});


// Команда gulp build запустит все таски на сборку
gulp.task('build', [
    'html:build',
    'js:build',
    'style:build',
    'image:build',
    'ico:build',
    'fonts:build'
]);

// следим за изменениями файлов
gulp.task('watch', function(){
    watch([path.watch.html], function(event, cb) {
        gulp.start('html:build');
    });

    watch([path.watch.template], function(event, cb) {
        gulp.start('html:build');
    });

    watch([path.watch.style], function(event, cb) {
        gulp.start('style:build');
    });
    watch([path.watch.js], function(event, cb) {
        gulp.start('js:build');
    });

    watch([path.watch.image], function(event, cb) {
        gulp.start('image:build');
    });
    watch([path.watch.fonts], function(event, cb) {
        gulp.start('fonts:build');
    });

});

// Задаем начальную команду gulp на выполнение тасков и слежение элементов
gulp.task('default', ['build', 'watch', 'webserver'])
