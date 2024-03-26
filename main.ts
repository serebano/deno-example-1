// deno-lint-ignore-file require-await
import { cert, key } from "./cert/index.ts";
import { ServerIncomingStream, ServerOutgoingStream } from "@io/server.ts";
import { defineHandler, serveStatic } from "@io/server.utils.ts";
import { logHandler } from "@io/shared.logger.ts";
import { assert } from "https://deno.land/std@0.186.0/_util/asserts.ts";

const serverOutgoingStreamHandler = defineHandler(
  async function serverOutgoingStreamHandler(req) {
    assert("GET" === req.method);

    const api = new ServerOutgoingStream(req);
    let timerId: number;
    console.log("api", api.events);
    api.addEventListener("close", (event) => {
      logHandler(event);
      clearInterval(timerId);
      ServerOutgoingStream.write("data: the " + api.id + " was gone\n\n");
    });

    api.addEventListener("open", (event) => {
      logHandler(event);
      timerId = setInterval(() => {
        api.write("data: " + Date.now() + "\n\n");
      }, 1000);
      ServerOutgoingStream.write("data: hello, i'm the " + api.id + "\n\n");
    });

    return api.response;
  },
);

const serverIncomingStreamHandler = defineHandler(
  async function serverIncomingStreamHandler(req) {
    assert("POST" === req.method);

    const api = new ServerIncomingStream(req);

    api.on("open", logHandler);
    api.on("close", logHandler);
    api.on("error", logHandler);
    api.on("data", logHandler);
    api.on("end", logHandler);

    // setTimeout(() => {
    // 	api.close();
    // }, 1000);

    await api.read();

    return new Response(":end", {
      status: 200,
    });
  },
);

Deno.serve(
  {
    key,
    cert,
    port: 8001,
    onError(error) {
      console.log("error", error);
      return new Response(String(error), { status: 400 });
    },
    async onListen({ port, hostname }) {
      const url = `https://${hostname}:${port}/`;
      console.log("\n\tListening @", url, "\n");

      // const api = new ClientOutgoingStream(url);

      // api.on("close", (e) =>
      // 	console.log(
      // 		color.blue(e.target.constructor.name),
      // 		e.target.id,
      // 		color.green(e.type),
      // 		e.detail
      // 	)
      // );
      // api.on("error", (e) =>
      // 	console.log(
      // 		color.blue(e.target.constructor.name),
      // 		e.target.id,
      // 		color.green(e.type),
      // 		e.detail
      // 	)
      // );

      // await api.ready;
      // await api.write("Hello streams ;)");

      // setTimeout(() => api.close(), 3000);
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
      default: {
        return new Response("Bad Request " + request.method, {
          status: 400,
        });
      }
    }
  },
);
