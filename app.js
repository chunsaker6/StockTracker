const ws = new WebSocket('ws://localhost:8080');
//const ws = new WebSocket('https://s24-websocket-chunsaker6.onrender.com/'); // Replace 'your-render-url.com' with your actual Render URL

ws.onopen = function(event) {
    console.log('Connected to WebSocket server.');
    document.getElementById('connection-status').innerText = 'Connected to Stock Market WebSocket Server';
};

ws.onerror = function(event) {
    console.error('WebSocket error:', event);
};

ws.onmessage = function(event) {
    const data = JSON.parse(event.data);
    if (data.type === 'notification') {
        displayNotification(data);
    } else if (data.type === 'stock_data') {
        const formattedData = formatStockData(data.stocks);
        document.getElementById('stocks').innerHTML = formattedData;
    } else {
        console.log('Received:', data);
    }
};

ws.onclose = function(event) {
    console.log('WebSocket is closed now.');
};

function formatStockData(data) {
    let formatted = '';
    const stockLogos = {
        'AAPL': 'https://logo.clearbit.com/apple.com',
        'GOOGL': 'https://logo.clearbit.com/google.com',
        'MSFT': 'https://logo.clearbit.com/microsoft.com',
        'TSLA': 'https://logo.clearbit.com/tesla.com',
        'NVDA': 'https://logo.clearbit.com/nvidia.com',
        'META': 'https://logo.clearbit.com/meta.com',
        'AMZN': 'https://logo.clearbit.com/amazon.com'
    };
    for (let symbol in data) {
        const price = data[symbol].price.toFixed(2);
        const logoUrl = stockLogos[symbol];
        formatted += `<div class="stock-item">
            <img class="stock-logo" src="${logoUrl}" alt="${symbol} Logo">
            <div>
                <strong>${symbol}</strong> - $${price}
            </div>
            <button class="buy-button" onclick="buyStock('${symbol}')">Buy</button>
            <button class="sell-button" onclick="sellStock('${symbol}')">Sell</button>
        </div>`;
    }
    return formatted;
}
function displayUserName(data){
    const welcomeUser = document.getElementById('welcomeUser');
    const message = `${data}`;
    welcomeUser.innerHTML += `<h1>Welcome ${message}</h1>`;
}
function displayNotification(data) {
    const notificationArea = document.getElementById('notification-area');
    let act;
    if (data.action === 'buy'){
        act = 'bought';
    }
    else{
        act = 'sold';
    }
    const message = `${data.user} ${act} ${data.symbol}`;
    notificationArea.innerHTML += `<p>${message}</p>`;
}
let userName = 'user';
function updateUserName() {
    const nameInput = document.getElementById('username');
    userName = nameInput.value.trim();
    console.log('User name set to:', userName);
    displayUserName(userName);
    nameInput.value = '';
}

function buyStock(symbol) {
    ws.send(JSON.stringify({ type: 'action', action: 'buy', symbol: symbol, user: userName }));
}

function sellStock(symbol) {
    ws.send(JSON.stringify({ type: 'action', action: 'sell', symbol: symbol, user: userName }));
}