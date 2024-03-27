"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var _OutgoingStream_response;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutgoingStream = void 0;
// deno-lint-ignore-file
const event_js_1 = require("./event.js");
class EventTypes extends event_js_1.IOEventFactory {
    end() {
        return new event_js_1.IOEvent("end");
    }
    write(chunk) {
        return new event_js_1.IOEvent("write", { data: chunk });
    }
    abort(reason) {
        return new event_js_1.IOEvent("abort", { data: reason });
    }
}
/**
 * Represents a client outgoing stream for sending data to a server.
 */
class OutgoingStream extends event_js_1.IOEventTarget {
    constructor() {
        super(...arguments);
        Object.defineProperty(this, "events", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new EventTypes()
        });
        Object.defineProperty(this, "abortController", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new AbortController()
        });
        Object.defineProperty(this, "headers", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Headers({
                "transporter-id": String(this.id),
                "transporter-by": this.name,
            })
        });
        Object.defineProperty(this, "options", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {
                duplex: "half",
                method: "POST",
                signal: this.abortController.signal,
                headers: this.headers,
            }
        });
        Object.defineProperty(this, "controller", {
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
        Object.defineProperty(this, "writer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        _OutgoingStream_response.set(this, void 0);
    }
    get response() {
        return __classPrivateFieldGet(this, _OutgoingStream_response, "f");
    }
    set response(value) {
        __classPrivateFieldSet(this, _OutgoingStream_response, value, "f");
    }
    /**
     * Initializes the client outgoing stream.
     * @param url - The URL of the server to send data to.
     * @returns A promise that resolves when the initialization is complete.
     */
    async init() {
        this.readyState = this.CONNECTING;
        const { writable, readable, } = new TransformStream({
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
                const error = new TypeError(`Response Error (status=${res.status}) ${text}`);
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
            }
            else {
                this.emit("close", this.abortController.signal.reason);
                return this.abortController.signal.reason;
            }
        });
        const onabort = (reason) => this.emit("abort", reason);
        this.abortController.signal.addEventListener("abort", function (e) {
            onabort(this.reason);
        });
        this.readyState = this.OPEN;
        this.emit("open");
        return this;
    }
    /**
     * Writes data to the client outgoing stream.
     * @param chunk - The data to write.
     * @returns A promise that resolves when the write operation is complete.
     */
    async write(chunk) {
        try {
            await this.ready;
            if (!this.writer) {
                throw new Error(`No writer to write`);
            }
            await this.writer.ready;
            await this.writer.write(chunk);
        }
        catch (error) {
            this.emit("error", error);
        }
    }
    async close(reason) {
        await this.writer.close();
        this.abortController.abort(reason || "closed by user action");
    }
}
exports.OutgoingStream = OutgoingStream;
_OutgoingStream_response = new WeakMap();
/**
 * Next instance id
 */
Object.defineProperty(OutgoingStream, "id", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: 10000
});
