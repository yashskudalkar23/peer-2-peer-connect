/* =========================================================================
   Connect — peer-to-peer student mentoring prototype
   script.js — vanilla JS, no frameworks, no back end.
   Wrapped in an IIFE and started on DOMContentLoaded so it runs once.
   All state lives in one object; "Reset demo" rebuilds it from freshState().
   ========================================================================= */
(function () {
  "use strict";

  /* ----------------------------------------------------------------------
     1. SMALL HELPERS
     ---------------------------------------------------------------------- */
  const $ = (sel, root) => (root || document).querySelector(sel);
  const el = (id) => document.getElementById(id);

  // Escape user text before inserting into HTML (prevents markup injection).
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  const initials = (name) =>
    String(name || "?").trim().split(/\s+/).slice(0, 2).map(w => w[0] || "").join("").toUpperCase() || "?";

  const uid = (() => { let n = 1; return (p) => (p || "id") + "_" + (n++); })();

  // "arrays overlap?" helper
  const shares = (a, b) => (a || []).some(x => (b || []).includes(x));
  const sharedList = (a, b) => (a || []).filter(x => (b || []).includes(x));

  /* ----------------------------------------------------------------------
     2. INLINE SVG ICONS (line style)
     ---------------------------------------------------------------------- */
  const I = {
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M9.5 21v-6h5v6"/></svg>',
    match: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="8" r="3.2"/><circle cx="16" cy="16" r="3.2"/><path d="M10.4 10.4 13.6 13.6"/></svg>',
    chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h16v11H9l-5 4z"/></svg>',
    library: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h5v16H5z"/><path d="M12 4h3l4 15-3 1z"/></svg>',
    me: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="3.6"/><path d="M5 20c1.5-3.6 4-5.2 7-5.2S17.5 16.4 19 20"/></svg>',
    bell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6z"/><path d="M10 20a2 2 0 0 0 4 0"/></svg>',
    cal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="5" width="16" height="16" rx="2.5"/><path d="M4 9h16M8 3v4M16 3v4"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.5 9 17.5 20 6.5"/></svg>',
    chev: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 6c-2-1.5-5-1.5-7 0v12c2-1.5 5-1.5 7 0 2-1.5 5-1.5 7 0V6c-2-1.5-5-1.5-7 0z"/></svg>',
    coin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8"/><path d="M12 8v8M9.5 9.5h4a1.5 1.5 0 0 1 0 3h-3a1.5 1.5 0 0 0 0 3h4"/></svg>',
    folder: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>',
    star: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3l2.6 5.5 6 .8-4.4 4.2 1.1 6L12 16.9 6.7 19.5l1.1-6L3.4 9.3l6-.8z"/></svg>',
    send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12l16-7-7 16-2.5-6.5z"/></svg>',
    attach: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M8 12l6-6a3 3 0 0 1 4 4l-7 7a5 5 0 0 1-7-7l7-7"/></svg>',
    dots: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="19" cy="12" r="1.8"/></svg>',
    learn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8l9-4 9 4-9 4z"/><path d="M7 10v5c0 1.5 2.5 2.5 5 2.5s5-1 5-2.5v-5"/></svg>',
    teach: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/></svg>',
    both: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 7h10M17 7l-3-3M17 7l-3 3"/><path d="M17 17H7M7 17l3-3M7 17l3 3"/></svg>',
    shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z"/><path d="M9 12l2 2 4-4"/></svg>',
    flag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 21V4h11l-2 4 2 4H5"/></svg>',
    dl: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11M8 11l4 4 4-4M5 20h14"/></svg>',
    gear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/></svg>',
    trophy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4h10v4a5 5 0 0 1-10 0z"/><path d="M7 5H4v2a3 3 0 0 0 3 3M17 5h3v2a3 3 0 0 1-3 3M9 15h6M10 15v4M14 15v4M8 21h8"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/></svg>',
    help: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.2 2.4c-.7.3-1.2.8-1.2 1.6M12 17h.01"/></svg>',
    alert: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 2 20h20z"/><path d="M12 9v5M12 17h.01"/></svg>',
    calsm: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="14" height="13" rx="2"/><path d="M3 8h14M7 2v4M13 2v4"/></svg>'
  };

  /* ----------------------------------------------------------------------
     3. STATIC OPTION LISTS (shared by questionnaires)
     ---------------------------------------------------------------------- */
  const SUBJECTS = ["Financial Accounting", "Excel", "Statistics", "Marketing", "Public Speaking", "Graphic Design"];
  const LANGS = ["English", "Hindi", "Marathi"];
  const FORMATS = ["Chat", "WhatsApp voice call", "Phone call", "Video call", "In person"];
  const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const HELP_TYPES = ["Understanding subjects", "Exam preparation", "Assignments", "Projects / blackbooks",
    "Presentations", "Practical skills", "Career guidance", "Internships", "Communication skills",
    "Software / tools", "Study techniques", "Personal development"];
  const CONFIDENCE = ["Beginner", "Know the basics", "Intermediate", "Confident but need practice"];
  const LEARN_STYLE = ["Examples", "Step by step", "Practice problems", "Visual aids", "Discussion"];
  const GUIDANCE = ["Explain concepts", "Review my work", "Set me tasks", "Accountability check-ins"];
  const COURSES = ["BBA", "BCom", "BMS", "BA", "BSc", "BTech", "Other"];
  const TIMES = ["Morning", "Afternoon", "Evening"];

  /* ----------------------------------------------------------------------
     4. SEED MENTORS (skills map drives the real matching engine)
     ---------------------------------------------------------------------- */
  function seedMentors() {
    return [
      { id: "m_aarti", name: "Aarti Desai", course: "BCom", year: "TY", rating: 4.8, sessions: 34,
        langs: ["English", "Hindi", "Marathi"], days: ["Mon", "Wed", "Fri", "Sat"],
        formats: ["Chat", "Video call", "WhatsApp voice call"],
        bio: "TY BCom. I cleared Financial Accounting with a distinction and I love making journal entries finally click for people.",
        capacity: "Up to 4 mentees", help: ["Understanding subjects", "Exam preparation", "Assignments"],
        skills: { "Financial Accounting": 92, "Excel": 80, "Statistics": 66, "Marketing": 45, "Public Speaking": 35, "Graphic Design": 20 } },

      { id: "m_sneha", name: "Sneha Nair", course: "BSc", year: "TY", rating: 4.9, sessions: 41,
        langs: ["English", "Marathi"], days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
        formats: ["Chat", "Video call", "In person"],
        bio: "Statistics is just storytelling with numbers. I tutor stats and Excel and I keep things very step-by-step.",
        capacity: "Up to 3 mentees", help: ["Understanding subjects", "Practical skills", "Study techniques"],
        skills: { "Statistics": 94, "Excel": 88, "Financial Accounting": 72, "Marketing": 30, "Public Speaking": 25, "Graphic Design": 40 } },

      { id: "m_imran", name: "Imran Shaikh", course: "BTech", year: "SY", rating: 4.7, sessions: 28,
        langs: ["English", "Hindi"], days: ["Wed", "Fri", "Sat", "Sun"],
        formats: ["Chat", "Video call"],
        bio: "I'm a tools person — Excel, design software, automation. I'll show you the shortcuts that actually save time.",
        capacity: "Up to 5 mentees", help: ["Software / tools", "Practical skills", "Projects / blackbooks"],
        skills: { "Excel": 95, "Graphic Design": 84, "Statistics": 76, "Financial Accounting": 40, "Marketing": 50, "Public Speaking": 20 } },

      { id: "m_meera", name: "Meera Joshi", course: "BBA", year: "TY", rating: 4.8, sessions: 25,
        langs: ["English", "Hindi"], days: ["Tue", "Wed", "Thu", "Sun"],
        formats: ["Chat", "Video call", "WhatsApp voice call"],
        bio: "Design + marketing. I help with posters, decks and brand projects — and I'm honest about what works.",
        capacity: "Up to 3 mentees", help: ["Projects / blackbooks", "Presentations", "Software / tools"],
        skills: { "Graphic Design": 91, "Marketing": 82, "Excel": 68, "Financial Accounting": 60, "Statistics": 55, "Public Speaking": 30 } },

      { id: "m_rohan", name: "Rohan Mehta", course: "BMS", year: "SY", rating: 4.6, sessions: 21,
        langs: ["English", "Hindi"], days: ["Tue", "Thu", "Sat", "Sun"],
        formats: ["Chat", "Video call", "Phone call"],
        bio: "Marketing case comps are my thing. I also help people get over the fear of presenting.",
        capacity: "Up to 4 mentees", help: ["Career guidance", "Presentations", "Communication skills"],
        skills: { "Marketing": 90, "Public Speaking": 72, "Financial Accounting": 64, "Excel": 52, "Statistics": 35, "Graphic Design": 48 } },

      { id: "m_karan", name: "Karan Patil", course: "BA", year: "TY", rating: 4.5, sessions: 18,
        langs: ["English", "Hindi", "Marathi"], days: ["Mon", "Thu", "Sat"],
        formats: ["Chat", "Phone call", "In person", "Video call"],
        bio: "Debate team captain. Public speaking, structure, stage nerves — we'll practise out loud, not just theory.",
        capacity: "Up to 2 mentees", help: ["Communication skills", "Personal development", "Presentations"],
        skills: { "Public Speaking": 85, "Marketing": 74, "Graphic Design": 66, "Financial Accounting": 30, "Excel": 25, "Statistics": 20 } }
    ];
  }

  /* ----------------------------------------------------------------------
     5. FRESH STATE  (one object; Reset demo returns a new copy)
     ---------------------------------------------------------------------- */
  function freshState() {
    const today = new Date();
    const dstr = (offset) => {
      const d = new Date(today); d.setDate(d.getDate() + offset);
      return d.toISOString().slice(0, 10);
    };
    return {
      account: { name: "Yash Kadam", email: "yash.kadam@college.edu", college: "D. G. Ruparel College",
                 studentId: "", verified: false, password: "" },
      role: null,            // mentee | mentor | both
      mode: "mentee",        // active mode when role === both
      onboardedMentee: false,
      onboardedMentor: false,

      // Mentee questionnaire answers (seeded so matches/home are not empty)
      mentee: {
        course: "BCom", year: "TY", sem: "5", studying: ["Financial Accounting", "Statistics"],
        langs: ["English", "Hindi"],
        help: ["Understanding subjects", "Exam preparation"],
        subject: "Financial Accounting", reason: "I keep losing marks on adjustment entries.",
        goal: "Be able to finish a final-accounts sum without notes.", deadline: dstr(21),
        confidence: "Know the basics", hardest: "Adjustments and rectification of errors",
        learnStyle: ["Examples", "Step by step"], guidance: ["Explain concepts", "Review my work"], tried: "Yes, YouTube",
        formats: ["Chat", "Video call"], days: ["Mon", "Wed", "Fri", "Sat"], bestTime: "Evening",
        length: "45", freq: "Twice a week", preferredMentor: "Senior from my course",
        file: null, wantsMaterials: true, note: ""
      },

      // Mentor questionnaire answers
      mentor: {
        langs: ["English", "Hindi"], wants: ["Help others", "Earn approved Connect Credits"],
        teach: { "Marketing": "Confident but need practice" }, help: ["Presentations", "Career guidance"],
        experience: ["Scored well in the subject"], levels: ["Beginner", "Know the basics"], comfort: "Confident",
        style: ["Examples", "Discussion"], types: ["One-to-one"], wont: "", boundaries: "", wantsGuide: true,
        days: ["Tue", "Thu", "Sat"], hours: "3", maxMentees: 4, formats: ["Chat", "Video call"],
        reviewFirst: true, resources: ["Notes"], libraryContribution: "Yes", evidence: "Skip for now",
        agreed: false, acceptingRequests: true
      },

      mentors: seedMentors(),
      saved: [],                 // saved mentor ids
      matches: [],               // computed match results
      broadened: false,

      // active mentorship (mentee side) — seeded with Aarti
      mentorship: { mentorId: "m_aarti", topic: "Financial Accounting", status: "active", since: dstr(-9) },

      // requests the mentee has sent
      sentRequests: [
        { id: "req_seed", mentorId: "m_aarti", topic: "Financial Accounting",
          goal: "Final accounts without notes", when: "Wed evening", note: "", status: "accepted", at: dstr(-9) }
      ],
      // requests a mentor receives (used on the mentor side demo)
      received: [
        { id: "rin_1", from: { name: "Priya Shah", course: "BCom", year: "SY" }, topic: "Marketing",
          goal: "Understand the 4 Ps for my unit test", level: "Beginner", style: "Examples",
          when: "Thu evening", note: "Test is in 10 days.", status: "pending" },
        { id: "rin_2", from: { name: "Dev Rana", course: "BMS", year: "FY" }, topic: "Presentations",
          goal: "Calm my nerves before the fest pitch", level: "Know the basics", style: "Practice problems",
          when: "Sat afternoon", note: "", status: "pending" }
      ],

      // chat threads keyed by mentor/person id
      chats: {
        m_aarti: {
          who: "Aarti Desai", topic: "Financial Accounting",
          msgs: [
            { side: "sys", text: "Chat opened. Say hello and share what you're stuck on." },
            { side: "them", text: "Hey Yash! Saw your request — final accounts, right? Send me a sum you got stuck on and we'll go line by line.", t: "Mon 6:12pm" },
            { side: "me", text: "Thanks! It's the depreciation adjustment that throws me.", t: "Mon 6:20pm" },
            { side: "them", text: "Classic one. Let's do a quick 30-min video call this week — I'll screen-share a worked example.", t: "Mon 6:22pm" }
          ]
        }
      },

      sessions: [
        { id: "ses_1", withId: "m_aarti", with: "Aarti Desai", role: "mentee",
          date: dstr(2), time: "18:30", length: "45", format: "Video call",
          status: "upcoming", confMentee: true, confMentor: true, outcome: null }
      ],

      projects: [
        { id: "pr_1", name: "FA Blackbook — Final Accounts", subject: "Financial Accounting", deadline: dstr(14),
          status: "Awaiting Feedback", desc: "Chapter on preparation of final accounts with adjustments.",
          versions: [{ v: 1, note: "First draft", at: dstr(-3) }, { v: 2, note: "Fixed trial balance", at: dstr(-1) }],
          comments: [{ who: "Aarti Desai", text: "Good structure. Recheck the closing stock treatment in v2." }] },
        { id: "pr_2", name: "Statistics assignment set 3", subject: "Statistics", deadline: dstr(6),
          status: "Draft", desc: "Probability distributions practice set.",
          versions: [{ v: 1, note: "Started", at: dstr(-1) }], comments: [] }
      ],

      library: [
        { id: "lib_1", title: "Final Accounts — adjustments cheat sheet", subject: "Financial Accounting",
          sem: "Sem 5", by: "Aarti Desai", type: "Notes", vis: "Everyone at your college", status: "Approved", inReview: false,
          desc: "One-page summary of the 8 most common adjustment entries with the logic for each." },
        { id: "lib_2", title: "Excel for commerce — 20 shortcuts", subject: "Excel", sem: "Sem 3",
          by: "Imran Shaikh", type: "Guide", vis: "Everyone at your college", status: "Approved", inReview: false,
          desc: "The keyboard shortcuts and formulas that cover 80% of commerce coursework." },
        { id: "lib_3", title: "Statistics — probability practice (with answers)", subject: "Statistics", sem: "Sem 4",
          by: "Sneha Nair", type: "Practice questions", vis: "Everyone at your college", status: "Approved", inReview: false,
          desc: "30 graded questions moving from easy to exam-level, answers explained." },
        { id: "lib_4", title: "Marketing mix — case comp deck template", subject: "Marketing", sem: "Sem 4",
          by: "Rohan Mehta", type: "Presentation", vis: "Everyone at your college", status: "Approved", inReview: false,
          desc: "A clean 10-slide structure judges like, with speaker notes." },
        { id: "lib_5", title: "Public speaking — 5-minute warm-up routine", subject: "Public Speaking", sem: "Sem 5",
          by: "Karan Patil", type: "Guide", vis: "Everyone at your college", status: "In review", inReview: true,
          desc: "A short routine to steady your voice and breathing before you go on stage." }
      ],

      credits: {
        approved: 55, pending: 40, disputed: 0,
        ledger: [
          { id: "cr_1", date: dstr(-9), act: "Session attended with Aarti Desai", pts: 10, status: "Approved" },
          { id: "cr_2", date: dstr(-9), act: "Submitted session feedback", pts: 5, status: "Approved" },
          { id: "cr_3", date: dstr(-7), act: "Library upload (adjustments cheat sheet)", pts: 20, status: "Approved" },
          { id: "cr_4", date: dstr(-7), act: "Mentored Priya Shah (trial session)", pts: 20, status: "Approved" },
          { id: "cr_5", date: dstr(-2), act: "Library upload (in review)", pts: 20, status: "Pending" },
          { id: "cr_6", date: dstr(-1), act: "Project feedback given", pts: 20, status: "Pending" }
        ]
      },

      notifications: [
        { id: "nt_1", cat: "Request", title: "Aarti accepted your request", text: "Your Financial Accounting mentorship is active. Chat is open.", read: false, go: "chat", param: "m_aarti" },
        { id: "nt_2", cat: "Session", title: "Session confirmed", text: "Video call with Aarti in 2 days, 6:30pm.", read: false, go: "session", param: "ses_1" },
        { id: "nt_3", cat: "Credits", title: "Pending credits added", text: "+20 for your library upload — awaiting review.", read: true, go: "credits" }
      ],

      // reviews
      reviewsReceived: [
        { who: "Priya Shah", stars: 5, text: "Explained the 4 Ps so simply. Patient and clear." }
      ],
      reviewsGiven: [
        { who: "Aarti Desai", stars: 5, text: "Made final accounts finally make sense. Super organised." }
      ],

      // open product decisions (index of chosen option, or null)
      decisions: [null, null, null, null, null, null],

      settings: { push: true, reminders: true, collegeOnly: true, largeText: false, lang: "English" },

      badgesSeen: false,
      // transient UI state
      ui: { q: 1, qmentor: 1, reviewReturn: false, librarySearch: "", libraryCat: "All" }
    };
  }

  /* ----------------------------------------------------------------------
     6. GLOBAL STATE + NAV STACK
     ---------------------------------------------------------------------- */
  let S = freshState();
  let stack = [{ name: "welcome", params: {} }];   // navigation stack

  const top = () => stack[stack.length - 1];

  function go(name, params) {
    stack.push({ name, params: params || {} });
    render();
  }
  function replace(name, params) {
    stack[stack.length - 1] = { name, params: params || {} };
    render();
  }
  function reset(name, params) {
    stack = [{ name: name || "welcome", params: params || {} }];
    render();
  }
  function back() {
    if (stack.length > 1) { stack.pop(); render(); }
  }

  // Mentor object lookup
  const mentorById = (id) => S.mentors.find(m => m.id === id);

  /* ----------------------------------------------------------------------
     7. TOAST + SHEET
     ---------------------------------------------------------------------- */
  let toastTimer = null;
  function toast(msg) {
    const t = el("toast");
    t.textContent = msg; t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.hidden = true; }, 2300);
  }

  let sheetRenderer = null;
  function openSheet(content) {
    if (typeof content === "function") { sheetRenderer = content; el("sheet").innerHTML = content(); }
    else { sheetRenderer = null; el("sheet").innerHTML = content; }
    el("sheetWrap").hidden = false;
  }
  function renderSheet() { if (sheetRenderer) el("sheet").innerHTML = sheetRenderer(); }
  function closeSheet() { sheetRenderer = null; el("sheetWrap").hidden = true; el("sheet").innerHTML = ""; }

  /* ----------------------------------------------------------------------
     8. MATCHING ENGINE  (real logic)
     ---------------------------------------------------------------------- */
  function profLabel(p) {
    if (p >= 90) return "Strong understanding";
    if (p >= 75) return "Intermediate";
    if (p >= 60) return "Comfortable with the basics";
    return "Beginner level";
  }
  function matchTier(score) {
    if (score >= 85) return { label: "Strong match", cls: "ok" };
    if (score >= 70) return { label: "Good match", cls: "accent" };
    return { label: "Partial match", cls: "warn" };
  }

  // Build match list for the chosen subject using mentee preferences.
  function computeMatches() {
    const me = S.mentee;
    const subject = me.subject;
    const floor = S.broadened ? 50 : 60;
    const results = [];
    S.mentors.forEach(m => {
      if (!S.mentor.acceptingRequests && m.id === "self") return;         // (self not in list)
      const prof = m.skills[subject] || 0;
      if (prof < floor) return;
      const sDays = sharedList(me.days, m.days);
      const sLangs = sharedList(me.langs, m.langs);
      const sFormats = sharedList(me.formats, m.formats);
      let score = prof * 0.65 + (Math.min(sDays.length, 3) / 3) * 20;
      if (sLangs.length) score += 8;
      if (sFormats.length) score += 7;
      score = Math.min(98, Math.round(score));
      results.push({ mentor: m, prof, score, sDays, sLangs, sFormats });
    });
    results.sort((a, b) => b.score - a.score);
    return results.slice(0, 4);
  }

  /* ----------------------------------------------------------------------
     9. CREDITS + NOTIFICATIONS helpers
     ---------------------------------------------------------------------- */
  function addCredit(act, pts) {
    S.credits.pending += pts;
    S.credits.ledger.unshift({ id: uid("cr"), date: new Date().toISOString().slice(0, 10), act, pts, status: "Pending" });
  }
  function notify(cat, title, text, goName, param) {
    S.notifications.unshift({ id: uid("nt"), cat, title, text, read: false, go: goName, param });
  }
  const unreadCount = () => S.notifications.filter(n => !n.read).length;
  const pendingRequestCount = () => S.received.filter(r => r.status === "pending").length;

  /* ----------------------------------------------------------------------
     10. SCREEN REGISTRY
     Each entry is a function(params) -> {
       html, title, sub, action, tab, chrome ('full'|'noTabs'|'bare'),
       flush (bool), mount (fn run after inject)
     }
     ---------------------------------------------------------------------- */
  const SCREENS = {};

  /* ----------------------------------------------------------------------
     11. RENDER ENGINE
     ---------------------------------------------------------------------- */
  function render() {
    const cur = top();
    const def = SCREENS[cur.name];
    const scr = el("screen");

    // preserve scroll when re-rendering the same screen
    const prevScroll = scr.scrollTop;
    const sameScreen = scr.dataset.screen === cur.name;

    if (!def) { scr.innerHTML = '<div class="card">Screen not found: ' + esc(cur.name) + "</div>"; return; }
    const view = def(cur.params) || {};
    const chrome = view.chrome || "full";

    // Chrome mode drives the layout (sidebar / topbar / bottom nav) via CSS
    el("app").dataset.chrome = chrome;

    // Header
    const head = el("apphead");
    if (chrome === "bare") {
      head.hidden = true;
    } else {
      head.hidden = false;
      el("hdTitle").textContent = view.title || "";
      const sub = el("hdSub");
      if (view.sub) { sub.hidden = false; sub.textContent = view.sub; } else { sub.hidden = true; }
      el("hdBack").style.visibility = stack.length > 1 ? "visible" : "hidden";
      el("hdAction").innerHTML = view.action || "";
      el("jumpBtnTop").hidden = (chrome !== "full");
    }

    // Content
    scr.classList.toggle("flush", !!view.flush);
    scr.innerHTML = view.html || "";
    scr.dataset.screen = cur.name;

    // Sidebar + bottom-nav (built always; CSS shows the right one per chrome)
    buildChrome(view.tab, cur.name);

    // scroll + focus
    if (sameScreen) scr.scrollTop = prevScroll; else scr.scrollTop = 0;
    if (view.mount) view.mount();
  }

  /* ----------------------------------------------------------------------
     12. CHROME — sidebar (desktop) + bottom nav (mobile)
     ---------------------------------------------------------------------- */
  function buildChrome(active, screenName) {
    const isMentor = (S.role === "mentor") || (S.role === "both" && S.mode === "mentor");
    const primary = [
      { k: "home", label: isMentor ? "Dashboard" : "Home", icon: I.home },
      isMentor ? { k: "requests", label: "Requests", icon: I.match, badge: pendingRequestCount() }
               : { k: "matches", label: "Find a mentor", icon: I.match },
      isMentor ? { k: "mentees", label: "Mentees", icon: I.chat }
               : { k: "chats", label: "Messages", icon: I.chat },
      { k: "library", label: "Library", icon: I.library },
      { k: "me", label: "Profile", icon: I.me }
    ];
    const secondary = [
      { k: "calendar", label: "Calendar", icon: I.cal },
      { k: "credits", label: "Connect Credits", icon: I.coin }
    ];
    const navKeys = ["home", "matches", "requests", "mentees", "chats", "library", "me", "calendar", "credits"];
    const activeKey = navKeys.includes(screenName) ? screenName : active;

    // Bottom nav (mobile) — short labels
    const shortLbl = { home: "Home", matches: "Matches", chats: "Chats", requests: "Requests", mentees: "Mentees", library: "Library", me: "Me" };
    el("tabbar").innerHTML = primary.map(t => {
      const cur = t.k === activeKey ? ' aria-current="page"' : "";
      const badge = t.badge ? '<span class="badge">' + t.badge + "</span>" : "";
      const lbl = shortLbl[t.k] || t.label;
      return '<button class="tab" data-tab="' + t.k + '"' + cur + ' aria-label="' + esc(lbl) + '">' +
        '<span class="tab-dot"></span>' + t.icon + badge + "<span>" + esc(lbl) + "</span></button>";
    }).join("");

    // Sidebar (desktop)
    const item = (t) => {
      const cur = t.k === activeKey ? ' aria-current="page"' : "";
      const badge = t.badge ? '<span class="count badge">' + t.badge + "</span>" : "";
      return '<button class="nav-item" data-tab="' + t.k + '"' + cur + ">" + t.icon + "<span>" + esc(t.label) + "</span>" + badge + "</button>";
    };
    el("navList").innerHTML = primary.map(item).join("") + '<div class="nav-sep"></div>' + secondary.map(item).join("");
  }

  /* ----------------------------------------------------------------------
     13. SCREEN INDEX (desktop reviewer panel + mobile bottom sheet)
     ---------------------------------------------------------------------- */
  const INDEX_GROUPS = [
    { h: "Start", items: [["welcome", "Welcome"], ["register", "Register"], ["verify", "Verify email"], ["role", "Choose role"]] },
    { h: "Learner questionnaire", items: [["q1", "Step 1 About"], ["q2", "Step 2 Goals"], ["q3", "Step 3 Needs"], ["q4", "Step 4 When/how"], ["q5", "Step 5 Extras"], ["qreview", "Review"]] },
    { h: "Matching & requests", items: [["matches", "Matches"], ["requestForm", "Request form"], ["requestStatus", "Request status"]] },
    { h: "Mentor side", items: [["mq1", "Mentor Q1"], ["mq2", "Mentor Q2"], ["mq3", "Mentor Q3"], ["mq4", "Mentor Q4"], ["mq5", "Mentor Q5"], ["mverify", "Verification"], ["mdash", "Dashboard"], ["requests", "Received"], ["mentees", "Mentees"]] },
    { h: "Mentoring", items: [["home", "Home"], ["chats", "Messages"], ["library", "Library"], ["projects", "Projects"]] },
    { h: "Credits & more", items: [["credits", "Credits"], ["achievements", "Achievements"], ["calendar", "Calendar"], ["notifications", "Notifications"], ["me", "Profile"], ["reviews", "Reviews"], ["settings", "Settings"], ["help", "Help"], ["decisions", "Open decisions"]] }
  ];
  function openScreensSheet() {
    openSheet('<h3>Jump to a screen</h3><p class="small muted mb">Reviewer shortcut — not part of the student flow.</p>' +
      INDEX_GROUPS.map(g => '<div class="sec-label">' + g.h + '</div><div class="chips">' +
        g.items.map(it => '<button class="chip sm" data-go="' + it[0] + '" data-sheet-go="1">' + esc(it[1]) + "</button>").join("") +
        "</div>").join(""));
  }

  /* ----------------------------------------------------------------------
     14. GENERIC CHIP / MULTISELECT STATE HELPERS
     data-k="path" toggles a value inside a target array or sets a single value.
     We read/write directly against S via a dotted path.
     ---------------------------------------------------------------------- */
  function getPath(path) {
    return path.split(".").reduce((o, k) => (o == null ? o : o[k]), S);
  }
  function setPath(path, val) {
    const parts = path.split("."); const last = parts.pop();
    const obj = parts.reduce((o, k) => o[k], S);
    obj[last] = val;
  }
  // toggle a value in an array at path
  function toggleIn(path, val) {
    const arr = getPath(path) || [];
    const i = arr.indexOf(val);
    if (i >= 0) arr.splice(i, 1); else arr.push(val);
    setPath(path, arr);
  }

  /* ----------------------------------------------------------------------
     15. EVENT DELEGATION (no inline handlers anywhere)
     ---------------------------------------------------------------------- */
  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-go],[data-tab],[data-act],[data-k],[data-back]");
    if (!t) return;

    // navigation
    if (t.dataset.back != null) { back(); return; }
    if (t.dataset.go) {
      if (t.dataset.sheetGo) closeSheet();
      handleGo(t.dataset.go, t.dataset.param);
      return;
    }
    if (t.dataset.tab) { handleTab(t.dataset.tab); return; }

    // chip / multiselect toggles
    if (t.dataset.k) {
      const mode = t.dataset.kmode || "multi";
      if (mode === "multi") {
        toggleIn(t.dataset.k, t.dataset.val);
      } else { // single-select
        setPath(t.dataset.k, t.dataset.val);
      }
      // re-render the sheet if the chip is inside one, otherwise the screen
      if (t.closest("#sheet")) renderSheet(); else render();
      return;
    }

    // actions
    if (t.dataset.act) { handleAct(t.dataset.act, t, e); return; }
  });

  // live inputs (search box, text fields that must not lose focus)
  document.addEventListener("input", (e) => {
    const t = e.target;
    if (t.dataset && t.dataset.model) {
      setPath(t.dataset.model, t.value);
      // live library search updates list in place without full re-render
      if (t.dataset.model === "ui.librarySearch") renderLibraryList();
    }
  });

  function handleGo(name, param) {
    // special pseudo-destinations
    if (name === "chat") { go("chat", { id: param || "m_aarti" }); return; }
    if (name === "session") { go("session", { id: param }); return; }
    if (name === "mentor") { go("mentorProfile", { id: param }); return; }
    go(name, param ? { id: param } : {});
  }

  function handleTab(k) {
    const map = { home: "home", matches: "matches", chats: "chats", library: "library", me: "me",
                  requests: "requests", mentees: "mentees", calendar: "calendar", credits: "credits" };
    reset(map[k] || "home");
  }

  /* ----------------------------------------------------------------------
     16. REUSABLE UI BUILDERS
     ---------------------------------------------------------------------- */
  function avatar(name, cls) {
    return '<span class="avatar ' + (cls || "") + '" aria-hidden="true">' + esc(initials(name)) + "</span>";
  }
  function starsRow(n) {
    let h = '<span class="stars" aria-label="' + n + ' out of 5">';
    for (let i = 1; i <= 5; i++) h += '<span class="' + (i <= n ? "on" : "off") + '">' + I.star + "</span>";
    return h + "</span>";
  }
  function stepbar(cur, total) {
    let h = '<div class="stepbar" aria-label="Step ' + cur + " of " + total + '">';
    for (let i = 1; i <= total; i++) h += '<span class="' + (i <= cur ? "on" : "") + '"></span>';
    return h + "</div>";
  }
  // chip group bound to a state path. single=true sets a single value.
  function chipGroup(path, options, opts) {
    opts = opts || {};
    const cur = getPath(path);
    const kmode = opts.single ? "single" : "multi";
    return '<div class="chips">' + options.map(o => {
      const val = typeof o === "object" ? o.v : o;
      const label = typeof o === "object" ? o.l : o;
      const on = opts.single ? (cur === val) : ((cur || []).includes(val));
      return '<button class="chip" role="button" data-k="' + path + '" data-val="' + esc(val) +
        '" data-kmode="' + kmode + '" aria-pressed="' + on + '">' + esc(label) + "</button>";
    }).join("") + "</div>";
  }
  function fieldText(label, model, opts) {
    opts = opts || {};
    const v = esc(getPath(model) || opts.value || "");
    const type = opts.type || "text";
    const tag = opts.textarea
      ? '<textarea data-model="' + model + '" placeholder="' + esc(opts.ph || "") + '">' + v + "</textarea>"
      : '<input type="' + type + '" data-model="' + model + '" value="' + v + '" placeholder="' + esc(opts.ph || "") + '" />';
    return '<div class="field"><label>' + esc(label) + "</label>" + tag +
      (opts.hint ? '<div class="hint">' + esc(opts.hint) + "</div>" : "") + "</div>";
  }
  function selectField(label, model, options) {
    const cur = getPath(model);
    return '<div class="field"><label>' + esc(label) + '</label><select data-model="' + model + '">' +
      options.map(o => '<option' + (o === cur ? " selected" : "") + ">" + esc(o) + "</option>").join("") +
      "</select></div>";
  }

  /* ----------------------------------------------------------------------
     17. SCREENS — ONBOARDING
     ---------------------------------------------------------------------- */
  SCREENS.welcome = () => ({
    chrome: "bare",
    html:
      '<div class="hero">' +
        '<span class="logo-mark" aria-hidden="true"><i class="c1"></i><i class="c2"></i></span>' +
        '<h1>Learn from a student who just got it.</h1>' +
        '<p>Connect matches you with a senior or peer who recently cleared what you\'re stuck on — by subject, confidence, language, format and the days you\'re both free.</p>' +
      "</div>" +
      '<div class="stack mt-l" style="padding:0 6px 10px">' +
        '<button class="btn primary" data-go="register">Get started</button>' +
        '<button class="btn ghost" data-act="login">Log in</button>' +
        '<button class="btn ghost" data-act="terms" style="border:none">Terms and Privacy</button>' +
      "</div>" +
      '<div class="demo-note" style="margin:6px 6px">' + I.alert + '<span>This is a clickable demo seeded with sample data. Nothing is saved and state resets when you reload.</span></div>'
  });

  SCREENS.register = () => ({
    chrome: "noTabs", title: "Create your account", sub: "Use your college email",
    html:
      '<div class="card stack">' +
        fieldText("Full name", "account.name") +
        fieldText("College email", "account.email", { type: "email", hint: "We'll send a verification code (demo: it's pre-filled)." }) +
        fieldText("Password", "account.password", { type: "password", hint: "At least 6 characters." }) +
        selectField("College", "account.college", ["D. G. Ruparel College", "Mithibai College", "Jai Hind College", "K. C. College", "Other"]) +
        fieldText("Student ID (optional)", "account.studentId", { hint: "Helps your college verify you later. You can add this anytime." }) +
      "</div>" +
      '<div id="regErr"></div>' +
      '<div class="stack mt">' +
        '<button class="btn primary" data-act="register-submit">Verify and continue</button>' +
        '<button class="btn ghost" data-go="verify">I already have an account</button>' +
      "</div>"
  });

  SCREENS.verify = () => ({
    chrome: "noTabs", title: "Verify your email", sub: S.account.email,
    html:
      '<div class="card center stack">' +
        "<p class=\"lede\">Enter the 6-digit code we sent you.</p>" +
        '<input id="otp" type="text" inputmode="numeric" maxlength="6" value="408213" style="text-align:center;letter-spacing:10px;font-family:var(--font-head);font-size:26px;font-weight:700" aria-label="Verification code" />' +
        '<div class="demo-note">' + I.alert + "<span>Demo code is pre-filled. In the real app this arrives by email.</span></div>" +
      "</div>" +
      '<button class="btn primary mt" data-act="verify-submit">Verify</button>' +
      '<button class="btn ghost mt-s" data-act="resend">Resend code</button>'
  });

  SCREENS.role = () => ({
    chrome: "noTabs", title: "How do you want to start?", sub: "You can switch anytime",
    html:
      '<div class="stack">' +
        '<button class="role-card" data-act="role-mentee"><span class="rc-ico">' + I.learn + '</span><span><h3>I want to learn</h3><p>Find a mentor who recently cleared what you\'re working on.</p></span></button>' +
        '<button class="role-card" data-act="role-mentor"><span class="rc-ico">' + I.teach + '</span><span><h3>I want to mentor</h3><p>Share a subject or skill you\'re good at and earn Connect Credits.</p></span></button>' +
        '<button class="role-card" data-act="role-both"><span class="rc-ico">' + I.both + '</span><span><h3>Both</h3><p>Learn some things, teach others — one account, switch modes.</p></span></button>' +
      "</div>"
  });

  /* ----------------------------------------------------------------------
     SCREENS — MENTEE QUESTIONNAIRE (5 steps + review)
     ---------------------------------------------------------------------- */
  function qNav(next, label) {
    return '<div class="btn-row mt-l">' +
      '<button class="btn ghost" data-back>Back</button>' +
      '<button class="btn primary" data-act="qnext" data-next="' + next + '">' + esc(label || "Next") + "</button></div>";
  }
  const qHead = (n) => stepbar(n, 5) + '<p class="small muted mt-s">Step ' + n + " of 5</p>";

  SCREENS.q1 = () => ({
    chrome: "noTabs", title: "About you",
    html: qHead(1) +
      '<div class="field mt"><label>Name</label><input type="text" value="' + esc(S.account.name) + '" readonly aria-readonly="true" /></div>' +
      '<div class="sec-label">Course</div>' + chipGroup("mentee.course", COURSES, { single: true }) +
      '<div class="sec-label">Year</div>' + chipGroup("mentee.year", ["FY", "SY", "TY"], { single: true }) +
      selectField("Semester", "mentee.sem", ["1", "2", "3", "4", "5", "6"]) +
      '<div class="sec-label">Subjects you\'re studying now</div>' + chipGroup("mentee.studying", SUBJECTS) +
      '<div class="sec-label">Languages you\'re comfortable in</div>' + chipGroup("mentee.langs", LANGS) +
      qNav("q2")
  });

  SCREENS.q2 = () => ({
    chrome: "noTabs", title: "Learning goals", sub: "This drives your matches",
    html: qHead(2) +
      '<div class="sec-label">What kind of help do you want?</div>' + chipGroup("mentee.help", HELP_TYPES) +
      '<div class="sec-label">First subject or skill</div>' + chipGroup("mentee.subject", SUBJECTS, { single: true }) +
      '<p class="tiny muted mt-s">Tip: pick <b>Public Speaking</b> to see how Connect handles a subject with few strong mentors.</p>' +
      fieldText("Why this subject?", "mentee.reason", { textarea: true, ph: "What's going on with it right now?" }) +
      fieldText("Your goal for the next month", "mentee.goal", { ph: "e.g. finish a sum without notes" }) +
      fieldText("Deadline (if any)", "mentee.deadline", { type: "date" }) +
      qNav("q3")
  });

  SCREENS.q3 = () => ({
    chrome: "noTabs", title: "Your learning needs",
    html: qHead(3) +
      '<div class="sec-label">How confident are you right now?</div>' + chipGroup("mentee.confidence", CONFIDENCE, { single: true }) +
      fieldText("The hardest part for you", "mentee.hardest", { ph: "Be specific — it helps the mentor prep" }) +
      '<div class="sec-label">How do you learn best?</div>' + chipGroup("mentee.learnStyle", LEARN_STYLE) +
      '<div class="sec-label">What guidance do you want?</div>' + chipGroup("mentee.guidance", GUIDANCE) +
      '<div class="sec-label">Have you tried learning it already?</div>' + chipGroup("mentee.tried", ["Yes, a lot", "A little", "Not yet"], { single: true }) +
      qNav("q4")
  });

  SCREENS.q4 = () => ({
    chrome: "noTabs", title: "When and how",
    html: qHead(4) +
      '<div class="sec-label">Formats you\'re open to</div>' + chipGroup("mentee.formats", FORMATS) +
      '<div class="sec-label">Days you\'re usually free</div>' + chipGroup("mentee.days", DAYS) +
      '<div class="sec-label">Best time of day</div>' + chipGroup("mentee.bestTime", TIMES, { single: true }) +
      '<div class="sec-label">Session length (minutes)</div>' + chipGroup("mentee.length", ["15", "30", "45", "60"], { single: true }) +
      selectField("How often?", "mentee.freq", ["Once a week", "Twice a week", "Every other week", "As needed"]) +
      selectField("Preferred mentor", "mentee.preferredMentor", ["Senior from my course", "Anyone with the skill", "No preference"]) +
      qNav("q5")
  });

  SCREENS.q5 = () => ({
    chrome: "noTabs", title: "A few extras", sub: "All optional",
    html: qHead(5) +
      '<div class="card stack mt">' +
        '<div class="between"><span class="small">Add a file (brief, syllabus…)</span>' +
          '<button class="btn ghost sm" data-act="q-addfile">' + I.attach + " Add</button></div>" +
        '<div id="q-file" class="tiny muted">' + (S.mentee.file ? ("Attached: " + esc(S.mentee.file)) : "No file attached") + "</div>" +
      "</div>" +
      '<div class="sec-label">Want study-material recommendations?</div>' + chipGroup("mentee.wantsMaterials", [{ v: true, l: "Yes" }, { v: false, l: "No" }], { single: true }) +
      fieldText("Note to your future mentor", "mentee.note", { textarea: true, hint: "Share learning needs, not personal or sensitive details." }) +
      qNav("qreview", "Review")
  });

  SCREENS.qreview = () => {
    const m = S.mentee;
    const sec = (title, step, body) =>
      '<div class="card mb"><div class="between"><span class="card-title">' + esc(title) + "</span>" +
      '<button class="btn ghost sm" data-act="q-edit" data-step="' + step + '">Edit</button></div>' +
      '<div class="small muted mt-s">' + body + "</div></div>";
    return {
      chrome: "noTabs", title: "Check your answers", sub: "Edit anything before matching",
      html:
        sec("About you", "q1", esc(m.course + " " + m.year + " · Sem " + m.sem) + "<br>Studying: " + esc(m.studying.join(", ") || "—") + "<br>Languages: " + esc(m.langs.join(", "))) +
        sec("Goals", "q2", "Subject: <b>" + esc(m.subject) + "</b><br>Help: " + esc(m.help.join(", ") || "—") + "<br>Goal: " + esc(m.goal || "—")) +
        sec("Needs", "q3", "Confidence: " + esc(m.confidence) + "<br>Hardest: " + esc(m.hardest || "—") + "<br>Learns by: " + esc(m.learnStyle.join(", ") || "—")) +
        sec("When & how", "q4", "Formats: " + esc(m.formats.join(", ") || "—") + "<br>Free: " + esc(m.days.join(", ") || "—") + " · " + esc(m.bestTime) + "<br>" + esc(m.length) + " min, " + esc(m.freq)) +
        sec("Extras", "q5", "File: " + esc(m.file || "none") + "<br>Materials: " + (m.wantsMaterials ? "Yes" : "No") + "<br>Note: " + esc(m.note || "—")) +
        '<button class="btn primary mt" data-act="find-mentors">Find my mentors</button>'
    };
  };

  // Matching loader
  SCREENS.matching = () => ({
    chrome: "bare",
    html: '<div class="loader-screen"><div class="spinner" aria-hidden="true"></div>' +
      '<h3>Matching you with mentors</h3>' +
      '<p class="lede">Comparing subject, confidence, languages, formats and shared days.</p></div>',
    mount: () => { setTimeout(() => { S.broadened = false; replace("matches"); }, 1500); }
  });

  /* ----------------------------------------------------------------------
     SCREENS — MATCHES
     ---------------------------------------------------------------------- */
  SCREENS.matches = () => {
    const results = computeMatches();
    const subject = S.mentee.subject;
    let body = "";

    if (results.length < 3) {
      body += '<div class="notice mb">' + I.alert +
        " <b>Only " + results.length + " strong match" + (results.length === 1 ? "" : "es") + " for " + esc(subject) + ".</b>" +
        "<div class=\"small mt-s\">We won't pad the list with weak matches. You can broaden the filters to see mentors who are comfortable with the basics, or pick a different subject.</div>" +
        '<button class="btn signal sm mt" data-act="broaden" style="width:auto">Broaden filters</button></div>';
    }

    if (results.length === 0) {
      body += '<div class="card center"><p class="muted">No mentors clear the bar for this subject yet. Try broadening, or check back as more seniors join.</p></div>';
    }

    results.forEach(r => {
      const m = r.mentor, tier = matchTier(r.score);
      const why = [];
      why.push(profLabel(r.prof) + " in " + subject);
      if (r.sDays.length) why.push("Free together on " + r.sDays.slice(0, 3).join(", "));
      else why.push("No shared free days yet — you'd agree a time in chat");
      if (r.sLangs.length) why.push("Speaks " + r.sLangs.join(", "));
      if (r.sFormats.length) why.push("Offers " + r.sFormats.join(", "));
      const saved = S.saved.includes(m.id);

      body +=
        '<div class="card match-card mb" data-go="mentor" data-param="' + m.id + '" style="cursor:pointer">' +
          '<div class="row between">' +
            '<div class="row">' + avatar(m.name) +
              '<div><div class="card-title">' + esc(m.name) + "</div>" +
              '<div class="tiny muted">' + esc(m.course + " " + m.year) + " · " + starsRow(Math.round(m.rating)) + " " + m.rating + "</div></div></div>" +
            '<div class="ring" style="--val:' + r.score + '"><span class="ring-num">' + r.score + "</span></div>" +
          "</div>" +
          '<div class="mt-s"><span class="pill ' + tier.cls + '">' + tier.label + "</span> " +
            '<span class="pill plain accent">' + esc(profLabel(r.prof)) + "</span></div>" +
          (r.prof < 60 ? '<div class="warn-strip">' + I.alert + " Basics only — good for a first look, not deep prep.</div>" : "") +
          '<ul class="match-why">' + why.map(w => "<li>" + I.check + "<span>" + esc(w) + "</span></li>").join("") + "</ul>" +
        "</div>";
    });

    return {
      chrome: "full", tab: "matches", title: "Your mentors", sub: subject + " · sorted by fit",
      action: bellAction(),
      html: '<div class="demo-note mb">' + I.alert + "<span>Matches are computed live from the questionnaire — change your subject in Step 2 to see the logic shift.</span></div>" + body
    };
  };

  /* ----------------------------------------------------------------------
     SCREENS — MENTOR PROFILE
     ---------------------------------------------------------------------- */
  SCREENS.mentorProfile = (p) => {
    const m = mentorById(p.id) || S.mentors[0];
    const subject = S.mentee.subject;
    const saved = S.saved.includes(m.id);
    const skillBars = Object.keys(m.skills).sort((a, b) => m.skills[b] - m.skills[a]).map(sk => {
      const v = m.skills[sk], hi = sk === subject;
      return '<div class="skillbar ' + (hi ? "hi" : "") + '"><div class="sb-top"><span class="sb-name">' + esc(sk) + (hi ? " · your subject" : "") +
        '</span><span class="muted">' + esc(profLabel(v)) + '</span></div><div class="progress"><i style="width:' + v + '%"></i></div></div>';
    }).join("");
    const dayPills = '<div class="daypills">' + DAYS.map(d => '<span class="daypill ' + (m.days.includes(d) ? "on" : "") + '">' + d + "</span>").join("") + "</div>";

    return {
      chrome: "full", tab: "matches", title: m.name, sub: m.course + " " + m.year,
      html:
        '<div class="card center"><div class="row" style="justify-content:center">' + avatar(m.name, "lg") + "</div>" +
          '<h2 class="mt-s">' + esc(m.name) + "</h2>" +
          '<div class="small muted">' + starsRow(Math.round(m.rating)) + " " + m.rating + " · " + m.sessions + " sessions</div>" +
          '<p class="small mt-s">' + esc(m.bio) + "</p></div>" +
        '<div class="sec-label">Proficiency</div><div class="card">' + skillBars + "</div>" +
        '<div class="sec-label">Kinds of help</div><div class="chips">' + m.help.map(h => '<span class="chip sm" aria-pressed="false" style="pointer-events:none">' + esc(h) + "</span>").join("") + "</div>" +
        '<div class="sec-label">Availability</div><div class="card">' + dayPills +
          '<div class="small muted mt-s">Formats: ' + esc(m.formats.join(", ")) + "<br>Languages: " + esc(m.langs.join(", ")) + "<br>" + esc(m.capacity) + "</div></div>" +
        '<div class="sec-label">Reviews</div>' +
          '<div class="rev-card"><div class="rc-head"><b class="small">Priya S.</b>' + starsRow(5) + "</div><p class=\"small muted\">\"Really patient, explained the 4 Ps with real brand examples.\"</p></div>" +
        '<div class="btn-row mt">' +
          '<button class="btn primary" data-go="requestForm" data-param="' + m.id + '">Request mentorship</button>' +
          '<button class="btn ghost" data-act="toggle-save" data-id="' + m.id + '">' + (saved ? "Saved ✓" : "Save") + "</button>" +
        "</div>"
    };
  };

  /* ----------------------------------------------------------------------
     SCREENS — REQUEST FORM + STATUS
     ---------------------------------------------------------------------- */
  SCREENS.requestForm = (p) => {
    const m = mentorById(p.id) || S.mentors[0];
    const bothDays = sharedList(S.mentee.days, m.days);
    const slotDays = (bothDays.length ? bothDays : m.days).slice(0, 3);
    const slots = slotDays.map(d => d + " " + S.mentee.bestTime.toLowerCase());
    return {
      chrome: "full", tab: "matches", title: "Request mentorship", sub: "with " + m.name,
      html:
        '<div class="field"><label>Topic</label>' + chipGroup("_reqTopic", m.help.length ? SUBJECTS.filter(s => (m.skills[s] || 0) >= 50) : SUBJECTS, { single: true }) + "</div>" +
        fieldText("Your learning goal", "mentee.goal") +
        '<div class="sec-label">Suggested first session</div>' +
        (bothDays.length ? "" : '<p class="tiny muted mb">You have no overlapping free days — these are the mentor\'s days. You can finalise in chat.</p>') +
        '<div class="chips">' + slots.map((s, i) => '<button class="chip" data-act="pick-slot" data-slot="' + esc(s) + '" aria-pressed="' + (i === 0 ? "true" : "false") + '">' + esc(s) + "</button>").join("") + "</div>" +
        fieldText("Note (optional)", "_reqNote", { textarea: true, ph: "Anything the mentor should know" }) +
        '<button class="btn primary mt-l" data-act="send-request" data-id="' + m.id + '">Send request</button>',
      mount: () => { S._reqTopic = S._reqTopic || S.mentee.subject; S._reqSlot = S._reqSlot || slots[0]; }
    };
  };

  SCREENS.requestStatus = (p) => {
    const req = S.sentRequests.find(r => r.id === p.id) || S.sentRequests[S.sentRequests.length - 1];
    const m = mentorById(req.mentorId);
    const steps = ["Request sent", "Mentor is reviewing", "Decision", "Chat opens"];
    let reached = 1;
    if (req.status === "pending") reached = 2;
    if (req.status === "accepted") reached = 4;
    if (req.status === "declined") reached = 3;
    if (req.status === "rescheduled") reached = 3;

    const stepper = '<ul class="vstep">' + steps.map((s, i) => {
      const n = i + 1;
      const cls = n < reached ? "done" : (n === reached ? "current" : "upcoming");
      let sub = "";
      if (n === 3 && req.status === "declined") sub = "Declined";
      if (n === 3 && req.status === "accepted") sub = "Accepted 🎉";
      if (n === 3 && req.status === "rescheduled") sub = "New time suggested";
      return '<li class="' + cls + '"><span class="dot"><b></b><i></i></span><div class="vs-body"><div class="vs-title">' + esc(s) + "</div>" + (sub ? '<div class="vs-sub">' + esc(sub) + "</div>" : "") + "</div></li>";
    }).join("") + "</ul>";

    let extra = "";
    if (req.status === "declined") {
      extra = '<div class="card tintbg"><b class="small">Why it was declined</b><p class="small muted mt-s">' + esc(req.declineReason || "The mentor is at capacity this month. They\'ve suggested trying another mentor with similar strengths.") + "</p>" +
        '<button class="btn ghost mt" data-go="matches">Back to matches</button></div>';
    } else if (req.status === "rescheduled") {
      extra = '<div class="card"><b class="small">Suggested new time</b><p class="small mt-s">' + esc(req.newTime || "Sat evening") + "</p>" +
        '<div class="btn-row mt"><button class="btn primary" data-act="accept-reschedule" data-id="' + req.id + '">Accept new time</button>' +
        '<button class="btn ghost" data-go="matches">Choose another mentor</button></div></div>';
    } else if (req.status === "accepted") {
      extra = '<button class="btn primary" data-go="chat" data-param="' + req.mentorId + '">Open chat</button>';
    }

    return {
      chrome: "full", tab: "matches", title: "Request status", sub: m ? m.name : "",
      html:
        '<div class="card mb"><div class="row"><div class="grow"><div class="card-title">' + esc(req.topic) + "</div>" +
          '<div class="tiny muted">Sent to ' + esc(m ? m.name : "") + " · suggested " + esc(req.when) + "</div></div>" +
          '<span class="pill ' + (req.status === "accepted" ? "ok" : req.status === "declined" ? "bad" : "warn") + '">' + esc(req.status) + "</span></div></div>" +
        stepper + extra +
        '<div class="card tintbg mt-l"><b class="small">Demo control</b><p class="tiny muted mt-s">Play the mentor to respond to this request:</p>' +
          '<div class="chips mt-s">' +
            '<button class="chip sm" data-act="demo-respond" data-id="' + req.id + '" data-r="accepted">Accept</button>' +
            '<button class="chip sm" data-act="demo-respond" data-id="' + req.id + '" data-r="declined">Decline</button>' +
            '<button class="chip sm" data-act="demo-respond" data-id="' + req.id + '" data-r="rescheduled">Suggest another time</button>' +
          "</div></div>"
    };
  };

  function bellAction() {
    const c = unreadCount();
    return '<button class="icon-btn" data-go="notifications" aria-label="Notifications' + (c ? ", " + c + " unread" : "") + '" style="position:relative">' +
      I.bell + (c ? '<span class="badge" style="position:absolute;top:-4px;right:-4px">' + c + "</span>" : "") + "</button>";
  }

  /* ----------------------------------------------------------------------
     SCREENS — MENTOR QUESTIONNAIRE (5 steps)
     ---------------------------------------------------------------------- */
  function mqNav(next, label) {
    return '<div class="btn-row mt-l"><button class="btn ghost" data-back>Back</button>' +
      '<button class="btn primary" data-act="mqnext" data-next="' + next + '">' + esc(label || "Next") + "</button></div>";
  }
  const mqHead = (n) => stepbar(n, 5) + '<p class="small muted mt-s">Step ' + n + " of 5 · Mentor setup</p>";

  SCREENS.mq1 = () => ({
    chrome: "noTabs", title: "Your mentor profile",
    html: mqHead(1) +
      '<div class="field mt"><label>Name</label><input type="text" value="' + esc(S.account.name) + '" readonly /></div>' +
      '<div class="sec-label">Languages you can mentor in</div>' + chipGroup("mentor.langs", LANGS) +
      '<div class="sec-label">What do you want from mentoring?</div>' +
      chipGroup("mentor.wants", ["Help others", "Improve my own understanding", "Develop communication or leadership skills", "Earn approved Connect Credits", "Build experience"]) +
      mqNav("mq2")
  });

  SCREENS.mq2 = () => {
    const sel = Object.keys(S.mentor.teach);
    const teachChips = '<div class="chips">' + SUBJECTS.map(s =>
      '<button class="chip" data-act="toggle-teach" data-skill="' + esc(s) + '" aria-pressed="' + (sel.includes(s)) + '">' + esc(s) + "</button>").join("") + "</div>";
    const confRows = sel.map(s =>
      '<div class="field"><label>' + esc(s) + " — your confidence</label><select data-model=\"mentor.teach." + s + '">' +
        CONFIDENCE.map(c => '<option' + (S.mentor.teach[s] === c ? " selected" : "") + ">" + esc(c) + "</option>").join("") +
      "</select></div>").join("");
    return {
      chrome: "noTabs", title: "What you can teach",
      html: mqHead(2) +
        '<div class="sec-label">Skills you can teach</div>' + teachChips +
        (sel.length ? '<div class="card mt">' + confRows + "</div>" : '<p class="tiny muted mt-s">Pick at least one skill.</p>') +
        '<div class="sec-label">Kinds of help you offer</div>' + chipGroup("mentor.help", HELP_TYPES) +
        '<div class="sec-label">Your experience with these</div>' + chipGroup("mentor.experience", ["Scored well in the subject", "Did a related project", "Internship / work", "Teach juniors already"]) +
        '<div class="sec-label">Learner levels you\'re happy with</div>' + chipGroup("mentor.levels", CONFIDENCE) +
        selectField("How comfortable are you explaining this?", "mentor.comfort", ["Still learning myself", "Comfortable", "Confident", "Very confident"]) +
        '<p class="hint">Used for matching and support. Never an automatic rejection.</p>' +
        mqNav("mq3")
    };
  };

  SCREENS.mq3 = () => ({
    chrome: "noTabs", title: "How you mentor",
    html: mqHead(3) +
      '<div class="sec-label">Teaching style</div>' + chipGroup("mentor.style", LEARN_STYLE) +
      '<div class="sec-label">Mentoring types you offer</div>' + chipGroup("mentor.types", ["One-to-one", "Small group", "Async (chat only)", "Project review"]) +
      fieldText("Topics you won't mentor (optional)", "mentor.wont", { ph: "e.g. anything outside commerce" }) +
      fieldText("Your boundaries (optional)", "mentor.boundaries", { textarea: true, ph: "e.g. no calls after 9pm, replies within a day" }) +
      '<div class="sec-label">Want a short mentoring guide?</div>' + chipGroup("mentor.wantsGuide", [{ v: true, l: "Yes please" }, { v: false, l: "No thanks" }], { single: true }) +
      mqNav("mq4")
  });

  SCREENS.mq4 = () => ({
    chrome: "noTabs", title: "Your availability",
    html: mqHead(4) +
      '<div class="sec-label">Days available</div>' + chipGroup("mentor.days", DAYS) +
      selectField("Hours per week you can give", "mentor.hours", ["1", "2", "3", "4", "5", "6+"]) +
      '<div class="sec-label">How many mentees at once?</div>' + chipGroup("mentor.maxMentees", [{ v: 2, l: "2" }, { v: 3, l: "3" }, { v: 4, l: "4" }, { v: 5, l: "5" }], { single: true }) +
      '<div class="sec-label">Formats you offer</div>' + chipGroup("mentor.formats", FORMATS) +
      '<div class="sec-label">New requests</div>' +
      chipGroup("mentor.reviewFirst", [{ v: true, l: "Review each request first (recommended)" }, { v: false, l: "Accept automatically" }], { single: true }) +
      mqNav("mq5")
  });

  SCREENS.mq5 = () => ({
    chrome: "noTabs", title: "Resources & agreement",
    html: mqHead(5) +
      '<div class="sec-label">Resources you can share</div>' + chipGroup("mentor.resources", ["Notes", "Practice questions", "Presentation templates", "Project samples", "Reading lists"]) +
      '<div class="sec-label">Contribute to the library?</div>' + chipGroup("mentor.libraryContribution", ["Yes", "No", "Only my mentees"], { single: true }) +
      '<div class="sec-label">Evidence of your skill (optional)</div>' + chipGroup("mentor.evidence", ["Skip for now", "Coursework", "Sample resource", "Project", "Faculty verification"], { single: true }) +
      '<p class="hint">We do not ask for private documents.</p>' +
      '<label class="opt mt" data-act="toggle-agree" aria-pressed="' + S.mentor.agreed + '"><span class="opt-radio" style="border-radius:5px"></span>' +
        '<span class="small">I agree to the Connect guidelines: respectful communication, academic integrity, privacy, reliable attendance, and fair use of Connect Credits.</span></label>' +
      '<button class="btn primary mt-l" data-act="mentor-submit"' + (S.mentor.agreed ? "" : " disabled") + ">Submit and set up my profile</button>"
  });

  SCREENS.mverify = () => {
    const facultyNeeded = S.mentor.evidence === "Faculty verification";
    const steps = [
      { t: "Identity verified", s: "College email confirmed", done: true },
      { t: "Skills self-declared", s: "You told us what you can teach", done: true },
      { t: "Faculty check" + (facultyNeeded ? "" : " (not required)"), s: facultyNeeded ? "Pending — a faculty member will confirm" : "Skipped for your chosen skills", done: !facultyNeeded, current: facultyNeeded },
      { t: "Discoverable after checks", s: "You'll appear in matches once checks pass", done: false }
    ];
    return {
      chrome: "noTabs", title: "You're almost set", sub: "Verification",
      html: '<div class="card"><ul class="vstep">' + steps.map(st =>
        '<li class="' + (st.done ? "done" : st.current ? "current" : "upcoming") + '"><span class="dot"><b></b><i></i></span><div class="vs-body"><div class="vs-title">' + esc(st.t) + '</div><div class="vs-sub">' + esc(st.s) + "</div></div></li>").join("") + "</ul></div>" +
        '<div class="demo-note mt">' + I.shield + "<span>Connect Credits are earned transparently and are never presented as official marks — your college decides what they're worth.</span></div>" +
        '<button class="btn primary mt-l" data-act="go-dash">Go to mentor dashboard</button>'
    };
  };

  /* ----------------------------------------------------------------------
     SCREENS — MENTOR DASHBOARD
     ---------------------------------------------------------------------- */
  SCREENS.mdash = () => {
    const active = 2, cap = S.mentor.maxMentees;
    return {
      chrome: "full", tab: "home", title: "Mentor dashboard", sub: "Hi " + S.account.name.split(" ")[0], action: bellAction(),
      html:
        '<div class="tiles mb">' +
          '<button class="tile" data-go="requests"><span class="t-ico">' + I.match + '</span><span class="t-val">' + pendingRequestCount() + '</span><span class="t-lbl">Requests to review</span></button>' +
          '<div class="tile"><span class="t-ico">' + I.me + '</span><span class="t-val">' + active + "/" + cap + '</span><span class="t-lbl">Active mentees</span></div>' +
          '<button class="tile" data-go="calendar"><span class="t-ico">' + I.cal + '</span><span class="t-val">' + S.sessions.length + '</span><span class="t-lbl">Sessions</span></button>' +
          '<button class="tile" data-go="credits"><span class="t-ico">' + I.coin + '</span><span class="t-val">' + S.credits.approved + '</span><span class="t-lbl">Approved credits</span></button>' +
        "</div>" +
        '<div class="card between mb"><div><b class="small">Accepting new requests</b><div class="tiny muted">' + (S.mentor.acceptingRequests ? "You appear in student matches." : "You're hidden from matches.") + '</div></div>' +
          '<span class="switch"><button data-act="toggle-accepting" aria-pressed="' + S.mentor.acceptingRequests + '" aria-label="Accepting new requests"></button></span></div>' +
        '<div class="sec-label">Quick actions</div>' +
        '<div class="list linklist">' +
          '<div class="lrow" data-act="edit-availability"><span class="avatar sm signal">' + I.cal + '</span><div class="grow"><div class="lrow-title">Edit availability</div><div class="lrow-sub">Days & formats — no need to redo setup</div></div>' + '<span class="chev">' + I.chev + "</span></div>" +
          '<div class="lrow" data-act="edit-skills"><span class="avatar sm">' + I.teach + '</span><div class="grow"><div class="lrow-title">Edit skills</div><div class="lrow-sub">Update what you teach</div></div><span class="chev">' + I.chev + "</span></div>" +
          '<div class="lrow" data-act="upload-resource"><span class="avatar sm">' + I.library + '</span><div class="grow"><div class="lrow-title">Upload a resource</div><div class="lrow-sub">Earns +20 pending credits</div></div><span class="chev">' + I.chev + "</span></div>" +
        "</div>" +
        '<div class="sec-label">Your profile</div>' +
        '<div class="card"><div class="row">' + avatar(S.account.name) + '<div><div class="card-title">' + esc(S.account.name) + '</div><div class="tiny muted">Teaches: ' + esc(Object.keys(S.mentor.teach).join(", ") || "—") + "</div></div></div></div>"
    };
  };

  /* ----------------------------------------------------------------------
     SCREENS — RECEIVED REQUESTS (mentor)
     ---------------------------------------------------------------------- */
  SCREENS.requests = () => {
    const list = S.received.filter(r => r.status === "pending");
    let body = list.length ? "" : '<div class="card center"><p class="muted">No requests waiting. New ones will appear here.</p></div>';
    list.forEach(r => {
      body +=
        '<div class="card mb"><div class="row">' + avatar(r.from.name) +
          '<div class="grow"><div class="card-title">' + esc(r.from.name) + '</div><div class="tiny muted">' + esc(r.from.course + " " + r.from.year) + "</div></div>" +
          '<span class="pill warn">Pending</span></div>' +
          '<div class="small mt-s"><b>' + esc(r.topic) + "</b> — " + esc(r.goal) + "</div>" +
          '<div class="tiny muted mt-s">Level: ' + esc(r.level) + " · Learns by: " + esc(r.style) + " · Suggested: " + esc(r.when) + (r.note ? "<br>Note: " + esc(r.note) : "") + "</div>" +
          '<div class="btn-row mt"><button class="btn success sm" data-act="req-accept" data-id="' + r.id + '">Accept</button>' +
          '<button class="btn ghost sm" data-act="req-suggest" data-id="' + r.id + '">Suggest time</button>' +
          '<button class="btn danger-soft sm" data-act="req-decline" data-id="' + r.id + '">Decline</button></div></div>';
    });
    return { chrome: "full", tab: "requests", title: "Requests", sub: pendingRequestCount() + " waiting", action: bellAction(), html: body };
  };

  SCREENS.mentees = () => {
    const threads = Object.keys(S.chats);
    const body = threads.map(id => {
      const c = S.chats[id];
      const last = c.msgs[c.msgs.length - 1];
      return '<div class="lrow" data-go="chat" data-param="' + id + '">' + avatar(c.who) +
        '<div class="grow"><div class="lrow-title">' + esc(c.who) + '</div><div class="lrow-sub">' + esc(c.topic + " · " + (last ? last.text : "")) + "</div></div><span class=\"chev\">" + I.chev + "</span></div>";
    }).join("");
    return { chrome: "full", tab: "mentees", title: "Your mentees", action: bellAction(),
      html: (body || '<div class="card center muted">No active mentees yet.</div>') };
  };

  /* ----------------------------------------------------------------------
     SCREENS — HOME (mentee)
     ---------------------------------------------------------------------- */
  SCREENS.home = () => {
    // Mentor mode shows the dashboard instead
    if (S.role === "mentor" || (S.role === "both" && S.mode === "mentor")) return SCREENS.mdash();

    const next = S.sessions.find(s => s.status === "upcoming");
    const ship = S.mentorship;
    const m = ship ? mentorById(ship.mentorId) : null;
    const awaiting = S.projects.filter(p => p.status === "Awaiting Feedback").length;

    let shipCard;
    if (ship && m) {
      shipCard = '<div class="card mb"><div class="row between"><div class="row">' + avatar(m.name) +
        '<div><div class="card-title">' + esc(m.name) + '</div><div class="tiny muted">' + esc(ship.topic) + "</div></div></div>" +
        '<span class="pill ok">Active</span></div>' +
        '<div class="btn-row mt"><button class="btn primary sm" data-go="chat" data-param="' + m.id + '">Message</button>' +
        '<button class="btn ghost sm" data-go="mentor" data-param="' + m.id + '">View profile</button></div></div>';
    } else {
      shipCard = '<div class="card mb center"><p class="small muted">You don\'t have a mentor yet.</p>' +
        '<button class="btn primary mt-s" data-go="q1">Find your first mentor</button></div>';
    }

    return {
      chrome: "full", tab: "home", title: "Hi, " + esc(S.account.name.split(" ")[0]),
      sub: "Let's keep going",
      action: '<button class="icon-btn" data-go="calendar" aria-label="Calendar">' + I.cal + "</button>" + bellAction(),
      html:
        (next ? '<div class="card accent-card mb" style="border-color:var(--accent)"><div class="eyebrow">Next session</div>' +
          '<div class="row between mt-s"><div><b>' + esc(next.format) + " with " + esc(next.with) + "</b><div class=\"tiny muted\">" + fmtDate(next.date) + " · " + esc(next.time) + " · " + esc(next.length) + " min</div></div>" +
          '<button class="btn primary sm" data-go="session" data-param="' + next.id + '">Open</button></div></div>' : "") +
        '<div class="sec-label">Your mentorship</div>' + shipCard +
        '<div class="tiles">' +
          '<button class="tile" data-go="projects"><span class="t-ico">' + I.folder + '</span><span class="t-val">' + awaiting + '</span><span class="t-lbl">Projects awaiting feedback</span></button>' +
          '<button class="tile" data-go="credits"><span class="t-ico">' + I.coin + '</span><span class="t-val">' + S.credits.approved + '</span><span class="t-lbl">Credits · ' + S.credits.pending + ' pending</span></button>' +
          '<button class="tile" data-go="calendar"><span class="t-ico">' + I.cal + '</span><span class="t-val">' + S.sessions.length + '</span><span class="t-lbl">Calendar</span></button>' +
          '<button class="tile" data-go="library"><span class="t-ico">' + I.library + '</span><span class="t-val">' + S.library.length + '</span><span class="t-lbl">Library</span></button>' +
        "</div>" +
        '<button class="btn ghost mt-l" data-act="change-mentor">Request a mentor change</button>'
    };
  };

  /* ----------------------------------------------------------------------
     SCREENS — CHATS LIST + CHAT
     ---------------------------------------------------------------------- */
  SCREENS.chats = () => {
    const ids = Object.keys(S.chats);
    const body = ids.length ? ids.map(id => {
      const c = S.chats[id], last = c.msgs[c.msgs.length - 1];
      return '<div class="lrow" data-go="chat" data-param="' + id + '">' + avatar(c.who) +
        '<div class="grow"><div class="lrow-title">' + esc(c.who) + '</div><div class="lrow-sub">' + esc((last ? last.text : "").slice(0, 46)) + "</div></div><span class=\"chev\">" + I.chev + "</span></div>";
    }).join("") : '<div class="card center muted">No chats yet. Accept a match to start one.</div>';
    return { chrome: "full", tab: "chats", title: "Chats", action: bellAction(), html: body };
  };

  SCREENS.chat = (p) => {
    const id = p.id || "m_aarti";
    const c = S.chats[id] || (S.chats[id] = { who: "Mentor", topic: "", msgs: [] });
    const bubbles = c.msgs.map(msg => {
      if (msg.side === "sys") return '<div class="sys-msg">' + esc(msg.text) + "</div>";
      if (msg.side === "card") return '<div class="card chat-card">' + msg.text + "</div>";
      return '<div class="bubble ' + (msg.side === "me" ? "me" : "them") + '">' + esc(msg.text) +
        (msg.t ? '<span class="b-time">' + esc(msg.t) + "</span>" : "") + "</div>";
    }).join("");
    return {
      chrome: "full", tab: "chats", flush: true, title: c.who, sub: c.topic,
      action: '<button class="icon-btn" data-act="chat-menu" data-id="' + id + '" aria-label="Chat options">' + I.dots + "</button>",
      html:
        '<div class="chatwrap">' +
          '<div class="chat-quick">' +
            '<button class="chip sm" data-act="chat-schedule" data-id="' + id + '">' + I.cal + " Schedule</button>" +
            '<button class="chip sm" data-act="chat-resources" data-id="' + id + '">' + I.book + " Resources</button>" +
            '<button class="chip sm" data-act="chat-files" data-id="' + id + '">' + I.attach + " Files</button>" +
          "</div>" +
          '<div class="chat-scroll" id="chatScroll">' + bubbles + "</div>" +
          '<div class="chat-input"><button class="icon-btn" data-act="chat-attach" data-id="' + id + '" aria-label="Attach">' + I.attach + "</button>" +
            '<input type="text" id="chatText" placeholder="Message…" aria-label="Message" />' +
            '<button class="icon-btn accent" data-act="chat-send" data-id="' + id + '" aria-label="Send">' + I.send + "</button></div>" +
        "</div>",
      mount: () => {
        const sc = el("chatScroll"); if (sc) sc.scrollTop = sc.scrollHeight;
        const inp = el("chatText");
        if (inp) inp.addEventListener("keydown", (e) => { if (e.key === "Enter") sendChat(id); });
      }
    };
  };

  /* ----------------------------------------------------------------------
     SCREENS — SESSION
     ---------------------------------------------------------------------- */
  SCREENS.session = (p) => {
    const s = S.sessions.find(x => x.id === p.id) || S.sessions[0];
    const done = s.status === "done";
    return {
      chrome: "full", tab: "home", title: "Session", sub: s.with,
      html:
        '<div class="card"><div class="row between"><div><div class="eyebrow">' + esc(s.format) + '</div><h2 class="mt-s">' + fmtDate(s.date) + "</h2>" +
          '<div class="small muted">' + esc(s.time) + " · " + esc(s.length) + " min · with " + esc(s.with) + "</div></div>" +
          '<span class="pill ' + (done ? "ok" : "accent") + '">' + (done ? "Done" : "Upcoming") + "</span></div>" +
          '<div class="row mt" style="gap:8px"><span class="pill ' + (s.confMentee ? "ok" : "warn") + '">You ' + (s.confMentee ? "confirmed" : "pending") + "</span>" +
          '<span class="pill ' + (s.confMentor ? "ok" : "warn") + '">Mentor ' + (s.confMentor ? "confirmed" : "pending") + "</span></div></div>" +
        (s.outcome ? '<div class="card mt tintbg"><b class="small">Outcome</b><p class="small mt-s">' + esc(s.outcome.notes) + '</p><div class="small muted">Next: ' + esc(s.outcome.next) + "</div><div class=\"mt-s\">" + starsRow(s.outcome.stars) + "</div></div>" : "") +
        (done ? "" :
          '<div class="stack mt-l">' +
            '<button class="btn primary" data-act="session-confirm" data-id="' + s.id + '">' + (s.confMentee ? "You've confirmed" : "Confirm attendance") + "</button>" +
            '<div class="btn-row"><button class="btn ghost" data-act="session-reschedule" data-id="' + s.id + '">Reschedule</button>' +
            '<button class="btn ghost" data-act="session-join" data-id="' + s.id + '">Join call</button></div>' +
            '<button class="btn danger-soft" data-act="session-cancel" data-id="' + s.id + '">Cancel session</button>' +
            '<p class="tiny muted center">Late cancellation may affect your credits.</p>' +
            '<button class="btn success" data-act="session-finish" data-id="' + s.id + '">Session finished: record outcome</button>' +
          "</div>")
    };
  };

  /* ----------------------------------------------------------------------
     SCREENS — LIBRARY
     ---------------------------------------------------------------------- */
  const LIB_CATS = ["All", "Notes", "Presentation", "Practice questions", "Guide"];
  SCREENS.library = () => ({
    chrome: "full", tab: "library", title: "Library", sub: "Student-made resources",
    action: '<button class="icon-btn" data-act="library-upload" aria-label="Upload resource">' + I.plus + "</button>",
    html:
      '<input type="text" id="libSearch" data-model="ui.librarySearch" value="' + esc(S.ui.librarySearch) + '" placeholder="Search resources…" aria-label="Search resources" />' +
      '<div class="chips mt" id="libCats">' + LIB_CATS.map(c => '<button class="chip sm" data-act="lib-cat" data-cat="' + esc(c) + '" aria-pressed="' + (S.ui.libraryCat === c) + '">' + esc(c) + "</button>").join("") + "</div>" +
      '<div id="libList" class="mt">' + libraryListHTML() + "</div>",
    mount: () => { const i = el("libSearch"); if (i) { i.focus(); i.setSelectionRange(i.value.length, i.value.length); } }
  });

  function libraryListHTML() {
    const q = (S.ui.librarySearch || "").toLowerCase();
    const cat = S.ui.libraryCat;
    const items = S.library.filter(r =>
      (cat === "All" || r.type === cat) &&
      (!q || (r.title + " " + r.subject + " " + r.by).toLowerCase().includes(q)));
    if (!items.length) return '<div class="card center muted">No resources match.</div>';
    return items.map(r =>
      '<div class="lrow" data-go="libraryDetail" data-param="' + r.id + '"><span class="avatar sm">' + I.book + "</span>" +
        '<div class="grow"><div class="lrow-title">' + esc(r.title) + (r.inReview ? ' <span class="pill warn" style="font-size:10px">In review</span>' : "") + "</div>" +
        '<div class="lrow-sub">' + esc(r.subject + " · " + r.sem + " · " + r.by) + "</div></div><span class=\"chev\">" + I.chev + "</span></div>").join("");
  }
  function renderLibraryList() {
    const node = el("libList"); if (node) node.innerHTML = libraryListHTML();
  }

  SCREENS.libraryDetail = (p) => {
    const r = S.library.find(x => x.id === p.id) || S.library[0];
    return {
      chrome: "full", tab: "library", title: r.title, sub: r.subject,
      html:
        '<div class="card center" style="padding:28px"><span class="avatar lg">' + I.book + '</span><p class="small muted mt-s">Preview placeholder — the real file opens here.</p></div>' +
        '<p class="small mt">' + esc(r.desc) + "</p>" +
        '<div class="card mt"><div class="small"><b>Uploader:</b> ' + esc(r.by) + "</div>" +
          '<div class="small mt-s"><b>Visibility:</b> ' + esc(r.vis) + "</div>" +
          '<div class="small mt-s"><b>Moderation:</b> <span class="pill ' + (r.inReview ? "warn" : "ok") + '">' + esc(r.status) + "</span></div></div>" +
        '<div class="btn-row mt-l"><button class="btn primary" data-act="lib-save" data-id="' + r.id + '">Save</button>' +
          '<button class="btn ghost" data-act="lib-download">' + I.dl + " Download</button></div>" +
        '<div class="btn-row mt"><button class="btn ghost" data-act="lib-share">Share</button>' +
          '<button class="btn danger-soft" data-act="lib-flag" data-id="' + r.id + '">' + I.flag + " Flag this resource</button></div>"
    };
  };

  /* ----------------------------------------------------------------------
     SCREENS — PROJECTS
     ---------------------------------------------------------------------- */
  const projPill = (st) => st === "Reviewed" ? "ok" : st === "Awaiting Feedback" ? "warn" : "accent";
  SCREENS.projects = () => ({
    chrome: "full", tab: "home", title: "Projects", sub: "Get feedback from your mentor",
    action: '<button class="icon-btn" data-act="project-new" aria-label="New project">' + I.plus + "</button>",
    html: S.projects.map(pr =>
      '<div class="lrow" data-go="projectDetail" data-param="' + pr.id + '"><span class="avatar sm signal">' + I.folder + "</span>" +
        '<div class="grow"><div class="lrow-title">' + esc(pr.name) + '</div><div class="lrow-sub">' + esc(pr.subject) + " · due " + fmtDate(pr.deadline) + "</div></div>" +
        '<span class="pill ' + projPill(pr.status) + '">' + esc(pr.status) + "</span></div>").join("")
  });

  SCREENS.projectDetail = (p) => {
    const pr = S.projects.find(x => x.id === p.id) || S.projects[0];
    const vers = pr.versions.slice().reverse().map(v =>
      '<div class="ver"><span class="vtag">v' + v.v + '</span><div class="grow"><div class="small">' + esc(v.note) + '</div><div class="tiny muted">' + fmtDate(v.at) + "</div></div>" +
      '<button class="btn ghost sm" data-act="ver-preview" data-v="' + v.v + '">Preview</button></div>').join("");
    const comments = pr.comments.length ? pr.comments.map(c =>
      '<div class="rev-card"><b class="small">' + esc(c.who) + '</b><p class="small muted mt-s">' + esc(c.text) + "</p></div>").join("") :
      '<p class="small muted">No comments yet.</p>';
    return {
      chrome: "full", tab: "home", title: pr.name, sub: pr.subject,
      html:
        '<div class="row between"><span class="pill ' + projPill(pr.status) + '">' + esc(pr.status) + '</span><span class="tiny muted">Due ' + fmtDate(pr.deadline) + "</span></div>" +
        '<p class="small mt">' + esc(pr.desc) + "</p>" +
        '<button class="btn ghost mt" data-act="proj-newversion" data-id="' + pr.id + '">' + I.plus + " Upload new version</button>" +
        '<div class="sec-label">Version history</div>' + vers +
        '<div class="sec-label">Comments</div>' + comments +
        (pr.status === "Awaiting Feedback" ? '<div class="demo-note mt">' + I.clock + "<span>Your mentor has been notified and will comment soon.</span></div>" :
          '<button class="btn primary mt-l" data-act="proj-submit" data-id="' + pr.id + '">Submit for feedback</button>')
    };
  };

  function fmtDate(iso) {
    try { const d = new Date(iso + "T00:00:00"); return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }); }
    catch (e) { return iso; }
  }

  /* ----------------------------------------------------------------------
     SCREENS — CONNECT CREDITS
     ---------------------------------------------------------------------- */
  SCREENS.credits = () => {
    const c = S.credits;
    const threshold = 150;
    const pct = Math.min(100, Math.round((c.approved / threshold) * 100));
    const flow = ["Activity done", "Evidence checked", "Points awarded", "Faculty review if needed", "Credit recorded if approved"];
    const ledger = c.ledger.map(e =>
      '<div class="lrow" style="cursor:default"><div class="grow"><div class="lrow-title">' + esc(e.act) + '</div><div class="lrow-sub">' + fmtDate(e.date) + "</div></div>" +
      '<div style="text-align:right"><div class="num">+' + e.pts + '</div><span class="pill ' + (e.status === "Approved" ? "ok" : e.status === "Disputed" ? "bad" : "warn") + '" style="font-size:10px">' + esc(e.status) + "</span></div></div>").join("");
    return {
      chrome: "full", tab: "me", title: "Connect Credits", sub: "Transparent, not official marks",
      html:
        '<div class="tiles mb">' +
          '<div class="tile"><span class="t-lbl">Approved</span><span class="t-val">' + c.approved + '</span></div>' +
          '<div class="tile"><span class="t-lbl">Pending</span><span class="t-val">' + c.pending + '</span></div>' +
          (c.disputed ? '<div class="tile"><span class="t-lbl">Disputed</span><span class="t-val">' + c.disputed + "</span></div>" : "") +
        "</div>" +
        '<div class="card mb"><div class="between"><b class="small">Academic recognition</b><span class="pill warn">Not yet eligible</span></div>' +
          '<div class="progress mt-s"><i style="width:' + pct + '%"></i></div>' +
          '<div class="tiny muted mt-s">' + c.approved + " / " + threshold + " approved points (placeholder threshold). Recognition depends on your college.</div></div>" +
        '<div class="demo-note mb">' + I.shield + "<span>Pending points are never counted as approved and are never described as marks.</span></div>" +
        '<div class="sec-label">How it works</div>' +
        '<div class="card"><ul class="vstep">' + flow.map((f, i) =>
          '<li class="' + (i < 3 ? "done" : "upcoming") + '"><span class="dot"><b></b><i></i></span><div class="vs-body"><div class="vs-title">' + esc(f) + "</div></div></li>").join("") + "</ul></div>" +
        '<div class="sec-label">Activity ledger</div>' + ledger +
        '<div class="sec-label">Illustrative rules</div>' +
        '<div class="card tintbg"><p class="tiny muted">For illustration only — your college sets the real values.</p>' +
          '<ul class="small" style="margin:8px 0 0;padding-left:18px"><li>Attend a session: +10</li><li>Mentor a session: +30</li><li>Approved library resource: +20</li><li>Give session feedback: +5</li><li>Weekly cap: 100</li><li>Conversion to anything official depends on college approval</li></ul></div>' +
        '<div class="btn-row mt-l"><button class="btn ghost" data-go="achievements">Badges</button>' +
          '<button class="btn ghost" data-act="appeal">Appeal a decision</button></div>'
    };
  };

  /* ----------------------------------------------------------------------
     SCREENS — ACHIEVEMENTS
     ---------------------------------------------------------------------- */
  function badgeState() {
    const sentMsg = Object.values(S.chats).some(c => c.msgs.some(m => m.side === "me"));
    const sessionDone = S.sessions.some(s => s.status === "done");
    const contributed = S.library.some(r => r.by === S.account.name) || S._uploaded;
    return [
      { id: "first", name: "First steps", desc: "Complete your questionnaire.", icon: I.check, earned: S.onboardedMentee || S.onboardedMentor },
      { id: "conv", name: "Conversation starter", desc: "Send your first message to a mentor.", icon: I.chat, earned: sentMsg },
      { id: "sess", name: "Session complete", desc: "Finish a session and record the outcome.", icon: I.cal, earned: sessionDone },
      { id: "lib", name: "Library contributor", desc: "Upload a resource to the library.", icon: I.library, earned: contributed },
      { id: "steady", name: "Steady helper", desc: "Earn 80+ approved credits.", icon: I.trophy, earned: S.credits.approved >= 80 }
    ];
  }
  SCREENS.achievements = () => ({
    chrome: "full", tab: "me", title: "Achievements",
    html: '<p class="small muted mb">Earned from real activity in the app.</p><div class="badges">' +
      badgeState().map(b =>
        '<button class="badge-card ' + (b.earned ? "" : "locked") + '" data-act="badge-info" data-name="' + esc(b.name) + '" data-desc="' + esc(b.desc) + '" data-earned="' + b.earned + '">' +
        '<span class="bc-ico">' + b.icon + '</span><div class="bc-name">' + esc(b.name) + '</div><div class="tiny muted">' + (b.earned ? "Earned" : "Locked") + "</div></button>").join("") + "</div>"
  });

  /* ----------------------------------------------------------------------
     SCREENS — CALENDAR
     ---------------------------------------------------------------------- */
  SCREENS.calendar = () => {
    const today = new Date();
    const evDates = {};
    S.sessions.forEach(s => { evDates[s.date] = true; });
    S.projects.forEach(p => { evDates[p.deadline] = true; });
    const strip = DAYS.map((_, i) => {
      const d = new Date(today); d.setDate(d.getDate() + i);
      const iso = d.toISOString().slice(0, 10);
      const on = i === 0;
      return '<div class="day ' + (on ? "on" : "") + '"><div class="dow">' + d.toLocaleDateString("en-GB", { weekday: "short" }).slice(0, 2) + '</div><div class="num">' + d.getDate() + "</div>" + (evDates[iso] ? '<div class="evt"></div>' : "") + "</div>";
    }).join("");
    const agenda = []
      .concat(S.sessions.map(s => ({ date: s.date, title: s.format + " with " + s.with, sub: s.time + " · " + s.length + " min", type: "session", id: s.id })))
      .concat(S.projects.map(p => ({ date: p.deadline, title: p.name + " due", sub: p.status, type: "deadline" })))
      .sort((a, b) => a.date.localeCompare(b.date));
    return {
      chrome: "full", tab: "home", title: "Calendar",
      html:
        '<div class="weekstrip mb">' + strip + "</div>" +
        '<div class="demo-note mb">' + I.clock + "<span>Reminders arrive 1 hour and 10 minutes before a session.</span></div>" +
        '<div class="sec-label">Agenda</div>' +
        agenda.map(a => '<div class="lrow" ' + (a.type === "session" ? 'data-go="session" data-param="' + a.id + '"' : "style=\"cursor:default\"") + '>' +
          '<span class="avatar sm ' + (a.type === "deadline" ? "signal" : "") + '">' + (a.type === "deadline" ? I.folder : I.cal) + "</span>" +
          '<div class="grow"><div class="lrow-title">' + esc(a.title) + '</div><div class="lrow-sub">' + fmtDate(a.date) + " · " + esc(a.sub) + "</div></div></div>").join("")
    };
  };

  /* ----------------------------------------------------------------------
     SCREENS — NOTIFICATIONS
     ---------------------------------------------------------------------- */
  SCREENS.notifications = () => ({
    chrome: "full", tab: "home", title: "Notifications",
    action: unreadCount() ? '<button class="btn ghost sm" data-act="mark-all-read">Mark all read</button>' : "",
    html: S.notifications.length ? S.notifications.map(n =>
      '<div class="lrow" data-act="open-notif" data-id="' + n.id + '"><span class="avatar sm ' + (n.read ? "" : "signal") + '">' + I.bell + "</span>" +
      '<div class="grow"><div class="tiny muted">' + esc(n.cat) + '</div><div class="lrow-title">' + esc(n.title) + (n.read ? "" : ' <span class="pill accent" style="font-size:10px">New</span>') + "</div>" +
      '<div class="lrow-sub">' + esc(n.text) + "</div></div></div>").join("") :
      '<div class="card center muted">You\'re all caught up.</div>'
  });

  /* ----------------------------------------------------------------------
     SCREENS — PROFILE (ME)
     ---------------------------------------------------------------------- */
  SCREENS.me = () => {
    const roleLabel = S.role === "both" ? ("Both · " + (S.mode === "mentor" ? "mentoring" : "learning")) : (S.role === "mentor" ? "Mentor" : "Learner");
    const canSwitch = S.role === "both";
    const link = (go, icon, label) => '<div class="lrow" data-go="' + go + '"><span class="avatar sm">' + icon + '</span><div class="grow"><div class="lrow-title">' + label + '</div></div><span class="chev">' + I.chev + "</span></div>";
    return {
      chrome: "full", tab: "me", title: "Me",
      html:
        '<div class="card center"><span class="avatar lg" style="margin:0 auto">' + esc(initials(S.account.name)) + "</span>" +
          '<h2 class="mt-s">' + esc(S.account.name) + '</h2><div class="small muted">' + esc(S.account.college) + "</div>" +
          '<div class="mt-s"><span class="pill accent">' + esc(roleLabel) + "</span></div></div>" +
        '<div class="sec-label">Your stuff</div><div class="list linklist">' +
          link("achievements", I.trophy, "Achievements") + link("credits", I.coin, "Connect Credits") +
          link("reviews", I.star, "Reviews") + link("projects", I.folder, "Projects") + link("calendar", I.cal, "Calendar") +
        "</div>" +
        '<div class="sec-label">Settings & help</div><div class="list linklist">' +
          link("settings", I.gear, "Settings") + link("help", I.help, "Help and support") + link("decisions", I.alert, "Open decisions for the team") +
        "</div>" +
        (canSwitch ? '<button class="btn ghost mt" data-act="switch-mode">Switch to ' + (S.mode === "mentor" ? "learner" : "mentor") + " mode</button>" :
          '<button class="btn ghost mt" data-act="become-other">' + (S.role === "mentor" ? "Also become a learner" : "Also become a mentor") + "</button>") +
        '<div class="phase3 mt"><span class="pill plain accent">Phase 3</span><span>Admin & faculty tools (approvals, credit conversion, reporting) come later.</span></div>' +
        '<button class="btn danger-soft mt" data-act="reset-demo">Reset demo</button>'
    };
  };

  /* ----------------------------------------------------------------------
     SCREENS — REVIEWS / SETTINGS / HELP
     ---------------------------------------------------------------------- */
  SCREENS.reviews = () => ({
    chrome: "full", tab: "me", title: "Reviews",
    html:
      '<div class="sec-label">Received</div>' +
      (S.reviewsReceived.map(r => '<div class="rev-card"><div class="rc-head"><b class="small">' + esc(r.who) + "</b>" + starsRow(r.stars) + "</div><p class=\"small muted\">" + esc(r.text) + "</p>" +
        '<button class="btn ghost sm mt-s" data-act="report-review">Report</button></div>').join("") || '<p class="small muted">None yet.</p>') +
      '<div class="sec-label">Given</div>' +
      (S.reviewsGiven.map(r => '<div class="rev-card"><div class="rc-head"><b class="small">' + esc(r.who) + "</b>" + starsRow(r.stars) + "</div><p class=\"small muted\">" + esc(r.text) + "</p></div>").join("") || '<p class="small muted">None yet.</p>')
  });

  SCREENS.settings = () => {
    const tog = (key, label, sub) => '<div class="card between mb"><div><b class="small">' + label + '</b>' + (sub ? '<div class="tiny muted">' + sub + "</div>" : "") + "</div>" +
      '<span class="switch"><button data-act="setting-toggle" data-key="' + key + '" aria-pressed="' + S.settings[key] + '" aria-label="' + label + '"></button></span></div>';
    return {
      chrome: "full", tab: "me", title: "Settings",
      html: tog("push", "Push notifications") + tog("reminders", "Session reminders", "1 hour and 10 minutes before") +
        tog("collegeOnly", "Show my profile to my college only") + tog("largeText", "Larger text") +
        selectField("Language", "settings.lang", LANGS) +
        '<button class="btn primary mt" data-act="save-settings">Save</button>'
    };
  };

  SCREENS.help = () => {
    const faqs = [
      ["How are matches chosen?", "We compare the mentor's proficiency in your subject, how many free days you share, and whether you overlap on language and format. We never pad the list with weak matches."],
      ["Can I change mentors?", "Yes — from Home, tap 'Request a mentor change'. Your old chat stays in your history."],
      ["Do credits count as marks?", "No. Connect Credits are a transparent record of activity. Only your college can decide if they translate into anything official."],
      ["Who sees my files?", "You choose per upload: everyone at your college, only your mentor/mentee, or only you."]
    ];
    return {
      chrome: "full", tab: "me", title: "Help and support",
      html: faqs.map(f => '<details class="faq"><summary>' + esc(f[0]) + "</summary><div class=\"faq-body\">" + esc(f[1]) + "</div></details>").join("") +
        '<div class="sec-label">Report a problem</div><div class="card">' + fieldText("What happened?", "_helpText", { textarea: true, ph: "Describe the issue" }) +
        '<button class="btn primary mt-s" data-act="help-report">Submit report</button></div>' +
        '<button class="btn ghost mt" data-act="contact-support">Contact support</button>'
    };
  };

  /* ----------------------------------------------------------------------
     SCREENS — OPEN DECISIONS
     ---------------------------------------------------------------------- */
  const DECISIONS = [
    ["Who can join Connect?", ["Students from the same college", "Students from selected partner colleges", "Any verified college student"]],
    ["Who can mentor?", ["Seniors in the same course", "Students from other courses too", "Anyone with a relevant skill"]],
    ["How do credits work?", ["Faculty-approved internal marks", "Points, badges and certificates only", "Points plus academic recognition and rewards"]],
    ["Who can access files?", ["The uploader chooses each time", "Only the matched mentor or mentee", "All verified students at the college"]],
    ["How do sessions happen?", ["WhatsApp and phone", "In-app calls", "Both"]],
    ["How are mentors verified?", ["Identity + faculty check where needed", "Identity + self-declared skills", "Identity + evidence for each skill"]]
  ];
  SCREENS.decisions = () => ({
    chrome: "full", tab: "me", title: "Open decisions", sub: "For the product team",
    html: '<p class="small muted mb">Six things the college needs to decide. Pick a leaning for each, then copy a summary.</p>' +
      DECISIONS.map((d, qi) =>
        '<div class="decision"><h4>' + (qi + 1) + ". " + esc(d[0]) + "</h4>" +
          d[1].map((opt, oi) => '<button class="opt" data-act="decide" data-q="' + qi + '" data-o="' + oi + '" aria-pressed="' + (S.decisions[qi] === oi) + '"><span class="opt-radio"></span><span>' + esc(opt) + "</span></button>").join("") +
        "</div>").join("") +
      '<button class="btn primary mt" data-act="copy-decisions">Copy summary</button>'
  });

  /* __ACTIONS_SCREENS_DONE__ */

  /* ----------------------------------------------------------------------
     18. ACTION HANDLER  (every data-act lands here)
     ---------------------------------------------------------------------- */
  let chatReplyIdx = 0;
  const CANNED = [
    "Got it — let's break that into smaller steps.",
    "Good question. Can you send me what you've tried so far?",
    "Let's do a quick example together on our next call.",
    "That's a common sticking point, you're not alone on it.",
    "Nice progress! Try one more on your own and send it over.",
    "I'll share a short resource for that in a sec."
  ];

  function sendChat(id) {
    const inp = el("chatText"); if (!inp) return;
    const text = inp.value.trim(); if (!text) return;
    const c = S.chats[id];
    c.msgs.push({ side: "me", text: text, t: nowLabel() });
    inp.value = "";
    render();
    // mentor auto-replies after ~0.9s
    setTimeout(() => {
      c.msgs.push({ side: "them", text: CANNED[chatReplyIdx++ % CANNED.length], t: nowLabel() });
      if (top().name === "chat" && top().params.id === id) render();
    }, 900);
  }
  function nowLabel() {
    const d = new Date();
    let h = d.getHours(), ap = h >= 12 ? "pm" : "am"; h = h % 12 || 12;
    return h + ":" + d.getMinutes().toString().padStart(2, "0") + ap;
  }

  function handleAct(act, t) {
    const id = t.dataset.id;
    switch (act) {

      /* ---- Onboarding ---- */
      case "login": toast("Demo: jumping to verification"); go("verify"); break;
      case "terms": toast("Terms & Privacy would open here"); break;
      case "register-submit": {
        const okEmail = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(S.account.email);
        const okPass = (S.account.password || "").length >= 6;
        const errBox = el("regErr");
        if (!okEmail || !okPass) {
          errBox.innerHTML = '<div class="card danger-soft mt" style="background:var(--danger-soft)"><b class="small" style="color:var(--danger)">' + I.alert + " We couldn't verify that</b>" +
            '<p class="tiny mt-s" style="color:var(--danger)">' + (!okEmail ? "That email doesn't look right. " : "") + (!okPass ? "Password needs at least 6 characters." : "") + "</p>" +
            '<div class="btn-row mt-s"><button class="btn ghost sm" data-act="reg-retry">Try again</button><button class="btn ghost sm" data-act="contact-support">Get help</button></div></div>';
          return;
        }
        go("verify"); break;
      }
      case "reg-retry": el("regErr").innerHTML = ""; break;
      case "verify-submit": S.account.verified = true; toast("College email verified"); replace("role"); break;
      case "resend": toast("New code sent (demo)"); break;
      case "role-mentee": S.role = "mentee"; S.mode = "mentee"; reset("q1"); break;
      case "role-mentor": S.role = "mentor"; S.mode = "mentor"; reset("mq1"); break;
      case "role-both":
        openSheet('<h3>Start as…</h3><p class="small muted mb">You\'ll have both. Which mode do you want first?</p>' +
          '<button class="btn primary mb" data-act="both-start" data-mode="mentee">Start by learning</button>' +
          '<button class="btn ghost" data-act="both-start" data-mode="mentor">Start by mentoring</button>');
        break;
      case "both-start":
        S.role = "both"; S.mode = t.dataset.mode; closeSheet();
        reset(t.dataset.mode === "mentor" ? "mq1" : "q1"); break;

      /* ---- Mentee questionnaire ---- */
      case "qnext":
        if (S.ui.reviewReturn) { S.ui.reviewReturn = false; replace("qreview"); }
        else go(t.dataset.next);
        break;
      case "q-edit": S.ui.reviewReturn = true; go(t.dataset.step); break;
      case "q-addfile": S.mentee.file = "Assignment brief.pdf"; render(); toast("Added Assignment brief.pdf (demo)"); break;
      case "find-mentors": S.onboardedMentee = true; S.broadened = false; go("matching"); break;
      case "broaden": S.broadened = true; render(); toast("Showing mentors comfortable with the basics too"); break;

      /* ---- Matches / mentor profile ---- */
      case "toggle-save": {
        const i = S.saved.indexOf(id);
        if (i >= 0) { S.saved.splice(i, 1); toast("Removed from saved"); } else { S.saved.push(id); toast("Saved"); }
        render(); break;
      }
      case "pick-slot":
        S._reqSlot = t.dataset.slot;
        document.querySelectorAll('[data-act="pick-slot"]').forEach(b => b.setAttribute("aria-pressed", b === t ? "true" : "false"));
        break;
      case "send-request": {
        const m = mentorById(id);
        const req = { id: uid("req"), mentorId: id, topic: S._reqTopic || S.mentee.subject,
          goal: S.mentee.goal, when: S._reqSlot || "to be agreed", note: S._reqNote || "", status: "pending", at: isoToday() };
        S.sentRequests.push(req);
        notify("Request", "Request sent to " + m.name, "Waiting for a response on " + req.topic + ".", "requestStatus", req.id);
        S._reqTopic = S._reqNote = S._reqSlot = null;
        reset("requestStatus", { id: req.id }); toast("Request sent"); break;
      }
      case "demo-respond": {
        const req = S.sentRequests.find(r => r.id === id); if (!req) break;
        const r = t.dataset.r; req.status = r; const m = mentorById(req.mentorId);
        if (r === "accepted") {
          ensureChat(req.mentorId); S.mentorship = { mentorId: req.mentorId, topic: req.topic, status: "active", since: isoToday() };
          notify("Request", m.name + " accepted your request", "Your chat is open.", "chat", req.mentorId);
          toast(m.name + " accepted");
        } else if (r === "declined") {
          req.declineReason = m.name + " is at capacity this month. Try a mentor with similar strengths.";
          notify("Request", m.name + " declined", "They're at capacity — here's why, plus next steps.", "requestStatus", req.id);
          toast("Request declined");
        } else {
          req.newTime = "Sat evening";
          notify("Request", m.name + " suggested a new time", "Sat evening — accept or pick another mentor.", "requestStatus", req.id);
          toast("New time suggested");
        }
        render(); break;
      }
      case "accept-reschedule": {
        const req = S.sentRequests.find(r => r.id === id); if (!req) break;
        req.status = "accepted"; ensureChat(req.mentorId);
        S.mentorship = { mentorId: req.mentorId, topic: req.topic, status: "active", since: isoToday() };
        toast("New time accepted"); render(); break;
      }

      /* ---- Mentor questionnaire ---- */
      case "mqnext": go(t.dataset.next); break;
      case "toggle-teach": {
        const sk = t.dataset.skill;
        if (S.mentor.teach[sk]) delete S.mentor.teach[sk];
        else S.mentor.teach[sk] = "Comfortable";
        render(); break;
      }
      case "toggle-agree": S.mentor.agreed = !S.mentor.agreed; render(); break;
      case "mentor-submit":
        if (!S.mentor.agreed) { toast("Please agree to the guidelines first"); return; }
        S.onboardedMentor = true; go("mverify"); break;
      case "go-dash": reset("mdash"); break;

      /* ---- Mentor dashboard ---- */
      case "toggle-accepting":
        S.mentor.acceptingRequests = !S.mentor.acceptingRequests;
        render(); toast(S.mentor.acceptingRequests ? "You're visible in matches" : "You're hidden from matches");
        break;
      case "edit-availability":
        openSheet(() => '<h3>Edit availability</h3><div class="sec-label">Days</div>' + chipGroup("mentor.days", DAYS) +
          '<div class="sec-label">Formats</div>' + chipGroup("mentor.formats", FORMATS) +
          '<button class="btn primary mt" data-act="sheet-save">Save</button>');
        break;
      case "edit-skills":
        openSheet(() => {
          const sel = Object.keys(S.mentor.teach);
          return '<h3>Edit skills</h3><div class="chips">' + SUBJECTS.map(s =>
            '<button class="chip" data-act="toggle-teach" data-skill="' + esc(s) + '" aria-pressed="' + sel.includes(s) + '">' + esc(s) + "</button>").join("") + "</div>" +
            '<button class="btn primary mt" data-act="sheet-save">Save</button>';
        });
        break;
      case "sheet-save": closeSheet(); render(); toast("Saved"); break;
      case "upload-resource": openUploadSheet(); break;

      /* ---- Received requests (mentor) ---- */
      case "req-accept": {
        const r = S.received.find(x => x.id === id); if (!r) break;
        r.status = "accepted";
        const cid = "mentee_" + id;
        S.chats[cid] = { who: r.from.name, topic: r.topic, msgs: [{ side: "sys", text: "You accepted " + r.from.name + "'s request. Say hi!" }] };
        notify("Request", "You accepted " + r.from.name, "Chat is open.", "chat", cid);
        toast("Accepted — chat opened"); go("chat", { id: cid }); break;
      }
      case "req-decline": {
        const r = S.received.find(x => x.id === id); if (!r) break;
        r.status = "declined"; notify("Request", "You declined " + r.from.name, "They've been notified kindly.", "requests");
        toast(r.from.name + " was notified"); render(); break;
      }
      case "req-suggest": {
        const r = S.received.find(x => x.id === id); if (!r) break;
        openSheet('<h3>Suggest another time</h3><p class="small muted mb">Pick a slot for ' + esc(r.from.name) + ":</p>" +
          ["Tue evening", "Thu evening", "Sun afternoon"].map(s => '<button class="btn ghost mb" data-act="suggest-pick" data-id="' + id + '" data-slot="' + esc(s) + '">' + esc(s) + "</button>").join(""));
        break;
      }
      case "suggest-pick": {
        const r = S.received.find(x => x.id === id); if (r) r.status = "rescheduled";
        closeSheet(); toast("Suggested " + t.dataset.slot); render(); break;
      }

      /* ---- Home ---- */
      case "change-mentor":
        openSheet('<h3>Request a mentor change?</h3><p class="small muted mb">Your current chat stays in your history. You\'ll go back to matches to pick someone new.</p>' +
          '<button class="btn primary mb" data-act="confirm-change">Yes, find a new mentor</button><button class="btn ghost" data-act="close-sheet">Keep my mentor</button>');
        break;
      case "confirm-change": S.mentorship = null; closeSheet(); reset("matches"); toast("Old chat kept in history"); break;
      case "close-sheet": closeSheet(); break;

      /* ---- Chat ---- */
      case "chat-send": sendChat(id); break;
      case "chat-attach": S.chats[id].msgs.push({ side: "card", text: '<b class="small">' + I.attach + ' Shared a file</b><div class="tiny muted mt-s">notes.pdf · 240 KB (demo)</div>' }); render(); break;
      case "chat-menu":
        openSheet('<h3>Chat options</h3>' +
          '<button class="btn ghost mb" data-act="chat-report">Report</button>' +
          '<button class="btn ghost mb" data-act="chat-block">Block</button>' +
          '<button class="btn ghost" data-act="chat-support">Request support</button>');
        break;
      case "chat-report": closeSheet(); toast("Report sent to the Connect team"); break;
      case "chat-block": closeSheet(); toast("User blocked (demo)"); break;
      case "chat-support": closeSheet(); toast("A support request was opened"); break;
      case "chat-resources":
        S.chats[id].msgs.push({ side: "card", text: '<b class="small">' + I.book + ' Shared a resource</b><div class="small mt-s">Final Accounts — adjustments cheat sheet</div>' }); render(); break;
      case "chat-files": toast("Shared files would list here"); break;
      case "chat-schedule": openScheduleSheet(id); break;

      /* ---- Sessions ---- */
      case "session-confirm": { const s = sess(id); s.confMentee = true; render(); toast("Attendance confirmed"); break; }
      case "session-reschedule": toast("Reschedule flow (demo)"); break;
      case "session-join": toast("A real call link would open here"); break;
      case "session-cancel": { const s = sess(id); s.status = "cancelled"; toast("Session cancelled — late cancels may affect credits"); back(); break; }
      case "session-finish": openOutcomeSheet(id); break;
      case "submit-outcome": {
        const s = sess(id);
        s.status = "done";
        s.outcome = { notes: el("ocNotes").value || "Covered the key idea and a worked example.", next: el("ocNext").value || "Practise 3 problems before next time.", stars: S._ocStars || 5 };
        const mentoring = s.role === "mentor";
        addCredit((mentoring ? "Mentored" : "Attended") + " session with " + s.with, mentoring ? 30 : 10);
        addCredit("Submitted session feedback", 5);
        S._ocStars = null; closeSheet(); render(); toast("Outcome saved · pending credits added"); break;
      }
      case "oc-star": S._ocStars = +t.dataset.n; renderSheet(); break;

      /* ---- Library ---- */
      case "library-upload": openUploadSheet(); break;
      case "lib-cat":
        S.ui.libraryCat = t.dataset.cat;
        document.querySelectorAll('#libCats [data-act="lib-cat"]').forEach(b => b.setAttribute("aria-pressed", b === t ? "true" : "false"));
        renderLibraryList(); break;
      case "lib-save": toast("Saved to your library"); break;
      case "lib-download": toast("Download would start (demo)"); break;
      case "lib-share": toast("Share link copied (demo)"); break;
      case "lib-flag":
        openSheet('<h3>Flag this resource</h3><p class="small muted mb">Why are you flagging it?</p>' +
          ["Wrong or misleading", "Not my college's work", "Inappropriate", "Copyright concern"].map(r =>
            '<button class="btn ghost mb" data-act="do-flag" data-reason="' + esc(r) + '">' + esc(r) + "</button>").join(""));
        break;
      case "do-flag": closeSheet(); toast("Flagged for moderation — thank you"); break;
      case "do-upload": {
        const title = (el("upTitle").value || "").trim();
        if (!title) { toast("Give it a title first"); return; }
        S.library.unshift({ id: uid("lib"), title, subject: el("upSubject").value, sem: "Sem " + S.mentee.sem,
          by: S.account.name, type: el("upType").value, vis: el("upVis").value, status: "In review", inReview: true,
          desc: "Uploaded by you — awaiting moderation." });
        S._uploaded = true; addCredit("Library upload (" + title + ")", 20);
        closeSheet(); reset("library"); toast("Uploaded · in review · +20 pending credits"); break;
      }

      /* ---- Projects ---- */
      case "project-new":
        openSheet('<h3>New project</h3>' +
          '<div class="field"><label>Name</label><input id="pjName" type="text" placeholder="Project name" /></div>' +
          '<div class="field"><label>Subject</label><select id="pjSubject">' + SUBJECTS.map(s => "<option>" + esc(s) + "</option>").join("") + "</select></div>" +
          '<div class="field"><label>Deadline</label><input id="pjDate" type="date" /></div>' +
          '<div class="field"><label>Description</label><textarea id="pjDesc" placeholder="What is it about?"></textarea></div>' +
          '<button class="btn primary" data-act="do-project">Create</button>');
        break;
      case "do-project": {
        const name = (el("pjName").value || "").trim(); if (!name) { toast("Name is required"); return; }
        const pr = { id: uid("pr"), name, subject: el("pjSubject").value, deadline: el("pjDate").value || isoToday(),
          status: "Draft", desc: el("pjDesc").value || "", versions: [{ v: 1, note: "Created", at: isoToday() }], comments: [] };
        S.projects.unshift(pr); closeSheet(); go("projectDetail", { id: pr.id }); toast("Project created"); break;
      }
      case "proj-newversion": {
        const pr = S.projects.find(x => x.id === id);
        pr.versions.push({ v: pr.versions.length + 1, note: "New version", at: isoToday() });
        render(); toast("Version v" + pr.versions.length + " added"); break;
      }
      case "proj-submit": {
        const pr = S.projects.find(x => x.id === id);
        pr.status = "Awaiting Feedback";
        addCredit("Submitted project for feedback", 5);
        notify("Projects", "Project submitted", pr.name + " is awaiting mentor feedback.", "projectDetail", pr.id);
        render(); toast("Sent to your mentor"); break;
      }
      case "ver-preview": toast("Preview / compare v" + t.dataset.v + " (demo)"); break;

      /* ---- Credits ---- */
      case "appeal":
        openSheet('<h3>Appeal a decision</h3>' +
          '<div class="field"><label>Which activity?</label><select id="apAct">' +
            S.credits.ledger.map(e => "<option value='" + e.id + "'>" + esc(e.act) + "</option>").join("") + "</select></div>" +
          '<div class="field"><label>Reason</label><textarea id="apReason" placeholder="Why should this be reviewed?"></textarea></div>' +
          '<button class="btn primary" data-act="do-appeal">Submit appeal</button>');
        break;
      case "do-appeal": {
        const eid = el("apAct").value; const e = S.credits.ledger.find(x => x.id === eid);
        if (e && e.status !== "Disputed") { e.status = "Disputed"; S.credits.disputed += e.pts; if (e.wasPending !== false) { } }
        closeSheet(); render(); toast("Appeal submitted — marked Disputed"); break;
      }

      /* ---- Achievements ---- */
      case "badge-info":
        openSheet('<h3>' + esc(t.dataset.name) + "</h3><p class=\"small muted\">" + esc(t.dataset.desc) + "</p>" +
          '<div class="mt"><span class="pill ' + (t.dataset.earned === "true" ? "ok" : "warn") + '">' + (t.dataset.earned === "true" ? "Earned" : "Not yet") + "</span></div>");
        break;

      /* ---- Notifications ---- */
      case "open-notif": {
        const n = S.notifications.find(x => x.id === id); if (!n) break;
        n.read = true;
        if (n.go) { if (n.go === "chat") go("chat", { id: n.param }); else if (n.param) go(n.go, { id: n.param }); else go(n.go); }
        else render();
        break;
      }
      case "mark-all-read": S.notifications.forEach(n => n.read = true); render(); toast("All marked read"); break;

      /* ---- Profile ---- */
      case "switch-mode": S.mode = S.mode === "mentor" ? "mentee" : "mentor"; reset("home"); toast("Switched to " + S.mode + " mode"); break;
      case "become-other":
        if (S.role === "mentor") { S.role = "both"; S.mode = "mentee"; reset("q1"); }
        else { S.role = "both"; S.mode = "mentor"; reset("mq1"); }
        break;
      case "reset-demo": S = freshState(); stack = [{ name: "welcome", params: {} }]; render(); toast("Demo reset"); break;

      /* ---- Reviews / Settings / Help ---- */
      case "report-review": toast("Review reported for moderation"); break;
      case "setting-toggle": S.settings[t.dataset.key] = !S.settings[t.dataset.key]; render(); break;
      case "save-settings": toast("Settings saved"); break;
      case "help-report": toast("Report submitted — we'll be in touch"); break;
      case "contact-support": toast("Support: help@connect.demo"); break;

      /* ---- Decisions ---- */
      case "decide": S.decisions[+t.dataset.q] = +t.dataset.o; render(); break;
      case "copy-decisions": copyDecisions(); break;

      default: /* no-op */ break;
    }
  }

  /* helpers used by actions */
  const sess = (id) => S.sessions.find(s => s.id === id) || S.sessions[0];
  const isoToday = () => new Date().toISOString().slice(0, 10);
  function ensureChat(mentorId) {
    if (S.chats[mentorId]) return;
    const m = mentorById(mentorId);
    S.chats[mentorId] = { who: m.name, topic: S.mentee.subject, msgs: [{ side: "sys", text: "Chat opened with " + m.name + ". Say hello!" }] };
  }

  function openScheduleSheet(chatId) {
    const c = S.chats[chatId];
    const mentor = mentorById(chatId) || { formats: FORMATS };
    openSheet('<h3>Schedule a session</h3>' +
      '<div class="field"><label>Date</label><input id="scDate" type="date" value="' + isoToday() + '" /></div>' +
      '<div class="field"><label>Time</label><input id="scTime" type="time" value="18:30" /></div>' +
      '<div class="field"><label>Format</label><select id="scFormat">' + (mentor.formats || FORMATS).map(f => "<option>" + esc(f) + "</option>").join("") + "</select></div>" +
      '<button class="btn primary" data-act="do-schedule" data-id="' + chatId + '">Add to chat</button>');
    // bind the schedule submit via a one-off (handled below through delegation)
  }
  // schedule submit handled via delegation extension:
  document.addEventListener("click", (e) => {
    const b = e.target.closest('[data-act="do-schedule"]'); if (!b) return;
    const chatId = b.dataset.id; const c = S.chats[chatId];
    const date = el("scDate").value, time = el("scTime").value, format = el("scFormat").value;
    const who = c.who;
    const s = { id: uid("ses"), withId: chatId, with: who, role: (S.mode === "mentor" ? "mentor" : "mentee"),
      date, time, length: S.mentee.length || "45", format, status: "upcoming", confMentee: true, confMentor: false, outcome: null };
    S.sessions.push(s);
    c.msgs.push({ side: "card", text: '<b class="small">' + I.cal + ' Session proposed</b><div class="small mt-s">' + fmtDate(date) + " · " + esc(time) + " · " + esc(format) + '</div><button class="btn primary sm mt-s" data-go="session" data-param="' + s.id + '">Open session</button>' });
    notify("Session", "Session proposed", fmtDate(date) + " at " + time + " with " + who, "session", s.id);
    closeSheet(); go("chat", { id: chatId }); toast("Session added to chat");
  });

  function openOutcomeSheet(id) {
    S._ocStars = S._ocStars || 5;
    openSheet(() => {
      const stars = '<div class="star-input stars" style="justify-content:center">' +
        [1, 2, 3, 4, 5].map(n => '<span class="' + (n <= (S._ocStars || 5) ? "on" : "off") + '" data-act="oc-star" data-n="' + n + '" role="button" aria-label="' + n + ' stars">' + I.star + "</span>").join("") + "</div>";
      return '<h3>Record outcome</h3>' +
        '<div class="field"><label>Notes</label><textarea id="ocNotes" placeholder="What did you cover?"></textarea></div>' +
        '<div class="field"><label>Next steps</label><textarea id="ocNext" placeholder="What should happen before next time?"></textarea></div>' +
        '<div class="field"><label>Rating</label>' + stars + "</div>" +
        '<button class="btn success" data-act="submit-outcome" data-id="' + id + '">Submit feedback</button>';
    });
  }

  function openUploadSheet() {
    openSheet('<h3>Upload a resource</h3>' +
      '<div class="field"><label>Title (required)</label><input id="upTitle" type="text" placeholder="e.g. Trial balance walkthrough" /></div>' +
      '<div class="field"><label>Subject</label><select id="upSubject">' + SUBJECTS.map(s => "<option>" + esc(s) + "</option>").join("") + "</select></div>" +
      '<div class="field"><label>Type</label><select id="upType">' + ["Notes", "Presentation", "Practice questions", "Guide"].map(s => "<option>" + esc(s) + "</option>").join("") + "</select></div>" +
      '<div class="field"><label>Visibility</label><select id="upVis">' + ["Everyone at your college", "Only my mentees", "Only me"].map(s => "<option>" + esc(s) + "</option>").join("") + "</select></div>" +
      '<div class="demo-note mb">' + I.alert + "<span>Uploads appear as “In review” until moderated.</span></div>" +
      '<button class="btn primary" data-act="do-upload">Upload</button>');
  }

  function copyDecisions() {
    const lines = DECISIONS.map((d, i) => {
      const sel = S.decisions[i];
      return (i + 1) + ". " + d[0] + "\n   → " + (sel == null ? "(not decided)" : d[1][sel]);
    });
    const text = "Connect — open product decisions\n\n" + lines.join("\n\n");
    const done = () => toast("Summary copied");
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text));
    } else fallbackCopy(text);
  }
  function fallbackCopy(text) {
    openSheet('<h3>Copy summary</h3><p class="small muted mb">Clipboard is blocked here — select and copy:</p>' +
      '<textarea style="min-height:200px" readonly>' + esc(text) + "</textarea>");
    const ta = $("#sheet textarea"); if (ta) { ta.focus(); ta.select(); }
  }

  /* ----------------------------------------------------------------------
     18. BOOT
     ---------------------------------------------------------------------- */
  function boot() {
    el("hdBack").addEventListener("click", back);
    el("sheetBackdrop").addEventListener("click", closeSheet);
    el("jumpBtnSide").addEventListener("click", openScreensSheet);
    el("jumpBtnTop").addEventListener("click", openScreensSheet);
    render();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
