import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
const scene=new THREE.Scene();scene.background=new THREE.Color(0x101814);
const camera=new THREE.PerspectiveCamera(40,1,.01,100);
const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;document.body.appendChild(renderer.domElement);
scene.add(new THREE.HemisphereLight(0xffefda,0x4e6656,2.2));const key=new THREE.DirectionalLight(0xffdb9f,3);key.position.set(3,5,4);scene.add(key);const fill=new THREE.DirectionalLight(0xbcd8ef,1.5);fill.position.set(-3,2,-3);scene.add(fill);
const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.autoRotateSpeed=.65;
const selector=document.querySelector('#module'),status=document.querySelector('#status');let current=null,ticket=0,fit=()=>{};
const mat=(color)=>new THREE.MeshStandardMaterial({color,roughness:.55});
async function build(id){
 const group=new THREE.Group();const wood=mat(0x30261e),trim=mat(0x51412c),brass=new THREE.MeshStandardMaterial({color:0xa18449,metalness:.7,roughness:.35}),iron=mat(0x242b25);
 if(id==='towers'){group.add((await import('./retro-towers.js')).createRetroTowers());
 }else if(id==='desk'||id==='shelf'){
  const furniture=await import('./library-furniture.js');group.add(id==='desk'?furniture.createLibraryDesk({},true):furniture.createScrollShelf());
 }else if(id==='piano'||id==='player'){
  const {addLibraryInstruments}=await import('./library-instruments.js');addLibraryInstruments(group,{walnut:wood,trim,brass,iron});
  const chosen=group.children.find(o=>o.name.includes(id==='piano'?'立式钢琴':'半球音乐播放器'));
  for(const o of [...group.children])if(o!==chosen){group.remove(o);dispose(o);}chosen.position.set(0,0,0);chosen.rotation.y=0;
 }else if(id==='clock'){const {createNixieConsole}=await import('./nixie-clock.js');group.add(createNixieConsole());}
 else if(id==='rug'){group.add((await import('./library-rug.js')).createLibraryRug());}
 else if(id==='hanging'){group.add((await import('./hanging-garden.js')).createHangingGarden());}
 else if(id==='frame'){group.add((await import('./library-props.js')).createLibraryFrame(1.1,1.5,trim,brass));}
 else{
  const {createLibraryPot}=await import('./library-props.js');group.add(createLibraryPot(mat(0xaaa89a),mat(0x211c14)));
  if(id==='palm')group.add((await import('./tropical-plants.js')).createIndoorAreca());
  else{const m=await import('./monstera.js');group.add(m.createMonsteraPlant(2.55,Math.random,m.createMonsteraMaterials(),Array.from({length:5},(_,i)=>m.createMonsteraLeaf(i)),{leafCount:22}));}
 }
 return group;
}
function dispose(object){const geometries=new Set(),materials=new Set(),textures=new Set();object.traverse(o=>{if(o.geometry)geometries.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:o.material?[o.material]:[]){materials.add(m);for(const v of Object.values(m))if(v?.isTexture)textures.add(v);}});geometries.forEach(g=>g.dispose());textures.forEach(t=>t.dispose());materials.forEach(m=>m.dispose());}
async function load(){const id=++ticket;status.textContent='正在加载模组…';if(current){scene.remove(current);dispose(current);current=null;}
 try{const object=await build(selector.value);if(id!==ticket){dispose(object);return;}current=object;scene.add(object);object.updateMatrixWorld(true);const bounds=new THREE.Box3().setFromObject(object),center=bounds.getCenter(new THREE.Vector3()),size=bounds.getSize(new THREE.Vector3());object.position.sub(center);
 const radius=size.length()/2;
 fit=()=>{const distance=radius/Math.sin(THREE.MathUtils.degToRad(camera.fov/2))/Math.min(1,camera.aspect)*1.12;camera.position.set(distance*.25,distance*.15,distance);camera.near=Math.max(.005,radius/100);camera.far=Math.max(100,distance*5);camera.updateProjectionMatrix();controls.target.set(0,0,0);controls.update();};fit();
 const url=new URL(location.href);url.searchParams.set('module',selector.value);history.replaceState(null,'',url);status.textContent='单指旋转 · 双指缩放/平移 · 仅加载当前模组';
 }catch(error){console.error(error);status.textContent='加载失败，请切换模组或刷新重试';}}
function resize(){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);}addEventListener('resize',resize);resize();
selector.onchange=load;document.querySelector('#reset').onclick=()=>fit();document.querySelector('#rotate').onclick=e=>{controls.autoRotate=!controls.autoRotate;e.target.textContent=controls.autoRotate?'停止转动':'自动转动';};
const initial=new URLSearchParams(location.search).get('module');if([...selector.options].some(o=>o.value===initial))selector.value=initial;load();
const clock=new THREE.Clock();renderer.setAnimationLoop(()=>{const time=clock.getElapsedTime();current?.traverse(o=>o.userData.update?.(time));controls.update();renderer.render(scene,camera);});
