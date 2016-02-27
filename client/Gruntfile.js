module.exports = function(grunt) {

    require('time-grunt')(grunt);

    require('load-grunt-config')(grunt, {
        data: {
            navotron: {
                dist: {
                    templates: 'app/dist/app-templates.js',
                    general: 'app/dist/app.js',
                    minified: 'app/dist/app.min.js',
                    css: 'app/dist/app.min.css',

                    bowerjs: 'app/dist/bower.js',
                    bowerdevjs: 'app/dist/bower.dev.js',
                    bowercss: 'app/dist/bower.css',

                    finaljs: 'app/dist/main.min.js',
                    finalcss: 'app/dist/main.min.css',
                },
                htmlFiles: [
                    'app/js/**/*.html',
                    'app/js/**/*.jade',
                    'app/js/**/*.tpl',
                ],
                jsFiles: [
                    'app/js/**/*.js',
                    '!app/js/**/test_*.js'
                ],
                checkFiles: [
                    'app/js/**/*.js',
                    '!app/js/datadef.js',
                    '!app/js/**/ts_*.js',
                ],
                lessFiles: [
                    'app/js/**/*.less',
                ]
            },
            grunt: {
                files: ['Gruntfile.js', 'grunt/*.js'],
            }
        }
    });

    grunt.registerTask('default', ['jscs',
                                   'jshint',
                                   'html2js',
                                   'ngAnnotate',
                                   'uglify',
                                   'bower_concat',
                                   'less:navotron',
                                   'concat',
                                   'clean']);
};
