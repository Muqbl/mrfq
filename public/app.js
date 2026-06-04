/* ══════════════════════════════════════════════════════════════
   REGA FACILITY CARE — App v16
   Complete Frontend Rebuild — inspired by وفّر design language
   ══════════════════════════════════════════════════════════════ */

/* ─── CONSTANTS ──────────────────────────────────────────────── */
const ROLES = ['system_admin','facility_manager','cleaning_manager','cleaning_supervisor','cleaner'];
const TYPES = ['restroom','lobby','office','meeting_room','pantry','corridor','prayer_room','elevator','entrance','parking','outdoor','other'];

// ===== Facility Constants =====
const FACILITY_FLOORS = [
  "MF","GF","B2","BI","8F","7F","6F","5F","4F","3F","2F","IF"
];
const FACILITY_ZONES = [
  "A","B","C","Lobby","Pantry","Prayer","Corridor"
];


const TASKS = {

  restroom:[
    ['تنظيف المرحاض والمباول','Clean toilets and urinals'],
    ['تنظيف المغاسل والمرايا','Clean basins and mirrors'],
    ['تفريغ سلة النفايات','Empty waste bins'],
    ['تنظيف الأرضيات والجدران','Spot-clean floors and walls'],
    ['فحص الروائح والتهوية','Check odour and ventilation'],
    ['تعبئة الصابون والمناديل','Refill soap and tissues']
  ],
  default:[
    ['إزالة المخلفات','Remove waste'],
    ['تنظيف الأسطح','Clean surfaces'],
    ['تنظيف الأرضيات','Clean floors'],
    ['فحص الروائح والمظهر','Check odour and appearance'],
    ['تعبئة المستلزمات','Refill supplies if needed']
  ]
};

/* ─── TRANSLATIONS ────────────────────────────────────────────── */
const T = {
  ar:{
    app:'منصة العناية بالمرافق',sub:'إدارة احترافية لكل مرفق، في كل وقت',
    loginTitle:'منصة ذكية لمرافق<br>أكثر كفاءة',welcomeBack:'مرحباً بعودتك',
    login:'تسجيل الدخول',user:'اسم المستخدم',pass:'كلمة المرور',lang:'English',logout:'خروج',
    dashboard:'لوحة التحكم',reports:'التقارير',users:'المستخدمون',locations:'المرافق',
    assignments:'التوزيع',tickets:'البلاغات',analytics:'التحليلات',
    today:'تقارير اليوم',coverage:'نسبة التغطية',pending:'بانتظار الاعتماد',
    openTickets:'بلاغات مفتوحة',active:'المواقع النشطة',latest:'آخر التقارير',
    health:'حالة المواقع',opsCenter:'مركز العمليات',
    name:'الاسم',username:'اسم المستخدم',password:'كلمة المرور',role:'الصلاحية',
    employeeNo:'رقم الموظف',save:'حفظ',addUser:'إضافة مستخدم',edit:'تعديل',cancel:'إلغاء',
    activeUser:'نشط',inactive:'معطل',
    system_admin:'مدير النظام',facility_manager:'مدير المرافق',
    cleaning_manager:'مديرة النظافة',cleaning_supervisor:'مشرف النظافة',cleaner:'عامل نظافة',
    worker:'العامل',location:'الموقع',time:'الوقت',status:'الحالة',
    completed:'تم التنظيف',needs_followup:'يحتاج متابعة',pending_approval:'بانتظار الاعتماد',
    approved:'معتمد',rejected:'مرفوض',needs_recleaning:'إعادة تنظيف',
    approve:'اعتماد',reject:'رفض',reclean:'إعادة تنظيف',
    notes:'ملاحظات',tasks:'المهام',taskResults:'نتائج البنود',photoCount:'الصور',
    manual:'أدخل كود الموقع أو امسح QR',start:'بدء التقرير',
    addPhoto:'إضافة صورة',takePhoto:'التقاط صورة',submit:'إرسال التقرير',
    noData:'لا توجد بيانات',sent:'تم الإرسال بنجاح',saved:'تم الحفظ',
    invalid:'بيانات الدخول غير صحيحة',notAssigned:'الموقع غير مخصص لك',
    photoRequired:'التقط صورة واحدة على الأقل',cameraError:'تعذر فتح الكاميرا',
    autoTime:'الوقت يسجل تلقائياً',assigned:'المواقع المخصصة',
    selectWorker:'اختر العامل',selectLocations:'اختر المواقع',
    printQR:'طباعة QR',exportCSV:'تصدير CSV',
    good:'ملتزم',late:'متأخر',none:'لا يوجد',sync:'مزامنة',
    quality:'جودة التقرير',sla:'مؤشر SLA',heatmap:'خريطة المرافق',
    type:'النوع',floor:'الدور',zone:'المنطقة',priority:'الأولوية',
    high:'عالية',medium:'متوسطة',low:'منخفضة',
    title:'العنوان',description:'الوصف',assignedTo:'موجه إلى',
    createTicket:'إنشاء بلاغ',completeTicket:'إغلاق البلاغ',
    open:'مفتوح',closed:'مغلق',
    restroom:'دورة مياه',lobby:'ردهة',office:'مكتب',meeting_room:'قاعة اجتماع',
    pantry:'ضيافة',corridor:'ممرات',prayer_room:'مصلى',elevator:'مصاعد',
    entrance:'مدخل',parking:'مواقف',outdoor:'خارجي',other:'أخرى',
    operations:'العمليات',management:'الإدارة',settings:'الإعدادات',
    demoAccounts:'حسابات تجريبية',scanQR:'مسح QR',
    reportSent:'تم إرسال التقرير بنجاح',offlineSaved:'تم حفظ التقرير للمزامنة لاحقاً',
    pendingSync:'تقارير معلقة',noTickets:'لا توجد بلاغات',
    reportQuality:'جودة التقرير',filterAll:'الكل',filterPending:'معلق',filterApproved:'معتمد',
    workerName:'اسم العامل',reportsCount:'التقارير',locationsCount:'المرافق',usersCount:'المستخدمون',
    workersCount:'العمال',step1:'اختر الموقع',step2:'نفّذ البنود',step3:'التقط الصور',step4:'أرسل',
    myTickets:'بلاغاتي',priorityHigh:'أولوية عالية',
  },
  en:{
    app:'Facility Care Platform',sub:'Professional management for every facility, at any time',
    loginTitle:'Smart Platform for Cleaner, More Efficient Facilities',welcomeBack:'Welcome Back',
    login:'Login',user:'Username',pass:'Password',lang:'العربية',logout:'Logout',
    dashboard:'Dashboard',reports:'Reports',users:'Users',locations:'Facilities',
    assignments:'Assignments',tickets:'Tickets',analytics:'Analytics',
    today:"Today's Reports",coverage:'Coverage',pending:'Pending Approval',
    openTickets:'Open Tickets',active:'Active Sites',latest:'Recent Reports',
    health:'Site Health',opsCenter:'Operations Center',
    name:'Name',username:'Username',password:'Password',role:'Role',
    employeeNo:'Employee No.',save:'Save',addUser:'Add User',edit:'Edit',cancel:'Cancel',
    activeUser:'Active',inactive:'Inactive',
    system_admin:'System Admin',facility_manager:'Facility Manager',
    cleaning_manager:'Cleaning Manager',cleaning_supervisor:'Supervisor',cleaner:'Cleaner',
    worker:'Worker',location:'Location',time:'Time',status:'Status',
    completed:'Completed',needs_followup:'Needs Follow-up',pending_approval:'Pending Approval',
    approved:'Approved',rejected:'Rejected',needs_recleaning:'Needs Re-cleaning',
    approve:'Approve',reject:'Reject',reclean:'Re-clean',
    notes:'Notes',tasks:'Tasks',taskResults:'Task Results',photoCount:'Photos',
    manual:'Enter location code or scan QR',start:'Start Report',
    addPhoto:'Add Photo',takePhoto:'Capture Photo',submit:'Submit Report',
    noData:'No data',sent:'Report submitted!',saved:'Saved',
    invalid:'Invalid credentials',notAssigned:'Not assigned to this location',
    photoRequired:'Take at least one photo',cameraError:'Camera unavailable',
    autoTime:'Time recorded automatically',assigned:'My Assigned Locations',
    selectWorker:'Select Worker',selectLocations:'Select Locations',
    printQR:'Print QR',exportCSV:'Export CSV',
    good:'On Track',late:'Overdue',none:'No report',sync:'Sync',
    quality:'Report Quality',sla:'SLA Status',heatmap:'Facility Map',
    type:'Type',floor:'Floor',zone:'Zone',priority:'Priority',
    high:'High',medium:'Medium',low:'Low',
    title:'Title',description:'Description',assignedTo:'Assigned To',
    createTicket:'Create Ticket',completeTicket:'Complete Ticket',
    open:'Open',closed:'Closed',
    restroom:'Restroom',lobby:'Lobby',office:'Office',meeting_room:'Meeting Room',
    pantry:'Pantry',corridor:'Corridor',prayer_room:'Prayer Room',elevator:'Elevator',
    entrance:'Entrance',parking:'Parking',outdoor:'Outdoor',other:'Other',
    operations:'Operations',management:'Management',settings:'Settings',
    demoAccounts:'Demo Accounts',scanQR:'Scan QR',
    reportSent:'Report submitted successfully',offlineSaved:'Report saved offline for later sync',
    pendingSync:'Pending Sync',noTickets:'No tickets',
    reportQuality:'Report Quality',filterAll:'All',filterPending:'Pending',filterApproved:'Approved',
    workerName:'Worker',reportsCount:'Reports',locationsCount:'Locations',usersCount:'Users',
    workersCount:'Workers',step1:'Select Site',step2:'Complete Tasks',step3:'Take Photos',step4:'Submit',
    myTickets:'My Tickets',priorityHigh:'High Priority',
  }
};

/* ─── SVG ICONS ──────────────────────────────────────────────── */
const IC = {
  dashboard:`<svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>`,
  reports:`<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
  tickets:`<svg viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  locations:`<svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
  assignments:`<svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  users:`<svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  analytics:`<svg viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
  bell:`<svg viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`,
  search:`<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  sync:`<svg viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>`,
  check:`<svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>`,
  x:`<svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  camera:`<svg viewBox="0 0 24 24"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>`,
  qr:`<svg viewBox="0 0 24 24"><rect x="3" y="3" width="5" height="5" rx=".5"/><rect x="16" y="3" width="5" height="5" rx=".5"/><rect x="3" y="16" width="5" height="5" rx=".5"/><path d="M21 16h-3v3"/><path d="M21 21v-3"/><path d="M16 21h-3v-3"/><path d="M13 16v-3h3"/><path d="M8 3H3v5"/><path d="M3 8v5h5"/></svg>`,
  logout:`<svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
  arrow:`<svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>`,
  edit:`<svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  trash:`<svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>`,
  plus:`<svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  building:`<svg viewBox="0 0 24 24"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>`,
  flip:`<svg viewBox="0 0 24 24"><path d="M1 4v6h6"/><path d="M23 20v-6h-6"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15"/></svg>`,
  user:`<svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  eye:`<svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
  'eye-off':`<svg viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`,
  'map-pin':`<svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
  'alert-circle':`<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  'bar-chart-2':`<svg viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
  smartphone:`<svg viewBox="0 0 24 24"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>`,
};
const ic=(name,size=18)=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${IC[name]?.replace(/<svg[^>]*>/,'').replace(/<\/svg>/,'')??''}</svg>`;

/* ─── STATE ──────────────────────────────────────────────────── */
let lang = localStorage.lang||'ar';
// Auth is cookie-based (HttpOnly) — no token stored in JS
let me = null, data = null, view = 'dashboard';
let currentPhotos = [], stream = null;
let editUserId = null, currentTicketId = null;
let reportFilter = 'all';
let usersSearch = '', usersRoleFilter = 'all';
let locsFloorFilter = 'all';
let assignFloorFilter = 'all';
let viewHistory = [];
let eventSource = null;
let forcePasswordChange = false;

const app = document.getElementById('app');
const tr = k => (T[lang]&&T[lang][k]) || k;
const esc = s => String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
function fmt(d){
  if(!d) return '—';
  const dt=new Date(d), pad=n=>String(n).padStart(2,'0');
  const Y=dt.getFullYear(), M=pad(dt.getMonth()+1), D=pad(dt.getDate());
  const hh=pad(dt.getHours()), mm=pad(dt.getMinutes());
  // 24-hour format — avoids Arabic ص/م which triggers bidi reordering
  return `${Y}/${M}/${D} · ${hh}:${mm}`;
}
function fmtDate(d){
  if(!d) return '—';
  const dt=new Date(d), pad=n=>String(n).padStart(2,'0');
  const Y=dt.getFullYear(), M=pad(dt.getMonth()+1), D=pad(dt.getDate());
  return lang==='ar' ? `${Y}/${M}/${D}` : `${M}/${D}/${Y}`;
}
/* num() — always Western digits, body font via CSS */
const num = v => String(v);
const offlineKey = 'rega_offline_v16';

/* ─── OFFLINE QUEUE ──────────────────────────────────────────── */
function getQ(){try{return JSON.parse(localStorage.getItem(offlineKey)||'[]')}catch(e){return[]}}
function setQ(q){localStorage.setItem(offlineKey,JSON.stringify(q))}

/* ─── API ────────────────────────────────────────────────────── */
async function api(path,opt={}){
  const r = await fetch('/api'+path,{
    ...opt,
    credentials:'include',
    headers:{
      'Content-Type':'application/json',
      'X-Requested-With':'XMLHttpRequest',
      ...(opt.headers||{})
    }
  });
  const txt = await r.text();
  let j = {};
  try{j = txt?JSON.parse(txt):{}}catch(e){}
  if(!r.ok) throw new Error(j.error||'ERROR');
  return j;
}

/* ─── TOAST ──────────────────────────────────────────────────── */
function toast(msg,type=''){
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span>${ic(type==='ok'?'check':type==='bad'?'x':'bell',16)}</span><span>${msg}</span>`;
  document.body.appendChild(el);
  setTimeout(()=>{el.style.opacity='0';el.style.transform='translateY(12px)';setTimeout(()=>el.remove(),300)},2600);
}

/* ─── IMAGE COMPRESSION ──────────────────────────────────────── */
function compactImage(dataUrl,maxW=1280,quality=.72){
  return new Promise(resolve=>{
    const img = new Image();
    img.onload = ()=>{
      const scale = Math.min(1,maxW/img.width);
      const c = document.createElement('canvas');
      c.width = Math.round(img.width*scale);
      c.height = Math.round(img.height*scale);
      c.getContext('2d').drawImage(img,0,0,c.width,c.height);
      resolve(c.toDataURL('image/jpeg',quality));
    };
    img.onerror = ()=>resolve(dataUrl);
    img.src = dataUrl;
  });
}

/* ─── SYNC OFFLINE QUEUE ─────────────────────────────────────── */
async function flushOfflineQueue(){
  const q = getQ();
  if(!q.length){toast(lang==='ar'?'لا توجد تقارير معلقة':'No pending reports');return}
  const remain = [];
  for(const item of q){
    try{await api('/reports',{method:'POST',body:JSON.stringify(item)})}
    catch(e){remain.push(item)}
  }
  setQ(remain);
  remain.length
    ? toast(lang==='ar'?'بقيت تقارير معلقة':'Some reports still pending','warn')
    : toast(lang==='ar'?'تمت المزامنة بنجاح':'Synced successfully','ok');
  await load();
  updateSyncDot();
}

function updateSyncDot(){
  const dot = document.querySelector('.tb-sync-dot');
  if(!dot) return;
  const n = getQ().length;
  dot.className = 'tb-sync-dot'+(n?'  pending':'');
  const lbl = document.querySelector('.tb-sync-lbl');
  if(lbl) lbl.textContent = n ? `${n} ${lang==='ar'?'معلق':'pending'}` : tr('sync');
}

/* ─── SOUND NOTIFICATIONS ───────────────────────────────────── */
function playSound(type){
  try{
    const ctx=new (window.AudioContext||window.webkitAudioContext)();
    const osc=ctx.createOscillator();
    const gain=ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    gain.gain.value=0.3;
    if(type==='approved'){ osc.frequency.value=880; osc.type='sine'; }
    else if(type==='rejected'){ osc.frequency.value=330; osc.type='square'; }
    else if(type==='needs_recleaning'){ osc.frequency.value=550; osc.type='triangle'; }
    else if(type==='new_report'){ osc.frequency.value=660; osc.type='sine'; }
    else if(type==='new_ticket'){ osc.frequency.value=440; osc.type='sawtooth'; }
    else{ osc.frequency.value=600; osc.type='sine'; }
    osc.start();
    if(type==='needs_recleaning'){
      setTimeout(()=>{osc.frequency.value=650},150);
    }
    gain.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.5);
    osc.stop(ctx.currentTime+0.5);
  }catch(e){}
}

/* ─── SSE (Realtime Sync) — cookie-based, no token in URL ─── */
function connectSSE(){
  if(eventSource){ eventSource.close(); eventSource=null; }
  if(!me) return;
  eventSource=new EventSource('/api/events');
  eventSource.addEventListener('report_created',e=>{
    const d=JSON.parse(e.data);
    playSound('new_report');
    toast(lang==='ar'?'تقرير جديد: '+d.report.locationNameAr:'New report: '+d.report.locationNameEn,'ok');
    load();
  });
  eventSource.addEventListener('report_reviewed',e=>{
    const d=JSON.parse(e.data);
    const st=d.report.approvalStatus;
    playSound(st);
    const msgs={approved:lang==='ar'?'تم اعتماد التقرير':'Report approved',rejected:lang==='ar'?'تم رفض التقرير':'Report rejected',needs_recleaning:lang==='ar'?'مطلوب إعادة تنظيف':'Re-cleaning required'};
    toast(msgs[st]||st, st==='approved'?'ok':'bad');
    load();
  });
  eventSource.addEventListener('ticket_created',e=>{
    const d=JSON.parse(e.data);
    playSound('new_ticket');
    toast(lang==='ar'?'بلاغ جديد: '+d.ticket.title:'New ticket: '+d.ticket.title,'warn');
    load();
  });
  eventSource.addEventListener('ticket_completed',e=>{
    playSound('approved');
    toast(lang==='ar'?'تم إغلاق بلاغ':'Ticket completed','ok');
    load();
  });
  eventSource.onerror=()=>{
    eventSource.close(); eventSource=null;
    setTimeout(connectSSE,5000);
  };
}

/* ─── BACK NAVIGATION ──────────────────────────────────────── */
function navigateTo(v){
  if(view!==v) viewHistory.push(view);
  view=v; render();
}
function goBack(){
  if(viewHistory.length){ view=viewHistory.pop(); render(); }
}

/* ─── CORE FLOW ──────────────────────────────────────────────── */
function setDoc(){
  document.documentElement.lang = lang;
  document.documentElement.dir = lang==='ar'?'rtl':'ltr';
}
async function load(){
  try{const b = await api('/bootstrap');data=b;me=b.user;render();connectSSE()}
  catch(e){logout()}
}
async function login(){
  try{
    const username = document.getElementById('lu').value.trim();
    const r = await api('/login',{method:'POST',body:JSON.stringify({username,password:document.getElementById('lp').value})});
    // No token stored — server sets HttpOnly cookie
    me=r.user;
    if(r.forcePasswordChange){ forcePasswordChange=true; showForcePasswordChange(); return; }
    await load();
  }catch(e){
    const msg=e.message==='TOO_MANY_ATTEMPTS'?(lang==='ar'?'محاولات كثيرة، حاول لاحقاً':'Too many attempts, try later'):tr('invalid');
    toast(msg,'bad');
  }
}
async function logout(){
  try{ await api('/logout',{method:'POST'}); }catch{ /* server already cleared session */ }
  me=null;data=null;forcePasswordChange=false;
  if(eventSource){eventSource.close();eventSource=null;}
  viewHistory=[];
  loginPage();
}
function switchLang(){lang=lang==='ar'?'en':'ar';localStorage.lang=lang;setDoc();render()}
function togglePwd(){
  const inp=document.getElementById('lp');
  const btn=document.getElementById('pwdToggle');
  if(!inp||!btn)return;
  if(inp.type==='password'){inp.type='text';btn.innerHTML=ic('eye',16);}
  else{inp.type='password';btn.innerHTML=ic('eye-off',16);}
}
function roleLabel(r){return tr(r)}
function initials(n=''){return n.trim().split(/\s+/).slice(0,2).map(x=>x[0]||'').join('').toUpperCase()||'?'}
function canUsers(){return ['system_admin','cleaning_manager'].includes(me.role)}
function canManageUsers(){return ['system_admin','cleaning_manager'].includes(me.role)}
function canManage(){return ['system_admin','facility_manager','cleaning_manager'].includes(me.role)}
function canTicket(){return ['system_admin','facility_manager','cleaning_manager','cleaning_supervisor'].includes(me.role)}
function canReview(){return ['system_admin','facility_manager','cleaning_manager','cleaning_supervisor'].includes(me.role)}
function locName(l){return lang==='ar'?(l.nameAr||l.nameEn):(l.nameEn||l.nameAr)}

function roleBadgeClass(role){
  return {system_admin:'role-admin',facility_manager:'role-fm',cleaning_manager:'role-cleaning-manager',cleaning_supervisor:'role-cs',cleaner:'role-cleaner'}[role]||'';
}


function activityFeed(){
  // Combine recent reports and tickets into a unified activity feed
  const items = [
    ...(data.reports||[]).slice(0,8).map(r=>({type:'report',time:r.createdAt,label:locName((data.locations||[]).find(l=>l.id===r.locationId)||{})||r.locationNameAr||r.locationNameEn,sub:esc(r.workerName),st:r.approvalStatus||'pending_approval'})),
    ...(data.tickets||[]).slice(0,4).map(t=>({type:'ticket',time:t.createdAt,label:esc(t.title),sub:esc(lang==='ar'?t.locationNameAr:t.locationNameEn),st:t.status}))
  ].sort((a,b)=>new Date(b.time)-new Date(a.time)).slice(0,8);

  if(!items.length) return `<div class="empty-state"><div class="empty-icon">${ic('bell',22)}</div><div class="empty-title">${tr('noData')}</div></div>`;
  return `<div class="activityFeed">${items.map(it=>{
    const isReport = it.type==='report';
    const dotBg = isReport
      ? (it.st==='approved'?'var(--ok-bg)':it.st==='rejected'||it.st==='needs_recleaning'?'var(--bad-bg)':'var(--warn-bg)')
      : (it.st==='completed'?'var(--ok-bg)':'var(--bad-bg)');
    const dotClr = isReport
      ? (it.st==='approved'?'var(--ok)':it.st==='rejected'||it.st==='needs_recleaning'?'var(--bad)':'var(--warn)')
      : (it.st==='completed'?'var(--ok)':'var(--bad)');
    return`<div class="activityItem">
      <div class="activityDot" style="background:${dotBg};color:${dotClr}">${ic(isReport?'reports':'tickets',14)}</div>
      <div class="activityBody">
        <div class="activityTitle">${it.label}</div>
        <div class="activitySub">${it.sub}</div>
        <div class="activityTime">${fmt(it.time)}</div>
      </div>
    </div>`;
  }).join('')}</div>`;
}

/* ─── RENDER DISPATCHER ──────────────────────────────────────── */
let _lastView = null;
function render(){
  if(!me||!data) return loginPage();
  if(me.role==='cleaner') return renderWorker();
  setDoc();
  // Reset users filter state when navigating away from users
  if(_lastView==='users' && view!=='users'){ usersSearch=''; usersRoleFilter='all'; }
  if(_lastView==='locations' && view!=='locations'){ locsFloorFilter='all'; }
  if(_lastView==='assignments' && view!=='assignments'){ assignFloorFilter='all'; }
  _lastView = view;
  const fn = {dashboard:dash,reports:reports,tickets:tickets,locations:locations,assignments:assignments,users:users}[view]||dash;
  shell(fn());
  if(view==='assignments') setTimeout(fillAssign, 0);
}

/* ═══════════════════════════════════════════════════════════════
   LOGIN PAGE
   ═══════════════════════════════════════════════════════════════ */
function loginPage(){
  setDoc();
  const heroFeatures = lang==='ar'
    ? [
        {text:'إدارة متكاملة لجميع المرافق والخدمات', svg:`<svg viewBox="0 0 24 24" fill="none"><path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 10h.01"/><path d="M15 10h.01"/><path d="M9 14h.01"/><path d="M15 14h.01"/></svg>`},
        {text:'متابعة الأعمال والتقارير لحظياً',       svg:`<svg viewBox="0 0 24 24" fill="none"><path d="M3 3v18h18"/><path d="M7 14l4-4 3 3 5-7"/></svg>`},
        {text:'صلاحيات مرنة تناسب احتياجاتك',         svg:`<svg viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`},
        {text:'أمان عالي وحماية للبيانات',             svg:`<svg viewBox="0 0 24 24" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`},
      ]
    : [
        {text:'Integrated management for all facilities and services', svg:`<svg viewBox="0 0 24 24" fill="none"><path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 10h.01"/><path d="M15 10h.01"/><path d="M9 14h.01"/><path d="M15 14h.01"/></svg>`},
        {text:'Live work tracking and reports',                        svg:`<svg viewBox="0 0 24 24" fill="none"><path d="M3 3v18h18"/><path d="M7 14l4-4 3 3 5-7"/></svg>`},
        {text:'Flexible permissions for your needs',                   svg:`<svg viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`},
        {text:'High security and data protection',                     svg:`<svg viewBox="0 0 24 24" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`},
      ];
  app.innerHTML=`
<main class="loginPage">
  <div class="loginBox">
    <div class="loginHero">
      <div class="heroContent">
        <h1>${tr('loginTitle')}</h1>
        <p>${tr('sub')}</p>
        <div class="heroFeatures">
          ${heroFeatures.map(f=>`
            <div class="heroFeature">
              <span class="featureDot"></span>
              <span class="featureIcon">${f.svg}</span>
              <span class="featureText">${f.text}</span>
            </div>`).join('')}
        </div>
      </div>
      <div class="heroSignature">By Abdulaziz M. AlMutairi</div>
    </div>
    <div class="loginPanel">
      <div class="loginPanel-logo">
        <img src="/assets/logos/logo-icon-dark.svg" onerror="this.src='/assets/logos/logo-icon-light.svg'" alt="REGA">
      </div>
      <h2 class="loginPanel-title">${tr('app')}</h2>
      <div class="field">
        <label>${tr('user')}</label>
        <div class="input-wrap">
          <input id="lu" class="form-control" type="text" autocomplete="username" placeholder="${tr('user')}" />
          <span class="input-icon" aria-hidden="true">${ic('user',16)}</span>
        </div>
      </div>
      <div class="field">
        <label>${tr('pass')}</label>
        <div class="input-wrap">
          <input id="lp" class="form-control" type="password" autocomplete="current-password" placeholder="${tr('pass')}" />
          <button class="input-icon input-icon-btn" id="pwdToggle" onclick="togglePwd()" type="button" tabindex="-1" aria-label="${lang==='ar'?'إظهار/إخفاء كلمة المرور':'Toggle password visibility'}">${ic('eye-off',16)}</button>
        </div>
      </div>
      <button class="btn wide" onclick="login()">${tr('login')}</button>
      <button class="btn secondary wide" style="margin-top:10px" onclick="switchLang()">${tr('lang')}</button>
      <div class="prototype-notice-login">
        ${lang==='ar'
          ? '⚠ نسخة تجريبية — بيانات غير حقيقية. للمحاكاة البصرية فقط.'
          : '⚠ Prototype — Demo data only. Visual simulation purposes only.'}
      </div>
      <p class="loginPanel-foot">${lang==='ar'?'الدخول متاح فقط للمستخدمين المصرح لهم داخل المنصة.':'Access is restricted to authorized platform users only.'}</p>
      <p class="loginPanel-foot" style="font-size:10px;margin-top:6px;color:var(--muted)">${lang==='ar'?'استخدام الهوية البصرية لأغراض المحاكاة فقط — ليست نسخة إنتاجية':'Visual identity used for simulation purposes only — not a production deployment'}</p>
    </div>
  </div>
</main>`;
  document.getElementById('lp').addEventListener('keydown',e=>{if(e.key==='Enter')login()});
}

/* ═══════════════════════════════════════════════════════════════
   FORCE PASSWORD CHANGE
   ═══════════════════════════════════════════════════════════════ */
function showForcePasswordChange(){
  setDoc();
  app.innerHTML=`
<main class="loginPage">
  <div class="fpBox">
    <div class="fpBox-logo">
      <img src="/assets/logos/logo-icon-dark.svg" onerror="this.src='/assets/logos/logo-icon-light.svg'" alt="REGA">
    </div>
    <h2 class="fpBox-title">${lang==='ar'?'تغيير كلمة المرور':'Change Password'}</h2>
    <p class="fpBox-sub">${lang==='ar'?'يجب تغيير كلمة المرور المؤقتة قبل استخدام النظام':'You must change your temporary password before using the system'}</p>
    <div class="field">
      <label>${lang==='ar'?'كلمة المرور الجديدة':'New Password'}</label>
      <input id="fpNewPwd" type="password" oninput="checkPwdStrength()">
    </div>
    <div id="pwdStrength" style="margin-bottom:8px"></div>
    <div class="field">
      <label>${lang==='ar'?'تأكيد كلمة المرور':'Confirm Password'}</label>
      <input id="fpConfirmPwd" type="password">
    </div>
    <div id="fpError" style="color:var(--bad);font-size:var(--fs-xs);min-height:20px;margin-bottom:8px"></div>
    <button class="btn wide" onclick="submitForcePassword()">${lang==='ar'?'حفظ كلمة المرور الجديدة':'Save New Password'}</button>
    <button class="btn secondary wide" style="margin-top:10px" onclick="logout()">${lang==='ar'?'تسجيل خروج':'Logout'}</button>
  </div>
</main>`;
}

function checkPwdStrength(){
  const pwd=document.getElementById('fpNewPwd')?.value||'';
  const el=document.getElementById('pwdStrength');
  if(!el)return;
  let score=0, tips=[];
  if(pwd.length>=6) score++; else tips.push(lang==='ar'?'٦ أحرف على الأقل':'At least 6 characters');
  if(pwd.length>=8) score++;
  if(/[A-Z]/.test(pwd)) score++; else tips.push(lang==='ar'?'حرف كبير':'Uppercase letter');
  if(/[0-9]/.test(pwd)) score++; else tips.push(lang==='ar'?'رقم':'Number');
  if(/[^a-zA-Z0-9]/.test(pwd)) score++; else tips.push(lang==='ar'?'رمز خاص':'Special character');
  const labels=lang==='ar'?['','ضعيفة','مقبولة','جيدة','قوية','ممتازة']:['','Weak','Fair','Good','Strong','Excellent'];
  const colors=['','var(--bad)','var(--warn)','var(--gold)','var(--ok)','var(--brand-mid)'];
  const pct=Math.min(100,score*20);
  el.innerHTML=pwd?`
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
      <div style="flex:1;height:4px;background:var(--surface-3);border-radius:2px;overflow:hidden">
        <div style="width:${pct}%;height:100%;background:${colors[score]};transition:all .3s"></div>
      </div>
      <span style="font-size:var(--fs-xs);font-weight:700;color:${colors[score]}">${labels[score]}</span>
    </div>
    ${tips.length?`<div style="font-size:10px;color:var(--muted)">${tips.join(' · ')}</div>`:''}
  `:'';
}

async function submitForcePassword(){
  const newPwd=document.getElementById('fpNewPwd')?.value||'';
  const confirm=document.getElementById('fpConfirmPwd')?.value||'';
  const errEl=document.getElementById('fpError');
  if(newPwd.length<6){errEl.textContent=lang==='ar'?'كلمة المرور قصيرة (٦ أحرف على الأقل)':'Password too short (min 6 chars)';return}
  if(newPwd!==confirm){errEl.textContent=lang==='ar'?'كلمتا المرور غير متطابقتين':'Passwords do not match';return}
  try{
    await api('/change-password',{method:'POST',body:JSON.stringify({newPassword:newPwd})});
    forcePasswordChange=false;
    toast(lang==='ar'?'تم تغيير كلمة المرور بنجاح':'Password changed successfully','ok');
    await load();
  }catch(e){
    const msg=e.message==='SAME_PASSWORD'?(lang==='ar'?'لا يمكن استخدام كلمة المرور القديمة':'Cannot use the old password'):(lang==='ar'?'حدث خطأ':'Error');
    errEl.textContent=msg;
  }
}

/* ═══════════════════════════════════════════════════════════════
   APP SHELL
   ═══════════════════════════════════════════════════════════════ */
function shell(content){
  const qSize = getQ().length;
  const openTickets = (data.tickets||[]).filter(t=>t.status==='open').length;
  const pendingReports = (data.reports||[]).filter(r=>(r.approvalStatus||'pending')==='pending').length;

  app.innerHTML=`
<div class="appShell">
  <!-- PROTOTYPE BANNER -->
  <div class="prototype-banner" role="alert">
    ${lang==='ar'
      ? '⚠ نسخة تجريبية — بيانات غير حقيقية — استخدام الهوية البصرية لأغراض المحاكاة فقط'
      : '⚠ Prototype — Demo Data Only — Visual identity used for simulation purposes only'}
  </div>
  <!-- TOP BAR -->
  <header class="topbar">
    <div class="topbar-inner">
      <div class="topbar-start">
        ${viewHistory.length?`<button class="icon-btn tb-back" onclick="goBack()" title="${lang==='ar'?'رجوع':'Back'}">${ic('arrow',20)}</button>`:''}
        <div class="tb-brand">
          <div class="tb-brand-icon">
            <img src="/assets/logos/logo-icon-dark.svg" onerror="this.style.display='none'" alt="REGA">
          </div>
          <span class="tb-brand-name">منصة العناية بالمرافق</span>
        </div>
      </div>
      <div class="topbar-end">
        ${qSize>0?`<button class="tb-sync pending" onclick="flushOfflineQueue()" title="${tr('sync')}">
          <span class="tb-sync-dot pending"></span>
          <span class="tb-sync-lbl">${qSize} ${lang==='ar'?'معلق':'pending'}</span>
        </button>`:`<button class="tb-sync" onclick="flushOfflineQueue()" title="${tr('sync')}">
          <span class="tb-sync-dot"></span>
          <span class="tb-sync-lbl">${tr('sync')}</span>
        </button>`}
        <button class="icon-btn tb-notif" id="tb-notif-btn" onclick="toggleNotif(event)" title="${lang==='ar'?'الإشعارات':'Notifications'}">
          ${ic('bell',20)}
          ${pendingReports>0||openTickets>0?`<span class="tb-notif-badge"></span>`:''}
        </button>
        <button class="tb-lang" onclick="switchLang()">${tr('lang')}</button>
        <button class="tb-logout icon-btn" onclick="logout()" title="${tr('logout')}">${ic('logout',18)}</button>
      </div>
    </div>
  </header>

  <!-- BODY -->
  <div class="appBody">
    <!-- SIDEBAR -->
    <aside class="sidebar">
      <div class="sidebarInner">
        <div class="nav-section">
          <span class="nav-section-label">${tr('operations')}</span>
          ${navItem('dashboard',tr('dashboard'),'dashboard',0)}
          ${navItem('reports',tr('reports'),'reports',pendingReports)}
          ${navItem('tickets',tr('tickets'),'tickets',openTickets)}
        </div>
        <div class="nav-section">
          <span class="nav-section-label">${tr('management')}</span>
          ${navItem('locations',tr('locations'),'locations',0)}
          ${navItem('assignments',tr('assignments'),'assignments',0)}
          ${canUsers()?navItem('users',tr('users'),'users',0):''}
        </div>
      </div>
      <div class="sidebar-footer">
        <div class="sidebar-user">
          <div class="sidebar-user-avatar">${esc(initials(me.name))}</div>
          <div style="min-width:0;flex:1">
            <div class="sidebar-user-name">${esc(me.name)}</div>
            <div class="sidebar-user-role">${roleLabel(me.role)}</div>
          </div>
        </div>
      </div>
    </aside>

    <!-- MAIN CONTENT -->
    <main class="mainContent">
      <div class="pageAnim">
        ${content}
      </div>
    </main>
  </div>
  <div style="position:fixed;bottom:8px;left:50%;transform:translateX(-50%);font-size:11px;color:var(--muted-light,rgba(0,0,0,.25));pointer-events:none;z-index:1;white-space:nowrap;font-family:var(--font-body)">By Abdulaziz M. AlMutairi</div>
</div>`;
}

function navItem(v,label,icon,count){
  return `<button class="navBtn${view===v?' active':''}" onclick="navigateTo('${v}')">
    <span class="navBtn-icon">${ic(icon,18)}</span>
    <span class="navBtn-label">${label}</span>
    ${count>0?`<span class="navBtn-badge">${num(count)}</span>`:''}
  </button>`;
}

/* ═══════════════════════════════════════════════════════════════
   DASHBOARD — OPERATIONS CENTER
   ═══════════════════════════════════════════════════════════════ */
function stats(){
  const today = (data.reports||[]).filter(r=>(r.createdAt||'').slice(0,10)===new Date().toISOString().slice(0,10));
  const covered = new Set(today.map(r=>r.locationId)).size;
  return {
    today,
    coverage: data.locations.length ? Math.round(covered/data.locations.length*100) : 0,
    pending: (data.reports||[]).filter(r=>(r.approvalStatus||'pending')==='pending').length,
    openTickets: (data.tickets||[]).filter(t=>t.status==='open').length
  };
}
function qualityScore(r){
  const photos = (r.photos||[]).length;
  const tasks = (r.tasks||[]).length;
  return Math.min(100,Math.round((photos>=2?45:photos?25:0)+(tasks>=4?45:tasks*8)+(r.notes?10:0)));
}

function dash(){
  const s = stats();
  const days = [6,5,4,3,2,1,0].map(i=>{
    const d = new Date(); d.setDate(d.getDate()-i);
    const k = d.toISOString().slice(0,10);
    return{
      label: d.toLocaleDateString(lang==='ar'?'ar-SA':'en-US',{weekday:'short'}),
      count: (data.reports||[]).filter(r=>(r.createdAt||'').slice(0,10)===k).length,
      isToday: i===0
    };
  });
  const max = Math.max(1,...days.map(d=>d.count));
  const avgQ = data.reports.length
    ? Math.round(data.reports.slice(0,12).reduce((a,r)=>a+qualityScore(r),0)/Math.min(12,data.reports.length))
    : 0;
  const slaPct = Math.max(10,100-Math.min(100,s.openTickets*18));
  const hour = new Date().getHours();
  const greeting = lang==='ar'
    ? (hour<12?'صباح الخير':'مساء الخير')
    : (hour<12?'Good morning':'Good afternoon');

  return `
<!-- HERO BANNER -->
<div class="dashHero">
  <div class="dashHero-left">
    <span class="dashHero-greeting">${greeting}،</span>
    <div class="dashHero-title">${esc(me.name.split(' ')[0])}</div>
    <p class="dashHero-sub">${tr('opsCenter')} · ${fmtDate(new Date())}</p>
  </div>
  <div class="dashHero-right">
    <div class="dashHero-stat">
      <div class="dashHero-stat-val">${num(s.today.length)}</div>
      <div class="dashHero-stat-lbl">${tr('today')}</div>
    </div>
    <div class="dashHero-stat">
      <div class="dashHero-stat-val">${num(s.coverage)}%</div>
      <div class="dashHero-stat-lbl">${tr('coverage')}</div>
    </div>
    <div class="dashHero-stat">
      <div class="dashHero-stat-val">${num(data.locations.length)}</div>
      <div class="dashHero-stat-lbl">${tr('locationsCount')}</div>
    </div>
  </div>
</div>

<!-- KPI CARDS -->
<div class="kpiGrid">
  ${kpiCard(num(s.today.length),tr('today'),'reports','brand','rgba(10,78,91,.10)','var(--brand-mid)')}
  ${kpiCard(num(s.coverage)+'%',tr('coverage'),'locations','ok','rgba(22,136,77,.10)','var(--ok)')}
  ${kpiCard(num(s.pending),tr('pending'),'bell','warn','rgba(166,98,0,.10)','var(--warn)')}
  ${kpiCard(num(s.openTickets),tr('openTickets'),'tickets','bad','rgba(200,50,50,.10)','var(--bad)')}
</div>

<!-- ANALYTICS ROW -->
<div class="analyticsGrid">
  <!-- 7-day bar chart -->
  <div class="chartCard">
    <div class="chartCard-head">
      <span class="chartCard-title">${tr('analytics')}</span>
      <span class="badge brand">7 ${lang==='ar'?'أيام':'days'}</span>
    </div>
    <div class="bars7" style="height:110px;align-items:flex-end;gap:8px">
      ${days.map(d=>{
        const h = max>0?Math.max(8,Math.round(d.count/max*100)):8;
        return`<div class="bar-col">
          <span class="bar-count">${d.count?num(d.count):''}</span>
          <div class="bar-track">
            <div class="bar-fill${d.isToday?' highlight':d.count===0?' low':''}" style="height:${h}%"></div>
          </div>
          <span class="bar-label">${d.label}</span>
        </div>`;
      }).join('')}
    </div>
  </div>

  <!-- Quality -->
  <div class="chartCard">
    <div class="chartCard-head">
      <span class="chartCard-title">${tr('quality')}</span>
      <span class="badge gold">${num(avgQ)}%</span>
    </div>
    <div style="display:grid;gap:12px;margin-top:8px">
      <div>
        <div style="display:flex;justify-content:space-between;margin-bottom:6px">
          <span style="font-size:var(--fs-xs);color:var(--muted);font-weight:700">${lang==='ar'?'جودة التقارير':'Report quality'}</span>
          <span style="font-size:var(--fs-xs);font-weight:800;font-family:var(--font-body)">${num(avgQ)}%</span>
        </div>
        <div class="progress-track"><div class="progress-fill ${avgQ>=70?'ok':avgQ>=40?'gold':'warn'}" style="width:${avgQ}%"></div></div>
      </div>
      <div>
        <div style="display:flex;justify-content:space-between;margin-bottom:6px">
          <span style="font-size:var(--fs-xs);color:var(--muted);font-weight:700">${lang==='ar'?'التغطية اليومية':'Daily coverage'}</span>
          <span style="font-size:var(--fs-xs);font-weight:800;font-family:var(--font-body)">${num(s.coverage)}%</span>
        </div>
        <div class="progress-track"><div class="progress-fill ${s.coverage>=80?'ok':s.coverage>=50?'gold':'warn'}" style="width:${s.coverage}%"></div></div>
      </div>
    </div>
  </div>

  <!-- SLA -->
  <div class="chartCard">
    <div class="chartCard-head">
      <span class="chartCard-title">${tr('sla')}</span>
      <span class="badge ${s.openTickets===0?'ok':s.openTickets<=2?'warn':'bad'}">${s.openTickets===0?tr('good'):`${num(s.openTickets)} ${tr('open')}`}</span>
    </div>
    <div class="slaIndicator" style="margin-top:8px;padding:14px;border:1px solid var(--line);border-radius:var(--r);background:var(--surface-2)">
      <div class="slaStatus ${s.openTickets===0?'ok':s.openTickets<=2?'warn':'bad'}">${s.openTickets===0?(lang==='ar'?'كل البلاغات مغلقة':'All tickets resolved'):lang==='ar'?`${num(s.openTickets)} بلاغ مفتوح`:`${num(s.openTickets)} open tickets`}</div>
      <div class="progress-track" style="margin-top:8px"><div class="progress-fill ${slaPct>70?'ok':slaPct>40?'gold':'bad'}" style="width:${slaPct}%"></div></div>
      <p style="font-size:var(--fs-xs);color:var(--muted);margin-top:8px;line-height:1.6">${lang==='ar'?'مؤشر يعتمد على البلاغات المفتوحة':'Based on open ticket count'}</p>
    </div>
  </div>
</div>

<!-- BOTTOM ROW: recent reports + activity feed -->
<div class="contentGrid">
  <div class="card">
    <div class="card-head">
      <span class="card-title">${tr('latest')}</span>
      <button class="btn secondary sm" onclick="navigateTo('reports')">${tr('reports')}</button>
    </div>
    ${miniReportList(data.reports.slice(0,6))}
  </div>
  <div class="card">
    <div class="card-head">
      <span class="card-title">${lang==='ar'?'النشاط الأخير':'Recent Activity'}</span>
      <span class="badge brand">${num((data.reports||[]).length + (data.tickets||[]).length)} ${lang==='ar'?'حدث':'events'}</span>
    </div>
    ${activityFeed()}
  </div>
</div>`;
}

function kpiCard(value,label,icon,color,bg,stroke){
  return `<div class="kpiCard">
    <div class="kpiCard-body">
      <div class="kpiCard-label">${label}</div>
      <div class="kpiCard-value">${value}</div>
    </div>
    <div class="kpiCard-icon" style="background:${bg};color:${stroke}">${ic(icon,22)}</div>
  </div>`;
}

function mapNode(l){
  const last = data.reports.find(r=>r.locationId===l.id);
  const late = !last||Date.now()-new Date(last.createdAt).getTime()>(data.settings.frequencyMinutes||120)*60000;
  return`<div class="mapNode ${late?'late':'ok'}">
    <div class="mapNode-name">${esc(locName(l))}</div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:4px">
      <span class="mapNode-meta">${tr(l.type)} · ${l.floor||'—'}</span>
      <span class="badge ${late?'bad':'ok'}" style="padding:2px 7px;font-size:9px">${late?tr('late'):tr('good')}</span>
    </div>
  </div>`;
}

function miniReportList(items){
  if(!items.length) return `<div class="empty-state"><div class="empty-icon">${ic('reports',24)}</div><div class="empty-title">${tr('noData')}</div></div>`;
  return `<div>${items.map(r=>{
    const imgs = imgList(r);
    const q = qualityScore(r);
    const st = r.approvalStatus||'pending_approval';
    return`<div class="list-row">
      ${imgs[0]?`<img src="${imgs[0]}" style="width:44px;height:44px;object-fit:cover;border-radius:var(--r-sm);flex-shrink:0">`:
        `<div class="list-icon" style="background:var(--surface-3);color:var(--muted)">${ic('reports',18)}</div>`}
      <div class="list-body">
        <div class="list-title">${esc(lang==='ar'?r.locationNameAr:r.locationNameEn)}</div>
        <div class="list-sub">${esc(r.workerName)} · ${fmt(r.createdAt)}</div>
      </div>
      <div class="list-end">
        <span class="badge ${st==='approved'?'ok':st==='rejected'||st==='needs_recleaning'?'bad':'warn'}">${tr(st)}</span>
      </div>
    </div>`;
  }).join('')}</div>`;
}

/* ═══════════════════════════════════════════════════════════════
   REPORTS PAGE
   ═══════════════════════════════════════════════════════════════ */
function imgList(r){return (r.photos&&r.photos.length?r.photos:(r.photo?[r.photo]:[])).filter(Boolean)}
function taskSetFor(type){return type==='restroom'?TASKS.restroom:TASKS.default}
function taskDone(tasks,pair){return (tasks||[]).includes(pair[0])||(tasks||[]).includes(pair[1])}

function reports(){
  const filters = [
    {key:'all',label:tr('filterAll')},
    {key:'pending',label:tr('filterPending')},
    {key:'approved',label:tr('filterApproved')},
    {key:'rejected',label:lang==='ar'?'مرفوض':'Rejected'},
    {key:'needs_recleaning',label:tr('reclean')},
  ];
  const filtered = (data.reports||[]).filter(r=>{
    if(reportFilter==='all') return true;
    if(reportFilter==='pending') return (r.approvalStatus||'pending')==='pending_approval'||(r.approvalStatus||'pending')==='pending';
    return r.approvalStatus===reportFilter;
  });
  return`
<div class="pageHeader">
  <div class="pageHeader-left">
    <div class="pageTitle">${tr('reports')}</div>
    <div class="pageSub">${num(filtered.length)} ${lang==='ar'?'تقرير':'reports'}</div>
  </div>
  <div class="pageActions">
    <button class="btn secondary sm" onclick="exportExcelReports()">${ic('arrow',14)} ${lang==='ar'?'تصدير Excel':'Excel'}</button>
    <button class="btn secondary sm" onclick="exportPDFReports()">${ic('reports',14)} ${lang==='ar'?'تصدير PDF':'PDF'}</button>
    <button class="btn secondary sm" onclick="load()">${ic('sync',14)} ${lang==='ar'?'تحديث':'Refresh'}</button>
  </div>
</div>
<div class="filterBar">
  <div class="filterChips">
    ${filters.map(f=>`<button class="filterChip${reportFilter===f.key?' active':''}" onclick="reportFilter='${f.key}';render()">${f.label}</button>`).join('')}
  </div>
</div>
${filtered.length===0
  ? `<div class="card"><div class="empty-state"><div class="empty-icon">${ic('reports',28)}</div><div class="empty-title">${tr('noData')}</div></div></div>`
  : `<div class="reportGrid">${filtered.map(r=>reportCard(r,true)).join('')}</div>`}`;
}

function reportCard(r,full){
  const imgs = imgList(r);
  const st = r.approvalStatus||'pending_approval';
  const q = qualityScore(r);
  const tasks = taskSetFor(r.locationType);
  return`<article class="reportCard">
    <div class="reportCard-media ${imgs.length<=1?'single':''}">
      ${imgs.length
        ? imgs.slice(0,4).map((src,i)=>`<img class="reportCard-thumb" src="${src}" loading="lazy" onclick='openGallery(${JSON.stringify(imgs)},${i})' alt="">`).join('')
        : `<div style="display:grid;place-items:center;height:120px;background:var(--surface-3);color:var(--muted)">${ic('camera',28)}</div>`}
    </div>
    <div class="reportCard-body">
      <div>
        <div class="reportCard-loc">${esc(lang==='ar'?r.locationNameAr:r.locationNameEn)}</div>
        <div class="reportCard-meta">${ic('users',12)} ${esc(r.workerName)} &nbsp;·&nbsp; ${fmt(r.createdAt)} &nbsp;·&nbsp; ${tr(r.locationType||'other')}</div>
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap">
        <span class="badge brand">${ic('camera',10)} ${num(imgs.length)}</span>
        <span class="badge gold">${tr('quality')}: ${num(q)}%</span>
        <span class="badge ${st==='approved'?'ok':st==='rejected'||st==='needs_recleaning'?'bad':'warn'}">${tr(st)}</span>
      </div>
      ${r.notes?`<div style="font-size:var(--fs-xs);color:var(--muted);line-height:1.6;padding:8px;background:var(--surface-3);border-radius:var(--r-sm)">${esc(r.notes)}</div>`:''}
      <details>
        <summary style="font-size:var(--fs-xs);font-weight:700;color:var(--brand-mid);cursor:pointer;list-style:none;padding:4px 0">${tr('taskResults')} (${num(tasks.length)})</summary>
        <div class="reportCard-tasks" style="margin-top:8px">
          ${tasks.map(p=>{const ok=taskDone(r.tasks,p);return`<div class="taskResult ${ok?'done':'missing'}"><span>${esc(lang==='ar'?p[0]:p[1])}</span><span class="taskMark">${ok?'✓':'×'}</span></div>`}).join('')}
        </div>
      </details>
      ${full&&canReview()?`
        <div class="reportCard-actions">
          <button class="btn ok sm action-btn" onclick="reviewReport('${r.id}','approved')">${ic('check',14)} ${tr('approve')}</button>
          <button class="btn danger sm action-btn" onclick="reviewReport('${r.id}','rejected')">${ic('x',14)} ${tr('reject')}</button>
          <button class="btn warn sm action-btn" onclick="reviewReport('${r.id}','needs_recleaning')">${ic('flip',14)} ${tr('reclean')}</button>
          ${canDelete()?`<button class="btn danger sm action-btn" onclick="deleteReport('${r.id}')">${ic('trash',14)} ${lang==='ar'?'حذف':'Delete'}</button>`:''}
        </div>`:''}
    </div>
  </article>`;
}

async function reviewReport(id,status){
  await api('/reports/review',{method:'POST',body:JSON.stringify({id,status})});
  toast(tr('saved'),'ok');
  await load();
}

function canDelete(){return['system_admin','facility_manager','cleaning_manager'].includes(me.role)}

/* ─── NOTIFICATION PANEL ─────────────────────────────────── */
function toggleNotif(e){
  e.stopPropagation();
  const btn=document.getElementById('tb-notif-btn');
  if(!btn) return;
  const existing=document.getElementById('notifPanel');
  if(existing){ existing.remove(); return; }

  // Build items: pending reports + open tickets
  const pendingReps=(data.reports||[]).filter(r=>(r.approvalStatus||'pending')==='pending'||r.approvalStatus==='pending_approval');
  const openTkts=(data.tickets||[]).filter(t=>t.status==='open');

  const items=[
    ...pendingReps.map(r=>({
      color:'var(--warn)',
      label: lang==='ar'? `تقرير بانتظار الاعتماد` : 'Report pending approval',
      sub:   (lang==='ar'?r.locationNameAr:r.locationNameEn)||r.locationNameAr,
      time:  fmt(r.createdAt),
      go:()=>{ view='reports'; reportFilter='pending'; render(); }
    })),
    ...openTkts.map(t=>({
      color:'var(--bad)',
      label: esc(t.title),
      sub:   lang==='ar'? `بلاغ مفتوح` : 'Open ticket',
      time:  fmt(t.createdAt),
      go:()=>{ view='tickets'; render(); }
    }))
  ].sort((a,b)=>0); // keep order

  const panel=document.createElement('div');
  panel.id='notifPanel';
  panel.className='notifPanel';
  panel.innerHTML=`
    <div class="notifPanel-head">
      <span class="notifPanel-title">${lang==='ar'?'الإشعارات':'Notifications'}${items.length?` (${items.length})`:''}</span>
      ${items.length?`<button class="notifPanel-clear" onclick="goView('reports');document.getElementById('notifPanel')?.remove()">${lang==='ar'?'عرض الكل':'View all'}</button>`:''}
    </div>
    <div class="notifPanel-list">
      ${items.length ? items.map(it=>`
        <div class="notifItem" onclick="(${it.go.toString()})();document.getElementById('notifPanel')?.remove()">
          <div class="notifItem-dot" style="background:${it.color}"></div>
          <div class="notifItem-body">
            <div class="notifItem-label">${it.label}</div>
            <div class="notifItem-sub">${it.sub}</div>
            <div class="notifItem-time">${it.time}</div>
          </div>
        </div>`).join('')
      : `<div class="notifPanel-empty">${ic('check',20)}<br>${lang==='ar'?'لا توجد إشعارات جديدة':'No new notifications'}</div>`}
    </div>`;

  btn.appendChild(panel);
  // Close on outside click
  setTimeout(()=>document.addEventListener('click',function h(){panel.remove();document.removeEventListener('click',h);}),0);
}
function goView(v){navigateTo(v);}

async function deleteReport(id){
  const msg=lang==='ar'?'هل أنت متأكد من حذف هذا التقرير؟ لا يمكن التراجع.':'Delete this report? This cannot be undone.';
  if(!confirm(msg))return;
  await api('/reports/'+id,{method:'DELETE'});
  toast(lang==='ar'?'تم الحذف':'Deleted','ok');
  await load();
}

function exportExcelReports(){
  const items=(data.reports||[]).filter(r=>{
    if(reportFilter==='all') return true;
    if(reportFilter==='pending') return (r.approvalStatus||'pending')==='pending_approval'||(r.approvalStatus||'pending')==='pending';
    return r.approvalStatus===reportFilter;
  });
  const headers=lang==='ar'
    ? ['#','العامل','الموقع','النوع','الحالة','الجودة','الاعتماد','التاريخ','الملاحظات']
    : ['#','Worker','Location','Type','Status','Quality','Approval','Date','Notes'];
  const rows=[headers,...items.map((r,i)=>[
    i+1, r.workerName,
    lang==='ar'?r.locationNameAr:r.locationNameEn,
    tr(r.locationType||'other'),
    tr(r.status), qualityScore(r)+'%',
    tr(r.approvalStatus||'pending_approval'),
    fmt(r.createdAt), r.notes||''
  ])];
  const csv='﻿'+rows.map(row=>row.map(v=>`"${String(v??'').replace(/"/g,'""')}"`).join(',')).join('\n');
  const a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8;'}));
  a.download=`rega-reports-${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  toast(lang==='ar'?'تم تصدير الملف':'File exported','ok');
}

function exportPDFReports(){
  const items=(data.reports||[]).filter(r=>{
    if(reportFilter==='all') return true;
    if(reportFilter==='pending') return (r.approvalStatus||'pending')==='pending_approval'||(r.approvalStatus||'pending')==='pending';
    return r.approvalStatus===reportFilter;
  });
  const dir=lang==='ar'?'rtl':'ltr';
  const html=`<!DOCTYPE html><html lang="${lang}" dir="${dir}"><head><meta charset="utf-8">
<title>REGA — ${tr('reports')}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Segoe UI',Tahoma,Arial,sans-serif;padding:24px;color:#222;direction:${dir}}
  .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px;padding-bottom:14px;border-bottom:2px solid #0A4E5B}
  .brand{color:#0A4E5B;font-size:20px;font-weight:800}
  .meta{font-size:11px;color:#666;margin-top:4px}
  table{width:100%;border-collapse:collapse;font-size:12px;margin-top:16px}
  th{background:#083B46;color:#fff;padding:9px 10px;text-align:${lang==='ar'?'right':'left'};font-weight:700}
  td{padding:8px 10px;border-bottom:1px solid #eee;vertical-align:top}
  tr:nth-child(even) td{background:#f8f9fa}
  .ok{color:#16884D;font-weight:700} .bad{color:#c83232;font-weight:700} .warn{color:#A66200;font-weight:700}
  .footer{margin-top:16px;font-size:10px;color:#999;text-align:center}
  @media print{body{padding:12px}@page{margin:15mm}}
</style></head><body>
<div class="header">
  <div><div class="brand">REGA Facility Care Pro</div><div class="meta">${tr('reports')} · ${fmtDate(new Date())} · ${items.length} ${lang==='ar'?'تقرير':'records'}</div></div>
  <div class="meta">${lang==='ar'?'مُصدَّر بواسطة: ':'Exported by: '}${esc(me.name)}</div>
</div>
<table><thead><tr>
  <th>#</th><th>${tr('worker')}</th><th>${tr('location')}</th>
  <th>${lang==='ar'?'الجودة':'Quality'}</th><th>${lang==='ar'?'الاعتماد':'Approval'}</th><th>${tr('time')}</th>
</tr></thead><tbody>
${items.map((r,i)=>{
  const st=r.approvalStatus||'pending_approval';
  const cls=st==='approved'?'ok':st==='rejected'||st==='needs_recleaning'?'bad':'warn';
  return`<tr><td>${i+1}</td><td>${esc(r.workerName)}</td>
    <td>${esc(lang==='ar'?r.locationNameAr:r.locationNameEn)}<br><small style="color:#888">${tr(r.locationType||'other')}</small></td>
    <td>${qualityScore(r)}%</td>
    <td class="${cls}">${tr(st)}</td>
    <td style="white-space:nowrap">${fmt(r.createdAt)}</td>
  </tr>${r.notes?`<tr><td></td><td colspan="5" style="font-size:11px;color:#666;padding-top:2px">${esc(r.notes)}</td></tr>`:''}`;
}).join('')}
</tbody></table>
<div class="footer">REGA Facility Care Pro · ${new Date().toISOString().slice(0,10)}</div>
</body></html>`;
  const w=window.open('','_blank','width=900,height=700');
  w.document.write(html);
  w.document.close();
  w.addEventListener('load',()=>w.print());
}

function openGallery(imgs,i=0){
  const box = document.createElement('div');
  box.className = 'lightbox';
  box.innerHTML=`<button class="lightbox-close" onclick="this.parentElement.remove()">×</button><img src="${imgs[i]}" alt="">`;
  box.addEventListener('click',e=>{if(e.target===box)box.remove()});
  document.body.appendChild(box);
}

/* ═══════════════════════════════════════════════════════════════
   TICKETS PAGE
   ═══════════════════════════════════════════════════════════════ */
function tickets(){
  const workers = (data.users||[]).filter(u=>u.role==='cleaner');
  return`
<div class="pageHeader">
  <div class="pageHeader-left">
    <div class="pageTitle">${tr('tickets')}</div>
    <div class="pageSub">${num((data.tickets||[]).filter(t=>t.status==='open').length)} ${lang==='ar'?'بلاغ مفتوح':'open tickets'}</div>
  </div>
  ${canTicket()?`<button class="btn sm" onclick="document.querySelector('.card').scrollIntoView({behavior:'smooth'})">${ic('plus',14)} ${tr('createTicket')}</button>`:''}
</div>
${canTicket()?`
<div class="card" style="margin-bottom:20px">
  <div class="card-head">
    <span class="card-title">${ic('plus',16)} ${tr('createTicket')}</span>
    <span class="badge bad">${lang==='ar'?'بلاغ جديد':'New Ticket'}</span>
  </div>
  <div class="formGrid">
    <div class="field"><label>${tr('title')}</label><input id="tt" value="${lang==='ar'?'بلاغ نظافة':'Cleaning Ticket'}"></div>
    <div class="field"><label>${tr('location')}</label><select id="tl">${(data.locations||[]).map(l=>`<option value="${l.id}">${esc(locName(l))}</option>`).join('')}</select></div>
    <div class="field"><label>${tr('assignedTo')}</label><select id="tw">${workers.map(w=>`<option value="${w.id}">${esc(w.name)}</option>`).join('')}</select></div>
    <div class="field"><label>${tr('priority')}</label><select id="tp"><option value="high">${tr('high')}</option><option value="medium" selected>${tr('medium')}</option><option value="low">${tr('low')}</option></select></div>
  </div>
  <div class="field" style="margin-bottom:14px"><label>${tr('description')}</label><textarea id="td" rows="2" placeholder="${lang==='ar'?'وصف البلاغ...':'Describe the issue...'}"></textarea></div>
  <button class="btn" onclick="createTicket()">${ic('plus',16)} ${tr('createTicket')}</button>
</div>`:''}
${ticketCards(data.tickets||[])}`;
}

async function createTicket(){
  await api('/tickets',{method:'POST',body:JSON.stringify({
    title:document.getElementById('tt').value,
    description:document.getElementById('td').value,
    locationId:document.getElementById('tl').value,
    assignedTo:document.getElementById('tw').value,
    priority:document.getElementById('tp').value
  })});
  toast(tr('saved'),'ok');
  await load();
}

function ticketCards(items){
  if(!items.length) return`<div class="card"><div class="empty-state">
    <div class="empty-icon">${ic('tickets',28)}</div>
    <div class="empty-title">${tr('noTickets')}</div>
    <p class="empty-sub">${lang==='ar'?'لا توجد بلاغات مفتوحة. يمكنك إنشاء بلاغ جديد من الأعلى.':'No open tickets. Create a new ticket using the form above.'}</p>
    ${canTicket()?`<button class="btn sm" style="margin-top:8px" onclick="window.scrollTo({top:0,behavior:'smooth'})">${ic('plus',14)} ${tr('createTicket')}</button>`:''}
  </div></div>`;
  return`<div class="ticketGrid">${items.map(t=>{
    const prCls = t.priority==='high'?'bad':t.priority==='low'?'info':'warn';
    const canEdit = canTicket();
    const canDel = ['system_admin','cleaning_manager'].includes(me.role);
    return`<div class="ticketCard priority-${t.priority||'medium'}">
      <div class="ticketCard-top">
        <div class="ticketCard-title">${esc(t.title)}</div>
        <div style="display:flex;gap:6px;align-items:center">
          <span class="badge ${t.status==='completed'?'ok':'bad'}">${tr(t.status==='completed'?'closed':'open')}</span>
          ${canEdit?`<button class="btn secondary sm" style="padding:3px 8px" onclick="editTicketModal('${t.id}')">${ic('edit',13)}</button>`:''}
          ${canDel?`<button class="btn danger sm" style="padding:3px 8px" onclick="deleteTicketConfirm('${t.id}')">${ic('trash',13)}</button>`:''}
        </div>
      </div>
      <div class="ticketCard-meta">${ic('locations',12)} ${esc(lang==='ar'?t.locationNameAr:t.locationNameEn)} &nbsp;·&nbsp; ${ic('users',12)} ${esc(t.assignedToName)}</div>
      ${t.description?`<p style="font-size:var(--fs-sm);color:var(--ink-soft);line-height:1.6">${esc(t.description)}</p>`:''}
      <div class="ticketCard-badges">
        <span class="badge ${prCls}">${lang==='ar'?'أولوية:':''} ${tr(t.priority||'medium')}</span>
        <span class="badge brand">${fmt(t.createdAt)}</span>
      </div>
      <div class="timeline">
        <div class="timelineItem">
          <div class="timelineDot active"></div>
          <div class="timelineItem-body"><div class="timelineItem-label">${tr('open')}</div><div class="timelineItem-time">${fmt(t.createdAt)}</div></div>
        </div>
        ${t.completedAt?`<div class="timelineItem"><div class="timelineDot"></div><div class="timelineItem-body"><div class="timelineItem-label">${tr('closed')}</div><div class="timelineItem-time">${fmt(t.completedAt)}</div></div></div>`:''}
      </div>
    </div>`;
  }).join('')}</div>`;
}

function editTicketModal(id){
  const t=(data.tickets||[]).find(x=>x.id===id);
  if(!t) return;
  const workers=(data.users||[]).filter(u=>u.role==='cleaner');
  document.getElementById('editTicketModal')?.remove();
  const modal=document.createElement('div');
  modal.className='modal-overlay';modal.id='editTicketModal';
  modal.innerHTML=`
<div class="modal">
  <div class="modal-head">
    <span class="modal-title">${ic('edit',16)} ${lang==='ar'?'تعديل البلاغ':'Edit Ticket'}</span>
    <button class="icon-btn" onclick="document.getElementById('editTicketModal').remove()">${ic('x',18)}</button>
  </div>
  <div class="modal-body">
    <div class="formGrid" style="grid-template-columns:1fr 1fr">
      <div class="field"><label>${tr('title')}</label><input id="et-title" value="${esc(t.title)}"></div>
      <div class="field"><label>${tr('priority')}</label>
        <select id="et-priority">
          <option value="high"${t.priority==='high'?' selected':''}>${tr('high')}</option>
          <option value="medium"${t.priority==='medium'?' selected':''}>${tr('medium')}</option>
          <option value="low"${t.priority==='low'?' selected':''}>${tr('low')}</option>
        </select>
      </div>
      <div class="field"><label>${tr('status')}</label>
        <select id="et-status">
          <option value="open"${t.status==='open'?' selected':''}>${tr('open')}</option>
          <option value="completed"${t.status==='completed'?' selected':''}>${tr('closed')}</option>
        </select>
      </div>
      <div class="field"><label>${tr('assignedTo')}</label>
        <select id="et-worker">
          ${workers.map(w=>`<option value="${w.id}"${t.assignedTo===w.id?' selected':''}>${esc(w.name)}</option>`).join('')}
        </select>
      </div>
    </div>
    <div class="field"><label>${tr('description')}</label><textarea id="et-desc" rows="3">${esc(t.description||'')}</textarea></div>
  </div>
  <div class="modal-foot">
    <button class="btn" onclick="saveEditTicket('${id}')">${ic('check',16)} ${tr('save')}</button>
    <button class="btn secondary" onclick="document.getElementById('editTicketModal').remove()">${tr('cancel')}</button>
  </div>
</div>`;
  modal.addEventListener('click',e=>{if(e.target===modal)modal.remove()});
  document.body.appendChild(modal);
}

async function saveEditTicket(id){
  const payload={
    title:document.getElementById('et-title').value.trim(),
    description:document.getElementById('et-desc').value.trim(),
    priority:document.getElementById('et-priority').value,
    status:document.getElementById('et-status').value,
    assignedTo:document.getElementById('et-worker').value
  };
  await api('/tickets/'+id,{method:'PUT',body:JSON.stringify(payload)});
  document.getElementById('editTicketModal')?.remove();
  toast(tr('saved'),'ok');
  await load();
}

async function deleteTicketConfirm(id){
  const t=(data.tickets||[]).find(x=>x.id===id);
  if(!t) return;
  const msg=lang==='ar'?`هل تريد حذف البلاغ "${t.title}"؟`:`Delete ticket "${t.title}"?`;
  if(!confirm(msg)) return;
  await api('/tickets/'+id,{method:'DELETE'});
  toast(lang==='ar'?'تم حذف البلاغ':'Ticket deleted','ok');
  await load();
}

/* ═══════════════════════════════════════════════════════════════
   LOCATIONS PAGE
   ═══════════════════════════════════════════════════════════════ */
function locations(){
  return`
<div class="pageHeader">
  <div class="pageHeader-left">
    <div class="pageTitle">${tr('locations')}</div>
    <div class="pageSub">${num((data.locations||[]).length)} ${lang==='ar'?'مرفق':'facilities'}</div>
  </div>
  <div class="pageActions">
    <button class="btn secondary sm" onclick="window.print()">${ic('qr',14)} ${tr('printQR')}</button>
  </div>
</div>
${canManage()?`
<div class="card" style="margin-bottom:16px">
  <div class="card-head">
    <span class="card-title">${ic('locations',16)} ${lang==='ar'?'إدارة المناطق':'Zones'}</span>
  </div>
  <div class="zone-chips">
    ${(data.zones||[]).map(z=>`<span class="zone-chip">${esc(z)}<button class="zone-del" onclick="deleteZone('${esc(z)}')" title="${lang==='ar'?'حذف':'Delete'}">×</button></span>`).join('')}
    <div style="display:flex;gap:6px;align-items:center">
      <input id="new-zone" style="width:100px" placeholder="${lang==='ar'?'منطقة جديدة':'New zone'}">
      <button class="btn sm" onclick="addZone()">${ic('plus',14)} ${lang==='ar'?'إضافة':'Add'}</button>
    </div>
  </div>
</div>
<div class="card" style="margin-bottom:20px">
  <div class="card-head">
    <span class="card-title">${ic('plus',16)} ${lang==='ar'?'إضافة مرفق':'Add Facility'}</span>
  </div>
  <div class="formGrid">
    <div class="field"><label>ID</label><input id="lid" class="ltr" placeholder="office-01-a"></div>
    <div class="field"><label>${tr('type')}</label><select id="ltype">${TYPES.map(t=>`<option value="${t}">${tr(t)}</option>`).join('')}</select></div>
    <div class="field"><label>${lang==='ar'?'الاسم العربي':'Arabic Name'}</label><input id="lar" placeholder="الاسم العربي"></div>
    <div class="field"><label>${lang==='ar'?'الاسم الإنجليزي':'English Name'}</label><input id="len" class="ltr" placeholder="English name"></div>
    <div class="field"><label>${tr('floor')}</label><select id="lf">${FACILITY_FLOORS.map(f=>`<option value="${esc(f)}">${esc(f)}</option>`).join('')}</select></div>
    <div class="field"><label>${tr('zone')}</label><select id="lz">${FACILITY_ZONES.map(z=>`<option value="${esc(z)}">${esc(z)}</option>`).join('')}</select></div>


    <div class="field"><label>${tr('priority')}</label><select id="lpri"><option value="high">${tr('high')}</option><option value="medium" selected>${tr('medium')}</option><option value="low">${tr('low')}</option></select></div>
  </div>
  <button class="btn" onclick="addLoc()">${ic('plus',16)} ${tr('save')}</button>
</div>`:''}
<!-- FLOOR FILTER -->
<div class="filterBar" style="margin-bottom:16px">
  <div class="filterChips">
    ${['all',...[...new Set((data.locations||[]).map(l=>l.floor).filter(Boolean))].sort()].map(f=>
      `<button class="filterChip${locsFloorFilter===f?' active':''}" onclick="locsFloorFilter='${f}';render()">
        ${f==='all'?(lang==='ar'?'الكل':'All'):f}
      </button>`
    ).join('')}
  </div>
</div>

<div class="locGrid">
  ${(data.locations||[]).filter(l=>{
    return locsFloorFilter==='all' || (l.floor||'')=== locsFloorFilter;
  }).map(l=>{
    const last = data.reports.find(r=>r.locationId===l.id);
    const late = !last||Date.now()-new Date(last.createdAt).getTime()>(data.settings.frequencyMinutes||120)*60000;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(location.origin+'/?loc='+l.id)}`;
    return`<div class="locCard">
      <div class="locCard-head">
        <div>
          <div class="locCard-name">${esc(locName(l))}</div>
          <div class="locCard-id">${esc(l.id)}</div>
        </div>
        <span class="badge ${late?'bad':'ok'}">${late?tr('late'):tr('good')}</span>
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap">
        <span class="badge brand">${tr(l.type)}</span>
        ${l.floor?`<span class="badge">${l.floor}</span>`:''}
        ${l.zone?`<span class="badge">${l.zone}</span>`:''}
        <span class="badge ${l.priority==='high'?'bad':l.priority==='low'?'info':'warn'}">${tr(l.priority||'medium')}</span>
      </div>
      <div style="font-size:var(--fs-xs);color:var(--muted);display:flex;align-items:center;gap:5px">
        ${ic(late?'bell':'check',12)}
        ${lang==='ar'?'آخر تقرير':'Last report'}: <strong>${last?fmt(last.createdAt):tr('none')}</strong>
        ${last?`· ${esc(last.workerName||'')}`:'' }
      </div>
      <div class="locCard-actions">
        ${canManage()?`<button class="btn danger sm" onclick="deleteLocConfirm('${esc(l.id)}')">${ic('trash',13)} ${lang==='ar'?'حذف':'Delete'}</button>`:''}
        <details style="flex:1">
          <summary style="cursor:pointer;font-size:var(--fs-xs);font-weight:700;color:var(--brand-mid);list-style:none;padding:4px 0">${ic('qr',13)} ${lang==='ar'?'عرض QR':'Show QR'}</summary>
          <div class="locCard-qr" style="margin-top:8px"><img width="120" height="120" src="${qrUrl}" alt="QR ${esc(l.id)}" loading="lazy"></div>
        </details>
      </div>
    </div>`;
  }).join('')}
</div>`;
}

async function addLoc(){
  await api('/locations',{method:'POST',body:JSON.stringify({
    id:document.getElementById('lid').value.trim(),
    type:document.getElementById('ltype').value,
    nameAr:document.getElementById('lar').value.trim(),
    nameEn:document.getElementById('len').value.trim(),
    floor:document.getElementById('lf').value.trim(),
    zone:document.getElementById('lz').value.trim(),
    priority:document.getElementById('lpri').value
  })});
  toast(tr('saved'),'ok');
  await load();
}

async function addZone(){
  const v=(document.getElementById('new-zone')||{}).value?.trim();
  if(!v) return;
  await api('/zones',{method:'POST',body:JSON.stringify({zone:v})});
  toast(tr('saved'),'ok'); await load();
}
async function deleteZone(z){
  if(!confirm(`${lang==='ar'?'حذف المنطقة':'Delete zone'} "${z}"?`)) return;
  await api('/zones/'+encodeURIComponent(z),{method:'DELETE'});
  toast(lang==='ar'?'تم الحذف':'Deleted','ok'); await load();
}

async function deleteLocConfirm(id){
  const l = (data.locations||[]).find(x=>x.id===id);
  if(!l) return;
  const msg = lang==='ar'
    ? `هل تريد حذف المرفق "${locName(l)}"؟ سيتم حذف جميع بياناته.`
    : `Delete facility "${locName(l)}"? All its data will be removed.`;
  if(!confirm(msg)) return;
  await api('/locations/'+encodeURIComponent(id),{method:'DELETE'});
  toast(lang==='ar'?'تم حذف المرفق':'Facility deleted','ok');
  await load();
}

/* ═══════════════════════════════════════════════════════════════
   ASSIGNMENTS PAGE
   ═══════════════════════════════════════════════════════════════ */
function assignments(){
  const workers = (data.users||[]).filter(u=>u.role==='cleaner');
  return`
<div class="pageHeader">
  <div class="pageHeader-left">
    <div class="pageTitle">${tr('assignments')}</div>
    <div class="pageSub">${(data.users||[]).filter(u=>u.role==='cleaner').length} ${lang==='ar'?'عامل':'workers'}</div>
  </div>
</div>
<div class="card">
  <div class="field">
    <label>${tr('selectWorker')}</label>
    <select id="aw" onchange="fillAssign()">
      ${workers.map(w=>`<option value="${w.id}">${esc(w.name)} — ${esc(w.username)}</option>`).join('')}
    </select>
  </div>
  <!-- FLOOR FILTER -->
  <div class="filterBar" style="margin-bottom:16px">
    <div class="filterChips">
      ${['all',...[...new Set((data.locations||[]).map(l=>l.floor).filter(Boolean))].sort()].map(f=>
        `<button class="filterChip asgFloorBtn${assignFloorFilter===f?' active':''}" data-floor="${f}" onclick="filterAssignFloor('${f}')">
          ${f==='all'?(lang==='ar'?'الكل':'All'):f}
        </button>`
      ).join('')}
    </div>
  </div>

  <div class="assignGrid" style="margin-top:0">
    ${(data.locations||[]).map(l=>`
      <label class="assignItem" data-floor="${esc(l.floor||'')}"
        style="${assignFloorFilter!=='all'&&(l.floor||'')!==assignFloorFilter?'display:none':''}">
        <input class="asgCheck" type="checkbox" value="${l.id}">
        <div style="flex:1;min-width:0">
          <div class="assignItem-label">${esc(locName(l))}</div>
          <div style="font-size:11px;color:var(--muted);margin-top:2px">${esc(l.id)}</div>
          <span class="badge" style="margin-top:4px">${tr(l.type)}</span>
        </div>
      </label>`).join('')}
  </div>
  <div style="margin-top:18px">
    <button class="btn" onclick="saveAssign()">${ic('check',16)} ${tr('save')}</button>
  </div>
</div>`;
}

function filterAssignFloor(floor){
  assignFloorFilter = floor;
  // show/hide items in-place — checkboxes keep their checked state
  document.querySelectorAll('.assignItem[data-floor]').forEach(el=>{
    el.style.display = (floor==='all' || el.dataset.floor===floor) ? '' : 'none';
  });
  // update active chip without re-render
  document.querySelectorAll('.asgFloorBtn').forEach(btn=>{
    btn.classList.toggle('active', btn.dataset.floor===floor);
  });
}

function fillAssign(){
  const aw = document.getElementById('aw');
  if(!aw) return;
  const a = (data.assignments||[]).find(x=>x.workerId===aw.value);
  document.querySelectorAll('.asgCheck').forEach(c=>c.checked=!!(a?.locationIds?.includes(c.value)));
}

async function saveAssign(){
  const aw = document.getElementById('aw');
  if(!aw) return;
  await api('/assignments',{method:'POST',body:JSON.stringify({
    workerId:aw.value,
    locationIds:[...document.querySelectorAll('.asgCheck:checked')].map(x=>x.value)
  })});
  toast(tr('saved'),'ok');
  await load();
}

/* ═══════════════════════════════════════════════════════════════
   USERS PAGE
   ═══════════════════════════════════════════════════════════════ */
function users(){
  const editableRoles = me.role==='system_admin'?ROLES:['cleaning_supervisor','cleaner'];
  const allUsers = data.users||[];
  const filtered = allUsers.filter(u=>{
    const matchSearch = !usersSearch || u.name.toLowerCase().includes(usersSearch.toLowerCase()) || u.username.toLowerCase().includes(usersSearch.toLowerCase()) || (u.employeeNo||'').toLowerCase().includes(usersSearch.toLowerCase());
    const matchRole = usersRoleFilter==='all' || u.role===usersRoleFilter;
    return matchSearch && matchRole;
  });
  return`
<div class="pageHeader">
  <div class="pageHeader-left">
    <div class="pageTitle">${tr('users')}</div>
    <div class="pageSub">${num(filtered.length)}${filtered.length!==allUsers.length?' / '+num(allUsers.length):''} ${lang==='ar'?'مستخدم':'users'}</div>
  </div>
</div>
<div class="card" style="margin-bottom:20px">
  <div class="card-head">
    <span class="card-title">${editUserId?`${ic('edit',16)} ${tr('edit')}`:ic('plus',16)+' '+tr('addUser')}</span>
    ${me.role==='cleaning_manager'?`<span class="badge gold">${lang==='ar'?'تدير العمال والمشرفين':'Manages workers & supervisors'}</span>`:''}
  </div>
  <div class="formGrid">
    <div class="field"><label>${tr('name')}</label><input id="un"></div>
    <div class="field"><label>${tr('username')}</label><input id="uu" class="ltr"></div>
    <div class="field"><label>${tr('password')}</label><input id="up" class="ltr" placeholder="••••••••"></div>
    <div class="field"><label>${tr('role')}</label><select id="ur">${editableRoles.map(r=>`<option value="${r}">${tr(r)}</option>`).join('')}</select></div>
    <div class="field"><label>${tr('employeeNo')}</label><input id="ue" class="ltr"></div>
    <div class="field"><label>${tr('status')}</label><select id="ua"><option value="true">${tr('activeUser')}</option><option value="false">${tr('inactive')}</option></select></div>
  </div>
  <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:16px">
    <button class="btn" onclick="saveUser()">${ic('check',16)} ${tr('save')}</button>
    <button class="btn secondary" onclick="clearUserForm()">${tr('cancel')}</button>
  </div>
</div>

<!-- Search + role filter bar -->
<div class="usersFilterBar">
  <input type="search" placeholder="${lang==='ar'?'بحث عن مستخدم...':'Search users...'}" value="${esc(usersSearch)}"
    oninput="usersSearch=this.value;render()">
  <select onchange="usersRoleFilter=this.value;render()">
    <option value="all"${usersRoleFilter==='all'?' selected':''}>${lang==='ar'?'كل الصلاحيات':'All Roles'}</option>
    ${ROLES.map(r=>`<option value="${r}"${usersRoleFilter===r?' selected':''}>${tr(r)}</option>`).join('')}
  </select>
</div>

${filtered.length===0
  ? `<div class="card"><div class="empty-state"><div class="empty-icon">${ic('users',28)}</div><div class="empty-title">${lang==='ar'?'لا توجد نتائج':'No results found'}</div><p class="empty-sub">${lang==='ar'?'جرب تغيير الفلتر أو كلمة البحث':'Try changing the filter or search term'}</p></div></div>`
  : `<div class="usersTableWrap">
  <table class="usersTable">
    <thead>
      <tr>
        <th>${tr('name')}</th>
        <th>${tr('role')}</th>
        <th>${tr('employeeNo')}</th>
        <th>${tr('status')}</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      ${filtered.map(u=>{
        const isSysAdmin = u.id==='u-admin';
        const canEdit = canManageUsers() && !isSysAdmin;
        const canDel = canManageUsers() && !isSysAdmin && u.id!==me.id;
        const rCls = roleBadgeClass(u.role);
        return`<tr>
          <td>
            <div class="userRow-cell-name">
              <div class="userRow-avatar">${esc(initials(u.name))}</div>
              <div>
                <div class="userRow-name">${esc(u.name)}</div>
                <div class="userRow-username">${esc(u.username)}</div>
              </div>
            </div>
          </td>
          <td><span class="badge ${rCls}">${tr(u.role)}</span></td>
          <td><span class="mono" style="font-size:var(--fs-xs)">${u.employeeNo?esc(u.employeeNo):'—'}</span></td>
          <td><span class="badge ${u.active?'ok':'bad'}">${u.active?tr('activeUser'):tr('inactive')}</span></td>
          <td>
            <div style="display:flex;gap:6px;justify-content:flex-end">
              ${canEdit?`<button class="btn secondary sm" onclick="editUser('${u.id}')">${ic('edit',14)}</button>`:''}
              ${canDel?`<button class="btn danger sm" onclick="deleteUserConfirm('${u.id}')">${ic('trash',14)}</button>`:''}
            </div>
          </td>
        </tr>`;
      }).join('')}
    </tbody>
  </table>
</div>`}`;
}

function editUser(id){
  const u = (data.users||[]).find(x=>x.id===id);
  if(!u) return;
  editUserId = id;
  document.getElementById('un').value = u.name;
  document.getElementById('uu').value = u.username;
  document.getElementById('up').value = '';
  document.getElementById('ur').value = u.role;
  document.getElementById('ue').value = u.employeeNo||'';
  document.getElementById('ua').value = String(u.active);
  window.scrollTo({top:0,behavior:'smooth'});
}
function clearUserForm(){
  editUserId = null;
  ['un','uu','up','ue'].forEach(id=>{const el=document.getElementById(id);if(el)el.value=''});
  const ua = document.getElementById('ua');
  if(ua) ua.value='true';
}
async function saveUser(){
  const payload = {
    name:document.getElementById('un').value.trim(),
    username:document.getElementById('uu').value.trim(),
    password:document.getElementById('up').value,
    role:document.getElementById('ur').value,
    employeeNo:document.getElementById('ue').value.trim(),
    active:document.getElementById('ua').value==='true'
  };
  if(editUserId) await api('/users/'+editUserId,{method:'PUT',body:JSON.stringify(payload)});
  else await api('/users',{method:'POST',body:JSON.stringify(payload)});
  toast(tr('saved'),'ok');
  editUserId = null;
  await load();
}

async function deleteUserConfirm(id){
  const u=(data.users||[]).find(x=>x.id===id);
  if(!u) return;
  const msg=lang==='ar'?`هل تريد حذف المستخدم "${u.name}"؟`:`Delete user "${u.name}"?`;
  if(!confirm(msg)) return;
  await api('/users/'+id,{method:'DELETE'});
  toast(lang==='ar'?'تم حذف المستخدم':'User deleted','ok');
  await load();
}

/* ═══════════════════════════════════════════════════════════════
   WORKER PAGE — MOBILE FIRST
   ═══════════════════════════════════════════════════════════════ */
function parseLoc(raw){
  raw = String(raw||'').trim();

  // Full URL support: ...?loc=wc-gf-a
  try{
    const u = new URL(raw);
    const param = u.searchParams.get('loc');
    if(param) return String(param).trim();
    // If URL doesn't have loc param, fallback to last path segment
    const last = u.pathname.split('/').filter(Boolean).pop();
    return last ? String(last).trim() : raw;
  }catch(e){
    // Direct code support or string with ?loc= somewhere inside
    const m = raw.match(/[?&]loc=([^&#]+)/);
    if(m && m[1]) return String(decodeURIComponent(m[1])).trim();
    return raw;
  }
}


function renderWorker(){
  setDoc();
  const assigned = ((data.assignments||[]).find(a=>a.workerId===me.id)?.locationIds)||[];
  const locs = (data.locations||[]).filter(l=>!assigned.length||assigned.includes(l.id));
  const myTickets = (data.tickets||[]).filter(t=>t.assignedTo===me.id&&t.status==='open');
  const qrFromUrl = new URL(location.href).searchParams.get('loc')||'';
  const qrFromStorage = sessionStorage.getItem('qr_loc')||'';
  const param = parseLoc(qrFromUrl || qrFromStorage);
  if(param) sessionStorage.removeItem('qr_loc');
  const qSize = getQ().length;

  app.innerHTML=`
<div class="workerPage">
  <!-- PROTOTYPE BANNER -->
  <div class="prototype-banner" role="alert">
    ${lang==='ar'
      ? '⚠ نسخة تجريبية — بيانات غير حقيقية'
      : '⚠ Prototype — Demo Data Only'}
  </div>
  <!-- WORKER TOP BAR -->
  <header class="workerTopbar">
    <div class="workerTopbar-brand">
      <button class="icon-btn worker-back-btn" onclick="workerGoBack()" title="${lang==='ar'?'رجوع':'Back'}">
        <svg viewBox="0 0 24 24" style="transform:${lang==='ar'?'none':'scaleX(-1)'}"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <div class="workerTopbar-icon">
        <img src="/assets/logos/logo-icon-dark.svg" onerror="this.style.display='none'" alt="REGA">
      </div>
      <div>
        <div class="workerTopbar-name">${esc(me.name)}</div>
        <span class="workerTopbar-role">${tr('cleaner')}</span>
      </div>
    </div>
    <div class="workerTopbar-actions">
      ${qSize>0?`<button class="offlineTag" onclick="flushOfflineQueue()">${ic('sync',14)} ${qSize} ${lang==='ar'?'معلق':'pending'}</button>`:''}
      <button class="icon-btn" onclick="switchLang()" title="${tr('lang')}">${tr('lang')}</button>
      <button class="icon-btn" onclick="flushOfflineQueue()" title="${tr('sync')}">${ic('sync',20)}</button>
      <button class="icon-btn" onclick="logout()" title="${tr('logout')}">${ic('logout',20)}</button>
    </div>
  </header>

  <!-- CONTENT -->
  <div class="workerContent">
    <!-- My tickets -->
    ${myTickets.length?`
    <div class="wCard">
      <div class="wCard-title"><span class="wCard-number">!</span>${tr('myTickets')}</div>
      <div style="display:grid;gap:8px">
        ${myTickets.map(t=>`
          <button style="width:100%;text-align:inherit;padding:14px 16px;border:1.5px solid rgba(200,50,50,.2);background:var(--bad-bg);border-radius:var(--r);cursor:pointer" onclick="startTicketWorker('${t.id}')">
            <div style="font-weight:800;font-size:var(--fs-sm);color:var(--ink)">${esc(t.title)}</div>
            <div style="font-size:var(--fs-xs);color:var(--muted);margin-top:3px">${esc(lang==='ar'?t.locationNameAr:t.locationNameEn)}</div>
          </button>`).join('')}
      </div>
    </div>`:''}

    <!-- Recent report statuses (approvals/rejections) -->
    ${(()=>{
      const myReports=(data.reports||[]).filter(r=>r.workerId===me.id).slice(0,8);
      const reviewed=myReports.filter(r=>r.approvalStatus&&r.approvalStatus!=='pending');
      if(!reviewed.length) return '';
      return `<div class="wCard">
        <div class="wCard-title"><span class="wCard-number">${ic('bell',16)}</span>${lang==='ar'?'حالة تقاريري':'My Reports Status'}</div>
        <div style="display:grid;gap:8px">
          ${reviewed.map(r=>{
            const st=r.approvalStatus;
            const stLabel={approved:lang==='ar'?'معتمد':'Approved',rejected:lang==='ar'?'مرفوض':'Rejected',needs_recleaning:lang==='ar'?'إعادة تنظيف':'Re-clean'}[st]||st;
            const stColor=st==='approved'?'ok':st==='rejected'?'bad':'warn';
            const actionable=st==='rejected'||st==='needs_recleaning';
            return `<div class="workerReportItem ${actionable?'actionable':''}" ${actionable?`onclick="document.getElementById('locCode').value='${r.locationId}';startForm()"`:''}
              style="padding:12px 14px;border:1.5px solid ${actionable?'rgba(200,50,50,.25)':'var(--line)'};border-radius:var(--r);display:flex;align-items:center;gap:12px;background:var(--${stColor}-bg);${actionable?'cursor:pointer':''}">
              <div style="width:36px;height:36px;border-radius:50%;background:var(--${stColor}-bg);border:2px solid ${stColor==='ok'?'var(--ok)':stColor==='bad'?'var(--bad)':'var(--warn)'};display:grid;place-items:center;flex-shrink:0">
                ${ic(st==='approved'?'check':st==='rejected'?'x':'flip',16)}
              </div>
              <div style="flex:1;min-width:0">
                <div style="font-size:var(--fs-sm);font-weight:700;color:var(--ink)">${esc(lang==='ar'?r.locationNameAr:r.locationNameEn)}</div>
                <div style="font-size:var(--fs-xs);color:var(--muted);margin-top:2px">${fmt(r.approvedAt||r.createdAt)}${r.reviewNote?' · '+esc(r.reviewNote):''}</div>
                <span class="badge ${stColor}" style="margin-top:6px">${stLabel}</span>
              </div>
              ${actionable?`<div style="color:var(--${stColor});flex-shrink:0;font-size:var(--fs-xs);font-weight:700;display:flex;align-items:center;gap:4px">${lang==='ar'?'إعادة':'Redo'} ${ic('arrow',14)}</div>`:''}
            </div>`;
          }).join('')}
        </div>
      </div>`;
    })()}

    <!-- Location selector -->
    <div class="wCard">
      <div class="wCard-title"><span class="wCard-number">1</span>${tr('step1')}</div>
      <div class="field" style="margin-bottom:12px">
        <label>${lang==='ar'?'كود الموقع':'Location Code'}</label>
        <div class="locInput-wrap">
          <input id="locCode" class="ltr" value="${esc(param)}" placeholder="wc-gf-a">
          <button class="locInput-scan" onclick="openQRScanner()" title="${tr('scanQR')}">${ic('qr',18)}</button>
        </div>
      </div>
      <button class="btn wide" style="min-height:52px" onclick="startForm()">${ic('arrow',16)} ${tr('start')}</button>

      ${locs.length?`
      <div style="margin-top:16px">
        <div style="font-size:var(--fs-xs);font-weight:800;color:var(--muted);margin-bottom:10px;font-family:var(--font-head);letter-spacing:.3px">${tr('assigned').toUpperCase()}</div>
        <div class="assignedList">
          ${locs.map(l=>`
            <div class="assignedItem" onclick="document.getElementById('locCode').value='${l.id}';startForm()">
              <div>
                <div class="assignedItem-name">${esc(locName(l))}</div>
                <div class="assignedItem-sub">${tr(l.type)} · ${l.floor||'—'}</div>
              </div>
              <span>${ic('arrow',16)}</span>
            </div>`).join('')}
        </div>
      </div>`:''}
    </div>

    <!-- Worker form area -->
    <div id="workerForm"></div>

    <!-- Fullscreen camera -->
    <div id="cameraFull" class="cameraFull">
      <div class="cameraViewport">
        <video id="camVideo" autoplay playsinline></video>
        <div class="cameraFrame"></div>
        <div class="cameraTop">
          <div class="cameraTop-title">${ic('camera',18)} ${tr('takePhoto')}</div>
          <button class="camSideBtn" onclick="closeCamera()">${ic('x',20)}</button>
        </div>
        <div id="cameraCounter" class="cameraCounter" style="display:none">0 ${lang==='ar'?'صورة':'photos'}</div>
      </div>
      <div class="cameraBottom">
        <button class="camSideBtn" onclick="toggleCameraFacing()" id="camFlipBtn" title="${lang==='ar'?'تبديل الكاميرا':'Switch camera'}">${ic('flip',20)}</button>
        <button class="shutter" onclick="capturePhoto()" aria-label="${tr('takePhoto')}"></button>
        <button class="camSideBtn" onclick="closeCamera();doneCamera()">${lang==='ar'?'تم':'Done'}</button>
      </div>
    </div>
  </div>
</div>`;

  if(param) setTimeout(startForm, 150);
}

let cameraFacing = 'environment';
function workerGoBack(){
  const form=document.getElementById('workerForm');
  if(form&&form.innerHTML.trim()){
    form.innerHTML='';
    currentPhotos=[];
    if(stream){stream.getTracks().forEach(t=>t.stop());stream=null;}
    window.scrollTo({top:0,behavior:'smooth'});
    return;
  }
  history.back();
}
function startTicketWorker(id){
  const t = (data.tickets||[]).find(x=>x.id===id);
  currentTicketId = id;
  const el = document.getElementById('locCode');
  if(el){el.value=t.locationId;startForm()}
}

function startForm(){
  const locCode = document.getElementById('locCode');
  if(!locCode) return;
  const id = parseLoc(locCode.value);
  if(!id) return toast(lang==='ar'?'أدخل كود الموقع أو امسح QR':'Enter location code or scan QR','bad');
  const loc = (data.locations||[]).find(l=>l.id===id);
  if(!loc){
    toast(lang==='ar'?`الموقع "${id}" غير موجود في النظام`:`Location "${id}" not found in system`,'bad');
    return;
  }
  const asg = (data.assignments||[]).find(a=>a.workerId===me.id);
  if(asg&&asg.locationIds.length&&!asg.locationIds.includes(id)) return toast(tr('notAssigned'),'bad');
  currentPhotos = [];
  const tasks = taskSetFor(loc.type);
  document.getElementById('workerForm').innerHTML=`
    <div class="wCard">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:16px">
        <div>
          <div style="font-family:var(--font-head);font-size:var(--fs-lg);font-weight:800;color:var(--ink);line-height:1.35">${esc(locName(loc))}</div>
          <div style="font-size:var(--fs-xs);color:var(--muted);margin-top:4px">${ic('locations',12)} ${tr(loc.type)} · ${loc.floor||'—'} · ${loc.id}</div>
        </div>
        <span class="badge brand">${tr('autoTime')}</span>
      </div>
      <div class="field" style="margin-bottom:14px">
        <label>${tr('status')}</label>
        <select id="wkStatus">
          <option value="completed">${tr('completed')}</option>
          <option value="needs_followup">${tr('needs_followup')}</option>
        </select>
      </div>
    </div>

    <div class="wCard">
      <div class="wCard-title"><span class="wCard-number">2</span>${tr('step2')}</div>
      <div class="taskChecklist">
        ${tasks.map((p,i)=>`
          <label class="taskItem" id="ti_${i}">
            <input class="taskCheck" type="checkbox" checked value="${esc(lang==='ar'?p[0]:p[1])}" onchange="this.closest('.taskItem').classList.toggle('checked',this.checked)">
            <span class="taskItem-label">${esc(lang==='ar'?p[0]:p[1])}</span>
          </label>`).join('')}
      </div>
      <div class="field" style="margin-top:16px">
        <label>${tr('notes')}</label>
        <textarea id="wkNotes" rows="2" placeholder="${lang==='ar'?'ملاحظات اختيارية...':'Optional notes...'}"></textarea>
      </div>
    </div>

    <div class="wCard">
      <div class="wCard-title"><span class="wCard-number">3</span>${tr('step3')}</div>
      <button class="cameraBtn" onclick="openCamera()">
        ${ic('camera',22)}
        <span>${tr('addPhoto')}</span>
      </button>
      <div id="photoPreviews" class="photoGrid" style="margin-top:12px"></div>
    </div>

    <div style="height:80px"></div>

    <div class="stickySubmit">
      <button class="submitBtn" onclick="submitReport('${id}')">${ic('check',20)} ${tr('submit')}</button>
    </div>`;

  // Check all tasks by default
  document.querySelectorAll('.taskItem').forEach(el=>el.classList.add('checked'));
  document.getElementById('workerForm').scrollIntoView({behavior:'smooth',block:'start'});
}

/* ─── CAMERA ─────────────────────────────────────────────────── */
async function openCamera(){
  try{
    if(stream) stream.getTracks().forEach(t=>t.stop());
    stream = await navigator.mediaDevices.getUserMedia({
      video:{facingMode:{ideal:cameraFacing},width:{ideal:1920},height:{ideal:1080}},
      audio:false
    });
    document.getElementById('cameraFull').classList.add('active');
    document.getElementById('camVideo').srcObject = stream;
    updateCameraCounter();
  }catch(e){toast(tr('cameraError'),'bad')}
}
function toggleCameraFacing(){
  cameraFacing = cameraFacing==='environment'?'user':'environment';
  openCamera();
}
function closeCamera(){
  if(stream) stream.getTracks().forEach(t=>t.stop());
  stream = null;
  document.getElementById('cameraFull').classList.remove('active');
}
function doneCamera(){
  renderPhotoPreviews();
}
function updateCameraCounter(){
  const el = document.getElementById('cameraCounter');
  if(!el) return;
  if(currentPhotos.length>0){el.style.display='block';el.textContent=`${currentPhotos.length} ${lang==='ar'?'صورة':'photos'}`}
  else{el.style.display='none'}
}
function capturePhoto(){
  const vid = document.getElementById('camVideo');
  if(!vid||!vid.videoWidth) return;
  const c = document.createElement('canvas');
  c.width = vid.videoWidth; c.height = vid.videoHeight;
  c.getContext('2d').drawImage(vid,0,0);
  compactImage(c.toDataURL('image/jpeg',.86)).then(img=>{
    currentPhotos.push(img);
    updateCameraCounter();
    // Flash feedback
    const flash = document.createElement('div');
    flash.style.cssText='position:fixed;inset:0;background:#fff;opacity:.5;z-index:9999;pointer-events:none';
    document.body.appendChild(flash);
    setTimeout(()=>flash.remove(),150);
  });
}

function renderPhotoPreviews(){
  const el = document.getElementById('photoPreviews');
  if(!el) return;
  el.innerHTML = currentPhotos.map((p,i)=>`
    <div class="photoItem">
      <img src="${p}" alt="" onclick='openGallery(${JSON.stringify(currentPhotos)},${i})'>
      <button class="photoItem-del" onclick="currentPhotos.splice(${i},1);renderPhotoPreviews()">×</button>
    </div>`).join('') || `<div style="font-size:var(--fs-xs);color:var(--muted);text-align:center;padding:12px">${tr('photoRequired')}</div>`;
}

let qrScannerInstance = null;

function openQRScanner(){
  if(typeof Html5Qrcode === 'undefined'){
    toast(lang==='ar'?'مكتبة الماسح غير متوفرة':'QR scanner library not available','bad');
    return;
  }

  if(document.getElementById('qr-overlay')) return;

  const overlay = document.createElement('div');
  overlay.id = 'qr-overlay';
  overlay.innerHTML = `
    <div class="qr-scanner-container">
      <div class="qr-scanner-header">
        <span class="qr-scanner-title">${lang==='ar'?'مسح رمز QR':'Scan QR Code'}</span>
        <button class="qr-scanner-close" onclick="closeQRScanner()">${ic('x',22)}</button>
      </div>
      <div id="qr-reader"></div>
      <p class="qr-scanner-hint">${lang==='ar'?'وجّه الكاميرا نحو رمز QR الخاص بالمرفق':'Point the camera at the facility QR code'}</p>
    </div>`;
  document.body.appendChild(overlay);

  const config = {
    fps: 10,
    qrbox: { width: 220, height: 220 },
    aspectRatio: 1.0,
    showTorchButtonIfSupported: true,
    showZoomSliderIfSupported: true
  };

  qrScannerInstance = new Html5Qrcode('qr-reader');

  qrScannerInstance.start(
    { facingMode: 'environment' },
    config,
    (decodedText) => {
      let loc = decodedText.trim();
      try {
        const url = new URL(decodedText);
        const param = url.searchParams.get('loc');
        if(param) loc = param;
      } catch(e){}

      closeQRScanner();

      const locInput = document.getElementById('locCode');
      if(locInput) locInput.value = loc;

      const parsed = parseLoc(loc);
      if(!parsed){
        toast(lang==='ar'?'رمز QR غير صالح':'Invalid QR code','bad');
        return;
      }
      const facility = (data.locations||[]).find(l=>l.id===parsed);
      if(!facility){
        toast(lang==='ar'?`الموقع "${parsed}" غير موجود في النظام`:`Location "${parsed}" not found`,'bad');
        return;
      }
      toast(lang==='ar'?`تم التعرف على: ${locName(facility)}`:`Found: ${locName(facility)}`,'ok');
      setTimeout(()=>startForm(), 200);
    },
    ()=>{}
  ).catch(err => {
    closeQRScanner();
    toast(lang==='ar'?'تعذر فتح الكاميرا. تأكد من منح الإذن واستخدام HTTPS':'Camera access denied. Ensure permission is granted and using HTTPS','bad');
  });
}

async function closeQRScanner(){
  try{
    if(qrScannerInstance){
      await qrScannerInstance.clear().catch(()=>{});
      await qrScannerInstance.stop().catch(()=>{});
      qrScannerInstance = null;
    }
  }catch(e){
    console.warn('QR close error:',e);
  }

  const overlay = document.getElementById('qr-overlay');
  if(overlay) overlay.remove();

  // Avoid iOS/overlay issues + memory leaks
  document.body.classList.remove('modal-open');
}



/* ─── SUBMIT REPORT ──────────────────────────────────────────── */
async function submitReport(locationId){
  if(!currentPhotos.length) return toast(tr('photoRequired'),'bad');
  const btn = document.querySelector('.submitBtn');
  if(btn){btn.disabled=true;btn.innerHTML=`<div class="spinner" style="width:24px;height:24px;border-width:2.5px"></div>`}
  const payload = {
    locationId,
    status:document.getElementById('wkStatus')?.value||'completed',
    notes:document.getElementById('wkNotes')?.value||'',
    tasks:[...document.querySelectorAll('.taskCheck:checked')].map(x=>x.value),
    photos:currentPhotos
  };
  if(currentTicketId){
    try{await api('/tickets/complete',{method:'POST',body:JSON.stringify({id:currentTicketId,photos:currentPhotos,notes:payload.notes})})}
    catch(e){}
    currentTicketId = null;
  }
  try{
    await api('/reports',{method:'POST',body:JSON.stringify(payload)});
    toast(tr('reportSent'),'ok');
    currentPhotos = [];
    document.getElementById('workerForm').innerHTML = `
      <div class="wCard" style="text-align:center;padding:32px">
        <div style="width:64px;height:64px;border-radius:50%;background:var(--ok-bg);margin:0 auto 16px;display:grid;place-items:center;color:var(--ok)">${ic('check',28)}</div>
        <div style="font-family:var(--font-head);font-size:var(--fs-xl);font-weight:800;color:var(--ink)">${tr('reportSent')}</div>
        <p style="color:var(--muted);margin-top:8px;font-size:var(--fs-sm)">${fmt(new Date())}</p>
        <button class="btn wide" style="margin-top:20px" onclick="renderWorker()">${lang==='ar'?'تقرير جديد':'New Report'}</button>
      </div>`;
    await load();
  }catch(e){
    const q = getQ();
    q.push(payload);
    setQ(q);
    toast(tr('offlineSaved'),'warn');
    if(btn){btn.disabled=false;btn.innerHTML=`${ic('check',20)} ${tr('submit')}`}
    updateSyncDot();
  }
}

/* ─── INIT ───────────────────────────────────────────────────── */
// Preserve ?loc= param from QR scans across login
(function(){
  try{
    const u = new URL(location.href);
    const loc = u.searchParams.get('loc');
    if(loc){
      const parsed = parseLoc(loc);
      if(parsed) sessionStorage.setItem('qr_loc', parsed);
    }
  }catch(e){ /* ignore */ }
})();

// Auth is handled via HttpOnly cookie — try to load; if 401, show login
(async function(){
  try{
    await load();
    // After successful load, handle queued QR location
    const queued = sessionStorage.getItem('qr_loc');
    if(queued && me && me.role==='cleaner'){
      const id = parseLoc(queued);
      sessionStorage.removeItem('qr_loc');
      const facility = (data && data.locations||[]).find(l=>l.id===id);
      if(facility){
        setTimeout(()=>{
          const el = document.getElementById('locCode');
          if(el){ el.value = id; startForm(); }
        },150);
      }
    }
  }catch(e){ loginPage(); }
})();

