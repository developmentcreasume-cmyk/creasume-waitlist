import fs from 'fs'
// launch chrome with remote debugging
import { spawn } from 'child_process'
const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless','--disable-gpu','--hide-scrollbars','--remote-debugging-port=9240','--window-size=1300,1000','http://127.0.0.1:4191/demo'], {detached:true})
await new Promise(r=>setTimeout(r,4500))
const list = await (await fetch('http://127.0.0.1:9240/json')).json()
const page = list.find(t=>t.type==='page')
const ws = new WebSocket(page.webSocketDebuggerUrl)
let id=0
const send=(m,p={})=>new Promise(res=>{const i=++id;const f=e=>{const x=JSON.parse(e.data);if(x.id===i){ws.removeEventListener('message',f);res(x.result)}};ws.addEventListener('message',f);ws.send(JSON.stringify({id:i,method:m,params:p}))})
await new Promise(r=>ws.addEventListener('open',r))
await send('Runtime.enable')
await new Promise(r=>setTimeout(r,2000))
// scroll to packages section
await send('Runtime.evaluate',{expression:`(()=>{const h=[...document.querySelectorAll('h2')].find(e=>/Collaboration Packages/i.test(e.textContent));if(h){h.scrollIntoView({block:'start'});window.scrollBy(0,-40)}return !!h})()`,returnByValue:true})
await new Promise(r=>setTimeout(r,1200))
// count book now buttons
const cnt = await send('Runtime.evaluate',{expression:`document.querySelectorAll('.pkg-book-btn').length`,returnByValue:true})
console.log('book-now buttons on page:', cnt.result.value)
const shot=await send('Page.captureScreenshot',{format:'png'})
fs.writeFileSync('packages_cta.png', Buffer.from(shot.data,'base64'))
console.log('saved')
ws.close()
