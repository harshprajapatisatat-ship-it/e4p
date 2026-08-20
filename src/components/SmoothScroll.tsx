"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { registerLenis } from "@/lib/lenis";

// useLayoutEffect warns during SSR ("does nothing on the server"); fall back
// to useEffect there. Matters here specifically because layout effects for
// every component in a commit run before ANY passive (regular) effects in
// that same commit — see the comment below on why that ordering is the
// actual fix, not just the scroll reset itself.
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/** Site-wide inertial/eased scrolling. Renders nothing — just wires Lenis
 * into GSAP's own ticker so ScrollTrigger-driven animations (Header,
 * useReveal, the ERPNext Consulting pinned storytelling, etc.) stay perfectly in
 * sync with it instead of running off two competing rAF loops. */
export default function SmoothScroll() {
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    // `lerp` rather than `duration` + `easing`. With a duration, every wheel
    // event starts its own 1.1s tween, so a run of events queues tweens behind
    // each other — the scroll keeps travelling after the wheel stops and reads
    // as lag. `lerp` eases toward the target continuously instead: it reacts on
    // the first frame and settles smoothly, and because Lenis is driven off
    // GSAP's ticker below it stays frame-rate independent on 120Hz displays.
    const lenis = new Lenis({
      lerp: 0.09,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      // Touch scrolling is already smooth natively, and hijacking it costs
      // responsiveness on the pinned sections.
      syncTouch: false,
      // Same-page `#hash` links. Without this Lenis keeps animating toward its
      // own target and simply undoes the browser's native jump, so an anchor
      // click appears to do nothing. The offset clears the fixed header —
      // Lenis does not read `scroll-margin-top`, so the elements keep their
      // `scroll-mt-*` classes for the reduced-motion path where Lenis is off
      // and the browser does the scrolling itself.
      anchors: { offset: -96 },
    });
    lenisRef.current = lenis;
    registerLenis(lenis);

    lenis.on("scroll", ScrollTrigger.update);

    // ── Keeping the two measurement caches in agreement ──────────────────
    // ScrollTrigger and Lenis each cache their own idea of how tall the
    // document is, and neither tells the other when it re-measures.
    //
    // `ScrollTrigger.refresh()` recomputes every trigger's start/end against
    // the current page height, but Lenis carries on clamping scroll to the
    // limit it measured at construction. Once those two disagree — after any
    // late layout change — the page stops short of its real bottom and no
    // amount of scrolling gets past it. It looks exactly like a stuck page,
    // and only a reload clears it, because a reload is the one thing that
    // makes Lenis measure again. Re-measuring it on every refresh is the fix.
    const resyncLenis = () => lenis.resize();
    ScrollTrigger.addEventListener("refresh", resyncLenis);

    // The other half of the same problem: the things that change the page
    // height arrive AFTER both caches were taken. The hero carries a video and
    // a full-bleed still, and Onest swaps in once the webfont lands — each of
    // those reflows the page well past first paint. One refresh after they have
    // actually settled is what stops the page booting straight into the stale
    // state described above.
    const settle = () => ScrollTrigger.refresh();
    window.addEventListener("load", settle);
    if (document.fonts) document.fonts.ready.then(settle);

    // Mobile browsers fire a resize every time the URL bar hides or shows.
    // Without this, each one triggers a full ScrollTrigger refresh mid-scroll,
    // which re-measures every pin on the page and visibly stutters.
    ScrollTrigger.config({ ignoreMobileResize: true });

    const tick = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      ScrollTrigger.removeEventListener("refresh", resyncLenis);
      window.removeEventListener("load", settle);
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
      registerLenis(null);
    };
  }, []);

  // This one instance persists across every route change (it lives in the
  // root layout, which Next.js never remounts between pages) — so on its
  // own it doesn't know a navigation happened, and its internal scroll
  // state stays wherever it was on the previous page.
  //
  // The reset alone (plain useEffect) wasn't enough: the new page's own
  // pinned ScrollTrigger sections (e.g. the climbing-stack "What We Offer"
  // cards) set themselves up in THEIR OWN useEffect, and whichever one
  // happens to run first wins — if the pin's effect ran before this reset,
  // it measured its "am I already past my trigger point?" check against
  // the old page's leftover scroll position, and landed the page already
  // mid-pin. React guarantees every layout effect in a commit runs before
  // any passive (regular) effect in that same commit, regardless of
  // component tree position — switching this to useLayoutEffect is what
  // actually forces the scroll to hit 0 first, every time.
  useIsomorphicLayoutEffect(() => {
    lenisRef.current?.scrollTo(0, { immediate: true });
    window.scrollTo(0, 0);
    ScrollTrigger.refresh();
  }, [pathname]);

  return null;
}
