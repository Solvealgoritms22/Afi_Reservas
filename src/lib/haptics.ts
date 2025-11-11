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

let audioCtx: AudioContext | null = null;
let lastSoundAt = 0;
function getAudioContext(): AudioContext | null {
  try {
    const Ctor = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!Ctor) return null;
    if (!audioCtx) audioCtx = new Ctor();
    return audioCtx;
  } catch {
    return null;
  }
}

function playClickSound(durationMs = 40, frequency = 1200, volume = 0.02): boolean {
  try {
    // sólo en móvil y rate-limit
    if (!isLikelyMobile()) return false;
    const now = Date.now();
    if (now - lastSoundAt < 80) return false;
    const ctx = getAudioContext();
    if (!ctx) return false;
    lastSoundAt = now;
    // preparar nodos
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = frequency;
    osc.connect(gain);
    gain.connect(ctx.destination);
    const t0 = ctx.currentTime;
    // envolvente corta
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(volume, t0 + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + durationMs / 1000);
    osc.start(t0);
    osc.stop(t0 + durationMs / 1000);
    // iOS requiere resume dentro de gesto
    // no esperamos la promesa, pero intentamos reanudar
    (ctx as any).resume?.();
    return true;
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
    // vibra si es posible; si no, aplica un leve "bump" y sonido de click
    const didVibrate = vibrateLight(12);
    if (!didVibrate) {
      bumpElement(el);
      playClickSound(40, 1200, 0.02);
    }
  };
  document.addEventListener("pointerdown", handler, { passive: true } as any);
  return () => document.removeEventListener("pointerdown", handler as any);
}