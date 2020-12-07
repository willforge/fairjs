// ipfs routines
//
// deps:
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

var thisscript = document.currentScript
thisscript.version = '1.1';
thisscript.name = thisscript.src.replace(RegExp('.*/([^/]+)$'),"$1");

// if experimental then switch to '../' (i.e. use local js)
if (thisscript.className.match('exp') && document.location.href.match('michelc') ) {
    let src = thisscript.src.replace(RegExp('.*/github\.(?:com|io)/'),'../')
    thisscript.remove();
    var script = document.createElement('script');
    script.src = src;
    console.log(thisscript.name+'.adding:',script.src);
    document.getElementsByTagName('head')[0].appendChild(script);
}

console.log(thisscript.name+': '+thisscript.src+' ('+thisscript.version+')');

// --------------------------------------------
// global variables ...
if (typeof(core) == 'undefined') {
    var core = {};
    core['name'] = 'fairRings™'
    core['index'] = 'frindex.log'
    core['dir'] = '/.../.frings';
    core['history'] = core['dir'] + '/published/history.log'
  console.log('core:',core)
}

if (typeof(api_url) == 'undefined') {
    var api_url = 'http://127.0.0.1:5001/api/v0/'
    console.log('api_url: ',api_url)
}
if (typeof(gw_url) == 'undefined') {
    var gw_url = 'http://127.0.0.1:8080'
    console.log('gw_url: ',gw_url)
}

var container = document.getElementsByClassName('container');
if (typeof(ipfsversion) == 'undefined') {
    ipfsVersion().then( v => { window.ipfsversion = v })
} else {
    let [callee, caller] = functionNameJS();
    console.debug("TEST."+callee+'.ipfsversion: ',ipfsversion);
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

var promisedPeerId = getPeerId()

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
  console.log(callee+'.input.string:',string)
  let sha2 = sha256(string)
  console.log(callee+'.sha2:',sha2)
  let ns36 = BigInt('0x'+sha2).toString(36).substr(0,13)
  console.log(callee+'.ns36:',ns36)
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
   return qm.substr(0,6)+'...'+qm.substr(-3)
}

function indexlogfilename(mutable) {
    let shard = getShard(mutable);
    let indexlogf = core.dir+'/shards/'+shard+'/'+core.index;
    return indexlogf
}

async function ipfsPublish(pubpath) {
    let [callee, caller] = functionNameJS(); // logInfo("message !")
    console.debug(callee+'.input.pubpath',pubpath);
    
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
    let record = key+': /ipfs/'+whash+'/'+fname
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
    console.debug(callee+'.input.symb:',symb);
    var url = api_url + 'key/list?l=true&ipns-base=b58mh'
    return fetchGetPostJson(url)
	.then(consLog(callee))
	.then( json => {
      let key_obj = json.Keys.find( e => e.Name == symb )
      console.debug(callee+'.key_obj:',key_obj)
      return key_obj.Id
       
     })
	.catch(logError)
}

function ipfsNamePublish(k,v) {
    let [callee, caller] = functionNameJS(); // logInfo("message !")
    console.debug(callee+'.input.k:',k);
    console.debug(callee+'.input.v:',v);
    var url = api_url + 'name/publish?key='+k+'&arg='+v+'&allow-offline=1&resolve=0';
    return fetchGetPostJson(url)
	.then(consLog('ipfsNamePublish'))
	.then( json => { return json.Value })
	.catch(logError)
}
function ipfsNameResolve(k) {
    let [callee, caller] = functionNameJS(); // logInfo("message !")
    console.debug(callee+'.input.k:',k);
    var url = api_url + 'name/resolve?arg='+k;
    //return '/ipfs/QmVFsEPkck1gUPvQ4tfft4AfjdkEQDz9qH7JbrEZBLRaPT'; // /!\ dbug ! CAUTION !
    return fetchGetPostJson(url)
    .then(consLog(callee))
    .then( json => { return json.Path } )
	  .catch(logError)
   
}

function ipfsGetToken(string) {
  let [callee, caller] = functionNameJS(); // logInfo("message !")
  console.debug(callee+'.input.string:',string);
  let url = api_url + 'add?file=content.dat&raw-leaves=true&hash=sha3-224&only-hash=true&cid-base=base58btc&pin=false'
  return fetchPostText(url,string)
  .then( resp => resp.json() )
  .then( json => json.Hash )
  .catch(logError)

}
function ipfsFindProvs(key) {
   let [callee, caller] = functionNameJS();
   return fetch(api_url+'dht/findprovs?arg='+key+'&verbose=true&num-providers=20&timeout=61s',{ method:'POST', mode: 'cors' })
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
    console.debug(callee+'.input.string:',string);
    let url = api_url + 'add?file=content.dat&raw-leaves=true&hash=sha3-224&cid-base=base58btc&pin=true'
    return fetchPostText(url,string)
  	.then( resp => resp.json() )
  	.then( json => json.Hash )
	  .catch(logError)
}
function ipfsAddBinaryContent(string) {
    let [callee, caller] = functionNameJS(); // logInfo("message !")
    console.debug(callee+'.input.string:',string);
    
    let url = api_url + 'add?file=content.dat&cid-version=0'
    return fetchPostBinary(url,string)
	.then( resp => resp.json() )
	.then( json => json.Hash )
	.catch(logError)
}
function ipfsAddRawContent(string) {
    let [callee, caller] = functionNameJS(); // logInfo("message !")
    console.debug(callee+'.input.string:',string);
    let url = api_url + 'add?file=content.dat&raw-leaves=true&cid-base=base58btc'
    return fetchPostBinary(url,string)
	.then( resp => resp.json() )
	.then( json => json.Hash )
	.catch(logError)
}

function ipfsAddBinaryFile(file) {
    let [callee, caller] = functionNameJS(); // logInfo("message !")
    console.debug(callee+'.input.file:',file);

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
    console.debug(callee+'.input.string:',string);
    
    url = api_url + 'add?file=content.txt&cid-version=0'
    return fetchPostText(url,string)
	.then( resp => resp.json() )
	.then( json => json.Hash )
	.catch(logError)
}

function ipfsAddTextFile(file) {
    let [callee, caller] = functionNameJS(); // logInfo("message !")
    console.debug(callee+'.input.file:',file);

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
    console.debug(callee+'.input.path:',path);

    let  url = api_url + 'files/read?arg='+path
    return fetchGetPostJson(url)
}

function getMFSFileContent(path) {
    let [callee, caller] = functionNameJS(); // logInfo("message !")
    console.debug(callee+'.input.path:',path);

    let  url = api_url + 'files/read?arg='+path
    return fetchRespCatch(url)
}

function ipfsGetBinaryByHash(hash) {
    let [callee, caller] = functionNameJS(); // logInfo("message !")
    console.debug(callee+'.input.hash:',hash);
    url = api_url + 'cat?arg='+hash
    console.debug('url: '+url);
    return fetchGetPostBinary(url)
  	.catch(console.Error)
}

const ipfsGetHashContent = ipfsGetContentByHash;
function ipfsGetContentByHash(hash) {
    let [callee, caller] = functionNameJS(); // logInfo("message !")
    console.debug(callee+'.input.hash:',hash);

    url = api_url + 'cat?arg='+hash+'&timeout=300s'
    console.debug('url: '+url);
    return fetchRespCatch(url)
	.then(consLog(callee))
	.catch(console.Error)
}

function ipfsGetContentByPath(path) { // no timeout
    url = api_url + 'cat?arg='+path;
    return fetchRespCatch(url)
	.catch(console.Error)
}

function ipfsGetHashByContent(buf) {
    let [callee, caller] = functionNameJS(); // logInfo("message !")
    console.debug(callee+'.input.buf:',buf);
    // DO NOT STORE CONTENT !
    url = api_url + 'add?only-hash=true&cid-vesion=0'
    console.debug(callee+'.url: '+url);
    return fetchPostBinary(url,buf)
	.then( resp => resp.json() )
	.then(consLog(callee))
	.then( json => json.Hash )
	.catch(logError)
}
const ipfsGetContentHash  = ipfsPostHashByContent
function ipfsPostHashByContent(buf) {
    let [callee, caller] = functionNameJS(); // logInfo("message !")
    console.debug(callee+'.input.buf:',buf);
    url = api_url + 'add?file=blob.data&cid-version=0'
    console.debug(callee+'.url: '+url);
    return fetchPostBinary(url,buf)
	.then( resp => resp.json() )
	.then(consLog(callee))
	.then( json => json.Hash )
	.catch(logError)
}

function ipfsPostHashByObject(obj) {
    let [callee, caller] = functionNameJS(); // logInfo("message !")
    console.debug(callee+'.input.obj:',obj);
    url = api_url + 'add?file=blob.data&cid-version=0'
    console.debug(callee+'.url: '+url);
    let buf = JSON.stringify(obj);
    return fetchPostBinary(url,buf)
	.then( resp => resp.json() )
	.then(consLog(callee))
	.then( json => json.Hash )
	.catch(logError)
}



function ipfsPostSHA1ByContent(buf) {
   let [callee, caller] = functionNameJS(); // logInfo("message !")
   console.debug(callee+'.input.buf:',buf);
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
    console.debug(callee+'.input.key:',key);

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

function ipfsLsofPath(path) {
    let [callee, caller] = functionNameJS();
    console.debug(callee+'.input.path:',path);
    url = api_url + 'ls?arg='+path
    console.debug(callee+'.url: '+url);
    return fetchGetPostJson(url)
	.then( json => { console.log(callee+'.json:',json); return json.Objects[0]; })
  .catch(logError)
}

function ipfsPinAdd(hash) {
    let [callee, caller] = functionNameJS(); // logInfo("message !")
    console.debug(callee+'.input.hash:',hash);

    let url = api_url + 'pin/add?arg=/ipfs/'+hash+'&progress=true'
    return fetchGetPostJson(url)
	.then(json => { console.debug(callee+'.json',json); return json })
	.catch(err => console.error(err, hash))
}

function ipfsPinRm(hash) {
    let [callee, caller] = functionNameJS(); // logInfo("message !")
    console.debug(callee+'.input.hash:',hash);

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
    console.debug(callee+'.input.hash:',hash);

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
    console.debug(callee+'.input.mfspath:',mfspath);

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
    console.debug(callee+'.input.mfspath:',mfspath);

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
    console.debug(callee+'.input.target:',target);
    console.debug(callee+'.input.source:',source);

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
    console.debug(callee+'.input.mfspath:',mfspath);
    console.debug(callee+'.input.buf:',buf);
    
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
	.catch(consLog('ipfsWriteContent'))
}

function ipfsWriteText(mfspath,buf) { // truncate doesn't work for version < 0.5 !
    let [callee, caller] = functionNameJS(); // logInfo("message !")
    console.debug(callee+'.input.mfspath:',mfspath);
    console.debug(callee+'.input.buf:',buf);

    return createParent(mfspath)
	.then(ipfsRmMFSFileUnless06(mfspath))
	.then( _ => {
	    var url = api_url + 'files/write?arg=' + mfspath + '&create=true&truncate=true';
	    return fetchPostText(url, buf) // <--------
		.then( _ => getMFSFileHash(mfspath)) 
		.catch(logError)
	})
	.catch(consLog('ipfsWriteText'))
}

async function ipfsFileAppend(data,file) { // easy way: read + create !
    let [callee, caller] = functionNameJS(); // logInfo("message !")
    console.debug(callee+'.input.data:',data);
    console.debug(callee+'.input.file:',file);

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
    console.debug(callee+'.input.data:',data);
    console.debug(callee+'.input.file:',file);

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
    console.debug(callee+'.input.name:',name);
    console.debug(callee+'.input.hash:',hash);

    //name = name.substring(0,name.indexOf('/'));
    name = name.split('/')[0]
    console.debug(callee+'.name:',name);
    const empty = 'QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn';
    var url = api_url + 'object/patch/add-link?arg='+empty +'&arg=' + name + '&arg=' + hash;
    let obj = await fetch(url,{ method: "POST"} ).then( resp => resp.json() ).catch(console.error)
    console.debug(callee+'.obj:',obj);
    let whash = obj.Hash;
    return whash
}

function ipfsWriteBinary(mfspath,buf) { // truncate doesn't work for version < 0.5 !
    let [callee, caller] = functionNameJS(); // logInfo("message !")
    console.debug(callee+'.input.mfspath:',mfspath);
    console.debug(callee+'.input.buf:',buf);

    return createParent(mfspath)
	.then(ipfsRmMFSFileUnless06(mfspath))
	.then( _ => {
	    var url = api_url + 'files/write?arg=' + mfspath + '&create=true&truncate=true';
	    return fetchPostBinary(url, buf)
		.then( _ => getMFSFileHash(mfspath)) 
		.catch(logError)
	})
	.catch(consLog('ipfsWriteBinary'))
}

function ipfsWriteJson(mfspath,obj) {
    let [callee, caller] = functionNameJS(); // logInfo("message !")
    console.debug(callee+'.input.mfspath:',mfspath);
    console.debug(callee+'.input.obj:',obj);

    return createParent(mfspath)
	.then(ipfsRmMFSFileUnless06(mfspath))
	.then( _ => {
	    var url = api_url + 'files/write?arg=' + mfspath + '&create=true&truncate=true';
	    return fetchPostJson(url, obj)
		.then( _ => getMFSFileHash(mfspath)) 
		.catch(logError)
	})
	.catch(consLog('ipfsWriteJson'))
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
   .catch(logError)
  } else {
   return hash;
  }
}

function ipfsLogAppend(mfspath,record) {
   let [callee, caller] = functionNameJS(); // logInfo("message !")
   console.debug(callee+'.input.mfspath:',mfspath);
   console.debug(callee+'.input.record:',record);

   return createParent(mfspath)
      .then( _ => getMFSFileSize(mfspath))
      .then( offset => {
            console.debug(mfspath,': offset=',offset);
            let url = api_url + 'files/write?arg=' + mfspath + '&raw-leaves=true&trickle=true&cid-base=base58btc&create=true&truncate=false&offset='+offset;
            return fetchPostText(url, record+"\n")
            .then( _ => getMFSFileHash(mfspath)) 
            })
   .catch(logError)
}

function createParent(path) {
    let [callee, caller] = functionNameJS(); // logInfo("message !")
    console.debug(callee+'.input.path:',path);

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
	.catch(consLog('Error:'))
}

function getMFSFileSize(mfspath) {
   let [callee, caller] = functionNameJS(); // logInfo("message !")
   console.debug(callee+'.input.mfspath:',mfspath);

   var url = api_url + 'files/stat?arg=' + mfspath + '&size=true'
      return fetch(url,{method:'POST'})
      .then( resp => resp.json() )
      .then(consLog('getMFSFileSize'))
      .then( json => { return (typeof json.Size == 'undefined') ? 0 : json.Size } )
      .catch(consLog('getMFSFileSize'))
}

function getMFSFileHash(mfspath) {
   let [callee, caller] = functionNameJS(); // logInfo("message !")
   console.debug(callee+'.input.mfspath:',mfspath);

   var url = api_url + 'files/stat?arg='+mfspath+'&hash=true'
      return fetch(url,{method:'POST'})
      .then( resp => resp.json() )
      .then( json => {
            if (typeof json.Hash == 'undefined') {
            if (typeof(qmEmpty) != 'undefined') { return qmEmpty }
            else { return 'QmYYY' }
            } else {
            return json.Hash
            }
            })
   .catch(logError)
}

function fetchAPI(url) {
   let [callee, caller] = functionNameJS(); // logInfo("message !")
   console.debug(callee+'.input.url:',url);

   return fetch(url,{method:'POST'})
      .then(obj => { return obj; })
      .catch(ConsLog('fetchAPI'))
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

