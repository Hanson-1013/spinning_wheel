import * as THREE from 'three';
import {addNixieStand} from './nixie-display-stand.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {createMechanicalConsole} from './mechanical-clock-console.js';

// Curved wire numerals inside four glass discharge tubes, not seven-segment LEDs.
export function createNixieClock(random=Math.random){
 const group=new THREE.Group();group.name='四管辉光钟 · 随机时刻';
 const brass=new THREE.MeshStandardMaterial({color:0x897044,metalness:.7,roughness:.4});
 const baseMaterial=new THREE.MeshStandardMaterial({color:0x332b22,roughness:.65});
 const glass=new THREE.MeshPhysicalMaterial({color:0xe8f0ed,transparent:true,opacity:.09,roughness:.07,metalness:0,depthWrite:false});
 // Explicit straight strokes and cubic arcs avoid spline overshoot at corners.
 const x=.061,top=.282,bottom=.058,mid=.17,r=.026;
 function roundedLoop(y0,y1){const p=new THREE.Path();p.moveTo(-x+r,y0);p.lineTo(x-r,y0);p.quadraticCurveTo(x,y0,x,y0+r);p.lineTo(x,y1-r);p.quadraticCurveTo(x,y1,x-r,y1);p.lineTo(-x+r,y1);p.quadraticCurveTo(-x,y1,-x,y1-r);p.lineTo(-x,y0+r);p.quadraticCurveTo(-x,y0,-x+r,y0);return p;}
 const paths=Array.from({length:10},()=>new THREE.Path());paths[0]=roundedLoop(bottom,top);
 paths[1].moveTo(-.035,.245);paths[1].lineTo(.005,top);paths[1].lineTo(.005,bottom);paths[1].moveTo(-.037,bottom);paths[1].lineTo(.047,bottom);
 paths[2].moveTo(-x,.246);paths[2].bezierCurveTo(-x,.296,x,.3,x,.246);paths[2].bezierCurveTo(x,.215,-.047,.129,-x,.09);paths[2].lineTo(-x,bottom);paths[2].lineTo(x,bottom);
 paths[3].moveTo(-x,.264);paths[3].bezierCurveTo(.015,.305,x,.278,x,.234);paths[3].bezierCurveTo(x,.197,.032,mid,-.006,mid);paths[3].bezierCurveTo(.04,mid,x,.146,x,.108);paths[3].bezierCurveTo(x,.058,.005,.032,-x,.076);
 paths[4].moveTo(.036,bottom);paths[4].lineTo(.036,top);paths[4].lineTo(-x,.137);paths[4].lineTo(x,.137);
 paths[5].moveTo(x,top);paths[5].lineTo(-x,top);paths[5].lineTo(-x,.178);paths[5].bezierCurveTo(.045,.2,x,.156,x,.113);paths[5].bezierCurveTo(x,.053,-.006,.035,-x,.078);
 paths[6].moveTo(.047,.268);paths[6].bezierCurveTo(-.034,.31,-x,.236,-x,.126);paths[6].bezierCurveTo(-x,.033,x,.034,x,.116);paths[6].bezierCurveTo(x,.183,-.035,.193,-x,.132);
 paths[7].moveTo(-x,top);paths[7].lineTo(x,top);paths[7].lineTo(-.022,bottom);
 paths[8]=roundedLoop(mid,top);const lower=roundedLoop(bottom,mid);paths[8].curves.push(...lower.curves);
 paths[9].moveTo(-.047,.072);paths[9].bezierCurveTo(.034,.03,x,.104,x,.214);paths[9].bezierCurveTo(x,.307,-x,.306,-x,.224);paths[9].bezierCurveTo(-x,.157,.035,.147,x,.208);
 const numerals=paths.map(path=>{
  const strokes=path.curves.map(curve=>{
   class Stroke3 extends THREE.Curve{getPoint(t,target=new THREE.Vector3()){const p=curve.getPoint(t);return target.set(p.x,p.y,0);}}
   return new THREE.TubeGeometry(new Stroke3(),curve.isLineCurve?1:20,.0038,8,false);
  });
  const merged=mergeGeometries(strokes,false);strokes.forEach(g=>g.dispose());return merged;
 });
 const tubeProfile=[[.07,0],[.093,.018],[.094,.3],[.088,.35],[.06,.39],[0,.405]].map(([r,y])=>new THREE.Vector2(r,y));
 const digits=[];
 const base=new THREE.Mesh(new THREE.BoxGeometry(1.16,.12,.34),baseMaterial);base.position.y=-.08;group.add(base);
 for(let i=0;i<4;i++){
  const tube=new THREE.Group();tube.position.x=(i-1.5)*.27;group.add(tube);
  const shell=new THREE.Mesh(new THREE.LatheGeometry(tubeProfile,32),glass);tube.add(shell);
  const socket=new THREE.Mesh(new THREE.CylinderGeometry(.105,.105,.035,24),brass);socket.position.y=.005;tube.add(socket);
  for(let pin=0;pin<6;pin++){const wire=new THREE.Mesh(new THREE.CylinderGeometry(.003,.003,.06,6),brass);wire.position.set(Math.cos(pin*Math.PI/3)*.058,-.02,Math.sin(pin*Math.PI/3)*.058);tube.add(wire);}
  const layers=[];
  for(let d=0;d<10;d++){
   const material=new THREE.MeshBasicMaterial({color:new THREE.Color(3.5,.32,.018),toneMapped:false,transparent:true,opacity:1,depthWrite:false});
   const wire=new THREE.Mesh(numerals[d],material);wire.position.set(0,.033,.014+d*.001);wire.visible=false;wire.userData.dynamic=true;tube.add(wire);layers.push(wire);
  }
  digits.push(layers);
 }
 const board=new THREE.Mesh(new THREE.BoxGeometry(1.12,.035,.31),new THREE.MeshStandardMaterial({color:0x26362b,roughness:.72}));board.position.set(0,-.012,0);group.add(board);
 for(let i=0;i<16;i++){
  const component=new THREE.Mesh(new THREE.CylinderGeometry(.012,.012,.045,8),i%3?baseMaterial:brass);component.rotation.z=Math.PI/2;component.position.set(-.52+i*.067,-.005,.13);group.add(component);
 }
 for(let i=0;i<4;i++){
  const x=(i-1.5)*.27;
  for(const sign of [-1,1]){const support=new THREE.Mesh(new THREE.CylinderGeometry(.004,.004,.31,6),brass);support.position.set(x+sign*.079,.16,-.045);group.add(support);}
  const cap=new THREE.Mesh(new THREE.SphereGeometry(.013,8,6),glass);cap.position.set(x,.408,0);group.add(cap);
  const cable=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CubicBezierCurve3(new THREE.Vector3(x,-.07,-.12),new THREE.Vector3(x,.1,-.2),new THREE.Vector3(x+.15,.12,-.24),new THREE.Vector3(x+.18,-.14,-.17)),16,.006,5,false),baseMaterial);group.add(cable);
 }
 const spill=new THREE.PointLight(0xff6a16,.65,1.7,2);spill.position.set(0,.2,.18);group.add(spill);
 let nextChange=0,changedAt=0,values=[1,9,9,9],target=[1,9,9,9];
 let settleAt=[0,0,0,0],nextFlicker=[0,0,0,0];
 function update(time){
  if(time>=nextChange){
   const hours=Math.floor(random()*24),minutes=Math.floor(random()*60);
   target=[Math.floor(hours/10),hours%10,Math.floor(minutes/10),minutes%10];changedAt=time;
   const duration=.48+random()*.18;
   settleAt=values.map((_,i)=>time+duration+i*.085+random()*.055);
   nextFlicker=[time,time,time,time];
   nextChange=Math.max(...settleAt)+1.4+random()*2;
  }
  for(let i=0;i<4;i++){
   if(time>=settleAt[i])values[i]=target[i];
   else if(time>=nextFlicker[i]){
    // Always show a different numeral at each flicker; timing is frame-rate independent.
    values[i]=(values[i]+1+Math.floor(random()*9))%10;
    nextFlicker[i]=time+.035+random()*.025;
   }
   for(let d=0;d<10;d++){
    digits[i][d].visible=values[i]===d;
    if(values[i]===d)digits[i][d].material.opacity=(time<settleAt[i]?.92:.86)+.025*Math.sin(time*23+i*2.7);
   }
  }
  group.userData.time=values.join('');group.userData.targetTime=target.join('');group.userData.scrambling=settleAt.some(t=>time<t);
 }
 update(0);group.userData.update=update;return group;
}

// Shared complete assembly for the library and the lightweight module viewer.
export function createNixieConsole(random=Math.random,materials={}){
 return addNixieStand(createMechanicalConsole(createNixieClock(random),random));
}
