const path = require('path');
const glob = require('glob');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const generateEntryPoints = () => {
    const entries = {};
    const htmlFiles = glob.sync('./src/pages/**/index.html');
    
    htmlFiles.forEach(htmlFile => {
        const chunk = path.dirname(htmlFile)
            .replace(/\\/g, '/')
            .replace('src/pages/', '');
        // Create corresponding JS entry point that imports the CSS for that page
        entries[chunk] = `./src/pages/${chunk}/index.js`;
    });
    
    return entries;
};

const generateHtmlPlugins = () => {
    const files = glob.sync('./src/pages/**/index.html');
    
    return files.map(file => {
        const chunk = path.dirname(file)
            .replace(/\\/g, '/')
            .replace('src/pages/', '')

        return new HtmlWebpackPlugin({
            template: file,
            filename: chunk === 'home' ? 'index.html' : `${chunk}/index.html`,
            chunks: [chunk],
            inject: true
        })
    })
}

module.exports = {
    entry: generateEntryPoints(),
    output: {
        filename: (pathData) => {
            // Get the chunk name
            const chunk = pathData.chunk.name;
            return chunk === 'home' ? 'bundle.js' : `${chunk}/bundle.js`;
        },
        path: path.resolve(__dirname, 'dist'),
    },
    module: {
        rules: [
            {
            test: /\.css$/i,
            use: [MiniCssExtractPlugin.loader, 'css-loader'],
            },
        ],
    },
    plugins: [
        ...generateHtmlPlugins(),
        new MiniCssExtractPlugin({
            filename: (pathData) => {
                // Get the chunk name
                const chunk = pathData.chunk.name;
                return chunk === 'home' ? 'styles.css' : `${chunk}/styles.css`;
            },
            }),
       
        ],
    optimization: {
        minimizer: [
        // For webpack@5 you can use the `...` syntax to extend existing minimizers (i.e. `terser-webpack-plugin`), uncomment the next line
        `...`,
        new CssMinimizerPlugin(),
        ],
    },
    devServer: {
        static: './dist',
        hot: true,
        port: 3000
        }
};