// protocol.js

const HEADER_SIZE = 4; // первые 4 байта = длина полезной нагрузки

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

function decodeMessage(buffer) {
  if (buffer.length < HEADER_SIZE) return null;

  const length = buffer.readUInt32BE(0);
  if (buffer.length < HEADER_SIZE + length) return null;

  const body = buffer.slice(HEADER_SIZE, HEADER_SIZE + length);

  try {
    return {
      message: JSON.parse(body.toString()),
      rest: buffer.slice(HEADER_SIZE + length),
    };
  } catch (e) {
    return {
      message: body, // возможно это raw buffer
      rest: buffer.slice(HEADER_SIZE + length),
    };
  }
}

module.exports = {
  encodeMessage,
  decodeMessage,
  HEADER_SIZE,
};
