import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";

export interface RegistryServer {
  readonly url: string;
  close(): Promise<void>;
}

export type RegistryHandler = (req: IncomingMessage, res: ServerResponse) => void;

export async function startRegistryServer(handler: RegistryHandler): Promise<RegistryServer> {
  return await new Promise((resolve) => {
    const s: Server = createServer(handler);
    s.listen(0, "127.0.0.1", () => {
      const addr = s.address();
      if (addr === null || typeof addr === "string") {
        throw new Error("unexpected server address");
      }
      const url = `http://127.0.0.1:${addr.port}/registry.json`;
      resolve({
        url,
        close: () =>
          new Promise<void>((r) => {
            s.close(() => r());
          }),
      });
    });
  });
}

export function jsonRegistry(body: unknown): RegistryHandler {
  return (_req, res) => {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify(body));
  };
}

export function statusOnly(status: number, body = ""): RegistryHandler {
  return (_req, res) => {
    res.writeHead(status, { "content-type": "text/plain" });
    res.end(body);
  };
}
