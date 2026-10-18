'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const file = path.resolve(__dirname, '../docs/learning/artifacts/information-theory.html');
const html = fs.readFileSync(file, 'utf8');
const script = id => html.match(new RegExp(`<script id="${id}">([\\s\\S]*?)<\\/script>`))[1];
const close = (a,b) => assert.ok(Math.abs(a-b)<1e-10, `${a} != ${b}`);
const context = vm.createContext({});
vm.runInContext(script('information-model'), context);
const model = vm.runInContext('InformationModel', context);
// Independent reference cases and properties, including endpoints and correlation caveats.
close(model.surprise(.125),3);
close(model.surprise(.25),2);
close(model.surprise(1),0);
assert.equal(model.surprise(0),Infinity);
close(model.entropy([.5,.25,.125,.125]),1.75);
close(model.binaryEntropy(0),0);
close(model.binaryEntropy(1),0);
close(model.binaryEntropy(.5),1);
close(model.binaryEntropy(.99),.08079313589591118);
close(model.capacity(.1),.5310044064107188);
close(model.capacity(.5),0);
close(model.capacity(1),1);
for(let i=0;i<=100;i++) {
  const p=i/100,h=model.binaryEntropy(p);
  assert.ok(h>=0 && h<=1);
  close(h,model.binaryEntropy(1-p));
  close(model.capacity(p)+h,1);
}
for(const bad of [-.1,1.1,NaN,Infinity]) assert.throws(()=>model.binaryEntropy(bad));
assert.throws(()=>model.entropy([.1,.2]));
assert.equal(model.compression('skewed').bits,28);
assert.equal(model.compression('uniform').bits,36);
assert.equal(model.compression('constant').bits,16);
close(model.compression('constant').entropy,0);
// Independently decode every example to check prefix boundaries and complete round trips.
const reverse={0:'A',10:'B',110:'C',111:'D'};
for(const name of ['skewed','uniform','constant']) {
  const c=model.compression(name);let word='',decoded='';
  for(const bit of c.encoded.join('')) {word+=bit;if(reverse[word]){decoded+=reverse[word];word='';}}
  assert.equal(word,'');assert.equal(decoded,c.message);
  close(Object.values(c.counts).reduce((a,b)=>a+b,0),16);
}
assert.deepEqual([...model.channel([0,1,0],0,[0,.5,.999])],[0,1,0]);
assert.deepEqual([...model.channel([0,1,0],1,[0,.5,.999])],[1,0,1]);
assert.deepEqual([...model.channel([0,1,0],.5,[.1,.7,.2])],[1,1,1]);
assert.throws(()=>model.channel([0],.1,[]));
// Small document stub checks the real event handlers, selectors and output wiring.
// This does not check rendered layout or browser accessibility behaviour.
function attributes(text) {return Object.fromEntries([...text.matchAll(/([\w-]+)="([^"]*)"/g)].map(m=>[m[1],m[2]]));}
class Element {
  constructor(tag,attrs={}) {this.tagName=tag;this.attrs=attrs;this.id=attrs.id;this.value=attrs.value||'';this.dataset=Object.fromEntries(Object.entries(attrs).filter(([k])=>k.startsWith('data-')).map(([k,v])=>[k.slice(5),v]));this.textContent='';this.style={};this.listeners={};this.children=[];this.disabled=false;}
  setAttribute(k,v){this.attrs[k]=String(v);}
  addEventListener(k,fn){this.listeners[k]=fn;}
  replaceChildren(...els){this.children=els;}
  fire(k){assert.equal(typeof this.listeners[k],'function');this.listeners[k]();}
}
const elements=[...html.matchAll(/<([a-z][\w-]*)\b([^>]*)>/gi)].map(m=>{const e=new Element(m[1],attributes(m[2]));e.disabled=/\sdisabled(?:\s|$)/.test(m[2]);return e;});
const byId=new Map(elements.filter(e=>e.id).map(e=>[e.id,e]));
assert.equal(byId.size,elements.filter(e=>e.id).length,'Duplicate HTML IDs');
const doc={getElementById:id=>{assert.ok(byId.has(id),`Missing element: ${id}`);return byId.get(id);},createElement:tag=>new Element(tag),querySelectorAll:selector=>{
 if(selector==='input[disabled],button[disabled]')return elements.filter(e=>['input','button'].includes(e.tagName)&&e.disabled);
 const key=selector.match(/^\[data-([\w-]+)\]$/)?.[1];assert.ok(key,`Unhandled selector ${selector}`);return elements.filter(e=>key in e.dataset);
}};
context.document=doc;
vm.runInContext(script('information-ui'),context);
const get=id=>byId.get(id);
assert.equal(get('surprise-bits').textContent,'3.00');
assert.equal(get('entropy-bits').textContent,'1.000');
assert.equal(get('capacity').textContent,'0.531');
assert.equal(get('code-bits').textContent,28);
assert.ok(elements.filter(e=>['input','button'].includes(e.tagName)).every(e=>!e.disabled));
for(const e of elements.filter(e=>e.tagName==='button' && Object.keys(e.dataset).length)) e.fire('click');
assert.equal(get('surprise-bits').textContent,'6.64');
assert.equal(get('entropy-bits').textContent,'0.000');
assert.equal(get('tail-surprise').textContent,'∞');
assert.equal(get('code-bits').textContent,16);
assert.equal(get('capacity').textContent,'1.000');
assert.ok(get('received-bits').children.every(e=>e.className.includes('changed')));
get('noise-p').value='50';get('noise-p').fire('input');
const before=get('received-bits').attrs['aria-label'];get('resample').fire('click');
assert.notEqual(get('received-bits').attrs['aria-label'],before);
assert.equal(get('capacity').textContent,'0.000');
get('noise-p').value='0';get('noise-p').fire('input');
assert.ok(get('received-bits').children.every(e=>!e.className.includes('changed')));
for(const [id,values] of [['surprise-p',['0.1','100']],['coin-p',['0','1','50','99','100']],['noise-p',['0','10','50','90','100']]]) {
 for(const value of values){get(id).value=value;get(id).fire('input');}
}
get('reset-experiments').fire('click');
assert.equal(get('surprise-bits').textContent,'3.00');
assert.equal(get('entropy-bits').textContent,'1.000');
assert.equal(get('capacity').textContent,'0.531');
assert.equal(get('code-bits').textContent,28);
for(const id of ['entropy-curve','capacity-curve']) assert.ok(get(id).attrs.d && !/NaN|Infinity/.test(get(id).attrs.d));
// Confirm local navigation, anchors, script-free diagrams and runtime independence.
for(const match of html.matchAll(/href="([^"]+)"/g)) {
 const href=match[1];if(/^https?:/.test(href))continue;
 const [target,anchor]=href.split('#');
 if(!target){assert.ok(byId.has(anchor),`Missing anchor ${anchor}`);continue;}
 assert.ok(fs.existsSync(path.resolve(path.dirname(file),target)),`Missing file ${target}`);
}
assert.ok(!/<script[^>]+src=/.test(html));
assert.ok(!/\b(fetch|XMLHttpRequest|localStorage|sessionStorage)\b/.test(script('information-ui')));
assert.ok(/id="entropy-curve" d="M/.test(html));
assert.ok(/id="capacity-curve" d="M/.test(html));
assert.ok(/id="sent-bits"[^>]*><span/.test(html));
assert.ok(/id="received-bits"[^>]*><span/.test(html));
console.log('PASS: reference calculations, bounds, prefix decoding, channel edge cases, UI events, local links, static fallbacks and runtime independence.');
