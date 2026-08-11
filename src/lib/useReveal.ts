"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "./gsap";

type RevealOptions = {
  /** selector(s) of children to stagger-reveal. Defaults to [data-reveal] */
  selector?: string;
  y?: number;
  duration?: number;
  stagger?: number;
  start?: string;
  once?: boolean;
};

/**
 * Attaches a smooth scroll-reveal to children of the returned ref.
 * Elements get a fade + rise with a soft stagger.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(
  options: RevealOptions = {}
) {
  const ref = useRef<T>(null);
  const {
    selector = "[data-reveal]",
    y = 36,
    duration = 1.05,
    stagger = 0.12,
    start = "top 82%",
    once = true,
  } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const targets = el.querySelectorAll(selector);
    if (!targets.length) return;

    const ctx = gsap.context(() => {
      gsap.set(targets, { opacity: 0, y });
      gsap.to(targets, {
        opacity: 1,
        y: 0,
        duration,
        stagger,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start,
          once,
        },
      });
    }, el);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return ref;
}

export { gsap, ScrollTrigger };
