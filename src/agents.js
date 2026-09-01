export const AGENTS = {
  sara: { key: "sara", name: "Sara", role: "Procurement & inbox", blurb: "RFQs by trade. Quote chase. Send-ready emails." },
  emma: { key: "emma", name: "Emma", role: "Subcontractor desk", blurb: "New vendors, onboarding, quote status." },
  taylor: { key: "taylor", name: "Taylor", role: "Master estimator", blurb: "Takeoff structure. Cautious builder pricing." }
};

export function draftRfq({ company, trade, job, due, wage }) {
  return `Subject: Invitation to Bid — ${trade}${job ? ` — ${job}` : ""}\n\n${company.name}\n${company.city || ""}\n${company.phone || ""} · ${company.email || ""}\n\nPlease provide a lump-sum quote for the ${trade} scope on the project above.\n\nDue: ${due || "[bid date]"}\nPrevailing wage / certified payroll: ${wage || "Confirm if required"}\n\nInclude:\n1. Base bid\n2. Unit prices for likely extras\n3. Lead time\n4. Insurance / workers comp certificate\n5. Exceptions to the drawings\n\nQuote requested within 7 calendar days.\n\nThank you,\n${company.name} — Operations`;
}

export function agentReply(agent, company, text) {
  const q = (text || "").toLowerCase();
  const jobs = (company.jobs || []).map((j) => j.name).join("; ") || "none on file";
  const vendors = (company.vendors || []).map((v) => v.name).join("; ") || "none on file";
  if (agent === "taylor") {
    if (q.includes("price") || q.includes("bid") || q.includes("number")) {
      return `${AGENTS.taylor.name} — ${company.name}\nI will not invent a bid number from a chat line.\nSend drawings, specs, addenda, and the bid date.\nJobs: ${jobs}`;
    }
    return `${AGENTS.taylor.name} — ${company.name}\nGive me the trade package and I will return a takeoff checklist only — no fake dollars.\nJobs: ${jobs}`;
  }
  if (agent === "emma") {
    return `${AGENTS.emma.name} — ${company.name}\nI source vendors that are new to this workspace unless you override.\nNeed: trade, county, due date, prevailing wage yes/no.\nCurrent bench: ${vendors}`;
  }
  return `${AGENTS.sara.name} — ${company.name}\n${company.phone || ""} · ${company.email || ""}\nI stay inside this company only.\nYou asked: ${text}\nReply with trade + job + due date and I will draft the RFQ.`;
}
