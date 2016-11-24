class Pistachio {

  constructor(properties) {

    this._DOM = {};

    const _parseNode = (array, element, level = 0) => {

      let attributes = [];

      for(let attr of element.attributes) {
        attributes.push({
          attr: attr.name,
          value: attr.nodeValue
        });
      }

      array.push({
        'attr': attributes,
        'tag': element.tagName,
        'children': [],
        'content': element.innerHTML,
        'level': level
      });

      if(element.children.length != 0) {
        for(let child of element.children){
          _parseNode(array[array.length - 1].children, child, level++);
        }
      }
    };

    /**
     * parse the html content, identifying the bindings positions and vars
     */
    const _HTMLparser = (htmlContent, properties, pipes) => {

      let template = document.createElement('template');
      let DOM = [];

      template.innerHTML = htmlContent;
      _parseNode(DOM, template.content.firstChild);

      this._DOM = DOM;
      return _createHTML(DOM, properties, pipes);

    };

    /**
     * replace the bindings syntax using defined pipes
     */
    const _replaceBindings = (a, properties, pipes) => {

      let result = a.replace('{{','').replace('}}','');
      result = result.split('|');

      let pipe = result[1] ? pipes[result[1].trim()] : null;
      let value = properties[result[0].trim()].value;

      return pipe ? pipe(value) : value;
    };

    const _createHTML = (DOM, properties, pipes) => {
      let template = document.createElement('template');

      const _insertNode = (template, elem)=> {
        let element = document.createElement(elem.tag);
        elem.attr.forEach( (attr) => element.setAttribute(attr.attr, attr.value.replace(/{{.+}}/gi, a => _replaceBindings(a,properties, pipes))));

        template.appendChild(element);
        if(elem.children.length > 0) {
          elem.children.forEach( d => { _insertNode(element,d) });
        }
        else {
          let parsedContent = elem.content;
          element.innerHTML = parsedContent.replace(/{{.+}}/gi, a => _replaceBindings(a,properties, pipes));
        }
      }

      _insertNode(template.content, DOM[0]);

      return template;
    }

    /**
     * Fetch the template from properties.url and call_HTMLparser function
     */
    const _getTemplate = (template) => {

      let reader = new FileReader();
      fetch(template).then(template => {
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

            Object.assign(this, properties);

            Object.keys(this.properties).forEach((element) => {
              var data = this.getAttribute(element);
              if( data != null ) {
                this.properties[element].value = data;
              }
            });

            let templateReader = _getTemplate(properties.template);

            templateReader.onloadend = () => {
              var content = _HTMLparser(templateReader.result, this.properties, this.pipes);
              /** Create a shadow root **/
              let shadow = this.attachShadow({mode: this.properties.shadowMode || 'open'});
              /** Add the html content to the shadow root.**/
              shadow.appendChild(content.content);
            }

          }

          /** Define observedAttributes by defined properties **/
          static get observedAttributes() { return Object.keys(properties.properties); }

          attributeChangedCallback(attr, oldValue, newValue) {
            /** TODO: CHANGE DETECTION LISTENER **/
            console.info("attr changed => ", attr, newValue);
          }

          /** Overwrite lifecycle events with developer custom functions **/
          disconnectedCallback(){
            this.disconnectedCallback;
          };

          connectedCallback(){
            this.connectedCallback();
          };

          adoptedCallback(oldDocument, newDocument){
            this.adoptedCallback(oldDocument, newDocument);
          };
        });
    }
}