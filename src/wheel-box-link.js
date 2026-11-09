import {animateBoxLoadingIcon} from './box-loading-icon.js';
const link=document.querySelector('.box-link');
if(link){
 const animation=animateBoxLoadingIcon(link.querySelector('svg'),{autoplay:false});
 let hovered=false,focused=false;
 const update=()=>animation.setOpen(hovered||focused);
 link.addEventListener('pointerenter',event=>{if(event.pointerType==='touch')return;hovered=true;update();});
 link.addEventListener('pointerleave',()=>{hovered=false;update();});
 link.addEventListener('focus',()=>{focused=link.matches(':focus-visible');update();});
 link.addEventListener('blur',()=>{focused=false;update();});
 addEventListener('pagehide',()=>{hovered=focused=false;animation.setOpen(false);});
}
