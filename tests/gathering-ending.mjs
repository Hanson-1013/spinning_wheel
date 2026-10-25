import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createGatheringLight} from '../src/gathering-light.js';
// Exercise the actual animation update, including the completed-only branch.
const overlays=[];
globalThis.innerWidth=900;globalThis.innerHeight=700;
globalThis.document={
  createElement:()=>({style:{},setAttribute(){}}),
  querySelector:()=>({appendChild(node){overlays.push(node);}}),
};
const scene=new THREE.Scene(),bloom={strength:.65};
const effect=createGatheringLight(scene,{getPixelRatio:()=>1},bloom);
for(const progress of [0,.5,.99])effect.update(1,{progress,complete:false,after:0});
for(const after of [0,.1,.3,.4,.8,.9,1.5,2.1,3]){
 effect.update(2+after,{progress:.8+.2*Math.min(1,after/2.1),finishing:true,complete:after>=2.1,after});
 const opacity=Number(overlays[0].style.opacity);
 assert.ok(Number.isFinite(opacity)&&opacity>=0&&opacity<=1);
 assert.ok(Number.isFinite(bloom.strength));
 if(after===.4||after===.8)assert.equal(opacity,1);
 if(after>=2.1)assert.equal(opacity,0);
}
assert.equal(scene.children.find(x=>x.isPoints).visible,false);
effect.update(0,{progress:0,complete:false,after:0});
assert.equal(overlays[0].style.opacity,'0');
assert.equal(scene.children.find(x=>x.isPoints).visible,true);
console.log('PASS: completed animation, expansion, 0.6s hold and 1.2s fade, fade-out and replay');

const {createRitualState,pullRitual,updateRitual}=await import('../src/ritual-state.js');
const state=createRitualState();pullRitual(state,720);let previous=0,sawExpansion=false,sawFade=false;
for(let i=0;i<2000;i++){
 updateRitual(state,1/60);effect.update(i/60,state);
 assert.ok(state.progress>=previous);previous=state.progress;
 if(state.finishing){if(state.after>0&&state.after<.3)sawExpansion=true;if(state.after>.9)sawFade=true;}
 if(state.complete&&state.after>=2.1)break;
}
assert.ok(sawExpansion&&sawFade);assert.equal(state.progress,1);assert.ok(state.complete);assert.equal(Number(overlays[0].style.opacity),0);
console.log('PASS: effect continues on elapsed seconds after wheel handoff; exact one-turn endpoint');

// The effect boundary must not restart, pause or accelerate the wheel.
const smooth=createRitualState();pullRitual(smooth,720);
let lastProgress=0,lastVelocity=null,crossed=false;
for(let i=0;i<700;i++){
 const before=smooth.finishing;updateRitual(smooth,1/120);
 const velocity=(smooth.progress-lastProgress)*120;
 if(!before&&smooth.finishing){assert.ok(velocity>0);assert.ok(Math.abs(velocity-lastVelocity)<.005);crossed=true;}
 lastProgress=smooth.progress;lastVelocity=velocity;
}
assert.ok(crossed,'must cross the effect boundary without switching motion curves');
console.log('PASS: continuous angular velocity at gathering/expansion boundary');

const reversible=createRitualState();pullRitual(reversible,300);
for(let i=0;i<250;i++)updateRitual(reversible,1/60);
const forward=reversible.progress;assert.ok(forward>.4&&forward<.8);
pullRitual(reversible,-180);
for(let i=0;i<200;i++)updateRitual(reversible,1/60);
assert.ok(reversible.progress<forward);assert.equal(reversible.finishing,false);
pullRitual(reversible,-1000);
for(let i=0;i<300;i++)updateRitual(reversible,1/60);
assert.equal(reversible.progress,0);assert.equal(reversible.distance,0);
pullRitual(reversible,720);
for(let i=0;i<600&&!reversible.finishing;i++)updateRitual(reversible,1/60);
assert.ok(reversible.finishing);const distance=reversible.distance;
pullRitual(reversible,-720);assert.equal(reversible.distance,distance);
console.log('PASS: bidirectional scrubbing, return to zero, automatic ending only after 95%');

const late=createRitualState();pullRitual(late,680);for(let i=0;i<500;i++)updateRitual(late,1/60);assert.ok(late.progress>.9&&late.progress<.95);assert.equal(late.finishing,false);pullRitual(late,40);while(!late.finishing)updateRitual(late,1/60);assert.ok(late.progress>=.95);console.log('PASS: final bloom begins only in the last 5% of wheel rotation');

const manual=createRitualState();pullRitual(manual,180);updateRitual(manual,1/60);assert.ok(manual.progress>0&&manual.progress<.25,'manual motion must be damped');for(let i=0;i<500;i++)updateRitual(manual,1/60);assert.ok(Math.abs(manual.progress-.25)<.001);assert.equal(manual.finishing,false);pullRitual(manual,-90);for(let i=0;i<500;i++)updateRitual(manual,1/60);assert.ok(Math.abs(manual.progress-.125)<.001);console.log('PASS: signed wheel-angle mapping, damped manual following and no early auto rotation');

effect.update(1,{progress:.5,finishing:false,complete:false,after:0});
const mid=scene.children.find(x=>x.isPoints);
assert.equal(mid.geometry.attributes.position.count,6300);
assert.ok(mid.material.uniforms.power.value<.3);
assert.ok(mid.material.uniforms.size.value<1.1);
assert.ok(bloom.strength<.6);
console.log('PASS: mid-progress particle density, brightness, size and bloom remain restrained');

const outer=scene.getObjectByName('persistent outer particles');assert.ok(outer&&outer.visible);assert.equal(outer.geometry.attributes.position.count,2200);effect.update(40,{progress:1,complete:true,finishing:true,after:2.1});effect.update(45,{progress:1,complete:true,finishing:true,after:2.1});assert.equal(outer.visible,true);assert.ok(outer.geometry.attributes.position.array.every(Number.isFinite));console.log('PASS: persistent outer layer survives ending and disperses with finite positions');

effect.update(50,{progress:0,complete:false,finishing:false,after:0});
effect.update(51,{progress:1,complete:false,finishing:true,after:0});
effect.update(52,{progress:1,complete:true,finishing:true,after:2.1});
effect.update(56.1,{progress:1,complete:true,finishing:true,after:2.1});
for(let i=0;i<outer.geometry.attributes.position.count;i++)assert.ok(Math.abs(outer.geometry.attributes.position.getZ(i)-1.25)<.12);
assert.equal(Number(overlays[0].style.opacity),0);
console.log('PASS: outer particles remain in sigil after white light disappears');

const timing=createRitualState();timing.finishing=true;timing.complete=true;timing.progress=1;
for(let i=0;i<60;i++)updateRitual(timing,1/60);assert.ok(Math.abs(timing.after-1)<1e-9);
const old=timing.after;updateRitual(timing,1/30,.2);assert.ok(Math.abs(timing.after-old-.2)<1e-9);
console.log('PASS: real elapsed seconds, independent of wheel angle and simulation step cap');

const {releaseRitual,grabRitual}=await import('../src/ritual-state.js');
const released=createRitualState();pullRitual(released,500);for(let i=0;i<170;i++)updateRitual(released,1/60);releaseRitual(released);for(let i=0;i<600;i++)updateRitual(released,1/60);assert.equal(released.progress,0);assert.equal(released.finishing,false);
pullRitual(released,720);for(let i=0;i<600&&!released.finishing;i++)updateRitual(released,1/60);releaseRitual(released);assert.equal(released.finishing,true);
const caught=createRitualState();pullRitual(caught,300);for(let i=0;i<150;i++)updateRitual(caught,1/60);releaseRitual(caught);updateRitual(caught,1/60);grabRitual(caught);assert.ok(Math.abs(caught.distance-caught.progress*720)<1e-9);assert.equal(caught.returning,false);
console.log('PASS: release below 95% returns to zero; ending stays latched; regrab starts from current angle');
