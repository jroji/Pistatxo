'use strict';

var pistachio = new Pistachio({
  id: 'app-test',
  template: '/main.template.html',
  bindings: {
    'name': {
      value: 'Perro'
    },
    'test': {
      value: 'Compañero'
    }
  }
});