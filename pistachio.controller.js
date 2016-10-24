console.log(Pistachio)
Pistachio.component({
  template: '/main.template.html',
  bindings: {
    'name': {
      value: 'Hola'
    },
    'test': {
      value: 'Hey'
    }
  }
});