'use strict';

var pistachio = Pistachio({
  id: 'app-test',
  template: '/secondary.template.html',
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
    setInterval(() => {
      this.setAttribute("subtitle", Math.random());
    }, 1);
  }
});
