import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';

export function createNixieTelevisions(){
 const root=new THREE.Group();root.name='辉光钟旁 · 四台复古电视与书堆';
 const time={value:0};
 const bronze=new THREE.MeshStandardMaterial({color:0x7f7053,roughness:.55,metalness:.45}),black=new THREE.MeshStandardMaterial({color:0x1b2823,roughness:.7}),paper=new THREE.MeshStandardMaterial({color:0x9b927b,roughness:1});
 function box(parent,w,h,d,x,y,z,m,r=.003){const mesh=new THREE.Mesh(new RoundedBoxGeometry(w,h,d,2,r),m);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
 function television(width,height,depth,x,y,z,variant,on){
  const tv=new THREE.Group();tv.name='老式CRT电视机';tv.position.set(x,y,z);tv.rotation.y=variant*.07;root.add(tv);
  const shell=new THREE.MeshStandardMaterial({color:[0x6d634d,0x454d40,0x827961,0x3d4238][variant],roughness:.8});
  box(tv,width,height,depth,0,height/2,0,shell,.014);
  box(tv,width*.94,height*.9,.012,0,height*.51,depth/2+.003,bronze,.009);
  const screenW=width*.71,screenH=height*.73,cx=-width*.075,cy=height*.53;
  box(tv,screenW+.025,screenH+.025,.014,cx,cy,depth/2+.014,black,.014);
  const geometry=new THREE.PlaneGeometry(screenW,screenH,24,20),p=geometry.attributes.position;
  for(let i=0;i<p.count;i++){const u=p.getX(i)/(screenW/2),v=p.getY(i)/(screenH/2);p.setZ(i,.014*(1-u*u)*(1-v*v));}geometry.computeVertexNormals();
  const screenMat=new THREE.ShaderMaterial({uniforms:{crtTime:time,crtOn:{value:on?1:0},crtPhase:{value:variant}},vertexShader:'varying vec2 crtUv;void main(){crtUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`varying vec2 crtUv;uniform float crtTime;uniform float crtOn;uniform float crtPhase;
   void main(){vec2 p=crtUv;float vignette=pow(max(0.,16.*p.x*(1.-p.x)*p.y*(1.-p.y)),.3);float line=exp(-pow((p.y-(.5+.25*sin(crtTime*.23+crtPhase)))*110.,2.));float scan=.91+.09*sin(p.y*400.);vec3 off=vec3(.035,.053,.047)*(.6+.4*vignette);vec3 on=vec3(.08,.24,.24)*vignette*scan+vec3(.2,.5,.48)*line;gl_FragColor=vec4(mix(off,on,crtOn),1.);
   #include <tonemapping_fragment>
   #include <colorspace_fragment>
  }`});
  const glass=new THREE.Mesh(geometry,screenMat);glass.position.set(cx,cy,depth/2+.026);tv.add(glass);
  for(let i=0;i<2;i++){
   const knob=new THREE.Mesh(new THREE.CylinderGeometry(width*.037,width*.037,.012,20),bronze);knob.rotation.x=Math.PI/2;knob.position.set(width*.39,height*(.72-i*.2),depth/2+.026);tv.add(knob);
   const marker=box(tv,.003,height*.035,.003,width*.39,height*(.72-i*.2),depth/2+.034,black,.0005);marker.rotation.z=.3+variant;
  }
  for(let i=0;i<10;i++)box(tv,width*.105,.002,.003,width*.385,height*.14+i*.009,depth/2+.027,black,.0005);
  for(let i=0;i<12;i++)box(tv,.002,height*.12,.003,-width/2-.001,height*.45,-depth*.35+i*depth*.055,black,.0005);
  for(const sx of [-1,1])box(tv,.035,.018,.055,sx*width*.34,-.007,0,black);
  const antenna=new THREE.Mesh(new THREE.CylinderGeometry(.0014,.0018,height*.7,8),bronze);antenna.position.set(width*.24,height*1.23,-depth*.25);antenna.rotation.z=-.35;tv.add(antenna);
  return tv;
 }
 // Two unequal pairs stand to the side of the silk platform.
 television(.46,.35,.29,1.24,-.382,.49,0,false);
 television(.27,.215,.22,1.245,-.022,.48,1,true);
 television(.35,.28,.26,1.73,-.382,.43,2,true);
 television(.235,.18,.19,1.71,-.092,.42,3,false);
 function book(w,d,h,x,y,z,i){const group=new THREE.Group();group.name='落地装订书本';group.position.set(x,y,z);group.rotation.y=(i%3-1)*.12;root.add(group);const cover=new THREE.MeshStandardMaterial({color:[0x4a3527,0x635137,0x333d30][i%3],roughness:.88});box(group,w,h,d,0,h/2,0,paper);for(const yy of [0,h])box(group,w+.012,.006,d+.012,0,yy,0,cover);box(group,.009,h,d+.01,-w/2,h/2,0,cover);}
 let y=-.396;for(let i=0;i<6;i++){book(.33+(i%2)*.04,.23,.035,.76,y,.81,i);y+=.043;}
 for(let i=0;i<2;i++)book(.25,.19,.032,1.73,-.396+i*.04,.85,i+1);
 root.userData.update=t=>time.value=t;return root;
}
