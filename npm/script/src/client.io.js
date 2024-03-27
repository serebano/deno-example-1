"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IOStream = void 0;
const client_incoming_js_1 = require("./client.incoming.js");
const client_outgoing_js_1 = require("./client.outgoing.js");
const event_js_1 = require("./event.js");
class Events extends event_js_1.IOEventFactory {
    constructor() {
        super(...arguments);
        Object.defineProperty(this, "write", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (chunk) => new event_js_1.IOEvent("write", { data: chunk })
        });
    }
}
class IOStream extends event_js_1.IOEventTarget {
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
        this.incoming = new client_incoming_js_1.IncomingStream(this.input);
        this.outgoing = new client_outgoing_js_1.OutgoingStream(this.input);
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
exports.IOStream = IOStream;
