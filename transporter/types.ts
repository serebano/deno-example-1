// deno-lint-ignore-file
import { IOEventTarget } from "./event/target.ts";

/**
 * See https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events#fields
 */
export interface EventStreamMessage {
  id?: string;
  event?: string;
  retry?: number;
  data: string;
}

declare global {
  // interface EventTarget {
  // 	id: number;
  // 	addEventListener<K extends keyof DefaultEventTypes>(
  // 		type: K,
  // 		callback: (event: ReturnType<DefaultEventTypes[K]>) => void,
  // 		options?: boolean | AddEventListenerOptions
  // 	): void;
  // 	removeEventListener<K extends keyof DefaultEventTypes>(
  // 		type: K,
  // 		callback: (event: ReturnType<DefaultEventTypes[K]>) => void,
  // 		options?: boolean | AddEventListenerOptions
  // 	): void;
  // }
  // interface CustomEvent<T = any> extends Event {
  // 	/**
  // 	 * Returns any custom data event was created with. Typically used for synthetic events.
  // 	 *
  // 	 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CustomEvent/detail)
  // 	 */
  // 	readonly detail: T;
  // 	target: IOEventTarget;
  // 	currentTartget: IOEventTarget;
  // }
}

export type TypedEventTarget<EventMap extends object> = {
  new (): IntermediateEventTarget<EventMap>;
};

// internal helper type
interface IntermediateEventTarget<EventMap> extends EventTarget {
  addEventListener<K extends keyof EventMap>(
    type: K,
    callback: (
      event: EventMap[K],
    ) => void,
    options?: boolean | AddEventListenerOptions,
  ): void;

  addEventListener(
    type: string,
    callback: EventListenerOrEventListenerObject | null,
    options?: EventListenerOptions | boolean,
  ): void;
}

// interface IntermediateEventTarget<EventMap> extends EventTarget {
// 	addEventListener<K extends keyof EventMap>(
// 	  type: K,
// 	  callback: (
// 		event: EventMap[K] extends Event ? EventMap[K] : never,
// 	  ) => EventMap[K] extends Event ? void : never,
// 	  options?: boolean | AddEventListenerOptions,
// 	): void;

// 	addEventListener(
// 	  type: string,
// 	  callback: EventListenerOrEventListenerObject | null,
// 	  options?: EventListenerOptions | boolean,
// 	): void;
//   }

// export type DefaultEventType = {
// 	[key: string]: (...args: unknown[]) => unknown;
// };

// export type DefaultEventTypes = {
// 	open: () => CustomEvent;
// 	close: () => CustomEvent;
// 	error: <T extends Error>(error: T) => CustomEvent<T>;
// 	data: <T extends string>(data: T) => MessageEvent<T>;
// };

// export type EventType<
// 	EventTypes extends DefaultEventType = DefaultEventTypes,
// 	K extends keyof EventTypes = keyof EventTypes,
// > = Parameters<EventTypes[K]>[0];

// export type EventDetail<
// 	Events extends { [k: string]: (...args: unknown[]) => unknown },
// 	K extends keyof Events,
// > = Parameters<Events[K]>[0];

// export type EventListener<T extends keyof DefaultEventTypes> = (
// 	event: EventDetail<DefaultEventTypes, T>
// ) => void;
