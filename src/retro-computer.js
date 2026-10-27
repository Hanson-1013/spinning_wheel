import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';

export function createRetroComputer(){
 const root=new THREE.Group();root.name='米白复古电脑 · 朝向椅子';
 const shell=new THREE.MeshStandardMaterial({color:0xbfb59b,roughness:.83}),edge=new THREE.MeshStandardMaterial({color:0x4b3830,roughness:.76}),black=new THREE.MeshStandardMaterial({color:0x252b28,roughness:.65}),keymat=new THREE.MeshStandardMaterial({color:0x77604b,roughness:.8});
 function box(w,h,d,x,y,z,m=shell,round=.009){const o=new THREE.Mesh(new RoundedBoxGeometry(w,h,d,2,round),m);o.position.set(x,y,z);root.add(o);return o;}
 // Sloping wedge deck, with softened bevels rather than a square slab.
 const deckGeometry=new RoundedBoxGeometry(.56,.105,.64,3,.012),deckPositions=deckGeometry.attributes.position;
 for(let i=0;i<deckPositions.count;i++){const z=deckPositions.getZ(i);deckPositions.setY(i,deckPositions.getY(i)+.047*(.5-z/.64));}
 deckGeometry.computeVertexNormals();const deck=new THREE.Mesh(deckGeometry,shell);deck.position.set(0,.065,.025);root.add(deck);
 box(.565,.023,.645,0,.012,.025,edge,.008);
 box(.51,.11,.3,0,.174,-.13,shell,.013);box(.465,.018,.3,0,.235,-.13,edge);
 // Two drive slots, eject buttons and indicator.
 for(const x of [-.14,.13]){box(.17,.025,.007,x,.178,.024,black);box(.105,.003,.009,x-.015,.18,.029,edge);box(.018,.007,.008,x+.064,.166,.03,keymat);}
 const led=new THREE.Mesh(new THREE.SphereGeometry(.003,8,6),new THREE.MeshBasicMaterial({color:0xa4b571}));led.position.set(-.245,.16,.027);root.add(led);
 box(.4,.025,.27,0,.248,-.13,edge);// CRT case narrows toward the rear and has a rounded shoulder.
 const housingGeometry=new RoundedBoxGeometry(.445,.328,.34,4,.018),housingPositions=housingGeometry.attributes.position;
 for(let i=0;i<housingPositions.count;i++){const z=housingPositions.getZ(i),t=THREE.MathUtils.clamp((.17-z)/.34,0,1);housingPositions.setX(i,housingPositions.getX(i)*(1-.12*t));housingPositions.setY(i,housingPositions.getY(i)*(1-.08*t));}
 housingGeometry.computeVertexNormals();const housing=new THREE.Mesh(housingGeometry,shell);housing.position.set(0,.421,-.15);root.add(housing);
 box(.386,.289,.016,0,.424,.021,black,.012);box(.36,.266,.012,0,.424,.033,edge,.009);
 const screenGeometry=new THREE.PlaneGeometry(.337,.242,24,20),p=screenGeometry.attributes.position;
 for(let i=0;i<p.count;i++){const x=p.getX(i)/.1685,y=p.getY(i)/.121;p.setZ(i,.014*(1-x*x)*(1-y*y));}screenGeometry.computeVertexNormals();
 const screenMaterial=new THREE.MeshPhysicalMaterial({color:0x6f7e73,roughness:.32,clearcoat:.6,clearcoatRoughness:.22,emissive:0x23362c,emissiveIntensity:.16});
 const screen=new THREE.Mesh(screenGeometry,screenMaterial);screen.position.set(0,.424,.041);root.add(screen);
 // Separate sculpted keycaps on a slightly sloped keyboard deck.
 const keyboard=new THREE.Group();keyboard.position.set(0,.145,.19);keyboard.rotation.x=.073;root.add(keyboard);
 for(let row=0;row<4;row++)for(let col=0;col<13;col++){
  const key=new THREE.Mesh(new RoundedBoxGeometry(.029,.013,.029,1,.002),keymat);key.position.set(-.22+col*.036,0,-.055+row*.037);keyboard.add(key);
 }
 const space=new THREE.Mesh(new RoundedBoxGeometry(.19,.013,.025,1,.002),edge);space.position.set(-.035,0,.096);keyboard.add(space);
 for(const side of [-1,1]){
  for(let i=0;i<12;i++)box(.002,.065,.002,side*.216,.34,-.235+i*.009,black,.0005);
  for(let i=0;i<18;i++)box(.002,.053,.002,side*.282,.06,-.22+i*.024,edge,.0005);
 }
 for(let i=0;i<22;i++)box(.003,.11,.002,-.15+i*.014,.43,-.277,black,.0005);
 // Coiled keyboard lead around the rear socket.
 const points=[];for(let i=0;i<=64;i++){const t=i/64;points.push(new THREE.Vector3(.18+.025*Math.sin(t*Math.PI*16),.2+t*.04,-.22-t*.12));}
 root.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),64,.0025,5,false),edge));
 root.scale.setScalar(.82);
 root.rotation.y=Math.PI-Math.PI/7;
 return root;
}
