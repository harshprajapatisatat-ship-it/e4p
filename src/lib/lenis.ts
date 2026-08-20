"use client";

import type Lenis from "lenis";

/**
 * The one live Lenis instance, so code outside SmoothScroll can reach it.
 *
 * SmoothScroll owns the instance and lives in the root layout, which Next.js
 * never remounts — so there is only ever one, and a module-level slot is enough.
 * It is deliberately NOT a context: the consumers are effects reacting to UI
 * state (a menu opening), not renders, and a context would force every consumer
 * to re-render whenever the instance changed.
 *
 * This module has no `"use client"` consumers on the server side. Read the
 * instance through `getLenis()` rather than importing the slot, so callers
 * always see the current value instead of a stale binding.
 */
let instance: Lenis | null = null;

/** Called by SmoothScroll on setup, and again with `null` on teardown. */
export function registerLenis(next: Lenis | null) {
  instance = next;
}

/** The live instance, or `null` under reduced motion where Lenis never starts. */
export function getLenis() {
  return instance;
}

/**
 * Freeze or release page scrolling — for full-screen overlays such as the
 * mobile menu.
 *
 * Both halves are needed, and neither is redundant:
 *
 *   - `lenis.stop()` is what actually holds when smooth scrolling is running.
 *     Lenis reads wheel/touch events itself and moves the window
 *     programmatically, so it sails straight past a CSS `overflow` that only
 *     stops the browser's own scrolling. Without this the page slides by
 *     underneath an open overlay. (Stopping also adds `lenis-stopped` to
 *     <html>, which globals.css already backs with `overflow: hidden`.)
 *
 *   - `body { overflow: hidden }` is the reduced-motion path. There Lenis is
 *     never constructed, `getLenis()` is null, and native scrolling is all
 *     there is to stop.
 */
export function setScrollLocked(locked: boolean) {
  const lenis = getLenis();
  if (locked) lenis?.stop();
  else lenis?.start();

  document.body.style.overflow = locked ? "hidden" : "";
}
