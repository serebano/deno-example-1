import { IncomingStream } from "./client.incoming.js";
import { OutgoingStream } from "./client.outgoing.js";
import { IOEvent, IOEventFactory, IOEventTarget } from "./event.js";
class Events extends IOEventFactory {
    constructor() {
        super(...arguments);
        Object.defineProperty(this, "write", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (chunk) => new IOEvent("write", { data: chunk })
        });
    }
}
export class IOStream extends IOEventTarget {
    constructor(input) {
        super(input);
        Object.defineProperty(this, "input", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: input
        });
        Object.defineProperty(this, "events", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Events()
        });
        Object.defineProperty(this, "incoming", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "outgoing", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "readable", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "writable", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
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
        }
        catch (error) {
            this.emit("error", error);
            if (this.incoming.readyState === this.CLOSED &&
                this.outgoing.readyState === this.CLOSED) {
                this.emit("close", error);
            }
            throw error;
        }
        return this;
    }
    async read(cb) {
        await this.ready;
        return this.incoming.read(cb);
    }
    async write(chunk) {
        await this.ready;
        return this.outgoing.write(chunk);
    }
    async close(reason) {
        reason = reason || "closed by IOStream";
        await this.incoming.close(reason);
        await this.outgoing.close(reason);
    }
}
