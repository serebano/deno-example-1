// deno-lint-ignore-file no-explicit-any

import type { IOEventTarget } from "../event.js";

export interface IOEventInit<T = unknown> extends CustomEventInit {
  detail?: T;
  data?: T;
  error?: T;
  meta?: { [key: string]: unknown };
}

export class IOEvent<T = any> extends Event {
  /**
   * Returns any custom data event was created with. Typically used for synthetic events.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CustomEvent/detail)
   */
  readonly detail!: T;
  readonly data!: T;
  readonly error!: T;
  readonly meta!: { [key: string]: unknown };

  declare target: IOEventTarget;
  declare currentTarget: IOEventTarget;

  constructor(typeArg: string, eventInitDict?: IOEventInit<T> | undefined) {
    super(typeArg, eventInitDict);
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

export type EventListener<T extends object, K extends keyof T> = (
  event: T[K],
) => void;

export type IOEventMap<X, T extends Omit<X, "map"> = Omit<X, "map">> = {
  [key in keyof T]: T[key] extends (...args: any) => any ? ReturnType<T[key]>
    : T[key];
};

export type IOEventTypes<T> = {
  [key in keyof T]: T[key] extends (...args: any) => any ? ReturnType<T[key]> // IOEvent<Parameters<T[key]>[0]>
    : IOEvent; // T[key] extends (...args: any) => any ?  ReturnType<T[key]> : T[key];
};

export type IOEventType<O, K extends keyof O> = O[K] extends
  (...args: any) => any ? ReturnType<O[K]> : IOEvent;

export type IOEventParam<O, K extends keyof O> = O[K] extends
  (...args: any) => any ? Parameters<O[K]>[0] : any;
