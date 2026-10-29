import {readLayout} from './poster-layout.js';
import * as THREE from 'three';
import {WINDOW_TRANSOMS,LIBRARY_CEILING_BOTTOM} from './library-window-layout.js';
import {createLibraryFrame} from './library-props.js';

export function addChamferedArchitecture(root,{wood,trim,brass,iron,glass,sky}){
 const architecture=new THREE.Group();architecture.name='对称建筑 · 45度斜墙与侧面落地窗';root.add(architecture);
 const wallMaterial=new THREE.MeshStandardMaterial({color:0x39382e,roughness:.88});
 const geometry=new THREE.BoxGeometry(1,1,1);
 function box(parent,w,h,d,x,y,z,material){
  if(material!==sky){const lower=v=>v-.5*THREE.MathUtils.smoothstep(v,4.5,5.5),bottom=lower(y-h/2),top=parent.name.includes('落地玻璃')?Math.min(LIBRARY_CEILING_BOTTOM,lower(y+h/2)):lower(y+h/2);h=top-bottom;y=(top+bottom)/2;}
  const object=new THREE.Mesh(geometry,material);object.scale.set(w,h,d);object.position.set(x,y,z);object.receiveShadow=true;object.castShadow=material!==sky&&!material.transparent;parent.add(object);return object;}
 function rod(parent,a,b,width=.012,material=brass){const delta=b.clone().sub(a),object=box(parent,width,delta.length(),.018,0,0,0,material);object.position.copy(a).add(b).multiplyScalar(.5);object.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());return object;}
 function artwork(rays=true){
  const art=new THREE.Group();art.name='斜墙挂画 · 黄铜放射装饰';
  const frame=createLibraryFrame(1.15,1.52,trim,brass);art.add(frame);
  const canvasMaterial=new THREE.MeshStandardMaterial({color:0x8d9476,roughness:1});
  if(typeof document!=='undefined'){
   const canvas=document.createElement('canvas');canvas.width=256;canvas.height=320;const c=canvas.getContext('2d');
   const gradient=c.createLinearGradient(0,0,0,320);gradient.addColorStop(0,'#a5a38b');gradient.addColorStop(.55,'#b1aa8b');gradient.addColorStop(1,'#37483b');c.fillStyle=gradient;c.fillRect(0,0,256,320);
   let state=19;const random=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};
   for(let layer=0;layer<5;layer++){
    c.fillStyle=['#959b80','#7b896c','#64775e','#4a624b','#344f3c'][layer];c.beginPath();c.moveTo(0,320);
    for(let x=0;x<=256;x+=8)c.lineTo(x,150+layer*27+Math.sin(x*.025+layer)*20+random()*12);c.lineTo(256,320);c.closePath();c.fill();
   }
   for(let i=0;i<1500;i++){const x=random()*256,y=random()*320;c.fillStyle=`rgba(213,198,151,${random()*.07})`;c.fillRect(x,y,1+random()*5,1);}
   const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;canvasMaterial.color.setHex(0xffffff);canvasMaterial.map=map;
  }
  box(art,1.02,1.39,.025,0,0,.008,canvasMaterial);
  for(let i=0;i<(rays?64:0);i++){
   const angle=i/64*Math.PI*2,dx=Math.cos(angle),dy=Math.sin(angle);
   const inner=Math.min(.64/Math.max(.001,Math.abs(dx)),.83/Math.max(.001,Math.abs(dy)))+.09;
   const outer=1.48+(i%4)*.095;
   rod(art,new THREE.Vector3(dx*inner,dy*inner,-.015),new THREE.Vector3(dx*outer,dy*outer,-.015),i%4===0?.021:.011);
  }
  return art;
 }
 const diagonalLength=Math.hypot(3,3)-1.2;
 const diagonalRun=diagonalLength/Math.SQRT2,sideStart=-6.3+diagonalRun;
 const sideLength=9.5-sideStart;
 for(const side of [-1,1]){
  const wall=new THREE.Group();wall.name=side===1?'右侧45度实体墙':'左侧45度实体墙';wall.position.set(side*(7+diagonalRun/2),0,-6.3+diagonalRun/2);wall.rotation.y=-side*Math.PI/4;architecture.add(wall);
  box(wall,diagonalLength,8.6,.34,0,1.9,0,wallMaterial);
  box(wall,diagonalLength,.32,.4,0,5.96,.015,wood);box(wall,diagonalLength,.12,.42,0,5.72,.04,trim);
  box(wall,diagonalLength,.35,.4,0,-2.2,.02,wood);box(wall,diagonalLength,.055,.035,0,-1.99,.24,brass);
  // Raised panel borders frame the sunburst without replacing its solid wall.
  for(const edge of [-1,1])box(wall,.035,7.3,.025,edge*(diagonalLength/2-.3),1.9,.184,trim);
  for(const y of [-1.73,5.53])box(wall,diagonalLength-.6,.035,.025,0,y,.184,trim);
  for(const {id,x,y,w} of readLayout().filter(p=>p.side===side)){
   const texture=new THREE.TextureLoader().load(import.meta.env.BASE_URL+`artworks/posters/poster-${String(id).padStart(2,'0')}.png`);
   texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;
   // UV crop excludes the source preview's bottom reflection and surrounding margins.
   if(id===1){texture.offset.set(11/287,1-438/499);texture.repeat.set(266/287,432/499);}
   else{texture.offset.set(13/376,1-563/636);texture.repeat.set(340/376,553/636);}
   const h=w*(id===1?432/266:553/340),poster=new THREE.Group();poster.name=`侧墙海报 ${id}`;poster.position.set(x,y,.235);poster.scale.setScalar(.78);wall.add(poster);
   const frame=createLibraryFrame(w+.17,h+.17,wood,brass);poster.add(frame);
   // Broad stepped outer moulding, matching the heavier antique frames in the reference.
   const frameWood=wood.clone();frameWood.color.setHex(0x30271e);frameWood.roughness=.72;
   const outerW=w+.29,outerH=h+.29;
   for(const sign of [-1,1]){
    const railH=new THREE.Mesh(new THREE.BoxGeometry(outerW,.095,.09),frameWood);railH.position.set(0,sign*(outerH/2-.0475),.012);poster.add(railH);
    const railV=new THREE.Mesh(new THREE.BoxGeometry(.095,outerH-.19,.09),frameWood);railV.position.set(sign*(outerW/2-.0475),0,.012);poster.add(railV);
    for(const axis of ['x','y']){const bead=new THREE.Mesh(new THREE.BoxGeometry(axis==='x'?outerW-.045:.018,axis==='y'?outerH-.045:.018,.016),trim);bead.position.set(axis==='y'?sign*(outerW/2-.025):0,axis==='x'?sign*(outerH/2-.025):0,.063);poster.add(bead);}
   }
   frame.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
   const mount=new THREE.Mesh(new THREE.PlaneGeometry(w+.018,h+.018),new THREE.MeshStandardMaterial({color:0xf2efe6,roughness:1}));mount.position.z=.04;poster.add(mount);
   const print=new THREE.Mesh(new THREE.PlaneGeometry(w-.16,h-.16),new THREE.MeshStandardMaterial({map:texture,color:0xffffff,roughness:.94,metalness:0}));print.position.z=.042;print.receiveShadow=true;poster.add(print);
  }
  for(const edge of [-1,1]){
   const pillar=new THREE.Group();pillar.name='斜墙承重柱 · 深色宽面与竖向黄铜饰条';pillar.position.set(edge*diagonalLength/2,0,.025);wall.add(pillar);
   const pillarWood=wood.clone();pillarWood.color.setHex(0x242e26);pillarWood.roughness=.8;
   box(pillar,.82,8.5,.46,0,1.9,0,pillarWood);
   // Recessed panel with fewer, clearly separated brass ribs.
   box(pillar,.69,6.5,.018,0,1.0,.239,trim);
   box(pillar,.65,6.42,.022,0,1.0,.254,pillarWood);
   for(let line=0;line<9;line++)box(pillar,.014,6.22,.018,-.288+line*.072,1.0,.275,brass);
   for(const y of [-2.17,4.35]){box(pillar,.91,.11,.51,0,y,.015,pillarWood);box(pillar,.87,.018,.49,0,y+.065,.025,brass);}
   for(const y of [-2.19,5.98]){box(pillar,1.12,.18,.56,0,y,0,trim);box(pillar,1.02,.025,.51,0,y+.11,0,brass);}
  }
  const windows=new THREE.Group();windows.name=side===1?'右侧落地玻璃':'左侧落地玻璃';windows.position.set(side*(7+diagonalRun),0,(9.5+sideStart)/2);windows.rotation.y=-side*Math.PI/2;architecture.add(windows);
  box(windows,sideLength,.55,.26,0,-2.12,0,wood);box(windows,sideLength,.12,.38,0,4.47,0,trim);
  box(windows,sideLength,7.35,.025,0,1.805,0,glass);
  for(let col=0;col<=8;col++){
   const x=-sideLength/2+col*sideLength/8;box(windows,.11,7.43,.2,x,1.665,.06,wood);box(windows,.014,7.2,.012,x,1.725,.167,brass);
  }
  for(const y of [WINDOW_TRANSOMS[0],WINDOW_TRANSOMS[2],4.47])box(windows,sideLength,.065,.09,0,y,.12,iron);
  box(windows,sideLength,.16,.17,0,WINDOW_TRANSOMS[1],.16,iron);
  // Extend the sky beyond side glass so inspection never sees a void.
  box(architecture,.1,20,28,side*20,3,1,sky);
 }
 return architecture;
}
