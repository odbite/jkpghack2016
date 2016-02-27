module.exports = {
    html: {
        files: ['<%= navotron.htmlFiles %>'],
        tasks: ['html2js', 'uglify', 'notify:html2js'],
        options: {
            spawn: false,
        },
    },
    scripts: {
        files: ['<%= navotron.jsFiles %>', '<%= navotron.lessFiles %>'],
        tasks: ['jscs',
               'jshint',
               'html2js',
               'ngAnnotate',
               'uglify',
               'bower_concat',
               'less:navotron',
               'concat',
               'clean',
               'notify:jsfiles']
    },
    grunt: {
        files: ['<%= grunt.files %>'],
        tasks: ['jscs']
    }
};
