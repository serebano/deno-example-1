import { IOEventFactory, IOEventTarget } from "./event.js";

class EventTypes extends IOEventFactory {}

/**
 * ClientIncomingStream
 * Create request stream initiated by client/browser
 * client writes / server reads
 */
export class IncomingStream extends IOEventTarget<EventTypes> {
  static id = 20000;

  events = new EventTypes();
  remoteId!: number;
  readable!: ReadableStream<string>;
  reader!: ReadableStreamDefaultReader<string>;
  abortController = new AbortController();
  options: RequestInit = {
    method: "GET",
    headers: {
      "cache-control": "no-cache",
      "content-type": "text/event-stream",
      "transporter-id": String(this.id),
      "transporter-by": this.name,
    },
    signal: this.abortController.signal,
  };

  //   constructor(public input: URL | string) {
  //     super(input);
  //   }

  get response() {
    return fetch(this.request);
  }

  async init() {
    this.readyState = this.CONNECTING;
    this.request = new Request(this.input, this.options);

    const res = await this.response;

    if (res.ok) {
      this.readyState = this.OPEN;
      this.remoteId = Number(res.headers.get("transporter-id"));
      this.readable = res.body!.pipeThrough(new TextDecoderStream());
      this.reader = this.readable.getReader();
    } else {
      this.readyState = this.CLOSED;
    }

    return this;
  }

  /**
   * Reads data from the stream.
   * @param cb - An optional callback function to handle the read data.
   * @returns A promise that resolves when the read operation is complete.
   */
  async read(cb?: (data?: string) => PromiseLike<void> | void) {
    await this.ready;

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

  async close(reason?: string) {
    await this.reader.cancel(reason || "closed by user action");
    this.abortController.abort(reason || "closed by user action");
  }
}
