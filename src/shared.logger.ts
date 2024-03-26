import { IOEvent } from "./event.ts";

export class Color {
  static RED = "\x1b[0;31m";
  static GREEN = "\x1b[0;32m";
  static YELLOW = "\x1b[0;33m";
  static BLUE = "\x1b[0;34m";
  static RESET = "\x1b[0m";
}

export const color = {
  red: (...arg: unknown[]) => `${Color.RED}${arg.join(", ")}${Color.RESET}`,
  green: (...arg: unknown[]) => `${Color.GREEN}${arg.join(", ")}${Color.RESET}`,
  yellow: (...arg: unknown[]) =>
    `${Color.YELLOW}${arg.join(", ")}${Color.RESET}`,
  blue: (...arg: unknown[]) => `${Color.BLUE}${arg.join(", ")}${Color.RESET}`,
};

export function logHandler<T extends IOEvent>(e: T) {
  if (e.type === "any") {
    const anyev = Object.assign({}, e.data);
    anyev.type = e.data.type;
    anyev.target = e.target;
    e = anyev;
  }
  const data = e.error || e.data || e.detail || "";

  const eventColor = e.error ? "red" : "green";
  const icon = e.target.name.includes("Incoming")
    ? color.green("⇓⇓⇓")
    : e.target.name.includes("Outgoing")
    ? color.yellow("⇑⇑⇑")
    : "";
  console.log(
    ` ${icon} ${(e.target?.name)} id(${color.yellow(e.target?.id)}) on(${
      color[eventColor](e.type)
    })`,
    data,
  );
}
