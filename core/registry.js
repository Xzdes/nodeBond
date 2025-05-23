// core/registry.js
const services = {};

function register(id, api) {
  services[id] = { id, api };
}

function unregister(id) {
  delete services[id];
}

function getAll() {
  return { ...services };
}

module.exports = {
  register,
  unregister,
  getAll,
};
