// deno-lint-ignore-file no-unused-vars no-explicit-any
import { TypedEventTarget } from "./TypedEventTarget.js";
import { IOEvent } from "./IOEvent.js";
export class IOEventFactory {
    open() {
        return new IOEvent("open");
    }
    close(detail) {
        return new IOEvent("close", { detail });
    }
    error(error) {
        return new IOEvent("error", { error });
    }
    data(data) {
        return new IOEvent("data", { data });
    }
    any(data) {
        return new IOEvent("any", { data });
    }
}
export class IOEventTarget extends TypedEventTarget {
    constructor(input, options) {
        super();
        Object.defineProperty(this, "input", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: input
        });
        Object.defineProperty(this, "options", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: options
        });
        // static EventTypes = IOEventTypes;
        Object.defineProperty(this, "events", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new IOEventFactory()
        });
        // = new (IOEventFactory as new () => O)();
        Object.defineProperty(this, "id", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "url", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "status", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 200
        });
        Object.defineProperty(this, "headers", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "request", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "abortController", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "READYSTATE", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {
                OPEN: 1,
                CLOSED: 2,
                CONNECTING: 0,
            }
        });
        Object.defineProperty(this, "OPEN", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: this.READYSTATE.OPEN
        });
        Object.defineProperty(this, "CLOSED", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: this.READYSTATE.CLOSED
        });
        Object.defineProperty(this, "CONNECTING", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: this.READYSTATE.CONNECTING
        });
        Object.defineProperty(this, "readyState", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "readyPromise", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "listeners", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        this.id = new.target.id++;
        this.name = new.target.name;
        this.options = Object.assign(Object.create(null), this.options, options);
        this.events.target = this;
        if (input instanceof Request) {
            this.url = input.url;
            this.request = input;
        }
        else {
            this.url = input;
        }
        Object.assign(this, {
            addEventListener: this._addEventListener,
            removeEventListener: this._removeEventListener,
        });
    }
    get ready() {
        if (!this.readyPromise) {
            this.readyPromise = Promise.resolve(this.init(this.input, this.options));
        }
        return this.readyPromise;
    }
    get response() {
        throw new TypeError(`Not implemented`);
    }
    init(input, options) {
        throw new TypeError("Not implemented");
    }
    dispatch(type, event) {
        return super.dispatchTypedEvent(type, event);
    }
    emit(type, arg) {
        let event;
        // this.dispatch('error', new IOEvent('error', {error: new Error}))
        if (this.listeners.find((l) => l.type === "any")) {
            // @ts-ignore ?
            event = this.events[type].call(this, arg);
            this.dispatchEvent(this.events.any(event));
        }
        // @ts-ignore ?
        if (!this.listeners.find((l) => l.type === type)) {
            return;
        }
        // @ts-ignore ?
        event = event || this.events[type].call(this, arg);
        return this.dispatchTypedEvent(type, event);
    }
    _addEventListener(type, callback, options) {
        this.listeners.push({ type, callback, options });
        return super.addEventListener.call(this, type, callback, options);
    }
    _removeEventListener(type, callback, options) {
        this.listeners.splice(this.listeners.findIndex((val) => val.type === type &&
            val.callback === callback &&
            val.options === options));
        return super.removeEventListener.call(this, type, callback, options);
    }
    removeAllListeners() {
        const res = this.listeners.map(({ type, callback, options }) => this.removeEventListener(type, callback, options));
        this.listeners = [];
        return res;
    }
    get on() {
        return this.addEventListener;
    }
    get off() {
        return this.removeEventListener;
    }
}
// instance id
Object.defineProperty(IOEventTarget, "id", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: 0
});
// class MyEvents extends IOEventFactory {
//   fooooo(data: number[]) {
//     return new MessageEvent("fooooo", { data });
//   }
// }
// class MyIO extends IOEventTarget<MyEvents> {
//   public events = new MyEvents();
//   constructor(input: URL | RequestInfo) {
//     super(input);
//   }
// }
// const api = new MyIO("/");
// api.on("error", (e) => {});
// api.on("fooooo", ({ data }) => {});
// api.events.fooooo([1, 2, 3]);
