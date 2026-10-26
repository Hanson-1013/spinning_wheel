import * as THREE from 'three';
import {addTallTropicalPlants} from './tropical-plants.js';
import {createMonsteraPlant,createMonsteraMaterials} from './monstera.js';

export function addLibraryGarden(root,{random,leafGeometries}){
 const garden=new THREE.Group();garden.name='窗外花园 · 残柱拱门与龟背竹';root.add(garden);
 const limestone=new THREE.MeshStandardMaterial({color:0x888675,roughness:.96});
 const weathered=new THREE.MeshStandardMaterial({color:0x6b7160,roughness:1});
 const darkStone=new THREE.MeshStandardMaterial({color:0x3b4735,roughness:1});
 function mesh(geometry,material=limestone,parent=garden){const object=new THREE.Mesh(geometry,material);object.castShadow=true;object.receiveShadow=true;parent.add(object);return object;}
 function block(w,h,d,x,y,z,material=limestone,parent=garden){const object=mesh(new THREE.BoxGeometry(w,h,d),material,parent);object.position.set(x,y,z);return object;}
 function column(parent,x,z,height=3.65,broken=false){
  const baseY=-2.35;
  block(.76,.2,.76,x,baseY+.1,z,weathered,parent);block(.62,.12,.62,x,baseY+.26,z,limestone,parent);
  const shaftHeight=height-.5;
  const shaft=new THREE.CylinderGeometry(.24,.3,shaftHeight,48,14,true),positions=shaft.attributes.position;
  for(let i=0;i<positions.count;i++){
   const px=positions.getX(i),pz=positions.getZ(i),a=Math.atan2(pz,px),radial=1-.055*(.5+.5*Math.cos(a*16));
   positions.setX(i,px*radial);positions.setZ(i,pz*radial);
   if(broken&&positions.getY(i)>shaftHeight*.48)positions.setY(i,positions.getY(i)+.08*Math.sin(a*5)+.05*Math.cos(a*3));
  }
  shaft.computeVertexNormals();const body=mesh(shaft,limestone,parent);body.position.set(x,baseY+.34+shaftHeight/2,z);
  if(broken){
   const cap=mesh(new THREE.CircleGeometry(.24,32),weathered,parent);cap.rotation.x=-Math.PI/2;cap.position.set(x,baseY+.34+shaftHeight,z);
  }else{
   for(const [r,h,y]of [[.28,.09,height-.13],[.34,.12,height-.04]]){const ring=mesh(new THREE.CylinderGeometry(r,r,h,32),limestone,parent);ring.position.set(x,baseY+y,z);}
   block(.76,.14,.68,x,baseY+height+.08,z,limestone,parent);
  }
 }
 function arch(x,z,scale,angle,damaged){
  const structure=new THREE.Group();structure.position.set(x,0,z);structure.rotation.y=angle;structure.scale.set(scale,scale,scale);garden.add(structure);
  column(structure,-1.5,0,3.65);column(structure,1.5,0,damaged?2.1:3.65,damaged);
  const springY=1.43,inner=1.18,outer=1.56,count=13;
  for(let i=0;i<count;i++){
   if(damaged&&[0,1,2,8].includes(i))continue;
   const a0=i/count*Math.PI+.012,a1=(i+1)/count*Math.PI-.012;
   const shape=new THREE.Shape();shape.absarc(0,0,outer,a0,a1,false);shape.lineTo(Math.cos(a1)*inner,Math.sin(a1)*inner);shape.absarc(0,0,inner,a1,a0,true);shape.closePath();
   const stone=mesh(new THREE.ExtrudeGeometry(shape,{depth:.43,bevelEnabled:true,bevelSize:.016,bevelThickness:.012,bevelSegments:1,steps:1}),i%4===0?weathered:limestone,structure);stone.position.set(0,springY,-.215);stone.rotation.z=damaged&&i===3?-.04:0;
  }
  if(!damaged){block(3.7,.22,.64,0,3.14,0,weathered,structure);for(const side of [-1,1])block(.8,.24,.7,side*1.5,3.35,0,limestone,structure);}
 }
 arch(-2.6,-11.4,1.25,.09,true);arch(3.5,-11.8,1.05,-.12,false);
 column(garden,-6,-10.8,2.7,true);column(garden,6.5,-11.1,1.7,true);
 // Fallen drums and blocks are obscured by the near foliage, rather than floating scenery.
 for(let i=0;i<12;i++){
  const stone=block(.3+random()*.6,.2+random()*.3,.35+random()*.4,-7+random()*14,-2.2,-9-random()*3,i%2?weathered:darkStone);stone.rotation.set(random()*.15,random()*3,.1*(random()-.5));
 }
 const materials=createMonsteraMaterials();
 for(let row=0;row<2;row++)for(let i=0;i<12;i++){
  const plant=createMonsteraPlant(2.6+random()*1.4,random,materials,leafGeometries,{leafCount:12,leafWidth:1.2});
  plant.position.set(-8.1+i*1.45+(random()-.5)*.3,-2.35,-7.15-row*1.1-random()*.25);
  plant.rotation.y=random()*.7;plant.name='窗外龟背竹 · 玻璃外侧';
  // Fit the entire curved plant, not merely its root, behind the window plane.
  plant.updateMatrixWorld(true);
  const bounds=new THREE.Box3().setFromObject(plant);
  if(bounds.max.z> -6.8)plant.position.z-=bounds.max.z+6.8;
  plant.updateMatrixWorld(true);
  plant.userData.frontBoundary=new THREE.Box3().setFromObject(plant).max.z;
  plant.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});garden.add(plant);
 }
 addTallTropicalPlants(garden,random);
 // Repeat the same three species outside both side windows, without copying lights or ruins.
 const nearPlants=garden.children.filter(object=>object.name==='窗外龟背竹 · 玻璃外侧');
 const tallPlants=garden.children.filter(object=>object.name==='窗外天堂鸟 · 长茎宽叶'||object.name==='窗外散尾葵 · 弯垂羽状叶');
 const sideTemplates=[...nearPlants.filter((_,i)=>i%4===0),...tallPlants.filter((_,i)=>i%3===0)];
 for(const side of [-1,1]){
  const planting=new THREE.Group();planting.name=side===1?'右侧窗外同种植物':'左侧窗外同种植物';
  planting.position.set(side*3.2,0,2.7);planting.rotation.y=-side*Math.PI/2;planting.scale.x=.65;
  for(const template of sideTemplates)planting.add(template.clone(true));
  garden.add(planting);planting.updateWorldMatrix(true,true);
  const bounds=new THREE.Box3().setFromObject(planting);
  const correction=side>0?Math.max(0,10-bounds.min.x):Math.min(0,-10-bounds.max.x);
  planting.position.x+=correction;planting.userData.glassBoundary=side*9.5;
 }
 // Three additional mixed groups fill the gaps beside each rear corner.
 const extraTemplates=[nearPlants[0],tallPlants.find(o=>o.name==='窗外天堂鸟 · 长茎宽叶'),tallPlants.find(o=>o.name==='窗外散尾葵 · 弯垂羽状叶')];
 for(const side of [-1,1])for(let index=0;index<3;index++){
  const cluster=new THREE.Group();cluster.name=side>0?'右侧新增混合植物组':'左侧新增混合植物组';cluster.position.set(side*11.5,0,-4.1+index*1.65);cluster.rotation.y=-side*Math.PI/2;
  extraTemplates.forEach((source,j)=>{const plant=source.clone(true);plant.position.set((j-1)*.65,-2.35,-j*.35);cluster.add(plant);});
  garden.add(cluster);cluster.updateWorldMatrix(true,true);
  const bounds=new THREE.Box3().setFromObject(cluster);
  cluster.position.x+=side>0?Math.max(0,10-bounds.min.x):Math.min(0,-10-bounds.max.x);
 }
 const sun=new THREE.DirectionalLight(0xffd58a,2.1);sun.name='室外太阳光';sun.position.set(5.5,15,-10);sun.target.position.set(-1,-1,-7);
 sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-10,right:10,top:9,bottom:-6,near:.5,far:32});sun.shadow.bias=-.0003;sun.shadow.normalBias=.025;sun.shadow.radius=3;
 garden.add(sun,sun.target);
 return garden;
}
