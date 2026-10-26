import * as THREE from 'three';
import {sampleGatheringMotion} from './gathering-motion.js';
import {sampleSigil} from './particle-sigil.js';

export function createGatheringLight(scene,renderer,bloom,options={}){
  const n=6300,outerCount=2200,positions=new Float32Array(n*3),seed=new Float32Array((n+outerCount)*4);
  let random=123;const rand=()=>{random=(Math.imul(random,1664525)+1013904223)>>>0;return random/4294967296;};
  for(let i=0;i<seed.length;i++)seed[i]=rand();
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(positions,3).setUsage(THREE.DynamicDrawUsage));
  const clickOrigin=new THREE.Vector3(),clickDirection=new THREE.Vector3(0,0,-1);
  const clickUniforms={clickOrigin:{value:clickOrigin},clickDirection:{value:clickDirection},clickAge:{value:100}};
  const material=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
    uniforms:{...clickUniforms,tint:{value:new THREE.Color(1,1,1)},power:{value:.25},size:{value:1},ratio:{value:renderer.getPixelRatio()},viewportScale:{value:1}},
    vertexShader:`uniform float ratio;uniform float size;uniform float viewportScale;
      uniform vec3 clickOrigin;uniform vec3 clickDirection;uniform float clickAge;
      varying float clickGlow;
      void main(){
        vec4 world=modelMatrix*vec4(position,1.);
        vec3 relative=world.xyz-clickOrigin;
        float along=dot(relative,clickDirection);
        vec3 radial=relative-clickDirection*along;
        float distanceToClick=length(radial);
        float influence=pow(max(0.,1.-distanceToClick/(.95/3.)),2.)*step(0.,along);
        float decay=exp(-clickAge*1.7);
        float pulse=(1.-exp(-clickAge*14.))*decay;
        world.xyz+=radial/max(distanceToClick,.001)*influence*pulse*1.6;
        clickGlow=influence*pulse*5.;
        vec4 p=viewMatrix*world;gl_Position=projectionMatrix*p;
        gl_PointSize=max(1.0,clamp(20.0*size/-p.z,1.,7.)*ratio*viewportScale)*(1.+clickGlow*.12);
      }`,
    fragmentShader:'uniform vec3 tint;uniform float power;varying float clickGlow;void main(){float d=length(gl_PointCoord-.5)*2.;if(d>1.)discard;gl_FragColor=vec4(tint*(power+clickGlow),pow(1.-d,1.9)*.5);}'

  });
  const points=new THREE.Points(geometry,material);points.frustumCulled=false;scene.add(points);
  const outerPositions=new Float32Array(outerCount*3);
  const outerGeometry=new THREE.BufferGeometry();outerGeometry.setAttribute('position',new THREE.BufferAttribute(outerPositions,3).setUsage(THREE.DynamicDrawUsage));
  const outerMaterial=material.clone();
  for(const name of Object.keys(clickUniforms))outerMaterial.uniforms[name]=material.uniforms[name];outerMaterial.uniforms.power.value=.25;outerMaterial.uniforms.size.value=.85;
  const outerPoints=new THREE.Points(outerGeometry,outerMaterial);outerPoints.name='persistent outer particles';outerPoints.frustumCulled=false;scene.add(outerPoints);
  const light=new THREE.PointLight(0xffffff,0,12,2);light.position.set(0,.2,0);scene.add(light);
  // The existing planar water reflector captures the real moving particle glyph.
  // A local light adds its golden spill to the physical wave surface.
  const sigilLight=new THREE.PointLight(0xffd792,0,2.5,2);sigilLight.position.set(0,-1.53,1.25);scene.add(sigilLight);
  const overlay=document.createElement('div');overlay.className='ritual-flash';overlay.setAttribute('aria-hidden','true');document.querySelector('#app').appendChild(overlay);
  const white=new THREE.Color(1,1,1),gold=new THREE.Color(1,.48,.055);
  const center=new THREE.Vector3(0,.25,0),projected=new THREE.Vector3();
  const sigilPoint=[0,0,0];let sigilStart=null,scatterStart=null,currentTime=0,sigilMix=0,restart=null;
  let sigilPick=null;
  const dismiss=document.querySelector('#sigil-dismiss');
  function scatterSigil(){if(sigilMix>.5&&scatterStart===null)scatterStart=currentTime;}
  if(dismiss?.addEventListener)dismiss.addEventListener('click',scatterSigil);
  if(options.camera&&renderer.domElement){
    const pick=new THREE.Mesh(new THREE.PlaneGeometry(.82,1.12),new THREE.MeshBasicMaterial({visible:false}));
    pick.position.set(0,-1.48,1.25);scene.add(pick);sigilPick=pick;
    const ray=new THREE.Raycaster(),pointer=new THREE.Vector2();let down=null;
    renderer.domElement.addEventListener('pointerdown',e=>{if(sigilMix>.5)down={x:e.clientX,y:e.clientY};});
    renderer.domElement.addEventListener('click',e=>{
      if(sigilMix<=.5||scatterStart!==null||!down||Math.hypot(e.clientX-down.x,e.clientY-down.y)>12)return;
      const rect=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);
      ray.setFromCamera(pointer,options.camera);pick.updateMatrixWorld(true);
      if(ray.intersectObject(pick,false).length)scatterSigil();down=null;
    });
  }
  let clickTime=-100;
  if(options.camera&&renderer.domElement){
    const canvas=renderer.domElement,clickRay=new THREE.Raycaster(),pointer=new THREE.Vector2();let press=null;
    canvas.addEventListener('pointerdown',e=>{
      press=e.button===0&&canvas.style.cursor!=='grab'&&canvas.style.cursor!=='grabbing'?{x:e.clientX,y:e.clientY,id:e.pointerId}:null;
    },true);
    canvas.addEventListener('pointerup',e=>{
      if(!press||press.id!==e.pointerId)return;
      const start=press;press=null;
      if(Math.hypot(e.clientX-start.x,e.clientY-start.y)>8)return;
      const rect=canvas.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,1-(e.clientY-rect.top)/rect.height*2);
      options.camera.updateMatrixWorld(true);clickRay.setFromCamera(pointer,options.camera);
      if(sigilMix>.5&&scatterStart===null&&sigilPick){
        sigilPick.updateMatrixWorld(true);
        if(clickRay.intersectObject(sigilPick,false).length){clickTime=-100;return;}
      }
      scene.updateWorldMatrix(true,false);
      clickOrigin.copy(clickRay.ray.origin);scene.worldToLocal(clickOrigin);
      clickDirection.copy(clickRay.ray.direction).transformDirection(scene.matrixWorld.clone().invert());clickTime=currentTime;
    },true);
    canvas.addEventListener('pointercancel',()=>{press=null;},true);
  }
  function beginRestart(time){
    const source=positions.slice();
    for(let i=0;i<n;i++)for(let axis=0;axis<3;axis++)source[i*3+axis]=source[i*3+axis]*points.scale.getComponent(axis)+points.position.getComponent(axis);
    restart={time,source,outer:outerPositions.slice(),count:points.visible?geometry.drawRange.count===Infinity?n:geometry.drawRange.count:0,power:points.visible?material.uniforms.power.value:0,tint:material.uniforms.tint.value.clone(),outerPower:outerMaterial.uniforms.power.value,outerTint:outerMaterial.uniforms.tint.value.clone(),veil:Number(overlay.style.opacity)||0};
    sigilStart=null;scatterStart=null;
  }
  function update(time,state){
    currentTime=time;
    material.uniforms.clickAge.value=Math.max(0,time-clickTime);
    // Mobile appearance is the reference; strengthen only wide-screen particle coverage.
    const viewportScale=innerWidth>700?1.35:1;
    for(const m of [material,outerMaterial]){
      m.uniforms.viewportScale.value=viewportScale;
      m.uniforms.ratio.value=renderer.getPixelRatio();
    }
    if(!state.finishing&&!state.complete){sigilStart=null;scatterStart=null;}
    if((state.finishing||state.complete)&&sigilStart===null)sigilStart=time;
    const formation=sigilStart===null?0:THREE.MathUtils.smoothstep(time-sigilStart,0,4);
    const scatter=scatterStart===null?0:1-Math.pow(1-THREE.MathUtils.clamp((time-scatterStart)/4.5,0,1),3);
    sigilMix=formation*(1-scatter);
    if(dismiss&&'hidden' in dismiss)dismiss.hidden=sigilMix<.8||scatterStart!==null;

    const p=Math.min(1,state.progress/.95);
    const ending=state.finishing||state.complete;
    const expansionTime=ending?Math.min(1,state.after/.3):0;
    const expansion=Math.pow(expansionTime,3);
    const fade=ending?1-THREE.MathUtils.smoothstep(state.after,.9,2.1):1;
    const scale=1+expansion*25;
    const merge=p*p*(3-2*p);
    if(options.getCenter)options.getCenter(center);
    points.scale.setScalar(scale);
    points.position.set(center.x*merge,.25*(1-scale)+(center.y-.25)*merge,center.z*merge);
    light.position.set(center.x*merge,.25+(center.y-.25)*merge,center.z*merge);
    // Match the white bloom: 90% release during expansion, final 10% during fade.
    const recovery=scatter;
    // Delay the outer layer's gathering, then let it join the center at the end.
    const outerProgress=Math.pow(p,2.6)*(1-recovery);
    const outerGather=outerProgress*outerProgress*(3-2*outerProgress);
    for(let i=0;i<outerCount;i++){
      const individualProgress=scatterStart!==null?0:Math.pow(p,1.1+seed[(n+i)*4+3]*2.8);
      const individualGather=individualProgress*individualProgress*(3-2*individualProgress);
      sampleGatheringMotion(n+i,time,individualProgress,seed,outerPositions,i*3,true);
      outerPositions[i*3]+=center.x*individualGather;
      outerPositions[i*3+1]+=(center.y-.25)*individualGather;
      outerPositions[i*3+2]+=center.z*individualGather;
      if(sigilMix>0){
        sampleSigil(i,outerCount,seed,time,sigilPoint);
        for(let axis=0;axis<3;axis++)outerPositions[i*3+axis]=THREE.MathUtils.lerp(outerPositions[i*3+axis],sigilPoint[axis],sigilMix);
      }
    }
    outerGeometry.attributes.position.needsUpdate=true;
    outerMaterial.uniforms.tint.value.copy(white).lerp(gold,Math.max(outerGather*.45,sigilMix*.65));
    const sigilBrightness=innerWidth<=700?.65:1;
    outerMaterial.uniforms.power.value=.25+outerGather*.08+sigilMix*1.6*sigilBrightness;
    outerMaterial.uniforms.size.value=.85+sigilMix*.25;
    sigilLight.position.y=-1.53+Math.sin(time*1.05)*.024;
    sigilLight.intensity=sigilMix*(1.6+.14*Math.sin(time*1.4))*sigilBrightness;
    points.visible=fade>0;
    for(let i=0;i<n;i++)sampleGatheringMotion(i,time,p,seed,positions,i*3);
    geometry.attributes.position.needsUpdate=true;
    material.uniforms.tint.value.copy(white).lerp(gold,THREE.MathUtils.smoothstep(p,.1,.94));
    const desktopBallBoost=innerWidth>700?1.5:1;
    material.uniforms.power.value=(.19+Math.pow(p,5)*1.65*desktopBallBoost+expansion*3)*fade;
    material.uniforms.size.value=(.82+p*.4)*(1+expansion*2.4);
    light.color.copy(material.uniforms.tint.value);light.intensity=(Math.pow(p,4)*10+expansion*45)*fade;
    bloom.strength=.52+(Math.pow(p,5)*.65+expansion*1.8)*fade;
    // A spatial halo grows with the world-space sphere, rather than a timed flash.
    const radius=Math.hypot(innerWidth,innerHeight)*(.055+expansion*1.8);
    let origin='50% 48%';
    if(options.camera){
      options.camera.updateMatrixWorld(true);projected.copy(center).project(options.camera);
      const rect=renderer.domElement.getBoundingClientRect(),appRect=overlay.parentElement.getBoundingClientRect();
      origin=`${rect.left-appRect.left+(projected.x+1)*rect.width*.5}px ${rect.top-appRect.top+(1-projected.y)*rect.height*.5}px`;
    }
    overlay.style.background=`radial-gradient(circle ${radius}px at ${origin}, #fffaf0 0%, #fff1ca 65%, #ffdb8999 83%, #ffc25200 100%)`;
    const veil=ending?Math.min(1,expansion*4)*fade:0;
    overlay.style.opacity=String(veil);
    if(restart){
      const blend=THREE.MathUtils.smoothstep(time-restart.time,0,2.4);
      geometry.setDrawRange(0,Math.round(restart.count+(n-restart.count)*blend));
      if(restart.count>0)for(let i=0;i<Math.min(n,restart.count)*3;i++)positions[i]=THREE.MathUtils.lerp(restart.source[i],positions[i],blend);
      for(let i=0;i<outerPositions.length;i++)outerPositions[i]=THREE.MathUtils.lerp(restart.outer[i],outerPositions[i],blend);
      material.uniforms.power.value=THREE.MathUtils.lerp(restart.power,material.uniforms.power.value,blend);
      material.uniforms.tint.value.lerpColors(restart.tint,material.uniforms.tint.value,blend);
      outerMaterial.uniforms.power.value=THREE.MathUtils.lerp(restart.outerPower,outerMaterial.uniforms.power.value,blend);
      outerMaterial.uniforms.tint.value.lerpColors(restart.outerTint,outerMaterial.uniforms.tint.value,blend);
      overlay.style.opacity=String(THREE.MathUtils.lerp(restart.veil,veil,blend));
      if(blend>=1){restart=null;geometry.setDrawRange(0,n);}
    }


  }
  return {update,beginRestart,isFinished(){return !restart&&sigilStart!==null&&currentTime-sigilStart>=4;}};
}
