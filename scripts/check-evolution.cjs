'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const file=path.resolve(__dirname,'../docs/learning/artifacts/evolution.html');
const html=fs.readFileSync(file,'utf8');
const script=id=>html.match(new RegExp(`<script id="${id}">([\\s\\S]*?)<\\/script>`))[1];
const close=(a,b,tolerance=1e-10)=>assert.ok(Math.abs(a-b)<tolerance,`${a} != ${b}`);
const attrs=s=>Object.fromEntries([...s.matchAll(/([\w-]+)="([^"]*)"/g)].map(m=>[m[1],m[2]]));
const context=vm.createContext({});vm.runInContext(script('lesson-model'),context);const M=vm.runInContext('LessonModel',context);
test('Selection: compare against independently counted integer lineages',()=>{
 close(M.selection(.2,.2,1)[1],24/104);
 close(M.selection(.2,.2,2)[2],28.8/108.8);
 const trajectory=M.selection(.2,.2,40);
 // Equivalent contributions 6 vs 5 avoid reproducing the normalized recurrence.
 for(let t=0;t<=40;t++){const a=20n*6n**BigInt(t),b=80n*5n**BigInt(t);close(trajectory[t],Number(a)/Number(a+b));}
});
test('Selection: boundaries, neutrality, direction and rejected inputs',()=>{
 for(const initial of [0,.01,.2,.5,.99,1])for(const s of [-.5,-.2,0,.2,1]){
  const trajectory=M.selection(initial,s,40);assert.equal(trajectory.length,41);close(trajectory[0],initial);
  for(let t=1;t<trajectory.length;t++){const p=trajectory[t];assert.ok(p>=0&&p<=1);if(initial===0||initial===1||s===0)close(p,initial);else if(s>0)assert.ok(p>=trajectory[t-1]);else assert.ok(p<=trajectory[t-1]);}
 }
 for(const p of [-.01,1.01,NaN,Infinity])assert.throws(()=>M.selection(p,.2,20));
 for(const s of [-1,1.01,NaN])assert.throws(()=>M.selection(.2,s,20));
 for(const n of [-1,1.5,41,NaN])assert.throws(()=>M.selection(.2,.2,n));
 assert.deepEqual([...M.checkpoints(0)],[0]);assert.deepEqual([...M.checkpoints(1)],[0,1]);assert.deepEqual([...M.checkpoints(20)],[0,5,10,15,20]);assert.throws(()=>M.checkpoints(41));
});
test('Culture: hand-counted first rounds, totals, shares, and checking rule',()=>{
 const start=M.culture(0,false);assert.deepEqual([...start.counts],[100,100,100,100]);close(start.total,400);
 const first=M.culture(1,false);[120,160,110,140].forEach((v,i)=>close(first.counts[i],v));close(first.shares[1],160/530);
 const checked=M.culture(1,true);close(checked.counts[1],80);close(checked.shares[1],80/450);
 for(const checking of [false,true])for(let n=0;n<=10;n++){
  const r=M.culture(n,checking);close(r.shares.reduce((a,b)=>a+b,0),1);assert.ok(r.counts.every(v=>Number.isFinite(v)&&v>0));
  const noCheck=M.culture(n,false);for(const i of [0,2,3])close(r.counts[i],noCheck.counts[i]);
  if(n>0){const prior=M.culture(n-1,checking);r.counts.forEach((v,i)=>close(v,prior.counts[i]*r.rates[i],1e-8));}
  if(checking)close(r.counts[1],noCheck.counts[1]/2**n,1e-8);
 }
 close(M.culture(4,false).counts[1],655.36);close(M.culture(4,true).counts[1],40.96);
 for(const n of [-1,.5,11,NaN])assert.throws(()=>M.culture(n,false));assert.throws(()=>M.culture(1,'yes'));
});
// Real scripts and event handlers; deliberately not a browser or accessibility test.
class Element{
 constructor(tag,a={}){this.tagName=tag;this.attrs=a;this.id=a.id;this.value=a.value||'';this.checked=false;this.disabled=false;this.textContent='';this.style={};this.children=[];this.listeners={};}
 setAttribute(k,v){this.attrs[k]=String(v);}
 addEventListener(k,fn){this.listeners[k]=fn;}
 replaceChildren(...children){this.children=children;}
 fire(event){assert.equal(typeof this.listeners[event],'function');this.listeners[event]();}
}
function page(){
 const elements=[...html.matchAll(/<([a-z][\w-]*)\b([^>]*)>/gi)].map(m=>{const e=new Element(m[1],attrs(m[2]));e.disabled=/\sdisabled(?:\s|$)/.test(m[2]);return e;});
 const ids=new Map(elements.filter(e=>e.id).map(e=>[e.id,e]));assert.equal(ids.size,elements.filter(e=>e.id).length);
 const get=id=>{assert.ok(ids.has(id),`Missing ${id}`);return ids.get(id);};
 const c=vm.createContext({document:{getElementById:get,createElement:tag=>new Element(tag),querySelectorAll:s=>{assert.equal(s,'input[disabled],button[disabled]');return elements.filter(e=>['input','button'].includes(e.tagName)&&e.disabled);}}});
 vm.runInContext(script('lesson-model'),c);
 return {get,ids,elements,boot:()=>vm.runInContext(script('lesson-ui'),c),click:id=>get(id).fire('click'),input:(id,v)=>{get(id).value=String(v);get(id).fire('input');},check:state=>{get('fact-check').checked=state;get('fact-check').fire('change');}};
}
test('Selection controls: presets, frequencies, extremes and plot text agreement',()=>{
 const p=page();p.boot();assert.equal(p.get('green-frequency').textContent,(100*M.selection(.2,.2,20)[20]).toFixed(1)+'%');assert.equal(p.get('beetle-grid').children.length,100);
 p.click('neutral');assert.equal(p.get('green-frequency').textContent,'20.0%');p.click('favor-brown');assert.ok(parseFloat(p.get('green-frequency').textContent)<20);p.click('favor-green');
 p.input('generations',0);assert.equal(p.get('generation-bars').children.length,1);assert.equal(p.get('green-frequency').textContent,'20.0%');
 p.input('generations',1);assert.equal(p.get('green-frequency').textContent,'23.1%');assert.equal(p.get('generation-bars').children[1].children[2].textContent,'23.1% G');
 p.input('initial',0);assert.ok(p.get('beetle-grid').children.every(e=>e.textContent==='B'));p.input('initial',100);assert.ok(p.get('beetle-grid').children.every(e=>e.textContent==='G'));
 for(const id of ['initial','advantage','generations']){const e=p.get(id);for(const v of [e.attrs.min,e.attrs.max])p.input(id,v);}
 p.input('initial',99);p.input('advantage',100);p.input('generations',40);assert.match(p.get('selection-summary').textContent,/rounded/);
});
test('Culture controls: checkbox recalculation, all rounds and endpoint buttons',()=>{
 const p=page();p.boot();assert.equal(p.get('idea-count-1').textContent,'655.4 copies');p.check(true);assert.equal(p.get('idea-count-1').textContent,'41.0 copies');assert.equal(p.get('multiplier-1').textContent,'0.80');p.check(false);assert.equal(p.get('idea-count-1').textContent,'655.4 copies');
 p.input('rounds',0);assert.ok(p.get('previous-round').disabled);assert.equal(p.get('false-share').textContent,'25.0%');p.click('next-round');assert.equal(p.get('false-share').textContent,'30.2%');p.check(true);assert.equal(p.get('false-share').textContent,'17.8%');p.click('previous-round');assert.equal(p.get('false-share').textContent,'25.0%');
 for(let i=0;i<=10;i++)p.input('rounds',i);assert.ok(p.get('next-round').disabled);assert.ok(!p.get('previous-round').disabled);
});
test('Reset restores both experiments and every control state',()=>{
 const p=page();p.boot();p.input('initial',0);p.input('advantage',-50);p.input('generations',0);p.input('rounds',10);p.check(true);p.click('reset-experiments');
 assert.equal(Number(p.get('initial').value),20);assert.equal(Number(p.get('advantage').value),20);assert.equal(Number(p.get('generations').value),20);assert.equal(Number(p.get('rounds').value),4);assert.equal(p.get('fact-check').checked,false);assert.equal(p.get('idea-count-1').textContent,'655.4 copies');assert.equal(p.get('generation-bars').children.length,5);assert.ok(!p.get('next-round').disabled&&!p.get('previous-round').disabled);
});
test('Local links, control wiring, accessible references, and static content',()=>{
 const p=page(),controls=p.elements.filter(e=>['input','button'].includes(e.tagName));assert.ok(controls.every(e=>e.disabled));
 for(const el of p.elements)for(const attr of ['for','aria-labelledby','aria-describedby'])for(const ref of (el.attrs[attr]||'').split(' ').filter(Boolean))assert.ok(p.ids.has(ref),`Missing reference ${ref}`);
 for(const input of controls.filter(e=>e.tagName==='input'))assert.ok(p.elements.some(e=>e.tagName==='label'&&e.attrs.for===input.id));
 for(const m of html.matchAll(/href="([^"]+)"/g)){if(/^https?:/.test(m[1]))continue;const [target,anchor]=m[1].split('#');if(!target)assert.ok(p.ids.has(anchor));else assert.ok(fs.existsSync(path.resolve(path.dirname(file),target)),target);}
 assert.ok(/id="beetle-grid"[^>]*><span/.test(html));assert.ok(/id="generation-bars"><div/.test(html));assert.ok(html.includes('<noscript>'));assert.ok(html.includes('prefers-reduced-motion'));assert.ok(html.includes(':focus-visible'));assert.ok(/<details class="practice">/.test(html));
 p.boot();assert.ok(controls.every(e=>!e.disabled));assert.ok(controls.every(e=>Object.keys(e.listeners).length>0));
});
test('Offline scripts and scientific model boundaries remain explicit',()=>{
 assert.ok(!/<script[^>]+src=/.test(html));assert.ok(!/\b(fetch|XMLHttpRequest|localStorage|sessionStorage|setInterval)\b/.test(script('lesson-ui')));
 for(const phrase of ['not a sampled population census','not a model of real beetle mating','not estimates of real audiences','not cumulative reach','applied from round zero','not a simulated social network','not a fitted historical model','not a settled account'])assert.ok(html.includes(phrase),phrase);
});
