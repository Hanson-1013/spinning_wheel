import * as THREE from 'three';
import {createTangentBelt} from './tangent-belt.js';

// Photo A: stepped wheel grooves, turned spokes, a single front diagonal
// bearing post and a live-edge tabletop plank. Shares the existing controller.
export function buildSpinningWheelA({wood,edge,dark,brass,thread}){
  const root=new THREE.Group();root.name='纺车 A · 照片复刻';
  function mesh(g,m,parent=root){const o=new THREE.Mesh(g,m);parent.add(o);return o;}
  function turned(profile,a,b,material=wood,parent=root){
    const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),d=end.clone().sub(start),length=d.length();
    const g=new THREE.LatheGeometry(profile.map(([r,y])=>new THREE.Vector2(r,y*length)),24);
    const o=mesh(g,material,parent);o.position.copy(start);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());return o;
  }
  const outline=new THREE.Shape();
  [[-1.9,-.32],[-1.7,-.43],[-1.16,-.4],[-.91,-.49],[-.51,-.43],[-.28,-.5],[.02,-.42],[.42,-.45],[.82,-.39],[1.45,-.41],[1.64,-.29],[1.62,.29],[1.3,.38],[.91,.32],[.51,.42],[.18,.38],[-.2,.47],[-.59,.4],[-.87,.43],[-1.12,.34],[-1.56,.38],[-1.91,.23]].forEach(([x,y],i)=>i?outline.lineTo(x,y):outline.moveTo(x,y));outline.closePath();
  const slab=mesh(new THREE.ExtrudeGeometry(outline,{depth:.13,bevelEnabled:true,bevelSize:.025,bevelThickness:.02,bevelSegments:3,steps:1}),wood);slab.rotation.x=-Math.PI/2;slab.position.y=.1;
  // Exposed rough end-grain scars on the live edge.
  for(let i=0;i<17;i++){
    const scar=mesh(new THREE.BoxGeometry(.035+(i%3)*.018,.018,.011),dark);
    scar.position.set(-1.7+i*.19,.155,.4+Math.sin(i)*.025);scar.rotation.z=Math.sin(i*8)*.15;
  }
  const postProfile=[[.1,0],[.125,.05],[.12,.11],[.075,.16],[.09,.2],[.115,.24],[.12,.3],[.105,.35],[.071,.41],[.085,.47],[.103,.5],[.09,.54],[.055,.6],[.072,.66],[.085,.69],[.073,.74],[.05,.81],[.063,.86],[.071,.9],[.058,.95],[.053,1]];
  turned(postProfile,[-.48,.23,.48],[.53,1.32,.22],wood);
  turned([[.065,0],[.065,.14],[.04,.19],[.052,.24],[.057,.3],[.039,.36],[.035,.74],[.055,.79],[.058,.83],[.036,.91],[.02,1]],[-1.25,.24,.05],[-1.25,1.25,.05],edge);
  turned([[.045,0],[.045,1]],[.53,1.32,-.2],[.53,1.32,.34],brass);
  // Discrete machined rim profile: three raised lips and two recessed grooves.
  const wheel=new THREE.Group();wheel.position.set(.53,1.32,0);root.add(wheel);
  const rimProfile=[[1.005,-.11],[1.027,-.14],[1.09,-.14],[1.113,-.12],[1.113,-.095],[1.075,-.075],[1.075,-.053],[1.113,-.036],[1.113,-.014],[1.075,.005],[1.075,.032],[1.113,.048],[1.113,.075],[1.09,.105],[1.027,.105],[1.005,.08],[1.005,-.11]];
  const rim=mesh(new THREE.LatheGeometry(rimProfile.map(([r,z])=>new THREE.Vector2(r,z)),192),wood,wheel);rim.rotation.x=Math.PI/2;
  for(const z of [-.113,-.04,.045,.092]){const lip=mesh(new THREE.TorusGeometry(1.106,.01,8,192),edge,wheel);lip.position.z=z;}
  for(const z of [-.064,.019]){const groove=mesh(new THREE.TorusGeometry(1.079,.007,6,192),dark,wheel);groove.position.z=z;}
  const spokeProfile=[[.039,0],[.046,.06],[.035,.11],[.025,.17],[.022,.35],[.041,.39],[.043,.43],[.022,.48],[.019,.72],[.033,.76],[.036,.8],[.025,.86],[.031,.96],[.04,1]];
  for(let i=0;i<12;i++){
    const a=i*Math.PI/6+.08,x=Math.cos(a),y=Math.sin(a);
    // Preserve both ends of the damaged spoke; only its middle section is missing.
    if(i===2){
      const radiusAt=t=>{
        const j=spokeProfile.findIndex(p=>p[1]>=t);
        if(j===0)return spokeProfile[0][0];
        const lo=spokeProfile[j-1],hi=spokeProfile[j];
        return lo[0]+(hi[0]-lo[0])*(t-lo[1])/(hi[1]-lo[1]);
      };
      for(const [start,end] of [[0,.34],[.62,1]]){
        const profile=[[radiusAt(start),start],...spokeProfile.filter(p=>p[1]>start&&p[1]<end),[radiusAt(end),end]]
          .map(([r,t])=>[r,(t-start)/(end-start)]);
        const r0=.15+.87*start,r1=.15+.87*end;
        turned(profile,[x*r0,y*r0,0],[x*r1,y*r1,0],edge,wheel);
        const t=start===0?end:start,r=.15+.87*t;
        const cap=mesh(new THREE.CircleGeometry(radiusAt(t),16),dark,wheel);
        cap.position.set(x*r,y*r,0);
        cap.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),new THREE.Vector3(x,y,0).multiplyScalar(start===0?1:-1));
      }
    }else{
      const radius=i===5?.84:1.02;
      turned(spokeProfile,[x*.15,y*.15,0],[x*radius,y*radius,0],edge,wheel);
    }
  }
  turned([[.11,0],[.16,.08],[.18,.2],[.18,.28],[.145,.34],[.14,.65],[.18,.72],[.18,.8],[.14,.88],[.1,1]],[0,0,-.25],[0,0,.29],wood,wheel);
  for(let i=0;i<7;i++){const ring=mesh(new THREE.TorusGeometry(.163,.009,8,36),dark,wheel);ring.position.z=-.15+i*.045;}
  const cap=mesh(new THREE.SphereGeometry(.075,16,12),brass,wheel);cap.position.z=.31;cap.scale.z=.38;
  for(let i=0;i<9;i++){
    const a=i/9*Math.PI*2,chip=mesh(new THREE.BoxGeometry(.09,.019,.025),dark,wheel);
    chip.position.set(Math.cos(a)*1.027,Math.sin(a)*1.027,.09);chip.rotation.z=a+Math.PI/2;
  }
  const flyer=new THREE.Group();flyer.position.set(-1.25,1.22,0);root.add(flyer);
  turned([[.045,0],[.1,.08],[.105,.16],[.065,.2],[.06,.8],[.105,.85],[.1,.93],[.045,1]],[0,0,-.18],[0,0,.18],wood,flyer);
  const coil=[];for(let i=0;i<250;i++){const t=i/249,a=t*Math.PI*40;coil.push(new THREE.Vector3(Math.cos(a)*.066,Math.sin(a)*.066,-.12+t*.24));}
  mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(coil),400,.0025,5,false),new THREE.MeshStandardMaterial({color:0xbbaa82,roughness:.9}),flyer);
  const belt=createTangentBelt({x:.53,y:1.32,r:1.083},{x:-1.25,y:1.22,r:.066},-.02,0);
  mesh(new THREE.TubeGeometry(belt.path,260,.006,6,true),dark);
  mesh(new THREE.TubeGeometry(belt.golden,100,.007,8,false),thread);
  const treadle=mesh(new THREE.BoxGeometry(.55,.035,.2),dark);treadle.position.set(-.9,.12,.4);
  const crank=new THREE.Group(),linkage=new THREE.Group();root.add(crank,linkage);
  return {root,wheel,flyer,treadle,crank,linkage};
}
