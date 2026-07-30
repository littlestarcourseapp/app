// ============================================================
//  Little Star Course — Google Apps Script Backend
//
//  SETUP:
//  1. Buka Google Sheets baru → Extensions → Apps Script
//  2. Paste seluruh file ini, Save
//  3. Deploy → New deployment → Web app
//        Execute as: Me   |   Who has access: Anyone
//  4. Copy URL /exec → tempel ke assets/app.js  (SCRIPT_URL)
//  5. Jalankan sekali fungsi setupSheets() dari editor
//     (atau buka portal → console → API._post({action:'setup'}))
// ============================================================

const SS = SpreadsheetApp.getActiveSpreadsheet();
const DRIVE_FOLDER = 'LittleStar_Uploads';

/* ---------- Helpers ---------- */
function uid(){ return Utilities.getUuid().replace(/-/g,'').slice(0,14); }
function getSheet(n){ return SS.getSheetByName(n) || SS.insertSheet(n); }
function ok(d){ return ContentService.createTextOutput(JSON.stringify({status:'ok',data:d})).setMimeType(ContentService.MimeType.JSON); }
function err(m){ return ContentService.createTextOutput(JSON.stringify({status:'error',message:m})).setMimeType(ContentService.MimeType.JSON); }

function rows(name){
  const sh=getSheet(name), data=sh.getDataRange().getValues();
  if(data.length<2) return [];
  const head=data[0], tz=Session.getScriptTimeZone();
  const WA=['wa_ortu','wa'], DATE=['date','last_paid','tgl_masuk'];
  return data.slice(1).map(r=>{
    const o={};
    head.forEach((h,i)=>{
      let v=r[i];
      if(v instanceof Date) v=Utilities.formatDate(v,tz,'yyyy-MM-dd');
      if(WA.includes(h)) v=String(v||'');
      o[h]=v;
    });
    return o;
  });
}
function findRow(name,id){
  const sh=getSheet(name), data=sh.getDataRange().getValues(), idx=data[0].indexOf('id');
  for(let i=1;i<data.length;i++) if(data[i][idx]===id) return {sh,i,head:data[0]};
  return null;
}
function setFields(ctx,fields){
  const {sh,i,head}=ctx;
  for(const[k,v] of Object.entries(fields)){
    const c=head.indexOf(k);
    if(c>=0 && v!==undefined){ const cell=sh.getRange(i+1,c+1); if(k==='wa_ortu'||k==='wa') cell.setNumberFormat('@'); cell.setValue(v); }
  }
}

/* ---------- Entry points ---------- */
function doGet(e){
  try{
    const p=e.parameter||{};
    if(p.action==='getStudentByLink') return ok(getStudentByLink(p.link_id));
    return err('Unknown GET: '+p.action);
  }catch(ex){ return err(ex.message); }
}
function doPost(e){
  try{
    const p=JSON.parse(e.postData.contents);
    switch(p.action){
      case 'setup':           return ok(setupSheets());
      // Students
      case 'getStudents':     return ok(getStudents(p));
      case 'getStudentByLink':return ok(getStudentByLink(p.link_id));
      case 'addStudent':      return ok(addStudent(p));
      case 'updateStudent':   return ok(updateStudent(p));
      case 'deleteStudent':   return ok(del('Students',p.id));
      // Tutors
      case 'getTutors':       return ok(rows('Tutors'));
      case 'addTutor':        return ok(addTutor(p));
      case 'updateTutor':     return ok(updateTutor(p));
      case 'deleteTutor':     return ok(del('Tutors',p.id));
      case 'tutorLogin':      return ok(tutorLogin(p));
      // Classes / reports
      case 'getClasses':      return ok(getClasses(p));
      case 'addClass':        return ok(addClass(p));
      case 'updateClass':     return ok(updateClass(p));
      case 'deleteClass':     return ok(del('Classes',p.id));
      // Attendance
      case 'getAttendance':   return ok(getAttendance(p));
      case 'saveAttendance':  return ok(updateClass(p)); // same sheet columns
      // Deposit
      case 'getDeposit':      return ok(getDeposit(p.student_id));
      case 'setDeposit':      return ok(setDeposit(p));
      // Uploads
      case 'uploadFile':      return ok(uploadFile(p));
      default:                return err('Unknown action: '+p.action);
    }
  }catch(ex){ return err(ex.message); }
}

/* ---------- Setup ---------- */
function setupSheets(){
  const schema={
    Students:['id','nama','school','address','dob','grade','parent_name','wa_ortu','tutor_id','schedule',
              'fee_per_meeting','fee_tentor','meeting_minutes','deposit_meetings','active','link_id','tgl_masuk'],
    Tutors:  ['id','nama','subject','level','wa','pin'],
    Classes: ['id','date','student_id','tutor_id','start_time','end_time','duration','type',
              'topic','note','material_url','doc_url','stu_in','stu_out','tut_in','tut_out'],
    Deposit: ['student_id','paid_meetings','minutes_total','minutes_used','fee_per_meeting','last_paid','status'],
  };
  const out=[];
  for(const[name,head] of Object.entries(schema)){
    const sh=getSheet(name);
    const first=sh.getLastRow()>0?sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0]:[];
    if(first.length===0||first[0]===''){
      sh.clearContents();
      sh.getRange(1,1,1,head.length).setValues([head]);
      sh.getRange(1,1,1,head.length).setBackground('#000080').setFontColor('#fff').setFontWeight('bold');
      sh.setFrozenRows(1);
      ['wa_ortu','wa'].forEach(k=>{const c=head.indexOf(k);if(c>=0)sh.getRange(2,c+1,2000,1).setNumberFormat('@');});
      out.push(name+': created');
    } else out.push(name+': exists');
  }
  return out;
}

/* ---------- Students ---------- */
function getStudents(p){
  const r=rows('Students');
  if(p.id) return r.find(s=>s.id===p.id)||null;
  if(p.active) return r.filter(s=>s.active===p.active);
  return r;
}
function getStudentByLink(link){
  const s=rows('Students').find(x=>x.link_id===link);
  if(!s) throw new Error('Student tidak ditemukan: '+link);
  return s;
}
function addStudent(p){
  const sh=getSheet('Students');
  ['school','address','dob','fee_tentor'].forEach(c=>ensureCol(sh,c));
  const id=uid();
  const link=(p.nama||'siswa').toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'')+'-'+id.slice(0,5);
  const head=sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0];
  const row=new Array(head.length).fill('');
  const set=(k,v)=>{const i=head.indexOf(k);if(i>=0)row[i]=v;};
  set('id',id); set('nama',p.nama||''); set('school',p.school||''); set('address',p.address||''); set('dob',p.dob||'');
  set('grade',p.grade||''); set('parent_name',p.parent_name||'');
  set('wa_ortu',p.wa_ortu||''); set('tutor_id',p.tutor_id||''); set('schedule',p.schedule||'');
  set('fee_per_meeting',Number(p.fee_per_meeting)||0); set('fee_tentor',Number(p.fee_tentor)||0);
  set('meeting_minutes',Number(p.meeting_minutes)||90);
  set('deposit_meetings',Number(p.deposit_meetings)||0); set('active',p.active||'aktif');
  set('link_id',link); set('tgl_masuk',p.tgl_masuk||'');
  sh.appendRow(row);
  const c=head.indexOf('wa_ortu'); if(c>=0) sh.getRange(sh.getLastRow(),c+1).setNumberFormat('@');
  return {id,link_id:link};
}
function updateStudent(p){
  const sh=getSheet('Students');
  ['school','address','dob','fee_tentor'].forEach(c=>ensureCol(sh,c));
  const ctx=findRow('Students',p.id); if(!ctx) throw new Error('Student tidak ditemukan');
  setFields(ctx,{nama:p.nama,school:p.school,address:p.address,dob:p.dob,grade:p.grade,parent_name:p.parent_name,
    wa_ortu:p.wa_ortu,tutor_id:p.tutor_id,schedule:p.schedule,fee_per_meeting:Number(p.fee_per_meeting),
    fee_tentor:Number(p.fee_tentor),meeting_minutes:Number(p.meeting_minutes),
    deposit_meetings:Number(p.deposit_meetings),active:p.active});
  return {updated:p.id};
}

/* ---------- Tutors ---------- */
function genPin(){ return String(Math.floor(1000+Math.random()*9000)); }
function ensureCol(sh,name){
  const head=sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0];
  let i=head.indexOf(name);
  if(i<0){ i=head.length; sh.getRange(1,i+1).setValue(name).setBackground('#000080').setFontColor('#fff').setFontWeight('bold'); }
  return i;
}
function addTutor(p){
  const sh=getSheet('Tutors'); ensureCol(sh,'level'); ensureCol(sh,'pin'); const id=uid();
  const head=sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0];
  const row=new Array(head.length).fill('');
  const set=(k,v)=>{const i=head.indexOf(k);if(i>=0)row[i]=v;};
  const pin=p.pin||genPin();
  set('id',id); set('nama',p.nama||''); set('subject',p.subject||''); set('level',p.level||''); set('wa',p.wa||''); set('pin',pin);
  sh.appendRow(row);
  const c=head.indexOf('wa');  if(c>=0)  sh.getRange(sh.getLastRow(),c+1).setNumberFormat('@');
  const pc=head.indexOf('pin');if(pc>=0) sh.getRange(sh.getLastRow(),pc+1).setNumberFormat('@');
  return {id,pin};
}
function updateTutor(p){
  const sh=getSheet('Tutors'); ensureCol(sh,'level'); ensureCol(sh,'pin');
  const ctx=findRow('Tutors',p.id); if(!ctx) throw new Error('Tutor tidak ditemukan');
  const f={nama:p.nama,subject:p.subject,level:p.level,wa:p.wa};
  if(p.pin!==undefined) f.pin=p.pin;
  setFields(ctx,f);
  return {updated:p.id};
}
function tutorLogin(p){
  const list=rows('Tutors');
  const key=String(p.login||'').toLowerCase().trim();
  const t=list.find(x=>x.id===p.login || String(x.nama||'').toLowerCase().trim()===key);
  if(!t) throw new Error('Tentor tidak ditemukan');
  if(String(t.pin)!==String(p.pin)) throw new Error('PIN salah');
  return t;
}

/* ---------- Classes ---------- */
function getClasses(p){
  let r=rows('Classes');
  if(p.date)       r=r.filter(c=>c.date===p.date);
  if(p.student_id) r=r.filter(c=>c.student_id===p.student_id);
  if(p.tutor_id)   r=r.filter(c=>c.tutor_id===p.tutor_id);
  if(p.month)      r=r.filter(c=>String(c.date).startsWith(p.month));
  return r.sort((a,b)=>b.date>a.date?1:-1);
}
function addClass(p){
  const sh=getSheet('Classes'), id=uid();
  const head=sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0];
  const row=new Array(head.length).fill('');
  const set=(k,v)=>{const i=head.indexOf(k);if(i>=0)row[i]=v;};
  ['date','student_id','tutor_id','start_time','end_time','type','topic','note','material_url','doc_url','stu_in','stu_out','tut_in','tut_out']
    .forEach(k=>set(k,p[k]||''));
  set('id',id); set('duration',Number(p.duration)||0);
  sh.appendRow(row);
  return {id};
}
function updateClass(p){
  const ctx=findRow('Classes',p.id); if(!ctx) throw new Error('Class tidak ditemukan');
  const f={}; ['date','student_id','tutor_id','start_time','end_time','type','topic','note',
    'material_url','doc_url','stu_in','stu_out','tut_in','tut_out'].forEach(k=>{if(p[k]!==undefined)f[k]=p[k];});
  if(p.duration!==undefined) f.duration=Number(p.duration);
  setFields(ctx,f);
  return {updated:p.id};
}

/* ---------- Attendance (stored in Classes sheet columns stu_/tut_) ---------- */
function getAttendance(p){
  let r=rows('Classes');
  if(p.date)  r=r.filter(c=>c.date===p.date);
  if(p.month) r=r.filter(c=>String(c.date).startsWith(p.month));
  return r;
}

/* ---------- Deposit ---------- */
function getDeposit(sid){ return rows('Deposit').find(d=>d.student_id===sid)||null; }
function setDeposit(p){
  const ctx=findRow2('Deposit','student_id',p.student_id);
  if(ctx){ setFields(ctx,p); return {updated:p.student_id}; }
  getSheet('Deposit').appendRow([p.student_id,Number(p.paid_meetings)||0,Number(p.minutes_total)||0,
    Number(p.minutes_used)||0,Number(p.fee_per_meeting)||0,p.last_paid||'',p.status||'lunas']);
  return {created:p.student_id};
}
function findRow2(name,key,val){
  const sh=getSheet(name), data=sh.getDataRange().getValues(), idx=data[0].indexOf(key);
  for(let i=1;i<data.length;i++) if(data[i][idx]===val) return {sh,i,head:data[0]};
  return null;
}

/* ---------- Generic delete + upload ---------- */
function del(name,id){
  const sh=getSheet(name), data=sh.getDataRange().getValues(), idx=data[0].indexOf('id');
  for(let i=data.length-1;i>=1;i--) if(data[i][idx]===id){ sh.deleteRow(i+1); return {deleted:id}; }
  throw new Error(name+' id tidak ditemukan');
}
function uploadFile(p){
  let folder;
  const it=DriveApp.getFoldersByName(DRIVE_FOLDER);
  folder = it.hasNext()?it.next():DriveApp.createFolder(DRIVE_FOLDER);
  const b64=p.base64.split(',')[1], mime=p.base64.split(';')[0].split(':')[1];
  const blob=Utilities.newBlob(Utilities.base64Decode(b64),mime,p.filename||'file');
  const f=folder.createFile(blob);
  f.setSharing(DriveApp.Access.ANYONE_WITH_LINK,DriveApp.Permission.VIEW);
  return {url:'https://drive.google.com/uc?id='+f.getId(),view:'https://drive.google.com/file/d/'+f.getId()+'/view'};
}
