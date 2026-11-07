import {createCeilingIvy} from './ceiling-ivy.js';
import * as THREE from 'three';
import {LIBRARY_CEILING_BOTTOM} from './library-window-layout.js';

export function addLibraryCeiling(root){
 const group=new THREE.Group();group.name='灰泥吊顶 · 深色光面下包边';group.position.y=-.3;root.add(group);
 const edge=new THREE.MeshPhysicalMaterial({color:0x4b514b,roughness:.12,metalness:.3,clearcoat:1,clearcoatRoughness:.08});
 const beige=new THREE.MeshStandardMaterial({color:0xc6bda5,roughness:.96});
 // Fine plaster grain and broad mottling, shared by the ceiling and upper fascia.
 const pixels=new Uint8Array(256*256*4);let seed=41;
 for(let y=0;y<256;y++)for(let x=0;x<256;x++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const grain=seed/4294967296-.5,mottle=Math.sin(x*.053+Math.sin(y*.037))*Math.sin(y*.041+x*.012),v=Math.round(239+grain*15+mottle*7);pixels.set([v,v,v,255],(y*256+x)*4);}
 const plasterTexture=new THREE.DataTexture(pixels,256,256);plasterTexture.wrapS=plasterTexture.wrapT=THREE.RepeatWrapping;plasterTexture.repeat.set(1.2,1.2);plasterTexture.needsUpdate=true;
 beige.map=plasterTexture;beige.bumpMap=plasterTexture;beige.bumpScale=.004;
 // Preserve the original ceiling lighting; shade fascia using the same upward-facing
 // surface normal so it follows the ceiling's light response rather than its side angle.
 const fascia=beige.clone();
 fascia.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
 normal=normalize((viewMatrix*vec4(0.,-1.,0.,0.)).xyz);`);};
 fascia.customProgramCacheKey=()=> 'ceiling-fascia-match-original-v1';
 const plaster=beige;
 const run=(Math.hypot(3,3)-1.2)/Math.SQRT2,sideX=7+run,cornerZ=-6.3+run;
 const polygon=[[-7,-6.3],[7,-6.3],[sideX,cornerZ],[sideX,9.5],[-sideX,9.5],[-sideX,cornerZ]];
 function inset(distance){
  return polygon.map((p,i)=>{
   const previous=polygon[(i+polygon.length-1)%polygon.length],next=polygon[(i+1)%polygon.length];
   const a=new THREE.Vector2(p[0]-previous[0],p[1]-previous[1]).normalize(),b=new THREE.Vector2(next[0]-p[0],next[1]-p[1]).normalize();
   const n1=new THREE.Vector2(-a.y,a.x),n2=new THREE.Vector2(-b.y,b.x),bisector=n1.clone().add(n2);bisector.multiplyScalar(distance/Math.max(.001,bisector.dot(n1)));return [p[0]+bisector.x,distance<0?Math.min(9.5,p[1]+bisector.y):p[1]+bisector.y];
  });
 }
 function contour(path,points){path.moveTo(...points[0]);points.slice(1).forEach(p=>path.lineTo(...p));path.closePath();}
 function slab(outerInset,innerInset,y,depth,material,name){
  const shape=new THREE.Shape();contour(shape,inset(outerInset));if(innerInset!==null){const hole=new THREE.Path();contour(hole,inset(innerInset).reverse());shape.holes.push(hole);}
  const mesh=new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:false,curveSegments:1}),material);mesh.rotation.x=Math.PI/2;mesh.position.y=y;mesh.name=name;mesh.receiveShadow=true;mesh.castShadow=true;group.add(mesh);return mesh;
 }
 // One uninterrupted plaster fascia and one glossy lower band, without intermediate steps.
 slab(-.97,null,5.88,.06,beige,'统一米色灰泥天花');
 slab(-.97,1.82,5.82,.69,fascia,'吊顶上部 · 连续同色灰泥');
 slab(-.97,1.82,5.13,.30,edge,'吊顶下部 · 30厘米亮深灰光面包边');
 group.add(createCeilingIvy(inset(1.82)));
 // Subtle reflected daylight prevents the matte underside becoming a black silhouette.
 const bounce=new THREE.HemisphereLight(0xe6dfc8,0x42483e,.35);group.add(bounce);
 group.userData.levels=1;group.userData.bottom=LIBRARY_CEILING_BOTTOM;
 return group;
}
