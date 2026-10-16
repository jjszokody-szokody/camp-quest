// Camp Quest: Four Realms — built on the Tribute Arena engine (three.js + Quaternius CC0 models, figure/animal rigs, crafting style)
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {MeshoptDecoder} from 'three/addons/libs/meshopt_decoder.module.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
const $=id=>document.getElementById(id);
const isTouch=matchMedia('(pointer:coarse)').matches||'ontouchstart' in window;
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
 {id:'yeti',biome:'snow',name:'Yeti King',x:30,z:-252,model:'Viking_Male',scale:3,look:{cloth:0xffffff,skin:0xdde8f2,hair:0xffffff},tint:0xcfe8ff,hp:700,dmg:20,proj:0xbfe6ff,attacks:['slam','volley','charge','summon'],minion:'snow_fox',trophy:'yeti_fang',loot:{crystal:4,iron:4,hide:6}},
 {id:'vine',biome:'jungle',name:'Vine Queen',x:250,z:-40,model:'Witch',scale:3,look:{cloth:0x2e8b2e,hair:0x145214},tint:0x8fff8f,hp:750,dmg:18,proj:0x66ff44,attacks:['ring','volley','summon','slam'],minion:'snake',trophy:'vine_heart',loot:{feather:6,gold:4,fiber:10}},
 {id:'pharaoh',biome:'desert',name:'Sand Pharaoh',x:-40,z:250,model:'Kimono_Male',scale:3,look:{cloth:0xd4af37,skin:0xc49a5a,hair:0x222222},tint:0xffe08a,hp:800,dmg:20,proj:0xf2c55a,attacks:['teleport','spiral','summon','volley'],minion:'scorpion',trophy:'pharaoh_ankh',loot:{gold:8,hide:4}},
 {id:'titan',biome:'lava',name:'Magma Titan',x:-252,z:40,model:'Knight_Golden_Female',scale:3.4,look:{cloth:0x8a1a0a,skin:0x5a2010,hair:0xff5a00},tint:0xff6a3a,emis:0xff3300,hp:950,dmg:24,proj:0xff5a1a,attacks:['meteor','slam','ring','charge'],minion:'salamander',trophy:'magma_core',loot:{obsidian:6,gold:5}}];
addPonds('forest',7,4,8);addPonds('jungle',8,4,9);addPonds('desert',3,3,5);addPonds('snow',3,4,7);addPonds('lava',16,3,8);
PONDS.push({x:-12,z:9,r:4.5});
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
renderer.setPixelRatio(Math.min(devicePixelRatio,isTouch?1.5:2));renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;
document.body.prepend(renderer.domElement);
const scene=new THREE.Scene();scene.fog=new THREE.Fog(0x9cc7a0,40,95);scene.background=new THREE.Color(0x9cc7a0);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,.5,220);
const hemi=new THREE.HemisphereLight(0xdfefff,0x4a3a2a,.9);scene.add(hemi);
const sun=new THREE.DirectionalLight(0xfff1d6,2.2);sun.castShadow=true;sun.shadow.mapSize.set(isTouch?1024:2048,isTouch?1024:2048);
Object.assign(sun.shadow.camera,{left:-30,right:30,top:30,bottom:-30,near:1,far:120});sun.shadow.bias=-.0006;scene.add(sun,sun.target);
const fireLight=new THREE.PointLight(0xff9a40,0,22,1.6);scene.add(fireLight);
const torchLight=new THREE.PointLight(0xffb060,0,16,1.6);scene.add(torchLight);
addEventListener('resize',()=>{renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();});
const tl=new THREE.TextureLoader();
function tex(n,rep){const t=tl.load('assets/tex/'+n);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rep,rep);t.colorSpace=THREE.SRGBColorSpace;return t;}
// detail noise texture for ground
const nc=document.createElement('canvas');nc.width=nc.height=128;{const g=nc.getContext('2d'),id=g.createImageData(128,128);for(let i=0;i<128*128;i++){const v=200+Math.random()*55;id.data[i*4]=id.data[i*4+1]=id.data[i*4+2]=v;id.data[i*4+3]=255;}g.putImageData(id,0,0);}
const ntex=new THREE.CanvasTexture(nc);ntex.wrapS=ntex.wrapT=THREE.RepeatWrapping;ntex.repeat.set(160,160);ntex.colorSpace=THREE.SRGBColorSpace;
// ground
{const seg=isTouch?180:240,geo=new THREE.PlaneGeometry(W*2,W*2,seg,seg);geo.rotateX(-Math.PI/2);const pos=geo.attributes.position,col=new Float32Array(pos.count*3),c=new THREE.Color(),c2=new THREE.Color();
 for(let i=0;i<pos.count;i++){const x=pos.getX(i),z=pos.getZ(i),y=H(x,z);pos.setY(i,y);const b=BIOME[biomeAt(x,z)];c.setHex(b.c[0]).lerp(c2.setHex(b.c[1]),.5+.5*Math.sin(x*.21)*Math.cos(z*.17));
  if(inPond(x,z,1.2))c.lerp(c2.setHex(0x8a7a50),.6);if(LAVA.some(p=>Math.hypot(x-p.x,z-p.z)<p.r+1.5))c.lerp(c2.setHex(0x1a0f0a),.7);
  if(biomeAt(x,z)==='snow'&&y>4)c.lerp(c2.setHex(0xffffff),.5);if(Math.abs(x)>W-6||Math.abs(z)>W-6)c.multiplyScalar(.4);
  col[i*3]=c.r;col[i*3+1]=c.g;col[i*3+2]=c.b;}
 geo.setAttribute('color',new THREE.BufferAttribute(col,3));geo.computeVertexNormals();
 const g=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({vertexColors:true,map:ntex,roughness:.95}));g.receiveShadow=true;scene.add(g);}
// water and lava
const waterMat=new THREE.MeshStandardMaterial({color:0x3a8ec8,transparent:true,opacity:.8,roughness:.15,metalness:.1});
const iceMat=new THREE.MeshStandardMaterial({color:0xbfe4f5,roughness:.2});
const lavaMat=new THREE.MeshBasicMaterial({color:0xff5a10});
for(const p of PONDS){const m=new THREE.Mesh(new THREE.CircleGeometry(p.r+.6,28),biomeAt(p.x,p.z)==='snow'?iceMat:waterMat);m.rotation.x=-Math.PI/2;m.position.set(p.x,-.55,p.z);m.receiveShadow=true;scene.add(m);}
for(const p of LAVA){const m=new THREE.Mesh(new THREE.CircleGeometry(p.r+.4,24),lavaMat);m.rotation.x=-Math.PI/2;m.position.set(p.x,-.25,p.z);scene.add(m);p.mesh=m;}
// world border
{const m=new THREE.Mesh(new THREE.BoxGeometry(W*2,6,1),new THREE.MeshStandardMaterial({color:0x2a2a2a}));for(const [x,z,r] of [[0,-W,0],[0,W,0],[W,0,1],[-W,0,1]]){const b=m.clone();b.position.set(x,2,z);b.rotation.y=r*Math.PI/2;scene.add(b);}}

// ---------- models (Tribute Arena rig code) ----------
const MODELS={};const loader=new GLTFLoader();loader.setMeshoptDecoder(MeshoptDecoder);
const NEED=['Worker_Male','Viking_Male','Witch','Kimono_Male','Knight_Golden_Female','Casual_Male','Cowboy_Female','Elf','Casual3_Female','Wolf','Deer','Boar'];
const ANIMALM=['Wolf','Deer','Boar'];
let loaded=0;
const loadP=Promise.all(NEED.map(n=>new Promise((res,rej)=>loader.load('assets/models/'+n+'.glb',g=>{g.scene.updateMatrixWorld(true);const b=new THREE.Box3().setFromObject(g.scene,ANIMALM.includes(n));g.h=b.max.y-b.min.y;MODELS[n]=g;loaded++;$('loadMsg').textContent='Loading '+loaded+'/'+NEED.length;res();},undefined,rej))));
const CLOTH=/Shirt|Pants|Jacket|Top|Scarf|Main|Clothes|Vest|Beige|DarkGreen|Light|Band|Belt|Dress|Robe|Kimono|Armor|Gold/,HAIRM=/Hair/,SKINM=/^Skin$/;
function findClip(anims,n){return anims.find(c=>c.name===n)||anims.find(c=>c.name.endsWith('|'+n));}
function makeFigure(o){const g=MODELS[o.model],root=new THREE.Group(),obj=SkeletonUtils.clone(g.scene);root.add(obj);
 const k=1.8/g.h*(o.scale||1);obj.scale.setScalar(k);const mats=[];
 obj.traverse(n=>{if(n.isMesh){n.castShadow=true;n.frustumCulled=false;let m=n.material.clone();
  if(o.cloth!==undefined&&CLOTH.test(m.name))m.color.lerp(new THREE.Color(o.cloth),.7);
  if(o.skin!==undefined&&SKINM.test(m.name))m.color.set(o.skin);
  if(o.hair!==undefined&&HAIRM.test(m.name))m.color.set(o.hair);
  if(o.tint)m.color.lerp(new THREE.Color(o.tint),.35);
  if(o.emis){m.emissive=new THREE.Color(o.emis);m.emissiveIntensity=.35;}
  m.metalness=Math.min(m.metalness??0,.2);n.material=m;mats.push(m);}});
 const mixer=new THREE.AnimationMixer(obj),acts={};
 const map={idle:'Idle',walk:'Walk',run:'Run',slash:'SwordSlash',punch:'Punch',death:'Death',hit:'RecieveHit'};
 for(const kk in map){const clip=THREE.AnimationClip.findByName(g.animations,map[kk]);if(!clip)continue;const a=mixer.clipAction(clip);acts[kk]=a;
  if(['slash','punch','death','hit'].includes(kk)){a.setLoop(THREE.LoopOnce);a.clampWhenFinished=true;}else{a.play();a.setEffectiveWeight(kk==='idle'?1:0);}}
 root.userData={obj,mixer,acts,cur:'idle',mats,hand:obj.getObjectByName('FistR')||obj.getObjectByName('Fist.R'),oneShot:0,h:1.8*(o.scale||1)};return root;}
function setAnim(f,name,speed=1){const u=f.userData;if(u.oneShot>0||!u.acts[name])return;if(u.cur!==name){const from=u.acts[u.cur],to=u.acts[name];to.enabled=true;to.setEffectiveTimeScale(1);to.setEffectiveWeight(1);if(!to.isRunning())to.play();if(from)from.crossFadeTo(to,.25,true);u.cur=name;}u.acts[name].setEffectiveTimeScale(speed);}
function playOnce(f,name,dur){const u=f.userData,a=u.acts[name];if(!a)return;const from=u.acts[u.cur];a.reset();a.enabled=true;a.setEffectiveWeight(1);a.setEffectiveTimeScale(a.getClip().duration/dur);a.play();if(from&&from!==a)from.crossFadeTo(a,.1,false);u.cur=name;u.oneShot=dur;}
function tickFig(f,dt){const u=f.userData;if(u.oneShot>0){u.oneShot-=dt;if(u.oneShot<=0&&u.cur!=='death'){u.oneShot=0;const a=u.acts[u.cur],to=u.acts.idle;to.enabled=true;to.setEffectiveWeight(1);to.play();a.crossFadeTo(to,.2,false);u.cur='idle';}}u.mixer&&u.mixer.update(dt);}
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
const sfx={chop:()=>tone(180,.08,'square',.12,90),mine:()=>tone(900,.06,'square',.1,600),hit:()=>tone(140,.12,'sawtooth',.15,60),hurt:()=>tone(300,.18,'sawtooth',.15,120),craft:()=>{tone(520,.08,'triangle',.15);setTimeout(()=>tone(780,.12,'triangle',.15),80);},boss:()=>tone(70,.6,'sawtooth',.25,40),win:()=>[523,659,784,1046].forEach((f,i)=>setTimeout(()=>tone(f,.25,'triangle',.2),i*140)),eat:()=>tone(260,.1,'sine',.15,320),shoot:()=>tone(700,.1,'triangle',.12,300)};

// ---------- items & recipes ----------
const ITEMS={wood:'🪵 Wood',stone:'🪨 Stone',fiber:'🌿 Fiber',berries:'🫐 Berries',raw_meat:'🥩 Raw meat',cooked_meat:'🍖 Cooked meat',hide:'🟫 Hide',feather:'🪶 Feather',iron:'⛓️ Iron ore',gold:'🟡 Gold',crystal:'💎 Ice crystal',obsidian:'⬛ Obsidian',arrows:'➶ Arrows',cactus_fruit:'🌵 Cactus fruit',bandage:'🩹 Bandage',
 axe:'🪓 Stone axe',pickaxe:'⛏️ Stone pickaxe',iron_pickaxe:'⛏️ Iron pickaxe',iron_axe:'🪓 Iron axe',stone_sword:'🗡️ Stone sword',iron_sword:'⚔️ Iron sword',obsidian_blade:'🔪 Obsidian blade',spear:'🔱 Spear',bow:'🏹 Bow',hide_armor:'🦺 Hide armor',iron_armor:'🛡️ Iron armor',cold_gear:'🧥 Cold gear (fur coat)',heat_gear:'🥵 Heat gear (ember cloak)',torch:'🔦 Torch',waterskin:'💧 Waterskin',
 yeti_fang:'🦷 Yeti Fang',vine_heart:'💚 Vine Heart',pharaoh_ankh:'☥ Pharaoh Ankh',magma_core:'🔥 Magma Core',crown:'👑 Crown of Four Realms'};
const TOOLS=['axe','pickaxe','iron_pickaxe','iron_axe','stone_sword','iron_sword','obsidian_blade','spear','bow','hide_armor','iron_armor','cold_gear','heat_gear','torch','waterskin','crown'];
const RECIPES=[
 {id:'axe',cost:{wood:3,stone:2,fiber:2},d:'Chops trees in 5 hits (fists take 10).'},
 {id:'pickaxe',cost:{wood:3,stone:3,fiber:2},d:'Required to mine stone, iron and gold.'},
 {id:'torch',cost:{wood:2,fiber:1},d:'Light + a little warmth at night.'},
 {id:'campfire',place:1,cost:{wood:5,stone:3},d:'Warmth, light, cook meat, safe zone.'},
 {id:'bench',place:1,cost:{wood:8,stone:4},d:'Crafting bench: unlocks advanced recipes nearby.'},
 {id:'tent',place:1,cost:{wood:6,hide:3,fiber:6},d:'Sleep through the night; sets your respawn point.'},
 {id:'chest',place:1,cost:{wood:10,fiber:2},bench:1,d:'Storage chest for your camp.'},
 {id:'spear',cost:{wood:4,stone:2,fiber:2},d:'Long reach, 16 damage.'},
 {id:'bandage',cost:{fiber:4,berries:2},d:'Heals 30 health.'},
 {id:'waterskin',cost:{hide:2,fiber:2},d:'Carry 5 drinks. Refill at water.'},
 {id:'stone_sword',cost:{wood:2,stone:5,fiber:2},bench:1,d:'20 damage.'},
 {id:'bow',cost:{wood:5,fiber:6},bench:1,d:'Shoot arrows (🏹 button).'},
 {id:'arrows',n:6,cost:{wood:2,stone:1,feather:1},bench:1,d:'6 arrows.'},
 {id:'hide_armor',cost:{hide:5,fiber:4},bench:1,d:'Blocks 25% damage.'},
 {id:'cold_gear',cost:{hide:4,fiber:4,wood:2},bench:1,d:'Needed to survive the freezing Snowy Mountains.'},
 {id:'heat_gear',cost:{hide:3,fiber:6,iron:2},bench:1,d:'Needed for Desert heat & Volcanic Lands.'},
 {id:'iron_pickaxe',cost:{wood:2,iron:4},bench:1,d:'Mines ice crystal & obsidian; mines faster.'},
 {id:'iron_axe',cost:{wood:2,iron:3},bench:1,d:'Chops trees in 3 hits.'},
 {id:'iron_sword',cost:{wood:2,iron:6},bench:1,d:'32 damage.'},
 {id:'iron_armor',cost:{iron:8,hide:2},bench:1,d:'Blocks 50% damage.'},
 {id:'obsidian_blade',cost:{obsidian:5,crystal:2,wood:2},bench:1,d:'45 damage, the best blade.'},
];
const WEAP={fists:{d:6,r:1.7},axe:{d:9,r:1.9},iron_axe:{d:12,r:1.9},pickaxe:{d:8,r:1.9},iron_pickaxe:{d:11,r:1.9},spear:{d:16,r:3},stone_sword:{d:20,r:2.2},iron_sword:{d:32,r:2.3},obsidian_blade:{d:45,r:2.4}};
let inv={},chest={},structs=[];
const has=(k,n=1)=>(inv[k]||0)>=n;const add=(k,n=1)=>{inv[k]=(inv[k]||0)+n;if(inv[k]<=0)delete inv[k];};
function bestWeapon(){let b='fists';for(const k of ['axe','pickaxe','iron_axe','iron_pickaxe','spear','stone_sword','iron_sword','obsidian_blade'])if(has(k)&&WEAP[k].d>WEAP[b].d)b=k;return b;}
const armorPct=()=>has('iron_armor')?.5:has('hide_armor')?.25:0;

// ---------- resources (instanced) ----------
const RES=[];const GRID=new Map(),GC=8;const gk=(x,z)=>Math.floor(x/GC)*10007+Math.floor(z/GC);
function gridAdd(o){const k=gk(o.x,o.z);let a=GRID.get(k);if(!a)GRID.set(k,a=[]);a.push(o);}
function near(x,z,r){const out=[];for(let i=Math.floor((x-r)/GC);i<=Math.floor((x+r)/GC);i++)for(let j=Math.floor((z-r)/GC);j<=Math.floor((z+r)/GC);j++){const a=GRID.get(i*10007+j);if(a)for(const o of a)out.push(o);}return out;}
const RTYPES={tree:{hp:10,r:.7},rock:{hp:4,r:1,pick:1},iron:{hp:5,r:1,pick:1},gold:{hp:5,r:1,pick:1},crystal:{hp:6,r:1,pick:2},obsidian:{hp:6,r:1,pick:2},pebble:{hp:1,r:.3},bush:{hp:2,r:.6},cactus:{hp:3,r:.5}};
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
 const barkM=new THREE.MeshStandardMaterial({map:tex('bark_c.jpg',1),roughness:.9});
 mkIM('trunk',new THREE.CylinderGeometry(.22,.32,1,7).translate(0,.5,0),barkM,trees,(o,i,m)=>{const h=o.b==='jungle'?6:o.b==='snow'?2.2:o.b==='lava'?3.2:3;setM(m,i,o.x,H(o.x,o.z)-.1,o.z,o.s*(o.b==='jungle'?1.2:1),h*o.s,o.s*(o.b==='jungle'?1.2:1),o.rot);m.setColorAt(i,C.setHex(o.b==='lava'?0x333030:o.b==='desert'?0xb09070:0xffffff));});
 const pines=trees.filter(o=>o.b==='snow'||(o.b==='forest'&&o.id%3===0)),rounds=trees.filter(o=>!pines.includes(o));
 mkIM('pine',new THREE.ConeGeometry(1.5,4,8).translate(0,2,0),new THREE.MeshStandardMaterial({roughness:.85,flatShading:true}),pines,(o,i,m)=>{setM(m,i,o.x,H(o.x,o.z)+(o.b==='snow'?1.6:2)*o.s,o.z,o.s,o.s*1.1,o.s,o.rot);m.setColorAt(i,C.setHex(o.b==='snow'?0x9fb8a8:0x2f6a3a));});
 mkIM('round',new THREE.IcosahedronGeometry(1.8,1),new THREE.MeshStandardMaterial({roughness:.85,flatShading:true}),rounds,(o,i,m)=>{const b=o.b;const y=b==='jungle'?6.2:b==='lava'?3.2:3.6;const sx=b==='jungle'?1.5:b==='desert'?1.5:b==='lava'?.5:1,sy=b==='desert'?.35:b==='jungle'?.7:b==='lava'?.4:1;setM(m,i,o.x,H(o.x,o.z)+y*o.s,o.z,sx*o.s,sy*o.s,sx*o.s,o.rot);m.setColorAt(i,C.setHex(b==='jungle'?0x1f8a2a:b==='desert'?0x7a8a3a:b==='lava'?0xff5a1a:(o.id%2?0x4a9a3a:0x3d8a32)));});
 const rockM=new THREE.MeshStandardMaterial({map:tex('rock_c.jpg',1),roughness:.9,flatShading:true});
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
 for(const k in IM)IM[k].computeBoundingSphere();}
buildRes();
function hideRes(o){for(const [m,i] of o.im||[]){m.setMatrixAt(i,M4.makeScale(0,0,0));m.instanceMatrix.needsUpdate=true;}}
function showRes(o){o.alive=true;o.hp=RTYPES[o.type].hp;o.respawnAt=0;// rebuild matrix by simple re-place
 for(const [m,i] of o.im||[])m.setMatrixAt(i,o.mat0?.[m.uuid]||M4.identity());for(const [m] of o.im||[])m.instanceMatrix.needsUpdate=true;}
for(const o of RES)if(o.im){o.mat0={};for(const [m,i] of o.im){const mm=new THREE.Matrix4();m.getMatrixAt(i,mm);o.mat0[m.uuid]=mm;}}

// ---------- villages ----------
const NPCS=[];
const hutWall=new THREE.MeshStandardMaterial({color:0xb08a5a,roughness:.9}),hutRoof={forest:0x7a3a20,snow:0xeeeeff,jungle:0x6a8a2a,desert:0xd8b070,lava:0x3a2a2a};
const TRADES={
 oak:[{give:{hide:2},get:{iron:1}},{give:{wood:10},get:{arrows:6}},{give:{berries:6},get:{cooked_meat:2}},{give:{raw_meat:3},get:{bandage:1}}],
 frost:[{give:{raw_meat:5,hide:2},get:{cold_gear:1}},{give:{iron:2},get:{crystal:1}},{give:{wood:6},get:{cooked_meat:2}}],
 vine:[{give:{gold:2},get:{bow:1}},{give:{hide:2},get:{feather:3}},{give:{wood:5},get:{berries:6}}],
 sand:[{give:{gold:3},get:{heat_gear:1}},{give:{hide:2},get:{waterskin:1}},{give:{cactus_fruit:3},get:{iron:1}}],
 ember:[{give:{gold:3},get:{iron_pickaxe:1}},{give:{iron:3},get:{obsidian:2}},{give:{hide:3},get:{bandage:2}}]};
const QUESTS={
 oak:[{t:'fetch',item:'wood',n:10,txt:'Our fires are dying! Bring 10 wood.',rew:{cooked_meat:4,iron:2},reveal:null},{t:'hunt',kind:'wolf',n:3,txt:'Wolves keep attacking our village. Hunt 3 wolves.',rew:{bow:1,arrows:12},reveal:'all'}],
 frost:[{t:'hunt',kind:'polar_bear',n:2,txt:'Defeat 2 polar bears so our hunters can travel.',rew:{crystal:2,cooked_meat:3},reveal:'yeti'},{t:'boss',boss:'yeti',txt:'Defeat the Yeti King in the northern peaks!',rew:{gold:5,iron:6}}],
 vine:[{t:'fetch',item:'feather',n:5,txt:'Bring me 5 feathers from the jungle parrots.',rew:{arrows:10,berries:6},reveal:'vine'},{t:'boss',boss:'vine',txt:'The Vine Queen is choking the jungle. Defeat her!',rew:{gold:6}}],
 sand:[{t:'hunt',kind:'scorpion',n:4,txt:'Scorpions! Hunt 4 of them.',rew:{waterskin:1,cactus_fruit:4},reveal:'pharaoh'},{t:'boss',boss:'pharaoh',txt:'Defeat the Sand Pharaoh in the southern dunes.',rew:{iron:6}}],
 ember:[{t:'fetch',item:'obsidian',n:4,txt:'Mine 4 obsidian for our forge (you need an iron pickaxe).',rew:{iron:4,bandage:2},reveal:'titan'},{t:'boss',boss:'titan',txt:'The Magma Titan stirs in the west. End it!',rew:{gold:8}}]};
let quests={},revealed={},kills={},bossDone={};
function buildVillages(){for(const v of VILLAGES){const y0=H(v.x,v.z);for(let i=0;i<5;i++){const a=i/5*6.28+.4,x=v.x+Math.cos(a)*9,z=v.z+Math.sin(a)*9;const g=new THREE.Group();
  const w=new THREE.Mesh(new THREE.CylinderGeometry(1.8,2,2.2,8),hutWall);w.position.y=1.1;const r=new THREE.Mesh(new THREE.ConeGeometry(2.6,2,8),new THREE.MeshStandardMaterial({color:hutRoof[v.biome],flatShading:true}));r.position.y=3.2;
  const d=new THREE.Mesh(new THREE.BoxGeometry(.8,1.4,.1),new THREE.MeshStandardMaterial({color:0x3a2210}));d.position.set(0,.7,1.95);g.add(w,r,d);g.traverse(o=>{if(o.isMesh){o.castShadow=o.receiveShadow=true;}});
  g.position.set(x,H(x,z),z);g.lookAt(v.x,H(x,z),v.z);scene.add(g);structs.push({type:'hut',x,z,perm:1,mesh:g});}
  const f=new THREE.Mesh(new THREE.ConeGeometry(.6,1,6),new THREE.MeshBasicMaterial({color:0xff8a20}));f.position.set(v.x,y0+.5,v.z);scene.add(f);
  const sign=document.createElement('canvas');}
}
function spawnNPCs(){const looks={oak:['Casual_Male','Cowboy_Female'],frost:['Elf','Casual3_Female'],vine:['Cowboy_Female','Elf'],sand:['Casual_Male','Casual3_Female'],ember:['Elf','Casual_Male']};
 const cloth={forest:0x3a7a3a,snow:0x5a7ad0,jungle:0x8a5a20,desert:0xe0c080,lava:0x8a2a1a};
 for(const v of VILLAGES){[['elder','Elder'],['trader','Trader']].forEach(([role,rn],i)=>{const f=makeFigure({model:looks[v.id][i],cloth:cloth[v.biome]});const x=v.x+(i?3:-3),z=v.z+2;f.position.set(x,H(x,z),z);f.rotation.y=Math.PI*.1;scene.add(f);NPCS.push({v,role,name:v.name+' '+rn,x,z,fig:f});});}}

// ---------- animals ----------
const AN={
 deer:{b:'forest',m:'Deer',h:1.6,hp:40,spd:6.2,beh:'passive',drops:{raw_meat:2,hide:1},run:'Gallop',atk:'Attack_Headbutt'},
 rabbit:{b:'forest',p:'rabbit',col:0x9a8670,hp:10,spd:6,beh:'passive',drops:{raw_meat:1}},
 boar:{b:'forest',m:'Boar',h:.95,hp:60,spd:5.4,beh:'neutral',dmg:8,drops:{raw_meat:2,hide:1},run:'Run',atk:'Headbutt'},
 wolf:{b:'forest',m:'Wolf',h:1,hp:45,spd:6.4,beh:'hostile',dmg:7,drops:{raw_meat:1,hide:1},run:'Gallop',atk:'Attack',tint:{Main:0x8a8580,Main_Light:0xb8b2a8}},
 bear:{b:'forest',m:'Wolf',h:1.45,bulk:1.4,hp:150,spd:5,beh:'hostile',dmg:16,drops:{raw_meat:3,hide:2},run:'Gallop',atk:'Attack',tint:{Main:0x4a2e1a,Main_Light:0x6e4a2e}},
 polar_bear:{b:'snow',m:'Wolf',h:1.5,bulk:1.45,hp:170,spd:5,beh:'hostile',dmg:18,drops:{raw_meat:3,hide:3},run:'Gallop',atk:'Attack',recolor:{Main:0xf4f4f0,Main_Light:0xffffff}},
 penguin:{b:'snow',p:'penguin',hp:12,spd:3,beh:'passive',drops:{raw_meat:1,feather:1}},
 snow_fox:{b:'snow',m:'Wolf',h:.7,hp:30,spd:7,beh:'neutral',dmg:6,drops:{raw_meat:1,hide:1},run:'Gallop',atk:'Attack',recolor:{Main:0xf0f0f0,Main_Light:0xffffff}},
 yeti:{b:'snow',hm:'Viking_Male',scale:1.35,look:{cloth:0xffffff,skin:0xdde6ee,hair:0xffffff},hp:140,spd:4.8,beh:'hostile',dmg:15,drops:{hide:3,raw_meat:2}},
 monkey:{b:'jungle',p:'monkey',col:0x7a4a2a,hp:18,spd:6,beh:'passive',drops:{raw_meat:1}},
 tiger:{b:'jungle',m:'Wolf',h:1.2,bulk:1.25,hp:110,spd:6.6,beh:'hostile',dmg:13,drops:{raw_meat:2,hide:2},run:'Gallop',atk:'Attack',recolor:{Main:0xe08a20,Main_Light:0xfff0d0}},
 snake:{b:'jungle',p:'snake',col:0x2a9a2a,hp:22,spd:4,beh:'hostile',dmg:7,drops:{raw_meat:1}},
 parrot:{b:'jungle',p:'bird',col:0xe02a2a,fly:1,hp:8,spd:6,beh:'passive',drops:{feather:2}},
 scorpion:{b:'desert',p:'scorpion',col:0x3a2a1a,hp:28,spd:4.5,beh:'hostile',dmg:8,drops:{raw_meat:1}},
 camel:{b:'desert',m:'Deer',h:2,bulk:1.3,hp:70,spd:4.5,beh:'passive',drops:{raw_meat:3,hide:2},run:'Gallop',atk:'Attack_Kick',recolor:{Main:0xc8a060,Main_Light:0xe0c090,Main_Dark:0x8a6a40}},
 vulture:{b:'desert',p:'bird',col:0x4a3a30,fly:1,hp:22,spd:5.5,beh:'hostile',dmg:5,drops:{feather:2,raw_meat:1}},
 lizard:{b:'desert',p:'lizard',col:0x9a8a40,hp:10,spd:6,beh:'passive',drops:{raw_meat:1}},
 salamander:{b:'lava',p:'lizard',col:0xff3a10,emis:1,hp:34,spd:5,beh:'hostile',dmg:9,drops:{raw_meat:1,hide:1}},
 lava_golem:{b:'lava',hm:'Viking_Male',scale:1.5,look:{cloth:0x3a1a10,skin:0x5a2a1a,hair:0xff5a00},emis:0xff3300,hp:200,spd:3.6,beh:'hostile',dmg:18,drops:{obsidian:2,iron:1}},
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
function animalFig(K){if(K.p)return procAnimal(K);if(K.hm){const f=makeFigure({model:K.hm,scale:K.scale,...K.look,emis:K.emis});return f;}
 const root=new THREE.Group(),src=MODELS[K.m],obj=SkeletonUtils.clone(src.scene);root.add(obj);const k=K.h/src.h;obj.scale.set(k*(K.bulk||1),k*(K.bulk||1),k);
 obj.traverse(n=>{if(n.isMesh){n.castShadow=true;n.frustumCulled=false;const m=n.material.clone();if(K.recolor&&K.recolor[m.name]!==undefined)m.color.set(K.recolor[m.name]);if(K.tint&&K.tint[m.name]!==undefined)m.color.multiply(new THREE.Color(K.tint[m.name])).multiplyScalar(2.2);n.material=m;}});
 const mixer=new THREE.AnimationMixer(obj),acts={};const map={idle:'Idle',walk:'Walk',run:K.run||'Run',attack:K.atk||'Attack',death:'Death'};
 for(const kk in map){const c=findClip(src.animations,map[kk]);if(!c)continue;const a=mixer.clipAction(c);acts[kk]=a;if(kk==='attack'||kk==='death'){a.setLoop(THREE.LoopOnce);a.clampWhenFinished=true;}else{a.play();a.setEffectiveWeight(kk==='idle'?1:0);}}
 root.userData={mixer,acts,cur:'idle',oneShot:0,quad:1};return root;}
function aAnim(a,name,sp=1){const f=a.fig,u=f.userData;if(u.proc)return;if(a.K.hm){const nm=name==='attack'?'punch':name;if(nm==='punch'||nm==='death')playOnce(f,nm,nm==='death'?1.2:.6);else setAnim(f,nm,sp);return;}
 if(!u.acts[name])return;if(name==='attack'||name==='death'){const acx=u.acts[name],from=u.acts[u.cur];acx.reset();acx.enabled=true;acx.setEffectiveWeight(1);acx.play();if(from&&from!==acx)from.crossFadeTo(acx,.12,false);u.cur=name;u.oneShot=name==='death'?99:acx.getClip().duration;return;}
 if(u.oneShot>0)return;setAnim(f,name,sp);}
function spawnAnimal(kind,x,z){const K=AN[kind];const a={kind,K,x,z,hp:K.hp,alive:true,dir:rnd(0,6.28),t:rnd(0,3),state:'wander',cd:0,flash:0,fig:animalFig(K),tx:x,tz:z,agro:K.beh==='hostile'};a.fig.position.set(x,H(x,z),z);scene.add(a.fig);animals.push(a);return a;}
function killAnimal(a,byPlayer){a.alive=false;a.dead=2;aAnim(a,'death');if(byPlayer){kills[a.kind]=(kills[a.kind]||0)+1;const got=[];for(const k in a.K.drops){add(k,a.K.drops[k]);got.push('+'+a.K.drops[k]+' '+ITEMS[k]);}toast(got.join('  '));}}
let spawnT=0;
function manageAnimals(dt){spawnT-=dt;for(const a of animals){if(Math.hypot(a.x-P.x,a.z-P.z)>85&&!a.boss){a.gone=true;}}
 animals=animals.filter(a=>{if(a.gone||(a.dead!==undefined&&a.dead<=0)){scene.remove(a.fig);return false;}return true;});
 if(spawnT>0)return;spawnT=1.2;const live=animals.filter(a=>a.alive&&!a.minion).length;if(live>=(isTouch?14:18))return;
 for(let t=0;t<6;t++){const ang=rnd(0,6.28),d=rnd(32,60),x=P.x+Math.cos(ang)*d,z=P.z+Math.sin(ang)*d;if(Math.abs(x)>W-5||Math.abs(z)>W-5||inPond(x,z,1)||inLava(x,z))continue;if(VILLAGES.some(v=>Math.hypot(x-v.x,z-v.z)<20))continue;
  const b=biomeAt(x,z),tab={...SPAWN[b]};if(night()&&b==='forest')tab.wolf+=4;const tot=Object.values(tab).reduce((s,v)=>s+v,0);let r=rnd(0,tot),kind;for(const k in tab){r-=tab[k];if(r<=0){kind=k;break;}}
  spawnAnimal(kind||Object.keys(tab)[0],x,z);
  if(kind==='wolf'&&Math.random()<.5)spawnAnimal('wolf',x+2,z+1);break;}}
function safeAt(x,z){return structs.some(s=>s.type==='campfire'&&Math.hypot(x-s.x,z-s.z)<7)||VILLAGES.some(v=>Math.hypot(x-v.x,z-v.z)<16);}
function updAnimals(dt){for(const a of animals){const f=a.fig,u=f.userData;if(u.mixer)u.mixer.update(dt);if(u.oneShot>0){u.oneShot-=dt;if(u.oneShot<=0&&!a.K.hm&&a.alive){u.oneShot=0;const to=u.acts.idle,fr=u.acts[u.cur];if(to&&fr){to.enabled=true;to.setEffectiveWeight(1);to.play();fr.crossFadeTo(to,.2,false);u.cur='idle';}}}
 if(a.K.hm)tickFig(f,0);
 if(!a.alive){a.dead-=dt;if(u.proc){f.rotation.z=Math.min(1.5,f.rotation.z+dt*4);}continue;}
 a.cd-=dt;a.t-=dt;if(a.flash>0){a.flash-=dt;}
 const dx=P.x-a.x,dz=P.z-a.z,dp=Math.hypot(dx,dz);let spd=0,tdir=a.dir;
 const hostileNow=(a.agro&&!(P.dead))&&dp<(a.K.beh==='hostile'?(night()?22:16):30)&&!safeAt(P.x,P.z);
 if(a.state==='flee'&&a.t>0){tdir=Math.atan2(-dx,-dz);spd=a.K.spd;}
 else if(hostileNow){tdir=Math.atan2(dx,dz);const rng=(a.K.hm?2:1.6)*(a.K.bulk||1);if(dp>rng){spd=a.K.spd;}else if(a.cd<=0){a.cd=1.2;aAnim(a,'attack');setTimeout(()=>{if(a.alive&&Math.hypot(P.x-a.x,P.z-a.z)<rng+.8)hurtPlayer(a.K.dmg,a.K.b);},300);}}
 else{if(a.t<=0){a.t=rnd(2,5);a.state=Math.random()<.5?'idle':'wander';a.dir=rnd(0,6.28);if(a.agro&&a.K.beh!=='hostile')a.agro=false;}tdir=a.dir;spd=a.state==='wander'?a.K.spd*.3:0;if(a.K.beh==='passive'&&dp<6){a.state='flee';a.t=2;}}
 a.dir=tdir;const nx=a.x+Math.sin(tdir)*spd*dt,nz=a.z+Math.cos(tdir)*spd*dt;
 if(!blocked(nx,nz,.5)&&!inPond(nx,nz,.3)&&!(inLava(nx,nz)&&a.K.b!=='lava')&&Math.abs(nx)<W-3&&Math.abs(nz)<W-3){a.x=nx;a.z=nz;}else{a.dir+=1.5;}
 const fy=a.K.fly?H(a.x,a.z)+2.2+Math.sin(performance.now()/300+a.x)*.3:H(a.x,a.z);f.position.set(a.x,fy,a.z);f.rotation.y=tdir;
 if(u.proc){const tt=performance.now()/1000;u.proc.position.y=spd>0&&!a.K.fly?Math.abs(Math.sin(tt*12))*.08:0;u.proc.children.forEach(c=>{if(c.userData.wing)c.rotation.z=Math.sin(tt*16)*.7*c.userData.wing;if(c.userData.seg!==undefined)c.position.x=Math.sin(tt*6-c.userData.seg)*.12;});}
 else if(!u.oneShot)aAnim(a,spd>a.K.spd*.5?'run':spd>0?'walk':'idle');}}
function hitAnimal(a,dmg){a.hp-=dmg;a.flash=.2;floatTxt(a.x,a.z,'-'+Math.round(dmg),'#ffd');sfx.hit();if(a.K.beh!=='passive')a.agro=true;else{a.state='flee';a.t=3;}if(a.hp<=0)killAnimal(a,true);}

// ---------- telegraphs & projectiles ----------
const TELE=[],PROJ=[];
const teleMat=new THREE.MeshBasicMaterial({color:0xff2a2a,transparent:true,opacity:.35,depthWrite:false});
function telegraph(x,z,r,delay,cb){const m=new THREE.Mesh(new THREE.CircleGeometry(r,28),teleMat.clone());m.rotation.x=-Math.PI/2;m.position.set(x,H(x,z)+.08,z);scene.add(m);TELE.push({m,t:delay,d:delay,cb,x,z,r});}
function shoot(from,x,z,ang,spd,dmg,col,r=.35,life=2.5){const m=new THREE.Mesh(new THREE.SphereGeometry(r,10,8),new THREE.MeshBasicMaterial({color:col}));m.position.set(x,H(x,z)+1.2,z);scene.add(m);PROJ.push({from,x,z,vx:Math.sin(ang)*spd,vz:Math.cos(ang)*spd,dmg,life,m,r});}
function updFx(dt){for(let i=TELE.length-1;i>=0;i--){const t=TELE[i];t.t-=dt;t.m.material.opacity=.25+.45*(1-t.t/t.d);if(t.t<=0){scene.remove(t.m);TELE.splice(i,1);t.cb&&t.cb(t);}}
 for(let i=PROJ.length-1;i>=0;i--){const p=PROJ[i];p.x+=p.vx*dt;p.z+=p.vz*dt;p.life-=dt;p.m.position.set(p.x,H(p.x,p.z)+1.2,p.z);let hit=false;
  if(p.from==='enemy'){if(!P.dead&&Math.hypot(p.x-P.x,p.z-P.z)<p.r+.5){hurtPlayer(p.dmg,null);hit=true;}}
  else{for(const a of animals){if(a.alive&&Math.hypot(p.x-a.x,p.z-a.z)<.9*(a.K.bulk||1)+(a.K.hm?.4:0)){hitAnimal(a,p.dmg);hit=true;break;}}if(!hit&&boss&&boss.alive&&Math.hypot(p.x-boss.x,p.z-boss.z)<boss.rad){hitBoss(p.dmg);hit=true;}}
  if(hit||p.life<=0||blocked(p.x,p.z,.1)){scene.remove(p.m);PROJ.splice(i,1);}}}

// ---------- bosses ----------
let boss=null;const bossObjs={};
function buildBossArenas(){for(const B of BOSSES){const y=H(B.x,B.z);const mat=new THREE.MeshStandardMaterial({color:B.tint,roughness:.7,emissive:B.emis?new THREE.Color(B.emis):new THREE.Color(0),emissiveIntensity:.3});
 for(let i=0;i<8;i++){const a=i/8*6.28,p=new THREE.Mesh(new THREE.CylinderGeometry(.6,.8,5,8),mat);p.position.set(B.x+Math.cos(a)*19,y+2.5,B.z+Math.sin(a)*19);p.castShadow=true;scene.add(p);}
 const ring=new THREE.Mesh(new THREE.RingGeometry(17,18,48),new THREE.MeshBasicMaterial({color:B.tint,transparent:true,opacity:.5}));ring.rotation.x=-Math.PI/2;ring.position.set(B.x,y+.06,B.z);scene.add(ring);}}
function spawnBoss(B){const f=makeFigure({model:B.model,scale:B.scale,...B.look,tint:B.tint,emis:B.emis});f.position.set(B.x,H(B.x,B.z),B.z);scene.add(f);
 boss={B,fig:f,x:B.x,z:B.z,hp:B.hp,max:B.hp,alive:true,cd:2,act:null,actT:0,rad:1.4*B.scale/3*2,contact:0,phase2:false};sfx.boss();toast('⚠️ '+B.name+' awakens!');}
function bossAttack(b){const B=b.B;const opts=B.attacks;let a=opts[Math.floor(Math.random()*opts.length)];const dmg=B.dmg*(b.phase2?1.25:1);
 const ang=Math.atan2(P.x-b.x,P.z-b.z);
 if(a==='slam'){playOnce(b.fig,'slash',1);telegraph(b.x,b.z,7,1.1,t=>{if(Math.hypot(P.x-t.x,P.z-t.z)<t.r)hurtPlayer(dmg*1.3,null);shake=.4;});}
 else if(a==='volley'){playOnce(b.fig,'punch',.6);for(let i=-2;i<=2;i++)shoot('enemy',b.x,b.z,ang+i*.22,13,dmg*.6,B.proj,.45);}
 else if(a==='ring'){for(let i=0;i<14;i++)shoot('enemy',b.x,b.z,i/14*6.28,10,dmg*.55,B.proj,.4,3);if(b.phase2)setTimeout(()=>{if(b.alive)for(let i=0;i<14;i++)shoot('enemy',b.x,b.z,(i+.5)/14*6.28,10,dmg*.55,B.proj,.4,3);},500);}
 else if(a==='spiral'){for(let k=0;k<16;k++)setTimeout(()=>{if(b.alive)shoot('enemy',b.x,b.z,k*.55,11,dmg*.5,B.proj,.38,3);},k*90);}
 else if(a==='charge'){b.act='charge';b.actT=.9;b.cAng=ang;telegraph(b.x+Math.sin(ang)*6,b.z+Math.cos(ang)*6,3,.6,null);}
 else if(a==='meteor'){for(let i=0;i<(b.phase2?7:5);i++){const x=P.x+rnd(-5,5),z=P.z+rnd(-5,5);telegraph(x,z,2.4,1.3+i*.12,t=>{if(Math.hypot(P.x-t.x,P.z-t.z)<t.r)hurtPlayer(dmg,null);shake=.25;});}}
 else if(a==='summon'){const n=animals.filter(x=>x.minion&&x.alive).length;if(n<4)for(let i=0;i<2;i++){const m=spawnAnimal(B.minion,b.x+rnd(-4,4),b.z+rnd(-4,4));m.minion=1;m.agro=true;}else return bossAttack(b);}
 else if(a==='teleport'){const ba=ang+Math.PI;const nx=P.x+Math.sin(ba)*-4,nz=P.z+Math.cos(ba)*-4;floatTxt(b.x,b.z,'✨','#ff0');b.x=clamp(nx,B.x-17,B.x+17);b.z=clamp(nz,B.z-17,B.z+17);telegraph(b.x,b.z,5,.9,t=>{if(Math.hypot(P.x-t.x,P.z-t.z)<t.r)hurtPlayer(dmg,null);});}
 b.cd=(b.phase2?1.8:2.6)+Math.random();}
function updBoss(dt){if(!boss){for(const B of BOSSES){if(bossDone[B.id])continue;if(Math.hypot(P.x-B.x,P.z-B.z)<22)spawnBoss(B);}
  $('bossbar').classList.add('hidden');return;}
 const b=boss,B=b.B;tickFig(b.fig,dt);
 if(!b.alive){b.deadT-=dt;if(b.deadT<=0){scene.remove(b.fig);boss=null;}return;}
 const dp=Math.hypot(P.x-b.x,P.z-b.z);
 if(dp>40||P.dead){scene.remove(b.fig);boss=null;toast(B.name+' retreats to its lair…');return;}
 $('bossbar').classList.remove('hidden');$('bossName').textContent=B.name+(b.phase2?' (ENRAGED)':'');$('bossB').style.width=(b.hp/b.max*100)+'%';
 if(!b.phase2&&b.hp<b.max/2){b.phase2=true;toast(B.name+' is enraged!');}
 const ang=Math.atan2(P.x-b.x,P.z-b.z);
 if(b.act==='charge'){b.actT-=dt;if(b.actT<.6){const s=24*dt;b.x+=Math.sin(b.cAng)*s;b.z+=Math.cos(b.cAng)*s;setAnim(b.fig,'run',1.6);if(dp<b.rad+.8&&b.contact<=0){hurtPlayer(B.dmg*1.2,null);b.contact=1;}}if(b.actT<=0)b.act=null;}
 else{b.cd-=dt;if(dp>b.rad+1.2){const s=(b.phase2?4.2:3.2)*dt;b.x+=Math.sin(ang)*s;b.z+=Math.cos(ang)*s;setAnim(b.fig,'walk',1);}else{setAnim(b.fig,'idle');if(b.contact<=0){playOnce(b.fig,'punch',.6);hurtPlayer(B.dmg*.8,null);b.contact=1.3;}}
  if(b.cd<=0)bossAttack(b);}
 b.contact-=dt;b.x=clamp(b.x,B.x-18,B.x+18);b.z=clamp(b.z,B.z-18,B.z+18);
 b.fig.position.set(b.x,H(b.x,b.z),b.z);b.fig.rotation.y=b.act==='charge'?b.cAng:ang;}
function hitBoss(d){const b=boss;if(!b||!b.alive)return;b.hp-=d;floatTxt(b.x,b.z,'-'+Math.round(d),'#f66');sfx.hit();
 if(b.hp<=0){b.alive=false;b.deadT=4;playOnce(b.fig,'death',1.5);bossDone[b.B.id]=1;add(b.B.trophy,1);const got=[ITEMS[b.B.trophy]];for(const k in b.B.loot){add(k,b.B.loot[k]);got.push('+'+b.B.loot[k]+' '+ITEMS[k]);}
  for(const m of animals)if(m.minion&&m.alive)killAnimal(m,false);$('bossbar').classList.add('hidden');sfx.win();toast('🏆 '+b.B.name+' defeated!<br>'+got.join('  '),5);
  if(BOSSES.every(x=>bossDone[x.id])&&!has('crown')){add('crown',1);setTimeout(()=>{$('win').classList.remove('hidden');paused=true;},2500);}save();}}

// ---------- structures ----------
function structMesh(type){const g=new THREE.Group();const wood=new THREE.MeshStandardMaterial({color:0x8a5a30,roughness:.9}),stone=new THREE.MeshStandardMaterial({color:0x8a8a8a,flatShading:true});
 if(type==='campfire'){for(let i=0;i<8;i++){const s=new THREE.Mesh(new THREE.DodecahedronGeometry(.22,0),stone);s.position.set(Math.cos(i/8*6.28)*.7,.12,Math.sin(i/8*6.28)*.7);g.add(s);}
  for(let i=0;i<3;i++){const l=new THREE.Mesh(new THREE.CylinderGeometry(.08,.08,1,6),wood);l.rotation.z=Math.PI/2;l.rotation.y=i*1.05;l.position.y=.15;g.add(l);}
  const fl=new THREE.Mesh(new THREE.ConeGeometry(.35,.9,7),new THREE.MeshBasicMaterial({color:0xffa020}));fl.position.y=.6;fl.userData.flame=1;g.add(fl);}
 else if(type==='bench'){const t=new THREE.Mesh(new THREE.BoxGeometry(1.6,.15,.9),wood);t.position.y=.9;g.add(t);for(const [x,z] of [[-.7,-.35],[.7,-.35],[-.7,.35],[.7,.35]]){const l=new THREE.Mesh(new THREE.BoxGeometry(.12,.9,.12),wood);l.position.set(x,.45,z);g.add(l);}const s=new THREE.Mesh(new THREE.BoxGeometry(.4,.2,.3),stone);s.position.set(.4,1.07,0);g.add(s);}
 else if(type==='tent'){const geo=new THREE.ConeGeometry(1.8,2.2,4);const t=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color:0xc06a2a,flatShading:true}));t.position.y=1.1;t.rotation.y=Math.PI/4;g.add(t);}
 else if(type==='chest'){const b=new THREE.Mesh(new THREE.BoxGeometry(1,.6,.6),wood);b.position.y=.3;const l=new THREE.Mesh(new THREE.BoxGeometry(1.05,.15,.65),new THREE.MeshStandardMaterial({color:0x5a3a1a}));l.position.y=.65;g.add(b,l);}
 g.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});return g;}
function placeStruct(type,x,z){const m=structMesh(type);m.position.set(x,H(x,z),z);scene.add(m);const s={type,x,z,mesh:m};structs.push(s);return s;}
const SR={hut:2.3,tent:1.3,bench:.9,chest:.6,campfire:.6};
function blocked(x,z,r){for(const o of near(x,z,2)){if(!o.alive||o.type==='pebble'||o.type==='bush')continue;if(Math.hypot(x-o.x,z-o.z)<RTYPES[o.type].r*o.s*(o.type==='tree'?.6:1)+r)return true;}
 for(const s of structs)if(Math.abs(x-s.x)<4&&Math.abs(z-s.z)<4&&Math.hypot(x-s.x,z-s.z)<SR[s.type]+r)return true;return false;}

// ---------- player ----------
const P={x:0,z:3,dir:Math.PI,hp:100,hunger:100,thirst:100,temp:100,fig:null,cd:0,dead:false,water:0,spawn:[0,3]};
let dayT=40,day=1,paused=true,running=false,shake=0,toolHeld=null;
const DAY=300;const phase=()=>(dayT%DAY)/DAY;const night=()=>{const p=phase();return p>.72||p<.04;};
function hurtPlayer(d,src){if(P.dead||paused)return;d*=1-armorPct();P.hp-=d;P.hurtT=.3;sfx.hurt();floatTxt(P.x,P.z,'-'+Math.round(d),'#f44');if(P.hp<=0)die();}
function die(){P.dead=true;P.hp=0;playOnce(P.fig,'death',1.2);toast('💀 You fainted… waking at '+(P.spawn[0]===0&&P.spawn[1]===3?'the forest clearing':'your tent'),3);const lost=Math.floor((inv.raw_meat||0)/2);if(lost)add('raw_meat',-lost);
 setTimeout(()=>{P.dead=false;P.x=P.spawn[0];P.z=P.spawn[1];P.hp=70;P.hunger=Math.max(P.hunger,50);P.thirst=Math.max(P.thirst,50);P.temp=100;P.fig.userData.oneShot=0;setAnim(P.fig,'idle');P.fig.userData.acts.death?.stop();},2600);}
function equipVisual(){const w=bestWeapon(),t=night()&&has('torch')?'torch':(w==='fists'?null:w);if(t===toolHeld)return;toolHeld=t;const h=P.fig.userData.hand;if(!h)return;if(P.tool){h.remove(P.tool);}P.tool=null;if(t){P.tool=toolMesh(t);P.tool.scale.setScalar(1/P.fig.userData.obj.scale.x);h.add(P.tool);}}

// ---------- interaction ----------
function nearestStruct(type,r){let b=null,bd=r;for(const s of structs)if(s.type===type){const d=Math.hypot(s.x-P.x,s.z-P.z);if(d<bd){bd=d;b=s;}}return b;}
function useTarget(){for(const n of NPCS)if(Math.hypot(n.x-P.x,n.z-P.z)<3.2)return{l:'TALK',f:()=>talk(n)};
 const fire=nearestStruct('campfire',3);if(fire&&has('raw_meat'))return{l:'COOK',f:()=>{const n=inv.raw_meat;add('raw_meat',-n);add('cooked_meat',n);toast('🍖 Cooked '+n+' meat');sfx.craft();}};
 if(nearestStruct('tent',3))return{l:night()?'SLEEP':'REST',f:sleep};
 if(nearestStruct('chest',2.6))return{l:'CHEST',f:openChest};
 if(nearestStruct('bench',3))return{l:'BENCH',f:()=>openBag('craft')};
 if(inPond(P.x,P.z,2.2))return{l:'DRINK',f:()=>{P.thirst=100;if(has('waterskin'))P.water=5;toast('💧 Refreshed'+(has('waterskin')?' · waterskin filled (5)':''));sfx.eat();}};
 if(has('waterskin')&&P.water>0&&P.thirst<80)return{l:'SIP',f:()=>{P.water--;P.thirst=Math.min(100,P.thirst+30);toast('💧 Waterskin: '+P.water+' left');}};
 return null;}
function sleep(){P.spawn=[P.x,P.z];if(night()){if(animals.some(a=>a.alive&&a.agro&&Math.hypot(a.x-P.x,a.z-P.z)<14))return toast('You can’t sleep with enemies nearby!');dayT=Math.ceil(dayT/DAY)*DAY+5;day++;P.hp=Math.min(100,P.hp+40);toast('🌅 You slept until morning. Respawn point set.');}else toast('⛺ Respawn point set at this tent.');save();}
function doAttack(){if(P.dead||P.cd>0||paused)return;P.cd=.45;const w=bestWeapon(),W2=WEAP[w];let dmg=W2.d*(has('crown')?1.5:1);
 // targets
 let best=null,bd=1e9;
 for(const a of animals)if(a.alive){const d=Math.hypot(a.x-P.x,a.z-P.z)-(a.K.bulk||1)*.4-(a.K.hm?.4:0);if(d<W2.r+.4&&d<bd){bd=d;best={a};}}
 if(boss&&boss.alive){const d=Math.hypot(boss.x-P.x,boss.z-P.z)-boss.rad;if(d<W2.r+.3&&d<bd){bd=d;best={boss:1};}}
 for(const o of near(P.x,P.z,4))if(o.alive){const d=Math.hypot(o.x-P.x,o.z-P.z)-RTYPES[o.type].r*o.s*.6;if(d<1.7&&d<bd-.3){bd=d;best={o};}}
 playOnce(P.fig,w==='fists'?'punch':'slash',.42);
 if(!best){return;}
 const tx=best.a?best.a.x:best.boss?boss.x:best.o.x,tz=best.a?best.a.z:best.boss?boss.z:best.o.z;P.dir=Math.atan2(tx-P.x,tz-P.z);
 if(best.a)hitAnimal(best.a,dmg);else if(best.boss)hitBoss(dmg);else gather(best.o);}
function gather(o){const T=RTYPES[o.type];
 if(T.pick){const lvl=has('iron_pickaxe')?2:has('pickaxe')?1:0;if(lvl<T.pick){toast(T.pick===2?'⛏️ You need an IRON pickaxe to mine '+o.type+'.':'⛏️ You need a pickaxe to mine!');floatTxt(o.x,o.z,'✋❌','#f88');return;}o.hp-=lvl===2?1.5:1;sfx.mine();}
 else if(o.type==='tree'){const p=has('iron_axe')?10/3:has('axe')?2:1;o.hp-=p;sfx.chop();o.hits=(o.hits||0)+1;const need=Math.ceil(10/p);floatTxt(o.x,o.z,Math.min(o.hits,need)+'/'+need,'#fff');}
 else o.hp-=1;
 if(o.hp<=0.001){o.alive=false;o.respawnAt=performance.now()/1000+(o.type==='pebble'?120:420);hideRes(o);deadRes.add(o.id);
  const g={tree:{wood:o.b==='jungle'?4:3,...(Math.random()<.3?{fiber:1}:{})},rock:{stone:3},iron:{iron:2,stone:1},gold:{gold:2},crystal:{crystal:2},obsidian:{obsidian:2},pebble:{stone:1},bush:{berries:o.b==='snow'?1:2,fiber:2},cactus:{fiber:2,cactus_fruit:1}}[o.type];
  if(o.type==='cactus')P.thirst=Math.min(100,P.thirst+15);const got=[];for(const k in g){add(k,g[k]);got.push('+'+g[k]+' '+ITEMS[k]);}toast(got.join('  '),1.4);o.hits=0;}}
const deadRes=new Set();
function shootBow(){if(P.dead||paused||P.cd>0)return;if(!has('bow'))return toast('Craft a bow at a crafting bench first.');if(!has('arrows'))return toast('No arrows! Craft some (needs feathers).');P.cd=.55;add('arrows',-1);
 let tgt=null,bd=26;for(const a of animals)if(a.alive){const d=Math.hypot(a.x-P.x,a.z-P.z);if(d<bd){bd=d;tgt=a;}}if(boss&&boss.alive&&Math.hypot(boss.x-P.x,boss.z-P.z)<26)tgt=boss;
 const ang=tgt?Math.atan2(tgt.x-P.x,tgt.z-P.z):P.dir;P.dir=ang;shoot('player',P.x+Math.sin(ang),P.z+Math.cos(ang),ang,26,14*(has('crown')?1.5:1),0xf5e6b0,.15,1.2);sfx.shoot();playOnce(P.fig,'punch',.35);}
function eatBest(){for(const [k,h,hp] of [['cooked_meat',35,8],['cactus_fruit',15,0],['berries',10,0],['raw_meat',12,-5]])if(has(k)){add(k,-1);P.hunger=Math.min(100,P.hunger+h);P.hp=clamp(P.hp+hp,1,100);if(k==='cactus_fruit')P.thirst=Math.min(100,P.thirst+20);toast('Ate '+ITEMS[k]+(k==='raw_meat'?' (cook it at a campfire!)':''),1.4);sfx.eat();return;}
 if(has('bandage')&&P.hp<100){add('bandage',-1);P.hp=Math.min(100,P.hp+30);return toast('🩹 +30 health');}toast('No food! Pick berries or hunt animals.');}

// ---------- crafting / bag UI ----------
let bagTab='craft';
const nm=k=>ITEMS[k]||({campfire:'🔥 Campfire',bench:'🛠️ Crafting bench',tent:'⛺ Tent',chest:'📦 Storage chest'})[k]||k;
function canCraft(r){for(const k in r.cost)if(!has(k,r.cost[k]))return false;if(r.bench&&!nearestStruct('bench',5))return false;if(TOOLS.includes(r.id)&&r.id!=='torch'&&has(r.id))return false;return true;}
function craft(id){const r=RECIPES.find(x=>x.id===id);if(!r||!canCraft(r))return false;for(const k in r.cost)add(k,-r.cost[k]);
 if(r.place){const x=P.x+Math.sin(P.dir)*2.2,z=P.z+Math.cos(P.dir)*2.2;placeStruct(id,x,z);if(id==='tent')P.spawn=[x,z+2];}else add(id,r.n||1);
 sfx.craft();toast('Crafted '+nm(id));equipVisual();save();return true;}
function openBag(tab){bagTab=tab||bagTab;paused=true;$('bag').classList.remove('hidden');renderBag();}
function renderBag(){$('tCraft').classList.toggle('on',bagTab==='craft');$('tInv').classList.toggle('on',bagTab==='inv');const nb=!!nearestStruct('bench',5);$('benchNote').textContent=nb?'🛠️ At crafting bench':'🛠️ = needs crafting bench nearby';
 let h='';if(bagTab==='craft'){for(const r of RECIPES){const owned=TOOLS.includes(r.id)&&r.id!=='torch'&&has(r.id);const cost=Object.entries(r.cost).map(([k,n])=>`<span class="${has(k,n)?'ok':'no'}">${n} ${nm(k)}</span>`).join(', ');
  h+=`<div class="card"><div class="t">${nm(r.id)}${r.n?' ×'+r.n:''} ${r.bench?'🛠️':''}</div><div class="c">${r.d}</div><div>${cost}</div>${r.bench&&!nb?'<div class="no">Needs a crafting bench nearby</div>':''}<button data-c="${r.id}" ${canCraft(r)?'':'disabled'}>${owned?'Owned':r.place?'Craft & place':'Craft'}</button></div>`;}}
 else{const ks=Object.keys(inv).filter(k=>inv[k]>0);if(!ks.length)h='<div class="card">Your bag is empty. Punch trees and grab pebbles and bushes to start.</div>';
  for(const k of ks){const food=['cooked_meat','berries','raw_meat','cactus_fruit','bandage'].includes(k);h+=`<div class="card"><div class="t">${nm(k)} ×${inv[k]}</div>${k==='waterskin'?'<div>'+P.water+'/5 drinks</div>':''}${food?`<button data-e="${k}">${k==='bandage'?'Use':'Eat'}</button>`:''}</div>`;}
  h+=`<div class="card"><div class="t">Worn</div><div>${[has('iron_armor')?'Iron armor':has('hide_armor')?'Hide armor':'No armor',has('cold_gear')?'Cold gear ✓':'No cold gear',has('heat_gear')?'Heat gear ✓':'No heat gear'].join(' · ')}</div><div>Weapon: ${nm(bestWeapon())}</div></div>`;}
 $('bagBody').innerHTML=h;}
$('bagBody').addEventListener('click',e=>{const c=e.target.dataset.c,k=e.target.dataset.e;if(c){craft(c);renderBag();}if(k){if(k==='bandage'){add(k,-1);P.hp=Math.min(100,P.hp+30);}else{const v={cooked_meat:[35,8],berries:[10,0],raw_meat:[12,-5],cactus_fruit:[15,0]}[k];add(k,-1);P.hunger=Math.min(100,P.hunger+v[0]);P.hp=clamp(P.hp+v[1],1,100);}sfx.eat();renderBag();}});
$('tCraft').onclick=()=>{bagTab='craft';renderBag();};$('tInv').onclick=()=>{bagTab='inv';renderBag();};
$('bagX').onclick=()=>{$('bag').classList.add('hidden');paused=false;};

// ---------- dialogs ----------
function dlg(title,text,btns){paused=true;$('dlg').classList.remove('hidden');$('dlgTitle').textContent=title;$('dlgText').innerHTML=text;const box=$('dlgBtns');box.innerHTML='';
 for(const b of btns){const d=document.createElement('div');d.className='card';d.innerHTML=`<div>${b.d||''}</div>`;const bt=document.createElement('button');bt.textContent=b.l;bt.disabled=!!b.dis;bt.onclick=()=>{b.f();};d.appendChild(bt);box.appendChild(d);}}
$('dlgX').onclick=closeDlg;function closeDlg(){$('dlg').classList.add('hidden');paused=false;}
const costTxt=o=>Object.entries(o).map(([k,n])=>n+' '+nm(k)).join(', ');
function questProgress(v,q){if(q.t==='fetch')return Math.min(inv[q.item]||0,q.n);if(q.t==='hunt')return Math.min((kills[q.kind]||0)-(quests[v.id].k0||0),q.n);if(q.t==='boss')return bossDone[q.boss]?1:0;}
function revealTxt(r){if(r==='all')return 'Legends say: the Yeti King rules the far NORTH peaks, the Vine Queen the far EAST jungle, the Sand Pharaoh the far SOUTH dunes, and the Magma Titan the far WEST volcano. Each village knows the exact spot.';const B=BOSSES.find(b=>b.id===r);return `📍 The ${B.name} lairs at the marked spot on your map (${B.biome}).`;}
function talk(n){const v=n.v;if(n.role==='trader'){const tr=TRADES[v.id];dlg(n.name,`“Welcome to ${v.name}, traveler. Care to trade?”`,tr.map(t=>({d:'Give '+costTxt(t.give)+' → get '+costTxt(t.get),l:'Trade',dis:!Object.entries(t.give).every(([k,c])=>has(k,c)),f:()=>{for(const k in t.give)add(k,-t.give[k]);for(const k in t.get)add(k,t.get[k]);sfx.craft();equipVisual();talk(n);}})));return;}
 const Qs=QUESTS[v.id],st=quests[v.id]||(quests[v.id]={i:0,active:false});const q=Qs[st.i];
 if(!q){return dlg(n.name,'“You have done everything we asked. Our village is forever grateful!”'+(Object.keys(revealed).length?'<br><br>'+Object.keys(revealed).map(revealTxt).join('<br>'):''),[]);}
 const tdesc=q.t==='boss'?'Defeat '+BOSSES.find(b=>b.id===q.boss).name:q.t==='fetch'?'Bring '+q.n+' '+nm(q.item):'Hunt '+q.n+' '+q.kind.replace('_',' ')+'s';
 if(!st.active)return dlg(n.name,`“${q.txt}”<br><br><b>Quest:</b> ${tdesc}<br><b>Reward:</b> ${costTxt(q.rew)}${q.reveal?' + 📍 boss location':''}`,[{l:'Accept quest',f:()=>{st.active=true;st.k0=q.t==='hunt'?(kills[q.kind]||0):0;toast('📜 Quest accepted: '+tdesc);save();closeDlg();}}]);
 const pr=questProgress(v,q),need=q.t==='boss'?1:q.n;
 dlg(n.name,`“${q.txt}”<br><br><b>Progress:</b> ${pr}/${need}`,[{l:'Turn in',dis:pr<need,d:'Reward: '+costTxt(q.rew),f:()=>{if(q.t==='fetch')add(q.item,-q.n);for(const k in q.rew)add(k,q.rew[k]);if(q.reveal){if(q.reveal==='all')revealed.hint=1;else revealed[q.reveal]=1;}
  st.i++;st.active=false;sfx.win();equipVisual();save();dlg(n.name,'“Thank you! Here is your reward.”'+(q.reveal?'<br><br>'+revealTxt(q.reveal):''),[]);}}]);}
function openChest(){const mv=(from,to,k)=>{to[k]=(to[k]||0)+from[k];delete from[k];};const render=()=>{const btns=[];for(const k in inv)if(!TOOLS.includes(k))btns.push({d:nm(k)+' ×'+inv[k],l:'Store →',f:()=>{mv(inv,chest,k);render();}});for(const k in chest)btns.push({d:'📦 '+nm(k)+' ×'+chest[k],l:'← Take',f:()=>{mv(chest,inv,k);render();}});dlg('📦 Storage chest','Items stored here are safe.',btns);save();};render();}

// ---------- map ----------
const mapImg=document.createElement('canvas');mapImg.width=mapImg.height=300;
{const g=mapImg.getContext('2d'),id=g.createImageData(300,300),c=new THREE.Color();for(let j=0;j<300;j++)for(let i=0;i<300;i++){const x=(i/300*2-1)*W,z=(j/300*2-1)*W;c.setHex(BIOME[biomeAt(x,z)].c[0]);if(inPond(x,z))c.setHex(0x3a8ec8);if(LAVA.some(p=>Math.hypot(x-p.x,z-p.z)<p.r))c.setHex(0xff5a10);const o=(j*300+i)*4;id.data[o]=c.r*255;id.data[o+1]=c.g*255;id.data[o+2]=c.b*255;id.data[o+3]=255;}g.putImageData(id,0,0);}
function drawMap(cv,cx,cz,span,round){const g=cv.getContext('2d'),S=cv.width,k=S/span,sx=x=>(x-cx)*k+S/2,sz=z=>(z-cz)*k+S/2;g.save();g.clearRect(0,0,S,S);if(round){g.beginPath();g.arc(S/2,S/2,S/2,0,7);g.clip();}
 g.drawImage(mapImg,sx(-W),sz(-W),2*W*k,2*W*k);g.font=(round?14:22)+'px sans-serif';g.textAlign='center';g.textBaseline='middle';
 for(const v of VILLAGES){g.fillText('🏠',sx(v.x),sz(v.z));if(!round){g.font='12px sans-serif';g.fillStyle='#fff';g.fillText(v.name,sx(v.x),sz(v.z)+16);g.font='22px sans-serif';}}
 for(const B of BOSSES)if(revealed[B.id]||bossDone[B.id]){g.fillText(bossDone[B.id]?'✅':'💀',sx(B.x),sz(B.z));if(!round){g.font='12px sans-serif';g.fillStyle='#fdd';g.fillText(B.name,sx(B.x),sz(B.z)+16);g.font='22px sans-serif';}}
 for(const s of structs)if(s.type==='campfire'||s.type==='tent')g.fillText(s.type==='tent'?'⛺':'🔥',sx(s.x),sz(s.z));
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
addEventListener('keydown',e=>{const k=e.key.toLowerCase();keys[k]=true;if(!running)return;if(k===' '){e.preventDefault();doAttack();}if(k==='e'){if(!$('dlg').classList.contains('hidden'))closeDlg();else{const u=useTarget();u&&u.f();}}if(k==='f')shootBow();if(k==='q')eatBest();if(k==='c'||k==='i'){if($('bag').classList.contains('hidden'))openBag('craft');else $('bagX').onclick();}if(k==='m'){$('fullMap').classList.contains('hidden')?openMap():$('fullMap').classList.add('hidden');}if(k==='escape'){closeDlg();$('bag').classList.add('hidden');$('fullMap').classList.add('hidden');paused=false;}});
addEventListener('keyup',e=>{keys[e.key.toLowerCase()]=false;});
{const st=$('stick'),base=$('knobBase'),kn=$('knob');let id=null,cx=0,cy=0;const R0=50;
 st.addEventListener('pointerdown',e=>{id=e.pointerId;st.setPointerCapture(id);const r=base.getBoundingClientRect();cx=r.left+r.width/2;cy=r.top+r.height/2;if(Math.hypot(e.clientX-cx,e.clientY-cy)>90){base.style.left=(e.clientX-60)+'px';base.style.bottom=(innerHeight-e.clientY-60)+'px';cx=e.clientX;cy=e.clientY;}mv(e);});
 const mv=e=>{if(e.pointerId!==id)return;let dx=e.clientX-cx,dy=e.clientY-cy;const l=Math.hypot(dx,dy);if(l>R0){dx*=R0/l;dy*=R0/l;}kn.style.left=(33+dx)+'px';kn.style.top=(33+dy)+'px';joy={x:dx/R0,y:dy/R0};};
 st.addEventListener('pointermove',mv);const up=e=>{if(e.pointerId!==id)return;id=null;joy={x:0,y:0};kn.style.left=kn.style.top='33px';};st.addEventListener('pointerup',up);st.addEventListener('pointercancel',up);}
let actHeld=false;
$('bAct').addEventListener('pointerdown',e=>{e.preventDefault();actHeld=true;doAttack();});for(const ev of ['pointerup','pointercancel','pointerleave'])$('bAct').addEventListener(ev,()=>actHeld=false);
$('bUse').addEventListener('pointerdown',e=>{e.preventDefault();const u=useTarget();if(u)u.f();else toast('Nothing to use here');});
$('bShoot').addEventListener('pointerdown',e=>{e.preventDefault();shootBow();});
$('bEat').addEventListener('pointerdown',e=>{e.preventDefault();eatBest();});
$('bBag').addEventListener('pointerdown',e=>{e.preventDefault();openBag();});
$('quit').onclick=()=>{if(confirm('Save and quit to the main menu?')){save();running=false;paused=true;$('hud').classList.add('hidden');$('title').classList.remove('hidden');$('bCont').disabled=false;}};
$('winOk').onclick=()=>{$('win').classList.add('hidden');paused=false;};

// ---------- save ----------
function save(){if(!running&&!P.fig)return;try{localStorage.setItem(SAVE_KEY,JSON.stringify({v:1,p:{x:P.x,z:P.z,hp:P.hp,hunger:P.hunger,thirst:P.thirst,temp:P.temp,water:P.water,spawn:P.spawn},inv,chest,structs:structs.filter(s=>!s.perm).map(s=>({type:s.type,x:s.x,z:s.z})),dead:[...deadRes],quests,revealed,kills,bossDone,dayT,day}));}catch(e){}}
function load(){try{const d=JSON.parse(localStorage.getItem(SAVE_KEY));if(!d)return false;Object.assign(P,d.p);inv=d.inv||{};chest=d.chest||{};for(const s of d.structs||[])placeStruct(s.type,s.x,s.z);for(const id of d.dead||[]){const o=RES[id];if(o){o.alive=false;hideRes(o);deadRes.add(id);o.respawnAt=performance.now()/1000+300;}}
 quests=d.quests||{};revealed=d.revealed||{};kills=d.kills||{};bossDone=d.bossDone||{};dayT=d.dayT||40;day=d.day||1;return true;}catch(e){return false;}}
setInterval(()=>{if(running)save();},10000);addEventListener('visibilitychange',()=>{if(document.hidden&&running)save();});addEventListener('pagehide',()=>running&&save());

// ---------- main loop ----------
const clock=new THREE.Clock();const camPos=new THREE.Vector3(0,14,12);let hudT=0,regrowT=0;
function tempLabel(b){return b==='snow'?'🥶 Cold':b==='desert'||b==='lava'?'🥵 Heat':'🌡️ Temp';}
function update(dt){const b=biomeAt(P.x,P.z);
 // movement
 let mx=joy.x,mz=joy.y;if(keys.w||keys.arrowup)mz-=1;if(keys.s||keys.arrowdown)mz+=1;if(keys.a||keys.arrowleft)mx-=1;if(keys.d||keys.arrowright)mx+=1;const ml=Math.hypot(mx,mz);
 if(P.dead){mx=mz=0;}
 if(ml>.1){const sp=6.2*Math.min(1,ml)*(inPond(P.x,P.z)?.5:1)*(b==='snow'&&!has('cold_gear')?.8:1);const nx=P.x+mx/Math.max(1,ml)*sp*dt,nz=P.z+mz/Math.max(1,ml)*sp*dt;
  if(!blocked(nx,P.z,.4))P.x=clamp(nx,-W+3,W-3);if(!blocked(P.x,nz,.4))P.z=clamp(nz,-W+3,W-3);P.dir=Math.atan2(mx,mz);setAnim(P.fig,ml>.6?'run':'walk',1);}else if(!P.dead)setAnim(P.fig,'idle');
 if(actHeld&&P.cd<=0)doAttack();P.cd-=dt;
 P.fig.position.set(P.x,H(P.x,P.z),P.z);P.fig.rotation.y=P.dir;tickFig(P.fig,dt);
 // survival
 if(!P.dead){const hot=(b==='desert'&&!has('heat_gear'));P.hunger-=dt*.22;P.thirst-=dt*(hot?.75:.3);
  const fire=nearestStruct('campfire',7);let tgt=0;
  if(b==='snow')P.temp+=has('cold_gear')?(fire?8:1)*dt:(fire?10:night()?-5:-3.5)*dt;
  else if(b==='lava')P.temp+=has('heat_gear')?1*dt:-5*dt;else if(b==='desert')P.temp+=has('heat_gear')?1*dt:(night()?2:-2)*dt;else P.temp+=6*dt;
  P.temp=clamp(P.temp,0,100);P.hunger=clamp(P.hunger,0,100);P.thirst=clamp(P.thirst,0,100);
  if(P.hunger<=0)hurtTick(1.2*dt,'starving');if(P.thirst<=0)hurtTick(1.6*dt,'dehydrated');if(P.temp<=0)hurtTick(3*dt,b==='snow'?'freezing! Craft cold gear':'overheating! Craft heat gear');
  if(inLava(P.x,P.z))hurtTick((has('heat_gear')?6:18)*dt,'in LAVA!');
  if(P.hunger>50&&P.thirst>50&&P.temp>30&&P.hp<100)P.hp=Math.min(100,P.hp+(fire?1.5:.5)*dt);}
 // world
 dayT+=dt;if(Math.floor((dayT-dt)/DAY)<Math.floor(dayT/DAY)){day++;toast('☀️ Day '+day);}
 manageAnimals(dt);updAnimals(dt);updBoss(dt);updFx(dt);
 regrowT-=dt;if(regrowT<=0){regrowT=5;const now=performance.now()/1000;for(const id of [...deadRes]){const o=RES[id];if(o.respawnAt&&now>o.respawnAt&&Math.hypot(o.x-P.x,o.z-P.z)>20){showRes(o);deadRes.delete(id);}}}
 for(const n of NPCS){tickFig(n.fig,dt);const d=Math.hypot(P.x-n.x,P.z-n.z);if(d<8)n.fig.rotation.y=Math.atan2(P.x-n.x,P.z-n.z);}
 // lighting
 const ph=phase(),sunA=ph*Math.PI*2;const dl=clamp(Math.sin(sunA)*1.6+.25,0,1);sun.intensity=.15+2.2*dl;hemi.intensity=.18+.75*dl;
 sun.position.set(P.x+Math.cos(sunA)*40,10+Math.max(.2,Math.sin(sunA))*50,P.z+20);sun.target.position.set(P.x,0,P.z);
 const fc=new THREE.Color(BIOME[b].fog).lerp(new THREE.Color(0x0a1028),1-dl);scene.fog.color.lerp(fc,.05);scene.background.copy(scene.fog.color);
 const f=nearestStruct('campfire',25);if(f){fireLight.position.set(f.x,H(f.x,f.z)+1.5,f.z);fireLight.intensity=(night()?40:8)*(.85+Math.random()*.3);f.mesh.children.forEach(c=>{if(c.userData.flame)c.scale.y=.8+Math.random()*.4;});}else fireLight.intensity=0;
 torchLight.intensity=night()&&has('torch')?30:0;torchLight.position.set(P.x,H(P.x,P.z)+2.5,P.z);
 for(const p of LAVA)if(p.mesh)p.mesh.material.color.setHSL(.04,1,.5+Math.sin(performance.now()/500)*.05);
 // camera
 shake=Math.max(0,shake-dt);camera.position.lerp(V.set(P.x,H(P.x,P.z)+11.5,P.z+9.5),.12);camera.position.x+=(Math.random()-.5)*shake;camera.lookAt(P.x,H(P.x,P.z)+1,P.z);
 // hud
 if(toastT>0){toastT-=dt;if(toastT<=0)$('toast').style.opacity=0;}
 hudT-=dt;if(hudT<=0){hudT=.15;$('hpB').style.width=P.hp+'%';$('huB').style.width=P.hunger+'%';$('thB').style.width=P.thirst+'%';$('waB').style.width=P.temp+'%';$('waL').textContent=tempLabel(b);$('waB').style.background=b==='snow'?'#7fd0ff':b==='desert'||b==='lava'?'#ff7a30':'#f1c40f';
  const hr=Math.floor((ph*24+6)%24);$('info').textContent=`${BIOME[b].n} · Day ${day} · ${night()?'🌙':'☀️'} ${String(hr).padStart(2,'0')}:00`;
  const u=useTarget();$('useL').textContent=u?u.l:'USE';const pr=$('prompt');if(u&&!isTouch){pr.textContent='E: '+u.l;pr.classList.remove('hidden');}else pr.classList.add('hidden');
  $('bShoot').style.display=has('bow')?'flex':'none';equipVisual();drawMap($('minimap'),P.x,P.z,110,true);}
}
let hurtMsgT=0;function hurtTick(d,msg){P.hp-=d;if(hurtMsgT<=0){toast('⚠️ You are '+msg,1.5);hurtMsgT=4;}if(P.hp<=0)die();}
function loop(){requestAnimationFrame(loop);const dt=Math.min(clock.getDelta(),.05);if(running&&!paused){hurtMsgT-=dt;update(dt);}renderer.render(scene,camera);}

// ---------- start ----------
function startGame(cont){audio();$('title').classList.add('hidden');$('hud').classList.remove('hidden');
 if(!P.fig){P.fig=makeFigure({model:'Worker_Male',cloth:0x2e6a8a});scene.add(P.fig);}
 if(!cont&&!running){}running=true;paused=false;clock.getDelta();camera.position.set(P.x,20,P.z+14);
 if(!cont)toast('🏕️ Welcome! Punch trees (10 hits), grab pebbles & bushes, then craft an axe and a pickaxe.<br>Oakhollow village is to the south-east.',6);
 if(isTouch&&!matchMedia('(display-mode: standalone)').matches&&!navigator.standalone)setTimeout(()=>toast('Tip: Share → Add to Home Screen for full-screen play',4),7000);}
function newGame(){if(localStorage.getItem(SAVE_KEY)&&!confirm('Start a new game? Your saved camp will be erased.'))return;localStorage.removeItem(SAVE_KEY);location.hash='new';location.reload();}
$('bNew').onclick=()=>{if(running||P.fig||localStorage.getItem(SAVE_KEY))return newGame();startGame(false);};
$('bCont').onclick=()=>startGame(true);
if(isTouch)$('rot').classList.add('need');
if(/iPhone|iPad/.test(navigator.userAgent)&&!navigator.standalone)$('iosHint').textContent='iPhone: tap Share → Add to Home Screen to play full screen & offline.';
loadP.then(()=>{buildVillages();buildBossArenas();spawnNPCs();const ok=load();$('loadMsg').textContent=ok?'Saved camp found · Day '+day:'Ready!';$('bCont').disabled=!ok;$('bNew').disabled=false;
 if(location.hash==='#new'){history.replaceState(null,'',location.pathname);startGame(false);}window.__ready=true;}).catch(e=>{$('loadMsg').textContent='Load error: '+e.message;});
loop();
if('serviceWorker' in navigator&&location.protocol==='https:')navigator.serviceWorker.register('sw.js');
// test hooks
window.__game={P,get inv(){return inv;},set inv(v){inv=v;},RES,animals:()=>animals,get boss(){return boss;},BOSSES,VILLAGES,NPCS,structs,biomeAt,doAttack,gather,craft,talk,useTarget,spawnAnimal,hitBoss,quests:()=>quests,revealed:()=>revealed,bossDone:()=>bossDone,kills:()=>kills,add,save,teleport:(x,z)=>{P.x=x;P.z=z;},setPaused:v=>paused=v,night,setDay:t=>dayT=t,closeDlg,startGame};
