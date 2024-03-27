import type { IOEventTarget } from "../event.js";
export interface IOEventInit<T = unknown> extends CustomEventInit {
    detail?: T;
    data?: T;
    error?: T;
    meta?: {
        [key: string]: unknown;
    };
}
export declare class IOEvent<T = any> extends Event {
    /**
     * Returns any custom data event was created with. Typically used for synthetic events.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CustomEvent/detail)
     */
    readonly detail: T;
    readonly data: T;
    readonly error: T;
    readonly meta: {
        [key: string]: unknown;
    };
    target: IOEventTarget;
    currentTarget: IOEventTarget;
    constructor(typeArg: string, eventInitDict?: IOEventInit<T> | undefined);
}
export type EventListener<T extends object, K extends keyof T> = (event: T[K]) => void;
export type IOEventMap<X, T extends Omit<X, "map"> = Omit<X, "map">> = {
    [key in keyof T]: T[key] extends (...args: any) => any ? ReturnType<T[key]> : T[key];
};
export type IOEventTypes<T> = {
    [key in keyof T]: T[key] extends (...args: any) => any ? ReturnType<T[key]> : IOEvent;
};
export type IOEventType<O, K extends keyof O> = O[K] extends (...args: any) => any ? ReturnType<O[K]> : IOEvent;
export type IOEventParam<O, K extends keyof O> = O[K] extends (...args: any) => any ? Parameters<O[K]>[0] : any;
