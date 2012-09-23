require.config({
  shim: {
    keymaster: {
        exports: 'key'
    }
  },

 paths: {
    'gl-matrix': 'vendor/gl-matrix-min',
    jquery: 'vendor/jquery.min',
    lodash: 'components/lodash/lodash.min'
  }
});
 
require(['app'], function(app) {
  // use app here
});