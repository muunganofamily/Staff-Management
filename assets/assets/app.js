/* ============================================================
   MUUNGANO FAMILY CBOs — EMPLOYEE & PAYROLL PORTAL
   Shared Core: session guard, chrome (header+nav), API, helpers
   ============================================================ */

var SCRIPT_URL='https://script.google.com/macros/s/AKfycbx9zVM4oMxcjzMzmcdZiD0M6NqWk26XVbZfmiXHsDH426raWLANoa7NIXSnq0ihWc3Y/exec';
function getUrl(){return SCRIPT_URL;}

var LOGO='https://z-cdn-media.chatglm.cn/files/93ec7343-0dae-42fb-a42e-cae3b418bed3.png?auth_key=1884101537-882b2d02b2244c7183278cb5490f861f-0-4cf7e91147052bcc36b0381810fbdd56';
var allEmp=[],allPay=[],currentUser=null;
var curMonth='',curYear='2026',isLoading=false;
var MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'];
var ADMIN_PAGES=['add','payroll','export','settings'];
var PAGE_URLS={dashboard:'dashboard.html',add:'add-staff.html',list:'directory.html',payroll:'payroll.html',verify:'verify.html',idcard:'idcard.html',export:'export.html',settings:'settings.html'};

/* ---------- SESSION ---------- */
function getUser(){try{return JSON.parse(sessionStorage.getItem('muungano_user')||'null');}catch(e){return null;}}
function setUser(u){currentUser=u;sessionStorage.setItem('muungano_user',JSON.stringify(u));}

/* ---------- PAGE GUARD + CHROME (header & nav) ---------- */
function initPage(pid){
  var u=getUser();
  if(!u||!u.name){location.replace('index.html');return false;}
  if(ADMIN_PAGES.indexOf(pid)>-1&&u.role!=='Admin'){location.replace('dashboard.html');return false;}
  currentUser=u;
  chrome(pid);
  document.getElementById('hdrUser').textContent=u.name;
  document.body.classList.toggle('is-staff',u.role==='Staff');
  return true;
}
function chrome(pid){
  var links=[
    ['dashboard','Dashboard','fa-home','Home'],
    ['add','Add Staff','fa-user-plus','Add'],
    ['list','Directory','fa-users','Staff'],
    ['payroll','Payroll','fa-money-bill-wave','Payroll'],
    ['verify','Verify','fa-shield-alt','Verify'],
    ['idcard','ID Card','fa-id-card','ID Card'],
    ['export','Export','fa-file-export','Export'],
    ['settings','Settings','fa-cog','Settings']
  ];
  var desk='',btm='';
  links.forEach(function(l){
    var adm=(ADMIN_PAGES.indexOf(l[0])>-1)?' admin-only':'';
    desk+='<a data-p="'+l[0]+'" class="'+(pid===l[0]?'active':'')+adm+'" onclick="go(\''+l[0]+'\')">'+l[1]+'</a>';
    btm+='<a class="bn '+(pid===l[0]?'active':'')+adm+'" data-p="'+l[0]+'" onclick="go(\''+l[0]+'\')"><i class="fas '+l[2]+'"></i><span>'+l[3]+'</span></a>';
  });
  document.getElementById('chrome').innerHTML=
    '<header id="hdr"><div class="hdr-l"><img src="'+LOGO+'" alt=""><div><h1>MUUNGANO FAMILY CBOs</h1><small>EMPLOYEE &amp; PAYROLL PORTAL</small></div></div>'+
    '<div class="hdr-r"><span class="hdr-badge" id="hdrC"><i class="fas fa-database" style="margin-right:3px"></i>0</span>'+
    '<span class="hdr-user" id="hdrUser"></span>'+
    '<button class="hdr-btn" onclick="doLogout()" title="Sign Out"><i class="fas fa-sign-out-alt"></i></button></div></header>'+
    '<nav id="deskNav">'+desk+'</nav>'+
    '<nav id="btmNav">'+btm+'</nav>';
}
function go(p){location.href=PAGE_URLS[p]||'dashboard.html';}
function doLogout(){sessionStorage.removeItem('muungano_user');location.replace('index.html');}

/* ---------- API ---------- */
function apiGet(a){return fetch(getUrl()+'?action='+a).then(function(r){return r.json();}).then(function(d){if(d.error)throw new Error(d.error);return d;});}
function apiPost(p){return fetch(getUrl(),{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(p)}).then(function(r){return r.json();}).then(function(d){if(d.error)throw new Error(d.error);return d;});}
function showL(s){var l=document.getElementById('loader');if(l)l.classList.toggle('show',s);}
function loadEmps(){return apiGet('readAll').then(function(d){allEmp=d.data||[];var c=document.getElementById('hdrC');if(c)c.innerHTML='<i class="fas fa-database" style="margin-right:3px"></i>'+allEmp.length;return allEmp;});}
function loadPayData(){return apiGet('readPayroll&month='+encodeURIComponent(curMonth)+'&year='+curYear).then(function(d){allPay=d.data||[];return allPay;});}

/* ---------- SHARED HELPERS ---------- */
function gv(id){var el=document.getElementById(id);return el?el.value:'';}
function sv(id,v){var el=document.getElementById(id);if(el)el.value=(v==null?'':v);}
function esc(s){return (s==null?'':String(s)).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function stCls(s){return 'bg bg-'+String(s||'').toLowerCase();}
function money(n){return 'KES '+Number(n||0).toLocaleString();}
function initials(n){return (n||'?').split(/\s+/).map(function(w){return w[0]||'';}).join('').slice(0,2).toUpperCase();}
function uid(s){return String(s).replace(/[^A-Za-z0-9_-]/g,'_');}
function toast(m,t){t=t||'info';var ic={ok:'fa-check-circle',err:'fa-times-circle',warn:'fa-exclamation-triangle',info:'fa-info-circle'};
  var el=document.createElement('div');el.className='toast toast-'+t;
  el.innerHTML='<i class="fas '+(ic[t]||ic.info)+'"></i><span>'+esc(m)+'</span>';
  document.getElementById('toasts').appendChild(el);setTimeout(function(){el.remove();},3200);}
function openMo(id){document.getElementById(id).classList.add('show');}
function closeMo(id){document.getElementById(id).classList.remove('show');}
document.addEventListener('click',function(e){if(e.target.classList&&e.target.classList.contains('mo'))e.target.classList.remove('show');});
function pageHead(icon,title,sub){return '<div class="page-head"><h2 class="fd"><i class="fas '+icon+'" style="color:var(--pk)"></i>'+esc(title)+'</h2><p>'+esc(sub)+'</p></div>';}
