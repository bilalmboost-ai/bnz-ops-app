import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Platform, KeyboardAvoidingView } from "react-native";

const BNZ = {
  id: "bnz",
  name: "BNZ Builders INC",
  city: "Cedarhurst, NY",
  phone: "1-332-258-1401",
  email: "bnzbuilders1@gmail.com",
  pmEmail: "saracooper@bnzbuildersinc.com",
  trades: ["GC", "Commercial reno", "Residential reno", "Paint", "Drywall", "Fit-out"],
  notes: "Bonding capacity is private.",
  jobs: [{ name: "Institutional interior renovation", loc: "New York", trade: "Interiors", status: "Active" }],
  vendors: [{ name: "Vetted NYS bench", trade: "Multi-trade", status: "Preferred" }],
};

const AGENTS = {
  sara: { name: "Sara", role: "Procurement & inbox" },
  emma: { name: "Emma", role: "Subcontractor desk" },
  taylor: { name: "Taylor", role: "Master estimator" },
};

function reply(agent, company, text) {
  if (agent === "taylor") return `${AGENTS.taylor.name} — ${company.name}\nI will not invent a bid number from chat. Send drawings, specs, and the bid date.`;
  if (agent === "emma") return `${AGENTS.emma.name} — ${company.name}\nNeed trade, county, due date, prevailing wage yes/no. New vendors only unless you say otherwise.`;
  return `${AGENTS.sara.name} — ${company.name}\n${company.phone} · ${company.email}\nI draft RFQs inside this company only.\nYou asked: ${text}`;
}

export default function App() {
  const [screen, setScreen] = useState("home");
  const [companies, setCompanies] = useState({ bnz: BNZ });
  const [activeId, setActiveId] = useState("bnz");
  const [agent, setAgent] = useState("sara");
  const [thread, setThread] = useState([]);
  const [draft, setDraft] = useState("");
  const [form, setForm] = useState({ name: "", city: "", phone: "", email: "" });
  const company = companies[activeId] || BNZ;

  useEffect(() => {
    AsyncStorage.getItem("bnz_tenants").then((raw) => {
      if (raw) setCompanies((c) => ({ ...c, ...JSON.parse(raw) }));
    });
  }, []);

  async function saveCompany() {
    if (!form.name.trim()) return;
    const id = form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40);
    const t = { id, name: form.name.trim(), city: form.city, phone: form.phone, email: form.email, jobs: [], vendors: [], notes: "Customer tenant." };
    const raw = await AsyncStorage.getItem("bnz_tenants");
    const extra = raw ? JSON.parse(raw) : {};
    extra[id] = t;
    await AsyncStorage.setItem("bnz_tenants", JSON.stringify(extra));
    setCompanies((c) => ({ ...c, [id]: t }));
    setActiveId(id);
    setScreen("home");
  }

  return (
    <SafeAreaView style={s.root}>
      <StatusBar style="light" />
      <View style={s.top}>
        <Text style={s.kicker}>BNZ OPS SUITE</Text>
        <Text style={s.title}>{company.name}</Text>
        <Text style={s.meta}>{company.city} · {company.phone}</Text>
      </View>
      <ScrollView style={s.body}>
        {screen === "home" && Object.entries(AGENTS).map(([k, a]) => (
          <TouchableOpacity key={k} style={s.card} onPress={() => { setAgent(k); setScreen("agents"); }}>
            <Text style={s.tag}>{a.name.toUpperCase()}</Text>
            <Text style={s.cardTitle}>{a.role}</Text>
          </TouchableOpacity>
        ))}
        {screen === "jobs" && (company.jobs || []).map((j, i) => (
          <View key={i} style={s.card}><Text style={s.cardTitle}>{j.name}</Text><Text style={s.meta}>{j.loc} · {j.status}</Text></View>
        ))}
        {screen === "agents" && (
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
            <View style={s.row}>
              {Object.entries(AGENTS).map(([k, a]) => (
                <TouchableOpacity key={k} style={[s.chip, agent === k && s.chipOn]} onPress={() => setAgent(k)}>
                  <Text style={s.chipTxt}>{a.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {thread.map((m, i) => <View key={i} style={s.bubble}><Text style={s.bubbleTxt}>{m}</Text></View>)}
            <TextInput style={s.input} placeholder="Ask about a bid or RFQ" placeholderTextColor="#6b7380" value={draft} onChangeText={setDraft} />
            <TouchableOpacity style={s.btn} onPress={() => { if (!draft.trim()) return; setThread((t) => [...t, draft, reply(agent, company, draft)]); setDraft(""); }}>
              <Text style={s.btnTxt}>Send to {AGENTS[agent].name}</Text>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        )}
        {screen === "company" && (
          <View>
            {Object.values(companies).map((c) => (
              <TouchableOpacity key={c.id} style={s.card} onPress={() => setActiveId(c.id)}>
                <Text style={s.cardTitle}>{c.name}</Text>
                <Text style={s.meta}>{c.city}</Text>
              </TouchableOpacity>
            ))}
            {"name,city,phone,email".split(",").map((k) => (
              <TextInput key={k} style={s.input} placeholder={k} placeholderTextColor="#6b7380" value={form[k]} onChangeText={(v) => setForm({ ...form, [k]: v })} />
            ))}
            <TouchableOpacity style={s.btn} onPress={saveCompany}><Text style={s.btnTxt}>Create workspace</Text></TouchableOpacity>
            <Text style={s.meta}>Support 1-332-258-1401 · bnzbuilders1@gmail.com</Text>
          </View>
        )}
      </ScrollView>
      <View style={s.tabs}>
        {["home", "jobs", "agents", "company"].map((id) => (
          <TouchableOpacity key={id} style={s.tab} onPress={() => setScreen(id)}>
            <Text style={[s.tabTxt, screen === id && s.tabOn]}>{id}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0B0D10" },
  top: { padding: 16, borderBottomWidth: 1, borderBottomColor: "#262B33" },
  kicker: { color: "#E07A3D", letterSpacing: 1.4, fontWeight: "700", fontSize: 11 },
  title: { color: "#F4F4F2", fontSize: 20, fontWeight: "700", marginTop: 4 },
  meta: { color: "#8B949E", marginTop: 4 },
  body: { flex: 1, padding: 16 },
  card: { backgroundColor: "#171B21", borderColor: "#262B33", borderWidth: 1, borderRadius: 14, padding: 14, marginBottom: 10 },
  tag: { color: "#E07A3D", fontSize: 11, fontWeight: "700" },
  cardTitle: { color: "#F4F4F2", fontSize: 16, fontWeight: "700", marginTop: 4 },
  row: { flexDirection: "row", gap: 8, marginBottom: 12 },
  chip: { borderWidth: 1, borderColor: "#262B33", borderRadius: 999, paddingVertical: 8, paddingHorizontal: 12 },
  chipOn: { backgroundColor: "#E07A3D" },
  chipTxt: { color: "#fff" },
  bubble: { backgroundColor: "#171B21", borderRadius: 12, padding: 12, marginBottom: 8 },
  bubbleTxt: { color: "#E8ECF0" },
  input: { backgroundColor: "#0E1116", borderColor: "#262B33", borderWidth: 1, borderRadius: 10, color: "#fff", padding: 12, marginBottom: 10 },
  btn: { backgroundColor: "#E07A3D", borderRadius: 10, padding: 14, alignItems: "center", marginBottom: 10 },
  btnTxt: { color: "#fff", fontWeight: "700" },
  tabs: { flexDirection: "row", borderTopWidth: 1, borderTopColor: "#262B33" },
  tab: { flex: 1, alignItems: "center", padding: 12 },
  tabTxt: { color: "#6B7380", textTransform: "capitalize" },
  tabOn: { color: "#E07A3D", fontWeight: "700" },
});
