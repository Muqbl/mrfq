/* ══════════════════════════════════════════════════════════════
   MRFQ FACILITIES — App v16
   Complete Frontend Rebuild — inspired by وفّر design language
   ══════════════════════════════════════════════════════════════ */

/* ─── CONSTANTS ──────────────────────────────────────────────── */
const ROLES = ['system_admin','facility_manager','cleaning_manager','cleaning_supervisor','cleaner','employee','hospitality_manager','hospitality_supervisor','hospitality_worker','maintenance_manager','maintenance_supervisor','maintenance_worker'];
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

const MAINT_TASKS = [
  ['فحص موقع العطل وتأمين منطقة العمل','Inspect the fault and secure the work area'],
  ['تشخيص السبب الجذري','Diagnose the root cause'],
  ['تنفيذ الإصلاح المطلوب','Complete the required repair'],
  ['اختبار التشغيل بعد الإصلاح','Test operation after repair'],
  ['تنظيف الموقع وتوثيق النتيجة','Clean the site and document the result']
];

/* ─── TRANSLATIONS ────────────────────────────────────────────── */
const T = {
  ar:{
    app:'مِرفق',sub:'منصة إدارة المرافق والخدمات التشغيلية',
    loginTitle:'مِرفق',welcomeBack:'مرحباً بعودتك',
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
    cleaning_manager:'مدير النظافة',cleaning_supervisor:'مشرف النظافة',cleaner:'عامل نظافة',
    hospitality_manager:'مدير الضيافة',hospitality_supervisor:'مشرف الضيافة',hospitality_worker:'عامل ضيافة',
    maintenance_manager:'مدير الصيانة',maintenance_supervisor:'مشرف الصيانة',maintenance_worker:'فني صيانة',
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
    reportQuality:'جودة التقرير',filterAll:'الكل',filterNew:'جديد',filterPending:'معلق',filterApproved:'معتمد',
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
    addRole:'إضافة صلاحية',removeRole:'إزالة',rolesLabel:'الصلاحيات',
    complianceRate:'نسبة الالتزام',avgCompletionTime:'متوسط وقت الإنجاز',
    mins:'دقيقة',hours:'ساعة',
    submitted:'تم الإرسال',assigned:'تم التعيين',accepted:'مقبول',
    in_progress:'قيد التنفيذ',waiting_verification:'بانتظار التحقق',
    reclean_required:'إعادة التنظيف مطلوبة',cancelled:'ملغي',
    rolesLabel:'الصلاحيات',workspacesLabel:'مساحات العمل',
    requester:'مقدم الطلب',activeTickets:'البلاغات النشطة',
    closeModal:'إغلاق',activeTicket:'بلاغ نشط',
    systemDashboard:'لوحة النظام',modules:'الأقسام',
    platformTagline:'منصة إدارة المرافق متعددة الأقسام',
    activeModules:'الأقسام النشطة',activeUsers:'مستخدمون نشطون',
    criticalTickets:'بلاغات حرجة',lastActivity:'آخر نشاط',
    systemHealth:'حالة النظام',apiStatus:'حالة API',dbStatus:'حالة قاعدة البيانات',
    connected:'متصل',comingSoon:'قريباً',
    plannedNote:'هذا القسم ضمن الخطة القادمة',openModule:'فتح',
    rolesPermissions:'الأدوار والصلاحيات',assets:'الأصول',maps:'الخرائط',
    generalReports:'التقارير العامة',auditLog:'سجل التدقيق',noAuditData:'لا توجد بيانات بعد',
    globalSettings:'الإعدادات العامة',backToConsole:'العودة إلى لوحة النظام',
    cleaningModuleLabel:'وحدة النظافة',hospitalityModuleLabel:'وحدة الضيافة',
    maintenance:'الصيانة',hospitality:'الضيافة',security:'الأمن',
    safety:'السلامة',customerService:'خدمة الزوار',
    maintenanceModuleLabel:'وحدة الصيانة',
    electrical:'كهرباء',plumbing:'سباكة',hvac:'تكييف',civil:'أعمال مدنية',general:'عام',
    maintTicketCreate:'إنشاء طلب صيانة',maintTicketList:'الطلبات',
    maintReportCreate:'إنشاء تقرير صيانة',maintReportList:'التقارير',
    maintTeam:'فريق الصيانة',maintSettings:'إعدادات SLA الصيانة',
    maintWorker:'فني',maintSupervisor:'مشرف الصيانة',maintManager:'مدير الصيانة',
    redo_required:'إعادة العمل',
    maintOrders:'أوامر العمل',maintSchedules:'الصيانة الدورية',maintAssets:'الأصول والمعدات',
    maintParts:'قطع الغيار',maintMyTasks:'مهامي',maintTeamTasks:'مهام الفريق',maintUpcoming:'القادمة',maintHistory:'السجل',
    corrective:'تصحيحية',preventive:'وقائية دورية',emergency_maintenance:'طارئة',
    diagnosing:'قيد التشخيص',awaiting_parts:'بانتظار قطع غيار',awaiting_vendor:'بانتظار مورد',
    awaiting_permit:'بانتظار تصريح',on_hold:'متوقف مؤقتاً',leadTechnician:'قائد الفريق',
    moduleStatusActive:'نشط',moduleStatusPlanned:'مخطط',
    systemAdminConsole:'لوحة النظام',
    cleaningTeam:'فريق النظافة',facilityConsole:'لوحة مدير المرافق',
    moduleStatusInProgress:'قيد التطوير',
    orderType:'نوع الطلب',
    ot_coffee:'قهوة',ot_tea:'شاي',ot_water:'مياه',ot_snacks:'وجبات خفيفة',
    ot_meeting_service:'خدمة قاعة اجتماعات',ot_other:'أخرى',
    hospitalityWorkerTitle:'طلبات الضيافة',hospitalityWorkerDesc:'الطلبات المسندة إليك',
    noAssignedHospOrders:'لا توجد طلبات مسندة حالياً',
    startPreparing:'بدء التحضير',markReady:'جاهز',
    outForDelivery:'خروج للتوصيل',markDelivered:'تم التسليم',
    hospitalityPlaceholderTitle:'الضيافة',
    hospitalityPlaceholderDesc:'لوحة هذا الدور قيد التطوير في المرحلة القادمة',
    invalidTransitionMsg:'لا يمكن تنفيذ هذا الإجراء الآن',

    /* Phase 4c — admin password reset */
    resetPassword:'إعادة تعيين كلمة المرور',
    newPassword:'كلمة المرور الجديدة',confirmPassword:'تأكيد كلمة المرور',
    passwordMismatch:'كلمتا المرور غير متطابقتين',
    passwordResetSuccess:'تم تغيير كلمة المرور بنجاح',
    weakPasswordMsg:'كلمة المرور قصيرة جداً (8 أحرف على الأقل)',

    /* Phase 4c — hospitality supervisor / manager */
    hospSupervisorTitle:'مشرف الضيافة',hospManagerTitle:'مدير الضيافة',
    hospDashboardTab:'الرئيسية',hospOrdersTab:'الطلبات',hospTeamTab:'الفريق',hospReportsTab:'التقارير',
    newOrders:'طلبات جديدة',acceptedOrdersLabel:'مقبولة',preparingOrdersLabel:'قيد التحضير',
    readyOrdersLabel:'جاهزة',outForDeliveryLabel:'في الطريق',deliveredOrdersLabel:'تم التسليم',
    overdueOrdersLabel:'متأخرة',allOrdersLabel:'كل الطلبات',
    acceptOrder:'قبول',rejectOrder:'رفض',completeOrder:'إكمال الطلب',
    assignToWorker:'تعيين عامل',chooseWorker:'اختر عامل...',assign:'تعيين',
    noNewOrders:'لا توجد طلبات جديدة',noOverdueOrders:'لا توجد طلبات متأخرة',
    noUnassignedOrders:'لا توجد طلبات بانتظار التعيين',noOrdersAtAll:'لا توجد طلبات حالياً',
    kpiTodayOrders:'طلبات اليوم',kpiOpenOrders:'الطلبات المفتوحة',
    kpiCompletedOrders:'الطلبات المكتملة',kpiOverdueOrders:'الطلبات المتأخرة',
    kpiSlaCompliance:'الالتزام بـ SLA',kpiAvgCompletion:'متوسط وقت الإنجاز',
    ordersByStatusTitle:'الطلبات حسب الحالة',workerPerformanceTitle:'أداء العاملين',
    noPerformanceData:'لا توجد بيانات أداء حتى الآن',
    assignedCountLabel:'مسندة',completedCountLabel:'مكتملة',openCountLabel:'مفتوحة',
    filterByStatus:'تصفية حسب الحالة',filterByLocation:'تصفية حسب الموقع',
    allStatuses:'كل الحالات',allLocations:'كل المواقع',
    requesterLabel:'مقدم الطلب',phoneLabel:'الجوال',
    availableWorkers:'العاملون المتاحون',noWorkersAvailable:'لا يوجد عاملون متاحون',

    /* Phase 4c — standalone hospitality request page */
    publicOrderTitle:'طلب ضيافة',publicOrderSub:'خدمة سريعة بدون تسجيل دخول',
    requesterNameLabel:'الاسم',requesterPhoneLabel:'رقم الجوال',
    continueBtn:'متابعة',
    publicOrderFormTitle:'تفاصيل الطلب',locationLabel:'الموقع',
    sendOrder:'إرسال الطلب',orderSentTitle:'تم إرسال طلبك',
    orderSentDesc:'سيتم التواصل معك عند تحديث حالة الطلب',
    myOrdersTitle:'طلباتي',trackByPhone:'تابع طلباتك برقم الجوال',
    searchBtn:'بحث',noOrdersFound:'لا توجد طلبات لهذا الرقم',
    newRequestBtn:'طلب جديد',publicNameRequired:'يرجى إدخال الاسم ورقم الجوال',
    publicInvalidPhone:'رقم الجوال غير صحيح، يرجى التحقق منه',
    publicLocationUnavailable:'الموقع المحدد غير متاح، يرجى اختيار موقع آخر',
    publicKitchenUnavailable:'المطبخ المحدد غير متاح، يرجى اختيار مطبخ آخر',
    publicOrderErrorGeneric:'حدث خطأ أثناء إرسال الطلب، حاول مرة أخرى',
    publicMyInfoTab:'معلوماتي',publicInfoSaved:'تم حفظ معلوماتك',

    /* Phase 4d — hospitality menu / coffee ordering */
    mcat_all:'الكل',mcat_hot_drinks:'مشروبات ساخنة',mcat_cold_drinks:'مشروبات باردة',
    mcat_snacks:'وجبات خفيفة',mcat_other:'أخرى',
    browseMenuTitle:'القائمة',cartTitle:'السلة',cartEmpty:'السلة فارغة، اختر من القائمة',
    itemsInCart:'عناصر في السلة',checkoutBtn:'إتمام الطلب',backToMenu:'رجوع للقائمة',
    orderSummaryTitle:'ملخص الطلب',noMenuItems:'لا توجد عناصر متاحة حالياً',
    qtyLabel:'الكمية',ot_menu:'طلب من القائمة',
    productsTitle:'المنتجات',addProduct:'إضافة منتج',editProduct:'تعديل المنتج',
    productNameAr:'الاسم (عربي)',productNameEn:'الاسم (إنجليزي)',
    productDescAr:'الوصف (عربي)',productDescEn:'الوصف (إنجليزي)',
    productCategory:'الفئة',productImage:'صورة المنتج',
    productActive:'مفعل',productInactive:'معطل',productSortOrder:'ترتيب العرض',
    uploadImage:'رفع صورة',removeImage:'إزالة الصورة',noProducts:'لا توجد منتجات بعد',
    deactivateProduct:'تعطيل',activateProduct:'تفعيل',saveProduct:'حفظ المنتج',
    selectLocationToOrder:'يرجى اختيار الموقع لإتمام الطلب',

    /* Phase 4d (v2) — kitchens / direct assignment */
    kitchenLabel:'المطبخ',selectKitchenToOrder:'يرجى اختيار المطبخ لإتمام الطلب',
    noKitchensAvailable:'لا توجد مطابخ متاحة حالياً',orderedFromKitchen:'من مطبخ',
    kitchensTitle:'المطابخ',addKitchen:'إضافة مطبخ',editKitchen:'تعديل المطبخ',
    kitchenNameAr:'اسم المطبخ (عربي)',kitchenNameEn:'اسم المطبخ (إنجليزي)',
    kitchenLocationName:'الموقع',kitchenResponsibleWorker:'العامل المسؤول',
    kitchenNoWorker:'بدون عامل مسؤول',kitchenActive:'مفعل',kitchenInactive:'معطل',
    deactivateKitchen:'تعطيل',activateKitchen:'تفعيل',saveKitchen:'حفظ المطبخ',
    noKitchens:'لا توجد مطابخ بعد',kitchenNoWorkerWarning:'لا يوجد عامل مسؤول عن هذا المطبخ',
    kitchenSortOrder:'ترتيب العرض',

    /* Phase 4d (v2) — requester info persistence / My Orders details */
    itemsLabel:'الأصناف',lastUpdated:'آخر تحديث',editInfoBtn:'تعديل البيانات',

    /* Phase 4e — menu category management */
    categoriesTitle:'فئات المنتجات',addCategory:'إضافة فئة',editCategory:'تعديل الفئة',
    categoryNameAr:'الاسم (عربي)',categoryNameEn:'الاسم (إنجليزي)',categorySlug:'الرمز (slug)',
    categorySortOrder:'ترتيب العرض',categoryActive:'مفعلة',categoryInactive:'معطلة',
    deactivateCategory:'تعطيل',activateCategory:'تفعيل',saveCategory:'حفظ الفئة',
    noCategories:'لا توجد فئات بعد',categorySlugHint:'حروف إنجليزية صغيرة وأرقام و _ فقط',

    /* Phase 4e — order assignment / reassignment */
    reassignOrderBtn:'إعادة تعيين',assignedToLabel:'مسند إلى',pendingAssignmentBadge:'غير مسند',
    assignOrderModalTitle:'تعيين الطلب',selectWorkerLabel:'اختر عامل الضيافة',
  },
  en:{
    app:'MRFQ',sub:'Facilities Management & Operations Platform',
    loginTitle:'MRFQ',welcomeBack:'Welcome Back',
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
    hospitality_manager:'Hospitality Manager',hospitality_supervisor:'Hospitality Supervisor',hospitality_worker:'Hospitality Worker',
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
    reportQuality:'Report Quality',filterAll:'All',filterNew:'New',filterPending:'Pending',filterApproved:'Approved',
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
    addRole:'Add Role',removeRole:'Remove',rolesLabel:'Roles',
    complianceRate:'Compliance Rate',avgCompletionTime:'Avg Completion Time',
    mins:'min',hours:'hr',
    submitted:'Submitted',assigned:'Assigned',accepted:'Accepted',
    in_progress:'In Progress',waiting_verification:'Awaiting Verification',
    reclean_required:'Re-clean Required',cancelled:'Cancelled',
    rolesLabel:'Roles',workspacesLabel:'Workspaces',
    requester:'Requester',activeTickets:'Active Tickets',
    closeModal:'Close',activeTicket:'Active ticket',
    systemDashboard:'System Dashboard',modules:'Modules',
    platformTagline:'Multi-department facilities management platform',
    activeModules:'Active Modules',activeUsers:'Active Users',
    criticalTickets:'Critical Tickets',lastActivity:'Last Activity',
    systemHealth:'System Health',apiStatus:'API Status',dbStatus:'Database Status',
    connected:'Connected',comingSoon:'Coming Soon',
    plannedNote:'This module is part of the upcoming roadmap',openModule:'Open',
    rolesPermissions:'Roles & Permissions',assets:'Assets',maps:'Maps',
    generalReports:'General Reports',auditLog:'Audit Log',noAuditData:'No data yet',
    globalSettings:'Global Settings',backToConsole:'Back to Admin Console',
    cleaningModuleLabel:'Cleaning Module',hospitalityModuleLabel:'Hospitality Module',
    maintenance:'Maintenance',hospitality:'Hospitality',security:'Security',
    safety:'Safety',customerService:'Visitor Services',
    maintenanceModuleLabel:'Maintenance Module',
    electrical:'Electrical',plumbing:'Plumbing',hvac:'HVAC',civil:'Civil Works',general:'General',
    maintTicketCreate:'New Maintenance Ticket',maintTicketList:'Tickets',
    maintReportCreate:'New Maintenance Report',maintReportList:'Reports',
    maintTeam:'Maintenance Team',maintSettings:'Maintenance SLA',
    maintWorker:'Technician',maintSupervisor:'Maintenance Supervisor',maintManager:'Maintenance Manager',
    redo_required:'Redo Required',
    maintOrders:'Work Orders',maintSchedules:'Preventive Maintenance',maintAssets:'Assets & Equipment',
    maintParts:'Spare Parts',maintMyTasks:'My Tasks',maintTeamTasks:'Team Tasks',maintUpcoming:'Upcoming',maintHistory:'History',
    corrective:'Corrective',preventive:'Preventive',emergency_maintenance:'Emergency',
    diagnosing:'Diagnosing',awaiting_parts:'Awaiting Parts',awaiting_vendor:'Awaiting Vendor',
    awaiting_permit:'Awaiting Permit',on_hold:'On Hold',leadTechnician:'Team Lead',
    moduleStatusActive:'Active',moduleStatusPlanned:'Planned',
    systemAdminConsole:'System Console',
    cleaningTeam:'Cleaning Team',facilityConsole:'Facility Manager Console',
    moduleStatusInProgress:'In Progress',
    orderType:'Order Type',
    ot_coffee:'Coffee',ot_tea:'Tea',ot_water:'Water',ot_snacks:'Snacks',
    ot_meeting_service:'Meeting Room Service',ot_other:'Other',
    hospitalityWorkerTitle:'Hospitality Orders',hospitalityWorkerDesc:'Orders assigned to you',
    noAssignedHospOrders:'No orders assigned yet',
    startPreparing:'Start Preparing',markReady:'Mark Ready',
    outForDelivery:'Out for Delivery',markDelivered:'Mark Delivered',
    hospitalityPlaceholderTitle:'Hospitality',
    hospitalityPlaceholderDesc:'This role dashboard is in progress for an upcoming phase',
    invalidTransitionMsg:'This action cannot be performed right now',

    /* Phase 4c — admin password reset */
    resetPassword:'Reset Password',
    newPassword:'New Password',confirmPassword:'Confirm Password',
    passwordMismatch:'Passwords do not match',
    passwordResetSuccess:'Password changed successfully',
    weakPasswordMsg:'Password too short (min 8 characters)',

    /* Phase 4c — hospitality supervisor / manager */
    hospSupervisorTitle:'Hospitality Supervisor',hospManagerTitle:'Hospitality Manager',
    hospDashboardTab:'Dashboard',hospOrdersTab:'Orders',hospTeamTab:'Team',hospReportsTab:'Reports',
    newOrders:'New Orders',acceptedOrdersLabel:'Accepted',preparingOrdersLabel:'Preparing',
    readyOrdersLabel:'Ready',outForDeliveryLabel:'Out for Delivery',deliveredOrdersLabel:'Delivered',
    overdueOrdersLabel:'Overdue',allOrdersLabel:'All Orders',
    acceptOrder:'Accept',rejectOrder:'Reject',completeOrder:'Complete Order',
    assignToWorker:'Assign Worker',chooseWorker:'Choose worker...',assign:'Assign',
    noNewOrders:'No new orders',noOverdueOrders:'No overdue orders',
    noUnassignedOrders:'No orders awaiting assignment',noOrdersAtAll:'No orders yet',
    kpiTodayOrders:"Today's Orders",kpiOpenOrders:'Open Orders',
    kpiCompletedOrders:'Completed Orders',kpiOverdueOrders:'Overdue Orders',
    kpiSlaCompliance:'SLA Compliance',kpiAvgCompletion:'Avg Completion Time',
    ordersByStatusTitle:'Orders by Status',workerPerformanceTitle:'Worker Performance',
    noPerformanceData:'No performance data yet',
    assignedCountLabel:'Assigned',completedCountLabel:'Completed',openCountLabel:'Open',
    filterByStatus:'Filter by status',filterByLocation:'Filter by location',
    allStatuses:'All Statuses',allLocations:'All Locations',
    requesterLabel:'Requester',phoneLabel:'Phone',
    availableWorkers:'Available Workers',noWorkersAvailable:'No workers available',

    /* Phase 4c — standalone hospitality request page */
    publicOrderTitle:'Hospitality Request',publicOrderSub:'Quick service — no login required',
    requesterNameLabel:'Name',requesterPhoneLabel:'Phone Number',
    continueBtn:'Continue',
    publicOrderFormTitle:'Order Details',locationLabel:'Location',
    sendOrder:'Send Request',orderSentTitle:'Your request has been sent',
    orderSentDesc:'We will follow up as the order status changes',
    myOrdersTitle:'My Orders',trackByPhone:'Track your orders by phone number',
    searchBtn:'Search',noOrdersFound:'No orders found for this number',
    newRequestBtn:'New Request',publicNameRequired:'Please enter your name and phone number',
    publicInvalidPhone:'Phone number is invalid, please check it',
    publicLocationUnavailable:'The selected location is unavailable, please choose another',
    publicKitchenUnavailable:'The selected kitchen is unavailable, please choose another',
    publicOrderErrorGeneric:'Something went wrong while sending your request, please try again',
    publicMyInfoTab:'My Info',publicInfoSaved:'Your info has been saved',

    /* Phase 4d — hospitality menu / coffee ordering */
    mcat_all:'All',mcat_hot_drinks:'Hot Drinks',mcat_cold_drinks:'Cold Drinks',
    mcat_snacks:'Snacks',mcat_other:'Other',
    browseMenuTitle:'Menu',cartTitle:'Cart',cartEmpty:'Your cart is empty, pick items from the menu',
    itemsInCart:'items in cart',checkoutBtn:'Checkout',backToMenu:'Back to Menu',
    orderSummaryTitle:'Order Summary',noMenuItems:'No items available right now',
    qtyLabel:'Quantity',ot_menu:'Menu Order',
    productsTitle:'Products',addProduct:'Add Product',editProduct:'Edit Product',
    productNameAr:'Name (Arabic)',productNameEn:'Name (English)',
    productDescAr:'Description (Arabic)',productDescEn:'Description (English)',
    productCategory:'Category',productImage:'Product Image',
    productActive:'Active',productInactive:'Inactive',productSortOrder:'Sort Order',
    uploadImage:'Upload Image',removeImage:'Remove Image',noProducts:'No products yet',
    deactivateProduct:'Deactivate',activateProduct:'Activate',saveProduct:'Save Product',
    selectLocationToOrder:'Please select a location to place the order',

    /* Phase 4d (v2) — kitchens / direct assignment */
    kitchenLabel:'Kitchen',selectKitchenToOrder:'Please select a kitchen to place the order',
    noKitchensAvailable:'No active kitchens available right now',orderedFromKitchen:'from kitchen',
    kitchensTitle:'Kitchens',addKitchen:'Add Kitchen',editKitchen:'Edit Kitchen',
    kitchenNameAr:'Kitchen Name (Arabic)',kitchenNameEn:'Kitchen Name (English)',
    kitchenLocationName:'Location',kitchenResponsibleWorker:'Responsible Worker',
    kitchenNoWorker:'No responsible worker',kitchenActive:'Active',kitchenInactive:'Inactive',
    deactivateKitchen:'Deactivate',activateKitchen:'Activate',saveKitchen:'Save Kitchen',
    noKitchens:'No kitchens yet',kitchenNoWorkerWarning:'This kitchen has no responsible worker',
    kitchenSortOrder:'Sort Order',

    /* Phase 4d (v2) — requester info persistence / My Orders details */
    itemsLabel:'Items',lastUpdated:'Last Updated',editInfoBtn:'Edit Info',

    /* Phase 4e — menu category management */
    categoriesTitle:'Categories',addCategory:'Add Category',editCategory:'Edit Category',
    categoryNameAr:'Name (Arabic)',categoryNameEn:'Name (English)',categorySlug:'Slug',
    categorySortOrder:'Sort Order',categoryActive:'Active',categoryInactive:'Inactive',
    deactivateCategory:'Deactivate',activateCategory:'Activate',saveCategory:'Save Category',
    noCategories:'No categories yet',categorySlugHint:'Lowercase letters, numbers and _ only',

    /* Phase 4e — order assignment / reassignment */
    reassignOrderBtn:'Reassign',assignedToLabel:'Assigned to',pendingAssignmentBadge:'Unassigned',
    assignOrderModalTitle:'Assign Order',selectWorkerLabel:'Select hospitality worker',
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
  language:`<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
  search:`<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  sync:`<svg viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>`,
  check:`<svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>`,
  x:`<svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  camera:`<svg viewBox="0 0 24 24"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>`,
  qr:`<svg viewBox="0 0 24 24"><rect x="3" y="3" width="5" height="5" rx=".5"/><rect x="16" y="3" width="5" height="5" rx=".5"/><rect x="3" y="16" width="5" height="5" rx=".5"/><path d="M21 16h-3v3"/><path d="M21 21v-3"/><path d="M16 21h-3v-3"/><path d="M13 16v-3h3"/><path d="M8 3H3v5"/><path d="M3 8v5h5"/></svg>`,
  logout:`<svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
  arrow:`<svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>`,
  'arrow-left':`<svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>`,
  edit:`<svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  trash:`<svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>`,
  plus:`<svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  minus:`<svg viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  'shopping-cart':`<svg viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>`,
  image:`<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>`,
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
  clipboardList:`<svg viewBox="0 0 24 24"><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M8 11h8"/><path d="M8 15h8"/><path d="M8 19h5"/></svg>`,
  menu:`<svg viewBox="0 0 24 24"><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/></svg>`,
  'clock':`<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  shield:`<svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  layers:`<svg viewBox="0 0 24 24"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>`,
  filter:`<svg viewBox="0 0 24 24"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>`,
  'alert-triangle':`<svg viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  chevron:`<svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>`,
  lock:`<svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
  settings:`<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
  tool:`<svg viewBox="0 0 24 24"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94L5.41 21.41a2 2 0 0 1-2.83-2.83L10.66 10.5a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
  coffee:`<svg viewBox="0 0 24 24"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>`,
  truck:`<svg viewBox="0 0 24 24"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>`,
  refresh:`<svg viewBox="0 0 24 24"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>`,
  alert:`<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  circle:`<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>`,
  chat:`<svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
  download:`<svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
  'alert-red':`<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  map:`<svg viewBox="0 0 24 24"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>`,
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
let resetPasswordUserId = null;
let reportFilter = 'all';
let usersSearch = '', usersRoleFilter = 'all', usersStatusFilter = 'all';
let locsFloorFilter = 'all';
let assignFloorFilter = 'all';
let showTicketCreate = false, showLocCreate = false, showZoneCreate = false;
let mobileNavActive = '';
let viewHistory = [];
let eventSource = null;
let forcePasswordChange = false;
let employeeView = 'home';
let workerView = 'task';
let supervisorView = 'dashboard';
let hospSupervisorView = 'dashboard';
let hospManagerView = 'dashboard';
let hospPerfData = null;
let _hospPerfLoading = false;
let hospReportStatusFilter = 'all';
let hospReportLocationFilter = 'all';
let hospMenuItems = null; // cached menu/products list (admin & hospitality_manager)
let editMenuItemId = null;
let editMenuItemImageData = null; // pending data URL for new/replace image
let editMenuItemImageRemoved = false;
let hospKitchens = null; // cached kitchens list (admin & hospitality_manager)
let editKitchenId = null;
let hospMenuCategories = null; // cached menu categories list (admin & hospitality_manager)
let editMenuCategoryId = null;
let adminView = 'dashboard';
let adminModuleContext = null; // null | 'cleaning'
let perfData = null; // cached performance data
let workspaceSelected = false; // true after user picks workspace this session

/* ─── PLATFORM MODULES (system admin "Modules" overview) ───────── */
const MODULES = [
  {key:'cleaning', icon:'reports', status:'active',
    nameAr:'النظافة', nameEn:'Cleaning',
    descAr:'إدارة بلاغات النظافة والعمال والتقارير ومؤشرات الأداء',
    descEn:'Manage cleaning tickets, workers, reports and performance'},
  {key:'maintenance', icon:'tool', status:'active',
    nameAr:'الصيانة', nameEn:'Maintenance',
    descAr:'صيانة المرافق والأجهزة', descEn:'Facilities and equipment maintenance'},
  {key:'hospitality', icon:'coffee', status:'active',
    nameAr:'الضيافة', nameEn:'Hospitality',
    descAr:'طلب ضيافة عام من قائمة المشروبات والوجبات مع توجيه تلقائي للمطبخ المسؤول ولوحات المشرف والمدير',
    descEn:'Public coffee/snack menu ordering with kitchen-based direct assignment, plus supervisor and manager dashboards'},
  {key:'security', icon:'shield', status:'planned',
    nameAr:'الأمن', nameEn:'Security',
    descAr:'إدارة الأمن والمراقبة', descEn:'Security and surveillance management'},
  {key:'safety', icon:'alert-triangle', status:'planned',
    nameAr:'السلامة', nameEn:'Safety',
    descAr:'إدارة السلامة والطوارئ', descEn:'Safety and emergency management'},
  {key:'customer_service', icon:'send', status:'planned',
    nameAr:'خدمة الزوار', nameEn:'Visitor Services',
    descAr:'طلبات وملاحظات المستخدمين', descEn:'User requests and feedback'}
];

/* ─── HOSPITALITY MODULE — order types & status labels ─────────── */

const HOSPITALITY_STATUSES_ORDER = ['submitted','accepted','preparing','ready','out_for_delivery','delivered','completed','cancelled','rejected'];

const HOSPITALITY_STATUS_LABELS = {
  ar:{submitted:'جديد',accepted:'مقبول',preparing:'قيد التحضير',ready:'جاهز',
      out_for_delivery:'في الطريق',delivered:'تم التسليم',completed:'مكتمل',
      cancelled:'ملغي',rejected:'مرفوض'},
  en:{submitted:'New',accepted:'Accepted',preparing:'Preparing',ready:'Ready',
      out_for_delivery:'Out for Delivery',delivered:'Delivered',completed:'Completed',
      cancelled:'Cancelled',rejected:'Rejected'}
};
const hospStatusLabel = s => (HOSPITALITY_STATUS_LABELS[lang]&&HOSPITALITY_STATUS_LABELS[lang][s]) || s;
const hospStatusBadgeClass = s =>
  s==='completed' ? 'ok'
  : ['cancelled','rejected'].includes(s) ? 'bad'
  : ['delivered','out_for_delivery','ready'].includes(s) ? 'warn'
  : 'brand';

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
function currentMonthLabel(lang){
  const now = new Date();
  return now.toLocaleDateString(lang==='ar' ? 'ar' : 'en-US', { month: 'long', year: 'numeric' });
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
const offlineKey = 'mrfq_offline_v16';

/* ─── OFFLINE QUEUE ──────────────────────────────────────────── */
function getQ(){try{return JSON.parse(localStorage.getItem(offlineKey)||'[]')}catch(e){return[]}}
function setQ(q){localStorage.setItem(offlineKey,JSON.stringify(q))}

/* ─── API ────────────────────────────────────────────────────── */
async function api(path,opt={}){
  const cleanPath = String(path||'').replace(/^\/?api\/?/, '/');
  const r = await fetch('/api'+cleanPath,{
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
    try{await api(isMaintenanceRole()?'/maintenance-reports':'/reports',{method:'POST',body:JSON.stringify(item)})}
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
  eventSource.addEventListener('ticket_waiting_verification',e=>{
    playSound('approved');
    toast(lang==='ar'?'بلاغ بانتظار التحقق':'Ticket awaiting verification','ok');
    load();
  });
  eventSource.addEventListener('hospitality_order_created',e=>{
    const d=JSON.parse(e.data);
    if(['hospitality_supervisor','hospitality_manager','system_admin','facility_manager'].includes(me.role)){
      playSound('new_ticket');
      toast(lang==='ar'?'طلب ضيافة جديد: '+(d.order.referenceNo||''):'New hospitality order: '+(d.order.referenceNo||''),'warn');
    }
    load();
  });
  eventSource.addEventListener('hospitality_order_updated',e=>{
    const d=JSON.parse(e.data);
    if(me.role==='hospitality_worker' && d.order.assignedTo===me.id ||
       me.role==='employee' && d.order.requestedById===me.id){
      playSound('new_report');
      toast(lang==='ar'?'تحديث طلب الضيافة: '+hospStatusLabel(d.order.status):'Hospitality order updated: '+hospStatusLabel(d.order.status),'ok');
    }
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
  mobileNavActive = v;
  view=v; render();
}
function goBack(){
  if(viewHistory.length){ view=viewHistory.pop(); render(); }
}
function appHasBackTarget(){
  if(!me) return false;
  if(['cleaning_supervisor','maintenance_supervisor'].includes(me.role)) return supervisorView!=='dashboard';
  if(me.role==='maintenance_worker') return maintWorkerView!=='tasks';
  if(me.role==='cleaner'){
    const form=document.getElementById('workerForm');
    return !!(form&&form.innerHTML.trim()) || workerView!=='task';
  }
  if(me.role==='employee') return employeeView!=='home';
  return viewHistory.length>0 || view!=='dashboard';
}
function appBack(){
  if(!me) return history.back();
  if(['cleaning_supervisor','maintenance_supervisor'].includes(me.role)){
    if(supervisorView!=='dashboard'){
      supervisorView='dashboard';
      mobileNavActive='supervisor-dashboard';
      isMaintenanceRole()?renderMaintenanceSupervisor():renderSupervisor();
      return;
    }
  }else if(me.role==='maintenance_worker'){
    if(maintWorkerView!=='tasks'){
      maintWorkerView='tasks';
      mobileNavActive='maint-worker-tasks';
      renderMaintenanceWorker();
      return;
    }
  }else if(me.role==='cleaner'){
    const form=document.getElementById('workerForm');
    if(form&&form.innerHTML.trim()){
      workerGoBack();
      return;
    }
    if(workerView!=='task'){
      workerView='task';
      mobileNavActive='worker-task';
      isMaintenanceRole()?renderMaintenanceWorker():renderWorker();
      return;
    }
  }else if(me.role==='employee'){
    if(employeeView!=='home'){
      employeeView='home';
      mobileNavActive='employee-home';
      renderEmployee();
      return;
    }
  }else if(viewHistory.length){
    goBack();
    return;
  }else if(view!=='dashboard'){
    view='dashboard';
    mobileNavActive='dashboard';
    render();
    return;
  }
  history.back();
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
    if(me.roles && me.roles.length > 1 && sessionStorage.getItem('wsSelected')) workspaceSelected=true;
    render(); connectSSE();
    requestBrowserNotif();
    checkNewBreaches();
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
  adminModuleContext=null;adminView='dashboard';
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
function isMaintenanceRole(role=me?.role){return String(role||'').startsWith('maintenance_') || adminModuleContext==='maintenance'}
function maintenanceTicketApi(suffix=''){return `${isMaintenanceRole()?'/maintenance-tickets':'/tickets'}${suffix}`}
function maintenanceReportApi(suffix=''){return `${isMaintenanceRole()?'/maintenance-reports':'/reports'}${suffix}`}
function operationalWorkerRole(){return isMaintenanceRole()?'maintenance_worker':'cleaner'}
function canUsers(){return ['system_admin','cleaning_manager','maintenance_manager'].includes(me.role)}
function canManageUsers(){return ['system_admin','cleaning_manager','maintenance_manager'].includes(me.role)}
function canManage(){return ['system_admin','facility_manager','cleaning_manager','maintenance_manager'].includes(me.role)}
function canTicket(){return ['system_admin','facility_manager','cleaning_manager','cleaning_supervisor','maintenance_manager','maintenance_supervisor'].includes(me.role)}
function canReview(){return ['system_admin','facility_manager','cleaning_manager','cleaning_supervisor','maintenance_manager','maintenance_supervisor'].includes(me.role)}
function canAccessPlatformConsole(){return ['system_admin','facility_manager'].includes(me.role)}
function canAccessGlobalSettings(){return me.role==='system_admin'}
function canAccessRolesPermissions(){return me.role==='system_admin'}
function canManageGlobalUsers(){return me.role==='system_admin'}
function canViewCleaningTeam(){return me.role==='cleaning_manager'}
function canManageHospitalityMenu(){return ['system_admin','hospitality_manager'].includes(me.role)}
function canHospitalityAssign(){return ['system_admin','facility_manager','hospitality_manager','hospitality_supervisor'].includes(me.role)}
function locName(l){return lang==='ar'?(l.nameAr||l.nameEn):(l.nameEn||l.nameAr)}

function roleBadgeClass(role){
  return {system_admin:'role-admin',facility_manager:'role-fm',cleaning_manager:'role-cleaning-manager',cleaning_supervisor:'role-cs',cleaner:'role-cleaner',hospitality_manager:'role-cleaning-manager',hospitality_supervisor:'role-cs',hospitality_worker:'role-cleaner',maintenance_manager:'role-cleaning-manager',maintenance_supervisor:'role-cs',maintenance_worker:'role-cleaner'}[role]||'';
}


function activityFeed(limit=8){
  // Combine recent reports and tickets into a unified activity feed
  const items = [
    ...(data.reports||[]).slice(0,limit).map(r=>({type:'report',time:r.createdAt,label:locName((data.locations||[]).find(l=>l.id===r.locationId)||{})||r.locationNameAr||r.locationNameEn,sub:esc(r.workerName),st:r.approvalStatus||'pending_approval'})),
    ...(data.tickets||[]).slice(0,limit).map(t=>({type:'ticket',time:t.createdAt,label:esc(t.title),sub:esc(lang==='ar'?t.locationNameAr:t.locationNameEn),st:t.status}))
  ].sort((a,b)=>new Date(b.time)-new Date(a.time)).slice(0,limit);

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

/* ═══════════════════════════════════════════════════════════════
   SHARED UI HELPERS — Form controls, Modal, Topbar, Shell
   ═══════════════════════════════════════════════════════════════ */

/* ── field container ───────────────────────────────────────── */
function fc(label, controlHtml, opts={}){
  return `<div class="field${opts.cls?' '+opts.cls:''}">${label?`<label>${label}</label>`:''}${controlHtml}</div>`;
}

/* ── text / password / search input ────────────────────────── */
function inp(id, opts={}){
  const type = opts.type||'text';
  const classes=['ctrl', opts.cls||''].filter(Boolean).join(' ');
  const val = opts.value!==undefined?` value="${esc(String(opts.value))}"`:'' ;
  const ph  = opts.placeholder?` placeholder="${esc(opts.placeholder)}"`:'' ;
  const ac  = opts.autocomplete?` autocomplete="${opts.autocomplete}"`:'' ;
  const ro  = opts.readonly?' readonly':'' ;
  const ev  = opts.oninput?` oninput="${opts.oninput}"`:'' ;
  const ev2 = opts.onchange?` onchange="${opts.onchange}"`:'' ;
  return `<input id="${esc(id)}" type="${type}" class="${classes}"${val}${ph}${ac}${ro}${ev}${ev2}>`;
}

/* ── select ─────────────────────────────────────────────────── */
function sel(id, items, opts={}){
  const classes=['ctrl', opts.cls||''].filter(Boolean).join(' ');
  const ev = opts.onchange?` onchange="${opts.onchange}"`:'' ;
  const options = items.map(it=>{
    const v = typeof it==='object'?it.v:it;
    const l = typeof it==='object'?it.l:it;
    const s = typeof it==='object'&&it.sel?' selected':'';
    return `<option value="${esc(String(v))}"${s}>${esc(String(l))}</option>`;
  }).join('');
  return `<select id="${esc(id)}" class="${classes}"${ev}>${options}</select>`;
}

/* ── textarea ───────────────────────────────────────────────── */
function ta(id, value, opts={}){
  const classes=['ctrl', opts.cls||''].filter(Boolean).join(' ');
  const ph = opts.placeholder?` placeholder="${esc(opts.placeholder)}"`:'' ;
  const rows = opts.rows||4;
  return `<textarea id="${esc(id)}" class="${classes}" rows="${rows}"${ph}>${esc(value||'')}</textarea>`;
}

/* ── modal lifecycle ────────────────────────────────────────── */
function showModal(id, title, bodyHtml, footerHtml, opts={}){
  document.getElementById(id)?.remove();
  const sizeClass = opts.wide?'modal-box--wide':opts.narrow?'modal-box--narrow':'';
  const el = document.createElement('div');
  el.id = id;
  el.className = 'modal-overlay';
  el.innerHTML=`
<div class="modal-box${sizeClass?' '+sizeClass:''}">
  <div class="modal-header">
    <h3 class="modal-title">${title}</h3>
    <button class="icon-btn" onclick="document.getElementById('${esc(id)}').remove()">${ic('x',18)}</button>
  </div>
  ${bodyHtml}
  ${footerHtml?`<div class="modal-footer">${footerHtml}</div>`:''}
</div>`;
  el.addEventListener('click',e=>{ if(e.target===el) el.remove(); });
  document.body.appendChild(el);
  return el;
}

/* ── platform topbar — ONE component for ALL roles ──────────── */
function renderPlatformTopbar(me, opts={}){
  const qSize = getQ().length;
  const openTickets = (data?.tickets||[]).filter(t=>!['completed','rejected','cancelled'].includes(t.status)).length;
  const pendingRpts = (data?.reports||[]).filter(r=>(r.approvalStatus||'pending')==='pending').length;

  const wsSwitcher = me.roles&&me.roles.length>1
    ?`<button class="icon-btn tb-workspace" onclick="renderWorkspaceSwitcher()" title="${tr('switchWorkspace')}">${ic('layers',20)}</button>`:'';

  const syncBtn = qSize>0
    ?`<button class="tb-sync pending" onclick="flushOfflineQueue()" title="${tr('sync')}"><span class="tb-sync-dot pending"></span><span class="tb-sync-lbl">${qSize} ${lang==='ar'?'معلق':'pending'}</span></button>`
    :`<button class="tb-sync" onclick="flushOfflineQueue()" title="${tr('sync')}"><span class="tb-sync-dot"></span><span class="tb-sync-lbl">${tr('sync')}</span></button>`;

  const notifBtn = `<button class="icon-btn tb-notif" id="tb-notif-btn" onclick="toggleNotif(event)" title="${lang==='ar'?'الإشعارات':'Notifications'}">${ic('bell',20)}${pendingRpts>0||openTickets>0?`<span class="tb-notif-badge"></span>`:''}</button>`;

  /* Unified brand — same platform name for all roles */
  const brandInner = `<span class="tb-brand-name">${lang==='ar'?'مِرفق':'MRFQ'}</span>`;
  const showBack = opts.back === true || (opts.back !== false && appHasBackTarget());
  const backBtn = showBack
    ? `<button class="icon-btn tb-back" onclick="${opts.backAction||'appBack()'}" aria-label="${lang==='ar'?'رجوع':'Back'}" title="${lang==='ar'?'رجوع':'Back'}">${ic(lang==='ar'?'arrow':'arrow-left',20)}</button>`
    : '';

  return`
<header class="topbar">
  <div class="topbar-inner">
    <div class="topbar-start">
      ${backBtn}
      <div class="tb-brand">
        <div class="tb-brand-icon"><img src="/assets/logos/mrfq-logo-icon-dark-v4.svg" onerror="this.style.display='none'" alt="MRFQ"></div>
        ${brandInner}
      </div>
    </div>
    <div class="topbar-end">
      ${syncBtn}
      ${notifBtn}
      ${wsSwitcher}
      <button class="icon-btn tb-lang" onclick="switchLang()" aria-label="${tr('lang')}" title="${tr('lang')}">${ic('language',20)}</button>
      <button class="tb-logout icon-btn" onclick="logout()" title="${tr('logout')}">${ic('logout',18)}</button>
    </div>
  </div>
</header>`;
}

/* ── field workspace shell — Worker / Employee / Supervisor ─── */
function renderFieldTabs(){
  if(!me) return '';
  const mk = (active, icon, label, action, count=0) => `
    <button class="fieldTab${active?' active':''}" onclick="${action}">
      <span class="fieldTab-main">
        <span class="fieldTab-icon">${ic(icon,16)}</span>
        <span class="fieldTab-label">${label}</span>
      </span>
      ${count?`<span class="countBubble fieldTab-count">${num(count)}</span>`:''}
    </button>`;
  if(['cleaning_supervisor','maintenance_supervisor'].includes(me.role)){
    const openTickets = (data?.tickets||[]).filter(t=>!['completed','rejected','cancelled'].includes(t.status)).length;
    const pendingReports = (data?.reports||[]).filter(r=>(r.approvalStatus||'pending')==='pending').length;
    const workers = (data?.users||[]).filter(u=>(u.roles||[u.role]).includes(operationalWorkerRole())).length;
    const renderFn = isMaintenanceRole()?'renderMaintenanceSupervisor':'renderSupervisor';
    return `<div class="fieldTabs" role="tablist">
      ${mk(supervisorView==='dashboard','dashboard',tr('dashboard'),`supervisorView='dashboard';mobileNavActive='supervisor-dashboard';${renderFn}()`)}
      ${mk(supervisorView==='requests','tickets',lang==='ar'?'الطلبات':'Requests',`supervisorView='requests';mobileNavActive='supervisor-requests';${renderFn}()`,openTickets)}
      ${mk(supervisorView==='team','users',lang==='ar'?'الفريق':'Team',`supervisorView='team';mobileNavActive='supervisor-team';${renderFn}()`,workers)}
      ${mk(supervisorView==='reports','reports',tr('reports'),`supervisorView='reports';mobileNavActive='supervisor-reports';${renderFn}()`,pendingReports)}
    </div>`;
  }
  if(me.role==='maintenance_worker'){
    const active=(data?.tickets||[]).filter(t=>!['completed','rejected','cancelled'].includes(t.status)).length;
    const team=(data?.tickets||[]).filter(t=>!['completed','rejected','cancelled'].includes(t.status)&&maintenanceAssignees(t.id).length>1).length;
    const upcoming=(maintenanceData().schedules||[]).filter(s=>(s.defaultTechnicianIds||[]).includes(me.id)&&s.active).length;
    return `<div class="fieldTabs" role="tablist">
      ${mk(maintWorkerView==='tasks','tickets',tr('maintMyTasks'),"maintWorkerView='tasks';renderMaintenanceWorker()",active)}
      ${mk(maintWorkerView==='team','users',tr('maintTeamTasks'),"maintWorkerView='team';renderMaintenanceWorker()",team)}
      ${mk(maintWorkerView==='upcoming','clock',tr('maintUpcoming'),"maintWorkerView='upcoming';renderMaintenanceWorker()",upcoming)}
      ${mk(maintWorkerView==='history','reports',tr('maintHistory'),"maintWorkerView='history';renderMaintenanceWorker()")}
    </div>`;
  }
  if(me.role==='cleaner'){
    const assignedCount = ((data?.assignments||[]).find(a=>a.workerId===me?.id)?.locationIds||[]).length;
    const reportCount = (data?.reports||[]).filter(r=>r.workerId===me.id).length;
    return `<div class="fieldTabs" role="tablist">
      ${mk(workerView==='task','check',lang==='ar'?'المهمة':'Task',`workerView='task';mobileNavActive='worker-task';${isMaintenanceRole()?'renderMaintenanceWorker':'renderWorker'}()`)}
      ${mk(workerView==='assigned','locations',lang==='ar'?'المسندة':'Assigned',`workerView='assigned';mobileNavActive='worker-assigned';${isMaintenanceRole()?'renderMaintenanceWorker':'renderWorker'}()`,assignedCount)}
      ${mk(workerView==='reports','reports',lang==='ar'?'تقاريري':'Reports',`workerView='reports';mobileNavActive='worker-reports';${isMaintenanceRole()?'renderMaintenanceWorker':'renderWorker'}()`,reportCount)}
    </div>`;
  }
  if(me.role==='employee'){
    const activeCount = (data?.tickets||[]).filter(t=>t.createdById===me.id&&!['completed','rejected','cancelled'].includes(t.status)).length;
    return `<div class="fieldTabs" role="tablist">
      ${mk(employeeView==='home','dashboard',lang==='ar'?'الرئيسية':'Home',"employeeView='home';mobileNavActive='employee-home';renderEmployee()")}
      ${mk(employeeView==='new','send',lang==='ar'?'طلب جديد':'New',"employeeView='new';mobileNavActive='employee-new';renderEmployee()")}
      ${mk(employeeView==='history','clipboardList',tr('myRequests'),"employeeView='history';mobileNavActive='employee-history';renderEmployee()",activeCount)}
      ${mk(employeeView==='more','menu',lang==='ar'?'المزيد':'More',"employeeView='more';mobileNavActive='employee-more';renderEmployee()")}
    </div>`;
  }
  if(me.role==='hospitality_supervisor'){
    const orders = data?.hospitalityOrders||[];
    const newCount = orders.filter(o=>o.status==='submitted').length;
    const workers = (data?.users||[]).filter(u=>(u.roles||[u.role]).includes('hospitality_worker')).length;
    return `<div class="fieldTabs" role="tablist">
      ${mk(hospSupervisorView==='dashboard','dashboard',tr('hospDashboardTab'),"hospSupervisorView='dashboard';mobileNavActive='hospsup-dashboard';renderHospitalitySupervisor()")}
      ${mk(hospSupervisorView==='orders','coffee',tr('hospOrdersTab'),"hospSupervisorView='orders';mobileNavActive='hospsup-orders';renderHospitalitySupervisor()",newCount)}
      ${mk(hospSupervisorView==='team','users',tr('hospTeamTab'),"hospSupervisorView='team';mobileNavActive='hospsup-team';renderHospitalitySupervisor()",workers)}
    </div>`;
  }
  if(me.role==='hospitality_manager'){
    const orders = data?.hospitalityOrders||[];
    const newCount = orders.filter(o=>o.status==='submitted').length;
    return `<div class="fieldTabs" role="tablist">
      ${mk(hospManagerView==='dashboard','dashboard',tr('hospDashboardTab'),"hospManagerView='dashboard';mobileNavActive='hospmgr-dashboard';renderHospitalityManager()")}
      ${mk(hospManagerView==='orders','coffee',tr('hospOrdersTab'),"hospManagerView='orders';mobileNavActive='hospmgr-orders';renderHospitalityManager()",newCount)}
      ${mk(hospManagerView==='reports','reports',tr('hospReportsTab'),"hospManagerView='reports';mobileNavActive='hospmgr-reports';renderHospitalityManager()")}
      ${mk(hospManagerView==='products','coffee',tr('productsTitle'),"hospManagerView='products';mobileNavActive='hospmgr-products';renderHospitalityManager()")}
      ${mk(hospManagerView==='kitchens','building',tr('kitchensTitle'),"hospManagerView='kitchens';mobileNavActive='hospmgr-kitchens';renderHospitalityManager()")}
    </div>`;
  }
  if(['system_admin','facility_manager'].includes(me.role) && adminModuleContext==='hospitality'){
    const orders = data?.hospitalityOrders||[];
    const newCount = orders.filter(o=>o.status==='submitted').length;
    const canManage = me.role==='system_admin';
    return `<div class="fieldTabs" role="tablist">
      ${mk(hospManagerView==='dashboard','dashboard',tr('hospDashboardTab'),"hospManagerView='dashboard';mobileNavActive='hospmgr-dashboard';renderAdminHospitality()")}
      ${mk(hospManagerView==='orders','coffee',tr('hospOrdersTab'),"hospManagerView='orders';mobileNavActive='hospmgr-orders';renderAdminHospitality()",newCount)}
      ${mk(hospManagerView==='reports','reports',tr('hospReportsTab'),"hospManagerView='reports';mobileNavActive='hospmgr-reports';renderAdminHospitality()")}
      ${canManage?mk(hospManagerView==='products','coffee',tr('productsTitle'),"hospManagerView='products';mobileNavActive='hospmgr-products';renderAdminHospitality()"):''}
      ${canManage?mk(hospManagerView==='kitchens','building',tr('kitchensTitle'),"hospManagerView='kitchens';mobileNavActive='hospmgr-kitchens';renderAdminHospitality()"):''}
    </div>`;
  }
  return '';
}
function fieldShell(me, contentHtml, opts={}){
  const mainCls = 'platform-main platform-main--field' + (opts.noSticky ? ' platform-main--no-sticky' : '');
  const openTickets = (data?.tickets||[]).filter(t=>!['completed','rejected','cancelled'].includes(t.status)).length;
  const pendingReports = (data?.reports||[]).filter(r=>(r.approvalStatus||'pending')==='pending').length;
  return`<div class="platform-shell">
  ${renderPlatformTopbar(me, {sync:true, back:opts.back, backAction:opts.backAction})}
  <div class="platform-body">
    <main class="${mainCls}">
      ${renderFieldTabs()}
      ${contentHtml}
    </main>
  </div>
  ${renderMobileBottomNav(openTickets, pendingReports)}
</div>`;
}

/* ── hospitality manager shell — mirrors shell()'s sidebar layout on
   desktop, reuses the platform-shell--admin tablet/mobile navigation ── */
function hospManagerShell(me, contentHtml, opts={}){
  const orders = data?.hospitalityOrders||[];
  const newCount = orders.filter(o=>o.status==='submitted').length;
  const renderFn = opts.renderFn || 'renderHospitalityManager';
  const canManage = !!opts.canManage;
  const goto = (v)=>`hospManagerView='${v}';mobileNavActive='hospmgr-${v}';${renderFn}()`;
  const item = (v,label,icon,count=0)=>`<button class="navBtn${hospManagerView===v?' active':''}" onclick="${goto(v)}">
    <span class="navBtn-icon">${ic(icon,18)}</span>
    <span class="navBtn-label">${label}</span>
    ${count>0?`<span class="countBubble navBtn-badge">${num(count)}</span>`:''}
  </button>`;
  return `
<div class="platform-shell platform-shell--admin">
  ${renderPlatformTopbar(me, {search:false, notif:true, sync:true, adminMode:true, back:opts.back, backAction:opts.backAction})}

  <!-- BODY -->
  <div class="platform-body">
    <!-- SIDEBAR -->
    <aside class="platform-sidebar">
      <div class="sidebarInner">
        <div class="nav-section">
          <span class="nav-section-label">${tr('operations')}</span>
          ${item('dashboard',tr('dashboard'),'dashboard')}
          ${item('orders',tr('hospOrdersTab'),'coffee',newCount)}
          ${item('reports',tr('hospReportsTab'),'reports')}
        </div>
        ${canManage?`<div class="nav-section">
          <span class="nav-section-label">${tr('management')}</span>
          ${item('products',tr('productsTitle'),'coffee')}
          ${item('categories',tr('categoriesTitle'),'layers')}
          ${item('kitchens',tr('kitchensTitle'),'building')}
        </div>`:''}
      </div>
    </aside>

    <!-- MAIN CONTENT -->
    <main class="platform-main">
      <div class="pageAnim">
        ${opts.adminContext?moduleContextBar('hospitalityModuleLabel'):''}
        ${contentHtml}
      </div>
    </main>
  </div>
  ${renderMobileBottomNav(newCount, 0)}
</div>`;
}

function setTopbarBackButton(show, action='history.back()'){
  const start = document.querySelector('.topbar-start');
  if(!start) return;
  const existing = start.querySelector('.tb-back');
  if(!show){
    existing?.remove();
    return;
  }
  if(existing){
    existing.setAttribute('onclick', action);
    return;
  }
  const btn = document.createElement('button');
  btn.className = 'icon-btn tb-back';
  btn.setAttribute('onclick', action);
  btn.setAttribute('aria-label', lang==='ar'?'رجوع':'Back');
  btn.setAttribute('title', lang==='ar'?'رجوع':'Back');
  btn.innerHTML = ic(lang==='ar'?'arrow':'arrow-left',20);
  start.prepend(btn);
}

/* ─── RENDER DISPATCHER ──────────────────────────────────────── */
let _lastView = null;
function render(){
  if(!me||!data) return loginPage();
  // Workspace selection screen for multi-role users
  if(needsWorkspaceSelection()) return renderWorkspaceSelector();
  if(me.role==='cleaner') return renderWorker();
  if(me.role==='employee') return renderEmployee();
  if(me.role==='cleaning_supervisor') return renderSupervisor();
  if(me.role==='hospitality_worker') return renderHospitalityWorker();
  if(me.role==='hospitality_supervisor') return renderHospitalitySupervisor();
  if(me.role==='hospitality_manager') return renderHospitalityManager();
  if(me.role==='maintenance_worker') return renderMaintenanceWorker();
  if(me.role==='maintenance_supervisor') return renderMaintenanceSupervisor();
  if(me.role==='maintenance_manager') return renderMaintenanceManager();
  if(['system_admin','facility_manager'].includes(me.role) && adminModuleContext==='maintenance') return renderAdminMaintenance();
  if(me.role==='system_admin' && !adminModuleContext) return renderSystemAdmin();
  if(me.role==='facility_manager' && !adminModuleContext) return renderFacilityConsole();
  if(['system_admin','facility_manager'].includes(me.role) && adminModuleContext==='hospitality') return renderAdminHospitality();
  setDoc();
  if(_lastView==='users' && view!=='users'){ usersSearch=''; usersRoleFilter='all'; usersStatusFilter='all'; }
  if(_lastView==='locations' && view!=='locations'){ locsFloorFilter='all'; }
  if(_lastView==='assignments' && view!=='assignments'){ assignFloorFilter='all'; }
  _lastView = view;
  if(view==='performance'){
    shell(`<div style="text-align:center;padding:40px">${ic('clock',28)}</div>`);
    performance().then(html=>{
      const main=document.querySelector('.platform-main .pageAnim');
      if(main) main.innerHTML=html;
    });
    return;
  }
  const fn = {dashboard:dash,reports:reports,tickets:tickets,locations:locations,assignments:assignments,users:users,recurringTasks:recurringTasksPage}[view]||dash;
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
    </div>
    <div class="loginPanel">
      <button class="loginLangBtn" onclick="switchLang()" type="button" aria-label="${tr('lang')}" title="${tr('lang')}">${ic('language',22)}</button>
      <div class="loginPanel-logo">
        <img src="/assets/logos/mrfq-logo-icon-dark-v4.svg" onerror="this.src='/assets/logos/mrfq-logo-icon-light-v4.svg'" alt="MRFQ">
      </div>
      <h2 class="loginPanel-title">${tr('app')}</h2>
      ${fc(tr('user'), `<div class="input-wrap login-input-wrap"><span class="input-icon input-icon-static">${ic('user',16)}</span>${inp('lu',{type:'text', autocomplete:'username', placeholder:tr('user'), cls:'login-input'})}</div>`)}
      ${fc(tr('pass'),`<div class="input-wrap login-input-wrap"><span class="input-icon input-icon-static">${ic('lock',16)}</span>${inp('lp',{type:'password', autocomplete:'current-password', placeholder:tr('pass'), cls:'login-input login-input--with-action'})}<button class="input-icon input-icon-btn" id="pwdToggle" onclick="togglePwd()" type="button" tabindex="-1" aria-label="${lang==='ar'?'إظهار/إخفاء كلمة المرور':'Toggle password visibility'}">${ic('eye-off',16)}</button></div>`)}
      <button class="btn wide" onclick="login()">${tr('login')}</button>
      <p class="loginPanel-foot">${lang==='ar'?'الدخول متاح فقط للمستخدمين المصرح لهم داخل المنصة.':'Access is restricted to authorized platform users only.'}</p>
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
      <img src="/assets/logos/mrfq-logo-icon-dark-v4.svg" onerror="this.src='/assets/logos/mrfq-logo-icon-light-v4.svg'" alt="MRFQ">
    </div>
    <h2 class="fpBox-title">${lang==='ar'?'تغيير كلمة المرور':'Change Password'}</h2>
    <p class="fpBox-sub">${lang==='ar'?'يجب تغيير كلمة المرور المؤقتة قبل استخدام النظام':'You must change your temporary password before using the system'}</p>
    ${fc(lang==='ar'?'كلمة المرور الجديدة':'New Password', inp('fpNewPwd',{type:'password', oninput:'checkPwdStrength()', autocomplete:'new-password'}))}
    <div id="pwdStrength" class="pwdStrength"></div>
    ${fc(lang==='ar'?'تأكيد كلمة المرور':'Confirm Password', inp('fpConfirmPwd',{type:'password', autocomplete:'new-password'}))}
    <div id="fpError" class="formError"></div>
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
  const openTickets   = (data.tickets||[]).filter(t=>!['completed','rejected','cancelled'].includes(t.status)).length;
  const pendingReports= (data.reports||[]).filter(r=>(r.approvalStatus||'pending')==='pending').length;
  app.innerHTML=`
<div class="platform-shell platform-shell--admin">
  ${renderPlatformTopbar(me, {search:false, notif:true, sync:true, adminMode:true})}

  <!-- BODY -->
  <div class="platform-body">
    <!-- SIDEBAR -->
    <aside class="platform-sidebar">
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
          ${canUsers()?navItem('users',canViewCleaningTeam()?tr('cleaningTeam'):tr('users'),'users',0):''}
          ${canReview()?navItem('performance',tr('performance'),'bar-chart',0):''}
          ${['cleaning_manager','cleaning_supervisor'].includes(me.role)?navItem('recurringTasks',lang==='ar'?'مهام متكررة':'Recurring','refresh',0):''}
        </div>
      </div>
    </aside>

    <!-- MAIN CONTENT -->
    <main class="platform-main">
      <div class="pageAnim">
        ${canAccessPlatformConsole()&&adminModuleContext==='cleaning'?moduleContextBar():''}
        ${content}
      </div>
    </main>
  </div>
  ${renderMobileBottomNav(openTickets, pendingReports)}
</div>`;
}

function moduleContextBar(labelKey='cleaningModuleLabel'){
  return `<div class="moduleContextBar">
    <span class="moduleContextBar-label">${ic('reports',16)} ${tr(labelKey)}</span>
    <button class="btn secondary sm" onclick="exitModule()">${ic('arrow-left',14)} ${tr('backToConsole')}</button>
  </div>`;
}

function navItem(v,label,icon,count){
  return `<button class="navBtn${view===v?' active':''}" onclick="navigateTo('${v}')">
    <span class="navBtn-icon">${ic(icon,18)}</span>
    <span class="navBtn-label">${label}</span>
    ${count>0?`<span class="countBubble navBtn-badge">${num(count)}</span>`:''}
  </button>`;
}

function countBubble(value, tone='brand'){
  return `<span class="countBubble ${tone}">${num(value)}</span>`;
}

function renderMobileBottomNav(openTickets=0, pendingReports=0){
  const role = me?.role || '';
  const isAdmin = !['employee','cleaner','cleaning_supervisor'].includes(role) && (canManage() || canReview() || role==='cleaning_manager' || role==='facility_manager');
  const activeKey = mobileNavActive || view;
  let primary = [];
  let showMore = isAdmin;
  if(role==='employee'){
    const activeCount = (data?.tickets||[]).filter(t=>t.createdById===me.id&&!['completed','rejected','cancelled'].includes(t.status)).length;
    showMore = false;
    primary = [
      {v:'employee-home', label:lang==='ar'?'الرئيسية':'Home', icon:'dashboard', count:0, action:"employeeView='home';mobileNavActive='employee-home';renderEmployee()", active:employeeView==='home'},
      {v:'employee-new', label:lang==='ar'?'طلب جديد':'New', icon:'send', count:0, action:"employeeView='new';mobileNavActive='employee-new';renderEmployee()", active:employeeView==='new'},
      {v:'employee-history', label:tr('myRequests'), icon:'clipboardList', count:activeCount, action:"employeeView='history';mobileNavActive='employee-history';renderEmployee()", active:employeeView==='history'},
      {v:'employee-more', label:lang==='ar'?'المزيد':'More', icon:'menu', count:0, action:"employeeView='more';mobileNavActive='employee-more';renderEmployee()", active:employeeView==='more'}
    ];
  }else if(role==='maintenance_worker'){
    showMore=false;
    const active=(data?.tickets||[]).filter(t=>!['completed','rejected','cancelled'].includes(t.status)).length;
    const team=(data?.tickets||[]).filter(t=>!['completed','rejected','cancelled'].includes(t.status)&&maintenanceAssignees(t.id).length>1).length;
    const upcoming=(maintenanceData().schedules||[]).filter(s=>(s.defaultTechnicianIds||[]).includes(me.id)&&s.active).length;
    primary=[
      {v:'maint-worker-tasks',label:tr('maintMyTasks'),icon:'tickets',count:active,action:"maintWorkerView='tasks';renderMaintenanceWorker()",active:maintWorkerView==='tasks'},
      {v:'maint-worker-team',label:tr('maintTeamTasks'),icon:'users',count:team,action:"maintWorkerView='team';renderMaintenanceWorker()",active:maintWorkerView==='team'},
      {v:'maint-worker-upcoming',label:tr('maintUpcoming'),icon:'clock',count:upcoming,action:"maintWorkerView='upcoming';renderMaintenanceWorker()",active:maintWorkerView==='upcoming'},
      {v:'maint-worker-history',label:tr('maintHistory'),icon:'reports',count:0,action:"maintWorkerView='history';renderMaintenanceWorker()",active:maintWorkerView==='history'}
    ];
  }else if(role==='cleaner'){
    const assignedCount = ((data?.assignments||[]).find(a=>a.workerId===me?.id)?.locationIds||[]).length;
    showMore = false;
    primary = [
      {v:'worker-task', label:lang==='ar'?'المهمة':'Task', icon:'check', count:openTickets, action:`workerView='task';mobileNavActive='worker-task';${isMaintenanceRole(role)?'renderMaintenanceWorker':'renderWorker'}()`, active:workerView==='task'},
      {v:'worker-assigned', label:lang==='ar'?'المسندة':'Assigned', icon:'locations', count:assignedCount, action:`workerView='assigned';mobileNavActive='worker-assigned';${isMaintenanceRole(role)?'renderMaintenanceWorker':'renderWorker'}()`, active:workerView==='assigned'},
      {v:'worker-reports', label:lang==='ar'?'تقاريري':'Reports', icon:'reports', count:pendingReports, action:`workerView='reports';mobileNavActive='worker-reports';${isMaintenanceRole(role)?'renderMaintenanceWorker':'renderWorker'}()`, active:workerView==='reports'}
    ];
  }else if(['cleaning_supervisor','maintenance_supervisor'].includes(role)){
    showMore = false;
    primary = [
      {v:'supervisor-dashboard', label:tr('dashboard'), icon:'dashboard', count:0, action:`supervisorView='dashboard';mobileNavActive='supervisor-dashboard';${isMaintenanceRole(role)?'renderMaintenanceSupervisor':'renderSupervisor'}()`, active:supervisorView==='dashboard'},
      {v:'supervisor-requests', label:lang==='ar'?'الطلبات':'Requests', icon:'tickets', count:openTickets, action:`supervisorView='requests';mobileNavActive='supervisor-requests';${isMaintenanceRole(role)?'renderMaintenanceSupervisor':'renderSupervisor'}()`, active:supervisorView==='requests'},
      {v:'supervisor-team', label:lang==='ar'?'الفريق':'Team', icon:'users', count:0, action:`supervisorView='team';mobileNavActive='supervisor-team';${isMaintenanceRole(role)?'renderMaintenanceSupervisor':'renderSupervisor'}()`, active:supervisorView==='team'},
      {v:'supervisor-reports', label:tr('reports'), icon:'reports', count:pendingReports, action:`supervisorView='reports';mobileNavActive='supervisor-reports';${isMaintenanceRole(role)?'renderMaintenanceSupervisor':'renderSupervisor'}()`, active:supervisorView==='reports'}
    ];
  }else if(role==='maintenance_manager'){
    showMore = false;
    primary = [
      {v:'dashboard', label:tr('dashboard'), icon:'dashboard', count:0},
      {v:'tickets', label:tr('tickets'), icon:'tickets', count:openTickets},
      {v:'reports', label:tr('reports'), icon:'reports', count:pendingReports},
      {v:'users', label:tr('maintTeam'), icon:'users', count:0}
    ];
  }else if(role==='hospitality_worker'){
    showMore = false;
    const hospCount = (data?.hospitalityOrders||[]).filter(o=>!['completed','cancelled','rejected'].includes(o.status)).length;
    primary = [
      {v:'hosp-worker', label:tr('hospitalityWorkerTitle'), icon:'coffee', count:hospCount, action:"render()", active:true}
    ];
  }else if(role==='hospitality_supervisor'){
    showMore = false;
    const orders = data?.hospitalityOrders||[];
    const newCount = orders.filter(o=>o.status==='submitted').length;
    const workers = (data?.users||[]).filter(u=>(u.roles||[u.role]).includes('hospitality_worker')).length;
    primary = [
      {v:'hospsup-dashboard', label:tr('hospDashboardTab'), icon:'dashboard', count:0, action:"hospSupervisorView='dashboard';mobileNavActive='hospsup-dashboard';renderHospitalitySupervisor()", active:hospSupervisorView==='dashboard'},
      {v:'hospsup-orders', label:tr('hospOrdersTab'), icon:'coffee', count:newCount, action:"hospSupervisorView='orders';mobileNavActive='hospsup-orders';renderHospitalitySupervisor()", active:hospSupervisorView==='orders'},
      {v:'hospsup-team', label:tr('hospTeamTab'), icon:'users', count:workers, action:"hospSupervisorView='team';mobileNavActive='hospsup-team';renderHospitalitySupervisor()", active:hospSupervisorView==='team'}
    ];
  }else if(role==='hospitality_manager'){
    showMore = true;
    const orders = data?.hospitalityOrders||[];
    const newCount = orders.filter(o=>o.status==='submitted').length;
    primary = [
      {v:'hospmgr-dashboard', label:lang==='ar'?'الرئيسية':'Home', icon:'dashboard', count:0, action:"hospManagerView='dashboard';mobileNavActive='hospmgr-dashboard';renderHospitalityManager()", active:hospManagerView==='dashboard'},
      {v:'hospmgr-orders', label:tr('hospOrdersTab'), icon:'coffee', count:newCount, action:"hospManagerView='orders';mobileNavActive='hospmgr-orders';renderHospitalityManager()", active:hospManagerView==='orders'},
      {v:'hospmgr-products', label:tr('productsTitle'), icon:'coffee', count:0, action:"hospManagerView='products';mobileNavActive='hospmgr-products';renderHospitalityManager()", active:hospManagerView==='products'},
      {v:'hospmgr-kitchens', label:tr('kitchensTitle'), icon:'building', count:0, action:"hospManagerView='kitchens';mobileNavActive='hospmgr-kitchens';renderHospitalityManager()", active:hospManagerView==='kitchens'}
    ];
  }else if(adminModuleContext==='hospitality' && ['system_admin','facility_manager'].includes(role)){
    const orders = data?.hospitalityOrders||[];
    const newCount = orders.filter(o=>o.status==='submitted').length;
    const canManage = canManageHospitalityMenu();
    primary = [
      {v:'hospmgr-dashboard', label:lang==='ar'?'الرئيسية':'Home', icon:'dashboard', count:0, action:"hospManagerView='dashboard';mobileNavActive='hospmgr-dashboard';renderAdminHospitality()", active:hospManagerView==='dashboard'},
      {v:'hospmgr-orders', label:tr('hospOrdersTab'), icon:'coffee', count:newCount, action:"hospManagerView='orders';mobileNavActive='hospmgr-orders';renderAdminHospitality()", active:hospManagerView==='orders'},
      ...(canManage?[
        {v:'hospmgr-products', label:tr('productsTitle'), icon:'coffee', count:0, action:"hospManagerView='products';mobileNavActive='hospmgr-products';renderAdminHospitality()", active:hospManagerView==='products'},
        {v:'hospmgr-kitchens', label:tr('kitchensTitle'), icon:'building', count:0, action:"hospManagerView='kitchens';mobileNavActive='hospmgr-kitchens';renderAdminHospitality()", active:hospManagerView==='kitchens'}
      ]:[
        {v:'hospmgr-reports', label:tr('hospReportsTab'), icon:'reports', count:0, action:"hospManagerView='reports';mobileNavActive='hospmgr-reports';renderAdminHospitality()", active:hospManagerView==='reports'}
      ])
    ];
    showMore = canManage;
  }else{
    primary = [
      {v:'dashboard', label:tr('dashboard'), icon:'dashboard', count:0},
      {v:'tickets', label:tr('tickets'), icon:'tickets', count:openTickets},
      {v:'reports', label:tr('reports'), icon:'reports', count:pendingReports},
      {v:'locations', label:tr('locations'), icon:'locations', count:0}
    ];
  }
  const moreActive = isAdmin ? !primary.some(item=>item.v===view)
    : (showMore && !primary.some(item=>item.active||activeKey===item.v));
  const navCount = primary.length + (showMore ? 1 : 0);
  return `<nav class="mobileBottomNav" style="--mobile-nav-count:${navCount}" aria-label="${lang==='ar'?'تنقل الجوال':'Mobile navigation'}">
    ${primary.map(item=>`
      <button class="mobileBottomNav-item${item.active||activeKey===item.v?' active':''}" onclick="${item.action||`mobileNavActive='${item.v}';navigateTo('${item.v}')`}">
        <span class="mobileBottomNav-icon">${ic(item.icon,18)}</span>
        <span class="mobileBottomNav-label">${item.label}</span>
        ${item.count>0?`<span class="countBubble mobileBottomNav-badge">${num(item.count)}</span>`:''}
      </button>
    `).join('')}
    ${showMore?`<button class="mobileBottomNav-item${moreActive?' active':''}" onclick="showMobileNavMore()">
      <span class="mobileBottomNav-icon">${ic('menu',18)}</span>
      <span class="mobileBottomNav-label">${lang==='ar'?'المزيد':'More'}</span>
    </button>`:''}
  </nav>`;
}

function showMobileNavMore(){
  let items;
  if(me.role==='hospitality_manager'){
    items = [
      {v:'hospmgr-reports', label:tr('hospReportsTab'), icon:'reports', active:hospManagerView==='reports', action:"hospManagerView='reports';mobileNavActive='hospmgr-reports';renderHospitalityManager()"},
      {v:'hospmgr-categories', label:tr('categoriesTitle'), icon:'layers', active:hospManagerView==='categories', action:"hospManagerView='categories';mobileNavActive='hospmgr-categories';renderHospitalityManager()"}
    ];
  }else if(adminModuleContext==='hospitality' && ['system_admin','facility_manager'].includes(me.role) && canManageHospitalityMenu()){
    items = [
      {v:'hospmgr-reports', label:tr('hospReportsTab'), icon:'reports', active:hospManagerView==='reports', action:"hospManagerView='reports';mobileNavActive='hospmgr-reports';renderAdminHospitality()"},
      {v:'hospmgr-categories', label:tr('categoriesTitle'), icon:'layers', active:hospManagerView==='categories', action:"hospManagerView='categories';mobileNavActive='hospmgr-categories';renderAdminHospitality()"}
    ];
  }else{
    items = [
      {v:'dashboard', label:tr('dashboard'), icon:'dashboard'},
      {v:'tickets', label:tr('tickets'), icon:'tickets'},
      {v:'reports', label:tr('reports'), icon:'reports'},
      {v:'locations', label:tr('locations'), icon:'locations'},
      {v:'assignments', label:tr('assignments'), icon:'assignments'},
      ...(canUsers()?[{v:'users', label:canViewCleaningTeam()?tr('cleaningTeam'):tr('users'), icon:'users'}]:[]),
      ...(canReview()?[{v:'performance', label:tr('performance'), icon:'bar-chart'}]:[])
    ];
  }
  const body = `<div class="mobileMoreGrid">
    ${items.map(item=>`<button class="mobileMoreItem${(item.active!==undefined?item.active:view===item.v)?' active':''}" onclick="document.getElementById('mobileNavModal')?.remove();${item.action||`navigateTo('${item.v}')`}">
      <span class="mobileMoreIcon">${ic(item.icon,18)}</span>
      <span>${item.label}</span>
    </button>`).join('')}
  </div>`;
  showModal('mobileNavModal', lang==='ar'?'التنقل':'Navigation', body, null, {narrow:true});
}

/* ═══════════════════════════════════════════════════════════════
   SYSTEM ADMIN CONSOLE — platform-level console for system_admin
   ═══════════════════════════════════════════════════════════════ */
function renderSystemAdmin(){
  setDoc();
  if(adminView==='products'){
    adminShell(`<div style="text-align:center;padding:40px">${ic('clock',28)}</div>`);
    ensureHospMenuItems().then(()=>{
      const main = document.querySelector('.platform-main .pageAnim');
      if(main) main.innerHTML = hospitalityProductsView();
    });
    return;
  }
  if(adminView==='kitchens'){
    adminShell(`<div style="text-align:center;padding:40px">${ic('clock',28)}</div>`);
    ensureHospKitchens().then(()=>{
      const main = document.querySelector('.platform-main .pageAnim');
      if(main) main.innerHTML = hospitalityKitchensView();
    });
    return;
  }
  const fn = {
    dashboard: adminDashboard,
    modules: adminModules,
    users: users,
    roles: adminRoles,
    locations: locations,
    assets: adminAssets,
    maps: adminMaps,
    reports: reports,
    audit: adminAuditLog,
    settings: adminSettings,
    recurringTasks: recurringTasksPage
  }[adminView] || adminDashboard;
  adminShell(fn());
}

function adminShell(content){
  app.innerHTML=`
<div class="platform-shell platform-shell--admin">
  ${renderPlatformTopbar(me, {search:false, notif:true, sync:true, adminMode:true})}
  <div class="platform-body">
    <aside class="platform-sidebar">
      <div class="sidebarInner">
        <div class="nav-section">
          <span class="nav-section-label">${tr('systemAdminConsole')}</span>
          ${adminNavItem('dashboard',tr('systemDashboard'),'dashboard')}
          ${adminNavItem('modules',tr('modules'),'layers')}
          ${canManageGlobalUsers()?adminNavItem('users',tr('users'),'users'):''}
          ${canAccessRolesPermissions()?adminNavItem('roles',tr('rolesPermissions'),'shield'):''}
          ${adminNavItem('locations',tr('locations'),'locations')}
          ${adminNavItem('assets',tr('assets'),'building')}
          ${adminNavItem('maps',tr('maps'),'map-pin')}
          ${adminNavItem('products',tr('productsTitle'),'coffee')}
          ${adminNavItem('kitchens',tr('kitchensTitle'),'building')}
          ${adminNavItem('reports',tr('generalReports'),'reports')}
          ${adminNavItem('audit',tr('auditLog'),'list')}
          ${adminNavItem('recurringTasks',lang==='ar'?'مهام متكررة':'Recurring Tasks','refresh')}
          ${canAccessGlobalSettings()?adminNavItem('settings',tr('globalSettings'),'settings'):''}
        </div>
      </div>
    </aside>
    <main class="platform-main">
      <div class="pageAnim">
        ${content}
      </div>
    </main>
  </div>
  ${renderAdminMobileBottomNav()}
</div>`;
}

function adminNavItem(v,label,icon){
  return `<button class="navBtn${adminView===v?' active':''}" onclick="adminNavigateTo('${v}')">
    <span class="navBtn-icon">${ic(icon,18)}</span>
    <span class="navBtn-label">${label}</span>
  </button>`;
}

function adminNavigateTo(v){ adminView=v; render(); }

function renderAdminMobileBottomNav(){
  const primary = [
    {v:'dashboard', label:tr('systemDashboard'), icon:'dashboard'},
    {v:'modules', label:tr('modules'), icon:'layers'},
    {v:'users', label:tr('users'), icon:'users'}
  ];
  const moreActive = !primary.some(item=>item.v===adminView);
  return `<nav class="mobileBottomNav" style="--mobile-nav-count:${primary.length+1}" aria-label="${lang==='ar'?'تنقل الجوال':'Mobile navigation'}">
    ${primary.map(item=>`
      <button class="mobileBottomNav-item${adminView===item.v?' active':''}" onclick="adminNavigateTo('${item.v}')">
        <span class="mobileBottomNav-icon">${ic(item.icon,18)}</span>
        <span class="mobileBottomNav-label">${item.label}</span>
      </button>
    `).join('')}
    <button class="mobileBottomNav-item${moreActive?' active':''}" onclick="showAdminNavMore()">
      <span class="mobileBottomNav-icon">${ic('menu',18)}</span>
      <span class="mobileBottomNav-label">${lang==='ar'?'المزيد':'More'}</span>
    </button>
  </nav>`;
}

function showAdminNavMore(){
  const items = [
    ...(canAccessRolesPermissions()?[{v:'roles', label:tr('rolesPermissions'), icon:'shield'}]:[]),
    {v:'locations', label:tr('locations'), icon:'locations'},
    {v:'assets', label:tr('assets'), icon:'building'},
    {v:'maps', label:tr('maps'), icon:'map-pin'},
    {v:'products', label:tr('productsTitle'), icon:'coffee'},
    {v:'kitchens', label:tr('kitchensTitle'), icon:'building'},
    {v:'reports', label:tr('generalReports'), icon:'reports'},
    {v:'audit', label:tr('auditLog'), icon:'list'},
    ...(canAccessGlobalSettings()?[{v:'settings', label:tr('globalSettings'), icon:'settings'}]:[])
  ];
  const body = `<div class="mobileMoreGrid">
    ${items.map(item=>`<button class="mobileMoreItem${adminView===item.v?' active':''}" onclick="document.getElementById('mobileNavModal')?.remove();adminNavigateTo('${item.v}')">
      <span class="mobileMoreIcon">${ic(item.icon,18)}</span>
      <span>${item.label}</span>
    </button>`).join('')}
  </div>`;
  showModal('mobileNavModal', lang==='ar'?'التنقل':'Navigation', body, null, {narrow:true});
}

/* ═══════════════════════════════════════════════════════════════
   FACILITY MANAGER CONSOLE — platform-level console for facility_manager
   ═══════════════════════════════════════════════════════════════ */
function renderFacilityConsole(){
  setDoc();
  const fn = {
    dashboard: adminDashboard,
    modules: adminModules,
    locations: locations,
    reports: reports,
    assets: adminAssets,
    maps: adminMaps,
    recurringTasks: recurringTasksPage
  }[adminView] || adminDashboard;
  fmShell(fn());
}

function fmShell(content){
  app.innerHTML=`
<div class="platform-shell platform-shell--admin">
  ${renderPlatformTopbar(me, {search:false, notif:true, sync:true, adminMode:true})}
  <div class="platform-body">
    <aside class="platform-sidebar">
      <div class="sidebarInner">
        <div class="nav-section">
          <span class="nav-section-label">${tr('facilityConsole')}</span>
          ${adminNavItem('dashboard',tr('dashboard'),'dashboard')}
          ${adminNavItem('modules',tr('modules'),'layers')}
          ${adminNavItem('locations',tr('locations'),'locations')}
          ${adminNavItem('reports',tr('generalReports'),'reports')}
          ${adminNavItem('assets',tr('assets'),'building')}
          ${adminNavItem('maps',tr('maps'),'map-pin')}
          ${adminNavItem('recurringTasks',lang==='ar'?'مهام متكررة':'Recurring Tasks','refresh')}
        </div>
      </div>
    </aside>
    <main class="platform-main">
      <div class="pageAnim">
        ${content}
      </div>
    </main>
  </div>
  ${renderFmMobileBottomNav()}
</div>`;
}

function renderFmMobileBottomNav(){
  const primary = [
    {v:'dashboard', label:tr('dashboard'), icon:'dashboard'},
    {v:'modules', label:tr('modules'), icon:'layers'},
    {v:'locations', label:tr('locations'), icon:'locations'}
  ];
  const moreActive = !primary.some(item=>item.v===adminView);
  return `<nav class="mobileBottomNav" style="--mobile-nav-count:${primary.length+1}" aria-label="${lang==='ar'?'تنقل الجوال':'Mobile navigation'}">
    ${primary.map(item=>`
      <button class="mobileBottomNav-item${adminView===item.v?' active':''}" onclick="adminNavigateTo('${item.v}')">
        <span class="mobileBottomNav-icon">${ic(item.icon,18)}</span>
        <span class="mobileBottomNav-label">${item.label}</span>
      </button>
    `).join('')}
    <button class="mobileBottomNav-item${moreActive?' active':''}" onclick="showFmNavMore()">
      <span class="mobileBottomNav-icon">${ic('menu',18)}</span>
      <span class="mobileBottomNav-label">${lang==='ar'?'المزيد':'More'}</span>
    </button>
  </nav>`;
}

function showFmNavMore(){
  const items = [
    {v:'reports', label:tr('generalReports'), icon:'reports'},
    {v:'assets', label:tr('assets'), icon:'building'},
    {v:'maps', label:tr('maps'), icon:'map-pin'}
  ];
  const body = `<div class="mobileMoreGrid">
    ${items.map(item=>`<button class="mobileMoreItem${adminView===item.v?' active':''}" onclick="document.getElementById('mobileNavModal')?.remove();adminNavigateTo('${item.v}')">
      <span class="mobileMoreIcon">${ic(item.icon,18)}</span>
      <span>${item.label}</span>
    </button>`).join('')}
  </div>`;
  showModal('mobileNavModal', lang==='ar'?'التنقل':'Navigation', body, null, {narrow:true});
}

/* ── module entry / exit ───────────────────────────────────── */
function enterModule(key){
  if(key==='cleaning'){
    adminModuleContext = 'cleaning';
    view = 'dashboard';
    render();
    return;
  }
  if(key==='hospitality'){
    adminModuleContext = 'hospitality';
    hospManagerView = 'dashboard';
    mobileNavActive = 'hospmgr-dashboard';
    render();
    return;
  }
  if(key==='maintenance'){
    adminModuleContext = 'maintenance';
    view = 'dashboard';
    mobileNavActive = 'dashboard';
    render();
    return;
  }
}
function exitModule(){
  adminModuleContext = null;
  adminView = 'dashboard';
  render();
}

/* ── system admin dashboard ────────────────────────────────── */
function adminDashboard(){
  const openTickets = (data.tickets||[]).filter(t=>!['completed','rejected','cancelled'].includes(t.status)).length;
  const criticalTickets = (data.tickets||[]).filter(t=>t.priority==='high'&&!['completed','rejected','cancelled'].includes(t.status)).length;
  const activeUsersCount = (data.users||[]).filter(u=>u.active!==false).length;
  const activeModulesCount = MODULES.filter(m=>m.status==='active').length;
  const slaPct = Math.max(10,100-Math.min(100,openTickets*18));
  const lastEvent = [...(data.reports||[]),...(data.tickets||[])].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt))[0];
  const lastActivityStr = lastEvent ? fmt(lastEvent.createdAt) : '—';

  const hour = new Date().getHours();
  const greeting = lang==='ar'
    ? (hour<12?'صباح الخير':'مساء الخير')
    : (hour<12?'Good morning':'Good afternoon');
  const roleContext = me.role==='facility_manager'
    ? (lang==='ar'?`${tr('facility_manager')} · لوحة المرافق`:`${tr('facility_manager')} · Facility Console`)
    : (lang==='ar'?`${tr('system_admin')} · لوحة النظام`:`${tr('system_admin')} · System Dashboard`);
  const summaryText = lang==='ar'
    ? `${num(openTickets)} بلاغ مفتوح · ${num(activeModulesCount)}/${num(MODULES.length)} أقسام نشطة`
    : `${num(openTickets)} open tickets · ${num(activeModulesCount)}/${num(MODULES.length)} active modules`;

  return `
<div class="dashHero">
  <div class="dashHero-left">
    <span class="dashHero-greeting">${roleContext}</span>
    <div class="dashHero-title">${greeting}، ${esc(me.name.split('،')[0].split(' ')[0])}</div>
    <p class="dashHero-sub">${summaryText} · ${fmtDate(new Date())}</p>
    <div class="dashHero-actions">
      <button class="dashHero-action" onclick="adminNavigateTo('modules')">${ic('layers',14)} ${tr('modules')}</button>
      ${me.role==='system_admin'?`<button class="dashHero-action" onclick="adminNavigateTo('users')">${ic('users',14)} ${tr('users')}</button>`:`<button class="dashHero-action" onclick="adminNavigateTo('reports')">${ic('reports',14)} ${tr('reports')}</button>`}
    </div>
  </div>
  <div class="dashHero-right">
    <div class="dashHero-stat">
      <div class="dashHero-stat-val">${num(activeModulesCount)}/${num(MODULES.length)}</div>
      <div class="dashHero-stat-lbl">${tr('activeModules')}</div>
    </div>
    <div class="dashHero-stat">
      <div class="dashHero-stat-val">${num(activeUsersCount)}</div>
      <div class="dashHero-stat-lbl">${tr('activeUsers')}</div>
    </div>
    <div class="dashHero-stat">
      <div class="dashHero-stat-val">${num(slaPct)}%</div>
      <div class="dashHero-stat-lbl">${tr('sla')}</div>
    </div>
  </div>
</div>

<div class="kpiGrid kpiGrid--5">
  ${kpiCard(num(openTickets),tr('openTickets'),'tickets','bad')}
  ${kpiCard(`${num(activeModulesCount)}/${num(MODULES.length)}`,tr('activeModules'),'layers','brand')}
  ${kpiCard(num(activeUsersCount),tr('activeUsers'),'users','ok')}
  ${kpiCard(num(slaPct)+'%',tr('sla'),'analytics','gold')}
  ${kpiCard(num(criticalTickets),tr('criticalTickets'),'alert-triangle',criticalTickets>0?'bad':'ok')}
</div>

<div class="contentGrid">
  <div class="card">
    <div class="card-head">
      <span class="card-title">${tr('modules')}</span>
      <button class="btn secondary sm" onclick="adminNavigateTo('modules')">${tr('modules')}</button>
    </div>
    <div class="moduleGrid moduleGrid--compact">
      ${MODULES.map(m=>moduleCard(m)).join('')}
    </div>
  </div>
  <div class="card">
    <div class="card-head">
      <span class="card-title">${lang==='ar'?'النشاط الأخير':'Recent Activity'}</span>
    </div>
    ${activityFeed()}
  </div>
</div>

<div class="card">
  <div class="card-head">
    <span class="card-title">${tr('systemHealth')}</span>
  </div>
  <div class="perfStatGrid">
    <div class="perfStatRow"><span class="perfStatLabel">${tr('apiStatus')}</span><span class="badge ok">${tr('connected')}</span></div>
    <div class="perfStatRow"><span class="perfStatLabel">${tr('dbStatus')}</span><span class="badge ok">${tr('connected')}</span></div>
    <div class="perfStatRow"><span class="perfStatLabel">${tr('lastActivity')}</span><span class="perfStatValue">${lastActivityStr}</span></div>
  </div>
</div>`;
}

/* ── modules overview page ─────────────────────────────────── */
function adminModules(){
  return `
<div class="pageHeader">
  <div class="pageHeader-left">
    <div class="pageTitle">${tr('modules')}</div>
    <div class="pageSub">${num(MODULES.filter(m=>m.status==='active').length)}/${num(MODULES.length)} ${tr('moduleStatusActive')}</div>
  </div>
</div>
<div class="moduleGrid">
  ${MODULES.map(m=>moduleCard(m)).join('')}
</div>`;
}

function moduleCard(m){
  const name = lang==='ar'?m.nameAr:m.nameEn;
  const desc = lang==='ar'?m.descAr:m.descEn;
  const isActive = m.status==='active';
  const isInProgress = m.status==='in_progress';
  let stats = '';
  if(m.key==='cleaning'){
    const openTickets = (data.tickets||[]).filter(t=>!['completed','rejected','cancelled'].includes(t.status)).length;
    const cleaningUsers = (data.users||[]).filter(u=>(u.roles||[u.role]).some(r=>['cleaner','cleaning_supervisor','cleaning_manager'].includes(r))).length;
    const slaPct = Math.max(10,100-Math.min(100,openTickets*18));
    stats = `<div class="moduleCard-stats">
      <span>${num(openTickets)} ${tr('openTickets')}</span>
      <span>${num(cleaningUsers)} ${tr('usersCount')}</span>
      <span>${num(slaPct)}% ${tr('sla')}</span>
    </div>`;
  }
  const badgeCls = isActive?'ok':isInProgress?'warn':'';
  const badgeLabel = isActive?tr('moduleStatusActive'):isInProgress?tr('moduleStatusInProgress'):tr('moduleStatusPlanned');
  const note = isInProgress ? (lang==='ar'?m.noteAr:m.noteEn) : (!isActive ? tr('plannedNote') : '');
  const actionBtn = isActive
    ? `<button class="btn sm" onclick="enterModule('${m.key}')">${tr('openModule')}</button>`
    : `<button class="btn secondary sm" disabled>${tr('comingSoon')}</button>`;
  return `<div class="moduleCard">
    <div class="moduleCard-head">
      <div class="moduleCard-icon">${ic(m.icon,22)}</div>
      <span class="badge ${badgeCls}">${badgeLabel}</span>
    </div>
    <div class="moduleCard-title">${esc(name)}</div>
    <p class="moduleCard-desc">${esc(desc)}</p>
    ${stats}
    ${note?`<p class="moduleCard-note">${esc(note)}</p>`:''}
    <div class="moduleCard-action">${actionBtn}</div>
  </div>`;
}

/* ── roles & permissions (read-only) ───────────────────────── */
function adminRoles(){
  const ROLE_INFO = [
    {role:'system_admin', descAr:'صلاحية كاملة على المنصة: كل الأقسام، المستخدمون، الأدوار، الإعدادات العامة.', descEn:'Full platform access: all modules, users, roles, and global settings.'},
    {role:'facility_manager', descAr:'إدارة عامة للمرافق والمواقع وملخصات تشغيلية حسب الصلاحيات المتاحة.', descEn:'General facilities and locations management with available operational summaries.'},
    {role:'cleaning_manager', descAr:'إدارة كاملة لوحدة النظافة: البلاغات، العمال، التقارير، الأداء.', descEn:'Full management of the Cleaning Module: tickets, workers, reports, performance.'},
    {role:'cleaning_supervisor', descAr:'إشراف ميداني على بلاغات النظافة والتحقق من التقارير.', descEn:'Field supervision of cleaning tickets and report verification.'},
    {role:'cleaner', descAr:'تنفيذ مهام التنظيف المسندة ورفع التقارير بالصور.', descEn:'Performs assigned cleaning tasks and submits photo reports.'},
    {role:'employee', descAr:'تقديم طلبات نظافة وتتبع حالتها.', descEn:'Submits cleaning requests and tracks their status.'}
  ];
  return `
<div class="pageHeader">
  <div class="pageHeader-left">
    <div class="pageTitle">${tr('rolesPermissions')}</div>
    <div class="pageSub">${num(ROLE_INFO.length)} ${lang==='ar'?'أدوار':'roles'}</div>
  </div>
</div>
<div class="contentGrid">
  ${ROLE_INFO.map(r=>`<div class="card">
    <div class="card-head">
      <span class="card-title">${ic('shield',16)} ${tr(r.role)}</span>
      <span class="badge ${roleBadgeClass(r.role)}">${tr(r.role)}</span>
    </div>
    <p style="font-size:var(--fs-sm);color:var(--muted);line-height:1.7">${lang==='ar'?r.descAr:r.descEn}</p>
  </div>`).join('')}
</div>`;
}

/* ── assets / maps placeholders (planned) ──────────────────── */
function adminAssets(){
  return `
<div class="pageHeader">
  <div class="pageHeader-left">
    <div class="pageTitle">${tr('assets')}</div>
  </div>
</div>
<div class="card"><div class="empty-state">
  <div class="empty-icon">${ic('building',24)}</div>
  <div class="empty-title">${tr('noAuditData')}</div>
  <p class="empty-sub">${tr('plannedNote')}</p>
</div></div>`;
}

function adminMaps(){
  return `
<div class="pageHeader">
  <div class="pageHeader-left">
    <div class="pageTitle">${tr('maps')}</div>
  </div>
</div>
<div class="card"><div class="empty-state">
  <div class="empty-icon">${ic('map-pin',24)}</div>
  <div class="empty-title">${tr('noAuditData')}</div>
  <p class="empty-sub">${tr('plannedNote')}</p>
</div></div>`;
}

/* ── audit log (recent activity, extended) ─────────────────── */
function adminAuditLog(){
  return `
<div class="pageHeader">
  <div class="pageHeader-left">
    <div class="pageTitle">${tr('auditLog')}</div>
  </div>
</div>
<div class="card">
  <div class="card-head">
    <span class="card-title">${lang==='ar'?'النشاط الأخير':'Recent Activity'}</span>
  </div>
  ${activityFeed(20)}
</div>`;
}

/* ── global settings (read-only) ───────────────────────────── */
async function saveSlaSettings(){
  const vals = {};
  ['emergency','spill','restroom','meeting_room','general'].forEach(cat=>{
    const el = document.getElementById(`sla-${cat}`);
    if(el && el.value && Number(el.value)>0) vals[`sla_mins_${cat}`] = Number(el.value);
  });
  const res = await api('/settings',{method:'POST',body:JSON.stringify(vals)});
  if(res.settings) data.settings = res.settings;
  render();
  toast(lang==='ar'?'تم حفظ إعدادات SLA ✓':'SLA settings saved ✓');
}

function adminSettings(){
  const s = data.settings||{};
  const sla = s.slaMins||{emergency:15,spill:30,restroom:30,meeting_room:60,general:240};
  const slaLabels = {
    emergency:    lang==='ar'?'طوارئ':'Emergency',
    spill:        lang==='ar'?'انسكاب':'Spill',
    restroom:     lang==='ar'?'دورات المياه':'Restroom',
    meeting_room: lang==='ar'?'قاعة اجتماعات':'Meeting Room',
    general:      lang==='ar'?'عام':'General'
  };
  const slaIcons = {
    emergency:'alert', spill:'sync', restroom:'locations',
    meeting_room:'building', general:'list'
  };
  return `
<div class="pageHeader">
  <div class="pageHeader-left">
    <div class="pageTitle">${tr('globalSettings')}</div>
  </div>
</div>
<div class="contentGrid">
  <div class="card">
    <div class="card-head"><span class="card-title">${ic('settings',16)} ${tr('systemHealth')}</span></div>
    <div class="perfStatGrid">
      <div class="perfStatRow"><span class="perfStatLabel">${lang==='ar'?'إصدار التطبيق':'App Version'}</span><span class="perfStatValue">${esc(s.appVersion||'—')}</span></div>
      <div class="perfStatRow"><span class="perfStatLabel">${lang==='ar'?'تكرار التذكير (دقيقة)':'Reminder Frequency (min)'}</span><span class="perfStatValue">${num(s.frequencyMinutes||120)}</span></div>
      <div class="perfStatRow"><span class="perfStatLabel">${lang==='ar'?'يتطلب صورة':'Photo Required'}</span><span class="badge ${s.requirePhoto?'ok':''}">${s.requirePhoto?ic('check',12):'-'}</span></div>
      <div class="perfStatRow"><span class="perfStatLabel">${lang==='ar'?'اللغة':'Language'}</span><span class="perfStatValue">${lang==='ar'?'العربية':'English'}</span></div>
    </div>
  </div>
  <div class="card">
    <div class="card-head"><span class="card-title">${ic('clock',16)} ${lang==='ar'?'إعدادات SLA (بالدقائق)':'SLA Settings (minutes)'}</span></div>
    <p style="font-size:var(--fs-xs);color:var(--muted);margin-bottom:12px">${lang==='ar'?'الحد الأقصى للوقت المسموح به لكل نوع بلاغ قبل اعتباره متأخراً.':'Maximum response time allowed per ticket category before SLA breach.'}</p>
    <div class="formGrid-4" style="margin-bottom:14px">
      ${Object.entries(slaLabels).map(([cat,label])=>`
        <div>
          <label style="font-size:var(--fs-xs);font-weight:700;display:flex;align-items:center;gap:5px;margin-bottom:4px">${ic(slaIcons[cat]||'clock',13)} ${label}</label>
          <input id="sla-${cat}" type="number" min="1" max="1440" value="${sla[cat]||''}" class="inp" style="width:100%">
        </div>
      `).join('')}
    </div>
    <button class="btn sm" onclick="saveSlaSettings()">${ic('check',14)} ${lang==='ar'?'حفظ إعدادات SLA':'Save SLA Settings'}</button>
  </div>
  <div class="card">
    <div class="card-head"><span class="card-title">${ic('layers',16)} ${tr('modules')}</span></div>
    <div class="perfStatGrid">
      ${MODULES.map(m=>`<div class="perfStatRow">
        <span class="perfStatLabel">${esc(lang==='ar'?m.nameAr:m.nameEn)}</span>
        <span class="badge ${m.status==='active'?'ok':m.status==='in_progress'?'warn':''}">${m.status==='active'?tr('moduleStatusActive'):m.status==='in_progress'?tr('moduleStatusInProgress'):tr('moduleStatusPlanned')}</span>
      </div>`).join('')}
    </div>
  </div>
</div>`;
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
function avgNumeric(values){
  const nums = values.filter(v=>v!=null&&!Number.isNaN(Number(v))).map(Number);
  return nums.length ? nums.reduce((a,v)=>a+v,0)/nums.length : null;
}
function reportOverallRating(r){
  return avgNumeric([r.ratingSupervisor,r.ratingManager]);
}
function workerRatingScore(w){
  const rating = avgNumeric([w.avgRatingSupervisor,w.avgRatingManager]);
  return rating!=null ? rating*20 : 0;
}
function workerWeightedScore(w){
  const approval = w.approvalRate ?? 0;
  const quality = w.avgQuality ?? 0;
  const workload = Math.max(0,100-(w.workloadScore||0));
  return Math.round(approval*0.3 + quality*0.25 + workerRatingScore(w)*0.25 + workload*0.2);
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
  const attentionCount = s.pending + s.openTickets;
  const roleContext = lang==='ar'
    ? `${tr(me.role)} · مركز العمليات`
    : `${tr(me.role)} · Operations center`;
  const summaryText = lang==='ar'
    ? `${num(attentionCount)} عنصر يحتاج متابعة · ${num(s.coverage)}% تغطية اليوم`
    : `${num(attentionCount)} items need attention · ${num(s.coverage)}% coverage today`;

  return `
<div class="dashHero">
  <div class="dashHero-left">
    <span class="dashHero-greeting">${roleContext}</span>
    <div class="dashHero-title">${greeting}، ${esc(me.name.split(' ')[0])}</div>
    <p class="dashHero-sub">${summaryText} · ${fmtDate(new Date())}</p>
    <div class="dashHero-actions">
      <button class="dashHero-action" onclick="navigateTo('tickets')">${ic('tickets',14)} ${tr('tickets')}</button>
      <button class="dashHero-action" onclick="navigateTo('reports')">${ic('reports',14)} ${tr('reports')}</button>
    </div>
  </div>
  <div class="dashHero-right">
    <div class="dashHero-stat">
      <div class="dashHero-stat-val">${num(data.locations.length)}</div>
      <div class="dashHero-stat-lbl">${tr('locationsCount')}</div>
    </div>
    <div class="dashHero-stat">
      <div class="dashHero-stat-val">${num(attentionCount)}</div>
      <div class="dashHero-stat-lbl">${lang==='ar'?'تحتاج متابعة':'Attention'}</div>
    </div>
    <div class="dashHero-stat">
      <div class="dashHero-stat-val">${num(avgQ)}%</div>
      <div class="dashHero-stat-lbl">${lang==='ar'?'جودة':'Quality'}</div>
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
      <div class="kpiCard-status ${color}"></div>
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
function taskSetFor(type){return isMaintenanceRole()?MAINT_TASKS:(type==='restroom'?TASKS.restroom:TASKS.default)}
function taskDone(tasks,pair){return (tasks||[]).includes(pair[0])||(tasks||[]).includes(pair[1])}

function reports(){
  const filters = [
    {key:'new',label:tr('filterNew')},
    {key:'pending',label:tr('filterPending')},
    {key:'approved',label:tr('filterApproved')},
    {key:'rejected',label:lang==='ar'?'مرفوض':'Rejected'},
    {key:'needs_recleaning',label:tr('reclean')},
    {key:'all',label:tr('filterAll')},
  ];
  const filtered = (data.reports||[]).filter(r=>{
    if(reportFilter==='all') return true;
    if(reportFilter==='new' || reportFilter==='pending') {
      return (r.approvalStatus||'pending')==='pending_approval'||(r.approvalStatus||'pending')==='pending';
    }
    return r.approvalStatus===reportFilter;
  });
  return`
<div class="pageHeader">
  <div class="pageHeader-left">
    <div class="pageTitle">${tr('reports')}</div>
    <div class="pageSub">${num(filtered.length)} ${lang==='ar'?'تقرير':'reports'}</div>
  </div>
  <div class="pageActions reportHeaderActions">
    <button class="btn secondary sm" onclick="load()">${ic('sync',14)} ${lang==='ar'?'تحديث':'Refresh'}</button>
    ${me.role!=='cleaning_supervisor'?`<details class="exportMenu">
      <summary class="btn secondary sm">${ic('reports',14)} ${lang==='ar'?'تصدير':'Export'}</summary>
      <div class="exportMenu-list">
        <button onclick="exportExcelReports()">${ic('arrow',14)} ${lang==='ar'?'Excel':'Excel'}</button>
        <button onclick="exportPDFReports()">${ic('reports',14)} ${lang==='ar'?'PDF':'PDF'}</button>
      </div>
    </details>`:''}
  </div>
</div>
<div class="filterBar reportTabs">
  <div class="filterChips">
    ${filters.map(f=>`<button class="filterChip${reportFilter===f.key?' active':''}" onclick="reportFilter='${f.key}';render()">${f.label}</button>`).join('')}
  </div>
</div>
${filtered.length===0
  ? `<div class="card"><div class="empty-state"><div class="empty-icon">${ic('reports',28)}</div><div class="empty-title">${tr('noData')}</div></div></div>`
  : `<div class="reportGrid">${filtered.map(r=>reportCard(r,true)).join('')}</div>`}`;
}

function starRatingWidget(reportId, ratingType, current, readOnly){
  const stars = [1,2,3,4,5];
  const val = current != null ? Math.round(current) : 0;
  return `<div class="starRating" data-report="${esc(reportId)}" data-type="${esc(ratingType)}">
    ${stars.map(s=>`<button class="starBtn${s<=val?' filled':''}"${readOnly?' disabled':` onclick="submitRating('${esc(reportId)}','${esc(ratingType)}',${s})"`} title="${s}" aria-label="${s} stars">${ic('star',15)}</button>`).join('')}
    <span class="starVal">${current!=null?current.toFixed(1):tr('noRating')}</span>
  </div>`;
}

async function submitRating(reportId, ratingType, value){
  try{
    await api(maintenanceReportApi('/rate'),{method:'POST',body:JSON.stringify({id:reportId,ratingType,value})});
    toast(lang==='ar'?'تم حفظ التقييم':'Rating saved','ok');
    await load();
  }catch(e){ toast(lang==='ar'?'خطأ في التقييم':'Rating error','bad'); }
}

function reportCard(r,full){
  const imgs = imgList(r);
  const before = (r.beforePhotos||[]);
  const after  = (r.afterPhotos||[]);
  const st = r.approvalStatus||'pending_approval';
  const q = qualityScore(r);
  const rating = reportOverallRating(r);
  const tasks = taskSetFor(r.locationType);
  const totalPhotos = imgs.length;
  return`<article class="reportCard">
    <div class="reportCard-body"  style="cursor:pointer" onclick="openReportDetail('${r.id}')" role="button" tabindex="0">
      <div>
        <div class="reportCard-loc">${esc(lang==='ar'?r.locationNameAr:r.locationNameEn)}</div>
        <div class="reportCard-meta">${ic('users',12)} ${esc(r.workerName)} &nbsp;·&nbsp; ${fmt(r.createdAt)} &nbsp;·&nbsp; ${tr(r.locationType||'other')}</div>
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap">
        <span class="badge brand">${ic('camera',10)} ${num(totalPhotos)}</span>
        <span class="badge gold">${tr('quality')}: ${num(q)}%</span>
        <span class="badge ${st==='approved'?'ok':st==='rejected'||st==='needs_recleaning'?'bad':'warn'}">${tr(st)}</span>
        ${rating!=null?`<span class="badge gold">${ic('star',10)} ${rating.toFixed(1)}</span>`:''}
        <span class="badge" style="margin-inline-start:auto">${ic('arrow',11)} ${lang==='ar'?'تفاصيل':'Details'}</span>
      </div>
    </div>
    ${full&&canReview()?`
      <div class="reportCard-actions" onclick="event.stopPropagation()">
        <div class="reportCard-actions-primary">
          <button class="btn ok sm action-btn" onclick="reviewReport('${r.id}','approved')">${ic('check',13)} ${tr('approve')}</button>
        </div>
        <div class="reportCard-actions-secondary${canDelete()?'':' reportCard-actions-secondary--full'}">
          <button class="btn warn sm action-btn" onclick="reviewReport('${r.id}','needs_recleaning')">${ic('flip',13)} ${tr('reclean')}</button>
          <button class="btn danger sm action-btn" onclick="reviewReport('${r.id}','rejected')">${ic('x',13)} ${tr('reject')}</button>
        </div>
        ${canDelete()?`<div class="reportCard-actions-danger"><button class="btn secondary sm action-btn reportDeleteBtn" onclick="deleteReport('${r.id}')" aria-label="${lang==='ar'?'حذف التقرير':'Delete report'}" title="${lang==='ar'?'حذف':'Delete'}">${ic('trash',13)}</button></div>`:''}
      </div>
      <div onclick="event.stopPropagation()">
        ${['cleaning_manager','maintenance_manager'].includes(me.role)?`<div class="ratingRow">
          <div class="ratingGroup"><span class="ratingLabel">${tr('ratingByManager')}</span>${starRatingWidget(r.id,'manager',r.ratingManager)}</div>
        </div>`:['cleaning_supervisor','maintenance_supervisor'].includes(me.role)?`<div class="ratingRow">
          <div class="ratingGroup"><span class="ratingLabel">${tr('ratingBySupervisor')}</span>${starRatingWidget(r.id,'supervisor',r.ratingSupervisor)}</div>
        </div>`:me.role==='system_admin'?`<div class="ratingRow">
          <div class="ratingGroup"><span class="ratingLabel">${tr('ratingBySupervisor')}</span>${starRatingWidget(r.id,'supervisor',r.ratingSupervisor)}</div>
          <div class="ratingGroup"><span class="ratingLabel">${tr('ratingByManager')}</span>${starRatingWidget(r.id,'manager',r.ratingManager)}</div>
        </div>`:''}
      </div>`:''}
  </article>`;
}

async function reviewReport(id,status){
  await api(maintenanceReportApi('/review'),{method:'POST',body:JSON.stringify({id,status})});
  toast(tr('saved'),'ok');
  await load();
}

function canDelete(){return['system_admin','facility_manager','cleaning_manager','maintenance_manager'].includes(me.role)}

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
      sub:   esc((lang==='ar'?r.locationNameAr:r.locationNameEn)||r.locationNameAr),
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

  document.body.appendChild(panel);
  const rect = btn.getBoundingClientRect();
  const panelWidth = Math.min(320, window.innerWidth - 24);
  panel.style.width = `${panelWidth}px`;
  panel.style.top = `${Math.min(rect.bottom + 10, window.innerHeight - 80)}px`;
  const maxInset = Math.max(12, window.innerWidth - panelWidth - 12);
  if(document.documentElement.dir==='rtl'){
    panel.style.right = `${Math.min(maxInset, Math.max(12, window.innerWidth - rect.right))}px`;
    panel.style.left = 'auto';
  }else{
    panel.style.left = `${Math.min(maxInset, Math.max(12, rect.left))}px`;
    panel.style.right = 'auto';
  }
  panel.addEventListener('click', ev=>ev.stopPropagation());
  // Close on outside click
  setTimeout(()=>document.addEventListener('click',function h(){panel.remove();document.removeEventListener('click',h);}),0);
}
function goView(v){navigateTo(v);}

async function deleteReport(id){
  const msg=lang==='ar'?'هل أنت متأكد من حذف هذا التقرير؟ لا يمكن التراجع.':'Delete this report? This cannot be undone.';
  if(!confirm(msg))return;
  await api(maintenanceReportApi('/'+id),{method:'DELETE'});
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
  a.download=`mrfq-reports-${new Date().toISOString().slice(0,10)}.csv`;
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
<title>MRFQ — ${tr('reports')}</title>
<style>
  @font-face{font-family:'IBMPlexArabic';src:url('/assets/fonts/IBMPlexSansArabic-Regular.ttf') format('truetype');font-weight:400;font-display:swap}
  @font-face{font-family:'IBMPlexArabic';src:url('/assets/fonts/IBMPlexSansArabic-Bold.ttf') format('truetype');font-weight:700;font-display:swap}
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'IBMPlexArabic',Tahoma,Arial,sans-serif;padding:24px;color:#123238;direction:${dir}}
  .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px;padding-bottom:14px;border-bottom:2px solid #005257}
  .brand{font-family:'IBMPlexArabic',Tahoma,Arial,sans-serif;color:#005257;font-size:20px;font-weight:800}
  .meta{font-size:11px;color:#6F787F;margin-top:4px}
  table{width:100%;border-collapse:collapse;font-size:12px;margin-top:16px}
  th{background:#005257;color:#fff;padding:9px 10px;text-align:${lang==='ar'?'right':'left'};font-weight:700}
  td{padding:8px 10px;border-bottom:1px solid #E1E9E6;vertical-align:top}
  tr:nth-child(even) td{background:#F8FAF9}
  .ok{color:#00A488;font-weight:700} .bad{color:#DE7559;font-weight:700} .warn{color:#E69E33;font-weight:700}
  .footer{margin-top:16px;font-size:10px;color:#8A989C;text-align:center}
  .pdfActions{display:flex;gap:10px;justify-content:flex-end;align-items:center;margin-bottom:18px}
  .pdfBtn{border:1px solid #D8E6E2;background:#fff;color:#005257;border-radius:14px;padding:9px 16px;font:700 13px 'IBMPlexArabic',Tahoma,Arial,sans-serif;cursor:pointer}
  .pdfBtn.primary{background:#00848D;border-color:#00848D;color:#fff}
  @media print{body{padding:12px}.pdfActions{display:none!important}@page{margin:15mm}}
</style></head><body>
<div class="pdfActions">
  <button class="pdfBtn" onclick="window.opener&&window.opener.focus();window.close();">${lang==='ar'?'رجوع':'Back'}</button>
  <button class="pdfBtn primary" onclick="window.print()">${lang==='ar'?'طباعة PDF':'Print PDF'}</button>
</div>
<div class="header">
  <div><div class="brand">مِرفق — MRFQ</div><div class="meta">${tr('reports')} · ${fmtDate(new Date())} · ${items.length} ${lang==='ar'?'تقرير':'records'}</div></div>
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
    <td>${esc(lang==='ar'?r.locationNameAr:r.locationNameEn)}<br><small style="color:#8A989C">${tr(r.locationType||'other')}</small></td>
    <td>${qualityScore(r)}%</td>
    <td class="${cls}">${tr(st)}</td>
    <td style="white-space:nowrap">${fmt(r.createdAt)}</td>
  </tr>${r.notes?`<tr><td></td><td colspan="5" style="font-size:11px;color:#6F787F;padding-top:2px">${esc(r.notes)}</td></tr>`:''}`;
}).join('')}
</tbody></table>
<div class="footer">مِرفق — MRFQ · ${new Date().toISOString().slice(0,10)}</div>
</body></html>`;
  const w=window.open('','_blank','width=900,height=700');
  w.document.write(html);
  w.document.close();
  w.addEventListener('load',()=>w.print());
}

function openGallery(imgs,i=0){
  const box = document.createElement('div');
  box.className = 'lightbox';
  const safeImgs = (imgs||[]).filter(Boolean);
  const idx = Math.max(0,Math.min(i,safeImgs.length-1));
  box.dataset.index = idx;
  box.dataset.images = JSON.stringify(safeImgs);
  box.innerHTML=`
    <button class="lightbox-close" onclick="this.parentElement.remove()" aria-label="${tr('closeModal')}">${ic('x',22)}</button>
    ${safeImgs.length>1?`<button class="lightbox-nav prev" onclick="event.stopPropagation();galleryMove(this,-1)" aria-label="${lang==='ar'?'السابق':'Previous'}">${ic('arrow',22)}</button>`:''}
    <img src="${safeImgs[idx]||''}" alt="">
    ${safeImgs.length>1?`<button class="lightbox-nav next" onclick="event.stopPropagation();galleryMove(this,1)" aria-label="${lang==='ar'?'التالي':'Next'}">${ic('arrow',22)}</button>`:''}
    <div class="lightbox-count">${num(idx+1)} / ${num(safeImgs.length||1)}</div>`;
  box.addEventListener('click',e=>{if(e.target===box)box.remove()});
  document.body.appendChild(box);
}

function galleryMove(btn,dir){
  const box = btn.closest('.lightbox');
  if(!box) return;
  const imgs = JSON.parse(box.dataset.images||'[]');
  if(!imgs.length) return;
  const next = (Number(box.dataset.index||0)+dir+imgs.length)%imgs.length;
  box.dataset.index = next;
  const img = box.querySelector('img');
  if(img) img.src = imgs[next];
  const count = box.querySelector('.lightbox-count');
  if(count) count.textContent = `${num(next+1)} / ${num(imgs.length)}`;
}

/* ═══════════════════════════════════════════════════════════════
   TICKETS PAGE
   ═══════════════════════════════════════════════════════════════ */
function tickets(){
  const workers = (data.users||[]).filter(u=>u.role===operationalWorkerRole());
  const createLabel = isMaintenanceRole()?tr('maintTicketCreate'):tr('createTicket');
  const categories = isMaintenanceRole()
    ? MAINT_CATS.map(c=>({v:c,l:maintCatLabel(c)}))
    : [
      {v:'general',l:tr('cat_general')},{v:'spill',l:tr('cat_spill')},
      {v:'restroom',l:tr('cat_restroom')},{v:'meeting_room',l:tr('cat_meeting_room')},
      {v:'emergency',l:tr('cat_emergency')}
    ];
  return`
<div class="pageHeader">
  <div class="pageHeader-left">
    <div class="pageTitle">${tr('tickets')}</div>
    <div class="pageSub">${num((data.tickets||[]).filter(t=>!['completed','rejected','cancelled'].includes(t.status)).length)} ${lang==='ar'?'بلاغ نشط':'active tickets'}</div>
  </div>
  ${canTicket()?`<button class="btn sm" onclick="showTicketCreate=!showTicketCreate;render()">${ic('plus',14)} ${createLabel}</button>`:''}
</div>
${canTicket()&&showTicketCreate?`
<div class="card" style="margin-bottom:20px">
  <div class="card-head">
    <span class="card-title">${ic('plus',16)} ${createLabel}</span>
    <button class="icon-btn" onclick="showTicketCreate=false;render()" title="${tr('cancel')}">${ic('x',18)}</button>
  </div>
  <div class="formGrid">
    ${fc(tr('title'), inp('tt',{value:isMaintenanceRole()?(lang==='ar'?'طلب صيانة':'Maintenance Ticket'):(lang==='ar'?'بلاغ نظافة':'Cleaning Ticket')}))}
    ${fc(tr('reqCategory'), sel('tc',categories))}
    ${fc(tr('location'), sel('tl',(data.locations||[]).map(l=>({v:l.id,l:locName(l)}))))}
    ${fc(`${tr('assignedTo')} (${lang==='ar'?'اختياري':'optional'})`, sel('tw',[{v:'',l:isMaintenanceRole()?(lang==='ar'?'— تعيين لاحقاً —':'— Assign later —'):(lang==='ar'?'— تعيين تلقائي —':'— Auto-Assign —')},...workers.map(w=>({v:w.id,l:w.name}))]))}
    ${fc(tr('priority'), sel('tp',[{v:'high',l:tr('high')},{v:'medium',l:tr('medium'),sel:true},{v:'low',l:tr('low')}]))}
  </div>
  ${fc(tr('description'), ta('td','',{rows:2, placeholder:lang==='ar'?'وصف البلاغ...':'Describe the issue...'}))}

  <button class="btn" onclick="createTicket()">${ic('plus',16)} ${createLabel}</button>
</div>`:''}
${ticketCards(data.tickets||[])}`;
}

async function createTicket(){
  const assignedTo = document.getElementById('tw').value;
  await api(maintenanceTicketApi(),{method:'POST',body:JSON.stringify({
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
    ${canTicket()?`<button class="btn sm" style="margin-top:8px" onclick="showTicketCreate=true;render()">${ic('plus',14)} ${tr('createTicket')}</button>`:''}
  </div></div>`;
  return`<div class="ticketGrid">${items.map(t=>{
    const prCls = t.priority==='high'?'bad':t.priority==='low'?'info':'warn';
    const canEdit = canTicket();
    const canDel = ['system_admin','cleaning_manager','maintenance_manager'].includes(me.role);
    const catLabel = isMaintenanceRole() ? maintCatLabel(t.category||'general') : (tr('cat_'+(t.category||'general')) || (t.category||'general'));
    const catClr = t.category==='emergency'?'bad':t.category==='spill'?'warn':t.category==='meeting_room'?'brand':'';
    const statusCls = t.status==='completed'?'ok':['reclean_required','rejected','cancelled'].includes(t.status)?'bad':t.status==='waiting_verification'?'warn':'brand';
    const requesterUser = (data.users||[]).find(u=>u.id===t.createdById);
    const requesterUsername = requesterUser?.username || '';
    const requesterEmpNo = requesterUser?.employeeNo || '';
    const escalationBadge = t.escalationLevel>=2
      ? `<span class="badge bad" title="${lang==='ar'?'تصعيد المستوى 2':'Escalation Level 2'}">🔴 ${lang==='ar'?'تصعيد':'Escalated'}</span>`
      : t.escalationLevel===1
        ? `<span class="badge warn" title="${lang==='ar'?'تصعيد المستوى 1':'Escalation Level 1'}">⚠️ ${lang==='ar'?'تصعيد':'Escalated'}</span>`
        : '';
    return`<div class="ticketCard${t.escalationLevel>0?' ticketCard--escalated':''}">
      <div class="ticketCard-top">
        <div class="ticketCard-main">
          <div class="ticketCard-title">${esc(t.title)}</div>
          ${t.referenceNo?`<div class="ticketCard-ref">${esc(t.referenceNo)}</div>`:''}
        </div>
        <span class="badge ${statusCls}">${tr(t.status)||t.status}</span>
      </div>
      <div class="ticketCard-meta">
        <span>${ic('locations',12)} ${esc(lang==='ar'?t.locationNameAr:t.locationNameEn)}</span>
        <span>${ic('users',12)} ${esc(t.assignedToName||tr('unassigned'))}</span>
      </div>
      ${t.createdBy?`<div class="ticketCard-requester">${ic('user',12)} <span class="ticketCard-requester-label">${tr('requester')}:</span> <span class="ticketCard-requester-name">${esc(t.createdBy)}</span>${requesterUsername?`<span class="ticketCard-requester-username">@${esc(requesterUsername)}</span>`:''}${requesterEmpNo?`<span class="ticketCard-requester-empno">${esc(requesterEmpNo)}</span>`:''}</div>`:''}
      ${t.description?`<p class="ticketCard-desc">${esc(t.description)}</p>`:''}
      <div class="ticketCard-badges">
        ${t.category&&t.category!=='general'?`<span class="badge ${catClr}">${catLabel}</span>`:''}
        <span class="badge ${prCls}">${tr(t.priority||'medium')}</span>
        <span class="badge">${fmt(t.createdAt)}</span>
        ${slaBadge(t)}
        ${escalationBadge}
        ${!t.assignedToName?`<span class="badge warn">${tr('supervisorQueue')}</span>`:''}
        ${t.completionTimeMins!=null?`<span class="badge ok">${ic('check',11)} ${t.completionTimeMins<60?t.completionTimeMins+tr('mins'):Math.round(t.completionTimeMins/60)+tr('hours')}</span>`:''}
      </div>
      <div class="ticketCard-actions">
        <button class="btn secondary sm" onclick="openComments('${t.id}')">${ic('chat',13)} ${lang==='ar'?'تعليقات':'Comments'}</button>
        ${canEdit?`<button class="btn secondary sm" onclick="editTicketModal('${t.id}')">${ic('edit',13)} ${lang==='ar'?'تعديل':'Edit'}</button>`:''}
        ${canDel?`<button class="btn danger sm" onclick="deleteTicketConfirm('${t.id}')">${ic('trash',13)} ${lang==='ar'?'حذف':'Delete'}</button>`:''}
      </div>
    </div>`;
  }).join('')}</div>`;
}

function editTicketModal(id){
  const t=(data.tickets||[]).find(x=>x.id===id);
  if(!t) return;
  const workers=(data.users||[]).filter(u=>u.role===operationalWorkerRole());
  const statuses=['submitted','assigned','accepted','in_progress','waiting_verification','completed','reclean_required','rejected','cancelled'];
  const body=`
  <div class="formGrid">
    ${fc(tr('title'), inp('et-title',{value:t.title}))}
    ${fc(tr('priority'), sel('et-priority',[
      {v:'high',  l:tr('high'),   sel:t.priority==='high'},
      {v:'medium',l:tr('medium'), sel:t.priority==='medium'},
      {v:'low',   l:tr('low'),    sel:t.priority==='low'}
    ]))}
    ${fc(tr('status'), sel('et-status', statuses.map(s=>({v:s,l:tr(s)||s,sel:t.status===s}))))}
    ${fc(tr('assignedTo'), sel('et-worker',[{v:'',l:tr('unassigned'),sel:!t.assignedTo},...workers.map(w=>({v:w.id,l:w.name,sel:t.assignedTo===w.id}))]))}
  </div>
  ${fc(tr('description'), ta('et-desc', t.description||'', {rows:3}))}`;
  const foot=`<button class="btn" onclick="saveEditTicket('${esc(id)}')">${ic('check',16)} ${tr('save')}</button>
    <button class="btn secondary" onclick="document.getElementById('editTicketModal').remove()">${tr('cancel')}</button>`;
  showModal('editTicketModal', `${ic('edit',16)} ${lang==='ar'?'تعديل البلاغ':'Edit Ticket'}`, body, foot);
}

async function saveEditTicket(id){
  const payload={
    title:document.getElementById('et-title').value.trim(),
    description:document.getElementById('et-desc').value.trim(),
    priority:document.getElementById('et-priority').value,
    status:document.getElementById('et-status').value,
    assignedTo:document.getElementById('et-worker').value
  };
  await api(maintenanceTicketApi('/'+id),{method:'PUT',body:JSON.stringify(payload)});
  document.getElementById('editTicketModal')?.remove();
  toast(tr('saved'),'ok');
  showTicketCreate = false;
  await load();
}

async function deleteTicketConfirm(id){
  const t=(data.tickets||[]).find(x=>x.id===id);
  if(!t) return;
  const msg=lang==='ar'?`هل تريد حذف البلاغ "${t.title}"؟`:`Delete ticket "${t.title}"?`;
  if(!confirm(msg)) return;
  await api(maintenanceTicketApi('/'+id),{method:'DELETE'});
  toast(lang==='ar'?'تم حذف البلاغ':'Ticket deleted','ok');
  await load();
}

/* ═══════════════════════════════════════════════════════════════
   TICKET COMMENTS
   ═══════════════════════════════════════════════════════════════ */
let _commentsTicketId = null;

async function openComments(ticketId){
  _commentsTicketId = ticketId;
  const t = (data.tickets||[]).find(x=>x.id===ticketId);
  const title = t ? esc(t.title) : ticketId;
  showModal('commentsModal',
    `${ic('chat',16)} ${lang==='ar'?'تعليقات البلاغ':'Ticket Comments'} — ${title}`,
    `<div id="commentsList" style="min-height:60px">${lang==='ar'?'جاري التحميل...':'Loading...'}</div>
     <div style="display:flex;gap:8px;margin-top:12px">
       <input id="commentInput" class="inp" style="flex:1" placeholder="${lang==='ar'?'اكتب تعليق...':'Write a comment...'}" onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();submitComment()}">
       <button class="btn sm" onclick="submitComment()">${ic('arrow',14)} ${lang==='ar'?'إرسال':'Send'}</button>
     </div>`,
    `<button class="btn secondary" onclick="document.getElementById('commentsModal')?.remove()">${lang==='ar'?'إغلاق':'Close'}</button>`
  );
  await refreshComments();
}

async function refreshComments(){
  if(!_commentsTicketId) return;
  const res = await api('/tickets/'+_commentsTicketId+'/comments');
  const list = document.getElementById('commentsList');
  if(!list) return;
  const comments = res.comments||[];
  if(!comments.length){
    list.innerHTML=`<div class="empty-state" style="padding:16px 0"><div class="empty-icon">${ic('chat',24)}</div><div class="empty-title" style="font-size:var(--fs-sm)">${lang==='ar'?'لا توجد تعليقات بعد':'No comments yet'}</div></div>`;
    return;
  }
  const roleLabel = r => ({system_admin:lang==='ar'?'مدير النظام':'Admin',facility_manager:lang==='ar'?'مدير المرافق':'FM',cleaning_manager:lang==='ar'?'مدير النظافة':'Manager',cleaning_supervisor:lang==='ar'?'مشرف':'Supervisor',cleaner:lang==='ar'?'عامل':'Worker'}[r]||r);
  list.innerHTML = comments.map(c=>`
    <div class="commentItem${c.userId===me.id?' commentItem--mine':''}">
      <div class="commentItem-header">
        <span class="commentItem-name">${esc(c.userName)}</span>
        <span class="commentItem-role">${roleLabel(c.userRole)}</span>
        <span class="commentItem-time">${fmt(c.createdAt)}</span>
        ${(c.userId===me.id||['system_admin','facility_manager','cleaning_manager'].includes(me.role))
          ?`<button class="commentItem-del" onclick="deleteComment('${c.id}')" title="${lang==='ar'?'حذف':'Delete'}">×</button>`:''}
      </div>
      <div class="commentItem-body">${esc(c.body)}</div>
    </div>`).join('');
}

async function submitComment(){
  const input = document.getElementById('commentInput');
  if(!input||!input.value.trim()) return;
  const body = input.value.trim();
  input.value='';
  await api('/tickets/'+_commentsTicketId+'/comments',{method:'POST',body:JSON.stringify({body})});
  await refreshComments();
}

async function deleteComment(cid){
  if(!confirm(lang==='ar'?'حذف التعليق؟':'Delete comment?')) return;
  await api('/comments/'+cid,{method:'DELETE'});
  await refreshComments();
}

/* ═══════════════════════════════════════════════════════════════
   BROWSER NOTIFICATIONS (in-tab SLA breach alerts)
   ═══════════════════════════════════════════════════════════════ */
const _seenBreaches = new Set();

function requestBrowserNotif(){
  if('Notification' in window && Notification.permission==='default'){
    Notification.requestPermission();
  }
}

function checkNewBreaches(){
  if(!('Notification' in window) || Notification.permission!=='granted') return;
  (data.tickets||[]).filter(t=>t.slaBreached&&!['completed','rejected','cancelled'].includes(t.status))
    .forEach(t=>{
      if(_seenBreaches.has(t.id)) return;
      _seenBreaches.add(t.id);
      const locName = lang==='ar'?t.locationNameAr:t.locationNameEn;
      const lvl = t.escalationLevel||0;
      const prefix = lvl>=2?'🔴 ':lvl===1?'⚠️ ':'🕐 ';
      new Notification(`${prefix}${lang==='ar'?'تجاوز SLA':'SLA Breach'}`, {
        body: `${esc(t.title)} — ${esc(locName)}`,
        tag: t.id
      });
    });
}

/* ═══════════════════════════════════════════════════════════════
   RECURRING TASKS MANAGEMENT
   ═══════════════════════════════════════════════════════════════ */
let showRecurringCreate = false;

function recurringTasksPage(){
  const tasks = data.recurringTasks||[];
  const locs  = data.locations||[];
  const catLabels = {emergency:lang==='ar'?'طوارئ':'Emergency',spill:lang==='ar'?'انسكاب':'Spill',restroom:lang==='ar'?'دورة مياه':'Restroom',meeting_room:lang==='ar'?'قاعة':'Meeting Room',general:lang==='ar'?'عام':'General'};
  const freqLabel = m => m<60?m+(lang==='ar'?' دق':' min'):Math.round(m/60)+(lang==='ar'?' ساعة':' hr');
  return`
<div class="pageHeader">
  <div class="pageHeader-left">
    <div class="pageTitle">${ic('refresh',16)} ${lang==='ar'?'المهام المتكررة':'Recurring Tasks'}</div>
    <div class="pageSub">${tasks.length} ${lang==='ar'?'مهمة':'tasks'}</div>
  </div>
  <div class="pageActions">
    <button class="btn sm" onclick="showRecurringCreate=!showRecurringCreate;render()">${ic('plus',14)} ${lang==='ar'?'إضافة':'Add'}</button>
  </div>
</div>
${showRecurringCreate?`
<div class="card" style="margin-bottom:16px">
  <div class="card-head"><span class="card-title">${ic('plus',14)} ${lang==='ar'?'مهمة متكررة جديدة':'New Recurring Task'}</span></div>
  <div class="formGrid">
    ${fc(lang==='ar'?'الموقع':'Location', sel('rt-loc',[{v:'',l:lang==='ar'?'اختر موقع':'Select location',sel:true},...locs.map(l=>({v:l.id,l:locName(l),sel:false}))]))}
    ${fc(lang==='ar'?'الفئة':'Category', sel('rt-cat',[...Object.entries(catLabels).map(([v,l])=>({v,l,sel:v==='general'}))]))}
    ${fc(lang==='ar'?'عنوان المهمة':'Task Title', inp('rt-title',{placeholder:lang==='ar'?'مثال: تنظيف دوري دورة المياه':'e.g. Periodic restroom cleaning'}))}
    ${fc(lang==='ar'?'التكرار (دقيقة)':'Frequency (minutes)', inp('rt-freq',{type:'number',value:'120',min:'30',max:'10080'}))}
  </div>
  <div style="display:flex;gap:8px;margin-top:12px">
    <button class="btn sm" onclick="createRecurringTask()">${ic('check',14)} ${lang==='ar'?'إنشاء':'Create'}</button>
    <button class="btn secondary sm" onclick="showRecurringCreate=false;render()">${lang==='ar'?'إلغاء':'Cancel'}</button>
  </div>
</div>`:''}
${tasks.length?`
<div class="card">
  <div style="overflow-x:auto">
    <table class="dataTable">
      <thead><tr>
        <th>${lang==='ar'?'المهمة':'Task'}</th>
        <th>${lang==='ar'?'الموقع':'Location'}</th>
        <th>${lang==='ar'?'الفئة':'Category'}</th>
        <th>${lang==='ar'?'التكرار':'Frequency'}</th>
        <th>${lang==='ar'?'التشغيل القادم':'Next Run'}</th>
        <th>${lang==='ar'?'الحالة':'Status'}</th>
        <th></th>
      </tr></thead>
      <tbody>
        ${tasks.map(t=>`<tr class="${t.active?'':'text-muted'}">
          <td>${esc(t.titleAr)}</td>
          <td>${esc(lang==='ar'?t.locationNameAr:t.locationNameEn)}</td>
          <td><span class="badge">${catLabels[t.category]||t.category}</span></td>
          <td>${freqLabel(t.frequencyMins)}</td>
          <td style="font-size:var(--fs-xs)">${fmt(t.nextRunAt)}</td>
          <td><span class="badge ${t.active?'ok':''}">${t.active?(lang==='ar'?'نشط':'Active'):(lang==='ar'?'متوقف':'Paused')}</span></td>
          <td style="display:flex;gap:6px;justify-content:flex-end">
            <button class="btn secondary sm" onclick="toggleRecurring('${t.id}',${!t.active})">${t.active?(lang==='ar'?'إيقاف':'Pause'):(lang==='ar'?'تفعيل':'Resume')}</button>
            <button class="btn danger sm" onclick="deleteRecurring('${t.id}')">${ic('trash',13)}</button>
          </td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>
</div>`:`<div class="card"><div class="empty-state">
  <div class="empty-icon">${ic('refresh',28)}</div>
  <div class="empty-title">${lang==='ar'?'لا توجد مهام متكررة':'No recurring tasks'}</div>
  <p class="empty-sub">${lang==='ar'?'أنشئ مهاماً متكررة لتشغيل بلاغات تنظيف دورية تلقائياً.':'Create recurring tasks to auto-generate periodic cleaning tickets.'}</p>
</div></div>`}`;
}

async function createRecurringTask(){
  const locationId   = document.getElementById('rt-loc')?.value;
  const category     = document.getElementById('rt-cat')?.value;
  const titleAr      = document.getElementById('rt-title')?.value.trim();
  const frequencyMins= parseInt(document.getElementById('rt-freq')?.value,10)||120;
  if(!locationId||!titleAr) return toast(lang==='ar'?'يرجى ملء الحقول المطلوبة':'Please fill required fields','warn');
  const res = await api('/recurring-tasks',{method:'POST',body:JSON.stringify({locationId,category,titleAr,frequencyMins})});
  if(res.recurringTasks) data.recurringTasks = res.recurringTasks;
  showRecurringCreate = false;
  render();
  toast(lang==='ar'?'تم إنشاء المهمة المتكررة ✓':'Recurring task created ✓','ok');
}

async function toggleRecurring(id, active){
  const res = await api('/recurring-tasks/'+id,{method:'PATCH',body:JSON.stringify({active})});
  if(res.recurringTasks) data.recurringTasks = res.recurringTasks;
  render();
}

async function deleteRecurring(id){
  if(!confirm(lang==='ar'?'حذف المهمة المتكررة؟':'Delete recurring task?')) return;
  const res = await api('/recurring-tasks/'+id,{method:'DELETE'});
  if(res.recurringTasks) data.recurringTasks = res.recurringTasks;
  render();
  toast(lang==='ar'?'تم الحذف':'Deleted','ok');
}

/* ═══════════════════════════════════════════════════════════════
   TICKET / REPORT DETAIL MODAL
   ═══════════════════════════════════════════════════════════════ */
function _eventLabel(eventType){
  const map = {
    'ticket.created':       lang==='ar'?'تم إنشاء البلاغ':'Ticket created',
    'ticket.updated':       lang==='ar'?'تم تحديث البلاغ':'Ticket updated',
    'ticket.deleted':       lang==='ar'?'تم حذف البلاغ':'Ticket deleted',
    'report.created':       lang==='ar'?'تم إنشاء التقرير':'Report created',
    'report.approved':      lang==='ar'?'تمت الموافقة':'Approved',
    'report.rejected':      lang==='ar'?'تم الرفض':'Rejected',
    'report.reclean_required': lang==='ar'?'طلب إعادة تنظيف':'Reclean requested',
    'report.deleted':       lang==='ar'?'تم حذف التقرير':'Report deleted',
    'settings.updated':     lang==='ar'?'تم تحديث الإعدادات':'Settings updated'
  };
  return map[eventType] || eventType;
}

function _activityTimeline(ticket, events){
  const timeline = [];
  const pushTs = (ts, label, icon='circle', cls='') => {
    if(ts) timeline.push({ts, label, icon, cls});
  };
  // Synthetic events from ticket timestamps
  if(ticket.createdAt)               pushTs(ticket.createdAt, lang==='ar'?'تم إنشاء البلاغ':'Ticket created','plus','ok');
  if(ticket.acceptedAt)              pushTs(ticket.acceptedAt, lang==='ar'?'تم القبول':'Accepted','check','ok');
  if(ticket.startedAt)               pushTs(ticket.startedAt, lang==='ar'?'بدأ التنفيذ':'Started','arrow','brand');
  if(ticket.verificationRequestedAt) pushTs(ticket.verificationRequestedAt, lang==='ar'?'طلب التحقق':'Verification requested','eye','warn');
  if(ticket.completedAt)             pushTs(ticket.completedAt, lang==='ar'?'اكتمل البلاغ':'Completed','check','ok');
  if(ticket.cancelledAt)             pushTs(ticket.cancelledAt, lang==='ar'?'تم الإلغاء':'Cancelled','x','bad');
  if(ticket.slaBreached && ticket.slaDeadline) pushTs(ticket.slaDeadline, lang==='ar'?'تجاوز SLA':'SLA Breached','clock','bad');
  if(ticket.escalatedAt)             pushTs(ticket.escalatedAt, (lang==='ar'?'تصعيد المستوى ':'Escalated L')+ticket.escalationLevel,'alert','bad');
  // Server events (may include actor names)
  for(const e of events){
    timeline.push({ts:e.createdAt, label:`${_eventLabel(e.eventType)}${e.actorName?' — '+e.actorName:''}`, icon:'list', cls:''});
  }
  timeline.sort((a,b)=>a.ts.localeCompare(b.ts));
  if(!timeline.length) return `<div style="color:var(--muted);font-size:var(--fs-xs);padding:8px 0">${lang==='ar'?'لا يوجد نشاط مسجل':'No activity recorded'}</div>`;
  return timeline.map(e=>`
    <div class="activityItem">
      <div class="activityItem-dot ${e.cls}">${ic(e.icon,11)}</div>
      <div class="activityItem-content">
        <span class="activityItem-label">${esc(e.label)}</span>
        <span class="activityItem-time">${fmtFull(e.ts)}</span>
      </div>
    </div>`).join('');
}

function _reportActivityTimeline(report, events){
  const timeline = [];
  if(report.createdAt)  timeline.push({ts:report.createdAt, label:(lang==='ar'?'تم رفع التقرير':'Report submitted')+(report.workerName?' — '+report.workerName:''), cls:'ok'});
  if(report.approvedAt) timeline.push({ts:report.approvedAt, label:`${_eventLabel('report.'+report.approvalStatus)} — ${report.approvedBy||''}`, cls:report.approvalStatus==='approved'?'ok':'bad'});
  for(const e of events){
    timeline.push({ts:e.createdAt, label:`${_eventLabel(e.eventType)}${e.actorName?' — '+e.actorName:''}`, cls:''});
  }
  timeline.sort((a,b)=>a.ts.localeCompare(b.ts));
  if(!timeline.length) return `<div style="color:var(--muted);font-size:var(--fs-xs);padding:8px 0">${lang==='ar'?'لا يوجد نشاط':'No activity'}</div>`;
  return timeline.map(e=>`
    <div class="activityItem">
      <div class="activityItem-dot ${e.cls||''}">${ic('circle',11)}</div>
      <div class="activityItem-content">
        <span class="activityItem-label">${esc(e.label)}</span>
        <span class="activityItem-time">${fmtFull(e.ts)}</span>
      </div>
    </div>`).join('');
}

function fmtFull(ts){
  if(!ts) return '';
  try{return new Date(ts).toLocaleString(lang==='ar'?'ar-SA':'en-US',{year:'numeric',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'});}catch{return ts;}
}

async function openTicketDetail(id){
  const t = (data.tickets||[]).find(x=>x.id===id);
  if(!t) return;
  const catLabel = tr('cat_'+(t.category||'general')) || (t.category||'general');
  const statusCls = t.status==='completed'?'ok':['rejected','cancelled'].includes(t.status)?'bad':t.status==='waiting_verification'?'warn':'brand';
  const prCls = t.priority==='high'?'bad':t.priority==='low'?'info':'warn';
  const body = `
  <div class="detailModal">
    <div class="detailModal-section">
      <div class="detailModal-grid2">
        <div><span class="detailLabel">${lang==='ar'?'الموقع':'Location'}</span><span class="detailVal">${ic('locations',12)} ${esc(lang==='ar'?t.locationNameAr:t.locationNameEn)}</span></div>
        <div><span class="detailLabel">${lang==='ar'?'الحالة':'Status'}</span><span class="badge ${statusCls}">${tr(t.status)||t.status}</span></div>
        <div><span class="detailLabel">${lang==='ar'?'المسند إليه':'Assigned'}</span><span class="detailVal">${ic('users',12)} ${esc(t.assignedToName||tr('unassigned'))}</span></div>
        <div><span class="detailLabel">${lang==='ar'?'الأولوية':'Priority'}</span><span class="badge ${prCls}">${tr(t.priority||'medium')}</span></div>
        <div><span class="detailLabel">${lang==='ar'?'الفئة':'Category'}</span><span class="badge">${catLabel}</span></div>
        <div><span class="detailLabel">${lang==='ar'?'الرقم المرجعي':'Reference'}</span><span class="detailVal ltr">${esc(t.referenceNo||'—')}</span></div>
        ${t.createdBy?`<div><span class="detailLabel">${tr('requester')}</span><span class="detailVal">${esc(t.createdBy)}</span></div>`:''}
        ${t.slaDeadline?`<div><span class="detailLabel">SLA</span><span class="detailVal ${t.slaBreached?'bad':''}">${fmtFull(t.slaDeadline)}${t.slaBreached?' ⚠️':''}</span></div>`:''}
      </div>
      ${t.description?`<div class="detailModal-notes">${esc(t.description)}</div>`:''}
    </div>
    ${t.photos&&t.photos.length?`
    <div class="detailModal-section">
      <div class="detailModal-sectionTitle">${ic('camera',14)} ${lang==='ar'?'الصور':'Photos'} <span class="badge brand">${t.photos.length}</span></div>
      <div class="detailModal-photos">
        ${t.photos.map((src,i)=>`<img src="${src}" class="detailModal-photo" loading="lazy" onclick='openGallery(${JSON.stringify(t.photos)},${i})' alt="">`).join('')}
      </div>
    </div>`:
    `<div class="detailModal-section"><div class="detailModal-sectionTitle">${ic('camera',14)} ${lang==='ar'?'الصور':'Photos'}</div><div style="color:var(--muted);font-size:var(--fs-xs);padding:4px 0">${lang==='ar'?'لا توجد صور':'No photos'}</div></div>`}
    <div class="detailModal-section" id="detail-activity-${id}">
      <div class="detailModal-sectionTitle">${ic('list',14)} ${lang==='ar'?'النشاط':'Activity'}</div>
      <div class="activityTimeline" id="activity-list-${id}"><div style="color:var(--muted);font-size:var(--fs-xs)">${lang==='ar'?'جاري التحميل...':'Loading...'}</div></div>
    </div>
  </div>`;
  showModal('ticketDetailModal', `${ic('tickets',16)} ${esc(t.title)}`, body, `
    <button class="btn secondary sm" onclick="openComments('${t.id}')">${ic('chat',14)} ${lang==='ar'?'تعليقات':'Comments'}</button>
    <button class="btn secondary" onclick="document.getElementById('ticketDetailModal')?.remove()">${lang==='ar'?'إغلاق':'Close'}</button>`, {wide:true});
  // Fetch activity in background
  api('/tickets/'+id+'/activity').then(res=>{
    const el = document.getElementById('activity-list-'+id);
    if(el) el.innerHTML = _activityTimeline(t, res.events||[]);
  }).catch(()=>{});
}

async function openReportDetail(id){
  const r = (data.reports||[]).find(x=>x.id===id);
  if(!r) return;
  const before = r.beforePhotos||[];
  const after  = r.afterPhotos||[];
  const allImgs = imgList(r);
  const hasTyped = before.length||after.length;
  const tasks = taskSetFor(r.locationType);
  const st = r.approvalStatus||'pending';
  const stCls = st==='approved'?'ok':st==='rejected'||st==='needs_recleaning'?'bad':'warn';
  const body = `
  <div class="detailModal">
    <div class="detailModal-section">
      <div class="detailModal-grid2">
        <div><span class="detailLabel">${lang==='ar'?'الموقع':'Location'}</span><span class="detailVal">${esc(lang==='ar'?r.locationNameAr:r.locationNameEn)}</span></div>
        <div><span class="detailLabel">${lang==='ar'?'العامل':'Worker'}</span><span class="detailVal">${ic('users',12)} ${esc(r.workerName)}</span></div>
        <div><span class="detailLabel">${lang==='ar'?'الحالة':'Status'}</span><span class="badge ${stCls}">${tr(st)}</span></div>
        <div><span class="detailLabel">${lang==='ar'?'التاريخ':'Date'}</span><span class="detailVal">${fmtFull(r.createdAt)}</span></div>
        ${r.approvedBy?`<div><span class="detailLabel">${lang==='ar'?'راجعه':'Reviewed by'}</span><span class="detailVal">${esc(r.approvedBy)}</span></div>`:''}
        ${r.reviewNote?`<div><span class="detailLabel">${lang==='ar'?'ملاحظة المراجع':'Review note'}</span><span class="detailVal">${esc(r.reviewNote)}</span></div>`:''}
      </div>
      ${r.notes?`<div class="detailModal-notes">${esc(r.notes)}</div>`:''}
    </div>
    ${tasks.length?`
    <div class="detailModal-section">
      <div class="detailModal-sectionTitle">${ic('check',14)} ${lang==='ar'?'المهام':'Tasks'}</div>
      <div class="reportCard-tasks" style="margin-top:8px">
        ${tasks.map(p=>{const ok=taskDone(r.tasks,p);return`<div class="taskResult ${ok?'done':'missing'}"><span>${esc(lang==='ar'?p[0]:p[1])}</span><span class="taskMark">${ok?'✓':'×'}</span></div>`}).join('')}
      </div>
    </div>`:''}
    <div class="detailModal-section">
      <div class="detailModal-sectionTitle">${ic('camera',14)} ${lang==='ar'?'الصور':'Photos'} <span class="badge brand">${allImgs.length}</span></div>
      ${allImgs.length?`
      <div class="${hasTyped?'detailModal-photos-split':'detailModal-photos'}">
        ${hasTyped?`
          ${before.length?`<div><div class="photoGroup-label" style="margin-bottom:6px">${ic('camera',12)} ${tr('beforePhotos')}</div><div class="detailModal-photos">${before.map((src,i)=>`<img src="${src}" class="detailModal-photo" loading="lazy" onclick='openGallery(${JSON.stringify(before)},${i})' alt="">`).join('')}</div></div>`:''}
          ${after.length?`<div><div class="photoGroup-label ok" style="margin-bottom:6px">${ic('check',12)} ${tr('afterPhotos')}</div><div class="detailModal-photos">${after.map((src,i)=>`<img src="${src}" class="detailModal-photo" loading="lazy" onclick='openGallery(${JSON.stringify(after)},${i})' alt="">`).join('')}</div></div>`:''}
        `:allImgs.map((src,i)=>`<img src="${src}" class="detailModal-photo" loading="lazy" onclick='openGallery(${JSON.stringify(allImgs)},${i})' alt="">`).join('')}
      </div>`:
      `<div style="color:var(--muted);font-size:var(--fs-xs);padding:4px 0">${lang==='ar'?'لا توجد صور':'No photos'}</div>`}
    </div>
    <div class="detailModal-section">
      <div class="detailModal-sectionTitle">${ic('list',14)} ${lang==='ar'?'النشاط':'Activity'}</div>
      <div class="activityTimeline" id="report-activity-list-${id}"><div style="color:var(--muted);font-size:var(--fs-xs)">${lang==='ar'?'جاري التحميل...':'Loading...'}</div></div>
    </div>
  </div>`;
  showModal('reportDetailModal', `${ic('reports',16)} ${esc(lang==='ar'?r.locationNameAr:r.locationNameEn)} — ${esc(r.workerName)}`, body, `<button class="btn secondary" onclick="document.getElementById('reportDetailModal')?.remove()">${lang==='ar'?'إغلاق':'Close'}</button>`, {wide:true});
  api('/reports/'+id+'/activity').then(res=>{
    const el = document.getElementById('report-activity-list-'+id);
    if(el) el.innerHTML = _reportActivityTimeline(r, res.events||[]);
  }).catch(()=>{});
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
    ${canManage()?`<button class="btn sm" onclick="showLocCreate=!showLocCreate;render()">${ic('plus',14)} ${lang==='ar'?'إضافة مرفق':'Add Facility'}</button>`:''}
    <button class="btn secondary sm" onclick="window.print()">${ic('qr',14)} ${tr('printQR')}</button>
  </div>
</div>
${canManage()?`
<div class="card locationsZonesCard">
  <div class="card-head">
    <span class="card-title">${ic('locations',16)} ${lang==='ar'?'إدارة المناطق':'Zones'}</span>
    <button class="btn secondary sm" onclick="showZoneCreate=!showZoneCreate;render()">${ic('plus',13)} ${lang==='ar'?'منطقة':'Zone'}</button>
  </div>
  <div class="zone-chips">
    ${(data.zones||[]).map(z=>`<span class="zone-chip">${esc(z)}<button class="zone-del" onclick="deleteZone('${esc(z)}')" title="${lang==='ar'?'حذف':'Delete'}">×</button></span>`).join('')}
    ${showZoneCreate?`
    <div class="zone-add">
      ${inp('new-zone',{placeholder:lang==='ar'?'منطقة جديدة':'New zone'})}
      <button class="btn sm" onclick="addZone()">${ic('plus',14)} ${lang==='ar'?'إضافة':'Add'}</button>
    </div>
    `:''}
  </div>
</div>
${showLocCreate?`
<div class="card" style="margin-bottom:20px">
  <div class="card-head">
    <span class="card-title">${ic('plus',16)} ${lang==='ar'?'إضافة مرفق':'Add Facility'}</span>
    <button class="icon-btn" onclick="showLocCreate=false;render()" title="${tr('cancel')}">${ic('x',18)}</button>
  </div>
  <div class="formGrid-4">
    ${fc('ID', inp('lid',{cls:'ltr', placeholder:'office-01-a'}))}
    ${fc(tr('type'), sel('ltype', TYPES.map(t=>({v:t,l:tr(t)}))))}
    ${fc(lang==='ar'?'الاسم العربي':'Arabic Name', inp('lar',{placeholder:'الاسم العربي'}))}
    ${fc(lang==='ar'?'الاسم الإنجليزي':'English Name', inp('len',{cls:'ltr', placeholder:'English name'}))}
    ${fc(tr('floor'), sel('lf', FACILITY_FLOORS.map(f=>({v:f,l:f}))))}
    ${fc(tr('zone'), sel('lz', FACILITY_ZONES.map(z=>({v:z,l:z}))))}
    ${fc(tr('priority'), sel('lpri',[{v:'high',l:tr('high')},{v:'medium',l:tr('medium'),sel:true},{v:'low',l:tr('low')}]))}
    <div class="field" style="align-self:flex-end"><button class="btn wide" onclick="addLoc()">${ic('plus',16)} ${tr('save')}</button></div>
  </div>
</div>`:''}`:''}
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
    const locQrPayload = `${location.origin}${location.pathname}?loc=${encodeURIComponent(l.id)}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(locQrPayload)}`;
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
          <div class="locCard-qr" style="margin-top:8px;display:flex;flex-direction:column;align-items:flex-start;gap:8px">
            <img width="120" height="120" src="${qrUrl}" alt="QR ${esc(l.id)}" loading="lazy">
            <a class="btn secondary sm" href="${qrUrl}&format=png" download="QR-${esc(l.id)}.png" style="text-decoration:none">${ic('download',13)} ${lang==='ar'?'تحميل QR':'Download QR'}</a>
          </div>
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
  showLocCreate = false;
  await load();
}

async function addZone(){
  const v=(document.getElementById('new-zone')||{}).value?.trim();
  if(!v) return;
  await api('/zones',{method:'POST',body:JSON.stringify({zone:v})});
  showZoneCreate = false;
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
    ${sel('aw', workers.map(w=>({v:w.id,l:`${w.name} - ${w.username}`})), {onchange:'fillAssign()'})}
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
      <label class="assignItem${assignFloorFilter!=='all'&&(l.floor||'')!==assignFloorFilter?' is-hidden':''}" data-floor="${esc(l.floor||'')}">
        <input class="asgCheck" type="checkbox" value="${l.id}">
        <div class="assignItem-body">
          <div class="assignItem-label">${esc(locName(l))}</div>
          <div class="assignItem-id">${esc(l.id)}</div>
          <span class="badge">${tr(l.type)}</span>
        </div>
      </label>`).join('')}
  </div>
  <div class="assignActions">
    <button class="btn" onclick="saveAssign()">${ic('check',16)} ${tr('save')}</button>
  </div>
</div>`;
}

function filterAssignFloor(floor){
  assignFloorFilter = floor;
  // show/hide items in-place — checkboxes keep their checked state
  document.querySelectorAll('.assignItem[data-floor]').forEach(el=>{
    el.classList.toggle('is-hidden', !(floor==='all' || el.dataset.floor===floor));
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
  const cleaningTeamRoles = ['cleaning_manager','cleaning_supervisor','cleaner'];
  const maintenanceTeamRoles = ['maintenance_manager','maintenance_supervisor','maintenance_worker'];
  const isCleaningTeam = canViewCleaningTeam();
  const isMaintenanceTeam = me.role==='maintenance_manager';
  const teamRoles = isMaintenanceTeam ? maintenanceTeamRoles : cleaningTeamRoles;
  const allUsers = (isCleaningTeam||isMaintenanceTeam) ? (data.users||[]).filter(u=>teamRoles.includes(u.role)) : (data.users||[]);
  const roleOptions = (isCleaningTeam||isMaintenanceTeam) ? teamRoles : ROLES;
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
    <div class="pageTitle">${isMaintenanceTeam?tr('maintTeam'):isCleaningTeam?tr('cleaningTeam'):tr('users')}</div>
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
  ${inp('usersSearch',{type:'search', placeholder:lang==='ar'?'بحث...':'Search users...', value:usersSearch, oninput:'usersSearch=this.value;render()'})}
  <div class="usersFilterBar-sep"></div>
  ${sel('usersRoleFilter', [{v:'all',l:lang==='ar'?'كل الصلاحيات':'All Roles',sel:usersRoleFilter==='all'},...roleOptions.map(r=>({v:r,l:tr(r),sel:usersRoleFilter===r}))], {onchange:'usersRoleFilter=this.value;render()'})}
  ${sel('usersStatusFilter', [
    {v:'all',l:lang==='ar'?'كل الحالات':'All Status',sel:usersStatusFilter==='all'},
    {v:'active',l:tr('activeUser'),sel:usersStatusFilter==='active'},
    {v:'inactive',l:tr('inactive'),sel:usersStatusFilter==='inactive'}
  ], {onchange:'usersStatusFilter=this.value;render()'})}
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
              ${extraRoles.length?`<span class="badge">+${num(extraRoles.length)}</span>`:''}
            </div>
          </td>
          ${canEdit?`<td>
            <div class="usersTable-actions">
              <button class="btn secondary sm rolesActionBtn" onclick="showAddRoleModal('${u.id}')" title="${lang==='ar'?'إدارة الصلاحيات':'Manage Roles'}">${ic('shield',13)} <span>${lang==='ar'?'الصلاحيات':'Roles'}</span></button>
              <button class="btn secondary sm iconOnlyBtn" onclick="showUserFormModal('${u.id}')" title="${lang==='ar'?'تعديل':'Edit'}">${ic('edit',13)}</button>
              ${me.role==='system_admin'?`<button class="btn secondary sm iconOnlyBtn" onclick="showPasswordResetModal('${u.id}')" title="${tr('resetPassword')}">${ic('lock',13)}</button>`:''}
              ${canDel?`<button class="btn danger sm iconOnlyBtn" onclick="deleteUserConfirm('${u.id}')" title="${lang==='ar'?'حذف':'Delete'}">${ic('trash',13)}</button>`:''}
            </div>
          </td>`:''}
        </tr>`;
      }).join('')}
    </tbody>
  </table>
</div>`}`;
}

function showUserFormModal(id){
  const editableRoles = me.role==='system_admin'?ROLES:me.role==='maintenance_manager'?['maintenance_supervisor','maintenance_worker']:['cleaning_supervisor','cleaner'];
  const u = id?(data.users||[]).find(x=>x.id===id):null;
  editUserId = id||null;
  const titleHtml = `<div>${u?`${ic('edit',16)} ${tr('edit')}`:ic('plus',16)+' '+tr('addUser')}${['cleaning_manager','maintenance_manager'].includes(me.role)?`<div class="modal-subtitle">${lang==='ar'?'تدير العمال والمشرفين':'Manages workers & supervisors'}</div>`:''}</div>`;
  const body=`
  <div class="formGrid">
    ${fc(tr('name'),    inp('un',{value:u?.name||''}))}
    ${fc(tr('username'),inp('uu',{value:u?.username||'', cls:'ltr'}))}
    ${fc(tr('password'),inp('up',{type:'password', placeholder:'••••••••', cls:'ltr'}))}
    ${fc(tr('role'),    sel('ur', editableRoles.map(r=>({v:r,l:tr(r),sel:u?.role===r}))))}
    ${fc(tr('employeeNo'),inp('ue',{value:u?.employeeNo||'', cls:'ltr'}))}
    ${fc(tr('status'),  sel('ua',[{v:'true',l:tr('activeUser'),sel:u?.active},{v:'false',l:tr('inactive'),sel:u&&!u.active}]))}
  </div>`;
  const foot=`<button class="btn" onclick="saveUser()">${ic('check',16)} ${tr('save')}</button>
    <button class="btn secondary" onclick="hideUserFormModal()">${tr('cancel')}</button>`;
  const el = showModal('userFormModal', titleHtml, body, foot);
  el.addEventListener('click',e=>{if(e.target===el)hideUserFormModal();});
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

function showPasswordResetModal(userId){
  const u=(data.users||[]).find(x=>x.id===userId);
  if(!u) return;
  resetPasswordUserId = userId;
  const titleHtml = `<div>${ic('lock',16)} ${tr('resetPassword')}<div class="modal-subtitle">${esc(u.name)} · ${esc(u.username)}</div></div>`;
  const body=`
  <div class="formGrid">
    ${fc(tr('newPassword'),    inp('rpNew',{type:'password', placeholder:'••••••••', cls:'ltr'}))}
    ${fc(tr('confirmPassword'),inp('rpConfirm',{type:'password', placeholder:'••••••••', cls:'ltr'}))}
  </div>`;
  const foot=`<button class="btn" onclick="savePasswordReset()">${ic('check',16)} ${tr('save')}</button>
    <button class="btn secondary" onclick="hidePasswordResetModal()">${tr('cancel')}</button>`;
  const el = showModal('passwordResetModal', titleHtml, body, foot);
  el.addEventListener('click',e=>{if(e.target===el)hidePasswordResetModal();});
}

function hidePasswordResetModal(){
  resetPasswordUserId = null;
  document.getElementById('passwordResetModal')?.remove();
}

async function savePasswordReset(){
  const pwd = document.getElementById('rpNew').value;
  const confirm = document.getElementById('rpConfirm').value;
  if(pwd.length<8) return toast(tr('weakPasswordMsg'),'bad');
  if(pwd!==confirm) return toast(tr('passwordMismatch'),'bad');
  try{
    await api(`/users/${resetPasswordUserId}/password`,{method:'PATCH',body:JSON.stringify({password:pwd})});
    toast(tr('passwordResetSuccess'),'ok');
    hidePasswordResetModal();
    await load();
  }catch(e){
    const msg = e.message==='WEAK_PASSWORD' ? tr('weakPasswordMsg') : (lang==='ar'?'حدث خطأ، حاول مرة أخرى':'Error, please try again');
    toast(msg,'bad');
  }
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
    system_admin:       {bg:'var(--bg-soft)', color:'var(--mrfq-navy)'},
    facility_manager:   {bg:'var(--bg-soft)', color:'var(--mrfq-dark-teal)'},
    cleaning_manager:   {bg:'rgba(111,79,152,.12)', color:'var(--mrfq-purple)'},
    cleaning_supervisor:{bg:'rgba(0,132,141,.12)', color:'var(--mrfq-teal)'},
    cleaner:            {bg:'var(--ok-bg)', color:'var(--ok)'},
    employee:           {bg:'rgba(117,206,200,.16)', color:'var(--mrfq-dark-teal)'},
    hospitality_manager:   {bg:'rgba(111,79,152,.12)', color:'var(--mrfq-purple)'},
    hospitality_supervisor:{bg:'rgba(0,132,141,.12)', color:'var(--mrfq-teal)'},
    hospitality_worker:    {bg:'var(--ok-bg)', color:'var(--ok)'}
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

  const titleHtml = `<div><div class="modal-title">${tr('rolesLabel')}</div><div class="modal-subtitle">${esc(u.name)}</div></div>`;
  const foot = `<button class="btn secondary" onclick="document.getElementById('rolesModal').remove()">${tr('cancel')}</button>`;
  showModal('rolesModal', titleHtml, `<div class="roles-grid" id="rolesGrid">${buildRoleCards()}</div>`, foot, {narrow:true});

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
  if(!raw) return '';

  // Full URL support: ...?loc=wc-gf-a, ...?location=wc-gf-a, ...?code=wc-gf-a.
  // A plain app URL is not a location code and should not be written back into the field.
  try{
    const u = new URL(raw);
    const param = u.searchParams.get('loc') || u.searchParams.get('location') || u.searchParams.get('code');
    if(param) return String(decodeURIComponent(param)).trim();
    const last = u.pathname.split('/').filter(Boolean).pop();
    if(last && !/\.(html?|php|aspx?)$/i.test(last)) return String(decodeURIComponent(last)).trim();
    return '';
  }catch(e){
    // Direct code support or string with ?loc= somewhere inside
    const m = raw.match(/[?&](?:loc|location|code)=([^&#]+)/);
    if(m && m[1]) return String(decodeURIComponent(m[1])).trim();
    return raw.replace(/^loc:/i,'').replace(/^location:/i,'').trim();
  }
}

function isLikelyUrl(raw){
  return /^https?:\/\//i.test(String(raw||'').trim());
}

function invalidLocationToast(raw){
  const msg = isLikelyUrl(raw)
    ? (lang==='ar'?'رمز QR أو الرابط لا يحتوي على كود موقع صالح':'The QR code or link does not contain a valid location code')
    : (lang==='ar'?'أدخل كود الموقع أو امسح QR':'Enter location code or scan QR');
  toast(msg,'bad');
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
  const myReports=(data.reports||[]).filter(r=>r.workerId===me.id).slice(0,12);

  const ticketsBlock = myTickets.length?`
    ${myTickets.length?`
    <div class="wCard">
      <div class="wCard-title">${ic('tickets',16)} ${tr('myTickets')}</div>
      <div class="wCard-list">
        ${myTickets.map(t=>`
          <button class="workerTicketItem" onclick="startTicketWorker('${t.id}')">
            <div class="workerTicketItem-title">${esc(t.title)}</div>
            <div class="workerTicketItem-loc">${esc(lang==='ar'?t.locationNameAr:t.locationNameEn)}</div>
          </button>`).join('')}
      </div>
    </div>`:''}`:'';

  const reportsBlock = `
      <div class="wCard">
        <div class="wCard-title">${ic('reports',16)} ${lang==='ar'?'حالة تقاريري':'My Reports Status'}</div>
        ${myReports.length?`
        <div class="wCard-list">
          ${myReports.map(r=>{
            const st=r.approvalStatus||'pending';
            const stLabel={pending:lang==='ar'?'معلق':'Pending',approved:lang==='ar'?'معتمد':'Approved',rejected:lang==='ar'?'مرفوض':'Rejected',needs_recleaning:lang==='ar'?'إعادة تنظيف':'Re-clean'}[st]||st;
            const stColor=st==='approved'?'ok':st==='rejected'?'bad':st==='needs_recleaning'?'warn':'brand';
            const actionable=st==='rejected'||st==='needs_recleaning';
            const borderClr=actionable?'rgba(200,50,50,.25)':'var(--line)';
            const iconBorderClr=stColor==='ok'?'var(--ok)':stColor==='bad'?'var(--bad)':'var(--warn)';
            return `<div class="workerReportItem ${actionable?'actionable':''}" ${actionable?`onclick="workerStartLocation('${r.locationId}')"`:''}
              style="border-color:${borderClr};background:var(--${stColor}-bg)">
              <div class="workerReportItem-icon" style="background:var(--${stColor}-bg);border-color:${iconBorderClr}">${ic(st==='approved'?'check':st==='rejected'?'x':'flip',16)}</div>
              <div class="workerReportItem-body">
                <div class="workerReportItem-name">${esc(lang==='ar'?r.locationNameAr:r.locationNameEn)}</div>
                <div class="workerReportItem-meta">${fmt(r.approvedAt||r.createdAt)}${r.reviewNote?' · '+esc(r.reviewNote):''}</div>
                <span class="badge ${stColor}" style="margin-top:6px">${stLabel}</span>
              </div>
              ${actionable?`<div class="workerReportItem-action" style="color:var(--${stColor})">${lang==='ar'?'إعادة':'Redo'} ${ic('arrow',14)}</div>`:''}
            </div>`;
          }).join('')}
        </div>`:`<div class="empty-state"><div class="empty-icon">${ic('reports',24)}</div><div class="empty-title">${lang==='ar'?'لا توجد تقارير':'No reports yet'}</div></div>`}
      </div>`;

  const startBlock = `
    <div class="wCard wCard--compact">
      <div class="wCard-title">${ic('locations',16)} ${tr('step1')}</div>
      ${fc(lang==='ar'?'كود الموقع':'Location Code',`<div class="locInput-row"><button class="locInput-scan" onclick="openQRScanner()" title="${tr('scanQR')}" aria-label="${tr('scanQR')}">${ic('qr',18)}</button><div class="locInput-field">${inp('locCode',{cls:'ltr', value:param, placeholder:'wc-gf-a'})}</div></div>`)}
      <button class="btn wide" style="min-height:52px" onclick="startForm()">${ic('arrow',16)} ${tr('start')}</button>
    </div>
    <div id="workerForm"></div>`;

  const assignedBlock = `<div class="wCard">
    <div class="wCard-title">${ic('locations',16)} ${tr('assigned')} <span class="badge brand">${locs.length}</span></div>
    ${locs.length?`
    <div class="assignedList">
      ${locs.map(l=>`
        <button class="assignedItem" onclick="workerStartLocation('${l.id}')">
          <div><div class="assignedItem-name">${esc(locName(l))}</div><div class="assignedItem-sub">${tr(l.type)} · ${l.floor||'—'} · ${l.id}</div></div>
          <span>${ic('arrow',16)}</span>
        </button>`).join('')}
    </div>`:`<div class="empty-state"><div class="empty-icon">${ic('locations',24)}</div><div class="empty-title">${tr('notAssigned')}</div></div>`}
  </div>`;

  const workerContent = workerView==='reports'
    ? reportsBlock
    : workerView==='assigned'
      ? assignedBlock
      : `${ticketsBlock}${startBlock}`;

  app.innerHTML = fieldShell(me, workerContent, {sync:true});
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
    setTopbarBackButton(false);
    window.scrollTo({top:0,behavior:'smooth'});
    return;
  }
  workerView='task';
  renderWorker();
}
function startTicketWorker(id){
  const t = (data.tickets||[]).find(x=>x.id===id);
  if(!t) return;
  workerStartLocation(t.locationId, id);
}

function workerStartLocation(locationId, ticketId=''){
  workerView='task';
  currentTicketId = ticketId || null;
  renderWorker();
  setTimeout(()=>{
    const el = document.getElementById('locCode');
    if(el){el.value=locationId;startForm()}
  },0);
}

function startForm(){
  const locCode = document.getElementById('locCode');
  if(!locCode) return;
  const raw = locCode.value;
  const id = parseLoc(raw);
  if(!id) return invalidLocationToast(raw);
  locCode.value = id;
  const loc = (data.locations||[]).find(l=>l.id===id);
  if(!loc){
    toast(lang==='ar'?`الموقع "${id}" غير موجود في النظام`:`Location "${id}" not found in system`,'bad');
    return;
  }
  const asg = (data.assignments||[]).find(a=>a.workerId===me.id);
  if(asg&&asg.locationIds.length&&!asg.locationIds.includes(id)) return toast(tr('notAssigned'),'bad');
  currentBeforePhotos = []; currentAfterPhotos = [];
  const tasks = taskSetFor(loc.type);
  setTopbarBackButton(true, 'workerGoBack()');
  document.getElementById('workerForm').innerHTML=`
    <div class="wCard">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:16px">
        <div>
          <div style="font-family:var(--font-head);font-size:var(--fs-lg);font-weight:800;color:var(--ink);line-height:1.35">${esc(locName(loc))}</div>
          <div style="font-size:var(--fs-xs);color:var(--muted);margin-top:4px">${ic('locations',12)} ${tr(loc.type)} · ${loc.floor||'—'} · ${loc.id}</div>
        </div>
        <span class="badge brand">${tr('autoTime')}</span>
      </div>
      ${fc(tr('status'), sel('wkStatus', [
        {v:'completed',l:tr('completed')},
        {v:'needs_followup',l:tr('needs_followup')}
      ]), {cls:'field-spaced'})}
    </div>

    <div class="wCard">
      <div class="wCard-title">${ic('camera',16)} ${tr('beforePhotos')}</div>
      <p style="font-size:var(--fs-xs);color:var(--muted);margin-bottom:12px">${tr('beforePhotoHint')}</p>
      <button class="cameraBtn" onclick="openCamera('before')">
        ${ic('camera',22)}
        <span>${tr('addPhoto')} — ${tr('beforePhotos')}</span>
      </button>
      <div id="beforePreviews" class="photoGrid" style="margin-top:12px"></div>
    </div>

    <div class="wCard">
      <div class="wCard-title">${ic('check',16)} ${tr('step2')}</div>
      <div class="taskChecklist">
        ${tasks.map((p,i)=>`
          <label class="taskItem" id="ti_${i}">
            <input class="taskCheck" type="checkbox" checked value="${esc(lang==='ar'?p[0]:p[1])}" onchange="this.closest('.taskItem').classList.toggle('checked',this.checked)">
            <span class="taskItem-label">${esc(lang==='ar'?p[0]:p[1])}</span>
          </label>`).join('')}
      </div>
      <div class="field" style="margin-top:16px">
        <label>${tr('notes')}</label>
        ${ta('wkNotes','',{rows:2, placeholder:lang==='ar'?'ملاحظات اختيارية...':'Optional notes...'})}
      </div>
    </div>

    <div class="wCard">
      <div class="wCard-title">${ic('camera',16)} ${tr('afterPhotos')}</div>
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
let qrVisibilityHandler = null;

function qrErrorMessage(err){
  const name = err && err.name;
  if(name==='NotAllowedError'||name==='PermissionDeniedError'){
    return lang==='ar'?'تم رفض إذن الكاميرا. افتح إعدادات المتصفح وامنح الإذن.':'Camera permission denied. Open browser settings and grant permission.';
  }
  if(name==='NotFoundError'||name==='DevicesNotFoundError'){
    return lang==='ar'?'لا توجد كاميرا متاحة في هذا الجهاز.':'No camera found on this device.';
  }
  if(name==='NotReadableError'||name==='TrackStartError'){
    return lang==='ar'?'الكاميرا مستخدمة من تطبيق آخر. أغلق التطبيقات الأخرى وحاول مجدداً.':'Camera is in use by another app. Close other apps and try again.';
  }
  if(name==='OverconstrainedError'){
    return lang==='ar'?'لا تدعم الكاميرا الإعدادات المطلوبة.':'Camera does not support the requested settings.';
  }
  return lang==='ar'?'تعذر فتح الكاميرا. تأكد من منح الإذن واستخدام HTTPS':'Camera access denied. Ensure permission is granted and using HTTPS';
}

async function openQRScanner(){
  if(typeof Html5Qrcode === 'undefined'){
    toast(lang==='ar'?'مكتبة الماسح غير متوفرة':'QR scanner library not available','bad');
    return;
  }

  // Check HTTPS / mediaDevices availability (same check as photo camera)
  if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){
    const isHTTPS = location.protocol==='https:' || location.hostname==='localhost' || location.hostname==='127.0.0.1';
    const msg = isHTTPS
      ? (lang==='ar'?'الكاميرا غير مدعومة في هذا المتصفح':'Camera not supported in this browser')
      : (lang==='ar'?'تتطلب الكاميرا اتصالاً آمناً (HTTPS)':'Camera requires a secure connection (HTTPS)');
    toast(msg,'bad');
    return;
  }

  // Prevent opening more than one camera stream
  if(document.getElementById('qr-overlay') || qrScannerInstance) return;

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

  const onDecoded = (decodedText) => {
    let loc = decodedText.trim();
    try {
      const url = new URL(decodedText);
      const param = url.searchParams.get('loc');
      if(param) loc = param;
    } catch(e){}

    closeQRScanner();

    const parsed = parseLoc(loc);
    if(!parsed){
      invalidLocationToast(loc);
      return;
    }
    const facility = (data.locations||[]).find(l=>l.id===parsed);
    if(!facility){
      toast(lang==='ar'?`الموقع "${parsed}" غير موجود في النظام`:`Location "${parsed}" not found`,'bad');
      return;
    }
    const empInput = document.getElementById('empLocCode');
    const locInput = document.getElementById('locCode');
    const isEmployee = !!empInput;
    const targetInput = isEmployee ? empInput : locInput;
    if(targetInput){
      targetInput.value = parsed;
      targetInput.dispatchEvent(new Event('input',{bubbles:true}));
    }
    toast(lang==='ar'?`تم التعرف على: ${locName(facility)}`:`Found: ${locName(facility)}`,'ok');
    if(!isEmployee) setTimeout(()=>startForm(), 200);
  };

  qrScannerInstance = new Html5Qrcode('qr-reader');

  // Stop the camera if the tab/app is backgrounded while the scanner is open
  qrVisibilityHandler = () => { if(document.hidden) closeQRScanner(); };
  document.addEventListener('visibilitychange', qrVisibilityHandler);

  try{
    // Prefer the rear camera
    await qrScannerInstance.start({ facingMode: 'environment' }, config, onDecoded, ()=>{});
  }catch(envErr){
    console.warn('[qr] environment camera failed:', envErr && envErr.name, envErr && envErr.message);
    // Fallback 1: any available camera by facingMode
    try{
      await qrScannerInstance.start({ facingMode: 'user' }, config, onDecoded, ()=>{});
    }catch(userErr){
      // Fallback 2: enumerate devices and try the first available camera
      try{
        const cameras = await Html5Qrcode.getCameras();
        if(!cameras || !cameras.length) throw envErr;
        await qrScannerInstance.start({ deviceId: { exact: cameras[0].id } }, config, onDecoded, ()=>{});
      }catch(deviceErr){
        const err = envErr.name ? envErr : (userErr.name ? userErr : deviceErr);
        toast(qrErrorMessage(err),'bad');
        closeQRScanner();
      }
    }
  }
}

async function closeQRScanner(){
  if(qrVisibilityHandler){
    document.removeEventListener('visibilitychange', qrVisibilityHandler);
    qrVisibilityHandler = null;
  }

  try{
    if(qrScannerInstance){
      const instance = qrScannerInstance;
      qrScannerInstance = null;
      await instance.stop().catch(()=>{});
      try{ instance.clear(); }catch(e){}
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
    try{await api(maintenanceTicketApi('/complete'),{method:'POST',body:JSON.stringify({id:currentTicketId,photos:currentPhotos,notes:payload.notes})})}
    catch(e){}
    currentTicketId = null;
  }
  try{
    await api(maintenanceReportApi(),{method:'POST',body:JSON.stringify(payload)});
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
  const activeCount = myOrders.filter(t=>!['completed','rejected','cancelled'].includes(t.status)).length;
  const panel = employeeView==='new'
    ? employeeSubmitForm()
    : employeeView==='history'
      ? employeeHistory(myOrders)
      : employeeView==='more'
        ? employeeMore()
        : employeeHome(myOrders, activeCount);
  const empContent=`
    <div class="empPage">
      <div class="empPanel">
        ${panel}
      </div>
    </div>
    `;
  app.innerHTML = fieldShell(me, empContent);
}

function employeeHome(orders, activeCount){
  const latest = orders.slice().sort((a,b)=>new Date(b.createdAt||0)-new Date(a.createdAt||0)).slice(0,3);
  return`
<div class="wCard wCard--compact">
  <div class="wCard-title">${ic('dashboard',16)} ${lang==='ar'?'الرئيسية':'Home'}</div>
  <div class="empHomeSummary">
    <div>
      <div class="empHomeSummary-kicker">${tr('app')}</div>
      <div class="empHomeSummary-title">${lang==='ar'?'خدمات النظافة والمرافق':'Cleaning and facility services'}</div>
      <div class="empHomeSummary-sub">${activeCount?`${num(activeCount)} ${lang==='ar'?'طلبات قيد المتابعة':'active requests'}`:(lang==='ar'?'لا توجد طلبات مفتوحة':'No open requests')}</div>
    </div>
    ${countBubble(orders.length)}
  </div>
  <button class="btn wide" onclick="employeeView='new';mobileNavActive='employee-new';renderEmployee()">${ic('send',18)} ${tr('submitRequest')}</button>
</div>
${latest.length?`
<div class="wCard">
  <div class="wCard-title">${ic('clipboardList',16)} ${lang==='ar'?'آخر طلباتي':'Recent requests'}</div>
  <div class="wCard-list" style="gap:10px">
    ${latest.map(t=>{
      const stCls = t.status==='completed'?'ok':['reclean_required','rejected','cancelled'].includes(t.status)?'bad':t.status==='waiting_verification'?'warn':'brand';
      return`<div class="ticketCard empOrderCard">
        <div class="ticketCard-top empOrderCard-head">
          <div class="ticketCard-main">
            <div class="ticketCard-title empOrderCard-title">${esc(t.title)}</div>
            ${t.referenceNo?`<div class="ticketCard-ref empOrderCard-ref">${esc(t.referenceNo)}</div>`:''}
          </div>
          <span class="badge ${stCls}">${tr(t.status)||t.status}</span>
        </div>
        <div class="ticketCard-meta empOrderCard-meta"><span>${ic('locations',12)} ${esc(lang==='ar'?t.locationNameAr:t.locationNameEn)}</span><span>${fmt(t.createdAt)}</span></div>
      </div>`;
    }).join('')}
  </div>
  <button class="btn secondary wide" style="margin-top:12px" onclick="employeeView='history';mobileNavActive='employee-history';renderEmployee()">${tr('myRequests')}</button>
</div>`:''}`;
}

function employeeMore(){
  return`<div class="wCard">
    <div class="wCard-title">${ic('menu',16)} ${lang==='ar'?'المزيد':'More'}</div>
    <div class="empty-state">
      <div class="empty-icon">${ic('menu',28)}</div>
      <div class="empty-title">${lang==='ar'?'لا توجد خيارات إضافية':'No additional options'}</div>
      <p class="empty-sub">${lang==='ar'?'الإشعارات واللغة وتسجيل الخروج متاحة من الشريط العلوي.':'Notifications, language, and logout are available in the topbar.'}</p>
    </div>
  </div>`;
}

function employeeSubmitForm(){
  const CATS = ['general','spill','restroom','meeting_room','emergency'];
  const CAT_ICONS = {general:'locations',spill:'alert-circle',restroom:'locations',meeting_room:'users',emergency:'bell'};
  return`
<div class="wCard wCard--compact">
  <div class="wCard-title"><span class="wCard-number">1</span>${lang==='ar'?'حدد الموقع':'Select Location'}</div>
  <div class="field">
    <label>${lang==='ar'?'كود الموقع':'Location Code'}</label>
    <div class="locInput-row">
      <button class="locInput-scan" onclick="openQRScanner()" title="${tr('scanQR')}" aria-label="${tr('scanQR')}">${ic('qr',18)}</button>
      <div class="locInput-field">${inp('empLocCode',{cls:'ltr', placeholder:'wc-gf-a'})}</div>
    </div>
  </div>
  <div id="empLocName" style="font-size:var(--fs-xs);color:var(--brand-mid);min-height:18px;margin-top:4px"></div>
  <script>document.getElementById('empLocCode')?.addEventListener('input',function(){
    const id=parseLoc(this.value);
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
    ${ta('empDesc','',{rows:3, placeholder:lang==='ar'?'صف المشكلة بالتفصيل...':'Describe the issue in detail...'})}
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
  <div class="empty-icon">${ic('clipboardList',36)}</div>
  <div class="empty-title">${lang==='ar'?'لا توجد طلبات بعد':'No requests yet'}</div>
  <p class="empty-sub">${lang==='ar'?'قدّم أول طلب تنظيف من التبويب الأول':'Submit your first cleaning request from the first tab'}</p>
</div></div>`;

  return`
<div class="wCard">
  <div class="wCard-title">${ic('clipboardList',16)} ${tr('myRequests')} (${orders.length})</div>
  <div class="wCard-list" style="gap:10px">
    ${orders.map(t=>{
      const stCls = t.status==='completed'?'ok':['reclean_required','rejected','cancelled'].includes(t.status)?'bad':t.status==='waiting_verification'?'warn':'brand';
      const catLabel = tr('cat_'+(t.category||'general'));
      return`<div class="ticketCard empOrderCard">
        <div class="ticketCard-top empOrderCard-head">
          <div class="ticketCard-main">
            <div class="ticketCard-title empOrderCard-title">${esc(t.title)}</div>
            ${t.referenceNo?`<div class="ticketCard-ref empOrderCard-ref">${esc(t.referenceNo)}</div>`:''}
          </div>
          <span class="badge ${stCls}">${tr(t.status)||t.status}</span>
        </div>
        <div class="ticketCard-meta empOrderCard-meta">
          <span>${ic('locations',12)} ${esc(lang==='ar'?t.locationNameAr:t.locationNameEn)}</span>
          <span>${fmt(t.createdAt)}</span>
        </div>
        <div class="ticketCard-badges">
          <span class="badge">${catLabel}</span>
        </div>
        ${t.assignedToName?`<div class="empOrderCard-assigned">${ic('users',11)} ${lang==='ar'?'تم التعيين لـ:':'Assigned to:'} ${esc(t.assignedToName)}</div>`:`<div class="empOrderCard-queue">${lang==='ar'?'في قائمة انتظار المشرف':'In supervisor queue'}</div>`}
      </div>`;
    }).join('')}
  </div>
</div>`;
}

async function submitEmployeeOrder(){
  const locInput = document.getElementById('empLocCode');
  const rawLoc = locInput?.value || '';
  const locId = parseLoc(rawLoc);
  const category = document.getElementById('empCatVal')?.value || 'general';
  const desc = document.getElementById('empDesc')?.value.trim() || '';
  if(!locId) return invalidLocationToast(rawLoc);
  if(locInput) locInput.value = locId;
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
    const wc = document.querySelector('.platform-main.platform-main--field');
    if(wc) wc.innerHTML=`
      <div class="wCard" style="text-align:center;padding:40px 24px;margin-top:24px">
        <div style="width:72px;height:72px;border-radius:50%;background:var(--ok-bg);margin:0 auto 16px;display:grid;place-items:center;color:var(--ok)">${ic('check',32)}</div>
        <div style="font-family:var(--font-head);font-size:var(--fs-xl);font-weight:800;color:var(--ink)">${tr('requestSubmitted')}</div>
        ${res.ticket.referenceNo?`<div style="font-family:ui-monospace,monospace;font-size:var(--fs-sm);color:var(--brand-mid);margin-top:8px">${esc(res.ticket.referenceNo)}</div>`:''}
        <p style="color:var(--muted);margin-top:8px;font-size:var(--fs-sm)">${res.autoAssigned?(lang==='ar'?'تم التعيين التلقائي لعامل النظافة':'Auto-assigned to a cleaning worker'):(lang==='ar'?'تم إرسال الطلب للمشرف':'Sent to supervisor queue')}</p>
        <button class="btn wide" style="margin-top:20px" onclick="employeeView='new';mobileNavActive='employee-new';renderEmployee()">${lang==='ar'?'طلب جديد':'New Request'}</button>
        <button class="btn secondary wide" style="margin-top:10px" onclick="employeeView='history';mobileNavActive='employee-history';load().then(renderEmployee)">${tr('myRequests')}</button>
      </div>`;
      setTopbarBackButton(true, "employeeView='new';mobileNavActive='employee-new';renderEmployee()");
  }catch(e){
    if(btn){btn.disabled=false;btn.innerHTML=`${ic('send',18)} ${tr('submitRequest')}`}
    toast(lang==='ar'?'حدث خطأ، حاول مرة أخرى':'Error, please try again','bad');
  }
}

/* ═══════════════════════════════════════════════════════════════
   HOSPITALITY — Worker View (Phase 4b)
   ═══════════════════════════════════════════════════════════════ */
function renderHospitalityWorker(){
  setDoc();
  const orders = (data.hospitalityOrders||[]).slice().sort((a,b)=>new Date(b.createdAt||0)-new Date(a.createdAt||0));
  const content=`
<div class="empPage">
  <div class="empPanel">
    <div class="wCard wCard--compact">
      <div class="wCard-title">${ic('coffee',16)} ${tr('hospitalityWorkerTitle')}</div>
      <p style="font-size:var(--fs-sm);color:var(--muted)">${tr('hospitalityWorkerDesc')}</p>
    </div>
    ${orders.length?`<div class="wCard-list" style="gap:10px">${orders.map(o=>hospWorkerOrderCard(o)).join('')}</div>`
      :`<div class="wCard"><div class="empty-state">
          <div class="empty-icon">${ic('coffee',28)}</div>
          <div class="empty-title">${tr('noAssignedHospOrders')}</div>
        </div></div>`}
  </div>
</div>`;
  app.innerHTML = fieldShell(me, content);
}

function hospWorkerOrderCard(o){
  const stCls = hospStatusBadgeClass(o.status);
  const NEXT = {
    accepted:         {to:'preparing',        label:tr('startPreparing')},
    preparing:        {to:'ready',            label:tr('markReady')},
    ready:            {to:'out_for_delivery', label:tr('outForDelivery')},
    out_for_delivery: {to:'delivered',        label:tr('markDelivered')}
  };
  const next = NEXT[o.status];
  return`<div class="ticketCard empOrderCard">
    <div class="ticketCard-top empOrderCard-head">
      <div class="ticketCard-main">
        <div class="ticketCard-title empOrderCard-title">${esc(tr('ot_'+o.orderType)||o.orderType)}</div>
        ${o.referenceNo?`<div class="ticketCard-ref empOrderCard-ref">${esc(o.referenceNo)}</div>`:''}
      </div>
      <span class="badge ${stCls}">${hospStatusLabel(o.status)}</span>
    </div>
    <div class="ticketCard-meta empOrderCard-meta">
      <span>${ic('locations',12)} ${esc(lang==='ar'?o.locationNameAr:o.locationNameEn)}</span>
      <span>${fmt(o.createdAt)}</span>
    </div>
    ${o.items&&o.items.length?`<div class="ticketCard-badges">${o.items.map(i=>`<span class="badge">${esc(i)}</span>`).join('')}</div>`:''}
    ${o.notes?`<div class="empOrderCard-queue">${esc(o.notes)}</div>`:''}
    ${next?`<button class="btn wide" style="margin-top:10px" onclick="updateHospitalityOrderStatus('${o.id}','${next.to}')">${next.label}</button>`:''}
  </div>`;
}

async function updateHospitalityOrderStatus(id, status){
  try{
    await api(`/hospitality/orders/${id}`,{method:'PUT',body:JSON.stringify({status})});
    toast(hospStatusLabel(status),'ok');
    await load();
  }catch(e){
    const msg = e.message==='INVALID_TRANSITION'
      ? tr('invalidTransitionMsg')
      : (lang==='ar'?'حدث خطأ، حاول مرة أخرى':'Error, please try again');
    toast(msg,'bad');
  }
}

/* ═══════════════════════════════════════════════════════════════
   HOSPITALITY — Supervisor & Manager dashboards (Phase 4c)
   ═══════════════════════════════════════════════════════════════ */
function hospOrderCard(o, mode, workers){
  const stCls = hospStatusBadgeClass(o.status);
  const requester = o.requesterName
    ? `${o.requesterName}${o.requesterPhone?` · ${o.requesterPhone}`:''}`
    : (o.requestedBy || '');
  const showAssign = canHospitalityAssign() && !['completed','cancelled','rejected'].includes(o.status) && mode!=='new' && mode!=='assign';
  return`<div class="ticketCard empOrderCard">
    <div class="ticketCard-top empOrderCard-head">
      <div class="ticketCard-main">
        <div class="ticketCard-title empOrderCard-title">${esc(tr('ot_'+o.orderType)||o.orderType)}</div>
        ${o.referenceNo?`<div class="ticketCard-ref empOrderCard-ref">${esc(o.referenceNo)}</div>`:''}
      </div>
      <span class="badge ${stCls}">${hospStatusLabel(o.status)}</span>
    </div>
    <div class="ticketCard-meta empOrderCard-meta">
      <span>${ic('locations',12)} ${esc(lang==='ar'?o.locationNameAr:o.locationNameEn)}</span>
      <span>${fmt(o.updatedAt||o.createdAt)}</span>
    </div>
    ${requester?`<div class="ticketCard-requester">${ic('user',12)} <span class="ticketCard-requester-label">${tr('requesterLabel')}:</span> <span class="ticketCard-requester-name">${esc(requester)}</span></div>`:''}
    ${o.assignedToName?`<div class="ticketCard-meta empOrderCard-meta"><span>${ic('users',12)} ${esc(o.assignedToName)}</span></div>`
      :(showAssign?`<div class="ticketCard-meta empOrderCard-meta"><span class="badge warn">${tr('pendingAssignmentBadge')}</span></div>`:'')}
    ${o.items&&o.items.length?`<div class="ticketCard-badges">${o.items.map(i=>`<span class="badge">${esc(i)}</span>`).join('')}</div>`:''}
    ${o.notes?`<div class="empOrderCard-queue">${esc(o.notes)}</div>`:''}
    ${mode==='new'?`
    <div class="ticketCard-actions supTicketCard-actions">
      <button class="btn sm ok" onclick="hospSupervisorDecision('${o.id}','accepted')">${ic('check',14)} ${tr('acceptOrder')}</button>
      <button class="btn sm danger" onclick="hospSupervisorDecision('${o.id}','rejected')">${ic('x',14)} ${tr('rejectOrder')}</button>
    </div>`:mode==='assign'&&workers?`
    <div class="ticketCard-actions supTicketCard-actions">
      ${sel(`hsa-${o.id}`,[{v:'',l:tr('chooseWorker')},...workers.map(w=>({v:w.id,l:w.name}))], {cls:'ctrl-sm'})}
      <button class="btn sm ok" onclick="hospAssignOrder('${o.id}',document.getElementById('hsa-${o.id}').value)">${tr('assign')}</button>
    </div>`:mode==='complete'?`
    <div class="ticketCard-actions supTicketCard-actions">
      <button class="btn sm ok" onclick="hospSupervisorDecision('${o.id}','completed')">${ic('check',14)} ${tr('completeOrder')}</button>
    </div>`:''}
    ${showAssign?`<div class="ticketCard-actions supTicketCard-actions">
      <button class="btn sm secondary" onclick="toggleAssignRow('${o.id}')">${ic('users',13)} ${o.assignedToName?tr('reassignOrderBtn'):tr('assign')}</button>
    </div>
    ${hospReassignRowHtml(o, workers)}`:''}
  </div>`;
}

function hospReassignRowHtml(o, workers){
  return `<div id="hsr-${o.id}" class="ticketCard-actions supTicketCard-actions" style="display:none">
    ${sel(`hsr-sel-${o.id}`,[{v:'',l:tr('selectWorkerLabel')},...(workers||[]).map(w=>({v:w.id,l:w.name}))], {cls:'ctrl-sm'})}
    <button class="btn sm ok" onclick="hospAssignOrder('${o.id}',document.getElementById('hsr-sel-${o.id}').value)">${ic('check',14)} ${tr('assign')}</button>
  </div>`;
}

function toggleAssignRow(id){
  const el = document.getElementById('hsr-'+id);
  if(!el) return;
  el.style.display = el.style.display==='none' ? 'flex' : 'none';
}

function hospTeamGrid(workers, orders){
  if(!workers.length) return `<div class="empty-state"><div class="empty-icon">${ic('users',24)}</div><div class="empty-title">${tr('noWorkersAvailable')}</div></div>`;
  return `<div class="supTeamGrid">${workers.map(w=>{
    const active = orders.filter(o=>o.assignedTo===w.id && !['completed','cancelled','rejected'].includes(o.status));
    return `<div class="supTeamCard"><div class="supTeamCard-info"><div class="supTeamCard-name">${esc(w.name)}</div><div class="supTeamCard-meta">${active.length} ${lang==='ar'?'مهام نشطة':'active'}</div></div>${active.length?`<span class="badge warn">${active.length}</span>`:`<span class="badge ok">${lang==='ar'?'متاح':'Free'}</span>`}</div>`;
  }).join('')}</div>`;
}

function hospOrdersBoard(orders, workers){
  const terminal = ['completed','cancelled','rejected'];
  const submitted = orders.filter(o=>o.status==='submitted');
  const overdue = orders.filter(o=>!terminal.includes(o.status) && o.slaDeadline && new Date(o.slaDeadline)<new Date());
  const overdueIds = new Set(overdue.map(o=>o.id));
  const unassigned = orders.filter(o=>!o.assignedTo && !overdueIds.has(o.id) && !['submitted',...terminal].includes(o.status));
  const delivered = orders.filter(o=>o.status==='delivered' && !overdueIds.has(o.id));
  const inProgress = orders.filter(o=>['accepted','preparing','ready','out_for_delivery'].includes(o.status) && o.assignedTo && !overdueIds.has(o.id));

  return `<div class="supSectionsGrid">
    ${overdue.length?`<div class="wCard--full"><div class="wCard supervisorSlaCard">
      <div class="supervisorSlaHead"><div class="wCard-title supervisorSlaTitle">${ic('bell',16)} ${tr('overdueOrdersLabel')} ${countBubble(overdue.length,'bad')}</div></div>
      <div class="wCard-list supTicketList">${overdue.map(o=>hospOrderCard(o,'view',workers)).join('')}</div>
    </div></div>`:''}
    <div class="wCard">
      <div class="wCard-title">${ic('coffee',16)} ${tr('newOrders')} ${countBubble(submitted.length,'bad')}</div>
      ${submitted.length?`<div class="wCard-list supTicketList">${submitted.map(o=>hospOrderCard(o,'new',workers)).join('')}</div>`:`<div class="empty-state"><div class="empty-icon">${ic('check',24)}</div><div class="empty-title">${tr('noNewOrders')}</div></div>`}
    </div>
    <div class="wCard">
      <div class="wCard-title">${ic('users',16)} ${tr('assignToWorker')} ${countBubble(unassigned.length,'warn')}</div>
      ${unassigned.length?`<div class="wCard-list supTicketList">${unassigned.map(o=>hospOrderCard(o,'assign',workers)).join('')}</div>`:`<div class="empty-state"><div class="empty-icon">${ic('check',24)}</div><div class="empty-title">${tr('noUnassignedOrders')}</div></div>`}
    </div>
    <div class="wCard">
      <div class="wCard-title">${ic('truck',16)} ${tr('deliveredOrdersLabel')} ${countBubble(delivered.length,'ok')}</div>
      ${delivered.length?`<div class="wCard-list supTicketList">${delivered.map(o=>hospOrderCard(o,'complete',workers)).join('')}</div>`:`<div class="empty-state"><div class="empty-icon">${ic('check',24)}</div><div class="empty-title">${tr('noOrdersAtAll')}</div></div>`}
    </div>
    <div class="wCard wCard--full">
      <div class="wCard-title">${ic('sync',16)} ${tr('allOrdersLabel')} ${countBubble(inProgress.length)}</div>
      ${inProgress.length?`<div class="wCard-list supTicketList">${inProgress.map(o=>hospOrderCard(o,'view',workers)).join('')}</div>`:`<div class="empty-state"><div class="empty-icon">${ic('sync',24)}</div><div class="empty-title">${tr('noOrdersAtAll')}</div></div>`}
    </div>
  </div>`;
}

function hospReportsView(orders, locations, workers){
  let filtered = orders;
  if(hospReportStatusFilter!=='all') filtered = filtered.filter(o=>o.status===hospReportStatusFilter);
  if(hospReportLocationFilter!=='all') filtered = filtered.filter(o=>o.locationId===hospReportLocationFilter);
  filtered = filtered.slice().sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));

  const statusOptions = [{v:'all',l:tr('allStatuses'),sel:hospReportStatusFilter==='all'},
    ...HOSPITALITY_STATUSES_ORDER.map(s=>({v:s,l:hospStatusLabel(s),sel:hospReportStatusFilter===s}))];
  const locationOptions = [{v:'all',l:tr('allLocations'),sel:hospReportLocationFilter==='all'},
    ...locations.map(l=>({v:l.id,l:lang==='ar'?l.nameAr:l.nameEn,sel:hospReportLocationFilter===l.id}))];

  return `<div class="wCard">
    <div class="wCard-title">${ic('reports',16)} ${tr('hospReportsTab')} ${countBubble(filtered.length)}</div>
    <div class="usersFilterBar">
      ${sel('hospFilterStatus',statusOptions,{onchange:"hospReportStatusFilter=this.value;renderHospitalityManager()"})}
      ${sel('hospFilterLocation',locationOptions,{onchange:"hospReportLocationFilter=this.value;renderHospitalityManager()"})}
    </div>
    ${filtered.length?`<div class="wCard-list supTicketList">${filtered.map(o=>hospOrderCard(o,'view',workers)).join('')}</div>`
      :`<div class="empty-state"><div class="empty-icon">${ic('reports',24)}</div><div class="empty-title">${tr('noOrdersAtAll')}</div></div>`}
  </div>`;
}

async function hospSupervisorDecision(id, status){
  try{
    await api(`/hospitality/orders/${id}`,{method:'PUT',body:JSON.stringify({status})});
    await load();
    if(me.role==='hospitality_supervisor') renderHospitalitySupervisor(); else renderHospitalityManager();
    toast(hospStatusLabel(status),'ok');
  }catch(e){
    const msg = e.message==='INVALID_TRANSITION'
      ? tr('invalidTransitionMsg')
      : (lang==='ar'?'حدث خطأ، حاول مرة أخرى':'Error, please try again');
    toast(msg,'bad');
  }
}

async function hospAssignOrder(id, workerId){
  if(!workerId) return toast(tr('chooseWorker'),'warn');
  try{
    await api(`/hospitality/orders/${id}/assign`,{method:'POST',body:JSON.stringify({workerId})});
    await load();
    if(me.role==='hospitality_supervisor') renderHospitalitySupervisor(); else renderHospitalityManager();
    toast(tr('assign'),'ok');
  }catch(e){ toast(e.message,'bad'); }
}

async function ensureHospPerf(){
  if(hospPerfData || _hospPerfLoading) return;
  _hospPerfLoading = true;
  try{ hospPerfData = await api('/hospitality/performance'); }
  catch(e){ hospPerfData = null; }
  _hospPerfLoading = false;
}

/* ── shared manager-style dashboard for hospitality_manager & the
   system_admin/facility_manager hospitality module — mirrors the
   cleaning_manager dashboard (hero + KPI grid + analytical cards) ── */
function hospManagerDashboardHtml(orders, workers){
  const terminal = ['completed','cancelled','rejected'];
  const today = new Date().toDateString();
  const todayOrders = orders.filter(o=>new Date(o.createdAt).toDateString()===today);
  const openOrders = orders.filter(o=>!terminal.includes(o.status));
  const completedOrders = orders.filter(o=>o.status==='completed');
  const overdue = hospPerfData ? hospPerfData.overdue : orders.filter(o=>!terminal.includes(o.status) && o.slaDeadline && new Date(o.slaDeadline)<new Date()).length;
  const totalForSla = hospPerfData ? hospPerfData.totalOrders : orders.length;
  const slaCompliance = totalForSla>0 ? Math.round((totalForSla-overdue)/totalForSla*100) : 100;
  const avgCompletion = hospPerfData ? hospPerfData.avgCompletionMins : null;

  const hour = new Date().getHours();
  const greeting = lang==='ar' ? (hour<12?'صباح الخير':'مساء الخير') : (hour<12?'Good morning':'Good afternoon');
  const roleContext = lang==='ar' ? `${tr(me.role)} · مركز العمليات` : `${tr(me.role)} · Operations center`;
  const summaryText = lang==='ar'
    ? `${num(openOrders.length)} طلبات مفتوحة · ${num(slaCompliance)}% التزام SLA`
    : `${num(openOrders.length)} open orders · ${num(slaCompliance)}% SLA compliance`;

  const renderFn = me.role==='hospitality_manager' ? 'renderHospitalityManager' : 'renderAdminHospitality';
  const heroHtml = `<div class="dashHero">
    <div class="dashHero-left">
      <span class="dashHero-greeting">${roleContext}</span>
      <div class="dashHero-title">${greeting}، ${esc(me.name.split(' ')[0])}</div>
      <p class="dashHero-sub">${summaryText} · ${fmtDate(new Date())}</p>
      <div class="dashHero-actions">
        <button class="dashHero-action" onclick="hospManagerView='orders';mobileNavActive='hospmgr-orders';${renderFn}()">${ic('coffee',14)} ${tr('hospOrdersTab')}</button>
        <button class="dashHero-action" onclick="hospManagerView='reports';mobileNavActive='hospmgr-reports';${renderFn}()">${ic('reports',14)} ${tr('hospReportsTab')}</button>
      </div>
    </div>
    <div class="dashHero-right">
      <div class="dashHero-stat">
        <div class="dashHero-stat-val">${num(todayOrders.length)}</div>
        <div class="dashHero-stat-lbl">${tr('kpiTodayOrders')}</div>
      </div>
      <div class="dashHero-stat">
        <div class="dashHero-stat-val">${num(openOrders.length)}</div>
        <div class="dashHero-stat-lbl">${tr('kpiOpenOrders')}</div>
      </div>
      <div class="dashHero-stat">
        <div class="dashHero-stat-val">${slaCompliance}%</div>
        <div class="dashHero-stat-lbl">${tr('kpiSlaCompliance')}</div>
      </div>
    </div>
  </div>`;

  const kpiHtml = `<div class="kpiGrid kpiGrid--6">
    ${kpiCard(num(todayOrders.length), tr('kpiTodayOrders'), 'coffee', 'brand')}
    ${kpiCard(num(openOrders.length), tr('kpiOpenOrders'), 'sync', 'warn')}
    ${kpiCard(num(completedOrders.length), tr('kpiCompletedOrders'), 'check', 'ok')}
    ${kpiCard(num(overdue), tr('kpiOverdueOrders'), 'bell', overdue?'bad':'ok')}
    ${kpiCard(slaCompliance+'%', tr('kpiSlaCompliance'), 'shield', slaCompliance>=80?'ok':'warn')}
    ${kpiCard(avgCompletion!=null?(avgCompletion+(lang==='ar'?' د':' min')):'—', tr('kpiAvgCompletion'), 'sync', 'brand')}
  </div>`;

  const perfWorkers = hospPerfData ? hospPerfData.workers : [];
  const byStatusHtml = `<div class="card">
    <div class="card-head">
      <span class="card-title">${tr('ordersByStatusTitle')}</span>
    </div>
    <div class="hospStatusGrid">
      ${HOSPITALITY_STATUSES_ORDER.map(s=>{
        const count = hospPerfData ? (hospPerfData.byStatus[s]||0) : orders.filter(o=>o.status===s).length;
        return `<div class="hospStatusGrid-item"><span class="badge ${hospStatusBadgeClass(s)}">${hospStatusLabel(s)}</span><b>${num(count)}</b></div>`;
      }).join('')}
    </div>
  </div>`;

  const workerPerfHtml = `<div class="card">
    <div class="card-head">
      <span class="card-title">${tr('workerPerformanceTitle')}</span>
    </div>
    ${perfWorkers.length?`<div class="supTeamGrid">${perfWorkers.map(w=>`
      <div class="supTeamCard"><div class="supTeamCard-info"><div class="supTeamCard-name">${esc(w.name)}</div>
      <div class="supTeamCard-meta">${tr('completedCountLabel')}: ${num(w.completed)} · ${tr('openCountLabel')}: ${num(w.open)}</div></div></div>`).join('')}</div>`
      :`<div class="empty-state"><div class="empty-icon">${ic('users',24)}</div><div class="empty-title">${tr('noPerformanceData')}</div></div>`}
  </div>`;

  const contentHtml = `<div class="contentGrid">
    ${byStatusHtml}
    ${workerPerfHtml}
  </div>`;

  return `${heroHtml}${kpiHtml}${contentHtml}`;
}

function renderHospitalitySupervisor(){
  setDoc();
  const orders = data.hospitalityOrders||[];
  const workers = (data.users||[]).filter(u=>(u.roles||[u.role]).includes('hospitality_worker'));
  const terminal = ['completed','cancelled','rejected'];
  const submitted = orders.filter(o=>o.status==='submitted');
  const inProgress = orders.filter(o=>['accepted','preparing','ready','out_for_delivery'].includes(o.status));
  const delivered = orders.filter(o=>o.status==='delivered');
  const overdue = orders.filter(o=>!terminal.includes(o.status) && o.slaDeadline && new Date(o.slaDeadline)<new Date());

  const statsHtml = `<div class="supStats">
    ${supStat(submitted.length, tr('newOrders'), 'coffee', 'bad')}
    ${supStat(inProgress.length, tr('hospOrdersTab'), 'sync', 'brand')}
    ${supStat(delivered.length, tr('deliveredOrdersLabel'), 'truck', 'warn')}
    ${supStat(overdue.length, tr('overdueOrdersLabel'), 'bell', overdue.length?'bad':'ok')}
  </div>`;

  const teamHtml = `<div class="wCard">
    <div class="wCard-title">${ic('users',16)} ${tr('availableWorkers')} ${countBubble(workers.length)}</div>
    ${hospTeamGrid(workers, orders)}
  </div>`;

  const dashboardHtml = `<div class="supervisorDashboard">
    ${statsHtml}
    <div class="wCard">
      <div class="wCard-title">${ic('dashboard',16)} ${lang==='ar'?'اختصارات التشغيل':'Operational shortcuts'}</div>
      <div class="quickActionGrid quickActionGrid--supervisor">
        <button class="quickAction" onclick="hospSupervisorView='orders';mobileNavActive='hospsup-orders';renderHospitalitySupervisor()"><span>${ic('coffee',18)}</span><b>${tr('hospOrdersTab')}</b><small>${num(orders.length)}</small></button>
        <button class="quickAction" onclick="hospSupervisorView='team';mobileNavActive='hospsup-team';renderHospitalitySupervisor()"><span>${ic('users',18)}</span><b>${tr('hospTeamTab')}</b><small>${num(workers.length)}</small></button>
      </div>
    </div>
    ${teamHtml}
  </div>`;

  const ordersHtml = hospOrdersBoard(orders, workers);

  const content = hospSupervisorView==='orders' ? ordersHtml
    : hospSupervisorView==='team' ? teamHtml
    : dashboardHtml;

  app.innerHTML = fieldShell(me, content, {sync:true, noSticky:true});
}

async function renderHospitalityManager(){
  setDoc();
  const orders = data.hospitalityOrders||[];
  const workers = (data.users||[]).filter(u=>(u.roles||[u.role]).includes('hospitality_worker'));
  const locations = data.locations||[];

  if(hospManagerView==='dashboard') await ensureHospPerf();
  if(hospManagerView==='products'){ await ensureHospMenuItems(); await ensureHospMenuCategories(); }
  if(hospManagerView==='categories') await ensureHospMenuCategories();
  if(hospManagerView==='kitchens') await ensureHospKitchens();

  const dashboardHtml = hospManagerDashboardHtml(orders, workers);

  const ordersHtml = hospOrdersBoard(orders, workers);
  const reportsHtml = hospReportsView(orders, locations, workers);
  const productsHtml = hospitalityProductsView();
  const categoriesHtml = hospitalityCategoriesView();
  const kitchensHtml = hospitalityKitchensView();

  const content = hospManagerView==='orders' ? ordersHtml
    : hospManagerView==='reports' ? reportsHtml
    : hospManagerView==='products' ? productsHtml
    : hospManagerView==='categories' ? categoriesHtml
    : hospManagerView==='kitchens' ? kitchensHtml
    : dashboardHtml;

  app.innerHTML = hospManagerShell(me, content, {renderFn:'renderHospitalityManager', canManage:canManageHospitalityMenu()});
}

/* ── hospitality module entry for system_admin / facility_manager ──
   system_admin: full dashboard/orders/reports/products/kitchens (same as hospitality_manager)
   facility_manager: operational overview only — no products/kitchens management ──── */
async function renderAdminHospitality(){
  setDoc();
  const canManage = canManageHospitalityMenu();
  if(!canManage && ['products','categories','kitchens'].includes(hospManagerView)) hospManagerView = 'dashboard';

  const orders = data.hospitalityOrders||[];
  const workers = (data.users||[]).filter(u=>(u.roles||[u.role]).includes('hospitality_worker'));
  const locations = data.locations||[];

  if(hospManagerView==='dashboard') await ensureHospPerf();
  if(canManage && hospManagerView==='products'){ await ensureHospMenuItems(); await ensureHospMenuCategories(); }
  if(canManage && hospManagerView==='categories') await ensureHospMenuCategories();
  if(canManage && hospManagerView==='kitchens') await ensureHospKitchens();

  const dashboardHtml = hospManagerDashboardHtml(orders, workers);

  const ordersHtml = hospOrdersBoard(orders, workers);
  const reportsHtml = hospReportsView(orders, locations, workers);

  const content = hospManagerView==='orders' ? ordersHtml
    : hospManagerView==='reports' ? reportsHtml
    : (canManage && hospManagerView==='products') ? hospitalityProductsView()
    : (canManage && hospManagerView==='categories') ? hospitalityCategoriesView()
    : (canManage && hospManagerView==='kitchens') ? hospitalityKitchensView()
    : dashboardHtml;

  app.innerHTML = hospManagerShell(me, content, {renderFn:'renderAdminHospitality', canManage, adminContext:true, back:true, backAction:'exitModule()'});
}

/* ═══════════════════════════════════════════════════════════════
   MAINTENANCE MODULE
   ═══════════════════════════════════════════════════════════════ */

const MAINT_CATS = ['electrical','plumbing','hvac','civil','general'];

function maintCatLabel(cat){ return tr(cat) || cat; }

const MAINT_CAT_ICONS = { electrical:'alert', plumbing:'locations', hvac:'sync', civil:'building', general:'list' };

let maintView = 'dashboard';
let maintWorkerView = 'tasks';
let maintTicketModal = false;
let maintReportModal = false;

/* ── shared maintenance shell ────────────────────────────────── */
function maintShell(me, content, opts={}){
  const isWorker  = me.role==='maintenance_worker';
  if(isWorker){
    app.innerHTML = fieldShell(me, content, {sync:true});
    return;
  }
  const openTickets=(data.tickets||[]).filter(t=>!['completed','rejected','cancelled'].includes(t.status)).length;
  const pendingReports=(data.reports||[]).filter(r=>(r.approvalStatus||'pending')==='pending').length;
  const renderFn=opts.renderFn||'renderMaintenanceManager';
  const item=(v,label,icon,count=0)=>`<button class="navBtn${maintView===v?' active':''}" onclick="maintView='${v}';mobileNavActive='maint-${v}';${renderFn}()">
    <span class="navBtn-icon">${ic(icon,18)}</span><span class="navBtn-label">${label}</span>
    ${count?`<span class="countBubble navBtn-badge">${num(count)}</span>`:''}</button>`;
  app.innerHTML=`<div class="platform-shell platform-shell--admin">
    ${renderPlatformTopbar(me,{search:false,notif:true,sync:true,adminMode:true})}
    <div class="platform-body">
      <aside class="platform-sidebar"><div class="sidebarInner">
        <div class="nav-section"><span class="nav-section-label">${tr('operations')}</span>
          ${item('dashboard',tr('dashboard'),'dashboard')}
          ${item('orders',tr('maintOrders'),'tickets',openTickets)}
          ${item('schedules',tr('maintSchedules'),'clock')}
          ${item('reports',tr('reports'),'reports',pendingReports)}
        </div>
        <div class="nav-section"><span class="nav-section-label">${tr('management')}</span>
          ${item('assets',tr('maintAssets'),'building')}
          ${item('team',tr('maintTeam'),'users')}
          ${item('parts',tr('maintParts'),'tool')}
        </div>
      </div></aside>
      <main class="platform-main"><div class="pageAnim">${content}</div></main>
    </div>
    <nav class="mobileBottomNav" style="--mobile-nav-count:5" aria-label="${lang==='ar'?'تنقل الصيانة':'Maintenance navigation'}">
      ${[['dashboard',tr('dashboard'),'dashboard'],['orders',tr('maintOrders'),'tickets'],['schedules',tr('maintSchedules'),'clock'],['assets',tr('maintAssets'),'building'],['team',tr('maintTeam'),'users']].map(([v,l,i])=>`<button class="mobileBottomNav-item${maintView===v?' active':''}" onclick="maintView='${v}';${renderFn}()"><span class="mobileBottomNav-icon">${ic(i,18)}</span><span class="mobileBottomNav-label">${l}</span></button>`).join('')}
    </nav>
  </div>`;
}

/* ── status badge helper for maintenance ─────────────────────── */
function maintStatusBadge(status){
  const map = {submitted:'badge-warn',assigned:'badge-info',accepted:'badge-info',
    in_progress:'badge-brand',waiting_verification:'badge-warn',completed:'badge-done',
    rejected:'badge-bad',cancelled:'badge-bad',reclean_required:'badge-warn'};
  const labels = {submitted:lang==='ar'?'جديد':'New',assigned:lang==='ar'?'مُعيَّن':'Assigned',
    accepted:lang==='ar'?'مقبول':'Accepted',in_progress:lang==='ar'?'جارٍ':'In Progress',
    waiting_verification:lang==='ar'?'بانتظار تحقق':'Pending Verification',
    completed:lang==='ar'?'مكتمل':'Completed',rejected:lang==='ar'?'مرفوض':'Rejected',
    cancelled:lang==='ar'?'ملغى':'Cancelled',reclean_required:lang==='ar'?'إعادة العمل':'Redo'};
  return `<span class="badge ${map[status]||'badge-info'}">${labels[status]||status}</span>`;
}

/* ── maintenance tickets list ────────────────────────────────── */
function maintTicketsList(tickets, opts={}){
  const {renderFn='renderMaintenanceManager', canAssign=false, canCreate=false, isWorker=false} = opts;
  const open  = tickets.filter(t=>!['completed','rejected','cancelled'].includes(t.status));
  const done  = tickets.filter(t=> ['completed','rejected','cancelled'].includes(t.status));
  const card  = t => {
    const slaOver = t.slaBreached && !['completed','rejected','cancelled'].includes(t.status);
    const escBadge = t.escalationLevel>=2
      ? `<span class="badge bad">🔴 ${lang==='ar'?'تصعيد':'Escalated'}</span>`
      : t.escalationLevel===1
        ? `<span class="badge warn">⚠️ ${lang==='ar'?'تصعيد':'Escalated'}</span>` : '';
    return `<div class="card ticketCard${t.escalationLevel>0?' ticketCard--escalated':''}" onclick="openTicketDetail('${t.id}')">
      <div class="ticketCard-header">
        <span class="badge badge-info">${ic(MAINT_CAT_ICONS[t.category]||'tool',12)} ${maintCatLabel(t.category)}</span>
        ${maintStatusBadge(t.status)} ${escBadge}
        ${slaOver?`<span class="badge bad">SLA</span>`:''}
        <span style="margin-right:auto;font-size:11px;color:var(--ink-2)">#${esc(t.referenceNo)}</span>
      </div>
      <div class="ticketCard-title">${esc(t.title)}</div>
      <div class="ticketCard-meta">
        ${ic('locations',13)} ${esc(t.locationNameAr)}
        ${t.assignedToName?`· ${ic('user',13)} ${esc(t.assignedToName)}`:''}
        · ${ic('clock',13)} ${fmtDate(t.createdAt)}
      </div>
      ${isWorker && t.status==='assigned'?`
        <div class="ticketCard-actions" onclick="event.stopPropagation()">
          <button class="btn btn-sm btn-primary" onclick="maintAcceptTicket('${t.id}','${renderFn}')">${lang==='ar'?'قبول':'Accept'}</button>
          <button class="btn btn-sm btn-ghost" onclick="maintCompleteTicket('${t.id}','${renderFn}')">${lang==='ar'?'إغلاق':'Close'}</button>
        </div>` : isWorker && t.status==='accepted'?`
        <div class="ticketCard-actions" onclick="event.stopPropagation()">
          <button class="btn btn-sm btn-primary" onclick="maintStartTicket('${t.id}','${renderFn}')">${lang==='ar'?'بدء العمل':'Start'}</button>
          <button class="btn btn-sm btn-ghost" onclick="maintCompleteTicket('${t.id}','${renderFn}')">${lang==='ar'?'إغلاق':'Close'}</button>
        </div>` : isWorker && t.status==='in_progress'?`
        <div class="ticketCard-actions" onclick="event.stopPropagation()">
          <button class="btn btn-sm btn-primary" onclick="maintCompleteTicket('${t.id}','${renderFn}')">${lang==='ar'?'إغلاق البلاغ':'Close Ticket'}</button>
        </div>` : canAssign && t.status==='waiting_verification'?`
        <div class="ticketCard-actions" onclick="event.stopPropagation()">
          <button class="btn btn-sm btn-success" onclick="maintVerifyTicket('${t.id}','completed','${renderFn}')">${lang==='ar'?'اعتماد':'Approve'}</button>
          <button class="btn btn-sm btn-warn" onclick="maintVerifyTicket('${t.id}','reclean_required','${renderFn}')">${lang==='ar'?'إعادة':'Redo'}</button>
          <button class="btn btn-sm btn-danger-ghost" onclick="maintVerifyTicket('${t.id}','rejected','${renderFn}')">${lang==='ar'?'رفض':'Reject'}</button>
        </div>` : canAssign && t.status==='submitted'?`
        <div class="ticketCard-actions" onclick="event.stopPropagation()">
          <button class="btn btn-sm btn-primary" onclick="maintAssignTicket('${t.id}','${renderFn}')">${lang==='ar'?'تعيين فني':'Assign'}</button>
        </div>` : ''}
    </div>`;
  };
  return `
    ${canCreate?`<div style="margin-bottom:16px"><button class="btn btn-primary" onclick="maintOpenTicketCreate('${renderFn}')">${ic('plus',16)} ${tr('maintTicketCreate')}</button></div>`:''}
    ${open.length===0&&done.length===0?`<p class="empty-state">${tr('noData')}</p>`:''}
    ${open.length?`<h4 style="font-size:13px;font-weight:700;margin-bottom:8px">${lang==='ar'?'مفتوحة':'Open'} (${open.length})</h4>${open.map(card).join('')}`:''}
    ${done.length?`<details style="margin-top:16px"><summary style="cursor:pointer;font-size:13px;font-weight:600;color:var(--ink-2)">${lang==='ar'?'مغلقة':'Closed'} (${done.length})</summary><div style="margin-top:8px">${done.map(card).join('')}</div></details>`:''}
  `;
}

/* ── maintenance reports list ────────────────────────────────── */
function maintReportsList(reports, opts={}){
  const {renderFn='renderMaintenanceManager', canReview=false, canRate=false} = opts;
  if(!reports.length) return `<p class="empty-state">${tr('noData')}</p>`;
  return reports.map(r=>{
    const statusMap = {pending:lang==='ar'?'بانتظار الاعتماد':'Pending',approved:lang==='ar'?'معتمد':'Approved',rejected:lang==='ar'?'مرفوض':'Rejected',needs_recleaning:lang==='ar'?'إعادة العمل':'Redo'};
    const statusCls = {pending:'badge-warn',approved:'badge-done',rejected:'badge-bad',needs_recleaning:'badge-warn'};
    return `<div class="card reportCard" onclick="openReportDetail('${r.id}')">
      <div class="reportCard-header" onclick="event.stopPropagation()">
        <span class="badge ${statusCls[r.approvalStatus]||'badge-info'}">${statusMap[r.approvalStatus]||r.approvalStatus}</span>
        <span style="margin-right:auto;font-size:11px;color:var(--ink-2)">${ic('clock',12)} ${fmtDate(r.createdAt)}</span>
        ${r.photos.length?`<span class="badge badge-info">${ic('camera',12)} ${r.photos.length}</span>`:''}
      </div>
      <div class="reportCard-worker">${ic('user',13)} ${esc(r.workerName)} — ${esc(r.locationNameAr)}</div>
      ${r.tasks.length?`<div class="reportCard-tasks">${ic('check',12)} ${r.tasks.length} ${lang==='ar'?'مهمة':'tasks'}</div>`:''}
      ${canReview && r.approvalStatus==='pending'?`
        <div class="reportCard-actions" onclick="event.stopPropagation()">
          <button class="btn btn-sm btn-success" onclick="maintReviewReport('${r.id}','approved','${renderFn}')">${lang==='ar'?'اعتماد':'Approve'}</button>
          <button class="btn btn-sm btn-warn" onclick="maintReviewReport('${r.id}','needs_recleaning','${renderFn}')">${lang==='ar'?'إعادة':'Redo'}</button>
          <button class="btn btn-sm btn-danger-ghost" onclick="maintReviewReport('${r.id}','rejected','${renderFn}')">${lang==='ar'?'رفض':'Reject'}</button>
        </div>` : ''}
      ${canRate && r.approvalStatus==='approved'?`
        <div class="ratingRow" onclick="event.stopPropagation()">
          <div class="ratingGroup"><span class="ratingLabel">${lang==='ar'?'تقييم المدير':'Mgr Rating'}</span>${maintStarWidget(r.id,'manager',r.ratingManager)}</div>
          <div class="ratingGroup"><span class="ratingLabel">${lang==='ar'?'تقييم المشرف':'Sup Rating'}</span>${maintStarWidget(r.id,'supervisor',r.ratingSupervisor)}</div>
        </div>` : ''}
    </div>`;
  }).join('');
}

/* ── maintenance dashboard KPIs ───────────────────────────────── */
function maintDashboard(tickets, reports, opts={}){
  const open     = tickets.filter(t=>!['completed','rejected','cancelled'].includes(t.status));
  const breached = open.filter(t=>t.slaBreached);
  const completed= tickets.filter(t=>t.status==='completed');
  const pending  = reports.filter(r=>r.approvalStatus==='pending');
  return `
    <div class="stats-grid" style="margin-bottom:20px">
      <div class="stat-card"><div class="value">${open.length}</div><div class="label">${lang==='ar'?'طلبات مفتوحة':'Open Tickets'}</div></div>
      <div class="stat-card"><div class="value ${breached.length?'text-danger':''}">${breached.length}</div><div class="label">SLA ${lang==='ar'?'متجاوز':'Breached'}</div></div>
      <div class="stat-card"><div class="value">${completed.length}</div><div class="label">${lang==='ar'?'مكتملة':'Completed'}</div></div>
      <div class="stat-card"><div class="value">${pending.length}</div><div class="label">${lang==='ar'?'تقارير معلقة':'Pending Reports'}</div></div>
    </div>
    <div style="margin-bottom:16px">
      <h4 style="font-size:13px;font-weight:700;margin-bottom:8px">${lang==='ar'?'حسب التصنيف':'By Category'}</h4>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        ${MAINT_CATS.map(c=>{
          const cnt = open.filter(t=>t.category===c).length;
          return `<div class="card" style="flex:1;min-width:80px;text-align:center;padding:10px 8px">
            ${ic(MAINT_CAT_ICONS[c]||'tool',20)}<br>
            <span style="font-size:11px">${maintCatLabel(c)}</span><br>
            <strong style="font-size:18px">${cnt}</strong>
          </div>`;
        }).join('')}
      </div>
    </div>
  `;
}

/* ── renderMaintenanceWorker ──────────────────────────────────── */
function renderMaintenanceWorker(){
  setDoc();
  const md=maintenanceData();
  const active=(data.tickets||[]).filter(t=>!['completed','rejected','cancelled'].includes(t.status));
  const team=active.filter(t=>maintenanceAssignees(t.id).length>1);
  const history=(data.tickets||[]).filter(t=>['completed','rejected','cancelled'].includes(t.status));
  const upcoming=(md.schedules||[]).filter(s=>s.active&&(s.defaultTechnicianIds||[]).includes(me.id));
  const content=maintWorkerView==='team'?maintenanceWorkerOrders(team)
    :maintWorkerView==='upcoming'?maintenanceWorkerSchedules(upcoming)
    :maintWorkerView==='history'?maintenanceWorkerOrders(history,true)
    :maintenanceWorkerOrders(active);
  maintShell(me,content,{renderFn:'renderMaintenanceWorker'});
}

/* ── renderMaintenanceSupervisor ──────────────────────────────── */
function maintenanceSupervisorDashboard(){
  const tickets=data.tickets||[];
  const reportsData=data.reports||[];
  const workers=(data.users||[]).filter(u=>(u.roles||[u.role]).includes('maintenance_worker'));
  const submitted=tickets.filter(t=>t.status==='submitted');
  const waiting=tickets.filter(t=>t.status==='waiting_verification');
  const inProgress=tickets.filter(t=>['assigned','accepted','diagnosing','in_progress','awaiting_parts','awaiting_vendor','awaiting_permit','on_hold'].includes(t.status));
  const breached=tickets.filter(t=>t.slaBreached&&!['completed','rejected','cancelled'].includes(t.status));
  const pendingReports=reportsData.filter(r=>(r.approvalStatus||'pending')==='pending');
  const upcoming=(maintenanceData().schedules||[]).filter(s=>s.active&&new Date(s.nextRunAt)-Date.now()<7*86400000);
  const attention=[...breached,...waiting.filter(t=>!breached.some(b=>b.id===t.id))].slice(0,5);
  return `<div class="supervisorDashboard">
    <div class="supStats">
      ${supStat(submitted.length,lang==='ar'?'أوامر جديدة':'New Orders','tickets','bad')}
      ${supStat(waiting.length,lang==='ar'?'بانتظار التحقق':'Pending Verify','check','warn')}
      ${supStat(inProgress.length,lang==='ar'?'جارٍ التنفيذ':'In Progress','sync','brand')}
      ${supStat(pendingReports.length,lang==='ar'?'تقارير للمراجعة':'Reports to Review','reports','ok')}
    </div>
    <div class="wCard supervisorDashboardAlert">
      <div><div class="supervisorDashboardAlert-title">${ic(breached.length?'bell':'check',16)} ${lang==='ar'?'حالة تشغيل الصيانة':'Maintenance operations status'}</div>
      <div class="supervisorDashboardAlert-sub">${breached.length
        ?(lang==='ar'?`${num(breached.length)} أمر عمل تجاوز اتفاقية الخدمة`:`${breached.length} work orders breached SLA`)
        :(lang==='ar'?'لا توجد تجاوزات SLA حالياً':'No active SLA breaches')}</div></div>
      <button class="btn secondary sm" onclick="supervisorView='requests';mobileNavActive='supervisor-requests';renderMaintenanceSupervisor()">${lang==='ar'?'أوامر العمل':'Work Orders'}</button>
    </div>
    <div class="wCard">
      <div class="wCard-title">${ic('dashboard',16)} ${lang==='ar'?'اختصارات التشغيل':'Operational shortcuts'}</div>
      <div class="quickActionGrid quickActionGrid--supervisor">
        <button class="quickAction" onclick="supervisorView='requests';mobileNavActive='supervisor-requests';renderMaintenanceSupervisor()"><span>${ic('tickets',18)}</span><b>${tr('maintOrders')}</b><small>${num(submitted.length+waiting.length+inProgress.length)}</small></button>
        <button class="quickAction" onclick="supervisorView='team';mobileNavActive='supervisor-team';renderMaintenanceSupervisor()"><span>${ic('users',18)}</span><b>${tr('maintTeam')}</b><small>${num(workers.length)}</small></button>
        <button class="quickAction" onclick="supervisorView='reports';mobileNavActive='supervisor-reports';renderMaintenanceSupervisor()"><span>${ic('reports',18)}</span><b>${tr('reports')}</b><small>${num(pendingReports.length)}</small></button>
      </div>
    </div>
    <div class="supSectionsGrid">
      <div class="wCard"><div class="wCard-title">${ic('bell',16)} ${lang==='ar'?'تحتاج متابعة':'Needs Attention'} ${countBubble(attention.length,'warn')}</div>
        ${attention.length?`<div class="wCard-list">${maintenanceOrderMini(attention)}</div>`:`<div class="empty-state"><div class="empty-icon">${ic('check',24)}</div><div class="empty-title">${lang==='ar'?'لا توجد أوامر حرجة':'No critical orders'}</div></div>`}
      </div>
      <div class="wCard"><div class="wCard-title">${ic('clock',16)} ${tr('maintUpcoming')} ${countBubble(upcoming.length)}</div>
        ${maintenanceScheduleMini(upcoming.slice(0,5))}
      </div>
    </div>
  </div>`;
}

function maintenanceSupervisorRequests(){
  const tickets=data.tickets||[];
  const submitted=tickets.filter(t=>t.status==='submitted');
  const waiting=tickets.filter(t=>t.status==='waiting_verification');
  const active=tickets.filter(t=>['assigned','accepted','diagnosing','in_progress','awaiting_parts','awaiting_vendor','awaiting_permit','on_hold','reclean_required'].includes(t.status));
  const group=(title,icon,items,color='')=>`<div class="wCard${items.length>2?' wCard--full':''}">
    <div class="wCard-title">${ic(icon,16)} ${title} ${countBubble(items.length,color)}</div>
    ${items.length?`<div class="ticketGrid">${items.map(maintenanceOrderCard).join('')}</div>`:`<div class="empty-state"><div class="empty-icon">${ic('check',24)}</div><div class="empty-title">${lang==='ar'?'لا توجد أوامر':'No work orders'}</div></div>`}
  </div>`;
  return `<div class="pageHeader"><div><div class="pageTitle">${tr('maintOrders')}</div><div class="pageSub">${tickets.length} ${lang==='ar'?'أمر عمل':'work orders'}</div></div>
    <button class="btn" onclick="showMaintenanceOrderForm()">${ic('plus',15)} ${tr('maintTicketCreate')}</button></div>
    <div class="supSectionsGrid">
      ${group(lang==='ar'?'أوامر جديدة':'New Orders','tickets',submitted,'bad')}
      ${group(lang==='ar'?'بانتظار التحقق':'Pending Verification','check',waiting,'warn')}
      ${group(lang==='ar'?'قيد التنفيذ والمتابعة':'Active Team Queue','sync',active,'brand')}
    </div>`;
}

function maintenanceSupervisorTeam(){
  const workers=(data.users||[]).filter(u=>(u.roles||[u.role]).includes('maintenance_worker'));
  const assignees=maintenanceData().assignees||[];
  return `<div class="pageHeader"><div><div class="pageTitle">${tr('maintTeam')}</div><div class="pageSub">${workers.length} ${lang==='ar'?'فني':'technicians'}</div></div></div>
    <div class="wCard"><div class="wCard-title">${ic('users',16)} ${lang==='ar'?'حالة فريق الصيانة':'Maintenance Team Status'} ${countBubble(workers.length)}</div>
    ${workers.length?`<div class="supTeamGrid">${workers.map(w=>{const assigned=assignees.filter(a=>a.technicianId===w.id&&!['completed','cancelled'].includes(a.status));const lead=assigned.filter(a=>a.isLead).length;return `<div class="supTeamCard"><div class="supTeamCard-info"><div class="supTeamCard-name">${esc(w.name)}</div><div class="supTeamCard-meta">${assigned.length} ${lang==='ar'?'أوامر نشطة':'active orders'}${lead?` · ${lead} ${tr('leadTechnician')}`:''}</div></div>${assigned.length?`<span class="badge warn">${assigned.length}</span>`:`<span class="badge ok">${lang==='ar'?'متاح':'Free'}</span>`}</div>`}).join('')}</div>`:`<div class="empty-state"><div class="empty-icon">${ic('users',24)}</div><div class="empty-title">${lang==='ar'?'لا يوجد فنيون':'No technicians'}</div></div>`}
    </div>`;
}

function renderMaintenanceSupervisor(){
  setDoc();
  const content=supervisorView==='requests'?maintenanceSupervisorRequests()
    :supervisorView==='team'?maintenanceSupervisorTeam()
    :supervisorView==='reports'?reports()
    :maintenanceSupervisorDashboard();
  app.innerHTML=fieldShell(me,content,{sync:true,noSticky:true});
}

/* ── renderMaintenanceManager ─────────────────────────────────── */
function renderMaintenanceManager(){
  setDoc();
  maintShell(me,maintenancePageContent(),{renderFn:'renderMaintenanceManager'});
}

function renderAdminMaintenance(){
  setDoc();
  const fullData = data;
  data = {
    ...fullData,
    tickets:(fullData.tickets||[]).filter(t=>t.module==='maintenance'),
    reports:(fullData.reports||[]).filter(r=>r.module==='maintenance'),
    users:(fullData.users||[]).filter(u=>(u.roles||[u.role]).some(r=>String(r).startsWith('maintenance_')))
  };
  maintShell(me,`${moduleContextBar('maintenanceModuleLabel')}${maintenancePageContent()}`,{renderFn:'renderAdminMaintenance'});
  data = fullData;
}

function maintenanceData(){return data.maintenance||{assets:[],schedules:[],parts:[],assignees:[],orderParts:[]}}
function maintenanceAssignees(orderId){return (maintenanceData().assignees||[]).filter(a=>a.workOrderId===orderId)}
function maintenanceOrderParts(orderId){return (maintenanceData().orderParts||[]).filter(p=>p.workOrderId===orderId)}
function maintTypeLabel(v){return tr(v==='emergency'?'emergency_maintenance':v||'corrective')}

function maintenancePageContent(){
  return maintView==='orders'?maintenanceOrdersPage()
    :maintView==='schedules'?maintenanceSchedulesPage()
    :maintView==='assets'?maintenanceAssetsPage()
    :maintView==='team'?maintenanceTeamPage()
    :maintView==='parts'?maintenancePartsPage()
    :maintView==='reports'?maintenanceReportsPage()
    :maintenanceOperationsDashboard();
}

function maintenanceOperationsDashboard(){
  const md=maintenanceData(), tickets=data.tickets||[], active=tickets.filter(t=>!['completed','rejected','cancelled'].includes(t.status));
  const breached=active.filter(t=>t.slaBreached), down=(md.assets||[]).filter(a=>a.status==='down'), low=(md.parts||[]).filter(p=>p.lowStock);
  const done=tickets.filter(t=>t.status==='completed'&&t.completionTimeMins!=null);
  const mttr=done.length?Math.round(done.reduce((s,t)=>s+t.completionTimeMins,0)/done.length):0;
  const upcoming=(md.schedules||[]).filter(s=>s.active&&new Date(s.nextRunAt)-Date.now()<7*86400000).length;
  const greeting=lang==='ar'?(new Date().getHours()<12?'صباح الخير':'مساء الخير'):(new Date().getHours()<12?'Good morning':'Good afternoon');
  return `<div class="dashHero"><div class="dashHero-left"><span class="dashHero-greeting">${tr(me.role)} · ${tr('maintenanceModuleLabel')}</span>
    <div class="dashHero-title">${greeting}، ${esc(me.name.split(' ')[0])}</div><p class="dashHero-sub">${active.length} ${tr('maintOrders')} · ${upcoming} ${tr('maintUpcoming')} · ${fmtDate(new Date())}</p>
    <div class="dashHero-actions"><button class="dashHero-action" onclick="maintView='orders';render()">${ic('tickets',14)} ${tr('maintOrders')}</button><button class="dashHero-action" onclick="maintView='schedules';render()">${ic('clock',14)} ${tr('maintSchedules')}</button></div></div>
    <div class="dashHero-right"><div class="dashHero-stat"><div class="dashHero-stat-val">${active.length}</div><div class="dashHero-stat-lbl">${tr('openTickets')}</div></div><div class="dashHero-stat"><div class="dashHero-stat-val">${upcoming}</div><div class="dashHero-stat-lbl">${tr('maintUpcoming')}</div></div><div class="dashHero-stat"><div class="dashHero-stat-val">${mttr||'—'}</div><div class="dashHero-stat-lbl">MTTR ${tr('mins')}</div></div></div></div>
    <div class="kpiGrid">${kpiCard(active.length,tr('maintOrders'),'tickets','brand')}${kpiCard(breached.length,tr('slaBreached'),'bell',breached.length?'bad':'ok')}${kpiCard(down.length,lang==='ar'?'أصول متوقفة':'Assets Down','building',down.length?'bad':'ok')}${kpiCard(low.length,lang==='ar'?'مخزون منخفض':'Low Stock','tool',low.length?'warn':'ok')}</div>
    <div class="contentGrid"><div class="card"><div class="card-head"><span class="card-title">${tr('maintUpcoming')}</span><button class="btn secondary sm" onclick="maintView='schedules';render()">${tr('maintSchedules')}</button></div>${maintenanceScheduleMini((md.schedules||[]).filter(s=>s.active).slice(0,5))}</div>
    <div class="card"><div class="card-head"><span class="card-title">${lang==='ar'?'أوامر تحتاج متابعة':'Orders needing attention'}</span></div>${maintenanceOrderMini(active.slice(0,5))}</div></div>`;
}

function maintenanceOrderMini(items){return items.length?items.map(t=>`<div class="list-row"><div class="list-icon">${ic('tool',17)}</div><div class="list-body"><div class="list-title">${esc(t.title)}</div><div class="list-sub">${esc(t.referenceNo)} · ${esc(t.locationNameAr)}</div></div>${maintStatusBadge(t.status)}</div>`).join(''):`<div class="empty-state"><div class="empty-title">${tr('noData')}</div></div>`}
function maintenanceScheduleMini(items){return items.length?items.map(s=>`<div class="list-row"><div class="list-icon">${ic('clock',17)}</div><div class="list-body"><div class="list-title">${esc(lang==='ar'?s.titleAr:s.titleEn||s.titleAr)}</div><div class="list-sub">${fmt(s.nextRunAt)} · ${scheduleFrequencyLabel(s)}</div></div><span class="badge ${new Date(s.nextRunAt)<new Date()?'bad':'brand'}">${s.active?tr('activeUser'):tr('inactive')}</span></div>`).join(''):`<div class="empty-state"><div class="empty-title">${tr('noData')}</div></div>`}

function maintenanceOrdersPage(){
  const tickets=data.tickets||[]; const canCreate=['system_admin','facility_manager','maintenance_manager','maintenance_supervisor'].includes(me.role);
  return `<div class="pageHeader"><div class="pageHeader-left"><div class="pageTitle">${tr('maintOrders')}</div><div class="pageSub">${tickets.length} ${lang==='ar'?'أمر عمل':'work orders'}</div></div>${canCreate?`<button class="btn" onclick="showMaintenanceOrderForm()">${ic('plus',15)} ${tr('maintTicketCreate')}</button>`:''}</div>
    <div class="ticketGrid">${tickets.length?tickets.map(maintenanceOrderCard).join(''):`<div class="card"><div class="empty-state"><div class="empty-title">${tr('noTickets')}</div></div></div>`}</div>`;
}

function maintenanceOrderCard(t){
  const team=maintenanceAssignees(t.id), parts=maintenanceOrderParts(t.id), asset=(maintenanceData().assets||[]).find(a=>a.id===t.assetId);
  return `<div class="ticketCard"><div class="ticketCard-top"><div class="ticketCard-main"><div class="ticketCard-title">${esc(t.title)}</div><div class="ticketCard-ref">${esc(t.referenceNo)}</div></div>${maintStatusBadge(t.status)}</div>
    <div class="ticketCard-meta"><span>${ic('locations',12)} ${esc(lang==='ar'?t.locationNameAr:t.locationNameEn)}</span>${asset?`<span>${ic('building',12)} ${esc(lang==='ar'?asset.nameAr:asset.nameEn||asset.nameAr)}</span>`:''}</div>
    <div class="ticketCard-badges"><span class="badge brand">${maintTypeLabel(t.maintenanceType)}</span><span class="badge">${maintCatLabel(t.category)}</span>${slaBadge(t)}${team.length?`<span class="badge ok">${ic('users',11)} ${team.length} ${lang==='ar'?'فني':'techs'}</span>`:`<span class="badge warn">${tr('unassigned')}</span>`}${parts.length?`<span class="badge gold">${ic('tool',11)} ${parts.length}</span>`:''}</div>
    ${team.length?`<div class="ticketCard-requester">${team.map(a=>`${a.isLead?'★ ':''}${esc(a.technicianName)}`).join(' · ')}</div>`:''}
    <div class="ticketCard-actions"><button class="btn secondary sm" onclick="openTicketDetail('${t.id}')">${lang==='ar'?'التفاصيل':'Details'}</button>
      ${['system_admin','facility_manager','maintenance_manager','maintenance_supervisor'].includes(me.role)?`<button class="btn secondary sm" onclick="showMaintenanceTeamForm('${t.id}')">${ic('users',13)} ${lang==='ar'?'إسناد فريق':'Assign Team'}</button>`:''}
      ${['system_admin','facility_manager','maintenance_manager','maintenance_supervisor','maintenance_worker'].includes(me.role)?`<button class="btn secondary sm" onclick="showMaintenanceUsePart('${t.id}')">${ic('tool',13)} ${lang==='ar'?'صرف قطعة':'Use Part'}</button>`:''}
      ${t.status==='waiting_verification'&&['system_admin','facility_manager','maintenance_manager','maintenance_supervisor'].includes(me.role)?`<button class="btn ok sm" onclick="maintUpdateTicket('${t.id}',{status:'completed'},'${me.role==='maintenance_supervisor'?'renderMaintenanceSupervisor':'renderMaintenanceManager'}')">${tr('approve')}</button>`:''}
    </div></div>`;
}

function maintenanceSchedulesPage(){
  const items=maintenanceData().schedules||[]; const canEdit=['system_admin','facility_manager','maintenance_manager','maintenance_supervisor'].includes(me.role);
  return `<div class="pageHeader"><div><div class="pageTitle">${tr('maintSchedules')}</div><div class="pageSub">${items.length} ${lang==='ar'?'خطة':'plans'}</div></div>${canEdit?`<button class="btn" onclick="showMaintenanceScheduleForm()">${ic('plus',15)} ${lang==='ar'?'خطة دورية':'New Plan'}</button>`:''}</div>
    <div class="contentGrid">${items.length?items.map(s=>`<div class="card"><div class="card-head"><span class="card-title">${ic('clock',16)} ${esc(lang==='ar'?s.titleAr:s.titleEn||s.titleAr)}</span><span class="badge ${s.active?'ok':'bad'}">${s.active?tr('activeUser'):tr('inactive')}</span></div>
    <div class="perfStatGrid"><div class="perfStatRow"><span>${lang==='ar'?'التكرار':'Frequency'}</span><b>${scheduleFrequencyLabel(s)}</b></div><div class="perfStatRow"><span>${lang==='ar'?'التنفيذ القادم':'Next run'}</span><b>${fmt(s.nextRunAt)}</b></div><div class="perfStatRow"><span>${tr('maintAssets')}</span><b>${(s.assetIds||[]).length}</b></div><div class="perfStatRow"><span>${tr('maintTeam')}</span><b>${(s.defaultTechnicianIds||[]).length}</b></div></div>
    ${canEdit?`<div class="ticketCard-actions"><button class="btn secondary sm" onclick="runMaintenanceSchedule('${s.id}')">${lang==='ar'?'إنشاء أمر الآن':'Run now'}</button></div>`:''}</div>`).join(''):`<div class="card"><div class="empty-state"><div class="empty-title">${tr('noData')}</div></div></div>`}</div>`;
}
function scheduleFrequencyLabel(s){const unit={daily:lang==='ar'?'يوم':'day',weekly:lang==='ar'?'أسبوع':'week',monthly:lang==='ar'?'شهر':'month',quarterly:lang==='ar'?'ربع سنة':'quarter',yearly:lang==='ar'?'سنة':'year'}[s.frequencyUnit]||s.frequencyUnit;return `${lang==='ar'?'كل':'Every'} ${s.frequencyValue} ${unit}`}

function maintenanceAssetsPage(){
  const items=maintenanceData().assets||[]; const canEdit=['system_admin','facility_manager','maintenance_manager'].includes(me.role);
  return `<div class="pageHeader"><div><div class="pageTitle">${tr('maintAssets')}</div><div class="pageSub">${items.length} ${lang==='ar'?'أصل':'assets'}</div></div>${canEdit?`<button class="btn" onclick="showMaintenanceAssetForm()">${ic('plus',15)} ${lang==='ar'?'إضافة أصل':'Add Asset'}</button>`:''}</div>
    <div class="productGrid">${items.length?items.map(a=>`<div class="productCard productCard--admin"><div class="productCard-img">${ic('building',28)}</div><div class="productCard-body"><div class="productCard-title">${esc(lang==='ar'?a.nameAr:a.nameEn||a.nameAr)}</div><div class="productCard-desc">${esc(a.code)} · ${esc(a.serialNo||'—')}</div><div class="productCard-badges"><span class="badge ${a.status==='operational'?'ok':a.status==='down'?'bad':'warn'}">${assetStatusLabel(a.status)}</span><span class="badge">${maintCatLabel(a.category)}</span><span class="badge ${a.criticality==='critical'?'bad':''}">${a.criticality}</span></div></div></div>`).join(''):`<div class="card"><div class="empty-state"><div class="empty-title">${tr('noData')}</div></div></div>`}</div>`;
}
function assetStatusLabel(s){return ({operational:lang==='ar'?'يعمل':'Operational',down:lang==='ar'?'متوقف':'Down',maintenance:lang==='ar'?'تحت الصيانة':'Under Maintenance',retired:lang==='ar'?'مستبعد':'Retired'}[s]||s)}

function maintenanceTeamPage(){
  const workers=(data.users||[]).filter(u=>u.role==='maintenance_worker'), tickets=data.tickets||[];
  return `<div class="pageHeader"><div><div class="pageTitle">${tr('maintTeam')}</div><div class="pageSub">${workers.length} ${lang==='ar'?'فني':'technicians'}</div></div></div><div class="supTeamGrid">${workers.map(w=>{const assigned=(maintenanceData().assignees||[]).filter(a=>a.technicianId===w.id&&!['completed'].includes(a.status));const lead=assigned.filter(a=>a.isLead).length;return `<div class="supTeamCard"><div class="supTeamCard-info"><div class="supTeamCard-name">${esc(w.name)}</div><div class="supTeamCard-meta">${assigned.length} ${tr('openTasks')} · ${lead} ${tr('leadTechnician')}</div></div><span class="badge ${assigned.length?'warn':'ok'}">${assigned.length?assigned.length:(lang==='ar'?'متاح':'Free')}</span></div>`}).join('')}</div>`;
}

function maintenancePartsPage(){
  const items=maintenanceData().parts||[];const canEdit=['system_admin','facility_manager','maintenance_manager','maintenance_supervisor'].includes(me.role);
  return `<div class="pageHeader"><div><div class="pageTitle">${tr('maintParts')}</div><div class="pageSub">${items.length} ${lang==='ar'?'صنف':'items'}</div></div>${canEdit?`<button class="btn" onclick="showMaintenancePartForm()">${ic('plus',15)} ${lang==='ar'?'إضافة قطعة':'Add Part'}</button>`:''}</div><div class="contentGrid">${items.map(p=>`<div class="card"><div class="card-head"><span class="card-title">${esc(lang==='ar'?p.nameAr:p.nameEn||p.nameAr)}</span><span class="badge ${p.lowStock?'bad':'ok'}">${p.quantity} ${esc(p.unit)}</span></div><div class="pageSub">${esc(p.sku)} · ${lang==='ar'?'حد الطلب':'Reorder'}: ${p.reorderLevel} · ${p.unitCost}</div></div>`).join('')||`<div class="card"><div class="empty-state"><div class="empty-title">${tr('noData')}</div></div></div>`}</div>`;
}
function maintenanceReportsPage(){const parts=maintenanceData().orderParts||[];const partsCost=parts.reduce((s,p)=>s+p.totalCost,0);const labor=(data.tickets||[]).reduce((s,t)=>s+(Number(t.laborCost)||0),0);return `<div class="kpiGrid">${kpiCard(partsCost.toFixed(2),lang==='ar'?'تكلفة القطع':'Parts Cost','tool','gold')}${kpiCard(labor.toFixed(2),lang==='ar'?'تكلفة العمل':'Labor Cost','users','brand')}${kpiCard((data.reports||[]).length,tr('reports'),'reports','ok')}${kpiCard((data.tickets||[]).filter(t=>t.status==='completed').length,tr('completed'),'check','ok')}</div>${reports()}`}

function maintenanceWorkerOrders(items,history=false){return `<div class="pageHeader"><div><div class="pageTitle">${history?tr('maintHistory'):tr('maintMyTasks')}</div><div class="pageSub">${items.length} ${tr('maintOrders')}</div></div></div>${items.length?items.map(t=>maintenanceWorkerOrderCard(t,history)).join(''):`<div class="wCard"><div class="empty-state"><div class="empty-title">${tr('noData')}</div></div></div>`}`}
function maintenanceWorkerOrderCard(t,history){const team=maintenanceAssignees(t.id);return `<div class="wCard"><div class="ticketCard-top"><div><div class="ticketCard-title">${esc(t.title)}</div><div class="ticketCard-ref">${esc(t.referenceNo)}</div></div>${maintStatusBadge(t.status)}</div><div class="ticketCard-meta"><span>${esc(t.locationNameAr)}</span><span>${maintTypeLabel(t.maintenanceType)}</span></div>${team.length>1?`<div class="ticketCard-requester">${ic('users',12)} ${team.map(a=>`${a.isLead?'★ ':''}${esc(a.technicianName)}`).join(' · ')}</div>`:''}${!history?maintenanceWorkerActions(t):''}</div>`}
function maintenanceWorkerActions(t){const action=(status,label,cls='secondary')=>`<button class="btn ${cls} sm" onclick="maintWorkerStatus('${t.id}','${status}')">${label}</button>`;return `<div class="ticketCard-actions">${t.status==='assigned'?action('accepted',lang==='ar'?'قبول':'Accept','ok'):''}${['accepted','on_hold'].includes(t.status)?action('diagnosing',tr('diagnosing')):''}${t.status==='diagnosing'?action('in_progress',lang==='ar'?'بدء الإصلاح':'Start Repair','ok'):''}${['diagnosing','in_progress'].includes(t.status)?`${action('awaiting_parts',tr('awaiting_parts'),'warn')}${action('awaiting_vendor',tr('awaiting_vendor'),'warn')}${action('awaiting_permit',tr('awaiting_permit'),'warn')}`:''}<button class="btn secondary sm" onclick="showMaintenanceUsePart('${t.id}')">${ic('tool',12)} ${lang==='ar'?'صرف قطعة':'Use Part'}</button>${['in_progress','diagnosing'].includes(t.status)?`<button class="btn ok sm" onclick="showMaintenanceCloseForm('${t.id}')">${lang==='ar'?'طلب الإغلاق':'Request Close'}</button>`:''}</div>`}
function maintenanceWorkerSchedules(items){return `<div class="pageHeader"><div class="pageTitle">${tr('maintUpcoming')}</div></div><div>${maintenanceScheduleMini(items)}</div>`}

function maintenanceWorkerChecks(selected=[]){
  const workers=(data.users||[]).filter(u=>u.role==='maintenance_worker');
  return workers.map(w=>`<label class="taskItem"><input type="checkbox" class="maint-tech-check" value="${w.id}" ${selected.includes(w.id)?'checked':''}><span class="taskItem-label">${esc(w.name)}</span></label>`).join('');
}
function selectedMaintenanceTechnicians(){return [...document.querySelectorAll('.maint-tech-check:checked')].map(x=>x.value)}

function showMaintenanceOrderForm(){
  const md=maintenanceData(), workers=(data.users||[]).filter(u=>u.role==='maintenance_worker');
  const body=`<div class="formGrid">${fc(tr('title'),inp('mwo-title',{value:lang==='ar'?'أمر صيانة جديد':'New maintenance order'}))}${fc(tr('location'),sel('mwo-location',(data.locations||[]).map(l=>({v:l.id,l:locName(l)}))))}${fc(lang==='ar'?'نوع الصيانة':'Maintenance Type',sel('mwo-type',[{v:'corrective',l:tr('corrective')},{v:'emergency',l:tr('emergency_maintenance')},{v:'preventive',l:tr('preventive')}]))}${fc(tr('reqCategory'),sel('mwo-category',MAINT_CATS.map(c=>({v:c,l:maintCatLabel(c)}))))}${fc(tr('maintAssets'),sel('mwo-asset',[{v:'',l:'—'},...(md.assets||[]).map(a=>({v:a.id,l:lang==='ar'?a.nameAr:a.nameEn||a.nameAr}))]))}${fc(tr('priority'),sel('mwo-priority',[{v:'high',l:tr('high')},{v:'medium',l:tr('medium'),sel:true},{v:'low',l:tr('low')}]))}</div>${fc(tr('description'),ta('mwo-desc','',{rows:3}))}<div class="field"><label>${tr('maintTeam')}</label><div class="taskChecklist">${maintenanceWorkerChecks()}</div></div>${fc(tr('leadTechnician'),sel('mwo-lead',[{v:'',l:'—'},...workers.map(w=>({v:w.id,l:w.name}))]))}`;
  const foot=`<button class="btn" onclick="saveMaintenanceOrder()">${ic('check',15)} ${tr('save')}</button><button class="btn secondary" onclick="document.getElementById('maintenanceOrderModal').remove()">${tr('cancel')}</button>`;
  showModal('maintenanceOrderModal',tr('maintTicketCreate'),body,foot,{wide:true});
}
async function saveMaintenanceOrder(){
  const techs=selectedMaintenanceTechnicians();
  try{await api('/maintenance-tickets',{method:'POST',body:JSON.stringify({title:document.getElementById('mwo-title').value,description:document.getElementById('mwo-desc').value,locationId:document.getElementById('mwo-location').value,maintenanceType:document.getElementById('mwo-type').value,category:document.getElementById('mwo-category').value,assetId:document.getElementById('mwo-asset').value,priority:document.getElementById('mwo-priority').value,technicianIds:techs,leadTechnicianId:document.getElementById('mwo-lead').value})});document.getElementById('maintenanceOrderModal')?.remove();toast(tr('saved'),'ok');await load();}catch(e){toast(e.message,'bad')}
}
function showMaintenanceTeamForm(orderId){
  const current=maintenanceAssignees(orderId), selected=current.map(a=>a.technicianId), workers=(data.users||[]).filter(u=>u.role==='maintenance_worker');
  const body=`<div class="taskChecklist">${maintenanceWorkerChecks(selected)}</div>${fc(tr('leadTechnician'),sel('maint-team-lead',[{v:'',l:'—'},...workers.map(w=>({v:w.id,l:w.name,sel:current.some(a=>a.isLead&&a.technicianId===w.id)}))]))}`;
  const foot=`<button class="btn" onclick="saveMaintenanceTeam('${orderId}')">${tr('save')}</button><button class="btn secondary" onclick="document.getElementById('maintenanceTeamModal').remove()">${tr('cancel')}</button>`;
  showModal('maintenanceTeamModal',lang==='ar'?'إسناد فريق الصيانة':'Assign Maintenance Team',body,foot);
}
async function saveMaintenanceTeam(orderId){try{await api(`/maintenance-tickets/${orderId}/team`,{method:'POST',body:JSON.stringify({technicianIds:selectedMaintenanceTechnicians(),leadTechnicianId:document.getElementById('maint-team-lead').value})});document.getElementById('maintenanceTeamModal')?.remove();toast(tr('saved'),'ok');await load();}catch(e){toast(e.message,'bad')}}

function showMaintenanceScheduleForm(){
  const md=maintenanceData(), workers=(data.users||[]).filter(u=>u.role==='maintenance_worker');const tomorrow=new Date(Date.now()+86400000).toISOString().slice(0,16);
  const body=`<div class="formGrid">${fc(lang==='ar'?'اسم الخطة':'Plan Name',inp('mps-title',{value:lang==='ar'?'صيانة دورية':'Preventive maintenance'}))}${fc(tr('location'),sel('mps-location',(data.locations||[]).map(l=>({v:l.id,l:locName(l)}))))}${fc(tr('maintAssets'),sel('mps-asset',[{v:'',l:'—'},...(md.assets||[]).map(a=>({v:a.id,l:lang==='ar'?a.nameAr:a.nameEn||a.nameAr}))]))}${fc(tr('reqCategory'),sel('mps-category',MAINT_CATS.map(c=>({v:c,l:maintCatLabel(c)}))))}${fc(lang==='ar'?'التكرار':'Frequency',sel('mps-frequency',[{v:'daily',l:lang==='ar'?'يومي':'Daily'},{v:'weekly',l:lang==='ar'?'أسبوعي':'Weekly'},{v:'monthly',l:lang==='ar'?'شهري':'Monthly'},{v:'quarterly',l:lang==='ar'?'ربع سنوي':'Quarterly'},{v:'yearly',l:lang==='ar'?'سنوي':'Yearly'}]))}${fc(lang==='ar'?'التنفيذ القادم':'Next Run',inp('mps-next',{type:'datetime-local',value:tomorrow}))}${fc(lang==='ar'?'المدة المتوقعة بالدقائق':'Estimated Minutes',inp('mps-mins',{type:'number',value:60}))}</div>${fc(lang==='ar'?'قائمة الفحص — بند في كل سطر':'Checklist — one item per line',ta('mps-checklist',MAINT_TASKS.map(x=>lang==='ar'?x[0]:x[1]).join('\n'),{rows:5}))}<div class="field"><label>${tr('maintTeam')}</label><div class="taskChecklist">${maintenanceWorkerChecks()}</div></div>${fc(tr('leadTechnician'),sel('mps-lead',[{v:'',l:'—'},...workers.map(w=>({v:w.id,l:w.name}))]))}`;
  const foot=`<button class="btn" onclick="saveMaintenanceSchedule()">${tr('save')}</button><button class="btn secondary" onclick="document.getElementById('maintenanceScheduleModal').remove()">${tr('cancel')}</button>`;showModal('maintenanceScheduleModal',tr('maintSchedules'),body,foot,{wide:true});
}
async function saveMaintenanceSchedule(){try{await api('/maintenance/schedules',{method:'POST',body:JSON.stringify({titleAr:document.getElementById('mps-title').value,locationId:document.getElementById('mps-location').value,assetIds:[document.getElementById('mps-asset').value].filter(Boolean),category:document.getElementById('mps-category').value,frequencyUnit:document.getElementById('mps-frequency').value,frequencyValue:1,nextRunAt:new Date(document.getElementById('mps-next').value).toISOString(),estimatedMins:Number(document.getElementById('mps-mins').value),checklist:document.getElementById('mps-checklist').value.split('\n').map(x=>x.trim()).filter(Boolean),defaultTechnicianIds:selectedMaintenanceTechnicians(),leadTechnicianId:document.getElementById('mps-lead').value})});document.getElementById('maintenanceScheduleModal')?.remove();toast(tr('saved'),'ok');await load();}catch(e){toast(e.message,'bad')}}
async function runMaintenanceSchedule(id){try{await api(`/maintenance/schedules/${id}/run`,{method:'POST'});toast(lang==='ar'?'تم إنشاء أمر العمل':'Work order created','ok');await load();}catch(e){toast(e.message,'bad')}}

function showMaintenanceAssetForm(){const body=`<div class="formGrid">${fc(lang==='ar'?'رمز الأصل':'Asset Code',inp('mas-code'))}${fc(lang==='ar'?'اسم الأصل':'Asset Name',inp('mas-name'))}${fc(tr('reqCategory'),sel('mas-category',MAINT_CATS.map(c=>({v:c,l:maintCatLabel(c)}))))}${fc(tr('location'),sel('mas-location',(data.locations||[]).map(l=>({v:l.id,l:locName(l)}))))}${fc(lang==='ar'?'الرقم التسلسلي':'Serial Number',inp('mas-serial'))}${fc(lang==='ar'?'الشركة المصنعة':'Manufacturer',inp('mas-maker'))}${fc(lang==='ar'?'الموديل':'Model',inp('mas-model'))}${fc(lang==='ar'?'الأهمية':'Criticality',sel('mas-critical',[{v:'low',l:'Low'},{v:'medium',l:'Medium'},{v:'high',l:'High'},{v:'critical',l:'Critical'}]))}${fc(lang==='ar'?'الضمان حتى':'Warranty Until',inp('mas-warranty',{type:'date'}))}</div>`;showModal('maintenanceAssetModal',tr('maintAssets'),body,`<button class="btn" onclick="saveMaintenanceAsset()">${tr('save')}</button><button class="btn secondary" onclick="document.getElementById('maintenanceAssetModal').remove()">${tr('cancel')}</button>`)}
async function saveMaintenanceAsset(){try{await api('/maintenance/assets',{method:'POST',body:JSON.stringify({code:document.getElementById('mas-code').value,nameAr:document.getElementById('mas-name').value,category:document.getElementById('mas-category').value,locationId:document.getElementById('mas-location').value,serialNo:document.getElementById('mas-serial').value,manufacturer:document.getElementById('mas-maker').value,model:document.getElementById('mas-model').value,criticality:document.getElementById('mas-critical').value,warrantyUntil:document.getElementById('mas-warranty').value})});document.getElementById('maintenanceAssetModal')?.remove();toast(tr('saved'),'ok');await load();}catch(e){toast(e.message,'bad')}}

function showMaintenancePartForm(){const body=`<div class="formGrid">${fc('SKU',inp('mpt-sku'))}${fc(lang==='ar'?'اسم القطعة':'Part Name',inp('mpt-name'))}${fc(lang==='ar'?'الوحدة':'Unit',inp('mpt-unit',{value:lang==='ar'?'قطعة':'piece'}))}${fc(lang==='ar'?'الكمية':'Quantity',inp('mpt-qty',{type:'number',value:0}))}${fc(lang==='ar'?'حد إعادة الطلب':'Reorder Level',inp('mpt-reorder',{type:'number',value:0}))}${fc(lang==='ar'?'تكلفة الوحدة':'Unit Cost',inp('mpt-cost',{type:'number',value:0}))}${fc(tr('location'),inp('mpt-location'))}</div>`;showModal('maintenancePartModal',tr('maintParts'),body,`<button class="btn" onclick="saveMaintenancePart()">${tr('save')}</button><button class="btn secondary" onclick="document.getElementById('maintenancePartModal').remove()">${tr('cancel')}</button>`)}
async function saveMaintenancePart(){try{await api('/maintenance/parts',{method:'POST',body:JSON.stringify({sku:document.getElementById('mpt-sku').value,nameAr:document.getElementById('mpt-name').value,unit:document.getElementById('mpt-unit').value,quantity:Number(document.getElementById('mpt-qty').value),reorderLevel:Number(document.getElementById('mpt-reorder').value),unitCost:Number(document.getElementById('mpt-cost').value),location:document.getElementById('mpt-location').value})});document.getElementById('maintenancePartModal')?.remove();toast(tr('saved'),'ok');await load();}catch(e){toast(e.message,'bad')}}
function showMaintenanceUsePart(orderId){
  const parts=(maintenanceData().parts||[]).filter(p=>p.active&&p.quantity>0);
  const options=parts.map(p=>({v:p.id,l:`${lang==='ar'?p.nameAr:p.nameEn||p.nameAr} (${p.quantity})`}));
  const body=`${fc(tr('maintParts'),sel('muse-part',options))}${fc(lang==='ar'?'الكمية':'Quantity',inp('muse-qty',{type:'number',value:1}))}`;
  showModal('maintenanceUsePartModal',lang==='ar'?'صرف قطعة غيار':'Use Spare Part',body,`<button class="btn" onclick="saveMaintenanceUsePart('${orderId}')">${tr('save')}</button><button class="btn secondary" onclick="document.getElementById('maintenanceUsePartModal').remove()">${tr('cancel')}</button>`);
}
async function saveMaintenanceUsePart(orderId){try{await api(`/maintenance-tickets/${orderId}/parts`,{method:'POST',body:JSON.stringify({partId:document.getElementById('muse-part').value,quantity:Number(document.getElementById('muse-qty').value)})});document.getElementById('maintenanceUsePartModal')?.remove();toast(tr('saved'),'ok');await load();}catch(e){toast(e.message,'bad')}}

async function maintWorkerStatus(id,status){try{await api(`/maintenance-tickets/${id}`,{method:'PUT',body:JSON.stringify({status})});toast(tr('saved'),'ok');await load();}catch(e){toast(e.message,'bad')}}
function showMaintenanceCloseForm(id){const body=`${fc(lang==='ar'?'التشخيص':'Diagnosis',ta('mclose-diagnosis','',{rows:3}))}${fc(lang==='ar'?'السبب الجذري':'Root Cause',ta('mclose-root','',{rows:3}))}<div class="formGrid">${fc(lang==='ar'?'وقت التوقف بالدقائق':'Downtime Minutes',inp('mclose-down',{type:'number',value:0}))}${fc(lang==='ar'?'تكلفة العمل':'Labor Cost',inp('mclose-cost',{type:'number',value:0}))}${fc(lang==='ar'?'المورد':'Vendor',inp('mclose-vendor'))}</div>${fc(tr('notes'),ta('mclose-notes','',{rows:2}))}`;showModal('maintenanceCloseModal',lang==='ar'?'طلب إغلاق أمر العمل':'Request Work Order Closure',body,`<button class="btn ok" onclick="submitMaintenanceClose('${id}')">${tr('submit')}</button><button class="btn secondary" onclick="document.getElementById('maintenanceCloseModal').remove()">${tr('cancel')}</button>`,{wide:true})}
async function submitMaintenanceClose(id){try{await api('/maintenance-tickets/complete',{method:'POST',body:JSON.stringify({id,diagnosis:document.getElementById('mclose-diagnosis').value,rootCause:document.getElementById('mclose-root').value,downtimeMins:Number(document.getElementById('mclose-down').value),laborCost:Number(document.getElementById('mclose-cost').value),vendorName:document.getElementById('mclose-vendor').value,notes:document.getElementById('mclose-notes').value})});document.getElementById('maintenanceCloseModal')?.remove();toast(tr('saved'),'ok');await load();}catch(e){toast(e.message,'bad')}}

/* ── maintenance actions ──────────────────────────────────────── */
async function maintUpdateTicket(id, update, renderFn){
  const res = await fetch(`/api/maintenance-tickets/${id}`, {method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(update)});
  const j   = await res.json();
  if(!res.ok){ toast(j.error||'Error','error'); return; }
  const idx = (data.tickets||[]).findIndex(t=>t.id===id);
  if(idx>=0) data.tickets[idx]=j.ticket; else (data.tickets=data.tickets||[]).unshift(j.ticket);
  window[renderFn]();
}

function maintAcceptTicket(id,renderFn){ maintUpdateTicket(id,{status:'accepted'},renderFn); }
function maintStartTicket(id,renderFn){ maintUpdateTicket(id,{status:'in_progress'},renderFn); }
function maintVerifyTicket(id,status,renderFn){ maintUpdateTicket(id,{status},renderFn); }

function maintAssignTicket(id, renderFn){
  const workers = (data.users||[]).filter(u=>u.role==='maintenance_worker');
  const opts = workers.map(w=>`<option value="${w.id}">${esc(w.name)}</option>`).join('');
  showModal('maintAssign', lang==='ar'?'تعيين فني':'Assign Technician',
    `<select id="maintWorkerSel" class="form-control">${opts}</select>`,
    async ()=>{
      const wId = document.getElementById('maintWorkerSel')?.value;
      if(!wId) return;
      await maintUpdateTicket(id,{assignedTo:wId,status:'assigned'},renderFn);
    });
}

function maintCompleteTicket(id, renderFn){
  showModal('maintComplete', lang==='ar'?'إغلاق البلاغ':'Close Ticket',
    `<textarea id="maintNotes" class="form-control" rows="3" placeholder="${lang==='ar'?'ملاحظات الإغلاق':'Closing notes'}"></textarea>`,
    async ()=>{
      const notes = document.getElementById('maintNotes')?.value||'';
      const res = await fetch('/api/maintenance-tickets/complete',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,notes})});
      const j   = await res.json();
      if(!res.ok){ toast(j.error||'Error','error'); return; }
      const idx = (data.tickets||[]).findIndex(t=>t.id===id);
      if(idx>=0) data.tickets[idx]=j.ticket; else (data.tickets=data.tickets||[]).unshift(j.ticket);
      window[renderFn]();
    });
}

async function maintReviewReport(id, status, renderFn){
  const res = await fetch('/api/maintenance-reports/review',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,status})});
  const j   = await res.json();
  if(!res.ok){ toast(j.error||'Error','error'); return; }
  const idx = (data.reports||[]).findIndex(r=>r.id===id);
  if(idx>=0) data.reports[idx]=j.report; else (data.reports=data.reports||[]).unshift(j.report);
  window[renderFn]();
}

function maintOpenTicketCreate(renderFn){
  const locOpts = (data.locations||[]).map(l=>`<option value="${l.id}">${esc(l.nameAr)}</option>`).join('');
  const catOpts = MAINT_CATS.map(c=>`<option value="${c}">${maintCatLabel(c)}</option>`).join('');
  const workers = (data.users||[]).filter(u=>u.role==='maintenance_worker');
  const workerOpts = `<option value="">${lang==='ar'?'— تعيين لاحقاً —':'— Assign later —'}</option>`+workers.map(w=>`<option value="${w.id}">${esc(w.name)}</option>`).join('');
  showModal('maintCreate', tr('maintTicketCreate'),
    `<div class="form-group"><label>${lang==='ar'?'الموقع':'Location'}</label><select id="mcLoc" class="form-control">${locOpts}</select></div>
     <div class="form-group"><label>${lang==='ar'?'التصنيف':'Category'}</label><select id="mcCat" class="form-control">${catOpts}</select></div>
     <div class="form-group"><label>${lang==='ar'?'العنوان':'Title'}</label><input id="mcTitle" class="form-control" placeholder="${lang==='ar'?'وصف المشكلة':'Describe the issue'}"></div>
     <div class="form-group"><label>${lang==='ar'?'الفني':'Technician'}</label><select id="mcWorker" class="form-control">${workerOpts}</select></div>`,
    async ()=>{
      const body = {
        locationId: document.getElementById('mcLoc')?.value,
        category:   document.getElementById('mcCat')?.value,
        title:      document.getElementById('mcTitle')?.value,
        assignedTo: document.getElementById('mcWorker')?.value||undefined
      };
      const res = await fetch('/api/maintenance-tickets',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
      const j   = await res.json();
      if(!res.ok){ toast(j.error||'Error','error'); return; }
      (data.tickets=data.tickets||[]).unshift(j.ticket);
      toast(lang==='ar'?'تم إنشاء الطلب':'Ticket created','ok');
      window[renderFn]();
    });
}

function maintOpenReportCreate(renderFn){
  const myTickets = (data.tickets||[]).filter(t=>t.module==='maintenance'&&t.assignedTo===me.id&&!['completed','rejected','cancelled'].includes(t.status));
  const locOpts = (data.locations||[]).map(l=>`<option value="${l.id}">${esc(l.nameAr)}</option>`).join('');
  showModal('maintReport', tr('maintReportCreate'),
    `<div class="form-group"><label>${lang==='ar'?'الموقع':'Location'}</label><select id="mrLoc" class="form-control">${locOpts}</select></div>
     <div class="form-group"><label>${lang==='ar'?'المهام المنجزة':'Completed Tasks'}</label>
       <div id="mrTasks"></div>
       <button class="btn btn-ghost btn-sm" type="button" onclick="addMaintTask()">${ic('plus',14)} ${lang==='ar'?'إضافة مهمة':'Add Task'}</button>
     </div>
     <div class="form-group"><label>${lang==='ar'?'ملاحظات':'Notes'}</label><textarea id="mrNotes" class="form-control" rows="2"></textarea></div>`,
    async ()=>{
      const tasks = [...document.querySelectorAll('.mr-task-input')].map(i=>i.value).filter(Boolean);
      const body  = { locationId: document.getElementById('mrLoc')?.value, tasks, notes: document.getElementById('mrNotes')?.value||'' };
      const res   = await fetch('/api/maintenance-reports',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
      const j     = await res.json();
      if(!res.ok){ toast(j.error||'Error','error'); return; }
      (data.reports=data.reports||[]).unshift(j.report);
      toast(lang==='ar'?'تم إرسال التقرير':'Report submitted','ok');
      window[renderFn]();
    });
}

function addMaintTask(){
  const el = document.getElementById('mrTasks');
  if(!el) return;
  const row = document.createElement('div');
  row.style.cssText='display:flex;gap:6px;margin-bottom:6px';
  row.innerHTML=`<input class="form-control mr-task-input" placeholder="${lang==='ar'?'المهمة':'Task'}"><button class="btn btn-ghost btn-sm" type="button" onclick="this.parentNode.remove()">${ic('trash',14)}</button>`;
  el.appendChild(row);
}

/* ── star rating widget for maintenance ───────────────────────── */
function maintStarWidget(reportId, ratingType, currentVal){
  return [1,2,3,4,5].map(i=>`
    <button class="star-btn${currentVal>=i?' active':''}" onclick="event.stopPropagation();setMaintRating('${reportId}','${ratingType}',${i})">★</button>
  `).join('');
}

async function setMaintRating(reportId, ratingType, value){
  const res = await fetch('/api/maintenance-reports/rate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:reportId,ratingType,value})});
  const j   = await res.json();
  if(!res.ok){ toast(j.error||'Error','error'); return; }
  const idx = (data.reports||[]).findIndex(r=>r.id===reportId);
  if(idx>=0) data.reports[idx]=j.report;
  const renderFn = me.role==='maintenance_manager'?'renderMaintenanceManager':me.role==='maintenance_supervisor'?'renderMaintenanceSupervisor':null;
  if(renderFn) window[renderFn]();
}

/* ═══════════════════════════════════════════════════════════════
   HOSPITALITY PRODUCTS / MENU MANAGEMENT — system_admin & hospitality_manager
   ═══════════════════════════════════════════════════════════════ */
const MENU_CATEGORIES = ['hot_drinks','cold_drinks','snacks','other'];

/* ── category options for the product form — sourced from
   hospMenuCategories, falling back to MENU_CATEGORIES, and always
   keeping the product's current category selectable even if disabled ── */
function menuCategoryOptions(currentSlug){
  const cats = hospMenuCategories || [];
  if(!cats.length){
    return MENU_CATEGORIES.map(c=>({v:c,l:tr('mcat_'+c)||c, sel:currentSlug===c}));
  }
  const opts = cats.filter(c=>c.isActive || c.slug===currentSlug)
    .slice().sort((a,b)=>a.sortOrder-b.sortOrder)
    .map(c=>({v:c.slug, l:categoryName(c)||tr('mcat_'+c.slug)||c.slug, sel:currentSlug===c.slug}));
  if(currentSlug && !opts.some(o=>o.v===currentSlug)){
    opts.push({v:currentSlug, l:tr('mcat_'+currentSlug)||currentSlug, sel:true});
  }
  return opts;
}

async function ensureHospMenuItems(force=false){
  if(hospMenuItems && !force) return;
  try{
    const res = await api('/hospitality/menu');
    hospMenuItems = res.items || [];
  }catch(e){ hospMenuItems = []; }
}

function rerenderProductsView(){
  if(me.role==='hospitality_manager') renderHospitalityManager();
  else render();
}

function hospitalityProductsView(){
  const items = hospMenuItems || [];
  return `
<div class="pageHeader">
  <div class="pageHeader-left">
    <div class="pageTitle">${tr('productsTitle')}</div>
  </div>
  <div class="pageHeader-actions">
    <button class="btn sm" onclick="showMenuItemFormModal()">${ic('plus',16)} ${tr('addProduct')}</button>
  </div>
</div>
${items.length ? `<div class="productGrid">${items.map(i=>adminProductCardHtml(i)).join('')}</div>`
  : `<div class="card"><div class="empty-state"><div class="empty-icon">${ic('coffee',28)}</div><div class="empty-title">${tr('noProducts')}</div></div></div>`}`;
}

function adminProductCardHtml(item){
  const name = lang==='ar' ? item.nameAr : item.nameEn;
  return `<div class="productCard productCard--admin">
    <div class="productCard-img">${item.imagePath?`<img src="${esc(item.imagePath)}" alt="${esc(name)}" loading="lazy">`:ic('coffee',28)}</div>
    <div class="productCard-body">
      <div class="productCard-title">${esc(name)}</div>
      <div class="productCard-badges">
        <span class="badge">${tr('mcat_'+item.category)||item.category}</span>
        <span class="badge ${item.isActive?'ok':'bad'}">${item.isActive?tr('productActive'):tr('productInactive')}</span>
      </div>
    </div>
    <div class="productCard-actions">
      <button class="btn secondary sm" onclick="showMenuItemFormModal('${item.id}')">${ic('edit',13)} ${tr('edit')}</button>
      <button class="btn ${item.isActive?'danger':''} sm" onclick="toggleMenuItemActive('${item.id}')">${item.isActive?tr('deactivateProduct'):tr('activateProduct')}</button>
    </div>
  </div>`;
}

function showMenuItemFormModal(id){
  const item = id ? (hospMenuItems||[]).find(i=>i.id===id) : null;
  editMenuItemId = id || null;
  editMenuItemImageData = null;
  editMenuItemImageRemoved = false;
  const titleHtml = `<div>${item?`${ic('edit',16)} ${tr('editProduct')}`:`${ic('plus',16)} ${tr('addProduct')}`}</div>`;
  const body = `
  <div class="formGrid">
    ${fc(tr('productNameAr'), inp('miNameAr',{value:item?.nameAr||''}))}
    ${fc(tr('productNameEn'), inp('miNameEn',{value:item?.nameEn||'', cls:'ltr'}))}
    ${fc(tr('productDescAr'), ta('miDescAr', item?.descriptionAr||'',{rows:2}))}
    ${fc(tr('productDescEn'), ta('miDescEn', item?.descriptionEn||'',{rows:2, cls:'ltr'}))}
    ${fc(tr('productCategory'), sel('miCategory', menuCategoryOptions(item?.category)))}
    ${fc(tr('productSortOrder'), inp('miSort',{type:'number', value:item?.sortOrder ?? 0}))}
    ${fc(tr('productImage'), `
      <div id="miImagePreview" class="productCard-img productCard-img--form">${item?.imagePath?`<img src="${esc(item.imagePath)}" alt="">`:ic('image',28)}</div>
      <input type="file" id="miImageFile" accept="image/png,image/jpeg,image/webp" onchange="onMenuItemImageSelected(event)">
      ${item?.imagePath?`<button class="btn secondary sm" type="button" style="margin-top:6px" onclick="removeMenuItemImage()">${tr('removeImage')}</button>`:''}
    `)}
    ${fc(tr('status'), sel('miActive',[{v:'true',l:tr('productActive'),sel:!item||item.isActive!==false},{v:'false',l:tr('productInactive'),sel:item&&!item.isActive}]))}
  </div>`;
  const foot = `<button class="btn" onclick="saveMenuItem()">${ic('check',16)} ${tr('saveProduct')}</button>
    <button class="btn secondary" onclick="document.getElementById('menuItemFormModal').remove()">${tr('cancel')}</button>`;
  showModal('menuItemFormModal', titleHtml, body, foot);
}

function onMenuItemImageSelected(event){
  const file = event.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = async ()=>{
    const compacted = await compactImage(reader.result, 800, .8);
    editMenuItemImageData = compacted;
    editMenuItemImageRemoved = false;
    const preview = document.getElementById('miImagePreview');
    if(preview) preview.innerHTML = `<img src="${compacted}" alt="">`;
  };
  reader.readAsDataURL(file);
}

function removeMenuItemImage(){
  editMenuItemImageData = null;
  editMenuItemImageRemoved = true;
  const preview = document.getElementById('miImagePreview');
  if(preview) preview.innerHTML = ic('image',28);
}

async function saveMenuItem(){
  const payload = {
    nameAr: document.getElementById('miNameAr').value.trim(),
    nameEn: document.getElementById('miNameEn').value.trim(),
    descriptionAr: document.getElementById('miDescAr').value.trim(),
    descriptionEn: document.getElementById('miDescEn').value.trim(),
    category: document.getElementById('miCategory').value,
    sortOrder: parseInt(document.getElementById('miSort').value, 10) || 0,
    isActive: document.getElementById('miActive').value==='true'
  };
  if(!payload.nameAr && !payload.nameEn) return toast(tr('publicNameRequired'),'bad');
  if(editMenuItemImageData) payload.image = editMenuItemImageData;
  else if(editMenuItemImageRemoved) payload.image = '';
  try{
    if(editMenuItemId) await api('/hospitality/menu/'+editMenuItemId,{method:'PUT',body:JSON.stringify(payload)});
    else await api('/hospitality/menu',{method:'POST',body:JSON.stringify(payload)});
    toast(tr('saved'),'ok');
    document.getElementById('menuItemFormModal')?.remove();
    await ensureHospMenuItems(true);
    rerenderProductsView();
  }catch(e){ toast(e.message||'Error','bad'); }
}

async function toggleMenuItemActive(id){
  const item = (hospMenuItems||[]).find(i=>i.id===id);
  if(!item) return;
  try{
    await api('/hospitality/menu/'+id,{method:'PUT',body:JSON.stringify({isActive: !item.isActive})});
    await ensureHospMenuItems(true);
    rerenderProductsView();
  }catch(e){ toast(e.message||'Error','bad'); }
}

/* ═══════════════════════════════════════════════════════════════
   HOSPITALITY MENU CATEGORIES — system_admin & hospitality_manager
   ═══════════════════════════════════════════════════════════════ */
async function ensureHospMenuCategories(force=false){
  if(hospMenuCategories && !force) return;
  try{
    const res = await api('/hospitality/menu-categories/admin');
    hospMenuCategories = res.categories || [];
  }catch(e){ hospMenuCategories = []; }
}

function rerenderCategoriesView(){
  if(me.role==='hospitality_manager') renderHospitalityManager();
  else render();
}

function categoryName(cat){ return lang==='ar' ? (cat.nameAr||cat.nameEn) : (cat.nameEn||cat.nameAr); }

function hospitalityCategoriesView(){
  const cats = (hospMenuCategories||[]).slice().sort((a,b)=>a.sortOrder-b.sortOrder);
  return `
<div class="pageHeader">
  <div class="pageHeader-left">
    <div class="pageTitle">${tr('categoriesTitle')}</div>
  </div>
  <div class="pageHeader-actions">
    <button class="btn sm" onclick="showCategoryFormModal()">${ic('plus',16)} ${tr('addCategory')}</button>
  </div>
</div>
${cats.length ? `<div class="productGrid">${cats.map(c=>categoryCardHtml(c)).join('')}</div>`
  : `<div class="card"><div class="empty-state"><div class="empty-icon">${ic('layers',28)}</div><div class="empty-title">${tr('noCategories')}</div></div></div>`}`;
}

function categoryCardHtml(cat){
  return `<div class="productCard productCard--admin">
    <div class="productCard-img">${ic('layers',28)}</div>
    <div class="productCard-body">
      <div class="productCard-title">${esc(categoryName(cat))}</div>
      <div class="productCard-desc">${esc(cat.slug)}</div>
      <div class="productCard-badges">
        <span class="badge ${cat.isActive?'ok':'bad'}">${cat.isActive?tr('categoryActive'):tr('categoryInactive')}</span>
      </div>
    </div>
    <div class="productCard-actions">
      <button class="btn secondary sm" onclick="showCategoryFormModal('${cat.id}')">${ic('edit',13)} ${tr('edit')}</button>
      <button class="btn ${cat.isActive?'danger':''} sm" onclick="toggleCategoryStatus('${cat.id}')">${cat.isActive?tr('deactivateCategory'):tr('activateCategory')}</button>
    </div>
  </div>`;
}

function showCategoryFormModal(id){
  const cat = id ? (hospMenuCategories||[]).find(c=>c.id===id) : null;
  editMenuCategoryId = id || null;
  const titleHtml = `<div>${cat?`${ic('edit',16)} ${tr('editCategory')}`:`${ic('plus',16)} ${tr('addCategory')}`}</div>`;
  const body = `
  <div class="formGrid">
    ${fc(tr('categoryNameAr'), inp('mcNameAr',{value:cat?.nameAr||''}))}
    ${fc(tr('categoryNameEn'), inp('mcNameEn',{value:cat?.nameEn||'', cls:'ltr'}))}
    ${fc(tr('categorySlug'), inp('mcSlug',{value:cat?.slug||'', cls:'ltr', placeholder:tr('categorySlugHint')}))}
    ${fc(tr('categorySortOrder'), inp('mcSort',{type:'number', value:cat?.sortOrder ?? 0}))}
    ${cat?fc(tr('status'), sel('mcActive',[{v:'true',l:tr('categoryActive'),sel:cat.isActive!==false},{v:'false',l:tr('categoryInactive'),sel:cat.isActive===false}])):''}
  </div>`;
  const foot = `<button class="btn" onclick="saveCategoryForm()">${ic('check',16)} ${tr('saveCategory')}</button>
    <button class="btn secondary" onclick="document.getElementById('categoryFormModal').remove()">${tr('cancel')}</button>`;
  showModal('categoryFormModal', titleHtml, body, foot);
}

async function saveCategoryForm(){
  const payload = {
    nameAr: document.getElementById('mcNameAr').value.trim(),
    nameEn: document.getElementById('mcNameEn').value.trim(),
    slug: document.getElementById('mcSlug').value.trim(),
    sortOrder: parseInt(document.getElementById('mcSort').value, 10) || 0
  };
  if(!payload.nameAr && !payload.nameEn) return toast(tr('publicNameRequired'),'bad');
  const activeEl = document.getElementById('mcActive');
  if(activeEl) payload.isActive = activeEl.value==='true';
  try{
    if(editMenuCategoryId) await api('/hospitality/menu-categories/'+editMenuCategoryId,{method:'PUT',body:JSON.stringify(payload)});
    else await api('/hospitality/menu-categories',{method:'POST',body:JSON.stringify(payload)});
    toast(tr('saved'),'ok');
    document.getElementById('categoryFormModal')?.remove();
    await ensureHospMenuCategories(true);
    rerenderCategoriesView();
  }catch(e){ toast(e.message||'Error','bad'); }
}

async function toggleCategoryStatus(id){
  const cat = (hospMenuCategories||[]).find(c=>c.id===id);
  if(!cat) return;
  try{
    await api('/hospitality/menu-categories/'+id+'/status',{method:'PATCH',body:JSON.stringify({isActive: !cat.isActive})});
    await ensureHospMenuCategories(true);
    rerenderCategoriesView();
  }catch(e){ toast(e.message||'Error','bad'); }
}

/* ═══════════════════════════════════════════════════════════════
   HOSPITALITY KITCHENS MANAGEMENT — system_admin & hospitality_manager
   ═══════════════════════════════════════════════════════════════ */
async function ensureHospKitchens(force=false){
  if(hospKitchens && !force) return;
  try{
    const res = await api('/hospitality/kitchens');
    hospKitchens = res.kitchens || [];
  }catch(e){ hospKitchens = []; }
}

function rerenderKitchensView(){
  if(me.role==='hospitality_manager') renderHospitalityManager();
  else render();
}

function hospitalityKitchensView(){
  const kitchens = hospKitchens || [];
  return `
<div class="pageHeader">
  <div class="pageHeader-left">
    <div class="pageTitle">${tr('kitchensTitle')}</div>
  </div>
  <div class="pageHeader-actions">
    <button class="btn sm" onclick="showKitchenFormModal()">${ic('plus',16)} ${tr('addKitchen')}</button>
  </div>
</div>
${kitchens.length ? `<div class="productGrid">${kitchens.map(k=>kitchenCardHtml(k)).join('')}</div>`
  : `<div class="card"><div class="empty-state"><div class="empty-icon">${ic('building',28)}</div><div class="empty-title">${tr('noKitchens')}</div></div></div>`}`;
}

function kitchenCardHtml(kitchen){
  const name = lang==='ar' ? kitchen.nameAr : kitchen.nameEn;
  return `<div class="productCard productCard--admin">
    <div class="productCard-img">${ic('building',28)}</div>
    <div class="productCard-body">
      <div class="productCard-title">${esc(name)}</div>
      ${kitchen.locationName?`<div class="productCard-desc">${esc(kitchen.locationName)}</div>`:''}
      <div class="productCard-badges">
        <span class="badge ${kitchen.isActive?'ok':'bad'}">${kitchen.isActive?tr('kitchenActive'):tr('kitchenInactive')}</span>
        ${kitchen.responsibleWorkerName
          ? `<span class="badge">${esc(kitchen.responsibleWorkerName)}</span>`
          : `<span class="badge bad">${tr('kitchenNoWorkerWarning')}</span>`}
      </div>
    </div>
    <div class="productCard-actions">
      <button class="btn secondary sm" onclick="showKitchenFormModal('${kitchen.id}')">${ic('edit',13)} ${tr('edit')}</button>
      <button class="btn ${kitchen.isActive?'danger':''} sm" onclick="toggleKitchenActive('${kitchen.id}')">${kitchen.isActive?tr('deactivateKitchen'):tr('activateKitchen')}</button>
    </div>
  </div>`;
}

function showKitchenFormModal(id){
  const kitchen = id ? (hospKitchens||[]).find(k=>k.id===id) : null;
  editKitchenId = id || null;
  const workers = (data.users||[]).filter(u=>(u.roles||[u.role]).includes('hospitality_worker'));
  const workerOptions = [
    {v:'', l:tr('kitchenNoWorker'), sel:!kitchen?.responsibleWorkerId},
    ...workers.map(w=>({v:w.id, l:w.name, sel:kitchen?.responsibleWorkerId===w.id}))
  ];
  const titleHtml = `<div>${kitchen?`${ic('edit',16)} ${tr('editKitchen')}`:`${ic('plus',16)} ${tr('addKitchen')}`}</div>`;
  const body = `
  <div class="formGrid">
    ${fc(tr('kitchenNameAr'), inp('kitNameAr',{value:kitchen?.nameAr||''}))}
    ${fc(tr('kitchenNameEn'), inp('kitNameEn',{value:kitchen?.nameEn||'', cls:'ltr'}))}
    ${fc(tr('kitchenLocationName'), inp('kitLocationName',{value:kitchen?.locationName||''}))}
    ${fc(tr('kitchenResponsibleWorker'), sel('kitWorker', workerOptions))}
    ${fc(tr('kitchenSortOrder'), inp('kitSort',{type:'number', value:kitchen?.sortOrder ?? 0}))}
    ${fc(tr('status'), sel('kitActive',[{v:'true',l:tr('kitchenActive'),sel:!kitchen||kitchen.isActive!==false},{v:'false',l:tr('kitchenInactive'),sel:kitchen&&!kitchen.isActive}]))}
  </div>`;
  const foot = `<button class="btn" onclick="saveKitchen()">${ic('check',16)} ${tr('saveKitchen')}</button>
    <button class="btn secondary" onclick="document.getElementById('kitchenFormModal').remove()">${tr('cancel')}</button>`;
  showModal('kitchenFormModal', titleHtml, body, foot);
}

async function saveKitchen(){
  const payload = {
    nameAr: document.getElementById('kitNameAr').value.trim(),
    nameEn: document.getElementById('kitNameEn').value.trim(),
    locationName: document.getElementById('kitLocationName').value.trim(),
    responsibleWorkerId: document.getElementById('kitWorker').value,
    sortOrder: parseInt(document.getElementById('kitSort').value, 10) || 0,
    isActive: document.getElementById('kitActive').value==='true'
  };
  if(!payload.nameAr && !payload.nameEn) return toast(tr('publicNameRequired'),'bad');
  try{
    if(editKitchenId) await api('/hospitality/kitchens/'+editKitchenId,{method:'PUT',body:JSON.stringify(payload)});
    else await api('/hospitality/kitchens',{method:'POST',body:JSON.stringify(payload)});
    toast(tr('saved'),'ok');
    document.getElementById('kitchenFormModal')?.remove();
    await ensureHospKitchens(true);
    rerenderKitchensView();
  }catch(e){ toast(e.message||'Error','bad'); }
}

async function toggleKitchenActive(id){
  const kitchen = (hospKitchens||[]).find(k=>k.id===id);
  if(!kitchen) return;
  try{
    await api('/hospitality/kitchens/'+id,{method:'PUT',body:JSON.stringify({isActive: !kitchen.isActive})});
    await ensureHospKitchens(true);
    rerenderKitchensView();
  }catch(e){ toast(e.message||'Error','bad'); }
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
    return {...w, weighted:workerWeightedScore(w)};
  }).sort((a,b)=>b.weighted-a.weighted);

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
    <span class="badge gold">${currentMonthLabel(lang)}</span>
  </div>
  <div class="recognitionPodium">
    ${scored.slice(0,3).map((w,i)=>`
      <div class="podiumCard ${i===0?'gold':i===1?'silver':'bronze'}">
        <div class="podiumCard-rank">${num(i+1)}</div>
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
              <div class="perfWorkerCell">
                <div>
                  <div class="perfWorkerName">${esc(w.name)}</div>
                  <div class="perfWorkerUser">${esc(w.username)}</div>
                </div>
              </div>
            </td>
            <td><span class="perfRowLabel">${lang==='ar'?'التقارير (30ي)':'Reports (30d)'}</span><span class="perfMetricStrong">${w.reportsLast30}</span>${w.thisMonth?` <span class="perfMetricHint">(${w.thisMonth} ${lang==='ar'?'هذا الشهر':'this mo.'})</span>`:''}</td>
            <td><span class="perfRowLabel">${tr('approvalRate')}</span>${w.approvalRate!=null?`<span class="badge ${w.approvalRate>=80?'ok':w.approvalRate>=60?'warn':'bad'}">${w.approvalRate}%</span>`:`<span class="badge">${tr('noRating')}</span>`}</td>
            <td><span class="perfRowLabel">${tr('avgQuality')}</span>${w.avgQuality?`<span class="badge gold">${w.avgQuality}%</span>`:`—`}</td>
            <td><span class="perfRowLabel">${tr('ratingBySupervisor')}</span>${rS!=null?`<div class="perfRating">${ic('star',13)} ${rS.toFixed(1)}</div>`:`<span class="perfEmpty">${tr('noRating')}</span>`}</td>
            ${canManage()?`<td><span class="perfRowLabel">${tr('ratingByManager')}</span>${rM!=null?`<div class="perfRating">${ic('star',13)} ${rM.toFixed(1)}</div>`:`<span class="perfEmpty">${tr('noRating')}</span>`}</td>`:''}
            <td><span class="perfRowLabel">${tr('openTasks')}</span><span class="badge ${w.openTickets>3?'bad':w.openTickets>1?'warn':'ok'}">${w.openTickets}</span></td>
            <td>
              <span class="perfRowLabel">${tr('workloadScore')}</span>
              <div class="perfWorkload progress-track">
                <div class="progress-fill ${w.workloadScore>80?'bad':w.workloadScore>40?'gold':'ok'}" style="width:${Math.min(100,w.workloadScore)}%"></div>
              </div>
            </td>
            <td><span class="perfRowLabel">${lang==='ar'?'النقاط':'Score'}</span><span class="perfScore ${rank===0?'top':rank<3?'high':''}">${w.weighted}</span></td>
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
  const scored = metrics.map(w=>({...w, weighted:workerWeightedScore(w)})).sort((a,b)=>b.weighted-a.weighted);
  const dir=lang==='ar'?'rtl':'ltr';
  const html=`<!DOCTYPE html><html lang="${lang}" dir="${dir}"><head><meta charset="utf-8">
<title>MRFQ — ${tr('performance')}</title>
<style>
@font-face{font-family:'IBMPlexArabic';src:url('/assets/fonts/IBMPlexSansArabic-Regular.ttf') format('truetype');font-weight:400;font-display:swap}
@font-face{font-family:'IBMPlexArabic';src:url('/assets/fonts/IBMPlexSansArabic-Bold.ttf') format('truetype');font-weight:700;font-display:swap}
*{box-sizing:border-box;margin:0;padding:0}body{font-family:'IBMPlexArabic',Arial,sans-serif;padding:24px;color:#123238;direction:${dir}}
.header{display:flex;justify-content:space-between;margin-bottom:20px;padding-bottom:14px;border-bottom:2px solid #005257}
.brand{font-family:'IBMPlexArabic',Arial,sans-serif;color:#005257;font-size:20px;font-weight:800}.meta{font-size:11px;color:#6F787F;margin-top:4px}
table{width:100%;border-collapse:collapse;font-size:12px;margin-top:16px}
th{background:#005257;color:#fff;padding:9px 10px;text-align:${lang==='ar'?'right':'left'};font-weight:700}
td{padding:8px 10px;border-bottom:1px solid #E1E9E6;vertical-align:top}
tr:nth-child(even) td{background:#F8FAF9}
.ok{color:#00A488;font-weight:700}.bad{color:#DE7559;font-weight:700}.warn{color:#E69E33;font-weight:700}
.footer{margin-top:16px;font-size:10px;color:#8A989C;text-align:center}
.pdfActions{display:flex;gap:10px;justify-content:flex-end;align-items:center;margin-bottom:18px}
.pdfBtn{border:1px solid #D8E6E2;background:#fff;color:#005257;border-radius:14px;padding:9px 16px;font:700 13px 'IBMPlexArabic',Arial,sans-serif;cursor:pointer}
.pdfBtn.primary{background:#00848D;border-color:#00848D;color:#fff}
@media print{body{padding:12px}.pdfActions{display:none!important}@page{margin:15mm}}</style></head><body>
<div class="pdfActions">
  <button class="pdfBtn" onclick="window.opener&&window.opener.focus();window.close();">${lang==='ar'?'رجوع':'Back'}</button>
  <button class="pdfBtn primary" onclick="window.print()">${lang==='ar'?'طباعة PDF':'Print PDF'}</button>
</div>
<div class="header">
  <div><div class="brand">MRFQ — ${tr('performance')}</div><div class="meta">${new Date().toISOString().slice(0,10)} · ${lang==='ar'?'آخر 30 يوم':'Last 30 days'}</div></div>
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
<div class="footer">مِرفق — MRFQ · ${new Date().toISOString().slice(0,10)}</div>
</body></html>`;
  const w=window.open('','_blank','width=900,height=700');
  w.document.write(html); w.document.close();
  w.addEventListener('load',()=>w.print());
}

/* ═══════════════════════════════════════════════════════════════
   SUPERVISOR WORKSPACE
   ═══════════════════════════════════════════════════════════════ */
function renderSupervisor(){
  setDoc();
  const allTickets = data.tickets||[];
  const submitted   = allTickets.filter(t=>t.status==='submitted');
  const waitingVerif = allTickets.filter(t=>t.status==='waiting_verification');
  const inProgress  = allTickets.filter(t=>['assigned','accepted','in_progress'].includes(t.status));
  const breached    = allTickets.filter(t=>t.slaBreached&&!['completed','rejected','cancelled'].includes(t.status));
  const pendingRpts = (data.reports||[]).filter(r=>r.approvalStatus==='pending');
  const workers     = (data.users||[]).filter(u=>(u.roles||[u.role]).includes(operationalWorkerRole()));
  const statsHtml=`
    <div class="supStats">
      ${supStat(submitted.length,    lang==='ar'?'طلبات مفتوحة':'Open Requests',    'tickets', 'bad')}
      ${supStat(waitingVerif.length, lang==='ar'?'بانتظار التحقق':'Pending Verify',  'check',   'warn')}
      ${supStat(inProgress.length,   lang==='ar'?'جارٍ التنفيذ':'In Progress',       'sync',    'brand')}
      ${supStat(pendingRpts.length,  lang==='ar'?'تقارير للمراجعة':'Reports to Review','reports', 'ok')}
    </div>`;

  const slaHtml = breached.length?`
    <div class="wCard supervisorSlaCard">
      <div class="supervisorSlaHead">
        <div class="wCard-title supervisorSlaTitle">${ic('bell',16)} ${lang==='ar'?'تنبيهات SLA':'SLA Alerts'} ${countBubble(breached.length,'bad')}</div>
        <button class="linkBtn supervisorSlaLink" onclick="supervisorView='requests';mobileNavActive='supervisor-requests';renderSupervisor()">${lang==='ar'?'عرض الكل في الطلبات':'View all in requests'}</button>
      </div>
      <div class="wCard-list supTicketList">${breached.map(t=>supTicketCard(t,'sla')).join('')}</div>
    </div>`:'';

  const slaSummaryHtml = `<div class="wCard supervisorDashboardAlert">
    <div>
      <div class="supervisorDashboardAlert-title">${ic(breached.length?'bell':'check',16)} ${lang==='ar'?'حالة SLA':'SLA status'}</div>
      <div class="supervisorDashboardAlert-sub">${breached.length
        ? (lang==='ar'?`${num(breached.length)} بلاغ يحتاج متابعة عاجلة`:`${breached.length} requests need urgent follow-up`)
        : (lang==='ar'?'لا توجد تجاوزات SLA حالياً':'No active SLA breaches')}</div>
    </div>
    <button class="btn secondary sm" onclick="supervisorView='requests';mobileNavActive='supervisor-requests';renderSupervisor()">${lang==='ar'?'الطلبات':'Requests'}</button>
  </div>`;

  const requestsHtml=`
    <div class="supSectionsGrid">
      ${slaHtml?`<div class="wCard--full">${slaHtml}</div>`:''}
      <div class="wCard">
        <div class="wCard-title">${ic('tickets',16)} ${lang==='ar'?'الطلبات المفتوحة':'Open Requests'} ${countBubble(submitted.length,'bad')}</div>
        ${submitted.length?`<div class="wCard-list supTicketList">${submitted.map(t=>supTicketCard(t,'assign',workers)).join('')}</div>`:`<div class="empty-state"><div class="empty-icon">${ic('check',24)}</div><div class="empty-title">${lang==='ar'?'لا توجد طلبات مفتوحة':'No open requests'}</div></div>`}
      </div>
      <div class="wCard">
        <div class="wCard-title">${ic('check',16)} ${lang==='ar'?'بانتظار التحقق':'Pending Verification'} ${countBubble(waitingVerif.length,'warn')}</div>
        ${waitingVerif.length?`<div class="wCard-list supTicketList">${waitingVerif.map(t=>supTicketCard(t,'verify',workers)).join('')}</div>`:`<div class="empty-state"><div class="empty-icon">${ic('check',24)}</div><div class="empty-title">${lang==='ar'?'لا يوجد ما يحتاج تحقق':'Nothing pending'}</div></div>`}
      </div>
      <div class="wCard wCard--full">
        <div class="wCard-title">${ic('sync',16)} ${lang==='ar'?'قيد التنفيذ':'Team Queue'} ${countBubble(inProgress.length)}</div>
        ${inProgress.length?`<div class="wCard-list supTicketList">${inProgress.map(t=>supTicketCard(t,'view',workers)).join('')}</div>`:`<div class="empty-state"><div class="empty-icon">${ic('sync',24)}</div><div class="empty-title">${lang==='ar'?'لا توجد طلبات قيد التنفيذ':'No requests in progress'}</div></div>`}
      </div>
    </div>`;

  const reportsHtml = reports();

  const teamHtml=`
      <div class="wCard">
        <div class="wCard-title">${ic('users',16)} ${lang==='ar'?'الفريق':'Team'} ${countBubble(workers.length)}</div>
        ${workers.length?`<div class="supTeamGrid">${workers.map(w=>{
          const wActive=allTickets.filter(t=>t.assignedTo===w.id&&!['completed','rejected','cancelled'].includes(t.status));
	          return`<div class="supTeamCard"><div class="supTeamCard-info"><div class="supTeamCard-name">${esc(w.name)}</div><div class="supTeamCard-meta">${wActive.length} ${lang==='ar'?'مهام نشطة':'active'}</div></div>${wActive.length?`<span class="badge warn">${wActive.length}</span>`:`<span class="badge ok">${lang==='ar'?'متاح':'Free'}</span>`}</div>`;
        }).join('')}</div>`:`<div class="empty-state"><div class="empty-icon">${ic('users',24)}</div><div class="empty-title">${lang==='ar'?'لا يوجد عمال':'No workers'}</div></div>`}
      </div>`;

  const dashboardHtml=`
    <div class="supervisorDashboard">
      ${statsHtml}
      ${slaSummaryHtml}
      <div class="wCard">
        <div class="wCard-title">${ic('dashboard',16)} ${lang==='ar'?'اختصارات التشغيل':'Operational shortcuts'}</div>
        <div class="quickActionGrid quickActionGrid--supervisor">
          <button class="quickAction" onclick="supervisorView='requests';mobileNavActive='supervisor-requests';renderSupervisor()"><span>${ic('tickets',18)}</span><b>${lang==='ar'?'الطلبات':'Requests'}</b><small>${num(submitted.length+waitingVerif.length+inProgress.length)}</small></button>
          <button class="quickAction" onclick="supervisorView='team';mobileNavActive='supervisor-team';renderSupervisor()"><span>${ic('users',18)}</span><b>${lang==='ar'?'الفريق':'Team'}</b><small>${num(workers.length)}</small></button>
          <button class="quickAction" onclick="supervisorView='reports';mobileNavActive='supervisor-reports';renderSupervisor()"><span>${ic('reports',18)}</span><b>${tr('reports')}</b><small>${num(pendingRpts.length)}</small></button>
        </div>
      </div>
    </div>`;

  const supContent = supervisorView==='requests'
    ? requestsHtml
    : supervisorView==='team'
      ? teamHtml
      : supervisorView==='reports'
        ? reportsHtml
        : dashboardHtml;

  app.innerHTML = fieldShell(me, supContent, {sync:true, noSticky:true});
}

function supStat(count, label, icon, color){
  return`<div class="supStatCard supStatCard--${color}">
    <div class="supStatCard-icon">${ic(icon,20)}</div>
    <div class="supStatCard-count">${count}</div>
    <div class="supStatCard-label">${label}</div>
  </div>`;
}

function supTicketCard(t, mode, workers){
  const prioClr=t.priority==='high'?'bad':t.priority==='low'?'info':'warn';
  const catLabel = tr('cat_'+(t.category||'general')) || (t.category||'general');
  const catClr = t.category==='emergency'?'bad':t.category==='spill'?'warn':t.category==='meeting_room'?'brand':'';
  const statusCls = t.status==='completed'?'ok':['reclean_required','rejected','cancelled'].includes(t.status)?'bad':t.status==='waiting_verification'?'warn':'brand';
  const requesterUser = (data.users||[]).find(u=>u.id===t.createdById);
  const requesterUsername = requesterUser?.username || '';
  const requesterEmpNo = requesterUser?.employeeNo || '';
  return`<div class="ticketCard ticketCard--operational supTicketCard">
    <div class="ticketCard-top">
      <div class="ticketCard-main">
        <div class="ticketCard-title">${esc(t.title)}</div>
        ${t.referenceNo?`<div class="ticketCard-ref">${esc(t.referenceNo)}</div>`:''}
      </div>
      <span class="badge ${statusCls}">${tr(t.status)||t.status}</span>
    </div>
    <div class="ticketCard-meta">
      <span>${ic('locations',12)} ${esc(lang==='ar'?t.locationNameAr:t.locationNameEn)}</span>
      <span>${ic('users',12)} ${esc(t.assignedToName||tr('unassigned'))}</span>
    </div>
    ${t.createdBy?`<div class="ticketCard-requester">${ic('user',12)} <span class="ticketCard-requester-label">${tr('requester')}:</span> <span class="ticketCard-requester-name">${esc(t.createdBy)}</span>${requesterUsername?`<span class="ticketCard-requester-username">@${esc(requesterUsername)}</span>`:''}${requesterEmpNo?`<span class="ticketCard-requester-empno">${esc(requesterEmpNo)}</span>`:''}</div>`:''}
    ${t.description?`<p class="ticketCard-desc">${esc(t.description)}</p>`:''}
    <div class="ticketCard-badges">
      ${t.category&&t.category!=='general'?`<span class="badge ${catClr}">${catLabel}</span>`:''}
      <span class="badge ${prioClr}">${tr(t.priority||'medium')}</span>
      <span class="badge">${fmt(t.createdAt)}</span>
      ${mode==='sla'||t.slaBreached?slaBadge(t):''}
      ${!t.assignedToName?`<span class="badge warn">${tr('supervisorQueue')}</span>`:''}
      ${t.completionTimeMins!=null?`<span class="badge ok">${ic('check',11)} ${t.completionTimeMins<60?t.completionTimeMins+tr('mins'):Math.round(t.completionTimeMins/60)+tr('hours')}</span>`:''}
    </div>
    ${mode==='assign'&&workers?`
    <div class="ticketCard-actions supTicketCard-actions">
      ${sel(`sas-${t.id}`,[{v:'',l:lang==='ar'?'اختر عامل...':'Assign to...'},...workers.map(w=>({v:w.id,l:w.name}))], {cls:'ctrl-sm'})}
      <button class="btn sm ok" onclick="supAssign('${t.id}',document.getElementById('sas-${t.id}').value)">${lang==='ar'?'تعيين':'Assign'}</button>
    </div>`:mode==='verify'?`
    <div class="ticketCard-actions supTicketCard-actions">
      <button class="btn sm ok" onclick="supVerify('${t.id}','completed')">${ic('check',14)} ${lang==='ar'?'تحقق':'Verify'}</button>
      <button class="btn sm warn" onclick="supVerify('${t.id}','reclean_required')">${ic('flip',14)} ${lang==='ar'?'إعادة تنظيف':'Reclean'}</button>
    </div>`:''}
  </div>`;
}

function supReportCard(r){
  const imgs = imgList(r);
  return`<div class="ticketCard supTicketCard">
    <div style="cursor:pointer" onclick="openReportDetail('${r.id}')">
      <div class="ticketCard-top">
        <div class="ticketCard-main">
          <div class="ticketCard-title">${esc(lang==='ar'?r.locationNameAr:r.locationNameEn)}</div>
          <div class="ticketCard-meta"><span>${ic('users',12)} ${esc(r.workerName)}</span><span>${fmt(r.createdAt)}</span></div>
        </div>
        <span class="badge ${r.status==='completed'?'ok':'brand'}">${tr(r.status)||r.status}</span>
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px">
        ${imgs.length?`<span class="badge brand">${ic('camera',10)} ${num(imgs.length)}</span>`:''}
        ${r.notes?`<span class="badge" style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(r.notes)}</span>`:''}
        <span class="badge" style="margin-inline-start:auto">${ic('arrow',11)} ${lang==='ar'?'تفاصيل':'Details'}</span>
      </div>
    </div>
    ${['cleaning_supervisor','maintenance_supervisor'].includes(me.role)?`<div class="ratingRow" style="padding:6px 0 0" onclick="event.stopPropagation()">
      <div class="ratingGroup">
        <span class="ratingLabel">${tr('ratingBySupervisor')}</span>
        ${starRatingWidget(r.id,'supervisor',r.ratingSupervisor)}
      </div>
    </div>`:''}
    <div class="ticketCard-actions supTicketCard-actions" onclick="event.stopPropagation()">
      <button class="btn sm ok" onclick="supReview('${r.id}','approved','')">${ic('check',14)} ${lang==='ar'?'اعتماد':'Approve'}</button>
      <button class="btn sm warn" onclick="supReviewPrompt('${r.id}','needs_recleaning')">${lang==='ar'?'إعادة تنظيف':'Reclean'}</button>
      <button class="btn sm danger" onclick="supReviewPrompt('${r.id}','rejected')">${lang==='ar'?'رفض':'Reject'}</button>
    </div>
  </div>`;
}

async function supAssign(ticketId, workerId){
  if(!workerId) return toast(lang==='ar'?'اختر عامل':'Select a worker','warn');
  try{
    await api(maintenanceTicketApi(`/${ticketId}`),{method:'PUT',body:JSON.stringify({assignedTo:workerId,status:'assigned'})});
    await load(); renderSupervisor();
    toast(lang==='ar'?'تم التعيين':'Assigned','ok');
  }catch(e){ toast(e.message,'bad'); }
}

async function supVerify(ticketId, status){
  try{
    await api(maintenanceTicketApi(`/${ticketId}`),{method:'PUT',body:JSON.stringify({status})});
    await load(); renderSupervisor();
    const msg = status==='completed'?(lang==='ar'?'تم التحقق':'Verified'):(lang==='ar'?'طلب إعادة تنظيف':'Reclean requested');
    toast(msg,'ok');
  }catch(e){ toast(e.message,'bad'); }
}

async function supReview(reportId, status, note){
  try{
    await api(maintenanceReportApi('/review'),{method:'POST',body:JSON.stringify({id:reportId,status,note})});
    await load(); renderSupervisor();
    toast(lang==='ar'?'تمت المراجعة':'Reviewed','ok');
  }catch(e){ toast(e.message,'bad'); }
}

function supReviewPrompt(reportId, status){
  const note = prompt(lang==='ar'?'ملاحظة (اختياري):':'Note (optional):', '');
  if(note===null) return;
  supReview(reportId, status, note);
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

/* ═══════════════════════════════════════════════════════════════
   PUBLIC HOSPITALITY ORDERING PAGE — /order/hospitality (Phase 4d)
   No login, no session — identification via name + phone only.
   Coffee-app style menu: categories, product cards, cart, checkout.
   ═══════════════════════════════════════════════════════════════ */
let publicHospStep = 'identify'; // identify | menu | checkout | sent | myorders
let publicHospName = '';
let publicHospPhone = '';
let publicHospLocation = '';
let publicHospLocations = null;
let publicHospOrders = null;
let publicHospRef = '';
let publicHospMenu = null;
let publicHospMenuCategories = null;
let publicHospCart = {}; // { menuItemId: qty }
let publicHospCategory = 'all';
let publicHospKitchens = null;
let publicHospKitchen = '';

/* ── requester info persistence (frontend-only, no session) ──── */
const HOSP_REQUESTER_KEY = 'mrfq_hosp_requester';
function loadHospRequesterInfo(){
  try{ return JSON.parse(localStorage.getItem(HOSP_REQUESTER_KEY)||'{}'); }catch(e){ return {}; }
}
function saveHospRequesterInfo(info){
  try{ localStorage.setItem(HOSP_REQUESTER_KEY, JSON.stringify({...loadHospRequesterInfo(), ...info})); }catch(e){}
}

function publicHospShell(inner, cartCount=0, wide=false, activeTab=''){
  setDoc();
  const cartBar = cartCount>0 ? `
    <div class="cartBar">
      <div class="cartBar-info">${ic('shopping-cart',18)} <span>${num(cartCount)} ${tr('itemsInCart')}</span></div>
      <button class="btn sm" onclick="publicHospGoCheckout()">${tr('checkoutBtn')}</button>
    </div>` : '';
  app.innerHTML = `
<main class="loginPage">
  <div class="fpBox${wide?' fpBox--wide':''}${activeTab?' fpBox--withNav':''}">
    <div class="fpBox-logo">
      <img src="/assets/logos/mrfq-logo-icon-dark-v4.svg" onerror="this.src='/assets/logos/mrfq-logo-icon-light-v4.svg'" alt="MRFQ">
    </div>
    <h2 class="fpBox-title">${tr('publicOrderTitle')}</h2>
    <p class="fpBox-sub">${tr('publicOrderSub')}</p>
    ${activeTab?publicHospNavTabsHtml(activeTab):''}
    ${inner}
    ${cartBar}
  </div>
  ${activeTab?publicHospNavBottomHtml(activeTab):''}
</main>`;
}

/* ── shared navigation for the public ordering page: segmented tabs
   on tablet/desktop (.fieldTabs), bottom nav on mobile (.mobileBottomNav) ── */
function publicHospNavItems(){
  const cartCount = publicHospCartCount();
  return [
    {v:'myinfo',   label:tr('publicMyInfoTab'), icon:'users'},
    {v:'menu',     label:tr('browseMenuTitle'), icon:'coffee'},
    {v:'cart',     label:tr('cartTitle'),       icon:'shopping-cart', count:cartCount},
    {v:'myorders', label:tr('myOrdersTitle'),   icon:'clipboardList'}
  ];
}

function publicHospNavTabsHtml(active){
  const items = publicHospNavItems();
  return `<div class="fieldTabs" role="tablist" style="margin-bottom:16px">
    ${items.map(i=>`<button class="fieldTab${active===i.v?' active':''}" role="tab" onclick="publicHospGoTab('${i.v}')">
      <span class="fieldTab-main"><span class="fieldTab-icon">${ic(i.icon,16)}</span><span class="fieldTab-label">${i.label}</span></span>
      ${i.count?`<span class="badge brand fieldTab-count">${num(i.count)}</span>`:''}
    </button>`).join('')}
  </div>`;
}

function publicHospNavBottomHtml(active){
  const items = publicHospNavItems();
  return `<nav class="mobileBottomNav" style="--mobile-nav-count:${items.length}" aria-label="${lang==='ar'?'تنقل':'Navigation'}">
    ${items.map(i=>`<button class="mobileBottomNav-item${active===i.v?' active':''}" onclick="publicHospGoTab('${i.v}')">
      <span class="mobileBottomNav-icon">${ic(i.icon,18)}</span>
      <span class="mobileBottomNav-label">${i.label}</span>
      ${i.count?`<span class="countBubble mobileBottomNav-badge">${num(i.count)}</span>`:''}
    </button>`).join('')}
  </nav>`;
}

async function publicHospGoTab(tab){
  if(tab==='myinfo'){ publicHospStep='identify'; return renderPublicHospitality(); }
  if(tab==='menu'){ publicHospStep='menu'; return renderPublicHospitality(); }
  if(tab==='cart'){
    await ensurePublicHospLocations();
    await ensurePublicHospKitchens();
    publicHospStep = 'checkout';
    return renderPublicHospitality();
  }
  if(tab==='myorders'){
    publicHospStep='myorders'; publicHospOrders=null;
    if(!publicHospPhone){ const s=loadHospRequesterInfo(); publicHospPhone=s.phone||''; publicHospName=s.name||''; publicHospLocation=s.locationId||''; }
    if(publicHospPhone){ renderPublicHospitality(); publicHospLookup(); return; }
    return renderPublicHospitality();
  }
}

function renderPublicHospitality(){
  if(publicHospStep==='menu') return renderPublicHospitalityMenu();
  if(publicHospStep==='checkout') return renderPublicHospitalityCheckout();
  if(publicHospStep==='sent') return renderPublicHospitalitySent();
  if(publicHospStep==='myorders') return renderPublicHospitalityMyOrders();
  return renderPublicHospitalityIdentify();
}

async function renderPublicHospitalityIdentify(){
  await ensurePublicHospLocations();
  const locOptions = [{v:'',l:tr('allLocations')}, ...(publicHospLocations||[]).map(l=>({v:l.id, l:lang==='ar'?l.nameAr:l.nameEn, sel:publicHospLocation===l.id}))];
  const body = `
    ${fc(tr('requesterNameLabel'), inp('phName',{value:publicHospName}))}
    ${fc(tr('requesterPhoneLabel'), inp('phPhone',{value:publicHospPhone, cls:'ltr', type:'tel'}))}
    ${fc(tr('locationLabel'), sel('phMyInfoLocation', locOptions))}
    <button class="btn wide" onclick="publicHospSaveInfo()">${tr('continueBtn')}</button>
  `;
  publicHospShell(body, publicHospCartCount(), false, 'myinfo');
}

async function publicHospSaveInfo(){
  const name = document.getElementById('phName').value.trim();
  const phone = document.getElementById('phPhone').value.trim();
  const locationId = document.getElementById('phMyInfoLocation').value;
  if(!name || !phone) return toast(tr('publicNameRequired'),'bad');
  publicHospName = name;
  publicHospPhone = phone;
  publicHospLocation = locationId;
  saveHospRequesterInfo({name, phone, locationId});
  toast(tr('publicInfoSaved'),'ok');
  publicHospStep = 'menu';
  renderPublicHospitality();
}

async function ensurePublicHospLocations(){
  if(publicHospLocations) return;
  try{
    const res = await api('/public/locations');
    publicHospLocations = res.locations || [];
  }catch(e){ publicHospLocations = []; }
}

async function ensurePublicHospKitchens(){
  if(publicHospKitchens) return;
  try{
    const res = await api('/public/hospitality/kitchens');
    publicHospKitchens = res.kitchens || [];
  }catch(e){ publicHospKitchens = []; }
}

async function ensurePublicHospMenu(){
  if(publicHospMenu) return;
  try{
    const res = await api('/public/hospitality/menu');
    publicHospMenu = res.items || [];
  }catch(e){ publicHospMenu = []; }
}

async function ensurePublicHospMenuCategories(){
  if(publicHospMenuCategories) return;
  try{
    const res = await api('/public/hospitality/menu-categories');
    publicHospMenuCategories = res.categories || [];
  }catch(e){ publicHospMenuCategories = []; }
}

function publicCategoryLabel(slug){
  if(slug==='all') return tr('mcat_all')||(lang==='ar'?'الكل':'All');
  const cat = (publicHospMenuCategories||[]).find(c=>c.slug===slug);
  if(cat) return categoryName(cat)||tr('mcat_'+slug)||slug;
  return tr('mcat_'+slug)||slug;
}

function menuCatIcon(c){ return c==='all' ? 'list' : 'coffee'; }

function publicHospCartCount(){
  return Object.values(publicHospCart).reduce((a,b)=>a+b,0);
}

function publicHospSetCategory(c){
  publicHospCategory = c;
  renderPublicHospitality();
}

function publicHospCartChange(id, delta){
  const cur = publicHospCart[id] || 0;
  const next = Math.max(0, Math.min(20, cur+delta));
  if(next===0) delete publicHospCart[id]; else publicHospCart[id] = next;
  renderPublicHospitality();
}

function productCardHtml(item){
  const name = lang==='ar' ? item.nameAr : item.nameEn;
  const desc = lang==='ar' ? item.descriptionAr : item.descriptionEn;
  const qty = publicHospCart[item.id] || 0;
  return `<div class="productCard">
    <div class="productCard-img">${item.imagePath?`<img src="${esc(item.imagePath)}" alt="${esc(name)}" loading="lazy">`:ic('coffee',28)}</div>
    <div class="productCard-body">
      <div class="productCard-title">${esc(name)}</div>
      ${desc?`<div class="productCard-desc">${esc(desc)}</div>`:''}
      <span class="badge">${tr('mcat_'+item.category)||item.category}</span>
    </div>
    <div class="productCard-qty">
      <button class="qtyBtn" onclick="publicHospCartChange('${item.id}',-1)" ${qty===0?'disabled':''}>${ic('minus',14)}</button>
      <span class="qtyVal">${num(qty)}</span>
      <button class="qtyBtn" onclick="publicHospCartChange('${item.id}',1)">${ic('plus',14)}</button>
    </div>
  </div>`;
}

async function renderPublicHospitalityMenu(){
  await ensurePublicHospMenu();
  await ensurePublicHospMenuCategories();
  const items = publicHospMenu || [];
  const presentSlugs = new Set(items.map(i=>i.category));
  const orderedSlugs = (publicHospMenuCategories||[])
    .filter(c=>presentSlugs.has(c.slug))
    .sort((a,b)=>a.sortOrder-b.sortOrder)
    .map(c=>c.slug);
  const extraSlugs = [...presentSlugs].filter(s=>!orderedSlugs.includes(s));
  const categories = ['all', ...orderedSlugs, ...extraSlugs];
  const filtered = publicHospCategory==='all' ? items : items.filter(i=>i.category===publicHospCategory);
  const body = `
    <div class="wCard-title" style="margin-bottom:8px">${ic('coffee',16)} ${tr('browseMenuTitle')}</div>
    <div class="hospCatChips" style="margin-bottom:14px">
      ${categories.map(c=>`<button class="hospCatChip${publicHospCategory===c?' active':''}" onclick="publicHospSetCategory('${c}')">
        <span class="empCatBtn-icon">${ic(menuCatIcon(c),14)}</span>
        <span>${esc(publicCategoryLabel(c))}</span>
      </button>`).join('')}
    </div>
    ${filtered.length ? `<div class="productGrid">${filtered.map(i=>productCardHtml(i)).join('')}</div>`
      : `<div class="empty-state"><div class="empty-icon">${ic('coffee',28)}</div><div class="empty-title">${tr('noMenuItems')}</div></div>`}
  `;
  publicHospShell(body, publicHospCartCount(), true, 'menu');
}

async function publicHospGoCheckout(){
  if(!publicHospCartCount()) return;
  await ensurePublicHospLocations();
  await ensurePublicHospKitchens();
  publicHospStep = 'checkout';
  renderPublicHospitality();
}

function renderPublicHospitalityCheckout(){
  const items = publicHospMenu || [];
  const cartEntries = Object.entries(publicHospCart)
    .map(([id,qty])=>{ const item = items.find(i=>i.id===id); return item?{item,qty}:null; })
    .filter(Boolean);
  const locOptions = (publicHospLocations||[]).map(l=>({v:l.id, l:lang==='ar'?l.nameAr:l.nameEn, sel:publicHospLocation===l.id}));
  const kitchens = publicHospKitchens || [];
  const kitchenOptions = kitchens.map(k=>({v:k.id, l:lang==='ar'?k.nameAr:k.nameEn, sel:publicHospKitchen===k.id}));
  const canSubmit = cartEntries.length>0 && kitchens.length>0;
  const body = `
    <div class="wCard-title" style="margin-bottom:8px">${ic('clipboardList',16)} ${tr('orderSummaryTitle')}</div>
    ${cartEntries.length ? `<div class="wCard-list" style="gap:8px;margin-bottom:14px">${cartEntries.map(({item,qty})=>`
      <div class="cartSummaryRow">
        <span>${esc(lang==='ar'?item.nameAr:item.nameEn)}</span>
        <span class="badge">×${num(qty)}</span>
      </div>`).join('')}</div>`
      : `<div class="empty-state"><div class="empty-icon">${ic('coffee',24)}</div><div class="empty-title">${tr('cartEmpty')}</div></div>`}
    <div class="formGrid">
      ${fc(tr('locationLabel'), sel('phLocation', locOptions.length?locOptions:[{v:'',l:tr('allLocations')}]))}
      ${fc(tr('kitchenLabel'), kitchens.length
        ? sel('phKitchen', kitchenOptions)
        : `<div class="empty-state"><div class="empty-title">${tr('noKitchensAvailable')}</div></div>`)}
      ${fc(tr('notes'), ta('phNotes','',{rows:2}))}
    </div>
    <button class="btn wide" style="margin-top:18px" onclick="publicHospSubmit()"${canSubmit?'':' disabled'}>${tr('sendOrder')}</button>
    <button class="btn secondary wide" style="margin-top:10px" onclick="publicHospStep='menu';renderPublicHospitality()">${tr('backToMenu')}</button>
  `;
  publicHospShell(body, 0, true, 'cart');
}

async function publicHospSubmit(){
  const locationId = document.getElementById('phLocation').value;
  const kitchenEl = document.getElementById('phKitchen');
  const kitchenId = kitchenEl ? kitchenEl.value : '';
  const notes = document.getElementById('phNotes').value.trim();
  if(!locationId) return toast(tr('selectLocationToOrder'),'bad');
  if(!kitchenId) return toast(tr('selectKitchenToOrder'),'bad');
  if(!publicHospName || !publicHospPhone){
    toast(tr('publicNameRequired'),'bad');
    return publicHospGoTab('myinfo');
  }
  publicHospLocation = locationId;
  saveHospRequesterInfo({locationId});
  const items = Object.entries(publicHospCart).map(([id,qty])=>{
    const item = (publicHospMenu||[]).find(i=>i.id===id);
    if(!item) return null;
    const name = lang==='ar' ? item.nameAr : item.nameEn;
    return `${name} ×${qty}`;
  }).filter(Boolean);
  if(!items.length) return toast(tr('cartEmpty'),'bad');
  try{
    const res = await api('/public/hospitality/orders',{method:'POST',body:JSON.stringify({
      requesterName: publicHospName, requesterPhone: publicHospPhone,
      locationId, kitchenId, orderType:'menu', items, notes
    })});
    publicHospRef = res.order.referenceNo;
    publicHospCart = {};
    publicHospKitchen = '';
    publicHospStep = 'sent';
    renderPublicHospitality();
  }catch(e){
    const map = {
      MISSING_FIELDS: tr('publicInvalidPhone'),
      LOCATION_NOT_FOUND: tr('publicLocationUnavailable'),
      KITCHEN_NOT_FOUND: tr('publicKitchenUnavailable'),
      TOO_MANY_ATTEMPTS: lang==='ar'?'محاولات كثيرة، حاول لاحقاً':'Too many attempts, try later'
    };
    toast(map[e.message] || tr('publicOrderErrorGeneric'),'bad');
  }
}

function renderPublicHospitalitySent(){
  const body = `
    <div class="empty-state">
      <div class="empty-icon">${ic('check',28)}</div>
      <div class="empty-title">${tr('orderSentTitle')}</div>
      <p class="empty-sub">${tr('orderSentDesc')}</p>
      ${publicHospRef?`<div class="ticketCard-ref" style="margin-top:8px">${esc(publicHospRef)}</div>`:''}
    </div>
    <button class="btn wide" style="margin-top:16px" onclick="publicHospStep='menu';renderPublicHospitality()">${tr('newRequestBtn')}</button>
  `;
  publicHospShell(body, 0, false, 'sent');
}

function renderPublicHospitalityMyOrders(){
  const body = `
    ${fc(tr('requesterPhoneLabel'), inp('phLookupPhone',{value:publicHospPhone, cls:'ltr', type:'tel'}))}
    <button class="btn wide" onclick="publicHospLookup()">${tr('searchBtn')}</button>
    <div id="phOrdersList" style="margin-top:14px">${publicHospOrders ? publicHospOrdersListHtml() : ''}</div>
  `;
  publicHospShell(body, 0, false, 'myorders');
}

function publicHospOrdersListHtml(){
  const orders = publicHospOrders||[];
  if(!orders.length) return `<div class="empty-state"><div class="empty-icon">${ic('coffee',24)}</div><div class="empty-title">${tr('noOrdersFound')}</div></div>`;
  return `<div class="wCard-list" style="gap:10px">${orders.map(o=>`
    <div class="ticketCard empOrderCard">
      <div class="ticketCard-top empOrderCard-head">
        <div class="ticketCard-main">
          <div class="ticketCard-title empOrderCard-title">${esc(tr('ot_'+o.orderType)||o.orderType)}</div>
          ${o.referenceNo?`<div class="ticketCard-ref empOrderCard-ref">${esc(o.referenceNo)}</div>`:''}
        </div>
        <span class="badge ${hospStatusBadgeClass(o.status)}">${hospStatusLabel(o.status)}</span>
      </div>
      ${(o.items&&o.items.length)?`<div class="empOrderCard-items">${ic('clipboardList',12)} ${esc(o.items.join('، '))}</div>`:''}
      <div class="ticketCard-meta empOrderCard-meta">
        <span>${ic('locations',12)} ${esc(lang==='ar'?o.locationNameAr:o.locationNameEn)}</span>
        ${(o.kitchenNameAr||o.kitchenNameEn)?`<span>${ic('coffee',12)} ${tr('orderedFromKitchen')} ${esc(lang==='ar'?o.kitchenNameAr:o.kitchenNameEn)}</span>`:''}
        <span>${ic('clock',12)} ${fmt(o.createdAt)}</span>
        ${o.updatedAt&&o.updatedAt!==o.createdAt?`<span>${ic('clock',12)} ${tr('lastUpdated')}: ${fmt(o.updatedAt)}</span>`:''}
      </div>
      ${o.notes?`<div class="empOrderCard-notes">${ic('clipboardList',12)} ${esc(o.notes)}</div>`:''}
    </div>`).join('')}</div>`;
}

async function publicHospLookup(){
  const phone = document.getElementById('phLookupPhone').value.trim();
  if(!phone) return toast(tr('publicNameRequired'),'bad');
  publicHospPhone = phone;
  try{
    const res = await api('/public/hospitality/orders?phone='+encodeURIComponent(phone));
    publicHospOrders = res.orders || [];
  }catch(e){ publicHospOrders = []; }
  renderPublicHospitality();
}

function renderWorkspaceSwitcher(){
  const roles = (me.roles||[me.role]);
  if(roles.length<=1) return;
  if(document.getElementById('wsModal')){document.getElementById('wsModal').remove();return;}
  const wsIcon = r => r==='system_admin'?'shield':r.includes('manager')||r==='facility_manager'?'building':r==='cleaner'?'check':'assignments';
  const body = `<div class="wsGrid">
    ${roles.map(r=>`<button class="wsBtn${r===me.role?' active':''}" onclick="document.getElementById('wsModal').remove();switchWorkspace('${r}')">
      <div class="wsBtn-icon">${ic(wsIcon(r),20)}</div>
      <div class="wsBtn-label">${roleLabel(r)}</div>
    </button>`).join('')}
  </div>`;
  showModal('wsModal', tr('switchWorkspace'), body, null, {narrow:true});
}

/* ─── INIT ───────────────────────────────────────────────────── */
// Standalone public hospitality request page — no login/session required
if(location.pathname.startsWith('/order/hospitality')){
  const savedHospInfo = loadHospRequesterInfo();
  publicHospName = savedHospInfo.name || '';
  publicHospPhone = savedHospInfo.phone || '';
  publicHospLocation = savedHospInfo.locationId || '';
  renderPublicHospitality();
} else {

// Preserve ?loc= param from QR scans across login
(function(){
  try{
    const u = new URL(location.href);
    const loc = u.searchParams.get('loc') || u.searchParams.get('location') || u.searchParams.get('code');
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
    if(queued && me && (me.role==='cleaner'||me.role==='employee')){
      const id = parseLoc(queued);
      sessionStorage.removeItem('qr_loc');
      const facility = (data && data.locations||[]).find(l=>l.id===id);
      if(facility){
        setTimeout(()=>{
          const el = document.getElementById(me.role==='employee'?'empLocCode':'locCode');
          if(el){
            el.value = id;
            el.dispatchEvent(new Event('input',{bubbles:true}));
            if(me.role==='cleaner') startForm();
          }
        },150);
      }
    }
  }catch(e){ loginPage(); }
})();

} // end standalone public hospitality page check
