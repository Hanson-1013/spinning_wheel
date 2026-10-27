import * as THREE from 'three';

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
    float edge=smoothstep(0.,.08,mistUv.x)*smoothstep(0.,.08,1.-mistUv.x)*smoothstep(0.,.12,mistUv.y)*smoothstep(0.,.15,1.-mistUv.y);
    float density=(.055+.16*cloud)*edge*mix(1.,.5,mistUv.y);
    gl_FragColor=vec4(mix(vec3(.66,.75,.66),vec3(.86,.83,.69),mistUv.y),density);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
   }`
 });
 const mist=new THREE.Group();mist.name='玻璃外侧 · 缓慢流动薄雾';root.add(mist);
 function plane(width,x,z,angle){const mesh=new THREE.Mesh(new THREE.PlaneGeometry(width,7.7),material);mesh.position.set(x,1.4,z);mesh.rotation.y=angle;mesh.userData.dynamic=true;mesh.renderOrder=1;mist.add(mesh);}
 plane(14,0,-6.55,0);
 for(const side of [-1,1])plane(13.15,side*9.96,2.92,-side*Math.PI/2);
 const previous=root.userData.update;root.userData.update=t=>{previous?.(t);time.value=t;};
 return mist;
}
