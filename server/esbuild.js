require('esbuild').build({
  entryPoints: ['./index.ts'],
  bundle: true,
  platform: 'node',
  outdir: '../build',
  target: 'node16',
  external: ['sharp'],
}).catch(() => process.exit(1));
