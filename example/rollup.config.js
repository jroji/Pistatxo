import babel from 'rollup-plugin-babel';
import html from 'rollup-plugin-html';

export default {
  entry: 'app/pistachio.controller.js',
  dest: 'build/pistachio.controller.js',
  format: 'iife',
  sourceMap: 'inline',
  plugins: [
    babel({
      exclude: 'node_modules/**',
    }),
    html({
      include: 'app/*.html',
      htmlMinifierOptions: {
        collapseWhitespace: true,
        collapseBooleanAttributes: true,
        conservativeCollapse: true,
        minifyJS: true
      }
    })
  ]
};