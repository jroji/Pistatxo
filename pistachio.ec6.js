class Pistachio {

  constructor(properties) {

    const _fetchOptions= {
      headers: {
        "Content-Type": "text/plain"
      }
    };

    /**
     * parse the html content, identifying the bindings positions and vars
     */
    const _HTMLparser = (htmlContent, properties) => {
      let regex = /{{.+}}/gi, result, bindings = [];
      while ( (result = regex.exec(htmlContent)) ) {
        bindings.push({
          index: result.index,
          property: result[0].replace('{{','').replace('}}','')
        });
      };
      return _insertHTML(htmlContent, bindings, properties);
    };

    /**
     * replace the bindings syntax and define the new component
     */
    const _insertHTML = (htmlContent, bindings, props) => {
      bindings.forEach(d => {
        htmlContent = htmlContent.replace('{{' + d.property +'}}', props[d.property].value);
      });
      return htmlContent;
    };

    /**
     * fetch the template from properties.url and call_HTMLparser function
     */
    const _getTemplate = (template) => {
      var reader = new FileReader();
      fetch(template, _fetchOptions).then(template => {
        template.blob().then(response => {
          reader.readAsBinaryString(response);
        });
      });
      return reader;
    }

    /**
     * Create and define the custom element using the specified properties
     */
      customElements.define(properties.id,

        class extends HTMLElement{
          constructor() {
            super();

            this.properties = {};

            Object.assign(this.properties, properties.bindings);

            Object.keys(this.properties).forEach((element) => {
              var data = this.getAttribute(element);
              if( data != null ) {
                this.properties[element].value = data;
              }
            });

             var x = _getTemplate(properties.template);

            x.onloadend = () => {
              var content = _HTMLparser(x.result, this.properties);
              // Create a shadow root
              let shadow = this.attachShadow({mode: this.properties.shadowMode || 'open'});

              let div = document.createElement('div');
              div.innerHTML = content;
              let element = div.firstChild;

              // Add the html content to the shadow root.
              shadow.appendChild(element);
            }
          }

        });
    }
}