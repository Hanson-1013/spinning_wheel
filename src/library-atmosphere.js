import * as THREE from 'three';

// Shared box and test-page presets; the factory keeps its original morning default.
export function createLibraryAtmosphere(library,scene,renderer,renderStyles=null){
 const {sky,daylight,sun}=library.userData.atmosphere;
 const morning={sky:daylight.color.clone(),ground:daylight.groundColor.clone(),ambient:daylight.intensity,sunColor:sun.color.clone(),sun:sun.intensity,exposure:renderer.toneMappingExposure};
 const pendantBulbs=[];library.traverse(object=>{if(object.name==='纵向排列吊灯')object.traverse(child=>{if(child.isMesh&&child.material?.isMeshBasicMaterial)pendantBulbs.push({material:child.material,color:child.material.color.clone()});});});
 const pendantLights=[];let pendantsOn=false;
 const lamps=new THREE.Group();lamps.name='夜晚暖色吊灯照明';lamps.visible=false;library.add(lamps);
 for(const x of [-5.8,5.8])for(const z of [-4.3,-1.9,.5]){
  const light=new THREE.PointLight(0xffc27c,4.5,5.5,2);light.position.set(x,1.22,z);lamps.add(light);pendantLights.push(light);
 }
 const desk=new THREE.PointLight(0xffce8b,3.5,5,2);desk.position.set(-.3,-.1,-3.3);lamps.add(desk);
 const windowMist=library.getObjectByName('前后排植物之间 · 渐隐薄雾');
 let time='morning',enabled=true;
 function apply(){
  const night=time==='night';library.userData.indoorMist?.setNight(night);sky.uniforms.nightMix.value=night?1:0;
  daylight.color.copy(night?new THREE.Color(0x6789b5):morning.sky);
  daylight.groundColor.copy(night?new THREE.Color(0x102130):morning.ground);
  daylight.intensity=night?.22:morning.ambient;
  sun.color.copy(night?new THREE.Color(0x92b7ee):morning.sunColor);sun.intensity=night?19:morning.sun;
  lamps.visible=night;
  if(enabled){
   renderStyles?.setNightTone(night?1:0);
   scene.background=new THREE.Color(night?0x070e22:0xbacac2);
   scene.fog=new THREE.FogExp2(night?0x102034:0xb6c8bd,night?.012:.007);
   renderer.toneMappingExposure=night?1.7:morning.exposure;
  }
 }
 function setPendantLights(value){pendantsOn=!!value;for(const light of pendantLights)light.visible=pendantsOn;for(const bulb of pendantBulbs)bulb.material.color.copy(bulb.color).multiplyScalar(pendantsOn?1:.035);}
 setPendantLights(false);
 return {
  setTime(value){time=value==='night'?'night':'morning';apply();},
  setEnabled(value){enabled=!!value;if(enabled)apply();else {renderer.toneMappingExposure=morning.exposure;renderStyles?.setNightTone(0);}},
  setPendantLights,
  setWeather(value){if(windowMist)windowMist.visible=value!=='clear';},
 };
}
