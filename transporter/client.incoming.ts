import { IOEventFactory, IOEventTarget } from "./event.ts";

class EventTypes extends IOEventFactory {}

/**
 * ClientIncomingStream
 * Create request stream initiated by client/browser
 * client writes / server reads
 */
export class ClientIncomingStream extends IOEventTarget<EventTypes> {
  static id = 20000;
  events = new EventTypes();
  readable!: ReadableStream<string>;
  reader!: ReadableStreamDefaultReader<string>;
  options: RequestInit = {
    method: "GET",
    headers: {
      "content-type": "text/event-stream",
      "transporter-by": this.name,
      "transporter-id": String(this.id),
    },
  };

  constructor(public input: URL | string) {
    super(input);
  }

  get response() {
    return fetch(this.request);
  }

  async init() {
    this.readyState = this.CONNECTING;
    this.request = new Request(this.input, this.options);

    // this.response = fetch(this.request)

    await this.response.then((res) => {
      if (res.ok) {
        this.readyState = this.OPEN;

        this.id = Number(res.headers.get("transporter-id"));
        this.readable = res.body!.pipeThrough(new TextDecoderStream());
        this.reader = this.readable.getReader();
      } else {
        this.readyState = this.CLOSED;
      }

      return res;
    });
    // await this.response;

    return this;
  }

  /**
   * Reads data from the stream.
   * @param cb - An optional callback function to handle the read data.
   * @returns A promise that resolves when the read operation is complete.
   */
  async read(cb?: (data?: string) => PromiseLike<void>) {
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
}
