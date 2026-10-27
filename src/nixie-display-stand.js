import * as THREE from 'three';
import {createNixieTelevisions} from './nixie-televisions.js';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';

export function addNixieStand(consoleModel){
 const root=new THREE.Group();root.name='辉光钟与卡其丝绸矮架';root.add(consoleModel);consoleModel.position.y=.15;
 const wood=new THREE.MeshStandardMaterial({color:0x3e3528,roughness:.8});
 const frame=new THREE.Group();frame.name='35厘米展示矮架';root.add(frame);
 const top=new THREE.Mesh(new RoundedBoxGeometry(1.9,.035,.92,3,.012),wood);top.position.y=-.0675;frame.add(top);
 for(const x of [-.84,.84])for(const z of [-.35,.35]){
  const leg=new THREE.Mesh(new THREE.BoxGeometry(.055,.315,.055),wood);leg.position.set(x,-.2425,z);frame.add(leg);
 }
 const silk=new THREE.MeshPhysicalMaterial({color:0x9a8b66,roughness:.56,metalness:0,sheen:.85,sheenColor:0xc6b38a,sheenRoughness:.4,side:THREE.DoubleSide});
 const geometry=new THREE.PlaneGeometry(3.1,1.92,110,90),p=geometry.attributes.position;
 for(let i=0;i<p.count;i++){
  const u=p.getX(i),v=p.getY(i)+.1;
  const dx=Math.max(0,Math.abs(u)-.96),dz=Math.max(0,Math.abs(v)-.47),drop=Math.max(dx,dz),pool=Math.max(0,drop-.35);
  const fall=Math.min(drop/.35,1),poolRatio=drop>0?pool/drop:0;
  const x=THREE.MathUtils.clamp(u,-.96,.96)+(u<0?-1:1)*dx*poolRatio;
  const z=THREE.MathUtils.clamp(v,-.47,.47)+(v<0?-1:1)*dz*poolRatio;
  const folds=(Math.sin(u*35+v*5)*.019+Math.sin(v*37-u*6)*.014)*fall;
  // Fabric remains above the floor, flattening into small pooled folds at the hem.
  const y=drop<.35?-.044-drop+folds*.7:-.396+Math.abs(folds)*.8+.002*Math.sin(pool*12)**2;
  p.setXYZ(i,x+Math.sin(v*31)*.009*fall,y,z+Math.sin(u*29)*.009*fall);
 }
 geometry.computeVertexNormals();const cloth=new THREE.Mesh(geometry,silk);cloth.name='卡其色丝绸 · 垂落地面';cloth.castShadow=true;cloth.receiveShadow=true;root.add(cloth);
 const televisions=createNixieTelevisions();televisions.position.set(-1.2,0,.20);root.add(televisions);
 const update=consoleModel.userData.update,updateTelevisions=televisions.userData.update;delete consoleModel.userData.update;delete televisions.userData.update;root.userData.update=t=>{update(t);updateTelevisions(t);};
 root.userData.standHeight=.35;return root;
}
