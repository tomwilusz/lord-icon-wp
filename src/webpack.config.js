const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");

module.exports = {
    entry: {
        'element': path.resolve(__dirname, 'element', 'element'),
        'editor': path.resolve(__dirname, 'editor', 'editor'),
    },
    output: {
        filename: 'dist/[name].js',
        path: path.resolve(__dirname, '../'),

    },
    resolve: {
        extensions: [ '.js' ,'.jsx' ],
        modules: [
            path.resolve(__dirname, 'node_modules')
        ]
    },
    module: {
        rules: [
            {
                test: /\.jsx$/,
                use: [    
                    {
                        loader: 'babel-loader',
                    },
                ]
            },
            {
                test: /\.css$/,
                use: [    
                    MiniCssExtractPlugin.loader,
                    {
                        loader: 'css-loader',
                        options: { sourceMap: true },
                    },
                    {
                        loader: "postcss-loader", 
                        options: { sourceMap: true },
                    },
                ]
            },
        ]
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: "dist/[name].css"
        }),
    ],
    optimization: {
        minimizer: [
            new TerserPlugin(),
            new OptimizeCSSAssetsPlugin({}),
        ]
    }
};