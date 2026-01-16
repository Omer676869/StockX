let price = {AAPL: 150, MSFT: 380, GOOGL: 140, TSLA: 250, NDAQ: 23500};
let graph = {AAPL: [150], MSFT: [380], GOOGL: [140], TSLA: [250], NDAQ: [23500]};
let cash = 100000;
let myStocks = [];
let stock = 'AAPL';

function update(){
  price[stock] += (Math.random() - 0.5) * 2;
  graph[stock].push(price[stock]);
  if (graph[stock].length > 50) graph[stock].shift();

  let total = cash;
  for (let s of myStocks) total += s.amount * price[s.name];

  document.getElementById('chartPrice').textContent = '$' + price[stock].toFixed(2);
  let pct = ((price[stock] - graph[stock][0]) / graph[stock][0] * 100).toFixed(2);
  document.getElementById('priceChange').textContent = pct + '%';
  document.getElementById('priceChange').className = pct < 0 ? 'price-change negative' : 'price-change';
  document.getElementById('headerBalance').textContent = '$' + total.toFixed(2);

  let box = document.getElementById('positionsList');
  if (myStocks.length === 0) {
    box.innerHTML = '<p class="empty-msg">No positions</p>';
  } else {
    box.innerHTML = myStocks.map((s, i) => {
      let profit = (price[s.name] - s.cost) * s.amount;
      return `<div class="position-item">
        ${s.name} x${s.amount} | $${s.cost.toFixed(2)} → $${price[s.name].toFixed(2)}
        <div class="${profit >= 0 ? 'positive' : 'negative'}">${profit.toFixed(0)}</div>
        <button onclick="cash += myStocks[${i}].amount * price[myStocks[${i}].name]; myStocks.splice(${i}, 1); update()">Sell</button>
      </div>`;
    }).join('');
  }

  drawLine();
}

function drawLine(){
  let c = document.getElementById('chart');
  let ctx = c.getContext('2d');
  let p = graph[stock];

  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, c.width, c.height);

  if (p.length < 2) return;

  let min = Math.min(...p);
  let max = Math.max(...p);
  if (min === max) max = min + 1;

  ctx.strokeStyle = '#00aa00';
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let i = 0; i < p.length; i++) {
    let x = (i / (p.length - 1)) * c.width;
    let y = c.height - ((p[i] - min) / (max - min)) * c.height;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
}

function pick(s){
  stock = s;
  document.querySelectorAll('.stock-btn').forEach(b => b.classList.toggle('active', b.dataset.symbol === s));
  document.getElementById('chartTitle').textContent = s;
  update();
}

let list = document.getElementById('stocksList');
Object.keys(price).forEach(s => {
  let btn = document.createElement('button');
  btn.className = 'stock-btn';
  btn.dataset.symbol = s;
  btn.textContent = s;
  btn.onclick = () => pick(s);
  list.appendChild(btn);
});

document.querySelector('.stock-btn').classList.add('active');

document.getElementById('buyBtn').onclick = () => {
  let num = parseInt(document.getElementById('shares').value);
  let cost = price[stock] * num;
  if (cash >= cost) {
    cash -= cost;
    myStocks.push({name: stock, amount: num, cost: price[stock]});
    update();
  }
};

document.getElementById('sellBtn').onclick = () => {
  if (myStocks.length > 0) {
    let s = myStocks.pop();
    cash += s.amount * price[s.name];
    update();
  }
};

setInterval(update, 600);
update();
