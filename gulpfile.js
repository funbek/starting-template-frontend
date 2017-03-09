'use strict';

const gulp = require('gulp');
const watch = require('gulp-watch'); //следит за изменениями файлов
const uglify = require('gulp-uglify'); //компилирует js
const sass = require('gulp-sass'); //компилятор sass
const sourcemaps = require('gulp-sourcemaps'); //map для sass
const rigger = require('gulp-rigger'); // Позволяет вставлять шаблоны простой конструкцией
const imagemin = require('gulp-imagemin'); //оптимизация изображений jpg
const pngquant = require('imagemin-pngquant'); //оптимизация изображений png
const rimraf = require('gulp-rimraf');
const spritesmith = require('gulp.spritesmith'); //спрайты
const browserSync = require('browser-sync'); // запуск сервера (как локального так и глобального)
const autoprefixer = require('gulp-autoprefixer'); // добавляем префиксы
const useref = require('gulp-useref'); // изменяем пути
const wiredep = require('wiredep').stream; // забираем из bower
const gulpif = require('gulp-if');  // добавляет ветвление (здесь нужно для минификации)
const cleanCSS = require('gulp-clean-css'); // для сжатия обычных css
const uncss = require('gulp-uncss'); // Удаляем ненужные стили
const del = require('del'); // Удаляем папки
const reload = browserSync.reload;


// Прописываем пути
var path = {
    build: { //Тут мы укажем куда складывать готовые после сборки файлы
        html: 'build/',
        js: 'build/js/',
        css: 'build/css/',
        image: 'build/img/',
        ico: 'build/img/ico/', //Выкидываем иконки
        fonts: 'build/fonts/',
        browserconfig: 'build/',
        jsVendor: 'build/js/vendor/'
    },
    src: { //Пути откуда брать исходники
        cleanHtml: 'src/**/*.html', // Для очистки
        html: 'src/*.html', //Синтаксис src/*.html говорит gulp что мы хотим взять все файлы с расширением .html
        js: 'src/js/main.js',//В стилях и скриптах нам понадобятся только main файлы
        style: 'src/css/*.scss',
        spriteStyle: 'src/css/',
        spriteImg: 'src/img/',
        css: 'src/css/*.css',
        ico: 'src/img/ico/*.*', //Забираем все иконки
        image: 'src/img/*.*', //Синтаксис img/**/*.* означает - взять все файлы всех расширений из папки и из вложенных каталогов
        browserconfig: 'src/*.xml', //Файл для определения favicon в windows mobile
        fonts: 'src/fonts/**/*.*',
        nodeDir: 'node_modules',
        jsVendor: 'src/js/vendor/*.js'
    },
    watch: { //Тут мы укажем, за изменением каких файлов мы хотим наблюдать
        html: 'src/**/*.html',
        js: 'src/js/*.js',
        style: 'src/css/**/*.scss',
        image: 'src/img/*.*',
        fonts: 'src/fonts/*.*',
        browserconfig: 'src/*.xml'
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
gulp.task('clean', function () {
    return del(path.clean);
});

// сборка html
gulp.task('html:build', function () {
    gulp.src(path.src.html) //Выбирем файлы по нужному пути
        .pipe(wiredep({})) // Забираем файлы из bower_components
        .pipe(useref()) // Объединяем все файлы в один
        .pipe(gulpif('*.js', uglify())) // сжимаем все js файлы
        .pipe(gulpif('*.css', cleanCSS({compatibility: 'ie8'}))) // сжимаем все js файлы
        .pipe(rigger()) //Прогоним через rigger
        .pipe(gulp.dest(path.build.html)) //Выплюнем их в папку build
        .pipe(reload({stream: true})); //И перезагрузим наш сервер для обновлений
});


gulp.task('js:build', function () {
    gulp.src(path.src.js) //Найдем наш main файл
        .pipe(rigger()) //Прогоним через rigger
        .pipe(uglify()) //Сожмем наш js
        .pipe(gulpif('*.js', uglify())) // сжимаем все js файлы
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
        .pipe(uncss({
            html: [path.src.cleanHtml] // Убираем неиспользуемые стили (проверяем по всем файлам с расширением html)
        }))
        .pipe(sass({
            outputStyle: 'compressed' // Обрабатываем sass и сжимаем его
        }))
        .pipe(sourcemaps.write())
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

gulp.task('sprite:build', function() {
    var spriteData =
        gulp.src(path.src.spriteImg + 'sprite/*.*') // путь, откуда берем картинки для спрайта
            .pipe(spritesmith({
                imgName: 'sprite.png',
                cssName: '_sprite.scss',
                imgPath: '../img/sprite/sprite.png',
            }));

    spriteData.img.pipe(gulp.dest(path.build.image + 'sprite')); // путь, куда сохраняем картинку
    spriteData.css.pipe(gulp.dest(path.src.spriteStyle + 'base')); // путь, куда сохраняем стили
});


// Собираем иконки для мобильных версий сайта
gulp.task('ico:build', function() {
    gulp.src(path.src.ico)
        .pipe(gulp.dest(path.build.ico))
});

// Забираем нестандартные шрифты
gulp.task('fonts:build', function() {
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts))
});

// Забираем шрифты из fontawesome, если есть такая необходимость
gulp.task('fontawesome:build', function() {
    gulp.src(path.src.nodeDir + '/font-awesome/fonts/*.*')
        .pipe(gulp.dest(path.build.fonts));
});

// Забираем файл конфигурации browserconfig
gulp.task('config:build', function() {
    gulp.src(path.src.browserconfig)
        .pipe(gulp.dest(path.build.browserconfig))
});


// Команда gulp build запустит все таски на сборку
gulp.task('build', [
    'html:build',
    'js:build',
    'style:build',
    'image:build',
    'ico:build',
    'fonts:build',
    'fontawesome:build',
    'sprite:build',
    'config:build'
]);

// следим за изменениями файлов
gulp.task('watch', function(){
    watch([path.watch.html], function() {
        gulp.start('html:build');
    });
    watch([path.watch.style], function() {
        gulp.start('style:build');
    });
    watch([path.watch.js], function() {
        gulp.start('js:build');
    });
    watch([path.watch.image], function() {
        gulp.start('image:build');
    });
    watch([path.watch.fonts], function() {
        gulp.start('fonts:build');
    });
    watch([path.watch.browserconfig], function() {
        gulp.start('config:build');
    });
});

// Задаем начальную команду gulp на выполнение тасков и слежение элементов
gulp.task('default', ['build', 'watch', 'webserver'])
