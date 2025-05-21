// examples/appB.js

const bond = require('../index').dual('appB', 'appA');

bond.on('data', (msg) => {
  console.log('[AppB] получил:', msg);
});

setInterval(() => {
  bond.send({ from: 'AppB', msg: 'Привет AppA!' });
}, 5000);
