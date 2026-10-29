import * as THREE from 'three';
import {LIBRARY_FLOOR_Y,LIBRARY_CEILING_BOTTOM} from './library-window-layout.js';

// Thin drifting mist occupies the exterior gap, rather than fogging the room.
export function addWindowMist(root){
 const time={value:0};
 const material=new THREE.ShaderMaterial({
  transparent:true,depthWrite:false,side:THREE.DoubleSide,
  uniforms:{mistTime:time},
  vertexShader:`varying vec2 mistUv;void main(){mistUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
  fragmentShader:`
   uniform float mistTime;varying vec2 mistUv;
   float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
   float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+1.),f.x),f.y);}
   void main(){
    vec2 p=mistUv*vec2(5.,3.);p.x-=mistTime*.022;
    float cloud=noise(p)*.65+noise(p*2.3+mistTime*.012)*.35;
    float edge=smoothstep(0.,.08,mistUv.x)*smoothstep(0.,.08,1.-mistUv.x)*smoothstep(0.,.12,mistUv.y)*(1.-smoothstep(.35,1.,mistUv.y));
    float density=(.055+.16*cloud)*edge*mix(1.,.5,mistUv.y);
    gl_FragColor=vec4(mix(vec3(.66,.75,.66),vec3(.86,.83,.69),mistUv.y),density);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
   }`
 });
 const mist=new THREE.Group();mist.name='前后排植物之间 · 渐隐薄雾';root.add(mist);
 function plane(width,x,z,angle){const height=(LIBRARY_CEILING_BOTTOM-LIBRARY_FLOOR_Y)/2+1;const mesh=new THREE.Mesh(new THREE.PlaneGeometry(width,height),material);mesh.position.set(x,LIBRARY_FLOOR_Y+height/2,z);mesh.rotation.y=angle;mesh.userData.dynamic=true;mesh.renderOrder=1;mist.add(mesh);}
 plane(19,0,-9.6,0);
 for(const side of [-1,1])plane(16,side*12.5,2.6757,-side*Math.PI/2);
 const previous=root.userData.update;root.userData.update=t=>{previous?.(t);time.value=t;};
 return mist;
}
