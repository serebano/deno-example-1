import { IOEvent, IOEventFactory, IOEventTarget } from "./event.js";
declare class EventTypes extends IOEventFactory {
    target: OutgoingStream;
    end(): IOEvent<any>;
    write(chunk: string): IOEvent<string>;
    abort(reason: any): IOEvent<any>;
}
/**
 * Represents a client outgoing stream for sending data to a server.
 */
export declare class OutgoingStream extends IOEventTarget<EventTypes> {
    #private;
    /**
     * Next instance id
     */
    static id: number;
    events: EventTypes;
    abortController: AbortController;
    headers: Headers;
    options: RequestInit & {
        duplex: "half";
    };
    controller: TransformStreamDefaultController<string>;
    writable: WritableStream<string>;
    writer: WritableStreamDefaultWriter<string>;
    get response(): Promise<Response>;
    set response(value: Promise<Response>);
    /**
     * Initializes the client outgoing stream.
     * @param url - The URL of the server to send data to.
     * @returns A promise that resolves when the initialization is complete.
     */
    init(): Promise<this>;
    /**
     * Writes data to the client outgoing stream.
     * @param chunk - The data to write.
     * @returns A promise that resolves when the write operation is complete.
     */
    write(chunk: string): Promise<void>;
    close(reason?: string): Promise<void>;
}
export {};
