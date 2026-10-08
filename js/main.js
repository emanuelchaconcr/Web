const loader=document.getElementById("loader");
window.addEventListener("load",()=>setTimeout(()=>loader.style.opacity="0",250));
window.addEventListener("load",()=>setTimeout(()=>loader.remove(),900));

const menu=document.querySelector(".menu-toggle");
const nav=document.querySelector(".nav-links");
menu?.addEventListener("click",()=>nav.classList.toggle("open"));
document.querySelectorAll(".nav-links a").forEach(a=>a.addEventListener("click",()=>nav.classList.remove("open")));

const observer=new IntersectionObserver(entries=>{
 entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add("visible")});
},{threshold:.12});
document.querySelectorAll(".reveal").forEach(el=>observer.observe(el));

document.getElementById("year").textContent=new Date().getFullYear();
const clock=document.getElementById("clock");
function updateClock(){if(clock)clock.textContent=new Date().toLocaleString("es-CR");}
updateClock(); setInterval(updateClock,1000);

/* ===== Animated Network Background ===== */
(function(){
 const c=document.getElementById("network-bg"); if(!c)return;
 const x=c.getContext("2d"); let w,h,dpr,pts=[],mouse={x:-9999,y:-9999};
 const N=window.innerWidth<700?38:78;
 function resize(){dpr=Math.min(devicePixelRatio||1,2);w=innerWidth;h=innerHeight;c.width=w*dpr;c.height=h*dpr;c.style.width=w+"px";c.style.height=h+"px";x.setTransform(dpr,0,0,dpr,0,0)}
 function init(){pts=Array.from({length:N},()=>({x:Math.random()*w,y:Math.random()*h,vx:(Math.random()-.5)*.22,vy:(Math.random()-.5)*.22,r:Math.random()*1.7+.5}))}
 function draw(){
   x.clearRect(0,0,w,h);
   for(const p of pts){
     p.x+=p.vx;p.y+=p.vy;
     if(p.x<0||p.x>w)p.vx*=-1;if(p.y<0||p.y>h)p.vy*=-1;
     const md=Math.hypot(p.x-mouse.x,p.y-mouse.y);
     if(md<140){p.x+=(p.x-mouse.x)*.001;p.y+=(p.y-mouse.y)*.001}
   }
   for(let i=0;i<pts.length;i++){
     const a=pts[i];
     x.beginPath();x.arc(a.x,a.y,a.r,0,Math.PI*2);x.fillStyle="rgba(0,229,255,.48)";x.fill();
     for(let j=i+1;j<pts.length;j++){
       const b=pts[j],dist=Math.hypot(a.x-b.x,a.y-b.y);
       if(dist<125){
         x.beginPath();x.moveTo(a.x,a.y);x.lineTo(b.x,b.y);
         x.strokeStyle=`rgba(0,180,220,${(1-dist/125)*.12})`;x.lineWidth=1;x.stroke();
       }
     }
   }
   requestAnimationFrame(draw);
 }
 addEventListener("resize",()=>{resize();init()});
 addEventListener("pointermove",e=>{mouse.x=e.clientX;mouse.y=e.clientY});
 addEventListener("pointerleave",()=>{mouse.x=-9999;mouse.y=-9999});
 resize();init();draw();
})();
