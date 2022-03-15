const path = require('path')
const nodeExternals = require('webpack-node-externals')

module.exports = {
    entry: './build/src/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'index.js',
        "publicPath": '/',
    },
    resolve: {
        extensions: ['.js']
    },
    externals: [nodeExternals()],
    module: {
        rules: [
            {
                test: /\.(js)$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader"
                },
            }
        ]
    }
}