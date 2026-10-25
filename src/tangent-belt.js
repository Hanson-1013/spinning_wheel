import * as THREE from 'three';
class CircleArc extends THREE.Curve {
  constructor(x,y,r,z,start,end){super();Object.assign(this,{x,y,r,z,start,end});}
  getPoint(t,target=new THREE.Vector3()){const a=this.start+(this.end-this.start)*t;return target.set(this.x+this.r*Math.cos(a),this.y+this.r*Math.sin(a),this.z);}
}
class TangentSpan extends THREE.Curve {
  constructor(a,b){super();this.a=a;this.b=b;}
  getPoint(t,target=new THREE.Vector3()){
    target.lerpVectors(this.a,this.b,t);
    target.z=this.a.z+(this.b.z-this.a.z)*t*t*(3-2*t);return target;
  }
}
export function createTangentBelt(big,small,z,smallZ=z){
  const dx=small.x-big.x,dy=small.y-big.y,d=Math.hypot(dx,dy);
  if(d<=Math.abs(big.r-small.r))throw new Error('Pulley circles must admit external tangents');
  const phi=Math.atan2(dy,dx),alpha=Math.acos((big.r-small.r)/d);
  const top=phi-alpha,bottom=phi+alpha;
  const point=(c,a)=>new THREE.Vector3(c.x+c.r*Math.cos(a),c.y+c.r*Math.sin(a),z);
  const bt=point(big,top),bb=point(big,bottom),st=point(small,top),sb=point(small,bottom);
  st.z=smallZ;sb.z=smallZ;
  const bigEnd=bottom-Math.PI*2;
  const path=new THREE.CurvePath();
  path.add(new TangentSpan(st,bt));
  path.add(new CircleArc(big.x,big.y,big.r,z,top,bigEnd));
  path.add(new TangentSpan(bb,sb));
  path.add(new CircleArc(small.x,small.y,small.r,smallZ,bottom,top));
  const golden=new THREE.CurvePath();golden.add(new TangentSpan(st,bt));
  golden.add(new CircleArc(big.x,big.y,big.r,z,top,top-.28));
  return {path,golden,contacts:{bt,bb,st,sb}};
}
