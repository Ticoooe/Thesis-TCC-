import { writable } from "svelte/store";

export const ALERT_TYPES = Object.freeze({
  DANGER: "DANGER",
  INFO: "INFO",
  SUCCESS: "SUCCESS",
});

export const alertMessage = writable("");
export const alertType = writable(ALERT_TYPES.INFO);

/**
 * Exibe um alerta e, se resetTime for informado, limpa após esse período (ms).
 * @param {string} message
 * @param {'DANGER'|'INFO'|'SUCCESS'} [type=ALERT_TYPES.INFO]
 * @param {number} [resetTime] - tempo em ms para limpar o alerta
 */
let clearTimer;
export const displayAlert = (message, type = ALERT_TYPES.INFO, resetTime) => {
  // cancela um timer antigo para evitar “pisca-pisca”
  if (clearTimer) clearTimeout(clearTimer);

  alertMessage.set(message ?? "");
  alertType.set(type);

  if (resetTime && Number.isFinite(resetTime)) {
    clearTimer = setTimeout(() => {
      alertMessage.set("");
      alertType.set(ALERT_TYPES.INFO);
    }, resetTime);
  }
};
