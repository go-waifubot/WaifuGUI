import{l as c,i as o,d as i,s as u,e as d,t as l,f as h}from"./index-66667b7f.js";const f="https://waifuapi.karitham.dev",a=async e=>{try{return{error:null,data:await e().catch(n=>{throw n})}}catch(t){return{error:t,data:null}}},m=async e=>a(()=>fetch(`${f}/user/find?anilist=${encodeURIComponent(e)}`).then(t=>t.json()).then(t=>t)),b=async e=>a(()=>fetch(`https://waifuapi.karitham.dev/user/${e}`).then(t=>t.json()).then(t=>t)),v=l('<button class="rounded-md font-sans border-blue hover:cursor-pointer bg-base text-text p-4 focus:outline-none">'),_=e=>(()=>{const t=v();return c(t,"click",e.onClick,!0),o(t,()=>e.children),i(n=>{const s=e.type??"button",r={[e.class]:!!e.class};return s!==n._v$&&u(t,"type",n._v$=s),n._v$2=d(t,r,n._v$2),n},{_v$:void 0,_v$2:void 0}),t})();h(["click"]);export{_ as G,b as a,m as g};
