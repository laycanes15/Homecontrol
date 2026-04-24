function fechaHoy(){const n=new Date();return n.getFullYear()+'-'+String(n.getMonth()+1).padStart(2,'0')+'-'+String(n.getDate()).padStart(2,'0');}

// ════════════════════════════════════════════════════════
// MULTIUSUARIO — datos separados por usuario
// ════════════════════════════════════════════════════════
let _USUARIO = '';


function guardarListaUsuarios(arr){
  try{ localStorage.setItem('ghv4_usuarios', JSON.stringify(arr)); }catch(e){}
}

function mostrarSelectorUsuario(onSelect){
  const usuarios = getUsuarios();
  let modal = document.getElementById('user-modal');
  if(modal) modal.remove();
  modal = document.createElement('div');
  modal.id = 'user-modal';
  modal.style.cssText = 'position:fixed;inset:0;z-index:9999;background:#0A0E1A;display:flex;align-items:center;justify-content:center;padding:20px';

  const listHTML = usuarios.length ? `
    <div style="margin-bottom:14px">
      <div style="font-size:11px;color:#7B8BA0;font-weight:700;text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">Seleccionar usuario</div>
      ${usuarios.map(u=>`<button class="user-sel-btn" data-user="${u}"
        style="width:100%;background:#1C2333;border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:13px 16px;color:#E8ECF4;font-size:14px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:12px;text-align:left;margin-bottom:8px">
        <span style="font-size:24px">👤</span><span>${u}</span></button>`).join('')}
      <hr style="border:none;border-top:1px solid rgba(255,255,255,.08);margin:12px 0"/>
    </div>` :
    `<div style="text-align:center;margin-bottom:20px">
      <div style="font-size:48px;margin-bottom:8px">🏠</div>
      <div style="font-size:18px;font-weight:800;color:#fff;margin-bottom:4px">Gestor del Hogar</div>
      <div style="font-size:12px;color:#7B8BA0">Valledupar, Cesar</div>
    </div>`;

  modal.innerHTML = `<div style="background:#111827;border-radius:20px;padding:24px;max-width:360px;width:100%;border:1px solid rgba(255,255,255,.08)">
    <div style="text-align:center;margin-bottom:18px">
      <div style="font-size:32px;margin-bottom:6px">🏠</div>
      <div style="font-size:17px;font-weight:800;color:#fff">Gestor del Hogar</div>
      <div style="font-size:11px;color:#7B8BA0;margin-top:2px">Valledupar · Cesar</div>
    </div>
    ${listHTML}
    <div style="font-size:11px;color:#7B8BA0;font-weight:700;text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">${usuarios.length?'Nuevo usuario':'Crear usuario'}</div>
    <div style="display:flex;gap:8px">
      <input id="nuevo-usuario-inp" placeholder="Tu nombre..."
        style="flex:1;background:#1C2333;border:1px solid rgba(255,255,255,.15);color:#E8ECF4;border-radius:10px;padding:11px 14px;font-size:13px;outline:none"/>
      <button id="crear-usuario-btn"
        style="background:linear-gradient(90deg,#1565C0,#42A5F5);color:#fff;border:none;border-radius:10px;padding:11px 16px;font-size:13px;font-weight:700;cursor:pointer;white-space:nowrap">
        ➕ Crear
      </button>
    </div>
  </div>`;

  document.body.appendChild(modal);

  modal.querySelectorAll('.user-sel-btn').forEach(btn=>{
    btn.onclick = ()=>{ modal.remove(); onSelect(btn.dataset.user); };
  });
  document.getElementById('crear-usuario-btn').onclick = ()=>{
    const inp = document.getElementById('nuevo-usuario-inp');
    const nombre = (inp.value||'').trim();
    if(nombre.length < 2){ inp.style.borderColor='#EF4444'; inp.focus(); return; }
    const lista = getUsuarios();
    if(!lista.includes(nombre)){ lista.push(nombre); guardarListaUsuarios(lista); }
    modal.remove();
    onSelect(nombre);
  };
  document.getElementById('nuevo-usuario-inp').onkeydown = e=>{
    if(e.key==='Enter') document.getElementById('crear-usuario-btn').click();
  };
  setTimeout(()=>document.getElementById('nuevo-usuario-inp')?.focus(), 150);
}

function _setUsuario(nombre){
  _USUARIO = nombre;
  try{ localStorage.setItem('ghv4_ultimo_usuario', nombre); }catch(e){}
  const city = document.querySelector('.sidebar-city');
  if(city) city.innerHTML = '👤 '+nombre+' &nbsp;·&nbsp; Valledupar 🇨🇴';
  const topbarChip=document.getElementById('topbar-usuario');
  if(topbarChip)topbarChip.textContent='👤 '+nombre;
  const hdr = document.querySelector('.sidebar-header');
  if(hdr && !document.getElementById('btn-cambiar-usuario')){
    const btn = document.createElement('button');
    btn.id = 'btn-cambiar-usuario';
    btn.textContent = '👥 Cambiar usuario';
    btn.style.cssText = 'background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2);color:rgba(255,255,255,.8);border-radius:20px;padding:4px 12px;font-size:10px;cursor:pointer;margin-top:8px;width:100%';
    btn.onclick = ()=>{ closeDrawer(); mostrarSelectorUsuario(u=>{ _setUsuario(u); save(); renderAll(); }); };
    hdr.appendChild(btn);
  }
}

const KEYS=['mercado','gastos','servicios','ingresos','presupuesto','mantenimiento',
            'ocio','mascotas','centrocomercial','tarjetas','gastosTarjeta','movilidad',
            'deudas','fna','fnaCredito','enseres','prestamos','recordatorios'];

const D={mercado:[],gastos:[],servicios:[],ingresos:[],presupuesto:[],mantenimiento:[],
  ocio:[],mascotas:[],centrocomercial:[],tarjetas:[],gastosTarjeta:[],movilidad:[],
  deudas:[],fna:[],
  fnaCredito:[{nom:'',num:'',total:0,cuota:0,inicio:'',vctoDia:0,tasa:0,plazo:0}],
  enseres:[],prestamos:[],recordatorios:[]};

const Q={q1:0,q2:0,q1neto:0,q2neto:0,montoTotal:0,q1guardada:false,q2guardada:false};

let _MES='';
function getMes(){ return _MES; }
function mesActual(){ return _MES; }
function mesKey(){const u=_USUARIO?_USUARIO.split(' ').join('_'):'default';return 'ghv4_u_'+u+'_'+_MES.split(' ').join('_');}

function save(){
  if(!_MES) return;
  const snap={Q:{...Q},D:{}};
  KEYS.forEach(k=>{ snap.D[k]=D[k]; });
  try{ localStorage.setItem(mesKey(),JSON.stringify(snap)); }catch(e){}
  try{
    const lista=JSON.parse(localStorage.getItem('ghv4_lista')||'[]');
    if(!lista.includes(_MES)){lista.push(_MES);localStorage.setItem('ghv4_lista',JSON.stringify(lista));}
  }catch(e){}
}

function loadMes(mes){
  _MES=(mes||'').replace(/\s*✓\s*/g,'').trim();
  KEYS.forEach(k=>{
    D[k]=(k==='fnaCredito')?[{nom:'',num:'',total:0,cuota:0,inicio:'',vctoDia:0,tasa:0,plazo:0}]:[];
  });
  Q.q1=0;Q.q2=0;Q.q1neto=0;Q.q2neto=0;Q.montoTotal=0;Q.q1guardada=false;Q.q2guardada=false;
  const raw=localStorage.getItem('ghv4_'+_MES.replace(/ /g,'_'));
  if(!raw)return;
  try{
    const snap=JSON.parse(raw);
    if(snap.D)KEYS.forEach(k=>{if(Array.isArray(snap.D[k]))D[k]=snap.D[k];});
    if(snap.Q)Object.assign(Q,snap.Q);
  }catch(e){}
}

function load(){ loadMes(mesActual()); }

// ── FORMAT ─────────────────────────────────────
const fmt=n=>'$'+Math.round(n).toLocaleString('es-CO');
const ff=f=>f?f.split('-').reverse().join('/'):'—';
const GCOLS=['#4f8ef7','#34c98f','#f5a623','#a78bfa','#f472b6','#22d3b0','#f05252','#e67e22','#2ecc71','#9b59b6','#3498db'];

// ── TOAST ──────────────────────────────────────
function toast(msg){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2200);}

// ── NAVIGATION ─────────────────────────────────
function nav(sec,el){
  document.querySelectorAll('.sec').forEach(s=>s.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
  const secEl=document.getElementById('sec-'+sec);
  if(secEl) secEl.classList.add('active');
  if(el) el.classList.add('active');
  const cont=document.getElementById('content');
  if(cont) cont.scrollTop=0;
  const T={inicio:'🏠 Inicio',mercado:'🛒 Lista de Mercado',gastos:'💸 Gastos',
    servicios:'💡 Servicios Públicos',ingresos:'💰 Ingresos',tarjetas:'💳 Tarjetas',
    deudas:'🔴 Deudas',fna:'🏦 FNA',mantenimiento:'🔧 Mantenimiento',
    enseres:'🪑 Enseres del Hogar',ocio:'🎉 Ocio',centrocomercial:'🏪 Centro Comercial',
    recordatorios:'🔔 Recordatorios',movilidad:'🚗 Movilidad',
    mascotas:'🐾 Mascotas',precios:'🏷️ Precios del Mercado',presupuesto:'📊 Presupuesto'};
  const tb=document.getElementById('topbar-title');if(tb)tb.textContent=T[sec]||sec;
  const dt=document.getElementById('desktop-title');if(dt)dt.textContent=T[sec]||sec;
  closeDrawer();
}

// openSub removed - sections are now independent

// ── QUINCENAS + DESCUENTOS ─────────────────────
// Colombia 2024: Salud 4%, Pensión 4%, Total 8%
const SALUD=0.04, PENSION=0.04;

function calcDesc(bruto){
  const salud=Math.round(bruto*SALUD);
  const pension=Math.round(bruto*PENSION);
  const neto=bruto-salud-pension;
  return{salud,pension,neto};
}

function renderDesc(n,bruto){
  const{salud,pension,neto}=calcDesc(bruto);
  document.getElementById('desc'+n).innerHTML=`
    <div class="desc-row"><span style="color:var(--muted)">Salud (4%)</span><span style="color:var(--red)">-${fmt(salud)}</span></div>
    <div class="desc-row"><span style="color:var(--muted)">Pensión (4%)</span><span style="color:var(--red)">-${fmt(pension)}</span></div>
    <div class="desc-row"><span>Neto a recibir</span><span>${fmt(neto)}</span></div>`;
}

function initQ(){
  const hoy=new Date();
  const dia=hoy.getDate();
  const esQ1=dia>=1&&dia<=15;   // días 1-15 → Q1 activa
  const esQ2=dia>=16;            // días 16-31 → Q2 activa

  // Estado Q1
  const q1Saved=Q.q1guardada||false;
  const q1Activa=esQ1&&!q1Saved;
  document.getElementById('q1i').disabled=!q1Activa;
  document.getElementById('q1b').disabled=!q1Activa;
  if(q1Saved){
    document.getElementById('q1l').textContent='✅ Guardada';
    document.getElementById('q1l').className='qlk lo';
  } else if(esQ1){
    document.getElementById('q1l').textContent='🔓 Activa';
    document.getElementById('q1l').className='qlk lo';
  } else {
    document.getElementById('q1l').textContent='🔒 Bloqueada';
    document.getElementById('q1l').className='qlk lc';
  }

  // Estado Q2
  const q2Saved=Q.q2guardada||false;
  const q2Activa=esQ2&&!q2Saved;
  document.getElementById('q2i').disabled=!q2Activa;
  document.getElementById('q2b').disabled=!q2Activa;
  if(q2Saved){
    document.getElementById('q2l').textContent='✅ Guardada';
    document.getElementById('q2l').className='qlk lo';
  } else if(esQ2){
    document.getElementById('q2l').textContent='🔓 Activa';
    document.getElementById('q2l').className='qlk lo';
  } else {
    document.getElementById('q2l').textContent='🔒 Bloqueada (desde día 16)';
    document.getElementById('q2l').className='qlk lc';
  }

  // Restaurar valores
  if(Q.q1>0){document.getElementById('q1i').value=Q.q1;renderDesc(1,Q.q1);document.getElementById('q1v').textContent=fmt(Q.q1neto);}
  if(Q.q2>0){document.getElementById('q2i').value=Q.q2;renderDesc(2,Q.q2);document.getElementById('q2v').textContent=fmt(Q.q2neto);}
  if(Q.montoTotal>0){document.getElementById('monto-total').value=Q.montoTotal;dividirQuincenas(Q.montoTotal);}
}

function gQ(n){
  const dia=new Date().getDate();
  const esQ1=dia>=1&&dia<=15;
  const esQ2=dia>=16;
  if(n===1&&!esQ1){toast('⚠️ Quincena 1 solo se puede guardar entre el día 1 y 15');return;}
  if(n===2&&!esQ2){toast('⚠️ Quincena 2 solo se puede guardar desde el día 16');return;}
  const v=parseFloat(document.getElementById('q'+n+'i').value)||0;
  if(!v){toast('⚠️ Ingresa un monto');return;}
  const{neto}=calcDesc(v);
  Q['q'+n]=v; Q['q'+n+'neto']=neto; Q['q'+n+'guardada']=true;
  document.getElementById('q'+n+'v').textContent=fmt(neto);
  document.getElementById('q'+n+'i').disabled=true;
  document.getElementById('q'+n+'b').disabled=true;
  document.getElementById('q'+n+'l').textContent='✅ Guardada';
  document.getElementById('q'+n+'l').className='qlk lo';
  renderDesc(n,v);
  save();upd();toast('✅ Quincena '+n+' guardada correctamente');
}

// ── MERCADO ────────────────────────────────────
function getCG(cat){
  if(/Res|Cerdo|Pollo|🥩|🍗/.test(cat))return'🥩 Carnes';
  if(/🫀|Hígado|Corazón|Bofe|Riñón|Mondongo|Librillo|Panza|Seso|Cola de res|Patas|Menudencias/.test(cat))return'🫀 Vísceras';
  if(/🐟|Bocachico|Bagre|Mojarra|Camarón|Atún|Sardina|Róbalo/.test(cat))return'🐟 Mar y Río';
  if(/🥛|🧀|🧈|🍦|🍶|🍮|Leche|Queso|Yogur|Kumis|Suero|Arequipe|Mantequilla|Margarina|Crema|🥚|Huevo/.test(cat))return'🥛 Lácteos y Huevos';
  if(/🥦|Ahuyama|Berenjena|Cebolla|Cilantro|Espinaca|Habichuela|Lechuga|Maíz|Pepino|Pimentón|Plátano|Repollo|Tomate|Yuca|Zanahoria|Ajo|Papa|Ñame|Remolacha|Acelga/.test(cat))return'🥦 Verduras';
  if(/🍎|Aguacate|Banano|Guayaba|Limón|Maracuyá|Mango|Mandarina|Melón|Mora|Naranja|Papaya|Patilla|Piña|Corozo|Níspero|Tamarindo|Coco|Guanábana|Anón/.test(cat))return'🍎 Frutas';
  if(/🌾|Arroz|Fríjol|Lenteja|Garbanzo|Arveja|Harina|Avena/.test(cat))return'🌾 Granos';
  if(/🍞|Pan|Arepa|Galleta|Pasta/.test(cat))return'🍞 Panadería';
  if(/🧃|Agua en|Jugo|Gaseosa|Café|Panela/.test(cat))return'🧃 Bebidas';
  if(/🧹|Jabón lava|Jabón azul|Jabón de coco|Jabón líquido|Cápsulas|Perlas arom|Detergente|Suavizante|Blanqueador|Desinfectante|Papel higiénico|Bolsas|Escoba|Trapero|Quitasarro/.test(cat))return'🧹 Aseo';
  if(/🌸|Ambientador|Vela arom|Incienso|Difusor|Aromatizante|Sachet/.test(cat))return'🌸 Aromatizantes';
  if(/🔋|Pilas|Foco|Bombillo|Extensión|Cinta pegante|Gancho|Bolsas zip|Papel alum|Vinipel|Guantes|Filtros de café|Mondad|Servilleta|Desechable/.test(cat))return'🔋 Accesorios';
  if(/🧴|Jabón de baño|Shampoo|Crema dental|Desodorante|Pañales|Toallas higiénicas/.test(cat))return'🧴 Higiene';
  if(/🍳|Aceite|Sal|Azúcar|Salsa|Mayonesa|Sazón|achiote/.test(cat))return'🍳 Cocina';
  return cat;
}

function addM(){
  const cat=document.getElementById('mc').value;
  const item=(document.getElementById('mi').value.trim())||cat.replace(/^[^\w\s]+\s*/,'');
  let p=parseFloat(document.getElementById('mp').value)||0;
  const q=parseInt(document.getElementById('mq').value)||1;
  const u=document.getElementById('mu').value.trim();
  const f=document.getElementById('mf').value||fechaHoy();
  if(!item){toast('⚠️ Escribe o selecciona un producto');return;}
  if(!p&&typeof cargarPrecios==='function'){
    const _ph=cargarPrecios();const _il=item.toLowerCase().split(' ')[0];
    const _pm=_ph.find(x=>x.tienda===_tiendaActiva&&x.producto.toLowerCase().includes(_il));
    if(_pm){p=_pm.precio;document.getElementById('mp').value=p;toast('💡 Precio del historial: $'+Math.round(p).toLocaleString('es-CO'));}
  }
  D.mercado.push({cat,item,precio:p,cantidad:q,unidad:u,fecha:f,nota:'',total:p*q,tienda:_tiendaActiva});
  document.getElementById('mi').value='';
  document.getElementById('mp').value='';
  document.getElementById('mu').value='';
  document.getElementById('mq').value='1';
  save();rM();upd();
  toast('✅ '+item+' → '+_tiendaActiva);
}

// ── OCR LOCAL — sin API, funciona offline ─────
// Usa Tesseract.js cargado desde CDN (solo se carga cuando se usa el escáner)
let tesseractLoaded=false;

function cargarTesseract(){
  return new Promise((ok,err)=>{
    if(window.Tesseract){ok();return;}
    const s=document.createElement('script');
    s.src='https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
    s.onload=()=>{tesseractLoaded=true;ok();};
    s.onerror=()=>err(new Error('No se pudo cargar el motor OCR'));
    document.head.appendChild(s);
  });
}

// Lista de palabras clave de productos para matching
const PRODUCTOS_KEYWORDS={
  'arroz':['arroz'],'leche':['leche'],'aceite':['aceite'],'azucar':['azúcar','azucar'],
  'sal':['sal ','sal\n'],'huevo':['huevo'],'pollo':['pollo'],'carne':['carne','res'],
  'papa':['papa'],'cebolla':['cebolla'],'tomate':['tomate'],'platano':['plátano','platano'],
  'yuca':['yuca'],'frijol':['frijol','fríjol'],'pasta':['pasta','espagueti','macarron'],
  'atun':['atún','atun'],'sardina':['sardina'],'mantequilla':['mantequilla'],
  'queso':['queso'],'yogur':['yogur'],'jamon':['jamón','jamon'],'pan':['pan '],
  'detergente':['detergente'],'jabon':['jabón','jabon'],'papel':['papel higiénico','papel hig'],
  'shampoo':['shampoo','champú'],'desodorante':['desodorante'],'pasta dental':['pasta dental','crema dental'],
  'aguacate':['aguacate'],'naranja':['naranja'],'limon':['limón','limon'],'mango':['mango'],
  'banano':['banano'],'piña':['piña'],'mora':['mora '],'guayaba':['guayaba'],
  'zanahoria':['zanahoria'],'habichuela':['habichuela'],'pepino':['pepino'],
};

// Mapear texto OCR a nombre de la lista de productos
function matchProducto(texto){
  const t=texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  const opts=Array.from(document.getElementById('mc').options);
  for(const[key,aliases]of Object.entries(PRODUCTOS_KEYWORDS)){
    for(const alias of aliases){
      const a=alias.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
      if(t.includes(a)){
        const found=opts.find(o=>o.text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').includes(key));
        if(found)return found.text;
      }
    }
  }
  return null;
}

// Extraer precios del texto OCR (formato colombiano: $15.000, 15000, 15,000)
function extraerPrecios(texto){
  const resultados=[];
  // Buscar patrones: nombre seguido de precio
  const lineas=texto.split(/\n/).map(l=>l.trim()).filter(l=>l.length>2);
  lineas.forEach(linea=>{
    // Buscar precio en la línea
    const precioMatch=linea.match(/\$?\s*(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{0,2})?)/g);
    if(!precioMatch)return;
    precioMatch.forEach(pm=>{
      const numStr=pm.replace(/[$\s.]/g,'').replace(',','.');
      const precio=parseFloat(numStr);
      if(isNaN(precio)||precio<100||precio>10000000)return; // filtrar números raros
      // Buscar nombre del producto en la misma línea o línea anterior
      const textoSinPrecio=linea.replace(pm,'').trim();
      const nombreMatch=matchProducto(textoSinPrecio)||textoSinPrecio.split(/\s+/).slice(0,3).join(' ');
      if(nombreMatch&&nombreMatch.length>1){
        resultados.push({
          nombre_detectado:textoSinPrecio.substring(0,30)||nombreMatch,
          nombre_lista:matchProducto(textoSinPrecio)||'',
          precio:Math.round(precio)
        });
      }
    });
  });
  return resultados;
}

async function scanMercado(inp){
  const file=inp.files[0];
  if(!file)return;
  const res=document.getElementById('scan-merc-res');
  res.style.display='block';
  res.innerHTML='<span style="color:var(--amber)">⏳ Cargando motor de lectura... (primera vez tarda ~5 seg)</span>';

  try{
    await cargarTesseract();
    res.innerHTML='<span style="color:var(--amber)">🔍 Leyendo texto de la imagen...</span>';

    // Crear imagen para Tesseract
    const url=URL.createObjectURL(file);
    const resultado=await Tesseract.recognize(url,'spa+eng',{
      logger:m=>{
        if(m.status==='recognizing text'){
          const pct=Math.round((m.progress||0)*100);
          res.innerHTML=`<span style="color:var(--amber)">🔍 Procesando imagen... ${pct}%</span>`;
        }
      }
    });
    URL.revokeObjectURL(url);

    const textoOCR=resultado.data.text||'';
    if(!textoOCR.trim()){
      res.innerHTML='<div style="color:var(--amber);font-size:12px">⚠️ No se pudo leer texto en la imagen.<br><small style="color:var(--muted)">Toma la foto más cerca y con buena luz.</small></div>';
      return;
    }

    // Mostrar texto detectado y extraer productos/precios
    const productos=extraerPrecios(textoOCR);

    if(!productos.length){
      // Mostrar texto crudo para que el usuario vea qué se leyó
      res.innerHTML=`<div style="font-size:12px">
        <div style="color:var(--amber);margin-bottom:6px">⚠️ No se detectaron precios automáticamente.</div>
        <div style="color:var(--muted);font-size:11px;margin-bottom:6px">Texto leído:</div>
        <div style="background:var(--bg2);border-radius:6px;padding:8px;font-size:10px;color:var(--text);white-space:pre-wrap;max-height:120px;overflow-y:auto">${textoOCR.substring(0,400)}</div>
        <div style="color:var(--muted);font-size:10px;margin-top:5px">Ingresa el precio manualmente en el formulario de arriba.</div>
      </div>`;
      return;
    }

    window._scanProds=productos;
    let html=`<div style="font-weight:700;color:var(--teal);margin-bottom:8px;font-size:13px">✅ ${productos.length} precio(s) detectado(s)</div>`;
    productos.forEach((p,i)=>{
      html+=`<div style="display:flex;align-items:center;justify-content:space-between;padding:7px 0;border-bottom:1px solid var(--border)">
        <div style="flex:1;min-width:0">
          <div style="font-weight:600;font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${p.nombre_lista||p.nombre_detectado||'Producto'}</div>
          <div style="font-size:10px;color:var(--muted)">${p.nombre_detectado}</div>
        </div>
        <div style="display:flex;align-items:center;gap:7px;flex-shrink:0;margin-left:8px">
          <span style="color:var(--green);font-weight:700;font-size:13px">${fmt(p.precio)}</span>
          <button onclick="agregarDesdeScan(${i})"
            style="background:var(--accent);color:#fff;border:none;border-radius:7px;padding:5px 9px;font-size:11px;font-weight:600;cursor:pointer">+</button>
        </div>
      </div>`;
    });
    html+=`<button onclick="agregarTodosScan()"
      style="background:var(--green);color:#fff;border:none;border-radius:8px;padding:9px;font-size:12px;font-weight:700;cursor:pointer;width:100%;margin-top:8px">
      ✅ Agregar todos (${productos.length})
    </button>
    <button onclick="document.getElementById('scan-merc-res').style.display='none'"
      style="background:var(--bg3);color:var(--muted);border:1px solid var(--border);border-radius:8px;padding:7px;font-size:11px;cursor:pointer;width:100%;margin-top:5px">
      Cerrar
    </button>`;
    res.innerHTML=html;

  }catch(e){
    res.innerHTML=`<div style="color:var(--red);font-size:12px">❌ ${e.message}<br><small style="color:var(--muted)">Verifica tu conexión a internet para cargar el motor de lectura.</small></div>`;
  }
  inp.value='';
}

// Extraer datos de factura de servicio desde texto OCR
function extraerDatosFactura(texto){
  const t=texto.toLowerCase();
  const resultado={};

  // Detectar tipo de servicio
  if(/afinia|electricaribe|energia|kwh|kw\.h|electricidad/.test(t))resultado.tipo_servicio='energia';
  else if(/emdupar|acueducto|agua|alcantarillado|m3|metros cúbicos/.test(t))resultado.tipo_servicio='agua';
  else if(/gases del caribe|gas natural|gasnaturalcol/.test(t))resultado.tipo_servicio='gas';
  else if(/claro|movistar|tigo|wom|internet|wifi|fibra/.test(t))resultado.tipo_servicio='internet';
  else resultado.tipo_servicio='otro';

  // Detectar empresa
  if(/afinia/.test(t))resultado.empresa='Afinia';
  else if(/electricaribe/.test(t))resultado.empresa='Electricaribe';
  else if(/emdupar/.test(t))resultado.empresa='EMDUPAR';
  else if(/gases del caribe/.test(t))resultado.empresa='Gases del Caribe';
  else if(/claro/.test(t))resultado.empresa='Claro';
  else if(/movistar/.test(t))resultado.empresa='Movistar';
  else if(/tigo/.test(t))resultado.empresa='Tigo';

  // Extraer fechas (formato dd/mm/yyyy o dd-mm-yyyy o yyyy-mm-dd)
  const fechas=texto.match(/\b(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})\b/g)||[];
  if(fechas.length>=1)resultado.fecha_factura=parseFechaOCR(fechas[0]);
  if(fechas.length>=2)resultado.fecha_corte=parseFechaOCR(fechas[1]);

  // Extraer consumo con unidad
  const consumoKwh=texto.match(/(\d+[\.,]?\d*)\s*kwh/i);
  const consumoM3=texto.match(/(\d+[\.,]?\d*)\s*m3/i);
  if(consumoKwh){resultado.consumo=parseFloat(consumoKwh[1]);resultado.unidad_consumo='kWh';}
  else if(consumoM3){resultado.consumo=parseFloat(consumoM3[1]);resultado.unidad_consumo='m³';}

  // Extraer valor total — buscar el número más grande en el texto (suele ser el total)
  const todosNumeros=(texto.match(/\$?\s*(\d{1,3}(?:[.,]\d{3})+)/g)||[])
    .map(n=>parseInt(n.replace(/[$\s.,]/g,'')))
    .filter(n=>n>=1000&&n<=99999999);
  if(todosNumeros.length)resultado.valor_total=Math.max(...todosNumeros);

  return resultado;
}

function parseFechaOCR(str){
  if(!str)return'';
  const p=str.split(/[\/\-]/);
  if(p.length!==3)return'';
  let d=p[0],m=p[1],a=p[2];
  if(a.length===2)a='20'+a;
  if(parseInt(a)>2000)return`${a}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`;
  return`${d}-${m}-${a}`;
}

async function scanServicio(inp){
  const file=inp.files[0];
  if(!file)return;
  const res=document.getElementById('scan-serv-res');
  res.style.display='block';
  res.innerHTML='<span style="color:var(--amber)">⏳ Cargando motor de lectura...</span>';

  try{
    await cargarTesseract();
    res.innerHTML='<span style="color:var(--amber)">🔍 Leyendo factura...</span>';

    const url=URL.createObjectURL(file);
    const resultado=await Tesseract.recognize(url,'spa+eng',{
      logger:m=>{
        if(m.status==='recognizing text'){
          const pct=Math.round((m.progress||0)*100);
          res.innerHTML=`<span style="color:var(--amber)">🔍 Procesando... ${pct}%</span>`;
        }
      }
    });
    URL.revokeObjectURL(url);

    const textoOCR=resultado.data.text||'';
    if(!textoOCR.trim()){
      res.innerHTML='<div style="color:var(--amber);font-size:12px">⚠️ No se pudo leer la factura.<br><small style="color:var(--muted)">Toma la foto con más luz y más cerca.</small></div>';
      return;
    }

    const parsed=extraerDatosFactura(textoOCR);
    const iconos={agua:'💧',gas:'🔥',energia:'⚡',internet:'📡',telefono:'📱',otro:'📄'};
    const ico=iconos[parsed.tipo_servicio]||'📄';

    // Calcular alerta de corte
    let alertaHTML='';
    let diasCorte=null;
    if(parsed.fecha_corte){
      const hoy=new Date(); hoy.setHours(0,0,0,0);
      const corte=new Date(parsed.fecha_corte+'T00:00:00');
      diasCorte=Math.ceil((corte-hoy)/(1000*60*60*24));
      if(diasCorte<0)
        alertaHTML=`<div style="background:rgba(240,82,82,.2);border:1px solid var(--red);border-radius:8px;padding:9px;margin:8px 0;font-size:12px;color:var(--red)">🚨 <b>VENCIDA</b> hace ${Math.abs(diasCorte)} día(s)</div>`;
      else if(diasCorte===0)
        alertaHTML=`<div style="background:rgba(240,82,82,.2);border:1px solid var(--red);border-radius:8px;padding:9px;margin:8px 0;font-size:12px;color:var(--red)">🚨 <b>¡VENCE HOY!</b></div>`;
      else if(diasCorte<=3)
        alertaHTML=`<div style="background:rgba(240,82,82,.15);border:1px solid var(--red);border-radius:8px;padding:9px;margin:8px 0;font-size:12px;color:var(--red)">⚠️ <b>Vence en ${diasCorte} día(s)</b> — ${ff(parsed.fecha_corte)}</div>`;
      else if(diasCorte<=7)
        alertaHTML=`<div style="background:rgba(245,166,35,.15);border:1px solid var(--amber);border-radius:8px;padding:9px;margin:8px 0;font-size:12px;color:var(--amber)">⏰ Vence en <b>${diasCorte} días</b></div>`;
      else
        alertaHTML=`<div style="background:rgba(52,201,143,.1);border:1px solid var(--green);border-radius:8px;padding:9px;margin:8px 0;font-size:12px;color:var(--green)">✅ Vence en <b>${diasCorte} días</b></div>`;
    }

    // Mostrar texto crudo si no se detectó nada útil
    const hayDatos=parsed.empresa||parsed.valor_total||parsed.fecha_corte;
    let textoRaw='';
    if(!hayDatos){
      textoRaw=`<div style="color:var(--muted);font-size:11px;margin-top:8px">Texto leído (completa manualmente):</div>
      <div style="background:var(--bg2);border-radius:6px;padding:8px;font-size:10px;white-space:pre-wrap;max-height:100px;overflow-y:auto;margin-top:4px">${textoOCR.substring(0,300)}</div>`;
    }

    window._scanFactura=parsed;
    res.innerHTML=`
      <div style="font-weight:700;color:var(--teal);margin-bottom:8px;font-size:13px">${ico} Factura leída</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:5px;font-size:12px">
        <div><span style="color:var(--muted)">Empresa:</span> <b>${parsed.empresa||'—'}</b></div>
        <div><span style="color:var(--muted)">Tipo:</span> <b>${parsed.tipo_servicio||'—'}</b></div>
        <div><span style="color:var(--muted)">Consumo:</span> <b style="color:var(--accent)">${parsed.consumo?parsed.consumo+' '+parsed.unidad_consumo:'—'}</b></div>
        <div><span style="color:var(--muted)">Emisión:</span> <b>${ff(parsed.fecha_factura)||'—'}</b></div>
        <div><span style="color:var(--muted)">Corte:</span> <b style="color:var(--red)">${ff(parsed.fecha_corte)||'—'}</b></div>
        <div><span style="color:var(--muted)">Valor:</span> <b style="color:var(--green);font-size:14px">${parsed.valor_total?fmt(parsed.valor_total):'—'}</b></div>
      </div>
      ${alertaHTML}${textoRaw}
      <button onclick="prellenarServicio(window._scanFactura)"
        style="background:var(--accent);color:#fff;border:none;border-radius:8px;padding:9px;font-size:13px;font-weight:700;cursor:pointer;width:100%;margin-top:8px">
        📋 Usar estos datos en el formulario
      </button>`;

    if(diasCorte!==null&&diasCorte>=0&&diasCorte<=3&&'Notification' in window){
      Notification.requestPermission().then(perm=>{
        if(perm==='granted')new Notification(`⚠️ ${parsed.empresa||'Servicio'} vence pronto`,{
          body:`Fecha de corte: ${ff(parsed.fecha_corte)} — Valor: ${fmt(parsed.valor_total||0)}`,
          icon:'icons/icon-192.png'
        });
      });
    }

  }catch(e){
    res.innerHTML=`<div style="color:var(--red);font-size:12px">❌ ${e.message}</div>`;
  }
  inp.value='';
}

function prellenarServicio(p){
  if(!p)return;
  const mapaTipo={agua:'💧 EMDUPAR (Aguas del Cesar)',gas:'🔥 Gases del Caribe',energia:'⚡ Afinia (antes Electricaribe)',internet:'📡 Claro hogar',telefono:'📱 Claro móvil'};
  const sel=document.getElementById('st2');
  const tipoObj=mapaTipo[p.tipo_servicio];
  if(tipoObj){const opt=Array.from(sel.options).find(o=>o.text===tipoObj);if(opt)sel.value=opt.value||opt.text;}
  if(p.empresa)document.getElementById('se2').value=p.empresa;
  if(p.valor_total)document.getElementById('sm2').value=p.valor_total;
  if(p.fecha_corte)document.getElementById('sf2').value=p.fecha_corte;
  const nota=[];
  if(p.consumo&&p.unidad_consumo)nota.push(`Consumo: ${p.consumo} ${p.unidad_consumo}`);
  if(nota.length)document.getElementById('sn2').value=nota.join(' | ');
  document.getElementById('sm2').scrollIntoView({behavior:'smooth',block:'center'});
  toast('📋 Formulario cargado — revisa y registra');
}

// Redimensionar imagen
function resizeImage(file,maxPx){
  return new Promise((resolve,reject)=>{
    const img=new Image();
    const url=URL.createObjectURL(file);
    img.onload=()=>{
      URL.revokeObjectURL(url);
      let w=img.width,h=img.height;
      if(w>maxPx||h>maxPx){if(w>h){h=Math.round(h*maxPx/w);w=maxPx;}else{w=Math.round(w*maxPx/h);h=maxPx;}}
      const c=document.createElement('canvas');c.width=w;c.height=h;
      c.getContext('2d').drawImage(img,0,0,w,h);
      resolve(c.toDataURL('image/jpeg',0.85).split(',')[1]);
    };
    img.onerror=reject;img.src=url;
  });
}

function agregarDesdeScan(idx){
  const prods=window._scanProds||[];
  const p=prods[idx];if(!p)return;
  const sel=document.getElementById('mc');
  const opts=Array.from(sel.options);
  const nl=(p.nombre_lista||'').toLowerCase();
  const nd=(p.nombre_detectado||'').toLowerCase();
  const match=opts.find(o=>o.text.toLowerCase()===nl)||opts.find(o=>o.text.toLowerCase().includes(nd.split(' ')[0]));
  if(match)sel.value=match.value||match.text;
  document.getElementById('mi').value=p.nombre_detectado||p.nombre_lista||'';
  document.getElementById('mp').value=p.precio||0;
  document.getElementById('mq').value=p.cantidad||1;
  document.getElementById('mu').value=p.unidad||'';
  document.getElementById('mi').scrollIntoView({behavior:'smooth',block:'center'});
  document.getElementById('mi').focus();
  toast('📋 Datos cargados — toca "+ Agregar al mercado"');
}

function agregarTodosScan(){
  const prods=window._scanProds||[];
  if(!prods.length){toast('⚠️ Sin productos');return;}
  const hoy=fechaHoy();
  prods.forEach(p=>{
    const cat=p.nombre_lista||p.nombre_detectado||'Otro';
    D.mercado.push({cat,item:p.nombre_detectado||p.nombre_lista||'Producto',precio:p.precio||0,cantidad:1,unidad:'',fecha:hoy,nota:'📷 Escaneado',total:p.precio||0});
  });
  save();rM();upd();
  document.getElementById('scan-merc-res').style.display='none';
  toast(`✅ ${prods.length} productos agregados`);
}

function rM(){
  const gs={};
  D.mercado.forEach((c,i)=>{
    if((c.tienda||'Sin tienda')!==_tiendaActiva)return;
    if(_filtroMercadoCat&&!getCG(c.cat).includes(_filtroMercadoCat))return;
    if(_mercSearch&&!(c.item||'').toLowerCase().includes(_mercSearch)&&!(c.cat||'').toLowerCase().includes(_mercSearch))return;
    const g=getCG(c.cat);
    if(!gs[g])gs[g]=[];
    gs[g].push({...c,idx:i});
  });
  let html='';let ci=0;
  for(const[g,items]of Object.entries(gs)){
    const col=GCOLS[ci++%GCOLS.length];
    const tot=items.reduce((s,x)=>s+x.total,0);
    html+=`<div class="sub"><div class="subt"><span class="dot" style="background:${col}"></span>${g}<span style="font-weight:400;color:var(--muted);font-size:10px"> · ${items.length} · $${Math.round(tot).toLocaleString('es-CO')}</span></div>`;
    html+='<div class="tbl-wrap"><table><thead><tr><th>Producto</th><th>x</th><th>P.Unit</th><th>Total</th><th></th></tr></thead><tbody>';
    items.forEach(it=>{
      html+=`<tr><td style="font-weight:500">${it.item}</td><td>${it.cantidad}${it.unidad?' '+it.unidad:''}</td><td style="color:var(--muted)">$${Math.round(it.precio).toLocaleString('es-CO')}</td><td style="color:var(--green);font-weight:700">$${Math.round(it.total).toLocaleString('es-CO')}</td><td><button class="bdel" onclick="delM(${it.idx})">✕</button></td></tr>`;
    });
    html+='</tbody></table></div></div>';
  }
  const totalTienda=D.mercado.filter(x=>(x.tienda||'Sin tienda')===_tiendaActiva).reduce((s,x)=>s+(x.total||0),0);
  if(!html){
    html=`<div style="text-align:center;padding:28px 16px"><div style="font-size:36px;margin-bottom:8px">${_mercSearch?'🔍':'🛒'}</div><div style="font-size:13px;color:var(--muted)">${_mercSearch?`Sin resultados para "<b style="color:var(--p3)">${_mercSearch}</b>"`:`Lista vacía para <b style="color:var(--p3)">${_tiendaActiva}</b>`}</div></div>`;
  }else{
    html+=`<div class="tot-row" style="color:var(--green)">Total <b style="color:var(--p3)">${_tiendaActiva}</b>: $${Math.round(totalTienda).toLocaleString('es-CO')}</div>`;
  }
  const el=document.getElementById('mercado-content');if(el)el.innerHTML=html;
  // Chart
  const w=document.getElementById('chart-mercado');
  const b=document.getElementById('chart-mercado-bars');
  const entries=Object.entries(gs).map(([g,items])=>({g,tot:items.reduce((s,x)=>s+x.total,0)}));
  if(!entries.length){if(w)w.style.display='none';}
  else{
    if(w)w.style.display='block';
    const mx=Math.max(...entries.map(e=>e.tot));
    if(b)b.innerHTML=entries.map((e,i)=>`<div class="cr"><div class="cl">${e.g.substring(0,12)}</div><div class="cb"><div class="cf" style="width:${Math.round(e.tot/mx*100)}%;background:${GCOLS[i%GCOLS.length]}"></div></div><div class="cv">$${Math.round(e.tot).toLocaleString('es-CO')}</div></div>`).join('');
  }
  _actualizarContadorTienda();
  _mostrarResumenTiendas();
}

function rChartM(gs){
  const w=document.getElementById('chart-mercado');
  const b=document.getElementById('chart-mercado-bars');
  const entries=Object.entries(gs).map(([g,items])=>({g,tot:items.reduce((s,x)=>s+x.total,0)}));
  if(!entries.length){w.style.display='none';return;}
  w.style.display='block';
  const mx=Math.max(...entries.map(e=>e.tot));
  b.innerHTML=entries.map((e,i)=>`<div class="cr"><div class="cl">${e.g.substring(0,14)}</div><div class="cb"><div class="cf" style="width:${Math.round(e.tot/mx*100)}%;background:${GCOLS[i%GCOLS.length]}"></div></div><div class="cv">${fmt(e.tot)}</div></div>`).join('');
}

function delM(i){D.mercado.splice(i,1);save();rM();upd();toast('🗑️ Eliminado');}

// ── GASTOS ────────────────────────────────────
function addG(){
  const desc=document.getElementById('gd').value.trim();
  const cat=document.getElementById('gc').value;
  const m=parseFloat(document.getElementById('gm').value)||0;
  const f=document.getElementById('gf').value;
  const n=document.getElementById('gn').value.trim();
  if(!desc||!m){toast('⚠️ Completa descripción y monto');return;}
  D.gastos.push({desc,cat,monto:m,fecha:f,nota:n});
  ['gd','gm','gn'].forEach(id=>document.getElementById(id).value='');
  save();rT('gastos','gt',['fecha','desc','cat','monto','nota'],'gtot','monto','red');upd();toast('✅ Gasto registrado');
}

function addS(){
  const tipo=document.getElementById('st2').value;
  const emp=document.getElementById('se2').value.trim()||'—';
  const m=parseFloat(document.getElementById('sm2').value)||0;
  const f=document.getElementById('sf2').value;
  const n=document.getElementById('sn2').value.trim();
  if(!m){toast('⚠️ Ingresa el monto');return;}
  D.servicios.push({tipo,empresa:emp,monto:m,fecha:f,nota:n,pagado:false});
  ['se2','sm2','sn2'].forEach(id=>document.getElementById(id).value='');
  save();rServ();upd();toast('✅ Servicio registrado');
}

function rServ(){
  document.getElementById('svt').innerHTML=D.servicios.map((s,i)=>`<tr>
    <td class="fc">${ff(s.fecha)}</td><td>${s.tipo}</td><td>${s.empresa}</td>
    <td style="color:var(--amber)">${fmt(s.monto)}</td>
    <td><span class="badge ${s.pagado?'bg2':'br2'}" style="cursor:pointer" onclick="tgP(${i})">${s.pagado?'✓ Pagado':'⏳ Pdte'}</span></td>
    <td class="nc">${s.nota||'—'}</td>
    <td><button class="bdel" onclick="delS(${i})">✕</button></td>
  </tr>`).join('')||'<tr><td colspan="7" style="text-align:center;color:var(--muted);padding:14px">Sin registros</td></tr>';
  document.getElementById('svtot').textContent=fmt(D.servicios.reduce((s,x)=>s+x.monto,0));
}
function tgP(i){D.servicios[i].pagado=!D.servicios[i].pagado;save();rServ();}
function delS(i){D.servicios.splice(i,1);save();rServ();upd();toast('🗑️ Eliminado');}

// ── INGRESOS ──────────────────────────────────
function addI(){
  const f=document.getElementById('if2').value.trim();
  const t=document.getElementById('it2').value;
  const m=parseFloat(document.getElementById('im').value)||0;
  const fd=document.getElementById('ifd').value;
  const n=document.getElementById('in2').value.trim();
  if(!f||!m){toast('⚠️ Completa fuente y monto');return;}
  D.ingresos.push({fuente:f,tipo:t,monto:m,fecha:fd,nota:n});
  ['if2','im','in2'].forEach(id=>document.getElementById(id).value='');
  save();rT('ingresos','ivt',['fecha','fuente','tipo','monto','nota'],'ivtot','monto','green');upd();toast('✅ Ingreso registrado');
}

// ── MASCOTAS ──────────────────────────────────
function addMas(){
  const esp=document.getElementById('manes').value;
  const nom=document.getElementById('mannom').value.trim();
  const cat=document.getElementById('manc').value;
  const m=parseFloat(document.getElementById('manm').value)||0;
  const f=document.getElementById('manfd').value;
  const n=document.getElementById('mann').value.trim();
  if(!nom||!m){toast('⚠️ Completa nombre y costo');return;}
  D.mascotas.push({especie:esp,nombre:nom,cat,monto:m,fecha:f,nota:n});
  ['mannom','manm','mann'].forEach(id=>document.getElementById(id).value='');
  save();
  document.getElementById('mast').innerHTML=D.mascotas.map((r,i)=>`<tr>
    <td class="fc">${ff(r.fecha)}</td><td>${r.especie}</td><td>${r.nombre}</td><td>${r.cat}</td>
    <td style="color:var(--purple)">${fmt(r.monto)}</td>
    <td class="nc">${r.nota||'—'}</td>
    <td><button class="bdel" onclick="delMas(${i})">✕</button></td>
  </tr>`).join('')||'<tr><td colspan="7" style="text-align:center;color:var(--muted);padding:14px">Sin registros</td></tr>';
  document.getElementById('mastot').textContent=fmt(D.mascotas.reduce((s,x)=>s+x.monto,0));
  upd();toast('✅ Registrado');
}
function rMascotas(){
  document.getElementById('mast').innerHTML=D.mascotas.map((r,i)=>`<tr>
    <td class="fc">${ff(r.fecha)}</td><td>${r.especie||'—'}</td><td>${r.nombre||r.mascota||'—'}</td><td>${r.cat}</td>
    <td style="color:var(--purple)">${fmt(r.monto)}</td>
    <td class="nc">${r.nota||'—'}</td>
    <td><button class="bdel" onclick="delMas(${i})">✕</button></td>
  </tr>`).join('')||'<tr><td colspan="7" style="text-align:center;color:var(--muted);padding:14px">Sin registros</td></tr>';
  document.getElementById('mastot').textContent=fmt(D.mascotas.reduce((s,x)=>s+x.monto,0));
}
function delMas(i){D.mascotas.splice(i,1);save();rMascotas();upd();}

// ── PRESUPUESTO ───────────────────────────────
function addP(){
  const c=document.getElementById('pc').value.trim();
  const m=parseFloat(document.getElementById('pm').value)||0;
  if(!c||!m){toast('⚠️ Completa categoría y monto');return;}
  D.presupuesto.push({cat:c,monto:m,gastado:0});
  ['pc','pm'].forEach(id=>document.getElementById(id).value='');
  save();rPres();toast('✅ Categoría agregada');
}
function rPres(){
  document.getElementById('pl').innerHTML=D.presupuesto.map((p,i)=>{
    const pct=p.monto>0?Math.min(100,Math.round(p.gastado/p.monto*100)):0;
    const col=pct>=90?'var(--red)':pct>=70?'var(--amber)':'var(--green)';
    return`<div style="background:var(--bg3);border-radius:8px;padding:10px;margin-bottom:7px">
      <div style="display:flex;justify-content:space-between;margin-bottom:5px">
        <span style="font-size:12px;font-weight:600">${p.cat}</span>
        <div style="display:flex;align-items:center;gap:7px">
          <span style="font-size:11px;color:var(--muted)">${fmt(p.gastado)}/${fmt(p.monto)} · <span style="color:${col}">${pct}%</span></span>
          <button class="bdel" onclick="delPres(${i})">✕</button>
        </div>
      </div>
      <div class="pb"><div class="pf" style="width:${pct}%;background:${col}"></div></div>
    </div>`;
  }).join('')||'<div style="color:var(--muted);font-size:12px;text-align:center;padding:14px">Define categorías de presupuesto</div>';
}
function delPres(i){D.presupuesto.splice(i,1);save();rPres();}

// ── MANTENIMIENTO ─────────────────────────────
function addMant(){
  const tipo=document.getElementById('mtipo').value;
  const desc=document.getElementById('md2').value.trim();
  const m=parseFloat(document.getElementById('mm').value)||0;
  const f=document.getElementById('mfd').value;
  const n=document.getElementById('mno').value.trim();
  if(!m){toast('⚠️ Ingresa el costo');return;}
  D.mantenimiento.push({tipo,desc,monto:m,fecha:f,nota:n});
  ['md2','mm','mno'].forEach(id=>document.getElementById(id).value='');
  save();rT('mantenimiento','mantt',['fecha','tipo','desc','monto','nota'],'manttot','monto','teal');upd();toast('✅ Registrado');
}

// ── OCIO ──────────────────────────────────────
function addO(){
  const d=document.getElementById('od').value.trim();
  const c=document.getElementById('oc').value;
  const m=parseFloat(document.getElementById('om').value)||0;
  const f=document.getElementById('of').value;
  const n=document.getElementById('on2').value.trim();
  if(!d||!m){toast('⚠️ Completa actividad y gasto');return;}
  D.ocio.push({actividad:d,cat:c,monto:m,fecha:f,nota:n});
  ['od','om','on2'].forEach(id=>document.getElementById(id).value='');
  save();rT('ocio','oct',['fecha','actividad','cat','monto','nota'],'octot','monto','pink');upd();toast('✅ Registrado');
}

// ── CENTRO COMERCIAL ──────────────────────────
function addCC(){
  const d=document.getElementById('ccd').value.trim();
  const c=document.getElementById('ccc').value;
  const m=parseFloat(document.getElementById('ccm').value)||0;
  const f=document.getElementById('ccf').value;
  const n=document.getElementById('ccn').value.trim();
  if(!d||!m){toast('⚠️ Completa artículo y precio');return;}
  D.centrocomercial.push({articulo:d,cat:c,monto:m,fecha:f,nota:n});
  ['ccd','ccm','ccn'].forEach(id=>document.getElementById(id).value='');
  save();rT('centrocomercial','cct',['fecha','articulo','cat','monto','nota'],'cctot','monto','amber');upd();toast('✅ Registrado');
}

// ── TARJETAS ──────────────────────────────────
function addTarjeta(){
  const nom=document.getElementById('tcnom').value.trim();
  const banco=document.getElementById('tcbanco').value;
  const red=document.getElementById('tcred').value;
  const lim=parseFloat(document.getElementById('tclim').value)||0;
  const corte=parseInt(document.getElementById('tccut').value)||0;
  if(!nom||!lim){toast('⚠️ Nombre y cupo son requeridos');return;}
  D.tarjetas.push({nom,banco,red,limite:lim,corte,id:Date.now()});
  ['tcnom','tclim','tccut'].forEach(id=>document.getElementById(id).value='');
  save();rTarjetas();toast('✅ Tarjeta agregada');
}
function rTarjetas(){
  const sel=document.getElementById('tcsel');
  sel.innerHTML='<option>— Selecciona tarjeta —</option>'+D.tarjetas.map(t=>`<option value="${t.id}">${t.nom}</option>`).join('');
  document.getElementById('tarjetas-list').innerHTML=D.tarjetas.map((t,i)=>{
    const usado=D.gastosTarjeta.filter(g=>g.tcId==t.id).reduce((s,x)=>s+x.monto,0);
    const pct=t.limite>0?Math.min(100,Math.round(usado/t.limite*100)):0;
    const col=pct>=90?'var(--red)':pct>=70?'var(--amber)':'var(--green)';
    return`<div class="tcrd"><div class="tcrdh"><div><div style="font-weight:700;font-size:13px">${t.nom}</div><div style="font-size:11px;color:var(--muted)">${t.banco} · ${t.red} · Corte día ${t.corte||'—'}</div></div><div style="display:flex;align-items:center;gap:6px"><span style="font-size:12px;color:${col}">${fmt(usado)}/${fmt(t.limite)}</span><button class="bdel" onclick="delTC(${i})">✕</button></div></div><div class="pb"><div class="pf" style="width:${pct}%;background:${col}"></div></div></div>`;
  }).join('')||'<div style="color:var(--muted);font-size:12px;text-align:center;padding:14px">Agrega tus tarjetas</div>';
  rTablaTC();
}
function delTC(i){D.tarjetas.splice(i,1);save();rTarjetas();}
function addGastoTC(){
  const sel=document.getElementById('tcsel');
  const tcId=sel.value;
  if(tcId==='— Selecciona tarjeta —'){toast('⚠️ Selecciona una tarjeta');return;}
  const desc=document.getElementById('tgdesc').value.trim();
  const m=parseFloat(document.getElementById('tgmonto').value)||0;
  const cuotas=parseInt(document.getElementById('tgcuotas').value)||1;
  const f=document.getElementById('tgfecha').value;
  const n=document.getElementById('tgnota').value.trim();
  const tc=D.tarjetas.find(t=>t.id==tcId);
  if(!desc||!m||!tc){toast('⚠️ Completa los campos');return;}
  D.gastosTarjeta.push({tcId,tcNom:tc.nom,desc,monto:m,cuotas,fecha:f,nota:n});
  ['tgdesc','tgmonto','tgnota'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('tgcuotas').value='1';
  save();rTarjetas();upd();toast('✅ Gasto en tarjeta registrado');
}
function rTablaTC(){
  document.getElementById('tgt').innerHTML=D.gastosTarjeta.map((g,i)=>`<tr>
    <td class="fc">${ff(g.fecha)}</td><td>${g.tcNom}</td><td>${g.desc}</td>
    <td style="color:var(--accent)">${fmt(g.monto)}</td>
    <td>${g.cuotas}x</td><td>${fmt(g.monto/g.cuotas)}/m</td>
    <td><button class="bdel" onclick="delGTC(${i})">✕</button></td>
  </tr>`).join('')||'<tr><td colspan="7" style="text-align:center;color:var(--muted);padding:14px">Sin gastos</td></tr>';
  document.getElementById('tgtot').textContent=fmt(D.gastosTarjeta.reduce((s,x)=>s+x.monto,0));
}
function delGTC(i){D.gastosTarjeta.splice(i,1);save();rTarjetas();upd();}

// ── MOVILIDAD ─────────────────────────────────
function addMov(){
  const veh=document.getElementById('mvveh').value;
  const tipo=document.getElementById('mvtipo').value;
  const f=document.getElementById('mvfecha').value;
  const gal=parseFloat(document.getElementById('mvgal').value)||0;
  const m=parseFloat(document.getElementById('mvmonto').value)||0;
  const placa=document.getElementById('mvplaca').value.trim();
  const n=document.getElementById('mvnota').value.trim();
  if(!m){toast('⚠️ Ingresa el valor');return;}
  D.movilidad.push({vehiculo:veh,tipo,fecha:f,galones:gal,monto:m,placa,nota:n});
  ['mvgal','mvmonto','mvnota'].forEach(id=>document.getElementById(id).value='');
  save();rMov();upd();toast('✅ Movilidad registrada');
}
function rMov(){
  document.getElementById('mvt').innerHTML=D.movilidad.map((r,i)=>`<tr>
    <td class="fc">${ff(r.fecha)}</td>
    <td><span class="mvbadge ${r.vehiculo.includes('Carro')?'mvc':'mvm'}">${r.vehiculo.substring(0,5)}</span></td>
    <td style="font-size:10px">${r.tipo}</td>
    <td>${r.galones>0?r.galones:'—'}</td>
    <td style="color:var(--amber)">${fmt(r.monto)}</td>
    <td class="nc">${r.placa||'—'}</td>
    <td><button class="bdel" onclick="delMov(${i})">✕</button></td>
  </tr>`).join('')||'<tr><td colspan="7" style="text-align:center;color:var(--muted);padding:14px">Sin registros</td></tr>';
  const gas=D.movilidad.filter(r=>/Gasolina|ACPM/.test(r.tipo)).reduce((s,x)=>s+x.monto,0);
  const mnt=D.movilidad.filter(r=>r.tipo.includes('🔧')).reduce((s,x)=>s+x.monto,0);
  document.getElementById('mvgas').textContent=fmt(gas);
  document.getElementById('mvmnt').textContent=fmt(mnt);
  document.getElementById('mvtot').textContent=fmt(D.movilidad.reduce((s,x)=>s+x.monto,0));
}
function delMov(i){D.movilidad.splice(i,1);save();rMov();upd();}

// ── DEUDAS ────────────────────────────────────
function addDeuda(){
  const nom=document.getElementById('dd-nombre').value.trim();
  const m=parseFloat(document.getElementById('dd-monto').value)||0;
  const f=document.getElementById('dd-fecha').value;
  const vcto=document.getElementById('dd-vcto').value;
  const tipo=document.getElementById('dd-tipo').value;
  const nota=document.getElementById('dd-nota').value.trim();
  if(!nom||!m){toast('⚠️ Nombre y monto requeridos');return;}
  D.deudas.push({nombre:nom,monto:m,fecha:f,vencimiento:vcto,tipo,nota,pagado:false});
  ['dd-nombre','dd-monto','dd-nota'].forEach(id=>document.getElementById(id).value='');
  save();rDeudas();upd();toast('✅ Deuda registrada');
}
function rDeudas(){
  const list=document.getElementById('deudas-list');
  list.innerHTML=D.deudas.map((d,i)=>{
    const hoy=new Date();
    const vcto=d.vencimiento?new Date(d.vencimiento):null;
    const vencida=vcto&&vcto<hoy&&!d.pagado;
    return`<div class="dcrd" style="border-left-color:${d.pagado?'var(--green)':vencida?'var(--red)':'var(--amber)'}">
      <div class="dcrdh">
        <div>
          <div style="font-weight:700;font-size:13px">${d.nombre}</div>
          <div style="font-size:11px;color:var(--muted)">${d.tipo} · Reg: ${ff(d.fecha)}${d.vencimiento?' · Vcto: '+ff(d.vencimiento):''}</div>
          ${d.nota?`<div style="font-size:11px;color:var(--muted);margin-top:2px">${d.nota}</div>`:''}
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:5px">
          <span style="font-size:15px;font-weight:700;color:${d.pagado?'var(--green)':vencida?'var(--red)':'var(--amber)'}">${fmt(d.monto)}</span>
          <span class="badge ${d.pagado?'bg2':'br2'}" style="cursor:pointer" onclick="tgDeuda(${i})">${d.pagado?'✓ Pagado':'Pendiente'}</span>
          <button class="bdel" onclick="delDeuda(${i})">✕</button>
        </div>
      </div>
      ${vencida?'<div style="font-size:10px;color:var(--red);margin-top:5px">⚠️ VENCIDA</div>':''}
    </div>`;
  }).join('')||'<div style="color:var(--muted);font-size:12px;text-align:center;padding:20px">Sin deudas registradas</div>';
  document.getElementById('deudas-tot').textContent=fmt(D.deudas.filter(d=>!d.pagado).reduce((s,x)=>s+x.monto,0));
  rDeudasResumen();
}
function tgDeuda(i){D.deudas[i].pagado=!D.deudas[i].pagado;save();rDeudas();upd();}
function delDeuda(i){D.deudas.splice(i,1);save();rDeudas();upd();}
function rDeudasResumen(){
  const pend=D.deudas.filter(d=>!d.pagado);
  const el=document.getElementById('deudas-resumen');
  if(!pend.length){el.textContent='Sin deudas pendientes ✅';return;}
  el.innerHTML=pend.slice(0,3).map(d=>`<div style="display:flex;justify-content:space-between;padding:3px 0;border-bottom:1px solid var(--border)"><span>${d.nombre}</span><span style="color:var(--red);font-weight:600">${fmt(d.monto)}</span></div>`).join('')+(pend.length>3?`<div style="font-size:11px;color:var(--muted);margin-top:4px">+${pend.length-3} más...</div>`:'');
}

// ── TABLA GENÉRICA ────────────────────────────
const COLS={red:'var(--red)',green:'var(--green)',amber:'var(--amber)',teal:'var(--teal)',pink:'var(--pink)',purple:'var(--purple)',accent:'var(--accent)'};
function rT(key,bodyId,fields,totId,mf,col){
  const c=COLS[col]||'var(--text)';
  document.getElementById(bodyId).innerHTML=D[key].map((r,i)=>
    `<tr>${fields.map(f=>{
      if(f===mf)return`<td style="color:${c}">${fmt(r[f])}</td>`;
      if(f==='fecha')return`<td class="fc">${ff(r[f])}</td>`;
      if(f==='nota')return`<td class="nc">${r[f]||'—'}</td>`;
      return`<td>${r[f]||'—'}</td>`;
    }).join('')}<td><button class="bdel" onclick="del2('${key}','${bodyId}',${i},'${totId}','${mf}','${col}',${JSON.stringify(fields)})">✕</button></td></tr>`
  ).join('')||`<tr><td colspan="${fields.length+1}" style="text-align:center;color:var(--muted);padding:14px">Sin registros</td></tr>`;
  if(totId)document.getElementById(totId).textContent=fmt(D[key].reduce((s,x)=>s+(x[mf]||0),0));
}
function del2(key,bodyId,i,totId,mf,col,fields){D[key].splice(i,1);save();rT(key,bodyId,fields,totId,mf,col);upd();toast('🗑️ Eliminado');}

// ── RESUMEN GENERAL ───────────────────────────
function upd(){
  const ti=Q.q1neto+Q.q2neto+D.ingresos.reduce((s,x)=>s+x.monto,0);
  const tg=[D.gastos,D.servicios,D.mantenimiento,D.ocio,D.mascotas,D.centrocomercial,D.movilidad,D.gastosTarjeta]
    .reduce((s,a)=>s+a.reduce((ss,x)=>ss+(x.monto||0),0),0)
    +D.mercado.reduce((s,x)=>s+(x.total||0),0);
  const tr=Object.values(D).reduce((s,a)=>s+a.length,0);
  document.getElementById('si').textContent=fmt(ti);
  document.getElementById('sg').textContent=fmt(tg);
  const bal=ti-tg;
  const bel=document.getElementById('sb');
  bel.textContent=fmt(bal);bel.style.color=bal>=0?'var(--green)':'var(--red)';
  document.getElementById('sr').textContent=tr;
  rDeudasResumen();
  // Indicar meses guardados en el select
  actualizarMesSelect();
}

function actualizarMesSelect(){
  const guardados=JSON.parse(localStorage.getItem('gh_meses_guardados')||'[]');
  const sel=document.getElementById('mesSelect');
  const mesActivo=mesActual();
  Array.from(sel.options).forEach(opt=>{
    const nombre=(opt.value||opt.text).replace(/\s*✓\s*/g,'').trim();
    const estaGuardado=guardados.includes(nombre);
    opt.text=nombre+(estaGuardado?' ✓':'');
  });
}

function cambiarMes(){
  save();
  const mes=mesActual();
  loadMes(mes);
  renderAll();
  toast('📅 Mostrando: '+mes);
}

function guardarMes(){
  save();
  toast('💾 Mes guardado: '+mesActual());
  actualizarMesSelect();
}

// ── RENDER ALL ─── re-dibuja TODO desde D[] ───

// ════════════════════════════════════════════════════════
// VISOR DE ARCHIVOS — abre PDF y Excel dentro del programa
// ════════════════════════════════════════════════════════
function abrirVisorDatos(){
  const mes=getMes();
  const old=document.getElementById('visor-modal');if(old)old.remove();
  const modal=document.createElement('div');
  modal.id='visor-modal';
  modal.style.cssText='position:fixed;top:0;left:0;right:0;bottom:0;z-index:8000;background:rgba(0,0,0,.92);display:flex;flex-direction:column;overflow:hidden;';

  // Totales
  const fmt=n=>'$'+Math.round(n).toLocaleString('es-CO');
  const tG=(D.gastos||[]).reduce((s,x)=>s+(x.monto||0),0);
  const tI=(D.ingresos||[]).reduce((s,x)=>s+(x.monto||0),0);
  const tM=(D.mercado||[]).reduce((s,x)=>s+(x.total||0),0);
  const tS=(D.servicios||[]).reduce((s,x)=>s+(x.monto||0),0);
  const tD=(D.deudas||[]).reduce((s,x)=>s+(x.monto||0),0);
  const bal=tI-tG-tS;
  const balColor=bal>=0?'#A5D6A7':'#EF9A9A';

  // Header
  const hdr=document.createElement('div');
  hdr.style.cssText='background:var(--bg2);padding:14px 16px;display:flex;align-items:center;gap:12px;border-bottom:1px solid var(--border);flex-shrink:0;';
  hdr.innerHTML='<button id="v-close" style="background:var(--bg3);border:none;color:var(--text);border-radius:8px;padding:8px 12px;cursor:pointer;font-size:13px">✕</button>'+
    '<span style="font-size:15px;font-weight:700;color:var(--text);flex:1">📊 Datos — '+mes+'</span>'+
    '<span style="font-size:11px;color:var(--muted)">👤 '+(_USUARIO||'Usuario')+'</span>';
  modal.appendChild(hdr);

  // Scroll area
  const body=document.createElement('div');
  body.style.cssText='flex:1;overflow-y:auto;padding:14px;-webkit-overflow-scrolling:touch;';

  // Balance card
  body.innerHTML+='<div style="background:linear-gradient(135deg,var(--p4),var(--p2));border-radius:14px;padding:18px;margin-bottom:14px">'+
    '<div style="font-size:11px;color:rgba(255,255,255,.7);text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px">Balance del mes</div>'+
    '<div style="font-size:28px;font-weight:800;color:'+balColor+';margin-bottom:4px">'+fmt(bal)+'</div>'+
    '<div style="font-size:11px;color:rgba(255,255,255,.6)">'+(bal>=0?'✅ Positivo':'⚠️ Negativo')+'</div>'+
    '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-top:14px">'+
    '<div style="background:rgba(255,255,255,.12);border-radius:8px;padding:8px;text-align:center"><div style="font-size:9px;color:rgba(255,255,255,.6)">Ingresos</div><div style="font-size:13px;font-weight:700;color:#A5D6A7">'+fmt(tI)+'</div></div>'+
    '<div style="background:rgba(255,255,255,.12);border-radius:8px;padding:8px;text-align:center"><div style="font-size:9px;color:rgba(255,255,255,.6)">Gastos</div><div style="font-size:13px;font-weight:700;color:#EF9A9A">'+fmt(tG)+'</div></div>'+
    '<div style="background:rgba(255,255,255,.12);border-radius:8px;padding:8px;text-align:center"><div style="font-size:9px;color:rgba(255,255,255,.6)">Mercado</div><div style="font-size:13px;font-weight:700;color:#90CAF9">'+fmt(tM)+'</div></div>'+
    '</div></div>';

  // PDF section
  function secTitle(t){ return '<div style="font-size:11px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.5px;margin:14px 0 8px">'+t+'</div>'; }
  function grid(){ return '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:4px">'; }
  function btn(ico,label,sub,onclick,border){
    return '<button onclick="'+onclick+'" style="background:var(--card);border:1px solid '+(border||'var(--border2)')+';border-radius:12px;padding:12px 8px;color:var(--text);cursor:pointer;text-align:center;font-size:12px;font-weight:600;width:100%">'+
      '<div style="font-size:22px;margin-bottom:5px">'+ico+'</div>'+label+
      '<div style="font-size:10px;color:var(--muted);margin-top:3px">'+sub+'</div></button>';
  }

  body.innerHTML+=secTitle('📄 Abrir como PDF');
  body.innerHTML+=grid()+
    btn('🛒','Mercado','PDF + QR',"xPDFMercado()")+
    btn('💸','Gastos','PDF + QR',"xPDFs('gastos')")+
    btn('💰','Ingresos','PDF + QR',"xPDFs('ingresos')")+
    btn('💡','Servicios','PDF + QR',"xPDFs('servicios')")+
    btn('🔴','Deudas','PDF + QR',"xPDFs('deudas')")+
    btn('🚗','Movilidad','PDF + QR',"xPDFs('movilidad')")+
    btn('🏷️','Precios','PDF comparativo',"xPDFPrecios()")+
    btn('💳','Tarjetas','PDF + QR',"xPDFs('tarjetas')")+
    btn('🐾','Mascotas','PDF + QR',"xPDFs('mascotas')")+
    btn('🔧','Mantenimiento','PDF + QR',"xPDFs('mantenimiento')")+
  '</div>';

  body.innerHTML+=secTitle('📊 Descargar Excel');
  const excelKeys=[['🛒','Mercado','mercado'],['💸','Gastos','gastos'],['💰','Ingresos','ingresos'],
    ['💡','Servicios','servicios'],['🚗','Movilidad','movilidad'],['🔴','Deudas','deudas'],
    ['🐾','Mascotas','mascotas'],['🎉','Ocio','ocio'],['🏪','C.Comercial','centrocomercial']];
  body.innerHTML+=grid()+excelKeys.map(function(x){
    return btn(x[0],x[1],'Excel',"xExcel('"+x[2]+"')",'rgba(34,197,94,.25)');
  }).join('')+'</div>';

  body.innerHTML+=secTitle('📱 Compartir WhatsApp');
  const waKeys=[['🛒','Mercado','mercado'],['💸','Gastos','gastos'],['💰','Ingresos','ingresos'],['💡','Servicios','servicios']];
  body.innerHTML+=grid()+waKeys.map(function(x){
    return btn(x[0],x[1],'WhatsApp',"xWA('"+x[2]+"')",'rgba(37,211,102,.3)');
  }).join('')+'</div><div style="height:20px"></div>';

  modal.appendChild(body);
  document.body.appendChild(modal);
  document.getElementById('v-close').addEventListener('click',function(){modal.remove();});
}


function renderAll(){
  try{initQ();}catch(e){}
  try{rM();}catch(e){}
  try{rServ();}catch(e){}
  try{rMascotas();}catch(e){}
  try{rPres();}catch(e){}
  try{rMov();}catch(e){}
  try{rTarjetas();}catch(e){}
  try{rDeudas();}catch(e){}
  try{rFNA();}catch(e){}
  try{if(typeof rEnseres==='function')rEnseres();}catch(e){}
  try{if(typeof rRecordatorios==='function')rRecordatorios();}catch(e){}
  try{if(typeof rCC==='function')rCC();}catch(e){}
  try{rT('gastos','gt',['fecha','desc','cat','monto','nota'],'gtot','monto','red');}catch(e){}
  try{rT('ingresos','ivt',['fecha','fuente','tipo','monto','nota'],'ivtot','monto','green');}catch(e){}
  try{rT('mantenimiento','mantt',['fecha','tipo','desc','monto','nota'],'manttot','monto','teal');}catch(e){}
  try{rT('ocio','oct',['fecha','actividad','cat','monto','nota'],'octot','monto','pink');}catch(e){}
  try{upd();}catch(e){}
  try{if(typeof rPrecios==='function')rPrecios();}catch(e){}
}

// ── EXPORTAR PDF MERCADO ──────────────────────
function xPDFMercado(){
  const mes=getMes();
  const porTienda={};
  D.mercado.forEach(c=>{const t=c.tienda||'Sin tienda';if(!porTienda[t])porTienda[t]=[];porTienda[t].push(c);});
  const gs={};D.mercado.forEach(c=>{const g=getCG(c.cat);if(!gs[g])gs[g]=[];gs[g].push(c);});
  let rows='';let gran=0;
  for(const[tienda,tItems]of Object.entries(porTienda)){
    const totT=tItems.reduce((s,x)=>s+(x.total||0),0);gran+=totT;
    rows+=`<tr style="background:#0D47A1"><td colspan="5" style="padding:8px 10px;font-weight:700;font-size:12px;color:#fff">🏪 ${tienda}</td></tr>`;
    const gT={};tItems.forEach(c=>{const g=getCG(c.cat);if(!gT[g])gT[g]=[];gT[g].push(c);});
    for(const[g,items]of Object.entries(gT)){
      rows+=`<tr class="gh"><td colspan="5">${g}</td></tr>`;
      items.forEach(it=>rows+=`<tr><td>${it.fecha?it.fecha.split('-').reverse().join('/'):'—'}</td><td>${it.item}</td><td>${it.cantidad}${it.unidad?' '+it.unidad:''}</td><td>$${Math.round(it.precio).toLocaleString('es-CO')}</td><td>$${Math.round(it.total).toLocaleString('es-CO')}</td></tr>`);
    }
    rows+=`<tr class="st2"><td colspan="3" style="text-align:right">Subtotal ${tienda}:</td><td colspan="2">$${Math.round(totT).toLocaleString('es-CO')}</td></tr>`;
  }
  const qrItems=D.mercado.slice(0,25).map(d=>`${d.item}~${d.precio}~${d.cat}~${d.cantidad}~${d.tienda||''}`).join('||');
  const qrText='GHQR|'+mes+'|mercado|'+qrItems;
  const qrShort=qrText.length>600?qrText.substring(0,600):qrText;
  const html=`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Mercado ${mes}</title>
  <style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:Arial,sans-serif;color:#111;font-size:12px}
  .cover{background:linear-gradient(135deg,#0D47A1,#1565C0);color:#fff;padding:20px 24px;display:flex;flex-direction:row;align-items:flex-start;justify-content:space-between;gap:16px;min-height:130px}
  .ci{flex:1;min-width:0}.ci h1{font-size:18px;color:#90CAF9;margin-bottom:3px}.ci .mes{font-size:15px;color:#A5D6A7;font-weight:700}.ci .sub{font-size:10px;color:rgba(255,255,255,.65)}
  .stats{display:flex;gap:8px;margin-top:10px;flex-wrap:wrap}.stat{background:rgba(255,255,255,.15);border-radius:6px;padding:6px 12px;text-align:center}.stat-l{font-size:8px;opacity:.75;text-transform:uppercase;margin-bottom:2px}.stat-v{font-size:14px;font-weight:700}
  .qr-wrap{flex-shrink:0;width:130px;text-align:center}.qr-wrap img{width:120px;height:120px;display:block;margin:0 auto;background:#fff;padding:4px;border-radius:6px}.qr-wrap p{font-size:8px;color:rgba(255,255,255,.8);margin-top:4px;font-weight:700}
  .body{padding:16px 20px}
  .instruc{background:#E3F2FD;border-left:3px solid #1565C0;padding:8px 12px;border-radius:4px;font-size:10px;color:#1565C0;margin-bottom:12px}
  table{width:100%;border-collapse:collapse;font-size:11px}
  th{background:#0D47A1;color:#fff;padding:6px 8px;text-align:left;font-size:9px;text-transform:uppercase}
  td{padding:5px 8px;border-bottom:1px solid #E3F2FD}
  tr.gh td{background:#E8F4FD;color:#0D47A1;font-weight:700;padding:6px 8px}
  tr.st2 td{background:#FFFBEB;font-weight:700;color:#92400E;font-size:10px}
  .totbox{background:linear-gradient(135deg,#0D47A1,#1565C0);color:#fff;padding:12px 16px;border-radius:8px;display:flex;justify-content:space-between;align-items:center;margin-top:10px}
  .foot{text-align:center;font-size:8px;color:#aaa;margin-top:10px;padding-top:8px;border-top:1px solid #eee}
  @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}</style>
  </head><body>
  <div class="cover">
    <div class="ci"><h1>🏠 Lista de Mercado</h1><div class="mes">${mes}</div><div class="sub">Gestor del Hogar · Valledupar, Cesar</div>
    <div class="stats"><div class="stat"><div class="stat-l">Productos</div><div class="stat-v">${D.mercado.length}</div></div><div class="stat"><div class="stat-l">Tiendas</div><div class="stat-v">${Object.keys(porTienda).length}</div></div><div class="stat"><div class="stat-l">Total</div><div class="stat-v">$${Math.round(gran).toLocaleString('es-CO')}</div></div></div>
    </div>
    <div class="qr-wrap"><img id="qr-img" src="" alt="QR"/><p>📷 Escanear para importar</p></div>
  </div>
  <div class="body">
    <div class="instruc">📷 <b>¿Cómo usar el QR?</b> Abre el Gestor del Hogar → Lista de Mercado → botón <b>📷 QR</b> → apunta al código.</div>
    <table><thead><tr><th>Fecha</th><th>Producto</th><th>Cant.</th><th>P.Unit</th><th>Total</th></tr></thead>
    <tbody>${rows||'<tr><td colspan="5" style="text-align:center;padding:14px;color:#999">Sin productos</td></tr>'}</tbody></table>
    <div class="totbox"><span style="font-size:11px;opacity:.8">TOTAL LISTA DE MERCADO</span><span style="font-size:17px;font-weight:700;color:#A5D6A7">$${Math.round(gran).toLocaleString('es-CO')}</span></div>
    <div class="foot">Generado: ${new Date().toLocaleDateString('es-CO')} · Gestor del Hogar Valledupar</div>
  </div>
  <script>
    (function(){
      var d=${JSON.stringify(qrShort)};
      var img=document.getElementById('qr-img');
      img.src='https://api.qrserver.com/v1/create-qr-code/?size=120x120&ecc=M&color=0D47A1&bgcolor=ffffff&data='+encodeURIComponent(d);
      img.onload=function(){setTimeout(function(){window.print();},500);};
      img.onerror=function(){
        img.style.display='none';
        var div=document.createElement('div');
        div.style.cssText='width:120px;height:120px;background:#E8F4FD;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:9px;color:#1565C0;text-align:center;padding:6px;margin:0 auto';
        div.textContent='QR no disponible sin internet';
        img.parentNode.insertBefore(div,img);
        setTimeout(function(){window.print();},300);
      };
    })();
  <\/script>
  </body></html>`;
  const w=window.open('','_blank');
  if(w){w.document.write(html);w.document.close();}else{toast('⚠️ Permite ventanas emergentes');}
}

// ── PDF GENÉRICO ──────────────────────────────
function xPDFs(key){
  const mes=getMes();
  const tit={gastos:'💸 Gastos',servicios:'💡 Servicios Públicos',ingresos:'💰 Ingresos',
    mantenimiento:'🔧 Mantenimiento',ocio:'🎉 Ocio',mascotas:'🐾 Mascotas',
    centrocomercial:'🏪 Centro Comercial',tarjetas:'💳 Tarjetas',movilidad:'🚗 Movilidad',
    deudas:'🔴 Deudas',fna:'🏦 FNA',enseres:'🪑 Enseres',recordatorios:'🔔 Recordatorios'};
  const colores={gastos:'#DC2626',servicios:'#D97706',ingresos:'#16A34A',mantenimiento:'#0D9488',
    ocio:'#DB2777',mascotas:'#7C3AED',centrocomercial:'#D97706',tarjetas:'#1D4ED8',
    movilidad:'#1D4ED8',deudas:'#DC2626',recordatorios:'#D97706'};
  const arr=key==='tarjetas'?D.gastosTarjeta:(D[key]||[]);
  const color=colores[key]||'#1565C0';
  const titulo=tit[key]||key;
  let rows='';
  arr.forEach(r=>{
    const fecha=(r.fecha||'').split('-').reverse().join('/')||'—';
    const monto=r.monto||r.total||r.costo||r.precio||0;
    const desc=r.desc||r.articulo||r.actividad||r.nombre||r.titulo||r.tipo||r.fuente||'—';
    const cat=r.cat||r.tipo||r.especie||r.vehiculo||'—';
    const nota=r.nota||r.empresa||r.placa||'—';
    rows+=`<tr><td>${fecha}</td><td style="font-weight:600">${desc}</td><td>${cat}</td><td style="color:${color};font-weight:700;text-align:right">$${Math.round(monto).toLocaleString('es-CO')}</td><td style="font-size:10px;color:#666">${nota}</td></tr>`;
  });
  const total=arr.reduce((s,x)=>s+(x.monto||x.total||x.costo||0),0);
  const qrItems=arr.slice(0,20).map(r=>{
    const d=r.desc||r.articulo||r.actividad||r.titulo||r.nombre||r.tipo||'';
    return d+'~'+(r.monto||r.total||0)+'~'+(r.cat||r.tipo||'');
  }).join('||');
  const qrText='GHQR|'+mes+'|'+key+'|'+qrItems;
  const qrShort=qrText.length>600?qrText.substring(0,600):qrText;
  const qrColor=color.replace('#','');
  const html=`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${titulo} ${mes}</title>
  <style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:Arial,sans-serif;color:#111;font-size:12px}
  .cover{background:linear-gradient(135deg,${color},${color}bb);color:#fff;padding:18px 22px;display:flex;flex-direction:row;align-items:flex-start;justify-content:space-between;gap:14px;min-height:110px}
  .ci{flex:1;min-width:0}.ci h1{font-size:16px;margin-bottom:3px}.ci .mes{font-size:13px;font-weight:700;opacity:.9}.ci .sub{font-size:9px;opacity:.65}
  .stats{display:flex;gap:8px;margin-top:8px}.stat{background:rgba(255,255,255,.15);border-radius:5px;padding:5px 10px;text-align:center}.stat-l{font-size:8px;opacity:.75;text-transform:uppercase}.stat-v{font-size:13px;font-weight:700}
  .qr-wrap{flex-shrink:0;width:110px;text-align:center}.qr-wrap img{width:100px;height:100px;display:block;margin:0 auto;background:#fff;padding:3px;border-radius:5px}.qr-wrap p{font-size:7px;color:rgba(255,255,255,.8);margin-top:3px;font-weight:700}
  .body{padding:14px 18px}
  table{width:100%;border-collapse:collapse;font-size:11px}
  th{background:${color};color:#fff;padding:6px 8px;text-align:left;font-size:9px;text-transform:uppercase}
  td{padding:5px 8px;border-bottom:1px solid #f0f0f0}tr:nth-child(even)td{background:#fafafa}
  .totbox{background:${color};color:#fff;padding:10px 14px;border-radius:7px;display:flex;justify-content:space-between;align-items:center;margin-top:10px}
  .foot{text-align:center;font-size:8px;color:#aaa;margin-top:10px;padding-top:8px;border-top:1px solid #eee}
  @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}</style>
  </head><body>
  <div class="cover">
    <div class="ci"><h1>${titulo}</h1><div class="mes">${mes}</div><div class="sub">Gestor del Hogar · Valledupar, Cesar</div>
    <div class="stats"><div class="stat"><div class="stat-l">Registros</div><div class="stat-v">${arr.length}</div></div><div class="stat"><div class="stat-l">Total</div><div class="stat-v">$${Math.round(total).toLocaleString('es-CO')}</div></div></div></div>
    <div class="qr-wrap"><img id="qr-img" src="" alt="QR"/><p>📷 Importar en app</p></div>
  </div>
  <div class="body">
    <table><thead><tr><th>Fecha</th><th>Descripción</th><th>Categoría</th><th>Monto</th><th>Nota</th></tr></thead>
    <tbody>${rows||`<tr><td colspan="5" style="text-align:center;padding:14px;color:#999">Sin registros en ${mes}</td></tr>`}</tbody></table>
    <div class="totbox"><span style="font-size:11px;opacity:.8">TOTAL ${titulo.toUpperCase()}</span><span style="font-size:16px;font-weight:700">$${Math.round(total).toLocaleString('es-CO')}</span></div>
    <div class="foot">Generado: ${new Date().toLocaleDateString('es-CO')} · Gestor del Hogar Valledupar</div>
  </div>
  <script>
    (function(){
      var d=${JSON.stringify(qrShort)};
      var img=document.getElementById('qr-img');
      img.src='https://api.qrserver.com/v1/create-qr-code/?size=100x100&ecc=M&color=${qrColor}&bgcolor=ffffff&data='+encodeURIComponent(d);
      img.onload=function(){setTimeout(function(){window.print();},500);};
      img.onerror=function(){img.style.display='none';setTimeout(function(){window.print();},300);};
    })();
  <\/script>
  </body></html>`;
  const w=window.open('','_blank');
  if(w){w.document.write(html);w.document.close();}else{toast('⚠️ Permite ventanas emergentes');}
}

// ── EXCEL ─────────────────────────────────────
function xExcel(key){
  const mes=getMes();let arr=[];
  if(key==='mercado')arr=D.mercado.map(c=>({Tienda:c.tienda||'',Fecha:c.fecha?c.fecha.split('-').reverse().join('/'):'',Grupo:getCG(c.cat),Categoría:c.cat,Producto:c.item,Cantidad:c.cantidad,Unidad:c.unidad||'',PrecioUnit:c.precio,Total:c.total,Nota:c.nota||''}));
  else if(key==='tarjetas')arr=D.gastosTarjeta;
  else arr=D[key];
  if(!arr.length){toast('⚠️ Sin datos');return;}
  const h=Object.keys(arr[0]);
  const rows=[h.join('\t'),...arr.map(r=>h.map(k=>r[k]??'').join('\t'))].join('\n');
  const blob=new Blob(['\uFEFF'+rows],{type:'text/tab-separated-values;charset=utf-8'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);
  a.download=key+'_'+mes.replace(' ','_')+'.xls';a.click();
  toast('✅ Excel descargado');
}

// ── WHATSAPP ──────────────────────────────────
function xWA(key){
  const mes=getMes();let txt='🏠 *Gestor del Hogar — '+mes+'*\n\n';
  const arr=key==='mercado'?D.mercado:key==='tarjetas'?D.gastosTarjeta:(D[key]||[]);
  if(key==='mercado'){
    const pT={};arr.forEach(c=>{const t=c.tienda||'Sin tienda';if(!pT[t])pT[t]=[];pT[t].push(c);});
    for(const[t,items]of Object.entries(pT)){
      txt+='🏪 *'+t+'*\n';
      const gs={};items.forEach(c=>{const g=getCG(c.cat);if(!gs[g])gs[g]=[];gs[g].push(c);});
      for(const[g,gi]of Object.entries(gs)){txt+='  *'+g+'*\n';gi.forEach(it=>txt+='    • '+it.item+' x'+it.cantidad+' = $'+Math.round(it.total).toLocaleString('es-CO')+'\n');}
      txt+='  _Sub '+t+': $'+Math.round(items.reduce((s,x)=>s+x.total,0)).toLocaleString('es-CO')+'_\n\n';
    }
    txt+='*TOTAL: $'+Math.round(arr.reduce((s,x)=>s+x.total,0)).toLocaleString('es-CO')+'*';
  }else{
    arr.forEach(r=>txt+=Object.entries(r).filter(([k])=>!['pagado','id','tcId','devuelto','notif'].includes(k)).map(([k,v])=>typeof v==='number'?k+': $'+Math.round(v).toLocaleString('es-CO'):k+': '+(v||'—')).join(' · ')+'\n');
  }
  window.open('https://wa.me/?text='+encodeURIComponent(txt),'_blank');
}

// ── MONTO TOTAL ───────────────────────────────
function dividirQuincenas(val){
  const total=parseFloat(val)||0;
  if(!total){document.getElementById('mt-preview').style.display='none';return;}
  const mitad=Math.round(total/2);
  const resto=total-mitad;
  const {neto:n1}=calcDesc(mitad);
  const {neto:n2}=calcDesc(resto);
  document.getElementById('mt-preview').style.display='block';
  document.getElementById('mt-q1').textContent=fmt(mitad)+' → neto '+fmt(n1);
  document.getElementById('mt-q2').textContent=fmt(resto)+' → neto '+fmt(n2);
  document.getElementById('mt-neto').textContent=fmt(n1+n2);
  // Actualizar los campos de quincena en tiempo real
  document.getElementById('q1i').value=mitad;
  document.getElementById('q2i').value=resto;
}

function guardarMontoTotal(){
  const total=parseFloat(document.getElementById('monto-total').value)||0;
  if(!total){toast('⚠️ Ingresa el monto total');return;}
  const v1=Math.round(total/2);
  const v2=total-v1;
  Q.montoTotal=total;
  const dia=new Date().getDate();
  const esQ1=dia>=1&&dia<=15;
  const esQ2=dia>=16;

  // Siempre guardar los valores en Q
  const{neto:n1}=calcDesc(v1);
  Q.q1=v1; Q.q1neto=n1;
  document.getElementById('q1i').value=v1;
  document.getElementById('q1v').textContent=fmt(n1);
  renderDesc(1,v1);

  const{neto:n2}=calcDesc(v2);
  Q.q2=v2; Q.q2neto=n2;
  document.getElementById('q2i').value=v2;
  document.getElementById('q2v').textContent=fmt(n2);
  renderDesc(2,v2);

  // Bloquear solo la quincena del período activo
  if(esQ1){
    Q.q1guardada=true;
    document.getElementById('q1i').disabled=true;
    document.getElementById('q1b').disabled=true;
    document.getElementById('q1l').textContent='✅ Guardada';
    document.getElementById('q1l').className='qlk lo';
    // Q2 sigue bloqueada hasta el día 16
    document.getElementById('q2i').disabled=true;
    document.getElementById('q2b').disabled=true;
    document.getElementById('q2l').textContent='🔒 Se activa el día 16';
    document.getElementById('q2l').className='qlk lc';
    toast('✅ Q1 guardada · Q2 se activa el día 16');
  } else if(esQ2){
    Q.q2guardada=true;
    document.getElementById('q2i').disabled=true;
    document.getElementById('q2b').disabled=true;
    document.getElementById('q2l').textContent='✅ Guardada';
    document.getElementById('q2l').className='qlk lo';
    document.getElementById('q1i').disabled=true;
    document.getElementById('q1b').disabled=true;
    document.getElementById('q1l').textContent='✅ Guardada';
    document.getElementById('q1l').className='qlk lo';
    toast('✅ Ambas quincenas guardadas');
  }
  save();upd();
}

// ── FNA ───────────────────────────────────────
let fnaCalAnio=new Date().getFullYear();
let fnaCalMesActual=new Date().getMonth();
const MESES=['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const DIAS_CORTOS=['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];

function guardarCreditoFNA(){
  const c={
    nom:document.getElementById('fna-nom').value.trim(),
    num:document.getElementById('fna-num').value.trim(),
    total:parseFloat(document.getElementById('fna-total').value)||0,
    cuota:parseFloat(document.getElementById('fna-cuota').value)||0,
    inicio:document.getElementById('fna-inicio').value,
    vctoDia:parseInt(document.getElementById('fna-vcto-dia').value)||5,
    tasa:parseFloat(document.getElementById('fna-tasa').value)||0,
    plazo:parseInt(document.getElementById('fna-plazo').value)||0,
    nota:document.getElementById('fna-nota-cred').value.trim()
  };
  if(!c.total||!c.cuota){toast('⚠️ Completa valor total y cuota');return;}
  D.fnaCredito=[c];
  save();rFNA();toast('✅ Crédito FNA guardado');
}

function registrarPagoFNA(){
  const fecha=document.getElementById('fna-p-fecha').value;
  const monto=parseFloat(document.getElementById('fna-p-monto').value)||0;
  const tipo=document.getElementById('fna-p-tipo').value;
  const ref=document.getElementById('fna-p-ref').value.trim();
  const nota=document.getElementById('fna-p-nota').value.trim();
  if(!fecha||!monto){toast('⚠️ Fecha y monto son requeridos');return;}
  D.fna.push({fecha,monto,tipo,ref,nota});
  ['fna-p-monto','fna-p-ref','fna-p-nota'].forEach(id=>document.getElementById(id).value='');
  save();rFNA();toast('✅ Pago FNA registrado');
}

function delPagoFNA(i){D.fna.splice(i,1);save();rFNA();toast('🗑️ Pago eliminado');}

function rFNA(){
  const c=D.fnaCredito[0]||{};
  const totalPagado=D.fna.reduce((s,x)=>s+x.monto,0);
  const saldo=Math.max(0,(c.total||0)-totalPagado);

  document.getElementById('fna-saldo').textContent=fmt(saldo);
  document.getElementById('fna-pagado').textContent=fmt(totalPagado);
  document.getElementById('fna-cuota-disp').textContent=c.cuota?fmt(c.cuota):'$0';

  // Próximo vencimiento
  const hoy=new Date();
  if(c.vctoDia){
    let prox=new Date(hoy.getFullYear(),hoy.getMonth(),c.vctoDia);
    if(prox<=hoy)prox=new Date(hoy.getFullYear(),hoy.getMonth()+1,c.vctoDia);
    const diff=Math.ceil((prox-hoy)/(1000*60*60*24));
    document.getElementById('fna-prox').textContent=`${c.vctoDia}/${prox.getMonth()+1} (${diff}d)`;
  }

  // Historial
  document.getElementById('fna-hist').innerHTML=D.fna.slice().reverse().map((p,ri)=>{
    const i=D.fna.length-1-ri;
    return`<tr>
      <td class="fc">${ff(p.fecha)}</td>
      <td style="color:var(--green);font-weight:600">${fmt(p.monto)}</td>
      <td>${p.tipo}</td>
      <td class="nc">${p.ref||'—'}</td>
      <td class="nc">${p.nota||'—'}</td>
      <td><button class="bdel" onclick="delPagoFNA(${i})">✕</button></td>
    </tr>`;
  }).join('')||'<tr><td colspan="6" style="text-align:center;color:var(--muted);padding:14px">Sin pagos registrados</td></tr>';
  document.getElementById('fna-hist-tot').textContent=fmt(totalPagado);

  // Llenar form si hay datos
  if(c.nom){
    ['nom','num','tasa','plazo'].forEach(k=>{const el=document.getElementById('fna-'+k);if(el&&c[k])el.value=c[k];});
    if(c.total)document.getElementById('fna-total').value=c.total;
    if(c.cuota)document.getElementById('fna-cuota').value=c.cuota;
    if(c.inicio)document.getElementById('fna-inicio').value=c.inicio;
    if(c.vctoDia)document.getElementById('fna-vcto-dia').value=c.vctoDia;
    if(c.nota)document.getElementById('fna-nota-cred').value=c.nota;
  }

  rFNACal();
}

function fnaCalMes(delta){
  fnaCalMesActual+=delta;
  if(fnaCalMesActual>11){fnaCalMesActual=0;fnaCalAnio++;}
  if(fnaCalMesActual<0){fnaCalMesActual=11;fnaCalAnio--;}
  rFNACal();
}

function rFNACal(){
  const c=D.fnaCredito[0]||{};
  const vctoDia=c.vctoDia||5;
  const hoy=new Date();
  const anio=fnaCalAnio, mes=fnaCalMesActual;

  document.getElementById('fna-cal-titulo').textContent=`${MESES[mes]} ${anio}`;

  const primerDia=new Date(anio,mes,1).getDay();
  const diasMes=new Date(anio,mes+1,0).getDate();

  // Pagos de este mes
  const pagosEsteMes=D.fna.filter(p=>{
    if(!p.fecha)return false;
    const d=new Date(p.fecha);
    return d.getFullYear()===anio&&d.getMonth()===mes;
  });
  const diasPagados=new Set(pagosEsteMes.map(p=>new Date(p.fecha).getDate()));

  let html='';
  // Cabecera días
  DIAS_CORTOS.forEach(d=>{html+=`<div style="font-size:9px;color:var(--muted);padding:3px 0;font-weight:600">${d}</div>`;});
  // Espacios vacíos iniciales
  for(let i=0;i<primerDia;i++)html+='<div></div>';

  for(let d=1;d<=diasMes;d++){
    const esHoy=d===hoy.getDate()&&mes===hoy.getMonth()&&anio===hoy.getFullYear();
    const esVcto=d===vctoDia;
    const pagado=diasPagados.has(d);
    const esPasado=new Date(anio,mes,d)<hoy;
    const vencidoSinPagar=esVcto&&esPasado&&!pagado;

    let bg='transparent',color='var(--text)',border='none',fw='400';
    if(pagado){bg='rgba(52,201,143,.25)';color='var(--green)';fw='700';}
    else if(vencidoSinPagar){bg='rgba(240,82,82,.25)';color='var(--red)';fw='700';}
    else if(esVcto&&!esPasado){bg='rgba(245,166,35,.25)';color='var(--amber)';fw='700';}
    if(esHoy)border='2px solid var(--accent)';

    html+=`<div style="background:${bg};color:${color};border:${border};border-radius:5px;padding:4px 2px;font-size:11px;font-weight:${fw};cursor:default;position:relative">
      ${d}${esVcto?'<div style="font-size:7px;color:inherit;line-height:1">FNA</div>':''}
    </div>`;
  }
  document.getElementById('fna-cal').innerHTML=html;
}


let deferredPrompt=null;
window.addEventListener('beforeinstallprompt',e=>{
  e.preventDefault();deferredPrompt=e;
  const banner=document.getElementById('install-banner');
  banner.classList.remove('hidden');
  document.getElementById('app').style.paddingTop='calc(var(--safe-top) + 52px)';
});
document.getElementById('install-btn').addEventListener('click',async()=>{
  if(!deferredPrompt)return;
  deferredPrompt.prompt();
  const{outcome}=await deferredPrompt.userChoice;
  deferredPrompt=null;
  document.getElementById('install-banner').classList.add('hidden');
  document.getElementById('app').style.paddingTop='var(--safe-top)';
  if(outcome==='accepted')toast('✅ App instalada correctamente');
});
window.addEventListener('appinstalled',()=>{
  document.getElementById('install-banner').classList.add('hidden');
  toast('✅ Gestor del Hogar instalado');
});

// ── SERVICE WORKER ────────────────────────────
if('serviceWorker' in navigator){
  navigator.serviceWorker.register('./sw.js').then(()=>console.log('SW registrado')).catch(console.error);
}

// Guardar al cerrar la app
window.addEventListener('beforeunload',()=>save());
window.addEventListener('pagehide',()=>save());
window.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')save();});

// ── INIT ──────────────────────────────────────

let _tiendaActiva = 'Plaza de Mercado';
let _filtroMercadoCat = '';
let _mercSearch = '';
let tiendaActual = 'Plaza de Mercado';

const TIENDAS_COORDS = {
  'Plaza de Mercado':'10.4796,-73.2519','D1':'10.4801,-73.2534','Ara':'10.4789,-73.2545',
  'Éxito':'10.4812,-73.2498','Jumbo':'10.4823,-73.2467','Olímpica':'10.4778,-73.2556',
  'Mi Futuro':'10.4790,-73.2560','Alkosto':'10.4834,-73.2489','Carulla':'10.4798,-73.2512',
  'Surtimax':'10.4756,-73.2578','Don Campo':'10.4770,-73.2570','Tienda de barrio':''
};

function selTiendaTab(el){
  document.querySelectorAll('.tienda-tab').forEach(b=>b.classList.remove('active'));
  el.classList.add('active');
  _tiendaActiva=el.dataset.tienda;
  tiendaActual=_tiendaActiva;
  const lbl=document.getElementById('tienda-activa-label');if(lbl)lbl.textContent=_tiendaActiva;
  const btn=document.getElementById('btn-tienda-nombre');if(btn)btn.textContent=_tiendaActiva;
  rM();_actualizarContadorTienda();
}

function filtrarMercadoCat(cat,el){
  _filtroMercadoCat=cat;
  document.querySelectorAll('#merc-chips .chip').forEach(c=>c.classList.remove('active'));
  el.classList.add('active');
  rM();
}

function buscarEnMercado(q){
  _mercSearch=q.toLowerCase().trim();
  rM();
}

function _actualizarContadorTienda(){
  const items=D.mercado.filter(x=>(x.tienda||'Sin tienda')===_tiendaActiva);
  const total=items.reduce((s,x)=>s+(x.total||0),0);
  const cnt=document.getElementById('tienda-activa-count');
  if(cnt)cnt.textContent=items.length>0?' · '+items.length+' prod · $'+Math.round(total).toLocaleString('es-CO'):'';
}

function _mostrarResumenTiendas(){
  const por={};
  D.mercado.forEach(x=>{const t=x.tienda||'Sin tienda';if(!por[t])por[t]={items:0,total:0};por[t].items++;por[t].total+=(x.total||0);});
  const el=document.getElementById('resumen-tiendas');
  const content=document.getElementById('resumen-tiendas-content');
  if(!el||!content)return;
  const entries=Object.entries(por).sort((a,b)=>b[1].total-a[1].total);
  if(!entries.length){el.style.display='none';return;}
  el.style.display='block';
  content.innerHTML=entries.map(([t,v])=>`<div style="display:flex;justify-content:space-between;align-items:center;padding:5px 0;border-bottom:1px solid var(--border);font-size:12px"><span style="font-weight:600">${t}</span><span style="color:var(--muted)">${v.items} prod</span><span style="color:var(--green);font-weight:700">$${Math.round(v.total).toLocaleString('es-CO')}</span></div>`).join('');
}

function selTienda(el,nom){
  tiendaActual=nom;
  document.querySelectorAll('.tienda-btn').forEach(b=>b.classList.remove('sel'));
  el.classList.add('sel');
}

function abrirEnMaps(){
  const coords=TIENDAS_COORDS[tiendaActual||_tiendaActiva]||'';
  const url=coords?'https://maps.google.com/?q='+coords+'&zoom=17':'https://maps.google.com/?q='+encodeURIComponent((tiendaActual||_tiendaActiva)+' Valledupar Colombia');
  window.open(url,'_blank');
}

function filtrarSelectPrecios(query){
  const sel=document.getElementById('pr-producto');if(!sel)return;
  const q=query.toLowerCase().trim();
  if(!q){Array.from(sel.options).forEach(o=>{o.style.display='';});Array.from(sel.querySelectorAll('optgroup')).forEach(g=>{g.style.display='';});return;}
  let first=null;
  Array.from(sel.querySelectorAll('optgroup')).forEach(grp=>{
    let has=false;
    Array.from(grp.querySelectorAll('option')).forEach(opt=>{
      const m=opt.text.toLowerCase().includes(q);opt.style.display=m?'':'none';
      if(m){has=true;if(!first)first=opt;}
    });
    grp.style.display=has?'':'none';
  });
  if(first)sel.value=first.value||first.text;
}

// ════════════════════════════════════════════════════════
// ENSERES DEL HOGAR
// ════════════════════════════════════════════════════════
const ENSER_ICONOS={
  'Martillo':'🔨','Destornillador':'🪛','Llave inglesa':'🔧','Alicate / Pinza':'🔧',
  'Taladro':'🪚','Sierra':'🪚','Nivel':'📏','Escalera':'🪜','Pala':'⛏️','Manguera':'🪣',
  'Silla plástica':'🪑','Silla de madera':'🪑','Mesa plástica':'🪑','Sofá / Mueble':'🛋️',
  'Cama':'🛏️','Colchón':'🛏️','Armario':'🗄️','Estante':'📚',
  'Olla grande':'🫕','Olla mediana':'🫕','Sartén':'🍳','Caldero':'🫕',
  'Cuchillo de cocina':'🔪','Taza / Pocillo':'☕','Plato':'🍽️','Vaso':'🥛',
  'Porta / Recipiente':'📦','Tupperware':'📦','Licuadora':'🫙',
  'Blusa dama':'👗','Vestido':'👗','Camisa caballero':'👔','Camiseta caballero':'👕',
  'Jean caballero':'👖','Tenis / Sneakers':'👟','Zapatos de vestir':'👞',
  'Sandalias':'👡','Botas':'👢','Chanclas':'🩴',
  'Escoba':'🧹','Trapero':'🧹','Balde':'🪣',
  'Televisor':'📺','Computador / Portátil':'💻','Celular':'📱','Parlante':'🔊',
};

const ENSER_CAT_MAP={
  herramienta:['Martillo','Destornillador','Llave','Alicate','Taladro','Sierra','Nivel','Escalera','Pala','Manguera'],
  mueble:['Silla','Mesa','Sofá','Cama','Colchón','Armario','Estante'],
  cocina:['Olla','Sartén','Caldero','Cuchillo','Taza','Plato','Vaso','Cucharón','Colador','Porta','Tupperware','Licuadora'],
  ropa:['Blusa','Pantalón','Vestido','Falda','Conjunto','Ropa interior','Pijama','Chaqueta','Camisa','Camiseta','Jean','Traje'],
  zapatos:['Tenis','Zapatos','Sandalias','Botas','Chanclas'],
  limpieza:['Escoba','Trapero','Balde','Recogedor','Cepillo'],
  electronico:['Televisor','Computador','Portátil','Tablet','Celular','Parlante','Cámara','Audífonos'],
};

let filtroEnseres='todos';

function filtrarEnseres(f,el){
  filtroEnseres=f;
  document.querySelectorAll('#sec-enseres .chip').forEach(c=>c.classList.remove('active'));
  el.classList.add('active');rEnseres();
}

function addEnser(){
  const nom=document.getElementById('en-nom').value.trim();
  const cat=document.getElementById('en-cat').value;
  const cantidad=parseInt(document.getElementById('en-cantidad').value)||1;
  const nota=document.getElementById('en-nota').value.trim();
  if(!nom&&!cat){toast('⚠️ Agrega el nombre del ítem');return;}
  const nombre=nom||cat.replace(/^[^\w\s]+\s*/,'');
  D.enseres=D.enseres||[];
  D.enseres.push({nombre,cat,cantidad,nota,disponible:cantidad,id:Date.now()});
  ['en-nom','en-nota'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('en-cantidad').value='1';
  save();rEnseres();toast('✅ '+nombre+' agregado');
}

function addPrestamo(){
  D.enseres=D.enseres||[];D.prestamos=D.prestamos||[];
  const itemId=document.getElementById('prest-item').value;
  if(!itemId){toast('⚠️ Selecciona un ítem');return;}
  const cant=parseInt(document.getElementById('prest-cant').value)||1;
  const relacion=document.getElementById('prest-relacion').value;
  const nombre=document.getElementById('prest-nombre').value.trim();
  const fecha=document.getElementById('prest-fecha').value;
  const nota=document.getElementById('prest-nota').value.trim();
  if(!nombre){toast('⚠️ Ingresa el nombre de la persona');return;}
  if(relacion==='— Relación —'){toast('⚠️ Selecciona la relación');return;}
  const enser=D.enseres.find(e=>String(e.id)===String(itemId));
  if(!enser){toast('⚠️ Ítem no encontrado');return;}
  if(enser.disponible<cant){toast('⚠️ Solo hay '+enser.disponible+' disponible(s)');return;}
  enser.disponible-=cant;
  D.prestamos.push({itemId:String(enser.id),itemNom:enser.nombre,cant,relacion,nombre,fecha,nota,devuelto:false,id:Date.now()});
  ['prest-nombre','prest-nota'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('prest-cant').value='1';
  save();rEnseres();toast('📤 Prestado a '+nombre);
}

function devolverPrestamo(i){
  D.prestamos=D.prestamos||[];
  const p=D.prestamos[i];if(!p)return;
  const e=(D.enseres||[]).find(e=>String(e.id)===String(p.itemId));
  if(e)e.disponible+=p.cant;
  D.prestamos[i].devuelto=true;
  save();rEnseres();toast('✅ Devuelto: '+p.itemNom);
}

function delPrestamo(i){
  D.prestamos=D.prestamos||[];
  const p=D.prestamos[i];
  if(p&&!p.devuelto){const e=(D.enseres||[]).find(e=>String(e.id)===String(p.itemId));if(e)e.disponible+=p.cant;}
  D.prestamos.splice(i,1);save();rEnseres();
}

function delEnser(id){
  D.enseres=D.enseres||[];
  const idx=D.enseres.findIndex(e=>String(e.id)===String(id));
  if(idx>-1)D.enseres.splice(idx,1);
  D.prestamos=(D.prestamos||[]).filter(p=>String(p.itemId)!==String(id));
  save();rEnseres();toast('🗑️ Eliminado');
}

function rEnseres(){
  D.enseres=D.enseres||[];D.prestamos=D.prestamos||[];
  const sel=document.getElementById('prest-item');
  if(sel)sel.innerHTML='<option value="">— Selecciona ítem a prestar —</option>'+D.enseres.filter(e=>e.disponible>0).map(e=>`<option value="${e.id}">${e.nombre} (${e.disponible} disp.)</option>`).join('');
  let items=D.enseres;
  if(filtroEnseres==='prestado')items=D.enseres.filter(e=>e.disponible<e.cantidad);
  else if(filtroEnseres!=='todos'){
    const keys=ENSER_CAT_MAP[filtroEnseres]||[];
    items=D.enseres.filter(e=>keys.some(k=>e.nombre.includes(k)||e.cat.includes(k)));
  }
  const grid=document.getElementById('enseres-grid');
  if(!grid)return;
  if(!items.length){grid.innerHTML='<div style="color:var(--muted);font-size:12px;grid-column:1/-1;text-align:center;padding:20px">Sin ítems</div>';return;}
  grid.innerHTML=items.map(e=>{
    const ico=ENSER_ICONOS[e.nombre]||ENSER_ICONOS[e.cat]||'📦';
    const prestado=e.disponible<e.cantidad;
    return `<div class="enser-item ${prestado?'prestado':'disponible'}">
      <div class="enser-ico">${ico}</div>
      <div class="enser-nom">${e.nombre.length>14?e.nombre.substring(0,13)+'…':e.nombre}</div>
      <div class="enser-estado" style="color:${prestado?'var(--amber)':'var(--green)'}">${prestado?(e.cantidad-e.disponible)+' prestado':'Disponible'}</div>
      <div style="font-size:9px;color:var(--muted)">x${e.cantidad}</div>
      <button class="bdel" style="margin-top:4px;font-size:10px;padding:2px 5px" onclick="delEnser(${e.id})">✕</button>
    </div>`;
  }).join('');
  const activos=D.prestamos.filter(p=>!p.devuelto);
  const cnt=document.getElementById('prest-count');if(cnt)cnt.textContent=activos.length>0?'('+activos.length+')':'';
  const tbody=document.getElementById('prestamos-tabla');
  if(!tbody)return;
  tbody.innerHTML=activos.map(p=>{
    const ri=D.prestamos.indexOf(p);
    return `<tr><td style="font-weight:600">${p.itemNom}</td><td>${p.cant}</td><td style="font-weight:600">${p.nombre}</td><td class="nc">${p.relacion}</td><td class="fc">${p.fecha?p.fecha.split('-').reverse().join('/'):'—'}</td><td class="nc">${p.nota||'—'}</td><td><span class="badge ba" style="cursor:pointer" onclick="devolverPrestamo(${ri})">↩ Devolver</span></td><td><button class="bdel" onclick="delPrestamo(${ri})">✕</button></td></tr>`;
  }).join('')||'<tr><td colspan="8" style="text-align:center;color:var(--muted);padding:14px">Sin préstamos activos ✅</td></tr>';
}

// ════════════════════════════════════════════════════════
// RECORDATORIOS
// ════════════════════════════════════════════════════════
function rRecordatorios(){
  D.recordatorios=D.recordatorios||[];
  const el=document.getElementById('recordatorios-list');if(!el)return;
  const hoy=new Date();hoy.setHours(0,0,0,0);
  const sorted=[...D.recordatorios].sort((a,b)=>{
    if(!a.fecha&&!b.fecha)return 0;if(!a.fecha)return 1;if(!b.fecha)return -1;
    return new Date(a.fecha)-new Date(b.fecha);
  });
  if(!sorted.length){el.innerHTML='<div style="text-align:center;color:var(--muted);padding:24px;font-size:13px">Sin recordatorios. Agrega uno arriba.</div>';return;}
  el.innerHTML=sorted.map(r=>{
    const i=D.recordatorios.indexOf(r);
    const fr=r.fecha?new Date(r.fecha+'T00:00:00'):null;
    const vencido=fr&&fr<hoy&&!r.completado;
    const esHoy=fr&&fr.toDateString()===hoy.toDateString()&&!r.completado;
    const col=r.completado?'var(--green)':vencido?'var(--red)':esHoy?'var(--amber)':'var(--p3)';
    return `<div style="background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:13px;margin-bottom:8px;border-left:3px solid ${col}">
      <div style="display:flex;justify-content:space-between;align-items:flex-start">
        <div style="flex:1;min-width:0">
          <div style="font-weight:700;font-size:13px;${r.completado?'text-decoration:line-through;opacity:.6':''}">${r.cat} ${r.titulo}</div>
          ${r.fecha?`<div style="font-size:11px;color:${col};margin-top:3px">📅 ${r.fecha.split('-').reverse().join('/')}${r.hora?' · ⏰ '+r.hora:''}${r.notif&&r.hora?' · 🔔':''} ${vencido?'· ⚠️ VENCIDO':esHoy?'· 🔴 HOY':''}</div>`:''}
          ${r.nota?`<div style="font-size:11px;color:var(--muted);margin-top:2px">${r.nota}</div>`:''}
        </div>
        <div style="display:flex;gap:6px;margin-left:10px;flex-shrink:0;align-items:center">
          <span class="badge ${r.completado?'bg2':'bb'}" style="cursor:pointer" onclick="tgRec(${i})">${r.completado?'✓ Listo':(r.notif&&r.hora?'🔔 Alerta':'Pdte')}</span>
          <button class="bdel" onclick="delRec(${i})">✕</button>
        </div>
      </div>
    </div>`;
  }).join('');
}


function addRecordatorio(){
  const titulo=document.getElementById('rec-titulo').value.trim();
  const cat=document.getElementById('rec-cat').value;
  const fecha=document.getElementById('rec-fecha').value;
  const hora=document.getElementById('rec-hora').value;
  const nota=document.getElementById('rec-nota').value.trim();
  const notif=document.getElementById('rec-notif')?.checked||false;
  if(!titulo){toast('⚠️ Ingresa el título');return;}
  const rec={titulo,cat,fecha,hora,nota,notif,completado:false,id:Date.now()};
  const guardar=()=>{
    D.recordatorios=D.recordatorios||[];
    D.recordatorios.push(rec);
    ['rec-titulo','rec-nota'].forEach(id=>{const e=document.getElementById(id);if(e)e.value='';});
    const cb=document.getElementById('rec-notif');if(cb)cb.checked=false;
    save();rRecordatorios();
    if(rec.notif&&rec.hora&&rec.fecha){
      const ms=new Date(rec.fecha+'T'+rec.hora+':00')-new Date();
      if(ms>0){programarNotificacion(rec);toast('🔔 Alerta en '+Math.round(ms/60000)+' min');}
      else toast('🔔 Recordatorio guardado');
    }else toast('🔔 Recordatorio guardado');
  };
  if(notif&&hora&&fecha) pedirPermisoNotificacion().then(ok=>{rec.notif=ok;guardar();});
  else guardar();
}

function delRec(i){
  D.recordatorios=D.recordatorios||[];
  const rc=D.recordatorios[i];
  if(rc&&typeof cancelarNotificacion==='function') cancelarNotificacion(rc.id);
  D.recordatorios.splice(i,1);
  save();rRecordatorios();
}
function tgRec(i){
  D.recordatorios=D.recordatorios||[];
  if(D.recordatorios[i])D.recordatorios[i].completado=!D.recordatorios[i].completado;
  save();rRecordatorios();
}

// ════════════════════════════════════════════════════════
// NOTIFICACIONES
// ════════════════════════════════════════════════════════
let _notifPermission=false;
let _notifTimers=[];

async function pedirPermisoNotificacion(){
  if(!('Notification' in window)){toast('⚠️ Sin soporte de notificaciones');return false;}
  if(Notification.permission==='granted'){_notifPermission=true;return true;}
  if(Notification.permission==='denied'){toast('⚠️ Notificaciones bloqueadas en Ajustes');return false;}
  const perm=await Notification.requestPermission();
  _notifPermission=perm==='granted';
  if(_notifPermission)toast('✅ Notificaciones activadas');
  else toast('⚠️ Permiso denegado');
  return _notifPermission;
}

function programarNotificacion(rec){
  if(!rec.fecha||!rec.hora||!rec.notif)return;
  const ms=new Date(rec.fecha+'T'+rec.hora+':00')-new Date();
  if(ms<=0)return;
  const timer=setTimeout(async()=>{
    if(!_notifPermission)await pedirPermisoNotificacion();
    if(_notifPermission){
      try{
        const n=new Notification('🔔 Recordatorio — Gestor del Hogar',{
          body:rec.cat+' '+rec.titulo+(rec.nota?'\n'+rec.nota:''),
          icon:'./icons/icon-192.png',tag:'rec-'+rec.id,requireInteraction:true
        });
        n.onclick=()=>{window.focus();n.close();};
      }catch(e){}
    }
    toast('🔔 '+rec.titulo);
  },ms);
  _notifTimers.push({id:rec.id,timer});
}

function cancelarNotificacion(id){
  const idx=_notifTimers.findIndex(t=>t.id===id);
  if(idx>=0){clearTimeout(_notifTimers[idx].timer);_notifTimers.splice(idx,1);}
}

function reprogramarTodasNotificaciones(){
  _notifTimers.forEach(t=>clearTimeout(t.timer));_notifTimers=[];
  (D.recordatorios||[]).forEach(rec=>{
    if(!rec.completado&&rec.notif&&rec.hora&&rec.fecha)programarNotificacion(rec);
  });
}

// ════════════════════════════════════════════════════════
// CENTRO COMERCIAL — rCC con tienda column
// ════════════════════════════════════════════════════════
function rCC(){
  const c='var(--amber)';
  const tbody=document.getElementById('cct');if(!tbody)return;
  tbody.innerHTML=D.centrocomercial.map((r,i)=>`<tr>
    <td class="fc">${r.fecha?r.fecha.split('-').reverse().join('/'):'—'}</td>
    <td style="font-weight:600">${r.articulo||'—'}</td>
    <td class="nc">${r.cat||'—'}</td>
    <td style="color:${c};font-weight:700">$${Math.round(r.monto||0).toLocaleString('es-CO')}</td>
    <td class="nc">${r.tienda||r.nota||'—'}</td>
    <td class="nc">${r.nota||'—'}</td>
    <td><button class="bdel" onclick="delCC(${i})">✕</button></td>
  </tr>`).join('')||'<tr><td colspan="7" style="text-align:center;color:var(--muted);padding:14px">Sin registros</td></tr>';
  const tot=document.getElementById('cctot');if(tot)tot.textContent='$'+Math.round(D.centrocomercial.reduce((s,x)=>s+(x.monto||0),0)).toLocaleString('es-CO');
}
function delCC(i){D.centrocomercial.splice(i,1);save();rCC();upd();}

function addCC(){
  const d=document.getElementById('ccd').value.trim();
  const c=document.getElementById('ccc').value;
  const m=parseFloat(document.getElementById('ccm').value)||0;
  const f=document.getElementById('ccf').value;
  const tiendaEl=document.getElementById('cc-tienda');
  const tienda=tiendaEl&&tiendaEl.value!=='— Tienda —'?tiendaEl.value:'';
  const n=document.getElementById('ccn').value.trim();
  if(!d||!m){toast('⚠️ Completa artículo y precio');return;}
  D.centrocomercial.push({articulo:d,cat:c,monto:m,fecha:f,tienda,nota:n});
  ['ccd','ccm','ccn'].forEach(id=>document.getElementById(id).value='');
  if(tiendaEl)tiendaEl.value='— Tienda —';
  save();rCC();upd();toast('✅ '+d+' registrado');
}

// ════════════════════════════════════════════════════════
// QR — GENERACIÓN Y ESCANEO
// ════════════════════════════════════════════════════════
function buildQRData(seccion,datos){
  const mes=getMes();let items=[];
  if(seccion==='mercado')items=datos.map(d=>[d.item,d.precio,d.cat,d.cantidad,d.tienda||''].join('~'));
  else items=datos.map(d=>[(d.desc||d.articulo||d.actividad||d.titulo||d.nombre||''),(d.monto||d.total||0),(d.cat||'')].join('~'));
  return 'GHQR|'+mes+'|'+seccion+'|'+items.join('||');
}

function cargarQRLib(){
  return new Promise((ok,err)=>{
    if(window.QRCode){ok();return;}
    const s=document.createElement('script');
    s.src='https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
    s.onload=ok;s.onerror=()=>{window.QRCode={_fallback:true};ok();};
    document.head.appendChild(s);
  });
}

function cargarJsQR(){
  return new Promise((ok,err)=>{
    if(window.jsQR){ok();return;}
    const s=document.createElement('script');
    s.src='https://cdnjs.cloudflare.com/ajax/libs/jsQR/1.4.0/jsQR.min.js';
    s.onload=ok;s.onerror=()=>err(new Error('Sin conexión para cargar escáner'));
    document.head.appendChild(s);
  });
}

async function mostrarQR(seccion,datos,titulo){
  if(!datos||!datos.length){toast('⚠️ Sin datos para QR');return;}
  const qrData=buildQRData(seccion,datos);
  let modal=document.getElementById('qr-modal');if(modal)modal.remove();
  modal=document.createElement('div');modal.id='qr-modal';
  modal.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.88);z-index:500;display:flex;align-items:center;justify-content:center;padding:20px';
  modal.innerHTML=`<div style="background:#111827;border-radius:16px;padding:22px;max-width:360px;width:100%;text-align:center;border:1px solid rgba(255,255,255,.1)">
    <div style="font-size:18px;font-weight:700;color:#fff;margin-bottom:3px">${titulo}</div>
    <div style="font-size:11px;color:#7B8BA0;margin-bottom:14px">${getMes()} · ${datos.length} registro(s)</div>
    <div id="qr-canvas-wrap" style="background:#fff;border-radius:12px;padding:12px;display:inline-flex;align-items:center;justify-content:center;min-width:180px;min-height:180px;margin-bottom:12px"></div>
    <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">
      <button onclick="document.getElementById('qr-modal').remove()" style="background:#374151;color:#fff;border:none;border-radius:10px;padding:10px 18px;font-size:13px;cursor:pointer">✕ Cerrar</button>
      <button onclick="escanearDesdeQR()" style="background:linear-gradient(90deg,#1565C0,#42A5F5);color:#fff;border:none;border-radius:10px;padding:10px 18px;font-size:13px;font-weight:700;cursor:pointer">📷 Escanear QR</button>
    </div>
  </div>`;
  document.body.appendChild(modal);
  modal.addEventListener('click',e=>{if(e.target===modal)modal.remove();});
  const wrap=document.getElementById('qr-canvas-wrap');
  const img=document.createElement('img');
  img.style.cssText='width:180px;height:180px;border-radius:4px';
  img.src='https://api.qrserver.com/v1/create-qr-code/?size=180x180&ecc=M&data='+encodeURIComponent(qrData.substring(0,600));
  img.onerror=()=>{wrap.innerHTML='<div style="color:#EF4444;font-size:11px;padding:10px">Sin conexión para QR</div>';};
  wrap.appendChild(img);
}

function escanearDesdeQR(){
  const m=document.getElementById('qr-modal');if(m)m.remove();
  const scanModal=document.createElement('div');
  scanModal.id='qr-scan-modal';
  scanModal.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.92);z-index:500;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px;gap:10px';
  scanModal.innerHTML=`
    <div style="color:#fff;font-size:16px;font-weight:700">📷 Escanear QR del PDF</div>
    <div style="color:#7B8BA0;font-size:11px;text-align:center">Apunta al código QR impreso o en pantalla</div>
    <div style="position:relative;width:100%;max-width:280px">
      <video id="qr-video" style="width:100%;border-radius:12px;border:3px solid #42A5F5;display:block" autoplay playsinline muted></video>
      <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:60%;height:60%;border:2px solid rgba(66,165,245,.7);border-radius:4px;pointer-events:none"></div>
    </div>
    <canvas id="qr-scan-canvas" style="display:none"></canvas>
    <div id="qr-scan-result" style="color:#22C55E;font-size:12px;text-align:center;min-height:18px"></div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center">
      <button onclick="stopQRScan()" style="background:#374151;color:#fff;border:none;border-radius:10px;padding:10px 18px;font-size:13px;cursor:pointer">✕ Cancelar</button>
      <label style="background:linear-gradient(90deg,#1565C0,#42A5F5);color:#fff;border-radius:10px;padding:10px 18px;font-size:13px;font-weight:700;cursor:pointer;display:inline-block">
        📁 Subir foto del QR
        <input type="file" accept="image/*" style="display:none" onchange="leerQRDesdeImagen(this)"/>
      </label>
    </div>`;
  document.body.appendChild(scanModal);
  iniciarCamaraQR();
}

let _qrStream=null,_qrInterval=null,_barcodeReader=null;

async function iniciarCamaraQR(){
  const resEl=document.getElementById('qr-scan-result');
  try{
    _qrStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment',width:{ideal:1280},height:{ideal:720}}});
    const v=document.getElementById('qr-video');if(!v){stopQRScan();return;}
    v.srcObject=_qrStream;await v.play();
    if('BarcodeDetector' in window){
      try{
        _barcodeReader=new BarcodeDetector({formats:['qr_code']});
        if(resEl)resEl.innerHTML='<span style="color:var(--green)">✅ Escáner listo — apunta al QR</span>';
        _qrInterval=setInterval(async()=>{
          try{
            const v2=document.getElementById('qr-video');if(!v2||!_barcodeReader)return;
            const codes=await _barcodeReader.detect(v2);
            if(codes.length>0&&codes[0].rawValue.startsWith('GHQR|')){stopQRScan();procesarDatosQR(codes[0].rawValue);}
          }catch(e2){}
        },300);return;
      }catch(e){}
    }
    if(resEl)resEl.innerHTML='<span style="color:var(--amber)">⏳ Cargando escáner...</span>';
    try{
      await cargarJsQR();
      if(resEl)resEl.innerHTML='<span style="color:var(--green)">✅ Escáner listo — apunta al QR</span>';
      _qrInterval=setInterval(intentarDecodificarFrame,200);
    }catch(eL){
      if(resEl)resEl.innerHTML='<span style="color:var(--amber)">⚠️ Sin escáner. Usa "Subir foto del QR".</span>';
    }
  }catch(eCam){
    if(resEl)resEl.innerHTML='<span style="color:var(--amber)">⚠️ Sin cámara. Usa "Subir foto del QR".</span>';
  }
}

function intentarDecodificarFrame(){
  const v=document.getElementById('qr-video');const c=document.getElementById('qr-scan-canvas');
  if(!v||!c||!window.jsQR||v.readyState<2||v.videoWidth===0)return;
  c.width=v.videoWidth;c.height=v.videoHeight;
  const ctx=c.getContext('2d');ctx.drawImage(v,0,0);
  try{
    const img=ctx.getImageData(0,0,c.width,c.height);
    const code=jsQR(img.data,img.width,img.height,{inversionAttempts:'dontInvert'});
    if(code&&code.data&&code.data.startsWith('GHQR|')){stopQRScan();procesarDatosQR(code.data);}
  }catch(e){}
}

async function leerQRDesdeImagen(inp){
  const file=inp.files[0];if(!file)return;
  const res=document.getElementById('qr-scan-result');
  if(res)res.innerHTML='<span style="color:var(--amber)">🔍 Analizando...</span>';
  try{
    const bmp=await createImageBitmap(file);
    if('BarcodeDetector' in window){
      try{
        const bd=new BarcodeDetector({formats:['qr_code']});
        const codes=await bd.detect(bmp);
        if(codes.length>0&&codes[0].rawValue.startsWith('GHQR|')){stopQRScan();procesarDatosQR(codes[0].rawValue);return;}
      }catch(e){}
    }
    await cargarJsQR();
    const c=document.createElement('canvas');c.width=bmp.width;c.height=bmp.height;
    const ctx=c.getContext('2d');ctx.drawImage(bmp,0,0);
    const img=ctx.getImageData(0,0,c.width,c.height);
    const code=jsQR(img.data,img.width,img.height);
    if(code&&code.data&&code.data.startsWith('GHQR|')){stopQRScan();procesarDatosQR(code.data);}
    else if(res)res.innerHTML='<span style="color:var(--red)">⚠️ QR no reconocido. Verifica que sea de esta app.</span>';
  }catch(e){if(res)res.innerHTML='<span style="color:var(--red)">❌ '+e.message+'</span>';}
  inp.value='';
}

function stopQRScan(){
  if(_qrInterval){clearInterval(_qrInterval);_qrInterval=null;}
  if(_qrStream){_qrStream.getTracks().forEach(t=>t.stop());_qrStream=null;}
  _barcodeReader=null;
  const m=document.getElementById('qr-scan-modal');if(m)m.remove();
}

function procesarDatosQR(qrText){
  const partes=qrText.split('|');
  if(partes[0]!=='GHQR'||partes.length<4){toast('⚠️ QR no es de esta app');return;}
  const mesSrc=partes[1],seccion=partes[2];
  const rawItems=partes.slice(3).join('|').split('||');
  const hoy=fechaHoy();
  let importados=0;
  if(seccion==='mercado'){
    rawItems.forEach(raw=>{
      const [item,precio,cat,cantidad,tienda]=raw.split('~');if(!item)return;
      const p=parseFloat(precio)||0,q=parseInt(cantidad)||1;
      if(!D.mercado.find(m=>m.item===item&&m.cat===cat)){
        D.mercado.push({cat:cat||'Despensa',item,precio:p,cantidad:q,unidad:'',fecha:hoy,nota:'📦 QR',total:p*q,tienda:tienda||_tiendaActiva});importados++;
      }
    });
    save();rM();upd();
  }else if(seccion==='gastos'){
    rawItems.forEach(raw=>{const[desc,monto,cat]=raw.split('~');if(!desc)return;D.gastos.push({desc,monto:parseFloat(monto)||0,cat:cat||'Otros',fecha:hoy,nota:'📦 QR'});importados++;});
    save();rT('gastos','gt',['fecha','desc','cat','monto','nota'],'gtot','monto','red');upd();
  }else if(seccion==='servicios'){
    rawItems.forEach(raw=>{const[tipo,monto,empresa]=raw.split('~');if(!tipo)return;D.servicios.push({tipo,monto:parseFloat(monto)||0,empresa:empresa||'',fecha:hoy,nota:'📦 QR',pagado:false});importados++;});
    save();rServ();upd();
  }else if(seccion==='recordatorios'){
    rawItems.forEach(raw=>{const[titulo,fecha,cat]=raw.split('~');if(!titulo)return;D.recordatorios.push({titulo,fecha:fecha||hoy,cat:cat||'Otro',hora:'',nota:'📦 QR',completado:false,id:Date.now()+importados});importados++;});
    save();rRecordatorios();
  }else if(D[seccion]){
    rawItems.forEach(raw=>{const[desc,monto,cat]=raw.split('~');if(!desc)return;D[seccion].push({desc,monto:parseFloat(monto)||0,cat:cat||'Otros',fecha:hoy,nota:'📦 QR'});importados++;});
    save();renderAll();
  }
  const nombres={mercado:'Lista de Mercado',gastos:'Gastos',servicios:'Servicios Públicos',recordatorios:'Recordatorios'};
  const modal=document.createElement('div');
  modal.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.8);z-index:500;display:flex;align-items:center;justify-content:center;padding:20px';
  modal.innerHTML=`<div style="background:#111827;border-radius:16px;padding:26px;max-width:300px;width:100%;text-align:center;border:1px solid rgba(34,197,94,.3)">
    <div style="font-size:44px;margin-bottom:8px">✅</div>
    <div style="font-size:17px;font-weight:700;color:#22C55E;margin-bottom:5px">${importados} ítem(s) importado(s)</div>
    <div style="font-size:12px;color:#E8ECF4;margin-bottom:3px">→ ${nombres[seccion]||seccion}</div>
    <div style="font-size:10px;color:#7B8BA0;margin-bottom:16px">Origen: ${mesSrc}</div>
    <button onclick="this.closest('div[style]').remove()" style="background:linear-gradient(90deg,#1565C0,#42A5F5);color:#fff;border:none;border-radius:10px;padding:11px 22px;font-size:13px;font-weight:700;cursor:pointer">✓ Ver datos</button>
  </div>`;
  document.body.appendChild(modal);
  modal.addEventListener('click',e=>{if(e.target===modal)modal.remove();});
}

// ════════════════════════════════════════════════════════
// ESCÁNER IA UNIVERSAL
// ════════════════════════════════════════════════════════
function cargarTesseract(){
  return new Promise((ok,err)=>{
    if(window.Tesseract){ok();return;}
    const s=document.createElement('script');
    s.src='https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
    s.onload=ok;s.onerror=()=>err(new Error('Sin conexión para Tesseract'));
    document.head.appendChild(s);
  });
}

function abrirScannerIA(section){document.getElementById('scan-'+section).click();}

async function scannerIA(inp,section){
  const file=inp.files[0];if(!file)return;
  const resEl=document.getElementById('scan-'+section+'-res');
  if(!resEl)return;
  resEl.style.display='block';resEl.innerHTML='<span style="color:var(--amber)">⏳ Cargando IA...</span>';
  try{
    await cargarTesseract();
    resEl.innerHTML='<span style="color:var(--amber)">🔍 Leyendo imagen...</span>';
    const url=URL.createObjectURL(file);
    const r=await Tesseract.recognize(url,'spa+eng',{logger:m=>{if(m.status==='recognizing text'&&resEl)resEl.innerHTML=`<span style="color:var(--amber)">🔍 ${Math.round((m.progress||0)*100)}%</span>`;}});
    URL.revokeObjectURL(url);
    const txt=r.data.text||'';
    if(!txt.trim()){resEl.innerHTML='<span style="color:var(--amber)">⚠️ No se detectó texto.</span>';return;}
    procesarTextoIA(txt,section,resEl);
  }catch(e){resEl.innerHTML=`<span style="color:var(--red)">❌ ${e.message}</span>`;}
  inp.value='';
}

function procesarTextoIA(txt,section,resEl){
  const lineas=txt.split('\n').map(l=>l.trim()).filter(l=>l.length>1);
  const hoy=fechaHoy();
  function extraerMonto(t){const m=(t.match(/\$?\s*(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{0,2})?)/g)||[]).map(n=>parseInt(n.replace(/[$\s.,]/g,''))).filter(n=>n>=100&&n<=9999999);return m.length?Math.max(...m):0;}
  function extraerFecha(t){const m=t.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);if(!m)return hoy;let[,d,mo,a]=m;if(a.length===2)a='20'+a;return a+'-'+mo.padStart(2,'0')+'-'+d.padStart(2,'0');}
  const monto=extraerMonto(txt);const fecha=extraerFecha(txt);
  let html=`<div style="font-weight:700;color:var(--teal);margin-bottom:8px">✅ Texto detectado</div>`;
  const setVal=(id,v)=>{const el=document.getElementById(id);if(el&&!el.value)el.value=v;};
  if(section==='gastos'){const desc=lineas.slice(0,2).join(' ').substring(0,40)||'Gasto';setVal('gd',desc);setVal('gm',monto||'');setVal('gf',fecha);html+=`<div>📝 <b>${desc}</b></div><div>💵 $${monto.toLocaleString('es-CO')}</div>`;}
  else if(section==='servicios'){const t=txt.toLowerCase();let tipo='⚡ Afinia (antes Electricaribe)';if(t.includes('emdupar')||t.includes('acueducto'))tipo='💧 EMDUPAR (Aguas del Cesar)';else if(t.includes('gases'))tipo='🔥 Gases del Caribe';else if(t.includes('claro'))tipo='📡 Claro hogar';const sel=document.getElementById('st2');if(sel){const opt=Array.from(sel.options).find(o=>o.text===tipo);if(opt)sel.value=opt.value||opt.text;}setVal('sm2',monto||'');setVal('sf2',fecha);html+=`<div>💡 <b>${tipo}</b></div><div>💵 $${monto.toLocaleString('es-CO')}</div>`;}
  else if(section==='ingresos'){setVal('im',monto||'');setVal('ifd',fecha);const fuente=lineas.find(l=>l.length>3)||'Ingreso';setVal('if2',fuente.substring(0,30));html+=`<div>💰 <b>${fuente}</b></div><div>💵 $${monto.toLocaleString('es-CO')}</div>`;}
  else if(section==='movilidad'){const gl=txt.match(/(\d+[.,]?\d*)\s*(?:gal|galones?)/i);const gal=gl?parseFloat(gl[1]):0;setVal('mvmonto',monto||'');setVal('mvfecha',fecha);if(gal)setVal('mvgal',gal);html+=`<div>⛽ Movilidad${gal?' · '+gal+' gal':''}</div><div>💵 $${monto.toLocaleString('es-CO')}</div>`;}
  else if(section==='mantenimiento'){setVal('mm',monto||'');setVal('mfd',fecha);const desc=lineas.find(l=>l.length>3&&l.length<50)||'';setVal('md2',desc.substring(0,40));html+=`<div>🔧 <b>${desc||'Mantenimiento'}</b></div><div>💵 $${monto.toLocaleString('es-CO')}</div>`;}
  else if(section==='ocio'){setVal('om',monto||'');setVal('of',fecha);const act=lineas.find(l=>l.length>3&&l.length<40)||'Actividad';setVal('od',act.substring(0,35));html+=`<div>🎉 <b>${act}</b></div><div>💵 $${monto.toLocaleString('es-CO')}</div>`;}
  else if(section==='centrocomercial'){setVal('ccm',monto||'');setVal('ccf',fecha);const art=lineas.find(l=>l.length>3&&l.length<40)||'Artículo';setVal('ccd',art.substring(0,35));html+=`<div>🏪 <b>${art}</b></div><div>💵 $${monto.toLocaleString('es-CO')}</div>`;}
  else if(section==='mascotas'){setVal('manm',monto||'');setVal('manfd',fecha);html+=`<div>🐾 $${monto.toLocaleString('es-CO')}</div>`;}
  else if(section==='deudas'){setVal('dd-monto',monto||'');setVal('dd-fecha',fecha);const nom=lineas.find(l=>l.length>3&&l.length<30)||'';setVal('dd-nombre',nom.substring(0,30));html+=`<div>🔴 <b>${nom||'Deuda'}</b></div><div>💵 $${monto.toLocaleString('es-CO')}</div>`;}
  else if(section==='precios'){setVal('pr-precio',monto||'');const prod=lineas.find(l=>l.length>3&&!/^\$?\d/.test(l))||'';setVal('pr-nombre-libre',prod.substring(0,40));const ul=txt.toLowerCase();const um=txt.match(/\b(\d+\.?\d*)\s*(kg|lt|gr|ml|und|paq)/i);if(um)setVal('pr-unidad',um[0].trim());html+=`<div>🏷️ <b>${prod.substring(0,30)||'Producto'}</b></div><div>💵 $${monto.toLocaleString('es-CO')}</div>`;}
  html+=`<div style="margin-top:8px;font-size:10px;color:var(--muted)">Revisa y ajusta antes de guardar ↑</div>
  <button onclick="this.parentElement.style.display='none'" style="background:var(--bg2);border:1px solid var(--border);color:var(--muted);border-radius:6px;padding:4px 10px;font-size:11px;cursor:pointer;margin-top:6px">✕ Cerrar</button>`;
  resEl.innerHTML=html;
}

function abrirScannerPrecios(){document.getElementById('scan-precios').click();}

async function scannerPrecios(inp){
  const file=inp.files[0];if(!file)return;
  const resEl=document.getElementById('scan-precios-res');
  resEl.style.display='block';resEl.innerHTML='<span style="color:var(--amber)">⏳ Cargando IA...</span>';
  try{
    await cargarTesseract();
    resEl.innerHTML='<span style="color:var(--amber)">🔍 Analizando etiqueta...</span>';
    const url=URL.createObjectURL(file);
    const r=await Tesseract.recognize(url,'spa+eng',{logger:m=>{if(m.status==='recognizing text')resEl.innerHTML=`<span style="color:var(--amber)">🔍 ${Math.round((m.progress||0)*100)}%</span>`;}});
    URL.revokeObjectURL(url);
    procesarTextoIA(r.data.text||'','precios',resEl);
    if(parseFloat(document.getElementById('pr-precio')?.value||0)>0){
      resEl.innerHTML+='<button onclick="registrarPrecio()" style="background:linear-gradient(90deg,#D97706,#F59E0B);color:#000;border:none;border-radius:8px;padding:9px;font-size:13px;font-weight:700;cursor:pointer;width:100%;margin-top:8px">💾 Guardar precio</button>';
    }
  }catch(e){resEl.innerHTML=`<span style="color:var(--red)">❌ ${e.message}</span>`;}
  inp.value='';
}

// ════════════════════════════════════════════════════════
// PRECIOS DEL MERCADO
// ════════════════════════════════════════════════════════
const PRECIOS_KEY='ghv4_precios_global';

function cargarPrecios(){try{return JSON.parse(localStorage.getItem(PRECIOS_KEY)||'[]');}catch(e){return[];}}
function guardarPrecios(arr){try{localStorage.setItem(PRECIOS_KEY,JSON.stringify(arr));}catch(e){}}

function switchPreciosTab(tab,el){
  ['registrar','comparar','historial'].forEach(t=>{
    const e2=document.getElementById('precios-tab-'+t);if(e2)e2.style.display=t===tab?'block':'none';
  });
  document.querySelectorAll('#sec-precios .chip').forEach(c=>c.classList.remove('active'));
  if(el)el.classList.add('active');
  if(tab==='comparar')buscarProductoComparar(document.getElementById('comp-buscar')?.value||'');
  if(tab==='historial')renderHistorialPrecios();
  if(tab==='registrar')renderPreciosRecientes();
}

function registrarPrecio(){
  const selProd=document.getElementById('pr-producto').value;
  const libre=document.getElementById('pr-nombre-libre').value.trim();
  const producto=libre||selProd.replace(/^[^\w\s]+\s*/,'');
  const tienda=document.getElementById('pr-tienda').value;
  const precio=parseFloat(document.getElementById('pr-precio').value)||0;
  const unidad=document.getElementById('pr-unidad').value.trim();
  const fecha=document.getElementById('pr-fecha').value||fechaHoy();
  const nota=document.getElementById('pr-nota').value.trim();
  if(!producto){toast('⚠️ Escribe o selecciona el producto');return;}
  if(!precio){toast('⚠️ Ingresa el precio');return;}
  const arr=cargarPrecios();
  arr.push({id:Date.now(),producto,tienda,precio,unidad,fecha,nota,timestamp:Date.now()});
  guardarPrecios(arr);
  ['pr-nombre-libre','pr-precio','pr-unidad','pr-nota'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  renderPreciosRecientes();
  toast('✅ Precio guardado: '+producto+' en '+tienda);
  _actualizarPrecioEnMercado(producto.toLowerCase(),tienda,precio);
}

function _actualizarPrecioEnMercado(productoLow,tienda,precio){
  let n=0;
  D.mercado.forEach(item=>{
    if((item.tienda||'')===tienda&&(item.item||'').toLowerCase().includes(productoLow.split(' ')[0])){
      item.precio=precio;item.total=precio*(item.cantidad||1);n++;
    }
  });
  if(n>0){save();rM();toast('🔄 '+n+' ítem(s) actualizados en '+tienda);}
}

function delPrecio(id){
  const arr=cargarPrecios().filter(p=>p.id!==id);guardarPrecios(arr);
  renderPreciosRecientes();renderHistorialPrecios();toast('🗑️ Eliminado');
}

function renderPreciosRecientes(){
  const el=document.getElementById('precios-recientes');if(!el)return;
  const arr=cargarPrecios().slice().sort((a,b)=>b.timestamp-a.timestamp).slice(0,20);
  if(!arr.length){el.innerHTML='<div style="text-align:center;color:var(--muted);padding:20px;font-size:13px">Sin precios registrados.<br>Anota lo que ves en las tiendas 📝</div>';return;}
  el.innerHTML=`<div class="tbl-wrap"><table><thead><tr><th>Producto</th><th>Tienda</th><th>Precio</th><th>Por</th><th>Fecha</th><th></th></tr></thead><tbody>
  ${arr.map(p=>`<tr><td style="font-weight:600;max-width:120px;overflow:hidden;text-overflow:ellipsis">${p.producto}</td><td style="font-size:11px">${p.tienda}</td><td style="color:var(--green);font-weight:700">$${Math.round(p.precio).toLocaleString('es-CO')}</td><td class="nc">${p.unidad||'—'}</td><td class="fc">${p.fecha?p.fecha.split('-').reverse().join('/'):'—'}</td><td><button class="bdel" onclick="delPrecio(${p.id})">✕</button></td></tr>`).join('')}
  </tbody></table></div>`;
}

function buscarProductoComparar(query){
  const el=document.getElementById('comparador-resultado');if(!el)return;
  const arr=cargarPrecios();
  if(!arr.length){el.innerHTML='<div style="text-align:center;color:var(--muted);padding:20px;font-size:12px">Sin precios aún. Ve a 📝 Registrar precio y anota los precios de las tiendas. "📝 Registrar precio".</div>';return;}
  const q=query.toLowerCase().trim();
  const porProducto={};
  arr.forEach(p=>{
    if(q&&!p.producto.toLowerCase().includes(q))return;
    if(!porProducto[p.producto])porProducto[p.producto]=[];porProducto[p.producto].push(p);
  });
  if(!Object.keys(porProducto).length){el.innerHTML='<div style="text-align:center;color:var(--muted);padding:16px;font-size:12px">Sin productos con "'+query+'"</div>';return;}
  let html='';
  for(const[prod,precios]of Object.entries(porProducto)){
    const porTienda={};precios.forEach(p=>{if(!porTienda[p.tienda]||p.timestamp>porTienda[p.tienda].timestamp)porTienda[p.tienda]=p;});
    const lista=Object.values(porTienda).sort((a,b)=>a.precio-b.precio);
    const min=lista[0]?.precio||0,max=lista[lista.length-1]?.precio||0;
    const ahorro=max-min;
    html+=`<div class="card" style="margin-bottom:10px"><div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px"><div style="font-size:14px;font-weight:700">${prod}</div>${ahorro>0?`<div style="background:rgba(34,197,94,.12);color:var(--green);border-radius:8px;padding:3px 9px;font-size:11px;font-weight:700">Ahorro $${Math.round(ahorro).toLocaleString('es-CO')}</div>`:''}</div>`;
    lista.forEach((p,i)=>{
      const esMenor=i===0&&lista.length>1,esMayor=i===lista.length-1&&lista.length>1;
      const pct=max>0?Math.round(p.precio/max*100):100;
      const col=esMenor?'var(--green)':esMayor?'var(--red)':'var(--text)';
      html+=`<div style="margin-bottom:8px"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px"><div style="display:flex;align-items:center;gap:7px"><span style="font-size:12px;font-weight:600;color:${col}">${p.tienda}</span>${esMenor?'<span style="background:rgba(34,197,94,.12);color:var(--green);border-radius:10px;padding:1px 7px;font-size:10px;font-weight:700">✅ MÁS BARATO</span>':''}${esMayor&&lista.length>1?'<span style="background:rgba(239,68,68,.1);color:var(--red);border-radius:10px;padding:1px 7px;font-size:10px">MÁS CARO</span>':''}</div><span style="font-weight:700;color:${col};font-size:13px">$${Math.round(p.precio).toLocaleString('es-CO')}${p.unidad?' /'+p.unidad:''}</span></div><div class="pb"><div class="pf" style="width:${pct}%;background:${col}"></div></div><div style="font-size:9px;color:var(--muted);margin-top:2px">${p.fecha?p.fecha.split('-').reverse().join('/'):'—'}${p.nota?' · '+p.nota:''}</div></div>`;
    });
    html+='</div>';
  }
  el.innerHTML=html;
}

function renderHistorialPrecios(){
  const el=document.getElementById('historial-precios-tabla');if(!el)return;
  const tFil=document.getElementById('hist-tienda-fil')?.value||'';
  const pFil=(document.getElementById('hist-prod-fil')?.value||'').toLowerCase();
  let arr=cargarPrecios().slice().sort((a,b)=>b.timestamp-a.timestamp);
  if(tFil)arr=arr.filter(p=>p.tienda===tFil);
  if(pFil)arr=arr.filter(p=>p.producto.toLowerCase().includes(pFil));
  if(!arr.length){el.innerHTML='<div style="text-align:center;color:var(--muted);padding:20px;font-size:12px">Sin registros</div>';_renderChartPrecios([]);return;}
  el.innerHTML=`<div class="tbl-wrap"><table><thead><tr><th>Fecha</th><th>Producto</th><th>Tienda</th><th>Precio</th><th>Por</th><th>Nota</th><th></th></tr></thead><tbody>
  ${arr.map(p=>`<tr><td class="fc">${p.fecha?p.fecha.split('-').reverse().join('/'):'—'}</td><td style="font-weight:600">${p.producto}</td><td style="font-size:11px;color:var(--p3)">${p.tienda}</td><td style="color:var(--green);font-weight:700">$${Math.round(p.precio).toLocaleString('es-CO')}</td><td class="nc">${p.unidad||'—'}</td><td class="nc">${p.nota||'—'}</td><td><button class="bdel" onclick="delPrecio(${p.id})">✕</button></td></tr>`).join('')}
  </tbody></table></div>`;
  _renderChartPrecios(arr);
}

function _renderChartPrecios(arr){
  const cEl=document.getElementById('chart-precios');const bEl=document.getElementById('chart-precios-bars');
  if(!cEl||!bEl)return;
  if(!arr.length){cEl.style.display='none';return;}
  const por={};arr.forEach(p=>{if(!por[p.tienda])por[p.tienda]={sum:0,count:0};por[p.tienda].sum+=p.precio;por[p.tienda].count++;});
  const entries=Object.entries(por).map(([t,v])=>({t,avg:Math.round(v.sum/v.count)})).sort((a,b)=>a.avg-b.avg);
  if(entries.length<2){cEl.style.display='none';return;}
  cEl.style.display='block';
  const mx=Math.max(...entries.map(e=>e.avg));
  bEl.innerHTML=entries.map((e,i)=>{const col=i===0?'var(--green)':i===entries.length-1?'var(--red)':'var(--p3)';return`<div class="cr"><div class="cl" style="color:${col}">${e.t.substring(0,12)}</div><div class="cb"><div class="cf" style="width:${Math.round(e.avg/mx*100)}%;background:${col}"></div></div><div class="cv" style="color:${col};font-weight:600">$${e.avg.toLocaleString('es-CO')}</div></div>`;}).join('');
}

function xPDFPrecios(){
  const arr=cargarPrecios().slice().sort((a,b)=>b.timestamp-a.timestamp);
  if(!arr.length){toast('⚠️ Sin precios');return;}
  const porProd={};arr.forEach(p=>{if(!porProd[p.producto])porProd[p.producto]=[];porProd[p.producto].push(p);});
  let rows='';
  for(const[prod,precios]of Object.entries(porProd)){
    const pT={};precios.forEach(p=>{if(!pT[p.tienda]||p.timestamp>pT[p.tienda].timestamp)pT[p.tienda]=p;});
    const lista=Object.values(pT).sort((a,b)=>a.precio-b.precio);
    const min=lista[0],max=lista[lista.length-1];
    rows+=`<tr style="background:#E8F4FD"><td colspan="5" style="font-weight:700;padding:7px 10px;color:#0D47A1">${prod}</td></tr>`;
    lista.forEach((p,i)=>{const c=i===0&&lista.length>1?'#16A34A':'#DC2626';rows+=`<tr><td>${p.tienda}</td><td style="font-weight:700;color:${c}">$${Math.round(p.precio).toLocaleString('es-CO')}</td><td>${p.unidad||'—'}</td><td>${p.fecha?p.fecha.split('-').reverse().join('/'):'—'}</td><td>${p.nota||'—'}</td></tr>`;});
    if(lista.length>1)rows+=`<tr style="background:#FFFBEB"><td colspan="2" style="font-size:10px;color:#92400E">💡 Más barato: ${min.tienda} · Ahorro: $${Math.round(max.precio-min.precio).toLocaleString('es-CO')}</td><td colspan="3"></td></tr>`;
  }
  const html=`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Precios del Mercado</title><style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:Arial,sans-serif;font-size:12px}.cover{background:linear-gradient(135deg,#D97706,#F59E0B);color:#000;padding:20px 24px}h1{font-size:18px;margin-bottom:3px}.body{padding:14px 20px}table{width:100%;border-collapse:collapse}th{background:#D97706;color:#fff;padding:6px 8px;text-align:left;font-size:9px;text-transform:uppercase}td{padding:5px 8px;border-bottom:1px solid #FEF3C7;font-size:11px}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}</style></head><body><div class="cover"><h1>🏷️ Precios del Mercado</h1><div style="font-size:10px;opacity:.7">Gestor del Hogar · Valledupar · ${new Date().toLocaleDateString('es-CO')}</div></div><div class="body"><table><thead><tr><th>Tienda</th><th>Precio</th><th>Por</th><th>Fecha</th><th>Nota</th></tr></thead><tbody>${rows}</tbody></table></div><script>setTimeout(()=>window.print(),400);<\/script></body></html>`;
  const w=window.open('','_blank');if(w){w.document.write(html);w.document.close();}
}

function xWAPrecios(){
  const arr=cargarPrecios().slice().sort((a,b)=>b.timestamp-a.timestamp).slice(0,30);
  if(!arr.length){toast('⚠️ Sin precios');return;}
  let txt='🏷️ *Precios del Mercado*\n_Gestor del Hogar · Valledupar_\n\n';
  const pP={};arr.forEach(p=>{if(!pP[p.producto])pP[p.producto]=[];pP[p.producto].push(p);});
  for(const[prod,ps]of Object.entries(pP)){txt+='*'+prod+'*\n';ps.sort((a,b)=>a.precio-b.precio).forEach((p,i)=>txt+='  '+(i===0?'✅':'  ')+' '+p.tienda+': $'+Math.round(p.precio).toLocaleString('es-CO')+(p.unidad?' /'+p.unidad:'')+'\n');txt+='\n';}
  window.open('https://wa.me/?text='+encodeURIComponent(txt),'_blank');
}

function rPrecios(){renderPreciosRecientes();}

function autoFillPrecioFromHistory(){
  const prod=(document.getElementById('pr-nombre-libre')?.value.trim())||(document.getElementById('pr-producto')?.value||'');
  if(!prod)return;
  const tienda=document.getElementById('pr-tienda')?.value||'';
  const arr=cargarPrecios();const pl=prod.toLowerCase().split(' ')[0];
  const match=arr.find(p=>p.tienda===tienda&&p.producto.toLowerCase().includes(pl));
  if(match){const pe=document.getElementById('pr-precio');const ue=document.getElementById('pr-unidad');if(pe&&!pe.value)pe.value=match.precio;if(ue&&!ue.value)ue.value=match.unidad||'';toast('💡 Último precio: $'+Math.round(match.precio).toLocaleString('es-CO')+' en '+tienda);}
}

// ════════════════════════════════════════════════════════
// NAVIGATION & INIT
// ════════════════════════════════════════════════════════
const NAV_TITLES={
  inicio:'🏠 Inicio',mercado:'🛒 Lista de Mercado',gastos:'💸 Gastos',
  servicios:'💡 Servicios Públicos',ingresos:'💰 Ingresos',tarjetas:'💳 Tarjetas',
  deudas:'🔴 Deudas',fna:'🏦 FNA',mantenimiento:'🔧 Mantenimiento',
  enseres:'🪑 Enseres del Hogar',ocio:'🎉 Ocio',centrocomercial:'🏪 Centro Comercial',
  recordatorios:'🔔 Recordatorios',movilidad:'🚗 Movilidad',mascotas:'🐾 Mascotas',
  precios:'🏷️ Precios del Mercado'
};

function nav(sec,el){
  document.querySelectorAll('.sec').forEach(s=>s.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
  const s=document.getElementById('sec-'+sec);if(s)s.classList.add('active');
  el.classList.add('active');
  const c=document.getElementById('content');if(c)c.scrollTop=0;
  const t=NAV_TITLES[sec]||sec;
  const tb=document.getElementById('topbar-title');if(tb)tb.textContent=t;
  const dt=document.getElementById('desktop-title');if(dt)dt.textContent=t;
  closeDrawer();
}

function toggleDrawer(){
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('overlay').classList.toggle('open');
}
function closeDrawer(){
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('overlay').classList.remove('open');
}

function cambiarMes(){} // handled by listener in startApp

function guardarMes(){
  save();toast('💾 Guardado: '+getMes());
  const sel=document.getElementById('mesSelect');
  if(sel){const ma=getMes();Array.from(sel.options).forEach(o=>{const n=o.value.replace(/\s*✓\s*/g,'').trim();o.text=n+(n===ma?' ✓':'');});}
}

function actualizarMesSelect(){
  const dm=document.getElementById('desktop-mes');if(dm)dm.textContent=getMes();
}

// PWA
let _dPr=null;
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();_dPr=e;const b=document.getElementById('install-banner');if(b)b.classList.add('show');});
const _ib=document.getElementById('install-btn');
if(_ib)_ib.addEventListener('click',async()=>{if(!_dPr)return;_dPr.prompt();await _dPr.userChoice;_dPr=null;const b=document.getElementById('install-banner');if(b)b.classList.remove('show');});
if('serviceWorker' in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});
window.addEventListener('beforeunload',save);
window.addEventListener('pagehide',save);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')save();});


// ══════════════════════ MULTIUSUARIO ══════════════════════
function getUsuarios(){try{return JSON.parse(localStorage.getItem('ghv4_usuarios')||'[]');}catch(e){return[];}}
function guardarListaUsuarios(arr){try{localStorage.setItem('ghv4_usuarios',JSON.stringify(arr));}catch(e){}}

function mostrarSelectorUsuario(onSelect){
  const usuarios=getUsuarios();
  const old=document.getElementById('user-modal');if(old)old.remove();
  const modal=document.createElement('div');
  modal.id='user-modal';
  modal.style.cssText='position:fixed;top:0;left:0;right:0;bottom:0;z-index:9999;background:#0A0E1A;display:flex;align-items:center;justify-content:center;padding:20px;';
  const box=document.createElement('div');
  box.style.cssText='background:#111827;border-radius:20px;padding:24px;max-width:380px;width:100%;border:1px solid rgba(255,255,255,.12);';
  // Header
  const hdr=document.createElement('div');
  hdr.style.cssText='text-align:center;margin-bottom:20px;';
  hdr.innerHTML='<div style="font-size:44px;margin-bottom:8px">🏠</div><div style="font-size:19px;font-weight:800;color:#fff;">Gestor del Hogar</div><div style="font-size:12px;color:#7B8BA0;margin-top:4px;">Valledupar · Cesar 🇨🇴</div>';
  box.appendChild(hdr);
  // Existing users
  if(usuarios.length){
    const lbl=document.createElement('div');
    lbl.style.cssText='font-size:11px;color:#7B8BA0;font-weight:700;text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px;';
    lbl.textContent='Seleccionar usuario';
    box.appendChild(lbl);
    usuarios.forEach(function(u){
      const btn=document.createElement('button');
      btn.style.cssText='width:100%;background:#1C2333;border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:14px 16px;color:#E8ECF4;font-size:15px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:14px;margin-bottom:9px;text-align:left;';
      btn.innerHTML='<span style="font-size:26px">👤</span><span>'+u+'</span>';
      btn.addEventListener('click',function(){modal.remove();onSelect(u);});
      box.appendChild(btn);
    });
    const hr=document.createElement('hr');
    hr.style.cssText='border:none;border-top:1px solid rgba(255,255,255,.08);margin:14px 0;';
    box.appendChild(hr);
  }
  // New user
  const lbl2=document.createElement('div');
  lbl2.style.cssText='font-size:11px;color:#7B8BA0;font-weight:700;text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px;';
  lbl2.textContent=usuarios.length?'Agregar nuevo usuario':'Crea tu usuario para empezar';
  box.appendChild(lbl2);
  const row=document.createElement('div');row.style.cssText='display:flex;gap:8px;';
  const inp=document.createElement('input');
  inp.placeholder='Escribe tu nombre...';
  inp.style.cssText='flex:1;background:#1C2333;border:1px solid rgba(255,255,255,.15);color:#E8ECF4;border-radius:10px;padding:12px 14px;font-size:14px;outline:none;';
  const crBtn=document.createElement('button');
  crBtn.style.cssText='background:linear-gradient(90deg,#1565C0,#42A5F5);color:#fff;border:none;border-radius:10px;padding:12px 16px;font-size:14px;font-weight:700;cursor:pointer;white-space:nowrap;';
  crBtn.textContent='➕ Crear';
  function crear(){
    const nombre=inp.value.trim();
    if(nombre.length<2){inp.style.borderColor='#EF4444';inp.focus();return;}
    const lista=getUsuarios();
    if(!lista.includes(nombre)){lista.push(nombre);guardarListaUsuarios(lista);}
    modal.remove();onSelect(nombre);
  }
  crBtn.addEventListener('click',crear);
  inp.addEventListener('keydown',function(e){if(e.key==='Enter')crear();});
  row.appendChild(inp);row.appendChild(crBtn);
  box.appendChild(row);
  modal.appendChild(box);
  document.body.appendChild(modal);
  setTimeout(function(){inp.focus();},200);
}

function _setUsuario(nombre){
  _USUARIO=nombre;
  try{localStorage.setItem('ghv4_ultimo_usuario',nombre);}catch(e){}
  const city=document.querySelector('.sidebar-city');
  if(city)city.innerHTML='👤 '+nombre+' &nbsp;&middot;&nbsp; Valledupar 🇨🇴';
  // Update topbar chip
  const chip=document.getElementById('topbar-usuario');
  if(chip)chip.textContent='👤 '+nombre;
  if(!document.getElementById('btn-cambiar-usuario')){
    const hdrEl=document.querySelector('.sidebar-header');
    if(hdrEl){
      const btn=document.createElement('button');
      btn.id='btn-cambiar-usuario';
      btn.textContent='👥 Cambiar usuario';
      btn.style.cssText='background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.2);color:rgba(255,255,255,.85);border-radius:20px;padding:5px 13px;font-size:11px;cursor:pointer;margin-top:10px;width:100%;';
      btn.addEventListener('click',function(){
        closeDrawer();
        setTimeout(function(){
          mostrarSelectorUsuario(function(u){_setUsuario(u);save();renderAll();});
        },300);
      });
      hdrEl.appendChild(btn);
    }
  }
}
// ══════════════════════════════════════════════════

function cambiarUsuarioDesdeTopbar(){
  mostrarSelectorUsuario(function(u){
    _setUsuario(u);
    save();
    renderAll();
  });
}
function startApp(){
  closeDrawer();
  const ultimo=localStorage.getItem('ghv4_ultimo_usuario')||'';
  const usuarios=getUsuarios();
  if(ultimo && usuarios.includes(ultimo)){
    _setUsuario(ultimo);
    _iniciarApp();
  }else{
    mostrarSelectorUsuario(function(nombre){
      _setUsuario(nombre);
      _iniciarApp();
    });
  }
}

function _iniciarApp(){
  closeDrawer();
  const ahora = new Date();
  const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const mesHoy = MESES[ahora.getMonth()] + ' ' + ahora.getFullYear();
  _MES = mesHoy;
  const sel = document.getElementById('mesSelect');
  if(sel){
    let optExiste = Array.from(sel.options).some(o=>o.value===mesHoy);
    if(!optExiste){
      const no = document.createElement('option');
      no.value = mesHoy; no.text = mesHoy;
      sel.appendChild(no);
    }
    Array.from(sel.options).forEach(o=>{o.value=o.value.replace(/\s*✓\s*/g,'').trim();});
    sel.value = mesHoy;
    sel.addEventListener('change', function(){
      const nuevo = sel.value.replace(/\s*✓\s*/g,'').trim();
      if(!nuevo || nuevo===_MES) return;
      save(); _MES=nuevo; loadMes(nuevo); renderAll();
      const h = fechaHoy();
      document.querySelectorAll('input[type="date"]').forEach(e=>{if(!e.value)e.value=h;});
      toast('📅 '+nuevo);
    });
  }
  loadMes(mesHoy);
  renderAll();
  const today = fechaHoy();
  document.querySelectorAll('input[type="date"]').forEach(e=>{if(!e.value)e.value=today;});
  actualizarMesSelect();
  setInterval(save, 15000);
  setTimeout(reprogramarTodasNotificaciones, 600);
}

function _iniciarApp(){
  const ahora=new Date();
  const MESES=['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const mesHoy=MESES[ahora.getMonth()]+' '+ahora.getFullYear();
  _MES=mesHoy;
  const sel=document.getElementById('mesSelect');
  let optExiste=Array.from(sel.options).some(o=>o.value===mesHoy);
  if(!optExiste){const no=document.createElement('option');no.value=mesHoy;no.text=mesHoy;sel.appendChild(no);}
  Array.from(sel.options).forEach(o=>{o.value=o.value.replace(/\s*✓\s*/g,'').trim();});
  sel.value=mesHoy;
  sel.addEventListener('change',function(){
    const nuevo=sel.value.replace(/\s*✓\s*/g,'').trim();
    if(!nuevo||nuevo===_MES)return;
    save();_MES=nuevo;loadMes(nuevo);renderAll();
    const h=fechaHoy();
    document.querySelectorAll('input[type="date"]').forEach(e=>{if(!e.value)e.value=h;});
    toast('📅 '+nuevo);
  });
  loadMes(mesHoy);
  renderAll();
  const today=fechaHoy();
  document.querySelectorAll('input[type="date"]').forEach(e=>{if(!e.value)e.value=today;});
  actualizarMesSelect();
  setInterval(save,15000);
  setTimeout(reprogramarTodasNotificaciones,600);
}

startApp();
