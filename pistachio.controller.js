'use strict';

var pistachio = new Pistachio({
  id: 'app',
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

var comp = new Pistachio({
  id: 'andres',
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
