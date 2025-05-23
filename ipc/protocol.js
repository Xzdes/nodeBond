// ipc/protocol.js

const HEADER_SIZE = 4; // первые 4 байта — длина полезной нагрузки

/**
 * Кодирует сообщение в формат: [4 байта длины][тело]
 * @param {object|Buffer} obj
 * @returns {Buffer}
 */
function encodeMessage(obj) {
  let payload;

  if (Buffer.isBuffer(obj)) {
    payload = obj;
  } else {
    const json = JSON.stringify(obj);
    payload = Buffer.from(json, 'utf8');
  }

  const length = Buffer.alloc(HEADER_SIZE);
  length.writeUInt32BE(payload.length);

  return Buffer.concat([length, payload]);
}

/**
 * Декодирует входной буфер в сообщение
 * @param {Buffer} buffer
 * @returns {object|null}
 */
function decodeMessage(buffer) {
  if (buffer.length < HEADER_SIZE) return null;

  const length = buffer.readUInt32BE(0);
  if (buffer.length < HEADER_SIZE + length) return null;

  const body = buffer.slice(HEADER_SIZE, HEADER_SIZE + length);

  try {
    const parsed = JSON.parse(body.toString());
    return {
      message: parsed,
      rest: buffer.slice(HEADER_SIZE + length),
    };
  } catch (e) {
    // Вернуть как Buffer, если не JSON
    return {
      message: body,
      rest: buffer.slice(HEADER_SIZE + length),
    };
  }
}

module.exports = {
  encodeMessage,
  decodeMessage,
  HEADER_SIZE,
};
