import {animateBoxLoadingIcon} from './box-loading-icon.js';

// Starts independently of the room's Three.js imports and scene construction.
const loading=document.querySelector('#loading');
if(loading){
 const stop=animateBoxLoadingIcon(loading.querySelector('.loading-case'),{onOpened:()=>{loading.dataset.iconOpened='true';}});
 loading.dataset.iconStarted=String(performance.now());
 loading.addEventListener('box-loading-stop',stop,{once:true});
}
