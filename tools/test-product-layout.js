/* Browser regression checks; screenshots go to the OS temp folder. */
const fs = require('fs');
const path = require('path');
const http = require('http');
const assert = require('assert/strict');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');
const output = path.join(require('os').tmpdir(), 'japanitem-pdp-layout-qa');
fs.mkdirSync(output, {recursive:true});
const types = {'.html':'text/html', '.js':'application/javascript', '.css':'text/css', '.jpg':'image/jpeg', '.png':'image/png', '.webp':'image/webp', '.svg':'image/svg+xml'};
const server = http.createServer((req,res)=>{
  const file = path.resolve(root, '.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
  if(!file.startsWith(root+path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {res.writeHead(404);res.end();return;}
  res.setHeader('Content-Type', types[path.extname(file)]||'application/octet-stream');
  fs.createReadStream(file).pipe(res);
});
(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const browser = await chromium.launch({channel:'msedge', headless:true});
  try {
    const page = await browser.newPage();
    const errors=[]; page.on('pageerror',e=>errors.push(e.message));
    const url=`http://127.0.0.1:${server.address().port}/products/4511413310076.html`;
    for(const width of [320,375,414,768,1280]) {
      await page.setViewportSize({width,height:900});
      await page.goto(url,{waitUntil:'networkidle'});
      await page.locator('.pdp-actions .save').waitFor();
      assert.equal(await page.locator('.pdp-specs > div').count(),4);
      assert.equal(await page.locator('.pdp-evidence').first().getAttribute('open'),null);
      const metrics=await page.evaluate(()=>({width:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth,buttonBottom:document.querySelector('.pdp-actions').getBoundingClientRect().bottom}));
      assert(metrics.scroll<=metrics.width,`Overflow at ${width}: ${JSON.stringify(metrics)}`);
      if(width===1280) assert(metrics.buttonBottom<800,'Desktop inquiry controls below laptop fold');
      const shot=await page.screenshot({path:path.join(output,`pdp-${width}.png`),fullPage:true});
      assert.equal(shot.readUInt32BE(16),width,'Off-canvas content widens full-page capture');
      await page.screenshot({path:path.join(output,`pdp-top-${width}.png`)});
      await page.locator('.pdp-evidence summary').first().focus();
      await page.keyboard.press('Enter');
      assert.notEqual(await page.locator('.pdp-evidence').first().getAttribute('open'),null);
      assert(await page.locator('.pdp-evidence-list').first().isVisible());
      assert((await page.locator('.pdp-evidence').first().innerText()).includes('not manufacturer-confirmed'));
      assert(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth));
    }
    for(const lang of ['zh','ja','en']) {
      await page.evaluate(lang=>setLang(lang),lang);
      assert(!(await page.locator('.pdp-info').innerText()).includes('pdp.procurement'));
      assert(await page.locator('.pdp-actions .btn-primary').getAttribute('href').then(h=>h.includes('4511413310076')));
    }
    assert.deepEqual(errors,[]);
    const staticPage=await browser.newPage({javaScriptEnabled:false,viewport:{width:1280,height:800}});
    await staticPage.goto(url); assert.equal(await staticPage.locator('.pdp-specs > div').count(),4);
    assert(await staticPage.locator('.pdp-actions .btn-primary').isVisible());
    await staticPage.screenshot({path:path.join(output,'pdp-static.png'),fullPage:true});
    for(const width of [320,375,414,768,1280]) {
      await page.setViewportSize({width,height:900});
      await page.goto(`http://127.0.0.1:${server.address().port}/index.html`,{waitUntil:'networkidle'});
      await page.locator('#catGrid .cat-card').first().waitFor();
      assert.equal(await page.locator('#catGrid .cat-card').count(),6);
      assert.equal(await page.locator('#catGrid').evaluate(e=>getComputedStyle(e).gridTemplateColumns.split(' ').length),width>=960?3:2);
      assert(!(await page.locator('#homeCategories').innerText()).includes('Four essential'));
      assert(!(await page.locator('#homeCategories').innerText()).includes('subcategories'));
      assert(await page.locator('#catGrid .arr').first().evaluate(e=>getComputedStyle(e).opacity==='1'));
      const counts=await page.evaluate(()=>[...document.querySelectorAll('#catGrid .cat-card')].map(e=>{
        const cat=new URL(e.href).searchParams.get('cat');
        return {displayed:Number(e.querySelector('.count strong').textContent.replace(/,/g,'')),actual:CATALOG_PRODUCTS.filter(p=>p.category===cat).length};
      }));
      assert(counts.every(c=>c.displayed===c.actual));
      await page.locator('#homeCategories').screenshot({path:path.join(output,`categories-${width}.png`)});
      await page.locator('#catGrid .cat-card').first().focus();
      assert.equal(await page.locator('#catGrid .cat-card').first().evaluate(e=>getComputedStyle(e).outlineWidth),'2px');
      assert(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth));
    }
    for(const lang of ['zh','ja','en']) {
      await page.evaluate(lang=>setLang(lang),lang);
      assert(!(await page.locator('#homeCategories').innerText()).includes('cat.products'));
      assert((await page.locator('#catGrid .cat-card').first().innerText()).includes(lang==='zh'?'款商品':lang==='ja'?'商品':'products'));
    }
    assert.deepEqual(errors,[]);
    await page.locator('#catGrid .cat-card').first().focus();
    await page.keyboard.press('Enter');
    await page.waitForURL('**/products.html?cat=health');
    console.log('PASS: category rows, real counts, visible arrows, keyboard navigation, live translation, 5 viewports.');
    console.log(`PASS: 5 viewports, keyboard disclosure, 3 languages, no JS errors, static fallback. Screenshots: ${output}`);
  } finally {await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
