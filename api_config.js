/* read out api_url input to overwrite config.js */

let el = document.getElementsByName('api_url')[0];
if (el) {
   el.value = config.api_url;
   console.info('config.el.value:',el.value);
}

function update_api_url(ev) {
   let url = ev.target.value;
   window.config.api_url = url;
   api_url = url;

   promisedGW = update_gw_url(api_url).then ( gw_url => {
     let webui_url = `${gw_url}/ipfs/${qmwebui}`;
     let webui_element = document.getElementsByName('webui')[0];
       if (typeof(webui_element.template) == 'undefined') {
       webui_element.template = webui_element.href;
    }
    webui_element.href = webui_element.template.replace('webui:',webui_url);
     
   });

   promisedPeerId = getPeerId().then( id => {
     peerid = id
     let el = document.getElementById('peerid');
     if (el) {
       el.innerHTML = `<a href=${gw_url}/ipns/${peerid}>${peerid}</a>`;
     }
  });
   console.log('update_api_url.promisedPeerId:',promisedPeerId);

   return url;
}

function update_gw_url(api_url) {
  let url = api_url + 'config?arg=Addresses.Gateway'; 
  return fetch(url,{ method:'POST', mode: 'cors' })
  .then( resp => resp.json() )
  .then( json => {
     console.log('update_gw_url.json:',json);
     let gw = json.Value;
     let [_,type,host,proto,port] = gw.split('/');
     let h = port % 251; // host : gw_port modulo 251
     if (host == '0.0.0.0') { host = '127.0.0.1'; }
     console.log('update_gw_url.host:',host);
     gw_url = `http://${host}:${port}`;
     console.log('update_gw_url.gw_url:',gw_url);
     return gw_url;
  })
  .catch(console.error);

}


