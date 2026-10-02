import { describe, it, expect, beforeEach } from "vitest";
import { i18n } from "../../src/i18n/index.js";

describe("i18n", () => {
  beforeEach(() => {
    i18n.lang = "es";
  });

  it("traduce en el idioma activo", () => {
    expect(i18n.t("today")).toBe("Hoy");
    i18n.lang = "en";
    expect(i18n.t("today")).toBe("Today");
  });

  it("cae a español y luego a la propia clave si falta", () => {
    i18n.lang = "en";
    expect(i18n.t("__no_existe__")).toBe("__no_existe__");
  });

  it("ignora códigos de idioma desconocidos", () => {
    i18n.lang = "en";
    i18n.lang = "zz"; // inválido → se mantiene en
    expect(i18n.lang).toBe("en");
  });

  it("traduce descripciones WMO con respaldo", () => {
    expect(i18n.wmo(0)).toBe("Despejado");
    expect(i18n.wmo(99999)).toBe("—");
  });

  it("persiste el idioma elegido", () => {
    i18n.lang = "fr";
    expect(localStorage.getItem("pw_lang")).toBe("fr");
  });

  it("expone días, meses e idiomas disponibles", () => {
    expect(i18n.days()).toHaveLength(7);
    expect(i18n.months()).toHaveLength(12);
    expect(i18n.availableLangs().map((l) => l.code)).toContain("es");
  });
});
