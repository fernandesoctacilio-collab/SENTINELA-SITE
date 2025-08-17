
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
