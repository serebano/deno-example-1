// deno-lint-ignore-file require-await
import { IncomingStream, IOStream, OutgoingStream } from "../src/client.ts";
import { logHandler } from "../src/shared.ts";

const { io } = Object.assign(globalThis, {
  IOStream,
  IncomingStream,
  OutgoingStream,
  io: { ver: 0 },
});

export async function initIncoming(url: string) {
  const api = new IncomingStream(url);

  api.on("any", logHandler);

  api.read();

  Object.assign(io, { i: api });

  return api;
}

export async function initOutgoing(url: string) {
  const api = new OutgoingStream(url);

  api.on("any", logHandler);

  let id: number;

  api.on("open", () => {
    id = setTimeout(() => api.write(`Date.now() = ${Date.now()}`), 3000);
  });

  api.on("close", () => {
    clearInterval(id);
  });

  await api.write("Hello from " + api.name + " id=" + api.id);

  // const response = await fetch("https://localhost:8000/play/example/main.ts");
  // response.body.pipeThrough(new TextDecoderStream()).pipeTo(api.writable);
  // setTimeout(() => api.close(), 3000);

  Object.assign(io, { o: api });
}

Object.assign(self, { initOutgoing, initIncoming });

const init = (url: string) =>
  Promise.all([initOutgoing(url), initIncoming(url)]);

init("/testio");
