// From [45678](https://github.com/45678/Base58)
// Modified by Dr I·T Generated by CoffeeScript 1.8.0

// TODO to continue ...
(function() {
  var BaseN, i;

  BaseN = (typeof module !== "undefined" && module !== null ? module.exports : void 0) || (window.BaseN = {});


  var BASES = {
   radix11: '0123456789-',
   radix12: '0123456789XE',
   hex: '0123456789ABCDEF',
   base16: '0123456789abcdef',
   radix16: '0123456789ABCDEF',
   radix26: 'ABCDEFGHiJKLMNoPQRSTUVWXYZ',

   base32t: '0123456789ABCDEFGHiJKLMNoPQRSTUV', // Triacontakaidecimal // 09AV
   base32c: '0123456789'+'ABCDEFGH.JK.MN.PQRST.VWXYZ'.replace(/\./g,''), // Crockfordś ![ILOU] (U:accidental obscenity)
   radix32: '123456789'+'abcdefgh.jk.mn.pqrstuvwxyz'.replace(/\./g,''),  // ![ilo0]
   base32z: 'ybndrfg8ejkmcpqxotluwisza345h769', // z-base32 ![01v2]
   RFC4648: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'+'.234567..'.replace(/\./g,''), // RFC 3548 / 4648

   radix36: 'ABCDEFGHiJKLMNoPQRSTUVWXYZ0123456789',
   base36: '0123456789'+'ABCDEFGHiJKLMNoPQRSTUVWXYZ',
   radix38: '0123456789ABCDEFGHiJKLMNoPQRSTUVWXYZ.-',
   radix40: 'ABCDEFGHiJKLMNoPQRSTUVWXYZ0123456789-_.+',
   radix43: 'ABCDEFGHiJKLMNoPQRSTUVWXYZ0123456789 -+.$%*',
   base58: '.123456789ABCDEFGH.JKLMN.PQRSTUVWXYZabcdefghijk.mnopqrstuvwxyz'.replace(/\./g,''), // ![0IOl]
   base62: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
   base64m: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=', // RFC 2045
   base64u: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_=', // Base64 URL
   uudencode: '!"#$%&'+"'"+'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\]^_', 
   binhex4: '!"#$%&'+"'"+'()*+,-012345689@ABCDEFGHIJKLMNPQRSTUVXYZ[`abcdefhijklmpqr', // HQX 
   B64: './0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
   bash64: '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ@_',
   radix94: '-0123456789'+ 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'+
                           'abcdefghijklmnopqrstuvwxyz'+
            "+.@$%_,~`'=;!^[]{}()#&" + '<>:"/\\|?*'
   } 
   console.log(BASES);
   BaseN.BASES = BASES;

  BaseN.maxN = BASES.radix94.length;

 var RX = {};
 for (base of Object.keys(BASES)) {
   let rx = BASES[base].length;
   RX[rx] = base;
 }
 console.log('RX:',RX);

 function alphabet(b) {
    let abet;
    if (b in BASES) {
       abet = BASES[b]
    } else if (`${b}` in RX) {
       abet = BASES[RX[b]]
       console.log('alphabet.b: %s, -e RX[b] = %s',b,RX[b])
    } else {
      for (let base of Object.keys(BASES)) {
           if (b < BASES[base].length) { abet = BASES[base]; break; }
      }
    }
    //console.log('alphabet.abet:',abet)
    return abet;
 }
 function alphamap(b) {
   let amap = {};
   for (i = 0; i < alphabet(b).length; i++) {
    amap[alphabet(b).charAt(i)] = i
   }
   return amap
 }

  BaseN.encode = function(buffer,base) {
    var carry, digits, j;
    if (buffer.length === 0) {
      return "";
    }
    var alphab = alphabet(base)
    console.log('encode.alphab:',alphabet(base));
    var N = alphab.length;
    i = void 0;
    j = void 0;
    digits = [0];
    i = 0;
    while (i < buffer.length) {
      j = 0;
      while (j < digits.length) {
        digits[j] <<= 8;
        j++;
      }
      digits[0] += buffer[i];
      carry = 0;
      j = 0;
      while (j < digits.length) {
        digits[j] += carry;
        carry = (digits[j] / N) | 0;
        digits[j] %= N;
        ++j;
      }
      while (carry) {
        digits.push(carry % N);
        carry = (carry / N) | 0;
      }
      i++;
    }
    i = 0;
    /* wrong ... */
    while (buffer[i] === 0 && i < buffer.length - 1) {
      digits.push(0);
      i++;
    }
    return digits.reverse().map(function(digit) {
      return alphab[digit];
    }).join("");
  };

  BaseN.decode = function(string, base) {
    var bytes, c, carry, j;
    if (string.length === 0) {
      return new (typeof Uint8Array !== "undefined" && Uint8Array !== null ? Uint8Array : Buffer)(0);
    }
    console.log('decode.base:',base);
    console.log('decode.alphab:',alphabet(base));
    var zero = alphabet(base)[0]; // TODO : optimized alphabet+alphamap
    var map = alphamap(base);
    console.log('decode.map:',map);
    var N = Object.keys(map).length;
    console.log('N:',N)
    i = void 0;
    j = void 0;
    bytes = [0];
    i = 0;
    while (i < string.length) {
      c = string[i];
      if (!(c in map)) {
        throw "BaseN.decode received unacceptable input. Character '" + c + "' is not in the BaseN alphabet :"+ alphabet(base);
      }
      console.log('i:%s; bytes: [%s] c=%s',i,bytes.join(','),c)
      j = 0;
      while (j < bytes.length) {
        bytes[j] *= N;
        j++;
      }
      console.log('* N;  bytes: [%s]',bytes.join(','))
      bytes[0] += map[c];
      console.log('+ c;  bytes: [%s] c=%s',bytes.map( _ => 'x'+_.toString(16)).join(','),c)

      carry = 0;
      j = 0;
      while (j < bytes.length) {
        bytes[j] += carry;
        carry = bytes[j] >> 8;
        bytes[j] &= 0xff;
        ++j;
      }
      console.log('carry = %s',carry)
      while (carry) {
        bytes.push(carry & 0xff);
        carry >>= 8;
        console.log('  ;  bytes: [%s]',bytes.join(','))
        console.log('  ;  carry: 0x%s',carry.toString(16))
      }
      i++;
    }
    i = 0;
    /* MGC fix !  */
    while (string[i] === zero && string[i+1] === zero && i < string.length - 1) {
      console.log('adding some zeros ... string[%s]=%s',i,string[i])
      bytes.push(0);
      i += 2;
    }
    return new (typeof Uint8Array !== "undefined" && Uint8Array !== null ? Uint8Array : Buffer)(bytes.reverse());
  };

}).call(this);
