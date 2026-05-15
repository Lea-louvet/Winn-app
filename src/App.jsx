import React, { useState, useEffect, useRef } from "react";

// ── Config Supabase ───────────────────────────────────────────────
const SB_URL = "https://nfruohwbfzetzmqajxbo.supabase.co";
const SB_KEY = "sb_publishable_4bav_Br__XQtNXykRSah7w_uZmoUloR";

async function sb(path, opts, token) {
  const res = await fetch(SB_URL + path, {
    ...opts,
    headers: {
      "apikey": SB_KEY,
      "Authorization": "Bearer " + (token || SB_KEY),
      "Content-Type": "application/json",
      "Prefer": "return=representation",
      ...((opts||{}).headers||{}),
    },
  });
  if (res.status === 204) return null;
  return res.json();
}

// ── Design tokens ─────────────────────────────────────────────────
const T = {
  bg:"#FAFAF7",card:"#FFFFFF",soft:"#F4F3EE",border:"#E8E6DF",
  text:"#1A1914",mid:"#6B6860",muted:"#A8A69E",
  accent:"#C8923A",accentBg:"#FDF3E3",accentSoft:"#F5E6C8",
  sage:"#5C7A6E",sageBg:"#EBF2EF",sageSoft:"#D4E8E2",
  rose:"#B85C6E",roseBg:"#F8EAED",
  violet:"#7A5FA0",violetBg:"#F0EAFA",
  green:"#4A8C5C",greenBg:"#EBF5EE",
  blue:"#4A72A0",blueBg:"#EBF0F8",
  gold:"#E8B84B",goldBg:"#FEF9EC",goldSoft:"#FDEFC3",
};

const CATEGORIES = [
  {id:"travail",label:"Travail",emoji:"◈",color:T.accent,bg:T.accentBg},
  {id:"sport",label:"Sport",emoji:"◎",color:T.green,bg:T.greenBg},
  {id:"amour",label:"Amour",emoji:"◉",color:T.rose,bg:T.roseBg},
  {id:"amitie",label:"Amitié",emoji:"◆",color:T.violet,bg:T.violetBg},
  {id:"famille",label:"Famille",emoji:"◇",color:T.blue,bg:T.blueBg},
  {id:"bienetre",label:"Bien-être",emoji:"✦",color:T.sage,bg:T.sageBg},
  {id:"creativite",label:"Créativité",emoji:"✧",color:"#A06B3A",bg:"#FBF0E6"},
  {id:"finances",label:"Finances",emoji:"★",color:"#6B7A3A",bg:"#F2F5E6"},
];

const REACTIONS = [
  {id:"strength",emoji:"🌱",label:"Force"},
  {id:"spark",emoji:"⚡",label:"Inspirant"},
  {id:"heart",emoji:"🤍",label:"Avec toi"},
];

const LEVELS = [
  {min:0,label:"Apprenti·e",color:T.muted},
  {min:200,label:"Pratiquant·e",color:T.green},
  {min:500,label:"Confirmé·e",color:T.accent},
  {min:1000,label:"Expert·e",color:T.rose},
  {min:2000,label:"Inspiré·e",color:T.violet},
];

const BADGES = [
  {id:"b1",icon:"✦",label:"Premier pas",check:(s,t,k)=>s>=1},
  {id:"b2",icon:"⚡",label:"Lancé·e",check:(s,t,k)=>s>=5},
  {id:"b3",icon:"◎",label:"Alchimiste",check:(s,t,k)=>t>=1},
  {id:"b4",icon:"🔥",label:"7 jours",check:(s,t,k)=>k>=7},
  {id:"b5",icon:"★",label:"Inspiré·e",check:(s,t,k)=>s>=20},
];

const QUOTES = [
  {text:"Ce n'est pas ce qui nous arrive qui nous définit, mais ce que nous en faisons.",author:"Épictète"},
  {text:"Le secret du changement, c'est de concentrer son énergie à construire l'avenir.",author:"Socrate"},
  {text:"Tu as le pouvoir sur ton esprit, pas sur les événements extérieurs.",author:"Marc Aurèle"},
  {text:"Chaque matin nous naissons à nouveau. Ce que nous faisons aujourd'hui est ce qui compte.",author:"Bouddha"},
  {text:"La douleur est inévitable, la souffrance est optionnelle.",author:"Viktor Frankl"},
];

const OB_SLIDES = [
  {icon:"✦",title:"Bienvenue sur Winn.",sub:"L'espace où chaque action devient une victoire,\net chaque épreuve, une leçon.",color:T.accent},
  {icon:"⭐",title:"Une étoile par jour",sub:"Ajoute une entrée chaque jour\npour maintenir ta série.",color:T.gold},
  {icon:"◎",title:"Transforme l'adversité",sub:"Notre IA philosophique t'aide à trouver\nle sens dans les moments difficiles.",color:T.sage},
  {icon:"◉",title:"Ton cercle de confiance",sub:"Suis les avancées de tes amies,\nencourage-les et grandissez ensemble.",color:T.violet},
];

// ── Helpers ───────────────────────────────────────────────────────
function getLevel(xp){let l=LEVELS[0];for(const v of LEVELS)if(xp>=v.min)l=v;return l;}
function getNext(xp){for(const v of LEVELS)if(xp<v.min)return v;return null;}
function toDayStr(ts){const d=new Date(ts);return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;}
function todayStr(){return toDayStr(Date.now());}
function computeStreak(entries){
  if(!entries.length)return 0;
  const days=[...new Set(entries.map(e=>toDayStr(new Date(e.created_at).getTime())))].sort().reverse();
  const yesterday=toDayStr(Date.now()-864e5);
  if(days[0]!==todayStr()&&days[0]!==yesterday)return 0;
  let s=1;
  for(let i=1;i<days.length;i++){
    const a=new Date(days[i-1]),b=new Date(days[i]);
    if(Math.round((a-b)/864e5)===1)s++;else break;
  }
  return s;
}
function getWeekDays(){
  return Array.from({length:7},(_,i)=>{
    const d=new Date(Date.now()-(6-i)*864e5);
    return{str:toDayStr(d.getTime()),label:d.toLocaleDateString("fr-FR",{weekday:"short"}).slice(0,2),today:i===6};
  });
}

// ── Small UI ──────────────────────────────────────────────────────
function Toast({msg,on}){return <div style={{position:"fixed",bottom:88,left:"50%",transform:`translateX(-50%) translateY(${on?0:14}px)`,background:T.text,color:"#fff",padding:"10px 20px",borderRadius:40,fontFamily:"'DM Sans',sans-serif",fontSize:13,transition:"all .3s cubic-bezier(.34,1.4,.64,1)",opacity:on?1:0,zIndex:1000,pointerEvents:"none",boxShadow:"0 4px 20px rgba(0,0,0,.13)",whiteSpace:"nowrap"}}>{msg}</div>;}

function Confetti({trigger,colors}){
  const[dots,setDots]=useState([]);
  useEffect(()=>{
    if(!trigger)return;
    const p=colors||[T.accent,T.green,T.rose,T.violet,T.blue];
    const d=Array.from({length:20},(_,i)=>({id:Date.now()+i,x:20+Math.random()*60,color:p[i%p.length],size:5+Math.random()*7,dx:(Math.random()-.5)*160,dy:-(70+Math.random()*120),rot:Math.random()*360,round:Math.random()>.4}));
    setDots(d);setTimeout(()=>setDots([]),1400);
  },[trigger]);
  return <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:999}}>{dots.map(d=><div key={d.id} style={{position:"absolute",left:`${d.x}%`,top:"35%",width:d.size,height:d.size,background:d.color,borderRadius:d.round?"50%":"2px",animation:"burst 1.4s ease-out forwards","--dx":`${d.dx}px`,"--dy":`${d.dy}px`,"--rot":`${d.rot}deg`}}/>)}</div>;
}

function Toggle({on,onChange,label}){
  return <button onClick={()=>onChange(!on)} style={{display:"flex",alignItems:"center",gap:8,background:"none",border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:13,color:T.mid,padding:0}}>
    <div style={{width:38,height:21,borderRadius:11,background:on?T.text:T.border,position:"relative",transition:"background .22s",flexShrink:0}}>
      <div style={{position:"absolute",top:2.5,left:on?19:2.5,width:16,height:16,borderRadius:"50%",background:"#fff",transition:"left .22s",boxShadow:"0 1px 4px rgba(0,0,0,.18)"}}/>
    </div>
    <span>{label}</span>
  </button>;
}

function Av({name="?",size=38,color=T.accent}){
  const ini=name.trim().split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2);
  return <div style={{width:size,height:size,borderRadius:"50%",background:color+"18",border:`1.5px solid ${color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*.32,fontWeight:700,color,flexShrink:0,fontFamily:"'DM Sans',sans-serif"}}>{ini}</div>;
}

function StarDay({label,done,today,celebrate}){
  return <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:5}}>
    <div style={{width:today?42:34,height:today?42:34,borderRadius:"50%",background:done?`radial-gradient(circle at 35% 35%,#FFE87A,${T.gold})`:today?T.goldBg:T.soft,border:`${today?2:1.5}px solid ${done?T.gold:today?T.goldSoft:T.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:done?(today?22:17):12,transition:"all .4s",boxShadow:done&&today?`0 0 0 4px ${T.goldSoft},0 4px 20px ${T.gold}70`:done?`0 2px 12px ${T.gold}60`:"none",animation:celebrate&&today?"starBurst .6s":"none"}}>
      {done?<span style={{filter:today?"drop-shadow(0 0 4px #FFD700)":"none"}}>⭐</span>:<span style={{color:today?T.goldSoft:T.muted,fontSize:10}}>{today?"☆":"·"}</span>}
    </div>
    <span style={{fontSize:9,color:today?T.accent:T.muted,fontWeight:today?700:400,textTransform:"uppercase",letterSpacing:".04em"}}>{label}</span>
  </div>;
}

function EntryCard({e,onToggle,showToggle}){
  const isT=e.type==="transform";
  const cat=CATEGORIES.find(c=>c.id===e.cat);
  const color=isT?T.sage:(cat?.color||T.accent);
  const bg=isT?T.sageBg:(cat?.bg||T.accentBg);
  const dt=e.created_at?new Date(e.created_at).toLocaleDateString("fr-FR",{day:"2-digit",month:"short"}):"";
  return <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:18,padding:"15px 17px"}}>
    <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
      <div style={{width:34,height:34,borderRadius:10,background:bg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:13,color,fontWeight:700}}>{isT?"◎":(cat?.emoji||"✦")}</div>
      <div style={{flex:1,minWidth:0}}>
        {isT&&e.original&&<div style={{fontSize:11,color:T.muted,fontStyle:"italic",borderLeft:`2px solid ${T.border}`,paddingLeft:8,marginBottom:5,lineHeight:1.4}}>"{e.original.length>70?e.original.slice(0,70)+"…":e.original}"</div>}
        <div style={{fontSize:14,fontWeight:500,color:T.text,lineHeight:1.55}}>{e.text}</div>
        <div style={{display:"flex",gap:7,marginTop:7,alignItems:"center",flexWrap:"wrap"}}>
          <span style={{fontSize:11,color:T.muted}}>{dt}</span>
          <span style={{fontSize:10,fontWeight:600,color,background:bg,padding:"2px 7px",borderRadius:20}}>+{e.xp} XP</span>
          {showToggle&&<button onClick={()=>onToggle(e.id)} style={{fontSize:10,padding:"2px 8px",borderRadius:20,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",border:`1px solid ${e.is_public?T.text:T.border}`,background:e.is_public?T.text:"transparent",color:e.is_public?"#fff":T.muted,transition:"all .18s"}}>{e.is_public?"● Public":"○ Privé"}</button>}
        </div>
      </div>
    </div>
  </div>;
}


function FriendCommentBox({item,onComment}){
  const[open,setOpen]=useState(false);
  const[input,setInput]=useState("");
  return <div style={{borderTop:`1px solid ${T.border}`}}>
    <button onClick={()=>setOpen(v=>!v)} style={{width:"100%",padding:"9px 16px",background:"none",border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:12,color:T.muted,textAlign:"left",display:"flex",alignItems:"center",gap:6}}>
      💬 {item.comments?.length||0} commentaire{(item.comments?.length||0)>1?"s":""}
      <span style={{marginLeft:"auto",fontSize:10}}>{open?"▲":"▼"}</span>
    </button>
    {open&&<div style={{padding:"0 16px 12px"}}>
      {(item.comments||[]).map((c,i)=><div key={i} style={{marginBottom:8,paddingBottom:8,borderBottom:i<item.comments.length-1?`1px solid ${T.border}`:"none"}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
          <span style={{fontSize:12,fontWeight:600,color:T.text}}>{c.author_name||"?"}</span>
          <span style={{fontSize:10,color:T.muted}}>{new Date(c.created_at).toLocaleDateString("fr-FR")}</span>
        </div>
        <div style={{fontSize:13,color:T.mid,lineHeight:1.5}}>{c.text}</div>
      </div>)}
      <div style={{display:"flex",gap:7,marginTop:8}}>
        <input value={input} onChange={e=>setInput(e.target.value)} placeholder="Ajouter un commentaire…"
          onKeyDown={e=>{if(e.key==="Enter"&&input.trim()){onComment(item.id,input.trim());setInput("");}}}
          style={{flex:1,background:T.soft,border:`1px solid ${T.border}`,borderRadius:20,padding:"8px 14px",fontSize:13,fontFamily:"'DM Sans',sans-serif",color:T.text,outline:"none",resize:"none"}}/>
        <button onClick={()=>{if(input.trim()){onComment(item.id,input.trim());setInput("");}}} style={{background:T.text,color:"#fff",border:"none",borderRadius:20,padding:"8px 14px",fontSize:12,fontFamily:"'DM Sans',sans-serif",cursor:"pointer",fontWeight:600}}>→</button>
      </div>
    </div>}
  </div>;
}

function FeedCard({item,onReact,onComment,onAuthorTap}){
  const isT=item.type==="transform";
  const color=isT?T.sage:T.accent;
  const bg=isT?T.sageBg:T.accentBg;
  return <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:20,overflow:"hidden"}}>
    <div style={{display:"flex",alignItems:"center",gap:11,padding:"14px 17px 10px"}}>
      <button onClick={onAuthorTap} style={{background:"none",border:"none",cursor:"pointer",padding:0,display:"flex",alignItems:"center",gap:10,flex:1}}>
        <Av name={item.author_name||"?"} size={36} color={item.author_color||T.accent}/>
        <div style={{textAlign:"left"}}>
          <div style={{fontSize:13,fontWeight:600,color:T.text}}>{item.author_name}</div>
          <div style={{fontSize:11,color:T.muted}}>{item.author_level} · {new Date(item.created_at).toLocaleDateString("fr-FR",{day:"2-digit",month:"short"})}</div>
        </div>
      </button>
      <span style={{fontSize:9,fontWeight:700,color,background:bg,padding:"3px 9px",borderRadius:20,letterSpacing:".04em"}}>{isT?"TRANSFORMÉ":"SUCCÈS"}</span>
    </div>
    <div style={{padding:"0 17px 14px"}}>
      {isT&&item.original&&<div style={{fontSize:12,color:T.muted,fontStyle:"italic",borderLeft:`2px solid ${T.border}`,paddingLeft:10,marginBottom:8,lineHeight:1.5}}>"{item.original.length>65?item.original.slice(0,65)+"…":item.original}"</div>}
      <div style={{fontSize:14,color:T.text,lineHeight:1.6}}>{item.text}</div>
    </div>
    <div style={{borderTop:`1px solid ${T.border}`,padding:"10px 17px",display:"flex",gap:6,alignItems:"center"}}>
      {REACTIONS.map(r=>(
        <button key={r.id} onClick={()=>onReact(item.id,r.id)} style={{display:"flex",alignItems:"center",gap:5,background:T.soft,border:`1px solid ${T.border}`,borderRadius:20,padding:"5px 10px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:12,color:T.mid,transition:"all .15s"}}
          onMouseEnter={e=>{e.currentTarget.style.background=T.accentBg;e.currentTarget.style.borderColor=T.accent;}}
          onMouseLeave={e=>{e.currentTarget.style.background=T.soft;e.currentTarget.style.borderColor=T.border;}}>
          <span>{r.emoji}</span><span style={{fontWeight:600}}>{item.reactions?.[r.id]||0}</span>
        </button>
      ))}

    </div>
    {open&&<FriendCommentBox item={item} onComment={onComment}/>}
  </div>;
}

function Onboarding({onDone}){
  const[step,setStep]=useState(0);
  const slide=OB_SLIDES[step];
  const isLast=step===OB_SLIDES.length-1;
  return <div style={{position:"fixed",inset:0,background:T.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"space-between",padding:"60px 32px 50px",fontFamily:"'DM Sans',sans-serif",zIndex:2000}}>
    <button onClick={onDone} style={{alignSelf:"flex-end",background:"none",border:"none",cursor:"pointer",fontSize:13,color:T.muted}}>Passer</button>
    <div style={{textAlign:"center",flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
      <div style={{width:100,height:100,borderRadius:"50%",background:slide.color+"18",border:`2px solid ${slide.color}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:44,marginBottom:36,boxShadow:`0 8px 32px ${slide.color}25`}}>{slide.icon}</div>
      <div style={{fontFamily:"'DM Serif Display',serif",fontSize:26,color:T.text,marginBottom:16,lineHeight:1.25}}>{slide.title}</div>
      <div style={{fontSize:15,color:T.mid,lineHeight:1.75,textAlign:"center",maxWidth:300,whiteSpace:"pre-line"}}>{slide.sub}</div>
    </div>
    <div style={{width:"100%",display:"flex",flexDirection:"column",alignItems:"center",gap:20}}>
      <div style={{display:"flex",gap:7}}>{OB_SLIDES.map((_,i)=><div key={i} style={{width:i===step?20:7,height:7,borderRadius:4,background:i===step?slide.color:T.border,transition:"all .3s"}}/>)}</div>
      <button onClick={()=>isLast?onDone():setStep(s=>s+1)} style={{width:"100%",padding:"16px",background:slide.color,color:"#fff",border:"none",borderRadius:40,fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:16,cursor:"pointer",boxShadow:`0 4px 20px ${slide.color}50`}}>
        {isLast?"Commencer ✦":"Suivant →"}
      </button>
    </div>
  </div>;
}

// ── Auth ──────────────────────────────────────────────────────────
function AuthScreen({onAuth}){
  const[view,setView]=useState("signup");
  const[name,setName]=useState("");
  const[email,setEmail]=useState("");
  const[pass,setPass]=useState("");
  const[error,setError]=useState("");
  const[loading,setLoading]=useState(false);

  const submit=async()=>{
    setError("");
    if(!email.trim()||!pass.trim()){setError("Remplis tous les champs.");return;}
    if(view==="signup"&&!name.trim()){setError("Entre ton prénom.");return;}
    if(pass.trim().length<6){setError("Mot de passe trop court (6 caractères min.)");return;}
    setLoading(true);
    try{
      if(view==="signup"){
        const res=await sb("/auth/v1/signup",{method:"POST",body:JSON.stringify({email:email.trim(),password:pass.trim(),data:{name:name.trim()}})});
        if(res?.error){setError(res.error.message);setLoading(false);return;}
        if(res?.access_token){onAuth(res,name.trim());return;}
        // Try direct login
        const login=await sb("/auth/v1/token?grant_type=password",{method:"POST",body:JSON.stringify({email:email.trim(),password:pass.trim()})});
        if(login?.access_token){onAuth(login,name.trim());return;}
        setError("Compte créé ! Connecte-toi.");setView("login");
      } else {
        const res=await sb("/auth/v1/token?grant_type=password",{method:"POST",body:JSON.stringify({email:email.trim(),password:pass.trim()})});
        if(res?.error||!res?.access_token){setError("Email ou mot de passe incorrect.");setLoading(false);return;}
        onAuth(res,null);
      }
    }catch{setError("Erreur réseau. Réessaie.");}
    setLoading(false);
  };

  const iStyle={marginBottom:14,borderRadius:14,padding:"13px 15px",width:"100%",background:T.soft,border:`1.5px solid ${T.border}`,color:T.text,fontFamily:"'DM Sans',sans-serif",fontSize:15,outline:"none"};

  return <div style={{minHeight:"100vh",background:T.bg,fontFamily:"'DM Sans',sans-serif",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"32px 24px"}}>
    <div style={{width:"100%",maxWidth:380}}>
      <div style={{textAlign:"center",marginBottom:36}}>
        <div style={{fontFamily:"'DM Serif Display',serif",fontSize:36,color:T.text,letterSpacing:"-.5px"}}>Winn<span style={{color:T.accent}}>.</span></div>
        <div style={{fontSize:13,color:T.muted,marginTop:6}}>Célèbre chaque victoire. Transforme chaque épreuve.</div>
      </div>

      <div style={{display:"flex",background:T.soft,borderRadius:14,padding:4,marginBottom:24,gap:4}}>
        {[{id:"signup",label:"S'inscrire"},{id:"login",label:"Se connecter"}].map(t=>(
          <button key={t.id} onClick={()=>{setView(t.id);setError("");}} style={{flex:1,padding:"10px",borderRadius:11,border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:13,background:view===t.id?T.card:"transparent",color:view===t.id?T.text:T.muted,boxShadow:view===t.id?"0 1px 6px rgba(0,0,0,.07)":"none",transition:"all .2s"}}>{t.label}</button>
        ))}
      </div>

      {view==="signup"&&<>
        <div style={{fontSize:11,fontWeight:600,color:T.mid,letterSpacing:".04em",marginBottom:8}}>TON PRÉNOM</div>
        <input placeholder="Sophie" value={name} onChange={e=>setName(e.target.value)} style={iStyle} onKeyDown={e=>{if(e.key==="Enter")submit();}}/>
      </>}

      <div style={{fontSize:11,fontWeight:600,color:T.mid,letterSpacing:".04em",marginBottom:8}}>EMAIL</div>
      <input placeholder="ton@email.com" value={email} onChange={e=>setEmail(e.target.value)} style={iStyle} onKeyDown={e=>{if(e.key==="Enter")submit();}}/>

      <div style={{fontSize:11,fontWeight:600,color:T.mid,letterSpacing:".04em",marginBottom:8}}>MOT DE PASSE</div>
      <input type="password" placeholder="minimum 6 caractères" value={pass} onChange={e=>setPass(e.target.value)} style={{...iStyle,marginBottom:error?12:24}} onKeyDown={e=>{if(e.key==="Enter")submit();}}/>

      {error&&<div style={{fontSize:13,color:T.rose,marginBottom:16,textAlign:"center",lineHeight:1.5}}>{error}</div>}

      <button onClick={submit} disabled={loading} style={{width:"100%",padding:"16px",background:T.text,color:"#fff",border:"none",borderRadius:40,fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:15,cursor:"pointer",opacity:loading?.6:1}}>
        {loading?"Chargement…":view==="signup"?"Créer mon compte ✦":"Se connecter ✦"}
      </button>

      <div style={{fontSize:11,color:T.muted,textAlign:"center",marginTop:20,lineHeight:1.6}}>Tes données sont privées.<br/>Tu choisis ce que tu partages.</div>
    </div>
  </div>;
}

// ── App ───────────────────────────────────────────────────────────
export default function App(){
  const[session,setSession]=useState(()=>{try{const s=JSON.parse(localStorage.getItem("winn_sess")||"null");return s?.access_token&&s?.user?s:null;}catch{return null;}});
  const[profile,setProfile]=useState(null);
  const[onboarded,setOnboarded]=useState(()=>localStorage.getItem("winn_ob")==="1");
  const[entries,setEntries]=useState([]);
  const[feed,setFeed]=useState([]);
  const[xp,setXp]=useState(0);
  const[badges,setBadges]=useState([]);
  const[tab,setTab]=useState("home");
  const[addMode,setAddMode]=useState("success");
  const[addText,setAddText]=useState("");
  const[addCat,setAddCat]=useState("travail");
  const[addPublic,setAddPublic]=useState(false);
  const[rfStep,setRfStep]=useState(0);
  const[rfInput,setRfInput]=useState("");
  const[rfAngles,setRfAngles]=useState([]);
  const[rfChosen,setRfChosen]=useState(null);
  const[rfEdit,setRfEdit]=useState("");
  const[rfCat,setRfCat]=useState("esprit");
  const[rfPublic,setRfPublic]=useState(false);
  const[histTab,setHistTab]=useState("history");
  const[histSearch,setHistSearch]=useState("");
  const[histCat,setHistCat]=useState("all");
  const[cercleSub,setCercleSub]=useState("feed");
  const[portrait,setPortrait]=useState(null);
  const[portStep,setPortStep]=useState(0);
  const[confetti,setConfetti]=useState(0);
  const[confColors,setConfColors]=useState(null);
  const[toast,setToast]=useState({msg:"",on:false});
  const[starCelebrate,setStarCelebrate]=useState(false);
  const[showInvite,setShowInvite]=useState(false);
  const[friendView,setFriendView]=useState(null); // {name, color, entries}

  const textRef=useRef(),rfRef=useRef(),editRef=useRef();
  const token=session?.access_token;
  const userId=session?.user?.id;

  useEffect(()=>{if(session)localStorage.setItem("winn_sess",JSON.stringify(session));else localStorage.removeItem("winn_sess");},[session]);
  useEffect(()=>{if(onboarded)localStorage.setItem("winn_ob","1");},[onboarded]);

  const toast_=msg=>{setToast({msg,on:true});setTimeout(()=>setToast(t=>({...t,on:false})),2600);};

  // Load on login
  useEffect(()=>{
    if(!token||!userId)return;
    (async()=>{
      const profs=await sb(`/rest/v1/profiles?id=eq.${userId}`,{},token);
      if(Array.isArray(profs)&&profs[0]){const p=profs[0];setProfile({name:p.name,bio:p.bio||""});setXp(p.xp||0);setBadges(p.badges||[]);}
      const ents=await sb(`/rest/v1/entries?user_id=eq.${userId}&order=created_at.desc`,{},token);
      if(Array.isArray(ents))setEntries(ents);
    })();
  },[token,userId]);

  // Load feed
  useEffect(()=>{
    if(!token)return;
    (async()=>{
      const ents=await sb(`/rest/v1/entries?is_public=eq.true&order=created_at.desc&limit=30`,{},token);
      if(!Array.isArray(ents)||!ents.length)return;
      const uids=[...new Set(ents.map(e=>e.user_id))];
      const profs=await sb(`/rest/v1/profiles?id=in.(${uids.join(",")})`,{},token);
      const pm={};if(Array.isArray(profs))profs.forEach(p=>{pm[p.id]=p;});
      const eids=ents.map(e=>e.id);
      const reacts=await sb(`/rest/v1/reactions?entry_id=in.(${eids.join(",")})`,{},token);
      const comms=await sb(`/rest/v1/comments?entry_id=in.(${eids.join(",")})&order=created_at.asc`,{},token);
      const cuids=[...new Set((Array.isArray(comms)?comms:[]).map(c=>c.user_id))];
      let cp={};
      if(cuids.length){const r=await sb(`/rest/v1/profiles?id=in.(${cuids.join(",")})`,{},token);if(Array.isArray(r))r.forEach(p=>{cp[p.id]=p;});}
      const colors=[T.rose,T.blue,T.violet,T.green,T.accent,T.sage];
      setFeed(ents.map(e=>{
        const a=pm[e.user_id]||{name:"?",xp:0};
        const er=Array.isArray(reacts)?reacts.filter(r=>r.entry_id===e.id):[];
        const ec=Array.isArray(comms)?comms.filter(c=>c.entry_id===e.id):[];
        const rx={strength:0,spark:0,heart:0};er.forEach(r=>{rx[r.type]=(rx[r.type]||0)+1;});
        return{...e,author_name:a.name,author_level:getLevel(a.xp||0).label,author_color:colors[a.name.charCodeAt(0)%colors.length],reactions:rx,comments:ec.map(c=>({...c,author_name:(cp[c.user_id]||{name:"?"}).name}))};
      }));
    })();
  },[token]);

  const handleAuth=async(sess,nameFromSignup)=>{
    setSession(sess);
    if(nameFromSignup){
      const initials=nameFromSignup.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2);
      await sb(`/rest/v1/profiles?id=eq.${sess.user.id}`,{method:"PATCH",body:JSON.stringify({name:nameFromSignup,avatar:initials})},sess.access_token);
      setProfile({name:nameFromSignup,bio:""});
    }
  };

  const handleSignOut=()=>{setSession(null);setProfile(null);setEntries([]);setXp(0);setBadges([]);};

  const saveEntry=async(entry)=>{
    const wasFirst=!entries.some(e=>toDayStr(new Date(e.created_at).getTime())===todayStr());
    const ts=new Date().toISOString();
    const newE=[{...entry,created_at:ts},...entries];
    const newXp=xp+entry.xp;
    const sc=newE.filter(e=>e.type==="success").length,tc=newE.filter(e=>e.type==="transform").length,sk=computeStreak(newE);
    let nb=[...badges],bm="";
    for(const b of BADGES)if(!nb.includes(b.id)&&b.check(sc,tc,sk)){nb.push(b.id);bm=`${b.icon} Badge : ${b.label} !`;}
    setEntries(newE);setXp(newXp);setBadges(nb);
    if(wasFirst){setConfColors([T.gold,"#F5C842",T.accent,"#FDEFC3","#fff"]);setStarCelebrate(true);setTimeout(()=>setStarCelebrate(false),2200);toast_("⭐ Étoile du jour gagnée !");}
    else{setConfColors(null);toast_(bm||`+${entry.xp} XP · Enregistré ✦`);}
    setConfetti(n=>n+1);
    if(bm&&wasFirst)setTimeout(()=>toast_(bm),2800);
    if(token&&userId){
      try{
        const ins=await sb("/rest/v1/entries",{method:"POST",body:JSON.stringify({user_id:userId,type:entry.type,text:entry.text,original:entry.original||"",cat:entry.cat,is_public:entry.is_public,xp:entry.xp})},token);
        await sb(`/rest/v1/profiles?id=eq.${userId}`,{method:"PATCH",body:JSON.stringify({xp:newXp,badges:nb})},token);
        if(entry.is_public&&Array.isArray(ins)&&ins[0]){
          const colors=[T.rose,T.blue,T.violet,T.green,T.accent,T.sage];
          const pn=profile?.name||"Moi";
          setFeed(f=>[{...ins[0],author_name:pn,author_level:getLevel(newXp).label,author_color:colors[pn.charCodeAt(0)%colors.length],reactions:{strength:0,spark:0,heart:0},comments:[]},...f]);
        }
      }catch(e){console.error(e);}
    }
  };

  const addSuccess=()=>{if(!addText.trim())return;saveEntry({type:"success",text:addText.trim(),cat:addCat,is_public:addPublic,xp:40});setAddText("");setAddPublic(false);setAddCat("travail");setTab("home");};

  const callAI=async()=>{
    if(!rfInput.trim())return;setRfStep(1);
    try{
      const prompt="Tu es un guide philosophique bienveillant.\n\nQuelqu'un te confie : \""+rfInput+"\"\n\nPropose 3 angles de transformation (2-3 phrases). Angle 1 : force. Angle 2 : sagesse. Angle 3 : opportunité.\n\nRéponds UNIQUEMENT en JSON : [{\"titre\":\"...\",\"texte\":\"...\"},{\"titre\":\"...\",\"texte\":\"...\"},{\"titre\":\"...\",\"texte\":\"...\"}]";
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json","anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,messages:[{role:"user",content:prompt}]})});
      const data=await res.json();
      if(data.error)throw new Error(data.error.message);
      const raw=data.content.map(b=>b.text||"").join("").replace(/```json|```/g,"").trim();
      const parsed=JSON.parse(raw.startsWith("[")? raw : raw.replace(/^[^[]*(\[.*\])[^]]*$/s,"$1"));
      setRfAngles(parsed);setRfStep(2);
    }catch(e){console.error(e);setRfStep(0);toast_("Erreur · Réessaie");}
  };

  const saveTransform=()=>{
    if(!rfEdit.trim())return;
    saveEntry({type:"transform",text:rfEdit.trim(),original:rfInput,cat:rfCat,is_public:rfPublic,xp:60});
    setRfInput("");setRfAngles([]);setRfChosen(null);setRfEdit("");setRfStep(0);setRfPublic(false);setRfCat("esprit");setAddMode("success");setTab("home");
  };

  const handleReact=async(eid,type)=>{
    setFeed(f=>f.map(i=>i.id!==eid?i:{...i,reactions:{...i.reactions,[type]:(i.reactions[type]||0)+1}}));
    toast_("Réaction envoyée");
    if(token&&userId)await sb("/rest/v1/reactions",{method:"POST",body:JSON.stringify({entry_id:eid,user_id:userId,type})},token).catch(()=>{});
  };

  const handleComment=async(eid,text)=>{
    const nc={author_name:profile?.name||"Moi",text,created_at:new Date().toISOString()};
    setFeed(f=>f.map(i=>i.id!==eid?i:{...i,comments:[...(i.comments||[]),nc]}));
    if(token&&userId)await sb("/rest/v1/comments",{method:"POST",body:JSON.stringify({entry_id:eid,user_id:userId,text})},token).catch(()=>{});
  };

  const togglePublic=async(eid)=>{
    const e=entries.find(x=>x.id===eid);if(!e)return;
    const np=!e.is_public;
    setEntries(prev=>prev.map(x=>x.id===eid?{...x,is_public:np}:x));
    if(token)await sb(`/rest/v1/entries?id=eq.${eid}`,{method:"PATCH",body:JSON.stringify({is_public:np})},token).catch(()=>{});
  };

  const callPortrait=async()=>{
    if(entries.length<3){toast_("Ajoute au moins 3 entrées d'abord");return;}
    setPortStep(1);
    try{
      const sample=entries.slice(0,15).map(e=>`[${e.type==="transform"?"Transformation":"Succès"}] ${e.type==="transform"?"(Épreuve: "+(e.original||"")+") → ":""}${e.text}`).join("\n");
      const prompt="Psychologue humaniste bienveillant. Analyse ces entrées et crée un portrait.\n\nEntrées:\n"+sample+"\n\nRéponds UNIQUEMENT en JSON : {\"titre\":\"...\",\"resume\":\"...\",\"forces\":[\"...\",\"...\",\"...\"],\"pattern\":\"...\",\"invitation\":\"...\"}";
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json","anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,messages:[{role:"user",content:prompt}]})});
      const data=await res.json();
      if(data.error)throw new Error(data.error.message);
      const raw=data.content.map(b=>b.text||"").join("").replace(/```json|```/g,"").trim();
      setPortrait(JSON.parse(raw.replace(/^[^{]*/,"").replace(/[^}]*$/,"")));
      setPortStep(2);
    }catch(e){console.error(e);setPortStep(0);toast_("Erreur · Réessaie");}
  };

  // Computed
  const level=getLevel(xp),next=getNext(xp),pct=next?((xp-level.min)/(next.min-level.min))*100:100;
  const streak=computeStreak(entries);
  const weekDays=getWeekDays();
  const weekStars=weekDays.map(d=>({...d,done:entries.some(e=>toDayStr(new Date(e.created_at).getTime())===d.str)}));
  const doneToday=entries.some(e=>toDayStr(new Date(e.created_at).getTime())===todayStr());
  const thisWeek=entries.filter(e=>new Date(e.created_at)>new Date(Date.now()-7*864e5));
  const todayQuote=QUOTES[new Date().getDate()%QUOTES.length];
  const todayPrompt=["Qu'est-ce qui s'est bien passé aujourd'hui ?","Quelle décision courageuse as-tu prise ?","Quel obstacle as-tu surmonté ?","Qu'as-tu appris sur toi-même ?","Quel moment t'a rendu·e fier·e ?"][new Date().getDate()%5];

  if(!session)return <AuthScreen onAuth={handleAuth}/>;
  if(!onboarded)return <Onboarding onDone={()=>setOnboarded(true)}/>;

  const CatChips=({sel,onSel})=><div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:16}}>{CATEGORIES.map(c=><button key={c.id} onClick={()=>onSel(c.id)} style={{padding:"6px 12px",borderRadius:40,border:`1.5px solid ${sel===c.id?c.color:T.border}`,background:sel===c.id?c.bg:"transparent",color:sel===c.id?c.color:T.muted,fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:sel===c.id?600:400,cursor:"pointer",transition:"all .18s",whiteSpace:"nowrap",display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:9}}>{c.emoji}</span>{c.label}</button>)}</div>;

  const taStyle={marginBottom:14,borderRadius:14,padding:"13px 15px",width:"100%",background:T.soft,border:`1.5px solid ${T.border}`,color:T.text,fontFamily:"'DM Sans',sans-serif",fontSize:15,outline:"none",resize:"none",lineHeight:1.65};

  return <>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600;700&display=swap');
      *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
      body{background:${T.bg};-webkit-font-smoothing:antialiased}
      @keyframes burst{0%{transform:translate(0,0) rotate(0) scale(1);opacity:1}100%{transform:translate(var(--dx),var(--dy)) rotate(var(--rot)) scale(.15);opacity:0}}
      @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
      @keyframes slideUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
      @keyframes spin{to{transform:rotate(360deg)}}
      @keyframes starBurst{0%{transform:scale(1)}30%{transform:scale(1.5) rotate(-10deg)}60%{transform:scale(.9) rotate(5deg)}100%{transform:scale(1) rotate(0)}}
      .btn{border:none;border-radius:40px;font-family:'DM Sans',sans-serif;font-weight:600;font-size:15px;cursor:pointer;transition:all .2s;padding:15px}
      .btn-dark{background:${T.text};color:#fff}.btn-dark:hover{background:#2a2920;transform:translateY(-1px)}.btn-dark:disabled{opacity:.3;cursor:not-allowed;transform:none}
      .btn-sage{background:${T.sage};color:#fff}.btn-sage:hover{background:#4d6b5f;transform:translateY(-1px)}.btn-sage:disabled{opacity:.3;cursor:not-allowed;transform:none}
      .btn-outline{background:transparent;color:${T.mid};border:1.5px solid ${T.border}}.btn-outline:hover{border-color:${T.mid};color:${T.text}}
      .angle{background:${T.card};border:1.5px solid ${T.border};border-radius:16px;padding:18px;cursor:pointer;transition:all .2s;margin-bottom:10px}
      .angle:hover{border-color:${T.sage};background:${T.sageBg};transform:translateY(-2px)}
      .tab{flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;background:none;border:none;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:9px;letter-spacing:.03em;transition:color .2s;padding:10px 4px 0}
      ::-webkit-scrollbar{width:0}
    `}</style>

    <Confetti trigger={confetti} colors={confColors}/>
    <Toast msg={toast.msg} on={toast.on}/>

    <div style={{minHeight:"100vh",background:T.bg,fontFamily:"'DM Sans',sans-serif",display:"flex",flexDirection:"column",alignItems:"center"}}>

      {/* Header */}
      <header style={{width:"100%",maxWidth:440,padding:"30px 22px 0",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div>
          <div style={{fontFamily:"'DM Serif Display',serif",fontSize:26,color:T.text,letterSpacing:"-.5px"}}>Winn<span style={{color:T.accent}}>.</span></div>
          <div style={{fontSize:11,color:T.muted,marginTop:1}}>{level.label}{profile?.name?` · ${profile.name}`:""}</div>
        </div>
        <div style={{background:T.accentBg,border:`1px solid ${T.accentSoft}`,borderRadius:40,padding:"8px 16px",display:"flex",alignItems:"center",gap:10}}>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:16,fontWeight:700,color:T.text,lineHeight:1}}>{xp} <span style={{fontSize:10,color:T.muted}}>XP</span></div>
            {next&&<div style={{fontSize:9,color:T.muted,marginTop:2}}>{next.min-xp} → {next.label}</div>}
          </div>
          <div style={{width:4,height:32,background:T.accentSoft,borderRadius:4,overflow:"hidden"}}>
            <div style={{width:"100%",height:`${pct}%`,background:T.accent,borderRadius:4,transition:"height .8s",marginTop:`${100-pct}%`}}/>
          </div>
        </div>
      </header>

      <main style={{width:"100%",maxWidth:440,padding:"20px 22px 96px",flex:1}}>

        {/* HOME */}
        {tab==="home"&&<div style={{animation:"fadeIn .3s ease"}}>
          <div style={{background:streak>0?`linear-gradient(135deg,${T.goldBg},#FFFDF5)`:T.card,border:`1px solid ${streak>0?T.goldSoft:T.border}`,borderRadius:22,padding:"20px 22px",marginBottom:12}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
              <div>
                <div style={{fontSize:11,color:T.muted,letterSpacing:".04em",textTransform:"uppercase",marginBottom:3}}>Série en cours</div>
                <div style={{display:"flex",alignItems:"baseline",gap:6}}>
                  <span style={{fontFamily:"'DM Serif Display',serif",fontSize:40,lineHeight:1,color:streak>0?T.gold:T.muted}}>{streak}</span>
                  <span style={{fontSize:14,color:T.muted}}>jour{streak>1?"s":""}</span>
                </div>
              </div>
              <div style={{width:52,height:52,borderRadius:"50%",background:doneToday?T.gold:T.soft,border:`2px solid ${doneToday?T.gold:T.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,transition:"all .4s"}}>{doneToday?"⭐":"☆"}</div>
            </div>
            <div style={{display:"flex",justifyContent:"space-between"}}>{weekStars.map((s,i)=><StarDay key={i} {...s} celebrate={starCelebrate}/>)}</div>
            <div style={{marginTop:14,fontSize:12,color:doneToday?T.accent:T.muted,textAlign:"center",fontStyle:"italic"}}>
              {doneToday?`✦ Étoile gagnée${streak>=7?` · ${streak} jours 🔥`:""}`:streak>0?`Continue ta série · ajoute une entrée`:"Commence ta série · une entrée suffit"}
            </div>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
            <button className="btn btn-dark" onClick={()=>{setAddMode("success");setTab("add");setTimeout(()=>textRef.current?.focus(),100);}}>+ Succès</button>
            <button className="btn btn-sage" onClick={()=>{setAddMode("transform");setRfStep(0);setTab("add");setTimeout(()=>rfRef.current?.focus(),100);}}>◎ Transformer</button>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:9,marginBottom:14}}>
            {[{val:entries.filter(e=>e.type==="success").length,label:"Succès",color:T.accent,bg:T.accentBg},{val:entries.filter(e=>e.type==="transform").length,label:"Transf.",color:T.sage,bg:T.sageBg},{val:badges.length,label:"Badges",color:T.violet,bg:T.violetBg}].map(s=>(
              <div key={s.label} style={{background:s.bg,border:`1px solid ${s.color}20`,borderRadius:14,padding:"12px"}}>
                <div style={{fontFamily:"'DM Serif Display',serif",fontSize:24,color:T.text}}>{s.val}</div>
                <div style={{fontSize:10,color:T.muted,marginTop:1}}>{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{fontSize:12,fontWeight:600,color:T.mid,letterSpacing:".03em",marginBottom:10}}>RÉCENT</div>
          {entries.length===0?(
            <div>
              <div style={{background:"linear-gradient(135deg,#FFFDF8,#FDF6E8)",border:`1px solid ${T.accentSoft}`,borderRadius:18,padding:"22px",marginBottom:12}}>
                <div style={{fontSize:10,color:T.accent,fontWeight:700,letterSpacing:".08em",marginBottom:10}}>SAGESSE DU JOUR</div>
                <div style={{fontFamily:"'DM Serif Display',serif",fontStyle:"italic",fontSize:15,color:T.text,lineHeight:1.7,marginBottom:8}}>"{todayQuote.text}"</div>
                <div style={{fontSize:11,color:T.muted}}>— {todayQuote.author}</div>
              </div>
              <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:18,padding:"20px 22px"}}>
                <div style={{fontSize:10,color:T.mid,fontWeight:700,letterSpacing:".08em",marginBottom:10}}>POUR COMMENCER</div>
                <div style={{fontFamily:"'DM Serif Display',serif",fontSize:16,color:T.text,lineHeight:1.5,marginBottom:16}}>{todayPrompt}</div>
                <button className="btn btn-dark" onClick={()=>{setAddMode("success");setTab("add");setTimeout(()=>textRef.current?.focus(),100);}} style={{width:"100%",padding:"13px",fontSize:14}}>Répondre · +40 XP</button>
              </div>
            </div>
          ):(
            <div style={{display:"flex",flexDirection:"column",gap:9}}>
              {entries.slice(0,5).map(e=><EntryCard key={e.id} e={e} showToggle onToggle={togglePublic}/>)}
            </div>
          )}
        </div>}

        {/* ADD */}
        {tab==="add"&&<div style={{animation:"fadeIn .3s ease"}}>
          <div style={{display:"flex",background:T.soft,borderRadius:14,padding:4,marginBottom:24,gap:4}}>
            {[{id:"success",label:"✦ Succès"},{id:"transform",label:"◎ Transformer"}].map(m=>(
              <button key={m.id} onClick={()=>{setAddMode(m.id);if(m.id==="success")setTimeout(()=>textRef.current?.focus(),80);else{setRfStep(0);setTimeout(()=>rfRef.current?.focus(),80);}}} style={{flex:1,padding:"10px",borderRadius:11,border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:13,background:addMode===m.id?T.card:"transparent",color:addMode===m.id?T.text:T.muted,boxShadow:addMode===m.id?"0 1px 6px rgba(0,0,0,.07)":"none",transition:"all .2s"}}>{m.label}</button>
            ))}
          </div>

          {addMode==="success"&&<>
            <div style={{fontFamily:"'DM Serif Display',serif",fontSize:22,marginBottom:4}}>Ton succès du jour</div>
            <div style={{fontSize:13,color:T.muted,marginBottom:18}}>{!doneToday?"✦ Une entrée suffit pour gagner ton étoile.":"⭐ Étoile déjà gagnée · continue !"}</div>
            <textarea ref={textRef} rows={5} placeholder="Ex : J'ai tenu mes résolutions ce matin…" value={addText} onChange={e=>setAddText(e.target.value)} onKeyDown={e=>{if((e.metaKey||e.ctrlKey)&&e.key==="Enter")addSuccess();}} style={taStyle}/>
            <div style={{fontSize:11,fontWeight:600,color:T.mid,letterSpacing:".04em",marginBottom:10}}>CATÉGORIE</div>
            <CatChips sel={addCat} onSel={setAddCat}/>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}>
              <Toggle on={addPublic} onChange={setAddPublic} label={addPublic?"Visible par mon cercle":"Privé"}/>
              <span style={{fontSize:11,color:T.muted}}>⌘↵ valider</span>
            </div>
            <div style={{display:"flex",gap:9}}>
              <button className="btn btn-outline" onClick={()=>setTab("home")} style={{padding:"14px 18px"}}>←</button>
              <button className="btn btn-dark" onClick={addSuccess} style={{flex:1}} disabled={!addText.trim()}>Valider · +40 XP</button>
            </div>
          </>}

          {addMode==="transform"&&<>
            <div style={{fontFamily:"'DM Serif Display',serif",fontSize:22,marginBottom:4}}>Transformer</div>
            <div style={{fontSize:13,color:T.muted,marginBottom:22,lineHeight:1.65}}>
              Partage une épreuve et ce qu'elle t'apporte.<br/>
              <span style={{fontStyle:"italic"}}>Chaque difficulté contient quelque chose.</span>
            </div>

            {/* Step indicator */}
            <div style={{display:"flex",gap:8,marginBottom:20,alignItems:"center"}}>
              {[{n:1,label:"L'épreuve"},{n:2,label:"Ce que ça m'apporte"}].map((s,i)=>(
                <React.Fragment key={s.n}>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <div style={{width:24,height:24,borderRadius:"50%",background:rfStep>=i?T.sage:T.soft,border:`1.5px solid ${rfStep>=i?T.sage:T.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:rfStep>=i?"#fff":T.muted,transition:"all .3s"}}>{s.n}</div>
                    <span style={{fontSize:11,color:rfStep>=i?T.sage:T.muted,fontWeight:rfStep>=i?600:400}}>{s.label}</span>
                  </div>
                  {i===0&&<div style={{flex:1,height:1,background:rfStep>=1?T.sage:T.border,transition:"background .3s"}}/>}
                </React.Fragment>
              ))}
            </div>

            {rfStep===0&&<>
              <div style={{fontSize:11,fontWeight:600,color:T.mid,letterSpacing:".04em",marginBottom:8}}>CE QUI S'EST PASSÉ</div>
              <textarea ref={rfRef} rows={5}
                placeholder="Ex : J'ai raté une opportunité importante. Je me sentais prête mais ça ne s'est pas passé comme prévu…"
                value={rfInput} onChange={e=>setRfInput(e.target.value)}
                style={{...taStyle,borderColor:rfInput?T.sage:T.border}}/>
              <div style={{display:"flex",gap:9,marginTop:6}}>
                <button className="btn btn-outline" onClick={()=>setTab("home")} style={{padding:"14px 18px"}}>←</button>
                <button className="btn btn-sage" onClick={()=>setRfStep(1)} style={{flex:1}} disabled={!rfInput.trim()}>
                  Suite → Ce que ça m'apporte
                </button>
              </div>
            </>}

            {rfStep===1&&<>
              {/* Reminder of what happened */}
              <div style={{background:T.sageBg,border:`1px solid ${T.sageSoft}`,borderRadius:12,padding:"12px 14px",marginBottom:18,fontSize:12,color:T.sage,lineHeight:1.6,fontStyle:"italic"}}>
                "{rfInput.length>100?rfInput.slice(0,100)+"…":rfInput}"
              </div>

              <div style={{fontSize:11,fontWeight:600,color:T.mid,letterSpacing:".04em",marginBottom:8}}>CE QUE ÇA M'APPORTE</div>
              <div style={{fontSize:12,color:T.muted,marginBottom:12,lineHeight:1.6}}>
                Une leçon, une force découverte, une porte qui s'ouvre…<br/>À toi de trouver ce qui résonne.
              </div>
              <textarea ref={editRef} rows={5}
                placeholder="Ex : Cet échec m'a appris que je me mets trop de pression. J'ai découvert une résilience que je ne connaissais pas…"
                value={rfEdit} onChange={e=>setRfEdit(e.target.value)}
                style={{...taStyle,borderColor:rfEdit?T.sage:T.border}}/>

              <div style={{fontSize:11,fontWeight:600,color:T.mid,letterSpacing:".04em",marginBottom:10,marginTop:14}}>CATÉGORIE</div>
              <CatChips sel={rfCat} onSel={setRfCat}/>

              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}>
                <Toggle on={rfPublic} onChange={setRfPublic} label={rfPublic?"Visible par mon cercle":"Privé"}/>
                <span style={{fontSize:11,color:T.sage,fontWeight:600}}>+60 XP</span>
              </div>
              <div style={{display:"flex",gap:9}}>
                <button className="btn btn-outline" onClick={()=>setRfStep(0)} style={{padding:"14px 18px"}}>←</button>
                <button className="btn btn-sage" onClick={saveTransform} style={{flex:1}} disabled={!rfEdit.trim()}>
                  Enregistrer · +60 XP
                </button>
              </div>
            </>}
          </>}
        </div>}

        {/* JOURNAL */}
        {tab==="journal"&&<div style={{animation:"fadeIn .3s ease"}}>
          <div style={{display:"flex",background:T.soft,borderRadius:14,padding:4,marginBottom:22,gap:4}}>
            {[{id:"history",label:"Historique"},{id:"week",label:"Semaine"},{id:"portrait",label:"Portrait IA"}].map(s=>(
              <button key={s.id} onClick={()=>setHistTab(s.id)} style={{flex:1,padding:"9px 4px",borderRadius:11,border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:11,background:histTab===s.id?T.card:"transparent",color:histTab===s.id?T.text:T.muted,boxShadow:histTab===s.id?"0 1px 6px rgba(0,0,0,.07)":"none",transition:"all .2s"}}>{s.label}</button>
            ))}
          </div>

          {histTab==="history"&&<>
            <input placeholder="Rechercher…" value={histSearch} onChange={e=>setHistSearch(e.target.value)} style={{marginBottom:12,borderRadius:40,padding:"10px 18px",fontSize:13,width:"100%",background:T.soft,border:`1.5px solid ${T.border}`,color:T.text,fontFamily:"'DM Sans',sans-serif",outline:"none"}}/>
            <div style={{display:"flex",gap:5,marginBottom:12,overflowX:"auto",paddingBottom:2}}>
              {[{id:"all",label:"Tout"},{id:"success",label:"✦ Succès"},{id:"transform",label:"◎ Transf."},...CATEGORIES].map(f=>(
                <button key={f.id} onClick={()=>setHistCat(f.id)} style={{padding:"5px 11px",borderRadius:40,flexShrink:0,border:`1.5px solid ${histCat===f.id?(f.color||T.text):T.border}`,background:histCat===f.id?(f.bg||(f.id==="all"||f.id==="success"||f.id==="transform"?T.text:"transparent")):"transparent",color:histCat===f.id?(f.bg?f.color:"#fff"):T.muted,fontFamily:"'DM Sans',sans-serif",fontSize:11,cursor:"pointer",fontWeight:histCat===f.id?600:400,whiteSpace:"nowrap"}}>
                  {f.emoji?`${f.emoji} `:""}{f.label}
                </button>
              ))}
            </div>
            {(()=>{
              const fil=entries.filter(e=>{
                const mt=histCat==="all"?true:histCat==="success"?e.type==="success":histCat==="transform"?e.type==="transform":e.cat===histCat;
                const ms=!histSearch.trim()||e.text.toLowerCase().includes(histSearch.toLowerCase())||(e.original||"").toLowerCase().includes(histSearch.toLowerCase());
                return mt&&ms;
              });
              return fil.length===0
                ?<div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:18,padding:"36px 22px",textAlign:"center"}}>
                  <div style={{fontSize:26,marginBottom:10,color:T.muted}}>📖</div>
                  <div style={{fontFamily:"'DM Serif Display',serif",fontSize:17,marginBottom:8}}>{entries.length===0?"Ton journal t'attend":"Aucun résultat"}</div>
                  {entries.length===0&&<><div style={{fontSize:13,color:T.muted,lineHeight:1.7,marginBottom:16}}>Commence par ajouter ton premier succès.</div><button className="btn btn-dark" onClick={()=>{setAddMode("success");setTab("add");setTimeout(()=>textRef.current?.focus(),100);}} style={{padding:"12px 24px",fontSize:14}}>+ Mon premier succès</button></>}
                </div>
                :<div style={{display:"flex",flexDirection:"column",gap:9}}>{fil.map(e=><EntryCard key={e.id} e={e} showToggle onToggle={togglePublic}/>)}</div>;
            })()}
          </>}

          {histTab==="week"&&<>
            <div style={{background:"linear-gradient(135deg,#FFFDF8,#FDF6E8)",border:`1px solid ${T.accentSoft}`,borderRadius:22,padding:"22px",marginBottom:14}}>
              <div style={{fontSize:11,color:T.accent,fontWeight:700,letterSpacing:".08em",marginBottom:12}}>CETTE SEMAINE</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:16}}>
                {[{val:thisWeek.length,label:"Entrées",color:T.text},{val:weekStars.filter(s=>s.done).length+"⭐",label:"Étoiles",color:T.gold},{val:"+"+thisWeek.reduce((a,e)=>a+e.xp,0),label:"XP",color:T.accent}].map(s=>(
                  <div key={s.label} style={{textAlign:"center",background:"rgba(255,255,255,.7)",borderRadius:14,padding:"12px 8px"}}>
                    <div style={{fontFamily:"'DM Serif Display',serif",fontSize:22,color:s.color}}>{s.val}</div>
                    <div style={{fontSize:10,color:T.muted,marginTop:2}}>{s.label}</div>
                  </div>
                ))}
              </div>
              <div style={{display:"flex",justifyContent:"space-between"}}>{weekStars.map((s,i)=><StarDay key={i} {...s} celebrate={starCelebrate}/>)}</div>
            </div>
            {thisWeek.length===0
              ?<div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:18,padding:"32px 22px",textAlign:"center"}}>
                <div style={{fontSize:26,marginBottom:10}}>⭐</div>
                <div style={{fontFamily:"'DM Serif Display',serif",fontSize:16,marginBottom:8}}>La semaine commence maintenant</div>
                <div style={{fontSize:13,color:T.muted,marginBottom:16,lineHeight:1.65}}>Une entrée par jour suffit pour allumer ton étoile.</div>
                <button className="btn btn-dark" onClick={()=>{setTab("add");setTimeout(()=>textRef.current?.focus(),100);}} style={{padding:"12px 24px",fontSize:14}}>+ Ajouter une entrée</button>
              </div>
              :<div style={{display:"flex",flexDirection:"column",gap:9}}>{thisWeek.map(e=><EntryCard key={e.id} e={e}/>)}</div>
            }
          </>}

          {histTab==="portrait"&&<>
            {portStep===0&&<div style={{background:"linear-gradient(135deg,#F0EAFA,#EBF2EF)",border:`1px solid ${T.violet}20`,borderRadius:22,padding:"28px 24px",textAlign:"center"}}>
              <div style={{fontSize:36,marginBottom:14}}>✦</div>
              <div style={{fontFamily:"'DM Serif Display',serif",fontSize:22,marginBottom:8}}>Ton portrait de croissance</div>
              <div style={{fontSize:13,color:T.mid,lineHeight:1.7,marginBottom:20}}>L'IA analyse tes entrées et dresse un portrait de qui tu es en train de devenir.</div>
              {entries.length<3?<div style={{fontSize:13,color:T.muted,fontStyle:"italic"}}>Ajoute au moins 3 entrées pour générer ton portrait.</div>
              :<button className="btn btn-dark" onClick={callPortrait} style={{width:"100%",padding:"15px"}}>Générer mon portrait · {entries.length} entrées</button>}
            </div>}
            {portStep===1&&<div style={{textAlign:"center",padding:"60px 0"}}>
              <div style={{width:48,height:48,borderRadius:"50%",border:`3px solid ${T.violetBg}`,borderTopColor:T.violet,animation:"spin 1s linear infinite",margin:"0 auto 24px"}}/>
              <div style={{fontFamily:"'DM Serif Display',serif",fontSize:20,marginBottom:8}}>En contemplation…</div>
              <div style={{fontSize:13,color:T.muted,fontStyle:"italic"}}>"Connais-toi toi-même." — Socrate</div>
            </div>}
            {portStep===2&&portrait&&<div style={{animation:"fadeIn .4s ease"}}>
              <div style={{background:"linear-gradient(135deg,#F0EAFA,#EBF0F8)",border:`1px solid ${T.violet}25`,borderRadius:22,padding:"24px",marginBottom:14,textAlign:"center"}}>
                <div style={{fontSize:11,color:T.violet,fontWeight:700,letterSpacing:".1em",marginBottom:10}}>TON PORTRAIT</div>
                <div style={{fontFamily:"'DM Serif Display',serif",fontSize:22,color:T.text,lineHeight:1.3,marginBottom:14}}>{portrait.titre}</div>
                <div style={{fontSize:14,color:T.mid,lineHeight:1.75}}>{portrait.resume}</div>
              </div>
              <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:18,padding:"18px 20px",marginBottom:12}}>
                <div style={{fontSize:11,color:T.green,fontWeight:700,letterSpacing:".08em",marginBottom:12}}>TES FORCES</div>
                {portrait.forces?.map((f,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                  <div style={{width:28,height:28,borderRadius:"50%",background:T.greenBg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:T.green,fontWeight:700,flexShrink:0}}>{i+1}</div>
                  <div style={{fontSize:13,fontWeight:500,color:T.text}}>{f}</div>
                </div>)}
              </div>
              <div style={{background:T.sageBg,border:`1px solid ${T.sageSoft}`,borderRadius:18,padding:"18px 20px",marginBottom:12}}>
                <div style={{fontSize:11,color:T.sage,fontWeight:700,letterSpacing:".08em",marginBottom:8}}>CE QUI TE CARACTÉRISE</div>
                <div style={{fontSize:14,color:T.text,lineHeight:1.7,fontStyle:"italic"}}>"{portrait.pattern}"</div>
              </div>
              <div style={{background:T.accentBg,border:`1px solid ${T.accentSoft}`,borderRadius:18,padding:"18px 20px",marginBottom:16}}>
                <div style={{fontSize:11,color:T.accent,fontWeight:700,letterSpacing:".08em",marginBottom:8}}>INVITATION À GRANDIR</div>
                <div style={{fontFamily:"'DM Serif Display',serif",fontSize:16,color:T.text,lineHeight:1.6}}>{portrait.invitation}</div>
              </div>
              <button className="btn btn-outline" onClick={()=>{setPortrait(null);setPortStep(0);}} style={{width:"100%",padding:"13px",fontSize:13}}>↺ Régénérer</button>
            </div>}
          </>}
        </div>}

        {/* CERCLE */}
        {tab==="cercle"&&<div style={{animation:"fadeIn .3s ease"}}>
          <div style={{display:"flex",background:T.soft,borderRadius:14,padding:4,marginBottom:22,gap:4}}>
            {[{id:"feed",label:"Fil"},{id:"profil",label:"Profil"},{id:"abonnes",label:"Abonnées"}].map(s=>(
              <button key={s.id} onClick={()=>setCercleSub(s.id)} style={{flex:1,padding:"9px 6px",borderRadius:11,border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:12,background:cercleSub===s.id?T.card:"transparent",color:cercleSub===s.id?T.text:T.muted,boxShadow:cercleSub===s.id?"0 1px 6px rgba(0,0,0,.07)":"none",transition:"all .2s"}}>{s.label}</button>
            ))}
          </div>

          {cercleSub==="feed"&&<div style={{display:"flex",flexDirection:"column",gap:14}}>
            {feed.length===0
              ?<div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:18,padding:"40px 24px",textAlign:"center"}}>
                <div style={{fontSize:28,marginBottom:12}}>◉</div>
                <div style={{fontFamily:"'DM Serif Display',serif",fontSize:17,marginBottom:8}}>Le fil se construit</div>
                <div style={{fontSize:13,color:T.muted,lineHeight:1.7,marginBottom:16}}>Invite tes amies et partage tes entrées en les mettant en "Public".</div>
                <button className="btn btn-dark" onClick={()=>setShowInvite(true)} style={{padding:"12px 24px",fontSize:14}}>Inviter des amies</button>
              </div>
              :feed.map(item=><FeedCard key={item.id} item={item} onReact={handleReact} onComment={handleComment}
              onAuthorTap={()=>{
                const authorEntries=feed.filter(f=>f.author_name===item.author_name);
                setFriendView({name:item.author_name,color:item.author_color||T.accent,level:item.author_level,entries:authorEntries});
              }}/>)
            }
          </div>}

          {cercleSub==="profil"&&<div>
            <div style={{background:"linear-gradient(135deg,#FFFDF8,#FDF6E8)",border:`1px solid ${T.border}`,borderRadius:22,padding:"22px",marginBottom:14}}>
              <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:18}}>
                <Av name={profile?.name||"?"} size={56} color={T.accent}/>
                <div style={{flex:1}}>
                  <div style={{fontFamily:"'DM Serif Display',serif",fontSize:20}}>{profile?.name||"Mon profil"}</div>
                  {profile?.bio&&<div style={{fontSize:12,color:T.muted,marginTop:3,lineHeight:1.5}}>{profile.bio}</div>}
                  <div style={{fontSize:11,color:T.accent,marginTop:4,fontWeight:600}}>{level.label}</div>
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
                {[{val:entries.length,label:"Entrées"},{val:weekStars.filter(s=>s.done).length,label:"Étoiles"},{val:badges.length,label:"Badges"}].map(s=>(
                  <div key={s.label} style={{textAlign:"center",background:"rgba(255,255,255,.7)",borderRadius:12,padding:"10px 8px"}}>
                    <div style={{fontFamily:"'DM Serif Display',serif",fontSize:22}}>{s.val}</div>
                    <div style={{fontSize:10,color:T.muted}}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={()=>setShowInvite(true)} style={{width:"100%",background:`linear-gradient(135deg,${T.accentBg},#FFF8F0)`,border:`1.5px solid ${T.accentSoft}`,borderRadius:16,padding:"16px 18px",cursor:"pointer",textAlign:"left",fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
              <div style={{width:40,height:40,borderRadius:12,background:T.accent,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>🔗</div>
              <div style={{flex:1}}><div style={{fontSize:14,fontWeight:700,color:T.text}}>Inviter dans mon cercle</div><div style={{fontSize:12,color:T.muted,marginTop:2}}>Partage le lien avec tes amies</div></div>
              <span style={{color:T.accent,fontSize:18,fontWeight:700}}>→</span>
            </button>
            <div style={{fontSize:12,fontWeight:600,color:T.mid,letterSpacing:".03em",marginBottom:10}}>ENTRÉES PUBLIQUES · {entries.filter(e=>e.is_public).length}</div>
            {entries.filter(e=>e.is_public).length===0
              ?<div style={{background:T.soft,borderRadius:16,padding:"20px",textAlign:"center",fontSize:13,color:T.muted,lineHeight:1.6}}>Aucune entrée publique.<br/>Active "Public" lors de l'ajout.</div>
              :<div style={{display:"flex",flexDirection:"column",gap:9}}>{entries.filter(e=>e.is_public).slice(0,5).map(e=><EntryCard key={e.id} e={e} showToggle onToggle={togglePublic}/>)}</div>
            }
            <button onClick={handleSignOut} style={{background:"none",border:`1px solid ${T.border}`,borderRadius:40,padding:"10px 20px",fontSize:12,color:T.muted,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",marginTop:20,display:"block",width:"100%"}}>Se déconnecter</button>
          </div>}

          {cercleSub==="abonnes"&&<div>
            <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:18,padding:"32px 24px",textAlign:"center",marginBottom:16}}>
              <div style={{fontSize:28,marginBottom:12}}>◉</div>
              <div style={{fontFamily:"'DM Serif Display',serif",fontSize:17,marginBottom:8}}>Construis ton cercle</div>
              <div style={{fontSize:13,color:T.muted,lineHeight:1.7,marginBottom:16}}>Invite tes amies avec le lien ci-dessous.<br/>Leurs entrées publiques apparaîtront dans ton fil.</div>
              <button className="btn btn-dark" onClick={()=>setShowInvite(true)} style={{padding:"13px 28px",fontSize:14}}>🔗 Obtenir le lien</button>
            </div>
            <div style={{fontSize:11,color:T.muted,textAlign:"center",lineHeight:1.7}}>Toute personne qui crée un compte sur Winn.<br/>peut voir les entrées que tu mets en "Public".</div>
          </div>}
        </div>}

      </main>


      {/* Friend profile modal */}
      {friendView&&<div style={{position:"fixed",inset:0,background:"rgba(26,25,20,.5)",backdropFilter:"blur(4px)",zIndex:900,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={()=>setFriendView(null)}>
        <div style={{background:T.bg,borderRadius:"22px 22px 0 0",padding:"0 0 40px",width:"100%",maxWidth:440,maxHeight:"85vh",overflow:"hidden",display:"flex",flexDirection:"column",animation:"slideUp .3s ease"}} onClick={e=>e.stopPropagation()}>
          {/* Handle */}
          <div style={{padding:"16px 22px 0",flexShrink:0}}>
            <div style={{width:32,height:4,background:T.border,borderRadius:2,margin:"0 auto 20px"}}/>
            {/* Author header */}
            <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:20,paddingBottom:16,borderBottom:`1px solid ${T.border}`}}>
              <Av name={friendView.name} size={52} color={friendView.color}/>
              <div>
                <div style={{fontFamily:"'DM Serif Display',serif",fontSize:20}}>{friendView.name}</div>
                <div style={{fontSize:12,color:T.muted,marginTop:2}}>{friendView.level}</div>
              </div>
              <button onClick={()=>setFriendView(null)} style={{marginLeft:"auto",background:"none",border:"none",cursor:"pointer",fontSize:20,color:T.muted}}>×</button>
            </div>
          </div>

          {/* Entries list */}
          <div style={{flex:1,overflowY:"auto",padding:"0 22px"}}>
            {friendView.entries.length===0
              ?<div style={{textAlign:"center",padding:"32px 0",color:T.muted,fontSize:13}}>Aucune entrée publique pour l'instant.</div>
              :<div style={{display:"flex",flexDirection:"column",gap:12,paddingBottom:16}}>
                {friendView.entries.map(item=>(
                  <div key={item.id} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:18,overflow:"hidden"}}>
                    {/* Entry content */}
                    <div style={{padding:"14px 16px 10px"}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                        <span style={{fontSize:9,fontWeight:700,color:item.type==="transform"?T.sage:T.accent,background:item.type==="transform"?T.sageBg:T.accentBg,padding:"3px 8px",borderRadius:20,letterSpacing:".04em"}}>{item.type==="transform"?"TRANSFORMÉ":"SUCCÈS"}</span>
                        <span style={{fontSize:11,color:T.muted}}>{new Date(item.created_at).toLocaleDateString("fr-FR",{day:"2-digit",month:"short"})}</span>
                      </div>
                      {item.type==="transform"&&item.original&&<div style={{fontSize:11,color:T.muted,fontStyle:"italic",borderLeft:`2px solid ${T.border}`,paddingLeft:8,marginBottom:6,lineHeight:1.4}}>"{item.original.length>60?item.original.slice(0,60)+"…":item.original}"</div>}
                      <div style={{fontSize:14,color:T.text,lineHeight:1.6}}>{item.text}</div>
                    </div>
                    {/* Reactions */}
                    <div style={{borderTop:`1px solid ${T.border}`,padding:"10px 16px",display:"flex",gap:6,alignItems:"center"}}>
                      {REACTIONS.map(r=>(
                        <button key={r.id} onClick={()=>handleReact(item.id,r.id)} style={{display:"flex",alignItems:"center",gap:5,background:T.soft,border:`1px solid ${T.border}`,borderRadius:20,padding:"5px 10px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:12,color:T.mid,transition:"all .15s"}}
                          onMouseEnter={e=>{e.currentTarget.style.background=T.accentBg;e.currentTarget.style.borderColor=T.accent;}}
                          onMouseLeave={e=>{e.currentTarget.style.background=T.soft;e.currentTarget.style.borderColor=T.border;}}>
                          <span>{r.emoji}</span><span style={{fontWeight:600}}>{item.reactions?.[r.id]||0}</span>
                        </button>
                      ))}
                    </div>
                    {/* Comment zone */}
                    <FriendCommentBox item={item} onComment={handleComment}/>
                  </div>
                ))}
              </div>
            }
          </div>
        </div>
      </div>}

      {/* Invite modal */}
      {showInvite&&<div style={{position:"fixed",inset:0,background:"rgba(26,25,20,.45)",backdropFilter:"blur(4px)",zIndex:900,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={()=>setShowInvite(false)}>
        <div style={{background:T.card,borderRadius:"22px 22px 0 0",padding:"24px 22px 44px",width:"100%",maxWidth:440,animation:"slideUp .3s ease"}} onClick={e=>e.stopPropagation()}>
          <div style={{width:32,height:4,background:T.border,borderRadius:2,margin:"0 auto 22px"}}/>
          <div style={{fontFamily:"'DM Serif Display',serif",fontSize:22,marginBottom:4}}>Inviter une amie</div>
          <div style={{fontSize:13,color:T.muted,marginBottom:20,lineHeight:1.6}}>Partage ce lien. Toute personne qui s'inscrit pourra voir tes entrées publiques.</div>
          <div style={{background:T.soft,border:`1px solid ${T.border}`,borderRadius:14,padding:"13px 15px",marginBottom:12,display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:12,color:T.mid,fontFamily:"monospace",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{typeof window!=="undefined"?window.location.origin:""}</span>
            <button onClick={()=>{if(typeof window!=="undefined")navigator.clipboard?.writeText(window.location.origin);toast_("Lien copié ✦");}} style={{background:T.text,color:"#fff",border:"none",borderRadius:20,padding:"7px 14px",fontSize:12,fontFamily:"'DM Sans',sans-serif",cursor:"pointer",fontWeight:600,whiteSpace:"nowrap",flexShrink:0}}>Copier</button>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <button onClick={()=>{if(typeof window!=="undefined")window.open("https://wa.me/?text="+encodeURIComponent("Rejoins-moi sur Winn. 🌱 "+(window.location.origin)));}} style={{background:"#25D36615",border:"1px solid #25D36630",borderRadius:14,padding:"12px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:600,color:"#25D366"}}>WhatsApp</button>
            <button onClick={()=>{if(typeof window!=="undefined")navigator.clipboard?.writeText("Rejoins-moi sur Winn. 🌱 "+window.location.origin);toast_("Message copié ✦");}} style={{background:T.accentBg,border:`1px solid ${T.accentSoft}`,borderRadius:14,padding:"12px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:600,color:T.accent}}>Copier message</button>
          </div>
        </div>
      </div>}

      {/* Nav */}
      <nav style={{position:"fixed",bottom:0,left:0,right:0,display:"flex",justifyContent:"center",background:"rgba(250,250,247,.95)",backdropFilter:"blur(16px)",borderTop:`1px solid ${T.border}`}}>
        <div style={{display:"flex",width:"100%",maxWidth:440,padding:"0 8px 20px"}}>
          <button className="tab" onClick={()=>setTab("home")} style={{color:tab==="home"?T.text:T.muted}}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill={tab==="home"?T.text:"none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>{tab!=="home"&&<polyline points="9 22 9 12 15 12 15 22"/>}</svg>
            Accueil
          </button>
          <button className="tab" onClick={()=>{setTab("add");setAddMode("success");setTimeout(()=>textRef.current?.focus(),120);}} style={{color:tab==="add"?T.text:T.muted}}>
            <div style={{width:42,height:42,borderRadius:"50%",background:tab==="add"?T.text:T.soft,border:`1.5px solid ${tab==="add"?T.text:T.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,color:tab==="add"?"#fff":T.mid,boxShadow:tab==="add"?"0 2px 12px rgba(0,0,0,.15)":"none",transition:"all .2s",marginTop:-8}}>+</div>
            Ajouter
          </button>
          <button className="tab" onClick={()=>setTab("journal")} style={{color:tab==="journal"?T.text:T.muted}}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={tab==="journal"?2.4:1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            Journal
          </button>
          <button className="tab" onClick={()=>setTab("cercle")} style={{color:tab==="cercle"?T.text:T.muted}}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill={tab==="cercle"?T.text:"none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87" fill="none"/><path d="M16 3.13a4 4 0 0 1 0 7.75" fill="none"/></svg>
            Cercle
          </button>
        </div>
      </nav>
    </div>
  </>;
}
