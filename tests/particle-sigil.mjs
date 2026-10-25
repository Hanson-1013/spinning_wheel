import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createGatheringLight} from '../src/gathering-light.js';
let activate;const dismiss={hidden:true,addEventListener(event,fn){activate=fn;}};
globalThis.innerWidth=900;globalThis.innerHeight=700;
globalThis.document={createElement:()=>({style:{},setAttribute(){}}),querySelector:selector=>selector==='#sigil-dismiss'?dismiss:{appendChild(){}}};
const scene=new THREE.Scene();const effect=createGatheringLight(scene,{getPixelRatio:()=>1},{strength:0});
const state={progress:1,finishing:true,complete:true,after:2.1};
effect.update(100,{...state,complete:false,after:0});effect.update(101,{...state,complete:false,after:.9});effect.update(102,state);effect.update(105.1,state);
const outer=scene.getObjectByName('persistent outer particles');const p=outer.geometry.attributes.position;
for(let i=0;i<p.count;i++){assert.ok(Math.abs(p.getX(i))<.34);assert.ok(p.getY(i)>-1.9&&p.getY(i)<-.95);assert.ok(Math.abs(p.getZ(i)-1.25)<.12);}
assert.equal(dismiss.hidden,false);activate();assert.equal(effect.isFinished(),true,'replay remains available when scattering starts');effect.update(107,state);assert.equal(effect.isFinished(),true);assert.equal(dismiss.hidden,true);
effect.update(109.7,state);
let far=0;for(let i=0;i<p.count;i++)if(Math.abs(p.getX(i))>1)far++;assert.ok(far>500);
effect.update(0,{progress:0,finishing:false,complete:false,after:0});assert.equal(dismiss.hidden,true);
console.log('PASS: particle sigil forms above front water, activation disperses it, replay resets');

const scene2=new THREE.Scene(),effect2=createGatheringLight(scene2,{getPixelRatio:()=>1},{strength:0});
effect2.update(0,{progress:.95,finishing:true,complete:false,after:0});
const source=scene2.getObjectByName('persistent outer particles').geometry.attributes.position;
let sum=0;for(let i=0;i<source.count;i++)sum+=Math.hypot(source.getX(i),source.getY(i)-.25,source.getZ(i));assert.ok(sum/source.count<.5,'start directly from contracted ball');
effect2.update(.9,{progress:1,finishing:true,complete:false,after:.9});
assert.equal(dismiss.hidden,true);
effect2.update(2.1,{progress:1,finishing:true,complete:true,after:2.1});
effect2.update(2.2,{progress:1,finishing:true,complete:true,after:2.1});
assert.equal(dismiss.hidden,true,'halfway through the four-second formation, glyph is not yet clickable');
effect2.update(5.2,{progress:1,finishing:true,complete:true,after:2.1});
for(let i=0;i<source.count;i++)assert.ok(Math.abs(source.getZ(i)-1.25)<.12,'move directly into the sigil after white fade ends');
console.log('PASS: smallest cloud moves directly to sigil without scattering first');

const snapshot=Array.from(source.array);effect2.update(5.6,{progress:1,finishing:true,complete:true,after:2.1});assert.notDeepEqual(Array.from(source.array),snapshot);console.log('PASS: formed glyph keeps a subtle floating particle motion');

const densityScene=new THREE.Scene();
const scaled=createGatheringLight(densityScene,{getPixelRatio:()=>2},{strength:0});
globalThis.innerWidth=390;scaled.update(0,{progress:0,complete:false,finishing:false,after:0});
const cloud=densityScene.children.find(x=>x.isPoints);assert.equal(cloud.material.uniforms.viewportScale.value,1);
globalThis.innerWidth=1280;scaled.update(.1,{progress:0,complete:false,finishing:false,after:0});
assert.equal(cloud.material.uniforms.viewportScale.value,1.35);assert.equal(densityScene.getObjectByName('persistent outer particles').material.uniforms.viewportScale.value,1.35);
console.log('PASS: mobile appearance unchanged; desktop particle coverage moves toward mobile reference');

effect.update(200,{progress:1,finishing:true,complete:true,after:2.1});effect.update(202,{progress:1,finishing:true,complete:true,after:2.1});
const savedOuter=Array.from(outer.geometry.attributes.position.array);
effect.beginRestart(202);
const idle={progress:0,finishing:false,complete:false,after:0};effect.update(202,idle);
assert.deepEqual(Array.from(outer.geometry.attributes.position.array),savedOuter);
const core=scene.children.find(x=>x.isPoints);assert.equal(core.geometry.drawRange.count,0);
effect.update(203.2,idle);assert.ok(core.geometry.drawRange.count>0&&core.geometry.drawRange.count<6300);
effect.update(205,idle);assert.equal(core.geometry.drawRange.count,6300);
console.log('PASS: replay preserves current outer positions initially and gradually restores particle count');
