module.exports = {
    entry: ["./src/entry.js"],
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                /* runtime is needed to include core-js shims and regenerator runtime */
                loader: 'babel-loader?optional=runtime'
            }
        ]
    },
    output: {
        path: __dirname,
        filename: "bundle.js"
    }
};