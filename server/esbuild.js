require('esbuild').build({
  entryPoints: ['./index.ts'],
  bundle: true,
  platform: 'node',
  outdir: '../build',
  target: 'node16',
  external: ['epaperjs'],
}).catch(() => process.exit(1));
