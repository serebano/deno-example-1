"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logHandler = exports.color = exports.Color = void 0;
class Color {
}
exports.Color = Color;
Object.defineProperty(Color, "RED", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: "\x1b[0;31m"
});
Object.defineProperty(Color, "GREEN", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: "\x1b[0;32m"
});
Object.defineProperty(Color, "YELLOW", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: "\x1b[0;33m"
});
Object.defineProperty(Color, "BLUE", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: "\x1b[0;34m"
});
Object.defineProperty(Color, "RESET", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: "\x1b[0m"
});
exports.color = {
    red: (...arg) => `${Color.RED}${arg.join(", ")}${Color.RESET}`,
    green: (...arg) => `${Color.GREEN}${arg.join(", ")}${Color.RESET}`,
    yellow: (...arg) => `${Color.YELLOW}${arg.join(", ")}${Color.RESET}`,
    blue: (...arg) => `${Color.BLUE}${arg.join(", ")}${Color.RESET}`,
};
function logHandler(e) {
    if (e.type === "any") {
        const anyev = Object.assign({}, e.data);
        anyev.type = e.data.type;
        anyev.target = e.target;
        e = anyev;
    }
    const data = e.error || e.data || e.detail || "";
    const eventColor = e.error ? "red" : "green";
    const icon = e.target.name.includes("Incoming")
        ? exports.color.green("⇓⇓⇓")
        : e.target.name.includes("Outgoing")
            ? exports.color.yellow("⇑⇑⇑")
            : "";
    console.log(` ${icon} ${(e.target?.name)} id(${exports.color.yellow(e.target?.id)}) on(${exports.color[eventColor](e.type)})`, data);
}
exports.logHandler = logHandler;
