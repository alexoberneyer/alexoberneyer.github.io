'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const directory=path.resolve(__dirname,'../docs/learning/artifacts');
const close=(a,b,tolerance=1e-10)=>assert.ok(Math.abs(a-b)<tolerance,`${a} != ${b}`);
const attrs=s=>Object.fromEntries([...s.matchAll(/([\w-]+)="([^"]*)"/g)].map(m=>[m[1],m[2]]));
// Runs actual event handlers against a document stub. This is not browser/render QA.
class Element{
 constructor(tag,a={}){this.tagName=tag;this.attrs=a;this.id=a.id;this.value=a.value||'';this.textContent='';this.style={};this.children=[];this.listeners={};this.disabled=false;}
 setAttribute(k,v){this.attrs[k]=String(v);}
 addEventListener(k,fn){this.listeners[k]=fn;}
 replaceChildren(...children){this.children=children;}
 fire(event){assert.equal(typeof this.listeners[event],'function');this.listeners[event]();}
}
function load(name){
 const file=path.join(directory,name+'.html'),html=fs.readFileSync(file,'utf8');
 const script=id=>html.match(new RegExp(`<script id="${id}">([\\s\\S]*?)<\\/script>`))[1];
 const elements=[...html.matchAll(/<([a-z][\w-]*)\b([^>]*)>/gi)].map(m=>{const e=new Element(m[1],attrs(m[2]));e.disabled=/\sdisabled(?:\s|$)/.test(m[2]);return e;});
 const ids=new Map(elements.filter(e=>e.id).map(e=>[e.id,e]));assert.equal(ids.size,elements.filter(e=>e.id).length,'Duplicate IDs');
 const get=id=>{assert.ok(ids.has(id),`Missing ID ${id}`);return ids.get(id);};
 const context=vm.createContext({document:{getElementById:get,createElement:tag=>new Element(tag),querySelectorAll:selector=>{assert.equal(selector,'input[disabled],button[disabled]');return elements.filter(e=>['input','button'].includes(e.tagName)&&e.disabled);}}});
 vm.runInContext(script('lesson-model'),context);const M=vm.runInContext('LessonModel',context);
 const boot=()=>vm.runInContext(script('lesson-ui'),context);
 return {html,file,script,elements,ids,get,M,boot,click:id=>get(id).fire('click'),input:(id,v)=>{get(id).value=String(v);get(id).fire('input');}};
}
test('Bayes: independent counts, null conditioning, and normalized probabilities',()=>{
 const {M}=load('bayesian-reasoning');const r=M.detector(.01,.9,.05);
 // A concrete population: 90 fault alarms + 495 working alarms out of 10,000.
 close(r.posterior,90/585);close(r.negativeRisk,10/9415);
 assert.equal(M.detector(0,1,0).posterior,null);assert.equal(M.detector(1,1,0).negativeRisk,null);
 close(M.detector(.2,1,0).posterior,1);close(M.detector(.2,.5,.5).posterior,.2);
 for(const p of [0,.01,.2,.5,1])for(const s of [0,.1,.9,1])for(const f of [0,.05,.9,1]){const r=M.detector(p,s,f);close(r.tp+r.fp+r.fn+r.tn,1);if(r.posterior!==null)assert.ok(r.posterior>=0&&r.posterior<=1);}
 for(const bad of [-1,2,NaN,Infinity])assert.throws(()=>M.detector(bad,.9,.05));
});
test('Bayes: sequential evidence, reciprocal cancellation, and limits',()=>{
 const {M}=load('bayesian-reasoning');[.1,.25,.5,.75].forEach((p,n)=>close(M.accumulate(Array(n).fill(1)).posterior,p));
 close(M.accumulate([1,-1,0]).posterior,.1);
 assert.ok(M.accumulate(Array(20).fill(1)).posterior<1);assert.ok(M.accumulate(Array(20).fill(-1)).posterior>0);
 assert.throws(()=>M.accumulate(Array(21).fill(1)));assert.throws(()=>M.accumulate([2]));
});
test('Bayes: presets, impossible event feedback, history/undo, reset',()=>{
 const p=load('bayesian-reasoning');p.boot();const {get,click,input}=p;
 assert.equal(get('posterior').textContent,'15.4%');assert.equal(get('alert-dots').children.length,100);assert.ok(get('undo').disabled);
 click('common');assert.equal(get('posterior').textContent,'81.8%');click('perfect');assert.equal(get('posterior').textContent,'100.0%');
 input('prior',0);assert.equal(get('posterior').textContent,'Undefined');assert.equal(get('alert-dots').children.length,0);
 click('rare');assert.equal(get('posterior').textContent,'15.4%');
 for(let i=0;i<3;i++)click('evidence-for');assert.equal(get('evidence-posterior').textContent,'75.0%');
 click('evidence-against');assert.equal(get('evidence-posterior').textContent,'50.0%');click('undo');assert.equal(get('evidence-posterior').textContent,'75.0%');click('evidence-neutral');assert.equal(get('evidence-posterior').textContent,'75.0%');
 for(let i=0;i<16;i++)click('evidence-for');assert.ok(get('evidence-for').disabled);assert.ok(get('evidence-against').disabled);click('undo');assert.ok(!get('evidence-for').disabled);
 for(const id of ['prior','sensitivity','false-positive'])for(const v of [0,100])input(id,v);
 click('reset-experiments');assert.equal(get('posterior').textContent,'15.4%');assert.equal(get('evidence-posterior').textContent,'10.0%');assert.ok(get('undo').disabled);
});
test('Causality: reversal and common-population contrasts',()=>{
 const {M}=load('causality');const r=M.mix(.1,.9,.5);
 // 1,000 jobs per observed group: A 90/100 easy + 270/900 hard;
 // B 720/900 easy + 20/100 hard. Standardization: 500 of each difficulty.
 close(r.observedA,360/1000);close(r.observedB,740/1000);close(r.standardA,600/1000);close(r.standardB,500/1000);
 for(let q=0;q<=100;q++){const r=M.mix(.1,.9,q/100);close(r.standardA-r.standardB,.1);const balanced=M.mix(q/100,q/100,q/100);close(balanced.observedA,balanced.standardA);close(balanced.observedB,balanced.standardB);}
 assert.throws(()=>M.mix(NaN,.5,.5));assert.throws(()=>M.mix(.5,2,.5));
});
test('Causality: individual effects fixed while observed comparisons change',()=>{
 const {M}=load('causality');close(M.potential(false).observed,-3.5);close(M.potential(true).observed,1.5);close(M.potential(false).effect,-1);close(M.potential(true).effect,-1);
 assert.deepEqual([...M.potential(false).assignment],[0,1,0,1]);assert.deepEqual([...M.potential(true).assignment],[1,0,1,0]);
 // Independently enumerate all balanced randomized assignments in this finite population.
 const estimates=[];for(let mask=0;mask<16;mask++){const A=[],B=[];for(let j=0;j<4;j++)((mask>>j)&1?A:B).push(j);if(A.length===2)estimates.push(A.reduce((s,j)=>s+M.times[j][0],0)/2-B.reduce((s,j)=>s+M.times[j][1],0)/2);}
 close(estimates.reduce((s,v)=>s+v,0)/estimates.length,-1);
});
test('Causality: intervention arrow, target mix, assignment/reveal and reset',()=>{
 const p=load('causality');p.boot();const {get,click,input}=p;
 assert.equal(get('intervention-rate').textContent,'36.0%');click('intervene');assert.equal(get('intervention-rate').textContent,'60.0%');assert.equal(get('assignment-edge').style.display,'none');assert.equal(get('intervene').attrs['aria-pressed'],'true');
 input('target',75);assert.equal(get('intervention-rate').textContent,'75.0%');click('balance');assert.equal(get('observed-a').textContent,'75.0%');assert.equal(get('observed-b').textContent,'65.0%');
 click('observe');assert.equal(get('assignment-edge').style.display,'');click('confounded');assert.equal(get('intervention-rate').textContent,'36.0%');
 assert.equal(get('true-effect').textContent,'Unknown');assert.equal(get('po-b-0').textContent,'?');click('reveal');assert.equal(get('true-effect').textContent,'−1.0 h');assert.equal(get('po-b-0').textContent,'6');click('swap');assert.equal(get('observed-time').textContent,'+1.5 h');click('reveal');assert.equal(get('po-a-0').textContent,'?');
 for(const id of ['mix-a','mix-b','target'])for(const v of [1,99])input(id,v);
 click('reset-experiments');assert.equal(get('intervention-rate').textContent,'36.0%');assert.equal(get('true-effect').textContent,'Unknown');assert.equal(get('observed-time').textContent,'−3.5 h');assert.equal(get('po-a-0').textContent,'4');
});
test('Entropy: enumerate all 4,096 assignments independently',()=>{
 const {M}=load('entropy-irreversibility'),counts=Array(13).fill(0);
 for(let mask=0;mask<4096;mask++){let k=0;for(let bit=0;bit<12;bit++)k+=(mask>>bit)&1;counts[k]++;}
 for(let k=0;k<=12;k++){const r=M.occupancy(k);assert.equal(r.ways,counts[k]);close(r.probability,counts[k]/4096);close(r.entropy,Math.log(counts[k]));close(r.entropy,M.occupancy(12-k).entropy);}
 assert.equal(counts[6],924);close(counts.slice(4,9).reduce((a,b)=>a+b)/4096,.85400390625);
 assert.throws(()=>M.occupancy(13));assert.throws(()=>M.occupancy(.5));
});
test('Entropy: logarithmic scale and large-number stability',()=>{
 const {M}=load('entropy-irreversibility');for(const n of [12,100,1000]){const r=M.scale(n);close(r.exponent,Math.log10(2**(-n)),1e-9);assert.ok(r.mantissa>=1&&r.mantissa<10);assert.ok(Number.isFinite(r.exponent));}
 close(M.scale(100).exponent,-30.10299956639812);assert.throws(()=>M.scale(1001));assert.throws(()=>M.scale(0));
});
test('Entropy: conserve energy, entropy increases, equilibrium reference',()=>{
 const {M}=load('entropy-irreversibility'),r=M.heat(400,1);close(r.hot,350);close(r.cold,350);close(r.q,5000);close(r.total,2.06192872027356);close(r.hotEntropy,-13.3531392624523);close(r.coldEntropy,15.4150679827258);
 for(const hot of [300,320,400,600]){let previous=0;for(let i=0;i<=100;i++){const r=M.heat(hot,i/100);close(r.energyChange,0,1e-8);assert.ok(r.total>=previous-1e-10);assert.ok(r.hotEntropy<=1e-10&&r.coldEntropy>=-1e-10);assert.ok(r.hot>=r.cold);previous=r.total;}}
 assert.throws(()=>M.heat(0,.5));assert.throws(()=>M.heat(400,1.1));assert.throws(()=>M.heat(NaN,.5));
});
test('Entropy: occupancy, scaling, heat controls, and reset',()=>{
 const p=load('entropy-irreversibility');p.boot();const {get,click,input}=p;
 assert.equal(get('ways').textContent,'924');click('all-left');assert.equal(get('ways').textContent,'1');assert.equal(get('macro-probability').textContent,'0.0244%');assert.equal(get('left-particles').children.length,12);assert.equal(get('right-particles').children.length,0);
 click('half');assert.equal(get('left-particles').children.length,6);for(let k=0;k<=12;k++){input('left-count',k);assert.equal(get('occupancy-bar-'+k).attrs.fill,'#176653');}
 for(const n of [12,100,1000])click('n'+n);assert.equal(get('probability-exponent').textContent,'−301.03');input('particle-number',12);
 click('equilibrate');assert.equal(get('entropy-total').textContent,'2.062');assert.equal(get('hot-temperature').textContent,'350.0 K');assert.equal(get('energy-change').textContent,'0 J');input('hot-start',600);assert.equal(get('hot-temperature').textContent,'450.0 K');click('heat-start');assert.equal(get('entropy-total').textContent,'0.000');input('heat-progress',50);
 click('reset-experiments');assert.equal(get('ways').textContent,'924');assert.equal(get('probability-exponent').textContent,'−30.10');assert.equal(get('hot-temperature').textContent,'400.0 K');assert.equal(get('entropy-total').textContent,'0.000');
});
for(const name of ['bayesian-reasoning','causality','entropy-irreversibility'])test(name+': controls, local links, labels, and offline fallbacks',()=>{
 const p=load(name);const controls=p.elements.filter(e=>['input','button'].includes(e.tagName));assert.ok(controls.every(e=>e.disabled),'Controls must be inert before script boot');
 for(const input of controls.filter(e=>e.tagName==='input'))assert.ok(p.elements.some(e=>e.tagName==='label'&&e.attrs.for===input.id));
 for(const e of p.elements)for(const key of ['aria-labelledby','aria-describedby','for'])if(e.attrs[key])for(const id of e.attrs[key].split(' '))assert.ok(p.ids.has(id),`Missing reference ${id}`);
 for(const m of p.html.matchAll(/href="([^"]+)"/g)){if(/^https?:/.test(m[1]))continue;const [target,anchor]=m[1].split('#');if(!target)assert.ok(p.ids.has(anchor));else assert.ok(fs.existsSync(path.resolve(path.dirname(p.file),target)),target);}
 assert.ok(!/<script[^>]+src=/.test(p.html));assert.ok(!/\b(fetch|XMLHttpRequest|localStorage|sessionStorage)\b/.test(p.script('lesson-ui')));assert.ok(p.html.includes('<noscript>'));assert.ok(p.html.includes('prefers-reduced-motion'));assert.ok(p.html.includes(':focus-visible'));
 assert.ok(/<details class="practice">/.test(p.html));assert.ok(/class="metric"[^>]*>[^<]+</.test(p.html));
 p.boot();for(const control of controls)assert.ok(Object.keys(control.listeners).length,`Unwired control ${control.id}`);
 if(name!=='bayesian-reasoning')assert.ok(controls.every(e=>!e.disabled));
});
