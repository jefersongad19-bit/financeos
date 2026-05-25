import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, TrendingDown, Plus, CreditCard, Trash2, Bell, X, Check, Zap, Home, List, Layers, Activity, Share2, Download, Upload, Users, Copy, CheckCheck, Filter, Search, ArrowUpCircle, ArrowDownCircle } from "lucide-react";

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
                ];
                const CATS = {
                  entrada: ["Renda","Freelance","Investimento","Presente","Outros"],
                    saida: ["Moradia","Alimentação","Transporte","Saúde","Lazer","Educação","Vestuário","Serviços","Outros"],
                    };
                    const CAT_COLORS = { Moradia:"#6366f1",Alimentação:"#f59e0b",Transporte:"#3b82f6",Saúde:"#10b981",Lazer:"#ec4899",Educação:"#8b5cf6",Vestuário:"#14b8a6",Serviços:"#f97316",Outros:"#6b7280",Renda:"#00d4aa",Freelance:"#34d399",Investimento:"#a3e635",Presente:"#fb923c" };
                    const MONTHS_PT = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
                    const MONTHS_FULL = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
                    const fmt = (v) => Number(v).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});

                    function loadLS(key,fallback){try{const v=localStorage.getItem(key);return v?JSON.parse(v):fallback;}catch{return fallback;}}
                    function saveLS(key,value){try{localStorage.setItem(key,JSON.stringify(value));}catch{}}

                    const CustomTooltip=({active,payload,label})=>{
                      if(!active||!payload?.length)return null;
                        return(<div style={{background:"#111827",border:"1px solid #1f2937",borderRadius:10,padding:"10px 14px",fontSize:12}}><p style={{color:"#9ca3af",marginBottom:4}}>{label}</p>{payload.map((p,i)=><p key={i} style={{color:p.color||"#00d4aa",fontWeight:600}}>{p.name}: {fmt(p.value)}</p>)}</div>);
                        };