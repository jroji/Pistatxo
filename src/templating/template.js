import { _replaceBindings } from './bindings.js';

/**
 * Create HTML from DOM
 * @param DOM
 * @param properties
 * @param pipes
 * @returns {Element}
 * @private
 */
export const _createHTML = (DOM, properties, pipes) => {
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
export const getTemplate = (template) => {

  let reader = new FileReader();
  fetch(template).then(template => {
    template.blob().then(response => {
      reader.readAsBinaryString(response);
    });
  });
  return reader;
}

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
export const HTMLparser = (htmlContent, properties, pipes, dom) => {

  let template = document.createElement('template');

  template.innerHTML = htmlContent;
  _parseNode(dom, template.content.firstChild, properties);

  return _createHTML(dom, properties, pipes);

};