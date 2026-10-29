import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import './developer.css';
import {setupCameraTools} from './developer-camera.js';
import {createBotanicalLibrary} from './botanical-library.js';

export function setupDeveloperTools({scene,wheel,backdropObjects,canvas,renderer,water,cameraRig,performanceStage,renderStyles}){
 const panel=document.createElement('section');panel.className='developer-panel';panel.setAttribute('aria-label','素材试验台');
 panel.innerHTML=`<div class="dev-heading"><strong>素材试验台</strong><button id="dev-collapse" aria-expanded="true">收起</button></div>
 <div id="dev-content"><p>独立开发页面 · <a href="/">返回展示首页</a> · <a href="/test/modules">手机单模组查看</a></p>
 <p>导入 GLB 模型、PNG / JPG / WebP 图片或音频。素材仅在本次页面中试用，刷新后清除。</p>
 <label class="dev-upload">添加素材<input id="dev-files" type="file" multiple accept=".glb,.png,.jpg,.jpeg,.webp,.mp3,.wav,.ogg,.m4a"></label>
 <p id="dev-status" role="status" aria-live="polite">选择素材开始试用</p>
 <div class="dev-actions"><button id="dev-show-all">显示全部素材</button><button id="dev-hide-all">隐藏全部素材</button></div>
 <h2>布景</h2><label for="dev-backdrop">选择背景</label><select id="dev-backdrop"><option value="original">原布景 · 暗色水庭</option><option value="library">植物书房 · 晨光格窗</option></select><p>植物书房采用三维建模，可与纺车、水面及导入素材共同呈现。</p>
 <h2>渲染风格</h2><label for="dev-render-style">画面风格</label><select id="dev-render-style"><option value="original">原有写实效果</option><option value="impression">印象派油画 · 柔和笔触</option><option value="blocks">平面色块油画 · 概括色阶</option><option value="engraving">复古版画 · 单色排线</option></select>
 <label for="dev-style-strength">风格强度 <output id="dev-style-strength-value">80%</output></label><input id="dev-style-strength" type="range" min="0" max="100" value="80">
 <label for="dev-style-brush">笔触大小 <output id="dev-style-brush-value">4</output></label><input id="dev-style-brush" type="range" min="1" max="10" step="0.5" value="4">
 <h2>室内雾气</h2><div class="dev-row"><span>室内轻雾</span><button id="dev-mist-toggle" aria-pressed="true">隐藏雾气</button></div>
 <label for="dev-mist-density">浓度 <output id="dev-mist-value">16%</output></label><input id="dev-mist-density" type="range" min="0" max="100" step="1" value="16" aria-label="室内雾气浓度">
 <div id="dev-camera"></div><h2>场景内容</h2><div id="dev-builtins"></div><h2>导入素材</h2><div id="dev-assets"></div></div>`;
 document.querySelector('#app').appendChild(panel);
 const find=id=>panel.querySelector('#'+id),assets=[];
 const status=text=>find('dev-status').textContent=text;
 const cameraTools=setupCameraTools(find('dev-camera'),cameraRig,canvas);
 const originalBackground=scene.background,originalFog=scene.fog,originalShadows=renderer.shadowMap.enabled;
 let librarySet=null,mistVisible=true;
 function applyMist(){const api=librarySet?.userData.indoorMist;if(api){api.setVisible(mistVisible);api.setDensity(find('dev-mist-density').value);}}
 find('dev-mist-toggle').onclick=()=>{mistVisible=!mistVisible;find('dev-mist-toggle').textContent=mistVisible?'隐藏雾气':'显示雾气';find('dev-mist-toggle').setAttribute('aria-pressed',String(mistVisible));applyMist();};
 find('dev-mist-density').oninput=()=>{find('dev-mist-value').textContent=find('dev-mist-density').value+'%';applyMist();};
 find('dev-render-style').onchange=e=>renderStyles?.setPreset(e.target.value);
 find('dev-style-strength').oninput=e=>{find('dev-style-strength-value').textContent=e.target.value+'%';renderStyles?.setStrength(e.target.value/100);};
 find('dev-style-brush').oninput=e=>{find('dev-style-brush-value').textContent=e.target.value;renderStyles?.setBrush(e.target.value);};
 const originalVisibility=backdropObjects.map(object=>object.visible);
 find('dev-backdrop').onchange=e=>{
  const useLibrary=e.target.value==='library';
  cameraRig.setStageOffset(useLibrary?1.2:0);
  if(useLibrary&&!librarySet){librarySet=createBotanicalLibrary();scene.add(librarySet);}
  if(librarySet)librarySet.visible=useLibrary;applyMist();
  renderer.shadowMap.enabled=useLibrary||originalShadows;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  scene.background=useLibrary?new THREE.Color(0xbacac2):originalBackground;
  scene.fog=useLibrary?new THREE.FogExp2(0xb6c8bd,.007):originalFog;
  backdropObjects.forEach((object,i)=>object.visible=useLibrary?false:originalVisibility[i]);
  status(useLibrary?'已切换三维植物书房':'已切换原布景');
 };

 const toggleRow=(label,objects)=>{
  for(const object of objects)object.visible=false;
  const row=document.createElement('div');row.className='dev-row';const name=document.createElement('span');name.textContent=label;
  const button=document.createElement('button');button.textContent='显示';button.setAttribute('aria-pressed','false');
  button.onclick=()=>{const visible=button.getAttribute('aria-pressed')!=='true';for(const o of objects)o.visible=visible;button.setAttribute('aria-pressed',String(visible));button.textContent=visible?'隐藏':'显示';};
  row.append(name,button);find('dev-builtins').appendChild(row);
 };
 // Use a parent group so the animation may continue updating each particle layer internally.
 const particles=new THREE.Group();performanceStage.add(particles);
 for(const object of [...performanceStage.children])if(object.isPoints)particles.add(object);
 toggleRow('纺车四件套',[wheel,water.poolGroup,water.rainGroup,particles]);
 find('dev-collapse').onclick=e=>{const hidden=find('dev-content').hidden=!find('dev-content').hidden;e.target.textContent=hidden?'展开':'收起';e.target.setAttribute('aria-expanded',String(!hidden));};
 function setVisible(asset,visible){asset.visible=visible;if(asset.object)asset.object.visible=visible;if(asset.audio&&!visible)asset.audio.pause();asset.toggle.textContent=visible?'隐藏':'显示';asset.toggle.setAttribute('aria-pressed',String(visible));}
 const dispose=object=>object?.traverse(o=>{o.geometry?.dispose();for(const material of Array.isArray(o.material)?o.material:[o.material])if(material){for(const value of Object.values(material))if(value?.isTexture)value.dispose();material.dispose();}});
 function addAsset(name,object,audio,url){
  const asset={object,audio,url,visible:true};assets.push(asset);if(object)scene.add(object);
  const card=document.createElement('article');card.className='dev-card';const title=document.createElement('strong');title.textContent=name;card.appendChild(title);
  const actions=document.createElement('div');actions.className='dev-actions';const toggle=document.createElement('button');asset.toggle=toggle;toggle.onclick=()=>setVisible(asset,!asset.visible);
  const remove=document.createElement('button');remove.textContent='移除';remove.onclick=()=>{audio?.pause();object?.removeFromParent();dispose(object);URL.revokeObjectURL(url);assets.splice(assets.indexOf(asset),1);card.remove();};actions.append(toggle,remove);card.appendChild(actions);setVisible(asset,true);
  if(audio){audio.controls=true;audio.loop=true;audio.preload='metadata';card.appendChild(audio);}
  if(object){
   for(const [label,group,axis,min,max,step] of [['左右','position','x',-6,6,.05],['高度','position','y',-3,5,.05],['前后','position','z',-4,5,.05],['大小','scale','all',.05,4,.05],['转向','rotation','y',-180,180,1]]){
    const row=document.createElement('label');row.className='dev-slider';const caption=document.createElement('span'),input=document.createElement('input');input.type='range';input.min=min;input.max=max;input.step=step;
    input.value=axis==='all'?1:group==='rotation'?THREE.MathUtils.radToDeg(object[group][axis]):object[group][axis];
    const update=()=>{caption.textContent=label+' '+Number(input.value).toFixed(group==='rotation'?0:2);};update();
    input.oninput=()=>{const value=Number(input.value);if(axis==='all')object.scale.setScalar(value);else object[group][axis]=group==='rotation'?THREE.MathUtils.degToRad(value):value;update();};row.append(caption,input);card.appendChild(row);
   }
  }
  find('dev-assets').appendChild(card);
 }
 find('dev-files').onchange=async e=>{
  const files=[...e.target.files];e.target.value='';
  for(const file of files){const url=URL.createObjectURL(file),extension=file.name.split('.').pop().toLowerCase();status('正在添加 '+file.name);
   try{
    if(extension==='glb'){
     const gltf=await new GLTFLoader().loadAsync(url),model=gltf.scene;model.updateMatrixWorld(true);
     const box=new THREE.Box3().setFromObject(model),size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3()),factor=2/Math.max(size.x,size.y,size.z,.001);
     const normalized=new THREE.Group();model.position.sub(center);normalized.add(model);normalized.scale.setScalar(factor);
     const holder=new THREE.Group();holder.add(normalized);holder.position.set(0,-.7,1);addAsset(file.name,holder,null,url);
    }else if(['png','jpg','jpeg','webp'].includes(extension)){
     const texture=await new THREE.TextureLoader().loadAsync(url);texture.colorSpace=THREE.SRGBColorSpace;
     const aspect=texture.image.width/texture.image.height,object=new THREE.Mesh(new THREE.PlaneGeometry(2*aspect,2),new THREE.MeshBasicMaterial({map:texture,transparent:true,side:THREE.DoubleSide}));object.position.set(0,-.5,1);addAsset(file.name,object,null,url);
    }else if(['mp3','wav','ogg','m4a'].includes(extension)){const audio=new Audio(url);addAsset(file.name,null,audio,url);}
    else throw new Error('不支持此文件格式');
    status('已添加 '+file.name);
   }catch(error){URL.revokeObjectURL(url);status(file.name+'：加载失败，请检查格式。');console.error(error);}
  }
 };
 find('dev-show-all').onclick=()=>assets.forEach(a=>setVisible(a,true));find('dev-hide-all').onclick=()=>assets.forEach(a=>setVisible(a,false));
 find('dev-backdrop').value='library';find('dev-backdrop').dispatchEvent(new Event('change'));
 return {update(time){cameraTools.update();if(librarySet?.visible)librarySet.userData.update?.(time);}};
}
