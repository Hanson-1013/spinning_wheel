// Screen coordinates have Y pointing down: positive angle means clockwise.
export function pointerAngle(x,y,cx,cy,deadZone=22){
  return Math.hypot(x-cx,y-cy)<deadZone?null:Math.atan2(y-cy,x-cx);
}
export function signedAngleDelta(previous,current){
  if(previous===null||current===null)return 0;
  return Math.atan2(Math.sin(current-previous),Math.cos(current-previous));
}
