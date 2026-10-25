// All dimensions refer to physical outer boundaries, not stroke centerlines.
export const SIGIL_N=.22;
export const SIGIL_SIDE=2*SIGIL_N;
export const SIGIL_WIDTH=.03;
export const SIGIL_DEPTH=SIGIL_WIDTH;
export const SIGIL_GAP=2*SIGIL_WIDTH;
export const SIGIL_INNER_LEG=SIGIL_N-4*SIGIL_WIDTH;
const q=SIGIL_SIDE/Math.SQRT2,inset=SIGIL_WIDTH*Math.SQRT2;
export const SIGIL_OUTER=[[0,2*q],[-q,q],[0,0],[q,q]];
const inner=[[0,2*q-inset],[-q+inset,q],[0,inset],[q-inset,q]];
export const SIGIL_STROKES=SIGIL_OUTER.map((p,i)=>[p,SIGIL_OUTER[(i+1)%4]]);
// Offset from BOTH bordering solids: diamond outer boundary and the extension's
// visible edge (half a stroke away from its centerline).
const cx=(2*SIGIL_GAP+SIGIL_WIDTH/2)/Math.SQRT2;
const cy=SIGIL_WIDTH/(2*Math.SQRT2),l=SIGIL_INNER_LEG/Math.SQRT2;
export const SIGIL_TRIANGLES=[
 [[-cx,cy],[-cx-l,cy+l],[-cx-l,cy-l]],
 [[cx,cy],[cx+l,cy-l],[cx+l,cy+l]],
];
const faces=[];
for(let i=0;i<4;i++){
 const j=(i+1)%4;
 faces.push([SIGIL_OUTER[i],SIGIL_OUTER[j],inner[j]],[SIGIL_OUTER[i],inner[j],inner[i]]);
}
// Continue both lower edges beyond the bottom vertex by length n.
export const SIGIL_EXTENSIONS=[[[0,0],[SIGIL_N/Math.SQRT2,-SIGIL_N/Math.SQRT2]],[[0,0],[-SIGIL_N/Math.SQRT2,-SIGIL_N/Math.SQRT2]]];
for(const [start,end]of SIGIL_EXTENSIONS){
 const dx=end[0]-start[0],dy=end[1]-start[1],nx=-dy/SIGIL_N*SIGIL_WIDTH/2,ny=dx/SIGIL_N*SIGIL_WIDTH/2;
 const p0=[start[0]+nx,start[1]+ny],p1=[end[0]+nx,end[1]+ny],p2=[end[0]-nx,end[1]-ny],p3=[start[0]-nx,start[1]-ny];
 faces.push([p0,p1,p2],[p0,p2,p3]);
}
faces.push(...SIGIL_TRIANGLES);
const areas=faces.map(([a,b,c])=>Math.abs((b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]))/2);
const area=areas.reduce((a,b)=>a+b,0);
export function sampleSigil(i,count,seed,time,out,offset=0){
 // Area-weighted uniform fill: a hollow diamond rim plus two SOLID prisms.
 let distance=(i+.5)/count*area,j=0;
 while(j<areas.length-1&&distance>areas[j])distance-=areas[j++];
 const [a,b,c]=faces[j];
 const phase=seed[i*4+2]*Math.PI*2;
 // Wander in barycentric coordinates so particles stay inside their local face.
 // Different frequencies avoid synchronized motion or leaking across the gaps.
 const ru=Math.max(.001,Math.min(.999,seed[i*4]+.075*(Math.sin(time*(.6+seed[i*4+1]*.5)+phase)+.35*Math.sin(time*1.37+phase*2.1))));
 const r=Math.sqrt(ru);
 const v=Math.max(.001,Math.min(.999,seed[i*4+1]+.1*(Math.sin(time*.83+phase*1.7)+.3*Math.cos(time*1.51+phase))));
 const x=a[0]*(1-r)+b[0]*r*(1-v)+c[0]*r*v;
 const y=a[1]*(1-r)+b[1]*r*(1-v)+c[1]*r*v;
 const depth=Math.max(-.5,Math.min(.5,seed[i*4+3]-.5+.12*Math.sin(time*.74+phase)))*SIGIL_DEPTH;
 const tilt=.19,ct=Math.cos(tilt),st=Math.sin(tilt);
 out[offset]=x*ct+depth*st;
 out[offset+1]=-1.65+y+Math.sin(time*1.05)*.024;
 out[offset+2]=1.25-x*st+depth*ct;
}
