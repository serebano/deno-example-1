// deno-lint-ignore-file no-explicit-any

import { IOEventTarget } from "../event.ts";

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

// export type EventMap<
//   EventTypes extends IOEventFactory = IOEventFactory,
//   T extends keyof EventTypes = keyof EventTypes,
// > = {
//   [K in T]: ReturnType<EventTypes[K]>;
// };

export type EventListener<T extends object, K extends keyof T> = (
  event: T[K],
) => void;
