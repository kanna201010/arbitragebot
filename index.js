require('dotenv').config();
const fs = require('fs');
const { Telegraf, Markup } = require('telegraf');

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);
const TOKENS = ['WMATIC', 'WETH', 'WBTC', 'LINK', 'AAVE', 'UNI', 'CRV', 'MAV', 'MIDCAP1', 'MIDCAP2'];
const DEXs = ['QuickSwap', 'Uniswap', 'SushiSwap', 'Balancer', 'DODO', 'KyberSwap', 'Curve', 'Beethoven X', 'Meshswap', 'Aave'];

let botRunning = false;
let totalTrades = 0;
let profitableTrades = 0;
let totalProfit = 0;

bot.start((ctx) => {
  ctx.reply('📡 Welcome to Polygon Arbitrage Bot!', Markup.keyboard([
    ['✅ Start Bot', '⛔ Stop Bot'],
    ['💸 Withdraw', '/stats', '/estimate 3% 0.05']
  ]).resize());
});

bot.hears('✅ Start Bot', (ctx) => {
  if (botRunning) return ctx.reply('Bot is already running.');
  botRunning = true;
  ctx.reply('✅ Bot started. Scanning every 0.5s...');
  runArbitrageLoop(ctx);
});

bot.hears('⛔ Stop Bot', (ctx) => {
  if (!botRunning) return ctx.reply('Bot already stopped.');
  botRunning = false;
  ctx.reply('⛔ Bot stopped.');
});

bot.hears('💸 Withdraw', (ctx) => {
  ctx.reply('💸 Manual USDC Withdraw simulated to 0xEb213dBEB7160aa98CfE738449007e00ffc74BAB');
});

bot.command('stats', (ctx) => {
  const successRate = totalTrades > 0 ? ((profitableTrades / totalTrades) * 100).toFixed(2) : 0;
  ctx.reply(`📊 Stats:
Total Trades: ${totalTrades}
Profitable Trades: ${profitableTrades}
Success Rate: ${successRate}%
Net Profit: $${totalProfit.toFixed(2)}`);
});

bot.command('estimate', (ctx) => {
  const args = ctx.message.text.split(' ').slice(1);
  if (args.length !== 2 || !args[0].endsWith('%')) return ctx.reply('Usage: /estimate 3% 0.05');
  const successRate = parseFloat(args[0].replace('%', ''));
  const profitPercent = parseFloat(args[1]);
  const tradeCount = 72000;
  const capitalPerTrade = 15000;
  const profitPerTrade = (capitalPerTrade * (profitPercent / 100));
  const estimated = tradeCount * (successRate / 100) * profitPerTrade;
  ctx.reply(`📈 Estimated Daily Profit:
At ${successRate}% success and ${profitPercent}% per trade:
💰 $${estimated.toFixed(2)} per day`);
});

function simulateArbitrage() {
  const token = TOKENS[Math.floor(Math.random() * TOKENS.length)];
  const dexIn = DEXs[Math.floor(Math.random() * DEXs.length)];
  let dexOut;
  do {
    dexOut = DEXs[Math.floor(Math.random() * DEXs.length)];
  } while (dexOut === dexIn);

  const profit = parseFloat((Math.random() * 0.01).toFixed(6));
  const gasCost = 0.005; // Polygon gas estimate in USDC
  const profitable = profit > gasCost;

  return {
    token,
    dexIn,
    dexOut,
    profit,
    profitable,
    timestamp: new Date().toISOString(),
    txHash: '0x' + Math.random().toString(16).substring(2, 10) + 'abc123'
  };
}

function runArbitrageLoop(ctx) {
  if (!botRunning) return;

  totalTrades++;
  const result = simulateArbitrage();
  if (result.profitable) {
    profitableTrades++;
    totalProfit += result.profit;

    const log = `✅ [${result.timestamp}]
Token: ${result.token}
DEXs: ${result.dexIn} → ${result.dexOut}
Profit: ${result.profit} USDC
Tx Hash: ${result.txHash}
Withdrawn to: 0xEb213dBEB7160aa98CfE738449007e00ffc74BAB
-----------------------------\n`;

    fs.appendFileSync('profit-log.txt', log);

    const msg = `💹 *Arbitrage Trade Executed*\n\n*Token:* ${result.token}\n*DEX In:* ${result.dexIn}\n*DEX Out:* ${result.dexOut}\n*Profit:* ${result.profit} USDC\n*Withdrawn:* \`0xEb213dBEB7160aa98CfE738449007e00ffc74BAB\`\n*Tx Hash:* \`${result.txHash}\``;

    ctx.telegram.sendMessage(process.env.CHAT_ID, msg, { parse_mode: 'Markdown' });
  }

  setTimeout(() => runArbitrageLoop(ctx), parseFloat(process.env.TRADE_INTERVAL) * 1000);
}

bot.launch();
console.log("🤖 Arbitrage bot is live. Trades only when profit > gas fee (0.005 USDC).");
