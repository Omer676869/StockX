let stocks = {AAPL:{p:150,h:[150]},MSFT:{p:380,h:[380]},GOOGL:{p:140,h:[140]},TSLA:{p:250,h:[250]}};
let pos = [], cash = 10000, sel = 'AAPL';

function draw(){
  let c=document.getElementById('chart'),x=c.getContext('2d'),h=stocks[sel].h;
  x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);
  let mn=Math.min(...h),mx=Math.max(...h),r=mx-mn||1,mid=c.height/2;
  for(let i=0;i<h.length;i++){
    let y=c.height-((h[i]-mn)/r)*(c.height-40)-20,px=(i/h.length)*c.width;
    x.strokeStyle=y>mid?'#c62828':'#2e7d32';x.lineWidth=2;x.beginPath();
    if(i>0){let py=c.height-((h[i-1]-mn)/r)*(c.height-40)-20;x.moveTo((i-1)/h.length*c.width,py);}
    x.lineTo(px,y);x.stroke();
  }
  x.strokeStyle='#999';x.lineWidth=1;x.beginPath();x.moveTo(0,mid);x.lineTo(c.width,mid);x.stroke();
}

function upd(){
  let s=stocks[sel];s.p+=(Math.random()-0.5)*2;s.h.push(s.p);
  if(s.h.length>50)s.h.shift();
  let val=pos.reduce((a,p)=>a+p.s*stocks[p.t].p,0);
  document.getElementById('chartPrice').textContent='$'+s.p.toFixed(2);
  document.getElementById('priceChange').textContent=((s.p-s.h[0])/s.h[0]*100).toFixed(2)+'%';
  document.getElementById('headerBalance').textContent='$'+(cash+val).toFixed(2);
  document.getElementById('positionsList').innerHTML=pos.length?pos.map((p,i)=>`<div class="position-item"><div class="position-info"><div class="position-symbol">${p.t}×${p.s}</div><div class="position-details">$${p.e.toFixed(2)}→$${stocks[p.t].p.toFixed(2)}</div></div><div class="position-pnl ${(stocks[p.t].p-p.e)*p.s>=0?'positive':'negative'}">${((stocks[p.t].p-p.e)*p.s).toFixed(0)}</div><button class="close-btn" onclick="cash+=pos[${i}].s*stocks[pos[${i}].t].p;pos.splice(${i},1);upd()">X</button></div>`).join(''):' <p class="empty-msg">No positions</p>';
  draw();
}

Object.keys(stocks).forEach(t=>{
  let b=document.createElement('button');b.className='stock-btn';b.textContent=t;
  b.onclick=()=>{sel=t;document.querySelectorAll('.stock-btn').forEach(x=>x.classList.remove('active'));b.classList.add('active');document.getElementById('chartTitle').textContent=t;upd();};
  document.getElementById('stocksList').appendChild(b);
});
document.querySelector('.stock-btn').classList.add('active');

document.getElementById('buyBtn').onclick=()=>{let s=parseInt(document.getElementById('shares').value),c=stocks[sel].p*s;if(cash>=c){cash-=c;pos.push({t:sel,s,e:stocks[sel].p,c});upd();}};
document.getElementById('sellBtn').onclick=()=>{if(pos.length){let p=pos.pop();cash+=p.s*stocks[p.t].p;}upd();};

setInterval(upd,2000);upd();
