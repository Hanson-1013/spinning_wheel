import * as THREE from 'three';

function stalk(parent,curve,r,material){const object=new THREE.Mesh(new THREE.TubeGeometry(curve,24,r,6,false),material);parent.add(object);return object;}
function curvedBlade(width,length,droop,seed=0){
 const geometry=new THREE.PlaneGeometry(1,1,10,24),p=geometry.attributes.position;
 for(let i=0;i<p.count;i++){
  const u=p.getX(i)*2,t=p.getY(i)+.5;
  const edge=Math.pow(Math.sin(Math.PI*t),.65);
  const tear=(seed%3===0&&Math.abs(t-.63)<.025&&u>.45)?.55:1;
  p.setXYZ(i,u*width*edge*tear,t*length,-droop*t*t+.05*Math.sin(t*17+seed)*u+.08*u*u*edge);
 }
 geometry.computeVertexNormals();return geometry;
}
export function addTallTropicalPlants(garden,random){
 const stemMaterial=new THREE.MeshStandardMaterial({color:0x405630,roughness:.85});
 const broadMaterials=[0x3b6336,0x4d7140,0x315330].map(color=>new THREE.MeshPhysicalMaterial({color,side:THREE.DoubleSide,roughness:.62,clearcoat:.07,clearcoatRoughness:.6}));
 const palmMaterial=new THREE.MeshStandardMaterial({color:0x41623a,side:THREE.DoubleSide,roughness:.75});
 for(const m of [...broadMaterials,palmMaterial])m.userData.foliage=true;
 const leafletGeometry=curvedBlade(.043,1,.2);
 function fitOutside(plant){
  plant.updateMatrixWorld(true);const bounds=new THREE.Box3().setFromObject(plant);
  if(bounds.max.z> -6.8)plant.position.z-=bounds.max.z+6.8;
  plant.updateMatrixWorld(true);plant.userData.frontBoundary=new THREE.Box3().setFromObject(plant).max.z;
  plant.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});garden.add(plant);
 }
 for(let plantIndex=0;plantIndex<9;plantIndex++){
  const plant=new THREE.Group();plant.name='窗外天堂鸟 · 长茎宽叶';plant.position.set(-8+plantIndex*2,-2.35,-9.1-random()*1.3);
  const height=5.5+random()*2.1;
  for(let i=0;i<14;i++){
   const a=i*2.4+random()*.4,reach=.25+random()*.6,h=height*(i<5?.2+random()*.25:.45+random()*.4);
   const base=new THREE.Vector3((random()-.5)*.16,0,(random()-.5)*.16),end=new THREE.Vector3(Math.cos(a)*reach,h,Math.sin(a)*reach);
   stalk(plant,new THREE.CubicBezierCurve3(base,new THREE.Vector3(0,h*.5,0),end.clone().add(new THREE.Vector3(0,-.55,0)),end),.01,stemMaterial);
   const length=1.3+random()*1.25,width=.34+random()*.2;
   const blade=new THREE.Mesh(curvedBlade(width,length,.18+random()*.28,i),broadMaterials[i%3]);blade.position.copy(end);
   const forward=new THREE.Vector3(Math.cos(a)*.5,.5+random()*.65,Math.sin(a)*.5).normalize();
   const side=new THREE.Vector3(-Math.sin(a),0,Math.cos(a));const normal=new THREE.Vector3().crossVectors(side,forward).normalize();
   blade.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(side,forward,normal));plant.add(blade);
   const midrib=[];for(let j=0;j<=16;j++){const t=j/16;midrib.push(new THREE.Vector3(0,t*length,-.25*t*t+.006));}
   const rib=stalk(plant,new THREE.CatmullRomCurve3(midrib),.006,stemMaterial);rib.position.copy(end);rib.quaternion.copy(blade.quaternion);
  }
  fitOutside(plant);
 }
 for(let plantIndex=0;plantIndex<8;plantIndex++){
  const plant=new THREE.Group();plant.name='窗外散尾葵 · 弯垂羽状叶';plant.position.set(-7.4+plantIndex*2.1,-2.35,-9.5-random());
  const height=4.6+random()*1.8;
  for(let cane=0;cane<3;cane++){
   const offset=new THREE.Vector3((random()-.5)*.4,0,(random()-.5)*.4),crown=offset.clone().add(new THREE.Vector3((random()-.5)*.35,height*(.75+cane*.1),0));
   stalk(plant,new THREE.CubicBezierCurve3(offset,offset.clone().add(new THREE.Vector3(0,height*.4,0)),crown.clone().add(new THREE.Vector3(0,-.5,0)),crown),.012,stemMaterial);
   for(let frond=0;frond<5;frond++){
    const a=(frond/5+cane*.17)*Math.PI*2+random()*.4,length=1.7+random()*.95,out=new THREE.Vector3(Math.cos(a),0,Math.sin(a)),side=new THREE.Vector3(-Math.sin(a),0,Math.cos(a));
    const curve=new THREE.CubicBezierCurve3(crown,crown.clone().add(new THREE.Vector3(0,.7,0)),crown.clone().addScaledVector(out,length*.65).add(new THREE.Vector3(0,.65,0)),crown.clone().addScaledVector(out,length).add(new THREE.Vector3(0,-.6,0)));
    stalk(plant,curve,.009,stemMaterial);
    for(let pair=1;pair<18;pair++)for(const sign of [-1,1]){
     const t=pair/19,start=curve.getPoint(t),leafLength=(.22+.7*Math.sin(t*Math.PI))*(.8+random()*.2);
     const direction=side.clone().multiplyScalar(sign).addScaledVector(out,.28).add(new THREE.Vector3(0,-.12-t*.4,0)).normalize();
     const blade=new THREE.Mesh(leafletGeometry,palmMaterial);blade.position.copy(start);blade.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),direction);blade.scale.set(1,leafLength,leafLength);plant.add(blade);
    }
   }
  }
  fitOutside(plant);
 }
}

export function createIndoorAreca(random=Math.random){
 const plant=new THREE.Group();plant.name='室内小型散尾葵 · 浓密羽状叶';
 const green=new THREE.MeshPhysicalMaterial({color:0x35582e,side:THREE.DoubleSide,roughness:.48,clearcoat:.2});
 green.userData.foliage=true;
 const stem=new THREE.MeshStandardMaterial({color:0x687343,roughness:.7});
 const blade=curvedBlade(.018,1,.17);
 for(let cane=0;cane<7;cane++){
  const angle=cane*2.4,h=.65+random()*.65,base=new THREE.Vector3(Math.cos(angle)*.12,.4,Math.sin(angle)*.12),top=base.clone().add(new THREE.Vector3(Math.cos(angle)*.12,h,Math.sin(angle)*.12));
  stalk(plant,new THREE.LineCurve3(base,top),.009,stem);
  for(let f=0;f<5;f++){
   const a=f*Math.PI*2/5+angle,out=new THREE.Vector3(Math.cos(a),0,Math.sin(a)),side=new THREE.Vector3(-Math.sin(a),0,Math.cos(a)),length=.55+random()*.45;
   const curve=new THREE.CubicBezierCurve3(top,top.clone().add(new THREE.Vector3(0,.35,0)),top.clone().addScaledVector(out,length*.8).add(new THREE.Vector3(0,.22,0)),top.clone().addScaledVector(out,length).add(new THREE.Vector3(0,-.3,0)));
   stalk(plant,curve,.004,stem);
   for(let j=1;j<16;j++)for(const sign of [-1,1]){
    const t=j/17,leaf=new THREE.Mesh(blade,green),len=.08+.27*Math.sin(t*Math.PI);
    leaf.position.copy(curve.getPoint(t));leaf.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),side.clone().multiplyScalar(sign).addScaledVector(out,.35).add(new THREE.Vector3(0,-.3,0)).normalize());leaf.scale.set(1,len,len);plant.add(leaf);
   }
  }
 }
 return plant;
}
