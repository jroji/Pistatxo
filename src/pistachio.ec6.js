import { _replaceBindings } from './templating/bindings.js';
import { getTemplate, HTMLparser } from './templating/template.js';

export default function Pistachio(properties) {

  customElements.define(properties.id,  class extends HTMLElement{

    constructor() {
      super();
      this.DOM = [];

      Object.assign(this, properties);

      Object.keys(this.properties).forEach((element) => {
        var data = this.getAttribute(element);
        if( data != null ) {
          this.properties[element].value = data;
        }
      });

      let templateReader = getTemplate(properties.template);

      templateReader.onloadend = () => {
        var content = HTMLparser(templateReader.result, this.properties, this.pipes, this.DOM);
        /** Create a shadow root **/
        let shadow = this.attachShadow({mode: this.properties.shadowMode || 'open'});
        /** Add the html content to the shadow root.**/
        shadow.appendChild(content.content);
      }
    }

    /** Define observedAttributes by defined properties **/
    static get observedAttributes() { return Object.keys(properties.properties); }

    attributeChangedCallback(attr, oldValue, newValue) {
      if(oldValue) {
        this.properties[attr].value = newValue;
        let content = this.DOM[0].children[1].content;
        content = content.replace(/{{.+}}/gi, a => _replaceBindings(a,this.properties, this.pipes));
        let domEl = this.shadowRoot;
        for(let index of this.properties[attr].path || []){
          domEl = domEl.children[index];
        }
        requestAnimationFrame( () => {
          domEl.innerHTML = content;

        })
      }
    }

    connectedCallback() {
      this.connectedCallback.call(this);
    }
    /** Overwrite lifecycle events with developer custom functions **/
    disconnectedCallback(){ };

    adoptedCallback(oldDocument, newDocument){ this.adoptedCallback(oldDocument, newDocument);};
  });
}
