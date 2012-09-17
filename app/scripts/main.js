require.config({
  shim: {
    keymaster: {
        exports: 'key'
    }
  },

 paths: {
    sylvester: 'vendor/sylvester',
    keymaster: 'vendor/keymaster.min',
    jquery: 'vendor/jquery.min',
    lodash: 'components/lodash/lodash.min'
  }
});
 
require(['app'], function(app) {
  // use app here
});