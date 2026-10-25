import * as THREE from 'three';
import { Reflector } from 'three/addons/objects/Reflector.js';
import { sampleRipple } from './ripple.js';
import { createRainState, respawnRain, stepRain } from './rain-state.js';

export function createWater(scene) {
  const level = -2.035;
  const mirror = new Reflector(new THREE.PlaneGeometry(4.9, 3.5), {
    color: 0x70838c, textureWidth: 2048, textureHeight: 1536, clipBias: 0.004, multisample: 2,
  });
  mirror.rotation.x = -Math.PI / 2;
  mirror.position.set(0, level, 0);
  scene.add(mirror);
  // Distort the reflected image with a continuous, subtle water flow.
  const material = mirror.material;
  material.uniforms.waterTime = { value: 0 };
  material.fragmentShader = material.fragmentShader.replace('uniform vec3 color;', 'uniform float waterTime; uniform vec3 color;')
    .replace('vec4 base = texture2DProj( tDiffuse, vUv );', `
      vec4 waterUv = vUv;
      waterUv.xy += vec2(sin(vUv.y * 90.0 + waterTime * 1.4), cos(vUv.x * 110.0 - waterTime)) * 0.00065 * vUv.w;
      vec4 base = texture2DProj(tDiffuse, waterUv);`);

  const surfaceGeometry = new THREE.PlaneGeometry(4.9, 3.5, 128, 96);
  surfaceGeometry.rotateX(-Math.PI / 2);
  // Fine periodic normal detail adds small waves without rebuilding a denser CPU mesh.
  const normalPixels=new Uint8Array(512*512*4);
  for(let y=0;y<512;y++)for(let x=0;x<512;x++){
    const u=x/512*Math.PI*2,v=y/512*Math.PI*2;
    let nx=.22*Math.cos(u*13+v*7)+.12*Math.sin(u*29-v*11);
    let ny=.18*Math.sin(v*17-u*5)+.1*Math.cos(v*31+u*19);
    const length=Math.hypot(nx,ny,1),k=(y*512+x)*4;
    normalPixels[k]=(nx/length*.5+.5)*255;normalPixels[k+1]=(ny/length*.5+.5)*255;
    normalPixels[k+2]=(1/length*.5+.5)*255;normalPixels[k+3]=255;
  }
  const normalMap=new THREE.DataTexture(normalPixels,512,512,THREE.RGBAFormat);
  normalMap.wrapS=normalMap.wrapT=THREE.RepeatWrapping;
  normalMap.magFilter=THREE.LinearFilter;normalMap.minFilter=THREE.LinearMipmapLinearFilter;
  normalMap.generateMipmaps=true;normalMap.anisotropy=4;normalMap.needsUpdate=true;
  const surface = new THREE.Mesh(surfaceGeometry, new THREE.MeshPhysicalMaterial({
    normalMap, normalScale:new THREE.Vector2(.22,.22), color: 0x315f6c, roughness: 0.18, metalness: 0.55, transparent: true, opacity: 0.21,
    clearcoat: 1, clearcoatRoughness: 0.12, depthWrite: false, side: THREE.DoubleSide,
  }));
  surface.position.y = level + 0.008;
  scene.add(surface);
  const drops = new THREE.InstancedMesh(new THREE.SphereGeometry(0.014, 7, 6),
    new THREE.MeshPhysicalMaterial({ color: 0xc6edff, emissive: 0x507c99, emissiveIntensity: 0.6, metalness: 0.2, roughness: 0.08 }), 85);
  drops.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  drops.frustumCulled = false;
  scene.add(drops);
  const states = Array.from({length: 85}, () => createRainState());
  const ripples = [];
  const ringGeometry = new THREE.RingGeometry(0.986, 1, 192);
  ringGeometry.rotateX(-Math.PI / 2);
  const rings = Array.from({length: 24}, () => {
    const ring = new THREE.Mesh(ringGeometry, new THREE.MeshBasicMaterial({
      color: 0x9edcea, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    }));
    ring.visible = false; scene.add(ring); return ring;
  });
  let ringIndex = 0;
  const matrix = new THREE.Matrix4();
  const orientation = new THREE.Quaternion();
  const scale = new THREE.Vector3();
  const location = new THREE.Vector3();
  function impact(x, z, time) {
    const ring = rings[ringIndex];
    // Reuse both ring meshes and their associated wave records.
    const previous = ripples.findIndex(r => r.ring === ring);
    if (previous !== -1) ripples.splice(previous, 1);
    ringIndex = (ringIndex + 1) % rings.length;
    ripples.push({ x, z, time, ring });
    ring.position.set(x, level + 0.035, z);
    ring.visible = true;
  }
  function reset() {
    ripples.length = 0; ringIndex = 0;
    for (const ring of rings) ring.visible = false;
    states.forEach(s => respawnRain(s, Math.random, true));
    update(0, 0);
  }
  function update(dt, time) {
    material.uniforms.waterTime.value = time;
    normalMap.offset.set(time*.006,-time*.004);
    states.forEach((s, i) => {
      const visible = stepRain(s, dt, level, (x, z) => impact(x, z, time));
      if (visible) scale.set(s.size, s.size * (1.3 + s.velocity * 0.08), s.size);
      else scale.setScalar(0);
      location.set(s.x, s.y, s.z);
      matrix.compose(location, orientation, scale);
      drops.setMatrixAt(i, matrix);
    });
    drops.instanceMatrix.needsUpdate = true;
    for (let i = ripples.length - 1; i >= 0; i--) {
      const r = ripples[i], age = time - r.time;
      if (age > 2.2) { r.ring.visible = false; ripples.splice(i, 1); continue; }
      // Bound the ring to the pool edges rather than spilling onto the surrounding slab.
      const extent = Math.min(2.45 - Math.abs(r.x), 1.75 - Math.abs(r.z));
      const radius = age * 1.5 + 0.02;
      r.ring.scale.setScalar(radius);
      r.ring.material.opacity = Math.max(0, 0.48 * Math.exp(-age * 2) * Math.min(1, (extent - radius) * 8));
    }
    const positions = surfaceGeometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i), z = positions.getZ(i);
      let y = 0.006 * Math.sin(x * 5 + time) * Math.cos(z * 4 - time * 0.7);
      for (const r of ripples) y += .45*sampleRipple(Math.hypot(x - r.x, z - r.z), time - r.time);
      const edge = Math.min(1, Math.max(0, (2.45 - Math.abs(x)) * 5), Math.max(0, (1.75 - Math.abs(z)) * 5));
      positions.setY(i, y * edge);
    }
    positions.needsUpdate = true;
    surfaceGeometry.computeVertexNormals();
  }
  reset();
  return { update, reset };
}
