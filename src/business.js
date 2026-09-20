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
    "a folded zine of that month's traditions, with a small keepsake tucked inside",
    "a printed paper stamp of that month's town",
  ],
  piecesPerMonth: 8,

  /* Sent once, with a first envelope only — deliberately NOT in `contents`
   * above, which is the list of what arrives every month. The policy pages
   * name it separately for exactly that reason. */
  firstEnvelopeExtra: {
    name: "a Wanderland Passport",
    detail:
      "a stapled booklet with a page for every door, and somewhere to paste the " +
      "stamp that comes with each letter",
  },

  /* ── the rate card ───────────────────────────────────────────────────── */
  /*  The prices actually charged live in the `plans` table in Postgres, which
   *  is the source of truth; these mirror it so the Terms page can state a
   *  figure without waiting on an API call, and so the sign-up form has a rate
   *  card to fall back on when the API is asleep. Change one, change the other
   *  — `insert into plans` in backend/app/schema.sql.
   *
   *  ── ONE PLAN, ON PURPOSE (20 Sep 2026) ────────────────────────────────
   *
   *  Only the single month is on sale. The three- and six-month plans are
   *  switched off — `active = false` on the india rows — while the rate card
   *  is reworked for next month. Readers who already hold a longer
   *  subscription keep it and keep the rate they paid; nothing about their
   *  order changes.
   *
   *  The pages below cope with a one-plan card: the "better monthly rate"
   *  line and the pro-rata worked example only appear when there is a longer
   *  plan to talk about. Put the longer plans back and they return by
   *  themselves.
   *
   *  What is coming is in `nextRateCard` further down — written out, and
   *  deliberately not in use.
   */
  plans: [
    { months: 1, rate: "₹375", total: "₹375", note: "one envelope" },
  ],
  currency: "INR",

  /*  ── NEXT MONTH'S RATE CARD — NOT IN USE ───────────────────────────────
   *
   *  Planned from October 2026. Nothing reads this: it is here so the figures
   *  live beside the ones they replace rather than in a note somewhere.
   *
   *  The full changeover — including the four places that reject a 12-month
   *  plan today, and the two readers who move onto the founding rate — is
   *  written out step by step in backend/NEXT-MONTH-RATE-CHANGE.md. Follow
   *  that; this is only the figures.
   *
   *  Totals, not monthly rates — the monthly rate is the total divided by the
   *  months, which is what the plans table stores.
   */
  nextRateCard: [
    { months: 1, total: "₹499", perMonth: "₹499" },
    { months: 3, total: "₹1,380", perMonth: "₹460" },
    { months: 6, total: "₹2,640", perMonth: "₹440" },
    { months: 12, total: "₹5,040", perMonth: "₹420" },
  ],

  /*  What a founding member pays from next month, whatever length they take.
   *  It matches the twelve-month rate above, so a founding member always pays
   *  the best price on the card.
   *
   *  NOT APPLIED YET, and it must not be until the rate card above is: today
   *  the standard rate is ₹375, so ₹420 would charge a founding member more
   *  than a stranger pays. It is ₹315 in the database until then.
   *
   *  The two readers on six-month subscriptions are to get this same rate.
   *  They are not founding members today; add them to `founding_members` when
   *  the rate changes, keyed on their phone number, and it applies to what
   *  they take next. It does not touch the six months they have already paid
   *  for.
   *
   *  Who they are is not written here on purpose — this repository is public.
   *  They are the only two on a six-month plan, so the admin subscription list
   *  identifies them. The full changeover is in the planning note kept beside
   *  the backend, which is git-ignored for the same reason.
   */
  foundingNextRate: "₹420",

  /* ── the timetable ───────────────────────────────────────────────────── */
  /* The same 15th-to-5th window the backend enforces in app/cycles.py. */
  window: { opensDay: "15th", closesDay: "5th" },
  dispatchWindow: "within 10 days of the 5th",
  deliveryEstimate: "up to a week from dispatch",
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

    /*  What a letter abroad is expected to cost, in US dollars.
     *
     *  INDICATIVE, and said so wherever it is shown. The export process is
     *  still being set up and nothing can be sold at this figure yet — the
     *  `international` rows in the plans table are still inactive. It is
     *  published so that nobody joins the waiting list imagining the India
     *  price and then meets this one.
     *
     *  Mirrors INTERNATIONAL_INDICATIVE_USD in
     *  backend/app/routers/subscriptions.py, which serves it on /api/config.
     *  Change one, change the other. When the real rates are set, they go in
     *  the plans table and this can go. */
    indicativeUsdPerLetter: 12,

    /*  Roughly how long the export paperwork is expected to take, told to
     *  people on the waiting list. Deliberately hedged on the page — it is a
     *  process with a government in it, and a date promised here is a date
     *  somebody holds us to. */
    setupDays: 10,

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
