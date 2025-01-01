const path = require("path");
const glob = require("glob");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { watchFile } = require("fs");

const generateEntryPoints = () => {
  const entries = {};
  const htmlFiles = glob.sync("./src/pages/**/+(index|@)*.html");

  htmlFiles.forEach((htmlFile) => {
    const chunk = path
      .dirname(htmlFile)
      .replace(/\\/g, "/")
      .replace("src/pages/", "");
    // Create corresponding JS entry point that imports the CSS for that page
    entries[chunk] = `./src/pages/${chunk}/index.js`;
  });

  return entries;
};

const generateHtmlPlugins = () => {
  const files = glob.sync("./src/pages/**/index.html");

  return files.map((file) => {
    const chunk = path
      .dirname(file)
      .replace(/\\/g, "/")
      .replace("src/pages/", "");

    // Get the actual filename without path
    const fileName = path.basename(file, ".html");

    // Extract handle from path if it exists
    const handleMatch = chunk.match(/@[^/]+/);
    const handle = handleMatch ? handleMatch[0] : "";

    // Determine if we're in a subdirectory of a handle
    const isSubDirectory = chunk.split("/@")[1]?.includes("/") || false;

    // For subdirectories, remove the subdirectory part for parent links
    const handlePath = isSubDirectory ? `/${handle}` : handle;

    // Determine output filename based on the input filename
    let outputFileName;
    if (chunk === "home" && fileName === "index") {
      outputFileName = "index.html";
    } else if (chunk.includes("/@")) {
      // Handle @username directories - keep them at root level
      const handlePath = chunk.split("/@")[1];
      outputFileName = `@${handlePath}/index.html`;
    } else {
      // All other pages
      outputFileName = `${chunk}/index.html`;
    }

    return new HtmlWebpackPlugin({
      template: file,
      filename: outputFileName,
      chunks: [chunk],
      inject: true,
      templateParameters: {
        handle: handlePath,
      },
    });
  });
};

const plugins = [
  ...generateHtmlPlugins(),
  new MiniCssExtractPlugin({
    filename: (pathData) => {
      // Get the chunk name
      const chunk = pathData.chunk.name;
      return chunk === "home"
        ? "styles.[contenthash].css"
        : `${chunk}/styles.[contenthash].css`;
    },
  }),
];

module.exports = {
  entry: generateEntryPoints(),
  output: {
    filename: (pathData) => {
      // Get the chunk name
      const chunk = pathData.chunk.name;
      return chunk === "home" ? "bundle.js" : `${chunk}/bundle.js`;
    },
    path: path.resolve(__dirname, "dist"),
    assetModuleFilename: "images/[hash][ext][query]",
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
      {
        test: /\.ico$/,
        type: "asset/resource",
        generator: {
          filename: "favicon.ico", // Output directly to root
        },
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: "asset/resource",
      },
    ],
  },
  plugins,
  optimization: {
    minimizer: [
      // For webpack@5 you can use the `...` syntax to extend existing minimizers (i.e. `terser-webpack-plugin`), uncomment the next line
      `...`,
      new CssMinimizerPlugin(),
    ],
  },
  devServer: {
    static: "./dist",
    watchFiles: {
      paths: ["./src/pages/**/*"],
      options: {
        usePolling: false,
      },
    },
    hot: true,
    liveReload: true,
    port: 3000,
    historyApiFallback: {
      rewrites: [
        // For the home page
        { from: /^\/$/, to: "/index.html" },

        // For @handle URLs with .html
        {
          from: /^\/@[^/]+\.html$/,
          to: (context) =>
            `${context.parsedUrl.pathname.replace(".html", "")}/index.html`,
        },

        // For @handle URLs without .html
        {
          from: /^\/@[^/]+$/,
          to: (context) => `${context.parsedUrl.pathname}/index.html`,
        },

        // For other pages
        {
          from: /^\/[^@][^/]+$/,
          to: (context) => `${context.parsedUrl.pathname}/index.html`,
        },
      ],
    },
  },
};
