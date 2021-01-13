/* 
 deps:
  showdown.js (QmTsQXgRVo4Q6UnQUZHe25m5z6PYRpYBP83d37BRMMgqwA)
  qm=$(ipfs add -Q -w -r ../js/showdown.*)
  ipfs object patch add-link QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn js $qm
*/

const prev_release='QmRYcng6RgZQQaeYbeVs1rTsrHW29qfBYw3NBAUjvNc3tr';
const cur_release='QmYCFhUzFqRi2jgKjB417gE5qYfZ5oxUKGrRrJQvjUN1Be';
const pgw_url='https://cloudflare-ipfs.com';
/* https://github.com/willforge/fairjs/blob/dbug/ */
/* https://raw.githubusercontent.com/willforge/fairjs/dbug/showdown.js */
const next_release='QmbGx7n8a2g9eqPipCkuZLacPJAW52RX9RN7HbpZBxtyau'; /* TODO: find a way to get mutability (i.e. ns redirect) */
const intent='script to render md div';


var script = document.createElement('script');
    script.setAttribute('type','text/javascript');
    /* see: https://www.jsdelivr.com/package/gh/willforge/fairjs */
    script.src = 'https://cdn.jsdelivr.net/npm/showdown@1.9/dist/showdown.min.js';
    script.src = 'https://cdn.jsdelivr.net/gh/willforge/fairjs@master/showdown.min.js';
    script.src = `${pgw_url}/ipfs/${cur_release}/js/showdown.min.js`;

    document.getElementsByTagName("head")[0].appendChild(script);
    script.onload = function () {
       var elems = document.getElementsByClassName('md');
       console.log(elems);
       for(var i=0; i<elems.length; i++) {
          if (typeof(qm) != 'undefined') {
            buf = elems[i].innerHTML.replace(/:qm/g,qm);
          } else {
            buf = elems[i].innerHTML;
          }
          console.log(buf);
          var converter = new showdown.Converter();
          elems[i].innerHTML = converter.makeHtml(buf);
          //elems[i].style.display = 'none';
       }

    }

