const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')

module.exports = [
    new CleanWebpackPlugin(),
    new ForkTsCheckerWebpackPlugin(),
]