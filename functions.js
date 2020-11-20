
/*
 deps:
  groupsel
  nicksel
  friendsmap
  js-yaml.js

 */


var friendsmap = {};
var groupsmap;
var envelop;

// usage: initialize();
async function initialize() {
  await buildPeerId(); // Q: can we laod Friends and PeerId in // ?
  friendsmap = await buildFriendsMap('/my/friends/peerids.yml');
  groupsmap = buildGroups(friendsmap);

}

async function get_notification_status(fullname,peerid) {
   let [callee, caller] = functionNameJS();
   var status = false;
   const sharedsecret = '123-secret-de-polichinelle;'; // to be fetched from keybase or end-to-end encrypted system
   const today = Math.floor(getTic() / 60 / 5); // TODO avoid border effect problem on 5minutes bondaries
   let uniq_message = `biff-bit for ${fullname} is true on ${today}, this message is intended for peerid ${peerid}`;
   console.debug(callee+'.uniq_message:',uniq_message);
   let uniq_content = getNid(sharedsecret + uniq_message);
   document.getElementById('token').innerHTML = uniq_content;
   console.debug(callee+'.uniq_content:',uniq_content);
   let uniq_hash = await ipfsGetHashByContent(uniq_content); // no post !
   console.debug(callee+'.uniq_hash:',uniq_hash);
   let buf = await ipfsGetContentByHash(uniq_hash); // pulling uniq_hash
   if (buf == uniq_content) {
      status = true;
   } else {
      console.debug(callee+'.buf:',buf);
   }
   return status 
}


// example: getMutableHead(peerkey,'/my/outbox/'+mboxid+'.json')
async function getMutableHead(peerid,mutable) {
   let [callee, caller] = functionNameJS();
  let rootdir= await ipfsNameResolve(peerid);
  console.debug(callee+'.rootdir:',rootdir);
  let [shard,key] = shard_n_key(mutable);
  console.debug(callee+'.mutable:',mutable);
  console.debug(callee+'.shard:',shard);
  console.debug(callee+'.key:',key);
  let indexlogf = rootdir+'/shards/'+shard+'/'+core.index;
  let yaml_index = await ipfsGetContentByPath(indexlogf);
  console.debug(callee+'.yaml_index:',yaml_index);
  let obj_index = yaml2obj(yaml_index)
  console.debug(callee+'.obj_index:',obj_index);
  return obj_index[key];
}
function yaml2obj(yaml) { // allow duplicate keys
   let [callee, caller] = functionNameJS();
   let json = {}
   if (typeof(yaml.Code) == 'undefined') {
      for (let line of yaml.split("\n")) {
         if (line.match(/^\w+: /)) {
            let [key,value] = line.split(new RegExp(': *'));
            json[key] = value;
         }
      }
   }
   return json;
}

function yaml2json(yaml) {
   let [callee, caller] = functionNameJS();
   let json;
   if (typeof(yaml.Code) == 'undefined') {
      json = window.jsyaml.safeLoad(yaml);
   } else {
      json = {};
   }
   console.log(callee+'.json:',json);
   return json;
}

async function send_notification_token(peerkey) {
   let [callee, caller] = functionNameJS();
   const sharedsecret = '123-secret-de-polichinelle;'; // to be fetched from keybase or end-to-end encrypted system
   const today = Math.floor(getTic() / 60 / 5); // TODO avoid border effect problem on 5minutes bondaries
   let fullname = getNameByPeerkey(peerkey);
   let uniq_message = `biff-bit for ${fullname} is true on ${today}, this message is intended for peerid ${peerkey}`;
   console.debug(callee+'.uniq_message:',uniq_message);
   let uniq_content = getNid(sharedsecret + uniq_message);
   console.debug(callee+'.uniq_content:',uniq_content);
   let uniq_hash = await ipfsPostHashByContent(uniq_content);
   console.debug(callee+'.uniq_hash:',uniq_hash);
   return uniq_hash 
}
function getNameByPeerkey(id) {
  let [callee, caller] = functionNameJS();
  let nid = getNid('urn:ipns:'+id);
  console.debug(callee+'.friendsmap['+nid+']:',friendsmap[nid])
  let fullname = friendsmap[nid].fullname;
  return fullname
}

async function notify(ev) {
 let qm = await send_notification_token(envelop.to);
 return qm
}

async function get_mbox() {
 let mbox = await getJsonByMFSPath('/my/outbox/'+envelop.msgid+'.json')
 return mbox;
}
async function write_mbox(outbox) {
 return ipfsWriteJson('/my/outbox/'+envelop.msgid+'.json',outbox);
}
async function publish_mbox() {
 return ipfsPublish('/my/outbox/'+envelop.msgid+'.json');
}

function create_envelop(ev) {
  let [callee, caller] = functionNameJS();
  let friendmeta = getSelectedFriendMeta('nicksel');
  console.log(callee+'.friendmeta:',friendmeta)
  let recipient_nickname = friendmeta.nickname
  let recipient_peerkey = friendmeta.peerkey
  let recipient_fullname = friendmeta.fullname
  document.getElementById('peerkey').innerHTML = recipient_peerkey;
  let msgid = getNid('urn:message:to:'+recipient_peerkey+':from:'+peerid);
  console.log(callee+'.msgid:',msgid)
  envelop = { from: peerid, to: recipient_peerkey, msgid: msgid }
   
}

function getSelectedFriendMeta(nselid) {
  let [callee, caller] = functionNameJS();
  // get key of selected recipient 
    var select_nick = document.getElementById(nselid);
    let nid = select_nick.options[select_nick.selectedIndex].value
    console.log(callee+'.nid:',nid)
    let meta = friendsmap[nid];
    meta.nid = nid;
    return meta;
}
  
function update_nicksel(ev) {
   buildNameSelect('groupsel','nicksel');
}

async function buildPeerId() {
  let [callee, caller] = functionNameJS();
  peerid = await Promise.resolve(promisedPeerId);
  console.debug(callee+'.peerid:',peerid);
    let e = document.getElementById('node')

    if (e) { e.title = peerid; }
    for (e of document.getElementsByClassName('peerid')) {
      console.log(callee+'.e:',e);
      e.innerHTML = peerid;
    }
}
function buildNameSelect(gselid,nselid) {
    let [callee, caller] = functionNameJS();
    // remove all names
    let select_nick = document.getElementById(nselid);
    for ( let i=select_nick.length-1; i >= 0; i-- ) {
      select_nick.remove(i);
    }
    // get selected group
    let select_grp = document.getElementById(gselid);
    let group_idx = select_grp.options[select_grp.selectedIndex].value
    let members = groupsmap[group_idx];
    
   // add all names
   let option = document.createElement("option");
      option.label = 'select a name'
      select_nick.add(option)
   for (let key of members.sort(by_name)) {
      console.log(callee+'.key:',key,friendsmap[key].nickname)
      let option = document.createElement("option");
      option.value = key
      option.text = friendsmap[key].nickname
      select_nick.add(option)
      console.log(callee+'.option:',option);
   }

}
  
function buildGroupSelect(map,gselid) {
    let [callee, caller] = functionNameJS();
    console.debug(callee+'.input.map:',map)
    console.debug(callee+'.input.gselid:',gselid)

 // remove all group options but the label
    var select_obj = document.getElementById(gselid);
    for ( let i=select_obj.length-1; i > 0; i-- ) {
      select_obj.remove(i);
    }
    let idxall = 0;
    console.log('select:',select_obj)
    console.log('sorted keys:',Object.keys(map).sort())
    // add new groups
    for (let key of Object.keys(map).sort()) {
       let group = map[key];
       var option = document.createElement("option");
       option.value = key;
       option.text = key;
      console.log('adding.option:',option)
       select_obj.add(option)
      if (key == 'all') { idxall = option.index }
   }
   select_obj.options[idxall].selected = true;
}



function buildGroups(map) {
 let groups = {'all':[]};
 for (let i in Object.keys(map)) {
       let key = Object.keys(map)[i];
       let friend = map[key];
       console.log('nick.',friend.nickname);
          console.log('group:',friend.group)
          if (typeof(groups[friend.group]) == 'undefined') {
             groups[friend.group] = [];
          } 
          groups[friend.group].push(key);
          groups['all'].push(key);
    }
    console.log('groups:',groups)
    return groups
}


async function buildFriendsMap(friendsfile) {
  return getMFSFileContent(friendsfile)
     .then( yml => { return( yaml2json(yml) ); })
    .catch(console.error);
}


function update_nicksel(ev) {
    let [callee, caller] = functionNameJS();
    // remove all names
    let select_nick = document.getElementById("nicksel");
    for ( let i=select_nick.length-1; i >= 0; i-- ) {
      select_nick.remove(i);
    }
    // get selected group
    let select_grp = document.getElementById("groupsel");
    let group_idx = select_grp.options[select_grp.selectedIndex].value
    let members = groupsmap[group_idx];
    
   // add all names
   let option = document.createElement("option");
      option.label = 'select a name'
      select_nick.add(option)
   for (let key of members.sort(by_name)) {
      console.log(callee+'.key:',key,friendsmap[key].nickname)
      let option = document.createElement("option");
      option.value = key
      option.text = friendsmap[key].nickname
      select_nick.add(option)
      console.log(callee+'.option:',option);
   }

}

function by_name(a,b) {
   let order = compare(friendsmap[a].nickname,friendsmap[b].nickname);
   if (order == 0) { order = compare(a,b); }
   return order;
}

function compare(a,b) {
    let order = 0;
    if (a > b) {
       order = 1;
    } else if (a < b) {
       order = -1; 
    }
    return order;
 }

