#!/usr/bin/env node

const { dual } = require('../index');

const args = process.argv.slice(2);
const command = args[0];

function printHelp() {
  console.log(`
Usage:
  nodebond send <target> <json>         Send JSON message to target
  nodebond send <target> --text "msg"   Send plain text as message
  nodebond inspect <name>               Listen and print all messages
  nodebond echo <name>                  Echo all received messages back

Examples:
  nodebond send appA '{"msg":"hello"}'
  nodebond send appA --text "Ping"
  nodebond inspect appB
  nodebond echo appA
  `);
}

if (!command || command === '--help' || command === '-h') {
  printHelp();
  process.exit(0);
}

if (command === 'send') {
  const target = args[1];
  if (!target) return printHelp();

  let data;
  if (args[2] === '--text') {
    data = { text: args[3] };
  } else {
    try {
      data = JSON.parse(args[2]);
    } catch (e) {
      console.error('[ERROR] Invalid JSON or text not provided.');
      return printHelp();
    }
  }

  const bond = dual('cli-tool', target);

  bond.once('connect', () => {
    bond.send(data);
    setTimeout(() => bond.close(), 500);
  });

  bond.once('error', (err) => {
    console.error('[ERROR]', err.message);
    process.exit(1);
  });
}

else if (command === 'inspect') {
  const name = args[1];
  if (!name) return printHelp();

  const bond = dual(name, 'dummy');

  console.log(`[Inspecting] Waiting for messages on '${name}'...`);
  bond.on('data', (msg) => {
    console.log('[RECEIVED]', msg);
  });
}

else if (command === 'echo') {
  const name = args[1];
  if (!name) return printHelp();

  const bond = dual(name, 'dummy');

  console.log(`[Echo] Listening on '${name}'...`);
  bond.on('data', (msg) => {
    console.log('[ECHOING]', msg);
    bond.send(msg);
  });
}

else {
  console.error('[ERROR] Unknown command:', command);
  printHelp();
}
