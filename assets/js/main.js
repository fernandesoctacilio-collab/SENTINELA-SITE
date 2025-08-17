
// ===== Splash GIF control (ensure present) =====
(function(){
  const splash = document.getElementById('splash');
  const img = document.getElementById('splashGif');
  if(!splash) return;
  const hide = ()=>{ splash.classList.add('fade-out'); setTimeout(()=> splash.remove(), 800); };
  if(img){ img.addEventListener('load', ()=> setTimeout(hide, 5200), {once:true}); img.addEventListener('error', ()=> setTimeout(hide, 400), {once:true}); }
  setTimeout(hide, 7000);
})();

// ===== Utility: turn a grid into a rotating deck =====
function startRotation(container, intervalMs=4500, visibleCount=3){
  if(!container) return;
  container.classList.add('rotating');
  let items = Array.from(container.children);
  if(items.length <= visibleCount) return;
  let index = 0;
  setInterval(()=>{
    // hide first visible and append to end
    items = Array.from(container.children);
    const toMove = items[0];
    toMove.classList.add('hide');
    setTimeout(()=>{
      toMove.classList.remove('hide');
      container.appendChild(toMove);
    }, 480);
  }, intervalMs);
}

// ===== After dynamic content render, start rotations & remove skeletons =====
function initDynamicDecks(){
  const newsGrid = document.getElementById('newsGrid');
  const expGrid = document.getElementById('explicaGrid');
  // remove skeletons if any
  document.querySelectorAll('.skeleton-grid').forEach(s => s.classList.remove('skeleton-grid'));
  document.querySelectorAll('.skeleton-card').forEach(s => s.remove());
  startRotation(newsGrid, 4500, 3);
  startRotation(expGrid, 5000, 3);
}


// ===== Load & render dynamic content from JSON =====
async function fetchJSON(path){ const r = await fetch(path); return r.json(); }

async function renderHomepage(){
  const newsGrid = document.getElementById('newsGrid');
  const explicaGrid = document.getElementById('explicaGrid');
  try{
    const [news, exp] = await Promise.all([fetchJSON('assets/data/news.json'), fetchJSON('assets/data/explica.json')]);
    if(newsGrid){
      news.slice(0,3).forEach((n,i)=>{
        const a = document.createElement('a');
        a.className = 'card reveal delay-' + (i+1);
        a.href = n.url;
        a.innerHTML = `<img loading="lazy" data-reveal-img class="cover" src="${n.image}" alt="${n.title}">
          <div class="p"><span class="chip">${n.tag||''}</span><h3>${n.title}</h3><p>${n.summary}</p></div>`;
        newsGrid.appendChild(a);
      });
    }
    if(explicaGrid){
      exp.slice(0,3).forEach((e,i)=>{
        const a = document.createElement('a');
        a.className = 'card reveal delay-' + (i+1);
        a.href = 'pages/explica.html#' + e.slug;
        a.innerHTML = `<img loading="lazy" data-reveal-img class="cover" src="${e.image}" alt="${e.title}">
          <div class="p"><h3>${e.title}</h3><p>${e.summary}</p></div>`;
        explicaGrid.appendChild(a);
      });
    }
  }catch(err){ console.warn('Falha ao carregar conteúdo dinâmico', err); }
}
renderHomepage().then(initDynamicDecks).catch(initDynamicDecks);

// ===== Notícias page: list + search =====
async function renderNewsPage(){
  const list = document.getElementById('newsList');
  if(!list) return;
  const data = await fetchJSON('../assets/data/news.json');
  const q = document.getElementById('searchNews');
  function draw(items){
    list.innerHTML = '';
    items.forEach((n,i)=>{
      const a = document.createElement('a');
      a.className = 'card reveal delay-' + ((i%3)+1);
      a.href = n.url;
      a.innerHTML = `<img loading="lazy" data-reveal-img class="cover" src="${n.image}" alt="${n.title}">
        <div class="p"><span class="chip">${n.tag||''}</span><h3>${n.title}</h3><p>${n.summary}</p></div>`;
      list.appendChild(a);
    });
  }
  draw(data);
  q.addEventListener('input', ()=>{
    const term = q.value.toLowerCase();
    const filtered = data.filter(n => (n.title+n.summary+(n.tag||'')).toLowerCase().includes(term));
    draw(filtered);
  });
}
renderNewsPage();

// ===== Explica page: list + modal quick view =====
async function renderExplicaPage(){
  const list = document.getElementById('explicaList');
  if(!list) return;
  const data = await fetchJSON('../assets/data/explica.json');
  const modal = document.getElementById('modal');
  const modalBody = document.getElementById('modalBody');
  const closeModal = document.getElementById('closeModal');
  function openModal(item){
    modalBody.innerHTML = `<h2>${item.title}</h2><p>${item.content}</p>`;
    modal.style.display = 'block';
  }
  closeModal?.addEventListener('click', ()=> modal.style.display='none');
  data.forEach((e,i)=>{
    const a = document.createElement('a');
    a.className = 'card reveal delay-' + ((i%3)+1);
    a.href = '#' + e.slug;
    a.addEventListener('click', (ev)=>{ ev.preventDefault(); openModal(e); });
    a.innerHTML = `<img loading="lazy" data-reveal-img class="cover" src="${e.image}" alt="${e.title}">
      <div class="p"><h3>${e.title}</h3><p>${e.summary}</p></div>`;
    list.appendChild(a);
  });
}
renderExplicaPage();

// ===== Back to top button =====
(function(){
  const btn = document.getElementById('backToTop');
  if(!btn) return;
  window.addEventListener('scroll', ()=>{
    if((window.scrollY||0) > 400) btn.classList.add('show'); else btn.classList.remove('show');
  }, {passive:true});
  btn.addEventListener('click', ()=> window.scrollTo({top:0, behavior:'smooth'}));
})();

// ===== Global search in header =====
(function(){
  const q = document.getElementById('q');
  if(!q) return;
  q.addEventListener('keydown', (e)=>{
    if(e.key === 'Enter'){
      const term = q.value.trim().toLowerCase();
      if(term) location.href = 'pages/noticias.html#buscar=' + encodeURIComponent(term);
    }
  });
})();


// ===== Reveal-on-scroll & lazy fade for images =====
(function(){
  const io = new IntersectionObserver((entries)=>{
    for(const e of entries){
      if(e.isIntersecting){
        e.target.classList.add('revealed');
        io.unobserve(e.target);
      }
    }
  }, {threshold:.12});
  document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

  // images
  const imgs = document.querySelectorAll('img[data-reveal-img]');
  imgs.forEach(img=>{
    if(img.complete){ img.classList.add('ready'); }
    else{
      img.addEventListener('load', ()=> img.classList.add('ready'));
      img.addEventListener('error', ()=> img.classList.add('ready'));
    }
  });
})();

// ===== Nav shrink on scroll =====
(function(){
  const header = document.querySelector('.site-header');
  let last = 0;
  window.addEventListener('scroll', ()=>{
    const y = window.scrollY || document.documentElement.scrollTop;
    if(y>10 && !header.classList.contains('scrolled')) header.classList.add('scrolled');
    else if(y<=10 && header.classList.contains('scrolled')) header.classList.remove('scrolled');
    last = y;
  }, {passive:true});
})();

// ===== Banner parallax (subtle) =====
(function(){
  const txt = document.querySelector('.banner .banner-text');
  if(!txt) return;
  window.addEventListener('scroll', ()=>{
    const y = Math.min(1, (window.scrollY||0)/300);
    txt.style.transform = `translateY(${y*14}px)`;
  }, {passive:true});
})();

// ===== Splash with local MP4 (from repo path) =====
(function(){
  const splash = document.getElementById('splash');
  if(!splash) return;
  const v = document.getElementById('splashVideo');
  const safeHide = (ms=300)=>{
    setTimeout(()=>{
      splash.classList.add('fade-out');
      setTimeout(()=> splash.remove(), 900);
    }, ms);
  };
  if(v){
    // play, then hide when ended; hard timeout fallback
    v.addEventListener('ended', ()=> safeHide(50));
    v.addEventListener('error', ()=> safeHide(100));
    // some browsers block autoplay; try play()
    const tryPlay = v.play && v.play();
    if(tryPlay && typeof tryPlay.catch === 'function'){
      tryPlay.catch(()=> safeHide(800)); // if blocked, hide quickly
    }
    // safety timeout
    setTimeout(()=> safeHide(800), 8000);
  }else{
    safeHide(200);
  }
})();



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


// ===== Live regional news loader (G1 Vale do Paraíba) =====
(async function(){
  const grid = document.getElementById('newsGrid');
  if(!grid || !window.SENTINELA_FEEDS) return;
  const { rss2json, fallbackLinks } = window.SENTINELA_FEEDS;
  try{
    const resp = await fetch(rss2json, {cache:'no-store'});
    if(!resp.ok) throw new Error('HTTP ' + resp.status);
    const data = await resp.json();
    const items = (data.items||[]).slice(0,6);
    if(items.length){
      grid.innerHTML = '';
      items.forEach((item, i)=>{
        const a = document.createElement('a');
        a.className = 'card reveal delay-' + ((i%3)+1);
        a.href = item.link; a.target = '_blank'; a.rel = 'noopener';
        const img = (item.thumbnail || (item.enclosure&&item.enclosure.link) || 'https://picsum.photos/seed/vanguarda'+i+'/1200/700');
        a.innerHTML = `<img loading="lazy" data-reveal-img class="cover" src="${img}" alt="${item.title}">
          <div class="p"><span class="chip">G1 Vale</span><h3>${item.title}</h3>
          <p>${(item.description||'').replace(/<[^>]+>/g,'').slice(0,140)}...</p></div>`;
        grid.appendChild(a);
      });
      return;
    }
    throw new Error('Sem itens no feed');
  }catch(e){
    console.warn('Feed regional indisponível, usando fallback', e);
    grid.innerHTML = '';
    fallbackLinks.forEach((l, i)=>{
      const a = document.createElement('a');
      a.className = 'card reveal delay-' + (i+1);
      a.href = l.url; a.target = '_blank'; a.rel = 'noopener';
      a.innerHTML = `<div class="p"><h3>${l.title}</h3><p>Abrir em nova aba</p></div>`;
      grid.appendChild(a);
    });
  }
})();
