import * as THREE from 'three';

export function addLibraryCeiling(root){
 const group=new THREE.Group();group.name='双眼皮吊顶 · 木色双层错台';root.add(group);
 const plaster=new THREE.MeshStandardMaterial({color:0x65503b,roughness:.96}),edge=new THREE.MeshStandardMaterial({color:0x806347,roughness:.92}),reveal=new THREE.MeshStandardMaterial({color:0x302a23,roughness:1});
 const pixels=new Uint8Array(128*256*4);
 for(let y=0;y<256;y++)for(let x=0;x<128;x++){const fiber=x+2*Math.sin(y*.022),v=Math.round(190+19*Math.sin(fiber*2.1)+7*Math.sin(fiber*6.2));pixels.set([v,v,v,255],(y*128+x)*4);}
 const woodgrain=new THREE.DataTexture(pixels,128,256);woodgrain.wrapS=woodgrain.wrapT=THREE.RepeatWrapping;woodgrain.repeat.set(.35,.35);woodgrain.needsUpdate=true;
 for(const m of [plaster,edge]){m.map=woodgrain;m.bumpMap=woodgrain;m.bumpScale=.001;m.roughness=.85;}
 const beige=new THREE.MeshStandardMaterial({color:0xc6bda5,roughness:.97});
 const run=(Math.hypot(3,3)-.5)/Math.SQRT2,sideX=6.5+run,cornerZ=-6.3+run;
 const polygon=[[-6.5,-6.3],[6.5,-6.3],[sideX,cornerZ],[sideX,9.5],[-sideX,9.5],[-sideX,cornerZ]];
 function inset(distance){
  return polygon.map((p,i)=>{
   const previous=polygon[(i+polygon.length-1)%polygon.length],next=polygon[(i+1)%polygon.length];
   const a=new THREE.Vector2(p[0]-previous[0],p[1]-previous[1]).normalize(),b=new THREE.Vector2(next[0]-p[0],next[1]-p[1]).normalize();
   const n1=new THREE.Vector2(-a.y,a.x),n2=new THREE.Vector2(-b.y,b.x),bisector=n1.clone().add(n2);bisector.multiplyScalar(distance/Math.max(.001,bisector.dot(n1)));return [p[0]+bisector.x,p[1]+bisector.y];
  });
 }
 function contour(path,points){path.moveTo(...points[0]);points.slice(1).forEach(p=>path.lineTo(...p));path.closePath();}
 function slab(outerInset,innerInset,y,depth,material,name){
  const shape=new THREE.Shape();contour(shape,inset(outerInset));if(innerInset!==null){const hole=new THREE.Path();contour(hole,inset(innerInset).reverse());shape.holes.push(hole);}
  const mesh=new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:false,curveSegments:1}),material);mesh.rotation.x=Math.PI/2;mesh.position.y=y;mesh.name=name;mesh.receiveShadow=true;mesh.castShadow=true;group.add(mesh);return mesh;
 }
 // The central panel covers the old exposed roof beams; two border steps sit below it.
 slab(.03,null,5.38,.06,beige,'中央平整顶面');
 slab(.03,.72,5.22,.38,plaster,'外围下吊宽边');
 slab(.03,.79,4.875,.045,edge,'第一道细边');
 slab(.8,.87,5.30,.035,reveal,'内凹阴影缝');
 slab(.87,1.02,5.27,.065,edge,'第二道错层细边');
 // Subtle reflected daylight prevents the matte underside becoming a black silhouette.
 const bounce=new THREE.HemisphereLight(0xe6dfc8,0x42483e,.35);group.add(bounce);
 group.userData.levels=2;group.userData.bottom=4.83;
 return group;
}
