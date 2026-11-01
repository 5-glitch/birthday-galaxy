const $=id=>document.getElementById(id);
const canvas=$('stars'),ctx=canvas.getContext('2d');let dots=[],burst=[],w,h;
function resize(){w=innerWidth;h=innerHeight;const d=Math.min(devicePixelRatio||1,2);canvas.width=w*d;canvas.height=h*d;ctx.setTransform(d,0,0,d,0,0);dots=Array.from({length:85},()=>({x:Math.random()*w,y:Math.random()*h,r:Math.random()*1.3+.3,p:Math.random()*7}));}resize();addEventListener('resize',resize);
function paint(t){ctx.clearRect(0,0,w,h);for(const s of dots){ctx.globalAlpha=.2+.5*(1+Math.sin(t/1500+s.p))/2;ctx.fillStyle='#d9dfff';ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,7);ctx.fill();}ctx.globalAlpha=1;burst=burst.filter(p=>p.life>0);for(const p of burst){p.x+=p.vx;p.y+=p.vy;p.vy+=.018;p.life-=.008;ctx.globalAlpha=Math.max(0,p.life);ctx.fillStyle=p.c;ctx.fillRect(p.x,p.y,3,3);}ctx.globalAlpha=1;requestAnimationFrame(paint);}requestAnimationFrame(paint);
let audio,playing=false,timer,next=0,note=0;
// A soft original pentatonic music-box phrase for an everyday surprise.
const melody=[[72,1],[76,1],[79,1.5],[76,.5],[74,1],[72,2],[69,1],[72,1],[76,2],[74,1],[69,1],[67,2],[72,1],[74,1],[79,2],[81,1],[79,1],[76,2],[74,1],[72,3],[0,2]];
function tone(midi,when,dur,volume=.13){if(!midi)return;const osc=audio.createOscillator(),gain=audio.createGain();osc.type='sine';osc.frequency.value=440*2**((midi-69)/12);gain.gain.setValueAtTime(0,when);gain.gain.linearRampToValueAtTime(volume,when+.015);gain.gain.exponentialRampToValueAtTime(.001,when+dur+1);osc.connect(gain);gain.connect(audio.destination);osc.start(when);osc.stop(when+dur+1.1);}
function schedule(){while(playing&&next<audio.currentTime+.4){const [m,d]=melody[note];tone(m,next,d*.48);if(note%3===0)tone(48,next,1.2,.035);next+=d*.48;note=(note+1)%melody.length;}}
async function toggleMusic(){try{if(!audio)audio=new(window.AudioContext||window.webkitAudioContext)();if(playing){playing=false;clearInterval(timer);await audio.suspend();}else{await audio.resume();playing=true;next=audio.currentTime+.05;schedule();timer=setInterval(schedule,150);}$('music').classList.toggle('playing',playing);$('music').setAttribute('aria-label',playing?'暂停音乐':'开启音乐');$('music').textContent=playing?'♫':'♪';}catch(e){$('music').textContent='♪';$('music').setAttribute('aria-label','点击重试播放音乐');}}
$('open').onclick=()=>{$('welcome').hidden=true;$('main').hidden=false;$('music').hidden=false;toggleMusic();};$('music').onclick=toggleMusic;
$('wish').onclick=()=>{
 $('message').innerHTML='阿力腾才其格，<br>不用等到特别的日子，<br>你本来就值得所有温柔和偏爱。<br>今天也想让你开心一点，再开心一点。';
 $('wish').textContent='再送你一片小星河 ✧';
 $('hint').textContent='漂亮的蛋糕，送给我心里最美的你 ♡';
 burst=Array.from({length:150},()=>({x:w/2,y:h*.45,vx:(Math.random()-.5)*7,vy:(Math.random()-.65)*6,life:1,c:['#f5d69d','#afbbff','#ffb8cf'][Math.floor(Math.random()*3)]}));
};

// Orbit coordinates are projected from tilted circles; rear particles are
// occluded by the cake, while the front half passes across its surface.
const orbitCanvas=document.createElement('canvas');
orbitCanvas.className='orbit-particles';orbitCanvas.setAttribute('aria-hidden','true');
$('scene').appendChild(orbitCanvas);
const orbitCtx=orbitCanvas.getContext('2d');
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
const orbitColors=['#ffdfa3','#a4c8ff','#c5b4ff','#ffc1d8'];
const orbitParticles=Array.from({length:150},(_,i)=>({
 phase:i*2.399963,ring:i%3,size:.7+Math.random()*1.6,
 speed:.22+Math.random()*.14,color:orbitColors[i%4]
}));
let orbitW=0,orbitH=0;
function fitOrbit(){
 const rect=$('scene').getBoundingClientRect();
 if(!rect.width||!rect.height)return;
 orbitW=rect.width;orbitH=rect.height;
 const d=Math.min(devicePixelRatio||1,2);
 orbitCanvas.width=Math.round(orbitW*d);orbitCanvas.height=Math.round(orbitH*d);
 orbitCtx.setTransform(d,0,0,d,0,0);
}
new ResizeObserver(fitOrbit).observe($('scene'));
function orbitPoint(a,ring){
 const radius=orbitW*(.38+ring*.025),depth=Math.sin(a);
 return {x:orbitW*.52+Math.cos(a)*radius,
 y:orbitH*([.43,.62,.73][ring])+depth*orbitW*.12-Math.cos(a)*orbitW*.12,
 depth};
}
function drawOrbits(time){
 if(orbitW&&!$('main').hidden&&!document.hidden){
 orbitCtx.clearRect(0,0,orbitW,orbitH);
 const seconds=reducedMotion.matches?0:time/1000;
 for(const p of orbitParticles){
  const a=p.phase+seconds*p.speed,point=orbitPoint(a,p.ring);
  if(point.depth<0&&point.x>orbitW*.27&&point.x<orbitW*.78&&point.y>orbitH*.43&&point.y<orbitH*.82)continue;
  const alpha=(point.depth>0?.9:.35)*(.7+.3*Math.sin(a*3+p.phase)**2);
  orbitCtx.strokeStyle=p.color;orbitCtx.lineWidth=p.size*.6;
  orbitCtx.globalAlpha=alpha*.35;orbitCtx.beginPath();
  for(let j=0;j<7;j++){
   const tail=orbitPoint(a-j*.012,p.ring);
   if(j===0)orbitCtx.moveTo(tail.x,tail.y);else orbitCtx.lineTo(tail.x,tail.y);
  }
  orbitCtx.stroke();orbitCtx.globalAlpha=alpha;
  orbitCtx.shadowColor=p.color;orbitCtx.shadowBlur=8;
  orbitCtx.fillStyle=p.color;orbitCtx.beginPath();
  orbitCtx.arc(point.x,point.y,p.size*(.8+.3*point.depth),0,Math.PI*2);orbitCtx.fill();
 }
 orbitCtx.shadowBlur=0;orbitCtx.globalAlpha=1;
 }
 requestAnimationFrame(drawOrbits);
}
requestAnimationFrame(drawOrbits);
