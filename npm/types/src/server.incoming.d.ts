import { IOEvent, IOEventFactory, IOEventTarget } from "./event.js";
declare class Events extends IOEventFactory {
    push: (chunk: string) => IOEvent<string>;
    end: () => IOEvent<any>;
}
/**
 * Represents a server incoming stream.
 *
 * Reader {@linkcode ServerIncomingStream} <-- Writer [`ClientOutgoingStream`](file:///clappcodes/deno-transporter/play/client.outgoing.ts#L8,14)
 */
export declare class ServerIncomingStream extends IOEventTarget<Events> {
    static id: number;
    events: Events;
    readable: ReadableStream<string>;
    reader: ReadableStreamDefaultReader;
    headers: Headers;
    reading: boolean;
    /**
     * Creates a new instance of ServerIncomingStream.
     * @param request - The request object.
     */
    get response(): Promise<Response>;
    init(): this;
    /**
     * Reads data from the stream.
     * @param cb - An optional callback function to handle the read data.
     * @returns A promise that resolves when the read operation is complete.
     */
    read(cb?: (data?: string) => PromiseLike<void>): Promise<boolean | undefined>;
    close(): Promise<void>;
}
export declare function createIncomingServerHandler(req: Request): ServerIncomingStream;
export {};
