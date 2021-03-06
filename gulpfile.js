'use strict';

var gulp = require('gulp'),
    mocha = require('gulp-mocha'),
    argv = require('yargs').argv,
    env = require('gulp-env'),
//    lazypipe = require('lazypipe'),
    jshint = require('gulp-jshint'),
    gutil = require('gulp-util'),
    istanbul = require('gulp-istanbul'),
    del = require('rimraf'),
    _ = require('lodash');
//    utils = require('packages/system/server/config/util'),
//    glob = require('glob');

//var util = require('util');

var pkg = argv.pkg || '*';

var paths = {
    lib: ['lib/**/*.js'],
    jsPublic: [],
    jsTestuPkg: ['tests/**/*.js'],
    jsTestiPkg: [],
    scssPkg: [],
    scssCommonPkg: [],
    css : [],
    html : []
};

var environment;

var beep = function(){
    gutil.beep();
};

gulp.task('default', ['testu']);

var setEnv = function (newEnv) {
    env({
        vars: {
            NODE_ENV: newEnv,
            NODE_PATH: '.',
            LOG4JS_CONFIG: 'log4js.json'
        }
    });
    environment = newEnv;
};

gulp.task('env-dev', function () {
    setEnv('development');
});

gulp.task('env-test', function () {
    setEnv('test');
});

gulp.task('watchTestu', function () {
    gulp.watch(_.union(paths.lib, paths.jsTestuPkg), ['jshintTestu', 'mochaTestu']);
});

gulp.task('watchCoverage', function () {
    gulp.watch(_.union(paths.lib, paths.jsTestuPkg), ['jshintTestu', 'openCoverage']);
});

gulp.task('jshintServer', function(){
    return gulp.src(paths.lib)
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(jshint.reporter('fail'))
    .on('error',  beep);
});

gulp.task('jshintTestu', function(){
    return gulp.src(_.union(paths.lib, paths.jsTestuPkg))
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(jshint.reporter('fail'))
    .on('error', beep);
});

gulp.task('mochaTestu', function () {
    console.log('Starting testu for module : "%s"', pkg);
    return gulp.src('./tests/**/*.js', {
            read: false
        })
        .pipe(mocha({
            reporter: 'spec',
//            require: './server.js',
            delay: false,
            timeout: 10000
        }))
        .on('error', beep) ;
});

gulp.task('instanbul-pre-test', function(){
    return gulp.src(paths.jsServer)
        .pipe(istanbul({ includeUntested : true }))
        .pipe(istanbul.hookRequire());
});

gulp.task('startCoverage', ['instanbul-pre-test'], function(){
    return gulp.src('./tests/**/*.js')
    .pipe(mocha({timeout : 10000, delay : false, /*require: './server.js',*/ reporter: 'spec'}))
    .on('error', beep)
    .pipe(istanbul.writeReports({
        dir : './coverage',
        reporters : [ 'lcov' ],
        reportOpts : { dir : './coverage' }
    }));
});

gulp.task('openCoverage', ['cleanCoverage', 'startCoverage'], function(){
    require('child_process').exec('start ./coverage/lcov-report/index.html', function (err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
  });
});

gulp.task('cleanCoverage', function(done){
    del('./coverage/', done);
});

gulp.task('testu', ['env-test', 'mochaTestu', 'watchTestu'], function () {});
gulp.task('coverage', ['env-test', 'openCoverage'], function() {});
