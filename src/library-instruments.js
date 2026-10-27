import * as THREE from 'three';
import {createLibraryArmchair} from './library-armchair.js';

export function addLibraryInstruments(root,{walnut,trim,brass,iron}){
 const ivory=new THREE.MeshStandardMaterial({color:0xc4bda2,roughness:.6});
 const ebony=new THREE.MeshStandardMaterial({color:0x191c19,roughness:.38});
 const felt=new THREE.MeshStandardMaterial({color:0x472f25,roughness:1});
 const pianoWood=new THREE.MeshPhysicalMaterial({color:0x30261e,roughness:.79,clearcoat:.035,clearcoatRoughness:.8});
 // Fine longitudinal grain with low-contrast color and a matte microrelief.
 const grainData=new Uint8Array(128*256*4);
 for(let y=0;y<256;y++)for(let x=0;x<128;x++){
  const warp=x+1.8*Math.sin(y*.027)+.65*Math.sin(y*.071+x*.08);
  const fiber=Math.sin(warp*2.5+y*.018)*.45+Math.sin(warp*6.8)*.2;
  const noise=Math.sin(x*127.1+y*311.7)*43758.5453;
  const value=Math.round(191+fiber*22+(noise-Math.floor(noise)-.5)*12),i=(y*128+x)*4;
  grainData[i]=value;grainData[i+1]=value;grainData[i+2]=value;grainData[i+3]=255;
 }
 const grain=new THREE.DataTexture(grainData,128,256);grain.wrapS=grain.wrapT=THREE.RepeatWrapping;grain.repeat.set(2,1);grain.needsUpdate=true;
 pianoWood.map=grain;pianoWood.bumpMap=grain;pianoWood.bumpScale=.0012;pianoWood.roughnessMap=grain;
 const pianoWalnut=walnut.clone(),pianoTrim=trim.clone();
 for(const m of [pianoWalnut,pianoTrim]){m.map=grain;m.bumpMap=grain;m.bumpScale=.0012;m.roughness=.82;m.metalness=0;}
 const boxGeometry=new THREE.BoxGeometry(1,1,1);
 function box(parent,w,h,d,x,y,z,material){const o=new THREE.Mesh(boxGeometry,material);o.scale.set(w,h,d);o.position.set(x,y,z);parent.add(o);return o;}
 function cylinder(parent,r1,r2,h,x,y,z,material){const o=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,24),material);o.position.set(x,y,z);parent.add(o);return o;}
 function bar(parent,a,b,r,material){const d=b.clone().sub(a),o=cylinder(parent,r,r,d.length(),0,0,0,material);o.position.copy(a).add(b).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());return o;}
 function ring(parent,r,t,x,y,z,material){const o=new THREE.Mesh(new THREE.TorusGeometry(r,t,10,64),material);o.position.set(x,y,z);parent.add(o);return o;}
 const piano=new THREE.Group();piano.name='立式钢琴 · 88键踏板谱架';piano.position.set(-3.4,-2.35,-5.05);piano.rotation.y=.08;root.add(piano);
 // Paneled upright case with lid overhang, shoulder pilasters and recessed soundboard.
 box(piano,2.65,2.18,.54,0,1.17,-.12,pianoWood);
 box(piano,2.79,.12,.66,0,2.31,-.08,trim);box(piano,2.75,.035,.64,0,2.39,-.08,brass);
 box(piano,2.38,1.01,.06,0,1.69,.18,walnut);
 for(const x of [-1.18,0,1.18])box(piano,.04,1.04,.04,x,1.69,.23,trim);
 for(const y of [1.18,2.2])box(piano,2.4,.035,.04,0,y,.23,trim);
 for(const x of [-1.31,1.31]){
  box(piano,.15,2.12,.67,x,1.17,-.06,trim);
  box(piano,.18,.14,.8,x,1.23,.09,pianoWood);
  cylinder(piano,.055,.075,.88,x,.55,.42,pianoWood);
  box(piano,.22,.08,.36,x,.075,.35,trim);
  const caster=cylinder(piano,.04,.04,.045,x,.035,.35,brass);caster.rotation.z=Math.PI/2;
 }
 box(piano,2.57,.13,.8,0,1.06,.28,pianoWood);box(piano,2.58,.025,.76,0,1.14,.29,felt);
 // 52 white and 36 raised black keys, with the correct repeating CDE / FGAB pattern.
 const keyWidth=2.44/52;
 for(let i=0;i<52;i++){
  const x=-1.22+(i+.5)*keyWidth;
  box(piano,keyWidth-.002,.035,.47,x,1.167,.46,ivory);
  box(piano,keyWidth-.002,.06,.018,x,1.14,.7,ivory);
  if(i<51&&![1,4].includes(i%7))box(piano,keyWidth*.59,.067,.285,x+keyWidth/2,1.21,.335,ebony);
 }
 box(piano,2.5,.035,.03,0,1.19,.216,brass);
 box(piano,2.38,.76,.04,0,.61,.184,walnut);box(piano,2.26,.64,.025,0,.61,.21,pianoWood);
 for(const x of [-.16,0,.16]){
  bar(piano,new THREE.Vector3(x,.12,.16),new THREE.Vector3(x,.11,.61),.022,brass);
  const pedal=new THREE.Mesh(new THREE.SphereGeometry(.063,16,8),brass);pedal.scale.set(.7,.24,1.5);pedal.position.set(x,.11,.61);piano.add(pedal);
 }
 const rack=new THREE.Group();rack.position.set(0,1.39,.25);rack.rotation.x=-.13;piano.add(rack);
 box(rack,1.16,.54,.035,0,.24,0,trim);box(rack,1.2,.045,.12,0,-.02,.035,pianoWood);
 // An open score uses modeled paper and fine stave lines, with a center fold.
 for(const side of [-1,1]){
  const page=new THREE.Group();page.position.set(side*.245,.27,.027);page.rotation.y=-side*.06;rack.add(page);
  box(page,.47,.49,.005,0,0,0,ivory);
  for(let stave=0;stave<3;stave++)for(let line=0;line<5;line++)box(page,.39,.0015,.001,0,.15-stave*.13-line*.013,.004,iron);
  for(let note=0;note<13;note++){const x=-.17+(note%5)*.077,y=.12-Math.floor(note/5)*.13+(note%3)*.012;const dot=new THREE.Mesh(new THREE.SphereGeometry(.006,6,4),iron);dot.scale.y=.6;dot.position.set(x,y,.006);page.add(dot);box(page,.0015,.035,.001,x+.005,y+.014,.006,iron);}
 }
 const stool=new THREE.Group();stool.position.set(0,.43,1.05);piano.add(stool);
 box(stool,.85,.13,.42,0,0,0,ebony);for(const x of [-.34,.34])for(const z of [-.14,.14])box(stool,.045,.4,.045,x,-.24,z,trim);
 piano.traverse(part=>{if(!part.isMesh)return;if(part.material===walnut)part.material=pianoWalnut;else if(part.material===trim)part.material=pianoTrim;part.geometry=part.geometry.clone();part.updateWorldMatrix(true,false);const intoPiano=new THREE.Matrix4().copy(piano.matrixWorld).invert().multiply(part.matrixWorld),back=intoPiano.clone().invert(),p=part.geometry.attributes.position,v=new THREE.Vector3();for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i).applyMatrix4(intoPiano);if(v.y>1.25)v.y=1.25+(v.y-1.25)*.45;v.applyMatrix4(back);p.setXYZ(i,v.x,v.y,v.z);}part.geometry.computeVertexNormals();});
 // Pomegranate cloth rests on the lowered cabinet, then folds over its left edge.
 const drapeGeometry=new THREE.PlaneGeometry(1,1,36,52),drapePositions=drapeGeometry.attributes.position;
 for(let i=0;i<drapePositions.count;i++){
  const u=drapePositions.getX(i),t=drapePositions.getY(i)+.5;
  const length=t*1.85,edge=.58,radius=.06;
  let x,y;
  const fold=Math.sin(u*32+t*3)*.012+Math.sin(u*17-t*5)*.008;
  if(length<=edge){x=-.84-length;y=1.82+fold;}
  else if(length<=edge+radius*Math.PI/2){const angle=(length-edge)/radius;x=-1.42-radius*Math.sin(angle);y=1.82-radius*(1-Math.cos(angle))+fold*.25;}
  else{const fall=length-edge-radius*Math.PI/2;x=-1.48+fold-.015*Math.sin(fall*2.7);y=1.76-fall;}
  drapePositions.setXYZ(i,x,y,-.08+u*.63+.018*Math.sin(t*8+u*5));
 }
 drapeGeometry.computeVertexNormals();
 const drapeMaterial=new THREE.MeshPhysicalMaterial({color:0x872b42,roughness:.88,side:THREE.DoubleSide,sheen:.65,sheenColor:0xb34c5c,sheenRoughness:.85});
 const pianoDrape=new THREE.Mesh(drapeGeometry,drapeMaterial);pianoDrape.name='钢琴左侧 · 石榴红垂布';pianoDrape.castShadow=true;pianoDrape.receiveShadow=true;piano.add(pianoDrape);
 const armchair=createLibraryArmchair();armchair.position.set(-6.4,-2.395,-5.08);armchair.rotation.y=Math.PI/6;root.add(armchair);
 const player=new THREE.Group();player.name='半球音乐播放器 · 弧壳号角与控制面板';player.position.set(-5.4,-.98,-3.1);player.rotation.y=Math.PI/4;root.add(player);
 const shellMaterial=new THREE.MeshPhysicalMaterial({color:0x5d5140,metalness:.45,roughness:.4,clearcoat:.15});
 const enamel=new THREE.MeshPhysicalMaterial({color:0x54756b,roughness:.48,clearcoat:.12});
 const back=new THREE.Mesh(new THREE.SphereGeometry(.57,48,28,Math.PI,Math.PI),shellMaterial);player.add(back);
 ring(player,.565,.027,0,0,.015,trim);ring(player,.525,.009,0,0,.046,brass);
 const upperFace=new THREE.Mesh(new THREE.CircleGeometry(.515,48,0,Math.PI),enamel);upperFace.position.z=.023;player.add(upperFace);
 // A shallow dome gives the opening depth; control shelf sits in the lower hemisphere.
 const hood=new THREE.Mesh(new THREE.SphereGeometry(.545,48,24,0,Math.PI,0,Math.PI/2),new THREE.MeshPhysicalMaterial({color:0x7f9c88,transparent:true,opacity:.15,depthWrite:false,roughness:.2}));hood.scale.z=.28;player.add(hood);
 box(player,1,.04,.31,0,-.075,.12,brass);box(player,.86,.2,.045,0,-.2,.26,shellMaterial);
 box(player,.74,.09,.012,0,-.17,.29,ivory);box(player,.66,.045,.008,0,-.17,.301,iron);
 for(let i=0;i<23;i++)box(player,.002,i%5===0?.032:.018,.004,-.3+i*.027,-.166,.309,brass);
 box(player,.008,.05,.006,.09,-.17,.318,ivory);
 for(const x of [-.33,.33]){const dial=cylinder(player,.04,.04,.027,x,-.26,.31,brass);dial.rotation.x=Math.PI/2;}
 for(let i=0;i<13;i++)box(player,.57,.004,.013,0,-.325-i*.009,.18,iron);
 // One sculpted trumpet pedestal replaces the side braces and tripod feet.
 const pedestalProfile=[[0,-1.38],[.36,-1.38],[.385,-1.365],[.385,-1.335],[.34,-1.315],[.28,-1.27],[.21,-1.19],[.145,-1.08],[.105,-.94],[.085,-.78],[.085,-.59],[.105,-.55],[.105,-.51],[0,-.51]];
 const pedestal=new THREE.Mesh(new THREE.LatheGeometry(pedestalProfile.map(([r,y])=>new THREE.Vector2(r,y)),64),shellMaterial);pedestal.name='播放器底座 · 喇叭口';pedestal.position.z=-.03;player.add(pedestal);
 const footRim=ring(player,.37,.009,0,-1.35,-.03,brass);footRim.rotation.x=Math.PI/2;
 const collar=ring(player,.099,.008,0,-.55,-.03,brass);collar.rotation.x=Math.PI/2;
 // Flared brass acoustic horn, including a dark recessed mouth and rolled lip.
 const horn=new THREE.Group();horn.name='播放器上方号角 · 朝前';horn.position.set(.39,.29,-.12);horn.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(0,.18,1).normalize());player.add(horn);
 const profile=[[.033,0],[.037,.12],[.055,.24],[.095,.36],[.17,.47],[.26,.53],[.28,.535],[.28,.55],[.255,.555],[.15,.485],[.08,.38],[.04,.25],[.027,.12],[.027,0]];
 horn.add(new THREE.Mesh(new THREE.LatheGeometry(profile.map(([r,y])=>new THREE.Vector2(r,y)),48),brass));
 const lip=ring(horn,.272,.011,0,.547,0,brass);lip.rotation.x=Math.PI/2;
 const throat=new THREE.Mesh(new THREE.CircleGeometry(.065,32),iron);throat.rotation.x=-Math.PI/2;throat.position.y=.27;horn.add(throat);
 return {piano,player};
}
