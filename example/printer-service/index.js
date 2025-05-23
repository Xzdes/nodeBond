const { register } = require("nodebond");

register({
  id: "printer",
  exports: {
    print: (text) => {
      console.log("[printer] 📄 Печатаю:", text);
      return "печать завершена";
    }
  },
  onReady() {
    console.log("[printer] Готов к печати");
  }
});
