// benchmark.js

const os = require('os');
const process = require('process');
const { dual } = require('./index');

const local = process.argv[2] || 'benchA';
const remote = process.argv[3] || 'benchB';

const bond = dual(local, remote);

let count = 0;
let lastCpu = process.cpuUsage();

bond.on('data', (msg) => {
  count++;
});

// каждые 100мс отправляем JSON-сообщение
setInterval(() => {
  bond.send({ from: local, time: Date.now(), text: 'ping' });
}, 100);

// каждые 500мс отправляем raw Buffer
setInterval(() => {
  const buffer = Buffer.from('raw-ping-' + Date.now());
  bond.send(buffer);
}, 500);

// вывод каждые 2 секунды
setInterval(() => {
  const memory = process.memoryUsage().rss / 1024 / 1024;
  const cpu = process.cpuUsage(lastCpu);
  const cpuPercent = ((cpu.user + cpu.system) / 10000 / 2).toFixed(2);

  lastCpu = process.cpuUsage();
  const time = new Date().toLocaleTimeString();
  const stats = bond.stats?.() || {};

  console.log(`[${time}] 📊 ping count: ${count}, 🧠 RAM: ${memory.toFixed(2)} MB, ⚙️ CPU: ${cpuPercent}%`);
  console.log(`        📤 sent: ${stats.messagesSent}, 📥 received: ${stats.messagesReceived}, ⏱ uptime: ${Math.round(stats.uptimeMs / 1000)}s`);
}, 2000);

// завершение
process.on('SIGINT', () => {
  console.log(`\n[STOP] Получено сообщений: ${count}`);
  console.log('[STATS]', bond.stats?.());
  bond.close();
  process.exit();
});
