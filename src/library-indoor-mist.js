import * as THREE from 'three';

// Integrate a bounded haze along each surface's view ray instead of intersecting
// furniture with transparent sheets. Four samples add no draw calls or depth pass.
export function addIndoorMist(root){
 const group=new THREE.Group();group.name='室内轻雾';root.add(group);
 const time={value:0},density={value:.16},enabled={value:1};
 const tint={value:new THREE.Color().setRGB(.76,.77,.69)};
 const materials=new Set();
 root.traverse(object=>{
  if(!object.isMesh)return;
  for(const material of Array.isArray(object.material)?object.material:[object.material]){
   if(material&&!material.transparent&&(material.isMeshStandardMaterial||material.isMeshBasicMaterial))materials.add(material);
  }
 });
 for(const material of materials){
  const priorCompile=material.onBeforeCompile,priorKey=material.customProgramCacheKey;
  material.onBeforeCompile=function(shader,renderer){
   priorCompile.call(this,shader,renderer);
   Object.assign(shader.uniforms,{roomMistTime:time,roomMistDensity:density,roomMistEnabled:enabled,roomMistTint:tint});
   shader.vertexShader='varying vec3 roomMistWorld;\n'+shader.vertexShader;
   shader.vertexShader=shader.vertexShader.replace('#include <project_vertex>',`#include <project_vertex>
    vec4 roomMistVertex=vec4(transformed,1.0);
    #ifdef USE_BATCHING
     roomMistVertex=batchingMatrix*roomMistVertex;
    #endif
    #ifdef USE_INSTANCING
     roomMistVertex=instanceMatrix*roomMistVertex;
    #endif
    roomMistWorld=(modelMatrix*roomMistVertex).xyz;`);
   shader.fragmentShader=`uniform float roomMistTime,roomMistDensity,roomMistEnabled;
    uniform vec3 roomMistTint;varying vec3 roomMistWorld;
    float roomMistSample(vec3 p){
     float bounds=(1.-smoothstep(7.2,9.1,abs(p.x)))*smoothstep(-7.1,-5.8,p.z)*(1.-smoothstep(7.3,9.,p.z));
     float height=smoothstep(-2.42,-1.9,p.y)*(1.-smoothstep(2.2,5.7,p.y));
     float cloud=.68+.19*sin(p.x*.63+p.z*.37+roomMistTime*.055)+.13*sin(p.y*.91-p.z*.47-roomMistTime*.037);
     return bounds*height*cloud;
    }\n`+shader.fragmentShader;
   shader.fragmentShader=shader.fragmentShader.replace('#include <fog_fragment>',`#include <fog_fragment>
    if(roomMistEnabled>.5&&roomMistDensity>0.){
     vec3 ray=roomMistWorld-cameraPosition;float distanceToSurface=length(ray);float opticalDepth=0.;
     for(int sampleIndex=0;sampleIndex<4;sampleIndex++){
      float fraction=(float(sampleIndex)+.5)/4.;
      opticalDepth+=roomMistSample(cameraPosition+ray*fraction);
     }
     float haze=1.-exp(-opticalDepth*.25*distanceToSurface*roomMistDensity*.018);
     gl_FragColor.rgb=mix(gl_FragColor.rgb,roomMistTint,haze);
    }`);
  };
  material.customProgramCacheKey=function(){return priorKey.call(this)+'|continuous-room-mist-v1';};
  material.needsUpdate=true;
 }
 const prior=root.userData.update;root.userData.update=t=>{prior?.(t);time.value=t;};
 const api={group,setDensity(value){const n=Number(value);density.value=Number.isFinite(n)?THREE.MathUtils.clamp(n/100,0,1):0;},setVisible(value){group.visible=!!value;enabled.value=value?1:0;},setNight(value){tint.value.setRGB(...(value?[.055,.085,.125]:[.76,.77,.69]));}};
 root.userData.indoorMist=api;return api;
}
