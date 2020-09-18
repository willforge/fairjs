// some useful js functions...
//
/*
 * have a time base versionning to avoid maintaining a semver !
 */
// console.log => console.debug by Emile Achadde 27 août 2020 at 15:24:52+02:00


// dependancies:
// js/base58.js


window.essential = { 'version' : '1.1' };
console.log('essential.js: '+window.essential.version)

function TBD(m) { alert('TBD:'+m) }

function load(e) {
    let [callee, caller] = functionNameJS();
    console.debug(callee+'.input.e:',e);
    
    return new Promise(function(resolve, reject) {
        e.onload = resolve
        e.onerror = reject
    });
}

function callFunctionWhenEnterEvent(event,callback,arg) {
    let [callee, caller] = functionNameJS();
    console.debug(callee+'.input.event:',event);
    console.debug(callee+'.input.callback:',callback);
    console.debug(callee+'.input.arg:',arg);

    if(event.keyCode === 13) {
	console.debug(callee+'.calling ',callback,'with with arg: ',arg)
	return callback(arg);
    } else {
	return arg
    }
}

function getValueOfName(name) {
    let [callee, caller] = functionNameJS();
    console.debug(callee+'.input.name:',name);

    let elements = document.getElementsByName(name)
    console.debug(callee+'.elements: '+name+" \u21A6",elements);
    return elements[0].value;
} 

function readAsText(file) {
    let [callee, caller] = functionNameJS();
    console.debug(callee+'.input.file:',file);

    return new Promise(function(resolve, reject) {
        const reader = new FileReader();
        reader.onload = function() {
            resolve(reader.result);
        }
        reader.onerror = reject;
        reader.readAsText(file);
    });
}

function readAsBinaryString(file) {
    let [callee, caller] = functionNameJS();
    console.debug(callee+'.input.file:',file);

    return new Promise(function(resolve, reject) {
        const reader = new FileReader();
        reader.onload = function() {
            resolve(reader.result);
        }
        reader.onerror = reject;
        reader.readAsBinaryString(file)
    });
}

function readAsDataURL(file) {
    let [callee, caller] = functionNameJS();
    console.debug(callee+'.input.file:',file);

    return new Promise(function(resolve, reject) {
        const reader = new FileReader();
        reader.onload = function() {
            resolve(reader.result);
        }
        reader.onerror = reject;
        reader.readAsDataURL(file)
    });
}

function query2json(q) {
    let [callee, caller] = functionNameJS();
    console.debug(callee+'.input.q:',q);

    let j = {}
    q.split('&').forEach( p => { let [k,v] = p.split('='); j[k] = v })
    return j
}

function getQuery(form) {
    let [callee, caller] = functionNameJS();
    console.debug(callee+'.input.form:',form);
    console.dir(form);
    
    var inputs = Array.from(form.elements)
    console.log(inputs);
    let names = inputs.map( e => e.name )
    let query = serialize(form);
    console.log(names)
    console.debug(callee+'.query:',query)
    return(query)
}

function serialize(form) {
    let [callee, caller] = functionNameJS();
    console.debug(callee+'.input.form:',form);

    var field, l, s = [];
    if (typeof form == 'object' && form.nodeName == "FORM") {
	var len = form.elements.length;
	for (var i=0; i<len; i++) {
            field = form.elements[i];
            if (field.name && !field.removed && field.type != 'file' && field.type != 'reset' && field.type != 'submit' && field.type != 'button') {
		if (field.type == 'select-multiple') {
		    l = form.elements[i].options.length; 
		    for (var j=0; j<l; j++) {
			if(field.options[j].selected)
			    s[s.length] = encodeURIComponent(field.name) + "=" + encodeURIComponent(field.options[j].value);
		    }
		} else if ((field.type != 'checkbox' && field.type != 'radio') || field.checked) {
		    s[s.length] = encodeURIComponent(field.name) + "=" + encodeURIComponent(field.value);
		}
            }
	}
    }
    return s.join('&').replace(/%20/g, '+');
}

function fetchRespCatch(url,data) {
    let [callee, caller] = functionNameJS();
    console.debug(callee+'.input.url:',url);
    console.debug(callee+'.input.data:',data);

    if(typeof(data) != 'undefined') {
	return fetchPostBinary(url,data)
	    .then(validateResp)
	    .catch(consErr('fetchRespCatch.obj'))
    } else {
	return fetchGetPostResp(url)
	    .then(validateResp)
	    .catch(consErr('fetchRespCatch.obj'))
    }
}

function fetchRespNoCatch(url,data) {
    let [callee, caller] = functionNameJS();
    console.debug(callee+'.input.url:',url);
    console.debug(callee+'.input.data:',data);

    if(typeof(data) != 'undefined') {
	return fetchPostBinary(url,data)
	    .then(validateRespNoCatch)
	    .catch(consLog('!! fetchRespNoCatch.postcatch.obj'))
    } else {
	return fetchGetPostResp(url)
	    .then(validateRespNoCatch)
	    .catch(consLog('!! fetchRespNoCatch.getcatch.obj'))
    }
}

function validateRespNoCatch(resp) { // validate: OK ? text : json
    let [callee, caller] = functionNameJS();
    console.debug(callee+'.input.resp:',resp);

    if (resp.ok) {
	return Promise.resolve(
            resp.text()
		.then( text => { // ! can be text of json 
		    if (text.match(/^{/)) { // test if it is in fact a json}
			let json = JSON.parse(text);
			console.debug(callee+'.ok.json:',json);
			return json;
		    } else {
			console.debug(callee+'.ok.text:',text);
			return text;
		    }
		}));
    } else {
	console.debug(callee+'.!ok.resp.statusText:',resp.statusText)
	return Promise.resolve(
            resp.json() // errors are in json format
		.then( json => {
		    if (typeof(json.Code) != 'undefined') {
			console.debug(callee+'.validateResp.'+json.Type+': ',json.Code,json.Message)
		    }
		    return json;
		}));

    }
}

function validateResp(resp) { // validate: OK ? text : json
    let [callee, caller] = functionNameJS();
    console.debug(callee+'.stack:',Error().stack);
    console.debug(callee+'.input.resp:',resp);

    if (resp.ok) {
	return Promise.resolve(
            resp.text()
		.then( text => { // ! can be text of json 
		    if (text.match(/^{/)) { // test if it is in fact a json}
			let json = JSON.parse(text);
			console.debug(callee+'.ok.json: ',json);
			return json;
		    } else {
			console.debug(callee+'.ok.text: ',text);
			return text;
		    }
		}));
    } else {
	console.debug(callee+'.!ok.resp.statusText: ',resp.statusText)
	return Promise.reject(
            resp.json() // errors are in json format
		.then( json => {
		    if (typeof(json.Code) != 'undefined') {
			console.debug(callee+'.jsonType:'+json.Type+': ',json.Code,json.Message)
		    }
		    return json;
		}));

    }
}

function fetchPostBinary(url, content) {
    let [callee, caller] = functionNameJS();
    console.debug(callee+'.input.url:',url);
    console.debug(callee+'.input.content:',content);

    // right now is same as fetchPostText
    let form = new FormData(); // need encodeURI ... ??
    form.append('file', content)
    return fetch(url, { method: "POST", mode: 'cors', body: form })
	.then(consLog('fetchPostBinary.resp: '))
	.catch(consLog('fetchPostBinary.catch.resp: '))
}

function fetchPostText(url, content) {
    let [callee, caller] = functionNameJS();
    console.debug(callee+'.input.url:',url);
    console.debug(callee+'.input.content:',content);

    let form = new FormData();
    form.append('file', content)
    return fetch(url, { method: "POST", mode: 'cors', body: form })
}

function fetchPostJson(url, obj) {
    let [callee, caller] = functionNameJS();
    console.debug(callee+'.input.url:',url);
    console.debug(callee+'.input.obj:',obj);

    let content = JSON.stringify(obj)
    let form = new FormData();
    form.append('file', content)
    return fetch(url, { method: "POST", mode: 'cors', body: form })
}


function fetchGetPostResp(url) {
    let [callee, caller] = functionNameJS();
    console.debug(callee+'.input.url:',url);

    return fetch(url, { method: "POST"} )
	.catch(consLog('fetchGetPostResp.catch.resp: '))
}

function fetchGetResp(url) {
    let [callee, caller] = functionNameJS();
    console.debug(callee+'.input.url:',url);

    return fetch(url, { method: "GET"} )
	.catch(consLog('fetchGetResp.catch.resp: '))
}

function fetchGetPostBinary(url) {
    let [callee, caller] = functionNameJS();
    console.debug(callee+'.input.url:',url);

    return fetch(url, { method: "POST"} )
	.then(validateStatus)
	.then( resp =>  resp.blob() )
	.then( blob => { console.debug(callee+'.blob:',blob); return blob; })
	.catch(consLog('fetchGetPostBinary.catch.resp: '))
}

function fetchGetPostText(url) {
    let [callee, caller] = functionNameJS();
    console.debug(callee+'.input.url:',url);

    return fetch(url, { method: "POST"} )
	.then(validateStatus)
	.then( resp => resp.text() )
	.catch(consLog('fetchGetPostText.catch.resp: '))
}

function fetchGetText(url) {
    return fetch(url, { method: "GET"} )
	.then(validateStatus)
	.then( resp => resp.text() )
	.catch(consLog('fetchGetText.catch.resp: '))
}

function fetchGetPostJson(url) {
    let [callee, caller] = functionNameJS();
    console.debug(callee+'.input.url:',url);
    return fetch(url,{ method: "POST"} )
	.then(validateStatus)
	.then( resp => { console.debug(callee+'.resp:',resp); return resp.json() } )
	.then( json => { console.debug(callee+'.json:',json); return json } )
	.catch(console.error)
	//.catch(consLog('fetchGetPostJson.catch.resp: '))
}
function fetchGetJson(url) {
    let [callee, caller] = functionNameJS();
    console.debug(callee+'.input.url:',url);

    return fetch(url,{ method: "GET"} )
	.then(validateStatus)
	.then( resp => resp.json() )
	.catch(consLog('fetchGetJson.catch.resp: '))
}

function getIp() {
    let [callee, caller] = functionNameJS();
    console.debug(callee+'.entering');
    
    // let url = 'https://postman-echo.com/ip'
    // fetch(url).then(validateStatus)
    let url = 'https://iph.heliohost.org/cgi-bin/jsonip.pl'
    url = 'https://api.ipify.org/?format=json'
    url = 'https://ipinfo.io/json'
    fetch(url,{mode:"cors"}).then(validateStatus)
			    .then( resp=> { return resp.json() } )
			    .then( json => {
				if (typeof(json.ip) != 'undefined') {
				    return json.ip
				} else if (typeof(json.query) != 'undefined') {
				    return json.query
				} else {
				    console.debug(callee+'.json:',json)
				    return '0.0.0.0'
				}
			    } )
			    .catch( logError )
}

function getCloudFlareIp() {
    let [callee, caller] = functionNameJS();
    console.debug(callee+'.entering');

    let url = 'https://www.cloudflare.com/cdn-cgi/trace'
    return fetch(url)
	.then( resp => resp.text() )
	.then ( d => { return list2json(d) } )
	.then( json => {
	    if (typeof(json.ip) != 'undefined') {
		return json.ip
	    } else if (typeof(json.query) != 'undefined') {
		return json.query
	    } else {
		console.debug(callee+'.json:',json)
		return '0.0.0.0'
	    }
	} )
	.catch( logError )
}

function list2json(d) {
    let [callee, caller] = functionNameJS();
    console.debug(callee+'.input.d:',d);

    let data = d.replace(/[\r\n]+/g, '","').replace(/\=+/g, '":"');
    data = '{"' + data.slice(0, data.lastIndexOf('","')) + '"}';
    let json = JSON.parse(data);
    return json
}

function getTic() {
    let [callee, caller] = functionNameJS();
    console.debug(callee+'.entering');

    var dat = new Date();
    var result = Math.floor(dat.getTime() / 1000);
    return +result
}

function getDate() { 
   TBD('date function to be writen');
}

function getSpot(tic, ip, peerId, nonce) {
    let [callee, caller] = functionNameJS();
    console.debug(callee+'.input.tic:',tic);
    console.debug(callee+'.input.ip:',ip);
    console.debug(callee+'.input.peerId:',peerId);
    console.debug(callee+'.input.nonce:',nonce);

    var ipInt = dot2Int(ip);
    var idInt = qm2Int(peerId);
    var spot = (tic ^ +ipInt ^ idInt ^ nonce)>>>0;
    
    var result = "--- # spot for "+peeId+"\n";
    result += "tic: "+tic+"\n";
    result += "ip: "+ipInt+"\n";
    result += "spot: "+spot+"\n";
    
    return result;
} 

function dot2Int(dot) {
    let [callee, caller] = functionNameJS();
    console.debug(callee+'.input.dot:',dot);

    let d = dot.split('.');
    return ((((((+d[0])*256)+(+d[1]))*256)+(+d[2]))*256)+(+d[3]);
}

function qm2Int(qm) {
    let [callee, caller] = functionNameJS();
    console.debug(callee+'.input.qm:',qm);

    plain = base58.decode(qm)
    let q16 = plain.to_hex();
    console.debug(callee+'.f'+q16)
    let d = q16.split('.');
    console.debug(callee+'.d: '+d)
    return ((((((+d[0])*256)+(+d[1]))*256)+(+d[2]))*256)+(+d[3]);
}

function to_hex(s) {
    let [callee, caller] = functionNameJS();
    console.debug(callee+'.input.s:',s);

    var r = '';
    for (var i = 0; i < s.length; i++) {
        var v;
        if (s[i] < 0)
            s[i] += 256;
        v = s[i].toString(16);
        if (v.length == 1)
            v = '0' + v;
        r += v;
    }
    return r;
}

function validateStatus(resp) {
    let [callee, caller] = functionNameJS();
    console.debug(callee+'.input.resp:',resp);

    if (resp.status >= 200 && resp.status < 300) {
	return Promise.resolve(resp)
    } else {
	console.debug(callee+'.resp.status:',resp.status)
	console.debug(callee+'.resp.statusText:',resp.statusText)
	return Promise.reject(resp)
	//return Promise.reject(new Error(resp.statusText))
    }
}

function replaceNameInGlobalContainer(name) {
    let [callee, caller] = functionNameJS();
    console.debug(callee+'.input.name:',name);

    return value => { container.innerHTML = container.innerHTML.replace(new RegExp(':'+name,'g'),value); return value; }
}

function replaceNameInClass(name,where) {
    let [callee, caller] = functionNameJS();
    console.debug(callee+'.input.name:',name);
    console.debug(callee+'.input.where:',where);
    
    return value => {
	if (typeof(callback) != 'undefined') {
	    callback(name,value)
	} else {
	    let elements = document.getElementsByClassName(where);
	    for (let i=0; i<elements.length; i++) {
		let e = elements[i];
		e.insertAdjacentHTML('beforeEnd', e.innerHTML.replace(new RegExp(':'+name,'g'),value))
		//console.log(e.innerHTML)
	    }
	}
	return value;
    }
}

function replaceInTagsByClassName(name,value) {
    let [callee, caller] = functionNameJS();
    console.debug(callee+'.input.name:',name);
    console.debug(callee+'.input.value:',value);

    let elements = document.getElementsByClassName(name);
    for (let i=0; i<elements.length; i++) {
	let e = elements[i];
	/* assign outerHTML doesn't seem to work directly */
	/*
	   e.insertAdjacentHTML('beforeBegin', e.outerHTML.replace(new RegExp(':'+name,'g'),value))
	   console.dir(e.parentElement)
	   e.parentElement.removeChild(e)
	   console.debug(callee+'outer: '+e.outerHTML); /* old element still exist !

	 */
	for (let a of ['href','title','src','innerHTML','alt']) {
            if (typeof(e[a]) != 'undefined' && e[a].match(name)) {
		console.log(a+': ',e[a])
		e[a] = e[a].replace(new RegExp(':'+name,'g'),value)

            }
	}
    }
}

function functionNameJS () {
    let stack = new Error().stack;

    //    console.debug('functionNameJS.stack:',stack);

    var callee;
    var caller;
    var stackArray= [];
    let navigator = navigatorName();
    switch (navigator){
	case "Chrome":
            stackArray = stack.split('at ');
            callee = stackArray[2].split(' ')[0];
            if (stackArray[3] == undefined) {
		caller = "main";
            }
            else{
		caller = stackArray[3].split(' ')[0];
            }
            if(caller.match("http:")){caller = "main"};
            break;

	case "Firefox":
            stackArray = stack.split('\n');
            callee = stackArray[1].split('@')[0];
            caller = stackArray[2].split('@')[0];
            if (caller == "") {caller = "main"};
            break;

	default:
            console.error('functionNameJS.navigator',navigator);
            throw "unknown navigator "+navigator;
    } // switch

    return [callee, caller];
}

function navigatorName () {
    let navNam = navigator.userAgent;
    //    console.debug(callee+'navigatorName.navNam',navNam);

    var result = "";
    if(navNam.match("Firefox")){
	result = "Firefox";
    }
    else if(navNam.match("Chrome")){
	result = "Chrome";
    }
    else {
	throw "Error in navigatorName.unknown navigator "+navNam;
    }
    //    console.debug(callee+'navigatorName.result',result);
    return result;
}

console.debug = console.log
// console.debug = function (_) => { console.log(_); return _; }
// function consDebug(_) { _ => { console.log(_); return _; }

function consLog(what) {
    let [callee, caller] = functionNameJS();
    console.debug(callee+'.input.what:',what);

    return data => { console.log(what+': ',data); return data; }
}

function consErr(what) {
    let [callee, caller] = functionNameJS();
    console.debug(callee+'.input.what:',what);

    return err => { console.error(what+': ',err); return err; }
}

function logInfo(msg) {
    let [callee, caller] = functionNameJS();
    console.debug(callee+'.input.msg:',msg);

    let stack = new Error().stack;
    console.debug(callee+'.stack',stack)
}

function logError(what,err,obj) {
    let [callee, caller] = functionNameJS();
    console.debug(callee+'.input.what:',what);
    console.debug(callee+'.input.err:',err);
    console.debug(callee+'.input.obj:',obj);

    let errorMsg = {
	'-1':'Unknown Error'
    }
    if (typeof(err) == 'undefined') {
	err = what
	what = 'Error'
    }
    let msg
    if (typeof(errorMsg[err]) != 'undefined') {
	msg = errorMsg[err];
	console.error(what+': '+err,errorMsg[err],obj);
    } else {
	msg = 'Error '+err
	console.error(what+': '+err,obj);
    }
    e = document.getElementById('error')
    if (e) {
	e.innerHTML = msg
    }
    return msg;
}

function isErr(err, callback) {
    let [callee, caller] = functionNameJS();
    console.debug(callee+'.input.err:',err);
    console.debug(callee+'.input.callback:',callback);

    if (err != null) {
	if (err.stack != null) {
            var stackArray = err.stack.split("\n");
            var stackLine = new Error().stack.split("\n")[2];
            stackArray.splice(1,0,StackLine); 
            err.stack = stackArry.join("\n");
	} else {
            err = new Error(err);
	}

	if (callback != null) {
            callback(err);
	} else {
            throw err;
	}
	return true;
    } else {
	return false;
    }
} 

true; // $Source:  /my/js/scripts/essential.js$
