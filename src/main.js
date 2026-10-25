import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import './style.css';
import { createWater } from './water.js';
import { createGatheringLight } from './gathering-light.js';
import { createSpinningWheel } from './spinning-wheel.js';

const host=document.querySelector('#scene');
try { start(); } catch(error) { document.querySelector('#error').hidden=false;document.querySelector('#error').textContent='无法启动 3D 空间。请使用支持 WebGL2 的浏览器并开启硬件加速。 '+error.message;document.querySelector('#status').textContent='渲染不可用'; }
function start(){
const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(2*Math.min(devicePixelRatio,1.6));renderer.setSize(innerWidth,innerHeight);renderer.setClearColor(0x080e13);renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.2;host.appendChild(renderer.domElement);
const scene=new THREE.Scene();scene.fog=new THREE.FogExp2(0x0b151d,.048);
const camera=new THREE.PerspectiveCamera(43,innerWidth/innerHeight,.1,100);camera.position.set(0,1.3,11.8);camera.lookAt(0,.45,0);
const composer=new EffectComposer(renderer);composer.addPass(new RenderPass(scene,camera));const bloom=new UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),.7,.65,.72);composer.addPass(bloom);
scene.add(new THREE.HemisphereLight(0xa4cfde,0x17120e,1.1));
const key=new THREE.SpotLight(0xd6edff,130,28,.65,.8,1.4);key.position.set(-3,8,3);scene.add(key);key.target.position.set(0,0,0);scene.add(key.target);
const glow=new THREE.PointLight(0xa5d6e9,13,8,1.5);glow.position.set(0,.6,.4);scene.add(glow);
function box(w,h,d,x,y,z,color=0x192329,roughness=.8){const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshStandardMaterial({color,roughness,metalness:.35}));mesh.position.set(x,y,z);scene.add(mesh);return mesh;}
box(26,.25,26,0,-2.4,0,0x121d22,.24);box(140,30,.5,0,12,-5);box(60,30,4,-34.55,12,-3);box(60,30,4,34.55,12,-3);box(6,.25,4,0,4.6,-.3);box(5,.18,3.6,0,-2.15,0,0x273337,.28);box(5.6,.12,4.1,0,-2.31,0);
for(let i=0;i<8;i++)box(.12,9,.2,-4+i*1.15,2.5,-4.65,0x26343b);
for(let j=0;j<3;j++)box(6,.12,.1,-5.7,5+j*.65,-2+j*.3,0x40535e);
const lampMat=new THREE.MeshBasicMaterial({color:0xb9cfd6});const lamps=new THREE.InstancedMesh(new THREE.SphereGeometry(.018,5,4),lampMat,400);const matrix=new THREE.Matrix4();let li=0;for(let x=0;x<20;x++)for(let z=0;z<20;z++){matrix.makeTranslation((x-9.5)*.26,4.45,(z-9.5)*.17-.3);lamps.setMatrixAt(li++,matrix);}scene.add(lamps);
for(const side of [-1,1]){box(.025,3,.035,side*3.9,-.2,-3.8,0x9aa8a5);const light=new THREE.PointLight(0xffd6aa,8,6,2);light.position.set(side*4,-1.7,-2);scene.add(light);const strip=new THREE.Mesh(new THREE.BoxGeometry(.035,2.9,.04),new THREE.MeshBasicMaterial({color:0xd4c6ab}));strip.position.set(side*3.9,-.25,-3.72);scene.add(strip);}
const water = createWater(scene);
const spinningWheel = createSpinningWheel(scene,camera,renderer.domElement);
const gathering=createGatheringLight(scene,renderer,bloom,{camera,getCenter:target=>spinningWheel.getCenter(target)});
let paused=false,time=0,last=performance.now();
document.querySelector('#pause').onclick=e=>{paused=!paused;e.target.textContent=paused?'继续演出':'暂停演出';};
function setReplayVisible(visible){const button=document.querySelector('#model-reset');button.classList.toggle('is-visible',visible);button.disabled=!visible;button.setAttribute('aria-hidden',String(!visible));}
function replay(){setReplayVisible(false);cameraRestartHold=true;gathering.beginRestart(time);spinningWheel.beginReset();paused=false;document.querySelector('#pause').textContent='暂停演出';}
document.querySelector('#reset').onclick=replay;
document.querySelector('#model-reset').onclick=replay;
document.querySelector('#wood-style').onchange=e=>spinningWheel.setWoodStyle(e.target.value);
const baseCameraPosition=new THREE.Vector3(),baseCameraTarget=new THREE.Vector3();
const focusCenter=new THREE.Vector3(0,-2.035,0),cameraTarget=new THREE.Vector3();
let cameraPull=0,cameraRestartHold=false;
function updateCamera(elapsed){
 // Restart must not expose the old, hidden push-in value or move the camera.
 if(cameraRestartHold){
   if(!spinningWheel.isInteracting())return;
   cameraRestartHold=false;
 }
 const state=spinningWheel.getState();
 const fading=state.finishing||state.complete;
 const returnFactor=fading?1-THREE.MathUtils.smoothstep(state.after,.9,2.1):1;
 const desired=THREE.MathUtils.smoothstep(state.progress,0,.9);
 // Dampen the push-in separately so it cannot lag behind the fade-out endpoint.
 if(fading&&state.after>=2.1)cameraPull=0;
 else cameraPull+=(desired-cameraPull)*(1-Math.exp(-elapsed*4));
 const visiblePull=cameraPull*returnFactor;
 const travel=(innerWidth<=700?.18:.25)*visiblePull;
 camera.position.copy(baseCameraPosition).lerp(focusCenter,travel);
 cameraTarget.copy(baseCameraTarget).lerp(focusCenter,visiblePull*.55);
 camera.lookAt(cameraTarget);camera.updateMatrixWorld(true);
}
const mobileFrame=document.createElement('div');mobileFrame.className='mobile-camera-frame';mobileFrame.setAttribute('aria-hidden','true');document.querySelector('#app').appendChild(mobileFrame);
function resizeStage(){
 const width=Math.max(1,host.clientWidth),height=Math.max(1,host.clientHeight);
 camera.clearViewOffset();camera.aspect=width/height;
 if(innerWidth<=700){
  const frame=mobileFrame.getBoundingClientRect(),referenceHeight=Math.max(1,frame.height),referenceAspect=width/referenceHeight;
  camera.position.set(0,1.3,Math.max(9,2.3/(Math.tan(THREE.MathUtils.degToRad(43/2))*referenceAspect)));
  camera.setViewOffset(width,referenceHeight,0,-frame.top,width,height);camera.lookAt(0,-.8,0);
 }
 else{camera.position.set(0,1.3,11.8);camera.lookAt(0,.45,0);}
 baseCameraPosition.copy(camera.position);baseCameraTarget.set(0,innerWidth<=700?-.8:.45,0);updateCamera(0);
 camera.updateProjectionMatrix();renderer.setSize(width,height);composer.setSize(width,height);
}
new ResizeObserver(resizeStage).observe(host);
window.addEventListener('resize',resizeStage);resizeStage();
function animate(now){requestAnimationFrame(animate);const elapsed=Math.max(0,(now-last)/1000),dt=Math.min(elapsed,1/30);last=now;
if(!paused){time+=dt;water.update(dt,time);spinningWheel.update(dt,elapsed);updateCamera(elapsed);gathering.update(time,spinningWheel.getState());}
const state=spinningWheel.getState();
setReplayVisible(state.complete&&state.after>=2.1&&gathering.isFinished());
document.querySelector('#status').textContent=state.complete?'织光完成':Math.floor(state.progress*100)+'% / 织光进度';
composer.render();}requestAnimationFrame(animate);
}
