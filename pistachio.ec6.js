'use strict';

class Pistachio {

  constructor(properties) {

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
      document.querySelector(this._id).innerHTML = htmlContent;
    };

    this._bindings = properties.bindings || {};
    this._id = properties.id || '';

    const _fetchOptions= {
      headers: {
        "Content-Type": "text/plain"
      }
    };

    if(properties.id == null) {
      console.warn("No component identificator defined");
    }

    fetch(properties.template, _fetchOptions).then( template => {
      template.blob().then(response => {
        var reader = new FileReader();
        reader.onloadend = () => {
          _HTMLparser(reader.result);
        }
        reader.readAsBinaryString(response);
      });
    });
  };
}