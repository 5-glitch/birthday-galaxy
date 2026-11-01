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

