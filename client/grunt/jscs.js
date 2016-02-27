// Rule list https://github.com/jscs-dev/node-jscs

module.exports = {
    options: {
        validateIndentation: 4,
        validateParameterSeparator: ', ',
        requireSpaceBeforeBlockStatements: true,
        requireSpacesInFunctionExpression: {
            beforeOpeningCurlyBrace: true
        },
        disallowSpacesInFunctionExpression: {
            beforeOpeningRoundBrace: true
        },
        requireBlocksOnNewline: true,
        requireSpaceBeforeObjectValues: true,
        requireCommaBeforeLineBreak: true,
        // requireCamelCaseOrUpperCaseIdentifiers: false,
        disallowTrailingWhitespace: true,
        // requireTrailingComma: {
        //     ignoreSingleValue: true
        // },
        requireLineFeedAtFileEnd: true,
        disallowNewlineBeforeBlockStatements: true,
        requireCurlyBraces: [
            "if",
            "else",
            "for",
            "while",
            "do",
            "try",
            "catch",
            "case",
            "default"
        ],
    },
    myApp: {
        src: ['<%= navotron.checkFiles %>'],
    },
    grunt: {
        src: ['<%= grunt.files %>'],
    }
};
