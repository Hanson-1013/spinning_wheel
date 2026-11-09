import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';

// Broad front, shallow depth: proportions follow the supplied suitcase photograph.
export function createTravelTrunk(){
 const trunk=new THREE.Group();trunk.name='紫黑菱格旅行箱';
 const leather=new THREE.MeshStandardMaterial({color:0x17141d,roughness:.72});
 const brass=new THREE.MeshStandardMaterial({color:0xb49a58,metalness:.82,roughness:.3});
 const darkMetal=new THREE.MeshStandardMaterial({color:0x302b26,metalness:.7,roughness:.38});
 const stitch=new THREE.MeshStandardMaterial({color:0x70654f,roughness:.85});
 function panelTexture(width=.48,height=.816){
  const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=Math.round(1024*height/width);
  const ctx=canvas.getContext('2d');ctx.fillStyle='#36233f';ctx.fillRect(0,0,canvas.width,canvas.height);
  const sx=canvas.width/(width/.48),sy=sx*1.7;
  for(let row=-2;row<canvas.height/sy+2;row++)for(let col=-2;col<canvas.width/sx+2;col++){
   const x=col*sx+(row%2)*sx/2,y=row*sy/2;
   ctx.beginPath();ctx.moveTo(x,y-sy/2);ctx.lineTo(x+sx/2,y);ctx.lineTo(x,y+sy/2);ctx.lineTo(x-sx/2,y);ctx.closePath();
   ctx.fillStyle=row%2===0?'#392641':'#15131c';ctx.fill();ctx.strokeStyle='#49314e';ctx.lineWidth=1.5;ctx.stroke();
  }
  // Deterministic fine leather grain, with no external image dependency.
  let seed=71;for(let i=0;i<55000;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const x=seed%canvas.width;seed=(Math.imul(seed,1664525)+1013904223)>>>0;const y=seed%canvas.height;ctx.fillStyle=i%2?'#ffffff09':'#00000016';ctx.fillRect(x,y,1,1);}
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;texture.wrapS=texture.wrapT=THREE.RepeatWrapping;return texture;
 }
 const patterned=new THREE.MeshStandardMaterial({map:panelTexture(),roughness:.78});
 function box(w,h,d,x,y,z,material,r=.015){const mesh=new THREE.Mesh(new RoundedBoxGeometry(w,h,d,3,r),material);mesh.position.set(x,y,z);trunk.add(mesh);return mesh;}
 // Two hollow shells meet at the depth centre (z=0).
 function shellPanel(w,h,d,x,y,z){
  const mesh=box(w,h,d,x,y,z,patterned,.012);
  const geometry=mesh.geometry,positions=geometry.attributes.position,uv=geometry.attributes.uv;
  for(const face of geometry.groups)for(let i=face.start;i<face.start+face.count;i++){
   const vertex=geometry.index?geometry.index.getX(i):i;
   const px=positions.getX(vertex)+x,py=positions.getY(vertex)+y,pz=positions.getZ(vertex)+z;
   let u=px+1.4,v=py+.925;
   switch(face.materialIndex){
    case 0:u=2.8+(.39-pz);break;
    case 1:u=-(.39-pz);break;
    case 2:v=1.85+(.39-pz);break;
    case 3:v=-(.39-pz);break;
    case 5:u=2.8+.78+(1.4-px);break;
   }
   uv.setXY(vertex,u/.48,v/.816);
  }
  uv.needsUpdate=true;
 }
 const lining=new THREE.MeshStandardMaterial({color:0x302337,roughness:1});
 for(const sign of [-1,1]){
  shellPanel(2.8,1.85,.045,0,0,sign*.3675);
  for(const x of [-1.378,1.378])shellPanel(.044,1.85,.345,x,0,sign*.1825);
  for(const y of [-.903,.903])shellPanel(2.712,.044,.345,0,y,sign*.1825);
  box(2.706,1.756,.012,0,0,sign*.339,lining,.005);
  for(const x of [-1.348,1.348])box(.012,1.75,.32,x,0,sign*.175,lining,.004);
  for(const y of [-.873,.873])box(2.68,.012,.32,0,y,sign*.175,lining,.004);
  // Separate leather rims, leaving a narrow visible opening seam.
  const z=sign*.012;
  for(const y of [-.908,.908])box(2.77,.035,.018,0,y,z,leather,.004);
  for(const x of [-1.383,1.383])box(.035,1.79,.018,x,0,z,leather,.004);
 }
 // Photo reference: folded brass corners with scalloped, leaf-like lobes.
 const patinaCanvas=document.createElement('canvas');patinaCanvas.width=patinaCanvas.height=128;
 const patinaContext=patinaCanvas.getContext('2d');patinaContext.fillStyle='#b39b68';patinaContext.fillRect(0,0,128,128);
 let grain=93;for(let i=0;i<3500;i++){grain=(Math.imul(grain,1664525)+1013904223)>>>0;const px=grain%128;grain=(Math.imul(grain,1664525)+1013904223)>>>0;const py=grain%128;patinaContext.fillStyle=i%3?'#30271a18':'#eee2bc30';patinaContext.fillRect(px,py,i%7===0?4:1,1);}
 const patina=new THREE.CanvasTexture(patinaCanvas);patina.colorSpace=THREE.SRGBColorSpace;patina.wrapS=patina.wrapT=THREE.RepeatWrapping;
 const cornerBrass=new THREE.MeshStandardMaterial({map:patina,metalness:.78,roughness:.46,side:THREE.DoubleSide});
 const outline=new THREE.Shape();outline.moveTo(0,0);outline.lineTo(.35,0);
 outline.bezierCurveTo(.335,.055,.29,.087,.24,.079);
 outline.bezierCurveTo(.19,.072,.145,.044,.105,.053);
 outline.bezierCurveTo(.085,.059,.087,.086,.108,.105);
 outline.bezierCurveTo(.16,.14,.183,.176,.163,.205);
 outline.bezierCurveTo(.111,.213,.079,.185,.065,.153);
 outline.bezierCurveTo(.047,.174,.049,.215,.067,.242);
 outline.bezierCurveTo(.073,.28,.043,.32,0,.35);outline.closePath();
 const cornerGeometry=new THREE.ExtrudeGeometry(outline,{depth:.006,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.0025,bevelThickness:.002,curveSegments:12});
 const axis=(x,y,z)=>new THREE.Vector3(x,y,z);
 for(const z of [-.398,.398]){
  for(const x of [-1.365,1.365])box(.045,1.77,.02,x,0,z,leather,.008);
  for(const y of [-.892,.892])box(2.72,.045,.02,0,y,z,leather,.008);
  for(const sx of [-1,1])for(const sy of [-1,1]){
   const sz=Math.sign(z),corner=new THREE.Group();corner.name='叶形黄铜折边护角';// Clear the raised front piping (outer z=0.408), including bevel depth.
   corner.position.set(sx*1.406,sy*.931,sz*.414);corner.scale.setScalar(.68);trunk.add(corner);
   function plate(u,v,n){
    const geometry=cornerGeometry.clone();geometry.applyMatrix4(new THREE.Matrix4().makeBasis(u,v,n));
    const mesh=new THREE.Mesh(geometry,cornerBrass);mesh.name='同形叶片包角面';corner.add(mesh);
    for(const [a,b] of [[.275,.031],[.025,.277],[.117,.157]]){
     const rivet=new THREE.Mesh(new THREE.SphereGeometry(.012,12,8),darkMetal);
     rivet.position.copy(u).multiplyScalar(a).addScaledVector(v,b).addScaledVector(n,.012);
     rivet.quaternion.setFromUnitVectors(axis(0,0,1),n);rivet.scale.z=.45;corner.add(rivet);
     const head=new THREE.Mesh(new THREE.SphereGeometry(.0075,10,8),brass);head.position.copy(rivet.position).addScaledVector(n,.004);head.scale.z=.45;head.quaternion.copy(rivet.quaternion);corner.add(head);
    }
   }
   plate(axis(-sx,0,0),axis(0,-sy,0),axis(0,0,sz));
   plate(axis(0,0,-sz),axis(0,-sy,0),axis(sx,0,0));
   plate(axis(-sx,0,0),axis(0,0,-sz),axis(0,sy,0));
   // The same leaf plate wraps all three faces; each shared edge has a rolled fold.
   for(const direction of [axis(-sx,0,0),axis(0,-sy,0),axis(0,0,-sz)]){
    const fold=new THREE.Mesh(new THREE.CylinderGeometry(.006,.006,.347,12),brass);
    fold.position.copy(direction).multiplyScalar(.1735);
    fold.quaternion.setFromUnitVectors(axis(0,1,0),direction);corner.add(fold);
   }
  }
 }
 cornerGeometry.dispose();
 const clasps=[],releases=[];
 // Hinged brass tongues bridge the centre seam and seat in lid receivers.
 for(const x of [-.88,.88]){
  box(.225,.022,.19,x,.939,.15,brass,.016);
  box(.12,.024,.085,x,.94,-.075,brass,.012);
  const clasp=new THREE.Group();clasp.name=x<0?'左黄铜活动扣':'右黄铜活动扣';clasp.position.set(x,.962,-.10);trunk.add(clasp);
  const tongue=box(.065,.014,.23,x,.962,.015,brass,.007);
  const tip=box(.095,.019,.045,x,.97,.125,brass,.009);
  trunk.updateMatrixWorld(true);clasp.attach(tongue);clasp.attach(tip);clasps.push(clasp);
  const axle=new THREE.Mesh(new THREE.CylinderGeometry(.016,.016,.12,20),brass);axle.rotation.z=Math.PI/2;axle.position.set(x,.962,-.10);trunk.add(axle);
  const release=box(.045,.012,.028,x,.957,.215,brass,.005);releases.push(release);
  const hole=new THREE.Mesh(new THREE.CylinderGeometry(.023,.023,.004,24),darkMetal);hole.position.set(x, .952,.17);trunk.add(hole);
  box(.015,.005,.038,x,.953,.186,darkMetal,.002);
  for(const dx of [-.085,.085]){const screw=new THREE.Mesh(new THREE.SphereGeometry(.008,12,8),brass);screw.scale.y=.3;screw.position.set(x+dx,.953,.15);trunk.add(screw);}
 }
 // Raised black leather handle and its folded mounting tabs.
 for(const x of [-.42,.42]){
  box(.19,.032,.22,x,.948,-.015,leather,.025);
  box(.11,.032,.13,x,.972,-.015,darkMetal,.015);
  const pin=new THREE.Mesh(new THREE.SphereGeometry(.023,12,8),brass);pin.scale.y=.35;pin.position.set(x,.995,-.015);trunk.add(pin);
 }
 const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(-.42,.98,-.015),new THREE.Vector3(-.32,1.09,-.015),new THREE.Vector3(0,1.12,-.015),new THREE.Vector3(.32,1.09,-.015),new THREE.Vector3(.42,.98,-.015)]);
 const handle=new THREE.Mesh(new THREE.TubeGeometry(curve,32,.045,8,false),leather);handle.scale.z=1.5;trunk.add(handle);
 // Parallel stitches emphasize the depth and the narrow opening on either end.
 for(const x of [-1.405,1.405])for(const z of [-.052,.052])for(let y=-.77;y<.8;y+=.055)box(.004,.024,.005,x,y,z,stitch,.001);
 for(const x of [-.85,.85])box(.25,.035,.13,x,-.945,-.12,leather,.018);
 // The front half swings about a real hinge along the lower centre seam.
 const lid=new THREE.Group();lid.name='可开合箱盖';lid.position.set(0,-.925,0);trunk.add(lid);
 trunk.updateMatrixWorld(true);
 for(const child of [...trunk.children])if(child!==lid&&child.position.z>0)lid.attach(child);
 for(const x of [-.92,.92]){
  const hinge=new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,.27,16),brass);
  hinge.rotation.z=Math.PI/2;hinge.position.set(x,-.932,0);trunk.add(hinge);
 }
 // One reversible timeline enforces: release -> flip clasps -> swing lid.
 // Reversing mid-motion follows the same path, so clasps cannot close on an open lid.
 let target=0,progress=0,lastTime;
 const smooth=(value)=>THREE.MathUtils.smoothstep(value,0,1);
 trunk.userData.setOpen=(open)=>{target=open?1:0;};
 trunk.userData.setOpenAmount=(amount)=>{target=THREE.MathUtils.clamp(amount,0,1);};
 trunk.userData.update=(time)=>{
  const dt=lastTime===undefined?0:Math.min(.05,Math.max(0,time-lastTime));lastTime=time;
  progress=THREE.MathUtils.clamp(progress+Math.sign(target-progress)*Math.min(Math.abs(target-progress),dt/1.65),0,1);
  const release=smooth(progress/.08),flip=smooth((progress-.08)/.22);
  for(const clasp of clasps)clasp.rotation.x=-Math.PI*flip;
  for(const button of releases)button.position.z=.215+.014*release;
  lid.rotation.x=THREE.MathUtils.degToRad(110)*smooth((progress-.32)/.68);
 };
 return trunk;
}
