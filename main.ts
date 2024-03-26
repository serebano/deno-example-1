import { ServerOutgoingStream } from "@io/server.ts";
import { logHandler } from "@io/shared.logger.ts";

Deno.serve((req) => {
  const api = new ServerOutgoingStream(req);

  api.on("any", logHandler);

  let id: number;

  api.addEventListener("open", () => {
    id = setInterval(() => api.write("hello\n"), 1000);
  });

  api.addEventListener("close", () => {
    clearInterval(id);
  });

  return api.response;
});
