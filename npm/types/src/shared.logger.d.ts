import { IOEvent } from "./event.js";
export declare class Color {
    static RED: string;
    static GREEN: string;
    static YELLOW: string;
    static BLUE: string;
    static RESET: string;
}
export declare const color: {
    red: (...arg: unknown[]) => string;
    green: (...arg: unknown[]) => string;
    yellow: (...arg: unknown[]) => string;
    blue: (...arg: unknown[]) => string;
};
export declare function logHandler<T extends IOEvent>(e: T): void;
