import * as THREE from 'three';
import {createLibraryServer} from './library-server.js';
import {createRetroTowers} from './retro-towers.js';
import {createBotanicalRadio} from './botanical-radio.js';
import {createRetroComputer} from './retro-computer.js';
import {createScrollShelf,createDeskLamp,createDeskBooksAndScrolls,createDrawerCabinet} from './library-furniture.js';
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
   const frame=createLibraryFrame(w,h,trim,brass);frame.name='错落悬挂空画框';frame.userData.frameHeight=h;frame.position.set(side*(5.55+offset-w),y-1.1,z);frame.rotation.set(0,side*yaw,side*offset*.08);root.add(frame);
   // Suspension points follow the rotated frame so their fine wires stay attached.
   frame.updateMatrixWorld(true);
   for(const edge of [-1,1]){
    const anchor=new THREE.Vector3(edge*w*.32,h/2,-.02).applyMatrix4(frame.matrixWorld);
    bar(anchor,new THREE.Vector3(anchor.x,5.4,anchor.z),.003,iron);
   }
  }

 }
 // Ceiling beams and diagonal sun streaks across the floor.
 for(let i=0;i<10;i++)box(.14,.25,15,-9+i*2,5.22,.5,trim);
 // Burgundy textile with gold polyhedral embroidery and hooked border trim.
 root.add(createLibraryRug());
 const rearPropsStart=new Set(root.children);
 const towers=createRetroTowers();towers.position.set(-2.55,-2.395,-3.32);root.add(towers);
 // Research console on the left: four amber readouts, knobs, meter face and cable runs.
 const machine=createNixieConsole(random,{leather,iron,brass});machine.name='落地辉光钟 · 中央侧前方';machine.position.set(-6.4,-1.995,-1.6);machine.rotation.y=Math.PI/4;root.add(machine);
 const server=createLibraryServer();server.position.set(machine.position.x-Math.SQRT1_2,-2.395,machine.position.z-Math.SQRT1_2);server.rotation.y=machine.rotation.y;root.add(server);
 root.userData.update=time=>{machine.userData.update(time);server.userData.update(time);};
 // Stacked folios, rolled papers, a desk radio and a small adjustable task lamp.
 const computer=createRetroComputer();computer.position.set(-1.19,-1.295,-3.6);root.add(computer);
 const deskBooks=createDeskBooksAndScrolls({walnut,trim,paper});deskBooks.position.set(0,-2.35,-3.6);root.add(deskBooks);
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
  const group=new THREE.Group();group.position.set(-3.8+i*2.4,-2.15,-4.9+(i%2)*1.3);group.rotation.y=random()*.8;if(i!==2)continue;group.name='后排保留小箱子';root.add(group);
  box(.42,.4,.42,0,0,0,trim,group);for(const x of [-.16,.16])box(.025,.4,.025,x,0,.225,brass,group);box(.13,.035,.025,0,.15,.23,brass,group);
 }
 // Two shelves near the areca, each with an independent drawer cabinet in front.
 for(const [i,z] of [1.15-.4*(1.85/1.448),1.15+.4*(1.85/1.448)].entries()){
  const shelf=createScrollShelf({walnut,trim,brass,paper,leather},{variation:i});shelf.position.set(4.05,-2.395,z);shelf.rotation.y=-Math.PI/2;root.add(shelf);
  const cabinet=createDrawerCabinet({walnut,trim,brass,paper});
  for(const child of [...cabinet.children])if(child.name==='柜顶书本'||child.name==='柜顶绿植')cabinet.remove(child);
  cabinet.name='右侧书架前独立抽屉柜';cabinet.position.set(3.474,-2.395,1.15+(i-.5)*.712);cabinet.rotation.y=-Math.PI/2;root.add(cabinet);
 }
 const silkGroup=new THREE.Group();silkGroup.name='双抽屉柜上 · 珊瑚色斜搭丝绸';silkGroup.position.set(3.474,-2.395,1.15);root.add(silkGroup);
 const silkMaterial=new THREE.MeshPhysicalMaterial({color:0xc7796b,roughness:.42,metalness:0,sheen:.85,sheenColor:0xf1b1a0,sheenRoughness:.52,side:THREE.DoubleSide});
 const silkGeometry=new THREE.PlaneGeometry(.85,1.42,70,90),silkPositions=silkGeometry.attributes.position;
 for(let i=0;i<silkPositions.count;i++){
  const u=silkPositions.getX(i),v=silkPositions.getY(i),x=u*Math.cos(.12)-v*Math.sin(.12),z=u*Math.sin(.12)+v*Math.cos(.12);
  const over=Math.max(0,Math.abs(x)-.265),fold=Math.sin(z*25)*.009+Math.sin(z*43+1)*.004;
  // The two equal-height cabinet tops support a single continuous cloth.
  const sag=0;
  silkPositions.setXYZ(i,Math.sign(x)*(Math.min(Math.abs(x),.265)+Math.min(over,.035)),.96-over*.95-sag+fold*Math.min(1,over*12),z);
 }
 silkGeometry.computeVertexNormals();const silk=new THREE.Mesh(silkGeometry,silkMaterial);silk.castShadow=true;silk.receiveShadow=true;silkGroup.add(silk);
 // Two floor book stacks tucked beside the drawer cabinet, clear of the areca pot.
 for(let pile=0;pile<2;pile++){
  const stack=new THREE.Group();stack.name='右侧角落落地书堆';stack.position.set(3.02+pile*.36,-2.395,1.99+pile*.08);stack.rotation.y=pile?-.12:.09;root.add(stack);
  for(let i=0;i<(pile?5:8);i++){
   const book=new THREE.Group();book.position.set(Math.sin(i*2.3)*.012,.022+i*.046,0);book.rotation.y=Math.sin(i+pile)*.065;stack.add(book);
   box(.29,.034,.22,0,0,0,paper,book);
   for(const y of [-.02,.02])box(.315,.006,.235,0,y,0,(i+pile)%2?walnut:leather,book);
   box(.012,.044,.235,-.151,0,0,trim,book);
  }
 }
 // Laboratory flasks stand on the silk, with sealed liquid volumes and flat menisci.
 const glass=new THREE.MeshPhysicalMaterial({color:0xe6f6ee,transparent:true,opacity:.29,roughness:.08,metalness:0,clearcoat:1,side:THREE.DoubleSide,depthWrite:false});
 const flaskProfile=[[.001,.004],[.063,.004],[.076,.013],[.079,.028],[.073,.055],[.03,.16],[.021,.19],[.021,.265],[.026,.269],[.026,.278],[.017,.278],[.017,.194],[.026,.163],[.069,.052],[.074,.027],[.069,.014],[.001,.012]].map(([r,y])=>new THREE.Vector2(r,y));
 for(let i=0;i<4;i++){
  const flask=new THREE.Group();flask.name=i%2?'蓝色液体锥形瓶':'绿色液体锥形瓶';flask.position.set(3.474+[-.09,.09,-.085,.095][i],-1.433,1.15+[-.13,-.09,.065,.085][i]);flask.scale.setScalar([1,.83,1.12,.91][i]);root.add(flask);
  const shell=new THREE.Mesh(new THREE.LatheGeometry(flaskProfile,32),glass);shell.renderOrder=3;flask.add(shell);
  const fill=.075+(i%3)*.017,topRadius=.069-(fill-.052)*.42;
  const liquidMaterial=new THREE.MeshPhysicalMaterial({color:i%2?0x093765:0x0b4930,transparent:true,opacity:.94,roughness:.16,clearcoat:1});
  const liquid=new THREE.Mesh(new THREE.LatheGeometry([new THREE.Vector2(0,.014),new THREE.Vector2(.067,.014),new THREE.Vector2(.072,.028),new THREE.Vector2(.069,.052),new THREE.Vector2(topRadius,fill),new THREE.Vector2(0,fill)],32),liquidMaterial);liquid.renderOrder=2;flask.add(liquid);
  for(let mark=0;mark<3;mark++){const line=new THREE.Mesh(new THREE.BoxGeometry(.011,.0015,.001),new THREE.MeshBasicMaterial({color:0xdbe5dc}));line.position.set(.012,.06+mark*.023,.07-mark*.009);flask.add(line);}
 }
 // Procedural surface detail: worn timber grain, book spine tooling, leaf veins.
 if(typeof document!=='undefined'){
  function texture(w,h,paint){const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;const c=canvas.getContext('2d');paint(c,w,h);const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;return map;}
  stone.color.setHex(0x4e4941);
  stone.map=texture(128,128,(c,w,h)=>{c.fillStyle='#b4aca0';c.fillRect(0,0,w,h);for(let i=0;i<16000;i++){const tone=100+Math.floor(random()*80);c.fillStyle=`rgba(${tone},${tone},${tone},.16)`;c.fillRect(random()*w,random()*h,2,2);}});stone.map.wrapS=stone.map.wrapT=THREE.RepeatWrapping;stone.map.repeat.set(1,1);stone.bumpMap=stone.map;stone.bumpScale=.0018;stone.roughness=.47;stone.needsUpdate=true;
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
