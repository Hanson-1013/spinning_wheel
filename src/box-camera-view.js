import * as THREE from 'three';
export const BOX_VIEW=Object.freeze({yaw:10,pitch:5,side:-1.5,travel:-.43,fov:60,height:.5});
export function boxCameraPreset(){
 const position=new THREE.Vector3(BOX_VIEW.side,BOX_VIEW.height,8-BOX_VIEW.travel);
 const rotation=new THREE.Euler(Math.atan2(.45-1.3,11.8)+THREE.MathUtils.degToRad(BOX_VIEW.pitch),-THREE.MathUtils.degToRad(BOX_VIEW.yaw),0,'YXZ');
 const target=new THREE.Vector3(0,0,-10).applyEuler(rotation).add(position);
 return {position:{x:position.x,y:position.y,z:position.z},target:{x:target.x,y:target.y,z:target.z},fov:BOX_VIEW.fov};
}
