import {MARSH_NOISE_GLSL,MARSH_CLOUD_SHADOW_GLSL,weatherMarshStone} from './marsh-weather.js';
import * as THREE from 'three';
import {Reflector} from 'three/addons/objects/Reflector.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';

// Reference-inspired flooded ruin: real arches and instanced reeds, no photo backdrop.
export function createMarshRuins(){
 const root=new THREE.Group();root.name='最初的涟漪 · 芦苇水泽';
 let seed=1977;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const waterY=-2.035,time={value:0},mistStrength={value:1};
 const stone=Array.from({length:6},(_,i)=>new THREE.MeshStandardMaterial({color:new THREE.Color().setHSL(.115,.13,.29+i*.028),roughness:.98}));
 for(const material of stone)weatherMarshStone(material,time);
 const masonry=[];
 function block(w,h,d,x,y,z,rotation=0){
  const geometry=new THREE.BoxGeometry(w,h,d,2,2,1),p=geometry.attributes.position;
  for(let i=0;i<p.count;i++){const v=new THREE.Vector3().fromBufferAttribute(p,i);v.x+=(random()-.5)*.035;v.y+=(random()-.5)*.035;p.setXYZ(i,v.x,v.y,v.z);}
  geometry.computeVertexNormals();const mesh=new THREE.Mesh(geometry,stone[Math.floor(random()*stone.length)]);mesh.position.set(x,y,z);mesh.rotation.y=rotation;root.add(mesh);masonry.push(mesh);return mesh;
 }
 function column(x,z,height=3.25,gap=null,shaftOnly=false){
  const base=waterY-.02,bottom=base+.34,top=base+height-.14;
  if(!shaftOnly){block(1.22,.2,1.22,x,base+.1,z);block(1.06,.13,1.06,x,base+.26,z);}
  const sections=gap?[[bottom,gap[0]],[gap[1],top]]:[[bottom,top]];
  for(const [low,high] of sections){
   // A square pier with four clipped corners, rather than a fluted round shaft.
   const half=.51,cut=.105,profile=new THREE.Shape();
   const points=[[-half+cut,-half],[half-cut,-half],[half,-half+cut],[half,half-cut],[half-cut,half],[-half+cut,half],[-half,half-cut],[-half,-half+cut]];
   profile.moveTo(...points[0]);for(const point of points.slice(1))profile.lineTo(...point);profile.closePath();
   const shaft=new THREE.ExtrudeGeometry(profile,{depth:high-low,bevelEnabled:false,steps:5});shaft.rotateX(-Math.PI/2);
   const positions=shaft.attributes.position;
   for(let i=0;i<positions.count;i++){
    const y=positions.getY(i),taper=THREE.MathUtils.lerp(1,.91,(low+y-bottom)/(top-bottom));
    positions.setX(i,positions.getX(i)*taper);positions.setZ(i,positions.getZ(i)*taper);
    if(gap&&(y<.001||y>high-low-.001))positions.setY(i,y+.02*Math.sin(positions.getX(i)*9+positions.getZ(i)*5));
   }
   shaft.computeVertexNormals();const mesh=new THREE.Mesh(shaft,stone[2]);mesh.position.set(x,low,z);root.add(mesh);masonry.push(mesh);
  }
  if(!shaftOnly){block(1.06,.18,1.06,x,base+height-.1,z);block(1.22,.13,1.22,x,base+height+.055,z);}
 }

 function arch(cx,z,width=1.9,spring=1.18,broken=false){
  const inner=width/2,outer=inner+.45,count=15;
  for(let i=0;i<count;i++){
   if(broken&&(i<3||i===10))continue;
   const a=i/count*Math.PI+.012,b=(i+1)/count*Math.PI-.012;
   const shape=new THREE.Shape();shape.absarc(0,0,outer,a,b,false);shape.lineTo(Math.cos(b)*inner,Math.sin(b)*inner);shape.absarc(0,0,inner,b,a,true);shape.closePath();
   const mesh=new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth:.82,steps:1,bevelEnabled:true,bevelSize:.024,bevelThickness:.018,bevelSegments:1,curveSegments:5}),stone[i%6]);mesh.position.set(cx,spring,z-.41);mesh.rotation.z=broken&&i===4?.06:0;root.add(mesh);masonry.push(mesh);
   const inset=new THREE.Shape();inset.absarc(0,0,inner+.06,a,b,false);inset.lineTo(Math.cos(b)*(inner-.14),Math.sin(b)*(inner-.14));inset.absarc(0,0,inner-.14,b,a,true);inset.closePath();
   const stepMesh=new THREE.Mesh(new THREE.ExtrudeGeometry(inset,{depth:.32,steps:1,bevelEnabled:true,bevelSize:.012,bevelThickness:.01,bevelSegments:1,curveSegments:5}),stone[1]);
   stepMesh.position.set(cx,spring,z-.16);stepMesh.rotation.z=mesh.rotation.z;root.add(stepMesh);masonry.push(stepMesh);
  }
 }
 // Circular rotunda in plan: perimeter arches supported a now-collapsed dome.
 const centreX=-4.2,centreZ=-23.5,radius=4.05,bays=12,step=Math.PI*2/bays,nearRotation=step;
 const nearBays=[1,2,3,4],farBays=[10,11],survivingColumns=[1,2,3,4,5];
 const brokenGap=[-1.03,-.28];
 function compoundPier(x,z,angle){
  // The jamb of each adjoining arch contributes one engaged shaft to a shared pier.
  const base=waterY-.02;
  for(const side of [-1,1]){
   const direction=angle+side*step/2,dx=-Math.sin(direction)*side*.19,dz=Math.cos(direction)*side*.19,start=masonry.length;
   column(x+dx,z+dz,3.25,null,true);
   for(const mesh of masonry.slice(start)){mesh.scale.x=mesh.scale.z=.74;mesh.rotation.y=-direction;}
  }
  block(1.3,.2,1.2,x,base+.1,z,-angle);block(1.15,.13,1.08,x,base+.26,z,-angle);
  block(1.16,.18,1.1,x,base+3.25-.1,z,-angle);block(1.32,.13,1.24,x,base+3.25+.055,z,-angle);
 }
 for(const index of survivingColumns){
  const angle=index*step+nearRotation,x=centreX+Math.cos(angle)*radius,z=centreZ+Math.sin(angle)*radius;
  if(index>1&&index<5)compoundPier(x,z,angle);
  else{const start=masonry.length;column(x,z,3.25);for(const mesh of masonry.slice(start))mesh.rotation.y=-angle;}
 }
 for(const bay of nearBays){
  const mid=(bay+.5)*step+nearRotation,ringRadius=radius*Math.cos(step/2),start=masonry.length;
  arch(0,0,2*radius*Math.sin(step/2)-.5,1.19);
  for(const mesh of masonry.slice(start)){
   mesh.rotation.y=-mid-Math.PI/2;
   const depth=mesh.position.z;mesh.position.set(centreX+Math.cos(mid)*(ringRadius-depth),1.19,centreZ+Math.sin(mid)*(ringRadius-depth));
  }
  block(2*radius*Math.sin(step/2)+.04,.38,.94,centreX+Math.cos(mid)*ringRadius,2.31,centreZ+Math.sin(mid)*ringRadius,-mid-Math.PI/2);
 }
 // One lost bay separates the front-facing rear arch from the oblique side remnant.
 const farFragments=[{x:-1.4,z:-26.4,yaw:0,broken:false},{x:.8,z:-23.6,yaw:-Math.PI/3,broken:true}];
 for(const fragment of farFragments){
  const span=2.1,along={x:Math.cos(fragment.yaw),z:-Math.sin(fragment.yaw)};
  for(const side of [-1,1]){
   const start=masonry.length;column(fragment.x+along.x*side*span/2,fragment.z+along.z*side*span/2,3.25,fragment.broken&&side===1?brokenGap:null);
   for(const mesh of masonry.slice(start))mesh.rotation.y=fragment.yaw;
  }
  const start=masonry.length;arch(0,0,1.6,1.19,fragment.broken);
  for(const mesh of masonry.slice(start)){mesh.rotation.y=fragment.yaw;const depth=mesh.position.z;mesh.position.set(fragment.x+Math.sin(fragment.yaw)*depth,1.19,fragment.z+Math.cos(fragment.yaw)*depth);}
 }
 // One connected shell follows the reference's irregular broken-wall silhouette.
 const topProfile=[
  [0,2.84],[.02,2.91],[.04,3.06],[.06,2.86],[.08,3.26],[.095,3.19],
  [.11,2.72],[.13,2.68],[.15,3.02],[.17,3.06],[.18,3.40],
  [.205,4.02],[.22,4.07],[.245,4.48],[.265,4.54],[.285,5.15],[.305,5.38],
  [.325,5.06],[.333,4.30],[.35,3.60],[.375,3.32],[.39,3.37],[.405,3.18],
  [.42,3.22],[.445,3.24],[.46,3.30],[.48,3.24],[.50,3.35],
  [.523,4.60],[.548,4.65],[.568,4.17],[.59,4.12],
  [.63,3.90],[.66,3.96],[.70,3.85],[.74,3.58],[.78,3.50],[.82,3.56],
  [.85,3.34],[.89,3.20],[.92,3.05],[.96,2.90],[1,2.72]
 ];
 const shellPositions=[],shellUvs=[],shellColors=[],shellIndices=[],rows=7,columns=topProfile.length,layerSize=(rows+1)*columns,baseHeight=2.46;
 for(let layer=0;layer<2;layer++)for(let row=0;row<=rows;row++)for(const [u,top] of topProfile){
  const fraction=row/rows,y=THREE.MathUtils.lerp(baseHeight,top,fraction),h=y-baseHeight;
  const angle=Math.PI*5/6-u*Math.PI*2/3+nearRotation;
  const erosion=Math.sin(u*83+y*7)*Math.sin(y*11-u*19)*.004;
  const radial=radius+(layer===0?.48:0)-.12*h-.06*h*h+erosion;
  shellPositions.push(centreX+Math.cos(angle)*radial,y,centreZ+Math.sin(angle)*radial);
  shellUvs.push(u*4,h);const shade=.9+.075*Math.sin(u*57+y*8)+.035*Math.sin(u*139-y*13);shellColors.push(shade,shade*.99,shade*.96);
 }
 for(let layer=0;layer<2;layer++)for(let row=0;row<rows;row++)for(let col=0;col<columns-1;col++){
  const a=layer*layerSize+row*columns+col,b=a+1,c=a+columns,d=c+1;
  if(layer===0)shellIndices.push(a,b,c,b,d,c);else shellIndices.push(a,c,b,b,c,d);
 }
 // Join the front/back surfaces around the full broken outline, including every peak.
 for(let col=0;col<columns-1;col++){
  const a=col,b=col+1,c=rows*columns+col,d=c+1;
  shellIndices.push(a,a+layerSize,b,b,a+layerSize,b+layerSize,c,d,c+layerSize,d,d+layerSize,c+layerSize);
 }
 for(let row=0;row<rows;row++)for(const col of [0,columns-1]){
  const a=row*columns+col,b=a+columns;
  if(col===0)shellIndices.push(a,b,a+layerSize,b,b+layerSize,a+layerSize);else shellIndices.push(a,a+layerSize,b,b,a+layerSize,b+layerSize);
 }
 const shellGeometry=new THREE.BufferGeometry();shellGeometry.setAttribute('position',new THREE.Float32BufferAttribute(shellPositions,3));shellGeometry.setAttribute('uv',new THREE.Float32BufferAttribute(shellUvs,2));shellGeometry.setAttribute('color',new THREE.Float32BufferAttribute(shellColors,3));shellGeometry.setIndex(shellIndices);shellGeometry.computeVertexNormals();
 const shellMaterial=stone[3].clone();shellMaterial.vertexColors=true;shellMaterial.flatShading=true;shellMaterial.side=THREE.DoubleSide;shellMaterial.userData.largeRuinCracks=true;weatherMarshStone(shellMaterial,time);
 const shell=new THREE.Mesh(shellGeometry,shellMaterial);shell.name='整体破损弧形残顶';shell.castShadow=shell.receiveShadow=true;root.add(shell);masonry.push(shell);
 root.userData.architecture={type:'ruined-circular-domed-rotunda',centre:[centreX,centreZ],radius,bays,nearArches:4,farArches:2,brokenColumnGap:brokenGap,roofConstruction:'continuous-shell',roofPieces:1,nearRotationDegrees:30,roofHardEdges:true,sharedPiers:3,farFrontFacingYaw:0,missingBaysBetweenFarArches:1,farFragments,entablatureBottom:2.12,archCrown:1.19+(2*radius*Math.sin(step/2)-.5)/2+.45,stoneFinish:'weathered-pitted-limestone',archRecessDepth:.25,archInnerStep:.14,roofBranchingCracks:true,centralNotchHeight:3.18,leftRemnantMinHeight:2.68,archThickness:.45,archDepth:.82};
 // Low remnants mark the destroyed ring, rather than leaving an intact rear colonnade.
 for(const index of [0,7,8,9]){const angle=index*step;column(centreX+Math.cos(angle)*radius,centreZ+Math.sin(angle)*radius,.7+random()*.4);}
 // A broken wall and fallen column drums sit to the left, half-submerged.
 const leftRemnantStart=masonry.length;
 for(let row=0;row<7;row++)for(let col=0;col<5;col++){
  if(row+col>7||row>4&&col>1||row===6&&col===0)continue;
  block(.72,.34,.78,-11.4+col*.64,waterY+.1+row*.32,-16.7+(random()-.5)*.15,(random()-.5)*.08);
 }
 const leftRemnant=masonry.slice(leftRemnantStart);
 for(let i=0;i<5;i++){
  const mesh=new THREE.Mesh(new THREE.CylinderGeometry(.24,.28,.55+random()*.5,16),stone[i%6]);mesh.rotation.z=Math.PI*.46;mesh.rotation.y=random()*2;mesh.position.set(-9+random()*2,waterY+.13,-17-random()*3);root.add(mesh);masonry.push(mesh);
 }
 for(let i=0;i<65;i++){
  const angle=random()*Math.PI*2,r=radius+random()*3;
  const mesh=block(.18+random()*.65,.15+random()*.5,.23+random()*.55,centreX+Math.cos(angle)*r,waterY+.03+random()*.08,centreZ+Math.sin(angle)*r,random()*Math.PI);mesh.rotation.z=(random()-.5)*.3;
 }
 // Move the entire ruin site together; water, reeds and the foreground wheel stay put.
 const siteOffset={x:2.4,z:-5};
 // A half-bay turn counterclockwise when viewed from above, around the ruin centre.
 const siteRotation=step/2,siteTurn=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),siteRotation);
 const sitePivot=new THREE.Vector3(centreX,0,centreZ);
 for(const mesh of masonry){
  mesh.position.sub(sitePivot).applyQuaternion(siteTurn).add(sitePivot);
  mesh.quaternion.premultiply(siteTurn);
  mesh.position.x+=siteOffset.x;mesh.position.z+=siteOffset.z;
 }
 Object.assign(root.userData.architecture,{centre:[centreX+siteOffset.x,centreZ+siteOffset.z],siteOffset,siteRotationDegrees:15,siteRotationDirection:'counterclockwise-from-above',columnSection:'chamfered-square',columnWidth:1.02});
 // Offset the left wall by its own world-space length and depth after the site turn.
 root.updateMatrixWorld(true);
 const remnantBounds=new THREE.Box3();for(const mesh of leftRemnant)remnantBounds.expandByObject(mesh);
 const remnantSize=remnantBounds.getSize(new THREE.Vector3());
 for(const mesh of leftRemnant){mesh.position.x-=remnantSize.x;mesh.position.z-=remnantSize.z;}
 root.userData.architecture.leftRemnantOffset={x:-remnantSize.x,z:-remnantSize.z};
 // Batch masonry by material for a small fixed draw-call count.
 root.updateMatrixWorld(true);
 for(const material of stone){
  const meshes=masonry.filter(m=>m.material===material);if(!meshes.length)continue;
  const copies=meshes.map(m=>(m.geometry.index?m.geometry.toNonIndexed():m.geometry.clone()).applyMatrix4(m.matrixWorld));
  const geometry=mergeGeometries(copies,false);copies.forEach(g=>g.dispose());
  const mesh=new THREE.Mesh(geometry,material);mesh.name='残破拱廊 · 石灰岩砌体';mesh.castShadow=mesh.receiveShadow=true;root.add(mesh);
  for(const source of meshes){source.removeFromParent();source.geometry.dispose();}
 }
 const mud=new THREE.MeshStandardMaterial({color:0x35392b,roughness:1});
 const patches=[
  [-7.8,-7.8,3.5,1.25,.68,0xb07850],[-23,-15.8,14.1,1.8,1.18,0xd8c08a],[-17,-24,5.8,2.2,.72,0xd0b680],
  [10.7,-6.8,5,1.9,1.3,0xb86b49],[7.9,-13.6,3.9,1.5,1.03,0xb77951],[13.5,-21,5.7,1.8,.82,0xc39166],[19,-29,7,2.1,.72,0xc7b180]
 ];
 for(const [x,z,w,d] of patches){const island=new THREE.Mesh(new THREE.CylinderGeometry(1,1.1,.18,28),mud);island.scale.set(w,1,d);island.position.set(x,waterY-.19,z);root.add(island);}
 const reedMaterial=new THREE.MeshStandardMaterial({color:0xffffff,vertexColors:true,roughness:.95,side:THREE.DoubleSide});
 reedMaterial.onBeforeCompile=shader=>{
  shader.uniforms.marshTime=time;
  shader.vertexShader='uniform float marshTime;\n'+shader.vertexShader;
  shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
   vec3 reedOrigin=(instanceMatrix*vec4(0.,0.,0.,1.)).xyz;
   float gust=sin(reedOrigin.x*.38+reedOrigin.z*.16-marshTime*1.65);
   float sway=.15+.13*gust+.045*sin(marshTime*3.1-reedOrigin.x*.7);
   vec3 wind=vec3(sway,0.,sway*.16)*pow(max(position.y,0.),1.7);
   transformed+=vec3(dot(instanceMatrix[0].xyz,wind)/dot(instanceMatrix[0].xyz,instanceMatrix[0].xyz),dot(instanceMatrix[1].xyz,wind)/dot(instanceMatrix[1].xyz,instanceMatrix[1].xyz),dot(instanceMatrix[2].xyz,wind)/dot(instanceMatrix[2].xyz,instanceMatrix[2].xyz));`);
 };
 reedMaterial.customProgramCacheKey=()=> 'marsh-reed-sway-v2';
 const stem=new THREE.CylinderGeometry(.009,.018,1,5);stem.translate(0,.5,0);
 // Three crossed serrated plumes give each reed a visible seed panicle.
 const plumeShape=new THREE.Shape();
 const plumeEdge=[[-.012,.88],[-.035,.92],[-.022,.94],[-.065,.97],[-.038,.995],[-.072,1.02],[-.04,1.055],[-.055,1.08],[-.025,1.115],[-.035,1.15],[-.01,1.2],[0,1.25]];
 plumeShape.moveTo(...plumeEdge[0]);for(const point of plumeEdge.slice(1))plumeShape.lineTo(...point);for(const [x,y] of plumeEdge.slice(0,-1).reverse())plumeShape.lineTo(-x,y);plumeShape.closePath();
 const plumes=Array.from({length:3},(_,i)=>{const g=new THREE.ShapeGeometry(plumeShape);g.rotateY(i*Math.PI/3);return g;});
 const leafGeometries=[];
 for(let i=0;i<3;i++){
  const geometry=new THREE.PlaneGeometry(.045,.64,1,4),p=geometry.attributes.position;
  for(let j=0;j<p.count;j++){const t=(p.getY(j)+.32)/.64;p.setX(j,p.getX(j)*(1-t)+Math.sin(t*1.7)*.25*(i%2?1:-1));p.setY(j,.18+i*.18+t*.48);}
  geometry.rotateY(i*2.1);geometry.computeVertexNormals();leafGeometries.push(geometry);
 }
 const sourceParts=[stem,...plumes,...leafGeometries];
 for(const part of sourceParts){
  const colors=[],p=part.attributes.position,isPlume=plumes.includes(part);
  for(let i=0;i<p.count;i++){const brightness=isPlume?1.05:.5+.4*THREE.MathUtils.clamp(p.getY(i),0,1);colors.push(brightness,brightness*(isPlume?.94:1),brightness*(isPlume?.82:.95));}
  part.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
 }
 const templateParts=sourceParts.map(g=>g.index?g.toNonIndexed():g.clone()),reedGeometry=mergeGeometries(templateParts,false);templateParts.forEach(g=>g.dispose());sourceParts.forEach(g=>g.dispose());
 const reeds=new THREE.InstancedMesh(reedGeometry,reedMaterial,6400);reeds.name='金棕芦苇丛 · 风动';const matrix=new THREE.Object3D(),leanAxis=new THREE.Vector3(0,0,1),spinAxis=new THREE.Vector3(0,1,0),spin=new THREE.Quaternion();
 for(let i=0;i<reeds.count;i++){
  const patchIndex=i<5400?i%patches.length:1;
  const [x,z,w,d,height,tint]=patches[patchIndex],angle=random()*Math.PI*2,r=Math.sqrt(random());
  matrix.position.set(x+Math.cos(angle)*w*r,waterY-.04,z+Math.sin(angle)*d*r);
  matrix.quaternion.setFromAxisAngle(leanAxis,-.32-random()*.20).multiply(spin.setFromAxisAngle(spinAxis,random()*Math.PI*2));const across=THREE.MathUtils.clamp((matrix.position.x-(x-w))/(w*2),0,1);
  const heightProfile=patchIndex===0?THREE.MathUtils.lerp(1.55,.6,across):1;
  const h=(.55+random()*.85)*height*heightProfile;matrix.scale.set(.7+random()*.5,h,.7+random()*.5);matrix.updateMatrix();reeds.setMatrixAt(i,matrix.matrix);
  reeds.setColorAt(i,new THREE.Color(tint).multiplyScalar(.82+random()*.36));
 }
 root.userData.reeds={paniclePlanes:3,leanDirection:'+x',nearColor:'rust-red',leftFrontProfile:'high-left-low-right',leftRearExtended:true};
 root.userData.reedLayers=patches.map(([x,z,width,depth,height,tint])=>({x,z,width,depth,height,tint}));
 reeds.computeBoundingSphere();root.add(reeds);
 const sky=new THREE.Mesh(new THREE.SphereGeometry(130,28,16),new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,uniforms:{marshTime:time},
  vertexShader:'varying vec3 skyDirection;void main(){skyDirection=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:MARSH_NOISE_GLSL+`uniform float marshTime;varying vec3 skyDirection;
   void main(){vec3 d=normalize(skyDirection);float h=smoothstep(-.05,.7,d.y);
    vec3 color=mix(vec3(.29,.35,.23),vec3(.14,.22,.17),h);
    float sun=pow(max(0.,dot(d,normalize(vec3(-.52,.42,-.78)))),9.);
    float rightMass=smoothstep(-.35,.4,d.x),clearLeft=smoothstep(-.48,-.17,d.x);
    vec2 p=vec2(d.x*4.3+d.z*.65,d.y*5.7)+vec2(marshTime*.003,0.);
    float billow=marshFbm(p),detail=marshNoise(p*4.1);
    vec2 warp=vec2(marshFbm(p*.8+2.7),marshFbm(p*.8+8.1));
    float mass=marshFbm(p*1.7+warp*2.4);
    float trend=.045+.21*smoothstep(-.5,.65,d.x);
    float swelling=.036*sin(d.x*12.+.7)+.02*sin(d.x*27.-1.1)+.07*(marshFbm(vec2(d.x*7.,4.2))-.5);
    float top=trend+swelling;
    float cloudHeight=d.y+(marshNoise(p*2.6+warp)-.5)*.065;
    float bank=smoothstep(-.02,.018,d.y)*(1.-smoothstep(top-.04,top+.055,cloudHeight));
    float leftTip=smoothstep(-.6,-.3,d.x);
    float body=smoothstep(.27,.68,mass+rightMass*.11);
    float wisps=(1.-smoothstep(top+.025,top+.11,d.y))*smoothstep(.48,.7,marshFbm(p*3.1+warp*2.))*rightMass;
    float density=leftTip*max(bank*(.16+rightMass*.65)*(.25+.9*body),wisps*.24);
    density=clamp(density*1.22,0.,.94);
    // Far haze, main bank and a darker foreground shelf use different scales and drift.
    float farNoise=marshFbm(vec2(d.x*6.,d.y*11.)+vec2(marshTime*.0017,7.1));
    float farTop=.075+rightMass*.09+(farNoise-.5)*.055;
    float farMask=smoothstep(-.018,.015,d.y)*(1.-smoothstep(farTop-.025,farTop+.045,d.y));
    float farDensity=farMask*leftTip*(.17+rightMass*.27)*(.65+.45*farNoise);
    float nearNoise=marshFbm(vec2(d.x*3.6,d.y*7.2)+warp*.9+vec2(marshTime*.0051,14.));
    float nearTop=top+.055+rightMass*.06+(nearNoise-.5)*.095;
    float nearMask=smoothstep(.025,.095,d.y)*(1.-smoothstep(nearTop-.035,nearTop+.055,d.y+(marshNoise(p*1.8+11.)-.5)*.055));
    float nearDensity=nearMask*leftTip*pow(rightMass,1.35)*smoothstep(.30,.64,nearNoise)*.63;
    vec3 cloudColor=mix(vec3(.25,.27,.18),vec3(.09,.105,.075),rightMass)*(.84+.34*mass);
    color=mix(color,vec3(.26,.29,.205),farDensity);
    color=mix(color,cloudColor,density);
    color=mix(color,vec3(.075,.086,.061)*(.85+.35*nearNoise),nearDensity);
    float cover=1.-(1.-farDensity)*(1.-density)*(1.-nearDensity);
    color+=vec3(.32,.37,.12)*sun*(1.-cover*.9);
    gl_FragColor=vec4(color,1.);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
   }`}));sky.name='右密左疏乌云 · 左侧破云日光';root.add(sky);
 root.userData.weather={clouds:'natural-billowing-bank-thin-left-thick-right',sunOpening:'upper-left',cloudLayers:3,projectedCloudShadows:true};
 const ambient=new THREE.HemisphereLight(0xd4dcc1,0x293c35,1.5);root.add(ambient);
 const sun=new THREE.DirectionalLight(0xffdda1,2.4);sun.position.set(-12,18,-9);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-22,right:22,top:20,bottom:-20,near:1,far:80});sun.shadow.normalBias=.035;root.add(sun);
 const mirror=new Reflector(new THREE.PlaneGeometry(120,110),{color:0x566d60,textureWidth:1024,textureHeight:768,clipBias:.004});mirror.rotation.x=-Math.PI/2;mirror.position.set(0,waterY-.115,-20);mirror.name='水泽动态倒影';
 mirror.material.uniforms.marshTime=time;
 mirror.material.vertexShader=mirror.material.vertexShader.replace('varying vec4 vUv;','varying vec4 vUv;varying vec3 marshReflectionWorld;').replace('gl_Position = projectionMatrix', 'marshReflectionWorld=(modelMatrix*vec4(position,1.)).xyz;gl_Position = projectionMatrix');
 mirror.material.fragmentShader=MARSH_NOISE_GLSL+MARSH_CLOUD_SHADOW_GLSL+mirror.material.fragmentShader;
 mirror.material.fragmentShader=mirror.material.fragmentShader.replace('uniform vec3 color;','uniform vec3 color;uniform float marshTime;varying vec3 marshReflectionWorld;').replace('vec4 base = texture2DProj( tDiffuse, vUv );',`
  vec2 p=marshReflectionWorld.xz;vec4 sampleUv=vUv;
  vec2 drift=vec2(sin(p.x*.95+p.y*1.7-marshTime*1.5)+.45*sin(p.x*1.2+p.y*5.3-marshTime*1.8),cos(p.x*2.3-p.y*.65-marshTime*1.9));
  sampleUv.xy+=drift*vec2(.006,.012)*vUv.w;
  vec4 base=texture2DProj(tDiffuse,sampleUv);base.rgb*=1.-marshCloudShadow(p,marshTime)*.55;`);root.add(mirror);
 const pixels=new Uint8Array(128*128*4);
 for(let y=0;y<128;y++)for(let x=0;x<128;x++){const u=x/128*Math.PI*2,v=y/128*Math.PI*2,k=(y*128+x)*4;pixels[k]=128+24*Math.cos(u*7+v*3);pixels[k+1]=128+19*Math.sin(v*11-u*4);pixels[k+2]=250;pixels[k+3]=255;}
 const normal=new THREE.DataTexture(pixels,128,128);normal.wrapS=normal.wrapT=THREE.RepeatWrapping;normal.repeat.set(24,22);normal.needsUpdate=true;
 const surface=new THREE.Mesh(new THREE.PlaneGeometry(120,110,240,220),new THREE.MeshPhysicalMaterial({color:0x31574d,normalMap:normal,normalScale:new THREE.Vector2(.7,.55),roughness:.31,metalness:.2,transparent:true,opacity:.56,depthWrite:false,clearcoat:.8}));surface.rotation.x=-Math.PI/2;surface.position.set(0,waterY+.018,-20);surface.name='起伏水面 · 多尺度风浪';
 surface.material.onBeforeCompile=shader=>{
  shader.uniforms.marshTime=time;
  shader.vertexShader=`uniform float marshTime;varying vec2 marshWaterWorld;
   vec3 marshWave(vec2 p){
    float a=p.x*.95+p.y*1.7-marshTime*1.5,b=p.x*2.3-p.y*.65-marshTime*1.9,c=p.y*5.3+p.x*1.2-marshTime*1.8;
    return vec3(.052*sin(a)+.034*sin(b)+.016*sin(c),.0494*cos(a)+.0782*cos(b)+.0192*cos(c),.0884*cos(a)-.0221*cos(b)+.0848*cos(c));
   }\n`+shader.vertexShader;
  shader.vertexShader=shader.vertexShader.replace('#include <beginnormal_vertex>',`#include <beginnormal_vertex>
   vec2 wavePosition=(modelMatrix*vec4(position,1.)).xz;vec3 wave=marshWave(wavePosition);
   objectNormal=normalize(vec3(-wave.y,wave.z,1.));`);
  shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\ntransformed.z+=wave.x;');
  shader.vertexShader=shader.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\nmarshWaterWorld=(modelMatrix*vec4(transformed,1.)).xz;');
  shader.fragmentShader='uniform float marshTime;varying vec2 marshWaterWorld;\n'+MARSH_NOISE_GLSL+MARSH_CLOUD_SHADOW_GLSL+shader.fragmentShader;
  shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
   float waterBands=sin(marshWaterWorld.x*1.4+marshWaterWorld.y*8.3-marshTime*1.6)*.13+sin(marshWaterWorld.y*17.3+marshWaterWorld.x*2.4-marshTime*2.1)*.055;
   diffuseColor.rgb*=.91+waterBands;`);
  shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>','outgoingLight*=1.-marshCloudShadow(marshWaterWorld,marshTime)*.55;\n#include <opaque_fragment>');
 };
 surface.material.customProgramCacheKey=()=> 'marsh-water-waves-v3';root.add(surface);
 // Soft, camera-facing wisps: a low ring around the wheel, then large drifting banks behind.
 const mist=new THREE.Group();mist.name='水面漂浮低雾';root.add(mist);
 function fogBank(name,count,near,front=false){
  const geometry=new THREE.PlaneGeometry(1,1);
  const material=new THREE.ShaderMaterial({uniforms:{marshTime:time,mistStrength,opacity:{value:near?.145:front?.105:.075},mistTint:{value:new THREE.Color().setRGB(...(near?[.78,.79,.75]:[.255,.28,.265]))}},transparent:true,depthWrite:false,side:THREE.DoubleSide,
   vertexShader:`uniform float marshTime;varying vec2 cloudUv;varying vec3 cloudWorld;
    void main(){cloudUv=uv;vec4 centre=instanceMatrix*vec4(0.,0.,0.,1.);centre.x+=sin(marshTime*.12+centre.z*.3)*.28;
     cloudWorld=(modelMatrix*centre).xyz;vec4 mv=modelViewMatrix*centre;
     mv.xy+=position.xy*vec2(length(instanceMatrix[0].xyz),length(instanceMatrix[1].xyz));gl_Position=projectionMatrix*mv;}`,
   fragmentShader:`uniform float marshTime,mistStrength,opacity;uniform vec3 mistTint;varying vec2 cloudUv;varying vec3 cloudWorld;
    float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
    float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+1.),f.x),f.y);}
    void main(){vec2 p=cloudUv*2.-1.;p+=vec2(noise(cloudUv*4.+cloudWorld.xz*.17+marshTime*.025)-.5,noise(cloudUv*3.+cloudWorld.zx*.13-marshTime*.018)-.5)*.26;float edge=exp(-dot(p,p)*3.7)*(1.-smoothstep(.65,1.,abs(p.x)))*(1.-smoothstep(.65,1.,abs(p.y)));
     float cloud=.45+.55*noise(cloudUv*vec2(5.,2.)+cloudWorld.xz*.13+vec2(marshTime*.045,0.));
     gl_FragColor=vec4(mistTint,edge*cloud*opacity*mistStrength);
     #include <tonemapping_fragment>
     #include <colorspace_fragment>
    }`});
  const bank=new THREE.InstancedMesh(geometry,material,count);bank.name=name;bank.frustumCulled=false;const placement=new THREE.Object3D();
  for(let i=0;i<count;i++){
   if(near){const a=i/count*Math.PI*2,r=.65+random()*.9;placement.position.set(Math.cos(a)*r,waterY+.10+random()*.37,Math.sin(a)*(.35+random()*.55)+.2);placement.scale.set(.9+random()*2.1,.4+random()*.8,1);}
   else if(front){placement.position.set(-1.8+(random()-.5)*10,waterY+.2+random()*.35,-20-random()*3.2);placement.scale.set(3+random()*3.5,.65+random()*.65,1);}
   else{placement.position.set((random()-.5)*44,waterY+.5+random()*3.2,-13-random()*26);placement.scale.set(9+random()*9,2.5+random()*3.5,1);}
   placement.updateMatrix();bank.setMatrixAt(i,placement.matrix);
  }
  mist.add(bank);
 }
 fogBank('纺车周围贴水低雾',28,true);fogBank('拱顶遗址后的层叠雾幕',36,false);fogBank('建筑前的矮薄灰雾',14,false,true);
 // Broad, softly feathered horizon haze behind the building joins sea and sky.
 const horizonMist=new THREE.Group();horizonMist.name='横贯地平线的贴水雾带';mist.add(horizonMist);
 for(const [z,width,height,opacity] of [[-38,150,3.6,.26],[-59,230,5.2,.24],[-88,340,7.4,.22]]){
  const material=new THREE.ShaderMaterial({uniforms:{marshTime:time,mistStrength,opacity:{value:opacity}},transparent:true,depthWrite:false,side:THREE.DoubleSide,
   vertexShader:'varying vec2 horizonUv;varying vec3 horizonWorld;void main(){horizonUv=uv;horizonWorld=(modelMatrix*vec4(position,1.)).xyz;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
   fragmentShader:MARSH_NOISE_GLSL+`uniform float marshTime,mistStrength,opacity;varying vec2 horizonUv;varying vec3 horizonWorld;
    void main(){
     float drift=marshNoise(vec2(horizonWorld.x*.055+marshTime*.008,horizonWorld.z*.037));
     float centre=.46+.035*sin(horizonWorld.x*.075+marshTime*.025)+(drift-.5)*.055;
     float height=horizonUv.y-centre;
     float vertical=exp(-height*height*22.)*smoothstep(0.,.16,horizonUv.y)*(1.-smoothstep(.76,1.,horizonUv.y));
     float edge=smoothstep(0.,.1,horizonUv.x)*smoothstep(0.,.1,1.-horizonUv.x);
     float cloud=.68+.32*marshFbm(vec2(horizonWorld.x*.09-marshTime*.011,horizonUv.y*3.+horizonWorld.z*.06));
     vec3 color=mix(vec3(.285,.30,.285),vec3(.24,.265,.255),smoothstep(-20.,60.,horizonWorld.x));
     gl_FragColor=vec4(color,vertical*edge*cloud*opacity*mistStrength);
     #include <tonemapping_fragment>
     #include <colorspace_fragment>
    }`});
  const layer=new THREE.Mesh(new THREE.PlaneGeometry(width,height),material);layer.position.set(0,waterY+.65,z);layer.name='地平线柔化雾带';horizonMist.add(layer);
 }
 root.userData.weather.horizonMistLayers=3;root.userData.weather.fogColors={environment:'gray',wheel:'white'};

 // Slender dry leaves float on the foreground water, carried left to right.
 const leafShape=new THREE.Shape();leafShape.moveTo(-.5,0);leafShape.quadraticCurveTo(-.08,.13,.5,.015);leafShape.quadraticCurveTo(.06,-.045,-.5,0);
 const leaves=new THREE.InstancedMesh(new THREE.ShapeGeometry(leafShape,5),new THREE.MeshStandardMaterial({color:0x69503a,roughness:1,side:THREE.DoubleSide}),24);
 leaves.name='前景水面随风漂浮的细长枯叶';leaves.instanceMatrix.setUsage(THREE.DynamicDrawUsage);leaves.frustumCulled=false;root.add(leaves);
 const leafMotion=Array.from({length:24},()=>({x:random()*18,z:1+random()*8,speed:.07+random()*.09,phase:random()*Math.PI*2,size:.15+random()*.23}));
 const leafPose=new THREE.Object3D();
 const updateLeaves=t=>{for(let i=0;i<leafMotion.length;i++){
  const l=leafMotion[i],x=((l.x+t*l.speed)%18)-9,z=l.z+Math.sin(t*.3+l.phase)*.12;
  const a=x*.95+z*1.7-t*1.5,b=x*2.3-z*.65-t*1.9,c=z*5.3+x*1.2-t*1.8;
  const height=.052*Math.sin(a)+.034*Math.sin(b)+.016*Math.sin(c);
  const slopeX=.0494*Math.cos(a)+.0782*Math.cos(b)+.0192*Math.cos(c),slopeZ=.0884*Math.cos(a)-.0221*Math.cos(b)+.0848*Math.cos(c);
  leafPose.position.set(x,waterY+.036+height,z);
  leafPose.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),new THREE.Vector3(-slopeX,1,-slopeZ).normalize());
  leafPose.rotateZ(l.phase+Math.sin(t*.32+l.phase)*.18);
  leafPose.scale.set(l.size,l.size*.65,l.size);leafPose.updateMatrix();leaves.setMatrixAt(i,leafPose.matrix);
 }leaves.instanceMatrix.needsUpdate=true;};
 updateLeaves(0);
 root.userData.wind={direction:'+x',floatingLeaves:24};
 root.userData.setMistDensity=value=>{mistStrength.value=THREE.MathUtils.clamp((Number(value)||0)/16,0,6.25);};
 root.userData.setMist=visible=>{mist.visible=!!visible;};
 root.userData.update=t=>{time.value=t;normal.offset.set(-t*.006,-t*.0014);updateLeaves(t);};
 root.visible=false;return root;
}
