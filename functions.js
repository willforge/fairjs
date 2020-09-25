
/*
 deps:
  groupsel
  nicksel
  friendsmap
  js-yaml.js

 */


var peerid;
var friendsmap = {};
var groupsmap;
var envelop;

// usage: initialize();
async function initialize() {
  await buildPeerId();
  friendsmap = await buildFriendsMap('/my/friends/peerids.yml');
  groupsmap = buildGroups(friendsmap);
  buildGroupSelect(groupsmap,'groupsel');
  buildNameSelect('groupsel','nicksel');

}

async function send_notification_token(peerkey) {
   const sharedsecret = '123-secret-de-polichinelle;'; // to be fetched from keybase or end-to-end encrypted system
   const today = Math.floor(getTic() / 60 / 5); // TODO avoid border effect problem on 5minutes bondaries
   let fullname = getNameByPeerkey(peerkey);
   let uniq_message = `biff-bit for ${fullname} is true on ${today}, this message is intended for peerid ${peerkey}`;
   let uniq_content = getNid(sharedsecret + uniq_message);
   let qm = await ipfsPostHashByContent(uniq_content);
   return qm 
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

    document.getElementById('sender').title = peerid;
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
     .then( yml => { 
           let friends;
           if (typeof(yml.Code) == 'undefined') {
           friends = window.jsyaml.safeLoad(yml);
           } else {
           friends = {};
           }
           console.log('friends:',friends)
           return friends
           })
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

