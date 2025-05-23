const { register } = require("nodebond");

register({
  id: "db",
  exports: {
    ping: () => {
      console.log("[db] ping получен");
      return "pong";
    },
    getClientById: (id) => {
      console.log("[db] Вызов getClientById:", id);
      return { id, name: "Иван Иванов", bonus: 120 };
    }
  },
  onReady() {
    console.log("[db] Готов к работе");
  }
});
