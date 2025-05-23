// index.js

const { register } = require("./runtime/register");
const { call } = require("./runtime/call");
const { set, get, watch } = require("./core/store");
const { startHub } = require("./core/hub");

module.exports = {
  register,
  call,
  set,
  get,
  watch,
  startHub,
};
