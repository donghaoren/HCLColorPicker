module.exports = {
    entry: {
        app: "./dist/app.js"
    },
    output: {
        filename: "[name].bundle.js",
        path: __dirname + "/dist"
    },
    externals: {
        "react": "React",
        "react-dom": "ReactDOM"
    },
};