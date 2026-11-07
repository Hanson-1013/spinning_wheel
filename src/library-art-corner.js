import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';

export function createLibraryArtCorner(){
 const root=new THREE.Group();root.name='右窗画室角 · 画架圆凳画卷与画板';
 const wood=new THREE.MeshStandardMaterial({color:0x523c29,roughness:.82}),edge=new THREE.MeshStandardMaterial({color:0x816242,roughness:.8}),paper=new THREE.MeshStandardMaterial({color:0xbeb396,roughness:.98}),metal=new THREE.MeshStandardMaterial({color:0x7b807a,metalness:.85,roughness:.25}),black=new THREE.MeshPhysicalMaterial({color:0x131816,roughness:.57,clearcoat:.14});
 function box(parent,w,h,d,x,y,z,m){const o=new THREE.Mesh(new RoundedBoxGeometry(w,h,d,2,.006),m);o.position.set(x,y,z);parent.add(o);return o;}
 function bar(parent,a,b,r,m){const delta=b.clone().sub(a),o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,delta.length(),10),m);o.position.copy(a).add(b).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());parent.add(o);}
 const easel=new THREE.Group();easel.name='H型升降木画架与4比3画作';easel.position.set(.35,0,0);easel.rotation.y=-.2;root.add(easel);
 const easelWood=new THREE.MeshStandardMaterial({color:0x30271f,roughness:.68,metalness:0}),brass=new THREE.MeshStandardMaterial({color:0xb7964d,roughness:.3,metalness:.8});
 // Rectangular rolling base and paired studio-easel uprights.
 for(const x of [-.37,.37]){
  box(easel,.085,.075,.69,x,.115,-.12,easelWood);
  for(const z of [-.39,.15]){
   box(easel,.035,.055,.035,x,.065,z,metal);
   const wheel=new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,.025,16),black);wheel.rotation.z=Math.PI/2;wheel.position.set(x,.035,z);easel.add(wheel);
  }
  box(easel,.045,1.82,.055,x,1.06,-.045,easelWood);
  const brace=box(easel,.038,1.63,.045,x,.94,-.25,easelWood);brace.rotation.x=-.25;
 }
 box(easel,.80,.065,.065,0,.25,-.05,easelWood);box(easel,.80,.045,.055,0,1.79,-.045,easelWood);
 box(easel,.80,.055,.065,0,.15,-.38,easelWood);
 box(easel,.06,2.13,.055,0,1.29,-.025,easelWood);
 box(easel,.025,1.4,.018,0,1.15,-.068,metal);
 // Tray, lifting carriage, crank and upper adjustable clamp.
 box(easel,.91,.065,.11,0,.80,.045,easelWood);
 box(easel,1.04,.035,.20,0,.88,.095,easelWood);
 box(easel,1.04,.035,.025,0,.90,.185,easelWood);
 box(easel,.105,.16,.09,0,1.79,.025,easelWood);
 box(easel,.18,.025,.12,0,1.675,.08,easelWood);
 const knob=new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,.023,24),brass);knob.rotation.x=Math.PI/2;knob.position.set(0,1.79,.09);easel.add(knob);
 bar(easel,new THREE.Vector3(0,.80,.11),new THREE.Vector3(0,.80,.18),.012,metal);
 bar(easel,new THREE.Vector3(0,.80,.18),new THREE.Vector3(.055,.735,.18),.009,metal);
 bar(easel,new THREE.Vector3(.055,.735,.18),new THREE.Vector3(.055,.735,.235),.014,black);
 box(easel,.06,.012,.02,.37,.84,.111,brass);
 // Exposed lower lifting mechanism and slim cross-bracing, as in the room reference.
 box(easel,.10,.36,.08,0,.55,.015,easelWood);
 box(easel,.62,.045,.055,0,.44,-.06,easelWood);
 for(const x of [-.29,.29]){
  bar(easel,new THREE.Vector3(x,.28,-.02),new THREE.Vector3(x*.35,.77,-.02),.009,metal);
  const bolt=new THREE.Mesh(new THREE.SphereGeometry(.009,10,6),brass);bolt.position.set(x,.44,-.026);easel.add(bolt);
 }
 const painting=new THREE.Group();painting.name='车站画作 · 居中4比3裁剪';painting.position.set(0,1.29,.105);easel.add(painting);
 box(painting,1.00,.76,.035,0,0,0,easelWood);
 const paint=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.92});
 if(typeof document!=='undefined'){
  const texture=new THREE.TextureLoader().load('/artworks/easel-station-art.png',t=>{
   const aspect=t.image.width/t.image.height,target=4/3;
   if(aspect>target){t.repeat.set(target/aspect,1);t.offset.set((1-target/aspect)/2,0);}
   else {t.repeat.set(1,aspect/target);t.offset.set(0,(1-aspect/target)/2);}
   t.needsUpdate=true;
  });
  texture.colorSpace=THREE.SRGBColorSpace;paint.map=texture;
 }
 const image=new THREE.Mesh(new THREE.PlaneGeometry(.96,.72),paint);image.position.z=.019;painting.add(image);
 const stool=new THREE.Group();stool.name='黑皮圆凳 · 弯曲金属脚';stool.position.set(-.05,0,.95);root.add(stool);
 // Thin rounded leather seat on four reflective S-curved tubular metal legs.
 const profile=[[0,-.018],[.218,-.018],[.234,-.015],[.242,-.008],[.245,0],[.242,.009],[.234,.016],[.218,.019],[0,.019]].map(([r,y])=>new THREE.Vector2(r,y));
 const seat=new THREE.Mesh(new THREE.LatheGeometry(profile,64),black);seat.position.y=.50;stool.add(seat);
 const piping=new THREE.Mesh(new THREE.TorusGeometry(.24,.0025,6,64),black);piping.rotation.x=Math.PI/2;piping.position.y=.506;stool.add(piping);
 const seatPlate=new THREE.Mesh(new THREE.CylinderGeometry(.105,.105,.016,24),metal);seatPlate.position.y=.473;stool.add(seatPlate);
 const chrome=metal.clone();chrome.color.setHex(0xb8c1c2);chrome.roughness=.11;chrome.metalness=1;
 const centerPost=new THREE.Mesh(new THREE.CylinderGeometry(.019,.021,.145,24),chrome);centerPost.name='圆凳中央长支杆';centerPost.position.y=.406;stool.add(centerPost);
 const hub=new THREE.Mesh(new THREE.SphereGeometry(.031,20,12),chrome);hub.position.y=.335;hub.scale.y=.7;stool.add(hub);
 for(let i=0;i<4;i++){
  const angle=i*Math.PI/2+Math.PI/4,out=new THREE.Vector3(Math.cos(angle),0,-Math.sin(angle));
  const points=[[.225,.025],[.22,.075],[.175,.13],[.15,.20],[.13,.275],[.085,.325],[.018,.338]].map(([r,y])=>out.clone().multiplyScalar(r).setY(y));
  const leg=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),48,.015,16,false),chrome);leg.name='S形反光圆管凳脚';stool.add(leg);
  const foot=new THREE.Mesh(new THREE.SphereGeometry(.018,12,8),black);foot.position.copy(points[0]);foot.scale.y=.5;stool.add(foot);
 }
 const footRing=new THREE.Mesh(new THREE.TorusGeometry(.151,.008,8,56),chrome);footRing.rotation.x=Math.PI/2;footRing.position.y=.195;stool.add(footRing);
 for(let i=0;i<4;i++){const a=i*Math.PI/2+Math.PI/4;bar(stool,new THREE.Vector3(Math.cos(a)*.15,.195,-Math.sin(a)*.15),new THREE.Vector3(Math.cos(a)*.151,.195,-Math.sin(a)*.151),.006,chrome);}

 stool.scale.set(.85,1.2+.1/.519,.85);
 const supplies=new THREE.Group();supplies.name='后侧竖立画卷与整齐画板';supplies.position.set(-.8,0,-.30);root.add(supplies);
 for(let i=0;i<4;i++){const board=new THREE.Group();board.name='竖立画板';board.position.set(-.05+i*.035,.015,-.20+i*.16);board.rotation.set(-.11,0,-.025);supplies.add(board);const h=.76+i*.065;box(board,.5,h,.026,0,h/2,0,wood);box(board,.46,h-.04,.008,0,h/2,.018,i%2?paper:edge);}
 for(let i=0;i<5;i++){const h=.67+(i%3)*.17,r=.032+(i%2)*.008,roll=new THREE.Group();roll.name='竖立画卷';roll.position.set(-.48-(i%2)*.12,.004,.02+Math.floor(i/2)*.12);roll.rotation.z=-.02+i*.008;supplies.add(roll);const shell=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,24,1,true),paper);shell.position.y=h/2;roll.add(shell);const spiral=[];for(let j=0;j<=90;j++){const t=j/90,a=t*Math.PI*6,rr=.005+(r-.007)*t;spiral.push(new THREE.Vector3(Math.cos(a)*rr,h+.001,Math.sin(a)*rr));}roll.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(spiral),90,.0014,4,false),edge));const tie=new THREE.Mesh(new THREE.TorusGeometry(r+.001,.002,5,24),wood);tie.rotation.x=Math.PI/2;tie.position.y=h*.43;roll.add(tie);}
 root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});return root;
}
