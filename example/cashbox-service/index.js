const { register, call } = require("nodebond");

/**
 * Проверяет доступность сервиса через ping
 * @param {string} service - ID сервиса
 * @param {number} delay - задержка между попытками
 * @param {number} maxAttempts - максимальное количество попыток
 */
async function waitUntilServiceAvailable(service, delay = 500, maxAttempts = 20) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      console.log(`[cashbox] Проверка: ${service}.ping`);
      const pong = await call(`${service}.ping`);
      if (pong === "pong") {
        console.log(`[cashbox] ${service} доступен`);
        return true;
      }
    } catch (e) {
      console.log(`[cashbox] ${service} не отвечает (попытка ${i + 1})`);
    }
    await new Promise((res) => setTimeout(res, delay));
  }
  throw new Error(`Сервис '${service}' не отвечает`);
}

register({
  id: "cashbox",
  exports: {
    ping: () => "pong"
  },
  onReady: async () => {
    console.log("[cashbox] Касса запущена");

    // Ждём доступности сервисов
    await waitUntilServiceAvailable("db");
    await waitUntilServiceAvailable("printer");

    // Получаем данные клиента из БД
    const client = await call("db.getClientById", 42);
    console.log("[cashbox] Получен клиент:", client);

    // Печатаем чек
    const result = await call("printer.print", client);
    console.log("[cashbox] Ответ от принтера:", result);
  }
});
