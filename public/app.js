/* ══════════════════════════════════════════════════════════════
   REGA FACILITY CARE — App v16
   Complete Frontend Rebuild — inspired by وفّر design language
   ══════════════════════════════════════════════════════════════ */

/* ─── CONSTANTS ──────────────────────────────────────────────── */
const ROLES = ['system_admin','facility_manager','cleaning_manager','cleaning_supervisor','cleaner','employee'];
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
    employee:'موظف',
    submitRequest:'تقديم طلب تنظيف',myRequests:'طلباتي',
    reqCategory:'نوع الطلب',refNumber:'رقم المرجع',
    cat_general:'طلب تنظيف عام',cat_spill:'انسكاب',cat_restroom:'مشكلة دورة مياه',
    cat_meeting_room:'تنظيف قاعة اجتماع',cat_emergency:'تنظيف طارئ',
    requestSubmitted:'تم تقديم الطلب بنجاح',
    beforePhotos:'صور قبل التنظيف',afterPhotos:'صور بعد التنظيف',
    beforePhotoHint:'التقط صوراً للحالة قبل البدء',afterPhotoHint:'التقط صوراً بعد الانتهاء',
    performance:'الأداء',teamOverview:'نظرة الفريق',
    approvalRate:'معدل الاعتماد',avgQuality:'متوسط الجودة',
    openTasks:'مهام مفتوحة',assignedLocs:'مواقع مخصصة',
    ratingBySupervisor:'تقييم المشرف',ratingByManager:'تقييم المدير',
    workloadScore:'مؤشر العبء',monthlyRecognition:'التميز الشهري',
    topWorker:'عامل الشهر',noRating:'لم يُقيَّم',
    slaStatus:'حالة SLA',supervisorQueue:'قائمة الإشراف',
    unassigned:'غير محدد',autoAssigned:'تعيين تلقائي',
    workspaceSelect:'اختر مساحة العمل',currentWorkspace:'مساحة العمل',
    switchWorkspace:'تغيير',workspaceHint:'لديك أكثر من صلاحية. اختر مساحة العمل للمتابعة.',
    slaDeadline:'موعد SLA',slaBreached:'تجاوز SLA',slaOverdue:'تجاوز المهلة',
    slaOk:'ملتزم',slaWarning:'قريب من المهلة',slaReport:'تقرير SLA',
    auditLog:'سجل التدقيق',auditAction:'الإجراء',auditUser:'المستخدم',
    auditTarget:'الهدف',auditResult:'النتيجة',auditTime:'الوقت',
    addRole:'إضافة صلاحية',removeRole:'إزالة',rolesLabel:'الصلاحيات',
    complianceRate:'نسبة الالتزام',avgCompletionTime:'متوسط وقت الإنجاز',
    mins:'دقيقة',hours:'ساعة',
    submitted:'تم الإرسال',assigned:'تم التعيين',accepted:'مقبول',
    in_progress:'قيد التنفيذ',waiting_verification:'بانتظار التحقق',
    reclean_required:'إعادة التنظيف مطلوبة',cancelled:'ملغي',
    myProfile:'ملفي الشخصي',profileCenter:'مركز الملف الشخصي',
    changePassword:'تغيير كلمة المرور',lastPwdChange:'آخر تغيير للكلمة السرية',
    rolesLabel:'الصلاحيات',workspacesLabel:'مساحات العمل',
    requester:'مقدم الطلب',activeTickets:'البلاغات النشطة',
    closeModal:'إغلاق',activeTicket:'بلاغ نشط',
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
    employee:'Employee',
    submitRequest:'Submit Cleaning Request',myRequests:'My Requests',
    reqCategory:'Request Type',refNumber:'Reference No.',
    cat_general:'General Cleaning',cat_spill:'Spill',cat_restroom:'Restroom Issue',
    cat_meeting_room:'Meeting Room Cleaning',cat_emergency:'Emergency Cleaning',
    requestSubmitted:'Request submitted successfully',
    beforePhotos:'Before Photos',afterPhotos:'After Photos',
    beforePhotoHint:'Capture photos of the condition before starting',
    afterPhotoHint:'Capture photos after completion',
    performance:'Performance',teamOverview:'Team Overview',
    approvalRate:'Approval Rate',avgQuality:'Avg Quality',
    openTasks:'Open Tasks',assignedLocs:'Assigned Locations',
    ratingBySupervisor:'Supervisor Rating',ratingByManager:'Manager Rating',
    workloadScore:'Workload Score',monthlyRecognition:'Monthly Recognition',
    topWorker:'Worker of the Month',noRating:'Not Rated',
    slaStatus:'SLA Status',supervisorQueue:'Supervisor Queue',
    unassigned:'Unassigned',autoAssigned:'Auto-Assigned',
    workspaceSelect:'Select Workspace',currentWorkspace:'Workspace',
    switchWorkspace:'Switch',workspaceHint:'You have multiple roles. Select a workspace to continue.',
    slaDeadline:'SLA Deadline',slaBreached:'SLA Breached',slaOverdue:'Overdue',
    slaOk:'On Track',slaWarning:'Near Deadline',slaReport:'SLA Report',
    auditLog:'Audit Log',auditAction:'Action',auditUser:'User',
    auditTarget:'Target',auditResult:'Result',auditTime:'Time',
    addRole:'Add Role',removeRole:'Remove',rolesLabel:'Roles',
    complianceRate:'Compliance Rate',avgCompletionTime:'Avg Completion Time',
    mins:'min',hours:'hr',
    submitted:'Submitted',assigned:'Assigned',accepted:'Accepted',
    in_progress:'In Progress',waiting_verification:'Awaiting Verification',
    reclean_required:'Re-clean Required',cancelled:'Cancelled',
    myProfile:'My Profile',profileCenter:'Profile Center',
    changePassword:'Change Password',lastPwdChange:'Last Password Change',
    rolesLabel:'Roles',workspacesLabel:'Workspaces',
    requester:'Requester',activeTickets:'Active Tickets',
    closeModal:'Close',activeTicket:'Active ticket',
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
  star:`<svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  award:`<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>`,
  'bar-chart':`<svg viewBox="0 0 24 24"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>`,
  send:`<svg viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`,
  list:`<svg viewBox="0 0 24 24"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>`,
  'clock':`<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  shield:`<svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  layers:`<svg viewBox="0 0 24 24"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>`,
  filter:`<svg viewBox="0 0 24 24"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>`,
  log:`<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>`,
  'alert-triangle':`<svg viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  chevron:`<svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>`,
  lock:`<svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
};
const ic=(name,size=18)=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${IC[name]?.replace(/<svg[^>]*>/,'').replace(/<\/svg>/,'')??''}</svg>`;

/* ─── STATE ──────────────────────────────────────────────────── */
let lang = localStorage.lang||'ar';
// Auth is cookie-based (HttpOnly) — no token stored in JS
let me = null, data = null, view = 'dashboard';
let currentPhotos = [], stream = null;
let currentBeforePhotos = [], currentAfterPhotos = [];
let cameraMode = 'general'; // 'before' | 'after' | 'general'
let editUserId = null, currentTicketId = null;
let reportFilter = 'all';
let usersSearch = '', usersRoleFilter = 'all', usersStatusFilter = 'all';
let locsFloorFilter = 'all';
let assignFloorFilter = 'all';
let viewHistory = [];
let eventSource = null;
let forcePasswordChange = false;
let employeeTab = 'submit'; // 'submit' | 'history'
let perfData = null; // cached performance data
let workspaceSelected = false; // true after user picks workspace this session

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

/* ── SLA helpers ─────────────────────────────────────────── */
function slaInfo(ticket){
  if(!ticket.slaDeadline || ['completed','rejected','cancelled'].includes(ticket.status)) return null;
  const deadline = new Date(ticket.slaDeadline);
  const diffMs   = deadline - Date.now();
  const diffMins = Math.round(diffMs / 60_000);
  if(diffMins < 0){
    const overMins = Math.abs(diffMins);
    const text = overMins >= 60
      ? `${Math.round(overMins/60)}${tr('hours')} ${lang==='ar'?'تجاوز':'overdue'}`
      : `${overMins}${tr('mins')} ${lang==='ar'?'تجاوز':'overdue'}`;
    return { cls:'sla-overdue', text, icon:'alert-triangle' };
  }
  if(diffMins < 30){
    const text = `${diffMins}${tr('mins')} ${lang==='ar'?'متبقي':'left'}`;
    return { cls:'sla-warning', text, icon:'clock' };
  }
  const remText = diffMins >= 60
    ? `${Math.round(diffMins/60)}${tr('hours')} ${lang==='ar'?'متبقي':'left'}`
    : `${diffMins}${tr('mins')} ${lang==='ar'?'متبقي':'left'}`;
  return { cls:'sla-ok', text: remText, icon:'clock' };
}

function slaBadge(ticket){
  if(ticket.slaBreached && !['completed','rejected','cancelled'].includes(ticket.status)){
    return `<span class="slaBadge sla-overdue">${ic('alert-triangle',12)} ${tr('slaBreached')}</span>`;
  }
  const info = slaInfo(ticket);
  if(!info) return '';
  return `<span class="slaBadge ${info.cls}">${ic(info.icon,12)} ${info.text}</span>`;
}

/* ── Workspace helpers ───────────────────────────────────── */
function needsWorkspaceSelection(){
  if(!me || !me.roles || me.roles.length <= 1) return false;
  // Only prompt if this is a fresh session (not if user already chose)
  return !workspaceSelected;
}
async function switchWorkspace(role){
  try{
    const b = await api('/workspace', { method:'POST', body: JSON.stringify({ workspace: role }) });
    workspaceSelected = true;
    sessionStorage.setItem('wsSelected','1');
    me = b.user; data = b;
    view = 'dashboard';
    render();
  }catch(e){ toast(e.message||'Error','bad'); }
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
  try{
    const b = await api('/bootstrap');
    data=b; me=b.user;
    // If server already has a workspace active (returning session), skip selector
    if(me.roles && me.roles.length > 1 && sessionStorage.getItem('wsSelected')) workspaceSelected=true;
    render(); connectSSE();
  }catch(e){logout()}
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
  me=null;data=null;forcePasswordChange=false;workspaceSelected=false;
  sessionStorage.removeItem('wsSelected');
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
  // Workspace selection screen for multi-role users
  if(needsWorkspaceSelection()) return renderWorkspaceSelector();
  if(me.role==='cleaner') return renderWorker();
  if(me.role==='employee') return renderEmployee();
  setDoc();
  if(_lastView==='users' && view!=='users'){ usersSearch=''; usersRoleFilter='all'; usersStatusFilter='all'; }
  if(_lastView==='locations' && view!=='locations'){ locsFloorFilter='all'; }
  if(_lastView==='assignments' && view!=='assignments'){ assignFloorFilter='all'; }
  _lastView = view;
  if(view==='performance'){
    shell(`<div style="text-align:center;padding:40px">${ic('clock',28)}</div>`);
    performance().then(html=>{
      const main=document.querySelector('.mainContent .pageAnim');
      if(main) main.innerHTML=html;
    });
    return;
  }
  if(view==='auditlog'){
    shell(`<div style="text-align:center;padding:40px">${ic('clock',28)}</div>`);
    auditLogPage().then(html=>{
      const main=document.querySelector('.mainContent .pageAnim');
      if(main) main.innerHTML=html;
    });
    return;
  }
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
      <p class="loginPanel-foot" style="font-size:9px;margin-top:4px;color:var(--muted-light);direction:ltr;text-align:center">build 20260609-2</p>
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
  const openTickets = (data.tickets||[]).filter(t=>!['completed','rejected','cancelled'].includes(t.status)).length;
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
        ${me.roles&&me.roles.length>1?`<button class="tb-workspace" onclick="renderWorkspaceSwitcher()">
          ${ic('layers',14)}<span class="tb-workspace-label">${roleLabel(me.role)}</span>${ic('chevron',14)}
        </button>`:''}
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
        <button class="tb-user" onclick="showProfileCenter()" title="${tr('myProfile')}">
          <div class="tb-avatar">${esc(initials(me.name))}</div>
          <div>
            <div class="tb-user-name">${esc(me.name.split(' ')[0])}</div>
            <span class="tb-user-role">${roleLabel(me.role)}</span>
          </div>
        </button>
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
          ${canReview()?navItem('performance',tr('performance'),'bar-chart',0):''}
          ${canManage()?navItem('auditlog',tr('auditLog'),'log',0):''}
        </div>
      </div>
      <div class="sidebar-footer">
        <div class="sidebar-workspace-badge">
          ${ic('layers',13)}<span>${roleLabel(me.role)}</span>
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
    openTickets: (data.tickets||[]).filter(t=>!['completed','rejected','cancelled'].includes(t.status)).length
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
  ${kpiCard(num(s.today.length),tr('today'),'reports','brand')}
  ${kpiCard(num(s.coverage)+'%',tr('coverage'),'locations','ok')}
  ${kpiCard(num(s.pending),tr('pending'),'bell','warn')}
  ${kpiCard(num(s.openTickets),tr('openTickets'),'tickets','bad')}
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
    <div class="perfStatGrid">
      <div>
        <div class="perfStatRow">
          <span class="perfStatLabel">${lang==='ar'?'جودة التقارير':'Report quality'}</span>
          <span class="perfStatValue">${num(avgQ)}%</span>
        </div>
        <div class="progress-track"><div class="progress-fill ${avgQ>=70?'ok':avgQ>=40?'gold':'warn'}" style="width:${avgQ}%"></div></div>
      </div>
      <div>
        <div class="perfStatRow">
          <span class="perfStatLabel">${lang==='ar'?'التغطية اليومية':'Daily coverage'}</span>
          <span class="perfStatValue">${num(s.coverage)}%</span>
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
    <div class="slaIndicator">
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

function kpiCard(value,label,icon,color){
  return `<div class="kpiCard">
    <div class="kpiCard-body">
      <div class="kpiCard-label">${label}</div>
      <div class="kpiCard-value">${value}</div>
    </div>
    <div class="kpiCard-icon ${color}">${ic(icon,22)}</div>
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

function starRatingWidget(reportId, ratingType, current){
  const stars = [1,2,3,4,5];
  const val = current != null ? Math.round(current) : 0;
  return `<div class="starRating" data-report="${esc(reportId)}" data-type="${esc(ratingType)}">
    ${stars.map(s=>`<button class="starBtn${s<=val?' filled':''}" onclick="submitRating('${esc(reportId)}','${esc(ratingType)}',${s})" title="${s}" aria-label="${s} stars">${ic('star',15)}</button>`).join('')}
    <span class="starVal">${current!=null?current.toFixed(1):tr('noRating')}</span>
  </div>`;
}

async function submitRating(reportId, ratingType, value){
  try{
    await api('/reports/rate',{method:'POST',body:JSON.stringify({id:reportId,ratingType,value})});
    toast(lang==='ar'?'تم حفظ التقييم':'Rating saved','ok');
    await load();
  }catch(e){ toast(lang==='ar'?'خطأ في التقييم':'Rating error','bad'); }
}

function reportCard(r,full){
  const imgs = imgList(r);
  const before = (r.beforePhotos||[]);
  const after  = (r.afterPhotos||[]);
  const hasTyped = before.length||after.length;
  const st = r.approvalStatus||'pending_approval';
  const q = qualityScore(r);
  const tasks = taskSetFor(r.locationType);
  return`<article class="reportCard">
    <div class="reportCard-media ${imgs.length<=1?'single':''}">
      ${hasTyped ? `
        ${before.length?`<div class="photoGroup"><div class="photoGroup-label">${ic('camera',12)} ${tr('beforePhotos')}</div><div class="photoGroup-imgs">${before.map((src,i)=>`<img class="reportCard-thumb" src="${src}" loading="lazy" onclick='openGallery(${JSON.stringify(before)},${i})' alt="">`).join('')}</div></div>`:''}
        ${after.length?`<div class="photoGroup"><div class="photoGroup-label ok">${ic('check',12)} ${tr('afterPhotos')}</div><div class="photoGroup-imgs">${after.map((src,i)=>`<img class="reportCard-thumb" src="${src}" loading="lazy" onclick='openGallery(${JSON.stringify(after)},${i})' alt="">`).join('')}</div></div>`:''}
      ` : imgs.length
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
        ${r.ratingSupervisor!=null?`<span class="badge gold">${ic('star',10)} ${r.ratingSupervisor.toFixed(1)}</span>`:''}
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
          <div class="reportCard-actions-primary">
            <button class="btn ok sm action-btn" onclick="reviewReport('${r.id}','approved')">${ic('check',13)} ${tr('approve')}</button>
            <button class="btn warn sm action-btn" onclick="reviewReport('${r.id}','needs_recleaning')">${ic('flip',13)} ${tr('reclean')}</button>
            <button class="btn danger sm action-btn" onclick="reviewReport('${r.id}','rejected')">${ic('x',13)} ${tr('reject')}</button>
          </div>
          ${canDelete()?`<div class="reportCard-actions-secondary"><button class="btn secondary sm action-btn" onclick="deleteReport('${r.id}')">${ic('trash',13)}</button></div>`:''}
        </div>
        <div class="ratingRow">
          <div class="ratingGroup">
            <span class="ratingLabel">${tr('ratingBySupervisor')}</span>
            ${starRatingWidget(r.id,'supervisor',r.ratingSupervisor)}
          </div>
          ${canManage()?`<div class="ratingGroup">
            <span class="ratingLabel">${tr('ratingByManager')}</span>
            ${starRatingWidget(r.id,'manager',r.ratingManager)}
          </div>`:''}
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
  const openTkts=(data.tickets||[]).filter(t=>!['completed','rejected','cancelled'].includes(t.status));

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
      sub:   lang==='ar'? `${tr(t.status)||t.status} · ${tr('activeTicket')}` : `${tr(t.status)||t.status} · ${tr('activeTicket')}`,
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
    <div class="pageSub">${num((data.tickets||[]).filter(t=>!['completed','rejected','cancelled'].includes(t.status)).length)} ${lang==='ar'?'بلاغ نشط':'active tickets'}</div>
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
    <div class="field"><label>${tr('reqCategory')}</label><select id="tc">
      <option value="general">${tr('cat_general')}</option>
      <option value="spill">${tr('cat_spill')}</option>
      <option value="restroom">${tr('cat_restroom')}</option>
      <option value="meeting_room">${tr('cat_meeting_room')}</option>
      <option value="emergency">${tr('cat_emergency')}</option>
    </select></div>
    <div class="field"><label>${tr('location')}</label><select id="tl">${(data.locations||[]).map(l=>`<option value="${l.id}">${esc(locName(l))}</option>`).join('')}</select></div>
    <div class="field"><label>${tr('assignedTo')} (${lang==='ar'?'اختياري':'optional'})</label><select id="tw">
      <option value="">${lang==='ar'?'— تعيين تلقائي —':'— Auto-Assign —'}</option>
      ${workers.map(w=>`<option value="${w.id}">${esc(w.name)}</option>`).join('')}
    </select></div>
    <div class="field"><label>${tr('priority')}</label><select id="tp"><option value="high">${tr('high')}</option><option value="medium" selected>${tr('medium')}</option><option value="low">${tr('low')}</option></select></div>
  </div>
  <div class="field" style="margin-bottom:14px"><label>${tr('description')}</label><textarea id="td" rows="2" placeholder="${lang==='ar'?'وصف البلاغ...':'Describe the issue...'}"></textarea></div>
  <button class="btn" onclick="createTicket()">${ic('plus',16)} ${tr('createTicket')}</button>
</div>`:''}
${ticketCards(data.tickets||[])}`;
}

async function createTicket(){
  const assignedTo = document.getElementById('tw').value;
  await api('/tickets',{method:'POST',body:JSON.stringify({
    title:document.getElementById('tt').value,
    description:document.getElementById('td').value,
    locationId:document.getElementById('tl').value,
    assignedTo: assignedTo || undefined,
    category: document.getElementById('tc').value,
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
    const catLabel = tr('cat_'+(t.category||'general')) || (t.category||'general');
    const catClr = t.category==='emergency'?'bad':t.category==='spill'?'warn':t.category==='meeting_room'?'brand':'';
    const statusCls = t.status==='completed'?'ok':['reclean_required','rejected','cancelled'].includes(t.status)?'bad':t.status==='waiting_verification'?'warn':'brand';
    const requesterUser = (data.users||[]).find(u=>u.id===t.createdById);
    const requesterUsername = requesterUser?.username || '';
    const requesterEmpNo = requesterUser?.employeeNo || '';
    return`<div class="ticketCard priority-${t.priority||'medium'}">
      <div class="ticketCard-top">
        <div>
          <div class="ticketCard-title">${esc(t.title)}</div>
          ${t.referenceNo?`<div style="font-size:var(--fs-xs);color:var(--muted);margin-top:2px;font-family:ui-monospace,monospace">${esc(t.referenceNo)}</div>`:''}
        </div>
        <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
          <span class="badge ${statusCls}">${tr(t.status)||t.status}</span>
          ${canEdit?`<button class="btn secondary sm" style="padding:3px 8px" onclick="editTicketModal('${t.id}')">${ic('edit',13)}</button>`:''}
          ${canDel?`<button class="btn danger sm" style="padding:3px 8px" onclick="deleteTicketConfirm('${t.id}')">${ic('trash',13)}</button>`:''}
        </div>
      </div>
      <div class="ticketCard-meta">${ic('locations',12)} ${esc(lang==='ar'?t.locationNameAr:t.locationNameEn)} &nbsp;·&nbsp; ${ic('users',12)} ${esc(t.assignedToName||tr('unassigned'))}</div>
      ${t.createdBy?`<div class="ticketCard-requester">${ic('user',12)} <span class="ticketCard-requester-label">${tr('requester')}:</span> <span class="ticketCard-requester-name">${esc(t.createdBy)}</span>${requesterUsername?`<span class="ticketCard-requester-username">@${esc(requesterUsername)}</span>`:''}${requesterEmpNo?`<span class="ticketCard-requester-empno">${esc(requesterEmpNo)}</span>`:''}</div>`:''}
      ${t.description?`<p style="font-size:var(--fs-sm);color:var(--ink-soft);line-height:1.6">${esc(t.description)}</p>`:''}
      <div class="ticketCard-badges">
        ${t.category&&t.category!=='general'?`<span class="badge ${catClr}">${catLabel}</span>`:''}
        <span class="badge ${prCls}">${lang==='ar'?'أولوية:':''} ${tr(t.priority||'medium')}</span>
        <span class="badge brand">${fmt(t.createdAt)}</span>
        ${!t.assignedToName?`<span class="badge warn">${tr('supervisorQueue')}</span>`:''}
        ${slaBadge(t)}
        ${t.completionTimeMins!=null?`<span class="slaBadge sla-done">${ic('check',11)} ${t.completionTimeMins<60?t.completionTimeMins+tr('mins'):Math.round(t.completionTimeMins/60)+tr('hours')}</span>`:''}
      </div>
      <div class="timeline">
        <div class="timelineItem">
          <div class="timelineDot active"></div>
          <div class="timelineItem-body"><div class="timelineItem-label">${tr('open')}</div><div class="timelineItem-time">${fmt(t.createdAt)}</div></div>
        </div>
        ${t.slaDeadline&&!['completed','rejected','cancelled'].includes(t.status)?`<div class="timelineItem"><div class="timelineDot ${t.slaBreached?'breach':''}"></div><div class="timelineItem-body"><div class="timelineItem-label">${tr('slaDeadline')}</div><div class="timelineItem-time">${fmt(t.slaDeadline)}</div></div></div>`:''}
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
<div class="modal-box">
  <div class="modal-header">
    <div class="modal-title">${ic('edit',16)} ${lang==='ar'?'تعديل البلاغ':'Edit Ticket'}</div>
    <button class="icon-btn" onclick="document.getElementById('editTicketModal').remove()">${ic('x',18)}</button>
  </div>
  <div class="formGrid" style="padding:4px 0">
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
        ${ ['submitted','assigned','accepted','in_progress','waiting_verification','completed','reclean_required','rejected','cancelled'].map(s=>`<option value="${s}"${t.status===s?' selected':''}>${tr(s)||s}</option>`).join('') }
      </select>
    </div>
    <div class="field"><label>${tr('assignedTo')}</label>
      <select id="et-worker">
        <option value="">${tr('unassigned')}</option>
        ${workers.map(w=>`<option value="${w.id}"${t.assignedTo===w.id?' selected':''}>${esc(w.name)}</option>`).join('')}
      </select>
    </div>
  </div>
  <div class="field" style="margin-top:4px"><label>${tr('description')}</label><textarea id="et-desc" rows="3">${esc(t.description||'')}</textarea></div>
  <div class="modal-footer">
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
  <div class="formGrid-4">
    <div class="field"><label>ID</label><input id="lid" class="ltr" placeholder="office-01-a"></div>
    <div class="field"><label>${tr('type')}</label><select id="ltype">${TYPES.map(t=>`<option value="${t}">${tr(t)}</option>`).join('')}</select></div>
    <div class="field"><label>${lang==='ar'?'الاسم العربي':'Arabic Name'}</label><input id="lar" placeholder="الاسم العربي"></div>
    <div class="field"><label>${lang==='ar'?'الاسم الإنجليزي':'English Name'}</label><input id="len" class="ltr" placeholder="English name"></div>
    <div class="field"><label>${tr('floor')}</label><select id="lf">${FACILITY_FLOORS.map(f=>`<option value="${esc(f)}">${esc(f)}</option>`).join('')}</select></div>
    <div class="field"><label>${tr('zone')}</label><select id="lz">${FACILITY_ZONES.map(z=>`<option value="${esc(z)}">${esc(z)}</option>`).join('')}</select></div>
    <div class="field"><label>${tr('priority')}</label><select id="lpri"><option value="high">${tr('high')}</option><option value="medium" selected>${tr('medium')}</option><option value="low">${tr('low')}</option></select></div>
    <div class="field" style="align-self:flex-end"><button class="btn wide" onclick="addLoc()">${ic('plus',16)} ${tr('save')}</button></div>
  </div>
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
  const allUsers = data.users||[];
  const filtered = allUsers.filter(u=>{
    const matchSearch = !usersSearch
      || u.name.toLowerCase().includes(usersSearch.toLowerCase())
      || u.username.toLowerCase().includes(usersSearch.toLowerCase())
      || (u.employeeNo||'').toLowerCase().includes(usersSearch.toLowerCase());
    const matchRole = usersRoleFilter==='all' || u.role===usersRoleFilter;
    const matchStatus = usersStatusFilter==='all' || (usersStatusFilter==='active'?u.active:!u.active);
    return matchSearch && matchRole && matchStatus;
  });

  const total = allUsers.length;
  const active = allUsers.filter(u=>u.active).length;
  const inactive = total - active;
  const multiRole = allUsers.filter(u=>(u.roles||[]).length>1).length;

  return`
<div class="pageHeader">
  <div class="pageHeader-left">
    <div class="pageTitle">${tr('users')}</div>
    <div class="pageSub">${num(filtered.length)}${filtered.length!==allUsers.length?' / '+num(allUsers.length):''} ${lang==='ar'?'مستخدم':'users'}</div>
  </div>
  <div class="pageHeader-actions">
    ${canManageUsers()?`<button class="btn" onclick="showUserFormModal()">${ic('plus',16)} ${tr('addUser')}</button>`:''}
  </div>
</div>

<!-- Summary stats -->
<div class="userSummaryGrid">
  <div class="userSummaryCard">
    <div class="userSummaryCard-icon brand">${ic('users',20)}</div>
    <div class="userSummaryCard-body">
      <div class="userSummaryCard-value">${num(total)}</div>
      <div class="userSummaryCard-label">${lang==='ar'?'إجمالي المستخدمين':'Total Users'}</div>
    </div>
  </div>
  <div class="userSummaryCard">
    <div class="userSummaryCard-icon ok">${ic('check',20)}</div>
    <div class="userSummaryCard-body">
      <div class="userSummaryCard-value">${num(active)}</div>
      <div class="userSummaryCard-label">${lang==='ar'?'نشط':'Active'}</div>
    </div>
  </div>
  <div class="userSummaryCard">
    <div class="userSummaryCard-icon bad">${ic('x',20)}</div>
    <div class="userSummaryCard-body">
      <div class="userSummaryCard-value">${num(inactive)}</div>
      <div class="userSummaryCard-label">${lang==='ar'?'معطل':'Inactive'}</div>
    </div>
  </div>
  <div class="userSummaryCard">
    <div class="userSummaryCard-icon gold">${ic('layers',20)}</div>
    <div class="userSummaryCard-body">
      <div class="userSummaryCard-value">${num(multiRole)}</div>
      <div class="userSummaryCard-label">${lang==='ar'?'متعدد الصلاحيات':'Multi-Role'}</div>
    </div>
  </div>
</div>

<!-- Filter bar -->
<div class="usersFilterBar">
  <input type="search" placeholder="${lang==='ar'?'بحث...':'Search users...'}" value="${esc(usersSearch)}"
    oninput="usersSearch=this.value;render()">
  <div class="usersFilterBar-sep"></div>
  <select onchange="usersRoleFilter=this.value;render()">
    <option value="all"${usersRoleFilter==='all'?' selected':''}>${lang==='ar'?'كل الصلاحيات':'All Roles'}</option>
    ${ROLES.map(r=>`<option value="${r}"${usersRoleFilter===r?' selected':''}>${tr(r)}</option>`).join('')}
  </select>
  <select onchange="usersStatusFilter=this.value;render()">
    <option value="all"${usersStatusFilter==='all'?' selected':''}>${lang==='ar'?'كل الحالات':'All Status'}</option>
    <option value="active"${usersStatusFilter==='active'?' selected':''}>${tr('activeUser')}</option>
    <option value="inactive"${usersStatusFilter==='inactive'?' selected':''}>${tr('inactive')}</option>
  </select>
</div>

<!-- Enterprise table -->
${filtered.length===0
  ? `<div class="card"><div class="empty-state"><div class="empty-icon">${ic('users',28)}</div><div class="empty-title">${lang==='ar'?'لا توجد نتائج':'No results found'}</div><p class="empty-sub">${lang==='ar'?'جرب تغيير الفلتر أو كلمة البحث':'Try changing the filter or search term'}</p></div></div>`
  : `<div class="usersTableWrap">
  <table class="usersTable">
    <thead>
      <tr>
        <th>${lang==='ar'?'المستخدم':'User'}</th>
        <th>${lang==='ar'?'رقم الموظف':'Emp No'}</th>
        <th>${lang==='ar'?'الحالة':'Status'}</th>
        <th>${lang==='ar'?'الصلاحيات':'Roles'}</th>
        ${canManageUsers()?`<th style="text-align:end">${lang==='ar'?'إجراءات':'Actions'}</th>`:''}
      </tr>
    </thead>
    <tbody>
      ${filtered.map(u=>{
        const canEdit = canManageUsers();
        const canDel = canManageUsers() && u.id!==me.id;
        const rCls = roleBadgeClass(u.role);
        const extraRoles = (u.roles||[]).filter(r=>r!==u.role);
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
          <td class="mono" style="font-size:11px;color:var(--muted)">${u.employeeNo?esc(u.employeeNo):'—'}</td>
          <td><span class="badge ${u.active?'ok':'bad'}">${u.active?tr('activeUser'):tr('inactive')}</span></td>
          <td>
            <div class="usersTable-roles">
              <span class="badge ${rCls}">${tr(u.role)}</span>
              ${extraRoles.map(r=>`<span class="badge" style="font-size:10px">${tr(r)}</span>`).join('')}
            </div>
          </td>
          ${canEdit?`<td>
            <div class="usersTable-actions">
              <button class="btn secondary sm" onclick="showAddRoleModal('${u.id}')" title="${lang==='ar'?'إدارة الصلاحيات':'Manage Roles'}">${ic('shield',13)} ${lang==='ar'?'الصلاحيات':'Roles'}</button>
              <button class="btn secondary sm" onclick="showUserFormModal('${u.id}')" title="${lang==='ar'?'تعديل':'Edit'}">${ic('edit',13)}</button>
              ${canDel?`<button class="btn danger sm" onclick="deleteUserConfirm('${u.id}')" title="${lang==='ar'?'حذف':'Delete'}">${ic('trash',13)}</button>`:''}
            </div>
          </td>`:''}
        </tr>`;
      }).join('')}
    </tbody>
  </table>
</div>`}`;
}

function showUserFormModal(id){
  const editableRoles = me.role==='system_admin'?ROLES:['cleaning_supervisor','cleaner'];
  const u = id?(data.users||[]).find(x=>x.id===id):null;
  editUserId = id||null;

  document.getElementById('userFormModal')?.remove();
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'userFormModal';
  modal.innerHTML=`<div class="modal-box">
    <div class="modal-header">
      <div>
        <div class="modal-title">${u?`${ic('edit',16)} ${tr('edit')}`:ic('plus',16)+' '+tr('addUser')}</div>
        ${me.role==='cleaning_manager'?`<div class="modal-subtitle">${lang==='ar'?'تدير العمال والمشرفين':'Manages workers & supervisors'}</div>`:''}
      </div>
      <button class="icon-btn" onclick="hideUserFormModal()">${ic('x',18)}</button>
    </div>
    <div class="formGrid" style="padding:0 0 4px">
      <div class="field"><label>${tr('name')}</label><input id="un" value="${u?esc(u.name):''}"></div>
      <div class="field"><label>${tr('username')}</label><input id="uu" class="ltr" value="${u?esc(u.username):''}"></div>
      <div class="field"><label>${tr('password')}</label><input id="up" class="ltr" placeholder="••••••••"></div>
      <div class="field"><label>${tr('role')}</label><select id="ur">${editableRoles.map(r=>`<option value="${r}"${u&&u.role===r?' selected':''}>${tr(r)}</option>`).join('')}</select></div>
      <div class="field"><label>${tr('employeeNo')}</label><input id="ue" class="ltr" value="${u&&u.employeeNo?esc(u.employeeNo):''}"></div>
      <div class="field"><label>${tr('status')}</label><select id="ua"><option value="true"${u&&u.active?' selected':''}>${tr('activeUser')}</option><option value="false"${u&&!u.active?' selected':''}>${tr('inactive')}</option></select></div>
    </div>
    <div class="modal-footer">
      <button class="btn" onclick="saveUser()">${ic('check',16)} ${tr('save')}</button>
      <button class="btn secondary" onclick="hideUserFormModal()">${tr('cancel')}</button>
    </div>
  </div>`;
  modal.addEventListener('click',e=>{if(e.target===modal)hideUserFormModal();});
  document.body.appendChild(modal);
}

function hideUserFormModal(){
  editUserId = null;
  document.getElementById('userFormModal')?.remove();
}

function editUser(id){
  showUserFormModal(id);
}

function clearUserForm(){
  hideUserFormModal();
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
  hideUserFormModal();
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

function showAddRoleModal(userId){
  const u=(data.users||[]).find(x=>x.id===userId);
  if(!u) return;
  const existingRoles = u.roles||[u.role];

  const ROLE_COLORS = {
    system_admin:       {bg:'#E6F4F2', color:'#0F3D3E'},
    facility_manager:   {bg:'rgba(10,78,91,.12)', color:'var(--brand)'},
    cleaning_manager:   {bg:'#F5E9FF', color:'#6B21A8'},
    cleaning_supervisor:{bg:'rgba(26,105,164,.12)', color:'var(--info)'},
    cleaner:            {bg:'rgba(22,136,77,.10)', color:'var(--ok)'},
    employee:           {bg:'rgba(185,154,95,.12)', color:'var(--gold)'}
  };

  function buildRoleCards(){
    return ROLES.map(r=>{
      const active = existingRoles.includes(r);
      const isLast = active && existingRoles.length===1;
      const rc = ROLE_COLORS[r]||{bg:'var(--surface-3)',color:'var(--muted)'};
      const iconStyle = `background:${rc.bg};color:${rc.color}`;
      return `<div class="roleCard ${active?'active':''} ${isLast?'locked':''}"
        title="${isLast?(lang==='ar'?'لا يمكن إزالة الصلاحية الأخيرة':'Cannot remove the last role'):''}"
        onclick="${active?(isLast?'':`removeUserRole('${userId}','${r}')`):`addUserRole('${userId}','${r}')`}">
        <div class="roleCardIcon" style="${iconStyle}">${active?ic('check',14):ic('plus',14)}</div>
        <div class="roleCardName">${tr(r)}</div>
        ${isLast?`<div class="roleCardLock">${ic('lock',10)}</div>`:''}
      </div>`;
    }).join('');
  }

  document.getElementById('rolesModal')?.remove();
  const modal=document.createElement('div');
  modal.className='modal-overlay';
  modal.id='rolesModal';
  modal.innerHTML=`<div class="modal-box roles-modal-box">
    <div class="modal-header">
      <div>
        <div class="modal-title">${tr('rolesLabel')}</div>
        <div class="modal-subtitle">${esc(u.name)}</div>
      </div>
      <button class="icon-btn" onclick="document.getElementById('rolesModal').remove()">${ic('x',18)}</button>
    </div>
    <div class="roles-grid" id="rolesGrid">${buildRoleCards()}</div>
    <div class="modal-footer">
      <button class="btn secondary" onclick="document.getElementById('rolesModal').remove()">${tr('cancel')}</button>
    </div>
  </div>`;
  modal.addEventListener('click',e=>{if(e.target===modal)modal.remove();});
  document.body.appendChild(modal);

  window._rolesModalUserId = userId;
  window._rolesModalRefresh = async ()=>{
    await load();
    const updated = (data.users||[]).find(x=>x.id===userId);
    if(!updated) return;
    existingRoles.length=0;
    (updated.roles||[updated.role]).forEach(r=>existingRoles.push(r));
    const grid = document.getElementById('rolesGrid');
    if(grid) grid.innerHTML = buildRoleCards();
  };
}

async function addUserRole(userId, role){
  try{
    await api(`/users/${userId}/roles`,{method:'POST',body:JSON.stringify({role})});
    toast(lang==='ar'?'تم إضافة الصلاحية':'Role added','ok');
    if(window._rolesModalRefresh) await window._rolesModalRefresh();
  }catch(e){ toast(e.message||'Error','bad'); }
}

async function removeUserRole(userId, role){
  try{
    await api(`/users/${userId}/roles/${role}`,{method:'DELETE'});
    toast(lang==='ar'?'تم إزالة الصلاحية':'Role removed','ok');
    if(window._rolesModalRefresh) await window._rolesModalRefresh();
  }catch(e){ toast(e.message||'Error','bad'); }
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
  const myTickets = (data.tickets||[]).filter(t=>t.assignedTo===me.id&&!['completed','rejected','cancelled'].includes(t.status));
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
      ${me.roles&&me.roles.length>1?`<button class="tb-workspace" onclick="renderWorkspaceSwitcher()">${ic('layers',13)}<span class="tb-workspace-label">${roleLabel(me.role)}</span>${ic('chevron',13)}</button>`:''}
      <button class="icon-btn tb-profile-btn" onclick="showProfileCenter()" title="${tr('myProfile')}">${esc(initials(me.name))}</button>
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
      <div class="wCard-list">
        ${myTickets.map(t=>`
          <button class="workerTicketItem" onclick="startTicketWorker('${t.id}')">
            <div class="workerTicketItem-title">${esc(t.title)}</div>
            <div class="workerTicketItem-loc">${esc(lang==='ar'?t.locationNameAr:t.locationNameEn)}</div>
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
        <div class="wCard-list">
          ${reviewed.map(r=>{
            const st=r.approvalStatus;
            const stLabel={approved:lang==='ar'?'معتمد':'Approved',rejected:lang==='ar'?'مرفوض':'Rejected',needs_recleaning:lang==='ar'?'إعادة تنظيف':'Re-clean'}[st]||st;
            const stColor=st==='approved'?'ok':st==='rejected'?'bad':'warn';
            const actionable=st==='rejected'||st==='needs_recleaning';
            const borderClr=actionable?'rgba(200,50,50,.25)':'var(--line)';
            const iconBorderClr=stColor==='ok'?'var(--ok)':stColor==='bad'?'var(--bad)':'var(--warn)';
            return `<div class="workerReportItem ${actionable?'actionable':''}" ${actionable?`onclick="document.getElementById('locCode').value='${r.locationId}';startForm()"`:''}
              style="border-color:${borderClr};background:var(--${stColor}-bg)">
              <div class="workerReportItem-icon" style="background:var(--${stColor}-bg);border-color:${iconBorderClr}">
                ${ic(st==='approved'?'check':st==='rejected'?'x':'flip',16)}
              </div>
              <div class="workerReportItem-body">
                <div class="workerReportItem-name">${esc(lang==='ar'?r.locationNameAr:r.locationNameEn)}</div>
                <div class="workerReportItem-meta">${fmt(r.approvedAt||r.createdAt)}${r.reviewNote?' · '+esc(r.reviewNote):''}</div>
                <span class="badge ${stColor}" style="margin-top:6px">${stLabel}</span>
              </div>
              ${actionable?`<div class="workerReportItem-action" style="color:var(--${stColor})">${lang==='ar'?'إعادة':'Redo'} ${ic('arrow',14)}</div>`:''}
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

    <!-- Fullscreen camera (ensureCameraOverlay injects into body) -->
  </div>
</div>`;

  if(param) setTimeout(startForm, 150);
}

let cameraFacing = 'environment';

/* ── Camera overlay — created on demand, lives in body ──── */
function ensureCameraOverlay(){
  if(document.getElementById('cameraFull')) return;
  const div = document.createElement('div');
  div.id = 'cameraFull';
  div.className = 'cameraFull';
  div.innerHTML = `<div class="cameraViewport">
    <video id="camVideo" autoplay playsinline muted></video>
    <div class="cameraFrame"></div>
    <div class="cameraTop">
      <div class="cameraTop-title" id="cameraTopTitle">${ic('camera',18)} ${tr('takePhoto')}</div>
      <button class="camSideBtn" onclick="closeCamera()">${ic('x',20)}</button>
    </div>
    <div id="cameraCounter" class="cameraCounter" style="display:none"></div>
  </div>
  <div class="cameraBottom">
    <button class="camSideBtn" onclick="toggleCameraFacing()" id="camFlipBtn">${ic('flip',20)}</button>
    <button class="shutter" id="camShutter" onclick="capturePhoto()"></button>
    <button class="camSideBtn" onclick="closeCamera();doneCamera()">${lang==='ar'?'تم':'Done'}</button>
  </div>`;
  document.body.appendChild(div);
}

function workerGoBack(){
  const form=document.getElementById('workerForm');
  if(form&&form.innerHTML.trim()){
    form.innerHTML='';
    currentPhotos=[]; currentBeforePhotos=[]; currentAfterPhotos=[];
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
  currentBeforePhotos = []; currentAfterPhotos = [];
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
      <div class="wCard-title"><span class="wCard-number" style="background:var(--warn-bg);color:var(--warn)">${ic('camera',14)}</span>${tr('beforePhotos')}</div>
      <p style="font-size:var(--fs-xs);color:var(--muted);margin-bottom:12px">${tr('beforePhotoHint')}</p>
      <button class="cameraBtn" onclick="openCamera('before')">
        ${ic('camera',22)}
        <span>${tr('addPhoto')} — ${tr('beforePhotos')}</span>
      </button>
      <div id="beforePreviews" class="photoGrid" style="margin-top:12px"></div>
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
      <div class="wCard-title"><span class="wCard-number" style="background:var(--ok-bg);color:var(--ok)">${ic('check',14)}</span>${tr('afterPhotos')}</div>
      <p style="font-size:var(--fs-xs);color:var(--muted);margin-bottom:12px">${tr('afterPhotoHint')}</p>
      <button class="cameraBtn" onclick="openCamera('after')">
        ${ic('camera',22)}
        <span>${tr('addPhoto')} — ${tr('afterPhotos')}</span>
      </button>
      <div id="afterPreviews" class="photoGrid" style="margin-top:12px"></div>
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
async function openCamera(mode='general'){
  cameraMode = mode;

  // Check HTTPS / mediaDevices availability
  if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){
    const isHTTPS = location.protocol==='https:' || location.hostname==='localhost' || location.hostname==='127.0.0.1';
    const msg = isHTTPS
      ? (lang==='ar'?'الكاميرا غير مدعومة في هذا المتصفح':'Camera not supported in this browser')
      : (lang==='ar'?'تتطلب الكاميرا اتصالاً آمناً (HTTPS)':'Camera requires a secure connection (HTTPS)');
    toast(msg,'bad');
    return;
  }

  ensureCameraOverlay();

  try{
    if(stream) stream.getTracks().forEach(t=>t.stop());
    // Try environment (back) camera first; fall back to any available camera
    let constraints = {video:{facingMode:{ideal:cameraFacing},width:{ideal:1280},height:{ideal:720}},audio:false};
    try{
      stream = await navigator.mediaDevices.getUserMedia(constraints);
    }catch(fallbackErr){
      stream = await navigator.mediaDevices.getUserMedia({video:true,audio:false});
    }

    const cam = document.getElementById('cameraFull');
    cam.classList.add('active');

    const shutter = document.getElementById('camShutter');
    if(shutter) shutter.style.background = mode==='before'?'var(--warn)':mode==='after'?'var(--ok)':'';

    const modeEl = document.getElementById('cameraTopTitle');
    if(modeEl){
      const lbl = mode==='before'?tr('beforePhotos'):mode==='after'?tr('afterPhotos'):tr('takePhoto');
      modeEl.innerHTML = `${ic('camera',18)} ${lbl}`;
    }

    const vid = document.getElementById('camVideo');
    vid.srcObject = stream;
    vid.muted = true;
    try{ await vid.play(); }catch{}
    updateCameraCounter();
  }catch(e){
    let msg;
    if(e.name==='NotAllowedError'||e.name==='PermissionDeniedError'){
      msg=lang==='ar'?'تم رفض إذن الكاميرا. افتح إعدادات المتصفح وامنح الإذن.':'Camera permission denied. Open browser settings and grant permission.';
    }else if(e.name==='NotFoundError'||e.name==='DevicesNotFoundError'){
      msg=lang==='ar'?'لا توجد كاميرا متاحة في هذا الجهاز.':'No camera found on this device.';
    }else if(e.name==='NotReadableError'||e.name==='TrackStartError'){
      msg=lang==='ar'?'الكاميرا مستخدمة من تطبيق آخر. أغلق التطبيقات الأخرى وحاول مجدداً.':'Camera is in use by another app. Close other apps and try again.';
    }else if(e.name==='OverconstrainedError'){
      msg=lang==='ar'?'لا تدعم الكاميرا الإعدادات المطلوبة.':'Camera does not support the requested settings.';
    }else{
      msg=(lang==='ar'?'خطأ في الكاميرا: ':'Camera error: ')+e.message;
    }
    toast(msg,'bad');
    console.warn('[camera]',e.name,e.message);
  }
}
function toggleCameraFacing(){
  cameraFacing = cameraFacing==='environment'?'user':'environment';
  openCamera(cameraMode);
}
function closeCamera(){
  if(stream){ stream.getTracks().forEach(t=>t.stop()); stream=null; }
  const cam=document.getElementById('cameraFull');
  if(cam) cam.classList.remove('active');
}
function doneCamera(){
  renderPhotoPreviews(cameraMode);
  if(window._empPhotoMode){ renderEmpPhotoPrev(); window._empPhotoMode=false; }
}
function renderEmpPhotoPrev(){
  const el=document.getElementById('empPhotoPrev');
  if(!el) return;
  el.innerHTML=currentPhotos.map((p,i)=>`<div class="photoItem">
    <img src="${p}" loading="lazy">
    <button class="photoItem-del" onclick="currentPhotos.splice(${i},1);renderEmpPhotoPrev()">×</button>
  </div>`).join('');
}
function updateCameraCounter(){
  const el = document.getElementById('cameraCounter');
  if(!el) return;
  const arr = cameraMode==='before'?currentBeforePhotos:cameraMode==='after'?currentAfterPhotos:currentPhotos;
  if(arr.length>0){el.style.display='block';el.textContent=`${arr.length} ${lang==='ar'?'صورة':'photos'}`}
  else{el.style.display='none'}
}
function capturePhoto(){
  const vid = document.getElementById('camVideo');
  if(!vid||!vid.videoWidth) return;
  const c = document.createElement('canvas');
  c.width = vid.videoWidth; c.height = vid.videoHeight;
  c.getContext('2d').drawImage(vid,0,0);
  compactImage(c.toDataURL('image/jpeg',.86)).then(img=>{
    if(cameraMode==='before') currentBeforePhotos.push(img);
    else if(cameraMode==='after') currentAfterPhotos.push(img);
    else currentPhotos.push(img);
    updateCameraCounter();
    // Flash feedback
    const flash = document.createElement('div');
    flash.style.cssText='position:fixed;inset:0;background:#fff;opacity:.5;z-index:9999;pointer-events:none';
    document.body.appendChild(flash);
    setTimeout(()=>flash.remove(),150);
  });
}

function renderPhotoPreviews(mode='general'){
  if(mode==='before'||mode==='after'){
    const arr = mode==='before'?currentBeforePhotos:currentAfterPhotos;
    const elId = mode==='before'?'beforePreviews':'afterPreviews';
    const el = document.getElementById(elId);
    if(!el) return;
    el.innerHTML = arr.map((p,i)=>`
      <div class="photoItem">
        <img src="${p}" alt="" onclick='openGallery(${JSON.stringify(arr)},${i})'>
        <button class="photoItem-del" onclick="${mode==='before'?'currentBeforePhotos':'currentAfterPhotos'}.splice(${i},1);renderPhotoPreviews('${mode}')">×</button>
      </div>`).join('') || `<div style="font-size:var(--fs-xs);color:var(--muted);text-align:center;padding:12px">${tr('photoRequired')}</div>`;
  } else {
    const el = document.getElementById('photoPreviews');
    if(!el) return;
    el.innerHTML = currentPhotos.map((p,i)=>`
      <div class="photoItem">
        <img src="${p}" alt="" onclick='openGallery(${JSON.stringify(currentPhotos)},${i})'>
        <button class="photoItem-del" onclick="currentPhotos.splice(${i},1);renderPhotoPreviews('general')">×</button>
      </div>`).join('') || `<div style="font-size:var(--fs-xs);color:var(--muted);text-align:center;padding:12px">${tr('photoRequired')}</div>`;
  }
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

      const empInput = document.getElementById('empLocCode');
      const locInput = document.getElementById('locCode');
      const isEmployee = !!empInput;
      const targetInput = isEmployee ? empInput : locInput;
      if(targetInput) targetInput.value = loc;

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
      if(!isEmployee) setTimeout(()=>startForm(), 200);
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
  const hasPhotos = currentBeforePhotos.length||currentAfterPhotos.length||currentPhotos.length;
  if(!hasPhotos) return toast(tr('photoRequired'),'bad');
  const btn = document.querySelector('.submitBtn');
  if(btn){btn.disabled=true;btn.innerHTML=`<div class="spinner" style="width:24px;height:24px;border-width:2.5px"></div>`}
  const usesTyped = currentBeforePhotos.length||currentAfterPhotos.length;
  const payload = {
    locationId,
    status:document.getElementById('wkStatus')?.value||'completed',
    notes:document.getElementById('wkNotes')?.value||'',
    tasks:[...document.querySelectorAll('.taskCheck:checked')].map(x=>x.value),
    ...(usesTyped
      ? { beforePhotos: currentBeforePhotos, afterPhotos: currentAfterPhotos }
      : { photos: currentPhotos })
  };
  if(currentTicketId){
    try{await api('/tickets/complete',{method:'POST',body:JSON.stringify({id:currentTicketId,photos:currentPhotos,notes:payload.notes})})}
    catch(e){}
    currentTicketId = null;
  }
  try{
    await api('/reports',{method:'POST',body:JSON.stringify(payload)});
    toast(tr('reportSent'),'ok');
    currentPhotos = []; currentBeforePhotos = []; currentAfterPhotos = [];
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

/* ═══════════════════════════════════════════════════════════════
   EMPLOYEE PORTAL — /order/cleaning
   ═══════════════════════════════════════════════════════════════ */
function renderEmployee(){
  setDoc();
  const myOrders = (data.tickets||[]).filter(t=>t.createdById===me.id);
  app.innerHTML=`
<div class="workerPage">
  <div class="prototype-banner" role="alert">
    ${lang==='ar'?'⚠ نسخة تجريبية — بيانات غير حقيقية':'⚠ Prototype — Demo Data Only'}
  </div>
  <header class="workerTopbar">
    <div class="workerTopbar-brand">
      <div class="workerTopbar-icon"><img src="/assets/logos/logo-icon-dark.svg" onerror="this.style.display='none'" alt="REGA"></div>
      <div>
        <div class="workerTopbar-name">${esc(me.name)}</div>
        <span class="workerTopbar-role">${tr('employee')}</span>
      </div>
    </div>
    <div class="workerTopbar-actions">
      ${me.roles&&me.roles.length>1?`<button class="tb-workspace" onclick="renderWorkspaceSwitcher()">${ic('layers',13)}<span class="tb-workspace-label">${roleLabel(me.role)}</span>${ic('chevron',13)}</button>`:''}
      <button class="icon-btn tb-profile-btn" onclick="showProfileCenter()" title="${tr('myProfile')}">${esc(initials(me.name))}</button>
      <button class="icon-btn" onclick="switchLang()" title="${tr('lang')}">${tr('lang')}</button>
      <button class="icon-btn" onclick="logout()" title="${tr('logout')}">${ic('logout',20)}</button>
    </div>
  </header>
  <div class="workerContent">
    <!-- Tab bar -->
    <div class="empTabs">
      <button class="empTab${employeeTab==='submit'?' active':''}" onclick="employeeTab='submit';renderEmployee()">${ic('send',15)} ${tr('submitRequest')}</button>
      <button class="empTab${employeeTab==='history'?' active':''}" onclick="employeeTab='history';renderEmployee()">
        ${ic('list',15)} ${tr('myRequests')}
        ${myOrders.filter(t=>!['completed','rejected','cancelled'].includes(t.status)).length?`<span class="empTab-badge">${myOrders.filter(t=>!['completed','rejected','cancelled'].includes(t.status)).length}</span>`:''}
      </button>
    </div>
    ${employeeTab==='submit' ? employeeSubmitForm() : employeeHistory(myOrders)}
  </div>
</div>`;
}

function employeeSubmitForm(){
  const CATS = ['general','spill','restroom','meeting_room','emergency'];
  const CAT_ICONS = {general:'locations',spill:'alert-circle',restroom:'locations',meeting_room:'users',emergency:'bell'};
  return`
<div class="wCard">
  <div class="wCard-title"><span class="wCard-number">1</span>${lang==='ar'?'حدد الموقع':'Select Location'}</div>
  <div class="field">
    <label>${lang==='ar'?'كود الموقع':'Location Code'}</label>
    <div class="locInput-wrap">
      <input id="empLocCode" class="ltr" placeholder="wc-gf-a">
      <button class="locInput-scan" onclick="openQRScanner()" title="${tr('scanQR')}">${ic('qr',18)}</button>
    </div>
  </div>
  <div id="empLocName" style="font-size:var(--fs-xs);color:var(--brand-mid);min-height:18px;margin-top:4px"></div>
  <script>document.getElementById('empLocCode')?.addEventListener('input',function(){
    const id=this.value.trim();
    const loc=(data&&data.locations||[]).find(l=>l.id===id);
    const el=document.getElementById('empLocName');
    if(el)el.textContent=loc?(lang==='ar'?loc.nameAr:loc.nameEn):'';
  });<\/script>
</div>

<div class="wCard">
  <div class="wCard-title"><span class="wCard-number">2</span>${tr('reqCategory')}</div>
  <div class="empCatGrid">
    ${CATS.map(c=>`
      <button class="empCatBtn" data-cat="${c}" onclick="document.querySelectorAll('.empCatBtn').forEach(b=>b.classList.remove('active'));this.classList.add('active');document.getElementById('empCatVal').value='${c}'">
        <span class="empCatBtn-icon">${ic(CAT_ICONS[c]||'locations',20)}</span>
        <span>${tr('cat_'+c)}</span>
      </button>`).join('')}
  </div>
  <input type="hidden" id="empCatVal" value="general">
</div>

<div class="wCard">
  <div class="wCard-title"><span class="wCard-number">3</span>${lang==='ar'?'تفاصيل الطلب':'Request Details'}</div>
  <div class="field">
    <label>${tr('description')} <span style="color:var(--muted);font-weight:400">(${lang==='ar'?'اختياري':'optional'})</span></label>
    <textarea id="empDesc" rows="3" placeholder="${lang==='ar'?'صف المشكلة بالتفصيل...':'Describe the issue in detail...'}"></textarea>
  </div>
  <div class="field">
    <label>${lang==='ar'?'صورة (اختياري)':'Photo (optional)'}</label>
    <button class="cameraBtn" onclick="openCamera('general');window._empPhotoMode=true">
      ${ic('camera',20)}<span>${lang==='ar'?'إضافة صورة':'Add Photo'}</span>
    </button>
    <div id="empPhotoPrev" class="photoGrid" style="margin-top:10px"></div>
  </div>
</div>

<div style="height:90px"></div>
<div class="stickySubmit">
  <button class="submitBtn" onclick="submitEmployeeOrder()">${ic('send',18)} ${tr('submitRequest')}</button>
</div>`;
}

function employeeHistory(orders){
  if(!orders.length) return`
<div class="wCard"><div class="empty-state">
  <div class="empty-icon">${ic('list',36)}</div>
  <div class="empty-title">${lang==='ar'?'لا توجد طلبات بعد':'No requests yet'}</div>
  <p class="empty-sub">${lang==='ar'?'قدّم أول طلب تنظيف من التبويب الأول':'Submit your first cleaning request from the first tab'}</p>
</div></div>`;

  return`
<div class="wCard">
  <div class="wCard-title">${ic('list',16)} ${tr('myRequests')} (${orders.length})</div>
  <div class="wCard-list" style="gap:10px">
    ${orders.map(t=>{
      const stCls = t.status==='completed'?'ok':['reclean_required','rejected','cancelled'].includes(t.status)?'bad':t.status==='waiting_verification'?'warn':'brand';
      const catLabel = tr('cat_'+(t.category||'general'));
      return`<div class="empOrderCard">
        <div class="empOrderCard-head">
          <div>
            <div class="empOrderCard-title">${esc(t.title)}</div>
            ${t.referenceNo?`<div class="empOrderCard-ref">${esc(t.referenceNo)}</div>`:''}
          </div>
          <span class="badge ${stCls}">${tr(t.status)||t.status}</span>
        </div>
        <div class="empOrderCard-meta">
          ${ic('locations',11)} ${esc(lang==='ar'?t.locationNameAr:t.locationNameEn)}
          <span>·</span>
          <span class="badge">${catLabel}</span>
          <span>·</span>
          ${fmt(t.createdAt)}
        </div>
        ${t.assignedToName?`<div class="empOrderCard-assigned">${ic('users',11)} ${lang==='ar'?'تم التعيين لـ:':'Assigned to:'} ${esc(t.assignedToName)}</div>`:`<div class="empOrderCard-queue">${lang==='ar'?'في قائمة انتظار المشرف':'In supervisor queue'}</div>`}
      </div>`;
    }).join('')}
  </div>
</div>`;
}

async function submitEmployeeOrder(){
  const locId = document.getElementById('empLocCode')?.value.trim();
  const category = document.getElementById('empCatVal')?.value || 'general';
  const desc = document.getElementById('empDesc')?.value.trim() || '';
  if(!locId) return toast(lang==='ar'?'أدخل كود الموقع':'Enter location code','bad');
  const loc = (data.locations||[]).find(l=>l.id===locId);
  if(!loc) return toast(lang==='ar'?`الموقع "${locId}" غير موجود`:`Location "${locId}" not found`,'bad');
  const btn = document.querySelector('.submitBtn');
  if(btn){btn.disabled=true;btn.innerHTML=`<div class="spinner" style="width:22px;height:22px;border-width:2.5px"></div>`}
  const photo = currentPhotos[0] || null;
  try{
    const res = await api('/order',{method:'POST',body:JSON.stringify({
      locationId:locId, category, description:desc,
      photo: photo || undefined
    })});
    currentPhotos = [];
    toast(tr('requestSubmitted'),'ok');
    // Show success card
    const wc = document.querySelector('.workerContent');
    if(wc) wc.innerHTML=`
      <div class="wCard" style="text-align:center;padding:40px 24px;margin-top:24px">
        <div style="width:72px;height:72px;border-radius:50%;background:var(--ok-bg);margin:0 auto 16px;display:grid;place-items:center;color:var(--ok)">${ic('check',32)}</div>
        <div style="font-family:var(--font-head);font-size:var(--fs-xl);font-weight:800;color:var(--ink)">${tr('requestSubmitted')}</div>
        ${res.ticket.referenceNo?`<div style="font-family:ui-monospace,monospace;font-size:var(--fs-sm);color:var(--brand-mid);margin-top:8px">${esc(res.ticket.referenceNo)}</div>`:''}
        <p style="color:var(--muted);margin-top:8px;font-size:var(--fs-sm)">${res.autoAssigned?(lang==='ar'?'تم التعيين التلقائي لعامل النظافة':'Auto-assigned to a cleaning worker'):(lang==='ar'?'تم إرسال الطلب للمشرف':'Sent to supervisor queue')}</p>
        <button class="btn wide" style="margin-top:20px" onclick="employeeTab='submit';renderEmployee()">${lang==='ar'?'طلب جديد':'New Request'}</button>
        <button class="btn secondary wide" style="margin-top:10px" onclick="employeeTab='history';load().then(renderEmployee)">${tr('myRequests')}</button>
      </div>`;
  }catch(e){
    if(btn){btn.disabled=false;btn.innerHTML=`${ic('send',18)} ${tr('submitRequest')}`}
    toast(lang==='ar'?'حدث خطأ، حاول مرة أخرى':'Error, please try again','bad');
  }
}

/* ═══════════════════════════════════════════════════════════════
   PERFORMANCE VIEW — Phases 7 & 8
   ═══════════════════════════════════════════════════════════════ */
async function performance(){
  // Load fresh performance data
  let metrics = [];
  try{
    const res = await api('/performance');
    perfData = res;
    metrics = res.metrics || [];
  }catch(e){
    return`<div class="card"><div class="empty-state"><div class="empty-icon">${ic('bar-chart',28)}</div><div class="empty-title">${lang==='ar'?'تعذر تحميل بيانات الأداء':'Failed to load performance data'}</div></div></div>`;
  }

  // Monthly recognition top 3
  const scored = metrics.map(w=>{
    const approval = w.approvalRate ?? 0;
    const quality  = w.avgQuality ?? 0;
    const ratingS  = w.avgRatingSupervisor ? w.avgRatingSupervisor*20 : 0;
    const ratingM  = w.avgRatingManager ? w.avgRatingManager*20 : 0;
    const ratingAvg = ratingS || ratingM ? ((ratingS||ratingM) + (ratingM&&ratingS ? ratingM : 0)) / (ratingM&&ratingS ? 2 : 1) : 0;
    const workload = Math.max(0, 100 - (w.workloadScore||0));
    const weighted = Math.round(approval*0.3 + quality*0.25 + ratingAvg*0.25 + workload*0.2);
    return {...w, weighted};
  }).sort((a,b)=>b.weighted-a.weighted);

  const medals = ['🥇','🥈','🥉'];

  return`
<div class="pageHeader">
  <div class="pageHeader-left">
    <div class="pageTitle">${tr('performance')}</div>
    <div class="pageSub">${metrics.length} ${lang==='ar'?'عامل — آخر 30 يوم':'workers — last 30 days'}</div>
  </div>
  <div class="pageActions">
    <button class="btn secondary sm" onclick="exportPerformancePDF()">${ic('reports',14)} ${lang==='ar'?'تصدير PDF':'PDF'}</button>
  </div>
</div>

<!-- MONTHLY RECOGNITION -->
${scored.length>=1?`
<div class="card" style="margin-bottom:20px">
  <div class="card-head">
    <span class="card-title">${ic('award',16)} ${tr('monthlyRecognition')}</span>
    <span class="badge gold">${lang==='ar'?'يونيو 2026':'June 2026'}</span>
  </div>
  <div class="recognitionPodium">
    ${scored.slice(0,3).map((w,i)=>`
      <div class="podiumCard ${i===0?'gold':i===1?'silver':'bronze'}">
        <div class="podiumCard-medal">${medals[i]||''}</div>
        <div class="podiumCard-avatar">${esc(initials(w.name))}</div>
        <div class="podiumCard-name">${esc(w.name)}</div>
        <div class="podiumCard-score">${w.weighted}${lang==='ar'?'%':''}</div>
        <div class="podiumCard-stats">
          ${w.approvalRate!=null?`<span>${tr('approvalRate')}: ${w.approvalRate}%</span>`:''}
          ${w.avgRatingSupervisor?`<span>${ic('star',10)} ${w.avgRatingSupervisor.toFixed(1)}</span>`:''}
        </div>
      </div>`).join('')}
  </div>
</div>`:''}

<!-- FULL TEAM PERFORMANCE TABLE -->
<div class="card">
  <div class="card-head">
    <span class="card-title">${ic('users',16)} ${tr('teamOverview')}</span>
    <span class="badge brand">${metrics.length} ${lang==='ar'?'عامل':'workers'}</span>
  </div>
  <div class="perfTableWrap">
    <table class="perfTable">
      <thead><tr>
        <th>${tr('name')}</th>
        <th>${lang==='ar'?'التقارير (30ي)':'Reports (30d)'}</th>
        <th>${tr('approvalRate')}</th>
        <th>${tr('avgQuality')}</th>
        <th>${tr('ratingBySupervisor')}</th>
        ${canManage()?`<th>${tr('ratingByManager')}</th>`:''}
        <th>${tr('openTasks')}</th>
        <th>${tr('workloadScore')}</th>
        <th>${lang==='ar'?'النقاط':'Score'}</th>
      </tr></thead>
      <tbody>
        ${scored.map((w,rank)=>{
          const rS = w.avgRatingSupervisor;
          const rM = w.avgRatingManager;
          return`<tr>
            <td>
              <div style="display:flex;align-items:center;gap:8px">
                <div style="width:32px;height:32px;border-radius:50%;background:var(--surface-3);display:grid;place-items:center;font-size:var(--fs-xs);font-weight:800;flex-shrink:0;color:var(--brand)">${esc(initials(w.name))}</div>
                <div>
                  <div style="font-weight:700;font-size:var(--fs-sm)">${esc(w.name)}</div>
                  <div style="font-size:var(--fs-xs);color:var(--muted)">${esc(w.username)}</div>
                </div>
              </div>
            </td>
            <td><span style="font-weight:700">${w.reportsLast30}</span>${w.thisMonth?` <span style="font-size:var(--fs-xs);color:var(--muted)">(${w.thisMonth} ${lang==='ar'?'هذا الشهر':'this mo.'})</span>`:''}</td>
            <td>${w.approvalRate!=null?`<span class="badge ${w.approvalRate>=80?'ok':w.approvalRate>=60?'warn':'bad'}">${w.approvalRate}%</span>`:`<span class="badge">${tr('noRating')}</span>`}</td>
            <td>${w.avgQuality?`<span class="badge gold">${w.avgQuality}%</span>`:`—`}</td>
            <td>${rS!=null?`<div style="display:flex;align-items:center;gap:4px">${ic('star',13)} ${rS.toFixed(1)}</div>`:`<span style="color:var(--muted)">${tr('noRating')}</span>`}</td>
            ${canManage()?`<td>${rM!=null?`<div style="display:flex;align-items:center;gap:4px">${ic('star',13)} ${rM.toFixed(1)}</div>`:`<span style="color:var(--muted)">${tr('noRating')}</span>`}</td>`:''}
            <td><span class="badge ${w.openTickets>3?'bad':w.openTickets>1?'warn':'ok'}">${w.openTickets}</span></td>
            <td>
              <div class="progress-track" style="width:80px;display:inline-block">
                <div class="progress-fill ${w.workloadScore>80?'bad':w.workloadScore>40?'gold':'ok'}" style="width:${Math.min(100,w.workloadScore)}%"></div>
              </div>
            </td>
            <td><span style="font-family:var(--font-head);font-weight:800;font-size:var(--fs-sm);color:${rank===0?'var(--gold)':rank<3?'var(--brand-mid)':'var(--ink)'}">${w.weighted}</span></td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>
  </div>
</div>`;
}

async function exportPerformancePDF(){
  let metrics = perfData?.metrics || [];
  if(!metrics.length){
    try{ const r=await api('/performance'); metrics=r.metrics||[]; }catch(e){ return; }
  }
  const scored = metrics.map(w=>({...w,
    weighted:Math.round((w.approvalRate??0)*0.3+(w.avgQuality??0)*0.25+
      ((w.avgRatingSupervisor||0)*20)*0.25+(Math.max(0,100-(w.workloadScore||0)))*0.2)
  })).sort((a,b)=>b.weighted-a.weighted);
  const dir=lang==='ar'?'rtl':'ltr';
  const html=`<!DOCTYPE html><html lang="${lang}" dir="${dir}"><head><meta charset="utf-8">
<title>REGA — ${tr('performance')}</title>
<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Segoe UI',Arial,sans-serif;padding:24px;color:#222;direction:${dir}}
.header{display:flex;justify-content:space-between;margin-bottom:20px;padding-bottom:14px;border-bottom:2px solid #0A4E5B}
.brand{color:#0A4E5B;font-size:20px;font-weight:800}.meta{font-size:11px;color:#666;margin-top:4px}
table{width:100%;border-collapse:collapse;font-size:12px;margin-top:16px}
th{background:#083B46;color:#fff;padding:9px 10px;text-align:${lang==='ar'?'right':'left'};font-weight:700}
td{padding:8px 10px;border-bottom:1px solid #eee;vertical-align:top}
tr:nth-child(even) td{background:#f8f9fa}
.ok{color:#16884D;font-weight:700}.bad{color:#c83232;font-weight:700}.warn{color:#A66200;font-weight:700}
.footer{margin-top:16px;font-size:10px;color:#999;text-align:center}
@media print{body{padding:12px}@page{margin:15mm}}</style></head><body>
<div class="header">
  <div><div class="brand">REGA — ${tr('performance')}</div><div class="meta">${new Date().toISOString().slice(0,10)} · ${lang==='ar'?'آخر 30 يوم':'Last 30 days'}</div></div>
  <div class="meta">${lang==='ar'?'مُصدَّر بواسطة: ':'Exported by: '}${esc(me.name)}</div>
</div>
<table><thead><tr>
  <th>#</th><th>${tr('name')}</th><th>${lang==='ar'?'التقارير':'Reports'}</th>
  <th>${tr('approvalRate')}</th><th>${tr('avgQuality')}</th>
  <th>${tr('ratingBySupervisor')}</th><th>${lang==='ar'?'مهام مفتوحة':'Open Tasks'}</th>
  <th>${lang==='ar'?'النقاط':'Score'}</th>
</tr></thead><tbody>
${scored.map((w,i)=>`<tr>
  <td>${i+1}</td><td>${esc(w.name)}</td><td>${w.reportsLast30}</td>
  <td class="${w.approvalRate>=80?'ok':w.approvalRate>=60?'warn':'bad'}">${w.approvalRate!=null?w.approvalRate+'%':'—'}</td>
  <td>${w.avgQuality?w.avgQuality+'%':'—'}</td>
  <td>${w.avgRatingSupervisor?w.avgRatingSupervisor.toFixed(1):'—'}</td>
  <td>${w.openTickets}</td>
  <td><strong>${w.weighted}</strong></td>
</tr>`).join('')}
</tbody></table>
<div class="footer">REGA Facility Care · ${new Date().toISOString().slice(0,10)}</div>
</body></html>`;
  const w=window.open('','_blank','width=900,height=700');
  w.document.write(html); w.document.close();
  w.addEventListener('load',()=>w.print());
}

/* ═══════════════════════════════════════════════════════════════
   WORKSPACE SELECTOR
   ═══════════════════════════════════════════════════════════════ */
function renderWorkspaceSelector(){
  setDoc();
  const roles = (me.roles||[me.role]);
  app.innerHTML=`<div class="wsSelector">
    <div class="wsCard">
      <div class="wsCard-logo">${ic('layers',32)}</div>
      <h2 class="wsCard-title">${tr('workspaceSelect')}</h2>
      <p class="wsCard-hint">${tr('workspaceHint')}</p>
      <div class="wsGrid">
        ${roles.map(r=>`
          <button class="wsBtn${r===me.role?' active':''}" onclick="switchWorkspace('${r}')">
            <div class="wsBtn-icon">${ic(r==='system_admin'?'shield':r.includes('manager')||r==='facility_manager'?'building':r==='cleaner'?'check':'assignments',22)}</div>
            <div class="wsBtn-label">${roleLabel(r)}</div>
          </button>`).join('')}
      </div>
      <button class="btn secondary" style="margin-top:16px;width:100%" onclick="workspaceSelected=true;sessionStorage.setItem('wsSelected','1');render()">
        ${lang==='ar'?'المتابعة بالصلاحية الحالية':'Continue with current role'} (${roleLabel(me.role)})
      </button>
    </div>
  </div>`;
}

function renderWorkspaceSwitcher(){
  const roles = (me.roles||[me.role]);
  if(roles.length<=1) return;
  const existing=document.getElementById('wsModal');
  if(existing){existing.remove();return;}
  const modal=document.createElement('div');
  modal.id='wsModal';
  modal.className='modal-overlay';
  modal.innerHTML=`<div class="modal-box" style="max-width:380px">
    <div class="modal-header">
      <h3>${tr('switchWorkspace')}</h3>
      <button class="icon-btn" onclick="document.getElementById('wsModal').remove()">${ic('x',18)}</button>
    </div>
    <div class="wsGrid" style="margin-top:12px">
      ${roles.map(r=>`
        <button class="wsBtn${r===me.role?' active':''}" onclick="document.getElementById('wsModal').remove();switchWorkspace('${r}')">
          <div class="wsBtn-icon">${ic(r==='system_admin'?'shield':r.includes('manager')||r==='facility_manager'?'building':r==='cleaner'?'check':'assignments',20)}</div>
          <div class="wsBtn-label">${roleLabel(r)}</div>
        </button>`).join('')}
    </div>
  </div>`;
  modal.addEventListener('click',e=>{if(e.target===modal)modal.remove();});
  document.body.appendChild(modal);
}

/* ═══════════════════════════════════════════════════════════════
   PROFILE CENTER
   ═══════════════════════════════════════════════════════════════ */
function showProfileCenter(){
  document.getElementById('profileModal')?.remove();
  const modal = document.createElement('div');
  modal.id = 'profileModal';
  modal.className = 'modal-overlay';
  const myRoles = me.roles || [me.role];
  modal.innerHTML=`
<div class="modal-box profile-modal">
  <div class="modal-header">
    <div class="modal-title">${ic('user',16)} ${tr('profileCenter')}</div>
    <button class="icon-btn" onclick="document.getElementById('profileModal').remove()">${ic('x',18)}</button>
  </div>

  <!-- Identity -->
  <div class="profile-identity">
    <div class="profile-avatar">${esc(initials(me.name))}</div>
    <div class="profile-info">
      <div class="profile-name">${esc(me.name)}</div>
      <div class="profile-username">@${esc(me.username)}</div>
      ${me.employeeNo?`<div class="profile-empno">${lang==='ar'?'رقم الموظف:':'Emp. No:'} <strong>${esc(me.employeeNo)}</strong></div>`:''}
    </div>
  </div>

  <!-- Roles -->
  <div class="profile-section">
    <div class="profile-section-label">${tr('rolesLabel')}</div>
    <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:6px">
      ${myRoles.map((r,i)=>`<span class="badge ${i===0?'brand':''}">${roleLabel(r)}</span>`).join('')}
    </div>
  </div>

  <!-- Workspaces -->
  ${myRoles.length>1?`
  <div class="profile-section">
    <div class="profile-section-label">${tr('workspacesLabel')}</div>
    <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:6px">
      ${myRoles.map(r=>`
        <button class="wsBtn${r===me.role?' active':''}" style="flex:0 0 auto;min-width:0" onclick="document.getElementById('profileModal').remove();switchWorkspace('${r}')">
          <div class="wsBtn-icon">${ic(r==='system_admin'?'shield':r.includes('manager')||r==='facility_manager'?'building':r==='cleaner'?'check':'assignments',16)}</div>
          <div class="wsBtn-label">${roleLabel(r)}</div>
        </button>`).join('')}
    </div>
  </div>`:''}

  <!-- Last Password Change -->
  ${me.lastPasswordChange?`
  <div class="profile-section">
    <div class="profile-section-label">${tr('lastPwdChange')}</div>
    <div class="profile-value">${fmt(me.lastPasswordChange)}</div>
  </div>`:''}

  <!-- Language -->
  <div class="profile-section">
    <div class="profile-section-label">${lang==='ar'?'اللغة':'Language'}</div>
    <button class="btn secondary sm" style="margin-top:6px" onclick="document.getElementById('profileModal').remove();switchLang()">
      ${lang==='ar'?'التغيير إلى English':'Switch to العربية'}
    </button>
  </div>

  <!-- Change Password -->
  <div class="profile-section">
    <div class="profile-section-label">${tr('changePassword')}</div>
    <div class="formGrid" style="margin-top:8px">
      <div class="field">
        <label>${lang==='ar'?'كلمة المرور الجديدة':'New Password'}</label>
        <input type="password" id="profileNewPwd" class="ltr" placeholder="••••••••" autocomplete="new-password">
      </div>
      <div class="field">
        <label>${lang==='ar'?'تأكيد كلمة المرور':'Confirm Password'}</label>
        <input type="password" id="profileConfirmPwd" class="ltr" placeholder="••••••••" autocomplete="new-password">
      </div>
    </div>
    <div id="profilePwdError" style="color:var(--bad);font-size:var(--fs-xs);min-height:16px;margin-top:2px"></div>
    <button class="btn sm" style="margin-top:8px" onclick="profileChangePassword()">
      ${ic('lock',14)} ${lang==='ar'?'تغيير':'Change'}
    </button>
  </div>

  <div class="modal-footer">
    <button class="btn danger" onclick="logout()">${ic('logout',15)} ${lang==='ar'?'تسجيل الخروج':'Logout'}</button>
    <button class="btn secondary" onclick="document.getElementById('profileModal').remove()">${tr('closeModal')}</button>
  </div>
</div>`;
  modal.addEventListener('click', e=>{ if(e.target===modal) modal.remove(); });
  document.body.appendChild(modal);
}

async function profileChangePassword(){
  const newPwd = document.getElementById('profileNewPwd')?.value || '';
  const confirm = document.getElementById('profileConfirmPwd')?.value || '';
  const errEl = document.getElementById('profilePwdError');
  if(!errEl) return;
  errEl.textContent = '';
  if(newPwd.length < 6){ errEl.textContent = lang==='ar'?'كلمة المرور قصيرة (٦ أحرف على الأقل)':'Password too short (min 6 chars)'; return; }
  if(newPwd !== confirm){ errEl.textContent = lang==='ar'?'كلمتا المرور غير متطابقتين':'Passwords do not match'; return; }
  try{
    await api('/change-password',{method:'POST',body:JSON.stringify({newPassword:newPwd})});
    toast(lang==='ar'?'تم تغيير كلمة المرور بنجاح':'Password changed successfully','ok');
    document.getElementById('profileModal')?.remove();
    await load();
  }catch(e){
    const msg = e.message==='SAME_PASSWORD'
      ? (lang==='ar'?'لا يمكن استخدام كلمة المرور القديمة':'Cannot reuse the old password')
      : (lang==='ar'?'حدث خطأ':'Error');
    if(errEl) errEl.textContent = msg;
  }
}

/* ═══════════════════════════════════════════════════════════════
   AUDIT LOG PAGE
   ═══════════════════════════════════════════════════════════════ */
async function auditLogPage(){
  try{
    const action = document.getElementById('auditFilter')?.value||'';
    const user   = document.getElementById('auditUser')?.value||'';
    const url    = `/audit-logs?limit=200${action?'&action='+encodeURIComponent(action):''}${user?'&user='+encodeURIComponent(user):''}`;
    const res = await api(url);
    const logs = res.logs||[];
    const actionColors={
      login:'ok',logout:'',login_failed:'bad',workspace_switch:'brand',
      user_created:'ok',user_updated:'',user_deleted:'bad',
      ticket_created:'ok',ticket_completed:'ok',ticket_deleted:'bad',
      report_created:'ok',report_reviewed:'brand',report_deleted:'bad',
      order_created:'ok',report_rated:'',
      user_role_added:'ok',user_role_removed:'bad',
      audit_viewed:'',export_reports:''
    };
    return`<div class="pageTitle">${tr('auditLog')}</div>
    <div class="card" style="margin-bottom:12px">
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
        <input id="auditFilter" class="input sm" style="flex:1;min-width:150px"
          placeholder="${lang==='ar'?'فلتر بالإجراء':'Filter by action'}"
          value="${esc(action)}" onkeydown="if(event.key==='Enter')navigateTo('auditlog')">
        <input id="auditUser" class="input sm" style="flex:1;min-width:150px"
          placeholder="${lang==='ar'?'فلتر بالمستخدم':'Filter by user'}"
          value="${esc(user)}" onkeydown="if(event.key==='Enter')navigateTo('auditlog')">
        <button class="btn sm" onclick="navigateTo('auditlog')">${ic('filter',14)} ${lang==='ar'?'تطبيق':'Apply'}</button>
      </div>
    </div>
    <div class="card" style="padding:0;overflow:hidden">
      <div style="overflow-x:auto">
        <table class="auditTable">
          <thead><tr>
            <th>${tr('auditTime')}</th>
            <th>${tr('auditAction')}</th>
            <th>${tr('auditUser')}</th>
            <th>${tr('role')}</th>
            <th>${tr('auditTarget')}</th>
            <th>${tr('auditResult')}</th>
          </tr></thead>
          <tbody>
          ${logs.length?logs.map(l=>{
            const clr=actionColors[l.action]||'';
            let extra='';
            try{ const ex=JSON.parse(l.extra||'{}'); extra=Object.entries(ex).map(([k,v])=>`${k}:${v}`).join(', '); }catch{}
            return`<tr>
              <td class="auditCell-time">${fmt(l.ts)}</td>
              <td><span class="badge ${clr}" style="font-size:10px">${esc(l.action)}</span></td>
              <td>${esc(l.username||'—')}</td>
              <td><span class="badge" style="font-size:10px">${esc(l.role||'—')}</span></td>
              <td style="font-size:var(--fs-xs);color:var(--muted)">${esc(l.target_type?l.target_type+':'+l.target_id:'—')}${extra?` <span style="opacity:.6">(${esc(extra)})</span>`:''}</td>
              <td><span class="badge ${l.result==='success'?'ok':'bad'}" style="font-size:10px">${esc(l.result)}</span></td>
            </tr>`;
          }).join(''):`<tr><td colspan="6" style="text-align:center;padding:24px;color:var(--muted)">${tr('noData')}</td></tr>`}
          </tbody>
        </table>
      </div>
      <div style="padding:10px 16px;font-size:var(--fs-xs);color:var(--muted);border-top:1px solid var(--border)">${lang==='ar'?'إجمالي السجلات':'Total records'}: ${res.total||0}</div>
    </div>`;
  }catch(e){
    return`<div class="card"><div class="empty-state">${ic('shield',28)}<div class="empty-title">${e.message||'Error'}</div></div></div>`;
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

