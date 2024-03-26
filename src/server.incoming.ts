import { IOEvent, IOEventFactory, IOEventTarget } from "./event.ts";

class Events extends IOEventFactory {
  push = (chunk: string) => new IOEvent("push", { data: chunk });
  end = () => new IOEvent("end");
}

/**
 * Represents a server incoming stream.
 *
 * Reader {@linkcode ServerIncomingStream} <-- Writer [`ClientOutgoingStream`](file:///clappcodes/deno-transporter/play/client.outgoing.ts#L8,14)
 */

export class ServerIncomingStream extends IOEventTarget<Events> {
  static id = 40000;
  events = new Events();

  readable!: ReadableStream<string>;
  reader!: ReadableStreamDefaultReader;
  headers = new Headers({
    "transporter-by": this.name,
    "transporter-id": String(this.id),
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "*",
    "access-control-allow-headers": "*",
    "access-control-max-age": "100",
    "access-control-expose-headers": "transporter-id",
  });
  reading: boolean = false;

  /**
   * Creates a new instance of ServerIncomingStream.
   * @param request - The request object.
   */
  //   constructor(public request: Request) {
  //     super(request);
  //   }

  get response() {
    return this.read().then(() => {
      return new Response(null, {
        status: this.status,
        headers: this.headers,
      });
    });
  }

  init() {
    this.readable = this.request.body?.pipeThrough(new TextDecoderStream())!;
    this.reader = this.readable.getReader();

    return this;
  }

  /**
   * Reads data from the stream.
   * @param cb - An optional callback function to handle the read data.
   * @returns A promise that resolves when the read operation is complete.
   */
  async read(cb?: (data?: string) => PromiseLike<void>) {
    await this.ready;

    if (this.reading) {
      return;
    }

    this.reading = true;

    const read = async () => {
      let firstChunk = true;
      while (true) {
        const { done, value } = await this.reader.read();
        if (done) {
          this.emit("close", value);
          return done;
        }
        if (firstChunk) {
          firstChunk = false;
          this.emit("open");
        }

        this.emit("data", value);

        if (cb) {
          await cb.call(this, value);
        }
      }
    };

    try {
      return await read();
    } catch (error) {
      //   this.emit("close", error.message);
      this.emit("error", error);
      return false;
    }
  }

  async close() {
    await this.reader.cancel();
    this.emit("close");
  }
}

export function createIncomingServerHandler(req: Request) {
  return new ServerIncomingStream(req);
}
