import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';

export function createLibraryServer(){
 const root=new THREE.Group();root.name='半高服务器机柜 · 三列机架与线缆';
 const metal=(color,roughness=.5)=>new THREE.MeshStandardMaterial({color,metalness:.65,roughness});
 const frame=metal(0x303936),face=metal(0x48514c),black=metal(0x141c19,.7),steel=metal(0x82887e),copper=metal(0x8c6544);
 const ledColors=[new THREE.Color(.16,2.2,.07),new THREE.Color(2.2,.8,.08),new THREE.Color(.08,.65,2.2)],leds=ledColors.map(color=>new THREE.MeshBasicMaterial({color,toneMapped:false,transparent:true,opacity:.9}));
 const columns=[-1,0,1],centers=columns.map(column=>column*.905);
 const boxGeometry=new THREE.BoxGeometry(1,1,1);
 function box(w,h,d,x,y,z,material=frame){const o=new THREE.Mesh(boxGeometry,material);o.scale.set(w,h,d);o.position.set(x,y,z);root.add(o);return o;}
 function cable(points,r=.005,material=black){const o=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),24,r,5,false),material);root.add(o);return o;}
 function ring(r,t,x,y,z,material=steel){const o=new THREE.Mesh(new THREE.TorusGeometry(r,t,5,28),material);o.position.set(x,y,z);root.add(o);return o;}
 function screw(x,y,z){const o=new THREE.Mesh(new THREE.CylinderGeometry(.005,.005,.005,8),steel);o.rotation.x=Math.PI/2;o.position.set(x,y,z);root.add(o);box(.006,.001,.001,x,y,z+.003,black);}
 const width=2.765,height=1.85;
 box(width,.065,.73,0,.065,0);box(width,.055,.73,0,1.8225,0);
 for(const x of [-1.3475,-.4525,.4525,1.3475])for(const z of [-.325,.325])box(.035,1.76,.035,x,.93,z);
 for(const x of centers.flatMap(x=>[x-.3975,x+.3975])){
  box(.028,1.65,.035,x,.93,.302,steel);
  for(let i=0;i<35;i++)box(.009,.009,.002,x,.14+i*.045,.322,black);
 }
 for(const x of [-1.15,1.15])for(const z of [-.26,.26]){box(.11,.04,.11,x,.02,z,black);}
 // Ten stacked units per column: storage sleds interspersed with patch/switch panels.
 for(const column of columns)for(let row=0;row<10;row++){
  const cx=column*.905,wireSide=column===-1?-1:1,y=.18+row*.157;
  box(.76,.133,.58,cx,y,-.005,black);box(.76,.126,.016,cx,y,.295,face);
  for(const sign of [-1,1]){box(.014,.075,.026,cx+sign*.35,y,.32,steel);screw(cx+sign*.365,y+.045,.31);screw(cx+sign*.365,y-.045,.31);}
  if(row%3!==2){
   for(let disk=0;disk<5;disk++){
    const x=cx-.263+disk*.131;box(.116,.076,.012,x,y,.31,black);box(.102,.061,.007,x,y,.32,frame);
    box(.068,.006,.008,x,y+.013,.329,steel);box(.009,.037,.011,x-.043,y,.33,steel);
    for(let vent=0;vent<4;vent++)box(.052,.002,.002,x+.008,y-.007-vent*.006,.326,black);
    box(.006,.006,.004,x+.039,y-.023,.331,leds[(disk+row)%3]);
   }
  }else{
   for(let port=0;port<12;port++){
    const x=cx-.29+port*.05;box(.036,.028,.009,x,y+.014,.314,black);box(.029,.003,.002,x,y+.026,.321,steel);
    box(.006,.004,.003,x-.014,y-.011,.324,leds[port%3]);
    if(port%3===0){box(.027,.018,.025,x,y+.014,.336,black);cable([[x,y+.014,.349],[x,y-.05,.38],[cx+wireSide*.38,y-.1,.395],[cx+wireSide*.39,.17+port*.007,.35]],.0035,port%2?copper:black);}
   }
   box(.31,.008,.004,cx,y-.035,.322,steel);
  }
 }
 // Side ventilation, rear fans and port/PSU service detail.
 for(const side of [-1,1]){
  box(.012,1.62,.58,side*1.37,.93,0,frame);
  for(let i=0;i<27;i++)box(.003,.007,.4,side*1.378,.25+i*.049,0,black);
 }
 for(const x of centers){
  for(const y of [.42,.91,1.4]){
   box(.68,.4,.016,x,y,-.306,face);
   for(const offset of [-.15,.15]){
    ring(.102,.004,x+offset,y,-.32,black);for(let j=1;j<=5;j++)ring(j*.017,.0018,x+offset,y,-.323,steel);
    for(let spoke=0;spoke<4;spoke++){const a=spoke*Math.PI/2;cable([[x+offset,y,-.325],[x+offset+Math.cos(a)*.1,y+Math.sin(a)*.1,-.325]],.002,black);}
   }
  }
  box(.14,.048,.013,x,1.7,-.319,black);
  cable([[x,1.7,-.33],[x+.12,1.65,-.4],[x+.14,.45,-.43],[x+.3,.08,-.4]],.008,black);
 }
 for(let i=0;i<10;i++){const x=-.7+i*.155;cable([[x,1.69,-.12],[x,1.76,.08],[x+.05,1.76,.22],[x+.08,1.61,.3]],.004,i%3?black:copper);}
 // Soft local spill makes the indicator glow visible on nearby metal, without shadows.
 const spill=[];
 for(const [i,x]of centers.entries()){
  const light=new THREE.PointLight(0x6bdc72,.35,.85,2);light.position.set(x,.92,.44);root.add(light);spill.push(light);
  for(const y of [.31,.94,1.56])box(.012,.022,.006,x-.325,y,.329,leds[(i+Math.round(y*3))%3]);
 }
 // Small asset-label plates and grille divisions.
 for(const x of centers){box(.12,.025,.003,x,1.76,.365,steel);for(let i=0;i<7;i++)box(.002,.014,.002,x-.045+i*.013,1.76,.368,black);}
 root.updateMatrixWorld(true);const batches=new Map();root.traverse(o=>{if(!o.isMesh)return;if(!batches.has(o.material))batches.set(o.material,[]);batches.get(o.material).push(o);});
 for(const [material,objects]of batches){const copies=objects.map(o=>(o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone()).applyMatrix4(o.matrixWorld));const geometry=mergeGeometries(copies,false);copies.forEach(g=>g.dispose());if(!geometry)continue;const mesh=new THREE.Mesh(geometry,material);mesh.name='服务器精细合批部件';mesh.castShadow=true;mesh.receiveShadow=true;root.add(mesh);objects.forEach(o=>o.removeFromParent());}
 root.userData.update=t=>{leds.forEach((m,i)=>m.opacity=.65+.35*(Math.sin(t*(2.7+i*.9)+i*2)>.25?1:.35));spill.forEach((light,i)=>light.intensity=.24+.12*Math.sin(t*2+i));};root.userData.size=[width,height,.73];return root;
}
