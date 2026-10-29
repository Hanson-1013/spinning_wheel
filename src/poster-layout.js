import {LIBRARY_FLOOR_Y,LIBRARY_CEILING_BOTTOM} from './library-window-layout.js';
export const WALL={width:Math.hypot(3,3)-1.2,top:LIBRARY_CEILING_BOTTOM,bottom:LIBRARY_FLOOR_Y,skirting:-1.99,pillarInset:.43,cabinetTop:1.45,margin:.04};
export const LAYOUT_KEY='library-poster-layout-v1';
export const aspect=id=>id===1?432/266:553/340;
export const dimensions=p=>({w:(p.w+.29)*.78,h:(p.w*aspect(p.id)+.29)*.78});
export function constrain(p){
 const half=WALL.width/2-WALL.pillarInset-WALL.margin,minY=p.side===-1?WALL.cabinetTop+WALL.margin:WALL.skirting+WALL.margin;
 const maxW=Math.min((half*2)/.78-.29,((WALL.top-WALL.margin-minY)/.78-.29)/aspect(p.id));
 p.w=Math.max(.15,Math.min(maxW,p.w));const d=dimensions(p);
 p.x=Math.max(-half+d.w/2,Math.min(half-d.w/2,p.x));p.y=Math.max(minY+d.h/2,Math.min(WALL.top-WALL.margin-d.h/2,p.y));return p;
}
export function defaults(){const result=[],edge=WALL.width/2-WALL.pillarInset-WALL.margin;for(const side of [-1,1]){let index=0;const columns=side===-1?[[-edge,1,[.95,.64]],[edge,-1,[.76]]]:[[-edge,1,[.83,.65,.91,.62,.39,.35]],[edge,-1,[1.02,.69,.82,.65,.38]]];for(const [x,align,widths]of columns){let top=WALL.top-.3;for(const w of widths){const id=(side===-1?0:3)+ ++index,width=(w+.29)*.78,height=(w*aspect(id)+.29)*.78;result.push(constrain({id,side,x:x+align*width/2,y:top-height/2,w}));top-=height+.14;}}}return result;}
export function validLayout(data){return Array.isArray(data)&&data.length===14&&new Set(data.map(p=>p.id)).size===14&&data.every(p=>Number.isInteger(p.id)&&p.id>=1&&p.id<=14&&[-1,1].includes(p.side)&&[p.x,p.y,p.w].every(Number.isFinite)&&p.w>=.15&&p.w<=3);}
export function readLayout(){try{const data=JSON.parse(localStorage.getItem(LAYOUT_KEY));if(validLayout(data))return data.map(p=>constrain({...p}));}catch{}return defaults();}
