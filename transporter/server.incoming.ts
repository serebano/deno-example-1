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

  /**
   * Creates a new instance of ServerIncomingStream.
   * @param request - The request object.
   */
  constructor(public request: Request) {
    super(request);
  }

  /**
   * Reads data from the stream.
   * @param cb - An optional callback function to handle the read data.
   * @returns A promise that resolves when the read operation is complete.
   */
  async read(cb?: (data?: string) => PromiseLike<void>) {
    if (!this.readable) {
      this.readable = this.request.body?.pipeThrough(new TextDecoderStream())!;
    }

    if (!this.reader) {
      this.reader = this.readable.getReader();
    }

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
      this.emit("close", error.message);
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
