# How the forms on this site reach ERPNext

The pharma microsite's three forms write into the same Frappe Cloud site the
Manufacturing microsite uses, through the same two whitelisted methods. Nothing
new was added on the Frappe side to make this site work.

---

## 1. The shape of it

```
Client Component  (PharmaLeadForm / PharmaWebinarForm)
        |  submitLead()  - plain fetch, same-origin
        v
POST /api/forms         (Next Route Handler, server-only)
        |  callMethod()  - server-to-server fetch
        v
POST https://<site>/api/method/satat_fca.api.contact.submit_form
        |  @frappe.whitelist(allow_guest=True)
        v
frappe.get_doc("Microsites Form Submissions").insert(ignore_permissions=True)
```

Three rules hold the design together:

1. **The browser never talks to Frappe.** It only ever calls our own
   `/api/forms`, so the ERPNext URL stays server-side. `src/lib/erpnext.ts`
   throws at import time if it is ever pulled into a Client Component.
2. **There is no API key anywhere.** Not in the browser, not on the server. The
   site calls Frappe as the `Guest` user, which holds **no Doctype permission at
   all** — the only thing it can do is call the two whitelisted Python
   functions, which do their own inserting with `ignore_permissions`.
3. **Python is the authority.** The browser validates for UX, the route handler
   validates for real, and `submit_form` validates last against the Doctype's
   own Select options. A value that does not match an option **exactly** is
   rejected with a 417 — so the option lists must be kept in step in all three
   places.

**One environment variable, `ERP_URL`.** That is the whole configuration. Never
prefix it `NEXT_PUBLIC_` — that inlines it into the client bundle.

---

## 2. Where things live

| File | What it owns |
|---|---|
| `.env.local` / `.env.example` | `ERP_URL`, and nothing else |
| `src/lib/erpnext.ts` | The transport. Timeouts, `_server_messages` parsing, `ErpNextError`. Server-only, copied verbatim from the Manufacturing site — it is site-agnostic |
| `src/lib/leadForm.ts` | The contract shared by the browser and the route: `SUBMIT_METHOD`, `FormType`, `COMPANY_SIZES`, `FOCUS_AREAS`, payload types |
| `src/lib/webinarSessions.ts` | Reads the `Webinar Session` Doctype. Server-only |
| `src/app/api/forms/route.ts` | The gate: rate limit, body cap, per-form required-field map, allowlist validation, error mapping |
| `src/components/forms/submitLead.ts` | The one client wrapper. Adds `sourceUrl` and normalises every failure into `{ ok: false, error, fieldErrors? }` |
| `src/components/forms/FormSelect.tsx` | The one listbox, used by all three dropdowns |
| `src/components/forms/FormKit.tsx` | The shared controls and the single `fieldStyle` |

## 3. The three forms

All three write to **one** Doctype. `form_type` says which form, `source_url`
says which page — and `source_url` is also what separates this site's leads from
the Manufacturing site's in the same ERPNext inbox.

| Form | `formType` | Doctype label | Required beyond name/company/email |
|---|---|---|---|
| `/contact`, and the demo variant | `contact` | Contact Enquiry | phone, company size, focus area |
| `/erpnext-pharma-webinar` | `webinar` | Webinar Registration | phone, company size, preferred session |
| `/resources/pharma-compliance-guide` | `guide` | Guide Download | nothing |

That table is `REQUIRED` in `route.ts` and `REQUIRED_BY_FORM` in
`satat_fca/api/contact.py`. **Keep the two in step.** Python is the authority; the
route's copy exists so a visitor gets a field-level error in the browser instead
of one opaque banner from Frappe.

This is why the contact form carries a Company Size and a "What do you want to
fix first?" dropdown that the earlier preview-only version did not: a
`Contact Enquiry` without them is rejected server-side.

## 4. Select values are exact strings

`COMPANY_SIZES` and `FOCUS_AREAS` in `src/lib/leadForm.ts` must match the
Doctype's Select options **character for character** — `submit_form` allowlists
them against `frappe.get_meta(...)`. Plain hyphens, not en-dashes.

`FOCUS_AREAS` is deliberately identical to the Manufacturing site's, because
both sites feed the one `focus_area` Select. To add a pharma-only option, add it
to the Doctype Select **first**, then to the constant.

## 5. Webinar dates

Slots live in the `Webinar Session` Doctype, not in the page. Tick `enabled` and
a slot appears; untick it and it is gone; past dates drop off on their own. Both
the date chips on the page and the form's dropdown read the same list, so they
cannot drift apart.

### Two webinars, one Doctype

Satat runs two webinars — Manufacturing and Pharma — off the same
`Webinar Session` rows. A `webinar_type` Select on the Doctype says which, and
each site names its own track:

| Site | `WEBINAR_TYPE` in `src/lib/leadForm.ts` |
|---|---|
| Manufacturing microsite | `"Manufacturing"` |
| this one | `"Pharma"` |

The track is sent on **both** calls, and both matter:

- `get_webinar_sessions(webinar_type=…)` — so the page only advertises its own
  dates.
- `submit_form(webinar_type=…)` — so Python scopes its session allowlist to the
  same track. Without it a pharma visitor could be booked onto a manufacturing
  slot by posting that slot's value directly.

Python reads the valid track names from the Select's own options rather than
hardcoding them, so a third microsite needs a new option and nothing else. An
unrecognised track is an error, not a silent fall-back to every track — a typo
must not quietly advertise the other webinar's dates.

`_resolve_webinar_type` returns `None` while the field does not exist, so the
Python and the two sites can be deployed in any order without either losing its
slots. Frappe also drops kwargs a whitelisted function does not declare, so
sending `webinar_type` to an older `contact.py` is ignored rather than an error.

- Pages cache the list for 5 minutes; `SESSION_REVALIDATE_SECONDS` is **0 in
  development**, otherwise toggling a record appears to do nothing.
- The submission route passes `revalidate: 0`, so a slot disabled a minute ago
  cannot still be registered against.
- `session.value` (`"24 Aug 2026 10:31 AM"`) must match what Python's
  `_format_session` builds, because `submit_form` allowlists against it. That is
  why the dropdown shows the time as a separate right-aligned column instead of
  joining it with a `·`.
- **A hardcoded fallback list** is used only when Frappe is *unreachable*. An
  outage should cost the ability to edit dates, never the ability to serve the
  page and take a registration. An empty list from a healthy Frappe is a real
  answer and is honoured — the page says dates are being scheduled and the form
  still takes the lead.

## 6. Smoke test

```bash
curl -X POST http://localhost:3000/api/forms \
  -H "Content-Type: application/json" \
  -d '{"formType":"guide","name":"Test","company":"Test","email":"t@t.com"}'
# expect: {"ok":true,"name":"MFS-2026-000NN"}
```

Straight at Frappe, bypassing Next:

```bash
curl https://<site>/api/method/satat_fca.api.contact.get_webinar_sessions
# expect: {"message":[{"session_date":"...","session_time":"..."}, ...]}
```

If the second one fails, nothing on the website will. Fix it there first.

## 7. Gotchas that cost time

| Symptom | Cause |
|---|---|
| 403 from Frappe | method missing `allow_guest=True`, or `/api/resource/...` was called instead of `/api/method/...` |
| 417 with an opaque message | a Select value does not match the Doctype option **exactly** (trailing space, en-dash vs hyphen) |
| "Please choose one of the available sessions" on a valid-looking slot | `session.value` no longer matches Python's `_format_session` |
| Record created, then vanishes | missing `frappe.db.commit()` on the guest request |
| "unexpected response shape" | Frappe wraps returns in `message`; the method returned `None` |
| Error text is unreadable | `_server_messages` is not being parsed (double-encoded JSON, HTML inside) |
| Edits in ERPNext do not show up | GET response cached; `revalidate` must be 0 in dev |
| `ERP_URL` visible in devtools | it got a `NEXT_PUBLIC_` prefix, or `erpnext.ts` was imported into a Client Component |
