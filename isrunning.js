/*
  This script will replace all reference to 127.0.0.1:8080 w/ gateway.ipfs.io

*/

const lgw_url = 'http://127.0.0.1:8080';
const pgw_url = 'https://gateway.ipfs.io';

main();
async function main() {
  let local_node_running = fetch(`${lgw_url}/ipfs/z3NDG9XtZ7zh82P5i1QQruZXkjXXKSt7pJu7`)
  .then( resp => { console.log('resp:',resp); return resp; })
  .catch( resp => {
   console.warn('resp:',resp);
   // fall back to public gateway ...
   let body = document.getElementsByTagName('body')[0];
   body.innerHTML = body.innerHTML.replace(RegExp(lgw_url,'g'),pgw_url);
   console.log('body:',body.innerHTML)
   return resp;
  })
}

