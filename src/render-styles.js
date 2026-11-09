import {Vector2} from 'three';
import {ShaderPass} from 'three/addons/postprocessing/ShaderPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';

// A single lightweight analog-film pass on the existing Three.js composer.
export function createRenderStyles(composer,renderer){
 // Normalize the scene exactly once, before applying any film effect.
 // The terminal pass stays fixed for original/zero/film, avoiding output-path changes.
 // Reflections and emissive materials can produce negative or extreme HDR samples.
 // Sanitize before tone mapping so they cannot turn into inverted display colours.
 const hdrGuard=new ShaderPass({uniforms:{tDiffuse:{value:null}},vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`uniform sampler2D tDiffuse;varying vec2 vUv;void main(){vec3 c=texture2D(tDiffuse,vUv).rgb;c=vec3(c.r>=0.?min(c.r,32.):0.,c.g>=0.?min(c.g,32.):0.,c.b>=0.?min(c.b,32.):0.);gl_FragColor=vec4(c,1.);}`});hdrGuard.material.toneMapped=false;composer.addPass(hdrGuard);
 composer.addPass(new OutputPass());
 // Independent night grading: disabled completely during the original daytime look.
 const nightGrade=new ShaderPass({uniforms:{tDiffuse:{value:null},amount:{value:0}},vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`
 uniform sampler2D tDiffuse;uniform float amount;varying vec2 vUv;
 void main(){vec4 source=texture2D(tDiffuse,vUv);vec3 c=source.rgb;float l=dot(c,vec3(.2126,.7152,.0722));
 float shade=1.-smoothstep(.12,.72,l);float middle=smoothstep(.06,.28,l)*(1.-smoothstep(.5,.85,l));
 vec3 blue=c*vec3(.76,.90,1.085)+vec3(.0,.00525,.013)*shade;
 vec3 graded=mix(c,blue,shade*.72);graded+=vec3(.0,.0125,.0115)*middle;
 // Softer night contrast: gently lift black levels and compress bright lamps.
 graded=graded*.86+vec3(.035);
 gl_FragColor=vec4(clamp(mix(c,graded,amount),0.,1.),source.a);}`});
 nightGrade.material.toneMapped=false;nightGrade.enabled=false;composer.addPass(nightGrade);

 const pass=new ShaderPass({uniforms:{tDiffuse:{value:null},resolution:{value:new Vector2(1,1)},pixelScale:{value:renderer.getPixelRatio()},time:{value:0},strength:{value:.4},grain:{value:.056},aberration:{value:1}},vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`
 uniform sampler2D tDiffuse;uniform vec2 resolution;uniform float pixelScale,time,strength,grain,aberration;varying vec2 vUv;
 float lum(vec3 c){return dot(c,vec3(.299,.587,.114));}
 float random(vec2 p){vec3 q=fract(vec3(p.xyx)*.1031);q+=dot(q,q.yzx+33.33);return fract((q.x+q.y)*q.z);}
 vec3 sampleAt(vec2 uv){return clamp(texture2D(tDiffuse,clamp(uv,vec2(.001),vec2(.999))).rgb,vec3(0.),vec3(1.));}
 void main(){
  vec3 original=sampleAt(vUv);if(strength<=0.){gl_FragColor=vec4(original,1.);return;}vec2 px=vec2(pixelScale)/max(resolution,vec2(1.));
  vec2 radial=vUv-.5;
  // Subpixel red/cyan registration error increases gently toward the edges.
  vec2 shift=(vec2(.75,.12)+radial*.8)*aberration*px;
  vec3 color=vec3(sampleAt(vUv+shift).r,original.g,sampleAt(vUv-shift).b);
  vec3 soft=(sampleAt(vUv+vec2(px.x,0.))+sampleAt(vUv-vec2(px.x,0.))+sampleAt(vUv+vec2(0.,px.y))+sampleAt(vUv-vec2(0.,px.y)))*.25;
  color=mix(color,soft,.12);
  vec3 halo=(sampleAt(vUv+px*vec2(3.,2.))+sampleAt(vUv+px*vec2(-3.,2.))+sampleAt(vUv+px*vec2(3.,-2.))+sampleAt(vUv-px*vec2(3.,2.)))*.25;
  color+=max(halo-vec3(.5),vec3(0.))*.018*vec3(1.08,.94,.8);
  // Lift blue-grey shadows, warm the highlights, and slightly mute saturation.
  float l=lum(color),shadow=1.-smoothstep(.05,.5,l),highlight=smoothstep(.35,1.2,l);
  color=mix(vec3(l),color,.82);
  color=color*vec3(.99,1.01,1.025)+shadow*vec3(.018,.022,.03)+highlight*vec3(.008,.004,-.004);

  float vignette=1.-.12*smoothstep(.12,.7,length(radial*vec2(.95,1.)));
  color*=vignette;
  vec2 screen=vUv*resolution/max(pixelScale,1.);float frame=mod(floor(time*24.),1024.);
  vec2 cell=floor(screen*.8);
  float noise=random(cell+vec2(frame*.73,frame*.37))-.5;
  float coarse=random(floor(screen*.4)+vec2(frame*.31,frame*.61))-.5;
  // Compress bright film highlights with a smooth shoulder while preserving shadow contrast.
  float brightness=max(max(color.r,color.g),color.b);
  float compressed=brightness<=.72?brightness:.72+(brightness-.72)/(1.+(brightness-.72)*.55);
  color*=compressed/max(brightness,.00001);
  // Very restrained analog line texture, with no tracking glitches or image jumps.
  color*=1.-.006*(.5+.5*sin(screen.y*3.14159));
  vec3 result=mix(original,clamp(color,vec3(0.),vec3(1.)),strength);
  // Add visible luminance grain LAST, after grading and highlight compression.
  result+=(noise*.78+coarse*.22)*grain*strength*(.9+shadow*.55);
  gl_FragColor=vec4(clamp(result,vec3(0.),vec3(1.)),1.);

 }`});
 pass.material.toneMapped=false;
 pass.setSize=(w,h)=>{pass.uniforms.resolution.value.set(w,h);pass.uniforms.pixelScale.value=renderer.getPixelRatio();};composer.addPass(pass);
 let preset='analog',requestedStrength=.4;
 const syncEnabled=()=>{pass.enabled=true;pass.uniforms.strength.value=preset==='original'?0:requestedStrength;};
 return {setNightTone(value){const amount=Math.max(0,Math.min(1,Number(value)||0));nightGrade.uniforms.amount.value=amount;nightGrade.enabled=amount>0;},setPreset(value){preset=value==='original'?'original':'analog';syncEnabled();},setStrength(v){requestedStrength=Math.max(0,Math.min(1,Number(v)));syncEnabled();},setGrain(v){pass.uniforms.grain.value=Math.max(0,Math.min(.15,Number(v)));},setAberration(v){pass.uniforms.aberration.value=Math.max(0,Math.min(3,Number(v)));},update(t){pass.uniforms.time.value=Number.isFinite(t)?((t%128)+128)%128:0;},getPreset:()=>preset};
}
