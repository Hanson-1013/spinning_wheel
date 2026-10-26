import * as THREE from 'three';

// Meter-based scale: foliage blades are 0.01–0.05 m long, never oversized canopy leaves.
export function createHangingGarden(){
 const root=new THREE.Group();root.name='吊盆花园 · 1至5厘米小叶';
 let seed=420;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const potMaterial=new THREE.MeshStandardMaterial({color:0x57594c,roughness:.9}),soil=new THREE.MeshStandardMaterial({color:0x27291c,roughness:1}),rope=new THREE.MeshStandardMaterial({color:0x80775b,roughness:1});
 const twigMaterial=new THREE.MeshStandardMaterial({color:0x3a4c28,roughness:.9});
 const bladeMaterial=new THREE.MeshPhysicalMaterial({color:0xffffff,side:THREE.DoubleSide,roughness:.6,clearcoat:.15,clearcoatRoughness:.5});
 bladeMaterial.userData.foliage=true;
 const leafTransforms=Array.from({length:4},()=>[]),leafColors=leafTransforms.map(()=>[]),twigTransforms=[];
 const leafGeometries=Array.from({length:4},(_,variant)=>{
  const geometry=new THREE.PlaneGeometry(1,1,4,6),p=geometry.attributes.position;
  for(let i=0;i<p.count;i++){
   const x=p.getX(i)*2,t=p.getY(i)+.5;
   const width=Math.pow(Math.sin(Math.PI*t),[.65,.85,.58,.75][variant])*[.28,.14,.35,.22][variant];
   p.setXYZ(i,x*width,t,.07*Math.sin(Math.PI*t)+x*x*.12*Math.sin(Math.PI*t)-.1*t*t);
  }
  geometry.computeVertexNormals();return geometry;
 });
 const colorPalette=[0x35542c,0x446736,0x567844,0x68814c];
 function leaf(position,length,rotation,variant){
  const object=new THREE.Object3D();object.position.copy(position);object.rotation.set(...rotation);object.scale.setScalar(Math.max(.01,Math.min(.05,length)));object.updateMatrix();leafTransforms[variant].push(object.matrix.clone());
  leafColors[variant].push(new THREE.Color(colorPalette[Math.floor(random()*4)]));
 }
 function twig(a,b,r=.0012){const d=b.clone().sub(a),o=new THREE.Object3D();o.position.copy(a).add(b).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());o.scale.set(r,a.distanceTo(b),r);o.updateMatrix();twigTransforms.push(o.matrix.clone());}
 function mesh(g,m,x,y,z){const o=new THREE.Mesh(g,m);o.position.set(x,y,z);root.add(o);return o;}
 function box(w,h,d,x,y,z,m){return mesh(new THREE.BoxGeometry(w,h,d),m,x,y,z);}
 function hanger(a,b){const delta=b.clone().sub(a),o=mesh(new THREE.CylinderGeometry(.005,.005,delta.length(),8),rope,0,0,0);o.position.copy(a).add(b).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());}
 function foliage(cx,top,z,width,depth,trails){
  // Dense small-leaf crowns conceal the soil edge and branch origins.
  for(let i=0;i<Math.round(width*440);i++){
   const x=cx+(random()-.5)*width,y=top+.02+random()*.16,zz=z+(random()-.5)*depth;
   leaf(new THREE.Vector3(x,y,zz),.033+random()*.017,[random()*2,random()*6.28,random()*6.28],i%4);
  }
  for(let i=0;i<trails;i++){
   const x=cx+(random()-.5)*width,zz=z+(i%2?1:-1)*depth*.48,length=.5+random()*1.25;
   const nodes=Math.ceil(length/.026);let previous=new THREE.Vector3(x,top+.04,zz);
   for(let j=1;j<=nodes;j++){
    const t=j/nodes,point=new THREE.Vector3(x+Math.sin(t*5+i)*(.07+t*.08),top+.04-t*length,zz+Math.sin(t*3+i)*.1);
    twig(previous,point,.0012*(1-t*.6));
    for(const side of [-1,1]){
     const size=(.014+.035*Math.pow(1-t,.7))*(.92+random()*.08);
     leaf(point.clone().add(new THREE.Vector3(side*.005,0,.002)),size,[.4+random()*.6,i*.9+random()*.5,side*(1.15+random()*.5)],(i+j)%4);
     if(j%5===0&&t<.85){
      let branch=point;
      for(let k=1;k<=4;k++){
       const tip=point.clone().add(new THREE.Vector3(side*k*.015,-k*.012,Math.sin(i)*k*.006));twig(branch,tip,.0007);
       leaf(tip,size*(1-k*.1),[.4,i*.8,side*1.3],(j+k)%4);branch=tip;
      }
     }
    }
    previous=point;
   }
  }
 }
 for(const cx of [-5.55,-1.85,1.85,5.55]){
  const y=5,z=-3.7,w=3.3,d=.48,h=.26;
  const planter=new THREE.Group();planter.name='长条吊盆';root.add(planter);
  // Open rectangular planter with visible wall thickness and recessed soil.
  for(const side of [-1,1]){
   const front=box(w,h,.025,cx,y,z+side*d/2,potMaterial);planter.attach(front);
   const end=box(.025,h,d,cx+side*w/2,y,z,potMaterial);planter.attach(end);
   const lip=box(w,.025,.045,cx,y+h/2,z+side*d/2,potMaterial);planter.attach(lip);
  }
  planter.attach(box(w,.025,d,cx,y-h/2,z,potMaterial));planter.attach(box(w-.045,.015,d-.045,cx,y+h/2-.035,z,soil));
  for(const side of [-1,1])for(const edge of [-1,1])hanger(new THREE.Vector3(cx+side*1.3,y+.12,z+edge*.16),new THREE.Vector3(cx+side*1.3,5.66,z+edge*.16));
  foliage(cx,y+h/2,z,w+.08,d+.08,22);
 }
 for(const side of [-1,1]){
  const x=side*6.4,y=side===1?2.9:4.55,z=-.8;
  const profile=[[.09,-.18],[.19,-.1],[.25,.08],[.25,.12],[.225,.12],[.225,.08],[.17,-.08]].map(([r,h])=>new THREE.Vector2(r,h));
  const pot=mesh(new THREE.LatheGeometry(profile,32),potMaterial,x,y,z);pot.name='圆形小叶吊盆';
  const soilDisk=mesh(new THREE.CircleGeometry(.22,32),soil,x,y+.075,z);soilDisk.rotation.x=-Math.PI/2;
  for(let i=0;i<3;i++){const a=i/3*Math.PI*2;hanger(new THREE.Vector3(x+Math.cos(a)*.24,y+.1,z+Math.sin(a)*.24),new THREE.Vector3(x,5.6,z));}
  foliage(x,y+.1,z,.48,.48,14);
 }
 for(let variant=0;variant<4;variant++){
  const transforms=leafTransforms[variant],leaves=new THREE.InstancedMesh(leafGeometries[variant],bladeMaterial,transforms.length);leaves.name='吊盆小叶 · '+variant;
  transforms.forEach((matrix,i)=>{leaves.setMatrixAt(i,matrix);leaves.setColorAt(i,leafColors[variant][i]);});root.add(leaves);
 }
 const twigs=new THREE.InstancedMesh(new THREE.CylinderGeometry(1,1,1,4),twigMaterial,twigTransforms.length);twigTransforms.forEach((m,i)=>twigs.setMatrixAt(i,m));root.add(twigs);
 root.userData.leafLengthRange=[.01,.05];return root;
}
