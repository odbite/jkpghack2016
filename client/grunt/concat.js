module.exports = {
    options: {
        separator: ' ',
    },
    dist: {
        src: ['<%= navotron.dist.bowerjs %>', '<%= navotron.dist.minified %>'],
        dest: '<%= navotron.dist.finaljs %>',
    },
}
