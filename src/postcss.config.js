let mode = null;
if (process.argv.indexOf('--mode') !== -1) {
    const index = process.argv.indexOf('--mode');
    mode = process.argv[index+1];
}

module.exports = {
    plugins: {
        'postcss-import': {
            path: ["assets/css"],
        },
        'precss': {},
        'postcss-functions': {
            functions: {
                mathMinus: function (a, b) {
                    return parseFloat(a) - parseFloat(b);
                },
                mathMultiply: function (a, b) {
                    return parseFloat(a) * parseFloat(b);
                },
            },
        },
        'postcss-units': {},
        'postcss-color-function': {},
        'cssnano': mode=='production' ? {} : false,
    }
}
