import {Vector2} from 'three';
import {ShaderPass} from 'three/addons/postprocessing/ShaderPass.js';

// Reuse the existing EffectComposer; the original preset bypasses this pass entirely.
export function createRenderStyles(composer,renderer){
 const pass=new ShaderPass({uniforms:{tDiffuse:{value:null},resolution:{value:new Vector2(1,1)},mode:{value:1},strength:{value:.8},brush:{value:4},pixelScale:{value:renderer.getPixelRatio()}},vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`
 uniform sampler2D tDiffuse;uniform vec2 resolution;uniform float mode,strength,brush,pixelScale;varying vec2 vUv;
 float lum(vec3 c){return dot(c,vec3(.299,.587,.114));}
 float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
 vec3 sampleAt(vec2 uv){return texture2D(tDiffuse,clamp(uv,vec2(.001),vec2(.999))).rgb;}
 void main(){
  vec3 original=sampleAt(vUv),best=original;float minVariance=1.e20;
  vec2 stepUV=vec2(brush*pixelScale)/max(resolution,vec2(1.));
  // Four overlapping directional regions: keep the smoothest to retain painted edges.
  for(int region=0;region<4;region++){
   vec2 signUV=vec2(region==0||region==2?-1.:1.,region<2?-1.:1.);
   vec3 mean=vec3(0.),square=vec3(0.);
   for(int x=0;x<3;x++)for(int y=0;y<3;y++){
    vec2 offset=vec2(float(x),float(y))*.5*signUV;
    if(mode<1.5)offset=mat2(.92,-.39,.39,.92)*offset;
    vec3 c=sampleAt(vUv+offset*stepUV);mean+=c;square+=c*c;
   }
   mean/=9.;vec3 variance=abs(square/9.-mean*mean);float score=dot(variance,vec3(1.));
   if(score<minVariance){minVariance=score;best=mean;}
  }
  vec2 screen=vUv*resolution/max(pixelScale,1.);vec3 painted=best;
  if(mode<1.5){
   float weave=sin(screen.x*2.2)*sin(screen.y*2.4),stroke=sin(screen.x*.7+sin(screen.y*.15)*3.);
   painted=mix(vec3(lum(best)),best,1.16)*vec3(1.035,1.005,.96);
   painted*=1.+.016*weave+.012*stroke;
  }else if(mode<2.5){
   vec3 mapped=best/(vec3(1.)+best);mapped=floor(mapped*8.+.5)/8.;
   painted=mapped/max(vec3(.08),vec3(1.)-mapped);
   painted=mix(vec3(lum(painted)),painted,1.12);
   painted*=.99+.01*sin(screen.x*1.8)*sin(screen.y*1.8);
  }else{
   float light=clamp(lum(best),0.,1.);light=floor(light*5.+.5)/5.;
   painted=mix(vec3(.045,.055,.043),vec3(.92,.84,.65),light);
   float hatch=smoothstep(.35,.55,fract((screen.x+screen.y)*.17));
   painted*=1.-(1.-light)*hatch*.22;
  }
  gl_FragColor=vec4(mix(original,max(painted,vec3(0.)),strength),1.);
 }`});
 pass.enabled=false;pass.setSize=(w,h)=>{pass.uniforms.resolution.value.set(w,h);pass.uniforms.pixelScale.value=renderer.getPixelRatio();};composer.addPass(pass);
 let preset='original';const modes={original:0,impression:1,blocks:2,engraving:3};
 return {setPreset(value){preset=Object.hasOwn(modes,value)?value:'original';pass.enabled=preset!=='original';pass.uniforms.mode.value=modes[preset];},setStrength(value){pass.uniforms.strength.value=Math.max(0,Math.min(1,Number(value)));},setBrush(value){pass.uniforms.brush.value=Math.max(1,Math.min(10,Number(value)));},getPreset:()=>preset};
}
