import { TypedEventTarget } from "./TypedEventTarget.js";
import { IOEvent, IOEventParam, IOEventType, IOEventTypes } from "./IOEvent.js";
export declare class IOEventFactory {
    target: IOEventTarget;
    open(): IOEvent<any>;
    close(detail?: string): IOEvent<string>;
    error(error?: Error): IOEvent<Error>;
    data(data: string): IOEvent<string>;
    any(data: Event): IOEvent<Event>;
}
export declare class IOEventTarget<O extends IOEventFactory = IOEventFactory> extends TypedEventTarget<IOEventTypes<O>> {
    input: URL | RequestInfo;
    options?: RequestInit | undefined;
    static id: number;
    events: O;
    id: number;
    url: URL | string;
    name: string;
    status: number;
    headers: Headers;
    request: Request;
    abortController: AbortController;
    READYSTATE: {
        readonly OPEN: 1;
        readonly CLOSED: 2;
        readonly CONNECTING: 0;
    };
    OPEN: 1;
    CLOSED: 2;
    CONNECTING: 0;
    readyState: (typeof this.READYSTATE)[keyof typeof this.READYSTATE];
    readyPromise?: Promise<this>;
    listeners: any[];
    constructor(input: URL | RequestInfo, options?: RequestInit | undefined);
    get ready(): Promise<this>;
    get response(): Promise<Response | void> | Response;
    init(input?: URL | RequestInfo, options?: RequestInit): this | PromiseLike<this>;
    dispatch<K extends keyof O>(type: K, event: IOEventType<O, K>): boolean;
    emit<K extends keyof O>(type: K, arg?: IOEventParam<O, K>): boolean | undefined;
    _addEventListener<K extends keyof O & string>(type: K, callback: (event: IOEventType<O, K>) => void, options?: boolean | AddEventListenerOptions): void;
    _removeEventListener<K extends keyof O & string>(type: K, callback: (event: IOEventType<O, K>) => void, options?: boolean | AddEventListenerOptions): void;
    removeAllListeners(): void[];
    get on(): <T extends keyof O & string>(type: T, listener: import("./TypedEventTarget.js").TypedEventListenerOrEventListenerObject<IOEventTypes<O>, T> | null, options?: boolean | AddEventListenerOptions | undefined) => void;
    get off(): <T extends keyof O & string>(type: T, callback: import("./TypedEventTarget.js").TypedEventListenerOrEventListenerObject<IOEventTypes<O>, T> | null, options?: boolean | EventListenerOptions | undefined) => void;
}
