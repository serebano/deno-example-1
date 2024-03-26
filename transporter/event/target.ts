// deno-lint-ignore-file no-unused-vars no-explicit-any
import {
  TypedEventTarget,
} from "https://deno.land/x/typescript_event_target@v1.1.0/mod.ts";
import { IOEvent } from "./event.ts";

// declare global {
//   //   interface CustomEvent {
//   //     target: IOEventTarget<IOEventTypes>;
//   //     currentTarget: IOEventTarget<IOEventTypes>;
//   //   }
// }

export type IOEventMap<X, T extends Omit<X, "map"> = Omit<X, "map">> = {
  [key in keyof T]: T[key] extends (...args: any) => any ? ReturnType<T[key]>
    : T[key];
};

export type IOEventTypes<T> = {
  [key in keyof T]: T[key] extends (...args: any) => any ? ReturnType<T[key]> // IOEvent<Parameters<T[key]>[0]>
    : IOEvent; // T[key] extends (...args: any) => any ?  ReturnType<T[key]> : T[key];
};

// export interface IOEventFactory {
//   (...args: any): IOEvent;
// }

export class IOEventFactory {
  //   declare private map: ValueIsEvent<typeof this>;
  open() {
    return new IOEvent("open");
  }
  close(detail?: string) {
    return new IOEvent("close", { detail });
  }
  error(error?: Error) {
    return new IOEvent("error", { error });
  }
  data(data: string) {
    return new IOEvent("data", { data });
  }
  any(data: unknown) {
    return new IOEvent("any", { data });
  }
}

export type IOEventType<O, K extends keyof O> = O[K] extends
  (...args: any) => any ? ReturnType<O[K]> : IOEvent;

export type IOEventParam<O, K extends keyof O> = O[K] extends
  (...args: any) => any ? Parameters<O[K]>[0] : any;

export class IOEventTarget<O extends IOEventFactory = IOEventFactory>
  extends TypedEventTarget<IOEventTypes<O>> {
  // instance id
  static id = 0;

  // static EventTypes = IOEventTypes;
  events: O = new IOEventFactory() as O;
  // = new (IOEventFactory as new () => O)();

  id: number;
  url: URL | string;
  name: string;
  status = 200;
  headers!: Headers;
  request!: Request;
  abortController!: AbortController;

  READYSTATE = {
    OPEN: 1,
    CLOSED: 2,
    CONNECTING: 0,
  } as const;

  OPEN = this.READYSTATE.OPEN;
  CLOSED = this.READYSTATE.CLOSED;
  CONNECTING = this.READYSTATE.CONNECTING;

  readyState!: (typeof this.READYSTATE)[keyof typeof this.READYSTATE];
  readyPromise?: Promise<this>;

  listeners: any[] = [];

  constructor(
    public input: URL | RequestInfo,
    public options?: RequestInit,
  ) {
    super();

    this.id = new.target.id++;
    this.name = new.target.name;
    this.options = Object.assign(Object.create(null), this.options, options);

    if (input instanceof Request) {
      this.url = input.url;
      this.request = input;
    } else {
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

  get response(): Promise<Response> | Response {
    throw new TypeError(`Not implemented`);
  }

  init(
    input?: URL | RequestInfo,
    options?: RequestInit,
  ): this | PromiseLike<this> {
    throw new TypeError("Not implemented");
  }

  public dispatch<K extends keyof O>(type: K, event: IOEventType<O, K>) {
    return super.dispatchTypedEvent(type, event);
  }

  public emit<K extends keyof O>(
    type: K,
    arg?: IOEventParam<O, K>,
  ) {
    let event: IOEventType<O, K>;

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

  _addEventListener<K extends keyof O & string>(
    type: K,
    callback: (event: IOEventType<O, K>) => void,
    options?: boolean | AddEventListenerOptions,
  ) {
    this.listeners.push({ type, callback, options });
    return super.addEventListener.call(this, type, callback, options);
  }

  _removeEventListener<K extends keyof O & string>(
    type: K,
    callback: (event: IOEventType<O, K>) => void,
    options?: boolean | AddEventListenerOptions,
  ) {
    this.listeners.splice(
      this.listeners.findIndex(
        (val) =>
          val.type === type &&
          val.callback === callback &&
          val.options === options,
      ),
    );
    return super.removeEventListener.call(this, type, callback, options);
  }

  removeAllListeners() {
    const res = this.listeners.map(({ type, callback, options }) =>
      this.removeEventListener(type, callback, options)
    );
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
