import { IOEvent, IOEventFactory, IOEventTarget } from "./event.js";
declare class Events extends IOEventFactory {
    write(chunk: string): IOEvent<string>;
    enqueue(chunk: string): IOEvent<string>;
}
/**
 * Represents a server outgoing stream.
 *
 * Writer {@linkcode ServerOutgoingStream} --> Reader [`ClientIncomingStream`](file:///clappcodes/deno-transporter/play/client.incoming.ts#L15,14)
 */
export declare class ServerOutgoingStream extends IOEventTarget<Events> {
    #private;
    static id: number;
    static instances: Map<number, ServerOutgoingStream>;
    /**
     * Writes a chunk of data to all instances of the server outgoing stream.
     * @param chunk - The chunk of data to write.
     */
    static write(chunk: string): void;
    events: Events;
    headers: Headers;
    readable: ReadableStream<Uint8Array>;
    /**
     * Creates a new instance of the ServerOutgoingStream class.
     * @param request - The request associated with the stream.
     */
    init(): this;
    get response(): Promise<Response>;
    /**
     * Pushes a chunk of data to the stream.
     * @param chunk - The chunk of data to push.
     */
    write(chunk: string): void;
    /**
     * Closes the stream.
     */
    close(): void;
}
export {};
