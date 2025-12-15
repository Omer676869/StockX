let stocks = {
  AAPL: {p:150, h:[150], c:[]},
  MSFT: {p:380, h:[380], c:[]},
  GOOGL: {p:140, h:[140], c:[]},
  TSLA: {p:250, h:[250], c:[]},
  NDAQ: {p:23500, h:[23500], c:[]}
};
let pos = [], cash = 100000, sel = 'AAPL', candleIdx = 0;

function initCandles(){
  Object.keys(stocks).forEach(t=>{
    stocks[t].c = [{o:stocks[t].p,h:stocks[t].p,l:stocks[t].p,c:stocks[t].p}];
  });
}

function draw(){
  let c = document.getElementById('chart'), x = c.getContext('2d'), candles = stocks[sel].c;
  x.fillStyle = '#fff';
  x.fillRect(0, 0, c.width, c.height);
  if(candles.length === 0) return;
  let allPrices = candles.flatMap(cd => [cd.h, cd.l]), mn = Math.min(...allPrices), mx = Math.max(...allPrices);
  let range = mx - mn || 1, pad = 50, chartW = c.width - 100, chartH = c.height - 80;
  let w = Math.max(2, chartW / candles.length * 0.4), sp = chartW / candles.length;
  x.fillStyle = '#666';
  x.font = '12px Manrope';
  x.textAlign = 'right';
  for(let i = 0; i < 5; i++){
    let price = mx - i * range / 4, y = pad + i * chartH / 4;
    x.fillText(price.toFixed(0), pad - 10, y + 4);
    x.strokeStyle = '#e8ecf1';
    x.lineWidth = 1;
    x.beginPath();
    x.moveTo(pad, y);
    x.lineTo(pad + chartW, y);
    x.stroke();
  }
  for(let i = 0; i < candles.length; i++){
    let cd = candles[i], x1 = pad + i * sp + sp / 2 - w / 2;
    let h = (cd.h - mn) / range, l = (cd.l - mn) / range, o = (cd.o - mn) / range, cl = (cd.c - mn) / range;
    let hy = pad + chartH - h * chartH, ly = pad + chartH - l * chartH;
    let oy = pad + chartH - o * chartH, cly = pad + chartH - cl * chartH;
    let isGreen = cd.c >= cd.o, color = isGreen ? '#2e7d32' : '#c62828';
    x.strokeStyle = color;
    x.fillStyle = color;
    x.lineWidth = 1;
    x.beginPath();
    x.moveTo(x1 + w / 2, hy);
    x.lineTo(x1 + w / 2, ly);
    x.stroke();
    x.fillRect(x1, Math.min(oy, cly), w, Math.abs(cly - oy) || 1);
  }
}

function upd(){
  let s = stocks[sel];
  s.p += (Math.random() - 0.5) * 2;
  s.h.push(s.p);
  if(s.h.length > 50) s.h.shift();
  let lastCandle = s.c[s.c.length - 1];
  if(lastCandle){
    lastCandle.h = Math.max(lastCandle.h, s.p);
    lastCandle.l = Math.min(lastCandle.l, s.p);
    lastCandle.c = s.p;
  }
  if(candleIdx++ % 5 === 0 && s.c.length > 0) s.c.push({o: s.p, h: s.p, l: s.p, c: s.p});
  if(s.c.length > 20) s.c.shift();
  let val = pos.reduce((a, p) => a + p.s * stocks[p.t].p, 0);
  document.getElementById('chartPrice').textContent = '$' + s.p.toFixed(2);
  let pctChange = ((s.p - s.h[0]) / s.h[0] * 100).toFixed(2);
  let priceChangeEl = document.getElementById('priceChange');
  priceChangeEl.textContent = pctChange + '%';
  priceChangeEl.classList.toggle('negative', pctChange < 0);
  document.getElementById('headerBalance').textContent = '$' + (cash + val).toFixed(2);
  document.getElementById('positionsList').innerHTML=pos.length?pos.map((p,i)=>`
    <div class="position-item">
      <div class="position-info">
        <div class="position-symbol">${p.t}×${p.s}</div>
        <div class="position-details">$${p.e.toFixed(2)}→$${stocks[p.t].p.toFixed(2)}</div>
      </div>
      <div class="position-pnl ${(stocks[p.t].p-p.e)*p.s>=0?'positive':'negative'}">${((stocks[p.t].p-p.e)*p.s).toFixed(0)}</div>
      <button class="close-btn" onclick="cash+=pos[${i}].s*stocks[pos[${i}].t].p;pos.splice(${i},1);upd()">X</button>
    </div>
  `).join(''):' <p class="empty-msg">No positions</p>';
  draw();
}

initCandles();

Object.keys(stocks).forEach(t => {
  let b = document.createElement('button');
  b.className = 'stock-btn';
  b.textContent = t;
  b.onclick = () => {
    sel = t;
    document.querySelectorAll('.stock-btn').forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    document.getElementById('chartTitle').textContent = t;
    upd();
  };
  document.getElementById('stocksList').appendChild(b);
});
document.querySelector('.stock-btn').classList.add('active');

document.getElementById('buyBtn').onclick = () => {
  let shares = parseInt(document.getElementById('shares').value);
  let cost = stocks[sel].p * shares;
  if(cash >= cost){
    cash -= cost;
    pos.push({t: sel, s: shares, e: stocks[sel].p, c: cost});
    upd();
  }
};

document.getElementById('sellBtn').onclick = () => {
  if(pos.length){
    let p = pos.pop();
    cash += p.s * stocks[p.t].p;
  }
  upd();
};

setInterval(upd, 600);
upd();
