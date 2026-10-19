// Emberfall Survival (formerly Camp Quest: Four Realms) — original survival game. All models, textures and animation are procedural three.js code.
import * as THREE from 'three';
import {Sky} from 'three/addons/objects/Sky.js';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {ShaderPass} from 'three/addons/postprocessing/ShaderPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
const $=id=>document.getElementById(id);
const isTouch=matchMedia('(pointer:coarse)').matches||'ontouchstart' in window;
const GQ=['low','medium','high'].includes(localStorage.getItem('cq_gfx'))?localStorage.getItem('cq_gfx'):(isTouch?'low':'high');
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const rnd=(a,b)=>a+Math.random()*(b-a);const pick=a=>a[Math.floor(Math.random()*a.length)];
function mulberry(s){return()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const SAVE_KEY='campquest_v1';

// ---------- world layout ----------
const W=300,INNER=72;
function biomeAt(x,z){const j=Math.sin(x*.07)*4+Math.cos(z*.06)*4;if(Math.max(Math.abs(x),Math.abs(z))<INNER+j)return 'forest';if(Math.abs(z)>=Math.abs(x)+j*.5)return z<0?'snow':'desert';return x>0?'jungle':'lava';}
const BIOME={forest:{n:'Central Forest',c:[0x4f8a3a,0x3f7a30],fog:0x9cc7a0},snow:{n:'Snowy Mountains',c:[0xeef3f8,0xd5e0ea],fog:0xdfe9f2},jungle:{n:'Jungle',c:[0x2f7d2c,0x3c9a3a],fog:0x8fbf88},desert:{n:'Desert',c:[0xe2c27a,0xd4ae62],fog:0xf0dcaa},lava:{n:'Volcanic Lands',c:[0x3a2a26,0x50322a],fog:0x6a3a2a}};
const R=mulberry(424242);
const PONDS=[],LAVA=[];
function addPonds(b,n,minr,maxr){let k=0,g=0;while(k<n&&g++<2000){const x=(R()*2-1)*(W-20),z=(R()*2-1)*(W-20);if(biomeAt(x,z)!==b||Math.hypot(x,z)<14)continue;(b==='lava'?LAVA:PONDS).push({x,z,r:minr+R()*(maxr-minr)});k++;}}
const VILLAGES=[
 {id:'oak',name:'Oakhollow',biome:'forest',x:34,z:26},
 {id:'frost',name:'Frostpeak',biome:'snow',x:-18,z:-140},
 {id:'vine',name:'Vinewood',biome:'jungle',x:140,z:20},
 {id:'sand',name:'Sandmere',biome:'desert',x:16,z:145},
 {id:'ember',name:'Emberfall',biome:'lava',x:-138,z:-16}];
const BOSSES=[
 {id:'yeti',biome:'snow',name:'Yeti King',x:30,z:-252,look:{scale:3,bulk:1.5,skin:0xc8d4e0,shirt:0xf4f8fc,pants:0xe8eef4,boot:0xc8d4e0,hair:0xffffff,fur:0xffffff,horns:0x9ab8d0,crown:1,eye:0x40c0ff},tint:0xcfe8ff,hp:700,dmg:20,proj:0xbfe6ff,attacks:['slam','volley','charge','summon'],minion:'snow_fox',trophy:'yeti_fang',loot:{crystal:4,iron:4,hide:6}},
 {id:'vine',biome:'jungle',name:'Vine Queen',x:250,z:-40,look:{scale:3,skin:0x7ac070,shirt:0x2e8b2e,pants:0x1e5a1e,hair:0x145214,hat:'leaves',skirt:0x2a7a2a,staff:0x66ff44,eye:0xaaff00},tint:0x8fff8f,hp:750,dmg:18,proj:0x66ff44,attacks:['ring','volley','summon','slam'],minion:'snake',trophy:'vine_heart',loot:{feather:6,gold:4,fiber:10}},
 {id:'pharaoh',biome:'desert',name:'Sand Pharaoh',x:-40,z:250,look:{scale:3,skin:0xc49a5a,shirt:0xf4ecd0,pants:0xd4af37,hair:null,hat:'nemes',skirt:0xf4ecd0,staff:0xffd040,cape:0x1a3a8a,eye:0xffd040},tint:0xffe08a,hp:800,dmg:20,proj:0xf2c55a,attacks:['teleport','spiral','summon','volley'],minion:'scorpion',trophy:'pharaoh_ankh',loot:{gold:8,hide:4}},
 {id:'titan',biome:'lava',name:'Magma Titan',x:-252,z:40,look:{scale:3.4,bulk:1.6,skin:0x3a2420,shirt:0x2a1a16,pants:0x2a1a16,boot:0x1a100c,hair:null,horns:0x1a1010,cracks:1,eye:0xff6a00},tint:0xff6a3a,emis:0xff3300,hp:950,dmg:24,proj:0xff5a1a,attacks:['meteor','slam','ring','charge'],minion:'salamander',trophy:'magma_core',loot:{obsidian:6,gold:5}}];
addPonds('forest',7,4,8);addPonds('jungle',8,4,9);addPonds('desert',3,3,5);addPonds('snow',3,4,7);addPonds('lava',16,3,8);
PONDS.push({x:-12,z:9,r:4.5});
BOSSES.forEach(B=>{B.hp=Math.round(B.hp*.62);B.dmg=Math.round(B.dmg*.62);});
const nearSpecial=(x,z,pad)=>VILLAGES.some(v=>Math.hypot(x-v.x,z-v.z)<16+pad)||BOSSES.some(b=>Math.hypot(x-b.x,z-b.z)<22+pad)||PONDS.some(p=>Math.hypot(x-p.x,z-p.z)<p.r+1.5+pad)||LAVA.some(p=>Math.hypot(x-p.x,z-p.z)<p.r+1.5+pad)||Math.hypot(x,z)<10+pad;
function H(x,z){let h=Math.sin(x*.05)*Math.cos(z*.045)*1.2+Math.sin(x*.13+1)*Math.sin(z*.11)*.5;
 const sn=clamp((-z-INNER)/50,0,1);if(sn>0)h+=sn*(Math.abs(Math.sin(x*.035)*Math.cos(z*.04))*7+Math.sin(x*.09)*1.2);
 const la=clamp((-x-INNER)/50,0,1);if(la>0)h+=la*Math.abs(Math.sin(x*.05+z*.03))*3;
 const de=clamp((z-INNER)/50,0,1);if(de>0)h+=de*Math.sin(x*.04+z*.02)*2;
 for(const p of PONDS){const d=Math.hypot(x-p.x,z-p.z);if(d<p.r+3)h=Math.min(h,-1+clamp((d-p.r)/3,0,1)*(h+1)+(d<p.r?-.4:0));}
 for(const p of LAVA){const d=Math.hypot(x-p.x,z-p.z);if(d<p.r+2)h=Math.min(h,-.4+clamp((d-p.r)/2,0,1)*(h+.4));}
 for(const s of [...VILLAGES,...BOSSES]){const d=Math.hypot(x-s.x,z-s.z);if(d<26)h=h*sstep(14,26,d)+(1-sstep(14,26,d))*.2;}
 const d0=Math.hypot(x,z);if(d0<16)h=h*sstep(6,16,d0)+(1-sstep(6,16,d0))*.2;
 return h;}
function sstep(a,b,x){const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);}
const inPond=(x,z,pad=0)=>PONDS.find(p=>Math.hypot(x-p.x,z-p.z)<p.r+pad);
const inLava=(x,z)=>LAVA.find(p=>Math.hypot(x-p.x,z-p.z)<p.r-.3);

// ---------- renderer ----------
const renderer=new THREE.WebGLRenderer({antialias:!isTouch||devicePixelRatio<2,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,GQ==='low'?1:GQ==='medium'?1.5:2));renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=GQ!=='low';renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;
document.body.prepend(renderer.domElement);
const scene=new THREE.Scene();scene.fog=new THREE.Fog(0x9cc7a0,40,95);scene.background=new THREE.Color(0x9cc7a0);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,.5,GQ==='low'?220:300);if(GQ!=='low'){scene.fog.near=55;scene.fog.far=GQ==='high'?170:130;}
const hemi=new THREE.HemisphereLight(0xdfefff,0x4a3a2a,.9);scene.add(hemi);
const sun=new THREE.DirectionalLight(0xfff1d6,2.2);sun.castShadow=true;sun.shadow.mapSize.set(GQ==='high'?2048:1024,GQ==='high'?2048:1024);sun.shadow.radius=4;
Object.assign(sun.shadow.camera,{left:-30,right:30,top:30,bottom:-30,near:1,far:120});sun.shadow.bias=-.0006;scene.add(sun,sun.target);
const fireLight=new THREE.PointLight(0xff9a40,0,22,1.3);scene.add(fireLight);const fireFill=new THREE.PointLight(0xffa860,0,30,1);scene.add(fireFill);const safeBlue=new THREE.PointLight(0x4a9aff,0,30,1);scene.add(safeBlue);if(GQ==='high'){fireLight.castShadow=true;fireLight.shadow.mapSize.set(512,512);fireLight.shadow.bias=-.004;fireLight.shadow.camera.near=.5;}
const torchLight=new THREE.PointLight(0xffb060,0,16,1.6);scene.add(torchLight);
// daylight inside campfire safe circle: shared shader uniforms + injection into MeshStandardMaterial
const SAFEU={uSafeC:{value:new THREE.Vector2(0,-1.5)},uSafeR:{value:0},uSafeDay:{value:0}};
function addSafeShader(sh,useWP){Object.assign(sh.uniforms,{uSafeC:SAFEU.uSafeC,uSafeR:SAFEU.uSafeR,uSafeDay:SAFEU.uSafeDay});
 if(useWP){sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform vec2 uSafeC;uniform float uSafeR;uniform float uSafeDay;').replace('#include <opaque_fragment>','float sMask=1.0-smoothstep(uSafeR*0.80,uSafeR,distance(vWP,uSafeC));outgoingLight+=diffuseColor.rgb*uSafeDay*sMask;\n#include <opaque_fragment>');return sh;}
 sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vSafeW;').replace('#include <project_vertex>','#include <project_vertex>\n{vec4 swp=vec4(transformed,1.0);\n#ifdef USE_INSTANCING\nswp=instanceMatrix*swp;\n#endif\nvSafeW=(modelMatrix*swp).xyz;}');
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vSafeW;uniform vec2 uSafeC;uniform float uSafeR;uniform float uSafeDay;').replace('#include <opaque_fragment>','float sMask=1.0-smoothstep(uSafeR*0.80,uSafeR,distance(vSafeW.xz,uSafeC));outgoingLight+=diffuseColor.rgb*uSafeDay*sMask*(0.55+0.45*clamp(normal.y,0.0,1.0));\n#include <opaque_fragment>');return sh;}
THREE.MeshStandardMaterial.prototype.onBeforeCompile=sh=>addSafeShader(sh,false);
addEventListener('resize',()=>{renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();});
// detail noise texture for ground
const nc=document.createElement('canvas');nc.width=nc.height=128;{const g=nc.getContext('2d'),id=g.createImageData(128,128);for(let i=0;i<128*128;i++){const v=200+Math.random()*55;id.data[i*4]=id.data[i*4+1]=id.data[i*4+2]=v;id.data[i*4+3]=255;}g.putImageData(id,0,0);}
const ntex=new THREE.CanvasTexture(nc);ntex.wrapS=ntex.wrapT=THREE.RepeatWrapping;ntex.repeat.set(160,160);ntex.colorSpace=THREE.SRGBColorSpace;
// ground
const TXL=new THREE.TextureLoader();function ltex(n,rep,srgb=true){const t=TXL.load('tex/'+n+'.jpg');t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rep,rep);if(srgb)t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=GQ==='high'?8:2;return t;}
const HQ=GQ!=='low';
{const seg=GQ==='high'?300:GQ==='medium'?220:160,geo=new THREE.PlaneGeometry(W*2,W*2,seg,seg);geo.rotateX(-Math.PI/2);const pos=geo.attributes.position,col=new Float32Array(pos.count*3),bw=new Float32Array(pos.count*4),c=new THREE.Color(),c2=new THREE.Color();
 for(let i=0;i<pos.count;i++){const x=pos.getX(i),z=pos.getZ(i),y=H(x,z);pos.setY(i,y);const bi=biomeAt(x,z),b=BIOME[bi];c.setHex(b.c[0]).lerp(c2.setHex(b.c[1]),.5+.5*Math.sin(x*.21)*Math.cos(z*.17));
  const w=[0,0,0,0];for(const [dx,dz] of [[0,0],[5,0],[-5,0],[0,5],[0,-5]]){const bb=biomeAt(x+dx,z+dz);w[bb==='snow'?1:bb==='desert'?2:bb==='lava'?3:0]+=.2;}
  if(bi==='snow'||y>5&&z<-60){w[1]+=.3;}const pd=inPond(x,z,1.6);if(pd){w[0]*=.3;w[2]+=.7;}if(LAVA.some(p=>Math.hypot(x-p.x,z-p.z)<p.r+1.5)){w[3]+=1;c.lerp(c2.setHex(0x1a0f0a),.7);}
  const ws=w[0]+w[1]+w[2]+w[3];bw.set(w.map(v=>v/ws),i*4);
  if(pd)c.lerp(c2.setHex(0x8a7a50),.6);if(bi==='snow'&&y>4)c.lerp(c2.setHex(0xffffff),.5);if(Math.abs(x)>W-6||Math.abs(z)>W-6)c.multiplyScalar(.4);
  if(HQ){c.lerp(c2.setHex(0xffffff),bi==='jungle'?.35:.6);if(bi==='jungle')c.multiply(c2.setHex(0xb8ffb0));}
  col[i*3]=c.r;col[i*3+1]=c.g;col[i*3+2]=c.b;}
 geo.setAttribute('color',new THREE.BufferAttribute(col,3));geo.setAttribute('bw',new THREE.BufferAttribute(bw,4));geo.computeVertexNormals();
 let gm;if(!HQ)gm=new THREE.MeshStandardMaterial({vertexColors:true,map:ntex,roughness:.95});
 else{const T={g:ltex('grass_c',1),s:ltex('snow_c',1),d:ltex('sand_c',1),r:ltex('rock_c',1)};gm=new THREE.MeshStandardMaterial({vertexColors:true,map:T.g,roughness:.92,normalMap:ltex('grass_n',220,false),normalScale:new THREE.Vector2(.8,.8)});
  gm.onBeforeCompile=sh=>{Object.assign(sh.uniforms,{tS:{value:T.s},tD:{value:T.d},tR:{value:T.r}});
   sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute vec4 bw;varying vec4 vBW;varying vec2 vWP;').replace('#include <begin_vertex>','#include <begin_vertex>\nvBW=bw;vWP=(modelMatrix*vec4(position,1.)).xz;');
   sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D tS,tD,tR;varying vec4 vBW;varying vec2 vWP;').replace('#include <map_fragment>',`vec2 u1=vWP*.22,u2=vWP*.031;vec4 cg=mix(texture2D(map,u1),texture2D(map,u2),.35),cs=texture2D(tS,u1*.6),cd=mix(texture2D(tD,u1*.5),texture2D(tD,u2),.4),cr=texture2D(tR,u1*.5)*vec4(.45,.36,.33,1.);
    vec4 tc=cg*vBW.x+cs*vBW.y+cd*vBW.z+cr*vBW.w;float gn=fract(sin(dot(floor(vWP*7.0),vec2(12.9898,78.233)))*43758.5453);tc.rgb*=0.90+0.20*gn;diffuseColor*=vec4(tc.rgb*1.15,1.);`);};}
 if(HQ){const _oc=gm.onBeforeCompile;gm.onBeforeCompile=sh=>{_oc(sh);addSafeShader(sh,true);};gm.customProgramCacheKey=()=>'ground-safe';}
 const g=new THREE.Mesh(geo,gm);g.receiveShadow=true;scene.add(g);}

// water and lava
const waterMat=new THREE.MeshStandardMaterial({color:0x3a8ec8,transparent:true,opacity:.8,roughness:.15,metalness:.1});
const iceMat=new THREE.MeshStandardMaterial({color:0xbfe4f5,roughness:.2});
const lavaMat=new THREE.MeshBasicMaterial({color:0xff5a10});lavaMat.color.multiplyScalar(HQ?1.6:1);
for(const p of PONDS){const m=new THREE.Mesh(new THREE.CircleGeometry(p.r+.6,28),biomeAt(p.x,p.z)==='snow'?iceMat:waterMat);m.rotation.x=-Math.PI/2;m.position.set(p.x,-.55,p.z);m.receiveShadow=true;scene.add(m);}
for(const p of LAVA){const m=new THREE.Mesh(new THREE.CircleGeometry(p.r+.4,24),lavaMat);m.rotation.x=-Math.PI/2;m.position.set(p.x,-.25,p.z);scene.add(m);p.mesh=m;}
// world border
{const m=new THREE.Mesh(new THREE.BoxGeometry(W*2,6,1),new THREE.MeshStandardMaterial({color:0x2a2a2a}));for(const [x,z,r] of [[0,-W,0],[0,W,0],[W,0,1],[-W,0,1]]){const b=m.clone();b.position.set(x,2,z);b.rotation.y=r*Math.PI/2;scene.add(b);}}

// ---------- procedural models & animation (original) ----------
const MAT={};function mat(c,o={}){const k=c+'|'+JSON.stringify(o);return MAT[k]||(MAT[k]=new THREE.MeshStandardMaterial({color:c,roughness:o.r??.8,metalness:o.m||0,flatShading:GQ==='low',emissive:o.e?new THREE.Color(o.e):new THREE.Color(0),emissiveIntensity:o.ei??.6}));}
function part(par,geo,m,x=0,y=0,z=0,sx=1,sy=1,sz=1){const p=new THREE.Mesh(geo,m);p.position.set(x,y,z);p.scale.set(sx,sy,sz);p.castShadow=true;par.add(p);return p;}
function joint(par,x,y,z){const g=new THREE.Group();g.position.set(x,y,z);par.add(g);return g;}
let _PT=null;function ptex(){if(_PT)return _PT;const stripe=(col,n,w)=>c=>{c.fillStyle='#f2f2f2';c.fillRect(0,0,128,128);for(let i=0;i<n;i++){c.fillStyle=col;c.fillRect(Math.random()*128,0,w,128);}};const dots=c=>{c.fillStyle='#f4ece2';c.fillRect(0,0,128,128);for(let i=0;i<400;i++){c.fillStyle=`rgba(120,90,70,${Math.random()*.12})`;c.beginPath();c.arc(Math.random()*128,Math.random()*128,1+Math.random()*2,0,7);c.fill();}};
 _PT={fabric:canvasTex(c=>{c.fillStyle='#f5f5f5';c.fillRect(0,0,128,128);c.fillStyle='rgba(90,90,90,.18)';for(let i=0;i<128;i+=4){c.fillRect(0,i,128,1);c.fillRect(i,0,1,128);}}),skin:canvasTex(dots),fur:canvasTex(c=>{c.fillStyle='#f0f0f0';c.fillRect(0,0,128,128);for(let i=0;i<240;i++){c.strokeStyle=`rgba(80,70,60,${.15+Math.random()*.25})`;c.beginPath();const x=Math.random()*128;c.moveTo(x,Math.random()*60);c.lineTo(x+3-Math.random()*6,128);c.stroke();}}),scales:canvasTex(c=>{c.fillStyle='#eef2ee';c.fillRect(0,0,128,128);c.strokeStyle='rgba(40,60,40,.35)';for(let r=0;r<8;r++)for(let i=0;i<8;i++){c.beginPath();c.arc(i*16+(r%2)*8,r*16,10,0,Math.PI);c.stroke();}}),feather:canvasTex(c=>{c.fillStyle='#f6f6f6';c.fillRect(0,0,128,128);c.strokeStyle='rgba(90,90,90,.3)';c.beginPath();c.moveTo(64,0);c.lineTo(64,128);c.stroke();for(let i=0;i<20;i++){c.beginPath();c.moveTo(64,i*7);c.lineTo(64+(i%2?34:-34),i*7+16);c.stroke();}})};return _PT;}
const TMAT={};function tmat(c,kind,o={}){if(GQ==='low')return mat(c,o);const key=c+'|'+kind+'|'+JSON.stringify(o);if(TMAT[key])return TMAT[key];const t=ptex()[kind]||null;const m=new THREE.MeshStandardMaterial({color:c,map:t,roughness:o.r??.85,metalness:o.m||0,emissive:o.e?new THREE.Color(o.e):new THREE.Color(0),emissiveIntensity:o.ei??.6});TMAT[key]=m;return m;}
const BX=new THREE.BoxGeometry(1,1,1),RB=GQ==='low'?BX:new RoundedBoxGeometry(1,1,1,3,.22),SP=new THREE.SphereGeometry(1,GQ==='low'?12:20,GQ==='low'?9:14),CN=new THREE.ConeGeometry(1,1,8),CY=new THREE.CylinderGeometry(1,1,1,8);
// biped: o={skin,shirt,pants,hair,scale,bulk,hat,horns,crown,fur,emis,skirt,staff,cape}
function makeHuman(o={}){const root=new THREE.Group(),body=joint(root,0,0,0);const sc=o.scale||1,bk=o.bulk||1;body.scale.setScalar(sc);
 const em=o.emis?{e:o.emis,ei:.7}:{};const skin=tmat(o.skin??0xf0c8a0,'skin',em),shirt=tmat(o.shirt??0x3a6a9a,'fabric',em),pants=tmat(o.pants??0x4a3a2a,'fabric',em),hairM=tmat(o.hair??0x3a2412,'fur'),boot=tmat(o.boot??0x2a1a10,'fabric');
 // legs: thigh + knee + shin/boot (better proportions: hips at .95)
 const mkLeg=s=>{const hip=joint(body,s*.13*bk,.95,0);part(hip,SP,pants,0,-.2,0,.1*bk,.24,.11*bk);part(hip,RB,pants,0,-.22,0,.16*bk,.44,.18*bk);const knee=joint(hip,0,-.45,0);part(knee,RB,pants,0,-.18,0,.13*bk,.36,.15*bk);part(knee,SP,boot,0,-.4,.05,.1*bk,.07,.17*bk);part(knee,RB,boot,0,-.42,.07,.17*bk,.09,.26);return{hip,knee};};
 const L1=mkLeg(-1),L2=mkLeg(1),legL=L1.hip,legR=L2.hip;
 const torso=joint(body,0,.95,0);
 part(torso,SP,shirt,0,.38,0,.27*bk,.34,.17*bk);part(torso,RB,shirt,0,.34,0,.46*bk,.6,.28*bk);part(torso,RB,shirt,0,.03,0,.4*bk,.18,.25*bk);
 part(torso,RB,mat(0x2a1e12),0,.08,0,.5*bk,.09,.3*bk);part(torso,RB,mat(0xe0b030,{m:.7,r:.35}),0,.08,.16,.12,.07,.02);
 const strap=part(torso,RB,mat(0x4a2f1a),0,.36,0,.09,.62,.31*bk);strap.rotation.z=.55;
 part(torso,RB,shirt,-.3*bk,-.04,-.06,.15,.32,.2*bk);
 for(let i=0;i<3;i++)part(torso,SP,mat(0xe8dcc0,{m:.3}),0,.48-i*.16,.15*bk,.025,.025,.015);
 part(torso,CY,shirt,0,.66,0,.16*bk,.1,.16*bk);
 if(o.scarf){const sm=tmat(o.scarf,'fabric');const sc2=part(torso,CY,sm,0,.68,0,.19*bk,.13,.19*bk);part(torso,RB,sm,.1,.5,.14,.12,.26,.04);}
 if(o.skirt)part(torso,CN,tmat(o.skirt,'fabric',em),0,-.22,0,.44*bk,.78,.44*bk);
 if(o.armor){const am=mat(o.armor,{m:o.armor>0xaaaaaa?.6:.3,r:.38});part(torso,SP,am,0,.38,-.01,.3*bk,.33,.19*bk);part(torso,RB,am,0,.38,-.01,.54*bk,.58,.34*bk);part(torso,RB,am,-.33*bk,.6,0,.17,.15,.32);part(torso,RB,am,.33*bk,.6,0,.17,.15,.32);part(torso,RB,mat(0xe0b030,{m:.7}),0,.38,.18,.15,.19,.02);}
 if(o.cape)part(torso,RB,tmat(o.cape,'fabric'),0,.18,-.18*bk,.46*bk,.88,.04);
 // head: neck, rounded skull, jaw, nose, ears, eyes (white+pupil), mouth/brows by expression
 const head=joint(torso,0,.78,0);part(head,CY,skin,0,-.06,0,.07*bk,.14,.07*bk);
 part(head,SP,skin,0,.1,0,.21*bk,.24*bk,.205*bk);part(head,SP,skin,0,-.04,.02,.17*bk,.13,.16*bk);
 part(head,SP,skin,-.21*bk,.1,0,.045,.06,.045);part(head,SP,skin,.21*bk,.1,0,.045,.06,.045);
 {const nose=part(head,CN,skin,0,.05,.2*bk,.045,.1,.045);nose.rotation.x=Math.PI/2.3;}
 const eyeW=mat(0xffffff),eyeM=mat(o.eye??0x1a1410,o.eye?{e:o.eye,ei:1.4}:{});
 for(const sd of[-1,1]){part(head,SP,eyeW,sd*.082,.13,.185*bk,.034,.04,.017);part(head,SP,eyeM,sd*.082,.13,.2*bk,.02,.026,.012);}
 const fm=mat(0x5a2c18);const fc=o.face||(o.pers==='cheerful'||o.pers==='excited'?'happy':o.pers==='grumpy'||o.pers==='stern'?'brave':o.pers==='dreamy'?'sleepy':'');
 if(fc==='cool'){part(head,RB,mat(0x101014,{m:.4}),0,.13,.2,.4,.09,.03);part(head,RB,mat(0x101014),0,.13,.15,.46,.02,.12);}
 else if(fc==='sleepy'){for(const sd of[-1,1])part(head,RB,fm,sd*.082,.13,.2,.07,.012,.01);part(head,SP,fm,0,-.05,.2,.03,.026,.015);}
 else if(fc==='shy'){for(const sd of[-1,1]){const b=part(head,RB,fm,sd*.082,.2,.195,.09,.016,.01);b.rotation.z=sd*.25;}part(head,RB,fm,0,-.06,.2,.07,.018,.01);part(head,SP,mat(0xe88a7a),-.13,0,.19,.05,.035,.015);part(head,SP,mat(0xe88a7a),.13,0,.19,.05,.035,.015);}
 else{part(head,RB,fm,0,-.06,.195,.11,.02,.015);if(fc==='happy'){const m1=part(head,RB,fm,-.045,-.045,.195,.07,.018,.01);m1.rotation.z=.35;const m2=part(head,RB,fm,.045,-.045,.195,.07,.018,.01);m2.rotation.z=-.35;}
  if(fc==='brave'){const b1=part(head,RB,fm,-.082,.21,.195,.1,.02,.01);b1.rotation.z=.35;const b2=part(head,RB,fm,.082,.21,.195,.1,.02,.01);b2.rotation.z=-.35;}}
 const hs=o.hairStyle||'short';if(o.hair!==null&&hs!=='bald'){part(head,SP,hairM,0,.2,-.035,.225*bk,.19*bk,.225*bk);part(head,SP,hairM,0,.12,-.14,.21*bk,.2,.14);
  if(hs==='long'){part(head,RB,hairM,0,-.1,-.15,.34*bk,.52,.13);part(head,RB,hairM,-.2,-.02,-.02,.09,.36,.3);part(head,RB,hairM,.2,-.02,-.02,.09,.36,.3);}
  else if(hs==='spiky'){for(let i=0;i<5;i++){const c=part(head,CN,hairM,(i-2)*.09,.36,-.02,.07,.24,.07);c.rotation.z=(2-i)*.18;}}
  else if(hs==='bun'){part(head,SP,hairM,0,.36,-.14,.13,.13,.13);}
  else if(hs==='mohawk'){part(head,RB,hairM,0,.36,-.02,.08,.26,.3*bk);}
  else if(hs==='curly'){for(let i=0;i<8;i++){const a=i/8*6.28;part(head,SP,hairM,Math.cos(a)*.15,.26,Math.sin(a)*.15,.095,.095,.095);}part(head,SP,hairM,0,.32,0,.11,.11,.11);}}
 if(o.hat==='cap'){const cm=tmat(o.hatCol||0xd84040,'fabric');part(head,SP,cm,0,.2,-.01,.23*bk,.15*bk,.23*bk);part(head,RB,cm,0,.16,.26,.3,.04,.18);}
 else if(o.hat==='explorer'){const cm=tmat(0xc8a86a,'fabric');part(head,CY,cm,0,.22,0,.34,.05,.34);part(head,CN,cm,0,.36,0,.19,.2,.19);part(head,CY,mat(0x6a4a2a),0,.28,0,.21,.06,.21);}
 else if(o.hat==='leaf'){for(let i=0;i<6;i++){const a=i/6*Math.PI*2;const l=part(head,CN,mat(i%2?0x2e8b2e:0x46b04a),Math.cos(a)*.17,.26,Math.sin(a)*.17,.08,.3,.04);l.rotation.z=-Math.cos(a)*.6;l.rotation.x=Math.sin(a)*.6;}}
 else if(o.hat==='fur'){part(head,CY,tmat(0xe8e0d0,'fur'),0,.26,0,.27*bk,.2,.27*bk);part(head,SP,tmat(0xe8e0d0,'fur'),-.24,.12,0,.06,.1,.06);part(head,SP,tmat(0xe8e0d0,'fur'),.24,.12,0,.06,.1,.06);}
 else if(o.hat==='straw'){part(head,CY,tmat(0xe0c070,'fabric'),0,.21,0,.45,.04,.45);part(head,CN,tmat(0xe0c070,'fabric'),0,.33,0,.2,.2,.2);}
 else if(o.hat==='helm'){const hm=mat(o.helm||0x6a6a5a,{m:.5,r:.4});part(head,SP,hm,0,.16,-.01,.26*bk,.19*bk,.26*bk);part(head,CY,hm,0,.08,0,.29*bk,.03,.29*bk);part(head,CN,mat(0x3a7a2a),0,.38,0,.05,.18,.05);}
 else if(o.hat==='hood')part(head,SP,tmat(o.shirt??0x6a2a1a,'fabric'),0,.12,-.04,.25*bk,.26*bk,.25*bk);
 else if(o.hat==='nemes'){const g=mat(0xd4af37,{m:.5,r:.3}),b2=mat(0x1a3a8a);part(head,RB,g,0,.18,-.05,.5,.25,.42);part(head,RB,b2,-.2,-.08,-.02,.1,.4,.3);part(head,RB,b2,.2,-.08,-.02,.1,.4,.3);part(head,CN,g,0,.38,0,.12,.18,.12);}
 else if(o.hat==='leaves'){for(let i=0;i<7;i++){const a=i/7*Math.PI*2;const l=part(head,CN,mat(0x3ab03a),Math.cos(a)*.2,.28,Math.sin(a)*.2,.07,.35,.04);l.rotation.z=-Math.cos(a)*.5;l.rotation.x=Math.sin(a)*.5;}}
 if(o.horns){const hm=mat(o.horns);for(const sd of[-1,1]){const h=part(head,CN,hm,sd*.22*bk,.28,0,.07,.3,.07);h.rotation.z=-sd*.6;}}
 if(o.crown){const g=mat(0xffd040,{m:.6,r:.3,e:0x553300,ei:.4});part(head,CY,g,0,.34*bk,0,.19*bk,.08,.19*bk);for(let i=0;i<5;i++){const a=i/5*Math.PI*2;part(head,CN,g,Math.cos(a)*.16*bk,.42*bk,Math.sin(a)*.16*bk,.04,.12,.04);}}
 if(o.fur)for(let i=0;i<10;i++)part(torso,SP,tmat(o.fur,'fur'),rnd(-.25,.25)*bk,rnd(.05,.65),rnd(-.14,.14)*bk,.12,.13,.12);
 if(o.cracks)for(let i=0;i<6;i++)part(torso,RB,mat(0xff7a20,{e:0xff5a00,ei:2}),rnd(-.2,.2)*bk,rnd(.1,.55),.16*bk,.04,rnd(.12,.3),.01);
 // arms: shoulder -> upper -> elbow -> forearm + shaped mitten hand
 const mkArm=sd=>{const sh=joint(torso,sd*.31*bk,.6,0);part(sh,SP,shirt,0,0,0,.09*bk,.1,.09*bk);part(sh,RB,shirt,0,-.16,0,.13*bk,.34,.14*bk);const el=joint(sh,0,-.34,0);part(el,RB,shirt,0,-.05,0,.12*bk,.12,.13*bk);part(el,RB,skin,0,-.2,0,.105*bk,.24,.115*bk);part(el,SP,skin,0,-.36,.01,.075*bk,.09,.085*bk);part(el,SP,skin,sd*.05,-.34,.05,.035,.05,.035);return{sh,el};};
 const A1=mkArm(-1),A2=mkArm(1),arms=[A1.sh,A2.sh];
 const hand=joint(A2.el,0,-.4,.02);
 if(o.staff){const st=joint(hand,0,0,0);part(st,CY,mat(0x6a4a2a),0,.2,0,.035,1.8,.035);part(st,SP,mat(o.staff,{e:o.staff,ei:1.2}),0,1.15,0,.1,.1,.1);}
 root.userData.rig={type:'biped',body,legL,legR,kneeL:L1.knee,kneeR:L2.knee,armL:arms[0],armR:arms[1],elbowL:A1.el,elbowR:A2.el,torso,head,hand,act:'idle',spd:1,t:Math.random()*9,one:null,oneT:0,oneD:1,h:2.02*sc};return root;}
// quadruped: o={len,h,w,leg,legW,col,belly,neck,head,snout,ears,tail,horns,hump,stripes,mane,scale,round}
function makeBeast(o){const root=new THREE.Group(),body=joint(root,0,0,0);body.scale.setScalar(o.scale||1);const furK=o.feather?'feather':(o.scales?'scales':'fur');const c=tmat(o.col,furK),bl=tmat(o.belly??o.col,'fur'),dk=mat(o.dark??0x1a1410);
 const L=o.len,Ht=o.leg,Wd=o.w;const trunk=joint(body,0,Ht+o.h/2,0);
 part(trunk,SP,c,0,0,0,Wd*.52,o.h*.52,L*.52);part(trunk,SP,c,0,.02,L*.22,Wd*.44,o.h*.46,L*.3);part(trunk,SP,bl,0,-o.h*.28,L*.02,Wd*.42,o.h*.3,L*.4);
 if(o.stripes)for(let i=0;i<6;i++)part(trunk,RB,dk,-0,o.h*.18,-L*.38+i*L*.15,Wd*1.02,o.h*.5,L*.045);
 if(o.hump)for(let i=0;i<o.hump;i++)part(trunk,SP,c,0,o.h*.48,(o.hump===2?(i?-.22:.22):0)*L,Wd*.34,o.h*.42,L*.17);
 if(o.mane)part(trunk,SP,tmat(o.mane,'fur'),0,o.h*.4,L*.28,Wd*.3,o.h*.42,L*.28);
 const legs=[],knees=[];for(const [x,z] of [[-1,1],[1,1],[-1,-1],[1,-1]]){const lg=joint(body,x*Wd*.3,Ht+.02,z*L*.34);part(lg,SP,c,0,-.04,0,o.legW*.62,o.legW*.7,o.legW*.62);part(lg,RB,c,0,-Ht*.22,0,o.legW,Ht*.45,o.legW);const kn=joint(lg,0,-Ht*.48,0);part(kn,RB,c,0,-Ht*.22,0,o.legW*.85,Ht*.45,o.legW*.85);part(kn,SP,dk,0,-Ht*.48,z*.03,o.legW*.55,.05,o.legW*.75);legs.push(lg);knees.push(kn);}
 const nk=joint(trunk,0,o.h*.22,L*.42);if(o.neck){const n=part(nk,SP,c,0,o.neck/2,o.neck*.12,Wd*.2,o.neck*.62,Wd*.2);n.rotation.x=.3;}
 const head=joint(nk,0,(o.neck||0)*.92,(o.neck||0)*.32+o.head*.22);part(head,SP,c,0,0,o.head*.25,o.head*.42,o.head*.4,o.head*.5);
 if(o.snout)part(head,SP,bl,0,-o.head*.1,o.head*.55,o.head*.28,o.head*.22,o.head*.55);
 part(head,SP,dk,0,-o.head*.02,o.head*.25+o.head*.5+(o.snout||0),o.head*.11,o.head*.09,o.head*.07);
 const eyW=mat(0xffffff),ey=mat(0x111111,o.eyeGlow?{e:o.eyeGlow,ei:2}:{});for(const sd of[-1,1]){part(head,SP,eyW,sd*o.head*.3,o.head*.16,o.head*.62,o.head*.06,o.head*.065,o.head*.035);part(head,SP,ey,sd*o.head*.3,o.head*.16,o.head*.68,o.head*.04,o.head*.045,o.head*.025);}
 const ears=[];for(const sd of[-1,1]){const ej=joint(head,sd*o.head*.26,o.head*.38,o.head*.05);let em=null;
  if(o.ears==='point'){em=part(ej,CN,c,0,o.head*.16,0,o.head*.13,o.head*.34,o.head*.07);}
  else if(o.ears==='round'){em=part(ej,SP,c,0,o.head*.06,0,o.head*.13,o.head*.13,o.head*.06);}
  else if(o.ears==='long'){em=part(ej,RB,c,sd*o.head*.1,o.head*.08,0,o.head*.3,o.head*.09,o.head*.14);em.rotation.z=sd*.35;}
  ej.userData.z0=ej.rotation.z;ears.push(ej);}
 if(o.horns==='antlers'){const am=mat(0xd8c8a0);for(const sd of[-1,1]){const a=part(head,CY,am,sd*o.head*.2,o.head*.72,0,.028,o.head*.85,.028);a.rotation.z=-sd*.4;for(let i=0;i<2;i++){const b2=part(head,CY,am,sd*(o.head*.34+i*.08),o.head*(.82+i*.24),.05,.022,o.head*.38,.022);b2.rotation.x=-.6;}}}
 if(o.horns==='tusks')for(const sd of[-1,1]){const t=part(head,CN,mat(0xf4ecd8),sd*o.head*.2,-o.head*.22,o.head*.75,.03,.14,.03);t.rotation.x=-.8;}
 const tl=joint(trunk,0,o.h*.18,-L*.46);if(o.tail==='bushy'){const t=part(tl,SP,tmat(o.tailCol??o.col,'fur'),0,.08,-.22,.11,.14,.32);t.rotation.x=-.5;}else if(o.tail==='thin'){for(let i=0;i<5;i++)part(tl,BX,i%2&&o.stripes?dk:c,0,i*.03,-.08-i*.13,.055,.055,.14);}else if(o.tail==='short')part(tl,SP,c,0,.02,-.05,.07,.07,.07);
 root.userData.rig={type:'quad',body,legs,knees,ears,head,trunk,tail:tl,act:'idle',spd:1,t:Math.random()*9,one:null,oneT:0,oneD:1,h:Ht+o.h};return root;}
function rigSet(f,act,spd=1){const r=f.userData.rig;if(!r)return;if(r.one==='death')return;r.act=act;r.spd=spd;}
function rigOnce(f,act,dur=.45){const r=f.userData.rig;if(!r||r.one==='death')return;r.one=act;r.oneT=0;r.oneD=dur;}
function rigReset(f){const r=f.userData.rig;if(!r)return;r.one=null;r.body.rotation.set(0,0,0);r.body.position.set(0,0,0);}
function rigTick(f,dt){const r=f.userData.rig;if(!r||r.type==='proc')return;r.t+=dt*r.spd;const mv=r.act==='walk'?1:r.act==='run'?1.6:0;const ph=r.t*(r.act==='run'?11:7.5),sw=Math.sin(ph)*.55*mv;let p=0;
 if(r.one){r.oneT+=dt;p=Math.min(1,r.oneT/r.oneD);if(p>=1&&r.one!=='death')r.one=null;}
 if(r.type==='biped'){r.legL.rotation.x=sw;r.legR.rotation.x=-sw;if(r.kneeL){r.kneeL.rotation.x=Math.max(0,-sw)*.75;r.kneeR.rotation.x=Math.max(0,sw)*.75;}r.armL.rotation.x=-sw*.85;r.armR.rotation.x=sw*.85;if(r.elbowL){r.elbowL.rotation.x=-.25-Math.max(0,sw)*.5;r.elbowR.rotation.x=-.25-Math.max(0,-sw)*.5;}r.torso.position.y=.95+Math.abs(Math.sin(ph))*.05*mv+Math.sin(r.t*2)*.012;r.torso.rotation.x=mv*.05;r.head.rotation.x=Math.sin(r.t*2)*.04;r.head.rotation.y=Math.sin(r.t*.6)*.08;r.armL.rotation.z=-.1;r.armR.rotation.z=.1;r.torso.rotation.y=0;
  if(r.one==='attack'){const k=Math.sin(p*Math.PI);r.armR.rotation.x=-2.4*k+(p>.5?.6*k:0);r.torso.rotation.y=-.5*k;}
  else if(r.one==='cast'){const k=Math.sin(p*Math.PI);r.armR.rotation.x=r.armL.rotation.x=-2.8*k;}
  else if(r.one==='hit'){r.torso.rotation.x=-.3*Math.sin(p*Math.PI);}
  else if(r.one==='death'){r.body.rotation.x=-Math.PI/2*sstep(0,1,p);r.body.position.y=.2*sstep(0,1,p);}}
 else{r.legs[0].rotation.x=sw;r.legs[3].rotation.x=sw;r.legs[1].rotation.x=-sw;r.legs[2].rotation.x=-sw;if(r.knees){r.knees[0].rotation.x=r.knees[3].rotation.x=Math.max(0,-sw)*.6;r.knees[1].rotation.x=r.knees[2].rotation.x=Math.max(0,sw)*.6;}if(r.ears)r.ears.forEach((e,i)=>{e.rotation.z=(e.userData.z0||0)+Math.sin(r.t*2.7+i*1.7)*.09;e.rotation.x=Math.sin(r.t*3.4+i)*.05;});r.trunk.position.y=(r.ty0??(r.ty0=r.trunk.position.y))+Math.abs(Math.sin(ph))*.045*mv;r.trunk.rotation.z=Math.sin(ph)*.025*mv;r.tail.rotation.y=Math.sin(r.t*(mv?7:3.5))*.5;r.tail.rotation.x=Math.sin(r.t*2.2)*.12;r.head.rotation.x=Math.sin(r.t*2)*.05;r.head.position.z=r.head.userData.z0??(r.head.userData.z0=r.head.position.z);
  if(r.one==='attack'){const k=Math.sin(p*Math.PI);r.head.rotation.x=.5*k;r.head.position.z=r.head.userData.z0+.3*k;r.legs[0].rotation.x=r.legs[1].rotation.x=-.8*k;}
  else if(r.one==='death'){r.body.rotation.z=Math.PI/2*sstep(0,1,p);r.body.position.y=.15*p;}}}
// procedural textures
function canvasTex(draw,rep=1){const c=document.createElement('canvas');c.width=c.height=128;draw(c.getContext('2d'));const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rep,rep);t.colorSpace=THREE.SRGBColorSpace;return t;}
const barkTex=canvasTex(g=>{g.fillStyle='#6b4a2e';g.fillRect(0,0,128,128);for(let i=0;i<70;i++){g.fillStyle=`rgba(${30+Math.random()*40|0},${20+Math.random()*25|0},10,.55)`;g.fillRect(Math.random()*128,0,1+Math.random()*3,128);}for(let i=0;i<20;i++){g.fillStyle='rgba(150,120,90,.3)';g.fillRect(Math.random()*128,Math.random()*128,2,6);}});
const rockTex=canvasTex(g=>{g.fillStyle='#8a8a86';g.fillRect(0,0,128,128);for(let i=0;i<260;i++){const v=90+Math.random()*90|0;g.fillStyle=`rgba(${v},${v},${v-6},.5)`;g.beginPath();g.arc(Math.random()*128,Math.random()*128,1+Math.random()*6,0,7);g.fill();}g.strokeStyle='rgba(40,40,40,.5)';for(let i=0;i<6;i++){g.beginPath();g.moveTo(Math.random()*128,Math.random()*128);g.lineTo(Math.random()*128,Math.random()*128);g.stroke();}});
// hand-held tool mesh
function toolMesh(t){const g=new THREE.Group(),wood=new THREE.MeshStandardMaterial({color:0x7a5230}),st=new THREE.MeshStandardMaterial({color:t.includes('iron')?0xb8c0c8:0x8a8a8a,metalness:t.includes('iron')?.6:0});
 const h=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,t==='spear'?1.6:.7,6),wood);h.position.y=t==='spear'?.5:.2;g.add(h);
 if(t.includes('axe')&&!t.includes('pick')){const b=new THREE.Mesh(new THREE.BoxGeometry(.22,.16,.04),st);b.position.set(.09,.5,0);g.add(b);}
 else if(t.includes('pick')){const b=new THREE.Mesh(new THREE.BoxGeometry(.46,.06,.06),st);b.position.y=.52;g.add(b);}
 else if(t.includes('sword')){h.scale.y=.35;h.position.y=0;const b=new THREE.Mesh(new THREE.BoxGeometry(.07,.8,.02),st);b.position.y=.5;g.add(b);}
 else if(t==='spear'){const b=new THREE.Mesh(new THREE.ConeGeometry(.06,.25,6),st);b.position.y=1.4;g.add(b);}
 else if(t==='torch'){const f=new THREE.Mesh(new THREE.SphereGeometry(.1,8,6),new THREE.MeshBasicMaterial({color:0xffa030}));f.position.y=.6;g.add(f);}
 g.rotation.x=Math.PI/2;return g;}

// ---------- audio ----------
let ac=null;function audio(){if(!ac)try{ac=new(window.AudioContext||window.webkitAudioContext)();}catch(e){}if(ac&&ac.state==='suspended')ac.resume();return ac;}
function tone(f,dur,type='sine',vol=.2,slide=0){if(!audio())return;const o=ac.createOscillator(),g=ac.createGain();o.type=type;o.frequency.value=f;if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(20,slide),ac.currentTime+dur);g.gain.setValueAtTime(vol,ac.currentTime);g.gain.exponentialRampToValueAtTime(.001,ac.currentTime+dur);o.connect(g).connect(ac.destination);o.start();o.stop(ac.currentTime+dur+.02);}
const sfx={chop:()=>tone(180,.08,'square',.12,90),mine:()=>tone(900,.06,'square',.1,600),hit:()=>tone(140,.12,'sawtooth',.15,60),hurt:()=>tone(300,.18,'sawtooth',.15,120),craft:()=>{tone(520,.08,'triangle',.15);setTimeout(()=>tone(780,.12,'triangle',.15),80);},boss:()=>tone(70,.6,'sawtooth',.25,40),win:()=>{tone(392,.18,'sine',.12);setTimeout(()=>tone(330,.22,'sine',.1),140);},eat:()=>tone(260,.1,'sine',.15,320),shoot:()=>tone(700,.1,'triangle',.12,300)};

// ---------- items, slot inventory & grid recipes ----------
const ITEMS={wood:'🪵 Log',planks:'🟫 Planks',stick:'🥢 Stick',stone:'🪨 Stone',fiber:'🌿 Fiber',berries:'🫐 Berries',raw_meat:'🥩 Raw meat',cooked_meat:'🍖 Cooked meat',stew:'🍲 Hearty stew',hide:'🧶 Hide',feather:'🪶 Feather',iron:'⛓️ Iron',gold:'🟡 Gold',crystal:'💎 Ice crystal',obsidian:'⬛ Obsidian',arrows:'➶ Arrow',cactus_fruit:'🌵 Cactus fruit',bandage:'🩹 Bandage',
 spear:'🔱 Spear',bow:'🏹 Bow',hide_armor:'🦺 Hide armor',iron_armor:'🛡️ Iron armor',gold_armor:'🥇 Gold armor',obsidian_armor:'🖤 Obsidian armor',cold_gear:'🧥 Cold gear',heat_gear:'🥵 Heat gear',torch:'🔦 Torch',lantern:'🏮 Lantern',waterskin:'💧 Waterskin',
 campfire:'🔥 Campfire',bench:'🛠️ Crafting bench',tent:'⛺ Tent',bed:'🛏️ Bed',chest:'📦 Chest',fence:'🚧 Fence',wall:'🧱 Stone wall',trap:'🪤 Trap',
 yeti_fang:'🦷 Yeti Fang',vine_heart:'💚 Vine Heart',pharaoh_ankh:'☥ Pharaoh Ankh',magma_core:'🔥 Magma Core',crown:'👑 Crown of Four Realms',
 frost_blade:'❄️ Frost Fang Blade',vine_armor:'🌿 Vine Guard',sun_amulet:'☀️ Sun Amulet',magma_hammer:'🔨 Magma Hammer'};
const TIERS=[['wood','planks','Wooden'],['stone','stone','Stone'],['iron','iron','Iron'],['gold','gold','Gold'],['obsidian','obsidian','Obsidian']];
const TICON={axe:'🪓',pickaxe:'⛏️',sword:'🗡️'};
TIERS.forEach(([t,,n])=>{for(const k of ['axe','pickaxe','sword'])ITEMS[t+'_'+k]=TICON[k]+' '+n+' '+k;});Object.assign(ITEMS,{spike_barricade:'🔺 Spike barricade',gate:'🚪 Stone gate',iron_wall:'🧱 Iron wall',watchtower:'🗼 Watchtower',turret:'🎯 Ballista turret',flame_trap:'♨️ Flame trap',tar_pit:'⚫ Tar pit',bear_trap:'🐻 Bear trap',alarm_bell:'🔔 Alarm bell',shield:'🔰 Shield',scarecrow:'🎃 Scarecrow',trench:'🌊 Water trench',gem:'💎 Gem',torch_post:'🔥 Standing torch',lamp_post:'🏮 Lamp post'});
const ICON=k=>(ITEMS[k]||'❔').split(' ')[0];const nm=k=>ITEMS[k]||k;
const PLACE=['rug','table','flower_pot','sign_post','path_stones','campfire','bench','tent','bed','chest','fence','wall','trap','torch_post','lamp_post','spike_barricade','gate','iron_wall','watchtower','turret','flame_trap','tar_pit','bear_trap','alarm_bell','scarecrow','trench','thorn_wall','guardian_totem'];
const SINGLE=k=>/_(axe|pickaxe|sword|armor)$/.test(k)||['spear','bow','cold_gear','heat_gear','waterskin','lantern','shield','guard_shield','crown','frost_blade','vine_armor','sun_amulet','magma_hammer'].includes(k);
const FOOD={cooked_meat:[35,8],berries:[10,0],raw_meat:[12,-5],cactus_fruit:[15,0],stew:[60,15],healing_fruit:[12,40],berry_pie:[30,15],meat_skewer:[40,10],raw_fish:[8,-3],grilled_fish:[32,12]};
const NSLOT=36;let slots=new Array(NSLOT).fill(null),selHot=0,coins=0;
const cnt=k=>{let n=0;for(const s of slots)if(s&&s.k===k)n+=s.n;return n;};
function addItem(k,n){if(n>0){const mx=SINGLE(k)?1:64;for(const s of slots)if(s&&s.k===k&&s.n<mx){const d=Math.min(n,mx-s.n);s.n+=d;n-=d;if(!n)break;}
  for(let i=0;i<NSLOT&&n>0;i++)if(!slots[i]){const d=Math.min(n,mx);slots[i]={k,n:d};n-=d;}if(n>0)toast('🎒 Bag full! Lost '+n+' '+nm(k));}
 else{n=-n;for(let i=NSLOT-1;i>=0&&n>0;i--){const s=slots[i];if(s&&s.k===k){const d=Math.min(n,s.n);s.n-=d;n-=d;if(!s.n)slots[i]=null;}}}}
let inv=new Proxy({},{get:(_,k)=>typeof k==='string'?(cnt(k)||undefined):undefined,set:(_,k,v)=>{addItem(k,(v|0)-cnt(k));return true;},deleteProperty:(_,k)=>{addItem(k,-cnt(k));return true;},
 has:(_,k)=>cnt(k)>0,ownKeys:()=>[...new Set(slots.filter(Boolean).map(s=>s.k))],getOwnPropertyDescriptor:(_,k)=>cnt(k)>0?{value:cnt(k),enumerable:true,configurable:true,writable:true}:undefined});
let chest={},structs=[];
const has=(k,n=1)=>cnt(k)>=n;const add=(k,n=1)=>{if(k==='coins'){coins+=n;return;}if(k==='heart_piece'){gainHeart(n);return;}addItem(k,n);};
const tierOf=(fam)=>{let b=0;TIERS.forEach(([t],i)=>{if(has(t+'_'+fam))b=i+1;});return b;};
const pickLvl=()=>tierOf('pickaxe');const axeLvl=()=>tierOf('axe');
const WEAP={fists:{d:6,r:1.7},spear:{d:16,r:3},machete:{d:30,r:2.1},trident:{d:44,r:2.7},frost_blade:{d:58,r:2.5},magma_hammer:{d:70,r:2.4},lava_sword:{d:64,r:2.4,burn:1}};
TIERS.forEach(([t],i)=>{WEAP[t+'_sword']={d:[10,16,26,34,46][i],r:2.2+i*.05};WEAP[t+'_axe']={d:[7,9,13,17,22][i],r:1.9};WEAP[t+'_pickaxe']={d:[5,7,10,13,17][i],r:1.9};});
function bestWeapon(){let b='fists';for(const k in WEAP)if(k!=='fists'&&has(k)&&WEAP[k].d>WEAP[b].d)b=k;return b;}
const armorPct=()=>has('vine_armor')?.65:has('obsidian_armor')?.6:has('gold_armor')?.5:has('ember_armor')?.5:has('snow_wolf_armor')?.45:has('iron_armor')?.4:has('thorn_armor')?.35:has('leaf_armor')?.25:has('hide_armor')?.2:0;
// recipes: pattern rows (shaped, mirror ok) or list (shapeless). tier: 0 = 2x2 in bag, 1-4 = bench tier.
const RECIPES=[
 {out:'planks',n:4,list:['wood'],tier:0,d:'1 log → 4 planks'},
 {out:'stick',n:4,pat:['P','P'],key:{P:'planks'},tier:0},
 {out:'torch',n:4,pat:['F','S'],key:{F:'fiber',S:'stick'},tier:0,d:'Light at night'},
 {out:'bench',pat:['PP','PP'],key:{P:'planks'},tier:0,d:'Place it, then upgrade it to tier 4'},
 {out:'bandage',list:['fiber','fiber','berries'],tier:0,d:'Heals 30'},
 {out:'stew',list:['cooked_meat','berries','berries'],tier:0,d:'+60 hunger +15 health'},
 {out:'campfire',pat:[' S ','SWS','RRR'],key:{S:'stick',W:'wood',R:'stone'},tier:1,d:'Fuel it with logs'},
 {out:'chest',pat:['PPP','P P','PPP'],key:{P:'planks'},tier:1},
 {out:'fence',n:3,pat:['SPS','SPS'],key:{S:'stick',P:'planks'},tier:1},
 {out:'spear',pat:['  R',' S ','S  '],key:{R:'stone',S:'stick'},tier:1},
 {out:'bow',pat:[' SF','S F',' SF'],key:{S:'stick',F:'fiber'},tier:1},
 {out:'arrows',n:4,pat:['R','S','E'],key:{R:'stone',S:'stick',E:'feather'},tier:1},
 {out:'waterskin',pat:[' F ','H H',' H '],key:{F:'fiber',H:'hide'},tier:1},
 {out:'tent',pat:[' H ','HFH','S S'],key:{H:'hide',F:'fiber',S:'stick'},tier:1,d:'Sleep & respawn'},
 {out:'wall',n:2,pat:['RR','RR'],key:{R:'stone'},tier:2},
 {out:'trap',pat:['S S','RIR'],key:{S:'stick',R:'stone',I:'iron'},tier:2,d:'Hurts monsters, catches small game'},
 {out:'bed',pat:['HHH','PPP'],key:{H:'hide',P:'planks'},tier:2,d:'Sleep & respawn'},
 {out:'hide_armor',pat:['H H','HHH','HHH'],key:{H:'hide'},tier:2,d:'Blocks 20%'},
 {out:'cold_gear',pat:['H H','HFH','HHH'],key:{H:'hide',F:'fiber'},tier:2,d:'Survive the snow'},
 {out:'iron_armor',pat:['I I','III','III'],key:{I:'iron'},tier:3,d:'Blocks 40%'},
 {out:'heat_gear',pat:['FIF','HHH','FHF'],key:{F:'fiber',I:'iron',H:'hide'},tier:3,d:'Survive desert & lava'},
 {out:'lantern',pat:[' I ','ITI',' I '],key:{I:'iron',T:'torch'},tier:3,d:'Bright light, lasts forever'},
 {out:'gold_armor',pat:['G G','GGG','GGG'],key:{G:'gold'},tier:3,d:'Blocks 50%'},
 {out:'obsidian_armor',pat:['O O','OOO','OOO'],key:{O:'obsidian'},tier:4,d:'Blocks 60%'},
 {out:'frost_blade',pat:['C','Y','S'],key:{C:'crystal',Y:'yeti_fang',S:'stick'},tier:4,d:'58 damage'},
 {out:'vine_armor',pat:['HHH','HVH','HHH'],key:{H:'hide',V:'vine_heart'},tier:4,d:'Blocks 65%'},
 {out:'sun_amulet',pat:['GGG','GAG',' G '],key:{G:'gold',A:'pharaoh_ankh'},tier:4,d:'Fast health regen'},
 {out:'magma_hammer',pat:['OMO',' S ',' S '],key:{O:'obsidian',M:'magma_core',S:'stick'},tier:4,d:'70 damage'}];
const TTIER=[1,1,2,3,4];
TIERS.forEach(([t,m],i)=>{RECIPES.push({out:t+'_axe',pat:['MM','MS',' S'],key:{M:m,S:'stick'},tier:TTIER[i]},{out:t+'_pickaxe',pat:['MMM',' S ',' S '],key:{M:m,S:'stick'},tier:TTIER[i]},{out:t+'_sword',pat:['M','M','S'],key:{M:m,S:'stick'},tier:TTIER[i]});});
RECIPES.push(
 {out:'spike_barricade',pat:['S S','PPP'],key:{S:'stick',P:'planks'},tier:1,d:'Blocks & stabs attackers'},
 {out:'tar_pit',list:['wood','wood','stone','fiber'],tier:1,d:'Enemies wade at 35% speed'},
 {out:'trench',pat:['R R','RRR'],key:{R:'stone'},tier:1,d:'Water moat: enemies slowed to 45%'},
 {out:'scarecrow',pat:[' F ','SFS',' S '],key:{F:'fiber',S:'stick'},tier:1,d:'Decoy: Forest Soldiers attack it first'},
 {out:'gate',pat:['RPR','R R'],key:{R:'stone',P:'planks'},tier:2,d:'Stone gate you can open & close'},
 {out:'watchtower',pat:['PPP','W W','W W'],key:{P:'planks',W:'wood'},tier:2,d:'Climb up: long bow range, safe from melee'},
 {out:'bear_trap',pat:['I I','ITI'],key:{I:'iron',T:'trap'},tier:2,d:'Snaps & roots enemies, re-arms itself'},
 {out:'alarm_bell',pat:['SIS',' I '],key:{S:'stick',I:'iron'},tier:2,d:'Rings when enemies come near'},
 {out:'shield',pat:['PIP','PPP',' P '],key:{P:'planks',I:'iron'},tier:2,d:'Hold Q / right-click to block 65% damage'},
 {out:'iron_wall',pat:['III','I I','III'],key:{I:'iron'},tier:3,d:'Reinforced wall, very tough'},
 {out:'turret',pat:['SIS',' P ','P P'],key:{S:'stick',I:'iron',P:'planks'},tier:3,d:'Auto-fires arrows at enemies (load arrows)'},
 {out:'flame_trap',pat:['ITI','RRR'],key:{I:'iron',T:'torch',R:'stone'},tier:3,d:'Bursts into flame when enemies step close'});
RECIPES.push(
 {out:'machete',pat:[' II',' I ','S  '],key:{I:'iron',S:'stick'},tier:2,d:'Fast jungle blade, 30 dmg'},
 {out:'trident',pat:[' I ','III',' S '],key:{I:'iron',S:'stick'},tier:3,d:'Long reach, 44 dmg'},
 {out:'crossbow',pat:['SIS',' F ','S S'],key:{S:'stick',I:'iron',F:'fiber'},tier:3,d:'Powerful ranged weapon — uses arrows, hits harder than a bow'},
 {out:'leaf_armor',pat:['F F','FFF','FFF'],key:{F:'fiber'},tier:1,d:'Blocks 25% · light forest weave'},
 {out:'snow_wolf_armor',pat:['FHF','HHH','H H'],key:{H:'hide',F:'fiber'},tier:3,d:'Blocks 45% · counts as cold gear in the snow'},
 {out:'ember_armor',pat:['O O','OIO','OOO'],key:{O:'obsidian',I:'iron'},tier:4,d:'Blocks 50% · counts as heat gear in desert & lava'},
 {out:'berry_pie',list:['berries','berries','berries','fiber'],tier:1,d:'+30 hunger, +15 health'},
 {out:'meat_skewer',list:['raw_meat','raw_meat','stick'],tier:1,d:'+40 hunger, +10 health'},
 {out:'grilled_fish',list:['raw_fish','raw_fish'],tier:1,d:'+32 hunger, +12 health — catch fish with a rod!'},
 {out:'heal_tonic',pat:[' B ','BCB',' B '],key:{B:'berries',C:'crystal'},tier:2,d:'Drink: +55 health'},
 {out:'speed_tonic',pat:[' F ','FBF',' F '],key:{F:'feather',B:'berries'},tier:2,d:'Drink: +30% speed for 45 s'},
 {out:'warmth_tonic',pat:[' T ','FBF',' F '],key:{T:'torch',F:'fiber',B:'berries'},tier:2,d:'Drink: warm to the core, cold barely bites for 60 s'},
 {out:'fire_tonic',pat:[' C ','OCO',' C '],key:{C:'cactus_fruit',O:'obsidian'},tier:3,d:'Drink: lava & heat barely hurt for 60 s'},
 {out:'rug',pat:['FFF','FBF'],key:{F:'fiber',B:'berries'},tier:1,d:'Cosy camp decor (walk over it)'},
 {out:'table',pat:['PPP','S S'],key:{P:'planks',S:'stick'},tier:1,d:'Camp decor — step up onto it!'},
 {out:'flower_pot',pat:['R R','FBF',' R '],key:{R:'stone',F:'fiber',B:'berries'},tier:1,d:'A little pot of camp cheer'},
 {out:'sign_post',pat:['P','S','S'],key:{P:'planks',S:'stick'},tier:1,d:'Decor signpost for your camp'},
 {out:'path_stones',n:4,list:['stone','stone'],tier:1,d:'Flat stepping stones (walk over them)'},
 {out:'boss_compass',pat:[' G ','ICI',' G '],key:{G:'gold',I:'iron',C:'crystal'},tier:3,d:'Reveals all four boss lairs on your map'},
 {out:'fishing_rod',pat:['  S',' SF','S  '],key:{S:'stick',F:'fiber'},tier:1,d:'Use at a pond: catch Raw Fish!'},
 {out:'repair_kit',pat:['IFI',' P '],key:{I:'iron',F:'fiber',P:'planks'},tier:2,d:'Use: fully repairs all defences within 14 m'},
 {out:'sled',pat:['PPP','H H'],key:{P:'planks',H:'hide'},tier:2,d:'Glide fast across snow (passive)'});
RECIPES.push({out:'torch_post',pat:['T','S'],key:{T:'torch',S:'stick'},tier:0,d:'Placeable torch, lights itself at dusk'},{out:'lamp_post',pat:['L','I','I'],key:{L:'lantern',I:'iron'},tier:2,d:'Bright lamp post, on at dusk, off at dawn'});
RECIPES.forEach(r=>{if(r.pat){const w=Math.max(...r.pat.map(x=>x.length));r.pat=r.pat.map(x=>x.padEnd(w,' '));r.w=w;r.h=r.pat.length;}else{r.w=r.list.length>1?2:1;r.h=r.list.length>2?2:1;}});
const BENCH_UP=[null,{stone:12,planks:8},{iron:10,hide:6},{gold:8,obsidian:6,crystal:4}];
function trimGrid(g,n){let r0=n,r1=-1,c0=n,c1=-1;for(let r=0;r<n;r++)for(let c=0;c<n;c++)if(g[r*n+c]){r0=Math.min(r0,r);r1=Math.max(r1,r);c0=Math.min(c0,c);c1=Math.max(c1,c);}if(r1<0)return null;const rows=[];for(let r=r0;r<=r1;r++){const row=[];for(let c=c0;c<=c1;c++)row.push(g[r*n+c]?.k||null);rows.push(row);}return rows;}
function matchGrid(g,n,tier){const rows=trimGrid(g,n);if(!rows)return null;const flat=rows.flat().filter(Boolean).sort().join(',');
 for(const r of RECIPES){if(r.tier>tier)continue;if(r.list){if([...r.list].sort().join(',')===flat)return r;continue;}if(rows.length!==r.h||rows[0].length!==r.w)continue;
  for(const mir of [0,1]){let ok=true;for(let y=0;y<r.h&&ok;y++)for(let x=0;x<r.w;x++){const ch=r.pat[y][mir?r.w-1-x:x],want=ch===' '?null:r.key[ch];if(want!==rows[y][x]){ok=false;break;}}if(ok)return r;}}return null;}
function recipeNeeds(r){const need={};if(r.list)for(const k of r.list)need[k]=(need[k]||0)+1;else for(const row of r.pat)for(const ch of row)if(ch!==' ')need[r.key[ch]]=(need[r.key[ch]]||0)+1;return need;}

// ---------- resources (instanced) ----------
const RES=[];const GRID=new Map(),GC=8;const gk=(x,z)=>Math.floor(x/GC)*10007+Math.floor(z/GC);
function gridAdd(o){const k=gk(o.x,o.z);let a=GRID.get(k);if(!a)GRID.set(k,a=[]);a.push(o);}
function near(x,z,r){const out=[];for(let i=Math.floor((x-r)/GC);i<=Math.floor((x+r)/GC);i++)for(let j=Math.floor((z-r)/GC);j<=Math.floor((z+r)/GC);j++){const a=GRID.get(i*10007+j);if(a)for(const o of a)out.push(o);}return out;}
const RTYPES={tree:{hp:10,r:.7},rock:{hp:4,r:1,pick:1},iron:{hp:5,r:1,pick:2},gold:{hp:5,r:1,pick:3},crystal:{hp:6,r:1,pick:3},obsidian:{hp:6,r:1,pick:4},pebble:{hp:1,r:.3},bush:{hp:2,r:.6},cactus:{hp:3,r:.5}};
function genRes(){const per=(type,n,biomes)=>{let k=0,g=0;while(k<n&&g++<n*30){const x=(R()*2-1)*(W-8),z=(R()*2-1)*(W-8),b=biomeAt(x,z);if(!biomes.includes(b))continue;if(nearSpecial(x,z,type==='tree'?2:0))continue;RES.push({id:RES.length,type,x,z,b,hp:RTYPES[type].hp,alive:true,s:.8+R()*.6,rot:R()*6});k++;}};
 per('tree',380,['forest']);per('tree',220,['snow']);per('tree',320,['jungle']);per('tree',90,['desert']);per('tree',120,['lava']);
 per('rock',90,['forest']);per('rock',90,['snow']);per('rock',60,['jungle']);per('rock',80,['desert']);per('rock',80,['lava']);
 per('iron',35,['forest']);per('iron',40,['snow']);per('gold',35,['desert']);per('gold',15,['jungle']);per('crystal',40,['snow']);per('obsidian',55,['lava']);
 per('pebble',160,['forest']);per('pebble',60,['snow','jungle','desert','lava']);per('bush',200,['forest','jungle']);per('bush',30,['snow']);per('cactus',120,['desert']);
 // guaranteed starter materials near spawn
 for(let i=0;i<10;i++){const a=i/10*6.28;RES.push({id:RES.length,type:i%2?'pebble':'bush',x:Math.cos(a)*(11+i%3),z:Math.sin(a)*(11+i%3),b:'forest',hp:RTYPES[i%2?'pebble':'bush'].hp,alive:true,s:1,rot:a});}
 for(let i=0;i<8;i++){const a=i/8*6.28+.3;RES.push({id:RES.length,type:'tree',x:Math.cos(a)*17,z:Math.sin(a)*17,b:'forest',hp:10,alive:true,s:1,rot:a});}
 for(const o of RES)gridAdd(o);}
genRes();
const IM={};const M4=new THREE.Matrix4(),Q=new THREE.Quaternion(),V=new THREE.Vector3(),S=new THREE.Vector3(),C=new THREE.Color();
function mkIM(name,geo,mat,list,place){const m=new THREE.InstancedMesh(geo,mat,list.length);m.castShadow=true;m.receiveShadow=true;list.forEach((o,i)=>{(o.im||(o.im=[])).push([m,i]);place(o,i,m);});m.instanceMatrix.needsUpdate=true;if(m.instanceColor)m.instanceColor.needsUpdate=true;scene.add(m);IM[name]=m;return m;}
function setM(m,i,x,y,z,sx,sy,sz,ry=0){Q.setFromAxisAngle(V.set(0,1,0),ry);m.setMatrixAt(i,M4.compose(V.set(x,y,z),Q,S.set(sx,sy,sz)));}
function buildRes(){const trees=RES.filter(o=>o.type==='tree');
 const barkM=HQ?new THREE.MeshStandardMaterial({map:ltex('bark_c',1),normalMap:ltex('bark_n',1,false),roughness:.95}):new THREE.MeshStandardMaterial({map:barkTex,roughness:.9});
 mkIM('trunk',new THREE.CylinderGeometry(.22,.32,1,7).translate(0,.5,0),barkM,trees,(o,i,m)=>{const h=o.b==='jungle'?6:o.b==='snow'?2.2:o.b==='lava'?3.2:3;setM(m,i,o.x,H(o.x,o.z)-.1,o.z,o.s*(o.b==='jungle'?1.2:1),h*o.s,o.s*(o.b==='jungle'?1.2:1),o.rot);m.setColorAt(i,C.setHex(o.b==='lava'?0x333030:o.b==='desert'?0xb09070:0xffffff));});
 const pines=trees.filter(o=>o.b==='snow'||(o.b==='forest'&&o.id%3===0)),rounds=trees.filter(o=>!pines.includes(o));
 mkIM('pine',HQ?pineGeo():new THREE.ConeGeometry(1.5,4,8).translate(0,2,0),new THREE.MeshStandardMaterial({roughness:.85,flatShading:!HQ}),pines,(o,i,m)=>{setM(m,i,o.x,H(o.x,o.z)+(o.b==='snow'?1.6:2)*o.s,o.z,o.s,o.s*1.1,o.s,o.rot);m.setColorAt(i,C.setHex(o.b==='snow'?0x9fb8a8:0x2f6a3a));});
 mkIM('round',crownGeo(),new THREE.MeshStandardMaterial({roughness:.85,flatShading:!HQ}),rounds,(o,i,m)=>{const b=o.b;const y=b==='jungle'?6.2:b==='lava'?3.2:3.6;const sx=b==='jungle'?1.5:b==='desert'?1.5:b==='lava'?.5:1,sy=b==='desert'?.35:b==='jungle'?.7:b==='lava'?.4:1;setM(m,i,o.x,H(o.x,o.z)+y*o.s,o.z,sx*o.s,sy*o.s,sx*o.s,o.rot);m.setColorAt(i,C.setHex(b==='jungle'?0x1f8a2a:b==='desert'?0x7a8a3a:b==='lava'?0xff5a1a:(o.id%2?0x4a9a3a:0x3d8a32)));});
 const rockM=HQ?new THREE.MeshStandardMaterial({map:ltex('rock_c',1),normalMap:ltex('rock_n',1,false),roughness:.85}):new THREE.MeshStandardMaterial({map:rockTex,roughness:.9,flatShading:true});
 const rocks=RES.filter(o=>['rock','iron','gold','crystal','obsidian'].includes(o.type));
 const RC={rock:0xffffff,iron:0xd08a60,gold:0xffd040,crystal:0x8fe8ff,obsidian:0x40304a};
 mkIM('rock',new THREE.DodecahedronGeometry(1,0),rockM,rocks,(o,i,m)=>{setM(m,i,o.x,H(o.x,o.z)+.3,o.z,o.s*1.1,o.s*.8,o.s,o.rot);m.setColorAt(i,C.setHex(o.b==='snow'&&o.type==='rock'?0xe8eef5:o.b==='lava'&&o.type==='rock'?0x6a5a55:RC[o.type]));});
 const ores=rocks.filter(o=>o.type!=='rock');
 mkIM('ore',new THREE.OctahedronGeometry(.28,0),new THREE.MeshStandardMaterial({roughness:.3,metalness:.4,emissiveIntensity:.5}),ores,(o,i,m)=>{setM(m,i,o.x,H(o.x,o.z)+.3+o.s*.8,o.z,1,1.3,1,o.rot);m.setColorAt(i,C.setHex(RC[o.type]));});
 mkIM('pebble',new THREE.DodecahedronGeometry(.28,0),rockM,RES.filter(o=>o.type==='pebble'),(o,i,m)=>setM(m,i,o.x,H(o.x,o.z)+.08,o.z,1,.6,1,o.rot));
 const bushes=RES.filter(o=>o.type==='bush');
 mkIM('bush',new THREE.IcosahedronGeometry(.8,1),new THREE.MeshStandardMaterial({roughness:.9,flatShading:true}),bushes,(o,i,m)=>{setM(m,i,o.x,H(o.x,o.z)+.4,o.z,o.s,o.s*.75,o.s,o.rot);m.setColorAt(i,C.setHex(o.b==='snow'?0x6a8a6a:0x3a7a2a));});
 mkIM('berry',new THREE.SphereGeometry(.13,6,5),new THREE.MeshStandardMaterial({color:0x7a2ad0}),bushes,(o,i,m)=>setM(m,i,o.x+.4*o.s,H(o.x,o.z)+.75*o.s,o.z+.3,1,1,1));
 mkIM('cactus',new THREE.CylinderGeometry(.3,.35,2.4,8).translate(0,1.2,0),new THREE.MeshStandardMaterial({color:0x4a8a3a,roughness:.8}),RES.filter(o=>o.type==='cactus'),(o,i,m)=>setM(m,i,o.x,H(o.x,o.z)-.1,o.z,o.s,o.s,o.s,o.rot));
 if(HQ){const lt=leafTex(),lm=new THREE.MeshStandardMaterial({map:lt,alphaTest:.45,side:THREE.DoubleSide,roughness:.8});lm.onBeforeCompile=sh=>{sh.uniforms.uTime=gUni.uTime;sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nuniform float uTime;').replace('#include <begin_vertex>','#include <begin_vertex>\nvec4 ip=instanceMatrix[3];transformed.x+=sin(uTime*1.3+ip.x*.2)*.08*(position.y+.5);');};
  const cg=new THREE.PlaneGeometry(1.6,1.6);const cross=new THREE.BufferGeometry().copy(cg);{const g2=cg.clone().rotateY(Math.PI/2);const m=new THREE.Mesh();cross.setAttribute('position',new THREE.Float32BufferAttribute([...cg.attributes.position.array,...g2.attributes.position.array],3));cross.setAttribute('uv',new THREE.Float32BufferAttribute([...cg.attributes.uv.array,...g2.attributes.uv.array],2));cross.setAttribute('normal',new THREE.Float32BufferAttribute([...cg.attributes.normal.array,...g2.attributes.normal.array],3));const ix=[...cg.index.array];cross.setIndex([...ix,...ix.map(v=>v+4)]);}
  const lt2=trees.filter(o=>o.b!=='lava');const K=GQ==='high'?6:3;for(let k=0;k<K;k++)mkIM('leaf'+k,cross,lm,lt2,(o,i,m)=>{const pine=pines.includes(o);const a=k/K*6.28+o.rot,b=o.b;const y=pine?(b==='snow'?1.6:2)*o.s+1+k%3*.9:(b==='jungle'?6.2:3.6)*o.s+(k%2?.6:-.3);const r=pine?(1.4-(k%3)*.4)*o.s:(b==='jungle'?2.2:b==='desert'?2:1.5)*o.s;const sc=(pine?1:1.3)*o.s;setM(m,i,o.x+Math.cos(a)*r,H(o.x,o.z)+y,o.z+Math.sin(a)*r,sc,sc,sc,a);m.setColorAt(i,C.setHex(b==='snow'?0xa8c0b0:b==='jungle'?0x40a038:b==='desert'?0x8a9a48:pine?0x3a6a3a:0x5aa040));});}
 for(const k in IM)IM[k].computeBoundingSphere();}
function crownGeo(){const g=new THREE.IcosahedronGeometry(1.8,HQ?3:1);if(HQ){const p=g.attributes.position;for(let i=0;i<p.count;i++){V.fromBufferAttribute(p,i);const n=1+.13*Math.sin(V.x*2.1+V.y*1.3)*Math.cos(V.z*1.9)+.07*Math.sin(V.x*5+V.z*4);V.multiplyScalar(n);p.setXYZ(i,V.x,V.y,V.z);}g.computeVertexNormals();}return g;}
function pineGeo(){const parts=[];const g=new THREE.BufferGeometry();const geos=[0,1,2].map(i=>new THREE.ConeGeometry(1.6-i*.4,1.8,12).translate(0,.9+i*1.1,0));let pos=[],nor=[],idx=[],off=0;for(const c of geos){const ci=c.toNonIndexed();pos.push(...ci.attributes.position.array);nor.push(...ci.attributes.normal.array);}g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));return g;}
function leafTex(){const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');for(let i=0;i<70;i++){const x=64+(Math.random()-.5)*100,y=64+(Math.random()-.5)*100;if(Math.hypot(x-64,y-64)>56)continue;const v=150+Math.random()*90|0;g.fillStyle=`rgb(${v*.8|0},${v},${v*.6|0})`;g.save();g.translate(x,y);g.rotate(Math.random()*6.28);g.beginPath();g.ellipse(0,0,4+Math.random()*4,9+Math.random()*5,0,0,7);g.fill();g.restore();}const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;}
buildRes();
function hideRes(o){for(const [m,i] of o.im||[]){m.setMatrixAt(i,M4.makeScale(0,0,0));m.instanceMatrix.needsUpdate=true;}}
function showRes(o){o.alive=true;o.hp=RTYPES[o.type].hp;o.respawnAt=0;// rebuild matrix by simple re-place
 for(const [m,i] of o.im||[])m.setMatrixAt(i,o.mat0?.[m.uuid]||M4.identity());for(const [m] of o.im||[])m.instanceMatrix.needsUpdate=true;}
for(const o of RES)if(o.im){o.mat0={};for(const [m,i] of o.im){const mm=new THREE.Matrix4();m.getMatrixAt(i,mm);o.mat0[m.uuid]=mm;}}

// ---------- villages (houses, shop stalls, wells, fences, gardens, signs, lamps) ----------
const NPCS=[];const LAMPS=[],WINDOWS=[];
const winMat=new THREE.MeshStandardMaterial({color:0x334455,emissive:new THREE.Color(0xffb050),emissiveIntensity:0});
const lampMat=new THREE.MeshStandardMaterial({color:0xfff0c0,emissive:new THREE.Color(0xffc060),emissiveIntensity:.2});
const VSTYLE={forest:{wall:0xe8dcc0,roof:0xa0402a,trim:0x6a4a2a},snow:{wall:0x8a6a4a,roof:0xf4f8ff,trim:0x4a3020},jungle:{wall:0xc8a070,roof:0x6a8a2a,trim:0x5a3a1a},desert:{wall:0xe8d0a0,roof:0xc89050,trim:0x8a5a30},lava:{wall:0x5a4a48,roof:0x2a1a18,trim:0x8a2a1a}};
function signTex(text){const c=document.createElement('canvas');c.width=256;c.height=96;const g=c.getContext('2d');g.fillStyle='#8a5a30';g.fillRect(0,0,256,96);g.strokeStyle='#4a2a10';g.lineWidth=8;g.strokeRect(4,4,248,88);g.fillStyle='#fff8e0';g.font='bold 34px Georgia,serif';g.textAlign='center';g.textBaseline='middle';g.fillText(text,128,50);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;}
function addObj(g,x,z,ry=0){g.position.set(x,H(x,z),z);g.rotation.y=ry;g.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});scene.add(g);return g;}
function house(v,x,z,ry,shop){const S=VSTYLE[v.biome],g=new THREE.Group(),wall=mat(S.wall,{r:.9}),roof=mat(S.roof,{r:.7}),trim=mat(S.trim);
 part(g,BX,wall,0,1.25,0,4,2.5,3.4);const rf=new THREE.Mesh(new THREE.CylinderGeometry(.01,2.6,1.8,4,1),roof);rf.rotation.y=Math.PI/4;rf.scale.set(1.15,1,.95);rf.position.y=3.4;rf.castShadow=true;g.add(rf);
 part(g,BX,trim,0,.08,0,4.2,.16,3.6);part(g,BX,mat(0x5a3418),0,.8,1.71,.9,1.6,.06);part(g,SP,mat(0xd4af37,{m:.6}),.3,.8,1.76,.05,.05,.05);
 for(const sx of[-1.3,1.3]){part(g,BX,winMat,sx,1.5,1.71,.7,.6,.05);WINDOWS.push(1);part(g,BX,trim,sx,1.5,1.74,.8,.08,.06);}
 part(g,BX,mat(0x7a6a60),1.1,3.6,-.6,.4,1.2,.4);
 if(shop){const aw=part(g,BX,mat(0xd04040),0,2.3,2.3,3.6,.1,1.4);aw.rotation.x=.25;part(g,BX,mat(S.trim),0,.55,2.9,3,1.1,.6);for(const sx of[-1.6,1.6])part(g,CY,trim,sx,1.2,2.9,.06,2.3,.06);}
 addObj(g,x,z,ry);structs.push({type:'house',x,z,perm:1,mesh:g});return g;}
function buildVillages(){for(const v of VILLAGES){const S=VSTYLE[v.biome];v.houses=[];const N=5;
 for(let i=0;i<N;i++){const a=i/N*Math.PI*2+.3,x=v.x+Math.cos(a)*10,z=v.z+Math.sin(a)*10,ry=Math.atan2(v.x-x,v.z-z);house(v,x,z,ry,i===0);v.houses.push({x:x+Math.sin(ry)*2.4,z:z+Math.cos(ry)*2.4,ry});}
 v.shop=v.houses[0];
 // well
 {const g=new THREE.Group(),st=mat(0x9a9a9a,{r:.9});const ring=new THREE.Mesh(new THREE.CylinderGeometry(1,1.05,.9,14,1,true),st);ring.position.y=.45;g.add(ring);part(g,CY,mat(0x2a5a8a,{r:.1}),0,.5,0,.95,.05,.95);for(const s of[-1,1])part(g,BX,mat(0x6a4a2a),s*.9,1.3,0,.12,1.7,.12);const r=new THREE.Mesh(new THREE.ConeGeometry(1.4,.8,4),mat(S.roof));r.rotation.y=Math.PI/4;r.position.y=2.5;g.add(r);addObj(g,v.x+2.5,v.z-2.5);structs.push({type:'well',x:v.x+2.5,z:v.z-2.5,perm:1});v.well={x:v.x+2.5,z:v.z-2.5};}
 // gardens
 for(const [gx,gz] of [[-5,-5],[5,5]]){const g=new THREE.Group();part(g,BX,mat(0x5a3a22,{r:1}),0,.08,0,3,.16,2);const crop=mat(v.biome==='desert'?0x9aa040:v.biome==='snow'?0x7a9a8a:0x4aa040);for(let i=0;i<3;i++)for(let j=0;j<5;j++){part(g,SP,crop,-1.1+j*.55,.3,-.6+i*.6,.18,.25,.18);if((i+j)%3===0)part(g,SP,mat(0xe04030),-1.1+j*.55,.45,-.6+i*.6,.07,.07,.07);}addObj(g,v.x+gx,v.z+gz);}
 // fence ring with gaps
 const fm=mat(0xb08a5a);for(let i=0;i<40;i++){const a=i/40*Math.PI*2;if(i%10<2)continue;const x=v.x+Math.cos(a)*16,z=v.z+Math.sin(a)*16;const g=new THREE.Group();part(g,BX,fm,0,.5,0,.12,1,.12);part(g,BX,fm,0,.75,0,2.5,.1,.06);part(g,BX,fm,0,.4,0,2.5,.1,.06);addObj(g,x,z,-a);}
 // signpost & lamps
 {const g=new THREE.Group();part(g,BX,mat(0x6a4a2a),0,1,0,.15,2,.15);const sg=new THREE.Mesh(new THREE.PlaneGeometry(1.8,.68),new THREE.MeshStandardMaterial({map:signTex(v.name),side:THREE.DoubleSide}));sg.position.y=1.8;g.add(sg);const a=0;addObj(g,v.x+Math.cos(a)*17.5,v.z+Math.sin(a)*17.5+1.5,Math.PI/2);}
 for(let i=0;i<4;i++){const a=i/4*Math.PI*2+Math.PI/4,x=v.x+Math.cos(a)*6,z=v.z+Math.sin(a)*6;const g=new THREE.Group();part(g,CY,mat(0x2a2a2a,{m:.5}),0,1.3,0,.06,2.6,.06);part(g,BX,mat(0x2a2a2a),0,2.7,0,.35,.08,.35);part(g,SP,lampMat,0,2.5,0,.18,.22,.18);addObj(g,x,z);LAMPS.push({x,z});}
 const f=new THREE.Mesh(new THREE.ConeGeometry(.5,.9,6),new THREE.MeshBasicMaterial({color:0xff8a20}));}}
// ---------- villagers: names, personalities, schedules, quests, rumors, shops ----------
const PEOPLE={
 oak:[{id:'rowan',name:'Elder Rowan',role:'elder',pers:'wise',look:{skin:0xf0c8a0,shirt:0x3a6a3a,hair:0xe0e0e0,hat:'hood',cape:0x5a2a6a},barks:['The forest remembers kindness.','Keep your fire fed, young one.']},
  {id:'mabel',name:'Mabel',role:'shop',pers:'cheerful',look:{skin:0xe0ac69,shirt:0xd06a8a,hair:0x8a3a1a},barks:['Fresh goods! Come take a peek!','Oh, hello there, sunshine!']},
  {id:'pip',name:'Pip',role:'folk',pers:'excited',look:{skin:0xf4d0b0,shirt:0xe0b020,hair:0xd08a30,scale:.75},barks:['Wanna see me do a cartwheel?!','I saw a BEAR once! Huge!'],side:{t:'fetch',item:'berries',n:5,title:'Berry Snack',txt:'I’m sooo hungry. Could you bring me 5 berries? Pleeease?',rew:{heart_piece:1,coins:5}}},
  {id:'bram',name:'Old Bram',role:'folk',pers:'grumpy',look:{skin:0xc68642,shirt:0x7a4a2a,hair:0x9a9a9a,bulk:1.2},barks:['Hmph. Mind the woodpile.','Back in my day, axes were heavier.'],side:{t:'fetch',item:'planks',n:15,title:'Woodpile',txt:'My back’s aching. Bring me 15 planks, and I’ll pay you fair.',rew:{coins:25,stone_axe:1}},rumor:'all'}],
 frost:[{id:'yrsa',name:'Elder Yrsa',role:'elder',pers:'stern',look:{skin:0xf4dcc8,shirt:0x4a6ad0,hair:0xffffff,hat:'fur'},barks:['Cold tests the weak.','Wear fur, or the mountain takes you.']},
  {id:'sven',name:'Sven',role:'shop',pers:'gruff',look:{skin:0xf0c8a0,shirt:0x6a3a2a,hair:0xd0a040,hat:'fur',bulk:1.25},barks:['Furs. Stew. Iron. You buy?','Hrm.']},
  {id:'lumi',name:'Lumi',role:'folk',pers:'dreamy',look:{skin:0xf8e0d0,shirt:0xa0c0f0,hair:0xf0f0ff,hat:'fur'},barks:['The ice crystals sing at night…','Do you ever look at the aurora?'],side:{t:'fetch',item:'crystal',n:3,title:'Singing Crystals',txt:'Could you find me 3 ice crystals? I want to hear them sing.',rew:{heart_piece:1,coins:20}},rumor:'yeti'},
  {id:'tobbe',name:'Tobbe',role:'folk',pers:'nervous',look:{skin:0xf0c8a0,shirt:0x8a8a5a,hair:0x6a3a1a,hat:'fur'},barks:['D-did you hear that?','Foxes keep stealing my fish!'],side:{t:'hunt',kind:'snow_fox',n:3,title:'Fish Thieves',txt:'Th-three snow foxes keep raiding my fish. Could you…deal with them?',rew:{coins:30,cooked_meat:3}}}],
 vine:[{id:'ama',name:'Elder Ama',role:'elder',pers:'warm',look:{skin:0x8d5524,shirt:0x2a8a4a,hair:0x1a1a1a,hat:'leaves'},barks:['The jungle breathes with us.','Welcome, child of the forest.']},
  {id:'kofi',name:'Kofi',role:'shop',pers:'jokey',look:{skin:0x7a4a2a,shirt:0xe08020,hair:0x1a1a1a},barks:['Why did the parrot cross the road? To get to my shop!','Bows! Arrows! Bad jokes!']},
  {id:'zuri',name:'Zuri',role:'folk',pers:'curious',look:{skin:0x9a6a3a,shirt:0x8a4ad0,hair:0x2a1a0a,hat:'leaves'},barks:['This leaf has seven veins! Fascinating!','Have you seen a blue orchid?'],side:{t:'fetch',item:'fiber',n:8,title:'Plant Samples',txt:'I’m cataloguing jungle plants. Bring me 8 fiber samples?',rew:{heart_piece:1,coins:10}}},
  {id:'taro',name:'Taro',role:'folk',pers:'brave',look:{skin:0xc68642,shirt:0xa04020,hair:0x1a1a1a,bulk:1.15},barks:['I fear nothing! …except snakes.','Adventure calls!'],side:{t:'hunt',kind:'tiger',n:2,title:'Tiger Trouble',txt:'Two tigers prowl near the river. Prove your courage!',rew:{heart_piece:1,coins:25}},rumor:'vine'}],
 sand:[{id:'hesper',name:'Elder Hesper',role:'elder',pers:'mysterious',look:{skin:0xc49a5a,shirt:0xf0e0c0,hair:0x2a2a2a,hat:'straw'},barks:['The sands shift, but truth remains.','Water is worth more than gold here.']},
  {id:'rashid',name:'Rashid',role:'shop',pers:'haggler',look:{skin:0xb0804a,shirt:0x2a4a8a,hair:0x1a1a1a,hat:'straw'},barks:['Best prices in the desert! Probably!','For you, my friend, a special deal!']},
  {id:'nia',name:'Nia',role:'folk',pers:'shy',look:{skin:0xa06a3a,shirt:0xe06a4a,hair:0x1a0a0a},barks:['…oh! Hi.','I like the quiet of the dunes.'],side:{t:'fetch',item:'cactus_fruit',n:4,title:'Cactus Jam',txt:'Um… I’m making cactus jam. Could you bring 4 cactus fruits?',rew:{heart_piece:1,coins:15}}},
  {id:'odo',name:'Odo the Storyteller',role:'folk',pers:'dramatic',look:{skin:0xd0a070,shirt:0x8a2a6a,hair:0xb0b0b0,hat:'straw'},barks:['Gather round for a TALE!','Legends whisper on the wind…'],side:{t:'hunt',kind:'vulture',n:3,title:'Circling Shadows',txt:'Vultures circle my tent, waiting for a tragic ending! Chase off 3!',rew:{coins:30,waterskin:1}},rumor:'pharaoh'}],
 ember:[{id:'vulka',name:'Elder Vulka',role:'elder',pers:'fierce',look:{skin:0xd09070,shirt:0x8a2a1a,hair:0x2a1a1a,hat:'hood'},barks:['Fire forges the strong.','The mountain rumbles. It is angry.']},
  {id:'brann',name:'Brann the Smith',role:'shop',pers:'proud',look:{skin:0xc68642,shirt:0x3a3a3a,hair:0xd04010,bulk:1.3},barks:['Finest steel this side of the lava!','My hammer never misses.']},
  {id:'cinder',name:'Cinder',role:'folk',pers:'playful',look:{skin:0xf0c0a0,shirt:0xff8a20,hair:0xff4020},barks:['Tag! You’re it!','I can juggle hot coals. Wanna see?'],side:{t:'fetch',item:'gold',n:2,title:'Shiny Things',txt:'I collect shiny things! Got 2 gold for me?',rew:{heart_piece:1,coins:10}}},
  {id:'ash',name:'Ash',role:'folk',pers:'quiet',look:{skin:0xb0a090,shirt:0x4a4a4a,hair:0x1a1a1a,hat:'hood'},barks:['…','The salamanders grow bolder.'],side:{t:'hunt',kind:'salamander',n:3,title:'Ember Pests',txt:'Salamanders. Three of them. Near my forge. …Please.',rew:{heart_piece:1,coins:20}},rumor:'titan'}]};
const MAINQ={
 oak:[{t:'fetch',item:'wood',n:10,title:'Dying Fires',txt:'Our fires are dying! Bring 10 logs.',rew:{cooked_meat:4,iron:2,coins:15}},{t:'hunt',kind:'wolf',n:3,title:'Wolf Pack',txt:'Wolves keep attacking our village. Hunt 3 wolves.',rew:{bow:1,arrows:12,coins:20,heart_piece:1},reveal:'all'}],
 frost:[{t:'hunt',kind:'polar_bear',n:2,title:'Bear Pass',txt:'Defeat 2 polar bears so our hunters can travel.',rew:{crystal:2,coins:25},reveal:'yeti'},{t:'boss',boss:'yeti',title:'The Yeti King',txt:'Defeat the Yeti King in the northern peaks!',rew:{gold:5,coins:60}}],
 vine:[{t:'fetch',item:'feather',n:5,title:'Feathers',txt:'Bring me 5 feathers from the jungle parrots.',rew:{arrows:10,coins:20},reveal:'vine'},{t:'boss',boss:'vine',title:'The Vine Queen',txt:'The Vine Queen is choking the jungle. Defeat her!',rew:{gold:6,coins:60}}],
 sand:[{t:'hunt',kind:'scorpion',n:4,title:'Scorpion Nest',txt:'Scorpions! Hunt 4 of them.',rew:{waterskin:1,coins:25},reveal:'pharaoh'},{t:'boss',boss:'pharaoh',title:'The Sand Pharaoh',txt:'Defeat the Sand Pharaoh in the southern dunes.',rew:{iron:6,coins:60}}],
 ember:[{t:'fetch',item:'obsidian',n:4,title:'Forge Stone',txt:'Mine 4 obsidian for our forge (needs a gold pickaxe).',rew:{iron:4,coins:30},reveal:'titan'},{t:'boss',boss:'titan',title:'The Magma Titan',txt:'The Magma Titan stirs in the west. End it!',rew:{gold:8,coins:80}}]};
const SHOP={oak:{cooked_meat:6,bandage:10,arrows:2,torch:2,stone_axe:15,stone_pickaxe:15,iron:12},frost:{cold_gear:60,stew:15,crystal:25,iron:12,hide:8},vine:{bow:30,arrows:2,feather:4,berries:1,bandage:10},sand:{heat_gear:80,waterskin:25,cactus_fruit:4,gold:20,stew:15},ember:{iron_pickaxe:60,gold_pickaxe:120,obsidian:25,lantern:50,stew:15}};
const SELL={gem:20,wood:1,planks:1,stick:0,stone:1,fiber:1,berries:1,raw_meat:2,cooked_meat:3,hide:4,feather:2,iron:6,gold:10,crystal:12,obsidian:12,cactus_fruit:2,arrows:1,yeti_fang:0};
let quests={},revealed={},kills={},bossDone={};
function markerTex(ch,col){const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');g.font='bold 56px sans-serif';g.textAlign='center';g.textBaseline='middle';g.lineWidth=8;g.strokeStyle='#000';g.strokeText(ch,32,34);g.fillStyle=col;g.fillText(ch,32,34);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;}
const MK={'!':new THREE.SpriteMaterial({map:markerTex('!','#ffd400'),depthTest:false}),'?':new THREE.SpriteMaterial({map:markerTex('?','#ffd400'),depthTest:false}),'~':new THREE.SpriteMaterial({map:markerTex('?','#aaaaaa'),depthTest:false})};
function spawnNPCs(){for(const v of VILLAGES)PEOPLE[v.id].forEach((pd,i)=>{const f=makeHuman({...pd.look,face:pd.look.face||({cheerful:'happy',excited:'happy',grumpy:'brave',stern:'brave',dreamy:'sleepy',nervous:'shy'})[pd.pers]||''});const home=v.houses[(i+1)%v.houses.length];let x=v.x+rnd(-4,4),z=v.z+rnd(-4,4);if(pd.role==='shop'){x=v.shop.x+Math.sin(v.shop.ry)*1.2;z=v.shop.z+Math.cos(v.shop.ry)*1.2;}
 f.position.set(x,H(x,z),z);scene.add(f);const sp=new THREE.Sprite(MK['!']);sp.scale.set(.9,.9,.9);sp.position.y=(pd.look.scale||1)*2.3;sp.visible=false;f.add(sp);
 NPCS.push({...pd,v,x,z,fig:f,marker:sp,home,tx:x,tz:z,wait:rnd(0,3),inside:false,dir:0});});}
function npcQuest(n){const st=quests[n.id]||{i:0,active:false};if(n.role==='elder'){const q=MAINQ[n.v.id][st.i];return q?{q,st}:null;}if(n.side){return st.i<1?{q:n.side,st}:null;}return null;}
function qProg(q,st){if(q.t==='fetch')return Math.min(cnt(q.item),q.n);if(q.t==='hunt')return Math.min((kills[q.kind]||0)-(st.k0||0),q.n);if(q.t==='boss')return bossDone[q.boss]?1:0;return 0;}
const qNeed=q=>q.t==='boss'?1:q.n;
const qDesc=q=>q.t==='boss'?'Defeat '+BOSSES.find(b=>b.id===q.boss).name:q.t==='fetch'?'Bring '+q.n+' '+nm(q.item):'Hunt '+q.n+' '+q.kind.replace('cultist_torch','Forest Torchbearer').replace('cultist_shaman','Forest Mage').replace('cultist','Forest Scout').replace('_',' ')+(q.n>1?'s':'');
function questList(){const out=[];for(const n of NPCS){const st=quests[n.id];if(!st)continue;const list=n.role==='elder'?MAINQ[n.v.id]:n.side?[n.side]:[];list.forEach((q,i)=>{if(i<st.i)out.push({title:q.title,giver:n.name+' · '+n.v.name,desc:qDesc(q),done:true});else if(i===st.i&&st.active){const p=qProg(q,st);out.push({title:q.title,giver:n.name+' · '+n.v.name,desc:qDesc(q),prog:p+'/'+qNeed(q),ready:p>=qNeed(q)});}});}for(const k of KIDS){const st=kidState[k.id];out.push({title:'🧒 Lost kid: '+k.name+' ('+BIOME[k.biome].n+')',giver:k.village,desc:st.stage==='rescued'?'Rescued! Reward received: '+ITEMS[k.reward]:st.stage==='follow'?k.name+' is following you — lead them out of the cave into daylight!':st.hinted?'Find '+k.name+' at '+k.lm+' (🧒 on the map), talk to them, and escort them out. Enemies make them run and hide!'+(k.biome==='lava'?' ⚠️ Wear heat gear inside the volcano.':''):'Ask villagers in '+k.village+' for rumors, or look for a signpost, to learn where '+k.name+' is lost.',done:st.stage==='rescued'});}
 out.push({title:'🌳 Tree of Healing',giver:'Central Forest',desc:'Tree Parts installed: '+treeInstalled.length+'/4. Each outer-biome boss carries one (Root of Frost, Seed of Vines, Heart of Sand, Ember Core). Bring them to the great tree in the forest centre and press E. Already beaten a boss? Claim its part from the shrine orb at the tree.',prog:treeInstalled.length+'/4',done:treeInstalled.length>=4});
 return out.sort((a,b)=>(a.done?1:0)-(b.done?1:0));}
function gainHeart(n){P.hearts=(P.hearts||0)+n;if(P.hearts%4===0){P.maxHp+=20;P.hp=P.maxHp;toast('❤️ Heart container! Max health is now '+P.maxHp,3);}else toast('❤️ Heart piece! ('+(P.hearts%4)+'/4)',2.5);}
const rewTxt=o=>Object.entries(o).map(([k,n])=>k==='coins'?n+' 🪙':k==='heart_piece'?'❤️ heart piece':n+' '+nm(k)).join(', ');
function revealTxt(r){if(r==='all')return 'They say the Yeti King rules the far NORTH peaks, the Vine Queen the far EAST jungle, the Sand Pharaoh the far SOUTH dunes, and the Magma Titan the far WEST volcano.';const B=BOSSES.find(b=>b.id===r);return `I hear the ${B.name} lurks right about… here. *marks your map* 📍`;}
function updNPCs(dt){const ni=night();let near=null,nd=7;
 for(const n of NPCS){const v=n.v;
  if(ni&&n.role!=='shop'){n.tx=n.home.x;n.tz=n.home.z;if(Math.hypot(n.x-n.home.x,n.z-n.home.z)<.6){n.inside=true;}}
  else if(n.inside){n.inside=false;n.x=n.home.x;n.z=n.home.z;n.wait=1;}
  else if(n.role==='shop'){n.tx=v.shop.x+Math.sin(v.shop.ry)*1.2;n.tz=v.shop.z+Math.cos(v.shop.ry)*1.2;}
  else if(n.wait<=0&&Math.hypot(n.x-n.tx,n.z-n.tz)<.4){n.wait=rnd(2,6);const a=rnd(0,6.28),r=rnd(1,8);n.tx=(n.role==='elder'?v.well.x:v.x)+Math.cos(a)*(n.role==='elder'?2.5:r);n.tz=(n.role==='elder'?v.well.z:v.z)+Math.sin(a)*(n.role==='elder'?2.5:r);}
  n.fig.visible=!n.inside;if(n.inside)continue;
  const dp=Math.hypot(P.x-n.x,P.z-n.z);const talking=talkNPC===n;
  if(n.wait>0&&!(ni&&n.role!=='shop'))n.wait-=dt;
  const d=Math.hypot(n.tx-n.x,n.tz-n.z);if(!talking&&dp>2.2&&d>.3&&(n.wait<=0||ni)){const s=1.5*dt/d;n.x+=(n.tx-n.x)*Math.min(1,s);n.z+=(n.tz-n.z)*Math.min(1,s);n.dir=Math.atan2(n.tx-n.x,n.tz-n.z);rigSet(n.fig,'walk');}else{rigSet(n.fig,'idle');if(dp<6)n.dir=Math.atan2(P.x-n.x,P.z-n.z);}
  n.fig.position.set(n.x,H(n.x,n.z),n.z);n.fig.rotation.y=n.dir;rigTick(n.fig,dt);
  const qs=npcQuest(n);let m=null;if(qs){if(!qs.st.active)m='!';else m=qProg(qs.q,qs.st)>=qNeed(qs.q)?'?':'~';}n.marker.visible=!!m;if(m)n.marker.material=MK[m];
  if(dp<nd&&!talking){nd=dp;near=n;}}
 const bb=$('bubble');if(near&&!paused){if(bubbleN!==near||bubbleT<=0){bubbleN=near;bubbleT=6;bb.textContent=pick(near.barks);}bubbleT-=dt;V.set(near.x,H(near.x,near.z)+(near.look.scale||1)*2.1+.8,near.z).project(camera);bb.style.left=((V.x+1)/2*innerWidth)+'px';bb.style.top=((1-V.y)/2*innerHeight)+'px';bb.classList.remove('hidden');}else bb.classList.add('hidden');
 for(const w of [winMat])w.emissiveIntensity=ni?1.6:0;lampMat.emissiveIntensity=lightsOn()?3:.2;}
let bubbleN=null,bubbleT=0,talkNPC=null;
// ---------- dialogue box (typewriter + portrait + branching choices) ----------
function drawPortrait(n){const c=$('portrait'),g=c.getContext('2d'),L=n.look,hex=x=>'#'+(x??0).toString(16).padStart(6,'0');g.fillStyle={wise:'#4a3a6a',cheerful:'#d07a9a',excited:'#e0a020',grumpy:'#6a5a4a',stern:'#3a4a7a',gruff:'#5a3a2a',dreamy:'#8aa0e0',nervous:'#8a8a5a',warm:'#3a8a5a',jokey:'#e08a30',curious:'#7a4ad0',brave:'#a04020',mysterious:'#5a3a2a',haggler:'#2a4a8a',shy:'#c06a5a',dramatic:'#8a2a6a',fierce:'#8a1a1a',proud:'#4a4a4a',playful:'#ff8a20',quiet:'#3a3a3a'}[n.pers]||'#444';g.fillRect(0,0,96,96);
 g.fillStyle=hex(L.shirt);g.beginPath();g.ellipse(48,104,40,30,0,0,7);g.fill();g.fillStyle=hex(L.skin);g.beginPath();g.arc(48,46,26,0,7);g.fill();
 if(L.hair!==null){g.fillStyle=hex(L.hair??0x3a2412);g.beginPath();g.arc(48,40,27,Math.PI,0);g.fill();}
 if(L.hat==='fur'){g.fillStyle='#e8e0d0';g.fillRect(20,14,56,16);}else if(L.hat==='straw'){g.fillStyle='#e0c070';g.fillRect(8,22,80,8);g.fillRect(28,6,40,18);}else if(L.hat==='hood'){g.strokeStyle=hex(L.shirt);g.lineWidth=8;g.beginPath();g.arc(48,46,30,Math.PI*.9,Math.PI*2.1);g.stroke();}else if(L.hat==='leaves'){g.fillStyle='#3ab03a';for(let i=0;i<5;i++){g.beginPath();g.ellipse(26+i*11,16,5,11,0,0,7);g.fill();}}
 g.fillStyle='#111';g.beginPath();g.arc(39,48,3.5,0,7);g.arc(57,48,3.5,0,7);g.fill();g.strokeStyle='#5a2a1a';g.lineWidth=2.5;g.beginPath();const sad=['grumpy','stern','gruff','nervous','quiet'].includes(n.pers);g.arc(48,sad?66:56,8,sad?Math.PI*1.2:Math.PI*.2,sad?Math.PI*1.8:Math.PI*.8);g.stroke();}
let typeTimer=null,typeFull='';
function say(n,text,choices){talkNPC=n;paused=true;$('talk').classList.remove('hidden');$('talkName').textContent=n.name+' · '+n.v.name;drawPortrait(n);const el=$('talkText'),ch=$('talkCh');ch.innerHTML='';typeFull=text;el.textContent='';clearInterval(typeTimer);let i=0;
 const showCh=()=>{ch.innerHTML='';for(const c of choices){const b=document.createElement('button');b.textContent=c.l;b.disabled=!!c.dis;b.onclick=e=>{e.stopPropagation();c.f();};ch.appendChild(b);}};
 typeTimer=setInterval(()=>{i+=2;el.textContent=typeFull.slice(0,i);if(i%6===0)tone(500+Math.random()*200,.03,'square',.03);if(i>=typeFull.length){clearInterval(typeTimer);typeTimer=null;showCh();}},22);
 $('talk').onclick=()=>{if(typeTimer){clearInterval(typeTimer);typeTimer=null;el.textContent=typeFull;showCh();}};}
function endTalk(){clearInterval(typeTimer);typeTimer=null;$('talk').classList.add('hidden');talkNPC=null;paused=false;}
const GREET={wise:'Ah, a traveler. The trees whispered you would come.',cheerful:'Hiya! Isn’t it a lovely day?',excited:'WHOA! A real adventurer! Hi hi hi!',grumpy:'What do you want? Make it quick.',stern:'State your business, outsider.',gruff:'Hrm. Buying or wasting my time?',dreamy:'Oh… hello. Did you see the stars last night?',nervous:'Oh! Y-you startled me…',warm:'Welcome, welcome! Rest your feet.',jokey:'Hey! Knock knock! …Nobody ever answers.',curious:'Hello! Oh, what’s in your bag? Any rare plants?',brave:'Greetings, fellow hero!',mysterious:'The dunes told me of your coming.',haggler:'My friend! You look like someone who loves a bargain!',shy:'…h-hello.',dramatic:'BEHOLD! A stranger arrives!',fierce:'You have the eyes of a fighter. Good.',proud:'You’re looking at the finest smith in the realms.',playful:'Hee hee! Bet you can’t catch me!',quiet:'…Hello.'};
function talk(n){if(n.inside)return;sfx.eat();const opts=[];const qs=npcQuest(n);
 if(qs){const {q,st}=qs;if(!st.active)opts.push({l:'❗ Need any help?',f:()=>offerQuest(n,q,st)});else opts.push({l:(qProg(q,st)>=qNeed(q)?'❓ ':'📜 ')+q.title,f:()=>questTalk(n,q,st)});}
 if(n.role==='shop')opts.push({l:'🛒 Let’s trade',f:()=>{endTalk();openShop(n);}});
 opts.push({l:'💬 Heard any rumors?',f:()=>rumor(n)});{const kk=KIDS.find(k2=>k2.biome===n.v.biome);if(kk&&kidStage(kk.id)!=='rescued')opts.push({l:'🧒 Any lost children?',f:()=>{hintKid(kk,'rumor');say(n,'Our little '+kk.name+' wandered off toward '+kk.lm+' and never came home… Please, if you find them, walk them out into daylight. We marked it on your map as best we know.',[{l:'I’ll find '+kk.name,f:()=>talk(n)}]);}});}opts.push({l:'👋 Goodbye',f:endTalk});
 say(n,GREET[n.pers]||'Hello.',opts);}
function offerQuest(n,q,st){say(n,q.txt+'\n\nReward: '+rewTxt(q.rew)+(q.reveal?' + boss location':''),[{l:'✅ I’ll do it!',f:()=>{quests[n.id]={...st,active:true,k0:q.t==='hunt'?(kills[q.kind]||0):0};toast('📜 New quest: '+q.title,2.5);save();say(n,n.pers==='grumpy'?'Hmph. Don’t dawdle.':'Thank you! Come back when it’s done.',[{l:'Goodbye',f:endTalk}]);}},{l:'❌ Not now',f:()=>say(n,'Alright. The offer stands.',[{l:'Goodbye',f:endTalk}])}]);}
function questTalk(n,q,st){const p=qProg(q,st),need=qNeed(q);if(p<need)return say(n,'How’s it going? ('+qDesc(q)+': '+p+'/'+need+')',[{l:'Still working on it',f:endTalk}]);
 say(n,'You did it! Here, take this as thanks.\n\nReceived: '+rewTxt(q.rew)+(q.reveal?'\n\n'+revealTxt(q.reveal):''),[{l:'🎁 Collect reward',f:()=>{if(q.t==='fetch')add(q.item,-q.n);for(const k in q.rew)add(k,q.rew[k]);if(q.reveal){if(q.reveal==='all')revealed.hint=1;else revealed[q.reveal]=1;}quests[n.id]={i:st.i+1,active:false};sfx.win();equipVisual();save();endTalk();}}]);}
function rumor(n){if(n.rumor){const known=n.rumor==='all'?revealed.hint:revealed[n.rumor];if(n.rumor!=='all')revealed[n.rumor]=1;else revealed.hint=1;save();return say(n,(known?'Like I said… ':'')+revealTxt(n.rumor),[{l:'Thanks!',f:()=>talk(n)}]);}
 const tips=['Keep the camp fire fed. Monsters hate the light!','Upgrade your crafting bench to make iron, gold and obsidian gear.','Traps catch rabbits while you sleep.','Gold pickaxes can break obsidian, they say.','Cold gear for the north, heat gear for the south and west!','Some of my neighbors know where the great beasts live. Ask around!'];say(n,pick(tips),[{l:'Thanks!',f:()=>talk(n)}]);}
// ---------- shop (counter) ----------
let shopN=null,shopTab='buy';
function openShop(n){shopN=n;paused=true;$('shop').classList.remove('hidden');renderShop();}
function renderShop(){const n=shopN;$('shopTitle').textContent='🛒 '+n.name+'’s counter · '+n.v.name;$('shopCoins').textContent='🪙 '+coins;for(const t of ['buy','sell'])$('s_'+t).classList.toggle('on',shopTab===t);let h='';
 if(shopTab==='buy')for(const [k,p] of Object.entries(SHOP[n.v.id])){const q=k==='arrows'||k==='torch'?4:k==='berries'?5:1,price=p*q;h+=`<div class="ware"><div class="wi">${ICON(k)}</div><div class="wn">${nm(k).replace(/^\S+ /,'')}${q>1?' ×'+q:''}</div><div class="wp">🪙 ${price}</div><button data-buy="${k}" data-q="${q}" data-p="${price}" ${coins>=price?'':'disabled'}>Buy</button></div>`;}
 else{const FM=shopN.v.id==='forest'?FSELL:SELL;const ks=Object.keys(inv).filter(k=>(FM[k]||0)>0);if(!ks.length)h='<div class="card">Nothing I want to buy. Bring me hides, ores, feathers…</div>';for(const k of ks)h+=`<div class="ware"><div class="wi">${ICON(k)}</div><div class="wn">${nm(k).replace(/^\S+ /,'')} ×${cnt(k)}</div><div class="wp">🪙 ${FM[k]} each</div><button data-sell="${k}">Sell 1</button><button data-sellall="${k}">Sell all</button></div>`;}
 $('shopBody').innerHTML=h;}
$('shopBody').addEventListener('click',e=>{const b=e.target.dataset;if(b.buy){coins-=+b.p;if(b.buy==='ammo_bundle'){addItem('arrows',20);toast('Bought 🏹 20 arrows');}else add(b.buy,+b.q);sfx.craft();toast('Bought '+nm(b.buy));}if(b.sell){add(b.sell,-1);coins+=(shopN.v.id==='forest'?FSELL:SELL)[b.sell]||0;sfx.eat();}if(b.sellall){const c=cnt(b.sellall);add(b.sellall,-c);coins+=c*((shopN.v.id==='forest'?FSELL:SELL)[b.sellall]||0);sfx.eat();}renderShop();});
for(const t of ['buy','sell'])$('s_'+t).onclick=()=>{shopTab=t;renderShop();};
$('shopX').onclick=()=>{$('shop').classList.add('hidden');paused=false;save();};
function openChest(){const render=()=>{let h='<div class="lbl">Chest</div><div class="ig">';const ck=Object.keys(chest);for(const k of ck)h+=`<div class="sl" data-take="${k}"><span>${ICON(k)}</span><i>${chest[k]}</i></div>`;h+='</div><div class="lbl">Tap a bag item to store it · tap a chest item to take it</div><div class="ig">';for(let i=0;i<NSLOT;i++){const s=slots[i];h+=s?`<div class="sl" data-store="${i}"><span>${ICON(s.k)}</span><i>${s.n>1?s.n:''}</i></div>`:'<div class="sl"></div>';}h+='</div>';$('chestBody').innerHTML=h;};
 paused=true;$('chestP').classList.remove('hidden');render();$('chestBody').onclick=e=>{const d=e.target.closest('.sl');if(!d)return;if(d.dataset.take){const k=d.dataset.take;addItem(k,chest[k]);delete chest[k];}if(d.dataset.store){const i=+d.dataset.store,s=slots[i];chest[s.k]=(chest[s.k]||0)+s.n;slots[i]=null;}render();save();};}
$('fireX').onclick=()=>{$('fireP').classList.add('hidden');};$('chestX').onclick=()=>{$('chestP').classList.add('hidden');paused=false;};

// ---------- animals ----------
const BEAST={
 deer:{len:1.1,h:.5,w:.4,leg:.8,legW:.09,col:0x9a6a3a,belly:0xe8d8c0,neck:.5,head:.3,snout:.18,ears:'point',tail:'short',horns:'antlers'},
 boar:{len:1,h:.55,w:.5,leg:.35,legW:.12,col:0x4a3a2e,belly:0x5a4a3a,head:.38,snout:.2,ears:'point',tail:'short',horns:'tusks',mane:0x2a1e16},
 wolf:{len:1,h:.42,w:.36,leg:.5,legW:.09,col:0x8a8a8a,belly:0xcfcfcf,neck:.18,head:.3,snout:.22,ears:'point',tail:'bushy'},
 bear:{len:1.5,h:1,w:1,leg:.5,legW:.22,col:0x5a3a22,head:.55,snout:.2,ears:'round',tail:'short',round:1,neck:.1},
 polar_bear:{len:1.6,h:1,w:1,leg:.55,legW:.24,col:0xf2f2ee,dark:0x222222,head:.55,snout:.25,ears:'round',tail:'short',round:1,neck:.25},
 snow_fox:{len:.7,h:.3,w:.26,leg:.3,legW:.06,col:0xf4f4f4,belly:0xffffff,neck:.12,head:.24,snout:.16,ears:'point',tail:'bushy',tailCol:0xffffff},
 tiger:{len:1.5,h:.55,w:.5,leg:.55,legW:.13,col:0xe08a20,belly:0xfff0d8,dark:0x1a1008,head:.42,snout:.14,ears:'round',tail:'thin',stripes:1,neck:.1},
 camel:{len:1.4,h:.6,w:.5,leg:1.1,legW:.11,col:0xc8a060,belly:0xd8b878,neck:.9,head:.3,snout:.25,ears:'round',tail:'short',hump:2}};
const AN={
 cultist:{b:'raid',hm:{shirt:0x3e5a2a,pants:0x2a3a1e,boot:0x2a1e12,skin:0xc89a78,hair:null,hat:'helm',helm:0x6a6a5a,cape:0x2e4a22,eye:0xffd040},hp:29,spd:4.3,beh:'cultist',dmg:5,drops:{fiber:2}},
 cultist_torch:{b:'raid',hm:{shirt:0x5a4a1e,pants:0x2e2a14,boot:0x2a1e12,skin:0xc89a78,hair:null,hat:'helm',helm:0x8a6a3a,cape:0x6a3a14,eye:0xffa020,staff:0xff7a20},torch:1,hp:42,spd:4.6,beh:'cultist',dmg:6,drops:{wood:2,torch:2}},
 cultist_shaman:{b:'raid',hm:{shirt:0x2a5a3a,pants:0x1e3a28,boot:0x1a2a1a,skin:0xc89a78,hair:null,hat:'leaves',cape:0x1e4a2e,eye:0x80ff90,staff:0x60e080},ranged:1,hp:36,spd:3.7,beh:'cultist',dmg:5,drops:{crystal:1,bandage:1}},
 deer:{b:'forest',beast:'deer',hp:40,spd:6.2,beh:'passive',drops:{raw_meat:2,hide:1}},
 rabbit:{b:'forest',p:'rabbit',col:0x9a8670,hp:10,spd:6,beh:'passive',drops:{raw_meat:1}},
 boar:{b:'forest',beast:'boar',hp:60,spd:5.4,beh:'neutral',dmg:8,drops:{raw_meat:2,hide:1}},
 wolf:{b:'forest',beast:'wolf',hp:45,spd:6.4,beh:'hostile',dmg:7,drops:{raw_meat:1,hide:1}},
 bear:{b:'forest',beast:'bear',bulk:1.4,hp:150,spd:5,beh:'hostile',dmg:16,drops:{raw_meat:3,hide:2}},
 polar_bear:{b:'snow',beast:'polar_bear',bulk:1.45,hp:170,spd:5,beh:'hostile',dmg:18,drops:{raw_meat:3,hide:3}},
 penguin:{b:'snow',p:'penguin',hp:12,spd:3,beh:'passive',drops:{raw_meat:1,feather:1}},
 snow_fox:{b:'snow',beast:'snow_fox',hp:30,spd:7,beh:'neutral',dmg:6,drops:{raw_meat:1,hide:1}},
 yeti:{b:'snow',hm:{scale:1.35,bulk:1.4,skin:0xc8d4e0,shirt:0xf0f4f8,pants:0xe8eef4,boot:0xc8d4e0,hair:0xffffff,fur:0xffffff,horns:0xd8d0b8},hp:140,spd:4.8,beh:'hostile',dmg:15,drops:{hide:3,raw_meat:2}},
 monkey:{b:'jungle',p:'monkey',col:0x7a4a2a,hp:18,spd:6,beh:'passive',drops:{raw_meat:1}},
 tiger:{b:'jungle',beast:'tiger',bulk:1.25,hp:110,spd:6.6,beh:'hostile',dmg:13,drops:{raw_meat:2,hide:2}},
 snake:{b:'jungle',p:'snake',col:0x2a9a2a,hp:22,spd:4,beh:'hostile',dmg:7,drops:{raw_meat:1}},
 parrot:{b:'jungle',p:'bird',col:0xe02a2a,fly:1,hp:8,spd:6,beh:'passive',drops:{feather:2}},
 scorpion:{b:'desert',p:'scorpion',col:0x3a2a1a,hp:28,spd:4.5,beh:'hostile',dmg:8,drops:{raw_meat:1}},
 camel:{b:'desert',beast:'camel',bulk:1.3,hp:70,spd:4.5,beh:'passive',drops:{raw_meat:3,hide:2}},
 vulture:{b:'desert',p:'bird',col:0x4a3a30,fly:1,hp:22,spd:5.5,beh:'hostile',dmg:5,drops:{feather:2,raw_meat:1}},
 lizard:{b:'desert',p:'lizard',col:0x9a8a40,hp:10,spd:6,beh:'passive',drops:{raw_meat:1}},
 salamander:{b:'lava',p:'lizard',col:0xff3a10,emis:1,hp:34,spd:5,beh:'hostile',dmg:9,drops:{raw_meat:1,hide:1}},
 lava_golem:{b:'lava',hm:{scale:1.5,bulk:1.6,skin:0x3a2a24,shirt:0x2a1e1a,pants:0x2a1e1a,boot:0x1a1210,hair:null,eye:0xff6a00,cracks:1},hp:200,spd:3.6,beh:'hostile',dmg:18,drops:{obsidian:2,iron:1}},
 magma_bat:{b:'lava',p:'bird',col:0x2a1a1a,emis:1,fly:1,hp:18,spd:6.5,beh:'hostile',dmg:6,drops:{hide:1}}};
const SPAWN={forest:{deer:4,rabbit:5,boar:2,wolf:2,bear:1},snow:{polar_bear:2,penguin:5,snow_fox:3,yeti:1},jungle:{monkey:4,tiger:2,snake:3,parrot:5},desert:{scorpion:4,camel:3,vulture:2,lizard:4},lava:{salamander:4,lava_golem:1,magma_bat:3}};
let animals=[];
function procAnimal(K){const g=new THREE.Group(),m=new THREE.MeshStandardMaterial({color:K.col||0x888888,roughness:.8,emissive:K.emis?new THREE.Color(K.col):new THREE.Color(0),emissiveIntensity:K.emis?.5:0}),w=new THREE.MeshStandardMaterial({color:0xf4f4f4}),blk=new THREE.MeshStandardMaterial({color:0x111111}),org=new THREE.MeshStandardMaterial({color:0xff9a20});
 const S=(r,mat,x,y,z,sx=1,sy=1,sz=1)=>{const s=new THREE.Mesh(new THREE.SphereGeometry(r,10,8),mat);s.position.set(x,y,z);s.scale.set(sx,sy,sz);g.add(s);return s;};
 switch(K.p){case'rabbit':S(.2,m,0,.2,0,1,.85,1.35);S(.12,m,0,.33,.22);S(.05,m,.05,.52,.18,.6,2.4,.6);S(.05,m,-.05,.52,.18,.6,2.4,.6);S(.06,w,0,.24,-.27);break;
  case'penguin':S(.25,blk,0,.4,0,1,1.6,1);S(.18,w,0,.38,.1,1,1.5,.8);S(.06,org,0,.68,.22,1,.6,1.6);break;
  case'monkey':S(.25,m,0,.5,0,1,1.2,1);S(.17,m,0,.88,.05);S(.1,new THREE.MeshStandardMaterial({color:0xd8b090}),0,.85,.16);S(.03,blk,.06,.92,.18);S(.03,blk,-.06,.92,.18);const t=new THREE.Mesh(new THREE.TorusGeometry(.25,.04,6,10,3),m);t.position.set(0,.5,-.3);t.userData.tail=1;g.add(t);break;
  case'snake':for(let i=0;i<7;i++)S(.13-i*.01,m,0,.12,.25-i*.2).userData.seg=i;S(.06,new THREE.MeshBasicMaterial({color:0xffff00}),0,.2,.34);break;
  case'bird':S(.2,m,0,0,0,1,.9,1.4);S(.12,m,0,.1,.25);S(.04,org,0,.08,.38,1,1,2);{const wg=new THREE.BoxGeometry(.5,.03,.25);const a=new THREE.Mesh(wg,m),b=new THREE.Mesh(wg,m);a.position.x=.3;b.position.x=-.3;a.userData.wing=1;b.userData.wing=-1;g.add(a,b);}break;
  case'scorpion':S(.3,m,0,.18,0,1,.5,1.4);for(let i=0;i<4;i++)S(.09,m,0,.3+i*.15,-.35-i*.06*(3-i));S(.08,new THREE.MeshStandardMaterial({color:0xaa2020}),0,.85,-.3);S(.1,m,.25,.15,.45,1.4,.6,1);S(.1,m,-.25,.15,.45,1.4,.6,1);break;
  case'lizard':S(.18,m,0,.14,0,1,.5,2.2);S(.1,m,0,.16,.45,1,.7,1.3);S(.06,m,0,.1,-.5,1,1,3);break;}
 g.traverse(o=>{if(o.isMesh)o.castShadow=true;});const root=new THREE.Group();root.add(g);root.userData={proc:g,mixer:null,acts:{}};if(K.p==='lizard'&&K.emis)root.scale.setScalar(1.8);if(K.p==='bird'&&K.emis)root.scale.setScalar(1.3);return root;}
function animalFig(K){if(K.p){const f=procAnimal(K);f.userData.rig={type:'proc'};return f;}if(K.hm)return makeHuman(K.hm);return makeBeast(BEAST[K.beast]);}
function aAnim(a,name,sp=1){if(name==='attack')rigOnce(a.fig,'attack',.5);else if(name==='death')rigOnce(a.fig,'death',.8);else rigSet(a.fig,name,sp);}
function spawnAnimal(kind,x,z){const K=AN[kind];const a={kind,K,x,z,hp:K.hp,alive:true,dir:rnd(0,6.28),t:rnd(0,3),state:'wander',cd:0,flash:0,fig:animalFig(K),tx:x,tz:z,agro:K.beh==='hostile'};a.fig.position.set(x,H(x,z),z);scene.add(a.fig);animals.push(a);return a;}
function killAnimal(a,byPlayer){a.alive=false;a.dead=2;aAnim(a,'death');if(byPlayer){kills[a.kind]=(kills[a.kind]||0)+1;if(a.K.beh==='hostile'||a.K.beh==='cultist'){const c=(a.K.beh==='cultist'?4:1)+Math.floor(Math.random()*4);coins+=c;floatTxt(a.x,a.z,'+'+c+' 🪙','#ffd400');}const got=[];for(const k in a.K.drops){add(k,a.K.drops[k]);got.push('+'+a.K.drops[k]+' '+ITEMS[k]);}toast(got.join('  '));}}
let spawnT=0;
function manageAnimals(dt){if(TUT.active)return;spawnT-=dt;for(const a of animals){if(Math.hypot(a.x-P.x,a.z-P.z)>85&&!a.boss&&!a.raid&&!a.cave){a.gone=true;}}
 animals=animals.filter(a=>{if(a.gone||(a.dead!==undefined&&a.dead<=0)){scene.remove(a.fig);return false;}return true;});
 if(spawnT>0)return;spawnT=1.2;const live=animals.filter(a=>a.alive&&!a.minion).length;if(live>=(isTouch?14:18))return;
 for(let t=0;t<6;t++){const ang=rnd(0,6.28),d=rnd(32,60),x=P.x+Math.cos(ang)*d,z=P.z+Math.sin(ang)*d;if(Math.abs(x)>W-5||Math.abs(z)>W-5||inPond(x,z,1)||inLava(x,z))continue;if(VILLAGES.some(v=>Math.hypot(x-v.x,z-v.z)<20))continue;
  const b=biomeAt(x,z),tab={...SPAWN[b]};if(night()&&b==='forest')tab.wolf+=4;const tot=Object.values(tab).reduce((s,v)=>s+v,0);let r=rnd(0,tot),kind;for(const k in tab){r-=tab[k];if(r<=0){kind=k;break;}}
  spawnAnimal(kind||Object.keys(tab)[0],x,z);
  if(kind==='wolf'&&Math.random()<.5)spawnAnimal('wolf',x+2,z+1);break;}}
function safeAt(x,z){return litAt(x,z)||VILLAGES.some(v=>Math.hypot(x-v.x,z-v.z)<16);}
function updAnimals(dt){const traps=structs.filter(s=>s.type==='trap');for(const a of animals){const f=a.fig,u=f.userData;rigTick(f,dt);
 if(a.alive&&!a.K.fly)for(const t of traps){if((t.cd||0)>0){t.cd-=dt/Math.max(1,animals.length);continue;}if(Math.hypot(a.x-t.x,a.z-t.z)<.9){if(a.K.hp<=20){killAnimal(a,true);toast('🪤 Your trap caught a '+a.kind.replace('cultist_torch','Forest Torchbearer').replace('cultist_shaman','Forest Mage').replace('cultist','Forest Scout').replace('_',' ')+'!');t.cd=20;}else{a.hp-=40;floatTxt(a.x,a.z,'-40 🪤','#fa0');a.agro=true;if(a.hp<=0)killAnimal(a,true);scene.remove(t.mesh);structs.splice(structs.indexOf(t),1);}break;}}
 if(!a.alive){a.dead-=dt;if(u.proc){f.rotation.z=Math.min(1.5,f.rotation.z+dt*4);}continue;}
 a.cd-=dt;a.t-=dt;if(a.burnT>0){a.burnT-=dt;a.hp-=6*dt;if(a.hp<=0){killAnimal(a,true);continue;}}if(a.flash>0){a.flash-=dt;}
 const dx=P.x-a.x,dz=P.z-a.z,dp=Math.hypot(dx,dz);let spd=0,tdir=a.dir;if(a.K.beh==='cultist'){cultTick(a,dt,dp);continue;}
 const hostileNow=(a.agro&&!(P.dead))&&dp<(a.K.beh==='hostile'?(night()?22:16):30)&&!safeAt(P.x,P.z);
 if(a.K.beh!=='passive'&&!a.minion&&litAt(a.x,a.z)){const fr=structs.find(s=>s.type==='campfire'&&s.fuel>0&&Math.hypot(a.x-s.x,a.z-s.z)<fireR(s));tdir=Math.atan2(a.x-fr.x,a.z-fr.z);spd=a.K.spd*.8;a.agro=a.K.beh==='hostile';}
 else if(a.state==='flee'&&a.t>0){tdir=Math.atan2(-dx,-dz);spd=a.K.spd;}
 else if(hostileNow){tdir=Math.atan2(dx,dz);const rng=(a.K.hm?2:1.6)*(a.K.bulk||1);if(dp>rng){spd=a.K.spd;}else if(a.cd<=0){a.cd=1.2;aAnim(a,'attack');setTimeout(()=>{if(a.alive&&Math.hypot(P.x-a.x,P.z-a.z)<rng+.8)hurtPlayer(a.K.dmg,a.K.b);},300);}}
 else{if(a.t<=0){a.t=rnd(2,5);a.state=Math.random()<.5?'idle':'wander';a.dir=rnd(0,6.28);if(a.agro&&a.K.beh!=='hostile')a.agro=false;}tdir=a.dir;spd=a.state==='wander'?a.K.spd*.3:0;if(a.K.beh==='passive'&&dp<6){a.state='flee';a.t=2;}}
 spd*=slowAt(a);a.dir=tdir;const nx=a.x+Math.sin(tdir)*spd*dt,nz=a.z+Math.cos(tdir)*spd*dt;
 if(!blocked(nx,nz,.5)&&!inPond(nx,nz,.3)&&!(inLava(nx,nz)&&a.K.b!=='lava')&&Math.abs(nx)<W-3&&Math.abs(nz)<W-3){a.x=nx;a.z=nz;}else{a.dir+=1.5;}
 const fy=a.K.fly?H(a.x,a.z)+2.2+Math.sin(performance.now()/300+a.x)*.3:H(a.x,a.z);f.position.set(a.x,fy,a.z);f.rotation.y=tdir;
 if(u.proc){const tt=performance.now()/1000;u.proc.position.y=spd>0&&!a.K.fly?Math.abs(Math.sin(tt*12))*.08:0;u.proc.children.forEach(c=>{if(c.userData.wing)c.rotation.z=Math.sin(tt*16)*.7*c.userData.wing;if(c.userData.seg!==undefined)c.position.x=Math.sin(tt*6-c.userData.seg)*.12;if(c.userData.tail)c.rotation.y=Math.sin(tt*5)*.35;});}
 else aAnim(a,spd>a.K.spd*.5?'run':spd>0?'walk':'idle');}}
function hitAnimal(a,dmg){a.hp-=dmg;if(bestWeapon()==='lava_sword')a.burnT=3;a.flash=.2;floatTxt(a.x,a.z,'-'+Math.round(dmg),'#ffd');sfx.hit();if(a.K.beh!=='passive')a.agro=true;else{a.state='flee';a.t=3;}if(a.hp<=0)killAnimal(a,true);}


// ---------- Release 15: Decorative base rating ----------
const VALMAP={iron_wall:9,turret:11,watchtower:10,guardian_totem:10,thorn_wall:8,flame_trap:8,gate:6,wall:5,fence:3,spike_barricade:5,bear_trap:5,alarm_bell:5,bench:4,chest:4,bed:4,tent:5,campfire:6,table:3,rug:2,flower_pot:3,sign_post:2,path_stones:1,lamp_post:5,torch_post:3,scarecrow:4,tar_pit:4,trench:4,trap:4};
function rateBase(list){list=list||structs;const mine=list.filter(x=>!x.perm&&x.type!=='healing_tree'&&x.type!=='cave_rock');const n=t=>mine.filter(x=>x.type===t).length;
 const decor=['rug','table','flower_pot','sign_post','path_stones'];const decorN=decor.reduce((a,t)=>a+n(t),0);const variety=new Set(mine.map(x=>x.type)).size;
 const lights=n('lamp_post')+n('torch_post');const fireLv=(list.find(x=>x.main)||mine.find(x=>x.type==='campfire')||{lvl:1}).lvl||1;
 const looksRaw=decorN*1.1+Math.min(6,variety)*0.9+n('flower_pot')*1.2+lights*1.1+n('path_stones')*.5+(fireLv-1)*.8;
 const defRaw=n('iron_wall')*1.6+n('thorn_wall')*1.5+n('wall')*1.2+n('gate')*1.2+n('fence')*.6+n('spike_barricade')*1.1+n('turret')*2.2+n('flame_trap')*1.4+n('bear_trap')*1.1+n('watchtower')*1.6+n('trap')*.8+n('tar_pit')*.6+n('trench')*.6+n('scarecrow')*.5+n('alarm_bell')*.6+(fireLv-1)*.9;
 let value=mine.reduce((a,x)=>a+(VALMAP[x.type]||2),0)+Math.floor(coins/60)+TCH.filter(c=>c.open).length*4+treeInstalled.length*5;
 const sc=v=>Math.max(1,Math.min(10,Math.round(v)));
 const looks=sc(looksRaw*.45),defense=sc(defRaw*.55),val=sc(value*.09);
 const stars=v=>'★'.repeat(Math.round(v/2))+'☆'.repeat(5-Math.round(v/2));
 return{looks,defense,value:val,total:looks+defense+val,stars,
  lines:[`🌸 <b>Looks ${looks}/10</b> ${stars(looks)} — ${decorN} decor items, ${variety} different structures, ${n('flower_pot')} flower pots, ${lights} lights, ${n('path_stones')} path stones, campfire Lv${fireLv}`,
   `🛡️ <b>Defense ${defense}/10</b> ${stars(defense)} — ${n('iron_wall')+n('wall')+n('thorn_wall')} walls, ${n('gate')} gates, ${n('turret')} turrets, ${n('flame_trap')+n('bear_trap')+n('trap')} traps, ${n('watchtower')} watchtowers, campfire Lv${fireLv}`,
   `💰 <b>Value ${val}/10</b> ${stars(val)} — ${mine.length} structures placed, ${TCH.filter(c=>c.open).length} treasure chests opened, ${coins} coins, ${treeInstalled.length}/4 tree parts`,
   `🏆 <b>Total ${looks+defense+val}/30</b> ${stars(Math.round((looks+defense+val)/3))}`],
  awards:[looks>=8?'🌸 Village-like charm':looks>=5?'🏡 Cosy camp':'⛺ Rustic start',defense>=8?'🏰 Fortress grade':defense>=5?'🛡️ Well guarded':'🧱 Needs more walls',val>=8?'👑 Treasure hoard':val>=5?'💰 Comfortable':'🪙 Getting started']};}
function showRating(){const r=rateBase();MP.myRating=r;let h=r.lines.join('<br>')+'<br><br>🎖️ '+r.awards.join(' · ');
 if(MP.on&&MP.themRating){const t=MP.themRating;h+=`<br><br>⚔️ <b>Build-off result:</b> You ${r.total}/30 vs ${MP.themName} ${t.total}/30 — <b>${r.total>t.total?'🏆 YOU WIN!':r.total<t.total?'😢 '+MP.themName+' wins':'🤝 It’s a tie!'}</b>`;}
 else if(MP.on)h+='<br><br>⏳ Waiting for your rival’s day-10 rating…';
 $('rateTitle').textContent=MODE==='decorative'?'🏆 Base Rating — '+(day>=11?'Day 10 complete!':'Early rating'):'🏆 Base Rating';
 $('rateBody').innerHTML=h;$('rateP').classList.remove('hidden');paused=true;sfx.win();
 if(MP.on)MP.send({t:'rating',rating:{looks:r.looks,defense:r.defense,value:r.value,total:r.total},name:CHAR.name});}
$('rateClose').onclick=()=>{$('rateP').classList.add('hidden');paused=false;};
$('pRate').onclick=()=>{showRating();};
// ---------- Release 15: multiplayer (PeerJS, host-authoritative score/session) ----------
const MP={on:false,host:false,mock:false,peer:null,conn:null,code:'',remote:null,remoteName:'Friend',themName:'Friend',deaths:0,finished:false,firstFinisher:null,myRating:null,themRating:null,sent:[],
 score:{boss:0,parts:0,rescues:0,deaths:0},them:{boss:0,parts:0,rescues:0,deaths:0},
 send(o){this.sent.push(o);if(this.conn&&this.conn.open)this.conn.send(o);},
 progress(){this.score={boss:Object.keys(bossDone).filter(k=>bossDone[k]).length,parts:treeInstalled.length,rescues:KIDS.filter(k=>kidState[k.id].stage==='rescued').length,deaths:this.deaths};this.hud();this.send({t:'score',score:this.score,name:CHAR.name});
  if(MODE==='discovery'&&this.on&&this.score.boss>=4&&this.score.parts>=4&&!this.finished){this.finished=true;this.firstFinisher=this.firstFinisher||'me';this.send({t:'win',deaths:this.deaths,name:CHAR.name});showMpWin();}},
 hud(){const el=$('mpScore');if(!el)return;if(!this.on||MODE!=='discovery'){el.classList.add('hidden');return;}el.classList.remove('hidden');
  el.innerHTML=`🏁 <b>Race — first to 4 bosses + healed tree</b><br>👤 ${CHAR.name}: 💀${this.score.boss}/4 🌳${this.score.parts}/4 🧒${this.score.rescues} ☠️${this.score.deaths}<br>👥 ${this.themName}: 💀${this.them.boss}/4 🌳${this.them.parts}/4 🧒${this.them.rescues} ☠️${this.them.deaths}`;},
 snapshot(){return structs.filter(x=>!x.perm).map(x=>({type:x.type,x:x.x,z:x.z,rot:x.rot,tier:x.tier,lvl:x.lvl,fuel:x.fuel,main:x.main}));},
 applyStruct(d){if(!PLACE.includes(d.type)&&d.type!=='campfire')return;if(structs.some(x=>x.type===d.type&&Math.hypot(x.x-d.x,x.z-d.z)<1.2))return;placeStruct(d.type,d.x,d.z,{rot:d.rot,tier:d.tier,lvl:d.lvl,fuel:d.fuel,main:d.main});},
 handle(d){if(!d||!d.t)return;
  if(d.t==='hello'){this.themName=d.name||'Friend';this.remoteName=this.themName;if(!this.host&&d.host){if(d.mode&&d.mode!==MODE){MODE=d.mode;updModeCards();toast('🌐 Host is playing '+MODE+' mode — matched!',3);}}
   if(this.host)this.send({t:'snapshot',structs:this.snapshot()});this.progress();toast('🌐 '+this.themName+' is here! Wave with the emote buttons 👋',3);}
  else if(d.t==='snapshot'){for(const sd of d.structs||[])this.applyStruct(sd);if(!this.host)this.send({t:'snapshot',structs:this.snapshot()});}
  else if(d.t==='pos'){if(!this.remote){const fig=makeHuman(d.look||{shirt:0xd84a20});scene.add(fig);this.remote={fig,x:d.x,z:d.z};toast('👥 '+this.themName+' appeared!',2);}
   this.remote.x=d.x;this.remote.z=d.z;this.remote.fig.position.set(d.x,H(d.x,d.z)+(d.jy||0),d.z);this.remote.fig.rotation.y=d.dir||0;rigTick(this.remote.fig,.05);}
  else if(d.t==='emote'){if(this.remote)floatTxt(this.remote.x,this.remote.z,d.e,'#fff');toast(this.themName+' '+d.e,1.5);}
  else if(d.t==='struct')this.applyStruct(d.s);
  else if(d.t==='unstruct'){const i=structs.findIndex(x=>!x.perm&&x.type===d.ty&&Math.hypot(x.x-d.x,x.z-d.z)<2);if(i>=0){scene.remove(structs[i].mesh);structs.splice(i,1);}}
  else if(d.t==='score'){this.them=d.score;this.themName=d.name||this.themName;this.hud();}
  else if(d.t==='win'){this.firstFinisher=this.firstFinisher||'them';showMpWin();}
  else if(d.t==='rating'){this.themRating=d.rating;this.themName=d.name||this.themName;if(!$('rateP').classList.contains('hidden'))showRating();else toast('🏆 '+this.themName+'’s base scored '+d.rating.total+'/30 — open your rating (Pause) to compare!',4);}
  else if(d.t==='bye'){mpDisconnect('🌐 '+this.themName+' left the game. You keep playing solo.');}},
 inject(d){this.handle(d);},
 mockConnect(){this.on=true;this.mock=true;this.conn={open:true,send:o=>this.sent.push(o)};this.hud();updEmoteBar();return true;}};
function updEmoteBar(){const b=$('emoteBar');if(b)b.classList.toggle('hidden',!MP.on);}
function mpDisconnect(msg){if(MP.remote){scene.remove(MP.remote.fig);MP.remote=null;}MP.on=false;MP.conn=null;MP.hud();updEmoteBar();if(msg)toast(msg,4);const st=$('mpStatus');if(st)st.textContent='Disconnected — playing solo.';}
function showMpWin(){const meFirst=MP.firstFinisher!=='them';const fewer=MP.score.deaths<=MP.them.deaths;
 $('rateTitle').textContent='🏁 Race finished!';$('rateBody').innerHTML=`🏆 <b>${meFirst?CHAR.name:MP.themName} beat the game first</b> (4 bosses + Tree of Healing)!<br>☠️ Deaths — ${CHAR.name}: ${MP.score.deaths} · ${MP.themName}: ${MP.them.deaths}<br>👑 <b>Fewest-deaths honour: ${MP.score.deaths<MP.them.deaths?CHAR.name:MP.score.deaths>MP.them.deaths?MP.themName:'tied!'}</b><br>💀 Bosses ${MP.score.boss}–${MP.them.boss} · 🌳 Tree parts ${MP.score.parts}–${MP.them.parts} · 🧒 Rescues ${MP.score.rescues}–${MP.them.rescues}`;
 $('rateP').classList.remove('hidden');paused=true;sfx.win();}
let mpPosT=0;
function mpTick(dt){if(!MP.on)return;mpPosT-=dt;if(mpPosT<=0){mpPosT=.15;MP.send({t:'pos',x:P.x,z:P.z,dir:P.dir,jy:P.jy,look:charLook(),name:CHAR.name});}}
function mpSetupConn(conn){MP.conn=conn;conn.on('open',()=>{MP.on=true;updEmoteBar();const st=$('mpStatus');if(st)st.textContent='✅ Connected! Starting…';
  if(!running)startGame(false);if(!MP.host){/* guest base ~40m east */setTimeout(()=>{if(!structs.some(x=>x.main&&Math.hypot(x.x-44,x.z-0)<6)){const f=placeStruct('campfire',44,-1.5,{main:1,fuel:60});P.x=44;P.z=3;P.spawn=[44,3];MP.send({t:'snapshot',structs:MP.snapshot()});toast('🏕️ Your base is 40 m east of '+MP.themName+'’s — go visit!',4);}},800);}
  MP.send({t:'hello',name:CHAR.name,look:charLook(),mode:MODE,host:MP.host});MP.hud();});
 conn.on('data',d=>MP.handle(d));conn.on('close',()=>mpDisconnect());conn.on('error',()=>mpDisconnect('🌐 Connection error — playing solo.'));}
function mpCreate(){const st=$('mpStatus');if(typeof Peer==='undefined'){st.textContent='⚠️ Multiplayer library did not load (needs internet). Solo still works!';return;}
 MP.code='';const abc='ABCDEFGHJKMNPQRSTUVWXYZ';for(let i=0;i<4;i++)MP.code+=abc[Math.floor(Math.random()*abc.length)];
 MP.peer=new Peer('emberfall-'+MP.code);MP.host=true;st.textContent='⏳ Creating room…';
 MP.peer.on('open',()=>{st.innerHTML='🏠 Room code: <b style="font-size:20px">'+MP.code+'</b> — share it! Starting your game; your friend can join any time.';if(!running)startGame(false);});
 MP.peer.on('connection',c=>mpSetupConn(c));MP.peer.on('error',e=>{st.textContent='⚠️ '+(e.type==='unavailable-id'?'That code just got taken — Create again!':'Connection trouble: '+e.type);});}
function mpJoin(){const st=$('mpStatus');const code=($('roomCode').value||'').trim().toUpperCase();if(code.length!==4){st.textContent='Type the 4-letter room code first!';return;}
 if(typeof Peer==='undefined'){st.textContent='⚠️ Multiplayer library did not load (needs internet). Solo still works!';return;}
 MP.host=false;MP.code=code;MP.peer=new Peer();st.textContent='⏳ Joining '+code+'…';
 MP.peer.on('open',()=>{const c=MP.peer.connect('emberfall-'+code,{reliable:true});mpSetupConn(c);setTimeout(()=>{if(!MP.on)st.textContent='⚠️ No room '+code+' found — check the code, and that your friend created it first.';},9000);});
 MP.peer.on('error',e=>{st.textContent='⚠️ '+(e.type==='peer-unavailable'?'No room with that code (yet).':'Connection trouble: '+e.type);});}
$('bHost').onclick=mpCreate;$('bJoin').onclick=mpJoin;
document.querySelectorAll('#emoteBar button').forEach(b=>b.onclick=()=>{if(!MP.on)return;floatTxt(P.x,P.z,b.dataset.emote,'#fff');MP.send({t:'emote',e:b.dataset.emote});});
// mode cards
function updModeCards(){const d=MODE==='discovery';$('modeDisc').classList.toggle('on',d);$('modeDeco').classList.toggle('on',!d);
 $('modeDesc').textContent=d?'🏕️ Discovery: survive, rescue kids, heal the tree, beat 4 bosses → Crown.':'🏡 Decorative: relaxed building, no starvation, rated Looks/Defense/Value at the end of day 10.';
 const pr=$('pRate');if(pr)pr.style.display=MODE==='decorative'?'':'none';}
$('modeDisc').onclick=()=>{MODE='discovery';localStorage.setItem('cq_mode',MODE);updModeCards();};
$('modeDeco').onclick=()=>{MODE='decorative';localStorage.setItem('cq_mode',MODE);updModeCards();};


// ---------- Release 16: guided tutorial ----------
const TUT={active:false,i:0,snap:null,iv:null,done:()=>!!localStorage.getItem('cq_tutdone')};
const tutSteps=[
 {t:'👋 Welcome to Emberfall!',x:()=>'Let’s learn by doing. '+(isTouch?'Use the <b>left joystick</b> to walk a few steps.':'Use <b>W or WASD</b> (or arrow keys) to walk a few steps.'),hi:()=>isTouch?'#stick':'#keys',snap:()=>({x:P.x,z:P.z}),ok:s2=>Math.hypot(P.x-s2.x,P.z-s2.z)>3},
 {t:'👀 Look around',x:()=>isTouch?'Your camera follows where you walk — <b>turn by walking in a new direction</b>.':'<b>Right-drag the mouse</b> (or hold <b>Z / X</b>) to rotate your camera.',hi:()=>isTouch?null:'#keys',snap:()=>({yaw:camYaw,dir:P.dir}),ok:s2=>Math.abs(Math.atan2(Math.sin(camYaw-s2.yaw),Math.cos(camYaw-s2.yaw)))>.7||Math.abs(Math.atan2(Math.sin(P.dir-s2.dir),Math.cos(P.dir-s2.dir)))>.9},
 {t:'👊 Punch a tree!',x:()=>'Walk up to any tree and '+(isTouch?'tap <b>HIT</b>':'<b>left-click</b>')+' to punch it (10 hits). Pick up the <b>wood</b> it drops.',snap:()=>({w:cnt('wood')}),ok:s2=>cnt('wood')>s2.w},
 {t:'🎒 Open your bag',x:()=>isTouch?'Tap the <b>BAG</b> button (or a hotbar slot) to open your inventory.':'Press <b>Tab</b> or <b>I</b> to open your inventory.',hi:()=>isTouch?'#bBag':'#hotbar',ok:()=>!$('bag').classList.contains('hidden')},
 {t:'🛠️ Craft your first tools',x:()=>'In the bag open <b>Recipes (C)</b>: craft <b>Planks</b>, then <b>Sticks</b>, then a <b>Wooden Axe</b>. Tip: Auto-fill + Craft all does the clicking for you!',hi:()=>null,snap:()=>({}),ok:()=>has('wood_axe')},
 {t:'🪓 Chop with your axe',x:()=>'Select the axe in your hotbar (tap it / number key) and chop a whole tree — only <b>5 hits</b> with an axe. Gather the wood.',snap:()=>({w:cnt('wood')}),ok:s2=>cnt('wood')>s2.w},
 {t:'⛏️ Stone + pickaxe',x:()=>'Punch <b>pebbles</b> (small grey stones) for stone, then craft a <b>Wooden Pickaxe</b> from the recipe book.',snap:()=>({}),ok:()=>has('wood_pickaxe')},
 {t:'🪨 Mine a rock',x:()=>'With the pickaxe selected, hit a big <b>rock</b> until it breaks — that’s proper mining (iron and gold need better pickaxes later).',snap:()=>({s:cnt('stone')}),ok:s2=>cnt('stone')>s2.s},
 {t:'🔥 Feed the campfire',x:()=>'Go to your campfire (the blue circle keeps monsters out!) and press '+(isTouch?'<b>USE</b>':'<b>E</b>')+', then <b>Add log</b>. A fed fire = a safe camp.',snap:()=>({f:(structs.find(x=>x.main)||{}).fuel||0}),ok:s2=>(((structs.find(x=>x.main)||{}).fuel||0)>s2.f+3)},
 {t:'🍖 Eat & drink',x:()=>'See the bars (top-left)? <b>Hunger</b> and <b>Thirst</b> matter. Eat <b>berries</b> from bushes, and drink at a pond or well ('+(isTouch?'USE':'E')+' by the water). Top one of them up now.',hi:()=>'#bars',snap:()=>({h:P.hunger,th:P.thirst}),ok:s2=>P.hunger>s2.h+4||P.thirst>s2.th+4||P.hunger>=98||P.thirst>=98},
 {t:'⛺ Build something',x:()=>MODE==='decorative'?'Place a <b>bench</b> — or any Decorative item (rug, table, flower pot!) — from your hotbar: select it, then '+(isTouch?'tap it again':'press the number again')+' to place. (Hold '+(isTouch?'PICK UP':'E')+' later to move it.)':'Craft and place a <b>bench</b> (4 planks in the bag grid) — or pitch a tent/bed if you have the hide. Select it in the hotbar, then '+(isTouch?'tap it again':'press the number again')+' to place it.',snap:()=>({}),ok:()=>structs.some(x=>['bench','tent','bed','rug','table','flower_pot','sign_post','path_stones'].includes(x.type))},
 {t:'⤴️ Jump!',x:()=>isTouch?'Tap <b>JUMP</b> — you can hop clean over your own walls and fences!':'Press <b>Space</b> to jump — you can hop clean over your own walls and fences!',hi:()=>isTouch?'#bJump':'#keys',snap:()=>({}),ok:()=>P.jy>.35},
 {t:'🗺️ Map & help',x:()=>isTouch?'Tap the <b>minimap</b> (top-right) to open the big map. The <b>?</b> button reopens How to Play any time.':'Press <b>M</b> (or click the minimap) to open the big map. The <b>?</b> button reopens How to Play any time.',hi:()=>'#minimap',snap:()=>({}),ok:()=>!$('fullMap').classList.contains('hidden')},
 {t:'🎉 You’re ready!',x:()=>'Survive the nights, visit <b>villages</b> for quests and trading, rescue the <b>lost kids</b>, gather <b>Tree Parts</b> from the four bosses to heal the <b>Tree of Healing</b>… and in Discovery, beat all four bosses to win the Crown. Good luck, survivor!',last:1,snap:()=>({}),ok:()=>false}];
function tutShow(){const st=tutSteps[TUT.i];if(!st)return tutEnd(true);$('tutProg').textContent='Tutorial · Step '+(TUT.i+1)+' / '+tutSteps.length+(MODE==='decorative'?' · Decorative':'');
 $('tutTitle').textContent=st.t;$('tutText').innerHTML=typeof st.x==='function'?st.x():st.x;$('tutNext').style.display=st.last?'':'none';$('tutCard').classList.remove('hidden');TUT.snap=st.snap?st.snap():{};tutHiPos();}
function tutHiPos(){const st=tutSteps[TUT.i],sel=st&&st.hi?st.hi():null,hi=$('tutHi');if(!sel){hi.classList.add('hidden');return;}
 const el=document.querySelector(sel);if(!el){hi.classList.add('hidden');return;}const r=el.getBoundingClientRect();if(r.width===0){hi.classList.add('hidden');return;}
 hi.style.left=(r.left-6)+'px';hi.style.top=(r.top-6)+'px';hi.style.width=(r.width+12)+'px';hi.style.height=(r.height+12)+'px';hi.classList.remove('hidden');}
function tutAdvance(){TUT.i++;sfx.craft();if(TUT.i>=tutSteps.length)return tutEnd(true);tutShow();}
function tutEnd(finished){TUT.active=false;clearInterval(TUT.iv);$('tutCard').classList.add('hidden');$('tutHi').classList.add('hidden');
 if(finished){localStorage.setItem('cq_tutdone','1');toast('🎓 Tutorial complete — press ? any time for How to Play. Good luck!',4);}}
function startTutorial(){if(!P.fig)return;TUT.i=0;TUT.active=true;tutShow();clearInterval(TUT.iv);
 TUT.iv=setInterval(()=>{if(!TUT.active)return;tutHiPos();const st=tutSteps[TUT.i];if(st&&!st.last&&st.ok&&TUT.snap&&st.ok(TUT.snap))tutAdvance();},220);}
$('tutSkip').onclick=()=>{tutEnd(true);toast('🎓 Tutorial skipped — replay it any time from the title or pause menu.',3);};
$('tutNext').onclick=()=>tutEnd(true);
$('bTut').onclick=()=>{if(!running){startGame(true);}setTimeout(()=>startTutorial(),600);};
$('pTut').onclick=()=>{$('pause').classList.add('hidden');paused=false;startTutorial();};

// ---------- telegraphs & projectiles ----------
const TELE=[],PROJ=[],BFX=[];
const teleMat=new THREE.MeshBasicMaterial({color:0xff2a2a,transparent:true,opacity:.35,depthWrite:false});
function telegraph(x,z,r,delay,cb){delay*=1.5;const m=new THREE.Mesh(new THREE.CircleGeometry(r,28),teleMat.clone());m.rotation.x=-Math.PI/2;m.position.set(x,H(x,z)+.08,z);scene.add(m);TELE.push({m,t:delay,d:delay,cb,x,z,r});}
function shoot(from,x,z,ang,spd,dmg,col,r=.35,life=2.5,o={}){if(from==='player'&&P.tower&&Math.hypot(x-P.x,z-P.z)<2){life*=1.9;dmg*=1.25;}if(from==='enemy'){spd*=.68;life*=1.4;}const m=new THREE.Mesh(new THREE.SphereGeometry(r,10,8),new THREE.MeshBasicMaterial({color:col}));const y0=H(x,z)+(o.h??1.2);m.position.set(x,y0,z);scene.add(m);PROJ.push({from,x,z,vx:Math.sin(ang)*spd,vz:Math.cos(ang)*spd,dmg,life,m,r,own:!!o.own,y:y0,vy:o.vy||0,grav:o.grav||0});}
function blockedNatural(x,z,y){if(y<H(x,z)+.25)return true;
 for(const o of near(x,z,2)){if(!o.alive||o.type==='pebble'||o.type==='bush')continue;const oh=o.type==='tree'?4.6*o.s:RTYPES[o.type].r*o.s*2.2;if(y-H(o.x,o.z)<oh&&Math.hypot(x-o.x,z-o.z)<RTYPES[o.type].r*o.s*(o.type==='tree'?.6:1)+.15)return true;}
 for(const s of structs){if(s.type!=='house')continue;if(y-H(s.x,s.z)<3.6&&Math.hypot(x-s.x,z-s.z)<2.75)return true;}return false;}
function losClear(x1,z1,x2,z2){const d=Math.hypot(x2-x1,z2-z1),y1=H(x1,z1)+2,y2=H(x2,z2)+1;for(let t=.08;t<.95;t+=.06){const x=x1+(x2-x1)*t,z=z1+(z2-z1)*t,y=y1+(y2-y1)*t+Math.sin(t*Math.PI)*1;if(blockedNatural(x,z,y))return false;}return true;}
function updFx(dt){for(let i=BFX.length-1;i>=0;i--){const q=BFX[i];q.t-=dt;q.vy-=9*dt;q.m.position.x+=q.vx*dt;q.m.position.y+=q.vy*dt;q.m.position.z+=q.vz*dt;q.m.rotation.x+=dt*7;q.m.rotation.y+=dt*5;if(q.t<=0){scene.remove(q.m);BFX.splice(i,1);}}
 for(let i=TELE.length-1;i>=0;i--){const t=TELE[i];t.t-=dt;t.m.material.opacity=.25+.45*(1-t.t/t.d);if(t.t<=0){scene.remove(t.m);TELE.splice(i,1);t.cb&&t.cb(t);}}
 for(let i=PROJ.length-1;i>=0;i--){const p=PROJ[i];p.x+=p.vx*dt;p.z+=p.vz*dt;p.life-=dt;let hitWall;
  if(p.own){p.y+=p.vy*dt;p.vy-=p.grav*dt;p.m.position.set(p.x,p.y,p.z);hitWall=blockedNatural(p.x,p.z,p.y);}
  else{p.m.position.set(p.x,H(p.x,p.z)+1.2,p.z);hitWall=blocked(p.x,p.z,.1);}
  let hit=false;
  if(p.from==='enemy'){if(!P.dead&&Math.hypot(p.x-P.x,p.z-P.z)<p.r+.5){hurtPlayer(p.dmg,null);hit=true;}}
  else{for(const a of animals){if(a.alive&&Math.hypot(p.x-a.x,p.z-a.z)<.9*(a.K.bulk||1)+(a.K.hm?.4:0)){hitAnimal(a,p.dmg);hit=true;break;}}if(!hit&&boss&&boss.alive&&Math.hypot(p.x-boss.x,p.z-boss.z)<boss.rad){hitBoss(p.dmg);hit=true;}}
  if(hit||p.life<=0||hitWall){scene.remove(p.m);PROJ.splice(i,1);}}}


// ---------- Release 13: lost kids in caves + Tree of Healing ----------
const PART_FOR_BOSS={yeti:'frost_root',vine:'vine_seed',pharaoh:'sand_heart',titan:'ember_core'};
const PART_BONUS={frost_root:'+20 max HP (and healed 20)',vine_seed:'You slowly regenerate health',sand_heart:'Campfire safe radius +25%',ember_core:'Your campfire becomes a stronger healing aura when the tree is whole'};
const KIDS=[
 {id:'forest',biome:'forest',name:'Pip',lm:'the hollow ancient tree',lmShort:'Hollow Tree',pref:[-38,-32],village:'Oakhollow',enemy:'wolf',reward:'heartwood_charm',look:{scale:.68,skin:0xe8b890,shirt:0x3f9e4d,pants:0x5a4228,hair:0x6a3a1a,hat:'leaves',face:'happy'},pers:'cheerful',line:'I followed a butterfly in… then the wolves followed ME. Best day ever? Worst day ever? Both!'},
 {id:'snow',biome:'snow',name:'Nia',lm:'the ice cave in the glacier',lmShort:'Ice Cave',pref:[-72,-168],village:'Frostpeak',enemy:'snow_fox',reward:'ice_ring',look:{scale:.68,skin:0xf0c8a8,shirt:0x7fd0ff,pants:0x33507a,hair:0xf4f4f4,hat:'fur',scarf:0xff6a8a,face:'shy'},pers:'shy',line:'I-I built a snow fort in the cave so the foxes could not see me. It… mostly worked.'},
 {id:'jungle',biome:'jungle',name:'Kito',lm:'the vine temple behind the waterfall',lmShort:'Waterfall Temple',pref:[172,-92],village:'Vinewood',enemy:'snake',reward:'thorn_armor',look:{scale:.68,skin:0x8a5a30,shirt:0xe08a20,pants:0x2e5a1e,hair:0x1a1008,hat:'leaves',face:'happy'},pers:'excited',line:'The snakes said SSSSS which means “stay for dinner”. I did NOT want to be dinner!'},
 {id:'desert',biome:'desert',name:'Zara',lm:'the sandstone tomb under the rock arch',lmShort:'Sandstone Tomb',pref:[-84,182],village:'Sandmere',enemy:'scorpion',reward:'sandstorm_boots',look:{scale:.68,skin:0xc49a5a,shirt:0xffd94d,pants:0xb8542e,hair:0x2a1a0c,hat:'straw',scarf:0xe08a20,face:'brave'},pers:'dramatic',line:'BEHOLD! I survived the scorpion cave with only dramatic screaming. You may applaud later.'},
 {id:'lava',biome:'lava',name:'Ash',lm:'inside the volcano',lmShort:'Volcano Crater',pref:[-182,92],village:'Emberfall',enemy:'salamander',reward:'lava_sword',look:{scale:.68,skin:0xa87040,shirt:0xd84a20,pants:0x2a1e1a,hair:0xff6a20,hat:'cap',hatCol:0xd84a20,armor:0xb8401e,scarf:0x8a2a10,face:'brave'},pers:'brave',line:'It is not even that hot in there. Okay it is exactly that hot. The salamanders keep stealing my shadow!'}];
let kidState={},treeInstalled=[],fruitAt=0;const KIDENTS=[];
for(const k of KIDS)kidState[k.id]={stage:'wait',hinted:0};
const kidStage=id=>(kidState[id]||{}).stage||'wait';
function findCaveSpot(k){const offs=[[0,0],[14,0],[-14,0],[0,14],[0,-14],[24,10],[-24,-10],[10,24],[-10,-24],[30,-18],[-30,18]];
 for(const [dx,dz] of offs){const x=k.pref[0]+dx,z=k.pref[1]+dz;if(Math.abs(x)>W-20||Math.abs(z)>W-20)continue;if(biomeAt(x,z)!==k.biome)continue;if(inPond(x,z,13)||inLava(x,z))continue;if(VILLAGES.some(v=>Math.hypot(v.x-x,v.z-z)<26))continue;if(BOSSES.some(b2=>Math.hypot(b2.x-x,b2.z-z)<28))continue;return{x,z};}return{x:k.pref[0],z:k.pref[1]};}
function buildCaves(){for(const k of KIDS){const c=findCaveSpot(k);k.cave=c;const dirA=Math.atan2(-c.x,-c.z);k.exit={x:c.x+Math.sin(dirA)*16.5,z:c.z+Math.cos(dirA)*16.5};k.hide={x:c.x-Math.sin(dirA)*4,z:c.z-Math.cos(dirA)*4};
  const g=new THREE.Group();const gy=(x,z)=>H(x,z);
  const M=(geo,mt,x,y,z,sx=1,sy=1,sz=1)=>{const m=new THREE.Mesh(geo,mt);m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.castShadow=true;g.add(m);return m;};
  // perimeter ring (keeps cave_rock collision) dressed per biome
  const ringM={forest:new THREE.MeshStandardMaterial({map:barkTex,color:0xa8845e,roughness:.95}),snow:new THREE.MeshStandardMaterial({color:0xcfe9f7,roughness:.18,metalness:.05,transparent:true,opacity:.92}),jungle:new THREE.MeshStandardMaterial({map:rockTex,color:0x9a9a8a,roughness:.9}),desert:new THREE.MeshStandardMaterial({map:rockTex,color:0xe0b878,roughness:.95}),lava:new THREE.MeshStandardMaterial({color:0x1c1512,roughness:.35,metalness:.25})}[k.biome];
  const dark=new THREE.MeshStandardMaterial({color:0x241e1a,roughness:1});
  for(let a=0;a<Math.PI*2;a+=.3){let dd=Math.abs(Math.atan2(Math.sin(a-dirA),Math.cos(a-dirA)));if(dd<.42)continue;const x=c.x+Math.sin(a)*13,z=c.z+Math.cos(a)*13;const h=4.5+((a*7)%3);const m=new THREE.Mesh(new THREE.CylinderGeometry(1.9,2.5,h,7),ringM);m.position.set(x,gy(x,z)+h/2-.3,z);m.castShadow=true;g.add(m);structs.push({type:'cave_rock',x,z,perm:1,mesh:m});}
  for(const sgn of[-1,1]){const px=c.x+Math.sin(dirA)*13-Math.cos(dirA)*sgn*2.2,pz=c.z+Math.cos(dirA)*13+Math.sin(dirA)*sgn*2.2;const pil=new THREE.Mesh(new THREE.CylinderGeometry(.8,1.1,7,8),k.biome==='snow'?ringM:dark);pil.position.set(px,gy(px,pz)+3.2,pz);pil.castShadow=true;g.add(pil);}
  const lintel=new THREE.Mesh(new THREE.CylinderGeometry(.8,.8,6.4,8),k.biome==='desert'?ringM:dark);lintel.rotation.z=Math.PI/2;lintel.rotation.y=-dirA;lintel.position.set(c.x+Math.sin(dirA)*13,gy(c.x,c.z)+6.6,c.z+Math.cos(dirA)*13);g.add(lintel);
  const floor=new THREE.Mesh(new THREE.CircleGeometry(12.6,26),new THREE.MeshBasicMaterial({color:k.biome==='snow'?0x9fc8dd:k.biome==='lava'?0x1c0c06:0x14100e,transparent:true,opacity:k.biome==='snow'?.35:.5}));floor.rotation.x=-Math.PI/2;floor.position.set(c.x,gy(c.x,c.z)+.07,c.z);g.add(floor);
  const bx=c.x-Math.sin(dirA)*15,bz=c.z-Math.cos(dirA)*15,by=gy(bx,bz); // landmark backdrop, opposite the entrance
  const sx2=c.x-Math.cos(dirA),sz2=c.z+Math.sin(dirA); // side direction
  if(k.biome==='forest'){ // hollow ancient tree: giant trunk, roots, canopy, hollow mouth, mushrooms
   const bark=new THREE.MeshStandardMaterial({map:barkTex,color:0xb08a5e,roughness:.95});
   const trunk=M(new THREE.CylinderGeometry(3.4,4.6,12,10),bark,bx,by+5.4,bz);trunk.rotation.y=.4;
   for(let i=0;i<5;i++){const a=i/5*6.28;const r=M(new THREE.ConeGeometry(.7,4.5,6),bark,bx+Math.cos(a)*3.6,by+.8,bz+Math.sin(a)*3.6);r.rotation.set(Math.sin(a)*1.1,0,-Math.cos(a)*1.1);}
   const leaf=new THREE.MeshStandardMaterial({color:0x2e7a2e,roughness:.9,flatShading:GQ==='low'});
   for(const [dx,dy,dz,r] of [[0,12.6,0,4.6],[-3,11,1,3],[3,11,-1,3]])M(new THREE.IcosahedronGeometry(r,1),leaf,bx+dx,by+dy,bz+dz);
   const mouth=M(new THREE.CircleGeometry(1.7,14),new THREE.MeshBasicMaterial({color:0x120a05}),c.x-Math.sin(dirA)*10.6,gy(c.x,c.z)+1.7,c.z-Math.cos(dirA)*10.6);mouth.rotation.y=dirA;
   const mush=new THREE.MeshStandardMaterial({color:0x9fe870,emissive:new THREE.Color(0x2a7a1a),emissiveIntensity:.8});
   for(let i=0;i<6;i++){const a=rnd(0,6.28);M(new THREE.SphereGeometry(.16,8,6),mush,c.x+Math.cos(a)*rnd(3,8),gy(c.x,c.z)+.25,c.z+Math.sin(a)*rnd(3,8));}
  }else if(k.biome==='snow'){ // glacier ice cave: arch, icicles, drifts, ice glow
   const ice=new THREE.MeshStandardMaterial({color:0xbfe4f5,roughness:.12,transparent:true,opacity:.88});
   for(const sgn of[-1,1]){const px=c.x+Math.sin(dirA)*13-Math.cos(dirA)*sgn*3.4,pz=c.z+Math.cos(dirA)*13+Math.sin(dirA)*sgn*3.4;const p2=M(new THREE.CylinderGeometry(1,1.6,8.5,8),ice,px,gy(px,pz)+4,pz);p2.rotation.z=Math.cos(dirA)*sgn*.18;p2.rotation.x=-Math.sin(dirA)*sgn*.18;}
   for(let i=0;i<7;i++){const t=i/6-.5;const ic=M(new THREE.ConeGeometry(.22,1.4+((i*37)%10)/7,6),ice,c.x+Math.sin(dirA)*13-Math.cos(dirA)*t*5.4,gy(c.x,c.z)+5.6-Math.abs(t)*.7,c.z+Math.cos(dirA)*13+Math.sin(dirA)*t*5.4);ic.rotation.x=Math.PI;}
   const snow=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.9});
   for(let i=0;i<5;i++){const a=i/5*6.28+.4;M(new THREE.SphereGeometry(rnd(1.6,2.8),10,8),snow,c.x+Math.cos(a)*10.6,gy(c.x,c.z)+.2,c.z+Math.sin(a)*10.6,1,.42,1);}
   M(new THREE.CylinderGeometry(4,6.5,10,9),ice,bx,by+4,bz);
  }else if(k.biome==='jungle'){ // vine temple ruins behind a waterfall
   const stone=new THREE.MeshStandardMaterial({map:rockTex,color:0xa8a894,roughness:.92}),vine=new THREE.MeshStandardMaterial({color:0x2e8b2e,roughness:.9});
   for(const sgn of[-1,1])for(let j=0;j<3;j++){const px=bx-Math.cos(dirA)*sgn*(2+j*1.4),pz=bz+Math.sin(dirA)*sgn*(2+j*1.4);M(new THREE.BoxGeometry(1.1,1,1.1),stone,px,by+.5+j*1.02,pz);}
   M(new THREE.BoxGeometry(7,.9,1.4),stone,bx,by+3.6,bz);
   for(let i=0;i<8;i++){const a=rnd(0,6.28);const v=M(new THREE.CylinderGeometry(.06,.09,rnd(2.5,4.5),5),vine,c.x+Math.cos(a)*11,gy(c.x,c.z)+rnd(3.5,5),c.z+Math.sin(a)*11);v.rotation.z=rnd(-.25,.25);}
   for(let i=0;i<5;i++)M(new THREE.ConeGeometry(.5,1.6,6),vine,c.x+rnd(-9,9),gy(c.x,c.z)+rnd(4,6),c.z+rnd(-9,9)).rotation.x=Math.PI;
   const wfx=c.x-Math.cos(dirA)*4.5,wfz=c.z+Math.sin(dirA)*4.5;const wf=M(new THREE.PlaneGeometry(3.2,7),new THREE.MeshStandardMaterial({color:0x7fc8e8,transparent:true,opacity:.55,roughness:.1,side:THREE.DoubleSide}),wfx,gy(wfx,wfz)+3.4,wfz);wf.rotation.y=dirA+Math.PI/2;k.waterfall=wf;
   const pool=M(new THREE.CircleGeometry(2.6,16),new THREE.MeshStandardMaterial({color:0x3a8ec8,transparent:true,opacity:.7}),wfx,gy(wfx,wfz)+.09,wfz);pool.rotation.x=-Math.PI/2;
  }else if(k.biome==='desert'){ // sandstone tomb under a rock arch, dunes + cactus
   const sand=new THREE.MeshStandardMaterial({map:rockTex,color:0xe8c088,roughness:.95});
   const arch=M(new THREE.CylinderGeometry(1,1.3,15,8),sand,bx,by+6.4,bz,1,1,1);arch.rotation.z=Math.PI/2;arch.rotation.y=-dirA;
   for(const sgn of[-1,1])M(new THREE.BoxGeometry(1.6,5.5,1.6),sand,bx-Math.cos(dirA)*sgn*6.4,by+2.4,bz+Math.sin(dirA)*sgn*6.4);
   const door=M(new THREE.PlaneGeometry(2.2,3.4),new THREE.MeshBasicMaterial({color:0x180e04}),c.x-Math.sin(dirA)*10.8,gy(c.x,c.z)+1.7,c.z-Math.cos(dirA)*10.8);door.rotation.y=dirA;
   const dune=new THREE.MeshStandardMaterial({color:0xeccf96,roughness:1});
   for(let i=0;i<6;i++){const a=i/6*6.28+.7;M(new THREE.SphereGeometry(rnd(2.4,4.2),10,8),dune,c.x+Math.cos(a)*rnd(14,20),gy(c.x,c.z),c.z+Math.sin(a)*rnd(14,20),1,.3,1);}
   const cac=new THREE.MeshStandardMaterial({color:0x2e8b3a,roughness:.8});
   for(const sgn of[-1,1]){const cx2=c.x+Math.sin(dirA)*9-Math.cos(dirA)*sgn*5,cz2=c.z+Math.cos(dirA)*9+Math.sin(dirA)*sgn*5;M(new THREE.CylinderGeometry(.28,.34,2.6,7),cac,cx2,gy(cx2,cz2)+1.3,cz2);M(new THREE.CylinderGeometry(.16,.16,1,6),cac,cx2+sgn*.45,gy(cx2,cz2)+1.7,cz2).rotation.z=sgn*.7;}
  }else{ // inside the volcano: crater cone, lava flows, obsidian, ash
   const obs=new THREE.MeshStandardMaterial({color:0x14100e,roughness:.25,metalness:.35}),ash=new THREE.MeshStandardMaterial({color:0x4a423e,roughness:1,flatShading:true});
   const cone=M(new THREE.ConeGeometry(11,10,12,1,true),ash,bx,by+4.2,bz);
   const crater=M(new THREE.CircleGeometry(3.2,14),new THREE.MeshBasicMaterial({color:0xff5a10}),bx,by+9.1,bz);crater.rotation.x=-Math.PI/2;
   const lavaM=new THREE.MeshBasicMaterial({color:0xff6a18});
   for(let i=0;i<3;i++){const off=(i-1)*2.2;const fl=M(new THREE.PlaneGeometry(1.3,11),lavaM,c.x-Math.sin(dirA)*(6-i*2)-Math.cos(dirA)*off,gy(c.x,c.z)+.14+i*.02,c.z-Math.cos(dirA)*(6-i*2)+Math.sin(dirA)*off);fl.rotation.x=-Math.PI/2;fl.rotation.z=dirA;}
   k.shimmer=[];for(let i=0;i<3;i++){const sh2=M(new THREE.PlaneGeometry(2.6,2.2),new THREE.MeshBasicMaterial({color:0xffc080,transparent:true,opacity:.07,side:THREE.DoubleSide,depthWrite:false}),c.x-Math.sin(dirA)*(4+i*3),gy(c.x,c.z)+1.3,c.z-Math.cos(dirA)*(4+i*3));sh2.rotation.y=dirA;k.shimmer.push(sh2);}
   for(let i=0;i<6;i++){const a=i/6*6.28+.3;M(new THREE.CylinderGeometry(.3,.7,rnd(2,4.4),6),obs,c.x+Math.cos(a)*10.4,gy(c.x,c.z)+1.4,c.z+Math.sin(a)*10.4).rotation.z=rnd(-.2,.2);}
   for(let i=0;i<5;i++)M(new THREE.IcosahedronGeometry(rnd(.7,1.4),0),ash,c.x+rnd(-9,9),gy(c.x,c.z)+.4,c.z+rnd(-9,9));
  }
  const cryC={forest:0x7fe870,snow:0x9fe8ff,jungle:0x5aff8a,desert:0xffd94d,lava:0xff7a30}[k.biome];
  for(let i=0;i<5;i++){const a=i/5*6.28+.5,cx=c.x+Math.cos(a)*8,cz=c.z+Math.sin(a)*8;const cr=new THREE.Mesh(new THREE.OctahedronGeometry(.5),new THREE.MeshStandardMaterial({color:cryC,emissive:new THREE.Color(cryC),emissiveIntensity:1.2}));cr.position.set(cx,gy(cx,cz)+.8,cz);g.add(cr);}
  if(GQ!=='low'){const lc={forest:0x7fe870,snow:0x8fd4ff,jungle:0x5aff8a,desert:0xffd94d,lava:0xff6a22}[k.biome];const L=new THREE.PointLight(lc,k.biome==='lava'?34:16,21,1.4);L.position.set(c.x,gy(c.x,c.z)+3,c.z);g.add(L);k.caveLight=L;}
  const sign=new THREE.Group();const sp2=new THREE.Mesh(new THREE.BoxGeometry(.16,1.5,.16),new THREE.MeshStandardMaterial({color:0x8a6a42}));sp2.position.y=.75;sign.add(sp2);const bd=new THREE.Mesh(new THREE.BoxGeometry(1.3,.6,.08),new THREE.MeshStandardMaterial({color:0xa8834f}));bd.position.y=1.35;sign.add(bd);sign.position.set(k.exit.x,gy(k.exit.x,k.exit.z),k.exit.z);sign.rotation.y=dirA;g.add(sign);scene.add(g);k.sign=sign;k.landmark=g;
  const fig=makeHuman(k.look);fig.position.set(k.hide.x,gy(k.hide.x,k.hide.z),k.hide.z);scene.add(fig);
  const ent={def:k,fig,x:k.hide.x,z:k.hide.z,dir:dirA,scared:0,zzz:0,goneT:0};KIDENTS.push(ent);
  // guardians thematically placed flanking the landmark entrance
  for(let i=0;i<2;i++){const sgn=i?1:-1;const a=spawnAnimal(k.enemy,c.x+Math.sin(dirA)*9.5-Math.cos(dirA)*sgn*3.2,c.z+Math.cos(dirA)*9.5+Math.sin(dirA)*sgn*3.2);a.cave=1;a.agro=false;}
 }}
function kidEnt(id){return KIDENTS.find(e=>e.def.id===id);}
function hintKid(k,src){const st=kidState[k.id];if(!st||st.hinted||st.stage==='rescued')return;st.hinted=1;save();toast('🗺️ '+(src==='sign'?'A weathered signpost: ':'Rumor: ')+'“'+k.name+' of '+k.village+' is lost at '+k.lm+'!” Cave marked on your map (M).'+(k.biome==='lava'?' ⚠️ It is scorching in there — wear heat gear!':''),4.5);}
function talkKid(e){const k=e.def,st=kidState[k.id];const n={name:k.name,v:{name:k.village},look:k.look,pers:k.pers};
 if(st.stage==='rescued')return say(n,'You saved me! Everyone at '+k.village+' says you are a hero.',[{l:'👋 Stay safe',f:endTalk}]);
 if(st.stage==='follow')return say(n,'I am right behind you! Just… not too close to anything with teeth.',[{l:'🏃 Let’s go!',f:endTalk},{l:'🙈 Wait here a sec',f:()=>{st.stage='wait';save();endTalk();}}]);
 say(n,k.line+'\n\nPlease — will you walk me out of this cave? I will follow you. If something scary comes close I might run back and hide…',[ {l:'🤝 Follow me, '+k.name+'!',f:()=>{st.stage='follow';st.hinted=1;sfx.win();toast('🧒 '+k.name+' is following you — lead them out of the cave into daylight!',3);save();endTalk();}},{l:'Not yet — stay hidden',f:endTalk}]);}
function rescueKid(e){MP.progress();const k=e.def,st=kidState[k.id];st.stage='rescued';e.goneT=6;add(k.reward,1);sfx.win();equipVisual();
 toast('🎉 <b>'+k.name+' is safe!</b> Back in '+k.village+' they will tell everyone what you did.<br>Reward: '+ITEMS[k.reward],5);
 floatTxt(e.x,e.z,'🎉 SAFE!','#7fe870');say({name:k.name,v:{name:k.village},look:k.look,pers:k.pers},'DAYLIGHT! Real actual daylight! Thank you thank you! Take this — I was saving it for a hero. ('+ITEMS[k.reward]+')',[{l:'🎁 You’re safe now',f:endTalk}]);save();}
function updKids(dt){const _tt=performance.now()/1000;for(const e of KIDENTS){const k=e.def,st=kidState[k.id];if(k.waterfall)k.waterfall.material.opacity=.45+.16*Math.sin(_tt*3.1);if(k.shimmer)k.shimmer.forEach((sh2,i)=>{sh2.material.opacity=.045+.035*Math.sin(_tt*5+i*1.4);sh2.rotation.y+=Math.sin(_tt*2+i)*.0015;});if(!st)continue;
  if(Math.hypot(P.x-k.cave.x,P.z-k.cave.z)<17&&st.stage!=='rescued')hintKid(k,'sign');
  if(st.stage==='rescued'){if(e.goneT>0){e.goneT-=dt;e.x+=Math.sin(Math.atan2(k.exit.x-e.x,k.exit.z-e.z))*3*dt;e.z+=Math.cos(Math.atan2(k.exit.x-e.x,k.exit.z-e.z))*3*dt;e.fig.position.set(e.x,H(e.x,e.z),e.z);rigTick(e.fig,dt);rigSet(e.fig,'run',1.4);if(e.goneT<=0){scene.remove(e.fig);e.fig.visible=false;}}continue;}
  const dp=Math.hypot(P.x-e.x,P.z-e.z);let tx=null,tz=null,spd=0;
  let foe=null,fd=7;for(const a of animals)if(a.alive&&(a.K.beh==='hostile'||a.K.beh==='cultist'||a.agro)){const d=Math.hypot(a.x-e.x,a.z-e.z);if(d<fd){fd=d;foe=a;}}
  e.scared=foe?1:0;
  if(foe&&(st.stage==='follow'||st.stage==='wait')){tx=k.hide.x;tz=k.hide.z;spd=5.2;if(fd<2.6){e.fig.scale.y=.62;}}
  else{e.fig.scale.y=1;if(st.stage==='follow'){if(dp>26){e.x=P.x-Math.sin(P.dir)*2;e.z=P.z-Math.cos(P.dir)*2;}else if(dp>2.3){tx=P.x-Math.sin(P.dir)*1.6;tz=P.z-Math.cos(P.dir)*1.6;spd=dp>7?7:4.6;}}}
  if(tx!==null){const d=Math.hypot(tx-e.x,tz-e.z);if(d>.2){const dir=Math.atan2(tx-e.x,tz-e.z);const nx=e.x+Math.sin(dir)*spd*dt,nz=e.z+Math.cos(dir)*spd*dt;if(!blocked(nx,nz,.35)){e.x=nx;e.z=nz;}else if(!blocked(nx,e.z,.35))e.x=nx;else if(!blocked(e.x,nz,.35))e.z=nz;e.dir=dir;}}
  e.fig.position.set(e.x,H(e.x,e.z),e.z);e.fig.rotation.y=e.dir;rigTick(e.fig,dt);rigSet(e.fig,spd>0?'run':'idle',spd>5?1.3:1);
  if(st.stage==='follow'&&(Math.hypot(e.x-k.exit.x,e.z-k.exit.z)<4.5||Math.hypot(e.x-k.cave.x,e.z-k.cave.z)>16))rescueKid(e);
 }}
// ----- Tree of Healing -----
const TREE={x:16,z:-20};let treeGroup=null,treeCanopy=[],treeGlow=null,treeOrb=null,treeBlossoms=null,treeFruit=null;
function claimableParts(){return BOSSES.filter(b=>bossDone[b.id]&&PART_FOR_BOSS[b.id]&&!treeInstalled.includes(PART_FOR_BOSS[b.id])&&!has(PART_FOR_BOSS[b.id])).map(b=>PART_FOR_BOSS[b.id]);}
function buildTree(){treeGroup=new THREE.Group();const y=H(TREE.x,TREE.z);
 const trunk=new THREE.Mesh(new THREE.CylinderGeometry(1.5,2.7,13,10),new THREE.MeshStandardMaterial({color:0x6a4a2c,roughness:.95}));trunk.position.y=6.5;trunk.castShadow=true;treeGroup.add(trunk);
 for(let i=0;i<4;i++){const a=i/4*6.28+.6;const br=new THREE.Mesh(new THREE.CylinderGeometry(.35,.6,6,7),trunk.material);br.position.set(Math.cos(a)*2.2,11.5,Math.sin(a)*2.2);br.rotation.z=Math.cos(a)*.8;br.rotation.x=-Math.sin(a)*.8;treeGroup.add(br);}
 treeCanopy=[];const cm=new THREE.MeshStandardMaterial({color:0x8a9284,roughness:.9,flatShading:true});
 for(const [dx,dy,dz,r] of [[0,15.5,0,5.2],[-3.4,13.8,1,3.6],[3.4,13.8,-1,3.6],[0,14.2,3.4,3.4],[0,14.2,-3.4,3.4]]){const m=new THREE.Mesh(new THREE.IcosahedronGeometry(r,1),cm.clone());m.position.set(dx,dy,dz);m.castShadow=true;treeGroup.add(m);treeCanopy.push(m);}
 treeBlossoms=new THREE.Group();const bm=new THREE.MeshBasicMaterial({color:0xffb7d5});for(let i=0;i<14;i++){const a=i/14*6.28;const b2=new THREE.Mesh(new THREE.SphereGeometry(.32,8,6),bm);b2.position.set(Math.cos(a)*4.4,14.5+Math.sin(i*2.3)*1.6,Math.sin(a)*4.4);treeBlossoms.add(b2);}treeBlossoms.visible=false;treeGroup.add(treeBlossoms);
 treeFruit=new THREE.Group();const fm=new THREE.MeshStandardMaterial({color:0xffc93f,emissive:new THREE.Color(0xcc8800),emissiveIntensity:.7});for(let i=0;i<6;i++){const a=i/6*6.28;const f2=new THREE.Mesh(new THREE.SphereGeometry(.34,8,6),fm);f2.position.set(Math.cos(a)*3.6,12.8,Math.sin(a)*3.6);treeFruit.add(f2);}treeFruit.visible=false;treeGroup.add(treeFruit);
 treeGlow=new THREE.PointLight(0x7fe870,0,26,1.2);treeGlow.position.y=8;treeGroup.add(treeGlow);
 treeOrb=new THREE.Mesh(new THREE.OctahedronGeometry(.55),new THREE.MeshStandardMaterial({color:0x9fe8ff,emissive:new THREE.Color(0x2288ff),emissiveIntensity:2}));treeOrb.position.set(3.2,1.4,0);treeGroup.add(treeOrb);
 treeGroup.position.set(TREE.x,y,TREE.z);scene.add(treeGroup);structs.push({type:'healing_tree',x:TREE.x,z:TREE.z,perm:1,mesh:treeGroup});for(const o of RES)if(Math.hypot(o.x-TREE.x,o.z-TREE.z)<10){o.alive=false;o.respawnAt=Infinity;hideRes(o);}updTreeLook();}
function updTreeLook(){const n=treeInstalled.length;const cols=[0x8a9284,0x86b364,0x63b84a,0x46bd3f,0x8ae04a];
 for(const m of treeCanopy){m.material.color.setHex(cols[n]);m.material.emissive=new THREE.Color(n>=4?0xcc9900:n>=2?0x1d5c1a:0x000000);m.material.emissiveIntensity=n>=4?.45:.5;}
 if(treeBlossoms)treeBlossoms.visible=n>=2;if(treeFruit)treeFruit.visible=n>=4;if(treeGlow)treeGlow.intensity=n*14;if(treeOrb)treeOrb.visible=claimableParts().length>0;}
function treeBurst(){for(let i=0;i<22;i++){const m=new THREE.Mesh(new THREE.BoxGeometry(.16,.16,.16),new THREE.MeshBasicMaterial({color:[0x7fe870,0xffb7d5,0xffd94d,0x46bd3f][i%4]}));m.position.set(TREE.x,H(TREE.x,TREE.z)+2,TREE.z);scene.add(m);const a=rnd(0,6.28);BFX.push({m,t:rnd(.7,1.4),vx:Math.sin(a)*rnd(1,4),vy:rnd(3,6.5),vz:Math.cos(a)*rnd(1,4)});}}
function installPart(part){add(part,-1);treeInstalled.push(part);MP.progress();updTreeLook();treeBurst();shake=.5;sfx.win();tone(523,.4,'sine',.12);setTimeout(()=>tone(659,.4,'sine',.12),160);setTimeout(()=>tone(784,.6,'sine',.12),320);
 if(part==='frost_root'){P.maxHp+=20;P.hp=Math.min(P.maxHp,P.hp+20);}
 for(let i=0;i<2;i++){const a=spawnAnimal(Math.random()<.5?'deer':'rabbit',TREE.x+rnd(-8,8),TREE.z+rnd(-8,8));}
 toast('🌳 <b>'+ITEMS[part]+' installed!</b> The Tree of Healing shivers, new leaves unfurl…<br>Bonus: '+PART_BONUS[part]+'<br>Tree restored: '+treeInstalled.length+'/4',4.5);
 if(treeInstalled.length>=4){setTimeout(()=>{toast('🌟 <b>THE TREE OF HEALING BLOOMS AGAIN!</b> Golden leaves, healing fruit, and a warm aura around every campfire. The forest thanks you, hero of Emberfall! 🎉',6);sfx.win();},900);add('healing_fruit',2);}
 save();}
function treeTarget(){if(Math.hypot(P.x-TREE.x,P.z-TREE.z)>5.5)return null;
 const claim=claimableParts();if(claim.length)return{l:'CLAIM TREE PART (shrine orb)',f:()=>{add(claim[0],1);updTreeLook();toast('🔮 The tree shrine returns what was lost: '+ITEMS[claim[0]]+' — install it with E!',3.5);save();}};
 const carried=Object.keys(PART_FOR_BOSS).map(b=>PART_FOR_BOSS[b]).find(p=>has(p)&&!treeInstalled.includes(p));
 if(carried)return{l:'INSTALL '+ITEMS[carried].replace(/^\S+ /,'').toUpperCase(),f:()=>installPart(carried)};
 if(treeInstalled.length>=4&&dayT>=fruitAt)return{l:'PICK HEALING FRUIT',f:()=>{fruitAt=dayT+DAY;add('healing_fruit',2);toast('🍎 +2 Healing Fruit (eat from the bag — big heal!)');sfx.eat();save();}};
 const missing=BOSSES.filter(b=>!bossDone[b.id]).map(b=>b.name);
 return{l:'TREE OF HEALING ('+treeInstalled.length+'/4)',f:()=>toast('🌳 The Tree of Healing ('+treeInstalled.length+'/4 parts). '+(missing.length?'Defeat the bosses of the outer biomes ('+missing.join(', ')+') — each carries a Tree Part.':'All parts restored!'),4)};}
function applyKidStates(){for(const e of KIDENTS){if(kidStage(e.def.id)==='rescued'){e.fig.visible=false;}}}

// ---------- bosses ----------
let boss=null;const bossObjs={};
function buildBossLairs(){for(const B of BOSSES){const y=H(B.x,B.z);const mat=new THREE.MeshStandardMaterial({color:B.tint,roughness:.7,emissive:B.emis?new THREE.Color(B.emis):new THREE.Color(0),emissiveIntensity:.3});
 for(let i=0;i<8;i++){const a=i/8*6.28,p=new THREE.Mesh(new THREE.CylinderGeometry(.6,.8,5,8),mat);p.position.set(B.x+Math.cos(a)*19,y+2.5,B.z+Math.sin(a)*19);p.castShadow=true;scene.add(p);}
 const ring=new THREE.Mesh(new THREE.RingGeometry(17,18,48),new THREE.MeshBasicMaterial({color:B.tint,transparent:true,opacity:.5}));ring.rotation.x=-Math.PI/2;ring.position.set(B.x,y+.06,B.z);scene.add(ring);}}
function spawnBoss(B){const f=makeHuman(B.look);f.position.set(B.x,H(B.x,B.z),B.z);scene.add(f);
 boss={B,fig:f,x:B.x,z:B.z,hp:B.hp,max:B.hp,alive:true,cd:2,act:null,actT:0,rad:1.4*B.look.scale/3*2,contact:0,phase2:false};sfx.boss();toast('⚠️ '+B.name+' awakens!');}
function bossAttack(b){const B=b.B;const opts=B.attacks;let a=opts[Math.floor(Math.random()*opts.length)];const dmg=B.dmg*(b.phase2?1.25:1);
 const ang=Math.atan2(P.x-b.x,P.z-b.z);
 if(a==='slam'){rigOnce(b.fig,'cast',1);telegraph(b.x,b.z,7,1.1,t=>{if(Math.hypot(P.x-t.x,P.z-t.z)<t.r)hurtPlayer(dmg*1.3,null);shake=.4;});}
 else if(a==='volley'){rigOnce(b.fig,'attack',.6);for(let i=-2;i<=2;i++)shoot('enemy',b.x,b.z,ang+i*.22,13,dmg*.6,B.proj,.45);}
 else if(a==='ring'){for(let i=0;i<14;i++)shoot('enemy',b.x,b.z,i/14*6.28,10,dmg*.55,B.proj,.4,3);if(b.phase2)setTimeout(()=>{if(b.alive)for(let i=0;i<14;i++)shoot('enemy',b.x,b.z,(i+.5)/14*6.28,10,dmg*.55,B.proj,.4,3);},500);}
 else if(a==='spiral'){for(let k=0;k<16;k++)setTimeout(()=>{if(b.alive)shoot('enemy',b.x,b.z,k*.55,11,dmg*.5,B.proj,.38,3);},k*90);}
 else if(a==='charge'){b.act='charge';b.actT=1.5;b.cAng=ang;telegraph(b.x+Math.sin(ang)*6,b.z+Math.cos(ang)*6,3,.6,null);}
 else if(a==='meteor'){for(let i=0;i<(b.phase2?7:5);i++){const x=P.x+rnd(-5,5),z=P.z+rnd(-5,5);telegraph(x,z,2.4,1.3+i*.12,t=>{if(Math.hypot(P.x-t.x,P.z-t.z)<t.r)hurtPlayer(dmg,null);shake=.25;});}}
 else if(a==='summon'){const n=animals.filter(x=>x.minion&&x.alive).length;if(n<2)for(let i=0;i<1;i++){const m=spawnAnimal(B.minion,b.x+rnd(-4,4),b.z+rnd(-4,4));m.minion=1;m.agro=true;}else return bossAttack(b);}
 else if(a==='teleport'){const ba=ang+Math.PI;const nx=P.x+Math.sin(ba)*-4,nz=P.z+Math.cos(ba)*-4;floatTxt(b.x,b.z,'✨','#ff0');b.x=clamp(nx,B.x-17,B.x+17);b.z=clamp(nz,B.z-17,B.z+17);telegraph(b.x,b.z,5,.9,t=>{if(Math.hypot(P.x-t.x,P.z-t.z)<t.r)hurtPlayer(dmg,null);});}
 b.cd=(b.phase2?2.6:3.4)+Math.random();}
function updBoss(dt){if(!boss){for(const B of BOSSES){if(bossDone[B.id])continue;if(Math.hypot(P.x-B.x,P.z-B.z)<22)spawnBoss(B);}
  $('bossbar').classList.add('hidden');return;}
 const b=boss,B=b.B;rigTick(b.fig,dt);
 if(!b.alive){b.deadT-=dt;if(b.deadT<=0){scene.remove(b.fig);boss=null;}return;}
 const dp=Math.hypot(P.x-b.x,P.z-b.z);
 if(b.burnT>0){b.burnT-=dt;b.hp-=6*dt;floatTxt(b.x,b.z,'🔥','#f80');if(b.hp<=0){hitBoss(0);return;}}
 if(dp>40||P.dead){scene.remove(b.fig);boss=null;toast(B.name+' retreats to its lair…');return;}
 $('bossbar').classList.remove('hidden');$('bossName').textContent=B.name+(b.phase2?' (ENRAGED)':'');$('bossB').style.width=(b.hp/b.max*100)+'%';
 if(!b.phase2&&b.hp<b.max/2){b.phase2=true;toast(B.name+' is enraged!');}
 const ang=Math.atan2(P.x-b.x,P.z-b.z);
 if(b.act==='charge'){b.actT-=dt;if(b.actT<.6){const s=18*dt;b.x+=Math.sin(b.cAng)*s;b.z+=Math.cos(b.cAng)*s;rigSet(b.fig,'run',1.6);if(dp<b.rad+.8&&b.contact<=0){hurtPlayer(B.dmg*1.2,null);b.contact=1;}}if(b.actT<=0)b.act=null;}
 else{b.cd-=dt;if(dp>b.rad+1.2){const s=(b.phase2?4.2:3.2)*dt;b.x+=Math.sin(ang)*s;b.z+=Math.cos(ang)*s;rigSet(b.fig,'walk',1);}else{rigSet(b.fig,'idle');if(b.contact<=0){rigOnce(b.fig,'attack',.6);hurtPlayer(B.dmg*.8,null);b.contact=1.3;}}
  if(b.cd<=0)bossAttack(b);}
 b.contact-=dt;b.x=clamp(b.x,B.x-18,B.x+18);b.z=clamp(b.z,B.z-18,B.z+18);
 b.fig.position.set(b.x,H(b.x,b.z),b.z);b.fig.rotation.y=b.act==='charge'?b.cAng:ang;}
function hitBoss(d){const b=boss;if(!b||!b.alive)return;b.hp-=d;if(bestWeapon()==='lava_sword')b.burnT=3;floatTxt(b.x,b.z,'-'+Math.round(d),'#f66');sfx.hit();
 if(b.hp<=0){b.alive=false;b.deadT=4;rigOnce(b.fig,'death',1.5);bossDone[b.B.id]=1;MP.progress();add(b.B.trophy,1);const got=[ITEMS[b.B.trophy]];for(const k in b.B.loot){add(k,b.B.loot[k]);got.push('+'+b.B.loot[k]+' '+ITEMS[k]);}
  {const part=PART_FOR_BOSS[b.B.id];if(part&&!treeInstalled.includes(part)&&!has(part)){add(part,1);got.push('🌳 Tree Part: '+ITEMS[part]+' — take it to the Tree of Healing!');}}
  for(const m of animals)if(m.minion&&m.alive)killAnimal(m,false);$('bossbar').classList.add('hidden');sfx.win();toast('🏆 '+b.B.name+' defeated!<br>'+got.join('  '),5);
  if(BOSSES.every(x=>bossDone[x.id])&&!has('crown')){add('crown',1);setTimeout(()=>{$('win').classList.remove('hidden');paused=true;},2500);}save();}}

// ---------- structures ----------
function structMesh(type,lvl){const g=new THREE.Group();const wood=new THREE.MeshStandardMaterial({color:0x8a5a30,roughness:.9}),stone=new THREE.MeshStandardMaterial({color:0x8a8a8a,flatShading:true});
 if(type==='campfire')buildFire(g,lvl||1,wood,stone);
 else if(type==='bench'){const t=new THREE.Mesh(new THREE.BoxGeometry(1.6,.15,.9),wood);t.position.y=.9;g.add(t);for(const [x,z] of [[-.7,-.35],[.7,-.35],[-.7,.35],[.7,.35]]){const l=new THREE.Mesh(new THREE.BoxGeometry(.12,.9,.12),wood);l.position.set(x,.45,z);g.add(l);}const s=new THREE.Mesh(new THREE.BoxGeometry(.4,.2,.3),stone);s.position.set(.4,1.07,0);g.add(s);}
 else if(type==='tent'){const geo=new THREE.ConeGeometry(1.8,2.2,4);const t=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color:0xc06a2a,flatShading:true}));t.position.y=1.1;t.rotation.y=Math.PI/4;g.add(t);}
 else if(type==='chest'){const b=new THREE.Mesh(new THREE.BoxGeometry(1,.6,.6),wood);b.position.y=.3;const l=new THREE.Mesh(new THREE.BoxGeometry(1.05,.15,.65),new THREE.MeshStandardMaterial({color:0x5a3a1a}));l.position.y=.65;g.add(b,l);}
 else if(type==='bed'){const b=new THREE.Mesh(new THREE.BoxGeometry(1.1,.4,2),wood);b.position.y=.25;const m=new THREE.Mesh(new THREE.BoxGeometry(1,.2,1.9),new THREE.MeshStandardMaterial({color:0xc04040}));m.position.y=.5;const p=new THREE.Mesh(new THREE.BoxGeometry(.8,.15,.4),new THREE.MeshStandardMaterial({color:0xf4f0e8}));p.position.set(0,.65,-.7);g.add(b,m,p);}
 else if(type==='fence'){for(const x of[-.9,0,.9]){const p=new THREE.Mesh(new THREE.BoxGeometry(.14,1.1,.14),wood);p.position.set(x,.55,0);g.add(p);}for(const y of[.4,.8]){const r=new THREE.Mesh(new THREE.BoxGeometry(2,.1,.07),wood);r.position.y=y;g.add(r);}}
 else if(type==='wall'){const w=new THREE.Mesh(new THREE.BoxGeometry(2,1.6,.5),new THREE.MeshStandardMaterial({color:0x9a9a96,map:rockTex,roughness:.9}));w.position.y=.8;g.add(w);}
 else if(type==='rug'){part(g,BX,new THREE.MeshStandardMaterial({color:0xa03040,roughness:.95}),0,.03,0,1.7,.06,1.15);part(g,BX,new THREE.MeshStandardMaterial({color:0xe8c86a,roughness:.95}),0,.045,0,1.4,.02,.85);}
 else if(type==='table'){part(g,BX,wood,0,.78,0,1.5,.09,.9);for(const [x,z] of [[-.65,-.35],[.65,-.35],[-.65,.35],[.65,.35]])part(g,BX,wood,x,.38,z,.1,.76,.1);}
 else if(type==='flower_pot'){part(g,CY,new THREE.MeshStandardMaterial({color:0xb85a30,roughness:.9}),0,.22,0,.3,.44,.24);part(g,SP,new THREE.MeshStandardMaterial({color:0x3f9e4d,roughness:.9}),0,.55,0,.26,.22,.26);for(let i=0;i<4;i++)part(g,SP,new THREE.MeshStandardMaterial({color:[0xff7fb0,0xffd94d,0xffffff,0xff8a5a][i]}),Math.cos(i*1.7)*.17,.68,Math.sin(i*1.7)*.17,.07,.07,.07);}
 else if(type==='sign_post'){part(g,BX,wood,0,.55,0,.11,1.1,.11);const bd=part(g,BX,wood,0,1.0,.02,.85,.34,.05);bd.rotation.z=.06;}
 else if(type==='path_stones'){for(const [x,z,s2] of [[-.5,0,.42],[.1,.18,.5],[.62,-.1,.4]]){const st=new THREE.Mesh(new THREE.CylinderGeometry(s2,s2*1.1,.09,9),stone);st.position.set(x,.045,z);g.add(st);}}
 else if(defMesh(type,g,wood,stone)){}
 else if(type==='torch_post'){part(g,CY,wood,0,.7,0,.07,1.4,.07);const fl=new THREE.Mesh(new THREE.ConeGeometry(.13,.32,7),new THREE.MeshBasicMaterial({color:0x553311}));fl.position.y=1.55;g.add(fl);g.userData.flame=fl;}
 else if(type==='lamp_post'){const ir=new THREE.MeshStandardMaterial({color:0x2a2a2a,metalness:.6,roughness:.4});part(g,CY,ir,0,1.2,0,.07,2.4,.07);const lm=new THREE.Mesh(new THREE.BoxGeometry(.32,.4,.32),new THREE.MeshStandardMaterial({color:0xfff0c0,emissive:new THREE.Color(0xffc060),emissiveIntensity:.1}));lm.position.y=2.55;g.add(lm);g.userData.lamp=lm;}
 else if(type==='trap'){const b=new THREE.Mesh(new THREE.CylinderGeometry(.5,.5,.06,12),new THREE.MeshStandardMaterial({color:0x6a6a6a,metalness:.6}));b.position.y=.04;g.add(b);for(let i=0;i<8;i++){const t=new THREE.Mesh(new THREE.ConeGeometry(.04,.18,4),new THREE.MeshStandardMaterial({color:0xaaaaaa,metalness:.7}));t.position.set(Math.cos(i/8*6.28)*.42,.14,Math.sin(i/8*6.28)*.42);g.add(t);}}
 g.traverse(o=>{if(o.isMesh){o.castShadow=type!=='campfire';o.receiveShadow=true;}});return g;}
function buildFire(g,L,wood,stone){const fl=(fs,y)=>{const a=new THREE.Mesh(new THREE.ConeGeometry(.35*fs,.9*fs,8),new THREE.MeshBasicMaterial({color:0xff8a20}));a.position.y=y+.45*fs*.6;a.userData.flame=1;const b=new THREE.Mesh(new THREE.ConeGeometry(.2*fs,.6*fs,8),new THREE.MeshBasicMaterial({color:0xffe070}));b.position.y=y+.3*fs*.6;b.userData.flame=1;g.add(a,b);g.userData.fy=y;};
 const ring=(n,R,sz,y=.12)=>{for(let i=0;i<n;i++){const st=new THREE.Mesh(new THREE.DodecahedronGeometry(sz,0),stone);st.position.set(Math.cos(i/n*6.28)*R,y,Math.sin(i/n*6.28)*R);st.rotation.set(i,i*2,0);g.add(st);}};
 const logs=(n,len,tilt,y=.15,rad=.08)=>{for(let i=0;i<n;i++){const l=new THREE.Mesh(new THREE.CylinderGeometry(rad,rad,len,6),wood);const a=i/n*6.28;if(tilt){l.position.set(Math.cos(a)*len*.22,y+len*.4,Math.sin(a)*len*.22);l.rotation.set(Math.sin(a)*tilt,0,-Math.cos(a)*tilt);}else{l.rotation.z=Math.PI/2;l.rotation.y=a;l.position.y=y;}g.add(l);}};
 const iron=new THREE.MeshStandardMaterial({color:0x3a3a3e,metalness:.8,roughness:.4}),gold=new THREE.MeshStandardMaterial({color:0xe0b030,metalness:.85,roughness:.3});
 if(L===1){ring(8,.7,.22);logs(3,1,0);fl(1,.15);}
 else if(L===2){ring(12,.95,.26);ring(9,.95,.2,.38);logs(5,1.3,.5,.1,.09);fl(1.35,.2);}
 else if(L===3){ring(12,1.25,.24);const bowl=new THREE.Mesh(new THREE.CylinderGeometry(.85,.45,.5,14,1,true),iron);bowl.material.side=THREE.DoubleSide;bowl.position.y=1.05;g.add(bowl);const rim=new THREE.Mesh(new THREE.TorusGeometry(.85,.06,6,20),iron);rim.rotation.x=Math.PI/2;rim.position.y=1.3;g.add(rim);
  for(let i=0;i<3;i++){const a=i/3*6.28,lg=new THREE.Mesh(new THREE.CylinderGeometry(.06,.06,1,6),iron);lg.position.set(Math.cos(a)*.5,.45,Math.sin(a)*.5);lg.rotation.set(Math.sin(a)*.35,0,-Math.cos(a)*.35);g.add(lg);}logs(4,.9,0,1.05,.08);fl(1.6,1.1);}
 else if(L===4){ring(16,1.7,.32);ring(12,1.7,.26,.45);logs(10,2.6,.42,.05,.12);fl(2.3,.3);}
 else{const tw=new THREE.Mesh(new THREE.CylinderGeometry(1.1,1.5,2.2,10),new THREE.MeshStandardMaterial({color:0x8a8a86,map:rockTex,roughness:.9}));tw.position.y=1.1;g.add(tw);const bowl=new THREE.Mesh(new THREE.CylinderGeometry(1.4,.9,.55,16),gold);bowl.position.y=2.45;g.add(bowl);
  for(let i=0;i<4;i++){const a=i/4*6.28+.78,p=new THREE.Mesh(new THREE.BoxGeometry(.4,1.8,.4),stone);p.position.set(Math.cos(a)*2.6,.9,Math.sin(a)*2.6);g.add(p);const c=new THREE.Mesh(new THREE.SphereGeometry(.24,10,8),gold);c.position.set(Math.cos(a)*2.6,1.95,Math.sin(a)*2.6);g.add(c);}ring(18,2,.28);fl(2.8,2.7);}}
function placeStruct(type,x,z,o={}){const m=structMesh(type,o.lvl);m.position.set(x,H(x,z),z);if(o.rot!==undefined)m.rotation.y=o.rot;scene.add(m);const s={type,x,z,mesh:m,...o};if(DEF[type]&&s.hp===undefined)s.hp=DEF[type].hp;if(type==='gate'&&s.open)m.userData.door.rotation.y=-1.7;if(type==='campfire'&&s.fuel===undefined)s.fuel=50;if(type==='bench'&&!s.tier)s.tier=1;structs.push(s);if(type==='bench')benchLook(s);if(type==='torch_post'||type==='lamp_post'){const L=new THREE.PointLight(type==='lamp_post'?0xffd890:0xffa050,0,type==='lamp_post'?18:12,1.6);L.position.y=type==='lamp_post'?2.5:1.6;m.add(L);s.light=L;s.on=null;}return s;}
function benchLook(s){const g=s.mesh;if(g.userData.badge)g.remove(g.userData.badge);const b=part(g,BX,mat([0,0x8a5a30,0x9a9a9a,0xc8ccd0,0xffd040][s.tier]||0x8a5a30,{m:s.tier>2?.6:0}),0,1.12,-.25,.5,.25,.25);g.userData.badge=b;}
const SR={rug:.5,table:.6,flower_pot:.3,sign_post:.3,path_stones:.5,cave_rock:2.8,healing_tree:2.4,guardian_totem:.5,watchtower:1.25,turret:.7,flame_trap:.55,alarm_bell:.3,scarecrow:.35,torch_post:.25,lamp_post:.3,house:2.6,well:1.2,tent:1.3,bed:.9,bench:.9,chest:.6,campfire:.6,fence:.7,wall:.9,trap:0};
const LOWRES=new Set(['rock','iron','gold','crystal','obsidian','cactus']),LOWST=new Set(['fence','trap','campfire','chest','bed','bench']);
const SH={rug:.03,path_stones:.05,table:.8,flower_pot:.45,sign_post:1.1,fence:1.1,wall:1.6,gate:1.8,iron_wall:2,thorn_wall:1.5,spike_barricade:1,turret:1.05,flame_trap:.3,bear_trap:.12,trap:.12,bed:.65,bench:1,chest:.75,campfire:.55,tent:1.8,guardian_totem:2.2,scarecrow:1.6};
function structTopAt(x,z){let t=0;for(const s of structs){const h=SH[s.type];if(h===undefined)continue;const inside=SEG[s.type]?segDist(s,x,z)<SEG[s.type][1]+.28:Math.hypot(x-s.x,z-s.z)<(SR[s.type]??.4)+.28;if(inside)t=Math.max(t,h);}return t;}
function blocked(x,z,r,feetY){const air=feetY!==undefined&&feetY>.3;
 for(const o of near(x,z,2)){if(!o.alive||o.type==='pebble'||o.type==='bush')continue;if(air&&LOWRES.has(o.type)){const rh=RTYPES[o.type].r*o.s;if(feetY>=rh-.15||rh-feetY<=.55)continue;}if(Math.hypot(x-o.x,z-o.z)<RTYPES[o.type].r*o.s*(o.type==='tree'?.6:1)+r)return true;}
 for(const s of structs){if(NOBLOCK.has(s.type)||s.open)continue;if(Math.abs(x-s.x)>4||Math.abs(z-s.z)>4)continue;const top=SH[s.type];
  if(feetY!==undefined&&top!==undefined&&(feetY>=top-.12||top-feetY<=.8))continue;
  if(SEG[s.type]?segDist(s,x,z)<SEG[s.type][1]+r:Math.hypot(x-s.x,z-s.z)<(s.type==='campfire'?[0,.6,.8,1,1.5,1.9][s.lvl||1]:SR[s.type]??.4)+r)return true;}return false;}
function pBlocked(x,z){return blocked(x,z,.4,P.jy)&&!blocked(P.x,P.z,.4,P.jy);}

// ---------- player ----------
const P={jy:0,vy:0,x:0,z:3,dir:Math.PI,hp:100,maxHp:100,hearts:0,torchOn:true,hunger:100,thirst:100,temp:100,fig:null,cd:0,dead:false,water:0,spawn:[0,3]};
let dayT=40,day=1,paused=true,running=false,shake=0,toolHeld=null;
let MODE=['discovery','decorative'].includes(localStorage.getItem('cq_mode'))?localStorage.getItem('cq_mode'):'discovery',ratedShown=false;
const DAY=300;const phase=()=>(dayT%DAY)/DAY;const night=()=>{const p=phase();return p>.72||p<.04;};
function hurtPlayer(d,src){if(P.dead||paused)return;d*=1-armorPct();if(P.blocking){d*=has('guard_shield')?.18:.35;floatTxt(P.x,P.z,'🔰 block','#9cf');}P.hp-=d;P.hurtT=.3;sfx.hurt();floatTxt(P.x,P.z,'-'+Math.round(d),'#f44');if(P.hp<=0)die();}
function die(){P.dead=true;P.hp=0;MP.deaths++;MP.progress();rigOnce(P.fig,'death',1);toast('💀 You fainted… waking at '+(P.spawn[0]===0&&P.spawn[1]===3?'the forest clearing':'your tent'),3);const lost=Math.floor((inv.raw_meat||0)/2);if(lost)add('raw_meat',-lost);
 setTimeout(()=>{P.dead=false;P.x=P.spawn[0];P.z=P.spawn[1];P.hp=Math.round(P.maxHp*.7);P.hunger=Math.max(P.hunger,50);P.thirst=Math.max(P.thirst,50);P.temp=100;rigReset(P.fig);rigSet(P.fig,'idle');},2600);}
function equipVisual(){const w=bestWeapon(),t=lightsOn()&&(has('torch')||has('lantern'))&&P.torchOn?'torch':(w==='fists'?null:w);if(t===toolHeld)return;toolHeld=t;const h=P.fig.userData.rig.hand;if(P.tool){h.remove(P.tool);}P.tool=null;if(t){P.tool=toolMesh(t);h.add(P.tool);}}

// ---------- interaction ----------
function nearestStruct(type,r){let b=null,bd=r;for(const s of structs)if(s.type===type){const d=Math.hypot(s.x-P.x,s.z-P.z);if(d<bd){bd=d;b=s;}}return b;}
function useTarget(){if(moving)return{l:'PLACE',f:placeMove};{let ke=null,kd=3.4;for(const e of KIDENTS)if(e.fig.visible){const d=Math.hypot(e.x-P.x,e.z-P.z);if(d<kd){kd=d;ke=e;}}if(ke)return{l:'TALK',f:()=>talkKid(ke)};}{const tt=treeTarget();if(tt)return tt;}{const dt=defTarget();if(dt)return dt;}{const tc=TCH.find(c=>!c.open&&Math.hypot(c.x-P.x,c.z-P.z)<2.6);if(tc)return{l:'OPEN',f:()=>openTreasure(tc)};}for(const tr of TRADERS)if(Math.hypot(tr.x-P.x,tr.z-P.z)<3.2)return{l:'TALK',f:()=>talkTrader(tr)};for(const n of NPCS)if(!n.inside&&Math.hypot(n.x-P.x,n.z-P.z)<3.2)return{l:'TALK',f:()=>talk(n)};
 const fire=nearestStruct('campfire',3.5+((nearestStruct('campfire',6)||{}).lvl||1)*.3);if(fire)return{l:'FIRE',f:()=>openFire(fire)};
 if(nearestStruct('tent',3)||nearestStruct('bed',2.5))return{l:night()?'SLEEP':'REST',f:sleep};
 if(nearestStruct('chest',2.6))return{l:'CHEST',f:openChest};
 if(nearestStruct('bench',3))return{l:'BENCH',f:()=>openBag('bag')};
 if(inPond(P.x,P.z,2.2)||nearestStruct('well',2.5))return{l:'DRINK',f:()=>{P.thirst=100;if(has('waterskin'))P.water=5;toast('💧 Refreshed'+(has('waterskin')?' · waterskin filled (5)':''));sfx.eat();}};
 if(has('waterskin')&&P.water>0&&P.thirst<80)return{l:'SIP',f:()=>{P.water--;P.thirst=Math.min(100,P.thirst+30);toast('💧 Waterskin: '+P.water+' left');}};
 return null;}
function sleep(){P.spawn=[P.x,P.z];if(night()){if(animals.some(a=>a.alive&&a.agro&&Math.hypot(a.x-P.x,a.z-P.z)<14))return toast('You can’t sleep with enemies nearby!');dayT=Math.ceil(dayT/DAY)*DAY+5;day++;P.hp=Math.min(P.maxHp,P.hp+40);toast('🌅 You slept until morning. Respawn point set.');}else toast('⛺ Respawn point set at this tent.');save();}
function doAttack(aim){if(P.dead||P.cd>0||paused)return;if(aim!==undefined)P.dir=aim;const okA=(x,z)=>aim===undefined||Math.abs(Math.atan2(Math.sin(Math.atan2(x-P.x,z-P.z)-aim),Math.cos(Math.atan2(x-P.x,z-P.z)-aim)))<1.25||Math.hypot(x-P.x,z-P.z)<1;P.cd=.45;const w=bestWeapon(),W2=WEAP[w];let dmg=W2.d*(has('crown')?1.5:1);
 // targets
 let best=null,bd=1e9;
 for(const a of animals)if(a.alive){const d=Math.hypot(a.x-P.x,a.z-P.z)-(a.K.bulk||1)*.4-(a.K.hm?.4:0);if(d<W2.r+.4&&d<bd&&okA(a.x,a.z)){bd=d;best={a};}}
 if(boss&&boss.alive){const d=Math.hypot(boss.x-P.x,boss.z-P.z)-boss.rad;if(d<W2.r+.3&&d<bd&&okA(boss.x,boss.z)){bd=d;best={boss:1};}}
 for(const o of near(P.x,P.z,4))if(o.alive){const d=Math.hypot(o.x-P.x,o.z-P.z)-RTYPES[o.type].r*o.s*.6;if(d<1.7&&d<bd-.3&&okA(o.x,o.z)){bd=d;best={o};}}
 rigOnce(P.fig,'attack',.38);
 if(!best){return;}
 const tx=best.a?best.a.x:best.boss?boss.x:best.o.x,tz=best.a?best.a.z:best.boss?boss.z:best.o.z;P.dir=Math.atan2(tx-P.x,tz-P.z);
 if(best.a)hitAnimal(best.a,dmg);else if(best.boss)hitBoss(dmg);else gather(best.o);}
function gather(o){const T=RTYPES[o.type];
 if(T.pick){const lvl=pickLvl();if(lvl<T.pick){toast(lvl===0?'⛏️ You need a pickaxe to mine!':'⛏️ You need a '+['','wooden','stone','iron','gold'][T.pick]+' pickaxe or better to mine '+o.type+'.');floatTxt(o.x,o.z,'✋❌','#f88');return;}o.hp-=1+Math.max(0,lvl-T.pick)*.25;sfx.mine();}
 else if(o.type==='tree'){const p=axeLvl()>=5?10/3:axeLvl()>0?2:1;o.hp-=p;sfx.chop();o.hits=(o.hits||0)+1;const need=Math.ceil(10/p);floatTxt(o.x,o.z,Math.min(o.hits,need)+'/'+need,'#fff');}
 else o.hp-=1;
 if(o.hp<=0.001){o.alive=false;o.respawnAt=performance.now()/1000+(o.type==='pebble'?120:420);hideRes(o);deadRes.add(o.id);
  const g={tree:{wood:o.b==='jungle'?4:3,...(Math.random()<.3?{fiber:1}:{})},rock:{stone:3},iron:{iron:2,stone:1},gold:{gold:2},crystal:{crystal:2},obsidian:{obsidian:2},pebble:{stone:1},bush:{berries:o.b==='snow'?1:2,fiber:2},cactus:{fiber:2,cactus_fruit:1}}[o.type];
  if(o.type==='cactus')P.thirst=Math.min(100,P.thirst+15);const got=[];for(const k in g){add(k,g[k]);got.push('+'+g[k]+' '+ITEMS[k]);}toast(got.join('  '),1.4);o.hits=0;}}
const deadRes=new Set();
function shootBow(aim){if(P.dead||paused||P.cd>0)return;const xb=has('crossbow');if(!xb&&!has('bow'))return toast('Craft a bow or crossbow first.');if(!has('arrows'))return toast('No arrows! Craft some (needs feathers).');P.cd=xb?.85:.55;add('arrows',-1);
 let tgt=null,bd=26;for(const a of animals)if(a.alive){const d=Math.hypot(a.x-P.x,a.z-P.z);if(d<bd){bd=d;tgt=a;}}if(boss&&boss.alive&&Math.hypot(boss.x-P.x,boss.z-P.z)<26)tgt=boss;
 if(aim!==undefined){tgt=null;let bb=.35;for(const a of [...animals.filter(a=>a.alive),...(boss&&boss.alive?[boss]:[])]){const d=Math.hypot(a.x-P.x,a.z-P.z);if(d>26)continue;const df=Math.abs(Math.atan2(Math.sin(Math.atan2(a.x-P.x,a.z-P.z)-aim),Math.cos(Math.atan2(a.x-P.x,a.z-P.z)-aim)));if(df<bb){bb=df;tgt=a;}}}const ang=tgt?Math.atan2(tgt.x-P.x,tgt.z-P.z):(aim??P.dir);P.dir=ang;shoot('player',P.x+Math.sin(ang),P.z+Math.cos(ang),ang,xb?36:26,(xb?24:14)*(has('crown')?1.5:1),xb?0xffd9a0:0xf5e6b0,.15,xb?1.1:1.2);sfx.shoot();rigOnce(P.fig,'attack',.3);}
function eatBest(){for(const [k,h,hp] of [['stew',60,15],['meat_skewer',40,10],['grilled_fish',32,12],['cooked_meat',35,8],['berry_pie',30,15],['cactus_fruit',15,0],['berries',10,0],['raw_meat',12,-5]])if(has(k)){add(k,-1);P.hunger=Math.min(100,P.hunger+h);P.hp=clamp(P.hp+hp,1,P.maxHp);if(k==='cactus_fruit')P.thirst=Math.min(100,P.thirst+20);toast('Ate '+ITEMS[k]+(k==='raw_meat'?' (cook it at a campfire!)':''),1.4);sfx.eat();return;}
 if(has('bandage')&&P.hp<P.maxHp){add('bandage',-1);P.hp=Math.min(P.maxHp,P.hp+30);return toast('🩹 +30 health');}toast('No food! Pick berries or hunt animals.');}

// ---------- bag: slot inventory + crafting grid + recipe book + quest log ----------
let bagTab='bag',cg=new Array(9).fill(null),held=null,dragFrom=null;
const benchNear=()=>nearestStruct('bench',5);const curTier=()=>{const b=benchNear();return b?(b.tier||1):0;};const gsz=()=>benchNear()?3:2;
function openBag(tab){if(tab==='craft')tab='bag';if(tab==='inv')tab='bag';bagTab=tab||bagTab;paused=true;$('bag').classList.remove('hidden');renderBag();}
function closeBag(){for(const c of cg)if(c)addItem(c.k,c.n);cg.fill(null);if(held){addItem(held.k,held.n);held=null;}$('heldIcon').classList.add('hidden');$('bag').classList.add('hidden');paused=false;}
function slotHTML(s,id,extra=''){return `<div class="sl ${extra}" data-s="${id}">${s?`<span>${ICON(s.k)}</span>${s.n>1?`<i>${s.n}</i>`:''}`:''}</div>`;}
function renderBag(){for(const t of ['bag','book','quests'])$('t_'+t).classList.toggle('on',bagTab===t);const g=gsz(),tier=curTier(),b=benchNear();
 $('benchNote').textContent=b?`🛠️ Crafting bench · Tier ${tier}`:'Bag crafting (2×2) · stand at a bench for 3×3';let h='';
 if(bagTab==='bag'){h+='<div class="invwrap"><div class="lbl">Bag</div><div class="ig">';for(let i=9;i<NSLOT;i++)h+=slotHTML(slots[i],'inv:'+i);h+='</div><div class="lbl">Hotbar</div><div class="ig">';for(let i=0;i<9;i++)h+=slotHTML(slots[i],'inv:'+i,i===selHot?'sel':'');h+='</div></div>';
  const r=matchGrid(cg,g,tier);h+=`<div class="craftwrap"><div class="lbl">Crafting ${g}×${g}</div><div class="cgrid" style="grid-template-columns:repeat(${g},52px)">`;for(let i=0;i<g*g;i++)h+=slotHTML(cg[i],'grid:'+i);
  h+=`</div><div class="arrow">➜</div>${slotHTML(r?{k:r.out,n:r.n||1}:null,'out',r?'outok':'')}<div class="rn">${r?nm(r.out)+(r.n>1?' ×'+r.n:'')+(r.d?'<br><small>'+r.d+'</small>':''):'Place materials in a pattern'}</div>`;
  if(b&&tier<4){const c=BENCH_UP[tier];const ok=Object.entries(c).every(([k,n])=>has(k,n));h+=`<div class="up"><b>Upgrade bench → Tier ${tier+1}</b><br>${Object.entries(c).map(([k,n])=>`<span class="${has(k,n)?'ok':'no'}">${n} ${nm(k)}</span>`).join(', ')}<br><button id="benchUp" ${ok?'':'disabled'}>Upgrade</button></div>`;}
  h+=`<div class="tip">Tap/click a stack to pick it up, then tap a slot to drop it (or drag with the mouse). In the crafting grid each tap drops ONE item. Right-click picks up half.</div></div>`;}
 else if(bagTab==='book'){h+='<div class="book">';for(const r of RECIPES){const need=recipeNeeds(r),haveAll=Object.entries(need).every(([k,n])=>has(k,n)),fits=r.w<=g&&r.h<=g,unl=r.tier<=tier;
   let pat='';if(r.pat){pat=`<div class="mini" style="grid-template-columns:repeat(${r.w},22px)">`+r.pat.map(row=>[...row].map(ch=>`<b>${ch===' '?'':ICON(r.key[ch])}</b>`).join('')).join('')+'</div>';}else pat='<div class="mini sl2">'+r.list.map(k=>`<b>${ICON(k)}</b>`).join('')+' <small>(any order)</small></div>';
   h+=`<div class="card ${unl?'':'lock'}" data-rec="${RECIPES.indexOf(r)}"><div class="t">${ICON(r.out)} ${nm(r.out).replace(/^\S+ /,'')}${r.n>1?' ×'+r.n:''}</div>${pat}<div class="c">${r.d||''}</div><div class="${unl?'ok':'no'}">${r.tier?'Bench tier '+r.tier:'Bag 2×2'}</div><div>${Object.entries(need).map(([k,n])=>`<span class="${has(k,n)?'ok':'no'}">${n} ${ICON(k)}</span>`).join(' ')}</div><button data-fill="${RECIPES.indexOf(r)}" ${haveAll&&fits&&unl?'':'disabled'}>Auto-fill</button> <button data-all="${RECIPES.indexOf(r)}" ${maxCrafts(r)>0?'':'disabled'}>Craft all ×${maxCrafts(r)}</button><div class="c">Double-click / double-tap card = craft all</div></div>`;}h+='</div>';}
 else{h+='<div class="book">';const all=questList();if(!all.length)h+='<div class="card">No quests yet. Look for villagers with a ❗ above their heads.</div>';for(const q of all)h+=`<div class="card ${q.done?'lock':''}"><div class="t">${q.done?'✅':q.ready?'❓':'📜'} ${q.title}</div><div class="c">${q.giver}</div><div>${q.desc}</div><div class="${q.ready?'ok':''}">${q.done?'Completed':q.prog}</div></div>`;
  h+=`<div class="card"><div class="t">❤️ Heart pieces: ${P.hearts%4}/4</div><div>Max health ${P.maxHp}. Every 4 pieces = +20 max health.</div><div>🪙 ${coins} coins</div></div></div>`;}
 $('bagBody').innerHTML=h;const ub=$('benchUp');if(ub)ub.onclick=()=>{const c=BENCH_UP[b.tier||1];for(const k in c)add(k,-c[k]);b.tier=(b.tier||1)+1;benchLook(b);sfx.win();toast('🛠️ Bench upgraded to Tier '+b.tier+'! New recipes unlocked.');save();renderBag();};}
function slotRef(id){if(id==='out')return null;const [a,i]=id.split(':');return a==='inv'?[slots,+i]:[cg,+i];}
function maxCrafts(r){if(!r||r.tier>curTier()||r.w>gsz()||r.h>gsz())return 0;const need=recipeNeeds(r);let n=Infinity;for(const [k,c] of Object.entries(need))n=Math.min(n,Math.floor(cnt(k)/c));return isFinite(n)?n:0;}
function craftAll(r){const n=maxCrafts(r);if(!n){toast(r&&(r.tier>curTier()||r.w>gsz()||r.h>gsz())?'Recipe locked or too big for this grid':'Not enough materials to craft '+nm(r?r.out:''));return 0;}const need=recipeNeeds(r);for(const [k,c] of Object.entries(need))add(k,-c*n);addItem(r.out,(r.n||1)*n);sfx.craft();toast('🛠️ Crafted '+((r.n||1)*n)+' × '+nm(r.out).replace(/^\S+ /,'')+' ('+n+' craft'+(n>1?'s':'')+')',2.2);equipVisual();return n;}
function craftOut(){const r=matchGrid(cg,gsz(),curTier());if(!r)return;for(let i=0;i<gsz()*gsz();i++)if(cg[i]){cg[i].n--;if(!cg[i].n)cg[i]=null;}addItem(r.out,r.n||1);sfx.craft();toast('Crafted '+nm(r.out)+(r.n>1?' ×'+r.n:''),1.3);if(r.out==='campfire'||PLACE.includes(r.out))toast('Crafted '+nm(r.out)+' – select it in the hotbar and use it to place',2.5);equipVisual();}
function dropInto(id,one){const ref=slotRef(id);if(!ref||!held)return;const [arr,i]=ref;const cur=arr[i];const mx=arr===cg?64:(SINGLE(held.k)?1:64);
 if(!cur){const n=one?1:held.n;arr[i]={k:held.k,n};held.n-=n;}else if(cur.k===held.k){const n=Math.min(one?1:held.n,mx-cur.n);cur.n+=n;held.n-=n;}else if(!one||arr!==cg){arr[i]=held;held=cur;return;}
 if(held&&held.n<=0)held=null;}
function pickFrom(id,half){const ref=slotRef(id);if(!ref)return;const [arr,i]=ref;const s=arr[i];if(!s)return;if(half&&s.n>1){const n=Math.ceil(s.n/2);held={k:s.k,n};s.n-=n;}else{held=s;arr[i]=null;}}
function showHeld(x,y){const el=$('heldIcon');if(!held){el.classList.add('hidden');return;}el.classList.remove('hidden');el.innerHTML=ICON(held.k)+(held.n>1?`<i>${held.n}</i>`:'');if(x!==undefined){el.style.left=(x-22)+'px';el.style.top=(y-22)+'px';}}
let lastTapR={i:-1,t:0};
$('bagBody').addEventListener('dblclick',e=>{const c=e.target.closest('[data-rec]');if(c){craftAll(RECIPES[+c.dataset.rec]);renderBag();}});
$('bagBody').addEventListener('pointerdown',e=>{const al=e.target.closest('[data-all]');if(al&&!al.disabled){craftAll(RECIPES[+al.dataset.all]);renderBag();return;}const rc=e.target.closest('[data-rec]');if(rc&&!e.target.closest('button')){const now=performance.now(),i=+rc.dataset.rec;if(lastTapR.i===i&&now-lastTapR.t<400){lastTapR={i:-1,t:0};craftAll(RECIPES[i]);renderBag();return;}lastTapR={i,t:now};}const f=e.target.closest('[data-fill]');if(f&&!f.disabled){fillRecipe(RECIPES[+f.dataset.fill]);return;}const s=e.target.closest('.sl');if(!s)return;e.preventDefault();const id=s.dataset.s;
 if(id==='out'){craftOut();renderBag();return;}
 if(held){dropInto(id,id.startsWith('grid')&&e.button!==2?true:e.button===2);dragFrom=null;}else{pickFrom(id,e.button===2);dragFrom=held?id:null;}
 renderBag();showHeld(e.clientX,e.clientY);});
$('bagBody').addEventListener('contextmenu',e=>e.preventDefault());
addEventListener('pointermove',e=>{if(held)showHeld(e.clientX,e.clientY);});
addEventListener('pointerup',e=>{if(!held||!dragFrom||e.pointerType!=='mouse')return;const el=document.elementFromPoint(e.clientX,e.clientY)?.closest('.sl');if(el&&el.dataset.s!==dragFrom&&el.dataset.s!=='out'){if(el.dataset.s.startsWith('grid')){const id=el.dataset.s;dropInto(id,false);}else dropInto(el.dataset.s,false);renderBag();showHeld(e.clientX,e.clientY);}dragFrom=null;});
function fillRecipe(r){if(r.w>gsz()||r.h>gsz()){toast('Needs a 3×3 crafting bench');return;}for(let i=0;i<9;i++)if(cg[i]){addItem(cg[i].k,cg[i].n);cg[i]=null;}const g=gsz();const put=(i,k)=>{if(!has(k))return false;addItem(k,-1);cg[i]={k,n:1};return true;};
 if(r.list)r.list.forEach((k,j)=>put(Math.floor(j/2)*g+(j%2),k));else for(let y=0;y<r.h;y++)for(let x=0;x<r.w;x++){const ch=r.pat[y][x];if(ch!==' ')put(y*g+x,r.key[ch]);}
 bagTab='bag';renderBag();}
for(const t of ['bag','book','quests'])$('t_'+t).onclick=()=>{bagTab=t;renderBag();};
$('bagX').onclick=closeBag;

// ---------- hotbar ----------
function renderHot(){const h=$('hotbar');let s='';for(let i=0;i<9;i++){const it=slots[i];s+=`<div class="hs ${i===selHot?'sel':''}" data-h="${i}"><b>${i+1}</b>${it?ICON(it.k):''}<i>${it&&it.n>1?it.n:''}</i></div>`;}if(h.dataset.c!==s){h.innerHTML=s;h.dataset.c=s;}
 const it=slots[selHot];$('heldName').textContent=it?nm(it.k)+(PLACE.includes(it.k)?' – use to place':FOOD[it.k]||it.k==='bandage'?' – use to eat':''):'';}
$('hotbar').addEventListener('pointerdown',e=>{const d=e.target.closest('.hs');if(!d)return;e.preventDefault();e.stopPropagation();const i=+d.dataset.h;if(i===selHot)useSlot(i);else{selHot=i;equipVisual();}renderHot();});
function useSlot(i){const s=slots[i];if(!s||P.dead)return;const k=s.k;
 if(FOOD[k]){const [h,hp]=FOOD[k];addItem(k,-1);P.hunger=Math.min(100,P.hunger+h);P.hp=clamp(P.hp+hp,1,P.maxHp);if(k==='cactus_fruit')P.thirst=Math.min(100,P.thirst+20);sfx.eat();return toast('Ate '+nm(k)+(k==='raw_meat'?' (cook it at a campfire!)':''),1.3);}
 if(k==='bandage'){addItem(k,-1);P.hp=Math.min(P.maxHp,P.hp+30);return toast('🩹 +30 health');}
 if(k==='waterskin'){if(P.water<=0)return toast('Waterskin empty – refill at water');P.water--;P.thirst=Math.min(100,P.thirst+30);return toast('💧 '+P.water+' sips left');}
 if(k==='bow'||k==='crossbow')return shootBow(mouseAim());
 if(k==='heal_tonic'){addItem(k,-1);P.hp=Math.min(P.maxHp,P.hp+55);sfx.eat();return toast('🧪 +55 health');}
 if(k==='speed_tonic'){addItem(k,-1);P.spdT=45;sfx.eat();return toast('⚡ Speed up! (45 s)');}
 if(k==='warmth_tonic'){addItem(k,-1);P.temp=100;P.warmT=60;sfx.eat();return toast('♨️ Warm to the core (60 s)');}
 if(k==='fire_tonic'){addItem(k,-1);P.fireT=60;sfx.eat();return toast('🔥 Fireproof! (60 s)');}
 if(k==='fishing_rod'){if(!inPond(P.x,P.z,2.5))return toast('🎣 Stand by a pond to fish');toast('🎣 Casting…',1);setTimeout(()=>{if(Math.random()<.68){add('raw_fish',1);toast('🐟 Caught a Raw Fish! Grill it (recipe book) or eat it raw (bleh)');sfx.win();}else toast('🎣 It slipped away…');},900);return;}
 if(k==='repair_kit'){let n=0;for(const st of structs)if(DEF[st.type]&&st.hp<DEF[st.type].hp&&Math.hypot(st.x-P.x,st.z-P.z)<14){st.hp=DEF[st.type].hp;n++;}if(!n)return toast('No damaged defences within 14 m');addItem(k,-1);sfx.craft();return toast('🧰 Repaired '+n+' defences!');}
 if(k==='torch'||k==='lantern'){P.torchOn=!P.torchOn;toolHeld='?';return toast((k==='torch'?'Torch ':'Lantern ')+(P.torchOn?'on':'off'));}
 if(k==='wood'){const f=nearestStruct('campfire',3.5);if(f)return fuelFire(f);}
 if(PLACE.includes(k)){if(P.tower)return toast('Climb down first');const pp=placePos(k),x=pp.x,z=pp.z;if(!placeOk(k,pp))return toast('No room to place that here');addItem(k,-1);const st=placeStruct(k,x,z,{rot:pp.rot,tier:k==='bench'?1:undefined,fuel:k==='campfire'?50:undefined});MP.send({t:'struct',s:{type:k,x,z,rot:pp.rot,tier:st.tier,lvl:st.lvl}});if(k==='bed'||k==='tent')P.spawn=[x+1.5,z+1.5];sfx.craft();toast('Placed '+nm(k));save();return;}
 toast(nm(k));}
function fuelFire(f){if(!has('wood'))return toast('You need logs to fuel the fire');if(f.fuel>=flv(f).maxF)return toast('The fire is roaring already!');addItem('wood',-1);f.fuel=Math.min(flv(f).maxF,(f.fuel||0)+14);sfx.craft();toast('🔥 Fire fuel '+Math.round(ffrac(f)*100)+'%  (safe radius '+Math.round(fireR(f))+'m)',1.6);}
const FLV=[null,
 {n:'Stone ring',maxF:100,burn:1,rm:1,perk:'Keeps animals away'},
 {n:'Hearth',maxF:130,burn:.85,rm:1.2,cost:{wood:12,stone:12},perk:'Hearty cooking: +50% cooked meat'},
 {n:'Iron brazier',maxF:160,burn:.7,rm:1.4,cost:{stone:15,iron:6},perk:'Healing circle: regenerate health in the light'},
 {n:'Bonfire',maxF:200,burn:.55,rm:1.65,cost:{wood:20,iron:10,gold:5},perk:'Forest Soldiers are slowed in the light'},
 {n:'Great beacon',maxF:250,burn:.45,rm:1.9,cost:{gold:8,gem:3,obsidian:4},perk:'Forest Soldiers burn in the light · double healing'}];
const flv=f=>FLV[f.lvl||1]||FLV[1];const ffrac=f=>Math.min(1,(f.fuel||0)/flv(f).maxF);
const fireR=f=>f.fuel>0?((f.main?6:4)+ffrac(f)*100*(f.main?.18:.1))*flv(f).rm*(treeInstalled.includes('sand_heart')?1.25:1):0;
const litFire=(x,z)=>structs.find(s=>s.type==='campfire'&&s.fuel>0&&Math.hypot(x-s.x,z-s.z)<fireR(s));
let curFire=null;
function openFire(f){closeAll();curFire=f;renderFire();$('fireP').classList.remove('hidden');}
function renderFire(){const f=curFire;if(!f)return;const L=f.lvl||1,D=FLV[L],N=FLV[L+1];const pct=Math.round(ffrac(f)*100);
 let h=`<div style="padding:10px;line-height:1.6"><h3 style="margin:0">🔥 ${D.n} · Level ${L}/5</h3><div>Fuel <b>${pct}%</b> (${Math.round(f.fuel)}/${D.maxF}) · Safe radius <b>${fireR(f).toFixed(1)} m</b> · burn rate ×${D.burn}</div>`;
 h+=`<div><button class="btn" id="fLog">🪵 Add log (${cnt('wood')})</button><button class="btn" id="fLog5">🪵 ×5</button><button class="btn alt" id="fCook">🍖 Cook all (${cnt('raw_meat')})</button></div>`;
 h+='<b>Perks</b><ul style="margin:4px 0">'+FLV.slice(1).map((x,i)=>`<li style="opacity:${i<L?1:.5}">${i<L?'✅':'🔒'} Lv${i+1} ${x.n}: ${x.perk}</li>`).join('')+'</ul>';
 if(N){const ok=Object.entries(N.cost).every(([k,n])=>cnt(k)>=n);h+=`<b>Next upgrade: Level ${L+1} – ${N.n}</b><div>`+Object.entries(N.cost).map(([k,n])=>`<span style="color:${cnt(k)>=n?'#8f8':'#f88'}">${ICON(k)} ${nm(k).replace(/^\S+ /,'')} ${cnt(k)}/${n}</span>`).join(' &nbsp; ')+`</div><div style="opacity:.8">Radius ×${N.rm} · max fuel ${N.maxF} · burns ×${N.burn}</div><button class="btn" id="fUp" ${ok?'':'disabled'}>⬆️ Upgrade fire</button>`;}else h+='<b>⭐ Max level – Great beacon!</b>';
 $('fireBody').innerHTML=h+'</div>';$('fLog').onclick=()=>{fuelFire(f);renderFire();};$('fLog5').onclick=()=>{for(let i=0;i<5;i++)if(has('wood')&&f.fuel<flv(f).maxF)fuelFire(f);renderFire();};$('fCook').onclick=()=>{cookAt(f);renderFire();};if($('fUp'))$('fUp').onclick=()=>{upFire(f);renderFire();};}
function cookAt(f){const n=cnt('raw_meat');if(!n)return toast('No raw meat to cook');if(f.fuel<=0)return toast('Light the fire first');const out=(f.lvl||1)>=2?n+Math.floor(n/2):n;add('raw_meat',-n);add('cooked_meat',out);toast('🍖 Cooked '+out+' meat'+(out>n?' (hearty bonus!)':''));sfx.craft();}
function upFire(f){const L=f.lvl||1,N=FLV[L+1];if(!N)return false;for(const [k,n] of Object.entries(N.cost))if(cnt(k)<n){toast('Need '+n+' '+nm(k));return false;}
 for(const [k,n] of Object.entries(N.cost))add(k,-n);f.lvl=L+1;scene.remove(f.mesh);f.mesh=structMesh('campfire',f.lvl);f.mesh.position.set(f.x,H(f.x,f.z),f.z);scene.add(f.mesh);f.fuel=Math.min(N.maxF,f.fuel+25);
 sfx.win();toast('🔥 Campfire upgraded to Level '+f.lvl+': '+N.n+'!<br>'+N.perk,3.5);save();return true;}
const litAt=(x,z)=>structs.some(s=>s.type==='campfire'&&s.fuel>0&&Math.hypot(x-s.x,z-s.z)<fireR(s));

// ---------- map ----------
const mapImg=document.createElement('canvas');mapImg.width=mapImg.height=300;
{const g=mapImg.getContext('2d'),id=g.createImageData(300,300),c=new THREE.Color();for(let j=0;j<300;j++)for(let i=0;i<300;i++){const x=(i/300*2-1)*W,z=(j/300*2-1)*W;c.setHex(BIOME[biomeAt(x,z)].c[0]);if(inPond(x,z))c.setHex(0x3a8ec8);if(LAVA.some(p=>Math.hypot(x-p.x,z-p.z)<p.r))c.setHex(0xff5a10);const o=(j*300+i)*4;id.data[o]=c.r*255;id.data[o+1]=c.g*255;id.data[o+2]=c.b*255;id.data[o+3]=255;}g.putImageData(id,0,0);}
function drawMap(cv,cx,cz,span,round){const g=cv.getContext('2d'),S=cv.width,k=S/span,sx=x=>(x-cx)*k+S/2,sz=z=>(z-cz)*k+S/2;g.save();g.clearRect(0,0,S,S);if(round){g.beginPath();g.arc(S/2,S/2,S/2,0,7);g.clip();}
 g.drawImage(mapImg,sx(-W),sz(-W),2*W*k,2*W*k);g.font=(round?14:22)+'px sans-serif';g.textAlign='center';g.textBaseline='middle';
 for(const tr of TRADERS){const tx=sx(tr.x),tz2=sz(tr.z),tNow=performance.now()/300,pl=.5+.5*Math.sin(tNow*2),fern=tr.kind==='forest';g.save();g.beginPath();g.arc(tx,tz2,(round?8:15)+pl*(round?3:7),0,7);g.fillStyle=fern?'rgba(120,255,90,.28)':'rgba(90,180,255,.28)';g.fill();g.lineWidth=round?2:3.5;g.strokeStyle=fern?'#8dff5a':'#57b6ff';g.stroke();g.font=(round?14:24)+'px sans-serif';g.fillText(fern?'🧺':'🛡️',tx,tz2);if(!round){g.font='bold 13px sans-serif';g.lineWidth=3;g.strokeStyle='#000';const lb=(fern?'Fern':'Bram')+(fern?' · camped all day · leaves next dawn':' · leaves at dusk');g.strokeText(lb,tx,tz2+30);g.fillStyle=fern?'#b6ff9a':'#a8dcff';g.fillText(lb,tx,tz2+30);}g.restore();}
 for(const v of VILLAGES){g.fillText('🏠',sx(v.x),sz(v.z));if(!round){g.font='12px sans-serif';g.fillStyle='#fff';g.fillText(v.name,sx(v.x),sz(v.z)+16);g.font='22px sans-serif';}}
 for(const B of BOSSES)if(revealed[B.id]||bossDone[B.id]||has('boss_compass')){g.fillText(bossDone[B.id]?'✅':'💀',sx(B.x),sz(B.z));if(!round){g.font='12px sans-serif';g.fillStyle='#fdd';g.fillText(B.name,sx(B.x),sz(B.z)+16);g.font='22px sans-serif';}}
 for(const c of TCH)if(c.seen)g.fillText(c.open?'📭':'🎁',sx(c.x),sz(c.z));
 for(const k of KIDS)if(k.cave&&(kidState[k.id].hinted||kidStage(k.id)!=='wait')){if(kidStage(k.id)==='rescued')continue;g.fillText('🧒',sx(k.cave.x),sz(k.cave.z));if(!round){g.font='11px sans-serif';g.fillStyle='#ffe9a8';g.fillText(k.name+' · '+(k.lmShort||'cave'),sx(k.cave.x),sz(k.cave.z)+15);g.font='22px sans-serif';}}
 g.fillText('🌳',sx(TREE.x),sz(TREE.z));if(!round){g.font='11px sans-serif';g.fillStyle='#b6ff9a';g.fillText('Tree of Healing '+treeInstalled.length+'/4',sx(TREE.x),sz(TREE.z)+15);g.font='22px sans-serif';}
 for(const s of structs)if(s.type==='campfire'||s.type==='tent'||s.type==='bed')g.fillText(s.type==='campfire'?'🔥':'⛺',sx(s.x),sz(s.z));
 if(!round){g.fillStyle='#fff';g.font='bold 16px sans-serif';g.fillText('N ❄️ Snowy Mountains',S/2,14);g.fillText('S 🏜️ Desert',S/2,S-14);g.save();g.translate(14,S/2);g.rotate(-Math.PI/2);g.fillText('W 🌋 Volcanic',0,0);g.restore();g.save();g.translate(S-14,S/2);g.rotate(Math.PI/2);g.fillText('E 🌴 Jungle',0,0);g.restore();}
 g.translate(sx(P.x),sz(P.z));g.rotate(-P.dir+Math.PI);g.fillStyle='#ffd400';g.strokeStyle='#000';g.lineWidth=2;g.beginPath();g.moveTo(0,-8);g.lineTo(6,6);g.lineTo(-6,6);g.closePath();g.fill();g.stroke();g.restore();}
$('bMap').addEventListener('pointerdown',e=>{e.preventDefault();openMap();});$('minimap').addEventListener('pointerdown',openMap);
function openMap(){$('fullMap').classList.remove('hidden');drawMap($('fullMapCan'),0,0,W*2,false);}
$('fullMap').onclick=()=>$('fullMap').classList.add('hidden');

// ---------- ui helpers ----------
let toastT=0;function toast(t,s=2.2){const el=$('toast');el.innerHTML=t;el.style.opacity=1;toastT=s;}
function floatTxt(x,z,t,col){V.set(x,H(x,z)+2.2,z).project(camera);if(V.z>1)return;const d=document.createElement('div');d.className='dmg';d.textContent=t;d.style.color=col;d.style.left=((V.x+1)/2*innerWidth)+'px';d.style.top=((1-V.y)/2*innerHeight)+'px';document.body.appendChild(d);requestAnimationFrame(()=>{d.style.transform='translateY(-40px)';d.style.opacity=0;});setTimeout(()=>d.remove(),850);}

// ---------- input ----------
const keys={};let joy={x:0,y:0};
let camYaw=0,camDist=15,desktop=!isTouch;function setLayout(){document.body.classList.toggle('desktop',desktop);}setLayout();
addEventListener('pointerdown',e=>{if(e.pointerType==='touch'&&desktop){desktop=false;setLayout();}else if(e.pointerType==='mouse'&&!desktop&&!matchMedia('(pointer:coarse)').matches){desktop=true;setLayout();}},true);
const anyPanel=()=>!$('talk').classList.contains('hidden')||!$('shop').classList.contains('hidden')||!$('chestP').classList.contains('hidden')||!$('howP').classList.contains('hidden')||!$('charP').classList.contains('hidden')||!$('fireP').classList.contains('hidden')||!$('bag').classList.contains('hidden')||!$('fullMap').classList.contains('hidden')||!$('pause').classList.contains('hidden');
function closeAll(){if(!$('bag').classList.contains('hidden'))closeBag();endTalk();$('shop').classList.add('hidden');$('chestP').classList.add('hidden');$('fireP').classList.add('hidden');$('fullMap').classList.add('hidden');}
function togglePause(){if(!$('pause').classList.contains('hidden')){$('pause').classList.add('hidden');paused=false;return;}if(anyPanel()){closeAll();paused=false;return;}$('pause').classList.remove('hidden');paused=true;}
$('pResume').onclick=()=>{$('pause').classList.add('hidden');paused=false;};$('pQuit').onclick=()=>{try{MUS.set('off');}catch(e){}$('pause').classList.add('hidden');save();running=false;paused=true;$('hud').classList.add('hidden');$('title').classList.remove('hidden');$('bCont').disabled=false;};
addEventListener('keydown',e=>{const k=e.key.toLowerCase();const tg=e.target,typing=tg&&(tg.tagName==='INPUT'||tg.tagName==='TEXTAREA'||tg.tagName==='SELECT'||tg.isContentEditable);if(typing)return;
 if(e.code==='Space'||k===' '){e.preventDefault();if(document.activeElement&&document.activeElement.tagName==='BUTTON')document.activeElement.blur();if(running&&!paused&&!anyPanel())jump();return;}
 if(k==='tab')e.preventDefault();keys[k]=true;if(!running||e.repeat)return;
 if(k==='escape'){if(breakConfirm){breakConfirm=null;toast('Break cancelled',1);return;}if(!$('howP').classList.contains('hidden')){closeHow();return;}if(!$('charP').classList.contains('hidden')){closeChar();return;}if(moving){cancelMove();return;}togglePause();return;}if(!$('pause').classList.contains('hidden'))return;
 if(k==='r'&&!anyPanel())rotGhost();
 if(k==='b'&&!anyPanel())tryBreak();
 if(k==='e'){if(moving){placeMove();}else if(!$('talk').classList.contains('hidden')){if(typeTimer)$('talk').onclick();}else if(!anyPanel()){if(movableNear()&&!ePending){eDownAt=performance.now();ePending=useTarget();}else{const u=useTarget();u&&u.f();}}}
 if((k==='j'||k==='k')&&!anyPanel())doAttack(mouseAim());
 if(k==='l'){if($('bag').classList.contains('hidden')){closeAll();openBag('quests');}else closeBag();}
 if(k==='f'&&!anyPanel())shootBow(mouseAim());
 if(k==='tab'||k==='i'){if($('bag').classList.contains('hidden')){closeAll();openBag('bag');}else closeBag();}
 if(k==='c'){if($('bag').classList.contains('hidden')){closeAll();openBag('book');}else if(bagTab!=='book'){bagTab='book';renderBag();}else closeBag();}
 if(k==='m'){if($('fullMap').classList.contains('hidden')){openMap();}else $('fullMap').classList.add('hidden');}
 if(k==='h')$('keys').classList.toggle('hidden');
 if(/^[1-9]$/.test(k)&&!anyPanel()){const i=+k-1;if(i===selHot)useSlot(i);else{selHot=i;equipVisual();}renderHot();}});
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('button');if(b)b.blur();});
addEventListener('keyup',e=>{keys[e.key.toLowerCase()]=false;if(e.key.toLowerCase()==='e'&&ePending){const p=ePending;ePending=null;if(performance.now()-eDownAt<550&&p)p.f();}});
setInterval(()=>{if(ePending&&keys.e&&performance.now()-eDownAt>=550){ePending=null;startMove(movableNear());}},60);
addEventListener('blur',()=>{for(const k in keys)keys[k]=false;actHeld=false;});
// mouse: aim, click hit, right-click shoot / right-drag rotate, wheel zoom
const mouse={x:0,y:0,in:false};const ray=new THREE.Raycaster(),plane=new THREE.Plane(new THREE.Vector3(0,1,0),0),hitV=new THREE.Vector3();
function mouseAim(){if(!desktop||!mouse.in)return undefined;ray.setFromCamera({x:mouse.x/innerWidth*2-1,y:-(mouse.y/innerHeight)*2+1},camera);plane.constant=-(H(P.x,P.z)+.8);if(!ray.ray.intersectPlane(plane,hitV))return undefined;return Math.atan2(hitV.x-P.x,hitV.z-P.z);}
const cv=renderer.domElement;let rDown=null;
cv.addEventListener('contextmenu',e=>e.preventDefault());
cv.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse')return;mouse.x=e.clientX;mouse.y=e.clientY;mouse.in=true;if(rDown){const dx=e.clientX-rDown.x;if(Math.abs(e.clientX-rDown.x0)>6)rDown.drag=true;camYaw-=dx*.008;rDown.x=e.clientX;}});
cv.addEventListener('pointerleave',()=>{mouse.in=false;});
cv.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'||!running)return;mouse.x=e.clientX;mouse.y=e.clientY;mouse.in=true;if(e.button===0){if(moving){placeMove();return;}actHeld=true;doAttack(mouseAim());}else if(e.button===2){if(slots[selHot]&&slots[selHot].k==='shield'){rBlock=true;return;}rDown={x:e.clientX,x0:e.clientX,drag:false};cv.setPointerCapture(e.pointerId);}});
cv.addEventListener('pointerup',e=>{if(e.pointerType!=='mouse')return;if(e.button===0)actHeld=false;if(e.button===2)rBlock=false;if(e.button===2&&rDown){if(!rDown.drag){const it=slots[selHot];if(it&&it.k!=='bow'&&(FOOD[it.k]||PLACE.includes(it.k)||['bandage','waterskin','torch','lantern'].includes(it.k)))useSlot(selHot);else shootBow(mouseAim());}rDown=null;}});
cv.addEventListener('wheel',e=>{e.preventDefault();camDist=clamp(camDist+Math.sign(e.deltaY)*1.5,7,30);},{passive:false});
{const st=$('stick'),base=$('knobBase'),kn=$('knob');let id=null,cx=0,cy=0;const R0=50;
 st.addEventListener('pointerdown',e=>{id=e.pointerId;st.setPointerCapture(id);const r=base.getBoundingClientRect();cx=r.left+r.width/2;cy=r.top+r.height/2;if(Math.hypot(e.clientX-cx,e.clientY-cy)>90){base.style.left=(e.clientX-60)+'px';base.style.bottom=(innerHeight-e.clientY-60)+'px';cx=e.clientX;cy=e.clientY;}mv(e);});
 const mv=e=>{if(e.pointerId!==id)return;let dx=e.clientX-cx,dy=e.clientY-cy;const l=Math.hypot(dx,dy);if(l>R0){dx*=R0/l;dy*=R0/l;}kn.style.left=(33+dx)+'px';kn.style.top=(33+dy)+'px';joy={x:dx/R0,y:dy/R0};};
 st.addEventListener('pointermove',mv);const up=e=>{if(e.pointerId!==id)return;id=null;joy={x:0,y:0};kn.style.left=kn.style.top='33px';};st.addEventListener('pointerup',up);st.addEventListener('pointercancel',up);}
let actHeld=false,rBlock=false,mBlock=false;
$('bRot').addEventListener('pointerdown',e=>{e.preventDefault();rotGhost();});$('bBlock').addEventListener('pointerdown',e=>{e.preventDefault();mBlock=true;});for(const ev of ['pointerup','pointercancel','pointerleave'])$('bBlock').addEventListener(ev,()=>mBlock=false);$('bJump').addEventListener('pointerdown',e=>{e.preventDefault();jump();});$('bAct').addEventListener('pointerdown',e=>{e.preventDefault();actHeld=true;doAttack();});for(const ev of ['pointerup','pointercancel','pointerleave'])$('bAct').addEventListener(ev,()=>actHeld=false);
$('bUse').addEventListener('pointerdown',e=>{e.preventDefault();if(moving){placeMove();return;}const u=useTarget();if(u)u.f();else toast('Nothing to use here');});
$('bPick').addEventListener('pointerdown',e=>{e.preventDefault();startMove(movableNear());});
$('bBreak').addEventListener('pointerdown',e=>{e.preventDefault();tryBreak();});
$('bChar').onclick=()=>openChar();$('bHow').onclick=()=>showHow();$('pHow').onclick=()=>showHow();$('howX').onclick=()=>closeHow();$('bHelp').onclick=()=>showHow();$('stepsX').onclick=()=>{stepsOff=true;$('firstSteps').classList.add('hidden');save();};$('pChar').onclick=()=>openChar();$('charX').onclick=()=>closeChar();$('charDone').onclick=()=>closeChar();$('charRand').onclick=()=>randomChar();$('charName').addEventListener('input',e=>{CHAR.name=e.target.value;});
$('bPlace').addEventListener('pointerdown',e=>{e.preventDefault();placeMove();});
$('bCancel').addEventListener('pointerdown',e=>{e.preventDefault();cancelMove();});
$('bShoot').addEventListener('pointerdown',e=>{e.preventDefault();shootBow();});
$('bEat').addEventListener('pointerdown',e=>{e.preventDefault();eatBest();});
$('bBag').addEventListener('pointerdown',e=>{e.preventDefault();openBag();});
$('quit').onclick=()=>{if(confirm('Save and quit to the main menu?')){try{MUS.set('off');}catch(e){}save();running=false;paused=true;$('hud').classList.add('hidden');$('title').classList.remove('hidden');$('bCont').disabled=false;}};
$('winOk').onclick=()=>{$('win').classList.add('hidden');paused=false;};

// ---------- save ----------
function save(){if(!running&&!P.fig)return;try{localStorage.setItem(SAVE_KEY,JSON.stringify({v:1,p:{x:P.x,z:P.z,hp:P.hp,hunger:P.hunger,thirst:P.thirst,temp:P.temp,water:P.water,spawn:P.spawn},slots,coins,selHot,chest,structs:structs.filter(s=>!s.perm).map(s=>({type:s.type,x:s.x,z:s.z,rot:s.rot,tier:s.tier,fuel:s.fuel,main:s.main,lvl:s.lvl,hp:s.hp,open:s.open,ammo:s.ammo})),dead:[...deadRes],quests,revealed,kills,bossDone,dayT,day,raidDay,char:CHAR,stepsOff,ftDay,dtDay,mode:MODE,ratedShown,kidState,treeInstalled,fruitAt,tchOpen:TCH.filter(c=>c.open).map(c=>c.id),tchSeen:TCH.filter(c=>c.seen).map(c=>c.id)}));}catch(e){}}
function load(){try{const d=JSON.parse(localStorage.getItem(SAVE_KEY));if(!d)return false;Object.assign(P,d.p);P.maxHp=P.maxHp||100;if(d.slots)slots=d.slots.concat(new Array(NSLOT).fill(null)).slice(0,NSLOT);else if(d.inv){const L={axe:'stone_axe',pickaxe:'stone_pickaxe',obsidian_blade:'obsidian_sword'};for(const k in d.inv)addItem(L[k]||k,d.inv[k]);}coins=d.coins||0;selHot=d.selHot||0;chest=d.chest||{};raidDay=d.raidDay||0;if(d.char){CHAR=d.char;localStorage.setItem('cq_charprofile',JSON.stringify(CHAR));}stepsOff=!!d.stepsOff;ftDay=d.ftDay||0;dtDay=d.dtDay||0;if(d.mode)MODE=d.mode;ratedShown=!!d.ratedShown;updModeCards();if(d.kidState)for(const id in kidState)if(d.kidState[id])kidState[id]={...kidState[id],...d.kidState[id]};treeInstalled=d.treeInstalled||[];fruitAt=d.fruitAt||0;for(const c of TCH){if((d.tchOpen||[]).includes(c.id))openLook(c);if((d.tchSeen||[]).includes(c.id))c.seen=1;}
 for(const s of d.structs||[]){const {type,x,z,...o}=s;placeStruct(type,x,z,o);}if(!structs.some(s=>s.main))placeStruct('campfire',0,-1.5,{main:1,fuel:60});for(const id of d.dead||[]){const o=RES[id];if(o){o.alive=false;hideRes(o);deadRes.add(id);o.respawnAt=performance.now()/1000+300;}}
 quests=d.quests||{};revealed=d.revealed||{};kills=d.kills||{};bossDone=d.bossDone||{};dayT=d.dayT||40;day=d.day||1;return true;}catch(e){return false;}}
setInterval(()=>{if(running)save();},10000);addEventListener('visibilitychange',()=>{if(document.hidden&&running)save();});addEventListener('pagehide',()=>running&&save());

// ---------- realistic graphics layer: sky, env lighting, water, grass, particles, post-processing ----------
let sky=null,composer=null,bloom=null,pmrem=null,envRT=null,envT=0;const gUni={uTime:{value:0}};
if(HQ){sky=new Sky();sky.scale.setScalar(180);scene.add(sky);Object.assign(sky.material.uniforms,{});sky.material.uniforms.turbidity.value=6;sky.material.uniforms.rayleigh.value=1.6;sky.material.uniforms.mieCoefficient.value=.005;sky.material.uniforms.mieDirectionalG.value=.8;scene.background=null;pmrem=new THREE.PMREMGenerator(renderer);}
function updSky(sunDir,dl){if(!sky)return;sky.position.copy(camera.position);sky.material.uniforms.sunPosition.value.copy(sunDir);renderer.toneMappingExposure=.28+.72*Math.max(0,Math.min(1,dl));envT-=1;if(envT<=0&&pmrem){envT=GQ==='high'?240:480;const s2=new THREE.Scene();const sk=sky.clone();sk.position.set(0,0,0);s2.add(sk);if(envRT)envRT.dispose();envRT=pmrem.fromScene(s2,0,.1,400);scene.environment=envRT.texture;}}
// water: animated normal-mapped reflective surface
if(HQ){lavaMat.normalMap=ltex('water_n',6,false);lavaMat.normalScale=new THREE.Vector2(1.2,1.2);lavaMat.roughness=.55;lavaMat.emissive=new THREE.Color(0xff4400);lavaMat.emissiveIntensity=.55;lavaMat.needsUpdate=true;}
if(HQ){const wn=ltex('water_n',3,false);Object.assign(waterMat,{color:new THREE.Color(0x1f5a78),roughness:.04,metalness:.15,opacity:.86,normalMap:wn,normalScale:new THREE.Vector2(.6,.6),envMapIntensity:1.4});waterMat.needsUpdate=true;waterMat.userData.wn=wn;}
// instanced swaying grass around the player
let grass=null,grassAt=[1e9,1e9];
if(HQ){const N=GQ==='high'?9000:3500;const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute([-.05,0,0,.05,0,0,0,.7,0, 0,0,-.05,0,0,.05,0,.6,0],3));geo.setAttribute('color',new THREE.Float32BufferAttribute([.35,.45,.2,.35,.45,.2,1,1,.8, .35,.45,.2,.35,.45,.2,1,1,.8],3));geo.computeVertexNormals();
 const gm=new THREE.MeshStandardMaterial({vertexColors:true,side:THREE.DoubleSide,roughness:.9});gm.onBeforeCompile=sh=>{sh.uniforms.uTime=gUni.uTime;sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nuniform float uTime;').replace('#include <begin_vertex>','#include <begin_vertex>\nvec4 ip=instanceMatrix[3];float sw=sin(uTime*1.8+ip.x*.35+ip.z*.27)*.5+sin(uTime*3.1+ip.x*.9)*.2;transformed.x+=sw*.22*position.y;transformed.z+=sw*.1*position.y;');};
 grass=new THREE.InstancedMesh(geo,gm,N);grass.frustumCulled=false;grass.receiveShadow=true;scene.add(grass);}
let plantIM=null,plantAt=[1e9,1e9];
if(HQ){plantIM=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(.16,0),new THREE.MeshStandardMaterial({roughness:.7,flatShading:true}),GQ==='high'?420:200);plantIM.frustumCulled=false;scene.add(plantIM);}
function updPlants(){if(!plantIM)return;if(Math.hypot(P.x-plantAt[0],P.z-plantAt[1])<8)return;plantAt=[P.x,P.z];const rr=mulberry(Math.floor(P.x/9)*331+Math.floor(P.z/9));const N=plantIM.count;
 for(let i=0;i<N;i++){const a=rr()*6.283,d=Math.sqrt(rr())*24,x=P.x+Math.cos(a)*d,z=P.z+Math.sin(a)*d,b=biomeAt(x,z);const ok=(b==='forest'||b==='jungle')&&!inPond(x,z,.8);
  const s=ok?.7+rr()*.9:0;Q.setFromAxisAngle(V.set(0,1,0),rr()*6.28);plantIM.setMatrixAt(i,M4.compose(V.set(x,H(x,z)+.18,z),Q,S.set(s,s,s)));plantIM.setColorAt(i,C.setHex(b==='jungle'?pick([0xff6ab0,0xffa040,0xe8f0ff]):pick([0xff7fb0,0xffd94d,0xffffff,0xc89aff,0xff8a5a])));}
 plantIM.instanceMatrix.needsUpdate=true;if(plantIM.instanceColor)plantIM.instanceColor.needsUpdate=true;}
function updGrass(){if(!grass)return;updPlants();if(Math.hypot(P.x-grassAt[0],P.z-grassAt[1])<7)return;grassAt=[P.x,P.z];const N=grass.count,R0=GQ==='high'?30:22,rr=mulberry(Math.floor(P.x/7)*977+Math.floor(P.z/7));
 for(let i=0;i<N;i++){const a=rr()*6.283,d=Math.sqrt(rr())*R0,x=P.x+Math.cos(a)*d,z=P.z+Math.sin(a)*d,b=biomeAt(x,z);const ok=(b==='forest'||b==='jungle'||(b==='snow'&&rr()<.08)||(b==='desert'&&rr()<.05))&&!inPond(x,z,.8)&&!VILLAGES.some(v=>Math.hypot(x-v.x,z-v.z)<11)&&Math.hypot(x,z)>3.5;
  const s=ok?(b==='jungle'?1.6:1)*(.6+rr()*.8):0;Q.setFromAxisAngle(V.set(0,1,0),rr()*6.28);grass.setMatrixAt(i,M4.compose(V.set(x,H(x,z)-.05,z),Q,S.set(s,s*(.7+rr()*.6),s)));grass.setColorAt(i,C.setHex(b==='jungle'?0x3a9a30:b==='snow'?0x9ab0a0:b==='desert'?0xa0a050:pick([0x5a9a3a,0x6aa040,0x4a8a30])));}
 grass.instanceMatrix.needsUpdate=true;grass.instanceColor.needsUpdate=true;}
// fire & smoke particles at the nearest burning campfire
function sprite(inner,outer){const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d'),gr=g.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,inner);gr.addColorStop(1,outer);g.fillStyle=gr;g.fillRect(0,0,64,64);return new THREE.CanvasTexture(c);}
function mkPts(n,tex,blend,size){const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(new Float32Array(n*3),3));const m=new THREE.Points(geo,new THREE.PointsMaterial({map:tex,size,transparent:true,depthWrite:false,blending:blend,color:0xffffff,sizeAttenuation:true}));m.frustumCulled=false;scene.add(m);return {m,p:Array.from({length:n},()=>({x:0,y:-99,z:0,l:0,vx:0,vy:0,vz:0}))};}
const FX={fire:mkPts(GQ==='low'?24:70,sprite('rgba(255,230,140,1)','rgba(255,80,0,0)'),THREE.AdditiveBlending,.6),smoke:mkPts(GQ==='low'?10:36,sprite('rgba(90,90,90,.55)','rgba(60,60,60,0)'),THREE.NormalBlending,1.6)};
function fireEmit(f,dt){for(const [kind,F] of Object.entries(FX)){const arr=F.m.geometry.attributes.position.array;F.p.forEach((q,i)=>{q.l-=dt;if(q.l<=0&&f&&f.fuel>0&&Math.random()<(kind==='fire'?.5:.15)*(.3+ffrac(f))*(1+((f.lvl||1)-1)*.25)){const k=(.4+ffrac(f))*(1+((f.lvl||1)-1)*.35);q.x=f.x+rnd(-.3,.3)*k;q.z=f.z+rnd(-.3,.3)*k;q.y=H(f.x,f.z)+(f.mesh.userData.fy||.2)+(kind==='smoke'?1:0);q.vx=rnd(-.2,.2);q.vz=rnd(-.2,.2);q.vy=kind==='fire'?rnd(1,2.2)*k:rnd(.6,1.1);q.l=kind==='fire'?rnd(.4,.9):rnd(2,4);}
  if(q.l>0){q.x+=q.vx*dt;q.y+=q.vy*dt;q.z+=q.vz*dt;if(kind==='smoke'){q.vx+=.15*dt;}}else q.y=-99;arr[i*3]=q.x;arr[i*3+1]=q.y;arr[i*3+2]=q.z;});F.m.geometry.attributes.position.needsUpdate=true;}}
// post-processing
function initPost(){if(GQ==='low')return;composer=new EffectComposer(renderer);composer.addPass(new RenderPass(scene,camera));

 bloom=new UnrealBloomPass(new THREE.Vector2(innerWidth/2,innerHeight/2),.4,.45,.92);composer.addPass(bloom);
 if(GQ==='high')composer.addPass(new ShaderPass({uniforms:{tDiffuse:{value:null}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:'uniform sampler2D tDiffuse;varying vec2 vUv;void main(){vec4 c=texture2D(tDiffuse,vUv);float d=length(vUv-vec2(.5,.45));vec4 bl=vec4(0.);for(int i=0;i<8;i++){float a=float(i)*.7853;bl+=texture2D(tDiffuse,vUv+vec2(cos(a),sin(a))*.006*(0.4+d));}bl/=8.;gl_FragColor=mix(c,bl,smoothstep(.28,.8,d)*.55);}'}));
 composer.addPass(new ShaderPass({uniforms:{tDiffuse:{value:null},sat:{value:1.12},vig:{value:.34}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:'uniform sampler2D tDiffuse;uniform float sat,vig;varying vec2 vUv;void main(){vec4 c=texture2D(tDiffuse,vUv);float l=dot(c.rgb,vec3(.299,.587,.114));c.rgb=mix(vec3(l),c.rgb,sat);c.rgb=(c.rgb-.5)*1.05+.5;c.rgb*=mix(1.,smoothstep(.95,.3,length(vUv-.5)),vig);c.rgb*=vec3(1.02,1.,.97);gl_FragColor=c;}'}));
 composer.addPass(new OutputPass());}
initPost();addEventListener('resize',()=>{composer&&composer.setSize(innerWidth,innerHeight);});

// R14: distant biome mountains ringing the world
{const mCols={snow:0xdfe9f5,rock:0x6a625e,sand:0xc9a86a,leaf:0x3f6a34,lava:0x4a2e26};
 const sides=[[0,-1,'snow'],[0,1,'sand'],[1,0,'leaf'],[-1,0,'lava']];
 for(const [sx,sz,bi] of sides){for(let i=-3;i<=3;i++){const px=sx===0?i*80:sx*(W+18),pz=sz===0?i*80:sz*(W+18);const h=42+((i*37)%18+18)%18;
  const m=new THREE.Mesh(new THREE.ConeGeometry(46,h,6),new THREE.MeshStandardMaterial({color:bi==='snow'?mCols.snow:bi==='sand'?mCols.sand:bi==='lava'?mCols.lava:mCols.rock,roughness:1,flatShading:true}));
  m.position.set(px,h/2-4,pz);scene.add(m);
  if(bi==='snow'){const cap=new THREE.Mesh(new THREE.ConeGeometry(20,h*.42,6),new THREE.MeshStandardMaterial({color:0xffffff,roughness:.9,flatShading:true}));cap.position.set(px,h*.78,pz);scene.add(cap);}}}}
// R14: moon + stars
const moonM=new THREE.Mesh(new THREE.SphereGeometry(6,16,12),new THREE.MeshBasicMaterial({color:0xe8efff,fog:false}));scene.add(moonM);
let starPts=null;{const n=420,pos=new Float32Array(n*3);for(let i=0;i<n;i++){const a=Math.random()*6.28,e=Math.random()*1.1+.15,r=165;pos[i*3]=Math.cos(a)*Math.cos(e)*r;pos[i*3+1]=Math.sin(e)*r;pos[i*3+2]=Math.sin(a)*Math.cos(e)*r;}
 const g2=new THREE.BufferGeometry();g2.setAttribute('position',new THREE.BufferAttribute(pos,3));starPts=new THREE.Points(g2,new THREE.PointsMaterial({color:0xcfe0ff,size:1.1,sizeAttenuation:false,transparent:true,opacity:0,fog:false,depthWrite:false}));scene.add(starPts);}
// R14: biome weather (rain / snow / sandstorm / ash) + ambient motes (fireflies, pollen, dust)
function mkLocalPts(n,size,col,op,add){const g2=new THREE.BufferGeometry();g2.setAttribute('position',new THREE.BufferAttribute(new Float32Array(n*3),3));const m=new THREE.Points(g2,new THREE.PointsMaterial({color:col,size,transparent:true,opacity:op,depthWrite:false,blending:add?THREE.AdditiveBlending:THREE.NormalBlending}));m.frustumCulled=false;scene.add(m);return{m,seed:Array.from({length:n},()=>Math.random())};}
const WX=mkLocalPts(GQ==='low'?220:GQ==='medium'?650:1300,.16,0xffffff,.5,false);
const AMB=mkLocalPts(GQ==='low'?60:GQ==='medium'?140:260,.13,0xffe98a,.5,true);
const WXCONF={forest:{kind:'rain',c:0x9fc8ff,fall:11,size:.13,op:.5,drift:1.5},jungle:{kind:'rain',c:0x8fd8ff,fall:14,size:.15,op:.6,drift:2},snow:{kind:'snow',c:0xffffff,fall:3.2,size:.2,op:.85,drift:1.6},desert:{kind:'sand',c:0xe6c88a,fall:1.2,size:.15,op:.55,drift:11},lava:{kind:'ash',c:0xffa060,fall:2,size:.17,op:.6,drift:1}};
let wxKind='';
function updWeatherFx(dt,dl){const b=biomeAt(P.x,P.z),cf=WXCONF[b];wxKind=cf.kind;const t=performance.now()/1000;
 WX.m.position.set(P.x,H(P.x,P.z),P.z);WX.m.material.color.setHex(cf.c);WX.m.material.size=cf.size;WX.m.material.opacity+= ((cf.op)-WX.m.material.opacity)*Math.min(1,dt*2);
 {const a=WX.m.geometry.attributes.position.array;for(let i=0;i<WX.seed.length;i++){let y=a[i*3+1]-cf.fall*dt*(0.6+WX.seed[i]*0.7);let x=a[i*3]+Math.sin(t*.7+i)*dt*cf.drift*.4+ (cf.kind==='sand'?cf.drift*dt:0);let z=a[i*3+2]+(cf.kind==='sand'?dt*2:dt*.3);
  if(y<0){y=22+WX.seed[i]*4;x=(WX.seed[i]*97%1-.5)*56;z=((WX.seed[i]*57)%1-.5)*56;}if(x>30)x-=60;if(z>30)z-=60;
  a[i*3]=x;a[i*3+1]=y;a[i*3+2]=z;}WX.m.geometry.attributes.position.needsUpdate=true;}
 AMB.m.position.set(P.x,H(P.x,P.z),P.z);
 const nightF=dl<.35?1:dl<.7?.4:.12;const ambC=b==='forest'||b==='jungle'?0xffe98a:b==='desert'?0xe6c88a:b==='lava'?0xff8a50:0xdff4ff;
 AMB.m.material.color.setHex(ambC);AMB.m.material.opacity=(b==='forest'||b==='jungle'?nightF*.85:.3);
 {const a=AMB.m.geometry.attributes.position.array;for(let i=0;i<AMB.seed.length;i++){a[i*3]+=Math.sin(t*.4+i*1.7)*dt*.5;a[i*3+1]=1+Math.sin(t*.6+i*2.3)*0.8+AMB.seed[i]*2.2;a[i*3+2]+=Math.cos(t*.3+i)*dt*.5;
  if(a[i*3]>26)a[i*3]=-26;if(a[i*3]<-26)a[i*3]=26;if(a[i*3+2]>26)a[i*3+2]=-26;if(a[i*3+2]<-26)a[i*3+2]=26;}AMB.m.geometry.attributes.position.needsUpdate=true;}
 if(starPts){starPts.position.copy(camera.position);starPts.material.opacity=Math.max(0,.9-dl*1.6);}
 moonM.position.set(camera.position.x-sunDirCur.x*150,Math.max(18,camera.position.y-sunDirCur.y*150),camera.position.z-sunDirCur.z*150);moonM.material.color.setHex(dl<.4?0xe8efff:0x8a94a8);}
let sunDirCur=new THREE.Vector3(0,1,0);
function gfxTick(dt,sunDir,dl){gUni.uTime.value+=dt;sunDirCur.copy(sunDir);updSky(sunDir,dl);updGrass();updWeatherFx(dt,dl);if(waterMat.userData.wn){waterMat.userData.wn.offset.x+=dt*.02;waterMat.userData.wn.offset.y+=dt*.013;}if(bloom)bloom.strength=dl>.5?.3:.6;}
$('gfxSel').value=GQ;$('gfxSel').onchange=e=>{localStorage.setItem('cq_gfx',e.target.value);save();location.reload();};

// ---------- occluder fade (trees between camera and player turn see-through) ----------
const ghostMat=new THREE.MeshStandardMaterial({color:0x6a9a6a,transparent:true,opacity:.22,depthWrite:false,flatShading:true});
const ghosts={};let faded=new Set(),fadeT=0;
function ghostFor(name){if(!ghosts[name]){const src=IM[name];const g=new THREE.InstancedMesh(src.geometry,ghostMat,40);g.count=0;g.frustumCulled=false;scene.add(g);ghosts[name]=g;}return ghosts[name];}
function fadeOccluders(){fadeT-=1/60;if(fadeT>0)return;fadeT=.1;const cx=camera.position.x,cz=camera.position.z,now=new Set();
 const dx=cx-P.x,dz=cz-P.z,L2=dx*dx+dz*dz;for(const o of near(P.x,P.z,Math.sqrt(L2)+3)){if(o.type!=='tree'||!o.alive)continue;const t=((o.x-P.x)*dx+(o.z-P.z)*dz)/L2;if(t<-.05||t>1.1)continue;const px=P.x+dx*t,pz=P.z+dz*t;if(Math.hypot(o.x-px,o.z-pz)<2.4*o.s)now.add(o);}
 for(const o of faded)if(!now.has(o)&&o.alive)for(const [m,i] of o.im){m.setMatrixAt(i,o.mat0[m.uuid]);m.instanceMatrix.needsUpdate=true;}
 for(const g of Object.values(ghosts))g.count=0;
 for(const o of now){for(const [m,i] of o.im){if(!faded.has(o)){m.setMatrixAt(i,M4.makeScale(0,0,0));m.instanceMatrix.needsUpdate=true;}const name=Object.keys(IM).find(k=>IM[k]===m);const g=ghostFor(name);if(g.count<40){g.setMatrixAt(g.count++,o.mat0[m.uuid]);g.instanceMatrix.needsUpdate=true;}}}
 faded=now;}
// ---------- campfires: fuel, light radius, flames ----------
const ringMat=null;
const safeTex=(()=>{const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');const gr=g.createRadialGradient(128,128,0,128,128,128);gr.addColorStop(0,'rgba(90,170,255,.10)');gr.addColorStop(.6,'rgba(70,150,255,.12)');gr.addColorStop(.86,'rgba(80,170,255,.22)');gr.addColorStop(.95,'rgba(140,210,255,.75)');gr.addColorStop(1,'rgba(90,170,255,0)');g.fillStyle=gr;g.fillRect(0,0,256,256);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;})();
const safeMat=new THREE.MeshBasicMaterial({map:safeTex,transparent:true,depthWrite:false,toneMapped:false,fog:false,polygonOffset:true,polygonOffsetFactor:-4});
function safeGeo(){const A=72,Rn=10,pos=[],uv=[],idx=[];pos.push(0,0,0);uv.push(.5,.5);for(let j=1;j<=Rn;j++){const rr=j/Rn;for(let i=0;i<A;i++){const a=i/A*Math.PI*2;pos.push(Math.cos(a)*rr,0,Math.sin(a)*rr);uv.push(.5+Math.cos(a)*rr*.5,.5+Math.sin(a)*rr*.5);}}
 for(let i=0;i<A;i++)idx.push(0,1+(i+1)%A,1+i);for(let j=1;j<Rn;j++)for(let i=0;i<A;i++){const a=1+(j-1)*A+i,b=1+(j-1)*A+(i+1)%A,c=1+j*A+i,d=1+j*A+(i+1)%A;idx.push(a,b,c,b,d,c);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.userData.unit=pos.slice();return g;}
function fitSafe(m,x,z,r){const g=m.geometry,u=g.userData.unit,p=g.attributes.position.array,y0=H(x,z);for(let i=0;i<p.length;i+=3){const vx=u[i]*r,vz=u[i+2]*r;p[i]=vx;p[i+2]=vz;p[i+1]=H(x+vx,z+vz)-y0+.15;}g.attributes.position.needsUpdate=true;g.computeBoundingSphere();}
function updFires(dt){let best=null,bd=40;for(const s of structs){if(s.type!=='campfire')continue;if(s.fuel>0)s.fuel=Math.max(0,s.fuel-dt*(s.main?.3:.45)*flv(s).burn);const d=Math.hypot(s.x-P.x,s.z-P.z);if(s.fuel>0&&d<bd){bd=d;best=s;}
  const k=s.fuel>0?.4+ffrac(s)*1.2:0;s.mesh.children.forEach(c=>{if(c.userData.flame){c.visible=k>0;c.scale.set(k,k*(.8+Math.random()*.4),k);}});
  const r=fireR(s);if(!s.ring){s.ring=new THREE.Mesh(safeGeo(),safeMat);s.ring.renderOrder=2;s.ring.frustumCulled=false;s.ring.position.set(s.x,H(s.x,s.z),s.z);scene.add(s.ring);s.ringR=-1;}s.ring.visible=r>0&&d<90;if(s.ring.visible&&Math.abs(r-s.ringR)>.15){s.ringR=r;fitSafe(s.ring,s.x,s.z,r);}
  if(s.main&&s.fuel<15&&s.fuel>0&&!s.warned&&night()){s.warned=1;toast('🔥 The camp fire is dying! Add logs (USE near the fire).',3);}if(s.fuel>20)s.warned=0;}
 if(best){const r=fireR(best),fr=ffrac(best),L=best.lvl||1,gy=H(best.x,best.z),fy=best.mesh.userData.fy||.6,t=performance.now()/1000,fl=.9+.06*Math.sin(t*13.1)+.04*Math.sin(t*23.7+1)+(Math.random()-.5)*.05,nt=night()?1:.12;
  fireLight.position.set(best.x+Math.sin(t*7)*.08,gy+fy+.7,best.z+Math.cos(t*9)*.08);fireLight.distance=r;fireLight.decay=1.3;fireLight.intensity=nt*1.7*Math.pow(r/2,1.3)*(.6+.4*fr)*fl;
  fireFill.position.set(best.x,gy+r*.4,best.z);fireFill.distance=Math.sqrt(r*r+Math.pow(r*.4,2))*1.02;fireFill.decay=1;fireFill.intensity=nt*.38*r*(.6+.4*fr)*(.95+.05*fl);
  if(fireLight.castShadow&&Math.abs(fireLight.shadow.camera.far-r)>1){fireLight.shadow.camera.far=r;fireLight.shadow.camera.updateProjectionMatrix();}best.lightR=r;SAFEU.uSafeC.value.set(best.x,best.z);SAFEU.uSafeR.value=r;SAFEU.uSafeDay.value=(GQ==='low'?.9:GQ==='medium'?2.6:2.8)*duskF;safeBlue.position.set(best.x,gy+r*.3,best.z);safeBlue.distance=r;safeBlue.intensity=(night()?.12:.25)*r*(.85+.15*Math.sin(t*2));}else{fireLight.intensity=0;fireFill.intensity=0;safeBlue.intensity=0;SAFEU.uSafeR.value=0;SAFEU.uSafeDay.value=0;}safeMat.opacity=.78+.22*Math.sin(performance.now()/1000*2);
 fireEmit(best,dt);}
// ---------- main loop ----------
const clock=new THREE.Clock();const camPos=new THREE.Vector3(0,14,12);let hudT=0,regrowT=0;
function tempLabel(b){return b==='snow'?'🥶 Cold':b==='desert'||b==='lava'?'🥵 Heat':'🌡️ Temp';}
function update(dt){const b=biomeAt(P.x,P.z);
 // movement
 let mx=joy.x,mz=joy.y;if(keys.w||keys.arrowup)mz-=1;if(keys.s||keys.arrowdown)mz+=1;if(keys.a||keys.arrowleft)mx-=1;if(keys.d||keys.arrowright)mx+=1;const ml=Math.hypot(mx,mz);
 P.blocking=(has('shield')||has('guard_shield'))&&!P.dead&&(keys.q||rBlock||mBlock);if(P.blocking){mx*=.5;mz*=.5;}
 if(P.dead||P.tower){mx=mz=0;}
 if(ml>.1){const cy=Math.cos(camYaw),sy=Math.sin(camYaw);const rx=mx*cy+mz*sy,rz=-mx*sy+mz*cy;mx=rx;mz=rz;const sp=6.2*Math.min(1,ml)*(inPond(P.x,P.z)?.5:1)*(b==='snow'&&!has('cold_gear')&&!has('snow_wolf_armor')?.8:1)*(has('sandstorm_boots')?1.15:1)*((P.spdT>0)?1.3:1)*(has('sled')&&b==='snow'?1.25:1);const nx=P.x+mx/Math.max(1,ml)*sp*dt,nz=P.z+mz/Math.max(1,ml)*sp*dt;
  if(!pBlocked(nx,P.z))P.x=clamp(nx,-W+3,W-3);if(!pBlocked(P.x,nz))P.z=clamp(nz,-W+3,W-3);P.dir=Math.atan2(mx,mz);rigSet(P.fig,ml>.6?'run':'walk',1);}else if(!P.dead)rigSet(P.fig,'idle');
 if(P.tower){P.x=P.tower.x;P.z=P.tower.z;P.jy=3.45;P.vy=0;}
 else{const _top=structTopAt(P.x,P.z);
  if(P.vy!==0||P.jy>_top+.001){const _pv=P.jy;P.jy+=P.vy*dt;P.vy-=22*dt;if(P.vy<=0&&P.jy<=_top&&_pv>=_top-.02){P.jy=_top;P.vy=0;if(_top===0)P.fig.scale.set(1.08,.9,1.08);}if(P.jy<0){P.jy=0;P.vy=0;P.fig.scale.set(1.08,.9,1.08);}}
  else if(_top>P.jy){P.jy=_top;}
  else if(_top<P.jy)P.vy=-.1;}
 if(actHeld&&P.cd<=0)doAttack(mouseAim());if(keys.z)camYaw+=1.8*dt;if(keys.x)camYaw-=1.8*dt;P.cd-=dt;if(P.spdT>0)P.spdT-=dt;if(P.warmT>0)P.warmT-=dt;if(P.fireT>0)P.fireT-=dt;
 P.fig.position.set(P.x,H(P.x,P.z)+P.jy,P.z);P.fig.rotation.y=P.dir;rigTick(P.fig,dt);jumpPose(dt);
 // survival
 if(!P.dead){const hot=(b==='desert'&&!has('heat_gear'));P.hunger-=dt*.22;P.thirst-=dt*(hot?.75:.3);
  const fire=litAt(P.x,P.z);
  if(b==='snow')P.temp+=has('cold_gear')?(fire?8:1)*dt:(fire?10:(night()?-5:-3.5)*(has('ice_ring')?.45:1)*((P.warmT>0)?.35:1))*dt;
  else if(b==='lava')P.temp+=(has('heat_gear')||has('ember_armor'))?1*dt:-5*((P.fireT>0)?.25:1)*dt;else if(b==='desert')P.temp+=(has('heat_gear')||has('ember_armor'))?1*dt:(night()?2:-2)*((P.fireT>0)?.4:1)*dt;else P.temp+=6*dt;
  P.temp=clamp(P.temp,0,100);P.hunger=clamp(P.hunger,0,100);P.thirst=clamp(P.thirst,0,100);
  if(MODE!=='decorative'){if(P.hunger<=0)hurtTick(1.2*dt,'starving');if(P.thirst<=0)hurtTick(1.6*dt,'dehydrated');}if(P.temp<=0)hurtTick(3*dt,b==='snow'?'freezing! Craft cold gear':'overheating! Craft heat gear');
  if(inLava(P.x,P.z))hurtTick(((has('heat_gear')||has('ember_armor'))?6:18)*((P.fireT>0)?.3:1)*dt,'in LAVA!');
  if(P.hunger>50&&P.thirst>50&&P.temp>30&&P.hp<P.maxHp)P.hp=Math.min(P.maxHp,P.hp+(fire?1.5:.5)*(has('sun_amulet')?3:1)*dt+(has('heartwood_charm')?.3:0)*dt+(treeInstalled.includes('vine_seed')?.35:0)*dt);}
 {const lf=!P.dead&&litFire(P.x,P.z);if(lf&&(lf.lvl||1)>=3&&P.hp<P.maxHp)P.hp=Math.min(P.maxHp,P.hp+(((lf.lvl||1)>=5?4:2)+(treeInstalled.length>=4?3:0))*dt);}
 musT-=dt;if(musT<=0){musT=.5;MUS.set(pickTheme(b));}
 // world
 dayT+=dt;if(Math.floor((dayT-dt)/DAY)<Math.floor(dayT/DAY)){day++;toast('☀️ Day '+day);if(MODE==='decorative'&&day>=11&&!ratedShown){ratedShown=true;save();setTimeout(()=>showRating(),600);}}
 {const nn=night();if(nn&&!wasNight)onDusk();else if(!nn&&wasNight)onDawn();wasNight=nn;}updPosts();tickTreasure(dt);tickRaid(dt);updDefenses(dt);updGhost();
 manageAnimals(dt);updAnimals(dt);updBoss(dt);updFx(dt);
 regrowT-=dt;if(regrowT<=0){regrowT=5;const now=performance.now()/1000;for(const id of [...deadRes]){const o=RES[id];if(o.respawnAt&&now>o.respawnAt&&Math.hypot(o.x-P.x,o.z-P.z)>20){showRes(o);deadRes.delete(id);}}}
 updDusk();updNPCs(dt);updTraders(dt);updFires(dt);updKids(dt);mpTick(dt);if(treeOrb){treeOrb.rotation.y+=dt*2;treeOrb.visible=claimableParts().length>0;}
 // lighting
 const ph=phase(),sunA=ph*Math.PI*2;const dl=clamp(Math.sin(sunA)*1.6+.25,0,1);sun.intensity=.15+2.2*dl;hemi.intensity=.18+.75*dl;
 sun.position.set(P.x+Math.cos(sunA)*40,10+Math.max(.2,Math.sin(sunA))*50,P.z+20);sun.target.position.set(P.x,0,P.z);
 const fc=new THREE.Color(BIOME[b].fog).lerp(new THREE.Color(0x0a1028),1-dl);scene.fog.color.lerp(fc,.05);if(scene.background)scene.background.copy(scene.fog.color);gfxTick(dt,V.set(Math.cos(sunA),Math.sin(sunA),.35).normalize().clone(),dl);
 torchLight.intensity=lightsOn()&&P.torchOn?(has('lantern')?60:has('torch')?30:0):0;torchLight.distance=has('lantern')?24:16;torchLight.position.set(P.x,H(P.x,P.z)+2.5,P.z);
 lavaMat.color.setHSL(.04,1,(HQ?.62:.5)+Math.sin(performance.now()/500)*.05);
 // camera
 shake=Math.max(0,shake-dt);const cd2=camDist;camera.position.lerp(V.set(P.x+Math.sin(camYaw)*cd2*.64,H(P.x,P.z)+cd2*.77,P.z+Math.cos(camYaw)*cd2*.64),.15);fadeOccluders();camera.position.x+=(Math.random()-.5)*shake;camera.lookAt(P.x,H(P.x,P.z)+1,P.z);
 // hud
 if(toastT>0){toastT-=dt;if(toastT<=0)$('toast').style.opacity=0;}
 hudT-=dt;if(hudT<=0){hudT=.15;$('hpB').style.width=(P.hp/P.maxHp*100)+'%';$('coinV').textContent=coins;$('dayV').textContent=day;$('raidV').textContent=raidHudTxt();for(const c of TCH)if(!c.seen&&Math.hypot(c.x-P.x,c.z-P.z)<30)c.seen=1;$('huB').style.width=P.hunger+'%';$('thB').style.width=P.thirst+'%';$('waB').style.width=P.temp+'%';$('waL').textContent=tempLabel(b);$('waB').style.background=b==='snow'?'#7fd0ff':b==='desert'||b==='lava'?'#ff7a30':'#f1c40f';
  const _cm=Math.floor(((ph*24+6)%24)*60),_hh=Math.floor(_cm/60),_mm=_cm%60;$('info').textContent=`${BIOME[b].n} · 📅 Day ${day} · 🕰️ ${String(_hh).padStart(2,'0')}:${String(_mm).padStart(2,'0')}${night()?' 🌙':_hh>=18?' 🌆':' ☀️'}`;updSteps();
  const u=useTarget();$('useL').textContent=u?u.l:'USE';const pr=$('prompt');const bs=!moving?breakableNear():null;
  if(!isTouch&&(u||bs||breakConfirm)){pr.textContent=breakConfirm&&breakConfirm.s===bs?'🔨 Break '+nm(bs.type)+'?  B = yes · Esc = no':(u?'E: '+u.l:'')+(bs?(u?'   ·   ':'')+'B: Break '+nm(bs.type):'');pr.classList.remove('hidden');}else pr.classList.add('hidden');
  if(P.fig&&armorKey()!==(P._ak||''))applyChar(false);if(!$('fullMap').classList.contains('hidden'))drawMap($('fullMapCan'),0,0,W*2,false);updTraderArrow();$('bShoot').style.display=(has('bow')||has('crossbow'))?'flex':'none';$('bBlock').style.display=(has('shield')||has('guard_shield'))?'flex':'none';equipVisual();drawMap($('minimap'),P.x,P.z,110,true);renderHot();}
}
let hurtMsgT=0;function hurtTick(d,msg){P.hp-=d;if(hurtMsgT<=0){toast('⚠️ You are '+msg,1.5);hurtMsgT=4;}if(P.hp<=0)die();}
function loop(){requestAnimationFrame(loop);const dt=Math.min(clock.getDelta(),.05);if(running&&!paused){hurtMsgT-=dt;update(dt);}if(composer)composer.render();else renderer.render(scene,camera);}

// ---------- music: original procedural WebAudio score ----------
let musT=0;
const MUS=(()=>{let st={vol:.6,mute:false};try{Object.assign(st,JSON.parse(localStorage.getItem('cq_music')||'{}'));}catch(e){}
 let master=null,comp=null,noiseBuf=null,curName='',tracks=[],starts=0;
 const env=(g,t,a,d,v)=>{g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.0002,v),t+a);g.gain.exponentialRampToValueAtTime(.0001,t+a+d);};
 function osc(c,out,type,f,t,a,d,v,det=0){const o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.value=f;o.detune.value=det;env(g,t,a,d,v);o.connect(g).connect(out);o.start(t);o.stop(t+a+d+.05);return o;}
 function noise(c,o,t,d,v,ft,ff){const s=c.createBufferSource();s.buffer=noiseBuf;const fl=c.createBiquadFilter();fl.type=ft;fl.frequency.value=ff;const g=c.createGain();env(g,t,.002,d,v);s.connect(fl).connect(g).connect(o);s.start(t,Math.random()*.5);s.stop(t+d+.05);}
 const filt=(c,o,type,f,q=1)=>{const x=c.createBiquadFilter();x.type=type;x.frequency.value=f;x.Q.value=q;x.connect(o);return x;};
 const INS={
  flute:(c,o,t,f,d,v)=>{const x=osc(c,o,'sine',f,t,.09,d,v);const l=c.createOscillator(),lg=c.createGain();l.frequency.value=5.2;lg.gain.value=f*.007;l.connect(lg).connect(x.frequency);l.start(t+.15);l.stop(t+d+.15);osc(c,o,'triangle',f*2,t,.09,d*.7,v*.12);noise(c,o,t,.08,v*.08,'bandpass',f*2);},
  pluck:(c,o,t,f,d,v)=>{const fl=c.createBiquadFilter();fl.type='lowpass';fl.frequency.setValueAtTime(f*7,t);fl.frequency.exponentialRampToValueAtTime(f*1.3,t+.35);fl.connect(o);osc(c,fl,'triangle',f,t,.004,Math.min(d,1.1),v);osc(c,fl,'sawtooth',f,t,.004,.22,v*.3);},
  piano:(c,o,t,f,d,v)=>{osc(c,o,'sine',f,t,.005,Math.min(d*1.6,2.2),v*.9);osc(c,o,'triangle',f*2,t,.005,.5,v*.22);osc(c,o,'sine',f*3,t,.005,.25,v*.08);},
  oud:(c,o,t,f,d,v)=>{const fl=filt(c,o,'bandpass',f*2.6,1.8);const x=osc(c,fl,'sawtooth',f*1.03,t,.003,Math.min(d,.6),v*1.8);x.frequency.exponentialRampToValueAtTime(f,t+.06);osc(c,fl,'square',f*2,t,.003,.12,v*.4);},
  bell:(c,o,t,f,d,v)=>{osc(c,o,'sine',f,t,.004,2.6,v);osc(c,o,'sine',f*2.76,t,.004,1.3,v*.3);osc(c,o,'sine',f*5.4,t,.004,.5,v*.12);},
  marimba:(c,o,t,f,d,v)=>{osc(c,o,'sine',f,t,.002,.5,v);osc(c,o,'sine',f*3.99,t,.002,.07,v*.45);},
  pad:(c,o,t,f,d,v)=>{const fl=filt(c,o,'lowpass',1100);for(const dt of[-9,9])osc(c,fl,'sawtooth',f,t,d*.45,d*.6,v*.35,dt);},
  drone:(c,o,t,f,d,v)=>{const fl=filt(c,o,'lowpass',300);for(const dt of[-14,0,10])osc(c,fl,'sawtooth',f,t,d*.3,d*.8,v*.4,dt);},
  bass:(c,o,t,f,d,v)=>{osc(c,filt(c,o,'lowpass',700),'triangle',f,t,.008,Math.min(d,.55),v*1.2);},
  sawbass:(c,o,t,f,d,v)=>{const fl=c.createBiquadFilter();fl.type='lowpass';fl.frequency.setValueAtTime(1400,t);fl.frequency.exponentialRampToValueAtTime(200,t+.18);fl.connect(o);osc(c,fl,'sawtooth',f,t,.004,.2,v);},
  brass:(c,o,t,f,d,v)=>{const fl=c.createBiquadFilter();fl.type='lowpass';fl.frequency.setValueAtTime(350,t);fl.frequency.linearRampToValueAtTime(1600,t+.12);fl.connect(o);osc(c,fl,'sawtooth',f,t,.07,d,v*.6);osc(c,fl,'sawtooth',f,t,.07,d,v*.4,7);},
  kick:(c,o,t,f,d,v)=>{const x=osc(c,o,'sine',120,t,.002,.32,v*1.5);x.frequency.exponentialRampToValueAtTime(42,t+.28);},
  tom:(c,o,t,f,d,v)=>{const x=osc(c,o,'sine',170,t,.002,.24,v);x.frequency.exponentialRampToValueAtTime(95,t+.2);},
  shaker:(c,o,t,f,d,v)=>noise(c,o,t,.05,v*.45,'highpass',6500),
  snare:(c,o,t,f,d,v)=>{noise(c,o,t,.16,v*.75,'bandpass',1900);osc(c,o,'triangle',200,t,.002,.07,v*.4);},
  frame:(c,o,t,f,d,v)=>{noise(c,o,t,.11,v*.55,'bandpass',700);osc(c,o,'sine',95,t,.002,.18,v*.6);},
  taiko:(c,o,t,f,d,v)=>{const x=osc(c,o,'sine',80,t,.003,.6,v*1.7);x.frequency.exponentialRampToValueAtTime(48,t+.5);noise(c,o,t,.07,v*.4,'lowpass',500);}};
 const MAJ=[0,2,4,5,7,9,11],MIN=[0,2,3,5,7,8,10],PHR=[0,1,3,5,7,8,10];
 const TH={
  forest:{bpm:72,root:62,scale:[0,2,4,7,9],prog:[[0,0],[7,0],[9,1],[5,0],[0,0],[4,0],[7,0],[9,1]],lead:'flute',dens:.34,arp:'pluck',arpPat:'x...x...x...x...',pad:'pad',vol:.8},
  snow:{bpm:60,root:64,scale:[0,2,4,7,9,11],prog:[[0,0],[9,1],[5,0],[7,0]],lead:'bell',dens:.2,pad:'pad',vol:.7},
  jungle:{bpm:76,root:57,scale:[0,2,4,7,9],prog:[[0,0],[5,0],[7,0],[4,0]],lead:'marimba',dens:.36,arp:'marimba',arpPat:'x.....x...x.....',drums:{shaker:'x...............'},vol:.75},
  desert:{bpm:68,root:62,scale:[0,2,4,5,7,9],prog:[[0,0],[5,0],[9,1],[7,0]],lead:'oud',dens:.38,pad:'pad',drums:{frame:'x...............'},vol:.75},
  lava:{bpm:60,root:50,scale:[0,2,4,7,9],prog:[[0,0],[7,0],[9,1],[5,0]],lead:'pad',dens:.18,leadOct:-12,drone:1,vol:.7},
  village:{bpm:76,root:60,scale:MAJ,prog:[[0,0],[5,0],[7,0],[0,0],[9,1],[5,0],[7,0],[0,0]],lead:'piano',dens:.5,arp:'pluck',arpPat:'x...x...x...x...',bass:'bass',bassPat:'x.......x.......',vol:.75},
  boss:{bpm:80,root:50,scale:MIN,prog:[[0,1],[8,0],[10,0],[7,0]],lead:'flute',dens:.32,pad:'pad',bass:'bass',bassPat:'x.......x.......',vol:.7},
  raid:{bpm:78,root:57,scale:[0,2,4,7,9],prog:[[0,0],[7,0],[9,1],[5,0]],lead:'bell',dens:.28,pad:'pad',drums:{tom:'x...............',shaker:'........x.......'},vol:.65}};
 const BOSSROOT={yeti:52,vine:55,pharaoh:50,titan:45};
 function theme(name){const [base,mod]=name.split('_');let t={...TH[base]||TH.forest};if(base==='boss'&&BOSSROOT[mod])t.root=BOSSROOT[mod];
  if(mod==='night'){t={...t,bpm:Math.round(t.bpm*.85),dens:t.dens*.55,root:t.root-(base==='lava'?0:12),night:1,drums:t.drums?Object.fromEntries(Object.entries(t.drums).filter(([k])=>k!=='kick'&&k!=='snare')):null,pad:t.pad||'pad'};if(base!=='desert'&&base!=='lava'&&t.scale===MAJ)t.scale=MIN;}return t;}
 function init(){const c=audio();if(!c)return false;if(master)return true;master=c.createGain();master.gain.value=st.mute?0:st.vol*.45;comp=c.createDynamicsCompressor();master.connect(comp).connect(c.destination);
  noiseBuf=c.createBuffer(1,c.sampleRate,c.sampleRate);const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;setInterval(sched,80);if(curName){const n=curName;curName='';set(n);}return true;}
 function set(name){if(name===curName)return;curName=name;if(!master)return;if(name==='off'){const c0=audio(),now=c0.currentTime;for(const tr of tracks){tr.g.gain.cancelScheduledValues(now);tr.g.gain.setValueAtTime(tr.g.gain.value,now);tr.g.gain.linearRampToValueAtTime(0,now+.6);tr.dead=now+.8;}return;}const c=audio(),now=c.currentTime;starts++;
  for(const tr of tracks)if(!tr.dead){tr.g.gain.cancelScheduledValues(now);tr.g.gain.setValueAtTime(tr.g.gain.value,now);tr.g.gain.linearRampToValueAtTime(0,now+3);tr.dead=now+3.2;}
  const th=theme(name),g=c.createGain();g.gain.setValueAtTime(0,now);g.gain.linearRampToValueAtTime(th.vol,now+3);const lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=th.night?1500:12000;g.connect(lp).connect(master);
  tracks.push({name,th,g,lp,next:now+.1,step:0,deg:0});}
 function sched(){if(!master)return;const c=audio(),now=c.currentTime;tracks=tracks.filter(tr=>{if(tr.dead&&now>tr.dead){tr.lp.disconnect();return false;}return true;});
  for(const tr of tracks){const th=tr.th,sp=60/th.bpm/4;while(tr.next<now+.3){play(c,tr,tr.next,sp);tr.next+=sp;tr.step++;}}}
 const mtof=m=>440*Math.pow(2,(m-69)/12);
 function play(c,tr,t,sp){const th=tr.th,o=tr.g,s=tr.step%16,bar=Math.floor(tr.step/16),[cr,mn]=th.prog[bar%th.prog.length],R=th.root+cr,ch=[R,R+(mn?3:4),R+7];
  if(s===0){if(th.pad)ch.forEach(n=>INS[th.pad](c,o,t,mtof(n),sp*16,.05));if(th.drone)INS.drone(c,o,t,mtof(th.root-12),sp*16,.12);}
  if(th.arp&&th.arpPat[s]==='x')INS[th.arp](c,o,t,mtof(ch[(s>>1)%3]+(s>=8?12:0)),sp*3,.07);
  if(th.bass&&th.bassPat[s]!=='.')INS[th.bass](c,o,t,mtof(R-24+(th.bassPat[s]==='o'?7:0)),sp*2,.16);
  if(th.drums)for(const [k,p] of Object.entries(th.drums))if(p[s]==='x')INS[k](c,o,t,0,0,k==='shaker'?.12:.22);
  if(s%2===0&&Math.random()<th.dens){const sc=th.scale;tr.deg=Math.max(-3,Math.min(10,tr.deg+[-2,-1,-1,1,1,2,0][Math.floor(Math.random()*7)]));if(s===0)tr.deg=Math.round(tr.deg/3)*3;
   const oc=Math.floor(tr.deg/sc.length),n=th.root+12+(th.leadOct||0)+oc*12+sc[((tr.deg%sc.length)+sc.length)%sc.length];const dur=sp*(Math.random()<.4?4:2);INS[th.lead](c,o,t,mtof(n),dur,th.lead==='bell'?.09:.11);}}
 function save(){localStorage.setItem('cq_music',JSON.stringify(st));if(master){const c=audio();master.gain.setTargetAtTime(st.mute?0:st.vol*.45,c.currentTime,.1);}}
 return {init,set,get cur(){return curName;},get starts(){return starts;},get tracks(){return tracks.length;},get vol(){return st.vol;},get mute(){return st.mute;},setVol(v){st.vol=v;save();},setMute(m){st.mute=m;save();}};})();
function pickTheme(b){if(animals.some(a=>a.raid&&a.alive)||raidQ.length&&night())return 'raid';if(boss&&boss.alive)return 'boss_'+boss.B.id;const n=night()?'_night':'';if(VILLAGES.some(v=>Math.hypot(P.x-v.x,P.z-v.z)<24))return 'village'+n;return b+n;}
{const v=document.getElementById('musVol'),m=document.getElementById('musMute');if(v){v.value=Math.round(MUS.vol*100);m.checked=MUS.mute;v.oninput=()=>MUS.setVol(v.value/100);m.onchange=()=>MUS.setMute(m.checked);}}

// ---------- release 6: defenses ----------
const DEF={thorn_wall:{hp:240,mat:'iron'},guardian_totem:{hp:150,mat:'stone'},fence:{hp:40,mat:'planks'},wall:{hp:150,mat:'stone'},spike_barricade:{hp:70,mat:'planks'},gate:{hp:150,mat:'stone'},iron_wall:{hp:320,mat:'iron'},watchtower:{hp:200,mat:'wood'},turret:{hp:120,mat:'iron'},flame_trap:{hp:100,mat:'iron'},bear_trap:{hp:80,mat:'iron'},alarm_bell:{hp:60,mat:'iron'},scarecrow:{hp:90,mat:'fiber'}};
const SEG={thorn_wall:[1,.35],fence:[1,.12],wall:[1,.3],gate:[1,.28],iron_wall:[1,.3],spike_barricade:[1,.38]};
const NOBLOCK=new Set(['trap','bear_trap','tar_pit','trench','rug','path_stones']);
const enemies=()=>animals.filter(a=>a.alive&&(a.K.beh==='cultist'||(a.K.beh==='hostile'&&a.agro)));
function segDist(s,x,z){const rt=s.rot||0,ux=Math.cos(rt),uz=-Math.sin(rt),dx=x-s.x,dz=z-s.z,L=SEG[s.type][0];const t=clamp(dx*ux+dz*uz,-L,L);return Math.hypot(dx-t*ux,dz-t*uz);}
function dmgStruct(s,d,by){if(!s.hp||s.dead)return;s.hp-=d;floatTxt(s.x,s.z,'-'+Math.round(d)+' 🧱','#fc8');if(s.type==='spike_barricade'&&by){hitAnimal(by,7);}
 if(s.hp<=0){s.dead=1;scene.remove(s.mesh);structs.splice(structs.indexOf(s),1);toast('💥 Your '+nm(s.type).replace(/^\S+ /,'')+' was destroyed!',2);if(P.tower===s)climbDown();}}
function slowAt(a){if(a.rootT>0)return 0;let k=1;for(const s of structs){if(s.type==='tar_pit'&&Math.hypot(a.x-s.x,a.z-s.z)<1.8)k=Math.min(k,.35);else if(s.type==='trench'&&Math.hypot(a.x-s.x,a.z-s.z)<1.5)k=Math.min(k,.45);else if(s.type==='guardian_totem'&&Math.hypot(a.x-s.x,a.z-s.z)<8)k=Math.min(k,.6);}return k;}
function climbDown(){const s=P.tower;P.tower=null;P.jy=0;P.vy=0;if(s){P.x=s.x+Math.sin(P.dir)*2.2;P.z=s.z+Math.cos(P.dir)*2.2;}toast('You climb down');}
function climb(s){P.tower=s;P.x=s.x;P.z=s.z;P.jy=3.45;P.vy=0;toast('🗼 On the watchtower: longer bow range, melee enemies can’t reach you. E to climb down');}
function toggleGate(s){s.open=!s.open;s.mesh.userData.door.rotation.y=s.open?-1.7:0;sfx.craft();toast(s.open?'Gate opened':'Gate closed',1);}
function loadTurret(s){const n=Math.min(cnt('arrows'),40-(s.ammo||0));if(n<=0)return toast(has('arrows')?'Turret is full':'You need arrows to load the turret');add('arrows',-n);s.ammo=(s.ammo||0)+n;toast('🎯 Loaded '+n+' arrows ('+s.ammo+')');}
function repairStruct(s){const D=DEF[s.type],need=Math.max(1,Math.ceil(3*(1-s.hp/D.hp)));if(cnt(D.mat)<need)return toast('Repair needs '+need+' '+nm(D.mat));add(D.mat,-need);s.hp=D.hp;sfx.craft();toast('🔧 Repaired '+nm(s.type));}
function defTarget(){for(const s of structs){const d=Math.hypot(s.x-P.x,s.z-P.z);if(d>2.8)continue;
  if(s.type==='watchtower')return{l:P.tower===s?'CLIMB DOWN':'CLIMB',f:()=>P.tower===s?climbDown():climb(s)};
  if(s.type==='gate')return{l:s.open?'CLOSE GATE':'OPEN GATE',f:()=>toggleGate(s)};
  if(s.type==='turret'&&(s.ammo||0)<40&&has('arrows'))return{l:'LOAD',f:()=>loadTurret(s)};
  if(DEF[s.type]&&s.hp<DEF[s.type].hp-1)return{l:'REPAIR '+Math.round(s.hp/DEF[s.type].hp*100)+'%',f:()=>repairStruct(s)};}
 if(P.tower)return{l:'CLIMB DOWN',f:climbDown};return null;}
let bellRang=0;
function updDefenses(dt){const E=enemies();for(const a of E){if(a.rootT>0)a.rootT-=dt;if(a.spkT>0)a.spkT-=dt;}
 for(const s of [...structs]){if(s.cd>0)s.cd-=dt;const t=s.type;
  if(t==='turret'){const h=s.mesh.userData.head;let best=null,bd=20;for(const a of E){const d=Math.hypot(a.x-s.x,a.z-s.z);if(d<bd){bd=d;best=a;}}
   if(best){const ang=Math.atan2(best.x-s.x,best.z-s.z);h.rotation.y=ang-(s.mesh.rotation.y||0);if((s.ammo||0)>0&&!(s.cd>0)&&losClear(s.x,s.z,best.x,best.z)){s.ammo--;s.cd=1.3;shoot('player',s.x+Math.sin(ang)*.8,s.z+Math.cos(ang)*.8,ang,26,18,0xd8c8a0,.18,1.3,{own:true,h:2.05,vy:2.6,grav:4.5});tone(500,.08,'square',.05,200);}}}
  else if(t==='guardian_totem'){let best=null,bd=15;for(const a of E){const d=Math.hypot(a.x-s.x,a.z-s.z);if(d<bd){bd=d;best=a;}}
   if(best&&!(s.cd>0)&&losClear(s.x,s.z,best.x,best.z)){const ang=Math.atan2(best.x-s.x,best.z-s.z);s.cd=2.2;shoot('player',s.x+Math.sin(ang)*.5,s.z+Math.cos(ang)*.5,ang,22,12,0x66d9ff,.22,1.2,{own:true,h:2.45,vy:2.2,grav:4});tone(740,.12,'sine',.05,1180);}}
  else if(t==='flame_trap'){if(!(s.cd>0))for(const a of E)if(Math.hypot(a.x-s.x,a.z-s.z)<1.8){s.cd=3;for(const b of E)if(Math.hypot(b.x-s.x,b.z-s.z)<2.4)hitAnimal(b,22);floatTxt(s.x,s.z,'🔥 WHOOSH','#f80');s.mesh.userData.coal.material.emissiveIntensity=4;tone(90,.4,'sawtooth',.12,40);break;}if(s.mesh.userData.coal)s.mesh.userData.coal.material.emissiveIntensity=Math.max(.6,s.mesh.userData.coal.material.emissiveIntensity-dt*3);}
  else if(t==='bear_trap'){if(!(s.cd>0))for(const a of E)if(Math.hypot(a.x-s.x,a.z-s.z)<1){s.cd=8;a.rootT=3;hitAnimal(a,30);floatTxt(s.x,s.z,'🐻 SNAP!','#fa0');break;}}
  else if(t==='spike_barricade'||t==='thorn_wall'){for(const a of E)if(!(a.spkT>0)&&segDist(s,a.x,a.z)<1.05){a.spkT=1;hitAnimal(a,t==='thorn_wall'?13:8);}}
  else if(t==='alarm_bell'){if(!(s.cd>0)){const near=E.filter(a=>Math.hypot(a.x-s.x,a.z-s.z)<38);if(near.length){s.cd=25;bellRang++;const a=near[0],ang=Math.atan2(a.x-s.x,-(a.z-s.z));const dir=['north','north-east','east','south-east','south','south-west','west','north-west'][((Math.round(ang/(Math.PI/4))%8)+8)%8];
    toast('🔔 <b>Alarm bell!</b> '+near.length+' enemies approaching from the '+dir+'!',3);for(let i=0;i<4;i++)setTimeout(()=>{tone(880,.6,'sine',.18);tone(1320,.4,'sine',.06);},i*350);s.mesh.userData.bell&&(s.mesh.userData.bell.rotation.z=.6);}}
   if(s.mesh.userData.bell)s.mesh.userData.bell.rotation.z*=.95;}}}
// placement ghost
let ghost=null,ghostType=null,ghostRot=0;const gMat=new THREE.MeshBasicMaterial({color:0x40ff60,transparent:true,opacity:.42,depthWrite:false});
const placeDist=k=>SEG[k]?1.9:k==='watchtower'?3:k==='turret'?2.6:2.4;
function placePos(k){const d=placeDist(k);return{x:P.x+Math.sin(P.dir)*d,z:P.z+Math.cos(P.dir)*d,rot:P.dir+ghostRot};}
function placeOk(k,p){return !inPond(p.x,p.z,.5)&&!(NOBLOCK.has(k)?false:blocked(p.x,p.z,.5));}
function updGhost(){if(moving){if(ghost){scene.remove(ghost);ghost=null;ghostType=null;}const rb=$('bRot');if(rb)rb.style.display='flex';updMoveGhost();return;}updMoveGhost();const it=slots[selHot];const k=it&&PLACE.includes(it.k)&&!P.tower?it.k:null;if(k!==ghostType){if(ghost)scene.remove(ghost);ghost=null;ghostType=k;if(k){ghost=structMesh(k);ghost.traverse(o=>{if(o.isMesh){o.material=gMat;o.castShadow=false;}if(o.isLight)o.visible=false;});scene.add(ghost);}
  const show=!!k;for(const id of ['bRot'])$(id).style.display=show?'flex':'none';}
 if(!ghost)return;const p=placePos(k);ghost.position.set(p.x,H(p.x,p.z)+.02,p.z);ghost.rotation.y=p.rot;gMat.color.setHex(placeOk(k,p)?0x40ff60:0xff4040);}
function rotGhost(){ghostRot+=Math.PI/4;if(ghostType)toast('↻ Rotated '+Math.round(((ghostRot*180/Math.PI)%360))+'°',.8);}
function defMesh(type,g,wood,stone){const iron=new THREE.MeshStandardMaterial({color:0x5a5e66,metalness:.75,roughness:.35});
 if(type==='spike_barricade'){part(g,BX,wood,0,.35,0,2,.22,.22);for(let i=0;i<7;i++){const s=new THREE.Mesh(new THREE.ConeGeometry(.08,1.1,6),wood);s.position.set(-.9+i*.3,.55,0);s.rotation.x=i%2?.7:-.7;g.add(s);}for(const x of[-.85,.85])part(g,BX,wood,x,.2,0,.15,.4,.7);}
 else if(type==='gate'){for(const x of[-.85,.85])part(g,BX,stone,x,.9,0,.36,1.8,.5);const door=new THREE.Group();door.position.set(-.67,0,0);g.add(door);part(door,BX,wood,.67,.8,0,1.3,1.4,.12);part(door,BX,iron,.67,.4,.08,1.3,.1,.04);part(door,BX,iron,.67,1.2,.08,1.3,.1,.04);g.userData.door=door;}
 else if(type==='iron_wall'){part(g,BX,iron,0,1,0,2,2,.45);for(let i=0;i<5;i++)for(const y of[.3,1.7])part(g,SP||BX,iron,-.8+i*.4,y,.24,.05,.05,.05);}
 else if(type==='watchtower'){for(const [x,z] of[[-.8,-.8],[.8,-.8],[-.8,.8],[.8,.8]])part(g,BX,wood,x,1.7,z,.16,3.4,.16);part(g,BX,wood,0,3.35,0,2,.15,2);for(const [x,z,w,d] of[[0,-.95,2,.08],[0,.95,2,.08],[-.95,0,.08,2],[.95,0,.08,2]])part(g,BX,wood,x,3.75,z,w,.6,d);part(g,CN||BX,new THREE.MeshStandardMaterial({color:0x8a3a22}),0,4.6,0,1.6,.8,1.6);for(let y=.3;y<3.3;y+=.4)part(g,BX,wood,0,y,1.02,.6,.06,.06);}
 else if(type==='turret'){part(g,CY,stone,0,.35,0,.55,.7,.55);const h=new THREE.Group();h.position.y=.85;g.add(h);part(h,BX,wood,0,0,0,.18,.18,1.3);part(h,BX,wood,0,.05,.45,1.5,.08,.1);part(h,BX,iron,0,.1,.3,.06,.06,1.1);g.userData.head=h;}
 else if(type==='flame_trap'){part(g,CY,iron,0,.12,0,.6,.24,.6);const c=new THREE.Mesh(new THREE.CylinderGeometry(.5,.5,.06,12),new THREE.MeshStandardMaterial({color:0x331100,emissive:new THREE.Color(0xff4400),emissiveIntensity:.6}));c.position.y=.26;g.add(c);g.userData.coal=c;}
 else if(type==='tar_pit'){const m=new THREE.Mesh(new THREE.CircleGeometry(1.7,24),new THREE.MeshStandardMaterial({color:0x0a0806,roughness:.08,metalness:.2}));m.rotation.x=-Math.PI/2;m.position.y=.04;g.add(m);}
 else if(type==='trench'){part(g,BX,new THREE.MeshStandardMaterial({color:0x5a4228}),0,.03,0,2.6,.06,1.6);const w=new THREE.Mesh(new THREE.PlaneGeometry(2.3,1.3),new THREE.MeshStandardMaterial({color:0x2a6a9a,roughness:.05,metalness:.2,transparent:true,opacity:.85}));w.rotation.x=-Math.PI/2;w.position.y=.08;g.add(w);}
 else if(type==='bear_trap'){part(g,CY,iron,0,.04,0,.55,.05,.55);for(const s of[-1,1]){const j=new THREE.Mesh(new THREE.TorusGeometry(.45,.04,4,12,Math.PI),iron);j.position.y=.08;j.rotation.set(s*.6,0,0);g.add(j);}}
 else if(type==='alarm_bell'){part(g,BX,wood,-.6,1.2,0,.14,2.4,.14);part(g,BX,wood,.6,1.2,0,.14,2.4,.14);part(g,BX,wood,0,2.35,0,1.4,.14,.14);const b=new THREE.Group();b.position.y=2.3;g.add(b);const bl=new THREE.Mesh(new THREE.CylinderGeometry(.18,.38,.5,14),new THREE.MeshStandardMaterial({color:0xd0a030,metalness:.9,roughness:.25}));bl.position.y=-.3;b.add(bl);g.userData.bell=b;}
 else if(type==='thorn_wall'){part(g,BX,stone,0,.75,0,2,1.5,.4);for(let i=0;i<7;i++){const c=new THREE.Mesh(new THREE.ConeGeometry(.09,.8,6),wood);c.position.set(-.9+i*.3,1.2,0);c.rotation.x=i%2?.8:-.8;g.add(c);}for(let i=0;i<5;i++)part(g,BX,wood,-.8+i*.4,.35,.22,.06,.5,.06);}
 else if(type==='guardian_totem'){part(g,CY,stone,0,.8,0,.34,1.6,.34);part(g,BX,stone,0,1.75,0,.7,.35,.5);const cr=new THREE.Mesh(new THREE.OctahedronGeometry(.3),new THREE.MeshStandardMaterial({color:0x66d9ff,emissive:new THREE.Color(0x2288ff),emissiveIntensity:1.6}));cr.position.y=2.25;g.add(cr);}
 else if(type==='scarecrow'){part(g,BX,wood,0,.9,0,.1,1.8,.1);part(g,BX,wood,0,1.35,0,1.4,.08,.08);part(g,BX,new THREE.MeshStandardMaterial({color:0x7a3a6a}),0,1.2,0,.6,.6,.3);const hd=new THREE.Mesh(new THREE.SphereGeometry(.24,10,8),new THREE.MeshStandardMaterial({color:0xd8b070}));hd.position.y=1.85;g.add(hd);const hat=new THREE.Mesh(new THREE.ConeGeometry(.35,.4,8),new THREE.MeshStandardMaterial({color:0x5a3a1a}));hat.position.y=2.15;g.add(hat);}
 else return false;return true;}

// ---------- release 7: move placed structures ----------
let moving=null,moveGhost=null,moveRing=null,eDownAt=0,ePending=null;
const moveRedMat=new THREE.MeshBasicMaterial({color:0xff2020,transparent:true,opacity:.5,depthWrite:false});
const moveRingMat=new THREE.MeshBasicMaterial({color:0xff2020,transparent:true,opacity:.95,depthWrite:false,side:THREE.DoubleSide});
const MOVABLE=s=>!s.perm&&!s.main&&s.type!=='house';
function movableNear(){let b=null,bd=3.2;for(const s of structs)if(MOVABLE(s)){const d=Math.hypot(s.x-P.x,s.z-P.z);if(d<bd){bd=d;b=s;}}return b;}
const BREAK_EXTRA={thorn_wall:{iron:4,planks:2,fiber:3},guardian_totem:{stone:6,crystal:1,gold:1}};
const canBreak=s=>!!s&&!s.perm&&s.type!=='house'&&s.type!=='well'&&(PLACE.includes(s.type)||!!s.main);
function breakableNear(){let b=null,bd=3.2;for(const s of structs)if(canBreak(s)){const d=Math.hypot(s.x-P.x,s.z-P.z);if(d<bd){bd=d;b=s;}}return b;}
function breakCost(s){const cost={};const r=RECIPES.find(r=>r.out===s.type);if(r){const nd=recipeNeeds(r);for(const k in nd)cost[k]=nd[k]/(r.n||1);}else Object.assign(cost,BREAK_EXTRA[s.type]||{});
 if(s.type==='bench')for(let t=1;t<(s.tier||1);t++)for(const k in (BENCH_UP[t]||{}))cost[k]=(cost[k]||0)+BENCH_UP[t][k];
 if(s.type==='campfire')for(let l=2;l<=(s.lvl||1);l++)for(const k in (FLV[l].cost||{}))cost[k]=(cost[k]||0)+FLV[l].cost[k];return cost;}
function breakFrac(s){return DEF[s.type]&&s.hp!==undefined&&s.hp<DEF[s.type].hp-.01?.5:1;}
function breakRefund(s){const f=breakFrac(s),out={};for(const k in breakCost(s)){const n=Math.floor(breakCost(s)[k]*f);if(n>0)out[k]=n;}if(s.type==='turret'&&(s.ammo||0)>0)out.arrows=(out.arrows||0)+s.ammo;return out;}
const breakNeedsConfirm=s=>!!s.main||(s.type==='bench'&&(s.tier||1)>1)||(s.type==='campfire'&&(s.lvl||1)>1);
let breakConfirm=null;
function askBreak(s){breakConfirm={s,until:performance.now()+7000};const rf=breakRefund(s);toast('🔨 Break <b>'+nm(s.type)+'</b>?<br>Refund: '+(Object.entries(rf).map(([k,n])=>n+' '+nm(k).replace(/^\S+ /,'')).join(', ')||'nothing')+'<br><b>[B] yes · [Esc] no</b>',4);tone(220,.15,'square',.12);}
function doBreak(s){if(!s||!structs.includes(s))return false;const rf=breakRefund(s),name=nm(s.type);if(P.tower===s)climbDown();
 const i=structs.indexOf(s);structs.splice(i,1);scene.remove(s.mesh);if(s.ring){scene.remove(s.ring);s.ring=null;}MP.send({t:'unstruct',ty:s.type,x:s.x,z:s.z});
 for(const k in rf)add(k,rf[k]);for(let n=0;n<16;n++){const m=new THREE.Mesh(new THREE.BoxGeometry(.13,.13,.13),new THREE.MeshBasicMaterial({color:[0x9a6a3a,0x8a8a86,0xd8c8a0,0x6a4a2a][n%4]}));m.position.set(s.x,H(s.x,s.z)+.8,s.z);scene.add(m);const a=rnd(0,6.28);BFX.push({m,t:rnd(.5,.9),vx:Math.sin(a)*rnd(1,3.4),vy:rnd(2.4,5),vz:Math.cos(a)*rnd(1,3.4)});}
 tone(130,.22,'sawtooth',.2,45);setTimeout(()=>tone(90,.25,'square',.14,40),60);sfx.chop();floatTxt(s.x,s.z,'🔨 +'+(Object.values(rf).reduce((a,b)=>a+b,0))+' mats','#ffd27a');
 toast('🔨 Broke '+name+'<br>Refunded: '+(Object.entries(rf).map(([k,n])=>n+' '+nm(k).replace(/^\S+ /,'')).join(', ')||'nothing'),2.5);save();return true;}
function tryBreak(){if(moving)return false;const s=breakableNear();if(!s){breakConfirm=null;return false;}
 if(breakNeedsConfirm(s)&&(!breakConfirm||breakConfirm.s!==s||performance.now()>breakConfirm.until)){askBreak(s);return true;}
 breakConfirm=null;return doBreak(s);}
function startMove(s){if(!s||moving)return false;if(P.tower===s)climbDown();moving={s,ox:s.x,oz:s.z,orot:s.rot||0};
 const i=structs.indexOf(s);if(i>=0)structs.splice(i,1);scene.remove(s.mesh);if(s.ring){scene.remove(s.ring);s.ring=null;s.ringR=-1;}
 moveGhost=structMesh(s.type,s.lvl);moveGhost.traverse(o=>{if(o.isMesh){o.material=moveRedMat;o.castShadow=false;}if(o.isLight)o.visible=false;});
 moveRing=new THREE.Mesh(new THREE.RingGeometry(.92,1.08,40),moveRingMat);moveRing.rotation.x=-Math.PI/2;scene.add(moveGhost,moveRing);
 toast('📦 Moving '+nm(s.type)+'<br>Click / E / PLACE to put it down · R rotate · Esc to put it back',3);updMoveGhost();return true;}
function movePos(){return placePos(moving.s.type);}
function moveValid(){return moving&&placeOk(moving.s.type,movePos());}
function updMoveGhost(){const show=moving&&true;for(const id of ['bPlace','bCancel']){const el=$(id);if(el)el.style.display=show?'flex':'none';}
 const bp=$('bPick');if(bp)bp.style.display=!moving&&movableNear()?'flex':'none';const bb=$('bBreak');if(bb)bb.style.display=!moving&&breakableNear()?'flex':'none';
 if(!moving||!moveGhost)return;const p=movePos(),ok=moveValid();moveGhost.position.set(p.x,H(p.x,p.z)+.03,p.z);moveGhost.rotation.y=p.rot;
 moveRing.position.set(p.x,H(p.x,p.z)+.14,p.z);const rr=(SEG[moving.s.type]?1.25:(SR[moving.s.type]??.6)+.45);moveRing.scale.setScalar(rr);moveRingMat.color.setHex(ok?0x2bff5a:0xff2020);moveRingMat.opacity=.75+.25*Math.sin(performance.now()/180);}
function restoreMove(x,z,rot){const s=moving.s;const ns=placeStruct(s.type,x,z,{rot,tier:s.tier,fuel:s.fuel,lvl:s.lvl,hp:s.hp,open:s.open,ammo:s.ammo});if(s.type==='bench'&&ns.tier!==s.tier){ns.tier=s.tier;benchLook(ns);}cleanupMove();save();return ns;}
function cleanupMove(){if(moveGhost)scene.remove(moveGhost);if(moveRing)scene.remove(moveRing);moveGhost=moveRing=null;moving=null;for(const id of ['bPlace','bCancel']){const el=$(id);if(el)el.style.display='none';}}
function placeMove(){if(!moving)return false;if(!moveValid()){toast('🔴 No room there — find a clear spot (green ring)');tone(160,.15,'square',.1);return false;}const p=movePos(),nmv=moving.s.type;const ns=restoreMove(p.x,p.z,p.rot);MP.send({t:'struct',s:{type:nmv,x:p.x,z:p.z,rot:p.rot,tier:ns.tier,lvl:ns.lvl}});toast('📦 Placed '+nm(nmv));sfx.craft();return true;}
function cancelMove(){if(!moving)return false;const o=moving;restoreMove(o.ox,o.oz,o.orot);toast('↩️ Put back where it was');return true;}
function pickupTarget(){if(moving)return{l:'PLACE',f:placeMove};const s=movableNear();if(s)return{l:'HOLD: PICK UP',f:()=>startMove(s)};return null;}

// ---------- release 4: night lights, raids, jumping, treasure ----------
let wasNight=false,raidDay=0,duskF=0,wasDusk=false;
function clockHr(){return (phase()*24+6)%24;}
function updDusk(){const h=clockHr();duskF=h>=18?Math.min(1,.12+.88*(h-18)/.5):(h<6.9?1:0);if(duskF>0&&!wasDusk){wasDusk=true;if(running&&(has('torch')||has('lantern'))){P.torchOn=true;toolHeld='?';toast('🔥 18:00 – lights on. Your '+(has('lantern')?'lantern':'torch')+' glows and the campfire circle turns day-bright.',2.5);}}else if(duskF<=0)wasDusk=false;return duskF;}
const lightsOn=()=>duskF>0||night();
function updPosts(){const ni=lightsOn();for(const s of structs){if(!s.light)continue;if(s.on===ni)continue;s.on=ni;const g=s.mesh.userData;s.light.intensity=ni?(s.type==='lamp_post'?45:22):0;if(g.flame)g.flame.material.color.setHex(ni?0xffa020:0x553311);if(g.lamp)g.lamp.material.emissiveIntensity=ni?3:.1;}}
function onDusk(){if(has('torch')||has('lantern')){P.torchOn=true;toolHeld='?';toast('🔥 Night falls – your '+(has('lantern')?'lantern':'torch')+' lights up',2);}
 if(day%5===0&&raidDay!==day)startRaid();}
function onDawn(){raidQ=[];let n=0;for(const a of animals)if(a.raid&&a.alive){a.alive=false;a.dead=.01;a.gone=true;n++;}if(n)toast('🌅 The Forest Soldiers retreat at dawn',2.5);}
function drums(){let t=0;for(let r=0;r<3;r++)for(const [d,f] of [[0,70],[.25,70],[.5,95],[.9,60]]){setTimeout(()=>tone(f,.22,'sine',.35,f*.5),(r*1.2+d)*1000);}}
let raidQ=[];
const raidNumFor=d=>Math.max(1,Math.round(d/5));const nextRaidDay=()=>{let n=day%5===0&&raidDay!==day?day:day+(5-day%5)%5||day+5;if(day%5===0&&raidDay===day)n=day+5;if(n<=day)n+=5;return n;};
function raidHudTxt(){const rl=animals.filter(a=>a.raid&&a.alive).length;if(rl)return '🗡️ '+rl+' Forest Soldiers!'+(raidQ.length?' (+'+raidQ.length+' coming)':'');if(raidQ.length)return '🥁 '+raidQ.length+' Forest Soldiers coming';if(day%5===0&&raidDay!==day)return '⚠️ Raid tonight';const n=nextRaidDay()-day;return '🌙 Raid in '+n+' night'+(n===1?'':'s');}
function startRaid(){raidDay=day;const rn=raidNumFor(day);const n=Math.min(15,rn);raidQ=[];
 for(let i=0;i<n;i++){const kind=rn>=3&&i%3===2?'cultist_shaman':rn>=2&&i%2===1?'cultist_torch':'cultist';raidQ.push({t:28+Math.floor(i/2)*20+Math.random()*4,kind,wave:Math.floor(i/2)+1,raid:rn});}
 toast('⚠️ <b>The Forest Soldiers are coming!</b><br>Raid '+rn+' · first wave in ~30s · '+n+' Forest Soldier'+(n>1?'s':'')+' in '+Math.ceil(n/2)+' wave'+(n>2?'s':'')+'. They are after YOU — defend yourself!',5);tone(220,.09,'sine',.09);setTimeout(()=>tone(220,.09,'sine',.09),180);save();return n;}
function spawnCult(kind){const fire=structs.find(s=>s.main)||structs.find(s=>s.type==='campfire')||{x:P.x,z:P.z};const R0=(fire.fuel!==undefined?fireR(fire):10)+16;let x,z,tries=0;do{const a=Math.random()*6.28,r=rnd(R0,R0+8);x=clamp(fire.x+Math.cos(a)*r,-W+5,W-5);z=clamp(fire.z+Math.sin(a)*r,-W+5,W-5);tries++;}while((inPond(x,z,1)||inLava(x,z)||blocked(x,z,.6))&&tries<30);
 const c=spawnAnimal(kind,x,z);c.raid=1;c.hp=c.hp*(1+(day-2)*.05);c.agro=true;return c;}
function tickRaid(dt){if(typeof TUT!=='undefined'&&TUT.active)return;if(!raidQ.length)return;let w=0;for(const q of raidQ){q.t-=dt;if(q.t<=0&&!q.done){q.done=1;spawnCult(q.kind);w=q.wave;}}if(w){toast('⚔️ Forest Soldier wave '+w+' has arrived!',2);tone(110,.5,'sawtooth',.15,60);}raidQ=raidQ.filter(q=>!q.done);}
function cultTick(a,dt,dp){const f=a.fig;let tx=P.x,tz=P.z,spd=a.K.spd,tgt='player',tS=null;
 if(P.dead)tgt='none';
 {let bd=14;for(const s of structs)if(s.type==='scarecrow'){const d=Math.hypot(s.x-a.x,s.z-a.z);if(d<bd){bd=d;tS=s;}}if(tS&&dp>3){tgt='decoy';tx=tS.x;tz=tS.z;}}
 if(tgt==='player'&&P.tower&&!a.K.ranged){tgt='decoy';tS=P.tower;tx=tS.x;tz=tS.z;}
 const dir=Math.atan2(tx-a.x,tz-a.z);
 if(tgt==='decoy'&&Math.hypot(tx-a.x,tz-a.z)<2.2){spd=0;if(a.cd<=0){a.cd=1.4;aAnim(a,'attack');dmgStruct(tS,a.K.dmg*1.4,a);}}
 if(tgt==='player'){if(a.K.ranged&&dp<15&&dp>4){spd=a.K.spd*.35;if(a.cd<=0){a.cd=3.2;aAnim(a,'attack');shoot('enemy',a.x,a.z,dir,10,a.K.dmg,0xb040ff,.32,2.4);}}
  else if(dp<1.9){spd=0;if(a.cd<=0){a.cd=1.5;aAnim(a,'attack');setTimeout(()=>{if(a.alive&&Math.hypot(P.x-a.x,P.z-a.z)<2.7&&!P.tower)hurtPlayer(a.K.dmg,null);},300);}}}
 if(tgt==='none')spd=0;
 {const lf=litFire(a.x,a.z);if(lf&&(lf.lvl||1)>=4)spd*=.5;if(lf&&(lf.lvl||1)>=5){a.hp-=8*dt;if(a.hp<=0){killAnimal(a,true);return;}}}
 spd*=slowAt(a);
 let md=dir,moved=spd===0;for(const o of [0,.8,-.8,1.6,-1.6]){const d2=dir+o,nx=a.x+Math.sin(d2)*spd*dt,nz=a.z+Math.cos(d2)*spd*dt;if(!blocked(nx,nz,.5)&&!inPond(nx,nz,.3)){a.x=nx;a.z=nz;md=d2;moved=true;break;}}
 if(!moved){a.stuck=(a.stuck||0)+dt;if(a.stuck>.5&&a.cd<=0){let bs=null,bd=2.6;for(const s of structs)if(DEF[s.type]){const d=SEG[s.type]?segDist(s,a.x,a.z):Math.hypot(s.x-a.x,s.z-a.z);if(d<bd){bd=d;bs=s;}}if(bs){a.cd=1.4;aAnim(a,'attack');dmgStruct(bs,a.K.dmg*1.4,a);}}}else a.stuck=0;
 a.dir=md;f.position.set(a.x,H(a.x,a.z),a.z);f.rotation.y=dir;aAnim(a,spd>a.K.spd*.5?'run':spd>0?'walk':'idle');}
function jump(){if(P.tower)return;if(P.dead||paused||P.jy>0.01||P.vy>0)return;P.vy=9.8;P.jy=.001;tone(330,.12,'triangle',.08,620);}
function jumpPose(dt){const f=P.fig;f.scale.lerp(V.set(1,1,1),Math.min(1,dt*10));const r=f.userData.rig;if(r&&r.armL){const hs=has('shield')||has('guard_shield');if(hs&&!P.shieldM){P.shieldM=new THREE.Mesh(new THREE.CylinderGeometry(.32,.32,.06,14),new THREE.MeshStandardMaterial({color:0x8a5a30,metalness:.3}));P.shieldM.rotation.z=Math.PI/2;P.shieldM.position.set(-.12,-.35,.12);r.armL.add(P.shieldM);}if(!hs&&P.shieldM){r.armL.remove(P.shieldM);P.shieldM=null;}if(P.blocking){r.armL.rotation.x=-1.5;r.armL.rotation.z=.6;}}if(P.jy>0&&r&&r.legL){const k=Math.min(1,P.jy/.6);r.legL.rotation.x=-.9*k;r.legR.rotation.x=-.5*k;r.armL.rotation.x=-2.2*k;r.armR.rotation.x=-2.2*k;}}
const TCH=[];const sparkMat=new THREE.PointsMaterial({color:0xffe680,size:.22,transparent:true,opacity:.9,depthWrite:false,blending:THREE.AdditiveBlending});
const TLV={forest:1,snow:2,jungle:2,desert:3,lava:4};
function chestMesh(){const g=new THREE.Group();const wd=new THREE.MeshStandardMaterial({color:0x7a4a22,roughness:.8}),gd=new THREE.MeshStandardMaterial({color:0xe0b030,metalness:.8,roughness:.3});
 part(g,RB,wd,0,.3,0,1,.6,.65);for(const x of [-.35,.35])part(g,BX,gd,x,.3,0,.09,.62,.67);const lid=new THREE.Group();lid.position.set(0,.6,-.32);g.add(lid);part(lid,RB,wd,0,.12,.32,1.02,.26,.67);for(const x of [-.35,.35])part(lid,BX,gd,x,.12,.32,.09,.28,.69);part(lid,BX,gd,0,.02,.66,.14,.18,.04);g.userData.lid=lid;
 const n=14,pos=new Float32Array(n*3);for(let i=0;i<n;i++){pos[i*3]=rnd(-.7,.7);pos[i*3+1]=rnd(.4,1.6);pos[i*3+2]=rnd(-.5,.5);}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));const sp=new THREE.Points(geo,sparkMat);g.add(sp);g.userData.spark=sp;
 g.traverse(o=>{if(o.isMesh)o.castShadow=true;});return g;}
function buildTreasure(){const rr=mulberry(90210);const rn=(a,b)=>a+rr()*(b-a);let id=0;
 const put=(x,z,lv,boss)=>{const m=chestMesh();m.position.set(x,H(x,z),z);m.rotation.y=rn(0,6.28);scene.add(m);TCH.push({id:id++,x,z,lv,boss,mesh:m,open:false,seen:0});};
 for(const B of BOSSES)for(let i=0;i<2;i++){let x,z,t=0;do{const a=rn(0,6.28),r=rn(24,30);x=B.x+Math.cos(a)*r;z=B.z+Math.sin(a)*r;t++;}while((inPond(x,z,1)||inLava(x,z)||Math.abs(x)>W-8||Math.abs(z)>W-8)&&t<50);put(x,z,TLV[B.biome]+1,1);}
 for(const [b,n] of [['forest',5],['snow',6],['jungle',6],['desert',6],['lava',7]]){let k=0,t=0;while(k<n&&t<6000){t++;const x=rn(-W+12,W-12),z=rn(-W+12,W-12);if(biomeAt(x,z)!==b||Math.hypot(x,z)<25||nearSpecial(x,z,4)||inPond(x,z,1.5)||inLava(x,z)||LAVA.some(p=>Math.hypot(x-p.x,z-p.z)<p.r+2)||TCH.some(c=>Math.hypot(c.x-x,c.z-z)<30))continue;put(x,z,TLV[b],0);k++;}}}
function openLook(c){c.open=true;const u=c.mesh.userData;u.lid.rotation.x=-1.9;if(u.spark){c.mesh.remove(u.spark);u.spark=null;}}
function openTreasure(c){if(c.open)return;openLook(c);c.seen=1;const lv=c.lv,L={};const r=Math.random,ri=(a,b)=>a+Math.floor(r()*(b-a+1));
 L.coins=ri(8,20)*lv;if(lv<=2)L.iron=ri(1,2)+lv;if(lv>=2)L.gold=ri(lv-1,lv);if(r()<.25*lv)L.gem=ri(1,lv>3?2:1);if(lv>=4)L.obsidian=ri(1,3);
 L[r()<.5?'bandage':'cooked_meat']=ri(1,3);if(lv>=3&&r()<.5)L.crystal=ri(1,2);
 if(r()<(c.boss?.3:.08))L.heart_piece=1;
 if(r()<(c.boss?.5:.15)){const G=[,['iron_sword','iron_pickaxe','hide_armor'],['iron_armor','bow','iron_axe'],['gold_sword','gold_pickaxe','gold_armor'],['obsidian_sword','obsidian_pickaxe','gold_armor'],['obsidian_armor','obsidian_sword','obsidian_axe']][Math.min(5,lv)];L[G[ri(0,2)]]=1;}
 const got=[];for(const k in L){add(k,L[k]);got.push(k==='coins'?'+'+L[k]+' 🪙':k==='heart_piece'?'❤️ Heart piece!':'+'+L[k]+' '+nm(k));}
 sfx.win();toast('🎁 Treasure! '+got.join('  '),3.5);save();return L;}
function tickTreasure(dt){const t=performance.now()/1000;for(const c of TCH){const sp=c.mesh.userData.spark;if(sp&&Math.abs(c.x-P.x)<60&&Math.abs(c.z-P.z)<60){sp.rotation.y=t*.8;sp.material.opacity=.6+.4*Math.sin(t*4+c.id);sp.position.y=Math.sin(t*2+c.id)*.1;}}}

// ---------- character customization ----------
let CHAR={name:'Camper',skin:0xe8b890,hairStyle:'short',hairColor:0x5a3a1a,shirt:0x2e6a8a,pants:0x4a3a2a,hat:'none',face:'smile'};
try{Object.assign(CHAR,JSON.parse(localStorage.getItem('cq_charprofile')||'{}'));}catch(e){}
const SKINS=[0xffe3c2,0xf0c8a0,0xe8b890,0xc68642,0x9c6642,0x6f4423],HAIRC=[0x1a120a,0x5a3a1a,0xa06a2c,0xd8b060,0xb03030,0x3050c8,0x2e8b57,0xe8e8e8,0xff7ac0],OUTC=[0x2e6a8a,0x2e8b57,0xc0392b,0xe67e22,0x8e44ad,0x2471a3,0x616a6b,0xf1c40f,0xec87bf,0x145a32],PANTSC=[0x4a3a2a,0x2c3e50,0x616a6b,0x7a3a1e,0x1e4a3a,0x3a2a4a];
const HAIRSTYLES=['short','long','spiky','bun','mohawk','curly','bald'],FACES=['smile','happy','brave','sleepy','cool'];
const HATS=[{id:'none',n:'No hat'},{id:'cap',n:'🧢 Cap'},{id:'leaf',n:'🍃 Leaf hat'},{id:'explorer',n:'🧭 Explorer hat'},{id:'straw',n:'👒 Straw hat',un:()=>Object.values(quests||{}).some(q=>!q.active&&q.i>0),why:'Complete a villager quest'},{id:'fur',n:'❄️ Snow fur hood',un:()=>bossDone.yeti,why:'Defeat the Yeti King'},{id:'leaves',n:'🌿 Vine crown',un:()=>bossDone.vine,why:'Defeat the Vine Queen'},{id:'nemes',n:'☀️ Sun nemes',un:()=>bossDone.pharaoh,why:'Defeat the Sand Pharaoh'},{id:'horns',n:'🌋 Magma horns',un:()=>bossDone.titan,why:'Defeat the Magma Titan'},{id:'crown',n:'👑 Realms crown',un:()=>has('crown')||BOSSES.every(b=>bossDone[b.id]),why:'Defeat all four bosses'}];
const ARMORVIS=[['vine_armor',0x2e7a2e],['obsidian_armor',0x2a1e3a],['gold_armor',0xd8a820],['iron_armor',0xaab4be],['hide_armor',0x8a6a42]];
const armorKey=()=>{for(const [k] of ARMORVIS)if(has(k))return k;return '';};
function charLook(){const ak=armorKey(),ac=ak?(ARMORVIS.find(x=>x[0]===ak)||[])[1]:0;const h=CHAR.hat;
 return {skin:CHAR.skin,shirt:ac||CHAR.shirt,pants:CHAR.pants,hair:CHAR.hairStyle==='bald'?null:CHAR.hairColor,hairStyle:CHAR.hairStyle,face:CHAR.face,armor:ac||undefined,hat:h==='none'?undefined:h,hatCol:0xd84040,horns:h==='horns'?0x2a1410:undefined,crown:h==='crown'?1:undefined};}
let pv=null;
function applyChar(saveIt=true){CHAR.name=($('charName')?$('charName').value.trim():'')||CHAR.name||'Camper';localStorage.setItem('cq_charprofile',JSON.stringify(CHAR));const hn=$('charNameHud');if(hn)hn.textContent='👤 '+CHAR.name;
 if(P.fig){const x=P.x,z=P.z,d=P.dir;scene.remove(P.fig);if(P.tool)P.tool=null;toolHeld='?';P.fig=makeHuman(charLook());P.fig.position.set(x,H(x,z)+(P.jy||0),z);P.fig.rotation.y=d;scene.add(P.fig);P._ak=armorKey();equipVisual();}
 if(saveIt)save();}
function pvBuild(){if(!pv)return;if(pv.fig)pv.scene.remove(pv.fig);pv.fig=makeHuman(charLook());pv.scene.add(pv.fig);pv.fig.rotation.y=pv.a;}
function swRow(id,arr,val,cb){const e=$(id);e.innerHTML='';for(const c of arr){const b=document.createElement('button');b.className='sw'+(c===val?' on':'');b.style.background='#'+c.toString(16).padStart(6,'0');b.onclick=()=>{cb(c);};e.appendChild(b);}}
function optRow(id,arr,val,cb,locked){const e=$(id);e.innerHTML='';for(const o of arr){const idv=typeof o==='string'?o:o.id,nm=typeof o==='string'?o:o.n;const lk=locked&&locked(o);const b=document.createElement('button');b.className='opt'+(idv===val?' on':'');b.textContent=nm+(lk?' 🔒':'');b.disabled=!!lk;if(lk)b.title=o.why||'Locked';b.onclick=()=>cb(idv);e.appendChild(b);}}
function renderChar(){$('charName').value=CHAR.name;swRow('cSkin',SKINS,CHAR.skin,c=>{CHAR.skin=c;renderChar();pvBuild();});swRow('cHairC',HAIRC,CHAR.hairColor,c=>{CHAR.hairColor=c;renderChar();pvBuild();});swRow('cShirt',OUTC,CHAR.shirt,c=>{CHAR.shirt=c;renderChar();pvBuild();});swRow('cPants',PANTSC,CHAR.pants,c=>{CHAR.pants=c;renderChar();pvBuild();});
 optRow('cHairS',HAIRSTYLES,CHAR.hairStyle,v=>{CHAR.hairStyle=v;renderChar();pvBuild();});optRow('cFace',FACES,CHAR.face,v=>{CHAR.face=v;renderChar();pvBuild();});
 optRow('cHat',HATS,CHAR.hat,v=>{CHAR.hat=v;renderChar();pvBuild();},o=>o.un&&!o.un());pvBuild();}
function openChar(){$('charP').classList.remove('hidden');paused=true;renderChar();
 if(!pv){const cv=$('charCv');const r=new THREE.WebGLRenderer({canvas:cv,antialias:true,alpha:true});r.setSize(240,280,false);r.outputColorSpace=THREE.SRGBColorSpace;r.toneMapping=THREE.ACESFilmicToneMapping;const sc=new THREE.Scene();sc.add(new THREE.HemisphereLight(0xffffff,0x3a5a3a,1.6));const dl=new THREE.DirectionalLight(0xffffff,2);dl.position.set(3,5,4);sc.add(dl);const fl=new THREE.Mesh(new THREE.CircleGeometry(1.1,24),new THREE.MeshStandardMaterial({color:0x3a6a3a}));fl.rotation.x=-Math.PI/2;sc.add(fl);const cm=new THREE.PerspectiveCamera(38,240/280,.1,50);cm.position.set(0,1.35,3.4);cm.lookAt(0,.95,0);pv={r,scene:sc,cam:cm,a:0,timer:null};pvBuild();}
 if(pv.timer)clearInterval(pv.timer);pv.timer=setInterval(()=>{if($('charP').classList.contains('hidden')){clearInterval(pv.timer);pv.timer=null;return;}pv.a+=.04;if(pv.fig){pv.fig.rotation.y=pv.a;rigTick(pv.fig,.05);}pv.r.render(pv.scene,pv.cam);},50);}
function closeChar(){applyChar(true);$('charP').classList.add('hidden');if(pv&&pv.timer){clearInterval(pv.timer);pv.timer=null;}if(!$('title').classList.contains('hidden')){paused=true;}else if(!$('pause').classList.contains('hidden')){paused=true;}else paused=false;toast('👤 Saved look for '+CHAR.name);}
function randomChar(){const pk=a=>a[Math.floor(Math.random()*a.length)];CHAR.skin=pk(SKINS);CHAR.hairColor=pk(HAIRC);CHAR.shirt=pk(OUTC);CHAR.pants=pk(PANTSC);CHAR.hairStyle=pk(HAIRSTYLES);CHAR.face=pk(FACES);const un=HATS.filter(h=>!h.un||h.un());CHAR.hat=pk(un).id;if(Math.random()<.5)CHAR.name=pk(['Alex','Sam','Rowan','Juniper','Kai','Wren','Ash','Nova','Ember','Sol']);renderChar();pvBuild();}

// ---------- wandering traders ----------
const TRADERS=[];let ftDay=0,dtDay=0,ftJingle=0;
Object.assign(ITEMS,{ammo_bundle:'🏹 Arrow bundle',guard_shield:'🛡️ Guardian shield',thorn_wall:'🌵 Thorn wall',guardian_totem:'🗿 Guardian totem'});
Object.assign(ITEMS,{crossbow:'🏹 Crossbow',trident:'🔱 Trident',machete:'🔪 Machete',snow_wolf_armor:'🐺 Snow Wolf Armor',ember_armor:'🌋 Ember Armor',leaf_armor:'🍃 Leaf Armor',berry_pie:'🥧 Berry Pie',meat_skewer:'🍢 Meat Skewer',raw_fish:'🐟 Raw Fish',grilled_fish:'🍣 Grilled Fish',heal_tonic:'🧪 Healing Tonic',speed_tonic:'⚡ Speed Tonic',warmth_tonic:'♨️ Warmth Tonic',fire_tonic:'🔥 Fireproof Tonic',rug:'🟥 Rug',table:'🪑 Table',flower_pot:'🌸 Flower Pot',sign_post:'🪧 Signpost',path_stones:'🪨 Path Stones',boss_compass:'🧭 Boss Compass',fishing_rod:'🎣 Fishing Rod',repair_kit:'🧰 Repair Kit',sled:'🛷 Sled',heartwood_charm:'💚 Heartwood Charm',ice_ring:'💍 Ice Ring',thorn_armor:'🌵 Thorn Armor',sandstorm_boots:'🥾 Sandstorm Boots',lava_sword:'🔥 Lava Sword',healing_fruit:'🍎 Healing Fruit',frost_root:'❄️ Root of Frost',vine_seed:'🌱 Seed of Vines',sand_heart:'🏜️ Heart of Sand',ember_core:'🔥 Ember Core'});
SHOP.forest={berries:1,cooked_meat:5,waterskin:12,torch:2};SHOP.defense={spike_barricade:18,wall:12,gate:22,thorn_wall:45,iron_wall:38,flame_trap:55,alarm_bell:30,watchtower:70,turret:95,ammo_bundle:15,shield:40,guard_shield:85};
const FSELL={raw_meat:3,cooked_meat:5,hide:6,wood:2,stone:2,berries:2,fiber:1,feather:3,cactus_fruit:3};
function traderFig(kind){let f,cart=null;
 if(kind==='forest'){f=makeHuman({skin:0xc68642,shirt:0x3a6a2e,pants:0x5a4228,hair:0x2a1a0c,hat:'straw',face:'happy',scarf:0x7a9a3a});const pack=new THREE.Group();const pm=new THREE.MeshStandardMaterial({color:0x8a6a42});part(pack,BX,pm,0,0,0,.5,.55,.25);pack.position.set(0,1.25,-.28);f.add(pack);const L=new THREE.PointLight(0xffc060,18,13,1.4);L.position.set(.5,1.6,.3);f.add(L);}
 else{f=makeHuman({skin:0xe8b890,shirt:0x6a3a1e,pants:0x333a44,hair:0x888888,hat:'cap',hatCol:0x3a5a8a,face:'brave',scarf:0x3a5a8a});cart=new THREE.Group();const wm=new THREE.MeshStandardMaterial({color:0x7a5230});part(cart,BX,wm,0,.65,0,1.7,.55,1);for(const [x,z] of [[-.7,-.45],[.7,-.45],[-.7,.45],[.7,.45]]){const w=new THREE.Mesh(new THREE.CylinderGeometry(.3,.3,.08,12),new THREE.MeshStandardMaterial({color:0x3a2a1a}));w.rotation.z=Math.PI/2;w.position.set(x,.3,z);cart.add(w);}part(cart,BX,new THREE.MeshStandardMaterial({color:0x5a5e66,metalness:.6}),0,1,.1,.8,.25,.6);scene.add(cart);}
 scene.add(f);return{f,cart};}
function pickCampSpot(kind,x,z){const fires=structs.filter(s2=>s2.type==='campfire');let fx,fz;
 if(fires.length){const f=fires.find(s2=>s2.main)||fires.slice().sort((a,b)=>((b.lvl||1)-(a.lvl||1))||(Math.hypot(a.x-x,a.z-z)-Math.hypot(b.x-x,b.z-z)))[0];fx=f.x;fz=f.z;}
 else{let bv=VILLAGES[0],bd=1e9;for(const v of VILLAGES){const d=Math.hypot(v.x-x,v.z-z);if(d<bd){bd=d;bv=v;}}fx=bv.x;fz=bv.z;}
 const base=kind==='forest'?-2.1:.9;for(let i=0;i<10;i++){const a=base+i*.65,r=kind==='forest'?4.6:5.4,px=fx+Math.sin(a)*r,pz=fz+Math.cos(a)*r;
  if(!inPond(px,pz,1)&&!inLava(px,pz)&&!blocked(px,pz,.5))return{x:px,z:pz,fx,fz};}
 return{x:fx+5,z:fz,fx,fz};}
function spawnTrader(kind){if(TRADERS.some(t=>t.kind===kind))return TRADERS.find(t=>t.kind===kind);
 if(boss&&boss.alive)return null;if(BOSSES.some(B=>Math.hypot(P.x-B.x,P.z-B.z)<26))return null;
 let x=P.x,z=P.z,ok=false;for(let i=0;i<40&&!ok;i++){const a=rnd(0,6.28),r=rnd(26,36);x=clamp(P.x+Math.cos(a)*r,-W+6,W-6);z=clamp(P.z+Math.sin(a)*r,-W+6,W-6);ok=!inPond(x,z,1)&&!inLava(x,z)&&!blocked(x,z,.6)&&(kind!=='forest'||biomeAt(x,z)==='forest');}
 const {f,cart}=traderFig(kind);f.position.set(x,H(x,z),z);let pack=null;if(kind==='forest'){pack=animalFig(AN.deer);pack.position.set(x+1.5,H(x,z),z+1);scene.add(pack);}
 const t=kind==='forest'?{kind,name:'Fern',v:{id:'forest',name:'the night forest'},look:{skin:0xc68642,shirt:0x3a6a2e,pants:0x5a4228,hair:0x2a1a0c,hat:'straw'},pers:'jokey',lines:['I once sold a pebble to a troll. Twice. He said the first one was lonely.','No fish in these woods, friend — but berries travel just as well!','My deer there? That’s Biscuit. He carries everything except opinions.']}
 :{kind,name:'Bram',v:{id:'defense',name:'the road'},look:{skin:0xe8b890,shirt:0x6a3a1e,pants:0x333a44,hair:0x888888,hat:'cap'},pers:'gruff',lines:['Walls don’t argue. That’s why I sell walls.','A turret is just a very loyal, very hungry fence. Feed it arrows.','Soldiers fear a gate that’s actually shut. Revolutionary, I know.']};
 const tr={...t,x,z,fig:f,cart,pack,dir:rnd(0,6.28),tx:x,tz:z,wait:1,alive:true,atCamp:false,visitDay:day,wakeT:0,zzzT:0};
 {const cs=pickCampSpot(kind,x,z);tr.campX=cs.x;tr.campZ=cs.z;tr.fireX=cs.fx;tr.fireZ=cs.fz;tr.tx=cs.x;tr.tz=cs.z;
  if(kind==='forest'){const prop=new THREE.Group();const roll=new THREE.Mesh(new THREE.CylinderGeometry(.22,.22,1.5,10),new THREE.MeshStandardMaterial({color:0xa03028}));roll.rotation.z=Math.PI/2;roll.position.y=.22;prop.add(roll);const pil=new THREE.Mesh(new THREE.BoxGeometry(.4,.16,.3),new THREE.MeshStandardMaterial({color:0xe8e0cc}));pil.position.set(-.55,.32,0);prop.add(pil);prop.visible=false;scene.add(prop);tr.prop=prop;}}
 TRADERS.push(tr);
 toast(kind==='forest'?'🧺 Fern has arrived — she’s heading to your campfire and stays all day (till tomorrow’s dawn)! Follow the 🧺 edge arrow or the map (M).':'🛡️ Bram the Defense Trader has arrived — he’s rolling to your campfire! Follow the 🛡️ edge arrow or the map (M).',4);return tr;}
function despawnTrader(tr,msg){if(!msg)msg=tr.kind==='forest'?'🧺 Fern has left — her lantern fades into the trees.':'🛡️ Bram has left — his cart rumbles away.';tr.alive=false;scene.remove(tr.fig);if(tr.cart)scene.remove(tr.cart);if(tr.pack)scene.remove(tr.pack);if(tr.prop)scene.remove(tr.prop);const i=TRADERS.indexOf(tr);if(i>=0)TRADERS.splice(i,1);if(msg)toast(msg,3);}
function updTraders(dt){ftJingle-=dt;const h=clockHr();
 if(day%2===0&&ftDay!==day){const tr=spawnTrader('forest');if(tr){ftDay=day;tr.visitDay=day;}}
 if(!night()&&h>=8&&h<17.5&&day%3===0&&dtDay!==day){const tr=spawnTrader('defense');if(tr)dtDay=day;}
 for(const tr of [...TRADERS]){const dp=Math.hypot(tr.x-P.x,tr.z-P.z);
  if(dp>95&&tr.kind!=='forest'){despawnTrader(tr);continue;}
  if(tr.kind==='forest'&&(day>(tr.visitDay??day))){despawnTrader(tr,'🌅 Fern waves, whistles for Biscuit, and melts into the dawn trees. “Same time in two days — I stay all day next visit too!”');continue;}
  if(tr.wakeT>0)tr.wakeT-=dt;
  tr.sleeping=tr.kind==='forest'&&tr.atCamp&&!(tr.wakeT>0)&&(h>=23||h<5);
  if(tr.sleeping){tr.tx=tr.campX;tr.tz=tr.campZ;tr.zzzT=(tr.zzzT||0)-dt;if(tr.zzzT<=0){tr.zzzT=3.5;floatTxt(tr.x,tr.z,'💤 Zzz','#a8c8ff');}}
  if(tr.kind==='defense'&&(night()||h>=17.5)){despawnTrader(tr,'🌇 Bram tips his cap. “Barricade o’clock is over — see you in a few days.”');continue;}
  if(tr.kind==='forest'&&dp<17&&ftJingle<=0){ftJingle=7;tone(1560,.25,'sine',.05);setTimeout(()=>tone(1180,.3,'sine',.04),140);}
  tr.wait-=dt;let mv=0;
  if(!tr.atCamp){tr.tx=tr.campX;tr.tz=tr.campZ;if(Math.hypot(tr.campX-tr.x,tr.campZ-tr.z)<.8){tr.atCamp=true;tr.wait=1;
    if(tr.prop){tr.prop.position.set(tr.campX+Math.cos(Math.atan2(tr.fireX-tr.campX,tr.fireZ-tr.campZ))*.9,H(tr.campX,tr.campZ),tr.campZ-Math.sin(Math.atan2(tr.fireX-tr.campX,tr.fireZ-tr.campZ))*.9);tr.prop.rotation.y=Math.atan2(tr.fireX-tr.campX,tr.fireZ-tr.campZ);tr.prop.visible=true;}
    toast(tr.kind==='forest'?'🧺 Fern has set up by your campfire — lantern lit, bedroll out. She stays all day: trade any time (even wake her at night)!':'🛡️ Bram has parked his cart by your campfire — defence goods on sale till dusk!',3.5);}}
  else if(tr.sleeping){/* asleep by the bedroll: stays put, Zzz above */}
  else if(tr.wait<=0){tr.wait=rnd(3,6.5);const pose=Math.random();
   if(pose<.45){rigOnce(tr.fig,tr.kind==='forest'?'cast':'hit',tr.kind==='forest'?1.5:.9);tr.tx=tr.x;tr.tz=tr.z;}
   else{const a=rnd(0,6.28),r=rnd(.6,1.9);tr.tx=tr.campX+Math.cos(a)*r;tr.tz=tr.campZ+Math.sin(a)*r;}}
  {const d=Math.hypot(tr.tx-tr.x,tr.tz-tr.z);if(d>.25){const dir0=Math.atan2(tr.tx-tr.x,tr.tz-tr.z);let done=false;
    for(const o of [0,.7,-.7,1.4,-1.4]){const d2=dir0+o,nx=tr.x+Math.sin(d2)*1.55*dt,nz=tr.z+Math.cos(d2)*1.55*dt;if(!blocked(nx,nz,.45)&&!inPond(nx,nz,.3)){tr.x=nx;tr.z=nz;tr.dir=d2;mv=1;done=true;break;}}
    if(!done)tr.dir=dir0;}
   else if(tr.atCamp)tr.dir=Math.atan2(tr.fireX-tr.x,tr.fireZ-tr.z);}
  tr.fig.position.set(tr.x,H(tr.x,tr.z),tr.z);tr.fig.rotation.y=tr.dir;rigTick(tr.fig,dt);rigSet(tr.fig,mv?'walk':'idle');
  if(tr.pack){const px=tr.atCamp?tr.campX+1.3:tr.x-Math.sin(tr.dir)*1.6+.6,pz=tr.atCamp?tr.campZ+.7:tr.z-Math.cos(tr.dir)*1.6;tr.pack.position.set(px,H(px,pz),pz);tr.pack.rotation.y=tr.dir;rigTick(tr.pack,dt);}
  if(tr.cart){if(tr.atCamp){const ra=Math.atan2(tr.campX-tr.fireX,tr.campZ-tr.fireZ);tr.cart.position.set(tr.campX+Math.sin(ra)*1.9,H(tr.campX,tr.campZ),tr.campZ+Math.cos(ra)*1.9);tr.cart.rotation.y=ra+Math.PI/2;}else{tr.cart.position.set(tr.x-Math.sin(tr.dir)*2.1,H(tr.x,tr.z),tr.z-Math.cos(tr.dir)*2.1);tr.cart.rotation.y=tr.dir;}}}}
function talkTrader(tr){const n=tr;const woke=!!tr.sleeping;if(woke){tr.wakeT=120;tr.sleeping=false;toast('💤 Fern blinks awake. “Mmf — a customer? Always! What’ve you got?”',2);}
 say(n,tr.kind==='forest'?(woke?'Mmf… morning, noon or midnight, Fern trades. I buy what the forest gives: meat, hides, wood, stone, berries… at honest prices.':'Fern’s the name — camped by your fire all day! I buy what the forest gives: meat, hides, wood, stone, berries… at honest prices.'):'Bram. I sell things that keep soldiers on the wrong side of your fence.',[
 {l:'🛒 Let’s trade',f:()=>{endTalk();openShop(n);}},
 {l:'💬 Tell me something',f:()=>{say(n,pick(tr.lines),[{l:'🛒 Let’s trade',f:()=>{endTalk();openShop(n);}},{l:'👋 Goodbye',f:endTalk}]);}},
 {l:'👋 Goodbye',f:endTalk}]);}

function updTraderArrow(){const el=$('tArrow');if(!el)return;let best=null,bd=1e9;for(const tr of TRADERS){const d=Math.hypot(tr.x-P.x,tr.z-P.z);if(d<bd){bd=d;best=tr;}}
 if(!best||!running||anyPanel()){el.classList.add('hidden');return;}
 const vv=V.set(best.x,H(best.x,best.z)+2,best.z).applyMatrix4(camera.matrixWorldInverse);const front=vv.z<0;const onScr=front&&Math.abs(vv.x)<18&&Math.abs(vv.y)<10;
 if(onScr&&bd<25){el.classList.add('hidden');return;}
 let dx=front?vv.x:-vv.x,dy=front?-vv.y:vv.y;const l=Math.hypot(dx,dy)||1;dx/=l;dy/=l;const ang=Math.atan2(dy,dx);
 const px=clamp(innerWidth/2+dx*(innerWidth/2-65),55,innerWidth-55),py=clamp(innerHeight/2+dy*(innerHeight/2-75),60,innerHeight-90);
 el.style.left=px+'px';el.style.top=py+'px';$('tArrowDir').style.transform=`rotate(${ang}rad)`;$('tArrowIco').textContent=best.kind==='forest'?'🧺':'🛡️';$('tArrowTxt').textContent=(best.kind==='forest'?'Fern ':'Bram ')+Math.round(bd)+'m';el.classList.remove('hidden');}

// ---------- How to Play + First Steps ----------
let howFrom='game',stepsOff=false,stepsShown=false;
function openHow(){$('howP').classList.remove('hidden');}
function showHow(){howFrom=!$('title').classList.contains('hidden')?'title':!$('pause').classList.contains('hidden')?'pause':'game';paused=true;$('howP').classList.remove('hidden');const b=$('howBody');if(b)b.scrollTop=0;}
function closeHow(){$('howP').classList.add('hidden');paused=howFrom!=='game';if(howFrom==='game'&&running)paused=false;}
function stepList(){return [['Gather logs & stone (punch trees, grab pebbles)',cnt('wood')>=2||cnt('stone')>=2||has('planks')],
 ['Craft an axe & pickaxe (bag grid / recipe book)',['wood','stone','iron','gold','obsidian'].some(t=>has(t+'_axe'))&&['wood','stone','iron','gold','obsidian'].some(t=>has(t+'_pickaxe'))],
 ['Feed the campfire with logs (E at the fire)',(structs.find(s=>s.main)||{}).fuel>65],
 ['Craft & place a bench, then upgrade it',structs.some(s=>s.type==='bench')],
 ['Visit a village — trade & take a quest',NPCS.some(n=>Math.hypot(n.x-P.x,n.z-P.z)<25)||Object.keys(quests).length>0],
 ['Sleep, eat & drink to survive the night',false],
 ['🧒 Rescue a lost kid from a cave (ask villagers for rumors)',KIDS.some(k=>kidState[k.id].stage==='rescued')],
 ['🌳 Heal the Tree of Healing (install Tree Parts from bosses)',treeInstalled.length>=4]];}
function updSteps(){const el=$('firstSteps');if(!el)return;if(!stepsShown||stepsOff){el.classList.add('hidden');return;}el.classList.remove('hidden');const L=stepList();$('stepsBody').innerHTML=L.map(([t,d])=>`<div>${d?'✅':'⬜'} ${t}</div>`).join('');if(L.slice(0,5).every(x=>x[1])){stepsOff=true;el.classList.add('hidden');toast('🎉 First steps done — good luck, survivor!');}}

// ---------- start ----------
function startGame(cont){audio();MUS.init();$('title').classList.add('hidden');$('hud').classList.remove('hidden');
 if(!P.fig){P.fig=makeHuman(charLook());P._ak=armorKey();scene.add(P.fig);const hn=$('charNameHud');if(hn)hn.textContent='👤 '+CHAR.name;}
 if(!cont&&!running){}running=true;paused=false;clock.getDelta();camera.position.set(P.x,20,P.z+14);
 if(!cont){stepsShown=!stepsOff;if(!TUT.done())setTimeout(()=>{if(!TUT.active)startTutorial();},1200);}if(!cont)toast('🏕️ Welcome! Punch trees (10 hits), grab pebbles & bushes, then craft an axe and a pickaxe.<br>Oakhollow village is to the south-east.',6);
 if(isTouch&&!matchMedia('(display-mode: standalone)').matches&&!navigator.standalone)setTimeout(()=>toast('Tip: Share → Add to Home Screen for full-screen play',4),7000);}
function newGame(){if(localStorage.getItem(SAVE_KEY)&&!confirm('Start a new game? Your saved camp will be erased.'))return;localStorage.removeItem(SAVE_KEY);location.hash='new';location.reload();}
$('bNew').onclick=()=>{if(running||P.fig||localStorage.getItem(SAVE_KEY))return newGame();startGame(false);};
$('bCont').onclick=()=>startGame(true);
if(isTouch)$('rot').classList.add('need');
if(/iPhone|iPad/.test(navigator.userAgent)&&!navigator.standalone)$('iosHint').textContent='iPhone: tap Share → Add to Home Screen to play full screen & offline.';
Promise.resolve().then(()=>{buildVillages();buildBossLairs();buildTreasure();spawnNPCs();buildCaves();buildTree();const ok=load();if(!ok&&!structs.some(s=>s.main))placeStruct('campfire',0,-1.5,{main:1,fuel:60});$('loadMsg').textContent=ok?'Saved camp found · Day '+day:'Ready!';$('bCont').disabled=!ok;$('bNew').disabled=false;
 applyKidStates();updTreeLook();if(location.hash==='#new'){history.replaceState(null,'',location.pathname);startGame(false);}window.__ready=true;}).catch(e=>{$('loadMsg').textContent='Load error: '+e.message;});
loop();
if('serviceWorker' in navigator&&location.protocol==='https:')navigator.serviceWorker.register('sw.js');
// test hooks

// ---------- Release 16b: hover identification (world + inventory tooltips) ----------
const hoverRing=new THREE.Mesh(new THREE.RingGeometry(.82,1,28),new THREE.MeshBasicMaterial({color:0xffd94d,transparent:true,opacity:.85,side:THREE.DoubleSide,depthWrite:false}));
hoverRing.rotation.x=-Math.PI/2;hoverRing.visible=false;hoverRing.renderOrder=5;scene.add(hoverRing);
const TREEN={forest:'Oak Tree',snow:'Snow Pine',jungle:'Jungle Tree',desert:'Dry Tree',lava:'Charred Tree'};
const ANAME=a=>a.kind==='cultist'?'Forest Scout':a.kind==='cultist_torch'?'Forest Torchbearer':a.kind==='cultist_shaman'?'Forest Mage':a.kind.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
function anyAxe(){return ['wood','stone','iron','gold','obsidian'].some(t=>has(t+'_axe'));}
function anyPick(){return ['wood','stone','iron','gold','obsidian'].some(t=>has(t+'_pickaxe'));}
function hoverCands(){const out=[];
 for(const o of near(P.x,P.z,3)){if(!o.alive)continue;const d=Math.hypot(o.x-P.x,o.z-P.z);if(d>34)continue;const bi=o.b;
  if(o.type==='tree')out.push({x:o.x,z:o.z,y:2.2,r:1,n:TREEN[bi]||'Tree',a:'Click to chop · '+(anyAxe()?'5':'10')+' hits'+(anyAxe()?' with axe':' with fists')});
  else if(o.type==='pebble')out.push({x:o.x,z:o.z,y:.5,r:.5,n:'Pebble',a:'Click to pick up stone'});
  else if(o.type==='bush')out.push({x:o.x,z:o.z,y:.8,r:.7,n:'Berry Bush',a:'Click to gather berries & fibre'});
  else if(o.type==='cactus')out.push({x:o.x,z:o.z,y:1,r:.7,n:'Cactus',a:'Click to gather cactus fruit'});
  else{const nm2={rock:'Rock',iron:'Iron Ore',gold:'Gold Ore',crystal:'Crystal',obsidian:'Obsidian'}[o.type];if(nm2){const need=['any','stone','iron','gold'][RTYPES[o.type].pick||1]||'stone';out.push({x:o.x,z:o.z,y:1,r:1.2,n:nm2,a:anyPick()?'Click to mine':'Needs a '+need+' pickaxe'});}}}
 for(const a of animals)if(a.alive&&Math.hypot(a.x-P.x,a.z-P.z)<30){const beh=a.K.beh==='passive'?'Passive':a.K.beh==='cultist'?'Hostile · Forest Soldier':'Hostile';out.push({x:a.x,z:a.z,y:1.4,r:(a.K.bulk||1),n:ANAME(a),a:beh+' · Click to attack'});}
 for(const n of NPCS)if(!n.inside&&Math.hypot(n.x-P.x,n.z-P.z)<30)out.push({x:n.x,z:n.z,y:1.8,r:.6,n:n.name+' of '+n.v.name,a:'Villager — E Talk'});
 for(const tr of TRADERS)out.push({x:tr.x,z:tr.z,y:1.8,r:.6,n:tr.name+(tr.kind==='forest'?' the Forest Trader':' the Defense Trader'),a:'E Talk & trade'});
 for(const e of KIDENTS)if(e.fig.visible)out.push({x:e.x,z:e.z,y:1.2,r:.5,n:e.def.name+' (lost kid)',a:'E Talk — rescue me!'});
 for(const st of structs){if(st.type==='cave_rock')continue;const d=Math.hypot(st.x-P.x,st.z-P.z);if(d>24)continue;
  if(st.type==='campfire')out.push({x:st.x,z:st.z,y:1.2,r:1.2,n:'Campfire Lv'+(st.lvl||1),a:'E Open menu · fuel '+Math.round(((st.fuel||0)/(FLV[st.lvl||1].maxF))*100)+'%'});
  else if(st.type==='healing_tree')out.push({x:st.x,z:st.z,y:6,r:2.6,n:'Tree of Healing ('+treeInstalled.length+'/4)',a:'E Install Tree Parts / claim orb'});
  else if(st.type==='chest')out.push({x:st.x,z:st.z,y:.8,r:.7,n:'Chest',a:'E Open storage'});
  else if(st.type==='bench')out.push({x:st.x,z:st.z,y:1,r:.9,n:'Crafting Bench T'+(st.tier||1),a:'E Craft · better recipes'});
  else if(st.type==='gate')out.push({x:st.x,z:st.z,y:1.4,r:1,n:nm(st.type).replace(/^\S+ /,''),a:st.open?'E Close gate':'E Open gate'});
  else if(st.type==='turret')out.push({x:st.x,z:st.z,y:1.2,r:.8,n:'Ballista Turret',a:'E Load arrows ('+(st.ammo||0)+') / repair'});
  else out.push({x:st.x,z:st.z,y:1,r:SR[st.type]||.6,n:nm(st.type).replace(/^\S+ /,''),a:st.perm?'':'Hold E to move · B to break'});}
 for(const c of TCH)if(!c.open&&Math.hypot(c.x-P.x,c.z-P.z)<30)out.push({x:c.x,z:c.z,y:1,r:.8,n:'Treasure Chest',a:'E Open'});
 return out;}
let hoverCur=null;
function hoverPick(mx,my){let best=null,bd=64;
 for(const c of hoverCands()){V.set(c.x,H(c.x,c.z)+c.y,c.z).project(camera);if(V.z>1||V.z<-1)continue;const sx=(V.x+1)/2*innerWidth,sy=(1-V.y)/2*innerHeight;const d=Math.hypot(sx-mx,sy-my);if(d<bd){bd=d;best=c;}}
 if(!best){ray.setFromCamera({x:mx/innerWidth*2-1,y:-(my/innerHeight)*2+1},camera);plane.constant=-(H(P.x,P.z)+.2);if(ray.ray.intersectPlane(plane,hitV)&&inPond(hitV.x,hitV.z,.5))best={x:hitV.x,z:hitV.z,y:.3,r:.8,n:'Water',a:'E Drink · fill a waterskin'};}
 return best;}
function hoverTick(){const tip=$('hoverTip');
 if(invTipOn&&anyPanel())return;
 if(!running||paused||anyPanel()||moving){tip.classList.add('hidden');hoverRing.visible=false;if(isTouch)updMobTip();return;}
 if(isTouch){tip.classList.add('hidden');updMobTip();return;}
 if(!mouse.in){tip.classList.add('hidden');hoverRing.visible=false;return;}
 const c=hoverPick(mouse.x,mouse.y);hoverCur=c;
 if(!c){tip.classList.add('hidden');hoverRing.visible=false;return;}
 tip.innerHTML='<b>'+c.n+'</b>'+(c.a?'<br><span style="color:#ffe9a8">'+c.a+'</span>':'');tip.classList.remove('hidden');
 tip.style.left=Math.min(innerWidth-285,mouse.x+16)+'px';tip.style.top=Math.max(6,mouse.y-14)+'px';
 hoverRing.position.set(c.x,H(c.x,c.z)+.18,c.z);const rr=Math.max(.55,c.r||.7);hoverRing.scale.set(rr,rr,rr);hoverRing.visible=true;
 hoverRing.material.opacity=.6+.35*Math.sin(performance.now()/180);}
function updMobTip(){const el=$('mobTip');if(!running){el.classList.add('hidden');return;}
 let best=null,bd=4.2;for(const c of hoverCands()){const d=Math.hypot(c.x-P.x,c.z-P.z);if(d<bd){bd=d;best=c;}}
 if(!best){el.classList.add('hidden');hoverRing.visible=false;return;}
 V.set(best.x,H(best.x,best.z)+best.y+.7,best.z).project(camera);if(V.z>1){el.classList.add('hidden');return;}
 el.textContent=best.n+(best.a?' — '+best.a:'');el.style.left=((V.x+1)/2*innerWidth)+'px';el.style.top=((1-V.y)/2*innerHeight)+'px';el.classList.remove('hidden');
 hoverRing.position.set(best.x,H(best.x,best.z)+.18,best.z);const rr=Math.max(.55,best.r||.7);hoverRing.scale.set(rr,rr,rr);hoverRing.visible=true;}
setInterval(hoverTick,120);
// ----- inventory / recipe tooltips -----
const ARMORP={hide_armor:20,leaf_armor:25,iron_armor:40,snow_wolf_armor:45,gold_armor:50,ember_armor:50,obsidian_armor:60,vine_armor:65,thorn_armor:35};
const ITEMDESC={heartwood_charm:'Slowly regenerates your health. Pip’s thank-you gift.',ice_ring:'Cold drains 55% slower in the snow. Nia’s gift.',thorn_armor:'Jungle-woven thorns. Kito’s gift.',sandstorm_boots:'+15% movement speed. Zara’s gift.',lava_sword:'Sets enemies (and bosses) on fire. Ash’s gift.',boss_compass:'All four boss lairs show on your map (M).',fishing_rod:'Use from the hotbar beside a pond to catch Raw Fish.',repair_kit:'Use: fully repairs every damaged defence within 14 m.',sled:'Passive: glide 25% faster across snow.',crossbow:'Ranged: slow, heavy bolts. Needs arrows.',bow:'Ranged weapon. Needs arrows.',bandage:'Use: +30 health.',waterskin:'Carries 5 sips of water. Refill at ponds/wells.',torch:'Lights your way at dusk when carried.',lantern:'Bright, forever light at dusk.',healing_fruit:'From the healed Tree of Healing.',frost_root:'A Tree Part — bring it to the Tree of Healing (forest centre).',vine_seed:'A Tree Part — bring it to the Tree of Healing (forest centre).',sand_heart:'A Tree Part — bring it to the Tree of Healing (forest centre).',ember_core:'A Tree Part — bring it to the Tree of Healing (forest centre).',shield:'Hold Q / right-click to block 65% of damage.',guard_shield:'Hold Q / right-click to block 82% of damage.',cold_gear:'Survive the snowy mountains.',heat_gear:'Survive the desert & volcanic heat.',sun_amulet:'Fast health regeneration.',crown:'+50% damage. Champion of the Four Realms!'};
function itemInfo(k,n){if(!k)return null;const lines=[];
 if(WEAP[k])lines.push('⚔️ Damage '+WEAP[k].d+' · reach '+WEAP[k].r+(k.endsWith('_axe')?' · chops trees in 5 hits':k.endsWith('_pickaxe')?' · mines rock & ore':''));
 if(k==='bow')lines.push('🏹 Damage 14 · uses arrows');
 if(k==='crossbow')lines.push('🏹 Damage 24 · uses arrows · slower, harder hits');
 if(ARMORP[k])lines.push('🛡️ Blocks '+ARMORP[k]+'% of damage');
 if(k==='snow_wolf_armor')lines.push('❄️ Also counts as cold gear');
 if(k==='ember_armor')lines.push('🌋 Also counts as heat gear');
 if(FOOD[k]){const [h,hp]=FOOD[k];lines.push('🍖 +'+h+' hunger'+(hp?' · '+(hp>0?'+':'')+hp+' health':''));}
 if(k==='heal_tonic')lines.push('🧪 Drink: +55 health');
 if(k==='speed_tonic')lines.push('⚡ Drink: +30% speed for 45 s');
 if(k==='warmth_tonic')lines.push('♨️ Drink: full warmth, cold barely bites (60 s)');
 if(k==='fire_tonic')lines.push('🔥 Drink: lava & heat barely hurt (60 s)');
 if(PLACE.includes(k))lines.push('🏠 Building — select in hotbar, use again to place · hold E to move · B breaks for a refund');
 if(ITEMDESC[k])lines.push(ITEMDESC[k]);
 const sv=(typeof SELL!=='undefined'&&SELL[k])||(typeof FSELL!=='undefined'&&FSELL[k]);if(sv)lines.push('🪙 Sells for about '+sv+' coins');
 if(!lines.length)lines.push('Material — used in crafting recipes (C).');
 return{title:nm(k)+(n&&n>1?' ×'+n:''),body:lines.join('<br>'),hint:isTouch?'Tap to pick up / move · tap a selected hotbar item again to use':'Drag or click to move · right-click / press number again to use'};}
function slotInfoFromEl(el){if(!el)return null;
 const rec=el.closest&&el.closest('[data-rec]');if(rec){const r=RECIPES[+rec.dataset.rec];if(!r)return null;const need=recipeNeeds(r);
  return{title:nm(r.out)+(r.n>1?' ×'+r.n:''),body:(r.d||'')+'<br>🧾 Needs: '+Object.entries(need).map(([k,n])=>n+' '+nm(k).replace(/^\S+ /,'')).join(', ')+'<br>'+(r.tier?'🛠️ Bench tier '+r.tier:'🎒 Bag 2×2'),hint:'Auto-fill loads the grid · double-click = craft all'};}
 const buy=el.closest&&el.closest('[data-buy]');if(buy)return itemInfo(buy.dataset.buy,1);
 const sell=el.closest&&el.closest('[data-sell],[data-sellall]');if(sell)return itemInfo((sell.dataset.sell||sell.dataset.sellall),cnt(sell.dataset.sell||sell.dataset.sellall));
 const hs=el.closest&&el.closest('.hs');if(hs){const s2=slots[+hs.dataset.h];return s2?itemInfo(s2.k,s2.n):null;}
 const sl=el.closest&&el.closest('.sl');if(!sl)return null;
 if(sl.dataset.take)return itemInfo(sl.dataset.take,chest[sl.dataset.take]);
 if(sl.dataset.store!==undefined&&sl.dataset.store!==''){const s2=slots[+sl.dataset.store];return s2?itemInfo(s2.k,s2.n):null;}
 if(sl.dataset.s==='out'){const r=matchGrid(cg,gsz(),curTier());return r?itemInfo(r.out,r.n||1):null;}
 if(sl.dataset.s){const ref=slotRef(sl.dataset.s);if(ref){const s2=ref[0][ref[1]];return s2?itemInfo(s2.k,s2.n):null;}}
 return null;}
let tipEl2=null,tipTimer=null,invTipOn=false;
function showInvTip(info,x,y){const tip=$('hoverTip');if(!info){invTipOn=false;tip.classList.add('hidden');return;}invTipOn=true;
 tip.innerHTML='<b>'+info.title+'</b><br>'+info.body+'<br><span style="color:#bcd38a;font-size:12px">'+info.hint+'</span>';tip.classList.remove('hidden');
 tip.style.left=Math.min(innerWidth-285,(x||mouse.x)+16)+'px';tip.style.top=Math.max(6,Math.min(innerHeight-150,(y||mouse.y)-10))+'px';}
document.addEventListener('pointerover',e=>{if(isTouch)return;const info=slotInfoFromEl(e.target);if(info)showInvTip(info,e.clientX,e.clientY);});
document.addEventListener('pointermove',e=>{if(isTouch||!tipEl2)return;});
document.addEventListener('pointerout',e=>{if(isTouch)return;if(slotInfoFromEl(e.target)&&!slotInfoFromEl(e.relatedTarget)){invTipOn=false;$('hoverTip').classList.add('hidden');}});
document.addEventListener('pointerdown',e=>{const info=slotInfoFromEl(e.target);tipEl2=info;
 if(isTouch&&info){clearTimeout(tipTimer);tipTimer=setTimeout(()=>showInvTip(info,e.clientX,e.clientY),450);}});
document.addEventListener('pointerup',e=>{clearTimeout(tipTimer);if(isTouch)setTimeout(()=>{if(!tipEl2){invTipOn=false;$('hoverTip').classList.add('hidden');}},2400);tipEl2=null;});

window.__game={makeHuman,makeBeast,procAnimal,hoverPick,itemInfo,slotInfoFromEl,hoverCands,TUT,startTutorial,tutSteps,tutAdvance,MP,rateBase,showRating,mpCreate,mpJoin,showMpWin,get MODE(){return MODE;},set MODE(v){MODE=v;updModeCards();},updModeCards,PONDS,LAVA,weatherKind:()=>wxKind,GQ,updWeatherFx,KIDS,KIDENTS,kidState:()=>kidState,treeInstalled:()=>treeInstalled,TREE,talkKid,rescueKid,hintKid,installPart,claimableParts,treeTarget,PART_FOR_BOSS,buildCaves,breakableNear,tryBreak,doBreak,breakCost,breakRefund,breakNeedsConfirm,canBreak,get breakConfirm(){return breakConfirm;},PROJ,shoot,blockedNatural,losClear,structTopAt,SH,pickCampSpot,updTraderArrow,TRADERS,spawnTrader,despawnTrader,talkTrader,FSELL,updTraders,get ftDay(){return ftDay;},get dtDay(){return dtDay;},showHow,closeHow,updSteps,stepList,clockHr,get duskF(){return duskF;},updDusk,lightsOn,get stepsShown(){return stepsShown;},SAFEU,addSafeShader,CHAR:()=>CHAR,charLook,applyChar,openChar,closeChar,randomChar,HATS,armorKey,craftAll,maxCrafts,startMove,placeMove,cancelMove,movableNear,moveValid,raidNumFor,nextRaidDay,raidHudTxt,get moving(){return moving;},get moveGhost(){return moveGhost;},get moveRing(){return moveRing;},safeBlue,DEF,SEG,segDist,dmgStruct,slowAt,climb,climbDown,toggleGate,loadTurret,repairStruct,updDefenses,get raidQ(){return raidQ;},spawnCult,tickRaid,placePos,placeOk,rotGhost,get ghostType(){return ghostType;},get ghost(){return ghost;},get bellRang(){return bellRang;},setBlock:v=>{mBlock=v;},hurtPlayer,blocked,setCam:v=>{camDist=v;},MUS,pickTheme,FLV,upFire,openFire,renderFire,litFire,fireLight,fireFill,get curFire(){return curFire;},TCH,openTreasure,startRaid,jump,cultTick,get raidDay(){return raidDay;},get day(){return day;},set day(v){day=v;},get dayT(){return dayT;},set dayT(v){dayT=v;},pBlocked,P,get inv(){return inv;},set inv(v){inv=v;},RES,animals:()=>animals,get boss(){return boss;},BOSSES,VILLAGES,NPCS,structs,biomeAt,doAttack,gather,talk,useTarget,spawnAnimal,hitAnimal,hitBoss,quests:()=>quests,revealed:()=>revealed,bossDone:()=>bossDone,kills:()=>kills,add,save,teleport:(x,z)=>{P.x=x;P.z=z;},setPaused:v=>paused=v,night,setDay:t=>dayT=t,closeDlg:endTalk,endTalk,startGame,get slots(){return slots;},cg,matchGrid,craftOut,fillRecipe,RECIPES,openBag,closeBag,renderBag,useSlot,get selHot(){return selHot;},set selHot(v){selHot=v;},fuelFire,fireR,litAt,openShop,get coins(){return coins;},set coins(v){coins=v;},cnt,curTier,placeStruct,questList,addItem};
Object.assign(window.__game,{project:(x,z)=>{V.set(x,H(x,z)+1,z).project(camera);return{x:(V.x+1)/2*innerWidth,y:(1-V.y)/2*innerHeight};},camDist:()=>camDist,camYaw:()=>camYaw});
