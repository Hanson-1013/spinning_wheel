import * as THREE from 'three';

// Long-grain texture, fine pores and knots, generated locally without downloaded assets.
export function createWoodMaterial(color, repeatX = 1, style = 'natural') {
  const canvas = document.createElement('canvas');
  canvas.width = 256; canvas.height = 1024;
  const context = canvas.getContext('2d');
  const pixels = context.createImageData(canvas.width, canvas.height);
  const settings={natural:{warp:1,contrast:.45,noise:.065,bump:.006,roughness:.7},walnut:{warp:1.8,contrast:.65,noise:.05,bump:.007,roughness:.6},oak:{warp:.65,contrast:.7,noise:.09,bump:.009,roughness:.78},aged:{warp:1.2,contrast:.5,noise:.14,bump:.012,roughness:.9}}[style];
  let seed = 813;
  for (let y = 0; y < canvas.height; y++) for (let x = 0; x < canvas.width; x++) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const noise = seed / 4294967296;
    const warp = settings.warp*(6*Math.sin(y*.009)+2.7*Math.sin(y*.027)+1.3*Math.sin(y*.061));
    const knot = Math.exp(-Math.pow((y - 380) / 110, 2)) * 9 * Math.sin(x * .065);
    const grain = settings.contrast*(Math.sin((x+warp+knot)*.37+Math.sin(x*.05)*2)*.075+Math.sin((x+warp*.6)*1.77)*.022+Math.sin(x*.073+warp*.2)*.04);
    const pore = noise > (style==='oak'?.955:.983) ? -.09 : 0;
    const v = Math.max(.15, Math.min(1, .71 + grain + (noise - .5) * settings.noise + pore));
    const i = (y * canvas.width + x) * 4;
    pixels.data[i] = v * 255; pixels.data[i + 1] = v * 226; pixels.data[i + 2] = v * 187; pixels.data[i + 3] = 255;
  }
  context.putImageData(pixels, 0, 0);
  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = map.wrapT = THREE.RepeatWrapping; map.repeat.set(repeatX, 1);
  map.anisotropy = 4;
  const material = new THREE.MeshStandardMaterial({ color, map, bumpMap: map, bumpScale: settings.bump, roughness: settings.roughness, metalness: 0 });
  material.onBeforeCompile = shader => {
    shader.vertexShader = 'varying vec3 vWoodWorld;\n' + shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nvWoodWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    shader.fragmentShader = 'varying vec3 vWoodWorld;\n' + shader.fragmentShader;
    shader.fragmentShader = shader.fragmentShader.replace('#include <color_fragment>', '#include <color_fragment>\nfloat wet = 1.0 - smoothstep(-2.04, -1.89, vWoodWorld.y);\ndiffuseColor.rgb *= mix(vec3(1.0), vec3(0.35, 0.43, 0.43), wet);');
    shader.fragmentShader = shader.fragmentShader.replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\nroughnessFactor = mix(roughnessFactor, 0.24, wet);');
  };
  material.customProgramCacheKey = () => 'wet-wood-v1';
  return material;
}
