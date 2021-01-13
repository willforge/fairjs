/*
ports and ip-address can be verified by the commands :
```
docker start ipfs-node
docker ps -f name=ipfs-node

docker exec  ipfs-node ifconfig eth0
docker exec ipfs-node ipfs config Addresses.Gateway
docker exec ipfs-node ipfs config Addresses.API
docker exec ipfs-node ipfs swarm addrs local

```
*/
window.config = {
 'pgw_url':
   ["https://cloudflare-ipfs.com",
    "https://dweb.link",
    "https://gateway.ipfs.io"],

 'lgw_url': "http://127.0.0.1:8390",
 'lapi_url': "http://127.0.0.1:5311/api/v0/",
 'gw_url': "http://172.17.0.3:8396",
 'api_url': "http://172.17.0.3:5001/api/v0/"
};
