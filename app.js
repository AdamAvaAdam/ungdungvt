'use strict';
const apps = [
 {id:'BHVer1',name:'BHVer1',description:'Mở công cụ BHVer1 trong không gian làm việc.',icon:'B',tint:'#e4f2ec',ink:'#1c7863'},
 {id:'bandonhiet1',name:'Bản đồ nhiệt',description:'Truy cập công cụ bản đồ nhiệt.',icon:'◈',tint:'#fff0df',ink:'#b5792b'},
 {id:'phantichso',name:'Phân tích số',description:'Truy cập công cụ phân tích số.',icon:'↗',tint:'#e9edf9',ink:'#5866aa'},
 {id:'congno',name:'Công nợ',description:'Truy cập công cụ quản lý công nợ.',icon:'≋',tint:'#f5eaf3',ink:'#9a588d'}
].map(app=>({...app,url:`https://adamavaadam.github.io/${app.id}/`}));
const $=id=>document.getElementById(id);
const config=window.PORTAL_CONFIG||{};
const configured=/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(config.supabaseUrl||'') && /^(sb_publishable_|eyJ)/.test(config.publishableKey||'');
let token=null,expires=0,timer,frameTimer;
function lock(message=''){token=null;expires=0;clearTimeout(timer);clearTimeout(frameTimer);$('frame').removeAttribute('src');$('workspace').hidden=true;$('login').hidden=false;$('auth-status').textContent=message;}
async function auth(path,options={}){
 const response=await fetch(config.supabaseUrl.replace(/\/$/,'')+'/auth/v1/'+path,{...options,headers:{apikey:config.publishableKey,'Content-Type':'application/json',...(options.headers||{})},signal:AbortSignal.timeout(15000)});
 if(!response.ok)throw new Error('auth');
 return response.status===204?null:response.json();
}
function home(){if(!token||Date.now()>=expires)return lock('Phiên đã hết hạn. Vui lòng đăng nhập lại.');clearTimeout(frameTimer);$('frame').removeAttribute('src');$('home').hidden=false;$('tool').hidden=true;$('breadcrumb').textContent='Tổng quan';document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('active',b.dataset.app==='home'));}
function openApp(app){if(!token||Date.now()>=expires)return lock('Phiên đã hết hạn. Vui lòng đăng nhập lại.');clearTimeout(frameTimer);$('home').hidden=true;$('tool').hidden=false;$('tool-title').textContent=app.name;$('breadcrumb').textContent=app.name;$('external').href=app.url;$('frame').title=app.name;$('frame-status').textContent='Đang mở ứng dụng… Nếu khung trống hoặc báo lỗi, dùng “Mở tab mới”.';$('frame').src=app.url;document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('active',b.dataset.app===app.id));frameTimer=setTimeout(()=>{$('frame-status').textContent='Nếu chưa thấy nội dung hoặc ứng dụng không hoạt động trong khung, chọn “Mở tab mới”. Trình duyệt không luôn cho phép cổng xác định lỗi nhúng.';},9000);}
function menuButton(label,id,handler){const b=document.createElement('button');b.textContent=label;b.dataset.app=id;b.onclick=handler;$('menu').append(b);}
menuButton('⌂  Tổng quan','home',home);
apps.forEach(app=>{menuButton(`${app.icon}  ${app.name}`,app.id,()=>openApp(app));const card=document.createElement('article');card.className='card';card.style.setProperty('--tint',app.tint);card.style.setProperty('--ink',app.ink);card.innerHTML=`<div class="icon">${app.icon}</div><h3>${app.name}</h3><p>${app.description}</p><div class="actions"><button>Mở ứng dụng →</button><a href="${app.url}" target="_blank" rel="noopener noreferrer">Mở tab mới ↗</a></div>`;card.querySelector('button').onclick=()=>openApp(app);$('cards').append(card);});
$('submit').disabled=!configured;
if(!configured)$('auth-status').textContent='Chưa kết nối dịch vụ đăng nhập. Quản trị viên cần cấu hình Supabase theo README.';
$('login-form').addEventListener('submit',async event=>{event.preventDefault();if(!configured)return;$('submit').disabled=true;$('auth-status').textContent='Đang xác thực…';let session;try{session=await auth('token?grant_type=password',{method:'POST',body:JSON.stringify({email:$('email').value.trim(),password:$('password').value})});const user=await auth('user',{headers:{Authorization:`Bearer ${session.access_token}`}});if(user.app_metadata?.portal_role!=='admin'){await auth('logout',{method:'POST',headers:{Authorization:`Bearer ${session.access_token}`}}).catch(()=>{});throw new Error('role');}token=session.access_token;expires=Date.now()+Math.min(session.expires_in,3600)*1000;$('login').hidden=true;$('workspace').hidden=false;$('auth-status').textContent='';home();timer=setTimeout(()=>lock('Phiên đã hết hạn. Vui lòng đăng nhập lại.'),expires-Date.now());}catch(error){lock(error.message==='role'?'Tài khoản chưa được cấp quyền Admin.':'Không thể đăng nhập. Kiểm tra thông tin và kết nối, rồi thử lại.');}finally{$('password').value='';session=null;$('submit').disabled=false;}});
$('logout').onclick=async()=>{const previous=token;lock('Đã đăng xuất trên thiết bị này.');try{await auth('logout',{method:'POST',headers:{Authorization:`Bearer ${previous}`}});}catch{if(!token)$('auth-status').textContent='Đã đóng phiên tại đây; không thể xác nhận thu hồi phiên trên máy chủ.';}};
document.addEventListener('visibilitychange',()=>{if(token&&Date.now()>=expires)lock('Phiên đã hết hạn. Vui lòng đăng nhập lại.');});
