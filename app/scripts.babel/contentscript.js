'use strict';

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log(request);
  fetch(request.textUrl + "&from_extension=true").then(response => response.text()).then(text => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(text, "text/xml");
    return xmlDoc;
  }).then(xmlDoc => console.dir(xmlDoc));
  sendResponse({status: "ok"});
});


console.log('\'Allo \'Allo! Content script');
