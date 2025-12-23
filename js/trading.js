let prices = {
  AAPL: 150,
  MSFT: 380,
  GOOGL: 140,
  TSLA: 250,
  NDAQ: 23500
};

let history = {
  AAPL: [150],
  MSFT: [380],
  GOOGL: [140],
  TSLA: [250],
  NDAQ: [23500]
};

let money = 100000;
let buys = [];
let now = 'AAPL';

function update(){
  prices[now] = prices[now] + (Math.random() - 0.5) * 2;
  history[now].push(prices[now]);
  if (history[now].length > 50) {
    history[now].shift();
  }

  let total = money;
  for (let i = 0; i < buys.length; i++) {
    total = total + buys[i].shares * prices[buys[i].stock];
  }

  document.getElementById('chartPrice').textContent = '$' + prices[now].toFixed(2);
  let change = ((prices[now] - history[now][0]) / history[now][0] * 100).toFixed(2);
  let changeBox = document.getElementById('priceChange');
  changeBox.textContent = change + '%';
  changeBox.className = change < 0 ? 'price-change negative' : 'price-change';
  document.getElementById('headerBalance').textContent = '$' + total.toFixed(2);

  let list = document.getElementById('positionsList');
  if (buys.length === 0) {
    list.innerHTML = '<p class="empty-msg">No positions</p>';
  } else {
    list.innerHTML = buys.map((pos, i) => `
      <div class="position-item">
        <div class="position-info">
          <div class="position-symbol">${pos.stock}×${pos.shares}</div>
          <div class="position-details">$${pos.price.toFixed(2)}→$${prices[pos.stock].toFixed(2)}</div>
        </div>
        <div class="position-pnl ${(prices[pos.stock] - pos.price) * pos.shares >= 0 ? 'positive' : 'negative'}">${((prices[pos.stock] - pos.price) * pos.shares).toFixed(0)}</div>
        <button class="close-btn" onclick="money += buys[${i}].shares * prices[buys[${i}].stock]; buys.splice(${i}, 1); update()">X</button>
      </div>`).join('');
  }

  drawLine();
}

function drawLine(){
  let canvas = document.getElementById('chart');
  let ctx = canvas.getContext('2d');
  let points = history[now];

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (points.length < 2) return;

  let low = Math.min(...points);
  let high = Math.max(...points);
  if (low === high) high = low + 1;

  let stepX = canvas.width / (points.length - 1);

  ctx.beginPath();
  for (let i = 0; i < points.length; i++) {
    let x = i * stepX;
    let y = canvas.height - ((points[i] - low) / (high - low)) * canvas.height;
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.strokeStyle = '#2e7d32';
  ctx.lineWidth = 2;
  ctx.stroke();
}

function choose(stock){
  now = stock;
  let buttons = document.querySelectorAll('.stock-btn');
  for (let i = 0; i < buttons.length; i++) {
    buttons[i].classList.toggle('active', buttons[i].dataset.symbol === stock);
  }
  document.getElementById('chartTitle').textContent = stock;
  update();
}

document.querySelectorAll('.stock-btn').forEach(b => b.onclick = () => choose(b.dataset.symbol));
document.querySelector('.stock-btn').classList.add('active');

document.getElementById('buyBtn').onclick = () => {
  let shares = parseInt(document.getElementById('shares').value);
  let cost = prices[now] * shares;
  if (money >= cost) {
    money = money - cost;
    buys.push({ stock: now, shares: shares, price: prices[now] });
    update();
  }
};

document.getElementById('sellBtn').onclick = () => {
  if (buys.length > 0) {
    let last = buys.pop();
    money = money + last.shares * prices[last.stock];
    update();
  }
};

setInterval(update, 600);
update();
