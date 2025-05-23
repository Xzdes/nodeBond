const { register } = require("nodebond");

register({
  id: "printer",
  exports: {
    print: (data) => {
      console.log("[printer] 📄 Печатаю чек:");
      console.log("------");
      console.log("Клиент:", data.name);
      console.log("Бонусов:", data.bonus);
      console.log("------");
      return "печать завершена";
    },
    ping: () => "pong"
  },
  onReady() {
    console.log("[printer] Готов к печати");
  }
});
