module.exports = {
    chainWebpack: (config) => {
        if (process.env.BUILD_VIEWER) {
            config.entryPoints.delete('app');
            config.entry('viewer').add('./src/viewer.ts').end();
            config.output.filename('[name].js')
            config.plugins.delete('html');
            config.plugins.delete('preload');
            config.plugins.delete('prefetch');
            config.plugins.delete('copy');
        }
    },
    ...(() => {
        // Editor
        if (!process.env.BUILD_VIEWER) return {
            outputDir: './dist/editor',
        };
        // VIEWER
        return {
            outputDir: './dist/viewer',
            productionSourceMap: false,
            css: {
                extract: false,
            },
            configureWebpack: {
                optimization: {
                    splitChunks: false,
                }
            }

        }
    })(),
}