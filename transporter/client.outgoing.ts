// deno-lint-ignore-file
import { IOEvent, IOEventFactory, IOEventTarget } from "./event.ts";

class EventTypes extends IOEventFactory {
  end() {
    return new IOEvent("end");
  }
  write(chunk: string) {
    return new IOEvent("write", { data: chunk });
  }
}

/**
 * Represents a client outgoing stream for sending data to a server.
 */
export class ClientOutgoingStream extends IOEventTarget<EventTypes> {
  /**
   * Next instance id
   */
  static id = 10000;

  events = new EventTypes();

  writable!: WritableStream<string>;
  writer!: WritableStreamDefaultWriter<string>;
  options: RequestInit & { duplex: "half" } = {
    duplex: "half",
    method: "POST",
  };

  controller!: TransformStreamDefaultController<string>;

  /**
   * Creates a new instance of the ClientOutgoingStream class.
   * @param url - The URL of the server to send data to.
   */
  constructor(public url: URL | string) {
    super(url);
    this.options.headers = {
      "transporter-id": String(this.id),
      "transporter-by": this.constructor.name,
    };
  }

  get ready() {
    return this.readyState !== this.OPEN ? this.init() : Promise.resolve(this);
  }

  /**
   * Initializes the client outgoing stream.
   * @param url - The URL of the server to send data to.
   * @returns A promise that resolves when the initialization is complete.
   */
  async init(url?: URL | string) {
    this.url = url || this.url;
    this.abortController = new AbortController();
    this.readyState = this.CONNECTING;

    const { writable, readable } = new TransformStream<string, string>({
      start: (_controller) => {
        this.controller = _controller;
        this.abortController.signal.onabort = () => _controller.terminate();
      },
      transform: (chunk, controller) => {
        controller.enqueue(chunk);
        this.emit("write", chunk);
      },
    });

    this.writable = writable;
    this.writer = this.writable.getWriter();

    this.options.signal = this.abortController.signal;
    this.options.body = readable.pipeThrough(new TextEncoderStream());

    this.request = new Request(this.url, this.options);
    // this.response = fetch(this.request);

    this.response
      .then(async (res) => {
        this.readyState = this.CLOSED;
        const text = await res.text();

        this.emit("close", text);

        if (!res.ok) {
          this.emit(
            "error",
            new TypeError(`Response error (status=${res.status})`, {
              cause: text,
            }),
          );
        }

        return res;
      })
      .catch((err) => {
        const isAbort = err.name === "AbortError" || err === ":close";
        this.readyState = this.CLOSED;
        this.emit("close", err.message);

        if (!isAbort) this.emit("error", err);
      });

    this.readyState = this.OPEN;
    this.emit("open");

    return this;
  }

  get response() {
    return fetch(this.request);
  }

  /**
   * Writes data to the client outgoing stream.
   * @param chunk - The data to write.
   * @returns A promise that resolves when the write operation is complete.
   */
  async write(chunk: string) {
    try {
      await this.ready;

      if (!this.writer) {
        throw new Error(`No writer to write`);
      }

      await this.writer.ready;
      await this.writer.write(chunk);
    } catch (error) {
      this.emit("error", error);
    }
  }

  async close() {
    await this.writer.close();
    this.abortController.abort("closed by user action");
  }
}

export function createOutgoingStreamClient(url: string | URL) {
  return new ClientOutgoingStream(url);
}
