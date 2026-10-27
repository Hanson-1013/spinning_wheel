import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';

export function createMechanicalConsole(clock,random=Math.random){
 const root=new THREE.Group();root.name='机械朋克辉光钟 · 铜线开放机箱';
 const metal=(color,roughness=.38)=>new THREE.MeshStandardMaterial({color,metalness:.82,roughness});
 const steel=metal(0x7a8583),dark=metal(0x252e2d,.55),copper=metal(0xa4673d),brass=metal(0xb89b56),black=new THREE.MeshStandardMaterial({color:0x151c19,roughness:.65});
 const boardMat=new THREE.MeshStandardMaterial({color:0x253f30,roughness:.85});
 const paper=new THREE.MeshStandardMaterial({color:0xc4bda6,roughness:.9});
 const glass=new THREE.MeshPhysicalMaterial({color:0xc6dfd6,transparent:true,opacity:.07,roughness:.1,depthWrite:false});
 const unitBox=new THREE.BoxGeometry(1,1,1);
 function mesh(g,m,x=0,y=0,z=0,parent=root){const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
 function box(w,h,d,x,y,z,m=steel,parent=root){const o=mesh(unitBox,m,x,y,z,parent);o.scale.set(w,h,d);return o;}
 function cyl(r,h,x,y,z,m=steel,parent=root,r2=r){return mesh(new THREE.CylinderGeometry(r,r2,h,20),m,x,y,z,parent);}
 function ring(r,t,x,y,z,m=steel,parent=root){return mesh(new THREE.TorusGeometry(r,t,6,36),m,x,y,z,parent);}
 function line(points,r,m=copper,parent=root){return mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),20,r,5,false),m,0,0,0,parent);}
 function screw(x,y,z,front=false){const o=cyl(.013,.012,x,y,z,steel);if(front)o.rotation.x=Math.PI/2;const slot=box(.017,.002,.003,x,y+.007,z,dark);if(front){slot.position.set(x,y,z+.008);slot.rotation.x=Math.PI/2;}}
 // Brushed metal and irregular fine scratches remain subtle at close range.
 const pixels=new Uint8Array(128*128*4);for(let y=0;y<128;y++)for(let x=0;x<128;x++){const v=180+Math.floor(24*Math.sin(y*5.3)+8*Math.sin(x*.3+y*27));const i=(y*128+x)*4;pixels.set([v,v,v,255],i);}
 const brushed=new THREE.DataTexture(pixels,128,128);brushed.wrapS=brushed.wrapT=THREE.RepeatWrapping;brushed.needsUpdate=true;
 for(const m of [steel,dark,copper]){m.map=brushed;m.bumpMap=brushed;m.bumpScale=.0007;}
 // Open chassis: rails, corner posts, removable top plate and rubber feet.
 box(1.7,.065,.78,0,-.335,0,dark);box(1.72,.035,.79,0,.27,0,steel);
 box(1.56,.025,.65,0,-.285,0,boardMat);
 for(const x of [-.79,.79])for(const z of [-.33,.33]){
  cyl(.027,.57,x,-.025,z,steel);cyl(.042,.025,x,.245,z,brass);cyl(.043,.035,x,-.375,z,black);
  screw(x,.296,z);
 }
 for(const z of [-.38,.38]){box(1.7,.055,.025,0,-.265,z,steel);box(1.7,.025,.025,0,.23,z,dark);}
 // Rear protective perforated cover leaves the front copper wiring visible.
 for(let i=0;i<31;i++)box(.011,.39,.012,-.72+i*.048,-.025,-.348,dark);
 box(1.49,.43,.008,0,-.025,.356,glass);
 // Four high discharge tubes sit above the chassis, each with a collar and bolts.
 clock.scale.set(1.35,1.5,1.35);clock.position.set(0,.32,0);root.add(clock);
 for(let i=0;i<4;i++){
  const x=(i-1.5)*.3645;
  cyl(.157,.035,x,.305,0,steel);const collar=ring(.14,.012,x,.328,0,brass);collar.rotation.x=Math.PI/2;
  for(let a=0;a<4;a++){const angle=a*Math.PI/2;screw(x+Math.cos(angle)*.137,.329,Math.sin(angle)*.137);}
  const highlight=new THREE.MeshBasicMaterial({color:0xd9e9e2,transparent:true,opacity:.22,depthWrite:false});
  for(const sign of [-1,1])line([[x+sign*.108,.38,.055],[x+sign*.123,.48,.055],[x+sign*.122,.78,.055],[x+sign*.08,.88,.04],[x+sign*.025,.915,.02]],.0025,highlight);
  // Fine anode cage, support rods and a visible lower lead bundle.
  for(const sign of [-1,1])line([[x+sign*.085,.39,-.065],[x+sign*.085,.76,-.065],[x+sign*.06,.83,-.065]],.003,steel);
  for(const y of [.41,.77]){const cage=ring(.09,.003,x,y,0,steel);cage.rotation.x=Math.PI/2;}
 }
 // Curving copper signal wires, cable combs and tightly wound inductors.
 for(let i=0;i<48;i++){
  const start=-.69+(i%24)*.06,end=-.66+((i*7)%24)*.057,z=.18+(i%3)*.047;
  line([[start,.23,z],[start,.1-(i%5)*.025,z],[end*.55,-.12+(i%7)*.023,z+.015],[end,-.23,z-.025]],.0035,i%6===0?black:copper);
 }
 for(const x of [-.56,.48])for(let j=0;j<13;j++){
  const points=[];for(let k=0;k<=12;k++){const a=k/12*Math.PI*2;points.push([x+Math.cos(a)*.075,-.19+j*.014,.03+Math.sin(a)*.075]);}line(points,.004,copper);
 }
 for(let i=0;i<10;i++){
  const x=-.66+i*.14;cyl(.018,.055,x,-.24,-.22,i%2?brass:black);
  box(.06,.045,.035,x,-.24,.27,black);for(const sign of [-1,1])line([[x+sign*.045,-.28,.27],[x+sign*.045,-.24,.27],[x+sign*.03,-.24,.27]],.0025,steel);
 }
 // IC packages with pins, heatsink fins, solder pads and copper traces.
 for(const x of [-.28,.27]){
  box(.24,.055,.14,x,-.22,-.15,black);
  for(let j=0;j<9;j++)for(const sign of [-1,1]){box(.008,.05,.035,x-.1+j*.025,-.265,-.15+sign*.083,steel);cyl(.01,.003,x-.1+j*.025,-.27,-.15+sign*.11,brass);}
  for(let j=0;j<8;j++)box(.012,.075,.14,x-.09+j*.026,-.155,-.15,dark);
 }
 for(let i=0;i<18;i++)line([[-.7+i*.079,-.269,-.28],[-.7+i*.079,-.269,-.02],[-.65+i*.079,-.269,.03]],.0017,brass);
 // Layered spur gears with teeth and drilled hubs inside the open enclosure.
 for(let i=0;i<3;i++){
  const gear=new THREE.Group();gear.position.set(-.35+i*.27,-.075,.31);root.add(gear);gear.userData.rigidGear=true;const radius=[.105,.075,.092][i];
  const disk=cyl(radius,.022,0,0,0,brass,gear);disk.rotation.x=Math.PI/2;ring(radius*.65,.012,0,0,.013,dark,gear);ring(radius*.24,.01,0,0,.02,steel,gear);
  for(let tooth=0;tooth<24;tooth++){const a=tooth*Math.PI/12;const t=box(.017,.024,.027,Math.cos(a)*radius,Math.sin(a)*radius,0,brass,gear);t.rotation.z=a-Math.PI/2;}
  for(let hole=0;hole<5;hole++){const a=hole*Math.PI*2/5;const h=cyl(.013,.004,Math.cos(a)*radius*.5,Math.sin(a)*radius*.5,.014,black,gear);h.rotation.x=Math.PI/2;}
 }
 const needles=[];
 for(const side of [-1,1]){
  // Bent brass pressure feed and a slightly splayed analog gauge.
  line([[side*.76,.27,0],[side*.93,.28,0],[side*.93,.44,.035]],.019,brass);
  const gauge=new THREE.Group();gauge.name='机械压力表';gauge.position.set(side*.93,.55,.055);gauge.rotation.y=side*.13;gauge.rotation.z=-side*.12;root.add(gauge);
  const casing=cyl(.125,.055,0,0,0,dark,gauge);casing.rotation.x=Math.PI/2;
  const face=cyl(.111,.005,0,0,.032,paper,gauge);face.rotation.x=Math.PI/2;ring(.118,.009,0,0,.036,steel,gauge);
  for(let j=0;j<31;j++){const a=(-.77+j/30*1.54)*Math.PI;const tick=box(j%5===0?.004:.002,j%5===0?.021:.011,.002,Math.sin(a)*.091,Math.cos(a)*.091,.037,black,gauge);tick.rotation.z=-a;}
  const needle=new THREE.Group();needle.userData.dynamic=true;gauge.add(needle);box(.004,.074,.003,0,.026,.041,black,needle);const pin=cyl(.009,.006,0,0,.043,brass,needle);pin.rotation.x=Math.PI/2;needle.traverse(o=>{o.userData.dynamic=true;});needles.push(needle);
  mesh(new THREE.CircleGeometry(.108,32),glass,0,0,.049,gauge);
  for(const y of [-.16,.05]){
   line([[side*.78,y,-.1],[side*1.01,y,-.1],[side*1.02,y+.1,-.1],[side*.93,y+.13,-.1]],.028,dark);
   const collar=cyl(.043,.04,side*.95,y,-.1,steel);collar.rotation.z=Math.PI/2;
  }
  const valve=ring(.068,.009,side*1.035,.09,-.1,brass);valve.rotation.y=Math.PI/2;
  for(let spoke=0;spoke<4;spoke++){const a=spoke*Math.PI/2;line([[side*1.035,.09,-.1],[side*1.035,.09+Math.cos(a)*.066,-.1+Math.sin(a)*.066]],.004,brass);}
 }
 // Chassis rivets and ventilation grille.
 for(let i=0;i<13;i++)for(const z of [-.35,.35])screw(-.69+i*.115,.296,z);
 for(let i=0;i<16;i++)box(.004,.075,.012,-.6+i*.08,-.24,.397,dark);
 const nameplate=box(.26,.045,.008,0,.235,.405,brass);nameplate.name='黄铜铭牌';
 // Lift the chassis bottom by 20 cm while holding its top and the tubes fixed.
 const compressY=y=>y>=.27?y:-.2+(y+.4)*(.47/.67);
 root.updateMatrixWorld(true);
 root.traverse(object=>{
  if(!object.isMesh)return;
  const geometry=object.geometry.clone(),p=geometry.attributes.position,world=object.matrixWorld,inverse=world.clone().invert(),v=new THREE.Vector3();
  let ancestor=object,gear=null;while(ancestor&&ancestor!==root){if(ancestor.userData.rigidGear){gear=ancestor;break;}ancestor=ancestor.parent;}
  const gearY=gear?gear.getWorldPosition(new THREE.Vector3()).y:0;
  for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i).applyMatrix4(world);v.y=gear?v.y+compressY(gearY)-gearY:compressY(v.y);v.applyMatrix4(inverse);p.setXYZ(i,v.x,v.y,v.z);}
  geometry.computeVertexNormals();object.geometry=geometry;
 });
 root.userData.chassisReduction=.2;
 // Batch static details for mobile inspection; numeral visibility and needles remain live.
 root.updateMatrixWorld(true);const batches=new Map();root.traverse(o=>{if(!o.isMesh||o.userData.dynamic)return;if(!batches.has(o.material))batches.set(o.material,[]);batches.get(o.material).push(o);});
 for(const [material,objects]of batches){if(objects.length<2)continue;const copies=objects.map(o=>(o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone()).applyMatrix4(o.matrixWorld));const geometry=mergeGeometries(copies,false);copies.forEach(g=>g.dispose());if(!geometry)continue;const combined=new THREE.Mesh(geometry,material);combined.name='机械钟静态细节';combined.castShadow=true;combined.receiveShadow=true;root.add(combined);objects.forEach(o=>o.removeFromParent());}
 const updateClock=clock.userData.update;delete clock.userData.update;
 root.userData.update=time=>{updateClock(time);needles.forEach((n,i)=>n.rotation.z=(i?-.6:.8)+Math.sin(time*.7+i)*.045);};
 root.userData.detail='四管辉光、双压力表、48束铜线、三组齿轮、电感、芯片散热器、阀门与铆钉';
 return root;
}
