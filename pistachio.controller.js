'use strict';

var pistachio = new Pistachio({
  id: 'app-test',
  template: '/secondary.template.html',
  properties: {
    'title': {
      value: 'Cabecera'
    },
    'subtitle': {
      value: 'Probando distintas cab'
    }
  },
  pipes:{
    changeString: function (x) {
      return x + "HOLA";
    }
  },
  connectedCallback: () => {
    alert("Connected!");
  }
});