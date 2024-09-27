const stockList = document.getElementById('stock-list');
const myStockList = document.getElementById('my-stock-list');
const balanceElement = document.getElementById('balance');
const profitLossList = document.getElementById('profit-loss-list');
const modeToggle = document.getElementById('modeToggle');
const profileButton = document.querySelector('.profile-button');
const profileModal = document.getElementById('profileModal');
const closeButton = document.querySelector('.close-button');
const chartSelector = document.getElementById('chart-selector');
const ctx = document.getElementById('stock-chart').getContext('2d');

let stocks = [
    { symbol: 'RELIANCE', price: 2500, priceHistory: [] },
    { symbol: 'TCS', price: 3500, priceHistory: [] },
    { symbol: 'INFY', price: 1800, priceHistory: [] },
    { symbol: 'HDFCBANK', price: 1600, priceHistory: [] },
    { symbol: 'ICICIBANK', price: 950, priceHistory: [] },
    { symbol: 'HINDUNILVR', price: 2600, priceHistory: [] },
    { symbol: 'SBIN', price: 600, priceHistory: [] },
    { symbol: 'LT', price: 2200, priceHistory: [] },
    { symbol: 'BAJFINANCE', price: 7000, priceHistory: [] },
    { symbol: 'WIPRO', price: 500, priceHistory: [] }
];

let balance = 100000;
let myStocks = [];
let chart;

function displayStocks() {
    stockList.innerHTML = '';
    stocks.forEach(stock => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${stock.symbol}:</strong> ₹${stock.price.toFixed(2)} <span class="price-change"></span>`;
        stockList.appendChild(li);
    });
}

function updateStockPrices() {
    stocks.forEach((stock, index) => {
        const previousPrice = stock.price;
        const randomChange = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 100);
        stock.price = Math.max(stock.price + randomChange, 0);
        stock.priceHistory.push(stock.price);
        if (stock.priceHistory.length > 60) {
            stock.priceHistory.shift();
        }
        
        const priceChange = stock.price - previousPrice;
        const priceChangePercentage = (priceChange / previousPrice) * 100;
        
        const listItem = stockList.children[index];
        const priceChangeElement = listItem.querySelector('.price-change');
        priceChangeElement.textContent = ` ${priceChange >= 0 ? '▲' : '▼'} ${Math.abs(priceChangePercentage).toFixed(2)}%`;
        priceChangeElement.style.color = priceChange >= 0 ? '#4CAF50' : '#F44336';
    });
    updateChart();
}

function createChart() {
    const selectedStock = stocks.find(s => s.symbol === chartSelector.value);
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: Array(selectedStock.priceHistory.length).fill(''),
            datasets: [{
                label: selectedStock.symbol,
                data: selectedStock.priceHistory,
                borderColor: '#00bcd4',
                backgroundColor: 'rgba(0, 188, 212, 0.1)',
                tension: 0.1,
                fill: true
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: false,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

function updateChart() {
    if (chart) {
        const selectedStock = stocks.find(s => s.symbol === chartSelector.value);
        chart.data.labels = Array(selectedStock.priceHistory.length).fill('');
        chart.data.datasets[0].data = selectedStock.priceHistory;
        chart.update();
    }
}

function populateChartSelector() {
    chartSelector.innerHTML = '';
    stocks.forEach(stock => {
        const option = document.createElement('option');
        option.value = stock.symbol;
        option.textContent = stock.symbol;
        chartSelector.appendChild(option);
    });
}

function updateBalance() {
    balanceElement.textContent = `Balance: ₹${balance.toFixed(2)}`;
    document.getElementById('profile-balance').textContent = balance.toFixed(2);
}

function addStockToMyStocks(symbol, shares, purchasePrice) {
    const existingStock = myStocks.find(s => s.symbol === symbol);
    if (existingStock) {
        existingStock.shares += shares;
        existingStock.averagePrice = (existingStock.averagePrice * existingStock.shares + purchasePrice * shares) / (existingStock.shares + shares);
    } else {
        myStocks.push({ symbol: symbol, shares: shares, averagePrice: purchasePrice });
    }
    displayMyStocks();
}

function displayMyStocks() {
    myStockList.innerHTML = '';
    myStocks.forEach(stock => {
        const currentPrice = stocks.find(s => s.symbol === stock.symbol).price;
        const profitLoss = (currentPrice - stock.averagePrice) * stock.shares;
        const profitLossPercentage = ((currentPrice - stock.averagePrice) / stock.averagePrice) * 100;
        
        const li = document.createElement('li');
        li.innerHTML = `
            <strong>${stock.symbol}:</strong> ${stock.shares.toFixed(2)} shares
            <br>Avg. Price: ₹${stock.averagePrice.toFixed(2)}
            <br>Current Value: ₹${(currentPrice * stock.shares).toFixed(2)}
            <br>P/L: <span style="color: ${profitLoss >= 0 ? '#4CAF50' : '#F44336'}">
                ₹${profitLoss.toFixed(2)} (${profitLossPercentage.toFixed(2)}%)
            </span>
        `;
        myStockList.appendChild(li);
    });
}

function recordProfitLoss(symbol, purchasePrice, shares, salePrice) {
    const totalCost = purchasePrice * shares;
    const totalSale = salePrice * shares;
    const profitLoss = totalSale - totalCost;
    const profitLossPercentage = ((salePrice - purchasePrice) / purchasePrice) * 100;
    
    const li = document.createElement('li');
    li.innerHTML = `
        <strong>${symbol}:</strong> ${shares.toFixed(2)} shares
        <br>Buy: ₹${purchasePrice.toFixed(2)} | Sell: ₹${salePrice.toFixed(2)}
        <br><span style="color: ${profitLoss >= 0 ? '#4CAF50' : '#F44336'}">
            ${profitLoss >= 0 ? 'Profit' : 'Loss'}: ₹${Math.abs(profitLoss).toFixed(2)} (${profitLossPercentage.toFixed(2)}%)
        </span>
    `;
    profitLossList.appendChild(li);
}

chartSelector.addEventListener('change', () => {
    if (chart) {
        chart.destroy();
    }
    createChart();
});

document.getElementById('invest-button').addEventListener('click', () => {
    const investment = prompt("Enter the stock symbol you want to invest in:");
    const amount = parseFloat(prompt("Enter the amount you want to invest:"));

    const stock = stocks.find(s => s.symbol.toUpperCase() === investment.toUpperCase());
    if (stock) {
        const shares = amount / stock.price;
        if (shares > 0 && amount <= balance) {
            balance -= amount;
            updateBalance();
            addStockToMyStocks(stock.symbol, shares, stock.price);
            updateStockPrices();
            displayStocks();
            alert(`You bought ${shares.toFixed(2)} shares of ${stock.symbol} at ₹${stock.price.toFixed(2)} each.`);
        } else {
            alert("Insufficient balance or invalid amount.");
        }
    } else {
        alert("Invalid stock symbol.");
    }
});

document.getElementById('sell-button').addEventListener('click', () => {
    const sellingStock = prompt("Enter the stock symbol you want to sell:");
    const sellShares = parseFloat(prompt("Enter the number of shares you want to sell:"));

    const stock = myStocks.find(s => s.symbol.toUpperCase() === sellingStock.toUpperCase());
    if (stock) {
        if (sellShares > 0 && sellShares <= stock.shares) {
            const stockPrice = stocks.find(s => s.symbol === stock.symbol).price;
            const saleAmount = sellShares * stockPrice;
            balance += saleAmount;
            updateBalance();
            stock.shares -= sellShares;
            recordProfitLoss(stock.symbol, stock.averagePrice, sellShares, stockPrice);
            
            if (stock.shares === 0) {
                myStocks = myStocks.filter(s => s.symbol !== stock.symbol);
            }
            alert(`You sold ${sellShares} shares of ${stock.symbol} at ₹${stockPrice.toFixed(2)} each.`);
            displayMyStocks();
            updateStockPrices();
            displayStocks();
        } else {
            alert("Invalid number of shares to sell.");
        }
    } else {
        alert("You do not own this stock.");
    }
});

modeToggle.addEventListener('click', function() {
    document.body.classList.toggle('light-mode');
    modeToggle.textContent = document.body.classList.contains('light-mode') ? 'Switch to Dark Mode' : 'Switch to Light Mode';
});

profileButton.addEventListener('click', function() {
    profileModal.style.display = 'block';
});

closeButton.addEventListener('click', function() {
    profileModal.style.display = 'none';
});

window.addEventListener('click', function(event) {
    if (event.target === profileModal) {
        profileModal.style.display = 'none';
    }
});

// Initialize the app
displayStocks();
updateBalance();
populateChartSelector();
createChart();

// Update stock prices every second
setInterval(() => {
    updateStockPrices();
    displayStocks();
    displayMyStocks();
}, 1000);
