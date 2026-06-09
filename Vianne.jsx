import{useState,useRef,useEffect}from"react";
const getImg=(item)=>item.img||( window.VJ_IMG&&window.VJ_IMG[item.id])||"";
const G="#1E5C45",GD="#163D2E",GO="#C9A84C",CR="#F5EDE0",WH="#FFFFFF",CRD="#F5EDE0",CRD2="#E8DCCB",INP="#FBF5E8";
const T1="#1E5C45",T2="#3D5C4A",T3="#7A8C7E",T4="#B0A88A",RE="#A03030",REBG="#F9ECEC",AM="#C8963A",AMBG="#FDF5E6";
const DEFAULT_CURR={USD:{s:"$",r:1,name:"US Dollar"},INR:{s:"₹",r:83.5,name:"Indian Rupee"},AED:{s:"AED ",r:3.67,name:"UAE Dirham"},GBP:{s:"£",r:0.79,name:"British Pound"},EUR:{s:"€",r:0.92,name:"Euro"},SGD:{s:"S$",r:1.35,name:"Singapore Dollar"},HKD:{s:"HK$",r:7.82,name:"Hong Kong Dollar"},JPY:{s:"¥",r:149.5,name:"Japanese Yen"},CAD:{s:"CA$",r:1.36,name:"Canadian Dollar"},AUD:{s:"A$",r:1.52,name:"Australian Dollar"}};
let _sc=null;try{_sc=JSON.parse(localStorage.getItem("vj_curr_rates")||"null");}catch(e){}
const CURR=_sc||Object.assign({},DEFAULT_CURR);
const fc=(n,c)=>{const x=CURR[c]||CURR.USD;return x.s+Number((n||0)*x.r).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2});};

// ── Toast System ─────────────────────────────────────────────────────────
const _toastListeners=[];
const toast={
  show:(msg,type,sub)=>{_toastListeners.forEach(fn=>fn({msg,type:type||"success",sub:sub||"",id:Date.now()}));},
  success:(msg,sub)=>toast.show(msg,"success",sub),
  error:(msg,sub)=>toast.show(msg,"error",sub),
  warn:(msg,sub)=>toast.show(msg,"warn",sub),
  info:(msg,sub)=>toast.show(msg,"info",sub),
};
function ToastContainer(){
  const [toasts,setToasts]=useState([]);
  useEffect(()=>{
    const fn=(t)=>{
      setToasts(p=>[...p,t]);
      setTimeout(()=>setToasts(p=>p.filter(x=>x.id!==t.id)),3500);
    };
    _toastListeners.push(fn);
    return()=>{const i=_toastListeners.indexOf(fn);if(i>=0)_toastListeners.splice(i,1);};
  },[]);
  if(!toasts.length)return null;
  const cols={success:{bg:"#1E5C45",ic:"✅"},error:{bg:"#a03030",ic:"⚠️"},warn:{bg:"#C8963A",ic:"📦"},info:{bg:"#1a3a6c",ic:"ℹ️"}};
  return(
    <div style={{position:"fixed",top:0,left:0,right:0,zIndex:9999,padding:"10px 12px",display:"flex",flexDirection:"column",gap:6,pointerEvents:"none"}}>
      {toasts.map(t=>{
        const col=cols[t.type]||cols.success;
        return(
          <div key={t.id} style={{background:col.bg,borderRadius:12,padding:"11px 14px",display:"flex",alignItems:"center",gap:10,boxShadow:"0 4px 20px rgba(0,0,0,0.25)",pointerEvents:"auto",animation:"toastIn 0.4s cubic-bezier(0.34,1.56,0.64,1)"}}>
            <span style={{fontSize:16,flexShrink:0}}>{col.ic}</span>
            <div style={{flex:1}}>
              <div style={{fontSize:12,fontWeight:700,color:"#fff"}}>{t.msg}</div>
              {t.sub&&<div style={{fontSize:10,color:"rgba(255,255,255,0.75)",marginTop:1}}>{t.sub}</div>}
            </div>
            <button onClick={()=>setToasts(p=>p.filter(x=>x.id!==t.id))} style={{background:"rgba(255,255,255,0.2)",border:"none",borderRadius:"50%",width:20,height:20,color:"#fff",cursor:"pointer",fontSize:12,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>×</button>
          </div>
        );
      })}
    </div>
  );
}

// ── Dark Mode system ──────────────────────────────────────────────────────
let _darkMode=false;
try{_darkMode=localStorage.getItem("vj_dark")==="1";}catch(e){}
const _darkListeners=[];
function useDark(){
  const [dark,setDark]=useState(_darkMode);
  useEffect(()=>{
    _darkListeners.push(setDark);
    return()=>{const i=_darkListeners.indexOf(setDark);if(i>=0)_darkListeners.splice(i,1);};
  },[]);
  return dark;
}
function toggleDark(){
  _darkMode=!_darkMode;
  try{localStorage.setItem("vj_dark",_darkMode?"1":"0");}catch(e){}
  _darkListeners.forEach(fn=>fn(_darkMode));
}

// ── Dark mode colour tokens ───────────────────────────────────────────────
function getDark(dark){
  if(!dark)return{bg:"#163D2E",card:"#FFFFFF",card2:"#F5EDE0",border:"#E8DCCB",t1:"#1E5C45",t2:"#3D5C4A",t3:"#7A8C7E",inp:"#FBF5E8",inpB:"#E8DCCB"};
  return{bg:"#0f0f0f",card:"#1a1a1a",card2:"#222",border:"#2a2a2a",t1:"#C9A84C",t2:"#d0c8b0",t3:"#666",inp:"#222",inpB:"#333"};
}

// ── Press animation helper ────────────────────────────────────────────────
const PA={
  btn:(extra)=>({...extra,transition:"transform 0.1s,box-shadow 0.1s",cursor:"pointer"}),
  onDown:(e)=>{e.currentTarget.style.transform="scale(0.96)";e.currentTarget.style.boxShadow="0 1px 3px rgba(0,0,0,0.15)";},
  onUp:(e)=>{e.currentTarget.style.transform="scale(1)";e.currentTarget.style.boxShadow="";},
};

const f$=n=>"$"+Number(n||0).toFixed(2);
const uid=p=>(p||"X")+Date.now().toString(36).slice(-4).toUpperCase();
const dstr=()=>new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});
const tstr=()=>new Date().toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"});
const USERS=[{id:1,name:"Nilay",un:"nilay",pw:"nilay123",role:"Admin"},{id:2,name:"Jimit",un:"jimit",pw:"jimit123",role:"Manager"},{id:3,name:"Ruchit",un:"ruchit",pw:"ruchit123",role:"Admin"},{id:4,name:"Naresh",un:"naresh",pw:"naresh123",role:"Staff"},{id:5,name:"Naman",un:"naman",pw:"naman123",role:"Admin"}];
const AP={vP:1,vH:1,vA:1,oP:1,eC:1,mU:1,sF:1,sB:1,delSale:1},MP={vP:1,vH:1,vA:1,oP:1,eC:0,mU:0,sF:1,sB:1,delSale:0},SP={vP:1,vH:0,vA:0,oP:0,eC:0,mU:0,sF:0,sB:0,delSale:0};
const gp=(r,customPerms)=>customPerms||{Admin:AP,Manager:MP,Staff:SP}[r]||SP;
const JCK_INV=[{id:"VJBR0094",cat:"Bracelets",col:"CLASSICS",metal:"G14KWG",style:"BR0065",sz:"L 6.75 INCH",gw:9.66,nw:8.282,tc:6.89,fp:2015,em:"💎",st:"available",img:"",views:0,searches:0,stones:[]},{id:"VJER0784",cat:"Earrings",col:"ROSE",metal:"G18KWG",style:"ER0147",sz:"",gw:7.69,nw:4.434,tc:16.28,fp:3975,em:"✨",st:"available",img:"",views:0,searches:0,stones:[]},{id:"VJER3259",cat:"Earrings",col:"LINQ",metal:"G14KYG",style:"ER0530",sz:"NONE",gw:3.715,nw:3.063,tc:3.26,fp:1325,em:"✨",st:"available",img:"",views:0,searches:0,stones:[]},{id:"VJNC3234",cat:"Necklaces",col:"LINQ",metal:"G14KYG",style:"NC0148",sz:"L 16 - 18 INCH",gw:2.421,nw:1.857,tc:2.82,fp:835,em:"🔮",st:"available",img:"",views:0,searches:0,stones:[]},{id:"VJNC3260",cat:"Necklaces",col:"LINQ",metal:"G14KYG",style:"NC0134",sz:"L 16 - 18 INCH",gw:2.687,nw:2.079,tc:3.04,fp:950,em:"🔮",st:"available",img:"",views:0,searches:0,stones:[]},{id:"VJPN3268",cat:"Pendants",col:"CLASSICS",metal:"G14KYG",style:"PN0412",sz:"L 16 - 18 INCH",gw:1.5,nw:0.9,tc:3.0,fp:600,em:"⭐",st:"available",img:"",views:0,searches:0,stones:[]},{id:"VJER3156",cat:"Earrings",col:"CLASSICS",metal:"G14KYG",style:"ER0479",sz:"NONE",gw:2.05,nw:1.874,tc:0.88,fp:405,em:"✨",st:"available",img:"",views:0,searches:0,stones:[]},{id:"VJPN3157",cat:"Pendants",col:"BEZEL",metal:"G14KYG",style:"PN0382",sz:"NONE",gw:1.01,nw:0.826,tc:0.92,fp:505,em:"⭐",st:"available",img:"",views:0,searches:0,stones:[]},{id:"VJER3159",cat:"Earrings",col:"CLASSICS",metal:"G14KWG",style:"ER0527",sz:"NONE",gw:3.4,nw:2.7,tc:3.5,fp:950,em:"✨",st:"available",img:"",views:0,searches:0,stones:[]},{id:"VJRG3160",cat:"Rings",col:"BEZEL",metal:"G14KYG",style:"RG0504",sz:"3.5 US",gw:3.88,nw:3.674,tc:1.03,fp:785,em:"💍",st:"available",img:"",views:0,searches:0,stones:[]},{id:"VJPN3174",cat:"Pendants",col:"BEZEL",metal:"G14KYG",style:"PN0384",sz:"NONE",gw:0.834,nw:0.71,tc:0.62,fp:375,em:"⭐",st:"available",img:"",views:0,searches:0,stones:[]},{id:"VJER3166",cat:"Earrings",col:"CLASSICS",metal:"G14KYG",style:"ER0359",sz:"NONE",gw:2.34,nw:1.932,tc:2.04,fp:610,em:"✨",st:"available",img:"",views:0,searches:0,stones:[]},{id:"VJPN3167",cat:"Pendants",col:"BEZEL",metal:"G14KYG",style:"PN0414",sz:"L 16 - 18 INCH",gw:3.77,nw:3.354,tc:2.08,fp:890,em:"⭐",st:"available",img:"",views:0,searches:0,stones:[]},{id:"VJNC3168",cat:"Necklaces",col:"BEZEL",metal:"G14KYG",style:"NC0159",sz:"L 16 - 18 INCH",gw:5.99,nw:4.958,tc:5.16,fp:1600,em:"🔮",st:"available",img:"",views:0,searches:0,stones:[]},{id:"VJRG3169",cat:"Rings",col:"BEZEL",metal:"G14KYG",style:"RG0506",sz:"3.5 US",gw:3.14,nw:2.922,tc:1.09,fp:685,em:"💍",st:"available",img:"",views:0,searches:0,stones:[]},{id:"VJPN3170",cat:"Pendants",col:"BEZEL",metal:"G14KYG",style:"PN0404",sz:"NONE",gw:1.53,nw:1.24,tc:1.45,fp:785,em:"⭐",st:"available",img:"",views:0,searches:0,stones:[]},{id:"VJRG3171",cat:"Rings",col:"OTHER",metal:"G14KWG",style:"RG0498",sz:"6.50 US",gw:2.82,nw:2.358,tc:2.31,fp:735,em:"💍",st:"available",img:"",views:0,searches:0,stones:[]},{id:"VJNC3178",cat:"Necklaces",col:"LINQ",metal:"G14KYG",style:"NC0150",sz:"L 16 - 18 INCH",gw:2.263,nw:1.831,tc:2.16,fp:790,em:"🔮",st:"available",img:"",views:0,searches:0,stones:[]},{id:"VJNC3179",cat:"Necklaces",col:"LINQ",metal:"G14KYG",style:"NC0131",sz:"L 16 - 18 INCH",gw:2.196,nw:2.036,tc:0.8,fp:650,em:"🔮",st:"available",img:"",views:0,searches:0,stones:[]},{id:"VJNC3180",cat:"Necklaces",col:"LINQ",metal:"G14KYG",style:"NC0147",sz:"L 16 - 18 INCH",gw:2.056,nw:1.912,tc:0.72,fp:650,em:"🔮",st:"available",img:"",views:0,searches:0,stones:[]},{id:"VJNC3181",cat:"Necklaces",col:"LINQ",metal:"G14KYG",style:"NC0149",sz:"L 16 - 18 INCH",gw:2.651,nw:1.935,tc:3.58,fp:1100,em:"🔮",st:"available",img:"",views:0,searches:0,stones:[]},{id:"VJNC3182",cat:"Necklaces",col:"LINQ",metal:"G14KYG",style:"NC0139",sz:"L 16 - 18 INCH",gw:2.058,nw:1.786,tc:1.36,fp:650,em:"🔮",st:"available",img:"",views:0,searches:0,stones:[]},{id:"VJNC3183",cat:"Necklaces",col:"LINQ",metal:"G14KYG",style:"NC0135",sz:"L 16 - 18 INCH",gw:2.199,nw:1.699,tc:2.5,fp:750,em:"🔮",st:"available",img:"",views:0,searches:0,stones:[]},{id:"VJNC3184",cat:"Necklaces",col:"LINQ",metal:"G14KYG",style:"NC0039",sz:"L 16 - 18 INCH",gw:2.239,nw:1.451,tc:3.94,fp:950,em:"🔮",st:"available",img:"",views:0,searches:0,stones:[]},{id:"VJPN3191",cat:"Pendants",col:"BEZEL",metal:"G14KYG",style:"PN0390",sz:"NONE",gw:1.031,nw:0.855,tc:0.88,fp:495,em:"⭐",st:"available",img:"",views:0,searches:0,stones:[]},{id:"VJPN3192",cat:"Pendants",col:"BEZEL",metal:"G14KYG",style:"PN0395",sz:"NONE",gw:1.396,nw:1.17,tc:1.13,fp:650,em:"⭐",st:"available",img:"",views:0,searches:0,stones:[]},{id:"VJRG3194",cat:"Rings",col:"BEZEL",metal:"G14KYG",style:"RG0505",sz:"3.5 US",gw:3.378,nw:3.174,tc:1.02,fp:695,em:"💍",st:"available",img:"",views:0,searches:0,stones:[]},{id:"VJRG3195",cat:"Rings",col:"BEZEL",metal:"G14KYG",style:"RG0507",sz:"3.5 US",gw:3.48,nw:3.268,tc:1.06,fp:710,em:"💍",st:"available",img:"",views:0,searches:0,stones:[]},{id:"VJRG3196",cat:"Rings",col:"BEZEL",metal:"G14KWG",style:"RG0501",sz:"6.50 US",gw:4.055,nw:3.759,tc:1.48,fp:830,em:"💍",st:"available",img:"",views:0,searches:0,stones:[]},{id:"VJPN3197",cat:"Pendants",col:"BEZEL",metal:"G14KYG",style:"PN0405",sz:"NONE",gw:1.299,nw:1.087,tc:1.06,fp:595,em:"⭐",st:"available",img:"",views:0,searches:0,stones:[]},{id:"VJPN3204",cat:"Pendants",col:"BEZEL",metal:"G14KYG",style:"PN0383",sz:"NONE",gw:1.01,nw:0.77,tc:1.2,fp:595,em:"⭐",st:"available",img:"",views:0,searches:0,stones:[]},{id:"VJPN3074",cat:"Pendants",col:"BEZEL",metal:"G14KYG",style:"PN0406",sz:"NONE",gw:1.092,nw:0.94,tc:0.76,fp:475,em:"⭐",st:"available",img:"",views:0,searches:0,stones:[]},{id:"VJRG3205",cat:"Rings",col:"BEZEL",metal:"G14KYG",style:"RG0320",sz:"6.50 US",gw:2.373,nw:2.141,tc:1.16,fp:510,em:"💍",st:"available",img:"",views:0,searches:0,stones:[]},{id:"VJRG3206",cat:"Rings",col:"CLASSICS",metal:"G14KYG",style:"RG0499",sz:"6.50 US",gw:4.457,nw:3.855,tc:3.01,fp:1175,em:"💍",st:"available",img:"",views:0,searches:0,stones:[]},{id:"VJRG3207",cat:"Rings",col:"BEZEL",metal:"G14KYG",style:"RG0497",sz:"6.50 US",gw:4.39,nw:3.88,tc:2.55,fp:975,em:"💍",st:"available",img:"",views:0,searches:0,stones:[]},{id:"VJRG3208",cat:"Rings",col:"BEZEL",metal:"G14KYG",style:"RG0326",sz:"6.00 US",gw:2.79,nw:2.586,tc:1.02,fp:595,em:"💍",st:"available",img:"",views:0,searches:0,stones:[]},{id:"VJER3209",cat:"Earrings",col:"OTHER",metal:"G14KYG",style:"ER0535",sz:"NONE",gw:4.881,nw:4.477,tc:2.02,fp:1075,em:"✨",st:"available",img:"",views:0,searches:0,stones:[]},{id:"VJRG1548",cat:"Rings",col:"CLASSICS",metal:"SL925",style:"RG0309",sz:"10.50 US",gw:5.56,nw:5.49,tc:0.35,fp:150,em:"💍",st:"available",img:"",views:0,searches:0,stones:[]},{id:"VJBR1552",cat:"Bracelets",col:"OTHER",metal:"G14KYG",style:"BR0161",sz:"L 10.00 INCH",gw:1.76,nw:1.08,tc:0.15,fp:225,em:"💎",st:"available",img:"",views:0,searches:0,stones:[]},{id:"VJBR1609",cat:"Bracelets",col:"BEZEL",metal:"G14KYG",style:"BR0174",sz:"L 10.00 INCH",gw:1.09,nw:0.18,tc:0.2,fp:90,em:"💎",st:"available",img:"",views:0,searches:0,stones:[]},{id:"VJBR0054",cat:"Bracelets",col:"LINQ",metal:"G18KRG",style:"BR0048",sz:"L 7.25 INCH",gw:2.476,nw:1.476,tc:5.0,fp:1325,em:"💎",st:"available",img:"",views:0,searches:0,stones:[]},{id:"VJBR0877",cat:"Bracelets",col:"LINQ",metal:"G18KWG",style:"BR0082",sz:"L 7.00 INCH",gw:3.21,nw:0.38,tc:12.52,fp:1895,em:"💎",st:"available",img:"",views:0,searches:0,stones:[]},{id:"VJER1413",cat:"Earrings",col:"LINQ",metal:"G18KYG",style:"ER0260",sz:"NONE",gw:0.68,nw:0.274,tc:2.03,fp:525,em:"✨",st:"available",img:"",views:0,searches:0,stones:[]},{id:"VJRG1814",cat:"Rings",col:"CLASSICS",metal:"G14KWG",style:"RG0337",sz:"5.75 US",gw:2.77,nw:1.75,tc:5.1,fp:625,em:"💍",st:"available",img:"",views:0,searches:0,stones:[]},{id:"VJER1841",cat:"Earrings",col:"CLASSICS",metal:"G14KYG",style:"ER0293",sz:"NONE",gw:2.77,nw:2.338,tc:2.16,fp:675,em:"✨",st:"available",img:"",views:0,searches:0,stones:[]},{id:"VJRG1452",cat:"Rings",col:"LINQ",metal:"G18KWG",style:"RG0299",sz:"12 IN",gw:1.03,nw:0.906,tc:0.62,fp:450,em:"💍",st:"available",img:"",views:0,searches:0,stones:[]},{id:"VJBR1461",cat:"Bracelets",col:"CLASSICS",metal:"G14KWG",style:"BR0140",sz:"L 6.50 INCH",gw:6.97,nw:6.37,tc:3.0,fp:1125,em:"💎",st:"available",img:"",views:0,searches:0,stones:[]},{id:"VJNC1040",cat:"Necklaces",col:"LINQ",metal:"G18KWG",style:"NC0042",sz:"L 69.00 INCH",gw:10.6,nw:5.13,tc:27.35,fp:6250,em:"🔮",st:"available",img:"",views:0,searches:0,stones:[]},{id:"VJPN0022",cat:"Pendants",col:"PALETTE",metal:"G18KWG",style:"PN0021",sz:"",gw:10.82,nw:10.684,tc:0.68,fp:2350,em:"⭐",st:"available",img:"",views:0,searches:0,stones:[]},{id:"VJRG1756",cat:"Rings",col:"BEZEL",metal:"G14KYG",style:"RG0325",sz:"6.00 US",gw:2.86,nw:2.67,tc:0.95,fp:575,em:"💍",st:"available",img:"",views:0,searches:0,stones:[]}];
const DI=[
  {id:"VJBR0094",style:"BR0065",cat:"Bracelets",col:"CLASSICS",metal:"G14KWG",sz:"L 6.75",qty:1,gw:9.66,nw:8.28,tc:6.89,sp:27,iv:1427,tod:1556,cpt:1712,ipt:1570,fp:2015,em:"💎",st:"available",loc:"Exhibition",views:42,searches:18,stones:[]},
  {id:"VJER3259",style:"ER0530",cat:"Earrings",col:"LINQ",metal:"G14KYG",sz:"Std",qty:1,gw:1.8,nw:1.4,tc:0.30,sp:2,iv:89,tod:84,cpt:92,ipt:97,fp:125,em:"✨",st:"available",loc:"Exhibition",views:65,searches:25,stones:[]},
  {id:"VJNC3234",style:"NC0180",cat:"Necklaces",col:"LINQ",metal:"G14KYG",sz:"18in",qty:1,gw:3.2,nw:2.6,tc:0.45,sp:3,iv:195,tod:188,cpt:207,ipt:215,fp:280,em:"📿",st:"available",loc:"Exhibition",views:33,searches:21,stones:[]},
  {id:"VJRG3160",style:"RG0021",cat:"Rings",col:"BEZEL",metal:"G14KYG",sz:"7",qty:1,gw:3.1,nw:2.6,tc:0.35,sp:1,iv:195,tod:188,cpt:207,ipt:215,fp:280,em:"💍",st:"available",loc:"Exhibition",views:88,searches:35,stones:[]},
  {id:"VJPN3268",style:"PN0120",cat:"Pendants",col:"CLASSICS",metal:"G18KWG",sz:"Std",qty:1,gw:1.5,nw:1.1,tc:0.25,sp:1,iv:98,tod:94,cpt:103,ipt:108,fp:140,em:"⭐",st:"available",loc:"Exhibition",views:22,searches:9,stones:[]},
  {id:"VJRG3169",style:"RG0028",cat:"Rings",col:"BEZEL",metal:"G14KWG",sz:"6.5",qty:1,gw:2.9,nw:2.4,tc:0.30,sp:1,iv:155,tod:148,cpt:163,ipt:171,fp:220,em:"💍",st:"available",loc:"Exhibition",views:54,searches:22,stones:[]},
  {id:"VJBR0054",style:"BR0012",cat:"Bracelets",col:"LINQ",metal:"G14KYG",sz:"6.5in",qty:1,gw:5.8,nw:4.9,tc:1.20,sp:8,iv:480,tod:465,cpt:512,ipt:528,fp:690,em:"💎",st:"available",loc:"Exhibition",views:37,searches:15,stones:[]},
  {id:"VJNC3178",style:"NC0165",cat:"Necklaces",col:"LINQ",metal:"G14KYG",sz:"17in",qty:1,gw:4.1,nw:3.4,tc:0.60,sp:4,iv:258,tod:248,cpt:273,ipt:284,fp:370,em:"📿",st:"available",loc:"Exhibition",views:45,searches:19,stones:[]},
  {id:"VJER0784",style:"ER0178",cat:"Earrings",col:"ROSE",metal:"G14KRG",sz:"Std",qty:1,gw:2.1,nw:1.6,tc:0.52,sp:4,iv:162,tod:155,cpt:171,ipt:178,fp:230,em:"✨",st:"available",loc:"Exhibition",views:28,searches:12,stones:[]},
  {id:"VJBR0877",style:"BR0072",cat:"Bracelets",col:"LINQ",metal:"G18KYG",sz:"7.5in",qty:1,gw:7.2,nw:6.1,tc:1.80,sp:14,iv:890,tod:860,cpt:946,ipt:979,fp:1275,em:"💎",st:"available",loc:"Exhibition",views:56,searches:24,stones:[]},
];
const DEMO_EVENTS=[
  {id:"EVT001",name:"JCK Las Vegas 2026",loc:"Las Vegas, USA",start:"2026-06-06",end:"2026-06-09",status:"active",color:G,inv:[...JCK_INV],sales:[{id:"INV-001",custName:"Abby Pollak",phone:"+1-212-555-0101",itemId:"VJER3259",itemName:"Earrings · LINQ · G14KYG",metal:"G14KYG",col:"LINQ",sz:"Standard",gw:1.8,nw:1.4,tc:0.30,sp:2,style:"ER0530",price:125,disc:0,cgst:1.88,sgst:1.88,total:128.75,currency:"USD",margin:28,date:"Jun 6, 2026",time:"03:40 PM",payment:"NEFT",staff:"Jimit",st:"delivered",gt:"GT294821",remark:"Gift wrap"}],leads:[{id:"L1",name:"Sunrise Jewelers",contact:"Mike Chen",phone:"+1-617-555-7890",email:"mike@sunrise.com",source:"Badge",status:"Hot",notes:"Interested in LINQ.",created:"Jun 6, 2026",assigned:"Nilay"}],memos:[],audits:[]},
  {id:"EVT002",name:"IIJS Mumbai 2025",loc:"Mumbai, India",start:"2025-08-07",end:"2025-08-11",status:"completed",color:"#8B4513",inv:DI.slice(0,5),sales:[],leads:[],memos:[],audits:[]},
];
const S={
  btn:o=>({background:G,color:CR,border:"none",borderRadius:10,padding:"13px 18px",fontFamily:"Lato,sans-serif",fontSize:14,fontWeight:600,cursor:"pointer",width:"100%",...o}),
  bOut:o=>({background:"transparent",color:G,border:"1.5px solid "+G,borderRadius:9,padding:"9px 14px",fontFamily:"Lato,sans-serif",fontSize:12,fontWeight:600,cursor:"pointer",...o}),
  bRed:o=>({background:RE,color:WH,border:"none",borderRadius:10,padding:"13px",fontFamily:"Lato,sans-serif",fontSize:14,fontWeight:600,cursor:"pointer",width:"100%",...o}),
  inp:o=>({background:INP,border:"1.5px solid "+CRD2,borderRadius:9,padding:"11px 14px",fontFamily:"Lato,sans-serif",fontSize:13,color:T1,width:"100%",outline:"none",...o}),
  lbl:{fontSize:10,fontWeight:700,color:T2,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:5,display:"block"},
  card:o=>({background:WH,borderRadius:14,padding:14,boxShadow:"0 1px 6px rgba(0,0,0,0.08)",...o}),
  cc:o=>({background:CRD,border:"1px solid "+CRD2,borderRadius:11,padding:12,...o}),
  sh:{fontSize:10,fontWeight:700,color:T2,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:11},
  pill:(on,o)=>({flexShrink:0,background:on?G:"transparent",border:"1.5px solid "+(on?G:CRD2),color:on?CR:T3,borderRadius:20,padding:"5px 11px",fontFamily:"Lato,sans-serif",fontSize:10.5,fontWeight:on?600:400,cursor:"pointer",whiteSpace:"nowrap",...o}),
};
function Bdg({t,ch,sm}){const m={g:{bg:"rgba(30,92,69,0.1)",c:G,b:"1px solid rgba(30,92,69,0.2)"},a:{bg:AMBG,c:AM,b:"1px solid rgba(200,150,58,0.3)"},r:{bg:REBG,c:RE,b:"1px solid rgba(160,48,48,0.2)"},m:{bg:"#f0f0ec",c:"#666",b:"1px solid #ddd"},bl:{bg:"#EBF3FB",c:"#2C5F8A",b:"1px solid rgba(44,95,138,0.3)"},gr:{bg:"#edf7f0",c:"#27ae60",b:"1px solid rgba(39,174,96,0.3)"}};const s=m[t]||m.m;return <span style={{display:"inline-block",padding:sm?"2px 7px":"3px 9px",borderRadius:20,fontSize:sm?8:9.5,fontWeight:700,textTransform:"uppercase",background:s.bg,color:s.c,border:s.b}}>{ch}</span>;}
function Lotus({sz=36}){
  const s=GO;
  return(
    <svg width={sz} height={sz} viewBox="0 0 200 220" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="6">
      {/* Center petal - narrow tall sharp */}
      <path d="M100 12 C96 30 92 52 92 72 C92 86 95 96 100 100 C105 96 108 86 108 72 C108 52 104 30 100 12Z" stroke={s} fill="none"/>
      {/* Left upper petal - broad sweep */}
      <path d="M95 76 C86 66 68 55 46 52 C26 50 10 58 9 70 C8 83 22 92 44 91 C62 90 80 84 95 76Z" stroke={s} fill="none"/>
      {/* Right upper petal - mirror */}
      <path d="M105 76 C114 66 132 55 154 52 C174 50 190 58 191 70 C192 83 178 92 156 91 C138 90 120 84 105 76Z" stroke={s} fill="none"/>
      {/* Left lower leaf - horizontal eye, tip points LEFT */}
      <path d="M100 100 C88 92 65 89 40 98 C65 110 88 110 100 103" stroke={s} fill="none"/>
      <path d="M100 100 C88 108 65 113 40 98 C55 84 82 82 100 100Z" stroke={s} strokeWidth="5" fill="none"/>
      {/* Right lower leaf - horizontal eye, tip points RIGHT */}
      <path d="M100 100 C112 92 135 89 160 98 C135 110 112 110 100 103" stroke={s} fill="none"/>
      <path d="M100 100 C112 108 135 113 160 98 C145 84 118 82 100 100Z" stroke={s} strokeWidth="5" fill="none"/>
      {/* 3 descending dots */}
      <circle cx="100" cy="136" r="7" fill={s}/>
      <circle cx="100" cy="157" r="5.5" fill={s}/>
      <circle cx="100" cy="175" r="4" fill={s}/>
    </svg>
  );
}
function Sheet({onClose,title,children}){return(<div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:400,display:"flex",alignItems:"flex-end",justifyContent:"center"}}><div onClick={e=>e.stopPropagation()} style={{background:CRD,borderRadius:"20px 20px 0 0",width:"100%",maxWidth:430,maxHeight:"93vh",overflowY:"auto"}}><div style={{padding:"14px 16px 12px",borderBottom:"1px solid "+CRD2,position:"sticky",top:0,background:CRD,zIndex:1}}><div style={{width:36,height:3.5,background:CRD2,borderRadius:2,margin:"0 auto 12px"}}/><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div style={{fontFamily:"Cormorant Garamond,serif",fontSize:18,fontWeight:700,color:G}}>{title}</div><button onClick={onClose} style={{background:"none",border:"none",fontSize:22,color:T3,cursor:"pointer"}}>✕</button></div></div><div style={{padding:"14px 16px 36px"}}>{children}</div></div></div>);}
function QRScanner({onScanned,inv}){
  const vr=useRef(null),sr=useRef(null),cv=useRef(null),raf=useRef(null);
  const [err,se]=useState(""),[manual,sm]=useState(""),[scanning,ssc]=useState(false),[lastCode,slc]=useState("");

  const stop=()=>{
    if(raf.current){cancelAnimationFrame(raf.current);raf.current=null;}
    if(sr.current){sr.current.getTracks().forEach(t=>t.stop());sr.current=null;}
    ssc(false);
  };

  const tick=()=>{
    if(!vr.current||!cv.current)return;
    const vid=vr.current;
    if(vid.readyState!==vid.HAVE_ENOUGH_DATA){raf.current=requestAnimationFrame(tick);return;}
    const ctx=cv.current.getContext("2d");
    cv.current.width=vid.videoWidth;
    cv.current.height=vid.videoHeight;
    ctx.drawImage(vid,0,0);
    try{
      const img=ctx.getImageData(0,0,cv.current.width,cv.current.height);
      if(window.jsQR){
        const qr=window.jsQR(img.data,img.width,img.height,{inversionAttempts:"dontInvert"});
        if(qr&&qr.data&&qr.data!==lastCode){
          const code=qr.data.trim().toUpperCase();
          slc(code);
          const found=inv.find(i=>i.id===code);
          onScanned(code,found||null);
          stop();
          return;
        }
      }
    }catch(_){}
    raf.current=requestAnimationFrame(tick);
  };

  useEffect(()=>{
    // jsQR is bundled inline
    start();
    return()=>stop();
  },[]);

  const start=()=>{
    se("");
    navigator.mediaDevices.getUserMedia({video:{facingMode:"environment",width:{ideal:1280},height:{ideal:720}},audio:false})
      .then(function(stream){
        sr.current=stream;
        if(vr.current){
          vr.current.srcObject=stream;
          vr.current.play().then(function(){
            ssc(true);
            raf.current=requestAnimationFrame(tick);
          }).catch(function(){ssc(true);raf.current=requestAnimationFrame(tick);});
        }
      })
      .catch(function(e){se("Camera: "+(e.message||"access denied")+" — use manual entry below.");});
  };

  const go=()=>{if(manual.trim()){const code=manual.trim().toUpperCase();const found=inv.find(i=>i.id===code);onScanned(code,found||null);sm("");}};

  return(
    <div style={{background:WH,borderRadius:14,overflow:"hidden",border:"1px solid "+CRD2,marginBottom:12,boxShadow:"0 2px 12px rgba(0,0,0,0.08)"}}>
      {/* Camera view */}
      <div style={{position:"relative",background:"#000",minHeight:240}}>
        <video ref={vr} playsInline muted style={{width:"100%",display:"block",maxHeight:300,objectFit:"cover"}}/>
        <canvas ref={cv} style={{display:"none"}}/>
        {/* Corner brackets */}
        <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"none"}}>
          <div style={{position:"relative",width:"60%",height:"55%"}}>
            {[[{top:0,left:0},{borderTopWidth:3,borderLeftWidth:3}],[{top:0,right:0},{borderTopWidth:3,borderRightWidth:3}],[{bottom:0,left:0},{borderBottomWidth:3,borderLeftWidth:3}],[{bottom:0,right:0},{borderBottomWidth:3,borderRightWidth:3}]].map(([pos,brd],i)=>(
              <div key={i} style={{position:"absolute",width:26,height:26,borderColor:GO,borderStyle:"solid",borderWidth:0,...pos,...brd,borderRadius:2}}/>
            ))}
            {/* Scanning line */}
            <div style={{position:"absolute",left:0,right:0,height:2,background:GO,opacity:0.9,top:"48%",boxShadow:"0 0 8px "+GO}}/>
          </div>
        </div>
        {/* Status */}
        <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"10px 14px",background:"linear-gradient(transparent,rgba(0,0,0,0.7))"}}>
          {scanning&&<div style={{color:"rgba(255,255,255,0.9)",fontSize:12,textAlign:"center",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:GO,boxShadow:"0 0 6px "+GO}}/>
            Align jewellery QR tag in frame
          </div>}
          {!scanning&&!err&&<div style={{color:"rgba(255,255,255,0.6)",fontSize:12,textAlign:"center"}}>Starting camera...</div>}
        </div>
      </div>
      {/* Error */}
      {err&&<div style={{background:REBG,padding:"10px 14px",fontSize:12,color:RE,display:"flex",alignItems:"center",gap:7}}><span>⚠</span>{err}</div>}
      {/* Manual entry */}
      <div style={{padding:"11px 13px"}}>
        <div style={{fontSize:10,color:T3,marginBottom:7,textAlign:"center",letterSpacing:"0.05em"}}>— OR ENTER CODE MANUALLY —</div>
        <div style={{display:"flex",gap:8}}>
          <input
            style={S.inp()}
            placeholder="e.g. VJBR0094"
            value={manual}
            onChange={ev=>sm(ev.target.value.toUpperCase())}
            onKeyDown={ev=>ev.key==="Enter"&&go()}
            autoCapitalize="characters"
          />
          <button style={S.btn({width:"auto",padding:"0 16px",fontSize:13,whiteSpace:"nowrap"})} onClick={go}>Find</button>
        </div>
      </div>
    </div>
  );
}


function parseXL(file,onDone,onError){
  const X=window.XLSX;if(!X){onError("Excel library loading, retry in 2s.");return;}
  const r=new FileReader();
  r.onload=e=>{try{const wb=X.read(new Uint8Array(e.target.result),{type:"array"});const ws=wb.Sheets[wb.SheetNames[0]];const rows=X.utils.sheet_to_json(ws,{defval:""});const emo={Bracelets:"💎",Earrings:"✨",Necklaces:"📿",Rings:"💍",Pendants:"⭐",Bangles:"🔮",Brooch:"📌"};const items=rows.map(r=>{const id=String(r["Jewel Code"]||r["ID"]||r["id"]||"").trim().toUpperCase();const fp=parseFloat(r["Sale Price"]||r["Final Price"]||r["fp"]||r["Price"]||0);const cat=String(r["Category"]||r["cat"]||"Jewellery").trim();if(!id||fp<=0)return null;return{id,style:String(r["Style"]||r["style"]||""),cat,col:String(r["Collection"]||r["col"]||r["Coll'n"]||""),metal:String(r["Metal"]||r["metal"]||""),sz:String(r["Size"]||r["sz"]||"Std"),qty:parseInt(r["Qty"]||r["qty"]||1),gw:parseFloat(r["Gross Wt"]||r["gw"]||0),nw:parseFloat(r["Net Wt"]||r["nw"]||0),tc:parseFloat(r["Total Carats"]||r["tc"]||0),sp:parseFloat(r["Stone Pcs"]||r["sp"]||0),iv:parseFloat(r["Inward Value"]||r["iv"]||0),tod:parseFloat(r["Today Cost"]||r["tod"]||0),cpt:parseFloat(r["Cost+Tariffs"]||r["cpt"]||0),ipt:parseFloat(r["Inward+Tariffs"]||r["ipt"]||0),fp,em:emo[cat]||"💎",st:"available",loc:String(r["Location"]||r["loc"]||"Exhibition"),views:0,searches:0,stones:[]};}).filter(Boolean);onDone(items);}catch(err){onError("Parse error: "+err.message);}};
  r.onerror=()=>onError("Read failed");r.readAsArrayBuffer(file);
}
function Login({onLogin}){
  const [u,su]=useState(""),[p,sp]=useState(""),[e,se]=useState(""),[show,ssh]=useState(false),[bio,sbio]=useState(false);
  useEffect(()=>{try{if(window.PublicKeyCredential)window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable().then(ok=>sbio(ok));}catch(_){}if(!window.XLSX){const s=document.createElement("script");s.src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";s.onerror=function(){console.log("XLSX CDN blocked");};document.head.appendChild(s);}},[]);
  const go=()=>{const usr=USERS.find(x=>x.un===u.toLowerCase()&&x.pw===p);if(usr)onLogin(usr);else se("Invalid username or password");};
  const doBio=()=>{try{const ch=new Uint8Array(32);window.crypto.getRandomValues(ch);navigator.credentials.get({publicKey:{challenge:ch,timeout:60000,userVerification:"required",rpId:window.location.hostname||"localhost"}}).then(function(cr){if(cr)onLogin(USERS[0]);}).catch(function(err){if(err.name!=="NotAllowedError")toast.error("Biometric failed",err.message);});}catch(err){toast.error("Biometric failed",err.message);}};
  const isIOS=/iPhone|iPad/.test(navigator.userAgent);
  return(<div style={{background:GD,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"Lato,sans-serif"}}>
    <div style={{width:"100%",maxWidth:380,background:CRD,borderRadius:22,padding:"36px 28px 32px",boxShadow:"0 20px 60px rgba(0,0,0,0.35)"}}>
      <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:28}}><Lotus sz={52}/><div><div style={{fontFamily:"Cormorant Garamond,serif",fontSize:21,fontWeight:700,color:G,letterSpacing:"0.14em",textTransform:"uppercase",lineHeight:1.1}}>VIANNE JEWELS</div><div style={{fontSize:9,color:T4,letterSpacing:"0.12em",textTransform:"uppercase",marginTop:4,lineHeight:1.5}}>THE SIGNATURE OF AFFORDABLE<br/>SOPHISTICATION</div></div></div>
      <div style={{fontSize:12,fontWeight:700,color:T1,letterSpacing:"0.18em",textAlign:"center",marginBottom:20,textTransform:"uppercase"}}>SIGN IN TO CONTINUE</div>
      {bio&&<><button onClick={doBio} style={{width:"100%",background:G,color:CR,border:"none",borderRadius:11,padding:"13px",fontFamily:"Lato,sans-serif",fontSize:13,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:9,marginBottom:12}}><span style={{fontSize:18}}>{isIOS?"🔒":"🫆"}</span>{isIOS?"Face ID / Touch ID":"Fingerprint / Face Unlock"}</button><div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}><div style={{flex:1,height:1,background:CRD2}}/><span style={{fontSize:11,color:T4,fontWeight:600}}>OR</span><div style={{flex:1,height:1,background:CRD2}}/></div></>}
      <div style={{marginBottom:12}}><span style={S.lbl}>USERNAME</span><input style={S.inp()} placeholder="Enter username" value={u} onChange={ev=>{su(ev.target.value);se("");}} onKeyDown={ev=>ev.key==="Enter"&&go()}/></div>
      <div style={{marginBottom:18}}><span style={S.lbl}>PASSWORD</span><div style={{position:"relative"}}><input type={show?"text":"password"} style={S.inp({paddingRight:42})} placeholder="Enter password" value={p} onChange={ev=>{sp(ev.target.value);se("");}} onKeyDown={ev=>ev.key==="Enter"&&go()}/><button onClick={()=>ssh(x=>!x)} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",fontSize:16,color:T3}}>{show?"🙈":"👁"}</button></div></div>
      {e&&<div style={{color:RE,fontSize:12,marginBottom:12,textAlign:"center",background:REBG,borderRadius:8,padding:"8px 12px"}}>{e}</div>}
      <button style={S.btn({fontSize:15})} onClick={go}>Sign In</button>
      <div style={{fontSize:10,color:T4,textAlign:"center",marginTop:14}}>nilay/nilay123 · jimit/jimit123 · naresh/naresh123</div>
    </div>
  </div>);
}
function EventHub({user,events,onEnter,onCreate,onManage,onDelete,onLogout}){
  const [sc,ssc]=useState(false),[form,sf]=useState({name:"",loc:"",start:"",end:"",color:G}),[xlf,sxl]=useState(null),[msg,smsg]=useState(""),[loading,sl]=useState(false);
  const pr=gp(user.role);
  const create=()=>{if(!form.name.trim())return;const fin=(inv)=>{onCreate({id:uid("EVT"),name:form.name,loc:form.loc,start:form.start,end:form.end,status:"active",color:form.color,inv,sales:[],leads:[],memos:[],audits:[]});ssc(false);sf({name:"",loc:"",start:"",end:"",color:G});sxl(null);smsg("");};if(xlf){sl(true);parseXL(xlf,inv=>{sl(false);fin(inv);},err=>{sl(false);smsg(err);});}else fin([...DI.slice(0,5)]);};
  return(<div style={{background:"#f5f0e8",minHeight:"100vh",fontFamily:"Lato,sans-serif"}}>
    <div style={{background:G,padding:"13px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}><Lotus sz={28}/><div><div style={{fontFamily:"Cormorant Garamond,serif",fontSize:15,fontWeight:700,color:CR,letterSpacing:"0.1em",textTransform:"uppercase"}}>VIANNE JEWELS</div><div style={{fontSize:8,color:GO,letterSpacing:"0.1em",textTransform:"uppercase"}}>Event Manager</div></div></div>
      <div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:26,height:26,background:GO,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:G}}>{user.name[0]}</div><span style={{color:CR,fontSize:11,fontWeight:600}}>{user.name}</span><button onClick={onLogout} style={{background:"rgba(255,255,255,0.12)",border:"none",borderRadius:7,color:CR,padding:"5px 9px",cursor:"pointer",fontSize:11,fontWeight:600}}>🚪 Sign Out</button></div>
    </div>
    <div style={{padding:"16px 14px",maxWidth:430,margin:"0 auto"}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:9,marginBottom:16}}>
        {[{l:"Events",v:events.length},...(gp(user.role).vA?[{l:"Total Sales",v:events.reduce((s,e)=>s+e.sales.length,0)},{l:"Revenue",v:"$"+Math.round(events.reduce((s,e)=>s+e.sales.reduce((ss,x)=>ss+x.total,0),0)/1000)+"k"}]:[])].map(x=>(
          <div key={x.l} style={{background:WH,borderRadius:11,padding:"12px 8px",textAlign:"center",boxShadow:"0 1px 6px rgba(0,0,0,0.08)"}}><div style={{fontFamily:"Cormorant Garamond,serif",fontSize:22,fontWeight:700,color:G,lineHeight:1}}>{x.v}</div><div style={{fontSize:9,color:T3,marginTop:3,textTransform:"uppercase"}}>{x.l}</div></div>
        ))}
      </div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:11}}>
        <div style={{fontFamily:"Cormorant Garamond,serif",fontSize:18,fontWeight:700,color:G}}>Your Events</div>
        {pr.mU&&<button onClick={()=>ssc(true)} style={{background:GO,color:G,border:"none",borderRadius:8,padding:"8px 13px",fontFamily:"Lato,sans-serif",fontSize:12,fontWeight:700,cursor:"pointer"}}>+ New Event</button>}
      </div>
      {events.map(ev=>(
        <div key={ev.id} style={{background:WH,borderRadius:13,marginBottom:12,boxShadow:"0 3px 14px rgba(0,0,0,0.12)",overflow:"hidden"}}>
          <div style={{background:ev.color||G,padding:"13px 15px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div><div style={{fontFamily:"Cormorant Garamond,serif",fontSize:16,fontWeight:700,color:CR,lineHeight:1.2}}>{ev.name}</div><div style={{fontSize:10,color:"rgba(245,237,224,0.7)",marginTop:3}}>📍 {ev.loc}</div><div style={{fontSize:9,color:"rgba(245,237,224,0.6)",marginTop:2}}>📅 {ev.start} → {ev.end}</div></div>
              <Bdg t={ev.status==="active"?"gr":ev.status==="completed"?"m":"a"} ch={ev.status}/>
            </div>
          </div>
          <div style={{padding:"11px 14px"}}>
            <div style={{display:"flex",gap:14,marginBottom:11}}>
              {[{l:"Items",v:ev.inv.length},...(gp(user.role).vA?[{l:"Sales",v:ev.sales.length},{l:"Revenue",v:"$"+Math.round(ev.sales.reduce((s,x)=>s+x.total,0)/1000)+"k"}]:[])].map(x=>(
                <div key={x.l} style={{textAlign:"center"}}><div style={{fontFamily:"Cormorant Garamond,serif",fontSize:15,fontWeight:700,color:G}}>{x.v}</div><div style={{fontSize:8,color:T3,textTransform:"uppercase"}}>{x.l}</div></div>
              ))}
            </div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>onEnter(ev)} style={{flex:2,background:G,color:CR,border:"none",borderRadius:9,padding:"11px",fontFamily:"Lato,sans-serif",fontSize:13,fontWeight:600,cursor:"pointer"}}>Open Event →</button>
              {pr.mU&&<button onClick={()=>onManage(ev)} style={{flex:1,background:"transparent",color:G,border:"1.5px solid "+G,borderRadius:9,padding:"11px",fontFamily:"Lato,sans-serif",fontSize:12,fontWeight:600,cursor:"pointer"}}>Manage</button>}
            </div>
          </div>
        </div>
      ))}
      {events.length===0&&<div style={{textAlign:"center",padding:40,color:T3,fontSize:14}}>No events yet. Create your first event.</div>}
    </div>
    {sc&&<Sheet onClose={()=>{ssc(false);smsg("");}} title="Create New Event">
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        <div><span style={S.lbl}>EVENT NAME *</span><input style={S.inp()} placeholder="e.g. JCK Las Vegas 2026" value={form.name} onChange={ev=>sf(p=>({...p,name:ev.target.value}))}/></div>
        <div><span style={S.lbl}>LOCATION</span><input style={S.inp()} placeholder="e.g. Las Vegas, USA" value={form.loc} onChange={ev=>sf(p=>({...p,loc:ev.target.value}))}/></div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          <div><span style={S.lbl}>START</span><input type="date" style={S.inp()} value={form.start} onChange={ev=>sf(p=>({...p,start:ev.target.value}))}/></div>
          <div><span style={S.lbl}>END</span><input type="date" style={S.inp()} value={form.end} onChange={ev=>sf(p=>({...p,end:ev.target.value}))}/></div>
        </div>
        <div><span style={S.lbl}>COLOR</span><div style={{display:"flex",gap:8,marginTop:4}}>{[G,"#8B4513","#2C5F8A","#5A3A7A","#8B6914","#C0392B"].map(col=><div key={col} onClick={()=>sf(p=>({...p,color:col}))} style={{width:32,height:32,borderRadius:"50%",background:col,cursor:"pointer",border:form.color===col?"3px solid "+GO:"3px solid transparent"}}/>)}</div></div>
        <div><span style={S.lbl}>EXCEL INVENTORY (OPTIONAL)</span>
          <div onClick={()=>document.getElementById("xlC").click()} style={{background:INP,border:"1.5px dashed "+CRD2,borderRadius:9,padding:"14px",textAlign:"center",cursor:"pointer"}}>
            <div style={{fontSize:24,marginBottom:5}}>📊</div><div style={{fontSize:12,color:T2,fontWeight:600}}>{xlf?xlf.name:"Tap to upload .xlsx / .xls"}</div>
            <div style={{fontSize:10,color:T3,marginTop:2}}>Columns: Jewel Code, Category, Metal, Sale Price…</div>
            <input id="xlC" type="file" accept=".xlsx,.xls,.csv" style={{display:"none"}} onChange={ev=>{if(ev.target.files[0]){sxl(ev.target.files[0]);smsg("");}}}/>
          </div>
          {!xlf&&<div style={{fontSize:10,color:T3,marginTop:4}}>Without file, demo items load automatically.</div>}
        </div>
        {msg&&<div style={{background:REBG,borderRadius:8,padding:"9px 12px",fontSize:11,color:RE}}>{msg}</div>}
      </div>
      <button style={S.btn({marginTop:13})} disabled={!form.name.trim()||loading} onClick={create}>{loading?"Parsing...":"✓ Create Event"}</button>
    </Sheet>}
  </div>);
}
function ManageEvent({ev, onClose, onUpdate, onDelete}){
  const [tab,st]=useState("details");
  const [mode,smode]=useState("add");
  const [form,sf]=useState({name:ev.name||"",loc:ev.loc||"",start:ev.start||"",end:ev.end||"",status:ev.status||"active",color:ev.color||G});
  const [confirmDel,sConfirmDel]=useState(false);
  const upd=(k,v)=>sf(p=>({...p,[k]:v}));
  const f$=n=>"$"+Number(n||0).toLocaleString("en-US",{minimumFractionDigits:0,maximumFractionDigits:0});

  const COLORS=[
    {val:G,    label:"Forest Green"},
    {val:"#1a3a5c",label:"Navy Blue"},
    {val:"#5c1a1a",label:"Deep Burgundy"},
    {val:"#3d1a5c",label:"Royal Purple"},
    {val:"#5c3d1a",label:"Warm Bronze"},
    {val:"#1a5c4a",label:"Teal Green"},
  ];

  return(
    <Sheet onClose={onClose} title="Manage Event">
      <div style={{display:"flex",gap:6,marginBottom:13,overflowX:"auto",scrollbarWidth:"none"}}>
        {["details","inventory","upload"].map(t=>(
          <button key={t} style={S.pill(tab===t,{textTransform:"capitalize"})} onClick={()=>st(t)}>{t}</button>
        ))}
      </div>

      {tab==="details"&&(
        <div>
          <div style={{display:"flex",flexDirection:"column",gap:9,marginBottom:13}}>

            <div><span style={S.lbl}>EVENT NAME</span>
              <input style={S.inp()} value={form.name} placeholder="e.g. JCK Las Vegas 2026"
                onChange={e=>upd("name",e.target.value)}/>
            </div>

            <div><span style={S.lbl}>LOCATION</span>
              <input style={S.inp()} value={form.loc} placeholder="City, Country"
                onChange={e=>upd("loc",e.target.value)}/>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              <div><span style={S.lbl}>START DATE</span>
                <input style={S.inp()} type="date" value={form.start}
                  onChange={e=>upd("start",e.target.value)}/>
              </div>
              <div><span style={S.lbl}>END DATE</span>
                <input style={S.inp()} type="date" value={form.end}
                  onChange={e=>upd("end",e.target.value)}/>
              </div>
            </div>

            <div><span style={S.lbl}>STATUS</span>
              <select style={S.inp()} value={form.status} onChange={e=>upd("status",e.target.value)}>
                {["active","upcoming","completed"].map(s=><option key={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <span style={S.lbl}>EVENT COLOUR</span>
              <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:4}}>
                {COLORS.map(col=>(
                  <button key={col.val} onClick={()=>upd("color",col.val)}
                    style={{width:32,height:32,borderRadius:"50%",background:col.val,border:form.color===col.val?"3px solid "+GO:"2px solid transparent",cursor:"pointer",position:"relative"}}>
                    {form.color===col.val&&<span style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",color:CR,fontSize:14,fontWeight:900}}>✓</span>}
                  </button>
                ))}
              </div>
              <div style={{fontSize:10,color:T3,marginTop:4}}>{COLORS.find(x=>x.val===form.color)?.label||"Custom"}</div>
            </div>

          </div>

          <button style={S.btn({padding:"12px",fontSize:13,marginBottom:8})}
            onClick={()=>onUpdate({...ev,...form})}>
            ✓ Save Changes
          </button>

          <div style={{height:1,background:CRD2,margin:"14px 0"}}/>

          {/* Delete Event — Admin only with confirmation */}
          {!confirmDel?(
            <button onClick={()=>sConfirmDel(true)}
              style={{...S.bOut({padding:"11px",fontSize:12}),color:RE,borderColor:RE,width:"100%"}}>
              🗑 Delete Event
            </button>
          ):(
            <div style={{background:REBG,border:"1.5px solid "+RE,borderRadius:10,padding:12}}>
              <div style={{fontWeight:700,fontSize:13,color:RE,marginBottom:6}}>⚠ Delete "{ev.name}"?</div>
              <div style={{fontSize:11,color:T2,marginBottom:10,lineHeight:1.5}}>
                This will permanently remove the event and all its inventory, sales ({ev.sales.length} records), customers and audit data. This cannot be undone.
              </div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>{onDelete(ev.id);onClose();}}
                  style={S.btn({flex:1,padding:"10px",fontSize:12,background:RE})}>
                  Yes, Delete
                </button>
                <button onClick={()=>sConfirmDel(false)}
                  style={S.bOut({flex:1,padding:"10px",fontSize:12})}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {tab==="inventory"&&(
        <div>
          <div style={{fontSize:12,color:T2,marginBottom:9}}>{ev.inv.length} items in this event</div>
          <div style={{maxHeight:300,overflowY:"auto",borderRadius:10,border:"1px solid "+CRD2,overflow:"hidden"}}>
            {ev.inv.slice(0,30).map((item,i,arr)=>(
              <div key={item.id} style={{display:"flex",alignItems:"center",gap:9,padding:"8px 12px",borderBottom:i<arr.length-1?"1px solid "+CRD2:"none",background:WH}}>
                <span style={{fontSize:18}}>{item.em}</span>
                <div style={{flex:1}}>
                  <div style={{fontSize:12,fontWeight:700,color:T1}}>{item.id}</div>
                  <div style={{fontSize:9.5,color:T3}}>{item.cat} · {item.col} · {item.st}</div>
                </div>
                <div style={{fontFamily:"Cormorant Garamond,serif",fontSize:12,fontWeight:700,color:G}}>{f$(item.fp)}</div>
              </div>
            ))}
            {ev.inv.length>30&&<div style={{padding:"10px",textAlign:"center",fontSize:11,color:T3}}>+ {ev.inv.length-30} more items</div>}
          </div>
        </div>
      )}

      {tab==="upload"&&(
        <div>
          <div style={S.sh}>Update Inventory from Excel</div>
          <div style={{display:"flex",gap:8,marginBottom:11}}>{[{id:"add",l:"Add new"},{id:"replace",l:"Replace all"}].map(m=>(
            <button key={m.id} onClick={()=>smode(m.id)} style={S.pill(mode===m.id)}>{m.l}</button>
          ))}</div>
          <input type="file" accept=".xlsx,.xls" onChange={e=>{const f=e.target.files[0];if(f){const r=new FileReader();r.onload=ev=>{parseXL(ev.target.result,ev2=>onUpdate({...ev,...(mode==="add"?{inv:[...ev.inv,...ev2.inv]}:{inv:ev2.inv})}));};r.readAsArrayBuffer(f);}}} style={{...S.inp(),cursor:"pointer",marginBottom:8}}/>
          <div style={{fontSize:11,color:T3,lineHeight:1.5}}>Upload the JCK price list Excel file to import inventory items.</div>
        </div>
      )}
    </Sheet>
  );
}

function SaleSuccess({sale,item,fc,cur,onDone,onPrint}){
  const [count,setCount]=useState(4);
  useEffect(()=>{
    const t=setInterval(()=>{
      setCount(p=>{
        if(p<=1){clearInterval(t);onDone();return 0;}
        return p-1;
      });
    },1000);
    return()=>clearInterval(t);
  },[]);
  const fmt=(n)=>"$"+Number(n||0).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2});
  return(
    <div style={{position:"fixed",inset:0,background:"#F5EDE0",zIndex:500,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,animation:"fadeIn 0.3s ease"}}>
      {/* Animated checkmark circle */}
      <div style={{width:90,height:90,borderRadius:"50%",background:"#1E5C45",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:20,animation:"popIn 0.5s cubic-bezier(0.34,1.56,0.64,1)"}}>
        <span style={{fontSize:44,color:"#F5EDE0",lineHeight:1}}>✓</span>
      </div>
      <div style={{fontFamily:"Cormorant Garamond,serif",fontSize:28,fontWeight:800,color:"#1E5C45",marginBottom:6}}>Sale Complete!</div>
      {sale.custName&&<div style={{fontSize:15,fontWeight:700,color:"#3D5C4A",marginBottom:14}}>👤 {sale.custName}</div>}
      {!sale.custName&&<div style={{fontSize:13,color:"#7A8C7E",marginBottom:14}}>Walk-in customer</div>}
      {/* Amount */}
      <div style={{fontFamily:"Cormorant Garamond,serif",fontSize:42,fontWeight:900,color:"#C9A84C",lineHeight:1,marginBottom:6}}>{fc(sale.total,cur)}</div>
      {/* Item detail */}
      <div style={{background:"#fff",borderRadius:12,padding:"10px 16px",marginBottom:24,textAlign:"center",border:"1px solid #E8DCCB",minWidth:220}}>
        <div style={{fontWeight:800,fontSize:14,color:"#1E5C45"}}>{sale.itemId}</div>
        <div style={{fontSize:11,color:"#7A8C7E",marginTop:2}}>{sale.itemName}</div>
        {sale.disc>0&&<div style={{fontSize:11,color:"#C8963A",marginTop:3}}>Disc {sale.disc}% applied</div>}
        {sale.ccAmt>0&&<div style={{fontSize:11,color:"#7A8C7E",marginTop:2}}>CC Surcharge: {fc(sale.ccAmt,cur)}</div>}
        <div style={{fontSize:12,fontWeight:700,color:"#1E5C45",marginTop:4}}>{sale.payment}</div>
      </div>
      {/* Buttons */}
      <div style={{display:"flex",gap:10,width:"100%",maxWidth:320}}>
        <button onClick={onPrint}
          style={{flex:1,padding:"14px",background:"#1E5C45",color:"#F5EDE0",border:"none",borderRadius:12,fontSize:14,fontWeight:700,cursor:"pointer"}}>
          🖨 Print Invoice
        </button>
        <button onClick={onDone}
          style={{flex:1,padding:"14px",background:"transparent",color:"#1E5C45",border:"2px solid #1E5C45",borderRadius:12,fontSize:14,fontWeight:700,cursor:"pointer"}}>
          ✕ Close
        </button>
      </div>
      <div style={{fontSize:11,color:"#B0A88A",marginTop:14}}>Auto-closing in {count}s...</div>
    </div>
  );
}

function ItemCard({item,user,inv,leads,cur,preCustName,onSell,onBack,onAddLead}){
  const pr=gp(user.role);
  const [mode,sm]=useState(null),[saleResult,setSaleResult]=useState(null),[f,sf]=useState({cu:preCustName||"",ph:"",email:"",company:"",source:"Walk-in",pm:"NEFT",disc:0,remark:"",cc_type:"pct",cc_val:""});
  const [matchedCust,setMatchedCust]=useState(null);
  const set=(k,v)=>{
    sf(p=>({...p,[k]:v}));
    if(k==="cu"&&v.trim().length>1){
      const match=leads.find(l=>l.name.toLowerCase().includes(v.trim().toLowerCase())||v.trim().toLowerCase().includes(l.name.toLowerCase()));
      if(match){
        setMatchedCust(match);
        sf(p=>({...p,ph:match.phone||p.ph,email:match.email||match.contact||p.email,company:match.company||p.company,source:match.source||p.source}));
      } else {
        setMatchedCust(null);
      }
    }
  };
  const dp=item.fp,dsc=Math.round(dp*f.disc/100*100)/100,subtotal=Math.round((dp-dsc)*100)/100;
  const tax=subtotal,cgst=0,sgst=0;
  const ccAmt=f.cc_type==="pct"?Math.round(subtotal*(parseFloat(f.cc_val)||0)/100*100)/100:Math.round((parseFloat(f.cc_val)||0)*100)/100;
  const tot=Math.round((subtotal+ccAmt)*100)/100;
  const margin=Math.round(((tax-item.cpt)/Math.max(tax,1))*100);
  const doSell=()=>{if(!f.cu.trim()||!f.ph.trim()||!f.email.trim()){
      const missing=[];
      if(!f.cu.trim())missing.push("Name");
      if(!f.ph.trim())missing.push("Phone");
      if(!f.email.trim())missing.push("Email");
      toast.error("Required fields missing",missing.join(", ")+" required to confirm.");
      return;
    }
    const existingCust=matchedCust||leads.find(l=>l.name.toLowerCase()===f.cu.trim().toLowerCase());
    let custId;
    if(existingCust){
      custId=existingCust.id;
      const updatedCust={...existingCust,name:f.cu.trim(),phone:f.ph.trim()||existingCust.phone,email:f.email.trim()||existingCust.email||existingCust.contact,company:f.company.trim()||existingCust.company,source:f.source||existingCust.source,contact:f.email.trim()||existingCust.contact};
      onAddLead(updatedCust,"update");
    } else {
      custId=uid("LD");
      const newCust={id:custId,name:f.cu.trim(),phone:f.ph.trim(),email:f.email.trim(),company:f.company.trim(),notes:"",status:"Warm",source:f.source||"Walk-in",contact:f.email.trim(),created:dstr()};
      onAddLead(newCust,"add");
    }const _s={id:uid("INV"),custId:custId||"",custName:f.cu.trim(),phone:f.ph.trim(),email:f.email.trim(),company:f.company.trim(),itemId:item.id,itemName:item.cat+" · "+item.col+" · "+item.metal,metal:item.metal,col:item.col,sz:item.sz,gw:item.gw,nw:item.nw,tc:item.tc,sp:item.sp,style:item.style,price:subtotal,disc:f.disc,cgst:0,sgst:0,ccType:f.cc_type,ccVal:f.cc_val,ccAmt:ccAmt,total:tot,currency:cur||"USD",margin,date:dstr(),time:tstr(),payment:f.pm,staff:user.name,st:mode==="d"?"pending":"completed",gt:"",remark:f.remark};setSaleResult(_s);onSell(_s);};
  const similar=inv.filter(i=>i.id!==item.id&&(i.col===item.col||i.cat===item.cat)&&i.st==="available").slice(0,3);
  if(saleResult)return(<SaleSuccess sale={saleResult} item={item} fc={fc} cur={cur} onDone={()=>{setSaleResult(null);onBack();}} onPrint={()=>{setSaleResult(null);sm(saleResult);}}/>);
  if(mode) return(
    <div style={{background:CRD,minHeight:"100%",padding:"10px 12px 40px"}}>
      <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:13}}>
        <button onClick={onBack} style={{background:"none",border:"none",color:T3,cursor:"pointer",fontSize:12}}>← Lookup</button>
        <span style={{color:T3}}>/</span>
        <button onClick={()=>sm(null)} style={{background:"none",border:"none",color:G,cursor:"pointer",fontSize:12,fontWeight:600}}>{item.id}</button>
        <span style={{color:T3}}>/ Sell</span>
      </div>
      <div style={{...S.card({margin:"0 0 10px",padding:"11px 13px"}),border:"2px solid "+(f.cu.trim()?"#E8DCCB":"#C9A84C"),borderRadius:12}}>
        {matchedCust&&(
          <div style={{background:"rgba(30,92,69,0.08)",borderRadius:8,padding:"6px 10px",marginBottom:8,display:"flex",alignItems:"center",gap:6}}>
            <span style={{fontSize:12}}>✓</span>
            <span style={{fontSize:11,fontWeight:700,color:G}}>Existing customer found</span>
            <button onClick={()=>setMatchedCust(null)} style={{marginLeft:"auto",background:"none",border:"none",color:T3,fontSize:11,cursor:"pointer"}}>Clear</button>
          </div>
        )}
        <span style={{...S.lbl,color:f.cu.trim()?"#1E5C45":RE}}>CUSTOMER NAME *</span>
        <input style={{...S.inp({marginBottom:8}),borderColor:f.cu.trim()?"#1E5C45":"#C9A84C",borderWidth:"2px"}} placeholder="Enter customer name..." value={f.cu} onChange={ev=>set("cu",ev.target.value)}/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
          <div>
            <span style={{...S.lbl,color:f.ph.trim()?T3:RE}}>PHONE *</span>
            <input style={{...S.inp({marginBottom:0}),borderColor:f.ph.trim()?"#E8DCCB":"#C9A84C",borderWidth:f.ph.trim()?"1.5px":"2px"}} placeholder="+1 555 1234" type="tel" value={f.ph} onChange={ev=>set("ph",ev.target.value)}/>
          </div>
          <div>
            <span style={{...S.lbl,color:f.email.trim()?T3:RE}}>EMAIL *</span>
            <input style={{...S.inp({marginBottom:0}),borderColor:f.email.trim()?"#E8DCCB":"#C9A84C",borderWidth:f.email.trim()?"1.5px":"2px"}} placeholder="email@co.com" type="email" value={f.email} onChange={ev=>set("email",ev.target.value)}/>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          <div>
            <span style={S.lbl}>COMPANY</span>
            <input style={S.inp({marginBottom:0})} placeholder="Store / company" value={f.company} onChange={ev=>set("company",ev.target.value)}/>
          </div>
          <div>
            <span style={S.lbl}>SOURCE</span>
            <select style={S.inp({marginBottom:0})} value={f.source} onChange={ev=>set("source",ev.target.value)}>
              {["Walk-in","Shopify","WhatsApp","Referral","Trade Show","Other"].map(s=><option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>
      <div style={{...S.cc({marginBottom:11,display:"flex",justifyContent:"space-between",alignItems:"center"})}}><div><div style={{fontWeight:700,fontSize:13,color:T1}}>{item.id}</div><div style={{fontSize:10,color:T3}}>{item.cat} · {item.col}</div></div><div style={{textAlign:"right"}}><div style={{fontFamily:"Cormorant Garamond,serif",fontSize:18,fontWeight:700,color:G}}>{fc(tax,cur)}</div>{f.disc>0&&<div style={{fontSize:9,color:AM}}>Disc {f.disc}%</div>}</div></div>
      <div style={{display:"flex",flexDirection:"column",gap:9,marginBottom:11}}>
        <div><span style={S.lbl}>PAYMENT</span><select style={S.inp()} value={f.pm} onChange={ev=>set("pm",ev.target.value)}>{["NEFT","RTGS","Cheque","Cash","UPI","Credit Card","Wire Transfer"].map(x=><option key={x}>{x}</option>)}</select></div>
        {pr.oP&&<div><span style={S.lbl}>DISCOUNT % (MAX 20)</span><input type="number" style={S.inp()} min="0" max="20" value={f.disc} onChange={ev=>set("disc",Math.min(20,Math.max(0,Number(ev.target.value))))}/></div>}
        
        <div>{f.pm==="Credit Card"&&(
        <div style={{background:"rgba(30,92,69,0.06)",borderRadius:10,padding:10,border:"1.5px solid "+G,marginBottom:8}}>
          <div style={{fontWeight:700,fontSize:10,color:G,marginBottom:8,textTransform:"uppercase"}}>💳 Credit Card Surcharge</div>
          <div style={{display:"flex",gap:8,marginBottom:8}}>
            <button onClick={()=>set("cc_type","pct")} style={{flex:1,padding:8,borderRadius:8,border:"1.5px solid "+(f.cc_type==="pct"?G:CRD2),background:f.cc_type==="pct"?G:"transparent",color:f.cc_type==="pct"?CR:T2,fontFamily:"Lato,sans-serif",fontSize:12,fontWeight:600,cursor:"pointer"}}>% Percentage</button>
            <button onClick={()=>set("cc_type","amt")} style={{flex:1,padding:8,borderRadius:8,border:"1.5px solid "+(f.cc_type==="amt"?G:CRD2),background:f.cc_type==="amt"?G:"transparent",color:f.cc_type==="amt"?CR:T2,fontFamily:"Lato,sans-serif",fontSize:12,fontWeight:600,cursor:"pointer"}}>Fixed Amount</button>
          </div>
          <input type="number" step="0.01" min="0" style={S.inp({borderColor:G})} placeholder={f.cc_type==="pct"?"e.g. 2.5  (2.5%)":"e.g. 25 (fixed)"} value={f.cc_val} onChange={e=>set("cc_val",e.target.value)}/>
          {f.cc_val&&parseFloat(f.cc_val)>0&&<div style={{fontSize:11,color:G,fontWeight:600,marginTop:6,padding:"5px 9px",background:"rgba(30,92,69,0.08)",borderRadius:7}}>Surcharge: {f.cc_type==="pct"?f.cc_val+"% = ":""}{fc(ccAmt,cur)}</div>}
        </div>
      )}
      <span style={S.lbl}>REMARKS</span><textarea style={S.inp({height:56,resize:"none"})} placeholder="Gift wrap, notes..." value={f.remark} onChange={ev=>set("remark",ev.target.value)}/></div>
      </div>
      <div style={{...S.cc({marginBottom:11})}}>
        {[["Price",fc(dp,cur)],f.disc>0?["Disc ("+f.disc+"%)","− "+fc(dsc,cur)]:null,ccAmt>0?["💳 CC"+(f.cc_type==="pct"?" "+f.cc_val+"%":""),fc(ccAmt,cur)]:null].filter(Boolean).map(([l,v])=>(
          <div key={l} style={{display:"flex",justifyContent:"space-between",fontSize:11,color:T2,marginBottom:3}}><span>{l}</span><span>{v}</span></div>
        ))}
        <div style={{height:2,background:G,borderRadius:1,margin:"6px 0"}}/>
        <div style={{display:"flex",justifyContent:"space-between",fontWeight:700,fontSize:14,color:G}}><span>GRAND TOTAL</span><span style={{fontFamily:"Cormorant Garamond,serif",fontSize:18}}>{fc(tot,cur)}</span></div>
      </div>
      <button style={S.btn()} onClick={doSell} onMouseDown={e=>{e.currentTarget.style.transform="scale(0.96)";}} onMouseUp={e=>{e.currentTarget.style.transform="";}} onTouchStart={e=>{e.currentTarget.style.transform="scale(0.96)";}} onTouchEnd={e=>{e.currentTarget.style.transform="";}} >✓ Confirm Sale &amp; Invoice</button>
              {!f.cu.trim()&&<div style={{fontSize:11,color:RE,textAlign:"center",marginTop:6}}>⚠ Enter customer name above to confirm</div>}
    </div>
  );
  return(
    <div style={{background:CRD,minHeight:"100%"}}>
      <div style={{padding:"10px 12px 0"}}><button onClick={onBack} style={{background:"none",border:"none",color:G,cursor:"pointer",fontSize:13,fontWeight:600,display:"flex",alignItems:"center",gap:5}}>← Back to Lookup</button></div>
      <div style={{background:G,padding:"13px 15px",margin:"10px 12px 0",borderRadius:"12px 12px 0 0"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
          <div><div style={{fontFamily:"Cormorant Garamond,serif",fontSize:20,fontWeight:700,color:CR}}>{item.id}</div><div style={{fontSize:10,color:"rgba(245,237,224,0.6)",marginTop:1}}>Style: {item.style}</div></div>
          <span style={{background:"rgba(255,255,255,0.15)",color:CR,border:"1px solid rgba(255,255,255,0.2)",borderRadius:20,padding:"3px 10px",fontSize:10,fontWeight:700}}>{item.cat}</span>
        </div>
        <div style={{background:"rgba(0,0,0,0.2)",borderRadius:10,height:140,display:"flex",alignItems:"center",justifyContent:"center",fontSize:64,marginBottom:12}}>{item.em}</div>
        <div style={{fontSize:9,color:"rgba(245,237,224,0.5)",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:3}}>FINAL SALE PRICE</div>
        <div style={{display:"flex",alignItems:"baseline",gap:8,marginBottom:pr.sF?4:10}}>
          <span style={{fontFamily:"Cormorant Garamond,serif",fontSize:36,fontWeight:700,color:CR,lineHeight:1}}>{fc(dp,cur)}</span>
          <span style={{fontSize:10,color:"rgba(245,237,224,0.5)"}}>list price</span>
        </div>
        {pr.sF&&<div style={{fontSize:9.5,color:"rgba(245,237,224,0.5)",marginBottom:12}}>Today Cost + Tariffs ÷ 0.75 (25% margin)</div>}
        <div style={{display:"flex",flexDirection:"column",gap:7}}>
          <button style={{background:GO,color:G,border:"none",borderRadius:9,fontSize:12,fontWeight:700,padding:"12px",cursor:"pointer",textTransform:"uppercase"}} onClick={()=>sm("d")}>SOLD DELIVERED</button>
          <button onClick={()=>sm("n")} style={{background:"rgba(255,255,255,0.12)",border:"1.5px solid rgba(245,237,224,0.25)",color:CR,borderRadius:9,fontSize:12,fontWeight:700,padding:"12px",cursor:"pointer"}}>SOLD NO DELIVERY</button>
          <button onClick={()=>sm("o")} style={{background:"transparent",color:"#DFC06A",border:"1.5px solid rgba(184,150,74,0.5)",borderRadius:9,fontSize:12,fontWeight:700,padding:"12px",cursor:"pointer"}}>ORDER IT</button>
        </div>
      </div>
      <div style={{margin:"0 12px",background:WH,borderRadius:"0 0 12px 12px",padding:"13px 14px 2px",marginBottom:0}}>
        {pr.sB&&<><div style={S.sh}>$ PRICING BREAKDOWN</div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:13}}>{[["Today Cost",fc(item.tod,cur)],["Inward Val",fc(item.iv,cur)],["Cost+Tar",fc(item.cpt,cur)],["Inward+Tar",fc(item.ipt,cur)],["Calc Sale",fc(item.fp,cur)],["Margin",Math.round(((item.fp-item.cpt)/Math.max(item.fp,1))*100)+"%"]].map(([l,v])=><div key={l} style={{background:CRD,borderRadius:8,padding:"8px 9px"}}><div style={{fontSize:8,color:T3,textTransform:"uppercase"}}>{l}</div><div style={{fontSize:13,fontWeight:700,color:T1,marginTop:1}}>{v}</div></div>)}</div></>}
        <div style={S.sh}>📋 DETAILS</div>
        <div style={{...S.cc({marginBottom:13})}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>{[["Collection",item.col],["Metal",item.metal],["Size",item.sz||"—"],["Gross Wt",item.gw+"g"],["Net Wt",item.nw+"g"],["Carats",item.tc+"ct"],["Stone Pcs",item.sp],["Qty",item.qty||1]].map(([l,v])=><div key={l}><div style={{fontSize:8,color:T3,textTransform:"uppercase"}}>{l}</div><div style={{fontSize:12,fontWeight:700,marginTop:1,color:T1}}>{v}</div></div>)}</div>
        </div>
        {item.stones&&item.stones.length>0&&<><div style={S.sh}>💎 STONES</div><table style={{width:"100%",borderCollapse:"collapse",fontSize:11,marginBottom:13}}><thead><tr style={{background:CRD2}}>{["SHAPE","CLARITY","PCS","CTS","TOTAL"].map(h=><th key={h} style={{padding:"6px 8px",textAlign:"left",fontSize:9,fontWeight:700,color:T2}}>{h}</th>)}</tr></thead><tbody>{item.stones.map((s,i)=><tr key={i} style={{borderBottom:"1px solid "+CRD2}}><td style={{padding:"7px 8px"}}>{s.sh}</td><td style={{padding:"7px 8px"}}>{s.cl}</td><td style={{padding:"7px 8px"}}>{s.pc}</td><td style={{padding:"7px 8px"}}>{s.ct}</td><td style={{padding:"7px 8px"}}>{s.tct}</td></tr>)}</tbody></table></>}
        {similar.length>0&&<><div style={S.sh}>✨ SIMILAR</div>{similar.map(s=><div key={s.id} onClick={()=>window._switchItem&&window._switchItem(s)} style={{...S.cc({marginBottom:8,display:"flex",gap:9,alignItems:"center",cursor:"pointer"})}}><span style={{fontSize:20}}>{s.em}</span><div style={{flex:1}}><div style={{fontWeight:700,fontSize:12,color:T1}}>{s.id}</div><div style={{fontSize:9.5,color:T3}}>{s.col}</div></div><div style={{fontFamily:"Cormorant Garamond,serif",fontSize:12,fontWeight:700,color:G}}>{fc(s.fp,cur)}</div></div>)}</>}
        <div style={{height:40}}/>
      </div>
    </div>
  );
}
function InvoiceSheet({sale,onClose}){
  const sub=sale.price,dsc=sale.disc>0?Math.round(sub*sale.disc/100*100)/100:0,tax=sub-dsc,tot=sale.total;
  const doPrint=()=>{const w=window.open("","_blank"),s=sale;w.document.write('<!DOCTYPE html><html><head><title>Invoice '+s.id+'</title><style>body{font-family:Arial,sans-serif;padding:28px;max-width:640px;margin:0 auto;color:#222}.hdr{display:flex;justify-content:space-between;border-bottom:3px solid #1E5C45;padding-bottom:12px;margin-bottom:12px}h1{color:#1E5C45;font-family:Georgia,serif;font-size:20px;margin:0}.bi{font-size:9px;color:#888;line-height:1.5;margin-top:3px}.mr{text-align:right;font-size:10px;color:#555;line-height:1.6}.bt{background:#F5EDE0;padding:9px 11px;border-radius:6px;margin-bottom:11px}.ibox{border:1px solid #E8DCCB;padding:9px;border-radius:6px;margin-bottom:9px}.tr{display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #E8DCCB;font-size:11px}.grand{font-size:14px;font-weight:700;color:#1E5C45;border-top:2px solid #1E5C45;border-bottom:none;padding-top:7px;margin-top:3px}.note{padding:8px 10px;border-radius:5px;margin-top:7px}.footer{margin-top:14px;padding-top:9px;border-top:1px solid #E8DCCB;display:flex;justify-content:space-between}@media print{body{padding:14px}}</style></head><body>');w.document.write('<div class="hdr"><div><h1>Vianne Jewels</h1><div class="bi">GSTIN: 27XXXXX1234X1ZX | HSN: 7113<br/>viannejewels@gmail.com | www.viannejewels.com<br/>EW-8012, Bharat Diamond Bourse, BKC, Mumbai 400051</div></div><div class="mr"><strong style="font-size:14px;color:#1E5C45">TAX INVOICE</strong><br/>'+s.id+'<br/>'+s.date+' '+s.time+'<br/>'+s.staff+' | '+s.payment+'</div></div>');w.document.write('<div class="bt"><strong style="font-size:13px;color:#1E5C45">'+s.custName+'</strong>'+(s.phone?'<br/><span style="font-size:9px;color:#666">'+s.phone+'</span>':'')+'</div>');w.document.write('<div class="ibox"><strong style="color:#1E5C45;font-size:11px">'+s.itemId+'</strong><div style="font-size:9px;color:#7A8C7E;margin-top:2px">'+s.itemName+'<br/>Sz:'+s.sz+' Gw:'+s.gw+'g Nw:'+s.nw+'g '+s.tc+'ct</div><div style="display:flex;justify-content:space-between;margin-top:6px;padding-top:5px;border-top:1px dashed #E8DCCB;font-size:10px"><span style="color:#888">'+s.metal+' HSN:7113 Qty:1</span><strong>'+f$(sub)+'</strong></div></div>');w.document.write('<div class="tr"><span>Subtotal</span><span>'+f$(sub)+'</span></div>');if(s.disc>0)w.document.write('<div class="tr" style="color:#C8963A"><span>Discount('+s.disc+'%)</span><span>-'+f$(dsc)+'</span></div>');s.ccAmt>0&&w.document.write('<div class="tr"><span>CC Surcharge'+(s.ccType==="pct"?" ("+s.ccVal+"%)":"")+"</span><span>"+f$(s.ccAmt)+"</span></div>");w.document.write('<div class="tr grand"><span>GRAND TOTAL</span><span>'+f$(tot)+'</span></div>');if(s.remark)w.document.write('<div class="note" style="background:#FDF5E6"><div style="font-size:8px;color:#C8963A;font-weight:700;text-transform:uppercase">Remarks</div><div style="font-size:10px;margin-top:2px">'+s.remark+'</div></div>');w.document.write('<div class="footer"><div style="font-size:8px;color:#888"><strong style="color:#C9A84C">VIANNE JEWELS</strong><br/>Disputes subject to Mumbai jurisdiction.</div><div style="text-align:right"><div style="width:80px;border-bottom:1px solid #ccc;height:20px;margin-left:auto"></div><div style="font-size:7px;color:#aaa;margin-top:2px">Auth. Signatory</div></div></div></body></html>');w.document.close();setTimeout(()=>w.print(),400);};
  return(<Sheet onClose={onClose} title="Tax Invoice">
    <div style={{display:"flex",gap:8,marginBottom:13}}><button style={S.btn({flex:1,padding:"11px",fontSize:12,display:"flex",alignItems:"center",justifyContent:"center",gap:6})} onClick={doPrint}>🖨 Print Invoice</button><button style={S.bOut({padding:"11px 13px",fontSize:12})} onClick={()=>toast.info("Share","Use WhatsApp or Email to share")}>📤 Share</button></div>
    <div style={{background:WH,borderRadius:10,padding:13,border:"1px solid "+CRD2}}>
      <div style={{borderBottom:"3px solid "+G,paddingBottom:10,marginBottom:10,display:"flex",justifyContent:"space-between"}}><div><div style={{fontFamily:"Cormorant Garamond,serif",fontSize:16,fontWeight:700,color:G}}>Vianne Jewels</div><div style={{fontSize:8,color:"#888",marginTop:1}}>GSTIN: 27XXXXX1234X1ZX · HSN: 7113</div></div><div style={{textAlign:"right"}}><div style={{fontWeight:700,fontSize:10,color:G}}>TAX INVOICE</div><div style={{fontSize:10,color:"#555"}}>{sale.id}</div><div style={{fontSize:9,color:"#888"}}>{sale.date} · {sale.staff}</div></div></div>
      <div style={{background:"#F5EDE0",borderRadius:5,padding:"7px 9px",marginBottom:9}}><div style={{fontWeight:700,fontSize:12,color:G}}>{sale.custName}</div>{sale.phone&&<div style={{fontSize:9,color:"#666",marginTop:1}}>{sale.phone}</div>}<div style={{fontSize:9,color:"#888",marginTop:1}}>{sale.payment}</div></div>
      <div style={{border:"1px solid "+CRD2,borderRadius:6,padding:8,marginBottom:9}}><div style={{fontWeight:700,fontSize:11,color:G}}>{sale.itemId}</div><div style={{fontSize:9,color:"#555",marginTop:2,lineHeight:1.4}}>{sale.itemName}{sale.sz&&<span><br/>Sz:{sale.sz} · {sale.gw}g · {sale.tc}ct</span>}</div><div style={{display:"flex",justifyContent:"space-between",marginTop:6,paddingTop:5,borderTop:"1px dashed "+CRD2,fontSize:10}}><span style={{color:"#888"}}>{sale.metal} · Qty 1</span><span style={{fontWeight:700,color:G}}>{f$(sub)}</span></div></div>
      <div style={{background:CRD,borderRadius:6,padding:"8px 9px"}}>
        {[["Subtotal",f$(sub),false],sale.disc>0?["Disc ("+sale.disc+"%)","−"+f$(dsc),true]:null,sale.ccAmt>0?["💳 CC"+(sale.ccType==="pct"?" "+sale.ccVal+"%":""),f$(sale.ccAmt),false]:null].filter(Boolean).map(([l,v,d])=><div key={l} style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3,color:d?AM:"#666"}}><span>{l}</span><span>{v}</span></div>)}
        <div style={{height:2,background:G,borderRadius:1,margin:"5px 0"}}/>
        <div style={{display:"flex",justifyContent:"space-between",fontWeight:700,fontSize:14,color:G}}><span>GRAND TOTAL</span><span style={{fontFamily:"Cormorant Garamond,serif",fontSize:16}}>{f$(tot)}</span></div>
      </div>
      
      {sale.remark&&<div style={{background:AMBG,borderRadius:5,padding:"7px 9px",marginTop:7}}><div style={{fontSize:8,color:AM,fontWeight:700,textTransform:"uppercase"}}>Remarks</div><div style={{fontSize:10,color:"#555",marginTop:2}}>{sale.remark}</div></div>}
    </div>
  </Sheet>);
}

// ─── USER MANAGER ────────────────────────────────────────────────────────────
function UserManager({users,currentUser,onUsersChange}){
  const [editPerms,sEP]=useState(null);
  const [showAdd,sAdd]=useState(false);
  const [form,sf]=useState({name:"",un:"",pw:"",role:"Staff"});
  const PK=[{k:"vP",l:"View Prices"},{k:"vH",l:"View History"},{k:"vA",l:"View Revenue & Analytics"},{k:"oP",l:"Override Price"},{k:"eC",l:"Export CSV"},{k:"mU",l:"Manage Users"},{k:"sF",l:"Show Formula"},{k:"sB",l:"Show Breakdown"},{k:"delSale",l:"Delete Sales Entry"}];
  const RD={Admin:{vP:1,vH:1,vA:1,oP:1,eC:1,mU:1,sF:1,sB:1,delSale:1},Manager:{vP:1,vH:1,vA:1,oP:1,eC:0,mU:0,sF:1,sB:1,delSale:0},Staff:{vP:1,vH:0,vA:0,oP:0,eC:0,mU:0,sF:0,sB:0,delSale:0}};

  const addUser=()=>{
    if(!form.name.trim()||!form.un.trim()||!form.pw.trim())return;
    if(users.find(u=>u.un===form.un.trim().toLowerCase())){toast.error("Username already exists","Choose a different username.");return;}
    onUsersChange([...users,{id:Date.now(),name:form.name.trim(),un:form.un.trim().toLowerCase(),pw:form.pw.trim(),role:form.role,perms:null}]);
    sf({name:"",un:"",pw:"",role:"Staff"});sAdd(false);
  };

  if(editPerms){
    const base={...(RD[editPerms.role]||RD.Staff),...(editPerms.perms||{})};
    return(
      <div style={{...S.card({margin:0,marginBottom:12})}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div><div style={{fontWeight:700,fontSize:14,color:T1}}>{editPerms.name}</div><div style={{fontSize:10,color:T3}}>Editing permissions · {editPerms.role}</div></div>
          <button onClick={()=>sEP(null)} style={{background:"none",border:"none",fontSize:20,color:T3,cursor:"pointer"}}>✕</button>
        </div>
        <div style={{background:AMBG,borderRadius:8,padding:"8px 11px",marginBottom:11,fontSize:10,color:AM,fontWeight:600}}>Defaults set by role. Toggle to customise this user only.</div>
        {PK.map(({k,l})=>(
          <div key={k} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 0",borderBottom:"1px solid "+CRD2}}>
            <span style={{fontSize:13,color:T1}}>{l}</span>
            <div onClick={()=>sEP(p=>({...p,perms:{...base,[k]:base[k]?0:1}}))} style={{width:42,height:24,background:base[k]?G:"#ccc",borderRadius:12,position:"relative",cursor:"pointer",flexShrink:0}}>
              <div style={{position:"absolute",width:18,height:18,top:3,left:base[k]?21:3,background:WH,borderRadius:"50%"}}/>
            </div>
          </div>
        ))}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:13}}>
          <button style={S.btn({padding:"11px",fontSize:12})} onClick={()=>{onUsersChange(users.map(u=>u.id===editPerms.id?{...u,perms:editPerms.perms}:u));sEP(null);}}>✓ Save</button>
          <button style={S.bOut({padding:"11px",fontSize:12})} onClick={()=>{onUsersChange(users.map(u=>u.id===editPerms.id?{...u,perms:null}:u));sEP(null);}}>↺ Reset to Role Default</button>
        </div>
      </div>
    );
  }

  return(
    <div style={{...S.card({margin:0,marginBottom:12})}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div style={{fontWeight:700,fontSize:10,color:T2,textTransform:"uppercase",letterSpacing:"0.1em"}}>👥 USER MANAGEMENT</div>
        <button onClick={()=>sAdd(x=>!x)} style={{background:showAdd?CRD2:GO,color:showAdd?T2:G,border:"none",borderRadius:7,padding:"5px 11px",fontFamily:"Lato,sans-serif",fontSize:11,fontWeight:700,cursor:"pointer"}}>{showAdd?"✕ Cancel":"+ Add User"}</button>
      </div>
      {showAdd&&(
        <div style={{background:CRD,borderRadius:10,padding:12,marginBottom:12,border:"1px solid "+CRD2}}>
          <div style={{fontWeight:700,fontSize:12,color:G,marginBottom:9}}>New User</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            <div><span style={S.lbl}>FULL NAME *</span><input style={S.inp()} placeholder="e.g. Rahul Shah" value={form.name} onChange={ev=>sf(p=>({...p,name:ev.target.value}))}/></div>
            <div><span style={S.lbl}>USERNAME *</span><input style={S.inp()} placeholder="e.g. rahul" value={form.un} onChange={ev=>sf(p=>({...p,un:ev.target.value}))} autoCapitalize="none"/></div>
            <div><span style={S.lbl}>PASSWORD *</span><input style={S.inp()} placeholder="Set a password" value={form.pw} onChange={ev=>sf(p=>({...p,pw:ev.target.value}))}/></div>
            <div><span style={S.lbl}>ROLE</span>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:7,marginTop:4}}>
                {["Admin","Manager","Staff"].map(r=>(
                  <button key={r} onClick={()=>sf(p=>({...p,role:r}))} style={{padding:"9px",borderRadius:8,border:"1.5px solid "+(form.role===r?G:CRD2),background:form.role===r?G:"transparent",color:form.role===r?CR:T2,fontFamily:"Lato,sans-serif",fontSize:12,fontWeight:600,cursor:"pointer"}}>{r}</button>
                ))}
              </div>
            </div>
          </div>
          <button style={S.btn({marginTop:10,padding:"11px",fontSize:13})} onClick={addUser} disabled={!form.name||!form.un||!form.pw}>✓ Create User</button>
        </div>
      )}
      {users.map(u=>(
        <div key={u.id} style={{padding:"10px 0",borderBottom:"1px solid "+CRD2}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:7}}>
            <div style={{width:34,height:34,background:u.id===currentUser.id?GO:G,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:u.id===currentUser.id?G:CR,flexShrink:0}}>{u.name[0]}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:13,fontWeight:700,color:T1}}>{u.name}{u.id===currentUser.id&&<span style={{fontSize:9,color:T3,fontWeight:400}}> (you)</span>}</div>
              <div style={{fontSize:10,color:T3}}>@{u.un}{u.perms&&<span style={{color:AM}}> · custom perms</span>}</div>
            </div>
            <select value={u.role} onChange={ev=>onUsersChange(users.map(x=>x.id===u.id?{...x,role:ev.target.value,perms:null}:x))} disabled={u.id===currentUser.id} style={{background:CRD,border:"1.5px solid "+CRD2,borderRadius:7,padding:"4px 7px",fontSize:11,fontWeight:600,color:G,cursor:"pointer",fontFamily:"Lato,sans-serif"}}>
              <option>Admin</option><option>Manager</option><option>Staff</option>
            </select>
          </div>
          {u.id!==currentUser.id&&(
            <div style={{display:"flex",gap:7,paddingLeft:44}}>
              <button onClick={()=>sEP({...u})} style={{flex:1,background:CRD,border:"1px solid "+CRD2,borderRadius:7,padding:"7px",fontFamily:"Lato,sans-serif",fontSize:11,fontWeight:600,color:G,cursor:"pointer"}}>🔐 Edit Permissions</button>
              <button onClick={()=>{if(window.confirm("Delete "+u.name+"?"))onUsersChange(users.filter(x=>x.id!==u.id));}} style={{background:REBG,border:"1px solid rgba(160,48,48,0.2)",borderRadius:7,padding:"7px 11px",fontFamily:"Lato,sans-serif",fontSize:11,fontWeight:600,color:RE,cursor:"pointer"}}>✕</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}


function PhotoSearch({inv,onResult,onClose}){
  const [phase,setPhase]=useState("upload");
  const [preview,setPreview]=useState(null);
  const [results,setResults]=useState([]);
  const [features,setFeatures]=useState(null);
  const [error,setError]=useState("");
  const [analyzing,setAnalyzing]=useState(false);
  const fileRef=useRef(null);
  const canvasRef=useRef(null);

  // ── HSL helper ──────────────────────────────────────────────────────────
  const toHsl=(r,g,b)=>{
    const rn=r/255,gn=g/255,bn=b/255;
    const mx=Math.max(rn,gn,bn),mn=Math.min(rn,gn,bn);
    let h=0,s=0;
    const l=(mx+mn)/2;
    if(mx!==mn){
      const d=mx-mn;
      s=l>0.5?d/(2-mx-mn):d/(mx+mn);
      if(mx===rn) h=((gn-bn)/d+(gn<bn?6:0))/6;
      else if(mx===gn) h=((bn-rn)/d+2)/6;
      else h=((rn-gn)/d+4)/6;
    }
    return[h*360,s*100,l*100];
  };

  // ── Metal detection — sample brightest metallic pixels ─────────────────
  const detectMetal=(pixels,w,h)=>{
    const buckets={YG:0,WG:0,RG:0,PT:0};
    let metalPx=0;
    for(let i=0;i<pixels.length;i+=4){
      const r=pixels[i],g=pixels[i+1],b=pixels[i+2],a=pixels[i+3];
      if(a<80) continue;
      const[hue,sat,lig]=toHsl(r,g,b);
      // Only consider metallic-looking pixels (moderate saturation, moderate brightness)
      if(lig<20||lig>92) continue;
      if(sat<5&&lig>45){buckets.PT++;metalPx++;continue;} // platinum/silver/white gold
      if(sat<8) continue; // too grey, skip
      metalPx++;
      // Yellow gold: warm hue 30-65, decent saturation
      if(hue>=28&&hue<=65&&sat>12&&lig>30){buckets.YG+=2;continue;}
      // Rose gold: pinkish red hue, warm
      if((hue>=340||hue<=25)&&sat>12&&r>b){buckets.RG++;continue;}
      // White gold / rhodium: cool, low sat
      if(sat<22&&lig>42){buckets.WG++;continue;}
    }
    if(metalPx===0) return{metal:"WG",conf:0};
    const best=Object.entries(buckets).sort((a,b)=>b[1]-a[1])[0];
    const conf=Math.min(100,Math.round(best[1]/metalPx*100));
    return{metal:best[0]==="PT"?"WG":best[0],conf};
  };

  // ── Stone/diamond detection — look for sparkle clusters ─────────────────
  const detectStones=(pixels,w,h)=>{
    let sparklePx=0,total=0;
    for(let i=0;i<pixels.length;i+=4){
      if(pixels[i+3]<80) continue;
      total++;
      const r=pixels[i],g=pixels[i+1],b=pixels[i+2];
      const brightness=(r+g+b)/3;
      const spread=Math.max(r,g,b)-Math.min(r,g,b);
      // Sparkle: very bright AND colour-neutral (white sparkle of diamond)
      if(brightness>215&&spread<35) sparklePx++;
    }
    if(total===0) return false;
    const ratio=sparklePx/total;
    return ratio>0.03; // >3% sparkle pixels = stones likely present
  };

  // ── Shape/Category detection — aspect ratio + mass distribution ─────────
  const detectCategory=(pixels,w,h)=>{
    // Find bounding box of non-background pixels
    let minX=w,maxX=0,minY=h,maxY=0;
    let massX=0,massY=0,cnt=0;
    for(let y=0;y<h;y++){
      for(let x=0;x<w;x++){
        const i=(y*w+x)*4;
        if(pixels[i+3]<60) continue;
        const br=(pixels[i]+pixels[i+1]+pixels[i+2])/3;
        if(br>240) continue; // skip near-white background
        if(br<8) continue;   // skip near-black background
        if(x<minX)minX=x; if(x>maxX)maxX=x;
        if(y<minY)minY=y; if(y>maxY)maxY=y;
        massX+=x; massY+=y; cnt++;
      }
    }
    if(cnt<50) return{cat:"Rings",conf:30}; // not enough signal

    const bw=maxX-minX+1, bh=maxY-minY+1;
    const ar=bw/Math.max(bh,1);
    const cx=massX/cnt/w, cy=massY/cnt/h; // centre of mass (normalised)

    // Ring detection: roughly square, centre of mass near middle,
    // possible hole in centre (check centre pixel brightness)
    const centrePx=((Math.round(h/2)*w+Math.round(w/2))*4);
    const centreIsLight=(pixels[centrePx]+pixels[centrePx+1]+pixels[centrePx+2])/3>180;

    if(ar>2.8) return{cat:"Bracelets",conf:85};
    if(ar>1.8) return{cat:"Necklaces",conf:75};
    if(ar<0.55) return{cat:"Pendants",conf:75};
    if(ar>0.75&&ar<1.4&&centreIsLight) return{cat:"Rings",conf:80};
    if(ar>0.6&&ar<1.6&&(cy<0.42||cy>0.58)) return{cat:"Earrings",conf:70};
    if(ar>0.9&&ar<1.5) return{cat:"Rings",conf:60};
    return{cat:"Pendants",conf:40};
  };

  // ── Colour palette extraction (k-means lite, 4 clusters) ────────────────
  const getPalette=(pixels)=>{
    const samples=[];
    for(let i=0;i<pixels.length;i+=pixels.length/200*4|0){
      if(i>=pixels.length) break;
      if(pixels[i+3]<80) continue;
      const br=(pixels[i]+pixels[i+1]+pixels[i+2])/3;
      if(br<12||br>245) continue;
      samples.push([pixels[i],pixels[i+1],pixels[i+2]]);
    }
    if(samples.length===0) return[];
    // Simple 4-means: 2 iterations
    let centres=samples.slice(0,4).map(s=>[...s]);
    for(let iter=0;iter<3;iter++){
      const sums=centres.map(()=>[0,0,0,0]);
      samples.forEach(s=>{
        let bi=0,bd=Infinity;
        centres.forEach((c,ci)=>{
          const d=(s[0]-c[0])**2+(s[1]-c[1])**2+(s[2]-c[2])**2;
          if(d<bd){bd=d;bi=ci;}
        });
        sums[bi][0]+=s[0];sums[bi][1]+=s[1];sums[bi][2]+=s[2];sums[bi][3]++;
      });
      centres=sums.map((s,i)=>s[3]>0?[s[0]/s[3],s[1]/s[3],s[2]/s[3]]:centres[i]);
    }
    return centres.map(c=>c.map(Math.round));
  };

  // ── Main analysis ────────────────────────────────────────────────────────
  const analyzeImage=(imgEl)=>{
    const canvas=canvasRef.current;
    const SZ=120;
    canvas.width=SZ; canvas.height=SZ;
    const ctx=canvas.getContext("2d");

    // Draw greyscale version to help with shape
    ctx.drawImage(imgEl,0,0,SZ,SZ);
    const data=ctx.getImageData(0,0,SZ,SZ);
    const px=data.data;

    const {metal,conf:mConf}=detectMetal(px,SZ,SZ);
    const hasStones=detectStones(px,SZ,SZ);
    const {cat:category,conf:cConf}=detectCategory(px,SZ,SZ);
    const palette=getPalette(px);

    const feat={metal,mConf,hasStones,category,cConf,palette};
    setFeatures(feat);

    // ── Score inventory items ──────────────────────────────────────────────
    const metalMap={
      YG:["KY","14KY","18KY","G14KY","G18KY"],
      WG:["KW","14KW","18KW","G14KW","G18KW","PT"],
      RG:["KR","14KR","18KR","G14KR","G18KR","RG"],
    };
    const metalKeys=metalMap[metal]||[];

    const scored=inv.map(item=>{
      let score=0;
      const im=(item.metal||"").toUpperCase();

      // ── Category score (0-40) ──────────────────────────────────────────
      if(item.cat===category){
        score+=Math.round(40*cConf/100);
      } else {
        // Partial: necklace ↔ pendant, bracelet ↔ bangle
        const partials={
          "Necklaces":"Pendants","Pendants":"Necklaces",
          "Bracelets":"Bangles","Bangles":"Bracelets",
        };
        if(partials[category]===item.cat||partials[item.cat]===category){
          score+=Math.round(20*cConf/100);
        }
      }

      // ── Metal score (0-35) ─────────────────────────────────────────────
      const metalMatch=metalKeys.some(k=>im.includes(k));
      if(metalMatch){
        score+=Math.round(35*mConf/100);
      } else {
        score+=5; // small credit — at least it's metal
      }

      // ── Stone score (0-15) ─────────────────────────────────────────────
      const itemHasStones=(item.tc||0)>0.1;
      if(hasStones===itemHasStones) score+=15;
      else score+=3;

      // ── Status bonus/penalty ───────────────────────────────────────────
      if(item.st==="available") score+=5;
      else if(item.st==="sold") score-=15;

      // ── Price range bonus (items with price > 0) ───────────────────────
      if(item.fp>0) score+=2;

      return{item,score:Math.max(0,Math.min(99,score))};
    });

    const top=scored
      .filter(x=>x.score>=25)
      .sort((a,b)=>b.score-a.score)
      .slice(0,6);

    setResults(top);
    setPhase("results");
    setAnalyzing(false);
  };

  const handleFile=(e)=>{
    const file=e.target.files&&e.target.files[0];
    if(!file) return;
    if(!file.type.startsWith("image/")){setError("Please select an image file.");return;}
    setError("");
    setAnalyzing(true);
    setPhase("analyzing");
    const reader=new FileReader();
    reader.onload=(ev)=>{
      setPreview(ev.target.result);
      const img=new Image();
      img.onload=()=>analyzeImage(img);
      img.onerror=()=>{setError("Could not load image.");setPhase("upload");setAnalyzing(false);};
      img.src=ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  const scoreBar=(score)=>{
    const col=score>=70?G:score>=50?AM:T3;
    return(
      <div style={{display:"flex",alignItems:"center",gap:5}}>
        <div style={{width:40,height:5,background:CRD2,borderRadius:3,overflow:"hidden"}}>
          <div style={{width:score+"%",height:"100%",background:col,borderRadius:3}}/>
        </div>
        <span style={{fontSize:10,fontWeight:700,color:col}}>{score}%</span>
      </div>
    );
  };

  return(
    <div style={{...S.card({margin:0,marginBottom:12}),border:"2px solid #7B3FA0"}}>
      <canvas ref={canvasRef} style={{display:"none"}}/>

      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div style={{fontWeight:700,fontSize:12,color:"#7B3FA0",display:"flex",alignItems:"center",gap:6}}>
          <span style={{fontSize:16}}>🖼</span> PHOTO SEARCH
        </div>
        <button onClick={onClose} style={{background:"none",border:"none",color:T3,cursor:"pointer",fontSize:18,lineHeight:1,padding:"0 2px"}}>×</button>
      </div>

      {/* Upload phase */}
      {phase==="upload"&&(
        <div>
          <div
            onClick={()=>fileRef.current&&fileRef.current.click()}
            style={{border:"2px dashed #C9A4E0",borderRadius:12,padding:"22px 16px",textAlign:"center",marginBottom:10,background:"rgba(123,63,160,0.03)",cursor:"pointer"}}>
            <div style={{fontSize:36,marginBottom:6}}>📸</div>
            <div style={{fontWeight:700,fontSize:13,color:"#7B3FA0",marginBottom:3}}>Upload Jewelry Photo</div>
            <div style={{fontSize:11,color:T3,marginBottom:12,lineHeight:1.5}}>Best results: close-up on plain background, good lighting</div>
            <div style={{display:"flex",gap:8,justifyContent:"center"}}>
              <button
                onClick={e=>{e.stopPropagation();if(fileRef.current){fileRef.current.setAttribute("capture","environment");fileRef.current.click();}}}
                style={{background:"#7B3FA0",color:WH,border:"none",borderRadius:8,padding:"9px 18px",fontFamily:"Lato,sans-serif",fontSize:12,fontWeight:700,cursor:"pointer"}}>📷 Camera</button>
              <button
                onClick={e=>{e.stopPropagation();if(fileRef.current){fileRef.current.removeAttribute("capture");fileRef.current.click();}}}
                style={{background:"transparent",color:"#7B3FA0",border:"1.5px solid #7B3FA0",borderRadius:8,padding:"9px 18px",fontFamily:"Lato,sans-serif",fontSize:12,fontWeight:700,cursor:"pointer"}}>🖼 Gallery</button>
            </div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleFile}/>
          {error&&<div style={{color:RE,fontSize:11,textAlign:"center",marginTop:4}}>{error}</div>}
          <div style={{background:CRD,borderRadius:8,padding:"8px 10px",fontSize:10,color:T3,lineHeight:1.6}}>
            💡 <strong>Tips:</strong> Single piece · Plain white/black background · Sharp focus · Natural light
          </div>
        </div>
      )}

      {/* Analyzing phase */}
      {phase==="analyzing"&&(
        <div style={{textAlign:"center",padding:"16px 0"}}>
          {preview&&<img src={preview} alt="" style={{width:90,height:90,objectFit:"cover",borderRadius:10,marginBottom:12,border:"2px solid #C9A4E0"}}/>}
          <div style={{fontWeight:700,fontSize:13,color:"#7B3FA0",marginBottom:6}}>Analyzing image…</div>
          <div style={{fontSize:11,color:T3,lineHeight:1.6}}>
            Detecting metal colour, stones<br/>and jewelry type
          </div>
        </div>
      )}

      {/* Results phase */}
      {phase==="results"&&(
        <div>
          {/* Detected features strip */}
          {features&&(
            <div style={{display:"flex",gap:8,marginBottom:12,alignItems:"flex-start"}}>
              {preview&&<img src={preview} alt="" style={{width:56,height:56,objectFit:"cover",borderRadius:8,flexShrink:0,border:"1.5px solid #C9A4E0"}}/>}
              <div style={{flex:1}}>
                <div style={{fontSize:9,fontWeight:700,color:T3,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:5}}>Detected</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                  {[
                    features.category+" ("+features.cConf+"%)",
                    {YG:"Yellow Gold",WG:"White Gold",RG:"Rose Gold"}[features.metal]+" ("+features.mConf+"%)",
                    features.hasStones?"💎 Stones/Diamonds":"No Stones"
                  ].map(t=>(
                    <span key={t} style={{background:"rgba(123,63,160,0.1)",color:"#7B3FA0",fontSize:10,fontWeight:700,padding:"3px 8px",borderRadius:12}}>{t}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Divider */}
          <div style={{height:1,background:CRD2,marginBottom:10}}/>

          {/* Results list */}
          {results.length===0?(
            <div style={{textAlign:"center",padding:"20px 0",color:T3}}>
              <div style={{fontSize:28,marginBottom:8}}>🔍</div>
              <div style={{fontWeight:700,fontSize:13,marginBottom:4}}>No strong matches</div>
              <div style={{fontSize:11}}>Try a clearer photo or different angle</div>
            </div>
          ):(
            <div>
              <div style={{fontSize:9,fontWeight:700,color:T2,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:8}}>
                Best Matches — tap to view
              </div>
              {results.map((r,idx)=>(
                <div
                  key={r.item.id}
                  onClick={()=>onResult(r.item)}
                  style={{
                    display:"flex",gap:10,alignItems:"center",
                    padding:"10px 10px",marginBottom:7,
                    background:idx===0?"rgba(123,63,160,0.07)":WH,
                    borderRadius:10,
                    border:"1.5px solid "+(idx===0?"#C9A4E0":CRD2),
                    cursor:"pointer",
                    position:"relative"
                  }}>
                  {idx===0&&<div style={{position:"absolute",top:-7,left:10,background:"#7B3FA0",color:WH,fontSize:8,fontWeight:700,padding:"2px 7px",borderRadius:10}}>BEST MATCH</div>}
                  {/* Photo */}
                  <div style={{width:48,height:48,borderRadius:8,overflow:"hidden",flexShrink:0,background:CRD,display:"flex",alignItems:"center",justifyContent:"center"}}>
                    {r.item.img
                      ?<img src={r.item.img} alt="" style={{width:48,height:48,objectFit:"cover"}}/>
                      :<span style={{fontSize:22}}>{r.item.em||"💎"}</span>
                    }
                  </div>
                  {/* Info */}
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:700,fontSize:13,color:T1}}>{r.item.id}</div>
                    <div style={{fontSize:10,color:T3}}>{r.item.cat} · {r.item.col}</div>
                    <div style={{fontSize:10,color:T3}}>{r.item.metal}{r.item.tc>0?" · "+r.item.tc+"ct":""}</div>
                    {scoreBar(r.score)}
                  </div>
                  {/* Price + status */}
                  <div style={{textAlign:"right",flexShrink:0}}>
                    <div style={{fontFamily:"Cormorant Garamond,serif",fontSize:14,fontWeight:700,color:G}}>${r.item.fp}</div>
                    <div style={{fontSize:9,marginTop:2,padding:"2px 6px",borderRadius:8,background:r.item.st==="available"?"#edf7f0":REBG,color:r.item.st==="available"?"#27ae60":RE,fontWeight:700}}>{r.item.st}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={()=>{setPhase("upload");setPreview(null);setResults([]);setFeatures(null);setError("");}}
            style={{...S.bOut({padding:"10px",fontSize:12}),width:"100%",marginTop:8}}>
            🔄 Try Another Photo
          </button>
        </div>
      )}
    </div>
  );
}

function SingleLookup(p){

  var ev=p.ev;
  var inv=p.inv;
  var si=p.si;
  var sales=p.sales;
  var ssl=p.ssl;
  var leads=p.leads;
  var sld=p.sld;
  var cur=p.cur;
  var scur=p.scur;
  var user=p.user;
  var pr=p.pr;
  var users=p.users;
  var onUsersChange=p.onUsersChange;
  var syncUp=p.syncUp;
  var doSell=p.doSell;
  var sinvm=p.sinvm;
  var fc=p.fc;
  var st=p.st;
  var onLogout=p.onLogout;
  var onUpdateEvent=p.onUpdateEvent;
  var allEvents=p.allEvents;
  var onSwitch=p.onSwitch;
  var jc=p.jc;
  var sjc=p.sjc;
  var det=p.det;
  var sdet=p.sdet;
  var scan=p.scan;
  var sscan=p.sscan;
  var mlTab=p.mlTab;
  var smlTab=p.smlTab;
  var lkQ=p.lkQ;
  var lkResults=p.lkResults;
  var lkShowResults=p.lkShowResults;
  var applyFilters=p.applyFilters;
  var showFilter=p.showFilter;
  var sShowFilter=p.sShowFilter;
  var activeFilters=p.activeFilters;
  var resetFilters=p.resetFilters;
  var allCats=p.allCats;
  var allCols=p.allCols;
  var allMetals=p.allMetals;
  var allShapes=p.allShapes;
  var allSt=p.allSt;
  var fCat=p.fCat;
  var sfCat=p.sfCat;
  var fCol=p.fCol;
  var sfCol=p.sfCol;
  var fMetal=p.fMetal;
  var sfMetal=p.sfMetal;
  var fSt=p.fSt;
  var sfSt=p.sfSt;
  var fShape=p.fShape;
  var sfShape=p.sfShape;
  var fMinTc=p.fMinTc;
  var sfMinTc=p.sfMinTc;
  var fMaxTc=p.fMaxTc;
  var sfMaxTc=p.sfMaxTc;
  var fMinGw=p.fMinGw;
  var sfMinGw=p.sfMinGw;
  var fMaxGw=p.fMaxGw;
  var sfMaxGw=p.sfMaxGw;
  var fMinNw=p.fMinNw;
  var sfMinNw=p.sfMinNw;
  var fMaxNw=p.fMaxNw;
  var sfMaxNw=p.sfMaxNw;
  var fMinFp=p.fMinFp;
  var sfMinFp=p.sfMinFp;
  var fMaxFp=p.fMaxFp;
  var sfMaxFp=p.sfMaxFp;
  return(
    <div style={{padding:"13px 12px 20px"}}>

                {/* Inline Scanner */}
                {scan&&(
                  <div style={{marginBottom:12}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                      <div style={{fontWeight:700,fontSize:12,color:G}}>📷 Camera Scanner</div>
                      <button onClick={()=>sscan(false)} style={{background:RE,color:WH,border:"none",borderRadius:7,padding:"5px 12px",fontFamily:"Lato,sans-serif",fontSize:11,fontWeight:700,cursor:"pointer"}}>⬛ Stop</button>
                    </div>
                    <QRScanner inv={inv} onScanned={(code,item)=>{sscan(false);if(item){sdet(item);}else{sjc(code);}}}/>
                  </div>
                )}

                {/* Search + Filter toggle */}
                <div style={{...S.card({margin:0,marginBottom:10})}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                    <div style={S.sh}>🔍 FIND JEWEL</div>
                    <div style={{display:"flex",gap:7,alignItems:"center"}}>
                      {activeFilters>0&&<span style={{background:RE,color:WH,borderRadius:10,fontSize:9,fontWeight:700,padding:"2px 7px"}}>{activeFilters}</span>}
                      <button onClick={()=>sShowFilter(x=>!x)} style={{background:showFilter?G:CRD,border:"1.5px solid "+(showFilter?G:CRD2),borderRadius:7,padding:"5px 10px",fontFamily:"Lato,sans-serif",fontSize:11,fontWeight:600,color:showFilter?CR:T2,cursor:"pointer"}}>{showFilter?"✕ Filters":"⚡ Filters"}</button>
                    </div>
                  </div>
                  {!scan&&(
                    <div style={{display:"flex",gap:8,marginBottom:10}}>
                      <button style={S.btn({flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:6,fontSize:12})} onClick={()=>sscan(true)}>📷 QR Scan</button>
                      <button style={S.btn({flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:6,fontSize:12,background:"#7B3FA0"})} onClick={()=>sPhotoSearch(true)}>🖼 Photo Search</button>
                    </div>
                  )}
                  {photoSearch&&(
                    <PhotoSearch inv={inv} onResult={(item)=>{sPhotoSearch(false);sdet(item);}} onClose={()=>sPhotoSearch(false)}/>
                  )}
                  <input style={{...S.inp({marginBottom:8}),borderColor:"rgba(201,168,76,0.5)"}} placeholder="Customer name (optional)..." value={custName} onChange={ev=>sCustName(ev.target.value)}/>
                  <input style={{...S.inp({marginBottom:4}),borderColor:G}} placeholder="Search code, collection, metal, category..." value={jc} onChange={ev=>sjc(ev.target.value)}/>
                  <div style={{fontSize:10,color:T4,marginBottom:7}}>Type to search all {inv.length} items</div>
                  <div style={{background:"#edf7f0",border:"1px solid rgba(30,92,69,0.2)",borderRadius:8,padding:"7px 11px",display:"flex",alignItems:"center",gap:7}}>
                    <span style={{fontSize:12}}>☁</span><span style={{fontSize:11,color:G,fontWeight:600}}>Cloud sync active</span>
                  </div>
                </div>

                {/* Filter Panel */}
                {showFilter&&(
                  <div style={{...S.card({margin:0,marginBottom:10,border:"2px solid "+G})}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:11}}>
                      <div style={{fontWeight:700,fontSize:11,color:G,textTransform:"uppercase",letterSpacing:"0.1em"}}>⚡ Smart Filters</div>
                      {activeFilters>0&&<button onClick={resetFilters} style={{background:REBG,color:RE,border:"1px solid rgba(160,48,48,0.2)",borderRadius:6,padding:"4px 10px",fontFamily:"Lato,sans-serif",fontSize:11,fontWeight:600,cursor:"pointer"}}>✕ Reset All</button>}
                    </div>
                    <div style={{marginBottom:10}}><span style={S.lbl}>CATEGORY</span><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{allCats.map(v=><button key={v} onClick={()=>sfCat(v)} style={S.pill(fCat===v,{fontSize:10,padding:"4px 10px"})}>{v}</button>)}</div></div>
                    <div style={{marginBottom:10}}><span style={S.lbl}>COLLECTION</span><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{allCols.map(v=><button key={v} onClick={()=>sfCol(v)} style={S.pill(fCol===v,{fontSize:10,padding:"4px 10px"})}>{v}</button>)}</div></div>
                    <div style={{marginBottom:10}}><span style={S.lbl}>METAL</span><div style={{display:"flex",gap:6,flexWrap:"wrap",overflowX:"auto",scrollbarWidth:"none"}}>{allMetals.map(v=><button key={v} onClick={()=>sfMetal(v)} style={S.pill(fMetal===v,{fontSize:10,padding:"4px 10px",flexShrink:0})}>{v}</button>)}</div></div>
                    <div style={{marginBottom:10}}><span style={S.lbl}>STONE SHAPE</span><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{allShapes.map(v=><button key={v} onClick={()=>sfShape(v)} style={S.pill(fShape===v,{fontSize:10,padding:"4px 10px"})}>{v}</button>)}</div></div>
                    <div style={{marginBottom:12}}><span style={S.lbl}>STATUS</span><div style={{display:"flex",gap:6}}>{allSt.map(v=><button key={v} onClick={()=>sfSt(v)} style={S.pill(fSt===v,{fontSize:10,padding:"4px 10px",textTransform:"capitalize"})}>{v}</button>)}</div></div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                      {[{l:"DIAMOND CARATS (CT)",min:fMinTc,sMin:sfMinTc,max:fMaxTc,sMax:sfMaxTc},{l:"GROSS WEIGHT (g)",min:fMinGw,sMin:sfMinGw,max:fMaxGw,sMax:sfMaxGw},{l:"NET WEIGHT (g)",min:fMinNw,sMin:sfMinNw,max:fMaxNw,sMax:sfMaxNw},{l:"PRICE ($)",min:fMinFp,sMin:sfMinFp,max:fMaxFp,sMax:sfMaxFp}].map(({l,min,sMin,max,sMax})=>(
                        <div key={l} style={{gridColumn:"span 2"}}>
                          <span style={S.lbl}>{l}</span>
                          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
                            <input type="number" step="0.01" min="0" style={S.inp({fontSize:12})} placeholder="Min" value={min} onChange={ev=>sMin(ev.target.value)}/>
                            <input type="number" step="0.01" min="0" style={S.inp({fontSize:12})} placeholder="Max" value={max} onChange={ev=>sMax(ev.target.value)}/>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Results count when searching/filtering */}
                {lkShowResults&&(
                  <div style={{fontSize:10,color:T3,marginBottom:7,fontWeight:600}}>
                    {lkResults.length} item{lkResults.length!==1?"s":""} found
                    {lkQ?(" for " + lkQ):""}
                    {activeFilters>0?" · "+activeFilters+" filter"+(activeFilters>1?"s":"")+" active":""}
                  </div>
                )}

                {/* No results message */}
                {lkShowResults&&lkResults.length===0&&(
                  <div style={{...S.card({margin:0,textAlign:"center",padding:28})}}>
                    <div style={{fontSize:24,marginBottom:8}}>🔍</div>
                    <div style={{color:T2,fontSize:13,fontWeight:600,marginBottom:4}}>No items found</div>
                    <div style={{color:T3,fontSize:11}}>Try different search terms or adjust filters</div>
                    {activeFilters>0&&<button onClick={resetFilters} style={S.bOut({marginTop:12,width:"auto",padding:"7px 16px",fontSize:12})}>Reset Filters</button>}
                  </div>
                )}

                {/* Search/filter results list */}
                {lkShowResults&&lkResults.length>0&&(
                  <div style={{background:WH,borderRadius:12,overflow:"hidden",border:"1px solid "+CRD2,marginBottom:12}}>
                    {lkResults.slice(0,20).map((item,i,arr)=>(
                      <div key={item.id} onClick={()=>{sdet(item);sjc("");}} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderBottom:i<arr.length-1?"1px solid "+CRD2:"none",cursor:"pointer"}}>
                        <div style={{width:42,height:42,borderRadius:8,overflow:"hidden",flexShrink:0,background:CRD,display:"flex",alignItems:"center",justifyContent:"center"}}>
                          {getImg(item)?<img src={getImg(item)} alt="" style={{width:42,height:42,objectFit:"cover"}}/>:<span style={{fontSize:22}}>{item.em}</span>}
                        </div>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontWeight:700,fontSize:13,color:T1}}>{item.id}</div>
                          <div style={{fontSize:10,color:T3}}>{item.cat} · {item.col} · {item.metal}</div>
                          <div style={{fontSize:9.5,color:T4}}>{item.tc}ct · {item.gw}g gross · {item.nw}g net</div>
                        </div>
                        <div style={{textAlign:"right",flexShrink:0}}>
                          <div style={{fontFamily:"Cormorant Garamond,serif",fontSize:14,fontWeight:700,color:G}}>{fc(item.fp,cur)}</div>
                          <Bdg t={item.st==="available"?"g":item.st==="sold"?"r":"a"} ch={item.st} sm/>
                        </div>
                      </div>
                    ))}
                    {lkResults.length>20&&<div style={{padding:"10px 12px",textAlign:"center",fontSize:11,color:T3,background:CRD}}>Showing 20 of {lkResults.length} — refine to narrow down</div>}
                  </div>
                )}

                {/* Bestsellers shown when nothing searched */}
                {!lkShowResults&&!det&&(
                  <div style={S.card({margin:0})}>
                    <div style={S.sh}>⭐ BESTSELLERS</div>
                    {[...inv].sort((a,b)=>b.searches-a.searches).slice(0,6).map((item,i,arr)=>(
                      <div key={item.id} onClick={()=>sdet(item)} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:i<arr.length-1?"1px solid "+CRD2:"none",cursor:"pointer"}}>
                        <div style={{width:36,height:36,borderRadius:6,overflow:"hidden",flexShrink:0,background:CRD,display:"flex",alignItems:"center",justifyContent:"center"}}>
                          {getImg(item)?<img src={getImg(item)} alt="" style={{width:36,height:36,objectFit:"cover"}}/>:<span style={{fontSize:18}}>{item.em}</span>}
                        </div>
                        <div style={{flex:1}}><div style={{fontSize:12,fontWeight:700,color:T1}}>{item.id}</div><div style={{fontSize:10,color:T3}}>{item.col} · {item.searches}🔍</div></div>
                        <div style={{fontFamily:"Cormorant Garamond,serif",fontSize:13,fontWeight:700,color:G}}>{fc(item.fp,cur)}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Item detail inline */}
                {det&&(
                  <div style={{marginTop:12}}>
                    <ItemCard item={det} user={user} inv={inv} leads={leads} cur={cur} preCustName={custName} onSell={s=>{doSell(s);sCustName("");}} onBack={()=>sdet(null)} onAddLead={onAddLead}/>
                  </div>
                )}
              </div>
  );
}

function MultiLookup(p){

  var ev=p.ev;
  var inv=p.inv;
  var si=p.si;
  var sales=p.sales;
  var ssl=p.ssl;
  var leads=p.leads;
  var sld=p.sld;
  var cur=p.cur;
  var scur=p.scur;
  var user=p.user;
  var pr=p.pr;
  var users=p.users;
  var onUsersChange=p.onUsersChange;
  var syncUp=p.syncUp;
  var doSell=p.doSell;
  var sinvm=p.sinvm;
  var fc=p.fc;
  var st=p.st;
  var onLogout=p.onLogout;
  var onUpdateEvent=p.onUpdateEvent;
  var allEvents=p.allEvents;
  var onSwitch=p.onSwitch;
  var mlInput=p.mlInput;
  var smlInput=p.smlInput;
  var mlItems=p.mlItems;
  var smlItems=p.smlItems;
  var mlDisc=p.mlDisc;
  var smlDisc=p.smlDisc;
  var mlDiscAmt=p.mlDiscAmt;
  var smlDiscAmt=p.smlDiscAmt;
  var mlMarkup=p.mlMarkup;
  var smlMarkup=p.smlMarkup;
  var mlNF=p.mlNF;
  var smlNF=p.smlNF;
  var mlScan=p.mlScan;
  var smlScan=p.smlScan;
  var mlSubtotal=p.mlSubtotal;
  var mlFinal=p.mlFinal;
  var mlTotal=p.mlTotal;
  var resolveCodes=p.resolveCodes;
  var sellMulti=p.sellMulti;
  var leads=p.leads;
  var onAddLead=p.onAddLead;
  const [showCustForm,sShowCustForm]=useState(false);
  const [mlCust,smlCust]=useState({name:"",phone:"",email:"",company:"",source:"Walk-in"});
  const setMC=(k,v)=>smlCust(p=>({...p,[k]:v}));
  const [mlMatchedCust,smlMatchedCust]=useState(null);
  const onMCNameChange=(v)=>{
    smlCust(p=>({...p,name:v}));
    if(v.trim().length>1){
      const m=leads&&leads.find(l=>l.name.toLowerCase().includes(v.trim().toLowerCase()));
      if(m){smlMatchedCust(m);smlCust(p=>({...p,phone:m.phone||p.phone,email:m.email||m.contact||p.email,company:m.company||p.company,source:m.source||p.source}));}
      else smlMatchedCust(null);
    }
  };
  const doSellMulti=()=>{
    if(!mlCust.name.trim()||!mlCust.phone.trim()||!mlCust.email.trim()){
      const missing=[];
      if(!mlCust.name.trim())missing.push("Name");
      if(!mlCust.phone.trim())missing.push("Phone");
      if(!mlCust.email.trim())missing.push("Email");
      toast.error("Required fields missing",missing.join(", ")+" required.");
      return;
    }
    const existC=mlMatchedCust||leads.find(l=>l.name.toLowerCase()===mlCust.name.trim().toLowerCase());
    let custId;
    if(existC){
      custId=existC.id;
      const upd={...existC,name:mlCust.name.trim(),phone:mlCust.phone.trim()||existC.phone,email:mlCust.email.trim()||existC.email,company:mlCust.company||existC.company,source:mlCust.source||existC.source};
      onAddLead(upd,"update");
    } else {
      custId=uid("LD");
      onAddLead({id:custId,name:mlCust.name.trim(),phone:mlCust.phone.trim(),email:mlCust.email.trim(),company:mlCust.company.trim(),notes:"",status:"Warm",source:mlCust.source||"Walk-in",contact:mlCust.email.trim(),created:dstr()},"add");
    }
    sellMulti(mlCust.name.trim(),mlCust.phone.trim(),custId);
    sShowCustForm(false);
    smlCust({name:"",phone:"",email:"",company:"",source:"Walk-in"});
    smlMatchedCust(null);
  };
  return(
    <div style={{padding:"13px 12px 40px"}}>
                <div style={{...S.card({margin:0,marginBottom:12})}}>
                  <div style={S.sh}>📋 MULTI ITEM LOOKUP</div>
                  <div style={{fontSize:11,color:T3,marginBottom:9,lineHeight:1.6}}>One code per line, or comma separated.</div>
                  <span style={S.lbl}>JEWEL CODES</span>
                  <textarea style={S.inp({height:88,resize:"none",marginBottom:8,fontFamily:"monospace",fontSize:13})} placeholder={"VJNC1345\nVJER3089\nor: VJNC1345, VJER3089"} value={mlInput} onChange={ev=>smlInput(ev.target.value)}/>
                  <div style={{display:"flex",gap:8,marginBottom:mlScan?8:0}}>
                    <button style={S.btn({flex:1,padding:"11px",fontSize:13})} onClick={resolveCodes}>🔍 Look Up All</button>
                    <button style={S.bOut({padding:"11px 12px",fontSize:12,background:mlScan?RE:undefined,color:mlScan?WH:undefined,borderColor:mlScan?RE:undefined})} onClick={()=>smlScan(x=>!x)}>{mlScan?"⬛ Stop":"📷"}</button>
                  </div>
                  {mlScan&&<QRScanner inv={inv} onScanned={(code,item)=>{smlScan(false);if(code){smlInput(p=>(p?p+"\n":"")+code);}}}/>}
                  {mlNF.length>0&&<div style={{background:REBG,borderRadius:8,padding:"8px 11px",marginTop:9}}><div style={{fontSize:10,fontWeight:700,color:RE,marginBottom:2}}>NOT FOUND</div><div style={{fontSize:11,color:RE}}>{mlNF.join(", ")}</div></div>}
                </div>
                {mlItems.length>0&&(
                  <>
                    <div style={{background:WH,borderRadius:12,overflow:"hidden",border:"1px solid "+CRD2,marginBottom:12}}>
                      {mlItems.map((item,i)=>(
                        <div key={item.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",borderBottom:i<mlItems.length-1?"1px solid "+CRD2:"none"}}>
                          <div style={{width:38,height:38,borderRadius:7,overflow:"hidden",flexShrink:0,background:CRD,display:"flex",alignItems:"center",justifyContent:"center"}}>
                            {getImg(item)?<img src={getImg(item)} alt="" style={{width:38,height:38,objectFit:"cover"}}/>:<span style={{fontSize:20}}>{item.em}</span>}
                          </div>
                          <div style={{flex:1}}><div style={{fontWeight:700,fontSize:12,color:T1}}>{item.id}</div><div style={{fontSize:10,color:T3}}>{item.cat} · {item.metal}</div></div>
                          <div style={{textAlign:"right"}}>
                            <div style={{fontFamily:"Cormorant Garamond,serif",fontSize:13,fontWeight:700,color:G}}>{fc(item.fp,cur)}</div>
                            <button onClick={()=>smlItems(p=>p.filter(x=>x.id!==item.id))} style={{background:"none",border:"none",color:RE,fontSize:10,cursor:"pointer"}}>✕</button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div style={{...S.card({margin:0,marginBottom:12})}}>
                      <div style={S.sh}>💲 PRICING ADJUSTMENT</div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:10}}>
                        <div><span style={{...S.lbl,color:mlDisc?G:T2}}>DISC %</span><input type="number" min="0" max="50" style={S.inp({borderColor:mlDisc?G:CRD2})} placeholder="0" value={mlDisc} onChange={ev=>{smlDisc(ev.target.value);smlDiscAmt("");smlMarkup("");}}/></div>
                        <div><span style={{...S.lbl,color:mlDiscAmt?RE:T2}}>DISC AMT</span><input type="number" min="0" style={S.inp({borderColor:mlDiscAmt?RE:CRD2})} placeholder="0" value={mlDiscAmt} onChange={ev=>{smlDiscAmt(ev.target.value);smlDisc("");smlMarkup("");}}/></div>
                        <div><span style={{...S.lbl,color:mlMarkup?AM:T2}}>MARKUP %</span><input type="number" min="0" style={S.inp({borderColor:mlMarkup?AM:CRD2})} placeholder="0" value={mlMarkup} onChange={ev=>{smlMarkup(ev.target.value);smlDisc("");smlDiscAmt("");}}/></div>
                      </div>
                      <div style={{background:CRD,borderRadius:9,padding:"10px 11px"}}>
                        <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:T3,marginBottom:3}}><span>{mlItems.length} items · Subtotal</span><span style={{fontWeight:600,color:T1}}>{fc(mlSubtotal,cur)}</span></div>
                        {mlDisc&&Number(mlDisc)>0&&<div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:G,marginBottom:3}}><span>Discount ({mlDisc}%)</span><span>− {fc(mlSubtotal*Number(mlDisc)/100,cur)}</span></div>}
                        {mlDiscAmt&&Number(mlDiscAmt)>0&&<div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:G,marginBottom:3}}><span>Discount (fixed)</span><span>− {fc(Number(mlDiscAmt),cur)}</span></div>}
                        {mlMarkup&&Number(mlMarkup)>0&&<div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:AM,marginBottom:3}}><span>Markup ({mlMarkup}%)</span><span>+ {fc(mlSubtotal*Number(mlMarkup)/100,cur)}</span></div>}
                        <div style={{height:1,background:CRD2,margin:"6px 0"}}/>
                        <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:T3,marginBottom:3}}><span>GST 3%</span><span>{fc(mlFinal*0.03,cur)}</span></div>
                        <div style={{height:2,background:G,borderRadius:1,margin:"5px 0"}}/>
                        <div style={{display:"flex",justifyContent:"space-between",fontWeight:700,fontSize:16,color:G}}><span>Grand Total</span><span style={{fontFamily:"Cormorant Garamond,serif",fontSize:19}}>{fc(mlTotal,cur)}</span></div>
                      </div>
                    </div>
                    <div style={{display:"flex",gap:8}}>
                      <button style={S.btn({flex:2,padding:"12px",fontSize:13})} onClick={()=>sShowCustForm(true)}>💰 Convert to Sale</button>
                      <button style={S.bOut({flex:1,padding:"12px",fontSize:12})} onClick={()=>toast.info("Quote ready",""+mlItems.length+" items")}>📋 Quote</button>
                    </div>
                  {showCustForm&&(
                    <div style={{...S.card({margin:"12px 0 0",border:"2px solid "+G})}}>
                      <div style={{fontWeight:700,fontSize:12,color:G,marginBottom:10}}>Customer Details</div>
                      {mlMatchedCust&&(
                        <div style={{background:"rgba(30,92,69,0.08)",borderRadius:8,padding:"6px 10px",marginBottom:8,display:"flex",alignItems:"center",gap:6}}>
                          <span style={{fontSize:12}}>✓</span>
                          <span style={{fontSize:11,fontWeight:700,color:G}}>Existing customer found</span>
                          <button onClick={()=>smlMatchedCust(null)} style={{marginLeft:"auto",background:"none",border:"none",color:T3,fontSize:11,cursor:"pointer"}}>Clear</button>
                        </div>
                      )}
                      <div style={{display:"flex",flexDirection:"column",gap:8}}>
                        <div><span style={{...S.lbl,color:mlCust.name.trim()?T3:RE}}>NAME *</span><input style={{...S.inp(),borderColor:mlCust.name.trim()?"#E8DCCB":"#C9A84C",borderWidth:mlCust.name.trim()?"1.5px":"2px"}} placeholder="Customer name" value={mlCust.name} onChange={ev=>onMCNameChange(ev.target.value)}/></div>
                        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                          <div><span style={{...S.lbl,color:mlCust.phone.trim()?T3:RE}}>PHONE *</span><input style={{...S.inp(),borderColor:mlCust.phone.trim()?"#E8DCCB":"#C9A84C",borderWidth:mlCust.phone.trim()?"1.5px":"2px"}} type="tel" placeholder="+1 555 1234" value={mlCust.phone} onChange={ev=>setMC("phone",ev.target.value)}/></div>
                          <div><span style={{...S.lbl,color:mlCust.email.trim()?T3:RE}}>EMAIL *</span><input style={{...S.inp(),borderColor:mlCust.email.trim()?"#E8DCCB":"#C9A84C",borderWidth:mlCust.email.trim()?"1.5px":"2px"}} type="email" placeholder="email@co.com" value={mlCust.email} onChange={ev=>setMC("email",ev.target.value)}/></div>
                        </div>
                        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                          <div><span style={S.lbl}>COMPANY</span><input style={S.inp()} placeholder="Company / store" value={mlCust.company} onChange={ev=>setMC("company",ev.target.value)}/></div>
                          <div><span style={S.lbl}>SOURCE</span><select style={S.inp()} value={mlCust.source} onChange={ev=>setMC("source",ev.target.value)}>{["Walk-in","Shopify","WhatsApp","Referral","Trade Show","Other"].map(s=><option key={s}>{s}</option>)}</select></div>
                        </div>
                      </div>
                      <div style={{display:"flex",gap:8,marginTop:10}}>
                        <button style={S.btn({flex:2,padding:"12px",fontSize:13})} onClick={doSellMulti}>✓ Confirm {mlItems.length} items</button>
                        <button style={S.bOut({flex:1,padding:"12px",fontSize:12})} onClick={()=>sShowCustForm(false)}>Cancel</button>
                      </div>
                    </div>
                  )}
                  </>
                )}
                {mlItems.length===0&&!mlInput&&<div style={{...S.card({margin:0,textAlign:"center",padding:32})}}>
                  <div style={{fontSize:24,color:CRD2,marginBottom:10}}>📋</div>
                  <div style={{color:T3,fontSize:13}}>Enter codes above to price multiple items together</div>
                </div>}
              </div>
  );
}


function LookupTab(p){

  var ev=p.ev;
  var inv=p.inv;
  var si=p.si;
  var sales=p.sales;
  var ssl=p.ssl;
  var leads=p.leads;
  var sld=p.sld;
  var cur=p.cur;
  var scur=p.scur;
  var user=p.user;
  var pr=p.pr;
  var users=p.users;
  var onUsersChange=p.onUsersChange;
  var syncUp=p.syncUp;
  var doSell=p.doSell;
  var sinvm=p.sinvm;
  var fc=p.fc;
  var st=p.st;
  var onLogout=p.onLogout;
  var onUpdateEvent=p.onUpdateEvent;
  var allEvents=p.allEvents;
  var onSwitch=p.onSwitch;
  var mlTab=p.mlTab;
  var smlTab=p.smlTab;
  var lkQ=p.lkQ;
  var lkResults=p.lkResults;
  var lkShowResults=p.lkShowResults;
  var jc=p.jc;
  var sjc=p.sjc;
  var det=p.det;
  var sdet=p.sdet;
  var scan=p.scan;
  var sscan=p.sscan;
  var showFilter=p.showFilter;
  var sShowFilter=p.sShowFilter;
  var activeFilters=p.activeFilters;
  var fCat=p.fCat;
  var sfCat=p.sfCat;
  var fCol=p.fCol;
  var sfCol=p.sfCol;
  var fMetal=p.fMetal;
  var sfMetal=p.sfMetal;
  var fSt=p.fSt;
  var sfSt=p.sfSt;
  var fShape=p.fShape;
  var sfShape=p.sfShape;
  var fMinTc=p.fMinTc;
  var sfMinTc=p.sfMinTc;
  var fMaxTc=p.fMaxTc;
  var sfMaxTc=p.sfMaxTc;
  var fMinGw=p.fMinGw;
  var sfMinGw=p.sfMinGw;
  var fMaxGw=p.fMaxGw;
  var sfMaxGw=p.sfMaxGw;
  var fMinNw=p.fMinNw;
  var sfMinNw=p.sfMinNw;
  var fMaxNw=p.fMaxNw;
  var sfMaxNw=p.sfMaxNw;
  var fMinFp=p.fMinFp;
  var sfMinFp=p.sfMinFp;
  var fMaxFp=p.fMaxFp;
  var sfMaxFp=p.sfMaxFp;
  var allCats=p.allCats;
  var allCols=p.allCols;
  var allMetals=p.allMetals;
  var allShapes=p.allShapes;
  var allSt=p.allSt;
  var resetFilters=p.resetFilters;
  var applyFilters=p.applyFilters;
  var mlInput=p.mlInput;
  var smlInput=p.smlInput;
  var mlItems=p.mlItems;
  var smlItems=p.smlItems;
  var mlDisc=p.mlDisc;
  var smlDisc=p.smlDisc;
  var mlDiscAmt=p.mlDiscAmt;
  var smlDiscAmt=p.smlDiscAmt;
  var mlMarkup=p.mlMarkup;
  var smlMarkup=p.smlMarkup;
  var mlNF=p.mlNF;
  var smlNF=p.smlNF;
  var mlScan=p.mlScan;
  var smlScan=p.smlScan;
  var mlSubtotal=p.mlSubtotal;
  var mlFinal=p.mlFinal;
  var mlTotal=p.mlTotal;
  var resolveCodes=p.resolveCodes;
  var sellMulti=p.sellMulti;
  var _ps=useState(false);var photoSearch=_ps[0];var sPhotoSearch=_ps[1];
  return(
    <div>
            {/* Single / Multi sub-tabs */}
            <div style={{background:G,display:"flex",borderBottom:"1px solid rgba(201,168,76,0.2)"}}>
              {[{id:"single",l:"🔍 SINGLE"},{id:"multi",l:"📋 MULTI LOOKUP"}].map(t=>(
                <button key={t.id} onClick={()=>smlTab(t.id)} style={{flex:1,background:"none",border:"none",borderBottom:mlTab===t.id?"2.5px solid "+GO:"2.5px solid transparent",color:mlTab===t.id?GO:"rgba(245,237,224,0.5)",fontFamily:"Lato,sans-serif",fontSize:11,fontWeight:mlTab===t.id?700:500,padding:"9px 7px",cursor:"pointer"}}>{t.l}</button>
              ))}
            </div>

            {/* SINGLE LOOKUP */}
            {mlTab==="single"&&<SingleLookup {...{ev:p.ev,inv:p.inv,si:p.si,cur:p.cur,user:p.user,pr:p.pr,fc:p.fc,st:p.st,doSell:p.doSell,sdet:p.sdet,sinvm:p.sinvm,jc:p.jc,sjc:p.sjc,det:p.det,scan:p.scan,sscan:p.sscan,mlTab:p.mlTab,smlTab:p.smlTab,mlInput:p.mlInput,smlInput:p.smlInput,mlItems:p.mlItems,smlItems:p.smlItems,mlDisc:p.mlDisc,smlDisc:p.smlDisc,mlDiscAmt:p.mlDiscAmt,smlDiscAmt:p.smlDiscAmt,mlMarkup:p.mlMarkup,smlMarkup:p.smlMarkup,mlNF:p.mlNF,smlNF:p.smlNF,mlScan:p.mlScan,smlScan:p.smlScan,mlSubtotal:p.mlSubtotal,mlFinal:p.mlFinal,mlTotal:p.mlTotal,resolveCodes:p.resolveCodes,sellMulti:p.sellMulti,showFilter:p.showFilter,sShowFilter:p.sShowFilter,activeFilters:p.activeFilters,resetFilters:p.resetFilters,fCat:p.fCat,sfCat:p.sfCat,fCol:p.fCol,sfCol:p.sfCol,fMetal:p.fMetal,sfMetal:p.sfMetal,fSt:p.fSt,sfSt:p.sfSt,fShape:p.fShape,sfShape:p.sfShape,fMinTc:p.fMinTc,sfMinTc:p.sfMinTc,fMaxTc:p.fMaxTc,sfMaxTc:p.sfMaxTc,fMinGw:p.fMinGw,sfMinGw:p.sfMinGw,fMaxGw:p.fMaxGw,sfMaxGw:p.sfMaxGw,fMinNw:p.fMinNw,sfMinNw:p.sfMinNw,fMaxNw:p.fMaxNw,sfMaxNw:p.sfMaxNw,fMinFp:p.fMinFp,sfMinFp:p.sfMinFp,fMaxFp:p.fMaxFp,sfMaxFp:p.sfMaxFp,allCats:p.allCats,allCols:p.allCols,allMetals:p.allMetals,allShapes:p.allShapes,allSt:p.allSt,lkQ:p.lkQ,lkResults:p.lkResults,lkShowResults:p.lkShowResults,photoSearch:photoSearch,sPhotoSearch:sPhotoSearch}}/>}


            {/* MULTI LOOKUP */}
            {mlTab==="multi"&&<MultiLookup {...{ev:p.ev,inv:p.inv,si:p.si,cur:p.cur,user:p.user,pr:p.pr,fc:p.fc,st:p.st,doSell:p.doSell,sdet:p.sdet,sinvm:p.sinvm,jc:p.jc,sjc:p.sjc,det:p.det,scan:p.scan,sscan:p.sscan,mlTab:p.mlTab,smlTab:p.smlTab,mlInput:p.mlInput,smlInput:p.smlInput,mlItems:p.mlItems,smlItems:p.smlItems,mlDisc:p.mlDisc,smlDisc:p.smlDisc,mlDiscAmt:p.mlDiscAmt,smlDiscAmt:p.smlDiscAmt,mlMarkup:p.mlMarkup,smlMarkup:p.smlMarkup,mlNF:p.mlNF,smlNF:p.smlNF,mlScan:p.mlScan,smlScan:p.smlScan,mlSubtotal:p.mlSubtotal,mlFinal:p.mlFinal,mlTotal:p.mlTotal,resolveCodes:p.resolveCodes,sellMulti:p.sellMulti,showFilter:p.showFilter,sShowFilter:p.sShowFilter,activeFilters:p.activeFilters,resetFilters:p.resetFilters,fCat:p.fCat,sfCat:p.sfCat,fCol:p.fCol,sfCol:p.sfCol,fMetal:p.fMetal,sfMetal:p.sfMetal,fSt:p.fSt,sfSt:p.sfSt,fShape:p.fShape,sfShape:p.sfShape,fMinTc:p.fMinTc,sfMinTc:p.sfMinTc,fMaxTc:p.fMaxTc,sfMaxTc:p.sfMaxTc,fMinGw:p.fMinGw,sfMinGw:p.sfMinGw,fMaxGw:p.fMaxGw,sfMaxGw:p.sfMaxGw,fMinNw:p.fMinNw,sfMinNw:p.sfMinNw,fMaxNw:p.fMaxNw,sfMaxNw:p.sfMaxNw,fMinFp:p.fMinFp,sfMinFp:p.sfMinFp,fMaxFp:p.fMaxFp,sfMaxFp:p.sfMaxFp,allCats:p.allCats,allCols:p.allCols,allMetals:p.allMetals,allShapes:p.allShapes,allSt:p.allSt,lkQ:p.lkQ,lkResults:p.lkResults,lkShowResults:p.lkShowResults,leads:p.leads,onAddLead:p.onAddLead}}/>}
          </div>
  );
}

function InventoryTab(p){

  var ev=p.ev;
  var inv=p.inv;
  var si=p.si;
  var sales=p.sales;
  var ssl=p.ssl;
  var leads=p.leads;
  var sld=p.sld;
  var cur=p.cur;
  var scur=p.scur;
  var user=p.user;
  var pr=p.pr;
  var users=p.users;
  var onUsersChange=p.onUsersChange;
  var syncUp=p.syncUp;
  var doSell=p.doSell;
  var sinvm=p.sinvm;
  var fc=p.fc;
  var st=p.st;
  var onLogout=p.onLogout;
  var onUpdateEvent=p.onUpdateEvent;
  var allEvents=p.allEvents;
  var onSwitch=p.onSwitch;
  var invTab=p.invTab;
  var sivTab=p.sivTab;
  var isq=p.isq;
  var sisq=p.sisq;
  var ist=p.ist;
  var sist=p.sist;
  var icat=p.icat;
  var sicat=p.sicat;
  var fi=p.fi;
  var cats=p.cats;
  var deadStock=p.deadStock;
  var auditLoc=p.auditLoc;
  var saLoc=p.saLoc;
  var auditScanned=p.auditScanned;
  var saScanned=p.saScanned;
  var audits=p.audits;
  var sAudits=p.sAudits;
  var locItems=p.locItems;
  var missing=p.missing;
  var saveAudit=p.saveAudit;
  var scan=p.scan;
  var sscan=p.sscan;
  return(
    <div>
          <div style={{background:G,display:"flex",borderBottom:"1px solid rgba(201,168,76,0.2)"}}>{[{id:"stock",l:"📦 STOCK"},{id:"audit",l:"🔍 AUDIT"}].map(t=><button key={t.id} onClick={()=>sivTab(t.id)} style={{flex:1,background:"none",border:"none",borderBottom:invTab===t.id?"2.5px solid "+GO:"2.5px solid transparent",color:invTab===t.id?GO:"rgba(245,237,224,0.5)",fontFamily:"Lato,sans-serif",fontSize:11,fontWeight:invTab===t.id?700:500,padding:"9px 7px",cursor:"pointer"}}>{t.l}</button>)}</div>
          {invTab==="stock"&&<div style={{padding:"13px 12px 40px"}}>
            <div style={{display:"flex",gap:8,marginBottom:9}}><input style={S.inp({flex:1})} placeholder="Search..." value={isq} onChange={ev=>sisq(ev.target.value)}/></div>
            <div style={{display:"flex",gap:5,overflowX:"auto",scrollbarWidth:"none",marginBottom:7}}>{cats.map(c=><button key={c} style={S.pill(icat===c,{fontSize:10})} onClick={()=>sicat(c)}>{c}</button>)}</div>
            <div style={{display:"flex",gap:5,marginBottom:9}}>{["All","available","reserved","sold"].map(s=><button key={s} style={S.pill(ist===s,{fontSize:10,textTransform:"capitalize"})} onClick={()=>sist(s)}>{s}</button>)}</div>
            {deadStock.length>0&&<div style={{background:AMBG,border:"1px solid rgba(200,150,58,0.3)",borderRadius:9,padding:"8px 11px",marginBottom:9}}><div style={{fontSize:10,fontWeight:700,color:AM}}>⚠ Dead Stock: {deadStock.map(i=>i.id).slice(0,5).join(", ")}{deadStock.length>5?" +more":""}</div></div>}
            <div style={{fontSize:10,color:T3,marginBottom:7}}>{fi.length} items · {fc(fi.filter(i=>i.st==="available").reduce((s,i)=>s+i.fp,0),cur)} value</div>
            <div style={{background:WH,borderRadius:12,overflow:"hidden",border:"1px solid "+CRD2}}>
              {fi.slice(0,100).map((item,i,arr)=>(
                <div key={item.id} onClick={()=>{sdet(item);st("lookup");}} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",borderBottom:i<arr.length-1?"1px solid "+CRD2:"none",cursor:"pointer",background:WH}}>
                  <div style={{width:40,height:40,borderRadius:8,overflow:"hidden",flexShrink:0,background:CRD,display:"flex",alignItems:"center",justifyContent:"center"}}>
                    {getImg(item)?<img src={getImg(item)} alt="" style={{width:40,height:40,objectFit:"cover"}}/>:<span style={{fontSize:20}}>{item.em}</span>}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div style={{fontWeight:700,fontSize:12,color:T1}}>{item.id}</div><Bdg t={item.st==="available"?"g":item.st==="reserved"?"a":"r"} ch={item.st}/></div>
                    <div style={{fontSize:10,color:T3}}>{item.cat} · {item.col} · {item.metal}</div>
                    <div style={{display:"flex",justifyContent:"space-between",marginTop:1}}><div style={{fontSize:9,color:T4}}>👁 {item.views}</div><div style={{fontFamily:"Cormorant Garamond,serif",fontSize:12,fontWeight:700,color:G}}>{fc(item.fp,cur)}</div></div>
                  </div>
                </div>
              ))}
              {fi.length>100&&<div style={{padding:"10px",textAlign:"center",fontSize:11,color:T3}}>Showing 100 of {fi.length}. Use search to filter.</div>}
              {fi.length===0&&<div style={{textAlign:"center",padding:28,color:T3,fontSize:13}}>No items match filter</div>}
            </div>
          </div>}
          {invTab==="audit"&&<div style={{padding:"13px 12px 40px"}}>
            <div style={{...S.card({margin:0,marginBottom:12})}}>
              <div style={S.sh}>🔍 STOCK AUDIT</div>
              <span style={S.lbl}>LOCATION</span>
              <select style={S.inp({marginBottom:10})} value={auditLoc} onChange={ev=>sauditLoc(ev.target.value)}>
                {["Exhibition","Office","Storage","Vault","All"].map(l=><option key={l}>{l}</option>)}
              </select>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>
                {[{l:"Expected",v:locItems.length,c:G},{l:"Scanned",v:auditScanned.length,c:"#27ae60"},{l:"Missing",v:missing.length,c:missing.length>0?RE:T3}].map(x=>(
                  <div key={x.l} style={{background:CRD,borderRadius:9,padding:"10px 8px",textAlign:"center"}}><div style={{fontFamily:"Cormorant Garamond,serif",fontSize:22,fontWeight:700,color:x.c,lineHeight:1}}>{x.v}</div><div style={{fontSize:9,color:T3,marginTop:2,textTransform:"uppercase"}}>{x.l}</div></div>
                ))}
              </div>
              <div style={{display:"flex",gap:7,marginBottom:12}}>
                <button style={S.btn({flex:1,padding:"10px",fontSize:12})} onClick={()=>sscan(x=>!x)}>{scan?"⬛ Stop Scanning":"📷 Scan Item"}</button>
                <button style={S.bOut({flex:1,padding:"10px",fontSize:12})} onClick={()=>{sauditScanned([]);}}>↺ Clear</button>
                <button style={S.btn({flex:1,padding:"10px",fontSize:12,background:GO,color:G})} onClick={saveAudit}>💾 Save Audit</button>
              </div>
            </div>
            {scan&&<QRScanner inv={inv} onScanned={(code,item)=>{sscan(false);if(item&&!auditScanned.find(s=>s.id===item.id)){saScanned(p=>[...p,{item,scannedAt:tstr()}]);}else if(!item){toast.warn("Item not found","Code: "+code);}}}/>}
            {missing.length>0&&<div style={{marginBottom:10}}><div style={{fontSize:10,fontWeight:700,color:RE,textTransform:"uppercase",marginBottom:7}}>⚠ NOT SCANNED ({missing.length})</div>{missing.map(i=><div key={i.id} style={{display:"flex",alignItems:"center",gap:9,padding:"8px 10px",background:REBG,borderRadius:8,marginBottom:5}}><div style={{width:32,height:32,borderRadius:6,overflow:"hidden",flexShrink:0,background:CRD,display:"flex",alignItems:"center",justifyContent:"center"}}>{getImg(i)?<img src={getImg(i)} alt="" style={{width:32,height:32,objectFit:"cover"}}/>:<span style={{fontSize:16}}>{i.em}</span>}</div><div><div style={{fontSize:11,fontWeight:700,color:RE}}>{i.id}</div><div style={{fontSize:9,color:RE}}>{i.cat}</div></div></div>)}</div>}
            {auditScanned.length>0&&<div style={{marginBottom:10}}><div style={{fontSize:10,fontWeight:700,color:"#27ae60",textTransform:"uppercase",marginBottom:7}}>✓ CONFIRMED ({auditScanned.length})</div>{auditScanned.map(({item,scannedAt})=><div key={item.id} style={{display:"flex",alignItems:"center",gap:9,padding:"8px 10px",background:"#edf7f0",borderRadius:8,marginBottom:5}}><div style={{width:32,height:32,borderRadius:6,overflow:"hidden",flexShrink:0,background:CRD,display:"flex",alignItems:"center",justifyContent:"center"}}>{getImg(item)?<img src={getImg(item)} alt="" style={{width:32,height:32,objectFit:"cover"}}/>:<span style={{fontSize:16}}>{item.em}</span>}</div><div style={{flex:1}}><div style={{fontSize:11,fontWeight:700,color:T1}}>{item.id}</div><div style={{fontSize:9,color:T3}}>{scannedAt}</div></div><span style={{color:"#27ae60",fontWeight:700}}>✓</span></div>)}</div>}
            {audits.length>0&&<div><div style={{...S.sh,marginTop:4}}>📋 AUDIT HISTORY</div>{audits.map(r=><div key={r.id} style={{...S.cc({marginBottom:9})}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}><div><div style={{fontWeight:700,fontSize:12,color:T1}}>{r.loc}</div><div style={{fontSize:10,color:T3}}>{r.date} {r.time}</div></div><div style={{textAlign:"right"}}><div style={{fontWeight:700,color:r.missing.length>0?RE:"#27ae60",fontSize:13}}>{r.scanned}/{r.expected}</div><div style={{fontSize:9,color:T3}}>scanned/expected</div></div></div>{r.missing.length>0?<div style={{fontSize:10,color:RE}}>Missing: {r.missing.join(", ")}</div>:<div style={{fontSize:10,color:"#27ae60",fontWeight:600}}>✓ All confirmed</div>}</div>)}</div>}
          </div>}
        </div>
  );
}

function AnalyticsTab(p){
  var sales=p.sales,inv=p.inv,leads=p.leads,cur=p.cur,fc=p.fc,pr=p.pr,ev=p.ev;
  var atab=p.atab,sat=p.sat;

  // ── Helper: bar ─────────────────────────────────────────────────────────
  const Bar=({pct,col,h})=>(
    <div style={{height:h||5,background:CRD2,borderRadius:3,overflow:"hidden",flex:1}}>
      <div style={{height:"100%",width:pct+"%",background:col||G,borderRadius:3,transition:"width 0.4s"}}/>
    </div>
  );

  // ── OVERVIEW ─────────────────────────────────────────────────────────────
  const totalRev=sales.reduce((s,x)=>s+x.total,0);
  const avgDeal=sales.length?totalRev/sales.length:0;
  const totalDisc=sales.reduce((s,x)=>s+Math.round(x.price*x.disc/100*100)/100,0);
  const totalCC=sales.reduce((s,x)=>s+(x.ccAmt||0),0);
  const invCount=inv.length;
  const soldCount=inv.filter(i=>i.st==="sold").length;
  const sellThru=invCount?Math.round(soldCount/invCount*100):0;
  const revPerItem=invCount?totalRev/invCount:0;

  // ── TIMING ───────────────────────────────────────────────────────────────
  const hourMap={};
  const dayMap={};
  sales.forEach(s=>{
    const hr=s.time?parseInt(s.time.split(":")[0],10):0;
    const ampm=s.time&&s.time.includes("PM")&&hr!==12?hr+12:s.time&&s.time.includes("AM")&&hr===12?0:hr;
    hourMap[ampm]=(hourMap[ampm]||0)+1;
    dayMap[s.date]=(dayMap[s.date]||0)+1;
  });
  const hourData=Array.from({length:24},(_,h)=>({h,v:hourMap[h]||0})).filter(x=>x.v>0||( x.h>=8&&x.h<=20));
  const maxHr=Math.max(1,...Object.values(hourMap));
  const dayData=Object.entries(dayMap).sort((a,b)=>a[0]>b[0]?1:-1).map(([d,v])=>({d,v}));
  const maxDay=Math.max(1,...dayData.map(x=>x.v));

  // ── INVENTORY INTELLIGENCE ───────────────────────────────────────────────
  const scanMap={};
  inv.forEach(i=>{if((i.views||0)>0||(i.searches||0)>0)scanMap[i.id]={id:i.id,item:i,scans:(i.views||0)+(i.searches||0),sold:i.st==="sold"};});
  const highInterest=Object.values(scanMap).filter(x=>x.scans>=3&&!x.sold).sort((a,b)=>b.scans-a.scans).slice(0,8);
  const deadStock=inv.filter(i=>i.st==="available"&&!(i.views||0)&&!(i.searches||0));
  const scanToSale=invCount?Math.round(soldCount/invCount*100):0;

  const colMap={};
  sales.forEach(s=>{
    const col=s.col||"Unknown";
    if(!colMap[col])colMap[col]={col,rev:0,cnt:0};
    colMap[col].rev+=s.total;colMap[col].cnt++;
  });
  const colData=Object.values(colMap).sort((a,b)=>b.rev-a.rev);
  const maxColRev=colData.length?colData[0].rev:1;

  const metalMap={};
  sales.forEach(s=>{
    const m=s.metal||"Unknown";
    if(!metalMap[m])metalMap[m]={m,rev:0,cnt:0};
    metalMap[m].rev+=s.total;metalMap[m].cnt++;
  });
  const metalData=Object.values(metalMap).sort((a,b)=>b.rev-a.rev);
  const maxMetRev=metalData.length?metalData[0].rev:1;

  // price band analysis
  const bands=[{l:"<$500",mn:0,mx:500},{l:"$500–1k",mn:500,mx:1000},{l:"$1k–2k",mn:1000,mx:2000},{l:"$2k–5k",mn:2000,mx:5000},{l:"$5k+",mn:5000,mx:Infinity}];
  const bandData=bands.map(b=>({...b,cnt:sales.filter(s=>s.total>=b.mn&&s.total<b.mx).length,rev:sales.filter(s=>s.total>=b.mn&&s.total<b.mx).reduce((a,s)=>a+s.total,0)}));
  const maxBand=Math.max(1,...bandData.map(x=>x.cnt));

  // carat sweet spot
  const tcBands=[{l:"<0.3",mn:0,mx:0.3},{l:"0.3–0.5",mn:0.3,mx:0.5},{l:"0.5–1",mn:0.5,mx:1},{l:"1–2ct",mn:1,mx:2},{l:"2ct+",mn:2,mx:99}];
  const tcData=tcBands.map(b=>{
    const items=inv.filter(i=>i.tc>=b.mn&&i.tc<b.mx);
    const sold=items.filter(i=>i.st==="sold");
    return{...b,total:items.length,sold:sold.length,rate:items.length?Math.round(sold.length/items.length*100):0};
  });
  const maxTC=Math.max(1,...tcData.map(x=>x.sold));

  // ── CUSTOMER INTELLIGENCE ────────────────────────────────────────────────
  const custSales={};
  sales.forEach(s=>{
    const k=s.custName||"(Walk-in)";
    if(!custSales[k])custSales[k]={name:k,cnt:0,rev:0};
    custSales[k].cnt++;custSales[k].rev+=s.total;
  });
  const custArr=Object.values(custSales).sort((a,b)=>b.rev-a.rev);
  const multiItem=custArr.filter(x=>x.cnt>1).length;
  const avgItemsPerCust=custArr.length?sales.length/custArr.length:0;

  const srcMap={};
  leads.forEach(l=>{const s=l.source||"Walk-in";srcMap[s]=(srcMap[s]||0)+1;});
  const srcData=Object.entries(srcMap).sort((a,b)=>b[1]-a[1]);

  const hotLeads=leads.filter(l=>l.status==="Hot");
  const warmLeads=leads.filter(l=>l.status==="Warm");
  const coldLeads=leads.filter(l=>l.status==="Cold");
  const convLeads=leads.filter(l=>sales.some(s=>s.custName===l.name));
  const convRate=leads.length?Math.round(convLeads.length/leads.length*100):0;
  const pipelineVal=hotLeads.reduce((s,l)=>{
    const lastItem=inv.find(i=>sales.find(sale=>sale.custName===l.name&&sale.itemId===i.id));
    return s+(lastItem?lastItem.fp:avgDeal);
  },0);

  // ── STAFF DEEP DIVE ──────────────────────────────────────────────────────
  const staffMap={};
  sales.forEach(s=>{
    if(!staffMap[s.staff])staffMap[s.staff]={name:s.staff,cnt:0,rev:0,disc:0,discCnt:0,totalDisc:0};
    staffMap[s.staff].cnt++;
    staffMap[s.staff].rev+=s.total;
    if(s.disc>0){staffMap[s.staff].discCnt++;staffMap[s.staff].totalDisc+=Math.round(s.price*s.disc/100*100)/100;}
  });
  const staffArr=Object.values(staffMap).sort((a,b)=>b.rev-a.rev);
  const maxStRev=staffArr.length?staffArr[0].rev:1;

  // staff x category
  const staffCatMap={};
  sales.forEach(s=>{
    const it=inv.find(x=>x.id===s.itemId);
    const cat=it?it.cat:"Other";
    const key=s.staff+"|"+cat;
    if(!staffCatMap[key])staffCatMap[key]={staff:s.staff,cat,cnt:0};
    staffCatMap[key].cnt++;
  });

  // ── REVENUE DEPTH ────────────────────────────────────────────────────────
  const cumRev=[];
  let run=0;
  [...sales].sort((a,b)=>a.date>b.date?1:a.date<b.date?-1:0).forEach((s,i)=>{run+=s.total;cumRev.push({i:i+1,v:run});});
  const showDays=dayData.length||1;
  const projectedRev=showDays>0?totalRev/showDays*4:totalRev; // project to 4-day show
  const discImpact=totalRev+totalDisc>0?Math.round(totalDisc/(totalRev+totalDisc)*100):0;

  // cat revenue
  const catRevMap={};
  sales.forEach(s=>{
    const it=inv.find(x=>x.id===s.itemId);
    const cat=it?it.cat:"Other";
    if(!catRevMap[cat])catRevMap[cat]={cat,rev:0,cnt:0};
    catRevMap[cat].rev+=s.total;catRevMap[cat].cnt++;
  });
  const catRevArr=Object.values(catRevMap).sort((a,b)=>b.rev-a.rev);
  const maxCatRev=catRevArr.length?catRevArr[0].rev:1;

  // top 20% pareto
  const itemRevArr=sales.reduce((m,s)=>{
    if(!m[s.itemId])m[s.itemId]={id:s.itemId,rev:0,cnt:0};
    m[s.itemId].rev+=s.total;m[s.itemId].cnt++;
    return m;
  },{});
  const itemRevSorted=Object.values(itemRevArr).sort((a,b)=>b.rev-a.rev);
  const top20cnt=Math.max(1,Math.ceil(itemRevSorted.length*0.2));
  const top20rev=itemRevSorted.slice(0,top20cnt).reduce((s,x)=>s+x.rev,0);
  const top20pct=totalRev>0?Math.round(top20rev/totalRev*100):0;

  const TABS=[
    {id:"overview",l:"Overview",ic:"📊"},
    {id:"timing",l:"Timing",ic:"⏱"},
    {id:"inventory",l:"Stock IQ",ic:"💎"},
    {id:"customers",l:"Customers",ic:"👥"},
    {id:"staff",l:"Staff",ic:"🧑‍💼"},
    {id:"revenue",l:"Revenue",ic:"💰"},
    {id:"pipeline",l:"Pipeline",ic:"🔁"},
  ];

  return(
    <div style={{paddingBottom:40}}>
      {/* Tab bar */}
      <div style={{background:CRD,borderBottom:"1px solid "+CRD2,display:"flex",overflowX:"auto",scrollbarWidth:"none",padding:"0 12px",gap:2}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>sat(t.id)}
            style={{background:"none",border:"none",padding:"11px 10px 9px",fontFamily:"Lato,sans-serif",fontSize:10,fontWeight:atab===t.id?700:500,color:atab===t.id?G:T3,cursor:"pointer",borderBottom:atab===t.id?"2.5px solid "+G:"2.5px solid transparent",whiteSpace:"nowrap",flexShrink:0}}>
            {t.ic} {t.l}
          </button>
        ))}
      </div>

      <div style={{padding:"14px 12px"}}>

      {/* ═══════════════ OVERVIEW ═══════════════ */}
      {atab==="overview"&&(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {/* KPI grid */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {[
              {l:"Total Revenue",v:fc(totalRev,cur),sub:"all sales combined",hi:true},
              {l:"Units Sold",v:soldCount,sub:"of "+invCount+" items"},
              {l:"Avg Deal Size",v:fc(avgDeal,cur),sub:"per transaction"},
              {l:"Sell-Through",v:sellThru+"%",sub:"inventory sold",hi:sellThru>=30},
              {l:"Total Sales",v:sales.length,sub:"transactions"},
              {l:"Customers",v:custArr.length,sub:multiItem+" multi-buy"},
              {l:"Discounts Given",v:fc(totalDisc,cur),sub:discImpact+"% of gross",warn:discImpact>15},
              {l:"CC Surcharge",v:fc(totalCC,cur),sub:"recovered"},
            ].map(k=>(
              <div key={k.l} style={{...S.card({margin:0,padding:"12px 13px"}),borderLeft:"3px solid "+(k.hi?GO:k.warn?RE:G)}}>
                <div style={{fontFamily:"Cormorant Garamond,serif",fontSize:20,fontWeight:700,color:k.hi?GO:k.warn?RE:G}}>{k.v}</div>
                <div style={{fontSize:10,fontWeight:700,color:T1,marginTop:2}}>{k.l}</div>
                <div style={{fontSize:9,color:T3,marginTop:1}}>{k.sub}</div>
              </div>
            ))}
          </div>
          {/* Sell-through bar */}
          <div style={S.card({margin:0})}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
              <span style={S.sh}>Sell-Through Rate</span>
              <span style={{fontFamily:"Cormorant Garamond,serif",fontSize:16,fontWeight:700,color:sellThru>=30?G:AM}}>{sellThru}%</span>
            </div>
            <Bar pct={sellThru} col={sellThru>=30?G:AM} h={8}/>
            <div style={{display:"flex",justifyContent:"space-between",marginTop:5,fontSize:9,color:T3}}>
              <span>{soldCount} sold</span><span>Target: 30%+</span><span>{invCount-soldCount} remaining</span>
            </div>
          </div>
          {/* Pareto */}
          {itemRevSorted.length>0&&(
            <div style={{...S.card({margin:0}),background:"rgba(201,168,76,0.07)",border:"1px solid "+GO}}>
              <div style={{fontWeight:700,fontSize:12,color:G,marginBottom:3}}>⚡ Pareto Insight</div>
              <div style={{fontSize:12,color:T1,lineHeight:1.5}}>
                Top <strong>{top20pct}%</strong> of revenue came from just <strong>{top20cnt} item{top20cnt!==1?"s":""}</strong> ({Math.round(top20cnt/Math.max(itemRevSorted.length,1)*100)}% of catalog).
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════ TIMING ═══════════════ */}
      {atab==="timing"&&(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {/* Hour heatmap */}
          <div style={S.card({margin:0})}>
            <div style={{...S.sh,marginBottom:12}}>⏱ Sales by Hour</div>
            <div style={{display:"flex",gap:3,alignItems:"flex-end",height:60}}>
              {hourData.map(({h,v})=>(
                <div key={h} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                  <div style={{width:"100%",background:v>0?G:CRD2,borderRadius:"3px 3px 0 0",height:Math.max(3,Math.round(v/maxHr*50)),opacity:v===0?0.3:1}}/>
                  <span style={{fontSize:7,color:T3,transform:"rotate(-45deg)",transformOrigin:"center",whiteSpace:"nowrap"}}>{h===0?"12a":h<12?h+"a":h===12?"12p":(h-12)+"p"}</span>
                  {v>0&&<span style={{fontSize:8,fontWeight:700,color:G}}>{v}</span>}
                </div>
              ))}
            </div>
            {hourData.length===0&&<div style={{textAlign:"center",color:T3,fontSize:11,padding:16}}>No timing data yet</div>}
          </div>
          {/* Day by day */}
          <div style={S.card({margin:0})}>
            <div style={{...S.sh,marginBottom:12}}>📅 Day-by-Day Performance</div>
            {dayData.length===0&&<div style={{textAlign:"center",color:T3,fontSize:11}}>No data yet</div>}
            {dayData.map((d,i)=>(
              <div key={d.d} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 0",borderBottom:i<dayData.length-1?"1px solid "+CRD2:"none"}}>
                <div style={{width:60,fontSize:11,fontWeight:600,color:T1,flexShrink:0}}>Day {i+1}</div>
                <div style={{flex:1,display:"flex",flexDirection:"column",gap:3}}>
                  <Bar pct={Math.round(d.v/maxDay*100)} h={7}/>
                  <span style={{fontSize:9,color:T3}}>{d.d}</span>
                </div>
                <div style={{fontWeight:700,fontSize:13,color:G,flexShrink:0}}>{d.v} sales</div>
              </div>
            ))}
          </div>
          {/* Peak insight */}
          {hourData.length>0&&(
            <div style={{...S.card({margin:0}),background:"rgba(30,92,69,0.05)",border:"1px solid "+G}}>
              <div style={{fontWeight:700,fontSize:12,color:G,marginBottom:4}}>⚡ Peak Hour Insight</div>
              {(()=>{
                const peak=hourData.reduce((a,b)=>b.v>a.v?b:a,hourData[0]);
                const hr=peak.h;
                const label=hr===0?"12 AM":hr<12?hr+" AM":hr===12?"12 PM":(hr-12)+" PM";
                return <div style={{fontSize:12,color:T1,lineHeight:1.5}}>Your busiest hour is <strong>{label}</strong> with {peak.v} sale{peak.v!==1?"s":""}. Make sure your best closer is on the floor then.</div>;
              })()}
            </div>
          )}
        </div>
      )}

      {/* ═══════════════ STOCK IQ ═══════════════ */}
      {atab==="inventory"&&(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {/* High interest unsold */}
          <div style={S.card({margin:0})}>
            <div style={{...S.sh,marginBottom:4}}>🔥 High Interest — Not Sold Yet</div>
            <div style={{fontSize:10,color:T3,marginBottom:10}}>Scanned 3+ times but still available. Potential price or fit conversation.</div>
            {highInterest.length===0&&<div style={{textAlign:"center",color:T3,fontSize:11,padding:12}}>No high-interest unsold items yet</div>}
            {highInterest.map((x,i)=>(
              <div key={x.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:i<highInterest.length-1?"1px solid "+CRD2:"none"}}>
                <div style={{width:34,height:34,borderRadius:7,overflow:"hidden",flexShrink:0,background:CRD,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  {x.item.img?<img src={x.item.img} alt="" style={{width:34,height:34,objectFit:"cover"}}/>:<span style={{fontSize:18}}>{x.item.em||"💎"}</span>}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:700,fontSize:12,color:T1}}>{x.id}</div>
                  <div style={{fontSize:10,color:T3}}>{x.item.cat} · {x.item.col} · {x.item.metal}</div>
                </div>
                <div style={{textAlign:"right",flexShrink:0}}>
                  <div style={{fontSize:13,fontWeight:700,color:RE}}>{x.scans}× scanned</div>
                  <div style={{fontFamily:"Cormorant Garamond,serif",fontSize:11,color:G}}>${x.item.fp}</div>
                </div>
              </div>
            ))}
          </div>
          {/* Dead stock */}
          <div style={S.card({margin:0})}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
              <div style={S.sh}>😴 Dead Stock</div>
              <span style={{background:RE,color:WH,fontSize:9,fontWeight:700,padding:"2px 7px",borderRadius:10}}>{deadStock.length} items</span>
            </div>
            <div style={{fontSize:10,color:T3,marginBottom:8}}>0 scans, 0 searches. Consider repositioning or featuring these.</div>
            {deadStock.slice(0,6).map((item,i)=>(
              <div key={item.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:i<Math.min(deadStock.length,6)-1?"1px solid "+CRD2:"none"}}>
                <div>
                  <div style={{fontWeight:700,fontSize:11,color:T1}}>{item.id}</div>
                  <div style={{fontSize:9,color:T3}}>{item.cat} · {item.metal}</div>
                </div>
                <div style={{fontFamily:"Cormorant Garamond,serif",fontSize:12,fontWeight:700,color:T3}}>${item.fp}</div>
              </div>
            ))}
            {deadStock.length>6&&<div style={{fontSize:10,color:T3,textAlign:"center",marginTop:6}}>+{deadStock.length-6} more</div>}
          </div>
          {/* Price band */}
          <div style={S.card({margin:0})}>
            <div style={{...S.sh,marginBottom:10}}>💰 Price Sweet Spot</div>
            {bandData.map((b,i)=>(
              <div key={b.l} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0",borderBottom:i<bandData.length-1?"1px solid "+CRD2:"none"}}>
                <div style={{width:60,fontSize:10,fontWeight:600,color:T1,flexShrink:0}}>{b.l}</div>
                <Bar pct={Math.round(b.cnt/maxBand*100)} col={b.cnt===Math.max(...bandData.map(x=>x.cnt))?GO:G}/>
                <div style={{width:40,textAlign:"right",fontSize:11,fontWeight:700,color:G,flexShrink:0}}>{b.cnt}</div>
              </div>
            ))}
          </div>
          {/* Carat sweet spot */}
          <div style={S.card({margin:0})}>
            <div style={{...S.sh,marginBottom:10}}>💎 Carat Sweet Spot</div>
            {tcData.map((b,i)=>(
              <div key={b.l} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0",borderBottom:i<tcData.length-1?"1px solid "+CRD2:"none"}}>
                <div style={{width:55,fontSize:10,fontWeight:600,color:T1,flexShrink:0}}>{b.l}</div>
                <Bar pct={Math.round(b.sold/maxTC*100)} col={b.rate===Math.max(...tcData.map(x=>x.rate))?GO:G}/>
                <div style={{textAlign:"right",flexShrink:0,minWidth:60}}>
                  <div style={{fontSize:11,fontWeight:700,color:G}}>{b.sold} sold</div>
                  <div style={{fontSize:9,color:T3}}>{b.rate}% conv</div>
                </div>
              </div>
            ))}
          </div>
          {/* Collection + metal */}
          <div style={S.card({margin:0})}>
            <div style={{...S.sh,marginBottom:10}}>✨ Collection Performance</div>
            {colData.length===0&&<div style={{color:T3,fontSize:11,textAlign:"center"}}>No sales yet</div>}
            {colData.map((x,i)=>(
              <div key={x.col} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0",borderBottom:i<colData.length-1?"1px solid "+CRD2:"none"}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                    <span style={{fontSize:11,fontWeight:600,color:T1}}>{x.col}</span>
                    <span style={{fontFamily:"Cormorant Garamond,serif",fontSize:12,fontWeight:700,color:G}}>{fc(x.rev,cur)}</span>
                  </div>
                  <Bar pct={Math.round(x.rev/maxColRev*100)}/>
                  <div style={{fontSize:9,color:T3,marginTop:2}}>{x.cnt} units</div>
                </div>
              </div>
            ))}
          </div>
          <div style={S.card({margin:0})}>
            <div style={{...S.sh,marginBottom:10}}>🔩 Metal Preference</div>
            {metalData.map((x,i)=>(
              <div key={x.m} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0",borderBottom:i<metalData.length-1?"1px solid "+CRD2:"none"}}>
                <div style={{width:70,fontSize:10,fontWeight:600,color:T1,flexShrink:0}}>{x.m}</div>
                <Bar pct={Math.round(x.rev/maxMetRev*100)} col={x.m.includes("Y")?"#C9A84C":x.m.includes("R")?"#C8963A":G}/>
                <div style={{textAlign:"right",flexShrink:0,minWidth:55}}>
                  <div style={{fontSize:11,fontWeight:700,color:G}}>{x.cnt}</div>
                  <div style={{fontSize:9,color:T3}}>{fc(x.rev,cur)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════════ CUSTOMERS ═══════════════ */}
      {atab==="customers"&&(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {/* Summary */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
            {[{l:"Total",v:custArr.length},{l:"Multi-buy",v:multiItem},{l:"Avg Items",v:avgItemsPerCust.toFixed(1)}].map(k=>(
              <div key={k.l} style={{...S.card({margin:0,padding:"12px 10px"}),textAlign:"center"}}>
                <div style={{fontFamily:"Cormorant Garamond,serif",fontSize:20,fontWeight:700,color:G}}>{k.v}</div>
                <div style={{fontSize:9,color:T3,textTransform:"uppercase",marginTop:2}}>{k.l}</div>
              </div>
            ))}
          </div>
          {/* Customer leaderboard */}
          <div style={S.card({margin:0})}>
            <div style={{...S.sh,marginBottom:10}}>🏆 Top Buyers</div>
            {custArr.slice(0,8).map((cust,i)=>(
              <div key={cust.name} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:i<Math.min(custArr.length,8)-1?"1px solid "+CRD2:"none"}}>
                <div style={{width:28,height:28,borderRadius:"50%",background:i===0?GO:i===1?"#C0C0C0":i===2?"#CD7F32":G,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:WH,flexShrink:0}}>
                  {i<3?["🥇","🥈","🥉"][i]:cust.name[0]}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:700,fontSize:12,color:T1}}>{cust.name}</div>
                  <div style={{fontSize:10,color:T3}}>{cust.cnt} purchase{cust.cnt!==1?"s":""}</div>
                </div>
                <div style={{fontFamily:"Cormorant Garamond,serif",fontSize:14,fontWeight:700,color:G,flexShrink:0}}>{fc(cust.rev,cur)}</div>
              </div>
            ))}
          </div>
          {/* Source breakdown */}
          <div style={S.card({margin:0})}>
            <div style={{...S.sh,marginBottom:10}}>📡 Lead Sources</div>
            {srcData.length===0&&<div style={{textAlign:"center",color:T3,fontSize:11}}>No leads yet</div>}
            {srcData.map(([src,cnt],i)=>(
              <div key={src} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0",borderBottom:i<srcData.length-1?"1px solid "+CRD2:"none"}}>
                <div style={{flex:1,fontSize:11,fontWeight:600,color:T1}}>{src}</div>
                <Bar pct={Math.round(cnt/Math.max(1,...srcData.map(x=>x[1]))*100)}/>
                <div style={{fontSize:12,fontWeight:700,color:G,flexShrink:0,width:24,textAlign:"right"}}>{cnt}</div>
              </div>
            ))}
          </div>
          {/* Basket distribution */}
          <div style={S.card({margin:0})}>
            <div style={{...S.sh,marginBottom:10}}>🛍 Basket Size</div>
            {bandData.map((b,i)=>(
              <div key={b.l} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0",borderBottom:i<bandData.length-1?"1px solid "+CRD2:"none"}}>
                <div style={{width:60,fontSize:10,fontWeight:600,color:T1,flexShrink:0}}>{b.l}</div>
                <Bar pct={Math.round(b.cnt/maxBand*100)} col={b.cnt===Math.max(...bandData.map(x=>x.cnt))?GO:G}/>
                <div style={{fontSize:11,fontWeight:700,color:G,flexShrink:0,width:32,textAlign:"right"}}>{b.cnt}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════════ STAFF ═══════════════ */}
      {atab==="staff"&&(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {staffArr.map((st,i)=>(
            <div key={st.name} style={S.card({margin:0})}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{width:34,height:34,borderRadius:"50%",background:i===0?GO:G,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:13,color:CR}}>{st.name[0]}</div>
                  <div>
                    <div style={{fontWeight:700,fontSize:13,color:T1}}>{st.name}</div>
                    <div style={{fontSize:10,color:T3}}>{st.cnt} sales</div>
                  </div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontFamily:"Cormorant Garamond,serif",fontSize:16,fontWeight:700,color:G}}>{fc(st.rev,cur)}</div>
                  <div style={{fontSize:9,color:T3}}>avg {fc(st.cnt?st.rev/st.cnt:0,cur)}/deal</div>
                </div>
              </div>
              <Bar pct={Math.round(st.rev/maxStRev*100)} h={6}/>
              {st.discCnt>0&&(
                <div style={{display:"flex",gap:8,marginTop:8,padding:"6px 9px",background:REBG,borderRadius:7}}>
                  <span style={{fontSize:10,color:RE,flex:1}}>💸 Gave {st.discCnt} discount{st.discCnt!==1?"s":""}  — {fc(st.totalDisc,cur)} total</span>
                </div>
              )}
              {/* Staff category strength */}
              {(()=>{
                const cats=Object.values(staffCatMap).filter(x=>x.staff===st.name).sort((a,b)=>b.cnt-a.cnt).slice(0,3);
                if(!cats.length) return null;
                return(
                  <div style={{display:"flex",gap:5,flexWrap:"wrap",marginTop:8}}>
                    {cats.map(c=><span key={c.cat} style={{background:CRD,borderRadius:6,padding:"3px 8px",fontSize:9,fontWeight:600,color:T2}}>{c.cat} ×{c.cnt}</span>)}
                  </div>
                );
              })()}
            </div>
          ))}
          {staffArr.length===0&&<div style={{...S.card({margin:0,textAlign:"center",padding:36})}}>
            <div style={{fontSize:28,marginBottom:8}}>🧑‍💼</div>
            <div style={{color:T2,fontSize:13,fontWeight:600}}>No sales recorded yet</div>
          </div>}
        </div>
      )}

      {/* ═══════════════ REVENUE ═══════════════ */}
      {atab==="revenue"&&(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {/* Revenue metrics */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {[
              {l:"Total Revenue",v:fc(totalRev,cur),hi:true},
              {l:"Projected (4-day)",v:fc(projectedRev,cur),sub:"at current pace"},
              {l:"Revenue/Item",v:fc(revPerItem,cur),sub:"incl. unsold"},
              {l:"Discount Given",v:fc(totalDisc,cur),sub:discImpact+"% of gross",warn:discImpact>15},
            ].map(k=>(
              <div key={k.l} style={{...S.card({margin:0,padding:"12px 13px"}),borderLeft:"3px solid "+(k.hi?GO:k.warn?RE:G)}}>
                <div style={{fontFamily:"Cormorant Garamond,serif",fontSize:18,fontWeight:700,color:k.hi?GO:k.warn?RE:G}}>{k.v}</div>
                <div style={{fontSize:10,fontWeight:700,color:T1,marginTop:2}}>{k.l}</div>
                {k.sub&&<div style={{fontSize:9,color:T3,marginTop:1}}>{k.sub}</div>}
              </div>
            ))}
          </div>
          {/* Cumulative curve */}
          {cumRev.length>1&&(
            <div style={S.card({margin:0})}>
              <div style={{...S.sh,marginBottom:12}}>📈 Cumulative Revenue</div>
              <div style={{display:"flex",gap:1,alignItems:"flex-end",height:60}}>
                {cumRev.filter((_,i,a)=>a.length<=20||i%(Math.ceil(a.length/20))===0).map((pt,i,arr)=>(
                  <div key={i} style={{flex:1,background:G,borderRadius:"2px 2px 0 0",opacity:0.6+0.4*(i/arr.length),height:Math.max(3,Math.round(pt.v/cumRev[cumRev.length-1].v*56))}}/>
                ))}
              </div>
              <div style={{display:"flex",justifyContent:"space-between",marginTop:4,fontSize:9,color:T3}}>
                <span>Sale 1</span><span>Sale {cumRev.length}</span>
              </div>
            </div>
          )}
          {/* Revenue by category */}
          <div style={S.card({margin:0})}>
            <div style={{...S.sh,marginBottom:10}}>📦 Revenue by Category</div>
            {catRevArr.map((x,i)=>(
              <div key={x.cat} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0",borderBottom:i<catRevArr.length-1?"1px solid "+CRD2:"none"}}>
                <div style={{width:70,fontSize:10,fontWeight:600,color:T1,flexShrink:0}}>{x.cat}</div>
                <Bar pct={Math.round(x.rev/maxCatRev*100)}/>
                <div style={{textAlign:"right",flexShrink:0,minWidth:60}}>
                  <div style={{fontSize:11,fontWeight:700,color:G}}>{fc(x.rev,cur)}</div>
                  <div style={{fontSize:9,color:T3}}>{x.cnt} units</div>
                </div>
              </div>
            ))}
          </div>
          {/* Discount analysis */}
          <div style={{...S.card({margin:0}),border:"1.5px solid "+(discImpact>15?RE:CRD2)}}>
            <div style={{...S.sh,marginBottom:8,color:discImpact>15?RE:T2}}>💸 Discount Impact</div>
            <div style={{display:"flex",gap:16,marginBottom:8}}>
              <div style={{textAlign:"center"}}>
                <div style={{fontFamily:"Cormorant Garamond,serif",fontSize:18,fontWeight:700,color:RE}}>{fc(totalDisc,cur)}</div>
                <div style={{fontSize:9,color:T3}}>Given away</div>
              </div>
              <div style={{textAlign:"center"}}>
                <div style={{fontFamily:"Cormorant Garamond,serif",fontSize:18,fontWeight:700,color:G}}>{discImpact}%</div>
                <div style={{fontSize:9,color:T3}}>of gross rev</div>
              </div>
              <div style={{textAlign:"center"}}>
                <div style={{fontFamily:"Cormorant Garamond,serif",fontSize:18,fontWeight:700,color:AM}}>{sales.filter(s=>s.disc>0).length}</div>
                <div style={{fontSize:9,color:T3}}>discounted</div>
              </div>
            </div>
            {discImpact>15&&<div style={{fontSize:11,color:RE,background:REBG,borderRadius:7,padding:"7px 9px"}}>⚠️ Over 15% revenue given in discounts. Review discount policy with team.</div>}
          </div>
        </div>
      )}

      {/* ═══════════════ PIPELINE ═══════════════ */}
      {atab==="pipeline"&&(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {/* Funnel */}
          <div style={S.card({margin:0})}>
            <div style={{...S.sh,marginBottom:12}}>🔁 Lead Conversion Funnel</div>
            {[
              {l:"Total Leads",v:leads.length,col:G,pct:100},
              {l:"Hot Leads",v:hotLeads.length,col:RE,pct:leads.length?Math.round(hotLeads.length/leads.length*100):0},
              {l:"Warm Leads",v:warmLeads.length,col:AM,pct:leads.length?Math.round(warmLeads.length/leads.length*100):0},
              {l:"Converted to Sale",v:convLeads.length,col:GO,pct:leads.length?Math.round(convLeads.length/leads.length*100):0},
            ].map((row,i)=>(
              <div key={row.l} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:i<3?"1px solid "+CRD2:"none"}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:row.col,flexShrink:0}}/>
                <div style={{flex:1}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                    <span style={{fontSize:11,fontWeight:600,color:T1}}>{row.l}</span>
                    <span style={{fontSize:11,fontWeight:700,color:row.col}}>{row.v}</span>
                  </div>
                  <Bar pct={row.pct} col={row.col} h={5}/>
                </div>
                <div style={{fontSize:10,color:T3,flexShrink:0,width:30,textAlign:"right"}}>{row.pct}%</div>
              </div>
            ))}
            <div style={{marginTop:10,padding:"8px 10px",background:convRate>=20?"rgba(30,92,69,0.07)":AMBG,borderRadius:8}}>
              <div style={{fontSize:12,fontWeight:700,color:convRate>=20?G:AM}}>Conversion Rate: {convRate}%</div>
              <div style={{fontSize:10,color:T3,marginTop:2}}>{convRate>=20?"Good conversion rate. Keep following up.":"Focus on moving Warm leads to Hot."}</div>
            </div>
          </div>
          {/* Hot leads priority */}
          <div style={S.card({margin:0})}>
            <div style={{...S.sh,marginBottom:10,color:RE}}>🔥 Hot Leads — Follow Up Now</div>
            {hotLeads.length===0&&<div style={{textAlign:"center",color:T3,fontSize:11,padding:12}}>No hot leads yet</div>}
            {hotLeads.map((l,i)=>(
              <div key={l.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:i<hotLeads.length-1?"1px solid "+CRD2:"none"}}>
                <div style={{width:32,height:32,borderRadius:"50%",background:RE,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:WH,flexShrink:0}}>{l.name[0]}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:700,fontSize:12,color:T1}}>{l.name}</div>
                  <div style={{fontSize:10,color:T3}}>{l.phone||l.email||"No contact"} · {l.source}</div>
                  {l.notes&&<div style={{fontSize:10,color:AM,marginTop:2,fontStyle:"italic"}}>"{l.notes}"</div>}
                </div>
                <div style={{fontSize:9,color:T3,flexShrink:0}}>{l.created}</div>
              </div>
            ))}
          </div>
          {/* Pipeline value */}
          {pipelineVal>0&&(
            <div style={{...S.card({margin:0}),background:"rgba(201,168,76,0.07)",border:"1px solid "+GO}}>
              <div style={{fontWeight:700,fontSize:12,color:G,marginBottom:4}}>💡 Estimated Pipeline</div>
              <div style={{fontFamily:"Cormorant Garamond,serif",fontSize:24,fontWeight:700,color:GO,marginBottom:4}}>{fc(pipelineVal,cur)}</div>
              <div style={{fontSize:11,color:T2}}>Potential value from {hotLeads.length} hot lead{hotLeads.length!==1?"s":""} if converted.</div>
            </div>
          )}
          {/* Warm leads */}
          <div style={S.card({margin:0})}>
            <div style={{...S.sh,marginBottom:10,color:AM}}>🌡 Warm Leads — Nurture</div>
            {warmLeads.length===0&&<div style={{textAlign:"center",color:T3,fontSize:11,padding:12}}>No warm leads</div>}
            {warmLeads.map((l,i)=>(
              <div key={l.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:i<warmLeads.length-1?"1px solid "+CRD2:"none"}}>
                <div style={{width:28,height:28,borderRadius:"50%",background:AM,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:WH,flexShrink:0}}>{l.name[0]}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:700,fontSize:12,color:T1}}>{l.name}</div>
                  <div style={{fontSize:10,color:T3}}>{l.phone||l.email||"No contact"} · {l.source}</div>
                </div>
                <div style={{fontSize:9,color:T3,flexShrink:0}}>{l.created}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      </div>
    </div>
  );
}

function CurrencyManager({cur,scur,pr}){
  const [editMode,setEditMode]=useState(false);
  const [editRates,setEditRates]=useState({});
  const getCurr=()=>{try{return JSON.parse(localStorage.getItem("vj_curr_rates")||"null")||DEFAULT_CURR;}catch(e){return DEFAULT_CURR;}};
  const startEdit=()=>{const r={};Object.entries(getCurr()).forEach(([k,v])=>{r[k]=v.r;});setEditRates(r);setEditMode(true);};
  const saveRates=()=>{const u={};Object.entries(getCurr()).forEach(([k,v])=>{u[k]={s:v.s,r:parseFloat(editRates[k])||v.r,name:v.name};});localStorage.setItem("vj_curr_rates",JSON.stringify(u));Object.assign(CURR,u);setEditMode(false);};
  const resetRates=()=>{localStorage.removeItem("vj_curr_rates");Object.assign(CURR,DEFAULT_CURR);setEditMode(false);};
  const rates=editMode?getCurr():getCurr();
  return(
    <div style={{...S.card({margin:0,marginBottom:12})}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div style={{fontWeight:700,fontSize:10,color:T2,textTransform:"uppercase",letterSpacing:"0.1em"}}>💱 CURRENCY & EXCHANGE RATES</div>
        {pr.mU&&!editMode&&<button onClick={startEdit} style={{background:GO,color:G,border:"none",borderRadius:7,padding:"5px 11px",fontFamily:"Lato,sans-serif",fontSize:11,fontWeight:700,cursor:"pointer"}}>✏️ Edit Rates</button>}
      </div>
      <span style={S.lbl}>DISPLAY CURRENCY</span>
      <select style={S.inp({marginBottom:12})} value={cur} onChange={e=>scur(e.target.value)}>
        {Object.entries(rates).map(([k,v])=><option key={k} value={k}>{k} — {v.name} ({v.s.trim()})</option>)}
      </select>
      <div style={{background:CRD,borderRadius:10,overflow:"hidden"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1.4fr 1fr",padding:"6px 12px",background:G}}>
          {["Code","Currency","Rate/$1"].map(h=><span key={h} style={{fontSize:9,fontWeight:700,color:"rgba(245,237,224,0.7)",textTransform:"uppercase"}}>{h}</span>)}
        </div>
        {Object.entries(rates).map(([k,v],i,arr)=>(
          <div key={k} style={{display:"grid",gridTemplateColumns:"1fr 1.4fr 1fr",padding:"9px 12px",alignItems:"center",borderBottom:i<arr.length-1?"1px solid "+CRD2:"none",background:cur===k?"rgba(30,92,69,0.06)":"transparent"}}>
            <div style={{display:"flex",alignItems:"center",gap:5}}>
              <span style={{fontWeight:700,fontSize:12,color:cur===k?G:T1}}>{k}</span>
              {cur===k&&<span style={{background:G,color:CR,fontSize:8,fontWeight:700,padding:"1px 5px",borderRadius:8}}>ON</span>}
            </div>
            <span style={{fontSize:11,color:T3}}>{v.name}</span>
            {editMode&&pr.mU
              ?<input type="number" step="0.01" style={{width:"100%",border:"1.5px solid "+G,borderRadius:6,padding:"3px 6px",fontSize:12,fontWeight:700,color:G,textAlign:"right",background:WH,fontFamily:"Lato,sans-serif"}} value={editRates[k]||v.r} onChange={e=>setEditRates(p=>({...p,[k]:e.target.value}))}/>
              :<span style={{fontSize:13,fontWeight:700,color:T1,textAlign:"right",fontFamily:"Cormorant Garamond,serif"}}>{k==="USD"?"Base":v.r.toFixed(k==="JPY"?0:2)}</span>
            }
          </div>
        ))}
      </div>
      {editMode&&(
        <div style={{display:"flex",gap:8,marginTop:10}}>
          <button style={S.btn({flex:1,padding:"10px",fontSize:12})} onClick={saveRates}>✓ Save Rates</button>
          <button style={S.bOut({flex:1,padding:"10px",fontSize:12})} onClick={resetRates}>↺ Reset</button>
          <button onClick={()=>setEditMode(false)} style={{background:"none",border:"none",color:T3,fontFamily:"Lato,sans-serif",fontSize:12,cursor:"pointer",padding:"10px"}}>Cancel</button>
        </div>
      )}
      {!pr.mU&&<div style={{marginTop:8,fontSize:10,color:T3,textAlign:"center"}}>Ask an Admin to update exchange rates</div>}
    </div>
  );
}

function AdminTab(p){

  var ev=p.ev;
  var dark=p.dark||false;
  var inv=p.inv;
  var si=p.si;
  var sales=p.sales;
  var ssl=p.ssl;
  var leads=p.leads;
  var sld=p.sld;
  var cur=p.cur;
  var scur=p.scur;
  var user=p.user;
  var pr=p.pr;
  var users=p.users;
  var onUsersChange=p.onUsersChange;
  var syncUp=p.syncUp;
  var doSell=p.doSell;
  var sinvm=p.sinvm;
  var fc=p.fc;
  var st=p.st;
  var onLogout=p.onLogout;
  var onUpdateEvent=p.onUpdateEvent;
  var allEvents=p.allEvents;
  var onSwitch=p.onSwitch;
  var showSwitch=p.showSwitch;
  var ssw=p.ssw;
  return(
    <div style={{padding:"13px 12px 40px"}}>
          <div style={{fontFamily:"Cormorant Garamond,serif",fontSize:18,fontWeight:700,color:G,marginBottom:16}}>⚙ Settings</div>

          {/* My Profile */}
          <div style={{...S.card({margin:0,marginBottom:12})}}>
            <div style={{fontWeight:700,fontSize:10,color:T2,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:12}}>👤 MY PROFILE</div>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
              <div style={{width:48,height:48,background:G,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:700,color:CR}}>{user.name[0]}</div>
              <div><div style={{fontWeight:700,fontSize:16,color:T1}}>{user.name}</div><div style={{fontSize:12,color:T3,marginTop:2}}>@{user.un} · {user.role}</div></div>
            </div>
            <div style={{background:CRD,borderRadius:9,padding:"10px 12px"}}>
              {[["Role",user.role],["Permissions",user.role==="Admin"?"Full Access":user.role==="Manager"?"View + Edit":"View Only"],["Event",ev.name],["Signed in as",user.un]].map(([l,v])=>(
                <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid "+CRD2}}>
                  <span style={{fontSize:11,color:T3}}>{l}</span>
                  <span style={{fontSize:11,fontWeight:600,color:T1}}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Currency & Display */}
          <CurrencyManager cur={cur} scur={scur} pr={pr}/>

          {/* Event Info */}
          <div style={{...S.card({margin:0,marginBottom:12})}}>
            <div style={{fontWeight:700,fontSize:10,color:T2,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:12}}>📅 EVENT INFO</div>
            {[["Name",ev.name],["Location",ev.loc||"—"],["Dates",(ev.start||"")+" → "+(ev.end||"")],["Status",ev.status],["Items",inv.length],["Sales",sales.length],["Revenue",fc(totalRev,cur)],["Leads",leads.length],["Audit Records",audits.length]].map(([l,v])=>(
              <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid "+CRD2}}>
                <span style={{fontSize:11,color:T3}}>{l}</span>
                <span style={{fontSize:11,fontWeight:600,color:T1}}>{String(v)}</span>
              </div>
            ))}
            <div style={{display:"flex",gap:8,marginTop:11}}>
              <button style={S.btn({flex:1,padding:"10px",fontSize:12})} onClick={()=>onUpdateEvent({...ev,status:"active"})}>Set Active</button>
              <button style={S.bOut({flex:1,padding:"10px",fontSize:12})} onClick={()=>onUpdateEvent({...ev,status:"completed"})}>Mark Complete</button>
            </div>
          </div>

          {/* User Management - Admin only */}
          {pr.mU&&<UserManager users={users} currentUser={user} onUsersChange={onUsersChange}/>}

          {/* Role Permissions */}
          <div style={{...S.card({margin:0,marginBottom:12})}}>
            <div style={{fontWeight:700,fontSize:10,color:T2,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:12}}>🔐 YOUR PERMISSIONS</div>
            {[["View Prices",pr.vP],["View History",pr.vH],["View Analytics",pr.vA],["Override Price",pr.oP],["Export CSV",pr.eC],["Manage Users",pr.mU],["Show Formula",pr.sF],["Show Breakdown",pr.sB]].map(([l,v])=>(
              <div key={l} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid "+CRD2}}>
                <span style={{fontSize:12,color:T2}}>{l}</span>
                <div style={{width:38,height:20,background:v?G:"#ccc",borderRadius:10,position:"relative",flexShrink:0}}>
                  <div style={{position:"absolute",width:14,height:14,top:3,left:v?21:3,background:WH,borderRadius:"50%"}}/>
                </div>
              </div>
            ))}
          </div>

          {/* Sign Out */}
          <button onClick={onLogout} style={{...S.bRed({fontSize:13}),display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>🚪 Sign Out</button>
        </div>
  );
}
function SalesTab(p){

  var ev=p.ev;
  var inv=p.inv;
  var si=p.si;
  var sales=p.sales;
  var ssl=p.ssl;
  var leads=p.leads;
  var sld=p.sld;
  var cur=p.cur;
  var scur=p.scur;
  var user=p.user;
  var pr=p.pr;
  var users=p.users;
  var onUsersChange=p.onUsersChange;
  var syncUp=p.syncUp;
  var doSell=p.doSell;
  var sinvm=p.sinvm;
  var fc=p.fc;
  var onAddLead=p.onAddLead;
  const [showNewSale,sShowNewSale]=useState(false);
  const [nsCust,snsCust]=useState({name:"",phone:"",email:"",company:"",source:"Walk-in"});
  const [nsItems,snsItems]=useState([]);      // [{...item, overridePrice: null}]
  const [nsPayment,snsPayment]=useState("NEFT");
  const [nsDisc,snsDisc]=useState("");        // overall discount %
  const [nsMarkup,snsMarkup]=useState("");    // overall markup %
  const [nsCCType,snsCCType]=useState("pct"); // cc surcharge type
  const [nsCCVal,snsCCVal]=useState("");      // cc surcharge value
  const [nsSearch,snsSearch]=useState("");
  const [nsMatchedCust,snsMatchedCust]=useState(null);
  const setNC=(k,v)=>snsCust(p=>({...p,[k]:v}));
  const setItemPrice=(id,val)=>snsItems(prev=>prev.map(x=>x.id===id?{...x,overridePrice:val}:x));
  // Pricing calculations
  const nsSubtotal=nsItems.reduce((s,x)=>s+(x.overridePrice!==null&&x.overridePrice!==""?parseFloat(x.overridePrice)||x.fp:x.fp),0);
  const nsDiscAmt=nsDisc?Math.round(nsSubtotal*(parseFloat(nsDisc)||0)/100*100)/100:0;
  const nsMarkupAmt=nsMarkup?Math.round(nsSubtotal*(parseFloat(nsMarkup)||0)/100*100)/100:0;
  const nsAfterAdj=Math.round((nsSubtotal-nsDiscAmt+nsMarkupAmt)*100)/100;
  const nsCCAmt=nsPayment==="Credit Card"&&nsCCVal?(nsCCType==="pct"?Math.round(nsAfterAdj*(parseFloat(nsCCVal)||0)/100*100)/100:Math.round((parseFloat(nsCCVal)||0)*100)/100):0;
  const nsTotal=Math.round((nsAfterAdj+nsCCAmt)*100)/100;
  const onNSNameChange=(v)=>{
    snsCust(p=>({...p,name:v}));
    if(v.trim().length>1){
      const m=leads&&leads.find(l=>l.name.toLowerCase().includes(v.trim().toLowerCase()));
      if(m){snsMatchedCust(m);snsCust(p=>({...p,phone:m.phone||p.phone,email:m.email||m.contact||p.email,company:m.company||p.company,source:m.source||p.source}));}
      else snsMatchedCust(null);
    }
  };
  const nsAvail=inv.filter(i=>i.st==="available"&&(!nsSearch||i.id.toLowerCase().includes(nsSearch.toLowerCase())||i.cat.toLowerCase().includes(nsSearch.toLowerCase())));
  const confirmNewSale=()=>{
    if(!nsCust.name.trim()||!nsCust.phone.trim()||!nsCust.email.trim()){
      const missing=[];
      if(!nsCust.name.trim())missing.push("Name");
      if(!nsCust.phone.trim())missing.push("Phone");
      if(!nsCust.email.trim())missing.push("Email");
      toast.error("Required fields missing",missing.join(", ")+" required.");return;
    }
    if(nsItems.length===0){toast.error("No items selected","Add at least one item.");return;}
    const existC=nsMatchedCust||leads.find(l=>l.name.toLowerCase()===nsCust.name.trim().toLowerCase());
    let custId;
    if(existC){
      custId=existC.id;
      const upd={...existC,name:nsCust.name.trim(),phone:nsCust.phone.trim()||existC.phone,email:nsCust.email.trim()||existC.email,company:nsCust.company||existC.company,source:nsCust.source||existC.source};
      onAddLead(upd,"update");
    } else {
      custId=uid("LD");
      onAddLead({id:custId,name:nsCust.name.trim(),phone:nsCust.phone.trim(),email:nsCust.email.trim(),company:nsCust.company.trim(),notes:"",status:"Warm",source:nsCust.source||"Walk-in",contact:nsCust.email.trim(),created:dstr()},"add");
    }
    const bId=uid("B");
    const totalItems=nsItems.length;
    const newSales=nsItems.map((item,i)=>{
      const basePrice=item.overridePrice!==null&&item.overridePrice!==""?parseFloat(item.overridePrice)||item.fp:item.fp;
      const discAmt=nsDisc?Math.round(basePrice*(parseFloat(nsDisc)||0)/100*100)/100:0;
      const markupAmt=nsMarkup?Math.round(basePrice*(parseFloat(nsMarkup)||0)/100*100)/100:0;
      const adjPrice=Math.round((basePrice-discAmt+markupAmt)*100)/100;
      const ccAmt=nsPayment==="Credit Card"&&nsCCVal?(nsCCType==="pct"?Math.round(adjPrice*(parseFloat(nsCCVal)||0)/100*100)/100:Math.round((parseFloat(nsCCVal)||0)*100)/100):0;
      const itemTotal=Math.round((adjPrice+ccAmt)*100)/100;
      return{
        id:i===0?bId:uid("INV"),
        custId:custId,custName:nsCust.name.trim(),phone:nsCust.phone.trim(),
        itemId:item.id,itemName:item.cat+" · "+item.col+" · "+item.metal,
        metal:item.metal,col:item.col,sz:item.sz,gw:item.gw,nw:item.nw,tc:item.tc,
        price:adjPrice,disc:parseFloat(nsDisc)||0,
        cgst:0,sgst:0,
        ccType:nsCCType,ccVal:nsCCVal,ccAmt:ccAmt,
        total:itemTotal,currency:cur,margin:0,
        date:dstr(),time:tstr(),payment:nsPayment,staff:user.name,
        st:"completed",gt:"",
        remark:totalItems>1?"[Batch "+bId+(i>0?" #"+(i+1):"")+"] ":""
      };
    });
    const newInv=inv.map(i=>nsItems.find(x=>x.id===i.id)?{...i,st:"sold"}:i);
    const allSales=[...newSales,...sales];
    si(newInv);ssl(allSales);syncUp(newInv,allSales,null,null);
    toast.success("Sale confirmed",""+nsItems.length+" items · "+fc(nsTotal,cur));
    sShowNewSale(false);snsItems([]);snsCust({name:"",phone:"",email:"",company:"",source:"Walk-in"});
    snsPayment("NEFT");snsDisc("");snsMarkup("");snsCCType("pct");snsCCVal("");snsSearch("");snsMatchedCust(null);
  };
  var st=p.st;
  var onLogout=p.onLogout;
  var onUpdateEvent=p.onUpdateEvent;
  var allEvents=p.allEvents;
  var onSwitch=p.onSwitch;
  var fh=p.fh;
  var hstaff=p.hstaff;
  var shs=p.shs;
  var stf=p.stf;
  var totalRev=p.totalRev;
  return(
    <div style={{padding:"13px 12px 40px"}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:11}}>
              {[{l:"Sales",v:sales.length,c:G},...(pr.vA?[{l:"Revenue",v:"$"+Math.round(totalRev/1000)+"k",c:"#27ae60"}]:[]),...(pr.vA?[{l:"Margin",v:sales.length?Math.round(sales.reduce((s,x)=>s+(x.margin||25),0)/sales.length)+"%":"—",c:AM}]:[])].map(x=>(
                <div key={x.l} style={{background:WH,borderRadius:10,padding:"10px 6px",textAlign:"center",boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}><div style={{fontFamily:"Cormorant Garamond,serif",fontSize:17,fontWeight:700,color:x.c,lineHeight:1}}>{x.v}</div><div style={{fontSize:9,color:T3,marginTop:2,textTransform:"uppercase"}}>{x.l}</div></div>
              ))}
            </div>
            {/* ── New Sale Button ── */}
            <button style={S.btn({marginBottom:10,display:"flex",alignItems:"center",justifyContent:"center",gap:8,fontSize:13})} onClick={()=>sShowNewSale(x=>!x)}>
              {showNewSale?"✕ Cancel New Sale":"+ Direct Sale Entry"}
            </button>
            {/* ── Direct Sale Entry Form ── */}
            {showNewSale&&(
              <div style={{...S.card({margin:"0 0 12px",border:"2px solid "+G})}}>
                <div style={{fontWeight:700,fontSize:13,color:G,marginBottom:12}}>📝 New Sale Entry</div>
                {/* Customer */}
                <div style={{marginBottom:10}}>
                  <div style={{fontWeight:700,fontSize:10,color:T2,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:6}}>Customer Details</div>
                  {nsMatchedCust&&<div style={{background:"rgba(30,92,69,0.08)",borderRadius:8,padding:"6px 10px",marginBottom:6,display:"flex",alignItems:"center",gap:6}}><span>✓</span><span style={{fontSize:11,fontWeight:700,color:G}}>Existing customer</span><button onClick={()=>snsMatchedCust(null)} style={{marginLeft:"auto",background:"none",border:"none",color:T3,fontSize:11,cursor:"pointer"}}>Clear</button></div>}
                  <input style={{...S.inp({marginBottom:6}),borderColor:nsCust.name.trim()?"#E8DCCB":"#C9A84C",borderWidth:nsCust.name.trim()?"1.5px":"2px"}} placeholder="Customer name *" value={nsCust.name} onChange={ev=>onNSNameChange(ev.target.value)}/>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:6}}>
                    <input style={{...S.inp(),borderColor:nsCust.phone.trim()?"#E8DCCB":"#C9A84C",borderWidth:nsCust.phone.trim()?"1.5px":"2px"}} type="tel" placeholder="Phone *" value={nsCust.phone} onChange={ev=>setNC("phone",ev.target.value)}/>
                    <input style={{...S.inp(),borderColor:nsCust.email.trim()?"#E8DCCB":"#C9A84C",borderWidth:nsCust.email.trim()?"1.5px":"2px"}} type="email" placeholder="Email *" value={nsCust.email} onChange={ev=>setNC("email",ev.target.value)}/>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                    <input style={S.inp()} placeholder="Company" value={nsCust.company} onChange={ev=>setNC("company",ev.target.value)}/>
                    <select style={S.inp()} value={nsPayment} onChange={ev=>snsPayment(ev.target.value)}>
                      {["NEFT","RTGS","Cheque","Cash","UPI","Credit Card","Wire Transfer"].map(x=><option key={x}>{x}</option>)}
                    </select>
                  </div>
                </div>
                {/* ── Selected Items with editable price ── */}
                <div style={{fontWeight:700,fontSize:10,color:T2,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:6}}>Select Items ({nsItems.length} added)</div>
                {nsItems.length>0&&(
                  <div style={{border:"1px solid "+CRD2,borderRadius:9,overflow:"hidden",marginBottom:8}}>
                    {nsItems.map((item,i)=>{
                      const effectivePrice=item.overridePrice!==null&&item.overridePrice!==""?parseFloat(item.overridePrice)||item.fp:item.fp;
                      return(
                        <div key={item.id} style={{padding:"8px 10px",borderBottom:i<nsItems.length-1?"1px solid "+CRD2:"none",background:WH}}>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
                            <div>
                              <span style={{fontSize:12,fontWeight:700,color:T1}}>{item.id}</span>
                              <span style={{fontSize:9,color:T3,marginLeft:6}}>{item.cat} · {item.metal}</span>
                            </div>
                            <button onClick={()=>snsItems(prev=>prev.filter(x=>x.id!==item.id))} style={{background:"none",border:"none",color:RE,cursor:"pointer",fontSize:16,padding:0,lineHeight:1}}>×</button>
                          </div>
                          <div style={{display:"flex",alignItems:"center",gap:8}}>
                            <span style={{fontSize:9,color:T3,whiteSpace:"nowrap"}}>List: {fc(item.fp,cur)}</span>
                            <div style={{flex:1,position:"relative"}}>
                              <span style={{position:"absolute",left:9,top:"50%",transform:"translateY(-50%)",fontSize:11,color:T3,fontWeight:600}}>$</span>
                              <input
                                type="number" step="0.01" min="0"
                                style={{...S.inp({marginBottom:0}),paddingLeft:22,fontSize:12,fontWeight:700,color:G,borderColor:item.overridePrice!=null&&item.overridePrice!==""?G:CRD2}}
                                placeholder={item.fp.toFixed(2)}
                                value={item.overridePrice!=null?item.overridePrice:""}
                                onChange={ev=>setItemPrice(item.id,ev.target.value)}
                              />
                            </div>
                            <span style={{fontSize:11,fontWeight:700,color:G,whiteSpace:"nowrap"}}>{fc(effectivePrice,cur)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                {/* Item search & add */}
                <input style={S.inp({marginBottom:6})} placeholder="Search available items (code, category, collection)..." value={nsSearch} onChange={ev=>snsSearch(ev.target.value)}/>
                <div style={{maxHeight:160,overflowY:"auto",border:"1px solid "+CRD2,borderRadius:9,background:WH,marginBottom:10}}>
                  {nsAvail.filter(i=>!nsItems.find(x=>x.id===i.id)).slice(0,30).map((item,idx,arr)=>(
                    <div key={item.id} onClick={()=>snsItems(prev=>[...prev,{...item,overridePrice:null}])} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 12px",borderBottom:idx<arr.length-1?"1px solid "+CRD2:"none",cursor:"pointer"}}>
                      <div>
                        <div style={{fontSize:12,fontWeight:700,color:T1}}>{item.id}</div>
                        <div style={{fontSize:10,color:T3}}>{item.cat} · {item.col} · {item.metal} · {item.tc}ct</div>
                      </div>
                      <div style={{fontFamily:"Cormorant Garamond,serif",fontSize:13,fontWeight:700,color:G}}>{fc(item.fp,cur)}</div>
                    </div>
                  ))}
                  {nsAvail.filter(i=>!nsItems.find(x=>x.id===i.id)).length===0&&<div style={{textAlign:"center",padding:14,color:T3,fontSize:11}}>No available items found</div>}
                </div>
                {/* ── Pricing adjustments ── */}
                {nsItems.length>0&&(
                  <div style={{background:CRD,borderRadius:10,padding:10,marginBottom:10}}>
                    <div style={{fontWeight:700,fontSize:10,color:T2,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>Pricing Adjustments</div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
                      <div>
                        <span style={S.lbl}>DISCOUNT %</span>
                        <input type="number" min="0" max="100" step="0.5" style={S.inp()} placeholder="e.g. 10" value={nsDisc} onChange={ev=>snsDisc(ev.target.value)}/>
                        {nsDiscAmt>0&&<div style={{fontSize:10,color:RE,marginTop:2}}>−{fc(nsDiscAmt,cur)}</div>}
                      </div>
                      <div>
                        <span style={S.lbl}>MARKUP %</span>
                        <input type="number" min="0" step="0.5" style={S.inp()} placeholder="e.g. 5" value={nsMarkup} onChange={ev=>snsMarkup(ev.target.value)}/>
                        {nsMarkupAmt>0&&<div style={{fontSize:10,color:G,marginTop:2}}>+{fc(nsMarkupAmt,cur)}</div>}
                      </div>
                    </div>
                    {/* CC Surcharge — only when Credit Card */}
                    {nsPayment==="Credit Card"&&(
                      <div style={{background:"rgba(123,63,160,0.06)",border:"1px solid rgba(123,63,160,0.2)",borderRadius:8,padding:"8px 10px",marginBottom:8}}>
                        <div style={{fontWeight:700,fontSize:10,color:"#7B3FA0",marginBottom:6}}>💳 CC Surcharge</div>
                        <div style={{display:"flex",gap:6,marginBottom:6}}>
                          <button onClick={()=>snsCCType("pct")} style={{flex:1,padding:"7px",borderRadius:7,border:"1.5px solid "+(nsCCType==="pct"?"#7B3FA0":CRD2),background:nsCCType==="pct"?"#7B3FA0":"transparent",color:nsCCType==="pct"?WH:T2,fontFamily:"Lato,sans-serif",fontSize:11,fontWeight:600,cursor:"pointer"}}>% Rate</button>
                          <button onClick={()=>snsCCType("amt")} style={{flex:1,padding:"7px",borderRadius:7,border:"1.5px solid "+(nsCCType==="amt"?"#7B3FA0":CRD2),background:nsCCType==="amt"?"#7B3FA0":"transparent",color:nsCCType==="amt"?WH:T2,fontFamily:"Lato,sans-serif",fontSize:11,fontWeight:600,cursor:"pointer"}}>Fixed $</button>
                        </div>
                        <input type="number" min="0" step="0.01" style={S.inp()} placeholder={nsCCType==="pct"?"e.g. 2.5 (2.5%)":"e.g. 50 (fixed)"} value={nsCCVal} onChange={ev=>snsCCVal(ev.target.value)}/>
                        {nsCCAmt>0&&<div style={{fontSize:10,color:"#7B3FA0",marginTop:3,fontWeight:600}}>Surcharge: {fc(nsCCAmt,cur)}</div>}
                      </div>
                    )}
                    {/* Price breakdown */}
                    <div style={{borderTop:"1px solid "+CRD2,paddingTop:8,marginTop:4}}>
                      <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:T3,marginBottom:3}}>
                        <span>Subtotal ({nsItems.length} items)</span>
                        <span>{fc(nsSubtotal,cur)}</span>
                      </div>
                      {nsDiscAmt>0&&<div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:RE,marginBottom:3}}>
                        <span>Discount ({nsDisc}%)</span><span>−{fc(nsDiscAmt,cur)}</span>
                      </div>}
                      {nsMarkupAmt>0&&<div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:G,marginBottom:3}}>
                        <span>Markup ({nsMarkup}%)</span><span>+{fc(nsMarkupAmt,cur)}</span>
                      </div>}
                      {nsCCAmt>0&&<div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#7B3FA0",marginBottom:3}}>
                        <span>CC Surcharge{nsCCType==="pct"?" ("+nsCCVal+"%)":""}</span><span>{fc(nsCCAmt,cur)}</span>
                      </div>}
                      <div style={{display:"flex",justifyContent:"space-between",fontWeight:800,fontSize:14,color:G,borderTop:"1px solid "+CRD2,paddingTop:6,marginTop:4}}>
                        <span>GRAND TOTAL</span>
                        <span style={{fontFamily:"Cormorant Garamond,serif",fontSize:18}}>{fc(nsTotal,cur)}</span>
                      </div>
                    </div>
                  </div>
                )}
                <button style={S.btn({padding:"14px",fontSize:13})} onClick={confirmNewSale}>
                  ✓ Confirm Sale — {nsItems.length} item{nsItems.length!==1?"s":""} · {fc(nsTotal,cur)}
                </button>
              </div>
            )}
            <div style={{display:"flex",gap:6,overflowX:"auto",scrollbarWidth:"none",marginBottom:10}}>
              {["All",...stf].map(s=><button key={s} style={S.pill(hstaff===s)} onClick={()=>shs(s)}>{s}</button>)}
            </div>
            <div style={{background:WH,borderRadius:12,overflow:"hidden",border:"1px solid "+CRD2}}>
              {fh.length===0&&<div style={{textAlign:"center",padding:36,color:T3,fontSize:13}}>No sales yet.</div>}
              {fh.map((s,i)=>(
                <div key={s.id} style={{padding:"11px 13px",borderBottom:i<fh.length-1?"1px solid "+CRD2:"none"}}>
                  <div style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:8}}>
                    <div style={{width:44,height:44,borderRadius:8,overflow:"hidden",flexShrink:0,background:CRD,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}} onClick={()=>sinvm(s)}>
                      {(it=>it&&getImg(it)?<img src={getImg(it)} alt="" style={{width:44,height:44,objectFit:"cover"}}/>:<span style={{fontSize:22}}>{it?it.em:"💎"}</span>)(inv.find(x=>x.id===s.itemId))}
                    </div>
                    <div style={{flex:1,minWidth:0,cursor:"pointer"}} onClick={()=>sinvm(s)}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                        <div style={{fontWeight:700,fontSize:13,color:G}}>{s.itemId}</div>
                        <div style={{fontFamily:"Cormorant Garamond,serif",fontSize:14,fontWeight:700,color:G,marginLeft:8}}>{fc(s.total,cur)}</div>
                      </div>
                      <div style={{fontSize:11,color:T2,marginTop:1}}>{s.custName}</div>
                      <div style={{fontSize:10,color:T3}}>{s.staff} · {s.payment} · {s.date}</div>
                      <div style={{display:"flex",gap:5,alignItems:"center",marginTop:3}}>
                        <Bdg t={s.st==="delivered"?"gr":s.st==="pending"?"a":"bl"} ch={s.st} sm/>
                        
                        {s.disc>0&&<span style={{fontSize:9,color:AM}}>Disc {s.disc}%</span>}
                      </div>
                      {s.remark&&<div style={{fontSize:10,color:AM,marginTop:2}}>💬 {s.remark}</div>}
                    </div>
                  </div>
                  <div style={{display:"flex",gap:6}}>
                    <button style={S.btn({flex:1,padding:"8px",fontSize:11})} onClick={()=>sinvm(s)}>🧾 Invoice</button>
                    {s.st!=="delivered"&&<button style={S.bOut({flex:1,padding:"8px",fontSize:11})} onClick={()=>ssl(p=>p.map(x=>x.id===s.id?{...x,st:"delivered"}:x))}>✓ Delivered</button>}
                                        {pr.delSale&&<button style={{background:REBG,border:"1px solid rgba(160,48,48,0.2)",borderRadius:8,padding:"8px 10px",fontFamily:"Lato,sans-serif",fontSize:11,fontWeight:600,color:RE,cursor:"pointer"}} onClick={()=>{{const ni2=inv.map(x=>x.id===s.itemId?{...x,st:"available"}:x);const ns2=sales.filter(x=>x.id!==s.id);si(ni2);ssl(ns2);syncUp(ni2,ns2,null,null);toast.success("Sale deleted",""+s.itemId+" restored to available");}}}>🗑 Delete</button>}
                  </div>
                </div>
              ))}
            </div>
          </div>
  );
}

function HistoryTab(p){
  var sales=p.sales,inv=p.inv,cur=p.cur,fc=p.fc,pr=p.pr,user=p.user,sinvm=p.sinvm;
  const [search,setSearch]=useState("");
  const [staffF,setStaffF]=useState("All");
  const [pmF,setPmF]=useState("All");
  const [view,setView]=useState("list"); // list | analytics
  const [selCust,setSelCust]=useState(null);

  const stf=["All",...[...new Set(sales.map(s=>s.staff))].sort()];
  const pms=["All",...[...new Set(sales.map(s=>s.payment||""))].filter(Boolean).sort()];

  const filtered=sales.filter(s=>{
    if(staffF!=="All"&&s.staff!==staffF)return false;
    if(pmF!=="All"&&s.payment!==pmF)return false;
    if(search){
      const q=search.toLowerCase();
      return(s.custName&&s.custName.toLowerCase().includes(q))||
             (s.itemId&&s.itemId.toLowerCase().includes(q))||
             (s.col&&s.col.toLowerCase().includes(q))||
             (s.payment&&s.payment.toLowerCase().includes(q));
    }
    return true;
  });

  const rev=filtered.reduce((s,x)=>s+x.total,0);
  const avgDeal=filtered.length?rev/filtered.length:0;

  // Customer breakdown
  const custMap={};
  filtered.forEach(s=>{
    const k=s.custName||"(Walk-in)";
    if(!custMap[k])custMap[k]={name:k,count:0,total:0,items:[],lastDate:""};
    custMap[k].count++;
    custMap[k].total+=s.total;
    custMap[k].items.push(s.itemId);
    if(!custMap[k].lastDate||s.date>custMap[k].lastDate)custMap[k].lastDate=s.date;
  });
  const custs=Object.values(custMap).sort((a,b)=>b.total-a.total);

  // Item breakdown
  const itemMap={};
  filtered.forEach(s=>{
    if(!itemMap[s.itemId])itemMap[s.itemId]={id:s.itemId,count:0,total:0};
    itemMap[s.itemId].count++;
    itemMap[s.itemId].total+=s.total;
  });
  const topItems=Object.values(itemMap).sort((a,b)=>b.total-a.total).slice(0,5);

  // Payment breakdown
  const pmMap={};
  filtered.forEach(s=>{
    const k=s.payment||"Unknown";
    if(!pmMap[k])pmMap[k]={pm:k,count:0,total:0};
    pmMap[k].count++;pmMap[k].total+=s.total;
  });
  const pmData=Object.values(pmMap).sort((a,b)=>b.total-a.total);

  // Selected customer detail
  if(selCust){
    const cSales=filtered.filter(s=>(s.custName||"(Walk-in)")===selCust);
    const cRev=cSales.reduce((s,x)=>s+x.total,0);
    return(
      <div style={{padding:"13px 12px 40px"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
          <button onClick={()=>setSelCust(null)} style={{background:"none",border:"none",color:T3,fontSize:14,cursor:"pointer",padding:0}}>← Back</button>
          <div style={{fontFamily:"Cormorant Garamond,serif",fontSize:18,fontWeight:700,color:G}}>{selCust}</div>
        </div>
        <div style={{...S.card({margin:0,marginBottom:12})}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:0}}>
            {[{l:"Purchases",v:cSales.length},{l:"Total Spent",v:fc(cRev,cur)},{l:"Avg Deal",v:fc(cRev/Math.max(cSales.length,1),cur)}].map(x=>(
              <div key={x.l} style={{textAlign:"center"}}>
                <div style={{fontFamily:"Cormorant Garamond,serif",fontSize:17,fontWeight:700,color:G}}>{x.v}</div>
                <div style={{fontSize:9,color:T3,marginTop:2,textTransform:"uppercase"}}>{x.l}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{...S.card({margin:0})}}>
          <div style={S.sh}>🛍 All Purchases</div>
          <div style={{marginTop:10}}>
            {[...cSales].reverse().map((s,i,arr)=>{
              const it=inv.find(x=>x.id===s.itemId);
              return(
                <div key={s.id} onClick={()=>sinvm(s)} style={{display:"flex",gap:10,padding:"10px 0",borderBottom:i<arr.length-1?"1px solid "+CRD2:"none",cursor:"pointer",alignItems:"center"}}>
                  <div style={{width:40,height:40,borderRadius:8,overflow:"hidden",flexShrink:0,background:CRD,display:"flex",alignItems:"center",justifyContent:"center"}}>
                    {it&&getImg(it)?<img src={getImg(it)} alt="" style={{width:40,height:40,objectFit:"cover"}}/>:<span style={{fontSize:20}}>{it?it.em:"💎"}</span>}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:700,fontSize:13,color:T1}}>{s.itemId}</div>
                    <div style={{fontSize:10,color:T3}}>{s.date} · {s.payment} · {s.staff}</div>
                    
                    {s.remark&&<div style={{fontSize:9,color:T3,fontStyle:"italic"}}>{s.remark}</div>}
                  </div>
                  <div style={{textAlign:"right",flexShrink:0}}>
                    <div style={{fontFamily:"Cormorant Garamond,serif",fontSize:14,fontWeight:700,color:G}}>{fc(s.total,cur)}</div>
                    <Bdg t={s.st==="delivered"?"gr":s.st==="pending"?"a":"bl"} ch={s.st} sm/>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return(
    <div style={{padding:"13px 12px 40px"}}>

      {/* Header + view toggle */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:11}}>
        <div style={S.sh}>🕐 HISTORY ({filtered.length})</div>
        <div style={{display:"flex",gap:6}}>
          <button onClick={()=>setView("list")} style={{background:view==="list"?G:CRD,border:"1.5px solid "+(view==="list"?G:CRD2),color:view==="list"?CR:T2,borderRadius:7,padding:"5px 10px",fontFamily:"Lato,sans-serif",fontSize:11,fontWeight:600,cursor:"pointer"}}>List</button>
          <button onClick={()=>setView("analytics")} style={{background:view==="analytics"?G:CRD,border:"1.5px solid "+(view==="analytics"?G:CRD2),color:view==="analytics"?CR:T2,borderRadius:7,padding:"5px 10px",fontFamily:"Lato,sans-serif",fontSize:11,fontWeight:600,cursor:"pointer"}}>Analytics</button>
        </div>
      </div>

      {/* Search + filters */}
      <div style={{...S.card({margin:0,marginBottom:10})}}>
        <input style={S.inp({marginBottom:8})} placeholder="Search customer, item code, payment..." value={search} onChange={e=>setSearch(e.target.value)}/>
        <div style={{display:"flex",gap:7}}>
          <select style={{...S.inp({marginBottom:0}),flex:1}} value={staffF} onChange={e=>setStaffF(e.target.value)}>
            {stf.map(s=><option key={s}>{s}</option>)}
          </select>
          <select style={{...S.inp({marginBottom:0}),flex:1}} value={pmF} onChange={e=>setPmF(e.target.value)}>
            {pms.map(s=><option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Revenue summary bar */}
      {pr.vA&&filtered.length>0&&(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:10}}>
          {[{l:"Revenue",v:fc(rev,cur)},{l:"Sales",v:filtered.length},{l:"Avg Deal",v:fc(avgDeal,cur)}].map(x=>(
            <div key={x.l} style={{...S.card({margin:0,padding:"10px 8px"}),textAlign:"center"}}>
              <div style={{fontFamily:"Cormorant Garamond,serif",fontSize:16,fontWeight:700,color:G}}>{x.v}</div>
              <div style={{fontSize:8,color:T3,marginTop:2,textTransform:"uppercase"}}>{x.l}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── LIST VIEW ── */}
      {view==="list"&&(
        <div style={{background:WH,borderRadius:12,overflow:"hidden",border:"1px solid "+CRD2}}>
          {filtered.length===0&&(
            <div style={{textAlign:"center",padding:40}}>
              <div style={{fontSize:28,marginBottom:10}}>🕐</div>
              <div style={{color:T1,fontSize:14,fontWeight:600,marginBottom:6}}>No Sales Yet</div>
              <div style={{color:T3,fontSize:12}}>Completed sales will appear here.</div>
            </div>
          )}
          {[...filtered].reverse().map((s,i,arr)=>{
            const it=inv.find(x=>x.id===s.itemId);
            return(
              <div key={s.id} onClick={()=>sinvm(s)}
                style={{display:"flex",gap:11,padding:"11px 13px",borderBottom:i<arr.length-1?"1px solid "+CRD2:"none",cursor:"pointer",alignItems:"center"}}>
                <div style={{width:44,height:44,borderRadius:8,overflow:"hidden",flexShrink:0,background:CRD,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  {it&&getImg(it)?<img src={getImg(it)} alt="" style={{width:44,height:44,objectFit:"cover"}}/>:<span style={{fontSize:22}}>{it?it.em:"💎"}</span>}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                    <div style={{fontWeight:700,fontSize:12,color:T1}}>{s.itemId}</div>
                    <div style={{fontFamily:"Cormorant Garamond,serif",fontSize:14,fontWeight:700,color:G,flexShrink:0,marginLeft:6}}>{fc(s.total,cur)}</div>
                  </div>
                  {s.custName&&(
                    <div style={{fontSize:11,fontWeight:600,color:T1,marginTop:1,cursor:"pointer"}}
                      onClick={e=>{e.stopPropagation();setSelCust(s.custName);}}>
                      👤 {s.custName}
                    </div>
                  )}
                  <div style={{fontSize:10,color:T3,marginTop:1}}>{s.payment} · {s.staff} · {s.date}</div>
                  <div style={{display:"flex",gap:5,alignItems:"center",marginTop:3,flexWrap:"wrap"}}>
                    <Bdg t={s.st==="delivered"?"gr":s.st==="pending"?"a":"bl"} ch={s.st} sm/>
                    
                    {s.disc>0&&<Bdg t="a" ch={"Disc "+s.disc+"%"} sm/>}
                    {s.ccAmt>0&&<Bdg t="a" ch={"CC +"+fc(s.ccAmt,cur)} sm/>}
                    {s.remark&&<span style={{fontSize:9,color:T3,fontStyle:"italic"}}>"{s.remark}"</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── ANALYTICS VIEW ── */}
      {view==="analytics"&&filtered.length>0&&(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>

          {/* Customer leaderboard */}
          <div style={S.card({margin:0})}>
            <div style={{...S.sh,marginBottom:11}}>👥 Customers ({custs.length})</div>
            {custs.map((cust,i)=>(
              <div key={cust.name} onClick={()=>setSelCust(cust.name)}
                style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:i<custs.length-1?"1px solid "+CRD2:"none",cursor:"pointer"}}>
                <div style={{width:32,height:32,borderRadius:"50%",background:i===0?GO:G,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:CR,flexShrink:0}}>
                  {cust.name[0]}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:700,fontSize:12,color:T1}}>{cust.name}</div>
                  <div style={{fontSize:10,color:T3}}>{cust.count} purchase{cust.count!==1?"s":""} · Last: {cust.lastDate}</div>
                </div>
                <div style={{textAlign:"right",flexShrink:0}}>
                  <div style={{fontFamily:"Cormorant Garamond,serif",fontSize:13,fontWeight:700,color:G}}>{fc(cust.total,cur)}</div>
                  {i===0&&<div style={{fontSize:8,color:GO,fontWeight:700}}>TOP BUYER</div>}
                </div>
              </div>
            ))}
          </div>

          {/* Top items */}
          <div style={S.card({margin:0})}>
            <div style={{...S.sh,marginBottom:11}}>💎 Top Items</div>
            {topItems.map((item,i)=>{
              const it=inv.find(x=>x.id===item.id);
              const maxT=topItems[0].total;
              return(
                <div key={item.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:i<topItems.length-1?"1px solid "+CRD2:"none"}}>
                  <div style={{width:34,height:34,borderRadius:7,overflow:"hidden",flexShrink:0,background:CRD,display:"flex",alignItems:"center",justifyContent:"center"}}>
                    {it&&getImg(it)?<img src={getImg(it)} alt="" style={{width:34,height:34,objectFit:"cover"}}/>:<span style={{fontSize:18}}>{it?it.em:"💎"}</span>}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                      <span style={{fontWeight:700,fontSize:12,color:T1}}>{item.id}</span>
                      <span style={{fontFamily:"Cormorant Garamond,serif",fontSize:12,fontWeight:700,color:G}}>{fc(item.total,cur)}</span>
                    </div>
                    <div style={{height:4,background:CRD2,borderRadius:2,overflow:"hidden"}}>
                      <div style={{height:"100%",background:G,borderRadius:2,width:Math.round(item.total/maxT*100)+"%"}}/>
                    </div>
                    <div style={{fontSize:9,color:T3,marginTop:2}}>×{item.count} sold</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Payment methods */}
          <div style={S.card({margin:0})}>
            <div style={{...S.sh,marginBottom:11}}>💳 Payment Methods</div>
            {pmData.map((pm,i)=>{
              const pct=Math.round(pm.count/filtered.length*100);
              return(
                <div key={pm.pm} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:i<pmData.length-1?"1px solid "+CRD2:"none"}}>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                      <span style={{fontSize:12,fontWeight:600,color:T1}}>{pm.pm}</span>
                      <span style={{fontSize:11,color:T3}}>{pm.count} · {pct}%</span>
                    </div>
                    <div style={{height:4,background:CRD2,borderRadius:2,overflow:"hidden"}}>
                      <div style={{height:"100%",background:GO,borderRadius:2,width:pct+"%"}}/>
                    </div>
                  </div>
                  <div style={{fontFamily:"Cormorant Garamond,serif",fontSize:13,fontWeight:700,color:G,flexShrink:0}}>{fc(pm.total,cur)}</div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {view==="analytics"&&filtered.length===0&&(
        <div style={{...S.card({margin:0,textAlign:"center",padding:36})}}>
          <div style={{fontSize:28,marginBottom:8}}>📊</div>
          <div style={{color:T2,fontSize:13,fontWeight:600}}>No data to analyze</div>
          <div style={{color:T3,fontSize:11,marginTop:4}}>Complete some sales to see analytics.</div>
        </div>
      )}

    </div>
  );
}

function CustomersTab(p){
  var leads=p.leads,sld=p.sld,sales=p.sales,inv=p.inv,fc=p.fc,cur=p.cur,pr=p.pr;
  const [showForm,sShowForm]=useState(false);
  const [search,setSearch]=useState("");
  const [selected,setSelected]=useState(null);
  const [form,setForm]=useState({name:"",phone:"",email:"",company:"",notes:"",status:"Warm",source:"Walk-in"});
  const filtered=leads.filter(l=>{
    if(!search)return true;
    const q=search.toLowerCase();
    return(l.name&&l.name.toLowerCase().includes(q))||(l.phone&&l.phone.includes(q))||(l.company&&l.company&&l.company.toLowerCase().includes(q));
  });
  const addCustomer=()=>{
    if(!form.name.trim())return;
    const newC={id:uid("LD"),name:form.name.trim(),phone:form.phone.trim(),email:form.email.trim(),company:form.company.trim(),notes:form.notes.trim(),status:form.status,source:form.source,contact:form.email.trim(),created:dstr()};
    sld(p=>[newC,...p]);
    setForm({name:"",phone:"",email:"",company:"",notes:"",status:"Warm",source:"Walk-in"});
    sShowForm(false);
  };
  const upd=(f,v)=>setForm(p=>({...p,[f]:v}));
  if(selected){
    const cust=leads.find(l=>l.id===selected);
    if(!cust){setSelected(null);return null;}
    const cs=sales.filter(s=>s.custName===cust.name);
    const spent=cs.reduce((s,x)=>s+x.total,0);
    return(
      <div style={{padding:"13px 12px 40px"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
          <button onClick={()=>setSelected(null)} style={{background:"none",border:"none",color:T3,fontSize:14,cursor:"pointer",padding:0}}>← Back</button>
          <div style={{fontFamily:"Cormorant Garamond,serif",fontSize:18,fontWeight:700,color:G}}>{cust.name}</div>
        </div>
        <div style={{...S.card({margin:0,marginBottom:12})}}>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
            <div style={{width:50,height:50,background:G,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:700,color:CR,flexShrink:0}}>{cust.name[0]}</div>
            <div style={{flex:1}}>
              <div style={{fontWeight:700,fontSize:16,color:T1}}>{cust.name}</div>
              {cust.company&&<div style={{fontSize:11,color:T3}}>{cust.company}</div>}
              <div style={{display:"flex",gap:6,marginTop:5,flexWrap:"wrap"}}>
                <span style={{background:cust.status==="Hot"?REBG:cust.status==="Warm"?AMBG:"#edf7f0",color:cust.status==="Hot"?RE:cust.status==="Warm"?AM:"#27ae60",fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:20}}>{cust.status}</span>
                <span style={{background:CRD,color:T3,fontSize:10,padding:"2px 8px",borderRadius:20}}>{cust.source||"Walk-in"}</span>
              </div>
            </div>
          </div>
          {[["📞",cust.phone||"—"],["✉️",cust.email||cust.contact||"—"],["📅",cust.created||"—"]].map(([ic,v])=>(
            <div key={ic} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid "+CRD2}}>
              <span style={{fontSize:11,color:T3}}>{ic}</span>
              <span style={{fontSize:11,fontWeight:600,color:T1}}>{v}</span>
            </div>
          ))}
          {cust.notes&&<div style={{marginTop:9,padding:"7px 10px",background:CRD,borderRadius:8,fontSize:11,color:T2}}>{cust.notes}</div>}
          <div style={{display:"flex",gap:7,marginTop:11}}>
            {["Hot","Warm","Cold"].map(s=>(
              <button key={s} onClick={()=>(()=>{
                        const updated={...cust,status:s};
                        sld(p=>p.map(x=>x.id===cust.id?updated:x));
                        ssl(p=>p.map(x=>x.custId===cust.id?{...x,custName:updated.name}:x));
                        syncUp(null,sales.map(x=>x.custId===cust.id?{...x,custName:updated.name}:x),leads.map(x=>x.id===cust.id?updated:x),null);
                      })()} style={{flex:1,padding:"8px",borderRadius:8,border:"1.5px solid "+(cust.status===s?G:CRD2),background:cust.status===s?G:"transparent",color:cust.status===s?CR:T2,fontFamily:"Lato,sans-serif",fontSize:12,fontWeight:600,cursor:"pointer"}}>{s}</button>
            ))}
          </div>
        </div>
        <div style={{...S.card({margin:0})}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:11}}>
            <div style={S.sh}>🛍 PURCHASE HISTORY</div>
            <div style={{fontFamily:"Cormorant Garamond,serif",fontSize:15,fontWeight:700,color:G}}>{fc(spent,cur)}</div>
          </div>
          {cs.length===0?<div style={{textAlign:"center",padding:20,color:T3,fontSize:12}}>No purchases yet</div>:cs.map((s,i)=>{
            const it=inv.find(x=>x.id===s.itemId);
            return(
              <div key={s.id} style={{display:"flex",gap:9,padding:"8px 0",borderBottom:i<cs.length-1?"1px solid "+CRD2:"none",alignItems:"center"}}>
                <div style={{width:34,height:34,borderRadius:7,overflow:"hidden",flexShrink:0,background:CRD,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  {it&&it.img?<img src={it.img} alt="" style={{width:34,height:34,objectFit:"cover"}}/>:<span style={{fontSize:16}}>{it?it.em:"💎"}</span>}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12,fontWeight:700,color:T1}}>{s.itemId}</div>
                  <div style={{fontSize:10,color:T3}}>{s.date} · {s.payment}</div>
                </div>
                <div style={{fontFamily:"Cormorant Garamond,serif",fontSize:13,fontWeight:700,color:G}}>{fc(s.total,cur)}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return(
    <div style={{padding:"13px 12px 40px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:11}}>
        <div style={S.sh}>👥 CUSTOMERS ({leads.length})</div>
        <button style={S.btn({width:"auto",padding:"7px 13px",fontSize:11})} onClick={()=>sShowForm(x=>!x)}>{showForm?"✕ Cancel":"+ Add Customer"}</button>
      </div>
      {showForm&&(
        <div style={{...S.card({margin:0,marginBottom:12,border:"2px solid "+G})}}>
          <div style={{fontWeight:700,fontSize:12,color:G,marginBottom:10}}>New Customer</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            <div><span style={S.lbl}>FULL NAME *</span><input style={S.inp()} placeholder="Customer name" value={form.name} onChange={e=>upd("name",e.target.value)}/></div>
            <div><span style={S.lbl}>PHONE</span><input style={S.inp()} placeholder="+91 98765 43210" type="tel" value={form.phone} onChange={e=>upd("phone",e.target.value)}/></div>
            <div><span style={S.lbl}>EMAIL</span><input style={S.inp()} placeholder="email@example.com" value={form.email} onChange={e=>upd("email",e.target.value)}/></div>
            <div><span style={S.lbl}>COMPANY / STORE</span><input style={S.inp()} placeholder="Company (optional)" value={form.company} onChange={e=>upd("company",e.target.value)}/></div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              <div><span style={S.lbl}>STATUS</span><select style={S.inp()} value={form.status} onChange={e=>upd("status",e.target.value)}>{["Hot","Warm","Cold"].map(s=><option key={s}>{s}</option>)}</select></div>
              <div><span style={S.lbl}>SOURCE</span><select style={S.inp()} value={form.source} onChange={e=>upd("source",e.target.value)}>{["Walk-in","Shopify","WhatsApp","Referral","Trade Show","Other"].map(s=><option key={s}>{s}</option>)}</select></div>
            </div>
            <div><span style={S.lbl}>NOTES</span><textarea style={S.inp({height:60,resize:"none"})} placeholder="Preferences, notes..." value={form.notes} onChange={e=>upd("notes",e.target.value)}/></div>
          </div>
          <button style={S.btn({marginTop:10,padding:"11px",fontSize:13})} onClick={addCustomer} disabled={!form.name.trim()}>✓ Add Customer</button>
        </div>
      )}
      <div style={{position:"relative",marginBottom:9}}>
        <span style={{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",fontSize:14,color:T3}}>🔍</span>
        <input style={S.inp({paddingLeft:34})} placeholder="Search by name, phone, company..." value={search} onChange={e=>setSearch(e.target.value)}/>
      </div>
      <div style={{display:"flex",gap:6,marginBottom:10,overflowX:"auto"}}>
        {["All","Hot","Warm","Cold"].map(s=>(
          <button key={s} onClick={()=>setSearch(s==="All"?"":s)} style={{flexShrink:0,border:"1.5px solid "+CRD2,borderRadius:20,padding:"4px 12px",fontFamily:"Lato,sans-serif",fontSize:11,cursor:"pointer",background:"transparent",color:T3}}>
            {s} ({s==="All"?leads.length:leads.filter(l=>l.status===s).length})
          </button>
        ))}
      </div>
      {filtered.length===0?(
        <div style={{...S.card({margin:0,textAlign:"center",padding:32})}}>
          <div style={{fontSize:28,marginBottom:8}}>👥</div>
          <div style={{color:T2,fontSize:13,fontWeight:600}}>No customers yet</div>
          <div style={{color:T3,fontSize:11,marginTop:3}}>Tap + Add Customer to begin</div>
        </div>
      ):(
        <div style={{background:WH,borderRadius:12,overflow:"hidden",border:"1px solid "+CRD2}}>
          {filtered.map((lead,i)=>{
            const cs=sales.filter(s=>s.custName===lead.name);
            const spent=cs.reduce((s,x)=>s+x.total,0);
            return(
              <div key={lead.id} onClick={()=>setSelected(lead.id)} style={{display:"flex",alignItems:"center",gap:10,padding:"11px 13px",borderBottom:i<filtered.length-1?"1px solid "+CRD2:"none",cursor:"pointer"}}>
                <div style={{width:40,height:40,background:lead.status==="Hot"?RE:lead.status==="Warm"?AM:G,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:700,color:CR,flexShrink:0}}>{lead.name[0]}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:700,fontSize:13,color:T1}}>{lead.name}</div>
                  <div style={{fontSize:10,color:T3,marginTop:1}}>{lead.phone||lead.email||lead.contact||"No contact"}</div>
                  {lead.company&&<div style={{fontSize:10,color:T4}}>{lead.company}</div>}
                </div>
                <div style={{textAlign:"right",flexShrink:0}}>
                  {spent>0&&<div style={{fontFamily:"Cormorant Garamond,serif",fontSize:13,fontWeight:700,color:G}}>{fc(spent,cur)}</div>}
                  <div style={{fontSize:9,color:T3}}>{cs.length} purchase{cs.length!==1?"s":""}</div>
                  <span style={{fontSize:9,padding:"2px 7px",borderRadius:10,background:lead.status==="Hot"?REBG:lead.status==="Warm"?AMBG:"#edf7f0",color:lead.status==="Hot"?RE:lead.status==="Warm"?AM:"#27ae60",fontWeight:700}}>{lead.status}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function EventERP({ev,user,allUsers,onUsersChange,allEvents,onSwitch,onUpdateEvent,onBack,onLogout}){
  const pr=gp(user.role, user.perms);
  const users=allUsers;
  const [tab,st]=useState("lookup");
  const [inv,si]=useState(ev.inv);
  const [sales,ssl]=useState(ev.sales);
  const [leads,sld]=useState(ev.leads||[]);
  const [cur,scur]=useState("USD");
  const [jc,sjc]=useState("");
  const [det,sdet]=useState(null);
  const [mlTab,smlTab]=useState("single");
  const [mlInput,smlInput]=useState("");
  const [mlItems,smlItems]=useState([]);
  const [mlDisc,smlDisc]=useState("");
  const [mlDiscAmt,smlDiscAmt]=useState("");
  const [mlMarkup,smlMarkup]=useState("");
  const [mlNF,smlNF]=useState([]);
  const [mlScan,smlScan]=useState(false);
  const [showFilter,sShowFilter]=useState(false);
  var photoSearch=p.photoSearch;
  var sPhotoSearch=p.sPhotoSearch;
  const [fCat,sfCat]=useState("All");
  const [fCol,sfCol]=useState("All");
  const [fMetal,sfMetal]=useState("All");
  const [fSt,sfSt]=useState("All");
  const [fShape,sfShape]=useState("All");
  const [fMinTc,sfMinTc]=useState("");
  const [fMaxTc,sfMaxTc]=useState("");
  const [fMinGw,sfMinGw]=useState("");
  const [fMaxGw,sfMaxGw]=useState("");
  const [fMinNw,sfMinNw]=useState("");
  const [fMaxNw,sfMaxNw]=useState("");
  const [fMinFp,sfMinFp]=useState("");
  const [fMaxFp,sfMaxFp]=useState("");
  const [scan,sscan]=useState(false);
  const [invm,sinvm]=useState(null);
  const [showSwitch,ssw]=useState(false);
  const [showUser,ssu]=useState(false);
  const [invTab,sivTab]=useState("stock");
  const [isq,sisq]=useState("");
  const [ist,sist]=useState("All");
  const [icat,sicat]=useState("All");
  const [auditLoc,saLoc]=useState("Exhibition");
  const [auditScanned,saScanned]=useState([]);
  const [audits,sAudits]=useState(ev.audits||[]);
  const [hstaff,shs]=useState("All");
  const [atab,sat]=useState("overview");
  const syncUp=(ni,ns,nl,na)=>onUpdateEvent({...ev,inv:ni||inv,sales:ns||sales,leads:nl||leads,audits:na||audits});
  const doSell=sale=>{const ni=inv.map(i=>i.id===sale.itemId?{...i,st:"sold"}:i);const ns=[sale,...sales];si(ni);ssl(ns);sdet(null);sinvm(sale);syncUp(ni,ns,null,null);};
  const onAddLead=(cust,action)=>{
    if(action==="update"){
      const nl=leads.map(l=>l.id===cust.id?cust:l);
      sld(nl);
      const ns=sales.map(s=>s.custId===cust.id?{...s,custName:cust.name,phone:cust.phone}:s);
      ssl(ns);
      syncUp(null,ns,nl,null);
    } else {
      const nl=[cust,...leads];
      sld(nl);
      syncUp(null,null,nl,null);
    }
  };
  
  window._switchItem=(item)=>sdet(item);
  const mlSubtotal=mlItems.reduce((s,i)=>s+i.fp,0);
  const mlAdj=mlDisc?mlSubtotal*Number(mlDisc)/100:mlDiscAmt?Number(mlDiscAmt):mlMarkup?-(mlSubtotal*Number(mlMarkup)/100):0;
  const mlFinal=Math.max(0,Math.round((mlSubtotal-mlAdj)*100)/100);
  const mlTotal=Math.round(mlFinal*1.03*100)/100;
  const resolveCodes=()=>{const codes=mlInput.replace(/\n/g,",").split(",").map(function(s){return s.trim();}).map(s=>s.trim().toUpperCase()).filter(Boolean);const found=[],nf=[];codes.forEach(code=>{const item=inv.find(i=>i.id===code);if(item&&!found.find(f=>f.id===item.id))found.push(item);else if(!item)nf.push(code);});smlItems(found);smlNF(nf);smlDisc("");smlDiscAmt("");smlMarkup("");};
  const sellMulti=(custName,phone,custId)=>{const bId=uid("B");mlItems.forEach((item,i)=>{const ip=Math.round((item.fp*(mlFinal/Math.max(mlSubtotal,1)))*100)/100;doSell({id:i===0?bId:uid("INV"),custId:custId||"",custName:custName,phone:phone||"",itemId:item.id,itemName:item.cat+" · "+item.col+" · "+item.metal,metal:item.metal,col:item.col,sz:item.sz,gw:item.gw,nw:item.nw,tc:item.tc,sp:item.sp,style:item.style,price:ip,disc:mlDisc?Number(mlDisc):0,cgst:0,sgst:0,total:Math.round(ip*(1+(mlMarkup?Number(mlMarkup)/100:0))*100)/100,currency:cur,margin:0,date:dstr(),time:tstr(),payment:"NEFT",staff:user.name,st:"completed",gt:"",remark:mlItems.length>1?"[Batch "+bId+(i>0?" #"+(i+1):"")+"] ":""});});smlItems([]);smlInput("");st("sales");toast.success("Sale confirmed",""+mlItems.length+" items · "+custName);};
  // Filter options derived from inventory
  const allCats=["All",...new Set(inv.map(i=>i.cat).filter(Boolean))].sort();
  const allCols=["All",...new Set(inv.map(i=>i.col).filter(Boolean))].sort();
  const allMetals=["All",...new Set(inv.map(i=>i.metal).filter(Boolean))].sort();
  const allShapes=["All",...new Set(inv.reduce((a,i)=>a.concat((i.stones||[]).map(s=>s.sh)),[]).filter(Boolean))].sort();
  const allSt=["All","available","sold","reserved"];

  // Apply all filters to get filtered lookup results
  const applyFilters=(items,q)=>items.filter(i=>(fCat==="All"||i.cat===fCat)&&(fCol==="All"||i.col===fCol)&&(fMetal==="All"||i.metal===fMetal)&&(fSt==="All"||i.st===fSt)&&(fShape==="All"||(i.stones||[]).some(s=>s.sh===fShape))&&(!fMinTc||i.tc>=Number(fMinTc))&&(!fMaxTc||i.tc<=Number(fMaxTc))&&(!fMinGw||i.gw>=Number(fMinGw))&&(!fMaxGw||i.gw<=Number(fMaxGw))&&(!fMinNw||i.nw>=Number(fMinNw))&&(!fMaxNw||i.nw<=Number(fMaxNw))&&(!fMinFp||i.fp>=Number(fMinFp))&&(!fMaxFp||i.fp<=Number(fMaxFp))&&(!q||i.id.toLowerCase().includes(q.toLowerCase())||i.col.toLowerCase().includes(q.toLowerCase())||i.cat.toLowerCase().includes(q.toLowerCase())||i.metal.toLowerCase().includes(q.toLowerCase())||(i.style&&i.style.toLowerCase().includes(q.toLowerCase()))));
  const activeFilters=[fCat!=="All",fCol!=="All",fMetal!=="All",fSt!=="All",fShape!=="All",fMinTc,fMaxTc,fMinGw,fMaxGw,fMinNw,fMaxNw,fMinFp,fMaxFp].filter(Boolean).length;
  const resetFilters=()=>{sfCat("All");sfCol("All");sfMetal("All");sfSt("All");sfShape("All");sfMinTc("");sfMaxTc("");sfMinGw("");sfMaxGw("");sfMinNw("");sfMaxNw("");sfMinFp("");sfMaxFp("");};

  const cats=["All",...new Set(inv.map(i=>i.cat))];
  const deadStock=inv.filter(i=>i.st==="available"&&i.views===0&&i.searches===0);
  const fi=inv.filter(i=>!isq||i.id.toLowerCase().includes(isq.toLowerCase())||i.cat.toLowerCase().includes(isq.toLowerCase())||i.col.toLowerCase().includes(isq.toLowerCase())||i.metal.toLowerCase().includes(isq.toLowerCase()));
  const fh=sales.filter(s=>hstaff==="All"||s.staff===hstaff);
  const totalRev=sales.reduce((s,x)=>s+x.total,0);
  const stf=[...new Set(sales.map(s=>s.staff))];
  const locItems=inv.filter(i=>i.loc===auditLoc&&i.st!=="sold");
  const missing=locItems.filter(i=>!auditScanned.find(s=>s.id===i.id));
  const TABS=[{id:"lookup",l:"LOOKUP",ic:"🔍"},...(pr.vH?[{id:"sales",l:"SALES",ic:"💰"},{id:"history",l:"HISTORY",ic:"🕐"}]:[]),...(pr.vA?[{id:"analytics",l:"ANALYTICS",ic:"📊"}]:[]),{id:"inventory",l:"STOCK",ic:"📦"},{id:"customers",l:"CUSTOMERS",ic:"👥"},{id:"admin",l:"SETTINGS",ic:"⚙"}];
  const addLead=()=>toast.info("Add customers via Customers tab","Complete a sale to auto-create a customer.");
  const saveAudit=()=>{if(auditScanned.length===0){toast.warn("No items scanned","Scan items before saving.");}else{const rec={id:uid("AUD"),loc:auditLoc,date:dstr(),time:tstr(),expected:locItems.length,scanned:auditScanned.length,missing:missing.map(i=>i.id),items:auditScanned.map(i=>i.id)};const na=[rec,...audits];sAudits(na);syncUp(null,null,null,na);toast.success("Audit saved",""+auditScanned.length+" scanned · "+missing.length+" missing");}};
  // Computed for lookup display (avoids IIFE in JSX)
  const lkQ = jc.trim();
  const lkResults = applyFilters(inv, lkQ || null);
  const lkShowResults = lkQ.length > 0 || activeFilters > 0;

  return(
    <div style={{maxWidth:430,margin:"0 auto",minHeight:"100vh",display:"flex",flexDirection:"column",background:GD,fontFamily:"Lato,sans-serif"}}>
      <div style={{background:G,padding:"9px 13px",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:7}}><button onClick={onBack} style={{background:"none",border:"none",color:GO,cursor:"pointer",fontSize:16,padding:"0 3px 0 0"}}>‹</button><Lotus sz={24}/><div><div style={{fontFamily:"Cormorant Garamond,serif",fontSize:12,fontWeight:700,color:CR,letterSpacing:"0.1em",textTransform:"uppercase"}}>VIANNE JEWELS</div><div style={{fontSize:7,color:GO,textTransform:"uppercase",maxWidth:120,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{ev.name}</div></div></div>
        <div style={{display:"flex",alignItems:"center",gap:5}}>
          <select value={cur} onChange={ev=>scur(ev.target.value)} style={{background:"rgba(255,255,255,0.12)",border:"1px solid rgba(255,255,255,0.2)",color:CR,borderRadius:5,padding:"2px 5px",fontSize:9,fontWeight:600,cursor:"pointer"}}>{Object.keys(CURR).map(k=><option key={k} style={{color:T1}}>{k}</option>)}</select>
          <button onClick={()=>ssw(true)} style={{background:GO,border:"none",borderRadius:5,color:G,padding:"4px 7px",cursor:"pointer",fontSize:9,fontWeight:700}}>⇄</button>
          <div onClick={()=>ssu(x=>!x)} style={{width:26,height:26,background:GO,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:G,cursor:"pointer",position:"relative"}}>
            {user.name[0]}
            {showUser&&<div onClick={e=>e.stopPropagation()} style={{position:"absolute",top:30,right:0,background:WH,borderRadius:10,boxShadow:"0 4px 16px rgba(0,0,0,0.15)",padding:"10px 12px",minWidth:140,zIndex:100}}><div style={{fontSize:13,fontWeight:700,color:T1,marginBottom:1}}>{user.name}</div><div style={{fontSize:10,color:T3,marginBottom:9}}>{user.role}</div><button onClick={()=>{ssu(false);onLogout();}} style={{width:"100%",background:"none",border:"none",padding:"7px 0",textAlign:"left",cursor:"pointer",fontSize:12,color:RE,fontWeight:600}}>🚪 Sign Out</button></div>}
          </div>
        </div>
      </div>
      <div style={{background:G,display:"flex",overflowX:"auto",scrollbarWidth:"none",borderBottom:"1px solid rgba(201,168,76,0.25)",flexShrink:0}}>
        {TABS.map(t=><button key={t.id} onClick={()=>st(t.id)} style={{flexShrink:0,background:"none",border:"none",borderBottom:tab===t.id?"2.5px solid "+GO:"2.5px solid transparent",color:tab===t.id?GO:"rgba(245,237,224,0.5)",fontFamily:"Lato,sans-serif",fontSize:10,fontWeight:tab===t.id?700:500,padding:"9px 10px",cursor:"pointer",whiteSpace:"nowrap"}}>{t.ic} {t.l}</button>)}
      </div>
      <div style={{flex:1,background:CRD,overflowY:"auto"}}>
        {tab==="lookup"&&<LookupTab {...{ev:ev,inv:inv,si:si,sales:sales,ssl:ssl,leads:leads,sld:sld,cur:cur,scur:scur,user:user,pr:pr,users:users,onUsersChange:onUsersChange,syncUp:syncUp,doSell:doSell,sinvm:sinvm,sdet:sdet,fc:fc,st:st,onLogout:onLogout,onUpdateEvent:onUpdateEvent,allEvents:allEvents,onSwitch:onSwitch,jc:jc,sjc:sjc,det:det,scan:scan,sscan:sscan,mlTab:mlTab,smlTab:smlTab,mlInput:mlInput,smlInput:smlInput,mlItems:mlItems,smlItems:smlItems,mlDisc:mlDisc,smlDisc:smlDisc,mlDiscAmt:mlDiscAmt,smlDiscAmt:smlDiscAmt,mlMarkup:mlMarkup,smlMarkup:smlMarkup,mlNF:mlNF,smlNF:smlNF,mlScan:mlScan,smlScan:smlScan,mlSubtotal:mlSubtotal,mlFinal:mlFinal,mlTotal:mlTotal,resolveCodes:resolveCodes,sellMulti:sellMulti,showFilter:showFilter,sShowFilter:sShowFilter,activeFilters:activeFilters,resetFilters:resetFilters,fCat:fCat,sfCat:sfCat,fCol:fCol,sfCol:sfCol,fMetal:fMetal,sfMetal:sfMetal,fSt:fSt,sfSt:sfSt,fShape:fShape,sfShape:sfShape,fMinTc:fMinTc,sfMinTc:sfMinTc,fMaxTc:fMaxTc,sfMaxTc:sfMaxTc,fMinGw:fMinGw,sfMinGw:sfMinGw,fMaxGw:fMaxGw,sfMaxGw:sfMaxGw,fMinNw:fMinNw,sfMinNw:sfMinNw,fMaxNw:fMaxNw,sfMaxNw:sfMaxNw,fMinFp:fMinFp,sfMinFp:sfMinFp,fMaxFp:fMaxFp,sfMaxFp:sfMaxFp,allCats:allCats,allCols:allCols,allMetals:allMetals,allShapes:allShapes,allSt:allSt,lkQ:lkQ,lkResults:lkResults,lkShowResults:lkShowResults,applyFilters:applyFilters,invTab:invTab,sivTab:sivTab,isq:isq,sisq:sisq,ist:ist,sist:sist,icat:icat,sicat:sicat,fi:fi,cats:cats,deadStock:deadStock,auditLoc:auditLoc,saLoc:saLoc,auditScanned:auditScanned,saScanned:saScanned,audits:audits,sAudits:sAudits,locItems:locItems,missing:missing,saveAudit:saveAudit,totalRev:totalRev,stf:stf,hstaff:hstaff,shs:shs,atab:atab,sat:sat,showSwitch:showSwitch,ssw:ssw}}/>}

        {tab==="sales"&&<SalesTab {...{ev:ev,inv:inv,si:si,sales:sales,ssl:ssl,leads:leads,sld:sld,cur:cur,user:user,pr:pr,fc:fc,st:st,doSell:doSell,sinvm:sinvm,syncUp:syncUp,hstaff:hstaff,shs:shs,stf:stf,fh:fh,totalRev:totalRev,onLogout:onLogout,onAddLead:onAddLead}}/>}

        {tab==="history"&&<HistoryTab {...{ev:ev,inv:inv,si:si,sales:sales,ssl:ssl,leads:leads,sld:sld,cur:cur,user:user,pr:pr,fc:fc,st:st,doSell:doSell,sinvm:sinvm,syncUp:syncUp,hstaff:hstaff,shs:shs,stf:stf,fh:fh,totalRev:totalRev,onLogout:onLogout}}/>}

        {tab==="inventory"&&<InventoryTab {...{ev:ev,inv:inv,si:si,sales:sales,ssl:ssl,leads:leads,sld:sld,cur:cur,scur:scur,user:user,pr:pr,users:users,onUsersChange:onUsersChange,syncUp:syncUp,doSell:doSell,sinvm:sinvm,sdet:sdet,fc:fc,st:st,onLogout:onLogout,onUpdateEvent:onUpdateEvent,allEvents:allEvents,onSwitch:onSwitch,jc:jc,sjc:sjc,det:det,scan:scan,sscan:sscan,mlTab:mlTab,smlTab:smlTab,mlInput:mlInput,smlInput:smlInput,mlItems:mlItems,smlItems:smlItems,mlDisc:mlDisc,smlDisc:smlDisc,mlDiscAmt:mlDiscAmt,smlDiscAmt:smlDiscAmt,mlMarkup:mlMarkup,smlMarkup:smlMarkup,mlNF:mlNF,smlNF:smlNF,mlScan:mlScan,smlScan:smlScan,mlSubtotal:mlSubtotal,mlFinal:mlFinal,mlTotal:mlTotal,resolveCodes:resolveCodes,sellMulti:sellMulti,showFilter:showFilter,sShowFilter:sShowFilter,activeFilters:activeFilters,resetFilters:resetFilters,fCat:fCat,sfCat:sfCat,fCol:fCol,sfCol:sfCol,fMetal:fMetal,sfMetal:sfMetal,fSt:fSt,sfSt:sfSt,fShape:fShape,sfShape:sfShape,fMinTc:fMinTc,sfMinTc:sfMinTc,fMaxTc:fMaxTc,sfMaxTc:sfMaxTc,fMinGw:fMinGw,sfMinGw:sfMinGw,fMaxGw:fMaxGw,sfMaxGw:sfMaxGw,fMinNw:fMinNw,sfMinNw:sfMinNw,fMaxNw:fMaxNw,sfMaxNw:sfMaxNw,fMinFp:fMinFp,sfMinFp:sfMinFp,fMaxFp:fMaxFp,sfMaxFp:sfMaxFp,allCats:allCats,allCols:allCols,allMetals:allMetals,allShapes:allShapes,allSt:allSt,lkQ:lkQ,lkResults:lkResults,lkShowResults:lkShowResults,applyFilters:applyFilters,invTab:invTab,sivTab:sivTab,isq:isq,sisq:sisq,ist:ist,sist:sist,icat:icat,sicat:sicat,fi:fi,cats:cats,deadStock:deadStock,auditLoc:auditLoc,saLoc:saLoc,auditScanned:auditScanned,saScanned:saScanned,audits:audits,sAudits:sAudits,locItems:locItems,missing:missing,saveAudit:saveAudit,totalRev:totalRev,stf:stf,hstaff:hstaff,shs:shs,atab:atab,sat:sat,showSwitch:showSwitch,ssw:ssw}}/>}

        {tab==="customers"&&<CustomersTab {...{ev:ev,inv:inv,si:si,sales:sales,ssl:ssl,leads:leads,sld:sld,cur:cur,user:user,pr:pr,fc:fc,st:st,doSell:doSell,sinvm:sinvm,syncUp:syncUp,hstaff:hstaff,shs:shs,stf:stf,fh:fh,totalRev:totalRev,onLogout:onLogout,addLead:addLead}}/>}

        {tab==="analytics"&&<AnalyticsTab {...{ev:ev,inv:inv,si:si,sales:sales,ssl:ssl,leads:leads,sld:sld,cur:cur,scur:scur,user:user,pr:pr,users:users,onUsersChange:onUsersChange,syncUp:syncUp,doSell:doSell,sinvm:sinvm,sdet:sdet,fc:fc,st:st,onLogout:onLogout,onUpdateEvent:onUpdateEvent,allEvents:allEvents,onSwitch:onSwitch,jc:jc,sjc:sjc,det:det,scan:scan,sscan:sscan,mlTab:mlTab,smlTab:smlTab,mlInput:mlInput,smlInput:smlInput,mlItems:mlItems,smlItems:smlItems,mlDisc:mlDisc,smlDisc:smlDisc,mlDiscAmt:mlDiscAmt,smlDiscAmt:smlDiscAmt,mlMarkup:mlMarkup,smlMarkup:smlMarkup,mlNF:mlNF,smlNF:smlNF,mlScan:mlScan,smlScan:smlScan,mlSubtotal:mlSubtotal,mlFinal:mlFinal,mlTotal:mlTotal,resolveCodes:resolveCodes,sellMulti:sellMulti,showFilter:showFilter,sShowFilter:sShowFilter,activeFilters:activeFilters,resetFilters:resetFilters,fCat:fCat,sfCat:sfCat,fCol:fCol,sfCol:sfCol,fMetal:fMetal,sfMetal:sfMetal,fSt:fSt,sfSt:sfSt,fShape:fShape,sfShape:sfShape,fMinTc:fMinTc,sfMinTc:sfMinTc,fMaxTc:fMaxTc,sfMaxTc:sfMaxTc,fMinGw:fMinGw,sfMinGw:sfMinGw,fMaxGw:fMaxGw,sfMaxGw:sfMaxGw,fMinNw:fMinNw,sfMinNw:sfMinNw,fMaxNw:fMaxNw,sfMaxNw:sfMaxNw,fMinFp:fMinFp,sfMinFp:sfMinFp,fMaxFp:fMaxFp,sfMaxFp:sfMaxFp,allCats:allCats,allCols:allCols,allMetals:allMetals,allShapes:allShapes,allSt:allSt,lkQ:lkQ,lkResults:lkResults,lkShowResults:lkShowResults,applyFilters:applyFilters,invTab:invTab,sivTab:sivTab,isq:isq,sisq:sisq,ist:ist,sist:sist,icat:icat,sicat:sicat,fi:fi,cats:cats,deadStock:deadStock,auditLoc:auditLoc,saLoc:saLoc,auditScanned:auditScanned,saScanned:saScanned,audits:audits,sAudits:sAudits,locItems:locItems,missing:missing,saveAudit:saveAudit,totalRev:totalRev,stf:stf,hstaff:hstaff,shs:shs,atab:atab,sat:sat,showSwitch:showSwitch,ssw:ssw}}/>}

        {tab==="admin"&&<AdminTab {...{ev:ev,inv:inv,si:si,sales:sales,ssl:ssl,leads:leads,sld:sld,cur:cur,scur:scur,user:user,pr:pr,users:users,onUsersChange:onUsersChange,syncUp:syncUp,doSell:doSell,sinvm:sinvm,sdet:sdet,fc:fc,st:st,onLogout:onLogout,onUpdateEvent:onUpdateEvent,allEvents:allEvents,onSwitch:onSwitch,jc:jc,sjc:sjc,det:det,scan:scan,sscan:sscan,mlTab:mlTab,smlTab:smlTab,mlInput:mlInput,smlInput:smlInput,mlItems:mlItems,smlItems:smlItems,mlDisc:mlDisc,smlDisc:smlDisc,mlDiscAmt:mlDiscAmt,smlDiscAmt:smlDiscAmt,mlMarkup:mlMarkup,smlMarkup:smlMarkup,mlNF:mlNF,smlNF:smlNF,mlScan:mlScan,smlScan:smlScan,mlSubtotal:mlSubtotal,mlFinal:mlFinal,mlTotal:mlTotal,resolveCodes:resolveCodes,sellMulti:sellMulti,showFilter:showFilter,sShowFilter:sShowFilter,activeFilters:activeFilters,resetFilters:resetFilters,fCat:fCat,sfCat:sfCat,fCol:fCol,sfCol:sfCol,fMetal:fMetal,sfMetal:sfMetal,fSt:fSt,sfSt:sfSt,fShape:fShape,sfShape:sfShape,fMinTc:fMinTc,sfMinTc:sfMinTc,fMaxTc:fMaxTc,sfMaxTc:sfMaxTc,fMinGw:fMinGw,sfMinGw:sfMinGw,fMaxGw:fMaxGw,sfMaxGw:sfMaxGw,fMinNw:fMinNw,sfMinNw:sfMinNw,fMaxNw:fMaxNw,sfMaxNw:sfMaxNw,fMinFp:fMinFp,sfMinFp:sfMinFp,fMaxFp:fMaxFp,sfMaxFp:sfMaxFp,allCats:allCats,allCols:allCols,allMetals:allMetals,allShapes:allShapes,allSt:allSt,lkQ:lkQ,lkResults:lkResults,lkShowResults:lkShowResults,applyFilters:applyFilters,invTab:invTab,sivTab:sivTab,isq:isq,sisq:sisq,ist:ist,sist:sist,icat:icat,sicat:sicat,fi:fi,cats:cats,deadStock:deadStock,auditLoc:auditLoc,saLoc:saLoc,auditScanned:auditScanned,saScanned:saScanned,audits:audits,sAudits:sAudits,locItems:locItems,missing:missing,saveAudit:saveAudit,totalRev:totalRev,stf:stf,hstaff:hstaff,shs:shs,atab:atab,sat:sat,showSwitch:showSwitch,ssw:ssw}}/>}

        {scan&&<QRScanner onScanned={code=>{sscan(false);const f=inv.find(i=>i.id===code);if(f)sdet(f);else toast.warn("Item not found","Code: "+code);}} onClose={()=>sscan(false)}/>}
        {invm&&<InvoiceSheet sale={invm} onClose={()=>sinvm(null)}/>}
        {showSwitch&&(
          <Sheet onClose={()=>sshowSwitch(false)} title="Switch Event">
            <div style={{fontSize:11,color:T3,marginBottom:14}}>Select an event to switch. Your data is saved automatically.</div>
            {allEvents.map(e=>(
              <div key={e.id} onClick={()=>{onSwitch(e);sshowSwitch(false);}} style={{...S.card({margin:0,marginBottom:10,cursor:"pointer",border:e.id===ev.id?"2px solid "+G:"1px solid "+CRD2})}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div><div style={{fontWeight:700,fontSize:13,color:T1}}>{e.name}</div><div style={{fontSize:10,color:T3,marginTop:2}}>{e.loc} · {e.start}</div></div>
                  <div style={{display:"flex",gap:6,alignItems:"center"}}><Bdg t={e.status==="active"?"gr":"m"} ch={e.status}/>{e.id===ev.id&&<Bdg t="g" ch="Current"/>}</div>
                </div>
                <div style={{display:"flex",gap:12,marginTop:7,fontSize:10,color:T3}}>
                  <span>📦 {e.inv.length} items</span><span>💰 {e.sales.length} sales</span><span>🎯 {e.leads.length} leads</span>
                </div>
              </div>
            ))}
          </Sheet>
        )}
      </div>
    </div>
  );
}

export default function App(){
  const [user,su]=useState(null);
  const [events,sevents]=useState(DEMO_EVENTS);
  const dark=useDark();
  useEffect(()=>{
    const style=document.createElement("style");
    style.innerHTML="@keyframes toastIn{from{transform:translateY(-80px);opacity:0}to{transform:translateY(0);opacity:1}}@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes popIn{from{transform:scale(0)}to{transform:scale(1)}}";
    document.head.appendChild(style);
    return()=>{if(style.parentNode)style.parentNode.removeChild(style);};
  },[]);
  const [appUsers,sappUsers]=useState(USERS);
  const [activeEv,sae]=useState(null);
  const [manageEv,smev]=useState(null);
  const upEv=ev=>sevents(p=>ev?p.map(e=>e.id===ev.id?ev:e):p);
  const delEv=id=>sevents(p=>p.filter(e=>e.id!==id));
  const logout=()=>{su(null);sae(null);};
  useEffect(()=>{
    if(!window.XLSX){
      const s=document.createElement("script");
      s.src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";s.onerror=function(){console.log("XLSX CDN blocked");};
      document.head.appendChild(s);
    }
  },[]);

  // Patch images into events once VJ_IMG is available
  useEffect(()=>{
    const patch=()=>{
      if(!window.VJ_IMG)return;
      sevents(prev=>prev.map(ev=>({
        ...ev,
        inv:ev.inv.map(item=>item.img?item:{...item,img:window.VJ_IMG[item.id]||""})
      })));
    };
    // Try immediately and after short delay (script may still be loading)
    patch();
    const t1=setTimeout(patch,1000);
    const t2=setTimeout(patch,3000);
    return()=>{clearTimeout(t1);clearTimeout(t2);};
  },[]);
  if(!user) return <Login onLogin={su}/>;
  if(activeEv){
    return <EventERP
      ev={events.find(e=>e.id===activeEv.id)||activeEv}
      user={user} allUsers={appUsers} onUsersChange={sappUsers}
      allEvents={events}
      onSwitch={ev=>{upEv(ev);sae(ev);}}
      onUpdateEvent={ev=>{upEv(ev);sae(ev);}}
      onBack={()=>sae(null)}
      onLogout={logout}
    />;
  }
  return(
    <div style={{height:"100%",height:"100dvh",background:dark?"#0f0f0f":"#163D2E"}}>
      <ToastContainer/>
      <EventHub user={user} events={events} onEnter={ev=>sae(ev)} onCreate={ev=>sevents(p=>[ev,...p])} onManage={ev=>smev(ev)} onDelete={delEv} onLogout={logout}/>
      {manageEv&&<ManageEvent ev={events.find(e=>e.id===manageEv.id)||manageEv} onClose={()=>smev(null)} onUpdate={ev=>{upEv(ev);smev(ev);}} onDelete={id=>{delEv(id);smev(null);}}/>}
    </div>
  );
}
