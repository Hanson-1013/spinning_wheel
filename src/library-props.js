import * as THREE from 'three';

const mesh=(parent,geometry,material)=>{const object=new THREE.Mesh(geometry,material);parent.add(object);return object;};
export function createLibraryPot(material,soilMaterial){
 const group=new THREE.Group();group.name='现代简约花盆 · 薄壁直筒';
 const profile=[[.195,0],[.208,.012],[.218,.035],[.245,.43],[.244,.455],[.229,.455],[.226,.43],[.211,.065],[.195,.055]];
 mesh(group,new THREE.LatheGeometry(profile.map(([r,y])=>new THREE.Vector2(r,y)),48),material);
 const soil=mesh(group,new THREE.CircleGeometry(.222,40),soilMaterial);soil.rotation.x=-Math.PI/2;soil.position.y=.415;
 const foot=mesh(group,new THREE.CylinderGeometry(.188,.185,.018,40),material);foot.position.y=.005;
 for(let i=0;i<9;i++){const grain=mesh(group,new THREE.DodecahedronGeometry(.01+(i%3)*.004),soilMaterial);grain.position.set(Math.cos(i*2.4)*.14,.418,Math.sin(i*2.4)*.14);}

 return group;
}
function rectangleRing(w,h,width,depth,material,parent,z){
 const outline=new THREE.Shape();outline.moveTo(-w/2,-h/2);outline.lineTo(w/2,-h/2);outline.lineTo(w/2,h/2);outline.lineTo(-w/2,h/2);outline.closePath();
 const hole=new THREE.Path();hole.moveTo(-w/2+width,-h/2+width);hole.lineTo(-w/2+width,h/2-width);hole.lineTo(w/2-width,h/2-width);hole.lineTo(w/2-width,-h/2+width);hole.closePath();outline.holes.push(hole);
 const object=mesh(parent,new THREE.ExtrudeGeometry(outline,{depth,bevelEnabled:true,bevelThickness:.008,bevelSize:.008,bevelSegments:2,steps:1}),material);object.position.z=z;return object;
}
export function createLibraryFrame(w,h,wood,gold){
 const group=new THREE.Group();group.name='画框 · 斜接角与层叠线脚';
 rectangleRing(w,h,.065,.065,wood,group,-.035);
 rectangleRing(w-.025,h-.025,.015,.02,gold,group,.036);
 rectangleRing(w-.1,h-.1,.018,.023,wood,group,.04);
 rectangleRing(w-.145,h-.145,.009,.01,gold,group,.058);
 // Tiny brass corner pins and rear suspension eyes.
 for(const x of [-1,1])for(const y of [-1,1]){const pin=mesh(group,new THREE.SphereGeometry(.01,8,6),gold);pin.position.set(x*(w/2-.028),y*(h/2-.028),.06);}
 return group;
}
export function createLibraryClock({wood,brass,iron,paper}){
 const group=new THREE.Group();group.name='古董时钟 · 壳体刻度与双指针';
 const caseProfile=[[.24,-.09],[.31,-.08],[.35,-.055],[.365,-.02],[.365,.025],[.35,.055],[.323,.072],[.31,.06]];
 const shell=mesh(group,new THREE.LatheGeometry(caseProfile.map(([r,y])=>new THREE.Vector2(r,y)),64),wood);shell.rotation.x=Math.PI/2;
 const dial=mesh(group,new THREE.CircleGeometry(.312,64),paper);dial.position.z=.085;
 for(const r of [.317,.342]){const ring=mesh(group,new THREE.TorusGeometry(r,.008,8,64),brass);ring.position.z=.09;}
 const block=new THREE.BoxGeometry(1,1,1);
 for(let i=0;i<60;i++){
  const a=i/60*Math.PI*2,major=i%5===0,r=major?.266:.28;
  const tick=mesh(group,block,iron);tick.position.set(Math.sin(a)*r,Math.cos(a)*r,.093);tick.scale.set(major?.012:.004,major?.036:.014,.003);tick.rotation.z=-a;
 }
 // Roman numeral hour marks are modeled strokes, rather than a flat face decal.
 const numerals=['XII','I','II','III','IV','V','VI','VII','VIII','IX','X','XI'];
 for(let hour=0;hour<12;hour++){
  const a=hour*Math.PI/6,text=numerals[hour],anchor=new THREE.Group();anchor.position.set(Math.sin(a)*.218,Math.cos(a)*.218,.096);group.add(anchor);
  [...text].forEach((letter,j)=>{const x=(j-(text.length-1)/2)*.019;
   const stroke=(dx,angle)=>{const part=mesh(anchor,block,iron);part.position.x=x+dx;part.scale.set(.003,.029,.002);part.rotation.z=angle;};
   if(letter==='I')stroke(0,0);else if(letter==='V'){stroke(-.005,-.32);stroke(.005,.32);}else{stroke(0,.5);stroke(0,-.5);}
  });
 }
 for(const [length,width,angle] of [[.14,.017,Math.PI/3],[.215,.01,-Math.PI*.27]]){
  const hand=new THREE.Group();hand.position.z=.111;hand.rotation.z=angle;group.add(hand);
  const shape=new THREE.Shape();shape.moveTo(-width/2,-.035);shape.lineTo(width/2,-.035);shape.lineTo(width/2,length*.75);shape.lineTo(0,length);shape.lineTo(-width/2,length*.75);shape.closePath();mesh(hand,new THREE.ShapeGeometry(shape),iron);
 }
 const pin=mesh(group,new THREE.SphereGeometry(.024,12,8),brass);pin.position.z=.125;pin.scale.z=.4;
 // Curved glass stays subtle so hands and numerals remain readable.
 const glass=mesh(group,new THREE.SphereGeometry(.311,32,16),new THREE.MeshPhysicalMaterial({color:0xd6e0d7,transparent:true,opacity:.075,roughness:.15,depthWrite:false}));glass.position.z=.104;glass.scale.z=.055;
 for(const x of [-.23,.23]){const foot=mesh(group,new THREE.SphereGeometry(.055,12,8),brass);foot.position.set(x,-.3,-.005);foot.scale.y=.5;}
 const crown=mesh(group,new THREE.CylinderGeometry(.033,.04,.06,12),brass);crown.position.y=.386;
 return group;
}
