// deno-lint-ignore-file
import { IOEvent, IOEventFactory, IOEventTarget } from "./event.ts";

class EventTypes extends IOEventFactory {
  declare target: OutgoingStream;

  end() {
    return new IOEvent("end");
  }
  write(chunk: string) {
    return new IOEvent("write", { data: chunk });
  }
  abort(reason: any) {
    return new IOEvent("abort", { data: reason });
  }
}

/**
 * Represents a client outgoing stream for sending data to a server.
 */
export class OutgoingStream extends IOEventTarget<EventTypes> {
  /**
   * Next instance id
   */
  static id = 10000;

  events = new EventTypes();

  abortController = new AbortController();

  headers = new Headers({
    "transporter-id": String(this.id),
    "transporter-by": this.name,
  });

  options: RequestInit & { duplex: "half" } = {
    duplex: "half",
    method: "POST",
    signal: this.abortController.signal,
    headers: this.headers,
  };

  controller!: TransformStreamDefaultController<string>;
  writable!: WritableStream<string>;
  writer!: WritableStreamDefaultWriter<string>;
  #response!: Promise<Response>;

  get response() {
    return this.#response;
  }

  set response(value) {
    this.#response = value;
  }

  /**
   * Initializes the client outgoing stream.
   * @param url - The URL of the server to send data to.
   * @returns A promise that resolves when the initialization is complete.
   */
  async init() {
    this.readyState = this.CONNECTING;

    const {
      writable,
      readable,
    } = new TransformStream<string, string>({
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

    this.options.body = readable.pipeThrough(new TextEncoderStream());

    this.request = new Request(this.url, this.options);
    this.response = fetch(this.request)
      .then(async (res) => {
        this.readyState = this.CLOSED;
        const text = await res.text();

        this.emit("close", text);

        if (!res.ok) {
          const error = new TypeError(
            `Response Error (status=${res.status}) ${text}`,
          );
          this.emit("error", error);
          return error;
        }
        return res;
      })
      .catch((err) => {
        const isAbort = err.name === "AbortError";
        this.readyState = this.CLOSED;

        if (!isAbort) {
          this.emit("error", err);
          return err;
        } else {
          this.emit("close", this.abortController.signal.reason);

          return this.abortController.signal.reason;
        }
      });

    const onabort = (reason?: string) => this.emit("abort", reason);
    this.abortController.signal.addEventListener(
      "abort",
      function (e) {
        onabort(this.reason);
      },
    );

    this.readyState = this.OPEN;
    this.emit("open");

    return this;
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

  async close(reason?: string) {
    await this.writer.close();
    this.abortController.abort(reason || "closed by user action");
  }
}
