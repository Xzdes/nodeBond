// examples/appA.js

const bond = require('../index').dual('appA', 'appB');

bond.on('data', (msg) => {
  console.log('[AppA] получил:', msg);
});

setInterval(() => {
  bond.send({ from: 'AppA', msg: 'Привет AppB!' });
}, 3000);
