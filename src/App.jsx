import React, { useState, useEffect, useRef } from "react";

// ── Tokens ───────────────────────────────────────────────────────
const T = {
  bg: "#FAFAF7", card: "#FFFFFF", soft: "#F4F3EE",
  border: "#E8E6DF",
  text: "#1A1914", mid: "#6B6860", muted: "#A8A69E",
  accent: "#C8923A", accentBg: "#FDF3E3", accentSoft: "#F5E6C8",
  sage: "#5C7A6E", sageBg: "#EBF2EF", sageSoft: "#D4E8E2",
  rose: "#B85C6E", roseBg: "#F8EAED",
  violet: "#7A5FA0", violetBg: "#F0EAFA",
  green: "#4A8C5C", greenBg: "#EBF5EE",
  blue: "#4A72A0", blueBg: "#EBF0F8",
  gold: "#E8B84B", goldBg: "#FEF9EC", goldSoft: "#FDEFC3",
};

const LEVELS = [
  { min: 0,    label: "Apprenti·e",   color: T.muted   },
  { min: 200,  label: "Pratiquant·e", color: T.green   },
  { min: 500,  label: "Confirmé·e",   color: T.accent  },
  { min: 1000, label: "Expert·e",     color: T.rose    },
  { min: 2000, label: "Inspiré·e",    color: T.violet  },
];

const BADGES = [
  { id: "b1", icon: "✦",  label: "Premier pas",  desc: "1er succès",          check: (s,t,k) => s >= 1  },
  { id: "b2", icon: "⚡",  label: "Lancé·e",      desc: "5 succès",            check: (s,t,k) => s >= 5  },
  { id: "b3", icon: "◎",  label: "Alchimiste",    desc: "1ère transformation", check: (s,t,k) => t >= 1  },
  { id: "b4", icon: "✧",  label: "Régularité",    desc: "10 succès",           check: (s,t,k) => s >= 10 },
  { id: "b5", icon: "★",  label: "Inspiré·e",     desc: "20 succès",           check: (s,t,k) => s >= 20 },
  { id: "b6", icon: "◉",  label: "Résilient·e",   desc: "5 transformations",   check: (s,t,k) => t >= 5  },
  { id: "b7", icon: "🔥", label: "7 jours",        desc: "7 jours d'affilée",   check: (s,t,k) => k >= 7  },
  { id: "b8", icon: "💫", label: "Invaincu·e",     desc: "30 jours d'affilée",  check: (s,t,k) => k >= 30 },
];

const REACTIONS = [
  { id: "strength", emoji: "🌱", label: "Force"     },
  { id: "spark",    emoji: "⚡", label: "Inspirant" },
  { id: "heart",    emoji: "🤍", label: "Avec toi"  },
];


const CATEGORIES = [
  { id: "travail",    label: "Travail",    emoji: "◈", color: "#C8923A", bg: "#FDF3E3" },
  { id: "sport",      label: "Sport",      emoji: "◎", color: "#4A8C5C", bg: "#EBF5EE" },
  { id: "amour",      label: "Amour",      emoji: "◉", color: "#B85C6E", bg: "#F8EAED" },
  { id: "amitie",     label: "Amitié",     emoji: "◆", color: "#7A5FA0", bg: "#F0EAFA" },
  { id: "famille",    label: "Famille",    emoji: "◇", color: "#4A72A0", bg: "#EBF0F8" },
  { id: "bienetre",   label: "Bien-être",  emoji: "✦", color: "#5C7A6E", bg: "#EBF2EF" },
  { id: "creativite", label: "Créativité", emoji: "✧", color: "#A06B3A", bg: "#FBF0E6" },
  { id: "finances",   label: "Finances",   emoji: "★", color: "#6B7A3A", bg: "#F2F5E6" },
];


const QUOTES = [
  { text: "Ce n'est pas ce qui nous arrive qui nous définit, mais ce que nous en faisons.", author: "Épictète" },
  { text: "Le secret du changement, c'est de concentrer toute son énergie non pas à lutter contre le passé, mais à construire l'avenir.", author: "Socrate" },
  { text: "La vie n'est pas d'attendre que les orages passent, c'est d'apprendre à danser sous la pluie.", author: "Sénèque" },
  { text: "Tu as le pouvoir sur ton esprit, pas sur les événements extérieurs. Réalise-le et tu trouveras la force.", author: "Marc Aurèle" },
  { text: "Chaque matin nous naissons à nouveau. Ce que nous faisons aujourd'hui est ce qui compte le plus.", author: "Bouddha" },
  { text: "La douleur est inévitable, la souffrance est optionnelle.", author: "Viktor Frankl" },
  { text: "Fais de ta vie un rêve, et d'un rêve, une réalité.", author: "Antoine de Saint-Exupéry" },
];

const PROMPTS = [
  "Qu'est-ce qui s'est bien passé aujourd'hui, même une toute petite chose ?",
  "Quelle décision courageuse as-tu prise récemment ?",
  "Qui as-tu aidé cette semaine, même de façon anodine ?",
  "Quel obstacle as-tu surmonté qui te semblait difficile ?",
  "Qu'as-tu appris sur toi-même dernièrement ?",
  "Quel moment t'a rendu·e fier·e cette semaine ?",
];

const OB_SLIDES = [
  {
    icon: "✦",
    title: "Bienvenue sur Winn.",
    sub: "L'espace où chaque action devient une victoire,\net chaque épreuve, une leçon.",
    color: "#C8923A",
  },
  {
    icon: "⭐",
    title: "Une étoile par jour",
    sub: "Ajoute au moins une entrée chaque jour\npour maintenir ta série et grandir\nà ton propre rythme.",
    color: "#E8B84B",
  },
  {
    icon: "◎",
    title: "Transforme l'adversité",
    sub: "Notre IA philosophique t'aide à trouver\nle sens caché dans les moments difficiles.",
    color: "#5C7A6E",
  },
  {
    icon: "◉",
    title: "Ton cercle de confiance",
    sub: "Partage ce que tu souhaites avec\nles personnes qui comptent pour toi.\nEnsemble, on avance mieux.",
    color: "#7A5FA0",
  },
];

const DEMO_FEED = [
  { id: "f1", author: "Marie L.", avatar: "ML", color: T.rose, level: "Confirmée",
    type: "success", text: "J'ai terminé ma formation après 3 mois d'effort continu. Je ne pensais pas tenir.", date: "Aujourd'hui",
    reactions: { strength: 4, spark: 7, heart: 2 }, comments: [{ a: "Thomas R.", t: "Bravo, quel parcours !", time: "2h" }] },
  { id: "f2", author: "Thomas R.", avatar: "TR", color: T.blue, level: "Pratiquant",
    type: "transform", original: "J'ai raté une présentation importante devant toute l'équipe.",
    text: "Cet échec m'a montré que je plaçais ma valeur dans le regard des autres. Maintenant je travaille pour moi.", date: "Hier",
    reactions: { strength: 9, spark: 3, heart: 11 }, comments: [] },
  { id: "f3", author: "Léa M.", avatar: "LM", color: T.violet, level: "Expert·e",
    type: "success", text: "Premier 10 km sans m'arrêter. Six mois de travail pour 52 minutes de liberté.", date: "Il y a 2j",
    reactions: { strength: 12, spark: 5, heart: 3 }, comments: [{ a: "Marie L.", t: "🌱 Tu es une source d'inspiration", time: "1j" }] },
];


const DEMO_FOLLOWERS = [
  { id: "u2", name: "Marie L.",  avatar: "ML", color: T.rose,   level: "Confirmée",  status: "accepted" },
  { id: "u3", name: "Thomas R.", avatar: "TR", color: T.blue,   level: "Pratiquant", status: "accepted" },
];

const DEMO_REQUESTS = [
  { id: "u5", name: "Sam K.", avatar: "SK", color: T.green, message: "Je traverse une période difficile et je cherche de l'inspiration." },
];

const INVITE_CODE = 'winn-' + Math.random().toString(36).slice(2,8);

// ── Level helpers ────────────────────────────────────────────────
function getLevel(xp) {
  let lv = LEVELS[0];
  for (const l of LEVELS) if (xp >= l.min) lv = l;
  return lv;
}
function getNext(xp) {
  for (const l of LEVELS) if (xp < l.min) return l;
  return null;
}

// ── Streak helpers ───────────────────────────────────────────────
function toDayStr(ts) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth()).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
function todayStr()     { return toDayStr(Date.now()); }
function yesterdayStr() { return toDayStr(Date.now() - 864e5); }

function computeStreak(entries) {
  if (!entries.length) return 0;
  const days = [...new Set(entries.map(e => toDayStr(e.id)))].sort().reverse();
  // streak must include today or yesterday to be "alive"
  if (days[0] !== todayStr() && days[0] !== yesterdayStr()) return 0;
  let streak = 1;
  for (let i = 1; i < days.length; i++) {
    const a = new Date(days[i - 1]);
    const b = new Date(days[i]);
    const diff = Math.round((a - b) / 864e5);
    if (diff === 1) streak++;
    else break;
  }
  return streak;
}

function hasEntryToday(entries) {
  return entries.some(e => toDayStr(e.id) === todayStr());
}

// ── Week stars (last 7 days) ─────────────────────────────────────
function getWeekStars(entries) {
  const stars = [];
  for (let i = 6; i >= 0; i--) {
    const day = toDayStr(Date.now() - i * 864e5);
    const date = new Date(Date.now() - i * 864e5);
    const label = date.toLocaleDateString("fr-FR", { weekday: "short" }).slice(0, 2);
    const done  = entries.some(e => toDayStr(e.id) === day);
    const today = day === todayStr();
    stars.push({ day, label, done, today });
  }
  return stars;
}

// ── Tiny UI ──────────────────────────────────────────────────────
function Confetti({ trigger, colors }) {
  const [dots, setDots] = useState([]);
  useEffect(() => {
    if (!trigger) return;
    const palette = colors || [T.accent, T.green, T.rose, T.violet, T.blue];
    const d = Array.from({ length: 22 }, (_, i) => ({
      id: Date.now() + i, x: 20 + Math.random() * 60,
      color: palette[i % palette.length],
      size: 5 + Math.random() * 7, dx: (Math.random() - .5) * 160,
      dy: -(70 + Math.random() * 130), rot: Math.random() * 360, round: Math.random() > .4,
    }));
    setDots(d);
    setTimeout(() => setDots([]), 1400);
  }, [trigger]);
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 999 }}>
      {dots.map(d => (
        <div key={d.id} style={{
          position: "absolute", left: `${d.x}%`, top: "35%",
          width: d.size, height: d.size, background: d.color,
          borderRadius: d.round ? "50%" : "2px",
          animation: "burst 1.4s ease-out forwards",
          "--dx": `${d.dx}px`, "--dy": `${d.dy}px`, "--rot": `${d.rot}deg`,
        }} />
      ))}
    </div>
  );
}

function Toast({ msg, on }) {
  return (
    <div style={{
      position: "fixed", bottom: 88, left: "50%",
      transform: `translateX(-50%) translateY(${on ? 0 : 14}px)`,
      background: T.text, color: "#fff", padding: "10px 20px", borderRadius: 40,
      fontFamily: "'DM Sans',sans-serif", fontSize: 13,
      transition: "all .3s cubic-bezier(.34,1.4,.64,1)",
      opacity: on ? 1 : 0, zIndex: 1000, pointerEvents: "none",
      boxShadow: "0 4px 20px rgba(0,0,0,.13)", whiteSpace: "nowrap",
    }}>{msg}</div>
  );
}

function Toggle({ on, onChange, label }) {
  return (
    <button onClick={() => onChange(!on)} style={{
      display: "flex", alignItems: "center", gap: 8,
      background: "none", border: "none", cursor: "pointer",
      fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: T.mid, padding: 0,
    }}>
      <div style={{ width: 38, height: 21, borderRadius: 11, background: on ? T.text : T.border, position: "relative", transition: "background .22s", flexShrink: 0 }}>
        <div style={{ position: "absolute", top: 2.5, left: on ? 19 : 2.5, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left .22s", boxShadow: "0 1px 4px rgba(0,0,0,.18)" }} />
      </div>
      <span>{label}</span>
    </button>
  );
}

// ── Star component ───────────────────────────────────────────────
function StarDay({ label, done, today, celebrate }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
      <div style={{
        width: today ? 42 : 34, height: today ? 42 : 34, borderRadius: "50%",
        background: done ? `radial-gradient(circle at 35% 35%, #FFE87A, ${T.gold})` : today ? T.goldBg : T.soft,
        border: `${today ? 2 : 1.5}px solid ${done ? T.gold : today ? T.goldSoft : T.border}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: done ? (today ? 22 : 17) : 12,
        transition: "all .4s cubic-bezier(.34,1.4,.64,1)",
        boxShadow: done && today
          ? `0 0 0 4px ${T.goldSoft}, 0 4px 20px ${T.gold}70`
          : done ? `0 2px 12px ${T.gold}60` : "none",
        animation: celebrate && today ? "starBurst .6s cubic-bezier(.34,1.6,.64,1)" : "none",
      }}>
        {done
          ? <span style={{ filter: today ? "drop-shadow(0 0 4px #FFD700)" : "none" }}>⭐</span>
          : <span style={{ color: today ? T.goldSoft : T.muted, fontSize: 10 }}>{today ? "☆" : "·"}</span>
        }
      </div>
      <span style={{ fontSize: 9, color: today ? T.accent : T.muted, fontWeight: today ? 700 : 400, textTransform: "uppercase", letterSpacing: ".04em" }}>
        {label}
      </span>
    </div>
  );
}

// ── Entry card ───────────────────────────────────────────────────
function EntryCard({ e, onToggle, showToggle, fresh }) {
  const isT = e.type === "transform";
  const cat  = CATEGORIES.find(c => c.id === e.cat);
  const color = isT ? T.sage : (cat?.color || T.accent);
  const bg    = isT ? T.sageBg : (cat?.bg || T.accentBg);
  return (
    <div style={{
      background: T.card, border: `1px solid ${T.border}`, borderRadius: 18,
      padding: "15px 17px", animation: fresh ? "slideUp .4s cubic-bezier(.34,1.3,.64,1)" : "none",
    }}>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 13, color, fontWeight: 700 }}>
          {isT ? "◎" : (CATEGORIES.find(c => c.id === e.cat)?.emoji || "✦")}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          {isT && e.original && (
            <div style={{ fontSize: 11, color: T.muted, fontStyle: "italic", borderLeft: `2px solid ${T.border}`, paddingLeft: 8, marginBottom: 5, lineHeight: 1.4 }}>
              "{e.original.length > 70 ? e.original.slice(0, 70) + "…" : e.original}"
            </div>
          )}
          <div style={{ fontSize: 14, fontWeight: 500, color: T.text, lineHeight: 1.55 }}>{e.text}</div>
          <div style={{ display: "flex", gap: 7, marginTop: 7, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, color: T.muted }}>{e.date}</span>
            <span style={{ fontSize: 10, fontWeight: 600, color, background: bg, padding: "2px 7px", borderRadius: 20 }}>+{e.xp} XP</span>
            {showToggle && (
              <button onClick={() => onToggle(e.id)} style={{
                fontSize: 10, padding: "2px 8px", borderRadius: 20, cursor: "pointer",
                fontFamily: "'DM Sans',sans-serif", border: `1px solid ${e.isPublic ? T.text : T.border}`,
                background: e.isPublic ? T.text : "transparent", color: e.isPublic ? "#fff" : T.muted,
                transition: "all .18s",
              }}>{e.isPublic ? "● Public" : "○ Privé"}</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Feed card ────────────────────────────────────────────────────
function FeedCard({ item, onReact, onComment }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const isT = item.type === "transform";
  const color = isT ? T.sage : T.accent;
  const bg    = isT ? T.sageBg : T.accentBg;

  return (
    <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 20, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "14px 17px 10px" }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: item.color + "18", border: `1.5px solid ${item.color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: item.color, flexShrink: 0 }}>
          {item.avatar}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{item.author}</div>
          <div style={{ fontSize: 11, color: T.muted }}>{item.level} · {item.date}</div>
        </div>
        <span style={{ fontSize: 9, fontWeight: 700, color, background: bg, padding: "3px 9px", borderRadius: 20, letterSpacing: ".04em" }}>
          {isT ? "TRANSFORMÉ" : "SUCCÈS"}
        </span>
      </div>
      <div style={{ padding: "0 17px 14px" }}>
        {isT && item.original && (
          <div style={{ fontSize: 12, color: T.muted, fontStyle: "italic", borderLeft: `2px solid ${T.border}`, paddingLeft: 10, marginBottom: 8, lineHeight: 1.5 }}>
            "{item.original.length > 65 ? item.original.slice(0, 65) + "…" : item.original}"
          </div>
        )}
        <div style={{ fontSize: 14, color: T.text, lineHeight: 1.6 }}>{item.text}</div>
      </div>
      <div style={{ borderTop: `1px solid ${T.border}`, padding: "10px 17px", display: "flex", gap: 6, alignItems: "center" }}>
        {REACTIONS.map(r => (
          <button key={r.id} onClick={() => onReact(item.id, r.id)} style={{
            display: "flex", alignItems: "center", gap: 5,
            background: T.soft, border: `1px solid ${T.border}`, borderRadius: 20,
            padding: "5px 10px", cursor: "pointer",
            fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: T.mid, transition: "all .15s",
          }}
            onMouseEnter={e => { e.currentTarget.style.background = T.accentBg; e.currentTarget.style.borderColor = T.accent; }}
            onMouseLeave={e => { e.currentTarget.style.background = T.soft; e.currentTarget.style.borderColor = T.border; }}
          >
            <span>{r.emoji}</span>
            <span style={{ fontWeight: 600 }}>{item.reactions[r.id]}</span>
          </button>
        ))}
        <button onClick={() => setOpen(v => !v)} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", fontSize: 12, color: T.muted, fontFamily: "'DM Sans',sans-serif", display: "flex", alignItems: "center", gap: 4 }}>
          💬 {item.comments.length}
        </button>
      </div>
      {open && (
        <div style={{ borderTop: `1px solid ${T.border}`, padding: "12px 17px" }}>
          {item.comments.length === 0 && <div style={{ fontSize: 12, color: T.muted, fontStyle: "italic", marginBottom: 10 }}>Sois le·la premier·e à réagir.</div>}
          {item.comments.map((c, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{c.a}</span>
                <span style={{ fontSize: 10, color: T.muted }}>{c.time}</span>
              </div>
              <div style={{ fontSize: 13, color: T.mid, lineHeight: 1.5 }}>{c.t}</div>
            </div>
          ))}
          <div style={{ display: "flex", gap: 7, marginTop: 10 }}>
            <input value={input} onChange={e => setInput(e.target.value)}
              placeholder="Un mot d'encouragement…"
              onKeyDown={e => { if (e.key === "Enter" && input.trim()) { onComment(item.id, input.trim()); setInput(""); }}}
              style={{ flex: 1, background: T.soft, border: `1px solid ${T.border}`, borderRadius: 20, padding: "8px 14px", fontSize: 13, fontFamily: "'DM Sans',sans-serif", color: T.text, outline: "none" }} />
            <button onClick={() => { if (input.trim()) { onComment(item.id, input.trim()); setInput(""); }}} style={{ background: T.text, color: "#fff", border: "none", borderRadius: 20, padding: "8px 14px", fontSize: 12, fontFamily: "'DM Sans',sans-serif", cursor: "pointer", fontWeight: 600 }}>→</button>
          </div>
        </div>
      )}
    </div>
  );
}


// ── Onboarding ───────────────────────────────────────────────────
function Onboarding({ onDone }) {
  const [step, setStep] = useState(0);
  const slide = OB_SLIDES[step];
  const isLast = step === OB_SLIDES.length - 1;

  return (
    <div style={{
      position: "fixed", inset: 0, background: T.bg,
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "space-between", padding: "60px 32px 50px",
      fontFamily: "'DM Sans',sans-serif", zIndex: 2000,
    }}>
      {/* Skip */}
      <button onClick={onDone} style={{ alignSelf: "flex-end", background: "none", border: "none", cursor: "pointer", fontSize: 13, color: T.muted }}>
        Passer
      </button>

      {/* Slide */}
      <div style={{ textAlign: "center", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{
          width: 100, height: 100, borderRadius: "50%",
          background: slide.color + "18", border: `2px solid ${slide.color}30`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 44, marginBottom: 36,
          boxShadow: `0 8px 32px ${slide.color}25`,
          animation: "fadeIn .4s ease",
          key: step,
        }}>
          {slide.icon}
        </div>
        <div style={{
          fontFamily: "'DM Serif Display',serif", fontSize: 26, color: T.text,
          marginBottom: 16, lineHeight: 1.25, animation: "fadeIn .4s ease",
        }}>
          {slide.title}
        </div>
        <div style={{
          fontSize: 15, color: T.mid, lineHeight: 1.75, textAlign: "center",
          maxWidth: 300, animation: "fadeIn .4s ease", whiteSpace: "pre-line",
        }}>
          {slide.sub}
        </div>
      </div>

      {/* Bottom */}
      <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
        {/* Dots */}
        <div style={{ display: "flex", gap: 7 }}>
          {OB_SLIDES.map((_, i) => (
            <div key={i} style={{
              width: i === step ? 20 : 7, height: 7, borderRadius: 4,
              background: i === step ? slide.color : T.border,
              transition: "all .3s",
            }} />
          ))}
        </div>

        <button onClick={() => isLast ? onDone() : setStep(s => s + 1)} style={{
          width: "100%", padding: "16px",
          background: slide.color, color: "#fff",
          border: "none", borderRadius: 40,
          fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 16,
          cursor: "pointer", transition: "all .2s",
          boxShadow: `0 4px 20px ${slide.color}50`,
        }}>
          {isLast ? "Commencer ✦" : "Suivant →"}
        </button>
      </div>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────
export default function App() {
  const load = (k, fb) => { try { return JSON.parse(localStorage.getItem(k) || "null") ?? fb; } catch { return fb; } };

  const [onboarded, setOnboarded] = useState(() => load('w8_on', false));
  const [obStep,    setObStep]    = useState(0);
  const [entries,  setEntries]  = useState(() => load("w5_e", []));
  const [xp,       setXp]       = useState(() => load("w5_xp", 0));
  const [badges,   setBadges]   = useState(() => load("w5_b", []));
  const [feed,     setFeed]     = useState(DEMO_FEED);
  const [tab,      setTab]      = useState("home");
  const [addMode,  setAddMode]  = useState("success");
  const [confetti, setConfetti] = useState(0);
  const [confettiColors, setConfettiColors] = useState(null);
  const [toast,    setToast]    = useState({ msg: "", on: false });
  const [freshId,    setFreshId]    = useState(null);
  const [starCelebrate, setStarCelebrate] = useState(false);

  // Add form
  const [text,     setText]     = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [selCat,   setSelCat]   = useState('travail');
  const [rfCat,    setRfCat]    = useState('esprit');

  // Transform flow
  const [rfStep,   setRfStep]   = useState(0);
  const [rfInput,  setRfInput]  = useState("");
  const [rfAngles, setRfAngles] = useState([]);
  const [rfChosen, setRfChosen] = useState(null);
  const [rfEdit,   setRfEdit]   = useState("");
  const [rfPub,    setRfPub]    = useState(false);

  // Profile
  const [profile,    setProfile]    = useState(() => { try { return JSON.parse(localStorage.getItem('w6_profile') || 'null'); } catch { return null; } });
  const [followers,  setFollowers]  = useState(DEMO_FOLLOWERS);
  const [requests,   setRequests]   = useState(DEMO_REQUESTS);
  const [showInvite, setShowInvite] = useState(false);
  const [setupName,  setSetupName]  = useState('');
  const [setupBio,   setSetupBio]   = useState('');
  const [cercleSub,  setCercleSub]  = useState('feed'); // feed | profil | followers

  // History
  const [historyTab,   setHistoryTab]   = useState('all');   // all | success | transform
  const [historySearch, setHistorySearch] = useState('');
  const [historyCat,   setHistoryCat]   = useState('all');

  // Portrait IA
  const [portraitStep, setPortraitStep] = useState(0); // 0=idle 1=loading 2=done
  const [portrait,     setPortrait]     = useState(null);

  const textRef = useRef();
  const rfRef   = useRef();
  const editRef = useRef();

  useEffect(() => { localStorage.setItem('w8_on', JSON.stringify(onboarded)); }, [onboarded]);
  useEffect(() => { localStorage.setItem("w5_e",  JSON.stringify(entries)); }, [entries]);
  useEffect(() => { localStorage.setItem("w5_xp", JSON.stringify(xp));      }, [xp]);
  useEffect(() => { localStorage.setItem("w5_b",  JSON.stringify(badges));  }, [badges]);

  const toast_ = (msg) => {
    setToast({ msg, on: true });
    setTimeout(() => setToast(t => ({ ...t, on: false })), 2600);
  };

  const streak    = computeStreak(entries);
  const weekStars = getWeekStars(entries);
  const doneToday = hasEntryToday(entries);

  const checkBadges = (newE, curB) => {
    const sc = newE.filter(e => e.type === "success").length;
    const tc = newE.filter(e => e.type === "transform").length;
    const sk = computeStreak(newE);
    let msg = "", nb = [...curB];
    for (const b of BADGES) {
      if (nb.includes(b.id)) continue;
      if (b.check(sc, tc, sk)) { nb.push(b.id); msg = `${b.icon} Badge débloqué : ${b.label} !`; }
    }
    return { nb, msg };
  };

  const saveEntry = (entry) => {
    const newE  = [entry, ...entries];
    const newXp = xp + entry.xp;
    const wasFirstToday = !hasEntryToday(entries);
    const { nb, msg } = checkBadges(newE, badges);
    setEntries(newE); setXp(newXp); setBadges(nb);
    setFreshId(entry.id);

    // Special confetti for first entry of the day (star earned)
    if (wasFirstToday) {
      setConfettiColors([T.gold, "#F5C842", T.accent, "#FDEFC3", "#fff"]);
      setStarCelebrate(true);
      setTimeout(() => setStarCelebrate(false), 2200);
      toast_("⭐ Étoile du jour gagnée !");
    } else {
      setConfettiColors(null);
      toast_(msg || `+${entry.xp} XP · Enregistré ✦`);
    }
    setConfetti(n => n + 1);
    setTimeout(() => setFreshId(null), 700);
    if (msg && wasFirstToday) setTimeout(() => toast_(msg), 2800);
  };

  const addSuccess = () => {
    if (!text.trim()) return;
    saveEntry({ id: Date.now(), type: "success", text: text.trim(), cat: selCat, isPublic, xp: 40, date: new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }) });
    setText(""); setIsPublic(false); setSelCat('travail'); setTab("home");
  };

  const callAI = async () => {
    if (!rfInput.trim()) return;
    setRfStep(1);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 1000,
          messages: [{ role: "user", content: `Tu es un guide philosophique bienveillant, inspiré par le stoïcisme, Viktor Frankl et Jung.

Quelqu'un te confie : "${rfInput}"

Propose 3 angles de transformation (2-3 phrases chacun) : force intérieure, sagesse, opportunité.
Réponds UNIQUEMENT en JSON valide sans backticks :
{"angles":[{"titre":"...","texte":"..."},{"titre":"...","texte":"..."},{"titre":"...","texte":"..."}]}` }],
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      const parsed = JSON.parse(data.content.map(b => b.text || "").join("").replace(/```json|```/g, "").trim());
      setRfAngles(parsed.angles); setRfStep(2);
    } catch (err) {
      console.error(err); setRfStep(0); toast_("Erreur · Réessaie dans un instant");
    }
  };

  const saveTransform = () => {
    if (!rfEdit.trim()) return;
    saveEntry({ id: Date.now(), type: "transform", original: rfInput, text: rfEdit.trim(), cat: rfCat, isPublic: rfPub, xp: 60, date: new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }) });
    setRfInput(""); setRfAngles([]); setRfChosen(null); setRfEdit(""); setRfStep(0); setRfPub(false); setRfCat('esprit');
    setAddMode("success"); setTab("home");
  };

  const acceptRequest = (req) => {
    setFollowers(prev => [...prev, { ...req, status: 'accepted' }]);
    setRequests(prev => prev.filter(r => r.id !== req.id));
    toast_(`${req.name} rejoint ton cercle ◉`);
  };
  const declineRequest = (id) => setRequests(prev => prev.filter(r => r.id !== id));
  const createProfile = () => {
    if (!setupName.trim()) return;
    const initials = setupName.trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2);
    setProfile({ name: setupName.trim(), bio: setupBio.trim(), avatar: initials });
    toast_('Profil créé ✦');
    setCercleSub('profil');
  };

  const callPortrait = async () => {
    if (entries.length < 3) { toast_('Ajoute au moins 3 entrées pour générer ton portrait'); return; }
    setPortraitStep(1);
    try {
      const sample = entries.slice(0, 20).map(e =>
        `[${e.type === 'transform' ? 'Transformation' : 'Succès'} · ${e.cat || ''}] ${e.type === 'transform' ? '(Épreuve: ' + (e.original || '') + ') → ' : ''}${e.text}`
      ).join('\n');
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514', max_tokens: 1200,
          messages: [{ role: 'user', content: `Tu es un psychologue humaniste bienveillant. Analyse ces entrées de journal de développement personnel et crée un portrait de croissance court et profond.

Entrées :
${sample}

Réponds UNIQUEMENT en JSON valide sans backticks :
{
  "titre": "Un titre poétique et personnel (5-7 mots)",
  "resume": "2-3 phrases qui résument la personnalité et la trajectoire de cette personne, écrites à la deuxième personne (tu/vous). Chaleureux et précis.",
  "forces": ["Force 1 (5-7 mots)", "Force 2", "Force 3"],
  "pattern": "Une observation subtile sur la façon dont cette personne avance dans la vie (1-2 phrases)",
  "invitation": "Une question ou invitation philosophique personnalisée pour continuer à grandir (1 phrase)"
}` }],
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      const parsed = JSON.parse(data.content.map(b => b.text || '').join('').replace(/\`\`\`json|\`\`\`/g, '').trim());
      setPortrait(parsed);
      setPortraitStep(2);
    } catch(err) {
      console.error(err);
      setPortraitStep(0);
      toast_('Erreur · Réessaie dans un instant');
    }
  };

  const react   = (id, rid) => { setFeed(f => f.map(i => i.id !== id ? i : { ...i, reactions: { ...i.reactions, [rid]: i.reactions[rid] + 1 } })); toast_("Réaction envoyée"); };
  const comment = (id, txt) => { setFeed(f => f.map(i => i.id !== id ? i : { ...i, comments: [...i.comments, { a: "Moi", t: txt, time: "À l'instant" }] })); };

  const level = getLevel(xp);
  const todayQuote  = QUOTES[new Date().getDate() % QUOTES.length];
  const todayPrompt = PROMPTS[new Date().getDate() % PROMPTS.length];
  const next  = getNext(xp);
  const pct   = next ? ((xp - level.min) / (next.min - level.min)) * 100 : 100;
  // Weekly summary
  const thisWeekEntries = entries.filter(e => new Date(e.id) > new Date(Date.now() - 7*864e5));
  const lastWeekEntries = entries.filter(e => {
    const d = new Date(e.id);
    return d > new Date(Date.now() - 14*864e5) && d <= new Date(Date.now() - 7*864e5);
  });
  const weekXp = thisWeekEntries.reduce((a,e) => a+e.xp, 0);
  const weekStarCount = [...new Set(thisWeekEntries.map(e => toDayStr(e.id)))].length;
  const topCatId = (() => {
    const counts = {};
    thisWeekEntries.forEach(e => { if(e.cat) counts[e.cat] = (counts[e.cat]||0)+1; });
    return Object.entries(counts).sort((a,b)=>b[1]-a[1])[0]?.[0];
  })();
  const topCat = CATEGORIES.find(c => c.id === topCatId);

  const successCount  = entries.filter(e => e.type === "success").length;
  const transformCount = entries.filter(e => e.type === "transform").length;

  if (!onboarded) return <Onboarding onDone={() => setOnboarded(true)} />;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{background:${T.bg};-webkit-font-smoothing:antialiased}
        @keyframes burst{0%{transform:translate(0,0) rotate(0) scale(1);opacity:1}100%{transform:translate(var(--dx),var(--dy)) rotate(var(--rot)) scale(.15);opacity:0}}
        @keyframes slideUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes starPop{0%{transform:scale(0);opacity:0}60%{transform:scale(1.3)}100%{transform:scale(1);opacity:1}}
        @keyframes starBurst{0%{transform:scale(1)}30%{transform:scale(1.5) rotate(-10deg)}60%{transform:scale(.9) rotate(5deg)}100%{transform:scale(1) rotate(0)}}
        @keyframes streakPulse{0%,100%{box-shadow:0 0 0 0 ${T.gold}60}50%{box-shadow:0 0 0 8px ${T.gold}00}}
        textarea,input[type=text]{width:100%;background:${T.soft};border:1.5px solid ${T.border};border-radius:14px;color:${T.text};font-family:'DM Sans',sans-serif;font-size:15px;line-height:1.65;padding:13px 15px;resize:none;outline:none;transition:border-color .2s,box-shadow .2s}
        textarea:focus,input[type=text]:focus{border-color:${T.accent};box-shadow:0 0 0 3px ${T.accentSoft};background:${T.card}}
        textarea::placeholder,input::placeholder{color:${T.muted}}
        .sage-focus:focus{border-color:${T.sage}!important;box-shadow:0 0 0 3px ${T.sageSoft}!important}
        .btn{border:none;border-radius:40px;font-family:'DM Sans',sans-serif;font-weight:600;font-size:15px;cursor:pointer;transition:all .2s;padding:15px}
        .btn-dark{background:${T.text};color:#fff}.btn-dark:hover{background:#2a2920;transform:translateY(-1px);box-shadow:0 4px 14px rgba(0,0,0,.14)}.btn-dark:disabled{opacity:.3;cursor:not-allowed;transform:none;box-shadow:none}
        .btn-sage{background:${T.sage};color:#fff}.btn-sage:hover{background:#4d6b5f;transform:translateY(-1px);box-shadow:0 4px 14px rgba(92,122,110,.3)}.btn-sage:disabled{opacity:.3;cursor:not-allowed;transform:none}
        .btn-outline{background:transparent;color:${T.mid};border:1.5px solid ${T.border}}.btn-outline:hover{border-color:${T.mid};color:${T.text}}
        .angle{background:${T.card};border:1.5px solid ${T.border};border-radius:16px;padding:18px;cursor:pointer;transition:all .2s;margin-bottom:10px}
        .angle:hover{border-color:${T.sage};background:${T.sageBg};transform:translateY(-2px);box-shadow:0 4px 14px rgba(92,122,110,.1)}
        .tab{flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;background:none;border:none;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:10px;letter-spacing:.02em;transition:color .2s;padding:10px 4px 0}
        ::-webkit-scrollbar{width:0}
      `}</style>

      <Confetti trigger={confetti} colors={confettiColors} />
      <Toast msg={toast.msg} on={toast.on} />

      <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'DM Sans',sans-serif", display: "flex", flexDirection: "column", alignItems: "center" }}>

        {/* ── Header ── */}
        <header style={{ width: "100%", maxWidth: 440, padding: "30px 22px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 26, color: T.text, letterSpacing: "-.5px" }}>
              Winn<span style={{ color: T.accent }}>.</span>
            </div>
            <div style={{ fontSize: 11, color: T.muted, marginTop: 1 }}>{level.label}</div>
          </div>
          {/* XP pill */}
          <div style={{ background: T.accentBg, border: `1px solid ${T.accentSoft}`, borderRadius: 40, padding: "8px 16px", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: T.text, lineHeight: 1 }}>{xp} <span style={{ fontSize: 10, color: T.muted }}>XP</span></div>
              {next && <div style={{ fontSize: 9, color: T.muted, marginTop: 2 }}>{next.min - xp} → {next.label}</div>}
            </div>
            <div style={{ width: 4, height: 32, background: T.accentSoft, borderRadius: 4, overflow: "hidden" }}>
              <div style={{ width: "100%", height: `${pct}%`, background: T.accent, borderRadius: 4, transition: "height .8s", marginTop: `${100 - pct}%` }} />
            </div>
          </div>
        </header>

        {/* ── Main ── */}
        <main style={{ width: "100%", maxWidth: 440, padding: "20px 22px 96px", flex: 1 }}>

          {/* ════ HOME ════ */}
          {tab === "home" && (
            <div style={{ animation: "fadeIn .3s ease" }}>

              {/* ── Streak card ── */}
              <div style={{
                background: streak > 0 ? `linear-gradient(135deg, ${T.goldBg}, #FFFDF5)` : T.card,
                border: `1px solid ${streak > 0 ? T.goldSoft : T.border}`,
                borderRadius: 22, padding: "20px 22px", marginBottom: 12,
              }}>
                {/* Top row */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 11, color: T.muted, letterSpacing: ".04em", textTransform: "uppercase", marginBottom: 3 }}>
                      Série en cours
                    </div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                      <span style={{
                        fontFamily: "'DM Serif Display',serif", fontSize: 40, lineHeight: 1,
                        color: streak > 0 ? T.gold : T.muted,
                      }}>
                        {streak}
                      </span>
                      <span style={{ fontSize: 14, color: T.muted }}>
                        jour{streak > 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                  <div style={{
                    width: 52, height: 52, borderRadius: "50%",
                    background: doneToday ? T.gold : T.soft,
                    border: `2px solid ${doneToday ? T.gold : T.border}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 24,
                    boxShadow: doneToday ? `0 0 0 0 ${T.gold}60` : "none",
                    animation: doneToday ? "streakPulse 2.5s ease-in-out infinite" : "none",
                    transition: "all .4s",
                  }}>
                    {doneToday ? "⭐" : "☆"}
                  </div>
                </div>

                {/* 7 day stars */}
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  {weekStars.map((s, i) => <StarDay key={i} {...s} celebrate={starCelebrate} />)}
                </div>

                {/* Message */}
                {!doneToday && (
                  <div style={{ marginTop: 14, fontSize: 12, color: T.muted, textAlign: "center", fontStyle: "italic" }}>
                    {streak > 0
                      ? `⭐ Ajoute une entrée aujourd'hui pour continuer ta série de ${streak} jours`
                      : "Commence ta série · une entrée suffit"
                    }
                  </div>
                )}
                {doneToday && streak >= 7 && (
                  <div style={{ marginTop: 14, fontSize: 12, color: T.gold, textAlign: "center", fontWeight: 600 }}>
                    🔥 {streak} jours d'affilée · Extraordinaire
                  </div>
                )}
                {doneToday && streak < 7 && (
                  <div style={{ marginTop: 14, fontSize: 12, color: T.accent, textAlign: "center" }}>
                    ✦ Étoile du jour gagnée · {7 - streak} jour{7 - streak > 1 ? "s" : ""} avant le badge 7 jours
                  </div>
                )}
              </div>

              {/* Quick add */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
                <button className="btn btn-dark" onClick={() => { setAddMode("success"); setTab("add"); setTimeout(() => textRef.current?.focus(), 100); }}>
                  + Succès
                </button>
                <button className="btn btn-sage" onClick={() => { setAddMode("transform"); setRfStep(0); setTab("add"); setTimeout(() => rfRef.current?.focus(), 100); }}>
                  ◎ Transformer
                </button>
              </div>

              {/* Stats row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 9, marginBottom: 18 }}>
                {[
                  { val: successCount,   label: "Succès",    color: T.accent, bg: T.accentBg },
                  { val: transformCount, label: "Transf.",   color: T.sage,   bg: T.sageBg   },
                  { val: badges.length,  label: "Badges",    color: T.violet, bg: T.violetBg },
                ].map(s => (
                  <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.color}20`, borderRadius: 14, padding: "12px" }}>
                    <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 24, color: T.text }}>{s.val}</div>
                    <div style={{ fontSize: 10, color: T.muted, marginTop: 1 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Badges strip */}
              {badges.length > 0 && (
                <div style={{ display: "flex", gap: 6, marginBottom: 18, overflowX: "auto", paddingBottom: 2 }}>
                  {BADGES.filter(b => badges.includes(b.id)).map(b => (
                    <div key={b.id} style={{ background: T.accentBg, border: `1px solid ${T.accentSoft}`, borderRadius: 40, padding: "5px 12px", fontSize: 12, color: T.accent, fontWeight: 600, whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
                      <span>{b.icon}</span><span>{b.label}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Recent */}
              <div style={{ fontSize: 12, fontWeight: 600, color: T.mid, letterSpacing: ".03em", marginBottom: 10 }}>RÉCENT</div>
              {entries.length === 0 ? (
                <div>
                  {/* Quote du jour */}
                  <div style={{ background: "linear-gradient(135deg,#FFFDF8,#FDF6E8)", border: `1px solid ${T.accentSoft}`, borderRadius: 18, padding: "22px", marginBottom: 12 }}>
                    <div style={{ fontSize: 10, color: T.accent, fontWeight: 700, letterSpacing: ".08em", marginBottom: 10 }}>SAGESSE DU JOUR</div>
                    <div style={{ fontFamily: "'DM Serif Display',serif", fontStyle: "italic", fontSize: 15, color: T.text, lineHeight: 1.7, marginBottom: 8 }}>
                      "{todayQuote.text}"
                    </div>
                    <div style={{ fontSize: 11, color: T.muted }}>— {todayQuote.author}</div>
                  </div>
                  {/* Prompt d'amorce */}
                  <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 18, padding: "20px 22px" }}>
                    <div style={{ fontSize: 10, color: T.mid, fontWeight: 700, letterSpacing: ".08em", marginBottom: 10 }}>POUR COMMENCER</div>
                    <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 16, color: T.text, lineHeight: 1.5, marginBottom: 16 }}>
                      {todayPrompt}
                    </div>
                    <button className="btn btn-dark" onClick={() => { setAddMode("success"); setTab("add"); setTimeout(() => textRef.current?.focus(), 100); }} style={{ width: "100%", padding: "13px", fontSize: 14 }}>
                      Répondre · +40 XP
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                  {entries.slice(0, 5).map(e => (
                    <EntryCard key={e.id} e={e} fresh={freshId === e.id} showToggle onToggle={id => setEntries(prev => prev.map(e => e.id === id ? { ...e, isPublic: !e.isPublic } : e))} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ════ ADD ════ */}
          {tab === "add" && (
            <div style={{ animation: "fadeIn .3s ease" }}>
              {/* Mode switcher */}
              <div style={{ display: "flex", background: T.soft, borderRadius: 14, padding: 4, marginBottom: 24, gap: 4 }}>
                {[{ id: "success", label: "✦ Succès" }, { id: "transform", label: "◎ Transformer" }].map(m => (
                  <button key={m.id} onClick={() => { setAddMode(m.id); if (m.id === "success") setTimeout(() => textRef.current?.focus(), 80); else { setRfStep(0); setTimeout(() => rfRef.current?.focus(), 80); }}} style={{
                    flex: 1, padding: "10px", borderRadius: 11, border: "none", cursor: "pointer",
                    fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: 13,
                    background: addMode === m.id ? T.card : "transparent",
                    color: addMode === m.id ? T.text : T.muted,
                    boxShadow: addMode === m.id ? "0 1px 6px rgba(0,0,0,.07)" : "none",
                    transition: "all .2s",
                  }}>{m.label}</button>
                ))}
              </div>

              {/* SUCCESS */}
              {addMode === "success" && (<>
                <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 22, marginBottom: 4 }}>Ton succès du jour</div>
                <div style={{ fontSize: 13, color: T.muted, marginBottom: 18 }}>
                  {!doneToday ? "✦ Une entrée suffit pour gagner ton étoile aujourd'hui." : "⭐ Étoile déjà gagnée · continue à capitaliser !"}
                </div>
                <textarea ref={textRef} rows={5} placeholder="Ex : J'ai tenu mes résolutions ce matin malgré la fatigue…" value={text} onChange={e => setText(e.target.value)} onKeyDown={e => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") addSuccess(); }} />
                <div style={{ marginTop: 14, marginBottom: 6, fontSize: 11, fontWeight: 600, color: T.mid, letterSpacing: ".04em" }}>CATÉGORIE</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
                  {CATEGORIES.map(c => (
                    <button key={c.id} onClick={() => setSelCat(c.id)} style={{
                      padding: "6px 12px", borderRadius: 40,
                      border: `1.5px solid ${selCat === c.id ? c.color : T.border}`,
                      background: selCat === c.id ? c.bg : "transparent",
                      color: selCat === c.id ? c.color : T.muted,
                      fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: selCat === c.id ? 600 : 400,
                      cursor: "pointer", transition: "all .18s", whiteSpace: "nowrap",
                      display: "flex", alignItems: "center", gap: 5,
                    }}>
                      <span style={{ fontSize: 9 }}>{c.emoji}</span>{c.label}
                    </button>
                  ))}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "0 0 22px" }}>
                  <Toggle on={isPublic} onChange={setIsPublic} label={isPublic ? "Visible par mon cercle" : "Privé"} />
                  <span style={{ fontSize: 11, color: T.muted }}>⌘↵ valider</span>
                </div>
                <div style={{ display: "flex", gap: 9 }}>
                  <button className="btn btn-outline" onClick={() => setTab("home")} style={{ padding: "14px 18px" }}>←</button>
                  <button className="btn btn-dark" onClick={addSuccess} style={{ flex: 1 }} disabled={!text.trim()}>Valider · +40 XP</button>
                </div>
              </>)}

              {/* TRANSFORM */}
              {addMode === "transform" && (<>
                {rfStep === 0 && (<>
                  <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 22, marginBottom: 4 }}>Transformer</div>
                  <div style={{ fontSize: 13, color: T.muted, marginBottom: 18, lineHeight: 1.65 }}>
                    Confie quelque chose de difficile.<br /><span style={{ fontStyle: "italic" }}>Nous allons chercher ce qu'il contient.</span>
                  </div>
                  <textarea ref={rfRef} rows={6} className="sage-focus" placeholder="Ex : J'ai raté une opportunité importante…" value={rfInput} onChange={e => setRfInput(e.target.value)} style={{ borderColor: rfInput ? T.sage : T.border }} />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "14px 0 22px" }}>
                    <Toggle on={rfPub} onChange={setRfPub} label={rfPub ? "Visible par mon cercle" : "Privé"} />
                  </div>
                  <div style={{ display: "flex", gap: 9 }}>
                    <button className="btn btn-outline" onClick={() => setTab("home")} style={{ padding: "14px 18px" }}>←</button>
                    <button className="btn btn-sage" onClick={callAI} style={{ flex: 1 }} disabled={!rfInput.trim()}>Trouver le sens →</button>
                  </div>
                </>)}

                {rfStep === 1 && (
                  <div style={{ textAlign: "center", padding: "56px 0" }}>
                    <div style={{ width: 44, height: 44, borderRadius: "50%", border: `3px solid ${T.sageSoft}`, borderTopColor: T.sage, animation: "spin 1s linear infinite", margin: "0 auto 22px" }} />
                    <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 20, marginBottom: 8 }}>En contemplation…</div>
                    <div style={{ fontSize: 13, color: T.muted, fontStyle: "italic", lineHeight: 1.7 }}>
                      "Ce n'est pas ce qui nous arrive<br />qui nous définit, mais ce que nous en faisons."
                    </div>
                    <div style={{ fontSize: 11, color: T.muted, marginTop: 5 }}>— Épictète</div>
                  </div>
                )}

                {rfStep === 2 && (<>
                  <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 20, marginBottom: 4 }}>Trois regards</div>
                  <div style={{ fontSize: 13, color: T.muted, marginBottom: 14 }}>Choisis la perspective qui résonne en toi.</div>
                  <div style={{ fontSize: 12, color: T.muted, fontStyle: "italic", borderLeft: `2px solid ${T.border}`, paddingLeft: 10, marginBottom: 18, lineHeight: 1.5 }}>
                    "{rfInput.length > 80 ? rfInput.slice(0, 80) + "…" : rfInput}"
                  </div>
                  {rfAngles.map((a, i) => (
                    <div key={i} className="angle" onClick={() => { setRfChosen(a); setRfEdit(a.texte); setRfStep(3); setTimeout(() => editRef.current?.focus(), 100); }}>
                      <div style={{ fontSize: 10, color: T.sage, fontWeight: 700, letterSpacing: ".08em", marginBottom: 5 }}>
                        {["FORCE", "SAGESSE", "OPPORTUNITÉ"][i]}
                      </div>
                      <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 16, marginBottom: 5 }}>{a.titre}</div>
                      <div style={{ fontSize: 13, color: T.mid, lineHeight: 1.6 }}>{a.texte}</div>
                      <div style={{ fontSize: 12, color: T.sage, marginTop: 8 }}>Choisir →</div>
                    </div>
                  ))}
                  <button className="btn btn-outline" onClick={() => setRfStep(0)} style={{ width: "100%", marginTop: 4 }}>← Reformuler</button>
                </>)}

                {rfStep === 3 && (<>
                  <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 20, marginBottom: 4 }}>Fais-le tien</div>
                  <div style={{ fontSize: 13, color: T.muted, marginBottom: 10 }}>Retouche librement. C'est ta voix qui compte.</div>
                  <div style={{ fontSize: 10, color: T.sage, fontWeight: 700, letterSpacing: ".07em", marginBottom: 7 }}>{rfChosen?.titre}</div>
                  <textarea ref={editRef} rows={5} className="sage-focus" value={rfEdit} onChange={e => setRfEdit(e.target.value)} style={{ borderColor: T.sage }} />
                  <div style={{ marginTop: 14, marginBottom: 6, fontSize: 11, fontWeight: 600, color: T.mid, letterSpacing: ".04em" }}>CATÉGORIE</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
                    {CATEGORIES.map(c => (
                      <button key={c.id} onClick={() => setRfCat(c.id)} style={{
                        padding: "6px 12px", borderRadius: 40,
                        border: `1.5px solid ${rfCat === c.id ? c.color : T.border}`,
                        background: rfCat === c.id ? c.bg : "transparent",
                        color: rfCat === c.id ? c.color : T.muted,
                        fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: rfCat === c.id ? 600 : 400,
                        cursor: "pointer", transition: "all .18s", whiteSpace: "nowrap",
                        display: "flex", alignItems: "center", gap: 5,
                      }}>
                        <span style={{ fontSize: 9 }}>{c.emoji}</span>{c.label}
                      </button>
                    ))}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "0 0 22px" }}>
                    <Toggle on={rfPub} onChange={setRfPub} label={rfPub ? "Visible par mon cercle" : "Privé"} />
                    <span style={{ fontSize: 11, color: T.sage, fontWeight: 600 }}>+60 XP</span>
                  </div>
                  <div style={{ display: "flex", gap: 9 }}>
                    <button className="btn btn-outline" onClick={() => setRfStep(2)} style={{ padding: "14px 18px" }}>←</button>
                    <button className="btn btn-sage" onClick={saveTransform} style={{ flex: 1 }} disabled={!rfEdit.trim()}>Enregistrer · +60 XP</button>
                  </div>
                </>)}
              </>)}
            </div>
          )}


          {/* ════ JOURNAL ════ */}
          {tab === "journal" && (
            <div style={{ animation: "fadeIn .3s ease" }}>

              {/* Sub-nav */}
              <div style={{ display: "flex", background: T.soft, borderRadius: 14, padding: 4, marginBottom: 22, gap: 4 }}>
                {[
                  { id: "history",  label: "Historique" },
                  { id: "week",     label: "Cette semaine" },
                  { id: "portrait", label: "Portrait IA" },
                ].map(s => (
                  <button key={s.id} onClick={() => setHistoryTab(s.id)} style={{
                    flex: 1, padding: "9px 4px", borderRadius: 11, border: "none", cursor: "pointer",
                    fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: 11,
                    background: historyTab === s.id ? T.card : "transparent",
                    color: historyTab === s.id ? T.text : T.muted,
                    boxShadow: historyTab === s.id ? "0 1px 6px rgba(0,0,0,.07)" : "none",
                    transition: "all .2s",
                  }}>{s.label}</button>
                ))}
              </div>

              {/* ── HISTORIQUE ── */}
              {historyTab === "history" && (
                <div>
                  {/* Search */}
                  <input type="text" placeholder="Rechercher une entrée…" value={historySearch}
                    onChange={e => setHistorySearch(e.target.value)}
                    style={{ marginBottom: 12, borderRadius: 40, padding: "10px 18px", fontSize: 13 }} />

                  {/* Type filter */}
                  <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
                    {[{id:'all',label:'Tout'},{id:'success',label:'✦ Succès'},{id:'transform',label:'◎ Transformés'}].map(f => (
                      <button key={f.id} onClick={() => setHistoryCat(f.id)} style={{
                        padding: "6px 13px", borderRadius: 40, border: `1.5px solid ${historyTab==='history' && historyCat===f.id ? T.text : T.border}`,
                        background: historyCat === f.id ? T.text : "transparent",
                        color: historyCat === f.id ? "#fff" : T.mid,
                        fontFamily: "'DM Sans',sans-serif", fontSize: 12, cursor: "pointer",
                        fontWeight: historyCat === f.id ? 600 : 400,
                      }}>{f.label}</button>
                    ))}
                  </div>

                  {/* Cat filter */}
                  <div style={{ display: "flex", gap: 5, marginBottom: 16, overflowX: "auto", paddingBottom: 2 }}>
                    {CATEGORIES.map(c => (
                      <button key={c.id} onClick={() => setHistoryCat(c.id)} style={{
                        padding: "5px 11px", borderRadius: 40, flexShrink: 0,
                        border: `1.5px solid ${historyCat===c.id ? c.color : T.border}`,
                        background: historyCat===c.id ? c.bg : "transparent",
                        color: historyCat===c.id ? c.color : T.muted,
                        fontFamily: "'DM Sans',sans-serif", fontSize: 11, cursor: "pointer",
                        display: "flex", alignItems: "center", gap: 4,
                      }}>
                        <span>{c.emoji}</span>{c.label}
                      </button>
                    ))}
                  </div>

                  {/* Results */}
                  {(() => {
                    const filtered = entries.filter(e => {
                      const matchType = historyCat === 'all' ? true : historyCat === 'success' ? e.type === 'success' : historyCat === 'transform' ? e.type === 'transform' : e.cat === historyCat;
                      const matchSearch = !historySearch.trim() || e.text.toLowerCase().includes(historySearch.toLowerCase()) || (e.original||'').toLowerCase().includes(historySearch.toLowerCase());
                      return matchType && matchSearch;
                    });
                    return filtered.length === 0
                      ? <div style={{ textAlign: "center", padding: "32px 0", color: T.muted, fontSize: 13 }}>Aucun résultat</div>
                      : <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                          {filtered.map(e => <EntryCard key={e.id} e={e} showToggle onToggle={id => setEntries(prev => prev.map(e => e.id===id ? {...e,isPublic:!e.isPublic} : e))} />)}
                        </div>;
                  })()}
                </div>
              )}

              {/* ── RÉSUMÉ SEMAINE ── */}
              {historyTab === "week" && (
                <div>
                  {/* Hero */}
                  <div style={{ background: "linear-gradient(135deg,#FFFDF8,#FDF6E8)", border: `1px solid ${T.accentSoft}`, borderRadius: 22, padding: "22px", marginBottom: 14 }}>
                    <div style={{ fontSize: 11, color: T.accent, fontWeight: 700, letterSpacing: ".08em", marginBottom: 12 }}>CETTE SEMAINE</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
                      {[
                        { val: thisWeekEntries.length, label: "Entrées",  color: T.text },
                        { val: weekStarCount + " ⭐",   label: "Étoiles",  color: T.gold },
                        { val: "+" + weekXp,            label: "XP",       color: T.accent },
                      ].map(s => (
                        <div key={s.label} style={{ textAlign: "center", background: "rgba(255,255,255,.7)", borderRadius: 14, padding: "12px 8px" }}>
                          <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 22, color: s.color }}>{s.val}</div>
                          <div style={{ fontSize: 10, color: T.muted, marginTop: 2 }}>{s.label}</div>
                        </div>
                      ))}
                    </div>
                    {topCat && (
                      <div style={{ background: topCat.bg, border: `1px solid ${topCat.color}30`, borderRadius: 12, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 18 }}>{topCat.emoji}</span>
                        <div>
                          <div style={{ fontSize: 11, color: topCat.color, fontWeight: 700 }}>DOMAINE DOMINANT</div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{topCat.label}</div>
                        </div>
                      </div>
                    )}
                    {thisWeekEntries.length === 0 && (
                      <div style={{ textAlign: "center", padding: "16px 0", fontSize: 13, color: T.muted, fontStyle: "italic" }}>
                        Pas encore d'entrées cette semaine · commence dès maintenant !
                      </div>
                    )}
                  </div>

                  {/* Stars recap */}
                  <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 18, padding: "18px 20px", marginBottom: 14 }}>
                    <div style={{ fontSize: 11, color: T.mid, fontWeight: 700, letterSpacing: ".06em", marginBottom: 14 }}>ÉTOILES DE LA SEMAINE</div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      {weekStars.map((s, i) => <StarDay key={i} {...s} celebrate={starCelebrate} />)}
                    </div>
                  </div>

                  {/* Last week comparison */}
                  {lastWeekEntries.length > 0 && (
                    <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 18, padding: "16px 20px" }}>
                      <div style={{ fontSize: 11, color: T.mid, fontWeight: 700, letterSpacing: ".06em", marginBottom: 10 }}>VS SEMAINE DERNIÈRE</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ flex: 1, textAlign: "center" }}>
                          <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 28, color: T.text }}>{thisWeekEntries.length}</div>
                          <div style={{ fontSize: 10, color: T.muted }}>Cette semaine</div>
                        </div>
                        <div style={{ fontSize: 20, color: thisWeekEntries.length >= lastWeekEntries.length ? T.green : T.rose }}>
                          {thisWeekEntries.length >= lastWeekEntries.length ? "↑" : "↓"}
                        </div>
                        <div style={{ flex: 1, textAlign: "center" }}>
                          <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 28, color: T.muted }}>{lastWeekEntries.length}</div>
                          <div style={{ fontSize: 10, color: T.muted }}>Semaine passée</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Recent this week */}
                  {thisWeekEntries.length > 0 && (
                    <>
                      <div style={{ fontSize: 12, fontWeight: 600, color: T.mid, letterSpacing: ".03em", margin: "18px 0 10px" }}>ENTRÉES DE LA SEMAINE</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                        {thisWeekEntries.map(e => <EntryCard key={e.id} e={e} />)}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* ── PORTRAIT IA ── */}
              {historyTab === "portrait" && (
                <div>
                  {portraitStep === 0 && (
                    <div>
                      <div style={{ background: "linear-gradient(135deg,#F0EAFA,#EBF2EF)", border: `1px solid ${T.violet}20`, borderRadius: 22, padding: "28px 24px", marginBottom: 20, textAlign: "center" }}>
                        <div style={{ fontSize: 36, marginBottom: 14 }}>✦</div>
                        <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 22, marginBottom: 8, color: T.text }}>
                          Ton portrait de croissance
                        </div>
                        <div style={{ fontSize: 13, color: T.mid, lineHeight: 1.7, marginBottom: 20 }}>
                          Après analyse de tes entrées, l'IA dresse un portrait de qui tu es en train de devenir — tes forces, tes patterns, ta trajectoire.
                        </div>
                        {entries.length < 3 ? (
                          <div style={{ fontSize: 13, color: T.muted, fontStyle: "italic" }}>
                            Ajoute au moins 3 entrées pour générer ton portrait.
                          </div>
                        ) : (
                          <button className="btn btn-dark" onClick={callPortrait} style={{ width: "100%", padding: "15px" }}>
                            Générer mon portrait · {entries.length} entrées analysées
                          </button>
                        )}
                      </div>
                      <div style={{ fontSize: 11, color: T.muted, textAlign: "center", lineHeight: 1.6 }}>
                        Inspiré de la psychologie humaniste · Vygotsky, Rogers, Frankl.<br />
                        Tes données restent privées.
                      </div>
                    </div>
                  )}

                  {portraitStep === 1 && (
                    <div style={{ textAlign: "center", padding: "60px 0" }}>
                      <div style={{ width: 48, height: 48, borderRadius: "50%", border: `3px solid ${T.violetBg}`, borderTopColor: T.violet, animation: "spin 1s linear infinite", margin: "0 auto 24px" }} />
                      <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 20, marginBottom: 8 }}>En contemplation…</div>
                      <div style={{ fontSize: 13, color: T.muted, fontStyle: "italic", lineHeight: 1.7 }}>
                        "Connais-toi toi-même."
                      </div>
                      <div style={{ fontSize: 11, color: T.muted, marginTop: 4 }}>— Socrate</div>
                    </div>
                  )}

                  {portraitStep === 2 && portrait && (
                    <div style={{ animation: "fadeIn .4s ease" }}>
                      {/* Title card */}
                      <div style={{ background: "linear-gradient(135deg,#F0EAFA,#EBF0F8)", border: `1px solid ${T.violet}25`, borderRadius: 22, padding: "24px", marginBottom: 14, textAlign: "center" }}>
                        <div style={{ fontSize: 11, color: T.violet, fontWeight: 700, letterSpacing: ".1em", marginBottom: 10 }}>TON PORTRAIT</div>
                        <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 22, color: T.text, lineHeight: 1.3, marginBottom: 14 }}>
                          {portrait.titre}
                        </div>
                        <div style={{ fontSize: 14, color: T.mid, lineHeight: 1.75 }}>{portrait.resume}</div>
                      </div>

                      {/* Forces */}
                      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 18, padding: "18px 20px", marginBottom: 12 }}>
                        <div style={{ fontSize: 11, color: T.green, fontWeight: 700, letterSpacing: ".08em", marginBottom: 12 }}>TES FORCES</div>
                        {portrait.forces.map((f, i) => (
                          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                            <div style={{ width: 28, height: 28, borderRadius: "50%", background: T.greenBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: T.green, fontWeight: 700, flexShrink: 0 }}>{i+1}</div>
                            <div style={{ fontSize: 13, fontWeight: 500, color: T.text }}>{f}</div>
                          </div>
                        ))}
                      </div>

                      {/* Pattern */}
                      <div style={{ background: T.sageBg, border: `1px solid ${T.sageSoft}`, borderRadius: 18, padding: "18px 20px", marginBottom: 12 }}>
                        <div style={{ fontSize: 11, color: T.sage, fontWeight: 700, letterSpacing: ".08em", marginBottom: 8 }}>CE QUI TE CARACTÉRISE</div>
                        <div style={{ fontSize: 14, color: T.text, lineHeight: 1.7, fontStyle: "italic" }}>"{portrait.pattern}"</div>
                      </div>

                      {/* Invitation */}
                      <div style={{ background: T.accentBg, border: `1px solid ${T.accentSoft}`, borderRadius: 18, padding: "18px 20px", marginBottom: 16 }}>
                        <div style={{ fontSize: 11, color: T.accent, fontWeight: 700, letterSpacing: ".08em", marginBottom: 8 }}>INVITATION À GRANDIR</div>
                        <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 16, color: T.text, lineHeight: 1.6 }}>{portrait.invitation}</div>
                      </div>

                      <button className="btn btn-outline" onClick={() => { setPortrait(null); setPortraitStep(0); }} style={{ width: "100%", padding: "13px", fontSize: 13 }}>
                        ↺ Régénérer
                      </button>
                    </div>
                  )}
                </div>
              )}

            </div>
          )}

          {/* ════ CERCLE ════ */}
          {tab === "cercle" && (
            <div style={{ animation: "fadeIn .3s ease" }}>

              {/* Sub-nav */}
              <div style={{ display: "flex", background: T.soft, borderRadius: 14, padding: 4, marginBottom: 22, gap: 4 }}>
                {[
                  { id: "feed",      label: "Fil" },
                  { id: "profil",    label: "Profil" },
                  { id: "followers", label: `Abonnés${requests.length > 0 ? ' ·' + requests.length : ''}` },
                ].map(s => (
                  <button key={s.id} onClick={() => setCercleSub(s.id)} style={{
                    flex: 1, padding: "9px 6px", borderRadius: 11, border: "none", cursor: "pointer",
                    fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: 12,
                    background: cercleSub === s.id ? T.card : "transparent",
                    color: cercleSub === s.id ? T.text : T.muted,
                    boxShadow: cercleSub === s.id ? "0 1px 6px rgba(0,0,0,.07)" : "none",
                    transition: "all .2s",
                  }}>{s.label}</button>
                ))}
              </div>

              {/* FIL */}
              {cercleSub === "feed" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {feed.map(item => <FeedCard key={item.id} item={item} onReact={react} onComment={comment} />)}
                </div>
              )}

              {/* PROFIL */}
              {cercleSub === "profil" && !profile && (
                <div>
                  <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 22, marginBottom: 4 }}>Crée ton profil</div>
                  <div style={{ fontSize: 13, color: T.muted, marginBottom: 24, lineHeight: 1.7 }}>
                    Partage tes avancées avec les personnes de ton choix.
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: T.mid, letterSpacing: ".04em", marginBottom: 8 }}>TON PRÉNOM / PSEUDO</div>
                  <input type="text" placeholder="Ex : Sophie M." value={setupName} onChange={e => setSetupName(e.target.value)}
                    style={{ marginBottom: 14, borderRadius: 14, padding: "13px 15px", height: "auto" }} />
                  <div style={{ fontSize: 11, fontWeight: 600, color: T.mid, letterSpacing: ".04em", marginBottom: 8 }}>BIO COURTE (optionnelle)</div>
                  <textarea rows={3} placeholder="En chemin vers une meilleure version de moi." value={setupBio}
                    onChange={e => setSetupBio(e.target.value)} style={{ marginBottom: 24 }} />
                  <button className="btn btn-dark" onClick={createProfile} style={{ width: "100%" }} disabled={!setupName.trim()}>
                    Créer mon profil
                  </button>
                </div>
              )}

              {cercleSub === "profil" && profile && (
                <div>
                  {/* Profile hero */}
                  <div style={{ background: "linear-gradient(135deg,#FFFDF8,#FDF6E8)", border: `1px solid ${T.border}`, borderRadius: 22, padding: "22px", marginBottom: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
                      <div style={{ width: 56, height: 56, borderRadius: "50%", background: T.accentBg, border: `2px solid ${T.accentSoft}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, color: T.accent, flexShrink: 0 }}>
                        {profile.avatar}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 20, color: T.text }}>{profile.name}</div>
                        {profile.bio && <div style={{ fontSize: 12, color: T.muted, marginTop: 3, lineHeight: 1.5 }}>{profile.bio}</div>}
                        <div style={{ fontSize: 11, color: T.accent, marginTop: 4, fontWeight: 600 }}>{getLevel(xp).label}</div>
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                      {[
                        { val: entries.length, label: "Entrées" },
                        { val: followers.filter(f => f.status === "accepted").length, label: "Abonnés" },
                        { val: badges.length, label: "Badges" },
                      ].map(s => (
                        <div key={s.label} style={{ textAlign: "center", background: "rgba(255,255,255,.7)", borderRadius: 12, padding: "10px 8px" }}>
                          <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 22 }}>{s.val}</div>
                          <div style={{ fontSize: 10, color: T.muted }}>{s.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Invite */}
                  <button onClick={() => setShowInvite(true)} style={{
                    width: "100%", background: T.card, border: `1px solid ${T.border}`,
                    borderRadius: 16, padding: "16px", cursor: "pointer", textAlign: "left",
                    fontFamily: "'DM Sans',sans-serif", display: "flex", alignItems: "center", gap: 12, marginBottom: 14,
                  }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: T.accentBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>🔗</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>Inviter quelqu'un</div>
                      <div style={{ fontSize: 12, color: T.muted }}>Partager un lien privé</div>
                    </div>
                    <span style={{ marginLeft: "auto", color: T.muted, fontSize: 16 }}>→</span>
                  </button>

                  {/* Public entries */}
                  <div style={{ fontSize: 12, fontWeight: 600, color: T.mid, letterSpacing: ".03em", marginBottom: 10 }}>
                    ENTRÉES PUBLIQUES · {entries.filter(e => e.isPublic).length}
                  </div>
                  {entries.filter(e => e.isPublic).length === 0 ? (
                    <div style={{ background: T.soft, borderRadius: 16, padding: "20px", textAlign: "center", fontSize: 13, color: T.muted, lineHeight: 1.6 }}>
                      Aucune entrée publique pour l'instant.<br />Active "Public" lors de l'ajout.
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                      {entries.filter(e => e.isPublic).slice(0,4).map(e => (
                        <EntryCard key={e.id} e={e} showToggle onToggle={id => setEntries(prev => prev.map(e => e.id === id ? { ...e, isPublic: !e.isPublic } : e))} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ABONNÉS */}
              {cercleSub === "followers" && (
                <div>
                  {/* Requests */}
                  {requests.length > 0 && (
                    <div style={{ marginBottom: 20 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: T.accent, letterSpacing: ".06em", marginBottom: 10 }}>
                        {requests.length} DEMANDE{requests.length > 1 ? "S" : ""} EN ATTENTE
                      </div>
                      {requests.map(r => (
                        <div key={r.id} style={{ background: T.accentBg, border: `1px solid ${T.accentSoft}`, borderRadius: 16, padding: "16px", marginBottom: 10 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                            <div style={{ width: 38, height: 38, borderRadius: "50%", background: r.color + "18", border: `1.5px solid ${r.color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: r.color, flexShrink: 0 }}>{r.avatar}</div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 14, fontWeight: 600 }}>{r.name}</div>
                              <div style={{ fontSize: 12, color: T.muted, fontStyle: "italic" }}>"{r.message}"</div>
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: 8 }}>
                            <button className="btn btn-dark" onClick={() => acceptRequest(r)} style={{ flex: 1, padding: "9px", fontSize: 13 }}>Accepter</button>
                            <button className="btn btn-outline" onClick={() => declineRequest(r.id)} style={{ flex: 1, padding: "9px", fontSize: 13 }}>Décliner</button>
                          </div>
                        </div>
                      ))}
                      <div style={{ height: 1, background: T.border, margin: "16px 0" }} />
                    </div>
                  )}

                  <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, letterSpacing: ".06em", marginBottom: 10 }}>
                    ABONNÉS ACTIFS · {followers.filter(f => f.status === "accepted").length}
                  </div>
                  {followers.filter(f => f.status === "accepted").length === 0 ? (
                    <div style={{ background: T.soft, borderRadius: 16, padding: "24px", textAlign: "center", fontSize: 13, color: T.muted }}>
                      Invite des proches pour commencer.
                    </div>
                  ) : (
                    followers.filter(f => f.status === "accepted").map(f => (
                      <div key={f.id} style={{ display: "flex", alignItems: "center", gap: 12, background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: "14px 16px", marginBottom: 8 }}>
                        <div style={{ width: 40, height: 40, borderRadius: "50%", background: f.color + "18", border: `1.5px solid ${f.color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: f.color, flexShrink: 0 }}>{f.avatar}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 14, fontWeight: 600 }}>{f.name}</div>
                          <div style={{ fontSize: 11, color: T.muted }}>{f.level}</div>
                        </div>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: T.green, boxShadow: `0 0 6px ${T.green}` }} />
                      </div>
                    ))
                  )}
                </div>
              )}

            </div>
          )}
        </main>

        {/* ── Invite modal ── */}
        {showInvite && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(26,25,20,.45)", backdropFilter: "blur(4px)", zIndex: 900, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={() => setShowInvite(false)}>
            <div style={{ background: T.card, borderRadius: "22px 22px 0 0", padding: "24px 22px 40px", width: "100%", maxWidth: 440, animation: "slideUp .3s ease" }} onClick={e => e.stopPropagation()}>
              <div style={{ width: 32, height: 4, background: T.border, borderRadius: 2, margin: "0 auto 20px" }} />
              <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 20, marginBottom: 4 }}>Inviter quelqu'un</div>
              <div style={{ fontSize: 13, color: T.muted, marginBottom: 18, lineHeight: 1.6 }}>Partage ce lien uniquement aux personnes en qui tu as confiance.</div>
              <div style={{ background: T.soft, border: `1px solid ${T.border}`, borderRadius: 14, padding: "13px 15px", marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <span style={{ fontSize: 13, color: T.mid, fontFamily: "monospace" }}>winn.app/{INVITE_CODE}</span>
                <button onClick={() => { navigator.clipboard?.writeText('winn.app/' + INVITE_CODE); toast_('Lien copié ✦'); setShowInvite(false); }} style={{ background: T.text, color: "#fff", border: "none", borderRadius: 20, padding: "7px 14px", fontSize: 12, fontFamily: "'DM Sans',sans-serif", cursor: "pointer", fontWeight: 600, whiteSpace: "nowrap" }}>Copier</button>
              </div>
              <div style={{ fontSize: 11, color: T.muted, lineHeight: 1.6 }}>Ce lien expire dans 7 jours.</div>
            </div>
          </div>
        )}

        {/* ── Nav ── */}
        <nav style={{ position: "fixed", bottom: 0, left: 0, right: 0, display: "flex", justifyContent: "center", background: "rgba(250,250,247,.95)", backdropFilter: "blur(16px)", borderTop: `1px solid ${T.border}` }}>
          <div style={{ display: "flex", width: "100%", maxWidth: 440, padding: "0 8px 20px" }}>
            <button className="tab" onClick={() => setTab("home")} style={{ color: tab === "home" ? T.text : T.muted }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill={tab === "home" ? T.text : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                {tab !== "home" && <polyline points="9 22 9 12 15 12 15 22"/>}
              </svg>
              Accueil
            </button>

            <button className="tab" onClick={() => { setTab("add"); setAddMode("success"); setTimeout(() => textRef.current?.focus(), 120); }} style={{ color: tab === "add" ? T.text : T.muted }}>
              <div style={{ width: 42, height: 42, borderRadius: "50%", background: tab === "add" ? T.text : T.soft, border: `1.5px solid ${tab === "add" ? T.text : T.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: tab === "add" ? "#fff" : T.mid, boxShadow: tab === "add" ? "0 2px 12px rgba(0,0,0,.15)" : "none", transition: "all .2s", marginTop: -8 }}>+</div>
              Ajouter
            </button>

            <button className="tab" onClick={() => setTab("journal")} style={{ color: tab === "journal" ? T.text : T.muted }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={tab==="journal"?2.4:1.8} strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
              Journal
            </button>

            <button className="tab" onClick={() => setTab("cercle")} style={{ color: tab === "cercle" ? T.text : T.muted }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill={tab === "cercle" ? T.text : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" fill="none"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75" fill="none"/>
              </svg>
              Cercle
            </button>
          </div>
        </nav>
      </div>
    </>
  );
}
