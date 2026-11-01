// A real point-cloud sculpture. Every visible part is a projected 3D particle.
(()=>{
 const scene=document.getElementById('scene');
 scene.replaceChildren();
 const canvas=document.createElement('canvas');canvas.className='particle-cake';
 canvas.setAttribute('role','img');canvas.setAttribute('aria-label','蓝色与金色粒子组成的立体星空蛋糕，自动旋转，可左右拖动');
 scene.append(canvas);
 const ctx=canvas.getContext('2d'),points=[];
 let width=0,height=0,rotation=0,lastTime=0,dragging=false,lastX=0,inertia=0;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 // Seeded randomness keeps the sculpture stable across reloads.
 let seed=7261;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 const blue=['#2756c9','#397deb','#67aaff','#b1d6ff','#5c65df'];
 const gold=['#ffe4a0','#f7bd58','#fff2cf'];
 function add(x,y,z,color,size=1,glow=false){points.push({x,y,z,color,size,glow,phase:random()*Math.PI*2});}
 // Tall cylindrical blue cake, with flowing nebula color bands.
 for(let i=0;i<6700;i++){
  const a=random()*Math.PI*2,y=-.7+random()*1.4;
  const r=.85+(random()-.5)*.018;
  const cloud=Math.sin(a*3+y*6)+Math.sin(a*7-y*4);
  const index=Math.max(0,Math.min(4,Math.floor((cloud+2)*1.22)));
  add(Math.cos(a)*r,y,Math.sin(a)*r,blue[index],.6+random()*.7);
 }
 // Ivory-gold icing disk and scalloped drips.
 for(let i=0;i<2100;i++){
  const a=random()*Math.PI*2,r=Math.sqrt(random())*.86;
  add(Math.cos(a)*r,.72+.024*Math.sin(a*5+r*8),Math.sin(a)*r,gold[i%3],.8+random()*.6);
 }
 for(let i=0;i<1000;i++){
  const a=random()*Math.PI*2,drop=.03+.15*Math.max(0,Math.sin(a*11))**6;
  add(.86*Math.cos(a),.72-random()*drop,.86*Math.sin(a),gold[i%3],.8);
 }
 // Porcelain plate is also made only of points.
 for(let i=0;i<1900;i++){
  const a=random()*Math.PI*2,r=.87+random()*.28;
  add(r*Math.cos(a),-.76+.025*Math.cos((r-.87)*12),r*Math.sin(a),i%5===0?gold[0]:'#779bdc',.7+random()*.5);
 }
 // Little gold stars on the cake surface, preserving their 3D positions.
 for(let i=0;i<24;i++){
  const a=i*2.39996,cy=-.59+random()*1.15;
  for(let j=0;j<35;j++){
   const angle=j/35*Math.PI*2;
   const radius=(j%7<3?.037:.018);
   const aa=a+Math.cos(angle)*radius/.87;
   add(.87*Math.cos(aa),cy+Math.sin(angle)*radius,.87*Math.sin(aa),'#ffdf86',1.15,true);
  }
 }
 // A pink sugar heart topper, rather than a birthday candle.
 for(let i=0;i<700;i++){
  const a=random()*Math.PI*2,s=.0115;
  const x=16*Math.sin(a)**3*s,y=(13*Math.cos(a)-5*Math.cos(2*a)-2*Math.cos(3*a)-Math.cos(4*a))*s;
  add(x,1.02+y,(random()-.5)*.085,i%3?'#ffb9d4':'#fff0de',.7+random()*.7,true);
 }
 // Inclined golden/lilac orbits form part of the rotating sculpture.
 for(let ring=0;ring<2;ring++)for(let i=0;i<650;i++){
  const a=i/650*Math.PI*2,r=1.19+ring*.06;
  add(r*Math.cos(a),(.45-ring*.85)+.26*Math.cos(a),r*Math.sin(a),i%3===0?'#b6a5ff':gold[i%3],.55+random()*.6,i%13===0);
 }
 for(let i=0;i<130;i++){
  const a=random()*Math.PI*2,r=1.3+random()*.25;
  add(r*Math.cos(a),-.9+random()*2.3,r*Math.sin(a),i%3?blue[3]:gold[0],.8+random(),true);
 }
 function fit(){
  const box=scene.getBoundingClientRect();width=box.width;height=box.height;
  const d=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*d);canvas.height=Math.round(height*d);ctx.setTransform(d,0,0,d,0,0);
 }
 new ResizeObserver(fit).observe(scene);
 canvas.addEventListener('pointerdown',e=>{dragging=true;lastX=e.clientX;inertia=0;canvas.setPointerCapture(e.pointerId);});
 canvas.addEventListener('pointermove',e=>{if(!dragging)return;inertia=(e.clientX-lastX)*.008;rotation+=inertia;lastX=e.clientX;});
 const release=()=>{dragging=false;};canvas.addEventListener('pointerup',release);canvas.addEventListener('pointercancel',release);
 let visible=false;new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;lastTime=0;}).observe(canvas);
 function draw(time){
  requestAnimationFrame(draw);
  const dt=lastTime?Math.min((time-lastTime)/1000,.05):0;lastTime=time;
  if(!visible||document.hidden||!width||!height)return;
  if(!dragging&&!reduced.matches){rotation+=dt*.23+inertia;inertia*=Math.exp(-dt*5);}
  ctx.clearRect(0,0,width,height);
  const ca=Math.cos(rotation),sa=Math.sin(rotation),tilt=.29,ct=Math.cos(tilt),st=Math.sin(tilt),scale=width*.275;
  const projected=points.map(p=>{
   const x=p.x*ca+p.z*sa,z=-p.x*sa+p.z*ca;
   const y=p.y*ct-z*st,depth=p.y*st+z*ct,perspective=4.8/(4.8-depth);
   return {p,x:width*.5+x*scale*perspective,y:height*.53-y*scale*perspective,z:depth,k:perspective};
  }).sort((a,b)=>a.z-b.z);
  for(const q of projected){
   const p=q.p,front=(q.z+1.6)/3.2;
   const flicker=reduced.matches?1:.85+.15*Math.sin(time*.0015+p.phase);
   ctx.globalAlpha=(.28+.66*front)*flicker;
   ctx.fillStyle=p.color;
   const r=p.size*q.k*Math.max(.68,width/480);
   if(p.glow){ctx.globalAlpha*=.14;ctx.beginPath();ctx.arc(q.x,q.y,r*3.5,0,Math.PI*2);ctx.fill();ctx.globalAlpha=(.55+.4*front)*flicker;}
   ctx.beginPath();ctx.arc(q.x,q.y,r,0,Math.PI*2);ctx.fill();
  }
  ctx.globalAlpha=1;
 }
 requestAnimationFrame(draw);
})();
