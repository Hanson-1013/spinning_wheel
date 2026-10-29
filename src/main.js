import {createRenderStyles} from './render-styles.js';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import './style.css';
import { createWater } from './water.js';
import { createGatheringLight } from './gathering-light.js';
import { createSpinningWheel } from './spinning-wheel.js';

const host=document.querySelector('#scene');
const loadingScreen=document.querySelector('#loading-screen');
function showStartupError(error){
 loadingScreen.classList.add('is-error');
 document.querySelector('#loading-label').textContent='场景加载失败，请刷新重试或使用支持 WebGL2 的浏览器。';
 document.querySelector('#error').hidden=false;document.querySelector('#error').textContent=error.message;
 document.querySelector('#status').textContent='渲染不可用';
 console.error(error);
}
function finishLoading(){
 requestAnimationFrame(()=>requestAnimationFrame(()=>{
  loadingScreen.classList.add('is-ready');
  setTimeout(()=>loadingScreen.remove(),700);
 }));
}
try { start(); } catch(error) { showStartupError(error); }
function start(){
const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(2*Math.min(devicePixelRatio,1.6));renderer.setSize(innerWidth,innerHeight);renderer.setClearColor(0x080e13);renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.2;host.appendChild(renderer.domElement);
const scene=new THREE.Scene();scene.fog=new THREE.FogExp2(0x0b151d,.048);
const camera=new THREE.PerspectiveCamera(43,innerWidth/innerHeight,.1,100);camera.position.set(0,1.3,11.8);camera.lookAt(0,.45,0);
const composer=new EffectComposer(renderer);composer.addPass(new RenderPass(scene,camera));const bloom=new UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),.7,.65,.72);composer.addPass(bloom);
const renderStyles=document.body.dataset.page==='developer'?createRenderStyles(composer,renderer):null;
scene.add(new THREE.HemisphereLight(0xa4cfde,0x17120e,1.1));
const key=new THREE.SpotLight(0xd6edff,130,28,.65,.8,1.4);key.position.set(-3,8,3);scene.add(key);key.target.position.set(0,0,0);scene.add(key.target);
const glow=new THREE.PointLight(0xa5d6e9,13,8,1.5);glow.position.set(0,.6,.4);scene.add(glow);
function box(w,h,d,x,y,z,color=0x192329,roughness=.8){const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshStandardMaterial({color,roughness,metalness:.35}));mesh.position.set(x,y,z);scene.add(mesh);return mesh;}
box(26,.25,26,0,-2.4,0,0x121d22,.24);box(140,30,.5,0,12,-5);box(60,30,4,-34.55,12,-3);box(60,30,4,34.55,12,-3);box(6,.25,4,0,4.6,-.3);box(5,.18,3.6,0,-2.15,0,0x273337,.28);box(5.6,.12,4.1,0,-2.31,0);
for(let i=0;i<8;i++)box(.12,9,.2,-4+i*1.15,2.5,-4.65,0x26343b);
for(let j=0;j<3;j++)box(6,.12,.1,-5.7,5+j*.65,-2+j*.3,0x40535e);
const lampMat=new THREE.MeshBasicMaterial({color:0xb9cfd6});const lamps=new THREE.InstancedMesh(new THREE.SphereGeometry(.018,5,4),lampMat,400);const matrix=new THREE.Matrix4();let li=0;for(let x=0;x<20;x++)for(let z=0;z<20;z++){matrix.makeTranslation((x-9.5)*.26,4.45,(z-9.5)*.17-.3);lamps.setMatrixAt(li++,matrix);}scene.add(lamps);
for(const side of [-1,1]){box(.025,3,.035,side*3.9,-.2,-3.8,0x9aa8a5);const light=new THREE.PointLight(0xffd6aa,8,6,2);light.position.set(side*4,-1.7,-2);scene.add(light);const strip=new THREE.Mesh(new THREE.BoxGeometry(.035,2.9,.04),new THREE.MeshBasicMaterial({color:0xd4c6ab}));strip.position.set(side*3.9,-.25,-3.72);scene.add(strip);}
const backdropObjects=scene.children.filter(object=>object.isLight||(object.isMesh&&(object.position.y>-2||object.position.y===-2.4)));
const performanceStage=new THREE.Group();performanceStage.name="水池纺车与光粒子整体";scene.add(performanceStage);
const water = createWater(performanceStage);
for(const object of [...scene.children])if(object.isMesh&&(object.position.y===-2.15||object.position.y===-2.31))water.poolGroup.add(object);
const spinningWheel = createSpinningWheel(performanceStage,camera,renderer.domElement);
const gathering=createGatheringLight(performanceStage,renderer,bloom,{camera,getCenter:target=>performanceStage.worldToLocal(spinningWheel.getCenter(target))});
let paused=false,time=0,last=performance.now();
document.querySelector('#pause').onclick=e=>{paused=!paused;e.target.textContent=paused?'继续演出':'暂停演出';};
function setReplayVisible(visible){const button=document.querySelector('#model-reset');button.classList.toggle('is-visible',visible);button.disabled=!visible;button.setAttribute('aria-hidden',String(!visible));}
function replay(){setReplayVisible(false);cameraRestartHold=true;gathering.beginRestart(time);spinningWheel.beginReset();paused=false;document.querySelector('#pause').textContent='暂停演出';}
document.querySelector('#reset').onclick=replay;
document.querySelector('#model-reset').onclick=replay;
document.querySelector('#wood-style').onchange=e=>spinningWheel.setWoodStyle(e.target.value);
const uiToggle=document.querySelector('#toggle-ui');
const interfaceParts=[...document.querySelectorAll('header,.title,.model-tools,#panel,.status-copy,.footer-brand,footer .hint,#toggle-ui')];
const restoreSurface=document.createElement('button');restoreSurface.id='restore-ui';restoreSurface.type='button';restoreSurface.setAttribute('aria-label','点击任意位置恢复界面');restoreSurface.hidden=true;document.querySelector('#app').appendChild(restoreSurface);
function setInterfaceHidden(hidden){
 document.querySelector('#app').classList.toggle('ui-hidden',hidden);
 uiToggle.setAttribute('aria-pressed',String(hidden));
 for(const part of interfaceParts){part.inert=hidden;part.setAttribute('aria-hidden',String(hidden));}
 restoreSurface.hidden=!hidden;
 if(hidden)restoreSurface.focus({preventScroll:true});
 else uiToggle.focus({preventScroll:true});
}
uiToggle.addEventListener('click',()=>setInterfaceHidden(true));
restoreSurface.addEventListener('click',e=>{e.stopPropagation();setInterfaceHidden(false);});
const baseCameraPosition=new THREE.Vector3(),baseCameraTarget=new THREE.Vector3();
const focusCenter=new THREE.Vector3(0,-2.035,0),cameraTarget=new THREE.Vector3();
let stageOffset=0;
let cameraPull=0,cameraRestartHold=false,manualCamera=null,inspectionSnapshot=null;
function updateCamera(elapsed){
 if(inspectionSnapshot){camera.updateMatrixWorld(true);return;}
 if(manualCamera){
  camera.clearViewOffset();camera.aspect=Math.max(1,host.clientWidth)/Math.max(1,host.clientHeight);
  camera.position.set(manualCamera.position.x,manualCamera.position.y,manualCamera.position.z);
  cameraTarget.set(manualCamera.target.x,manualCamera.target.y,manualCamera.target.z);
  camera.setFocalLength(manualCamera.focalLength);camera.lookAt(cameraTarget);camera.updateMatrixWorld(true);return;
 }
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
 camera.position.z+=stageOffset;cameraTarget.z+=stageOffset;
 camera.lookAt(cameraTarget);camera.updateMatrixWorld(true);
}
const mobileFrame=document.createElement('div');mobileFrame.className='mobile-camera-frame';mobileFrame.setAttribute('aria-hidden','true');document.querySelector('#app').appendChild(mobileFrame);
function resizeStage(){
 const width=Math.max(1,host.clientWidth),height=Math.max(1,host.clientHeight);
 if(inspectionSnapshot){camera.clearViewOffset();camera.aspect=width/height;camera.updateProjectionMatrix();renderer.setSize(width,height);composer.setSize(width,height);return;}
 camera.clearViewOffset();camera.fov=43;camera.aspect=width/height;
 if(innerWidth<=700){
  const frame=mobileFrame.getBoundingClientRect(),referenceHeight=Math.max(1,frame.height),referenceAspect=width/referenceHeight;
  camera.position.set(0,1.3,Math.max(9,2.3/(Math.tan(THREE.MathUtils.degToRad(43/2))*referenceAspect)));
  camera.setViewOffset(width,referenceHeight,0,-frame.top,width,height);camera.lookAt(0,-.8,0);
 }
 else{camera.position.set(0,1.3,11.8);camera.lookAt(0,.45,0);}
 baseCameraPosition.copy(camera.position);baseCameraTarget.set(0,innerWidth<=700?-.8:.45,0);updateCamera(0);
 camera.updateProjectionMatrix();renderer.setSize(width,height);composer.setSize(width,height);
}
const cameraRig={
 camera,
 setStageOffset(z){stageOffset=z;performanceStage.position.z=z;focusCenter.z=0;updateCamera(0);},
 inspect(enabled){
  if(enabled&&!inspectionSnapshot){inspectionSnapshot={camera:camera.clone(),target:cameraTarget.clone()};camera.clearViewOffset();camera.aspect=host.clientWidth/Math.max(1,host.clientHeight);camera.updateProjectionMatrix();}
  else if(!enabled&&inspectionSnapshot){camera.copy(inspectionSnapshot.camera);cameraTarget.copy(inspectionSnapshot.target);inspectionSnapshot=null;resizeStage();}
 },
 get(){return {manual:!!manualCamera,position:{x:camera.position.x,y:camera.position.y,z:camera.position.z},target:{x:cameraTarget.x,y:cameraTarget.y,z:cameraTarget.z},focalLength:camera.getFocalLength()};},
 set(value){manualCamera={position:{...value.position},target:{...value.target},focalLength:value.focalLength};updateCamera(0);},
 reset(){manualCamera=null;cameraPull=0;cameraRestartHold=false;resizeStage();}
};
let developerTools=null;
if(document.body.dataset.page==='developer')import('./developer-tools.js').then(({setupDeveloperTools})=>developerTools=setupDeveloperTools({scene,wheel:spinningWheel.root,backdropObjects,canvas:renderer.domElement,renderer,water,cameraRig,performanceStage,renderStyles})).catch(console.error);
new ResizeObserver(resizeStage).observe(host);
window.addEventListener('resize',resizeStage);resizeStage();
let firstFrame=true;
function animate(now){const elapsed=Math.max(0,(now-last)/1000),dt=Math.min(elapsed,1/30);last=now;
if(!paused){time+=dt;water.update(dt,time);spinningWheel.update(dt,elapsed);updateCamera(elapsed);gathering.update(time,spinningWheel.getState());developerTools?.update(time);}
const state=spinningWheel.getState();
setReplayVisible(state.complete&&state.after>=2.1&&gathering.isFinished());
document.querySelector('#status').textContent=state.complete?'织光完成':Math.floor(state.progress*100)+'% / 织光进度';
try{composer.render();}catch(error){showStartupError(error);return;}
if(firstFrame){firstFrame=false;finishLoading();}
requestAnimationFrame(animate);
}requestAnimationFrame(animate);
}
