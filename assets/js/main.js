
// ===== Basic UI: reveal, lazy, header shrink, burger, back-to-top =====
document.addEventListener('DOMContentLoaded', ()=>{
  // reveal
  const io = new IntersectionObserver(entries=>{
    for(const e of entries){ if(e.isIntersecting){ e.target.classList.add('revealed'); io.unobserve(e.target);} }
  }, {threshold:.12});
  document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
  // lazy fade
  document.querySelectorAll('img[data-reveal-img]').forEach(img=>{
    if(img.complete) img.classList.add('ready');
    else img.addEventListener('load', ()=> img.classList.add('ready'));
  });
  // header shrink
  const header=document.querySelector('.site-header');
  window.addEventListener('scroll', ()=>{
    if((window.scrollY||0)>10) header && header.classList && header.classList.add('scrolled'); else header && header.classList && header.classList.remove('scrolled');
  }, {passive:true});
  // burger
  const nav=document.querySelector('.nav'), burger=document.querySelector('.burger');
  burger?.addEventListener('click', ()=> nav.classList.toggle('open'));
  // back to top
  const topBtn=document.getElementById('backToTop');
if(topBtn){
  window.addEventListener('scroll', ()=>{ if((window.scrollY||0)>400) topBtn.classList.add('show'); else topBtn.classList.remove('show'); }, {passive:true});
  if(topBtn){ topBtn.addEventListener('click', ()=> window.scrollTo({top:0,behavior:'smooth'})); }
});

// ===== Splash GIF control =====
(function(){
  const splash=document.getElementById('splash'); const img=document.getElementById('splashGif'); if(!splash) return; if(img && !img.src) { img.src = encodeURI('assets/img/animação.gif'); }
  const hide=()=>{ splash.classList.add('fade-out'); setTimeout(()=> splash.remove(), 800); };
  if(img){ img.addEventListener('load', ()=> setTimeout(hide, 6000), {once:true}); img.addEventListener('error', ()=> setTimeout(hide, 500), {once:true}); }
  setTimeout(hide, 9000);
})();

// ===== Carousel helpers =====
function setupCarousel(trackId, interval=4500){
  const track=document.getElementById(trackId);
  if(!track) return;
  const prev=document.querySelector(`.car-btn.prev[data-for="${trackId}"]`);
  const next=document.querySelector(`.car-btn.next[data-for="${trackId}"]`);
  function cardW(){ const first=track.querySelector('.card'); try{ return first ? first.getBoundingClientRect().width + 18 : 320; }catch(e){ return 320; } }
  prev?.addEventListener('click', ()=> track.scrollBy({left:-cardW(),behavior:'smooth'}));
  next?.addEventListener('click', ()=> track.scrollBy({left: cardW(),behavior:'smooth'}));
  setInterval(()=>{
    track.scrollBy({left: cardW(), behavior:'smooth'});
    if(track.scrollLeft + track.clientWidth >= track.scrollWidth - cardW()){ setTimeout(()=> track.scrollTo({left:0,behavior:'smooth'}), 600); }
  }, interval);
}
function initCarousels(){ setupCarousel('newsGrid', 4500); setupCarousel('explicaGrid', 5000); }

// ===== Seeds (home) and Explica/Notícias pages =====
async function fetchJSON(p){ const r=await fetch(p,{cache:'no-store'}); return r.json(); }

async function renderHomepage(){
  const newsGrid=document.getElementById('newsGrid');
  const explicaGrid=document.getElementById('explicaGrid');
  try{
    const [news, exp]=await Promise.all([fetchJSON('assets/data/news.json'), fetchJSON('assets/data/explica.json')]);
    if(newsGrid){
      // remove skeletons
      newsGrid.innerHTML='';
      news.slice(0,6).forEach((n)=>{
        const a=document.createElement('a'); a.className='card reveal'; a.href = (n && n.url) ? n.url : '#';
        a.innerHTML=`<img loading="lazy" data-reveal-img class="cover" src="${n.image}" alt="${n.title}"><div class="p"><span class="chip">${n.tag||''}</span><h3>${n.title}</h3><p>${n.summary}</p></div>`;
        newsGrid.appendChild(a);
      });
    }
    if(explicaGrid){
      explicaGrid.innerHTML='';
      exp.slice(0,6).forEach((e)=>{
        const a=document.createElement('a'); a.className='card reveal'; a.href='pages/explica.html#'+e.slug;
        a.innerHTML=`<img loading="lazy" data-reveal-img class="cover" src="${e.image}" alt="${e.title}"><div class="p"><h3>${e.title}</h3><p>${e.summary}</p></div>`;
        explicaGrid.appendChild(a);
      });
    }
  }catch(e){ console.warn('Falha ao carregar seeds', e); }
}
renderHomepage().then(()=>{ initCarousels(); }).catch(()=>{ initCarousels(); });

// ===== Multi-source regional news loader =====
(async function(){
  const grid=document.getElementById('newsGrid'); if(!grid || !window.SENTINELA_FEEDS) return;
  const {sources, fallbackLinks}=window.SENTINELA_FEEDS;
  function render(items){
    grid.innerHTML='';
    items.slice(0,12).forEach((it,i)=>{
      const a=document.createElement('a'); a.className='card reveal'; a.target='_blank'; a.rel='noopener'; a.href = it.link || '#';
      const img = (it.image && it.image !== 'undefined') ? it.image : ('https://picsum.photos/seed/vale'+i+'/1200/700');
      a.innerHTML=`<img loading="lazy" data-reveal-img class="cover" src="${img}" alt="${it.title}"><div class="p"><span class="chip">${it.tag||'Regional'}</span><h3>${it.title}</h3><p>${(it.description||'').slice(0,140)}...</p></div>`;
      grid.appendChild(a);
    });
  }
  // 0) Google News via Jina (XML)
  try{
    const t=await fetch(sources.google_news,{cache:'no-store'}).then(r=>r.text());
    const items=[]; const re=/<item>([\s\S]*?)<\/item>/g; let m;
    while((m=re.exec(t))){ const b=m[1];
      const get=tag=>{const rr=new RegExp(`<${tag}>([\\s\\S]*?)<\/${tag}>`,'i'); const mm=rr.exec(b); return mm?mm[1].replace(/<!\[CDATA\[|\]\]>/g,'').trim():''};
      const title=get('title'), link=get('link'); const desc=get('description').replace(/<[^>]+>/g,'');
      if(title&&link) items.push({title,link,image:'',description:desc,tag:'Google News'});
    }
    if(items.length){ render(items); return; } throw new Error('empty google');
  }catch(e){ console.warn('GoogleNews falhou', e); }

// 1) rss2json (G1)
  try{
    const r=await fetch(sources.g1_rss2json,{cache:'no-store'}); if(!r.ok) throw new Error('rss2json '+r.status);
    const d=await r.json(); const items=(d.items||[]).map(x=>({title:x.title,link:x.link,image:x.thumbnail||(x.enclosure&&(x.enclosure.link||x.enclosure.url)),description:(x.description||'').replace(/<[^>]+>/g,''),tag:'G1 Vale'}));
    if(items.length){ render(items); return; } throw new Error('empty');
  }catch(e){ console.warn('rss2json falhou', e); }
  // 2) G1 XML via Jina
  try{
    const t=await fetch(sources.g1_xml,{cache:'no-store'}).then(r=>r.text());
    const items=[]; const re=/<item>([\s\S]*?)<\/item>/g; let m;
    while((m=re.exec(t))){ const b=m[1]; const get=tag=>{const rr=new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`,'i'); const mm=rr.exec(b); return mm?mm[1].replace(/<!\[CDATA\[|\]\]>/g,'').trim():''};
      const title=get('title'), link=get('link'); let image=''; const mt=b.match(/<media:thumbnail[^>]*url="([^"]+)"/i); if(mt) image=mt[1]; const me=b.match(/<enclosure[^>]*url="([^"]+)"/i); if(!image && me) image=me[1];
      const desc=get('description').replace(/<[^>]+>/g,''); if(title&&link) items.push({title,link,image,description:desc,tag:'G1 Vale'}); }
    if(items.length){ render(items); return; } throw new Error('empty');
  }catch(e){ console.warn('G1 XML falhou', e); }
  // 3) G1 HTML via Jina
  try{
    const h=await fetch(sources.g1_html,{cache:'no-store'}).then(r=>r.text());
    const items=[]; const re=/<a[^>]+href="(https?:\/\/g1\.globo\.com[^"]+)"[^>]*>(.*?)<\/a>/gi; let m; const seen=new Set();
    while((m=re.exec(h))){ const link=m[1]; const text=m[2].replace(/<[^>]+>/g,'').trim(); if(text.length<28) continue; const key=link+'|'+text; if(seen.has(key)) continue; seen.add(key); items.push({title:text,link,image:'',description:'',tag:'G1 Vale'}); if(items.length>=12) break; }
    if(items.length){ render(items); return; } throw new Error('empty');
  }catch(e){ console.warn('G1 HTML falhou', e); }
  // 4) O Vale
  try{
    const h=await fetch(sources.ovale_html,{cache:'no-store'}).then(r=>r.text());
    const items=[]; const re=/<a[^>]+href="(https?:\/\/www\.ovale\.com\.br[^"]+)"[^>]*>(.*?)<\/a>/gi; let m; const seen=new Set();
    while((m=re.exec(h))){ const link=m[1]; const text=m[2].replace(/<[^>]+>/g,'').trim(); if(text.length<28) continue; const key=link+'|'+text; if(seen.has(key)) continue; seen.add(key); items.push({title:text,link,image:'',description:'',tag:'O Vale'}); if(items.length>=12) break; }
    if(items.length){ render(items); return; } throw new Error('empty');
  }catch(e){ console.warn('OVale falhou', e); }
  // 5) Vale360
  try{
    const h=await fetch(sources.vale360_html,{cache:'no-store'}).then(r=>r.text());
    const items=[]; const re=/<a[^>]+href="(https?:\/\/www\.vale360\.com\.br[^"]+)"[^>]*>(.*?)<\/a>/gi; let m; const seen=new Set();
    while((m=re.exec(h))){ const link=m[1]; const text=m[2].replace(/<[^>]+>/g,'').trim(); if(text.length<28) continue; const key=link+'|'+text; if(seen.has(key)) continue; seen.add(key); items.push({title:text,link,image:'',description:'',tag:'Vale360'}); if(items.length>=12) break; }
    if(items.length){ render(items); return; } throw new Error('empty');
  }catch(e){ console.warn('Vale360 falhou', e); }
  // fallback
  grid.innerHTML='';
  fallbackLinks.forEach((l)=>{ const a=document.createElement('a'); a.className='card reveal'; a.href=l.url; a.target='_blank'; a.rel='noopener'; a.innerHTML=`<div class="p"><h3>${l.title}</h3><p>Abrir em nova aba</p></div>`; grid.appendChild(a); });
})();

// ===== Notícias page: search + list =====
(async function(){
  const list=document.getElementById('newsList'); if(!list) return;
  const data=await fetchJSON('../assets/data/news.json');
  const search=document.getElementById('searchNews');
  function draw(items){
    list.innerHTML='';
    items.forEach((n,i)=>{
      const a=document.createElement('a'); a.className='card reveal'; a.href = (n && n.url) ? n.url : '#';
      a.innerHTML=`<img loading="lazy" data-reveal-img class="cover" src="${n.image}" alt="${n.title}"><div class="p"><span class="chip">${n.tag||''}</span><h3>${n.title}</h3><p>${n.summary}</p></div>`;
      list.appendChild(a);
    });
  }
  draw(data);
  search?.addEventListener('input', ()=>{
    const term=search.value.toLowerCase();
    const filtered=data.filter(n=>(n.title+n.summary+(n.tag||'')).toLowerCase().includes(term));
    draw(filtered);
  });
})();

// ===== Explica page: list + modal =====
(async function(){
  const list=document.getElementById('explicaList'); if(!list) return;
  const data=await fetchJSON('../assets/data/explica.json');
  const modal=document.getElementById('modal');
  const modalBody=document.getElementById('modalBody');
  const close=document.getElementById('closeModal');
  function open(item){ modalBody.innerHTML=`<h2>${item.title}</h2><p>${item.content}</p>`; modal.style.display='block'; }
  close?.addEventListener('click', ()=> modal.style.display='none');
  data.forEach((e)=>{
    const a=document.createElement('a'); a.className='card reveal'; a.href='#'+e.slug; a.addEventListener('click',ev=>{ev.preventDefault(); open(e);});
    a.innerHTML=`<img loading="lazy" data-reveal-img class="cover" src="${e.image}" alt="${e.title}"><div class="p"><h3>${e.title}</h3><p>${e.summary}</p></div>`;
    list.appendChild(a);
  });
})();

// ===== Ajuda: FAQ + Calculadora LAI + Gerador LAI =====
(async function(){
  const faq=document.getElementById('faq'); if(!faq) return;
  const list=await fetchJSON('../assets/data/faqs.json');
  list.forEach(({q,a})=>{
    const item=document.createElement('div'); item.className='item';
    item.innerHTML=`<div class="q">${q}<span>+</span></div><div class="a"><p>${a}</p></div>`;
    const qEl=item.querySelector('.q'); const aEl=item.querySelector('.a');
    qEl.addEventListener('click',()=>{
      const open=item.classList.toggle('open');
      aEl.style.height = open ? aEl.scrollHeight+'px' : '0px';
      qEl.querySelector('span').textContent = open ? '−' : '+';
    });
    faq.appendChild(item);
  });

  // Prazo LAI
  const base=document.getElementById('diasBase'), prog=document.getElementById('diasProrroga'), inicio=document.getElementById('dataInicio'), btn=document.getElementById('calcPrazo'), res=document.getElementById('prazoResultado');
  btn.addEventListener('click',()=>{
    const d0 = dayjs(inicio.value || dayjs().format('YYYY-MM-DD'));
    const end = d0.add(parseInt(base.value||'20',10), 'day').add(parseInt(prog.value||'10',10), 'day');
    res.textContent = `Prazo estimado (com prorrogação): ${end.format('DD/MM/YYYY')}`;
  });

  // Gerador LAI
  const LKEY='sentinela_lai';
  const org=document.getElementById('laiOrgao'), as=document.getElementById('laiAssunto'), desc=document.getElementById('laiDescricao');
  const prevBtn=document.getElementById('laiPreview'), pdfBtn=document.getElementById('laiPDF');
  function getDoc(){
    return `À ${org.value}.\n\nAssunto: ${as.value}\n\nCom base na LAI, solicito as seguintes informações:\n${desc.value}\n\nLocal e data.\nAssinatura.`;
  }
  // autosave
  [org,as,desc].forEach(el=> el.addEventListener('input', ()=> localStorage.setItem(LKEY, JSON.stringify({org:org.value,as:as.value,desc:desc.value})) ));
  try{ const data=JSON.parse(localStorage.getItem(LKEY)||'{}'); org.value=data.org||''; as.value=data.as||''; desc.value=data.desc||''; }catch{}

  prevBtn.addEventListener('click', ()=> alert(getDoc()));
  pdfBtn.addEventListener('click', ()=>{
    const { jsPDF } = window.jspdf || {}; if(!jsPDF){ alert('PDF indisponível offline.'); return; }
    const doc=new jsPDF(); const lines=doc.splitTextToSize(getDoc(), 180); doc.text(lines, 15, 20); doc.save('pedido_lai.pdf');
  });
})();

// ===== Denúncia: validação, rascunho, preview, PDF, protocolo =====
(function(){
  const form=document.getElementById('denunciaForm'); if(!form) return;
  const K='sentinela_denuncia';
  const desc=document.getElementById('desc'), assunto=document.getElementById('assunto'), email=document.getElementById('email'), tel=document.getElementById('telefone');
  const prevBtn=document.getElementById('previewDenuncia'), pdfBtn=document.getElementById('pdfDenuncia'), saveBtn=document.getElementById('salvarRascunho'), protBtn=document.getElementById('gerarProtocolo');
  const status=document.getElementById('statusDenuncia'); const modal=document.getElementById('modalDenuncia'); const close=document.getElementById('closeDenuncia'); const out=document.getElementById('conteudoPreview');

  function validate(){
    if(!desc.value.trim()){ status.textContent='Descreva os fatos (obrigatório).'; return false; }
    status.textContent=''; return true;
  }
  function docText(){
    return `DENÚNCIA\n\nAssunto: ${assunto.value||'(não informado)'}\n\nDescrição:\n${desc.value}\n\nContato: ${email.value||'-'} / ${tel.value||'-'}`;
  }
  prevBtn.addEventListener('click', ()=>{ if(!validate()) return; out.textContent=docText(); modal.style.display='block'; });
  close?.addEventListener('click', ()=> modal.style.display='none');
  pdfBtn.addEventListener('click', ()=>{
    if(!validate()) return;
    const { jsPDF } = window.jspdf || {}; if(!jsPDF){ alert('PDF indisponível offline.'); return; }
    const doc=new jsPDF(); const lines=doc.splitTextToSize(docText(), 180); doc.text(lines, 15, 20); doc.save('denuncia.pdf');
  });
  saveBtn.addEventListener('click', ()=>{
    localStorage.setItem(K, JSON.stringify({assunto:assunto.value,desc:desc.value,email:email.value,telefone:tel.value}));
    status.textContent='Rascunho salvo localmente.';
  });
  // restore
  try{ const d=JSON.parse(localStorage.getItem(K)||'{}'); assunto.value=d.assunto||''; desc.value=d.desc||''; email.value=d.email||''; tel.value=d.telefone||''; }catch{}
  protBtn.addEventListener('click', ()=>{
    const proto = 'SNT-' + Date.now().toString(36).toUpperCase();
    status.textContent = 'Protocolo gerado: ' + proto;
  });
})();
