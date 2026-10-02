import { describe, it, expect, vi, afterEach } from "vitest";
import { buildUrl, fetchJson, HttpError } from "../../src/core/http.js";

describe("buildUrl", () => {
  it("construye query params y omite null/undefined", () => {
    const url = buildUrl("https://api.test/x", { a: 1, b: "dos", c: null, d: undefined });
    const parsed = new URL(url);
    expect(parsed.searchParams.get("a")).toBe("1");
    expect(parsed.searchParams.get("b")).toBe("dos");
    expect(parsed.searchParams.has("c")).toBe(false);
    expect(parsed.searchParams.has("d")).toBe(false);
  });

  it("codifica caracteres especiales", () => {
    const url = buildUrl("https://api.test/x", { name: "A Coruña & co" });
    expect(url).toContain("name=A+Coru%C3%B1a+%26+co");
  });
});

describe("fetchJson", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("devuelve el JSON cuando la respuesta es ok", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: true, status: 200, json: async () => ({ hello: "world" }) })));
    await expect(fetchJson("https://api.test/ok")).resolves.toEqual({ hello: "world" });
  });

  it("lanza HttpError con status en respuesta no-ok", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: false, status: 500, json: async () => ({}) })));
    await expect(fetchJson("https://api.test/fail")).rejects.toMatchObject({
      name: "HttpError",
      status: 500,
    });
  });

  it("envuelve errores de red en HttpError", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => {
      throw new Error("network down");
    }));
    const err = await fetchJson("https://api.test/net").catch((e) => e);
    expect(err).toBeInstanceOf(HttpError);
  });
});
