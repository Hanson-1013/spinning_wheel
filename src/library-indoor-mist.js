import * as THREE from 'three';

export function addIndoorMist(root){
 const group=new THREE.Group();group.name='室内轻雾';root.add(group);
 const time={value:0},density={value:.16};
 const material=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,
  uniforms:{mistTime:time,mistDensity:density},
  vertexShader:`varying vec2 mistUv;varying vec3 mistWorld;void main(){mistUv=uv;vec4 p=modelMatrix*vec4(position,1.);mistWorld=p.xyz;gl_Position=projectionMatrix*viewMatrix*p;}`,
  fragmentShader:`uniform float mistTime;uniform float mistDensity;varying vec2 mistUv;varying vec3 mistWorld;
   float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
   float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+1.),f.x),f.y);}
   void main(){vec2 p=mistWorld.xy*.38+vec2(mistTime*.012,mistWorld.z*.37);float cloud=.65*noise(p)+.35*noise(p*2.1);float fade=smoothstep(0.,.12,mistUv.x)*smoothstep(0.,.12,1.-mistUv.x)*smoothstep(0.,.13,mistUv.y)*smoothstep(0.,.1,1.-mistUv.y);gl_FragColor=vec4(vec3(.76,.77,.69),(.025+.065*cloud)*mistDensity*fade);
   #include <tonemapping_fragment>
   #include <colorspace_fragment>
  }`
 });
 for(const z of [-5,-2,1,4,7]){const plane=new THREE.Mesh(new THREE.PlaneGeometry(17.7,7.35),material);plane.position.set(0,1.29,z);plane.userData.dynamic=true;group.add(plane);}
 const prior=root.userData.update;root.userData.update=t=>{prior?.(t);time.value=t;};
 const api={group,setDensity(value){density.value=THREE.MathUtils.clamp(Number(value)/100,0,1);},setVisible(value){group.visible=!!value;}};
 root.userData.indoorMist=api;return api;
}
