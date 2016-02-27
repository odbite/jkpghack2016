module.exports = {
    options: {
        htmlmin: {
            collapseWhitespace: true,
        },
        base: 'app',
        module: 'navotron.templates'
    },
    myApp: {
        src: ['<%= navotron.htmlFiles %>'],
        dest: '<%= navotron.dist.templates %>'
    }
};
