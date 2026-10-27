import * as THREE from 'three';
import {TessellateModifier} from 'three/addons/modifiers/TessellateModifier.js';
import {mergeVertices} from 'three/addons/utils/BufferGeometryUtils.js';

// Five distinct blade meshes: juvenile, split, perforated, broad and mature/drooping.
export function createMonsteraLeaf(variant=0){
 const shape=new THREE.Shape(),steps=100;
 const width=t=>Math.pow(Math.sin(Math.PI*t),.7)*(.34+(variant%3)*.045);
 const splits=variant===0?[]:variant===1?[.35,.58,.76]:[.25,.43,.62,.8];
 for(const side of [-1,1]){
  for(let i=0;i<=steps;i++){
   const t=side<0?i/steps:1-i/steps;
   let indentation=1;
   for(const center of splits){const shift=side>0?.025:0;indentation-=.77*Math.exp(-Math.pow((t-center-shift)/.015,2));}
   const x=side*width(t)*Math.max(.18,indentation)*(1+.045*Math.sin(t*19+variant+side));
   if(side<0&&i===0)shape.moveTo(x,t);else shape.lineTo(x,t);
  }
 }
 shape.closePath();
 if(variant>=2)for(const side of [-1,1])for(const y of [.34,.53,.71]){
  const hole=new THREE.Path(),x=side*(.08+(1-y)*.09);
  hole.absellipse(x,y,.022+(variant===3?.008:0),.039,.0,Math.PI*2,true,side*.2);shape.holes.push(hole);
 }
 const original=new THREE.ExtrudeGeometry(shape,{depth:.002,bevelEnabled:false,curveSegments:10,steps:1});
 const subdivided=new TessellateModifier(.085,5).modify(original);original.dispose();
 const geometry=mergeVertices(subdivided);subdivided.dispose();
 const positions=geometry.attributes.position,uv=geometry.attributes.uv;
 for(let i=0;i<positions.count;i++){
  const x=positions.getX(i),t=positions.getY(i);
  const bend=leafBend(x,t,variant);
  uv.setXY(i,x+.5,t);
  positions.setZ(i,positions.getZ(i)+bend);
 }
 geometry.computeVertexNormals();geometry.userData.variant=variant;return geometry;
}
export function leafBend(x,t,variant){
 const droop=[.26,.43,.54,.37,.69][variant];
 const twist=[.07,-.18,.24,-.22,.3][variant];
 const cup=[.25,-.28,.36,-.18,.42][variant];
 return -droop*t*t+.065*Math.sin(Math.PI*t)+cup*x*x+twist*x*Math.sin(Math.PI*t)+.028*Math.sin(t*13+variant*1.7)*Math.abs(x);
}
export function createMonsteraMaterials(){
 const stem=new THREE.MeshStandardMaterial({color:0x3b542c,roughness:.78});
 const leaves=[0x355c31,0x426a39,0x537b42].map(color=>{
  const material=new THREE.MeshPhysicalMaterial({color,side:THREE.DoubleSide,roughness:.43,metalness:0,clearcoat:.65,clearcoatRoughness:.27});
  material.userData.foliage=true;
  material.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\nif(!gl_FrontFacing) diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.25,.32,.17),.24);');};
  material.customProgramCacheKey=()=> 'monstera-matte-underside-v1';return material;
 });
 if(typeof document!=='undefined'){
  const canvas=document.createElement('canvas');canvas.width=256;canvas.height=256;const c=canvas.getContext('2d');
  c.fillStyle='#b5bcaa';c.fillRect(0,0,256,256);
  for(let y=20;y<250;y+=24)for(const side of [-1,1]){
   c.strokeStyle='#a4ae96';c.lineWidth=1.2;c.beginPath();c.moveTo(128,y);c.bezierCurveTo(128+side*26,y+8,128+side*66,y+17,128+side*101,y+35);c.stroke();
  }
  c.strokeStyle='#c1c7b0';c.lineWidth=2;c.beginPath();c.moveTo(128,0);c.lineTo(128,256);c.stroke();
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
  for(const material of leaves){material.map=texture;material.bumpMap=texture;material.bumpScale=.0014;}
 }
 return {stem,leaves};
}
export function createMonsteraPlant(height,random,materials,leafGeometries,options={}){
 const root=new THREE.Group();root.name='龟背竹 · 重力弯曲叶柄与五种叶形';
 const stemMaterial=materials.stem,bladeMaterials=materials.leaves;
 const stemBase=new THREE.Vector3(0,.39,0),count=options.leafCount??(7+Math.floor(random()*4));
 for(let i=0;i<count;i++){
  const a=i*2.399+random()*.3,juvenile=i<(options.leafCount?4:2),reach=height*(.19+random()*.18),rise=height*(juvenile?.28:options.leafCount?.3+random()*.5:.45+random()*.32);
  const outward=new THREE.Vector3(Math.cos(a),0,Math.sin(a));
  const end=outward.clone().multiplyScalar(reach);end.y=.4+rise;
  const curve=new THREE.CubicBezierCurve3(stemBase.clone(),new THREE.Vector3(0,.4+rise*.75,0),outward.clone().multiplyScalar(reach*.56).add(new THREE.Vector3(0,end.y+.24+reach*.3,0)),end);
  const stalk=new THREE.Mesh(new THREE.TubeGeometry(curve,24,.009+height*.003,6,false),stemMaterial);root.add(stalk);
  const variant=juvenile?0:1+Math.floor(random()*4),size=height*(juvenile?.24:.32+random()*.17);
  const blade=new THREE.Mesh(leafGeometries[variant],bladeMaterials[i%bladeMaterials.length]);
  const tangent=new THREE.Vector3(-Math.sin(a),0,Math.cos(a));
  blade.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(tangent,outward,new THREE.Vector3(0,1,0)));
  blade.rotateY((random()-.5)*.2);blade.rotateX((random()-.5)*.18);
  blade.position.copy(end);blade.scale.set(size*(.7+random()*.16)*(options.leafWidth??1),size,size);root.add(blade);
  const midrib=[];for(let j=0;j<=16;j++){const t=j/16;midrib.push(new THREE.Vector3(0,t,leafBend(0,t,variant)+.004));}
  const vein=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(midrib),24,.0028,5,false),stemMaterial);vein.position.copy(blade.position);vein.quaternion.copy(blade.quaternion);vein.scale.copy(blade.scale);root.add(vein);
 }
 return root;
}
