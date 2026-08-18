# NOTE: this file belongs in the Frappe bench, not in this Next.js repo.
# Copy it to  apps/satat_fca/satat_fca/api/contact.py  and deploy.
# It is kept here only so the website and its server-side counterpart can be
# read side by side — see docs/frappe-forms-integration.md.

import re

import frappe
from frappe import _
from frappe.rate_limiter import rate_limit

EMAIL_REGEX = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
MOBILE_REGEX = re.compile(r"^\+?[0-9]{7,15}$")


@frappe.whitelist(allow_guest=True)
def submit_contact_us(name1=None, company_name=None, email=None, mobile_number=None, description=None, source_website=None):
    name1 = (name1 or "").strip()
    email = (email or "").strip()
    mobile_number = (mobile_number or "").strip()

    if not name1:
        frappe.throw(_("Name is required."))

    if len(name1) > 140:
        frappe.throw(_("Name is too long."))

    if not email:
        frappe.throw(_("Email is required."))

    if len(email) > 140 or not EMAIL_REGEX.match(email):
        frappe.throw(_("Please enter a valid email address."))

    if not mobile_number:
        frappe.throw(_("Mobile number is required."))

    if not MOBILE_REGEX.match(mobile_number):
        frappe.throw(_("Please enter a valid mobile number."))

    doc = frappe.get_doc({
        "doctype": "Contact Us",
        "name1": name1,
        "company_name": (company_name or "").strip()[:140],
        "email": email.lower(),
        "mobile_number": mobile_number[:30],
        "description": (description or "").strip()[:2000],
        "source_website": (source_website or "").strip()[:200],
    })

    doc.insert(ignore_permissions=True)
    frappe.db.commit()

    return {"ok": True, "name": doc.name}


# ---------------------------------------------------------------------------
# General website form intake
#
# `submit_contact_us` above is left exactly as it was — another site posts to it
# and must keep working. Everything below is additive.
#
# One endpoint serves every marketing form on every site. Each submission lands
# in "Microsites Form Submissions" tagged with `form_type` (which form) and
# `source_url` (which page), so a new form or a new site needs no new endpoint —
# only a new option on the `form_type` Select field.
#
# Guest never gets permission on the Doctype itself: these functions insert with
# ignore_permissions, so the only things a stranger can write are the fields
# named here, already validated.
# ---------------------------------------------------------------------------

SUBMISSION_DOCTYPE = "Microsites Form Submissions"
SESSION_DOCTYPE = "Webinar Session"

# Accepts either the short key the website uses or the Doctype's own label, so
# callers are not forced to hardcode the exact Select wording.
FORM_TYPES = {
    "contact": "Contact Enquiry",
    "webinar": "Webinar Registration",
    "guide": "Guide Download",
}

# Which optional-by-default fields each form actually requires. The website
# enforces the same rules first; this is the authority.
REQUIRED_BY_FORM = {
    "Contact Enquiry": ("phone", "company_size", "focus_area"),
    "Webinar Registration": ("phone", "company_size", "preferred_session"),
    "Guide Download": (),
}

# ---------------------------------------------------------------------------
# Webinar tracks
#
# Two different webinars run off the one `Webinar Session` Doctype — the
# Manufacturing microsite's and the Pharma microsite's. Each site asks for its
# own track by name; a slot belongs to exactly one.
#
# The valid values are NOT listed here: they are read from the Select field's
# own options, so the allowlist can never drift from what ERPNext will accept.
# Add an option in the Doctype and a third microsite works with no code change.
# ---------------------------------------------------------------------------

WEBINAR_TYPE_FIELD = "webinar_type"

MAX_TEXT = 2000
MAX_URL = 500


def _clean(value, limit=140):
    return (value or "").strip()[:limit]


def _select_options(fieldname, doctype=SUBMISSION_DOCTYPE):
    """
    Valid values for a Select field, read from the Doctype itself so the
    allowlist can never drift from what ERPNext will accept.
    """
    field = frappe.get_meta(doctype).get_field(fieldname)
    if not field or not field.options:
        return []
    return [opt.strip() for opt in field.options.split("\n") if opt.strip()]


def _resolve_form_type(form_type):
    key = (form_type or "").strip()
    if not key:
        frappe.throw(_("Form type is required."))

    label = FORM_TYPES.get(key.lower())
    if label:
        return label

    if key in FORM_TYPES.values():
        return key

    frappe.throw(_("Unknown form type: {0}").format(key))


def _resolve_webinar_type(webinar_type):
    """
    The track to filter sessions by, or None meaning "every track".

    Returns None while `webinar_type` does not exist on the Doctype yet, so this
    file can be deployed BEFORE the field is added without either site losing
    its slots. Once the field exists, an unrecognised value is an error rather
    than a silent fall-back to everything — a typo in a track name must not
    quietly advertise the other webinar's dates.
    """
    value = (webinar_type or "").strip()
    if not value:
        return None

    options = _select_options(WEBINAR_TYPE_FIELD, SESSION_DOCTYPE)
    if not options:
        return None

    if value not in options:
        frappe.throw(_("Unknown webinar type: {0}").format(value))

    return value


def _session_values(webinar_type=None):
    """`"21 Aug 2026 4:00 PM"` for every slot currently on offer."""
    return [_format_session(row) for row in _enabled_sessions(webinar_type)]


def _enabled_sessions(webinar_type=None):
    """
    Enabled, not-yet-past sessions, soonest first.

    `webinar_type` must already have been through `_resolve_webinar_type` —
    None means no track filter, which is what every caller got before the field
    existed.
    """
    filters = {"enabled": 1, "session_date": [">=", frappe.utils.nowdate()]}
    if webinar_type:
        filters[WEBINAR_TYPE_FIELD] = webinar_type

    return frappe.get_all(
        SESSION_DOCTYPE,
        fields=["session_date", "session_time"],
        filters=filters,
        order_by="session_date asc, session_time asc",
        ignore_permissions=True,
    )


def _format_session(row):
    """Matches the label the website renders, e.g. `"21 Aug 2026 4:00 PM"`."""
    date = frappe.utils.formatdate(row.session_date, "dd MMM yyyy")
    time = frappe.utils.format_time(row.session_time, "h:mm a")
    return "{0} {1}".format(date, time)


@frappe.whitelist(allow_guest=True)
@rate_limit(limit=8, seconds=600)
def submit_form(
    form_type=None,
    full_name=None,
    company=None,
    email=None,
    phone=None,
    company_size=None,
    focus_area=None,
    preferred_session=None,
    webinar_type=None,
    message=None,
    biggest_challenge=None,
    source_url=None,
):
    """
    Create one "Microsites Form Submissions" record.

    `form_type` accepts "contact" / "webinar" / "guide" or the Doctype's own
    labels. Fields not relevant to the given form are simply ignored, so a
    single call signature serves all three forms.

    `webinar_type` scopes the preferred-session check to one track, so a Pharma
    registration cannot be booked against a Manufacturing slot. Omit it and the
    session is checked against every track, exactly as before.

    Returns {"ok": True, "name": "MFS-2026-00001"}.
    """
    label = _resolve_form_type(form_type)
    required = REQUIRED_BY_FORM[label]

    full_name = _clean(full_name)
    company = _clean(company)
    email = _clean(email)
    phone = _clean(phone, 30)

    if not full_name:
        frappe.throw(_("Name is required."))

    if not company:
        frappe.throw(_("Company is required."))

    if not email:
        frappe.throw(_("Email is required."))

    if not EMAIL_REGEX.match(email):
        frappe.throw(_("Please enter a valid email address."))

    # Phone is optional on the guide form, so only shape-check what was sent.
    if "phone" in required and not phone:
        frappe.throw(_("Mobile number is required."))

    if phone and not MOBILE_REGEX.match(re.sub(r"[\s\-()]", "", phone)):
        frappe.throw(_("Please enter a valid mobile number."))

    company_size = _clean(company_size)
    focus_area = _clean(focus_area)

    for fieldname, value in (("company_size", company_size), ("focus_area", focus_area)):
        if fieldname in required and not value:
            frappe.throw(_("Please complete all required fields."))
        if value and value not in _select_options(fieldname):
            frappe.throw(_("Invalid value for {0}.").format(fieldname))

    preferred_session = _clean(preferred_session)
    if "preferred_session" in required:
        available = _session_values(_resolve_webinar_type(webinar_type))
        # With nothing scheduled the website hides the dropdown, so a blank
        # session is valid — we still want the lead.
        if available and preferred_session not in available:
            frappe.throw(_("Please choose one of the available sessions."))

    doc = frappe.get_doc({
        "doctype": SUBMISSION_DOCTYPE,
        "form_type": label,
        "full_name": full_name,
        "company": company,
        "email": email.lower(),
        "phone": phone,
        "company_size": company_size,
        "focus_area": focus_area,
        "preferred_session": preferred_session,
        "message": _clean(message, MAX_TEXT),
        "biggest_challenge": _clean(biggest_challenge, MAX_TEXT),
        "source_url": _clean(source_url, MAX_URL),
    })

    doc.insert(ignore_permissions=True)
    frappe.db.commit()

    return {"ok": True, "name": doc.name}


@frappe.whitelist(allow_guest=True)
def get_webinar_sessions(webinar_type=None):
    """
    Session slots the website should currently offer, soonest first.

    `webinar_type` picks the track — "Manufacturing" or "Pharma", per the
    Select's own options. Omit it and every track is returned, which is what
    callers written before the field existed will keep getting.

    Exposes only date and time — the Doctype stays unreadable to Guest, so
    internal notes and disabled slots never leave the server.
    """
    return [
        {
            "session_date": str(row.session_date),
            "session_time": str(row.session_time),
        }
        for row in _enabled_sessions(_resolve_webinar_type(webinar_type))
    ]
