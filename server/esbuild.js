require('esbuild').build({
  entryPoints: ['./index.ts'],
  bundle: true,
  platform: 'node',
  outdir: '../build',
  target: 'node14',
  external: ['sharp', 'paperjs'],
}).catch(() => process.exit(1));
