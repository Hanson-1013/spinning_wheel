export const FORWARD_ANGLE=400*Math.PI/180;
export const REST_ANGLE=Math.PI*2;
export const DAMPING_RATIO=.42;
export const NATURAL_FREQUENCY=2.6;
export function forwardDuration(speed){return 2*FORWARD_ANGLE/Math.max(.001,speed);}
export function recoilFrequency(speed){
 const amplitude=FORWARD_ANGLE-REST_ANGLE;
 const peakFactor=Math.exp(-DAMPING_RATIO/Math.sqrt(1-DAMPING_RATIO**2)*Math.acos(DAMPING_RATIO));
 return Math.min(NATURAL_FREQUENCY,.75*Math.max(.001,speed)/(amplitude*peakFactor));
}
export function oscillationDuration(speed){
 return Math.log((FORWARD_ANGLE-REST_ANGLE)/.0002)/(DAMPING_RATIO*recoilFrequency(speed))+.5;
}
export function settlingDuration(speed){return forwardDuration(speed)+oscillationDuration(speed);}
function smooth(t){t=Math.max(0,Math.min(1,t));return t*t*t*(10+t*(-15+6*t));}
// Exact damped oscillator. Its frequency is bounded by the incoming speed,
// preventing the first reversal from surging faster than the preceding spin.
export function sampleWheelSettle(seconds,speed){
 const duration=forwardDuration(speed);
 if(seconds<=duration){const u=Math.max(0,seconds/duration);return FORWARD_ANGLE*(2*u-u*u);}
 const t=seconds-duration,end=oscillationDuration(speed);
 if(t>=end)return REST_ANGLE;
 const omega=recoilFrequency(speed),decay=DAMPING_RATIO*omega;
 const damped=omega*Math.sqrt(1-DAMPING_RATIO*DAMPING_RATIO);
 const amplitude=FORWARD_ANGLE-REST_ANGLE;
 const displacement=amplitude*Math.exp(-decay*t)*(Math.cos(damped*t)+decay/damped*Math.sin(damped*t));
 return REST_ANGLE+displacement*(1-smooth((t-(end-.5))/.5));
}
