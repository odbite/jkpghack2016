module.exports = function(grunt) {
    return {
        all: {
            dest: '<%= navotron.dist.bowerjs %>',
            cssDest: '<%= navotron.dist.bowercss %>',
            bowerOptions: {
                relative: false
            },
            mainFiles: {
                'html5-boilerplate': ['css/normalize.css']
            },
            exclude: [
                'angular-mocks',
            ],
            callback: function(mainFiles, component) {
                var result = [];

                for ( var i=0; i < mainFiles.length; i++ ) {
                    var min = mainFiles[i].replace(/\.js$/, '.min.js');
                    result.push(grunt.file.exists(min) ? min : mainFiles[i]);
                }

                return result;
            }
        },
        dev: {
            dest: '<%= navotron.dist.bowerdevjs %>',
            bowerOptions: {
                relative: false
            },
            mainFiles: {
                'html5-boilerplate': ['css/normalize.css']
            },
            exclude: [
                'angular-mocks',
            ],
        }
    }
}
