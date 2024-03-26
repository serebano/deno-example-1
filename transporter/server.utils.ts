import { transpile } from "https://deno.land/x/emit@0.38.2/mod.ts";

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

export function defineHandler(handler: Deno.ServeHandler) {
  return handler;
}

export async function serveStatic(req: Request) {
  const url = new URL(req.url);

  console.log(req.method, url.pathname);
  if (url.pathname.endsWith(".ico")) {
    return new Response(null, { status: 404 });
  } else if (url.pathname.endsWith(".js")) {
    const modUrl = new URL(".." + url.pathname, import.meta.url);
    return new Response(await Deno.readFile(modUrl), {
      status: 200,
      headers: {
        "cache-control": "no-store",
        "content-type": "application/javascript",
      },
    });
  } else if (url.pathname.endsWith(".ts")) {
    const modUrl = new URL(".." + url.pathname, import.meta.url);
    const result = await transpile(modUrl, { cacheRoot: "./.cache" });
    return new Response(result.get(modUrl.toString()), {
      status: 200,
      headers: {
        "cache-control": "no-store",
        "content-type": "application/javascript",
      },
    });
  } else {
    try {
      const path = new URL(".." + url.pathname, import.meta.url);
      const stat = await Deno.stat(path);
      const body = stat.isFile
        ? await Deno.readFile(path)
        : stat.isDirectory
        ? await Deno.readFile(
          new URL(
            (".." + url.pathname + "/index.html").replace("//", "/"),
            import.meta.url,
          ),
        )
        : undefined;

      if (body) {
        return new Response(body, {
          status: 200,
          headers: {
            "cache-control": "no-store",
          },
        });
      }
    } catch (_e) {
      return;
    }
  }
}
