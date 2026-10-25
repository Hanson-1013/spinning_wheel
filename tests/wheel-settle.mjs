import assert from 'node:assert/strict';
import {sampleWheelSettle as f,forwardDuration,settlingDuration,FORWARD_ANGLE,REST_ANGLE,DAMPING_RATIO,recoilFrequency} from '../src/wheel-settle.js';

for(const speed of [.3,1,2]){
 const omega=recoilFrequency(speed),wd=omega*Math.sqrt(1-DAMPING_RATIO**2),half=Math.PI/wd,q=Math.exp(-DAMPING_RATIO*omega*half);
 const t=forwardDuration(speed),h=1e-5;
 assert.ok(Math.abs(f(h,speed)/h-speed)<1e-5);
 assert.ok(Math.abs(f(t,speed)-FORWARD_ANGLE)<1e-10);
 assert.ok(Math.abs((f(t+h,speed)-f(t-h,speed))/(2*h))<.001);
 let previous=FORWARD_ANGLE-REST_ANGLE;
 for(let i=1;i<=4;i++){
  const x=f(t+i*half,speed)-REST_ANGLE;
  assert.ok(x*previous<0);assert.ok(Math.abs(Math.abs(x/previous)-q)<1e-8);previous=x;
 }
 for(let i=0;i<1000;i++){const time=t+i/1000*(settlingDuration(speed)-t);const velocity=(f(time+h,speed)-f(time,speed))/h;assert.ok(Math.abs(velocity)<=speed*.751,'recoil peak must stay below 75% of incoming speed');}
 assert.equal(f(settlingDuration(speed),speed),REST_ANGLE);
 assert.ok(Math.abs((f(settlingDuration(speed)+h,speed)-f(settlingDuration(speed)-h,speed))/(2*h))<1e-5);
}
console.log('PASS: inherited speed, continuous reversal, exponential alternating peak decay, exact aligned rest');
