import * as THREE from 'three';
import {buildSpinningWheelA} from './spinning-wheel-a.js';
import { createWoodMaterial } from './wood-material.js';
import {createRitualState,pullRitual,updateRitual,releaseRitual,grabRitual} from './ritual-state.js';
import {pointerAngle,signedAngleDelta} from './angular-drag.js';
import {createTangentBelt} from './tangent-belt.js';
import {sampleWheelSettle,settlingDuration} from './wheel-settle.js';

// Procedural reconstruction of the wooden spinning wheel in the user's recording.
export function createSpinningWheel(scene, camera, canvas) {
  const root = new THREE.Group();
  root.position.set(0, -2.825, 0);
  root.rotation.y = -0.2;
  scene.add(root);
  const wood = createWoodMaterial(0x87502e, 2);
  const edge = createWoodMaterial(0xb47845, 1);
  const dark = createWoodMaterial(0x493423, 2);
  const brass = new THREE.MeshStandardMaterial({color:0xbb9555,roughness:.35,metalness:.78});
  const thread = new THREE.MeshStandardMaterial({color:0x9d8768, emissive:0xff1205, emissiveIntensity:0, roughness:.3, metalness:.3});
  function mesh(geometry,material,parent=root){const m=new THREE.Mesh(geometry,material);parent.add(m);return m;}
  function rod(a,b,r=.035,material=wood,parent=root){
    const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),delta=end.clone().sub(start);
    const m=mesh(new THREE.CylinderGeometry(r*.8,r,delta.length(),12),material,parent);
    m.position.copy(start).add(end).multiplyScalar(.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());return m;
  }
  function plank(w,h,d,x,y,z,material=wood,parent=root){const m=mesh(new THREE.BoxGeometry(w,h,d),material,parent);m.position.set(x,y,z);return m;}
  // Trestle base, joints and treadle.
  plank(2.65,.13,.6,-.25,.21,0);
  for(const x of [-1.3,.75])for(const z of [-.26,.26])rod([x,.22,z],[x+(x<0?-.12:.12),.015,z*1.55],.048,dark);
  let treadle=plank(.68,.045,.34,-.88,.13,.48,edge);treadle.rotation.z=-.05;
  for(const z of [-.22,.22]){
    rod([.11,.25,z],[.53,1.32,z],.055);
    rod([1.13,.25,z],[.53,1.32,z],.055);
  }
  rod([.53,1.32,-.42],[.53,1.32,.42],.075,brass);
  let wheel=new THREE.Group();wheel.position.set(.53,1.32,0);root.add(wheel);
  for(const z of [-.07,.07]){
    const rim=mesh(new THREE.TorusGeometry(1.06,.065,14,144),wood,wheel);rim.position.z=z;
    const trim=mesh(new THREE.TorusGeometry(1.065,.012,6,112),edge,wheel);trim.position.z=z*1.5;
  }
  for(let i=0;i<12;i++){
    const a=i*Math.PI/6,x=Math.cos(a),y=Math.sin(a);
    const profile=[new THREE.Vector2(.027,0),new THREE.Vector2(.044,.06),new THREE.Vector2(.023,.14),new THREE.Vector2(.02,.46),new THREE.Vector2(.037,.53),new THREE.Vector2(.039,.57),new THREE.Vector2(.019,.64),new THREE.Vector2(.024,.86),new THREE.Vector2(.033,.91)];
    const spoke=mesh(new THREE.LatheGeometry(profile,12),edge,wheel);
    spoke.position.set(x*.13,y*.13,0);spoke.rotation.z=a-Math.PI/2;
    const bead=mesh(new THREE.SphereGeometry(.042,10,8),wood,wheel);bead.position.set(x*.78,y*.78,0);bead.scale.set(.7,1.25,.7);
  }
  const hub=mesh(new THREE.CylinderGeometry(.12,.12,.26,20),wood,wheel);hub.rotation.x=Math.PI/2;
  const cap=mesh(new THREE.SphereGeometry(.075,12,8),brass,wheel);cap.position.z=.18;
  // Smaller flyer, spool and the drive cord beside the large wheel.
  for(const z of [-.18,.18])rod([-1.25,.28,z],[-1.25,1.24,z],.035);
  rod([-1.25,1.22,-.26],[-1.25,1.22,.26],.045,brass);
  let flyer=new THREE.Group();flyer.position.set(-1.25,1.22,0);root.add(flyer);
  const bobbin=mesh(new THREE.CylinderGeometry(.075,.075,.36,16),edge,flyer);bobbin.rotation.x=Math.PI/2;
  for(const z of [-.19,.19]){const disc=mesh(new THREE.CylinderGeometry(.14,.14,.022,20),dark,flyer);disc.rotation.x=Math.PI/2;disc.position.z=z;}
  for(const sign of [-1,1]){rod([0,0,-.2],[sign*.2,.02,-.12],.013,brass,flyer);rod([sign*.2,.02,-.12],[sign*.2,.02,.21],.013,brass,flyer);}
  // Turned finials, collars, wheel-rim joints and carved spindle supports.
  for(const x of [-1.25])for(const z of [-.18,.18]){
    rod([x,.3,z],[x,1.55,z],.037,dark);
    for(const y of [1.15,1.4,1.48]){const collar=mesh(new THREE.TorusGeometry(.045,.012,8,18),edge);collar.rotation.x=Math.PI/2;collar.position.set(x,y,z);}
    const finial=mesh(new THREE.SphereGeometry(.06,12,8),edge);finial.position.set(x,1.55,z);finial.scale.y=1.5;
  }
  for(let i=0;i<8;i++){
    const a=i*Math.PI/4;
    for(const z of [-.105,.105]){
      const joint=plank(.115,.032,.012,Math.cos(a)*1.062,Math.sin(a)*1.062,z,dark,wheel);joint.rotation.z=a+Math.PI/2;
      const pin=mesh(new THREE.SphereGeometry(.012,6,6),brass,wheel);pin.position.set(Math.cos(a)*1.065,Math.sin(a)*1.065,z*1.1);
    }
  }
  function strand(points,radius,material=thread,parent=root){
    const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));
    return mesh(new THREE.TubeGeometry(curve,100,radius,6,false),material,parent);
  }
  // Exact external tangents meet both pulley grooves with continuous direction.
  const belt=createTangentBelt({x:.53,y:1.32,r:1.06},{x:-1.25,y:1.22,r:.14},.08);
  mesh(new THREE.TubeGeometry(belt.path,240,.009,6,true),new THREE.MeshStandardMaterial({color:0x4d3720,roughness:.9}));
  mesh(new THREE.TubeGeometry(belt.golden,100,.007,8,false),thread);
  // Golden yarn wound densely around the bobbin, with a fine lit core.
  const coil=[];for(let i=0;i<=240;i++){const t=i/240;const a=t*Math.PI*36;coil.push([Math.cos(a)*.086,Math.sin(a)*.086,-.15+t*.3]);}
  const woundThread=new THREE.MeshStandardMaterial({color:0xb4a189,roughness:.85,metalness:0});strand(coil,.0025,woundThread,flyer);
  
  let crank=rod([.53,1.32,.24],[.73,1.22,.24],.023,brass);
  let linkage=rod([.73,1.22,.24],[-.88,.16,.48],.018,dark);
  // Preserve B unchanged; both variants share exactly one gesture/state controller.
  const modelB=new THREE.Group();modelB.name='纺车 B · 原版';
  for(const child of [...root.children])modelB.add(child);
  root.add(modelB);
  const partsB={root:modelB,wheel,flyer,treadle,crank,linkage};
  const partsA=buildSpinningWheelA({wood,edge,dark,brass,thread});root.add(partsA.root);
  const variants={A:partsA,B:partsB};let selectedModel='A';
  function selectModel(name){
    if(!variants[name])return;
    end();selectedModel=name;
    for(const [key,parts] of Object.entries(variants))parts.root.visible=key===name;
    ({wheel,flyer,treadle,crank,linkage}=variants[name]);
    pose();
  }
  const light=new THREE.PointLight(0xffca8a,4,5,2);light.position.set(-1,1.8,2);root.add(light);
  // Isolate wheel materials so the frame and spindle retain their original finish.
  const wheelMaterials=new Map();
  for(const parts of Object.values(variants))parts.wheel.traverse(object=>{
    if(!object.isMesh)return;
    const original=object.material;
    if(!wheelMaterials.has(original)){
      const glowing=original.clone();
      glowing.onBeforeCompile=original.onBeforeCompile;
      glowing.customProgramCacheKey=original.customProgramCacheKey;
      glowing.emissive.setHex(0xff650b);glowing.emissiveIntensity=0;
      if(original.map)glowing.emissiveMap=original.map;
      wheelMaterials.set(original,glowing);
    }
    object.material=wheelMaterials.get(original);
  });
  const wheelGlow=new THREE.PointLight(0xff751b,0,3.6,2);
  wheelGlow.position.set(.53,1.32,.3);root.add(wheelGlow);
  let gesture=null,angle=0,endFade=1,settleTime=0,settleSpeed=1,resetMotion=null,state=createRitualState();
  canvas.style.cursor='grab';
  const projectedCenter=new THREE.Vector3();
  function angleAt(e){
    root.updateMatrixWorld(true);camera.updateMatrixWorld(true);
    wheel.getWorldPosition(projectedCenter);projectedCenter.project(camera);
    const rect=canvas.getBoundingClientRect();
    return pointerAngle(e.clientX,e.clientY,rect.left+(projectedCenter.x+1)*rect.width*.5,rect.top+(1-projectedCenter.y)*rect.height*.5);
  }
  function pose(){wheel.rotation.z=angle;flyer.rotation.z=angle*5;const energy=resetMotion?resetMotion.energy*(1-resetMotion.blend):state.progress*state.progress*endFade;for(const material of wheelMaterials.values())material.emissiveIntensity=energy*2.6;wheelGlow.intensity=energy*2.8;thread.emissiveIntensity=energy*8;treadle.rotation.z=Math.sin(angle)*.09;linkage.rotation.z=Math.sin(angle)*.025;crank.rotation.z=Math.sin(angle)*.04;}
  function end(e){
    if(!gesture||(e?.pointerId!==undefined&&e.pointerId!==gesture.id))return;
    const id=gesture.id;gesture=null;
    if(e)releaseRitual(state);
    if(canvas.hasPointerCapture(id))canvas.releasePointerCapture(id);
    canvas.style.cursor='grab';
  }
  canvas.addEventListener('pointerdown',e=>{
    if(e.button!==0||gesture||state.complete||state.finishing||resetMotion)return;
    e.preventDefault();e.stopImmediatePropagation();
    grabRitual(state);
    gesture={id:e.pointerId,angle:angleAt(e)};canvas.setPointerCapture(e.pointerId);canvas.style.cursor='grabbing';
  });
  canvas.addEventListener('pointermove',e=>{
    if(!gesture||e.pointerId!==gesture.id)return;
    e.preventDefault();e.stopImmediatePropagation();
    const next=angleAt(e);
    const delta=signedAngleDelta(gesture.angle,next);
    pullRitual(state,delta/(Math.PI*2)*720*2);
    gesture.angle=next;
  });
  for(const type of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(type,end);
  window.addEventListener('blur',end);
  function stop(){end();state.held=true;}
  function beginReset(){end();resetMotion={angle:Math.atan2(Math.sin(angle),Math.cos(angle)),energy:state.progress*state.progress*endFade,time:0,blend:0};state=createRitualState();settleTime=0;endFade=1;}
  function reset(){end();resetMotion=null;state=createRitualState();angle=0;endFade=1;settleTime=0;pose();}
  function update(dt,elapsed=dt){
    if(resetMotion){
      resetMotion.time+=elapsed;resetMotion.blend=THREE.MathUtils.smoothstep(resetMotion.time,0,2.4);
      angle=resetMotion.angle*(1-resetMotion.blend);pose();
      if(resetMotion.blend>=1){resetMotion=null;angle=0;pose();}return;
    }
    const wasComplete=state.complete;
    updateRitual(state,dt,elapsed);
    if(state.complete){
      if(!wasComplete)settleSpeed=Math.max(.001,state.speed/6*Math.PI*2);
      endFade=Math.max(0,endFade-dt/2.4);
      if(wasComplete&&!state.held)settleTime=Math.min(settlingDuration(settleSpeed),settleTime+dt);
    }
    state.settling=state.complete&&settleTime<settlingDuration(settleSpeed);
    angle=-Math.PI*2*state.progress-(state.complete?sampleWheelSettle(settleTime,settleSpeed):0);
    pose();
  }
  const woodStyles=new Map();
  const woodTones={natural:0xffffff,walnut:0x9e755b,oak:0xffdfaa,aged:0xadb4ad};
  function setWoodStyle(style){
    if(!woodTones[style])return;
    const unique=new Set();for(const parts of Object.values(variants))parts.root.traverse(o=>{if(o.isMesh&&o.material.map)unique.add(o.material);});
    for(const material of unique){
      const repeat=material.map.repeat.x,key=style+':'+repeat;
      if(!woodStyles.has(key))woodStyles.set(key,createWoodMaterial(0xffffff,repeat,style));
      const preset=woodStyles.get(key);
      if(!material.userData.originalWoodColor)material.userData.originalWoodColor=material.color.clone();
      material.color.copy(material.userData.originalWoodColor).multiply(new THREE.Color(woodTones[style]));
      material.map=preset.map;material.bumpMap=preset.map;
      if(material.emissiveMap)material.emissiveMap=preset.map;
      material.bumpScale=preset.bumpScale;material.roughness=preset.roughness;material.needsUpdate=true;
    }
  }
  selectModel(selectedModel);
  return {root,update,reset,beginReset,stop,selectModel,setWoodStyle,getCenter(target){root.updateMatrixWorld(true);return wheel.getWorldPosition(target);},setFullView(value){end();root.position.y=value?-1.35:-2.825;},getState(){return state;},isInteracting(){return !!gesture;}};
}
