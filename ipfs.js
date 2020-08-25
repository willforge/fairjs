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
  core['name'] = 'blockRings™'
  core['index'] = 'brindex.log'
  core['history'] = 'history.log'
  core['dir'] = '/.brings';
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
  console.log("TEST."+callee+'.ipfsversion: ',ipfsversion);
}
// --------------------------------------------

function ipfsVersion() {
  let [callee, caller] = functionNameJS();
  let url = api_url + 'version'
  return fetchGetPostJson(url).then(
   obj => { console.log(callee+'.version.obj: ',obj); return obj.Version; })
  .catch(console.error)
}

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
  console.log('s: ',s);
  replaceInTagsByClassName('shortid',s)
})
.catch(logError);

}

function replacePeerIdInForm(id) { 
  let forms = document.getElementsByTagName('form');
  console.log('forms: ',forms);
  if (forms.length > 0) { 
     let e = forms[0].elements['peerid'];
     console.log('peerid: '+id)
     if (typeof(e) != 'undefined') {
       console.log(e.outerHTML)
       e.value = e.value.replace(new RegExp(':peerid','g'),id)
     }
  }
  return id
}

async function ipfsPublish(pubpath) {
   let [callee, caller] = functionNameJS(); // logInfo("message !")
   let parent;
   let pname;
   let fname;
   if (pubpath.match('/./')) {
      [parent,fname] = pubpath.split('/./');
      pname=parent.substr(parent.lastIndexOf('/')+1)
      fname = pname+'/'+fname;
   } else {
      parent = pubpath;
      let p = parent.slice(0,-1).lastIndexOf('/')
      console.log(callee+'.p: ',p);
      //let grandparent = parent.substring(0,p)
      pname=parent.substr(p+1)
      fname = pname;
   }

   console.log(callee+'.parent: ',parent);
   console.log(callee+'.pname: ',pname);
   console.log(callee+'.fname: ',fname);
   // get hash of parent
   let hash = await getMFSFileHash(parent);
   // get wrappper's hash of parent
   let whash = await getIpfsWrapperHash(pname,hash);
   let sha2 = sha256(parent);
   let shard = sha2.substr(-4,3);
   let key = sha2.substr(0,18); // truncate to 9 bytes
   console.log(callee+'.parent: ',parent);
   console.log(callee+'.sha2: ',sha2);
   console.log(callee+'.key: ',key);
   //let record = hash+': '+parent;
   let record = key+': /ipfs/'+whash+'/'+fname
   console.log(callee+'.record: ',record);
   let indexlogf = core.dir+'/shards/'+shard+'/'+core.index;
   let lhash = await ipfsLogAppend(indexlogf,record);
   console.log(callee+'.lhash:',lhash);
   let bhash = await getMFSFileHash(core.dir); // get hash of POR
   // publish under self/peerid
   let phash = await ipfsNamePublish('self','/ipfs/'+bhash);
   console.log(callee+'.phash:',phash);
   let ppath = '/ipfs/'+phash+'/'+pname;
   console.log(callee+'.ppath:',ppath);
   return ppath;

}

function ipfsNamePublish(k,v) {
    var url = api_url + 'name/publish?key='+k+'&arg='+v+'&allow-offline=1&resolve=0';
    return fetchGetPostJson(url)
    .then(consLog('ipfsNamePublish'))
    .then( json => { return json.Hash })
    .catch(logError)
}


function ipfsAddBinaryFile(file) {
 return readAsBinaryString(file)
 .then( buf => {
   url = api_url + 'add?file=file.txt&cid-version=0'
   return fetchPostBinary(url,buf)
   .then( resp => resp.json() )
   .then( json => json.Hash ).catch(logError)
 })
 .catch(logError)
}
function ipfsAddTextFile(file) {
 return readAsText(file)
 .then( buf => {
   // curl -X POST -F file=@myfile "http://127.0.0.1:5001/api/v0/add?quiet=0&quieter=0&silent=0&progress=0&trickle=0&only-hash=1
   //  &wrap-with-directory=0&chunker=size-262144&pin=1&raw-leaves=1
   //  &nocopy=0&fscache=1&cid-version=0&hash=sha2-256&inline=0&inline-limit=32"
   url = api_url + 'add?file=file.txt&cid-version=0&only-hash=1'
   return fetchPostText(url,buf)
   .then( resp => resp.json() )
   .then( json => json.Hash ).catch(logError)
 })
 .catch(logError)
}

function getMFSFileContent(path) {
   let  url = api_url + 'files/read?arg='+path
   return fetchRespCatch(url)
}

function ipfsGetContentHash(buf) {
 url = api_url + 'add?file=blob.data&cid-version=0&hash-only=1'
 console.log('url: '+url);
 return fetchPostBinary(url,buf)
 .then( resp => resp.json() )
 .then(consLog('ipfsGetContentHash'))
 .then( json => json.Hash )
 .catch(logError)

}

function ipfsRmMFSFileUnless06(mfspath) {
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
   url = api_url + 'files/rm?arg='+mfspath
   return fetch(url,{method:'POST'})
   .then( resp => {
      if (resp.ok) { return resp.text(); }
      else { return resp.json(); }
   })
   .catch(logError)
}
function ipfsCpMFSFile(target,source) {
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
// truncate doesn't work for version <= 0.4 !
// so it does a rm before
  return createParent(mfspath)
  .then(ipfsRmMFSFileUnless06(mfspath))
  .then( _ => {
    var url = api_url + 'files/write?arg=' + mfspath + '&create=true&truncate=true';
    return fetchPostBinary(url, buf)
    .then( _ => getMFSFileHash(mfspath)) 
    .catch(logError)
   })
   .catch(consLog('ipfsWriteContent'))
}
function ipfsWriteText(mfspath,buf) { // truncate doesn't work for version < 0.5 !
  return createParent(mfspath)
  .then(ipfsRmMFSFileUnless06(mfspath))
  .then( _ => {
     var url = api_url + 'files/write?arg=' + mfspath + '&create=true&truncate=true';
    return fetchPostText(url, buf)
    .then( _ => getMFSFileHash(mfspath)) 
    .catch(logError)
  })
  .catch(consLog('ipfsWriteText'))
}

async function ipfsFileAppend(data,file) { // easy way: read + create !
  let [callee, caller] = functionNameJS(); // logInfo("message !")
  let buf = await getMFSFileContent(file)
  buf += data+"\n"
  console.log(callee+'.buf:',buf)
  let status = await ipfsWriteText(file,buf);
  console.log(callee+'.write.status:',status)
  let hash = await getMFSFileHash(file)
  console.log(callee+'.hash: ',hash)
  return hash
}

async function ipfsShardedFileAppend(data,file) { // easy way: read + create !
  let [callee, caller] = functionNameJS(); // logInfo("message !")
  let buf = await getMFSFileContent(file)
  buf += data+"\n"
  console.log(callee+'.buf:',buf)
  let status = await ipfsWriteText(file,buf);
  console.log(callee+'.write.status:',status)
  let hash = await getMFSFileHash(file)
  console.log(callee+'.hash: ',hash)
  return hash
}

async function getIpfsWrapperHash(name,hash) {
   let [callee, caller] = functionNameJS(); // logInfo("message !")
   //name = name.substring(0,name.indexOf('/'));
   name = name.split('/')[0]
   console.log(callee+'.name:',name);
   const empty = 'QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn';
   var url = api_url + 'object/patch/add-link?arg='+empty +'&arg=' + name + '&arg=' + hash;
   let obj = await fetchGetPostJson(url);
   console.log(callee+'.obj:',obj);
   let whash = obj.Hash;
   return whash
}



function ipfsWriteBinary(mfspath,buf) { // truncate doesn't work for version < 0.5 !
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
function ipfsLogAppend(mfspath,record) {
  return createParent(mfspath)
  .then( _ => getMFSFileSize(mfspath))
  .then( offset => {
    console.log(mfspath,': offset=',offset);
    var url = api_url + 'files/write?arg=' + mfspath + '&raw-leave=true&trickle=true&cid-base=base58btc&create=true&truncate=false&offset='+offset;
    return fetchPostText(url, record+"\n")
  .then( _ => getMFSFileHash(mfspath)) 
  })
  .catch(logError)
}

function createParent(path) {
  console.log('createParent: '+path)
  let dir = path.replace(new RegExp('/[^/]*$'),'');
  var url = api_url + 'files/stat?arg=' + dir + '&size=true'
  return fetch(url, {method:'POST'}).then( resp => resp.json() )
  .then( json => {
    if (typeof(json.Code) == 'undefined') {
      console.log('-d '+dir + '; stat: ', json);
      return json;
    } else {
      // {"Message":"file does not exist","Code":0,"Type":"error"}
      console.log('! -e '+dir);
      console.log(json)
      url = api_url + 'files/mkdir?arg=' + dir + '&parents=true'
      return fetch(url,{method:'POST'}).then(
       resp => {
         console.log('mkdir.resp: ',resp)
         if (resp.ok) { // if mkdir sucessful, return hash
           var url = api_url + 'files/stat?arg=' + dir + '&size=true'
           return fetch(url,{method:'POST'}).then( resp => resp.json() )
         } else {
           Promise.reject(new Error(resp.statusText))
         }
       })
      .then ( obj => { console.log('mkdir: ',obj); return obj })
      .catch(logError)
    } 
  })
  .catch(consLog('Error:'))
}

function getMFSFileSize(mfspath) {
  var url = api_url + 'files/stat?arg=' + mfspath + '&size=true'
  return fetch(url,{method:'POST'})
  .then( resp => resp.json() )
  .then(consLog('getMFSFileSize'))
  .then( json => { return (typeof json.Size == 'undefined') ? 0 : json.Size } )
  .catch(consLog('getMFSFileSize'))
}
function getMFSFileHash(mfspath) {
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
     .catch(logError)
}

