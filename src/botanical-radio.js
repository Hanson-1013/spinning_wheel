import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';

export function createBotanicalRadio(){
 const root=new THREE.Group();root.name='绿色复古无线电 · 蓝紫花饰';
 const enamel=new THREE.MeshPhysicalMaterial({color:0x59765a,roughness:.38,clearcoat:.4,clearcoatRoughness:.3}),rim=new THREE.MeshStandardMaterial({color:0x918267,metalness:.75,roughness:.38}),dark=new THREE.MeshStandardMaterial({color:0x263d32,roughness:.7}),ivory=new THREE.MeshStandardMaterial({color:0xc1b596,roughness:.85});
 const box=(w,h,d,x,y,z,m=enamel,r=.008)=>{const o=new THREE.Mesh(new RoundedBoxGeometry(w,h,d,3,r),m);o.position.set(x,y,z);root.add(o);return o;};
 const ring=(r,t,x,y,z,m=rim)=>{const o=new THREE.Mesh(new THREE.TorusGeometry(r,t,6,48),m);o.position.set(x,y,z);root.add(o);return o;};
 function rod(a,b,r=.002,m=rim){const p=new THREE.Vector3(...a),q=new THREE.Vector3(...b),d=q.clone().sub(p),o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,d.length(),10),m);o.position.copy(p).add(q).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());root.add(o);return o;}
 box(.45,.326,.19,0,.191,0);box(.458,.048,.197,0,.058,0,enamel,.012);
 for(const x of [-.16,.16])box(.033,.02,.048,x,.016,0,dark,.006);
 for(const x of [-.211,.211])rod([x,.071,.099],[x,.324,.099],.0025);
 box(.459,.008,.2,0,.092,0,rim,.003);
 // Recessed ivory dial with two concentric brass rims, ticks and tiny glyphs.
 const dial=new THREE.Mesh(new THREE.CircleGeometry(.093,64),ivory);dial.position.set(.024,.205,.104);root.add(dial);ring(.098,.005,.024,.205,.107);ring(.086,.0015,.024,.205,.11);
 for(let i=0;i<40;i++){
  const a=i*Math.PI/20,r=.078;rod([.024+Math.cos(a)*r,.205+Math.sin(a)*r,.111],[.024+Math.cos(a)*(r-(i%5===0?.008:.0035)),.205+Math.sin(a)*(r-(i%5===0?.008:.0035)),.111],i%5===0?.00085:.0005,dark);
  if(i%5===0){const cx=.024+Math.cos(a)*.067,cy=.205+Math.sin(a)*.067;rod([cx-.003,cy-.002,.111],[cx,cy+.004,.111],.0006,dark);rod([cx,cy+.004,.111],[cx+.003,cy-.002,.111],.0006,dark);}
 }
 const pointer=new THREE.Shape();pointer.moveTo(0,.039);pointer.lineTo(-.023,-.012);pointer.lineTo(.023,-.012);pointer.closePath();const triangle=new THREE.Mesh(new THREE.ShapeGeometry(pointer),rim);triangle.position.set(.024,.205,.114);root.add(triangle);rod([.024,.165,.116],[.024,.253,.116],.001,dark);
 ring(.004,.0015,.024,.205,.117,dark);
 for(let j=0;j<4;j++)box(.064,.004,.003,.157,.194+j*.011,.103,dark,.001);
 for(const x of [-.098,.135]){ring(.009,.0018,x,.112,.104);const o=new THREE.Mesh(new THREE.CircleGeometry(.006,16),dark);o.position.set(x,.112,.106);root.add(o);}
 ring(.01,.003,-.163,.303,.102);const button=new THREE.Mesh(new THREE.CircleGeometry(.005,16),ivory);button.position.set(-.163,.303,.104);root.add(button);
 // Handle, ribbed tuning knob and telescopic aerial.
 const handle=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(-.12,.353,0),new THREE.Vector3(-.08,.386,0),new THREE.Vector3(.06,.386,0),new THREE.Vector3(.11,.353,0)]),24,.005,8,false),dark);root.add(handle);
 const knob=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,.024,32),rim);knob.rotation.z=Math.PI/2;knob.position.set(-.236,.213,0);root.add(knob);
 for(let i=0;i<24;i++){const a=i*Math.PI/12;rod([-.251,.213+Math.cos(a)*.03,Math.sin(a)*.03],[-.225,.213+Math.cos(a)*.03,Math.sin(a)*.03],.001,dark);}
 rod([-.19,.34,-.035],[.14,.49,-.035],.0025);rod([.14,.49,-.035],[.2,.517,-.035],.0015);
 // Draping lanceolate leaves and a layered blue-violet flower.
 const leafMat=new THREE.MeshPhysicalMaterial({color:0x204c35,side:THREE.DoubleSide,roughness:.5,clearcoat:.22});
 function leaf(base,length,width,angle,phase){const g=new THREE.PlaneGeometry(1,1,6,18),p=g.attributes.position;for(let i=0;i<p.count;i++){const t=p.getY(i)+.5,u=p.getX(i)*2;p.setXYZ(i,u*width*Math.pow(Math.sin(Math.PI*t),.7),t*length,.018*Math.sin(t*Math.PI)-.06*t*t+.008*u*u);}g.computeVertexNormals();const o=new THREE.Mesh(g,leafMat);o.position.set(...base);o.rotation.set(.15,phase,angle);root.add(o);}
 leaf([.17,.28,.07],.22,.035,-.6,.3);leaf([.17,.28,.08],.2,.032,1.3,-.2);leaf([.17,.28,.09],.28,.027,2.65,.25);leaf([.17,.28,.07],.22,.034,3.8,-.4);leaf([.17,.29,.06],.2,.03,-1.7,.2);
 const flower=new THREE.Group();flower.position.set(.207,.329,.11);flower.rotation.z=-.3;root.add(flower);
 for(let layer=0;layer<2;layer++)for(let i=0;i<9;i++){
  const a=(i/9+layer*.055)*Math.PI*2,g=new THREE.SphereGeometry(1,12,8),m=new THREE.MeshStandardMaterial({color:[0x514b9d,0x7778cb,0xa6ace2][(i+layer)%3],roughness:.65});
  const petal=new THREE.Mesh(g,m);petal.scale.set(.012,.033-layer*.005,.0035);petal.position.set(Math.sin(a)*.025,Math.cos(a)*.025,layer*.004);petal.rotation.z=-a;flower.add(petal);
 }
 const center=new THREE.Mesh(new THREE.SphereGeometry(.009,16,10),new THREE.MeshStandardMaterial({color:0x34324d,roughness:.85}));center.position.z=.009;flower.add(center);
 root.scale.setScalar(.8);
 return root;
}
