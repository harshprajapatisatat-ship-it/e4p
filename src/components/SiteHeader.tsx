import { getWebinarSessions } from "@/lib/webinarSessions";
import Header from "./Header";

/**
 * Server wrapper around the header.
 *
 * `Header` is a Client Component — it owns the mega-menu animation and the
 * mobile overlay — so it cannot read ERPNext itself. This resolves the one
 * thing it needs from the server and hands it down.
 *
 * Every page renders this rather than `Header` directly, so the bar cannot fall
 * out of step with the webinar page: if there is no session to register for,
 * the header stops pointing at a page where registration is disabled.
 *
 * The read is a cached GET (`SESSION_REVALIDATE_SECONDS`), and Next dedupes it
 * against the webinar page's own call within a render, so mounting this on
 * every page costs one upstream request per revalidation window rather than one
 * per page.
 */
export default async function SiteHeader() {
  const sessions = await getWebinarSessions();

  return <Header hasSessions={sessions.length > 0} />;
}
