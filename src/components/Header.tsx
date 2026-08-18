"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Plus,
  X,
  LayoutGrid,
  GitBranch,
  ShieldCheck,
  FileSignature,
  Warehouse,
  Gauge,
  ClipboardCheck,
  Boxes,
  Database,
  Code2,
  Workflow,
  Headphones,
  Scale,
  BookOpen,
  Factory,
  Pill,
  FlaskConical,
} from "lucide-react";
import { gsap } from "@/lib/gsap";
import { ROUTES, CTA_LABELS } from "@/lib/routes";
import Logo from "./Logo";

/**
 * Header for the ERPNext-for-Pharma site.
 *
 * Structure, dimensions and behaviour are carried over from the Manufacturing
 * site's Header verbatim: fixed bar, 72px tall, `max-w-[1320px] px-5 lg:px-8`
 * container, absolutely-centred nav, one orange CTA on the right, GSAP-morphed
 * mega-menu panel, and a full-screen slide-down mobile menu with accordions.
 *
 * Only the menu CONTENT is pharma-facing, and the CTA is the site's primary
 * conversion — Book a Free Demo.
 */

type MenuItem = {
  icon: React.ElementType;
  title: string;
  desc: string;
  badge?: string;
  href?: string;
};

type Column = { heading?: string; items: MenuItem[] };

type MenuData = {
  label: string;
  description?: string;
  columns: Column[];
  cta: string;
  ctaHref?: string;
  href?: string;
};

const MENUS: Record<string, MenuData> = {
  Solutions: {
    label: "Solutions",
    href: "/solutions",
    cta: "Explore all pharma solutions",
    ctaHref: "/#challenges",
    columns: [
      {
        heading: "Pharma Operations",
        items: [
          { icon: GitBranch, title: "Batch Traceability", desc: "", href: "/#challenges" },
          { icon: ShieldCheck, title: "Quality Control", desc: "", href: "/#challenges" },
          { icon: FileSignature, title: "Batch Documentation", desc: "", href: "/#challenges" },
          { icon: Warehouse, title: "Inventory & Expiry", desc: "", href: "/#challenges" },
        ],
      },
      {
        heading: "Compliance",
        items: [
          { icon: ClipboardCheck, title: "Audit Readiness", desc: "", href: "/#challenges" },
          { icon: Gauge, title: "Equipment Validation", desc: "", href: "/#challenges" },
          { icon: Workflow, title: "Change Control & CAPA", desc: "", href: "/#challenges" },
          { icon: Scale, title: "Schedule M Readiness", desc: "", href: "/#schedule-m" },
        ],
      },
      {
        heading: "ERPNext Services",
        items: [
          { icon: Boxes, title: "ERPNext Implementation", desc: "", href: "/solutions" },
          { icon: Database, title: "ERPNext Consulting", desc: "", href: "/solutions" },
          { icon: Code2, title: "Customization & Development", desc: "", href: "/solutions" },
          { icon: Headphones, title: "Support & Maintenance", desc: "", href: "/solutions" },
        ],
      },
    ],
  },
  Industries: {
    label: "Industries",
    description:
      "ERPNext built around how regulated and discrete manufacturers actually run, industry by industry.",
    cta: "Talk to us about your industry",
    ctaHref: "/contact#demo",
    columns: [
      {
        items: [
          { icon: Pill, title: "Pharmaceutical", desc: "", href: "/", badge: "THIS SITE" },
          { icon: Factory, title: "Manufacturing", desc: "", href: "/industries" },
          { icon: FlaskConical, title: "API & Bulk Drugs", desc: "", href: "/industries" },
        ],
      },
      {
        items: [
          { icon: Boxes, title: "Nutraceuticals", desc: "", href: "/industries" },
          { icon: ShieldCheck, title: "Medical Devices", desc: "", href: "/industries" },
          { icon: Warehouse, title: "Contract Manufacturing", desc: "", href: "/industries" },
        ],
      },
    ],
  },
  Resources: {
    label: "Resources",
    description:
      "Guides and references to help pharma teams build a process that documents itself.",
    cta: "Get the free compliance guide",
    ctaHref: ROUTES.guide,
    columns: [
      {
        items: [
          {
            icon: BookOpen,
            title: "Pharma Compliance Guide",
            desc: "",
            href: ROUTES.guide,
            badge: "FREE",
          },
          { icon: Scale, title: "Schedule M Overview", desc: "", href: "/#schedule-m" },
          { icon: GitBranch, title: "Traceability Explained", desc: "", href: "/#challenges" },
        ],
      },
      {
        items: [
          { icon: ClipboardCheck, title: "Audit Readiness Checklist", desc: "", href: "/resources" },
          { icon: FileSignature, title: "Batch Record Basics", desc: "", href: "/resources" },
          { icon: Database, title: "Blogs", desc: "", href: "/blogs" },
        ],
      },
    ],
  },
};

/**
 * Labels that open a mega-menu panel, in nav order.
 *
 * Empty: the nav is stripped back to plain links, matching the Manufacturing
 * site, which ships it empty too. Solutions / Industries / Resources are
 * switched off here rather than deleted — the `MENUS` data below and the whole
 * mega-menu panel are left intact and dormant, so putting any of them back is a
 * matter of naming it in this array again. Both the desktop nav and the mobile
 * accordion map over this, so an empty array simply renders neither.
 */
const NAV_WITH_MENU: string[] = [];

/**
 * Plain nav links — no mega-menu panel, just destinations.
 *
 * The on-page anchors are rooted at `/` rather than written bare, so they still
 * resolve from /contact or /blogs instead of doing nothing there.
 */
const NAV_LINKS: { label: string; href: string }[] = [
  { label: "Pharma", href: "/#challenges" },
  { label: "Contact", href: "/contact" },
];

/**
 * Primary conversion, in the bar and at the foot of the mobile menu. Read from
 * `routes.ts` rather than written out here — this was the one "Book a Free
 * Demo" on the site with a hardcoded destination, so it silently kept pointing
 * at the old one when the CTA moved.
 */
const CTA = { label: CTA_LABELS.joinWebinar, href: ROUTES.demo };

/**
 * Secondary conversion, sat beside the CTA. Rendered as a plain link rather
 * than a second button so the bar keeps exactly one filled control and the
 * hierarchy stays readable — the webinar is the primary conversion, the guide
 * is the softer alternative for anyone not ready to book a seat.
 *
 * The two swap roles when nothing is scheduled: see `hasSessions` below.
 */
const GUIDE_CTA = { label: CTA_LABELS.guide, href: ROUTES.guide };

export default function Header({
  hasSessions = true,
}: {
  /**
   * Whether ERPNext currently has a bookable pharma session. Resolved by
   * SiteHeader, which is what every page mounts.
   *
   * Defaults to true so the bar renders its normal state if a caller forgets —
   * the webinar page handles an empty list on its own either way.
   */
  hasSessions?: boolean;
}) {
  const pathname = usePathname();

  /**
   * With no session on offer, "Join Webinar" would send people to a page where
   * registration is disabled, so the guide takes the primary slot instead and
   * the webinar link is simply not rendered. Nothing is removed: add a slot in
   * ERPNext and the bar returns to its two-action layout on the next
   * revalidation, with no deploy.
   */
  const primary = hasSessions ? CTA : GUIDE_CTA;
  const secondary = hasSessions ? GUIDE_CTA : null;
  const [active, setActive] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);

  const stageRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeRef = useRef<string | null>(null);
  const prevSize = useRef<{ w: number; h: number } | null>(null);
  const firstRun = useRef(true);

  // `open()` reads the current menu from a ref so it can stay a stable callback.
  // Mirrored in an effect rather than during render — hover happens long after
  // commit, so the ref is always up to date by the time it is read.
  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  // Lock body scroll while the mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const open = useCallback((label: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    const current = activeRef.current;
    if (label === current) return;

    if (current == null) {
      prevSize.current = null;
      setActive(label);
    } else {
      const inner = innerRef.current;
      const stage = stageRef.current;
      if (inner && stage) {
        prevSize.current = { w: stage.offsetWidth, h: stage.offsetHeight };
        gsap.killTweensOf(inner);
        gsap.to(inner, {
          x: 18,
          scale: 0.96,
          opacity: 0,
          duration: 0.1,
          ease: "power3.in",
          onComplete: () => setActive(label),
        });
      } else {
        setActive(label);
      }
    }
  }, []);

  const scheduleClose = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setActive(null), 130);
  }, []);

  // Clear the pending close timer on unmount so it cannot fire into a
  // torn-down component.
  useEffect(
    () => () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    },
    []
  );

  useEffect(() => {
    const stage = stageRef.current;
    const inner = innerRef.current;
    if (!stage || !inner) return;

    if (firstRun.current) {
      firstRun.current = false;
      return;
    }

    if (active == null) {
      gsap.killTweensOf([stage, inner]);
      gsap.to(inner, { opacity: 0, scale: 0.97, duration: 0.2, ease: "power3.in" });
      gsap.to(stage, { height: 0, autoAlpha: 0, duration: 0.4, ease: "expo.inOut" });
      prevSize.current = null;
      return;
    }

    const targetW = inner.offsetWidth;
    const targetH = inner.offsetHeight;
    const from = prevSize.current;

    gsap.killTweensOf(stage);

    if (from == null) {
      gsap.set(stage, { width: targetW, autoAlpha: 1, overflow: "hidden" });
      gsap.fromTo(stage, { height: 0 }, { height: targetH, duration: 0.3, ease: "power3.out" });
      gsap.fromTo(
        inner,
        { opacity: 0, y: 8, scale: 0.98, x: 0 },
        { opacity: 1, y: 0, scale: 1, duration: 0.26, ease: "power3.out" }
      );
    } else {
      gsap.set(stage, { width: from.w, height: from.h, autoAlpha: 1 });
      gsap.to(stage, { width: targetW, height: targetH, duration: 0.32, ease: "power3.out" });
      gsap.fromTo(
        inner,
        { x: -18, scale: 0.96, opacity: 0 },
        { x: 0, scale: 1, opacity: 1, duration: 0.28, ease: "power3.out" }
      );
    }

    prevSize.current = { w: targetW, h: targetH };
  }, [active]);

  const data = active ? MENUS[active] : null;
  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      {/* ── Desktop / shared header bar ── */}
      <header className="fixed inset-x-0 top-0 z-50" onMouseLeave={scheduleClose}>
        <div className="relative border-b border-line bg-white">
          <div className="mx-auto max-w-[1320px] px-5 lg:px-8">
            <div className="relative flex h-[72px] items-center justify-between gap-4">
              <Logo />

              {/* Absolutely centred rather than `flex-1 justify-center`, which
                  centres within the space left over by the logo and the CTA and
                  so sits off the true middle. */}
              <nav className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-9 lg:flex">
                {NAV_WITH_MENU.map((label) => {
                  const href = MENUS[label].href;
                  const isCurrentPage = !!href && pathname === href;
                  const content = (
                    <>
                      <Plus
                        size={15}
                        strokeWidth={2.5}
                        className={`text-orange transition-transform duration-500 ${
                          active === label ? "rotate-[135deg]" : "rotate-0"
                        }`}
                      />
                      {label}
                    </>
                  );
                  const linkClass = `group inline-flex items-center gap-1.5 text-[15px] font-medium transition-colors ${
                    isCurrentPage ? "text-orange" : "text-ink/90 hover:text-ink"
                  }`;

                  if (href) {
                    return (
                      <Link
                        key={label}
                        href={href}
                        aria-current={isCurrentPage ? "page" : undefined}
                        onMouseEnter={() => open(label)}
                        onFocus={() => open(label)}
                        className={linkClass}
                      >
                        {content}
                      </Link>
                    );
                  }
                  return (
                    <button
                      key={label}
                      onMouseEnter={() => open(label)}
                      onFocus={() => open(label)}
                      className={linkClass}
                    >
                      {content}
                    </button>
                  );
                })}

                {/* Plain links. Only route links can be "current" — the anchors
                    all live on the home page, so matching on pathname would
                    light every one of them up at once while on `/`. */}
                {NAV_LINKS.map(({ label, href }) => {
                  const isCurrentPage = !href.includes("#") && pathname === href;
                  return (
                    <Link
                      key={label}
                      href={href}
                      onMouseEnter={scheduleClose}
                      aria-current={isCurrentPage ? "page" : undefined}
                      className={`text-[15px] font-medium transition-colors ${
                        isCurrentPage ? "text-orange" : "text-ink/90 hover:text-ink"
                      }`}
                    >
                      {label}
                    </Link>
                  );
                })}
              </nav>

              <div className="flex items-center gap-6">
                {secondary && (
                  <Link
                    href={secondary.href}
                    onMouseEnter={scheduleClose}
                    aria-current={pathname === secondary.href ? "page" : undefined}
                    className={`hidden whitespace-nowrap text-[15px] font-medium transition-colors lg:inline-flex ${
                      pathname === secondary.href ? "text-orange" : "text-ink/90 hover:text-ink"
                    }`}
                  >
                    {secondary.label}
                  </Link>
                )}

                <Link
                  href={primary.href}
                  className="hidden items-center gap-2 whitespace-nowrap rounded-lg bg-orange px-5 py-2.5 text-[14.5px] font-semibold text-white transition-colors hover:bg-[#e8870f] lg:inline-flex"
                >
                  {primary.label}
                </Link>

                <button
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-ink transition-colors hover:text-orange lg:hidden"
                  onClick={() => setMobileOpen(true)}
                  aria-label="Open navigation menu"
                >
                  <LayoutGrid size={22} strokeWidth={2} />
                </button>
              </div>
            </div>
          </div>

          {/* Mega-menu panel (desktop only) */}
          <div
            className="absolute left-1/2 top-full hidden -translate-x-1/2 pt-0 lg:block"
            onMouseEnter={() => active && open(active)}
          >
            <div
              ref={stageRef}
              style={{ height: 0, visibility: "hidden", opacity: 0 }}
              className="overflow-hidden border border-line bg-white shadow-[0_30px_60px_-32px_rgba(11,31,51,0.22)]"
            >
              <div ref={innerRef} style={{ width: "max-content" }}>
                {data && (
                  <>
                    <div className="flex divide-x divide-line">
                      {data.description && (
                        <div className="flex w-[280px] flex-col justify-center gap-3 px-7 py-8">
                          <p className="text-[17px] font-semibold text-ink">{data.label}</p>
                          <p className="text-[13.5px] leading-relaxed text-muted">
                            {data.description}
                          </p>
                        </div>
                      )}
                      {data.columns.map((col, colIdx) => (
                        <div
                          key={col.heading ?? colIdx}
                          className="flex w-[300px] flex-col divide-y divide-line"
                        >
                          {col.heading && <p className="eyebrow px-7 pb-4 pt-6">{col.heading}</p>}
                          {col.items.map((item) => {
                            const Icon = item.icon;
                            return (
                              <Link
                                key={item.title}
                                href={item.href ?? "/#challenges"}
                                className="group flex items-start gap-4 px-7 py-5 transition-colors hover:bg-surface"
                              >
                                <Icon
                                  size={20}
                                  strokeWidth={2}
                                  className="mt-0.5 shrink-0 text-ink transition-colors group-hover:text-orange"
                                />
                                <span>
                                  <span className="flex items-center gap-2 text-[15px] font-semibold text-ink">
                                    {item.title}
                                    {item.badge && (
                                      <span className="rounded bg-orange/12 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-orange">
                                        {item.badge}
                                      </span>
                                    )}
                                  </span>
                                  {item.desc && (
                                    <span className="mt-0.5 block text-[13.5px] text-muted">
                                      {item.desc}
                                    </span>
                                  )}
                                </span>
                              </Link>
                            );
                          })}
                        </div>
                      ))}
                    </div>

                    <Link
                      href={data.ctaHref ?? "/#challenges"}
                      className="block border-t border-line px-7 py-4 text-center text-[15px] font-semibold text-ink transition-opacity hover:opacity-80"
                      style={{
                        background:
                          "linear-gradient(90deg, rgba(247,148,30,0.07), rgba(20,168,155,0.07) 50%, rgba(0,68,124,0.07))",
                      }}
                    >
                      {data.cta}
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── Mobile menu overlay ── */}
      <div
        className={`fixed inset-0 z-[100] flex flex-col bg-white transition-transform duration-300 ease-in-out lg:hidden ${
          mobileOpen ? "translate-y-0" : "-translate-y-full"
        }`}
        aria-hidden={!mobileOpen}
      >
        <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-line px-5">
          <Logo />
          <button
            onClick={closeMobile}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-ink transition-colors hover:text-orange"
            aria-label="Close menu"
          >
            <X size={22} strokeWidth={2} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto">
          {/* Accordion items (menus with sub-pages) */}
          {NAV_WITH_MENU.map((label) => {
            const isExpanded = mobileExpanded === label;
            const menuData = MENUS[label];
            const isCurrentPage = !!menuData.href && pathname === menuData.href;
            return (
              <div key={label}>
                <button
                  className="flex w-full items-center justify-between border-b border-line px-6 py-[18px] text-left transition-colors active:bg-surface"
                  onClick={() => setMobileExpanded(isExpanded ? null : label)}
                  aria-expanded={isExpanded}
                >
                  <span
                    className={`text-[17px] font-medium ${
                      isCurrentPage ? "text-orange" : "text-ink"
                    }`}
                  >
                    {label}
                  </span>
                  <Plus
                    size={18}
                    strokeWidth={2}
                    className={`text-ink transition-transform duration-300 ${
                      isExpanded ? "rotate-45" : "rotate-0"
                    }`}
                  />
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isExpanded ? "max-h-[1100px] opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="border-b border-line bg-surface">
                    {menuData.columns.flatMap((col, colIdx) =>
                      col.items.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={`${colIdx}-${item.title}`}
                            href={item.href ?? "/#challenges"}
                            onClick={closeMobile}
                            className="flex items-center gap-4 border-b border-line/50 px-8 py-4 transition-colors last:border-0 hover:bg-white/70"
                          >
                            <Icon size={17} strokeWidth={1.8} className="shrink-0 text-orange" />
                            <span className="flex-1 text-[14.5px] font-medium text-ink">
                              {item.title}
                            </span>
                            {item.badge && (
                              <span className="rounded bg-orange/12 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-orange">
                                {item.badge}
                              </span>
                            )}
                          </Link>
                        );
                      })
                    )}
                    <Link
                      href={menuData.ctaHref ?? "/#challenges"}
                      onClick={closeMobile}
                      className="flex items-center justify-center gap-2 px-8 py-3.5 text-[14px] font-semibold text-navy transition-opacity hover:opacity-80"
                      style={{
                        background:
                          "linear-gradient(90deg, rgba(247,148,30,0.07), rgba(20,168,155,0.07) 50%, rgba(0,68,124,0.07))",
                      }}
                    >
                      {menuData.cta}
                      <span className="text-orange">→</span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Plain links — same set and order as the desktop nav */}
          {NAV_LINKS.map(({ label, href }) => {
            const isCurrentPage = !href.includes("#") && pathname === href;
            return (
              <Link
                key={label}
                href={href}
                onClick={closeMobile}
                aria-current={isCurrentPage ? "page" : undefined}
                className={`flex items-center border-b border-line px-6 py-[18px] text-[17px] font-medium transition-colors hover:text-orange ${
                  isCurrentPage ? "text-orange" : "text-ink"
                }`}
              >
                {label}
              </Link>
            );
          })}

          <div className="px-5 pb-8 pt-6">
            <Link
              href={primary.href}
              onClick={closeMobile}
              className="block w-full rounded-lg bg-orange px-5 py-4 text-center text-[15px] font-semibold text-white transition-colors hover:bg-[#e8870f]"
            >
              {primary.label}
            </Link>

            {secondary && (
              <Link
                href={secondary.href}
                onClick={closeMobile}
                className="mt-3 block w-full rounded-lg border border-line px-5 py-4 text-center text-[15px] font-semibold text-ink transition-colors hover:border-orange hover:text-orange"
              >
                {secondary.label}
              </Link>
            )}
          </div>
        </nav>
      </div>
    </>
  );
}
