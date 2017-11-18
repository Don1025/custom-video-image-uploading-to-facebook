'use strict';
var gulp = require('gulp'),
	watch = require('gulp-watch'),
	runSequence = require('run-sequence'),
	clean = require('gulp-clean'),
	changed = require('gulp-changed'),
	server = require('gulp-develop-server'),
	browserSync = require('browser-sync'),
	reload = browserSync.reload,
	concat = require('gulp-concat'),
	minifyCss = require('gulp-minify-css'),
	uglify = require('gulp-uglify'),
	autoprefixer = require('gulp-autoprefixer'),
	imagemin = require('gulp-imagemin'),
	pngquant = require('imagemin-pngquant'),
	jshint = require('gulp-jshint');

gulp.task('serve', function () {
	server.listen( { path: './server.js' } );
});

// livereload browser on client app changes
gulp.task('livereload', ['serve'], function(){
	browserSync( {
	   proxy: "localhost:3800"
	});
});

gulp.task('img-min', function () {
	gulp.src('public/img/*', {read: false}).pipe(clean());
	gulp.src('src/img/**/*')
    .pipe(imagemin({
        progressive: true,
        svgoPlugins: [{removeViewBox: false}],
        use: [pngquant()]
    }))
    .pipe(gulp.dest('./public/img'));
});

gulp.task('js', function () {
	gulp.src('public/js/all.js', {read: false}).pipe(clean());
	gulp.src('public/js/src/**/*.js')
	.pipe(jshint())
  	.pipe(jshint.reporter('default'))
	.pipe(uglify())
	.pipe(concat('all.js'))
	.pipe(gulp.dest('./public/js'));
});

gulp.task('css', function () {
	gulp.src('public/css/all.css', {read: false}).pipe(clean());
	gulp.src('public/css/app.css')
	.pipe(autoprefixer({
        browsers: ['last 2 versions'],
        cascade: false
    }))
	.pipe(minifyCss())
	.pipe(concat('all.css'))
	.pipe(gulp.dest('./public/css'));
});

gulp.task('del', function () {
	return gulp.src(['public/js/all.js', 'public/css/all.css'], {read: false}).pipe(clean());
});

gulp.task('watch', ['livereload'], function () {
	watch(['views/index.html'], function(){
		console.log('restarting browsers');
		reload();
	});
	watch(['public/css/app.css'], function(){
		gulp.run('css');
		console.log('restarting browsers');
		reload();
	});
	watch(['public/js/src/**/*.js'], function(){
		gulp.run('js');
		console.log('restarting browsers');
		reload();
	});
	watch(['server.js', 'model/**/*.js', 'routes/**/*.js'], function(){
		server.restart();
		reload();
		console.log('restarting server');
	});
	console.log('watch started');
});

gulp.task('build', ['del'], function(cb) {
    return runSequence('css', 'js', cb);
});

gulp.task('default', ['build'], function() {
    return gulp.start('watch');
});
