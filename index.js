require('dotenv').config();
const fs = require('fs');
const { Telegraf, Markup } = require('telegraf');

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);
let botRunning = false;

bot.start((ctx) => {
  ctx.reply('Welcome to Polygon Arbitrage Bot!', Markup.keyboard([
    ['✅ Start Bot', '⛔ Stop Bot'],
    ['💸 Withdraw']
  ]).resize());
});

bot.hears('✅ Start Bot', (ctx) => {
  if (botRunning) return ctx.reply('Bot is already running.');
  botRunning = true;
  ctx.reply('✅ Bot started. Scanning every 0.5s...');
  runBotLoop(ctx);
});

bot.hears('⛔ Stop Bot', (ctx) => {
  if (!botRunning) return ctx.reply('Bot is already stopped.');
  botRunning = false;
  ctx.reply('⛔ Bot stopped.');
});

bot.hears('💸 Withdraw', (ctx) => {
  ctx.reply('💸 Withdraw simulated. Sending profits to wallet...');
});

function runBotLoop(ctx) {
  if (!botRunning) return;
  const timestamp = new Date().toISOString();
  const logEntry = `✅ [${timestamp}]
Route: WMATIC → WETH → USDC
DEXs: QuickSwap → Uniswap
Profit: 0.000034 USDC
Gas Used: 57000
Tx Hash: 0xabc123...
-----------------------------\n`;

  fs.appendFileSync('profit-log.txt', logEntry);
  ctx.telegram.sendMessage(ctx.chat.id, '✅ Trade Executed! Logged to profit-log.txt');
  setTimeout(() => runBotLoop(ctx), parseFloat(process.env.TRADE_INTERVAL) * 1000);
}

bot.launch();
console.log("🤖 Bot with profit logging is running.");