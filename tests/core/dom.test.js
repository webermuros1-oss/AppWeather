import { describe, it, expect } from "vitest";
import { escapeHtml, safeHtml, raw, setText } from "../../src/core/dom.js";

describe("escapeHtml", () => {
  it("neutraliza caracteres peligrosos (XSS)", () => {
    expect(escapeHtml('<script>alert(1)</script>')).toBe(
      "&lt;script&gt;alert(1)&lt;/script&gt;",
    );
    expect(escapeHtml('"\'`&<>')).toBe("&quot;&#39;&#96;&amp;&lt;&gt;");
  });

  it("devuelve cadena vacía para null/undefined", () => {
    expect(escapeHtml(null)).toBe("");
    expect(escapeHtml(undefined)).toBe("");
  });
});

describe("safeHtml", () => {
  it("escapa las interpolaciones por defecto", () => {
    const name = '<img src=x onerror=alert(1)>';
    const html = safeHtml`<p>${name}</p>`;
    expect(html).toBe("<p>&lt;img src=x onerror=alert(1)&gt;</p>");
  });

  it("permite HTML confiable con raw()", () => {
    const html = safeHtml`<div>${raw("<b>ok</b>")}</div>`;
    expect(html).toBe("<div><b>ok</b></div>");
  });
});

describe("setText", () => {
  it("asigna textContent de forma segura", () => {
    const el = document.createElement("div");
    setText(el, "<b>hola</b>");
    expect(el.textContent).toBe("<b>hola</b>");
    expect(el.querySelector("b")).toBeNull();
  });

  it("no falla con elemento nulo", () => {
    expect(() => setText(null, "x")).not.toThrow();
  });
});
