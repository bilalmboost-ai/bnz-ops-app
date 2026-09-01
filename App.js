import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, KeyboardAvoidingView, Platform, Linking } from "react-native";
import { BNZ } from "./src/seed";
import { AGENTS, agentReply, draftRfq } from "./src/agents";

export default function App() {
  const [screen, setScreen] = useState("home");
  const [companies, setCompanies] = useState({ bnz: BNZ });
  const [activeId, setActiveId] = useState("bnz");
  const [agent, setAgent] = useState("sara");
  const [thread, setThread] = useState([]);
  const [draft, setDraft] = useState("");
  const [jobForm, setJobForm] = useState({ name: "", loc: "", trade: "", status: "Bidding" });
  const [vendorForm, setVendorForm] = useState({ name: "", trade: "", status: "New" });
  const [rfq, setRfq] = useState({ trade: "", job: "", due: "", wage: "Confirm" });
  const [coForm, setCoForm] = useState({ name: "", city: "", phone: "", email: "", trades: "" });
  const [rfqOut, setRfqOut] = useState("");
  const company = companies[activeId] || BNZ;

  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem("bnz_tenants");
      if (raw) setCompanies((c) => ({ ...c, ...JSON.parse(raw) }));
      const last = await AsyncStorage.getItem("bnz_active");
      if (last) setActiveId(last);
    })();
  }, []);

  async function writeCompanies(next, active) {
    const extra = { ...next };
    delete extra.bnz;
    await AsyncStorage.setItem("bnz_tenants", JSON.stringify(extra));
    if (active) {
      await AsyncStorage.setItem("bnz_active", active);
      setActiveId(active);
    }
    setCompanies(next);
  }

  function patchCompany(partial) {
    writeCompanies({ ...companies, [activeId]: { ...company, ...partial } }, activeId);
  }

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style="light" />
      <View style={styles.top}>
        <Text style={styles.kicker}>BNZ OPS SUITE</Text>
        <Text style={styles.company}>{company.name}</Text>
        <Text style={styles.meta}>{[company.city, company.phone].filter(Boolean).join(" · ")}</Text>
      </View>
      <ScrollView style={styles.body} keyboardShouldPersistTaps="handled">
        {screen === "home" && Object.values(AGENTS).map((a) => (
          <TouchableOpacity key={a.key} style={styles.card} onPress={() => { setAgent(a.key); setScreen("agents"); }}>
            <Text style={styles.tag}>{a.name.toUpperCase()}</Text>
            <Text style={styles.cardTitle}>{a.role}</Text>
            <Text style={styles.p}>{a.blurb}</Text>
          </TouchableOpacity>
        ))}
        {screen === "jobs" && (
          <View>
            {(company.jobs || []).map((j, i) => <View key={i} style={styles.card}><Text style={styles.cardTitle}>{j.name}</Text><Text style={styles.p}>{[j.loc, j.trade, j.status].filter(Boolean).join(" · ")}</Text></View>)}
            {"name,loc,trade,status".split(",").map((k) => <TextInput key={k} style={styles.input} placeholder={k} placeholderTextColor="#6b7380" value={jobForm[k]} onChangeText={(v) => setJobForm({ ...jobForm, [k]: v })} />)}
            <TouchableOpacity style={styles.btn} onPress={() => { if (!jobForm.name.trim()) return; patchCompany({ jobs: [...(company.jobs || []), jobForm] }); setJobForm({ name: "", loc: "", trade: "", status: "Bidding" }); }}><Text style={styles.btnTxt}>Save job</Text></TouchableOpacity>
            {(company.vendors || []).map((v, i) => <View key={i} style={styles.card}><Text style={styles.cardTitle}>{v.name}</Text><Text style={styles.p}>{v.trade}</Text></View>)}
            {"name,trade,status".split(",").map((k) => <TextInput key={k} style={styles.input} placeholder={k} placeholderTextColor="#6b7380" value={vendorForm[k]} onChangeText={(v) => setVendorForm({ ...vendorForm, [k]: v })} />)}
            <TouchableOpacity style={styles.btn} onPress={() => { if (!vendorForm.name.trim()) return; patchCompany({ vendors: [...(company.vendors || []), vendorForm] }); setVendorForm({ name: "", trade: "", status: "New" }); }}><Text style={styles.btnTxt}>Save vendor</Text></TouchableOpacity>
          </View>
        )}
        {screen === "rfq" && (
          <View>
            <TextInput style={styles.input} placeholder="Trade" placeholderTextColor="#6b7380" value={rfq.trade} onChangeText={(v) => setRfq({ ...rfq, trade: v })} />
            <TextInput style={styles.input} placeholder="Job" placeholderTextColor="#6b7380" value={rfq.job} onChangeText={(v) => setRfq({ ...rfq, job: v })} />
            <TextInput style={styles.input} placeholder="Due" placeholderTextColor="#6b7380" value={rfq.due} onChangeText={(v) => setRfq({ ...rfq, due: v })} />
            <TouchableOpacity style={styles.btn} onPress={() => setRfqOut(draftRfq({ company, ...rfq }))}><Text style={styles.btnTxt}>Generate RFQ</Text></TouchableOpacity>
            {!!rfqOut && <View style={styles.card}><Text selectable style={styles.p}>{rfqOut}</Text></View>}
          </View>
        )}
        {screen === "agents" && (
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
            <View style={styles.row}>{Object.values(AGENTS).map((a) => <TouchableOpacity key={a.key} style={[styles.chip, agent === a.key && styles.chipOn]} onPress={() => setAgent(a.key)}><Text style={styles.chipTxt}>{a.name}</Text></TouchableOpacity>)}</View>
            {thread.map((m, i) => <View key={i} style={styles.bubble}><Text style={styles.p}>{m.text}</Text></View>)}
            <TextInput style={styles.input} placeholder="Ask an agent" placeholderTextColor="#6b7380" value={draft} onChangeText={setDraft} multiline />
            <TouchableOpacity style={styles.btn} onPress={() => { if (!draft.trim()) return; setThread((t) => [...t, { role: "you", text: draft }, { role: "agent", text: agentReply(agent, company, draft) }]); setDraft(""); }}><Text style={styles.btnTxt}>Send</Text></TouchableOpacity>
          </KeyboardAvoidingView>
        )}
        {screen === "company" && (
          <View>
            {Object.values(companies).map((c) => <TouchableOpacity key={c.id} style={[styles.card, c.id === activeId && styles.cardOn]} onPress={() => writeCompanies(companies, c.id)}><Text style={styles.cardTitle}>{c.name}</Text><Text style={styles.p}>{c.city}</Text></TouchableOpacity>)}
            {"name,city,phone,email,trades".split(",").map((k) => <TextInput key={k} style={styles.input} placeholder={k} placeholderTextColor="#6b7380" value={coForm[k]} onChangeText={(v) => setCoForm({ ...coForm, [k]: v })} />)}
            <TouchableOpacity style={styles.btn} onPress={() => { if (!coForm.name.trim()) return; const id = coForm.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40); writeCompanies({ ...companies, [id]: { id, name: coForm.name.trim(), city: coForm.city, phone: coForm.phone, email: coForm.email, trades: coForm.trades.split(",").map((s) => s.trim()).filter(Boolean), jobs: [], vendors: [], notes: "Customer tenant." } }, id); }}><Text style={styles.btnTxt}>Create workspace</Text></TouchableOpacity>
            <Text style={styles.p} onPress={() => Linking.openURL("tel:+13322581401")}>1-332-258-1401</Text>
            <Text style={styles.p} onPress={() => Linking.openURL("mailto:bnzbuilders1@gmail.com")}>bnzbuilders1@gmail.com</Text>
          </View>
        )}
      </ScrollView>
      <View style={styles.tabs}>{[["home","Home"],["jobs","Jobs"],["rfq","RFQ"],["agents","Agents"],["company","Co."]].map(([id,label]) => <TouchableOpacity key={id} style={styles.tab} onPress={() => setScreen(id)}><Text style={[styles.tabTxt, screen===id && styles.tabOn]}>{label}</Text></TouchableOpacity>)}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0B0D10" },
  top: { padding: 16, borderBottomWidth: 1, borderBottomColor: "#262B33" },
  kicker: { color: "#E07A3D", letterSpacing: 1.5, fontSize: 11, fontWeight: "700" },
  company: { color: "#F4F4F2", fontSize: 20, fontWeight: "700", marginTop: 4 },
  meta: { color: "#8B949E" },
  body: { flex: 1, padding: 16 },
  p: { color: "#9AA3AD", marginBottom: 8 },
  card: { backgroundColor: "#171B21", borderColor: "#262B33", borderWidth: 1, borderRadius: 14, padding: 14, marginBottom: 10 },
  cardOn: { borderColor: "#E07A3D" },
  tag: { color: "#E07A3D", fontSize: 11, fontWeight: "700" },
  cardTitle: { color: "#F4F4F2", fontSize: 16, fontWeight: "700", marginTop: 4 },
  row: { flexDirection: "row", gap: 8, marginBottom: 10 },
  chip: { borderWidth: 1, borderColor: "#262B33", borderRadius: 999, padding: 8 },
  chipOn: { backgroundColor: "#E07A3D" },
  chipTxt: { color: "#fff" },
  bubble: { backgroundColor: "#171B21", borderRadius: 12, padding: 12, marginBottom: 8 },
  input: { backgroundColor: "#0E1116", borderColor: "#262B33", borderWidth: 1, borderRadius: 10, color: "#fff", padding: 12, marginBottom: 10 },
  btn: { backgroundColor: "#E07A3D", borderRadius: 10, padding: 14, alignItems: "center", marginBottom: 8 },
  btnTxt: { color: "#fff", fontWeight: "700" },
  tabs: { flexDirection: "row", borderTopWidth: 1, borderTopColor: "#262B33" },
  tab: { flex: 1, alignItems: "center", padding: 12 },
  tabTxt: { color: "#6B7380", fontSize: 12 },
  tabOn: { color: "#E07A3D", fontWeight: "700" },
});
