// Local browser regression: all inquiry responses are mocked; no email is sent.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const out=path.join(require('node:os').tmpdir(),'japanitem-readability-fixed');
fs.mkdirSync(out,{recursive:true});
const server=http.createServer((req,res)=>{
  const url=new URL(req.url,'http://localhost');
  const file=path.resolve(root,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));
  if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}
  fs.readFile(file,(error,data)=>{
    if(error){res.writeHead(404);return res.end();}
    const types={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.jpg':'image/jpeg','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'};
    res.setHeader('Content-Type',types[path.extname(file)] || 'application/octet-stream');res.end(data);
  });
});
(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base=`http://127.0.0.1:${server.address().port}`;
  const browser=await chromium.launch({channel:'msedge',headless:true});
  try{
    for(const width of [320,375,414,768,1280]){
      const page=await browser.newPage({viewport:{width,height:900}});
      const errors=[];page.on('pageerror',e=>errors.push(e.message));
      for(const url of ['/index.html','/products.html','/products/4511413310076.html','/how-to-order.html']){
        await page.goto(base+url,{waitUntil:'domcontentloaded'});
        await page.waitForTimeout(350);
        const state=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,
          croppedBrand:(()=>{const e=document.querySelector('.bm-name');return e?e.scrollWidth>e.clientWidth:false;})(),
          heroOverlap:(()=>{const c=document.querySelector('.hero-cta'),chips=document.querySelector('.hero-chips');return c&&chips?c.getBoundingClientRect().bottom>chips.getBoundingClientRect().top:false;})(),
          filtersOpen:document.querySelector('#filtersPanel')?.open}));
        const clippedButtons=await page.evaluate(()=>[...document.querySelectorAll('.hero-search button,.pdp-actions .btn,.product .foot .btn')].filter(el=>{const r=el.getBoundingClientRect();return r.width>0&&(r.left<0 || r.right>innerWidth);}).map(el=>el.textContent));
        assert.deepEqual(clippedButtons,[],`${url} buttons outside viewport at ${width}`);
        assert.equal(state.overflow,false,`${url} overflow at ${width}`);
        assert.equal(state.croppedBrand,false,`brand cropped at ${width}`);
        assert.equal(state.heroOverlap,false,`hero controls overlap at ${width}`);
        if(url==='/products.html' && width<=768) assert.equal(state.filtersOpen,false);
        if(width===375 || width===1280) await page.screenshot({path:path.join(out,`${path.basename(url,'.html')}-${width}.png`)});
      }
      assert.deepEqual(errors,[],`browser errors at ${width}`);
      await page.close();console.log(`Layout passed: ${width}px`);
    }
    const page=await browser.newPage({viewport:{width:1280,height:900}});
    await page.goto(base+'/how-to-order.html');
    for(const [lang,start] of [['en','In-stock items'],['zh','现货商品'],['ja','在庫品']]){
      const result=await page.evaluate(({lang,start})=>{
        setLang(lang);
        return t('legal.l12v').startsWith(start) && t('cb.a.returns')===t('legal.l14v');
      },{lang,start});
      assert.equal(result,true,`policy dictionary mismatch for ${lang}`);
    }
    await page.evaluate(()=>setLang('en'));
    await page.goto(base+'/products.html');
    await page.locator('#brandFilterSearch').fill('DHC');assert.equal(await page.locator('#filterBrands li').count(),1);
    await page.evaluate(()=>addToCart('4511413310076',2));
    await Promise.all([page.waitForURL('**/how-to-order.html?quote=cart#request'),page.locator('#cartDrawer .btn-primary').click()]);
    assert(await page.locator('.quote-review').innerText().then(x=>x.includes('4511413310076')));
    assert.equal(await page.locator('#reqQuantity').isVisible(),false);
    assert.equal(await page.locator('#reqProduct').evaluate(el=>el.readOnly),true);
    await page.locator('#reqName').fill('Test buyer');await page.locator('#reqCompany').fill('Test shop');await page.locator('#reqEmail').fill('test@example.com');
    const before=await page.evaluate(()=>localStorage.getItem('tsumugi_cart_v1'));
    for(const response of [{status:500,body:{error:'SERVER_ERROR'}},{status:201,body:{ok:true}}]){
      await page.route('**/api/inquiry',route=>route.fulfill({status:response.status,contentType:'application/json',body:JSON.stringify(response.body)}));
      await page.locator('#inquiryForm button[type=submit]').click();
      await page.locator('.form-status.error').waitFor();
      assert.equal(await page.evaluate(()=>localStorage.getItem('tsumugi_cart_v1')),before);
      assert.equal(await page.locator('#reqName').inputValue(),'Test buyer');
      assert.equal(await page.locator('#inquiryForm button[type=submit]').isEnabled(),true);
      await page.unroute('**/api/inquiry');
    }
    await page.route('**/api/inquiry',async route=>{
      const body=route.request().postDataJSON();assert(body.notes.includes('Qty: 2'));assert(body.notes.includes('4511413310076'));
      // Preserve additions made in another tab while the submitted snapshot is pending.
      await page.evaluate(()=>{const cart=JSON.parse(localStorage.getItem('tsumugi_cart_v1'));cart['4511413310076']=3;localStorage.setItem('tsumugi_cart_v1',JSON.stringify(cart));});
      await route.fulfill({status:201,contentType:'application/json',body:JSON.stringify({ok:true,request_id:'JI-test-reference'})});
    });
    await page.locator('#inquiryForm button[type=submit]').click();await page.locator('.form-status.success').waitFor();
    assert((await page.locator('.form-status').innerText()).includes('JI-test-reference'));
    assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('tsumugi_cart_v1'))['4511413310076']),1);
    assert.equal(await page.locator('.quote-review').count(),0);
    assert.equal(await page.locator('#reqQuantity').isVisible(),true);
    console.log('Quote flow passed: guest, failure, malformed response, reference, concurrent cart preservation; EN/ZH/JA policies passed');
    await page.close();console.log(`Screenshots: ${out}`);
  }finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;});
