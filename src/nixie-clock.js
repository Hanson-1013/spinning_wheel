import * as THREE from 'three';

// Curved wire numerals inside four glass discharge tubes, not seven-segment LEDs.
export function createNixieClock(random=Math.random){
 const group=new THREE.Group();group.name='四管辉光钟 · 随机时刻';
 const brass=new THREE.MeshStandardMaterial({color:0x897044,metalness:.7,roughness:.4});
 const baseMaterial=new THREE.MeshStandardMaterial({color:0x332b22,roughness:.65});
 const glass=new THREE.MeshPhysicalMaterial({color:0xe4d8b8,transparent:true,opacity:.14,roughness:.12,metalness:.05,depthWrite:false});
 const paths=[
 [[0,.05],[-.055,.065],[-.069,.15],[-.06,.26],[0,.285],[.06,.26],[.069,.15],[.055,.065],[0,.05]],
 [[-.04,.235],[0,.285],[0,.055]],
 [[-.065,.24],[-.025,.282],[.04,.277],[.068,.23],[.04,.18],[-.04,.1],[-.065,.055],[.067,.055]],
 [[-.06,.26],[.01,.285],[.062,.25],[.038,.19],[-.01,.172],[.045,.16],[.065,.11],[.025,.055],[-.06,.07]],
 [[.035,.055],[.035,.285],[-.07,.13],[.072,.13]],
 [[.065,.28],[-.055,.28],[-.06,.18],[.01,.185],[.062,.15],[.06,.09],[.015,.055],[-.062,.075]],
 [[.055,.268],[-.01,.28],[-.06,.22],[-.065,.115],[-.03,.06],[.035,.06],[.066,.11],[.04,.17],[-.05,.17]],
 [[-.068,.28],[.068,.28],[.035,.205],[-.02,.055]],
 [[0,.17],[-.06,.21],[-.045,.27],[.025,.28],[.063,.24],[0,.17],[-.064,.12],[-.04,.06],[.03,.055],[.065,.11],[0,.17]],
 [[.055,.17],[-.025,.17],[-.065,.225],[-.025,.28],[.04,.27],[.065,.21],[.055,.11],[.01,.055],[-.05,.065]],
 ];
 const numerals=paths.map(points=>new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(([x,y])=>new THREE.Vector3(x,y,0))),64,.0038,6,false));
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
   const material=new THREE.MeshBasicMaterial({color:new THREE.Color(3.5,1.05,.12),transparent:true,opacity:1,depthWrite:false});
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
 let nextChange=-1,changedAt=0,values=[1,9,9,9];
 function update(time){
  if(time>=nextChange){
   const hours=Math.floor(random()*24),minutes=Math.floor(random()*60);
   values=[Math.floor(hours/10),hours%10,Math.floor(minutes/10),minutes%10];changedAt=time;nextChange=time+.8+random()*2.4;
  }
  for(let i=0;i<4;i++)for(let d=0;d<10;d++){
   digits[i][d].visible=values[i]===d;
   if(values[i]===d)digits[i][d].material.opacity=.84+.16*Math.exp(-(time-changedAt)*10)+.025*Math.sin(time*23+i*2.7);
  }
  group.userData.time=values.join('');
 }
 update(0);group.userData.update=update;return group;
}
