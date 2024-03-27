import { IOEventFactory, IOEventTarget } from "./event.js";
declare class EventTypes extends IOEventFactory {
}
/**
 * ClientIncomingStream
 * Create request stream initiated by client/browser
 * client writes / server reads
 */
export declare class IncomingStream extends IOEventTarget<EventTypes> {
    static id: number;
    events: EventTypes;
    remoteId: number;
    readable: ReadableStream<string>;
    reader: ReadableStreamDefaultReader<string>;
    abortController: AbortController;
    options: RequestInit;
    get response(): Promise<Response>;
    init(): Promise<this>;
    /**
     * Reads data from the stream.
     * @param cb - An optional callback function to handle the read data.
     * @returns A promise that resolves when the read operation is complete.
     */
    read(cb?: (data?: string) => PromiseLike<void> | void): Promise<boolean>;
    close(reason?: string): Promise<void>;
}
export {};
