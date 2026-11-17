/* Linn Selekt DSM promotion — The Sound Store */
(function(){
const $=id=>document.getElementById(id);
const R=window.SITE.routes;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let cur='NZD';
const money=(n,c)=>{c=c||cur;return (c==='NZD'?'NZ$':'$')+Math.round(n).toLocaleString('en-AU')};
const route=(hub,card)=>R.find(r=>r.chassis===hub&&r.card===card);
const DACN={'Standard DAC':'Standard DAC','Katalyst DAC':'Katalyst DAC','Organik Stereo DAC':'Organik DAC','Dual Mono Organik':'Dual Mono Organik'};
const HUBN={'Selekt Classic':'Selekt DSM Classic','Selekt Edition Hub':'Selekt DSM Edition'};
const USEN={'Line Out':'Streamer','Power Out':'Integrated amplifier'};
const promo=s=>s.mono?s.dsm[cur]+s.upg[cur]:s.pay[cur];

/* NZD only */
function setCur(c){cur=c;renderTokens();renderBuild()}
cur='NZD';

/* ---------- offer ladder ---------- */
(function(){
  const L=[['Standard DAC','Katalyst DAC'],['Katalyst DAC','Organik DAC'],['Stereo Organik DAC','Dual Mono Organik*']];
  $('ladder').innerHTML=L.map((l,i)=>`<div class="rung r d${i+1}"><div class="n">0${i+1}</div><div class="buy">You buy</div><div class="from">${l[0]}</div><div class="arrow">&#8595;</div><div class="buy">You receive</div><div class="to"><em>${l[1]}</em></div>
    ${i===2?'<div class="foot">*Streamer (Line Out) systems only. You pay the difference to change the stereo Line Out cartridge for two Mono Line Out cartridges.</div>':''}</div>`).join('');
})();

function renderTokens(){
  const all=R.flatMap(r=>r.steps.map(s=>s.save[cur]));
  document.querySelectorAll('[data-max]').forEach(e=>e.textContent=money(Math.max(...all)));
  document.querySelectorAll('[data-from]').forEach(e=>{const h=e.dataset.from;const card=st.use||'Line Out';e.textContent=money(route(h,card).steps[0].pay[cur])});
}

/* ---------- builder ---------- */
const st={step:0,use:null,hub:null};
const panels=[$('p0'),$('p1'),$('p2')];
function go(n){
  if(n===1&&!st.use)return; if(n===2&&!(st.use&&st.hub))return;
  st.step=n;panels.forEach((p,i)=>{p.hidden=i!==n;if(i===n)p.classList.add('r')});
  renderBuild();
}
document.querySelectorAll('[data-use]').forEach(b=>b.onclick=()=>{st.use=b.dataset.use;go(1);scrollToBuild()});
document.querySelectorAll('[data-hub]').forEach(b=>b.onclick=()=>{st.hub=b.dataset.hub;go(2);scrollToBuild()});
document.querySelectorAll('#stepper button').forEach(b=>b.onclick=()=>go(+b.dataset.go));
$('restart').onclick=()=>{st.use=null;st.hub=null;go(0);scrollToBuild()};
function scrollToBuild(){const t=$('build'),deck=$('deck');if(deck.scrollTop>t.offsetTop+40||deck.scrollTop<t.offsetTop-40)deck.scrollTo({top:t.offsetTop,behavior:'smooth'})}

function renderBuild(){
  document.querySelectorAll('[data-use]').forEach(b=>b.classList.toggle('sel',b.dataset.use===st.use));
  document.querySelectorAll('[data-hub]').forEach(b=>b.classList.toggle('sel',b.dataset.hub===st.hub));
  document.querySelectorAll('[data-from]').forEach(e=>{e.textContent=money(route(e.dataset.from,st.use||'Line Out').steps[0].pay[cur])});
  document.querySelectorAll('#stepper button').forEach((b,i)=>{
    b.classList.toggle('on',i===st.step);
    b.classList.toggle('done',i<st.step||(i===0&&st.use&&st.step!==0)||(i===1&&st.hub&&st.step!==1));
    b.disabled=(i===1&&!st.use)||(i===2&&!(st.use&&st.hub));
    if(i===st.step)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');
  });
  $('sv0').textContent=st.use?'· '+USEN[st.use]:'';
  $('sv1').textContent=st.hub?'· '+(st.hub==='Selekt Classic'?'Classic':'Edition'):'';
  if(!(st.use&&st.hub))return;
  const r=route(st.hub,st.use);
  $('resTitle').innerHTML=`Your ${esc(HUBN[st.hub])} <em>upgrade options.</em>`;
  $('resSub').textContent=`${st.use==='Line Out'?'As a streamer into your own amplifier':'As an integrated amplifier with streaming'}. Pick the DAC you’d buy, and here’s the next level you’ll receive, at its promotion price.`;
  const res=$('res');res.classList.toggle('two',r.steps.length===2);
  res.innerHTML=r.steps.map((s,i)=>`<div class="rcard"><div class="n">Option 0${i+1}</div>
    <div class="buy">You buy</div><div class="from">${DACN[s.from]}</div>
    <div class="buy">You receive</div><div class="to"><em>${DACN[s.to]}</em></div>
    <div class="price"><small>Promotion price</small><b>${money(promo(s))}</b><div class="norm">Normally ${money(s.get[cur])}</div></div>
    ${s.mono?`<div class="note">Includes ${money(s.upg[cur])} to change the stereo Line Out cartridge for two Mono Line Out cartridges.</div>`:''}</div>`).join('');
  $('resFine').textContent=`Prices are New Zealand recommended retail in NZD, including GST, for a complete ${HUBN[st.hub]} with ${st.use==='Line Out'?'a stereo Line Out':'a stereo Power Out'} cartridge and the DAC shown. The normal price is what the system you receive usually costs. Terms and Conditions apply, please speak to The Sound Store for more information.`;
}

/* ---------- navigation ---------- */
const deck=$('deck'), slides=[...document.querySelectorAll('.slide')], prog=$('progress'), bar=$('bar');
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('in')}),{threshold:.08});
slides.forEach(s=>io.observe(s));
function onScroll(){
  const mid=deck.scrollTop+window.innerHeight*.35;let c=0;
  slides.forEach((s,i)=>{if(s.offsetTop<=mid)c=i});
  const s=slides[c];
  document.body.classList.toggle('on-paper',s.classList.contains('paper'));
  bar.classList.toggle('solid',deck.scrollTop>40);
  document.querySelectorAll('.bar nav a').forEach(a=>a.classList.toggle('active',a.dataset.sec===s.id));
  prog.style.width=Math.min(100,(deck.scrollTop/(deck.scrollHeight-deck.clientHeight||1))*100)+'%';
}
deck.addEventListener('scroll',onScroll,{passive:true});
document.addEventListener('click',e=>{const a=e.target.closest('a[href^="#"]');if(!a)return;const t=document.querySelector(a.getAttribute('href'));if(t){e.preventDefault();deck.scrollTo({top:t.offsetTop,behavior:'smooth'})}});

setCur(cur);go(0);onScroll();
})();
