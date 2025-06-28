require('dotenv').config();
const fs = require('fs');
const { Telegraf, Markup } = require('telegraf');

// Load bot token from environment
const bot = new Telegraf(process.env.TELEGRAM_TOKEN);

// Token list for Polygon arbitrage
const TOKENS = [
  'WMATIC', 'WETH', 'WBTC', 'LINK', 'AAVE',
  'UNI', 'CRV', 'MAV', 'MIDCAP1', 'MIDCAP2'
];

// Major Polygon DEXs
const DEXs = [
  'QuickSwap', 'Uniswap', 'SushiSwap', 'Balancer',
  'DODO', 'KyberSwap', 'Curve', 'Beethoven X', 'Meshswap', 'Aave'
];

let botRunning = false;

// Telegram command buttons
bot.start((ctx) => {
  ctx.reply('📡 Welcome to Polygon Arbitrage Bot!', Markup.keyboard([
    ['✅ Start Bot', '⛔ Stop Bot'],
    ['💸 Withdraw']
  ]).resize());
});

// Start trading loop
bot.hears('✅ Start Bot', (ctx) => {
  if (botRunning) return ctx.reply('Bot is already running.');
  botRunning = true;
  ctx.reply('✅ Bot started. Scanning every 0.5s...');
  runArbitrageLoop(ctx);
});

// Stop loop
bot.hears('⛔ Stop Bot', (ctx) => {
  if (!botRunning) return ctx.reply('Bot already stopped.');
  botRunning = false;
  ctx.reply('⛔ Bot stopped.');
});

// Manual withdraw (mock)
bot.hears('💸 Withdraw', (ctx) => {
  ctx.reply('💸 Manual USDC Withdraw simulated to 0xEb213dBEB7160aa98CfE738449007e00ffc74BAB');
});

// Simulate one arbitrage opportunity
function simulateArbitrage() {
  const token = TOKENS[Math.floor(Math.random() * TOKENS.length)];
  const dexIn = DEXs[Math.floor(Math.random() * DEXs.length)];
  let dexOut;
  do {
    dexOut = DEXs[Math.floor(Math.random() * DEXs.length)];
  } while (dexOut === dexIn);

  const profit = (Math.random() * 0.01).toFixed(6);
  return {
    token,
    dexIn,
    dexOut,
    profit,
    timestamp: new Date().toISOString(),
    txHash: '0x' + Math.random().toString(16).substring(2, 10) + 'abc123'
  };
}

// Main loop
function runArbitrageLoop(ctx) {
  if (!botRunning) return;

  const result = simulateArbitrage();

  const log = `✅ [${result.timestamp}]
Token: ${result.token}
Route: ${result.token} → USDC
DEXs: ${result.dexIn} → ${result.dexOut}
Profit: ${result.profit} USDC
Tx Hash: ${result.txHash}
Withdrawn to: 0xEb213dBEB7160aa98CfE738449007e00ffc74BAB
-----------------------------\n`;

  // Save log locally
  fs.appendFileSync('profit-log.txt', log);

  // Send to Telegram
  const msg = `💹 *Arbitrage Trade Executed*\n\n*Token:* ${result.token}\n*DEX In:* ${result.dexIn}\n*DEX Out:* ${result.dexOut}\n*Profit:* ${result.profit} USDC\n*Withdrawn:* \`0xEb213dBEB7160aa98CfE738449007e00ffc74BAB\`\n*Tx Hash:* \`${result.txHash}\``;

  ctx.telegram.sendMessage(process.env.CHAT_ID, msg, { parse_mode: 'Markdown' });

  // Loop again after 0.5s
  setTimeout(() => runArbitrageLoop(ctx), parseFloat(process.env.TRADE_INTERVAL) * 1000);
}

bot.launch();
console.log("🤖 Arbitrage bot with all major Polygon DEXs is running.");
