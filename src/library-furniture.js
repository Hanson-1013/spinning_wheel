import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {createBotanicalRadio} from './botanical-radio.js';
import {createRetroComputer} from './retro-computer.js';

function furnitureKit(materials={}){
 const mat=(c)=>new THREE.MeshStandardMaterial({color:c,roughness:.8});
 const walnut=materials.walnut??mat(0x30271e),trim=materials.trim??mat(0x51412c),brass=materials.brass??new THREE.MeshStandardMaterial({color:0x8b7042,roughness:.4,metalness:.65}),paper=materials.paper??mat(0xb6a17c),leather=materials.leather??mat(0x42362a);
 function box(parent,w,h,d,x,y,z,m=walnut){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);parent.add(o);return o;}
 return {walnut,trim,brass,paper,leather,box};
}
export function createLibraryDesk(materials={},decorated=false){
 const root=new THREE.Group();root.name='书桌 · 四腿开放式';const {walnut,trim,brass,paper,leather,box}=furnitureKit(materials);
 box(root,3.2,.14,.95,0,.97,0,trim);
 for(const x of [-1.4,1.4])for(const z of [-.34,.34]){const leg=box(root,.085,.9,.085,x,.45,z,walnut);leg.name='书桌桌腿';box(root,.087,.055,.087,x,.028,z,trim);}
 for(const z of [-.34,.34])box(root,2.8,.12,.045,0,.84,z,walnut);
 for(const x of [-1.4,1.4])box(root,.045,.12,.68,x,.84,0,walnut);
 root.add(createDeskCloth());
 if(decorated){
  const computer=createRetroComputer();computer.position.set(-1.19,1.055,0);root.add(computer);
  root.add(createDeskBooksAndScrolls(materials));
  const radio=createBotanicalRadio();radio.position.set(.24,1.041,-.3);root.add(radio);
  const lamp=createDeskLamp();lamp.position.set(1.34,1.041,-.33);root.add(lamp);
 }
 return root;
}
export function createDrawerCabinet(materials={}){
 const root=new THREE.Group();root.name='独立三抽屉柜 · 黄铜把手';const {paper,brass}=furnitureKit(materials);
 const wood=new THREE.MeshStandardMaterial({color:0x493021,roughness:.7}),frontWood=wood.clone(),dark=new THREE.MeshStandardMaterial({color:0x2f261e,roughness:.9});frontWood.color.setHex(0x573925);
 const data=new Uint8Array(128*256*4);for(let y=0;y<256;y++)for(let x=0;x<128;x++){const u=x+3*Math.sin(y*.026+x*.05),v=Math.round(189+24*Math.sin(u*1.3)+8*Math.sin(u*4.9));data.set([v,v,v,255],(y*128+x)*4);}
 const grain=new THREE.DataTexture(data,128,256);grain.wrapS=grain.wrapT=THREE.RepeatWrapping;grain.needsUpdate=true;for(const m of [wood,frontWood]){m.map=grain;m.bumpMap=grain;m.bumpScale=.0012;}
 function rounded(w,h,d,x,y,z,m=wood,r=.008){const o=new THREE.Mesh(new RoundedBoxGeometry(w,h,d,4,r),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;root.add(o);return o;}
 rounded(.7,.885,.5,0,.4925,0,wood,.025);rounded(.65,.692,.008,0,.565,.253,dark,.014);
 rounded(.712,.025,.512,0,.9325,0,wood,.009);
 for(let i=0;i<3;i++){
  const y=.803-i*.237;const drawer=rounded(.635,.22,.025,0,y,.265,frontWood,.012);drawer.name='抽屉面板';
  const stem=new THREE.Mesh(new THREE.CylinderGeometry(.006,.006,.019,12),brass);stem.rotation.x=Math.PI/2;stem.position.set(0,y,.287);root.add(stem);
  const handle=new THREE.Mesh(new THREE.CylinderGeometry(.016,.016,.008,24),brass);handle.rotation.x=Math.PI/2;handle.position.set(0,y,.3);handle.name='黄铜纽扣把手';root.add(handle);
 }
 for(const x of [-.265,.265])for(const z of [-.17,.17]){
  const a=new THREE.Vector3(x,.05,z),b=new THREE.Vector3(x*1.04,0,z*1.04),delta=a.clone().sub(b);
  const leg=new THREE.Mesh(new THREE.CylinderGeometry(.03,.019,delta.length(),4),wood);leg.position.copy(a).add(b).multiplyScalar(.5);leg.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());root.add(leg);
 }
 // Three staggered books rest on the top, with the plant beside them.
 const covers=[0x493b2c,0x3d4b39,0x70543b].map(color=>new THREE.MeshStandardMaterial({color,roughness:.86}));
 for(let i=0;i<3;i++){
  const book=new THREE.Group();book.name='柜顶书本';book.position.set(-.14+i*.008,.968+i*.041,.005);book.rotation.y=(i-1)*.08;root.add(book);
  for(const [height,y,m]of [[.028,0,paper],[.005,-.017,covers[i]],[.005,.017,covers[i]]]){const mesh=new THREE.Mesh(new RoundedBoxGeometry(.25,height,.18,1,.001),m);mesh.position.y=y;book.add(mesh);}
 }
 const plant=new THREE.Group();plant.name='柜顶绿植';plant.position.set(.2,.945,-.01);root.add(plant);
 const potmat=new THREE.MeshStandardMaterial({color:0xa7a18e,roughness:.9}),green=new THREE.MeshPhysicalMaterial({color:0x2f5840,side:THREE.DoubleSide,roughness:.58,clearcoat:.15});
 const pot=new THREE.Mesh(new THREE.CylinderGeometry(.058,.041,.083,24),potmat);pot.position.y=.0415;plant.add(pot);
 const soil=new THREE.Mesh(new THREE.CircleGeometry(.05,24),dark);soil.position.y=.084;soil.rotation.x=-Math.PI/2;plant.add(soil);
 for(let i=0;i<14;i++){
  const g=new THREE.PlaneGeometry(1,1,4,12),p=g.attributes.position;
  for(let j=0;j<p.count;j++){const t=p.getY(j)+.5,u=p.getX(j)*2;p.setXYZ(j,u*.023*Math.sin(Math.PI*t),.075+t*(.11+i%3*.025)-t*t*.03,t*t*.075);}
  g.computeVertexNormals();const leaf=new THREE.Mesh(g,green);leaf.rotation.y=i*2.399;plant.add(leaf);
 }
 root.userData.legHeight=.05;root.userData.cabinetHeight=.945;root.userData.drawerCount=3;return root;
}
export function createScrollShelf(materials={},options={}){
 const variation=options.variation??0,baseScale=1.85/1.448,levelRise=.1/baseScale;
 const shelf=new THREE.Group();shelf.name='右侧矮书架 · 牛皮卷轴与书本';
 const {walnut,brass,paper,leather,box}=furnitureKit(materials);
 const timber=walnut.clone();timber.color.setHex(0x493021);timber.roughness=.76;
 const data=new Uint8Array(128*256*4);
 for(let y=0;y<256;y++)for(let x=0;x<128;x++){const fiber=x+2*Math.sin(y*.023)+Math.sin(y*.065+x*.11),value=Math.round(185+24*Math.sin(fiber*1.8)+9*Math.sin(fiber*5.4));data.set([value,value,value,255],(y*128+x)*4);}
 const grain=new THREE.DataTexture(data,128,256);grain.wrapS=grain.wrapT=THREE.RepeatWrapping;grain.repeat.set(2,1);grain.needsUpdate=true;timber.map=grain;timber.bumpMap=grain;timber.bumpScale=.0013;
 const hideColors=[0x9a7448,0x785334,0xad8b5f].map(color=>new THREE.MeshStandardMaterial({color,roughness:.95}));
 const tie=new THREE.MeshStandardMaterial({color:0x3e2c22,roughness:1});
 // Slender, gently irregular round walnut posts with thinner shelf boards.
 for(const x of [-.34,.34])for(const z of [-.2,.2]){
  const h=1.2+levelRise*3,points=[];
  for(let i=0;i<=12;i++){const t=i/12;points.push(new THREE.Vector3(x+.0025*Math.sin(t*Math.PI*2+x*7),t*h,z+.002*Math.sin(t*Math.PI*1.5+z*6)));}
  const post=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),24,.0135,10,false),timber);post.name='细圆胡桃木立柱';shelf.add(post);
  const foot=new THREE.Mesh(new THREE.CylinderGeometry(.019,.021,.02,16),timber);foot.position.set(x,.01,z);shelf.add(foot);
 }
 for(const [level,base]of [.065,.425,.785,1.175].entries()){
  const board=box(shelf,.8,.022,.5,0,base+level*levelRise,0,timber);board.name='薄胡桃木层板';
  // Almost imperceptible uneven edges keep the timber from looking injection-molded.
  const p=board.geometry.attributes.position;for(let i=0;i<p.count;i++)p.setY(i,p.getY(i)+.0008*Math.sin(p.getX(i)*19+p.getZ(i)*13));board.geometry.computeVertexNormals();
 }
 const scrollGeometry=new THREE.CylinderGeometry(.025,.025,.29,24,1,true);
 for(let level=0;level<3;level++){
  const surface=[.065,.425,.785][level]+level*levelRise+.011;
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
 const potMat=new THREE.MeshStandardMaterial({color:variation?0x665749:0x9b9b8b,roughness:.9}),soil=new THREE.MeshStandardMaterial({color:0x28251c,roughness:1});
 const greens=[0x234b32,0x396044,0x476e46].map(color=>new THREE.MeshStandardMaterial({color,side:THREE.DoubleSide,roughness:.65}));
 for(let plant=0;plant<1;plant++){
  const pot=new THREE.Group();pot.name='顶层小绿植';pot.position.set(variation?.035:-.025,1.186+levelRise*3,0);pot.scale.setScalar(2.05);shelf.add(pot);
  const vessel=new THREE.Mesh(new THREE.CylinderGeometry(.068,.052,.1,24),potMat);vessel.position.y=.05;pot.add(vessel);
  const earth=new THREE.Mesh(new THREE.CircleGeometry(.059,24),soil);earth.rotation.x=-Math.PI/2;earth.position.y=.102;pot.add(earth);
  for(let i=0;i<12;i++){
   const a=i*2.4+variation*.7,geometry=new THREE.PlaneGeometry(1,1,4,12),p=geometry.attributes.position;
   for(let j=0;j<p.count;j++){const t=p.getY(j)+.5,u=p.getX(j)*2;const width=variation?.017:.031,length=.1+(i%3)*.025;
    p.setXYZ(j,u*width*Math.sin(Math.PI*t),.1+t*length-(variation?.075:.025)*t*t,t*t*(variation?.16:.08)+.01*u*u);}
   geometry.computeVertexNormals();const leaf=new THREE.Mesh(geometry,greens[i%3]);leaf.rotation.y=a;pot.add(leaf);
  }
 }
 shelf.scale.setScalar(baseScale);shelf.updateMatrixWorld(true);const actualBounds=new THREE.Box3().setFromObject(shelf);
 shelf.userData.structureSize=[.8*baseScale,(1.2+levelRise*3)*baseScale,.5*baseScale];shelf.userData.scrollsPerLevel=9;shelf.userData.totalHeight=actualBounds.getSize(new THREE.Vector3()).y;shelf.userData.levelRise=.1;shelf.userData.plantVariation=variation;
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

export function createDeskCloth(){
 const root=new THREE.Group();root.name='米色桌布 · 平整斜铺';
 const map=new THREE.TextureLoader().load(import.meta.env.BASE_URL+'artworks/vintage-world-map-tablecloth.png');map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=4;
 const mat=new THREE.MeshStandardMaterial({color:0xd9b6a2,map,roughness:.96,side:THREE.DoubleSide});
 mat.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
  // Deepen printed shadows while keeping the linen ground relatively light.
  diffuseColor.rgb=pow(diffuseColor.rgb,vec3(1.13,1.22,1.28));
 `);};mat.customProgramCacheKey=()=> 'vintage-map-red-brown-v1';
 const g=new THREE.PlaneGeometry(2.9,1.68,60,60),p=g.attributes.position,angle=-.075;
 for(let i=0;i<p.count;i++){
  const u=p.getX(i),v=p.getY(i),x=u*Math.cos(angle)-v*Math.sin(angle),z=u*Math.sin(angle)+v*Math.cos(angle);
  // Bend outside the tabletop edge (z=±.475), leaving clearance along its thickness.
  const distance=Math.abs(z),radius=.025,start=.463,arc=radius*Math.PI/2;
  let clothZ=distance,clothY=1.057;
  if(distance>start){const t=Math.min((distance-start)/radius,Math.PI/2);clothZ=start+radius*Math.sin(t);clothY-=radius*(1-Math.cos(t))+Math.max(0,distance-start-arc);}
  p.setXYZ(i,x,clothY,Math.sign(z)*clothZ);
 }
 g.computeVertexNormals();root.add(new THREE.Mesh(g,mat));return root;
}
export function createDeskBooksAndScrolls(materials={}){
 const root=new THREE.Group();root.name='桌面薄书与两卷羊皮纸';const {paper,walnut,trim,box}=furnitureKit(materials);
 for(let pile=0;pile<4;pile++)for(let i=0;i<6+pile%3;i++){
  const book=new THREE.Group();book.name='桌面薄书';book.position.set(-.67+(pile%2)*.34,1.072+i*.035,-.19+Math.floor(pile/2)*.28);book.rotation.y=Math.sin(pile*3+i)*.09;root.add(book);
  box(book,.28,.024,.195,0,0,0,paper);for(const y of [-.014,.014])box(book,.294,.004,.205,0,y,0,i%2?walnut:trim);
 }
 const parchment=new THREE.MeshStandardMaterial({color:0xc5ad7e,roughness:.92,side:THREE.DoubleSide}),cord=new THREE.MeshStandardMaterial({color:0x685036,roughness:.9});
 for(let i=0;i<2;i++){
  const roll=new THREE.Group();roll.name='羊皮纸卷';roll.position.set(-.86+i*.42,1.09,.375);roll.rotation.y=i?-.16:.09;root.add(roll);
  const tube=new THREE.Mesh(new THREE.CylinderGeometry(.034,.034,.34,24,1,true),parchment);tube.rotation.z=Math.PI/2;roll.add(tube);
  for(const x of [-.17,.17]){const pts=[];for(let k=0;k<100;k++){const t=k/99,r=.008+t*.024,a=t*Math.PI*6;pts.push(new THREE.Vector3(x,Math.cos(a)*r,Math.sin(a)*r));}roll.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),100,.0018,4,false),parchment));}
  const tie=new THREE.Mesh(new THREE.TorusGeometry(.035,.0017,5,32),cord);tie.rotation.y=Math.PI/2;roll.add(tie);
 }
 return root;
}
