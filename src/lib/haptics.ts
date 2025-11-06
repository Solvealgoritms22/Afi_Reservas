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

function isIOS(): boolean {
  try {
    const ua = navigator.userAgent || "";
    return /iPhone|iPad|iPod/i.test(ua);
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

function bumpElement(el: HTMLElement, durationMs = 90, scale = 0.985) {
  try {
    const originalTransition = el.style.transition;
    const originalTransform = el.style.transform;
    el.style.willChange = "transform";
    el.style.transition = `transform ${durationMs}ms ease-out`;
    // aplica un leve scale, preservando transform existente
    const hasTransform = originalTransform && originalTransform.length > 0;
    el.style.transform = hasTransform ? `${originalTransform} scale(${scale})` : `scale(${scale})`;
    setTimeout(() => {
      el.style.transform = originalTransform;
      el.style.transition = originalTransition;
    }, durationMs);
  } catch {}
}

export function enableGlobalButtonHaptics() {
  const handler = (e: PointerEvent) => {
    // sólo táctil/pen, no mouse
    if (e.pointerType && e.pointerType !== "touch" && e.pointerType !== "pen") return;
    const target = e.target as HTMLElement | null;
    if (!target) return;
    const el = target.closest("button, a[href], [role='button'], [aria-pressed]") as HTMLElement | null;
    if (!el) return;
    // disabled
    const ariaDisabled = el.getAttribute("aria-disabled") === "true";
    const dataDisabled = (el as any).dataset?.disabled === "true";
    const classDisabled = el.classList.contains("disabled");
    if (el.tagName === "BUTTON") {
      const btn = el as HTMLButtonElement;
      if (btn.disabled || ariaDisabled || dataDisabled || classDisabled) return;
    } else if (el.tagName === "A") {
      if (ariaDisabled || dataDisabled || classDisabled) return;
    } else {
      // elementos con role/aria
      if (ariaDisabled || dataDisabled || classDisabled) return;
    }
    // opt-out con data-haptic="off"
    if ((el as any).dataset?.haptic === "off") return;
    // vibra si es posible; si no, aplica un leve "bump" (fallback visual útil en iOS)
    if (!vibrateLight(12)) bumpElement(el);
  };
  document.addEventListener("pointerdown", handler, { passive: true } as any);
  return () => document.removeEventListener("pointerdown", handler as any);
}