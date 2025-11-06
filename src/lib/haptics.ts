// Simple haptics helper for mobile browsers (mostly Android Chrome)
export function supportsVibration(): boolean {
  try {
    const nav = navigator as any;
    return typeof nav.vibrate === "function";
  } catch {
    return false;
  }
}

export function isLikelyMobile(): boolean {
  try {
    const ua = navigator.userAgent || "";
    const hasTouch = (navigator.maxTouchPoints || 0) > 0;
    return hasTouch && /Android|Mobi|iPhone|iPad|iPod/i.test(ua);
  } catch {
    return false;
  }
}

let lastVibrateAt = 0;
export function vibrateLight(durationMs = 12): boolean {
  try {
    if (!isLikelyMobile()) return false;
    const now = Date.now();
    if (now - lastVibrateAt < 80) return false; // evita vibraciones repetidas
    const nav = navigator as any;
    if (typeof nav.vibrate === "function") {
      const ok = !!nav.vibrate(durationMs);
      if (ok) lastVibrateAt = now;
      return ok;
    }
  } catch {}
  return false;
}

export function enableGlobalButtonHaptics() {
  const handler = (e: PointerEvent) => {
    // sólo táctil/pen, no mouse
    if (e.pointerType && e.pointerType !== "touch" && e.pointerType !== "pen") return;
    const target = e.target as HTMLElement | null;
    if (!target) return;
    const el = target.closest("button, a[href]") as HTMLElement | null;
    if (!el) return;
    // disabled
    if (el.tagName === "BUTTON") {
      const btn = el as HTMLButtonElement;
      if (btn.disabled) return;
    } else if (el.tagName === "A") {
      const anchor = el as HTMLAnchorElement;
      const ariaDisabled = anchor.getAttribute("aria-disabled") === "true";
      const classDisabled = anchor.classList.contains("disabled");
      if (ariaDisabled || classDisabled) return;
    }
    // opt-out con data-haptic="off"
    if ((el as any).dataset?.haptic === "off") return;
    vibrateLight(12);
  };
  document.addEventListener("pointerdown", handler, { passive: true } as any);
  return () => document.removeEventListener("pointerdown", handler as any);
}