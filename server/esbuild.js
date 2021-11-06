const nativeNodeModulesPlugin = {
  name: 'native-node-modules',
  setup(build) {
    build.onResolve({ filter: /\.node$/, namespace: 'file' }, args => ({
      path: require.resolve(args.path, { paths: [args.resolveDir] }),
      namespace: 'node-file',
    }));

    build.onLoad({ filter: /.*/, namespace: 'node-file' }, args => ({
      contents: `
        import path from ${JSON.stringify(args.path)}
        try { module.exports = require(path) }
        catch {}
      `,
    }));

    build.onResolve({ filter: /\.node$/, namespace: 'node-file' }, args => ({
      path: args.path,
      namespace: 'file',
    }));

    let opts = build.initialOptions;
    opts.loader = opts.loader || {};
    opts.loader['.node'] = 'file';
  },
};

require('esbuild').build({
  entryPoints: ['./index.ts'],
  bundle: true,
  platform: 'node',
  outdir: '../build',
  target: 'node16',
  plugins: [
    nativeNodeModulesPlugin,
  ],
}).catch(() => process.exit(1));
