import * as THREE from 'three';
import {createRetroTowers} from './retro-towers.js';
import {createBotanicalRadio} from './botanical-radio.js';
import {createRetroComputer} from './retro-computer.js';
import {createScrollShelf,createDeskLamp} from './library-furniture.js';
import {createLibraryRug} from './library-rug.js';
import {addLibraryInstruments} from './library-instruments.js';
import {createNixieConsole} from './nixie-clock.js';
import {createLibraryFrame} from './library-props.js';

export function addLibraryDetails(root,{box,cylinder,walnut,trim,iron,brass,stone,random,books,leafMaterial,sun}){
 const mat=(color,extra={})=>new THREE.MeshStandardMaterial({color,roughness:.8,...extra});
 const plaster=mat(0x474438),paper=mat(0xb6a17c),leather=mat(0x42362a),cloth=mat(0x453e29),ink=mat(0x25332c);
 const sphere=new THREE.SphereGeometry(1,12,8);
 function orb(r,x,y,z,material,parent=root){const o=new THREE.Mesh(sphere,material);o.scale.setScalar(r);o.position.set(x,y,z);parent.add(o);return o;}
 function bar(a,b,r=.016,material=iron,parent=root){const d=b.clone().sub(a),o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,d.length(),8),material);o.position.copy(a).add(b).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());parent.add(o);return o;}
 function ring(radius,tube,x,y,z,material=brass,parent=root){const o=new THREE.Mesh(new THREE.TorusGeometry(radius,tube,8,48),material);o.position.set(x,y,z);parent.add(o);return o;}
 // Structural chamfer walls and side glazing are built by library-architecture.js.
 for(const side of [-1,1]){
  // Open frames hang at staggered depths; yaw around vertical, rather than flat face-on.
  const frameLayout=[
   [-.16,4.1,-5.3,1.04,1.3,-.28],
   [.27,3.2,-4.65,1.22,.92,.32],
   [-.12,2.2,-5.05,.96,1.14,.2],
  ];
  for(const [offset,y,z,w,h,yaw] of frameLayout){
   // Same unscaled frame profile as the original central frames (0.065 outer rim).
   const frame=createLibraryFrame(w,h,trim,brass);frame.name='错落悬挂空画框';frame.userData.frameHeight=h;frame.position.set(side*(5.55+offset-w),y-.6,z);frame.rotation.set(0,side*yaw,side*offset*.08);root.add(frame);
   // Suspension points follow the rotated frame so their fine wires stay attached.
   frame.updateMatrixWorld(true);
   for(const edge of [-1,1]){
    const anchor=new THREE.Vector3(edge*w*.32,h/2,-.02).applyMatrix4(frame.matrixWorld);
    bar(anchor,new THREE.Vector3(anchor.x,5.4,anchor.z),.003,iron);
   }
  }

 }
 // Ceiling beams and diagonal sun streaks across the floor.
 for(let i=0;i<10;i++)box(.14,.25,15,-9+i*2,5.52,.5,trim);
 // Burgundy textile with gold polyhedral embroidery and hooked border trim.
 root.add(createLibraryRug());
 const rearPropsStart=new Set(root.children);
 const towers=createRetroTowers();towers.position.set(-3.15,-2.395,-3.32);root.add(towers);
 // Research console on the left: four amber readouts, knobs, meter face and cable runs.
 const machine=createNixieConsole(random,{leather,iron,brass});machine.name='落地辉光钟 · 中央侧前方';machine.position.set(-6.4,-1.995,-1.6);machine.rotation.y=Math.PI/4;root.add(machine);
 root.userData.update=time=>machine.userData.update(time);
 // Stacked folios, rolled papers, a desk radio and a small adjustable task lamp.
 const computer=createRetroComputer();computer.position.set(-1.19,-1.309,-3.6);root.add(computer);
 for(let pile=1;pile<5;pile++){
  const x=-1.2+pile*.55,z=-3.55+(pile%2)*.15;
  for(let i=0;i<2+pile%3;i++){
   const group=new THREE.Group();group.position.set(x,-1.27+i*.08,z);group.rotation.y=(random()-.5)*.35;root.add(group);
   box(.38,.057,.27,0,0,0,paper,group);for(const y of [-.035,.035])box(.41,.015,.29,0,y,0,pile%2?walnut:trim,group);
  }
 }
 const radio=createBotanicalRadio();radio.position.set(.24,-1.309,-3.9);root.add(radio);
 const deskLamp=createDeskLamp();deskLamp.position.set(1.34,-1.309,-3.93);root.add(deskLamp);
 // Enlarged floor-standing frame, displaying the supplied artwork without cropping.
 const painting=new THREE.Group();painting.name='书桌前落地画框 · 用户插画';painting.position.set(1.7,0,-3);painting.rotation.set(-.04,-.12,0);painting.scale.setScalar(1.25);root.add(painting);
 box(2.15,1.5,.07,0,0,0,leather,painting);box(2.01,1.35,.018,0,0,.045,mat(0x292d2b),painting);
 const artworkMaterial=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.92,metalness:0});
 if(typeof document!=='undefined'){
  const texture=new THREE.TextureLoader().load(import.meta.env.BASE_URL+'artworks/desk-framed-art.jpg');texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;artworkMaterial.map=texture;
 }
 const artwork=new THREE.Mesh(new THREE.PlaneGeometry(2.01,2.01*1289/2148),artworkMaterial);artwork.position.z=.058;painting.add(artwork);
 const paintingFrame=createLibraryFrame(2.15,1.5,trim,brass);paintingFrame.position.z=.045;painting.add(paintingFrame);
 painting.updateWorldMatrix(true,true);const artworkBounds=new THREE.Box3().setFromObject(painting);painting.position.y+=-2.345-artworkBounds.min.y;
 painting.userData.frameScale=1.25;painting.userData.floorY=-2.345;
 for(let i=0;i<4;i++){
  const group=new THREE.Group();group.position.set(-3.8+i*2.4,-2.15,-4.9+(i%2)*1.3);group.rotation.y=random()*.8;root.add(group);
  box(.42,.4,.42,0,0,0,trim,group);for(const x of [-.16,.16])box(.025,.4,.025,x,0,.225,brass,group);box(.13,.035,.025,0,.15,.23,brass,group);
 }
 // Low open shelving with leather scrolls, books and a draped travel trunk.
 for(const z of [-1.4,.25]){
  const shelf=createScrollShelf({walnut,trim,brass,paper,leather});shelf.position.set(4.05,-2.395,z);shelf.rotation.y=-Math.PI/2;root.add(shelf);
 }
 const trunk=new THREE.Group();trunk.name='旅行箱 · 自然垂搭布料';trunk.position.set(3.5,-2.35,-2.6);root.add(trunk);
 box(1.05,.53,.61,0,.3,0,leather,trunk);box(1.08,.065,.64,0,.59,0,trim,trunk);
 for(const x of [-.37,.37]){box(.045,.53,.015,x,.3,.313,brass,trunk);box(.045,.015,.61,x,.635,0,brass,trunk);}
 box(.2,.065,.025,0,.36,.325,brass,trunk);
 const fabricGeometry=new THREE.PlaneGeometry(.68,1.1,24,40),fp=fabricGeometry.attributes.position;
 for(let i=0;i<fp.count;i++){const x=fp.getX(i),t=fp.getY(i)+.55;const z=-.3+Math.min(t,.62),y=t<.62?.645:.645-(t-.62);fp.setXYZ(i,x,y+.012*Math.sin(x*43+t*8),z+(t>.62?.025*Math.sin(x*35):0));}fabricGeometry.computeVertexNormals();
 const trunkCloth=new THREE.Mesh(fabricGeometry,new THREE.MeshStandardMaterial({color:0x9a8c79,roughness:1,side:THREE.DoubleSide}));trunkCloth.rotation.y=.12;trunk.add(trunkCloth);
 // Procedural surface detail: worn timber grain, book spine tooling, leaf veins.
 if(typeof document!=='undefined'){
  function texture(w,h,paint){const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;const c=canvas.getContext('2d');paint(c,w,h);const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;return map;}
  stone.color.setHex(0x51564d);
  stone.map=texture(128,128,(c,w,h)=>{c.fillStyle='#9d9e92';c.fillRect(0,0,w,h);for(let i=0;i<16000;i++){const tone=100+Math.floor(random()*80);c.fillStyle=`rgba(${tone},${tone},${tone},.16)`;c.fillRect(random()*w,random()*h,2,2);}});stone.map.wrapS=stone.map.wrapT=THREE.RepeatWrapping;stone.map.repeat.set(1,1);stone.bumpMap=stone.map;stone.bumpScale=.0018;stone.roughness=.32;stone.needsUpdate=true;
  const wood=texture(128,512,(c,w,h)=>{c.fillStyle='#b7a489';c.fillRect(0,0,w,h);for(let i=0;i<950;i++){const x=random()*w;c.strokeStyle=`rgba(40,25,14,${.03+random()*.14})`;c.beginPath();c.moveTo(x,0);for(let y=0;y<=h;y+=16)c.lineTo(x+Math.sin(y*.025+i)*(.8+random()*2),y);c.stroke();}});
  for(const m of [walnut,trim]){m.map=wood;m.bumpMap=wood;m.bumpScale=.012;m.needsUpdate=true;}
  books.material.map=texture(64,256,(c,w,h)=>{c.fillStyle='#d0c5ac';c.fillRect(0,0,w,h);for(const y of [18,27,205,214]){c.fillStyle='#74644b';c.fillRect(0,y,w,3);}c.strokeStyle='#92805b';c.strokeRect(8,58,48,76);for(let i=0;i<6;i++){c.fillStyle='#8d8169';c.fillRect(15,70+i*9,24+(i%3)*4,2);}for(let i=0;i<700;i++){c.fillStyle=`rgba(40,30,20,${random()*.13})`;c.fillRect(random()*w,random()*h,1,2);}});books.material.needsUpdate=true;
  leafMaterial.map=texture(64,128,(c,w,h)=>{c.fillStyle='#9cae75';c.fillRect(0,0,w,h);c.strokeStyle='#c0c994';c.lineWidth=1;c.beginPath();c.moveTo(w/2,0);c.lineTo(w/2,h);for(let y=6;y<h;y+=9){c.moveTo(w/2,y);c.lineTo(0,y+18);c.moveTo(w/2,y);c.lineTo(w,y+18);}c.stroke();});leafMaterial.needsUpdate=true;
 }
 addLibraryInstruments(root,{walnut,trim,brass,iron});
 for(const object of root.children)if(!rearPropsStart.has(object))object.position.x+=1.6;
 // A mild warm fill models bounced daylight without the previous stage's bright lamps.
 const fill=new THREE.PointLight(0xffdb9f,7,12,2);fill.position.set(-2,1,-2.5);root.add(fill);
}
