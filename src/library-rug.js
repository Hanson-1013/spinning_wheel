import * as THREE from 'three';

export function createLibraryRug(){
 const root=new THREE.Group();root.name='深酒红地毯 · 连续不规则金色分割线';root.position.set(2.1,-2.365,-2.35);root.scale.z=5.7/3.3;
 const fabric=new THREE.MeshPhysicalMaterial({color:0x35101e,roughness:1,metalness:0,sheen:.18,sheenColor:0x582035,sheenRoughness:1});
 const gold=new THREE.MeshStandardMaterial({color:0xb5a083,roughness:.94,metalness:.02});
 const rug=new THREE.Mesh(new THREE.BoxGeometry(6,.026,3.3),fabric);root.add(rug);
 function straight(points,radius=.004){for(let i=1;i<points.length;i++){const a=new THREE.Vector3(points[i-1][0],.017,points[i-1][1]),b=new THREE.Vector3(points[i][0],.017,points[i][1]),d=b.clone().sub(a);const mesh=new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,d.length(),5),gold);mesh.position.copy(a).add(b).multiplyScalar(.5);mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());root.add(mesh);}}
 for(const inset of [.085,.14]){const x=3-inset,z=1.65-inset;straight([[-x,-z],[x,-z],[x,z],[-x,z],[-x,-z]],inset===.085?.007:.003);}
 // Hand-sketch topology: sweeping diagonal bands, connected branch points and clipped border ends.
 // Normalized coordinates follow the supplied top-down drawing, not a repeated tile pattern.
 const junction=[.565,.485],leftJoin=[.105,.37],lowerLeft=[.21,.71];
 const paths=[
  [[0,.37],[.205,0]],
  [[0,.39],leftJoin,[.36,0]],
  [[0,.70],[.455,0]],
  [[0,.10],[.24,.34],[.48,.64],[.79,1]],
  [[0,.39],[.23,.66],[.45,1]],
  [[0,.70],[.25,1],[1,.63]],
  [[.235,0],[.42,.09],[.65,.25],[.82,.4],[1,.59]],
  [[.485,0],[.72,.14],[.89,.26],[1,.39],[.25,1]],
  [[.485,0],[.515,.29],junction,[.76,.58],[1,.71]],
  [[.28,.525],[.43,.405],[.515,.35]],
  [[.37,.62],junction],
  [[0,.70],lowerLeft],
  [[.84,1],[1,.75]],
  [[.94,1],[1,.84]]
 ];
 const mapPoint=([u,v])=>[-2.86+u*5.72,-1.51+v*3.02];
 // The sketch's open branch ends meet their diagonal neighbours exactly.
 paths[9][0]=[.115,.525];paths[9][2]=[.515+(.35-.29)/(.485-.29)*(.565-.515),.35];
 paths[10][0]=[.37,.34+(.37-.24)/(.48-.24)*(.64-.34)];
 paths[11][1]=[.21,.39+.21/.23*(.66-.39)];
 for(const points of paths){
  const mapped=points.map(mapPoint);straight(mapped,.006);
  for(const [x,z]of mapped){const joint=new THREE.Mesh(new THREE.SphereGeometry(.006,8,6),gold);joint.position.set(x,.017,z);root.add(joint);}
 }
 root.userData.pattern='手绘参考 · 贯穿斜线与连接节点';
 if(typeof document!=='undefined'){
  const canvas=document.createElement('canvas');canvas.width=256;canvas.height=256;const c=canvas.getContext('2d');
  c.fillStyle='#bba2a9';c.fillRect(0,0,256,256);
  for(let i=0;i<256;i+=2){c.strokeStyle=i%4?'#b7a0a6':'#c4acb3';c.lineWidth=1;c.beginPath();c.moveTo(i,0);c.lineTo(i,256);c.stroke();c.strokeStyle='#af949c';c.beginPath();c.moveTo(0,i);c.lineTo(256,i);c.stroke();}
  const map=new THREE.CanvasTexture(canvas);map.wrapS=map.wrapT=THREE.RepeatWrapping;map.repeat.set(12,12);map.colorSpace=THREE.SRGBColorSpace;fabric.map=map;fabric.bumpMap=map;fabric.bumpScale=.0015;
 }
 root.userData.size=[6,5.7];return root;
}
