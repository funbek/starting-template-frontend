'use strict';

const gulp = require('gulp');
const watch = require('gulp-watch'); //следит за изменениями файлов
const uglify = require('gulp-uglify'); //компилирует js
const sass = require('gulp-sass'); //компилятор sass
const sourcemaps = require('gulp-sourcemaps'); //map для sass
const rigger = require('gulp-rigger'); // Позволяет вставлять шаблоны простой конструкцией
const imagemin = require('gulp-imagemin'); //оптимизация изображений
const pngquant = require('imagemin-pngquant'); //оптимизация изображений png
const imageminJpegtran = require('imagemin-jpegtran'); //оптимизация изображений jpg
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
const notify = require('gulp-notify'); // Обработка ошибок и вывод их в симпотичном виде
const plumber =require('gulp-plumber');
const htmlmin =require('gulp-htmlmin'); // Очистка html
const removeHtmlComments = require('gulp-remove-html-comments'); // remove comments
const reload = browserSync.reload;

// устанавливаем значение глобальной переменной,
// позволяющей различать в тасках development & production окружения
// global.devBuild = process.env.NODE_ENV !== 'production';

// Прописываем пути
const path = {
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

// Переключаем сборку на dev или prod
const mode = require('gulp-mode')({
  modes: ["prod", "dev"],
  default: "dev",
  verbose: false
});

// настройки dev сервера
const config = {
	server: {
		baseDir: "build"
	},
	tunnel: false,
	host: 'localhost',
	port: 3000,
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
gulp.task('html:build', ['compress'], function () {
	gulp.src(path.src.html) //Выбирем файлы по нужному пути
		.pipe(wiredep({})) // Забираем файлы из bower_components
		.pipe(useref()) // Объединяем все файлы в один
		.pipe(rigger()) //Использование одного файла в другом
		.pipe(removeHtmlComments()) // Удаляем комментарии
		.pipe(gulp.dest(path.build.html)) //Выплюнем их в папку build
		// .pipe(reload({stream: true})); //И перезагрузим наш сервер для обновлений
});

gulp.task('compress:css', function() {
	gulp.src(path.build.css + '/combined.css')
		.pipe(sass({
		  outputStyle: 'compressed' // Обрабатываем sass и сжимаем его
		}))
		.pipe(gulp.dest(path.build.css))
})

gulp.task('compress:js', function() {
	gulp.src(path.build.js + '/combined.js')
		.pipe(uglify())
		.pipe(gulp.dest(path.build.js))
})

// сборка js
gulp.task('js:build', function () {
	gulp.src(path.src.js) //Найдем наш main файл
		.pipe(plumber({ // Добавляет в поток pipe onError
		  errorHandler: notify.onError(function(err) { // Обрабатываем ошибки и отображаем их
			return {
			  title: 'JavaScript',
			  message: err.message
			};
		  })
		}))
		.pipe(uglify()) //Сожмем наш js
		.pipe(gulp.dest(path.build.js)) //Выплюнем готовый файл в build
		.pipe(reload({stream: true})); //И перезагрузим наш сервер для обновлений
});

// сборка css
gulp.task('style:build', function () {
	gulp.src(path.src.style) //Выберем наш main.scss
		.pipe(plumber({ // Добавляет в поток pipe onError
		  errorHandler: notify.onError(function(err) { // Обрабатываем ошибки и отображаем их
			return {
			  title: 'Styles',
			  message: err.message
			};
		  })
		}))
		.pipe(sourcemaps.init()) // Инициализируем карту
		.pipe(sass({
		  outputStyle: 'compressed' // Обрабатываем sass и сжимаем его
		}))
		.pipe(autoprefixer( {
			browsers: ["last 20 version", "> 1%", "ie 8", "ie 7"], cascade: false
		}))
		// .pipe(uncss({
		//     html: [path.src.cleanHtml] // Убираем неиспользуемые стили (проверяем по всем файлам с расширением html)
		// }))
		.pipe(sourcemaps.write('.')) // Записываем карту
		.pipe(gulp.dest(path.build.css)) //И в build
		.pipe(reload({stream: true})); //И перезагрузим наш сервер для обновлений
});


// сборка картинок
gulp.task('image:build', function () {
	gulp.src(path.src.image) //Выберем наши картинки
		.pipe(imagemin({
			interlaced: true,
			progressive: true,
			optimizationLevel: 5,
			svgoPlugins: [{removeViewBox: false}],
			use: [
				pngquant(),
				imageminJpegtran()
			]
			// verbose: true
		}))
		.pipe(gulp.dest(path.build.image)) //И бросим в build
});

// сборка спрайтов
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

gulp.task('compress', [
	'compress:css',
	'compress:js'
])

// следим за изменениями файлов
gulp.task('watch', function(){
	watch([path.watch.html], function() {
		gulp.start('html:build');
	});
	watch([path.watch.style], function() {
		gulp.start('compress:css');
	});
	watch([path.watch.style], function() {
		gulp.start('compress:js');
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
gulp.task('default', ['build', 'watch', 'compress', 'webserver'])
