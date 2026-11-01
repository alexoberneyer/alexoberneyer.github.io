'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'../docs/learning');
const names=['bayesian-reasoning.html','causality.html','entropy-irreversibility.html','information-theory.html','evolution.html','standing-no-gi-game-plan.html','family-5s.html'];
const allowed=new Set([path.join(root,'index.html'),...names.map(name=>path.join(root,'artifacts',name))]);

test('exactly seven curated learning artifacts are published',()=>{
 const actual=fs.readdirSync(path.join(root,'artifacts')).filter(name=>name.endsWith('.html')).sort();
 assert.deepEqual(actual,names.slice().sort());
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
 const links=[...html.matchAll(/href="artifacts\/([^"#?]+\.html)"/g)].map(m=>m[1]);
 assert.equal(links.length,names.length);
 assert.deepEqual(links.slice().sort(),names.slice().sort());
 for(const section of ['science','bjj','everyday'])assert.match(html,new RegExp('id="'+section+'"'));
 assert.doesNotMatch(html,/World Model Atlas|16 topics|original labs/i);
});

test('published pages have no broken or unpublished relative links',()=>{
 for(const file of allowed){
  const html=fs.readFileSync(file,'utf8');
  assert.doesNotMatch(html,/World Model Atlas|original (?:atlas )?lab/i,file);
  for(const match of html.matchAll(/href="([^"]+)"/g)){
   const href=match[1];
   if(/^(#|https?:|mailto:|tel:|\/\/)/.test(href))continue;
   const pathname=href.split('#')[0].split('?')[0];
   if(!pathname)continue;
   const resolved=path.resolve(path.dirname(file),pathname);
   assert.ok(allowed.has(resolved),'Unpublished link in '+file+': '+href);
   assert.ok(fs.existsSync(resolved),'Missing target for '+href);
  }
 }
});

test('BJJ is interactive and contains no private notes links or illustrations',()=>{
 const html=fs.readFileSync(path.join(root,'artifacts/standing-no-gi-game-plan.html'),'utf8');
 assert.doesNotMatch(html,/<img\b|data:image\/|github\.com\/alexoberneyer\/notes/);
 for(const marker of ['id="scrubber"','id="reactions"','id="focusPins"','function renderPurposes','function renderHeadChoice'])assert.ok(html.includes(marker),marker);
});

test('Family 5S provides five steps, a decision tool and local checklist',()=>{
 const html=fs.readFileSync(path.join(root,'artifacts/family-5s.html'),'utf8');
 assert.equal((html.match(/name2:'/g)||[]).length,5);
 assert.equal((html.match(/data-task=/g)||[]).length,12);
 for(const marker of ['function decisionFor(item)','localStorage','90-day uncertainty box','Two yeses for shared items','Reset checklist'])assert.ok(html.includes(marker),marker);
});
