export function createRitualState(){return {distance:0,target:0,progress:0,complete:false,finishing:false,after:0,held:false,clock:0,speed:0,returning:false};}
export function pullRitual(state,pixels){
  if(state.complete||state.finishing)return;
  state.held=false;state.returning=false;
  state.distance=Math.max(0,Math.min(720,state.distance+pixels));
  state.target=state.distance/720*6;
}
export function releaseRitual(state){
  if(state.finishing||state.complete)return;
  state.returning=true;state.held=false;state.distance=0;state.target=0;
}
export function grabRitual(state){
  if(state.finishing||state.complete)return;
  state.returning=false;state.held=false;state.target=state.clock;state.distance=state.clock/6*720;
}
export function updateRitual(state,dt,elapsed=dt){
  dt=Math.max(0,Math.min(dt,1/30));
  if(state.held)return;
  if(state.finishing)state.after=Math.min(2.1,state.after+Math.max(0,elapsed));
  if(state.complete)return;
  if(state.finishing){
    // Carry the current speed through the handoff instead of braking to zero.
    state.clock=Math.min(6,state.clock+state.speed*dt);
    state.progress=state.clock/6;
    if(state.clock>=6){state.progress=1;state.complete=true;}
    return;
  }
  // Signed tracking permits scrubbing in either direction before the 95% latch.
  if(state.finishing)state.target=6;
  const remaining=state.target-state.clock;
  const desiredSpeed=Math.max(-2,Math.min(2,remaining*10));
  state.speed+=(desiredSpeed-state.speed)*(1-Math.exp(-dt*20));
  const step=state.speed*dt;
  state.clock=Math.max(0,Math.min(state.returning?5.699999:6,state.clock+step));
  if(Math.abs(state.target-state.clock)<.0005){state.clock=state.target;state.speed=0;}
  const u=state.clock/6;
  state.progress=u;
  if(!state.returning&&state.progress>=.95){state.finishing=true;state.target=6;state.after=0;}
  if(state.finishing&&state.clock>=6){state.progress=1;state.complete=true;}

}
