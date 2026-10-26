import * as THREE from 'three';
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
 const walnut=material(0x30271e),trim=material(0x51412c),iron=material(0x242b25,{metalness:.55,roughness:.48}),stone=new THREE.MeshPhysicalMaterial({color:0x595c53,roughness:.32,metalness:0,clearcoat:.55,clearcoatRoughness:.3}),brass=material(0x8b7042,{metalness:.65,roughness:.4});
 const boxGeometry=new THREE.BoxGeometry(1,1,1);
 function box(w,h,d,x,y,z,mat=walnut,parent=root){const o=new THREE.Mesh(boxGeometry,mat);o.scale.set(w,h,d);o.position.set(x,y,z);parent.add(o);return o;}
 function cylinder(r1,r2,h,x,y,z,mat=trim,parent=root){const o=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,12),mat);o.position.set(x,y,z);parent.add(o);return o;}
 function stem(a,b,r=.014,parent=root){const direction=b.clone().sub(a),o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,direction.length(),5),leafStem);o.position.copy(a).add(b).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),direction.normalize());parent.add(o);}
 // Walls and coffered ceiling frame the greenhouse windows.
 const grout=material(0x272b27,{roughness:.96});box(20.4,.15,19,0,-2.48,-.5,grout);
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
 const floorReflection=new Reflector(new THREE.PlaneGeometry(20.4,18.6),{textureWidth:768,textureHeight:768,clipBias:.003,color:0xb8b7a6});
 floorReflection.name='地砖淡反射';floorReflection.userData.dynamic=true;
 floorReflection.rotation.x=-Math.PI/2;floorReflection.position.set(0,-2.393,-.5);
 floorReflection.material.transparent=true;floorReflection.material.depthWrite=false;
 floorReflection.material.fragmentShader=floorReflection.material.fragmentShader.replace('gl_FragColor = vec4( blendOverlay( base.rgb, color ), 1.0 );','gl_FragColor = vec4( blendOverlay( base.rgb, color ), 0.18 );');
 root.add(floorReflection);
 box(13.2,1.1,.3,0,-1.9,-6.4);box(13.2,.35,.4,0,5.5,-6.4);box(20.4,.25,17,0,5.8,.5);

 const glass=new THREE.MeshPhysicalMaterial({color:0x819582,roughness:.55,metalness:.05,transparent:true,opacity:.18,depthWrite:false,side:THREE.DoubleSide});
 const sky=new THREE.ShaderMaterial({
  vertexShader:'varying vec3 vPosition;void main(){vPosition=(modelMatrix*vec4(position,1.)).xyz;gl_Position=projectionMatrix*viewMatrix*vec4(vPosition,1.);}',
  fragmentShader:'varying vec3 vPosition;void main(){float height=smoothstep(.8,9.0,vPosition.y);vec3 color=mix(vec3(.022,.062,.03),vec3(.93,.86,.69),height);float sun=exp(-length((vPosition.xy-vec2(4.8,9.1))*vec2(.25,.4)));color+=vec3(.62,.41,.17)*pow(sun,2.)*height;gl_FragColor=vec4(color,1.);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>}',
 });box(30,20,.1,0,3,-13,sky);
 // Four glazed bays span 13m, separated by exactly three coarse interior mullions.
 for(let bay=0;bay<4;bay++){
  const x=(bay-1.5)*3.25;
  box(3.19,7,.025,x,1.65,-6.3,glass);
  for(const col of [-1,1])box(.055,7,.08,x+col*.81,1.65,-6.05,iron);
  for(const y of [-.9,2.85,4.85])box(3.25,.065,.08,x,y,-6.03,iron);
 }
 for(const x of [-3.25,0,3.25]){
  const pillar=new THREE.Group();pillar.name='正面玻璃粗竖柱';root.add(pillar);
  box(.23,7.3,.32,x,1.65,-6.15,trim,pillar);
  box(.05,6.8,.012,x,1.65,-5.983,walnut,pillar);box(.021,6.72,.014,x,1.65,-5.974,brass,pillar);
  for(const y of [-1.76,5.06])box(.055,.035,.016,x,y,-5.973,brass,pillar);
 }
 box(13.2,.16,.17,0,1.6,-5.94,iron);
 addChamferedArchitecture(root,{wood:walnut,trim,brass,iron,glass,sky});
 // Shelves on both sides, with individually varied book spines batched into one draw.
 const bookMaterial=material(0xffffff),bookTransforms=[],bookColors=[];
 const palette=[0x55462d,0x343e32,0x6d5038,0x3d3430,0x777057,0x524536,0x3b4944];
 for(const side of [-1,1])for(let bay=0;bay<3;bay++){
  const unit=new THREE.Group();unit.name='侧面落地窗前书柜';unit.position.set(side*6.9,-2.35,-1+bay*2.48);unit.rotation.y=-side*Math.PI/2;root.add(unit);
  box(2.3,4.7,.28,0,2.35,-.35,walnut,unit);
  for(const x of [-1.15,1.15])box(.15,4.9,.8,x,2.4,0,trim,unit);
  box(2.55,.19,.95,0,4.9,0,trim,unit);
  box(2.5,.15,.95,0,.08,0,walnut,unit);
  for(const y of [4.72,4.81])box(2.47,.045,.9,0,y,.02,trim,unit);
  for(const x of [-1.08,1.08]){box(.055,4.45,.04,x,2.5,.43,brass,unit);}
  // Recessed lower cupboard doors, with raised panel molding and brass handles.
  box(2.28,.65,.7,0,.43,0,walnut,unit);
  for(const x of [-.57,.57]){
   box(1.08,.56,.06,x,.43,.39,trim,unit);box(.9,.4,.025,x,.43,.43,walnut,unit);
   box(.035,.11,.035,x+(x<0?.37:-.37),.48,.46,brass,unit);
  }
  for(let row=0;row<6;row++){
   const y=.82+row*.65;box(2.35,.095,.85,0,y,0,trim,unit);
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
 root.add(createHangingGarden());
 const rearFurnitureStart=new Set(root.children);
 // A low antique desk, drawers, chair, and open frames sit behind the water stage.
 box(3.2,.14,.95,0,-1.38,-3.6,trim);
 for(const side of [-1,1]){box(.7,.85,.8,side*1.05,-1.87,-3.65);for(let i=0;i<3;i++){box(.63,.22,.025,side*1.05,-1.58-i*.25,-3.23,trim);box(.12,.025,.035,side*1.05,-1.58-i*.25,-3.19,brass);}}
 box(.7,.12,.7,.25,-1.8,-4.65,trim);box(.75,1,.1,.25,-1.25,-4.95);for(const x of [-.02,.52])for(const z of [-4.4,-4.9])box(.055,.6,.055,x,-2.1,z);
 for(const object of root.children)if(!rearFurnitureStart.has(object))object.position.x+=1.6;
 function frame(x,y,z,w,h,angle=0){const group=createLibraryFrame(w,h,trim,brass);if(y>0){group.userData.hangingFrame=true;group.userData.frameHeight=h;}group.position.set(x,y,z);group.rotation.z=angle;root.add(group);
  if(y>0)for(const side of [-1,1])stem(new THREE.Vector3(x+side*w*.32,y+h*.5,z-.03),new THREE.Vector3(x+side*w*.32,5.35,z-.03),.004);
  else{box(w*.82,.03,.28,x,y-h*.5-.02,z-.08,walnut);}
  return group;}

 frame(-3.1,.85,-5.8,1.1,1.6,.05);frame(3.4,.75,-5.8,.95,1.55,-.03);frame(-1.1,-1.55,-3.4,.7,1.1,-.15);frame(4.35,-1.4,-4.1,.9,1.4,.1);
 for(const x of [-4.4,-2.7,2.7,4.4]){
  cylinder(.012,.012,1.5,x,4.1,-3.3,iron);
  cylinder(.05,.3,.16,x,3.3,-3.3,iron);
  const bulb=new THREE.Mesh(new THREE.SphereGeometry(.055,8,6),new THREE.MeshBasicMaterial({color:0xffdaa0}));bulb.position.set(x,3.2,-3.3);root.add(bulb);
 }
 const daylight=new THREE.HemisphereLight(0xd9e9e5,0x514e3e,1.1);root.add(daylight);
 const sun=new THREE.SpotLight(0xffdc98,110,32,.65,.8,1.2);sun.position.set(4.5,9.5,-11);sun.target.position.set(-1.8,-2,2);root.add(sun,sun.target);
 addLibraryDetails(root,{box,cylinder,walnut,trim,iron,brass,stone,random,books,leafMaterial,sun});
 addLibraryGarden(root,{random,leafGeometries:monsteraGeometries});
 addWindowMist(root);
 root.userData.motion=setupLibraryMotion(root);
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
