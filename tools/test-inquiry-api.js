const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const crypto = require('node:crypto');

function fixture(mailOk=true){
  const queries=[], mails=[];
  const client={query:async sql=>{queries.push(sql);return {rows:[]};},release(){queries.push('RELEASE');}};
  const pool={query:async sql=>{queries.push(sql);},connect:async()=>client};
  const box={module:{exports:{}},require:name=>name==='./_db'?{pool}:name==='./_auth'?{verify(){throw Error('invalid');}}:crypto,
    process:{env:{RESEND_API_KEY:'test-key'}},console:{error(){}},
    fetch:async(url,options)=>{mails.push(JSON.parse(options.body));return {ok:mailOk,status:mailOk?200:500,text:async()=> 'test rejection'};}};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../api/inquiry.js'),'utf8'),box);
  const response={status(code){this.code=code;return this;},json(body){this.body=body;return this;}};
  return {handler:box.module.exports,response,queries,mails};
}
const request=()=>({method:'POST',headers:{},body:{name:'Test <name>',company:'Test company',email:'buyer@example.com',product:'Quote list',notes:'JAN 4511413310076 | Qty: 2'}});
test('guest inquiry confirms database commit and mail acceptance, returning reference',async()=>{
  const f=fixture();await f.handler(request(),f.response);
  assert.equal(f.response.code,201);assert.equal(f.response.body.ok,true);
  assert.match(f.response.body.request_id,/^JI-[a-f0-9-]{36}$/);
  assert(f.queries.includes('COMMIT'));assert(!f.queries.includes('ROLLBACK'));
  assert(f.mails[0].subject.includes(f.response.body.request_id));
  assert(f.mails[0].html.includes('&lt;name&gt;'));assert(f.mails[0].text.includes('JAN 4511413310076'));
});
test('mail rejection never returns success and rolls back',async()=>{
  const f=fixture(false);await f.handler(request(),f.response);
  assert.equal(f.response.code,500);assert(!f.response.body.ok);
  assert(f.queries.includes('ROLLBACK'));assert(!f.queries.includes('COMMIT'));assert(f.queries.includes('RELEASE'));
});
test('invalid email is rejected before database or email calls',async()=>{
  const f=fixture();const req=request();req.body.email='not-an-email';await f.handler(req,f.response);
  assert.equal(f.response.code,400);assert.equal(f.queries.length,0);assert.equal(f.mails.length,0);
});
