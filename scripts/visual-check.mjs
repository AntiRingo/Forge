import {chromium} from 'playwright';import assert from 'node:assert/strict';
const b=await chromium.launch({channel:'msedge',headless:true,args:['--enable-unsafe-swiftshader']});const p=await b.newPage({viewport:{width:1440,height:1050}});
await p.goto('http://127.0.0.1:5173',{waitUntil:'networkidle'});
assert.equal(await p.evaluate(()=>getComputedStyle(document.body).backgroundColor),'rgb(20, 27, 29)');
const button=await p.locator('#start').boundingBox(),panel=await p.locator('#work-panel').boundingBox();assert.ok(button.y+button.height<=panel.y+panel.height,'Primary button must be visible within the panel');
await p.screenshot({path:'qa/desktop-prepare.png',fullPage:true});
await p.setViewportSize({width:390,height:844});await p.screenshot({path:'qa/mobile-prepare.png',fullPage:true});assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth),false);
await b.close();console.log('Visual checks passed: dark theme, visible primary action, mobile width.');
