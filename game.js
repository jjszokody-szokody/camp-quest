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
    vec4 tc=cg*vBW.x+cs*vBW.y+cd*vBW.z+cr*vBW.w;diffuseColor*=vec4(tc.rgb*1.15,1.);`);};}
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
const BX=new THREE.BoxGeometry(1,1,1),RB=GQ==='low'?BX:new RoundedBoxGeometry(1,1,1,3,.22),SP=new THREE.SphereGeometry(1,GQ==='low'?12:20,GQ==='low'?9:14),CN=new THREE.ConeGeometry(1,1,8),CY=new THREE.CylinderGeometry(1,1,1,8);
// biped: o={skin,shirt,pants,hair,scale,bulk,hat,horns,crown,fur,emis,skirt,staff,cape}
function makeHuman(o={}){const root=new THREE.Group(),body=joint(root,0,0,0);const sc=o.scale||1,bk=o.bulk||1;body.scale.setScalar(sc);
 const em=o.emis?{e:o.emis,ei:.7}:{};const skin=mat(o.skin??0xf0c8a0,em),shirt=mat(o.shirt??0x3a6a9a,em),pants=mat(o.pants??0x4a3a2a,em),hair=mat(o.hair??0x3a2412),boot=mat(o.boot??0x2a1a10);
 const legL=joint(body,-.13*bk,.92,0),legR=joint(body,.13*bk,.92,0);
 for(const l of [legL,legR]){part(l,RB,pants,0,-.42,0,.17*bk,.84,.19*bk);part(l,RB,boot,0,-.86,.04,.19*bk,.12,.28);}
 const torso=joint(body,0,.92,0);part(torso,RB,shirt,0,.36,0,.5*bk,.66,.3*bk);part(torso,RB,shirt,0,.02,0,.44*bk,.16,.27*bk);
 if(o.skirt)part(torso,CN,mat(o.skirt,em),0,-.25,0,.45*bk,.8,.45*bk);
 if(o.armor){const am=mat(o.armor,{m:o.armor>0xaaaaaa?.6:.25,r:.4});part(torso,RB,am,0,.38,-.01,.56*bk,.6,.36*bk);part(torso,RB,am,-.34*bk,.6,0,.18,.16,.34);part(torso,RB,am,.34*bk,.6,0,.18,.16,.34);part(torso,RB,mat(0xe0b030,{m:.7}),0,.38,.19,.16,.2,.02);}
 if(o.cape)part(torso,RB,mat(o.cape),0,.2,-.18*bk,.48*bk,.9,.04);
 const head=joint(torso,0,.9,0);part(head,SP,skin,0,.0,0,.22*bk,.24*bk,.22*bk);
 const eye=mat(o.eye??0x111111,o.eye?{e:o.eye,ei:1.5}:{});part(head,SP,eye,-.08,.03,.2*bk,.03,.035,.02);part(head,SP,eye,.08,.03,.2*bk,.03,.035,.02);
 const hs=o.hairStyle||'short';if(o.hair!==null&&hs!=='bald'){part(head,SP,hair,0,.08,-.03,.235*bk,.2*bk,.235*bk);
  if(hs==='long'){part(head,RB,hair,0,-.12,-.14,.34*bk,.5,.12);part(head,RB,hair,-.2,-.05,0,.08,.35,.3);part(head,RB,hair,.2,-.05,0,.08,.35,.3);}
  else if(hs==='spiky'){for(let i=0;i<5;i++){const c=part(head,CN,hair,(i-2)*.09,.3,-.02,.07,.22,.07);c.rotation.z=(2-i)*.18;}}
  else if(hs==='bun'){part(head,SP,hair,0,.3,-.14,.13,.13,.13);}
  else if(hs==='mohawk'){part(head,RB,hair,0,.3,-.02,.08,.24,.3*bk);}
  else if(hs==='curly'){for(let i=0;i<7;i++){const a=i/7*6.28;part(head,SP,hair,Math.cos(a)*.15,.2,Math.sin(a)*.15,.09,.09,.09);}part(head,SP,hair,0,.28,0,.1,.1,.1);}}
 {const fm=mat(0x3a1c10);const fc=o.face||'';if(fc==='cool'){part(head,RB,mat(0x101014,{m:.4}),0,.04,.21,.4,.09,.03);part(head,RB,mat(0x101014),0,.04,.16,.46,.02,.12);}
  else if(fc){const ey2=head.children;if(fc==='sleepy'){part(head,RB,fm,-.08,.03,.21,.07,.012,.01);part(head,RB,fm,.08,.03,.21,.07,.012,.01);part(head,SP,fm,0,-.1,.21,.035,.03,.02);}
  else{part(head,RB,fm,0,-.11,.205,.12,.022,.02);if(fc==='happy')part(head,RB,fm,0,-.13,.205,.16,.022,.02);if(fc==='brave'){const b1=part(head,RB,fm,-.08,.14,.21,.1,.02,.01);b1.rotation.z=.35;const b2=part(head,RB,fm,.08,.14,.21,.1,.02,.01);b2.rotation.z=-.35;}}}}
 if(o.hat==='cap'){const cm=mat(o.hatCol||0xd84040);part(head,SP,cm,0,.14,-.01,.235*bk,.16*bk,.235*bk);part(head,RB,cm,0,.1,.26,.3,.04,.18);}
 else if(o.hat==='explorer'){const cm=mat(0xc8a86a);part(head,CY,cm,0,.16,0,.34,.05,.34);part(head,CN,cm,0,.3,0,.19,.2,.19);part(head,CY,mat(0x6a4a2a),0,.22,0,.21,.06,.21);}
 else if(o.hat==='leaf'){for(let i=0;i<6;i++){const a=i/6*Math.PI*2;const l=part(head,CN,mat(i%2?0x2e8b2e:0x46b04a),Math.cos(a)*.17,.2,Math.sin(a)*.17,.08,.3,.04);l.rotation.z=-Math.cos(a)*.6;l.rotation.x=Math.sin(a)*.6;}}
 if(o.hat==='fur'){part(head,CY,mat(0xe8e0d0),0,.2,0,.27*bk,.2,.27*bk);}
 else if(o.hat==='straw'){part(head,CY,mat(0xe0c070),0,.15,0,.45,.04,.45);part(head,CN,mat(0xe0c070),0,.27,0,.2,.2,.2);}
 else if(o.hat==='helm'){const hm=mat(o.helm||0x6a6a5a,{m:.5,r:.4});part(head,SP,hm,0,.1,-.01,.27*bk,.2*bk,.27*bk);part(head,CY,hm,0,.02,0,.3*bk,.03,.3*bk);part(head,CN,mat(0x3a7a2a),0,.32,0,.05,.18,.05);}
 else if(o.hat==='hood')part(head,SP,mat(o.shirt??0x6a2a1a),0,.06,-.04,.26*bk,.27*bk,.26*bk);
 else if(o.hat==='nemes'){const g=mat(0xd4af37,{m:.5,r:.3}),b=mat(0x1a3a8a);part(head,RB,g,0,.12,-.05,.5,.25,.42);part(head,RB,b,-.2,-.15,-.02,.1,.4,.3);part(head,RB,b,.2,-.15,-.02,.1,.4,.3);part(head,CN,g,0,.32,0,.12,.18,.12);}
 else if(o.hat==='leaves'){for(let i=0;i<7;i++){const a=i/7*Math.PI*2;const l=part(head,CN,mat(0x3ab03a),Math.cos(a)*.2,.22,Math.sin(a)*.2,.07,.35,.04);l.rotation.z=-Math.cos(a)*.5;l.rotation.x=Math.sin(a)*.5;}}
 if(o.horns){const hm=mat(o.horns);for(const s of[-1,1]){const h=part(head,CN,hm,s*.22*bk,.22,0,.07,.3,.07);h.rotation.z=-s*.6;}}
 if(o.crown){const g=mat(0xffd040,{m:.6,r:.3,e:0x553300,ei:.4});part(head,CY,g,0,.27*bk,0,.2*bk,.08,.2*bk);for(let i=0;i<5;i++){const a=i/5*Math.PI*2;part(head,CN,g,Math.cos(a)*.17*bk,.36*bk,Math.sin(a)*.17*bk,.04,.12,.04);}}
 if(o.fur){for(let i=0;i<10;i++)part(torso,SP,mat(o.fur),rnd(-.25,.25)*bk,rnd(.05,.7),rnd(-.15,.15)*bk,.12,.12,.12);}
 if(o.cracks){for(let i=0;i<6;i++)part(torso,RB,mat(0xff7a20,{e:0xff5a00,ei:2}),rnd(-.2,.2)*bk,rnd(.1,.6),.155*bk,.04,rnd(.12,.3),.01);}
 const arms=[];for(const s of[-1,1]){const a=joint(torso,s*(.31*bk),.62,0);part(a,RB,shirt,0,-.18,0,.14*bk,.38,.15*bk);part(a,RB,skin,0,-.47,0,.12*bk,.24,.13*bk);arms.push(a);}
 const hand=joint(arms[1],0,-.6,.02);
 if(o.staff){const st=joint(hand,0,0,0);part(st,CY,mat(0x6a4a2a),0,.2,0,.035,1.8,.035);part(st,SP,mat(o.staff,{e:o.staff,ei:1.2}),0,1.15,0,.1,.1,.1);}
 root.userData.rig={type:'biped',body,legL,legR,armL:arms[0],armR:arms[1],torso,head,hand,act:'idle',spd:1,t:Math.random()*9,one:null,oneT:0,oneD:1,h:1.85*sc};return root;}
// quadruped: o={len,h,w,leg,legW,col,belly,neck,head,snout,ears,tail,horns,hump,stripes,mane,scale,round}
function makeBeast(o){const root=new THREE.Group(),body=joint(root,0,0,0);body.scale.setScalar(o.scale||1);const c=mat(o.col),bl=mat(o.belly??o.col),dk=mat(o.dark??0x1a1410);
 const L=o.len,Ht=o.leg,Wd=o.w;const trunk=joint(body,0,Ht+o.h/2,0);
 if(o.round)part(trunk,SP,c,0,0,0,Wd/2,o.h/2,L/2);else{part(trunk,RB,c,0,0,0,Wd,o.h,L);part(trunk,RB,bl,0,-o.h*.42,0,Wd*.9,o.h*.2,L*.85);}
 if(o.stripes)for(let i=0;i<6;i++){part(trunk,RB,dk,0,o.h*.2,-L*.4+i*L*.16,Wd*1.03,o.h*.55,L*.04);}
 if(o.hump)for(let i=0;i<o.hump;i++)part(trunk,SP,c,0,o.h*.55,(o.hump===2?(i?-.25:.25):0)*L,Wd*.35,o.h*.5,L*.18);
 if(o.mane)part(trunk,RB,mat(o.mane),0,o.h*.55,L*.15,Wd*.25,o.h*.25,L*.6);
 const legs=[];for(const [x,z] of [[-1,1],[1,1],[-1,-1],[1,-1]]){const lg=joint(body,x*Wd*.32,Ht,z*L*.36);part(lg,RB,c,0,-Ht/2,0,o.legW,Ht,o.legW);part(lg,RB,dk,0,-Ht+.03,0,o.legW*1.1,.07,o.legW*1.2);legs.push(lg);}
 const nk=joint(trunk,0,o.h*.25,L/2);if(o.neck){const n=part(nk,RB,c,0,o.neck/2,o.neck*.15,Wd*.35,o.neck,Wd*.35);n.rotation.x=.35;}
 const head=joint(nk,0,(o.neck||0)*.95,(o.neck||0)*.35+o.head*.3);part(head,o.round?SP:RB,c,0,0,o.head*.3,o.head*.8*(o.round?.6:1),o.head*.75*(o.round?.6:1),o.head*(o.round?.6:1));
 if(o.snout)part(head,RB,bl,0,-o.head*.12,o.head*.3+o.head*.5+o.snout/2,o.head*.5,o.head*.4,o.snout);
 part(head,SP,dk,0,-o.head*.05,o.head*.3+o.head*.5+(o.snout||0),o.head*.1,o.head*.1,o.head*.06);
 const ey=mat(0x111111,o.eyeGlow?{e:o.eyeGlow,ei:2}:{});for(const s of[-1,1])part(head,SP,ey,s*o.head*.3,o.head*.15,o.head*.75,o.head*.07,o.head*.07,o.head*.05);
 for(const s of[-1,1]){if(o.ears==='point'){const e=part(head,CN,c,s*o.head*.25,o.head*.5,o.head*.1,o.head*.13,o.head*.35,o.head*.08);}else if(o.ears==='round')part(head,SP,c,s*o.head*.33,o.head*.4,o.head*.1,o.head*.13,o.head*.13,o.head*.06);else if(o.ears==='long'){const e=part(head,RB,c,s*o.head*.35,o.head*.35,0,o.head*.35,o.head*.1,o.head*.15);e.rotation.z=s*.4;}}
 if(o.horns==='antlers'){const am=mat(0xd8c8a0);for(const s of[-1,1]){const a=part(head,CY,am,s*o.head*.2,o.head*.75,0,.03,o.head*.9,.03);a.rotation.z=-s*.4;for(let i=0;i<2;i++){const b=part(head,CY,am,s*(o.head*.35+i*.08),o.head*(.85+i*.25),.05,.025,o.head*.4,.025);b.rotation.x=-.6;}}}
 if(o.horns==='tusks')for(const s of[-1,1]){const t=part(head,CN,mat(0xf4ecd8),s*o.head*.2,-o.head*.2,o.head*.3+o.head*.5+(o.snout||0)*.8,.03,.14,.03);t.rotation.x=-.8;}
 const tl=joint(trunk,0,o.h*.2,-L/2);if(o.tail==='bushy'){const t=part(tl,SP,mat(o.tailCol??o.col),0,-.05,-.25,.12,.12,.35);t.rotation.x=.5;}else if(o.tail==='thin'){for(let i=0;i<5;i++)part(tl,BX,i%2&&o.stripes?dk:c,0,i*.02,-.1-i*.14,.06,.06,.15);}else if(o.tail==='short')part(tl,SP,c,0,0,-.05,.07,.07,.07);
 root.userData.rig={type:'quad',body,legs,head,trunk,tail:tl,act:'idle',spd:1,t:Math.random()*9,one:null,oneT:0,oneD:1,h:Ht+o.h};return root;}
function rigSet(f,act,spd=1){const r=f.userData.rig;if(!r)return;if(r.one==='death')return;r.act=act;r.spd=spd;}
function rigOnce(f,act,dur=.45){const r=f.userData.rig;if(!r||r.one==='death')return;r.one=act;r.oneT=0;r.oneD=dur;}
function rigReset(f){const r=f.userData.rig;if(!r)return;r.one=null;r.body.rotation.set(0,0,0);r.body.position.set(0,0,0);}
function rigTick(f,dt){const r=f.userData.rig;if(!r||r.type==='proc')return;r.t+=dt*r.spd;const mv=r.act==='walk'?1:r.act==='run'?1.6:0;const ph=r.t*(r.act==='run'?11:7.5),sw=Math.sin(ph)*.55*mv;let p=0;
 if(r.one){r.oneT+=dt;p=Math.min(1,r.oneT/r.oneD);if(p>=1&&r.one!=='death')r.one=null;}
 if(r.type==='biped'){r.legL.rotation.x=sw;r.legR.rotation.x=-sw;r.armL.rotation.x=-sw*.8;r.armR.rotation.x=sw*.8;r.torso.position.y=.92+Math.abs(Math.sin(ph))*.05*mv+Math.sin(r.t*2)*.01;r.armL.rotation.z=-.08;r.armR.rotation.z=.08;r.torso.rotation.y=0;
  if(r.one==='attack'){const k=Math.sin(p*Math.PI);r.armR.rotation.x=-2.4*k+(p>.5?.6*k:0);r.torso.rotation.y=-.5*k;}
  else if(r.one==='cast'){const k=Math.sin(p*Math.PI);r.armR.rotation.x=r.armL.rotation.x=-2.8*k;}
  else if(r.one==='hit'){r.torso.rotation.x=-.3*Math.sin(p*Math.PI);}
  else if(r.one==='death'){r.body.rotation.x=-Math.PI/2*sstep(0,1,p);r.body.position.y=.2*sstep(0,1,p);}}
 else{r.legs[0].rotation.x=sw;r.legs[3].rotation.x=sw;r.legs[1].rotation.x=-sw;r.legs[2].rotation.x=-sw;r.trunk.position.y=(r.ty0??(r.ty0=r.trunk.position.y))+Math.abs(Math.sin(ph))*.04*mv;r.tail.rotation.y=Math.sin(r.t*4)*.4;r.head.rotation.x=0;r.head.position.z=r.head.userData.z0??(r.head.userData.z0=r.head.position.z);
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
const PLACE=['campfire','bench','tent','bed','chest','fence','wall','trap','torch_post','lamp_post','spike_barricade','gate','iron_wall','watchtower','turret','flame_trap','tar_pit','bear_trap','alarm_bell','scarecrow','trench','thorn_wall','guardian_totem'];
const SINGLE=k=>/_(axe|pickaxe|sword|armor)$/.test(k)||['spear','bow','cold_gear','heat_gear','waterskin','lantern','shield','guard_shield','crown','frost_blade','vine_armor','sun_amulet','magma_hammer'].includes(k);
const FOOD={cooked_meat:[35,8],berries:[10,0],raw_meat:[12,-5],cactus_fruit:[15,0],stew:[60,15]};
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
const WEAP={fists:{d:6,r:1.7},spear:{d:16,r:3},frost_blade:{d:58,r:2.5},magma_hammer:{d:70,r:2.4}};
TIERS.forEach(([t],i)=>{WEAP[t+'_sword']={d:[10,16,26,34,46][i],r:2.2+i*.05};WEAP[t+'_axe']={d:[7,9,13,17,22][i],r:1.9};WEAP[t+'_pickaxe']={d:[5,7,10,13,17][i],r:1.9};});
function bestWeapon(){let b='fists';for(const k in WEAP)if(k!=='fists'&&has(k)&&WEAP[k].d>WEAP[b].d)b=k;return b;}
const armorPct=()=>has('vine_armor')?.65:has('obsidian_armor')?.6:has('gold_armor')?.5:has('iron_armor')?.4:has('hide_armor')?.2:0;
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
function spawnNPCs(){for(const v of VILLAGES)PEOPLE[v.id].forEach((pd,i)=>{const f=makeHuman(pd.look);const home=v.houses[(i+1)%v.houses.length];let x=v.x+rnd(-4,4),z=v.z+rnd(-4,4);if(pd.role==='shop'){x=v.shop.x+Math.sin(v.shop.ry)*1.2;z=v.shop.z+Math.cos(v.shop.ry)*1.2;}
 f.position.set(x,H(x,z),z);scene.add(f);const sp=new THREE.Sprite(MK['!']);sp.scale.set(.9,.9,.9);sp.position.y=(pd.look.scale||1)*2.3;sp.visible=false;f.add(sp);
 NPCS.push({...pd,v,x,z,fig:f,marker:sp,home,tx:x,tz:z,wait:rnd(0,3),inside:false,dir:0});});}
function npcQuest(n){const st=quests[n.id]||{i:0,active:false};if(n.role==='elder'){const q=MAINQ[n.v.id][st.i];return q?{q,st}:null;}if(n.side){return st.i<1?{q:n.side,st}:null;}return null;}
function qProg(q,st){if(q.t==='fetch')return Math.min(cnt(q.item),q.n);if(q.t==='hunt')return Math.min((kills[q.kind]||0)-(st.k0||0),q.n);if(q.t==='boss')return bossDone[q.boss]?1:0;return 0;}
const qNeed=q=>q.t==='boss'?1:q.n;
const qDesc=q=>q.t==='boss'?'Defeat '+BOSSES.find(b=>b.id===q.boss).name:q.t==='fetch'?'Bring '+q.n+' '+nm(q.item):'Hunt '+q.n+' '+q.kind.replace('cultist_torch','Forest Torchbearer').replace('cultist_shaman','Forest Mage').replace('cultist','Forest Scout').replace('_',' ')+(q.n>1?'s':'');
function questList(){const out=[];for(const n of NPCS){const st=quests[n.id];if(!st)continue;const list=n.role==='elder'?MAINQ[n.v.id]:n.side?[n.side]:[];list.forEach((q,i)=>{if(i<st.i)out.push({title:q.title,giver:n.name+' · '+n.v.name,desc:qDesc(q),done:true});else if(i===st.i&&st.active){const p=qProg(q,st);out.push({title:q.title,giver:n.name+' · '+n.v.name,desc:qDesc(q),prog:p+'/'+qNeed(q),ready:p>=qNeed(q)});}});}return out.sort((a,b)=>(a.done?1:0)-(b.done?1:0));}
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
 opts.push({l:'💬 Heard any rumors?',f:()=>rumor(n)});opts.push({l:'👋 Goodbye',f:endTalk});
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
  case'monkey':S(.25,m,0,.5,0,1,1.2,1);S(.17,m,0,.88,.05);S(.1,new THREE.MeshStandardMaterial({color:0xd8b090}),0,.85,.16);const t=new THREE.Mesh(new THREE.TorusGeometry(.25,.04,6,10,3),m);t.position.set(0,.5,-.3);g.add(t);break;
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
function manageAnimals(dt){spawnT-=dt;for(const a of animals){if(Math.hypot(a.x-P.x,a.z-P.z)>85&&!a.boss&&!a.raid){a.gone=true;}}
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
 a.cd-=dt;a.t-=dt;if(a.flash>0){a.flash-=dt;}
 const dx=P.x-a.x,dz=P.z-a.z,dp=Math.hypot(dx,dz);let spd=0,tdir=a.dir;if(a.K.beh==='cultist'){cultTick(a,dt,dp);continue;}
 const hostileNow=(a.agro&&!(P.dead))&&dp<(a.K.beh==='hostile'?(night()?22:16):30)&&!safeAt(P.x,P.z);
 if(a.K.beh!=='passive'&&!a.minion&&litAt(a.x,a.z)){const fr=structs.find(s=>s.type==='campfire'&&s.fuel>0&&Math.hypot(a.x-s.x,a.z-s.z)<fireR(s));tdir=Math.atan2(a.x-fr.x,a.z-fr.z);spd=a.K.spd*.8;a.agro=a.K.beh==='hostile';}
 else if(a.state==='flee'&&a.t>0){tdir=Math.atan2(-dx,-dz);spd=a.K.spd;}
 else if(hostileNow){tdir=Math.atan2(dx,dz);const rng=(a.K.hm?2:1.6)*(a.K.bulk||1);if(dp>rng){spd=a.K.spd;}else if(a.cd<=0){a.cd=1.2;aAnim(a,'attack');setTimeout(()=>{if(a.alive&&Math.hypot(P.x-a.x,P.z-a.z)<rng+.8)hurtPlayer(a.K.dmg,a.K.b);},300);}}
 else{if(a.t<=0){a.t=rnd(2,5);a.state=Math.random()<.5?'idle':'wander';a.dir=rnd(0,6.28);if(a.agro&&a.K.beh!=='hostile')a.agro=false;}tdir=a.dir;spd=a.state==='wander'?a.K.spd*.3:0;if(a.K.beh==='passive'&&dp<6){a.state='flee';a.t=2;}}
 spd*=slowAt(a);a.dir=tdir;const nx=a.x+Math.sin(tdir)*spd*dt,nz=a.z+Math.cos(tdir)*spd*dt;
 if(!blocked(nx,nz,.5)&&!inPond(nx,nz,.3)&&!(inLava(nx,nz)&&a.K.b!=='lava')&&Math.abs(nx)<W-3&&Math.abs(nz)<W-3){a.x=nx;a.z=nz;}else{a.dir+=1.5;}
 const fy=a.K.fly?H(a.x,a.z)+2.2+Math.sin(performance.now()/300+a.x)*.3:H(a.x,a.z);f.position.set(a.x,fy,a.z);f.rotation.y=tdir;
 if(u.proc){const tt=performance.now()/1000;u.proc.position.y=spd>0&&!a.K.fly?Math.abs(Math.sin(tt*12))*.08:0;u.proc.children.forEach(c=>{if(c.userData.wing)c.rotation.z=Math.sin(tt*16)*.7*c.userData.wing;if(c.userData.seg!==undefined)c.position.x=Math.sin(tt*6-c.userData.seg)*.12;});}
 else aAnim(a,spd>a.K.spd*.5?'run':spd>0?'walk':'idle');}}
function hitAnimal(a,dmg){a.hp-=dmg;a.flash=.2;floatTxt(a.x,a.z,'-'+Math.round(dmg),'#ffd');sfx.hit();if(a.K.beh!=='passive')a.agro=true;else{a.state='flee';a.t=3;}if(a.hp<=0)killAnimal(a,true);}

// ---------- telegraphs & projectiles ----------
const TELE=[],PROJ=[];
const teleMat=new THREE.MeshBasicMaterial({color:0xff2a2a,transparent:true,opacity:.35,depthWrite:false});
function telegraph(x,z,r,delay,cb){delay*=1.5;const m=new THREE.Mesh(new THREE.CircleGeometry(r,28),teleMat.clone());m.rotation.x=-Math.PI/2;m.position.set(x,H(x,z)+.08,z);scene.add(m);TELE.push({m,t:delay,d:delay,cb,x,z,r});}
function shoot(from,x,z,ang,spd,dmg,col,r=.35,life=2.5){if(from==='player'&&P.tower&&Math.hypot(x-P.x,z-P.z)<2){life*=1.9;dmg*=1.25;}if(from==='enemy'){spd*=.68;life*=1.4;}const m=new THREE.Mesh(new THREE.SphereGeometry(r,10,8),new THREE.MeshBasicMaterial({color:col}));m.position.set(x,H(x,z)+1.2,z);scene.add(m);PROJ.push({from,x,z,vx:Math.sin(ang)*spd,vz:Math.cos(ang)*spd,dmg,life,m,r});}
function updFx(dt){for(let i=TELE.length-1;i>=0;i--){const t=TELE[i];t.t-=dt;t.m.material.opacity=.25+.45*(1-t.t/t.d);if(t.t<=0){scene.remove(t.m);TELE.splice(i,1);t.cb&&t.cb(t);}}
 for(let i=PROJ.length-1;i>=0;i--){const p=PROJ[i];p.x+=p.vx*dt;p.z+=p.vz*dt;p.life-=dt;p.m.position.set(p.x,H(p.x,p.z)+1.2,p.z);let hit=false;
  if(p.from==='enemy'){if(!P.dead&&Math.hypot(p.x-P.x,p.z-P.z)<p.r+.5){hurtPlayer(p.dmg,null);hit=true;}}
  else{for(const a of animals){if(a.alive&&Math.hypot(p.x-a.x,p.z-a.z)<.9*(a.K.bulk||1)+(a.K.hm?.4:0)){hitAnimal(a,p.dmg);hit=true;break;}}if(!hit&&boss&&boss.alive&&Math.hypot(p.x-boss.x,p.z-boss.z)<boss.rad){hitBoss(p.dmg);hit=true;}}
  if(hit||p.life<=0||blocked(p.x,p.z,.1)){scene.remove(p.m);PROJ.splice(i,1);}}}

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
 if(dp>40||P.dead){scene.remove(b.fig);boss=null;toast(B.name+' retreats to its lair…');return;}
 $('bossbar').classList.remove('hidden');$('bossName').textContent=B.name+(b.phase2?' (ENRAGED)':'');$('bossB').style.width=(b.hp/b.max*100)+'%';
 if(!b.phase2&&b.hp<b.max/2){b.phase2=true;toast(B.name+' is enraged!');}
 const ang=Math.atan2(P.x-b.x,P.z-b.z);
 if(b.act==='charge'){b.actT-=dt;if(b.actT<.6){const s=18*dt;b.x+=Math.sin(b.cAng)*s;b.z+=Math.cos(b.cAng)*s;rigSet(b.fig,'run',1.6);if(dp<b.rad+.8&&b.contact<=0){hurtPlayer(B.dmg*1.2,null);b.contact=1;}}if(b.actT<=0)b.act=null;}
 else{b.cd-=dt;if(dp>b.rad+1.2){const s=(b.phase2?4.2:3.2)*dt;b.x+=Math.sin(ang)*s;b.z+=Math.cos(ang)*s;rigSet(b.fig,'walk',1);}else{rigSet(b.fig,'idle');if(b.contact<=0){rigOnce(b.fig,'attack',.6);hurtPlayer(B.dmg*.8,null);b.contact=1.3;}}
  if(b.cd<=0)bossAttack(b);}
 b.contact-=dt;b.x=clamp(b.x,B.x-18,B.x+18);b.z=clamp(b.z,B.z-18,B.z+18);
 b.fig.position.set(b.x,H(b.x,b.z),b.z);b.fig.rotation.y=b.act==='charge'?b.cAng:ang;}
function hitBoss(d){const b=boss;if(!b||!b.alive)return;b.hp-=d;floatTxt(b.x,b.z,'-'+Math.round(d),'#f66');sfx.hit();
 if(b.hp<=0){b.alive=false;b.deadT=4;rigOnce(b.fig,'death',1.5);bossDone[b.B.id]=1;add(b.B.trophy,1);const got=[ITEMS[b.B.trophy]];for(const k in b.B.loot){add(k,b.B.loot[k]);got.push('+'+b.B.loot[k]+' '+ITEMS[k]);}
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
const SR={guardian_totem:.5,watchtower:1.25,turret:.7,flame_trap:.55,alarm_bell:.3,scarecrow:.35,torch_post:.25,lamp_post:.3,house:2.6,well:1.2,tent:1.3,bed:.9,bench:.9,chest:.6,campfire:.6,fence:.7,wall:.9,trap:0};
const LOWRES=new Set(['rock','iron','gold','crystal','obsidian','cactus']),LOWST=new Set(['fence','trap','campfire','chest','bed','bench']);
function blocked(x,z,r,air){for(const o of near(x,z,2)){if(!o.alive||o.type==='pebble'||o.type==='bush'||(air&&LOWRES.has(o.type)))continue;if(Math.hypot(x-o.x,z-o.z)<RTYPES[o.type].r*o.s*(o.type==='tree'?.6:1)+r)return true;}
 for(const s of structs)if(!(air&&LOWST.has(s.type))&&!NOBLOCK.has(s.type)&&!s.open&&Math.abs(x-s.x)<4&&Math.abs(z-s.z)<4&&(SEG[s.type]?segDist(s,x,z)<SEG[s.type][1]+r:Math.hypot(x-s.x,z-s.z)<(s.type==='campfire'?[0,.6,.8,1,1.5,1.9][s.lvl||1]:SR[s.type]??.4)+r))return true;return false;}
function pBlocked(x,z){const air=P.jy>.3;return blocked(x,z,.4,air)&&!blocked(P.x,P.z,.4,air);}

// ---------- player ----------
const P={jy:0,vy:0,x:0,z:3,dir:Math.PI,hp:100,maxHp:100,hearts:0,torchOn:true,hunger:100,thirst:100,temp:100,fig:null,cd:0,dead:false,water:0,spawn:[0,3]};
let dayT=40,day=1,paused=true,running=false,shake=0,toolHeld=null;
const DAY=300;const phase=()=>(dayT%DAY)/DAY;const night=()=>{const p=phase();return p>.72||p<.04;};
function hurtPlayer(d,src){if(P.dead||paused)return;d*=1-armorPct();if(P.blocking){d*=has('guard_shield')?.18:.35;floatTxt(P.x,P.z,'🔰 block','#9cf');}P.hp-=d;P.hurtT=.3;sfx.hurt();floatTxt(P.x,P.z,'-'+Math.round(d),'#f44');if(P.hp<=0)die();}
function die(){P.dead=true;P.hp=0;rigOnce(P.fig,'death',1);toast('💀 You fainted… waking at '+(P.spawn[0]===0&&P.spawn[1]===3?'the forest clearing':'your tent'),3);const lost=Math.floor((inv.raw_meat||0)/2);if(lost)add('raw_meat',-lost);
 setTimeout(()=>{P.dead=false;P.x=P.spawn[0];P.z=P.spawn[1];P.hp=Math.round(P.maxHp*.7);P.hunger=Math.max(P.hunger,50);P.thirst=Math.max(P.thirst,50);P.temp=100;rigReset(P.fig);rigSet(P.fig,'idle');},2600);}
function equipVisual(){const w=bestWeapon(),t=lightsOn()&&(has('torch')||has('lantern'))&&P.torchOn?'torch':(w==='fists'?null:w);if(t===toolHeld)return;toolHeld=t;const h=P.fig.userData.rig.hand;if(P.tool){h.remove(P.tool);}P.tool=null;if(t){P.tool=toolMesh(t);h.add(P.tool);}}

// ---------- interaction ----------
function nearestStruct(type,r){let b=null,bd=r;for(const s of structs)if(s.type===type){const d=Math.hypot(s.x-P.x,s.z-P.z);if(d<bd){bd=d;b=s;}}return b;}
function useTarget(){if(moving)return{l:'PLACE',f:placeMove};{const dt=defTarget();if(dt)return dt;}{const tc=TCH.find(c=>!c.open&&Math.hypot(c.x-P.x,c.z-P.z)<2.6);if(tc)return{l:'OPEN',f:()=>openTreasure(tc)};}for(const tr of TRADERS)if(Math.hypot(tr.x-P.x,tr.z-P.z)<3.2)return{l:'TALK',f:()=>talkTrader(tr)};for(const n of NPCS)if(!n.inside&&Math.hypot(n.x-P.x,n.z-P.z)<3.2)return{l:'TALK',f:()=>talk(n)};
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
function shootBow(aim){if(P.dead||paused||P.cd>0)return;if(!has('bow'))return toast('Craft a bow at a crafting bench first.');if(!has('arrows'))return toast('No arrows! Craft some (needs feathers).');P.cd=.55;add('arrows',-1);
 let tgt=null,bd=26;for(const a of animals)if(a.alive){const d=Math.hypot(a.x-P.x,a.z-P.z);if(d<bd){bd=d;tgt=a;}}if(boss&&boss.alive&&Math.hypot(boss.x-P.x,boss.z-P.z)<26)tgt=boss;
 if(aim!==undefined){tgt=null;let bb=.35;for(const a of [...animals.filter(a=>a.alive),...(boss&&boss.alive?[boss]:[])]){const d=Math.hypot(a.x-P.x,a.z-P.z);if(d>26)continue;const df=Math.abs(Math.atan2(Math.sin(Math.atan2(a.x-P.x,a.z-P.z)-aim),Math.cos(Math.atan2(a.x-P.x,a.z-P.z)-aim)));if(df<bb){bb=df;tgt=a;}}}const ang=tgt?Math.atan2(tgt.x-P.x,tgt.z-P.z):(aim??P.dir);P.dir=ang;shoot('player',P.x+Math.sin(ang),P.z+Math.cos(ang),ang,26,14*(has('crown')?1.5:1),0xf5e6b0,.15,1.2);sfx.shoot();rigOnce(P.fig,'attack',.3);}
function eatBest(){for(const [k,h,hp] of [['stew',60,15],['cooked_meat',35,8],['cactus_fruit',15,0],['berries',10,0],['raw_meat',12,-5]])if(has(k)){add(k,-1);P.hunger=Math.min(100,P.hunger+h);P.hp=clamp(P.hp+hp,1,P.maxHp);if(k==='cactus_fruit')P.thirst=Math.min(100,P.thirst+20);toast('Ate '+ITEMS[k]+(k==='raw_meat'?' (cook it at a campfire!)':''),1.4);sfx.eat();return;}
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
 if(k==='bow')return shootBow(mouseAim());
 if(k==='torch'||k==='lantern'){P.torchOn=!P.torchOn;toolHeld='?';return toast((k==='torch'?'Torch ':'Lantern ')+(P.torchOn?'on':'off'));}
 if(k==='wood'){const f=nearestStruct('campfire',3.5);if(f)return fuelFire(f);}
 if(PLACE.includes(k)){if(P.tower)return toast('Climb down first');const pp=placePos(k),x=pp.x,z=pp.z;if(!placeOk(k,pp))return toast('No room to place that here');addItem(k,-1);const st=placeStruct(k,x,z,{rot:pp.rot,tier:k==='bench'?1:undefined,fuel:k==='campfire'?50:undefined});if(k==='bed'||k==='tent')P.spawn=[x+1.5,z+1.5];sfx.craft();toast('Placed '+nm(k));save();return;}
 toast(nm(k));}
function fuelFire(f){if(!has('wood'))return toast('You need logs to fuel the fire');if(f.fuel>=flv(f).maxF)return toast('The fire is roaring already!');addItem('wood',-1);f.fuel=Math.min(flv(f).maxF,(f.fuel||0)+14);sfx.craft();toast('🔥 Fire fuel '+Math.round(ffrac(f)*100)+'%  (safe radius '+Math.round(fireR(f))+'m)',1.6);}
const FLV=[null,
 {n:'Stone ring',maxF:100,burn:1,rm:1,perk:'Keeps animals away'},
 {n:'Hearth',maxF:130,burn:.85,rm:1.2,cost:{wood:12,stone:12},perk:'Hearty cooking: +50% cooked meat'},
 {n:'Iron brazier',maxF:160,burn:.7,rm:1.4,cost:{stone:15,iron:6},perk:'Healing circle: regenerate health in the light'},
 {n:'Bonfire',maxF:200,burn:.55,rm:1.65,cost:{wood:20,iron:10,gold:5},perk:'Forest Soldiers are slowed in the light'},
 {n:'Great beacon',maxF:250,burn:.45,rm:1.9,cost:{gold:8,gem:3,obsidian:4},perk:'Forest Soldiers burn in the light · double healing'}];
const flv=f=>FLV[f.lvl||1]||FLV[1];const ffrac=f=>Math.min(1,(f.fuel||0)/flv(f).maxF);
const fireR=f=>f.fuel>0?((f.main?6:4)+ffrac(f)*100*(f.main?.18:.1))*flv(f).rm:0;
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
 for(const tr of TRADERS){const tx=sx(tr.x),tz2=sz(tr.z),tNow=performance.now()/300,pl=.5+.5*Math.sin(tNow*2),fern=tr.kind==='forest';g.save();g.beginPath();g.arc(tx,tz2,(round?8:15)+pl*(round?3:7),0,7);g.fillStyle=fern?'rgba(120,255,90,.28)':'rgba(90,180,255,.28)';g.fill();g.lineWidth=round?2:3.5;g.strokeStyle=fern?'#8dff5a':'#57b6ff';g.stroke();g.font=(round?14:24)+'px sans-serif';g.fillText(fern?'🧺':'🛡️',tx,tz2);if(!round){g.font='bold 13px sans-serif';g.lineWidth=3;g.strokeStyle='#000';const lb=(fern?'Fern':'Bram')+(fern?' · leaves at dawn':' · leaves at dusk');g.strokeText(lb,tx,tz2+30);g.fillStyle=fern?'#b6ff9a':'#a8dcff';g.fillText(lb,tx,tz2+30);}g.restore();}
 for(const v of VILLAGES){g.fillText('🏠',sx(v.x),sz(v.z));if(!round){g.font='12px sans-serif';g.fillStyle='#fff';g.fillText(v.name,sx(v.x),sz(v.z)+16);g.font='22px sans-serif';}}
 for(const B of BOSSES)if(revealed[B.id]||bossDone[B.id]){g.fillText(bossDone[B.id]?'✅':'💀',sx(B.x),sz(B.z));if(!round){g.font='12px sans-serif';g.fillStyle='#fdd';g.fillText(B.name,sx(B.x),sz(B.z)+16);g.font='22px sans-serif';}}
 for(const c of TCH)if(c.seen)g.fillText(c.open?'📭':'🎁',sx(c.x),sz(c.z));
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
addEventListener('keydown',e=>{const k=e.key.toLowerCase();if(k==='tab')e.preventDefault();keys[k]=true;if(!running||e.repeat&&k!==' ')return;
 if(k==='escape'){if(!$('howP').classList.contains('hidden')){closeHow();return;}if(!$('charP').classList.contains('hidden')){closeChar();return;}if(moving){cancelMove();return;}togglePause();return;}if(!$('pause').classList.contains('hidden'))return;
 if(k===' '){e.preventDefault();jump();}
 if(k==='r'&&!anyPanel())rotGhost();
 if(k==='e'){if(moving){placeMove();}else if(!$('talk').classList.contains('hidden')){if(typeTimer)$('talk').onclick();}else if(!anyPanel()){if(movableNear()&&!ePending){eDownAt=performance.now();ePending=useTarget();}else{const u=useTarget();u&&u.f();}}}
 if(k==='j'){if($('bag').classList.contains('hidden')){closeAll();openBag('quests');}else closeBag();}
 if(k==='f'&&!anyPanel())shootBow(mouseAim());
 if(k==='tab'||k==='i'){if($('bag').classList.contains('hidden')){closeAll();openBag('bag');}else closeBag();}
 if(k==='c'){if($('bag').classList.contains('hidden')){closeAll();openBag('book');}else if(bagTab!=='book'){bagTab='book';renderBag();}else closeBag();}
 if(k==='m'){if($('fullMap').classList.contains('hidden')){openMap();}else $('fullMap').classList.add('hidden');}
 if(k==='h')$('keys').classList.toggle('hidden');
 if(/^[1-9]$/.test(k)&&!anyPanel()){const i=+k-1;if(i===selHot)useSlot(i);else{selHot=i;equipVisual();}renderHot();}});
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
$('bChar').onclick=()=>openChar();$('bHow').onclick=()=>showHow();$('pHow').onclick=()=>showHow();$('howX').onclick=()=>closeHow();$('bHelp').onclick=()=>showHow();$('stepsX').onclick=()=>{stepsOff=true;$('firstSteps').classList.add('hidden');save();};$('pChar').onclick=()=>openChar();$('charX').onclick=()=>closeChar();$('charDone').onclick=()=>closeChar();$('charRand').onclick=()=>randomChar();$('charName').addEventListener('input',e=>{CHAR.name=e.target.value;});
$('bPlace').addEventListener('pointerdown',e=>{e.preventDefault();placeMove();});
$('bCancel').addEventListener('pointerdown',e=>{e.preventDefault();cancelMove();});
$('bShoot').addEventListener('pointerdown',e=>{e.preventDefault();shootBow();});
$('bEat').addEventListener('pointerdown',e=>{e.preventDefault();eatBest();});
$('bBag').addEventListener('pointerdown',e=>{e.preventDefault();openBag();});
$('quit').onclick=()=>{if(confirm('Save and quit to the main menu?')){try{MUS.set('off');}catch(e){}save();running=false;paused=true;$('hud').classList.add('hidden');$('title').classList.remove('hidden');$('bCont').disabled=false;}};
$('winOk').onclick=()=>{$('win').classList.add('hidden');paused=false;};

// ---------- save ----------
function save(){if(!running&&!P.fig)return;try{localStorage.setItem(SAVE_KEY,JSON.stringify({v:1,p:{x:P.x,z:P.z,hp:P.hp,hunger:P.hunger,thirst:P.thirst,temp:P.temp,water:P.water,spawn:P.spawn},slots,coins,selHot,chest,structs:structs.filter(s=>!s.perm).map(s=>({type:s.type,x:s.x,z:s.z,rot:s.rot,tier:s.tier,fuel:s.fuel,main:s.main,lvl:s.lvl,hp:s.hp,open:s.open,ammo:s.ammo})),dead:[...deadRes],quests,revealed,kills,bossDone,dayT,day,raidDay,char:CHAR,stepsOff,ftDay,dtDay,tchOpen:TCH.filter(c=>c.open).map(c=>c.id),tchSeen:TCH.filter(c=>c.seen).map(c=>c.id)}));}catch(e){}}
function load(){try{const d=JSON.parse(localStorage.getItem(SAVE_KEY));if(!d)return false;Object.assign(P,d.p);P.maxHp=P.maxHp||100;if(d.slots)slots=d.slots.concat(new Array(NSLOT).fill(null)).slice(0,NSLOT);else if(d.inv){const L={axe:'stone_axe',pickaxe:'stone_pickaxe',obsidian_blade:'obsidian_sword'};for(const k in d.inv)addItem(L[k]||k,d.inv[k]);}coins=d.coins||0;selHot=d.selHot||0;chest=d.chest||{};raidDay=d.raidDay||0;if(d.char){CHAR=d.char;localStorage.setItem('cq_charprofile',JSON.stringify(CHAR));}stepsOff=!!d.stepsOff;ftDay=d.ftDay||0;dtDay=d.dtDay||0;for(const c of TCH){if((d.tchOpen||[]).includes(c.id))openLook(c);if((d.tchSeen||[]).includes(c.id))c.seen=1;}
 for(const s of d.structs||[]){const {type,x,z,...o}=s;placeStruct(type,x,z,o);}if(!structs.some(s=>s.main))placeStruct('campfire',0,-1.5,{main:1,fuel:60});for(const id of d.dead||[]){const o=RES[id];if(o){o.alive=false;hideRes(o);deadRes.add(id);o.respawnAt=performance.now()/1000+300;}}
 quests=d.quests||{};revealed=d.revealed||{};kills=d.kills||{};bossDone=d.bossDone||{};dayT=d.dayT||40;day=d.day||1;return true;}catch(e){return false;}}
setInterval(()=>{if(running)save();},10000);addEventListener('visibilitychange',()=>{if(document.hidden&&running)save();});addEventListener('pagehide',()=>running&&save());

// ---------- realistic graphics layer: sky, env lighting, water, grass, particles, post-processing ----------
let sky=null,composer=null,bloom=null,pmrem=null,envRT=null,envT=0;const gUni={uTime:{value:0}};
if(HQ){sky=new Sky();sky.scale.setScalar(180);scene.add(sky);Object.assign(sky.material.uniforms,{});sky.material.uniforms.turbidity.value=6;sky.material.uniforms.rayleigh.value=1.6;sky.material.uniforms.mieCoefficient.value=.005;sky.material.uniforms.mieDirectionalG.value=.8;scene.background=null;pmrem=new THREE.PMREMGenerator(renderer);}
function updSky(sunDir,dl){if(!sky)return;sky.position.copy(camera.position);sky.material.uniforms.sunPosition.value.copy(sunDir);renderer.toneMappingExposure=.28+.72*Math.max(0,Math.min(1,dl));envT-=1;if(envT<=0&&pmrem){envT=GQ==='high'?240:480;const s2=new THREE.Scene();const sk=sky.clone();sk.position.set(0,0,0);s2.add(sk);if(envRT)envRT.dispose();envRT=pmrem.fromScene(s2,0,.1,400);scene.environment=envRT.texture;}}
// water: animated normal-mapped reflective surface
if(HQ){const wn=ltex('water_n',3,false);Object.assign(waterMat,{color:new THREE.Color(0x1f5a78),roughness:.04,metalness:.15,opacity:.86,normalMap:wn,normalScale:new THREE.Vector2(.6,.6),envMapIntensity:1.4});waterMat.needsUpdate=true;waterMat.userData.wn=wn;}
// instanced swaying grass around the player
let grass=null,grassAt=[1e9,1e9];
if(HQ){const N=GQ==='high'?9000:3500;const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute([-.05,0,0,.05,0,0,0,.7,0, 0,0,-.05,0,0,.05,0,.6,0],3));geo.setAttribute('color',new THREE.Float32BufferAttribute([.35,.45,.2,.35,.45,.2,1,1,.8, .35,.45,.2,.35,.45,.2,1,1,.8],3));geo.computeVertexNormals();
 const gm=new THREE.MeshStandardMaterial({vertexColors:true,side:THREE.DoubleSide,roughness:.9});gm.onBeforeCompile=sh=>{sh.uniforms.uTime=gUni.uTime;sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nuniform float uTime;').replace('#include <begin_vertex>','#include <begin_vertex>\nvec4 ip=instanceMatrix[3];float sw=sin(uTime*1.8+ip.x*.35+ip.z*.27)*.5+sin(uTime*3.1+ip.x*.9)*.2;transformed.x+=sw*.22*position.y;transformed.z+=sw*.1*position.y;');};
 grass=new THREE.InstancedMesh(geo,gm,N);grass.frustumCulled=false;grass.receiveShadow=true;scene.add(grass);}
function updGrass(){if(!grass)return;if(Math.hypot(P.x-grassAt[0],P.z-grassAt[1])<7)return;grassAt=[P.x,P.z];const N=grass.count,R0=GQ==='high'?30:22,rr=mulberry(Math.floor(P.x/7)*977+Math.floor(P.z/7));
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
 composer.addPass(new ShaderPass({uniforms:{tDiffuse:{value:null},sat:{value:1.12},vig:{value:.28}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:'uniform sampler2D tDiffuse;uniform float sat,vig;varying vec2 vUv;void main(){vec4 c=texture2D(tDiffuse,vUv);float l=dot(c.rgb,vec3(.299,.587,.114));c.rgb=mix(vec3(l),c.rgb,sat);c.rgb=(c.rgb-.5)*1.05+.5;c.rgb*=mix(1.,smoothstep(.95,.3,length(vUv-.5)),vig);c.rgb*=vec3(1.02,1.,.97);gl_FragColor=c;}'}));
 composer.addPass(new OutputPass());}
initPost();addEventListener('resize',()=>{composer&&composer.setSize(innerWidth,innerHeight);});
function gfxTick(dt,sunDir,dl){gUni.uTime.value+=dt;updSky(sunDir,dl);updGrass();if(waterMat.userData.wn){waterMat.userData.wn.offset.x+=dt*.02;waterMat.userData.wn.offset.y+=dt*.013;}if(bloom)bloom.strength=dl>.5?.3:.6;}
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
 if(ml>.1){const cy=Math.cos(camYaw),sy=Math.sin(camYaw);const rx=mx*cy+mz*sy,rz=-mx*sy+mz*cy;mx=rx;mz=rz;const sp=6.2*Math.min(1,ml)*(inPond(P.x,P.z)?.5:1)*(b==='snow'&&!has('cold_gear')?.8:1);const nx=P.x+mx/Math.max(1,ml)*sp*dt,nz=P.z+mz/Math.max(1,ml)*sp*dt;
  if(!pBlocked(nx,P.z))P.x=clamp(nx,-W+3,W-3);if(!pBlocked(P.x,nz))P.z=clamp(nz,-W+3,W-3);P.dir=Math.atan2(mx,mz);rigSet(P.fig,ml>.6?'run':'walk',1);}else if(!P.dead)rigSet(P.fig,'idle');
 if(P.tower){P.x=P.tower.x;P.z=P.tower.z;P.jy=3.45;P.vy=0;}else if(P.jy>0||P.vy>0){P.jy+=P.vy*dt;P.vy-=22*dt;if(P.jy<=0){P.jy=0;P.vy=0;P.fig.scale.set(1.08,.9,1.08);}}
 if(actHeld&&P.cd<=0)doAttack(mouseAim());if(keys.z)camYaw+=1.8*dt;if(keys.x)camYaw-=1.8*dt;P.cd-=dt;
 P.fig.position.set(P.x,H(P.x,P.z)+P.jy,P.z);P.fig.rotation.y=P.dir;rigTick(P.fig,dt);jumpPose(dt);
 // survival
 if(!P.dead){const hot=(b==='desert'&&!has('heat_gear'));P.hunger-=dt*.22;P.thirst-=dt*(hot?.75:.3);
  const fire=litAt(P.x,P.z);
  if(b==='snow')P.temp+=has('cold_gear')?(fire?8:1)*dt:(fire?10:night()?-5:-3.5)*dt;
  else if(b==='lava')P.temp+=has('heat_gear')?1*dt:-5*dt;else if(b==='desert')P.temp+=has('heat_gear')?1*dt:(night()?2:-2)*dt;else P.temp+=6*dt;
  P.temp=clamp(P.temp,0,100);P.hunger=clamp(P.hunger,0,100);P.thirst=clamp(P.thirst,0,100);
  if(P.hunger<=0)hurtTick(1.2*dt,'starving');if(P.thirst<=0)hurtTick(1.6*dt,'dehydrated');if(P.temp<=0)hurtTick(3*dt,b==='snow'?'freezing! Craft cold gear':'overheating! Craft heat gear');
  if(inLava(P.x,P.z))hurtTick((has('heat_gear')?6:18)*dt,'in LAVA!');
  if(P.hunger>50&&P.thirst>50&&P.temp>30&&P.hp<P.maxHp)P.hp=Math.min(P.maxHp,P.hp+(fire?1.5:.5)*(has('sun_amulet')?3:1)*dt);}
 {const lf=!P.dead&&litFire(P.x,P.z);if(lf&&(lf.lvl||1)>=3&&P.hp<P.maxHp)P.hp=Math.min(P.maxHp,P.hp+((lf.lvl||1)>=5?4:2)*dt);}
 musT-=dt;if(musT<=0){musT=.5;MUS.set(pickTheme(b));}
 // world
 dayT+=dt;if(Math.floor((dayT-dt)/DAY)<Math.floor(dayT/DAY)){day++;toast('☀️ Day '+day);}
 {const nn=night();if(nn&&!wasNight)onDusk();else if(!nn&&wasNight)onDawn();wasNight=nn;}updPosts();tickTreasure(dt);tickRaid(dt);updDefenses(dt);updGhost();
 manageAnimals(dt);updAnimals(dt);updBoss(dt);updFx(dt);
 regrowT-=dt;if(regrowT<=0){regrowT=5;const now=performance.now()/1000;for(const id of [...deadRes]){const o=RES[id];if(o.respawnAt&&now>o.respawnAt&&Math.hypot(o.x-P.x,o.z-P.z)>20){showRes(o);deadRes.delete(id);}}}
 updDusk();updNPCs(dt);updTraders(dt);updFires(dt);
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
  const u=useTarget();$('useL').textContent=u?u.l:'USE';const pr=$('prompt');if(u&&!isTouch){pr.textContent='E: '+u.l;pr.classList.remove('hidden');}else pr.classList.add('hidden');
  if(P.fig&&armorKey()!==(P._ak||''))applyChar(false);if(!$('fullMap').classList.contains('hidden'))drawMap($('fullMapCan'),0,0,W*2,false);updTraderArrow();$('bShoot').style.display=has('bow')?'flex':'none';$('bBlock').style.display=(has('shield')||has('guard_shield'))?'flex':'none';equipVisual();drawMap($('minimap'),P.x,P.z,110,true);renderHot();}
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
const NOBLOCK=new Set(['trap','bear_trap','tar_pit','trench']);
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
   if(best){const ang=Math.atan2(best.x-s.x,best.z-s.z);h.rotation.y=ang-(s.mesh.rotation.y||0);if((s.ammo||0)>0&&!(s.cd>0)){s.ammo--;s.cd=1.3;shoot('player',s.x+Math.sin(ang)*.8,s.z+Math.cos(ang)*.8,ang,26,18,0xd8c8a0,.18,1.3);tone(500,.08,'square',.05,200);}}}
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
function startMove(s){if(!s||moving)return false;if(P.tower===s)climbDown();moving={s,ox:s.x,oz:s.z,orot:s.rot||0};
 const i=structs.indexOf(s);if(i>=0)structs.splice(i,1);scene.remove(s.mesh);if(s.ring){scene.remove(s.ring);s.ring=null;s.ringR=-1;}
 moveGhost=structMesh(s.type,s.lvl);moveGhost.traverse(o=>{if(o.isMesh){o.material=moveRedMat;o.castShadow=false;}if(o.isLight)o.visible=false;});
 moveRing=new THREE.Mesh(new THREE.RingGeometry(.92,1.08,40),moveRingMat);moveRing.rotation.x=-Math.PI/2;scene.add(moveGhost,moveRing);
 toast('📦 Moving '+nm(s.type)+'<br>Click / E / PLACE to put it down · R rotate · Esc to put it back',3);updMoveGhost();return true;}
function movePos(){return placePos(moving.s.type);}
function moveValid(){return moving&&placeOk(moving.s.type,movePos());}
function updMoveGhost(){const show=moving&&true;for(const id of ['bPlace','bCancel']){const el=$(id);if(el)el.style.display=show?'flex':'none';}
 const bp=$('bPick');if(bp)bp.style.display=!moving&&movableNear()?'flex':'none';
 if(!moving||!moveGhost)return;const p=movePos(),ok=moveValid();moveGhost.position.set(p.x,H(p.x,p.z)+.03,p.z);moveGhost.rotation.y=p.rot;
 moveRing.position.set(p.x,H(p.x,p.z)+.14,p.z);const rr=(SEG[moving.s.type]?1.25:(SR[moving.s.type]??.6)+.45);moveRing.scale.setScalar(rr);moveRingMat.color.setHex(ok?0x2bff5a:0xff2020);moveRingMat.opacity=.75+.25*Math.sin(performance.now()/180);}
function restoreMove(x,z,rot){const s=moving.s;const ns=placeStruct(s.type,x,z,{rot,tier:s.tier,fuel:s.fuel,lvl:s.lvl,hp:s.hp,open:s.open,ammo:s.ammo});if(s.type==='bench'&&ns.tier!==s.tier){ns.tier=s.tier;benchLook(ns);}cleanupMove();save();return ns;}
function cleanupMove(){if(moveGhost)scene.remove(moveGhost);if(moveRing)scene.remove(moveRing);moveGhost=moveRing=null;moving=null;for(const id of ['bPlace','bCancel']){const el=$(id);if(el)el.style.display='none';}}
function placeMove(){if(!moving)return false;if(!moveValid()){toast('🔴 No room there — find a clear spot (green ring)');tone(160,.15,'square',.1);return false;}const p=movePos(),nmv=moving.s.type;restoreMove(p.x,p.z,p.rot);toast('📦 Placed '+nm(nmv));sfx.craft();return true;}
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
function tickRaid(dt){if(!raidQ.length)return;let w=0;for(const q of raidQ){q.t-=dt;if(q.t<=0&&!q.done){q.done=1;spawnCult(q.kind);w=q.wave;}}if(w){toast('⚔️ Forest Soldier wave '+w+' has arrived!',2);tone(110,.5,'sawtooth',.15,60);}raidQ=raidQ.filter(q=>!q.done);}
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
function jump(){if(P.tower)return;if(P.dead||paused||P.jy>0.01||P.vy>0)return;P.vy=7.6;P.jy=.001;tone(330,.12,'triangle',.08,620);}
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
SHOP.forest={berries:1,cooked_meat:5,waterskin:12,torch:2};SHOP.defense={spike_barricade:18,wall:12,gate:22,thorn_wall:45,iron_wall:38,flame_trap:55,alarm_bell:30,watchtower:70,turret:95,ammo_bundle:15,shield:40,guard_shield:85};
const FSELL={raw_meat:3,cooked_meat:5,hide:6,wood:2,stone:2,berries:2,fiber:1,feather:3,cactus_fruit:3};
function traderFig(kind){let f,cart=null;
 if(kind==='forest'){f=makeHuman({skin:0xc68642,shirt:0x3a6a2e,pants:0x5a4228,hair:0x2a1a0c,hat:'straw'});const pack=new THREE.Group();const pm=new THREE.MeshStandardMaterial({color:0x8a6a42});part(pack,BX,pm,0,0,0,.5,.55,.25);pack.position.set(0,1.25,-.28);f.add(pack);const L=new THREE.PointLight(0xffc060,18,13,1.4);L.position.set(.5,1.6,.3);f.add(L);}
 else{f=makeHuman({skin:0xe8b890,shirt:0x6a3a1e,pants:0x333a44,hair:0x888888,hat:'cap',hatCol:0x3a5a8a});cart=new THREE.Group();const wm=new THREE.MeshStandardMaterial({color:0x7a5230});part(cart,BX,wm,0,.65,0,1.7,.55,1);for(const [x,z] of [[-.7,-.45],[.7,-.45],[-.7,.45],[.7,.45]]){const w=new THREE.Mesh(new THREE.CylinderGeometry(.3,.3,.08,12),new THREE.MeshStandardMaterial({color:0x3a2a1a}));w.rotation.z=Math.PI/2;w.position.set(x,.3,z);cart.add(w);}part(cart,BX,new THREE.MeshStandardMaterial({color:0x5a5e66,metalness:.6}),0,1,.1,.8,.25,.6);scene.add(cart);}
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
 const tr={...t,x,z,fig:f,cart,pack,dir:rnd(0,6.28),tx:x,tz:z,wait:1,alive:true,atCamp:false};
 {const cs=pickCampSpot(kind,x,z);tr.campX=cs.x;tr.campZ=cs.z;tr.fireX=cs.fx;tr.fireZ=cs.fz;tr.tx=cs.x;tr.tz=cs.z;
  if(kind==='forest'){const prop=new THREE.Group();const roll=new THREE.Mesh(new THREE.CylinderGeometry(.22,.22,1.5,10),new THREE.MeshStandardMaterial({color:0xa03028}));roll.rotation.z=Math.PI/2;roll.position.y=.22;prop.add(roll);const pil=new THREE.Mesh(new THREE.BoxGeometry(.4,.16,.3),new THREE.MeshStandardMaterial({color:0xe8e0cc}));pil.position.set(-.55,.32,0);prop.add(pil);prop.visible=false;scene.add(prop);tr.prop=prop;}}
 TRADERS.push(tr);
 toast(kind==='forest'?'🧺 Fern has arrived in the forest — she’s heading to your campfire! Follow the 🧺 edge arrow or the map (M).':'🛡️ Bram the Defense Trader has arrived — he’s rolling to your campfire! Follow the 🛡️ edge arrow or the map (M).',4);return tr;}
function despawnTrader(tr,msg){if(!msg)msg=tr.kind==='forest'?'🧺 Fern has left — her lantern fades into the trees.':'🛡️ Bram has left — his cart rumbles away.';tr.alive=false;scene.remove(tr.fig);if(tr.cart)scene.remove(tr.cart);if(tr.pack)scene.remove(tr.pack);if(tr.prop)scene.remove(tr.prop);const i=TRADERS.indexOf(tr);if(i>=0)TRADERS.splice(i,1);if(msg)toast(msg,3);}
function updTraders(dt){ftJingle-=dt;const h=clockHr();
 if(night()&&day%2===0&&ftDay!==day){const tr=spawnTrader('forest');if(tr)ftDay=day;}
 if(!night()&&h>=8&&h<17.5&&day%3===0&&dtDay!==day){const tr=spawnTrader('defense');if(tr)dtDay=day;}
 for(const tr of [...TRADERS]){const dp=Math.hypot(tr.x-P.x,tr.z-P.z);
  if(dp>95){despawnTrader(tr);continue;}
  if(tr.kind==='forest'&&!night()){despawnTrader(tr,'🌅 Fern waves, whistles for Biscuit, and melts into the dawn trees. “Same time in two nights!”');continue;}
  if(tr.kind==='defense'&&(night()||h>=17.5)){despawnTrader(tr,'🌇 Bram tips his cap. “Barricade o’clock is over — see you in a few days.”');continue;}
  if(tr.kind==='forest'&&dp<17&&ftJingle<=0){ftJingle=7;tone(1560,.25,'sine',.05);setTimeout(()=>tone(1180,.3,'sine',.04),140);}
  tr.wait-=dt;let mv=0;
  if(!tr.atCamp){tr.tx=tr.campX;tr.tz=tr.campZ;if(Math.hypot(tr.campX-tr.x,tr.campZ-tr.z)<.8){tr.atCamp=true;tr.wait=1;
    if(tr.prop){tr.prop.position.set(tr.campX+Math.cos(Math.atan2(tr.fireX-tr.campX,tr.fireZ-tr.campZ))*.9,H(tr.campX,tr.campZ),tr.campZ-Math.sin(Math.atan2(tr.fireX-tr.campX,tr.fireZ-tr.campZ))*.9);tr.prop.rotation.y=Math.atan2(tr.fireX-tr.campX,tr.fireZ-tr.campZ);tr.prop.visible=true;}
    toast(tr.kind==='forest'?'🧺 Fern has set up by your campfire — lantern lit, bedroll out. Trade any time tonight!':'🛡️ Bram has parked his cart by your campfire — defence goods on sale till dusk!',3.5);}}
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
function talkTrader(tr){const n=tr;say(n,tr.kind==='forest'?'Evening, friend! Fern’s the name — I buy what the forest gives: meat, hides, wood, stone, berries… at honest prices.':'Bram. I sell things that keep soldiers on the wrong side of your fence.',[
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
 ['Sleep, eat & drink to survive the night',false]];}
function updSteps(){const el=$('firstSteps');if(!el)return;if(!stepsShown||stepsOff){el.classList.add('hidden');return;}el.classList.remove('hidden');const L=stepList();$('stepsBody').innerHTML=L.map(([t,d])=>`<div>${d?'✅':'⬜'} ${t}</div>`).join('');if(L.slice(0,5).every(x=>x[1])){stepsOff=true;el.classList.add('hidden');toast('🎉 First steps done — good luck, survivor!');}}

// ---------- start ----------
function startGame(cont){audio();MUS.init();$('title').classList.add('hidden');$('hud').classList.remove('hidden');
 if(!P.fig){P.fig=makeHuman(charLook());P._ak=armorKey();scene.add(P.fig);const hn=$('charNameHud');if(hn)hn.textContent='👤 '+CHAR.name;}
 if(!cont&&!running){}running=true;paused=false;clock.getDelta();camera.position.set(P.x,20,P.z+14);
 if(!cont){stepsShown=!stepsOff;}if(!cont)toast('🏕️ Welcome! Punch trees (10 hits), grab pebbles & bushes, then craft an axe and a pickaxe.<br>Oakhollow village is to the south-east.',6);
 if(isTouch&&!matchMedia('(display-mode: standalone)').matches&&!navigator.standalone)setTimeout(()=>toast('Tip: Share → Add to Home Screen for full-screen play',4),7000);}
function newGame(){if(localStorage.getItem(SAVE_KEY)&&!confirm('Start a new game? Your saved camp will be erased.'))return;localStorage.removeItem(SAVE_KEY);location.hash='new';location.reload();}
$('bNew').onclick=()=>{if(running||P.fig||localStorage.getItem(SAVE_KEY))return newGame();startGame(false);};
$('bCont').onclick=()=>startGame(true);
if(isTouch)$('rot').classList.add('need');
if(/iPhone|iPad/.test(navigator.userAgent)&&!navigator.standalone)$('iosHint').textContent='iPhone: tap Share → Add to Home Screen to play full screen & offline.';
Promise.resolve().then(()=>{buildVillages();buildBossLairs();buildTreasure();spawnNPCs();const ok=load();if(!ok&&!structs.some(s=>s.main))placeStruct('campfire',0,-1.5,{main:1,fuel:60});$('loadMsg').textContent=ok?'Saved camp found · Day '+day:'Ready!';$('bCont').disabled=!ok;$('bNew').disabled=false;
 if(location.hash==='#new'){history.replaceState(null,'',location.pathname);startGame(false);}window.__ready=true;}).catch(e=>{$('loadMsg').textContent='Load error: '+e.message;});
loop();
if('serviceWorker' in navigator&&location.protocol==='https:')navigator.serviceWorker.register('sw.js');
// test hooks
window.__game={pickCampSpot,updTraderArrow,TRADERS,spawnTrader,despawnTrader,talkTrader,FSELL,updTraders,get ftDay(){return ftDay;},get dtDay(){return dtDay;},showHow,closeHow,updSteps,stepList,clockHr,get duskF(){return duskF;},updDusk,lightsOn,get stepsShown(){return stepsShown;},SAFEU,addSafeShader,CHAR:()=>CHAR,charLook,applyChar,openChar,closeChar,randomChar,HATS,armorKey,craftAll,maxCrafts,startMove,placeMove,cancelMove,movableNear,moveValid,raidNumFor,nextRaidDay,raidHudTxt,get moving(){return moving;},get moveGhost(){return moveGhost;},get moveRing(){return moveRing;},safeBlue,DEF,SEG,segDist,dmgStruct,slowAt,climb,climbDown,toggleGate,loadTurret,repairStruct,updDefenses,get raidQ(){return raidQ;},spawnCult,tickRaid,placePos,placeOk,rotGhost,get ghostType(){return ghostType;},get ghost(){return ghost;},get bellRang(){return bellRang;},setBlock:v=>{mBlock=v;},hurtPlayer,blocked,setCam:v=>{camDist=v;},MUS,pickTheme,FLV,upFire,openFire,renderFire,litFire,fireLight,fireFill,get curFire(){return curFire;},TCH,openTreasure,startRaid,jump,cultTick,get raidDay(){return raidDay;},get day(){return day;},set day(v){day=v;},pBlocked,P,get inv(){return inv;},set inv(v){inv=v;},RES,animals:()=>animals,get boss(){return boss;},BOSSES,VILLAGES,NPCS,structs,biomeAt,doAttack,gather,talk,useTarget,spawnAnimal,hitBoss,quests:()=>quests,revealed:()=>revealed,bossDone:()=>bossDone,kills:()=>kills,add,save,teleport:(x,z)=>{P.x=x;P.z=z;},setPaused:v=>paused=v,night,setDay:t=>dayT=t,closeDlg:endTalk,endTalk,startGame,get slots(){return slots;},cg,matchGrid,craftOut,fillRecipe,RECIPES,openBag,closeBag,renderBag,useSlot,get selHot(){return selHot;},set selHot(v){selHot=v;},fuelFire,fireR,litAt,openShop,get coins(){return coins;},set coins(v){coins=v;},cnt,curTier,placeStruct,questList,addItem};
Object.assign(window.__game,{project:(x,z)=>{V.set(x,H(x,z)+1,z).project(camera);return{x:(V.x+1)/2*innerWidth,y:(1-V.y)/2*innerHeight};},camDist:()=>camDist,camYaw:()=>camYaw});
