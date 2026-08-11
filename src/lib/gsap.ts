"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";

// Register plugins once on the client.
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);
}

export { gsap, ScrollTrigger, MotionPathPlugin };
