// index.js (Node.js Server-side)
const WebSocket = require('ws')
const wss = new WebSocket.WebSocketServer({ port: 8080 });
const clients = new Set();

function broadcastUpdate(data) {
  for (let client of clients) {
      if (client.readyState === WebSocket.OPEN) {
          client.send(data);
      }
  }
}

const stocks = {
  'AAPL': { price: 150.00 },
  'GOOGL': { price: 100.00 },
  'MSFT': { price: 200.00 },
  'TSLA': { price: 180.00 },
  'NVDA': { price: 180.00 },
  'META': { price: 370.00 },
  'AMZN': { price: 130.00 }
};

// Periodically update stocks and broadcast them
setInterval(() => {
  // Chat GPT did the math for this function
  for (let stock in stocks) {
      const changePercent = 0.05 * (Math.random() - 0.5); // Simulate stock price change
      stocks[stock].price *= (1 + changePercent);
      stocks[stock].price = Math.round(stocks[stock].price * 100) / 100;
  }
  broadcastUpdate(JSON.stringify({ type: 'stock_data', stocks: stocks }));
}, 2000);

wss.on('connection', function connection(ws) {
  clients.add(ws);

  ws.send(JSON.stringify({ type: 'stock_data', stocks: stocks }));

  ws.on('message', function incoming(message) {
      const data = JSON.parse(message);
      if (data.type === 'action' && (data.action === 'buy' || data.action === 'sell')) {
          const notification = JSON.stringify({
              type: 'notification',
              action: data.action,
              symbol: data.symbol,
              user: data.user || 'Anonymous'
          });
          broadcastUpdate(notification);
      }
  });

  ws.on('close', () => {
      clients.delete(ws);
  });

  ws.on('error', console.error);
});