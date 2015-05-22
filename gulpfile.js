var gulp = require('gulp'),
    umd = require('gulp-umd'),
    concat = require('gulp-concat'),
    util = require('gulp-util'),
    uglify = require('gulp-uglify'),
    rename = require("gulp-rename"),
    mocha = require('gulp-mocha');

var config = {
    "browser": {
        "device": {
            "files": [
                './src/core/utils/utils.js',
                './src/core/utils/events.js',
                './src/core/transport/http/xhr.js',
                './src/core/api/rest.js',
                './src/core/devicehive.js',
                './src/core/subscription.js',
                './src/core/channels/longpolling.js',
                './src/core/transport/longpolling.js',
                './src/core/transport/ws/browser.js',
                './src/core/api/ws/client.js',
                './src/core/api/ws/device.js',
                './src/device/channels/*.js',
                './src/device/device.js'
            ],
            "exports": 'DHDevice',

        },
        "device.jquery": {
            "files": [
                './src/core/jquery.js',
                './src/core/utils/jquery.js',
                './src/device/jquery.js'
            ],
            "exports": 'JqDHDevice'
        },
        "client": {
            "files": [
                './src/core/utils/utils.js',
                './src/core/utils/events.js',
                './src/core/transport/http/xhr.js',
                './src/core/api/rest.js',
                './src/core/devicehive.js',
                './src/core/subscription.js',
                './src/core/channels/longpolling.js',
                './src/core/transport/longpolling.js',
                './src/core/transport/ws/browser.js',
                './src/core/api/ws/client.js',
                './src/client/channels/*.js',
                './src/client/client.js'
            ],
            "exports": 'DHClient',

        },
        "client.jquery": {
            "files": [
                './src/core/jquery.js',
                './src/core/utils/jquery.js',
                './src/client/jquery.js'
            ],
            "exports": 'JqDHClient'
        }
    },
    "node": {
        '*': {
            "files": [
                './src/core/utils/utils.js',
                './src/core/utils/events.js',
                './src/core/transport/http/http.js',
                './src/core/transport/ws/browser.js',
                './src/core/transport/ws/ws.js',
                './src/core/transport/longpolling.js',
                './src/core/api/rest.js',
                './src/core/api/ws/client.js',
                './src/core/api/ws/device.js',
                './src/core/subscription.js',
                './src/core/devicehive.js',
                './src/core/channels/longpolling.js',
                './src/client/channels/*.js',
                './src/device/channels/*.js',
                './src/client/client.js',
                './src/device/device.js',
                './src/core/node.js'
            ],
            "exports": 'Main'
        }
    }
};

function build(config, platform, lib) {
    var fileName = lib === '*' ? 'devicehive.js' : 'devicehive.' + lib + '.js';

    var modularize = umd({
        exports: function (file) {
            return config.exports;
        },
        namespace: function (file) {
            return config.exports;
        }
    });

    return gulp.src(config.files)
        .pipe(concat(fileName))
        .pipe(modularize)
        .pipe(gulp.dest('./build/' + platform + '/'));
}

function resolvePlatformTaskName(platform) {
    return 'build.' + platform;
}

function resolveLibTaskName(platform, lib) {
    return resolvePlatformTaskName(platform) + '.' + lib;
}


// create all platform and library tasks
// each platform task can be started with the script
//
// $ gulp build.[platform]
// e.g.
// $ gulp build.browser
//
// each library task can be started with
//
// $ gulp build.[platform].[library]
// e.g.
// $ gulp build.browser.client.jquery
//
var platformTaskNames = [];
for (var platform in config) {
    var platformConfig = config[platform],
        libTaskNames = [];

    for (var lib in platformConfig) {
        var libConfig = platformConfig[lib],
            taskName = resolveLibTaskName(platform, lib);

        // create library task
        gulp.task(taskName, build.bind(undefined, libConfig, platform, lib));
        libTaskNames.push(taskName);
    }

    // create task for entire platform which depends on all library tasks
    var platformTaskName = resolvePlatformTaskName(platform);
    gulp.task(platformTaskName, libTaskNames);
    platformTaskNames.push(platformTaskName);
}

// create main build task which depends on all platform tasks
gulp.task('build', platformTaskNames);
gulp.task('test', function () {
    return gulp.src('./test/*.js', {read: false})
        .pipe(mocha({ }));
});

gulp.task('compress', ['build.browser'], function () {
    return gulp.src('./build/browser/**/*[!.min].js')
        .pipe(uglify())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('./build/browser'));
});

gulp.task('default', ['build', 'test', 'compress']);

gulp.task('watch', function () {
    return gulp.watch('./src/**', ['default']);
});
