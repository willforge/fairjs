// ipfs routines
//
// deps:
//  - config.js
//  - essential.js
//  - sha256.min.js
//
// see also: https://www.jsdelivr.com/package/gh/mychelium/js?path=dist&version=ca0824a
// <script>
// <script src="https://cdn.jsdelivr.net/gh/mychelium/js@ca0824a/dist/sha256.min.js" integrity="sha256-YIafx9wlTYK6CHM0cY15DbyqIN2pA/Yy4QpMrwf9Cpg=" crossorigin="anonymous"></script>
// <script src="https://cdn.jsdelivr.net/gh/michel47/snippets@0.7.8/js/essential.js" integrity="sha256-FQCrKCV4H4gAfinouKXwvLZ2SHzYHhBwvPlqVnH0EAs=" crossorigin="anonymous"></script>
//
// Log:
//  console.log => console.debug by Emile Achadde 27 août 2020 at 16:15:22+02:00
// ---
configure(config);

const qmNull = 'QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n';
//var config;
//const cfg_url = 'http://127.0.0.1:1124/config.json';
//var promisedConfig = load_config(cfg_url);
var promisedPeerId;
var ipns_cache = {
  '12D3KooWHpj1ercuLscv78Ezz4TADdwSgNkmNmd4qH8dfCCcwZHX':'/ipfs/QmU2vXnWUHmyDygqjsEJDxm7NkCE943CTqZSTq4wrE111M',
  'QmTeqJutKAtVyX39qvhAGfjQFesbubamN8dvVPMg5jYRwS':'/ipfs/QmeihygynRMSLKZNEhQ2zavyRGKXjH2YGhyERokE3Lf6u1'
  '12D3KooWJDBrt6re8zveUPZKwC3QPBid4iCguyMVuWbKMXb5HeTa':'/ipfs/bafyaabakaieac',
  };


var thisscript = document.currentScript;
thisscript.version = '1.1';
thisscript.name = thisscript.src.replace(RegExp('.*/([^/]+)$'),"$1");

/* if experimental then switch to '../' (i.e. use local js)
if (thisscript.className.match('exp') && document.location.href.match('michelc') ) {
   let src = thisscript.src.replace(RegExp('.*'+'/github\.(?:com|io)/'),'../');
   thisscript.remove();
   var script = document.createElement('script');
   script.src = src;
   console.log(thisscript.name+'.adding:',script.src);
   document.getElementsByTagName('head')[0].appendChild(script);
}

*/
console.log(thisscript.name+': '+thisscript.src+' ('+thisscript.version+')');

// --------------------------------------------;
// global variables ...;

 if (typeof(core) == 'undefined') {
      var core = {};
      core['name'] = 'fairRings™'
      core['index'] = 'frindex.log'
      core['dir'] = '/.../.frings';
      core['history'] = core['dir'] + '/published/history.log';
      console.log('core:',core);
 }

/* 
promisedConfig.then( cfg => {
 console.log('ipfs.promisedConfig:',promisedConfig);
 console.log('ipfs.promisedConfig.then.config:',cfg);
 configure(cfg);
})
.catch(console.error);
*/

function configure(cfg) {

   if (typeof(api_url) == 'undefined') {
      if (typeof(cfg) != 'undefined') {
         api_url = cfg.api_url;
      } else {
         api_url = 'http://127.0.0.1:5001/api/v0/';
      }
      console.info('api_url: ',api_url)
   }
   if (typeof(gw_url) == 'undefined') {
      if (typeof(cfg) != 'undefined') {
         gw_url = cfg.gw_url;
      } else {
         gw_url = 'http://127.0.0.1:8080';
      }
      console.info('gw_url: ',gw_url)
   }

   //var container = document.getElementsByClassName('container');
   if (typeof(ipfsversion) == 'undefined') {
      ipfsVersion().then( v => { window.ipfsversion = v })
   } else {
      let [callee, caller] = functionNameJS();
      console.info(caller+'.'+callee+'.ipfsversion: ',ipfsversion);
   }

   promisedPeerId = getPeerId();

}


// --------------------------------------------

function ipfsVersion() {
   let url = api_url + 'version';
   return fetch(url,{ method:'POST' })
   .then( resp => resp.json() )
   .then( obj => {
      console.log('ipfs.version.obj: ',obj);
      return obj.Version; })
   .catch(console.error)
}

// loading a config via "smart-contract" side channel
async function load_config(cfg_url) {
  return fetch(cfg_url)
  .then( resp => resp.json() )
  .then( json => {
        if (typeof(json) != 'undefined') {
          return Promise.resolve(json)
        } else {
          console.error('check if serve_config is running');
          return Promise.reject(json)
        }
  })
  .catch(console.error)
}


/* this portion of the code need to be on the app side ...
// get and replace the peer id ...
if (typeof(peerid) == 'undefined') {
    var peerid;
    getPeerId()
	.then(id => { peerid = (typeof(id) == 'undefined') ? 'QmYourIPFSisNotRunning' : id; return peerid })
    //.then( replaceNameInGlobalContainer('peerid'))
    // .then( replaceNameInClass('peerid','container') )
	.then( replacePeerIdInForm )
	.then( peerid => {
	    let s = peerid.substr(0,7);
	    console.debug('main.s:',s);
	    replaceInTagsByClassName('shortid',s)
	})
	.catch(logError);

}

function replacePeerIdInForm(id) { 
    let [callee, caller] = functionNameJS();
    console.debug(callee+'.input.id',id);

    let forms = document.getElementsByTagName('form');
    console.debug(callee+'.forms: ',forms);
    if (forms.length > 0) { 
	let e = forms[0].elements['peerid'];
	if (typeof(e) != 'undefined') {
	    console.debug(callee+'.e.outerHTML',e.outerHTML)
	    e.value = e.value.replace(new RegExp(':peerid','g'),id)
	}
    }
    return id
}
*/

function getNid(string) {
  let [callee, caller] = functionNameJS();
  console.debug(callee+'.inputs:',{string})
  let sha2 = sha256(string)
  console.debug(callee+'.sha2:',sha2)
  let ns36 = BigInt('0x'+sha2).toString(36).substr(0,13)
  console.debug(callee+'.ns36:',ns36)
  return ns36
}

function shard_n_key(s) {
  let s2 = sha256(s)
  return [s2.substr(-4,3),s2.substr(0,18) ];

}
function getShard(s) {
   return sha256(s).substr(-4,3);
}

function hashkey(s) {
   return sha256(s).substr(0,18);
}

function shortqm(qm) {
   if (typeof(qm) != 'undefined') {
      return qm.substr(0,6)+'...'+qm.substr(-3)
   } else {
      return 'undefined';
   }
}

function indexlogfilename(mutable) {
    let shard = getShard(mutable);
    let indexlogf = core.dir+'/shards/'+shard+'/'+core.index;
    return indexlogf
}

async function ipfsPublish(pubpath) {
    let [callee, caller] = functionNameJS(); // logInfo("message !")
    console.debug(callee+'.inputs:',{pubpath});
    
    let parent;
    let pname;
    let fname;
    if (pubpath.match('/./')) {
       [parent,fname] = pubpath.split('/./');
       pname=parent.substr(parent.lastIndexOf('/')+1);
       fname = pname+'/'+fname;
    } else {
       parent = pubpath;
       let p = pubpath.slice(0,-1).lastIndexOf('/'); // (remove trailing / in directories
       console.debug(callee+'.p: ',p);
       //let grandparent = parent.substring(0,p)
       pname=parent.substr(p+1);
       fname = pname;
    }

    console.debug(callee+'.parent: ',parent);
    console.debug(callee+'.pname: ',pname);
    console.debug(callee+'.fname: ',fname);
    // get hash of parent
    let hash = await getMFSFileHash(parent);
       console.debug(callee+'.hash: ',hash);
    // get wrappper's hash of parent
    let whash = await getIpfsWrapperHash(pname,hash);
    let sha2 = sha256(parent);
    let shard = sha2.substr(-4,3);
    let key = sha2.substr(0,18); // truncate to 9 bytes
    console.debug(callee+'.parent: ',parent);
    console.debug(callee+'.sha2: ',sha2);
    console.debug(callee+'.key: ',key);
    //let record = hash+': '+parent;
    let record = key+': /ipfs/'+whash+'/'+fname+"\n";
    console.debug(callee+'.record: ',record);
    let indexlogf = core.dir+'/shards/'+shard+'/'+core.index;
    let lhash = await ipfsLogAppend(indexlogf,record);
    console.debug(callee+'.lhash:',lhash);
    let bhash = await getMFSFileHash(core.dir); // get hash of PoR
    // publish under self/peerid
    let ipath = await ipfsNamePublish('self','/ipfs/'+bhash);
    console.debug(callee+'.ipath:',ipath);
    let ppath = ipath+'/'+pname;
    console.debug(callee+'.ppath:',ppath);
    return ppath;
}

function ipfsGetKeyByName(symb) {
    let [callee, caller] = functionNameJS(); // logInfo("message !")
    console.debug(callee+'.inputs:',{symb});
    var url = api_url + 'key/list?l=true&ipns-base=b58mh'
    return fetchGetPostJson(url)
	.then( json => {
      let key_obj = json.Keys.find( e => e.Name == symb )
      console.debug(callee+'.key_obj:',key_obj)
      return key_obj.Id
       
     })
	.catch(logError)
}

function ipfsGetKeyByName(symb) {
    let [callee, caller] = functionNameJS(); // logInfo("message !")
    console.debug(callee+'.inputs:',{symb});
    var url = api_url + 'key/list?l=true&ipns-base=b58mh'
    return fetchGetPostJson(url)
	.then( json => {
      let key_obj = json.Keys.find( e => e.Name == symb )
      console.debug(callee+'.key_obj:',key_obj)
      return key_obj.Id

     })
	.catch(logError)
}

function ipfsGetKeyByName(symb) {
    let [callee, caller] = functionNameJS(); // logInfo("message !")
    console.debug(callee+'.inputs:',{symb});
    var url = api_url + 'key/list?l=true&ipns-base=b58mh'
    return fetchGetPostJson(url)
	.then( json => {
      let key_obj = json.Keys.find( e => e.Name == symb )
      console.debug(callee+'.key_obj:',key_obj)
      return key_obj.Id
       
     })
	.catch(logError)
}

function ipfsNamePublish(k,v) {
    let [callee, caller] = functionNameJS(); // logInfo("message !")
    console.debug(callee+'.inputs:',{k,v});
    var url = api_url + 'name/publish?key='+k+'&arg='+v+'&allow-offline=1&resolve=0';
    return fetchGetPostJson(url)
	.then( json => { return json.Value })
	.catch(console.error)
}
function ipfsNameResolve(k) {
    let [callee, caller] = functionNameJS(); // logInfo("message !")
    console.debug(callee+'.inputs:',{k});
    var url = api_url + 'name/resolve?arg='+k;
    let promise = fetchGetPostJson(url)
    .then( json => {
      ipns_cache[k] = json.Path;
      console.debug(callee+`.info: UPDATE ipns_cache[${k}]:`,ipns_cache[k]);
      return json.Path }
    )
    .catch(console.error);

    if (typeof(ipns_cache[k]) != 'undefined') { 
       console.debug(callee+`.info: HIT ipns_cache[${k}]:`,ipns_cache[k]);
       return(ipns_cache[k]);
    } else {
      console.debug(callee+'.info: MISS promised:',promise);
      return promise;
    }
}
function ipfsResolve(ipath) {
    let [callee, caller] = functionNameJS(); // logInfo("message !")
    console.debug(callee+'.inputs:',{ipath});
    var url = api_url + 'resolve?arg='+ipath+'&timeout=61s';
    return fetchGetPostJson(url)
    .then( json => {
       if (typeof(json) != 'undefined') {
        return json.Path
        } else {
         return undefined
        }
    } )
	  .catch(console.error)
   
}


function ipfsSetToken(string) { // pin=true
  let [callee, caller] = functionNameJS(); // logInfo("message !")
  console.debug(callee+'.inputs:',{string});
  let url = api_url + 'add?file=content.dat&raw-leaves=true&hash=sha3-224&only-hash=false&cid-base=base58btc&pin=true'
  return fetchPostText(url,string)
  .then( resp => resp.json() )
  .then( json => json.Hash )
  .catch(logError)
}
function ipfsGetToken(string) { // only-hash
  let [callee, caller] = functionNameJS(); // logInfo("message !")
  console.debug(callee+'.inputs:',{string});
  let url = api_url + 'add?file=content.dat&raw-leaves=true&hash=sha3-224&only-hash=true&cid-base=base58btc&pin=false'
  return fetchPostText(url,string)
  .then( resp => resp.json() )
  .then( json => json.Hash )
  .catch(logError)
}

function ipfsFindProvs(key) {
   let [callee, caller] = functionNameJS();
   // num-providers=20&timeout=61s
   return fetch(api_url+'dht/findprovs?arg='+key+'&verbose=true&num-providers=4&timeout=5s',{ method:'POST', mode: 'cors' })
      .then( resp => resp.text() )
      .then( text => {
           let objs = text.replace(/(\n|\r)+$/, '').split("\n");
           let provs = objs.map( (s) => JSON.parse(s) ).filter( (o) => o.Type == 4 );
           console.debug(callee+'.provs:',provs)
           let peerids = provs.map( (o) => o.Responses[0].ID );
           return peerids;
      })
      .catch(console.error);
}

function ipfsAddToken(string) {
    let [callee, caller] = functionNameJS(); // logInfo("message !")
    console.debug(callee+'.inputs:',{string});
    let url = api_url + 'add?file=content.dat&raw-leaves=true&hash=sha3-224&cid-base=base58btc&pin=true'
    return fetchPostText(url,string)
  	.then( resp => resp.json() )
  	.then( json => json.Hash )
	  .catch(logError)
}
function ipfsAddBinaryContent(string) {
    let [callee, caller] = functionNameJS(); // logInfo("message !")
    console.debug(callee+'.inputs:',{string});
    
    let url = api_url + 'add?file=content.dat&cid-version=0'
    return fetchPostBinary(url,string)
	.then( resp => resp.json() )
	.then( json => json.Hash )
	.catch(logError)
}
function ipfsAddRawContent(string) {
    let [callee, caller] = functionNameJS(); // logInfo("message !")
    console.debug(callee+'.inputs:',{string});
    let url = api_url + 'add?file=content.dat&raw-leaves=true&cid-base=base58btc'
    return fetchPostBinary(url,string)
	.then( resp => resp.json() )
	.then( json => json.Hash )
	.catch(logError)
}

function ipfsAddBinaryContent(string) {
    let [callee, caller] = functionNameJS(); // logInfo("message !")
    console.debug(callee+'.inputs:',{string});
    
    url = api_url + 'add?file=content.dat&cid-version=0'
    return fetchPostBinary(url,string)
	.then( resp => resp.json() )
	.then( json => json.Hash )
	.catch(logError)
}

function ipfsAddBinaryFile(file) {
    let [callee, caller] = functionNameJS(); // logInfo("message !")
    console.debug(callee+'.inputs:',{file});

    return readAsBinaryString(file)
	.then( buf => {
	    url = api_url + 'add?file=file.txt&cid-version=0'
	    return fetchPostBinary(url,buf)
		.then( resp => resp.json() )
		.then( json => json.Hash )
		.catch(logError)
	})
	.catch(logError)
}
function ipfsAddTextContent(string) {
    let [callee, caller] = functionNameJS(); // logInfo("message !")
    console.debug(callee+'.inputs:',{string});
    
    url = api_url + 'add?file=content.txt&cid-version=0'
    return fetchPostText(url,string)
	.then( resp => resp.json() )
	.then( json => json.Hash )
	.catch(logError)
}

function ipfsAddTextFile(file) {
    let [callee, caller] = functionNameJS(); // logInfo("message !")
    console.debug(callee+'.inputs:',{file});

    return readAsText(file)
	.then( buf => {
	    // curl -X POST -F file=@myfile "http://127.0.0.1:5001/api/v0/add?quiet=0&quieter=0&silent=0&progress=0&trickle=0&only-hash=1
	    //  &wrap-with-directory=0&chunker=size-262144&pin=1&raw-leaves=1
	    //  &nocopy=0&fscache=1&cid-version=0&hash=sha2-256&inline=0&inline-limit=32"
	    url = api_url + 'add?file=file.txt&cid-version=0&only-hash=1'
	    return fetchPostText(url,buf)
		.then( resp => resp.json() )
		.then( json => json.Hash )
		.catch(logError)
	})
	.catch(logError)
}

function getJsonByMFSPath(path) {
    let [callee, caller] = functionNameJS(); // logInfo("message !")
    console.debug(callee+'.inputs:',{path});

    let  url = api_url + 'files/read?arg='+path
    return fetchGetPostJson(url)
}

function getMFSFileContent(path) {
    let [callee, caller] = functionNameJS(); // logInfo("message !")
    console.debug(callee+'.inputs:',{path});

    let  url = api_url + 'files/read?arg='+path
    return fetchRespCatch(url)
}

function ipfsGetBinaryByHash(hash) {
    let [callee, caller] = functionNameJS(); // logInfo("message !")
    console.debug(callee+'.inputs:',{hash});
    url = api_url + 'cat?arg='+hash
    console.debug('url: '+url);
    return fetchGetPostBinary(url)
  	.catch(console.Error)
}

function ipfsGetContentByHash(hash) {
    let [callee, caller] = functionNameJS(); // logInfo("message !")
    console.debug(callee+'.inputs:',{hash});

    url = api_url + 'cat?arg='+hash+'&timeout=300s'
    console.debug('url: '+url);
    return fetchRespCatch(url)
	.catch(console.error)
}

function ipfsGetHashBinary(hash,timeout) {
    let [callee, caller] = functionNameJS(); // logInfo("message !")
    console.debug(callee+'.inputs:',{hash,timeout});
    if (typeof(timeout) == 'undefined') { timeout = 120 }
    url = api_url + 'cat?arg='+hash+'&timeout='+timeout+'s'
    console.debug('url: '+url);
    return fetchGetPostBinary(url)
  	.catch(console.error)
}

function ipfsGetHashContent(hash,timeout) {
    let [callee, caller] = functionNameJS(); // logInfo("message !")
    console.debug(callee+'.inputs:',{hash,timeout});
    if (typeof(timeout) == 'undefined') { timeout = 120 }
    url = api_url + 'cat?arg='+hash+'&timeout='+timeout+'s'
    console.debug('url: '+url);
    return fetchRespCatch(url)
	.catch(console.error)
}

function ipfsGetContentByPath(path) { // no timeout
    url = api_url + 'cat?arg='+path;
    return fetchRespCatch(url)
	.catch(console.error)
}

function ipfsGetHashByContent(buf) {
    let [callee, caller] = functionNameJS(); // logInfo("message !")
    console.debug(callee+'.inputs:',[{buf}]);
    // DO NOT STORE CONTENT !
    url = api_url + 'add?only-hash=true&cid-version=0'
    console.debug(callee+'.url: '+url);
    return fetchPostBinary(url,buf)
	.then( resp => resp.json() )
	.then( json => json.Hash )
	.catch(console.error)
}
const ipfsGetContentHash  = ipfsPostHashByContent
function ipfsPostHashByContent(buf) {
    let [callee, caller] = functionNameJS(); // logInfo("message !")
    console.debug(callee+'.inputs:',[{buf}]);
    url = api_url + 'add?file=blob.data&cid-version=0'
    console.debug(callee+'.url: '+url);
    return fetchPostBinary(url,buf)
	.then( resp => resp.json() )
	.then( json => json.Hash )
	.catch(console.error)
}

function ipfsPostHashByObject(obj) {
    let [callee, caller] = functionNameJS(); // logInfo("message !")
    console.debug(callee+'.inputs:',{obj});
    url = api_url + 'add?file=blob.data&cid-version=0'
    console.debug(callee+'.url: '+url);
    let buf = JSON.stringify(obj);
    return fetchPostBinary(url,buf)
	.then( resp => resp.json() )
	.then( json => { console.warn(callee+'.json:',callee+'.json:',json); return json; })
	.then( json => json.Hash )
	.catch(logError)
}



function ipfsPostSHA1ByContent(buf) {
   let [callee, caller] = functionNameJS(); // logInfo("message !")
   console.debug(callee+'.inputs:',[{buf}]);
   url = api_url + 'add?file=blob.data&hash=sha1&cid-base=base58btc&only-hash=false&pin=false'
      console.debug(callee+'.url: '+url);
   return fetchPostBinary(url,buf)
      .then( resp => resp.json() )
      .then( json => {
            console.debug(callee+'.sha1:',json.Hash);
            return json.Hash
            })
      .catch(console.error)
}


function ipnsGetContentByKey(key) {
    let [callee, caller] = functionNameJS(); // logInfo("message !")
    console.debug(callee+'.inputs:',{key});

    url = api_url + 'cat?arg=/ipns/'+key
    console.debug(callee+'.url: '+url);
    return fetchGetPostText(url)
	.then( obj => { console.log(callee+'.obj:',obj);
    if (typeof(obj.status) != undefined) { // error
      return obj.status + ' ' + obj.statusText
    } else {
      return obj
    }
   })
  .catch(logError)

}

function ipfsLsofPath(ipfspath) {
    let [callee, caller] = functionNameJS();
    console.debug(callee+'.inputs:',{ipfspath});
    url = api_url + 'ls?arg='+ipfspath
    console.debug(callee+'.url: '+url);
    return fetchGetPostJson(url)
	.then( json => { console.log(callee+'.json:',json); return json.Objects[0]; })
  .catch(logError)
}

function ipfsPinAdd(hash) {
    let [callee, caller] = functionNameJS(); // logInfo("message !")
    console.debug(callee+'.inputs:',{hash});

    let url = api_url + 'pin/add?arg=/ipfs/'+hash+'&progress=true'
    return fetchGetPostJson(url)
	.then(json => { console.debug(callee+'.json',json); return json })
	.catch(err => console.error(err, hash))
}

function ipfsPinRm(hash) {
    let [callee, caller] = functionNameJS(); // logInfo("message !")
    console.debug(callee+'.inputs:',{hash});

    let url = api_url + 'pin/rm?arg=/ipfs/'+hash
    console.log('ipfsPinRm.url',url)
    return fetchGetPostJson(url)
	.then( json => { console.log('ipfsPinRm.json',json);
	    return json.Pins  // Improve when recursive ?
	})
	.catch(err => console.error(err, hash))
}

function getPinStatus(hash) { // getdata
    let [callee, caller] = functionNameJS(); // logInfo("message !")
    console.debug(callee+'.inputs:',{hash});

    let  url = api_url + 'pin/ls?arg=/ipfs/'+hash+'&type=all'
    return fetchRespNoCatch(url)
	.then( obj => {
	    let status;
	    if (typeof(obj.Code) == 'undefined') {
		status = obj.Keys[hash].Type
	    } else {
		status = 'unpinned'
	    }
	    console.debug(callee+': '+hash+" \u21A6",status);
	    return Promise.resolve(status)
	})
	.catch( obj => { logError('getPinStatus.catch',obj) })
}

function ipfsRmMFSFileUnless06(mfspath) {
    let [callee, caller] = functionNameJS(); // logInfo("message !")
    console.debug(callee+'.inputs:',{mfspath});

    if (ipfsversion.substr(0,3) == '0.6') {
	console.log('info: assumed truncates works !')
	return Promise.resolve('noop');
    } else {
	url = api_url + 'files/rm?arg='+mfspath
	return fetch(url,{method:'POST'})
	    .then( resp => {
		if (resp.ok) { return resp.text(); }
		else { return resp.json(); }
	    })
	    .catch(logError)
    }
}

function ipfsRmMFSFile(mfspath) {
    let [callee, caller] = functionNameJS(); // logInfo("message !")
    console.debug(callee+'.inputs:',{mfspath});

    url = api_url + 'files/rm?arg='+mfspath
    return fetch(url,{method:'POST'})
	.then( resp => {
	    if (resp.ok) { return resp.text(); }
	    else { return resp.json(); }
	})
	.catch(logError)
}

function ipfsCpMFSFile(target,source) {
    let [callee, caller] = functionNameJS(); // logInfo("message !")
    console.debug(callee+'.inputs:',{target,source});

    url = api_url + 'files/cp?arg='+source+'&arg='+target;
    return fetch(url,{method:'POST'})
	.then( resp => {
	    console.log('resp: ',resp)
	    if (resp.ok) { return resp.text(); }
	    else { return resp.json(); }
	})
	.catch(logError)

}

function ipfsWriteContent(mfspath,buf) {
    let [callee, caller] = functionNameJS(); // logInfo("message !")
    console.debug(callee+'.inputs:',[{mfspath,buf}]);
    
    // truncate doesn't work for version <= 0.4 !
    // so it does a rm before
    return createParent(mfspath)
	.then(ipfsRmMFSFileUnless06(mfspath))
	.then( _ => {
	    var url = api_url + 'files/write?arg=' + mfspath + '&create=true&truncate=true';
	    return fetchPostBinary(url, buf) // <--------- Binary !
		.then( _ => getMFSFileHash(mfspath)) 
		.catch(logError)
	})
	.catch(console.warn)
}

function ipfsWriteText(mfspath,buf) { // truncate doesn't work for version < 0.5 !
    let [callee, caller] = functionNameJS(); // logInfo("message !")
    console.debug(callee+'.inputs:',[{mfspath,buf}]);

    return createParent(mfspath)
	.then(ipfsRmMFSFileUnless06(mfspath))
	.then( _ => {
	    var url = api_url + 'files/write?arg=' + mfspath + '&create=true&truncate=true';
	    return fetchPostText(url, buf) // <--------
		.then( _ => getMFSFileHash(mfspath)) 
		.catch(logError)
	})
	.catch(consol.warn)
}

async function ipfsFileAppend(data,file) { // easy way: read + create !
    let [callee, caller] = functionNameJS(); // logInfo("message !")
    console.debug(callee+'.inputs',{data,file});

    let buf = await getMFSFileContent(file)
    buf += data+"\n"
    console.debug(callee+'.buf:',buf)
    let status = await ipfsWriteText(file,buf);
    console.debug(callee+'.write.status:',status)
    let hash = await getMFSFileHash(file)
    console.debug(callee+'.hash: ',hash)
    return hash
}

async function ipfsShardedFileAppend(data,file) { // easy way: read + create !
    let [callee, caller] = functionNameJS(); // logInfo("message !")
    console.debug(callee+'.inputs:',{data,file});

    let buf = await getMFSFileContent(file)
    buf += data+"\n"
    console.debug(callee+'.buf:',buf)
    let status = await ipfsWriteText(file,buf);
    console.debug(callee+'.write.status:',status)
    let hash = await getMFSFileHash(file)
    console.debug(callee+'.hash: ',hash)
    return hash
}

async function getIpfsWrapperHash(name,hash) {
    let [callee, caller] = functionNameJS(); // logInfo("message !")
    console.debug(callee+'.inputs:',{name,hash});

    //name = name.substring(0,name.indexOf('/'));
    name = name.split('/')[0]
    console.debug(callee+'.name:',name);
    const emptyd = 'QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn';
    var url = api_url + 'object/patch/add-link?arg='+emptyd +'&arg=' + name + '&arg=' + hash;
    let obj = await fetch(url,{ method: "POST"} ).then( resp => resp.json() ).catch(console.error)
    console.debug(callee+'.obj:',obj);
    let whash = obj.Hash;
    return whash
}

function ipfsWriteBinary(mfspath,buf) { // truncate doesn't work for version < 0.5 !
    let [callee, caller] = functionNameJS(); // logInfo("message !")
    console.debug(callee+'.inputs:',[{mfspath,buf}]);

    return createParent(mfspath)
	.then(ipfsRmMFSFileUnless06(mfspath))
	.then( _ => {
	    var url = api_url + 'files/write?arg=' + mfspath + '&create=true&truncate=true';
	    return fetchPostBinary(url, buf)
		.then( _ => getMFSFileHash(mfspath)) 
		.catch(logError)
	})
	.catch(console.warn)
}

function ipfsWriteJson(mfspath,obj) {
    let [callee, caller] = functionNameJS(); // logInfo("message !")
    console.debug(callee+'.inputs:',{mfspath,obj});

    return createParent(mfspath)
	.then(ipfsRmMFSFileUnless06(mfspath))
	.then( _ => {
	    var url = api_url + 'files/write?arg=' + mfspath + '&create=true&truncate=true';
	    return fetchPostJson(url, obj)
		.then( _ => getMFSFileHash(mfspath)) 
		.catch(logError)
	})
	.catch(console.log)
}

async function makeItRaw(mfspath) {
  let [callee, caller] = functionNameJS(); // logInfo("message !")
  let hash = await getMFSFileHash(mfspath); 
  console.debug(callee+'.hash:',hash);
  console.debug(callee+'.hash16:',hash.toString(16));
  if (! hash.toString(16).match(/^0155/)) {
   let  url = api_url + 'files/read?arg='+path
   let buf = await fetchRespCatch(url)
   console.debug(callee+'.buf:',buf);

   url = api_url + 'files/write?arg=' + mfspath + '&raw-leaves=true&trickle=true&cid-base=base58btc&create=true&truncate=true';
   return fetchPostBinary(url, buf)
   .then( _ => getMFSFileHash(mfspath)) 
   .catch(console.error)
  } else {
   return hash;
  }
}

function ipfsLogAppend(mfspath,record) {
   let [callee, caller] = functionNameJS(); // logInfo("message !")
   console.debug(callee+'.inputs:',[{mfspath,record}]);

   // note is file doesn't exist then 
   return createParent(mfspath)
      .then( _ => getMFSFileSize(mfspath))
      .then( offset => {
            console.debug(mfspath,': offset=',offset);
            let url = api_url + 'files/write?arg=' + mfspath + '&raw-leaves=true&cid-base=base58btc&create=true&truncate=false&offset='+offset;
            return fetchPostText(url, record) // /!\ no "\n" is inserted by default, please add your own if necessary !
            .then( _ => getMFSFileHash(mfspath)) 
            })
   .catch(logError)
}

function createParent(path) {
    let [callee, caller] = functionNameJS(); // logInfo("message !")
    console.debug(callee+'.inputs:',{path});

    let dir = path.replace(new RegExp('/[^/]*$'),'');
    var url = api_url + 'files/stat?arg=' + dir + '&size=true'
    return fetch(url, {method:'POST'})
	.then( resp => resp.json() )
	.then( json => {
        if (typeof(json.Code) == 'undefined') {
        console.debug(callee+'.dir:',dir);
        console.debug(callee+'.json:',json);
        return json;
        } else {
        // {"Message":"file does not exist","Code":0,"Type":"error"}
        console.debug(callee+'.! -e dir',dir);
        console.debug(callee+'.json',json)
        url = api_url + 'files/mkdir?arg=' + dir + '&parents=true'
        return fetch(url,{method:'POST'})
        .then(
              resp => {
              console.debug(callee+'.mkdir.resp:',resp)
              if (resp.ok) { // if mkdir sucessful, return hash
              var url = api_url + 'files/stat?arg=' + dir + '&size=true'
              return fetch(url,{method:'POST'})
              .then( resp => resp.json() )
              } else {
              Promise.reject(new Error(resp.statusText))
              }
              })
        .then ( obj => { console.debug(callee+'.obj: ',obj); return obj })
           .catch(logError)
        } 
	})
	.catch(console.log)
}

function getMFSFileSize(mfspath) { // size returned by stat depend on integrity of body ...
   let [callee, caller] = functionNameJS(); // logInfo("message !")
   var url = api_url + 'files/stat?arg=' + mfspath + '&size=true'
   console.debug(callee+'.url:',url);
      return fetch(url,{method:'POST'})
      .then( resp => resp.json() )
      .then( json => { return (typeof json.Size == 'undefined') ? 0 : json.Size } )
      .catch(console.log)
}

function ipfsMkdir() {
   let [callee, caller] = functionNameJS(); // logInfo("message !")
   var url = api_url + 'object/new?arg=unixfs-dir';
   return fetch(url,{method:'POST'})
   //  .then( resp => { console.log(callee+'.resp:'); return resp; } )
      .then( resp => resp.json() )
      .then( json => { return json.Hash; })
   .catch(console.error)
}

function mfsRemove(mfspath) {
   var url = api_url + 'files/rm?arg='+mfspath+'&recursive=true';
   return fetch(url,{method:'POST'})
      .then(validateResp)
   .catch(console.error)
}
function mfsCopy(hash,mfspath) {
   let [callee, caller] = functionNameJS(); // logInfo("message !")
   console.log(callee+'.inputs:',{hash});
   var url = api_url + 'files/cp?arg=/ipfs/'+hash+'&arg='+mfspath;
   console.log(callee+'.url:',url);
   return fetch(url,{method:'POST'})
   .then( resp => resp.text() )
   .then( text => { console.log(callee+'.text:',text); })
   .then( _ => { return getMFSFileHash(mfspath); })
   .catch(console.error)


}
function ipfsRemove(name,hash) {
   let [callee, caller] = functionNameJS(); // logInfo("message !")
   var url = api_url + 'object/patch/rm-link?arg='+hash+'&arg='+name
     return fetch(url,{method:'POST'})
     .then( resp => resp.json() )
     .then( json => { return json.Hash; })
   .catch(logError)
   
}
async function ipfsCopy(mfspath,hash) {
   let [callee, caller] = functionNameJS(); // logInfo("message !")
   let link = await getMFSFileHash(mfspath);
   console.log(callee+'.link:',link);
   let name = basename(mfspath);
   console.log(callee+'.name:',name);
   if (link != qmNull) {
     var url = api_url + 'object/patch/add-link?arg='+hash+'&arg='+name+'&arg='+link;
     console.log(callee+'.url:',url);
     return fetch(url,{method:'POST'})
     .then( resp => resp.json() )
     .then( json => { return json.Hash; })
   .catch(logError)
   }
}

function ipfsExists(path,qm) {
   let [callee, caller] = functionNameJS(); // logInfo("message !")
   var url = api_url + 'files/stat?arg=/ipfs/'+qm+path+'&hash=true';
   return fetch(url,{method:'POST'})
      .then( resp => { console.log(callee+'.resp:'); return resp; } )
      .then( resp => resp.json() )
      .then( json => {
            if (typeof json.Hash == 'undefined') {
              return [false,null]
            } else {
              return [true,json.Hash]
            }
        })
   .catch(console.error)
}

function mfsExists(mfspath) {
   let [callee, caller] = functionNameJS(); // logInfo("message !")
   var url = api_url + 'files/stat?arg='+mfspath+'&hash=true'
   return fetch(url,{method:'POST'})
      .then( resp => { console.log(callee+'.resp:',resp); return resp; } )
      .then( resp => resp.json() )
      .then( json => {
            if (typeof json.Hash == 'undefined') {
              return [false,null]
            } else {
              return [true,json.Hash]
            }
        })
   .catch(console.error)
}
function mfsLs(mfspath) {
   let [callee, caller] = functionNameJS(); // logInfo("message !")
   var url = api_url + 'files/ls?arg='+mfspath+'&long=true&U=true';
   return fetch(url,{method:'POST'})
      .then( resp => resp.json() )
      .then( json => {
            return json
            })
   .catch(console.error)
}

function getMFSFileHash(mfspath) { // alias mfsGetHashByPath
   let [callee, caller] = functionNameJS(); // logInfo("message !")
   console.debug(callee+'.inputs:',{mfspath});

   var url = api_url + 'files/stat?arg='+mfspath+'&hash=true'
      return fetch(url,{method:'POST'})
      .then( resp => resp.json() )
      .then( json => {
            if (typeof json.Hash == 'undefined') {
            if (typeof(qmEmpty) != 'undefined') { return qmEmpty }
            else { console.debug(callee+'.json.Hash: undefined'); return qmNull }
            } else {
            return json.Hash
            }
            })
   .catch(logError)
}

function fetchAPI(url) {
   let [callee, caller] = functionNameJS(); // logInfo("message !")
   console.debug(callee+'.inputs:',{url});
   return fetch(url,{method:'POST'})
      .then(obj => { return obj; })
      .catch(console.log)
}

function getPeerId() {
   let url = api_url + 'config?&arg=Identity.PeerID&encoding=json';
   return fetch(url,{ method: 'POST'} )
      .then( resp => resp.json() )
      .then( obj => {
            if (typeof(obj) != 'undefined') {
            return Promise.resolve(obj.Value)
            } else {
            return Promise.reject(obj)
            }
            })
   .catch(console.error)
}

