// deno-lint-ignore-file no-explicit-any
export class IOEvent extends Event {
    constructor(typeArg, eventInitDict) {
        super(typeArg, eventInitDict);
        /**
         * Returns any custom data event was created with. Typically used for synthetic events.
         *
         * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CustomEvent/detail)
         */
        Object.defineProperty(this, "detail", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "data", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "error", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "meta", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperties(this, {
            data: {
                get() {
                    return eventInitDict?.data;
                },
            },
            error: {
                get() {
                    return eventInitDict?.error;
                },
            },
            meta: {
                get() {
                    return eventInitDict?.meta;
                },
            },
        });
    }
}
