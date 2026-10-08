import * as THREE from './vendor/three.module.js';
import {ORES,SHAPES,FURNACES,clamp} from './game.js';
export class Workshop{
constructor(container){
this.el=container;this.stage='prepare';this.clock=0;this.hitTime=-10;this.particles=[];this.drag=null;this.angle=.63;this.elevation=.64;this.distance=14.2;
this.scene=new THREE.Scene();this.scene.background=new THREE.Color('#293936');this.scene.fog=new THREE.Fog('#293936',17,33);
this.renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.8));this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;this.renderer.outputColorSpace=THREE.SRGBColorSpace;this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.3;container.append(this.renderer.domElement);
this.camera=new THREE.PerspectiveCamera(37,1,.1,70);this.target=new THREE.Vector3(0,1,0);
this.scene.add(new THREE.HemisphereLight('#c9e4d4','#302117',2));
const sun=new THREE.DirectionalLight('#ffdea8',3.1);sun.position.set(-5,10,7);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-9,right:9,top:9,bottom:-9,near:.1,far:30});sun.shadow.bias=-.001;sun.shadow.normalBias=.025;this.scene.add(sun);
const fill=new THREE.DirectionalLight('#90b6b4',1.8);fill.position.set(6,5,-4);this.scene.add(fill);
this.fireLight=new THREE.PointLight('#ff7725',30,7,2);this.fireLight.position.set(-1.95,1.45,-1.45);this.scene.add(this.fireLight);
this.materials=new Map();this.build();this.makeBlade('longsword','#acb7af');this.resize();new ResizeObserver(()=>this.resize()).observe(container);
const canvas=this.renderer.domElement;
canvas.addEventListener('pointerdown',e=>{this.drag={x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId)});
canvas.addEventListener('pointermove',e=>{if(!this.drag)return;this.angle-=(e.clientX-this.drag.x)*.006;this.elevation=clamp(this.elevation+(e.clientY-this.drag.y)*.005,.3,1.2);this.drag={x:e.clientX,y:e.clientY}});
canvas.addEventListener('pointerup',()=>this.drag=null);canvas.addEventListener('pointercancel',()=>this.drag=null);
canvas.addEventListener('wheel',e=>{e.preventDefault();this.distance=clamp(this.distance+e.deltaY*.008,7.5,17)},{passive:false});
}
mat(color,roughness=.9,metalness=0){const k=color+roughness+metalness;if(!this.materials.has(k))this.materials.set(k,new THREE.MeshStandardMaterial({color,roughness,metalness,flatShading:true}));return this.materials.get(k)}
mesh(geo,color,pos,group=this.scene,metal=0){const m=new THREE.Mesh(geo,this.mat(color,.85,metal));m.position.set(...pos);m.castShadow=true;m.receiveShadow=true;group.add(m);return m}
box(w,h,d,color,x,y,z,group=this.scene){return this.mesh(new THREE.BoxGeometry(w,h,d),color,[x,y,z],group)}
cyl(rt,rb,h,color,x,y,z,n=9,group=this.scene){return this.mesh(new THREE.CylinderGeometry(rt,rb,h,n),color,[x,y,z],group)}
rock(x,y,z,size,color,group=this.scene){const m=this.mesh(new THREE.DodecahedronGeometry(size,0),color,[x,y,z],group);m.rotation.set(x*3,z*2,x+z);m.scale.set(1,.75,.8);return m}
beam(a,b,r,color,group=this.scene){const d=new THREE.Vector3(...b).sub(new THREE.Vector3(...a));const m=this.cyl(r,r,d.length(),color,...new THREE.Vector3(...a).add(new THREE.Vector3(...b)).multiplyScalar(.5).toArray(),6,group);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());return m}
build(){
const soil=this.box(8.6,.48,7.7,'#554a37',0,-.42,0);this.box(8.8,.14,7.9,'#65715a',0,-.16,0);
this.box(6.8,.25,5.7,'#4d4435',0,-.03,-.1);
for(let x=0;x<12;x++)for(let z=0;z<10;z++){const colors=['#797663','#6d705e','#74715e','#686d5a'];const t=this.box(.55,.08,.55,colors[(x*3+z*7)%4],-3.06+x*.557,.13,-2.57+z*.557);t.rotation.y=((x+z)%3-1)*.01;}
this.box(6.9,2.65,.23,'#999884',0,1.49,-2.96);
this.box(.23,1.15,4.1,'#878675',-3.35,.77,-.97);
for(let i=0;i<11;i++){this.box(.62,.14,.28,i%2?'#6e705f':'#787765',-3.08+i*.62,.23,-2.78);}
for(const x of [-3.25,0,3.25]){this.box(.25,3.5,.27,'#4d3929',x,1.9,-2.8);this.box(.33,.12,.34,'#2d322b',x,.34,-2.8)}
this.box(6.9,.3,.35,'#533c28',0,3.35,-2.8);
this.box(.29,3.55,.29,'#574330',-3.3,1.92,2.4);this.box(.36,.18,.36,'#38382d',-3.3,.38,2.4);
this.box(.32,.27,5.7,'#59422e',-3.3,3.6,-.1);
this.beam([-3.3,2.8,2.4],[-3.3,3.55,1.55],.1,'#614733');
this.beam([-3.3,2.8,-2.8],[-3.3,3.55,-1.85],.1,'#614733');
for(let z=0;z<4;z++){this.box(.4,.08,.06,'#b0a387',-3.05,2.1+z*.35,-2.8);}
const furnace=new THREE.Group();furnace.position.set(-1.75,0,-1.55);this.scene.add(furnace);
this.box(2.05,.3,1.6,'#55594c',0,.31,0,furnace);
this.box(1.7,.33,1.35,'#6b6b59',0,.6,0,furnace);
this.box(1.7,1.1,.35,'#696c5d',0,1.21,-.52,furnace);
for(let side of [-1,1])for(let i=0;i<4;i++){this.box(.38,.24,1.18,i%2?'#83836b':'#767960',side*.68,.85+i*.25,0,furnace)}
this.box(1.07,.77,.14,'#30291e',0,1.19,-.12,furnace);
for(let i=0;i<7;i++){const a=Math.PI*i/6;const b=this.box(.31,.37,1.13,i%2?'#878770':'#969279',Math.cos(a)*.57,1.58+Math.sin(a)*.5,0,furnace);b.rotation.z=a-Math.PI/2}
this.box(1.5,.24,1.35,'#5b6253',0,2.22,0,furnace);
for(let i=0;i<7;i++){this.box(.94-i*.025,.27,.91-i*.03,i%2?'#777c69':'#858675',0,2.46+i*.27,-.12,furnace);this.box(.02,.025,.02,'#6c6f60',0,2.4+i*.27,.35,furnace)}
this.box(1.05,.18,1.01,'#555e50',0,4.22,-.12,furnace);
this.coals=[];for(let i=0;i<15;i++){const x=Math.sin(i*8.2)*.43,z=Math.cos(i*4.2)*.35;const coal=this.rock(x,.78,z,.12,i%3?'#402a1c':'#ff9d34',furnace);this.coals.push(coal);}
this.flames=[];for(let i=0;i<7;i++){const flame=new THREE.Mesh(new THREE.ConeGeometry(.11+(i%3)*.025,.5+(i%4)*.09,5),new THREE.MeshBasicMaterial({color:i%2?'#ffbd53':'#e76e26',transparent:true,opacity:.85}));flame.position.set(Math.sin(i*9)*.35,1.03,Math.cos(i*8)*.23+.2);furnace.add(flame);this.flames.push(flame);}
this.box(.18,.64,.2,'#302f27',-.62,.35,.86,furnace);this.box(.18,.64,.2,'#302f27',.62,.35,.86,furnace);this.box(1.6,.12,.65,'#666659',0,.73,.7,furnace);
for(let i=0;i<4;i++){const log=this.cyl(.13,.16,1.05,'#655034',-2.5+(i%2)*.29,.31+Math.floor(i/2)*.24,-.2,7);log.rotation.z=Math.PI/2}
this.cyl(.62,.72,.83,'#675037',.1,.59,.9,11);this.cyl(.62,.63,.075,'#8b7552',.1,1.025,.9,11);
for(let i=0;i<10;i++){const a=i*Math.PI/5;this.box(.045,.72,.045,'#473b2d',.1+Math.sin(a)*.64,.59,.9+Math.cos(a)*.64)}
this.cyl(.66,.67,.06,'#303a36',.1,.34,.9,11);
this.box(1.1,.16,.68,'#344247',.1,1.13,.9);this.box(.55,.35,.45,'#526065',.1,1.37,.9);
this.box(1.25,.18,.59,'#81908c',.1,1.6,.9);
const horn=this.mesh(new THREE.ConeGeometry(.25,.78,5),'#748581',[-.83,1.58,.9]);horn.rotation.z=Math.PI/2;horn.scale.z=.9;
this.box(.31,.2,.43,'#617773',.82,1.54,.9);
this.box(.16,.012,.12,'#344843',.57,1.698,.95);
this.hammer=new THREE.Group();this.hammer.position.set(.35,2.3,1.05);this.scene.add(this.hammer);
this.beam([0,-.28,0],[0,.75,0],.065,'#a48255',this.hammer);this.box(.52,.24,.28,'#535d5c',0,-.27,0,this.hammer);this.box(.055,.25,.29,'#b2b6a5',-.28,-.27,0,this.hammer);this.hammer.rotation.z=-.65;
this.box(2.1,.18,.85,'#896f4a',1.93,1.26,-2.03);
for(const x of [1.05,2.81])for(const z of [-2.34,-1.74])this.box(.14,1.08,.14,'#655239',x,.66,z);
this.box(1.92,.1,.65,'#685637',1.93,.47,-2.03);
for(let i=0;i<6;i++)this.rock(1.17+i*.28,1.44,-2.0+(i%2)*.14,.15,['#a77450','#708b89','#606458'][i%3]);
this.box(1.6,.12,.16,'#55432f',1.72,2.33,-2.7);this.box(1.6,.12,.16,'#55432f',1.72,1.84,-2.7);
for(let i=0;i<3;i++){const sword=this.sword('longsword',['#869995','#99aaa3','#b3a78d'][i]);sword.scale.setScalar(.53);sword.rotation.z=Math.PI;sword.position.set(1.1+i*.53,2.68,-2.6);this.scene.add(sword);}
this.barrel(2.58,.62,.65,.45);this.barrel(2.5,.59,1.76,.42);
const bucket=this.cyl(.43,.34,.64,'#745c3b',1.8,.48,1.98,12);this.cyl(.44,.44,.07,'#384442',1.8,.76,1.98,12);this.cyl(.37,.37,.015,'#4f8580',1.8,.74,1.98,24);
this.cyl(.36,.38,.06,'#414940',1.8,.32,1.98,12);
this.rock(-1.65,.36,2.25,.36,'#738579');this.rock(-1.22,.31,2.36,.27,'#958b70');
this.box(.96,.58,.75,'#796141',-2.5,.48,1.35);for(let i=0;i<5;i++)this.box(.99,.035,.04,'#493e2b',-2.5,.28+i*.1,1.74);
this.box(.07,.61,.77,'#a18353',-2.86,.48,1.35);this.box(.07,.61,.77,'#a18353',-2.15,.48,1.35);
this.cyl(.22,.23,.05,'#252c27',2.65,1.4,-2.12);this.cyl(.11,.15,.18,'#b69763',2.65,1.5,-2.12,8);
this.cyl(.035,.055,.06,'#ffe1a0',2.65,1.63,-2.12,6);
const lantern=new THREE.PointLight('#ffd78d',2,3);lantern.position.set(2.65,1.78,-2.12);this.scene.add(lantern);
for(let i=0;i<28;i++){const x=Math.sin(i*17.31)*4.1,z=Math.cos(i*6.83)*3.65;if(Math.abs(x)<3.5&&Math.abs(z)<2.9)continue;this.rock(x,-.02,z,.09+(i%3)*.06,['#8c9177','#787e67','#677863'][i%3]);}
for(let i=0;i<45;i++){const x=Math.sin(i*13.76)*4.2,z=Math.cos(i*7.43)*3.73;if(Math.abs(x)<3.5&&Math.abs(z)<2.95)continue;this.grass(x,z,i);}
this.tree(-4.1,-2.7,1.0);this.tree(3.9,-3.2,.9);this.tree(-4.1,1.05,.7);
this.box(10,.15,9.1,'#263b34',0,-.72,0);
const ground=this.mesh(new THREE.PlaneGeometry(200,200),'#293936',[0,-.81,0]);ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;ground.castShadow=false;
}
barrel(x,y,z,r){this.cyl(r*.93,r*.93,1.0,'#826742',x,y,z,12);for(const dy of [-.34,.3])this.cyl(r*.96,r*.96,.07,'#3b4942',x,y+dy,z,12);this.cyl(r*.9,r*.9,.035,'#a58a59',x,y+.51,z,12);for(let i=0;i<10;i++){const a=i*Math.PI/5;this.beam([x+Math.sin(a)*r*.94,y-.44,z+Math.cos(a)*r*.94],[x+Math.sin(a)*r*.94,y+.45,z+Math.cos(a)*r*.94],.01,'#4f432e');}}
grass(x,z,i){for(let j=0;j<3;j++){const m=this.mesh(new THREE.ConeGeometry(.05,.22+j*.08,3),['#8d9b61','#768b59','#a29f67'][i%3],[x+j*.055,.03,z+j*.025]);m.rotation.z=(j-1)*.3;}}
tree(x,z,size){this.cyl(.1*size,.17*size,2*size,'#655441',x,.65*size,z,6);for(let k=0;k<3;k++)this.mesh(new THREE.ConeGeometry((.85-k*.16)*size,1.5*size,6),['#3d5848','#496751','#54735a'][k],[x,(1.2+k*.6)*size,z]);}
sword(shapeId,color){
const sh=SHAPES.find(x=>x.id===shapeId);const g=new THREE.Group();const L=sh.length,w=sh.width;
const shape=new THREE.Shape();shape.moveTo(-w,0);shape.lineTo(w,0);
if(shapeId==='katana'){shape.quadraticCurveTo(w+.1,L*.6,w+.28,L*.92);shape.lineTo(.25,L);shape.quadraticCurveTo(-w+.07,L*.48,-w,0);}
else if(shapeId==='falchion'){shape.lineTo(w*1.5,L*.74);shape.lineTo(w*.5,L);shape.lineTo(-w*.9,L*.86);shape.lineTo(-w,0);}
else{shape.lineTo(w*.8,L*.82);shape.lineTo(0,L);shape.lineTo(-w*.8,L*.82);shape.closePath();}
const geo=new THREE.ExtrudeGeometry(shape,{depth:.07,bevelEnabled:true,bevelThickness:.035,bevelSize:.035,bevelSegments:1,steps:1});
const blade=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color,metalness:.76,roughness:.3,flatShading:true}));blade.castShadow=true;g.add(blade);g.userData.blade=blade;
const ridge=this.box(.027,L*.76,.09,'#c3d1c5',0,L*.4,.035,g);g.userData.ridge=ridge;
this.box(shapeId==='greatsword'?.9:.68,.09,.14,'#c2a36a',0,-.025,.035,g);
this.cyl(.064,.064,shapeId==='greatsword'?.58:.37,'#584332',0,shapeId==='greatsword'?-.33:-.23,.03,8,g);
for(let i=0;i<5;i++)this.cyl(.069,.069,.02,'#9c7950',0,-.1-i*.061,.03,8,g);
this.mesh(new THREE.OctahedronGeometry(.115),'#c9ac72',[0,shapeId==='greatsword'?-.68:-.47,.03],g);
if(shapeId==='rapier'){const guard=new THREE.Mesh(new THREE.TorusGeometry(.23,.027,6,18),this.mat('#b6a475'));guard.position.set(.05,-.18,.035);g.add(guard);}
return g;
}
makeBlade(shape,color){if(this.blade){this.scene.remove(this.blade);this.blade.traverse(o=>{if(o.isMesh){o.geometry.dispose();if(![...this.materials.values()].includes(o.material))o.material.dispose();}})}this.blade=this.sword(shape,color);this.scene.add(this.blade);this.blade.rotation.set(-Math.PI/2,0,-Math.PI/2);this.blade.scale.setScalar(.65);this.blade.position.set(-.56,1.75,.87);}
setState(state){const c=state.session,shape=c?.shape||state.selection.shape,ore=ORES.find(o=>o.id===(c?.ore||state.selection.ore));if(this.shape!==shape||this.ore!==ore.id){this.makeBlade(shape,ore.color);this.shape=shape;this.ore=ore.id;}this.stage=c?.stage||'prepare';this.hits=c?.hits||0;this.furnaceLevel=state.furnace;this.blade.visible=this.stage!=='smelting';const mat=this.blade.userData.blade.material;mat.emissive.set(this.stage==='forging'?'#eb5922':'#000000');mat.emissiveIntensity=this.stage==='forging'?.8:0;this.blade.userData.ridge.visible=this.stage!=='forging';}
hit(broken=false){this.hitTime=this.clock;this.spark(.1,1.83,.9,broken?55:32);this.broken=broken;}
spark(x,y,z,count=30){for(let i=0;i<count;i++){const p=new THREE.Mesh(new THREE.BoxGeometry(.025,.025,.025),new THREE.MeshBasicMaterial({color:i%3?'#ffd77a':'#ff762b'}));p.position.set(x,y,z);this.scene.add(p);this.particles.push({mesh:p,v:new THREE.Vector3((Math.random()-.5)*4,1+Math.random()*3,(Math.random()-.5)*4),life:.5+Math.random()*.6});}}
reset(){this.angle=.63;this.elevation=.64;this.distance=14.2;}
resize(){const w=this.el.clientWidth,h=this.el.clientHeight;if(!w||!h)return;this.renderer.setSize(w,h);this.camera.aspect=w/h;this.camera.updateProjectionMatrix();}
update(dt){this.clock+=dt;const t=this.clock;this.camera.position.set(this.target.x+Math.sin(this.angle)*Math.cos(this.elevation)*this.distance,this.target.y+Math.sin(this.elevation)*this.distance,this.target.z+Math.cos(this.angle)*Math.cos(this.elevation)*this.distance);this.camera.lookAt(this.target);
this.flames.forEach((f,i)=>{f.scale.y=.8+Math.sin(t*8+i*3)*.25+(this.stage==='smelting'?.5:0);f.rotation.y=t*.7+i;});
this.fireLight.intensity=(this.stage==='smelting'?42:26)+Math.sin(t*9)*4;
this.hammer.visible=this.stage==='forging';const age=t-this.hitTime;this.hammer.rotation.z=age<.35?-.65+Math.sin(age/.35*Math.PI)*1.5:-.65;this.hammer.position.y=age<.35?2.3-Math.sin(age/.35*Math.PI)*.4:2.3+Math.sin(t*2)*.04;
if(this.stage==='finished'){this.blade.rotation.set(0,t*.28,Math.PI/6);this.blade.position.set(.1,1.25+Math.sin(t*1.6)*.06,.95);this.blade.scale.setScalar(.8);}
else {this.blade.rotation.set(-Math.PI/2,0,-Math.PI/2);this.blade.position.set(-.56,1.75,.87);this.blade.scale.set(.65,this.stage==='forging'?.38+Math.min(this.hits,12)*.023:.65,.65);}
if(this.stage==='broken'){this.blade.rotation.z=-1.75;this.blade.scale.y=.22;}
for(let i=this.particles.length-1;i>=0;i--){const p=this.particles[i];p.life-=dt;p.v.y-=dt*7;p.mesh.position.addScaledVector(p.v,dt);if(p.life<=0){this.scene.remove(p.mesh);p.mesh.geometry.dispose();p.mesh.material.dispose();this.particles.splice(i,1);}}
if(this.stage==='smelting'&&Math.random()<dt*3)this.spark(-1.8,1.14,-1.3,2);
this.renderer.render(this.scene,this.camera);
}
}

