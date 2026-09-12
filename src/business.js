/*  Every fact the policy pages state about the business, in one place.
 *
 *  The pages in legal/ read from here and nowhere else, so a detail that
 *  changes — the phone number, the rate card, the grievance officer — is
 *  changed once and is right on all seven pages at the same moment. Two pages
 *  quietly disagreeing about a refund window is the kind of thing a payment
 *  aggregator's review catches, and it is worth spending a file to make
 *  impossible.
 *
 *  ─── UNFILLED FACTS ───────────────────────────────────────────────────────
 *
 *  Nothing is outstanding: every fact below is real as of 12 Sep 2026.
 *
 *  The mechanism is kept for whatever is added next. Wrapping a value in
 *  TODO("what is needed") renders it on the page as a visible amber "still to
 *  be filled in" mark rather than as silent blank space — a policy page that
 *  is quietly missing its proprietor's name is worse than one that says so,
 *  and Razorpay's activation check compares the legal name and address here
 *  against the name on the merchant account, so a placeholder left standing
 *  is a rejection. Replace the TODO(...) with the real value to clear it.
 */

const TODO = (note) => ({ todo: true, note });

export const business = {
  /* ── who ─────────────────────────────────────────────────────────────── */
  tradingName: "The Little Door Post",

  /* A sole proprietorship has no separate legal identity: the business *is*
   * the proprietor. So the registered name is the person's, and "The Little
   * Door Post" is the name they trade under. Both have to appear — the
   * E-Commerce Rules want the legal name, and readers know the other one. */
  entityType: "sole proprietorship",
  /* "Juhi Jani", not "Jani Juhi".
   *
   * The PAN card prints it surname-first because the PAN form has separate
   * Last Name and First Name fields and renders them in that order — it is a
   * form-field artifact, not a different legal name. The name on the Razorpay
   * merchant account is "Juhi Jani", and the activation check compares the
   * site against the merchant account, so that is the order the site uses.
   * Do not "correct" this to match the PAN. */
  owner: "Juhi Jani",

  /* ── where ───────────────────────────────────────────────────────────── */
  address: {
    lines: ["The Little Door Post", "B-304, Shubh Aarambh Flats", "Randesan, Gandhinagar"],
    state: "Gujarat",
    pincode: "382426",
    country: "India",
  },

  /* ── how to reach it ─────────────────────────────────────────────────── */
  email: "littledoorpost08@gmail.com",
  phone: "+91 95747 98594",
  hours: "Monday to Friday, 10am – 6pm IST",
  instagram: "little._door._post",

  /* The E-Commerce Rules and the DPDP Act both want a named person to write
   * to, not a department. In a one-person business that is the proprietor. */
  grievanceOfficer: {
    name: "Juhi Jani",
    designation: "Grievance Officer",
    /* Kept separate from the general address so it can become a dedicated
     * inbox later without touching six pages. */
    email: "littledoorpost08@gmail.com",
  },

  /* GST is not registered — turnover is under the threshold. If that changes,
   * put the GSTIN here and the Terms page will print it. */
  gstin: null,

  /* ── what is sold ────────────────────────────────────────────────────── */
  /* Kept in step with ENVELOPE in TheLittleDoorPost.jsx and ENVELOPE_CONTENTS
   * in backend/app/routers/subscriptions.py. Naming the printed goods is not
   * decoration: a subscription whose contents are a surprise reads to a
   * payment aggregator as a category it does not support, and this business
   * has been turned down on exactly that ground once already. */
  contents: [
    "a letter from Iris, two printed pages",
    "a letter from a side character, one printed page",
    "a die-cut vinyl theme sticker",
    "a die-cut vinyl character sticker",
    "an illustrated art print on card",
    "an activity sheet, one printed page",
    "a fact sheet on what inspired the letter, one printed page",
    "a printed paper stamp of that month's town",
  ],
  piecesPerMonth: 8,

  /* ── the rate card ───────────────────────────────────────────────────── */
  /* The prices actually charged live in the `plans` table in Postgres, which
   * is the source of truth; these mirror it so the Terms page can state a
   * figure without waiting on an API call. Change one, change the other —
   * `insert into plans` in backend/app/schema.sql.
   *
   * Setting the INTERNATIONAL prices? Read `international.riskMarginPercent`
   * below first — the number wants a few percent in it that the India rates
   * do not need. */
  plans: [
    { months: 1, rate: "₹370", total: "₹370", note: "one envelope" },
    { months: 3, rate: "₹330", total: "₹990", note: "three envelopes, one a month" },
    { months: 6, rate: "₹300", total: "₹1,800", note: "six envelopes, one a month" },
  ],
  currency: "INR",

  /* ── the timetable ───────────────────────────────────────────────────── */
  /* The same 15th-to-5th window the backend enforces in app/cycles.py. */
  window: { opensDay: "15th", closesDay: "5th" },
  dispatchWindow: "within 10 days of the 5th",
  deliveryEstimate: "1 to 3 weeks from dispatch",
  shipsTo: "India only",

  /* ── posting abroad ──────────────────────────────────────────────────── */
  /*  Not open yet. The backend refuses an international sign-up outright
   *  (see create_subscription in app/routers/subscriptions.py) and the
   *  `international` plans are `active = false` in the database, so nothing
   *  can be sold abroad today whatever this file says.
   *
   *  The terms below are written and published now anyway, because they are
   *  true statements about international orders either way — a customs charge
   *  is the recipient's whether or not we are taking those orders this month.
   *  The pages print them under a banner driven by `live`, so the site never
   *  claims to ship somewhere it does not.
   *
   *  TO OPEN INTERNATIONAL SHIPPING, all four, in this order:
   *    1. set prices and `active = true` on the international plans —
   *       AND SEE "the risk margin" BELOW BEFORE YOU PICK THE NUMBER
   *    2. drop the region check in create_subscription, and make the order
   *       form offer a country list that OMITS everything in `excluded` below
   *    3. re-read `excluded` — is that still the decision?
   *    4. set `live: true` here
   *
   *  Do not do (4) before (1)-(3): it would put a shipping promise on the
   *  site that the order form refuses to honour.
   */
  international: {
    live: false,

    /* Who pays the destination country's import charges. "recipient" is the
     * norm for postal goods (DDU) and is what we can actually operate: we
     * cannot pre-pay duty in 190 countries from Gandhinagar. */
    dutiesBorneBy: "recipient",

    /*  ── the risk margin ────────────────────────────────────────────────
     *
     *  An envelope stopped at a border after we posted it is refunded in
     *  full, and the printing and international postage are already spent by
     *  then — so that loss is ours, by policy and deliberately.
     *
     *  It is covered by PRICING, not by clawing half back from the reader.
     *  When the international rates are set, add roughly 3-5% for it.
     *
     *  Why this way round, decided Sep 2026 after weighing a half-refund:
     *
     *    - On a "goods not received" dispute the card network asks the
     *      merchant for proof of delivery. In precisely this scenario there
     *      is none — that is what the scenario IS — so a partial refund
     *      loses the dispute, the rest of the money, and a dispute fee.
     *    - Chargeback ratio is watched by the aggregator, and this account
     *      was declined once already. Not worth risking over one envelope.
     *    - Keeping half of what someone paid for goods that never arrived
     *      is the kind of term the Consumer Protection Act, 2019 lets a
     *      forum strike out as unfair.
     *
     *  A margin nobody can see beats a clause everybody argues about. If the
     *  real loss rate turns out higher than the margin, raise the margin —
     *  do not move the loss onto the reader after the fact. */
    riskMarginPercent: [3, 5],

    /*  Where we will not post, and why.
     *
     *  EU and UK consumer law gives a distance buyer 14 days to withdraw from
     *  a contract for no reason and be refunded in full — including the
     *  envelope already delivered and its postage. The right follows the
     *  buyer, not the seller, so it would bind us here in Gujarat the moment
     *  we sold to someone in Dublin. Returning paper goods from Europe costs
     *  more than the goods, so in practice it means refunding an envelope the
     *  reader keeps.
     *
     *  The decision (Sep 2026) is to not sell there at all rather than run a
     *  second refund policy for one region. Revisit it if Europe ever looks
     *  worth the extra policy — it is a real market for paper goods.
     *
     *  THIS HAS TO BE ENFORCED AT THE ORDER FORM, not merely stated here. A
     *  policy page saying "not the EU" while the country dropdown offers
     *  Germany puts us in exactly the position this avoids. The country list
     *  in step (2) above is the part that actually does the work. */
    excluded: {
      regions: ["the European Union", "the European Economic Area", "the United Kingdom"],
      short: "the EU, the EEA and the UK",
    },

    /* Real examples, kept current, because "rules may change" is abstract and
     * unconvincing until someone sees that it already has. Both of these
     * landed in 2026. */
    recentChanges: [
      {
        what: "The United States suspended its $800 duty-free de minimis allowance",
        when: "August 2025, made indefinite in June 2026",
        effect: "small postal parcels to the US now need a customs entry and may attract duty",
      },
      {
        what: "The EU introduced a flat €3 customs duty on low-value imports",
        when: "1 July 2026, running until July 2028",
        effect: "a charge now applies to parcels that used to arrive free",
      },
    ],
  },

  /* ── money back ──────────────────────────────────────────────────────── */
  refundWorkingDays: "5 to 7 working days",
  ackHours: 48,
  resolveDays: 30,

  /* ── housekeeping ────────────────────────────────────────────────────── */
  lastUpdated: "12 September 2026",
  jurisdiction: "Gandhinagar, Gujarat",
  paymentProcessor: "Razorpay Software Private Limited",
};

/* ── helpers the pages use ─────────────────────────────────────────────── */

export const isTodo = (v) => Boolean(v && typeof v === "object" && v.todo);

/** The postal address as one line, for running text. */
export const addressLine = () => {
  const a = business.address;
  return [...a.lines, `${a.state} ${a.pincode}`, a.country].join(", ");
};

/** The proprietor's name, phrased for the entity type. */
export const legalName = () => business.owner;
