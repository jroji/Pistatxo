# pistachio

Custom Web Components library based on Custom Elements and Shadow Dom standards.

  ```HTML
    <app-test title="test"></app-test>
  ```

```javascript
  var pistachio = new Pistachio({
    id: 'app-test',
    template: '/template.html',
    bindings: {
      'title': {
        value: 'Cabecera'
      },
      'subtitle': {
        value: 'Probando distintas cab'
      }
    },
    pipes:{
      changeString: function (x) {
        return "-" + x + "-";
      }
    }
  });
  ```
