'use strict';
let words = {};
fetch(chrome.runtime.getURL("/data/words.json")).then(response => response.json()).then( knownWords => {
  words.list = knownWords.list;
});

chrome.runtime.onInstalled.addListener(details => {
  console.log('previousVersion', details.previousVersion);
});

chrome.tabs.onUpdated.addListener(tabId => {
  chrome.pageAction.show(tabId);
});

chrome.webRequest.onCompleted.addListener((details) => {
  if( (details.url.indexOf("timedtext") !== -1) && (details.url.indexOf("from_extension") === -1) ) {
    chrome.tabs.sendMessage(details.tabId, {textUrl: details.url, words: words}, response => {
      console.log(response);
    });
  }
}, {urls: ["*://www.youtube.com/*"]});

console.log('\'Allo \'Allo! Event Page for Page Action');
