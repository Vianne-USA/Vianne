import{useState,useRef,useEffect}from"react";
const getImg=(item)=>item.img||( window.VJ_IMG&&window.VJ_IMG[item.id])||"";
const G="#1E5C45",GD="#163D2E",GO="#C9A84C",CR="#F5EDE0",WH="#FFFFFF",CRD="#F5EDE0",CRD2="#E8DCCB",INP="#FBF5E8";
const T1="#1E5C45",T2="#3D5C4A",T3="#7A8C7E",T4="#B0A88A",RE="#A03030",REBG="#F9ECEC",AM="#C8963A",AMBG="#FDF5E6";
const DEFAULT_CURR={USD:{s:"$",r:1,name:"US Dollar"},INR:{s:"₹",r:83.5,name:"Indian Rupee"},AED:{s:"AED ",r:3.67,name:"UAE Dirham"},GBP:{s:"£",r:0.79,name:"British Pound"},EUR:{s:"€",r:0.92,name:"Euro"},SGD:{s:"S$",r:1.35,name:"Singapore Dollar"},HKD:{s:"HK$",r:7.82,name:"Hong Kong Dollar"},JPY:{s:"¥",r:149.5,name:"Japanese Yen"},CAD:{s:"CA$",r:1.36,name:"Canadian Dollar"},AUD:{s:"A$",r:1.52,name:"Australian Dollar"}};
let _sc=null;try{_sc=JSON.parse(localStorage.getItem("vj_curr_rates")||"null");}catch(e){}
const CURR=_sc||Object.assign({},DEFAULT_CURR);
const fc=(n,c)=>{const x=CURR[c]||CURR.USD;return x.s+Number((n||0)*x.r).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2});};
const f$=n=>"$"+Number(n||0).toFixed(2);
const uid=p=>(p||"X")+Date.now().toString(36).slice(-4).toUpperCase();
const dstr=()=>new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});
const tstr=()=>new Date().toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"});
const USERS=[{id:1,name:"Nilay",un:"nilay",pw:"nilay123",role:"Admin"},{id:2,name:"Jimit",un:"jimit",pw:"jimit123",role:"Manager"},{id:3,name:"Ruchit",un:"ruchit",pw:"ruchit123",role:"Admin"},{id:4,name:"Naresh",un:"naresh",pw:"naresh123",role:"Staff"},{id:5,name:"Naman",un:"naman",pw:"naman123",role:"Admin"},{id:6,name:"Nihar",un:"nihar",pw:"nihar123",role:"Staff"},{id:7,name:"Dhruvit",un:"dhruvit",pw:"dhruvit123",role:"Staff"}];
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
  const doBio=()=>{try{const ch=new Uint8Array(32);window.crypto.getRandomValues(ch);navigator.credentials.get({publicKey:{challenge:ch,timeout:60000,userVerification:"required",rpId:window.location.hostname||"localhost"}}).then(function(cr){if(cr)onLogin(USERS[0]);}).catch(function(err){if(err.name!=="NotAllowedError")alert("Biometric: "+err.message);});}catch(err){alert("Biometric: "+err.message);}};
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
function EventHub({user,events,onEnter,onCreate,onManage,onLogout}){
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
function ManageEvent({ev,onClose,onUpdate}){
  const [tab,st]=useState("details"),[xlf,sxl]=useState(null),[mode,sm]=useState("add"),[msg,smsg]=useState("");
  const upload=()=>{if(!xlf){smsg("Select a file first.");return;}smsg("Parsing…");parseXL(xlf,items=>{const inv=mode==="replace"?items:[...ev.inv,...items.filter(ni=>!ev.inv.find(ei=>ei.id===ni.id))];onUpdate({...ev,inv});smsg("✓ "+(mode==="replace"?"Replaced with":"Added")+" "+items.length+" items. Total: "+inv.length);sxl(null);},err=>smsg("Error: "+err));};
  return(<Sheet onClose={onClose} title={ev.name}>
    <div style={{display:"flex",gap:6,marginBottom:13,overflowX:"auto",scrollbarWidth:"none"}}>{["details","inventory","upload"].map(t=><button key={t} style={S.pill(tab===t,{textTransform:"capitalize"})} onClick={()=>st(t)}>{t}</button>)}</div>
    {tab==="details"&&<div>{[{l:"Location",v:ev.loc||"—"},{l:"Dates",v:(ev.start||"")+" → "+(ev.end||"")},{l:"Status",v:ev.status},{l:"Items",v:ev.inv.length},{l:"Sales",v:ev.sales.length}].map(r=><div key={r.l} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid "+CRD2}}><span style={{fontSize:12,color:T3}}>{r.l}</span><span style={{fontSize:12,fontWeight:600,color:T1}}>{r.v}</span></div>)}<div style={{display:"flex",gap:8,marginTop:11}}><button style={S.btn({flex:1,padding:"10px",fontSize:12})} onClick={()=>onUpdate({...ev,status:"active"})}>Set Active</button><button style={S.bOut({flex:1,padding:"10px",fontSize:12})} onClick={()=>onUpdate({...ev,status:"completed"})}>Complete</button></div></div>}
    {tab==="inventory"&&<div><div style={{fontSize:12,color:T2,marginBottom:9}}>{ev.inv.length} items</div><div style={{maxHeight:300,overflowY:"auto",borderRadius:10,border:"1px solid "+CRD2,overflow:"hidden"}}>{ev.inv.slice(0,30).map((item,i,arr)=><div key={item.id} style={{display:"flex",alignItems:"center",gap:9,padding:"8px 12px",borderBottom:i<arr.length-1?"1px solid "+CRD2:"none",background:WH}}><span style={{fontSize:18}}>{item.em}</span><div style={{flex:1}}><div style={{fontSize:12,fontWeight:700,color:T1}}>{item.id}</div><div style={{fontSize:9.5,color:T3}}>{item.cat} · {item.col}</div></div><div style={{fontFamily:"Cormorant Garamond,serif",fontSize:12,fontWeight:700,color:G}}>{f$(item.fp)}</div></div>)}</div></div>}
    {tab==="upload"&&<div>
      <div style={S.sh}>Update Inventory from Excel</div>
      <div style={{display:"flex",gap:8,marginBottom:11}}>{[{id:"add",l:"Add new"},{id:"replace",l:"Replace all"}].map(m=><button key={m.id} onClick={()=>sm(m.id)} style={{flex:1,padding:"10px",borderRadius:9,border:"1.5px solid "+(mode===m.id?G:CRD2),background:mode===m.id?G:"transparent",color:mode===m.id?CR:T2,fontFamily:"Lato,sans-serif",fontSize:12,fontWeight:600,cursor:"pointer"}}>{m.l}</button>)}</div>
      {mode==="replace"&&<div style={{background:REBG,border:"1px solid "+RE,borderRadius:8,padding:"8px 12px",fontSize:11,color:RE,marginBottom:11}}>⚠ Deletes all current inventory.</div>}
      <div onClick={()=>document.getElementById("xlU").click()} style={{background:INP,border:"1.5px dashed "+CRD2,borderRadius:9,padding:"14px",textAlign:"center",cursor:"pointer",marginBottom:11}}>
        <div style={{fontSize:22,marginBottom:5}}>📊</div><div style={{fontSize:12,color:T2,fontWeight:600}}>{xlf?xlf.name:"Tap to select Excel file"}</div>
        <input id="xlU" type="file" accept=".xlsx,.xls,.csv" style={{display:"none"}} onChange={ev=>{if(ev.target.files[0]){sxl(ev.target.files[0]);smsg("");}}}/>
      </div>
      {msg&&<div style={{background:msg.startsWith("✓")?"#edf7f0":REBG,border:"1px solid "+(msg.startsWith("✓")?"rgba(39,174,96,0.3)":RE),borderRadius:8,padding:"8px 12px",fontSize:12,color:msg.startsWith("✓")?"#27ae60":RE,marginBottom:11}}>{msg}</div>}
      <button style={S.btn()} disabled={!xlf} onClick={upload}>Upload &amp; {mode==="replace"?"Replace":"Add"}</button>
    </div>}
  </Sheet>);
}
function ItemCard({item,user,inv,cur,onSell,onBack}){
  const pr=gp(user.role);
  const [mode,sm]=useState(null),[f,sf]=useState({cu:"",ph:"",pm:"NEFT",gt:"",disc:0,remark:"",cc_type:"pct",cc_val:""});
  const set=(k,v)=>sf(p=>({...p,[k]:v}));
  const dp=item.fp,dsc=Math.round(dp*f.disc/100*100)/100,subtotal=Math.round((dp-dsc)*100)/100;
  const tax=subtotal,cgst=0,sgst=0;
  const ccAmt=f.cc_type==="pct"?Math.round(subtotal*(parseFloat(f.cc_val)||0)/100*100)/100:Math.round((parseFloat(f.cc_val)||0)*100)/100;
  const tot=Math.round((subtotal+ccAmt)*100)/100;
  const margin=Math.round(((tax-item.cpt)/Math.max(tax,1))*100);
  const doSell=()=>{onSell({id:uid("INV"),custName:f.cu,phone:f.ph,itemId:item.id,itemName:item.cat+" · "+item.col+" · "+item.metal,metal:item.metal,col:item.col,sz:item.sz,gw:item.gw,nw:item.nw,tc:item.tc,sp:item.sp,style:item.style,price:subtotal,disc:f.disc,cgst:0,sgst:0,ccType:f.cc_type,ccVal:f.cc_val,ccAmt:ccAmt,total:tot,currency:cur||"USD",margin,date:dstr(),time:tstr(),payment:f.pm,staff:user.name,st:mode==="d"?"pending":"completed",gt:mode==="d"?(f.gt||"GT"+Date.now().toString().slice(-6)):"",remark:f.remark});};
  const similar=inv.filter(i=>i.id!==item.id&&(i.col===item.col||i.cat===item.cat)&&i.st==="available").slice(0,3);
  if(mode) return(
    <div style={{background:CRD,minHeight:"100%",padding:"10px 12px 40px"}}>
      <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:13}}>
        <button onClick={onBack} style={{background:"none",border:"none",color:T3,cursor:"pointer",fontSize:12}}>← Lookup</button>
        <span style={{color:T3}}>/</span>
        <button onClick={()=>sm(null)} style={{background:"none",border:"none",color:G,cursor:"pointer",fontSize:12,fontWeight:600}}>{item.id}</button>
        <span style={{color:T3}}>/ Sell</span>
      </div>
      <div style={{...S.card({margin:"0 0 10px",padding:"11px 13px"})}}>
        <span style={S.lbl}>CUSTOMER NAME (optional)</span>
        <input style={S.inp({marginBottom:6})} placeholder="Customer / company name" value={f.cu} onChange={ev=>set("cu",ev.target.value)}/>
        <span style={S.lbl}>PHONE</span>
        <input style={S.inp({marginBottom:0})} placeholder="Phone number" value={f.ph} onChange={ev=>set("ph",ev.target.value)}/>
      </div>
      <div style={{...S.cc({marginBottom:11,display:"flex",justifyContent:"space-between",alignItems:"center"})}}><div><div style={{fontWeight:700,fontSize:13,color:T1}}>{item.id}</div><div style={{fontSize:10,color:T3}}>{item.cat} · {item.col}</div></div><div style={{textAlign:"right"}}><div style={{fontFamily:"Cormorant Garamond,serif",fontSize:18,fontWeight:700,color:G}}>{fc(tax,cur)}</div>{f.disc>0&&<div style={{fontSize:9,color:AM}}>Disc {f.disc}%</div>}</div></div>
      <div style={{display:"flex",flexDirection:"column",gap:9,marginBottom:11}}>
        <div><span style={S.lbl}>PAYMENT</span><select style={S.inp()} value={f.pm} onChange={ev=>set("pm",ev.target.value)}>{["NEFT","RTGS","Cheque","Cash","UPI","Credit Card","Wire Transfer"].map(x=><option key={x}>{x}</option>)}</select></div>
        {pr.oP&&<div><span style={S.lbl}>DISCOUNT % (MAX 20)</span><input type="number" style={S.inp()} min="0" max="20" value={f.disc} onChange={ev=>set("disc",Math.min(20,Math.max(0,Number(ev.target.value))))}/></div>}
        {mode==="d"&&<div><span style={S.lbl}>GATI (BLANK=AUTO)</span><input style={S.inp()} placeholder={"GT"+Date.now().toString().slice(-6)} value={f.gt} onChange={ev=>set("gt",ev.target.value)}/></div>}
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
      <button style={S.btn()} onClick={doSell}>✓ Confirm Sale &amp; Invoice</button>
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
  const doPrint=()=>{const w=window.open("","_blank"),s=sale;w.document.write('<!DOCTYPE html><html><head><title>Invoice '+s.id+'</title><style>body{font-family:Arial,sans-serif;padding:28px;max-width:640px;margin:0 auto;color:#222}.hdr{display:flex;justify-content:space-between;border-bottom:3px solid #1E5C45;padding-bottom:12px;margin-bottom:12px}h1{color:#1E5C45;font-family:Georgia,serif;font-size:20px;margin:0}.bi{font-size:9px;color:#888;line-height:1.5;margin-top:3px}.mr{text-align:right;font-size:10px;color:#555;line-height:1.6}.bt{background:#F5EDE0;padding:9px 11px;border-radius:6px;margin-bottom:11px}.ibox{border:1px solid #E8DCCB;padding:9px;border-radius:6px;margin-bottom:9px}.tr{display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #E8DCCB;font-size:11px}.grand{font-size:14px;font-weight:700;color:#1E5C45;border-top:2px solid #1E5C45;border-bottom:none;padding-top:7px;margin-top:3px}.note{padding:8px 10px;border-radius:5px;margin-top:7px}.footer{margin-top:14px;padding-top:9px;border-top:1px solid #E8DCCB;display:flex;justify-content:space-between}@media print{body{padding:14px}}</style></head><body>');w.document.write('<div class="hdr"><div><h1>Vianne Jewels</h1><div class="bi">GSTIN: 27XXXXX1234X1ZX | HSN: 7113<br/>viannejewels@gmail.com | www.viannejewels.com<br/>EW-8012, Bharat Diamond Bourse, BKC, Mumbai 400051</div></div><div class="mr"><strong style="font-size:14px;color:#1E5C45">TAX INVOICE</strong><br/>'+s.id+'<br/>'+s.date+' '+s.time+'<br/>'+s.staff+' | '+s.payment+'</div></div>');w.document.write('<div class="bt"><strong style="font-size:13px;color:#1E5C45">'+s.custName+'</strong>'+(s.phone?'<br/><span style="font-size:9px;color:#666">'+s.phone+'</span>':'')+'</div>');w.document.write('<div class="ibox"><strong style="color:#1E5C45;font-size:11px">'+s.itemId+'</strong><div style="font-size:9px;color:#7A8C7E;margin-top:2px">'+s.itemName+'<br/>Sz:'+s.sz+' Gw:'+s.gw+'g Nw:'+s.nw+'g '+s.tc+'ct</div><div style="display:flex;justify-content:space-between;margin-top:6px;padding-top:5px;border-top:1px dashed #E8DCCB;font-size:10px"><span style="color:#888">'+s.metal+' HSN:7113 Qty:1</span><strong>'+f$(sub)+'</strong></div></div>');w.document.write('<div class="tr"><span>Subtotal</span><span>'+f$(sub)+'</span></div>');if(s.disc>0)w.document.write('<div class="tr" style="color:#C8963A"><span>Discount('+s.disc+'%)</span><span>-'+f$(dsc)+'</span></div>');s.ccAmt>0&&w.document.write('<div class="tr"><span>CC Surcharge'+(s.ccType==="pct"?" ("+s.ccVal+"%)":"")+"</span><span>"+f$(s.ccAmt)+"</span></div>");w.document.write('<div class="tr grand"><span>GRAND TOTAL</span><span>'+f$(tot)+'</span></div>');if(s.gt)w.document.write('<div class="note" style="background:#edf7f0"><div style="font-size:8px;color:#888;text-transform:uppercase">GATI</div><strong style="color:#1E5C45">'+s.gt+'</strong></div>');if(s.remark)w.document.write('<div class="note" style="background:#FDF5E6"><div style="font-size:8px;color:#C8963A;font-weight:700;text-transform:uppercase">Remarks</div><div style="font-size:10px;margin-top:2px">'+s.remark+'</div></div>');w.document.write('<div class="footer"><div style="font-size:8px;color:#888"><strong style="color:#C9A84C">VIANNE JEWELS</strong><br/>Disputes subject to Mumbai jurisdiction.</div><div style="text-align:right"><div style="width:80px;border-bottom:1px solid #ccc;height:20px;margin-left:auto"></div><div style="font-size:7px;color:#aaa;margin-top:2px">Auth. Signatory</div></div></div></body></html>');w.document.close();setTimeout(()=>w.print(),400);};
  return(<Sheet onClose={onClose} title="Tax Invoice">
    <div style={{display:"flex",gap:8,marginBottom:13}}><button style={S.btn({flex:1,padding:"11px",fontSize:12,display:"flex",alignItems:"center",justifyContent:"center",gap:6})} onClick={doPrint}>🖨 Print Invoice</button><button style={S.bOut({padding:"11px 13px",fontSize:12})} onClick={()=>alert("Share via WhatsApp / Email")}>📤 Share</button></div>
    <div style={{background:WH,borderRadius:10,padding:13,border:"1px solid "+CRD2}}>
      <div style={{borderBottom:"3px solid "+G,paddingBottom:10,marginBottom:10,display:"flex",justifyContent:"space-between"}}><div><div style={{fontFamily:"Cormorant Garamond,serif",fontSize:16,fontWeight:700,color:G}}>Vianne Jewels</div><div style={{fontSize:8,color:"#888",marginTop:1}}>GSTIN: 27XXXXX1234X1ZX · HSN: 7113</div></div><div style={{textAlign:"right"}}><div style={{fontWeight:700,fontSize:10,color:G}}>TAX INVOICE</div><div style={{fontSize:10,color:"#555"}}>{sale.id}</div><div style={{fontSize:9,color:"#888"}}>{sale.date} · {sale.staff}</div></div></div>
      <div style={{background:"#F5EDE0",borderRadius:5,padding:"7px 9px",marginBottom:9}}><div style={{fontWeight:700,fontSize:12,color:G}}>{sale.custName}</div>{sale.phone&&<div style={{fontSize:9,color:"#666",marginTop:1}}>{sale.phone}</div>}<div style={{fontSize:9,color:"#888",marginTop:1}}>{sale.payment}</div></div>
      <div style={{border:"1px solid "+CRD2,borderRadius:6,padding:8,marginBottom:9}}><div style={{fontWeight:700,fontSize:11,color:G}}>{sale.itemId}</div><div style={{fontSize:9,color:"#555",marginTop:2,lineHeight:1.4}}>{sale.itemName}{sale.sz&&<span><br/>Sz:{sale.sz} · {sale.gw}g · {sale.tc}ct</span>}</div><div style={{display:"flex",justifyContent:"space-between",marginTop:6,paddingTop:5,borderTop:"1px dashed "+CRD2,fontSize:10}}><span style={{color:"#888"}}>{sale.metal} · Qty 1</span><span style={{fontWeight:700,color:G}}>{f$(sub)}</span></div></div>
      <div style={{background:CRD,borderRadius:6,padding:"8px 9px"}}>
        {[["Subtotal",f$(sub),false],sale.disc>0?["Disc ("+sale.disc+"%)","−"+f$(dsc),true]:null,sale.ccAmt>0?["💳 CC"+(sale.ccType==="pct"?" "+sale.ccVal+"%":""),f$(sale.ccAmt),false]:null].filter(Boolean).map(([l,v,d])=><div key={l} style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3,color:d?AM:"#666"}}><span>{l}</span><span>{v}</span></div>)}
        <div style={{height:2,background:G,borderRadius:1,margin:"5px 0"}}/>
        <div style={{display:"flex",justifyContent:"space-between",fontWeight:700,fontSize:14,color:G}}><span>GRAND TOTAL</span><span style={{fontFamily:"Cormorant Garamond,serif",fontSize:16}}>{f$(tot)}</span></div>
      </div>
      {sale.gt&&<div style={{background:"#edf7f0",borderRadius:5,padding:"7px 9px",marginTop:8}}><div style={{fontSize:8,color:"#888",textTransform:"uppercase"}}>GATI</div><div style={{fontWeight:700,fontSize:12,color:G,marginTop:1}}>{sale.gt}</div></div>}
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
    if(users.find(u=>u.un===form.un.trim().toLowerCase())){alert("Username already exists.");return;}
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
                  {!scan&&<button style={S.btn({marginBottom:10,display:"flex",alignItems:"center",justifyContent:"center",gap:8,fontSize:13})} onClick={()=>sscan(true)}>📷 Scan QR Code / Barcode</button>}
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
                    <ItemCard item={det} user={user} inv={inv} cur={cur} onSell={doSell} onBack={()=>sdet(null)}/>
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
                      <button style={S.btn({flex:2,padding:"12px",fontSize:13})} onClick={sellMulti}>💰 Convert to Sale</button>
                      <button style={S.bOut({flex:1,padding:"12px",fontSize:12})} onClick={()=>alert("Quote: "+mlItems.length+" items\nTotal: "+fc(mlTotal,cur)+"\nCodes: "+mlItems.map(i=>i.id).join(", "))}>📋 Quote</button>
                    </div>
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
  return(
    <div>
            {/* Single / Multi sub-tabs */}
            <div style={{background:G,display:"flex",borderBottom:"1px solid rgba(201,168,76,0.2)"}}>
              {[{id:"single",l:"🔍 SINGLE"},{id:"multi",l:"📋 MULTI LOOKUP"}].map(t=>(
                <button key={t.id} onClick={()=>smlTab(t.id)} style={{flex:1,background:"none",border:"none",borderBottom:mlTab===t.id?"2.5px solid "+GO:"2.5px solid transparent",color:mlTab===t.id?GO:"rgba(245,237,224,0.5)",fontFamily:"Lato,sans-serif",fontSize:11,fontWeight:mlTab===t.id?700:500,padding:"9px 7px",cursor:"pointer"}}>{t.l}</button>
              ))}
            </div>

            {/* SINGLE LOOKUP */}
            {mlTab==="single"&&<SingleLookup {...{ev:p.ev,inv:p.inv,si:p.si,cur:p.cur,user:p.user,pr:p.pr,fc:p.fc,st:p.st,doSell:p.doSell,sdet:p.sdet,sinvm:p.sinvm,jc:p.jc,sjc:p.sjc,det:p.det,scan:p.scan,sscan:p.sscan,mlTab:p.mlTab,smlTab:p.smlTab,mlInput:p.mlInput,smlInput:p.smlInput,mlItems:p.mlItems,smlItems:p.smlItems,mlDisc:p.mlDisc,smlDisc:p.smlDisc,mlDiscAmt:p.mlDiscAmt,smlDiscAmt:p.smlDiscAmt,mlMarkup:p.mlMarkup,smlMarkup:p.smlMarkup,mlNF:p.mlNF,smlNF:p.smlNF,mlScan:p.mlScan,smlScan:p.smlScan,mlSubtotal:p.mlSubtotal,mlFinal:p.mlFinal,mlTotal:p.mlTotal,resolveCodes:p.resolveCodes,sellMulti:p.sellMulti,showFilter:p.showFilter,sShowFilter:p.sShowFilter,activeFilters:p.activeFilters,resetFilters:p.resetFilters,fCat:p.fCat,sfCat:p.sfCat,fCol:p.fCol,sfCol:p.sfCol,fMetal:p.fMetal,sfMetal:p.sfMetal,fSt:p.fSt,sfSt:p.sfSt,fShape:p.fShape,sfShape:p.sfShape,fMinTc:p.fMinTc,sfMinTc:p.sfMinTc,fMaxTc:p.fMaxTc,sfMaxTc:p.sfMaxTc,fMinGw:p.fMinGw,sfMinGw:p.sfMinGw,fMaxGw:p.fMaxGw,sfMaxGw:p.sfMaxGw,fMinNw:p.fMinNw,sfMinNw:p.sfMinNw,fMaxNw:p.fMaxNw,sfMaxNw:p.sfMaxNw,fMinFp:p.fMinFp,sfMinFp:p.sfMinFp,fMaxFp:p.fMaxFp,sfMaxFp:p.sfMaxFp,allCats:p.allCats,allCols:p.allCols,allMetals:p.allMetals,allShapes:p.allShapes,allSt:p.allSt,lkQ:p.lkQ,lkResults:p.lkResults,lkShowResults:p.lkShowResults}}/>}


            {/* MULTI LOOKUP */}
            {mlTab==="multi"&&<MultiLookup {...{ev:p.ev,inv:p.inv,si:p.si,cur:p.cur,user:p.user,pr:p.pr,fc:p.fc,st:p.st,doSell:p.doSell,sdet:p.sdet,sinvm:p.sinvm,jc:p.jc,sjc:p.sjc,det:p.det,scan:p.scan,sscan:p.sscan,mlTab:p.mlTab,smlTab:p.smlTab,mlInput:p.mlInput,smlInput:p.smlInput,mlItems:p.mlItems,smlItems:p.smlItems,mlDisc:p.mlDisc,smlDisc:p.smlDisc,mlDiscAmt:p.mlDiscAmt,smlDiscAmt:p.smlDiscAmt,mlMarkup:p.mlMarkup,smlMarkup:p.smlMarkup,mlNF:p.mlNF,smlNF:p.smlNF,mlScan:p.mlScan,smlScan:p.smlScan,mlSubtotal:p.mlSubtotal,mlFinal:p.mlFinal,mlTotal:p.mlTotal,resolveCodes:p.resolveCodes,sellMulti:p.sellMulti,showFilter:p.showFilter,sShowFilter:p.sShowFilter,activeFilters:p.activeFilters,resetFilters:p.resetFilters,fCat:p.fCat,sfCat:p.sfCat,fCol:p.fCol,sfCol:p.sfCol,fMetal:p.fMetal,sfMetal:p.sfMetal,fSt:p.fSt,sfSt:p.sfSt,fShape:p.fShape,sfShape:p.sfShape,fMinTc:p.fMinTc,sfMinTc:p.sfMinTc,fMaxTc:p.fMaxTc,sfMaxTc:p.sfMaxTc,fMinGw:p.fMinGw,sfMinGw:p.sfMinGw,fMaxGw:p.fMaxGw,sfMaxGw:p.sfMaxGw,fMinNw:p.fMinNw,sfMinNw:p.sfMinNw,fMaxNw:p.fMaxNw,sfMaxNw:p.sfMaxNw,fMinFp:p.fMinFp,sfMinFp:p.sfMinFp,fMaxFp:p.fMaxFp,sfMaxFp:p.sfMaxFp,allCats:p.allCats,allCols:p.allCols,allMetals:p.allMetals,allShapes:p.allShapes,allSt:p.allSt,lkQ:p.lkQ,lkResults:p.lkResults,lkShowResults:p.lkShowResults}}/>}
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
              <select style={S.inp({marginBottom:10})} value={auditLoc} onChange={ev=>saLoc(ev.target.value)}>
                {["Exhibition","Office","Storage","Vault","All"].map(l=><option key={l}>{l}</option>)}
              </select>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>
                {[{l:"Expected",v:locItems.length,c:G},{l:"Scanned",v:auditScanned.length,c:"#27ae60"},{l:"Missing",v:missing.length,c:missing.length>0?RE:T3}].map(x=>(
                  <div key={x.l} style={{background:CRD,borderRadius:9,padding:"10px 8px",textAlign:"center"}}><div style={{fontFamily:"Cormorant Garamond,serif",fontSize:22,fontWeight:700,color:x.c,lineHeight:1}}>{x.v}</div><div style={{fontSize:9,color:T3,marginTop:2,textTransform:"uppercase"}}>{x.l}</div></div>
                ))}
              </div>
              <div style={{display:"flex",gap:7,marginBottom:12}}>
                <button style={S.btn({flex:1,padding:"10px",fontSize:12})} onClick={()=>sscan(x=>!x)}>{scan?"⬛ Stop Scanning":"📷 Scan Item"}</button>
                <button style={S.bOut({flex:1,padding:"10px",fontSize:12})} onClick={()=>{saScanned([]);}}>↺ Clear</button>
                <button style={S.btn({flex:1,padding:"10px",fontSize:12,background:GO,color:G})} onClick={saveAudit}>💾 Save Audit</button>
              </div>
            </div>
            {scan&&<QRScanner inv={inv} onScanned={(code,item)=>{sscan(false);if(item&&!auditScanned.find(s=>s.item&&s.item.id===item.id)){saScanned(p=>[...p,{item,scannedAt:tstr()}]);}else if(!item){alert("Item "+code+" not found in inventory.");}}}/>}
            {missing.length>0&&<div style={{marginBottom:10}}><div style={{fontSize:10,fontWeight:700,color:RE,textTransform:"uppercase",marginBottom:7}}>⚠ NOT SCANNED ({missing.length})</div>{missing.map(i=><div key={i.id} style={{display:"flex",alignItems:"center",gap:9,padding:"8px 10px",background:REBG,borderRadius:8,marginBottom:5}}><div style={{width:32,height:32,borderRadius:6,overflow:"hidden",flexShrink:0,background:CRD,display:"flex",alignItems:"center",justifyContent:"center"}}>{getImg(i)?<img src={getImg(i)} alt="" style={{width:32,height:32,objectFit:"cover"}}/>:<span style={{fontSize:16}}>{i.em}</span>}</div><div><div style={{fontSize:11,fontWeight:700,color:RE}}>{i.id}</div><div style={{fontSize:9,color:RE}}>{i.cat}</div></div></div>)}</div>}
            {auditScanned.length>0&&<div style={{marginBottom:10}}><div style={{fontSize:10,fontWeight:700,color:"#27ae60",textTransform:"uppercase",marginBottom:7}}>✓ CONFIRMED ({auditScanned.length})</div>{auditScanned.map(({item,scannedAt})=><div key={item.id} style={{display:"flex",alignItems:"center",gap:9,padding:"8px 10px",background:"#edf7f0",borderRadius:8,marginBottom:5}}><div style={{width:32,height:32,borderRadius:6,overflow:"hidden",flexShrink:0,background:CRD,display:"flex",alignItems:"center",justifyContent:"center"}}>{getImg(item)?<img src={getImg(item)} alt="" style={{width:32,height:32,objectFit:"cover"}}/>:<span style={{fontSize:16}}>{item.em}</span>}</div><div style={{flex:1}}><div style={{fontSize:11,fontWeight:700,color:T1}}>{item.id}</div><div style={{fontSize:9,color:T3}}>{scannedAt}</div></div><span style={{color:"#27ae60",fontWeight:700}}>✓</span></div>)}</div>}
            {audits.length>0&&<div><div style={{...S.sh,marginTop:4}}>📋 AUDIT HISTORY</div>{audits.map(r=><div key={r.id} style={{...S.cc({marginBottom:9})}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}><div><div style={{fontWeight:700,fontSize:12,color:T1}}>{r.loc}</div><div style={{fontSize:10,color:T3}}>{r.date} {r.time}</div></div><div style={{textAlign:"right"}}><div style={{fontWeight:700,color:r.missing.length>0?RE:"#27ae60",fontSize:13}}>{r.scanned}/{r.expected}</div><div style={{fontSize:9,color:T3}}>scanned/expected</div></div></div>{r.missing.length>0?<div style={{fontSize:10,color:RE}}>Missing: {r.missing.join(", ")}</div>:<div style={{fontSize:10,color:"#27ae60",fontWeight:600}}>✓ All confirmed</div>}</div>)}</div>}
          </div>}
        </div>
  );
}

function AnalyticsTab(p){

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
  var totalRev=p.totalRev;
  var stf=p.stf;
  var atab=p.atab;
  var sat=p.sat;
  var cats=p.cats;
  var fi=p.fi;
  var deadStock=p.deadStock;
  return(
    <div style={{paddingBottom:40}}>
            <div style={{background:CRD,borderBottom:"1px solid "+CRD2,display:"flex",overflowX:"auto",scrollbarWidth:"none",padding:"0 12px"}}>
              {[{id:"overview",l:"Overview"},{id:"products",l:"Products"},{id:"sales_t",l:"Sales"},{id:"staff",l:"Staff"}].map(t=>(
                <button key={t.id} onClick={()=>sat(t.id)} style={{flexShrink:0,background:"none",border:"none",borderBottom:"2.5px solid "+(atab===t.id?G:"transparent"),color:atab===t.id?G:T3,fontFamily:"Lato,sans-serif",fontSize:12,fontWeight:atab===t.id?700:400,padding:"10px 13px",cursor:"pointer",whiteSpace:"nowrap"}}>{t.l}</button>
              ))}
            </div>
            <div style={{padding:"13px 12px 0"}}>
              <div style={{...S.cc({marginBottom:11,display:"flex",alignItems:"center",gap:8})}}>
                <div style={{width:10,height:10,borderRadius:"50%",background:ev.color||G,flexShrink:0}}/><div style={{flex:1}}><div style={{fontWeight:700,fontSize:12,color:G}}>{ev.name}</div><div style={{fontSize:10,color:T3}}>{ev.loc} · {ev.start} → {ev.end}</div></div><Bdg t={ev.status==="active"?"gr":"m"} ch={ev.status}/>
              </div>
              {atab==="overview"&&(<>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:11}}>
                  {[...(pr.vA?[{l:"Revenue",v:fc(totalRev,cur),c:GO}]:[]),{l:"Avg Price",v:fc(inv.length?Math.round(inv.reduce((s,i)=>s+i.fp,0)/inv.length):0,cur),c:G},{l:"Available",v:inv.filter(i=>i.st==="available").length,c:"#27ae60"},{l:"Sales",v:sales.length,c:AM}].map(x=>(
                    <div key={x.l} style={{background:WH,borderRadius:9,padding:"11px 9px",textAlign:"center",boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}><div style={{fontFamily:"Cormorant Garamond,serif",fontSize:18,fontWeight:700,color:x.c,lineHeight:1}}>{x.v}</div><div style={{fontSize:9,color:T3,marginTop:2,textTransform:"uppercase"}}>{x.l}</div></div>
                  ))}
                </div>
                <div style={S.sh}>💰 MULTI-CURRENCY</div>
                {Object.entries(CURR).map(([k,v])=>(<div key={k} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid "+CRD2,fontSize:12}}><span style={{color:T2,fontWeight:600}}>{k}</span><span style={{fontFamily:"Cormorant Garamond,serif",fontWeight:700,color:G}}>{v.s}{(totalRev*v.r).toLocaleString("en-US",{maximumFractionDigits:0})}</span></div>))}
              </>)}
              {atab==="products"&&(<>
                <div style={S.sh}>🏆 TOP SEARCHED</div>
                {[...inv].sort((a,b)=>b.searches-a.searches).slice(0,8).map((item,i)=>(
                  <div key={item.id} onClick={()=>{sdet(item);st("lookup");}} style={{display:"flex",alignItems:"center",gap:9,padding:"8px 0",borderBottom:"1px solid "+CRD2,cursor:"pointer"}}>
                    <div style={{width:18,height:18,background:G,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:700,color:CR,flexShrink:0}}>{i+1}</div>
                    <div style={{width:32,height:32,borderRadius:6,overflow:"hidden",flexShrink:0}}>{getImg(item)?<img src={getImg(item)} alt="" style={{width:32,height:32,objectFit:"cover"}}/>:<span style={{fontSize:18}}>{item.em}</span>}</div>
                    <div style={{flex:1}}><div style={{fontSize:11,fontWeight:700,color:T1}}>{item.id}</div></div>
                    <div style={{fontSize:10,fontWeight:700,color:G}}>{item.searches}x</div>
                  </div>
                ))}
              </>)}
              {atab==="sales_t"&&(<>
                <div style={S.sh}>📊 CONVERSION</div>
                {[{l:"Total Views",v:inv.reduce((s,i)=>s+i.views,0),p:100},{l:"Looked Up",v:Math.max(sales.length*8,5),p:65},{l:"Sold",v:sales.length,p:sales.length&&inv.length?Math.round(sales.length/inv.length*100):0}].map(r=>(
                  <div key={r.l} style={{marginBottom:10}}><div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:3}}><span style={{color:T2,fontWeight:600}}>{r.l}</span><span style={{color:G,fontWeight:700}}>{r.v} ({r.p}%)</span></div><div style={{height:6,background:CRD2,borderRadius:4}}><div style={{height:"100%",background:G,borderRadius:4,width:Math.min(r.p,100)+"%"}}/></div></div>
                ))}
              </>)}
              {atab==="staff"&&(<>
                <div style={S.sh}>👤 STAFF PERFORMANCE</div>
                {users.filter(u=>u.role!=="Staff").map(u=>{const uS=sales.filter(s=>s.staff===u.name);const uR=uS.reduce((s,x)=>s+x.total,0);return(
                  <div key={u.id} style={{...S.cc({marginBottom:9,display:"flex",alignItems:"center",gap:10})}}>
                    <div style={{width:28,height:28,background:G,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:11,color:CR,flexShrink:0}}>{u.name[0]}</div>
                    <div style={{flex:1}}><div style={{fontWeight:700,fontSize:13,color:T1}}>{u.name}</div><Bdg t={u.role==="Admin"?"r":"a"} ch={u.role} sm/></div>
                    <div style={{textAlign:"right"}}><div style={{fontFamily:"Cormorant Garamond,serif",fontSize:13,fontWeight:700,color:G}}>{fc(uR,cur)}</div><div style={{fontSize:9,color:T3}}>{uS.length} sales</div></div>
                  </div>
                );})}
              </>)}
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
                        {s.gt&&<Bdg t="m" ch={"GATI: "+s.gt} sm/>}
                        {s.disc>0&&<span style={{fontSize:9,color:AM}}>Disc {s.disc}%</span>}
                      </div>
                      {s.remark&&<div style={{fontSize:10,color:AM,marginTop:2}}>💬 {s.remark}</div>}
                    </div>
                  </div>
                  <div style={{display:"flex",gap:6}}>
                    <button style={S.btn({flex:1,padding:"8px",fontSize:11})} onClick={()=>sinvm(s)}>🧾 Invoice</button>
                    {s.st!=="delivered"&&<button style={S.bOut({flex:1,padding:"8px",fontSize:11})} onClick={()=>ssl(p=>p.map(x=>x.id===s.id?{...x,st:"delivered"}:x))}>✓ Delivered</button>}
                    {!s.gt&&<button style={S.bOut({padding:"8px 10px",fontSize:11})} onClick={()=>{const g="GT"+Date.now().toString().slice(-6);ssl(p=>p.map(x=>x.id===s.id?{...x,gt:g}:x));alert("GATI: "+g);}}>📦</button>}
                    {pr.delSale&&<button style={{background:REBG,border:"1px solid rgba(160,48,48,0.2)",borderRadius:8,padding:"8px 10px",fontFamily:"Lato,sans-serif",fontSize:11,fontWeight:600,color:RE,cursor:"pointer"}} onClick={()=>{if(window.confirm("Delete this sale? Item will be restored to available.")){const ni2=inv.map(x=>x.id===s.itemId?{...x,st:"available"}:x);const ns2=sales.filter(x=>x.id!==s.id);si(ni2);ssl(ns2);syncUp(ni2,ns2,null,null);}}}>🗑</button>}
                  </div>
                </div>
              ))}
            </div>
          </div>
  );
}

function HistoryTab(p){

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
  var fh=p.fh;
  var hstaff=p.hstaff;
  var shs=p.shs;
  var stf=p.stf;
  return(
    <div style={{padding:"13px 12px 40px"}}>
            <div style={{background:WH,borderRadius:12,overflow:"hidden",border:"1px solid "+CRD2}}>
              {sales.length===0&&<div style={{textAlign:"center",padding:40}}>
                <div style={{fontSize:28,marginBottom:10}}>🕐</div>
                <div style={{color:T1,fontSize:14,fontWeight:600,marginBottom:6}}>No Sales History Yet</div>
                <div style={{color:T3,fontSize:12,lineHeight:1.6}}>Sales you complete via Lookup → SOLD DELIVERED will appear here with invoice details.</div>
              </div>}
              {[...sales].reverse().map((s,i,arr)=>(
                <div key={s.id} onClick={()=>sinvm(s)} style={{display:"flex",gap:11,padding:"11px 13px",borderBottom:i<arr.length-1?"1px solid "+CRD2:"none",cursor:"pointer",alignItems:"center"}}>
                  <div style={{width:44,height:44,borderRadius:8,overflow:"hidden",flexShrink:0,background:CRD,display:"flex",alignItems:"center",justifyContent:"center"}}>
                    {(it=>it&&getImg(it)?<img src={getImg(it)} alt="" style={{width:44,height:44,objectFit:"cover"}}/>:<span style={{fontSize:22}}>{it?it.em:"💎"}</span>)(inv.find(x=>x.id===s.itemId))}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",justifyContent:"space-between"}}><div style={{fontWeight:700,fontSize:12,color:T1}}>{s.itemId}</div><div style={{fontFamily:"Cormorant Garamond,serif",fontSize:14,fontWeight:700,color:G}}>{fc(s.total,cur)}</div></div>
                    <div style={{fontSize:10,color:T3,marginTop:1}}>{s.custName} · {s.staff}</div>
                    <div style={{display:"flex",gap:5,alignItems:"center",marginTop:3}}>
                      <Bdg t={s.st==="delivered"?"gr":s.st==="pending"?"a":"bl"} ch={s.st} sm/>
                      <span style={{fontSize:9,color:T4}}>{s.date} {s.time}</span>
                      {s.gt&&<Bdg t="m" ch={"GATI: "+s.gt} sm/>}
                    </div>
                    {s.remark&&<div style={{fontSize:10,color:AM,marginTop:2}}>💬 {s.remark}</div>}
                  </div>
                </div>
              ))}
            </div>
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
              <button key={s} onClick={()=>sld(p=>p.map(x=>x.id===cust.id?{...x,status:s}:x))} style={{flex:1,padding:"8px",borderRadius:8,border:"1.5px solid "+(cust.status===s?G:CRD2),background:cust.status===s?G:"transparent",color:cust.status===s?CR:T2,fontFamily:"Lato,sans-serif",fontSize:12,fontWeight:600,cursor:"pointer"}}>{s}</button>
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
  window._switchItem=(item)=>sdet(item);
  const mlSubtotal=mlItems.reduce((s,i)=>s+i.fp,0);
  const mlAdj=mlDisc?mlSubtotal*Number(mlDisc)/100:mlDiscAmt?Number(mlDiscAmt):mlMarkup?-(mlSubtotal*Number(mlMarkup)/100):0;
  const mlFinal=Math.max(0,Math.round((mlSubtotal-mlAdj)*100)/100);
  const mlTotal=Math.round(mlFinal*1.03*100)/100;
  const resolveCodes=()=>{const codes=mlInput.replace(/\n/g,",").split(",").map(function(s){return s.trim();}).map(s=>s.trim().toUpperCase()).filter(Boolean);const found=[],nf=[];codes.forEach(code=>{const item=inv.find(i=>i.id===code);if(item&&!found.find(f=>f.id===item.id))found.push(item);else if(!item)nf.push(code);});smlItems(found);smlNF(nf);smlDisc("");smlDiscAmt("");smlMarkup("");};
  const sellMulti=()=>{const cu=window.prompt("Customer name:");if(cu){const bId=uid("B");mlItems.forEach((item,i)=>{const ip=Math.round((item.fp*(mlFinal/Math.max(mlSubtotal,1)))*100)/100;doSell({id:i===0?bId:uid("INV"),custName:cu,phone:"",itemId:item.id,itemName:item.cat+" · "+item.col+" · "+item.metal,metal:item.metal,col:item.col,sz:item.sz,gw:item.gw,nw:item.nw,tc:item.tc,sp:item.sp,style:item.style,price:ip,disc:mlDisc?Number(mlDisc):0,cgst:0,sgst:0,total:ip,currency:cur,margin:25,date:dstr(),time:tstr(),payment:"NEFT",staff:user.name,st:"pending",gt:"",remark:i>0?"[Batch "+bId+"] ":""});});smlItems([]);smlInput("");st("sales");}};
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
  const locItems=inv.filter(i=>(auditLoc==="All"||i.loc===auditLoc)&&i.st!=="sold");
  const missing=locItems.filter(i=>!auditScanned.find(s=>s.item&&s.item.id===i.id));
  const TABS=[{id:"lookup",l:"LOOKUP",ic:"🔍"},...(pr.vH?[{id:"sales",l:"SALES",ic:"💰"},{id:"history",l:"HISTORY",ic:"🕐"}]:[]),...(pr.vA?[{id:"analytics",l:"ANALYTICS",ic:"📊"}]:[]),{id:"inventory",l:"STOCK",ic:"📦"},{id:"customers",l:"CUSTOMERS",ic:"👥"},{id:"admin",l:"SETTINGS",ic:"⚙"}];
  const addLead=()=>{const name=window.prompt("Customer / Lead name:");if(name&&name.trim()){sld(p=>[...p,{id:uid("LD"),name:name.trim(),contact:"",phone:"",notes:"",status:"Warm",source:"Walk-in",created:dstr()}]);}};
  const saveAudit=()=>{if(auditScanned.length===0){alert("Scan some items first.");}else{const rec={id:uid("AUD"),loc:auditLoc,date:dstr(),time:tstr(),expected:locItems.length,scanned:auditScanned.length,missing:missing.map(i=>i.id),items:auditScanned.map(s=>s.item&&s.item.id).filter(Boolean)};const na=[rec,...audits];sAudits(na);syncUp(null,null,null,na);alert("Audit saved: "+auditScanned.length+" scanned, "+missing.length+" missing.");}};
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

        {tab==="sales"&&<SalesTab {...{ev:ev,inv:inv,si:si,sales:sales,ssl:ssl,leads:leads,sld:sld,cur:cur,user:user,pr:pr,fc:fc,st:st,doSell:doSell,sinvm:sinvm,syncUp:syncUp,hstaff:hstaff,shs:shs,stf:stf,fh:fh,totalRev:totalRev,onLogout:onLogout}}/>}

        {tab==="history"&&<HistoryTab {...{ev:ev,inv:inv,si:si,sales:sales,ssl:ssl,leads:leads,sld:sld,cur:cur,user:user,pr:pr,fc:fc,st:st,doSell:doSell,sinvm:sinvm,syncUp:syncUp,hstaff:hstaff,shs:shs,stf:stf,fh:fh,totalRev:totalRev,onLogout:onLogout}}/>}

        {tab==="inventory"&&<InventoryTab {...{ev:ev,inv:inv,si:si,sales:sales,ssl:ssl,leads:leads,sld:sld,cur:cur,scur:scur,user:user,pr:pr,users:users,onUsersChange:onUsersChange,syncUp:syncUp,doSell:doSell,sinvm:sinvm,sdet:sdet,fc:fc,st:st,onLogout:onLogout,onUpdateEvent:onUpdateEvent,allEvents:allEvents,onSwitch:onSwitch,jc:jc,sjc:sjc,det:det,scan:scan,sscan:sscan,mlTab:mlTab,smlTab:smlTab,mlInput:mlInput,smlInput:smlInput,mlItems:mlItems,smlItems:smlItems,mlDisc:mlDisc,smlDisc:smlDisc,mlDiscAmt:mlDiscAmt,smlDiscAmt:smlDiscAmt,mlMarkup:mlMarkup,smlMarkup:smlMarkup,mlNF:mlNF,smlNF:smlNF,mlScan:mlScan,smlScan:smlScan,mlSubtotal:mlSubtotal,mlFinal:mlFinal,mlTotal:mlTotal,resolveCodes:resolveCodes,sellMulti:sellMulti,showFilter:showFilter,sShowFilter:sShowFilter,activeFilters:activeFilters,resetFilters:resetFilters,fCat:fCat,sfCat:sfCat,fCol:fCol,sfCol:sfCol,fMetal:fMetal,sfMetal:sfMetal,fSt:fSt,sfSt:sfSt,fShape:fShape,sfShape:sfShape,fMinTc:fMinTc,sfMinTc:sfMinTc,fMaxTc:fMaxTc,sfMaxTc:sfMaxTc,fMinGw:fMinGw,sfMinGw:sfMinGw,fMaxGw:fMaxGw,sfMaxGw:sfMaxGw,fMinNw:fMinNw,sfMinNw:sfMinNw,fMaxNw:fMaxNw,sfMaxNw:sfMaxNw,fMinFp:fMinFp,sfMinFp:sfMinFp,fMaxFp:fMaxFp,sfMaxFp:sfMaxFp,allCats:allCats,allCols:allCols,allMetals:allMetals,allShapes:allShapes,allSt:allSt,lkQ:lkQ,lkResults:lkResults,lkShowResults:lkShowResults,applyFilters:applyFilters,invTab:invTab,sivTab:sivTab,isq:isq,sisq:sisq,ist:ist,sist:sist,icat:icat,sicat:sicat,fi:fi,cats:cats,deadStock:deadStock,auditLoc:auditLoc,saLoc:saLoc,auditScanned:auditScanned,saScanned:saScanned,audits:audits,sAudits:sAudits,locItems:locItems,missing:missing,saveAudit:saveAudit,totalRev:totalRev,stf:stf,hstaff:hstaff,shs:shs,atab:atab,sat:sat,showSwitch:showSwitch,ssw:ssw}}/>}

        {tab==="customers"&&<CustomersTab {...{ev:ev,inv:inv,si:si,sales:sales,ssl:ssl,leads:leads,sld:sld,cur:cur,user:user,pr:pr,fc:fc,st:st,doSell:doSell,sinvm:sinvm,syncUp:syncUp,hstaff:hstaff,shs:shs,stf:stf,fh:fh,totalRev:totalRev,onLogout:onLogout,addLead:addLead}}/>}

        {tab==="analytics"&&<AnalyticsTab {...{ev:ev,inv:inv,si:si,sales:sales,ssl:ssl,leads:leads,sld:sld,cur:cur,scur:scur,user:user,pr:pr,users:users,onUsersChange:onUsersChange,syncUp:syncUp,doSell:doSell,sinvm:sinvm,sdet:sdet,fc:fc,st:st,onLogout:onLogout,onUpdateEvent:onUpdateEvent,allEvents:allEvents,onSwitch:onSwitch,jc:jc,sjc:sjc,det:det,scan:scan,sscan:sscan,mlTab:mlTab,smlTab:smlTab,mlInput:mlInput,smlInput:smlInput,mlItems:mlItems,smlItems:smlItems,mlDisc:mlDisc,smlDisc:smlDisc,mlDiscAmt:mlDiscAmt,smlDiscAmt:smlDiscAmt,mlMarkup:mlMarkup,smlMarkup:smlMarkup,mlNF:mlNF,smlNF:smlNF,mlScan:mlScan,smlScan:smlScan,mlSubtotal:mlSubtotal,mlFinal:mlFinal,mlTotal:mlTotal,resolveCodes:resolveCodes,sellMulti:sellMulti,showFilter:showFilter,sShowFilter:sShowFilter,activeFilters:activeFilters,resetFilters:resetFilters,fCat:fCat,sfCat:sfCat,fCol:fCol,sfCol:sfCol,fMetal:fMetal,sfMetal:sfMetal,fSt:fSt,sfSt:sfSt,fShape:fShape,sfShape:sfShape,fMinTc:fMinTc,sfMinTc:sfMinTc,fMaxTc:fMaxTc,sfMaxTc:sfMaxTc,fMinGw:fMinGw,sfMinGw:sfMinGw,fMaxGw:fMaxGw,sfMaxGw:sfMaxGw,fMinNw:fMinNw,sfMinNw:sfMinNw,fMaxNw:fMaxNw,sfMaxNw:sfMaxNw,fMinFp:fMinFp,sfMinFp:sfMinFp,fMaxFp:fMaxFp,sfMaxFp:sfMaxFp,allCats:allCats,allCols:allCols,allMetals:allMetals,allShapes:allShapes,allSt:allSt,lkQ:lkQ,lkResults:lkResults,lkShowResults:lkShowResults,applyFilters:applyFilters,invTab:invTab,sivTab:sivTab,isq:isq,sisq:sisq,ist:ist,sist:sist,icat:icat,sicat:sicat,fi:fi,cats:cats,deadStock:deadStock,auditLoc:auditLoc,saLoc:saLoc,auditScanned:auditScanned,saScanned:saScanned,audits:audits,sAudits:sAudits,locItems:locItems,missing:missing,saveAudit:saveAudit,totalRev:totalRev,stf:stf,hstaff:hstaff,shs:shs,atab:atab,sat:sat,showSwitch:showSwitch,ssw:ssw}}/>}

        {tab==="admin"&&<AdminTab {...{ev:ev,inv:inv,si:si,sales:sales,ssl:ssl,leads:leads,sld:sld,cur:cur,scur:scur,user:user,pr:pr,users:users,onUsersChange:onUsersChange,syncUp:syncUp,doSell:doSell,sinvm:sinvm,sdet:sdet,fc:fc,st:st,onLogout:onLogout,onUpdateEvent:onUpdateEvent,allEvents:allEvents,onSwitch:onSwitch,jc:jc,sjc:sjc,det:det,scan:scan,sscan:sscan,mlTab:mlTab,smlTab:smlTab,mlInput:mlInput,smlInput:smlInput,mlItems:mlItems,smlItems:smlItems,mlDisc:mlDisc,smlDisc:smlDisc,mlDiscAmt:mlDiscAmt,smlDiscAmt:smlDiscAmt,mlMarkup:mlMarkup,smlMarkup:smlMarkup,mlNF:mlNF,smlNF:smlNF,mlScan:mlScan,smlScan:smlScan,mlSubtotal:mlSubtotal,mlFinal:mlFinal,mlTotal:mlTotal,resolveCodes:resolveCodes,sellMulti:sellMulti,showFilter:showFilter,sShowFilter:sShowFilter,activeFilters:activeFilters,resetFilters:resetFilters,fCat:fCat,sfCat:sfCat,fCol:fCol,sfCol:sfCol,fMetal:fMetal,sfMetal:sfMetal,fSt:fSt,sfSt:sfSt,fShape:fShape,sfShape:sfShape,fMinTc:fMinTc,sfMinTc:sfMinTc,fMaxTc:fMaxTc,sfMaxTc:sfMaxTc,fMinGw:fMinGw,sfMinGw:sfMinGw,fMaxGw:fMaxGw,sfMaxGw:sfMaxGw,fMinNw:fMinNw,sfMinNw:sfMinNw,fMaxNw:fMaxNw,sfMaxNw:sfMaxNw,fMinFp:fMinFp,sfMinFp:sfMinFp,fMaxFp:fMaxFp,sfMaxFp:sfMaxFp,allCats:allCats,allCols:allCols,allMetals:allMetals,allShapes:allShapes,allSt:allSt,lkQ:lkQ,lkResults:lkResults,lkShowResults:lkShowResults,applyFilters:applyFilters,invTab:invTab,sivTab:sivTab,isq:isq,sisq:sisq,ist:ist,sist:sist,icat:icat,sicat:sicat,fi:fi,cats:cats,deadStock:deadStock,auditLoc:auditLoc,saLoc:saLoc,auditScanned:auditScanned,saScanned:saScanned,audits:audits,sAudits:sAudits,locItems:locItems,missing:missing,saveAudit:saveAudit,totalRev:totalRev,stf:stf,hstaff:hstaff,shs:shs,atab:atab,sat:sat,showSwitch:showSwitch,ssw:ssw}}/>}

        {scan&&<QRScanner onScanned={code=>{sscan(false);const f=inv.find(i=>i.id===code);if(f)sdet(f);else alert("Item '"+code+"' not in inventory.");}} onClose={()=>sscan(false)}/>}
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
  const [appUsers,sappUsers]=useState(USERS);
  const [activeEv,sae]=useState(null);
  const [manageEv,smev]=useState(null);
  const upEv=ev=>sevents(p=>p.map(e=>e.id===ev.id?ev:e));
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
  return(<>
    <EventHub user={user} events={events} onEnter={ev=>sae(ev)} onCreate={ev=>sevents(p=>[ev,...p])} onManage={ev=>smev(ev)} onLogout={logout}/>
    {manageEv&&<ManageEvent ev={events.find(e=>e.id===manageEv.id)||manageEv} onClose={()=>smev(null)} onUpdate={ev=>{upEv(ev);smev(ev);}}/>}</>);
}
