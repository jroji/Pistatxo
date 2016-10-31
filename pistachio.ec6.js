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
    const _HTMLparser = (htmlContent, properties, pipes) => {

      let regex = /{{.+}}/gi, result, bindings = [];
      /**
       * TODO: Replace with forEach ?
       */
      while ( (result = regex.exec(htmlContent)) ) {
        result = result[0].replace('{{','').replace('}}','');
        result = result.split('|');
        bindings.push({
          index: result.index,
          property: result[0].trim(),
          pipe: result[1] != null ? result[1].trim() : null
        });
      };
      return _insertHTML(htmlContent, bindings, properties, pipes);
    };

    /**
     * replace the bindings syntax and define the new component
     */

    const _insertHTML = (htmlContent, bindings, props, pipes) => {

      htmlContent = htmlContent.replace(/{{.+}}/gi, (a) => {

        let result = a.replace('{{','').replace('}}','');
        result = result.split('|');

        let pipe = result[1] ? pipes[result[1].trim()] : null;
        let value = props[result[0].trim()].value;

        return pipe ? pipe(value) : value;
      });

      return htmlContent;
    };

    /*
    const _insertHTML = (htmlContent, bindings, props, pipes) => {

      bindings.forEach(d => {
        let result = d.pipe ? pipes[d.pipe](props[d.property].value) : props[d.property].value;
        let replaceText = d.pipe && result ? '{{' + d.property +' | '+ d.pipe +'}}' : '{{' + d.property +'}}';
        if(d.pipe && !result) {
          console.warn('The pipe function' + d.pipe + ' is not return value of type String or Number');
        }

        htmlContent = htmlContent.replace(replaceText, result);

      });
      return htmlContent;
    };
    */

    /**
     * Fetch the template from properties.url and call_HTMLparser function
     */
    const _getTemplate = (template) => {

      let reader = new FileReader();
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
            this.pipes = {};

            Object.assign(this.properties, properties.bindings);
            Object.assign(this.pipes, properties.pipes);

            Object.keys(this.properties).forEach((element) => {
              var data = this.getAttribute(element);
              if( data != null ) {
                this.properties[element].value = data;
              }
            });

             let templateReader = _getTemplate(properties.template);

            templateReader.onloadend = () => {
              var content = _HTMLparser(templateReader.result, this.properties, this.pipes);
              // Create a shadow root
              let shadow = this.attachShadow({mode: this.properties.shadowMode || 'open'});

              /**
               * TODO: Replace with template tag
               */
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