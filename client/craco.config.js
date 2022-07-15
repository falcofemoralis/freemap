/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */
const CracoAlias = require('craco-alias');

module.exports = {
  babel: {
    loaderOptions: {
      ignore: ['./node_modules/mapbox-gl/dist/mapbox-gl.js']
    }
  },
  plugins: [
    {
      plugin: CracoAlias,
      options: {
        source: 'tsconfig',
        baseUrl: './src',
        tsConfigPath: './tsconfig.paths.json'
      }
    }
  ]
};
