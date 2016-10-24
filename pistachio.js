
Pistachio = (() => {

  let _bindings = {};
  let id = "body";

  const _insertHTML = (htmlContent, bindings) => {
    bindings.forEach(d => {
      htmlContent = htmlContent.replace('{{' + d.property +'}}', _bindings[d.property].value);
    });
    document.querySelector(id).innerHTML = htmlContent;
  };

  const _HTMLparser = (htmlContent) => {
    let regex = /{{/gi, result, bindings = [];
    while ( (result = regex.exec(htmlContent)) ) {
      bindings.push({
        index: result.index,
        property: htmlContent.substring(result.index + 2, htmlContent.indexOf('}}'))
      });
    };
    _insertHTML(htmlContent, bindings);
  };

  const _component = properties =>  {
    const _headers= {
      headers: {
        "Content-Type" : "text/plain"
      }
    };

    _bindings = properties.bindings;
    fetch(properties.template, _headers).then( template => {
      template.blob().then(response => {
        var reader = new FileReader();
        reader.onloadend = () => {
          _HTMLparser(reader.result);
        }
        reader.readAsBinaryString(response);
      });
    })
  };

  return {
    component: _component
  }
})();