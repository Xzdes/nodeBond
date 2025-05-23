const { register } = require("nodebond");

register({
  id: "db",
  exports: {
    getClientById: (id) => {
      console.log("[db] Вызов getClientById:", id);
      return { id, name: "Иван Иванов", bonus: 120 };
    },
   ping: () => {
  console.log("[db] ping получен");
  return "pong";
}
  },
  onReady() {
    console.log("[db] Готов к работе");
  }
});
