(function () {
'use strict';

/**
 * replace the bindings syntax using defined pipes
 */
const _replaceBindings = (a, properties, pipes) => {
  let result = a.replace('{{', '').replace('}}', '');
  result = result.split('|');

  let pipe = result[1] ? pipes[result[1].trim()] : null;
  let value = properties[result[0].trim()].value;

  return pipe ? pipe(value) : value;
};

/**
 * Create HTML from DOM
 * @param DOM
 * @param properties
 * @param pipes
 * @returns {Element}
 * @private
 */
const _createHTML = (DOM, properties, pipes) => {
  let template = document.createElement('template');

  const _insertNode = (template, elem) => {
    let element = document.createElement(elem.tag);
    elem.attr.forEach(attr => element.setAttribute(attr.attr, attr.value.replace(/{{.+}}/gi, a => _replaceBindings(a, properties, pipes))));

    template.appendChild(element);
    if (elem.children.length > 0) {
      elem.children.forEach(d => {
        _insertNode(element, d);
      });
    } else {
      let parsedContent = elem.content;
      element.innerHTML = parsedContent.replace(/{{.+}}/gi, a => _replaceBindings(a, properties, pipes));
    }
  };

  _insertNode(template.content, DOM[0]);

  return template;
};

/**
 * Fetch the template from properties.url and call_HTMLparser function
 */
const getTemplate = template => {

  let reader = new FileReader();
  fetch(template).then(template => {
    template.blob().then(response => {
      reader.readAsBinaryString(response);
    });
  });
  return reader;
};

const _parseNode = (array, element, properties, level = 0, route = [0]) => {

  let attributes = [];

  for (let attr of element.attributes) {
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
  for (let index = 0; index < element.children.length; index++) {
    let child = element.children[index];
    for (let binding of Object.keys(properties)) {
      if (properties[binding].path == null) {
        let reg = new RegExp('{{[\s]*' + binding + '[\s]*(|[\s\S])*?}}', 'g');
        if (child.innerHTML.match(reg) != null) {
          matches[binding] = matches[binding] != null ? matches[binding] + 1 : 1;
          if (matches[binding] > 1) {
            route.push(index);
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
const HTMLparser = (htmlContent, properties, pipes, dom) => {

  let template = document.createElement('template');

  template.innerHTML = htmlContent;
  _parseNode(dom, template.content.firstChild, properties);

  return _createHTML(dom, properties, pipes);
};

function Pistachio(properties) {

  customElements.define(properties.id, class extends HTMLElement {

    constructor() {
      super();
      this.DOM = [];

      Object.assign(this, properties);

      Object.keys(this.properties).forEach(element => {
        var data = this.getAttribute(element);
        if (data != null) {
          this.properties[element].value = data;
        }
      });

      let templateReader = getTemplate(properties.template);

      templateReader.onloadend = () => {
        var content = HTMLparser(templateReader.result, this.properties, this.pipes, this.DOM);
        /** Create a shadow root **/
        let shadow = this.attachShadow({ mode: this.properties.shadowMode || 'open' });
        /** Add the html content to the shadow root.**/
        shadow.appendChild(content.content);
      };
    }

    /** Define observedAttributes by defined properties **/
    static get observedAttributes() {
      return Object.keys(properties.properties);
    }

    attributeChangedCallback(attr, oldValue, newValue) {
      if (oldValue) {
        this.properties[attr].value = newValue;
        let content = this.DOM[0].children[1].content;
        content = content.replace(/{{.+}}/gi, a => _replaceBindings(a, this.properties, this.pipes));
        let domEl = this.shadowRoot;
        for (let index of this.properties[attr].path || []) {
          domEl = domEl.children[index];
        }
        requestAnimationFrame(() => {
          domEl.innerHTML = content;
        });
      }
    }

    connectedCallback() {
      this.connectedCallback.call(this);
    }
    /** Overwrite lifecycle events with developer custom functions **/
    disconnectedCallback() {}

    adoptedCallback(oldDocument, newDocument) {
      this.adoptedCallback(oldDocument, newDocument);
    }
  });
}

var app = Pistachio({
  id: 'app-test',
  template: '../app/template.html',
  properties: {
    'title': {},
    'subtitle': {
      value: 'Probando distintas cab'
    }
  },
  pipes: {
    changeString: function changeString(x) {
      return x + "HOLA";
    }
  },
  connectedCallback: function connectedCallback() {}
});

}());
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGlzdGFjaGlvLmNvbnRyb2xsZXIuanMiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90ZW1wbGF0aW5nL2JpbmRpbmdzLmpzIiwiLi4vLi4vc3JjL3RlbXBsYXRpbmcvdGVtcGxhdGUuanMiLCIuLi8uLi9zcmMvcGlzdGFjaGlvLmVjNi5qcyIsIi4uL2FwcC9waXN0YWNoaW8uY29udHJvbGxlci5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJcbi8qKlxuICogcmVwbGFjZSB0aGUgYmluZGluZ3Mgc3ludGF4IHVzaW5nIGRlZmluZWQgcGlwZXNcbiAqL1xuZXhwb3J0IGNvbnN0IF9yZXBsYWNlQmluZGluZ3MgPSAoYSwgcHJvcGVydGllcywgcGlwZXMpID0+IHtcbiAgbGV0IHJlc3VsdCA9IGEucmVwbGFjZSgne3snLCcnKS5yZXBsYWNlKCd9fScsJycpO1xuICByZXN1bHQgPSByZXN1bHQuc3BsaXQoJ3wnKTtcblxuICBsZXQgcGlwZSA9IHJlc3VsdFsxXSA/IHBpcGVzW3Jlc3VsdFsxXS50cmltKCldIDogbnVsbDtcbiAgbGV0IHZhbHVlID0gcHJvcGVydGllc1tyZXN1bHRbMF0udHJpbSgpXS52YWx1ZTtcblxuICByZXR1cm4gcGlwZSA/IHBpcGUodmFsdWUpIDogdmFsdWU7XG59O1xuIiwiaW1wb3J0IHsgX3JlcGxhY2VCaW5kaW5ncyB9IGZyb20gJy4vYmluZGluZ3MuanMnO1xuXG4vKipcbiAqIENyZWF0ZSBIVE1MIGZyb20gRE9NXG4gKiBAcGFyYW0gRE9NXG4gKiBAcGFyYW0gcHJvcGVydGllc1xuICogQHBhcmFtIHBpcGVzXG4gKiBAcmV0dXJucyB7RWxlbWVudH1cbiAqIEBwcml2YXRlXG4gKi9cbmV4cG9ydCBjb25zdCBfY3JlYXRlSFRNTCA9IChET00sIHByb3BlcnRpZXMsIHBpcGVzKSA9PiB7XG4gIGxldCB0ZW1wbGF0ZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RlbXBsYXRlJyk7XG5cbiAgY29uc3QgX2luc2VydE5vZGUgPSAodGVtcGxhdGUsIGVsZW0pPT4ge1xuICAgIGxldCBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChlbGVtLnRhZyk7XG4gICAgZWxlbS5hdHRyLmZvckVhY2goIChhdHRyKSA9PiBlbGVtZW50LnNldEF0dHJpYnV0ZShhdHRyLmF0dHIsIGF0dHIudmFsdWUucmVwbGFjZSgve3suK319L2dpLCBhID0+IF9yZXBsYWNlQmluZGluZ3MoYSxwcm9wZXJ0aWVzLCBwaXBlcykpKSk7XG5cbiAgICB0ZW1wbGF0ZS5hcHBlbmRDaGlsZChlbGVtZW50KTtcbiAgICBpZihlbGVtLmNoaWxkcmVuLmxlbmd0aCA+IDApIHtcbiAgICAgIGVsZW0uY2hpbGRyZW4uZm9yRWFjaCggZCA9PiB7IF9pbnNlcnROb2RlKGVsZW1lbnQsZCkgfSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgbGV0IHBhcnNlZENvbnRlbnQgPSBlbGVtLmNvbnRlbnQ7XG4gICAgICBlbGVtZW50LmlubmVySFRNTCA9IHBhcnNlZENvbnRlbnQucmVwbGFjZSgve3suK319L2dpLCBhID0+IF9yZXBsYWNlQmluZGluZ3MoYSxwcm9wZXJ0aWVzLCBwaXBlcykpO1xuICAgIH1cbiAgfVxuXG4gIF9pbnNlcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQsIERPTVswXSk7XG5cbiAgcmV0dXJuIHRlbXBsYXRlO1xufVxuXG4vKipcbiAqIEZldGNoIHRoZSB0ZW1wbGF0ZSBmcm9tIHByb3BlcnRpZXMudXJsIGFuZCBjYWxsX0hUTUxwYXJzZXIgZnVuY3Rpb25cbiAqL1xuZXhwb3J0IGNvbnN0IGdldFRlbXBsYXRlID0gKHRlbXBsYXRlKSA9PiB7XG5cbiAgbGV0IHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XG4gIGZldGNoKHRlbXBsYXRlKS50aGVuKHRlbXBsYXRlID0+IHtcbiAgICB0ZW1wbGF0ZS5ibG9iKCkudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICByZWFkZXIucmVhZEFzQmluYXJ5U3RyaW5nKHJlc3BvbnNlKTtcbiAgICB9KTtcbiAgfSk7XG4gIHJldHVybiByZWFkZXI7XG59XG5cbmNvbnN0IF9wYXJzZU5vZGUgPSAoYXJyYXksIGVsZW1lbnQsIHByb3BlcnRpZXMsIGxldmVsID0gMCwgcm91dGUgPSBbMF0pID0+IHtcblxuICBsZXQgYXR0cmlidXRlcyA9IFtdO1xuXG4gIGZvcihsZXQgYXR0ciBvZiBlbGVtZW50LmF0dHJpYnV0ZXMpIHtcbiAgICBhdHRyaWJ1dGVzLnB1c2goe1xuICAgICAgYXR0cjogYXR0ci5uYW1lLFxuICAgICAgdmFsdWU6IGF0dHIubm9kZVZhbHVlXG4gICAgfSk7XG4gIH1cblxuICBsZXQgb2JqID0ge1xuICAgICdhdHRyJzogYXR0cmlidXRlcyxcbiAgICAndGFnJzogZWxlbWVudC50YWdOYW1lLFxuICAgICdjaGlsZHJlbic6IFtdLFxuICAgICdjb250ZW50JzogZWxlbWVudC5pbm5lckhUTUwsXG4gICAgJ3JvdXRlJzogW11cbiAgfTtcblxuICBhcnJheS5wdXNoKG9iaik7XG5cbiAgbGV0IG1hdGNoZXMgPSB7fTtcbiAgZm9yKGxldCBpbmRleCA9IDA7IGluZGV4IDwgZWxlbWVudC5jaGlsZHJlbi5sZW5ndGg7IGluZGV4Kyspe1xuICAgIGxldCBjaGlsZCA9IGVsZW1lbnQuY2hpbGRyZW5baW5kZXhdO1xuICAgIGZvcihsZXQgYmluZGluZyBvZiBPYmplY3Qua2V5cyhwcm9wZXJ0aWVzKSkge1xuICAgICAgaWYocHJvcGVydGllc1tiaW5kaW5nXS5wYXRoID09IG51bGwpe1xuICAgICAgICBsZXQgcmVnID0gbmV3IFJlZ0V4cCgne3tbXFxzXSonICsgYmluZGluZyArJ1tcXHNdKih8W1xcc1xcU10pKj99fScsJ2cnKTtcbiAgICAgICAgaWYoIGNoaWxkLmlubmVySFRNTC5tYXRjaChyZWcpICE9IG51bGwgKSB7XG4gICAgICAgICAgbWF0Y2hlc1tiaW5kaW5nXSA9IG1hdGNoZXNbYmluZGluZ10gIT0gbnVsbCA/IG1hdGNoZXNbYmluZGluZ10gKyAxIDogMTtcbiAgICAgICAgICBpZihtYXRjaGVzW2JpbmRpbmddID4gMSl7XG4gICAgICAgICAgICByb3V0ZS5wdXNoKGluZGV4KVxuICAgICAgICAgICAgcHJvcGVydGllc1tiaW5kaW5nXS5wYXRoID0gcm91dGU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIF9wYXJzZU5vZGUob2JqLmNoaWxkcmVuLCBjaGlsZCwgcHJvcGVydGllcywgbGV2ZWwrKywgcm91dGUpO1xuICB9XG59O1xuXG5cbi8qKlxuICogcGFyc2UgdGhlIGh0bWwgY29udGVudCwgaWRlbnRpZnlpbmcgdGhlIGJpbmRpbmdzIHBvc2l0aW9ucyBhbmQgdmFyc1xuICovXG5leHBvcnQgY29uc3QgSFRNTHBhcnNlciA9IChodG1sQ29udGVudCwgcHJvcGVydGllcywgcGlwZXMsIGRvbSkgPT4ge1xuXG4gIGxldCB0ZW1wbGF0ZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RlbXBsYXRlJyk7XG5cbiAgdGVtcGxhdGUuaW5uZXJIVE1MID0gaHRtbENvbnRlbnQ7XG4gIF9wYXJzZU5vZGUoZG9tLCB0ZW1wbGF0ZS5jb250ZW50LmZpcnN0Q2hpbGQsIHByb3BlcnRpZXMpO1xuXG4gIHJldHVybiBfY3JlYXRlSFRNTChkb20sIHByb3BlcnRpZXMsIHBpcGVzKTtcblxufTsiLCJpbXBvcnQgeyBfcmVwbGFjZUJpbmRpbmdzIH0gZnJvbSAnLi90ZW1wbGF0aW5nL2JpbmRpbmdzLmpzJztcbmltcG9ydCB7IGdldFRlbXBsYXRlLCBIVE1McGFyc2VyIH0gZnJvbSAnLi90ZW1wbGF0aW5nL3RlbXBsYXRlLmpzJztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gUGlzdGFjaGlvKHByb3BlcnRpZXMpIHtcblxuICBjdXN0b21FbGVtZW50cy5kZWZpbmUocHJvcGVydGllcy5pZCwgIGNsYXNzIGV4dGVuZHMgSFRNTEVsZW1lbnR7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgIHN1cGVyKCk7XG4gICAgICB0aGlzLkRPTSA9IFtdO1xuXG4gICAgICBPYmplY3QuYXNzaWduKHRoaXMsIHByb3BlcnRpZXMpO1xuXG4gICAgICBPYmplY3Qua2V5cyh0aGlzLnByb3BlcnRpZXMpLmZvckVhY2goKGVsZW1lbnQpID0+IHtcbiAgICAgICAgdmFyIGRhdGEgPSB0aGlzLmdldEF0dHJpYnV0ZShlbGVtZW50KTtcbiAgICAgICAgaWYoIGRhdGEgIT0gbnVsbCApIHtcbiAgICAgICAgICB0aGlzLnByb3BlcnRpZXNbZWxlbWVudF0udmFsdWUgPSBkYXRhO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgbGV0IHRlbXBsYXRlUmVhZGVyID0gZ2V0VGVtcGxhdGUocHJvcGVydGllcy50ZW1wbGF0ZSk7XG5cbiAgICAgIHRlbXBsYXRlUmVhZGVyLm9ubG9hZGVuZCA9ICgpID0+IHtcbiAgICAgICAgdmFyIGNvbnRlbnQgPSBIVE1McGFyc2VyKHRlbXBsYXRlUmVhZGVyLnJlc3VsdCwgdGhpcy5wcm9wZXJ0aWVzLCB0aGlzLnBpcGVzLCB0aGlzLkRPTSk7XG4gICAgICAgIC8qKiBDcmVhdGUgYSBzaGFkb3cgcm9vdCAqKi9cbiAgICAgICAgbGV0IHNoYWRvdyA9IHRoaXMuYXR0YWNoU2hhZG93KHttb2RlOiB0aGlzLnByb3BlcnRpZXMuc2hhZG93TW9kZSB8fCAnb3Blbid9KTtcbiAgICAgICAgLyoqIEFkZCB0aGUgaHRtbCBjb250ZW50IHRvIHRoZSBzaGFkb3cgcm9vdC4qKi9cbiAgICAgICAgc2hhZG93LmFwcGVuZENoaWxkKGNvbnRlbnQuY29udGVudCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLyoqIERlZmluZSBvYnNlcnZlZEF0dHJpYnV0ZXMgYnkgZGVmaW5lZCBwcm9wZXJ0aWVzICoqL1xuICAgIHN0YXRpYyBnZXQgb2JzZXJ2ZWRBdHRyaWJ1dGVzKCkgeyByZXR1cm4gT2JqZWN0LmtleXMocHJvcGVydGllcy5wcm9wZXJ0aWVzKTsgfVxuXG4gICAgYXR0cmlidXRlQ2hhbmdlZENhbGxiYWNrKGF0dHIsIG9sZFZhbHVlLCBuZXdWYWx1ZSkge1xuICAgICAgaWYob2xkVmFsdWUpIHtcbiAgICAgICAgdGhpcy5wcm9wZXJ0aWVzW2F0dHJdLnZhbHVlID0gbmV3VmFsdWU7XG4gICAgICAgIGxldCBjb250ZW50ID0gdGhpcy5ET01bMF0uY2hpbGRyZW5bMV0uY29udGVudDtcbiAgICAgICAgY29udGVudCA9IGNvbnRlbnQucmVwbGFjZSgve3suK319L2dpLCBhID0+IF9yZXBsYWNlQmluZGluZ3MoYSx0aGlzLnByb3BlcnRpZXMsIHRoaXMucGlwZXMpKTtcbiAgICAgICAgbGV0IGRvbUVsID0gdGhpcy5zaGFkb3dSb290O1xuICAgICAgICBmb3IobGV0IGluZGV4IG9mIHRoaXMucHJvcGVydGllc1thdHRyXS5wYXRoIHx8IFtdKXtcbiAgICAgICAgICBkb21FbCA9IGRvbUVsLmNoaWxkcmVuW2luZGV4XTtcbiAgICAgICAgfVxuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoICgpID0+IHtcbiAgICAgICAgICBkb21FbC5pbm5lckhUTUwgPSBjb250ZW50O1xuXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfVxuXG4gICAgY29ubmVjdGVkQ2FsbGJhY2soKSB7XG4gICAgICB0aGlzLmNvbm5lY3RlZENhbGxiYWNrLmNhbGwodGhpcyk7XG4gICAgfVxuICAgIC8qKiBPdmVyd3JpdGUgbGlmZWN5Y2xlIGV2ZW50cyB3aXRoIGRldmVsb3BlciBjdXN0b20gZnVuY3Rpb25zICoqL1xuICAgIGRpc2Nvbm5lY3RlZENhbGxiYWNrKCl7IH07XG5cbiAgICBhZG9wdGVkQ2FsbGJhY2sob2xkRG9jdW1lbnQsIG5ld0RvY3VtZW50KXsgdGhpcy5hZG9wdGVkQ2FsbGJhY2sob2xkRG9jdW1lbnQsIG5ld0RvY3VtZW50KTt9O1xuICB9KTtcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IFBpc3RhY2hpbyBmcm9tICcuLi8uLi9zcmMvcGlzdGFjaGlvLmVjNic7XG5cbnZhciBhcHAgPSBQaXN0YWNoaW8oe1xuICBpZDogJ2FwcC10ZXN0JyxcbiAgdGVtcGxhdGU6ICcuLi9hcHAvdGVtcGxhdGUuaHRtbCcsXG4gIHByb3BlcnRpZXM6IHtcbiAgICAndGl0bGUnOiB7fSxcbiAgICAnc3VidGl0bGUnOiB7XG4gICAgICB2YWx1ZTogJ1Byb2JhbmRvIGRpc3RpbnRhcyBjYWInXG4gICAgfVxuICB9LFxuICBwaXBlczp7XG4gICAgY2hhbmdlU3RyaW5nOiAoeCkgPT4ge1xuICAgICAgcmV0dXJuIHggKyBcIkhPTEFcIjtcbiAgICB9XG4gIH0sXG4gIGNvbm5lY3RlZENhbGxiYWNrOiBmdW5jdGlvbigpIHtcbiAgfVxufSk7XG4iXSwibmFtZXMiOlsiX3JlcGxhY2VCaW5kaW5ncyIsImEiLCJwcm9wZXJ0aWVzIiwicGlwZXMiLCJyZXN1bHQiLCJyZXBsYWNlIiwic3BsaXQiLCJwaXBlIiwidHJpbSIsInZhbHVlIiwiX2NyZWF0ZUhUTUwiLCJET00iLCJ0ZW1wbGF0ZSIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudCIsIl9pbnNlcnROb2RlIiwiZWxlbSIsImVsZW1lbnQiLCJ0YWciLCJhdHRyIiwiZm9yRWFjaCIsInNldEF0dHJpYnV0ZSIsImFwcGVuZENoaWxkIiwiY2hpbGRyZW4iLCJsZW5ndGgiLCJkIiwicGFyc2VkQ29udGVudCIsImNvbnRlbnQiLCJpbm5lckhUTUwiLCJnZXRUZW1wbGF0ZSIsInJlYWRlciIsIkZpbGVSZWFkZXIiLCJ0aGVuIiwiYmxvYiIsInJlc3BvbnNlIiwicmVhZEFzQmluYXJ5U3RyaW5nIiwiX3BhcnNlTm9kZSIsImFycmF5IiwibGV2ZWwiLCJyb3V0ZSIsImF0dHJpYnV0ZXMiLCJwdXNoIiwibmFtZSIsIm5vZGVWYWx1ZSIsIm9iaiIsInRhZ05hbWUiLCJtYXRjaGVzIiwiaW5kZXgiLCJjaGlsZCIsImJpbmRpbmciLCJPYmplY3QiLCJrZXlzIiwicGF0aCIsInJlZyIsIlJlZ0V4cCIsIm1hdGNoIiwiSFRNTHBhcnNlciIsImh0bWxDb250ZW50IiwiZG9tIiwiZmlyc3RDaGlsZCIsIlBpc3RhY2hpbyIsImRlZmluZSIsImlkIiwiSFRNTEVsZW1lbnQiLCJhc3NpZ24iLCJkYXRhIiwiZ2V0QXR0cmlidXRlIiwidGVtcGxhdGVSZWFkZXIiLCJvbmxvYWRlbmQiLCJzaGFkb3ciLCJhdHRhY2hTaGFkb3ciLCJtb2RlIiwic2hhZG93TW9kZSIsIm9ic2VydmVkQXR0cmlidXRlcyIsIm9sZFZhbHVlIiwibmV3VmFsdWUiLCJkb21FbCIsInNoYWRvd1Jvb3QiLCJjb25uZWN0ZWRDYWxsYmFjayIsImNhbGwiLCJvbGREb2N1bWVudCIsIm5ld0RvY3VtZW50IiwiYWRvcHRlZENhbGxiYWNrIiwiYXBwIiwieCJdLCJtYXBwaW5ncyI6Ijs7O0FBQ0E7OztBQUdBLEFBQU8sTUFBTUEsbUJBQW1CLENBQUNDLENBQUQsRUFBSUMsVUFBSixFQUFnQkMsS0FBaEIsS0FBMEI7TUFDcERDLFNBQVNILEVBQUVJLE9BQUYsQ0FBVSxJQUFWLEVBQWUsRUFBZixFQUFtQkEsT0FBbkIsQ0FBMkIsSUFBM0IsRUFBZ0MsRUFBaEMsQ0FBYjtXQUNTRCxPQUFPRSxLQUFQLENBQWEsR0FBYixDQUFUOztNQUVJQyxPQUFPSCxPQUFPLENBQVAsSUFBWUQsTUFBTUMsT0FBTyxDQUFQLEVBQVVJLElBQVYsRUFBTixDQUFaLEdBQXNDLElBQWpEO01BQ0lDLFFBQVFQLFdBQVdFLE9BQU8sQ0FBUCxFQUFVSSxJQUFWLEVBQVgsRUFBNkJDLEtBQXpDOztTQUVPRixPQUFPQSxLQUFLRSxLQUFMLENBQVAsR0FBcUJBLEtBQTVCO0NBUEs7O0FDRlA7Ozs7Ozs7O0FBUUEsQUFBTyxNQUFNQyxjQUFjLENBQUNDLEdBQUQsRUFBTVQsVUFBTixFQUFrQkMsS0FBbEIsS0FBNEI7TUFDakRTLFdBQVdDLFNBQVNDLGFBQVQsQ0FBdUIsVUFBdkIsQ0FBZjs7UUFFTUMsY0FBYyxDQUFDSCxRQUFELEVBQVdJLElBQVgsS0FBbUI7UUFDakNDLFVBQVVKLFNBQVNDLGFBQVQsQ0FBdUJFLEtBQUtFLEdBQTVCLENBQWQ7U0FDS0MsSUFBTCxDQUFVQyxPQUFWLENBQW9CRCxJQUFELElBQVVGLFFBQVFJLFlBQVIsQ0FB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
