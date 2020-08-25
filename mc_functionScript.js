// assumed api_url is already defined ...


var thisscript = document.currentScript
thisscript.version = '1.0';
thisscript.name = thisscript.src.replace(RegExp('.*/([^/]+)$'),"$1");
console.log(thisscript.name+': '+thisscript.version);

if (document.location.href.match('8088')) {
api_url = 'http://127.0.0.1:5021/api/v0/'
gw_url = 'http://127.0.0.1:8198'
}


function getInputValue(id) {
  let e = document.getElementById(id);
  if (typeof(e) !=  'undefined') {
    return e.value
  } else {
    let [callee, caller] = functionNameJS();
    console.error(callee+'.id: '+id+ 'not found');
  }
}

async function getStatofMfsPath(mfs_path) {
  let [callee, caller] = functionNameJS();
   let url = api_url + 'files/stat?arg='+mfs_path+'&hash=true&type=true'
   return fetchGetPostJson(url)
   .then(obj => {
    obj.Type = obj.Type.charAt(0).toUpperCase() + obj.Type.slice(1);
    console.log(callee+'.obj: ',obj);
    return obj;
    })
   .catch(console.error)
}  

function fetch_directory_content(mfs_path) {
   let [callee, caller] = functionNameJS(); // logInfo("message !")
   let parent_path = mfs_path + '../';
   let immutable = mfs_path.match(new RegExp('/ip[fn]s'));
   console.log(callee+'.immutable: ',immutable);

   if (mfs_path == '/' || immutable) {
      parent_path = '/';
   }
   console.log(callee+'.parent_path: '+parent_path)
      let promise_parent_hash = getHashofMfsPath(parent_path)

      let url; // .. long=true for IPFS 0.5
   let promise_dir_content
      if ( immutable ) {
         url = api_url + 'file/ls?arg='+mfs_path
            promise_dir_content = fetchRespCatch(url)
            .then( json => {
                  console.log(callee+'.immutable.ls.json: ',json)
                  let hash = json.Arguments[mfs_path]
                  let content = json.Objects[hash].Links
                  console.log(callee+'.file.ls: ',content)
                  json.Entries = content; // map as if it was a "files/ls" API call
                  const typetonum = { 'Directory': 1,'File': 0 }
                  json.Entries.forEach( e => { e.Type = typetonum[e.Type] } )
                  return json;
                  })

      } else if ( ipfsversion == '0.4.22') {
         url = api_url + 'files/ls?arg='+mfs_path+'&l=true&U=true'
            promise_dir_content = fetchRespCatch(url)
            .then ()
      } else {
         console.log(callee+'.ipfsversion: ',ipfsversion)
            url = api_url + 'files/ls?arg='+mfs_path+'&long=true&U=true'
            promise_dir_content = fetchRespCatch(url)
            .then ()
      }

   return Promise.all([promise_parent_hash,promise_dir_content]) 
      .then(_ => {
            [parent_hash, obj] = _
            console.log(callee+'.promise.results: ',_);
            let table_of_content = obj.Entries;
            table_of_content.forEach( e => { e.Type = ['File','Directory'][e.Type] } )
            if (table_of_content == null) {
            table_of_content = [];
            }
            let parent_item = { Name:'..', Type:'Directory', Size:0, Hash:parent_hash, Path:mfs_path }
            console.log(callee+'.parent_item: ',parent_item);
            table_of_content.unshift(parent_item)
	    console.log(callee+'.table_of_content:',table_of_content);
            return { "dirname":mfs_path, "parent":parent_hash, "TOC":table_of_content };


            })
   .catch( obj => { logError(callee+'.catch',obj) })
}

function getHashofMfsPath(mfs_path) {
  let  url = api_url + 'files/stat?arg='+mfs_path+'&hash=true'
  return fetchGetPostJson(url) // get
     .then( json => {
         return json.Hash
     })
}

async function provideItem(ofwhat) {
  let [callee, caller] = functionNameJS(); // logInfo("message !")
    console.log(callee+'.ofwhat',ofwhat);
    
  if (typeof(stored[ofwhat]) != 'undefined' && stored[ofwhat] != null) {  
	console.log(callee+'.stored.retrieve('+ofwhat+'):',stored[ofwhat]);
    return stored[ofwhat]
  } else if (ofwhat == 'curItem') {
    // created (build)
    let mfs_path = getInputValue('mfs_pathinputid'); // provide Input !
    console.log(callee+'.rebuild('+ofwhat+').mfs_path:',mfs_path);
    var stat = await getStatofMfsPath(mfs_path);

    let item = stat;
    item.Path = mfs_path
    let slash = mfs_path.lastIndexOf('/')
    item.DirName = mfs_path.substring(0,slash+1);
    item.Name = mfs_path.substr(slash+1);
	console.log(callee+'.stored.curItem.item:',item);
    stored[ofwhat] = item;
    return item;
  } else {
    throw "Error: "+ofwhat+" not previously stored !";
  }
}

function splitPinFullStatus(fullstatus) {
  let matches = fullstatus.match(/(\w+)\s+through (\w+)/)
  //console.log('splitPFS.matches: ',matches)
  let pin_status
  let qm_through
  if (matches) {
     pin_status = matches[1]
     qm_through = matches[2]
     console.log('through-qm: '+qm_through )
  } else {
     pin_status = fullstatus
     if (pin_status == 'unpinned') {
       qm_through = 'QmbFMke1KXqnYyBBWxB74N4c5SBnJMVAiMNRcGu6x1AwQH'
     } else {
       qm_through = null
     }
  }
  console.log('splitPFS: ',[pin_status,qm_through])
  return [pin_status,qm_through]
}

function getPinStatus(hash) { // getdata
  let [callee, caller] = functionNameJS(); // logInfo("message !")
   let  url = api_url + 'pin/ls?arg=/ipfs/'+hash+'&type=all'
   return fetchRespNoCatch(url)
   .then( obj => {
       let status;
       if (typeof(obj.Code) == 'undefined') {
         status = obj.Keys[hash].Type
       } else {
         status = 'unpinned'
       }
       console.log('getPinStatus: '+hash+" \u21A6",status);
       return Promise.resolve(status)
   })
   .catch( obj => { logError('getPinStatus.catch',obj) })
}

function togglePinStatus(status, hash) {
  let [callee, caller] = functionNameJS(); // logInfo("message !")
   console.log(callee+'.status.before:',status);
   if (status == 'unpinned' || status == 'indirect') {
      return ipfsPinAdd(hash)
      .then( _ => { return getPinStatus(hash)})

   } else if (status == 'direct' || status == 'recursive' || status == 'indirect-not-through')  {
      return ipfsPinRm(hash)
      .then( _ => { return getPinStatus(hash)})
   } else {
      console.log(callee+'.status:',status);
      return Promise.resolve('???');
   }
}


function ipfsPinAdd(hash) {
   let url = api_url + 'pin/add?arg=/ipfs/'+hash+'&progress=true'
   return fetchGetPostText(url)
   .then(text => { console.log('ipfsPinAdd.text',text); })
   .catch(err => console.error(err, hash))
}

function ipfsPinRm(hash) {
     let url = api_url + 'pin/rm?arg=/ipfs/'+hash
     console.log('ipfsPinRm.url',url)
     return fetchGetPostJson(url)
	 .then( json => { console.log('ipfsPinRm.json',json);
	     return json.Pins  // Improve when recursive ?
	 })
	 .catch(err => console.error(err, hash))
 } 
 
function getContentofIpfsPath(ipfsPath) {
   let  url = api_url + 'cat?arg='+ipfsPath
   return fetchRespCatch(url)
}

function getContentofMfsPath(mfsPath) {
   let  url = api_url + 'files/read?arg='+mfsPath
   return fetchRespCatch(url)
}

async function publishHistory(item) {
  let [callee, caller] = functionNameJS(); // logInfo("message !")
  let hash = item.Hash
  let name = item.Name
  let date = new Date;
  console.log(callee+'.date:',date);
  let tics = Math.floor(date.getTime() / 1000);
  console.log(callee+'.tics:',tics);
  let hrecord = hash+': ["'+ item.Path +'",'+ tics +']'
  console.log(callee+'.hrecord:',hrecord);
  const historyf = '/.brings/published/history.log';
  let hhash = await ipfsLogAppend(historyf,hrecord)
  console.log(callee+'.hhash:',hhash);
  return hhash
}

/*
  const brindexf = '/.brings/published/brindex.log';
  record = item.Path+': '+'/ipfs/'+whash+'/'+item.Name
  let bhash = await ipfsFileAppend(record,brindexf)
  let dhash = await getMFSFileHash('/.brings/');
  return ipfsNamePublish('self','/ipfs/'+dhash)
  .then(consLog(callee))
  .catch(logError)
*/

function saveSingleFile() {
   let [callee, caller] = functionNameJS();

   let file_path = document.getElementById('file_pathsaveid').value;
   console.log(callee+'.file_path:',file_path);

   let content = document.getElementById("file_contentid").value;
   console.log(callee+'.content:',content);
   return ipfsWriteText(file_path, content) // v0.6.0 truncate works !!!
	.then ( hash => {
     stored['curItem'].Hash = hash
     stored['curItem'].FullStatus = null
     //stored['curItem'] = null;
     display()
     console.log(callee+'file_path: '+file_path+' updated')
   })
	 .catch(err => console.error(err))
} 

