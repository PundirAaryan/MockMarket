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
        li.textContent = `${stock.symbol}: ₹${stock.price.toFixed(2)}`;
        stockList.appendChild(li);
    });
}

function updateStockPrices() {
    stocks.forEach(stock => {
        const randomChange = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 100);
        stock.price = Math.max(stock.price + randomChange, 0);
        stock.priceHistory.push(stock.price);
        if (stock.priceHistory.length > 60) {
            stock.priceHistory.shift();
        }
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
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: false
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
    chartSelector.innerHTML = ''; // Clear existing options
    stocks.forEach(stock => {
        const option = document.createElement('option');
        option.value = stock.symbol;
        option.textContent = stock.symbol;
        chartSelector.appendChild(option);
    });
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
            recordProfitLoss(stock.symbol, stock.purchasePrice, sellShares, stockPrice);
            
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

function recordProfitLoss(symbol, purchasePrice, shares, salePrice) {
    const totalCost = purchasePrice * shares;
    const totalSale = salePrice * shares;
    const profitLoss = totalSale - totalCost;
    const li = document.createElement('li');
    li.textContent = `${shares} shares of ${symbol}: ${profitLoss >= 0 ? 'Profit' : 'Loss'} of ₹${Math.abs(profitLoss).toFixed(2)}`;
    profitLossList.appendChild(li);
}

function updateBalance() {
    balanceElement.textContent = `Balance: ₹${balance.toFixed(2)}`;
    document.getElementById('profile-balance').textContent = balance.toFixed(2);
}

function addStockToMyStocks(symbol, shares, purchasePrice) {
    const existingStock = myStocks.find(s => s.symbol === symbol);
    if (existingStock) {
        existingStock.shares += shares;
    } else {
        myStocks.push({ symbol: symbol, shares: shares, purchasePrice: purchasePrice });
    }
    displayMyStocks();
}

function displayMyStocks() {
    myStockList.innerHTML = '';
    myStocks.forEach(stock => {
        const li = document.createElement('li');
        li.textContent = `${stock.symbol}: ${stock.shares.toFixed(2)} shares`;
        myStockList.appendChild(li);
    });
}

displayStocks();
updateBalance();
populateChartSelector(); // Populate the chart selector
createChart();

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

setInterval(() => {
    updateStockPrices();
    displayStocks();
}, 1000);
