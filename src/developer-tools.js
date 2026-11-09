import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import './developer.css';
import {setupCameraTools} from './developer-camera.js';
import {createBotanicalLibrary} from './botanical-library.js';
import {createMarshRuins} from './marsh-ruins.js';
import {boxCameraPreset} from './box-camera-view.js';
import {createLibraryAtmosphere} from './library-atmosphere.js';

export function setupDeveloperTools({scene,wheel,backdropObjects,canvas,renderer,water,cameraRig,performanceStage,renderStyles}){
 const panel=document.createElement('section');panel.className='developer-panel';panel.setAttribute('aria-label','素材试验台');
 panel.innerHTML=`<div class="dev-heading"><strong>素材试验台</strong><button id="dev-collapse" aria-expanded="true">收起</button></div>
 <div id="dev-content"><p>独立开发页面 · <a href="/">返回展示首页</a> · <a href="/test/modules">手机单模组查看</a></p>
 <p>导入 GLB 模型、PNG / JPG / WebP 图片或音频。素材仅在本次页面中试用，刷新后清除。</p>
 <label class="dev-upload">添加素材<input id="dev-files" type="file" multiple accept=".glb,.png,.jpg,.jpeg,.webp,.mp3,.wav,.ogg,.m4a"></label>
 <p id="dev-status" role="status" aria-live="polite">选择素材开始试用</p>
 <div class="dev-actions"><button id="dev-show-all">显示全部素材</button><button id="dev-hide-all">隐藏全部素材</button></div>
 <h2>布景</h2><label for="dev-backdrop">选择背景</label><select id="dev-backdrop"><option value="original">原布景 · 暗色水庭</option><option value="library">植物书房 · 晨光格窗</option><option value="marsh">最初的涟漪 · 芦苇水泽</option></select><p>植物书房与最初的涟漪均为三维布景，可切换查看。水泽布景使用独立水面与倒影。</p>
 <h2>时间 / 天气</h2>
 <label for="dev-time">时间</label><select id="dev-time"><option value="morning">清晨 · 晨光格窗</option><option value="night">夜晚 · 月光暖灯</option></select>
 <label for="dev-weather">天气</label><select id="dev-weather"><option value="mist">薄雾</option><option value="clear">晴朗</option></select><p>夜晚单独调整窗外天空、月光与室内暖灯；可切回清晨对照。</p>
 <div class="dev-row"><span>吊灯</span><button id="dev-pendant-toggle" type="button" aria-pressed="false">打开吊灯</button></div>
 <h2>复古模拟胶片</h2><label for="dev-render-style">画面效果</label><select id="dev-render-style"><option value="analog">复古模拟胶片 · 参考图风格</option><option value="original">原画对照 · 关闭滤镜</option></select>
 <label for="dev-style-strength">滤镜强度 <output id="dev-style-strength-value">40%</output></label><input id="dev-style-strength" type="range" min="0" max="100" value="40">
 <label for="dev-film-grain">胶片颗粒 <output id="dev-film-grain-value">40%</output></label><input id="dev-film-grain" type="range" min="0" max="100" value="40">
 <label for="dev-film-fringe">红青色差 <output id="dev-film-fringe-value">1</output></label><input id="dev-film-fringe" type="range" min="0" max="3" step="0.05" value="1">
 <h2>室内雾气</h2><div class="dev-row"><span>室内轻雾</span><button id="dev-mist-toggle" aria-pressed="true">隐藏雾气</button></div>
 <label for="dev-mist-density">浓度 <output id="dev-mist-value">16%</output></label><input id="dev-mist-density" type="range" min="0" max="100" step="1" value="16" aria-label="室内雾气浓度">
 <div id="dev-camera"></div><h2>场景内容</h2><div id="dev-builtins"></div><h2>导入素材</h2><div id="dev-assets"></div></div>`;
 document.querySelector('#app').appendChild(panel);
 const find=id=>panel.querySelector('#'+id),assets=[];
 const status=text=>find('dev-status').textContent=text;
 const cameraTools=setupCameraTools(find('dev-camera'),cameraRig,canvas);
 const originalBackground=scene.background,originalFog=scene.fog,originalShadows=renderer.shadowMap.enabled;
 let librarySet=null,marshSet=null,atmosphere=null,mistVisible=true,pendantsOn=false,stageToggle=null;
 const originalWheelPosition=wheel.position.clone(),originalExposure=renderer.toneMappingExposure;
 function applyMist(){marshSet?.userData.setMistDensity(find('dev-mist-density').value);marshSet?.userData.setMist(mistVisible&&find('dev-weather').value!=='clear');atmosphere?.setWeather(find('dev-weather').value);const api=librarySet?.userData.indoorMist;if(api){api.setVisible(mistVisible&&find('dev-weather').value!=='clear');api.setDensity(find('dev-mist-density').value);}}
 find('dev-mist-toggle').onclick=()=>{mistVisible=!mistVisible;find('dev-mist-toggle').textContent=mistVisible?'隐藏雾气':'显示雾气';find('dev-mist-toggle').setAttribute('aria-pressed',String(mistVisible));applyMist();};
 find('dev-mist-density').oninput=()=>{find('dev-mist-value').textContent=find('dev-mist-density').value+'%';applyMist();};
 find('dev-time').onchange=()=>{document.body.dataset.libraryTime=find('dev-time').value;atmosphere?.setTime(find('dev-time').value);status(find('dev-time').value==='night'?'已切换夜晚 · 月光暖灯':'已切换清晨 · 晨光格窗');};
 find('dev-weather').onchange=applyMist;
 find('dev-pendant-toggle').onclick=()=>{pendantsOn=!pendantsOn;atmosphere?.setPendantLights(pendantsOn);find('dev-pendant-toggle').textContent=pendantsOn?'关闭吊灯':'打开吊灯';find('dev-pendant-toggle').setAttribute('aria-pressed',String(pendantsOn));};
 find('dev-render-style').onchange=e=>renderStyles?.setPreset(e.target.value);
 find('dev-style-strength').oninput=e=>{find('dev-style-strength-value').textContent=e.target.value+'%';renderStyles?.setStrength(e.target.value/100);};
 find('dev-film-grain').oninput=e=>{find('dev-film-grain-value').textContent=e.target.value+'%';renderStyles?.setGrain(e.target.value*.0014);};
 find('dev-film-fringe').oninput=e=>{find('dev-film-fringe-value').textContent=e.target.value;renderStyles?.setAberration(e.target.value);};
 const title=document.querySelector('.title'),originalTitle=title.innerHTML;
 const libraryTitle='<div class="eyebrow">In The Box — Out Of Rain</div><h1>箱中客厅<span>A mysterious box.</span></h1><p>箱中天地 雨外桃源</p>';
 const originalVisibility=backdropObjects.map(object=>object.visible);
 find('dev-backdrop').onchange=e=>{
  const useLibrary=e.target.value==='library',useMarsh=e.target.value==='marsh';
  cameraRig.setStageOffset(useLibrary?1.2:0);
  cameraRig.camera.far=useMarsh?300:100;cameraRig.camera.updateProjectionMatrix();
  wheel.position.copy(originalWheelPosition);if(useMarsh)wheel.position.x-=.52;
  document.body.classList.toggle('library-preview',useLibrary);
  document.body.classList.toggle('marsh-preview',useMarsh);
  title.innerHTML=useLibrary?libraryTitle:useMarsh?'<div class="eyebrow">WHERE THE GOLDEN REEDS WHISPER</div><h1>最初的涟漪<span>A wheel among the reeds.</span></h1><p>薄雾弥漫之地，偶然或必然的相遇。</p>':originalTitle;
  cameraTools.setDefault(useLibrary?boxCameraPreset():useMarsh?{position:{x:-.4,y:-.35,z:11.5},target:{x:0,y:-.95,z:-11},focalLength:21.5}:null);
  if(useLibrary&&!librarySet){librarySet=createBotanicalLibrary();scene.add(librarySet);atmosphere=createLibraryAtmosphere(librarySet,scene,renderer,renderStyles);atmosphere.setPendantLights(pendantsOn);}
  if(useMarsh&&!marshSet){marshSet=createMarshRuins();scene.add(marshSet);}
  if(librarySet)librarySet.visible=useLibrary;
  if(marshSet)marshSet.visible=useMarsh;
  applyMist();
  renderer.shadowMap.enabled=useLibrary||useMarsh||originalShadows;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  scene.background=useLibrary?new THREE.Color(0xbacac2):useMarsh?new THREE.Color(0x879581):originalBackground;
  scene.fog=useLibrary?new THREE.FogExp2(0xb6c8bd,.007):useMarsh?new THREE.FogExp2(0x737b75,.021):originalFog;
  backdropObjects.forEach((object,i)=>object.visible=useLibrary||useMarsh?false:originalVisibility[i]);
  atmosphere?.setEnabled(useLibrary);
  if(!useLibrary){renderStyles?.setNightTone(0);renderer.toneMappingExposure=useMarsh?1.12:originalExposure;}
  stageToggle?.(useMarsh);
  find('dev-time').disabled=find('dev-pendant-toggle').disabled=!useLibrary;
  find('dev-weather').disabled=!(useLibrary||useMarsh);
  const url=new URL(location.href);url.searchParams.set('backdrop',e.target.value);history.replaceState(null,'',url);
  status(useLibrary?'已切换三维植物书房':useMarsh?'已切换最初的涟漪 · 芦苇水泽':'已切换原布景');
 };

 const toggleRow=(label,objects)=>{
  for(const object of objects)object.visible=false;
  const row=document.createElement('div');row.className='dev-row';const name=document.createElement('span');name.textContent=label;
  const button=document.createElement('button');button.textContent='显示';button.setAttribute('aria-pressed','false');
  const set=visible=>{const marsh=find('dev-backdrop').value==='marsh';for(const object of objects)object.visible=visible&&(!marsh||object===wheel);button.setAttribute('aria-pressed',String(visible));button.textContent=visible?'隐藏':'显示';};
  button.onclick=()=>set(button.getAttribute('aria-pressed')!=='true');
  row.append(name,button);find('dev-builtins').appendChild(row);return set;
 };
 // Use a parent group so the animation may continue updating each particle layer internally.
 const particles=new THREE.Group();performanceStage.add(particles);
 for(const object of [...performanceStage.children])if(object.isPoints)particles.add(object);
 stageToggle=toggleRow('纺车四件套',[wheel,water.poolGroup,water.rainGroup,particles]);
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
 const requested=new URLSearchParams(location.search).get('backdrop');
 find('dev-backdrop').value=['original','library','marsh'].includes(requested)?requested:'marsh';find('dev-backdrop').dispatchEvent(new Event('change'));
 return {update(time){cameraTools.update();if(librarySet?.visible)librarySet.userData.update?.(time);if(marshSet?.visible)marshSet.userData.update?.(time);}};
}
