const path = require('path')
const rules = require('./webpack.rules')
const plugins = require('./webpack.plugins')
const webpack = require('webpack')
const HtmlWebPackPlugin = require('html-webpack-plugin')
const { spawn } = require('child_process')

/** @type {webpack.Configuration} */
module.exports = {
    devtool: 'source-map',
    entry: path.join(__dirname, '../', 'src', 'renderer.tsx'),
    target: 'web',
    module: {
        rules: [
            ...rules,
            {
                test: /\.css$/,
                use: [
                    'style-loader', 
                    'css-loader',
                    'postcss-loader'
                ],
            }, {
                test: /\.(ttf|eot|woff|woff2|svg)$/,
                use: {
                    loader: 'file-loader',
                    options: {
                        name: '[contenthash].[ext]',
                        outputPath: 'fonts',
                    }
                }
            }
        ]
    },
    resolve: {
        extensions: ['.js', '.ts', '.jsx', '.tsx', '.css']
    },
    output: {
        path: path.resolve(__dirname, '../', '.webpack', 'renderer'),
        filename: 'index.js',
    },
    plugins: [
        ...plugins,
        new HtmlWebPackPlugin({
            template: path.join(__dirname, '../', 'public', 'index.html')
        }),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
        })
    ],
    devServer: {
        contentBase: path.resolve(__dirname, '../', '.webpack', 'renderer'),
        stats: 'minimal',
        overlay: true,
        port: 8080,
        before() {
            spawn(
                'electron',
                ['.'],
                { shell: true, env: process.env, stdio: 'inherit' }
            )
            .on('close', code => process.exit(code))
            .on('error', spawnError => console.error(spawnError))
        },
    },
}