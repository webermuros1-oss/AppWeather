/**
 * Sistema de modales (bottom-sheet) para el detalle de una hora o un día.
 * Inyecta sus estilos una sola vez. Los textos dinámicos se escapan.
 */

import { escapeHtml } from "../core/dom.js";
import { i18n } from "../i18n/index.js";
import { beaufort } from "../domain/wind.js";
import { meteoconImg, wireIconFallbacks } from "./icons.js";
import { windDirectionLabel, uvLabel } from "./format.js";

const MODAL_STYLES = `
.hmBackdrop{position:fixed;inset:0;background:rgba(0,0,0,.65);backdrop-filter:blur(6px);z-index:9000;animation:hmFadeIn .25s ease}
@keyframes hmFadeIn{from{opacity:0}to{opacity:1}}
.hmPanel{position:fixed;bottom:0;left:0;right:0;background:linear-gradient(160deg,#0a1628 0%,#1a2f4a 60%,#2d4a5c 100%);border-top:2px solid rgba(0,217,255,.4);border-radius:24px 24px 0 0;z-index:9001;max-height:92vh;overflow-y:auto;padding-bottom:env(safe-area-inset-bottom,16px);box-shadow:0 -8px 40px rgba(0,0,0,.6),0 -2px 10px rgba(0,217,255,.15);animation:hmSlideUp .32s cubic-bezier(.4,0,.2,1)}
@keyframes hmSlideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
.hmPanel.hmClosing{animation:hmSlideDown .28s cubic-bezier(.4,0,.2,1) forwards}
@keyframes hmSlideDown{from{transform:translateY(0)}to{transform:translateY(100%)}}
.hmDrag{width:40px;height:4px;background:rgba(255,255,255,.2);border-radius:2px;margin:14px auto 0;display:block}
.hmHeader{display:flex;align-items:center;justify-content:space-between;padding:14px 20px;border-bottom:1px solid rgba(0,217,255,.15);position:sticky;top:0;background:linear-gradient(160deg,#0a1628,#1a2f4a);z-index:1}
.hmTitleGroup{display:flex;align-items:center;gap:12px}
.hmTitleGroup h3{font-size:1.2rem;font-weight:700;color:#fff;margin-bottom:2px}
.hmTitleGroup p{font-size:.82rem;color:rgba(255,255,255,.5)}
.hmCloseBtn{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);border-radius:50%;color:#fff;width:34px;height:34px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:1rem;transition:background .2s;flex-shrink:0}
.hmCloseBtn:hover{background:rgba(255,71,87,.35)}
.hmTempRow{display:flex;align-items:center;justify-content:center;gap:24px;padding:18px 20px 14px;border-bottom:1px solid rgba(0,217,255,.1);flex-wrap:wrap}
.hmBigTemp{font-size:4rem;font-weight:700;color:#fff;line-height:1;text-shadow:0 0 24px rgba(0,217,255,.25)}
.hmSubTemps{display:flex;flex-direction:column;gap:6px}
.hmSubTemp{display:flex;flex-direction:column;gap:2px}
.hmSubTemp span:first-child{font-size:.7rem;color:rgba(255,255,255,.4);text-transform:uppercase;letter-spacing:.5px}
.hmSubTemp span:last-child{font-size:1.2rem;font-weight:600;color:#00ff88}
.hmSubTemp.cool span:last-child{color:#00d9ff}
.hmBar{margin:14px 20px;background:rgba(0,217,255,.06);border:1px solid rgba(0,217,255,.15);border-radius:14px;padding:12px 14px}
.hmBarTop{display:flex;justify-content:space-between;font-size:.8rem;color:rgba(255,255,255,.55);margin-bottom:8px}
.hmBarTop strong{color:#00d9ff}
.hmTrack{height:8px;background:rgba(255,255,255,.1);border-radius:4px;overflow:hidden}
.hmFill{height:100%;border-radius:4px;background:linear-gradient(90deg,#00d9ff,#00ff88);width:0%;transition:width .7s cubic-bezier(.4,0,.2,1)}
.hmGrid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;padding:14px 20px 22px}
.hmStat{background:rgba(0,217,255,.08);border:1px solid rgba(0,217,255,.14);border-radius:14px;padding:14px;display:flex;flex-direction:column;gap:4px;transition:background .2s}
.hmStat:hover{background:rgba(0,217,255,.15)}
.hmStatIcon{font-size:1.3rem}
.hmStatLabel{font-size:.7rem;color:rgba(255,255,255,.42);text-transform:uppercase;letter-spacing:.5px}
.hmStatValue{font-size:1.05rem;font-weight:700;color:#00ff88;text-shadow:0 0 8px rgba(0,255,136,.3)}
.hmStatSub{font-size:.7rem;color:rgba(255,255,255,.32)}
.hmSunRow{display:flex;align-items:center;justify-content:space-between;margin:0 20px 16px;background:rgba(255,180,0,.08);border:1px solid rgba(255,180,0,.2);border-radius:14px;padding:14px;gap:10px}
.hmSunItem{display:flex;flex-direction:column;align-items:center;gap:4px}
.hmSunItem span:first-child{font-size:1.4rem}
.hmSunItem span:last-child{font-size:.85rem;font-weight:600;color:#ffcc44}
.hmSunItem small{font-size:.7rem;color:rgba(255,255,255,.4)}
.hmSunDivider{flex:1;height:2px;background:linear-gradient(90deg,#ffcc44,rgba(255,204,68,0));border-radius:1px}
.forecastDay{cursor:pointer}
.forecastTapHint{font-size:.62rem;color:rgba(0,217,255,.45);flex-shrink:0}
.forecastDay:hover .forecastTapHint{color:rgba(0,255,136,.65)}
.hourItem{cursor:pointer}
.hourTapHint{font-size:.62rem;color:rgba(0,217,255,.45);border-top:1px solid rgba(0,217,255,.12);padding-top:5px;width:100%;text-align:center}
.hourItem:hover .hourTapHint{color:rgba(0,255,136,.65)}
@media(min-width:600px){
    .hmPanel{bottom:auto;top:50%;left:50%;transform:translate(-50%,-50%);border-radius:24px;border:1px solid rgba(0,217,255,.3);max-width:440px;width:calc(100% - 40px);animation:hmPopIn .3s cubic-bezier(.4,0,.2,1)}
    @keyframes hmPopIn{from{opacity:0;transform:translate(-50%,-48%) scale(.95)}to{opacity:1;transform:translate(-50%,-50%) scale(1)}}
    .hmPanel.hmClosing{animation:hmPopOut .25s cubic-bezier(.4,0,.2,1) forwards}
    @keyframes hmPopOut{from{opacity:1;transform:translate(-50%,-50%) scale(1)}to{opacity:0;transform:translate(-50%,-48%) scale(.95)}}
    .hmDrag{display:none}
}`;

function injectStyles() {
  if (document.getElementById("sharedModalStyles")) return;
  const s = document.createElement("style");
  s.id = "sharedModalStyles";
  s.textContent = MODAL_STYLES;
  document.head.appendChild(s);
}

function onEsc(e) {
  if (e.key === "Escape") closeModal();
}

export function closeModal(instant = false) {
  const panel = document.getElementById("hmPanel");
  const backdrop = document.getElementById("hmBackdrop");
  document.removeEventListener("keydown", onEsc);
  if (!panel) return;
  if (instant) {
    panel.remove();
    backdrop?.remove();
    document.body.style.overflow = "";
    return;
  }
  panel.classList.add("hmClosing");
  panel.addEventListener(
    "animationend",
    () => {
      panel.remove();
      backdrop?.remove();
      document.body.style.overflow = "";
    },
    { once: true },
  );
}

function buildModal(innerHTML) {
  injectStyles();
  closeModal(true);
  const backdrop = document.createElement("div");
  backdrop.className = "hmBackdrop";
  backdrop.id = "hmBackdrop";
  const panel = document.createElement("div");
  panel.className = "hmPanel";
  panel.id = "hmPanel";
  panel.innerHTML = innerHTML;
  document.body.appendChild(backdrop);
  document.body.appendChild(panel);
  document.body.style.overflow = "hidden";
  wireIconFallbacks(panel);
  panel.querySelector(".hmCloseBtn")?.addEventListener("click", () => closeModal());
  backdrop.addEventListener("click", () => closeModal());
  document.addEventListener("keydown", onEsc);
  return panel;
}

function animateFill(panel, pct) {
  requestAnimationFrame(() =>
    setTimeout(() => {
      const f = panel.querySelector("#hmFill");
      if (f) f.style.width = pct + "%";
    }, 60),
  );
}

/** Modal de detalle horario. */
export function openHourModal(d) {
  const t = (k) => i18n.t(k);
  const pct = d.precip > 0 ? Math.min(d.precip * 25, 100) : d.rainProb ?? 0;
  const vis = d.visibility != null ? (d.visibility / 1000).toFixed(1) : "—";
  const feels = d.feelsLike != null ? Math.round(d.feelsLike) : "—";
  const panel = buildModal(`
        <span class="hmDrag"></span>
        <div class="hmHeader">
            <div class="hmTitleGroup">
                ${meteoconImg(d.code ?? 0, d.isDay ?? 1, 48)}
                <div><h3>${escapeHtml(d.time)}</h3><p>${escapeHtml(d.description)}</p></div>
            </div>
            <button class="hmCloseBtn">✕</button>
        </div>
        <div class="hmTempRow">
            <span class="hmBigTemp">${Math.round(d.temp)}°C</span>
            <div class="hmSubTemps">
                <div class="hmSubTemp"><span>${t("modalFeelsLike")}</span><span>${feels}°C</span></div>
                <div class="hmSubTemp cool"><span>${t("modalHumidity")}</span><span>${d.humidity ?? "—"}%</span></div>
            </div>
        </div>
        <div class="hmBar">
            <div class="hmBarTop">
                <span>${d.precip > 0 ? `💧 ${t("modalPrecip")}: <strong>${d.precip} mm</strong>` : `💧 ${t("modalRainProb")}: <strong>${d.rainProb ?? 0}%</strong>`}</span>
            </div>
            <div class="hmTrack"><div class="hmFill" id="hmFill"></div></div>
        </div>
        <div class="hmGrid">
            <div class="hmStat"><span class="hmStatIcon">💨</span><span class="hmStatLabel">${t("modalWind")}</span><span class="hmStatValue">${Math.round(d.windSpeed ?? 0)} km/h</span><span class="hmStatSub">${windDirectionLabel(d.windDir)}</span></div>
            <div class="hmStat"><span class="hmStatIcon">👁️</span><span class="hmStatLabel">${t("modalVis")}</span><span class="hmStatValue">${vis} km</span></div>
            <div class="hmStat"><span class="hmStatIcon">☁️</span><span class="hmStatLabel">${t("modalClouds")}</span><span class="hmStatValue">${d.cloudCover ?? "—"}%</span></div>
            <div class="hmStat"><span class="hmStatIcon">🌡️</span><span class="hmStatLabel">${t("modalDew")}</span><span class="hmStatValue">${d.dewPoint != null ? d.dewPoint.toFixed(1) : "—"}°C</span></div>
            <div class="hmStat"><span class="hmStatIcon">🌧️</span><span class="hmStatLabel">${d.precip > 0 ? t("modalPrecip") : t("modalRainProb")}</span><span class="hmStatValue">${d.precip > 0 ? d.precip + " mm" : (d.rainProb ?? 0) + "%"}</span></div>
            <div class="hmStat"><span class="hmStatIcon">🌬️</span><span class="hmStatLabel">${t("modalBeaufort")}</span><span class="hmStatValue">${beaufort(d.windSpeed ?? 0)} Beaufort</span></div>
        </div>`);
  animateFill(panel, pct);
}

/** Modal de detalle diario. */
export function openDayModal(d) {
  const t = (k) => i18n.t(k);
  const rainPct = d.rainProb ?? 0;
  const precip = d.precipSum ?? 0;
  const snow = d.snowSum ?? 0;
  const panel = buildModal(`
        <span class="hmDrag"></span>
        <div class="hmHeader">
            <div class="hmTitleGroup">
                ${meteoconImg(d.code, 1, 48)}
                <div><h3>${escapeHtml(d.dayName)}</h3><p>${escapeHtml(d.label)} · ${escapeHtml(d.dateStr)}</p></div>
            </div>
            <button class="hmCloseBtn">✕</button>
        </div>
        <div class="hmTempRow">
            <div class="hmSubTemps" style="align-items:center;gap:10px;flex-direction:row">
                <div class="hmSubTemp" style="align-items:center">
                    <span style="font-size:.7rem;color:rgba(255,255,255,.4);text-transform:uppercase;letter-spacing:.5px">${t("modalMax")}</span>
                    <span style="font-size:2.8rem;font-weight:700;color:#ffb347;line-height:1">${Math.round(d.maxTemp)}°</span>
                </div>
                <span style="font-size:2rem;color:rgba(255,255,255,.2);font-weight:300">/</span>
                <div class="hmSubTemp" style="align-items:center">
                    <span style="font-size:.7rem;color:rgba(255,255,255,.4);text-transform:uppercase;letter-spacing:.5px">${t("modalMin")}</span>
                    <span style="font-size:2.8rem;font-weight:700;color:#00d9ff;line-height:1">${Math.round(d.minTemp)}°</span>
                </div>
            </div>
        </div>
        <div class="hmSunRow">
            <div class="hmSunItem"><span>🌅</span><span>${escapeHtml(d.sunrise)}</span><small>${t("modalSunrise")}</small></div>
            <div class="hmSunDivider"></div>
            <div class="hmSunItem"><span>☀️</span><span>${escapeHtml(d.sunshineH)} h</span><small>${t("modalSunReal")}</small></div>
            <div class="hmSunDivider" style="background:linear-gradient(90deg,rgba(255,204,68,0),#ffcc44)"></div>
            <div class="hmSunItem"><span>🌇</span><span>${escapeHtml(d.sunset)}</span><small>${t("modalSunset")}</small></div>
        </div>
        <div class="hmBar">
            <div class="hmBarTop">
                <span>💧 ${t("modalRainProb")}: <strong>${rainPct}%</strong></span>
                ${precip > 0 ? `<span style="color:#00ff88">${precip} mm total</span>` : ""}
            </div>
            <div class="hmTrack"><div class="hmFill" id="hmFill"></div></div>
        </div>
        <div class="hmGrid">
            <div class="hmStat"><span class="hmStatIcon">💨</span><span class="hmStatLabel">${t("modalWindMax")}</span><span class="hmStatValue">${Math.round(d.windMax ?? 0)} km/h</span><span class="hmStatSub">${windDirectionLabel(d.windDir)}</span></div>
            <div class="hmStat"><span class="hmStatIcon">💥</span><span class="hmStatLabel">${t("modalGustMax")}</span><span class="hmStatValue">${Math.round(d.gustMax ?? 0)} km/h</span></div>
            <div class="hmStat"><span class="hmStatIcon">☀️</span><span class="hmStatLabel">${t("modalUV")}</span><span class="hmStatValue">${d.uvMax ?? "—"}</span><span class="hmStatSub">${uvLabel(d.uvMax)}</span></div>
            <div class="hmStat"><span class="hmStatIcon">🌤️</span><span class="hmStatLabel">${t("modalDaylight")}</span><span class="hmStatValue">${escapeHtml(d.daylightH)} h</span></div>
            <div class="hmStat"><span class="hmStatIcon">🌧️</span><span class="hmStatLabel">${t("modalRainTotal")}</span><span class="hmStatValue">${precip > 0 ? precip + " mm" : t("modalNoRain")}</span></div>
            ${
              snow > 0
                ? `<div class="hmStat"><span class="hmStatIcon">❄️</span><span class="hmStatLabel">${t("modalSnow")}</span><span class="hmStatValue">${snow} cm</span></div>`
                : `<div class="hmStat"><span class="hmStatIcon">🌬️</span><span class="hmStatLabel">${t("modalWindDir")}</span><span class="hmStatValue">${windDirectionLabel(d.windDir)}</span><span class="hmStatSub">${Math.round(d.windDir ?? 0)}°</span></div>`
            }
        </div>`);
  animateFill(panel, rainPct);
}
