/* ============================================================
   Little Star Course — Shared front-end helpers
   ============================================================ */

/* ---- CONFIG ------------------------------------------------
   After deploying Code.gs as a Web App, paste the /exec URL here.
   While SCRIPT_URL is empty, the portals run in DEMO MODE using
   the sample data below so you can preview the design.
------------------------------------------------------------- */
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxuH7x7w8tRuDH_U-tw7X8igt69Cr3BoyZzMiBicsMEv5xW7zQp6GHdM5TbAy3vjGBR/exec'; // Apps Script /exec URL (cadangan)

/* ---- SUPABASE (backend utama) ------------------------------
   Kalau URL & KEY terisi, seluruh portal otomatis pakai Supabase.
   Kosongkan keduanya untuk kembali ke Apps Script.
------------------------------------------------------------- */
const SUPABASE_URL = 'https://nmokhtraxndkxpljyjhm.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5tb2todHJheG5ka3hwbGp5amhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc5NzI5MzQsImV4cCI6MjEwMzU0ODkzNH0.KufXHC3Y3RL_oNZAz8RotmVzeBiLh1jPrxvehvfumnU';
const USE_SUPABASE = !!(SUPABASE_URL && SUPABASE_KEY);

const DEMO_MODE   = !USE_SUPABASE && !SCRIPT_URL;
const uid = () => (self.crypto&&crypto.randomUUID) ? crypto.randomUUID().replace(/-/g,'').slice(0,14)
                 : (Date.now().toString(36)+Math.random().toString(36).slice(2,8)).slice(0,14);

/* ---- Star logo (inline SVG) -------------------------------- */
const STAR_SVG = `
<svg class="ls-star" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path d="M32 4l7.6 15.9L57 22.2 44.5 34.4 47.7 52 32 43.4 16.3 52l3.2-17.6L7 22.2l17.4-2.3z"
        fill="#FFD700" stroke="#F0A500" stroke-width="2" stroke-linejoin="round"/>
  <circle cx="25" cy="30" r="2.4" fill="#2A2A6A"/>
  <circle cx="39" cy="30" r="2.4" fill="#2A2A6A"/>
  <path d="M26 36c2.2 2.4 9.8 2.4 12 0" stroke="#2A2A6A" stroke-width="2.2" stroke-linecap="round"/>
</svg>`;

function logoBlock(name, sub){
  return `<div class="ls-logo"><img src="assets/logo.jpeg" class="ls-logo-img" alt="Little Star Course">${sub?`<span class="ls-sub">${sub}</span>`:''}</div>`;
}

/* ---- Formatting -------------------------------------------- */
const genPin  = () => String(Math.floor(1000+Math.random()*9000));
// username = first name (title stripped) + "lsc"  e.g. "Charlene Tannata"→"charlenelsc", "Ms. Nita"→"nitalsc"
const genUsername = (name) => {
  let n = String(name||'').trim().replace(/^(ms|mr|mrs|miss|mister)\.?\s+/i,'');
  const first = (n.split(/\s+/)[0]||'').toLowerCase().replace(/[^a-z0-9]/g,'');
  return first ? first+'lsc' : '';
};
const fmtRp   = n => 'Rp ' + (Number(n)||0).toLocaleString('id-ID');
const fmtNum  = n => (Number(n)||0).toLocaleString('id-ID');
const pad2    = n => String(n).padStart(2,'0');
function todayStr(){ const d=new Date(); return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`; }
function prettyDate(iso){
  if(!iso) return '-';
  const d=new Date(iso+ (iso.length===10?'T00:00:00':''));
  if(isNaN(d)) return iso;
  const days=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const mon=['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
  return `${d.getDate()} ${mon[d.getMonth()]} ${d.getFullYear()}`;
}
function dayName(iso){
  const d=new Date(iso+'T00:00:00'); if(isNaN(d)) return '';
  return ['Min','Sen','Sel','Rab','Kam','Jum','Sab'][d.getDay()];
}
function longToday(){
  const d=new Date();
  const days=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const mon=['January','February','March','April','May','June','July','August','September','October','November','December'];
  return `${days[d.getDay()]}, ${d.getDate()} ${mon[d.getMonth()]} ${d.getFullYear()}`;
}
function timeRange(s,e){ if(!s) return '-'; return e? `${s} - ${e}` : `${s} - …`; }
function durMin(s,e){
  if(!s||!e) return null;
  const [sh,sm]=s.split(':').map(Number),[eh,em]=e.split(':').map(Number);
  return (eh*60+em)-(sh*60+sm);
}

/* ---- Toast ------------------------------------------------- */
function toast(msg,type){
  let t=document.getElementById('__toast');
  if(!t){t=document.createElement('div');t.id='__toast';t.className='toast';document.body.appendChild(t);}
  t.className='toast '+(type||'');t.textContent=msg;
  requestAnimationFrame(()=>t.classList.add('show'));
  clearTimeout(t._h);t._h=setTimeout(()=>t.classList.remove('show'),2600);
}

/* ---- Text & media helpers ---------------------------------- */
function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
// Render multi-line text (preserve Enter / line breaks) in a table cell
function multiline(s){ return (s && String(s).trim()) ? `<span style="white-space:pre-line">${esc(s)}</span>` : '<span class="muted">-</span>'; }
// Render a documentation photo cell: real thumbnail if it's an image, else dash
function docCell(u){ return (u && (String(u).startsWith('data:')||String(u).startsWith('http'))) ? `<img src="${u}" class="thumb docthumb" style="cursor:zoom-in" alt="foto">` : '<span class="muted">-</span>'; }
// Click any .docthumb to view it larger
document.addEventListener('click',e=>{ if(e.target && e.target.classList && e.target.classList.contains('docthumb')) viewImg(e.target.src); });
function viewImg(src){
  if(!src) return;
  let o=document.getElementById('__imgview');
  if(!o){o=document.createElement('div');o.id='__imgview';
    o.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.82);display:flex;align-items:center;justify-content:center;z-index:9999;cursor:zoom-out;padding:24px';
    o.onclick=()=>o.remove();document.body.appendChild(o);}
  o.innerHTML=`<img src="${src}" style="max-width:95%;max-height:95%;border-radius:10px;box-shadow:0 8px 40px rgba(0,0,0,.5)">`;
}
// Downscale a chosen image to a small JPEG data-URL that fits in a sheet cell (<45k chars)
function resizeImageToDataURL(file){
  return new Promise((resolve,reject)=>{
    const img=new Image(), url=URL.createObjectURL(file);
    img.onload=()=>{
      URL.revokeObjectURL(url);
      const draw=(maxDim,q)=>{
        let w=img.width,h=img.height;
        if(w>h && w>maxDim){h=Math.round(h*maxDim/w);w=maxDim;}
        else if(h>=w && h>maxDim){w=Math.round(w*maxDim/h);h=maxDim;}
        const cv=document.createElement('canvas');cv.width=w;cv.height=h;
        cv.getContext('2d').drawImage(img,0,0,w,h);
        return cv.toDataURL('image/jpeg',q);
      };
      let maxDim=440,q=0.6,out=draw(maxDim,q);
      for(let i=0;i<5 && out.length>45000;i++){ maxDim=Math.round(maxDim*0.8); q=Math.max(0.35,q-0.08); out=draw(maxDim,q); }
      resolve(out);
    };
    img.onerror=reject; img.src=url;
  });
}

/* ---- Modal helpers ----------------------------------------- */
function openModal(id){document.getElementById(id).classList.add('open')}
function closeModal(id){document.getElementById(id).classList.remove('open')}

/* ---- Mobile sidebar ---------------------------------------- */
function toggleSidebar(){
  document.querySelector('.sidebar')?.classList.toggle('open');
  document.querySelector('.backdrop')?.classList.toggle('open');
}

/* ============================================================
   SCRIPT_API — Apps Script backend (cadangan) / DEMO
   ============================================================ */
const SCRIPT_API = {
  async _post(payload){
    if(DEMO_MODE) return DEMO.handle(payload);
    const isWrite=/^(add|update|delete|save|change)/.test(payload.action||'');
    if(isWrite && SCRIPT_API._busy) throw new Error('Masih menyimpan permintaan sebelumnya — tunggu sebentar, jangan klik dua kali.');
    if(isWrite) SCRIPT_API._busy=true;
    const tries = isWrite ? 1 : 3;   // baca (get/login) di-retry kalau server ngadat sesaat
    try{
      for(let i=0;i<tries;i++){
        let text;
        try{
          const r=await fetch(SCRIPT_URL,{method:'POST',headers:{'Content-Type':'text/plain'},body:JSON.stringify(payload)});
          text=await r.text();
        }catch(netErr){
          if(i<tries-1){ await new Promise(res=>setTimeout(res,600*(i+1))); continue; }
          throw new Error('Koneksi ke server gagal. Coba refresh halaman.');
        }
        let j=null; try{ j=JSON.parse(text); }catch(_){ j=null; }
        if(j===null){   // dapat HTML/non-JSON (server ngadat sesaat)
          if(i<tries-1){ await new Promise(res=>setTimeout(res,600*(i+1))); continue; }
          throw new Error(isWrite
            ? 'Server sesaat tidak merespons dengan benar. Data KEMUNGKINAN sudah tersimpan — refresh & cek dulu sebelum menyimpan ulang.'
            : 'Server sedang sibuk, gagal memuat data. Silakan refresh halaman.');
        }
        if(j.status==='error') throw new Error(j.message);   // error asli dari server → jangan diulang
        return j.data;
      }
    } finally { if(isWrite) SCRIPT_API._busy=false; }
  },
  _busy:false,
  verifyPin   : (role,pin)         => SCRIPT_API._post({action:'verifyPin',role,pin}),
  changePin   : (role,oldPin,newPin)=> SCRIPT_API._post({action:'changePin',role,oldPin,newPin}),
  getStudents : (o={}) => SCRIPT_API._post({action:'getStudents',...o}),
  studentLogin: (login,pin) => SCRIPT_API._post({action:'studentLogin',login,pin}),
  getStudent  : (id)   => SCRIPT_API._post({action:'getStudents',id}),
  addStudent  : (d)    => SCRIPT_API._post({action:'addStudent',...d}),
  updateStudent:(d)    => SCRIPT_API._post({action:'updateStudent',...d}),
  deleteStudent:(id)   => SCRIPT_API._post({action:'deleteStudent',id}),

  getTutors   : ()     => SCRIPT_API._post({action:'getTutors'}),
  addTutor    : (d)    => SCRIPT_API._post({action:'addTutor',...d}),
  updateTutor : (d)    => SCRIPT_API._post({action:'updateTutor',...d}),
  deleteTutor : (id)   => SCRIPT_API._post({action:'deleteTutor',id}),
  tutorLogin  : (login,pin) => SCRIPT_API._post({action:'tutorLogin',login,pin}),

  getClasses  : (o={}) => SCRIPT_API._post({action:'getClasses',...o}),
  addClass    : (d)    => SCRIPT_API._post({action:'addClass',...d}),
  updateClass : (d)    => SCRIPT_API._post({action:'updateClass',...d}),
  deleteClass : (id)   => SCRIPT_API._post({action:'deleteClass',id}),

  getAttendance : (o={}) => SCRIPT_API._post({action:'getAttendance',...o}),
  saveAttendance: (d)    => SCRIPT_API._post({action:'saveAttendance',...d}),

  getDeposit  : (sid)  => SCRIPT_API._post({action:'getDeposit',student_id:sid}),

  getPayments : (o={}) => SCRIPT_API._post({action:'getPayments',...o}),
  savePayment : (d)    => SCRIPT_API._post({action:'savePayment',...d}),
  deletePayment:(id)   => SCRIPT_API._post({action:'deletePayment',id}),

  uploadFile  : (base64,filename) => SCRIPT_API._post({action:'uploadFile',base64,filename}),
};

/* ============================================================
   SB_API — Supabase (PostgREST) backend UTAMA
   ============================================================ */
const SB_COLS = {
  students:['id','nama','username','school','address','dob','grade','parent_name','wa_ortu','tutor_id','schedule','fee_per_meeting','fee_tentor','meeting_minutes','deposit_meetings','add_fee','add_fee_note','pin','active','link_id'],
  tutors:['id','nama','username','subject','level','address','dob','wa','pin'],
  classes:['id','date','student_id','tutor_id','start_time','end_time','duration','type','topic','note','material_url','doc_url','stu_in','stu_out','tut_in','tut_out'],
  deposit:['student_id','paid_meetings','minutes_total','minutes_used','fee_per_meeting','last_paid','status'],
  payments:['id','student_id','month','pay_date','meetings','price_per_meet','duration','deposit_total','carry_in','extra_minutes','add_fee1','add_fee2','add_fee2_note','next_meetings','next_deposit','grand_total','status'],
};
const sbPick=(o,cols)=>{const r={};cols.forEach(k=>{ if(o[k]!==undefined && o[k]!==null) r[k]=o[k]; });return r;};
const SB = {
  base: (SUPABASE_URL||'').replace(/\/$/,'')+'/rest/v1/',
  _busy:false,
  async req(path,{method='GET',body=null,prefer=null,isWrite=false}={}){
    if(isWrite && SB._busy) throw new Error('Masih menyimpan permintaan sebelumnya — tunggu sebentar, jangan klik dua kali.');
    if(isWrite) SB._busy=true;
    const headers={apikey:SUPABASE_KEY,Authorization:'Bearer '+SUPABASE_KEY};
    if(body) headers['Content-Type']='application/json';
    if(prefer) headers['Prefer']=prefer;
    const tries=isWrite?1:3;
    try{
      for(let i=0;i<tries;i++){
        let res,text;
        try{
          res=await fetch(SB.base+path,{method,headers,body:body?JSON.stringify(body):undefined});
          text=await res.text();
        }catch(netErr){
          if(i<tries-1){ await new Promise(r=>setTimeout(r,500*(i+1))); continue; }
          throw new Error('Koneksi ke server gagal. Coba refresh halaman.');
        }
        if(!res.ok){
          if(!isWrite && res.status>=500 && i<tries-1){ await new Promise(r=>setTimeout(r,500*(i+1))); continue; }
          let msg=text; try{ msg=JSON.parse(text).message||JSON.parse(text).hint||text; }catch(_){}
          throw new Error('Database: '+(msg||('HTTP '+res.status)));
        }
        if(!text) return [];
        try{ return JSON.parse(text); }catch(_){ return []; }
      }
    } finally { if(isWrite) SB._busy=false; }
  },
  enc:v=>encodeURIComponent(String(v==null?'':v)),
};
async function sbLogin(table,login,pin){
  const v=SB.enc(String(login||'').trim());
  const rows=await SB.req(`${table}?or=(username.ilike.${v},nama.ilike.${v},id.eq.${v})&select=*`);
  if(!rows.length) throw new Error(table==='students'?'Murid tidak ditemukan':'Tentor tidak ditemukan');
  const hit=rows.find(x=>String(x.pin)===String(pin));
  if(!hit) throw new Error('PIN salah');
  return hit;
}
function sbClassQuery(o){
  const f=[];
  if(o.id)         f.push('id=eq.'+SB.enc(o.id));
  if(o.date)       f.push('date=eq.'+SB.enc(o.date));
  if(o.month)      f.push('date=like.'+SB.enc(o.month)+'*');
  if(o.student_id) f.push('student_id=eq.'+SB.enc(o.student_id));
  if(o.tutor_id)   f.push('tutor_id=eq.'+SB.enc(o.tutor_id));
  return 'classes?select=*&order=date.desc'+(f.length?'&'+f.join('&'):'');
}
const SB_API = {
  _busy:false,
  // ---- PIN portal ----
  async verifyPin(role,pin){
    const key=role==='master'?'MASTER_PIN':'ADMIN_PIN';
    const rows=await SB.req(`app_settings?key=eq.${key}&select=value`);
    const cur=rows[0]?rows[0].value:(role==='master'?'5758':'17081945');
    return {ok:String(pin)===String(cur)};
  },
  async changePin(role,oldPin,newPin){
    const key=role==='master'?'MASTER_PIN':'ADMIN_PIN';
    const rows=await SB.req(`app_settings?key=eq.${key}&select=value`);
    const cur=rows[0]?rows[0].value:(role==='master'?'5758':'17081945');
    if(String(oldPin)!==String(cur)) return {ok:false,message:'Password lama salah.'};
    if(!/^\d{4,10}$/.test(String(newPin||''))) return {ok:false,message:'Password baru harus 4–10 digit angka.'};
    await SB.req('app_settings',{method:'POST',body:{key,value:String(newPin)},prefer:'resolution=merge-duplicates,return=minimal',isWrite:true});
    return {ok:true};
  },
  // ---- Students ----
  getStudents:(o={})=> SB.req('students?select=*'+(o.id?'&id=eq.'+SB.enc(o.id):'')+'&order=created_at.asc'),
  getStudent :(id)=> SB.req('students?select=*&id=eq.'+SB.enc(id)),
  studentLogin:(login,pin)=> sbLogin('students',login,pin),
  async addStudent(d){
    const id=uid(), pin=d.pin||genPin();
    const link=(String(d.nama||'siswa')).toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'')+'-'+id.slice(0,5);
    const row=sbPick({...d,id,pin,username:(d.username||'').toLowerCase().trim(),active:d.active||'aktif',link_id:link},SB_COLS.students);
    await SB.req('students',{method:'POST',body:row,prefer:'return=minimal',isWrite:true});
    return {id,pin,link_id:link};
  },
  async updateStudent(d){
    const row=sbPick(d,SB_COLS.students.filter(c=>c!=='id'));
    await SB.req('students?id=eq.'+SB.enc(d.id),{method:'PATCH',body:row,prefer:'return=minimal',isWrite:true});
    return {updated:d.id};
  },
  async deleteStudent(id){ await SB.req('students?id=eq.'+SB.enc(id),{method:'DELETE',prefer:'return=minimal',isWrite:true}); return {deleted:id}; },
  // ---- Tutors ----
  getTutors:()=> SB.req('tutors?select=*&order=created_at.asc'),
  tutorLogin:(login,pin)=> sbLogin('tutors',login,pin),
  async addTutor(d){
    const id=uid(), pin=d.pin||genPin();
    const row=sbPick({...d,id,pin,username:(d.username||'').toLowerCase().trim()},SB_COLS.tutors);
    await SB.req('tutors',{method:'POST',body:row,prefer:'return=minimal',isWrite:true});
    return {id,pin};
  },
  async updateTutor(d){
    const row=sbPick(d,SB_COLS.tutors.filter(c=>c!=='id'));
    await SB.req('tutors?id=eq.'+SB.enc(d.id),{method:'PATCH',body:row,prefer:'return=minimal',isWrite:true});
    return {updated:d.id};
  },
  async deleteTutor(id){ await SB.req('tutors?id=eq.'+SB.enc(id),{method:'DELETE',prefer:'return=minimal',isWrite:true}); return {deleted:id}; },
  // ---- Classes ----
  getClasses:(o={})=> SB.req(sbClassQuery(o)),
  async addClass(d){
    const id=uid();
    const row=sbPick({...d,id},SB_COLS.classes);
    await SB.req('classes',{method:'POST',body:row,prefer:'return=minimal',isWrite:true});
    return {id};
  },
  async updateClass(d){
    const row=sbPick(d,SB_COLS.classes.filter(c=>c!=='id'));
    await SB.req('classes?id=eq.'+SB.enc(d.id),{method:'PATCH',body:row,prefer:'return=minimal',isWrite:true});
    return {updated:d.id};
  },
  async deleteClass(id){ await SB.req('classes?id=eq.'+SB.enc(id),{method:'DELETE',prefer:'return=minimal',isWrite:true}); return {deleted:id}; },
  getAttendance:(o={})=> SB.req(sbClassQuery(o)),
  saveAttendance(d){ return SB_API.updateClass(d); },
  // ---- Deposit ----
  async getDeposit(sid){ const r=await SB.req('deposit?select=*&student_id=eq.'+SB.enc(sid)); return r[0]||null; },
  // ---- Payments ----
  getPayments:(o={})=> SB.req('payments?select=*'+(o.student_id?'&student_id=eq.'+SB.enc(o.student_id):'')+(o.month?'&month=eq.'+SB.enc(o.month):'')+'&order=month.desc'),
  async savePayment(d){
    const id=d.id||uid();
    const row=sbPick({...d,id},SB_COLS.payments);
    await SB.req('payments',{method:'POST',body:row,prefer:'resolution=merge-duplicates,return=minimal',isWrite:true});
    return {id};
  },
  async deletePayment(id){ await SB.req('payments?id=eq.'+SB.enc(id),{method:'DELETE',prefer:'return=minimal',isWrite:true}); return {deleted:id}; },
  // ---- Uploads (materi/foto → data URL disimpan di kolom teks) ----
  uploadFile:(base64,filename)=> Promise.resolve({url:base64,view:base64,name:filename}),
};

/* Pilih backend aktif */
const API = USE_SUPABASE ? SB_API : SCRIPT_API;

// Read a File as a base64 data-URL
function fileToBase64(file){ return new Promise((res,rej)=>{const r=new FileReader();r.onload=e=>res(e.target.result);r.onerror=rej;r.readAsDataURL(file);}); }
// Render one or more material links (stored joined by '|')
function matLinks(u){
  if(!u) return '<span class="muted">-</span>';
  return String(u).split('|').filter(Boolean).map((x,i)=>{
    const name=(x.split('/').pop().split('?')[0]||('File '+(i+1))).slice(0,26);
    const real = x.startsWith('http')||x.startsWith('data:');
    if(!real) return `<span class="muted" title="File lama belum ter-upload — minta tentor upload ulang">📄 ${name}</span>`;
    const isImg=/\.(jpe?g|png)(\?|$)/i.test(x)||x.startsWith('data:image');
    const isPdf=/\.pdf(\?|$)/i.test(x);
    const isYT=/youtu\.?be/i.test(x), isDrive=/drive\.google/i.test(x);
    let icon='🔗',label='Link',dl='';
    if(isImg){icon='🖼️';label=name;}
    else if(isPdf){icon='📄';label=name;dl='download';}
    else if(isYT){icon='▶️';label='YouTube';}
    else if(isDrive){icon='📁';label='Google Drive';}
    return `<a class="btn btn-outline btn-sm" href="${x}" target="_blank" style="margin:2px" ${dl}>${icon} ${label}</a>`;
  }).join(' ');
}

/* ============================================================
   DEMO DATA  (mirrors the mockups; used until SCRIPT_URL is set)
   ============================================================ */
const DEMO = {
  tutors:[
    {id:'t1',nama:'Mr. Yesaya',subject:'Math',   level:'Upper Secondary (SMA)',address:'Jl. Ngagel 3, Surabaya',dob:'1995-04-10',wa:'081200000001',pin:'2468'},
    {id:'t2',nama:'Ms. Dian',  subject:'Science',level:'Lower Secondary (SMP)',address:'Jl. Manyar 7, Surabaya',dob:'1996-11-02',wa:'081200000002',pin:'1357'},
    {id:'t3',nama:'Mr. Kevin', subject:'English',level:'Primary (SD)',         address:'Jl. Darmo 21, Surabaya',dob:'1994-07-19',wa:'081200000003',pin:'9753'},
  ],
  students:[
    {id:'s1',nama:'Anton Wijaya',school:'SMP Petra 1',address:'Jl. Kertajaya 12, Surabaya',dob:'2013-05-14',grade:'7',parent_name:'Ibu Rina Wijaya',wa_ortu:'081234567890',
     tutor_id:'t1',schedule:'Sen & Kam · 19.00',fee_per_meeting:150000,fee_tentor:90000,meeting_minutes:90,
     deposit_meetings:16,add_fee:300000,add_fee_note:'Biaya les olimpiade (Agustus)',pin:'1111',active:'aktif',link_id:'anton-s1'},
    {id:'s2',nama:'Budi Santoso',school:'SMP Cita Hati',address:'Jl. Diponegoro 45, Surabaya',dob:'2012-09-03',grade:'8',parent_name:'Bpk. Hadi',wa_ortu:'081234500011',
     tutor_id:'t2',schedule:'Sel · 16.00',fee_per_meeting:150000,fee_tentor:90000,meeting_minutes:90,
     deposit_meetings:8,pin:'2222',active:'aktif',link_id:'budi-s2'},
    {id:'s3',nama:'Clara Halim',school:'SD Gloria',address:'Jl. Mayjend Sungkono 8, Surabaya',dob:'2014-01-22',grade:'6',parent_name:'Ibu Mega',wa_ortu:'081234500022',
     tutor_id:'t3',schedule:'Rab & Jum · 15.30',fee_per_meeting:140000,fee_tentor:85000,meeting_minutes:90,
     deposit_meetings:12,pin:'3333',active:'aktif',link_id:'clara-s3'},
  ],
  classes:[
    {id:'c101',date:todayStr(),student_id:'s1',tutor_id:'t1',start_time:'19:00',end_time:'',duration:90,type:'onsite',topic:'',note:'',material_url:'',doc_url:'',
     stu_in:'',stu_out:'',tut_in:'',tut_out:''},
    {id:'c102',date:todayStr(),student_id:'s2',tutor_id:'t2',start_time:'16:00',end_time:'',duration:90,type:'online',topic:'',note:'',material_url:'',doc_url:'',
     stu_in:'',stu_out:'',tut_in:'',tut_out:''},
    // history for Anton
    {id:'c1',date:'2026-07-28',student_id:'s1',tutor_id:'t1',start_time:'19:00',end_time:'20:30',duration:90,type:'onsite',
     topic:'Linear Equation (Persamaan Linear)',note:'Anton cukup aktif dan memahami materi dengan baik.',material_url:'materi/linear-equation.pdf',doc_url:'doc1'},
    {id:'c2',date:'2026-07-21',student_id:'s1',tutor_id:'t1',start_time:'19:00',end_time:'20:30',duration:90,type:'onsite',
     topic:'Algebraic Fractions',note:'Perlu latihan lebih banyak soal cerita.',material_url:'materi/algebraic-fractions.pdf',doc_url:'doc2'},
    {id:'c3',date:'2026-07-14',student_id:'s1',tutor_id:'t1',start_time:'19:00',end_time:'21:00',duration:120,type:'onsite',
     topic:'Linear Inequalities',note:'Kelas ditambah 30 menit.',material_url:'materi/inequalities.pdf',doc_url:'doc3'},
    {id:'c4',date:'2026-07-07',student_id:'s1',tutor_id:'t1',start_time:'19:00',end_time:'20:30',duration:90,type:'onsite',
     topic:'Integers (Bilangan Bulat)',note:'Anton sudah mulai terbiasa.',material_url:'materi/integers.pdf',doc_url:'doc4'},
    {id:'c5',date:'2026-06-30',student_id:'s1',tutor_id:'t1',start_time:'19:00',end_time:'20:30',duration:90,type:'onsite',
     topic:'Introduction to Algebra',note:'Good job!',material_url:'materi/intro-algebra.pdf',doc_url:'doc5'},
  ],
  deposits:{
    s1:{paid_meetings:16,minutes_total:1440,minutes_used:900,fee_per_meeting:150000,last_paid:'2026-07-20'},
    s2:{paid_meetings:8, minutes_total:720, minutes_used:360,fee_per_meeting:150000,last_paid:'2026-07-05'},
    s3:{paid_meetings:12,minutes_total:1080,minutes_used:540,fee_per_meeting:140000,last_paid:'2026-07-10'},
  },
  payments:[
    {id:'pay1',student_id:'s1',month:'2026-06',pay_date:'2026-06-01',meetings:8,price_per_meet:150000,duration:90,
     deposit_total:1200000,carry_in:0,extra_minutes:0,add_fee1:0,add_fee2:0,add_fee2_note:'',next_meetings:8,next_deposit:1200000,grand_total:1200000,status:'LUNAS'},
  ],
  handle(p){
    return new Promise((res,rej)=>{
      setTimeout(()=>{ try{ res(this._route(p)); }catch(e){ rej(e); } },120); // tiny delay to feel real
    });
  },
  _route(p){
    const clone=x=>JSON.parse(JSON.stringify(x));
    switch(p.action){
      case 'getTutors': return clone(this.tutors);
      case 'getStudents':
        if(p.id) return clone(this.students.find(s=>s.id===p.id)||null);
        return clone(this.students);
      case 'getClasses':{
        let r=clone(this.classes);
        if(p.date)       r=r.filter(c=>c.date===p.date);
        if(p.student_id) r=r.filter(c=>c.student_id===p.student_id);
        if(p.tutor_id)   r=r.filter(c=>c.tutor_id===p.tutor_id);
        if(p.month)      r=r.filter(c=>c.date.startsWith(p.month));
        return r.sort((a,b)=>b.date>a.date?1:-1);
      }
      case 'addClass':{
        const id='c'+Date.now();
        this.classes.push({id,doc_url:'',material_url:'',topic:'',note:'',...p});
        return {id};
      }
      case 'updateClass':{
        const c=this.classes.find(x=>x.id===p.id); if(c) Object.assign(c,p); return {updated:p.id};
      }
      case 'deleteClass':{
        this.classes=this.classes.filter(x=>x.id!==p.id); return {deleted:p.id};
      }
      case 'getDeposit': return clone(this.deposits[p.student_id]||null);
      case 'getPayments':{ let r=clone(this.payments); if(p.student_id) r=r.filter(x=>x.student_id===p.student_id); if(p.month) r=r.filter(x=>x.month===p.month); return r.sort((a,b)=>String(b.month).localeCompare(String(a.month))); }
      case 'savePayment':{ if(p.id){const e=this.payments.find(x=>x.id===p.id); if(e){Object.assign(e,p); return {updated:p.id};}} const id='pay'+Date.now(); this.payments.push({id,...p}); return {id}; }
      case 'deletePayment':{ this.payments=this.payments.filter(x=>x.id!==p.id); return {deleted:p.id}; }
      case 'uploadFile':{ return {url:p.base64,view:p.base64}; }
      case 'addStudent': { const id='s'+Date.now(); const pin=p.pin||genPin(); this.students.push({id,active:'aktif',pin,...p}); return {id,pin}; }
      case 'studentLogin':{ const key=String(p.login||'').toLowerCase().trim(); const s=this.students.find(x=>x.id===p.login||(x.username||'').toLowerCase().trim()===key||genUsername(x.nama)===key||x.nama.toLowerCase().trim()===key); if(!s)throw new Error('Murid tidak ditemukan'); if(String(s.pin)!==String(p.pin))throw new Error('PIN salah'); return clone(s); }
      case 'addTutor':   { const id='t'+Date.now(); const pin=p.pin||genPin(); this.tutors.push({id,pin,...p}); return {id,pin}; }
      case 'updateTutor':{ const t=this.tutors.find(x=>x.id===p.id); if(t) Object.assign(t,p); return {updated:p.id}; }
      case 'updateStudent':{ const s=this.students.find(x=>x.id===p.id); if(s) Object.assign(s,p); return {updated:p.id}; }
      case 'deleteTutor':{ this.tutors=this.tutors.filter(x=>x.id!==p.id); return {deleted:p.id}; }
      case 'deleteStudent':{ this.students=this.students.filter(x=>x.id!==p.id); return {deleted:p.id}; }
      case 'verifyPin':{ this._pins=this._pins||{master:'5758',admin:'17081945'}; return {ok:String(p.pin)===this._pins[p.role==='master'?'master':'admin']}; }
      case 'changePin':{ this._pins=this._pins||{master:'5758',admin:'17081945'}; const role=p.role==='master'?'master':'admin'; if(String(p.oldPin)!==this._pins[role]) return {ok:false,message:'Password lama salah'}; if(!/^\d{4,10}$/.test(String(p.newPin||''))) return {ok:false,message:'Password baru 4–10 digit angka'}; this._pins[role]=String(p.newPin); return {ok:true}; }
      case 'tutorLogin':{
        const key=String(p.login||'').toLowerCase().trim();
        const t=this.tutors.find(x=>x.id===p.login||(x.username||'').toLowerCase().trim()===key||genUsername(x.nama)===key||x.nama.toLowerCase().trim()===key);
        if(!t) throw new Error('Tentor tidak ditemukan');
        if(String(t.pin)!==String(p.pin)) throw new Error('PIN salah');
        return clone(t);
      }
      case 'getAttendance': return clone(this.classes.filter(c=>!p.date||c.date===p.date));
      default: return null;
    }
  },
  tutorName(id){return (this.tutors.find(t=>t.id===id)||{}).nama||'-';},
  studentName(id){return (this.students.find(s=>s.id===id)||{}).nama||'-';},
};

/* Convenience lookups that work in demo & live (names embedded server-side in live) */
async function tutorMap(){const t=await API.getTutors();const m={};t.forEach(x=>m[x.id]=x);return m;}
async function studentMap(){const s=await API.getStudents();const m={};s.forEach(x=>m[x.id]=x);return m;}
