

discover = {
 peerid: get_peerid,
 peers: findpeers,
 join: join,
 peer_connect: ipfsPeerConnect,
 brn_url: 'https://ipfs.blockringtm.ml/api/v0/',
 api_url: 'http://127.0.0.1:5001/api/v0/',
 gw_url: 'http://127.0.0.1:8080',
 token: "QmU1uuZEW9K22qTCHqMkxzv2bFQNnCh7rY1ixzXaBr4Zf7",
 provs: [],
 callback: display_peers
}

function get_peerid() {
  return fetch(discover.api_url+'config?arg=Identity.PeerID', { method: 'POST', mode: 'cors' }).
  then( resp => { console.log(resp); return resp.json(); }).
  then( obj => { console.info('peerid:',obj); return obj.Value; }).
  catch(console.error);
}

function join() {
  return fetch(discover.api_url+'pin/add?arg='+discover.token, { method: 'POST' }).
  then( resp => { console.log(resp.body); return resp.json(); }).
  then(findpeers).
  catch(console.error);
}

function findprovs(token) {
  return fetch(discover.api_url+'dht/findprovs?arg='+token, { method: 'POST', mode: 'cors' }).
  then( resp => { console.log(resp); return resp.text(); }).
  then( text => { objs = text.slice(0,-1).
         split('\n').map(JSON.parse).
         filter( o => { return (o.Type == 4); }).
         map( o => { return o.Responses[0].ID; });
    console.info('findprovs.objs:',objs);
    return objs;

  }).
  catch(console.error);
}
function findpeers() {
  return fetch(discover.api_url+'dht/findprovs?arg='+discover.token, { method: 'POST', mode: 'cors' }).
  then( resp => { console.log(resp); return resp.body.getReader(); }).
  then( reader => { return readStream(reader,get_peerkeys); }).
  catch(console.error);
}

function ipfsSwarmConnect(addr) {
  console.log('connect.addr: ',addr);
  if (typeof(addr) != 'undefined') {
    url = discover.api_url + 'swarm/connect?arg='+addr;
         return fetch(url,{ method:'POST' })
          .then( resp => resp.json() )
          .then( obj => {
                if (typeof(obj.Strings) != 'undefined' && obj.Strings[0].match('success')) {
                console.log('peer_connect.SUCCESS:', obj);
                return [true, addr];
                } else {
                console.warn('peer_connect.ERROR:', obj);
                return Promise.reject([false, addr]);
                }
                })
          .catch(console.error);
  } else {
    return [null, addr];
  }
}

function ipfsPeerConnect(peerkey,layer) {
    var url = discover.api_url + 'dht/findpeer?arg='+peerkey;
    return fetch(url,{ method:'POST' })
     .then( resp => resp.text() )
     .then( text => {
       let ndjson = text.slice(0,-1).split('\n')
       //console.debug('connect.ndjson:',ndjson);
       let addr;
       for (let record of ndjson) {
         //console.debug('connect.record:',record);
         let json = JSON.parse(record);
         console.debug('peer_connect.json:',json);
         if (json.Type != 2) { continue; }
         for (let addy of json.Responses[0].Addrs) {
            if (addy.match(layer+'$') && addy.match('^/ip4/')
                && ! addy.match('/ip4/127\.') && ! addy.match('/ip4/192\.') ) {
              console.log('peer_connect.addy:',addy);
              addr = addy; break
            }
         }
       }
       if (typeof(addr) != 'undefined') {
          return ipfsSwarmConnect(addr+'/p2p/'+peerkey).
          catch(console.error);
       } else {
         console.error('peer_connect.addr: undefined')
       }

     })
    .catch(console.error);
    
}

function get_peerkeys(objs) {

  for(let obj of objs) {
    if (typeof(obj.Responses) != 'undefined' && obj.Responses) {
      if (obj.ID != '') { console.log('ID: %s, Type=%d',obj.ID,obj.Type) }
      if (obj.Type == 4) {
        console.log('responses:',obj.Responses)
      }
    }
  }
  discover.provs.push(...objs.filter( (o) => o.Type == 4 ));
  if (discover.provs.length > 0) {
    //console.log('discover.provs[%s-1]: %o',discover.provs.length,discover.provs[discover.provs.length-1])
    let peerkeys = discover.provs.map((o) => o.Responses[0].ID );
    discover.callback(peerkeys);
    return peerkeys
  }
}

function display_peers(peers) {
   let d = document.getElementById('peers');
   if (typeof(peers) == 'undefined') { return void(0); }
   let seen = {};
   let buf = '<ol>';
   for (let i in peers) {
      let peer = peers[i];
      if (typeof(seen[peer]) != 'undefined') { continue; }
      buf += `<li> <span id="peer${i}" data-p="${i}" onclick="connect(event);">⬤</span> <a href="${discover.gw_url}/ipns/${peer}">${peer}</a>`
          + ` <a href=https://duckduckgo.com/?q=%2B%22${peer}%22>🔎</a>`
      if (discover.provs[i].Responses[0].Addrs) { seen[peer]++; }
   }
   buf += '</ol>';
   d.innerHTML = buf;
}

function connect(ev) {
  let p = ev.target.dataset['p'];
  let prov = discover.provs[p]
  let peer = prov.Responses[0].ID
  let addrs = prov.Responses[0].Addrs;
  console.log('connect.prov: ',prov);
  el = document.getElementById('peer'+p);
  if (addrs != null) {
  let promises = [];
  for (let addr of addrs) {
    if (addr.match('/ip4/127\.') || addr.match('/ip4/192.168')) {
      continue
    }
    let saddr = '';
    if (addr.match('p2p')) { 
      saddr = addr.replace(/\/p2p.*/,'/p2p/'+peer);
    } else {
      saddr = addr+'/p2p/'+peer;
    }
    promises.push(ipfsSwarmConnect(saddr));
  }
  Promise.any(promises).then( _ => {
    if (typeof(_) != 'Array') {
      console.log(typeof(_),_);
    }
    [status,peer] = _;
    console.log('promises.then.status',status);
    console.log('promises.then.peer',peer);
    if (status) {
      el.innerHTML = '&#128994'; // '🟢';
    } else {
      el.innerHTML = '&#128308;'; // '🔴';
    }
    return status;
  }).catch(_=>{
   el.innerHTML = '&#10060;'; // '❌';
   console.warn(_);
  });
  } else {
   el.innerHTML = '&#128992;'; // '🟠';
  }
  
}


function readStream(reader, callback) {
    let read;
    var buf = ''
       return reader.read().
       then(read = ({ value, done }) => {
          if (done) return buf;
          if (buf != '') { console.debug('buf: ...',buf.substr(-12)) }
          buf += String.fromCharCode.apply(String, value);
          // spliting the NDJSON
          let lines = buf.replace(/(\n|\r)+$/, '').split("\n")
          //if (buf.match('oEsR')) { console.log('buf.match: ',buf); }
          //console.debug('readStream.lines:',lines)
          buf = (lines[lines.length-1].match(/}$/)) ? '' : lines.pop();
          let objs = lines.map(JSON.parse)
          callback(objs);
          if (objs.length > 0) {
            return reader.read().then(read).catch(console.warn); // recursion !
          } else {
            return Promise.reject(String.fromCharCode.apply(String, value));
          }
       });

 }

true;
