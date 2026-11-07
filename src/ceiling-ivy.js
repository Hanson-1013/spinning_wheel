import * as THREE from 'three';

// Ivy attaches directly to the ceiling edge, without planters or suspended troughs.
export function createCeilingIvy(contour){
 const root=new THREE.Group();root.name='天花交界常春藤 · 层叠叶冠与错落垂藤';let seed=873;
 const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const stem=new THREE.MeshStandardMaterial({color:0x465032,roughness:.92});
 const leafMaterial=new THREE.MeshPhysicalMaterial({color:0x294833,roughness:.76,side:THREE.DoubleSide,clearcoat:.08});leafMaterial.userData.foliage=false;
 const shape=new THREE.Shape();shape.moveTo(0,-.5);shape.bezierCurveTo(-.17,-.21,-.48,-.13,-.48,.08);shape.lineTo(-.29,.09);shape.lineTo(-.34,.35);shape.lineTo(-.11,.23);shape.lineTo(0,.55);shape.lineTo(.13,.24);shape.lineTo(.36,.35);shape.lineTo(.3,.08);shape.lineTo(.49,.09);shape.bezierCurveTo(.46,-.16,.15,-.29,0,-.5);
 const geometry=new THREE.ShapeGeometry(shape,5),positions=geometry.attributes.position;
 for(let i=0;i<positions.count;i++){const x=positions.getX(i),y=positions.getY(i);positions.setZ(i,.08*(1-Math.abs(x)*2)*Math.sin((y+.5)*Math.PI));}geometry.computeVertexNormals();
 const transforms=[],colors=[],dummy=new THREE.Object3D();
 function leaf(position,normal,size,angle){dummy.position.copy(position);dummy.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),normal);dummy.rotateZ(angle);dummy.rotateY((random()-.5)*.85);dummy.scale.set(size*(.8+random()*.3),size, size);dummy.updateMatrix();transforms.push(dummy.matrix.clone());colors.push(new THREE.Color().setHSL(.27+random()*.10,.34+random()*.19,.24+random()*.16));}
 function vine(points,normal,spacing=.12){
  const curve=new THREE.CatmullRomCurve3(points),mesh=new THREE.Mesh(new THREE.TubeGeometry(curve,Math.max(16,points.length*8),.004,5,false),stem);root.add(mesh);
  const count=Math.max(2,Math.ceil(curve.getLength()/spacing));
  for(let i=0;i<count;i++){
   const t=(i+.35)/count,anchor=curve.getPoint(t),sign=i%2?1:-1;
   const lateral=new THREE.Vector3().crossVectors(curve.getTangent(t),normal).normalize().multiplyScalar(sign*(.07+random()*.055));
   const pos=anchor.clone().add(lateral).addScaledVector(normal,.012);
   const petiole=new THREE.Mesh(new THREE.CylinderGeometry(.0016,.0018,lateral.length(),4),stem);petiole.position.copy(anchor).lerp(pos,.5);petiole.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),lateral.clone().normalize());root.add(petiole);
   leaf(pos,normal,.16+random()*.18,sign*(.5+random()*.7));
  }
 }
 // Branch clusters spread over the ceiling surface, not stacked on a narrow hanging strip.
 const down=new THREE.Vector3(0,-1,0);
 for(let edge=0;edge<contour.length;edge++){
  const start=contour[edge],end=contour[(edge+1)%contour.length];if(edge===3)continue;
  const a=new THREE.Vector3(start[0],5.76,start[1]),b=new THREE.Vector3(end[0],5.76,end[1]),tangent=b.clone().sub(a).normalize(),inward=new THREE.Vector3(-tangent.z,0,tangent.x),length=a.distanceTo(b);
  const point=(distance,reach,y)=>a.clone().addScaledVector(tangent,Math.max(.1,Math.min(length-.1,distance))).addScaledVector(inward,reach).setY(y);
  const spine=[];for(let d=.1;d<length;d+=.35)spine.push(point(d,.05+.035*Math.sin(d*2),5.73));spine.push(point(length-.1,.05,5.73));vine(spine,inward,.24);
  // Staggered foliage layers spread over the side face, leaving visible depth between vines.
  for(let layer=0;layer<3;layer++){
   const points=[];for(let d=.1;d<length;d+=.28)points.push(point(d,.055+layer*.09,5.68-layer*.16+.055*Math.sin(d*2.3+layer)));
   points.push(point(length-.1,.055+layer*.09,5.68-layer*.16));vine(points,inward,.12);
  }
  // Long and short strands form an uneven lower silhouette rather than a straight curtain.
  for(let d=.25;d<length-.1;d+=.43+random()*.42){
   const drop=.4+Math.pow(random(),1.4)*1.15,drift=(random()-.5)*.52,depth=.08+random()*.22,points=[];
   for(let j=0;j<=10;j++){const t=j/10;points.push(point(d+drift*t+.055*Math.sin(t*7),depth+.06*Math.sin(t*4),5.64-drop*t));}
   vine(points,inward,.115);
   if(drop>.85){const base=points[4];vine([base,base.clone().addScaledVector(tangent,.17).add(new THREE.Vector3(0,-.16,0)),base.clone().addScaledVector(tangent,.29).add(new THREE.Vector3(0,-.4,0))],inward,.13);}
  }
  for(let d=.45;d<length-.15;d+=.8+random()*.4){
   // Five independent fan branches cover a broad patch of the ceiling.
   for(let branch=0;branch<7;branch++){
    const sign=branch%2?1:-1,along=sign*(.45+random()*1.05),reach=.5+random()*1.65;
    const points=[point(d,.045,5.74),point(d+along*.3,reach*.3,5.77),point(d+along*.7,reach*.72,5.775),point(d+along,reach,5.77)];vine(points,down,.15);
    if(branch<2){const forkStart=points[2];vine([forkStart,point(d+along*.9,reach*.6+.25,5.77),point(d+along+sign*.35,reach*.6+.42,5.77)],down,.17);}
   }
   // A few long diagonal shoots lie against the side face, with short relaxed tips.
   for(const sign of [-1,1])vine([point(d,.05,5.73),point(d+sign*.35,.055,5.58),point(d+sign*.75,.065,5.37),point(d+sign*1.05,.095,5.22)],inward,.17);
  }
 }
 const leaves=new THREE.InstancedMesh(geometry,leafMaterial,transforms.length);leaves.name='常春藤三裂叶';transforms.forEach((m,i)=>{leaves.setMatrixAt(i,m);leaves.setColorAt(i,colors[i]);});leaves.receiveShadow=true;leaves.castShadow=true;root.add(leaves);
 return root;
}
