import * as THREE from 'three';
import {Reflector} from 'three/addons/objects/Reflector.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';

// Reference-inspired flooded ruin: real arches and instanced reeds, no photo backdrop.
export function createMarshRuins(){
 const root=new THREE.Group();root.name='雾中遗迹 · 芦苇水泽';
 let seed=1977;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const waterY=-2.035,time={value:0},mistStrength={value:1};
 const stone=Array.from({length:6},(_,i)=>new THREE.MeshStandardMaterial({color:new THREE.Color().setHSL(.115,.13,.29+i*.028),roughness:.98}));
 const masonry=[];
 function block(w,h,d,x,y,z,rotation=0){
  const geometry=new THREE.BoxGeometry(w,h,d,2,2,1),p=geometry.attributes.position;
  for(let i=0;i<p.count;i++){const v=new THREE.Vector3().fromBufferAttribute(p,i);v.x+=(random()-.5)*.035;v.y+=(random()-.5)*.035;p.setXYZ(i,v.x,v.y,v.z);}
  geometry.computeVertexNormals();const mesh=new THREE.Mesh(geometry,stone[Math.floor(random()*stone.length)]);mesh.position.set(x,y,z);mesh.rotation.y=rotation;root.add(mesh);masonry.push(mesh);return mesh;
 }
 function column(x,z,height=3.25){
  const base=waterY-.02;
  block(.77,.2,.78,x,base+.1,z);block(.6,.13,.61,x,base+.26,z);
  const shaft=new THREE.CylinderGeometry(.22,.28,height-.48,24,6),p=shaft.attributes.position;
  for(let i=0;i<p.count;i++){const angle=Math.atan2(p.getZ(i),p.getX(i)),flute=1-.045*(1+Math.cos(angle*12));p.setX(i,p.getX(i)*flute);p.setZ(i,p.getZ(i)*flute);}
  shaft.computeVertexNormals();const mesh=new THREE.Mesh(shaft,stone[2]);mesh.position.set(x,base+.34+(height-.48)/2,z);root.add(mesh);masonry.push(mesh);
  block(.62,.18,.64,x,base+height-.1,z);block(.79,.13,.77,x,base+height+.055,z);
 }
 function arch(cx,z,width=1.9,spring=1.18,broken=false){
  const inner=width/2,outer=inner+.3,count=15;
  for(let i=0;i<count;i++){
   if(broken&&(i<3||i===10))continue;
   const a=i/count*Math.PI+.012,b=(i+1)/count*Math.PI-.012;
   const shape=new THREE.Shape();shape.absarc(0,0,outer,a,b,false);shape.lineTo(Math.cos(b)*inner,Math.sin(b)*inner);shape.absarc(0,0,inner,b,a,true);shape.closePath();
   const mesh=new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth:.58,steps:1,bevelEnabled:true,bevelSize:.024,bevelThickness:.018,bevelSegments:1,curveSegments:5}),stone[i%6]);mesh.position.set(cx,spring,z-.29);mesh.rotation.z=broken&&i===4?.06:0;root.add(mesh);masonry.push(mesh);
  }
 }
 // Receding arcade rows and broken parapets, left of the foreground wheel.
 for(const z of [-19,-22.3]){
  for(let i=0;i<5;i++)column(-8.6+i*2.18,z,3.25);
  for(let i=0;i<4;i++)arch(-7.51+i*2.18,z,1.62,1.19,z<-20&&i===3);
  for(let i=0;i<12;i++)block(.74,.24,.85,-8.4+i*.73,2.36,z);
 }
 const crest=new THREE.Shape();crest.moveTo(-8.7,2.45);for(const [x,y] of [[-8.7,2.9],[-8.2,2.8],[-8.15,3.35],[-7.55,3.2],[-7.3,4.3],[-7.05,4.95],[-6.8,4.7],[-6.72,3.8],[-6.2,3.55],[-5.7,3.2],[-5.2,3.25],[-5.12,4.0],[-4.8,4.08],[-4.7,3.55],[-4.05,3.5],[-3.7,3.0],[-2.7,2.9],[-2.3,2.45]])crest.lineTo(x,y);crest.closePath();
 const brokenWall=new THREE.Mesh(new THREE.ExtrudeGeometry(crest,{depth:.55,bevelEnabled:true,bevelSize:.035,bevelThickness:.02,bevelSegments:1,steps:1}),stone[3]);brokenWall.position.z=-19.25;root.add(brokenWall);masonry.push(brokenWall);
 for(let i=0;i<9;i++)block(.38,.19,.66,-7.6+i*.4,2.76+(i%3)*.12,-19.02);
 // Short detached ruin and irregular fallen stones around the arcade.
 column(2.4,-23.6,2.4);arch(3.35,-23.6,1.5,.35,true);column(4.3,-23.6,1.35);
 for(let i=0;i<70;i++){
  const x=-11+random()*17,z=-17-random()*9;
  const mesh=block(.18+random()*.65,.15+random()*.5,.23+random()*.55,x,waterY+.03+random()*.08,z,random()*Math.PI);mesh.rotation.z=(random()-.5)*.3;
 }
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
 const patches=[[-8,-8,3.8,2],[-11,-16,5,2.4],[7,-10,4.1,2.3],[12,-17,5.2,2.8],[-15,-23,5,2.1],[16,-26,7,2.5]];
 for(const [x,z,w,d] of patches){const island=new THREE.Mesh(new THREE.CylinderGeometry(1,1.1,.18,28),mud);island.scale.set(w,1,d);island.position.set(x,waterY-.1,z);root.add(island);}
 const reedMaterial=new THREE.MeshStandardMaterial({color:0xb08a54,roughness:.95,side:THREE.DoubleSide});
 reedMaterial.onBeforeCompile=shader=>{
  shader.uniforms.marshTime=time;
  shader.vertexShader='uniform float marshTime;\n'+shader.vertexShader;
  shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
   vec3 reedOrigin=(instanceMatrix*vec4(0.,0.,0.,1.)).xyz;
   float sway=sin(marshTime*.7+reedOrigin.x*.37+reedOrigin.z*.28)*.09;
   transformed.x+=sway*pow(max(position.y,0.),1.7);
   transformed.z+=sway*.38*position.y;`);
 };
 reedMaterial.customProgramCacheKey=()=> 'marsh-reed-sway-v1';
 const stem=new THREE.CylinderGeometry(.009,.018,1,5);stem.translate(0,.5,0);
 const head=new THREE.CylinderGeometry(.018,.03,.3,5);head.translate(.035,1.03,0);
 const leafGeometries=[];
 for(let i=0;i<3;i++){
  const geometry=new THREE.PlaneGeometry(.045,.64,1,4),p=geometry.attributes.position;
  for(let j=0;j<p.count;j++){const t=(p.getY(j)+.32)/.64;p.setX(j,p.getX(j)*(1-t)+Math.sin(t*1.7)*.25*(i%2?1:-1));p.setY(j,.18+i*.18+t*.48);}
  geometry.rotateY(i*2.1);geometry.computeVertexNormals();leafGeometries.push(geometry);
 }
 const templateParts=[stem,head,...leafGeometries].map(g=>g.toNonIndexed()),reedGeometry=mergeGeometries(templateParts,false);templateParts.forEach(g=>g.dispose());[stem,head,...leafGeometries].forEach(g=>g.dispose());
 const reeds=new THREE.InstancedMesh(reedGeometry,reedMaterial,5400);reeds.name='金棕芦苇丛 · 风动';const matrix=new THREE.Object3D();
 for(let i=0;i<reeds.count;i++){
  const [x,z,w,d]=patches[i%patches.length],angle=random()*Math.PI*2,r=Math.sqrt(random());
  matrix.position.set(x+Math.cos(angle)*w*r,waterY-.04,z+Math.sin(angle)*d*r);
  matrix.rotation.set((random()-.5)*.14,random()*Math.PI*2,-.2-random()*.15);const h=.55+random()*.85;matrix.scale.setScalar(h);matrix.updateMatrix();reeds.setMatrixAt(i,matrix.matrix);
  reeds.setColorAt(i,new THREE.Color().setHSL(.085+random()*.035,.23+random()*.15,.42+random()*.2));
 }
 reeds.computeBoundingSphere();root.add(reeds);
 const sky=new THREE.Mesh(new THREE.SphereGeometry(130,28,16),new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,vertexShader:'varying vec3 skyDirection;void main(){skyDirection=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`varying vec3 skyDirection;void main(){vec3 d=normalize(skyDirection);float h=smoothstep(-.05,.7,d.y);vec3 c=mix(vec3(.46,.51,.39),vec3(.24,.32,.29),h);float glow=pow(max(0.,dot(d,normalize(vec3(-.6,.45,-.7)))),12.);c+=vec3(.25,.24,.12)*glow;gl_FragColor=vec4(c,1.);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
 }`}));sky.name='青灰薄云天光';root.add(sky);
 const ambient=new THREE.HemisphereLight(0xd4dcc1,0x293c35,1.5);root.add(ambient);
 const sun=new THREE.DirectionalLight(0xffdda1,2.4);sun.position.set(-12,18,-9);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-22,right:22,top:20,bottom:-20,near:1,far:80});sun.shadow.normalBias=.035;root.add(sun);
 const mirror=new Reflector(new THREE.PlaneGeometry(120,110),{color:0x566d60,textureWidth:1024,textureHeight:768,clipBias:.004});mirror.rotation.x=-Math.PI/2;mirror.position.set(0,waterY,-20);mirror.name='水泽动态倒影';
 mirror.material.uniforms.marshTime=time;
 mirror.material.fragmentShader=mirror.material.fragmentShader.replace('uniform vec3 color;','uniform vec3 color;uniform float marshTime;').replace('vec4 base = texture2DProj( tDiffuse, vUv );',`vec4 sampleUv=vUv;sampleUv.xy+=vec2(sin(vUv.y*140.+marshTime*.8),cos(vUv.x*175.-marshTime*.6))*.0012*vUv.w;vec4 base=texture2DProj(tDiffuse,sampleUv);`);root.add(mirror);
 const pixels=new Uint8Array(128*128*4);
 for(let y=0;y<128;y++)for(let x=0;x<128;x++){const u=x/128*Math.PI*2,v=y/128*Math.PI*2,k=(y*128+x)*4;pixels[k]=128+24*Math.cos(u*7+v*3);pixels[k+1]=128+19*Math.sin(v*11-u*4);pixels[k+2]=250;pixels[k+3]=255;}
 const normal=new THREE.DataTexture(pixels,128,128);normal.wrapS=normal.wrapT=THREE.RepeatWrapping;normal.repeat.set(24,22);normal.needsUpdate=true;
 const surface=new THREE.Mesh(new THREE.PlaneGeometry(120,110),new THREE.MeshPhysicalMaterial({color:0x31574d,normalMap:normal,normalScale:new THREE.Vector2(.45,.35),roughness:.24,metalness:.25,transparent:true,opacity:.44,depthWrite:false,clearcoat:.8}));surface.rotation.x=-Math.PI/2;surface.position.copy(mirror.position);surface.position.y+=.012;
 surface.material.onBeforeCompile=shader=>{
  shader.uniforms.marshTime=time;
  shader.vertexShader='varying vec2 marshWaterWorld;\n'+shader.vertexShader;
  shader.vertexShader=shader.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\nmarshWaterWorld=(modelMatrix*vec4(transformed,1.)).xz;');
  shader.fragmentShader='uniform float marshTime;varying vec2 marshWaterWorld;\n'+shader.fragmentShader;
  shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
   float waterBands=sin(marshWaterWorld.x*5.1+marshWaterWorld.y*8.3+marshTime*.8)*.06+sin(marshWaterWorld.y*17.3-marshWaterWorld.x*2.4-marshTime*.6)*.035;
   diffuseColor.rgb*=.94+waterBands;`);
 };
 surface.material.customProgramCacheKey=()=> 'marsh-water-bands-v1';root.add(surface);
 const positions=new Float32Array(140*3);for(let i=0;i<140;i++){positions[i*3]=(random()-.5)*30;positions[i*3+1]=waterY+.12+random()*.48;positions[i*3+2]=-random()*27;}
 const mistGeometry=new THREE.BufferGeometry();mistGeometry.setAttribute('position',new THREE.BufferAttribute(positions,3));
 const mist=new THREE.Points(mistGeometry,new THREE.ShaderMaterial({uniforms:{marshTime:time,mistStrength},transparent:true,depthWrite:false,vertexShader:`uniform float marshTime;void main(){vec3 p=position;p.x+=sin(marshTime*.08+p.z)*.35;vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;gl_PointSize=min(180.,850./max(1.,-mv.z));}`,fragmentShader:`uniform float mistStrength;void main(){float d=length(gl_PointCoord-.5)*2.;float a=exp(-d*d*4.)*(1.-smoothstep(.6,1.,d))*.045*mistStrength;gl_FragColor=vec4(.64,.68,.53,a);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
 }`}));mist.name='水面漂浮低雾';mist.frustumCulled=false;root.add(mist);
 root.userData.setMistDensity=value=>{mistStrength.value=THREE.MathUtils.clamp((Number(value)||0)/16,0,6.25);};
 root.userData.setMist=visible=>{mist.visible=!!visible;};
 root.userData.update=t=>{time.value=t;normal.offset.set(t*.002,-t*.0014);};
 root.visible=false;return root;
}
