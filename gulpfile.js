// TODO Refactor build script

var gulp = require('gulp'),
    umd = require('gulp-umd'),
    concat = require('gulp-concat'),
    util = require('gulp-util'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    rename = require("gulp-rename");

var buildConfig = {
    browser: {
        device: {
            files: [
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
            exports: 'DHDevice',
            jquery: {
                files: [
                    './src/core/jquery.js',
                    './src/core/utils/jquery.js',
                    './src/device/jquery.js'
                ],
                exports: 'JqDHDevice'
            }
        },
        client: {
            files: [
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
            exports: 'DHClient',
            jquery: {
                files: [
                    './src/core/jquery.js',
                    './src/core/utils/jquery.js',
                    './src/client/jquery.js'
                ],
                exports: 'JqDHClient'
            }
        }
    },
    node: {
        '*': {
            files: [
                './src/core/utils/utils.js',
                './src/core/utils/events.js',
                './src/core/transport/http/http.js',
                './src/core/transport/ws/browser.js',
                './src/core/transport/ws/ws.js',
                './src/core/api/rest.js',
                './src/core/devicehive.js',
                './src/core/subscription.js',
                './src/core/channels/longpolling.js',
                './src/core/transport/longpolling.js',
                './src/core/api/ws/client.js',
                './src/core/api/ws/device.js',
                './src/client/channels/*.js',
                './src/device/channels/*.js',
                './src/client/client.js',
                './src/device/device.js',
                './src/core/node.js'
            ],
            exports: 'Main'
        }
    }
};

function build(config, platform, type, subtype) {
    var fileName = type === '*' ? 'devicehive.js' : 'devicehive.' + type + (subtype ? '.' + subtype : '') + '.js';

    gulp.src(config.files)
        .pipe(concat(fileName))
        .pipe(umd({
            exports: function (file) {
                return config.exports;
            },
            namespace: function (file) {
                return config.exports;
            }
        }))
        .pipe(gulp.dest('./build/' + platform + '/'));

    if (platform == 'browser' && subtype !== 'jquery') {
        build(config.jquery, 'browser', type, 'jquery');
    }
}

function buildByPlatform(platform) {
    var platformConfig = buildConfig[platform];
    for (var type in platformConfig) {
        build(platformConfig[type], platform, type);
    }
}

function buildAll() {
    for (var platform in buildConfig) {
        buildByPlatform(platform);
    }
}

//usage: gulp build --platform {{platform}} --type {{type}} (device/client)
gulp.task('build', function () {
    if (!util.env.type && !util.env.platform) {
        buildAll();
    } else {
        var type = util.env.type,
            platform = util.env.platform || "browser";

        if (!type) {
            return buildByPlatform(platform);
        }

        build(buildConfig[platform][type], platform, type);
    }
});

gulp.task('buildall', buildAll);

gulp.task('compress', function () {
    return gulp.src('./build/browser/**/*[!.min].js')
        .pipe(uglify())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('./build/browser'));
});

gulp.task('lint', function () {
    return gulp.src('./build/**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter(function (results, data, opts) {
            var len = results.length,
                str = '',
                file, error, globals, unuseds;

            results.forEach(function (result) {
                file = result.file;
                error = result.error;
                str += file + ': line ' + error.line + ', col ' +
                    error.character + ', ' + error.reason;

                // Add the error code if the --verbose option is set
                if (opts.verbose) {
                    str += ' (' + error.code + ')';
                }

                str += '\n';
            });

            str += len > 0 ? ("\n" + len + ' error' + ((len === 1) ? '' : 's')) : "";

            data.forEach(function (data) {
                file = data.file;
                globals = data.implieds;
                unuseds = data.unused;

                if (globals || unuseds) {
                    str += '\n\n' + file + ' :\n';
                }

                if (globals) {
                    str += '\tImplied globals:\n';
                    globals.forEach(function (global) {
                        str += '\t\t' + global.name + ': ' + global.line + '\n';
                    });
                }
                if (unuseds) {
                    str += '\tUnused Variables:\n\t\t';
                    unuseds.forEach(function (unused) {
                        str += unused.name + '(' + unused.line + '), ';
                    });
                }
            });

            if (str) {
                console.log(str + "\n");
            }
        }));
});


gulp.task('watch', function () {
    gulp.watch('./src/**', ['build']);
});

gulp.task('dev', ['build', 'watch']);

gulp.task('default', ['build']);
