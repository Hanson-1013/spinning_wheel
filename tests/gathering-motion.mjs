import assert from 'node:assert/strict';
import {sampleGatheringMotion} from '../src/gathering-motion.js';
const seeds=new Float32Array(400*4);
let n=913;for(let i=0;i<seeds.length;i++){n=(Math.imul(n,1664525)+1013904223)>>>0;seeds[i]=n/4294967296;}
const a=[0,0,0],b=[0,0,0];let up=0,down=0;
for(let i=0;i<400;i++){
 for(const p of [0,.1,.4,.7,.99,1]){
  sampleGatheringMotion(i,12,p,seeds,a);sampleGatheringMotion(i,12.00001,p+.000001,seeds,b);
  assert.ok(a.every(Number.isFinite));assert.ok(Math.hypot(...a)<12);
  assert.ok(Math.hypot(...a.map((v,k)=>v-b[k]))<.01,'continuous paths');
 }
 sampleGatheringMotion(i,12,1,seeds,a);assert.ok(Math.hypot(a[0],a[1]-.25,a[2])<=.638,'compact endpoint');
 sampleGatheringMotion(i,12,.4,seeds,a);sampleGatheringMotion(i,12.01,.4,seeds,b);
 if(b[1]>a[1])up++;else down++;
}
assert.ok(up>50&&down>50,'flow must not share a single upward rotation');
console.log('PASS: finite trajectories, continuity, compact sphere and bidirectional vertical flow', {up,down});

for(const progress of [0,.25,.6]){
 let moving=0;
 for(let i=0;i<400;i++){
  sampleGatheringMotion(i,4,progress,seeds,a);sampleGatheringMotion(i,5,progress,seeds,b);
  if(Math.hypot(...a.map((v,k)=>v-b[k]))>.03)moving++;
 }
 assert.ok(moving>350,'particles must wander at fixed progress, including idle');
}
console.log('PASS: independent wandering while idle and while holding gathering progress');

let central=0,far=0;for(let i=0;i<400;i++){sampleGatheringMotion(i,0,0,seeds,a,0,true);const r=Math.hypot(a[0],a[1]-.25,a[2]);if(r<2)central++;if(r>4)far++;}assert.ok(central>far*2);console.log('PASS: persistent layer has a filled center with a sparse outer tail',{central,far});

const {sampleSolidRadius}=await import('../src/gathering-motion.js');
assert.equal(sampleSolidRadius(0),0);assert.equal(sampleSolidRadius(1),1);
let previousRadius=0;for(let i=0;i<=1000;i++){const r=sampleSolidRadius(i/1000);assert.ok(r>=previousRadius);previousRadius=r;const r2=r*r,cdf=r*r2*(35-42*r2+15*r2*r2)/8;assert.ok(Math.abs(cdf-i/1000)<.0001);}
let innerSolid=0,edgeSolid=0;for(let i=0;i<400;i++){sampleGatheringMotion(i,12,1,seeds,a,0,true);const normalized=Math.hypot(a[0],a[1]-.25,a[2])/(.75*.98*.65);if(normalized<.5)innerSolid++;if(normalized>.9)edgeSolid++;}
assert.ok(innerSolid>edgeSolid*5);console.log('PASS: filled central sphere, decreasing volume density, zero-density boundary',{innerSolid,edgeSolid});
