import * as THREE from 'three';
import {createLibraryRug} from './library-rug.js';
import {addLibraryInstruments} from './library-instruments.js';
import {createNixieClock} from './nixie-clock.js';
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
   const frame=createLibraryFrame(w,h,trim,brass);frame.name='错落悬挂空画框';frame.userData.frameHeight=h;frame.position.set(side*(6.35+offset),y,z);frame.rotation.set(0,side*yaw,side*offset*.08);root.add(frame);
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
 // Research console on the left: four amber readouts, knobs, meter face and cable runs.
 const machine=new THREE.Group();machine.name='落地辉光钟 · 中央侧前方';machine.position.set(-6.4,-1.995,-1.6);machine.rotation.y=Math.PI/4;root.add(machine);
 box(1.25,.8,.65,0,0,0,leather,machine);box(1.2,.72,.025,0,0,.34,iron,machine);
 const nixie=createNixieClock(random);nixie.position.set(0,.12,.39);machine.add(nixie);
 root.userData.update=time=>nixie.userData.update(time);
 for(let i=0;i<7;i++){const knob=cylinder(.035,.035,.04,-.5+i*.16,-.22,.39,brass,machine);knob.rotation.x=Math.PI/2;}
 // Stacked folios, rolled papers, a desk radio and a small adjustable task lamp.
 for(let pile=0;pile<5;pile++){
  const x=-1.2+pile*.55,z=-3.55+(pile%2)*.15;
  for(let i=0;i<2+pile%3;i++){
   const group=new THREE.Group();group.position.set(x,-1.27+i*.08,z);group.rotation.y=(random()-.5)*.35;root.add(group);
   box(.38,.057,.27,0,0,0,paper,group);for(const y of [-.035,.035])box(.41,.015,.29,0,y,0,pile%2?walnut:trim,group);
  }
 }
 box(.45,.32,.19,.24,-1.1,-3.85,leather);box(.29,.2,.015,.19,-1.08,-3.744,iron);
 for(let i=0;i<9;i++)box(.008,.17,.008,.07+i*.026,-1.08,-3.73,trim);
 orb(.025,.41,-1.17,-3.73,brass);
 cylinder(.15,.18,.035,-1.17,-1.28,-3.55,brass);
 bar(new THREE.Vector3(-1.17,-1.28,-3.55),new THREE.Vector3(-1.23,-.72,-3.55),.018,brass);
 bar(new THREE.Vector3(-1.23,-.72,-3.55),new THREE.Vector3(-.94,-.55,-3.55),.018,brass);
 const shade=cylinder(.08,.21,.12,-.94,-.58,-3.55,iron);shade.rotation.z=-.25;
 // A foreground leaning canvas: its landscape is relief geometry within a wooden frame.
 const painting=new THREE.Group();painting.name='前排放大山水画';painting.position.set(1.7,-1.15,-3);painting.rotation.set(-.1,-.12,0);root.add(painting);
 const landscapeMaterial=mat(0xb4af90);
 box(2.15,1.5,.07,0,0,0,leather,painting);box(2.01,1.35,.018,0,0,.045,landscapeMaterial,painting);
 const paintingFrame=createLibraryFrame(2.15,1.5,trim,brass);paintingFrame.position.z=.045;painting.add(paintingFrame);
 // Layered mountain silhouettes and a quiet river replace the placeholder bars.
 for(let layer=0;layer<5;layer++){
  const shape=new THREE.Shape();shape.moveTo(-1,-.67);
  for(let i=0;i<=60;i++){const x=-1+i/30,y=.2-layer*.14+Math.sin(x*7+layer*1.8)*.09+Math.sin(x*17+layer)*.035;shape.lineTo(x,y);}
  shape.lineTo(1,-.67);shape.closePath();
  const mountain=new THREE.Mesh(new THREE.ShapeGeometry(shape),mat([0x949980,0x7d8b73,0x657b68,0x486451,0x304e40][layer]));mountain.position.z=.06+layer*.002;painting.add(mountain);
 }
 const river=new THREE.Shape();river.moveTo(.2,-.23);river.bezierCurveTo(-.05,-.4,.5,-.45,.1,-.67);river.lineTo(.55,-.67);river.bezierCurveTo(.65,-.45,.05,-.35,.24,-.23);
 const waterPainting=new THREE.Mesh(new THREE.ShapeGeometry(river),mat(0x929e8b));waterPainting.position.z=.073;painting.add(waterPainting);
 for(const x of [-.75,.75])bar(new THREE.Vector3(x,-.7,-.02),new THREE.Vector3(x,-1.2,-.38),.018,walnut,painting);
 for(let i=0;i<4;i++){
  const group=new THREE.Group();group.position.set(-3.8+i*2.4,-2.15,-4.9+(i%2)*1.3);group.rotation.y=random()*.8;root.add(group);
  box(.42,.4,.42,0,0,0,trim,group);for(const x of [-.16,.16])box(.025,.4,.025,x,0,.225,brass,group);box(.13,.035,.025,0,.15,.23,brass,group);
 }
 // Low open shelving with leather scrolls, books and a draped travel trunk.
 const shelf=new THREE.Group();shelf.name='右侧矮书架 · 牛皮卷轴与书本';shelf.position.set(4.7,-2.35,-4.3);root.add(shelf);
 for(const x of [-.67,.67])box(.08,1.15,.48,x,.575,0,walnut,shelf);
 for(const y of [.08,.57,1.12])box(1.42,.065,.52,0,y,0,trim,shelf);
 for(let i=0;i<9;i++){const book=new THREE.Group();book.position.set(-.55+i*.105,.64,.04);book.rotation.z=(i%3-1)*.08;shelf.add(book);box(.085,.28+(i%3)*.045,.31,0,.14,0,i%2?walnut:leather,book);for(const y of [.05,.23])box(.065,.009,.009,0,y,.163,brass,book);}
 for(let i=0;i<5;i++){
  const scroll=cylinder(.055,.055,.4,-.45+i*.22,1.23,.02,paper,shelf);scroll.rotation.x=Math.PI/2;
  const tie=new THREE.Mesh(new THREE.TorusGeometry(.057,.008,5,20),leather);tie.position.set(-.45+i*.22,1.23,.02);shelf.add(tie);
  for(const z of [-.205,.205]){const end=new THREE.Mesh(new THREE.TorusGeometry(.04,.007,5,20),trim);end.position.set(-.45+i*.22,1.23,.02+z);shelf.add(end);}
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
