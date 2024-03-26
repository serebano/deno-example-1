// deno-lint-ignore-file require-await
import { ServerIncomingStream, ServerOutgoingStream } from "./src/server.ts";
import { defineHandler, serveStatic } from "./src/server.utils.ts";
import { logHandler } from "./src/shared.logger.ts";

const serverOutgoingStreamHandler = defineHandler(
  async function serverOutgoingStreamHandler(req) {
    const api = new ServerOutgoingStream(req);
    let timerId: number;

    api.addEventListener("close", (event) => {
      logHandler(event);
      clearInterval(timerId);
      ServerOutgoingStream.write("data: the " + api.id + " was gone\n\n");
    });

    api.addEventListener("open", (event) => {
      logHandler(event);
      timerId = setTimeout(() => {
        api.write("data: " + Date.now() + "\n\n");
      }, 1000);
      ServerOutgoingStream.write("data: hello, i'm the " + api.id + "\n\n");
    });

    return api.response;
  },
);

const serverIncomingStreamHandler = defineHandler(
  async function serverIncomingStreamHandler(req) {
    const api = new ServerIncomingStream(req);

    api.on("any", logHandler);

    return api.response;
  },
);

Deno.serve(
  {
    key: Deno.env.get("HTTPS_KEY"),
    cert: Deno.env.get("HTTPS_CERT"),
    port: Number(Deno.env.get("PORT")) || 8000,
    hostname: Deno.env.get("HOSTNAME") || "localhost",

    async onListen({ port, hostname }) {
      const url = `https://${hostname}:${port}/`;
      console.log("\n\tListening @", url, "\n");
    },
    onError(error) {
      console.log("error", error);
      return new Response(String(error), { status: 400 });
    },
  },
  async (request, info) => {
    const response = await serveStatic(request);
    if (response instanceof Response) {
      return response;
    }

    switch (request.method) {
      case "GET":
        return await serverOutgoingStreamHandler(request, info);
      case "POST":
        return await serverIncomingStreamHandler(request, info);
      case "OPTIONS":
        return new Response(null, {
          status: 200,
          headers: {
            "access-control-allow-origin": "*",
            "access-control-allow-methods": "*",
            "access-control-allow-headers": "*",
            "access-control-max-age": "100",
          },
        });
      default: {
        return new Response("Bad Request " + request.method, {
          status: 400,
        });
      }
    }
  },
);
