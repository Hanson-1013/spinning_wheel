import * as THREE from 'three';
import {WINDOW_TRANSOMS} from './library-window-layout.js';
import {addIndoorMist} from './library-indoor-mist.js';
import {addLibraryCeiling} from './library-ceiling.js';
import {createLibraryDesk,createDrawerCabinet} from './library-furniture.js';
import {addWindowMist} from './library-window-mist.js';
import {setupLibraryMotion} from './library-motion.js';
import {createIndoorAreca} from './tropical-plants.js';
import {Reflector} from 'three/addons/objects/Reflector.js';
import {createMonsteraLeaf,createMonsteraPlant,createMonsteraMaterials} from './monstera.js';
import {addLibraryGarden} from './library-garden.js';
import {addChamferedArchitecture} from './library-architecture.js';
import {createHangingGarden} from './hanging-garden.js';
import {addLibraryDetails} from './library-details.js';
import {createLibraryPot,createLibraryFrame} from './library-props.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';

// A complete procedural set: every visible object is geometry, not a backdrop photo.
export function createBotanicalLibrary(){
 const root=new THREE.Group();root.name='植物书房 · 三维布景';
 let seed=182;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const material=(color,extra={})=>new THREE.MeshStandardMaterial({color,roughness:.84,...extra});
 const walnut=material(0x30271e),trim=material(0x51412c),iron=material(0x242b25,{metalness:.55,roughness:.48}),stone=new THREE.MeshPhysicalMaterial({color:0x4e4941,roughness:.47,metalness:0,clearcoat:.38,clearcoatRoughness:.43}),brass=material(0x8b7042,{metalness:.65,roughness:.4});
 const boxGeometry=new THREE.BoxGeometry(1,1,1);
 function box(w,h,d,x,y,z,mat=walnut,parent=root){const o=new THREE.Mesh(boxGeometry,mat);o.scale.set(w,h,d);o.position.set(x,y,z);o.castShadow=!!mat.isMeshStandardMaterial&&!mat.transparent;o.receiveShadow=true;parent.add(o);return o;}
 function cylinder(r1,r2,h,x,y,z,mat=trim,parent=root){const o=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,12),mat);o.position.set(x,y,z);parent.add(o);return o;}
 function stem(a,b,r=.014,parent=root){const direction=b.clone().sub(a),o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,direction.length(),5),leafStem);o.position.copy(a).add(b).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),direction.normalize());parent.add(o);}
 // Walls and coffered ceiling frame the greenhouse windows.
 const grout=material(0x302d28,{roughness:.96});box(20.4,.15,19,0,-2.48,-.5,grout);
 const floorTiles=new THREE.InstancedMesh(new THREE.BoxGeometry(.59,.035,.59),stone,34*31);
 floorTiles.name='柔光反射地砖 · 0.6米';floorTiles.receiveShadow=true;
 const tileTransform=new THREE.Object3D();let tileIndex=0;
 for(let row=0;row<31;row++)for(let col=0;col<34;col++){
  tileTransform.position.set(-9.9+col*.6,-2.4125,-9.5+row*.6);tileTransform.updateMatrix();
  floorTiles.setMatrixAt(tileIndex,tileTransform.matrix);
  const shade=.92+(tileIndex<780?random():(Math.sin(tileIndex*31.7)*.5+.5))*.12;floorTiles.setColorAt(tileIndex,new THREE.Color(shade,shade,shade));tileIndex++;
 }
 root.add(floorTiles);
 // A subtle planar reflection supplies real window and furniture detail.
 const floorReflection=new Reflector(new THREE.PlaneGeometry(20.4,18.6),{textureWidth:768,textureHeight:768,clipBias:.003,color:0xaaa092});
 floorReflection.name='地砖淡反射';floorReflection.userData.dynamic=true;
 floorReflection.rotation.x=-Math.PI/2;floorReflection.position.set(0,-2.393,-.5);
 floorReflection.material.transparent=true;floorReflection.material.depthWrite=false;
 floorReflection.material.fragmentShader=floorReflection.material.fragmentShader.replace('gl_FragColor = vec4( blendOverlay( base.rgb, color ), 1.0 );','gl_FragColor = vec4( blendOverlay( base.rgb, color ), 0.11 );');
 root.add(floorReflection);
 box(14.2,1.1,.3,0,-1.9,-6.4);box(14.2,.35,.4,0,5.5,-6.4);box(20.4,.25,17,0,5.5,.5);

 const glass=new THREE.MeshPhysicalMaterial({color:0x819582,roughness:.55,metalness:.05,transparent:true,opacity:.18,depthWrite:false,side:THREE.DoubleSide});
 const sky=new THREE.ShaderMaterial({
  vertexShader:'varying vec3 vPosition;void main(){vPosition=(modelMatrix*vec4(position,1.)).xyz;gl_Position=projectionMatrix*viewMatrix*vec4(vPosition,1.);}',
  fragmentShader:'varying vec3 vPosition;void main(){float height=smoothstep(.8,9.0,vPosition.y);vec3 color=mix(vec3(.022,.062,.03),vec3(.93,.86,.69),height);float sun=exp(-length((vPosition.xy-vec2(4.8,9.1))*vec2(.25,.4)));color+=vec3(.62,.41,.17)*pow(sun,2.)*height;gl_FragColor=vec4(color,1.);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>}',
 });box(30,20,.1,0,3,-13,sky);
 // Four glazed bays span 14m, separated by exactly three coarse interior mullions.
 for(let bay=0;bay<4;bay++){
  const x=(bay-1.5)*3.5;
  box(3.44,6.38,.025,x,1.34,-6.3,glass);
  for(const col of [-1,1])box(.055,6.38,.08,x+col*.875,1.34,-6.05,iron);
  for(const y of [WINDOW_TRANSOMS[0],WINDOW_TRANSOMS[2],4.47])box(3.5,.065,.08,x,y,-6.03,iron);
 }
 for(const x of [-3.5,0,3.5]){
  const pillar=new THREE.Group();pillar.name='正面玻璃粗竖柱';root.add(pillar);
  box(.23,6.53,.32,x,1.265,-6.15,trim,pillar);
  box(.05,6.2,.012,x,1.35,-5.983,walnut,pillar);box(.021,6.12,.014,x,1.35,-5.974,brass,pillar);
  for(const y of [-1.76,4.43])box(.055,.035,.016,x,y,-5.973,brass,pillar);
 }
 box(14.2,.16,.17,0,WINDOW_TRANSOMS[1],-5.94,iron);
 box(14.2,.12,.2,0,4.47,-6.08,trim);
 addChamferedArchitecture(root,{wood:walnut,trim,brass,iron,glass,sky});
 // Shelves on both sides, with individually varied book spines batched into one draw.
 const bookMaterial=material(0xffffff),bookTransforms=[],bookColors=[];
 const cabinetWood=walnut.clone();cabinetWood.color.setHex(0x173d30);cabinetWood.roughness=.94;cabinetWood.metalness=0;
 const cabinetTrim=trim.clone();cabinetTrim.color.setHex(0x24523f);cabinetTrim.roughness=.9;cabinetTrim.metalness=0;
 const cabinetGold=new THREE.MeshStandardMaterial({color:0xc3a052,metalness:.78,roughness:.36});
 const palette=[0x55462d,0x343e32,0x6d5038,0x3d3430,0x777057,0x524536,0x3b4944];
 for(const side of [-1,1])for(let bay=side===-1?-1:0;bay<3;bay++){
  const unit=new THREE.Group();unit.name='侧面落地窗前书柜';unit.userData.shelfLevels=4;unit.userData.cabinetSide=side;unit.userData.bay=bay;unit.position.set(side*6.9,-2.35,-1+bay*2.48+(side===-1?1.24:0));unit.rotation.y=-side*Math.PI/2;
  if(side===-1&&bay===-1){
   const run=(Math.hypot(3,3)-1.2)/Math.SQRT2,inset=.78/Math.SQRT2;
   unit.position.set(-(7+run/2)+inset,-2.35,-6.3+run/2+inset);unit.rotation.y=Math.PI/4;unit.userData.againstSideWall=true;
  }
  root.add(unit);
  box(2.3,3.4,.28,0,1.7,-.35,cabinetWood,unit);
  for(const x of [-1.15,1.15])box(.15,3.6,.8,x,1.75,0,cabinetTrim,unit);
  box(2.55,.19,.95,0,3.6,0,cabinetTrim,unit);
  box(2.5,.15,.95,0,.08,0,cabinetWood,unit);
  for(const y of [3.42,3.51])box(2.47,.045,.9,0,y,.02,cabinetTrim,unit);
  for(const x of [-1.13,1.13]){
   const column=new THREE.Group();column.name='书柜侧边 · 凸出凹槽罗马柱';column.position.set(x,0,.43);unit.add(column);
   box(.27,.11,.28,0,.17,0,cabinetTrim,column);box(.23,.065,.24,0,.257,0,cabinetWood,column);
   const shaftGeometry=new THREE.CylinderGeometry(.088,.108,2.91,64,12),positions=shaftGeometry.attributes.position;
   for(let i=0;i<positions.count;i++){const px=positions.getX(i),pz=positions.getZ(i),angle=Math.atan2(pz,px),flute=1-.105*(.5+.5*Math.cos(angle*16));positions.setX(i,px*flute);positions.setZ(i,pz*flute);}
   shaftGeometry.computeVertexNormals();const shaft=new THREE.Mesh(shaftGeometry,cabinetTrim);shaft.position.y=1.79;column.add(shaft);
   for(const [radius,height,y,material]of [[.13,.07,.315,cabinetTrim],[.115,.022,.36,cabinetGold],[.104,.045,3.225,cabinetGold],[.14,.085,3.29,cabinetTrim],[.157,.055,3.36,cabinetWood]]){
    const ring=new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,height,32),material);ring.position.y=y;column.add(ring);
   }
   box(.31,.085,.31,0,3.425,0,cabinetTrim,column);box(.315,.014,.315,0,3.47,0,cabinetGold,column);
   column.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
  }
  // Heavy stepped cornice and shallow bowed moldings echo the reference crown.
  const crown=new THREE.Group();crown.name='书柜顶部 · 叠层挑檐与弧形饰线';unit.add(crown);
  box(2.39,.32,.15,0,3.31,.4,cabinetWood,crown);
  for(const [width,y,depth]of [[2.48,3.47,.94],[2.57,3.57,1.0],[2.65,3.68,1.04]])box(width,.065,depth,0,y,0,cabinetTrim,crown);
  for(const [width,y,depth]of [[2.48,3.47,.94],[2.57,3.57,1.0],[2.65,3.68,1.04]])box(width,.012,.012,0,y-.025,depth/2+.005,cabinetGold,crown);
  for(const side of [-1,1]){
   box(.22,.14,1.06,side*1.19,3.69,0,cabinetTrim,crown);
   const bracket=new THREE.Mesh(new THREE.CylinderGeometry(.055,.085,.18,12),cabinetWood);bracket.position.set(side*1.11,3.47,.43);crown.add(bracket);
  }
  for(let line=0;line<3;line++){
   const points=[];for(let i=0;i<=40;i++){const t=i/40,x=(t-.5)*2.18;points.push(new THREE.Vector3(x,3.19+line*.071+.055*Math.sin(Math.PI*t),.485));}
   const molding=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),40,.012,6,false),cabinetGold);crown.add(molding);
  }
  box(.56,.14,.035,0,3.31,.5,cabinetWood,crown);
  for(const y of [3.255,3.365])box(.51,.012,.015,0,y,.525,cabinetGold,crown);
  // Recessed lower cupboard doors, with raised panel molding and brass handles.
  box(2.28,.65,.7,0,.43,0,cabinetWood,unit);
  for(const x of [-.57,.57]){
   box(1.08,.56,.06,x,.43,.39,cabinetTrim,unit);box(.9,.4,.025,x,.43,.43,cabinetWood,unit);
   for(const y of [.215,.645])box(.94,.008,.008,x,y,.448,cabinetGold,unit);
   for(const edge of [-1,1])box(.008,.43,.008,x+edge*.47,.43,.448,cabinetGold,unit);
   box(.035,.11,.035,x+(x<0?.37:-.37),.48,.46,cabinetGold,unit);
  }
  for(let row=0;row<4;row++){
   const y=.82+row*.65;box(2.35,.095,.85,0,y,0,cabinetTrim,unit);
   let x=-1.02;
   while(x<1){const w=.07+random()*.09,h=.36+random()*.28;const transform=new THREE.Object3D();transform.position.set(x+w/2,y+h/2+.05,.16+random()*.06);transform.scale.set(w,h,.34);transform.rotation.z=(random()-.5)*.12;transform.updateMatrix();unit.updateMatrixWorld(true);bookTransforms.push(new THREE.Matrix4().multiplyMatrices(unit.matrixWorld,transform.matrix));bookColors.push(palette[Math.floor(random()*palette.length)]);x+=w+.025;}
  }
 }
 const books=new THREE.InstancedMesh(boxGeometry,bookMaterial,bookTransforms.length);bookTransforms.forEach((m,i)=>{books.setMatrixAt(i,m);books.setColorAt(i,new THREE.Color(bookColors[i]));});root.add(books);
 const leafStem=material(0x3b4b29),leafMaterial=material(0x405a2e,{side:THREE.DoubleSide});
 const potClay=material(0xaaa89a,{roughness:.92}),potGlaze=material(0x3c4540,{roughness:.85}),soil=material(0x211c14);
 const monsteraGeometries=Array.from({length:5},(_,i)=>createMonsteraLeaf(i));
 const monsteraMaterials=createMonsteraMaterials();
 function plant(x,y,z,height=1.5,pot=true,options={}){
  if(pot){
   const planter=createLibraryPot(random()>.5?potClay:potGlaze,soil);const potScale=options.potScale??1;planter.scale.setScalar(potScale);planter.position.set(x,y,z);root.add(planter);
   const monstera=options.areca?createIndoorAreca(random):createMonsteraPlant(height,random,monsteraMaterials,monsteraGeometries,options);if(!options.areca)monstera.name=options.leafCount?'室内龟背竹 · 大盆浓密':'室内龟背竹 · 小盆';monstera.position.set(x,y+(potScale-1)*.415,z);root.add(monstera);return;
  }

 }

 for(const side of [-1,1]){
  plant(side*5.8,-2.35,2.9,2.55,true,{potScale:side===1?1.1:1.5,leafCount:22,areca:side===1});
  if(side===-1){
   plant(side*6.3,-2.35,-.4,1.3,true,{potScale:.9});
   plant(side*6,-2.35,1,1.1,true,{potScale:.8});
  }
 }
 const hangingGarden=createHangingGarden();hangingGarden.position.y=-.3;root.add(hangingGarden);
 const rearFurnitureStart=new Set(root.children);
 // A low antique desk, drawers, chair, and open frames sit behind the water stage.
 const desk=createLibraryDesk({walnut,trim,brass});desk.position.set(0,-2.35,-3.6);root.add(desk);
 const drawerCabinet=createDrawerCabinet({walnut,trim,brass});drawerCabinet.position.set(-1.55,-2.345,-2.6);root.add(drawerCabinet);
 box(.7,.12,.7,.25,-1.8,-4.65,trim);box(.75,1,.1,.25,-1.25,-4.95);for(const x of [-.02,.52])for(const z of [-4.4,-4.9])box(.055,.6,.055,x,-2.1,z);
 for(const object of root.children)if(!rearFurnitureStart.has(object))object.position.x+=1.6;
 function frame(x,y,z,w,h,angle=0){const group=createLibraryFrame(w,h,trim,brass);if(y>0){group.userData.hangingFrame=true;group.userData.frameHeight=h;}group.position.set(x,y,z);group.rotation.z=angle;root.add(group);
  if(y>0)for(const side of [-1,1])stem(new THREE.Vector3(x+side*w*.32,y+h*.5,z-.03),new THREE.Vector3(x+side*w*.32,5.35,z-.03),.004);
  else{box(w*.82,.03,.28,x,y-h*.5-.02,z-.08,walnut);}
  return group;}

 frame(-1.1,-.9,-3.4,.7,1.1,-.15);frame(4.35,-1.4,-4.1,.9,1.4,.1);
 for(const x of [-5.8,5.8])for(const z of [-4.3,-1.9,.5]){
  const pendant=new THREE.Group();pendant.name='纵向排列吊灯';pendant.position.set(x,0,z);root.add(pendant);
  cylinder(.012,.012,3.57,0,3.265,0,iron,pendant);
  cylinder(.05,.3,.16,0,1.4,0,iron,pendant);
  const bulb=new THREE.Mesh(new THREE.SphereGeometry(.055,8,6),new THREE.MeshBasicMaterial({color:0xffdaa0}));bulb.position.set(0,1.3,0);pendant.add(bulb);
 }
 const daylight=new THREE.HemisphereLight(0xd9e9e5,0x514e3e,1.1);root.add(daylight);
 const sun=new THREE.SpotLight(0xffdc98,110,32,.65,.8,1.2);sun.position.set(4.5,11.5,-11);sun.target.position.set(-1.8,-2,2);
 sun.name='透窗太阳光 · 实体建筑遮挡';sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.near=.5;sun.shadow.camera.far=45;sun.shadow.bias=-.00015;sun.shadow.normalBias=.012;sun.shadow.radius=2;root.add(sun,sun.target);
 addLibraryDetails(root,{box,cylinder,walnut,trim,iron,brass,stone,random,books,leafMaterial,sun});
 for(const m of [cabinetWood,cabinetTrim]){m.map=walnut.map;m.bumpMap=walnut.bumpMap;m.bumpScale=.006;m.needsUpdate=true;}
 addLibraryGarden(root,{random,leafGeometries:monsteraGeometries});
 addLibraryCeiling(root);
 addWindowMist(root);
 addIndoorMist(root);
 root.userData.motion=setupLibraryMotion(root);
 // Retain geometry bounds for placement verification before static mesh batching.
 root.updateMatrixWorld(true);
 const lowShelves=root.children.filter(o=>o.name==='右侧矮书架 · 牛皮卷轴与书本');
 const obstacles=root.children.filter(o=>o.name==='侧面落地窗前书柜'||o.name==='室内小型散尾葵 · 浓密羽状叶'||(o.position.x>0&&o.name.startsWith('现代简约花盆')));
 root.userData.shelfPlacement=lowShelves.map(shelf=>{const bounds=new THREE.Box3().setFromObject(shelf);return {position:shelf.position.toArray(),height:bounds.max.y-bounds.min.y,overlaps:obstacles.filter(o=>bounds.intersectsBox(new THREE.Box3().setFromObject(o))).map(o=>o.name)};});
 // The set is static: batch by shared material to keep reflection rendering affordable.
 root.updateMatrixWorld(true);const batches=new Map();
 root.traverse(object=>{
  if(!object.isMesh||object.isInstancedMesh||object.userData.dynamic||Array.isArray(object.material))return;
  if(!batches.has(object.material))batches.set(object.material,[]);
  batches.get(object.material).push(object);
 });
 for(const [material,objects] of batches){
  if(objects.length<2)continue;
  const copies=objects.map(object=>(object.geometry.index?object.geometry.toNonIndexed():object.geometry.clone()).applyMatrix4(object.matrixWorld));
  const merged=mergeGeometries(copies,false);copies.forEach(g=>g.dispose());
  if(!merged)continue;
  const mesh=new THREE.Mesh(merged,material);mesh.name='书房静态合并布景';mesh.castShadow=objects.some(object=>object.castShadow);mesh.receiveShadow=objects.some(object=>object.receiveShadow);root.add(mesh);
  objects.forEach(object=>object.removeFromParent());
 }
 root.visible=false;return root;
}
