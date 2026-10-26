import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
export function setupCameraTools(container,rig,canvas){
 const section=document.createElement('details');section.className='dev-camera';section.open=true;
 section.innerHTML='<summary>镜头与焦距</summary><p>调整任意参数会启用手动镜头，停止演出过程中的自动推拉。</p><label class="dev-camera-toggle"><input type="checkbox">启用手动镜头</label><div class="dev-camera-fields"></div><button type="button">恢复默认镜头</button><label>当前镜头参数<textarea readonly rows="4" aria-label="当前镜头参数"></textarea></label>';
 container.appendChild(section);
 const inspectButton=document.createElement('button');inspectButton.type='button';inspectButton.textContent='查看建筑';inspectButton.setAttribute('aria-pressed','false');section.querySelector('summary').after(inspectButton);
 const help=document.createElement('p');help.textContent='查看建筑：左键旋转 · 滚轮缩放 · 右键平移；触屏单指旋转、双指缩放和平移。';inspectButton.after(help);
 const input=document.createElement('div');input.className='dev-inspection-input';input.hidden=true;input.setAttribute('aria-label','建筑镜头操作区域');document.querySelector('#app').appendChild(input);
 const orbit=new OrbitControls(rig.camera,input);orbit.enabled=false;orbit.enableDamping=true;orbit.dampingFactor=.1;orbit.minDistance=.3;orbit.maxDistance=65;orbit.maxPolarAngle=Math.PI*.96;
 let inspecting=false;
 function stopInspection(){if(!inspecting)return;inspecting=false;orbit.enabled=false;input.hidden=true;rig.inspect(false);inspectButton.textContent='查看建筑';inspectButton.setAttribute('aria-pressed','false');state=rig.get();refresh();}
 inspectButton.onclick=()=>{
  if(inspecting){stopInspection();return;}
  const current=rig.get();rig.inspect(true);orbit.target.set(current.target.x,current.target.y,current.target.z);orbit.enabled=true;input.hidden=false;inspecting=true;orbit.update();inspectButton.textContent='退出建筑查看';inspectButton.setAttribute('aria-pressed','true');
 };
 window.addEventListener('keydown',e=>{if(e.key==='Escape'&&inspecting)stopInspection();});
 const enabled=section.querySelector('input'),fields=section.querySelector('.dev-camera-fields'),output=section.querySelector('textarea');
 let state=rig.get();const controls=[];
 function refresh(){
  enabled.checked=state.manual;
  for(const {range,number,group,axis} of controls){const value=group==='focalLength'?state.focalLength:state[group][axis];range.value=value;number.value=Number(value.toFixed(2));}
  output.value=JSON.stringify({position:state.position,target:state.target,focalLength:Number(state.focalLength.toFixed(2))},null,2);
 }
 for(const [label,group,axis,min,max,step] of [
  ['左右位置','position','x',-15,15,.05],['镜头高度','position','y',-2,12,.05],['前后位置','position','z',2,30,.05],
  ['目标左右','target','x',-8,8,.05],['目标高度','target','y',-3,8,.05],['目标前后','target','z',-12,6,.05],
  ['焦距（mm）','focalLength',null,12,120,.5],
 ]){
  const row=document.createElement('label');row.className='dev-camera-row';const caption=document.createElement('span');caption.textContent=label;
  const range=document.createElement('input'),number=document.createElement('input');range.type='range';number.type='number';
  for(const input of [range,number]){input.min=min;input.max=max;input.step=step;input.setAttribute('aria-label',label+(input===range?'滑块':'数值'));}
  const change=e=>{stopInspection();const raw=e.target.valueAsNumber;if(!Number.isFinite(raw))return;const value=Math.max(min,Math.min(max,raw));if(group==='focalLength')state.focalLength=value;else state[group][axis]=value;state.manual=true;rig.set(state);refresh();};
  range.oninput=change;number.oninput=change;row.append(caption,number,range);fields.appendChild(row);controls.push({range,number,group,axis});
 }
 enabled.onchange=()=>{stopInspection();if(enabled.checked){state=rig.get();state.manual=true;rig.set(state);}else rig.reset();state=rig.get();refresh();};
 [...section.querySelectorAll('button')].find(button=>button!==inspectButton).onclick=()=>{stopInspection();rig.reset();state=rig.get();refresh();};refresh();
 return {update(){if(inspecting){orbit.update();state={...rig.get(),target:{x:orbit.target.x,y:orbit.target.y,z:orbit.target.z}};output.value=JSON.stringify({position:state.position,target:state.target,focalLength:Number(state.focalLength.toFixed(2))},null,2);}}};
}
