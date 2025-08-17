
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
