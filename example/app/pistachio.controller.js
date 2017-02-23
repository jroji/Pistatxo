'use strict';

import Pistachio from '../../src/pistachio.ec6';

var app = Pistachio({
  id: 'app-test',
  template: '../app/template.html',
  properties: {
    'title': {},
    'subtitle': {
      value: 'Probando distintas cab'
    }
  },
  pipes:{
    changeString: (x) => {
      return x + "HOLA";
    }
  },
  connectedCallback: function() {
  }
});
