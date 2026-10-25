// Deterministic multi-axis advection; no per-frame random numbers or allocations.
const TAU = Math.PI * 2;
const axes = new Float64Array(37 * 3);
for (let i = 0; i < 37; i++) {
  const y = 1 - 2 * (i + .5) / 37;
  const r = Math.sqrt(1 - y * y), a = i * 2.399963229728653;
  axes.set([r * Math.cos(a), y, r * Math.sin(a)], i * 3);
}
// Inverse CDF of a solid sphere with volume density rho(s)=(1-s*s)^2.
// F(s)=(35s^3-42s^5+15s^7)/8; density smoothly reaches zero at s=1.
const radiusTable=new Float64Array(1025);
for(let i=0;i<=1024;i++){
 let low=0,high=1;
 for(let j=0;j<32;j++){const r=(low+high)/2,r2=r*r,cdf=r*r2*(35-42*r2+15*r2*r2)/8;if(cdf<i/1024)low=r;else high=r;}
 radiusTable[i]=(low+high)/2;
}
radiusTable[0]=0;radiusTable[1024]=1;
export function sampleSolidRadius(quantile){
 const index=Math.max(0,Math.min(1,quantile))*1024,lo=Math.min(1023,Math.floor(index));
 return radiusTable[lo]+(radiusTable[lo+1]-radiusTable[lo])*(index-lo);
}
export function sampleGatheringMotion(i, time, progress, seed, out, offset = 0, centerWeighted = false) {
  const k = i * 4, a = seed[k] * TAU, u = seed[k + 1] * 2 - 1;
  const r = seed[k + 2], phase = seed[k + 3];
  const p = Math.max(0, Math.min(1, progress)), merge = p * p * (3 - 2 * p);
  const h = Math.sqrt(Math.max(0, 1 - u * u));
  const shell = centerWeighted ? 5.6*Math.pow(r,2.5) : 2.4+r*3.2;
  const ball = .75 * (centerWeighted?.98*sampleSolidRadius(r):.28+.7*Math.cbrt(r)) * (1-.35*p);
  // Blend the initial surrounding volume with a compact sphere before advection.
  let x = Math.cos(a) * ((1 - merge) * shell * (centerWeighted?h:1) + merge * h * ball);
  let y = (1 - merge) * (centerWeighted?u*shell*.85:-1.95+phase*4.9) + merge * u * ball;
  let z = Math.sin(a) * ((1 - merge) * shell * (centerWeighted?h*.8:.6) + merge * h * ball);
  const group = (i * 13) % 37, axis = group * 3;
  const nx = axes[axis], ny = axes[axis + 1], nz = axes[axis + 2];
  const handedness = group % 2 === 0 ? 1 : -1;
  const theta = handedness * (time * (.025 + phase * .065) * (1 - merge * .8) + merge * (3 + phase * 7));
  const c = Math.cos(theta), s = Math.sin(theta), dot = nx * x + ny * y + nz * z;
  const rx = x * c + (ny * z - nz * y) * s + nx * dot * (1 - c);
  const ry = y * c + (nz * x - nx * z) * s + ny * dot * (1 - c);
  const rz = z * c + (nx * y - ny * x) * s + nz * dot * (1 - c);
  // Smooth divergence-free field: each component is independent of its own axis.
  // Its envelope vanishes at completion, preserving the final spherical silhouette.
  const turbulence = (.35 + .62 * 4 * merge) * (1 - merge);
  const t = time * (.3 + phase * .55) + phase * TAU;
  x = rx + turbulence * (Math.sin(ry * 1.1 + t) + Math.cos(rz * .8 - t * .7));
  y = ry + turbulence * (Math.sin(rz * .9 + t * .8) + Math.cos(rx * 1.2 + t * .6));
  z = rz + turbulence * (Math.sin(rx * .8 - t * .9) + Math.cos(ry * 1.1 + t));
  // Incommensurate frequencies and per-particle phases produce bounded wandering.
  // This runs even when progress is fixed; the progress-driven vortex remains reversible.
  const wander = .34 * (1 - merge);
  const q = time * (.24 + r * .47);
  x += wander * (Math.sin(q + a * 3) + .45 * Math.sin(q * 1.71 + phase * 17));
  y += wander * (Math.cos(q * 1.19 + phase * 11) + .4 * Math.sin(q * .83 + a * 2));
  z += wander * (Math.sin(q * .91 + phase * 7) + .5 * Math.cos(q * 1.47 + a));
  out[offset] = x;
  out[offset + 1] = y + .25;
  out[offset + 2] = z;
}
