import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/index.ts',
  output: {
    file: 'dist/embed-sdk.umd.js',
    format: 'umd',
    name: 'EmbedLoyaltyApp',
    exports: 'named'
  },
  plugins: [resolve(), commonjs(), typescript()]
};