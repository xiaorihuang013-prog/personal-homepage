import { t, onLanguage, isEnglish } from "./language.js";
import * as THREE from 'three';
import { track } from './loading.js';

export function createGuestbook(scene, camera, renderer) {
  const board = new THREE.Group();
  board.position.set(2.22, 3.3, -2.93);
  board.userData.id = 'guestbook';
  const metal = new THREE.MeshStandardMaterial({color:0x555951,metalness:.55,roughness:.42});
  function box(w,h,d,material,x=0,y=0,z=0,parent=board) {
    const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);
    mesh.position.set(x,y,z);parent.add(mesh);return mesh;
  }
  const canvas=document.createElement('canvas');canvas.width=2560;canvas.height=1100;
  let texture;
  const c=canvas.getContext('2d');
  // Chinese lettering is baked into this image, independent of visitor fonts.
  const chineseBoard = new Image();
  const finishBoard = track();
  chineseBoard.onload = () => { drawBoard(); finishBoard(); };
  chineseBoard.onerror = () => { console.warn('Chinese guestbook texture could not load'); finishBoard(); };
  chineseBoard.src = `${import.meta.env.BASE_URL}textures/guestbook-zh.png`;
  function drawBoard(){c.fillStyle='#f3efe3';c.fillRect(0,0,2560,1100);
  const handwriting='"Hannotate SC", "HanziPen SC", "Chalkboard SE", sans-serif';
  c.fillStyle='#735047';
  const welcome = t('嘿，欢迎来到八日的房间！', "Hey, welcome to 8suns' room!");
  c.font=`bold 140px ${handwriting}`;
  const welcomeSize = Math.min(140, 140 * 2070 / c.measureText(welcome).width);
  c.font=`bold ${welcomeSize}px ${handwriting}`;
  c.fillText(welcome,165,450);
  c.strokeStyle='#b89564';c.lineWidth=9;c.beginPath();c.moveTo(170,535);c.quadraticCurveTo(920,505,2030,540);c.stroke();
  c.fillStyle='#735047';c.font=`92px ${handwriting}`;
  c.fillText(t('点击记号笔，为我留言。','Click the marker to leave me a note.'),165,850);
  c.strokeStyle='#735047';c.fillStyle='#735047';c.lineWidth=9;
  if (!isEnglish() && chineseBoard.complete && chineseBoard.naturalWidth) {
    c.drawImage(chineseBoard, 0, 0, canvas.width, canvas.height);
  }
  if(texture)texture.needsUpdate=true;
  }
  onLanguage(drawBoard);
  texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
  texture.anisotropy=renderer.capabilities.getMaxAnisotropy();
  box(1.5,.66,.045,metal);
  box(1.44,.60,.012,new THREE.MeshStandardMaterial({map:texture,roughness:.9}),0,0,.03);
  box(.75,.025,.16,metal,0,-.365,.07);
  const marker=new THREE.Group();marker.position.set(0,-.33,.1);marker.rotation.z=Math.PI/2;
  marker.userData.id='guestbookMarker';marker.userData.focusTarget=board;board.add(marker);
  const barrel=new THREE.Mesh(new THREE.CylinderGeometry(.023,.023,.31,24),new THREE.MeshStandardMaterial({color:0xe6e1d4,roughness:.45}));marker.add(barrel);
  const cap=new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,.075,24),new THREE.MeshStandardMaterial({color:0x242721,roughness:.5}));cap.position.y=.16;marker.add(cap);
  scene.add(board);
  let flight=null;
  const origin=marker.position.clone(),rotation=marker.quaternion.clone();
  const dialog=document.createElement('dialog');dialog.className='guestbook-dialog';
  dialog.innerHTML='<form method="dialog"><button class="guestbook-close" aria-label="关闭留言">×</button></form><h2>A note for 8suns</h2><p>留下一点想法，或简单打个招呼。</p><form id="guestbook-form"><div class="guestbook-author"><input id="guestbook-name" maxlength="40" autocomplete="nickname" required aria-label="名字"><label for="guestbook-message">的留言</label></div><textarea id="guestbook-message" maxlength="2000" required placeholder="Hi, 8suns…"></textarea><button type="submit">保存留言</button></form><p class="guestbook-status" role="status"></p><h3>之前的留言</h3><div class="guestbook-history"></div>';
  document.body.append(dialog);
  const input=dialog.querySelector('textarea'),status=dialog.querySelector('[role=status]'),history=dialog.querySelector('.guestbook-history');
  const nameInput=dialog.querySelector('#guestbook-name');
  const key='8suns-guestbook-v1';let entries=[];
  try {const stored=JSON.parse(localStorage.getItem(key)||'[]');if(Array.isArray(stored))entries=stored.filter(e=>typeof e.text==='string'&&typeof e.date==='string');input.value=localStorage.getItem(key+'-draft')||'';nameInput.value=localStorage.getItem(key+'-name')||'';}catch {status.textContent=t('无法读取本地记录，请检查浏览器存储设置。','Unable to read saved notes. Please check browser storage.');}
  function renderHistory(){
    history.replaceChildren();history.classList.toggle('is-empty',!entries.length);
    if(!entries.length){history.textContent=t('还没有留言，来写第一条吧。','No notes yet. Leave the first one.');return;}
    for(const entry of entries){
      const article=document.createElement('article'),header=document.createElement('header'),name=document.createElement('strong'),text=document.createElement('p'),date=document.createElement('time');
      name.textContent=entry.name || t('游客','Guest');text.textContent=entry.text;
      date.dateTime=entry.date;date.textContent=new Date(entry.date).toLocaleString(document.documentElement.lang,{year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'});
      header.append(name,date);article.append(header,text);history.append(article);
    }
  }
  nameInput.addEventListener('input',()=>{nameInput.setCustomValidity('');try{localStorage.setItem(key+'-name',nameInput.value);}catch{}});
  input.addEventListener('input',()=>{try{localStorage.setItem(key+'-draft',input.value);}catch{status.textContent=t('草稿未能保存，本地存储不可用。','Draft could not be saved. Local storage is unavailable.');}});
  dialog.querySelector('#guestbook-form').addEventListener('submit',event=>{event.preventDefault();const name=nameInput.value.trim();if(!name){nameInput.setCustomValidity(t('请填写名字。','Please enter your name.'));nameInput.reportValidity();return;}const text=input.value.trim();if(!text){input.setCustomValidity(t('请先写一点内容。','Please write a note first.'));input.reportValidity();return;}const next=[{name,text,date:new Date().toISOString()},...entries];try{localStorage.setItem(key,JSON.stringify(next));entries=next;input.value='';localStorage.removeItem(key+'-draft');status.textContent=t('留言已保存，谢谢你来过。','Note saved. Thanks for stopping by.');renderHistory();}catch{status.textContent=t('保存失败，内容仍在输入框中，请稍后重试。','Could not save. Your note is still here; please try again.');}});
  input.addEventListener('input',()=>input.setCustomValidity(''));
  onLanguage(()=>{
    input.placeholder=t('你好，八日…','Hi, 8suns…');
    dialog.querySelector('h2').textContent=t('留言板','Guestbook');
    dialog.querySelector('h2 + p').textContent=t('留下一点想法，或简单打个招呼。','Share a thought, or just say hello.');
    dialog.querySelector('label').textContent=t('的留言', '’s note');
    nameInput.placeholder=t('你的名字','Your name');nameInput.setAttribute('aria-label',t('你的名字','Your name'));
    dialog.querySelector('[type=submit]').textContent=t('保存留言','Save note');
    dialog.querySelector('h3').textContent=t('之前的留言','Previous notes');
    dialog.querySelector('.guestbook-close').setAttribute('aria-label',t('关闭留言','Close notes'));
    status.textContent='';renderHistory();
  });

  dialog.addEventListener('close',()=>{board.add(marker);marker.position.copy(origin);marker.quaternion.copy(rotation);flight=null;});
  return {board, start(){if(flight||dialog.open)return;scene.attach(marker);flight={start:performance.now(),position:marker.position.clone(),rotation:marker.quaternion.clone()};},update(now){if(!flight)return;const t=THREE.MathUtils.clamp((now-flight.start)/650,0,1);const ease=t*t*(3-2*t);const destination=new THREE.Vector3(0,0,-1.1).applyQuaternion(camera.quaternion).add(camera.position);marker.position.lerpVectors(flight.position,destination,ease);const q=camera.quaternion.clone().multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,0,1),-.5));marker.quaternion.slerpQuaternions(flight.rotation,q,ease);if(t===1){flight=null;renderHistory();dialog.showModal();input.focus();}}};
}
