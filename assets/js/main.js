
// Robust splash loader for remote GIF
(function(){
  const splash = document.getElementById('splash');
  const gifEl = splash ? splash.querySelector('img') : null;
  let hidden = false;
  function hideSplash(delay=300){
    if(hidden) return;
    hidden = true;
    setTimeout(()=>{ splash && splash.classList.add('fade-out'); setTimeout(()=>splash && splash.remove(), 900); }, delay);
  }
  if(gifEl){
    // if loads, keep for ~4.8s
    gifEl.addEventListener('load', ()=> hideSplash(4800));
    gifEl.addEventListener('error', ()=> hideSplash(100)); // fail fast
  } else {
    hideSplash(200);
  }
  // safety timeout (7s)
  setTimeout(()=> hideSplash(200), 7000);
})();

// Mobile burger toggle
(function(){
  const nav = document.querySelector('.nav');
  const burger = document.querySelector('.burger');
  if(burger && nav){
    burger.addEventListener('click', ()=> nav.classList.toggle('open'));
  }
})();


// Splash based on animated GIF with timeout
document.addEventListener('DOMContentLoaded', ()=>{
  const splash = document.getElementById('splash');
  // hide splash after 4.8s
  setTimeout(()=>{
    if(splash){ splash.classList.add('fade-out'); setTimeout(()=>splash.remove(), 900); }
  }, 4800);
});


// Active link and splash control
document.addEventListener('DOMContentLoaded', ()=>{
  // Active nav item
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.links a').forEach(a=>{
    if(a.getAttribute('href').endswith(path)) a.classList.add('active');
  });
});
window.addEventListener('load', ()=>{
  const splash = document.getElementById('splash');
  // fade out after 3.5s (enough to start playback)
  setTimeout(()=>{
    splash.classList.add('fade-out');
    setTimeout(()=>splash.remove(), 1000);
  }, 3500);
});
