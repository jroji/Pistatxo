# pistachio 

![alt text](https://s13.postimg.org/p2juoo44n/pista.png)


Custom Web Components library based on Custom Elements and Shadow Dom standards.

  ```HTML
    <article class="hola" test="aaaa">

    <style>
      header {
        padding: 10px;
        display: flex;
        justify-content: space-between;
        background: red;
      }
    </style>

    <header>
      <div>
        <p>{{subtitle | changeString}}</p>
        <p>{{subtitle}}</p>
        <h1>{{title}}</h1>
      </div>
    </header>
  </article>
  ```

```javascript
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
      return x + " - HOLA";
    }
  },
  connectedCallback: function() {
    setInterval(() => {
      this.setAttribute("subtitle", Math.random());
    }, 1);
  }
});

  ```
