// deno-lint-ignore-file require-await
import { ClientIncomingStream, ClientOutgoingStream } from "../client.ts";
import { logHandler } from "../shared.logger.ts";

export async function initIncoming(url: string) {
  const api = new ClientIncomingStream(url);

  api.on("open", logHandler);
  api.on("close", logHandler);
  api.on("error", logHandler);
  api.on("data", logHandler);

  api.read();

  Object.assign(self, { incomingApi: api });

  return api;
}

export async function initOutgoing(url: string) {
  const api = new ClientOutgoingStream(url);

  api.on("open", logHandler);
  api.on("close", logHandler);
  api.on("error", logHandler);
  api.on("end", logHandler);
  // api.on("write", logHandler);

  let id;
  api.on("open", () => {
    id = setInterval(() => api.write(`Date.now() = ${Date.now()}`), 1000);
  });
  api.on("close", () => clearInterval(id));

  await api.ready;
  await api.write("Hello from " + api.name + " id=" + api.id);

  // const response = await fetch("https://localhost:8000/play/example/main.ts");

  // response.body.pipeThrough(new TextDecoderStream()).pipeTo(api.writable);

  // setTimeout(() => api.close(), 3000);

  Object.assign(self, { outgoingApi: api });
}

Object.assign(self, { initOutgoing, initIncoming });

const init = (url: string) =>
  Promise.all([initOutgoing(url), initIncoming(url)]);

init(document.location.href + "xxx");
