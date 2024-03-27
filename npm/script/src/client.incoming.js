"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IncomingStream = void 0;
const event_js_1 = require("./event.js");
class EventTypes extends event_js_1.IOEventFactory {
}
/**
 * ClientIncomingStream
 * Create request stream initiated by client/browser
 * client writes / server reads
 */
class IncomingStream extends event_js_1.IOEventTarget {
    constructor() {
        super(...arguments);
        Object.defineProperty(this, "events", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new EventTypes()
        });
        Object.defineProperty(this, "remoteId", {
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
        Object.defineProperty(this, "reader", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "abortController", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new AbortController()
        });
        Object.defineProperty(this, "options", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {
                method: "GET",
                headers: {
                    "cache-control": "no-cache",
                    "content-type": "text/event-stream",
                    "transporter-id": String(this.id),
                    "transporter-by": this.name,
                },
                signal: this.abortController.signal,
            }
        });
    }
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
            this.readable = res.body.pipeThrough(new TextDecoderStream());
            this.reader = this.readable.getReader();
        }
        else {
            this.readyState = this.CLOSED;
        }
        return this;
    }
    /**
     * Reads data from the stream.
     * @param cb - An optional callback function to handle the read data.
     * @returns A promise that resolves when the read operation is complete.
     */
    async read(cb) {
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
        }
        catch (error) {
            this.emit("close", error.message);
            this.emit("error", error);
            return false;
        }
    }
    async close(reason) {
        await this.reader.cancel(reason || "closed by user action");
        this.abortController.abort(reason || "closed by user action");
    }
}
exports.IncomingStream = IncomingStream;
Object.defineProperty(IncomingStream, "id", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: 20000
});
