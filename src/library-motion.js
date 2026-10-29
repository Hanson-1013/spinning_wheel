import * as THREE from 'three';

// Shader wind keeps dense foliage batched instead of animating thousands of objects.
export function setupLibraryMotion(root){
 const time={value:0},materials=new Set(),frames=[],hanging=[];
 root.traverse(object=>{
  if(object.isMesh)for(const m of Array.isArray(object.material)?object.material:[object.material])if(m.userData.foliage)materials.add(m);
  if(object.name==='错落悬挂空画框'||object.userData.hangingFrame)hanging.push(object);
 });
 for(const object of hanging){
   const pivot=new THREE.Group();pivot.position.copy(object.position);pivot.position.y+=object.userData.frameHeight/2;
   object.parent.add(pivot);object.position.set(0,-object.userData.frameHeight/2,0);pivot.add(object);
   object.traverse(part=>{if(part.isMesh)part.userData.dynamic=true;});
   frames.push({pivot,phase:frames.length*1.7});
 }
 for(const material of materials){
  const prior=material.onBeforeCompile,cache=material.customProgramCacheKey.bind(material);
  material.onBeforeCompile=function(shader,renderer){
   prior.call(this,shader,renderer);shader.uniforms.libraryWindTime=time;
   shader.vertexShader='uniform float libraryWindTime;\n'+shader.vertexShader;
   shader.vertexShader=shader.vertexShader.replace('#include <project_vertex>',`
    vec4 windPosition=vec4(transformed,1.0);
    #ifdef USE_INSTANCING
     windPosition=instanceMatrix*windPosition;
    #endif
    windPosition=modelMatrix*windPosition;
    float phase=windPosition.x*.85+windPosition.z*.63;
    float breeze=sin(libraryWindTime*.8+phase)*.156+sin(libraryWindTime*1.31+phase*1.6)*.054;
    vec3 windWorld=vec3(breeze,0.,breeze*.45)*smoothstep(-2.2,1.5,windPosition.y);
    // modelMatrix has unit scale for the merged foliage and instanced leaf batches.
    vec4 mvPosition=viewMatrix*(windPosition+vec4(windWorld,0.));
    gl_Position=projectionMatrix*mvPosition;
   `);
  };
  const key=cache();material.customProgramCacheKey=()=>key+'-library-breeze-v1';material.needsUpdate=true;
 }
 const previous=root.userData.update;
 root.userData.update=t=>{previous?.(t);time.value=t;for(const {pivot,phase} of frames){pivot.rotation.z=Math.sin(t*.65+phase)*.108;pivot.rotation.y=Math.sin(t*.51+phase)*.15;}};
 return {materials:materials.size,frames:frames.length};
}
