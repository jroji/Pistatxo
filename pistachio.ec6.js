class Pistachio {

  constructor(properties) {

    const _fetchOptions= {
      headers: {
        "Content-Type": "text/plain"
      }
    };

    const _HTMLparser = (htmlContent) => {
      let regex = /{{.+}}/gi, result, bindings = [];
      while ( (result = regex.exec(htmlContent)) ) {
        bindings.push({
          index: result.index,
          property: result[0].replace('{{','').replace('}}','')
        });
      };
      _insertHTML(htmlContent, bindings);
    };

    const _insertHTML = (htmlContent, bindings) => {
      bindings.forEach(d => {
        htmlContent = htmlContent.replace('{{' + d.property +'}}', this._bindings[d.property].value);
      });
      _defineComponent(htmlContent, this._properties);
    };

    const _getTemplate = (properties) => {
      fetch(properties.template, _fetchOptions).then(template => {
        template.blob().then(response => {
          var reader = new FileReader();
          reader.onloadend = () => {
            _HTMLparser(reader.result);
          }
          reader.readAsBinaryString(response);
        });
      });
    }

    const _defineComponent = (content, properties) => {

      customElements.define(properties.id,

        class extends HTMLElement{
          constructor() {
            super();

            //this.shadowMode = properties.shadowMode || 'open';
            //this.template = properties.template;

            // Create a shadow root
            let shadow = this.attachShadow({mode: 'open'});

            let div = document.createElement('div');
            div.innerHTML = content;
            let element = div.firstChild;

            // Add the link to the shadow root.
            shadow.appendChild(element);
          }
        });
    }

    this._HTMLcontent;
    this._properties = properties;
    this._bindings = properties.bindings;
    _getTemplate(properties);

  }
}