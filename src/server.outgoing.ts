import { IOEvent, IOEventFactory, IOEventTarget } from "./event.ts";

class Events extends IOEventFactory {
  write(chunk: string) {
    return new IOEvent("write", { data: chunk });
  }
  enqueue(chunk: string) {
    return new IOEvent("enqueue", { data: chunk });
  }
}

/**
 * Represents a server outgoing stream.
 *
 * Writer {@linkcode ServerOutgoingStream} --> Reader [`ClientIncomingStream`](file:///clappcodes/deno-transporter/play/client.incoming.ts#L15,14)
 */
export class ServerOutgoingStream extends IOEventTarget<Events> {
  static id = 30000;
  static instances = new Map<number, ServerOutgoingStream>();
  /**
   * Writes a chunk of data to all instances of the server outgoing stream.
   * @param chunk - The chunk of data to write.
   */
  static write(chunk: string) {
    for (const instance of this.instances.values()) {
      instance.write(chunk);
    }
  }

  events = new Events();
  headers = new Headers({
    "cache-control": "no-cache",
    "content-type": "text/event-stream",
    "transporter-id": String(this.id),
    "transporter-instances": String(ServerOutgoingStream.instances.size),
    // cors
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "*",
    "access-control-allow-headers": "*",
    "access-control-max-age": "100",
    "access-control-expose-headers": "transporter-id",
  });

  readable!: ReadableStream<Uint8Array>;
  #controller!: ReadableStreamDefaultController;
  #queue: string[] = [];

  /**
   * Creates a new instance of the ServerOutgoingStream class.
   * @param request - The request associated with the stream.
   */
  //   constructor(public request: Request) {
  //     super(request);
  //   }

  init() {
    this.readyState = this.CONNECTING;

    this.readable = new ReadableStream<string>({
      start: (controller) => {
        ServerOutgoingStream.instances.set(this.id, this);
        this.#controller = controller;
        this.readyState = this.OPEN;
        this.emit("open");
      },
      cancel: (reason: string) => {
        ServerOutgoingStream.instances.delete(this.id);
        this.readyState = this.CLOSED;
        this.emit("close", reason);
      },
    }).pipeThrough(new TextEncoderStream());

    return this;
  }

  get response() {
    return this.ready
      .then(() =>
        new Response(this.readable, {
          status: this.status,
          headers: this.headers,
        })
      );
  }

  /**
   * Pushes a chunk of data to the stream.
   * @param chunk - The chunk of data to push.
   */
  write(chunk: string) {
    if (this.readyState === this.CLOSED) {
      return;
    }
    if (!this.#controller) {
      this.#queue.push(chunk);
      this.emit("enqueue", chunk);

      return;
    }
    if (this.#queue.length > 0) {
      this.#queue.forEach((chunk) => {
        this.#controller.enqueue(chunk);
        this.emit("write", chunk);
      });
      this.#queue = [];
    }
    this.#controller.enqueue(chunk);
    this.emit("write", chunk);
  }

  /**
   * Closes the stream.
   */
  close() {
    this.#controller.close();
  }
}
