// benchmark.js

const os = require('os');
const process = require('process');
const { dual } = require('./index');

const local = process.argv[2] || 'benchA';
const remote = process.argv[3] || 'benchB';

const bond = dual(local, remote);

let count = 0;
let lastMemory = 0;
let lastCpu = process.cpuUsage();

bond.on('data', (msg) => {
  count++;
});

// каждые 100мс отправляем сообщение
setInterval(() => {
  bond.send({ from: local, time: Date.now(), text: 'ping' });
}, 100);

// вывод каждые 2 секунды
setInterval(() => {
  const memory = process.memoryUsage().rss / 1024 / 1024;
  const cpu = process.cpuUsage(lastCpu);
  const cpuPercent = ((cpu.user + cpu.system) / 10000 / 2).toFixed(2);

  lastCpu = process.cpuUsage();
  const time = new Date().toLocaleTimeString();

  console.log(`[${time}] 📊 ping count: ${count}, 🧠 RAM: ${memory.toFixed(2)} MB, ⚙️ CPU: ${cpuPercent}%`);
}, 2000);

// завершение
process.on('SIGINT', () => {
  console.log(`\n[STOP] Получено сообщений: ${count}`);
  bond.close();
  process.exit();
});
