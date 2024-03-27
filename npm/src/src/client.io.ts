import { IncomingStream } from "./client.incoming.js";
import { OutgoingStream } from "./client.outgoing.js";
import { IOEvent, IOEventFactory, IOEventTarget } from "./event.js";

class Events extends IOEventFactory {
  write = (chunk: string) => new IOEvent("write", { data: chunk });
}

export class IOStream extends IOEventTarget<Events> {
  events = new Events();

  incoming!: IncomingStream;
  outgoing!: OutgoingStream;

  readable!: ReadableStream<string>;
  writable!: WritableStream<string>;

  constructor(public input: URL | RequestInfo) {
    super(input);

    this.incoming = new IncomingStream(this.input);
    this.outgoing = new OutgoingStream(this.input);
  }

  async init() {
    this.readable = this.incoming.readable;
    this.writable = this.outgoing.writable;

    this.incoming.on("data", (e) => {
      this.emit("data", e.data);
    });

    this.outgoing.on("write", (e) => {
      this.emit("write", e.data);
    });

    try {
      await this.incoming.ready;
      await this.outgoing.ready;

      this.emit("open");
    } catch (error) {
      this.emit("error", error);

      if (
        this.incoming.readyState === this.CLOSED &&
        this.outgoing.readyState === this.CLOSED
      ) {
        this.emit("close", error);
      }

      throw error;
    }

    return this;
  }

  async read(cb?: (data?: string) => void) {
    await this.ready;

    return this.incoming.read(cb);
  }

  async write(chunk: string) {
    await this.ready;

    return this.outgoing.write(chunk);
  }

  async close(reason?: string) {
    reason = reason || "closed by IOStream";

    await this.incoming.close(reason);
    await this.outgoing.close(reason);
  }
}
