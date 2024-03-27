import { IncomingStream } from "./client.incoming.js";
import { OutgoingStream } from "./client.outgoing.js";
import { IOEvent, IOEventFactory, IOEventTarget } from "./event.js";
declare class Events extends IOEventFactory {
    write: (chunk: string) => IOEvent<string>;
}
export declare class IOStream extends IOEventTarget<Events> {
    input: URL | RequestInfo;
    events: Events;
    incoming: IncomingStream;
    outgoing: OutgoingStream;
    readable: ReadableStream<string>;
    writable: WritableStream<string>;
    constructor(input: URL | RequestInfo);
    init(): Promise<this>;
    read(cb?: (data?: string) => void): Promise<boolean>;
    write(chunk: string): Promise<void>;
    close(reason?: string): Promise<void>;
}
export {};
