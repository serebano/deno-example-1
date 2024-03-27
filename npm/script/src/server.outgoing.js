"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _ServerOutgoingStream_controller, _ServerOutgoingStream_queue;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerOutgoingStream = void 0;
const event_js_1 = require("./event.js");
class Events extends event_js_1.IOEventFactory {
    write(chunk) {
        return new event_js_1.IOEvent("write", { data: chunk });
    }
    enqueue(chunk) {
        return new event_js_1.IOEvent("enqueue", { data: chunk });
    }
}
/**
 * Represents a server outgoing stream.
 *
 * Writer {@linkcode ServerOutgoingStream} --> Reader [`ClientIncomingStream`](file:///clappcodes/deno-transporter/play/client.incoming.ts#L15,14)
 */
class ServerOutgoingStream extends event_js_1.IOEventTarget {
    constructor() {
        super(...arguments);
        Object.defineProperty(this, "events", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Events()
        });
        Object.defineProperty(this, "headers", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Headers({
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
            })
        });
        Object.defineProperty(this, "readable", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        _ServerOutgoingStream_controller.set(this, void 0);
        _ServerOutgoingStream_queue.set(this, []);
    }
    /**
     * Writes a chunk of data to all instances of the server outgoing stream.
     * @param chunk - The chunk of data to write.
     */
    static write(chunk) {
        for (const instance of this.instances.values()) {
            instance.write(chunk);
        }
    }
    /**
     * Creates a new instance of the ServerOutgoingStream class.
     * @param request - The request associated with the stream.
     */
    //   constructor(public request: Request) {
    //     super(request);
    //   }
    init() {
        this.readyState = this.CONNECTING;
        this.readable = new ReadableStream({
            start: (controller) => {
                ServerOutgoingStream.instances.set(this.id, this);
                __classPrivateFieldSet(this, _ServerOutgoingStream_controller, controller, "f");
                this.readyState = this.OPEN;
                this.emit("open");
            },
            cancel: (reason) => {
                ServerOutgoingStream.instances.delete(this.id);
                this.readyState = this.CLOSED;
                this.emit("close", reason);
            },
        }).pipeThrough(new TextEncoderStream());
        return this;
    }
    get response() {
        return this.ready
            .then(() => new Response(this.readable, {
            status: this.status,
            headers: this.headers,
        }));
    }
    /**
     * Pushes a chunk of data to the stream.
     * @param chunk - The chunk of data to push.
     */
    write(chunk) {
        if (this.readyState === this.CLOSED) {
            return;
        }
        if (!__classPrivateFieldGet(this, _ServerOutgoingStream_controller, "f")) {
            __classPrivateFieldGet(this, _ServerOutgoingStream_queue, "f").push(chunk);
            this.emit("enqueue", chunk);
            return;
        }
        if (__classPrivateFieldGet(this, _ServerOutgoingStream_queue, "f").length > 0) {
            __classPrivateFieldGet(this, _ServerOutgoingStream_queue, "f").forEach((chunk) => {
                __classPrivateFieldGet(this, _ServerOutgoingStream_controller, "f").enqueue(chunk);
                this.emit("write", chunk);
            });
            __classPrivateFieldSet(this, _ServerOutgoingStream_queue, [], "f");
        }
        __classPrivateFieldGet(this, _ServerOutgoingStream_controller, "f").enqueue(chunk);
        this.emit("write", chunk);
    }
    /**
     * Closes the stream.
     */
    close() {
        __classPrivateFieldGet(this, _ServerOutgoingStream_controller, "f").close();
    }
}
exports.ServerOutgoingStream = ServerOutgoingStream;
_ServerOutgoingStream_controller = new WeakMap(), _ServerOutgoingStream_queue = new WeakMap();
Object.defineProperty(ServerOutgoingStream, "id", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: 30000
});
Object.defineProperty(ServerOutgoingStream, "instances", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: new Map()
});
