'use strict';

const youdaoKey = 2029962724;
const keyfrom = "flowdict";
const api = `http://fanyi.youdao.com/openapi.do?keyfrom=${keyfrom}&key=${youdaoKey}&type=data&doctype=json&version=1.1&only=dict&q=`;
const $ = document.querySelectorAll.bind(document);

Array.prototype.unique = function() {
  this.sort();
  var re=[this[0]];
  for(var i = 1; i < this.length; i++)
  {
    if( this[i] !== re[re.length-1])
    {
      re.push(this[i]);
    }
  }
  return re;
};

// const ignoreToken = ["?", ",", ".", "'", '"', '$', '>>'];
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log(request);
  fetch(request.textUrl + "&from_extension=true").then(response => response.text()).then(text => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(text, "text/xml");
    const TreeWalker = xmlDoc.createTreeWalker(xmlDoc.documentElement.lastElementChild, NodeFilter.SHOW_ELEMENT);
    return xmlDoc;
  }).then(xmlDoc => {
    console.log("done");
    timeCaller(xmlDoc);
    // setInterval(() => {
    //   console.log($("video")[0].currentTime);
    // }, 1000);
    // fetch(api + request.words.list.slice(0, 20).join(',')).then(response => response.json()).
    //   then(rs => console.dir(rs)); 
  });
  sendResponse({status: "ok"});
});

//remove some token
function _fixWord(word){
  return word.replace(/[?,.'"!*()$/]|^\d+$/g, "");
}
// 
function timeCaller(doc, timeSpan = 3 * 60 * 1000, interval = 1000) {
  let processedTime = 0,
      currentTime,
      walkedTime = 0,
      done = false;
  const videoEl = $("video")[0],
	TreeWalker = doc.createTreeWalker(doc.documentElement.lastElementChild, NodeFilter.SHOW_ELEMENT);
    
  function* processGen(){
    let node;
    while(!done){
      let words = [];
      let pTime;
      while( (walkedTime < currentTime + timeSpan) ) {
	if(! (node = TreeWalker.nextNode())) {
	  done = true;
	  return;
	}
	if(node.children.length) {
	  pTime = +node.getAttribute('t');
	  continue;
	}
	//get words node;
	let t;
	if(node.nodeName === 'p' && (t = +node.getAttribute('t'))) {
	  processedTime = walkedTime = t;
	  node.textContent.split(" ").forEach(word => {
	    words.push({t: t, d: +node.getAttribute('d'), word: _fixWord(word)});
	  });
	}

	if(node.nodeName === 's' && (t = +node.getAttribute('t'))) {
	  words.push({t: t + pTime, d: +node.getAttribute('d'), word: (node.textContent)});
	}
      }
      yield words;
    }
  }
  const process = processGen();
  const intervaler = setInterval(() => {
    if (videoEl.paused) return;
    if( (currentTime = videoEl.currentTime * 1000) >=  processedTime){
      console.log(currentTime, processedTime);
      const rs = process.next();
      console.log(rs);
      if(rs.done) {
	clearInterval(intervaler);
      }
    }
  }, interval);
  
}

function parseWords(setencesEls) {
  let words = [];
  setencesEls.forEach((setences, index) => {
    words = words.concat(setences.textContent.split(/\s|\r/).map((word, index) => {
      // return word;
      return {t: setences.getAttribute('t'), d: setences.getAttribute('d'), word: word};
    }));
  });

  return words;
}


function diffWords(knownWords, words) {
  console.time("diff work");
  knownWords = knownWords.map(word => {
    return RegExp(`^${word}(s|es|ed|ist|ing)?$`, "i");
  });
  const newwords = words.filter((word) => {
    let index = -1;
    while(knownWords[++index]){
      if (knownWords[index].test(word)) {
	return false;
      }
    }
    return true;
  });
  return newwords;
}


console.log('\'Allo \'Allo! Content script');
