// Lightweight projected SVG: the base stays flat while the hollow lid hinges open.
// No WebGL context or image assets are needed before the room has loaded.
export function animateBoxLoadingIcon(svg,{onOpened=()=>{},autoplay=true}={}){
 const ns='http://www.w3.org/2000/svg';
 const leaf='M0 0H.35 C.335 .055 .29 .087 .24 .079 C.19 .072 .145 .044 .105 .053 C.085 .059 .087 .086 .108 .105 C.16 .14 .183 .176 .163 .205 C.111 .213 .079 .185 .065 .153 C.047 .174 .049 .215 .067 .242 C.073 .28 .043 .32 0 .35Z';
 const node=(name,attrs={})=>{const n=document.createElementNS(ns,name);for(const [k,v] of Object.entries(attrs))n.setAttribute(k,v);return n;};
 svg.replaceChildren();svg.setAttribute('viewBox','0 0 300 260');
 const defs=node('defs'),leafPath=node('path',{id:'case-animated-leaf',d:leaf});defs.append(leafPath);svg.append(defs);
 const faces=[];
 const add=(a,b)=>a.map((v,i)=>v+b[i]);
 const mul=(a,n)=>a.map(v=>v*n);
 function face(id,origin,u,v,width,height,lid,pattern,inner=false,normal=null){
  const group=node('g',{'stroke-linejoin':'round','stroke-linecap':'round'});
  const outline=node('path',{fill:inner?'#101416':'#080d10',stroke:'currentColor','stroke-width':inner?'.65':'1.05'});group.append(outline);
  const clip=node('clipPath',{id:`case-motion-${id}`}),clipPath=node('path');clip.append(clipPath);defs.append(clip);
  const decoration=node('g',{'clip-path':`url(#case-motion-${id})`});group.append(decoration);
  const diamonds=[];
  if(pattern){
   for(let row=-1;row<height/.408+2;row++)for(let col=-1;col<width/.48+2;col++){
    const x=col*.48+(row%2)*.24,y=row*.408;
    const points=[[x,y-.408],[x+.24,y],[x,y+.408],[x-.24,y]].map(([s,t])=>add(origin,add(mul(u,s),mul(v,t))));
    const path=node('path',{fill:'currentColor','fill-opacity':row%2?'.008':'.06',stroke:'currentColor','stroke-opacity':'.4','stroke-width':'.45'});decoration.append(path);diamonds.push({points,path});
   }
  }
  const corners=[];
  if(pattern)for(const a of [0,1])for(const b of [0,1]){
   const corner=add(origin,add(mul(u,a*width),mul(v,b*height)));
   const use=node('use',{href:'#case-animated-leaf',fill:'#111719',stroke:'currentColor','stroke-width':'.018'});decoration.append(use);
   const rivets=[[.275,.031],[.025,.277],[.117,.157]].map(([s,t])=>{const circle=node('circle',{r:'.7',fill:'currentColor'});decoration.append(circle);return {circle,s,t};});
   corners.push({corner,u:mul(u,a?-.68:.68),v:mul(v,b?-.68:.68),use,rivets});
  }
  const points=[origin,add(origin,mul(u,width)),add(origin,add(mul(u,width),mul(v,height))),add(origin,mul(v,height))];
  faces.push({group,outline,clipPath,diamonds,corners,points,lid,normal});svg.append(group);
 }
 // Loading silhouette: model width/length, shells thickened 26% for small-scale clarity.
 const shellDepth=.49,liningDepth=shellDepth-.045;
 for(const lid of [false,true]){
  const id=lid?'lid':'base',sign=lid?1:-1;
  face(`${id}-outer`,[-1.4,sign*shellDepth,-.925],[1,0,0],[0,0,1],2.8,1.85,lid,true,false,[0,sign,0]);
  face(`${id}-lining`,[-1.355,sign*liningDepth,-.88],[1,0,0],[0,0,1],2.71,1.76,lid,false,true,[0,-sign,0]);
  for(const x of [-1.4,1.4])face(`${id}-side-${x}`,[x,0,-.925],[0,0,1],[0,sign,0],1.85,shellDepth,lid,true,false,[Math.sign(x),0,0]);
  for(const x of [-1.355,1.355])face(`${id}-inner-side-${x}`,[x,0,-.88],[0,0,1],[0,sign,0],1.76,liningDepth,lid,false,true,[-Math.sign(x),0,0]);
  for(const z of [-.88,.88])face(`${id}-inner-end-${z}`,[-1.355,0,z],[1,0,0],[0,sign,0],2.71,liningDepth,lid,false,true,[0,0,-Math.sign(z)]);
  for(const z of [-.925,.925])face(`${id}-end-${z}`,[-1.4,0,z],[1,0,0],[0,sign,0],2.8,shellDepth,lid,true,false,[0,0,Math.sign(z)]);
 }
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let frame=0,stopped=false,lastTime,elapsed=0,notified=false,progress=0,target=0;
 const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
 function render(angle){
  const c=Math.cos(angle),s=Math.sin(angle);
  function world(p,lid){if(!lid)return p;const z=p[2]+.925;return [p[0],p[1]*c+z*s,-p[1]*s+z*c-.925];}
  const project=p=>[150-59*(.9*p[0]+.45*p[2]),174+59*(-.18*p[0]-.84*p[1]+.36*p[2])];
  const path=points=>'M'+points.map(p=>p.map(v=>v.toFixed(2)).join(' ')).join('L')+'Z';
  for(const f of faces){
   // Cull the hidden outside/lining surfaces instead of drawing both through one another.
   if(f.normal){
    const [x,y,z]=f.normal,n=f.lid?[x,y*c+z*s,-y*s+z*c]:f.normal;
    f.group.setAttribute('display',-.378*n[0]+.405*n[1]+.756*n[2]>1e-6?'inline':'none');
   }
   const transform=p=>project(world(p,f.lid));
   const d=path(f.points.map(transform));f.outline.setAttribute('d',d);f.clipPath.setAttribute('d',d);
   for(const diamond of f.diamonds)diamond.path.setAttribute('d',path(diamond.points.map(transform)));
   for(const corner of f.corners){
    const o=transform(corner.corner),u=transform(add(corner.corner,corner.u)),v=transform(add(corner.corner,corner.v));
    corner.use.setAttribute('transform',`matrix(${u[0]-o[0]} ${u[1]-o[1]} ${v[0]-o[0]} ${v[1]-o[1]} ${o[0]} ${o[1]})`);
    for(const {circle,s,t} of corner.rivets){circle.setAttribute('cx',o[0]+(u[0]-o[0])*s+(v[0]-o[0])*t);circle.setAttribute('cy',o[1]+(u[1]-o[1])*s+(v[1]-o[1])*t);}
   }
   f.depth=f.points.reduce((sum,p)=>{const w=world(p,f.lid);return sum-.378*w[0]+.405*w[1]+.756*w[2];},0)/4;
  }
  // Painter order also swaps correctly as the lid turns away from the viewer.
  for(const f of [...faces].sort((a,b)=>a.depth-b.depth))svg.append(f.group);
 }
 function tick(now){
  if(stopped||!svg.isConnected)return;
  // Scene construction can block the main thread: never turn that pause into a jump.
  const dt=lastTime===undefined?0:Math.min(32,Math.max(0,now-lastTime));
  elapsed+=dt;
  lastTime=now;
  if(!autoplay)progress=reduced.matches?target:progress+Math.sign(target-progress)*Math.min(Math.abs(target-progress),dt/800);
  const amount=autoplay?(reduced.matches?1:smooth((elapsed-350)/1600)):smooth(progress);
  render(amount*Math.PI*.61);
  if(amount>=1&&!notified){notified=true;onOpened();}
  if(autoplay?amount<1:Math.abs(progress-target)>1e-6)frame=requestAnimationFrame(tick);
 }
 const changed=()=>{cancelAnimationFrame(frame);lastTime=undefined;frame=requestAnimationFrame(tick);};
 reduced.addEventListener('change',changed);render(0);if(autoplay)frame=requestAnimationFrame(tick);
 const stop=()=>{stopped=true;cancelAnimationFrame(frame);reduced.removeEventListener('change',changed);};
 stop.setOpen=(open)=>{if(stopped||autoplay)return;target=open?1:0;lastTime=undefined;cancelAnimationFrame(frame);frame=requestAnimationFrame(tick);};
 return stop;
}
