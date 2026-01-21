export function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function resetAnimation(el: HTMLElement | null) {
  if (!el) return;
  el.style.animation = "none";
  void el.offsetHeight; 
  el.style.animation = "";
}