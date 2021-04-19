

discover = {
 peers: findpeers,
 join: join,
 brn_url: 'https://ipfs.blockringtm.ml/api/v0/',
 api_url: 'http://127.0.0.1:5001/api/v0/',
 gw_url: 'http://127.0.0.1:8080',
 token: "QmU1uuZEW9K22qTCHqMkxzv2bFQNnCh7rY1ixzXaBr4Zf7",
 provs: [],
 callback: display_peers
}

function join() {
  return fetch(discover.api_url+'pin/add?arg='+discover.token, { method: 'POST' }).
  then( resp => { console.log(resp.body); return resp.json(); }).
  then(findpeers).
  catch(console.error);
}
function findpeers() {

  return fetch(discover.api_url+'dht/findprovs?arg='+discover.token, { method: 'POST', mode: 'cors' }).
  then( resp => { console.log(resp.body); return resp.body.getReader(); }).
  then( reader => { return readStream(reader,get_peerids); }).
  catch(console.error);
}

function get_peerids(objs) {
  discover.provs.push(...objs.filter( (o) => o.Type == 4 ));
  if (discover.provs.length > 0) {
    let peerids = discover.provs.map((o) => o.Responses[0].ID );
    discover.callback(peerids);
    return peerids
  }
}

function display_peers(peers) {
   let d = document.getElementById('peers');
   let buf = '<ol>';
   if (typeof(peers) == 'undefined') { return void(0); }
   for (p of peers) {
      buf += `<li><a href=https://duckduckgo.com/?q=%2B%22${p}%22>${p}</a> <a href="${gw_url}/ipns/${p}">🔗</a>`;
   }
   buf += '</ol>';
   d.innerHTML = buf;
}


function readStream(reader, callback) {
    let read;
    var buf = ''
       return reader.read().
       then(read = ({ value, done }) => {
          if (done) return buf;
          console.debug('value.buffer:',value.buffer)
          if (buf != '') { console.debug('buf:',buf) }
          buf += String.fromCharCode.apply(String, value);
          // spliting the NDJSON
          let lines = buf.replace(/(\n|\r)+$/, '').split("\n")
          buf = (lines[lines.length-1].match(/}$/)) ? '' : lines.pop();
          let objs = lines.map(JSON.parse)
          // console.log('objs:',objs)
          callback(objs);
          if (objs.length > 0) {
            return reader.read().then(read).catch(console.warn); // recursion !
          } else {
            return Promise.reject(String.fromCharCode.apply(String, value));
          }
       });

 }

true;
