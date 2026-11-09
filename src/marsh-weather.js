// Shared procedural fields keep cloud shading coherent across sky, stone and water.
export const MARSH_NOISE_GLSL=`
 float marshHash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
 float marshNoise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(marshHash(i),marshHash(i+vec2(1.,0.)),f.x),mix(marshHash(i+vec2(0.,1.)),marshHash(i+1.),f.x),f.y);}
 float marshFbm(vec2 p){float n=0.,a=.55;for(int i=0;i<4;i++){n+=a*marshNoise(p);p=mat2(.8,-.6,.6,.8)*p*2.03+vec2(5.2,1.7);a*=.48;}return n;}
`;
export const MARSH_CLOUD_SHADOW_GLSL=`
 float marshCloudShadow(vec2 p,float time){
  float field=marshFbm(p*.075+vec2(time*.006,2.4));
  float overhead=exp(-dot((p-vec2(-6.,-3.))/vec2(8.,13.),(p-vec2(-6.,-3.))/vec2(8.,13.)));
  return clamp(smoothstep(.28,.67,field)*.62+overhead*.26,0.,.78);
 }
`;

export function weatherMarshStone(material,time){
 material.onBeforeCompile=shader=>{
  shader.uniforms.marshTime=time;shader.uniforms.largeRuinCracks={value:material.userData.largeRuinCracks?1:0};
  shader.vertexShader='varying vec3 marshStoneWorld;varying vec2 marshStoneUv;\n'+shader.vertexShader;
  shader.vertexShader=shader.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\nmarshStoneWorld=(modelMatrix*vec4(transformed,1.)).xyz;marshStoneUv=uv;');
  shader.fragmentShader='uniform float marshTime,largeRuinCracks;varying vec3 marshStoneWorld;varying vec2 marshStoneUv;\n'+MARSH_NOISE_GLSL+MARSH_CLOUD_SHADOW_GLSL+shader.fragmentShader;
  shader.fragmentShader=`
   float marshNoise(vec2 p);float marshFbm(vec2 p);
   float ruinCrackSegment(vec2 p,vec2 a,vec2 b,float width){
    vec2 warped=p+vec2(marshNoise(p*19.+1.7),marshNoise(p*23.+8.1))*.035+vec2(marshNoise(p*5.7),marshNoise(p*6.3+4.))*.045;
    vec2 ab=b-a;float t=clamp(dot(warped-a,ab)/dot(ab,ab),0.,1.);float d=length(warped-a-ab*t);
    float w=width*(.5+marshNoise(p*31.7)*1.1);
    return (1.-smoothstep(w,w+max(fwidth(d)*.7,.002),d))*(.58+.42*marshNoise(p*57.));
   }
   float ruinBranchingCracks(vec2 p){float c=0.;
    c=max(c,ruinCrackSegment(p,vec2(1.20,2.7),vec2(1.10,1.9),.019));
    c=max(c,ruinCrackSegment(p,vec2(1.10,1.9),vec2(1.35,1.4),.018));
    c=max(c,ruinCrackSegment(p,vec2(1.35,1.4),vec2(1.23,.9),.017));
    c=max(c,ruinCrackSegment(p,vec2(1.23,.9),vec2(1.45,.45),.012));
    c=max(c,ruinCrackSegment(p,vec2(1.35,1.4),vec2(.98,1.18),.012));
    c=max(c,ruinCrackSegment(p,vec2(.98,1.18),vec2(.72,.72),.008));
    c=max(c,ruinCrackSegment(p,vec2(2.10,1.8),vec2(2.25,1.18),.017));
    c=max(c,ruinCrackSegment(p,vec2(2.25,1.18),vec2(2.05,.7),.014));
    c=max(c,ruinCrackSegment(p,vec2(2.05,.7),vec2(2.38,.2),.01));
    c=max(c,ruinCrackSegment(p,vec2(3.04,1.05),vec2(2.9,.8),.012));
    c=max(c,ruinCrackSegment(p,vec2(2.9,.8),vec2(3.2,.5),.009));return c;
   }\n`+shader.fragmentShader;
  shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
   vec2 stoneUv=vec2(marshStoneWorld.x+marshStoneWorld.z*.71,marshStoneWorld.y-marshStoneWorld.z*.37);
   float weather=marshFbm(stoneUv*1.8),grain=marshNoise(stoneUv*42.);
   float pits=smoothstep(.64,.87,marshNoise(stoneUv*21.3));
   float crack=(1.-smoothstep(.006,.026,abs(marshNoise(stoneUv*4.7)-.48)))*smoothstep(.35,.7,weather);
   vec3 mineral=mix(vec3(.63,.59,.5),vec3(1.26,1.22,1.09),smoothstep(.2,.75,weather));
   float fracture=ruinBranchingCracks(marshStoneUv)*largeRuinCracks;
   float peeling=smoothstep(.49,.73,marshNoise(stoneUv*7.3+vec2(1.7,4.)))*smoothstep(.34,.65,weather);
   diffuseColor.rgb*=1.-fracture*.45;
   diffuseColor.rgb*=mix(vec3(1.),vec3(.76,.71,.61),peeling*.5);
   diffuseColor.rgb*=mineral*(.88+.22*grain)*(1.-pits*.3)*(1.-crack*.38);
   float stoneHeight=weather*.023+grain*.0025-pits*.008-crack*.005-fracture*.013-peeling*.012;`);
  shader.fragmentShader=shader.fragmentShader.replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
   vec3 stoneDx=dFdx(-vViewPosition),stoneDy=dFdy(-vViewPosition);
   vec3 stoneR1=cross(stoneDy,normal),stoneR2=cross(normal,stoneDx);
   float stoneDet=dot(stoneDx,stoneR1);
   vec3 stoneGradient=dFdx(stoneHeight)*stoneR1+dFdy(stoneHeight)*stoneR2;
   normal=normalize(abs(stoneDet)*normal-sign(stoneDet)*stoneGradient);`);
  shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>',`outgoingLight*=1.-marshCloudShadow(marshStoneWorld.xz,marshTime)*.24;\n#include <opaque_fragment>`);
 };
 material.customProgramCacheKey=()=> 'marsh-weathered-stone-v1';
 material.needsUpdate=true;
}
