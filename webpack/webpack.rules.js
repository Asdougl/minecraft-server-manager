module.exports = [
    {
        test: /\.tsx?$/,
        use: [
            {
                loader: 'ts-loader',
                options: {
                    transpileOnly: true
                }
            }
        ],
        exclude: /node_modules/,
    }, {
        test: /\.(png|jpe?g|gif|ico)$/i,
        use: {
            loader: 'file-loader',
            options: {
                name: '[contenthash].[ext]',
                outputPath: 'images',
            }
        }
    }
]