import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import {
  TrendingUp, TrendingDown, Plus, CreditCard,
  Trash2, Bell, X, Check, Zap, Home, List, Layers, Activity,
  Share2, Download, Upload, Users, Copy, CheckCheck, ChevronUp, ChevronDown,
  Filter, Search, ArrowUpCircle, ArrowDownCircle, Target, PiggyBank
} from "lucide-react";

const INITIAL_TRANSACTIONS = [
  { id: 1, type: "entrada", desc: "Salário", value: 4500, category: "Renda", date: "2026-05-05" },
  { id: 2, type: "entrada", desc: "Freelance", value: 800, category: "Renda", date: "2026-05-10" },
  { id: 3, type: "saida", desc: "Aluguel", value: 1200, category: "Moradia", date: "2026-05-01" },
  { id: 4, type: "saida", desc: "Mercado", value: 450, category: "Alimentação", date: "2026-05-07" },
  { id: 5, type: "saida", desc: "Academia", value: 99, category: "Saúde", date: "2026-05-03" },
  { id: 6, type: "saida", desc: "Gasolina", value: 280, category: "Transporte", date: "2026-05-12" },
];
const INITIAL_PARCELAS = [
  { id: 1, desc: "TV 55'' Samsung", total: 3600, parcelas: 12, pagas: 4, valorParcela: 300, tipo: "cartão", inicio: "2026-01" },
  { id: 2, desc: "Notebook Dell", total: 4800, parcelas: 24, pagas: 8, valorParcela: 200, tipo: "crediário", inicio: "2025-09" },
  { id: 3, desc: "Sofá 3 Lugares", total: 1800, parcelas: 6, pagas: 1, valorParcela: 300, tipo: "cartão", inicio: "2026-04" },
];

const CATS = {
  entrada: ["Renda", "Freelance", "Investimento", "Presente", "Outros"],
  saida: ["Moradia", "Alimentação", "Transporte", "Saúde", "Lazer", "Educação", "Vestuário", "Serviços", "Outros"],
};
const CAT_COLORS = {
  Moradia:"#6366f1", Alimentação:"#f59e0b", Transporte:"#3b82f6",
  Saúde:"#10b981", Lazer:"#ec4899", Educação:"#8b5cf6",
  Vestuário:"#14b8a6", Serviços:"#f97316", Outros:"#6b7280",
  Renda:"#00d4aa", Freelance:"#34d399", Investimento:"#a3e635", Presente:"#fb923c",
};
const MONTHS_PT = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
const MONTHS_FULL = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const fmt = (v) => Number(v).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});

function loadLS(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
}
function saveLS(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} }

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{background:"#111827",border:"1px solid #1f2937",borderRadius:10,padding:"10px 14px",fontSize:12}}>
      <p style={{color:"#9ca3af",marginBottom:4}}>{label}</p>
      {payload.map((p,i)=><p key={i} style={{color:p.color||"#00d4aa",fontWeight:600}}>{p.name}: {fmt(p.value)}</p>)}
    </div>
  );
};

// ══════════════════════════════════════════════════════════
// MODAL COM KEYBOARD AWARENESS — zero re-render no React
// ══════════════════════════════════════════════════════════
function KeyboardAwareModal({ show, onClose, title, children }) {
  const overlayRef = useRef(null);
  const innerRef   = useRef(null);

  useEffect(() => {
    if (!show) return;
    const vv = window.visualViewport;
    const sync = () => {
      const overlay = overlayRef.current;
      if (!overlay) return;
      const kbH = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      overlay.style.bottom   = kbH + "px";
      overlay.style.top      = vv.offsetTop + "px";
    };
    if (vv) { vv.addEventListener("resize", sync); vv.addEventListener("scroll", sync); sync(); }
    return () => {
      if (vv) { vv.removeEventListener("resize", sync); vv.removeEventListener("scroll", sync); }
      if (overlayRef.current) { overlayRef.current.style.bottom = "0px"; overlayRef.current.style.top = "0px"; }
    };
  }, [show]);

  const handleFocusCapture = useCallback((e) => {
    const el = e.target;
    if (!["INPUT","TEXTAREA","SELECT"].includes(el.tagName)) return;
    setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "center" }), 400);
  }, []);

  if (!show) return null;

  return (
    <div
      ref={overlayRef}
      style={{
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
        background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)",
        display: "flex", alignItems: "flex-end", justifyContent: "center",
        zIndex: 100, transition: "bottom 0.15s ease, top 0.15s ease",
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={innerRef}
        onFocusCapture={handleFocusCapture}
        style={{
          background: "#0f1829", border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "20px 20px 0 0", width: "100%", maxWidth: 500,
          maxHeight: "92%", boxShadow: "0 -10px 40px rgba(0,0,0,0.6)",
          animation: "slideUp 0.3s ease", display: "flex", flexDirection: "column",
        }}
      >
        <div style={{ padding: "16px 20px 12px", flexShrink: 0, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "#f8fafc" }}>{title}</h3>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,0.06)", border: "none", cursor: "pointer", padding: 8, borderRadius: 8 }}>
              <X size={16} color="#6b7280" />
            </button>
          </div>
        </div>
        <div style={{ overflowY: "auto", overflowX: "hidden", flex: 1, padding: "16px 20px", WebkitOverflowScrolling: "touch", overscrollBehavior: "contain" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function compressData(data) {
  try { return btoa(unescape(encodeURIComponent(JSON.stringify(data)))); } catch { return null; }
}
function decompressData(code) {
  try { return JSON.parse(decodeURIComponent(escape(atob(code.trim())))); } catch { return null; }
}

const inputBase = {
  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 10, padding: "12px 14px", color: "#e2e8f0", fontSize: 16,
  width: "100%", outline: "none", boxSizing: "border-box",
};
const inputFocusStyle = { ...inputBase, background: "rgba(0,212,170,0.07)", border: "1px solid rgba(0,212,170,0.35)" };

function FocusInput({ style, onFocus, onBlur, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      {...props}
      style={focused ? inputFocusStyle : inputBase}
      onFocus={(e) => { setFocused(true); onFocus && onFocus(e); }}
      onBlur={(e)  => { setFocused(false); onBlur  && onBlur(e);  }}
    />
  );
}

// ══════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ══════════════════════════════════════════════════════════
export default function FinanceOS() {
  const [tab, setTab] = useState("dashboard");
  const [transactions, setTransactions] = useState(() => loadLS("fos_tx", INITIAL_TRANSACTIONS));
  const [parcelas, setParcelas] = useState(() => loadLS("fos_parc", INITIAL_PARCELAS));
  const [showModal, setShowModal] = useState(null);
  const [dismissedAlerts, setDismissedAlerts] = useState(() => loadLS("fos_alerts", []));
  const [simMonths, setSimMonths] = useState(6);
  const [txForm, setTxForm] = useState({ type: "saida", desc: "", value: "", category: "Outros", date: new Date().toISOString().split("T")[0] });
  const [pForm, setPForm] = useState({ desc: "", total: "", parcelas: "", valorParcela: "", tipo: "cartão", inicio: new Date().toISOString().slice(0,7) });
  const [copied, setCopied] = useState(false);
  const [importText, setImportText] = useState("");
  const [importMsg, setImportMsg] = useState("");
  const [shareStep, setShareStep] = useState("menu");
  // Filtros da aba Transações
  const [txFilter, setTxFilter] = useState("todos"); // todos | entrada | saida
  const [txSearch, setTxSearch] = useState("");
  const [txMonth, setTxMonth] = useState(new Date().toISOString().slice(0,7)); // YYYY-MM

  useEffect(() => { saveLS("fos_tx", transactions); }, [transactions]);
  useEffect(() => { saveLS("fos_parc", parcelas); }, [parcelas]);
  useEffect(() => { saveLS("fos_alerts", dismissedAlerts); }, [dismissedAlerts]);

  useEffect(() => {
    if (showModal !== "share") { setShareStep("menu"); setImportText(""); setImportMsg(""); }
  }, [showModal]);

  const totalEntradas = useMemo(() => transactions.filter(t => t.type === "entrada").reduce((s,t) => s + Number(t.value), 0), [transactions]);
  const totalSaidas   = useMemo(() => transactions.filter(t => t.type === "saida").reduce((s,t) => s + Number(t.value), 0), [transactions]);
  const totalParcelas = useMemo(() => parcelas.reduce((s,p) => s + Number(p.valorParcela), 0), [parcelas]);
  const saldo = totalEntradas - totalSaidas;
  const saldoReal = saldo - totalParcelas;

  // Transações filtradas por mês, tipo e busca
  const filteredTx = useMemo(() => {
    return [...transactions]
      .reverse()
      .filter(t => {
        const matchMonth = txMonth ? t.date.startsWith(txMonth) : true;
        const matchType  = txFilter === "todos" ? true : t.type === txFilter;
        const matchSearch = txSearch
          ? t.desc.toLowerCase().includes(txSearch.toLowerCase()) || t.category.toLowerCase().includes(txSearch.toLowerCase())
          : true;
        return matchMonth && matchType && matchSearch;
      });
  }, [transactions, txFilter, txSearch, txMonth]);

  const filteredEntradas = useMemo(() => filteredTx.filter(t => t.type === "entrada").reduce((s,t) => s + Number(t.value), 0), [filteredTx]);
  const filteredSaidas   = useMemo(() => filteredTx.filter(t => t.type === "saida").reduce((s,t) => s + Number(t.value), 0), [filteredTx]);

  const projection = useMemo(() => {
    const hoje = new Date();
    return Array.from({ length: simMonths }, (_, i) => {
      const d = new Date(hoje.getFullYear(), hoje.getMonth() + i, 1);
      const label = `${MONTHS_PT[d.getMonth()]}/${d.getFullYear().toString().slice(2)}`;
      const parcelasMes = parcelas.reduce((s,p) => { const r = p.parcelas - p.pagas; return i < r ? s + Number(p.valorParcela) : s; }, 0);
      return { label, entradas: totalEntradas, saidas: totalSaidas, parcelas: parcelasMes, saldo: totalEntradas - totalSaidas - parcelasMes };
    });
  }, [simMonths, totalEntradas, totalSaidas, parcelas]);

  const catBreakdown = useMemo(() => {
    const map = {};
    transactions.filter(t => t.type === "saida").forEach(t => { map[t.category] = (map[t.category] || 0) + Number(t.value); });
    return Object.entries(map).map(([name,value]) => ({ name, value })).sort((a,b) => b.value - a.value);
  }, [transactions]);

  const alerts = useMemo(() => {
    const list = [];
    if (saldoReal < 0) list.push({ id: "neg", level: "critical", msg: `Saldo real NEGATIVO: ${fmt(saldoReal)}. Finanças em colapso!` });
    else if (saldoReal < 500) list.push({ id: "low", level: "warning", msg: `Saldo real baixo: ${fmt(saldoReal)}. Risco de inadimplência.` });
    const negMonth = projection.findIndex(p => p.saldo < 0);
    if (negMonth >= 0 && negMonth < 3) list.push({ id: "proj", level: "danger", msg: `Projeção negativa em ${projection[negMonth].label}! Revise seus gastos.` });
    if (totalEntradas > 0 && totalParcelas > totalEntradas * 0.3) list.push({ id: "parc", level: "warning", msg: `Parcelas comprometem ${((totalParcelas/totalEntradas)*100).toFixed(0)}% da renda.` });
    return list.filter(a => !dismissedAlerts.includes(a.id));
  }, [saldoReal, projection, totalParcelas, totalEntradas, dismissedAlerts]);

  const addTx = () => {
    if (!txForm.desc || !txForm.value) return;
    setTransactions(p => [...p, { ...txForm, id: Date.now(), value: parseFloat(txForm.value) }]);
    setTxForm({ type: "saida", desc: "", value: "", category: "Outros", date: new Date().toISOString().split("T")[0] });
    setShowModal(null);
  };
  const addParcela = () => {
    if (!pForm.desc || !pForm.valorParcela || !pForm.parcelas) return;
    setParcelas(p => [...p, { ...pForm, id: Date.now(), pagas: 0, valorParcela: parseFloat(pForm.valorParcela), parcelas: parseInt(pForm.parcelas), total: parseFloat(pForm.total || pForm.valorParcela * pForm.parcelas) }]);
    setPForm({ desc: "", total: "", parcelas: "", valorParcela: "", tipo: "cartão", inicio: new Date().toISOString().slice(0,7) });
    setShowModal(null);
  };
  const removeTx = (id) => setTransactions(p => p.filter(t => t.id !== id));
  const removeParcela = (id) => setParcelas(p => p.filter(t => t.id !== id));
  const payParcela = (id) => setParcelas(p => p.map(t => t.id === id ? { ...t, pagas: Math.min(t.pagas + 1, t.parcelas) } : t));
  const resetData = () => { if (window.confirm("Apagar todos os dados?")) { setTransactions([]); setParcelas([]); setDismissedAlerts([]); } };

  const getExportData = () => ({ transactions, parcelas, exportedAt: new Date().toISOString(), version: "2.0" });
  const getExportCode = () => compressData(getExportData()) || "";

  const copyCode = async () => {
    const code = getExportCode();
    try { await navigator.clipboard.writeText(code); }
    catch {
      const el = document.createElement("textarea"); el.value = code;
      document.body.appendChild(el); el.select(); document.execCommand("copy"); document.body.removeChild(el);
    }
    setCopied(true); setTimeout(() => setCopied(false), 3000);
  };

  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(getExportData(), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "financeos_dados.json"; a.click(); URL.revokeObjectURL(url);
  };

  const shareWhatsApp = () => {
    const code = getExportCode();
    const msg  = `📊 *FinanceOS – Meus dados financeiros*\n\nCole esse código no app FinanceOS → Família → Receber dados:\n\n${code}`;
    const encoded = encodeURIComponent(msg);
    if (navigator.share) { navigator.share({ title: "FinanceOS", text: msg }).catch(() => {}); return; }
    const link = document.createElement("a"); link.href = `https://wa.me/?text=${encoded}`; link.target = "_blank"; link.rel = "noopener noreferrer";
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  const shareNative = async () => {
    const code = getExportCode();
    const text = `📊 FinanceOS\n\nCole esse código no app:\n\n${code}`;
    if (navigator.share) { try { await navigator.share({ title: "FinanceOS", text }); return; } catch {} }
    copyCode();
  };

  const importData = () => {
    const text = importText.trim();
    if (!text) { setImportMsg("❌ Cole o código antes de importar."); return; }
    let data = decompressData(text);
    if (!data) { try { data = JSON.parse(text); } catch { data = null; } }
    if (!data || !data.transactions || !data.parcelas) { setImportMsg("❌ Código inválido. Verifique e tente novamente."); return; }
    setTransactions(data.transactions); setParcelas(data.parcelas);
    setImportMsg("✅ Dados importados com sucesso!"); setImportText("");
    setTimeout(() => { setImportMsg(""); setShowModal(null); }, 2000);
  };

  const importFromFile = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader(); reader.onload = (ev) => { setImportText(ev.target.result); }; reader.readAsText(file);
  };

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: <Home size={14}/> },
    { id: "transacoes", label: "Transações", icon: <List size={14}/> },
    { id: "parcelas", label: "Parcelas", icon: <Layers size={14}/> },
    { id: "simulacao", label: "Simulação", icon: <Activity size={14}/> },
  ];

  // Score de saúde
  const scoreData = useMemo(() => {
    let score = 100; const issues = [];
    if (saldoReal < 0) { score -= 40; issues.push({ label: "Saldo negativo", pts: -40, c: "#ef4444" }); }
    else if (saldoReal < 500) { score -= 20; issues.push({ label: "Saldo muito baixo", pts: -20, c: "#f59e0b" }); }
    const comprom = totalEntradas > 0 ? (totalParcelas/totalEntradas)*100 : 0;
    if (comprom > 40) { score -= 30; issues.push({ label: `Parcelas: ${comprom.toFixed(0)}% da renda`, pts: -30, c: "#ef4444" }); }
    else if (comprom > 30) { score -= 15; issues.push({ label: `Parcelas: ${comprom.toFixed(0)}% da renda`, pts: -15, c: "#f59e0b" }); }
    const negIdx = projection.findIndex(p => p.saldo < 0);
    if (negIdx >= 0 && negIdx < 2) { score -= 25; issues.push({ label: `Colapso em ${negIdx+1} meses`, pts: -25, c: "#ef4444" }); }
    else if (negIdx >= 0 && negIdx < 4) { score -= 10; issues.push({ label: `Risco em ${negIdx+1} meses`, pts: -10, c: "#f59e0b" }); }
    score = Math.max(0, score);
    const color = score >= 70 ? "#10b981" : score >= 40 ? "#f59e0b" : "#ef4444";
    const labelScore = score >= 70 ? "Saudável" : score >= 40 ? "Atenção" : "Crítico";
    return { score, color, labelScore, issues };
  }, [saldoReal, projection, totalParcelas, totalEntradas]);

  const C = {
    app: { height: "100vh", width: "100%", maxWidth: "100vw", overflow: "hidden", display: "flex", flexDirection: "column", background: "#070c18", color: "#e2e8f0", fontFamily: "'DM Sans','Segoe UI',sans-serif", backgroundImage: "radial-gradient(ellipse at 20% 0%,rgba(0,212,170,0.08) 0%,transparent 60%),radial-gradient(ellipse at 80% 100%,rgba(99,102,241,0.07) 0%,transparent 60%)" },
    // Header e Nav FIXOS no topo — agora fazem parte do flex layout
    topBar: { flexShrink: 0, zIndex: 50, background: "rgba(7,12,24,0.97)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.07)" },
    header: { padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", boxSizing: "border-box" },
    navBar: { display: "flex", overflowX: "auto", padding: "0 8px", gap: 4, WebkitOverflowScrolling: "touch", scrollbarWidth: "none", borderTop: "1px solid rgba(255,255,255,0.04)" },
    navBtn: (a) => ({ padding: "10px 14px", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, background: "transparent", color: a ? "#00d4aa" : "#6b7280", borderBottom: a ? "2px solid #00d4aa" : "2px solid transparent", transition: "all 0.2s", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 6 }),
    // Área de conteúdo com scroll próprio — ocupa o restante da tela
    main: { padding: "14px", boxSizing: "border-box", width: "100%", maxWidth: 800, margin: "0 auto", paddingTop: "8px" },
    pageWrapper: { flex: 1, overflowY: "auto", overflowX: "hidden", WebkitOverflowScrolling: "touch", paddingBottom: "80px" },
    alertBar: (l) => ({ background: l === "critical" ? "rgba(239,68,68,0.12)" : "rgba(245,158,11,0.1)", border: `1px solid ${l === "critical" ? "rgba(239,68,68,0.4)" : "rgba(245,158,11,0.3)"}`, borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }),
    card: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "16px", boxSizing: "border-box", width: "100%", marginBottom: 14 },
    grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 },
    statCard: (c) => ({ background: `linear-gradient(135deg,${c}15,${c}05)`, border: `1px solid ${c}30`, borderRadius: 16, padding: "14px 16px", boxSizing: "border-box" }),
    statVal: { fontSize: 22, fontWeight: 800, letterSpacing: "-0.5px", marginTop: 6, lineHeight: 1.2 },
    label: { fontSize: 11, color: "#6b7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 6, display: "block" },
    badge: (c) => ({ display: "inline-block", padding: "2px 8px", borderRadius: 20, fontSize: 10, fontWeight: 700, background: `${c}22`, color: c }),
    tag: (c) => ({ padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: `${c}18`, color: c, border: `1px solid ${c}30`, display: "inline-block" }),
    btn: (c = "#00d4aa", ghost = false) => ({ padding: "10px 16px", borderRadius: 10, border: ghost ? `1px solid ${c}40` : "none", background: ghost ? "transparent" : `linear-gradient(135deg,${c},${c}bb)`, color: ghost ? c : "#070c18", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s", whiteSpace: "nowrap" }),
    input: { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "12px 14px", color: "#e2e8f0", fontSize: 16, width: "100%", outline: "none", boxSizing: "border-box" },
    select: { background: "#0f1829", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "12px 14px", color: "#e2e8f0", fontSize: 16, width: "100%", outline: "none", cursor: "pointer", boxSizing: "border-box" },
    divider: { height: 1, background: "rgba(255,255,255,0.06)", margin: "14px 0" },
    txRow: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 14px", borderRadius: 12, background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)", marginBottom: 8 },
    pCard: { background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 14, marginBottom: 10 },
    progressTrack: { width: "100%", height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 10, overflow: "hidden", marginTop: 8 },
    shareCard: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 16, marginBottom: 12 },
    // Sticky summary bar para Transações
    stickySummary: { position: "sticky", top: 0, zIndex: 30, background: "rgba(7,12,24,0.96)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "10px 14px", boxSizing: "border-box", width: "100%" },
  };

  // Mês anterior e próximo para navegar
  const changeMonth = (dir) => {
    const [y, m] = txMonth.split("-").map(Number);
    const d = new Date(y, m - 1 + dir, 1);
    setTxMonth(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`);
  };
  const monthLabel = () => {
    const [y, m] = txMonth.split("-").map(Number);
    return `${MONTHS_FULL[m-1]} ${y}`;
  };

  return (
    <div style={C.app}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        html,body{height:100%;overflow:hidden;width:100%}
        #root{height:100%}
        ::-webkit-scrollbar{width:3px;height:3px}
        ::-webkit-scrollbar-thumb{background:#1f2937;border-radius:4px}
        input::placeholder{color:#374151}
        input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none}
        textarea{resize:none;font-family:inherit}
        @keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
        @keyframes slideIn{from{transform:translateY(-8px);opacity:0}to{transform:translateY(0);opacity:1}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        .nav-scroll::-webkit-scrollbar{display:none}
        textarea:focus{outline:none;border-color:rgba(0,212,170,0.35)!important;background:rgba(0,212,170,0.07)!important;}
        select:focus{outline:none;border-color:rgba(0,212,170,0.35)!important;}
        .tx-row-anim{animation:fadeIn 0.25s ease both}
        .fab-btn{position:fixed;bottom:24px;right:20px;z-index:60;width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#00d4aa,#6366f1);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 20px rgba(0,212,170,0.4);transition:transform 0.2s;}
        .fab-btn:active{transform:scale(0.92);}
        .filter-chip{padding:6px 12px;border-radius:20px;border:1px solid rgba(255,255,255,0.1);background:transparent;color:#6b7280;font-size:12px;font-weight:600;cursor:pointer;transition:all 0.15s;white-space:nowrap;}
        .filter-chip.active{background:rgba(0,212,170,0.15);border-color:rgba(0,212,170,0.4);color:#00d4aa;}
        .filter-chip.entrada.active{background:rgba(16,185,129,0.15);border-color:rgba(16,185,129,0.4);color:#10b981;}
        .filter-chip.saida.active{background:rgba(239,68,68,0.15);border-color:rgba(239,68,68,0.4);color:#ef4444;}
      `}</style>

      {/* ═══════════ TOPBAR FIXA (Header + Nav) ═══════════ */}
      <div style={C.topBar}>
        {/* HEADER */}
        <div style={C.header}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, background: "linear-gradient(135deg,#00d4aa,#6366f1)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Zap size={16} color="#fff"/>
            </div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-0.5px", color: "#f8fafc", lineHeight: 1.1 }}>FinanceOS</div>
              <div style={{ fontSize: 9, color: "#00d4aa", letterSpacing: "2px", fontWeight: 600 }}>CONTROLE TOTAL</div>
            </div>
          </div>
          {/* Saldo real compacto no header */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 10, color: "#6b7280", fontWeight: 600 }}>SALDO REAL</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: saldoReal >= 0 ? "#00d4aa" : "#ef4444", letterSpacing: "-0.3px" }}>{fmt(saldoReal)}</div>
            </div>
            {alerts.length > 0 && (
              <div style={{ position: "relative" }}>
                <Bell size={20} color="#f59e0b" style={{ animation: "pulse 2s infinite" }}/>
                <div style={{ position: "absolute", top: -5, right: -5, width: 14, height: 14, background: "#ef4444", borderRadius: "50%", fontSize: 8, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "#fff" }}>{alerts.length}</div>
              </div>
            )}
            <button onClick={() => setShowModal("share")} style={{ background: "rgba(0,212,170,0.1)", border: "1px solid rgba(0,212,170,0.2)", borderRadius: 8, padding: "6px 10px", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, color: "#00d4aa", fontSize: 12, fontWeight: 600 }}>
              <Users size={14}/> Família
            </button>
          </div>
        </div>

        {/* NAV TABS */}
        <div style={C.navBar} className="nav-scroll">
          {tabs.map(t => (
            <button key={t.id} style={C.navBtn(tab === t.id)} onClick={() => setTab(t.id)}>
              {t.icon}{t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ═══════════ CONTEÚDO ROLÁVEL ═══════════ */}
      <div style={C.pageWrapper}>

        {/* ── ALERTAS ── */}
        {alerts.length > 0 && (
          <div style={C.main}>
            {alerts.map(a => (
              <div key={a.id} style={{ ...C.alertBar(a.level), animation: "slideIn 0.3s ease" }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: a.level === "critical" ? "#fca5a5" : "#fcd34d", flex: 1, paddingRight: 10 }}>⚠ {a.msg}</span>
                <button onClick={() => setDismissedAlerts(p => [...p, a.id])} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280", flexShrink: 0 }}><X size={14}/></button>
              </div>
            ))}
          </div>
        )}

        {/* ── DASHBOARD ── */}
        {tab === "dashboard" && (
          <div style={C.main}>
            <div style={C.grid2}>
              <div style={C.statCard("#00d4aa")}>
                <div style={{ fontSize: 11, color: "#6b7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px" }}>Saldo Real</div>
                <div style={{ ...C.statVal, color: saldoReal >= 0 ? "#00d4aa" : "#ef4444" }}>{fmt(saldoReal)}</div>
                <div style={{ fontSize: 11, color: "#6b7280", marginTop: 4 }}>após parcelas</div>
              </div>
              <div style={C.statCard("#10b981")}>
                <div style={{ fontSize: 11, color: "#6b7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px" }}>Entradas</div>
                <div style={{ ...C.statVal, color: "#10b981" }}>{fmt(totalEntradas)}</div>
                <div style={{ fontSize: 11, color: "#6b7280", marginTop: 4 }}>{transactions.filter(t => t.type === "entrada").length} lançamentos</div>
              </div>
              <div style={C.statCard("#ef4444")}>
                <div style={{ fontSize: 11, color: "#6b7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px" }}>Saídas</div>
                <div style={{ ...C.statVal, color: "#ef4444" }}>{fmt(totalSaidas)}</div>
                <div style={{ fontSize: 11, color: "#6b7280", marginTop: 4 }}>{transactions.filter(t => t.type === "saida").length} lançamentos</div>
              </div>
              <div style={C.statCard("#f59e0b")}>
                <div style={{ fontSize: 11, color: "#6b7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px" }}>Parcelas/mês</div>
                <div style={{ ...C.statVal, color: "#f59e0b" }}>{fmt(totalParcelas)}</div>
                <div style={{ fontSize: 11, color: "#6b7280", marginTop: 4 }}>{parcelas.length} contratos</div>
              </div>
            </div>

            {/* Mini Score no Dashboard */}
            <div style={{ ...C.card, display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", marginBottom: 14 }}>
              <div style={{ textAlign: "center", flexShrink: 0 }}>
                <div style={{ fontSize: 40, fontWeight: 900, color: scoreData.color, lineHeight: 1, letterSpacing: "-2px" }}>{scoreData.score}</div>
                <span style={C.tag(scoreData.color)}>{scoreData.labelScore}</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#9ca3af", marginBottom: 6 }}>Score de Saúde</div>
                <div style={{ width: "100%", height: 8, background: "rgba(255,255,255,0.08)", borderRadius: 10, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${scoreData.score}%`, background: `linear-gradient(90deg,${scoreData.color}99,${scoreData.color})`, borderRadius: 10, transition: "width 1s ease" }}/>
                </div>
                <div style={{ fontSize: 11, color: "#6b7280", marginTop: 5 }}>
                  {scoreData.issues.length === 0 ? "✓ Finanças em dia!" : scoreData.issues[0]?.label}
                </div>
              </div>
            </div>

            <div style={C.card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <span style={{ fontWeight: 700, fontSize: 13, color: "#9ca3af" }}>Projeção de Saldo</span>
                <span style={C.badge("#6366f1")}>6 MESES</span>
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={projection}>
                  <defs>
                    <linearGradient id="sG" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00d4aa" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#00d4aa" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)"/>
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false}/>
                  <YAxis tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} tickFormatter={v => `R$${(v/1000).toFixed(1)}k`} width={48}/>
                  <Tooltip content={<CustomTooltip/>}/>
                  <Area type="monotone" dataKey="saldo" name="Saldo" stroke="#00d4aa" fill="url(#sG)" strokeWidth={2} dot={{ fill: "#00d4aa", r: 3 }}/>
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div style={C.card}>
              <div style={{ fontWeight: 700, fontSize: 13, color: "#9ca3af", marginBottom: 14 }}>Gastos por Categoria</div>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <ResponsiveContainer width="45%" height={150}>
                  <PieChart>
                    <Pie data={catBreakdown} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                      {catBreakdown.map((e,i) => <Cell key={i} fill={CAT_COLORS[e.name] || "#6b7280"}/>)}
                    </Pie>
                    <Tooltip content={<CustomTooltip/>}/>
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ flex: 1, maxHeight: 150, overflowY: "auto" }}>
                  {catBreakdown.map((c,i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 7, height: 7, borderRadius: "50%", background: CAT_COLORS[c.name] || "#6b7280", flexShrink: 0 }}/>
                        <span style={{ fontSize: 12, color: "#9ca3af" }}>{c.name}</span>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#e2e8f0" }}>{fmt(c.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={C.card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <span style={{ fontWeight: 700, fontSize: 13, color: "#9ca3af" }}>Últimas Transações</span>
                <div style={{ display: "flex", gap: 8 }}>
                  <button style={C.btn("#ef4444", true)} onClick={() => { setTxForm(p => ({ ...p, type: "saida" })); setShowModal("tx"); }}><Plus size={13}/>Saída</button>
                  <button style={C.btn("#10b981")} onClick={() => { setTxForm(p => ({ ...p, type: "entrada" })); setShowModal("tx"); }}><Plus size={13}/>Entrada</button>
                </div>
              </div>
              {[...transactions].reverse().slice(0, 5).map(t => (
                <div key={t.id} style={C.txRow} className="tx-row-anim">
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: t.type === "entrada" ? "#10b98120" : "#ef444420", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {t.type === "entrada" ? <TrendingUp size={15} color="#10b981"/> : <TrendingDown size={15} color="#ef4444"/>}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{t.desc}</div>
                      <span style={C.tag(CAT_COLORS[t.category] || "#6b7280")}>{t.category}</span>
                    </div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: t.type === "entrada" ? "#10b981" : "#ef4444", whiteSpace: "nowrap" }}>
                    {t.type === "entrada" ? "+" : "-"}{fmt(t.value)}
                  </div>
                </div>
              ))}
              <button style={{ ...C.btn("#6366f1", true), width: "100%", justifyContent: "center", marginTop: 8 }} onClick={() => setTab("transacoes")}>Ver todas →</button>
            </div>
          </div>
        )}

        {/* ── TRANSAÇÕES ── */}
        {tab === "transacoes" && <>
          {/* Barra de resumo STICKY abaixo da topBar */}
          <div style={C.stickySummary}>
            {/* Navegação de Mês */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <button onClick={() => changeMonth(-1)} style={{ background: "rgba(255,255,255,0.06)", border: "none", cursor: "pointer", padding: "6px 10px", borderRadius: 8, color: "#9ca3af", fontSize: 13, fontWeight: 600 }}>‹</button>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#f8fafc" }}>{monthLabel()}</span>
              <button onClick={() => changeMonth(1)} style={{ background: "rgba(255,255,255,0.06)", border: "none", cursor: "pointer", padding: "6px 10px", borderRadius: 8, color: "#9ca3af", fontSize: 13, fontWeight: 600 }}>›</button>
            </div>
            {/* Totais do mês filtrado */}
            <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
              <div style={{ flex: 1, background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 10, padding: "8px 12px", display: "flex", alignItems: "center", gap: 8 }}>
                <ArrowUpCircle size={16} color="#10b981"/>
                <div>
                  <div style={{ fontSize: 10, color: "#10b981", fontWeight: 600 }}>ENTRADAS</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "#10b981" }}>{fmt(filteredEntradas)}</div>
                </div>
              </div>
              <div style={{ flex: 1, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, padding: "8px 12px", display: "flex", alignItems: "center", gap: 8 }}>
                <ArrowDownCircle size={16} color="#ef4444"/>
                <div>
                  <div style={{ fontSize: 10, color: "#ef4444", fontWeight: 600 }}>SAÍDAS</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "#ef4444" }}>{fmt(filteredSaidas)}</div>
                </div>
              </div>
            </div>
            {/* Filtros por tipo + busca */}
            <div style={{ display: "flex", gap: 6, alignItems: "center", overflowX: "auto", scrollbarWidth: "none" }}>
              {["todos","entrada","saida"].map(f => (
                <button key={f} className={`filter-chip ${f} ${txFilter === f ? "active" : ""}`} onClick={() => setTxFilter(f)}>
                  {f === "todos" ? "Todos" : f === "entrada" ? "📈 Entradas" : "📉 Saídas"}
                </button>
              ))}
              <div style={{ flex: 1, minWidth: 90, position: "relative" }}>
                <Search size={12} color="#6b7280" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }}/>
                <input
                  placeholder="Buscar..."
                  value={txSearch}
                  onChange={e => setTxSearch(e.target.value)}
                  style={{ ...C.input, padding: "7px 10px 7px 28px", fontSize: 13, borderRadius: 20 }}
                />
              </div>
            </div>
          </div>

          <div style={C.main}>
            <div style={C.card}>
              <div style={{ fontWeight: 700, fontSize: 13, color: "#9ca3af", marginBottom: 12 }}>
                {filteredTx.length} lançamento{filteredTx.length !== 1 ? "s" : ""}
              </div>
              {filteredTx.length === 0 && (
                <div style={{ textAlign: "center", color: "#6b7280", padding: "20px 0", fontSize: 13 }}>
                  Nenhuma transação encontrada.
                </div>
              )}
              {filteredTx.map((t, idx) => (
                <div key={t.id} style={{ ...C.txRow, animationDelay: `${idx * 0.04}s` }} className="tx-row-anim">
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: t.type === "entrada" ? "#10b98120" : "#ef444420", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {t.type === "entrada" ? <TrendingUp size={15} color="#10b981"/> : <TrendingDown size={15} color="#ef4444"/>}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.desc}</div>
                      <div style={{ fontSize: 11, color: "#6b7280" }}>{t.date} · <span style={C.tag(CAT_COLORS[t.category] || "#6b7280")}>{t.category}</span></div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: t.type === "entrada" ? "#10b981" : "#ef4444" }}>{t.type === "entrada" ? "+" : "-"}{fmt(t.value)}</div>
                    <button onClick={() => removeTx(t.id)} style={{ background: "rgba(239,68,68,0.1)", border: "none", cursor: "pointer", padding: 6, borderRadius: 8, display: "flex" }}><Trash2 size={12} color="#ef4444"/></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>}

        {/* ── PARCELAS ── */}
        {tab === "parcelas" && (
          <div style={C.main}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: "#f8fafc" }}>Parcelamentos</h2>
                <p style={{ fontSize: 12, color: "#6b7280" }}>Cartão, crediário e financiamentos</p>
              </div>
              <button style={C.btn("#f59e0b")} onClick={() => setShowModal("parcela")}><Plus size={13}/>Novo</button>
            </div>
            <div style={C.grid2}>
              <div style={C.statCard("#f59e0b")}>
                <div style={{ fontSize: 11, color: "#6b7280", fontWeight: 600, textTransform: "uppercase" }}>Por mês</div>
                <div style={{ ...C.statVal, color: "#f59e0b" }}>{fmt(totalParcelas)}</div>
                <div style={{ fontSize: 11, color: "#6b7280", marginTop: 4 }}>{totalEntradas > 0 ? `${((totalParcelas/totalEntradas)*100).toFixed(0)}% da renda` : ""}</div>
              </div>
              <div style={C.statCard("#6366f1")}>
                <div style={{ fontSize: 11, color: "#6b7280", fontWeight: 600, textTransform: "uppercase" }}>Total restante</div>
                <div style={{ ...C.statVal, color: "#6366f1" }}>{fmt(parcelas.reduce((s,p) => s + (p.parcelas - p.pagas) * Number(p.valorParcela), 0))}</div>
                <div style={{ fontSize: 11, color: "#6b7280", marginTop: 4 }}>{parcelas.filter(p => p.pagas < p.parcelas).length} contratos</div>
              </div>
            </div>
            {parcelas.length === 0 && <div style={{ ...C.card, textAlign: "center", color: "#6b7280", padding: "30px 16px", fontSize: 13 }}>Nenhum parcelamento cadastrado.</div>}
            {parcelas.map(p => {
              const restantes = p.parcelas - p.pagas; const pct = (p.pagas / p.parcelas) * 100;
              const cor = p.tipo === "cartão" ? "#6366f1" : p.tipo === "crediário" ? "#f59e0b" : "#10b981";
              const quitado = restantes === 0;
              return (
                <div key={p.id} style={{ ...C.pCard, opacity: quitado ? 0.6 : 1 }} className="tx-row-anim">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: `${cor}22`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <CreditCard size={17} color={cor}/>
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.desc}</div>
                        <div style={{ display: "flex", gap: 6, marginTop: 3, flexWrap: "wrap" }}>
                          <span style={C.tag(cor)}>{p.tipo}</span>
                          {quitado && <span style={C.tag("#10b981")}>✓ Quitado</span>}
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontSize: 18, fontWeight: 800, color: cor }}>{fmt(p.valorParcela)}<span style={{ fontSize: 11, color: "#6b7280" }}>/mês</span></div>
                      <div style={{ fontSize: 11, color: "#6b7280" }}>{p.pagas}/{p.parcelas}</div>
                    </div>
                  </div>
                  <div style={C.progressTrack}><div style={{ height: "100%", width: `${pct}%`, background: cor, borderRadius: 10, transition: "width 0.5s" }}/></div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
                    <div style={{ fontSize: 12, color: "#6b7280" }}>Restante: <strong style={{ color: "#e2e8f0" }}>{fmt(restantes * Number(p.valorParcela))}</strong>{!quitado && <span> · <strong style={{ color: "#e2e8f0" }}>{restantes}x</strong></span>}</div>
                    <div style={{ display: "flex", gap: 8 }}>
                      {!quitado && <button style={{ ...C.btn("#10b981", true), padding: "6px 10px", fontSize: 11 }} onClick={() => payParcela(p.id)}><Check size={11}/>Pagar</button>}
                      <button onClick={() => removeParcela(p.id)} style={{ background: "rgba(239,68,68,0.1)", border: "none", cursor: "pointer", padding: "6px 8px", borderRadius: 8, display: "flex" }}><Trash2 size={12} color="#ef4444"/></button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── SIMULAÇÃO ── */}
        {tab === "simulacao" && (
          <div style={C.main}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: "#f8fafc" }}>Simulação</h2>
                <p style={{ fontSize: 12, color: "#6b7280" }}>Projeção de saúde financeira</p>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {[3,6,12].map(m => (
                  <button key={m} style={{ padding: "6px 10px", borderRadius: 8, border: `1px solid ${simMonths === m ? "#00d4aa" : "rgba(255,255,255,0.1)"}`, background: simMonths === m ? "#00d4aa20" : "transparent", color: simMonths === m ? "#00d4aa" : "#6b7280", fontWeight: 700, fontSize: 12, cursor: "pointer" }} onClick={() => setSimMonths(m)}>{m}m</button>
                ))}
              </div>
            </div>

            <div style={{ ...C.card, background: "linear-gradient(135deg,rgba(0,212,170,0.07),rgba(99,102,241,0.07))", borderColor: "rgba(0,212,170,0.2)" }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: "#9ca3af", marginBottom: 12 }}>Score de Saúde Financeira</div>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ textAlign: "center", flexShrink: 0 }}>
                  <div style={{ fontSize: 56, fontWeight: 900, color: scoreData.color, letterSpacing: "-2px", lineHeight: 1 }}>{scoreData.score}</div>
                  <span style={C.tag(scoreData.color)}>{scoreData.labelScore}</span>
                </div>
                <div style={{ flex: 1 }}>
                  {scoreData.issues.length === 0
                    ? <div style={{ color: "#10b981", fontSize: 13 }}>✓ Finanças saudáveis!</div>
                    : scoreData.issues.map((issue,i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                          <span style={{ fontSize: 12, color: "#9ca3af" }}>{issue.label}</span>
                          <span style={{ fontSize: 12, fontWeight: 700, color: issue.c }}>{issue.pts} pts</span>
                        </div>
                      ))
                  }
                </div>
              </div>
            </div>

            <div style={C.card}>
              <div style={{ fontWeight: 700, fontSize: 13, color: "#9ca3af", marginBottom: 14 }}>Fluxo de Caixa — {simMonths} meses</div>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={projection}>
                  <defs>
                    <linearGradient id="slG" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#00d4aa" stopOpacity={0.35}/><stop offset="95%" stopColor="#00d4aa" stopOpacity={0}/></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)"/>
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false}/>
                  <YAxis tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} tickFormatter={v => `R$${(v/1000).toFixed(1)}k`} width={48}/>
                  <Tooltip content={<CustomTooltip/>}/>
                  <Area type="monotone" dataKey="entradas" name="Entradas" stroke="#10b981" fill="none" strokeWidth={1.5} strokeDasharray="4 3" dot={false}/>
                  <Area type="monotone" dataKey="saidas" name="Saídas" stroke="#ef4444" fill="none" strokeWidth={1.5} strokeDasharray="4 3" dot={false}/>
                  <Area type="monotone" dataKey="saldo" name="Saldo" stroke="#00d4aa" fill="url(#slG)" strokeWidth={2.5} dot={{ fill: "#00d4aa", r: 3 }}/>
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <button onClick={resetData} style={{ background: "none", border: "1px solid rgba(239,68,68,0.2)", color: "#6b7280", padding: "8px 16px", borderRadius: 10, cursor: "pointer", fontSize: 12 }}>
                🗑 Apagar todos os dados
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ═══════════ FAB — Botão flutuante de ação rápida ═══════════ */}
      <button
        className="fab-btn"
        onClick={() => setShowModal("tx")}
        title="Nova transação"
      >
        <Plus size={24} color="#fff"/>
      </button>

      {/* ══ MODAL: NOVA TRANSAÇÃO ══ */}
      <KeyboardAwareModal show={showModal === "tx"} onClose={() => setShowModal(null)} title="Nova Transação">
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {["saida","entrada"].map(tp => (
            <button key={tp} style={{ flex: 1, padding: 12, borderRadius: 10, cursor: "pointer", fontWeight: 700, fontSize: 14, border: `2px solid ${txForm.type === tp ? (tp === "entrada" ? "#10b981" : "#ef4444") : "rgba(255,255,255,0.08)"}`, background: txForm.type === tp ? (tp === "entrada" ? "#10b98120" : "#ef444420") : "transparent", color: txForm.type === tp ? (tp === "entrada" ? "#10b981" : "#ef4444") : "#6b7280", transition: "all 0.2s" }} onClick={() => setTxForm(p => ({ ...p, type: tp, category: tp === "entrada" ? "Renda" : "Outros" }))}>
              {tp === "entrada" ? "📈 Entrada" : "📉 Saída"}
            </button>
          ))}
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={C.label}>Descrição</label>
          <FocusInput placeholder="Ex: Salário, Mercado..." value={txForm.desc} onChange={e => setTxForm(p => ({ ...p, desc: e.target.value }))}/>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={C.label}>Valor (R$)</label>
          <FocusInput type="number" inputMode="decimal" placeholder="0,00" value={txForm.value} onChange={e => setTxForm(p => ({ ...p, value: e.target.value }))}/>
        </div>
        <div style={{ ...C.grid2, marginBottom: 14 }}>
          <div>
            <label style={C.label}>Categoria</label>
            <select style={C.select} value={txForm.category} onChange={e => setTxForm(p => ({ ...p, category: e.target.value }))}>
              {CATS[txForm.type].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={C.label}>Data</label>
            <FocusInput type="date" value={txForm.date} onChange={e => setTxForm(p => ({ ...p, date: e.target.value }))}/>
          </div>
        </div>
        <button style={{ ...C.btn(txForm.type === "entrada" ? "#10b981" : "#ef4444"), width: "100%", justifyContent: "center", padding: 14, fontSize: 15 }} onClick={addTx}>
          <Plus size={16}/> Adicionar {txForm.type === "entrada" ? "Entrada" : "Saída"}
        </button>
      </KeyboardAwareModal>

      {/* ══ MODAL: NOVO PARCELAMENTO ══ */}
      <KeyboardAwareModal show={showModal === "parcela"} onClose={() => setShowModal(null)} title="Novo Parcelamento">
        <div style={{ marginBottom: 14 }}>
          <label style={C.label}>Descrição</label>
          <FocusInput placeholder="Ex: TV Samsung 55''" value={pForm.desc} onChange={e => setPForm(p => ({ ...p, desc: e.target.value }))}/>
        </div>
        <div style={{ ...C.grid2, marginBottom: 14 }}>
          <div>
            <label style={C.label}>Valor da Parcela</label>
            <FocusInput type="number" inputMode="decimal" placeholder="R$ 0,00" value={pForm.valorParcela} onChange={e => setPForm(p => ({ ...p, valorParcela: e.target.value }))}/>
          </div>
          <div>
            <label style={C.label}>Nº de Parcelas</label>
            <FocusInput type="number" inputMode="numeric" placeholder="12" value={pForm.parcelas} onChange={e => setPForm(p => ({ ...p, parcelas: e.target.value }))}/>
          </div>
        </div>
        <div style={{ ...C.grid2, marginBottom: 14 }}>
          <div>
            <label style={C.label}>Tipo</label>
            <select style={C.select} value={pForm.tipo} onChange={e => setPForm(p => ({ ...p, tipo: e.target.value }))}>
              <option>cartão</option><option>crediário</option><option>financiamento</option>
            </select>
          </div>
          <div>
            <label style={C.label}>Mês de Início</label>
            <FocusInput type="month" value={pForm.inicio} onChange={e => setPForm(p => ({ ...p, inicio: e.target.value }))}/>
          </div>
        </div>
        {pForm.valorParcela && pForm.parcelas && (
          <div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 10, padding: 12, marginBottom: 14, fontSize: 13, color: "#fcd34d" }}>
            💳 Total do contrato: <strong>{fmt(parseFloat(pForm.valorParcela||0) * parseInt(pForm.parcelas||0))}</strong>
          </div>
        )}
        <button style={{ ...C.btn("#f59e0b"), width: "100%", justifyContent: "center", padding: 14, fontSize: 15 }} onClick={addParcela}>
          <CreditCard size={16}/> Adicionar Parcelamento
        </button>
      </KeyboardAwareModal>

      {/* ══ MODAL: COMPARTILHAR / FAMÍLIA ══ */}
      <KeyboardAwareModal show={showModal === "share"} onClose={() => setShowModal(null)} title="👨‍👩‍👧 Compartilhar com Família">
        {shareStep === "menu" && <>
          <p style={{ fontSize: 13, color: "#9ca3af", marginBottom: 16, lineHeight: 1.6 }}>Escolha como quer compartilhar seus dados financeiros com a família:</p>
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 11, color: "#6b7280", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10 }}>📤 Enviar meus dados</div>
            <button style={{ ...C.btn("#25d366"), width: "100%", justifyContent: "center", padding: 13, fontSize: 14, marginBottom: 8 }} onClick={shareWhatsApp}><Share2 size={15}/>📲 Enviar pelo WhatsApp</button>
            {navigator.share && (
              <button style={{ ...C.btn("#25d366", true), width: "100%", justifyContent: "center", padding: 11, fontSize: 13, marginBottom: 8 }} onClick={shareNative}><Share2 size={14}/> Outros apps (e-mail, Telegram…)</button>
            )}
            <div style={{ display: "flex", gap: 8 }}>
              <button style={{ ...C.btn("#00d4aa", true), flex: 1, justifyContent: "center" }} onClick={() => { copyCode(); setShareStep("exportCode"); }}><Copy size={14}/> Ver e Copiar Código</button>
              <button style={{ ...C.btn("#6366f1", true), flex: 1, justifyContent: "center" }} onClick={downloadJSON}><Download size={14}/> Baixar Arquivo</button>
            </div>
          </div>
          <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "16px 0" }}/>
          <div>
            <div style={{ fontSize: 11, color: "#6b7280", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10 }}>📥 Receber dados da família</div>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={{ ...C.btn("#f59e0b", true), flex: 1, justifyContent: "center" }} onClick={() => setShareStep("importCode")}><Copy size={14}/> Colar Código</button>
              <label style={{ ...C.btn("#6366f1", true), flex: 1, justifyContent: "center", cursor: "pointer" }}>
                <Upload size={14}/> Abrir Arquivo
                <input type="file" accept=".json" style={{ display: "none" }} onChange={(e) => { importFromFile(e); setShareStep("importCode"); }}/>
              </label>
            </div>
          </div>
          <div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 10, padding: 12, fontSize: 12, color: "#fcd34d", marginTop: 16 }}>
            ⚠️ <strong>Atenção:</strong> Ao importar, os dados deste aparelho serão substituídos pelos dados recebidos.
          </div>
        </>}

        {shareStep === "exportCode" && <>
          <button onClick={() => setShareStep("menu")} style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer", fontSize: 13, marginBottom: 14, padding: 0, display: "flex", alignItems: "center", gap: 4 }}>← Voltar</button>
          <p style={{ fontSize: 13, color: "#9ca3af", marginBottom: 12, lineHeight: 1.6 }}>Envie esse código para um familiar. Eles devem colar em <strong style={{ color: "#e2e8f0" }}>Família → Colar Código → Importar</strong>.</p>
          <textarea readOnly value={getExportCode()} style={{ ...C.input, minHeight: 100, fontSize: 11, fontFamily: "monospace", color: "#00d4aa", background: "rgba(0,212,170,0.05)", border: "1px solid rgba(0,212,170,0.2)" }} onFocus={e => e.target.select()}/>
          <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
            <button style={{ ...C.btn("#00d4aa"), flex: 1, justifyContent: "center", padding: 13 }} onClick={copyCode}>
              {copied ? <><CheckCheck size={15}/>Copiado!</> : <><Copy size={15}/>Copiar código</>}
            </button>
            <button style={{ ...C.btn("#25d366", true), flex: 1, justifyContent: "center", padding: 13 }} onClick={shareNative}><Share2 size={15}/> Enviar</button>
          </div>
          {copied && <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 10, background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", fontSize: 13, color: "#10b981", textAlign: "center" }}>✅ Código copiado! Agora envie para o familiar pelo WhatsApp, e-mail ou outro app.</div>}
        </>}

        {shareStep === "importCode" && <>
          <button onClick={() => { setShareStep("menu"); setImportText(""); setImportMsg(""); }} style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer", fontSize: 13, marginBottom: 14, padding: 0, display: "flex", alignItems: "center", gap: 4 }}>← Voltar</button>
          <p style={{ fontSize: 13, color: "#9ca3af", marginBottom: 12, lineHeight: 1.6 }}>Cole o código que você recebeu pelo WhatsApp ou outro app:</p>
          <textarea style={{ ...C.input, minHeight: 120, fontSize: 13, marginBottom: 10, fontFamily: "monospace" }} placeholder="Cole aqui o código recebido..." value={importText} onChange={e => setImportText(e.target.value)} onFocus={e => e.target.scrollIntoView({ behavior: "smooth", block: "nearest" })}/>
          {importMsg && <div style={{ padding: "10px 14px", borderRadius: 10, background: importMsg.includes("✅") ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", color: importMsg.includes("✅") ? "#10b981" : "#ef4444", fontSize: 13, fontWeight: 600, marginBottom: 10 }}>{importMsg}</div>}
          <button style={{ ...C.btn("#6366f1"), width: "100%", justifyContent: "center", padding: 13, fontSize: 14, opacity: importText ? "1" : "0.5" }} onClick={importData} disabled={!importText}>
            <Upload size={15}/> Importar dados
          </button>
        </>}
      </KeyboardAwareModal>
    </div>
  );
}
