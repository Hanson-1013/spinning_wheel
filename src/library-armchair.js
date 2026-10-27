import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';

export function createLibraryArmchair(){
 const root=new THREE.Group();root.name='黑皮单人沙发 · 金属管框';
 const leather=new THREE.MeshPhysicalMaterial({color:0x171b19,roughness:.57,clearcoat:.12,clearcoatRoughness:.5,sheen:.12,sheenColor:0x4b504b});
 const seam=new THREE.MeshStandardMaterial({color:0x343933,roughness:.8}),chrome=new THREE.MeshStandardMaterial({color:0x8e9995,metalness:.94,roughness:.23}),rubber=new THREE.MeshStandardMaterial({color:0x181d1a,roughness:1});
 const data=new Uint8Array(128*128*4);for(let y=0;y<128;y++)for(let x=0;x<128;x++){const r=Math.sin(x*127.1+y*311.7)*43758.5453,v=175+Math.floor((r-Math.floor(r))*55);data.set([v,v,v,255],(y*128+x)*4);}
 const grain=new THREE.DataTexture(data,128,128);grain.wrapS=grain.wrapT=THREE.RepeatWrapping;grain.repeat.set(3,3);grain.needsUpdate=true;leather.bumpMap=grain;leather.bumpScale=.0011;
 function cushion(w,h,d,x,y,z,angle=0){
  const geometry=new RoundedBoxGeometry(w,h,d,5,Math.min(h*.27,.055)),p=geometry.attributes.position;
  for(let i=0;i<p.count;i++){const vx=p.getX(i),vy=p.getY(i),vz=p.getZ(i),edge=Math.max(Math.abs(vx)/(w/2),Math.abs(vz)/(d/2));const wrinkle=.0035*Math.sin(vx*52+vz*17)*Math.sin(vz*39-vx*11)*Math.pow(edge,3);p.setY(i,vy+wrinkle);}
  geometry.computeVertexNormals();const mesh=new THREE.Mesh(geometry,leather);mesh.position.set(x,y,z);mesh.rotation.x=angle;mesh.castShadow=true;mesh.receiveShadow=true;root.add(mesh);return mesh;
 }
 function pipe(points,r=.011,material=chrome,parent=root){const mesh=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)),false,'centripetal'),48,r,8,false),material);parent.add(mesh);return mesh;}
 function piping(parent,w,h,z){const r=.035,points=[];for(const [cx,cy,start]of [[w/2-r,h/2-r,0],[-w/2+r,h/2-r,Math.PI/2],[-w/2+r,-h/2+r,Math.PI],[w/2-r,-h/2+r,Math.PI*1.5]])for(let i=0;i<=8;i++){const a=start+i/8*Math.PI/2;points.push([cx+r*Math.cos(a),cy+r*Math.sin(a),z]);}points.push(points[0]);pipe(points,.0035,seam,parent);}
 cushion(.95,.13,.86,0,.215,0);
 const seat=cushion(.72,.19,.66,0,.365,.055);piping(seat,.67,.15,.335);
 const back=cushion(.73,.5,.17,0,.65,-.315,-.12);piping(back,.67,.44,.09);
 for(const side of [-1,1]){
  const arm=cushion(.16,.32,.83,side*.445,.515,-.015);piping(arm,.12,.27,.42);
  pipe([[side*.532,.025,.37],[side*.532,.49,.37],[side*.532,.56,.33],[side*.532,.56,-.36],[side*.532,.51,-.4],[side*.532,.025,-.4]]);
  pipe([[side*.532,.18,.36],[side*.532,.18,-.4]]);
  for(const z of [-.4,.37]){const foot=new THREE.Mesh(new THREE.CylinderGeometry(.014,.016,.015,12),rubber);foot.position.set(side*.532,.008,z);root.add(foot);}
 }
 pipe([[-.53,.2,-.4],[0,.2,-.4],[.53,.2,-.4]]);
 root.scale.setScalar(1.875);root.userData.size=[2.04375,1.6875,1.6875];return root;
}
