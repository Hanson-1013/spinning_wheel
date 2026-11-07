import * as THREE from 'three';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {createBotanicalLibrary} from './botanical-library.js';
import {createRenderStyles} from './render-styles.js';

const loading=document.querySelector('#loading');
try {
 const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.2;
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;document.body.prepend(renderer.domElement);
 const scene=new THREE.Scene();scene.background=new THREE.Color(0xbacac2);scene.fog=new THREE.FogExp2(0xb6c8bd,.007);
 const library=createBotanicalLibrary();library.visible=true;scene.add(library);library.userData.indoorMist?.setVisible(true);library.userData.indoorMist?.setDensity(16);
 const camera=new THREE.PerspectiveCamera(43,1,.1,100),origin=new THREE.Vector3(0,1.3,8);
 const basePitch=Math.atan2(.45-1.3,11.8);
 const defaults={yaw:10,pitch:5,side:-1.5,travel:-.43,fov:60},state={...defaults};
 // Movement bounds are relative to the approved starting camera position.
 origin.set(defaults.side,.5,8-defaults.travel);
 const composer=new EffectComposer(renderer);composer.addPass(new RenderPass(scene,camera));composer.addPass(new UnrealBloomPass(new THREE.Vector2(1,1),.7,.65,.72));
 const film=createRenderStyles(composer,renderer);film.setStrength(.4);film.setGrain(.056);film.setAberration(1);
 function apply(){
  state.yaw=THREE.MathUtils.clamp(state.yaw,defaults.yaw-30,defaults.yaw+30);
  state.pitch=THREE.MathUtils.clamp(state.pitch,defaults.pitch-30,defaults.pitch+30);
  state.side=THREE.MathUtils.clamp(state.side,defaults.side-2,defaults.side+2);
  state.travel=THREE.MathUtils.clamp(state.travel,defaults.travel-2,defaults.travel+2);
  state.fov=THREE.MathUtils.clamp(state.fov,25,85);
  camera.position.set(origin.x+state.side-defaults.side,.5,origin.z-state.travel+defaults.travel);
  camera.fov=state.fov;camera.updateProjectionMatrix();
  camera.rotation.set(basePitch+THREE.MathUtils.degToRad(state.pitch),-THREE.MathUtils.degToRad(state.yaw),0,'YXZ');
 }
 renderer.domElement.addEventListener('wheel',e=>{e.preventDefault();const pixels=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?innerHeight:1);state.fov+=THREE.MathUtils.clamp(pixels,-160,160)*.025;apply();},{passive:false});
 let pointer=null;
 renderer.domElement.onpointerdown=e=>{if(pointer)return;pointer={id:e.pointerId,x:e.clientX,y:e.clientY};renderer.domElement.setPointerCapture(e.pointerId);};
 renderer.domElement.onpointermove=e=>{if(pointer?.id!==e.pointerId)return;state.yaw-=(e.clientX-pointer.x)*.1;state.pitch-=(e.clientY-pointer.y)*.1;pointer.x=e.clientX;pointer.y=e.clientY;apply();};
 const release=e=>{if(pointer?.id===e.pointerId)pointer=null;};renderer.domElement.onpointerup=release;renderer.domElement.onpointercancel=release;renderer.domElement.onlostpointercapture=release;
 const keys=new Set(),allowed=['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'];
 window.addEventListener('keydown',e=>{if(e.target.matches('input,button,summary')||!allowed.includes(e.key.toLowerCase()))return;e.preventDefault();keys.add(e.key.toLowerCase());});
 window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));window.addEventListener('blur',()=>keys.clear());
 function resize(){renderer.setSize(innerWidth,innerHeight);composer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();}
 window.addEventListener('resize',resize);resize();apply();
 let last=performance.now();
 renderer.setAnimationLoop(now=>{const dt=Math.min((now-last)/1000,.05);last=now;
  const horizontal=Number(keys.has('d')||keys.has('arrowright'))-Number(keys.has('a')||keys.has('arrowleft'));
  const forward=Number(keys.has('w')||keys.has('arrowup'))-Number(keys.has('s')||keys.has('arrowdown'));
  if(horizontal||forward){state.side+=horizontal*dt;state.travel+=forward*dt;apply();}
  library.userData.update?.(now/1000);film.update(now/1000);composer.render();loading.hidden=true;loading.style.display='none';
 });
} catch(error){loading.textContent='场景加载失败，请刷新重试。';console.error(error);}
