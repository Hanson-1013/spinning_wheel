import assert from 'node:assert/strict';
import {SIGIL_STROKES as s,SIGIL_N as n,SIGIL_WIDTH as a,SIGIL_DEPTH as h,SIGIL_GAP as gap,SIGIL_TRIANGLES as triangles,SIGIL_INNER_LEG as leg} from '../src/particle-sigil.js';
for(const [p,q]of s)assert.ok(Math.abs(Math.hypot(q[0]-p[0],q[1]-p[1])-2*n)<1e-12);
assert.equal(h,a);assert.equal(gap,2*a);assert.equal(leg,n-4*a);
for(const [corner,b,c]of triangles){
 const u=[b[0]-corner[0],b[1]-corner[1]],v=[c[0]-corner[0],c[1]-corner[1]];
 assert.ok(Math.abs(Math.hypot(...u)-leg)<1e-12);assert.ok(Math.abs(Math.hypot(...v)-leg)<1e-12);
 assert.ok(Math.abs(u[0]*v[0]+u[1]*v[1])<1e-12);
 // Distance of the right-angle corner to the matching outer lower diamond edge.
 assert.ok(Math.abs((Math.abs(corner[0])-corner[1])/Math.SQRT2-2*a)<1e-12);
 const gapToDiamond=(Math.abs(corner[0])-corner[1])/Math.SQRT2;
 const gapToExtension=(Math.abs(corner[0])+corner[1])/Math.SQRT2-a/2;
 assert.ok(Math.abs(gapToExtension-gapToDiamond)<1e-12);
 assert.ok(Math.abs(gapToExtension-2*a)<1e-12);
}
console.log('PASS: outer side 2n, width a, depth a, solid right-isosceles triangles with legs n-4a and gap 2a');

const {SIGIL_EXTENSIONS}=await import('../src/particle-sigil.js');
for(const [start,end]of SIGIL_EXTENSIONS)assert.ok(Math.abs(Math.hypot(end[0]-start[0],end[1]-start[1])-n)<1e-12);
console.log('PASS: two lower extensions each have length n');
