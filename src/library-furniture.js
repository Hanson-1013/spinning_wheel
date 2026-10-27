import * as THREE from 'three';
import {createBotanicalRadio} from './botanical-radio.js';
import {createRetroComputer} from './retro-computer.js';

function furnitureKit(materials={}){
 const mat=(c)=>new THREE.MeshStandardMaterial({color:c,roughness:.8});
 const walnut=materials.walnut??mat(0x30271e),trim=materials.trim??mat(0x51412c),brass=materials.brass??new THREE.MeshStandardMaterial({color:0x8b7042,roughness:.4,metalness:.65}),paper=materials.paper??mat(0xb6a17c),leather=materials.leather??mat(0x42362a);
 function box(parent,w,h,d,x,y,z,m=walnut){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);parent.add(o);return o;}
 return {walnut,trim,brass,paper,leather,box};
}
export function createLibraryDesk(materials={},decorated=false){
 const root=new THREE.Group();root.name='书桌 · 双侧抽屉与黄铜把手';const {walnut,trim,brass,paper,leather,box}=furnitureKit(materials);
 box(root,3.2,.14,.95,0,.97,0,trim);
 for(const side of [-1,1]){box(root,.7,.85,.8,side*1.05,.48,-.05,walnut);for(let i=0;i<3;i++){box(root,.63,.22,.025,side*1.05,.77-i*.25,.37,trim);box(root,.12,.025,.035,side*1.05,.77-i*.25,.41,brass);}}
 if(decorated){
  const computer=createRetroComputer();computer.position.set(-1.19,1.041,0);root.add(computer);
  for(let pile=1;pile<5;pile++)for(let i=0;i<2+pile%3;i++){
   const book=new THREE.Group();book.position.set(-1.2+pile*.55,1.08+i*.08,(pile%2)*.15);book.rotation.y=Math.sin(pile+i)*.12;root.add(book);
   box(book,.38,.057,.27,0,0,0,paper);for(const y of [-.035,.035])box(book,.41,.015,.29,0,y,0,pile%2?walnut:trim);
  }
  const radio=createBotanicalRadio();radio.position.set(.24,1.041,-.3);root.add(radio);
  const lamp=createDeskLamp();lamp.position.set(1.34,1.041,-.33);root.add(lamp);
 }
 return root;
}
export function createScrollShelf(materials={}){
 const shelf=new THREE.Group();shelf.name='右侧矮书架 · 牛皮卷轴与书本';
 const {walnut,brass,paper,leather,box}=furnitureKit(materials);
 const timber=walnut.clone();timber.color.setHex(0x493021);timber.roughness=.76;
 const data=new Uint8Array(128*256*4);
 for(let y=0;y<256;y++)for(let x=0;x<128;x++){const fiber=x+2*Math.sin(y*.023)+Math.sin(y*.065+x*.11),value=Math.round(185+24*Math.sin(fiber*1.8)+9*Math.sin(fiber*5.4));data.set([value,value,value,255],(y*128+x)*4);}
 const grain=new THREE.DataTexture(data,128,256);grain.wrapS=grain.wrapT=THREE.RepeatWrapping;grain.repeat.set(2,1);grain.needsUpdate=true;timber.map=grain;timber.bumpMap=grain;timber.bumpScale=.0013;
 const hideColors=[0x9a7448,0x785334,0xad8b5f].map(color=>new THREE.MeshStandardMaterial({color,roughness:.95}));
 const tie=new THREE.MeshStandardMaterial({color:0x3e2c22,roughness:1});
 // 1.6 × 1.2 m carcass, four thin boards and four solid wooden uprights.
 for(const x of [-.34,.34])for(const z of [-.2,.2]){
  box(shelf,.045,1.2,.045,x,.6,z,timber);
  box(shelf,.065,.025,.065,x,.018,z,timber);
 }
 for(const y of [.065,.425,.785,1.175])box(shelf,.8,.045,.5,0,y,0,timber);
 const scrollGeometry=new THREE.CylinderGeometry(.025,.025,.29,24,1,true);
 for(let level=0;level<3;level++){
  const surface=[.0875,.4475,.8075][level];
  // Nine rolls in a 5–3–1 triangular stack, hollow coiled ends facing forward.
  let index=0;
  for(let row=0;row<3;row++)for(let col=0;col<[5,3,1][row];col++){
   const count=[5,3,1][row],x=-.19+(col-(count-1)/2)*.052,y=surface+.026+row*.046;
   const roll=new THREE.Group();roll.name='皮质卷轴';roll.position.set(x,y,.025);shelf.add(roll);
   const tube=new THREE.Mesh(scrollGeometry,hideColors[(index+level)%3]);tube.rotation.x=Math.PI/2;roll.add(tube);
   for(const z of [-.145,.145]){
    const points=[];for(let j=0;j<=72;j++){const t=j/72,angle=t*Math.PI*4,r=.005+t*.019;points.push(new THREE.Vector3(Math.cos(angle)*r,Math.sin(angle)*r,z));}
    roll.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),72,.0018,4,false),hideColors[(index+level)%3]));
   }
   const strap=new THREE.Mesh(new THREE.TorusGeometry(.026,.0025,5,24),tie);roll.add(strap);
   index++;
  }
  for(let i=0;i<4;i++){
   const book=new THREE.Group();book.name='装订书本';book.position.set(.065+i*.067,surface+.12,.015);book.rotation.z=(i===3?-.06:0);shelf.add(book);
   const height=.22+(i%3)*.02,cover=i%2?timber:leather;book.position.y=surface+height/2;
   box(book,.047,height-.012,.25,0,0,0,paper);
   for(const x of [-.026,.026])box(book,.005,height,.265,x,0,0,cover);
   box(book,.057,height,.012,0,0,.137,cover);
   for(const y of [-.07,.07])box(book,.041,.004,.003,0,y,.145,brass);
  }
 }
 // Small potted foliage sits only on the top board.
 const potMat=new THREE.MeshStandardMaterial({color:0x8c897b,roughness:.9}),soil=new THREE.MeshStandardMaterial({color:0x28251c,roughness:1});
 const greens=[0x234b32,0x396044,0x476e46].map(color=>new THREE.MeshStandardMaterial({color,side:THREE.DoubleSide,roughness:.65}));
 for(let plant=0;plant<1;plant++){
  const pot=new THREE.Group();pot.name='顶层小绿植';pot.position.set(0,1.198,0);shelf.add(pot);
  const vessel=new THREE.Mesh(new THREE.CylinderGeometry(.068,.052,.1,24),potMat);vessel.position.y=.05;pot.add(vessel);
  const earth=new THREE.Mesh(new THREE.CircleGeometry(.059,24),soil);earth.rotation.x=-Math.PI/2;earth.position.y=.102;pot.add(earth);
  for(let i=0;i<12;i++){
   const a=i*2.4,geometry=new THREE.PlaneGeometry(1,1,4,12),p=geometry.attributes.position;
   for(let j=0;j<p.count;j++){const t=p.getY(j)+.5,u=p.getX(j)*2;p.setXYZ(j,u*.025*Math.sin(Math.PI*t),.1+t*(.1+(i%3)*.025),t*t*.1);}
   geometry.computeVertexNormals();const leaf=new THREE.Mesh(geometry,greens[i%3]);leaf.rotation.y=a;pot.add(leaf);
  }
 }
 shelf.updateMatrixWorld(true);const rawBounds=new THREE.Box3().setFromObject(shelf);
 const heightScale=1.85/rawBounds.getSize(new THREE.Vector3()).y;shelf.scale.setScalar(heightScale);
 shelf.userData.structureSize=[.8*heightScale,1.2*heightScale,.5*heightScale];shelf.userData.scrollsPerLevel=9;shelf.userData.totalHeight=1.85;
 return shelf;
}

export function createDeskLamp(){
 const root=new THREE.Group();root.name='右侧关节长臂台灯';
 const metal=new THREE.MeshStandardMaterial({color:0x403d35,metalness:.75,roughness:.4}),jointMetal=new THREE.MeshStandardMaterial({color:0x86785d,metalness:.8,roughness:.35});
 const add=(geometry,material,x=0,y=0,z=0)=>{const mesh=new THREE.Mesh(geometry,material);mesh.position.set(x,y,z);root.add(mesh);return mesh;};
 const base=add(new THREE.CylinderGeometry(.125,.13,.035,40),metal,0,.018,0);base.name='台灯底座';add(new THREE.CylinderGeometry(.105,.125,.014,40),jointMetal,0,.043,0);
 function rod(a,b,r=.009){const p=new THREE.Vector3(...a),q=new THREE.Vector3(...b),d=q.clone().sub(p);const mesh=add(new THREE.CylinderGeometry(r,r,d.length(),12),metal);mesh.position.copy(p).add(q).multiplyScalar(.5);mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());}
 const a=[0,.065,0],b=[0,.2,0],c=[.37,.7,0],d=[-.55,1.02,0];rod(a,b,.015);rod(b,c);rod(c,d);
 for(const point of [b,c,d]){const joint=add(new THREE.CylinderGeometry(.025,.025,.04,20),jointMetal,...point);joint.rotation.x=Math.PI/2;const bolt=add(new THREE.CylinderGeometry(.009,.009,.047,6),metal,...point);bolt.rotation.x=Math.PI/2;}
 const loop=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(.35,.68,0),new THREE.Vector3(.44,.74,0),new THREE.Vector3(.49,.71,0),new THREE.Vector3(.39,.65,0)]),20,.005,6,false),jointMetal);root.add(loop);
 const shade=add(new THREE.CylinderGeometry(.027,.105,.065,5),metal,-.58,1.015,0);shade.rotation.z=.2;
 const bulb=add(new THREE.CircleGeometry(.078,24),new THREE.MeshBasicMaterial({color:0xffd7a0}),-.586,.979,0);bulb.rotation.x=-Math.PI/2;
 const cable=add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(.04,.04,-.04),new THREE.Vector3(.2,.04,-.05),new THREE.Vector3(.31,-.02,-.06),new THREE.Vector3(.34,-.5,-.06),new THREE.Vector3(.42,-.9,-.07)]),32,.004,6,false),metal);
 return root;
}
