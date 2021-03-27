const path = require('path')
const rules = require('./webpack.rules')
const plugins = require('./webpack.plugins')
const webpack = require('webpack')

/** @type {webpack.Configuration} */
module.exports = {
    devtool: 'eval-source-map',
    entry: {
        main: path.join(__dirname, '../', 'app', 'main.ts'),
        preload: path.join(__dirname, '../', 'app', 'preload.ts')
    },
    target: 'electron-main',
    module: {
        rules: [
            ...rules,
            {
                test: /\.node$/,
                use: 'node-loader'
            }
        ]
    },
    resolve: {
        extensions: ['.js', '.ts', '.jsx', '.tsx', '.json'],
    },
    output: {
        path: path.resolve(__dirname, '../', '.webpack', 'main'),
        filename: '[name].js'
    },
    plugins: [
        ...plugins,
    ],
}