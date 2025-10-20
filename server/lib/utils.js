import net from "net";

export const ML_HOST = process.env.ML_HOST || "127.0.0.1";
export const ML_PORT = Number(process.env.ML_PORT) || 8000;
export const ML_ALLOW_FALLBACK = process.env.ML_ALLOW_FALLBACK !== "false";
export const ML_WARN_COOLDOWN_MS =
  Number(process.env.ML_WARN_COOLDOWN_MS) || 60_000;
let _lastMlWarn = 0;

export function mlWarn(message) {
  try {
    const now = Date.now();
    if (now - _lastMlWarn > ML_WARN_COOLDOWN_MS) {
      console.warn(message);
      _lastMlWarn = now;
    }
  } catch (e) {
    console.warn(message);
  }
}

export const isPortOpen = (host, port, timeout = 500) => {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let done = false;
    socket.setTimeout(timeout);
    socket.on("connect", () => {
      done = true;
      socket.destroy();
      resolve(true);
    });
    socket.on("timeout", () => {
      if (!done) {
        done = true;
        socket.destroy();
        resolve(false);
      }
    });
    socket.on("error", () => {
      if (!done) {
        done = true;
        socket.destroy();
        resolve(false);
      }
    });
    socket.connect(port, host);
  });
};
