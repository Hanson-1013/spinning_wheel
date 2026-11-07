import * as THREE from 'three';
export function createLibraryCoatRack(){
 const root=new THREE.Group();root.name='复古落地衣架 · 三脚柱与弯曲挂钩';
 const wood=new THREE.MeshStandardMaterial({color:0x433126,roughness:.72}),brass=new THREE.MeshStandardMaterial({color:0xa58b58,metalness:.65,roughness:.4});
 function rod(points,r=.018,material=wood){const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));const m=new THREE.Mesh(new THREE.TubeGeometry(curve,32,r,8,false),material);m.castShadow=true;m.receiveShadow=true;root.add(m);}
 const post=new THREE.Mesh(new THREE.CylinderGeometry(.023,.035,2.18,20),wood);post.position.y=1.12;root.add(post);
 for(let i=0;i<3;i++){const a=i*Math.PI*2/3,c=Math.cos(a),s=Math.sin(a);rod([[0,.35,0],[c*.12,.16,s*.12],[c*.29,.035,s*.29]],.022);}
 for(let i=0;i<6;i++){const a=i*Math.PI/3,c=Math.cos(a),s=Math.sin(a),h=1.82+(i%2)*.22;rod([[0,h-.17,0],[c*.14,h-.12,s*.14],[c*.23,h+.02,s*.23],[c*.21,h+.15,s*.21]],.014);const tip=new THREE.Mesh(new THREE.SphereGeometry(.024,12,8),brass);tip.position.set(c*.21,h+.15,s*.21);root.add(tip);}
 for(const y of [.48,1.73,2.18]){const ring=new THREE.Mesh(new THREE.CylinderGeometry(.039,.039,.035,20),brass);ring.position.y=y;root.add(ring);}
 const finial=new THREE.Mesh(new THREE.SphereGeometry(.045,16,12),wood);finial.scale.y=1.5;finial.position.y=2.27;root.add(finial);
 const clothMaterial=new THREE.MeshPhysicalMaterial({color:0x79263e,roughness:.65,sheen:.65,sheenColor:0xb35468,sheenRoughness:.65,side:THREE.DoubleSide});
 // Two unequal tails meet at a narrow gathered saddle over the left-facing hook.
 for(let panel=0;panel<2;panel++){
  const geometry=new THREE.PlaneGeometry(1,1,48,72),positions=geometry.attributes.position;
  for(let i=0;i<positions.count;i++){
   const u=positions.getX(i)*2,t=.5-positions.getY(i),spread=THREE.MathUtils.smoothstep(t,0,.8),width=.025+.24*spread;
   const fold=(Math.sin(u*Math.PI*4.5+t*.6)*.023+Math.sin(u*Math.PI*8+t*1.4)*.006)*(.2+.8*spread);
   const x=-.225-(panel===0?.04:-.025)-t*.055+fold;
   const y=2.19-t*(panel===0?1.72:1.36)+Math.pow(t,10)*(.025*Math.sin(u*5)+.012*u);
   positions.setXYZ(i,x,y,u*width+.016*Math.sin(t*5)*spread);
  }
  geometry.computeVertexNormals();const cloth=new THREE.Mesh(geometry,clothMaterial);cloth.name='石榴色挂布 · 收束垂褶';cloth.castShadow=true;cloth.receiveShadow=true;root.add(cloth);
 }
 const saddleGeometry=new THREE.PlaneGeometry(.05,.13,8,16),saddlePositions=saddleGeometry.attributes.position;
 for(let i=0;i<saddlePositions.count;i++){const t=saddlePositions.getY(i)/.13+.5;saddlePositions.setXYZ(i,-.25+.043*t,2.19+.025*Math.sin(t*Math.PI),saddlePositions.getX(i));}
 saddleGeometry.computeVertexNormals();const saddle=new THREE.Mesh(saddleGeometry,clothMaterial);saddle.name='挂钩上布料折返';root.add(saddle);
 return root;
}
