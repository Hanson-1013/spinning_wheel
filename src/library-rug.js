import * as THREE from 'three';

export function createLibraryRug(){
 const root=new THREE.Group();root.name='酒红地毯 · 不规则多面体金线与钩边';root.position.set(1.8,-2.365,-2.35);root.scale.z=5.7/3.3;
 const fabric=new THREE.MeshPhysicalMaterial({color:0x641f32,roughness:1,metalness:0,sheen:.3,sheenColor:0x7a3545,sheenRoughness:1});
 const gold=new THREE.MeshStandardMaterial({color:0xb89a59,roughness:.85,metalness:.1});
 const rug=new THREE.Mesh(new THREE.BoxGeometry(6,.026,3.3),fabric);root.add(rug);
 function thread(points,radius=.004){const line=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(([x,z])=>new THREE.Vector3(x,.016,z)),false,'catmullrom',.1),Math.max(6,points.length*5),radius,5,false),gold);root.add(line);}
 function straight(points,radius=.004){for(let i=1;i<points.length;i++){const a=new THREE.Vector3(points[i-1][0],.017,points[i-1][1]),b=new THREE.Vector3(points[i][0],.017,points[i][1]),d=b.clone().sub(a);const mesh=new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,d.length(),5),gold);mesh.position.copy(a).add(b).multiplyScalar(.5);mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());root.add(mesh);}}
 for(const inset of [.085,.14]){const x=3-inset,z=1.65-inset;straight([[-x,-z],[x,-z],[x,z],[-x,z],[-x,-z]],inset===.085?.007:.003);}
 // Asymmetric polygonal wireframes with off-center vertices evoke faceted polyhedra.
 const motifs=[[-2.02,-.57,.62,6,.3],[-.56,-.78,.64,5,-.15],[1.05,-.58,.78,7,.5],[2.15,.54,.53,5,.1],[.38,.56,.77,6,-.4],[-1.47,.65,.69,7,.23]];
 for(const [cx,cz,radius,count,phase]of motifs){
  const ring=[];
  for(let i=0;i<count;i++){const a=i/count*Math.PI*2+phase,r=radius*(.83+.15*Math.sin(i*2.7+phase));ring.push([cx+Math.cos(a)*r,cz+Math.sin(a)*r*.73]);}
  straight([...ring,ring[0]],.0045);
  const hub=[cx+radius*.16,cz-radius*.08];
  for(let i=0;i<count;i++)if(i%2===0)straight([ring[i],hub],.003);
  const inset=ring.map(([x,z])=>[hub[0]+(x-hub[0])*.48,hub[1]+(z-hub[1])*.48]);
  straight([...inset,inset[0]],.003);for(let i=1;i<count;i+=2)straight([ring[i],inset[i]],.003);
 }
 // Small inward-facing crochet hooks sit just inside the continuous border.
 for(const side of [-1,1]){
  for(let x=-2.72;x<=2.72;x+=.19)thread([[x,side*1.48],[x,side*1.41],[x+.045,side*1.38],[x+.065,side*1.405]],.003);
  for(let z=-1.28;z<=1.28;z+=.19)thread([[side*2.82,z],[side*2.75,z],[side*2.72,z+.045],[side*2.745,z+.065]],.003);
 }
 if(typeof document!=='undefined'){
  const canvas=document.createElement('canvas');canvas.width=256;canvas.height=256;const c=canvas.getContext('2d');
  c.fillStyle='#bba2a9';c.fillRect(0,0,256,256);
  for(let i=0;i<256;i+=2){c.strokeStyle=i%4?'#b7a0a6':'#c4acb3';c.lineWidth=1;c.beginPath();c.moveTo(i,0);c.lineTo(i,256);c.stroke();c.strokeStyle='#af949c';c.beginPath();c.moveTo(0,i);c.lineTo(256,i);c.stroke();}
  const map=new THREE.CanvasTexture(canvas);map.wrapS=map.wrapT=THREE.RepeatWrapping;map.repeat.set(12,12);map.colorSpace=THREE.SRGBColorSpace;fabric.map=map;fabric.bumpMap=map;fabric.bumpScale=.0015;
 }
 root.userData.size=[6,5.7];return root;
}
