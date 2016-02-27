module.exports = {
    navotron: {
        options: {
            compress: true,
        },
        files: {
            "<%= navotron.dist.css %>": "<%= navotron.lessFiles %>",
            "<%= navotron.dist.finalcss %>": ["<%= navotron.lessFiles %>", "<%= navotron.dist.bowercss %>"],
        }
    }
}
