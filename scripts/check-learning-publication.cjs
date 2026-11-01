'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'../docs/learning');
const essays=['bayesian-reasoning.html','causality.html','entropy-irreversibility.html','information-theory.html','evolution.html'];
const allowed=new Set([path.join(root,'index.html'),...essays.map(name=>path.join(root,'artifacts',name))]);

test('exactly the five curated essays are published',()=>{
 const actual=fs.readdirSync(path.join(root,'artifacts')).filter(name=>name.endsWith('.html')).sort();
 assert.deepEqual(actual,essays.slice().sort());
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
 const links=[...html.matchAll(/href="artifacts\/([^"#?]+\.html)"/g)].map(m=>m[1]).sort();
 assert.deepEqual(links,essays.slice().sort());
 assert.doesNotMatch(html,/World Model Atlas|16 topics|original labs/i);
});

test('curated essays contain no broken or unpublished relative links',()=>{
 for(const file of allowed){
  const html=fs.readFileSync(file,'utf8');
  assert.doesNotMatch(html,/World Model Atlas|original (?:atlas )?lab/i,file);
  for(const match of html.matchAll(/href="([^"]+)"/g)){
   const href=match[1];
   if(/^(#|https?:|mailto:|tel:|\/\/)/.test(href))continue;
   const pathname=href.split('#')[0].split('?')[0];
   if(!pathname)continue;
   const resolved=path.resolve(path.dirname(file),pathname);
   assert.ok(allowed.has(resolved),`Unpublished link in ${file}: ${href}`);
   assert.ok(fs.existsSync(resolved),`Missing target for ${href}`);
  }
 }
});
