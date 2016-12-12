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
 * replace the bindings syntax using defined pipes
 */
const _replaceBindings = (a, properties, pipes) => {
  let result = a.replace('{{','').replace('}}','');
  result = result.split('|');

  let pipe = result[1] ? pipes[result[1].trim()] : null;
  let value = properties[result[0].trim()].value;

  return pipe ? pipe(value) : value;
};


const _parseNode = (array, element, properties, level = 0, route = [0]) => {

  let attributes = [];

  for(let attr of element.attributes) {
    attributes.push({
      attr: attr.name,
      value: attr.nodeValue
    });
  }

  let obj = {
    'attr': attributes,
    'tag': element.tagName,
    'children': [],
    'content': element.innerHTML,
    'route': []
  };

  array.push(obj);

  let matches = {};
  for(let index = 0; index < element.children.length; index++){
    let child = element.children[index];
    for(let binding of Object.keys(properties)) {
      if(properties[binding].path == null){
        let reg = new RegExp('{{[\s]*' + binding +'[\s]*(|[\s\S])*?}}','g');
        if( child.innerHTML.match(reg) != null ) {
          matches[binding] = matches[binding] != null ? matches[binding] + 1 : 1;
          if(matches[binding] > 1){
            route.push(index)
            properties[binding].path = route;
          }
        }
      }
    }
    _parseNode(obj.children, child, properties, level++, route);
  }
};

/**
 * parse the html content, identifying the bindings positions and vars
 */
const _HTMLparser = (htmlContent, properties, pipes, dom) => {

  let template = document.createElement('template');

  template.innerHTML = htmlContent;
  _parseNode(dom, template.content.firstChild, properties);

  return _createHTML(dom, properties, pipes);

};

let Pistachio = (properties) => {

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

      let templateReader = _getTemplate(properties.template);

      templateReader.onloadend = () => {
        var content = _HTMLparser(templateReader.result, this.properties, this.pipes, this.DOM);
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
