import assert from 'node:assert/strict';
import {morphTarget} from '../src/shapes.js';
import {createRainState,respawnRain,stepRain} from '../src/rain-state.js';
const seeds=new Float32Array([1.1,2.3,.7,.28]),out=[0,0,0];
for(let t=0;t<=60;t+=.037){morphTarget(0,t,seeds,out);assert.ok(out.every(Number.isFinite));assert.ok(Math.hypot(...out)<3);}
for(const t of [6,10,16,20,26,30]){const a=[],b=[];morphTarget(0,t-1e-5,seeds,a);morphTarget(0,t+1e-5,seeds,b);assert.ok(Math.hypot(...a.map((v,i)=>v-b[i]))<.001,'continuous transition at '+t);}
const shapes=[0,10,20].map(t=>{const p=[];morphTarget(0,t,seeds,p);return p;});assert.ok(Math.hypot(...shapes[0].map((v,i)=>v-shapes[1][i]))>.2);
let seed=4;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
const state=createRainState(random);let hits=0;const spots=new Set();
for(let i=0;i<3600;i++){
 const visible=stepRain(state,1/60,-2.035,(x,z)=>{hits++;spots.add(x.toFixed(2)+','+z.toFixed(2));assert.ok(Math.abs(x)<=2.35&&Math.abs(z)<=1.6);},random);
 assert.equal(typeof visible,'boolean');for(const k of ['x','y','z','velocity','wait','size'])assert.ok(Number.isFinite(state[k]),k);
 assert.ok(state.size>=.38&&state.size<=.68);
}
assert.ok(hits>5&&spots.size>3,'repeated rain must vary landing sites');
respawnRain(state,random,true);const y=state.y;stepRain(state,0,-2.035,()=>assert.fail('zero dt impact'),random);assert.equal(state.y,y);
console.log('PASS: finite shapes, continuous morphs, bounded random rain, repeated impacts and zero-dt stability');
