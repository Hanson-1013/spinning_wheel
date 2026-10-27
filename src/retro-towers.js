import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';

export function createRetroTowers(){
 const root=new THREE.Group();root.name='双台复古电脑主机';
 const shell=new THREE.MeshStandardMaterial({color:0x99978a,roughness:.85}),panel=new THREE.MeshStandardMaterial({color:0xb0ab98,roughness:.82}),dark=new THREE.MeshStandardMaterial({color:0x303832,roughness:.75}),metal=new THREE.MeshStandardMaterial({color:0x706e60,metalness:.55,roughness:.5});
 const indicator=new THREE.MeshBasicMaterial({color:0x9b9c61});
 function box(parent,w,h,d,x,y,z,m=shell,r=.003){const o=new THREE.Mesh(new RoundedBoxGeometry(w,h,d,2,r),m);o.position.set(x,y,z);parent.add(o);return o;}
 function screw(parent,x,y,z){const o=new THREE.Mesh(new THREE.CylinderGeometry(.004,.004,.003,8),metal);o.rotation.x=Math.PI/2;o.position.set(x,y,z);parent.add(o);box(parent,.004,.0007,.001,x,y,z+.002,dark,.0001);}
 for(let i=0;i<2;i++){
  const tower=new THREE.Group();tower.name=i?'右侧老式电脑主机':'左侧老式电脑主机';tower.position.set((i-.5)*.385,0,i?.018:0);tower.rotation.y=i?-.04:.035;root.add(tower);
  box(tower,.355,.63,.48,0,.338,0,shell,.009);box(tower,.335,.603,.018,0,.338,.247,panel,.006);
  // Inset drive bay stack with front bezels, floppy slot, eject and status light.
  for(let drive=0;drive<2;drive++){
   const y=.55-drive*.082;box(tower,.265,.068,.007,0,y,.26,shell);box(tower,.231,.043,.004,-.006,y,.266,panel);
   box(tower,drive?.14:.19,.006,.005,-.018,y+.004,.27,dark,.001);
   box(tower,.018,.012,.006,.095,y-.013,.272,metal,.001);
   box(tower,.007,.003,.003,-.106,y-.016,.272,indicator,.0005);
  }
  // Lower access panel, power/reset buttons, lock and vertical vent grille.
  box(tower,.235,.205,.005,-.015,.286,.26,shell);box(tower,.195,.15,.003,-.015,.286,.265,panel);
  box(tower,.024,.032,.007,-.113,.148,.268,dark);box(tower,.014,.014,.005,-.113,.193,.268,metal);
  for(let vent=0;vent<12;vent++)box(tower,.076,.003,.003,.068,.13+vent*.007,.271,dark,.0005);
  for(const x of [-.147,.147])for(const y of [.065,.61])screw(tower,x,y,.259);
  for(let vent=0;vent<15;vent++)box(tower,.0015,.058,.004,-.179,.49,-.16+vent*.014,dark,.0004);
  // Back panel with PSU fan, mains socket, ports and expansion slots.
  box(tower,.30,.57,.006,0,.34,-.245,metal);
  const fan=new THREE.Mesh(new THREE.TorusGeometry(.064,.003,5,36),dark);fan.position.set(.045,.53,-.25);tower.add(fan);
  for(let ring=1;ring<5;ring++){const grille=new THREE.Mesh(new THREE.TorusGeometry(ring*.012,.0015,4,32),dark);grille.position.set(.045,.53,-.25);tower.add(grille);}
  box(tower,.052,.03,.005,-.092,.55,-.251,dark);
  for(let port=0;port<5;port++){box(tower,.055,.019,.007,-.085,.42-port*.04,-.252,dark);for(let pin=0;pin<5;pin++)box(tower,.002,.002,.001,-.104+pin*.009,.42-port*.04,-.257,metal,.0001);}
  for(let slot=0;slot<5;slot++)box(tower,.13,.018,.004,.04,.25-slot*.025,-.251,dark);
  for(const x of [-.12,.12])for(const z of [-.17,.17])box(tower,.045,.022,.055,x,.012,z,dark,.005);
  // Fine removable side-panel seam.
  for(const x of [-.179,.179]){box(tower,.001,.48,.002,x,.31,.182,metal,.0003);box(tower,.001,.002,.35,x,.072,0,metal,.0003);}
 }
 // Compact external drive / peripheral, resting diagonally across the tower tops.
 const device=new THREE.Group();device.name='顶部斜放外接装置';device.position.set(.055,.657,.025);device.rotation.y=-Math.PI/7;root.add(device);
 box(device,.34,.105,.23,0,.058,0,shell,.008);
 box(device,.342,.014,.232,0,.014,0,dark,.003);
 box(device,.342,.009,.232,0,.106,0,panel,.003);
 box(device,.322,.086,.008,0,.058,.12,dark,.003);
 box(device,.237,.019,.006,-.015,.068,.126,metal,.001);
 box(device,.207,.006,.004,-.021,.068,.13,dark,.0005);
 box(device,.022,.014,.008,.124,.039,.128,panel,.002);
 box(device,.008,.004,.003,.097,.082,.13,indicator,.0005);
 for(let i=0;i<11;i++)box(device,.0015,.031,.003,-.172,.063,-.077+i*.014,dark,.0003);
 for(const x of [-.142,.142])screw(device,x,.094,.127);
 box(device,.074,.022,.007,.065,.055,-.12,dark,.001);
 const cable=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(.065,.055,-.123),new THREE.Vector3(.14,.045,-.22),new THREE.Vector3(.2,-.07,-.28),new THREE.Vector3(.23,-.25,-.24)]),24,.004,6,false),dark);device.add(cable);
 return root;
}
